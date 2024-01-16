"""Constants for the World Air Quality Index integration."""

from datetime import timedelta

from typing import Final

from homeassistant.const import (
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
    CONCENTRATION_MICROGRAMS_PER_CUBIC_METER,
    UnitOfLength,
    PERCENTAGE,
    Platform
)
from homeassistant.components.sensor import SensorDeviceClass

DOMAIN = "worlds_air_quality_index"
PLATFORMS = [Platform.SENSOR]
SW_VERSION = "1.1.0"

DEFAULT_NAME = 'waqi1'
DISCOVERY_TYPE = "discovery_type"
GEOGRAPHIC_LOCALIZATION = "Geographic localization"
SCAN_INTERVAL = timedelta(minutes=30)
STATION_ID = "Station ID"

SENSORS = {
    'aqi': ['Air Quality Index', ' ', 'mdi:leaf', SensorDeviceClass.AQI],
    'pm10': ['Particulate matter (PM10)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:skull-outline', SensorDeviceClass.PM10],
    'pm25': ['Particulate matter (PM2,5)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:skull-outline', SensorDeviceClass.PM25],
    'co': ['Carbon monoxide (CO)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:molecule-co', SensorDeviceClass.CO],
    'h': ['Humidity', PERCENTAGE, 'mdi:water-percent', SensorDeviceClass.HUMIDITY],
    'no2': ['Nitrogen dioxide (NO2)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:smog', SensorDeviceClass.NITROGEN_DIOXIDE],
    'o3': ['Ozone (O3)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:skull-outline', SensorDeviceClass.OZONE],
    'p': ['Atmospheric pressure', UnitOfPressure.HPA, 'mdi:gauge', SensorDeviceClass.PRESSURE],
    'so2': ['Sulphur dioxide (SO2)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:smog', SensorDeviceClass.SULPHUR_DIOXIDE],
    't': ['Temperature', UnitOfTemperature.CELSIUS, 'mdi:thermometer', SensorDeviceClass.TEMPERATURE],
    'r': ['Rain', UnitOfLength.MILLIMETERS, 'mdi:weather-rainy', None],
    'w': ['Wind speed', UnitOfSpeed.METERS_PER_SECOND, 'mdi:weather-windy', None],
    'wg': ['Wind gust', UnitOfSpeed.METERS_PER_SECOND, 'mdi:weather-windy', None],
}
