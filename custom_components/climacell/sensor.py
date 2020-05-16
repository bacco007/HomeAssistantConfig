"""Support for climacell.co"""

import logging
import voluptuous as vol

from datetime import timedelta
from homeassistant.helpers import config_validation as cv
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.helpers.entity import Entity

from homeassistant.components.weather import (
    ATTR_FORECAST,
    # ATTR_FORECAST_CONDITION,
    # ATTR_FORECAST_PRECIPITATION,
    # ATTR_FORECAST_TEMP,
    # ATTR_FORECAST_TEMP_LOW,
    # ATTR_FORECAST_TIME,
    # ATTR_FORECAST_WIND_BEARING,
    # ATTR_FORECAST_WIND_SPEED,
    ATTR_WEATHER_TEMPERATURE,
    ATTR_WEATHER_VISIBILITY,
    ATTR_WEATHER_HUMIDITY,
    ATTR_WEATHER_PRESSURE,
    ATTR_WEATHER_WIND_SPEED,
    # PLATFORM_SCHEMA,
    # WeatherEntity,
)
from homeassistant.const import (
    CONF_API_KEY,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_MONITORED_CONDITIONS,
    CONF_NAME,
    CONF_SCAN_INTERVAL,
    # CONF_MODE,
    # PRESSURE_HPA,
    # PRESSURE_INHG,
    # STATE_UNKNOWN,
    # TEMP_CELSIUS,

    ATTR_UNIT_OF_MEASUREMENT,

    ATTR_NAME,
    ATTR_ATTRIBUTION,
    ATTR_ICON,

    SUN_EVENT_SUNSET,
    SUN_EVENT_SUNRISE
)

from . import DOMAIN
from . import ClimacellData

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = "Climacell"

ATTRIBUTION = "Powered by Climacell"

CONF_UNITS = "units"
ALLOWED_UNITS = ["si", "us"]
CONF_FORECAST_OBSERVATIONS = "forecast_observations"
CONF_FORECAST_MODE = "forecast_mode"
CONF_DAILY = "daily"
CONF_HOURLY = "hourly"

ATTR_FORECAST_MODES = {CONF_DAILY,CONF_HOURLY}
ATTR_REALTIME = "realtime"

ATTR_FIELD = "field"
ATTR_OUT_FIELD = "out_field"

ATTR_OBSERVATION_TIME = "observation_time"
ATTR_FORECAST_VALUES = 'forecast_values'

ATTR_MOON_PHASE = "moon_phase"
ATTR_WEATHER_WIND_DIRECTION = "wind_direction"
ATTR_WEATHER_WIND_GUST = "wind_gust"
ATTR_WEATHER_PRECIPITATION = "precipitation"
ATTR_WEATHER_PRECIPITATION_TYPE = "precipitation_type"
ATTR_WEATHER_PRECIPITATION_PROBABILITY = "precipitation_probability"
ATTR_WEATHER_CLOUD_COVER = "cloud_cover"
ATTR_WEATHER_CONDITION = "weather_condition"
ATTR_WEATHER_FEELS_LIKE = "feels_like"

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
ATTR_FIRE_INDEX = "fire_index"

REALTIME_SENSOR = {
    ATTR_WEATHER_CONDITION,
    ATTR_WEATHER_TEMPERATURE,
    ATTR_WEATHER_FEELS_LIKE,
    ATTR_WEATHER_HUMIDITY,
    ATTR_WEATHER_VISIBILITY,
    ATTR_WEATHER_CLOUD_COVER,
    ATTR_WEATHER_PRECIPITATION,
    ATTR_WEATHER_PRECIPITATION_TYPE,
    ATTR_WEATHER_PRESSURE,
    ATTR_WEATHER_WIND_SPEED,
    ATTR_WEATHER_WIND_DIRECTION,
    ATTR_WEATHER_WIND_GUST,

    ATTR_AIR_QUALITY_PM25,
    ATTR_AIR_QUALITY_PM10,
    ATTR_AIR_QUALITY_O3,
    ATTR_AIR_QUALITY_NO2,
    ATTR_AIR_QUALITY_CO,
    ATTR_AIR_QUALITY_SO2,
    ATTR_AIR_QUALITY_EPA_AQI,
    ATTR_AIR_QUALITY_EPA_PRIM,
    ATTR_AIR_QUALITY_EPA_HEALTH,

    ATTR_POLLEN_TREE,
    ATTR_POLLEN_WEED,
    ATTR_POLLEN_GRASS,

    ATTR_FIRE_INDEX,

    ATTR_MOON_PHASE,
    SUN_EVENT_SUNSET,
    SUN_EVENT_SUNRISE,
}

