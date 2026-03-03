"""
Whodunnit  -  Home Assistant Custom Integration
sensor.py: The WhodunnitSensor entity

This file contains the core detective logic. For each tracked entity, one
WhodunnitSensor is created. Its job is to watch for state changes on the target
entity and figure out *what* caused that change  -  a user tapping the dashboard,
a device action (physical press or internal event), an automation, a scene, a script, or the device itself.

How HA context chaining works (essential background):
  Every state change in HA carries a Context object with three fields:
    - id:        A unique ID for this specific event.
    - parent_id: The ID of the context that triggered this one (e.g. the
                 automation run that caused this service call).
    - user_id:   Set when a human user directly triggered the action via the UI.

  Whodunnit listens to automation/script/scene events *before* they fire their
  service calls, caches those events by context ID, and then when the target
  entity's state changes, looks up the change's context in that cache to
  identify the source.

Detection cascade (in _handle_change):
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
  5. Fallback                              -> Device-originated (physical press or internal event)

After every successful classification, Whodunnit fires a "whodunnit_trigger_detected"
event on the HA event bus (see EVENT_TRIGGER_DETECTED in const.py). This gives
automations a reliable trigger even when consecutive events produce the same sensor
state value (e.g. the same script runs twice), where a standard state trigger would
not fire because the state did not change.
"""

import logging
import time
from collections import deque
from homeassistant.components.sensor import SensorEntity
from homeassistant.const import STATE_UNKNOWN, STATE_UNAVAILABLE, EVENT_CALL_SERVICE
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util
from homeassistant.helpers.event import async_track_state_change_event

from .const import (
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
    NAME_SERVICE_ACCOUNT,
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
        # Target temperature(s) and mode overrides set by the user.
        # hvac_mode changes are reflected in state, so not listed here.
        "temperature", "target_temp_high", "target_temp_low",
        "fan_mode", "swing_mode", "preset_mode", "humidity",
    }),
    "media_player": frozenset({
        # Volume and input/mode selections driven by the user.
        # Playback position and metadata change autonomously and are excluded.
        "volume_level", "source", "sound_mode",
    }),
    "fan": frozenset({
        # Speed, direction, and oscillation set by the user.
        # on/off and preset changes that also change state are caught separately.
        "percentage", "preset_mode", "direction", "oscillating",
    }),
    "cover": frozenset({
        # Position sliders set by the user. open/closed state caught separately.
        "current_position", "current_tilt_position",
    }),
    "water_heater": frozenset({
        "temperature", "operation_mode",
    }),
    "humidifier": frozenset({
        # Target humidity set by the user; on/off caught via state.
        "humidity",
    }),
    "vacuum": frozenset({
        "fan_speed",
    }),
}

# How long (seconds) a cached context entry remains valid. Contexts are short-
# lived  -  if no matching state change arrives within this window, the entry is
# stale and should be discarded.
CACHE_TTL = 120

# Maximum number of entries allowed in the context cache at any one time.
# Eviction is oldest-first once this limit is reached. 200 is generous for
# typical home automation use; reduce if memory is a concern.
CACHE_MAX_SIZE = 200

