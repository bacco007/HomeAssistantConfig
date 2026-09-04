"""The base every HAUS entity shares.

Both sensor classes built the same DeviceInfo, five identical lines apart.
There is one HAUS per instance and it is a service rather than a thing on a
shelf, so the device it registers is the integration itself - and that is a
fact about HAUS, not about sensors, which is why it lives here rather than
being repeated per platform.
"""

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, INTEGRATION_TITLE
from .coordinator import HausConfigEntry, HausCoordinator


class HausEntity(CoordinatorEntity[HausCoordinator]):
    """A coordinator-backed entity attached to the HAUS service device."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: HausCoordinator, entry: HausConfigEntry) -> None:
        """Attach the entity to the single HAUS service device."""
        super().__init__(coordinator)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=INTEGRATION_TITLE,
            entry_type=DeviceEntryType.SERVICE,
        )
