"""The Daily Sensor integration."""

import asyncio
from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_AUTO_RESET,
    CONF_INPUT_SENSOR,
    CONF_INTERVAL,
    CONF_NAME,
    CONF_OPERATION,
    CONF_UNIT_OF_MEASUREMENT,
    COORDINATOR,
    DEFAULT_AUTO_RESET,
    DOMAIN,
    EVENT_RESET,
    EVENT_UPDATE,
    PLATFORMS,
    SERVICE_RESET,
    SERVICE_UPDATE,
    STARTUP_MESSAGE,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up this integration using YAML is not supported."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up this integration using UI."""
    if hass.data.get(DOMAIN) is None:
        hass.data.setdefault(DOMAIN, {})
        _LOGGER.info(STARTUP_MESSAGE)
    if entry.entry_id in hass.data[DOMAIN]:
        _LOGGER.warning(f"Sensor '{entry.title}' already set up. Updating config dynamically.")
        existing_data = hass.data[DOMAIN][entry.entry_id]
        existing_entity = existing_data.get("entity")
        if existing_entity:
            await existing_entity.async_update_config(entry.data)
        return True
    name = entry.data.get(CONF_NAME)
    name_no_spaces_but_underscores = name.replace(" ", "_")
    input_sensor = entry.data.get(CONF_INPUT_SENSOR)
    operation = entry.data.get(CONF_OPERATION)
    interval = entry.data.get(CONF_INTERVAL)
    unit_of_measurement = entry.data.get(CONF_UNIT_OF_MEASUREMENT)
    auto_reset = entry.data.get(CONF_AUTO_RESET, DEFAULT_AUTO_RESET)

    # update listener for options flow
    hass_data = dict(entry.data)
    unsub_options_update_listener = entry.add_update_listener(options_update_listener)
    hass_data["unsub_options_update_listener"] = unsub_options_update_listener
    hass.data[DOMAIN][entry.entry_id] = hass_data

    # logic here is: if options are set that do not agree with the data settings, use the options
    # handle options flow data
    if CONF_INPUT_SENSOR in entry.options and entry.options.get(
        CONF_INPUT_SENSOR
    ) != entry.data.get(CONF_INPUT_SENSOR):
        input_sensor = hass.data[DOMAIN][entry.entry_id][CONF_INPUT_SENSOR] = (
            entry.options.get(CONF_INPUT_SENSOR)
        )
    if CONF_AUTO_RESET in entry.options and entry.options.get(
        CONF_AUTO_RESET
    ) != entry.data.get(CONF_AUTO_RESET):
        auto_reset = hass.data[DOMAIN][entry.entry_id][CONF_AUTO_RESET] = (
            entry.options.get(CONF_AUTO_RESET)
        )
    if CONF_INTERVAL in entry.options and entry.options.get(
        CONF_INTERVAL
    ) != entry.data.get(CONF_INTERVAL):
        interval = hass.data[DOMAIN][entry.entry_id][CONF_INTERVAL] = entry.options.get(
            CONF_INTERVAL
        )
    if CONF_OPERATION in entry.options and entry.options.get(
        CONF_OPERATION
    ) != entry.data.get(CONF_OPERATION):
        operation = hass.data[DOMAIN][entry.entry_id][CONF_OPERATION] = (
            entry.options.get(CONF_OPERATION)
        )
    if CONF_UNIT_OF_MEASUREMENT in entry.options and entry.options.get(
        CONF_UNIT_OF_MEASUREMENT
    ) != entry.data.get(CONF_UNIT_OF_MEASUREMENT):
        unit_of_measurement = hass.data[DOMAIN][entry.entry_id][
            CONF_UNIT_OF_MEASUREMENT
        ] = entry.options.get(CONF_UNIT_OF_MEASUREMENT)
    # set up coordinator
    coordinator = DailySensorUpdateCoordinator(
        hass,
        name=name,
        input_sensor=input_sensor,
        operation=operation,
        interval=interval,
        unit_of_measurement=unit_of_measurement,
        auto_reset=auto_reset,
    )

    await coordinator.async_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data[DOMAIN][entry.entry_id][COORDINATOR] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # add update listener if not already added.
    # if weakref.ref(async_reload_entry) not in entry.update_listeners:
    #    entry.add_update_listener(async_reload_entry)

    # register services
    hass.services.async_register(
        DOMAIN,
        f"{name_no_spaces_but_underscores}_{SERVICE_RESET}",
        coordinator.handle_reset,
    )
    hass.services.async_register(
        DOMAIN,
        f"{name_no_spaces_but_underscores}_{SERVICE_UPDATE}",
        coordinator.handle_update,
    )
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Reload config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
    if coordinator.entry_setup_completed:
        await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


