"""Adds config flow for XMLTV."""

from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_HOST
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from .api import (
    XMLTVClient,
    XMLTVClientCommunicationError,
    XMLTVClientError,
)
from .const import (
    DEFAULT_ENABLE_UPCOMING_SENSOR,
    DEFAULT_PROGRAM_LOOKAHEAD,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    LOGGER,
    OPT_ENABLE_UPCOMING_SENSOR,
    OPT_PROGRAM_LOOKAHEAD,
    OPT_UPDATE_INTERVAL,
)


class XMLTVFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for XMLTV."""

    VERSION = 1

    async def async_step_user(
        self,
        user_input: dict | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Handle a flow initialized by the user."""
        _errors = {}
        if user_input is not None:
            try:
                generator_name = await self._test_connection(
                    url=user_input[CONF_HOST],
                )
            except XMLTVClientCommunicationError as exception:
                LOGGER.error(exception)
                _errors["base"] = "connection"
            except XMLTVClientError as exception:
                LOGGER.exception(exception)
                _errors["base"] = "unknown"
            else:
                return self.async_create_entry(
                    title=generator_name,
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HOST,
                        default=(user_input or {}).get(CONF_HOST),
                    ): selector.TextSelector(
                        selector.TextSelectorConfig(
                            type=selector.TextSelectorType.TEXT
                        ),
                    )
                }
            ),
            errors=_errors,
        )

    async def _test_connection(self, url: str) -> str:
        """Validate connection."""
        client = XMLTVClient(
            session=async_create_clientsession(self.hass),
            url=url,
        )
        guide = await client.async_get_data()
        if not guide:
            raise XMLTVClientCommunicationError("No data received")

        return guide.generator_name or ""

    @staticmethod
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        """Get options flow handler."""
        return XMLTVOptionsFlowHandler()


class XMLTVOptionsFlowHandler(config_entries.OptionsFlow):
    """XMLTV options flow."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize XMLTV options flow."""

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        """XMLTV Options Flow."""
        return await self.async_step_menu(user_input)

    async def async_step_menu(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        """XMLTV Options Flow."""
        if user_input is not None:
            return self.async_create_entry(
                data=user_input,
            )

        # show options form
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        OPT_UPDATE_INTERVAL,
                        default=self.config_entry.options.get(
                            OPT_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1,
                            step=1,
                            mode=selector.NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Required(
                        OPT_PROGRAM_LOOKAHEAD,
                        default=self.config_entry.options.get(
                            OPT_PROGRAM_LOOKAHEAD, DEFAULT_PROGRAM_LOOKAHEAD
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            step=1,
                            mode=selector.NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Required(
                        OPT_ENABLE_UPCOMING_SENSOR,
                        default=self.config_entry.options.get(
                            OPT_ENABLE_UPCOMING_SENSOR, DEFAULT_ENABLE_UPCOMING_SENSOR
                        ),
                    ): selector.BooleanSelector(),
                }
            ),
        )
