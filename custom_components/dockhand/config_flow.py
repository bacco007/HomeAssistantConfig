from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .api import DockhandAuthError, DockhandClient
from .const import (
    CONF_API_TOKEN,
    CONF_API_URL,
    CONF_ENABLE_CONTAINER_STATS,
    CONF_ENABLE_IMAGES,
    CONF_ENABLE_NETWORKS,
    CONF_ENABLE_PRECISE_UPDATES,
    CONF_ENABLE_RUNTIME_CONTROLS,
    CONF_ENABLE_SCHEDULES,
    CONF_ENABLE_VOLUMES,
    CONF_POLL_INTERVAL,
    CONF_POLL_INTERVAL_SLOW,
    CONF_POLL_INTERVAL_UPDATES,
    CONF_VERIFY_SSL,
    DEFAULT_ENABLE_CONTAINER_STATS,
    DEFAULT_ENABLE_IMAGES,
    DEFAULT_ENABLE_NETWORKS,
    DEFAULT_ENABLE_PRECISE_UPDATES,
    DEFAULT_ENABLE_RUNTIME_CONTROLS,
    DEFAULT_ENABLE_SCHEDULES,
    DEFAULT_ENABLE_VOLUMES,
    DEFAULT_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL_SLOW,
    DEFAULT_POLL_INTERVAL_UPDATES,
    DOMAIN,
    MIN_POLL_INTERVAL,
    MIN_POLL_INTERVAL_SLOW,
    MIN_POLL_INTERVAL_UPDATES,
)

DEFAULT_VERIFY_SSL = True


def _connection_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    """Initial setup step: URL and SSL only. Token collected separately if needed."""
    d = defaults or {}
    return vol.Schema(
        {
            vol.Required(CONF_API_URL, default=d.get(CONF_API_URL, "")): str,
            vol.Optional(
                CONF_VERIFY_SSL, default=d.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            ): bool,
        }
    )


def _reconfigure_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    """Reconfigure step: URL, SSL, and token.

    The token field is pre-populated (masked) with the existing token so the
    user can see one is stored.  Clearing it and submitting will probe without
    auth — if the server still requires it, the user will be prompted again.
    """
    d = defaults or {}
    return vol.Schema(
        {
            vol.Required(CONF_API_URL, default=d.get(CONF_API_URL, "")): str,
            vol.Optional(
                CONF_VERIFY_SSL, default=d.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            ): bool,
            vol.Optional(
                CONF_API_TOKEN, default=d.get(CONF_API_TOKEN, "")
            ): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD)),
        }
    )


def _token_schema() -> vol.Schema:
    """Step 2: API token — only shown when server requires authentication."""
    return vol.Schema(
        {
            vol.Required(CONF_API_TOKEN): TextSelector(
                TextSelectorConfig(type=TextSelectorType.PASSWORD)
            ),
        }
    )


