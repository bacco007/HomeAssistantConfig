"""Weatherbit Sensors for Home Assistant."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.sensor import (
    STATE_CLASS_MEASUREMENT,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    DEGREE,
    UnitOfLength,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import StateType
from homeassistant.util.unit_conversion import (
    SpeedConverter,
    DistanceConverter,
    TemperatureConverter,
)
from homeassistant.util.unit_system import (
    METRIC_SYSTEM,
)
from homeassistant.components.weather import (
    ATTR_FORECAST_NATIVE_PRECIPITATION,
    ATTR_FORECAST_PRECIPITATION_PROBABILITY,
    ATTR_FORECAST_NATIVE_TEMP,
    ATTR_FORECAST_NATIVE_TEMP_LOW,
    ATTR_FORECAST_TIME,
    ATTR_FORECAST_WIND_BEARING,
    ATTR_FORECAST_NATIVE_WIND_SPEED,
)

# from pyweatherbitdata.data import AlertDescription, ForecastDetailDescription
from pyweatherbitdata.data import ForecastDetailDescription
from .const import (
    # ATTR_ALERTS_CITY_NAME,
    # ATTR_ALERT_DESCRIPTION_EN,
    # ATTR_ALERT_DESCRIPTION_LOC,
    # ATTR_ALERT_EFFECTIVE,
    # ATTR_ALERT_ENDS,
    # ATTR_ALERT_EXPIRES,
    # ATTR_ALERT_ONSET,
    # ATTR_ALERT_REGIONS,
    # ATTR_ALERT_SEVERITY,
    # ATTR_ALERT_TITLE,
    # ATTR_ALERT_URI,
    # ATTR_ALERTS,
    ATTR_AQI_LEVEL,
    ATTR_FORECAST_CLOUDINESS,
    ATTR_FORECAST_SNOW,
    ATTR_FORECAST_WEATHER_TEXT,
    DOMAIN,
    TRANSLATION_BEAUFORT,
    TRANSLATION_CARDINAL,
    TRANSLATION_UV_DESCRIPTION,
)
from .entity import WeatherbitEntity
from .models import WeatherBitEntryData

# _KEY_ALERTS = "alerts"
_KEY_AQI = "aqi"


@dataclass
class WeatherBitRequiredKeysMixin:
    """Mixin for required keys."""

    unit_type: str | None = None
    extra_attributes: bool | None = None
    day_index: int | None = None
    is_forecast_item: bool | None = False


#    translation_key: str | None = None


@dataclass
class WeatherBitSensorEntityDescription(
    WeatherBitRequiredKeysMixin, SensorEntityDescription
):
    """Describes WeatherBit Sensor entity."""


SENSOR_TYPES: tuple[WeatherBitSensorEntityDescription, ...] = (
    WeatherBitSensorEntityDescription(
        key="temp",
        name="Air Temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="app_temp",
        name="Apparent Temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="slp",
        name="Sea Level Pressure",
        device_class=SensorDeviceClass.PRESSURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="pressure",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="humidity",
        name="Relative Humidity",
        native_unit_of_measurement="%",
        device_class=SensorDeviceClass.HUMIDITY,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="pres",
        name="Station Pressure",
        device_class=SensorDeviceClass.PRESSURE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="pressure",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="clouds",
        name="Cloud Coverage",
        native_unit_of_measurement="%",
        icon="mdi:cloud",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="solar_rad",
        name="Solar Radiation",
        icon="mdi:solar-power",
        native_unit_of_measurement="W/m^2",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="wind_spd",
        name="Wind Speed",
        device_class=SensorDeviceClass.SPEED,
        icon="mdi:weather-windy-variant",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="length",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="wind_spd_kmh",
        name="Wind Speed (km/h)",
        icon="mdi:weather-windy-variant",
        device_class=SensorDeviceClass.SPEED,
        native_unit_of_measurement=UnitOfSpeed.KILOMETERS_PER_HOUR,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="wind_spd_knots",
        name="Wind Speed (knots)",
        icon="mdi:tailwind",
        device_class=SensorDeviceClass.SPEED,
        native_unit_of_measurement=UnitOfSpeed.KNOTS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="wind_dir",
        name="Wind Direction",
        icon="mdi:compass",
        native_unit_of_measurement=DEGREE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="wind_cdir",
        name="Wind Cardinal",
        icon="mdi:compass",
        translation_key=TRANSLATION_CARDINAL,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="dewpt",
        name="Dew Point",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="weather_text",
        name="Weather Description",
        icon="mdi:text-short",
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="vis",
        name="Visibility",
        icon="mdi:eye",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="distance",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="precip",
        name="Precipitation",
        icon="mdi:weather-rainy",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="snow",
        name="Snow",
        icon="mdi:snowflake",
        device_class=SensorDeviceClass.DISTANCE,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="precipitation",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="uv",
        name="UV Index",
        icon="mdi:weather-sunny-alert",
        native_unit_of_measurement="UVI",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="uv_description",
        name="UV Description",
        icon="mdi:weather-sunny-alert",
        translation_key=TRANSLATION_UV_DESCRIPTION,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="aqi",
        name="Air Quality Index",
        device_class=SensorDeviceClass.AQI,
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="beaufort_value",
        name="Beaufort",
        icon="mdi:windsock",
        native_unit_of_measurement="Bft",
        state_class=STATE_CLASS_MEASUREMENT,
        unit_type="none",
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="observation_time",
        name="Observation Time",
        icon="mdi:clock",
        unit_type="none",
        device_class=SensorDeviceClass.TIMESTAMP,
        extra_attributes=False,
    ),
    WeatherBitSensorEntityDescription(
        key="beaufort_text",
        name="Beaufort Description",
        icon="mdi:windsock",
        translation_key=TRANSLATION_BEAUFORT,
        unit_type="none",
        extra_attributes=False,
    ),
    # WeatherBitSensorEntityDescription(
    #     key="alerts",
    #     name="Weather Alerts",
    #     icon="mdi:alert",
    #     unit_type="none",
    #     extra_attributes=True,
    # ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_1",
        name="Forecast Day 1",
        unit_type="none",
        is_forecast_item=True,
        day_index=0,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_2",
        name="Forecast Day 2",
        unit_type="none",
        is_forecast_item=True,
        day_index=1,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_3",
        name="Forecast Day 3",
        unit_type="none",
        is_forecast_item=True,
        day_index=2,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_4",
        name="Forecast Day 4",
        unit_type="none",
        is_forecast_item=True,
        day_index=3,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_5",
        name="Forecast Day 5",
        unit_type="none",
        is_forecast_item=True,
        day_index=4,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_6",
        name="Forecast Day 6",
        unit_type="none",
        is_forecast_item=True,
        day_index=5,
    ),
    WeatherBitSensorEntityDescription(
        key="forecast_day_7",
        name="Forecast Day 7",
        unit_type="none",
        is_forecast_item=True,
        day_index=6,
    ),
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up sensors for WeatherFlow integration."""
    entry_data: WeatherBitEntryData = hass.data[DOMAIN][entry.entry_id]
    weatherbitapi = entry_data.weatherbitapi
    coordinator = entry_data.coordinator
    forecast_coordinator = entry_data.forecast_coordinator
    station_data = entry_data.station_data
    unit_descriptions = entry_data.unit_descriptions

    entities = []
    for description in SENSOR_TYPES:
        entities.append(
            WeatherbitSensor(
                weatherbitapi,
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


class WeatherbitSensor(WeatherbitEntity, SensorEntity):
    """Implementation of Weatherbit sensor."""

    def __init__(
        self,
        weatherbitapi,
        coordinator,
        forecast_coordinator,
        station_data,
        description,
        entries: ConfigEntry,
        unit_descriptions,
    ):
        """Initialize an WeatherFlow sensor."""
        super().__init__(
            weatherbitapi,
            coordinator,
            forecast_coordinator,
            station_data,
            description,
            entries,
        )
        self.unit_descriptions = unit_descriptions
        if self.entity_description.is_forecast_item:
            self.forecast_data = getattr(self.forecast_coordinator.data, "forecast")
            self.day_data: ForecastDetailDescription = self.forecast_data[
                description.day_index
            ]
        self._attr_name = f"{DOMAIN.capitalize()} {self.entity_description.name}"
        if self.entity_description.native_unit_of_measurement is None:
            self._attr_native_unit_of_measurement = unit_descriptions[
                self.entity_description.unit_type
            ]

    @property
    def native_value(self) -> StateType:
        """Return the state of the sensor."""

        # if self.entity_description.key == _KEY_ALERTS:
        #     return getattr(self.coordinator.data, "alert_count")

        if self.entity_description.is_forecast_item:
            self.forecast_data = getattr(self.forecast_coordinator.data, "forecast")
            self.day_data = self.forecast_data[self.entity_description.day_index]
            return self.day_data.condition

        return (
            getattr(self.coordinator.data, self.entity_description.key)
            if self.coordinator.data
            else None
        )

    @property
    def icon(self):
        """Return icon for the sensor."""
        if self.entity_description.is_forecast_item:
            icon = (
                "partly-cloudy"
                if self.day_data.condition == "partlycloudy"
                else self.day_data.condition
            )
            return f"mdi:weather-{icon}"
        return self.entity_description.icon

    @property
    def extra_state_attributes(self):
        """Return the sensor state attributes."""
        # if self.entity_description.key == _KEY_ALERTS:
        #     data = []
        #     count = 1
        #     alerts: AlertDescription = getattr(
        #         self.coordinator.data, self.entity_description.key
        #     )
        #     for item in alerts:
        #         data.append(
        #             {
        #                 f"Alert No {count}": "-------------------",
        #                 ATTR_ALERT_TITLE: item.title,
        #                 ATTR_ALERT_SEVERITY: item.severity,
        #                 ATTR_ALERT_EFFECTIVE: item.effective_utc,
        #                 ATTR_ALERT_ONSET: item.onset_utc,
        #                 ATTR_ALERT_ENDS: item.ends_utc,
        #                 ATTR_ALERT_EXPIRES: item.expires_utc,
        #                 ATTR_ALERT_URI: item.uri,
        #                 ATTR_ALERTS_CITY_NAME: item.city_name,
        #                 ATTR_ALERT_REGIONS: item.regions,
        #                 ATTR_ALERT_DESCRIPTION_EN: item.en_description,
        #                 ATTR_ALERT_DESCRIPTION_LOC: item.loc_description,
        #             }
        #         )
        #         count += 1
        #     return {
        #         **super().extra_state_attributes,
        #         ATTR_ALERTS: data,
        #     }
        if self.entity_description.is_forecast_item:
            _wind_spd = (
                SpeedConverter.convert(
                    self.day_data.wind_spd,
                    UnitOfSpeed.METERS_PER_SECOND,
                    UnitOfSpeed.MILES_PER_HOUR,
                )
                if not self.hass.config.units is METRIC_SYSTEM
                else SpeedConverter.convert(
                    self.day_data.wind_spd,
                    UnitOfSpeed.METERS_PER_SECOND,
                    UnitOfSpeed.MILES_PER_HOUR,
                )
            )
            _temp = (
                self.day_data.max_temp
                if self.hass.config.units is METRIC_SYSTEM
                else TemperatureConverter.convert(
                    self.day_data.max_temp,
                    UnitOfTemperature.CELSIUS,
                    UnitOfTemperature.FAHRENHEIT,
                )
            )
            _temp_low = (
                self.day_data.min_temp
                if self.hass.config.units is METRIC_SYSTEM
                else TemperatureConverter.convert(
                    self.day_data.min_temp,
                    UnitOfTemperature.CELSIUS,
                    UnitOfTemperature.FAHRENHEIT,
                )
            )
            _precip = (
                self.day_data.precip
                if self.hass.config.units is METRIC_SYSTEM
                else DistanceConverter.convert(
                    self.day_data.precip, UnitOfLength.MILLIMETERS, UnitOfLength.INCHES
                )
            )
            _snow = (
                self.day_data.snow
                if self.hass.config.units is METRIC_SYSTEM
                else DistanceConverter.convert(
                    self.day_data.snow, UnitOfLength.MILLIMETERS, UnitOfLength.INCHES
                )
            )
            return {
                **super().extra_state_attributes,
                ATTR_FORECAST_TIME: self.day_data.utc_time,
                ATTR_FORECAST_NATIVE_TEMP: _temp,
                ATTR_FORECAST_NATIVE_TEMP_LOW: _temp_low,
                ATTR_FORECAST_NATIVE_PRECIPITATION: round(_precip, 3),
                ATTR_FORECAST_PRECIPITATION_PROBABILITY: self.day_data.pop,
                ATTR_FORECAST_SNOW: round(_snow, 3),
                ATTR_FORECAST_CLOUDINESS: self.day_data.clouds,
                ATTR_FORECAST_WEATHER_TEXT: self.day_data.weather_text,
                ATTR_FORECAST_NATIVE_WIND_SPEED: round(_wind_spd, 2),
                ATTR_FORECAST_WIND_BEARING: self.day_data.wind_dir,
            }
        if self.entity_description.key == _KEY_AQI:
            return {
                **super().extra_state_attributes,
                ATTR_AQI_LEVEL: getattr(self.coordinator.data, "aqi_level"),
            }
        return super().extra_state_attributes
