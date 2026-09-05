"""Health Bridge sensor platform (unit-safe, enum-safe)."""
from __future__ import annotations

import logging
import math
from collections.abc import Collection
from datetime import datetime
from typing import Any, Dict

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorEntity,
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.util import slugify

from .const import DOMAIN, METRIC_ATTRIBUTES_MAP
from .phone_assistant import (
    PALGroupPolicyState,
    PALScreenTimeState,
    get_or_create_policy,
    get_or_create_screen_time,
    parse_pal_unique_id,
)
from .phone_assistant_entity import pal_device_info, pal_migrate_entity_name

_LOGGER = logging.getLogger(__name__)
_CLOCK_TIME_KEYS = {"asleep_time", "wake_time"}

# Attributes that must NOT be re-imported as custom attributes when restoring a
# previous state: HA-managed keys plus attributes we recompute ourselves.
_RESTORE_SKIP_ATTRS = {
    "unit_of_measurement", "device_class", "state_class", "friendly_name",
    "icon", "attribution", "supported_features", "recorded_at",
    "seconds_since_midnight", "formatted_time", "recorded_local_time",
}


def _user_id_from_device_id(dev_reg, device_id: str | None) -> str | None:
    """Recover the Health Bridge user_id from a device's identifiers."""
    if not device_id:
        return None
    device = dev_reg.async_get(device_id)
    if device is None:
        return None
    for domain, identifier in device.identifiers:
        if domain == DOMAIN and identifier.startswith("health_bridge_"):
            return identifier.removeprefix("health_bridge_")
    return None


