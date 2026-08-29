"""Transport NSW Mk II DataUpdateCoordinator."""

#from dataclasses import dataclass
from TransportNSWv2 import APIRateLimitExceeded
from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_KEY,
    CONF_SCAN_INTERVAL
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.location import find_coordinates
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
from datetime import datetime

from .const import (
    API_CALLS,
    API_DAILY_LIMIT,
    AVERAGE_CALLS_PER_JOURNEY,
    AVERAGE_API_CALLS,
    AVERAGE_API_CALLS_WINDOW,
    CONF_ALERT_SEVERITY,
    CONF_ALERT_TYPES,
    CONF_ALERTS_SENSOR,
    CONF_API_PERCENT,
    CONF_DESTINATION_ID,
    CONF_DESTINATION_TRANSPORT_TYPE,
    CONF_END_TIME,
    CONF_MAX_CHANGES,
    CONF_ORIGIN_ID,
    CONF_ORIGIN_TRANSPORT_TYPE,
    CONF_ORIGIN_TYPE,
    CONF_REQUEST_LOCATION_UPDATE,
    CONF_ROUTE_FILTER,
    CONF_RUN_FILTER,
    CONF_TRIPS_TO_CREATE,
    CONF_TRIP_WAIT_TIME,
    DEFAULT_API_PERCENT,
    DEFAULT_END_TIME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    STORAGE_VERSION,
    SUBENTRY_TYPE_JOURNEY,
)
from .helpers import (
    get_auto_poll_interval,
    get_trips,
    within_poll_time,
)

_LOGGER = logging.getLogger(__name__)


async def store_api_data (api_store: Store, api_calls: int) -> int:
    # Get the current data
    api_data = await api_store.async_load()

    # Do we need to reset the API counter?
    current_date = dt_util.now().date()

    if 'last_reset_date' in api_data:
        # Check the date
        last_reset_date = datetime.strptime(api_data['last_reset_date'], '%Y-%m-%d').date()

        if current_date > last_reset_date:
            api_calls = 0
            last_reset_date = current_date
    else:
        # Assume it's the first time starting up
        last_reset_date = current_date

    api_data = {
        API_CALLS: api_calls,
        'last_reset_date': str(last_reset_date)
    }

    # Store the current API calls value peristently
    await api_store.async_save(api_data)

    return api_calls