FORECAST_SENSOR = {
    ATTR_WEATHER_CONDITION,
    ATTR_WEATHER_TEMPERATURE,
    ATTR_WEATHER_FEELS_LIKE,
    ATTR_WEATHER_HUMIDITY,
    ATTR_WEATHER_VISIBILITY,
    ATTR_WEATHER_CLOUD_COVER,
    ATTR_WEATHER_PRECIPITATION,
    ATTR_WEATHER_PRECIPITATION_PROBABILITY,
    ATTR_WEATHER_PRESSURE,
    ATTR_WEATHER_WIND_SPEED,
    ATTR_WEATHER_WIND_DIRECTION,
    ATTR_WEATHER_WIND_GUST,
}

SENSOR_TYPES = {
    ATTR_WEATHER_CONDITION: {
        ATTR_FIELD: "weather_code",
        ATTR_OUT_FIELD: "weather_code",
        ATTR_NAME: "Weather Condition",
        ATTR_ICON: "mdi:thermometer",
        ATTR_FORECAST_VALUES: 0
    },
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
    ATTR_WEATHER_HUMIDITY: {
        ATTR_FIELD: "humidity",
        ATTR_OUT_FIELD: "humidity",
        ATTR_NAME: "Humidity Percentage",
        ATTR_ICON: "mdi:water-percent",
        ATTR_FORECAST_VALUES: 2
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
    ATTR_WEATHER_PRECIPITATION: {
        ATTR_FIELD: "precipitation",
        ATTR_OUT_FIELD: "precipitation",
        ATTR_NAME: "Precipitation",
        ATTR_ICON: "mdi:weather-rainy",
        ATTR_FORECAST_VALUES: 1
    },
    ATTR_WEATHER_PRECIPITATION_TYPE: {
        ATTR_FIELD: "precipitation_type",
        ATTR_OUT_FIELD: "precipitation_type",
        ATTR_NAME: "Precipitation Type",
        ATTR_ICON: "mdi:weather-pouring",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_PRECIPITATION_PROBABILITY: {
        ATTR_FIELD: "precipitation_probability",
        ATTR_OUT_FIELD: "precipitation_probability",
        ATTR_NAME: "precipitation Probability",
        ATTR_ICON: "mdi:weather-rainy",
        ATTR_FORECAST_VALUES: 0
    },
    ATTR_WEATHER_PRESSURE: {
        ATTR_FIELD: "baro_pressure",
        ATTR_OUT_FIELD: "baro_pressure",
        ATTR_NAME: "Barometric pressure",
        ATTR_ICON: "mdi:gauge",
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
        ATTR_FORECAST_VALUES: 0
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

    ATTR_FIRE_INDEX: {
        ATTR_FIELD: "fire_index",
        ATTR_OUT_FIELD: "fire_index",
        ATTR_NAME: "Fire Index",
        ATTR_ICON: "mdi:pine-tree-fire",
        ATTR_FORECAST_VALUES: 0
    },

    ATTR_MOON_PHASE: {
        ATTR_FIELD: "moon_phase",
        ATTR_OUT_FIELD: "moon_phase",
        ATTR_NAME: "Moon Phase",
        ATTR_ICON: "mdi:weather-night",
        ATTR_FORECAST_VALUES: 2
    },
    SUN_EVENT_SUNSET: {
        ATTR_FIELD: "sunset",
        ATTR_OUT_FIELD: "sunset",
        ATTR_NAME: "Sunset",
        ATTR_ICON: "mdi:weather-night",
        ATTR_FORECAST_VALUES: 2
    },
    SUN_EVENT_SUNRISE: {
        ATTR_FIELD: "sunrise",
        ATTR_OUT_FIELD: "sunrise",
        ATTR_NAME: "Sunrise",
        ATTR_ICON: "mdi:white-balance-sunny",
        ATTR_FORECAST_VALUES: 2
    }
}

SCAN_INTERVAL = timedelta(seconds=300)

SCHEMA_CONDITIONS = vol.Schema(
    {
        vol.Optional(ATTR_REALTIME): vol.All(
            cv.ensure_list, [vol.In(REALTIME_SENSOR)]
        ),
        vol.Optional(ATTR_FORECAST): vol.All(
            cv.ensure_list, [vol.In(SENSOR_TYPES)]
        ),
        vol.Optional(CONF_FORECAST_OBSERVATIONS): vol.All(cv.ensure_list, [vol.Range(min=1, max=7)]),
        vol.Optional(CONF_FORECAST_MODE): vol.All(
            cv.ensure_list, [vol.In(ATTR_FORECAST_MODES)]
        ),
    }
)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_API_KEY): cv.string,
        vol.Optional(CONF_LATITUDE): cv.latitude,
        vol.Optional(CONF_LONGITUDE): cv.longitude,
        # vol.Optional(CONF_MODE, default="hourly"): vol.In(FORECAST_MODE),
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_UNITS): vol.In(ALLOWED_UNITS),
        vol.Required(CONF_MONITORED_CONDITIONS): vol.Schema(SCHEMA_CONDITIONS),
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Climacell sensor."""
    _LOGGER.info("__init__ setup_platform 'sensor' start for %s with config %s.", DOMAIN, config)

    name = config.get(CONF_NAME)
    latitude = config.get(CONF_LATITUDE, hass.config.latitude)
    longitude = config.get(CONF_LONGITUDE, hass.config.longitude)
    # language = config.get(CONF_LANGUAGE)
    interval = config.get(CONF_SCAN_INTERVAL, SCAN_INTERVAL)

    _LOGGER.info("__init__ setup_platform 'sensor' start for %s with interval %s.", DOMAIN, interval)

    if CONF_UNITS in config:
        units = config[CONF_UNITS]
    elif hass.config.units.is_metric:
        units = "si"
    else:
        units = "us"

    if CONF_FORECAST_MODE in config[CONF_MONITORED_CONDITIONS]:
        forecast_mode = config[CONF_MONITORED_CONDITIONS][CONF_FORECAST_MODE]
    else:
        forecast_mode = CONF_DAILY

    if CONF_FORECAST_OBSERVATIONS in config[CONF_MONITORED_CONDITIONS]:
        forecast_observations = config[CONF_MONITORED_CONDITIONS][CONF_FORECAST_OBSERVATIONS][0]
    else:
        forecast_observations = 5

    realtime_field = ''
    if ATTR_REALTIME in config[CONF_MONITORED_CONDITIONS]:
        for variable in config[CONF_MONITORED_CONDITIONS][ATTR_REALTIME]:
            realtime_field = realtime_field + SENSOR_TYPES[variable][ATTR_FIELD] + ','
        if len(realtime_field) > 1:
            realtime_field = realtime_field[:-1]

    forecast_field = ''
    if ATTR_FORECAST in config[CONF_MONITORED_CONDITIONS]:
        for variable in config[CONF_MONITORED_CONDITIONS][ATTR_FORECAST]:
            forecast_field = forecast_field + SENSOR_TYPES[variable][ATTR_FIELD] + ','
        if len(forecast_field) > 1:
            forecast_field = forecast_field[:-1]

    forecast_data = ClimacellData(
        api_key=config.get(CONF_API_KEY),
        latitude=latitude,
        longitude=longitude,
        units=units,
        realtime_fields=(realtime_field if len(realtime_field) > 0 else None),
        forecast_fields=(forecast_field if len(forecast_field) > 0 else None),
        forecast_mode=forecast_mode,
        forecast_observations=forecast_observations,
        interval=interval,
    )
    forecast_data.update()
    # forecast_data.update_currently()

    # If connection failed don't setup platform.
    if forecast_data.realtime_data is None:
        return

    sensors = []
    if ATTR_REALTIME in config[CONF_MONITORED_CONDITIONS]:
        for variable in config[CONF_MONITORED_CONDITIONS][ATTR_REALTIME]:
            sensors.append(ClimacellSensor(forecast_data, variable, name, ATTR_REALTIME))
            _LOGGER.debug("__init__ setup_platform 'condition:' %s.", variable)

    if ATTR_FORECAST in config[CONF_MONITORED_CONDITIONS]:
        for variable in config[CONF_MONITORED_CONDITIONS][ATTR_FORECAST]:
            for observation in range(0, forecast_observations):
                _LOGGER.debug("__init__ setup_platform 'condition:' %s, day %s, kvalue %s.",
                              variable, observation, SENSOR_TYPES[variable][ATTR_FORECAST_VALUES])
                if SENSOR_TYPES[variable][ATTR_FORECAST_VALUES] > 0:
                    for values in range(0, SENSOR_TYPES[variable][ATTR_FORECAST_VALUES]):
                        sensors.append(ClimacellSensor(forecast_data, variable, name, ATTR_FORECAST, observation, values))
                else:
                    sensors.append(ClimacellSensor(forecast_data, variable, name, ATTR_FORECAST, observation))

    add_entities(sensors, True)

    _LOGGER.info("__init__ setup_platform 'sensor' done for %s.", DOMAIN)
    return True


class ClimacellSensor(Entity):
    """Implementation of a Climacell sensor."""

    def __init__(self, forecast_data, sensor_type, name, mode, forecast_observation=None, forecast_value=None):

        """Initialize the sensor."""
        self.client_name = name
        self._name = SENSOR_TYPES[sensor_type][ATTR_NAME]
        self._mode = mode
        self.forecast_data = forecast_data
        self.type = sensor_type
        self.forecast_observation = forecast_observation
        self.forecast_value = forecast_value
        self._state = None
        self._icon = None
        self._unit_of_measurement = None
        self._observation_time = None
        self.sensor_prefix_name = ''

    @property
    def name(self):
        """Return the name of the sensor."""
        if self.forecast_observation is not None:
            return f"{self.client_name} {self.sensor_prefix_name} {self._name} {self.forecast_observation}d"
        return f"{self.client_name} {self._name}"

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        # if "summary" in self.type and self._icon in CONDITION_PICTURES:
        #     return CONDITION_PICTURES[self._icon][1]

        return SENSOR_TYPES[self.type][ATTR_ICON]

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_system(self):
        """Return the unit system of this entity."""
        return self.forecast_data.unit_system

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        attrs = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            ATTR_OBSERVATION_TIME: self._observation_time
        }

        if self._unit_of_measurement is not None:
            attrs[ATTR_UNIT_OF_MEASUREMENT] = self._unit_of_measurement

        return attrs

    def update(self):
        """Get the latest data from Climacell and updates the states."""
        self.forecast_data.update()
#        self.update_unit_of_measurement()

        if ATTR_REALTIME == self._mode:
            data = self.forecast_data.realtime_data[SENSOR_TYPES[self.type][ATTR_OUT_FIELD]]
            self._state = data['value']
            self._unit_of_measurement = data.get('units', None)
            self._icon = SENSOR_TYPES[self.type][ATTR_ICON]
            self._observation_time = self.forecast_data.realtime_data[ATTR_OBSERVATION_TIME]['value']

        if ATTR_FORECAST == self._mode:
            self.sensor_prefix_name = ''
            data = self.forecast_data.forecast_data[self.forecast_observation][SENSOR_TYPES[self.type][ATTR_OUT_FIELD]]

            #_LOGGER.debug("ClimacellSensor.update [%s] - 'data'= %s - %s - %s", self._name, data, self.forecast_value, len(data))
            if self.forecast_value is not None and self.forecast_value < len(data):
                data = data[self.forecast_value]

                if 'min' in data:
                    self.sensor_prefix_name = 'min'
                elif 'max' in data:
                    self.sensor_prefix_name = 'max'
                else:
                    self.sensor_prefix_name = ''

            # _LOGGER.debug("ClimacellSensor.update %s - 'data'= %s - %s", self._name, data, self.sensor_prefix_name)

            if len(self.sensor_prefix_name) > 0:
                # _LOGGER.debug("ClimacellSensor.update [%s] - 'data'= %s - %s - %s", self._name, data, self.forecast_value, len(data))
                self._state = data.get(self.sensor_prefix_name, None).get('value', None)
                self._unit_of_measurement = data.get(self.sensor_prefix_name, None).get('units', None)
                self._icon = SENSOR_TYPES[self.type][ATTR_ICON]
                self._observation_time = data.get(ATTR_OBSERVATION_TIME, None)
            elif self.forecast_value is None:
#                _LOGGER.debug("ClimacellSensor.update [%s] - 'data'= %s - %s - %s", self._name, data, self.forecast_value, len(data))
                self._state = data.get('value', None)
                self._unit_of_measurement = data.get('units', None)
                self._icon = SENSOR_TYPES[self.type][ATTR_ICON]
                self._observation_time = data.get(ATTR_OBSERVATION_TIME, None)



