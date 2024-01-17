import aiohttp
import async_timeout
import voluptuous as vol
from homeassistant import config_entries, exceptions
from .const import DOMAIN, CONF_API_KEY, CONF_ACCOUNT_ID, LABEL_API_KEY, LABEL_ACCOUNT_ID, PLACEHOLDER_API_KEY, PLACEHOLDER_ACCOUNT_ID

# Constants
URL = "https://api.cloudflare.com/client/v4/user/tokens/verify"
TIMEOUT = 10

# Custom exceptions
class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_API_KEY, description={LABEL_API_KEY}): str,
    vol.Required(CONF_ACCOUNT_ID, description={LABEL_ACCOUNT_ID}): str,
})

async def validate_credentials(hass, data):
    """Validate the provided credentials are correct."""
    api_key = data["api_key"]

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    try:
        async with aiohttp.ClientSession() as session:
            with async_timeout.timeout(TIMEOUT):
                async with session.get(URL, headers=headers) as response:
                    if response.status != 200:
                        raise InvalidAuth
                    return True
    except aiohttp.ClientError:
        raise CannotConnect
    except async_timeout.TimeoutError:
        raise CannotConnect

class CloudflareConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Cloudflare config flow."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle a flow initiated by the user."""
        errors = {}

        if user_input is not None:
            try:
                await validate_credentials(self.hass, user_input)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title="Cloudflare Tunnel Monitor", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=DATA_SCHEMA,
            errors=errors,
            description_placeholders={
                CONF_API_KEY: PLACEHOLDER_API_KEY,
                CONF_ACCOUNT_ID: PLACEHOLDER_ACCOUNT_ID,
            }
        )