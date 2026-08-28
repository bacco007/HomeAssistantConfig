"""Health Bridge sensor platform (unit-safe, enum-safe)."""
from __future__ import annotations

import logging
import math
from datetime import datetime
from typing import Any, Dict

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import StateType

from .const import DOMAIN, METRIC_ATTRIBUTES_MAP

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