async def async_setup_platform(hass: HomeAssistant, config, async_add_entities, discovery_info=None):
    """Set up the Health Bridge sensor platform (YAML flow)."""
    # Entities are created dynamically via webhook/services; nothing to do here.
    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
):
    """Set up Health Bridge sensors from a config entry."""

    if entry.data.get("app_type") == "phone_assistant_link":
        _setup_pal_status_sensors(hass, async_add_entities)
        _setup_pal_usage_sensors(hass, async_add_entities)
        _setup_pal_extensions_used_sensors(hass, async_add_entities)
        _setup_pal_screen_time_sensors(hass, async_add_entities)
        return True

    # Keep an index of live entity objects so webhook can update them directly.
    hass.data.setdefault(DOMAIN, {})
    entity_index: Dict[str, Dict[str, "HealthBridgeSensor"]] = hass.data[DOMAIN].setdefault(
        "entity_objs", {}
    )

    @callback
    def async_add_sensor(
        user_id: str,
        metric_name: str,
        attributes: Dict[str, Any],
        latest_value: StateType,
        recorded_at: str | None = None,
        extra_attributes: Dict[str, Any] | None = None,
    ):
        """Create a sensor entity for a metric/user."""
        entity = HealthBridgeSensor(
            user_id=user_id,
            metric_name=metric_name,
            attributes=attributes,
            value=latest_value,
            config_entry_id=entry.entry_id,
            recorded_at=recorded_at,
            extra_attributes=extra_attributes,
        )
        async_add_entities([entity], True)
        # index for fast updates
        entity_index.setdefault(user_id, {})[metric_name] = entity

    @callback
    def update_sensor(
        user_id: str,
        metric_name: str,
        value: StateType,
        recorded_at: str | None = None,
        extra_attributes: Dict[str, Any] | None = None,
    ):
        """Update an existing sensor entity if present."""
        ent = entity_index.get(user_id, {}).get(metric_name)
        if ent is not None and ent.hass is None:
            # Zombie entity: it was detached from Home Assistant (e.g. a config-
            # entry reload during an upgrade) but is still cached in entity_objs,
            # which persists across reloads. Calling update_state on it raises
            # "Attribute hass is None" and fails the whole webhook request. Evict
            # the stale object and recreate a live one so the value actually
            # lands instead of crashing (this was dropping every workout sync).
            _LOGGER.warning(
                "Health Bridge: recreating detached sensor %s/%s (hass was None)",
                user_id,
                metric_name,
            )
            entity_index.get(user_id, {}).pop(metric_name, None)
            attrs = METRIC_ATTRIBUTES_MAP.get(metric_name, {}).copy()
            if "native_unit_of_measurement" not in attrs and "unit_of_measurement" in attrs:
                attrs["native_unit_of_measurement"] = attrs["unit_of_measurement"]
            async_add_sensor(user_id, metric_name, attrs, value, recorded_at, extra_attributes)
            return
        if ent:
            ent.update_state(value, recorded_at, extra_attributes)
        else:
            _LOGGER.debug(
                "Health Bridge: update_sensor skipped for %s/%s (entity not created yet)",
                user_id,
                metric_name,
            )

    # expose callbacks for webhook/services
    hass.data[DOMAIN]["add_sensor"] = async_add_sensor
    hass.data[DOMAIN]["update_sensor"] = update_sensor

    # Recreate previously-registered sensors on startup so their last values
    # restore immediately (via RestoreSensor) instead of showing unavailable
    # until the next webhook. Also repopulates the index maps so later webhooks
    # reuse these entities rather than creating duplicates.
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    entities_map: Dict[str, Dict[str, str]] = hass.data[DOMAIN].setdefault("entities", {})
    restored: list[HealthBridgeSensor] = []

    # Discover by platform (always set), NOT by config-entry: entries created
    # dynamically by the webhook historically lacked a config_entry_id, so
    # async_entries_for_config_entry would miss them.
    for reg_entry in list(ent_reg.entities.values()):
        if reg_entry.platform != DOMAIN or reg_entry.domain != "sensor" or reg_entry.disabled:
            continue
        user_id = _user_id_from_device_id(dev_reg, reg_entry.device_id)
        if not user_id:
            continue
        metric_name = reg_entry.unique_id.removeprefix(f"{DOMAIN}_").removesuffix(f"_{user_id}")
        if not metric_name or metric_name == reg_entry.unique_id:
            continue
        if metric_name in entity_index.get(user_id, {}):
            continue  # already live

        attrs = METRIC_ATTRIBUTES_MAP.get(metric_name, {}).copy()
        if "native_unit_of_measurement" not in attrs and "unit_of_measurement" in attrs:
            attrs["native_unit_of_measurement"] = attrs["unit_of_measurement"]

        entity = HealthBridgeSensor(
            user_id=user_id,
            metric_name=metric_name,
            attributes=attrs,
            value=None,
            config_entry_id=entry.entry_id,
        )
        entity_index.setdefault(user_id, {})[metric_name] = entity
        entities_map.setdefault(user_id, {})[metric_name] = reg_entry.entity_id
        restored.append(entity)

    if restored:
        async_add_entities(restored)
        _LOGGER.debug("Health Bridge: recreated %d sensor(s) on startup", len(restored))

    return True


