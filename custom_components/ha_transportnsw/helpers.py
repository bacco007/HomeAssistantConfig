"""Helper functions for TransportNSWv2 API"""
from TransportNSWv2 import TransportNSWv2, InvalidAPIKey, APIRateLimitExceeded, StopError, TripError
import logging
from typing import List
import json
from pathlib import Path
import pytz
import tzlocal
import time

from datetime import date, datetime
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    entity_registry as er,
    device_registry as dr,
    selector
)

_LOGGER = logging.getLogger(__name__)

from .const import *


def get_device_trackers(hass: HomeAssistant, entity_filter: str):
    # Return a list of Mobile App-sourced device tracker entities, or just the details for a single tracker

    device_trackers = []
    entity_reg = er.async_get(hass)

    for entity_id, EntRegItem in entity_reg.entities.items():
        if 'device_tracker' in entity_id and 'mobile_app' in EntRegItem.platform and entity_filter in entity_id:
            if EntRegItem.name is None:
                entity_name = EntRegItem.original_name
            else:
                entity_name = EntRegItem.name

#            device_trackers.append(selector.SelectOptionDict(value=entity_id, label=f"{entity_id} ({entity_name})"))
            device_trackers.append(selector.SelectOptionDict(value=entity_id, label=entity_name))

    return device_trackers


def get_trips (api_key: str, name_origin: str, name_destination: str, journey_wait_time: int = 0, origin_transport_type: int = [0], destination_transport_type: int = [0],
              strict_transport_type: bool = False, route_filter: str = '', journeys_to_return: int = 1, include_realtime_location: bool = True, 
              include_alerts: bool = False, alert_severity: str = 'high', alert_type: str = ['all'], max_changes: int = 5):

    # Use the Transport NSW API to request trip information
    # Exceptions will be caught by the calling function

    try:
        if not include_alerts:
            alert_severity = 'none'
    
        tfnsw = TransportNSWv2()
        data = tfnsw.get_trip (api_key = api_key, name_origin = name_origin, name_destination = name_destination, journey_wait_time = journey_wait_time,
            origin_transport_type = origin_transport_type, destination_transport_type = destination_transport_type, strict_transport_type = strict_transport_type, raw_output = False,
            route_filter = route_filter, journeys_to_return = journeys_to_return, include_realtime_location = include_realtime_location,
            include_alerts = alert_severity, alert_type = alert_type, check_stop_ids = False, max_changes = max_changes)
    
        return json.loads(data)

    except InvalidAPIKey:
        raise InvalidAPIKey
    
    except APIRateLimitExceeded:
        raise APIRateLimitExceeded
    
    except StopError:
        raise StopError

    except TripError:
        raise TripError
    
    except Exception as ex:
        raise TripError

def check_stops (api_key: str, stops: List[str]):
    # Check all provided stops using the Transport NSW API, and return all the associated stop metadata
    # Exceptions will be captured by the calling function

    try:
        tfnsw = TransportNSWv2()
        data = tfnsw.check_stops (api_key = api_key, stops = stops)

        return json.loads(data)

    except InvalidAPIKey:
        raise InvalidAPIKey
    
    except APIRateLimitExceeded:
        raise APIRateLimitExceeded
    
    except StopError:
        raise StopError
    
    except Exception as ex:
        raise StopError

def get_stop_detail (stop_data, stop_id: str, property: str):
    # Return a specific property from the provided stop metadata

    try:
        stop_detail = "n/a"

        for stop in stop_data['stop_list']:
            if stop['stop_id'] == stop_id:
                stop_detail = stop['stop_detail']['disassembledName']
                break

        return stop_detail
        
    except Exception as ex:
        return "n/a"


def get_optional_sensors (subentry_data: str):
    # Return the current subentry options in the same format as 'set_optional_sensors' for comparison
    optional_sensors = {}

    try:
        for option_group in ['time_and_change_sensors', 'origin_sensors', 'destination_sensors', 'device_trackers']:
            optional_sensors[option_group] = subentry_data[option_group]

        return optional_sensors

    except:
        return None

