# mediarr/discovery/__init__.py
"""The Mediarr Discovery integration."""

from homeassistant.const import CONF_CLIENT_ID, CONF_CLIENT_SECRET
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from ..common.const import CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS

# Trakt schema
TRAKT_SCHEMA = {
    vol.Required(CONF_CLIENT_ID): cv.string,
    vol.Required(CONF_CLIENT_SECRET): cv.string,
    vol.Required('tmdb_api_key'): cv.string,
    vol.Optional('trending_type', default="both"): vol.In(["movies", "shows", "both"]),
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

# TMDB schema
TMDB_SCHEMA = {
    vol.Required('api_key'): cv.string,
    vol.Optional('trending_type', default='all'): vol.In(['movie', 'tv', 'all']),
    vol.Optional(CONF_MAX_ITEMS, default=DEFAULT_MAX_ITEMS): cv.positive_int,
}

# Combined platform schema
PLATFORM_SCHEMA = vol.Schema({
    vol.Optional("trakt"): vol.Schema(TRAKT_SCHEMA),
    vol.Optional("tmdb"): vol.Schema(TMDB_SCHEMA),
})

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Mediarr discovery platform."""
    session = hass.helpers.aiohttp_client.async_get_clientsession()
    sensors = []

    if "trakt" in config:
        from .trakt import TraktMediarrSensor
        sensors.append(TraktMediarrSensor(
            session,
            config["trakt"][CONF_CLIENT_ID],
            config["trakt"][CONF_CLIENT_SECRET],
            config["trakt"].get('trending_type', "both"),
            config["trakt"].get(CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS),
            config["trakt"]['tmdb_api_key']
        ))

    if "tmdb" in config:
        from .tmdb import TMDBMediarrSensor
        sensors.append(TMDBMediarrSensor(
            session,
            config["tmdb"]['api_key'],
            config["tmdb"].get(CONF_MAX_ITEMS, DEFAULT_MAX_ITEMS)
        ))

    if sensors:
        async_add_entities(sensors, True)