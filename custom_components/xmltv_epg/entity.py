"""XMLTV Entity class."""

from __future__ import annotations

from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import XMLTVDataUpdateCoordinator
from .model import TVGuide


class XMLTVEntity(CoordinatorEntity):
    """XMLTV Entity class."""

    def __init__(self, coordinator: XMLTVDataUpdateCoordinator) -> None:
        """Initialize."""
        super().__init__(coordinator)

        guide: TVGuide = coordinator.data

        # self._attr_device_info = DeviceInfo(
        #    identifiers={(DOMAIN, guide.generator_name)},
        #    name=guide.generator_name,
        #    manufacturer=NAME,
        # )

        self._attr_attribution = (
            f"Data provided by {guide.generator_name}"  # TODO localize
        )
