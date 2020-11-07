"""Config flow for Amber Electric integration."""
import logging

import voluptuous as vol

from homeassistant import config_entries, core, exceptions
from amber_electric import AmberElectric

from .const import DOMAIN  # pylint:disable=unused-import

_LOGGER = logging.getLogger(__name__)

DATA_SCHEMA = vol.Schema(
    {
        vol.Optional("username"): vol.All(str, vol.Length(min=1)),
        vol.Optional("password"): vol.All(str, vol.Length(min=1)),
    }
)


async def validate_input(hass: core.HomeAssistant, data):
    """Validate the user input allows us to connect.

    Data has the keys from DATA_SCHEMA with values provided by the user.
    """

    data_to_save = dict()
    data_to_save["title"] = "Amber Electric"

    if (
        "username" in data
        and "password" in data
        and (data["username"] and data["password"])
    ):
        api = AmberElectric(
            loop=hass.loop,
            latitude=hass.config.latitude,
            longitude=hass.config.longitude,
            username=data["username"],
            password=data["password"],
        )

        if not await api.auth():
            raise InvalidAuth

        data_to_save["username"] = data["username"]
        data_to_save["password"] = data["password"]
    else:
        api = AmberElectric(
            loop=hass.loop,
            latitude=hass.config.latitude,
            longitude=hass.config.longitude,
        )

    await api.market.update()

    if not api.postcode:
        _LOGGER.error("No postcode returned from address search")
        raise CannotConnect

    return data_to_save


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Amber Electric."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)

                return self.async_create_entry(title=info["title"], data=user_input)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user", data_schema=DATA_SCHEMA, errors=errors
        )


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""
