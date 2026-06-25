"""Support for tracking transport data."""

from __future__ import annotations
from typing import Tuple
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

from . import MyConfigEntry
from .const import *
from .coordinator import TransportNSWCoordinator
from .helpers import remove_entity, extract_from_hierarchy

_LOGGER = logging.getLogger(__name__)

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


def get_location_value(data, key: str, value: str, index: int = -1) -> Tuple[any, bool]:
    try:
        available = False

        if key in [CONF_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER]:
            source = data['locations_list']['vehicles']
        else:
            source = data['locations_list']['locations']

        result = next((item for item in source if item['key'] == key), None)
        if result is not None:
            available = True

            if index == -1:
                return result[value], available
            else:
                return result[value][index], available

        else:
            return None, False

    except:
        return None, False


def get_device_tracker_name(key, subentry_data, journey_data, device_suffix, leg_suffix) -> str:
    # This function reserved for future naming convention changes...

    # Generate the default name
    name = f"{subentry_data[CONF_ORIGIN_NAME]} to {subentry_data[CONF_DESTINATION_NAME]}{device_suffix} {leg_suffix}"

    return name


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: MyConfigEntry,
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
            for trip_index in range (0, 3, 1):   # TODO - save the previous trip count and only delete extra sensors if needed
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

                for tracker in [CONF_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER, CONF_ORIGIN_DEVICE_TRACKER, CONF_DESTINATION_DEVICE_TRACKER]:
                    if trip_index >= trips_to_create:
                        # We've finished creating sensors, now delete sensors that may have been created previously but that aren't needed any more
                        remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, tracker)
                    else:
                        if is_tracker_enabled(tracker, subentry.data['device_trackers'], subentry.data.get(CONF_ORIGIN_TYPE, 'stop')):

                            new_device_tracker = TrackerEntityDescription(
                                key = tracker,
                                name = f"{subentry.subentry_id}_{tracker}_{trip_index}"
                                )

                            leg_suffix = DEVICE_TRACKER_LOOKUPS.get(tracker, '')

                            device_trackers.append(TransportNSWDeviceTracker(coordinator, new_device_tracker, subentry, trip_index, sensor_suffix, name_suffix, leg_suffix, device_suffix, migration_suffix, device_identifier))
                        else:
                            # Try and remove it - don't worry if it never existed
                            remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, tracker)

            async_add_entities(device_trackers, config_subentry_id = subentry.subentry_id, update_before_add = True)


class TransportNSWDeviceTracker(CoordinatorEntity, TrackerEntity):
    """device tracker."""

    def __init__(self, coordinator: TransportNSWCoordinator, description: TrackerEntityDescription, subentry: ConfigSubentry, index: int, sensor_suffix: str, name_suffix: str, leg_suffix: str, device_suffix: str, migration_suffix: str, device_identifier: str) -> None:
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
            self._attr_unique_id = f"{subentry.data[CONF_NAME]}{migration_suffix} {description.name}"
            self._attr_name = f"{subentry.data[CONF_NAME]}{migration_suffix} location"


    @property
    def latitude(self) -> float | None:
        """Return latitude value of the vehicle/location"""

        try:
            latitude, available = get_location_value(self.coordinator.data[self.subentry.subentry_id][self.journey_index], self.entity_description.key, 'coords', 0)
            if latitude is not None:
                return float(latitude)

        except Exception as ex:
            pass

    @property
    def longitude(self) -> float | None:
        """Return longitude value of the vehicle/location"""

        try:
            longitude, available = get_location_value(self.coordinator.data[self.subentry.subentry_id][self.journey_index], self.entity_description.key, 'coords', 1)
            if longitude is not None:
                return float(longitude)

        except Exception as ex:
            pass

    @property
    def available(self) -> bool:
        """Return if entity is available - basically check to see if there's data where it should be, not based on if we have location data or not"""
        try:
            if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:
                journey_data = self.coordinator.data[self.subentry.subentry_id][self.journey_index]
                
                if journey_data is not None:
                    return True
                else:
                    return False

        except:
            return False

    @property
    def icon(self) -> str:

    # Return the appropriate icon based on transport type
        try:
            if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:
                journey_data = self.coordinator.data[self.subentry.subentry_id][self.journey_index]
    
                if journey_data is not None:
                    # Apply the appropriate icons to a subset of the sensors.  All but two are aligned to the transport type
                    if 'origin'in self.entity_description.key or 'first' in self.entity_description.key:
                        transport_type = extract_from_hierarchy(journey_data, 'origin_transport_detail.type')
                    else:
                        transport_type = extract_from_hierarchy(journey_data, 'destination_transport_detail.type')
                    return JOURNEY_ICONS.get(transport_type, 'mdi:train')
    
        except:
            return 'mdi:train'


    @property
    def device_info(self):

        try:
            if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:
                journey_data = self.coordinator.data[self.subentry.subentry_id][self.journey_index]
    
                if journey_data is not None:
                    if self.entity_description.key in [CONF_FIRST_LEG_DEVICE_TRACKER, CONF_LAST_LEG_DEVICE_TRACKER]:
                        # Change the name on the fly, if required.
                        entity_reg = entity_registry.async_get(self.hass)
                        entity_id = entity_reg.async_get_entity_id('device_tracker', DOMAIN, self._attr_unique_id)

                        new_name = get_device_tracker_name (self.entity_description.key, journey_data, self.subentry.data, self.device_suffix, self.leg_suffix)

        except Exception as ex:
            _LOGGER.error(f"error {ex} in device_tracker.py/device_info")

        """Return device info for this sensor."""
        identifiers = {
        "identifiers": {(DOMAIN, f"{self.subentry.subentry_id}_{self.subentry.data[CONF_ORIGIN_ID]}_{self.subentry.data[CONF_DESTINATION_ID]}_{self.device_identifier}")
        },
        "name": f"{self.subentry.data[CONF_ORIGIN_NAME]} to {self.subentry.data[CONF_DESTINATION_NAME]}{self.device_suffix}",
        "manufacturer": "Transport for NSW"
        }

        return identifiers


    @property
    def extra_state_attributes(self):
        """Return the extra state attributes."""
        attrs = {}
        attrs['attribution'] = TFNSW_ATTRIBUTION

        try:
            if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:
                journey_data = self.coordinator.data[self.subentry.subentry_id][self.journey_index]

                attrs["name"], available = get_location_value(journey_data, self.entity_description.key, 'name')
                attrs["stop_id"], available = get_location_value(journey_data, self.entity_description.key, 'id')

        except:
            pass

        return attrs




