"""NSW Rural Fire Service - Fire Danger - Entity."""
from __future__ import annotations

import logging
from typing import Any, Mapping

from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import NswRfsFireDangerFeedCoordinator
from .const import (
    DEFAULT_ATTRIBUTION,
    DEFAULT_FORCE_UPDATE,
    DEFAULT_NAME,
    DOMAIN,
    TYPES,
    URL_SERVICE,
)

_LOGGER = logging.getLogger(__name__)


class NswFireServiceFireDangerEntity(CoordinatorEntity):
    """Implementation of a generic entity."""

    coordinator: NswRfsFireDangerFeedCoordinator
    _attr_force_update = DEFAULT_FORCE_UPDATE

    def __init__(
        self,
        coordinator: NswRfsFireDangerFeedCoordinator,
        sensor_type: str,
        config_entry_unique_id: str,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self._district_name = coordinator.district_name
        self._sensor_type = sensor_type
        self._config_entry_unique_id = config_entry_unique_id
        self._attr_name = f"{self._district_name} {TYPES[self._sensor_type]}"
        self._attr_unique_id = f"{self._config_entry_unique_id}_{self._sensor_type}"
        self._state: StateType = None
        self._attributes = {
            "district": self._district_name,
            ATTR_ATTRIBUTION: DEFAULT_ATTRIBUTION,
        }
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.config_entry.entry_id)},
            name=DEFAULT_NAME,
            entry_type=DeviceEntryType.SERVICE,
            configuration_url=URL_SERVICE,
        )

    @property
    def native_value(self) -> StateType:
        """Return native value for entity."""
        if self.coordinator.data:
            _LOGGER.debug(f"Updating state from {self.coordinator.data}")
            self._state = self.coordinator.data[self._sensor_type]
        return self._state

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Return the entity specific state attributes."""
        if self.coordinator.data:
            _LOGGER.debug(f"Updating attributes from {self.coordinator.data}")
            self._state = self.coordinator.data[self._sensor_type]
            self._attributes.update(self.coordinator.data)
            # Remove the attribute equal to sensor's state.
            del self._attributes[self._sensor_type]

        return self._attributes
