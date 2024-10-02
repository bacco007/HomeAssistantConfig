import logging
import aiohttp
from homeassistant.helpers.entity import Entity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

DOMAIN = "wud_getupdates"

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry, async_add_entities):
    """Set up the WUD sensor platform."""
    wud_host = config_entry.data["host"]
    wud_port = config_entry.data["port"]
    instance_name = config_entry.data["instance_name"]  # Get instance name

    # Fetch container information from WUD API
    containers = await get_containers(wud_host, wud_port)

    # Create a sensor for each container and assign it to the instance name device
    sensors = []
    for container in containers:
        sensors.append(WUDContainerSensor(container, config_entry, instance_name))
    
    async_add_entities(sensors, True)

async def get_containers(host, port):
    """Fetch containers from the WUD API."""
    url = f"http://{host}:{port}/api/containers"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
            else:
                _LOGGER.error("Failed to fetch containers from WUD")
                return []

class WUDContainerSensor(Entity):
    """Representation of a What's Up Docker container sensor."""

    def __init__(self, container, config_entry: ConfigEntry, instance_name: str):
        """Initialize the sensor."""
        self._container = container
        self._config_entry = config_entry
        self._name = f"{container['name']} Update Available"
        self._state = container.get("updateAvailable", False)
        self._unique_id = f"wud_{container['id']}_update_available"
        self._instance_name = instance_name

        # Device info for Home Assistant, now using the instance name
        self._device_info = {
            "identifiers": {(DOMAIN, config_entry.entry_id)},
            "name": instance_name,  # Use the instance name as the device name
            "manufacturer": "What's Up Docker",
            "model": "Docker Instance",
        }

    @property
    def unique_id(self):
        """Return a unique ID for this sensor."""
        return self._unique_id

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the sensor."""
        return "Yes" if self._state else "No"

    @property
    def device_info(self):
        """Return the device info to which this entity belongs."""
        return self._device_info

    @property
    def extra_state_attributes(self):
        """Return additional state attributes."""
        return {
            "container_id": self._container["id"],
            "version": self._container.get("version", "unknown"),
            "update_available": self._state,
        }

    async def async_update(self):
        """Fetch updated data from the API."""
        # Optionally re-fetch container data if needed
        pass
