import logging
from pprint import pformat
from typing import Any

import voluptuous as vol  # type: ignore
from homeassistant.config_entries import ConfigFlow
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_SLAVE

from .const import DOMAIN
from .core.inverter import SungrowInverter

logger = logging.getLogger(__name__)


class SungrowInverterConfigFlow(ConfigFlow, domain=DOMAIN):
    """Sungrow Inverter config flow."""

    VERSION = 1

    async def _async_show_user_form(
        self, user_input: dict[str, Any], errors: dict[str, str]
    ):
        logger.debug(
            "async_step_user displaying user data entry form "
            + f"with user_input={user_input} and errors={errors}"
        )

        schema = {
            vol.Required(CONF_HOST, default=user_input.get(CONF_HOST, "")): str,
            vol.Required(CONF_PORT, default=user_input.get(CONF_PORT, 502)): int,
            vol.Required(CONF_SLAVE, default=user_input.get(CONF_SLAVE, 1)): int,
        }

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(schema),
            errors=errors,
        )

    async def async_step_user(self, user_input=None):
        """Currently it's all in one step"""
        # ToDo: split into multiple steps!!
        # first step is only IP address, then we try to connect!

        logger.debug(f"async_step_user user_input={pformat(user_input)}")

        # Either show modal form, or create config entry then move on
        if user_input is None:  # Just show the modal form and return if no user input
            return await self._async_show_user_form({}, {})
        else:  # We got user input, so do something with it
            as_dict = dict(user_input)
            inverter = await SungrowInverter.create(as_dict)
            if inverter:
                # Fetch data for slave_master_standalone detection
                await inverter.pull_data()

                # ToDo: pass inverter object to async_create_entry, so we don't have to
                # disconnect and connect again
                await inverter.disconnect()
                return self.async_create_entry(
                    # Note: name can be changed in the UI!
                    title="Sungrow Inverter " + inverter.slave_master_standalone,
                    data=as_dict,
                )
            else:
                # FIXME: more precise error
                errors = {"base": "cannot_connect"}
                return await self._async_show_user_form(user_input, errors)
