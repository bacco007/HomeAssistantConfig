# mediarr/server/__init__.py
"""The Mediarr Server integration."""

from homeassistant.const import (
    CONF_URL,
    CONF_HOST,
    CONF_PORT,
    CONF_TOKEN,
)
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS

# Base schema for all media servers
MEDIA_SERVER_BASE_SCHEMA = {
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Mediarr server platform."""
    session = hass.helpers.aiohttp_client.async_get_clientsession()
    sensors = []

    # Import and set up configured server types
    if "plex" in config:
        from .plex import PlexMediarrSensor
        sensors.extend(await PlexMediarrSensor.create_sensors(hass, config["plex"]))
        
    # Add Jellyfin setup when implemented
    if "jellyfin" in config:
        from .jellyfin import JellyfinMediarrSensor
        sensors.extend(await JellyfinMediarrSensor.create_sensors(hass, config["jellyfin"]))
        
    # Add Emby setup when implemented
    if "emby" in config:
        from .emby import EmbyMediarrSensor
        sensors.extend(await EmbyMediarrSensor.create_sensors(hass, config["emby"]))

    if sensors:
        async_add_entities(sensors, True)