"""Support for climacell.co"""

import logging
import re
from abc import abstractmethod

import pytz
import voluptuous as vol

from datetime import timedelta, datetime

from homeassistant.components.google_assistant import CONF_API_KEY
from homeassistant.const import (
    CONF_LATITUDE, CONF_LONGITUDE,
    CONF_NAME,
    CONF_SCAN_INTERVAL,
    CONF_MONITORED_CONDITIONS,
    ATTR_ICON, ATTR_ATTRIBUTION, ATTR_UNIT_OF_MEASUREMENT, ATTR_NAME)
from homeassistant.helpers import config_validation as cv
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.helpers.entity import Entity

from custom_components.climacell.daily_api_const import CONF_DAILY, SCHEMA_DAILY_CONDITIONS
from custom_components.climacell.global_const import CONF_UNITS, CONF_ALLOWED_UNITS, CLIMACELL_DATA_CONDITIONS, \
    CONF_CONDITIONS, ATTR_FIELD, CONF_EXCLUDE_INTERVAL, CONF_UPDATE, ATTRIBUTION, ATTR_OBSERVATION_TIME, ATTR_AUTO, \
    ATTR_OUT_FIELD, CONF_FORECAST_OBSERVATIONS, ATTR_FORECAST_VALUES, CONF_TIMESTEP
from custom_components.climacell.hourly_api_const import CONF_HOURLY, SCHEMA_HOURLY_CONDITIONS
from custom_components.climacell.nowcast_api_const import SCHEMA_NOWCAST_CONDITIONS, CONF_NOWCAST
from custom_components.climacell.realtime_api_const import CONF_REALTIME, \
    SCHEMA_REALTIME_CONDITIONS
from . import DOMAIN, ClimacellRealtimeDataProvider, ClimacellDailyDataProvider, ClimacellHourlyDataProvider, \
    ClimacellNowcastDataProvider

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = "Climacell"

SCAN_INTERVAL = timedelta(seconds=300)

