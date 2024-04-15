"""Base entity classes for MyJDownloader integration."""

from __future__ import annotations

import logging
from string import Template

from myjdapi.exception import MYJDConnectionException, MYJDException

from homeassistant.const import EntityCategory
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
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
        icon: str | None,
        entity_category: EntityCategory | None = None,
        enabled_default: bool = True,
    ) -> None:
        """Initialize the MyJDownloader entity."""
        self._available = True
        self._entity_category = entity_category
        self._enabled_default = enabled_default
        self._icon = icon
        self._name = name
        self.hub = hub

    @property
    def name(self) -> str:
        """Return the name of the entity."""
        return self._name

    @property
    def icon(self) -> str | None:
        """Return the mdi icon of the entity."""
        return self._icon

    @property
    def entity_category(self) -> EntityCategory | None:
        """Return the category of the entity."""
        return self._entity_category

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
        except MYJDException:
            if self._available:
                _LOGGER.debug(
                    "An error occurred while updating MyJDownloader sensor",
                    exc_info=True,
                )
            self._available = False

    async def _myjdownloader_update(self) -> None:
        """Update MyJDownloader entity."""
        raise NotImplementedError


class MyJDownloaderDeviceEntity(MyJDownloaderEntity):
    """Defines a MyJDownloader device entity."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
        name_template: str,
        icon: str | None,
        entity_category: EntityCategory | None = None,
        enabled_default: bool = True,
    ) -> None:
        """Initialize the MyJDownloader device entity."""
        self._device_id = device_id
        device = hub.get_device(self._device_id)
        self._device_name = device.name
        self._device_type = device.device_type
        name = Template(name_template).substitute(device_name=self._device_name)
        super().__init__(hub, name, icon, entity_category, enabled_default)

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information about this MyJDownloader instance."""
        return DeviceInfo(
            configuration_url=f"https://my.jdownloader.org/?deviceId={self._device_id}#webinterface:downloads",
            identifiers={(DOMAIN, self._device_id)},
            name=f"JDownloader {self._device_name}",
            manufacturer="AppWork GmbH",
            model=self._device_type,
            entry_type=DeviceEntryType.SERVICE,
            # sw_version=self._sw_version # TODO await self.hub.async_query(device.jd.get_core_revision)
        )

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
        await self.hub.async_query(device.downloadcontroller.start_downloads)

    async def stop_downloads(self):
        """Service call to stop downloads."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.downloadcontroller.stop_downloads)

    async def add_links(
        self,
        links: list[str],
        priority: str,
        auto_extract: bool = False,
        autostart: bool = False,
        destination_folder: str | None = None,
        download_password: str | None = None,
        extract_password: str | None = None,
        overwrite_packagizer_rules: bool = False,
        package_name: str | None = None,
    ):
        """Service call to add links."""
        # https://my.jdownloader.org/developers/index.html#tag_244
        params = [
            {
                # assignJobID
                "autoExtract": auto_extract,
                "autostart": autostart,
                # dataURLs
                # deepDecrypt
                "destinationFolder": destination_folder,
                "downloadPassword": download_password,
                "extractPassword": extract_password,
                "links": str(links),
                "overwritePackagizerRules": overwrite_packagizer_rules,
                "packageName": package_name,
                "priority": priority.upper(),
                # sourceUrl
            }
        ]
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.linkgrabber.add_links, params)