async def options_update_listener(hass, config_entry):
    """Handle options update."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][COORDINATOR]

    # Update interval if changed
    new_interval = config_entry.options.get(CONF_INTERVAL)
    if new_interval is not None and int(new_interval) != coordinator.interval:
        _LOGGER.info(
            "Changing update interval (no reload) to %s seconds for entry '%s'.",
            new_interval,
            config_entry.entry_id,
        )
        coordinator.interval = int(new_interval)
        coordinator.update_interval = timedelta(seconds=coordinator.interval)

    # Update input sensor if changed
    new_input = config_entry.options.get(CONF_INPUT_SENSOR)
    if new_input and new_input != coordinator.input_sensor:
        _LOGGER.info("Changing input sensor from '%s' to '%s'.", coordinator.input_sensor, new_input)
        coordinator.input_sensor = new_input
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update auto_reset if changed
    new_auto_reset = config_entry.options.get(CONF_AUTO_RESET)
    if new_auto_reset is not None and new_auto_reset != coordinator.auto_reset:
        _LOGGER.info("Changing auto_reset from '%s' to '%s'.", coordinator.auto_reset, new_auto_reset)
        coordinator.auto_reset = new_auto_reset
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update operation if changed
    new_operation = config_entry.options.get(CONF_OPERATION)
    if new_operation and new_operation != coordinator.operation:
        _LOGGER.info("Changing operation from '%s' to '%s'.", coordinator.operation, new_operation)
        coordinator.operation = new_operation
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update unit_of_measurement if changed
    new_uom = config_entry.options.get(CONF_UNIT_OF_MEASUREMENT)
    if new_uom and new_uom != coordinator.unit_of_measurement:
        _LOGGER.info("Changing unit_of_measurement from '%s' to '%s'.", coordinator.unit_of_measurement, new_uom)
        coordinator.unit_of_measurement = new_uom
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    await coordinator.async_request_refresh()

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Handle removal of an entry."""
    if DOMAIN in hass.data and entry.entry_id in hass.data[DOMAIN]:
        coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
        unloaded = all(
            await asyncio.gather(
                *[
                    hass.config_entries.async_forward_entry_unload(entry, platform)
                    for platform in PLATFORMS
                    if platform in coordinator.platforms
                ]
            )
        )
        if unloaded:
            hass.data[DOMAIN].pop(entry.entry_id)

        return unloaded
    return True


async def async_remove_entry(hass, entry):
    """Remove Daily sensor config entry."""
    if DOMAIN in hass.data and entry.entry_id in hass.data[DOMAIN]:
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
        await coordinator.async_delete_config()
        del hass.data[DOMAIN][entry.entry_id]


class DailySensorUpdateCoordinator(DataUpdateCoordinator):
    """Class to store settings."""

    def __init__(
        self,
        hass,
        name,
        input_sensor,
        operation,
        interval,
        unit_of_measurement,
        auto_reset,
    ):
        """Initialize."""
        self.name = name
        self.input_sensor = input_sensor
        self.operation = operation
        self.interval = int(interval)
        self.unit_of_measurement = unit_of_measurement
        self.auto_reset = auto_reset
        self.hass = hass
        self.entities = {}
        self.platforms = []
        self.entry_setup_completed = False

        SCAN_INTERVAL = timedelta(seconds=self.interval)
        super().__init__(hass, _LOGGER, name=name, update_interval=SCAN_INTERVAL)

        # reset happens at midnight
        _LOGGER.info("auto_reset: {0}".format(self.auto_reset))
        if self.auto_reset:
            async_track_time_change(
                hass,
                self._async_reset,
                hour=0,
                minute=0,
                second=0,
            )
            _LOGGER.info("registered for time change.")
        self.entry_setup_completed = True

    def register_entity(self, thetype, entity):
        """Register an entity."""
        self.entities[thetype] = entity

    def fire_event(self, event):
        """Fire an event."""
        event_to_fire = f"{self.name}_{event}"
        self.hass.bus.fire(event_to_fire)

    def handle_reset(self, call):
        """Hande the reset service call."""
        self.fire_event(EVENT_RESET)

    def handle_update(self, call):
        """Handle the update service call."""
        self.fire_event(EVENT_UPDATE)

    async def _async_reset(self, *args):
        _LOGGER.info("Resetting daily sensor {}!".format(self.name))
        self.fire_event(EVENT_RESET)

    async def _async_update_data(self):
        """Update data."""
        _LOGGER.info("Updating Daily Sensor {}".format(self.name))
        # fire an event so the sensor can update itself.
        self.fire_event(EVENT_UPDATE)