MONITORED_CONDITIONS_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_REALTIME): vol.Schema(SCHEMA_REALTIME_CONDITIONS),
        vol.Optional(CONF_DAILY): vol.Schema(SCHEMA_DAILY_CONDITIONS),
        vol.Optional(CONF_HOURLY): vol.Schema(SCHEMA_HOURLY_CONDITIONS),
        vol.Optional(CONF_NOWCAST): vol.Schema(SCHEMA_NOWCAST_CONDITIONS),
    }
)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_API_KEY): cv.string,
        vol.Optional(CONF_LATITUDE): cv.latitude,
        vol.Optional(CONF_LONGITUDE): cv.longitude,
        vol.Optional(CONF_NAME, default=DEFAULT_NAME.lower()): cv.string,
        vol.Optional(CONF_UNITS): vol.In(CONF_ALLOWED_UNITS),
        vol.Required(CONF_MONITORED_CONDITIONS): vol.Schema(MONITORED_CONDITIONS_SCHEMA),
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Climacell sensor."""
    _LOGGER.info("__init__ setup_platform 'sensor' start for %s with config %s.", DOMAIN, config)

    # realtime_conf = None
    # realtime_interval = None
    # realtime_exclude = None

    sensor_friendly_name = config.get(CONF_NAME, DEFAULT_NAME.lower())
    latitude = config.get(CONF_LATITUDE, hass.config.latitude)
    longitude = config.get(CONF_LONGITUDE, hass.config.longitude)
    timezone = hass.config.time_zone

    _LOGGER.info("__init__ setup_platform 'sensor' start for %s.", DOMAIN)

    if CONF_UNITS in config:
        units = config[CONF_UNITS]
    elif hass.config.units.is_metric:
        units = CONF_ALLOWED_UNITS[0]
    else:
        units = CONF_ALLOWED_UNITS[1]

    sensors = []

    if CONF_REALTIME in config[CONF_MONITORED_CONDITIONS]:
        realtime_field = ''
        realtime_conf = config[CONF_MONITORED_CONDITIONS][CONF_REALTIME]
        realtime_interval = realtime_conf[CONF_SCAN_INTERVAL] if CONF_SCAN_INTERVAL in realtime_conf else SCAN_INTERVAL
        realtime_exclude = realtime_conf[CONF_EXCLUDE_INTERVAL] if CONF_EXCLUDE_INTERVAL in realtime_conf else None
        realtime_update = realtime_conf[CONF_UPDATE][0] if CONF_UPDATE in realtime_conf else ATTR_AUTO

        for condition in realtime_conf[CONF_CONDITIONS]:
            realtime_field = realtime_field + CLIMACELL_DATA_CONDITIONS[condition][ATTR_FIELD] + ','
        if len(realtime_field) > 1:
            realtime_field = realtime_field[:-1]

        _LOGGER.debug("__init__ setup_platform 'realtime' update: %s.", realtime_update)
        _LOGGER.debug("__init__ setup_platform 'realtime' interval: %s.", realtime_interval)
        _LOGGER.debug("__init__ setup_platform 'realtime' exceptions: %s.", realtime_exclude)

        realtime_data_provider = ClimacellRealtimeDataProvider(
            api_key=config.get(CONF_API_KEY),
            latitude=latitude,
            longitude=longitude,
            units=units,
            realtime_fields=(realtime_field if len(realtime_field) > 0 else None),
            interval=realtime_interval,
            exceptions=realtime_exclude,
        )

        _LOGGER.debug("__init__ setup_platform 'realtime' condition list: %s.", realtime_field)

        realtime_data_provider.retrieve_update()

        if len(realtime_field) > 1:
            for condition in realtime_conf[CONF_CONDITIONS]:
                sensors.append(
                    ClimacellRealtimeSensor(realtime_data_provider, timezone, condition, sensor_friendly_name, realtime_update))
                _LOGGER.debug("__init__ setup_platform 'realtime', add sensor fo condition: %s, %s.",
                              condition, sensor_friendly_name)
    else:
        _LOGGER.debug("__init__ setup_platform 'realtime' sensors: None")

    if CONF_DAILY in config[CONF_MONITORED_CONDITIONS]:
        daily_field = ''
        daily_conf = config[CONF_MONITORED_CONDITIONS][CONF_DAILY]
        daily_observations = daily_conf[CONF_FORECAST_OBSERVATIONS][0]\
            if CONF_FORECAST_OBSERVATIONS in daily_conf else 5
        daily_interval = daily_conf[CONF_SCAN_INTERVAL] if CONF_SCAN_INTERVAL in daily_conf else SCAN_INTERVAL
        daily_exclude = daily_conf[CONF_EXCLUDE_INTERVAL] if CONF_EXCLUDE_INTERVAL in daily_conf else None
        daily_update = daily_conf[CONF_UPDATE][0] if CONF_UPDATE in daily_conf else ATTR_AUTO

        for condition in daily_conf[CONF_CONDITIONS]:
            daily_field = daily_field + CLIMACELL_DATA_CONDITIONS[condition][ATTR_FIELD] + ','
        if len(daily_field) > 1:
            daily_field = daily_field[:-1]

        _LOGGER.debug("__init__ setup_platform 'daily' observations: %s.", daily_observations)
        _LOGGER.debug("__init__ setup_platform 'daily' update: %s.", daily_update)
        _LOGGER.debug("__init__ setup_platform 'daily' interval: %s.", daily_interval)
        _LOGGER.debug("__init__ setup_platform 'daily' exceptions: %s.", daily_exclude)

        daily_data_provider = ClimacellDailyDataProvider(
            api_key=config.get(CONF_API_KEY),
            latitude=latitude,
            longitude=longitude,
            units=units,
            daily_fields=(daily_field if len(daily_field) > 0 else None),
            observations=daily_observations,
            interval=daily_interval,
            exceptions=daily_exclude,
        )

        _LOGGER.debug("__init__ setup_platform 'daily' condition list: %s.", daily_field)

        daily_data_provider.retrieve_update()

        for condition in daily_conf[CONF_CONDITIONS]:
            for observation in range(0, daily_observations):
                daily_sensor_values = CLIMACELL_DATA_CONDITIONS[condition][ATTR_FORECAST_VALUES]

                if daily_sensor_values > 0:
                    for sensor_number in range(0, daily_sensor_values):
                        _LOGGER.debug("__init__ setup_platform 'daily', add sensor for "
                                      "condition: [%s, day=%s, values=%s/%s]",
                                      condition, observation, sensor_number, daily_sensor_values)
                        sensors.append(ClimacellDailySensor(
                            data_provider=daily_data_provider, condition_name=condition,
                            sensor_friendly_name=sensor_friendly_name,
                            observation=observation, sensor_number=sensor_number,
                            realtime_update=daily_update,
                        ))
                else:
                    _LOGGER.debug("__init__ setup_platform 'daily', add sensor for "
                                  "condition: [%s, day=%s, values=0/%s]",
                                  condition, observation, daily_sensor_values)
                    sensors.append(ClimacellDailySensor(
                        data_provider=daily_data_provider, condition_name=condition,
                        sensor_friendly_name=sensor_friendly_name,
                        observation=observation, sensor_number=None,
                        realtime_update=daily_update,
                    ))
    else:
        _LOGGER.debug("__init__ setup_platform 'daily' sensors: None")

    if CONF_HOURLY in config[CONF_MONITORED_CONDITIONS]:
        hourly_field = ''
        hourly_conf = config[CONF_MONITORED_CONDITIONS][CONF_HOURLY]
        hourly_observations = hourly_conf[CONF_FORECAST_OBSERVATIONS][0] \
            if CONF_FORECAST_OBSERVATIONS in hourly_conf else 5
        hourly_interval = hourly_conf[CONF_SCAN_INTERVAL] if CONF_SCAN_INTERVAL in hourly_conf else SCAN_INTERVAL
        hourly_exclude = hourly_conf[CONF_EXCLUDE_INTERVAL] if CONF_EXCLUDE_INTERVAL in hourly_conf else None
        hourly_update = hourly_conf[CONF_UPDATE][0] if CONF_UPDATE in hourly_conf else ATTR_AUTO

        for condition in hourly_conf[CONF_CONDITIONS]:
            hourly_field = hourly_field + CLIMACELL_DATA_CONDITIONS[condition][ATTR_FIELD] + ','
        if len(hourly_field) > 1:
            hourly_field = hourly_field[:-1]

        _LOGGER.debug("__init__ setup_platform 'hourly' observations: %s.", hourly_observations)
        _LOGGER.debug("__init__ setup_platform 'hourly' update: %s.", hourly_update)
        _LOGGER.debug("__init__ setup_platform 'hourly' interval: %s.", hourly_interval)
        _LOGGER.debug("__init__ setup_platform 'hourly' exceptions: %s.", hourly_exclude)

        hourly_data_provider = ClimacellHourlyDataProvider(
            api_key=config.get(CONF_API_KEY),
            latitude=latitude,
            longitude=longitude,
            units=units,
            daily_fields=(hourly_field if len(hourly_field) > 0 else None),
            observations=hourly_observations,
            interval=hourly_interval,
            exceptions=hourly_exclude,
        )

        _LOGGER.debug("__init__ setup_platform 'hourly' condition list: %s.", hourly_field)

        hourly_data_provider.retrieve_update()

        if len(hourly_field) > 1:
            for condition in hourly_conf[CONF_CONDITIONS]:
                for observation in range(0, hourly_observations):
                    sensors.append(
                        ClimacellHourlySensor(
                            data_provider=hourly_data_provider, timezone=timezone, condition_name=condition,
                            sensor_friendly_name=sensor_friendly_name,
                            observation=observation,
                            realtime_update=hourly_update,
                        ))
                    _LOGGER.debug("__init__ setup_platform 'hourly', add sensor fo condition: %s, %s.",
                                  condition, sensor_friendly_name)
    else:
        _LOGGER.debug("__init__ setup_platform 'hourly' sensors: None")

    if CONF_NOWCAST in config[CONF_MONITORED_CONDITIONS]:
        nowcast_field = ''
        nowcast_conf = config[CONF_MONITORED_CONDITIONS][CONF_NOWCAST]
        nowcast_timestep = nowcast_conf[CONF_TIMESTEP][0] \
            if CONF_TIMESTEP in nowcast_conf else 5
        nowcast_observations = nowcast_conf[CONF_FORECAST_OBSERVATIONS][0] \
            if CONF_FORECAST_OBSERVATIONS in nowcast_conf else 5
        nowcast_interval = nowcast_conf[CONF_SCAN_INTERVAL] if CONF_SCAN_INTERVAL in nowcast_conf else SCAN_INTERVAL
        nowcast_exclude = nowcast_conf[CONF_EXCLUDE_INTERVAL] if CONF_EXCLUDE_INTERVAL in nowcast_conf else None
        nowcast_update = nowcast_conf[CONF_UPDATE][0] if CONF_UPDATE in nowcast_conf else ATTR_AUTO

        for condition in nowcast_conf[CONF_CONDITIONS]:
            nowcast_field = nowcast_field + CLIMACELL_DATA_CONDITIONS[condition][ATTR_FIELD] + ','
        if len(nowcast_field) > 1:
            nowcast_field = nowcast_field[:-1]

        _LOGGER.debug("__init__ setup_platform 'nowcast' timestep: %s.", nowcast_timestep)
        _LOGGER.debug("__init__ setup_platform 'nowcast' observations: %s.", nowcast_observations)
        _LOGGER.debug("__init__ setup_platform 'nowcast' update: %s.", nowcast_update)
        _LOGGER.debug("__init__ setup_platform 'nowcast' interval: %s.", nowcast_interval)
        _LOGGER.debug("__init__ setup_platform 'nowcast' exceptions: %s.", nowcast_exclude)

        nowcast_data_provider = ClimacellNowcastDataProvider(
            api_key=config.get(CONF_API_KEY),
            latitude=latitude,
            longitude=longitude,
            units=units,
            api_fields=(nowcast_field if len(nowcast_field) > 0 else None),
            timestep=nowcast_timestep,
            observations=nowcast_observations,
            interval=nowcast_interval,
            exceptions=nowcast_exclude,
        )

        _LOGGER.debug("__init__ setup_platform 'nowcast' condition list: %s.", nowcast_field)

        nowcast_data_provider.retrieve_update()

        if len(nowcast_field) > 1:
            for condition in nowcast_conf[CONF_CONDITIONS]:
                for observation in range(0, nowcast_observations):
                    sensors.append(
                        ClimacellNowcastSensor(
                            data_provider=nowcast_data_provider, timezone=timezone, condition_name=condition,
                            sensor_friendly_name=sensor_friendly_name,
                            timestep=nowcast_timestep,
                            observation=observation,
                            realtime_update=nowcast_update,
                        ))
                    _LOGGER.debug("__init__ setup_platform 'nowcast', add sensor fo condition: %s, %s.",
                                  condition, sensor_friendly_name)
    else:
        _LOGGER.debug("__init__ setup_platform 'nowcast' sensors: None")

    add_entities(sensors, True)

    _LOGGER.info("__init__ setup_platform 'sensor' done for %s.", DOMAIN)
    return True


class ClimacellAbstractSensor(Entity):
    """Implementation of a Climacell Abstract sensor."""
    def __init__(self, timezone, condition_name, friendly_name="", sensor_suffix_name="", timestep=None, observation=None):
        self.__timezone = timezone
        self._condition_name = condition_name
        self.__friendly_name = "cc " + friendly_name
        self.__sensor_name = CLIMACELL_DATA_CONDITIONS[self._condition_name][ATTR_NAME]
        self._sensor_prefix_name = ""
        self.__sensor_suffix_name = sensor_suffix_name
        self.__timestep = timestep
        self._observation = observation

        self._state = None
        self._unit_of_measurement = None
        self._observation_time = None

    @staticmethod
    def __to_float(value):
        if type(value) == str:
            if re.match(r'^-?\d+(?:\.\d+)?$', value) is None:
                return value
            elif re.search("^[1-9][0-9]{0,2}(?:,[0-9]{3}){0,3}$", value):
                return int(value)
            else:
                return float(value)
        else:
            return value

    @property
    def name(self):
        """Return the name of the sensor."""
        if self._observation is not None:
            if self.__timestep is None:
                return f"{self.__friendly_name} {self.__sensor_name} " \
                       f"{self._sensor_prefix_name} {self._observation}{self.__sensor_suffix_name}"
            else:
                return f"{self.__friendly_name} {self.__sensor_name} " \
                       f"{self._sensor_prefix_name} {str(self.__timestep * (self._observation)).zfill(2)}" \
                       f"{self.__sensor_suffix_name}"
        else:
            return f"{self.__friendly_name} {self.__sensor_name}"

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return CLIMACELL_DATA_CONDITIONS[self._condition_name][ATTR_ICON]

    @property
    def state(self):
        """Return the state of the sensor."""
        return self.__to_float(self._state)

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        abs_datetime = self._observation_time
        try:
            dt = datetime.strptime(self._observation_time, "%Y-%m-%dT%H:%M:%S.%fZ")
            utc = dt.replace(tzinfo=pytz.timezone('UTC'), microsecond=0, second=0)
            #utc_dt = pytz.utc.localize(utc, is_dst=None)
            local_dt = utc.astimezone(self.__timezone)
            abs_datetime = local_dt.isoformat()

            # _LOGGER.debug("utc: %s, loc: %s -- %s (%s)", utc, local_dt, local_dt.isoformat(), self.__timezone)

        except Exception as e:
            # _LOGGER.debug("source: %s (%s) -- %s", abs_datetime, self.__timezone, e)
            pass

        attrs = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            ATTR_OBSERVATION_TIME: abs_datetime
        }

        if self._unit_of_measurement is not None:
            attrs[ATTR_UNIT_OF_MEASUREMENT] = self._unit_of_measurement
        elif ATTR_UNIT_OF_MEASUREMENT in CLIMACELL_DATA_CONDITIONS[self._condition_name]:
            attrs[ATTR_UNIT_OF_MEASUREMENT] = CLIMACELL_DATA_CONDITIONS[self._condition_name][ATTR_UNIT_OF_MEASUREMENT]

        return attrs

    @abstractmethod
    def update(self):
        ...


class ClimacellRealtimeSensor(ClimacellAbstractSensor):
    def __init__(self, data_provider, timezone, condition_name, sensor_friendly_name, realtime_update):
        super().__init__(timezone, condition_name, sensor_friendly_name)

        self.__data_provider = data_provider
        self.__realtime_update = realtime_update
        self.__sensor_meta_condition = CLIMACELL_DATA_CONDITIONS[self._condition_name]

    def update(self):
        if ATTR_AUTO == self.__realtime_update:
            self.__data_provider.retrieve_update()

        if self.__data_provider.data is not None:
            data = self.__data_provider.data[self.__sensor_meta_condition[ATTR_OUT_FIELD]]
            self._state = data['value']
            self._unit_of_measurement = data.get('units', None)
            self._observation_time = self.__data_provider.data[ATTR_OBSERVATION_TIME]['value']
        else:
            _LOGGER.warning("RealtimeSensor.update - Provider has no data for: %s", self.name)


class ClimacellDailySensor(ClimacellAbstractSensor):
    def __init__(self, data_provider, condition_name, sensor_friendly_name, observation, sensor_number, realtime_update):
        super().__init__(None, condition_name, sensor_friendly_name, "d", None, observation)

        self.__data_provider = data_provider
        self.__sensor_number = sensor_number
        self.__realtime_update = realtime_update
        self.__sensor_meta_condition = CLIMACELL_DATA_CONDITIONS[self._condition_name]

    def update(self):
        if ATTR_AUTO == self.__realtime_update:
            self.__data_provider.retrieve_update()

        if self.__data_provider.data is not None:
            self._sensor_prefix_name = ""
            data = self.__data_provider.data[self._observation][self.__sensor_meta_condition[ATTR_OUT_FIELD]]

            self._observation_time = self.__data_provider.data[self._observation][ATTR_OBSERVATION_TIME]['value']

            # _LOGGER.debug("DailySensor.update - %s(%s): %s",
            #               self.__sensor_meta_condition[ATTR_OUT_FIELD],
            #               self._observation,
            #               self.__sensor_number)
            if isinstance(self.__sensor_number, type(None)):
                self.__update_single_value(data)
            else:
                self.__update_multiple_value(data)
        else:
            _LOGGER.warning("DailySensor.update - Provider has no data for: %s", self.name)

    def __update_single_value(self, sensor_data):
        # _LOGGER.debug("DailySensor.__update_single_value - %s(%s): %s",
        #               self.__sensor_meta_condition[ATTR_OUT_FIELD],
        #               self._observation,
        #               sensor_data)
        self._state = sensor_data['value']
        self._unit_of_measurement = sensor_data.get('units', None)

    def __update_multiple_value(self, sensor_data):
        # _LOGGER.debug("DailySensor.__update_multiple_value - %s(%s): %s",
        #               self.__sensor_meta_condition[ATTR_OUT_FIELD],
        #               self._observation,
        #               sensor_data)

        data = sensor_data[self.__sensor_number]

        if 'min' in data:
            self._sensor_prefix_name = 'min'
        elif 'max' in data:
            self._sensor_prefix_name = 'max'
        else:
            _LOGGER.error("DailySensor.__update_multiple_value - sensor_number: %s, sensor_data: %s",
                          self.__sensor_number, len(sensor_data))

        if len(self._sensor_prefix_name) > 0:
            # _LOGGER.debug("ClimacellSensor.update [%s] - 'data'= %s - %s - %s", self._name, data, self.forecast_value, len(data))
            self._state = data.get(self._sensor_prefix_name, None).get('value', None)
            self._unit_of_measurement = data.get(self._sensor_prefix_name, None).get('units', None)
        # elif self.__sensor_number is None:
        #     #                _LOGGER.debug("ClimacellSensor.update [%s] - 'data'= %s - %s - %s", self._name, data, self.forecast_value, len(data))
        #     self._state = data.get('value', None)
        #     self._unit_of_measurement = data.get('units', None)


class ClimacellHourlySensor(ClimacellAbstractSensor):
    def __init__(self, data_provider, timezone, condition_name, sensor_friendly_name, observation, realtime_update):
        super().__init__(timezone, condition_name, sensor_friendly_name, "h", None, observation)

        self.__data_provider = data_provider
        self.__realtime_update = realtime_update
        self.__sensor_meta_condition = CLIMACELL_DATA_CONDITIONS[self._condition_name]

    def update(self):
        if ATTR_AUTO == self.__realtime_update:
            self.__data_provider.retrieve_update()

        if self.__data_provider.data is not None:
            data = self.__data_provider.data[self._observation][self.__sensor_meta_condition[ATTR_OUT_FIELD]]
            self._state = data['value']
            self._unit_of_measurement = data.get('units', None)
            self._observation_time = self.__data_provider.data[self._observation][ATTR_OBSERVATION_TIME]['value']
        else:
            _LOGGER.warning("HourlySensor.update - Provider has no data for: %s", self.name)


class ClimacellNowcastSensor(ClimacellAbstractSensor):
    def __init__(self, data_provider, timezone, condition_name, sensor_friendly_name, timestep, observation, realtime_update):
        super().__init__(timezone, condition_name, sensor_friendly_name, "m", timestep, observation)

        self.__data_provider = data_provider
        self.__realtime_update = realtime_update
        self.__sensor_meta_condition = CLIMACELL_DATA_CONDITIONS[self._condition_name]

    def update(self):
        if ATTR_AUTO == self.__realtime_update:
            self.__data_provider.retrieve_update()

        if self.__data_provider.data is not None:
            data = self.__data_provider.data[self._observation][self.__sensor_meta_condition[ATTR_OUT_FIELD]]
            self._state = data['value']
            self._unit_of_measurement = data.get('units', None)
            self._observation_time = self.__data_provider.data[self._observation][ATTR_OBSERVATION_TIME]['value']
        else:
            _LOGGER.warning("NowcastSensor.update - Provider has no data for: %s", self.name)