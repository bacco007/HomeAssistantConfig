"""Sensor platform for Daily Sensor."""

import asyncio
from datetime import datetime
import logging
from statistics import StatisticsError, median, stdev, variance

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import Event, callback

from .const import (  # pylint: disable=unused-import
    ATTR_DATETIME_OF_OCCURRENCE,
    CONF_AUTO_RESET,
    CONF_INPUT_SENSOR,
    CONF_INTERVAL,
    CONF_MAX,
    CONF_MEAN,
    CONF_MEDIAN,
    CONF_MIN,
    CONF_OPERATION,
    CONF_STDEV,
    CONF_SUM,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_VARIANCE,
    COORDINATOR,
    DOMAIN,
    EVENT_RESET,
    EVENT_UPDATE,
    ICON,
)
from .entity import DailySensorEntity

# from homeassistant.helpers import entity_registry as er
from .helpers import parse_sensor_state, convert_to_float
import contextlib

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the platform and add to HA."""
    coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]

    async_add_devices([DailySensor(hass, coordinator, entry)])


class DailySensor(DailySensorEntity):
    """DailySensor class."""

    def __init__(self, hass, coordinator, entity):
        """Init for DailySensor."""
        super(DailySensor, self).__init__(coordinator, entity)
        self._state = None
        self._values = []
        self._occurrence = None

    async def async_added_to_hass(self):
        """Complete the initialization."""
        await super().async_added_to_hass()
        # register this sensor in the coordinator
        self.coordinator.register_entity(self.name, self.entity_id)

        # listen to the update event and reset event
        event_to_listen = f"{self.coordinator.name}_{EVENT_RESET}"
        self.hass.bus.async_listen(
            event_to_listen,
            lambda event: self._handle_reset(  # pylint: disable=unnecessary-lambda
                event
            ),
        )
        event_to_listen_2 = f"{self.coordinator.name}_{EVENT_UPDATE}"
        self.hass.bus.async_listen(
            event_to_listen_2,
            lambda event: self._handle_update(  # pylint: disable=unnecessary-lambda
                event
            ),
        )

        state = await self.async_get_last_state()
        self._state = parse_sensor_state(state)

    @callback
    def _handle_reset(self, event: Event):
        """Receive the reset event."""
        # reset the sensor
        self._state = None
        self._occurrence = None
        self._values = []
        self.hass.add_job(self.async_write_ha_state)

    @callback
    def _handle_update(self, event: Event):
        """Receive the update event."""
        # update the sensor
        input_state = self.hass.states.get(self.coordinator.input_sensor)
        state_minmax_changed = False
        try:
            if input_state not in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
                input_state = parse_sensor_state(input_state)
                the_val = convert_to_float(input_state)
                if self._state not in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
                    self._state = convert_to_float(self._state)
                # apply the operation and update self._state
                if self.coordinator.operation == CONF_SUM:
                    if self._state in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
                        self._state = the_val
                    else:
                        self._state = self._state + the_val
                elif self.coordinator.operation == CONF_MAX:
                    if (
                        self._state in (None, STATE_UNKNOWN, STATE_UNAVAILABLE)
                        or the_val > self._state
                    ):
                        self._state = the_val
                        state_minmax_changed = True
                elif self.coordinator.operation == CONF_MIN:
                    if (
                        self._state in (None, STATE_UNKNOWN, STATE_UNAVAILABLE)
                        or the_val < self._state
                    ):
                        self._state = the_val
                        state_minmax_changed = True
                elif self.coordinator.operation == CONF_MEAN:
                    self._values.append(the_val)
                    self._state = round(
                        (sum(self._values) * 1.0) / len(self._values), 1
                    )
                elif self.coordinator.operation == CONF_MEDIAN:
                    self._values.append(the_val)
                    self._state = median(self._values)
                elif self.coordinator.operation == CONF_STDEV:
                    self._values.append(the_val)
                    self._state = stdev(self._values)
                elif self.coordinator.operation == CONF_VARIANCE:
                    self._values.append(the_val)
                    with contextlib.suppress(StatisticsError):
                        self._state = variance(self._values)
                if state_minmax_changed:
                    self._occurrence = datetime.now()
                self.hass.add_job(self.async_write_ha_state)
            else:
                # sensor is unknown at startup, state which comes after is considered as initial state
                _LOGGER.debug(
                    "Initial state for {} is {}".format(
                        self.coordinator.input_sensor, input_state
                    )
                )
                return
        except ValueError:
            _LOGGER.error(
                "unable to convert to float. Please check the source sensor ({}) is available.".format(
                    self.coordinator.input_sensor
                )
            )

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self.coordinator.name}"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement for the sensor."""
        return self.coordinator.unit_of_measurement

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        return {
            CONF_INPUT_SENSOR: self.coordinator.input_sensor,
            CONF_OPERATION: self.coordinator.operation,
            CONF_INTERVAL: self.coordinator.interval,
            CONF_UNIT_OF_MEASUREMENT: self.unit_of_measurement,
            CONF_AUTO_RESET: self.coordinator.auto_reset,
            ATTR_DATETIME_OF_OCCURRENCE: self._occurrence,
        }

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return ICON
