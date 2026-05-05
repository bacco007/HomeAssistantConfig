import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_API_KEY, CONF_RADIUS, CONF_SCAN_INTERVAL, DEFAULT_RADIUS_KM, DEFAULT_SCAN_INTERVAL_MINUTES, DOMAIN, PLATFORMS
from .coordinator import EmergencyAPICoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    api_key = entry.data[CONF_API_KEY]
    radius = entry.data.get(CONF_RADIUS, DEFAULT_RADIUS_KM)
    scan_interval = entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL_MINUTES)

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
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
