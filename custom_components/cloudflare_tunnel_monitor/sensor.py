import logging
import aiohttp
import asyncio
import async_timeout
from homeassistant.components.sensor import SensorEntity, SensorDeviceClass
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.entity import Entity
from homeassistant.exceptions import PlatformNotReady
from datetime import timedelta
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Constants
URL = "https://api.cloudflare.com/client/v4/accounts/{}/cfd_tunnel?is_deleted=false"
TIMEOUT = 10
RETRY_DELAY = 20
MAX_RETRIES = 5
session = aiohttp.ClientSession()

def create_headers(api_key):
    """Create headers for API requests."""
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

async def fetch_tunnels(api_key, account_id, hass, entry_id, retries=0):
    """Retrieve Cloudflare tunnel status using aiohttp."""
    headers = create_headers(api_key)
    url = URL.format(account_id)
    
    _LOGGER.debug(f"Attempt {retries + 1} to fetch tunnels from URL: {url}")
    async with aiohttp.ClientSession() as session:
        try:
            with async_timeout.timeout(TIMEOUT):
                async with session.get(url, headers=headers) as response:
                    _LOGGER.debug(f"Response status: {response.status}")
                    if response.status == 200:
                        json_response = await response.json()
                        _LOGGER.debug(f"Received data: {json_response}")
                        return json_response['result']
                    else:
                        _LOGGER.error(f"Error fetching Cloudflare tunnels: {response.status}, {response.reason}")
                        if response.status == 504:
                            raise UpdateFailed("Gateway timeout error")
                        else:
                            raise UpdateFailed("Error fetching Cloudflare tunnels")
        except Exception as err:
            _LOGGER.error(f"Error fetching data: {err}")
            if retries < MAX_RETRIES:
                _LOGGER.info(f"Retrying in {RETRY_DELAY} seconds...")
                await asyncio.sleep(RETRY_DELAY)
                return await fetch_tunnels(api_key, account_id, hass, retries + 1)
            else:
                _LOGGER.error("Maximum number of retries reached, scheduling integration reload")
                await schedule_integration_reload(hass, entry_id)
            raise UpdateFailed("Maximum retries reached, integration reload scheduled")

class CloudflareTunnelsDevice(Entity):
    """Representation of the Cloudflare Tunnels device."""

    def __init__(self, account_id, domain):
        """Initialize the Cloudflare Tunnels device."""
        self._account_id = account_id
        self._domain = domain

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"{self._domain}_cloudflare_tunnels_{self._account_id}"

    @property
    def name(self):
        """Return the name of the device."""
        return "Cloudflare Tunnels"

    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(self._domain, self.unique_id)},
            "name": self.name,
            "manufacturer": "Cloudflare",
        }

class CloudflareTunnelSensor(SensorEntity):
    """Representation of a Cloudflare tunnel sensor."""

    def __init__(self, tunnel, coordinator, device):
        """Initialize the Cloudflare tunnel sensor."""
        self.coordinator = coordinator
        self._tunnel = tunnel
        self._device = device

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"Cloudflare Tunnel {self._tunnel['name']}"

    @property
    def unique_id(self):
        """Return a unique ID."""
        return f"{self._device._domain}_{self._tunnel['id']}"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._tunnel['status']

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return 'mdi:cloud-check' if self._tunnel['status'] == 'healthy' else 'mdi:cloud-off-outline'

    @property
    def options(self):
        """Return the possible values of the sensor."""
        return ["inactive", "degraded", "healthy", "down"]

    @property
    def device_class(self):
        """Return the device class of the sensor."""
        return SensorDeviceClass.ENUM

    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(self._device._domain, self._device.unique_id)},
            "name": self._device.name,
            "manufacturer": "Cloudflare",
        }

    async def async_update(self):
        """Update the state of the sensor."""
        _LOGGER.debug(f"Requesting refresh for tunnel {self._tunnel['id']}")
        await self.coordinator.async_request_refresh()
        if self.coordinator.data is not None:
            _LOGGER.debug(f"Coordinator data is not None. Searching for updated tunnel data for {self._tunnel['id']}")

            updated_tunnel = next((tunnel for tunnel in self.coordinator.data if tunnel.get('id') == self._tunnel.get('id')), None)
            if updated_tunnel is not None:
                _LOGGER.debug(f"Found updated data for tunnel {self._tunnel['id']}")
                self._tunnel = updated_tunnel
                _LOGGER.debug("Tunnel updated data: %s", self._tunnel)
            else:
                _LOGGER.error("Tunnel with ID %s not found in the updated data", self._tunnel.get('id'))
        else:
            _LOGGER.error("No data received in coordinator during update, maintaining previous state")

