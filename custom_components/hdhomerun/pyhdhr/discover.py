"""Discovery for HDHomeRun devices."""

# region #-- imports --#
from __future__ import annotations

import asyncio
import logging
import socket
import struct
from enum import Enum, unique
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

import aiohttp

from . import HDHomeRunDevice
from .const import (
    HDHOMERUN_DEVICE_ID_WILDCARD,
    HDHOMERUN_DEVICE_TYPE_TUNER,
    HDHOMERUN_DISCOVER_UDP_PORT,
    HDHOMERUN_TAG_BASE_URL,
    HDHOMERUN_TAG_DEVICE_AUTH_STR,
    HDHOMERUN_TAG_DEVICE_ID,
    HDHOMERUN_TAG_DEVICE_TYPE,
    HDHOMERUN_TAG_LINEUP_URL,
    HDHOMERUN_TAG_TUNER_COUNT,
    HDHOMERUN_TYPE_DISCOVER_REQ,
    HDHOMERUN_TYPE_DISCOVER_RPY,
)
from .exceptions import HDHomeRunHTTPDiscoveryNotAvailableError
from .logger import Logger
from .protocol import HDHomeRunProtocol

# endregion

_LOGGER = logging.getLogger(__name__)


@unique
class DiscoverMode(Enum):
    """Available discovery modes."""

    AUTO = 0
    HTTP = 1
    UDP = 2


class Discover:
    """Generic discovery representation."""

    def __init__(self, mode: DiscoverMode = DiscoverMode.AUTO) -> None:
        """Initialise."""
        self._log_formatter: Logger = Logger()
        self._mode: DiscoverMode = DiscoverMode(mode)

    async def discover(
        self, broadcast_address: Optional[str] = "255.255.255.255"
    ) -> List[HDHomeRunDevice]:
        """Carry out a discovery for devices.

        N.B. when the mode is set to AUTO HTTP is discovery is attempted first and then UDP.
        The device lists are merged with the settings from UDP winning if they are not None.
        A request is then made to the discover_url to attempt to get more friendly information.

        :param broadcast_address: the address to broadcast to when using the UDP protocol
        :return: a list of device objects for those found
        """
        _LOGGER.debug(
            self._log_formatter.format("entered, broadcast_address: %s"),
            broadcast_address,
        )
        _LOGGER.debug(self._log_formatter.format("mode: %s"), self._mode)

        devices: Dict[str, HDHomeRunDevice] = {}

        # region #-- get the devices from HTTP --#
        if self._mode in (DiscoverMode.AUTO, DiscoverMode.HTTP):
            try:
                discovered_devices: List[
                    HDHomeRunDevice
                ] = await DiscoverHTTP.discover()
            except HDHomeRunHTTPDiscoveryNotAvailableError as err:
                _LOGGER.debug(self._log_formatter.format("%s"), err)
            else:
                for dev in discovered_devices:
                    setattr(dev, "_discovery_method", DiscoverMode.HTTP)
                    devices[dev.device_id] = dev
        # endregion

        # region #-- get the devices from UDP --#
        if self._mode in (DiscoverMode.AUTO, DiscoverMode.UDP):
            discovered_devices: List[HDHomeRunDevice] = await DiscoverUDP.discover(
                target=broadcast_address
            )
            for dev in discovered_devices:
                if dev.device_id not in devices:
                    setattr(dev, "_discovery_method", DiscoverMode.UDP)
                    devices[dev.device_id] = dev
                else:
                    for _, property_name in _DiscoverProtocol.TAG_PROPERTY_MAP.items():
                        if (
                            property_value := getattr(dev, property_name, None)
                        ) is not None:
                            setattr(
                                devices.get(dev.device_id),
                                property_name,
                                property_value,
                            )
        # endregion

        # region #-- try and rediscover via HTTP to get further details (UDP won't offer any more) --#
        if len(devices):
            _LOGGER.debug(
                self._log_formatter.format("attempting targeted rediscover via HTTP")
            )
        for _, dev in devices.items():
            await DiscoverHTTP.rediscover(target=dev)
        # endregion

        _LOGGER.debug(
            self._log_formatter.format("exited, %i devices found"), len(devices)
        )
        return list(devices.values())

    @staticmethod
    async def rediscover(target: HDHomeRunDevice) -> HDHomeRunDevice:
        """Get updated information for the given target.

        :param target: the device to refresh information for
        :return: the updated device
        """
        log_formatter: Logger = Logger(unique_id=target.ip)
        _LOGGER.debug(log_formatter.format("entered"))

        ret: HDHomeRunDevice
        if getattr(target, "_discovery_mode", None) is None:
            discovered_devices: List[HDHomeRunDevice] = await Discover().discover()
            for dev in discovered_devices:
                if dev.ip == target.ip:
                    device: HDHomeRunDevice = dev
                    break
        else:
            if getattr(target, "_discover_url", None) is not None:
                device: HDHomeRunDevice = await DiscoverHTTP.rediscover(target=target)
            else:
                device: List[HDHomeRunDevice] = await DiscoverUDP.rediscover(
                    target=target.ip
                )

        if not device:
            ret = target
            setattr(ret, "_is_online", False)
        else:
            ret = device[0] if isinstance(device, List) else device
            setattr(ret, "_is_online", True)

        _LOGGER.debug(log_formatter.format("_is_online: %s"), ret.online)
        _LOGGER.debug(log_formatter.format("exited"))
        return ret


