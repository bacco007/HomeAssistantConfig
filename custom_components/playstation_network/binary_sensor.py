"""Binary sensor platform for Unfolded Circle."""

from homeassistant.components.binary_sensor import (
    BinarySensorEntity,
    BinarySensorDeviceClass,
)
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, PSN_COORDINATOR
from .entity import PSNEntity


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Add sensors for passed config_entry in HA."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][PSN_COORDINATOR]

    async_add_entities([PlaystationPlusBinarySensor(coordinator)])


class PlaystationPlusBinarySensor(PSNEntity, BinarySensorEntity):
    """Sensor indicating if user is subscribed to PlayStation Plus"""

    def __init__(self, coordinator) -> None:
        """Initialize Binary Sensor."""
        super().__init__(coordinator)
        self.coordinator = coordinator

        # As per the sensor, this must be a unique value within this domain.
        self._attr_unique_id = (
            f"{coordinator.data.get("username").lower()}_has_playstation_plus"
        )

        # The name of the entity
        self._attr_has_entity_name = True
        self._attr_name = "Playstation Plus"
        self._attr_native_value = self.coordinator.data.get("profile").get("isPlus")
        self._attr_icon = "mdi:gamepad-outline"
        self._attr_device_class = BinarySensorDeviceClass.CONNECTIVITY

    @property
    def is_on(self):
        """Return the state of the binary sensor."""
        return self.coordinator.data.get("profile", {}).get("isPlus")

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()
