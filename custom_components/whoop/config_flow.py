"""Config flow for WHOOP integration."""

import logging
from collections.abc import Mapping
from typing import Any, Dict

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlowResult
from homeassistant.core import callback
from homeassistant.helpers import config_entry_oauth2_flow
from homeassistant.helpers.aiohttp_client import (
    async_get_clientsession,
)
from homeassistant.helpers.config_entry_oauth2_flow import LocalOAuth2Implementation
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    DOMAIN,
    CONFIG_FLOW_VERSION,
    OAUTH2_AUTHORIZE,
    OAUTH2_TOKEN,
    SCOPES,
    CONF_DURATION_UNIT,
    CONF_ENERGY_UNIT,
    DURATION_SECONDS,
    DURATION_MINUTES,
    DURATION_HOURS,
    DURATION_MANUAL,
    ENERGY_KILOJOULES,
    ENERGY_KILOCALORIES,
    DEFAULT_DURATION_UNIT,
    DEFAULT_ENERGY_UNIT,
)
from .api import WhoopApiClient

_LOGGER = logging.getLogger(__name__)


@config_entries.HANDLERS.register(DOMAIN)
class WhoopConfigFlow(config_entry_oauth2_flow.AbstractOAuth2FlowHandler):
    """Handle a config flow for WHOOP."""

    VERSION = CONFIG_FLOW_VERSION
    DOMAIN = DOMAIN
    OAUTH2_CLIENT_NAME = "WHOOP"

    @property
    def flow_implementation(
        self,
    ) -> config_entry_oauth2_flow.AbstractOAuth2Implementation:
        """Return the OAuth2 implementation details for WHOOP."""
        _LOGGER.debug("Providing flow_implementation for WHOOP config flow")
        return LocalOAuth2Implementation(
            self.hass,
            self.DOMAIN,
            "dummy_client_id_for_form",
            "dummy_client_secret_for_form",
            OAUTH2_AUTHORIZE,
            OAUTH2_TOKEN,
            " ".join(SCOPES),
        )

    @property
    def logger(self) -> logging.Logger:
        """Return logger."""
        return _LOGGER

    @property
    def extra_authorize_data(self) -> Dict[str, Any]:
        """Ensure 'offline_access' is requested for refresh token capability."""
        current_scopes = list(SCOPES)
        if "offline_access" not in current_scopes:
            current_scopes.append("offline")

        data_to_send = {"scope": " ".join(current_scopes)}

        return data_to_send

    async def async_step_user(
        self, user_input: Dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initialized by the user."""
        _LOGGER.debug("WHOOP async_step_user, input: %s", user_input is not None)
        return await super().async_step_user(user_input)

    async def async_oauth_create_entry(self, data: Dict[str, Any]) -> ConfigFlowResult:
        """Create an entry for the flow after successful OAuth. Set a dynamic title."""
        _LOGGER.debug(
            "WHOOP OAuth successful, attempting to set dynamic title for config entry."
        )

        access_token = data.get("token", {}).get("access_token")
        if not access_token:
            _LOGGER.error("Access token not found in OAuth data during entry creation.")
            if self.source == config_entries.SOURCE_REAUTH:
                return self.async_abort(reason="reauth_failed")
            return self.async_create_entry(title=self.OAUTH2_CLIENT_NAME, data=data)

        session = async_get_clientsession(self.hass)
        api_client = WhoopApiClient(session, access_token)

        entry_title_name_part = "User"
        user_id = None

        # Only the profile fetch may fail benignly. Keep the unique_id /
        # AbortFlow checks below OUTSIDE this try: AbortFlow subclasses
        # Exception, so a broad except would swallow it and re-introduce the
        # duplicate-entry bug.
        try:
            profile = await api_client.get_user_profile_basic()
        except Exception as e:
            _LOGGER.error("Error fetching WHOOP profile for dynamic title: %s", e)
            profile = None

        if profile:
            user_id = profile.get("user_id")
            first_name = profile.get("first_name")
            if first_name:
                entry_title_name_part = first_name
            elif user_id:
                entry_title_name_part = f"User {user_id}"
        else:
            _LOGGER.warning("Could not fetch WHOOP profile to set a dynamic title.")

        entry_title = f"{entry_title_name_part}'s WHOOP"

        if self.source == config_entries.SOURCE_REAUTH:
            entry = self._get_reauth_entry()
            if not user_id:
                return self.async_abort(reason="reauth_failed")
            if entry.unique_id and str(user_id) != entry.unique_id:
                return self.async_abort(reason="wrong_account")
            # Resolve the unique_id only now that we intend to proceed; this also
            # returns any other entry already claiming this account.
            existing_entry = await self.async_set_unique_id(str(user_id))
            if (
                entry.unique_id is None
                and existing_entry is not None
                and existing_entry.entry_id != entry.entry_id
            ):
                # Legacy entry that never received a unique_id, but the resolved
                # account already belongs to another entry - don't duplicate it.
                return self.async_abort(reason="wrong_account")
            return self.async_update_reload_and_abort(
                entry,
                unique_id=str(user_id),
                title=entry_title,
                data=data,
            )

        if user_id:
            await self.async_set_unique_id(str(user_id))
            self._abort_if_unique_id_configured(updates=data)

        _LOGGER.info("Creating config entry with title '%s'", entry_title)
        return self.async_create_entry(
            title=entry_title,
            data=data,
            options={
                CONF_DURATION_UNIT: DEFAULT_DURATION_UNIT,
                CONF_ENERGY_UNIT: DEFAULT_ENERGY_UNIT,
            },
        )

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> ConfigFlowResult:
        """Perform reauth upon an API authentication error or explicit request."""
        _LOGGER.info(
            "[%s] Starting reauthentication flow based on entry_data.", self.handler
        )
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: Dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm reauth dialog."""
        if user_input is None:
            _LOGGER.debug(
                "[%s] Showing reauth_confirm form (user_input was None).", self.handler
            )
            return self.async_show_form(step_id="reauth_confirm")

        _LOGGER.debug(
            "[%s] Reauth confirmed, proceeding to user step to restart auth.",
            self.handler,
        )
        return await self.async_step_user()

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return WhoopOptionsFlowHandler()


class WhoopOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle WHOOP options."""

    async def async_step_init(
        self, user_input: Dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_DURATION_UNIT,
                        default=self.config_entry.options.get(
                            CONF_DURATION_UNIT, DEFAULT_DURATION_UNIT
                        ),
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                {"value": DURATION_SECONDS, "label": "Seconds"},
                                {"value": DURATION_MINUTES, "label": "Minutes"},
                                {"value": DURATION_HOURS, "label": "Hours"},
                                {"value": DURATION_MANUAL, "label": "Manual"},
                            ],
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    ),
                    vol.Optional(
                        CONF_ENERGY_UNIT,
                        default=self.config_entry.options.get(
                            CONF_ENERGY_UNIT, DEFAULT_ENERGY_UNIT
                        ),
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                {"value": ENERGY_KILOJOULES, "label": "Kilojoules (kJ)"},
                                {"value": ENERGY_KILOCALORIES, "label": "Calories (kcal)"},
                            ],
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    ),
                }
            ),
        )
