"""Google Fit Entity class."""

from __future__ import annotations

from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.exceptions import InvalidStateError

from .const import DOMAIN, NAME, MANUFACTURER
from .coordinator import Coordinator


class GoogleFitEntity(CoordinatorEntity):
    """GoogleFitEntity class."""

    def __init__(self, coordinator: Coordinator) -> None:
        """Initialise."""
        super().__init__(coordinator)
        if coordinator.config_entry and coordinator.config_entry.unique_id:
            email = coordinator.config_entry.unique_id
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, email)},
                name=f"{NAME} - {email}",
                manufacturer=MANUFACTURER,
                model="fitness",
                sw_version="v1",
            )
        else:
            raise InvalidStateError(
                "Unexpected exception. Trying to initialise entity but config entry is None."
            )
