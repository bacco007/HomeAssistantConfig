"""Constant definitions for WeatherFlow Integration."""

DOMAIN = "weatherflow"

ATTR_DESCRIPTION = "description"
ATTR_FORECAST_FEELS_LIKE = "feels_like"
ATTR_FORECAST_WIND_GUST = "wind_gust"
ATTR_FORECAST_UV = "uv_index"

CONCENTRATION_GRAMS_PER_CUBIC_METER = "g/m³"

CONDITION_CLASSES = {
    "clear-night": ["clear-night"],
    "cloudy": ["cloudy"],
    "exceptional": ["cloudy"],
    "fog": ["foggy"],
    "hail": ["hail"],
    "lightning": ["thunderstorm"],
    "lightning-rainy": ["possibly-thunderstorm-day", "possibly-thunderstorm-night"],
    "partlycloudy": [
        "partly-cloudy-day",
        "partly-cloudy-night",
    ],
    "rainy": [
        "rainy",
        "possibly-rainy-day",
        "possibly-rainy-night",
    ],
    "snowy": ["snow", "possibly-snow-day", "possibly-snow-night"],
    "snowy-rainy": ["sleet", "possibly-sleet-day", "possibly-sleet-night"],
    "sunny": ["clear-day"],
    "windy": ["windy"],
}

CONF_FORECAST_HOURS = "forecast_hours"
CONF_IGNORE_FETCH_ERRORS = "ignore_fetch_errors"
CONF_INTERVAL_OBSERVATION = "interval_observation"
CONF_INTERVAL_FORECAST = "interval_forecast"
CONF_STATION_ID = "station_id"

CONFIG_OPTIONS = [
    CONF_INTERVAL_OBSERVATION,
    CONF_INTERVAL_FORECAST,
]
CONF_UNIT_SYSTEM_IMPERIAL = "imperial"
CONF_UNIT_SYSTEM_METRIC = "metric"

DEFAULT_ATTRIBUTION = "Powered by WeatherFlow"
DEFAULT_BRAND = "WeatherFlow"
DEFAULT_OBSERVATION_INTERVAL = 2
DEFAULT_FORECAST_INTERVAL = 30
DEFAULT_FORECAST_HOURS = 48
DEFAULT_IGNORE_FETCH_ERRORS = True

TRANSLATION_KEY_BEAUFORT = "beaufort"
TRANSLATION_KEY_PRECIP_INTENSITY = "precip_intensity"
TRANSLATION_KEY_TREND = "trend"
TRANSLATION_KEY_WIND_CARDINAL = "wind_cardinal"
TRANSLATION_KEY_UV_DESCRIPTION = "uv_description"

WEATHERFLOW_PLATFORMS = [
    "binary_sensor",
    "sensor",
    "weather",
]
