"""MyJDownloader binary sensors."""

import datetime

from homeassistant.components.binary_sensor import (
    DEVICE_CLASS_PROBLEM,
    DOMAIN,
    BinarySensorEntity,
)
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from . import MyJDownloaderHub
from .const import (
    DATA_MYJDOWNLOADER_CLIENT,
    DOMAIN as MYJDOWNLOADER_DOMAIN,
    SCAN_INTERVAL_SECONDS,
)
from .entities import MyJDownloaderDeviceEntity

SCAN_INTERVAL = datetime.timedelta(seconds=SCAN_INTERVAL_SECONDS)


async def async_setup_entry(hass, entry, async_add_entities, discovery_info=None):
    """Set up the binary sensor using config entry."""
    hub = hass.data[MYJDOWNLOADER_DOMAIN][entry.entry_id][DATA_MYJDOWNLOADER_CLIENT]

    @callback
    def async_add_binary_sensor(devices=hub.devices):
        entities = []

        for device_id in devices.keys():
            if DOMAIN not in hub.devices_platforms[device_id]:
                hub.devices_platforms[device_id].add(DOMAIN)
                entities += [
                    MyJDownloaderUpdateAvailableSensor(hub, device_id),
                ]

        if entities:
            async_add_entities(entities, True)

    entry.async_on_unload(
        async_dispatcher_connect(
            hass, f"{MYJDOWNLOADER_DOMAIN}_new_devices", async_add_binary_sensor
        )
    )

    async_add_binary_sensor(hub.devices)


class MyJDownloaderBinarySensor(MyJDownloaderDeviceEntity, BinarySensorEntity):
    """Defines a MyJDownloader binary sensor."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
        name_template: str,
        icon: str,
        measurement: str,
        device_class: str = None,
        enabled_default: bool = True,
    ) -> None:
        """Initialize MyJDownloader binary sensor."""
        self._state = None
        self._device_class = device_class
        self.measurement = measurement
        super().__init__(hub, device_id, name_template, icon, enabled_default)

    @property
    def unique_id(self) -> str:
        """Return the unique ID for this binary sensor."""
        return "_".join(
            [
                MYJDOWNLOADER_DOMAIN,
                self._name,
                DOMAIN,
                self.measurement,
            ]
        )

    @property
    def is_on(self) -> bool:
        """Return the state."""
        return self._state

    @property
    def device_class(self) -> str:
        """Return the device class."""
        return self._device_class


class MyJDownloaderUpdateAvailableSensor(MyJDownloaderBinarySensor):
    """Defines a MyJDownloader update available binary sensor."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
    ) -> None:
        """Initialize MyJDownloader binary sensor."""
        super().__init__(
            hub,
            device_id,
            "JDownloader $device_name Update Available",
            None,
            "update_available",
            DEVICE_CLASS_PROBLEM,
        )

    async def _myjdownloader_update(self) -> None:
        """Update MyJDownloader entity."""
        device = self.hub.get_device(self._device_id)
        self._state = await self.hub.async_query(device.update.is_update_available)
