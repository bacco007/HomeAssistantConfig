"""Constants for the World Air Quality Index integration."""

from datetime import timedelta

from homeassistant.const import (
    TEMP_CELSIUS,
    PRESSURE_HPA,
    CONCENTRATION_MICROGRAMS_PER_CUBIC_METER,
    DEGREE,
    SPEED_METERS_PER_SECOND,
    LENGTH_MILLIMETERS,
    PERCENTAGE,
    Platform
)
from homeassistant.components.sensor import SensorDeviceClass

DOMAIN = "worlds_air_quality_index"
PLATFORMS = [Platform.SENSOR]
SW_VERSION = "0.3.5"

SCAN_INTERVAL = timedelta(minutes=30)

DISCOVERY_TYPE = "discovery_type"
GEOGRAPHIC_LOCALIZATION = "Geographic localization"
STATION_ID = "Station ID"
DEFAULT_NAME = 'waqi1'

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
    'wg': ['Wind direction', DEGREE, 'custom', None],
}

WIND_DIRECTION = [
    {'min': '348.75', 'max': '11.25', 'val':'0'},
    {'min': '326.25', 'max': '348.75', 'val':'337_5'},
    {'min': '303.75', 'max': '326.25', 'val':'315'},
    {'min': '281.25', 'max': '303.75', 'val':'292_5'},
    {'min': '258.75', 'max': '281.25', 'val':'270'},
    {'min': '236.25', 'max': '258.75', 'val':'247_5'},
    {'min': '213.75', 'max': '236.25', 'val':'225'},
    {'min': '191.25', 'max': '213.75', 'val':'202_5'},
    {'min': '168.75', 'max': '191.25', 'val':'180'},
    {'min': '146.25', 'max': '168.75', 'val':'157_5'},
    {'min': '123.75', 'max': '146.25', 'val':'135'},
    {'min': '101.25', 'max': '123.75', 'val':'112_5'},
    {'min': '78.75', 'max': '101.25', 'val':'90'},
    {'min': '56.25', 'max': '78.75', 'val':'67_5'},
    {'min': '33.75', 'max': '56.25', 'val':'45'},
    {'min': '11.25', 'max': '33.75', 'val':'22_5'}
]
WIND_DIRECTION_PREFIX = "arrow-azimuth-"
WIND_DIRECTION_SUFFIX = "-deg.svg"
WIND_DIRECTION_FOLDER = "/local/" + DOMAIN + "/"
