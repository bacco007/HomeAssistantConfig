import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from homeassistant.components.weather import (
    ATTR_WEATHER_TEMPERATURE,
    ATTR_WEATHER_VISIBILITY,
    ATTR_WEATHER_HUMIDITY,
    ATTR_WEATHER_PRESSURE,
    ATTR_WEATHER_WIND_SPEED,
)

from homeassistant.const import (
    ATTR_NAME,
    ATTR_ICON,

    SUN_EVENT_SUNSET,
    SUN_EVENT_SUNRISE,
    ATTR_UNIT_OF_MEASUREMENT)

ATTRIBUTION = "Powered by Climacell"
ATTR_OBSERVATION_TIME = "observation_time"

CONF_UNITS = "units"
CONF_ALLOWED_UNITS = ["si", "us"]

PERCENTAGE = "%"
DEGREES = "degrees"
SECONDS = "s"

CONF_CONDITIONS = "conditions"
CONF_SOURCES = "sources"
CONF_FORECAST_OBSERVATIONS = "forecast_observations"
CONF_TIMESTEP = "timestep"
CONF_EXCLUDE_INTERVAL = "exclude_interval"

CONF_UPDATE = "update"
ATTR_AUTO = "auto"
ATTR_MANUAL = "manual"


ATTR_FORECAST_VALUES = 'forecast_values'
ATTR_FIELD = "field"
ATTR_OUT_FIELD = "out_field"

ATTR_WEATHER_FEELS_LIKE = "feels_like"
ATTR_WEATHER_DEWPOINT = "dewpoint"

ATTR_WEATHER_WIND_DIRECTION = "wind_direction"
ATTR_WEATHER_WIND_GUST = "wind_gust"
ATTR_WEATHER_PRECIPITATION = "precipitation"
ATTR_WEATHER_PRECIPITATION_TYPE = "precipitation_type"
ATTR_WEATHER_PRECIPITATION_PROBABILITY = "precipitation_probability"
ATTR_WEATHER_PRECIPITATION_ACCUMULATION = "precipitation_accumulation"
ATTR_WEATHER_CLOUD_COVER = "cloud_cover"
ATTR_WEATHER_CLOUD_BASE = "cloud_base"
ATTR_WEATHER_CLOUD_CEILING = "cloud_ceiling"
ATTR_WEATHER_CONDITION = "weather_condition"
ATTR_WEATHER_SATELLITE_CLOUD = "satellite_cloud"
ATTR_WEATHER_SURFACE_SHORTWAVE_RADIATION = "surface_shortwave_radiation"
ATTR_MOON_PHASE = "moon_phase"
ATTR_WEATHER_GROUP = "weather_groups"

ATTR_POLLEN_TREE = "pollen_tree"
ATTR_POLLEN_WEED = "pollen_weed"
ATTR_POLLEN_GRASS = "pollen_grass"

ATTR_AIR_QUALITY_PM25 = "pm25"
ATTR_AIR_QUALITY_PM10 = "pm10"
ATTR_AIR_QUALITY_O3 = "o3"
ATTR_AIR_QUALITY_NO2 = "no2"
ATTR_AIR_QUALITY_CO = "co"
ATTR_AIR_QUALITY_SO2 = "so2"
ATTR_AIR_QUALITY_EPA_AQI = "epa_aqi"
ATTR_AIR_QUALITY_EPA_PRIM = "epa_primary_pollutant"
ATTR_AIR_QUALITY_EPA_HEALTH = "epa_health_concern"
ATTR_AIR_QUALITY_CHINA_AQI = "china_aqi"
ATTR_AIR_QUALITY_CHINA_PRIMARY_POLLUTANT = "china_primary_pollutant"
ATTR_AIR_QUALITY_CHINA_HEALTH_CONCERN = "china_health_concern"

ATTR_ROAD_RISK_SCORE = "road_risk_score"
ATTR_ROAD_RISK = "road_risk"
ATTR_ROAD_RISK_CONFIDENCE = "road_risk_confidence"
ATTR_ROAD_RISK_CONDITIONS = "road_risk_conditions"

ATTR_FIRE_INDEX = "fire_index"

UPDATE_MODES = {
    ATTR_AUTO,
    ATTR_MANUAL,
}

