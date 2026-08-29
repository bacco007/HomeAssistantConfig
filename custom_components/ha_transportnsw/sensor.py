"""Interfaces with the Transport NSW Mk II API sensors."""

import logging
from datetime import datetime #, timezone, timedelta

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

from dataclasses import dataclass
from collections.abc import Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.config_entries import ConfigSubentry
from homeassistant.const import EntityCategory
from homeassistant.util import dt as dt_util

from . import TransportNSWConfigEntry
from .const import (
    ALERT_PRIORITIES,
    API_CALLS,
    API_CALLS_NAME,
    API_DAILY_LIMIT,
    AVERAGE_API_CALLS,
    AVERAGE_API_CALLS_NAME,
    AVERAGE_API_CALLS_WINDOW,
    CONF_ALERTS_FRIENDLY,
    CONF_ALERTS_SENSOR,
    CONF_CHANGES_FRIENDLY,
    CONF_CHANGES_SENSOR,
    CONF_DELAY_FRIENDLY,
    CONF_DELAY_SENSOR,
    CONF_DESTINATION_DETAIL_FRIENDLY,
    CONF_DESTINATION_DETAIL_SENSOR,
    CONF_DESTINATION_ID,
    CONF_DESTINATION_NAME,
    CONF_DESTINATION_NAME_FRIENDLY,
    CONF_DESTINATION_NAME_SENSOR,
    CONF_DUE_FRIENDLY,
    CONF_DUE_SENSOR,
    CONF_DURATION_FRIENDLY,
    CONF_DURATION_SENSOR,
    CONF_FIRST_LEG_DEPARTURE_TIME_FRIENDLY,
    CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR,
    CONF_FIRST_LEG_LINE_NAME_FRIENDLY,
    CONF_FIRST_LEG_LINE_NAME_SENSOR,
    CONF_FIRST_LEG_LINE_NAME_SHORT_FRIENDLY,
    CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR,
    CONF_FIRST_LEG_OCCUPANCY_DETAIL_FRIENDLY,
    CONF_FIRST_LEG_OCCUPANCY_DETAIL_SENSOR,
    CONF_FIRST_LEG_OCCUPANCY_FRIENDLY,
    CONF_FIRST_LEG_OCCUPANCY_SENSOR,
    CONF_FIRST_LEG_RUN_NAME_FRIENDLY,
    CONF_FIRST_LEG_RUN_NAME_SENSOR,
    CONF_FIRST_LEG_TRAIN_SET_FRIENDLY,
    CONF_FIRST_LEG_TRAIN_SET_SENSOR,
    CONF_FIRST_LEG_TRANSPORT_NAME_FRIENDLY,
    CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR,
    CONF_FIRST_LEG_TRANSPORT_TYPE_FRIENDLY,
    CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR,
    CONF_LAST_LEG_ARRIVAL_TIME_FRIENDLY,
    CONF_LAST_LEG_ARRIVAL_TIME_SENSOR,
    CONF_LAST_LEG_LINE_NAME_FRIENDLY,
    CONF_LAST_LEG_LINE_NAME_SENSOR,
    CONF_LAST_LEG_LINE_NAME_SHORT_FRIENDLY,
    CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR,
    CONF_LAST_LEG_OCCUPANCY_DETAIL_FRIENDLY,
    CONF_LAST_LEG_OCCUPANCY_DETAIL_SENSOR,
    CONF_LAST_LEG_OCCUPANCY_FRIENDLY,
    CONF_LAST_LEG_OCCUPANCY_SENSOR,
    CONF_LAST_LEG_RUN_NAME_FRIENDLY,
    CONF_LAST_LEG_RUN_NAME_SENSOR,
    CONF_LAST_LEG_TRAIN_SET_FRIENDLY,
    CONF_LAST_LEG_TRAIN_SET_SENSOR,
    CONF_LAST_LEG_TRANSPORT_NAME_FRIENDLY,
    CONF_LAST_LEG_TRANSPORT_NAME_SENSOR,
    CONF_LAST_LEG_TRANSPORT_TYPE_FRIENDLY,
    CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR,
    CONF_ORIGIN_DETAIL_FRIENDLY,
    CONF_ORIGIN_DETAIL_SENSOR,
    CONF_ORIGIN_ID,
    CONF_ORIGIN_NAME,
    CONF_ORIGIN_NAME_FRIENDLY,
    CONF_ORIGIN_NAME_SENSOR,
    CONF_POLLING_FRIENDLY,
    CONF_POLLING_SENSOR,
    CONF_TRIPS_TO_CREATE,
    DOMAIN,
    JOURNEY_ICONS,
    OCCUPANCY_DETAIL_GLYPHS,
    OCCUPANCY_ICONS,
    SUBENTRY_TYPE_JOURNEY,
    TFNSW_ATTRIBUTION,
)
from .coordinator import TransportNSWCoordinator
from .helpers import (
    remove_entity,
    remove_device,
    extract_from_hierarchy,
    get_journey_data,
    get_auto_poll_interval,
    within_poll_time,
)

