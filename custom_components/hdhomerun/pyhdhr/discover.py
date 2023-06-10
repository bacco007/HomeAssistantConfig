"""Discovery for HDHomeRun devices."""

# region #-- imports --#
from __future__ import annotations

import asyncio
import logging
import socket
import struct
from typing import List, Tuple

import aiohttp

from .const import (
    HDHOMERUN_DEVICE_ID_WILDCARD,
    HDHOMERUN_DEVICE_TYPE_TUNER,
    HDHOMERUN_DISCOVER_UDP_PORT,
    HDHOMERUN_TAG_DEVICE_ID,
    HDHOMERUN_TAG_DEVICE_TYPE,
    HDHOMERUN_TYPE_DISCOVER_REQ,
    HDHOMERUN_TYPE_DISCOVER_RPY,
    DiscoverMode,
)
from .device import DevicePaths, HDHomeRunDevice
from .exceptions import HDHomeRunDeviceNotFoundError
from .logger import Logger
from .protocol import HDHomeRunProtocol

# endregion

_LOGGER = logging.getLogger(__name__)

DEF_BROADCAST_ADDRESS: str = "255.255.255.255"


class Discover:
    """Generic discovery representation."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        broadcast_address: str = DEF_BROADCAST_ADDRESS,
        interface: str | None = None,
        mode: DiscoverMode = DiscoverMode.AUTO,
    ) -> None:
        """Initialise."""
        self._log_formatter: Logger = Logger()
        self._broadcast_address: str = broadcast_address
        self._created_session: bool = False
        self._interface: str | None = interface
        self._mode: DiscoverMode = DiscoverMode(mode)
        self._session: aiohttp.ClientSession | None = session or None
        self._udp_timeout: float = 1

    async def async_discover(self) -> List[HDHomeRunDevice]:
        """Carry out a discovery."""
        _LOGGER.debug(self._log_formatter.format("entered"))
        discovered_devices: List[HDHomeRunDevice] = []

        if self._mode in (DiscoverMode.AUTO, DiscoverMode.UDP):
            _LOGGER.debug(self._log_formatter.format("carrying out UDP discovery"))
            loop = asyncio.get_event_loop()
            transport, protocol = await loop.create_datagram_endpoint(
                lambda: _DiscoverProtocol(
                    target=self._broadcast_address,
                    interface=self._interface,
                ),
                local_addr=("0.0.0.0", 0),
            )

            try:
                _LOGGER.debug(
                    self._log_formatter.format("waiting %s second%s for responses"),
                    self._udp_timeout,
                    "s" if self._udp_timeout != 1 else "",
                )
                await asyncio.sleep(self._udp_timeout)
            finally:
                transport.close()

            discovered_devices.extend(protocol.discovered_devices)
            _LOGGER.debug(
                self._log_formatter.format("UDP discovery found %d devices"),
                len(discovered_devices),
            )

        if self._mode in (DiscoverMode.AUTO, DiscoverMode.HTTP):
            if self._broadcast_address == DEF_BROADCAST_ADDRESS:
                # region #-- query the SiliconDust online service --#
                try:
                    _LOGGER.debug(
                        self._log_formatter.format("querying the online service")
                    )
                    url: str = "https://ipv4-api.hdhomerun.com/discover"
                    response: aiohttp.ClientResponse = await self._session.get(
                        url=url,
                        raise_for_status=True,
                    )
                except aiohttp.ClientConnectionError:
                    _LOGGER.warning("%s is unavailable for querying", url)
                except Exception as err:  # pylint: disable=broad-except
                    _LOGGER.error(
                        self._log_formatter.format(
                            "error in HTTP discovery; type: %s, %s"
                        ),
                        type(err),
                        err,
                    )
                # endregion

                # region #-- upgrade to existing device to HTTP or add new ones in --#
                _LOGGER.debug(
                    self._log_formatter.format(
                        "matching up UDP results and those from the online service"
                    )
                )
                already_discovered = [device.ip for device in discovered_devices]
                resp_json = await response.json()
                for device in resp_json:
                    if (host := device.get("LocalIP", None)) is not None:
                        try:
                            idx: int = already_discovered.index(host)
                        except ValueError:
                            hdhr_device = HDHomeRunDevice(host=host)
                            setattr(hdhr_device, "_discovery_method", DiscoverMode.HTTP)
                            _LOGGER.debug(
                                self._log_formatter.format(
                                    "adding %s to discovered devices"
                                ),
                                host,
                            )
                            discovered_devices.append(hdhr_device)
                        else:
                            _LOGGER.debug(
                                self._log_formatter.format(
                                    "updating %s to use HTTP discovery"
                                ),
                                host,
                            )
                            setattr(
                                discovered_devices[idx],
                                "_discovery_method",
                                DiscoverMode.HTTP,
                            )
                # endregion

            # region #-- check local discovery to see if HTTP is available --#
            def _find_in_discovered_devices(device_ip: str) -> int | None:
                """Find a device in discovered devices."""
                ret: List[int] = [
                    idx
                    for idx, device in enumerate(discovered_devices)
                    if device.ip == device_ip
                ]
                if ret:
                    return ret[0]

                return None

            if (
                self._broadcast_address != DEF_BROADCAST_ADDRESS
                and self._mode is DiscoverMode.HTTP
            ):
                _LOGGER.debug(
                    self._log_formatter.format("creating dummy found device for %s"),
                    self._broadcast_address,
                )
                discovered_devices = [HDHomeRunDevice(host=self._broadcast_address)]
                setattr(discovered_devices[0], "_discovery_method", DiscoverMode.HTTP)
            already_discovered = [device.ip for device in discovered_devices]
            for device_ip in already_discovered:
                discovered_idx = _find_in_discovered_devices(device_ip)
                if discovered_idx is not None:
                    try:
                        _LOGGER.debug(
                            self._log_formatter.format(
                                "attempting to reach local discovery for %s"
                            ),
                            device_ip,
                        )
                        url = f"http://{device_ip}/{DevicePaths.DISCOVER.value}"
                        response: aiohttp.ClientResponse = await self._session.get(
                            url=url,
                            raise_for_status=True,
                        )
                    except (aiohttp.ClientConnectionError, aiohttp.ClientResponseError) as exc:
                        _LOGGER.debug(self._log_formatter.format("%s"), exc)
                        if (
                            discovered_devices[discovered_idx].discovery_method
                            is DiscoverMode.HTTP
                        ):
                            _LOGGER.debug(
                                self._log_formatter.format(
                                    "%s is not available locally over HTTP, setting to UDP only"
                                ),
                                device_ip,
                            )
                            setattr(
                                discovered_devices[discovered_idx],
                                "_discovery_method",
                                DiscoverMode.UDP,
                            )
                    else:
                        _LOGGER.debug(
                            self._log_formatter.format(
                                "setting %s to use HTTP mode and setting the session"
                            ),
                            device_ip,
                        )
                        setattr(
                            discovered_devices[discovered_idx],
                            "_discovery_method",
                            DiscoverMode.HTTP,
                        )
                        setattr(
                            discovered_devices[discovered_idx],
                            "_session",
                            self._session,
                        )
            # endregion

        if self._created_session:
            await self._session.close()

        if not discovered_devices:
            if self._broadcast_address == DEF_BROADCAST_ADDRESS:
                raise HDHomeRunDeviceNotFoundError(device="no devices")

            raise HDHomeRunDeviceNotFoundError(device=self._broadcast_address)

        _LOGGER.debug(
            self._log_formatter.format("discovered devices: %s"),
            discovered_devices,
        )
        _LOGGER.debug(self._log_formatter.format("exited"))
        return discovered_devices


class _DiscoverProtocol(asyncio.DatagramProtocol):
    """Internal implementation of the discovery protocol."""

    discovered_devices: List[HDHomeRunDevice] = []

    def __init__(
        self,
        interface: str | None,
        target: str,
        port: int = HDHOMERUN_DISCOVER_UDP_PORT,
    ) -> None:
        """Initialise."""
        self._interface: str | None = interface
        self._log_formatter: Logger = Logger(prefix=f"{__class__.__name__}.")
        self._target = (target, port)
        self._transport: asyncio.DatagramTransport | None = None

        self.discovered_devices = []

    def connection_made(self, transport: asyncio.DatagramTransport) -> None:
        """Respond when a conection is made.

        :param transport: UDP transport
        :return: None
        """
        # region #-- initialise the socket --#
        self._transport = transport
        sock: socket.socket = self._transport.get_extra_info("socket")
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

    def datagram_received(self, data: bytes, addr: Tuple[str, int]) -> None:
        """Process the data received.

        :param data: data received in response to the message
        :param addr: where the data came from
        :return: None
        """
        ip_address, _ = addr

        if ip_address not in [device.ip for device in self.discovered_devices]:
            # region #-- initialise the device object --#
            discovered_device: HDHomeRunDevice = HDHomeRunDevice(host=ip_address)
            setattr(discovered_device, "_discovery_method", DiscoverMode.UDP)
            response = HDHomeRunProtocol.parse_response(data)
            _LOGGER.debug("UDP response: %s", response)
            # endregion

            # region #-- check that the tuner was initialised with a discovery response --#
            if response.get("header") != HDHOMERUN_TYPE_DISCOVER_RPY:
                raise ValueError
            # endregion

            setattr(discovered_device, "_processed_datagram", response)

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