class TransportNSWCoordinator(DataUpdateCoordinator):
    """Transport NSW Mk II coordinator."""

    def __init__(self, hass: HomeAssistant, config_entry: TransportNSWConfigEntry) -> None:
        """Initialize the coordinator."""

        # set variables from options
        self.hass = hass
        self.config_entry = config_entry

        self.daily_api_calls = 0                        # We'll update it properly later, in async_update_data
        self.rolling_average_api_calls = None           # Will be calculated during updates
        self._rolling_average_api_calls_list = []       # Used to calculate auto-intervals
        
        # Initialise DataUpdateCoordinator
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN} ({config_entry.entry_id})",
            update_interval=timedelta(seconds=config_entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)),
        )

    async def _async_update_data(self):
        """Fetch data from the TfNSW API endpoint."""
        # First, populate self.daily_api_calls
        if self.daily_api_calls == 0:
            # Try and load it from the store
            try:
                api_data = await self.config_entry.runtime_data.api_store.async_load()
                if api_data is None or api_data.get(API_CALLS, None) is None:
                    # Create and save a new empty store - fake the api_calls number based on how far we are through the day to avoid running out if auto-poll-rate is enabled
                    now = dt_util.now()
                    minutes_remaining = 1440 - ((now.hour * 60) + now.minute)
                    prorated_api_calls = int( (1-(minutes_remaining / 1440)) * API_DAILY_LIMIT)

                    current_date = dt_util.now().date()
                    api_data = {
                        API_CALLS: prorated_api_calls,
                        'last_reset_date': current_date
                    }

                    await self.config_entry.runtime_data.api_store.async_save(api_data)
                    self.daily_api_calls = prorated_api_calls
                else:
                    self.daily_api_calls = api_data[API_CALLS]

            except:
                self.daily_api_calls = 0


        # Iterate through all the subentries of the correct type, saving the responses into a list which we'll return at the end
        returned_data = {}

        # Capture the total API counts raised by the integration per poll - used for auto-interval
        integration_api_count = 0
        latest_end_time = "00:00:01"

        for subentry in self.config_entry.subentries.values():
            # Is this a journey subentry (currently the only subentry type) and are we within poll time?
            if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
                # Make a note of the poll time for two reasons - to get the latest among all the journeys, and for this specific journey to see if we should do a poll
                end_time = subentry.data.get(CONF_END_TIME, DEFAULT_END_TIME)
                if end_time > latest_end_time:
                    latest_end_time = end_time

                if within_poll_time(subentry)[0]:
                    # Call the trip API - if the origin is a device tracker, we need to get the location data 
                    if CONF_ORIGIN_TYPE in subentry.data and subentry.data[CONF_ORIGIN_TYPE] == 'device_tracker':
                        try:
                            # Should we request a location update?  Obviously that's an asynchronous activity but as the polls are regular we should get the benefit the next time and so on
                            if self.config_entry.options.get(CONF_REQUEST_LOCATION_UPDATE, False):
                                _LOGGER.debug(f"Requesting location update from {subentry.data[CONF_ORIGIN_ID]}")
                                notify_device = f'notify.{subentry.data[CONF_ORIGIN_ID].split(".")[1]}'

                                await self.hass.services.async_call(
                                    domain = "notify",
                                    service = "send_message",
                                    service_data = {"message": "request_location_update"},
                                    target = {"entity_id": notify_device},
                                    blocking = True
                                )

                            origin_coordinates = find_coordinates(self.hass, subentry.data[CONF_ORIGIN_ID])

                            # Create the coordinate string in the format required by the API
                            origin = f"{origin_coordinates.split(',')[1]}:{origin_coordinates.split(',')[0]}:EPSG:4326"

                        except Exception as ex:
                            raise UpdateFailed(f"Error {ex} retrieving coordinates from {subentry.data[CONF_ORIGIN_ID]}") from ex

                    else:
                        origin = subentry.data[CONF_ORIGIN_ID]

                    try:
                        # We need to convert *_TRANSPORT_TYPE into ints before we do the call
                        origin_transport_list = [int(transport_type) for transport_type in subentry.data[CONF_ORIGIN_TRANSPORT_TYPE]]
                        destination_transport_list = [int(transport_type) for transport_type in subentry.data[CONF_DESTINATION_TRANSPORT_TYPE]]

                        _LOGGER.debug(f"Calling get_trips: origin = {origin}, destination_id = {subentry.data[CONF_DESTINATION_ID]}, trip_wait_time = {subentry.data[CONF_TRIP_WAIT_TIME]}, journeys_to_return = {subentry.data[CONF_TRIPS_TO_CREATE]}, origin_transport_type = {subentry.data[CONF_ORIGIN_TRANSPORT_TYPE]}, destination_transport_type = {subentry.data[CONF_DESTINATION_TRANSPORT_TYPE]}, route_filter = {subentry.data[CONF_ROUTE_FILTER]}, run_filter = {subentry.data[CONF_RUN_FILTER]}, include_realtime_location = True, max_changes = {subentry.data[CONF_MAX_CHANGES]}")

                        journey_data = await self.hass.async_add_executor_job(
                            get_trips,
                            self.config_entry.data[CONF_API_KEY],
                            origin,
                            subentry.data[CONF_DESTINATION_ID],
                            subentry.data[CONF_TRIP_WAIT_TIME],
                            origin_transport_list,
                            destination_transport_list, 
                            True,
                            subentry.data[CONF_ROUTE_FILTER],
                            subentry.data[CONF_RUN_FILTER],
                            subentry.data[CONF_TRIPS_TO_CREATE],
                            True,                                       # I need some of the info that's provided by this attribute, regardless of the users' requirements
                            subentry.data[CONF_ALERTS_SENSOR],
                            subentry.data[CONF_ALERT_SEVERITY],
                            subentry.data[CONF_ALERT_TYPES],
                            subentry.data[CONF_MAX_CHANGES],
                            )

                        if journey_data is not None and 'journeys_with_data' in journey_data and journey_data['journeys_with_data'] > 0:
                            if journey_data['journeys_to_return'] > journey_data['journeys_with_data']:
                                # Try for a more context-sensitive error than just 'failed'
                                if subentry.data[CONF_ORIGIN_TRANSPORT_TYPE] == ['11']:
                                    # School-bus only trip
                                    _LOGGER.warning (f"{subentry.title}: {journey_data['journeys_to_return']} journeys were requested but only got {journey_data['journeys_with_data']}, most likely because school bus journeys only run on weekdays.")
                                else:
                                    _LOGGER.warning (f"{subentry.title}: {journey_data['journeys_to_return']} journeys were requested but only got {journey_data['journeys_with_data']} - consider relaxing the journey restrictions.")

                            if 'journeys' in journey_data:
                                returned_data[subentry.subentry_id] = journey_data['journeys']

                        else:
                            # No journeys were returned, but the API call itself didn't fail
                            # Offer a slightly different warning message if it's a forced train journey
                            if subentry.data[CONF_ORIGIN_TRANSPORT_TYPE]  == ['1']:
                                _LOGGER.warning (f"{subentry.title}: no journeys returned for this train-only journey - there may be a bus replacement service active at the moment.")
                            else:
                                _LOGGER.warning(f"{subentry.title}: no journeys returned - consider relaxing the journey restrictions.")

                        # Increment the API counter if that info has been returned, and include that in the response also
                        if journey_data is not None and API_CALLS in journey_data:
                            self.daily_api_calls += journey_data[API_CALLS]
                            integration_api_count += journey_data[API_CALLS]
                        else:
                            # The average is 3 calls per journey
                            self.daily_api_calls += AVERAGE_CALLS_PER_JOURNEY
                            integration_api_count += AVERAGE_CALLS_PER_JOURNEY

                    except Exception as ex:
                        # This will show entities as unavailable by raising UpdateFailed exception
                        raise UpdateFailed(f"Error communicating with API for entry {subentry.title}: {type(ex).__name__}") from ex

        # Update the rolling average
        if len(self._rolling_average_api_calls_list) < AVERAGE_API_CALLS_WINDOW:
            # Just add the new value to the end of the list
            self._rolling_average_api_calls_list.append(integration_api_count)
        else:
            # Add the new value and rotate the list
            self._rolling_average_api_calls_list = [integration_api_count] + self._rolling_average_api_calls_list[1:]

        # Round the result, but don't use Banker's Rounding
        average = sum(self._rolling_average_api_calls_list) / len(self._rolling_average_api_calls_list)
        self.rolling_average_api_calls = round(average + 0.1)

        # Do we need to work out what the automatic poll interval should be?
        if self.config_entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL) == 0:
            daily_api_allocation = self.config_entry.options.get(CONF_API_PERCENT, DEFAULT_API_PERCENT) / 100
            new_update_interval = get_auto_poll_interval(self, daily_api_allocation, latest_end_time)

            if self.update_interval.total_seconds() != new_update_interval:
                self.update_interval = timedelta(seconds=new_update_interval)

        # Update the persistent API storage - but also determine if it's time to reset the daily counter
        self.daily_api_calls = await store_api_data(self.config_entry.runtime_data.api_store, self.daily_api_calls)

        returned_data[self.config_entry.entry_id] = {
            API_CALLS: self.daily_api_calls,
            AVERAGE_API_CALLS: self.rolling_average_api_calls,
        }

        return returned_data
