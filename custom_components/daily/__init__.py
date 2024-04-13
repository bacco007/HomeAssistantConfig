"""The Daily Sensor integration."""
import asyncio
from datetime import timedelta
import logging
import weakref

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers.event import async_track_time_change
from .const import (
    DOMAIN,
    PLATFORMS,
    STARTUP_MESSAGE,
    CONF_NAME,
    CONF_INPUT_SENSOR,
    CONF_OPERATION,
    CONF_INTERVAL,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_AUTO_RESET,
    DEFAULT_AUTO_RESET,
    EVENT_RESET,
    EVENT_UPDATE,
    SERVICE_RESET,
    SERVICE_UPDATE,
    COORDINATOR,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up this integration using YAML is not supported."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up this integration using UI."""
    if hass.data.get(DOMAIN) is None:
        hass.data.setdefault(DOMAIN, {})
        _LOGGER.info(STARTUP_MESSAGE)
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
        input_sensor = hass.data[DOMAIN][entry.entry_id][
            CONF_INPUT_SENSOR
        ] = entry.options.get(CONF_INPUT_SENSOR)
    if CONF_AUTO_RESET in entry.options and entry.options.get(
        CONF_AUTO_RESET
    ) != entry.data.get(CONF_AUTO_RESET):
        auto_reset = hass.data[DOMAIN][entry.entry_id][
            CONF_AUTO_RESET
        ] = entry.options.get(CONF_AUTO_RESET)
    if CONF_INTERVAL in entry.options and entry.options.get(
        CONF_INTERVAL
    ) != entry.data.get(CONF_INTERVAL):
        interval = hass.data[DOMAIN][entry.entry_id][CONF_INTERVAL] = entry.options.get(
            CONF_INTERVAL
        )
    if CONF_OPERATION in entry.options and entry.options.get(
        CONF_OPERATION
    ) != entry.data.get(CONF_OPERATION):
        operation = hass.data[DOMAIN][entry.entry_id][
            CONF_OPERATION
        ] = entry.options.get(CONF_OPERATION)
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

    for platform in PLATFORMS:
        coordinator.platforms.append(platform)
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, platform)
        )

    # add update listener if not already added.
    # if weakref.ref(async_reload_entry) not in entry.update_listeners:
    #    entry.add_update_listener(async_reload_entry)

    hass.data[DOMAIN][entry.entry_id][COORDINATOR] = coordinator
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
    hass.data[DOMAIN][config_entry.entry_id][CONF_INTERVAL] = config_entry.options.get(
        CONF_INTERVAL
    )
    hass.data[DOMAIN][config_entry.entry_id][
        CONF_INPUT_SENSOR
    ] = config_entry.options.get(CONF_INPUT_SENSOR)
    hass.data[DOMAIN][config_entry.entry_id][
        CONF_AUTO_RESET
    ] = config_entry.options.get(CONF_AUTO_RESET)
    hass.data[DOMAIN][config_entry.entry_id][CONF_OPERATION] = config_entry.options.get(
        CONF_OPERATION
    )
    hass.data[DOMAIN][config_entry.entry_id][
        CONF_UNIT_OF_MEASUREMENT
    ] = config_entry.options.get(CONF_UNIT_OF_MEASUREMENT)
    await hass.config_entries.async_reload(config_entry.entry_id)


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
