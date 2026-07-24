import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_API_KEY, CONF_RADIUS, CONF_SCAN_INTERVAL, DEFAULT_RADIUS_KM, DEFAULT_SCAN_INTERVAL_MINUTES, DOMAIN, PLATFORMS
from .coordinator import EmergencyAPICoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    config = {**entry.data, **entry.options}
    api_key = config[CONF_API_KEY]
    radius = config.get(CONF_RADIUS, DEFAULT_RADIUS_KM)
    scan_interval = config.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES)

    latitude = hass.config.latitude
    longitude = hass.config.longitude

    coordinator = EmergencyAPICoordinator(
        hass,
        api_key=api_key,
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        scan_interval=scan_interval,
    )

    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if entry.version > 2:
        # Downgrade from a future version we don't understand.
        return False
    if entry.version == 1:
        # v1 baked the scan interval into entry.data; move free-tier defaults up to
        # the safe interval so existing installs stop hitting the monthly rate limit.
        data = {**entry.data}
        if data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES) < DEFAULT_SCAN_INTERVAL_MINUTES:
            data[CONF_SCAN_INTERVAL] = DEFAULT_SCAN_INTERVAL_MINUTES
        hass.config_entries.async_update_entry(entry, data=data, version=2)
    return True