# Minimum interval (seconds) between cache cleanup passes. Cleanup iterates
# the full cache dict, so calling it on every service-call event in a busy
# home would be wasteful. 30 seconds is more than fast enough given the
# CACHE_TTL of 120 seconds.
CACHE_CLEANUP_INTERVAL = 30


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Create a WhodunnitSensor for each entity listed in the config entry.

    Called by HA after __init__.py has finished setting up the entry. Reads the
    pre-built device_info and target list from hass.data and creates the sensor.
    Caches are passed directly to avoid the sensor constructor reaching into
    hass.data, which could race on hot reloads or partial restores.
    """
    data = hass.data[config_entry.domain][config_entry.entry_id]
    async_add_entities([
        WhodunnitSensor(
            ent,
            data["device_info"],
            data["context_cache"],
            data["user_cache"],
        )
        for ent in data["targets"]
    ])


class WhodunnitSensor(SensorEntity, RestoreEntity):
    """A sensor that reports what last triggered a state change on a target entity.

    Inherits from both SensorEntity (standard HA sensor behaviour) and
    RestoreEntity (persists state across HA restarts via the recorder).

    The sensor's native_value is a short slug string (e.g. "automation", "ui",
    "device") that maps to a human-readable label and icon. Full context  -  who,
    what, and when  -  is exposed via extra_state_attributes.
    """

    # Tell HA that this entity's name comes from its translation key + placeholders
    # rather than being set directly. See strings.json -> entity.sensor.trigger_source.
    _attr_has_entity_name = True

    # This sensor is event-driven; it updates itself by calling async_write_ha_state().
    # Setting should_poll = False tells HA not to call async_update() on a schedule.
    _attr_should_poll = False

    # Maps to the "trigger_source" entry in strings.json for translated state labels.
    _attr_translation_key = "trigger_source"

    def __init__(self, target_entity, device_info, context_cache, user_cache):
        """Initialise the sensor.

        Sets up internal state and stores references to the shared caches.
        Caches are passed in directly from async_setup_entry rather than being
        read from hass.data here, which avoids a potential race condition on
        hot reloads or partial restores (hass.data is guaranteed populated by
        the time async_setup_entry runs, but not necessarily at entity
        construction time in all HA lifecycle paths).

        Note: self.hass is NOT set here. It is injected by the HA entity
        framework before async_added_to_hass() is called; do not rely on it
        in this method.

        Args:
            target_entity:  The entity_id being monitored (e.g. "switch.garage").
            device_info:    The device_info dict built by __init__.py. Used to
                            attach this sensor to the correct device card in the UI.
            context_cache:  Shared dict keyed by context ID for caching trigger sources.
            user_cache:     Shared dict keyed by HA user ID for caching person lookups.
        """
        self._target_entity = target_entity
        self._device_info = device_info

        # Both caches are shared across all sensors belonging to the same config
        # entry. This avoids duplicate lookups if a future version supports
        # tracking multiple entities per entry.
        self._cache = context_cache      # context_id -> {id, name, type, timestamp}
        self._user_cache = user_cache    # user_id -> (person_entity_id, display_name)

        # --- Sensor display name (translation placeholder) ---
        # The sensor name shown in the UI is "{target} Trigger Source" where
        # {target} is resolved from the entity registry / state attributes.
        # We cannot call _get_clean_target_name() here because self.hass is not
        # yet available at construction time  -  the HA framework injects it before
        # async_added_to_hass(). Use a slug-based fallback for now; the correct
        # name is applied at the end of async_added_to_hass().
        self._attr_translation_placeholders = {
            "target": target_entity.split(".")[-1].replace("_", " ").title()
        }

        # --- Initial sensor state ---
        # The sensor starts in "monitoring" state (shown as "Monitoring" in the UI)
        # until the first state change on the target entity is detected.
        self._state = STATE_MONITORING
        self._source_type = SOURCE_TYPE_DEFAULT
        self._source_id = SOURCE_ID_DEFAULT
        self._source_name = NAME_READY
        self._context_id = CONTEXT_ID_DEFAULT
        self._user_id = USER_ID_DEFAULT
        self._event_time = EVENT_TIME_DEFAULT
        self._confidence = CONFIDENCE_HIGH   # Always present; see _handle_change for levels.

        # History log: a fixed-size deque of the last HISTORY_LOG_SIZE trigger
        # events. Each entry is a plain dict so it serialises cleanly to JSON
        # in the recorder and survives restarts via RestoreEntity.
        self._history_log: deque = deque(maxlen=HISTORY_LOG_SIZE)

        # unique_id ties this sensor to a specific config entry in the registry.
        self._attr_unique_id = f"{target_entity}_whodunnit"

        # Timestamp of the last attribute-only change. Used to debounce rapid
        # attribute updates (e.g. a brightness slider being dragged).
        self._last_attr_time = 0

        # Timestamp of the last cache cleanup pass. Used to time-gate cleanup
        # so it doesn't run on every single service-call event.
        self._last_cleanup = 0

        # Timestamp (time.time()) of the last completed classification and the
        # context ID that was matched (or None if the last event was Physical/
        # Step 4 with no cache involvement). Used by _build_cache_debug to
        # filter the cache snapshot to entries that were present at the time of
        # the last classification, and to flag which entry actually matched.
        self._last_classification_time = 0.0
        self._last_matched_context_id: str | None = None



    def _get_clean_target_name(self) -> str:
        """Derive the display name for the sensor title from the target entity.

        Checks three sources in priority order:
          1. The user-assigned name in the entity registry (set via HA UI rename)
          2. The friendly_name state attribute (set by the integration/device)
          3. A title-cased slug derived from the entity_id

        If the target entity belongs to a device, the device name prefix is
        stripped to avoid redundancy in the UI. For example, a sensor on the
        "Garage Switch" device tracking "Garage Switch Relay 1" will return
        "Relay 1" rather than "Garage Switch Relay 1".

        This method is called at init time and again whenever the target entity
        is renamed, so the sensor title always stays in sync.
        """
        device_name = self._device_info.get("name", "")

        # Priority 1: user-assigned name from the entity registry.
        ent_reg = er.async_get(self.hass)
        entry = ent_reg.async_get(self._target_entity)
        if entry and entry.name:
            target_name = entry.name
        else:
            # Priority 2: friendly_name from state attributes.
            state = self.hass.states.get(self._target_entity)
            if state and state.attributes.get("friendly_name"):
                target_name = state.attributes["friendly_name"]
            else:
                # Priority 3: slug fallback.
                target_name = self._target_entity.split(".")[-1].replace("_", " ").title()

        if device_name and target_name.startswith(device_name):
            # Strip the device name prefix and any leading separator characters.
            clean_target = target_name[len(device_name):].strip()
            if not clean_target or clean_target.startswith(("_", ".")):
                # Stripping left nothing meaningful; use the full name instead.
                clean_target = target_name
        else:
            clean_target = target_name

        return clean_target

    @property
    def device_info(self):
        """Return device info to attach this sensor to the correct device card."""
        return self._device_info

    @property
    def native_value(self):
        """Return the current trigger source slug (e.g. "automation", "ui")."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return detailed metadata about the last detected trigger.

        These attributes are visible on the entity's detail page and can be
        used in automations and templates for fine-grained control.

        confidence is always present (high/medium/low) so automations can
        reliably test it without guarding for attribute existence.

        history_log is a list of the last HISTORY_LOG_SIZE trigger events,
        newest-first, each containing the same fields as the top-level
        attributes. Survives restarts via the recorder.

        cache_debug shows the cache entry that matched the last classification
        (matched_entry), or null if the last event was Physical (Step 4, no
        cache involvement). Also reports total_cache_entries as a gauge of
        system activity. See _build_cache_debug() for full field documentation.
        """
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
    def icon(self):
        """Return an icon that reflects the current trigger source type."""
        icon_map = {
            STATE_DEVICE: "mdi:gesture-tap",
            STATE_UI: "mdi:monitor-dashboard",
            STATE_AUTOMATION: "mdi:robot",
            STATE_MONITORING: "mdi:eye-outline",
            STATE_SCENE: "mdi:palette",
            STATE_SCRIPT: "mdi:script-text-outline",
            STATE_SERVICE: "mdi:api",
        }
        return icon_map.get(self._state, "mdi:help-circle-outline")

    async def async_added_to_hass(self):
        """Finalise setup after the entity has been added to HA.

        This is the correct place to restore persisted state and register event
        listeners, because self.hass is fully available and the entity is
        registered in the entity registry by the time this is called.
        """
        # Restore the last known state from the recorder so the sensor shows
        # meaningful data immediately after a restart rather than "Monitoring".
        extra_data = await self.async_get_last_state()
        if extra_data and extra_data.state not in [STATE_UNKNOWN, STATE_UNAVAILABLE]:
            self._state = extra_data.state
            attrs = extra_data.attributes
            self._source_type = attrs.get(ATTR_SOURCE_TYPE, SOURCE_TYPE_DEFAULT)
            self._source_id = attrs.get(ATTR_SOURCE_ID, SOURCE_ID_DEFAULT)
            self._source_name = attrs.get(ATTR_SOURCE_NAME, NAME_READY)
            self._context_id = attrs.get(ATTR_CONTEXT_ID, CONTEXT_ID_DEFAULT)
            self._user_id = attrs.get(ATTR_USER_ID, USER_ID_DEFAULT)
            self._event_time = attrs.get(ATTR_EVENT_TIME, EVENT_TIME_DEFAULT)
            self._confidence = attrs.get(ATTR_CONFIDENCE, CONFIDENCE_HIGH)
            # history_log is stored as a plain list in the recorder; restore it
            # into the deque. maxlen is re-applied automatically by the deque.
            restored_log = attrs.get(ATTR_HISTORY_LOG, [])
            if isinstance(restored_log, list):
                self._history_log = deque(restored_log, maxlen=HISTORY_LOG_SIZE)

        # Listen for automations and scripts firing. These events are emitted
        # *before* the automation/script executes its actions, so by the time
        # the target entity changes state, the context is already in our cache.
        self.async_on_remove(self.hass.bus.async_listen("automation_triggered", self._record_logic_trigger))
        self.async_on_remove(self.hass.bus.async_listen("script_started", self._record_logic_trigger))

        # Listen for service calls. This catches scene activations and any
        # automation/script that calls a service directly, providing a second
        # opportunity to cache the context if the above events were missed.
        self.async_on_remove(self.hass.bus.async_listen(EVENT_CALL_SERVICE, self._record_service_context))

        # Listen for state changes on the target entity. This serves two purposes:
        #   1. Triggers the main detective logic in _handle_change.
        #   2. Detects friendly_name changes so the sensor title can be updated.
        self.async_on_remove(async_track_state_change_event(self.hass, [self._target_entity], self._handle_change))

        # Listen for entity registry updates so the sensor title stays in sync
        # when the user renames the target entity via the HA UI. User-assigned
        # names are stored in the entity registry (entry.name), not in state
        # attributes, so a state change listener won't catch renames.
        @callback
        def _handle_registry_update(event) -> None:
            """Update the sensor title if the target entity's registry name changed."""
            # The event fires for all entity registry changes; filter to ours.
            if event.data.get("entity_id") != self._target_entity:
                return
            # "changes" contains only the fields that actually changed.
            if "name" not in event.data.get("changes", {}):
                return
            self._attr_translation_placeholders = {"target": self._get_clean_target_name()}
            self.async_write_ha_state()

        self.async_on_remove(
            self.hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, _handle_registry_update)
        )

        # Now that self.hass is available, resolve the real display name for the
        # sensor title and overwrite the slug fallback set in __init__.
        self._attr_translation_placeholders = {"target": self._get_clean_target_name()}
        self.async_write_ha_state()

    def _cleanup_cache(self):
        """Prune the context cache to prevent unbounded memory growth.

        Step 1: Remove entries older than CACHE_TTL seconds.
        Step 2: If the cache is still over CACHE_MAX_SIZE, evict the oldest
                entries first until it fits within the limit.

        Guarded by a time-gate so that the O(n) iteration is not performed on
        every single EVENT_CALL_SERVICE event. In a busy home, that event fires
        continuously; without the gate, cleanup would run on every service call.
        30 seconds is well within the 120-second TTL so no entries will survive
        longer than intended.
        """
        now = time.time()
        if now - self._last_cleanup < CACHE_CLEANUP_INTERVAL:
            return
        self._last_cleanup = now

        # Remove expired entries.
        expired_keys = [k for k, v in self._cache.items() if now - v.get("timestamp", 0) > CACHE_TTL]
        for k in expired_keys:
            self._cache.pop(k, None)

        # If still over the size limit, evict oldest entries first.
        if len(self._cache) > CACHE_MAX_SIZE:
            sorted_keys = sorted(self._cache, key=lambda k: self._cache[k].get("timestamp", 0))
            for k in sorted_keys[:len(self._cache) - CACHE_MAX_SIZE]:
                del self._cache[k]

    @callback
    def _record_logic_trigger(self, event):
        """Cache an automation or script trigger event by its context ID.

        Called when "automation_triggered" or "script_started" fires. Stores
        the source entity and name so that when the target entity later changes
        state with a matching context, we can identify the trigger.

        The @callback decorator marks this as a synchronous HA scheduler
        callback. It must not await or perform blocking I/O.
        """
        if not event.context:
            return

        self._cleanup_cache()

        ctx_id = event.context.id
        entity_id = event.data.get("entity_id")
        name = event.data.get("name")
        domain = entity_id.split(".")[0] if entity_id else "automation"

        if entity_id:
            self._cache[ctx_id] = {
                "id": entity_id,
                "name": name or self._get_friendly(entity_id),
                "type": domain,
                "timestamp": time.time()
            }

    @callback
    def _record_service_context(self, event):
        """Cache a service call event by context ID for later lookup in _handle_change.

        Called for every EVENT_CALL_SERVICE event. Handles two cases:

        1. Logic domains (automation, script, scene): cache the triggering entity
           and type so _handle_change can identify the source. Skips if the context
           is already recorded  -  _record_logic_trigger entries are more specific.

        2. User-initiated device domains (e.g. light.turn_on from the dashboard):
           cache with type=STATE_UI so _handle_change Step 1 can identify this as
           a confirmed genuine HA action. On ESPHome (bleed platform), the device
           reuses this same context ID for physical presses during the bleed window;
           the "seen" flag in Step 1 distinguishes the genuine first hit (HIGH) from
           subsequent bled hits (LOW).

        The @callback decorator marks this as a synchronous HA scheduler
        callback. It must not await or perform blocking I/O.
        """
        self._cleanup_cache()

        domain = event.data.get("domain")
        service = event.data.get("service")
        ctx = event.context

        if not ctx:
            return

        if domain in ["automation", "script", "scene"]:
            service_data = event.data.get("service_data", {})

            # For scene.turn_on the scene entity is passed via the top-level
            # "target" dict (e.g. {"entity_id": "scene.movie_time"}), not in
            # service_data. Check both locations so scenes are identified by
            # their actual entity_id rather than the generic "scene.turn_on".
            target_ids = []
            if domain == "scene":
                target_dict = event.data.get("target", {})
                raw = target_dict.get("entity_id", [])
                if isinstance(raw, str):
                    target_ids = [raw]
                elif isinstance(raw, list):
                    target_ids = raw

            # Fall back to service_data.entity_id for automation/script domains.
            if not target_ids:
                raw = service_data.get("entity_id", [])
                if isinstance(raw, str):
                    target_ids = [raw]
                elif isinstance(raw, list):
                    target_ids = raw

            # Use the first resolved entity as the source ID, or fall back to
            # "domain.service" if no specific entity was targeted.
            logic_id = target_ids[0] if target_ids else f"{domain}.{service}"

            # Only write to cache if this context isn't already recorded  -  the
            # automation_triggered / script_started events above are more specific.
            if ctx.id not in self._cache:
                self._cache[ctx.id] = {
                    "id": logic_id,
                    "name": self._get_friendly(logic_id),
                    "type": domain,
                    "timestamp": time.time()
                }

        elif ctx.user_id and ctx.id not in self._cache:
            # A user-initiated service call on a device domain (e.g. light.turn_on).
            # Cache the context ID so _handle_change Step 1 can recognise it as a
            # confirmed genuine HA action. On bleed platforms, ESPHome reuses this
            # same context ID for physical presses during the bleed window  -  Step 1
            # detects subsequent hits via a "seen" flag and classifies them LOW.
            self._cache[ctx.id] = {
                "id": ctx.user_id,
                "name": "",
                "type": STATE_UI,
                "timestamp": time.time()
            }

    def _is_bleed_platform(self) -> bool:
        """Return True if the target entity belongs to a platform known to bleed context.

        ESPHome (and potentially other local-push platforms) reuse the last HA-sent
        context ID for physical events that occur within a short window after a HA
        command. This means a physical button press shortly after a dashboard action
        carries the same context ID as that action, causing a false classification.

        The only confirmed bleed behaviour is for UI-originated contexts: ESPHome
        reuses the same context ID (which carries user_id) for physical presses
        within the bleed window. This is handled by a "seen" flag on STATE_UI
        cache entries in Step 1 of _handle_change.

        Automation/script/scene context IDs are not confirmed to be reused by
        ESPHome, so no bleed detection is applied to those cache entries.

        We detect bleed-platform membership by checking the entity's registered
        platform against BLEED_PLATFORMS (defined in const.py).
        """
        ent_reg = er.async_get(self.hass)
        entry = ent_reg.async_get(self._target_entity)
        return entry is not None and entry.platform in BLEED_PLATFORMS

    async def _handle_change(self, event):
        """Identify what triggered a state change on the target entity.

        This is the heart of Whodunnit. It runs every time the target entity's
        state or a watched attribute changes, and works through a cascade of
        checks to classify the trigger source.

        Detection cascade:
          1. Context ID found in cache                -> Automation/Script/Scene/UI
          2. Context has user_id (no cache hit)       -> Dashboard/UI user action
          3. Context has parent_id (no cache hit)     -> Check parent in cache.
                                                        Parent found -> always HIGH.
                                                        ESPHome bleed does not apply
                                                        to parent-resolved events.
                                                        Parent missing -> MEDIUM.
          4. Context with no user_id or parent_id     -> Device internal event
          5. Fallback                                 -> Device-originated event
        """
        try:
            new_s = event.data.get("new_state")
            old_s = event.data.get("old_state")

            # Ignore events where state objects are missing (e.g. entity just
            # added or removed from HA).
            if not new_s or not old_s:
                return

            # Check whether any watched attributes changed for this entity's domain.
            # _WATCHED_ATTRS maps domain -> frozenset of attribute names. Domains not
            # in the dict (e.g. switch, lock) return an empty set, so the any()
            # short-circuits immediately and adds no overhead for those entities.
            domain = self._target_entity.split(".")[0]
            watched = _WATCHED_ATTRS.get(domain, frozenset())
            attr_changed = any(
                new_s.attributes.get(a) != old_s.attributes.get(a)
                for a in watched
            )

            # Ignore events where neither the state value nor watched attributes changed.
            if new_s.state == old_s.state and not attr_changed:
                return

            # Debounce rapid attribute-only changes (e.g. a brightness slider
            # being dragged continuously). Allow at most one update per 2 seconds
            # for attribute-only changes; state changes (on/off) always pass through.
            now = time.time()
            if new_s.state == old_s.state and (now - self._last_attr_time) < 2.0:
                return

            # Only reset the throttle clock for attribute-only changes.
            # If the state itself changed, we never throttle regardless of
            # what attributes also changed alongside it.
            if attr_changed and new_s.state == old_s.state:
                self._last_attr_time = now

            ctx = event.context

            is_bleed = self._is_bleed_platform()

            # Skip if this event shares the same context as the last one we
            # processed  -  prevents double-counting a single logical action.
            # On bleed platforms (e.g. ESPHome) the device reuses the last
            # HA-sent context ID for physical events during the bleed window,
            # so the same context ID can legitimately represent two distinct
            # events (the HA command and a subsequent hardware press). We must
            # NOT skip on bleed platforms, or the physical press is silently dropped.
            if ctx and ctx.id == self._context_id and not is_bleed:
                return

            # Record when this change was detected.
            self._event_time = dt_util.now().isoformat()
            self._context_id = ctx.id if ctx else CONTEXT_ID_DEFAULT

            # --- Detection cascade ---
            #
            # Each branch sets: _state, _source_type, _source_id, _source_name,
            # _confidence. Confidence starts at HIGH and is downgraded when the
            # classification is uncertain.
            #
            # Step 1: Direct cache hit on the context ID.
            # The cache is populated by _record_logic_trigger and
            # _record_service_context before the service call fires, so a hit
            # here is a reliable match (high confidence).
            # We deliberately do NOT fall back to ctx.parent_id to avoid
            # misclassifying ESPHome physical presses as prior HA actions.
            owner = None
            if ctx:
                owner = self._cache.get(ctx.id)

            if owner:
                # A confirmed HA-originated action matched this context ID.
                # Two sub-cases based on the cached type:
                #
                # (a) STATE_UI: a dashboard toggle cached by _record_service_context.
                #     This is a genuine user action. On bleed platforms, ESPHome
                #     reuses the same context ID for physical presses in the bleed
                #     window  -  a "seen" flag distinguishes the first (genuine, HIGH)
                #     from subsequent hits (bled physical press, LOW).
                #
                # (b) automation/script/scene: always HIGH confidence. ESPHome
                #     bleed only affects UI-originated contexts (user_id present),
                #     handled by the STATE_UI seen flag above. Script/automation
                #     context IDs are not confirmed to be reused by ESPHome.
                #
                # All cache hits are HIGH on non-bleed platforms.
                if owner["type"] == STATE_UI:
                    p_id, p_name, is_service_account = await self._get_person_cached(owner["id"])
                    # On bleed platforms, ESPHome reuses the same context ID for
                    # physical presses during the bleed window. The first time we
                    # see this context ID it is the genuine dashboard action -> HIGH.
                    # Subsequent hits with the same context ID are bled physical
                    # presses -> LOW. We track this with a "seen" flag on the cache
                    # entry. On non-bleed platforms every context ID is unique so
                    # we always classify HIGH.
                    already_seen = owner.get("seen", False)
                    owner["seen"] = True
                    self._confidence = CONFIDENCE_LOW if (is_bleed and already_seen) else CONFIDENCE_HIGH
                    self._state = STATE_SERVICE if is_service_account else STATE_UI
                    self._source_type = SOURCE_TYPE_SERVICE if is_service_account else SOURCE_TYPE_USER
                    self._source_id = owner["id"] if is_service_account else (p_id or owner["id"])
                    self._source_name = p_name
                else:
                    # automation/script/scene: always HIGH confidence on a direct
                    # cache hit. The cache-age bleed check that was previously here
                    # has been removed  -  ESPHome bleed only affects UI-originated
                    # contexts (those carrying user_id from a dashboard action), which
                    # are handled by the STATE_UI "seen" flag above. Script and
                    # automation context IDs are never confirmed to be reused by
                    # ESPHome, and the age check was causing fast-executing scripts
                    # to be incorrectly classified as LOW confidence.
                    self._confidence = CONFIDENCE_HIGH
                    self._state = owner["type"]
                    self._source_type = owner["type"]
                    self._source_id = owner["id"]
                    self._source_name = owner["name"]

            elif ctx and ctx.user_id:
                # Step 2: No cache hit, but a user_id is present on the context.
                # Resolve the user to determine whether this is a human (Dashboard/UI)
                # or a service account (Node-RED, AppDaemon, etc.).
                #
                # On ESPHome (bleed platform), genuine dashboard actions are caught
                # by Step 1 via the cached call_service event. Reaching Step 2 with
                # a user_id is an edge case (e.g. service event arrived out of order).
                # Classify HIGH  -  we have a definitive user_id and no bleed signal.
                p_id, p_name, is_service_account = await self._get_person_cached(ctx.user_id)

                if is_service_account:
                    # A real HA user with no linked person entity - this is a
                    # service account tool (Node-RED, AppDaemon, custom script, etc.).
                    # source_name carries the HA username so the user can identify
                    # which tool caused the trigger.
                    self._confidence = CONFIDENCE_HIGH
                    self._state = STATE_SERVICE
                    self._source_type = SOURCE_TYPE_SERVICE
                    self._source_id = ctx.user_id
                    self._source_name = p_name
                else:
                    # A human user acting via the dashboard or app.
                    self._confidence = CONFIDENCE_HIGH
                    self._state = STATE_UI
                    self._source_type = SOURCE_TYPE_USER
                    self._source_id = p_id or ctx.user_id
                    self._source_name = p_name

            elif ctx and ctx.parent_id:
                # Step 3: The context has a parent_id but neither the context ID
                # nor the parent_id was a direct cache hit in Step 1. This means
                # HA was involved in a chain (e.g. automation -> script -> entity)
                # but the immediate context wasn't cached.
                #
                # We make one attempt to resolve the chain by looking up the
                # parent_id in the cache. This catches the common pattern of
                # automation -> script -> entity, where the script's context ID
                # (the parent) was cached by _record_logic_trigger even though
                # the resulting service call's context ID (the child) was not.
                #
                # If the parent is found -> we can identify the source -> HIGH.
                # If the parent is also missing -> source unknown -> MEDIUM.
                #
                # We do not walk further up the chain (grandparent etc.) because
                # we only have the parent_id from the current event  -  we do not
                # have the parent's own parent_id without it being in our cache.
                parent_owner = self._cache.get(ctx.parent_id)
                if parent_owner:
                    # Parent context resolved  -  we know the real source.
                    # Always HIGH confidence: the child context ID (ctx.id) is a
                    # fresh unique ID generated by HA for the service call. ESPHome
                    # bleed only affects the most recently received HA context, which
                    # is the parent (ctx.parent_id)  -  not the child. A physical
                    # press would reuse the parent context ID directly and be caught
                    # by Step 1, not reach Step 3. So the cache-age bleed check that
                    # applies to direct Step 1 hits does not apply here.
                    self._confidence = CONFIDENCE_HIGH
                    self._state = parent_owner["type"]
                    self._source_type = parent_owner["type"]
                    self._source_id = parent_owner["id"]
                    self._source_name = parent_owner["name"]
                else:
                    # Parent also not in cache  -  HA was involved but we cannot
                    # identify the specific source. MEDIUM confidence: we know the
                    # type (automation chain) but not the identity.
                    self._confidence = CONFIDENCE_MEDIUM
                    self._state = STATE_AUTOMATION
                    self._source_type = STATE_AUTOMATION
                    self._source_id = ID_INDIRECT_AUTOMATION
                    self._source_name = NAME_INDIRECT_AUTOMATION

            else:
                # Step 4: No user, no parent, no cache hit. The change originated
                # directly from the device with no HA involvement whatsoever.
                # Physical button presses, remotes, and device-internal events
                # all land here  -  collectively classified as "device".
                # High confidence: no HA context means no HA cause.
                self._confidence = CONFIDENCE_HIGH
                self._state = STATE_DEVICE
                self._source_type = SOURCE_TYPE_DEVICE
                self._source_name = NAME_DEVICE
                self._source_id = self._target_entity

            # Only record user_id when the trigger was a UI action; clear it otherwise.
            self._user_id = ctx.user_id if ctx and self._state == STATE_UI else USER_ID_DEFAULT

            # Record the classification timestamp and which context ID matched
            # (if any). Used by _build_cache_debug to filter the cache snapshot
            # to only entries that existed at classification time, and to flag
            # the entry that was actually responsible for this classification.
            self._last_classification_time = time.time()
            self._last_matched_context_id = (
                ctx.id if ctx and self._cache.get(ctx.id) else
                ctx.parent_id if ctx and self._cache.get(ctx.parent_id) else
                None
            )

            # Append this event to the history log (newest entries at the front).
            # The deque enforces maxlen automatically, dropping the oldest entry.
            self._history_log.appendleft({
                ATTR_EVENT_TIME: self._event_time,
                ATTR_SOURCE_TYPE: self._source_type,
                ATTR_SOURCE_ID: self._source_id,
                ATTR_SOURCE_NAME: self._source_name,
                ATTR_CONFIDENCE: self._confidence,
                ATTR_CONTEXT_ID: self._context_id,
            })

            # Push the updated state and attributes to HA.
            self.async_write_ha_state()

            # Fire the whodunnit_trigger_detected event on the HA event bus.
            #
            # This gives automations a reliable trigger that fires on every
            # classification, including when the sensor state value does not
            # change between consecutive events (e.g. the same script runs
            # twice in a row, or a light is toggled on then off). In those
            # cases the sensor's native_value stays the same and a standard
            # state trigger would not fire  -  but this event always fires.
            #
            # The payload mirrors the sensor attributes so automations can
            # read all classification data directly from trigger.event.data
            # without needing to look up sensor attributes separately.
            self.hass.bus.async_fire(
                EVENT_TRIGGER_DETECTED,
                {
                    "entity_id":   self._target_entity,
                    "state":       self._state,
                    "source_type": self._source_type,
                    "source_id":   self._source_id,
                    "source_name": self._source_name,
                    "confidence":  self._confidence,
                    "context_id":  self._context_id,
                    "event_time":  self._event_time,
                },
            )

        except Exception:
            _LOGGER.exception("Whodunnit: unexpected error in _handle_change")

    def _get_friendly(self, entity_id):
        """Return the friendly name for an entity, or a title-cased slug fallback.

        Used when populating the cache with human-readable source names for
        automations, scripts, and scenes.
        """
        state = self.hass.states.get(entity_id)
        return (
            state.attributes.get("friendly_name", entity_id.split(".")[-1].replace("_", " ").title())
            if state else entity_id
        )

    def _build_cache_debug(self) -> dict:
        """Build a diagnostic snapshot focused on the last classification.

        Called by extra_state_attributes on every state read. Returns a dict
        visible on the entity's detail page under the cache_debug attribute.

        The context cache is global  -  it contains entries for all automations,
        scripts, scenes and UI actions across the entire HA system, not just
        those related to this tracked entity. We cannot filter by entity at
        cache-write time because we don't know which automation will eventually
        affect which entity. Dumping the full cache therefore produces noise from
        unrelated system activity.

        Instead this method shows only what is directly meaningful:
          - The matched entry: the cache entry that caused the last classification,
            if any. Present for automation/script/scene/UI events, absent for
            physical presses (Step 4) which produce no cache entry by design.
          - The total cache size: gives a sense of system activity level without
            exposing unrelated entry details.

        This directly answers the most common diagnostic question: "why was my
        event classified as Physical?" If matched_entry is null, the answer is
        confirmed  -  no relevant context was cached when the state change arrived,
        so the detection cascade correctly fell through to Step 4 (Physical).

        Returns a dict with:
          last_classification_ago - seconds since the last classification
          total_cache_entries     - total entries in cache (all entities/domains)
          matched_entry           - the cache entry that matched, or null if none
            type                  - "ui", "automation", "script", "scene"
            source_id             - entity or user ID of the cached source
            context_id            - last 8 chars of the matched context ID
            age_at_match_seconds  - how old the entry was when it matched
            seen                  - (UI entries only) True if bleed was detected
        """
        now = time.time()
        elapsed = now - self._last_classification_time

        matched_entry = None
        if self._last_matched_context_id:
            entry = self._cache.get(self._last_matched_context_id)
            if entry:
                age_at_match = (now - entry.get("timestamp", now)) - elapsed
                matched_entry = {
                    "type":                 entry.get("type", "unknown"),
                    "source_id":            entry.get("id", ""),
                    "context_id":           self._last_matched_context_id[-8:],
                    "age_at_match_seconds": round(max(age_at_match, 0.0), 1),
                }
                if entry.get("type") == STATE_UI:
                    matched_entry["seen"] = entry.get("seen", False)

        return {
            "last_classification_ago": round(elapsed, 1),
            "total_cache_entries":     len(self._cache),
            "matched_entry":           matched_entry,
        }

    async def _get_person_cached(self, user_id):
        """Resolve a HA user ID to a person entity ID, display name, and account type.

        Auth lookups (hass.auth.async_get_user) are relatively expensive. Results
        are cached in self._user_cache (shared across sensors in this entry) so
        that repeated actions by the same user only incur the lookup cost once.

        Returns a tuple of (person_entity_id, display_name, is_service_account).

        person_entity_id may be None if the user has no associated person entity.

        is_service_account is True when the user_id resolves to a real HA user
        but no person.* entity is linked to them. This is the fingerprint for
        service account users such as Node-RED, AppDaemon, or any other tool
        that authenticates via a dedicated HA user rather than a human account.
        It is False for genuine human users (who always have a person entity)
        and also False for unresolvable user IDs.
        """
        if user_id in self._user_cache:
            return self._user_cache[user_id]

        # Look up the HA auth user record for the display name.
        user = await self.hass.auth.async_get_user(user_id)
        name = user.name if user else NAME_UNKNOWN_USER
        p_id = None

        # Try to find a person entity linked to this user ID. Person entities
        # carry a user_id attribute that matches the HA auth user. Finding one
        # confirms this is a genuine human user.
        for eid in self.hass.states.async_entity_ids("person"):
            s = self.hass.states.get(eid)
            if s and s.attributes.get("user_id") == user_id:
                p_id = eid
                # Prefer the person entity's friendly_name over the auth user name.
                name = s.attributes.get("friendly_name", name)
                break

        # A real HA user with no linked person entity is a service account.
        # An unresolvable user_id (user is None) is treated as human/unknown
        # since we have no evidence either way.
        is_service_account = user is not None and p_id is None

        result = (p_id, name, is_service_account)
        self._user_cache[user_id] = result
        return result