class DiscoverHTTP:
    """Discover a device over HTTP."""

    JSON_PROPERTIES_MAP: Dict[str, str] = {
        "BaseURL": "_base_url",
        "DeviceAuth": "_device_auth_str",
        "DeviceID": "_device_id",
        "DiscoverURL": "_discover_url",
        "FirmwareName": "_sys_model",
        "FirmwareVersion": "_sys_version",
        "FriendlyName": "_friendly_name",
        "LineupURL": "_lineup_url",
        "LocalIP": "_host",
        "ModelNumber": "_sys_hwmodel",
        "TunerCount": "_tuner_count",
        "UpgradeAvailable": "_available_firmware",
    }

    @staticmethod
    async def discover(
        discover_url: str = "https://ipv4-api.hdhomerun.com/discover",
        session: Optional[aiohttp.ClientSession] = None,
        timeout: float = 2.5,
    ) -> List[HDHomeRunDevice]:
        """Issue a request to get known devices or updated information about a device.

        :param discover_url: the URL to query
        :param session: an existing session to use
        :param timeout: timeout for the query
        :return: list of devices found or with refreshed information
        """
        log_formatter: Logger = Logger(prefix=f"{__class__.__name__}.")
        _LOGGER.debug(
            log_formatter.format(
                "entered, discover_url: %s, session: %s, timeout: %.2f"
            ),
            discover_url,
            session,
            timeout,
        )

        ret: List[HDHomeRunDevice] = []
        created_session: bool = False

        if session is None:
            _LOGGER.debug(log_formatter.format("creating session"))
            created_session = True
            session = aiohttp.ClientSession()

        try:
            response = await session.get(
                url=discover_url, timeout=timeout, raise_for_status=True
            )
        except Exception as err:
            _LOGGER.debug(
                log_formatter.format("error in HTTP discovery, %s: %s"), type(err), err
            )
            raise HDHomeRunHTTPDiscoveryNotAvailableError(
                device=urlparse(discover_url).hostname
            ) from None
        else:
            resp_json = await response.json()
            if resp_json:  # we didn't just get an empty list or dictionary
                if not isinstance(resp_json, list):  # single result received
                    resp_json = [resp_json]
                for device in resp_json:
                    discovered_device = HDHomeRunDevice(
                        host=device.get("LocalIP") or urlparse(discover_url).hostname
                    )
                    for (
                        json_prop_name,
                        property_value,
                    ) in device.items():  # use the mappings to set properties
                        if (
                            property_name := DiscoverHTTP.JSON_PROPERTIES_MAP.get(
                                json_prop_name, None
                            )
                        ) is not None:
                            setattr(discovered_device, property_name, property_value)
                    ret.append(discovered_device)
        finally:
            if created_session:
                await session.close()

        _LOGGER.debug(log_formatter.format("exited, %i devices found"), len(ret))
        return ret

    @staticmethod
    async def rediscover(
        target: HDHomeRunDevice,
        session: Optional[aiohttp.ClientSession] = None,
        timeout: float = 2.5,
    ) -> HDHomeRunDevice:
        """Gather updated information about a device.

        N.B. the discover_url will be used if available. If not, one is built (UDP discovered devices
        won't have one).

        :param target: the device to refresh information for
        :param session: existing session
        :param timeout: timeout for the query
        :return: the updated device
        """
        log_formatter: Logger = Logger(prefix=f"{__class__.__name__}.")
        _LOGGER.debug(
            log_formatter.format("entered, target: %s, session: %s, timeout: %.2f"),
            target,
            session,
            timeout,
        )

        discover_url: str = getattr(target, "_discover_url", None)
        if discover_url is None:
            _LOGGER.debug(log_formatter.format("building discover_url"))
            discover_url = f"http://{target.ip}/discover.json"

        try:
            _LOGGER.debug(log_formatter.format("discover_url, %s"), discover_url)
            updated_device = await DiscoverHTTP.discover(
                discover_url=discover_url, session=session, timeout=timeout
            )
        except HDHomeRunHTTPDiscoveryNotAvailableError as err:
            _LOGGER.debug(
                log_formatter.format("error in HTTP discovery, %s: %s"), type(err), err
            )
        else:
            setattr(target, "_discover_url", discover_url)
            setattr(target, "_discovery_method", DiscoverMode.HTTP)
            updated_device = updated_device[0]
            for (
                _,
                property_name,
            ) in DiscoverHTTP.JSON_PROPERTIES_MAP.items():  # set the properties
                if (
                    property_value := getattr(updated_device, property_name, None)
                ) is not None:
                    setattr(target, property_name, property_value)

        _LOGGER.debug(log_formatter.format("exited"))
        return target


