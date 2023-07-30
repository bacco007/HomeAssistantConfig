"""Google Fit Entity class."""
from __future__ import annotations

from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, NAME, MANUFACTURER
from .coordinator import Coordinator


class GoogleFitEntity(CoordinatorEntity):
    """GoogleFitEntity class."""

    def __init__(self, coordinator: Coordinator) -> None:
        """Initialise."""
        super().__init__(coordinator)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.unique_id)},  # type: ignore
            name=NAME,
            manufacturer=MANUFACTURER,
        )