_LOGGER = logging.getLogger(__name__)

def get_daily_api_calls(coordinator: TransportNSWCoordinator) -> int:
    """ Return the current daily API calls total. """
    return coordinator.daily_api_calls


def get_average_api_calls(coordinator: TransportNSWCoordinator) -> int:
    """ Return the current API rolling average . """
    return coordinator.rolling_average_api_calls


def get_highest_alert(alerts) -> str:
    # Search the alerts and return the highest
    highest_alert = -1
    highest_alert_text = 'None'

    try:
        for alert in alerts:
            if ALERT_PRIORITIES.get(alert['priority'],-1) > highest_alert:
                highest_alert = ALERT_PRIORITIES.get(alert['priority'],-1)
                highest_alert_text = alert['priority']
    
    finally:
        pass

    return highest_alert_text.capitalize()


def get_occupancy_friendly(occupancy) -> str:
    # Convert the basic occupancy name (eg MANY_SEATS) into a more friendly version
    return OCCUPANCY_ICONS.get(occupancy, ["mdi:account-question", "Fail"])[1]


def get_occupancy_detail(occupancy_detail) -> str:
    # Generate a list of glyphs showing per-carriage occupancy, if we have it
    try:
        occupancy_glyphs = ""

        if not occupancy_detail:
            occupancy_glyphs = 'Unknown'
        else:
            for carriage in occupancy_detail:
                carriage_glyph = OCCUPANCY_DETAIL_GLYPHS.get(carriage['occupancy'], "⬜")
                occupancy_glyphs = f"{carriage_glyph}{occupancy_glyphs}"

            # Add the direction indicator if necessary
            if len(occupancy_glyphs) > 1:
                occupancy_glyphs += "➜"

    except:
        occupancy_glyphs = 'Unknown'

    return occupancy_glyphs


def convert_date(utc_string) -> datetime:

    utc_dt = dt_util.parse_datetime(utc_string)
    local_dt = dt_util.as_local(utc_dt)

    return local_dt


# Extend the default SensorEntityDescription class
@dataclass(frozen = True, kw_only = True)
class TransportNSWSensorEntityDescription(SensorEntityDescription):
    # Custom extension adding a value path for retrieving simple values from the data returned by DataUpdateCoordinator
    # or a callable function for more complex returns

    state_path: str | None = None
    state_fn: Callable[[Any], Any] | None = None
    attrs_path: str | None = None
    attrs_friendly: str | None = None

# Config_entry-level sensor definitions
DEFAULT_ENTRY_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=API_CALLS,
        name=API_CALLS_NAME,
        native_unit_of_measurement='calls',
        icon='mdi:counter',
        entity_category=EntityCategory.DIAGNOSTIC,
        state_fn = get_daily_api_calls,
    ),
    TransportNSWSensorEntityDescription(
        key=AVERAGE_API_CALLS,
        name=AVERAGE_API_CALLS_NAME,
        native_unit_of_measurement='calls',
        icon='mdi:counter',
        entity_category=EntityCategory.DIAGNOSTIC,
        state_fn = get_average_api_calls,
    ),
)

# Default subentry-level sensor definitions
DEFAULT_SUBENTRY_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=CONF_DUE_SENSOR,
        name=CONF_DUE_FRIENDLY,
        icon='mdi:clock-outline',
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_path = 'due'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_POLLING_SENSOR,
        name=CONF_POLLING_FRIENDLY,
        icon='mdi:clock-check-outline',
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
)

