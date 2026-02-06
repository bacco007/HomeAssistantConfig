"""Interfaces with the Transport NSW Mk II API sensors."""

import logging
from datetime import datetime, timezone, timedelta
import pytz
import tzlocal
import time

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)

from homeassistant.const import (
    CONF_API_KEY,
    CONF_NAME,
    UnitOfTime,
)

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.config_entries import ConfigSubentry
from homeassistant.const import EntityCategory

from . import MyConfigEntry
from .const import *
from .coordinator import TransportNSWCoordinator
from .helpers import remove_entity, remove_device

_LOGGER = logging.getLogger(__name__)

# Default sensor definitions
DEFAULT_ENTRY_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=API_CALLS,
        name=API_CALLS_NAME,
        native_unit_of_measurement='calls',
        icon='mdi:counter',
        entity_category=EntityCategory.DIAGNOSTIC
    ),
)

DEFAULT_SUBENTRY_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=CONF_DUE_SENSOR,
        name=CONF_DUE_FRIENDLY,
        native_unit_of_measurement=UnitOfTime.MINUTES
    ),
)

# Optional sensor definitions
TIME_AND_CHANGE_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR,
        name=CONF_FIRST_LEG_DEPARTURE_TIME_FRIENDLY,
        icon = 'mdi:clock-outline',
        device_class = SensorDeviceClass.TIMESTAMP
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_ARRIVAL_TIME_SENSOR,
        name=CONF_LAST_LEG_ARRIVAL_TIME_FRIENDLY,
        icon = 'mdi:clock-outline',
        device_class = SensorDeviceClass.TIMESTAMP
    ),
    SensorEntityDescription(
        key=CONF_DELAY_SENSOR,
        name=CONF_DELAY_FRIENDLY,
        native_unit_of_measurement=UnitOfTime.MINUTES
    ),
    SensorEntityDescription(
        key=CONF_CHANGES_SENSOR,
        name=CONF_CHANGES_FRIENDLY,
        native_unit_of_measurement = 'changes',
        icon = 'mdi:map-marker-path'
    )
)

ORIGIN_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=CONF_ORIGIN_NAME_SENSOR,
        name=CONF_ORIGIN_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_ORIGIN_DETAIL_SENSOR,
        name=CONF_ORIGIN_DETAIL_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_LINE_NAME_SENSOR,
        name=CONF_FIRST_LEG_LINE_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR,
        name=CONF_FIRST_LEG_LINE_NAME_SHORT_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR,
        name=CONF_FIRST_LEG_TRANSPORT_TYPE_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR,
        name=CONF_FIRST_LEG_TRANSPORT_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_OCCUPANCY_SENSOR,
        name=CONF_FIRST_LEG_OCCUPANCY_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_FIRST_LEG_TRAIN_SET_SENSOR,
        name=CONF_FIRST_LEG_TRAIN_SET_FRIENDLY,
    )
)

DESTINATION_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=CONF_DESTINATION_NAME_SENSOR,
        name=CONF_DESTINATION_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_DESTINATION_DETAIL_SENSOR,
        name=CONF_DESTINATION_DETAIL_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_LINE_NAME_SENSOR,
        name=CONF_LAST_LEG_LINE_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR,
        name=CONF_LAST_LEG_LINE_NAME_SHORT_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR,
        name=CONF_LAST_LEG_TRANSPORT_TYPE_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_TRANSPORT_NAME_SENSOR,
        name=CONF_LAST_LEG_TRANSPORT_NAME_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_OCCUPANCY_SENSOR,
        name=CONF_LAST_LEG_OCCUPANCY_FRIENDLY,
    ),
    SensorEntityDescription(
        key=CONF_LAST_LEG_TRAIN_SET_SENSOR,
        name=CONF_LAST_LEG_TRAIN_SET_FRIENDLY,
    )
)

ALERT_SENSORS: tuple[SensorEntityDescription, ...] = (
    SensorEntityDescription(
        key=CONF_ALERTS_SENSOR,
        name=CONF_ALERTS_FRIENDLY,
        icon="mdi:alert-outline"
    ),
)

