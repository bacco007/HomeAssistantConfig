"""Constants for the Micro Weather Station integration."""

DOMAIN = "micro_weather"

# Configuration options
CONF_TEMPERATURE_RANGE = "temperature_range"
CONF_HUMIDITY_RANGE = "humidity_range"
CONF_PRESSURE_RANGE = "pressure_range"
CONF_WIND_SPEED_RANGE = "wind_speed_range"
CONF_UPDATE_INTERVAL = "update_interval"
CONF_WEATHER_PATTERNS = "weather_patterns"

# Sensor entity configuration
CONF_OUTDOOR_TEMP_SENSOR = "outdoor_temp_sensor"
CONF_HUMIDITY_SENSOR = "humidity_sensor"
CONF_DEWPOINT_SENSOR = "dewpoint_sensor"
CONF_PRESSURE_SENSOR = "pressure_sensor"
CONF_WIND_SPEED_SENSOR = "wind_speed_sensor"
CONF_WIND_DIRECTION_SENSOR = "wind_direction_sensor"
CONF_WIND_GUST_SENSOR = "wind_gust_sensor"
CONF_RAIN_RATE_SENSOR = "rain_rate_sensor"
CONF_RAIN_STATE_SENSOR = "rain_state_sensor"
CONF_SOLAR_RADIATION_SENSOR = "solar_radiation_sensor"
CONF_SOLAR_LUX_SENSOR = "solar_lux_sensor"
CONF_UV_INDEX_SENSOR = "uv_index_sensor"
CONF_SUN_SENSOR = "sun_sensor"
CONF_ALTITUDE = "altitude"
CONF_ZENITH_MAX_RADIATION = "zenith_max_radiation"

# Default configuration values
DEFAULT_TEMPERATURE_RANGE = (-10, 35)  # Celsius
DEFAULT_HUMIDITY_RANGE = (30, 90)  # Percentage
DEFAULT_PRESSURE_RANGE = (990, 1030)  # hPa
DEFAULT_WIND_SPEED_RANGE = (0, 25)  # km/h
DEFAULT_UPDATE_INTERVAL = 5  # minutes
DEFAULT_ZENITH_MAX_RADIATION = 1000.0  # W/m² at zenith

# Sensor data keys
KEY_TEMPERATURE = "temperature"
KEY_HUMIDITY = "humidity"
KEY_PRESSURE = "pressure"
KEY_WIND_SPEED = "wind_speed"
KEY_WIND_DIRECTION = "wind_direction"
KEY_PRECIPITATION = "precipitation"
KEY_VISIBILITY = "visibility"
KEY_UV_INDEX = "uv_index"
KEY_CLOUD_COVERAGE = "cloud_coverage"
KEY_SOLAR_RADIATION = "solar_radiation"
KEY_SOLAR_LUX = "lux"
KEY_CONDITION = "condition"
KEY_FORECAST = "forecast"
KEY_DEWPOINT = "dewpoint"
KEY_PRECIPITATION_UNIT = "precipitation_unit"
KEY_LAST_UPDATED = "last_updated"

# Internal sensor data keys (used in sensor_history and analysis)
KEY_OUTDOOR_TEMP = "outdoor_temp"
KEY_RAIN_RATE = "rain_rate"
KEY_WIND_GUST = "wind_gust"
KEY_DEWPOINT = "dewpoint"
KEY_APPARENT_TEMPERATURE = "apparent_temperature"
KEY_RAIN_STATE = "rain_state"
KEY_SUN = "sun"

KEY_SOLAR_LUX_INTERNAL = "solar_lux"

# Sensor unit keys
KEY_TEMPERATURE_UNIT = "outdoor_temp_unit"
KEY_HUMIDITY_UNIT = "humidity_unit"
KEY_PRESSURE_UNIT = "pressure_unit"
KEY_WIND_SPEED_UNIT = "wind_speed_unit"
KEY_WIND_GUST_UNIT = "wind_gust_unit"
KEY_RAIN_RATE_UNIT = "rain_rate_unit"

# Pressure Units
PRESSURE_HPA_UNIT = "hPa"
PRESSURE_INHG_UNIT = "inHg"
PRESSURE_PSI_UNIT = "psi"

# Pressure Unit Variants (for matching)
PRESSURE_HPA_UNITS = {PRESSURE_HPA_UNIT, "hpa", "mbar", "mb"}
PRESSURE_INHG_UNITS = {PRESSURE_INHG_UNIT, "inhg", '"Hg', '"hg', "inch hg", "in hg"}
PRESSURE_PSI_UNITS = {PRESSURE_PSI_UNIT, "lbs/sq in", "lbs/in2"}

# Sensor types configuration for individual sensor entities
SENSOR_TYPES = {
    "temperature": {
        "name": "Temperature",
        "unit": "°C",
        "icon": "mdi:thermometer",
        "device_class": "temperature",
    },
    "humidity": {
        "name": "Humidity",
        "unit": "%",
        "icon": "mdi:water-percent",
        "device_class": "humidity",
    },
    "pressure": {
        "name": "Pressure",
        "unit": "hPa",
        "icon": "mdi:gauge",
        "device_class": "pressure",
    },
    "wind_speed": {
        "name": "Wind Speed",
        "unit": "km/h",
        "icon": "mdi:weather-windy",
        "device_class": "wind_speed",
    },
    "wind_direction": {
        "name": "Wind Direction",
        "unit": "°",
        "icon": "mdi:compass",
    },
    "visibility": {
        "name": "Visibility",
        "unit": "km",
        "icon": "mdi:eye",
        "device_class": "distance",
    },
    "precipitation": {
        "name": "Precipitation",
        "unit": "mm",
        "icon": "mdi:weather-rainy",
        "device_class": "precipitation",
    },
    "dewpoint": {
        "name": "Dewpoint",
        "unit": "°C",
        "icon": "mdi:thermometer-water",
        "device_class": "temperature",
    },
    "apparent_temperature": {
        "name": "Apparent Temperature",
        "unit": "°C",
        "icon": "mdi:thermometer",
        "device_class": "temperature",
    },
    "uv_index": {
        "name": "UV Index",
        "unit": "",
        "icon": "mdi:sun-wireless",
    },
}
