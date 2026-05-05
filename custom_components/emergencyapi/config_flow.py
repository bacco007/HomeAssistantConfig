import logging
from typing import Any

import aiohttp
import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.core import HomeAssistant

from .const import (
    CONF_API_KEY,
    CONF_RADIUS,
    CONF_SCAN_INTERVAL,
    DEFAULT_RADIUS_KM,
    DEFAULT_SCAN_INTERVAL_MINUTES,
    DOMAIN,
    API_BASE_URL,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
        vol.Optional(CONF_RADIUS, default=DEFAULT_RADIUS_KM): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=500)
        ),
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL_MINUTES): vol.All(
            vol.Coerce(int), vol.Range(min=2, max=60)
        ),
    }
)


async def validate_api_key(hass: HomeAssistant, api_key: str) -> bool:
    url = f"{API_BASE_URL}/incidents?limit=1"
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 401:
                    return False
                if resp.status == 200:
                    return True
                return False
    except aiohttp.ClientError:
        return False


class EmergencyAPIConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            api_key = user_input[CONF_API_KEY]

            valid = await validate_api_key(self.hass, api_key)
            if not valid:
                errors["base"] = "invalid_auth"
            else:
                await self.async_set_unique_id(api_key[:16])
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title="EmergencyAPI",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )
