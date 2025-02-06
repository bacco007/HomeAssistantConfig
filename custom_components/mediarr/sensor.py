# mediarr/sensor.py
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .discovery.tmdb import TMDB_ENDPOINTS
from .common.const import (
    CONF_MAX_ITEMS, 
    CONF_DAYS, 
    DEFAULT_MAX_ITEMS, 
    DEFAULT_DAYS
)

async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up Mediarr sensors from YAML configuration."""
    session = async_get_clientsession(hass)
    sensors = []

    # Server Sensors
    if "plex" in config:
        from .server.plex import PlexMediarrSensor
        plex_sensors = await PlexMediarrSensor.create_sensors(hass, config["plex"])
        sensors.extend(plex_sensors)

    if "jellyfin" in config:
        from .server.jellyfin import JellyfinMediarrSensor
        jellyfin_sensors = await JellyfinMediarrSensor.create_sensors(hass, config["jellyfin"])
        sensors.extend(jellyfin_sensors)

    if "emby" in config:
        from .server.emby import EmbyMediarrSensor
        emby_sensors = await EmbyMediarrSensor.create_sensors(hass, config["emby"])
        sensors.extend(emby_sensors)

    # Manager Sensors
    if "sonarr" in config:
        from .manager.sonarr import SonarrMediarrSensor
        sensors.append(SonarrMediarrSensor(
            session,
            config["sonarr"]["api_key"],
            config["sonarr"]["url"],
            config["sonarr"].get("tmdb_api_key"),
            config["sonarr"].get("max_items", DEFAULT_MAX_ITEMS),
            config["sonarr"].get("days_to_check", DEFAULT_DAYS)
        ))

    if "radarr" in config:
        from .manager.radarr import RadarrMediarrSensor
        sensors.append(RadarrMediarrSensor(
            session,
            config["radarr"]["api_key"],
            config["radarr"]["url"],
            config["radarr"].get("tmdb_api_key"),
            config["radarr"].get("max_items", DEFAULT_MAX_ITEMS)
        ))

    # Discovery Sensors
    
    if "trakt" in config:
        from .discovery.trakt import TraktMediarrSensor
        sensors.append(TraktMediarrSensor(
            session,
            config["trakt"]["client_id"],
            config["trakt"]["client_secret"],
            config["trakt"].get("trending_type", "both"),
            config["trakt"].get("max_items", DEFAULT_MAX_ITEMS),
            config["trakt"]["tmdb_api_key"]
        ))

    if "tmdb" in config:
        from .discovery.tmdb import TMDBMediarrSensor
        tmdb_config = config["tmdb"]
        tmdb_api_key = tmdb_config.get("tmdb_api_key")  # Updated to use tmdb_api_key instead of api_key
        
        for endpoint in TMDB_ENDPOINTS.keys():
            if tmdb_config.get(endpoint, False):  # Only create sensors for enabled endpoints
                sensors.append(TMDBMediarrSensor(
                    session,
                    tmdb_api_key,
                    tmdb_config.get("max_items", DEFAULT_MAX_ITEMS),
                    endpoint
                ))
    if "seer" in config:
        from .discovery.seer import SeerMediarrSensor
        sensors.append(SeerMediarrSensor(
            session,
            config["seer"]["api_key"],
            config["seer"]["url"],
            config["seer"].get("tmdb_api_key"),
            config["seer"].get("max_items", DEFAULT_MAX_ITEMS)
        ))

    if sensors:
        async_add_entities(sensors, True)