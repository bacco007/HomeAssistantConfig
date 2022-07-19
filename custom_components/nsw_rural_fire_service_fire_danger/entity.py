"""NSW Rural Fire Service - Fire Danger - Entity."""
from __future__ import annotations

import logging
from abc import abstractmethod
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import NswRfsFireDangerFeedCoordinator
from .const import (
    DEFAULT_ATTRIBUTION,
    DEFAULT_FORCE_UPDATE,
    DEFAULT_NAME_PREFIX,
    DOMAIN,
    TYPES,
    URL_SERVICE,
)

_LOGGER = logging.getLogger(__name__)


class NswFireServiceFireDangerEntity(CoordinatorEntity[dict[str, Any]]):
    """Implementation of a generic entity."""

    _attr_attribution = DEFAULT_ATTRIBUTION
    _attr_force_update = DEFAULT_FORCE_UPDATE
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: NswRfsFireDangerFeedCoordinator,
        sensor_type: str,
        config_entry_unique_id: str,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._attr_name = TYPES[self._sensor_type]
        self._attr_unique_id = f"{config_entry_unique_id}_{self._sensor_type}"
        self._attr_extra_state_attributes = {
            "district": coordinator.district_name,
        }
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.config_entry.entry_id)},
            name=f"{DEFAULT_NAME_PREFIX} {coordinator.district_name}",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url=URL_SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Handle entity which will be added."""
        await super().async_added_to_hass()
        # Conduct the initial update.
        await self.async_update()

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        if self.coordinator.data:
            _LOGGER.debug(f"Updating state and attributes from {self.coordinator.data}")
            self._update_state(self.coordinator.data[self._sensor_type])
            self._attr_extra_state_attributes.update(self.coordinator.data)
            # Remove the attribute equal to sensor's state.
            del self._attr_extra_state_attributes[self._sensor_type]
        self.async_write_ha_state()

    @abstractmethod
    def _update_state(self, new_state: StateType) -> None:
        """Update the state from the provided value."""
