"""Support for tracking transport data."""

from __future__ import annotations
from typing import Tuple
from dataclasses import dataclass

import logging

from homeassistant.components.device_tracker import (
    TrackerEntity,
    TrackerEntityDescription
)

from homeassistant.const import CONF_NAME

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers import entity_registry

from . import TransportNSWConfigEntry
from .const import (
    CONF_DESTINATION_ID,
    CONF_DESTINATION_NAME,
    CONF_FIRST_LEG_DEVICE_TRACKER,
    CONF_FIRST_LEG_DEVICE_TRACKER_FRIENDLY,
    CONF_LAST_LEG_DEVICE_TRACKER,
    CONF_LAST_LEG_DEVICE_TRACKER_FRIENDLY,
    CONF_ORIGIN_DEVICE_TRACKER,
    CONF_ORIGIN_DEVICE_TRACKER_FRIENDLY,
    CONF_DESTINATION_DEVICE_TRACKER,
    CONF_DESTINATION_DEVICE_TRACKER_FRIENDLY,
    CONF_ORIGIN_ID,
    CONF_ORIGIN_NAME,
    CONF_ORIGIN_TYPE,
    CONF_TRIPS_TO_CREATE,
    DEVICE_TRACKER_LOOKUPS,
    DOMAIN,
    JOURNEY_ICONS,
    SUBENTRY_TYPE_JOURNEY,
    TFNSW_ATTRIBUTION
)
from .coordinator import TransportNSWCoordinator
from .helpers import (
    remove_entity,
    extract_from_hierarchy,
    get_journey_data,
)

_LOGGER = logging.getLogger(__name__)

# Extend the default TrackerEntityDescription class
@dataclass(frozen = True, kw_only = True)
class TransportNSWTrackerEntityDescription(TrackerEntityDescription):
    # Custom extension adding a value path for retrieving simple values from the data returned by DataUpdateCoordinator
    # or a callable function for more complex returns
    # Also stores what 'type' of tracker this is - a vehicle or a location
    state_path: str | None = None
    state_fn: Callable[[Any], Any] | None = None
    attrs_path: str | None = None
    attrs_friendly: str | None = None

# Subentry-level sensor definitions
DEVICE_TRACKER_SENSORS: tuple[TransportNSWTrackerEntityDescription, ...] = (
    TransportNSWTrackerEntityDescription(
        key=CONF_FIRST_LEG_DEVICE_TRACKER,
        name=CONF_FIRST_LEG_DEVICE_TRACKER_FRIENDLY,
        state_path = "origin_transport_detail.coords",
        attrs_path = ['origin_real_time_trip_id', 'origin_gtfs_trip_id'],
        attrs_friendly = ['realtime trip id', 'gtfs trip id']
    ),
    TransportNSWTrackerEntityDescription(
        key=CONF_LAST_LEG_DEVICE_TRACKER,
        name=CONF_LAST_LEG_DEVICE_TRACKER_FRIENDLY,
        state_path = "destination_transport_detail.coords",
        attrs_path = ['destination_real_time_trip_id', 'destination_gtfs_trip_id'],
        attrs_friendly = ['realtime trip id', 'gtfs trip id']
    ),
    TransportNSWTrackerEntityDescription(
        key=CONF_ORIGIN_DEVICE_TRACKER,
        name=CONF_ORIGIN_DEVICE_TRACKER_FRIENDLY,
        state_path = "origin_detail.coords",
        attrs_path = ['origin_detail.name', 'origin_detail.stop_id'],
        attrs_friendly = ['name', 'stop_id']
    ),
    TransportNSWTrackerEntityDescription(
        key=CONF_DESTINATION_DEVICE_TRACKER,
        name=CONF_DESTINATION_DEVICE_TRACKER_FRIENDLY,
        state_path = "destination_detail.coords",
        attrs_path = ['destination_detail.name', 'destination_detail.stop_id'],
        attrs_friendly = ['name', 'stop_id']
    ),
)

def is_tracker_enabled(tracker: str, data, origin_type: str) -> bool:
    # Determine if the device tracker sensor has been enabled in the options
    # There are a few combinations so doing it here is neater for overall code flow
    try:
        if origin_type == 'stop':
            possible_values = ['always', 'if_not_duplicated']
        else:
            possible_values = ['always', 'if_not_duplicated', 'if_device_tracker_journey']

        if data[tracker] in possible_values:
            return True
        else:
            return False

    except:
        return False


