"""Config flow for Transport NSW Mk II integration."""
from __future__ import annotations
from TransportNSWv2 import (
    InvalidAPIKey,
    APIRateLimitExceeded,
    StopError,
    TripError
)

import logging
from typing import Any

import voluptuous as vol
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
)
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    OptionsFlowWithReload,
    SOURCE_RECONFIGURE,
    SOURCE_IMPORT
)
from homeassistant.data_entry_flow import FlowResult
from homeassistant.const import (
    CONF_API_KEY,
    CONF_SCAN_INTERVAL
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.components.persistent_notification import async_create as async_create_notification

from .const import (
    API_DAILY_LIMIT,
    CONF_API_PERCENT,
    CONF_REQUEST_LOCATION_UPDATE,
    DEFAULT_API_PERCENT,
    DEFAULT_REQUEST_LOCATION_UPDATE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MIN_SCAN_INTERVAL,
    STOP_TEST_ID,
    SUBENTRY_TYPE_JOURNEY,
    TFNSW_REGISTRATION,
)
from .helpers import check_stops
from .subentry_flow import JourneySubEntryFlowHandler

_LOGGER = logging.getLogger(__name__)

async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> None:
    """ Validate the user input is correct
        Check that the API key is valid by calling the quick and easy 'stops' API with a hard-coded, known good station ID (Central Station). """

    try:
        # We don't actually care about the returned value, just need to force a check and see if any errors are raised
        stop_data = await hass.async_add_executor_job (
            check_stops,
            data[CONF_API_KEY],
            [STOP_TEST_ID]
        )

    # Testing simpler exception type
    except (InvalidAPIKey, APIRateLimitExceeded, StopError):
        raise

    except Exception as ex:
        raise StopError from ex


class TransportNSWConfigFlowHandler(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Transport NSW Mk II"""

    VERSION = 3
    MINOR_VERSION = 0

    _input_data: dict[str, Any]

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
        ) -> dict[str, type[ConfigSubentryFlow]]:
            # Return subentries supported by this integration

            return {
                SUBENTRY_TYPE_JOURNEY: JourneySubEntryFlowHandler
            }

    async def async_step_user(self, user_input: dict[str, Any] | None = None ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            if self.source == SOURCE_IMPORT:
                # There won't have been a previous key to check against so create an empty 'previous key' variable
                # Also we don't need to do any validation as it's already been done elsewhere
                self._previous_key = ''
            else:
                # The form has been filled in and submitted, so process the data provided.
                try:
                    # Validate that the setup data is valid and if not handle errors
                    await validate_input(self.hass, user_input)
    
                except InvalidAPIKey as ex:
                    errors["base"] = "invalidapikey"
            
                except APIRateLimitExceeded as ex:
                    errors["base"] = "apiratelimitexceeded"
            
                except StopError as ex:
                    errors["base"] = "stoperror"
            
                except TripError as ex:
                    errors["base"] = "triperror"
            
                except Exception as err:
                    errors["base"] = "unknown"

            if not errors:
                # The API key is confirmed to be valid so set the entry unique ID based on the API key - we'll check for uniqueness shortly
                existing_entry = await self.async_set_unique_id(user_input[CONF_API_KEY])

                if self.source == SOURCE_RECONFIGURE:
                    if user_input[CONF_API_KEY] != self._previous_key:
                        # We're reconfiguring and the API key is changing.  Make sure there isn't already an entry with the same key
                        self._abort_if_unique_id_configured()

                        # Still here?  There's no existing integration with the new API key
                        reason = "reconfigure_successful"
                    else:
                        # The API key hasn't changed - and with no other options we can just abort
                        return self.async_abort(
                            reason="reconfigure_successful_no_change"
                        )

                    # Get a reference to the config entry that's being reconfigured
                    config_entry = self._get_reconfigure_entry()

                    # Get the scan_interval value now otherwise it will be lost
                    current_data = dict(config_entry.data)
                    combined_data = {
                        **current_data,
                        **user_input
                    }

                    # We don't have an update listener in place (it causes problems when adding multiple subentries in one go) so we need to force a reload ourselves, rather than just doing the entry update and having a listener catch it
                    return self.async_update_reload_and_abort(
                        config_entry,
                        title=f"Transport NSW Mk II ({user_input[CONF_API_KEY][-4:]})",
                        unique_id=user_input[CONF_API_KEY],
                        data=combined_data,
                        reload_even_if_entry_is_unchanged=False,
                        reason = f"reconfigure_successful_api_change_{str(user_input[CONF_API_KEY] != self._previous_key).lower()}"
                    )

                elif self.source == SOURCE_IMPORT:
                    if existing_entry is not None:
                        # Looks like we're trying to re-import an existing entry, so create a persistent notification and abort
                        async_create_notification(
                            self.hass,
                            f"Skipping the migration of legacy configuration.yaml entries for API key ending `{user_input[CONF_API_KEY][-4:]}` as they've already been imported, or there's already a config entry with the same key.\n\nPlease remove those entries from configuration.yaml.",
                            title='Transport NSW Mk II',
                            notification_id=f"{DOMAIN}_{user_input[CONF_API_KEY]}_unique_check"
                            )

                        self._abort_if_unique_id_configured()

                else:
                    # It's a brand new config entry, but we still need to check for a unique id conflict
                    self._abort_if_unique_id_configured()

                # If we're here we're creating a new config entry, either via an import or via the user's ConfigFlow
                # Set our title variable here for use later

                if self.source == SOURCE_IMPORT:
                    # We want to create the config entry and then as many subentries as we've been provided
                    # The data for the config entry is a subset of what we've been provided via the import process
                    self._input_data = {
                        CONF_API_KEY: user_input[CONF_API_KEY],
                        
                    }
                    subentry_data = user_input['subentry_data']
                    
                    # Create a persistent notification now, we won't have a chance later
                    persistent_notification.create(
                        self.hass,
                        f"Successfully imported legacy configuration.yaml entries for API key ending `{user_input[CONF_API_KEY][-4:]}` - please remove those entries from configuration.yaml.",
                        title='Transport NSW Mk II',
                        notification_id=f"{DOMAIN}_{user_input[CONF_API_KEY]}"
                        )
                    
                else:
                    self._input_data = user_input
                    # We're just creating a brand new config entry
                    subentry_data = None

                # Actually create the config entry (and optionally the subentries if we're importing)
                return self.async_create_entry(
                    title=f"Transport NSW Mk II ({user_input[CONF_API_KEY][-4:]})",
                    data=self._input_data,
                    subentries=subentry_data
                    )

        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_entry = self._get_reconfigure_entry()
                user_input = dict(config_entry.data)
                self._input_data = user_input
                self._previous_key = user_input[CONF_API_KEY]
            else:
                user_input = {}
                self._previous_key = ''

        USER_DATA_SCHEMA = vol.Schema(
            {
                vol.Required(CONF_API_KEY, default = user_input.get(CONF_API_KEY,'')): str,
            }
        )

        description_placeholders = {
            "tfnsw_registration": TFNSW_REGISTRATION
        }

        # Show initial form
        return self.async_show_form(
            step_id="user",
            data_schema=USER_DATA_SCHEMA,
            errors=errors,
            last_step = True,
            description_placeholders = description_placeholders
        )

    async def async_step_import(self, user_input: dict[str, Any]) -> ConfigFlowResult:
        # We're here so the config entry for this import hasn't been created already
        # We've been passed a complete subentry data-set, plus what we need to set up the initial config entry as well
        return await self.async_step_user(user_input = user_input)


    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None):
        # Deliberately not passing user_input through, so the 'show form' code will run - there's specific SOURCE_RECONFIGURE to handle getting the current info
        return await self.async_step_user()


    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> TransportNSWOptionsFlowHandler:
        return TransportNSWOptionsFlowHandler()

class TransportNSWOptionsFlowHandler(OptionsFlowWithReload):
    """TransportNSW config flow options handler - we don't have an options change listener hence using OptionsFlowWithReload"""

    async def async_step_init(
        self,
        user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the options flow"""

        errors: dict[str, str] = {}
        description_placeholders: dict[str, str] = {}

        OPTIONS_SCHEMA = vol.Schema(
            {
                vol.Required(CONF_SCAN_INTERVAL, default = self.config_entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)): int,
                vol.Required(CONF_API_PERCENT, default = self.config_entry.options.get(CONF_API_PERCENT, DEFAULT_API_PERCENT)): NumberSelector(NumberSelectorConfig(min=1, max=100, step=1, mode=NumberSelectorMode.BOX,)),
                vol.Optional(CONF_REQUEST_LOCATION_UPDATE, default = self.config_entry.options.get(CONF_REQUEST_LOCATION_UPDATE, DEFAULT_REQUEST_LOCATION_UPDATE)): bool,
            }
        )

        if user_input is not None:
            # Check for errors
            update_interval = user_input[CONF_SCAN_INTERVAL]
            if update_interval != 0 and update_interval < MIN_SCAN_INTERVAL:
                errors['base'] = 'bad_update_interval'
                description_placeholders['min_scan_interval'] = MIN_SCAN_INTERVAL

            if 'base' not in errors:
                return self.async_create_entry(data=user_input)

        description_placeholders['api_daily_limit'] = API_DAILY_LIMIT
        
        # Show the options form
        return self.async_show_form(
            step_id="init",
            errors=errors,
            data_schema=OPTIONS_SCHEMA,
            description_placeholders=description_placeholders,
            )

class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""