class HealthBridgeSensor(RestoreSensor):
    """Representation of a Health Bridge sensor.

    Uses RestoreSensor so the last native value + custom attributes survive a
    Home Assistant restart until the next webhook arrives.
    """

    _attr_has_entity_name = True  # Let HA manage friendly_name

    def __init__(
        self,
        user_id: str,
        metric_name: str,
        attributes: Dict[str, Any],
        value: StateType,
        config_entry_id: str,
        recorded_at: str | None = None,
        extra_attributes: Dict[str, Any] | None = None,
    ):
        self._user_id = user_id
        self._metric_name = metric_name
        self._config_entry_id = config_entry_id
        self._value = value
        # Arbitrary state attributes supplied by the webhook (e.g. workout fields).
        self._extra_attributes: Dict[str, Any] = dict(extra_attributes) if extra_attributes else {}

        # --- Coerce device_class/state_class (strings from const.py -> Enums), safe on older HA
        dc = attributes.get("device_class")
        sc = attributes.get("state_class")

        if isinstance(dc, str):
            try:
                self._attr_device_class = SensorDeviceClass(dc)
            except Exception:
                # Unknown/legacy device_class; leave None
                self._attr_device_class = None
        else:
            self._attr_device_class = dc  # already enum or None

        if isinstance(sc, str):
            try:
                self._attr_state_class = SensorStateClass(sc)
            except Exception:
                self._attr_state_class = None
        else:
            self._attr_state_class = sc  # already enum or None
        # --- end coercion

        # Use native unit so HA can auto-convert to user settings.
        self._attr_native_unit_of_measurement = (
            attributes.get("native_unit_of_measurement")
            or attributes.get("unit_of_measurement")
        )
        self._attr_icon = attributes.get("icon")
        self._attr_suggested_display_precision = attributes.get(
            "suggested_display_precision"
        )

        # Identity (stable IDs)
        self._attr_unique_id = f"{DOMAIN}_{metric_name}_{user_id}"
        self._attr_name = f"{metric_name.replace('_', ' ').title()} ({user_id})"
        self._set_state_metadata(recorded_at)

        # Device grouping
        device_id = f"health_bridge_{user_id}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name=f"Health Bridge ({user_id})",
            manufacturer="Health Bridge",
            model="Health Tracker",
            sw_version="1.0",
        )

    async def async_added_to_hass(self) -> None:
        """Restore the last value/attributes after a restart if we don't have a
        live value yet (i.e. this entity was recreated on startup, not from a
        fresh webhook)."""
        await super().async_added_to_hass()
        if self._value is not None:
            return

        last_data = await self.async_get_last_sensor_data()
        if last_data is not None and last_data.native_value is not None:
            value = last_data.native_value
            # Drop corrupted non-finite floats rather than surfacing them.
            if isinstance(value, float) and not math.isfinite(value):
                value = None
            self._value = value

        recorded_at = None
        last_state = await self.async_get_last_state()
        if last_state is not None:
            recorded_at = last_state.attributes.get("recorded_at")
            restored = {
                k: v for k, v in last_state.attributes.items()
                if k not in _RESTORE_SKIP_ATTRS
            }
            if restored and not self._extra_attributes:
                self._extra_attributes = restored

        if self._value is not None:
            self._set_state_metadata(recorded_at)
            self.async_write_ha_state()

    @property
    def native_value(self) -> StateType:
        """Return the native (device) value. No human formatting here."""
        if self._metric_name in _CLOCK_TIME_KEYS:
            return self._timestamp_state_value()
        return self._value

    @callback
    def update_state(
        self,
        value: StateType,
        recorded_at: str | None = None,
        extra_attributes: Dict[str, Any] | None = None,
    ) -> None:
        """Update from webhook/service and write state."""
        # Keep raw numeric values; conversions/normalization happen upstream in __init__.py
        if self._metric_name in ("walking_speed", "stair_ascent_speed", "stair_descent_speed"):
            try:
                value = float(value)
            except (TypeError, ValueError):
                _LOGGER.debug(
                    "Health Bridge: %s update received non-numeric %r",
                    self._metric_name,
                    value,
                )

        if extra_attributes is not None:
            self._extra_attributes = dict(extra_attributes)

        self._value = value
        self._set_state_metadata(recorded_at)
        # Backstop: never write state on an entity that isn't currently added to
        # Home Assistant (hass is None) — it raises RuntimeError and fails the
        # webhook. update_sensor evicts/recreates detached entities; this guards
        # any other path that might hold a stale reference.
        if self.hass is None:
            _LOGGER.debug(
                "Health Bridge: skipped state write for detached %s (hass is None)",
                self._metric_name,
            )
            return
        self.async_write_ha_state()

    def _set_state_metadata(self, recorded_at: str | None) -> None:
        """Store auxiliary state metadata from the payload."""
        attrs: dict[str, Any] = dict(self._extra_attributes)
        if recorded_at:
            attrs["recorded_at"] = recorded_at

        if self._metric_name in _CLOCK_TIME_KEYS:
            attrs["seconds_since_midnight"] = self._value
            attrs["formatted_time"] = _format_seconds_since_midnight(self._value)
            if recorded_at:
                attrs["recorded_local_time"] = _format_iso_to_local_clock(recorded_at)

        self._attr_extra_state_attributes = attrs or None

    def _timestamp_state_value(self) -> StateType:
        """Return the payload timestamp for clock-boundary metrics."""
        recorded_at = None
        if self._attr_extra_state_attributes:
            recorded_at = self._attr_extra_state_attributes.get("recorded_at")
        if not recorded_at:
            return None

        try:
            return datetime.fromisoformat(recorded_at.replace("Z", "+00:00"))
        except ValueError:
            _LOGGER.debug(
                "Health Bridge: invalid timestamp for %s: %r",
                self._metric_name,
                recorded_at,
            )
            return None


