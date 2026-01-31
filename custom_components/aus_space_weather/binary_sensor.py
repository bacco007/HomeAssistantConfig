from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN
from . import DEVICE_INFO

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up binary sensor entities from a config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    binary_sensors = [
        SpaceWeatherAlertBinarySensor(coordinator, "get-mag-alert", "Magnetic Alert"),
        SpaceWeatherAlertBinarySensor(coordinator, "get-mag-warning", "Magnetic Warning"),
        SpaceWeatherAlertBinarySensor(coordinator, "get-aurora-alert", "Aurora Alert"),
        SpaceWeatherAlertBinarySensor(coordinator, "get-aurora-watch", "Aurora Watch"),
        SpaceWeatherAlertBinarySensor(coordinator, "get-aurora-outlook", "Aurora Outlook"),
    ]
    async_add_entities(binary_sensors)

class SpaceWeatherAlertBinarySensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor entity for space weather alerts."""

    def __init__(self, coordinator, endpoint, name):
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._endpoint = endpoint
        self._attr_name = name
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{endpoint}"
        self._attr_device_info = DEVICE_INFO

    @property
    def is_on(self):
        """Return if the sensor is on (alert active)."""
        data = self.coordinator.data.get(self._endpoint)
        return data is not None and len(data) > 0

    @property
    def available(self):
        """Return if the sensor is available."""
        return self.coordinator.data.get(self._endpoint) is not None

    @property
    def extra_state_attributes(self):
        """Return additional state attributes."""
        data = self.coordinator.data.get(self._endpoint)
        if data and len(data) > 0:
            return data[0]  # Return the full alert details as attributes
        return {}