def set_optional_sensors (sensor_creation: str):
    # Determine which optional sensors to create

    # These are for the new integration
    if sensor_creation == 'changes_and_times':
        sensor_options = {
            'time_and_change_sensors': {CONF_CHANGES_SENSOR: True, CONF_DELAY_SENSOR: True, CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR: True, CONF_LAST_LEG_ARRIVAL_TIME_SENSOR: True},
            'origin_sensors': {CONF_ORIGIN_NAME_SENSOR: False, CONF_ORIGIN_DETAIL_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_FIRST_LEG_OCCUPANCY_SENSOR: False, CONF_FIRST_LEG_TRAIN_SET_SENSOR: False}, 
            'destination_sensors': {CONF_DESTINATION_NAME_SENSOR: False, CONF_DESTINATION_DETAIL_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_LAST_LEG_OCCUPANCY_SENSOR: False, CONF_LAST_LEG_TRAIN_SET_SENSOR: False},
            'device_trackers': {CONF_FIRST_LEG_DEVICE_TRACKER: DEFAULT_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER: DEFAULT_FIRST_LEG_DEVICE_TRACKER, CONF_ORIGIN_DEVICE_TRACKER: DEFAULT_ORIGIN_DEVICE_TRACKER, CONF_DESTINATION_DEVICE_TRACKER: DEFAULT_DESTINATION_DEVICE_TRACKER}
            }

    elif sensor_creation == 'verbose':
        sensor_options = {
            'time_and_change_sensors': {CONF_CHANGES_SENSOR: True, CONF_DELAY_SENSOR: True, CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR: True, CONF_LAST_LEG_ARRIVAL_TIME_SENSOR: True},
            'origin_sensors': {CONF_ORIGIN_NAME_SENSOR: True, CONF_ORIGIN_DETAIL_SENSOR: True, CONF_FIRST_LEG_LINE_NAME_SENSOR: True, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR: True, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR: True, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR: True, CONF_FIRST_LEG_OCCUPANCY_SENSOR: True, CONF_FIRST_LEG_TRAIN_SET_SENSOR: True}, 
            'destination_sensors': {CONF_DESTINATION_NAME_SENSOR: True, CONF_DESTINATION_DETAIL_SENSOR: True, CONF_LAST_LEG_LINE_NAME_SENSOR: True, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR: True, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR: True, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR: True, CONF_LAST_LEG_OCCUPANCY_SENSOR: True, CONF_LAST_LEG_TRAIN_SET_SENSOR: True},
            'device_trackers': {CONF_FIRST_LEG_DEVICE_TRACKER: 'always', CONF_LAST_LEG_DEVICE_TRACKER: 'always', CONF_ORIGIN_DEVICE_TRACKER: 'always', CONF_DESTINATION_DEVICE_TRACKER: 'always'}
            }
 
    # These are for migration entries
    elif sensor_creation == 'basic':
        sensor_options = {
            'time_and_change_sensors': {CONF_CHANGES_SENSOR: True, CONF_DELAY_SENSOR: False, CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR: False, CONF_LAST_LEG_ARRIVAL_TIME_SENSOR: True},
            'origin_sensors': {CONF_ORIGIN_NAME_SENSOR: False, CONF_ORIGIN_DETAIL_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_FIRST_LEG_OCCUPANCY_SENSOR: False, CONF_FIRST_LEG_TRAIN_SET_SENSOR: False}, 
            'destination_sensors': {CONF_DESTINATION_NAME_SENSOR: False, CONF_DESTINATION_DETAIL_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_LAST_LEG_OCCUPANCY_SENSOR: False, CONF_LAST_LEG_TRAIN_SET_SENSOR: False},
            'device_trackers': {CONF_FIRST_LEG_DEVICE_TRACKER: DEFAULT_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER: DEFAULT_LAST_LEG_DEVICE_TRACKER, CONF_ORIGIN_DEVICE_TRACKER: DEFAULT_ORIGIN_DEVICE_TRACKER, CONF_DESTINATION_DEVICE_TRACKER: DEFAULT_DESTINATION_DEVICE_TRACKER}
            }
 
    elif sensor_creation == 'medium':
        sensor_options = {
            'time_and_change_sensors': {CONF_CHANGES_SENSOR: True, CONF_DELAY_SENSOR: False, CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR: False, CONF_LAST_LEG_ARRIVAL_TIME_SENSOR: True},
            'origin_sensors': {CONF_ORIGIN_NAME_SENSOR: True, CONF_ORIGIN_DETAIL_SENSOR: True, CONF_FIRST_LEG_LINE_NAME_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_FIRST_LEG_OCCUPANCY_SENSOR: False, CONF_FIRST_LEG_TRAIN_SET_SENSOR: False}, 
            'destination_sensors': {CONF_DESTINATION_NAME_SENSOR: False, CONF_DESTINATION_DETAIL_SENSOR: True, CONF_LAST_LEG_LINE_NAME_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_LAST_LEG_OCCUPANCY_SENSOR: False, CONF_LAST_LEG_TRAIN_SET_SENSOR: False},
            'device_trackers': {CONF_FIRST_LEG_DEVICE_TRACKER: DEFAULT_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER: DEFAULT_LAST_LEG_DEVICE_TRACKER, CONF_ORIGIN_DEVICE_TRACKER: DEFAULT_ORIGIN_DEVICE_TRACKER, CONF_DESTINATION_DEVICE_TRACKER: DEFAULT_DESTINATION_DEVICE_TRACKER}
            }

    else:
        sensor_options = {
            'time_and_change_sensors': {CONF_CHANGES_SENSOR: False, CONF_DELAY_SENSOR: False, CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR: False, CONF_LAST_LEG_ARRIVAL_TIME_SENSOR: False},
            'origin_sensors': {CONF_ORIGIN_NAME_SENSOR: False, CONF_ORIGIN_DETAIL_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SENSOR: False, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_FIRST_LEG_OCCUPANCY_SENSOR: False, CONF_FIRST_LEG_TRAIN_SET_SENSOR: False}, 
            'destination_sensors': {CONF_DESTINATION_NAME_SENSOR: False, CONF_DESTINATION_DETAIL_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SENSOR: False, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR: False, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR: False, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR: False, CONF_LAST_LEG_OCCUPANCY_SENSOR: False, CONF_LAST_LEG_TRAIN_SET_SENSOR: False},
            'device_trackers': {CONF_FIRST_LEG_DEVICE_TRACKER: DEFAULT_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER: DEFAULT_LAST_LEG_DEVICE_TRACKER, CONF_ORIGIN_DEVICE_TRACKER: DEFAULT_ORIGIN_DEVICE_TRACKER, CONF_DESTINATION_DEVICE_TRACKER: DEFAULT_DESTINATION_DEVICE_TRACKER}
            }

    return sensor_options

