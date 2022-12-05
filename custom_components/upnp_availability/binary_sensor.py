"""
This platform provides a binary sensor to track the availability
 of UPnP devices, based on ssdp:alive and ssdp:byebye notifications.
"""
import asyncio
import logging
from collections import defaultdict
from typing import Optional

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.components.network import async_get_enabled_source_ips
from homeassistant.const import EVENT_HOMEASSISTANT_STOP

from .const import DOMAIN
from .upnpstatustracker import Device, UPnPStatusTracker

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the UPNP device sensors."""
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = defaultdict(lambda: False)
    upnp_data = hass.data[DOMAIN]

    devices = upnp_data["devices"] = {}

    async def add_new_device(dev: Device):
        _LOGGER.debug("Got new device: %s", dev.name)
        sensor = UPNPBinarySensor(dev)
        devices[dev.udn] = sensor
        async_add_entities([sensor], True)

    async def update_device(dev: Device):
        _LOGGER.debug(
            "Got update for device: %s (%s), state: %s", dev.name, dev.udn, dev.alive
        )
        if dev.udn not in devices:
            _LOGGER.debug("Got update from a device that we do not know yet.")
            return
        sensor = devices[dev.udn]
        await sensor._update_status()

    addresses = [str(addr) for addr in await async_get_enabled_source_ips(hass)]
    _LOGGER.info("Initializing on addresses: %s", addresses)
    tracker = upnp_data["tracker"] = UPnPStatusTracker(
        source_addresses=addresses,
        new_device_cb=add_new_device,
        state_changed_cb=update_device,
    )
    await tracker.find_devices()
    await tracker.listen()

    async def stop_tracker(event):
        """Stop the tracker on shutdown."""
        _LOGGER.debug("Stopping upnp_availability")
        await upnp_data["tracker"].stop()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, stop_tracker)


class UPNPBinarySensor(BinarySensorEntity):
    """A Class for an UPNP availability sensor."""

    def __init__(self, dev):
        """Initialize the sensor."""
        self.dev = dev  # type: Device
        self.initialized = asyncio.Event()

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.initialized.set()
        _LOGGER.info(
            "Initialized %s with unique_id: %s (attrs: %s)",
            self.name,
            self.unique_id,
            self.extra_state_attributes,
        )

    async def _update_status(self):
        """This gets called when we receive an update."""
        await self.initialized.wait()
        self.async_schedule_update_ha_state()

    @property
    def unique_id(self) -> Optional[str]:
        """Return UDN as unique id."""
        return self.dev.udn

    @property
    def device_info(self):
        """Device information."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "manufacturer": self.dev.info["manufacturer"],
            "model": f"{self.dev.info['model_name']} - {self.dev.info['model_description']}",  # noqa: E501
        }

    @property
    def should_poll(self):
        """No polling needed."""
        return False

    @property
    def name(self):
        """Return the name of the device."""
        return self.dev.name

    @property
    def is_on(self):
        """Return True if we are alive."""
        return self.dev.alive

    @property
    def extra_state_attributes(self):
        """Provide attributes for display on device card."""
        return self.dev.info

    @property
    def entity_picture(self) -> str | None:
        """Return device icon."""
        return self.dev.icon
