"""Base entity classes for MyJDownloader integration."""

import logging
from string import Template

from myjdapi.exception import MYJDConnectionException

from homeassistant.helpers.entity import Entity

from . import MyJDownloaderHub
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class MyJDownloaderEntity(Entity):
    """Defines a MyJDownloader entity."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        name: str,
        icon: str,
        enabled_default: bool = True,
    ) -> None:
        """Initialize the MyJDownloader entity."""
        self._available = True
        self._enabled_default = enabled_default
        self._icon = icon
        self._name = name
        self.hub = hub

    @property
    def name(self) -> str:
        """Return the name of the entity."""
        return self._name

    @property
    def icon(self) -> str:
        """Return the mdi icon of the entity."""
        return self._icon

    @property
    def entity_registry_enabled_default(self) -> bool:
        """Return if the entity should be enabled when first added to the entity registry."""
        return self._enabled_default

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return self._available

    async def async_update(self) -> None:
        """Update MyJDownloader entity."""
        if not self.enabled:
            return

        try:
            await self._myjdownloader_update()
            self._available = True
        except MYJDConnectionException:
            self._available = False
        except Exception:
            if self._available:
                _LOGGER.debug(
                    "An error occurred while updating MyJDownloader sensor",
                    exc_info=True,
                )
            self._available = False

    async def _myjdownloader_update(self) -> None:
        """Update MyJDownloader entity."""
        raise NotImplementedError()


class MyJDownloaderDeviceEntity(MyJDownloaderEntity):
    """Defines a MyJDownloader device entity."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
        name_template: str,
        icon: str,
        enabled_default: bool = True,
    ) -> None:
        """Initialize the MyJDownloader device entity."""
        self._device_id = device_id
        device = hub.get_device(self._device_id)
        self._device_name = device.name
        self._device_type = device.device_type
        name = Template(name_template).substitute(device_name=self._device_name)
        super().__init__(hub, name, icon, enabled_default)

    @property
    def device_info(self):
        """Return device information about this MyJDownloader instance."""
        return {
            "identifiers": {(DOMAIN, self._device_id)},
            "name": f"JDownloader {self._device_name}",
            "manufacturer": "AppWork GmbH",
            "model": self._device_type,
            "sw_version": None,  # TODO add version method to upstream Jddevice
            "entry_type": "service",
        }

    async def async_update(self) -> None:
        """Update MyJDownloader entity."""
        if self._device_id in self.hub.devices:
            self._available = True
            await super().async_update()
        else:
            self._available = False

    # Services are registered in setup of sensor platform for each JDownloader.
    async def restart_and_update(self):
        """Service call to restart and update JDownloader."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.update.restart_and_update)

    async def run_update_check(self):
        """Service call to run update check of JDownloader."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.update.run_update_check)

    async def start_downloads(self):
        """Service call to start downloads."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.update.start_downloads)

    async def stop_downloads(self):
        """Service call to stop downloads."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.update.stop_downloads)
