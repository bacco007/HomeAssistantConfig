"""Support to interface with the Jellyfin API."""
import logging

from homeassistant.helpers.entity import Entity
from homeassistant.const import (
    CONF_URL,
    DEVICE_DEFAULT_NAME,
    STATE_ON,
    STATE_OFF,
)
from homeassistant.core import HomeAssistant
import homeassistant.util.dt as dt_util

from . import JellyfinClientManager, autolog

from .const import (
    DOMAIN,
)
PLATFORM = "sensor"

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):

    _jelly: JellyfinClientManager = hass.data[DOMAIN][config_entry.data.get(CONF_URL)]["manager"]
    async_add_entities([JellyfinSensor(_jelly)], True)
    

class JellyfinSensor(Entity):
    """Representation of an Jellyfin device."""

    def __init__(self, jelly_cm: JellyfinClientManager):
        """Initialize the Jellyfin device."""
        _LOGGER.debug("New Jellyfin Sensor initialized")
        self.jelly_cm = jelly_cm
        self._available = True

    async def async_added_to_hass(self):
        autolog("<<<")
        self.hass.data[DOMAIN][self.jelly_cm.host][PLATFORM]["entities"].append(self)

    async def async_will_remove_from_hass(self):
        autolog("<<<")
        self.hass.data[DOMAIN][self.jelly_cm.host][PLATFORM]["entities"].remove(self)

    @property
    def available(self):
        """Return True if entity is available."""
        return self.jelly_cm.is_available

    @property
    def unique_id(self):
        """Return the id of this jellyfin server."""
        return self.jelly_cm.info["Id"]

    @property
    def device_info(self):
        """Return device information about this entity."""
        return {
            "identifiers": {
                # Unique identifiers within a specific domain
                (DOMAIN, self.jelly_cm.server_url)
            },
            "manufacturer": "Jellyfin",
            "model": f"Jellyfin {self.jelly_cm.info['Version']}".rstrip(),
            "name": self.jelly_cm.info['ServerName'],
            "configuration_url": self.jelly_cm.server_url,
        }

    @property
    def name(self):
        """Return the name of the device."""
        return f"Jellyfin {self.jelly_cm.info['ServerName']}" or DEVICE_DEFAULT_NAME

    @property
    def should_poll(self):
        """Return True if entity has to be polled for state."""
        return False

    @property
    def state(self):
        """Return the state of the device."""
        return STATE_ON if self.jelly_cm.is_available else STATE_OFF

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        extra_attr = {
            "os": self.jelly_cm.info["OperatingSystem"],
            "update_available": self.jelly_cm.info["HasUpdateAvailable"],
            "version": self.jelly_cm.info["Version"],
        }
        if self.jelly_cm.data:
            extra_attr["data"] = self.jelly_cm.data
        if self.jelly_cm.yamc:
            extra_attr["yamc"] = self.jelly_cm.yamc
        
        return extra_attr

    async def async_update(self):
        """Synchronise state from the server."""
        autolog("<<<")
        await self.jelly_cm.update_data()

    async def async_trigger_scan(self):
        _LOGGER.info("Library scan triggered")
        await self.jelly_cm.trigger_scan()

    async def async_delete_item(self, id):
        _LOGGER.debug("async_delete_item triggered")
        await self.jelly_cm.delete_item(id)
        self.async_schedule_update_ha_state()

    async def async_search_item(self, search_term):
        _LOGGER.debug(f"async_search_item triggered: {search_term}")
        await self.jelly_cm.search_item(search_term)
        self.async_schedule_update_ha_state()

    async def async_yamc_setpage(self, page):
        _LOGGER.debug("YAMC setpage: %d", page)

        await self.jelly_cm.yamc_set_page(page)
        self.async_schedule_update_ha_state()

    async def async_yamc_setplaylist(self, playlist):
        _LOGGER.debug("YAMC setplaylist: %s", playlist)

        await self.jelly_cm.yamc_set_playlist(playlist)
        self.async_schedule_update_ha_state()

