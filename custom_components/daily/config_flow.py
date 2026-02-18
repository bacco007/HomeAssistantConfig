"""Config flow for Daily Sensor integration."""

from homeassistant.core import callback
from .const import (  # pylint: disable=unused-import
    DOMAIN,
    CONF_INPUT_SENSOR,
    CONF_OPERATION,
    CONF_NAME,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_INTERVAL,
    CONF_AUTO_RESET,
    CONF_PRESERVE_ON_UNAVAILABLE,
    NAME,
    VALID_OPERATIONS,
    DEFAULT_INTERVAL,
    DEFAULT_AUTO_RESET,
    DEFAULT_PRESERVE_ON_UNAVAILABLE,
)
from .exceptions import SensorNotFound, OperationNotFound, IntervalNotValid, NotUnique
from .options_flow import DailySensorOptionsFlowHandler
import logging
import voluptuous as vol

from homeassistant import config_entries

_LOGGER = logging.getLogger(__name__)


class DailySensorConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Daily Sensor."""

    VERSION = 1

    def __init__(self):
        """Initialize."""
        self._name = NAME
        self._operation = ""
        self._input_sensor = ""
        self._unit_of_measurement = "unknown"
        self._errors = {}
        self._auto_reset = DEFAULT_AUTO_RESET

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}

        if user_input is not None:
            try:
                await self._check_unique(user_input[CONF_NAME])

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
                self._name = user_input[CONF_NAME]
                self._auto_reset = user_input[CONF_AUTO_RESET]

                return self.async_create_entry(title=self._name, data=user_input)

            except NotUnique:
                _LOGGER.error("Instance name is not unique.")
                self._errors["base"] = "name"
            except SensorNotFound:
                _LOGGER.error(
                    f"Input sensor {user_input[CONF_INPUT_SENSOR]} not found."
                )
                self._errors["base"] = "sensornotfound"
            except OperationNotFound:
                _LOGGER.error(
                    f"Specified operation {user_input[CONF_OPERATION]} not valid."
                )
                self._errors["base"] = "operationnotfound"
            except IntervalNotValid:
                _LOGGER.error(
                    f"Specified interval {user_input[CONF_INTERVAL]} not valid."
                )
                self._errors["base"] = "intervalnotvalid"

            return await self._show_config_form(user_input)
        return await self._show_config_form(user_input)

    async def _show_config_form(self, user_input):
        """Show the configuration form to edit info."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=NAME): str,
                    vol.Required(CONF_INPUT_SENSOR): str,
                    vol.Required(CONF_OPERATION): vol.In(VALID_OPERATIONS),
                    vol.Required(CONF_UNIT_OF_MEASUREMENT): str,
                    vol.Required(CONF_INTERVAL, default=DEFAULT_INTERVAL): int,
                    vol.Required(CONF_AUTO_RESET, default=DEFAULT_AUTO_RESET): bool,
                    vol.Required(
                        CONF_PRESERVE_ON_UNAVAILABLE,
                        default=DEFAULT_PRESERVE_ON_UNAVAILABLE,
                    ): bool,
                }
            ),
            errors=self._errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get options flow."""
        return DailySensorOptionsFlowHandler(config_entry)

    async def _check_unique(self, name):
        """Test if the specified name is not already claimed."""
        await self.async_set_unique_id(name)
        self._abort_if_unique_id_configured()
