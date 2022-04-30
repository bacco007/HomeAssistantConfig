"""Representation of an HDHomeRun device"""

# region #-- imports --#
from __future__ import annotations

import asyncio
import logging
from enum import (
    Enum,
    unique,
)
from typing import (
    Dict,
    List,
    Optional,
    Tuple,
)
from urllib.parse import urlparse, urlunparse

import aiohttp

from .const import (
    HDHOMERUN_TAG_GETSET_NAME,
    HDHOMERUN_TAG_GETSET_VALUE,
)
from .protocol import HDHomeRunProtocol

# endregion

_LOGGER = logging.getLogger(__name__)


@unique
class DeviceType(Enum):
    """Device types as defined by the protocol"""

    TUNER = 1
    STORAGE = 5


class HDHomeRunDevice:
    """Representation of a device"""

    def __del__(self) -> None:
        """Close the session if necessary"""

        if self._session and self._created_session:
            asyncio.run_coroutine_threadsafe(coro=self._session.close(), loop=asyncio.get_event_loop())

    def __init__(self, host: str) -> None:
        """Constructor"""

        self._host: str = host

        self._created_session: bool = False
        self._http_discovery_attempted: bool = False
        self._session: Optional[aiohttp.ClientSession] = None

        self._available_firmware: Optional[str] = None
        self._base_url: Optional[str] = None
        self._channels: List[Dict[str, str]] = []
        self._device_auth_str: Optional[str] = None
        self._device_id: Optional[str] = None
        self._device_type: Optional[DeviceType] = None
        self._discover_url: Optional[str] = None
        self._friendly_name: Optional[str] = None
        self._lineup_url: Optional[str] = None
        self._sys_hwmodel: Optional[str] = None
        self._sys_model: Optional[str] = None
        self._sys_version: Optional[str] = None
        self._tuner_count: Optional[int] = None
        self._tuner_status: Optional[List[Dict[str, int | str]]] = None

    async def _async_tuner_refresh_http(self, timeout: Optional[float] = 2.5) -> None:
        """Refresh the tuner data using HTTP

        :param timeout: timeout for the query
        :return: None
        """

        # region #-- build the URL and create a session if needed --#
        tuner_status_url: List[str] | str = list(urlparse(self._discover_url))
        tuner_status_url[2] = "/status.json"
        tuner_status_url = urlunparse(tuner_status_url)
        if not self._session:
            self._created_session = True
            self._session = aiohttp.ClientSession()
        # endregion

        try:
            resp: aiohttp.ClientResponse = await self._session.get(
                url=tuner_status_url,
                timeout=timeout,
                raise_for_status=True
            )
        except aiohttp.ClientResponseError as err:
            _LOGGER.error("ClientResponseError --> %s", err)
        except Exception as err:
            _LOGGER.error("%s type: %s", err, type(err))
        else:
            resp_json = await resp.json()
            self._tuner_status = resp_json

    async def _async_tuner_refresh_tcp(self) -> None:
        """Refresh the tuner information using the TCP control protocol

        N.B. this tries to closely mimic the response from the HTTP response

        :return: None
        """

        proto: HDHomeRunProtocol = HDHomeRunProtocol(host=self.ip)

        tuners = [
            proto.get_tuner_status(tuner_idx=idx)
            for idx in range(self.tuner_count)
        ]
        tuner_status = await asyncio.gather(*tuners)

        # -- process all tuners --#
        for tuner in tuner_status:
            key = tuner.get("data", {})[HDHOMERUN_TAG_GETSET_NAME].decode().rstrip("\0")
            val = tuner.get("data", {})[HDHOMERUN_TAG_GETSET_VALUE].decode().rstrip("\0")
            tuner_info: Dict[str, int | str] = {
                "Resource": key.split("/")[1]
            }
            status_details = val.split(" ")  # status details are space delimited
            for d in status_details:  # tags are = delimited
                tag, value = tuple(map(str, d.split("=")))
                try:
                    value = int(value)
                except ValueError:  # we're onlhy interested in the items that are numbers
                    pass
                else:
                    if value != 0:  # if the value is 0 don't include it
                        if tag == "seq":
                            tuner_info["SymbolQualityPercent"] = value
                        elif tag == "snq":
                            tuner_info["SignalQualityPercent"] = value
                        elif tag == "ss":
                            tuner_info["SignalStrengthPercent"] = value

            if "SymbolQualityPercent" in tuner_info:  # need to get the channel details now
                channel_details = await proto.get_tuner_current_channel(
                    tuner_idx=tuner_info["Resource"].replace("tuner", "")
                )
                tuner_channel_id, channel_names, tuner_target = channel_details
                tuner_channel_id = tuner_channel_id.get("data", {})[HDHOMERUN_TAG_GETSET_VALUE].decode().rstrip("\0")
                if int(tuner_channel_id):
                    channel_names = (
                        channel_names.get("data", {})[HDHOMERUN_TAG_GETSET_VALUE].decode().rstrip("\0").split("\n")
                    )
                    channel: str
                    channel_name: List[Tuple[str, ...]] = [
                        tuple(channel.replace(f"{tuner_channel_id}: ", "").split(" ", maxsplit=1))
                        for channel in channel_names
                        if channel.startswith(f"{tuner_channel_id}: ")
                    ]
                    if channel_name:
                        vct_number, vct_name = channel_name[0]
                        tuner_info["VctNumber"] = str(vct_number)
                        tuner_info["VctName"] = str(vct_name)
                    tuner_info["TargetIP"] = (
                        urlparse(tuner_target.get("data", {})[HDHOMERUN_TAG_GETSET_VALUE]).hostname.decode()
                    )

            if not self._tuner_status:
                self._tuner_status = []
            self._tuner_status.append(tuner_info)

    async def async_tuner_refresh(self, timeout: Optional[float] = 2.5) -> None:
        """Genric function refreshing tuners

        N.B. assumes that a discover_url means that the device will respond to HTTP

        :param timeout: timeout for the query (ignored for TCP Control protocol)
        :return: None
        """

        if self._discover_url is not None:
            await self._async_tuner_refresh_http(timeout=timeout)
        else:
            await self._async_tuner_refresh_tcp()

    async def async_rediscover(self) -> None:
        """Refresh the information for a device

        :return: None
        """

        from .discover import Discover  # late import for Discover to avoid a circular import
        await Discover.rediscover(target=self)

    # region #-- properties --#
    @property
    def base_url(self) -> Optional[str]:
        """Get the base URL"""

        return self._base_url

    @property
    def channels(self) -> List[Dict[str, str]]:
        """Get a list of channels as per the HTTP API"""

        return self._channels

    @property
    def device_auth_string(self) -> Optional[str]:
        """Get the device auth string"""

        return self._device_auth_str

    @property
    def device_id(self) -> Optional[str]:
        """Get the device ID"""

        return self._device_id

    @property
    def device_type(self) -> Optional[DeviceType]:
        """Get the device type as defined in the UDP protocol"""

        return self._device_type

    @property
    def friendly_name(self) -> Optional[str]:
        """Get the friendly name as defined by the HTTP API"""

        return self._friendly_name

    @property
    def hw_model(self) -> Optional[str]:
        """Get the model number"""

        return self._sys_hwmodel

    @property
    def installed_version(self) -> Optional[str]:
        """Get the installed firmware version"""

        return self._sys_version

    @property
    def ip(self) -> Optional[str]:
        """Get the IP address"""

        return self._host

    @property
    def latest_version(self) -> Optional[str]:
        """Get the atest available version (HTTP API)"""

        return self._available_firmware

    @property
    def lineup_url(self) -> Optional[str]:
        """Get the URL for the channel lineup"""

        return self._lineup_url

    @property
    def model(self) -> Optional[str]:
        """Get the firmware name"""

        return self._sys_model

    @property
    def tuner_count(self) -> Optional[int]:
        """Get the number of tuners"""

        return self._tuner_count

    @property
    def tuner_status(self) -> Optional[List[Dict[str, int | str]]]:
        """Get the status for all tuners"""

        return self._tuner_status
    # endregion
