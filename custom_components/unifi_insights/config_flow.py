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

from .api import (
    ApiKeyAuth,
    ConnectionType,
    LocalAuth,
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiTimeoutError,
)
from .api.network import UniFiNetworkClient
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
        self._remote_api_key: str | None = None
        self._discovered_remote_consoles: dict[str, str] = {}

    @staticmethod
    @callback  # type: ignore[misc]
    def async_get_options_flow(
        config_entry: ConfigEntry,  # noqa: ARG004
    ) -> UnifiInsightsOptionsFlow:
        """Get the options flow for this handler."""
        return UnifiInsightsOptionsFlow()

    @staticmethod
    def _extract_remote_console_options(hosts: list[dict[str, Any]]) -> dict[str, str]:
        """Build selector labels for accessible remote consoles."""
        console_hosts: list[dict[str, Any]] = []
        network_servers: list[dict[str, Any]] = []

        for host in hosts:
            host_id = host.get("id")
            host_type = host.get("type")
            if (
                not isinstance(host_id, str)
                or not host_id
                or not isinstance(host_type, str)
            ):
                continue

            if host_type == "console":
                console_hosts.append(host)
            elif host_type == "network-server":
                network_servers.append(host)

        candidates = console_hosts or network_servers
        options: dict[str, str] = {}

        for host in sorted(candidates, key=lambda item: str(item.get("id", ""))):
            host_id = str(host["id"])
            reported_state = host.get("reportedState")
            hostname = (
                reported_state.get("hostname")
                if isinstance(reported_state, dict)
                else None
            )
            host_type = str(host.get("type", "console")).replace("-", " ")
            display_name = hostname or host_id
            options[host_id] = f"{display_name} ({host_type})"

        return options

    @staticmethod
    def _normalize_remote_console_id(
        console_id: str,
        discovered_consoles: dict[str, str],
    ) -> str | None:
        """Normalize manual or stored console IDs against discovered host IDs."""
        candidate = console_id.strip()
        if not candidate:
            return None

        lowered_candidate = candidate.lower()
        for discovered_id in discovered_consoles:
            lowered_discovered = discovered_id.lower()
            if lowered_candidate == lowered_discovered:
                return discovered_id

            discovered_prefix = lowered_discovered.split(":", 1)[0]
            if lowered_candidate == discovered_prefix:
                return discovered_id

        return None

    async def _async_discover_remote_consoles(self, api_key: str) -> dict[str, str]:
        """Discover accessible remote consoles for a UI.com API key."""
        auth = ApiKeyAuth(api_key=api_key)
        async with UniFiNetworkClient(
            auth=auth,
            connection_type=ConnectionType.REMOTE,
            timeout=30,
        ) as network_client:
            hosts = await network_client.get_hosts()

        return self._extract_remote_console_options(hosts)

    async def _async_validate_remote_console(
        self,
        api_key: str,
        console_id: str,
    ) -> bool:
        """Validate remote connectivity for a specific console host ID."""
        auth = ApiKeyAuth(api_key=api_key)
        async with UniFiNetworkClient(
            auth=auth,
            connection_type=ConnectionType.REMOTE,
            console_id=console_id,
            timeout=30,
        ) as network_client:
            sites = await network_client.sites.get_all()

        return bool(sites)

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
                api_key = user_input[CONF_API_KEY].strip()
                discovered_consoles = await self._async_discover_remote_consoles(
                    api_key
                )
                if not discovered_consoles:
                    errors["base"] = "no_remote_consoles"
                else:
                    self._remote_api_key = api_key
                    self._discovered_remote_consoles = discovered_consoles
                    return await self.async_step_select_console()

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
                self._remote_api_key = None
                self._discovered_remote_consoles = {}
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
                    vol.Required(CONF_API_KEY): str,
                }
            ),
            errors=errors,
        )

    async def async_step_select_console(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle remote console selection after API key validation."""
        if not self._remote_api_key or not self._discovered_remote_consoles:
            return await self.async_step_remote()

        errors = {}

        if user_input is not None:
            console_id = user_input[CONF_CONSOLE_ID]

            try:
                sites_found = await self._async_validate_remote_console(
                    self._remote_api_key,
                    console_id,
                )
                if sites_found:
                    await self.async_set_unique_id(self._remote_api_key)
                    self._abort_if_unique_id_configured()

                    return self.async_create_entry(
                        title="UniFi Insights (Cloud)",
                        data={
                            CONF_CONNECTION_TYPE: CONNECTION_TYPE_REMOTE,
                            CONF_CONSOLE_ID: console_id,
                            CONF_API_KEY: self._remote_api_key,
                        },
                    )

                errors[CONF_CONSOLE_ID] = "invalid_console_id"
            except UniFiAuthenticationError:
                errors[CONF_CONSOLE_ID] = "invalid_console_id"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception during console selection")
                errors["base"] = "unknown"

        options = [
            {"value": console_id, "label": label}
            for console_id, label in self._discovered_remote_consoles.items()
        ]

        return self.async_show_form(
            step_id="select_console",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_CONSOLE_ID): SelectSelector(
                        SelectSelectorConfig(
                            options=options,
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
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
                    api_key = user_input[CONF_API_KEY].strip()
                    discovered_consoles = await self._async_discover_remote_consoles(
                        api_key
                    )
                    if not discovered_consoles:
                        errors["base"] = "no_remote_consoles"
                    else:
                        console_id = self._normalize_remote_console_id(
                            reauth_entry.data.get(CONF_CONSOLE_ID, ""),
                            discovered_consoles,
                        )
                        if console_id is None:
                            errors["base"] = "invalid_console_id"
                        else:
                            try:
                                sites_found = await self._async_validate_remote_console(
                                    api_key,
                                    console_id,
                                )
                                if sites_found:
                                    return self.async_update_reload_and_abort(
                                        reauth_entry,
                                        data={
                                            **reauth_entry.data,
                                            CONF_API_KEY: api_key,
                                            CONF_CONSOLE_ID: console_id,
                                        },
                                    )
                                errors["base"] = "invalid_console_id"
                            except UniFiAuthenticationError:
                                errors["base"] = "invalid_console_id"

            except UniFiAuthenticationError:
                errors[CONF_API_KEY] = "invalid_auth"
            except UniFiConnectionError:
                errors["base"] = "cannot_connect"
            except UniFiTimeoutError:
                errors["base"] = "cannot_connect"
            except Exception:
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
                    api_key = user_input[CONF_API_KEY].strip()
                    discovered_consoles = await self._async_discover_remote_consoles(
                        api_key
                    )
                    if not discovered_consoles:
                        errors["base"] = "no_remote_consoles"
                    else:
                        console_id = self._normalize_remote_console_id(
                            user_input[CONF_CONSOLE_ID],
                            discovered_consoles,
                        )
                        if console_id is None:
                            errors[CONF_CONSOLE_ID] = "invalid_console_id"
                        else:
                            try:
                                sites_found = await self._async_validate_remote_console(
                                    api_key,
                                    console_id,
                                )
                                if sites_found:
                                    await self.async_set_unique_id(api_key)
                                    self._abort_if_unique_id_mismatch(
                                        reason="account_mismatch"
                                    )

                                    new_data = {
                                        CONF_CONNECTION_TYPE: CONNECTION_TYPE_REMOTE,
                                        CONF_CONSOLE_ID: console_id,
                                        CONF_API_KEY: api_key,
                                    }
                                    return self.async_update_reload_and_abort(
                                        entry,
                                        data=new_data,
                                    )
                                errors[CONF_CONSOLE_ID] = "invalid_console_id"
                            except UniFiAuthenticationError:
                                errors[CONF_CONSOLE_ID] = "invalid_console_id"

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
                            CONF_API_KEY,
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
                        CONF_API_KEY,
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