def get_tripview_name(key, subentry_data, journey_data, device_suffix, leg_suffix) -> str:
    # Use TripView-style naming - find out what the transport type is

    try:
        if key == CONF_FIRST_LEG_DEVICE_TRACKER:
            key_base = 'origin_transport_detail'
        else:
            key_base = 'destination_transport_detail'

        transport_type = extract_from_hierarchy(obj=journey_data, path=f'{key_base}.type')

        # For train and metro we want 'end_of_line', otherwise it's 'line_name_short'
        if transport_type in ['Train', 'Metro']:
            name_path = f'{key_base}.end_of_line'
        else:
            name_path = f'{key_base}.line_name_short'

        # Get the new name, but we only want up to the first three characters
        tripview_name = extract_from_hierarchy(obj=journey_data, path=name_path)[:3].upper()

        return tripview_name

    except Exception as ex:
        return 'Unknown'

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: TransportNSWConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:

    # This gets the data update coordinator from the config entry runtime data as specified in __init__.py
    coordinator: TransportNSWCoordinator = config_entry.runtime_data.coordinator

    entity_reg = entity_registry.async_get(hass)

    for subentry in config_entry.subentries.values():
        if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
            trips_to_create = subentry.data[CONF_TRIPS_TO_CREATE]
            device_trackers = []

            # Create/remove the device trackers
            for trip_index in range (0, 3, 1):
                if trips_to_create == 1:
                    sensor_suffix = ""
                    name_suffix = ""
                    device_suffix = ""
                    migration_suffix = ""
                    device_identifier = f"trip_{str(trip_index + 1)}"
                else:
                    sensor_suffix = f"trip_{str(trip_index + 1)}"
                    name_suffix = f" ({str(trip_index + 1)})"
                    device_suffix = f" trip {str(trip_index + 1)}"
                    migration_suffix = f"_trip_{str(trip_index + 1)}"
                    device_identifier = f"trip_{str(trip_index + 1)}"

                for sensor in DEVICE_TRACKER_SENSORS:
                    if trip_index >= trips_to_create:
                        # We've finished creating sensors, now delete sensors that may have been created previously but that aren't needed any more
                        remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)
                    else:
                        if is_tracker_enabled(sensor.key, subentry.data['device_trackers'], subentry.data.get(CONF_ORIGIN_TYPE, 'stop')):
                            leg_suffix = DEVICE_TRACKER_LOOKUPS.get(sensor.key, '')
                            device_trackers.append(TransportNSWDeviceTracker(coordinator, sensor, subentry, trip_index, sensor_suffix, name_suffix, leg_suffix, device_suffix, migration_suffix, device_identifier))
                        else:
                            # Try and remove it - don't worry if it never existed
                            remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

            async_add_entities(device_trackers, config_subentry_id = subentry.subentry_id, update_before_add = True)


