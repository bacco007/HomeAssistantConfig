"""The runtime manager for Sundial.

One :class:`SundialCoordinator` per integration instance owns everything that
needs Home Assistant: the periodic adaptation pass, applying values to lights
(including the IKEA-friendly split commands), the astral/timezone work behind
the sun snapshots, and manual-override tracking with auto-reset.

The pure brightness/color math lives in :mod:`engine`; this file only feeds it
Home Assistant data and acts on the result.
"""

from __future__ import annotations

import asyncio
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from functools import partial

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_BRIGHTNESS_PCT,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_RGB_COLOR,
    ATTR_SUPPORTED_COLOR_MODES,
    ATTR_TRANSITION,
    ColorMode,
)
from homeassistant.components.light import (
    DOMAIN as LIGHT_DOMAIN,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ENTITY_ID,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
    STATE_OFF,
    STATE_ON,
    SUN_EVENT_SUNRISE,
    SUN_EVENT_SUNSET,
)
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.sun import get_astral_event_date
import homeassistant.util.dt as dt_util

from . import engine
from .const import (
    CONF_LIGHTS,
    DOMAIN,
    HOURS_PER_DAY,
    SIGNAL_CONFIG_UPDATED,
)
from .engine import DriveSignal, Target
from .models import LightConfig, Schema, SunConfig
from .store import SundialStore

# Transition (seconds) used when stepping the timeline preview, so the lights
# follow the slider quickly instead of starting a long fade each step.
PREVIEW_TRANSITION = 0.4

# Minimum gap (seconds) between the two IKEA-style split commands. Some
# (IKEA/Zigbee) lights drop the second command if it arrives too soon, so keep
# this comfortably long regardless of the stored send_split_delay.
MIN_SPLIT_DELAY = 0.35

# After we write to a light it reports its own settled state a moment later
# (often clamped/converted, with a fresh context). Ignore manual-override
# detection for the transition plus this grace, so our own writes settling — or
# mid-fade values — aren't mistaken for a manual change.
SETTLE_GRACE = 3.0

# Colour modes that accept an rgb_color (HA converts to the light's mode).
_RGB_MODES = frozenset(
    {
        ColorMode.RGB,
        ColorMode.RGBW,
        ColorMode.RGBWW,
        ColorMode.HS,
        ColorMode.XY,
    }
)


@dataclass
class LightRuntime:
    """Per-light runtime state (not persisted)."""

    manual_control: bool = False
    last_target: Target | None = None
    auto_reset_unsub: Callable[[], None] | None = None
    # Monotonic deadline until which our own write is still settling, so the
    # light's resulting state report isn't read as a manual override.
    settle_deadline: float = 0.0


