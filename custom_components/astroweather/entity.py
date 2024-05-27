"""Base Entity definition for AstroWeather Integration."""

from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.helpers.entity import Entity

from .const import (
    CONF_EXPERIMENTAL_FEATURES,
    CONF_LOCATION_NAME,
    DEFAULT_ATTRIBUTION,
    EXPERIMENTAL_ATTRIBUTION,
)


class AstroWeatherEntity(Entity):
    """Base class for AstroWeather Entities."""

    def __init__(self, coordinator, entries, entity, fcst_coordinator, entry_id):
        """Initialize the AstroWeather Entity."""

        super().__init__()

        self.coordinator = coordinator
        self.fcst_coordinator = fcst_coordinator
        self.entries = entries
        self._entity = entity
        self._entry_id = entry_id
        self._location_key = self.entries.get(CONF_LOCATION_NAME)

    @property
    def _current(self):
        """Return current data."""

        if self.coordinator is None:
            return None
        return self.coordinator.data[0]

    @property
    def _forecast(self):
        """Return forecast data array."""

        if self.fcst_coordinator is None:
            return None
        return self.fcst_coordinator.data[0]

    @property
    def available(self):
        """Return if entity is available."""

        return self.coordinator.last_update_success

    @property
    def extra_state_attributes(self):
        """Return common attributes."""

        if self.entries.get(CONF_EXPERIMENTAL_FEATURES):
            return {
                ATTR_ATTRIBUTION: EXPERIMENTAL_ATTRIBUTION,
            }
        return {
            ATTR_ATTRIBUTION: DEFAULT_ATTRIBUTION,
        }

    async def async_added_to_hass(self):
        """When entity is added to hass."""

        self.async_on_remove(
            self.coordinator.async_add_listener(self.async_write_ha_state)
        )

        self.async_on_remove(
            self.fcst_coordinator.async_add_listener(self.async_write_ha_state)
        )