# Optional sensor definitions
TIME_AND_CHANGE_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_DEPARTURE_TIME_SENSOR,
        name=CONF_FIRST_LEG_DEPARTURE_TIME_FRIENDLY,
        icon='mdi:clock-outline',
        device_class = SensorDeviceClass.TIMESTAMP,
        state_fn = convert_date,
        state_path = 'origin_detail.departure_time'
        
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_ARRIVAL_TIME_SENSOR,
        name=CONF_LAST_LEG_ARRIVAL_TIME_FRIENDLY,
        icon='mdi:clock-outline',
        device_class = SensorDeviceClass.TIMESTAMP,
        state_fn = convert_date,
        state_path = 'destination_detail.arrival_time'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_DELAY_SENSOR,
        name=CONF_DELAY_FRIENDLY,
        icon='mdi:clock-alert-outline',
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_path = 'delay'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_DURATION_SENSOR,
        name=CONF_DURATION_FRIENDLY,
        icon='mdi:clock-outline',
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_path = 'duration'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_CHANGES_SENSOR,
        name=CONF_CHANGES_FRIENDLY,
        icon='mdi:map-marker-path',
        native_unit_of_measurement = 'changes',
        state_path = 'changes',
        attrs_path = ['changes_simple', 'stop_list'],
        attrs_friendly = ['stops', 'detailed_stops']
    )
)

ORIGIN_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=CONF_ORIGIN_NAME_SENSOR,
        name=CONF_ORIGIN_NAME_FRIENDLY,
        state_path = 'origin_detail.name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_ORIGIN_DETAIL_SENSOR,
        name=CONF_ORIGIN_DETAIL_FRIENDLY,
        state_path = 'origin_detail.detail'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_RUN_NAME_SENSOR,
        name=CONF_FIRST_LEG_RUN_NAME_FRIENDLY,
        state_path = 'origin_transport_detail.run_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_LINE_NAME_SENSOR,
        name=CONF_FIRST_LEG_LINE_NAME_FRIENDLY,
        state_path = 'origin_transport_detail.line_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_LINE_NAME_SHORT_SENSOR,
        name=CONF_FIRST_LEG_LINE_NAME_SHORT_FRIENDLY,
        state_path = 'origin_transport_detail.line_name_short'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_TRANSPORT_TYPE_SENSOR,
        name=CONF_FIRST_LEG_TRANSPORT_TYPE_FRIENDLY,
        state_path = 'origin_transport_detail.type'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_TRANSPORT_NAME_SENSOR,
        name=CONF_FIRST_LEG_TRANSPORT_NAME_FRIENDLY,
        state_path = 'origin_transport_detail.provider_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_OCCUPANCY_SENSOR,
        name=CONF_FIRST_LEG_OCCUPANCY_FRIENDLY,
        state_fn = get_occupancy_friendly,
        state_path = 'origin_transport_detail.occupancy',
        attrs_path = ['origin_transport_detail.carriage_detail'],
        attrs_friendly = ['occupancy_detail']
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_OCCUPANCY_DETAIL_SENSOR,
        name=CONF_FIRST_LEG_OCCUPANCY_DETAIL_FRIENDLY,
        state_fn = get_occupancy_detail,
        state_path = 'origin_transport_detail.carriage_detail',
        attrs_path = ['origin_transport_detail.carriage_detail'],
        attrs_friendly = ['occupancy_detail']
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_FIRST_LEG_TRAIN_SET_SENSOR,
        name=CONF_FIRST_LEG_TRAIN_SET_FRIENDLY,
        state_path = 'origin_transport_detail.vehicle_set'
    )
)

