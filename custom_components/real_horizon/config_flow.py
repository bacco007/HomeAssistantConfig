"""Config flow for Real Horizon. Single-instance, no user input."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import COORD_PRECISION, DOMAIN


class RealHorizonConfigFlow(ConfigFlow, domain=DOMAIN):
    """Add the integration with one click; lat/lon taken from HA config."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        lat = self.hass.config.latitude
        lon = self.hass.config.longitude

        if user_input is None:
            return self.async_show_form(
                step_id="user",
                description_placeholders={
                    "latitude": f"{lat:.{COORD_PRECISION}f}",
                    "longitude": f"{lon:.{COORD_PRECISION}f}",
                },
            )

        return self.async_create_entry(
            title="Real Horizon",
            data={"latitude": lat, "longitude": lon},
        )
