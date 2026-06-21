"""Binary sensors for Weather Station Core."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_ENABLE_DIAGNOSTICS,
    CONF_ENABLE_NOWCAST,
    CONF_PREFIX,
    DEFAULT_ENABLE_DIAGNOSTICS,
    DEFAULT_ENABLE_NOWCAST,
    DEFAULT_PREFIX,
    DOMAIN,
    KEY_PACKAGE_OK,
    KEY_RAIN_EXPECTED_1H,
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id]
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()

    entities: list[BinarySensorEntity] = [WSPackageOK(coordinator, entry, prefix)]

    opts = {**entry.data, **entry.options}
    if opts.get(CONF_ENABLE_NOWCAST, DEFAULT_ENABLE_NOWCAST):
        entities.append(WSRainExpected1h(coordinator, entry, prefix))

    # v2.0: per-sensor problem binary sensors (gated by diagnostics toggle)
    if opts.get(CONF_ENABLE_DIAGNOSTICS, DEFAULT_ENABLE_DIAGNOSTICS):
        problem_sensors = [
            ("_temp_stuck", "temperature_stuck", "mdi:thermometer-alert"),
            ("_humidity_stuck", "humidity_stuck", "mdi:water-percent-alert"),
            ("_pressure_stuck", "pressure_stuck", "mdi:gauge-empty"),
            ("_temp_out_of_range", "temperature_out_of_range", "mdi:thermometer-off"),
            ("_humidity_out_of_range", "humidity_out_of_range", "mdi:water-alert"),
            ("_pressure_out_of_range", "pressure_out_of_range", "mdi:gauge-low"),
            ("_wind_gust_below_wind", "wind_gust_below_wind", "mdi:weather-windy-variant"),
            ("_dew_exceeds_temp", "dew_exceeds_temp", "mdi:water-thermometer"),
        ]
        for data_key, slug, icon in problem_sensors:
            entities.append(WSProblemBinarySensor(coordinator, entry, prefix, data_key, slug, icon))

    async_add_entities(entities)


class WSPackageOK(CoordinatorEntity, BinarySensorEntity):
    """True when required sources exist and are mapped."""

    def __init__(self, coordinator, entry: ConfigEntry, prefix: str):
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_package_ok"
        self._attr_suggested_object_id = f"{prefix}_package_ok"
        self._attr_has_entity_name = True
        self._attr_translation_key = "ws_package_ok"
        self._attr_icon = "mdi:check-decagram"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        desired = f"binary_sensor.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)

    @property
    def is_on(self) -> bool | None:
        d = self.coordinator.data or {}
        v = d.get(KEY_PACKAGE_OK)
        if v is None:
            return None
        return bool(v)


class WSRainExpected1h(CoordinatorEntity, BinarySensorEntity):
    """True when measurable rain is expected within the next 60 minutes."""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.MOISTURE

    def __init__(self, coordinator, entry: ConfigEntry, prefix: str):
        super().__init__(coordinator)
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{KEY_RAIN_EXPECTED_1H}"
        self._attr_suggested_object_id = f"{prefix}_rain_expected_1h"
        self._attr_translation_key = "ws_rain_expected_1h"
        self._attr_icon = "mdi:weather-rainy"

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        desired = f"binary_sensor.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)

    @property
    def is_on(self) -> bool | None:
        d = self.coordinator.data or {}
        v = d.get(KEY_RAIN_EXPECTED_1H)
        if v is None:
            return None
        return bool(v)


class WSProblemBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor that is True when a specific sensor problem is detected.  (v2.0)"""

    _attr_has_entity_name = True
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(
        self,
        coordinator,
        entry: ConfigEntry,
        prefix: str,
        data_key: str,
        slug: str,
        icon: str,
    ):
        super().__init__(coordinator)
        self._entry = entry
        self._data_key = data_key
        self._attr_unique_id = f"{entry.entry_id}_{slug}"
        self._attr_suggested_object_id = f"{prefix}_{slug}"
        self._attr_translation_key = f"ws_{slug}"
        self._attr_icon = icon
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    @property
    def is_on(self) -> bool | None:
        d = self.coordinator.data or {}
        v = d.get(self._data_key)
        if v is None:
            return False  # default to False (no problem) if key not yet computed
        return bool(v)
