"""Base entity for ABC Emergency integration.

This module provides the base entity class that all ABC Emergency entity
platforms inherit from. It handles common functionality like device info
and coordinator data access.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_INSTANCE_TYPE,
    CONF_PERSON_NAME,
    CONF_STATE,
    CONF_ZONE_NAME,
    DOMAIN,
    INSTANCE_TYPE_PERSON,
    INSTANCE_TYPE_STATE,
    INSTANCE_TYPE_ZONE,
    STATE_NAMES,
)
from .coordinator import ABCEmergencyCoordinator
from .models import CoordinatorData

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry


class ABCEmergencyEntity(CoordinatorEntity[ABCEmergencyCoordinator]):
    """Base entity for ABC Emergency.

    This class provides common functionality for all ABC Emergency entities,
    including device registration and coordinator data access.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: ABCEmergencyCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the entity.

        Args:
            coordinator: The data update coordinator.
            config_entry: The config entry for this integration instance.
        """
        super().__init__(coordinator)

        # Determine device name based on instance type
        instance_type = config_entry.data.get(CONF_INSTANCE_TYPE, INSTANCE_TYPE_STATE)

        if instance_type == INSTANCE_TYPE_STATE:
            state = config_entry.data.get(CONF_STATE, "")
            state_name = STATE_NAMES.get(state, state.upper())
            device_name = f"ABC Emergency ({state_name})"
        elif instance_type == INSTANCE_TYPE_ZONE:
            zone_name = config_entry.data.get(CONF_ZONE_NAME, "Zone")
            device_name = f"ABC Emergency ({zone_name})"
        elif instance_type == INSTANCE_TYPE_PERSON:
            person_name = config_entry.data.get(CONF_PERSON_NAME, "Person")
            device_name = f"ABC Emergency ({person_name})"
        else:
            device_name = "ABC Emergency"

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name=device_name,
            manufacturer="Australian Broadcasting Corporation",
            model="Emergency Data Feed",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://www.abc.net.au/emergency",
        )

    @property
    def data(self) -> CoordinatorData:
        """Return coordinator data.

        This is a convenience property that returns the coordinator's data
        with proper typing for easy access in entity subclasses.

        Returns:
            The current coordinator data.
        """
        coordinator_data: CoordinatorData = self.coordinator.data
        return coordinator_data
