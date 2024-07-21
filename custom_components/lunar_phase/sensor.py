"""Sensor platform for the Moon Phase integration."""

from datetime import datetime
import logging

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfLength, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
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
    STATE_ATTR_AGE,
    STATE_ATTR_DISTANCE_KM,
    STATE_ATTR_ILLUMINATION_FRACTION,
    STATE_ATTR_NEXT_FULL,
    STATE_ATTR_NEXT_NEW,
    STATE_ATTR_NEXT_RISE,
    STATE_ATTR_NEXT_SET,
)
from .coordinator import MoonUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
):
    """Set up Moon Phase sensor based on a config entry."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    sensors = [
        MoonPhaseSensor(coordinator, config_entry),
        MoonAgeSensor(
            coordinator,
            config_entry,
            STATE_ATTR_AGE,
            "Moon Age",
            "moon_age",
            "mdi:progress-clock",
        ),
        MoonDistanceSensor(
            coordinator,
            config_entry,
            STATE_ATTR_DISTANCE_KM,
            "Moon Distance",
            "moon_distance",
        ),
        MoonTimestampSensor(
            coordinator,
            config_entry,
            STATE_ATTR_NEXT_FULL,
            "Next Full Moon",
            "moon_next_full",
            "mdi:moon-full",
        ),
        MoonTimestampSensor(
            coordinator,
            config_entry,
            STATE_ATTR_NEXT_NEW,
            "Next New Moon",
            "moon_next_new",
            "mdi:moon-new",
        ),
        MoonTimestampSensor(
            coordinator,
            config_entry,
            STATE_ATTR_NEXT_RISE,
            "Moon Rise",
            "moon_rise",
            "mdi:weather-moonset-up",
        ),
        MoonTimestampSensor(
            coordinator,
            config_entry,
            STATE_ATTR_NEXT_SET,
            "Moon Set",
            "moon_set",
            "mdi:weather-moonset-down",
        ),
        MoonIlluminationFractionSensor(
            coordinator,
            config_entry,
            STATE_ATTR_ILLUMINATION_FRACTION,
            "Moon Illumination Fraction",
            "moon_illumination_fraction",
            "mdi:theme-light-dark",
        ),
    ]
    async_add_entities(sensors, True)
    _LOGGER.debug("Moon Phase sensors added")


class MoonPhaseSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Moon Phase sensor."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = [
        PHASE_NEW_MOON,
        PHASE_WAXING_CRESCENT,
        PHASE_FIRST_QUARTER,
        PHASE_WAXING_GIBBOUS,
        PHASE_FULL_MOON,
        PHASE_WANING_GIBBOUS,
        PHASE_LAST_QUARTER,
        PHASE_WANING_CRESCENT,
    ]
    _attr_translation_key = "moon_phase"

    def __init__(self, coordinator: MoonUpdateCoordinator, config_entry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_moon_phase"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
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
    def native_value(self) -> str:
        """Return the state of the sensor."""
        return self.coordinator.data.get("moon_phase")

    @property
    def extra_state_attributes(self) -> dict[str, any]:
        """Return the state attributes of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        return {
            STATE_ATTR_AGE: attributes.get(STATE_ATTR_AGE),
            STATE_ATTR_DISTANCE_KM: attributes.get(STATE_ATTR_DISTANCE_KM),
            STATE_ATTR_ILLUMINATION_FRACTION: attributes.get(
                STATE_ATTR_ILLUMINATION_FRACTION
            ),
            STATE_ATTR_NEXT_RISE: attributes.get(STATE_ATTR_NEXT_RISE),
            STATE_ATTR_NEXT_SET: attributes.get(STATE_ATTR_NEXT_SET),
            STATE_ATTR_NEXT_FULL: attributes.get(STATE_ATTR_NEXT_FULL),
            STATE_ATTR_NEXT_NEW: attributes.get(STATE_ATTR_NEXT_NEW),
            "location": self.coordinator.location,
        }


class MoonAttributeSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Moon Attribute sensor."""

    def __init__(
        self,
        coordinator: MoonUpdateCoordinator,
        config_entry,
        attribute,
        name,
        translation_key=None,
        icon=None,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attribute = attribute
        self._city = config_entry.data.get(CONF_CITY, "Unknown City")
        self._attr_has_entity_name = True
        self._attr_name = name
        self._attr_icon = icon
        self._attr_unique_id = f"{self._city }_{attribute}"
        self._attr_translation_key = translation_key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
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
    def name(self):
        """Return the name of the sensor."""
        return self._attr_name

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        return attributes.get(self._attribute)


class MoonTimestampSensor(MoonAttributeSensor):
    """Representation of a Moon Timestamp sensor."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        timestamp = attributes.get(self._attribute)
        if timestamp:
            return datetime.fromisoformat(timestamp)
        return None


class MoonDistanceSensor(MoonAttributeSensor):
    """Representation of a Moon Distance sensor."""

    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.KILOMETERS
    _attr_state_class = SensorStateClass.MEASUREMENT

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        return attributes.get(self._attribute)


class MoonAgeSensor(MoonAttributeSensor):
    """Representation of a Moon Age sensor."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfTime.DAYS

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        value_in_days = attributes.get(self._attribute)
        if value_in_days is not None:
            return round(value_in_days, 2)
        return None


class MoonIlluminationFractionSensor(MoonAttributeSensor):
    """Representation of a Moon Illumination Fraction sensor."""

    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_state_class = SensorStateClass.MEASUREMENT

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self):
        """Return the state of the sensor."""
        attributes = self.coordinator.data.get("attributes", {})
        return attributes.get(self._attribute)
