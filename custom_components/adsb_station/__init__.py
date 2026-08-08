"""The ADS-B Station integration."""

from __future__ import annotations

from homeassistant.const import CONF_HOST, CONF_PORT, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import AdsbStationClient
from .const import CONF_AIRCRAFT_URL, CONF_FEEDER_TYPE, CONF_STATS_URL, FEEDER_FR24
from .coordinator import AdsbStationConfigEntry, AdsbStationDataUpdateCoordinator

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.SENSOR,
]


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
    coordinator = AdsbStationDataUpdateCoordinator(hass, entry, client)

    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_migrate_entry(
    hass: HomeAssistant, entry: AdsbStationConfigEntry
) -> bool:
    """Bring an entry made by an older version up to date.

    Entries from before there was more than one kind of feeder record none,
    and fr24feed is the only one they can be. Writing it once beats deriving
    it on every load, where it would not appear in the entry itself and would
    puzzle anyone reading diagnostics.
    """
    if entry.version >= 2:
        return True

    data = {**entry.data}
    if CONF_FEEDER_TYPE not in data:
        data[CONF_FEEDER_TYPE] = (
            FEEDER_FR24 if data.get(CONF_PORT) is not None else None
        )
    hass.config_entries.async_update_entry(entry, data=data, version=2)
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