def get_highest_alert(alerts):
    # Search the alerts and return the highest
    highest_alert = -1
    highest_alert_text = 'None'

    try:
        for alert in alerts:
            if ALERT_PRIORITIES.get(alert['priority'],-1) > highest_alert:
                highest_alert = ALERT_PRIORITIES.get(alert['priority'],-1)
                highest_alert_text = alert['priority']
    
    finally:
        return highest_alert_text


def get_specific_platform(journey_detail, key):
    # Extract the specific platform, wharf etc for this journey
    if key == CONF_ORIGIN_DETAIL_SENSOR:
        transport_type_key = CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR
        origin_name_key = CONF_ORIGIN_NAME_SENSOR
    else:
        transport_type_key = CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR
        origin_name_key = CONF_DESTINATION_NAME_SENSOR

    try:
        transport_type = journey_detail[transport_type_key]
        origin_name = journey_detail[origin_name_key]

        if (transport_type == "Train" or transport_type == "Metro"):
            return origin_name.split(", ")[1]

        elif transport_type == "Ferry":
            tmpLen = len(origin_name.split(", "))

            if tmpLen == 4:
                return origin_name.split(", ")[1] + ", " + origin_name.split(", ")[2]

            elif tmpLen == 3:
                return origin_name.split(", ")[1]

            elif tmpLen == 2:
                return origin_name.split(", ")[1]

            else:
                return origin_name.split(", ")[0]

        elif transport_type == "Bus":
            return origin_name.split(", ")[0]

        elif transport_type == "Light rail":
            tmpFind = origin_name.find(" Light Rail")
            if tmpFind == -1:
                return origin_name
            else:
                return origin_name[: tmpFind]
        else:
            return origin_name

    except:
        return origin_name


def get_train_set(journey_detail, key):
    # Extract the specific train set(s) for this journey
    if key == CONF_FIRST_LEG_TRAIN_SET_SENSOR:
        trip_id_key = 'origin_real_time_trip_id'
    else:
        trip_id_key = 'destination_real_time_trip_id'

    try:
        trip_id = journey_detail[trip_id_key].split('.')

        if len(trip_id) < 7:
            return 'n/a'
        else:
            # We're interested in 4 and 5
            train_set = TRAIN_SETS.get(trip_id[4], 'Unknown')
            train_carriages = trip_id[5]

            return f'{train_carriages} car {train_set}'

    except:
        return 'Unknown'


def convert_date(utc_string) -> datetime:
    fmt = '%Y-%m-%dT%H:%M:%SZ'
    
    utc_dt = datetime.strptime(utc_string, fmt)
    utc_dt = utc_dt.replace(tzinfo=pytz.utc)
    local_timezone = tzlocal.get_localzone()
    local_dt = utc_dt.astimezone(local_timezone)
    
    return local_dt

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: MyConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
):
    """Set up the Sensors."""
    # This gets the data update coordinator from the config entry runtime data as specified __init__.py
    coordinator: TransportNSWCoordinator = config_entry.runtime_data.coordinator

    # Be ready to remove devices and sensors if required
    device_reg = dr.async_get(hass)
    entity_reg = er.async_get(hass)

    # Create the subentry sensors
    for subentry in config_entry.subentries.values():
        if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
            trips_to_create = subentry.data[CONF_TRIPS_TO_CREATE]

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

                sensors = []
                if trip_index >= trips_to_create:
                    # We've finished creating sensors, now we need to start trying to delete sensors and devices
                    # that may have been created previously but that aren't needed any more