class CloudflareTunnelManager:
    """Manages Cloudflare Tunnel Sensor entities."""

    def __init__(self, hass, async_add_entities, coordinator, device):
        self._hass = hass
        self._async_add_entities = async_add_entities
        self._coordinator = coordinator
        self._device = device
        self._sensors = {}

    async def update_sensors(self, new_tunnels, removed_tunnels):
        """Update sensor entities based on the tunnel changes."""
        _LOGGER.debug(f"Updating sensors. New: {new_tunnels}, Removed: {removed_tunnels}")

        for tunnel in new_tunnels:
            sensor_id = f"{self._device._domain}_{tunnel['id']}"
            if sensor_id not in self._sensors:
                _LOGGER.info(f"Adding new sensor for tunnel: {tunnel['id']}")
                sensor = CloudflareTunnelSensor(tunnel, self._coordinator, self._device)
                self._sensors[sensor_id] = sensor
                self._async_add_entities([sensor], True)

        for tunnel in removed_tunnels:
            sensor_id = f"{self._device._domain}_{tunnel['id']}"
            if sensor_id in self._sensors:
                _LOGGER.info(f"Removing sensor for tunnel: {sensor_id}")
                try:
                    sensor = self._sensors.pop(sensor_id)
                    await self._hass.async_create_task(sensor.async_remove())
                except Exception as e:
                    _LOGGER.error(f"Error removing sensor for tunnel {sensor_id}: {e}")

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the Cloudflare tunnel sensor."""
    api_key = config_entry.data["api_key"]
    account_id = config_entry.data["account_id"]
    device = CloudflareTunnelsDevice(account_id, DOMAIN)
    global session

    async def async_update_data():
        """Fetch data from API endpoint and detect changes in tunnels."""
        _LOGGER.debug("Fetching new tunnel data from Cloudflare")
        new_data = await fetch_tunnels(api_key, account_id, hass, config_entry.entry_id)
        if new_data is None:
            new_data = []

        if coordinator.data is None:
            coordinator.data = []

        current_ids = {tunnel['id'] for tunnel in coordinator.data}
        new_ids = {tunnel['id'] for tunnel in new_data}

        added_tunnels = [tunnel for tunnel in new_data if tunnel['id'] not in current_ids]

        removed_tunnels = [tunnel for tunnel in coordinator.data if tunnel['id'] not in new_ids]
        
        _LOGGER.debug(f"Added tunnels: {added_tunnels}, Removed tunnels: {removed_tunnels}")

        if added_tunnels or removed_tunnels:
            await tunnel_manager.update_sensors(added_tunnels, removed_tunnels)

        return new_data

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name="cloudflare_tunnel",
        update_method=async_update_data,
        update_interval=timedelta(minutes=1),
    )

    tunnel_manager = CloudflareTunnelManager(hass, async_add_entities, coordinator, device)

    await coordinator.async_config_entry_first_refresh()
    
    if not hasattr(tunnel_manager, 'initialized') or not tunnel_manager.initialized:
        _LOGGER.debug("Creating initial sensor entities")
        for tunnel in coordinator.data:
            sensor_id = f"{device._domain}_{tunnel['id']}"
            if sensor_id not in tunnel_manager._sensors:
                sensor = CloudflareTunnelSensor(tunnel, coordinator, device)
                tunnel_manager._sensors[sensor_id] = sensor
                async_add_entities([sensor], True)
        tunnel_manager.initialized = True

    hass.bus.async_listen_once("homeassistant_stop", async_shutdown)

async def async_shutdown(event):
    """Close aiohttp global session."""
    if session:
        await session.close()
    _LOGGER.debug("Cloudflare Tunnel Monitor - aiohttp session closed")

async def schedule_integration_reload(hass, entry_id):
    """Schedule a reload of the integration."""
    _LOGGER.info(f"Scheduling reload of integration with entry_id {entry_id}")
    await hass.config_entries.async_reload(entry_id)