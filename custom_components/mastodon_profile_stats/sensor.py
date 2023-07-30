"""Sensor platform for MastodonProfileStats."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.const import CONF_URL

from .const import DOMAIN
from .coordinator import MastodonProfileStatsUpdateCoordinator
from .entity import MastodonProfileStatsEntity
from .profile import MastodonProfile

ENTITY_DESCRIPTIONS = (
    SensorEntityDescription(
        key="followers_count",
        name="Followers",
        icon="mdi:counter",
    ),
    SensorEntityDescription(
        key="following_count",
        name="Following",
        icon="mdi:counter",
    ),
    SensorEntityDescription(
        key="statuses_count",
        name="Statuses",
        icon="mdi:counter",
    ),
)


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the sensor platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_devices(
        MastodonProfileStatsSensor(
            coordinator=coordinator,
            entity_description=entity_description,
        )
        for entity_description in ENTITY_DESCRIPTIONS
    )


class MastodonProfileStatsSensor(MastodonProfileStatsEntity, SensorEntity):
    """MastodonProfileStats Sensor class."""

    def __init__(
        self,
        coordinator: MastodonProfileStatsUpdateCoordinator,
        entity_description: SensorEntityDescription,
    ) -> None:
        """Initialize the sensor class."""
        super().__init__(coordinator)

        # Construct the user profile to derive the api url
        user_profile = MastodonProfile(
            any_profile=self.coordinator.config_entry.data.get(CONF_URL)
        )

        self._attr_unique_id = f"mastodon_profile_stats_{user_profile.full_profile_name}_{entity_description.key}".lower()
        self._attr_name = f"{user_profile.full_profile_name} {entity_description.name}"
        self.entity_description = entity_description

    @property
    def native_value(self) -> str:
        """Return the native value of the sensor."""
        return self.coordinator.data.get(self.entity_description.key, None)
