"""Sensor platform for the Moon Phase integration."""

from __future__ import annotations

import logging

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    BASE_LUNAR_SENSORS,
    CONF_CITY,
    DOMAIN,
    PHASE_FIRST_QUARTER,
    PHASE_FULL_MOON,
    PHASE_LAST_QUARTER,
    PHASE_NEW_MOON,
    PHASE_WANING_CRESCENT,
    PHASE_WANING_GIBBOUS,
    PHASE_WAXING_CRESCENT,
    PHASE_WAXING_GIBBOUS,
)
from .coordinator import MoonUpdateCoordinator
from .moon import MoonCalc

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
):
    """Set up the Lunar Phase sensor platform."""

    _LOGGER.debug("Setting up Lunar Phase sensor entry: %s", entry.data["city"])
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator = data["coordinator"]
    moon_calc = data["moon_calc"]

    try:
        sensors = [MainPhaseSensor(coordinator, moon_calc, entry)]
        for sensor_name, sensor_config in BASE_LUNAR_SENSORS.items():
            sensors.append(
                AttributeSensor(
                    coordinator, moon_calc, entry, sensor_name, sensor_config
                )
            )

        async_add_entities(sensors, True)

        _LOGGER.debug(
            "Successfully set up Lunar Phase sensor entry: %s", entry.data["city"]
        )

    except Exception as err:
        _LOGGER.error("Error setting up Lunar Phase sensor: %s", err, exc_info=True)  # noqa: G201


class MainPhaseSensor(CoordinatorEntity[MoonUpdateCoordinator], SensorEntity):
    """Representation of a Main Phase sensor."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = [
        PHASE_FIRST_QUARTER,
        PHASE_FULL_MOON,
        PHASE_LAST_QUARTER,
        PHASE_NEW_MOON,
        PHASE_WANING_CRESCENT,
        PHASE_WANING_GIBBOUS,
        PHASE_WAXING_CRESCENT,
        PHASE_WAXING_GIBBOUS,
    ]
    _attr_translation_key = "moon_phase"
    _attr_has_entity_name = True

    def __init__(
        self, coordinator: MoonUpdateCoordinator, moon_calc: MoonCalc, config_entry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, moon_calc)
        self._city = config_entry.data["city"]
        self.moon_calc = moon_calc
        self._attr_force_update = True
        self._attr_unique_id = f"{config_entry.entry_id}_moon_phase"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            manufacturer="Moon",
            entry_type=DeviceEntryType.SERVICE,
        )
        self._attr_has_entity_name = True

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def unique_id(self):
        """Return the unique ID of the entity."""
        return self._attr_unique_id

    @property
    def defice_info(self) -> DeviceInfo:
        """Return the device info."""
        return self._attr_device_info

    @property
    def native_value(self):
        """Return the state of the sensor."""
        return self.coordinator.data.get("moon_phase")

    @property
    def extra_state_attributes(self):
        """Return the state attributes of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        location = self.moon_calc.location
        return {**attributes, "location": location}

    @callback
    async def async_update(self):
        """Fetch new state data for the entity."""
        await self.coordinator.async_request_refresh()


class AttributeSensor(CoordinatorEntity[MoonUpdateCoordinator], SensorEntity):
    """Representation of a sensor for moon attributes."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: MoonUpdateCoordinator,
        moon_calc: MoonCalc,
        entry,
        internal_name: str,
        sensor_config,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._moon_calc = moon_calc
        self._config_entry = sensor_config
        self._internal_name = internal_name
        self._city = entry.data[CONF_CITY]
        self._state_key = self._config_entry[1]
        self._extra_state_keys = self._config_entry[6]
        self._attr_force_update = True
        self._attr_name = self._config_entry[0]
        self._attr_unique_id = f"{entry.entry_id}_{self._internal_name}"
        self._attr_translation_key = self._config_entry[1]
        self._attr_icon = self._config_entry[2]
        self._attr_device_class = self._config_entry[3]
        self._attr_state_class = self._config_entry[4]
        self._attr_native_unit_of_measurement = self._config_entry[5]
        self._attr_unit_of_measurement = self._config_entry[5]
        self._attr_suggested_display_precision = self._config_entry[7]
        self._attr_entity_category = self._config_entry[8]

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            manufacturer="Moon",
            entry_type=DeviceEntryType.SERVICE,
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return self._attr_device_info

    @property
    def unique_id(self):
        """Return the unique ID of the entity."""
        return self._attr_unique_id

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._attr_name

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return self._attr_icon

    @property
    def extra_state_attributes(self):
        """Return the state attributes of the sensor."""
        if not self._extra_state_keys:
            return {}

        attributes = self.coordinator.data.get("extra_attributes", {})
        return {key: attributes.get(key) for key in self._extra_state_keys}

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        return attributes.get(self._state_key)

    @callback
    async def async_update(self):
        """Fetch new state data for the entity."""

        await self.coordinator.async_request_refresh()
