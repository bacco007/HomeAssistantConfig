"""Config flow for UniFi Insights integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_API_KEY, CONF_HOST, CONF_VERIFY_SSL
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)
from unifi_official_api import (
    ApiKeyAuth,
    ConnectionType,
    LocalAuth,
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiTimeoutError,
)
from unifi_official_api.network import UniFiNetworkClient

from .const import (
    CONF_CONNECTION_TYPE,
    CONF_CONSOLE_ID,
    CONF_TRACK_CLIENTS,
    CONF_TRACK_WIFI_CLIENTS,
    CONF_TRACK_WIRED_CLIENTS,
    CONNECTION_TYPE_LOCAL,
    CONNECTION_TYPE_REMOTE,
    DEFAULT_API_HOST,
    DEFAULT_TRACK_CLIENTS,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsConfigFlow(ConfigFlow, domain=DOMAIN):  # type: ignore[misc,call-arg]
    """Handle a config flow for UniFi Insights."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._connection_type: str | None = None

    @staticmethod
    @callback  # type: ignore[misc]
    def async_get_options_flow(
        config_entry: ConfigEntry,  # noqa: ARG004
    ) -> UnifiInsightsOptionsFlow:
        """Get the options flow for this handler."""
        return UnifiInsightsOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step - connection type selection."""
        if user_input is not None:
            self._connection_type = user_input[CONF_CONNECTION_TYPE]
            if self._connection_type == CONNECTION_TYPE_LOCAL:
                return await self.async_step_local()
            return await self.async_step_remote()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_CONNECTION_TYPE, default=CONNECTION_TYPE_LOCAL
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                {
                                    "value": CONNECTION_TYPE_LOCAL,
                                    "label": "Local (Direct connection)",
                                },
                                {
                                    "value": CONNECTION_TYPE_REMOTE,
                                    "label": "Remote (UniFi Cloud)",
                                },
                            ],
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
                }
            ),
        )

    async def async_step_local(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle local connection setup."""
        errors = {}

        if user_input is not None:
            try:
                # Create authentication object for local connection
                auth = LocalAuth(
                    api_key=user_input[CONF_API_KEY],
                    verify_ssl=user_input.get(CONF_VERIFY_SSL, False),
                )

                # Use context manager to ensure proper cleanup
                async with UniFiNetworkClient(
                    auth=auth,
                    base_url=user_input[CONF_HOST],
                    connection_type=ConnectionType.LOCAL,
                    timeout=30,
                ) as network_client:
                    # Validate by fetching sites
                    sites = await network_client.sites.get_all()
                    if sites:
                        await self.async_set_unique_id(user_input[CONF_API_KEY])
                        self._abort_if_unique_id_configured()

                        return self.async_create_entry(
                            title="UniFi Insights (Local)",
                            data={
                                CONF_CONNECTION_TYPE: CONNECTION_TYPE_LOCAL,
                                CONF_HOST: user_input[CONF_HOST],
                                CONF_API_KEY: user_input[CONF_API_KEY],
                                CONF_VERIFY_SSL: user_input.get(CONF_VERIFY_SSL, False),
                            },
                        )

                    errors[CONF_API_KEY] = "invalid_auth"

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="local",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HOST, default=DEFAULT_API_HOST): str,
                    vol.Required(CONF_API_KEY): str,
                    vol.Optional(CONF_VERIFY_SSL, default=False): bool,
                }
            ),
            errors=errors,
        )

    async def async_step_remote(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle remote/cloud connection setup."""
        errors = {}

        if user_input is not None:
            try:
                # Create authentication object for remote connection
                auth = ApiKeyAuth(api_key=user_input[CONF_API_KEY])

                # Use context manager to ensure proper cleanup
                async with UniFiNetworkClient(
                    auth=auth,
                    connection_type=ConnectionType.REMOTE,
                    console_id=user_input[CONF_CONSOLE_ID],
                    timeout=30,
                ) as network_client:
                    # Validate by fetching sites
                    sites = await network_client.sites.get_all()
                    if sites:
                        await self.async_set_unique_id(user_input[CONF_API_KEY])
                        self._abort_if_unique_id_configured()

                        return self.async_create_entry(
                            title="UniFi Insights (Cloud)",
                            data={
                                CONF_CONNECTION_TYPE: CONNECTION_TYPE_REMOTE,
                                CONF_CONSOLE_ID: user_input[CONF_CONSOLE_ID],
                                CONF_API_KEY: user_input[CONF_API_KEY],
                            },
                        )

                    errors[CONF_API_KEY] = "invalid_auth"

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="remote",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_CONSOLE_ID): str,
                    vol.Required(CONF_API_KEY): str,
                }
            ),
            errors=errors,
        )

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> ConfigFlowResult:
        """Handle reauthorization if the API key becomes invalid."""
        _ = entry_data
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Dialog that informs the user that reauth is required."""
        errors = {}
        reauth_entry = self._get_reauth_entry()
        connection_type = reauth_entry.data.get(
            CONF_CONNECTION_TYPE, CONNECTION_TYPE_LOCAL
        )

        if user_input is not None:
            try:
                if connection_type == CONNECTION_TYPE_LOCAL:
                    auth = LocalAuth(
                        api_key=user_input[CONF_API_KEY],
                        verify_ssl=reauth_entry.data.get(CONF_VERIFY_SSL, False),
                    )
                    async with UniFiNetworkClient(
                        auth=auth,
                        base_url=reauth_entry.data.get(CONF_HOST, DEFAULT_API_HOST),
                        connection_type=ConnectionType.LOCAL,
                        timeout=30,
                    ) as network_client:
                        sites = await network_client.sites.get_all()
                        if sites:
                            return self.async_update_reload_and_abort(
                                reauth_entry,
                                data={
                                    **reauth_entry.data,
                                    CONF_API_KEY: user_input[CONF_API_KEY],
                                },
                            )
                        errors[CONF_API_KEY] = "invalid_auth"
                else:
                    auth = ApiKeyAuth(api_key=user_input[CONF_API_KEY])
                    async with UniFiNetworkClient(
                        auth=auth,
                        connection_type=ConnectionType.REMOTE,
                        console_id=reauth_entry.data.get(CONF_CONSOLE_ID),
                        timeout=30,
                    ) as network_client:
                        sites = await network_client.sites.get_all()
                        if sites:
                            return self.async_update_reload_and_abort(
                                reauth_entry,
                                data={
                                    **reauth_entry.data,
                                    CONF_API_KEY: user_input[CONF_API_KEY],
                                },
                            )
                        errors[CONF_API_KEY] = "invalid_auth"

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:  # noqa: BLE001
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str}),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle reconfiguration of the integration."""
        errors = {}
        entry = self._get_reconfigure_entry()
        connection_type = entry.data.get(CONF_CONNECTION_TYPE, CONNECTION_TYPE_LOCAL)

        if user_input is not None:
            try:
                if connection_type == CONNECTION_TYPE_LOCAL:
                    auth = LocalAuth(
                        api_key=user_input[CONF_API_KEY],
                        verify_ssl=user_input.get(CONF_VERIFY_SSL, False),
                    )
                    async with UniFiNetworkClient(
                        auth=auth,
                        base_url=user_input[CONF_HOST],
                        connection_type=ConnectionType.LOCAL,
                        timeout=30,
                    ) as network_client:
                        sites = await network_client.sites.get_all()
                        if sites:
                            await self.async_set_unique_id(user_input[CONF_API_KEY])
                            self._abort_if_unique_id_mismatch(reason="account_mismatch")

                            return self.async_update_reload_and_abort(
                                entry,
                                data={
                                    CONF_CONNECTION_TYPE: CONNECTION_TYPE_LOCAL,
                                    CONF_HOST: user_input[CONF_HOST],
                                    CONF_API_KEY: user_input[CONF_API_KEY],
                                    CONF_VERIFY_SSL: user_input.get(
                                        CONF_VERIFY_SSL, False
                                    ),
                                },
                            )
                        errors[CONF_API_KEY] = "invalid_auth"
                else:
                    auth = ApiKeyAuth(api_key=user_input[CONF_API_KEY])
                    async with UniFiNetworkClient(
                        auth=auth,
                        connection_type=ConnectionType.REMOTE,
                        console_id=user_input[CONF_CONSOLE_ID],
                        timeout=30,
                    ) as network_client:
                        sites = await network_client.sites.get_all()
                        if sites:
                            await self.async_set_unique_id(user_input[CONF_API_KEY])
                            self._abort_if_unique_id_mismatch(reason="account_mismatch")

                            return self.async_update_reload_and_abort(
                                entry,
                                data={
                                    CONF_CONNECTION_TYPE: CONNECTION_TYPE_REMOTE,
                                    CONF_CONSOLE_ID: user_input[CONF_CONSOLE_ID],
                                    CONF_API_KEY: user_input[CONF_API_KEY],
                                },
                            )
                        errors[CONF_API_KEY] = "invalid_auth"

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception during reconfiguration")
                errors["base"] = "unknown"

        # Show form based on connection type
        if connection_type == CONNECTION_TYPE_LOCAL:
            return self.async_show_form(
                step_id="reconfigure",
                data_schema=vol.Schema(
                    {
                        vol.Required(
                            CONF_HOST,
                            default=entry.data.get(CONF_HOST, DEFAULT_API_HOST),
                        ): str,
                        vol.Required(
                            CONF_API_KEY, default=entry.data.get(CONF_API_KEY, "")
                        ): str,
                        vol.Optional(
                            CONF_VERIFY_SSL,
                            default=entry.data.get(CONF_VERIFY_SSL, False),
                        ): bool,
                    }
                ),
                errors=errors,
            )
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_CONSOLE_ID, default=entry.data.get(CONF_CONSOLE_ID, "")
                    ): str,
                    vol.Required(
                        CONF_API_KEY, default=entry.data.get(CONF_API_KEY, "")
                    ): str,
                }
            ),
            errors=errors,
        )


class UnifiInsightsOptionsFlow(OptionsFlow):  # type: ignore[misc]
    """Handle options for UniFi Insights integration."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Get current values, migrating from old CONF_TRACK_CLIENTS if needed
        old_track_clients = self.config_entry.options.get(
            CONF_TRACK_CLIENTS, DEFAULT_TRACK_CLIENTS
        )
        default_wifi = self.config_entry.options.get(
            CONF_TRACK_WIFI_CLIENTS, old_track_clients
        )
        default_wired = self.config_entry.options.get(
            CONF_TRACK_WIRED_CLIENTS, old_track_clients
        )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_TRACK_WIFI_CLIENTS,
                        default=default_wifi,
                    ): bool,
                    vol.Optional(
                        CONF_TRACK_WIRED_CLIENTS,
                        default=default_wired,
                    ): bool,
                }
            ),
        )
