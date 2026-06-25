"""The Transport NSW Mk II integration."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
import logging

from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigSubentryData
)
from homeassistant.core import (
    HomeAssistant,
    CoreState,
    EVENT_HOMEASSISTANT_STARTED
)
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.device_registry import DeviceEntry
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.const import (
    Platform,
    CONF_NAME,
    CONF_API_KEY,
    CONF_SCAN_INTERVAL
)
from homeassistant.components import (
    persistent_notification,
    websocket_api
)
import voluptuous as vol

from TransportNSWv2 import InvalidAPIKey, StopError

from .helpers import check_stops, set_optional_sensors, get_optional_sensors
from .coordinator import TransportNSWCoordinator
from .const import *
from .www import JSModuleRegistration

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.DEVICE_TRACKER]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type MyConfigEntry = ConfigEntry[RuntimeData]


@dataclass
class RuntimeData:
    """Class to hold your data."""

    coordinator: DataUpdateCoordinator

async def get_migration_data(hass: HomeAssistant, yaml_entry):
     # Convert a migrated YAML entry into ConfigSubentryData data and return it along with the api key

    try:
        api_key = yaml_entry[CONF_API_KEY]
        scan_interval = DEFAULT_SCAN_INTERVAL
        origin_id = str(yaml_entry[CONF_ORIGIN_ID])
        destination_id = str(yaml_entry[CONF_DESTINATION_ID])
        transport_type = yaml_entry.get('transport_type', 0)
        trip_wait_time = yaml_entry.get(CONF_TRIP_WAIT_TIME, 0)
        return_info  = yaml_entry[CONF_RETURN_INFO]
        trips_to_create = yaml_entry.get(CONF_TRIPS_TO_CREATE, 1)
        route_filter = yaml_entry.get(CONF_ROUTE_FILTER, '')
        max_changes = 5
        include_realtime_location = yaml_entry.get(CONF_INCLUDE_REALTIME_LOCATION, True)
        alert_severity = yaml_entry.get(CONF_ALERT_SEVERITY, 'none')
        alert_types = yaml_entry.get(CONF_ALERT_TYPES, ["lineinfo", "routeinfo", "stopinfo", "stopblocking", "bannerinfo"])
        name = yaml_entry.get(CONF_NAME, '')
        
        # Transport type needs to be a list, and we'll assume the destination transport type should be the same as that's the current behaviour
        origin_transport_type = [transport_type]
        destination_transport_type= [transport_type]

        # Get the full list of sensors based on the imported 'return_info'
        sensor_options = set_optional_sensors(return_info)
        
        # Alerts
        if alert_severity != 'none':
            include_alerts = True
        else:
            include_alerts = False
            
        # Real-time location
        if include_realtime_location:
            sensor_options['origin_sensors'][CONF_FIRST_LEG_DEVICE_TRACKER] = True
            sensor_options['destination_sensors'][CONF_LAST_LEG_DEVICE_TRACKER] = 'always'
        else:
            sensor_options['origin_sensors'][CONF_FIRST_LEG_DEVICE_TRACKER] = False
            sensor_options['destination_sensors'][CONF_LAST_LEG_DEVICE_TRACKER] = 'never'

        # We need the stop names for the title, so get them now
        #stop_data = check_stops(api_key, [origin_id, destination_id])
        stop_data = await hass.async_add_executor_job (
             check_stops,
             api_key,
             [origin_id, destination_id]
             )

        if stop_data['all_stops_valid']:
            # Get the origin and destination stop names
            origin_name = stop_data['stop_list'][0]['stop_detail']['disassembledName']
            destination_name = stop_data['stop_list'][1]['stop_detail']['disassembledName']
        else:
            raise StopError

        # Now put it all together
        subentry_data = {
            CONF_NAME: name,
            CONF_ORIGIN_ID: origin_id,
            CONF_ORIGIN_NAME: origin_name,
            CONF_ORIGIN_TRANSPORT_TYPE: origin_transport_type,
            CONF_DESTINATION_ID: destination_id,
            CONF_DESTINATION_NAME: destination_name,
            CONF_DESTINATION_TRANSPORT_TYPE: destination_transport_type,
            CONF_TRIP_WAIT_TIME: trip_wait_time,
            CONF_TRIPS_TO_CREATE: trips_to_create,
            CONF_INCLUDE_REALTIME_LOCATION: include_realtime_location,
            CONF_ROUTE_FILTER: route_filter,
            CONF_MAX_CHANGES: max_changes,
            CONF_SENSOR_CREATION: 'custom',
            CONF_ALERTS_SENSOR: include_alerts,
            CONF_ALERT_SEVERITY: alert_severity,
            CONF_ALERT_TYPES: alert_types
            }

        subentry_data.update(sensor_options)

        return api_key, ConfigSubentryData(data = subentry_data, subentry_type = SUBENTRY_TYPE_JOURNEY, title = f"{origin_name} to {destination_name}", unique_id = f"{origin_id}_{destination_id}"), ''

    except InvalidAPIKey as ex:
        error = 'Invalid API key'

    except StopError as ex:
        error = 'Invalid stop ID'

    except Exception as ex:
        error = 'unknown'

    return api_key, None, error

# Schema migration
async def async_migrate_entry(hass: HomeAssistant, config_entry: MyConfigEntry):

    if config_entry.version > 2:
        # This means the user has downgraded from a future version
        return False

    if config_entry.version == 1:
        # Migrate old entry
        _LOGGER.info(f"Migrating configuration from version {config_entry.version}")

        # Migrate all subentries to the version 2 data schema
        for subentry in config_entry.subentries.values():
            if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
                new_data = {**subentry.data}

                # We need to move a few entries around and create a whole new 'device_trackers' section
                # Cater for missing options by using .get() although theoretically that's impossible
                first_leg_device_tracker = new_data['origin_sensors'].get(CONF_FIRST_LEG_DEVICE_TRACKER, DEFAULT_FIRST_LEG_DEVICE_TRACKER)
                last_leg_device_tracker = new_data['destination_sensors'].get(CONF_LAST_LEG_DEVICE_TRACKER, DEFAULT_LAST_LEG_DEVICE_TRACKER)

                # Create the new sensor dictionary
                new_options = {'device_trackers':
                    {
                        CONF_FIRST_LEG_DEVICE_TRACKER: first_leg_device_tracker,
                        CONF_LAST_LEG_DEVICE_TRACKER: last_leg_device_tracker,
                        CONF_ORIGIN_DEVICE_TRACKER: DEFAULT_ORIGIN_DEVICE_TRACKER,
                        CONF_DESTINATION_DEVICE_TRACKER: DEFAULT_DESTINATION_DEVICE_TRACKER
                    }
                }

                new_data.update(new_options)
                
                # Tidy up the old data a bit
                if CONF_FIRST_LEG_DEVICE_TRACKER in new_data['origin_sensors']:
                    del new_data['origin_sensors'][CONF_FIRST_LEG_DEVICE_TRACKER]

                if CONF_LAST_LEG_DEVICE_TRACKER in new_data['destination_sensors']:
                    del new_data['destination_sensors'][CONF_LAST_LEG_DEVICE_TRACKER]

                # Update the subentry
                # Do we need to do this?  The integration is still loading
                hass.config_entries.async_update_subentry(
                     config_entry,
                     subentry,
                     data = new_data
                     )

        # Finally, update the config entry itself - just the schema version number
        hass.config_entries.async_update_entry(config_entry, minor_version=0, version=2)
        _LOGGER.info(f"Migration to configuration version {config_entry.version} successful")

    return True

async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register frontend modules after HA startup."""
    module_register = JSModuleRegistration(hass)
    await module_register.async_register()

