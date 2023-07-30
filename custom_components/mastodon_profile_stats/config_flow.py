"""Adds config flow for MastodonProfileStats."""
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_URL
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from .api import (
    MastodonProfileStatsApiClient,
    MastodonProfileStatsApiClientCommunicationError,
    MastodonProfileStatsApiClientError,
)
from .const import DOMAIN, LOGGER
from .profile import MastodonProfile


class MastodonProfileStatsFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for MastodonProfileStats."""

    VERSION = 1
    _entry: config_entries.ConfigEntry | None

    async def async_step_user(
        self,
        user_input=None,
    ) -> config_entries.FlowResult:
        """Handle a flow initialized by the user."""
        _errors = {}

        if user_input is not None:
            # Construct the user profile
            user_profile = MastodonProfile(any_profile=user_input[CONF_URL])
            user_input[CONF_URL] = user_profile.profile_url

            try:
                await self._test_url(
                    entry=user_input,
                )
            except MastodonProfileStatsApiClientCommunicationError as exception:
                LOGGER.error(exception)
                _errors["base"] = "connection"
            except MastodonProfileStatsApiClientError as exception:
                LOGGER.exception(exception)
                _errors["base"] = "unknown"
            else:
                return self.async_create_entry(
                    title=user_profile.full_profile_name,
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_URL,
                        default=(user_input or {}).get(CONF_URL),
                    ): selector.TextSelector(
                        selector.TextSelectorConfig(
                            type=selector.TextSelectorType.TEXT
                        ),
                    ),
                }
            ),
            errors=_errors,
        )

    async def _test_url(self, entry) -> None:
        """Validate url."""

        # _LOGGER.debug(f"Profile {entry}")

        client = MastodonProfileStatsApiClient(
            session=async_create_clientsession(self.hass), entry=entry
        )
        await client.async_get_data()
