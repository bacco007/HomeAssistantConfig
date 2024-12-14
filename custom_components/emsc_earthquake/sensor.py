import logging
import json
import asyncio
import ssl
import websockets
from homeassistant.components.sensor import SensorEntity
from concurrent.futures import ThreadPoolExecutor
from homeassistant.core import HomeAssistant
from .const import DOMAIN, DEFAULT_NAME
from math import radians, cos, sin, sqrt, atan2

from .const import DOMAIN, DEFAULT_NAME
_LOGGER = logging.getLogger(__name__)

WEBSOCKET_URL = "wss://www.seismicportal.eu/standing_order/websocket"
PING_INTERVAL = 15  # Interval in seconds to send pings
DEFAULT_NAME = "Latest Earthquake"

# Thread pool executor for SSL context creation
ssl_executor = ThreadPoolExecutor(max_workers=1)

async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Set up EMSC Earthquake sensor based on a config entry."""
    config = hass.data[DOMAIN][config_entry.entry_id]

    name = config.get("name", DEFAULT_NAME)
    center_latitude = config.get("center_latitude")
    center_longitude = config.get("center_longitude")
    radius_km = config.get("radius_km")
    total_max_mag = config.get("total_max_mag")
    min_mag = config.get("min_mag")

    sensor = EMSCEarthquakeSensor(name, center_latitude, center_longitude, radius_km, min_mag, total_max_mag)
    async_add_entities([sensor], True)
    hass.loop.create_task(sensor.connect_to_websocket())

class EMSCEarthquakeSensor(SensorEntity):
    """Representation of an EMSC Earthquake sensor."""

    def __init__(self, name, center_latitude, center_longitude, radius_km, min_mag, total_max_mag):
        """Initialize the sensor."""
        self._name = name
        self._state = None
        self._attributes = {}
        self._ssl_context = None
        self.center_latitude = center_latitude
        self.center_longitude = center_longitude
        self.radius_km = radius_km
        self.total_max_mag = total_max_mag
        self.min_mag = min_mag

    @property
    def name(self):
        #Return the name of the sensor.
        return self._name

    @property
    def state(self):
        #Return the state of the sensor.
        return self._state

    @property
    def extra_state_attributes(self):
        #Return additional attributes of the sensor.
        return self._attributes

    @property
    def unique_id(self):
        """Return a unique ID for this sensor."""
        return f"emsc_earthquake_{self._name}"

    @property
    def icon(self):
        """Return the icon for the sensor."""
        return "mdi:waveform"

    async def connect_to_websocket(self):
        #Connect to the EMSC WebSocket API and process messages.
        while True:
            try:
                # Create SSL context in a separate thread
                self._ssl_context = await self.async_create_ssl_context()

                _LOGGER.info("Connecting to WebSocket: %s", WEBSOCKET_URL)
                async with websockets.connect(
                    WEBSOCKET_URL, ssl=self._ssl_context, ping_interval=PING_INTERVAL
                ) as websocket:
                    _LOGGER.info("Connected to WebSocket. Listening for messages...")
                    await self.listen_to_websocket(websocket)
            except Exception as e:
                _LOGGER.error("WebSocket error: %s", e)
                await asyncio.sleep(10)  # Retry after a delay

    async def async_create_ssl_context(self):
        #Create and return SSL context in a separate thread to avoid blocking the event loop.
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(ssl_executor, self.create_ssl_context)

    def create_ssl_context(self):
        #Create SSL context (blocking call, moved to separate thread).
        ssl_context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        return ssl_context

    async def listen_to_websocket(self, websocket):
        #Listen for messages on the WebSocket.
        try:
            async for message in websocket:
                await self.process_message(message)
        except websockets.ConnectionClosed:
            _LOGGER.warning("WebSocket connection closed.")
        except Exception as e:
            _LOGGER.error("Error while listening to WebSocket: %s", e)

    def is_within_radius(self, earthquake_latitude, earthquake_longitude):
        """Check if the given earthquake is within the specified radius."""
        # Calculate distance between central point and the earthquake location
        R = 6371.0  # Radius of Earth in kilometers

        lat1 = radians(self.center_latitude)
        lon1 = radians(self.center_longitude)
        lat2 = radians(earthquake_latitude)
        lon2 = radians(earthquake_longitude)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance = R * c
        _LOGGER.debug("Distance (km): %s", distance)

        return distance <= self.radius_km

    async def process_message(self, message):
        #Process an incoming WebSocket message.
        _LOGGER.debug("Received WebSocket message: %s", message)
        try:
            data = json.loads(message)
            action = data.get("action", "unknown")
            info = data.get("data", {}).get("properties", {})

            lat = info.get("lat")
            lon = info.get("lon")
            mag = info.get("mag")

            if (self.is_within_radius(lat, lon) and mag >= self.min_mag) or mag >= self.total_max_mag:
                # Update state and attributes if the earthquake falls within the radius
                self._state = info.get("mag")  # Set the earthquake magnitude as state
                self._attributes = {
                    "action": action,
                    "unid": info.get("unid"),
                    "time": info.get("time"),
                    "magnitude": info.get("mag"),
                    "region": info.get("flynn_region"),
                    "depth": info.get("depth"),
                    "lat": lat,
                    "lon": lon,
                    "magtype": info.get("magtype"),
                }
                _LOGGER.info("Processed earthquake data: %s", self._attributes)
                self.async_write_ha_state()
            else:
                # If the earthquake is outside the bounds, skip this event
                _LOGGER.info("Skipping event, parameters out of bounds: lat=%s, lon=%s", lat, lon)
                return
        except Exception as e:
            _LOGGER.error("Error processing WebSocket message: %s", e)

    async def async_unload_entry(hass, config_entry):
        #Unload a config entry.
        return True
