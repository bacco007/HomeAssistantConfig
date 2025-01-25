# mediarr/common/sensor.py
from homeassistant.components.sensor import SensorEntity

class MediarrSensor(SensorEntity):
    """Base class for Mediarr sensors."""
    
    def __init__(self):
        """Initialize the sensor."""
        self._state = None
        self._attributes = {}
        self._available = True

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def available(self):
        """Return True if entity is available."""
        return self._available

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        return self._attributes