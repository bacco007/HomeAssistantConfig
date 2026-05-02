"""Adds config flow for Armadarr."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from pyarr import (
    AsyncBazarr,
    AsyncDispatcharr,
    AsyncLidarr,
    AsyncProwlarr,
    AsyncRadarr,
    AsyncReadarr,
    AsyncSonarr,
    AsyncWhisparr,
)

from .const import (
    APP_TYPES,
    CONF_API_KEY,
    CONF_APP_TYPE,
    CONF_UPCOMING_DAYS,
    CONF_URL,
    CONF_VERIFY_SSL,
    CONF_WANTED_COUNT,
    DEFAULT_UPCOMING_DAYS,
    DEFAULT_WANTED_COUNT,
    DOMAIN,
    LOGGER,
)

MEDIA_APPS = ["Sonarr", "Radarr", "Lidarr", "Readarr", "Whisparr"]


class ArmadarrFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Armadarr."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize."""
        self._config: dict[str, Any] = {}

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Handle a flow initialized by the user."""
        _errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await self._test_connection(
                    app_type=user_input[CONF_APP_TYPE],
                    url=user_input[CONF_URL],
                    api_key=user_input[CONF_API_KEY],
                    verify_ssl=user_input.get(CONF_VERIFY_SSL, True),
                )
            except Exception as exception:  # noqa: BLE001
                LOGGER.error(exception)
                _errors["base"] = "connection"
            else:
                self._config = user_input
                if user_input[CONF_APP_TYPE] in MEDIA_APPS:
                    return await self.async_step_options()

                return self._async_create_entry()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_APP_TYPE): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=APP_TYPES,
                            mode=selector.SelectSelectorMode.DROPDOWN,
                        ),
                    ),
                    vol.Required(CONF_URL): selector.TextSelector(
                        selector.TextSelectorConfig(
                            type=selector.TextSelectorType.URL,
                        ),
                    ),
                    vol.Required(CONF_API_KEY): selector.TextSelector(
                        selector.TextSelectorConfig(
                            type=selector.TextSelectorType.PASSWORD,
                        ),
                    ),
                    vol.Optional(
                        CONF_VERIFY_SSL, default=True
                    ): selector.BooleanSelector(),
                },
            ),
            errors=_errors,
        )

    async def async_step_options(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Handle options step."""
        if user_input is not None:
            self._config.update(user_input)
            return self._async_create_entry()

        return self.async_show_form(
            step_id="options",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_UPCOMING_DAYS, default=DEFAULT_UPCOMING_DAYS
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1, max=365, mode=selector.NumberSelectorMode.BOX
                        )
                    ),
                    vol.Optional(
                        CONF_WANTED_COUNT, default=DEFAULT_WANTED_COUNT
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1, max=500, mode=selector.NumberSelectorMode.BOX
                        )
                    ),
                },
            ),
        )

    def _async_create_entry(self) -> config_entries.ConfigFlowResult:
        """Create the config entry."""
        return self.async_create_entry(
            title=f"{self._config[CONF_APP_TYPE]} ({self._config[CONF_URL]})",
            data=self._config,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> ArmadarrOptionsFlowHandler:
        """Get the options flow for this handler."""
        return ArmadarrOptionsFlowHandler()

    async def _test_connection(
        self,
        app_type: str,
        url: str,
        api_key: str,
        *,
        verify_ssl: bool,
    ) -> None:
        """Validate connection."""
        session: Any = async_get_clientsession(self.hass)
        client: Any
        if app_type == "Sonarr":
            client = AsyncSonarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Radarr":
            client = AsyncRadarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Lidarr":
            client = AsyncLidarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Readarr":
            client = AsyncReadarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Prowlarr":
            client = AsyncProwlarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Bazarr":
            client = AsyncBazarr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Dispatcharr":
            client = AsyncDispatcharr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        elif app_type == "Whisparr":
            client = AsyncWhisparr(
                host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
            )
        else:
            msg = f"Unsupported app type: {app_type}"
            raise ValueError(msg)

        # Test connection by getting system status
        await client.system.get_status()


class ArmadarrOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle Armadarr options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        app_type = self.config_entry.data.get(CONF_APP_TYPE)
        schema_dict = {}

        if app_type in MEDIA_APPS:
            schema_dict.update(
                {
                    vol.Optional(
                        CONF_UPCOMING_DAYS,
                        default=self.config_entry.options.get(
                            CONF_UPCOMING_DAYS,
                            self.config_entry.data.get(
                                CONF_UPCOMING_DAYS, DEFAULT_UPCOMING_DAYS
                            ),
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1, max=365, mode=selector.NumberSelectorMode.BOX
                        )
                    ),
                    vol.Optional(
                        CONF_WANTED_COUNT,
                        default=self.config_entry.options.get(
                            CONF_WANTED_COUNT,
                            self.config_entry.data.get(
                                CONF_WANTED_COUNT, DEFAULT_WANTED_COUNT
                            ),
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1, max=500, mode=selector.NumberSelectorMode.BOX
                        )
                    ),
                }
            )

        if not schema_dict:
            return self.async_create_entry(title="", data={})

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema_dict),
        )
