"""Config flow for Transport NSW Mk II integration."""
from __future__ import annotations
from TransportNSWv2 import InvalidAPIKey, APIRateLimitExceeded, StopError, TripError

import logging
import random
from typing import Any

import voluptuous as vol
#from homeassistant.helpers.selector import selector, BooleanSelector, BooleanSelectorConfig
import homeassistant.helpers.config_validation as cv
from homeassistant.data_entry_flow import section
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    SOURCE_RECONFIGURE,
    SOURCE_IMPORT
)
from homeassistant.const import (
    CONF_API_KEY,
    CONF_SCAN_INTERVAL
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.components import persistent_notification

from .const import *
from .helpers import get_trips, check_stops, get_stop_detail#, set_optional_sensors
from .subentry_flow import JourneySubEntryFlowHandler

_LOGGER = logging.getLogger(__name__)

async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> None:
    #Validate the user input is correct
    # Check that the API key is valid by calling the quick and easy 'stops' API with a hard-coded, known good station ID (Central Station)

    try:
        stop_data = await hass.async_add_executor_job (
             check_stops,
             data[CONF_API_KEY],
             [STOP_TEST_ID]
             )

    except InvalidAPIKey:
        raise InvalidAPIKey
    
    except APIRateLimitExceeded:
        raise APIRateLimitExceeded
    
    except StopError:
        raise StopError

    except Exception as ex:
        raise StopError


class TransportNSWConfigFlowHandler(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Transport NSW Mk II"""

    VERSION = 2
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


    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            if self.source == SOURCE_IMPORT:
                # There won't have been a previous key to check against so create an empty variable
                self._previous_key = ''

                # Also we don't need to do any validation as it's already been done elsewhere
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
                # The API key is confirmed to be valid - let's make sure there isn't another entry
                if user_input[CONF_API_KEY] != self._previous_key:
#                    reason = "reconfigure_successful"
                    existing_entry = await self.async_set_unique_id(user_input[CONF_API_KEY])
                else:
#                    reason = "reconfigure_successful_no_change"
                    existing_entry = None

                if self.source == SOURCE_IMPORT:
                    if existing_entry is not None:
                        # If we're importing but skipping, raise a persistent notification
                        persistent_notification.create(
                            self.hass,
                            f"Skipping the migration of legacy configuration.yaml entries for API key ending `{user_input[CONF_API_KEY][-4:]}` as they've already been imported, or there's already a config entry with the same key.\n\nPlease remove those entries from configuration.yaml.",
                            title='Transport NSW Mk II',
                            notification_id=f"{DOMAIN}_{user_input[CONF_API_KEY]}_unique_check"
                            )

                # Abort if it's already configured
                self._abort_if_unique_id_configured()

                # If we got there then there's no unique ID conflict
                if self.source == SOURCE_RECONFIGURE:
                    config_entry = self._get_reconfigure_entry()

                    # We don't have an update listener in place (it causes problems when adding multiple subentries in one go) so we need to force an update ourselves
                    return self.async_update_reload_and_abort(
                        config_entry,
                        data=user_input,
                        reload_even_if_entry_is_unchanged=False,
                        reason = f"reconfigure_successful_api_change_{str(user_input[CONF_API_KEY] != self._previous_key).lower()}"
                    )

                else:
                    # Create the config entry.
                    # Set our title variable here for use later

                    self._title = f"Transport NSW Mk II ({user_input[CONF_API_KEY][-4:]})"

                    if self.source == SOURCE_IMPORT:
                        # We want to create the config entry and then as many subentries as we've been provided
                        # The data for the config entry is a subset of what we've been provided via the import process
                        self._input_data = {CONF_API_KEY: user_input[CONF_API_KEY], CONF_SCAN_INTERVAL: user_input[CONF_SCAN_INTERVAL]}
                        subentry_data = user_input['subentry_data']
                        
                        persistent_notification.create(
                            self.hass,
                            f"Successfully imported legacy configuration.yaml entries for API key ending `{user_input[CONF_API_KEY][-4:]}` - please remove those entries from configuration.yaml.",
                            title='Transport NSW Mk II',
                            notification_id=f"{DOMAIN}_{user_input[CONF_API_KEY]}"
                            )
                        
                    else:
                        self._input_data = user_input
                        # We're just creating the config entry now
                        subentry_data = None
                        
                    return self.async_create_entry(
                        title=self._title,
                        data=self._input_data,
                        subentries = subentry_data
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
                vol.Required(
                    CONF_SCAN_INTERVAL,
                    default=user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                ): (vol.All(vol.Coerce(int), vol.Clamp(min=MIN_SCAN_INTERVAL))),
            }
        )

        # Show initial form
        return self.async_show_form(
            step_id="user", data_schema=USER_DATA_SCHEMA, errors=errors
        )

    async def async_step_import(self, user_input: dict[str, Any]):
#        # Make sure this entry hasn't been imported already
#        self._async_abort_entries_match(user_input)

#        # We're here so the config entry for this import hasn't been created already
        # We've been passed a complete subentry data-set, plus what we need to set up the initial config entry as well
        return await self.async_step_user(user_input = user_input)


    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None):
        return await self.async_step_user()

class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""




