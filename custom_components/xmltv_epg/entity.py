"""XMLTV Entity class."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import XMLTVDataUpdateCoordinator
from .model import TVChannel, TVGuide


class XMLTVEntity(CoordinatorEntity[XMLTVDataUpdateCoordinator]):
    """XMLTV Entity class."""

    def __init__(
        self, coordinator: XMLTVDataUpdateCoordinator, channel: TVChannel | None
    ) -> None:
        """Initialize."""
        super().__init__(coordinator)

        guide: TVGuide = coordinator.data

        self._attr_attribution = (
            f"Data provided by {guide.generator_name}"  # TODO localize
        )

        if channel is not None:
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, channel.id)}, name=channel.name
            )