class DiscoverUDP:
    """Representation of using UDP for discovery."""

    DISCOVER_PORT: int = HDHOMERUN_DISCOVER_UDP_PORT

    @staticmethod
    async def discover(
        interface: Optional[str] = None,
        target: str = "255.255.255.255",
        timeout: float = 1,
    ) -> List[HDHomeRunDevice]:
        """Use the UDP protocol to broadcast for discovery.

        :param interface: the interface to use
        :param target: the broadcast address to use (this can also be an individual IP)
        :param timeout: timeout for the query
        :return: list of discovered devices
        """
        log_formatter: Logger = Logger(prefix=f"{__class__.__name__}.")
        _LOGGER.debug(
            log_formatter.format("entered, interface: %s, target: %s, timeout: %.2f"),
            interface,
            target,
            timeout,
        )
        loop = asyncio.get_event_loop()
        transport, protocol = await loop.create_datagram_endpoint(
            lambda: _DiscoverProtocol(
                target=target,
                interface=interface,
            ),
            local_addr=("0.0.0.0", 0),
        )

        try:
            _LOGGER.debug(
                log_formatter.format("waiting %s second%s for responses"),
                timeout,
                "s" if timeout != 1 else "",
            )
            await asyncio.sleep(timeout)
        finally:
            transport.close()

        _LOGGER.debug(
            log_formatter.format("exited, %i devices found"),
            len(protocol.discovered_devices),
        )
        return protocol.discovered_devices

    rediscover = discover  # rediscover is essentially the same as discover you just need to provide a specific IP