def get_api_calls (file_path: str) -> int:
    # Get the current date first
    try:
        api_info = json.loads(
                Path(file_path).read_text(encoding="utf8")
            )

        return api_info[API_CALLS]

    except Exception as ex:
        return 0


def set_api_calls (file_path: str, api_calls: int) -> int:
    # Get the current date
    try:
        api_info = json.loads(
                Path(file_path).read_text(encoding="utf8")
            )
    
    except:
        api_info = {}

    current_date = datetime.now().date()
    # Do we need to reset the API counter?
    if 'last_reset_date' in api_info:
        # Check the date
        last_reset_date = datetime.strptime(api_info['last_reset_date'], '%Y-%m-%d').date()

        if current_date > last_reset_date:
            api_calls = 0
            last_reset_date = current_date
    else:
        # Assume it's the first time starting up
        last_reset_date = current_date

    data = {
        API_CALLS: api_calls,
        'last_reset_date': str(last_reset_date)
    }

    # Store the current API calls value peristently
    Path(file_path).write_text(json.dumps(data), encoding="utf8")

    return api_calls

def remove_entity(entity_reg, configentry_id, subentry_id, trip_index, key):
    # Search for and remove a sensor that's no longer needed
    unique_id = f"{subentry_id}_{key}_{trip_index}"

    try:
        # Get all the entities for this config entry
        entities = entity_reg.entities.get_entries_for_config_entry_id(configentry_id)

        # Search for the one to remove
        for entity in entities:
            if entity.unique_id == unique_id:
                entity_reg.async_remove(entity.entity_id)
                break

    finally:
        # Don't log an error as it's possible the entity never existed in the first place
        pass

def remove_device(device_reg, entry_id, subentry_id, origin_id, destination_id, device_identifier):
    # Search for and remove a device that's no longer needed
    try:
        device = device_reg.async_get_device(identifiers={(DOMAIN, f"{subentry_id}_{origin_id}_{destination_id}_{device_identifier}")})
        if device is not None:
#            device_reg.async_remove_device(device.id)
            device_reg.async_update_device(
                device_id = device.id,
                remove_config_entry_id = entry_id,
                remove_config_subentry_id = subentry_id
                )

    finally:
        pass
