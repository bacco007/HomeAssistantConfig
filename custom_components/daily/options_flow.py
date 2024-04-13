from homeassistant.helpers.selector import selector
import logging
import voluptuous as vol
from homeassistant import config_entries
from .const import (  # pylint: disable=unused-import
    DOMAIN,
    CONF_INPUT_SENSOR,
    CONF_OPERATION,
    CONF_NAME,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_INTERVAL,
    CONF_AUTO_RESET,
    NAME,
    VALID_OPERATIONS,
    DEFAULT_INTERVAL,
    DEFAULT_AUTO_RESET,
)
from .exceptions import SensorNotFound, OperationNotFound, IntervalNotValid

_LOGGER = logging.getLogger(__name__)


class DailySensorOptionsFlowHandler(config_entries.OptionsFlow):
    """Daily Sensor options flow options handler."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    def __init__(self, config_entry):
        """Initialize HACS options flow."""
        self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}
        self._operation = self.options.get(
            CONF_OPERATION, config_entry.data.get(CONF_OPERATION)
        )
        self._input_sensor = self.options.get(
            CONF_INPUT_SENSOR, config_entry.data.get(CONF_INPUT_SENSOR)
        )
        self._auto_reset = self.options.get(
            CONF_AUTO_RESET, config_entry.data.get(CONF_AUTO_RESET)
        )
        self._interval = self.options.get(
            CONF_INTERVAL, config_entry.data.get(CONF_INTERVAL)
        )
        self._unit_of_measurement = self.options.get(
            CONF_UNIT_OF_MEASUREMENT, config_entry.data.get(CONF_UNIT_OF_MEASUREMENT)
        )

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        self._errors = {}
        # set default values based on config
        if user_input is not None:
            try:
                # check input sensor exists
                status = self.hass.states.get(user_input[CONF_INPUT_SENSOR])
                if status is None:
                    raise SensorNotFound

                # check the operation
                if user_input[CONF_OPERATION] not in VALID_OPERATIONS:
                    raise OperationNotFound
                # check the interval
                if (
                    not (isinstance(user_input[CONF_INTERVAL], int))
                    or user_input[CONF_INTERVAL] <= 0
                ):
                    raise IntervalNotValid
                self._auto_reset = user_input[CONF_AUTO_RESET]
                self._interval = user_input[CONF_INTERVAL]
                self._unit_of_measurement = user_input[CONF_UNIT_OF_MEASUREMENT]
                self._operation = user_input[CONF_OPERATION]
                self._input_sensor = user_input[CONF_INPUT_SENSOR]

                return self.async_create_entry(title="", data=user_input)
            except SensorNotFound:
                _LOGGER.error(
                    "Input sensor {} not found.".format(user_input[CONF_INPUT_SENSOR])
                )
                self._errors["base"] = "sensornotfound"
            except OperationNotFound:
                _LOGGER.error(
                    "Specified operation {} not valid.".format(
                        user_input[CONF_OPERATION]
                    ),
                )
                self._errors["base"] = "operationnotfound"
            except IntervalNotValid:
                _LOGGER.error(
                    "Specified interval {} not valid.".format(
                        user_input[CONF_INTERVAL]
                    ),
                )
                self._errors["base"] = "intervalnotvalid"

            return await self._show_config_form(user_input)
        return await self._show_config_form(user_input)

    async def _show_config_form(self, user_input):
        """Show the configuration form to edit info."""
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_INPUT_SENSOR, default=self._input_sensor): str,
                    vol.Required(CONF_OPERATION, default=self._operation): vol.In(
                        VALID_OPERATIONS
                    ),
                    vol.Required(
                        CONF_UNIT_OF_MEASUREMENT, default=self._unit_of_measurement
                    ): str,
                    vol.Required(CONF_INTERVAL, default=self._interval): int,
                    vol.Required(CONF_AUTO_RESET, default=self._auto_reset): bool,
                }
            ),
            errors=self._errors,
        )
