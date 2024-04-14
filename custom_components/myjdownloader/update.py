"""MyJDownloader update entities."""

from __future__ import annotations

import datetime
from http.client import HTTPException
import logging
import re
from typing import Any

from homeassistant.components.update import (
    DOMAIN,
    UpdateDeviceClass,
    UpdateEntity,
    UpdateEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import Throttle

from . import MyJDownloaderHub
from .const import (
    DATA_MYJDOWNLOADER_CLIENT,
    DOMAIN as MYJDOWNLOADER_DOMAIN,
    LATEST_VERSION_REGEX,
    LATEST_VERSION_SCAN_INTERVAL_SECONDS,
    LATEST_VERSION_URL,
    SCAN_INTERVAL_SECONDS,
    TITLE,
)
from .entities import MyJDownloaderDeviceEntity

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = datetime.timedelta(seconds=SCAN_INTERVAL_SECONDS)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
    discovery_info=None,
) -> None:
    """Set up the update entity using config entry."""
    hub = hass.data[MYJDOWNLOADER_DOMAIN][entry.entry_id][DATA_MYJDOWNLOADER_CLIENT]

    @callback
    def async_add_update(devices=hub.devices):
        entities = []

        for device_id in devices:
            if DOMAIN not in hub.devices_platforms[device_id]:
                hub.devices_platforms[device_id].add(DOMAIN)
                entities += [
                    MyJDownloaderUpdateEntity(hub, device_id),
                ]

        if entities:
            async_add_entities(entities, True)

    entry.async_on_unload(
        async_dispatcher_connect(
            hass, f"{MYJDOWNLOADER_DOMAIN}_new_devices", async_add_update
        )
    )

    async_add_update(hub.devices)


class MyJDownloaderUpdate(MyJDownloaderDeviceEntity, UpdateEntity):
    """Defines a MyJDownloader update."""

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
        name_template: str,
        icon: str | None,
        device_class: UpdateDeviceClass | None = None,
        entity_category: EntityCategory | None = None,
        enabled_default: bool = True,
    ) -> None:
        """Initialize MyJDownloader update."""
        self._state = None  # current version
        self._latest_version: str | None = None
        self._device_class = device_class
        super().__init__(
            hub, device_id, name_template, icon, entity_category, enabled_default
        )

    @property
    def unique_id(self) -> str:
        """Return the unique ID for this update."""
        return "_".join(
            [
                MYJDOWNLOADER_DOMAIN,
                self._name,
                DOMAIN,
            ]
        )

    @property
    def installed_version(self) -> str | None:
        """Return JDownloader core revision."""
        return self._state

    @property
    def latest_version(self) -> str | None:
        """Return latest available version."""
        return self._latest_version

    @property
    def device_class(self) -> UpdateDeviceClass | None:
        """Return the device class."""
        return self._device_class


class MyJDownloaderUpdateEntity(MyJDownloaderUpdate):
    """Defines a MyJDownloader update entity."""

    _attr_supported_features = UpdateEntityFeature.INSTALL
    _attr_title = TITLE

    def __init__(
        self,
        hub: MyJDownloaderHub,
        device_id: str,
    ) -> None:
        """Initialize MyJDownloader update entity."""
        super().__init__(
            hub,
            device_id,
            "JDownloader $device_name Update",
            None,
            None,
            EntityCategory.DIAGNOSTIC,
        )
        self._update_available: bool = False
        self._latest_version_checked_at: datetime.datetime = (
            datetime.datetime.fromtimestamp(0, tz=datetime.UTC)
        )
        self._latest_version_date: str | None = None

    async def _myjdownloader_update(self) -> None:
        """Update MyJDownloader entity."""
        device = self.hub.get_device(self._device_id)
        update_available = await self.hub.async_query(device.update.is_update_available)
        if self._state is None or self._update_available != update_available:
            self._state = await self.hub.async_query(device.jd.get_core_revision)

        if LATEST_VERSION_SCAN_INTERVAL_SECONDS > 0 and (
            (self._latest_version is None or self._update_available != update_available)
            or (
                update_available
                and (
                    datetime.datetime.now(datetime.UTC)
                    - self._latest_version_checked_at
                ).total_seconds()
                > LATEST_VERSION_SCAN_INTERVAL_SECONDS
            )
        ):
            await self._update_latest_version()
        elif update_available:  # do not do latest version checks
            # Note, a second update will not unskip a previously skipped update
            self._latest_version = str(self._state) + "+"
        else:
            self._latest_version = str(self._state)
        self._update_available = update_available

    @Throttle(datetime.timedelta(seconds=SCAN_INTERVAL_SECONDS))
    async def _update_latest_version(self) -> None:
        """Query the latest core revision."""
        try:
            response_text = await self.hub.make_request(LATEST_VERSION_URL)
        except HTTPException:
            _LOGGER.warning("Failed to query latest version")
        else:
            response_text = "".join(response_text.split())
            if match := re.match(LATEST_VERSION_REGEX, response_text):
                self._latest_version = match.group(1)
                self._latest_version_date = match.group(2)
                self._latest_version_checked_at = datetime.datetime.now(datetime.UTC)

    async def async_install(
        self, version: str | None, backup: bool, **kwargs: Any
    ) -> None:
        """Install update."""
        device = self.hub.get_device(self._device_id)
        await self.hub.async_query(device.update.restart_and_update)
