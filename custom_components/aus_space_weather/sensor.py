import logging
from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN
from . import DEVICE_INFO

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up sensor entities from a config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    sensors = [
        SpaceWeatherIndexSensor(coordinator, "get-a-index", "A Index"),
        SpaceWeatherIndexSensor(coordinator, "get-k-index", f"K Index ({coordinator.location})"),
        SpaceWeatherIndexSensor(coordinator, "get-dst-index", "Dst Index"),
    ]
    async_add_entities(sensors)

class SpaceWeatherIndexSensor(CoordinatorEntity, SensorEntity):
    """Sensor entity for space weather indices."""

    def __init__(self, coordinator, endpoint, name):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._endpoint = endpoint
        self._attr_name = name
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{endpoint}"
        self._attr_device_info = DEVICE_INFO
        # Set state_class to enable trending/graphing
        self._attr_state_class = SensorStateClass.MEASUREMENT
        # Set unit_of_measurement (optional, since A Index is unitless)
        self._attr_unit_of_measurement = ""  # Unitless index

    @property
    def state(self):
        """Return the sensor state."""
        data = self.coordinator.data.get(self._endpoint)
        _LOGGER.debug(f"Raw data for {self._endpoint}: {data}")
        if not data or not isinstance(data, list) or len(data) == 0:
            _LOGGER.error(f"No valid data for {self._endpoint}: {data}")
            return None
        first_item = data[0]
        # Handle nested list structure (e.g., [[{"index": "15", ...}]])
        if isinstance(first_item, list) and len(first_item) > 0:
            first_item = first_item[0]
            _LOGGER.debug(f"Adjusted first_item for {self._endpoint} (nested list): {first_item}")
        if not isinstance(first_item, dict):
            _LOGGER.error(f"Unexpected data structure for {self._endpoint}: {first_item}")
            return None
        # Check for 'index' key, fall back to 'value' if API structure has changed
        index = first_item.get("index", first_item.get("value"))
        if index is None:
            _LOGGER.error(f"No 'index' or 'value' key in data for {self._endpoint}: {first_item}")
            return None
        # Convert index to int if possible (since API returns it as a string)
        try:
            return int(index)
        except (ValueError, TypeError):
            _LOGGER.warning(f"Index value for {self._endpoint} is not an integer: {index}")
            return index

    @property
    def available(self):
        """Return if the sensor is available."""
        data = self.coordinator.data.get(self._endpoint)
        if not data or not isinstance(data, list) or len(data) == 0:
            return False
        first_item = data[0]
        # Handle nested list structure
        if isinstance(first_item, list) and len(first_item) > 0:
            first_item = first_item[0]
        if not isinstance(first_item, dict):
            return False
        return "index" in first_item or "value" in first_item

    @property
    def extra_state_attributes(self):
        """Return additional state attributes."""
        data = self.coordinator.data.get(self._endpoint)
        if not data or not isinstance(data, list) or len(data) == 0:
            return {}
        first_item = data[0]
        # Handle nested list structure
        if isinstance(first_item, list) and len(first_item) > 0:
            first_item = first_item[0]
        if not isinstance(first_item, dict):
            return {}
        return {"valid_time": first_item.get("valid_time")}