class _DiscoverProtocol(asyncio.DatagramProtocol):
    """Internal implementation of the discovery protocol."""

    discovered_devices: List[HDHomeRunDevice] = []

    TAG_PROPERTY_MAP: Dict[int, str] = {
        HDHOMERUN_TAG_BASE_URL: "_base_url",
        HDHOMERUN_TAG_DEVICE_AUTH_STR: "_device_auth_str",
        HDHOMERUN_TAG_DEVICE_ID: "_device_id",
        HDHOMERUN_TAG_DEVICE_TYPE: "_device_type",
        HDHOMERUN_TAG_LINEUP_URL: "_lineup_url",
        HDHOMERUN_TAG_TUNER_COUNT: "_tuner_count",
    }

    def __init__(
        self,
        port: int = DiscoverUDP.DISCOVER_PORT,
        interface: Optional[str] = None,
        target: str = "255.255.255.255",
    ) -> None:
        """Initialise."""
        self._interface: Optional[str] = interface
        self._log_formatter: Logger = Logger(prefix=f"{__class__.__name__}.")
        self._target = (target, port)
        self._transport: Optional[asyncio.DatagramTransport] = None

        self.discovered_devices = []

    def connection_made(self, transport: asyncio.DatagramTransport) -> None:
        """Respond when a conection is made.

        :param transport: UDP transport
        :return: None
        """
        # region #-- initialise the socket --#
        self._transport = transport
        sock: Optional[socket.socket] = self._transport.get_extra_info("socket")
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        # endregion

        # bind to an interface if necessary
        if self._interface is not None:
            sock.setsockopt(
                socket.SOL_SOCKET, socket.SO_BINDTODEVICE, self._interface.encode()
            )

        self.do_discover()

    def connection_lost(self, exc: Exception | None) -> None:
        """React to the connection being lost."""

    def datagram_received(self, data: bytes, addr: tuple[str, int]) -> None:
        """Process the data received.

        :param data: data received in response to the message
        :param addr: where the data came from
        :return: None
        """
        ip_address, _ = addr

        # region #-- initialise the device object --#
        discovered_device: HDHomeRunDevice = HDHomeRunDevice(host=ip_address)
        response = HDHomeRunProtocol.parse_response(data)
        # endregion

        # region #-- check that the tuner was initialised with a discovery response --#
        if response.get("header") != HDHOMERUN_TYPE_DISCOVER_RPY:
            raise ValueError
        # endregion

        # region #-- build the properties --#
        for tag in response.get("data", {}).keys():
            property_value: Optional[int | str] = None
            if tag == HDHOMERUN_TAG_BASE_URL:
                property_value = (
                    response.get("data", {}).get(HDHOMERUN_TAG_BASE_URL, b"").decode()
                )
            elif tag == HDHOMERUN_TAG_DEVICE_AUTH_STR:
                property_value = (
                    response.get("data", {})
                    .get(HDHOMERUN_TAG_DEVICE_AUTH_STR, b"")
                    .decode()
                )
            elif tag == HDHOMERUN_TAG_DEVICE_ID:
                (property_value,) = struct.unpack(
                    ">L", response.get("data", {}).get(HDHOMERUN_TAG_DEVICE_ID, b"")
                )
                property_value = f"{property_value:04X}"
            elif tag == HDHOMERUN_TAG_DEVICE_TYPE:
                (property_value,) = struct.unpack(
                    ">L", response.get("data", {}).get(HDHOMERUN_TAG_DEVICE_TYPE, b"")
                )
            elif tag == HDHOMERUN_TAG_LINEUP_URL:
                property_value = (
                    response.get("data", {}).get(HDHOMERUN_TAG_LINEUP_URL, b"").decode()
                )
            elif tag == HDHOMERUN_TAG_TUNER_COUNT:
                (property_value,) = struct.unpack(
                    ">B", response.get("data", {}).get(HDHOMERUN_TAG_TUNER_COUNT, b"")
                )

            if property_value:
                if property_name := _DiscoverProtocol.TAG_PROPERTY_MAP.get(tag, None):
                    setattr(discovered_device, property_name, property_value)
        # endregion

        self.discovered_devices.append(discovered_device)

    def do_discover(self) -> None:
        """Send the packets."""
        _LOGGER.debug(self._log_formatter.format("entered"))

        pkt_type: bytes = struct.pack(">H", HDHOMERUN_TYPE_DISCOVER_REQ)
        payload_data: List[Tuple[int, bytes]] = [
            (HDHOMERUN_TAG_DEVICE_TYPE, struct.pack(">I", HDHOMERUN_DEVICE_TYPE_TUNER)),
            (HDHOMERUN_TAG_DEVICE_ID, struct.pack(">I", HDHOMERUN_DEVICE_ID_WILDCARD)),
        ]
        req = HDHomeRunProtocol.build_request(
            packet_payload=payload_data, packet_type=pkt_type
        )

        _LOGGER.debug(
            self._log_formatter.format("sending discovery packet: %s, %s"),
            self._target,
            req.hex(),
        )
        self._transport.sendto(req, self._target)

        _LOGGER.debug(self._log_formatter.format("exited"))

    def error_received(self, exc: Exception) -> None:
        """React to an error being received."""
