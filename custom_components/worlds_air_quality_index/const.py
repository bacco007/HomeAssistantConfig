"""Constants for the World Air Quality Index integration."""

from datetime import timedelta

from typing import Final

from homeassistant.const import (
    TEMP_CELSIUS,
    PRESSURE_HPA,
    CONCENTRATION_MICROGRAMS_PER_CUBIC_METER,
    SPEED_METERS_PER_SECOND,
    LENGTH_MILLIMETERS,
    PERCENTAGE,
    Platform
)
from homeassistant.components.sensor import SensorDeviceClass

DOMAIN = "worlds_air_quality_index"
PLATFORMS = [Platform.SENSOR]
SW_VERSION = "1.0.4"

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
    'p': ['Atmospheric pressure', PRESSURE_HPA, 'mdi:gauge', SensorDeviceClass.PRESSURE],
    'so2': ['Sulphur dioxide (SO2)', CONCENTRATION_MICROGRAMS_PER_CUBIC_METER, 'mdi:smog', SensorDeviceClass.SULPHUR_DIOXIDE],
    't': ['Temperature', TEMP_CELSIUS, 'mdi:thermometer', SensorDeviceClass.TEMPERATURE],
    'r': ['Rain', LENGTH_MILLIMETERS, 'mdi:weather-rainy', None],
    'w': ['Wind speed', SPEED_METERS_PER_SECOND, 'mdi:weather-windy', None],
    'wg': ['Wind gust', SPEED_METERS_PER_SECOND, 'mdi:weather-windy', None],
}
