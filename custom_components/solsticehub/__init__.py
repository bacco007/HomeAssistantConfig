"""The SolsticeHub integration.

This integration provides precise, daily seasonal information as sensors
in Home Assistant. It calculates astronomical events and provides various
calendar-based sensors.

v2.0 Architecture:
- Each config entry creates one device with its own coordinator
- Device types: Four Seasons, Cross-Quarter, Chinese Solar Terms
- Every device also exposes the shared base-data sensors
  (solar_longitude, daylight_trend, next_daylight_trend_change)
- No shared state between devices
- Hemisphere is fixed after configuration (no runtime changes)
"""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .chinese_coordinator import ChineseSolarTermsCoordinator
from .const import (
    CONF_DEVICE_TYPE,
    DEVICE_CHINESE,
    DEVICE_CROSS_QUARTER,
    DEVICE_FOUR_SEASONS,
    DOMAIN,
)
from .coordinator import SolsticeHubCoordinator
from .cross_quarter_coordinator import CrossQuarterCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up SolsticeHub from a config entry.

    Each config entry creates one device with its own coordinator.
    The device type determines which coordinator and sensors are created.

    Args:
        hass: Home Assistant instance.
        entry: The config entry being set up.

    Returns:
        True if setup was successful.
    """
    _LOGGER.debug("Setting up SolsticeHub integration: %s", entry.title)

    # Get device type (default to four_seasons for backward compatibility)
    device_type = entry.data.get(CONF_DEVICE_TYPE, DEVICE_FOUR_SEASONS)
    _LOGGER.debug("Device type: %s", device_type)

    # Create coordinator based on device type
    if device_type == DEVICE_CROSS_QUARTER:
        coordinator = CrossQuarterCoordinator(hass, entry)
    elif device_type == DEVICE_CHINESE:
        coordinator = ChineseSolarTermsCoordinator(hass, entry)
    else:
        # Default to Four Seasons (also for backward compatibility)
        coordinator = SolsticeHubCoordinator(hass, entry)

    # Fetch initial data
    await coordinator.async_config_entry_first_refresh()

    # Store coordinator in hass.data with device type info
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "device_type": device_type,
    }

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    Args:
        hass: Home Assistant instance.
        entry: The config entry being unloaded.

    Returns:
        True if unload was successful.
    """
    _LOGGER.debug("Unloading SolsticeHub integration: %s", entry.title)

    # Unload platforms
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        # Clean up coordinator event listeners
        if entry.entry_id in hass.data[DOMAIN]:
            coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
            coordinator.async_unload()
            hass.data[DOMAIN].pop(entry.entry_id)

        # Clean up domain data if empty
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)

    return unload_ok
