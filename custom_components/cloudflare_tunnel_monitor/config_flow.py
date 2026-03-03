import aiohttp
import async_timeout
import re
import voluptuous as vol
from urllib.parse import urlparse
from homeassistant import config_entries, exceptions
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .const import DOMAIN, CONF_API_KEY, CONF_ACCOUNT_ID, CONF_METRICS_URL, LABEL_API_KEY, LABEL_ACCOUNT_ID, LABEL_METRICS_URL, PLACEHOLDER_API_KEY, PLACEHOLDER_ACCOUNT_ID, PLACEHOLDER_METRICS_URL

# Constants
URL = "https://api.cloudflare.com/client/v4/user/tokens/verify"
TIMEOUT = 10

# Custom exceptions
class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_ACCOUNT_ID, description={LABEL_ACCOUNT_ID}): str,
    vol.Required(CONF_API_KEY, description={LABEL_API_KEY}): str,
    vol.Optional(CONF_METRICS_URL, description={LABEL_METRICS_URL}): str,
})

async def validate_credentials(hass, data):
    """Validate the provided credentials are correct."""
    api_key = data["api_key"]

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    try:
        session = async_get_clientsession(hass)
        async with async_timeout.timeout(TIMEOUT):
            async with session.get(URL, headers=headers) as response:
                if response.status == 200:
                    return True
                elif response.status == 401:
                    raise InvalidAuth
                else:
                    raise CannotConnect
    except aiohttp.ClientError:
        raise CannotConnect
    except async_timeout.TimeoutError:
        raise CannotConnect

async def validate_metrics_endpoint(hass, url: str) -> bool:
    """Validate the provided metrics endpoint URL is reachable and Prometheus-like."""
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https'):
        raise CannotConnect

    try:
        session = async_get_clientsession(hass)
        async with async_timeout.timeout(TIMEOUT):
            async with session.get(url) as response:
                if response.status != 200:
                    raise CannotConnect

                text = await response.text()
                lines = text.splitlines()
                for line in lines:
                    stripped = line.strip()
                    if stripped.startswith('# HELP') or stripped.startswith('# TYPE'):
                        return True
                    if re.match(r'^[a-zA-Z_:][a-zA-Z0-9_:]*(\{.*\})?\s+[-+]?[0-9]', stripped):
                        return True

                raise CannotConnect
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
                metrics_url = user_input.get(CONF_METRICS_URL)
                if metrics_url:
                    try:
                        await validate_metrics_endpoint(self.hass, metrics_url)
                    except CannotConnect:
                        errors["base"] = "cannot_connect_metrics"

                if not errors:
                    return self.async_create_entry(title="Cloudflare Tunnel Monitor", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=DATA_SCHEMA,
            errors=errors,
            description_placeholders={
                CONF_API_KEY: PLACEHOLDER_API_KEY,
                CONF_ACCOUNT_ID: PLACEHOLDER_ACCOUNT_ID,
                CONF_METRICS_URL: PLACEHOLDER_METRICS_URL,
            }
        )