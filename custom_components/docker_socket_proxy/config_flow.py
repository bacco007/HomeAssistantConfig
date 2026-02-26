"""Custom integration to integrate Docker Socket Proxy with Home Assistant.

For more details about this integration, please refer to
https://github.com/s-t-e-f-a-n/ha_docker_socket_proxy

Config flow for Docker Socket Proxy integration.
"""

from __future__ import annotations

import logging
from typing import Any

import aiohttp
from aiohttp import ClientTimeout
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME, CONF_URL
from homeassistant.core import callback

from .const import (
    CONF_GRACE_PERIOD_ENABLED,
    CONF_GRACE_PERIOD_SECONDS,
    CONF_SCAN_INTERVAL,
    DEFAULT_GRACE_PERIOD_ENABLED,
    DEFAULT_GRACE_PERIOD_SECONDS,
    DEFAULT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_URL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

# Schema for the initial setup dialog (Name and URL)
STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
        vol.Required(CONF_URL, default=DEFAULT_URL): str,
    }
)


class DockerProxyConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Docker Socket Proxy."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step when the user adds the integration."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Normalize URL by removing trailing slashes
            url = user_input[CONF_URL].rstrip("/")

            # Ensure the URL is unique to prevent duplicate integrations for the same host
            await self.async_set_unique_id(url)
            self._abort_if_unique_id_configured()

            try:
                # Validate the connection to the Docker Socket Proxy using the version endpoint
                timeout = ClientTimeout(total=5)
                async with (
                    aiohttp.ClientSession() as session,
                    session.get(f"{url}/version", timeout=timeout) as response,
                ):
                    if response.status != 200:
                        errors["base"] = "cannot_connect"
                    else:
                        # Success: Create entry and initialize options with defaults
                        return self.async_create_entry(
                            title=user_input[CONF_NAME],
                            data={
                                CONF_NAME: user_input[CONF_NAME],
                                CONF_URL: url,
                            },
                            options={
                                CONF_SCAN_INTERVAL: DEFAULT_SCAN_INTERVAL,
                                CONF_GRACE_PERIOD_ENABLED: DEFAULT_GRACE_PERIOD_ENABLED,
                                CONF_GRACE_PERIOD_SECONDS: DEFAULT_GRACE_PERIOD_SECONDS,
                            },
                        )
            except (aiohttp.ClientError, TimeoutError):
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception(
                    "Unexpected exception during Docker Socket Proxy validation"
                )
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> DockerOptionsFlowHandler:
        """Return the options flow handler for this integration."""
        return DockerOptionsFlowHandler()


class DockerOptionsFlowHandler(OptionsFlow):
    """Handle management of Docker Socket Proxy options (Grace Period & Intervals)."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the configuration options."""
        if user_input is not None:
            # Options were updated, save the data
            return self.async_create_entry(title="", data=user_input)

        # Retrieve current options, falling back to defaults if not yet set
        options = self.config_entry.options

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    # Frequency of data polling
                    vol.Required(
                        CONF_SCAN_INTERVAL,
                        default=options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                    ): vol.All(vol.Coerce(int), vol.Range(min=5, max=3600)),
                    # Tombstone management for inactive/missing containers
                    vol.Required(
                        CONF_GRACE_PERIOD_ENABLED,
                        default=options.get(
                            CONF_GRACE_PERIOD_ENABLED, DEFAULT_GRACE_PERIOD_ENABLED
                        ),
                    ): bool,
                    vol.Required(
                        CONF_GRACE_PERIOD_SECONDS,
                        default=options.get(
                            CONF_GRACE_PERIOD_SECONDS, DEFAULT_GRACE_PERIOD_SECONDS
                        ),
                    ): vol.All(vol.Coerce(int), vol.Range(min=0)),
                }
            ),
        )
