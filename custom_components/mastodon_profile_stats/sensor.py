"""Sensor platform for MastodonProfileStats."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.sensor import SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.const import CONF_URL

from .const import DOMAIN
from .coordinator import MastodonProfileStatsUpdateCoordinator
from .entity import MastodonProfileStatsEntity, MastodonProfileStatsEntityDescription
from .profile import MastodonProfile

@dataclass
class MastodonProfileStatsSensorEntityDescription(
    MastodonProfileStatsEntityDescription,
    SensorEntityDescription,
):
    """Class describing MastodonProfileStats sensor entities."""


ENTITY_DESCRIPTIONS = (
    MastodonProfileStatsSensorEntityDescription(
        key="followers_count",
        translation_key="followers",
        icon="mdi:counter",
        state_class = SensorStateClass.TOTAL,
    ),
    MastodonProfileStatsSensorEntityDescription(
        key="following_count",
        translation_key="following",
        icon="mdi:counter",
        state_class = SensorStateClass.TOTAL,
    ),
    MastodonProfileStatsSensorEntityDescription(
        key="statuses_count",
        translation_key="statuses",
        icon="mdi:counter",
        state_class = SensorStateClass.TOTAL,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    async_add_entities(
        MastodonProfileStatsSensor(
            entity_description=entity_description,
            coordinator=coordinator,
        )
        for entity_description in ENTITY_DESCRIPTIONS
    )

class MastodonProfileStatsSensor(MastodonProfileStatsEntity, SensorEntity):
    """MastodonProfileStats Sensor class."""

    def __init__(
        self,
        entity_description: MastodonProfileStatsSensorEntityDescription,
        coordinator: MastodonProfileStatsUpdateCoordinator,
    ) -> None:
        """Initialize the sensor class."""
        super().__init__(entity_description, coordinator)

        # Construct the user profile to derive the api url
        user_profile = MastodonProfile(
            any_profile=coordinator.config_entry.data.get(CONF_URL)
        )

        self._attr_unique_id = f"mastodon_profile_stats_{user_profile.full_profile_name}_{entity_description.key}".lower()
        self.entity_description = entity_description
        self._attr_has_entity_name = True

    @property
    def native_value(self) -> str:
        """Return the native value of the sensor."""
        return self.coordinator.data.get(self.entity_description.key, None)
