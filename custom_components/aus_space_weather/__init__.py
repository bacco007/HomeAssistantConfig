import asyncio
from datetime import timedelta
import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers.device_registry import DeviceInfo
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Device information for grouping entities
DEVICE_INFO = DeviceInfo(
    identifiers={(DOMAIN, "australian_space_weather")},
    name="Australian Space Weather",
    manufacturer="Bureau of Meteorology",
    model="Space Weather API",
)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the Australian Space Weather integration from a config entry."""
    api_key = entry.data["api_key"]
    location = entry.data["location"]

    # Create and initialize the data coordinator
    coordinator = SpaceWeatherDataCoordinator(hass, api_key, location)
    await coordinator.async_config_entry_first_refresh()

    # Store the coordinator in hass.data
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    # Forward setup to sensor and binary_sensor platforms
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor", "binary_sensor"])

    return True

class SpaceWeatherDataCoordinator(DataUpdateCoordinator):
    """Coordinator to manage fetching data from the Space Weather API."""

    def __init__(self, hass, api_key, location):
        """Initialize the coordinator."""
        self.api_key = api_key
        self.location = location
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=15),
        )

    async def _async_update_data(self):
        """Fetch data from all API endpoints in parallel."""
        session = async_get_clientsession(self.hass)

        # Use the user-selected location for k-index; use "Australian region" for a-index and dst-index
        # Use None for options when the endpoint does not support it
        endpoints = [
            ("get-a-index", {"location": "Australian region"}),
            ("get-k-index", {"location": self.location}),
            ("get-dst-index", {"location": "Australian region"}),
            ("get-mag-alert", None),
            ("get-mag-warning", None),
            ("get-aurora-alert", None),
            ("get-aurora-watch", None),
            ("get-aurora-outlook", None),
        ]

        async def fetch(endpoint, options, retries=2, delay=1):
            """Fetch data from a single endpoint with retries."""
            # Prepare the request body: include 'options' only if it's not None
            request_body = {"api_key": self.api_key}
            if options is not None:
                request_body["options"] = options

            for attempt in range(retries + 1):
                try:
                    response = await session.post(
                        f"https://sws-data.sws.bom.gov.au/api/v1/{endpoint}",
                        json=request_body,
                        timeout=15,
                    )
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        _LOGGER.error(
                            f"Error fetching {endpoint} with request {request_body}: {response.status} - {error_text}"
                        )
                        return None
                except Exception as e:
                    if attempt < retries:
                        _LOGGER.warning(
                            f"Attempt {attempt + 1} failed for {endpoint} with request {request_body}: {e}. Retrying in {delay} seconds..."
                        )
                        await asyncio.sleep(delay)
                    else:
                        _LOGGER.error(f"Exception fetching {endpoint} with request {request_body} after {retries + 1} attempts: {e}")
                        return None

        # Fetch all endpoints concurrently
        results = await asyncio.gather(*[fetch(endpoint, options) for endpoint, options in endpoints])

        # Process results into a dictionary
        data = {}
        for (endpoint, _), result in zip(endpoints, results):
            if result and "data" in result:
                data[endpoint] = result["data"]
            else:
                data[endpoint] = None

        return data
