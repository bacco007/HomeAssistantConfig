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
    CONF_PRESERVE_ON_UNAVAILABLE,
    CONF_UNIT_OF_MEASUREMENT,
    COORDINATOR,
    DEFAULT_AUTO_RESET,
    DEFAULT_PRESERVE_ON_UNAVAILABLE,
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
        _LOGGER.warning(
            f"Sensor '{entry.title}' already set up. Skipping duplicate setup."
        )
        return True
    name = entry.data.get(CONF_NAME)
    sanitized_name = name.replace(" ", "_")
    input_sensor = entry.data.get(CONF_INPUT_SENSOR)
    operation = entry.data.get(CONF_OPERATION)
    interval = entry.data.get(CONF_INTERVAL)
    unit_of_measurement = entry.data.get(CONF_UNIT_OF_MEASUREMENT)
    auto_reset = entry.data.get(CONF_AUTO_RESET, DEFAULT_AUTO_RESET)
    preserve_on_unavailable = entry.data.get(
        CONF_PRESERVE_ON_UNAVAILABLE, DEFAULT_PRESERVE_ON_UNAVAILABLE
    )

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
    if CONF_PRESERVE_ON_UNAVAILABLE in entry.options and entry.options.get(
        CONF_PRESERVE_ON_UNAVAILABLE
    ) != entry.data.get(CONF_PRESERVE_ON_UNAVAILABLE):
        preserve_on_unavailable = hass.data[DOMAIN][entry.entry_id][
            CONF_PRESERVE_ON_UNAVAILABLE
        ] = entry.options.get(CONF_PRESERVE_ON_UNAVAILABLE)
    # set up coordinator
    coordinator = DailySensorUpdateCoordinator(
        hass,
        name=name,
        input_sensor=input_sensor,
        operation=operation,
        interval=interval,
        unit_of_measurement=unit_of_measurement,
        auto_reset=auto_reset,
        preserve_on_unavailable=preserve_on_unavailable,
    )

    await coordinator.async_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data[DOMAIN][entry.entry_id][COORDINATOR] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # register services
    hass.services.async_register(
        DOMAIN,
        f"{sanitized_name}_{SERVICE_RESET}",
        coordinator.handle_reset,
    )
    hass.services.async_register(
        DOMAIN,
        f"{sanitized_name}_{SERVICE_UPDATE}",
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
        _LOGGER.info(
            "Changing input sensor from '%s' to '%s'.",
            coordinator.input_sensor,
            new_input,
        )
        coordinator.input_sensor = new_input
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update auto_reset if changed
    new_auto_reset = config_entry.options.get(CONF_AUTO_RESET)
    if new_auto_reset is not None and new_auto_reset != coordinator.auto_reset:
        _LOGGER.info(
            "Changing auto_reset from '%s' to '%s'.",
            coordinator.auto_reset,
            new_auto_reset,
        )
        coordinator.auto_reset = new_auto_reset
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update operation if changed
    new_operation = config_entry.options.get(CONF_OPERATION)
    if new_operation and new_operation != coordinator.operation:
        _LOGGER.info(
            "Changing operation from '%s' to '%s'.",
            coordinator.operation,
            new_operation,
        )
        coordinator.operation = new_operation
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update unit_of_measurement if changed
    new_uom = config_entry.options.get(CONF_UNIT_OF_MEASUREMENT)
    if new_uom and new_uom != coordinator.unit_of_measurement:
        _LOGGER.info(
            "Changing unit_of_measurement from '%s' to '%s'.",
            coordinator.unit_of_measurement,
            new_uom,
        )
        coordinator.unit_of_measurement = new_uom
        sensor_entity = coordinator.entities.get("sensor")
        if sensor_entity:
            sensor_entity.async_write_ha_state()

    # Update preserve_on_unavailable if changed
    new_preserve_on_unavailable = config_entry.options.get(CONF_PRESERVE_ON_UNAVAILABLE)
    if (
        new_preserve_on_unavailable is not None
        and new_preserve_on_unavailable != coordinator.preserve_on_unavailable
    ):
        _LOGGER.info(
            "Changing preserve_on_unavailable from '%s' to '%s'.",
            coordinator.preserve_on_unavailable,
            new_preserve_on_unavailable,
        )
        coordinator.preserve_on_unavailable = new_preserve_on_unavailable
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
        coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
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
        preserve_on_unavailable,
    ):
        """Initialize."""
        self.name = name
        self.input_sensor = input_sensor
        self.operation = operation
        self.interval = int(interval)
        self.unit_of_measurement = unit_of_measurement
        self.auto_reset = auto_reset
        self.preserve_on_unavailable = preserve_on_unavailable
        self.hass = hass
        self.entities = {}
        self.platforms = []
        self.entry_setup_completed = False

        SCAN_INTERVAL = timedelta(seconds=self.interval)
        super().__init__(hass, _LOGGER, name=name, update_interval=SCAN_INTERVAL)

        # reset happens at midnight
        _LOGGER.info(f"auto_reset: {self.auto_reset}")
        if self.auto_reset:
            async_track_time_change(
                hass,
                self._async_reset,
                hour=0,
                minute=0,
                second=0,
            )
            _LOGGER.info("Registered for time change at midnight.")
        self.entry_setup_completed = True

    def register_entity(self, entity_type, entity):
        """Register an entity."""
        self.entities[entity_type] = entity

    def fire_event(self, event):
        """Fire an event."""
        event_to_fire = f"{self.name}_{event}"
        self.hass.bus.fire(event_to_fire)

    def handle_reset(self, call):
        """Handle the reset service call."""
        self.fire_event(EVENT_RESET)

    def handle_update(self, call):
        """Handle the update service call."""
        self.fire_event(EVENT_UPDATE)

    async def _async_reset(self, *args):
        _LOGGER.info(f"Resetting daily sensor {self.name}")
        self.fire_event(EVENT_RESET)

    async def _async_update_data(self):
        """Update data."""
        _LOGGER.info(f"Updating Daily Sensor {self.name}")
        # fire an event so the sensor can update itself.
        self.fire_event(EVENT_UPDATE)
