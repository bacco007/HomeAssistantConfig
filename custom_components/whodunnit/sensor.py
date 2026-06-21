"""
Whodunnit  -  Home Assistant Custom Integration
sensor.py: The WhodunnitSensor entity

This file contains the core detective logic. For each tracked entity, one
WhodunnitSensor is created. Its job is to watch for state changes on the target
entity and figure out *what* caused that change  -  a user tapping the dashboard,
a device action (physical press or internal event), an automation, a scene,
a script, or the device itself.

How HA context chaining works (essential background):
  Every state change in HA carries a Context object with three fields:
    - id:        A unique ID for this specific event.
    - parent_id: The ID of the context that triggered this one (e.g. the
                 automation run that caused this service call).
    - user_id:   Set when a human user directly triggered the action via the UI.

  Whodunnit's shared listeners (registered in __init__.py) cache automation,
  script, scene, and service-call events by context ID *before* their service
  calls fire. When the target entity's state changes, this sensor looks up the
  change's context in that shared cache to identify the source.

Detection cascade (in _classify):
  1. Context ID found in cache        -> Automation / Script / Scene / UI action.
                                        For STATE_UI cache entries on bleed platforms
                                        (ESPHome), a "seen" flag distinguishes the
                                        genuine first hit (HIGH) from subsequent hits
                                        where ESPHome reuses the context ID for a
                                        physical press in the bleed window (LOW).
  2. Context has a user_id (no cache) -> Dashboard / UI action by a named user.
                                        On ESPHome, genuine dashboard actions are
                                        caught by Step 1; reaching Step 2 with a
                                        user_id is an edge case, classified HIGH.
  3. Context has a parent_id (no cache hit) -> Check parent context in cache.
                                              If parent found: HIGH confidence, source
                                              identified (e.g. automation -> script ->
                                              entity is resolved to the script).
                                              If parent also missing: MEDIUM confidence,
                                              HA was involved but source unknown.
  4. Context has no user_id or parent_id   -> Device internal (timer, hardware event)

After every successful classification, Whodunnit fires a "whodunnit_trigger_detected"
event on the HA event bus (see EVENT_TRIGGER_DETECTED in const.py). This gives
automations a reliable trigger even when consecutive events produce the same sensor
state value (e.g. the same script runs twice), where a standard state trigger would
not fire because the state did not change.
"""

import asyncio
import logging
import time
from collections import deque
from dataclasses import dataclass
from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNKNOWN, STATE_UNAVAILABLE
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util
from homeassistant.helpers.event import (
    EventStateChangedData,
    async_track_state_change_event,
)

from .const import (
    DOMAIN,
    ATTR_SOURCE_TYPE,
    ATTR_SOURCE_ID,
    ATTR_SOURCE_NAME,
    ATTR_CONTEXT_ID,
    ATTR_USER_ID,
    ATTR_EVENT_TIME,
    ATTR_CONFIDENCE,
    ATTR_HISTORY_LOG,
    CONFIDENCE_HIGH,
    CONFIDENCE_MEDIUM,
    CONFIDENCE_LOW,
    HISTORY_LOG_SIZE,
    BLEED_PLATFORMS,
    STATE_MONITORING,
    STATE_UI,
    STATE_DEVICE,
    STATE_AUTOMATION,
    STATE_SCENE,
    STATE_SCRIPT,
    ID_INDIRECT_AUTOMATION,
    NAME_INDIRECT_AUTOMATION,
    NAME_DEVICE,
    NAME_READY,
    SOURCE_TYPE_DEFAULT,
    SOURCE_ID_DEFAULT,
    USER_ID_DEFAULT,
    CONTEXT_ID_DEFAULT,
    EVENT_TIME_DEFAULT,
    NAME_UNKNOWN_USER,
    STATE_SERVICE,
    SOURCE_TYPE_USER,
    SOURCE_TYPE_DEVICE,
    SOURCE_TYPE_SERVICE,
    EVENT_TRIGGER_DETECTED,
    ATTR_CACHE_DEBUG,
    USER_CACHE_TTL,
    VALID_STATES,
)

_LOGGER = logging.getLogger(__name__)