DESTINATION_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=CONF_DESTINATION_NAME_SENSOR,
        name=CONF_DESTINATION_NAME_FRIENDLY,
        state_path = 'destination_detail.name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_DESTINATION_DETAIL_SENSOR,
        name=CONF_DESTINATION_DETAIL_FRIENDLY,
        state_path = 'destination_detail.detail'

    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_RUN_NAME_SENSOR,
        name=CONF_LAST_LEG_RUN_NAME_FRIENDLY,
        state_path = 'destination_transport_detail.run_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_LINE_NAME_SENSOR,
        name=CONF_LAST_LEG_LINE_NAME_FRIENDLY,
        state_path = 'destination_transport_detail.line_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_LINE_NAME_SHORT_SENSOR,
        name=CONF_LAST_LEG_LINE_NAME_SHORT_FRIENDLY,
        state_path = 'destination_transport_detail.line_name_short'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_TRANSPORT_TYPE_SENSOR,
        name=CONF_LAST_LEG_TRANSPORT_TYPE_FRIENDLY,
        state_path = 'destination_transport_detail.type'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_TRANSPORT_NAME_SENSOR,
        name=CONF_LAST_LEG_TRANSPORT_NAME_FRIENDLY,
        state_path = 'destination_transport_detail.provider_name'
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_OCCUPANCY_SENSOR,
        name=CONF_LAST_LEG_OCCUPANCY_FRIENDLY,
        state_fn = get_occupancy_friendly,
        state_path = 'destination_transport_detail.occupancy',
        attrs_path = ['destination_transport_detail.carriage_detail'],
        attrs_friendly = ['occupancy_detail']
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_OCCUPANCY_DETAIL_SENSOR,
        name=CONF_LAST_LEG_OCCUPANCY_DETAIL_FRIENDLY,
        state_fn = get_occupancy_detail,
        state_path = 'destination_transport_detail.carriage_detail',
        attrs_path = ['destination_transport_detail.carriage_detail'],
        attrs_friendly = ['occupancy_detail']
    ),
    TransportNSWSensorEntityDescription(
        key=CONF_LAST_LEG_TRAIN_SET_SENSOR,
        name=CONF_LAST_LEG_TRAIN_SET_FRIENDLY,
        state_path = 'destination_transport_detail.vehicle_set'
    )
)

ALERT_SENSORS: tuple[TransportNSWSensorEntityDescription, ...] = (
    TransportNSWSensorEntityDescription(
        key=CONF_ALERTS_SENSOR,
        name=CONF_ALERTS_FRIENDLY,
        icon='mdi:alert-outline',
        state_fn = get_highest_alert,
        state_path = 'alerts',
        attrs_path = 'alerts',
        attrs_friendly = 'alerts'
    ),
)

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: TransportNSWConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
):
    """Set up the Sensors."""
    # This gets the data update coordinator from the config entry runtime data as specified __init__.py
    coordinator: TransportNSWCoordinator = config_entry.runtime_data.coordinator

    # Be ready to remove devices and sensors if required
    device_reg = dr.async_get(hass)
    entity_reg = er.async_get(hass)

    # Create the sub_entry sensors
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

                
    # Create the config_entry sensors
    configentry_sensors = [
        TransportNSWSensor(coordinator, description, config_entry)
        for description in DEFAULT_ENTRY_SENSORS
    ]

    async_add_entities(configentry_sensors, update_before_add = True)


class TransportNSWSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a configentry sensor."""

    entity_description: TransportNSWSensorEntityDescription

    def __init__(self, coordinator: TransportNSWCoordinator, description: TransportNSWSensorEntityDescription, config_entry: TransportNSWConfigEntry) -> None:
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
    def device_info(self) -> DeviceInfo:
        """Return device info for this sensor."""
        identifiers = {
        "identifiers": {(DOMAIN, f"{self.config_entry.entry_id}_API_details")
        },
        "name": f"{self.config_entry.title} Integration",
        "manufacturer": "Transport for NSW"
        }

        return identifiers

    @property
    def native_value(self) -> StateType:
        """Return the value of the sensor."""
        try:
            value = self.entity_description.state_fn(self.coordinator)
            return value

        except Exception as ex:
            return None

    @property
    def extra_state_attributes(self):
        """Return the extra state attributes."""

        attrs = {}

        try:
            # Key-specific attributes
            if self.entity_description.key == AVERAGE_API_CALLS:
                attrs['update_interval_secs'] = self.coordinator.update_interval.total_seconds()

        finally:
            # Always make sure there's the appropriate attribution
            attrs['attribution'] = TFNSW_ATTRIBUTION

        return attrs


class TransportNSWSubentrySensor(CoordinatorEntity, SensorEntity):
    """Implementation of subentry sensor."""

    entity_description: TransportNSWSensorEntityDescription

    def __init__(self, coordinator: TransportNSWCoordinator, description: TransportNSWSensorEntityDescription, subentry: ConfigSubentry, index: int, sensor_suffix: str, name_suffix: str, device_suffix: str, migration_suffix: str, device_identifier: str) -> None:
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

        try:
            # The 'polling' sensor is a special case - it doesn't require access to journey_data
            if self.entity_description.key == CONF_POLLING_SENSOR:
                is_polling, next_change = within_poll_time(self.subentry)
                if is_polling:
                    return f"Active until {next_change}" if next_change is not None else "Active"
                else:
                    return f"Inactive until {next_change}" if next_change is not None else "Inactive"

            # Use the extended entity_description attributes to work out where and how to return the sensor state
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Get what's in 'state_path' first
                value = extract_from_hierarchy(obj=journey_data, path=self.entity_description.state_path)

                # Now either return it, or pass it through an associated function first
                value = extract_from_hierarchy(obj=journey_data, path=self.entity_description.state_path)
                if self.entity_description.state_fn:
                    return self.entity_description.state_fn(value)
                else:
                    # Just return it as-is
                    return value

        except Exception as ex:
            _LOGGER.error(f"Error {ex} retrieving sensor state for sensor {self.entity_description.key}")


    @property
    def icon(self) -> str:
        try:
            # The 'polling' sensor is a special case - it doesn't require access to journey_data
            if self.entity_description.key == CONF_POLLING_SENSOR:
                is_polling = within_poll_time(self.subentry)[0]
                return "mdi:clock-check-outline" if is_polling else "mdi:clock-remove-outline"

            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Apply the appropriate icons to a subset of the sensors.  All but a handful are aligned to the transport type
                if 'origin' in self.entity_description.key:
                    transport_type = extract_from_hierarchy(obj=journey_data, path='origin_transport_detail.type')
                else:
                    transport_type = extract_from_hierarchy(obj=journey_data, path='destination_transport_detail.type')

                if self.entity_description.key in [CONF_FIRST_LEG_OCCUPANCY_SENSOR, CONF_FIRST_LEG_OCCUPANCY_DETAIL_SENSOR]:
                    occupancy = extract_from_hierarchy(obj=journey_data, path='origin_transport_detail.occupancy')
                    return OCCUPANCY_ICONS.get(occupancy, ["mdi:account-question", "Unknown"])[0]

                elif self.entity_description.key in [CONF_LAST_LEG_OCCUPANCY_SENSOR, CONF_LAST_LEG_OCCUPANCY_DETAIL_SENSOR]:
                    occupancy = extract_from_hierarchy(obj=journey_data, path='destination_transport_detail.occupancy')
                    return OCCUPANCY_ICONS.get(occupancy, ["mdi:account-question", "Unknown"])[0]

                else:
                    # Only use the transport_type icon for sensors that don't have an icon pre-defined
                    if self.entity_description.icon is None:
                        return JOURNEY_ICONS.get(transport_type, 'mdi:train')
                    else:
                        # Curious why we have to keep re-returning the same icon?
                        return self.entity_description.icon

        except:
            return 'mdi:train'

    @property
    def available(self) -> bool:
        """Return if entity is available - basically check to see if there's data where it should be"""
        try:
            # The 'polling' sensor is a special case - it doesn't require access to journey_data
            if self.entity_description.key == CONF_POLLING_SENSOR:
                return True

            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                return True
            else:
                return False

        except:
            return False

    @property
    def extra_state_attributes(self):
        """Return the extra state attributes."""

        attrs = {}

        try:
            journey_data = get_journey_data(self.coordinator.data, self.subentry.subentry_id, self.journey_index)
            if journey_data is not None:
                # Attributes for all sensors
                attrs["origin_id"] = extract_from_hierarchy(obj=journey_data, path='origin_detail.stop_id')
                attrs["destination_id"] = extract_from_hierarchy(obj=journey_data, path='destination_detail.stop_id')
    
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
