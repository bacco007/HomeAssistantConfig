"""Micro Weather Station integration for Home Assistant.

This integration creates a smart weather station by analyzing existing sensor data
to determine accurate weather conditions for specific locations and microclimates.

The integration provides:
- Weather entity with current conditions and intelligent forecasts
- Support for multiple sensor types (temperature, humidity, pressure, wind, etc.)
- Advanced weather detection algorithms using real sensor data
- Multi-language support

Author: caplaz
License: MIT
"""

from datetime import timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.WEATHER
]  # Removed sensor platform to avoid duplication


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Micro Weather Station from a config entry.

    This function initializes the integration by:
    1. Creating a data coordinator for managing sensor updates
    2. Setting up the weather platform
    3. Registering update listeners for configuration changes

    Args:
        hass: Home Assistant instance
        entry: Configuration entry containing user settings

    Returns:
        bool: True if setup was successful, False otherwise

    Raises:
        ConfigEntryNotReady: If required sensors are not available
    """
    _LOGGER.info("Setting up Micro Weather Station integration")

    # Create coordinator for managing updates
    coordinator = MicroWeatherCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    # Store coordinator in hass data
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Set up options update listener for immediate refresh
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update options and force immediate refresh.

    Called when user modifies integration configuration. Forces an immediate
    data refresh to apply new sensor mappings and settings.

    Args:
        hass: Home Assistant instance
        entry: Updated configuration entry
    """
    _LOGGER.info("Micro Weather Station config updated, refreshing data immediately")

    # Get the coordinator and force an immediate refresh
    coordinator = hass.data[DOMAIN][entry.entry_id]
    await coordinator.async_request_refresh()


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    Cleanly removes the integration by unloading all platforms and
    removing stored data from Home Assistant.

    Args:
        hass: Home Assistant instance
        entry: Configuration entry to unload

    Returns:
        bool: True if unload was successful
    """
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


class MicroWeatherCoordinator(DataUpdateCoordinator):
    """Class to manage fetching micro weather data.

    This coordinator handles periodic updates of weather data by:
    1. Reading configured sensor entities
    2. Processing sensor data through weather detection algorithms
    3. Providing consolidated weather information to the weather platform

    The coordinator respects user-configured update intervals and handles
    errors gracefully to maintain integration stability.
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the weather data coordinator.

        Args:
            hass: Home Assistant instance
            entry: Configuration entry with sensor mappings and settings
        """
        self.entry = entry
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=5),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Update weather data from real sensors.

        Fetches current data from all configured sensors and processes it
        through the weather detection algorithms to determine current conditions.

        Returns:
            dict: Weather data including current conditions, temperature, humidity,
                  pressure, wind data, and forecast information

        Raises:
            UpdateFailed: If critical sensors are unavailable or data is invalid
        """
        from .weather_detector import WeatherDetector

        try:
            detector = WeatherDetector(self.hass, self.entry.options)
            # Store analyzers on coordinator for weather entity access
            self.atmospheric_analyzer = detector.atmospheric_analyzer
            self.solar_analyzer = detector.solar_analyzer
            self.trends_analyzer = detector.trends_analyzer
            self.core_analyzer = detector.core_analyzer
            return detector.get_weather_data()
        except Exception as err:
            _LOGGER.error("Error updating weather data: %s", err)
            raise UpdateFailed(f"Failed to update weather data: {err}") from err