CLIMACELL_DATA_CONDITIONS = {
    ATTR_WEATHER_TEMPERATURE: {
        ATTR_FIELD: "temp",
        ATTR_OUT_FIELD: "temp",
        ATTR_NAME: "Temperature",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_FEELS_LIKE: {
        ATTR_FIELD: "feels_like",
        ATTR_OUT_FIELD: "feels_like",
        ATTR_NAME: "Feels Like",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_DEWPOINT: {
        ATTR_FIELD: "dewpoint",
        ATTR_OUT_FIELD: "dewpoint",
        ATTR_NAME: "Dewpoint",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_HUMIDITY: {
        ATTR_FIELD: "humidity",
        ATTR_OUT_FIELD: "humidity",
        ATTR_NAME: "Humidity Percentage",
        ATTR_ICON: "mdi:water-percent",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_WIND_SPEED: {
        ATTR_FIELD: "wind_speed",
        ATTR_OUT_FIELD: "wind_speed",
        ATTR_NAME: "Wind speed",
        ATTR_ICON: "mdi:weather-windy",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_WIND_DIRECTION: {
        ATTR_FIELD: "wind_direction",
        ATTR_OUT_FIELD: "wind_direction",
        ATTR_NAME: "Wind Direction",
        ATTR_ICON: "mdi:compass",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_WIND_GUST: {
        ATTR_FIELD: "wind_gust",
        ATTR_OUT_FIELD: "wind_gust",
        ATTR_NAME: "Wind Gust",
        ATTR_ICON: "mdi:weather-windy-variant",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_PRESSURE: {
        ATTR_FIELD: "baro_pressure",
        ATTR_OUT_FIELD: "baro_pressure",
        ATTR_NAME: "Barometric pressure",
        ATTR_ICON: "mdi:gauge",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_PRECIPITATION_TYPE: {
        ATTR_FIELD: "precipitation_type",
        ATTR_OUT_FIELD: "precipitation_type",
        ATTR_NAME: "Precipitation Type",
        ATTR_ICON: "mdi:weather-pouring",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_PRECIPITATION: {
        ATTR_FIELD: "precipitation",
        ATTR_OUT_FIELD: "precipitation",
        ATTR_NAME: "Precipitation",
        ATTR_ICON: "mdi:weather-rainy",
        ATTR_FORECAST_VALUES: 1
    },
    ATTR_WEATHER_PRECIPITATION_PROBABILITY: {
        ATTR_FIELD: "precipitation_probability",
        ATTR_OUT_FIELD: "precipitation_probability",
        ATTR_NAME: "precipitation Probability",
        ATTR_ICON: "mdi:weather-rainy",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_PRECIPITATION_ACCUMULATION: {
        ATTR_FIELD: "precipitation_accumulation",
        ATTR_OUT_FIELD: "precipitation_accumulation",
        ATTR_NAME: "Precipitation Accumulation",
        ATTR_ICON: "mdi:weather-rainy",
        ATTR_FORECAST_VALUES: 0
    },
    SUN_EVENT_SUNRISE: {
        ATTR_FIELD: "sunrise",
        ATTR_OUT_FIELD: "sunrise",
        ATTR_NAME: "Sunrise",
        ATTR_ICON: "mdi:white-balance-sunny",
        ATTR_FORECAST_VALUES: 0
    },
    SUN_EVENT_SUNSET: {
        ATTR_FIELD: "sunset",
        ATTR_OUT_FIELD: "sunset",
        ATTR_NAME: "Sunset",
        ATTR_ICON: "mdi:weather-night",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_VISIBILITY: {
        ATTR_FIELD: "visibility",
        ATTR_OUT_FIELD: "visibility",
        ATTR_NAME: "Visibility",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_CLOUD_COVER: {
        ATTR_FIELD: "cloud_cover",
        ATTR_OUT_FIELD: "cloud_cover",
        ATTR_NAME: "Cloud Cover",
        ATTR_ICON: "mdi:weather-partly-cloudy",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_CLOUD_BASE: {
        ATTR_FIELD: "cloud_base",
        ATTR_OUT_FIELD: "cloud_base",
        ATTR_NAME: "Cloud Base",
        ATTR_ICON: "mdi:weather-partly-cloudy",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_CLOUD_CEILING: {
        ATTR_FIELD: "cloud_ceiling",
        ATTR_OUT_FIELD: "cloud_ceiling",
        ATTR_NAME: "Cloud Ceiling",
        ATTR_ICON: "mdi:weather-partly-cloudy",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_SATELLITE_CLOUD: {
        ATTR_FIELD: "satellite_cloud",
        ATTR_OUT_FIELD: "satellite_cloud",
        ATTR_NAME: "Satellite Cloud",
        ATTR_ICON: "mdi:weather-partly-cloudy",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_SURFACE_SHORTWAVE_RADIATION: {
        ATTR_FIELD: "surface_shortwave_radiation",
        ATTR_OUT_FIELD: "surface_shortwave_radiation",
        ATTR_NAME: "Surface Shortwave Radiation",
        ATTR_ICON: "",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_MOON_PHASE: {
        ATTR_FIELD: "moon_phase",
        ATTR_OUT_FIELD: "moon_phase",
        ATTR_NAME: "Moon Phase",
        ATTR_ICON: "mdi:weather-night",
        ATTR_FORECAST_VALUES: 2
    },
    ATTR_WEATHER_CONDITION: {
        ATTR_FIELD: "weather_code",
        ATTR_OUT_FIELD: "weather_code",
        ATTR_NAME: "Weather Condition",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_GROUP: {
        ATTR_FIELD: "weather_groups",
        ATTR_OUT_FIELD: "weather_groups",
        ATTR_NAME: "Weather Groups",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 0
    },

#
# Air Quality
#
    ATTR_AIR_QUALITY_PM25: {
        ATTR_FIELD: "pm25",
        ATTR_OUT_FIELD: "pm25",
        ATTR_NAME: "pm25",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_PM10: {
        ATTR_FIELD: "pm10",
        ATTR_OUT_FIELD: "pm10",
        ATTR_NAME: "pm10",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_O3: {
        ATTR_FIELD: "o3",
        ATTR_OUT_FIELD: "o3",
        ATTR_NAME: "o3",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_NO2: {
        ATTR_FIELD: "no2",
        ATTR_OUT_FIELD: "no2",
        ATTR_NAME: "no2",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_CO: {
        ATTR_FIELD: "co",
        ATTR_OUT_FIELD: "co",
        ATTR_NAME: "co",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_SO2: {
        ATTR_FIELD: "so2",
        ATTR_OUT_FIELD: "so2",
        ATTR_NAME: "so2",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_EPA_AQI: {
        ATTR_FIELD: "epa_aqi",
        ATTR_OUT_FIELD: "epa_aqi",
        ATTR_NAME: "EPA AQI",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0,
        ATTR_UNIT_OF_MEASUREMENT: "epa ndx"
    },
    ATTR_AIR_QUALITY_EPA_PRIM: {
        ATTR_FIELD: "epa_primary_pollutant",
        ATTR_OUT_FIELD: "epa_primary_pollutant",
        ATTR_NAME: "EPA Primary Pollutant",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_EPA_HEALTH: {
        ATTR_FIELD: "epa_health_concern",
        ATTR_OUT_FIELD: "epa_health_concern",
        ATTR_NAME: "EPA Health Concern",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_CHINA_AQI: {
        ATTR_FIELD: "china_aqi",
        ATTR_OUT_FIELD: "china_aqi",
        ATTR_NAME: "China AQI",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_CHINA_PRIMARY_POLLUTANT: {
        ATTR_FIELD: "china_primary_pollutant",
        ATTR_OUT_FIELD: "china_primary_pollutant",
        ATTR_NAME: "China Primary Pollutant",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_AIR_QUALITY_CHINA_HEALTH_CONCERN: {
        ATTR_FIELD: "china_health_concern",
        ATTR_OUT_FIELD: "china_health_concern",
        ATTR_NAME: "China Health Concern",
        ATTR_ICON: "mdi:eye",
        ATTR_FORECAST_VALUES: 0
    },

#
# Pollen
#
    ATTR_POLLEN_TREE: {
        ATTR_FIELD: "pollen_tree",
        ATTR_OUT_FIELD: "pollen_tree",
        ATTR_NAME: "Pollen Tree",
        ATTR_ICON: "mdi:tree",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_POLLEN_WEED: {
        ATTR_FIELD: "pollen_weed",
        ATTR_OUT_FIELD: "pollen_weed",
        ATTR_NAME: "Pollen Weed",
        ATTR_ICON: "mdi:sprout",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_POLLEN_GRASS: {
        ATTR_FIELD: "pollen_grass",
        ATTR_OUT_FIELD: "pollen_grass",
        ATTR_NAME: "Pollen Grass",
        ATTR_ICON: "mdi:flower",
        ATTR_FORECAST_VALUES: 0
    },

#
# Road Risk
#
    ATTR_ROAD_RISK_SCORE: {
        ATTR_FIELD: "road_risk_score",
        ATTR_OUT_FIELD: "road_risk_score",
        ATTR_NAME: "Road Risk Score",
        ATTR_ICON: "",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_ROAD_RISK: {
        ATTR_FIELD: "road_risk",
        ATTR_OUT_FIELD: "road_risk",
        ATTR_NAME: "Road Risk",
        ATTR_ICON: "",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_ROAD_RISK_CONFIDENCE: {
        ATTR_FIELD: "road_risk_confidence",
        ATTR_OUT_FIELD: "road_risk_confidence",
        ATTR_NAME: "Road Risk Confidence",
        ATTR_ICON: "",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_ROAD_RISK_CONDITIONS: {
        ATTR_FIELD: "road_risk_conditions",
        ATTR_OUT_FIELD: "road_risk_conditions",
        ATTR_NAME: "Road Risk Conditions",
        ATTR_ICON: "",
        ATTR_FORECAST_VALUES: 0
    },

#
# Fire Index
#
    ATTR_FIRE_INDEX: {
        ATTR_FIELD: "fire_index",
        ATTR_OUT_FIELD: "fire_index",
        ATTR_NAME: "Fire Index",
        ATTR_ICON: "mdi:pine-tree-fire",
        ATTR_FORECAST_VALUES: 0,
        ATTR_UNIT_OF_MEASUREMENT: "fr ndx"
    },

}

SCHEMA_EXCLUDE_INTERVAL = vol.Schema(
    {
        vol.All(vol.Coerce(int), vol.Range(min=1, max=20)): vol.All(cv.ensure_list, [cv.string]),
    }
)