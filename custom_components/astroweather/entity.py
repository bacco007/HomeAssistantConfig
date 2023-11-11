"""Base Entity definition for AstroWeather Integration."""
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.helpers.entity import Entity
from .const import DEFAULT_ATTRIBUTION, DEVICE_TYPE_WEATHER


class AstroWeatherEntity(Entity):
    """Base class for AstroWeather Entities."""

    def __init__(self, coordinator, entries, entity, fcst_coordinator):
        """Initialize the AstroWeather Entity."""
        super().__init__()

        self.coordinator = coordinator
        self.fcst_coordinator = fcst_coordinator
        self.entries = entries

        self._entity = entity
        self._location_key = self.entries.get("id")
        if self._entity == DEVICE_TYPE_WEATHER:
            self._unique_id = self._location_key
        else:
            self._unique_id = f"{self._location_key}_{self._entity}"

    @property
    def unique_id(self):
        """Return a unique id."""
        return self._unique_id

    @property
    def _current(self):
        """Return current data."""
        if self.coordinator is None:
            return None
        else:
            return self.coordinator.data[0]

    @property
    def _forecast(self):
        """Return forecast data array."""
        if self.fcst_coordinator is None:
            return None
        else:
            return self.fcst_coordinator.data[0]

    @property
    def available(self):
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def extra_state_attributes(self):
        """Return common attributes."""
        attr = {
            ATTR_ATTRIBUTION: DEFAULT_ATTRIBUTION,
        }

        return attr

    async def async_added_to_hass(self):
        """When entity is added to hass."""
        self.async_on_remove(self.coordinator.async_add_listener(self.async_write_ha_state))

        self.async_on_remove(self.fcst_coordinator.async_add_listener(self.async_write_ha_state))
