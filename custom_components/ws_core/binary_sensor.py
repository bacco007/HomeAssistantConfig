"""Binary sensors for Weather Station Core."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_ENABLE_NOWCAST,
    CONF_PREFIX,
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