class SundialCoordinator:
    """Schedules and applies adaptive lighting for one instance."""

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, store: SundialStore
    ) -> None:
        self.hass = hass
        self.entry = entry
        self.store = store

        self.enabled: bool = True

        self._lights: list[str] = self._read_lights()
        self._runtime: dict[str, LightRuntime] = {}

        self._unsub_interval: Callable[[], None] | None = None
        self._interval_seconds: int | None = None
        self._unsub_state: Callable[[], None] | None = None
        self._extra_unsubs: list[Callable[[], None]] = []

        # Serialises adaptation/preview passes so they can't interleave (the
        # IKEA split path awaits a sleep mid-light, so passes really do yield).
        self._adapt_lock = asyncio.Lock()

        # Last target sent per light while scrubbing the preview, so flat
        # sections of the curve don't re-send identical commands each step.
        self._last_preview_targets: dict[str, Target] = {}

        # Context ids of service calls we made, so we can tell our own writes
        # apart from manual changes. Bounded to avoid unbounded growth.
        self._our_contexts: deque[str] = deque(maxlen=1024)
        self._our_context_set: set[str] = set()

    # --- configuration accessors --------------------------------------------

    @property
    def data(self):
        """The live :class:`StoreData` document."""
        return self.store.data

    @property
    def settings(self):
        return self.store.data.settings

    @property
    def controlled_lights(self) -> list[str]:
        return self._lights

    def _read_lights(self) -> list[str]:
        return list(
            self.entry.options.get(CONF_LIGHTS)
            or self.entry.data.get(CONF_LIGHTS, [])
        )

    # --- lifecycle ----------------------------------------------------------

    async def async_start(self) -> None:
        """Begin scheduling and listening; perform an initial adaptation."""
        self._sync_runtime()
        self._unsub_state = async_track_state_change_event(
            self.hass, self._lights, self._handle_state_event
        )
        self._schedule_interval()
        await self.async_adapt_all()

    async def async_unload(self) -> None:
        if self._unsub_interval:
            self._unsub_interval()
            self._unsub_interval = None
        if self._unsub_state:
            self._unsub_state()
            self._unsub_state = None
        for unsub in self._extra_unsubs:
            unsub()
        self._extra_unsubs.clear()
        for rt in self._runtime.values():
            if rt.auto_reset_unsub:
                rt.auto_reset_unsub()
                rt.auto_reset_unsub = None

    def register_unsub(self, unsub: Callable[[], None] | None) -> None:
        """Track an extra teardown callback (e.g. the interceptor listener)."""
        if unsub is not None:
            self._extra_unsubs.append(unsub)

    async def async_update_lights(self) -> None:
        """Re-read the controlled lights after the config entry changed."""
        self._lights = self._read_lights()
        self._sync_runtime()
        if self._unsub_state:
            self._unsub_state()
        self._unsub_state = async_track_state_change_event(
            self.hass, self._lights, self._handle_state_event
        )
        await self.async_adapt_all()

    def _sync_runtime(self) -> None:
        for entity_id in self._lights:
            self._runtime.setdefault(entity_id, LightRuntime())
        for entity_id in list(self._runtime):
            if entity_id not in self._lights:
                rt = self._runtime.pop(entity_id)
                if rt.auto_reset_unsub:
                    rt.auto_reset_unsub()

    def _schedule_interval(self) -> None:
        # Only (re)start the timer when the interval actually changed —
        # otherwise every debounced panel save would reset the countdown and
        # the periodic pass would never fire while editing.
        if self._unsub_interval and self._interval_seconds == self.settings.interval:
            return
        if self._unsub_interval:
            self._unsub_interval()
        self._interval_seconds = self.settings.interval
        self._unsub_interval = async_track_time_interval(
            self.hass,
            self._handle_interval,
            timedelta(seconds=self.settings.interval),
        )

    # --- switch / config hooks ----------------------------------------------

    def set_enabled(self, enabled: bool) -> None:
        self.enabled = enabled
        if enabled:
            self.hass.async_create_task(self.async_adapt_all())

    def set_active_schema(self, schema_id: str) -> None:
        if schema_id in self.data.schemas:
            self.data.active_schema_id = schema_id

    async def async_save(self) -> None:
        await self.store.async_save()

    async def async_apply_config_change(self) -> None:
        """Persist + react to a config change made through the web-ui panel."""
        self._schedule_interval()  # interval may have changed
        await self.async_save()
        async_dispatcher_send(self.hass, SIGNAL_CONFIG_UPDATED)
        await self.async_adapt_all()

    # --- adaptation ---------------------------------------------------------

    @callback
    def _handle_interval(self, _now: datetime) -> None:
        if self._adapt_lock.locked():
            return  # previous pass still running; skip this tick
        self.hass.async_create_task(self.async_adapt_all())

    async def async_adapt_all(self) -> None:
        async with self._adapt_lock:
            now = dt_util.utcnow()
            drives = self._sun_drives(self.data.active_schema.sun, now)
            for entity_id in self._lights:
                await self.async_adapt_one(entity_id, now=now, drives=drives)

    async def _adapt_one_locked(self, entity_id: str, initial: bool = False) -> None:
        """Adapt a single light under the lock (for fire-and-forget tasks)."""
        async with self._adapt_lock:
            await self.async_adapt_one(entity_id, initial=initial)

    async def async_apply(
        self,
        entity_ids: list[str] | None = None,
        turn_on: bool = False,
    ) -> None:
        """Public 'apply now' entry point used by the service/panel.

        Always forced (it overrides manual control — that's the point of an
        explicit apply). ``turn_on`` lets it light up currently-off lights (to
        their scheduled value); a scheduled 0% still leaves them off.
        """
        async with self._adapt_lock:
            for entity_id in entity_ids or self._lights:
                if entity_id in self._runtime:
                    await self.async_adapt_one(
                        entity_id, force=True, allow_turn_on=turn_on
                    )
                else:
                    await self._apply_external(entity_id, allow_turn_on=turn_on)

    async def _apply_external(self, entity_id: str, allow_turn_on: bool) -> None:
        """Apply the sun default to a light that isn't one of ours.

        Used when the apply service names a light we don't control: there's no
        per-light config, so it follows the active schema's sun (a default
        :class:`LightConfig`). No manual-override tracking is kept for it.
        """
        state = self.hass.states.get(entity_id)
        if state is None:
            return
        target = self._compute_target(entity_id, dt_util.utcnow())
        light_cfg = self.data.active_schema.light_config(entity_id)
        await self._drive_light(
            entity_id,
            light_cfg,
            target,
            state.state == STATE_ON,
            self.settings.initial_transition,
            allow_turn_on,
        )

    async def async_adapt_one(
        self,
        entity_id: str,
        force: bool = False,
        now: datetime | None = None,
        drives: list[DriveSignal] | None = None,
        initial: bool = False,
        allow_turn_on: bool = False,
    ) -> None:
        if not self.enabled:
            return
        rt = self._runtime.get(entity_id)
        if rt is None:
            return
        if rt.manual_control and not force:
            return
        state = self.hass.states.get(entity_id)
        if state is None:
            return
        if now is None:
            now = dt_util.utcnow()
        target = self._compute_target(entity_id, now, drives)
        if (
            initial
            and target.brightness_pct is not None
            and target.brightness_pct <= 0
        ):
            # The schedule says "off" but the light was just turned on by the
            # user — their intent wins. Flag it manual so the periodic pass
            # doesn't switch it off either; auto-reset (if configured) hands
            # it back to the schedule later.
            self._set_manual_control(entity_id, True)
            return
        if (
            not force
            and not initial
            and not allow_turn_on
            and rt.last_target is not None
            and target == rt.last_target
            and self._already_at_target(state, target)
        ):
            return  # nothing changed since our last write; skip the re-send
        light_cfg = self.data.active_schema.light_config(entity_id)
        # Turn-on, forced apply and preview-off snap quickly; the periodic
        # interval pass eases over the longer transition.
        transition = (
            self.settings.initial_transition
            if (force or initial)
            else self.settings.transition
        )
        if await self._drive_light(
            entity_id,
            light_cfg,
            target,
            state.state == STATE_ON,
            transition,
            allow_turn_on,
        ):
            rt.last_target = target
            rt.settle_deadline = self.hass.loop.time() + transition + SETTLE_GRACE
            self._last_preview_targets.pop(entity_id, None)

    def _compute_target(
        self,
        entity_id: str,
        now: datetime,
        drives: list[DriveSignal] | None = None,
    ) -> Target:
        schema = self.data.active_schema
        if drives is None:
            drives = self._sun_drives(schema.sun, now)
        light_cfg = schema.light_config(entity_id)
        return engine.light_target(light_cfg, schema.sun, drives, _local_hour(now))

    def _already_at_target(self, state, target: Target) -> bool:
        """Whether re-sending ``target`` would be a no-op.

        True for an off light (an unforced pass never turns lights on), or an
        on light already reporting the target's values within the
        manual-control thresholds. A light that reports none of the attributes
        we control can't be verified, so it always gets the send.
        """
        if state.state != STATE_ON:
            return True
        if target.brightness_pct is not None and target.brightness_pct <= 0:
            return False  # scheduled off, light on: the turn-off must happen
        attrs = state.attributes
        brightness = attrs.get(ATTR_BRIGHTNESS)
        color_temp = attrs.get(ATTR_COLOR_TEMP_KELVIN)
        rgb = attrs.get(ATTR_RGB_COLOR)
        if brightness is None and color_temp is None and rgb is None:
            return False
        if engine.target_changed(target, brightness, color_temp):
            return False
        if color_temp is None and rgb is not None:
            return not engine.color_is_manual(target, rgb)
        return True

    def _sun_drives(self, sun: SunConfig, now: datetime) -> list[DriveSignal]:
        """The sun's normalized drive for each of the 24 local hours of today."""
        events = self._sun_events(sun, now)
        midnight = dt_util.as_local(now).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        drives: list[DriveSignal] = []
        for hour in range(HOURS_PER_DAY):
            moment = dt_util.as_utc(midnight + timedelta(hours=hour))
            snap = engine.sun_snapshot(moment, events)
            drives.append(engine.sun_drive(moment, snap, sun))
        return drives

    # --- applying values to lights ------------------------------------------

    def _supported_modes(self, entity_id: str) -> tuple[bool, bool, bool]:
        """(supports_brightness, supports_color_temp, supports_rgb)."""
        state = self.hass.states.get(entity_id)
        if state is None:
            return True, True, False
        modes = state.attributes.get(ATTR_SUPPORTED_COLOR_MODES)
        if not modes:
            # Capabilities not reported yet — control brightness, skip colour
            # so we don't warn on lights that don't support it.
            return True, False, False
        modes = set(modes)
        supports_color = ColorMode.COLOR_TEMP in modes
        supports_rgb = bool(modes & _RGB_MODES)
        supports_brightness = bool(
            modes - {ColorMode.ONOFF, ColorMode.UNKNOWN}
        )
        return supports_brightness, supports_color, supports_rgb

    async def _apply_light(
        self, entity_id: str, light_cfg: LightConfig, target: Target, transition: float
    ) -> None:
        supports_brightness, supports_color, supports_rgb = self._supported_modes(
            entity_id
        )
        brightness = target.brightness_pct if supports_brightness else None
        # An RGB override wins on RGB-capable lights; otherwise use the
        # colour-temperature baseline — natively if supported (and the light
        # isn't configured to render as RGB), else approximated as RGB so
        # RGB-only lights still follow the sun. The render-as-RGB preference
        # only applies when RGB is actually available, so a stray "rgb" on a
        # CT-only light can't strip its colour control.
        use_native_ct = supports_color and (
            light_cfg.render_mode != "rgb" or not supports_rgb
        )
        if target.rgb_color is not None and supports_rgb:
            color = {ATTR_RGB_COLOR: list(target.rgb_color)}
        elif target.color_temp_kelvin is not None and use_native_ct:
            color = {ATTR_COLOR_TEMP_KELVIN: target.color_temp_kelvin}
        elif target.color_temp_kelvin is not None and supports_rgb:
            color = {
                ATTR_RGB_COLOR: list(engine.kelvin_to_rgb(target.color_temp_kelvin))
            }
        else:
            color = {}
        if brightness is None and not color:
            return  # nothing this light can accept

        base = {ATTR_ENTITY_ID: entity_id, ATTR_TRANSITION: transition}
        if light_cfg.separate_turn_on_commands and brightness is not None and color:
            # IKEA-style: brightness and colour in two separate calls, always
            # with a slight gap between them.
            await self._turn_on({**base, ATTR_BRIGHTNESS_PCT: brightness})
            delay = max(self.settings.send_split_delay / 1000.0, MIN_SPLIT_DELAY)
            await asyncio.sleep(delay)
            await self._turn_on({**base, **color})
            return
        data = dict(base)
        if brightness is not None:
            data[ATTR_BRIGHTNESS_PCT] = brightness
        data.update(color)
        await self._turn_on(data)

    async def _turn_on(self, data: dict) -> None:
        context = Context()
        self._remember_context(context.id)
        await self.hass.services.async_call(
            LIGHT_DOMAIN, SERVICE_TURN_ON, data, blocking=False, context=context
        )

    async def _turn_off(self, entity_id: str, transition: float) -> None:
        context = Context()
        self._remember_context(context.id)
        await self.hass.services.async_call(
            LIGHT_DOMAIN,
            SERVICE_TURN_OFF,
            {ATTR_ENTITY_ID: entity_id, ATTR_TRANSITION: transition},
            blocking=False,
            context=context,
        )

    async def _drive_light(
        self,
        entity_id: str,
        light_cfg: LightConfig,
        target: Target,
        is_on: bool,
        transition: float,
        allow_turn_on: bool,
    ) -> bool:
        """Realise ``target`` on a light. Returns whether we acted on it.

        A scheduled 0% brightness means "off": switch the light off if it is on,
        and never switch it on for it (it won't come back automatically).
        Otherwise set the values, turning an off light on only when allowed.
        """
        if target.brightness_pct is not None and target.brightness_pct <= 0:
            if is_on:
                await self._turn_off(entity_id, transition)
                return True
            return False
        if not is_on and not allow_turn_on:
            return False  # never turn a light on just to adapt it
        await self._apply_light(entity_id, light_cfg, target, transition)
        return True

    def _remember_context(self, context_id: str) -> None:
        dq = self._our_contexts
        if len(dq) == dq.maxlen:
            self._our_context_set.discard(dq[0])
        dq.append(context_id)
        self._our_context_set.add(context_id)

    def is_our_context(self, context_id: str | None) -> bool:
        """Whether ``context_id`` belongs to one of our own service calls."""
        return context_id is not None and context_id in self._our_context_set

    # --- sun events (astral + per-sun time overrides) -----------------------

    def _sun_events(self, sun: SunConfig, now: datetime) -> list[tuple[datetime, str]]:
        """Sunrise/sunset events for yesterday/today/tomorrow as UTC datetimes."""
        events: list[tuple[datetime, str]] = []
        today = dt_util.as_local(now).date()
        for offset_days in (-1, 0, 1):
            date = today + timedelta(days=offset_days)
            sunrise = self._sun_event_at(sun, date, "sunrise")
            sunset = self._sun_event_at(sun, date, "sunset")
            if sunrise:
                events.append((sunrise, "sunrise"))
            if sunset:
                events.append((sunset, "sunset"))
        events.sort(key=lambda event: event[0])
        return events

    def _sun_event_at(self, sun: SunConfig, date, kind: str) -> datetime | None:
        is_sunrise = kind == "sunrise"
        fixed = sun.sunrise_time if is_sunrise else sun.sunset_time
        offset = sun.sunrise_offset if is_sunrise else sun.sunset_offset

        if fixed:
            event = self._combine_local(date, fixed)
        else:
            event = self._astral_event(date, is_sunrise)
            if event is None:  # polar day/night (or no location available)
                return None
        event = event + timedelta(seconds=offset)
        return self._apply_bounds(sun, kind, event)

    def _astral_event(self, date, is_sunrise: bool) -> datetime | None:
        """Sunrise/sunset for ``date``, from custom coordinates if configured,
        else Home Assistant's own location."""
        lat = self.settings.sun_latitude
        lon = self.settings.sun_longitude
        if lat is None or lon is None:
            ha_event = SUN_EVENT_SUNRISE if is_sunrise else SUN_EVENT_SUNSET
            return get_astral_event_date(self.hass, ha_event, date)
        # Astral (bundled with Home Assistant) for an arbitrary location.
        from astral import Observer
        from astral.sun import sunrise, sunset

        observer = Observer(latitude=lat, longitude=lon)
        try:
            event = (sunrise if is_sunrise else sunset)(
                observer, date, tzinfo=dt_util.UTC
            )
        except ValueError:  # polar day/night at this location
            return None
        return dt_util.as_utc(event)

    def _apply_bounds(self, sun: SunConfig, kind: str, event: datetime) -> datetime:
        if kind == "sunrise":
            lo, hi = sun.min_sunrise_time, sun.max_sunrise_time
        else:
            lo, hi = sun.min_sunset_time, sun.max_sunset_time
        local_date = dt_util.as_local(event).date()
        if lo:
            lo_dt = self._combine_local(local_date, lo)
            event = max(event, lo_dt)
        if hi:
            hi_dt = self._combine_local(local_date, hi)
            event = min(event, hi_dt)
        return event

    @staticmethod
    def _combine_local(date, time_str: str) -> datetime:
        parsed = dt_util.parse_time(time_str)
        naive = datetime.combine(date, parsed)
        local = naive.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)
        return dt_util.as_utc(local)

    # --- manual-override detection ------------------------------------------

    @callback
    def _handle_state_event(self, event: Event) -> None:
        entity_id = event.data["entity_id"]
        if entity_id not in self._runtime:
            return
        if event.context.id in self._our_context_set:
            return  # our own adaptation, ignore

        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")

        if new_state is None or new_state.state != STATE_ON:
            # Genuinely off: control reverts to us for next time it's on. An
            # `unavailable`/`unknown` blip (flaky Zigbee, reload) must not
            # silently drop a manual override.
            if new_state is not None and new_state.state == STATE_OFF:
                self._set_manual_control(entity_id, False)
            return

        was_on = old_state is not None and old_state.state == STATE_ON
        if not was_on:
            # Externally turned on (e.g. physical switch): adapt unless the
            # user explicitly asked for values (the interceptor flags that).
            if not self._runtime[entity_id].manual_control:
                self.hass.async_create_task(
                    self._adapt_one_locked(entity_id, initial=True)
                )
            return

        # Changed while already on by something other than us. Ignore the window
        # right after our own write, during which the light reports its settling
        # state, then only treat a meaningful divergence as a manual override.
        if self.hass.loop.time() < self._runtime[entity_id].settle_deadline:
            return
        if self.settings.take_over_control and self._is_significant_change(
            entity_id, new_state
        ):
            self._set_manual_control(entity_id, True)

    def _is_significant_change(self, entity_id: str, new_state) -> bool:
        rt = self._runtime.get(entity_id)
        last = rt.last_target if rt else None
        attrs = new_state.attributes
        brightness = attrs.get(ATTR_BRIGHTNESS)  # 0-255 or None
        color_temp = attrs.get(ATTR_COLOR_TEMP_KELVIN)  # Kelvin or None
        if engine.target_changed(last, brightness, color_temp):
            return True
        # The light reports an RGB colour with no colour temp. Treat it as a
        # manual override only when that colour clearly differs from the one we
        # applied — not when the light is merely expressing our colour as RGB.
        rgb = attrs.get(ATTR_RGB_COLOR)
        if color_temp is None and rgb is not None:
            return engine.color_is_manual(last, rgb)
        return False

    @callback
    def note_manual_turn_on(self, entity_id: str) -> None:
        """Flag a light as manually controlled (called by the interceptor)."""
        if entity_id in self._runtime and self.settings.take_over_control:
            self._set_manual_control(entity_id, True)

    @callback
    def _set_manual_control(self, entity_id: str, manual: bool) -> None:
        rt = self._runtime.get(entity_id)
        if rt is None:
            return
        changed = rt.manual_control != manual
        rt.manual_control = manual

        if rt.auto_reset_unsub:
            rt.auto_reset_unsub()
            rt.auto_reset_unsub = None

        # (Re)armed on every manual event, not only the first, so the reset
        # counts from the *last* manual change — a sliding window.
        if manual and self.settings.autoreset_control > 0:
            rt.auto_reset_unsub = async_call_later(
                self.hass,
                self.settings.autoreset_control,
                partial(self._auto_reset, entity_id),
            )

        if not changed:
            return
        if not manual:
            # Adapt the light back to schedule — but only if it's actually on
            # (this also fires when a light just turned off).
            state = self.hass.states.get(entity_id)
            if state is not None and state.state == STATE_ON:
                self.hass.async_create_task(self._adapt_one_locked(entity_id))
        async_dispatcher_send(self.hass, SIGNAL_CONFIG_UPDATED)

    @callback
    def _auto_reset(self, entity_id: str, _now: datetime) -> None:
        self._set_manual_control(entity_id, False)

    def set_manual_control(self, entity_id: str, manual: bool) -> None:
        """Public setter used by the ``sundial.set_manual_control`` service."""
        self._set_manual_control(entity_id, manual)

    def supports_rgb(self, entity_id: str) -> bool:
        """Whether the light can take an RGB colour (for the web-ui editor)."""
        return self._supported_modes(entity_id)[2]

    # --- web-ui timeline + stepping preview ---------------------------------

    def compute_timeline(self, schema: Schema) -> dict:
        """Per-hour values for the sun row and every light row of ``schema``."""
        now = dt_util.utcnow()
        drives = self._sun_drives(schema.sun, now)
        sun_vals = engine.sun_values(schema.sun, drives)
        sun = [
            {"brightness": bri, "color_temp": temp}
            for bri, temp in engine.sun_row(sun_vals)
        ]
        lights: dict[str, list[dict]] = {}
        for entity_id in self._lights:
            cfg = schema.light_config(entity_id)
            anchors = engine.light_anchors(cfg, sun_vals, drives)
            lights[entity_id] = [
                {
                    "brightness": int(round(anchors[hour][0])),
                    "color_temp": int(round(anchors[hour][1] / 5) * 5),
                    "rgb_color": (
                        list(anchors[hour][2]) if anchors[hour][2] else None
                    ),
                    "explicit": cfg.hours[hour] is not None,
                }
                for hour in range(HOURS_PER_DAY)
            ]
        return {"sun": sun, "lights": lights}

    async def async_preview(
        self, schema: Schema, hour: float, apply: bool
    ) -> dict[str, dict]:
        """Compute (and optionally apply) targets at a simulated ``hour``."""
        async with self._adapt_lock:
            drives = self._sun_drives(schema.sun, dt_util.utcnow())
            targets: dict[str, dict] = {}
            for entity_id in self._lights:
                cfg = schema.light_config(entity_id)
                target = engine.light_target(cfg, schema.sun, drives, hour)
                targets[entity_id] = {
                    "brightness_pct": target.brightness_pct,
                    "color_temp_kelvin": target.color_temp_kelvin,
                }
                if not apply or self._last_preview_targets.get(entity_id) == target:
                    continue
                state = self.hass.states.get(entity_id)
                if state is not None and state.state == STATE_ON:
                    # Short transition so scrubbing the timeline is responsive.
                    await self._apply_light(entity_id, cfg, target, PREVIEW_TRANSITION)
                    self._last_preview_targets[entity_id] = target
            return targets


def _local_hour(now: datetime) -> float:
    """Fractional local hour-of-day (0..24) for ``now``."""
    local = dt_util.as_local(now)
    return local.hour + local.minute / 60.0 + local.second / 3600.0


def get_coordinator(hass: HomeAssistant) -> SundialCoordinator | None:
    """Return the (single) coordinator instance, if set up.

    ``single_config_entry`` is enforced in the manifest, so ``hass.data`` holds
    the coordinator directly.
    """
    return hass.data.get(DOMAIN)
