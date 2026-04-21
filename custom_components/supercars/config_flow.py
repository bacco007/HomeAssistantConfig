"""Config flow for Supercars Championship integration."""
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
import aiohttp

from .const import DOMAIN, NATSOFT_URL


async def _test_connection(hass: HomeAssistant) -> bool:
    """Try to reach the Natsoft endpoint."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                NATSOFT_URL, timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                return resp.status == 200
    except Exception:
        return False


class SupercarsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Supercars."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Single-step setup — no credentials needed, just confirm."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}

        if user_input is not None:
            ok = await _test_connection(self.hass)
            if ok:
                return self.async_create_entry(
                    title="Supercars Championship",
                    data={},
                )
            errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "natsoft_url": NATSOFT_URL,
            },
            errors=errors,
        )
