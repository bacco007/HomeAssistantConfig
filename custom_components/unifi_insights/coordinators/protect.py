"""Protect coordinator for UniFi Insights - handles Protect device data."""

from __future__ import annotations

import asyncio
import contextlib
import logging
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any, Final

from homeassistant.core import callback
from homeassistant.helpers import device_registry as dr

from custom_components.unifi_insights.api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)
from custom_components.unifi_insights.const import (
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DEVICE_TYPE_DOORLOCK,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_SENSOR,
    DEVICE_TYPE_VIEWER,
    DEVICE_TYPE_VIEWPORT,
    DOMAIN,
    SCAN_INTERVAL_PROTECT,
)

from .base import UnifiBaseCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from custom_components.unifi_insights.api.network import UniFiNetworkClient
    from custom_components.unifi_insights.api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)

# Bounded auto-off for the event-derived motion/smart-detect/ring latch (see
# `_reconcile_stale_events`). Protect gives no delivery guarantee on the
# "end" frame that closes out a motion/smartDetect/ring event (a WS
# reconnect, a dropped frame, a network glitch can all lose it), and the
# `camera_motion`/`camera_*_detection` binary sensors turn ON purely from
# "start seen, end not yet seen" - so a missing "end" would otherwise latch
# them ON forever. In a home security system a permanently-ON motion sensor
# is worse than one that never fires: it destroys the signal and can trigger
# automations or wake people up endlessly.
#
# Five minutes is chosen as an order-of-magnitude safety margin: it is well
# above SCAN_INTERVAL_PROTECT (30s, so it never fires on ordinary poll
# jitter) and well above a realistic single continuous Protect motion/smart
# -detect/doorbell-ring event (typically seconds to low minutes), while
# still being short enough that a stuck sensor self-heals within single
# -digit minutes rather than staying wrong for hours. It is deliberately not
# tied to any one event type - see `_reconcile_stale_events`.
STALE_EVENT_TIMEOUT: Final = timedelta(minutes=5)

# Envelope-only keys that must never leak from the raw top-level WebSocket
# frame into a merged device/event dict - see `_pick_field` and the
# `_on_websocket_message`/`_on_websocket_event_message` docstrings for why.
_ENVELOPE_ONLY_KEYS: Final = frozenset({"type", "action", "payload", "item"})


def _pick_field(containers: list[dict[str, Any]], *keys: str) -> Any:
    """
    Return the first truthy value for any of `keys`, in container order.

    Shared by both WebSocket adapters: a real frame's identifying fields
    (modelKey/id for devices, type/id for events) may live at the top
    level, under "item", under "payload", or split across an "action"
    header - trying every plausible container/key combination instead of
    picking one and giving up avoids silently dropping every real frame if
    the guess is wrong.
    """
    for container in containers:
        for key in keys:
            value = container.get(key)
            if value:
                return value
    return None


