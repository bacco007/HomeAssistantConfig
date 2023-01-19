from custom_components.formulaone_api.const import DEFAULT_SCAN_INTERVAL
from homeassistant.helpers.event import track_point_in_time
from homeassistant.helpers.entity import Entity
from datetime import datetime as dt

class FormulaOneSensor(Entity):
    """Representation of a Formula One sensor."""

    def __init__(self, name, scan_interval, hass):
        """Initialize Formula One sensor."""
        self.entity_id = "sensor." + name.replace(" ", "_").lower()
        self.hass = hass
        self._state = None
        self._name = name
        self._scan_interval = scan_interval
        self._icon = 'mdi:car'
        self._last_scan = dt.today()
        self._state_attributes = {}
        self.timer(dt.today())

    @property
    def should_poll(self):
        """Polling not required."""
        return False

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self):
        """Return the icon to use in the frontend."""
        return self._icon

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the extra attributes of the sensor."""
        return self._state_attributes

    def timer(self, nowtime):
        self.schedule_update_ha_state(True)
        polling_delta = self.set_polling()
        nexttime = nowtime + polling_delta
        # Setup timer to run again at polling delta
        track_point_in_time(self.hass, self.timer, nexttime)

    def set_polling(self):
        race_state = self._state
        polling_delta = DEFAULT_SCAN_INTERVAL
        return polling_delta

    def update(self):
        """Update the sensor."""
        self.set_state()