# Per-domain attribute names that Whodunnit monitors for attribute-only changes
# (i.e. a meaningful user action that does not change the primary state value).
# Stored as a dict of frozensets so the lookup is O(1) per domain and the sets
# are created once at import time rather than on every state-change event.
#
# Only attributes that reflect deliberate user-controlled values are listed.
# Autonomously changing attributes (e.g. media_player.media_position, which
# increments every second during playback) are intentionally excluded to avoid
# flooding the sensor with noise.
#
# Domains whose meaningful values are stored in state (number, select,
# input_number, input_select, switch, lock, etc.) need no entry here  -  their
# state changes are already caught by the primary state comparison below.
_WATCHED_ATTRS: dict[str, frozenset[str]] = {
    "light": frozenset({
        "brightness", "rgb_color", "rgbw_color",
        "xy_color", "color_temp", "hs_color", "effect",
    }),
    "climate": frozenset({
        "temperature", "target_temp_high", "target_temp_low",
        "fan_mode", "swing_mode", "preset_mode", "humidity",
    }),
    "media_player": frozenset({
        "volume_level", "source", "sound_mode",
    }),
    "fan": frozenset({
        "percentage", "preset_mode", "direction", "oscillating",
    }),
    "cover": frozenset({
        "current_position", "current_tilt_position",
    }),
    "water_heater": frozenset({
        "temperature", "operation_mode",
    }),
    "humidifier": frozenset({
        "humidity",
    }),
    "vacuum": frozenset({
        "fan_speed",
    }),
}

# Icon mapping, created once at class level rather than on every property access.
_ICON_MAP = {
    STATE_DEVICE: "mdi:gesture-tap",
    STATE_UI: "mdi:monitor-dashboard",
    STATE_AUTOMATION: "mdi:robot",
    STATE_MONITORING: "mdi:eye-outline",
    STATE_SCENE: "mdi:palette",
    STATE_SCRIPT: "mdi:script-text-outline",
    STATE_SERVICE: "mdi:api",
}


