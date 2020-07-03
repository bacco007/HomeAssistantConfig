"""Base class for FoldingAtHomeControl devices."""
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .foldingathomecontrol_client import FoldingAtHomeControlClient


class FoldingAtHomeControlBase:
    """Common base for FoldingAtHomeControl entities."""

    def __init__(self, client: FoldingAtHomeControlClient, slot_id: str) -> None:
        """Set up device and add update callback to get data."""
        self._device_identifier = f"{client.address}_{slot_id}"
        self._device_name = f"{client.address} {client.slot_data[slot_id]['Description'].split(':')[0].upper()}: {slot_id}"  # pylint: disable=line-too-long
        self._client: FoldingAtHomeControlClient = client
        self._slot_id: str = slot_id
        self.listeners: list = []

    @property
    def device_info(self) -> dict:
        """Return a device description for device registry."""

        return {
            "identifiers": {(DOMAIN, self._device_identifier)},
            "name": self._device_name,
            "manufacturer": "FoldingAtHomeControl",
            "via_device": (DOMAIN, self._client.address),
        }


class FoldingAtHomeControlDevice(FoldingAtHomeControlBase, Entity):
    """Representation of a FoldingAtHomeControl entity."""

    @property
    def entity_registry_enabled_default(self) -> bool:
        """Should entitiy be enabled when first added to the entity registry."""
        return True

    async def async_added_to_hass(self) -> None:
        """Subscribe to device events."""
        self.listeners.append(
            async_dispatcher_connect(
                self.hass,
                self._client.data_update_identifer,
                self.async_update_callback,
            )
        )
        self.listeners.append(
            async_dispatcher_connect(
                self.hass, self._client.sensor_removed_identifer, self.async_remove_self
            )
        )

    async def async_will_remove_from_hass(self) -> None:
        """Disconnect device object when removed."""
        for unsub_dispatcher in self.listeners:
            unsub_dispatcher()

    async def async_remove_self(self, removed_slots: list) -> None:
        """Schedule removal of this entity.

        Called by sensor_removed_identifer scheduled by async_added_to_hass.
        """
        if self._slot_id not in removed_slots:
            return
        await self.async_remove()

    @callback
    def async_update_callback(self, force_update=False, ignore_update=False):
        """Update the device's state."""
        if ignore_update:
            return

        self.async_write_ha_state()

    @property
    def available(self):
        """Return True if device is available."""
        return self._client.available

    @property
    def should_poll(self):
        """No polling needed."""
        return False
