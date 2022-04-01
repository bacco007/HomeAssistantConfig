""""""

# region #-- imports --#
import logging

import aiohttp
import asyncio
from typing import (
    Any,
    List,
    Optional,
)

from .logger import HDHomerunLogger
# endregion

_LOGGER = logging.getLogger(__name__)

DEF_DISCOVER: str = "discover.json"
DEF_LINEUP: str = "lineup.json"
DEF_TUNER_STATUS: str = "status.json"
DEF_TUNER_STATUS_MIN_FIRMWARE: int = 20190417

KEY_DISCOVER_CURRENT_FIRMWARE: str = "FirmwareVersion"
KEY_DISCOVER_FRIENDLY_NAME: str = "FriendlyName"
KEY_DISCOVER_MODEL: str = "ModelNumber"
KEY_DISCOVER_SERIAL: str = "DeviceID"
KEY_DISCOVER_TUNER_COUNT: str = "TunerCount"
KEY_DISCOVER_UPGRADE_FIRMWARE: str = "UpgradeAvailable"

KEY_TUNER_CHANNEL_NAME: str = "VctName"
KEY_TUNER_CHANNEL_NUMBER: str = "VctNumber"
KEY_TUNER_FREQUENCY: str = "Frequency"
KEY_TUNER_NAME: str = "Resource"


class HDHomeRunException(Exception):
    """"""


class HDHomeRunExceptionOldFirmware(HDHomeRunException):
    """"""


class HDHomeRunExceptionUnreachable(HDHomeRunException):
    """"""


class HDHomeRunDevice(HDHomerunLogger):
    """"""

    def __init__(
        self,
        host: str,
        session: Optional[aiohttp.ClientSession] = None,
        loop: Optional[asyncio.AbstractEventLoop] = None
    ) -> None:
        """"""

        super().__init__()

        self._host: str = host
        self._loop: asyncio.AbstractEventLoop = loop if loop else asyncio.get_event_loop()
        self._results: dict = {}
        self._session: aiohttp.ClientSession
        self._tuner_status_warning_raised: bool = False

        if session:
            self._session = session
        else:
            self._session = aiohttp.ClientSession(
                loop=self._loop,
            )

    def _build_url(self, name: str) -> str:
        """"""

        # noinspection HttpUrlsUsage
        return f"http://{self._host}/{name}"

    async def _get_url(self, url: List[str]) -> Any:
        """"""

        _LOGGER.debug(self.message_format("entered, %s"), url)
        tasks: List[asyncio.Task] = []
        for u in url:
            built_url = self._build_url(name=u)
            _LOGGER.debug(self.message_format("adding task for: %s"), built_url)
            tasks.append(
                asyncio.ensure_future(
                    loop=self._loop,
                    coro_or_future=self._session.get(built_url)
                )
            )

        _LOGGER.debug(self.message_format("exited"))

        return await asyncio.gather(*tasks)

    async def get_details(self, **kwargs):
        """"""

        _LOGGER.debug(self.message_format("entered, kwargs: %s"), kwargs)
        details: List[str] = []
        if "include_discover" in kwargs:
            details.append(DEF_DISCOVER)
        if "include_lineups" in kwargs:
            details.append(DEF_LINEUP)
        if "include_tuner_status" in kwargs:
            details.append(DEF_TUNER_STATUS)

        if not details:
            raise HDHomeRunException("No URLS were specified")

        results = await self._get_url(details)

        # region #-- build the results --#
        for result in [r for r in results if r.ok]:
            self._results[result.url.name] = await result.json()
        # endregion

        # region #-- check for errors --#
        url_errors = [result for result in results if not result.ok]
        if len(url_errors) == len(details):
            msg: str = "No response from the device."
            _LOGGER.error(self.message_format("%s"), msg)
            raise HDHomeRunExceptionUnreachable(msg)
        elif len(url_errors):
            for url_err in url_errors:
                msg: str = ""
                if url_err.url.name == DEF_DISCOVER:
                    msg = f"Unable to retrieve information about the device."
                if url_err.url.name == DEF_LINEUP:
                    msg = f"Unable to currently tuned channels."
                if url_err.url.name == DEF_TUNER_STATUS:
                    current_firmware = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_CURRENT_FIRMWARE)
                    msg = f"Unable to retrieve tuner information. Your current firmware level is: {current_firmware}." \
                          f" Support was added in {DEF_TUNER_STATUS_MIN_FIRMWARE}."

                if url_err.url.name != DEF_TUNER_STATUS:
                    _LOGGER.error(self.message_format(msg))
                    raise HDHomeRunException(msg)
                else:
                    if not self._tuner_status_warning_raised:
                        self._tuner_status_warning_raised = True
                        raise HDHomeRunExceptionOldFirmware(msg)

        # endregion

        _LOGGER.debug(self.message_format("exited"))

    def get_tuner(self, name: str) -> dict:
        """"""

        found_tuner = [tuner for tuner in self.tuners if tuner.get(KEY_TUNER_NAME).lower() == name.lower()]
        ret = found_tuner[0] if found_tuner else {}

        return ret

    # region #-- properties --#
    @property
    def channels(self) -> Optional[List[dict]]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_LINEUP, [])

        return ret

    @property
    def current_firmware(self) -> Optional[str]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_CURRENT_FIRMWARE)

        return ret

    @property
    def friendly_name(self) -> Optional[str]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_FRIENDLY_NAME)

        return ret

    @property
    def host(self) -> str:
        """"""

        return self._host

    @property
    def latest_firmware(self) -> Optional[str]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_UPGRADE_FIRMWARE)

        return ret

    @property
    def model(self) -> Optional[str]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_MODEL)

        return ret

    @property
    def serial(self) -> Optional[str]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_SERIAL)

        return ret

    @property
    def tuner_count(self) -> Optional[int]:
        """"""

        ret = None
        if self._results:
            ret = self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_TUNER_COUNT)

        return ret

    @property
    def tuners(self) -> List[dict]:
        """"""

        ret = []
        if self._results:
            ret = self._results.get(DEF_TUNER_STATUS, [])

        return ret

    @property
    def update_available(self) -> bool:
        """"""

        return bool(self._results.get(DEF_DISCOVER, {}).get(KEY_DISCOVER_UPGRADE_FIRMWARE))
    # endregion
