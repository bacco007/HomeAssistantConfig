"""Support for Solcast PV forecast."""
import logging

from homeassistant.const import ENERGY_KILO_WATT_HOUR
from homeassistant.helpers.restore_state import RestoreEntity

from . import DOMAIN, SensorType

_LOGGER = logging.getLogger(__name__)

ENERGY_KILO_WATT = "kW"


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the Solcast sensors."""
    if discovery_info is None:
        return

    sensors = []
    rooftopsite = hass.data[DOMAIN]
    sensors.append(SolcastSensor("forecast", rooftopsite, SensorType.forecast))
    sensors.append(SolcastSensor("history", rooftopsite, SensorType.history))
    sensors.append(SolcastSensor("remaining API count", rooftopsite, SensorType.api_count))

    async_add_entities(sensors)


class SolcastSensor(RestoreEntity):
    """The entity class for Solcast sensors."""

    def __init__(self, name, rooftopsite, type):
        """Initialize the Solcast Sensor."""
        self._name = name
        self._rooftopsite = rooftopsite
        self._type = type
        self._icon = "mdi:flash"
        self._state = None
        self._attributes = {}

    @property
    def unique_id(self):
        """Return the unique ID of the binary sensor."""
        return f"solcast_{self._rooftopsite.get_resource_id()}_{self._name}"

    @property
    def name(self):
        """Return the name of the device."""
        return f"Solcast {self._name}"

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return self._icon

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Get the unit of measurement."""
        if self._type is SensorType.history:
            return ENERGY_KILO_WATT
        elif self._type is SensorType.forecast:
            return ENERGY_KILO_WATT_HOUR
        else:
            return None

    @property
    def should_poll(self) -> bool:
        """Return True if entity has to be polled for state.

        False if entity pushes its state to HA.
        """
        return False

    @property
    def device_state_attributes(self):
        """Return the state attributes of the binary sensor."""
        return self._attributes

    async def async_update(self):
        """Get latest cached states from the device."""
        self._state = self._rooftopsite.get_state(self._type)
        self._attributes = self._rooftopsite.get_attributes(self._type)

    def update_callback(self):
        """Schedule a state update."""
        self.async_schedule_update_ha_state(True)

    async def async_added_to_hass(self):
        """Add update callback after being added to hass."""
        await super().async_added_to_hass()

        # Restore old state if possible and store it in rooftopsite object
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if not state:
            return
        self._state = state.state

        self._rooftopsite.set_state(self._type, state.state)
        
        _LOGGER.debug('Restored state: ' + str(state.state))
        _LOGGER.debug('check attributes: ' + str(state.attributes))

        self._rooftopsite.add_update_listener(self)

    def get_type(self):
        """Return sensor type."""
        return self._type
