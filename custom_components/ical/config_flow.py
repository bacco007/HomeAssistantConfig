"""Config flow for ical integration."""
import logging

import voluptuous as vol

from homeassistant import config_entries, core, exceptions
from homeassistant.const import CONF_NAME, CONF_URL, CONF_VERIFY_SSL
import homeassistant.helpers.config_validation as cv

from .const import CONF_DAYS, CONF_MAX_EVENTS, DOMAIN

DEFAULT_MAX_EVENTS = 5
DEFAULT_DAYS = 365

_LOGGER = logging.getLogger(__name__)

# TODO adjust the data schema to the data that you need
# DATA_SCHEMA = vol.Schema({CONF_NAME: cv.string, CONF_URL: cv.url, CONF_MAX_EVENTS: cv.positive_int, CONF_DAYS: cv.positive_int, CONF_VERIFY_SSL: cv.boolean})
DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): cv.string,
        vol.Optional(CONF_URL): cv.string,
        vol.Optional(CONF_MAX_EVENTS, default=DEFAULT_MAX_EVENTS): cv.positive_int,
        vol.Optional(CONF_DAYS, default=DEFAULT_DAYS): cv.positive_int,
        vol.Optional(CONF_VERIFY_SSL, default=True): cv.boolean,
    }
)


class PlaceholderHub:
    """Placeholder class to make tests pass.

    TODO Remove this placeholder class and replace with things from your PyPI package.
    """

    def __init__(self, host):
        """Initialize."""
        self.host = host

    async def authenticate(self, username, password) -> bool:
        """Test if we can authenticate with the host."""
        return True


async def validate_input(hass: core.HomeAssistant, data):
    """Validate the user input allows us to connect.

    Data has the keys from DATA_SCHEMA with values provided by the user.
    """
    # TODO validate the data can be used to set up a connection.

    # If your PyPI package is not built with async, pass your methods
    # to the executor:
    # await hass.async_add_executor_job(
    #     your_validate_func, data["username"], data["password"]
    # )

    hub = PlaceholderHub(data["name"])

    if not await hub.authenticate(data["url"], data["url"]):
        raise InvalidAuth

    # If you cannot connect:
    # throw CannotConnect
    # If the authentication is wrong:
    # InvalidAuth

    # Return info that you want to store in the config entry.
    return {"title": data[CONF_NAME], "url": data[CONF_URL]}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ical."""

    VERSION = 1
    # TODO pick one of the available connection classes in homeassistant/config_entries.py
    CONNECTION_CLASS = config_entries.CONN_CLASS_UNKNOWN

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