class TransportNSWDeviceTracker(CoordinatorEntity, TrackerEntity):
    """Transport NSW Mk II device tracker."""
    # _attr_entity_category = None

    def __init__(self, coordinator: TransportNSWCoordinator, description: TransportNSWTrackerEntityDescription, subentry: ConfigSubentry, index: int, sensor_suffix: str, name_suffix: str, leg_suffix: str, device_suffix: str, migration_suffix: str, device_identifier: str) -> None:
        """Initialise sensor."""
        super().__init__(coordinator)

        self.entity_description = description
        self.subentry = subentry
        self.journey_index = index
        self.device_suffix = device_suffix
        self.migration_suffix = migration_suffix
        self.device_identifier = device_identifier
        self.sensor_suffix = sensor_suffix
        self.leg_suffix = leg_suffix

        # Cater for migrated entries with a different naming convention
        if CONF_NAME not in subentry.data or subentry.data[CONF_NAME] == '':
            # Use the new naming convention
            self._attr_unique_id = f"{subentry.subentry_id}_{description.key}_{index}"
            self._attr_name = f"{subentry.data[CONF_ORIGIN_NAME]} to {subentry.data[CONF_DESTINATION_NAME]}{device_suffix} {leg_suffix}"
        else:
            # Use the old naming convention
            self._attr_unique_id = f"{subentry.data[CONF_NAME]}{migration_suffix} {description.name}"
            self._attr_name = f"{subentry.data[CONF_NAME]}{migration_suffix} location"

        if description.key == CONF_LAST_LEG_DEVICE_TRACKER:
            # Store if we should hide the last leg device tracker for single-vehicle journeys
            self._hide_if_duplicated = True if self.subentry.data['device_trackers'][CONF_LAST_LEG_DEVICE_TRACKER] == 'if_not_duplicated' else False
        else:
            self._hide_if_duplicated = False

    @property
    def latitude(self) -> float | None:
        """Return latitude value of the vehicle/location"""

        try:
            # Use the extended entity_description attributes to work out where and how to return the sensor state
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Get what's in 'state_path'
                value = extract_from_hierarchy(obj=journey_data, path=f"{self.entity_description.state_path}.latitude")
                return value

        except Exception as ex:
            _LOGGER.error(f"{self.subentry.title}: Error {ex} retrieving latitude for device tracker {self.entity_description.key}")

    @property
    def longitude(self) -> float | None:
        """Return latitude value of the vehicle/location"""
        try:
            # Use the extended entity_description attributes to work out where and how to return the sensor state
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Get what's in 'state_path'
                value = extract_from_hierarchy(obj=journey_data, path=f"{self.entity_description.state_path}.longitude")
                return value

        except Exception as ex:
            _LOGGER.error(f"{self.subentry.title}: Error {ex} retrieving latitude for device tracker {self.entity_description.key}")

    @property
    def available(self) -> bool:
        """ Return if entity is available - basically check to see if there's data where it should be, not based on if we actually have lat/long data or not
            Also, for CONF_LAST_LEG_DEVICE_TRACKER we should make it hidden if it's a duplicate of CONF_FIRST_LEG_DEVICE_TRACKER
        """
        try:
            # Make sure there's data in the coordinator, that there's data for this subentry and that there's data for the journey index we're looking for
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # This can only be potentially True for CONF_LAST_LEG_DEVICE_TRACKER
                if self._hide_if_duplicated:
                    # We're going to need access to the entity registry to hide or show the device tracker
                    entity_reg = entity_registry.async_get(self.hass)
                    entity_id = entity_reg.async_get_entity_id('device_tracker', DOMAIN, self._attr_unique_id)

                    # See if we are a duplicate of CONF_FIRST_LEG_DEVICE_TRACKER
                    journey_data = self.coordinator.data[self.subentry.subentry_id][self.journey_index]
                    duplicated_tracker = extract_from_hierarchy(obj=journey_data, path="destination_transport_detail.same_as_origin", default=False)

                    if duplicated_tracker:
                        hidden_by = entity_registry.RegistryEntryHider.INTEGRATION
                    else:
                        hidden_by = None

                    # Hide or unhide the tracker
                    entity_reg.async_update_entity(entity_id, hidden_by=hidden_by)

                return True

            else:
                return False

        except Exception as ex:
            _LOGGER.error(f"{self.subentry.title}: Error {ex} setting availability for device tracker {self.entity_description.key} index {self.journey_index}")
            return False

    @property
    def icon(self) -> str:
    # Return the appropriate icon based on transport type
        try:
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Apply the appropriate icon
                if any(substring in self.entity_description.key for substring in ['origin', 'first']):
                    transport_type = extract_from_hierarchy(obj=journey_data, path='origin_transport_detail.type')
                else:
                    transport_type = extract_from_hierarchy(obj=journey_data, path='destination_transport_detail.type')

                return JOURNEY_ICONS.get(transport_type, 'mdi:train')
    
        except:
            return 'mdi:train'


    @property
    def device_info(self):
        """ Return appropriate device info."""

        try:
            identifiers = {
            "identifiers": {(DOMAIN, f"{self.subentry.subentry_id}_{self.subentry.data[CONF_ORIGIN_ID]}_{self.subentry.data[CONF_DESTINATION_ID]}_{self.device_identifier}")
            },
            "name": f"{self.subentry.data[CONF_ORIGIN_NAME]} to {self.subentry.data[CONF_DESTINATION_NAME]}{self.device_suffix}",
            "manufacturer": "Transport for NSW"
            }

            return identifiers

        except Exception as ex:
            return None

    @property
    def extra_state_attributes(self):
        """Return the extra state attributes."""
        attrs = {}

        try:
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Type-specific attributes
                if self.entity_description.key in [CONF_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER]:
                    attrs['tripview_name'] = get_tripview_name(self.entity_description.key, self.subentry.data, journey_data, self.device_suffix, self.leg_suffix)

                # Key-specific attributes
                if self.entity_description.attrs_path:
                    if not isinstance(self.entity_description.attrs_path, list):
                        attrs_path = [self.entity_description.attrs_path]
                    else:
                        attrs_path = self.entity_description.attrs_path

                    if not isinstance(self.entity_description.attrs_friendly, list):
                        attrs_friendly = [self.entity_description.attrs_friendly]
                    else:
                        attrs_friendly = self.entity_description.attrs_friendly

                    # Handle multiple attributes being set for a single sensor
                    for index, path in enumerate(attrs_path):
                        attr_friendly = attrs_friendly[index]
                        attr_value = extract_from_hierarchy(obj=journey_data, path=path)

                        attrs[attr_friendly] = attr_value

        finally:
            # Always make sure there's the appropriate attribution
            attrs['attribution'] = TFNSW_ATTRIBUTION

        return attrs