#                    for sensor_group in [DEFAULT_SUBENTRY_SENSORS, TIME_AND_CHANGE_SENSORS, ORIGIN_SENSORS, DESTINATION_SENSORS, ALERT_SENSORS]:
#                        for sensor in sensor_group:
#                            remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

                    # Removing the device will also remove the associated sensors!
                    remove_device (device_reg, config_entry.entry_id, subentry.subentry_id, subentry.data[CONF_ORIGIN_ID], subentry.data[CONF_DESTINATION_ID], device_identifier)
                else:
                    # Define the default sensors for this trip
                    sensors = [
                        TransportNSWSubentrySensor(coordinator, description, subentry, trip_index, sensor_suffix, name_suffix, device_suffix, migration_suffix, device_identifier)
                        for description in DEFAULT_SUBENTRY_SENSORS
                    ]
        
                    # Now the optional sensors
                    if 'time_and_change_sensors' in subentry.data:
                        for sensor in TIME_AND_CHANGE_SENSORS:
                            if subentry.data['time_and_change_sensors'].get(sensor.key, False):
                                sensors.append(TransportNSWSubentrySensor(coordinator, sensor, subentry, trip_index, sensor_suffix, name_suffix, device_suffix, migration_suffix, device_identifier))
                            else:
                                # Try and remove it - don't worry if it never existed
                                remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

                    if 'origin_sensors' in subentry.data:
                        for sensor in ORIGIN_SENSORS:
                            if subentry.data['origin_sensors'].get(sensor.key, False):
                                sensors.append(TransportNSWSubentrySensor(coordinator, sensor, subentry, trip_index, sensor_suffix, name_suffix, device_suffix, migration_suffix, device_identifier))
                            else:
                                # Try and remove it - don't worry if it never existed
                                remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

                    if 'destination_sensors' in subentry.data:
                        for sensor in DESTINATION_SENSORS:
                            if subentry.data['destination_sensors'].get(sensor.key, False):
                                sensors.append(TransportNSWSubentrySensor(coordinator, sensor, subentry, trip_index, sensor_suffix, name_suffix, device_suffix, migration_suffix, device_identifier))
                            else:
                                # Try and remove it - don't worry if it never existed
                                remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

                    for sensor in ALERT_SENSORS:
                        if subentry.data.get(sensor.key, False):
                            sensors.append(TransportNSWSubentrySensor(coordinator, sensor, subentry, trip_index, sensor_suffix, name_suffix, device_suffix, migration_suffix, device_identifier))
                        else:
                            # Try and remove it - don't worry if it never existed
                            remove_entity (entity_reg, config_entry.entry_id, subentry.subentry_id, trip_index, sensor.key)

                    # Create the subentry sensors, assuming there are any
                    if len(sensors) > 0:
                        async_add_entities(sensors, config_subentry_id = subentry.subentry_id, update_before_add = True)

                
    # Create the top-level config entry sensors
    configentry_sensors = [
        TransportNSWSensor(coordinator, description, config_entry)
        for description in DEFAULT_ENTRY_SENSORS
    ]

    async_add_entities(configentry_sensors, update_before_add = True)


class TransportNSWSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a configentry sensor."""

    def __init__(self, coordinator: TransportNSWCoordinator, description: SensorEntityDescription, config_entry: MyConfigEntry) -> None:
        """Initialise sensor."""
        super().__init__(coordinator)

        """Initialize the sensor."""
        self.entity_description = description
        self.config_entry = config_entry
        self.api_short = config_entry.data[CONF_API_KEY][-4:]

        self._attr_unique_id = f"{config_entry.entry_id}_{description.key}_0"
        self._attr_name = f"{description.name} ({self.api_short})"

 
    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        # This method is called by the DataUpdateCoordinator when a successful update runs.
        self.async_write_ha_state()

    @property
    def native_value(self) -> int | float | str | datetime:
        """Return the state of the entity."""
            
        return self.coordinator.api_calls

class TransportNSWSubentrySensor(CoordinatorEntity, SensorEntity):
    """Implementation of subentry sensor."""

    def __init__(self, coordinator: TransportNSWCoordinator, description: SensorEntityDescription, subentry: ConfigSubentry, index: int, sensor_suffix: str, name_suffix: str, device_suffix: str, migration_suffix: str, device_identifier: str) -> None:
        """Initialise sensor."""
        super().__init__(coordinator)

        """Initialize the sensor."""
        self.entity_description = description
        self.subentry = subentry
        self.journey_index = index
        self.device_suffix = device_suffix
        self.migration_suffix = migration_suffix
        self.sensor_suffix = sensor_suffix
        self.device_identifier = device_identifier

        
        # Cater for migrated entries with a different naming convention
        if CONF_NAME not in subentry.data or subentry.data[CONF_NAME] == '':
            # Use the new naming convention
            self._attr_name = f"{subentry.data[CONF_ORIGIN_NAME]} to {subentry.data[CONF_DESTINATION_NAME]}{device_suffix} {description.name}"
            self._attr_unique_id = f"{subentry.subentry_id}_{description.key}_{index}"
        else:
            # Use the migrated sensor naming convention
            if description.key == CONF_DUE_SENSOR:
                # A special case - don't append the description to the end
                self._attr_name = f"{subentry.data[CONF_NAME]}{migration_suffix}"
            else:
                self._attr_name = f"{subentry.data[CONF_NAME]}{migration_suffix} {description.name}"
                
            self._attr_unique_id = self._attr_name

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor with latest data from coordinator."""
        # This method is called by the DataUpdateCoordinator when a successful update runs.
        self.async_write_ha_state()

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info for this sensor."""
        identifiers = {
        "identifiers": {(DOMAIN, f"{self.subentry.subentry_id}_{self.subentry.data[CONF_ORIGIN_ID]}_{self.subentry.data[CONF_DESTINATION_ID]}_{self.device_identifier}")
                       },
        "name": f"{self.subentry.data[CONF_ORIGIN_NAME]} to {self.subentry.data[CONF_DESTINATION_NAME]}{self.device_suffix}",
        "manufacturer": "Transport for NSW"
        }

        return identifiers

    @property
    def native_value(self) -> int | float | str | datetime:
        """Return the state of the entity."""

        if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:

            try:
                if 'time' in self.entity_description.key:
                    return convert_date(self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key])

                elif self.entity_description.key == CONF_ALERTS_SENSOR:
                    # Store the highest alert value as the state - the specific alerts will go into attributes
                    return get_highest_alert(self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key])

                elif self.entity_description.key in [CONF_FIRST_LEG_OCCUPANCY_SENSOR, CONF_LAST_LEG_OCCUPANCY_SENSOR]:
                    return OCCUPANCY_ICONS.get(self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key], ["mdi:account-question", "Unknown"])[1]

                elif self.entity_description.key in [CONF_ORIGIN_DETAIL_SENSOR, CONF_DESTINATION_DETAIL_SENSOR]:
                    return get_specific_platform(self.coordinator.data[self.subentry.subentry_id][self.journey_index], self.entity_description.key)

                elif self.entity_description.key in [CONF_FIRST_LEG_TRAIN_SET_SENSOR, CONF_LAST_LEG_TRAIN_SET_SENSOR]:
                    return get_train_set(self.coordinator.data[self.subentry.subentry_id][self.journey_index], self.entity_description.key)

                else:
                    return self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key]
            except:
                pass

    @property
    def icon(self) -> str:
        try:
            if self.entity_description.key in [CONF_FIRST_LEG_OCCUPANCY_SENSOR, CONF_LAST_LEG_OCCUPANCY_SENSOR]:
                return OCCUPANCY_ICONS.get(self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key], ["mdi:account-question", "Unknown"])[0]
                
            elif self.entity_description.key in [CONF_DUE_SENSOR, CONF_FIRST_LEG_LINE_NAME_SENSOR, CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR, CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR, CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR, CONF_ORIGIN_NAME_SENSOR, CONF_ORIGIN_DETAIL_SENSOR, CONF_FIRST_LEG_TRAIN_SET_SENSOR]:
               return JOURNEY_ICONS.get(self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR], "mdi:train")

            elif self.entity_description.key in [CONF_LAST_LEG_LINE_NAME_SENSOR, CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR, CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR, CONF_LAST_LEG_TRANSPORT_NAME_SENSOR, CONF_DESTINATION_NAME_SENSOR, CONF_DESTINATION_DETAIL_SENSOR, CONF_LAST_LEG_TRAIN_SET_SENSOR]:
               return JOURNEY_ICONS.get(self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR], "mdi:train")

            elif self.entity_description.key in [CONF_DELAY_SENSOR, CONF_ALERTS_SENSOR]:
                return 'mdi:clock-alert-outline'

            elif self.entity_description.key == CONF_CHANGES_SENSOR:
                return 'mdi:map-marker-path'

            elif 'time' in self.entity_description.key:
                return 'mdi:clock-outline'

            else:
                return 'mdi:train'

        except:
            return 'mdi:train'

    @property
    def available(self) -> bool:
        """Return if entity is available - basically check to see if there's data where it should be"""
        try:
            if self.entity_description.key in [CONF_ORIGIN_DETAIL_SENSOR, CONF_DESTINATION_DETAIL_SENSOR, CONF_FIRST_LEG_TRAIN_SET_SENSOR, CONF_LAST_LEG_TRAIN_SET_SENSOR]:
                # These are computed sensors so get the general availabilty from the 'due' sensor
                key_check = CONF_DUE_SENSOR
            else:
                # Check this sensor's data as normal
                key_check = self.entity_description.key

            if self.coordinator.data[self.subentry.subentry_id][self.journey_index][key_check] is None:
                return False

            else:
                return True

        except:
            return False


    @property
    def extra_state_attributes(self):
        """Return the extra state attributes."""
        # Add any additional attributes you want on your sensor.
        attrs = {}

        try:
            # Is this a migrated 'due' sensor?
            if self.subentry.data[CONF_NAME] != '' and self.entity_description.key == CONF_DUE_SENSOR:
                attrs = {
                    'due': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_DUE_SENSOR],
                    'delay': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_DELAY_SENSOR],
                    'arrival_time': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_LAST_LEG_ARRIVAL_TIME_SENSOR],
                    'changes': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_CHANGES_SENSOR],
                    'origin_name': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_ORIGIN_NAME_SENSOR],
                    'origin_detail': get_specific_platform(self.coordinator.data[self.subentry.subentry_id][self.journey_index], CONF_ORIGIN_DETAIL_SENSOR),
                    'departure_time': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR],
                    'destination_name': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_DESTINATION_NAME_SENSOR],
                    'destination_detail': get_specific_platform(self.coordinator.data[self.subentry.subentry_id][self.journey_index], CONF_DESTINATION_DETAIL_SENSOR),
                    'occupancy': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_OCCUPANCY_SENSOR],
                    'origin_line_name': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_LINE_NAME_SENSOR],
                    'short_origin_line_name': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR],
                    'origin_transport_type': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR],
                    'origin_transport_name': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR],
                    'latitude': self.coordinator.data[self.subentry.subentry_id][self.journey_index][ORIGIN_LATITUDE],
                    'longitude': self.coordinator.data[self.subentry.subentry_id][self.journey_index][ORIGIN_LONGITUDE],
                    'alerts': self.coordinator.data[self.subentry.subentry_id][self.journey_index][CONF_ALERTS_SENSOR]
                }            

            else:
                # Attributes for all sensors
                attrs['Attribution'] = TFNSW_ATTRIBUTION
                attrs["Origin ID"] = self.subentry.data[CONF_ORIGIN_ID]
                attrs["Destination ID"] = self.subentry.data[CONF_DESTINATION_ID]
    
                # Key-specific attributes
                if self.coordinator.data is not None and self.subentry.subentry_id in self.coordinator.data:
                    if self.entity_description.key == CONF_CHANGES_SENSOR:
                        # A list of changes in this journey
                        attrs['Locations list'] =  self.coordinator.data[self.subentry.subentry_id][self.journey_index][ATTR_LOCATIONS_LIST]

                    if self.entity_description.key in ['alerts']:
                        # Alerts can be long so they need to go into attributes
                        attrs["Alerts"] = self.coordinator.data[self.subentry.subentry_id][self.journey_index][self.entity_description.key]

        finally:
            return attrs