@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/version",
    }
)
@websocket_api.async_response
async def websocket_get_version(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle version request from frontend."""
    connection.send_result(
        msg["id"],
        {"version": INTEGRATION_VERSION},
    )

async def async_setup(hass: HomeAssistant, config_entry: MyConfigEntry):

    # Check if there's an old YAML config to import...
    yaml_data = defaultdict(list)

    # Iterate through and capture the data for each existing entry, grouped by API key
    # These will be converted to a single entry per API key, with multiple subentries
    if 'sensor' in config_entry:
        for sensor in config_entry['sensor']:
            if sensor['platform'] == DOMAIN:
                api_key, subentry_data, error = await get_migration_data(hass, sensor)
                if subentry_data is not None:
                    yaml_data[api_key].append(subentry_data)
                else:
                    persistent_notification.create(
                        hass,
                        f"Failed to import legacy configuration.yaml entries for API key ending `{api_key[-4:]}` with error `{error}`.  Please review those entries, or recreate them manually via 'Devices & Services'.\n\nNote that support for migrating legacy entries will be removed with HA release 2026.6.",
                        title='Transport NSW Mk II',
                        notification_id=f"{DOMAIN}_{api_key}"
                        )


    if yaml_data is not None:
        # We've got a list of unique API keys (probably just the one, TBH), so let's create the entries for them
        for api_key in yaml_data:
            data = {CONF_API_KEY: api_key, CONF_SCAN_INTERVAL: 120, 'subentry_data': yaml_data[api_key]}

            hass.async_create_task(
                hass.config_entries.flow.async_init(
                    DOMAIN, context={"source": config_entries.SOURCE_IMPORT}, data = data
                )
            )

    # Register websocket command for version checking of the Lovelace card
    websocket_api.async_register_command(hass, websocket_get_version)

    return True


async def async_setup_entry(hass: HomeAssistant, config_entry: MyConfigEntry) -> bool:
    """Set up the ha_transportnsw integration from a config entry."""

    """ We need to register the Frontend .JS module, which will be unloaded if the Integration is itself unloaded or reloaded by the user
        We have to do this here as async_setup is only ever called at HA startup, never again for an Integration reload
        As there could potentially be multiple config entries (unlikely, to be fair) we need to cater for that """

    # Initialize our cross-entry tracking container if missing
    try:
        if DOMAIN not in hass.data or "frontend_loaded" not in hass.data[DOMAIN]:
            hass.data[DOMAIN] = {
                "frontend_loaded": False  # Stores active entry_id strings
            }

        # If this is the first entry load we need to register the Javascript module(s)
        if not hass.data[DOMAIN]["frontend_loaded"]:
            # Register the module specific to this Integration
            async def _setup_frontend(_event=None) -> None:
                await async_register_frontend(hass)
        
            # If HA is already running, register immediately
            if hass.state == CoreState.running:
                await _setup_frontend()
            else:
                # Otherwise, wait for the STARTED event
                hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _setup_frontend)

            # Finally make a note that the frontend has been loaded, or will be once HA is running, so other entries know not to do it themselves
            hass.data[DOMAIN]["frontend_loaded"] = True

    except Exception as ex:
        _LOGGER.error(f"Error registering frontend module: {ex}")

    try:
        # Force a quick check and update of the selected sensors if 'verbose', this catches all future sensors that are created
        for subentry in config_entry.subentries.values():
            if subentry.subentry_type == SUBENTRY_TYPE_JOURNEY:
                sensor_creation_option = subentry.data.get(CONF_SENSOR_CREATION, 'none')
                if sensor_creation_option == 'verbose':
                    # Make a copy of the data, update it and then re-save it
                    # This allows us to automatically enable the creation of any new sensors since the user selected 'all sensors' and would reasonably expect new sensors to appear
                    
                    current_sensor_options = get_optional_sensors(subentry.data.copy())
                    new_sensor_options = set_optional_sensors(sensor_creation_option)
    
                    if new_sensor_options != current_sensor_options:
                        # Only update if the options are different
                        new_data = subentry.data.copy()
                        new_data.update(new_sensor_options)
    
                        hass.config_entries.async_update_subentry(config_entry, subentry, data = new_data)
                        _LOGGER.info (f"Updated sensor options")
                    else:
                        _LOGGER.debug (f"Sensors options unchanged")

    except Exception as ex:
        _LOGGER.error(f"Error checking optional sensors: {ex}")

    try:
        # Initialise the coordinator that manages data updates
        coordinator = TransportNSWCoordinator(hass, config_entry)
    
        # Add the coordinator and update listener to config runtime data to make
        # it accessible throughout the integration
        config_entry.runtime_data = RuntimeData(coordinator)
        _LOGGER.debug (f"Initialised coordinator for {config_entry.title}")

    except Exception as ex:
        _LOGGER.error(f"Error initialising coordinator: {ex}")

    # Setup platforms
    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    # Return true to denote a successful setup
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: MyConfigEntry) -> bool:
    """Unload a config entry."""

    try:
        """Unregister frontend modules during unload"""
        module_register = JSModuleRegistration(hass)
        await module_register.async_unregister()

        # Make a note that the frontend has been unloaded
        hass.data[DOMAIN]["frontend_loaded"] = False

    except Exception as ex:
        _LOGGER.error(f"Error unloading frontend module: {ex}")

    # Unload platforms and return result
    return await hass.config_entries.async_unload_platforms(config_entry, PLATFORMS)