def _options_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    d = defaults or {}
    return vol.Schema(
        {
            vol.Optional(
                CONF_POLL_INTERVAL,
                default=d.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
            ): vol.All(vol.Coerce(int), vol.Range(min=MIN_POLL_INTERVAL)),
            vol.Optional(
                CONF_POLL_INTERVAL_SLOW,
                default=d.get(CONF_POLL_INTERVAL_SLOW, DEFAULT_POLL_INTERVAL_SLOW),
            ): vol.All(vol.Coerce(int), vol.Range(min=MIN_POLL_INTERVAL_SLOW)),
            vol.Optional(
                CONF_ENABLE_SCHEDULES,
                default=d.get(CONF_ENABLE_SCHEDULES, DEFAULT_ENABLE_SCHEDULES),
            ): bool,
            vol.Optional(
                CONF_ENABLE_IMAGES,
                default=d.get(CONF_ENABLE_IMAGES, DEFAULT_ENABLE_IMAGES),
            ): bool,
            vol.Optional(
                CONF_ENABLE_VOLUMES,
                default=d.get(CONF_ENABLE_VOLUMES, DEFAULT_ENABLE_VOLUMES),
            ): bool,
            vol.Optional(
                CONF_ENABLE_NETWORKS,
                default=d.get(CONF_ENABLE_NETWORKS, DEFAULT_ENABLE_NETWORKS),
            ): bool,
            vol.Optional(
                CONF_ENABLE_CONTAINER_STATS,
                default=d.get(
                    CONF_ENABLE_CONTAINER_STATS, DEFAULT_ENABLE_CONTAINER_STATS
                ),
            ): bool,
            vol.Optional(
                CONF_ENABLE_PRECISE_UPDATES,
                default=d.get(
                    CONF_ENABLE_PRECISE_UPDATES, DEFAULT_ENABLE_PRECISE_UPDATES
                ),
            ): bool,
            vol.Optional(
                CONF_POLL_INTERVAL_UPDATES,
                default=d.get(
                    CONF_POLL_INTERVAL_UPDATES, DEFAULT_POLL_INTERVAL_UPDATES
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=MIN_POLL_INTERVAL_UPDATES)),
            # Deliberately last: a genuinely advanced setting (exposes
            # write-capable number/select entities that change a
            # container's actual runtime config), unlike everything above
            # it, which is either a poll-interval tweak or a read-only
            # visibility toggle for data most users want fairly often.
            vol.Optional(
                CONF_ENABLE_RUNTIME_CONTROLS,
                default=d.get(
                    CONF_ENABLE_RUNTIME_CONTROLS, DEFAULT_ENABLE_RUNTIME_CONTROLS
                ),
            ): bool,
        }
    )


class DockhandConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 2

    def __init__(self) -> None:
        # Accumulates data across multi-step flows.
        self._connection_data: dict[str, Any] = {}
        # Stores confirmed connection data while the setup_options step runs.
        self._confirmed_data: dict[str, Any] = {}
        # Tracks which flow triggered the token step.
        # Values: "user" | "reauth" | "reconfigure"
        self._flow_origin: str = "user"

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> DockhandOptionsFlow:
        """Return the options flow handler."""
        return DockhandOptionsFlow(config_entry)

    # ------------------------------------------------------------------ #
    # Step 1: connection settings (URL + SSL only)
    # ------------------------------------------------------------------ #

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """First step: URL and settings. Probe server to detect auth requirement."""
        errors: dict[str, str] = {}
        if user_input is not None:
            unique_id = user_input[CONF_API_URL].rstrip("/").lower()
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()

            verify_ssl = user_input.get(CONF_VERIFY_SSL, True)
            session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
            client = DockhandClient(session, user_input)
            try:
                await client.async_probe()
                # Probe succeeded with no token — auth is disabled.
                # Proceed to options step to collect poll/feature preferences.
                self._confirmed_data = user_input
                return await self.async_step_setup_options()
            except DockhandAuthError:
                # Server requires authentication — proceed to token step.
                self._connection_data = user_input
                self._flow_origin = "user"
                return await self.async_step_token()
            except Exception:
                errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="user",
            data_schema=_connection_schema(user_input or {}),
            errors=errors,
        )

    # ------------------------------------------------------------------ #
    # Step 2: API token (only reached when server returned 401)
    # ------------------------------------------------------------------ #

    async def async_step_token(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Token step — shown only when the server requires authentication."""
        errors: dict[str, str] = {}
        if user_input is not None:
            merged = {**self._connection_data, **user_input}
            verify_ssl = merged.get(CONF_VERIFY_SSL, True)
            session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
            client = DockhandClient(session, merged)
            try:
                await client.async_probe()

                if self._flow_origin == "user":
                    # Connection confirmed with token — collect options next.
                    self._confirmed_data = merged
                    return await self.async_step_setup_options()

                # reauth and reconfigure — update the existing entry
                entry = self.hass.config_entries.async_get_entry(
                    self.context["entry_id"]
                )
                if entry:
                    # async_update_entry() alone is enough now — __init__.py
                    # registers an update listener that reloads the entry
                    # whenever data/options change, so an explicit reload
                    # here would just be a redundant second one.
                    self.hass.config_entries.async_update_entry(entry, data=merged)
                reason = (
                    "reauth_successful"
                    if self._flow_origin == "reauth"
                    else "reconfigure_successful"
                )
                return self.async_abort(reason=reason)

            except DockhandAuthError:
                errors["base"] = "invalid_auth"
            except Exception:
                errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="token",
            data_schema=_token_schema(),
            errors=errors,
        )

    # ------------------------------------------------------------------ #
    # Re-authentication (token revoked / auth re-enabled on no-auth install)
    # ------------------------------------------------------------------ #

    async def async_step_reauth(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        if user_input is not None and entry:
            merged = {**entry.data, **user_input}
            verify_ssl = merged.get(CONF_VERIFY_SSL, True)
            session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
            client = DockhandClient(session, merged)
            try:
                await client.async_probe()
                # async_update_entry() alone triggers a reload via
                # __init__.py's update listener now — an explicit reload
                # here would be redundant.
                self.hass.config_entries.async_update_entry(entry, data=merged)
                return self.async_abort(reason="reauth_successful")
            except DockhandAuthError:
                errors["base"] = "invalid_auth"
            except Exception:
                errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=_token_schema(),
            errors=errors,
        )

    # ------------------------------------------------------------------ #
    # Step 3: poll intervals and optional features (initial setup only)
    # ------------------------------------------------------------------ #

    async def async_step_setup_options(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Collect poll intervals and feature flags during initial setup.

        Stores them directly into entry.options so the Options flow can
        present and edit them without touching entry.data.
        """
        if user_input is not None:
            return self.async_create_entry(
                title=self._confirmed_data[CONF_API_URL],
                data=self._confirmed_data,
                options=user_input,
            )
        return self.async_show_form(
            step_id="setup_options",
            data_schema=_options_schema(),
        )

    # ------------------------------------------------------------------ #
    # Reconfigure (change URL, SSL, or token; behaviour/poll in Options)
    # ------------------------------------------------------------------ #

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Reconfigure connection settings (URL, SSL, token).

        The token field is pre-populated with the existing token (masked).
        - Leave as-is or change it → probe with that token
        - Clear it → probe without auth; if server still requires auth, route
          to the token step so the user can re-enter one
        Polling intervals and feature flags live in the Options flow.
        """
        errors: dict[str, str] = {}
        entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        if user_input is not None and entry:
            submitted_token = (user_input.get(CONF_API_TOKEN) or "").strip()

            probe_data = {
                CONF_API_URL: user_input[CONF_API_URL],
                CONF_VERIFY_SSL: user_input.get(CONF_VERIFY_SSL, True),
                **({CONF_API_TOKEN: submitted_token} if submitted_token else {}),
            }
            verify_ssl = probe_data.get(CONF_VERIFY_SSL, True)
            session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
            client = DockhandClient(session, probe_data)
            try:
                await client.async_probe()
                # Probe succeeded — save exactly what was submitted.
                # If token was cleared and probe passed, auth is disabled; strip it.
                updated = {**entry.data, **probe_data}
                if not submitted_token:
                    updated.pop(CONF_API_TOKEN, None)
                # async_update_entry() alone triggers a reload via
                # __init__.py's update listener now — an explicit reload
                # here would be redundant.
                self.hass.config_entries.async_update_entry(entry, data=updated)
                return self.async_abort(reason="reconfigure_successful")
            except DockhandAuthError:
                # Auth still required — prompt for token.
                self._connection_data = probe_data
                self._flow_origin = "reconfigure"
                return await self.async_step_token()
            except Exception:
                errors["base"] = "cannot_connect"

        defaults = entry.data if entry else {}
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_reconfigure_schema(defaults),
            errors=errors,
        )


class DockhandOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)
        defaults = {**self._entry.data, **self._entry.options}
        return self.async_show_form(
            step_id="init", data_schema=_options_schema(defaults)
        )
