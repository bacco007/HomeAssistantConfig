"""Platform for sensor integration."""

from datetime import datetime

from homeassistant import config_entries
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import (
    DEGREE,
    UnitOfLength,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_ICAO_ID, DOMAIN
from .coordinator import AviationWeatherCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: config_entries.ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""

    config = config_entry.data
    coordinator: AviationWeatherCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    icao_id = config.get(CONF_ICAO_ID)

    raw_sensor = RawMetarSensor(icao_id, coordinator)
    timestamp_sensor = TimestampMetarSensor(icao_id, coordinator)
    altimeter_sensor = AltimeterMetarSensor(icao_id, coordinator)
    temperature_sensor = TemperatureMetarSensor(icao_id, coordinator)
    dewpoint_sensor = DewpointMetarSensor(icao_id, coordinator)
    flightrules_sensor = FlightRulesMetarSensor(icao_id, coordinator)
    visability_sensor = VisibilityMetarSensor(icao_id, coordinator)
    windspeed_sensor = WindSpeedMetarSensor(icao_id, coordinator)
    winddirection_sensor = WindDirectionMetarSensor(icao_id, coordinator)

    async_add_entities(
        [
            raw_sensor,
            timestamp_sensor,
            altimeter_sensor,
            temperature_sensor,
            dewpoint_sensor,
            flightrules_sensor,
            visability_sensor,
            windspeed_sensor,
            winddirection_sensor,
        ]
    )


class BaseAviationWeatherSensor(CoordinatorEntity, SensorEntity):
    """Base class for aviation weather sensors."""

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._icao_id = icao_id

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._icao_id)},
            name=self._icao_id,
            manufacturer="AVWX",
            entry_type=DeviceEntryType.SERVICE,
        )


class RawMetarSensor(BaseAviationWeatherSensor):
    """Representation of a raw METAR sensor."""

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_raw"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_raw"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "raw"

    @property
    def native_value(self) -> str:
        """Return the state of the sensor."""
        return self.coordinator.data.raw


class TimestampMetarSensor(BaseAviationWeatherSensor):
    """Representation of a time METAR sensor."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_time"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_time"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "time"

    @property
    def native_value(self) -> datetime | None:
        """Return the state of the sensor."""
        return self.coordinator.data.time.dt


class AltimeterMetarSensor(BaseAviationWeatherSensor):
    """Representation of an altimeter METAR sensor."""

    _attr_device_class = SensorDeviceClass.ATMOSPHERIC_PRESSURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfPressure.HPA

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_altimeter"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_altimeter"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "altimeter"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        if self.coordinator.data.altimeter is None:
            return None
        if self.coordinator.units.altimeter is not None:
            self._attr_native_unit_of_measurement = self.coordinator.units.altimeter

        return self.coordinator.data.altimeter.value or None


class TemperatureMetarSensor(BaseAviationWeatherSensor):
    """Representation of an temperature METAR sensor."""

    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_temperature"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_temperature"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "temperature"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        return self.coordinator.data.temperature.value or None


class DewpointMetarSensor(BaseAviationWeatherSensor):
    """Representation of an dewpoint METAR sensor."""

    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_dewpoint"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_dewpoint"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "dewpoint"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        return self.coordinator.data.dewpoint.value or None


class WindSpeedMetarSensor(BaseAviationWeatherSensor):
    """Representation of an wind_speed METAR sensor."""

    _attr_native_unit_of_measurement = UnitOfSpeed.KNOTS
    _attr_device_class = SensorDeviceClass.WIND_SPEED
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_wind_speed"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_wind_speed"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "wind speed"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        return self.coordinator.data.wind_speed.value or None


class WindDirectionMetarSensor(BaseAviationWeatherSensor):
    """Representation of an wind_direction METAR sensor."""

    _attr_native_unit_of_measurement = DEGREE
    _attr_device_class = SensorDeviceClass.WIND_DIRECTION
    _attr_state_class = SensorStateClass.MEASUREMENT_ANGLE

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_wind_direction"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_wind_direction"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "wind direction"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        return self.coordinator.data.wind_direction.value or None


class FlightRulesMetarSensor(BaseAviationWeatherSensor):
    """Representation of an flight_rules METAR sensor."""

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_flight_rules"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_flight_rules"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "flight rules"

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        return self.coordinator.data.flight_rules or None


class VisibilityMetarSensor(BaseAviationWeatherSensor):
    """Representation of an visibility METAR sensor."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.METERS

    def __init__(self, icao_id: str, coordinator: AviationWeatherCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(icao_id, coordinator)
        self.entity_id = f"sensor.{DOMAIN}_{icao_id.lower()}_visibility"
        self._attr_unique_id = f"{DOMAIN}_{icao_id.lower()}_visibility"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "visability"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        if self.coordinator.data.visibility is None:
            return None
        if self.coordinator.units.visibility is not None:
            if self.coordinator.units.visibility == "m":
                self._attr_native_unit_of_measurement = UnitOfLength.METERS
            else:
                self._attr_native_unit_of_measurement = UnitOfLength.MILES

        return self.coordinator.data.visibility.value
