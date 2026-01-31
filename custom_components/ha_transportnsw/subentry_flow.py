"""Subentry flow for Transport NSW Mk II integration."""
from __future__ import annotations
from TransportNSWv2 import InvalidAPIKey, APIRateLimitExceeded, StopError, TripError

import logging
import copy
from typing import Any

import voluptuous as vol
from homeassistant.helpers.selector import selector#, BooleanSelector, BooleanSelectorConfig
import homeassistant.helpers.config_validation as cv
from homeassistant.data_entry_flow import section
from homeassistant.config_entries import (
    #ConfigEntry,
    #ConfigFlow,
    ConfigFlowResult,
    ConfigSubentry,
    ConfigSubentryFlow,
    SubentryFlowResult,
    #OptionsFlow,
    SOURCE_RECONFIGURE
)
from homeassistant.const import (
    CONF_API_KEY,
    CONF_NAME,
    CONF_SCAN_INTERVAL,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError

from .const import *
from .helpers import (
    get_trips,
    check_stops,
    set_optional_sensors,
    get_device_trackers
)

_LOGGER = logging.getLogger(__name__)

def convert_transport_types_numeric_to_friendly(transport_type_list: dict[str]) -> dict[int]:
    # Convert the text-based transport types to their numeric equivalents
    # If empty, just use 0 'all transport types'
    if not transport_type_list:
        return DEFAULT_TRANSPORT_TYPE_SELECTOR

    temp_list = []
    for transport_type in transport_type_list:
        temp_list.append(TRANSPORT_TYPE.get(transport_type, 0))

    return temp_list

def convert_transport_types_friendly_to_numeric(transport_type_list: dict[str]) -> dict[str]:
    # Convert the text-based transport types to their numeric equivalents
    # If empty, just use 0 'all transport types'
    if not transport_type_list:
        return [0]

    temp_list = []
    for transport_type in transport_type_list:
        # Find the key that suits this value
        keys = [key for key, value in TRANSPORT_TYPE.items() if value == transport_type]
        temp_list.append(keys[0])

    return temp_list

def create_subentries(self, config_entry, input_data):

    description_placeholders = {}
    description_placeholders['plural'] = ''

    if input_data[CONF_CREATE_REVERSE_TRIP]:

        # There and back again (two subentries)
        description_placeholders['plural'] = 's'

        return_data = copy.deepcopy(input_data)
        return_data[CONF_ORIGIN_ID] = input_data[CONF_DESTINATION_ID]
        return_data[CONF_ORIGIN_NAME] = input_data[CONF_DESTINATION_NAME]
        return_data[CONF_ORIGIN_TRANSPORT_TYPE] = input_data[CONF_DESTINATION_TRANSPORT_TYPE]
        return_data[CONF_DESTINATION_ID] = input_data[CONF_ORIGIN_ID]
        return_data[CONF_DESTINATION_NAME] = input_data[CONF_ORIGIN_NAME]
        return_data[CONF_DESTINATION_TRANSPORT_TYPE] = input_data[CONF_ORIGIN_TRANSPORT_TYPE]
        del return_data[CONF_CREATE_REVERSE_TRIP]
        
        unique_id_destination = '_'.join(return_data[CONF_DESTINATION_ID])
        self.hass.config_entries.async_add_subentry(
            config_entry,
            ConfigSubentry(
                data=return_data,
                subentry_type=SUBENTRY_TYPE_JOURNEY,
                title=f"{return_data[CONF_ORIGIN_NAME]} to {return_data[CONF_DESTINATION_NAME]}",
                unique_id=f"{return_data[CONF_ORIGIN_ID]}_{unique_id_destination}"
            ),
        )

    del input_data[CONF_CREATE_REVERSE_TRIP]

    unique_id_destination = '_'.join(input_data[CONF_DESTINATION_ID])
    self.hass.config_entries.async_add_subentry(
        config_entry,
        ConfigSubentry(
            data=input_data,
            subentry_type=SUBENTRY_TYPE_JOURNEY,
            title=f"{input_data[CONF_ORIGIN_NAME]} to {input_data[CONF_DESTINATION_NAME]}",
            unique_id=f"{input_data[CONF_ORIGIN_ID]}_{unique_id_destination}"
        ),
    )

    description_placeholders ['title'] = 'title placeholder'    

    return description_placeholders

class JourneySubEntryFlowHandler(ConfigSubentryFlow):
    """Handle a subentry flow for Transport NSW MK II"""

    async def _validate_input(self, hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
        """ Check that the provided stops are valid.  We'll also use this call to get the stop names
            This tests the API key as well.  Exceptions will be caught upstream """

        errors: dict[str, str] = {}
        config_entry = self._get_entry()

        # Is the origin a device tracker?  If so we don't need to check that it's a valid stop
        if CONF_ORIGIN_TYPE in data and data[CONF_ORIGIN_TYPE] == 'device_tracker':
            # Do a quick 'fail-fast' check
            if data[CONF_CREATE_REVERSE_TRIP]:
                # We can't create the reverse trip with a device tracker as the origin
                errors['base'] = "return_journey_device_tracker_error"
                return "", errors

            entity_info = get_device_trackers(hass, data[CONF_ORIGIN_ID])
            stop_list = data[CONF_DESTINATION_ID]

        # CONF_DESTINATION_ID is always going to be a list, but if there's more than one then we can't create a reverse trip also
        else:
            if len(data[CONF_DESTINATION_ID]) > 1:
                if data[CONF_CREATE_REVERSE_TRIP]:
                    # We can't create the reverse trip 
                    errors['base'] = "return_journey_multiple_destination_error"
                    return "", errors

            stop_list = data[CONF_DESTINATION_ID]
            stop_list.insert (0, data[CONF_ORIGIN_ID])

        try:
            stop_data = await hass.async_add_executor_job (
                 check_stops,
                 config_entry.data[CONF_API_KEY],
                 stop_list
                 )

            if 'all_stops_valid' in stop_data and stop_data['all_stops_valid'] == True:
                # Get the origin and destination stop names, we'll need them to name the subentry

                if data[CONF_ORIGIN_TYPE] == 'device_tracker':
                    data[CONF_ORIGIN_NAME] = entity_info[0]['label']
                    data[CONF_DESTINATION_NAME] = stop_data['stop_list'][0]['stop_detail']['disassembledName']
                    data[CONF_DESTINATION_ID] = stop_data['stop_list'][0]['stop_id']
                else:
                    data[CONF_ORIGIN_NAME] = stop_data['stop_list'][0]['stop_detail']['disassembledName']
                    data[CONF_ORIGIN_ID] = stop_data['stop_list'][0]['stop_id']

                    # Strip out the destination ID(s)
                    destination_stops = stop_data['stop_list'][1:]
                    if len(destination_stops) == 1:
                        data[CONF_DESTINATION_NAME] = destination_stops[0]['stop_detail']['disassembledName']
                        data[CONF_DESTINATION_ID] = [destination_stops[0]['stop_id']]
                    else:
                        # Multiple destinations were provided, so create an appropriate destination name and list of IDs
                        data[CONF_DESTINATION_NAME] = ""
                        data[CONF_DESTINATION_ID] = []

                        for index, value in enumerate(destination_stops):
                            data[CONF_DESTINATION_ID].append(destination_stops[index]['stop_id'])
                            if index == 0:
                                separator = ""
                            elif (index + 1) == len(destination_stops):
                                separator = " or "
                            else:
                                separator = ", "
                            
                            data[CONF_DESTINATION_NAME] += f"{separator}{destination_stops[index]['stop_detail']['disassembledName']}"

                return {
                    "title": f"{data[CONF_ORIGIN_NAME]} to {data[CONF_DESTINATION_NAME]}"
                }, errors

            else:
                # Find out which stops were bad
                if stop_data['stop_list'][0]['valid'] == False and stop_data['stop_list'][1]['valid'] == False:
                    raise StopError("Both stops are invalid", "stoperror_both")

                elif stop_data['stop_list'][0]['valid'] == False and stop_data['stop_list'][1]['valid'] == True:
                    raise StopError("The origin stop ID is invalid", "stoperror_origin")

                else:
                    raise StopError("The destination stop ID is invalid", "stoperror_destination")

                # Unecessary catch-all!
                raise StopError

        except InvalidAPIKey as ex:
            raise InvalidAPIKey
        
        except APIRateLimitExceeded as ex:
            raise APIRateLimitExceeded
        
        except StopError as ex:
            raise StopError(ex, ex.stop_detail)
        
        except Exception as ex:
            raise StopError("Unknown error checking stop IDs", "stoperror")

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Handle the initial step."""
        
        # Called when you initiate adding an integration via the UI
        errors: dict[str, str] = {}

        if user_input is not None:
            if 'device_tracker.' in user_input[CONF_ORIGIN_ID]:
                origin_type = 'device_tracker'
            else:
                origin_type = 'stop'

            user_input.update(
                {CONF_ORIGIN_TYPE: origin_type}
                )

            # The form has been filled in and submitted, so process the data provided.
            try:
                # Validate that the setup data is valid and if not handle errors.
                info, errors = await self._validate_input(self.hass, user_input)

            except InvalidAPIKey as ex:
                errors["base"] = "invalidapikey"
        
            except APIRateLimitExceeded as ex:
                errors["base"] = "apiratelimitexceeded"

            except StopError as ex:
                errors["base"] = ex.stop_detail
        
            except TripError as ex:
                errors["base"] = "triperror"
        
            except Exception as ex:
                errors["base"] = "unknown"

            # Check for errors
            if "base" not in errors:
                # Validation was successful, so create a unique id for this instance 
                # and create the config subentry.
    
                # Check the unique ID against the existing subentries
                # The actual unique ID will be set during subentry creation later

                # It's possible that the stop validation function returned better stop IDs, so use them
                unique_id_destination = '_'.join(user_input[CONF_DESTINATION_ID])
                unique_id = f"{user_input[CONF_ORIGIN_ID]}_{unique_id_destination}"

                if self.source != SOURCE_RECONFIGURE:
                    for existing_subentry in self._get_entry().subentries.values():
                        if existing_subentry.unique_id == unique_id:
                            errors["base"] = "outbound_already_configured"
    
                    if user_input[CONF_CREATE_REVERSE_TRIP]:
                        unique_id_destination = '_'.join(input_data[CONF_DESTINATION_ID])
                        unique_id = f"{unique_id_destination}_{user_input[CONF_ORIGIN_ID]}"
    
                        for existing_subentry in self._get_entry().subentries.values():
                            if existing_subentry.unique_id == unique_id:
                                errors["base"] = "return_already_configured"

            # Check for errors again - duplicate journeys are an error
            if "base" not in errors:
                # Validation was successful, create the config subentry/subentries
                
                # Add an empty CONF_NAME field - it's only used for migrated journeys, journeys created via config flow way will use the new naming convention
                user_input.update(
                    {CONF_NAME: ''}
                    )
                
                self._input_data = user_input
                placeholders = {"journey_name": info['title']}
                self.context["title_placeholders"] = placeholders

                # Call the next step
                return await self.async_step_settings()

        # Are we reconfiguring or are we creating a new journey?
        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_subentry = self._get_reconfigure_subentry()
                user_input = dict(config_subentry.data)

                JOURNEY_DATA_SCHEMA = vol.Schema(
                    {
                        vol.Required(CONF_ORIGIN_ID, default = user_input.get(CONF_ORIGIN_ID, "")): str,
                        vol.Required(CONF_DESTINATION_ID, default = user_input.get(CONF_DESTINATION_ID, "")): str,
                    }
                )

            else:
                # We need to create an empty user_input as the upcoming schema definition requires it
                # Otherwise we'd have three distinct schema definition creation sections which seems... inelegent?
                user_input = {}

        options = get_device_trackers(self.hass, "")

        JOURNEY_DATA_SCHEMA = vol.Schema(
            {
#                vol.Required(CONF_ORIGIN_ID, default = user_input.get(CONF_ORIGIN_ID, "")): str,
                vol.Required(CONF_ORIGIN_ID, default = user_input.get(CONF_ORIGIN_ID, ""),): selector (
                        {
                            "select": {
                                "options": options,
                                "mode": 'dropdown',
                                "custom_value": True
                        }
                    }
                ),
#                vol.Required(CONF_DESTINATION_ID, default = user_input.get(CONF_DESTINATION_ID, "")): str,
                vol.Required(CONF_DESTINATION_ID, default = user_input.get(CONF_DESTINATION_ID, ""),): selector (
                        {
                            "select": {
                                "mode": 'dropdown',
                                "custom_value": True,
                                "multiple": True,
                                "options": []
                        }
                    }
                ),
                vol.Required(CONF_CREATE_REVERSE_TRIP, default = user_input.get(CONF_CREATE_REVERSE_TRIP, DEFAULT_CREATE_REVERSE_TRIP)): bool,
             }
        )

        # Show initial form.
        return self.async_show_form(
            step_id="user", data_schema=JOURNEY_DATA_SCHEMA, errors=errors, last_step = False
        )

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:

        errors: dict[str, str] = {}
        if user_input is not None:
            # Convert the selected transport types to their numerical equivalents for the API
            user_input[CONF_ORIGIN_TRANSPORT_TYPE] = convert_transport_types_friendly_to_numeric(user_input[CONF_ORIGIN_TRANSPORT_TYPE])
            user_input[CONF_DESTINATION_TRANSPORT_TYPE] = convert_transport_types_friendly_to_numeric(user_input[CONF_DESTINATION_TRANSPORT_TYPE])

            self._input_data.update(user_input)

            return await self.async_step_sensors()     

        # Are we reconfiguring or is are we creating a new journey?
        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_subentry = self._get_reconfigure_subentry()
                user_input = dict(config_subentry.data)
                self._input_data = user_input

                default_origin_type = convert_transport_types_numeric_to_friendly(user_input[CONF_ORIGIN_TRANSPORT_TYPE])

                default_destination_type = convert_transport_types_numeric_to_friendly(user_input[CONF_DESTINATION_TRANSPORT_TYPE])

            else:
                user_input = {}
                default_origin_type = DEFAULT_TRANSPORT_TYPE_SELECTOR
                default_destination_type = DEFAULT_TRANSPORT_TYPE_SELECTOR
                description_placeholders = {"journey_name": self.context['title_placeholders']['journey_name']}

            if CONF_ORIGIN_TYPE in self._input_data and self._input_data[CONF_ORIGIN_TYPE] == 'device_tracker':
                description_placeholders = {
                    "journey_name": f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}",
                    "journey_description": "As this journey starts with your location the assumption is that the first leg will be a walk - so any transport type filters will apply from the second leg."
                }
            else:
                description_placeholders = {
                    "journey_name": f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}",
                    "journey_description": "Only journeys with origin and destination legs that start and end with your selected transport types will be considered valid, so if you don't mind a little bit of a walk at either end (getting off at Gadigal Station and walking to Town Hall Station for example), make sure you select 'Walk' as an option."
                }

            STEP_SETTINGS_DATA_SCHEMA = vol.Schema(
                {
                    vol.Required(CONF_ORIGIN_TRANSPORT_TYPE, default=default_origin_type): cv.multi_select(ORIGIN_TRANSPORT_TYPE_LIST),
                    vol.Required(CONF_DESTINATION_TRANSPORT_TYPE, default=default_destination_type): cv.multi_select(DESTINATION_TRANSPORT_TYPE_LIST),
                    vol.Optional(CONF_ROUTE_FILTER, default = user_input.get(CONF_ROUTE_FILTER, DEFAULT_ROUTE_FILTER)): str,
                    vol.Required(CONF_TRIP_WAIT_TIME, default = user_input.get(CONF_TRIP_WAIT_TIME, DEFAULT_TRIP_WAIT_TIME)): vol.All(vol.Coerce(int), vol.Range(min=1, max=MAX_TRIP_WAIT_TIME)),
                }
            )

            return self.async_show_form(
                step_id="settings",
                data_schema=STEP_SETTINGS_DATA_SCHEMA,
                errors=errors,
                last_step=False,
                description_placeholders = description_placeholders
            )

    async def async_step_sensors(self, user_input=None):
        # Handle sensor options

        """Handle options flow."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._input_data.update(user_input)
                 
            if self._input_data[CONF_SENSOR_CREATION] != 'custom':
                user_input[CONF_INCLUDE_REALTIME_LOCATION] = True
                self._input_data.update(user_input)

                sensor_options = set_optional_sensors(self._input_data[CONF_SENSOR_CREATION])

                # Add to the options
                self._input_data.update(sensor_options)

            # We may need to go to the alerts selection page, the custom sensors selection page, or both
            if self._input_data[CONF_ALERTS_SENSOR]:
                # Show the alerts form - it will then show the custom sensors form if required
                return await self.async_step_alerts()
            else:
                self._input_data.update(
                    {
                    CONF_ALERT_SEVERITY: 'none',
                    CONF_ALERT_TYPES: []
                    }
                )
             
            if self._input_data[CONF_SENSOR_CREATION] == 'custom':
                # Show the next form so the user can select which sensors to create
                return await self.async_step_custom_sensors()

            # No more flows to process so we can create/update the subentries as required
            if self.source == SOURCE_RECONFIGURE:
                # We don't need to recreate the subentry, just refresh and reload the one we're reconfiguring
                unique_id_destination = '_'.join(self._input_data[CONF_DESTINATION_ID])
                return self.async_update_reload_and_abort(
                    self._get_entry(),
                    self._get_reconfigure_subentry(),
                    unique_id = f"{self._input_data[CONF_ORIGIN_ID]}_{unique_id_destination}",
                    data = self._input_data,
                    title=f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"
                )

            else:
                description_placeholders = create_subentries(self, self._get_entry(), self._input_data)

                # We don't have an update listener in place, it causes issues if adding multiple subentries in one go, so we force an update here
                await self.hass.config_entries.async_reload(self._get_entry().entry_id)

                return self.async_abort(
                    reason="subentries_created",
                    description_placeholders=description_placeholders,
                )
                    

        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_subentry = self._get_reconfigure_subentry()
                user_input = dict(config_subentry.data)
            else:
                user_input = {}

            STEP_SENSORS_SCHEMA = vol.Schema(
                {
                    vol.Required(
                        CONF_ALERTS_SENSOR, default=user_input.get(CONF_ALERTS_SENSOR, DEFAULT_ALERTS_SENSOR),
                    ): bool,
                    vol.Required(CONF_TRIPS_TO_CREATE, default = user_input.get(CONF_TRIPS_TO_CREATE, DEFAULT_TRIPS_TO_CREATE)): vol.All(vol.Coerce(int), vol.Range(min=1, max=3)),
                    vol.Required(CONF_SENSOR_CREATION, default = user_input.get(CONF_SENSOR_CREATION, DEFAULT_SENSOR_CREATION),): selector (
                            {
                                "select": {
                                    "options": ['none', 'changes_and_times', 'verbose', 'custom'],
                                    "mode": 'dropdown',
                                    "translation_key": 'sensor_creation_selector',
                            }
                        }
                    ),
                }
            )

            return self.async_show_form(
                step_id="sensors",
                data_schema=STEP_SENSORS_SCHEMA,
                errors=errors,
                last_step=False,
                description_placeholders = {"journey_name": f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"}
            )

    async def async_step_alerts(self, user_input=None):
        # Handle alerts if requested

        errors: dict[str, str] = {}

        if user_input is not None:
            self._input_data.update(user_input)

            if self._input_data[CONF_SENSOR_CREATION] == 'custom':
                # Show the 'custom sensors' options page, it will be responsible for updating the entry at the end
                return await self.async_step_custom_sensors()
            else:
                # No more flows to process so we can create/update the subentries as required
                if self.source == SOURCE_RECONFIGURE:
                    unique_id_destination = '_'.join(self._input_data[CONF_DESTINATION_ID])
                    return self.async_update_reload_and_abort(
                        self._get_entry(),
                        self._get_reconfigure_subentry(),
                        unique_id = f"{self._input_data[CONF_ORIGIN_ID]}_{unique_id_destination}",
                        data = self._input_data,
                        title=f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"
                    )
                else:
                    description_placeholders = create_subentries(self, self._get_entry(), self._input_data)

                    await self.hass.config_entries.async_reload(self._get_entry().entry_id)

                    return self.async_abort(
                        reason="subentries_created",
                        description_placeholders=description_placeholders,
                    )


        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_subentry = self._get_reconfigure_subentry()
                user_input = dict(config_subentry.data)
            else:
                user_input = {}

            alerts_schema = vol.Schema(
                {
                    vol.Required(CONF_ALERT_SEVERITY, default = user_input.get(CONF_ALERT_SEVERITY, DEFAULT_ALERT_SEVERITY),): selector (
                            {
                                "select": {
                                    "options": ['verylow', 'low', 'normal', 'high', 'veryhigh'],
                                    "mode": "dropdown",
                                    "multiple": False,
                                    "translation_key": 'alert_priority_selector',
                            }
                        }
                    ),
                    vol.Required(CONF_ALERT_TYPES, default = user_input.get(CONF_ALERT_TYPES, DEFAULT_ALERT_TYPES),): selector (
                            {
                                "select": {
                                    "options": DEFAULT_ALERT_TYPES,
                                    "mode": "list",
                                    "multiple": True,
                                    "translation_key": 'alert_type_selector',
                            }
                        }
                    )
                }
            )

            if self._input_data[CONF_SENSOR_CREATION] == 'custom':
                last_step = False
            else:
                last_step = True

            return self.async_show_form(
                step_id="alerts",
                data_schema=alerts_schema,
                errors=errors,
                last_step=last_step,
                description_placeholders = {"journey_name": f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"}
            )


    async def async_step_custom_sensors(self, user_input=None):
        # Handle customer sensors if requested

        if user_input is not None:
            if (user_input['device_trackers'][CONF_FIRST_LEG_DEVICE_TRACKER]) or (user_input['device_trackers'][CONF_LAST_LEG_DEVICE_TRACKER] in ['if_not_duplicated', 'always']):
                user_input[CONF_INCLUDE_REALTIME_LOCATION] = True
            else:
                user_input[CONF_INCLUDE_REALTIME_LOCATION] = False
            
            self._input_data.update(user_input)

            # This is the last step so create the subentries, unless we're reconfiguring in which case just update, reload and abort
            if self.source == SOURCE_RECONFIGURE:
                return self.async_update_reload_and_abort(
                    self._get_entry(),
                    self._get_reconfigure_subentry(),
                    unique_id = f"{self._input_data[CONF_ORIGIN_ID]}_{self._input_data[CONF_DESTINATION_ID]}",
                    data = self._input_data,
                    title=f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"
                )
            else:
                description_placeholders = create_subentries(self, self._get_entry(), self._input_data)
                
                await self.hass.config_entries.async_reload(self._get_entry().entry_id)

                return self.async_abort(
                    reason="subentries_created",
                    description_placeholders=description_placeholders,
                )
            
        if user_input is None:
            if self.source == SOURCE_RECONFIGURE:
                config_subentry = self._get_reconfigure_subentry()
                user_input = dict(config_subentry.data)
            else:
                user_input = {}
                user_input['time_and_change_sensors'] = {}
                user_input['origin_sensors'] = {}
                user_input['destination_sensors'] = {}
                user_input['device_trackers'] = {}
        
            ADDITIONAL_SENSORS_SCHEMA = vol.Schema(
                {
                    vol.Required(CONF_CHANGES_SENSOR, default = user_input['time_and_change_sensors'].get(CONF_CHANGES_SENSOR,DEFAULT_CHANGES_SENSOR)): bool,
                    vol.Required(CONF_DELAY_SENSOR, default = user_input['time_and_change_sensors'].get(CONF_DELAY_SENSOR,DEFAULT_DELAY_SENSOR)): bool,
                    vol.Required(CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR, default = user_input['time_and_change_sensors'].get(CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR, DEFAULT_FIRST_LEG_DEPARTURE_TIME_SENSOR)): bool,
                    vol.Required(CONF_LAST_LEG_ARRIVAL_TIME_SENSOR, default = user_input['time_and_change_sensors'].get(CONF_LAST_LEG_ARRIVAL_TIME_SENSOR, DEFAULT_LAST_LEG_ARRIVAL_TIME_SENSOR)): bool
                }
            )

            ORIGIN_SENSORS_SCHEMA = vol.Schema(
                {
                    vol.Required(CONF_ORIGIN_NAME_SENSOR, default = user_input['origin_sensors'].get(CONF_ORIGIN_NAME_SENSOR, DEFAULT_ORIGIN_NAME_SENSOR)): bool,
                    vol.Required(CONF_ORIGIN_DETAIL_SENSOR, default = user_input['origin_sensors'].get(CONF_ORIGIN_DETAIL_SENSOR, DEFAULT_ORIGIN_DETAIL_SENSOR)): bool,
                    vol.Required(CONF_FIRST_LEG_LINE_NAME_SENSOR, default = user_input['origin_sensors'].get(CONF_FIRST_LEG_LINE_NAME_SENSOR, DEFAULT_FIRST_LEG_LINE_NAME_SENSOR)): bool,
                    vol.Required(CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR, default = user_input['origin_sensors'].get(CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR, DEFAULT_FIRST_LEG_LINE_NAME_SHORT_SENSOR)): bool,
                    vol.Required(CONF_FIRST_LEG_OCCUPANCY_SENSOR, default = user_input['origin_sensors'].get(CONF_FIRST_LEG_OCCUPANCY_SENSOR, DEFAULT_FIRST_LEG_OCCUPANCY_SENSOR)): bool
                }
            )

            DESTINATION_SENSORS_SCHEMA = vol.Schema(
                {
                    vol.Required(CONF_DESTINATION_NAME_SENSOR, default = user_input['destination_sensors'].get(CONF_DESTINATION_NAME_SENSOR, DEFAULT_DESTINATION_NAME_SENSOR)): bool,
                    vol.Required(CONF_DESTINATION_DETAIL_SENSOR, default = user_input['destination_sensors'].get(CONF_DESTINATION_DETAIL_SENSOR, DEFAULT_DESTINATION_DETAIL_SENSOR)): bool,
                    vol.Required(CONF_LAST_LEG_LINE_NAME_SENSOR, default = user_input['destination_sensors'].get(CONF_LAST_LEG_LINE_NAME_SENSOR, DEFAULT_LAST_LEG_LINE_NAME_SENSOR)): bool,
                    vol.Required(CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR, default = user_input['destination_sensors'].get(CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR, DEFAULT_LAST_LEG_LINE_NAME_SHORT_SENSOR)): bool,
                    vol.Required(CONF_LAST_LEG_OCCUPANCY_SENSOR, default = user_input['destination_sensors'].get(CONF_LAST_LEG_OCCUPANCY_SENSOR, DEFAULT_LAST_LEG_OCCUPANCY_SENSOR)): bool
                }
            )

            DEVICE_TRACKER_SENSORS_SCHEMA = vol.Schema(
                {
                    vol.Required(CONF_FIRST_LEG_DEVICE_TRACKER, default = user_input['device_trackers'].get(CONF_FIRST_LEG_DEVICE_TRACKER, DEFAULT_FIRST_LEG_DEVICE_TRACKER)): selector (
                            {
                                "select": {
                                    "options": ['never', 'always'],
                                    "mode": 'dropdown',
                                    "translation_key": 'transport_device_tracker_selector',
                            }
                        }
                    ),
                    vol.Required(CONF_LAST_LEG_DEVICE_TRACKER, default = user_input['device_trackers'].get(CONF_LAST_LEG_DEVICE_TRACKER, DEFAULT_LAST_LEG_DEVICE_TRACKER)): selector (
                            {
                                "select": {
                                    "options": ['never', 'if_not_duplicated', 'always'],
                                    "mode": 'dropdown',
                                    "translation_key": 'transport_device_tracker_selector',
                            }
                        }
                    ),
                    vol.Required(CONF_ORIGIN_DEVICE_TRACKER, default = user_input['device_trackers'].get(CONF_ORIGIN_DEVICE_TRACKER, DEFAULT_ORIGIN_DEVICE_TRACKER)): selector (
                            {
                                "select": {
                                    "options": ['never', 'if_device_tracker_journey', 'always'],
                                    "mode": 'dropdown',
                                    "translation_key": 'stops_device_tracker_selector',
                            }
                        }
                    ),
                    vol.Required(CONF_DESTINATION_DEVICE_TRACKER, default = user_input['device_trackers'].get(CONF_DESTINATION_DEVICE_TRACKER, DEFAULT_DESTINATION_DEVICE_TRACKER)): selector (
                            {
                                "select": {
                                    "options": ['never', 'if_device_tracker_journey', 'always'],
                                    "mode": 'dropdown',
                                    "translation_key": 'stops_device_tracker_selector',
                            }
                        }
                    )
                }
            )

            custom_schema = {
                    vol.Required("time_and_change_sensors"): section(
                        ADDITIONAL_SENSORS_SCHEMA,
                        {"collapsed": True},
                    ),
                    vol.Required("origin_sensors"): section(
                        ORIGIN_SENSORS_SCHEMA,
                        {"collapsed": True},
                    ),
                    vol.Required("destination_sensors"): section(
                        DESTINATION_SENSORS_SCHEMA,
                        {"collapsed": True},
                    ),
                    vol.Required("device_trackers"): section(
                        DEVICE_TRACKER_SENSORS_SCHEMA,
                        {"collapsed": True},
                    )
                }

            return self.async_show_form(
                step_id="custom_sensors",
                data_schema=vol.Schema(custom_schema),
                description_placeholders = {"journey_name": f"{self._input_data[CONF_ORIGIN_NAME]} to {self._input_data[CONF_DESTINATION_NAME]}"},
                last_step = True
                )


    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """User flow to modify an existing location."""
        
        return await self.async_step_settings()     #TODO - support going to async_step_users (with all that that implies re total changes)


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""

class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""

