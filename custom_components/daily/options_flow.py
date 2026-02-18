import logging
import voluptuous as vol
from homeassistant import config_entries
from .const import (  # pylint: disable=unused-import
    CONF_INPUT_SENSOR,
    CONF_OPERATION,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_INTERVAL,
    CONF_AUTO_RESET,
    CONF_PRESERVE_ON_UNAVAILABLE,
    VALID_OPERATIONS,
    DEFAULT_INTERVAL,
    DEFAULT_AUTO_RESET,
    DEFAULT_PRESERVE_ON_UNAVAILABLE,
)
from .exceptions import SensorNotFound, OperationNotFound, IntervalNotValid

_LOGGER = logging.getLogger(__name__)


class DailySensorOptionsFlowHandler(config_entries.OptionsFlow):
    """Daily Sensor options flow options handler."""

    VERSION = 1

    def __init__(self, config_entry):
        """Initialize Daily Sensor options flow."""
        # Note: config_entry is already set by parent class OptionsFlow
        self.options = dict(config_entry.options) if config_entry.options else {}
        self._errors = {}
        # Get values with proper defaults to avoid None values causing type mismatches
        # Use config_entry.data as fallback, with safety check for None
        data = config_entry.data or {}
        self._operation = self.options.get(CONF_OPERATION, data.get(CONF_OPERATION, ""))
        self._input_sensor = self.options.get(
            CONF_INPUT_SENSOR, data.get(CONF_INPUT_SENSOR, "")
        )
        self._auto_reset = self.options.get(
            CONF_AUTO_RESET, data.get(CONF_AUTO_RESET, DEFAULT_AUTO_RESET)
        )
        self._interval = self.options.get(
            CONF_INTERVAL, data.get(CONF_INTERVAL, DEFAULT_INTERVAL)
        )
        self._unit_of_measurement = self.options.get(
            CONF_UNIT_OF_MEASUREMENT, data.get(CONF_UNIT_OF_MEASUREMENT, "")
        )
        self._preserve_on_unavailable = self.options.get(
            CONF_PRESERVE_ON_UNAVAILABLE,
            data.get(CONF_PRESERVE_ON_UNAVAILABLE, DEFAULT_PRESERVE_ON_UNAVAILABLE),
        )

        # Ensure proper types for all fields with error handling
        try:
            if self._auto_reset is None:
                self._auto_reset = DEFAULT_AUTO_RESET
            if not isinstance(self._auto_reset, bool):
                self._auto_reset = bool(self._auto_reset)
        except (ValueError, TypeError):
            self._auto_reset = DEFAULT_AUTO_RESET

        try:
            if self._interval is None:
                self._interval = int(DEFAULT_INTERVAL)
            if not isinstance(self._interval, int):
                self._interval = int(self._interval)
        except (ValueError, TypeError):
            self._interval = int(DEFAULT_INTERVAL)

        try:
            if self._preserve_on_unavailable is None:
                self._preserve_on_unavailable = DEFAULT_PRESERVE_ON_UNAVAILABLE
            if not isinstance(self._preserve_on_unavailable, bool):
                self._preserve_on_unavailable = bool(self._preserve_on_unavailable)
        except (ValueError, TypeError):
            self._preserve_on_unavailable = DEFAULT_PRESERVE_ON_UNAVAILABLE

        # Ensure operation is valid (required for vol.In validation)
        if not self._operation or self._operation not in VALID_OPERATIONS:
            self._operation = VALID_OPERATIONS[0]  # Default to first operation (max)

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
                self._preserve_on_unavailable = user_input[CONF_PRESERVE_ON_UNAVAILABLE]

                return self.async_create_entry(title="", data=user_input)
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
                    vol.Required(
                        CONF_PRESERVE_ON_UNAVAILABLE,
                        default=self._preserve_on_unavailable,
                    ): bool,
                }
            ),
            errors=self._errors,
        )
