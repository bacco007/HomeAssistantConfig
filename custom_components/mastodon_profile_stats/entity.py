"""MastodonProfileStatsEntity class."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.helpers.entity import DeviceInfo, EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.const import CONF_URL

from .const import DOMAIN, VERSION, MANUFACTURER
from .coordinator import MastodonProfileStatsUpdateCoordinator
from .profile import MastodonProfile


@dataclass
class MastodonProfileStatsEntityDescription(EntityDescription):
    """Defines a base MastodonProfileStats entity description."""

    entity_id: str | None = None

class MastodonProfileStatsEntity(CoordinatorEntity):
    """MastodonProfileStatsEntity class."""

    def __init__(self, description: MastodonProfileStatsEntityDescription, coordinator: MastodonProfileStatsUpdateCoordinator) -> None:
        """Initialize."""
        super().__init__(coordinator)

        # Construct the user profile to derive the api url
        user_profile = MastodonProfile(
            any_profile=coordinator.config_entry.data.get(CONF_URL)
        )

        self._attr_unique_id = coordinator.config_entry.entry_id
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.unique_id)},
            name=user_profile.full_profile_name,
            model=VERSION,
            manufacturer=MANUFACTURER,
            configuration_url=coordinator.config_entry.data.get(CONF_URL),
        )
        self.entity_description = description
        if description.entity_id:
            self.entity_id = description.entity_id