@dataclass(frozen=True, slots=True)
class _Classification:
    """Result of classifying a single state change.

    A plain value object so the decision logic in _classify() stays free of
    side effects: _handle_change() is what applies the result to entity state,
    appends history, writes state, and fires the event.
    """

    state: str
    source_type: str | None
    source_id: str | None
    source_name: str
    confidence: str
    # The cache key that produced this result (ctx.id for a direct hit,
    # ctx.parent_id for a parent hit), or None when nothing matched.
    matched_context_id: str | None


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create a WhodunnitSensor for each entity listed in the config entry.

    Reads the pre-built device_info and target list from hass.data and creates
    the sensor. The shared context and user caches are passed directly so all
    sensors read from the same data populated by the global listeners.
    """
    domain_data = hass.data[DOMAIN]
    entry_data = domain_data["entries"][config_entry.entry_id]
    async_add_entities([
        WhodunnitSensor(
            ent,
            entry_data["device_info"],
            domain_data["context_cache"],
            domain_data["user_cache"],
        )
        for ent in entry_data["targets"]
    ])


class WhodunnitSensor(SensorEntity, RestoreEntity):
    """A sensor that reports what last triggered a state change on a target entity."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "trigger_source"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = [
        STATE_MONITORING, STATE_AUTOMATION, STATE_DEVICE,
        STATE_UI, STATE_SCENE, STATE_SCRIPT, STATE_SERVICE,
    ]

    def __init__(
        self,
        target_entity: str,
        device_info: DeviceInfo,
        context_cache: dict,
        user_cache: dict,
    ) -> None:
        self._target_entity = target_entity
        self._device_info = device_info
        self._cache = context_cache
        self._user_cache = user_cache

        self._attr_translation_placeholders = {
            "target": target_entity.split(".")[-1].replace("_", " ").title()
        }

        self._state = STATE_MONITORING
        self._source_type = SOURCE_TYPE_DEFAULT
        self._source_id = SOURCE_ID_DEFAULT
        self._source_name = NAME_READY
        self._context_id = CONTEXT_ID_DEFAULT
        self._user_id = USER_ID_DEFAULT
        self._event_time = EVENT_TIME_DEFAULT
        self._confidence = CONFIDENCE_HIGH

        self._history_log: deque = deque(maxlen=HISTORY_LOG_SIZE)

        self._attr_unique_id = f"{target_entity}_whodunnit"

        # Monotonic timestamps (immune to wall-clock/NTP jumps) for throttling
        # and cache-age diagnostics. event_time below stays wall-clock because
        # it is a human-facing ISO timestamp, not an interval.
        self._last_attr_time = 0.0
        self._last_classification_time = 0.0
        self._last_matched_context_id: str | None = None

        self._is_bleed = False
        self._change_lock = asyncio.Lock()

    def _get_clean_target_name(self) -> str:
        """Derive the display name for the sensor title from the target entity."""
        device_name = self._device_info.get("name", "")

        ent_reg = er.async_get(self.hass)
        entry = ent_reg.async_get(self._target_entity)
        if entry and entry.name:
            target_name = entry.name
        else:
            state = self.hass.states.get(self._target_entity)
            if state and state.attributes.get("friendly_name"):
                target_name = state.attributes["friendly_name"]
            else:
                target_name = (
                    self._target_entity.split(".")[-1].replace("_", " ").title()
                )

        if device_name and target_name.startswith(device_name):
            clean_target = target_name[len(device_name):].strip()
            if not clean_target or clean_target.startswith(("_", ".")):
                clean_target = target_name
        else:
            clean_target = target_name

        return clean_target

    def _refresh_name(self) -> None:
        """Recompute the entity name from the current target name.

        Entity.name is a cached_property in HA, so reassigning the translation
        placeholder is not enough on its own: the cached value must be
        invalidated, otherwise the next state write keeps serving the name that
        was computed (and cached) when the entity was first added. Without this
        the sensor's title would never reflect a renamed target until restart.
        """
        self._attr_translation_placeholders = {
            "target": self._get_clean_target_name()
        }
        self.__dict__.pop("name", None)

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info to attach this sensor to the correct device card."""
        return self._device_info

    @property
    def native_value(self) -> str:
        """Return the current trigger source slug (e.g. "automation", "ui")."""
        return self._state

    @property
    def available(self) -> bool:
        """Return True if the target entity is registered in HA."""
        ent_reg = er.async_get(self.hass)
        return ent_reg.async_get(self._target_entity) is not None

    @property
    def extra_state_attributes(self) -> dict:
        return {
            ATTR_SOURCE_TYPE: self._source_type,
            ATTR_SOURCE_ID: self._source_id,
            ATTR_SOURCE_NAME: self._source_name,
            ATTR_CONTEXT_ID: self._context_id,
            ATTR_USER_ID: self._user_id,
            ATTR_EVENT_TIME: self._event_time,
            ATTR_CONFIDENCE: self._confidence,
            ATTR_HISTORY_LOG: list(self._history_log),
            ATTR_CACHE_DEBUG: self._build_cache_debug(),
        }

    @property
    def icon(self) -> str:
        """Return an icon that reflects the current trigger source type."""
        return _ICON_MAP.get(self._state, "mdi:help-circle-outline")

    async def async_added_to_hass(self) -> None:
        """Finalise setup after the entity has been added to HA."""
        # Restore persisted state, validating the state slug against known values.
        extra_data = await self.async_get_last_state()
        if extra_data and extra_data.state not in (STATE_UNKNOWN, STATE_UNAVAILABLE):
            if extra_data.state not in VALID_STATES:
                _LOGGER.warning(
                    "Whodunnit: ignoring invalid restored state '%s' for %s",
                    extra_data.state,
                    self._target_entity,
                )
            else:
                self._state = extra_data.state
                attrs = extra_data.attributes
                self._source_type = attrs.get(ATTR_SOURCE_TYPE, SOURCE_TYPE_DEFAULT)
                self._source_id = attrs.get(ATTR_SOURCE_ID, SOURCE_ID_DEFAULT)
                self._source_name = attrs.get(ATTR_SOURCE_NAME, NAME_READY)
                self._context_id = attrs.get(ATTR_CONTEXT_ID, CONTEXT_ID_DEFAULT)
                self._user_id = attrs.get(ATTR_USER_ID, USER_ID_DEFAULT)
                self._event_time = attrs.get(ATTR_EVENT_TIME, EVENT_TIME_DEFAULT)
                self._confidence = attrs.get(ATTR_CONFIDENCE, CONFIDENCE_HIGH)
                restored_log = attrs.get(ATTR_HISTORY_LOG, [])
                if isinstance(restored_log, list):
                    self._history_log = deque(restored_log, maxlen=HISTORY_LOG_SIZE)

        # Cache the bleed-platform check (platform never changes at runtime).
        ent_reg = er.async_get(self.hass)
        entry = ent_reg.async_get(self._target_entity)
        self._is_bleed = entry is not None and entry.platform in BLEED_PLATFORMS

        # Listen for state changes on the target entity.
        self.async_on_remove(
            async_track_state_change_event(
                self.hass, [self._target_entity], self._handle_change
            )
        )

        # Listen for entity registry updates so the sensor title stays in sync.
        @callback
        def _handle_registry_update(event: Event) -> None:
            if event.data.get("entity_id") != self._target_entity:
                return
            if "name" not in event.data.get("changes", {}):
                return
            self._refresh_name()
            self.async_write_ha_state()

        self.async_on_remove(
            self.hass.bus.async_listen(
                er.EVENT_ENTITY_REGISTRY_UPDATED, _handle_registry_update
            )
        )

        self._refresh_name()
        self.async_write_ha_state()

    async def _handle_change(self, event: Event[EventStateChangedData]) -> None:
        """React to a state change on the target entity.

        Serialised per entity via _change_lock to prevent interleaved field
        writes when an auth lookup yields control between two rapid events.
        Deciding *what* triggered the change lives in _classify(); this method
        only filters out noise and applies the result to entity state.
        """
        async with self._change_lock:
            new_s = event.data.get("new_state")
            old_s = event.data.get("old_state")

            if not new_s or not old_s:
                return

            domain = self._target_entity.split(".")[0]
            watched = _WATCHED_ATTRS.get(domain, frozenset())
            attr_changed = any(
                new_s.attributes.get(a) != old_s.attributes.get(a)
                for a in watched
            )

            if new_s.state == old_s.state and not attr_changed:
                return

            now = time.monotonic()
            if new_s.state == old_s.state and (now - self._last_attr_time) < 2.0:
                return

            if attr_changed and new_s.state == old_s.state:
                self._last_attr_time = now

            ctx = event.context

            if ctx and ctx.id == self._context_id and not self._is_bleed:
                return

            # Only the person/auth lookup inside _classify() can realistically
            # raise (it touches hass.auth); the rest is pure cache-dict logic.
            # Scope the catch tightly so a genuine bug is not silently swallowed.
            try:
                result = await self._classify(ctx)
            except Exception:
                _LOGGER.exception(
                    "Whodunnit: error classifying %s", self._target_entity
                )
                return

            self._event_time = dt_util.now().isoformat()
            self._context_id = ctx.id if ctx else CONTEXT_ID_DEFAULT
            self._state = result.state
            self._source_type = result.source_type
            self._source_id = result.source_id
            self._source_name = result.source_name
            self._confidence = result.confidence
            self._user_id = (
                ctx.user_id
                if ctx and result.state == STATE_UI
                else USER_ID_DEFAULT
            )
            self._last_classification_time = now
            self._last_matched_context_id = result.matched_context_id

            self._history_log.appendleft({
                ATTR_EVENT_TIME: self._event_time,
                ATTR_SOURCE_TYPE: self._source_type,
                ATTR_SOURCE_ID: self._source_id,
                ATTR_SOURCE_NAME: self._source_name,
                ATTR_CONFIDENCE: self._confidence,
                ATTR_CONTEXT_ID: self._context_id,
            })

            self.async_write_ha_state()

            self.hass.bus.async_fire(
                EVENT_TRIGGER_DETECTED,
                {
                    "entity_id": self._target_entity,
                    "state": self._state,
                    "source_type": self._source_type,
                    "source_id": self._source_id,
                    "source_name": self._source_name,
                    "confidence": self._confidence,
                    "context_id": self._context_id,
                    "event_time": self._event_time,
                },
            )

    async def _classify(self, ctx: Context | None) -> _Classification:
        """Decide what triggered the change. No side effects on entity state.

        Walks the detection cascade documented at the top of this module and
        returns a _Classification. The only external dependency is the person/
        auth lookup in steps 1 and 2; everything else is cache-dict logic. The
        shared cache entry's "seen" flag is updated here as part of ESPHome
        bleed detection.
        """
        # Step 1: Direct cache hit on the context ID.
        owner = self._cache.get(ctx.id) if ctx else None
        if owner:
            if owner["type"] == STATE_UI:
                p_id, p_name, is_service_account = (
                    await self._get_person_cached(owner["id"])
                )
                already_seen = owner.get("seen", False)
                owner["seen"] = True
                confidence = (
                    CONFIDENCE_LOW
                    if (self._is_bleed and already_seen)
                    else CONFIDENCE_HIGH
                )
                if is_service_account:
                    return _Classification(
                        state=STATE_SERVICE,
                        source_type=SOURCE_TYPE_SERVICE,
                        source_id=owner["id"],
                        source_name=p_name,
                        confidence=confidence,
                        matched_context_id=ctx.id,
                    )
                return _Classification(
                    state=STATE_UI,
                    source_type=SOURCE_TYPE_USER,
                    source_id=p_id or owner["id"],
                    source_name=p_name,
                    confidence=confidence,
                    matched_context_id=ctx.id,
                )
            return _Classification(
                state=owner["type"],
                source_type=owner["type"],
                source_id=owner["id"],
                source_name=owner["name"],
                confidence=CONFIDENCE_HIGH,
                matched_context_id=ctx.id,
            )

        # Step 2: user_id present, no cache hit.
        if ctx and ctx.user_id:
            p_id, p_name, is_service_account = (
                await self._get_person_cached(ctx.user_id)
            )
            if is_service_account:
                return _Classification(
                    state=STATE_SERVICE,
                    source_type=SOURCE_TYPE_SERVICE,
                    source_id=ctx.user_id,
                    source_name=p_name,
                    confidence=CONFIDENCE_HIGH,
                    matched_context_id=None,
                )
            return _Classification(
                state=STATE_UI,
                source_type=SOURCE_TYPE_USER,
                source_id=p_id or ctx.user_id,
                source_name=p_name,
                confidence=CONFIDENCE_HIGH,
                matched_context_id=None,
            )

        # Step 3: parent_id present, check parent in cache.
        if ctx and ctx.parent_id:
            parent_owner = self._cache.get(ctx.parent_id)
            if parent_owner:
                return _Classification(
                    state=parent_owner["type"],
                    source_type=parent_owner["type"],
                    source_id=parent_owner["id"],
                    source_name=parent_owner["name"],
                    confidence=CONFIDENCE_HIGH,
                    matched_context_id=ctx.parent_id,
                )
            return _Classification(
                state=STATE_AUTOMATION,
                source_type=STATE_AUTOMATION,
                source_id=ID_INDIRECT_AUTOMATION,
                source_name=NAME_INDIRECT_AUTOMATION,
                confidence=CONFIDENCE_MEDIUM,
                matched_context_id=None,
            )

        # Step 4: No user, no parent, no cache hit. Device-originated.
        return _Classification(
            state=STATE_DEVICE,
            source_type=SOURCE_TYPE_DEVICE,
            source_id=self._target_entity,
            source_name=NAME_DEVICE,
            confidence=CONFIDENCE_HIGH,
            matched_context_id=None,
        )

    def _build_cache_debug(self) -> dict:
        """Build a diagnostic snapshot focused on the last classification."""
        if self._last_classification_time == 0.0:
            return {
                "last_classification_ago": None,
                "total_cache_entries": len(self._cache),
                "matched_entry": None,
            }

        now = time.monotonic()
        elapsed = now - self._last_classification_time

        matched_entry = None
        if self._last_matched_context_id:
            entry = self._cache.get(self._last_matched_context_id)
            if entry:
                age_at_match = (now - entry.get("timestamp", now)) - elapsed
                matched_entry = {
                    "type": entry.get("type", "unknown"),
                    "source_id": entry.get("id", ""),
                    "context_id": self._last_matched_context_id[-8:],
                    "age_at_match_seconds": round(max(age_at_match, 0.0), 1),
                }
                if entry.get("type") == STATE_UI:
                    matched_entry["seen"] = entry.get("seen", False)

        return {
            "last_classification_ago": round(elapsed, 1),
            "total_cache_entries": len(self._cache),
            "matched_entry": matched_entry,
        }

    async def _get_person_cached(
        self, user_id: str
    ) -> tuple[str | None, str, bool]:
        """Resolve a HA user ID to a person entity ID, display name, and account type.

        Results are cached with a TTL so that person renames and account type
        changes are picked up without requiring an HA restart.
        """
        cached = self._user_cache.get(user_id)
        if cached and time.monotonic() - cached["timestamp"] < USER_CACHE_TTL:
            return cached["person_id"], cached["name"], cached["is_service_account"]

        user = await self.hass.auth.async_get_user(user_id)
        name = user.name if user else NAME_UNKNOWN_USER
        p_id = None

        for eid in self.hass.states.async_entity_ids("person"):
            s = self.hass.states.get(eid)
            if s and s.attributes.get("user_id") == user_id:
                p_id = eid
                name = s.attributes.get("friendly_name", name)
                break

        is_service_account = user is not None and p_id is None

        self._user_cache[user_id] = {
            "person_id": p_id,
            "name": name,
            "is_service_account": is_service_account,
            "timestamp": time.monotonic(),
        }
        return p_id, name, is_service_account
