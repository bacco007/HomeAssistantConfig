import logging
import aiohttp
import async_timeout
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.entity import Entity
from homeassistant.exceptions import PlatformNotReady
from datetime import timedelta
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Constants
URL = "https://api.cloudflare.com/client/v4/accounts/{}/cfd_tunnel?is_deleted=false"
TIMEOUT = 10

def create_headers(api_key):
    """Create headers for API requests."""
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the Cloudflare tunnel sensor."""
    api_key = config_entry.data["api_key"]
    account_id = config_entry.data["account_id"]

    _LOGGER.debug(f"Config data: {config_entry.data}")

    async def async_update_data():
        """Fetch data from API endpoint."""
        try:
            return await fetch_tunnels(api_key, account_id, hass)
        except Exception as err:
            raise UpdateFailed(f"Update failed: {err}")

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name="sensor",
        update_method=async_update_data,
        update_interval=timedelta(minutes=1),
    )

    await coordinator.async_config_entry_first_refresh()

    tunnels = coordinator.data

    _LOGGER.debug(f"Tunnels data: {tunnels}")

    if not tunnels:
        raise PlatformNotReady

    async_add_entities([CloudflareTunnelSensor(tunnel, coordinator) for tunnel in tunnels])

async def fetch_tunnels(api_key, account_id, hass):
    """Retrieve Cloudflare tunnel status using aiohttp."""
    headers = create_headers(api_key)
    url = URL.format(account_id)

    async with aiohttp.ClientSession() as session:
        try:
            with async_timeout.timeout(TIMEOUT):
                async with session.get(url, headers=headers) as response:
                    _LOGGER.debug(f"Response status: {response.status}")
                    if response.status == 200:
                        json_response = await response.json()
                        return json_response['result']
                    else:
                        _LOGGER.error(f"Error fetching Cloudflare tunnels: {response.status}")
                        return None
        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error fetching data: {err}")

class CloudflareTunnelSensor(Entity):
    """Representation of a Cloudflare tunnel sensor."""

    def __init__(self, tunnel, coordinator):
        """Initialize the Cloudflare tunnel sensor."""
        self.coordinator = coordinator
        self._tunnel = tunnel

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"Cloudflare Tunnel {self._tunnel['name']} Status"

    @property
    def unique_id(self):
        """Return a unique ID."""
        return self._tunnel['id']

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._tunnel['status']

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return 'mdi:cloud-check' if self._tunnel['status'] == 'healthy' else 'mdi:cloud-off-outline'

    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._tunnel['id'])},
            "name": self._tunnel['name'],
            "manufacturer": "Cloudflare",
        }

    async def async_update(self):
        """Update the state of the sensor."""
        await self.coordinator.async_request_refresh()
        self._tunnel = next((tunnel for tunnel in self.coordinator.data if tunnel['id'] == self._tunnel['id']), self._tunnel)
        _LOGGER.debug("Tunnel updated data: %s", self._tunnel)
