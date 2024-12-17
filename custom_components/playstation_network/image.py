"""Image sensor platform for the PlayStation Network."""

from homeassistant.components.image import ImageEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import DOMAIN, PSN_COORDINATOR
from .entity import PSNEntity


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Add sensors for passed config_entry in HA."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][PSN_COORDINATOR]

    async_add_entities([PlaystationProfileImage(coordinator)])


class PlaystationProfileImage(PSNEntity, ImageEntity):
    """Image representing your PlayStation Avatar"""

    def __init__(self, coordinator) -> None:
        """Initialize Image."""
        super().__init__(coordinator)
        self._attr_extra_state_attributes = {}
        self.coordinator = coordinator

        self._attr_unique_id = (
            f"{self.coordinator.data.get("username").lower()}_playstation_avatar"
        )

        ImageEntity.__init__(self, coordinator.hass)
        self._attr_has_entity_name = True
        self._attr_name = "Avatar"
        self._attr_icon = "mdi:face-man-profile"
        self._attr_image_url = self.get_avatar()
        self._attr_image_last_updated = dt_util.utcnow()

    def get_avatar(self) -> str:
        """Return Avatar URL"""
        previous_image = self._attr_image_url
        current_image = None
        for avatar in self.coordinator.data.get("profile", {}).get("avatars", []):
            if avatar.get("size") == "xl":
                current_image = avatar.get("url", None)

        if previous_image != current_image:
            self._cached_image = None
            self._attr_image_last_updated = dt_util.utcnow()

        return current_image

    @callback
    def _handle_coordinator_update(self) -> None:
        self._attr_image_url = self.get_avatar()
        self.async_write_ha_state()