class UnifiProtectCoordinator(UnifiBaseCoordinator):
    """
    Coordinator for UniFi Protect device data (30 second updates + WebSocket).

    Handles:
    - Cameras (with streaming support)
    - Lights
    - Sensors
    - NVR
    - Viewers
    - Chimes
    - Liveviews
    - Real-time events via WebSocket

    UNVALIDATED SCHEMA WARNING: the "events" WebSocket subscription
    (`_on_websocket_event_message` / `_handle_event_update` /
    `_process_event_for_device`) has never executed against real Protect
    traffic before this coordinator started subscribing to it. Every frame
    -shape assumption in that path (envelope shape, which key carries the
    device id, whether "smartDetectZone" or "smartDetect" is the real
    smart-detect event type) is a best-effort guess pending a real capture
    - see the inline UNVALIDATED comments at each guess. The whole path is
    written to degrade safely if a guess is wrong: it never raises into the
    WS callback, it logs an unparseable frame once at WARNING then at
    DEBUG, and it never latches a binary sensor on indefinitely (see
    `STALE_EVENT_TIMEOUT` / `_reconcile_stale_events`).
    """

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
        site_id: str = "default",
    ) -> None:
        """Initialize the Protect coordinator."""
        super().__init__(
            hass=hass,
            network_client=network_client,
            protect_client=protect_client,
            entry=entry,
            name="protect",
            update_interval=SCAN_INTERVAL_PROTECT,
        )
        # Track previous device IDs for stale device cleanup (Gold requirement)
        self._previous_protect_device_ids: dict[str, set[str]] = {
            "cameras": set(),
            "lights": set(),
            "sensors": set(),
            "nvrs": set(),
            "viewers": set(),
            "chimes": set(),
        }
        self.data: dict[str, Any] = {
            "cameras": {},
            "lights": {},
            "sensors": {},
            "nvrs": {},
            "viewers": {},
            "chimes": {},
            "doorlocks": {},
            "viewports": {},
            "liveviews": {},
            "protect_info": {},
            "events": {},
            "last_update": None,
        }

        # Site ID used for WebSocket subscriptions (ignored for LOCAL REST
        # calls, kept here for REMOTE/cloud routing - see
        # ProtectWebSocket._subscribe_path).
        self._site_id = site_id

        # Populated by async_start_websocket(); the background task handles
        # are read by __init__.py's async_unload_entry to cancel the
        # WebSocket loops on unload/reload. Two independent subscriptions -
        # "devices" (websocket_task) and "events" (events_websocket_task) -
        # run concurrently on the same ProtectWebSocket instance.
        self.websocket_task: asyncio.Task[None] | None = None
        self.events_websocket_task: asyncio.Task[None] | None = None
        self._protect_websocket: Any = (
            self.protect_client.websocket if self.protect_client else None
        )
        # Caps the "can't parse WebSocket message" warning to once per
        # stream, so a persistently wrong frame shape can't log-storm a
        # production instance; every subsequent occurrence still logs at
        # debug. Devices and events are tracked separately since they are
        # different failure classes.
        self._ws_parse_warned = False
        self._ws_event_parse_warned = False
        self._ws_event_error_warned: bool = False

        # WebSocket health signal (task 5, hardened by review finding 1):
        # there was previously no way to tell "connected and delivering"
        # from "connected but silent" from "reconnect-looping" - surfaced
        # via `websocket_health` in diagnostics.py.
        #
        # Tracked PER SUBSCRIPTION, not as one shared pair of fields: the
        # devices and events subscriptions are independent WebSocket
        # connections (see async_start_websocket), and a shared field would
        # let a chatty devices stream mask a hung/disconnected events
        # stream - exactly the "motion silently stopped working for days"
        # failure this signal exists to catch (an NVR restart where devices
        # reconnects cleanly but events hangs half-open forever, no error,
        # no close frame). See `_mark_ws_frame_received` and
        # `_on_websocket_connection_state_change`.
        self._ws_stream_health: dict[str, dict[str, Any]] = {
            "devices": {"connected": False, "last_message_at": None},
            "events": {"connected": False, "last_message_at": None},
        }
        # Top-level roll-up, recomputed by `_recompute_ws_health_rollup()`
        # on every per-stream update. `connected` is True only when BOTH
        # streams are connected (so a half-dead pair correctly reads as
        # unhealthy even without inspecting the per-stream detail);
        # `last_message_at` is the most recent frame from EITHER stream
        # (preserves the old "any wire alive" semantics as a coarse
        # liveness signal). Kept as real fields (not just derived in the
        # `websocket_health` property) so backwards-compatible attribute
        # access (`coordinator._ws_connected`) keeps working.
        self._last_ws_message: datetime | None = None
        self._ws_connected: bool = False

        # Wall-clock (HA-local, not Protect's) time each camera/light/ring
        # latch became active (event "start" seen, "end" not yet seen).
        # Deliberately independent of the event payload's own start/end
        # timestamp format (unconfirmed - see class docstring) so the
        # STALE_EVENT_TIMEOUT auto-off in `_reconcile_stale_events` never
        # depends on that guess being right. Popped as soon as a real "end"
        # arrives; see `_apply_motion_event` / `_apply_ring_event`.
        self._camera_motion_started: dict[str, datetime] = {}
        self._light_motion_started: dict[str, datetime] = {}
        self._camera_ring_started: dict[str, datetime] = {}

    async def async_start_websocket(self) -> None:
        """
        Start the real-time Protect WebSocket subscription.

        This is additive to the 30 second poll (SCAN_INTERVAL_PROTECT), which
        remains the fallback if the WebSocket is unavailable or drops - it is
        never removed by this method. Any failure here is logged and
        swallowed so a WebSocket problem never blocks integration setup or
        leaves the coordinator without its polling fallback.
        """
        if not self.protect_client or not self._protect_websocket:
            return
        if self.websocket_task is not None and not self.websocket_task.done():
            _LOGGER.debug("Protect coordinator: WebSocket already running")
            return

        try:
            host_id = await self.protect_client.get_host_id()
        except Exception as err:
            _LOGGER.warning(
                "Protect coordinator: Unable to resolve host_id for WebSocket "
                "subscription, falling back to %s polling only: %s",
                SCAN_INTERVAL_PROTECT,
                err,
            )
            return

        self.websocket_task = self.hass.async_create_background_task(
            self._protect_websocket.subscribe_with_callback(
                host_id,
                self._site_id,
                "devices",
                self._on_websocket_message,
                reconnect=True,
                on_connection_state_change=self._on_devices_connection_state_change,
            ),
            name=f"{DOMAIN}_protect_websocket",
        )
        # Second, independent subscription (task 1 - the actual fix): without
        # this, `_handle_event_update`/`_process_event_for_device` have no
        # caller anywhere, so `lastMotionStart`/`lastMotionEnd`/
        # `lastSmartDetectTypes` are never written and every motion/smart
        # -detect binary sensor is permanently OFF. Runs on the same
        # ProtectWebSocket instance as the devices subscription above -
        # `ProtectWebSocket._running` is a single shared gate, so a shared
        # `stop()` call (see async_stop_websocket) correctly ends both.
        self.events_websocket_task = self.hass.async_create_background_task(
            self._protect_websocket.subscribe_with_callback(
                host_id,
                self._site_id,
                "events",
                self._on_websocket_event_message,
                reconnect=True,
                on_connection_state_change=self._on_events_connection_state_change,
            ),
            name=f"{DOMAIN}_protect_websocket_events",
        )
        _LOGGER.debug(
            "Protect coordinator: WebSocket subscriptions started (host_id=%s, "
            "site_id=%s)",
            host_id,
            self._site_id,
        )

    async def async_stop_websocket(self) -> None:
        """
        Stop both WebSocket subscriptions and await their background tasks.

        Safe to call when the WebSocket was never started. Signals the
        `ProtectWebSocket` loop to stop reconnecting *before* cancelling the
        task, then awaits the cancellation - `cancel()` alone leaves the
        reconnect loop free to spin back up, and the loop being parked in
        `async for msg in ws` means `stop()` alone won't unblock it either;
        both are needed to avoid an orphaned WebSocket loop. `stop()` is
        called once (it flips a single flag shared by both subscriptions on
        the same ProtectWebSocket instance - see async_start_websocket) and
        applies to both the devices and events tasks, which are then each
        cancelled and awaited in turn using that same ordering.

        Registered with `entry.async_on_unload()` (covers a setup failure
        that happens after the WebSocket started but before setup
        completes) and also called directly from `async_unload_entry`'s
        normal unload path.
        """
        if self._protect_websocket:
            self._protect_websocket.stop()
        for task in (self.websocket_task, self.events_websocket_task):
            if task:
                task.cancel()
                if isinstance(task, asyncio.Task):
                    with contextlib.suppress(asyncio.CancelledError, Exception):
                        await task

    @callback
    def _on_websocket_message(self, message: dict[str, Any]) -> None:
        """
        Adapt a raw WebSocket "devices" message to `_handle_device_update`.

        Confirmed live against hardware 2026-08-12: the local-console shape is
        `{"type": "update", "item": {"id", "modelKey", ...fields}}` - the
        device delta lives under an "item" key, not at top level. `modelKey`
        and `id` are still resolved independently across every plausible
        container - "item", a "payload" key (REST-response-shaped push), and
        an "action" key (the header/payload split used by UniFi's private
        app WebSocket) - rather than picking one container and giving up.
        Picking a single container wrong would silently drop every real
        frame, which for a door sensor means a missed open/close event.

        The raw envelope (`message`) is included as a last-resort container
        so a fully flat frame (no item/payload/action wrapper) still works,
        but its own "type"/"action"/"payload"/"item" keys are stripped
        before merging - confirmed in production: without that exclusion,
        the envelope's "type": "update" (the action verb, not a device
        field) clobbered the real hardware model string (UFP-SENSE,
        USL-Entry-US, USL-Environmental-US) on any partial update frame
        that didn't re-send the unchanged "type" field, flipping it back
        and forth against the next REST poll (measured 49 times in 10
        minutes). Only `message` is filtered this way - item/payload/action
        are still merged in full, since a real device "type" field nested
        under one of those is legitimate data, not envelope noise.
        """
        self._mark_ws_frame_received("devices")

        if not isinstance(message, dict):
            self._log_unparseable_ws_message(
                "Protect coordinator: WebSocket message was not a JSON object: %r",
                message,
            )
            return

        action = message.get("action")
        payload = message.get("payload")
        item = message.get("item")
        containers = [
            c for c in (payload, action, item, message) if isinstance(c, dict)
        ]

        model_key = _pick_field(containers, "modelKey", "model_key")
        if not model_key:
            self._log_unparseable_ws_message(
                "Protect coordinator: WebSocket device message missing modelKey: %s",
                message,
            )
            return

        device_id = _pick_field(containers, "id")
        if not device_id:
            _LOGGER.debug(
                "Protect coordinator: WebSocket %s update missing device id: %s",
                model_key,
                message,
            )
            return

        # Merge every dict container into a brand-new dict (never mutating
        # `self.data` or any container in place - in-place mutation can
        # make HA listeners holding a stale reference miss the transition)
        # so fields split across payload/action (e.g. id in the header,
        # state fields in the payload) are all kept.
        device_data: dict[str, Any] = {}
        for container in reversed(containers):
            if container is message:
                device_data.update(
                    {k: v for k, v in container.items() if k not in _ENVELOPE_ONLY_KEYS}
                )
            else:
                device_data.update(container)
        device_data["id"] = device_id

        self._handle_device_update(model_key, device_data)

    def _log_unparseable_ws_message(
        self, msg: str, *args: Any, event_stream: bool = False
    ) -> None:
        """
        Log an unparseable WS message once at WARNING, then at DEBUG.

        `event_stream` selects an independent warned-once flag for the
        "events" subscription so a persistently-wrong events frame shape
        (see class docstring) doesn't share its one-time WARNING with the
        unrelated "devices" subscription, or vice versa.
        """
        warned_attr = "_ws_event_parse_warned" if event_stream else "_ws_parse_warned"
        level = logging.WARNING if not getattr(self, warned_attr) else logging.DEBUG
        _LOGGER.log(level, msg, *args)
        setattr(self, warned_attr, True)

    def _mark_ws_frame_received(self, stream: str) -> None:
        """
        Record that a WebSocket frame was just delivered on `stream` (task 5).

        Hardened by review finding 1 to be per-subscription, not shared.
        Called unconditionally at the top of both adapters, even for a
        frame that turns out to be unparseable - receiving anything at all
        is evidence that stream's wire is alive, which is exactly the
        "connected but silent" vs. "delivering" distinction
        `websocket_health` exists to answer. Only `stream`'s own entry in
        `_ws_stream_health` is touched, so a chatty devices stream can never
        make a silent events stream look alive, or vice versa.
        """
        self._ws_stream_health[stream]["last_message_at"] = datetime.now(UTC)
        self._ws_stream_health[stream]["connected"] = True
        self._recompute_ws_health_rollup()

    @callback
    def _on_devices_connection_state_change(self, connected: bool) -> None:  # noqa: FBT001
        """
        Adapt the devices subscription's connect/disconnect callback.

        See `_on_websocket_connection_state_change`; kept as its own bound
        method (rather than e.g. `functools.partial`) so it still satisfies
        `ProtectWebSocket.subscribe_with_callback`'s `Callable[[bool], None]`
        contract exactly.
        """
        self._on_websocket_connection_state_change("devices", connected=connected)

    @callback
    def _on_events_connection_state_change(self, connected: bool) -> None:  # noqa: FBT001
        """
        Adapt the events subscription's connect/disconnect callback.

        See `_on_devices_connection_state_change`.
        """
        self._on_websocket_connection_state_change("events", connected=connected)

    @callback
    def _on_websocket_connection_state_change(
        self, stream: str, *, connected: bool
    ) -> None:
        """
        Track WS connect/reconnect/disconnect transitions for `stream`.

        `stream` is "devices" or "events" - each subscription is registered
        with its own bound wrapper (`_on_devices_connection_state_change` /
        `_on_events_connection_state_change`) so this always knows which one
        transitioned, rather than the two subscriptions clobbering one
        shared flag (review finding 1: that let a devices-only reconnect
        read identically to a full recovery while the events subscription
        stayed hung).

        Drives two things: the per-stream half of the health signal
        (task 5), and stale-latch reconciliation on every (re)connect of
        EITHER stream (task 2) - a reconnect means that subscription was
        down for some stretch of time during which an "end" frame could
        have been missed entirely, so waiting for the next 30s REST poll to
        notice would leave a latched sensor ON longer than necessary.
        """
        self._ws_stream_health[stream]["connected"] = connected
        self._recompute_ws_health_rollup()
        if connected:
            self._reconcile_stale_events()

    def _recompute_ws_health_rollup(self) -> None:
        """
        Recompute the top-level `_ws_connected`/`_last_ws_message` roll-up.

        `_ws_connected` is True only when BOTH the devices and events
        streams are connected - the whole point of review finding 1 is that
        a half-dead pair (one stream healthy, one hung) must read as
        unhealthy at the top level too, not just in the per-stream detail
        that a human has to know to go look for. `_last_ws_message` stays
        the most recent frame from EITHER stream, preserving the original
        "is the wire alive at all" coarse-liveness semantics as a secondary
        signal.
        """
        streams = self._ws_stream_health.values()
        self._ws_connected = all(s["connected"] for s in streams)
        timestamps = [s["last_message_at"] for s in streams if s["last_message_at"]]
        self._last_ws_message = max(timestamps) if timestamps else None

    @property
    def websocket_health(self) -> dict[str, Any]:
        """
        Expose WS connectivity/delivery health for diagnostics.py (task 5).

        Surfaces BOTH a top-level roll-up (`connected`/`last_message_at`,
        same key names as before this fix - review finding 1 asked to
        preserve these where cheap so any existing consumer/dashboard
        keeps working) AND per-subscription detail under `devices`/`events`,
        since the top-level pair alone cannot distinguish "both streams
        healthy" from "devices healthy, events silently hung" - exactly the
        failure this signal exists to catch.
        """

        def _stream_payload(stream: dict[str, Any]) -> dict[str, Any]:
            last_message_at = stream["last_message_at"]
            return {
                "connected": stream["connected"],
                "last_message_at": (
                    last_message_at.isoformat() if last_message_at else None
                ),
            }

        return {
            "connected": self._ws_connected,
            "last_message_at": (
                self._last_ws_message.isoformat() if self._last_ws_message else None
            ),
            "devices": _stream_payload(self._ws_stream_health["devices"]),
            "events": _stream_payload(self._ws_stream_health["events"]),
        }

    @callback
    def _handle_device_update(
        self, model_key: str, device_data: dict[str, Any]
    ) -> None:
        """Handle device update from WebSocket."""
        device_id = device_data.get("id")
        if not device_id:
            return

        _LOGGER.debug(
            "Protect coordinator: WebSocket device update for %s: %s",
            model_key,
            device_id,
        )

        if model_key == DEVICE_TYPE_CAMERA:
            existing_camera = self.data["cameras"].get(device_id, {})
            merged_camera = {
                **existing_camera,
                **device_data,
            }
            self.data["cameras"][device_id] = self._normalize_camera_data(merged_camera)
        elif model_key == DEVICE_TYPE_LIGHT:
            self.data["lights"][device_id] = {
                **self.data["lights"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_SENSOR:
            self.data["sensors"][device_id] = {
                **self.data["sensors"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_NVR:
            self.data["nvrs"][device_id] = {
                **self.data["nvrs"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_VIEWER:
            self.data["viewers"][device_id] = {
                **self.data["viewers"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_CHIME:
            self.data["chimes"][device_id] = {
                **self.data["chimes"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_DOORLOCK:
            self.data["doorlocks"][device_id] = {
                **self.data["doorlocks"].get(device_id, {}),
                **device_data,
            }
        elif model_key == DEVICE_TYPE_VIEWPORT:
            self.data["viewports"][device_id] = {
                **self.data["viewports"].get(device_id, {}),
                **device_data,
            }

        # async_set_updated_data (rather than async_update_listeners) also
        # marks the last update as successful and resets the poll timer, so
        # entities relying on last_update_success don't stay unavailable
        # while WebSocket data is flowing, and the 30s poll fallback re-arms
        # from the last WebSocket message rather than firing needlessly.
        self.async_set_updated_data(self.data)

    def _normalize_camera_data(self, camera: dict[str, Any]) -> dict[str, Any]:
        """Normalize camera fields across alias and legacy payload shapes."""
        normalized = dict(camera)

        feature_flags = normalized.get("featureFlags")
        if not isinstance(feature_flags, dict):
            legacy_feature_flags = normalized.get("feature_flags")
            feature_flags = (
                legacy_feature_flags if isinstance(legacy_feature_flags, dict) else {}
            )
        normalized["featureFlags"] = feature_flags

        smart_detect_types = normalized.get("smartDetectTypes")
        if not isinstance(smart_detect_types, list):
            legacy_smart_detect_types = normalized.get("smart_detect_types")
            if isinstance(legacy_smart_detect_types, list):
                smart_detect_types = legacy_smart_detect_types
            else:
                smart_detect_types = feature_flags.get("smartDetectTypes")
                if not isinstance(smart_detect_types, list):
                    feature_flag_types = feature_flags.get("smart_detect_types")
                    smart_detect_types = (
                        feature_flag_types
                        if isinstance(feature_flag_types, list)
                        else []
                    )
        normalized["smartDetectTypes"] = smart_detect_types

        is_ptz = normalized.get("isPtz")
        if not isinstance(is_ptz, bool):
            legacy_is_ptz = normalized.get("is_ptz")
            if isinstance(legacy_is_ptz, bool):
                is_ptz = legacy_is_ptz
            else:
                is_ptz = bool(
                    normalized.get("hasPtz")
                    or feature_flags.get("hasPtz")
                    or feature_flags.get("has_ptz")
                )
        normalized["isPtz"] = is_ptz
        normalized["hasPtz"] = is_ptz

        last_smart_detect_types = normalized.get("lastSmartDetectTypes")
        if not isinstance(last_smart_detect_types, list):
            normalized["lastSmartDetectTypes"] = []

        if "lastMotion" not in normalized:
            normalized["lastMotion"] = 0
        if "lastRing" not in normalized:
            normalized["lastRing"] = 0

        return normalized

    @callback
    def _on_websocket_event_message(self, message: dict[str, Any]) -> None:
        """
        Adapt a raw WebSocket "events" message to `_handle_event_update`.

        UNVALIDATED against live traffic (see class docstring): this
        subscription has never received a real Protect "events" frame, so
        the envelope shape assumed here - mirroring the confirmed "devices"
        envelope (payload/item/action splits, see `_on_websocket_message`)
        - is a best-effort guess pending a real capture. Every extraction
        is deliberately tolerant (multiple candidate keys, never raises) so
        a wrong guess degrades to a dropped/logged frame instead of a crash
        or a wedged coordinator.

        The event's own "type" (motion/smartDetect/ring) is resolved only
        from an inner item/payload/action container when one is present -
        deliberately excluding the raw envelope `message`, whose top-level
        "type" would otherwise be the envelope action verb ("add"/
        "update"), not the Protect event type (see the identical "type"
        -clobbering fix in `_on_websocket_message`). When no inner
        container exists at all, the frame is flat and `message` itself
        holds the real fields - there is no separate envelope to strip in
        that shape, so it is used directly.
        """
        self._mark_ws_frame_received("events")

        if not isinstance(message, dict):
            self._log_unparseable_ws_message(
                "Protect coordinator: WebSocket event message was not a JSON "
                "object: %r",
                message,
                event_stream=True,
            )
            return

        payload = message.get("payload")
        item = message.get("item")
        action = message.get("action")
        containers = [c for c in (payload, item, action) if isinstance(c, dict)]
        if not containers:
            containers = [message]

        # The console reports its own faults on this stream as a frame with
        # an "error" field and no event fields, a rate-limit notice being the
        # common one. That is not a parse failure, and letting it fall through
        # to the unparseable path spends the one-time WARNING that exists to
        # surface a genuinely wrong frame shape, leaving a real problem to be
        # logged at DEBUG afterwards. Reported on its own warned-once flag.
        error: Any = _pick_field(containers, "error")
        if error:
            level: int = (
                logging.DEBUG if self._ws_event_error_warned else logging.WARNING
            )
            _LOGGER.log(
                level,
                "Protect coordinator: events stream reported an error: %s",
                message,
            )
            self._ws_event_error_warned = True
            return

        event_type = _pick_field(containers, "type", "eventType", "event_type")
        if not event_type:
            self._log_unparseable_ws_message(
                "Protect coordinator: WebSocket event message missing event type: %s",
                message,
                event_stream=True,
            )
            return

        event_id = _pick_field([*containers, message], "id")
        if not event_id:
            _LOGGER.debug(
                "Protect coordinator: WebSocket %s event missing event id: %s",
                event_type,
                message,
            )
            return

        # New dict, never mutating a container in place (same rationale as
        # _on_websocket_message).
        event_data: dict[str, Any] = {}
        for container in reversed(containers):
            event_data.update(container)
        event_data["id"] = event_id

        try:
            self._handle_event_update(event_type, event_data)
        except Exception:
            # This whole path has never executed against real traffic
            # (class docstring) - never let a wrong schema assumption take
            # down the WS reconnect loop. STALE_EVENT_TIMEOUT reconciliation
            # is the real backstop for a dropped/misparsed frame, not this
            # try/except - this only guarantees the frame doesn't crash us.
            _LOGGER.exception(
                "Protect coordinator: unexpected error processing WebSocket "
                "%s event frame; dropping it and continuing",
                event_type,
            )

    @callback
    def _handle_event_update(self, event_type: str, event_data: dict[str, Any]) -> None:
        """Handle event update from WebSocket."""
        event_id = event_data.get("id")
        if not event_id:
            return

        _LOGGER.debug(
            "Protect coordinator: WebSocket event update for %s: %s",
            event_type,
            event_id,
        )

        # Store event data
        if event_type not in self.data["events"]:
            self.data["events"][event_type] = {}

        self.data["events"][event_type][event_id] = event_data

        # UNVALIDATED (see class docstring): api/protect/models/event.py's
        # `Event` model has no generic "device" field - only camera/
        # cameraId or sensor/sensorId. "device" is checked first to keep
        # existing direct-call tests/behavior unchanged; the rest are
        # tolerated so a real frame using the model's actual field names
        # still resolves instead of `_process_event_for_device` silently
        # never being called (confirmed dead code before this fix).
        device_id = _pick_field(
            [event_data],
            "device",
            "camera",
            "cameraId",
            "camera_id",
            "sensor",
            "sensorId",
            "sensor_id",
            "deviceId",
            "device_id",
        )
        if device_id:
            self._process_event_for_device(event_type, event_data, device_id)

        self.async_update_listeners()

    def _process_event_for_device(
        self, event_type: str, event_data: dict[str, Any], device_id: str
    ) -> None:
        """Process event data and update relevant device."""
        # Check if this is a camera motion event
        if event_type == "motion" and device_id in self.data["cameras"]:
            self._apply_motion_event(
                self.data["cameras"], device_id, event_data, self._camera_motion_started
            )
            _LOGGER.info(
                "Protect coordinator: Motion event for camera %s: start=%s, end=%s",
                device_id,
                event_data.get("start"),
                event_data.get("end"),
            )

        # Check if this is a light motion event
        elif event_type == "motion" and device_id in self.data["lights"]:
            self._apply_motion_event(
                self.data["lights"], device_id, event_data, self._light_motion_started
            )

        # Check if this is a smart detection event
        elif (
            # UNVALIDATED (see class docstring): models/event.py's
            # EventType enum defines SMART_DETECT = "smartDetect", but this
            # integration's original code compared only against
            # "smartDetectZone" - unconfirmed which (or both, e.g. a
            # zone-specific sub-event vs. the general type) a real frame
            # actually sends, so both are accepted rather than guessing.
            event_type in ("smartDetectZone", "smartDetect")
            and device_id in self.data["cameras"]
        ):
            smart_detect_types = event_data.get("smartDetectTypes", [])
            if not isinstance(smart_detect_types, list):
                smart_detect_types = []
            event_start = event_data.get("start", 0)
            event_end = event_data.get("end")

            self._apply_motion_event(
                self.data["cameras"], device_id, event_data, self._camera_motion_started
            )
            self.data["cameras"][device_id]["lastSmartDetectTypes"] = smart_detect_types

            _LOGGER.info(
                "Protect coordinator: Smart detection for camera %s: %s "
                "(start=%s, end=%s)",
                device_id,
                smart_detect_types,
                event_start,
                event_end,
            )

        # Check if this is a doorbell ring event
        elif event_type == "ring" and device_id in self.data["cameras"]:
            self._apply_ring_event(self.data["cameras"], device_id, event_data)
            _LOGGER.info(
                "Protect coordinator: Doorbell ring for camera %s: start=%s, end=%s",
                device_id,
                event_data.get("start"),
                event_data.get("end"),
            )

    def _apply_motion_event(
        self,
        bucket: dict[str, Any],
        device_id: str,
        event_data: dict[str, Any],
        tracker: dict[str, datetime],
    ) -> None:
        """
        Write lastMotionStart/lastMotionEnd and track the latch for auto-off.

        Feeds the bounded auto-off in `_reconcile_stale_events` (task 2).
        Tracking uses HA's own wall clock rather than the event payload's
        start/end values, so the auto-off timeout is correct regardless of
        whatever timestamp format/units Protect actually sends (unconfirmed
        - see class docstring).
        """
        end = event_data.get("end")
        bucket[device_id]["lastMotionStart"] = event_data.get("start")
        bucket[device_id]["lastMotionEnd"] = end
        if end is None:
            tracker.setdefault(device_id, datetime.now(UTC))
        else:
            tracker.pop(device_id, None)

    def _apply_ring_event(
        self, bucket: dict[str, Any], device_id: str, event_data: dict[str, Any]
    ) -> None:
        """
        Write lastRingStart/lastRingEnd and track the latch for auto-off.

        The doorbell ring latch has the identical dropped-"end"-frame risk
        as motion once the events stream is live, so it gets the same
        safety net (see `_apply_motion_event`).
        """
        end = event_data.get("end")
        bucket[device_id]["lastRingStart"] = event_data.get("start")
        bucket[device_id]["lastRingEnd"] = end
        if end is None:
            self._camera_ring_started.setdefault(device_id, datetime.now(UTC))
        else:
            self._camera_ring_started.pop(device_id, None)

    def _reconcile_stale_events(self) -> None:
        """
        Force-expire motion/smart-detect/ring latches held open too long.

        CRITICAL safety net (task 2): `camera_motion`'s ON condition
        (`isMotionDetected OR (lastMotionStart is not None AND
        lastMotionEnd is None)`) becomes live the moment the events stream
        is wired up. Protect gives no delivery guarantee on the "end"
        frame that closes an event - a WS reconnect, a dropped frame, or a
        network glitch can lose it - and without this, a missing "end"
        would latch a motion/person/vehicle/animal/package-detection or
        doorbell-ring binary sensor ON forever. A permanently-ON motion
        sensor in a home security system is worse than one that never
        fires, so this does not trust event pairing alone: it is called
        from `_async_update_data` (every ~30s REST poll) and from
        `_on_websocket_connection_state_change` (every WS reconnect), in
        addition to the normal paired "end" event clearing the latch
        immediately in `_apply_motion_event`/`_apply_ring_event`.
        """
        now = datetime.now(UTC)
        self._expire_stale_latch(
            "cameras",
            self._camera_motion_started,
            "lastMotionEnd",
            now,
            also_clear_key="lastSmartDetectTypes",
            also_clear_value=[],
        )
        self._expire_stale_latch(
            "lights", self._light_motion_started, "lastMotionEnd", now
        )
        self._expire_stale_latch(
            "cameras", self._camera_ring_started, "lastRingEnd", now
        )

    def _expire_stale_latch(
        self,
        category: str,
        tracker: dict[str, datetime],
        end_key: str,
        now: datetime,
        *,
        also_clear_key: str | None = None,
        also_clear_value: Any = None,
    ) -> None:
        """Clear one tracked latch bucket if it has exceeded STALE_EVENT_TIMEOUT."""
        for device_id in list(tracker):
            started_at = tracker[device_id]
            if now - started_at < STALE_EVENT_TIMEOUT:
                continue
            device = self.data.get(category, {}).get(device_id)
            if isinstance(device, dict) and device.get(end_key) is None:
                _LOGGER.info(
                    "Protect coordinator: auto-clearing stale %s.%s latch for "
                    "%s after exceeding the %s safety timeout (missed 'end' "
                    "event?)",
                    category,
                    end_key,
                    device_id,
                    STALE_EVENT_TIMEOUT,
                )
                device[end_key] = now.isoformat()
                if also_clear_key is not None:
                    device[also_clear_key] = also_clear_value
            tracker.pop(device_id, None)

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch Protect data from API."""
        if not self.protect_client:
            _LOGGER.debug("Protect coordinator: No Protect client available")
            return self.data

        try:
            _LOGGER.debug("Protect coordinator: Fetching Protect data")

            # Reconcile stale event-derived latches on every periodic poll
            # (task 2) - runs against the pre-poll data below, before
            # _fetch_cameras() rebuilds the cameras dict wholesale from the
            # REST response.
            self._reconcile_stale_events()

            # Fetch cameras
            await self._fetch_cameras()

            # Fetch lights
            await self._fetch_lights()

            # Fetch sensors
            await self._fetch_sensors()

            # Fetch NVR
            await self._fetch_nvr()

            # Fetch chimes
            await self._fetch_chimes()

            # Fetch viewers
            await self._fetch_viewers()

            # Fetch liveviews
            await self._fetch_liveviews()

            self._available = True
            self.data["last_update"] = datetime.now(tz=UTC)

            # Clean up stale devices (Gold requirement)
            self._cleanup_stale_devices()

            _LOGGER.debug(
                "Protect coordinator: Update complete - "
                "%d cameras, %d lights, %d sensors, %d NVRs, "
                "%d chimes, %d viewers, %d liveviews",
                len(self.data["cameras"]),
                len(self.data["lights"]),
                len(self.data["sensors"]),
                len(self.data["nvrs"]),
                len(self.data["chimes"]),
                len(self.data["viewers"]),
                len(self.data["liveviews"]),
            )

            return self.data

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:
            self._handle_generic_error(err)

        # Should never reach here due to raises above
        return self.data  # pragma: no cover

    async def _fetch_cameras(self) -> None:
        """Fetch camera data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching cameras")
        cameras_models = await self.protect_client.cameras.get_all()
        # Rebuild the dict from the API response so cameras removed from
        # Protect disappear from coordinator data (enables stale cleanup).
        cameras: dict[str, Any] = {}
        for camera_model in cameras_models:
            camera = self._normalize_camera_data(self._model_to_dict(camera_model))
            camera_id = camera.get("id")
            if camera_id:
                cameras[camera_id] = camera

                _LOGGER.debug(
                    "Protect coordinator: Camera %s supports smart detection: %s",
                    camera.get("name", camera_id),
                    camera.get("smartDetectTypes", []),
                )
        self.data["cameras"] = cameras
        self._drop_rebuilt_latch_trackers(cameras)

    def _drop_rebuilt_latch_trackers(self, cameras: dict[str, Any]) -> None:
        """
        Pop event-derived latch trackers whose backing field vanished under them.

        `_fetch_cameras()` wholesale-replaces `self.data["cameras"]` every
        ~30s from REST models that carry no `lastMotionStart`/`lastRingStart`
        field at all - those are only ever written by a paired WebSocket
        "start" event (see `_apply_motion_event`/`_apply_ring_event`), never
        by the REST API (confirmed: api/protect/models/camera.py declares
        neither field). Without this, a still-armed tracker survives the
        rebuild pointing at a camera dict that now has no "start" (or "end")
        field either, and ~5 minutes later `_reconcile_stale_events` treats
        that as an orphaned latch and logs a false "missed 'end' event?"
        warning - even though the latch was already correctly cleared by
        this exact REST poll 4m30s earlier. This fires on virtually every
        real motion/ring event (the common "start"-only frame), flooding
        INFO logs during exactly the window someone is watching them to
        confirm a deploy worked.

        Only pops when the camera is still present but has lost the field
        entirely; a camera that vanished outright is left to the existing
        "removed device" handling in `_expire_stale_latch`.
        """
        for device_id in list(self._camera_motion_started):
            camera = cameras.get(device_id)
            if isinstance(camera, dict) and "lastMotionStart" not in camera:
                self._camera_motion_started.pop(device_id, None)

        for device_id in list(self._camera_ring_started):
            camera = cameras.get(device_id)
            if isinstance(camera, dict) and "lastRingStart" not in camera:
                self._camera_ring_started.pop(device_id, None)

    async def _fetch_lights(self) -> None:
        """Fetch light data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching lights")
        lights_models = await self.protect_client.lights.get_all()
        lights: dict[str, Any] = {}
        for light_model in lights_models:
            light = self._model_to_dict(light_model)
            light_id = light.get("id")
            if light_id:
                lights[light_id] = light
        self.data["lights"] = lights

    async def _fetch_sensors(self) -> None:
        """Fetch sensor data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching sensors")
        try:
            sensors_models = await self.protect_client.sensors.get_all()
            sensors: dict[str, Any] = {}
            for sensor_model in sensors_models:
                sensor = self._model_to_dict(sensor_model)
                sensor_id = sensor.get("id")
                if sensor_id:
                    sensors[sensor_id] = sensor
            self.data["sensors"] = sensors
            _LOGGER.debug(
                "Protect coordinator: Successfully fetched %d sensors",
                len(sensors_models),
            )
        except Exception as err:
            _LOGGER.warning("Protect coordinator: Error fetching sensors: %s", err)

    async def _fetch_nvr(self) -> None:
        """Fetch NVR data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching NVR")
        try:
            nvr_model = await self.protect_client.nvr.get()
            nvr = self._model_to_dict(nvr_model)
            if nvr:
                nvr_id = nvr.get("id")
                if nvr_id:
                    self.data["nvrs"] = {nvr_id: nvr}
                    _LOGGER.debug(
                        "Protect coordinator: Successfully fetched NVR: %s", nvr_id
                    )
        except Exception as err:
            _LOGGER.debug("Protect coordinator: Error fetching NVR: %s", err)

    async def _fetch_chimes(self) -> None:
        """Fetch chime data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching chimes")
        try:
            chimes_models = await self.protect_client.chimes.get_all()
            chimes: dict[str, Any] = {}
            for chime_model in chimes_models:
                chime = self._model_to_dict(chime_model)
                chime_id = chime.get("id")
                if chime_id:
                    chimes[chime_id] = chime
            self.data["chimes"] = chimes
            _LOGGER.debug(
                "Protect coordinator: Successfully fetched %d chimes",
                len(chimes_models),
            )
        except Exception as err:
            _LOGGER.warning("Protect coordinator: Error fetching chimes: %s", err)

    async def _fetch_viewers(self) -> None:
        """Fetch viewer data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching viewers")
        try:
            if hasattr(self.protect_client, "viewers"):
                viewers_models = await self.protect_client.viewers.get_all()
                viewers: dict[str, Any] = {}
                for viewer_model in viewers_models:
                    viewer = self._model_to_dict(viewer_model)
                    viewer_id = viewer.get("id")
                    if viewer_id:
                        viewers[viewer_id] = viewer
                self.data["viewers"] = viewers
                _LOGGER.debug(
                    "Protect coordinator: Successfully fetched %d viewers",
                    len(viewers_models),
                )
        except Exception as err:
            _LOGGER.debug("Protect coordinator: Error fetching viewers: %s", err)

    async def _fetch_liveviews(self) -> None:
        """Fetch liveview data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching liveviews")
        try:
            if hasattr(self.protect_client, "liveviews"):
                liveviews_models = await self.protect_client.liveviews.get_all()
                liveviews: dict[str, Any] = {}
                for liveview_model in liveviews_models:
                    liveview = self._model_to_dict(liveview_model)
                    liveview_id = liveview.get("id")
                    if liveview_id:
                        liveviews[liveview_id] = liveview
                self.data["liveviews"] = liveviews
                _LOGGER.debug(
                    "Protect coordinator: Successfully fetched %d liveviews",
                    len(liveviews_models),
                )
        except Exception as err:
            _LOGGER.debug("Protect coordinator: Error fetching liveviews: %s", err)

    def _cleanup_stale_devices(self) -> None:
        """Remove stale Protect devices from the device registry (Gold requirement)."""
        device_registry = dr.async_get(self.hass)

        for device_type in [
            "cameras",
            "lights",
            "sensors",
            "nvrs",
            "viewers",
            "chimes",
        ]:
            current_ids: set[str] = set(self.data.get(device_type, {}).keys())
            previous_ids = self._previous_protect_device_ids.get(device_type, set())

            stale_ids = previous_ids - current_ids
            for device_id in stale_ids:
                # Try both identifier patterns (with and without "protect_" prefix)
                for identifier in [
                    f"protect_{device_type[:-1]}_{device_id}",  # protect_camera_xyz
                    device_id,  # Just the device ID
                ]:
                    device = device_registry.async_get_device(
                        identifiers={(DOMAIN, identifier)}
                    )
                    if device:
                        _LOGGER.info(
                            "Protect coordinator: Removing stale %s device: %s",
                            device_type,
                            device_id,
                        )
                        device_registry.async_update_device(
                            device_id=device.id,
                            remove_config_entry_id=self.config_entry.entry_id,
                        )
                        break

            self._previous_protect_device_ids[device_type] = current_ids

    def get_camera(self, camera_id: str) -> dict[str, Any] | None:
        """Get camera data by ID."""
        result = self.data.get("cameras", {}).get(camera_id)
        return result if isinstance(result, dict) else None

    def get_light(self, light_id: str) -> dict[str, Any] | None:
        """Get light data by ID."""
        result = self.data.get("lights", {}).get(light_id)
        return result if isinstance(result, dict) else None

    def get_sensor(self, sensor_id: str) -> dict[str, Any] | None:
        """Get sensor data by ID."""
        result = self.data.get("sensors", {}).get(sensor_id)
        return result if isinstance(result, dict) else None

    def get_nvr(self, nvr_id: str) -> dict[str, Any] | None:
        """Get NVR data by ID."""
        result = self.data.get("nvrs", {}).get(nvr_id)
        return result if isinstance(result, dict) else None
