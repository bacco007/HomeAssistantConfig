"""Transport NSW Mk II DataUpdateCoordinator."""

from dataclasses import dataclass
from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_KEY,
    CONF_NAME,
    CONF_SCAN_INTERVAL,
    UnitOfTime, 
)
from homeassistant.core import DOMAIN, HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.location import find_coordinates
from .const import *
from .helpers import get_trips, get_api_calls, set_api_calls

_LOGGER = logging.getLogger(__name__)


class TransportNSWCoordinator(DataUpdateCoordinator):
    """Transport NSW Mk II coordinator."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize coordinator."""


        # set variables from options
        self.hass = hass
        self.config_entry = config_entry
        self.poll_interval = config_entry.data[CONF_SCAN_INTERVAL]
        self.api_calls = 0      # We'll update it properly later, in the async function async_update_data
        
        # Initialise DataUpdateCoordinator
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN} ({config_entry.entry_id})",
            update_method=self.async_update_data,
            update_interval=timedelta(seconds=self.poll_interval),
        )


    async def async_update_data(self):
        """Fetch data from API endpoint.
        """
        
        # TODO - option/mandate no updates between certain times,when the trains/buses aren't running?
        # TODO - option to only run between certain times (user-specified), and increase the poll rate for shorter windows?
        
        # First, populate self.api_calls
        if self.api_calls == 0:
            # Try and load it
            try:
                self.api_calls = await self.hass.async_add_executor_job(
                    get_api_calls,
                    f'{self.hass.config.config_dir}/custom_components/{DOMAIN}/.{DOMAIN}_{self.config_entry.data[CONF_API_KEY]}.json',
                    )
                
            except:
                self.api_calls = 0


        # Iterate through all the subentries of the correct type, saving the responses into a list which we'll return at the end
        returned_data = {}
                
        for subentry in self.config_entry.subentries.values():
            if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
                # Call the trip API
                # If the origin is a device tracker, we need to get the latest location first
                if CONF_ORIGIN_TYPE in subentry.data and subentry.data[CONF_ORIGIN_TYPE] == 'device_tracker':
                    try:
                        origin_coordinates = find_coordinates(self.hass, subentry.data[CONF_ORIGIN_ID])

                        # Create the coordinate string in the format required by the API
                        origin = f"{origin_coordinates.split(',')[1]}:{origin_coordinates.split(',')[0]}:EPSG:4326"

                    except Exception as ex:
                        raise UpdateFailed(f"Error {ex} retrieving coordinates from {subentry.data[CONF_ORIGIN_ID]}") from ex

                else:
                    origin = subentry.data[CONF_ORIGIN_ID]
                    
                try:
                    _LOGGER.debug(f"Calling get_trips: origin = {origin}, destination_id = {subentry.data[CONF_DESTINATION_ID]}, trip_wait_time = {subentry.data[CONF_TRIP_WAIT_TIME]}, origin_transport_type = {subentry.data[CONF_ORIGIN_TRANSPORT_TYPE]}, destination_transport_type = {subentry.data[CONF_DESTINATION_TRANSPORT_TYPE]}, route_filter = {subentry.data[CONF_ROUTE_FILTER]}, include_realtime_location = {subentry.data[CONF_INCLUDE_REALTIME_LOCATION]}")
                    journey_data = await self.hass.async_add_executor_job(
                        get_trips,
                        self.config_entry.data[CONF_API_KEY],
                        origin,
                        subentry.data[CONF_DESTINATION_ID],
                        subentry.data[CONF_TRIP_WAIT_TIME],
                        subentry.data[CONF_ORIGIN_TRANSPORT_TYPE],
                        subentry.data[CONF_DESTINATION_TRANSPORT_TYPE], 
                        True,
                        subentry.data[CONF_ROUTE_FILTER],
                        subentry.data[CONF_TRIPS_TO_CREATE],
                        subentry.data[CONF_INCLUDE_REALTIME_LOCATION],
                        subentry.data[CONF_ALERTS_SENSOR],
                        subentry.data[CONF_ALERT_SEVERITY],
                        subentry.data[CONF_ALERT_TYPES]
                        )
                    _LOGGER.debug(f"Return from get_trips: {journey_data}")

                    if journey_data is not None and 'journeys_with_data' in journey_data and journey_data['journeys_with_data'] > 0:
                        if 'journeys' in journey_data:
                            returned_data[subentry.subentry_id] = journey_data['journeys']

                        # Increment the API counter if that info has been returned, and include that in the response also
                        if API_CALLS in journey_data:
                            self.api_calls += journey_data[API_CALLS]
                        else:
                            # The average is 3 calls per journey
                            self.api_calls += 3

                        returned_data[self.config_entry.entry_id] = {API_CALLS: self.api_calls}

                    else:
                        # No journeys were returned, but the API call itself didn't fail
                        # Offer a slightly different warning message if it's a forced train journey
                        if subentry.data[CONF_ORIGIN_TRANSPORT_TYPE]  == [1]:
                            _LOGGER.warning (f"No data returned for train-only journey {subentry.title} - there may be a bus replacement service active at the moment.")
                        else:
                            _LOGGER.warning(f"No data returned for journey {subentry.title} - consider relaxing the journey restrictions.")

                except Exception as ex:
                    # This will show entities as unavailable by raising UpdateFailed exception
                    # Not entirely sure how that works though TBH so I'm also checking/setting in sensor.py
                    raise UpdateFailed(f"Error communicating with API: {ex}") from ex

        # Update the persistent API counter
        self.api_calls = await self.hass.async_add_executor_job(
            set_api_calls,
            f'{self.hass.config.config_dir}/custom_components/{DOMAIN}/.{DOMAIN}_{self.config_entry.data[CONF_API_KEY]}.json',
            self.api_calls
            )

        return returned_data
