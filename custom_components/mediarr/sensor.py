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
            config["sonarr"].get("max_items", DEFAULT_MAX_ITEMS),
            config["sonarr"].get("days_to_check", DEFAULT_DAYS)
        ))
    if "sonarr2" in config:
        from .manager.sonarr2 import Sonarr2MediarrSensor
        sensors.append(Sonarr2MediarrSensor(
            session,
            config["sonarr2"]["api_key"],
            config["sonarr2"]["url"],
            config["sonarr2"].get("max_items", DEFAULT_MAX_ITEMS),
            config["sonarr2"].get("days_to_check", DEFAULT_DAYS)
        ))
    if "radarr" in config:
        from .manager.radarr import RadarrMediarrSensor
        sensors.append(RadarrMediarrSensor(
            session,
            config["radarr"]["api_key"],
            config["radarr"]["url"],
            config["radarr"].get("max_items", DEFAULT_MAX_ITEMS),
            config["radarr"].get("days_to_check", DEFAULT_DAYS)
        ))
    if "radarr2" in config:
        from .manager.radarr2 import Radarr2MediarrSensor
        sensors.append(Radarr2MediarrSensor(
            session,
            config["radarr2"]["api_key"],
            config["radarr2"]["url"],
            config["radarr2"].get("max_items", DEFAULT_MAX_ITEMS),
            config["radarr2"].get("days_to_check", DEFAULT_DAYS)
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
        tmdb_api_key = tmdb_config.get("tmdb_api_key")
        
        for endpoint in TMDB_ENDPOINTS.keys():
            if tmdb_config.get(endpoint, False):
                sensors.append(TMDBMediarrSensor(
                    session,
                    tmdb_api_key,
                    tmdb_config.get("max_items", DEFAULT_MAX_ITEMS),
                    endpoint
                ))

    if "seer" in config:
        from .services.seer import SeerMediarrSensor
        from .discovery.seer_discovery import SeerDiscoveryMediarrSensor
        seer_config = config["seer"]
        
        # Create the original requests sensor
        sensors.append(SeerMediarrSensor(
            session,
            seer_config["api_key"],
            seer_config["url"],
            seer_config.get("tmdb_api_key"),
            seer_config.get("max_items", DEFAULT_MAX_ITEMS)
        ))
        
        # Create additional discovery sensors if enabled
        if seer_config.get("trending", False):
            sensors.append(SeerDiscoveryMediarrSensor(
                session,
                seer_config["api_key"],
                seer_config["url"],
                seer_config.get("tmdb_api_key"),
                seer_config.get("max_items", DEFAULT_MAX_ITEMS),
                "trending"
            ))
        
        if seer_config.get("popular_movies", False):
            sensors.append(SeerDiscoveryMediarrSensor(
                session,
                seer_config["api_key"],
                seer_config["url"],
                seer_config.get("tmdb_api_key"),
                seer_config.get("max_items", DEFAULT_MAX_ITEMS),
                "popular_movies",
                "movies"
            ))
        
        if seer_config.get("popular_tv", False):
            sensors.append(SeerDiscoveryMediarrSensor(
                session,
                seer_config["api_key"],
                seer_config["url"],
                seer_config.get("tmdb_api_key"),
                seer_config.get("max_items", DEFAULT_MAX_ITEMS),
                "popular_tv",
                "tv"
            ))
        
        if seer_config.get("discover", False):
            sensors.append(SeerDiscoveryMediarrSensor(
                session,
                seer_config["api_key"],
                seer_config["url"],
                seer_config.get("tmdb_api_key"),
                seer_config.get("max_items", DEFAULT_MAX_ITEMS),
                "discover"
            ))

    if sensors:
        if "mediarr_sensors" not in hass.data:
            hass.data["mediarr_sensors"] = []
        hass.data["mediarr_sensors"].extend(sensors)
        async_add_entities(sensors, True)

async def async_unload_platform(hass, config):
    """Unload the platform."""
    if "seer" in config and "mediarr_sensors" in hass.data:
        sensors = hass.data["mediarr_sensors"]
        seer_sensors = [s for s in sensors if hasattr(s, "get_request_info")]
        for sensor in seer_sensors:
            await sensor.async_will_remove_from_hass()
        hass.data["mediarr_sensors"] = [s for s in sensors if s not in seer_sensors]
