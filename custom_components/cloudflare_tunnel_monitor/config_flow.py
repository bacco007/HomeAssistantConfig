import aiohttp
import async_timeout
import voluptuous as vol
from homeassistant import config_entries, exceptions
from .const import DOMAIN, CONF_EMAIL, CONF_API_KEY, CONF_ACCOUNT_ID, LABEL_EMAIL, LABEL_API_KEY, LABEL_ACCOUNT_ID, PLACEHOLDER_EMAIL, PLACEHOLDER_API_KEY, PLACEHOLDER_ACCOUNT_ID

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_EMAIL, description={LABEL_EMAIL}): str,
    vol.Required(CONF_API_KEY, description={LABEL_API_KEY}): str,
    vol.Required(CONF_ACCOUNT_ID, description={LABEL_ACCOUNT_ID}): str,
})



async def validate_credentials(hass, data):
    """Validate the provided credentials are correct."""
    email = data["email"]
    api_key = data["api_key"]
    account_id = data["account_id"]
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}"
    
    headers = {
        'X-Auth-Email': email,
        'X-Auth-Key': api_key,
        'Content-Type': 'application/json',
    }

    try:
        async with aiohttp.ClientSession() as session:
            with async_timeout.timeout(10):
                async with session.get(url, headers=headers) as response:
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
                CONF_EMAIL: PLACEHOLDER_EMAIL,
                CONF_API_KEY: PLACEHOLDER_API_KEY,
                CONF_ACCOUNT_ID: PLACEHOLDER_ACCOUNT_ID,
            }
        )


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""
