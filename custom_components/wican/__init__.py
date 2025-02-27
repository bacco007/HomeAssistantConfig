"""Initialize WiCan Integration."""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_IP_ADDRESS, Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import WiCanCoordinator
from .wican import WiCan

PLATFORMS: list[str] = [Platform.BINARY_SENSOR, Platform.SENSOR]
_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """WiCan entry in HomeAssistant.

    Parameters
    ----------
    hass : HomeAssistant
        HomeAssistant object.
    entry: ConfigEntry
        WiCan configuration entry in HomeAssistant.

    Returns
    -------
    bool
        Returns True after platforms have been loaded for integration.

    """

    wican = WiCan(entry.data[CONF_IP_ADDRESS])

    coordinator = WiCanCoordinator(hass, entry, wican)

    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload WiCan integration.

    Parameters
    ----------
    hass : HomeAssistant
        HomeAssistant object.
    entry: ConfigEntry
        WiCan configuration entry in HomeAssistant.

    Returns
    -------
    bool
        If integration has been unloaded successfully.

    """
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
