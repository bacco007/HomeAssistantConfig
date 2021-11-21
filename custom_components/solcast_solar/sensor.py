"""Support for Solcast PV forecast."""
import logging

from homeassistant.const import DEVICE_CLASS_ENERGY, DEVICE_CLASS_TIMESTAMP, ENERGY_KILO_WATT_HOUR, ATTR_IDENTIFIERS, ATTR_MANUFACTURER, ATTR_MODEL, ATTR_NAME
from homeassistant.helpers.restore_state import RestoreEntity

from . import DOMAIN, SensorType

from .const import ATTR_ENTRY_TYPE, ENTRY_TYPE_SERVICE

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    """Defer sensor setup to the shared sensor module."""

    sensors = []
    rooftopsite = hass.data[DOMAIN][entry.entry_id]
    sensors.append(SolcastSensor("Forecast Today", rooftopsite, SensorType.forecast_today, entry.title, entry.entry_id))
    sensors.append(SolcastSensor("Forecast Today Remaining", rooftopsite, SensorType.forecast_today_remaining, entry.title, entry.entry_id))
    sensors.append(SolcastSensor("Forecast Tomorrow", rooftopsite, SensorType.forecast_tomorrow, entry.title, entry.entry_id))
    sensors.append(SolcastSensor("API Count", rooftopsite, SensorType.api_count, entry.title, entry.entry_id))
    sensors.append(SolcastSensor("Last Updated", rooftopsite, SensorType.last_updated, entry.title, entry.entry_id))

    async_add_entities(sensors)


class SolcastSensor(RestoreEntity):
    """The entity class for Solcast sensors."""

    def __init__(self, name, rooftopsite, type, myIntegrationName, entry_id):
        """Initialize the Solcast Sensor."""
        self._name = name
        self._rooftopsite = rooftopsite
        self._type = type
        self._state = None
        
        self._attributes = {}
        self._attr_extra_state_attributes = {}
        self._attr_device_info = {
            ATTR_IDENTIFIERS: {(DOMAIN, entry_id)},
            ATTR_NAME: myIntegrationName,
            ATTR_MANUFACTURER: "Solcast Solar",
            ATTR_MODEL: "Solcast API",
            ATTR_ENTRY_TYPE: ENTRY_TYPE_SERVICE,
        }

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
        if self._type is SensorType.forecast_today:
            return "mdi:solar-power"
        elif self._type is SensorType.forecast_today_remaining:
            return "mdi:solar-power"
        elif self._type is SensorType.forecast_tomorrow:
            return "mdi:solar-power"
        if self._type is SensorType.last_updated:
            return "mdi:clock"
        else:
            return "mdi:cloud-download-outline" 

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Get the unit of measurement."""
        if self._type is SensorType.forecast_today:
            return ENERGY_KILO_WATT_HOUR
        elif self._type is SensorType.forecast_today_remaining:
            return ENERGY_KILO_WATT_HOUR
        elif self._type is SensorType.forecast_tomorrow:
            return ENERGY_KILO_WATT_HOUR
        else:
            return None

    @property
    def device_class(self):
        """Get the device_class."""
        if self._type is SensorType.forecast_today:
            return DEVICE_CLASS_ENERGY
        elif self._type is SensorType.forecast_today_remaining:
            return DEVICE_CLASS_ENERGY
        elif self._type is SensorType.forecast_tomorrow:
            return DEVICE_CLASS_ENERGY
        elif self._type is SensorType.last_updated:
            return DEVICE_CLASS_TIMESTAMP
        else:
            return "api_count"

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

    @property
    def extra_state_attributes(self):
        """Return the state extra attributes of the binary sensor."""
        return self._attr_extra_state_attributes

    async def async_update(self):
        """Get latest cached states from the device."""
        self._state = self._rooftopsite.get_state(self._type)
        self._attributes = self._rooftopsite.get_attributes(self._type)
        self._attr_extra_state_attributes = self._rooftopsite.get_extra_state_attributes(self._type)

    def update_callback(self):
        """Schedule a state update."""
        self.async_schedule_update_ha_state(True)

    async def async_added_to_hass(self):
        """Add update callback after being added to hass."""
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state:
            self._state = state.state

            self._rooftopsite.set_state(self._type, state.state)
            
            #_LOGGER.debug('Restored state: ' + str(state.state))
            #_LOGGER.debug('check attributes: ' + str(state.attributes))

        self._rooftopsite.add_update_listener(self)

    def get_type(self):
        """Return sensor type."""
        return self._type

    async def async_will_remove_from_hass(self) -> None:
        await super().async_will_remove_from_hass()
        await self.async_remove(force_remove=True)

