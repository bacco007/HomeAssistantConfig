"""The Satellite Tracker integration."""
import asyncio
from datetime import timedelta
import logging

from n2yoasync import N2YO, N2YOSatelliteCategory
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady, PlatformNotReady
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers import aiohttp_client
from homeassistant.const import (
    CONF_API_KEY, 
    CONF_LATITUDE, 
    CONF_LONGITUDE,
    CONF_SCAN_INTERVAL,
    CONF_ELEVATION,
    CONF_TYPE,
    CONF_RADIUS,
    CONF_NAME,
)

from .const import (
    COORDINATOR, 
    DOMAIN, 
    SATELLITE_API, 
    DEFAULT_POLLING_INTERVAL, 
    TRACKER_TYPE,
    DEFAULT_MIN_VISIBILITY,
    CONF_MIN_VISIBILITY,
    CONF_SATELLITE,
)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)
_LOGGER = logging.getLogger(__name__)

LOCATION_PLATFORMS = ["sensor"]
SATELLITE_PLATFORMS = ["sensor", "device_tracker", "binary_sensor"]

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the satellite tracker component."""
    hass.data.setdefault(DOMAIN, {})

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up satellite tracker from a config entry."""
    conf = entry.data
    options = entry.options

    apikey = conf[CONF_API_KEY]
    latitude = conf[CONF_LATITUDE]
    longitude = conf[CONF_LONGITUDE]
    altitude = conf[CONF_ELEVATION]
    tracker_type = conf[CONF_TYPE]
    name = conf[CONF_NAME]

    polling_interval = options.get(CONF_SCAN_INTERVAL,DEFAULT_POLLING_INTERVAL)

    session = aiohttp_client.async_get_clientsession(hass)

    api = N2YO(
        apikey=apikey,
        latitude=latitude,
        longitude=longitude,
        altitude=altitude,
        session=session
    )

    try:
        if tracker_type == "location":
            radius = options.get(CONF_RADIUS,90)
            category = conf.get("category",N2YOSatelliteCategory.All)

            await api.get_above(search_radius=radius, category_id=category)

            coordinator = N2YOLocationCoordinator(
                hass,
                api=api,
                name=name,
                polling_interval=polling_interval,
                tracker_type=tracker_type,
                radius=radius,
                category=category,
            )
        else:
            satellite = conf[CONF_SATELLITE]
            min_visibility = options.get(CONF_MIN_VISIBILITY,DEFAULT_MIN_VISIBILITY)
            await api.get_TLE(id=satellite)

            coordinator = N2YOSatelliteCoordinator(
                hass,
                api=api,
                name=name,
                polling_interval=polling_interval,
                tracker_type=tracker_type,
                satellite=satellite,
                min_visibility=min_visibility,
            )
    except ConnectionError as error:
        _LOGGER.debug("N2YO API Error: %s", error)
        raise UpdateFailed from error
    except ValueError as error:
        _LOGGER.debug("N2YO API Error: %s", error)
        raise ConfigEntryNotReady from error

    await coordinator.async_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data[DOMAIN][entry.entry_id] = {
        COORDINATOR: coordinator, 
        SATELLITE_API: api,
        CONF_TYPE: tracker_type
    }

    if tracker_type == "location":
        platforms = LOCATION_PLATFORMS
    else:
        platforms = SATELLITE_PLATFORMS

    for component in platforms:
        _LOGGER.info("Setting up platform: %s", component)
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, component)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    if entry.data[CONF_TYPE] == "location":
        platforms = LOCATION_PLATFORMS
    else:
        platforms = SATELLITE_PLATFORMS

    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, component)
                for component in platforms
            ]
        )
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok

class N2YOUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching update data from the N2YO endpoint."""

    def __init__(
        self,
        hass: HomeAssistant,
        api: str,
        name: str,
        polling_interval: int,
        tracker_type:str,
    ):
        """Initialize the global satellite tracker data updater."""
        self.api = api
        self._type = tracker_type
        self._name = name

        super().__init__(
            hass = hass,
            logger = _LOGGER,
            name = name,
            update_interval = timedelta(seconds=polling_interval),
        )


class N2YOLocationCoordinator(N2YOUpdateCoordinator):
    """Class to manage Location or Category type tracker updates."""

    def __init__(
        self,
        hass: HomeAssistant,
        api:str,
        name:str,
        polling_interval:int,
        tracker_type:str,
        radius:int,
        category:int,
    ):
        """Initialize the location type sensors."""

        self.radius = radius
        self.category = category

        super().__init__(
            hass=hass,
            api=api,
            name=name,
            polling_interval=polling_interval,
            tracker_type=tracker_type,
        )

    async def _async_update_data(self):
        """Fetch data from N2YO for location type data."""
        try:
            _LOGGER.debug("Updating the coordinator data.")
            update_data = await self.api.get_above(
                search_radius=self.radius,
                category_id=self.category,
            )
            
            return update_data
        except ConnectionError as error:
            _LOGGER.info("N2YO API: %s", error)
            raise PlatformNotReady from error
        except ValueError as error:
            _LOGGER.info("N2YO API: %s", error)
            raise UpdateFailed from error

class N2YOSatelliteCoordinator(N2YOUpdateCoordinator):
    """Class to manage Satellite type tracker updates."""

    def __init__(
        self,
        hass: HomeAssistant,
        api:str,
        name:str,
        polling_interval:int,
        tracker_type:str,
        satellite:int,
        min_visibility:int,
    ):
        """Initialize the satellite type data."""

        self._satellite=satellite
        self._min_visibility=min_visibility

        super().__init__(
            hass=hass,
            api=api,
            name=name,
            polling_interval=polling_interval,
            tracker_type=tracker_type,
        )

    async def _async_update_data(self):
        """Fetch data from N2YO for location type sensors."""
        try:
            _LOGGER.debug("Updating the coordinator data.")
            positions_data = await self.api.get_positions(
                id=self._satellite,
                seconds=1,
            )
            visual_passes_data = await self.api.get_visualpasses(
                id=self._satellite,
                days=10,
                min_visibility=self._min_visibility,
            )

            visual_passes = []

            for this_pass in visual_passes_data:
                if this_pass["duration"] > self._min_visibility:
                    visual_passes.append(this_pass)

            return {
                "positions":positions_data,
                "visual_passes":visual_passes,
            }

        except ConnectionError as error:
            _LOGGER.info("N2YO API: %s", error)
            raise PlatformNotReady from error
        except ValueError as error:
            _LOGGER.info("N2YO API: %s", error)
            raise UpdateFailed from error

        

