"""Constants for the BOM integration."""

from homeassistant.const import (
    DEVICE_CLASS_HUMIDITY, DEVICE_CLASS_TEMPERATURE, DEVICE_CLASS_TIMESTAMP,
    LENGTH_MILLIMETERS, PERCENTAGE, TEMP_CELSIUS,
)

ATTRIBUTION = "Data provided by the Australian Bureau of Meteorology"
COLLECTOR = "collector"

CONF_FORECASTS_BASENAME = "forecasts_basename"
CONF_FORECASTS_CREATE = "forecasts_create"
CONF_FORECASTS_DAYS = "forecasts_days"
CONF_FORECASTS_MONITORED = "forecasts_monitored"
CONF_OBSERVATIONS_BASENAME = "observations_basename"
CONF_OBSERVATIONS_CREATE = "observations_create"
CONF_OBSERVATIONS_MONITORED = "observations_monitored"

COORDINATOR = "coordinator"
DOMAIN = "bureau_of_meteorology"

MAP_CONDITION = {
    'clear': 'clear-night',
    'cloudy': 'cloudy',
    'cyclone': 'exceptional',
    'dust': 'fog',
    'dusty': 'fog',
    'fog': 'fog',
    'frost': 'snowy',
    'haze': 'fog',
    'hazy': 'fog',
    'heavy_shower': 'rainy',
    'heavy_showers': 'rainy',
    'light_rain': 'rainy',
    'light_shower': 'rainy',
    'light_showers': 'rainy',
    "mostly_sunny": "sunny",
    'partly_cloudy': 'partlycloudy',
    'rain': 'rainy',
    'shower': 'rainy',
    'showers': 'rainy',
    'snow': 'snowy',
    'storm': 'lightning-rainy',
    'storms': 'lightning-rainy',
    'sunny': 'sunny',
    'tropical_cyclone': 'exceptional',
    'wind': 'windy',
    'windy': 'windy',
    None: None,
}

SENSOR_NAMES = {
    "temp": [TEMP_CELSIUS, DEVICE_CLASS_TEMPERATURE],
    "temp_feels_like": [TEMP_CELSIUS, DEVICE_CLASS_TEMPERATURE],
    "rain_since_9am": [LENGTH_MILLIMETERS, None],
    "humidity": [PERCENTAGE, DEVICE_CLASS_HUMIDITY],
    "wind_speed_kilometre": ["km/h", None],
    "wind_speed_knot": ["kts", None],
    "wind_direction": [None, None],
    "gust_speed_kilometre": ["km/h", None],
    "gust_speed_knot": ["kts", None],
    "temp_max": [TEMP_CELSIUS, DEVICE_CLASS_TEMPERATURE],
    "temp_min": [TEMP_CELSIUS, DEVICE_CLASS_TEMPERATURE],
    "extended_text": [None, None],
    "icon_descriptor": [None, None],
    "mdi_icon": [None, None],
    "short_text": [None, None],
    "uv_category": [None, None],
    "uv_max_index": ["UV", None],
    "uv_start_time": ["UV", DEVICE_CLASS_TIMESTAMP],
    "uv_end_time": ["UV", DEVICE_CLASS_TIMESTAMP],
    "rain_amount_min": [LENGTH_MILLIMETERS, None],
    "rain_amount_max": [LENGTH_MILLIMETERS, None],
    "rain_amount_range": [LENGTH_MILLIMETERS, None],
    "rain_chance": [PERCENTAGE, None],
    "fire_danger": [None, None],
}
