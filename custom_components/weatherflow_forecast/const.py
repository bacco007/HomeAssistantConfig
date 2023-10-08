"""Constants for WeatherFlow Forecast component."""

ATTR_ATTRIBUTION = "Weather data delivered by WeatherFlow"

CONCENTRATION_GRAMS_PER_CUBIC_METER = "g/m³"
CONF_ADD_SENSORS = "add_sensors"
CONF_API_TOKEN = "api_token"
CONF_STATION_ID = "station_id"

DEFAULT_ADD_SENSOR = False
DEFAULT_NAME = "WeatherFlow Forecast"
DOMAIN = "weatherflow_forecast"

MANUFACTURER = "WeatherFlow"
MODEL = "Rest API"

TIMESTAMP_SENSORS = [
    "lightning_strike_last_epoch",
    "timestamp",
]
