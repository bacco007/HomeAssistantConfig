"""The ADS-B Station integration."""

from __future__ import annotations

from homeassistant.const import CONF_HOST, CONF_PORT, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType

from .api import AdsbStationClient
from .const import (
    CONF_AIRCRAFT_URL,
    CONF_FEEDER_TYPE,
    CONF_LOOK_UP_ROUTES,
    CONF_STATS_URL,
    FEEDER_FR24,
)
from .coordinator import AdsbStationConfigEntry, AdsbStationDataUpdateCoordinator
from .intent import async_setup_intents
from .reference import async_load_reference
from .services import async_setup_services

# What the option was called while it named a source rather than a yes or no.
LEGACY_ROUTE_SOURCE = "route_source"

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.GEO_LOCATION,
    Platform.SENSOR,
]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register what belongs to the integration rather than to one station.

    The services and the spoken questions answer about a station, but they
    are the integration's and are registered once. Doing it per entry would
    register them again for the second feeder in front of the same decoder,
    and unregister them for both when either one is removed.
    """
    async_setup_services(hass)
    async_setup_intents(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: AdsbStationConfigEntry) -> bool:
    """Set up an ADS-B station from a config entry."""
    client = AdsbStationClient(
        async_get_clientsession(hass),
        entry.data[CONF_HOST],
        # A station without fr24feed has no status page to read.
        entry.data.get(CONF_PORT),
        entry.data.get(CONF_AIRCRAFT_URL),
        entry.data.get(CONF_STATS_URL),
        feeder_type=entry.data.get(CONF_FEEDER_TYPE),
    )
    coordinator = AdsbStationDataUpdateCoordinator(
        hass, entry, client, await async_load_reference(hass)
    )

    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_migrate_entry(
    hass: HomeAssistant, entry: AdsbStationConfigEntry
) -> bool:
    """Bring an entry made by an older version up to date."""
    data = {**entry.data}
    options = {**entry.options}

    # Entries from before there was more than one kind of feeder record none,
    # and fr24feed is the only one they can be. Writing it once beats deriving
    # it on every load, where it would not appear in the entry itself and
    # would puzzle anyone reading diagnostics.
    if entry.version < 2 and CONF_FEEDER_TYPE not in data:
        data[CONF_FEEDER_TYPE] = (
            FEEDER_FR24 if data.get(CONF_PORT) is not None else None
        )

    # Routes used to be a choice between two sources, one of which sent a
    # sixth of the aircraft the way they had come. Anyone who picked either of
    # them asked for routes, and that is all the setting says now.
    if entry.version < 3 and LEGACY_ROUTE_SOURCE in options:
        options[CONF_LOOK_UP_ROUTES] = (
            options.pop(LEGACY_ROUTE_SOURCE) not in (None, "none")
        )

    hass.config_entries.async_update_entry(
        entry, data=data, options=options, version=3
    )
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: AdsbStationConfigEntry
) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(
    hass: HomeAssistant, entry: AdsbStationConfigEntry
) -> None:
    """Reload the entry after the options changed."""
    await hass.config_entries.async_reload(entry.entry_id)
