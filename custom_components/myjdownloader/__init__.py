"""The MyJDownloader integration."""

from __future__ import annotations

import asyncio
from collections import defaultdict
import datetime
from http.client import HTTPException
import logging

from myjdapi.exception import MYJDConnectionException
from myjdapi.myjdapi import Jddevice, Myjdapi, MYJDException

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_EMAIL, CONF_PASSWORD, Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util import Throttle

from .const import (
    DATA_MYJDOWNLOADER_CLIENT,
    DOMAIN as MYJDOWNLOADER_DOMAIN,
    MYJDAPI_APP_KEY,
    SCAN_INTERVAL_SECONDS,
    SERVICE_ADD_LINKS,
    SERVICE_RESTART_AND_UPDATE,
    SERVICE_RUN_UPDATE_CHECK,
    SERVICE_START_DOWNLOADS,
    SERVICE_STOP_DOWNLOADS,
)

_LOGGER = logging.getLogger(__name__)


# For your initial PR, limit it to 1 platform.
PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.UPDATE,
]


class MyJDownloaderHub:
    """A MyJDownloader Hub wrapper class."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the MyJDownloader hub."""
        self._hass = hass
        self._websession = async_get_clientsession(self._hass)
        self._sem = asyncio.Semaphore(1)  # API calls need to be sequential
        self.myjd = Myjdapi()
        self.myjd.set_app_key(MYJDAPI_APP_KEY)
        self._devices: dict[str, Jddevice] = {}
        self.devices_platforms: dict[str, set] = defaultdict(lambda: set())

    @Throttle(datetime.timedelta(seconds=SCAN_INTERVAL_SECONDS))
    async def authenticate(self, email, password) -> bool:
        """Authenticate with Myjdapi."""
        try:
            async with self._sem:
                await self._hass.async_add_executor_job(
                    self.myjd.connect, email, password
                )
        except MYJDException as exception:
            _LOGGER.error("Failed to connect to MyJDownloader")
            raise exception

        return self.myjd.is_connected()

    async def async_query(self, func, *args, **kwargs):
        """Perform query while ensuring sequentiality of API calls."""
        # TODO catch exceptions, retry once with reconnect, then connect, then reauth if invalid_auth maybe with self.myjd.is_connected()
        try:
            async with self._sem:
                return await self._hass.async_add_executor_job(func, *args, **kwargs)
        except MYJDConnectionException as ex:
            # update list of online devices out of order if device is not reachable
            await self.async_update_devices(no_throttle=True)
            raise ex

    @Throttle(
        datetime.timedelta(seconds=SCAN_INTERVAL_SECONDS),
        limit_no_throttle=datetime.timedelta(seconds=5),
    )
    async def async_update_devices(self, *args, **kwargs):
        """Update list of online devices."""

        # We need to reconnect to the API to query the list of active JDownloaders
        await self.async_query(self.myjd.reconnect)  # TODO move to async query
        await self.async_query(self.myjd.update_devices)

        # add Jddevice objects for all online JDownloaders, if not exist
        new_devices = {}
        available_device_infos = await self.async_query(self.myjd.list_devices)
        for device_info in available_device_infos:
            if device_info["id"] not in self._devices:
                _LOGGER.debug("JDownloader (%s) is online", device_info["name"])
                new_devices.update(
                    {
                        device_info["id"]: await self.async_query(
                            self.myjd.get_device, None, device_info["id"]
                        )
                    }
                )
        if new_devices:
            self._devices.update(new_devices)
            async_dispatcher_send(self._hass, f"{MYJDOWNLOADER_DOMAIN}_new_devices")

        # remove JDownloader objects, that are not online anymore
        unavailable_device_ids = [
            device_id
            for device_id in self._devices
            if device_id not in [device["id"] for device in available_device_infos]
        ]
        for device_id in unavailable_device_ids:
            _LOGGER.debug("JDownloader (%s) is offline", self._devices[device_id].name)
            del self._devices[device_id]

        # TODO additionally trigger update of sensor for number of devices immediately
        # http://dev-docs.home-assistant.io/en/master/api/helpers.html#module-homeassistant.helpers.dispatcher

        return self._devices

    @property
    def devices(self):
        """Get dictionary of device ids and objects."""
        return self._devices

    def get_device(self, device_id):
        """Return an online device or raise Exception."""
        try:
            return self._devices[device_id]
        except Exception as ex:
            raise JDownloaderOfflineException(
                f"JDownloader ({device_id}) offline"
            ) from ex

    async def make_request(self, url):
        """Make a http request."""
        async with self._websession.get(url) as resp:
            if resp.status == 200:
                return await resp.text()
            raise HTTPException("Request failed")


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up MyJDownloader from a config entry."""

    # create data storage
    hass.data.setdefault(MYJDOWNLOADER_DOMAIN, {})[entry.entry_id] = {
        DATA_MYJDOWNLOADER_CLIENT: None
    }

    # initial connection
    hub = MyJDownloaderHub(hass)
    try:
        if not await hub.authenticate(
            entry.data[CONF_EMAIL], entry.data[CONF_PASSWORD]
        ):
            raise ConfigEntryNotReady
    except MYJDException as exception:
        raise ConfigEntryNotReady from exception

    await hub.async_update_devices()  # get initial list of JDownloaders
    hass.data.setdefault(MYJDOWNLOADER_DOMAIN, {})[entry.entry_id][
        DATA_MYJDOWNLOADER_CLIENT
    ] = hub

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Services are defined in MyJDownloaderDeviceEntity and
    # registered in setup of sensor platform.

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    # remove services
    hass.services.async_remove(MYJDOWNLOADER_DOMAIN, SERVICE_RESTART_AND_UPDATE)
    hass.services.async_remove(MYJDOWNLOADER_DOMAIN, SERVICE_RUN_UPDATE_CHECK)
    hass.services.async_remove(MYJDOWNLOADER_DOMAIN, SERVICE_START_DOWNLOADS)
    hass.services.async_remove(MYJDOWNLOADER_DOMAIN, SERVICE_STOP_DOWNLOADS)
    hass.services.async_remove(MYJDOWNLOADER_DOMAIN, SERVICE_ADD_LINKS)

    # unload platforms
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[MYJDOWNLOADER_DOMAIN].pop(entry.entry_id)

    return unload_ok


class JDownloaderOfflineException(Exception):
    """JDownloader offline exception."""
