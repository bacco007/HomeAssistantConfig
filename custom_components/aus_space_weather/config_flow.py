import logging
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import aiohttp_client, selector
from .const import DOMAIN, LOCATIONS

_LOGGER = logging.getLogger(__name__)

class SpaceWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the configuration flow for Australian Space Weather integration."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step where the user inputs the API key and location."""
        errors = {}
        if user_input is not None:
            api_key = user_input["api_key"]
            location = user_input["location"]

            # Validate the API key with a test request
            session = aiohttp_client.async_get_clientsession(self.hass)
            try:
                response = await session.post(
                    "https://sws-data.sws.bom.gov.au/api/v1/get-a-index",
                    json={"api_key": api_key, "options": {"location": "Australian region"}},
                    timeout=10,
                )
                if response.status == 200:
                    data = await response.json()
                    if "data" in data:
                        # API key is valid, create the config entry
                        return self.async_create_entry(
                            title="Australian Space Weather",
                            data={"api_key": api_key, "location": location},
                        )
                    else:
                        errors["base"] = "invalid_api_key"
                        _LOGGER.error("API key validation failed: No 'data' in response")
                else:
                    errors["base"] = "invalid_api_key"
                    _LOGGER.error(f"API key validation failed: HTTP {response.status}")
            except Exception as e:
                _LOGGER.error(f"Error validating API key: {e}")
                errors["base"] = "unknown_error"

        # Show the form to the user with a description placeholder
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("api_key"): str,
                vol.Required("location", default="Australian region"): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=LOCATIONS,
                        mode=selector.SelectSelectorMode.DROPDOWN
                    )
                ),
            }),
            errors=errors,
            description_placeholders={
                "register_url": "https://sws-data.sws.bom.gov.au/register"
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return SpaceWeatherOptionsFlow(config_entry)

class SpaceWeatherOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Australian Space Weather integration."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        pass

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            # Update the config entry with new options
            self.hass.config_entries.async_update_entry(
                self.config_entry, data={**self.config_entry.data, **user_input}
            )
            return self.async_create_entry(title="", data={})

        # Show the form to the user to update API key and location
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required("api_key", default=self.config_entry.data["api_key"]): str,
                vol.Required("location", default=self.config_entry.data["location"]): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=LOCATIONS,
                        mode=selector.SelectSelectorMode.DROPDOWN
                    )
                ),
            }),
            description_placeholders={
                "register_url": "https://sws-data.sws.bom.gov.au/register"
            },
        )