def _format_seconds_since_midnight(value: StateType) -> str | StateType:
    """Format seconds since local midnight as a clock time."""
    try:
        total_seconds = int(float(value))
    except (TypeError, ValueError):
        return value

    total_seconds %= 24 * 60 * 60
    hours, remainder = divmod(total_seconds, 3600)
    minutes, _seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}"


def _format_iso_to_local_clock(value: str) -> str:
    """Format an ISO timestamp to local wall-clock time when possible."""
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return value
    return dt.astimezone().strftime("%H:%M")


_PAL_STATUS_PREFIX = f"{DOMAIN}_pal_restriction_status_"


def _setup_pal_status_sensors(
    hass: HomeAssistant, async_add_entities: AddEntitiesCallback
) -> None:
    """Add PAL status sensors without changing HAL metric sensor behavior."""
    entities: dict[str, PALRestrictionStatusSensor] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALRestrictionStatusSensor:
        entity = entities.get(policy.key)
        if entity is None:
            entity = PALRestrictionStatusSensor(policy)
            entities[policy.key] = entity
            async_add_entities([entity], True)
        pal_migrate_entity_name(
            hass, policy, "sensor", entity.unique_id, "restriction_status"
        )
        return entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for key, entity in list(entities.items()):
            if entity.policy.user_id != user_id or entity.policy.group_id in active_ids:
                continue
            entity_id = entity.entity_id
            await entity.async_remove()
            if entity_id and registry.async_get(entity_id):
                registry.async_remove(entity_id)
            entities.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_status_sensor"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_status_sensors"] = remove_missing

    restored: list[PALRestrictionStatusSensor] = []
    for item in list(er.async_get(hass).entities.values()):
        if item.platform != DOMAIN or item.domain != "sensor" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, _PAL_STATUS_PREFIX)
        if parsed is None:
            continue
        policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
        if policy.key not in entities:
            entity = PALRestrictionStatusSensor(policy)
            entities[policy.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALRestrictionStatusSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Restriction Status"
    _attr_icon = "mdi:shield-lock-outline"

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_icon = policy.icon
        self._attr_unique_id = (
            f"{_PAL_STATUS_PREFIX}{policy.user_id}_{policy.group_id}"
        )
        self._attr_device_info = pal_device_info(policy)

    @property
    def native_value(self) -> str:
        return self.policy.restriction_status

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {
            "effective_blocked": self.policy.effective_blocked,
            "temporary_until": (
                self.policy.temporary_until.isoformat()
                if self.policy.temporary_is_active and self.policy.temporary_until
                else None
            ),
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    @callback
    def _handle_policy_update(self) -> None:
        self._attr_icon = self.policy.icon
        self.async_write_ha_state()


_PAL_USAGE_PREFIX = f"{DOMAIN}_pal_usage_today_"


def _setup_pal_usage_sensors(
    hass: HomeAssistant, async_add_entities: AddEntitiesCallback
) -> None:
    """Add a privacy-preserving usage sensor for each PAL app group."""
    entities: dict[str, PALUsageTodaySensor] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALUsageTodaySensor:
        entity = entities.get(policy.key)
        if entity is None:
            entity = PALUsageTodaySensor(policy)
            entities[policy.key] = entity
            async_add_entities([entity], True)
        pal_migrate_entity_name(
            hass, policy, "sensor", entity.unique_id, "used_today"
        )
        return entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for key, entity in list(entities.items()):
            if entity.policy.user_id != user_id or entity.policy.group_id in active_ids:
                continue
            entity_id = entity.entity_id
            await entity.async_remove()
            if entity_id and registry.async_get(entity_id):
                registry.async_remove(entity_id)
            entities.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_usage_sensor"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_usage_sensors"] = remove_missing

    restored: list[PALUsageTodaySensor] = []
    for item in list(er.async_get(hass).entities.values()):
        if item.platform != DOMAIN or item.domain != "sensor" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, _PAL_USAGE_PREFIX)
        if parsed is None:
            continue
        policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
        if policy.key not in entities:
            entity = PALUsageTodaySensor(policy)
            entities[policy.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALUsageTodaySensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Used Today"
    _attr_icon = "mdi:timer-outline"
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_icon = policy.icon
        self._attr_unique_id = (
            f"{_PAL_USAGE_PREFIX}{policy.user_id}_{policy.group_id}"
        )
        self._attr_device_info = pal_device_info(policy)

    @property
    def native_value(self) -> int:
        return self.policy.usage_today_minutes

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {"precision_minutes": 15}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    @callback
    def _handle_policy_update(self) -> None:
        self._attr_icon = self.policy.icon
        self.async_write_ha_state()


_PAL_EXTENSIONS_USED_PREFIX = f"{DOMAIN}_pal_extensions_used_today_"


def _setup_pal_extensions_used_sensors(
    hass: HomeAssistant, async_add_entities: AddEntitiesCallback
) -> None:
    """Add an 'extensions used today' sensor for each PAL app group."""
    entities: dict[str, PALExtensionsUsedTodaySensor] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALExtensionsUsedTodaySensor:
        entity = entities.get(policy.key)
        if entity is None:
            entity = PALExtensionsUsedTodaySensor(policy)
            entities[policy.key] = entity
            async_add_entities([entity], True)
        pal_migrate_entity_name(
            hass, policy, "sensor", entity.unique_id, "extensions_used_today"
        )
        return entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for key, entity in list(entities.items()):
            if entity.policy.user_id != user_id or entity.policy.group_id in active_ids:
                continue
            entity_id = entity.entity_id
            await entity.async_remove()
            if entity_id and registry.async_get(entity_id):
                registry.async_remove(entity_id)
            entities.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_extensions_used_sensor"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_extensions_used_sensors"] = remove_missing

    restored: list[PALExtensionsUsedTodaySensor] = []
    for item in list(er.async_get(hass).entities.values()):
        if item.platform != DOMAIN or item.domain != "sensor" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, _PAL_EXTENSIONS_USED_PREFIX)
        if parsed is None:
            continue
        policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
        if policy.key not in entities:
            entity = PALExtensionsUsedTodaySensor(policy)
            entities[policy.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALExtensionsUsedTodaySensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Extensions Used Today"
    _attr_icon = "mdi:timer-plus-outline"
    _attr_native_unit_of_measurement = "extensions"
    _attr_state_class = SensorStateClass.TOTAL_INCREASING

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_unique_id = (
            f"{_PAL_EXTENSIONS_USED_PREFIX}{policy.user_id}_{policy.group_id}"
        )
        self._attr_device_info = pal_device_info(policy)

    @property
    def native_value(self) -> int:
        return self.policy.extensions_used_today

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {
            "resets": "daily",
            "minutes_each": 15,
            "allowed_per_day": self.policy.extensions_allowed_per_day,
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    @callback
    def _handle_policy_update(self) -> None:
        self.async_write_ha_state()


_PAL_SCREEN_TIME_PREFIX = f"{DOMAIN}_pal_screen_time_"
_PAL_SCREEN_TIME_PICKUPS_PREFIX = f"{DOMAIN}_pal_screen_time_pickups_"
_PAL_ROLLED_BACK_TOTAL_ID = "00000000-0000-4000-8000-000000000002"


def _setup_pal_screen_time_sensors(
    hass: HomeAssistant, async_add_entities: AddEntitiesCallback
) -> None:
    """Add app/group usage sensors beneath one PAL Screen Time device."""
    time_entities: dict[str, PALScreenTimeSensor] = {}

    @callback
    def ensure(state: PALScreenTimeState) -> PALScreenTimeSensor:
        time_entity = time_entities.get(state.key)
        if time_entity is None:
            time_entity = PALScreenTimeSensor(state)
            time_entities[state.key] = time_entity
            async_add_entities([time_entity], True)
        _migrate_pal_screen_time_entity_name(
            hass, state, time_entity.unique_id, suffix="time"
        )
        return time_entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for key, entity in list(time_entities.items()):
            state = entity.screen_time_state
            if state.user_id != user_id or state.item_id in active_ids:
                continue
            entity_id = entity.entity_id
            await entity.async_remove()
            if entity_id and registry.async_get(entity_id):
                registry.async_remove(entity_id)
            time_entities.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_screen_time_sensor"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_screen_time_sensors"] = remove_missing

    restored: list[PALScreenTimeSensor] = []
    registry = er.async_get(hass)
    for item in list(registry.entities.values()):
        if item.platform != DOMAIN or item.domain != "sensor" or item.disabled:
            continue
        # Remove the unsupported pickup entities from the short-lived test,
        # including their Total Screen Time counterpart.
        if item.unique_id.startswith(_PAL_SCREEN_TIME_PICKUPS_PREFIX):
            registry.async_remove(item.entity_id)
            continue
        parsed = parse_pal_unique_id(item.unique_id, _PAL_SCREEN_TIME_PREFIX)
        if parsed is None:
            continue
        if parsed[1] == _PAL_ROLLED_BACK_TOTAL_ID:
            registry.async_remove(item.entity_id)
            continue
        state = get_or_create_screen_time(hass, parsed[0], parsed[1], "Screen Time Item")
        if state.key not in time_entities:
            entity = PALScreenTimeSensor(state)
            time_entities[state.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


def _migrate_pal_screen_time_entity_name(
    hass: HomeAssistant, state: PALScreenTimeState, unique_id: str, suffix: str
) -> None:
    desired_device_name = f"{state.user_id} — Screen Time"
    device_registry = dr.async_get(hass)
    device = next(
        (
            item
            for item in device_registry.devices.values()
            if (DOMAIN, state.device_identifier) in item.identifiers
        ),
        None,
    )
    if device is not None and device.name != desired_device_name:
        device_registry.async_update_device(device.id, name=desired_device_name)

    registry = er.async_get(hass)
    current_entity_id = registry.async_get_entity_id("sensor", DOMAIN, unique_id)
    desired_entity_id = f"sensor.{slugify(f'{state.user_id}_{state.name}_{suffix}')}"
    if (
        current_entity_id is not None
        and current_entity_id != desired_entity_id
        and registry.async_get(desired_entity_id) is None
    ):
        registry.async_update_entity(current_entity_id, new_entity_id=desired_entity_id)


class PALScreenTimeSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_icon = "mdi:timer-outline"
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, state: PALScreenTimeState) -> None:
        # ``Entity.state`` is a read-only Home Assistant property. Keeping our
        # backing model under that name raises during entity construction and
        # makes the webhook finish with an empty HTTP 200 response.
        self.screen_time_state = state
        self._attr_name = f"{state.name} Time"
        self._attr_unique_id = (
            f"{_PAL_SCREEN_TIME_PREFIX}{state.user_id}_{state.item_id}"
        )
        self._attr_suggested_object_id = slugify(
            f"{state.user_id}_{state.name}_time"
        )
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, state.device_identifier)},
            name=f"{state.user_id} — Screen Time",
            manufacturer="Life Assistant Bridge",
            model="Phone Assistant Link Screen Time",
            sw_version="1.0",
        )

    @property
    def native_value(self) -> int:
        return self.screen_time_state.usage_today_minutes

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {"precision_minutes": 15, "resets": "daily"}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.screen_time_state.add_listener(self._handle_update)

    async def async_will_remove_from_hass(self) -> None:
        self.screen_time_state.remove_listener(self._handle_update)
        await super().async_will_remove_from_hass()

    @callback
    def _handle_update(self) -> None:
        self._attr_name = f"{self.screen_time_state.name} Time"
        self.async_write_ha_state()
