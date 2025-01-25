# mediarr/manager/__init__.py
"""The Mediarr Manager integration."""

from homeassistant.const import CONF_API_KEY, CONF_URL
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from ..common.const import CONF_MAX_ITEMS, CONF_DAYS, DEFAULT_MAX_ITEMS, DEFAULT_DAYS

# Base schema for all managers
ARR_BASE_SCHEMA = {
    vol.Required(CONF_API_KEY): cv.string,
    vol.Required(CONF_URL): cv.url,
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

# Sonarr schema
SONARR_SCHEMA = ARR_BASE_SCHEMA.copy()
SONARR_SCHEMA.update({
    vol.Optional(CONF_DAYS, default=DEFAULT_DAYS): cv.positive_int,
})

# Radarr schema
RADARR_SCHEMA = ARR_BASE_SCHEMA.copy()

# Combined platform schema
PLATFORM_SCHEMA = vol.Schema({
    vol.Optional("sonarr"): vol.Schema(SONARR_SCHEMA),
    vol.Optional("radarr"): vol.Schema(RADARR_SCHEMA),
})

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Mediarr manager platform."""
    session = hass.helpers.aiohttp_client.async_get_clientsession()
    sensors = []

    if "sonarr" in config:
        from .sonarr import SonarrMediarrSensor
        sensors.append(SonarrMediarrSensor(
            session,
            config["sonarr"][CONF_API_KEY],
            config["sonarr"][CONF_URL],
            config["sonarr"].get(CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS),
            config["sonarr"].get(CONF_DAYS, DEFAULT_DAYS)
        ))

    if "radarr" in config:
        from .radarr import RadarrMediarrSensor
        sensors.append(RadarrMediarrSensor(
            session,
            config["radarr"][CONF_API_KEY],
            config["radarr"][CONF_URL],
            config["radarr"].get(CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS)
        ))

    if sensors:
        async_add_entities(sensors, True)