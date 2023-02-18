"""This component provides sensors for WeatherFlow."""
from __future__ import annotations

import logging
from dataclasses import dataclass, asdict

from homeassistant.components.sensor import (
    STATE_CLASS_MEASUREMENT,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    DEGREE,
    LIGHT_LUX,
    PERCENTAGE,
    UnitOfElectricPotential,
    UnitOfIrradiance,
    UnitOfSpeed,
    UnitOfTemperature,
    UnitOfTime,
    UV_INDEX,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import StateType

from .const import (
    ATTR_DESCRIPTION,
    CONCENTRATION_GRAMS_PER_CUBIC_METER,
    DOMAIN,
    TRANSLATION_KEY_BEAUFORT,
    TRANSLATION_KEY_PRECIP_INTENSITY,
    TRANSLATION_KEY_TREND,
    TRANSLATION_KEY_UV_DESCRIPTION,
    TRANSLATION_KEY_WIND_CARDINAL,
)
from .entity import WeatherFlowEntity
from .models import WeatherFlowEntryData


@dataclass
class WeatherFlowRequiredKeysMixin:
    """Mixin for required keys."""

    unit_type: str
    tempest_sensor: bool


@dataclass
class WeatherFlowSensorEntityDescription(
    SensorEntityDescription, WeatherFlowRequiredKeysMixin
):
    """Describes WeatherFlow Sensor entity."""


SENSOR_TYPES: tuple[WeatherFlowSensorEntityDescription, ...] = (
    WeatherFlowSensorEntityDescription(
        key="air_temperature",
        name="Air Temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="barometric_pressure",
        name="Barometric Pressure",
        device_class=SensorDeviceClass.ATMOSPHERIC_PRESSURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="pressure",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="sea_level_pressure",
        name="Sea Level Pressure",
        device_class=SensorDeviceClass.ATMOSPHERIC_PRESSURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="pressure",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="station_pressure",
        name="Station Pressure",
        device_class=SensorDeviceClass.ATMOSPHERIC_PRESSURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="pressure",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="relative_humidity",
        name="Relative Humidity",
        native_unit_of_measurement=PERCENTAGE,
        device_class=SensorDeviceClass.HUMIDITY,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="absolute_humidity",
        name="Absolute Humidity",
        icon="mdi:water",
        native_unit_of_measurement=CONCENTRATION_GRAMS_PER_CUBIC_METER,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_rate",
        name="Precipitation Rate",
        icon="mdi:weather-pouring",
        device_class=SensorDeviceClass.PRECIPITATION_INTENSITY,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation_rate",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_accum_last_1hr",
        name="Precipitation Last Hour",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_accum_local_day",
        name="Precipitation Today",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_accum_local_day_final",
        name="Precipitation Today Rain Checked",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_accum_local_yesterday",
        name="Precipitation Yesterday",
        device_class=SensorDeviceClass.PRECIPITATION,
        icon="mdi:weather-rainy",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_accum_local_yesterday_final",
        name="Precipitation Yesterday Rain Checked",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.PRECIPITATION,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_minutes_local_day",
        name="Precipitation Duration Today",
        icon="mdi:timelapse",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_minutes_local_yesterday",
        name="Precipitation Duration Yesterday",
        icon="mdi:timelapse",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_minutes_local_yesterday_final",
        name="Precipitation Duration Yesterday Rain Checked",
        icon="mdi:timelapse",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_direction",
        name="Wind Direction",
        icon="mdi:compass",
        native_unit_of_measurement=DEGREE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_avg",
        name="Wind Speed",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="length",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_gust",
        name="Wind Gust",
        icon="mdi:weather-windy",
        device_class=SensorDeviceClass.WIND_SPEED,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="length",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_lull",
        name="Wind Lull",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="length",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_avg_kmh",
        name="Wind Speed (km/h)",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KILOMETERS_PER_HOUR,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_gust_kmh",
        name="Wind Gust (km/h)",
        icon="mdi:weather-windy",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KILOMETERS_PER_HOUR,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_lull_kmh",
        name="Wind Lull (km/h)",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KILOMETERS_PER_HOUR,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_avg_knots",
        name="Wind Speed (knots)",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KNOTS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_gust_knots",
        name="Wind Gust (knots)",
        icon="mdi:weather-windy",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KNOTS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_lull_knots",
        name="Wind Lull (knots)",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.WIND_SPEED,
        native_unit_of_measurement=UnitOfSpeed.KNOTS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="beaufort",
        name="Beaufort",
        icon="mdi:windsock",
        native_unit_of_measurement="Bft",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="solar_radiation",
        name="Solar Radiation",
        icon="mdi:solar-power",
        device_class=SensorDeviceClass.IRRADIANCE,
        native_unit_of_measurement=UnitOfIrradiance.WATTS_PER_SQUARE_METER,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="uv",
        name="UV Index",
        icon="mdi:weather-sunny-alert",
        native_unit_of_measurement=UV_INDEX,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="brightness",
        name="Brightness",
        device_class=SensorDeviceClass.ILLUMINANCE,
        native_unit_of_measurement=LIGHT_LUX,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="lightning_strike_last_epoch",
        name="Last Lightning Strike",
        device_class=SensorDeviceClass.TIMESTAMP,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="lightning_strike_last_distance",
        name="Last Lightning Strike Distance",
        icon="mdi:map-marker-distance",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="distance",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="lightning_strike_count",
        name="Lightning Strike Count",
        icon="mdi:weather-lightning",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="lightning_strike_count_last_1hr",
        name="Lightning Strike Count Last Hour",
        icon="mdi:weather-lightning",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="lightning_strike_count_last_3hr",
        name="Lightning Strike Count Last 3 Hours",
        icon="mdi:weather-lightning",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="feels_like",
        name="Feels Like Temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="heat_index",
        name="Heat Index",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_chill",
        name="Wind Chill",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="dew_point",
        name="Dewpoint",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wet_bulb_temperature",
        name="Wet Bulb Temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="delta_t",
        name="Delta T",
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="temperature",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="air_density",
        name="Air Density",
        icon="mdi:air-filter",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="density",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="visibility",
        name="Visibility",
        icon="mdi:eye",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="distance",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="pressure_trend",
        name="Pressure Trend",
        icon="mdi:trending-up",
        translation_key=TRANSLATION_KEY_TREND,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="voltage_air",
        name="Voltage AIR",
        device_class=SensorDeviceClass.VOLTAGE,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=False,
    ),
    WeatherFlowSensorEntityDescription(
        key="battery_air",
        name="Battery AIR",
        device_class=SensorDeviceClass.BATTERY,
        native_unit_of_measurement=PERCENTAGE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=False,
    ),
    WeatherFlowSensorEntityDescription(
        key="voltage_sky",
        name="Voltage SKY",
        device_class=SensorDeviceClass.VOLTAGE,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=False,
    ),
    WeatherFlowSensorEntityDescription(
        key="battery_sky",
        name="Battery SKY",
        device_class=SensorDeviceClass.BATTERY,
        native_unit_of_measurement=PERCENTAGE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=False,
    ),
    WeatherFlowSensorEntityDescription(
        key="voltage_tempest",
        name="Voltage Tempest",
        device_class=SensorDeviceClass.VOLTAGE,
        native_unit_of_measurement=UnitOfElectricPotential.VOLT,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=True,
    ),
    WeatherFlowSensorEntityDescription(
        key="battery_tempest",
        name="Battery Tempest",
        device_class=SensorDeviceClass.BATTERY,
        native_unit_of_measurement=PERCENTAGE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        tempest_sensor=True,
    ),
    WeatherFlowSensorEntityDescription(
        key="battery_mode",
        name="Battery Mode Tempest",
        icon="mdi:battery-charging-high",
        unit_type="none",
        tempest_sensor=True,
    ),
    WeatherFlowSensorEntityDescription(
        key="uv_description",
        name="UV Description",
        icon="mdi:weather-sunny-alert",
        translation_key=TRANSLATION_KEY_UV_DESCRIPTION,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="wind_cardinal",
        name="Wind Cardinal",
        icon="mdi:compass",
        translation_key=TRANSLATION_KEY_WIND_CARDINAL,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="beaufort_description",
        name="Beaufort Description",
        icon="mdi:windsock",
        translation_key=TRANSLATION_KEY_BEAUFORT,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="precip_intensity",
        name="Precipitation Intensity",
        icon="mdi:weather-pouring",
        translation_key=TRANSLATION_KEY_PRECIP_INTENSITY,
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="station_name",
        name="Station Information",
        icon="mdi:hubspot",
        unit_type="none",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="freezing_line",
        name="Freezing Line",
        icon="mdi:altimeter",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="altitude",
        tempest_sensor=None,
    ),
    WeatherFlowSensorEntityDescription(
        key="cloud_base",
        name="Cloud Base",
        icon="mdi:weather-cloudy",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="altitude",
        tempest_sensor=None,
    ),
)


_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up sensors for WeatherFlow integration."""
    entry_data: WeatherFlowEntryData = hass.data[DOMAIN][entry.entry_id]
    weatherflowapi = entry_data.weatherflowapi
    coordinator = entry_data.coordinator
    forecast_coordinator = entry_data.forecast_coordinator
    station_data = entry_data.station_data
    unit_descriptions = entry_data.unit_descriptions

    entities = []
    for description in SENSOR_TYPES:
        if (
            description.tempest_sensor is None
            or description.tempest_sensor is station_data.is_tempest
        ) and getattr(coordinator.data, description.key) is not None:
            entities.append(
                WeatherFlowSensor(
                    weatherflowapi,
                    coordinator,
                    forecast_coordinator,
                    station_data,
                    description,
                    entry,
                    unit_descriptions,
                )
            )

            _LOGGER.debug(
                "Adding sensor entity %s",
                description.name,
            )

    async_add_entities(entities)


class WeatherFlowSensor(WeatherFlowEntity, SensorEntity):
    """A WeatherFlow Sensor."""

    # pylint: disable=too-many-instance-attributes
    # pylint: disable=too-many-arguments
    # Eight is reasonable in this case.

    def __init__(
        self,
        weatherflowapi,
        coordinator,
        forecast_coordinator,
        station_data,
        description,
        entries: ConfigEntry,
        unit_descriptions,
    ):
        """Initialize an WeatherFlow sensor."""
        super().__init__(
            weatherflowapi,
            coordinator,
            forecast_coordinator,
            station_data,
            description,
            entries,
        )
        if self.entity_description.native_unit_of_measurement is None:
            self._attr_native_unit_of_measurement = unit_descriptions[
                self.entity_description.unit_type
            ]

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""

        return (
            getattr(self.coordinator.data, self.entity_description.key)
            if self.coordinator.data
            else None
        )

    @property
    def extra_state_attributes(self):
        """Return the sensor state attributes."""
        if self.entity_description.key == "battery_mode":
            return {
                **super().extra_state_attributes,
                ATTR_DESCRIPTION: getattr(
                    self.coordinator.data, "battery_mode_description"
                ),
            }
        if self.entity_description.key == "station_name":
            return {
                **super().extra_state_attributes,
                ATTR_DESCRIPTION: asdict(self.station_data),
            }
        return super().extra_state_attributes
