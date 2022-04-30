"""Discover/Control UDP/TCP Protocol

N.B. Implementation follows the instructions here: https://github.com/Silicondust/libhdhomerun
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
import string
import struct
import zlib
from typing import (
    Any,
    Dict,
    List,
    Optional,
    Tuple,
)

from .const import (
    HDHOMERUN_CONTROL_TCP_PORT,
    HDHOMERUN_MAX_PACKET_SIZE,
    HDHOMERUN_TAG_GETSET_NAME,
    HDHOMERUN_TAG_GETSET_VALUE,
    HDHOMERUN_TYPE_GETSET_REQ,
    HDHOMERUN_TYPE_GETSET_RPY,
)

_LOGGER = logging.getLogger(__name__)


class HDHomeRunProtocol:
    """Representation of the protocol"""

    def __init__(self, host: str, connection_timeout: int = 2.5, query_timeout: int = 2.5) -> None:
        """Constructor"""

        self._connection_timeout: int = connection_timeout
        self._host: str = host
        self._lock_query: Optional[asyncio.Lock] = None
        self._port: int = HDHOMERUN_CONTROL_TCP_PORT
        self._query_timeout: int = query_timeout
        self._reader: Optional[asyncio.StreamReader] = None
        self._writer: Optional[asyncio.StreamWriter] = None

    @staticmethod
    def encode_tlv(payload: List[Tuple[int, bytes | str]]) -> bytes:
        """Prepare the TLV values to send with the packet

        :param payload: a list of the tag, value items
        :return: a bytes object representing the TLV
        """

        ret: bytes = b""
        for t, v in payload:
            tag: bytes = struct.pack(">B", t)
            length: bytes
            value: bytes

            # region #-- format the value --#
            if isinstance(v, str):
                if all([c in string.hexdigits for c in v]):  # hex string passed in
                    value = bytes.fromhex(v)
                else:
                    v += "\00"
                    value = bytes(v, "utf8")
            else:
                value = v
            # endregion

            # region #-- calculate the length --#
            if len(value) <= 127:
                length = struct.pack(">B", len(value))
            else:
                length = struct.pack(">B", len(value) | 0x80)
                length += struct.pack(">B", len(value) >> 7)
            # endregion

            ret += tag + length + value

        return ret

    @staticmethod
    def build_crc(payload: bytes) -> bytes:
        """Build the CRC for the given payload

        :param payload: the packet to be sent
        :return: Little-endian CRC32
        """

        return struct.pack("<L", zlib.crc32(payload))

    @staticmethod
    def build_request(packet_payload: List[Tuple[int, bytes | str]], packet_type: bytes) -> bytes:
        """Build the entire request to send on the network

        :param packet_payload: the tag, value pairs to send
        :param packet_type: the packet type as defined by the protocol
        :return: a bytes object to send
        """

        payload: bytes = HDHomeRunProtocol.encode_tlv(payload=packet_payload)
        pkt: bytes = packet_type + struct.pack(">H", len(payload)) + payload
        crc: bytes = HDHomeRunProtocol.build_crc(pkt)

        return pkt + crc

    @staticmethod
    def parse_response(data: bytes) -> Optional[Dict[str, Any]]:
        """Read the response given and break it up into sections

        :param data: the response received from the device
        :return: a dictionary in the form
            {
                "header": Any,
                "length": Any,
                "data": {
                    "raw": <the data from the response sent by the device>
                    "tag": <data> ...
                }
            }
        """

        ret = {}
        cur_pos: int = 0

        # region #-- get the packet header  --#
        pkt_type: bytes = struct.unpack_from(">H", data, offset=cur_pos)[0]
        ret["header"] = pkt_type
        cur_pos += struct.calcsize(">H")
        # endregion

        # region #-- get the length --#
        length: bytes = struct.unpack_from(">H", data, offset=cur_pos)[0]
        ret["length"] = length
        cur_pos += struct.calcsize(">H")
        # endregion

        # region #-- get the response --#
        resp: bytes = data[cur_pos:struct.calcsize("<L") * -1]
        ret["data"] = {"raw": resp}
        # region #-- decode the response --#
        data_pos: int = 0
        while data_pos < len(ret["data"]["raw"]):
            tag: str = struct.unpack_from(">B", ret["data"]["raw"], offset=data_pos)[0]
            data_pos += struct.calcsize(">B")
            data_length: int = struct.unpack_from(">B", ret["data"]["raw"], offset=data_pos)[0]
            data_pos += struct.calcsize(">B")
            if data_length & 0x80:  # two byte length
                data_length = data_length & 0x7F
                data_length |= struct.unpack_from(">B", ret["data"]["raw"], offset=data_pos)[0] << 7
                data_pos += struct.calcsize(">B")
            value: bytes = struct.unpack_from(f">{data_length}s", ret["data"]["raw"], offset=data_pos)[0]
            data_pos += data_length
            ret["data"][tag] = value
        # endregion
        # endregion

        # region #-- validate the CRC --#
        crc: bytes = data[struct.calcsize("<L") * -1:]
        match_crc: bytes = HDHomeRunProtocol.build_crc(data[:struct.calcsize("<L") * -1])
        if crc != match_crc:
            raise ValueError
        # endregion

        return ret or None

    async def _execute_query(self, request: bytes) -> Optional[Dict[str, Any]]:
        """Send the request to the device using the TCP control channel

        :param request: the request to send
        :return: the reaponse as parsed by the `parse_response` function
        """

        self._writer.write(request)
        await self._writer.drain()

        response = HDHomeRunProtocol.parse_response(data=await self._reader.read(HDHOMERUN_MAX_PACKET_SIZE))

        # region #-- validate the packet header  --#
        if response.get("header") != HDHOMERUN_TYPE_GETSET_RPY:
            raise ValueError
        # endregion

        return response

    async def _get_set_req(self, value: str, timeout: Optional[int] = None) -> Dict[int | str, bytes]:
        """Build the query ready to send on to the device

        :param value: the variable to query
        :param timeout: timeout for the request
        :return: dictionary containing the response in the form
                    {
                        <tag|variable>: <response data>
                    }
        """

        pkt_type: bytes = struct.pack(">H", HDHOMERUN_TYPE_GETSET_REQ)
        payload_data: List[Tuple[int, str]] = [
            (HDHOMERUN_TAG_GETSET_NAME, value),
        ]
        req: bytes = HDHomeRunProtocol.build_request(packet_payload=payload_data, packet_type=pkt_type)

        return await self._query(request=req, timeout=timeout)

    async def _query(self, request: bytes, timeout: Optional[int] = None) -> Optional[Dict[str, bytes]]:
        """Create the connection to the device, lock, send and close

        :param request: full request to send to the device
        :param timeout: timeout for the request
        :return: the parsed response
        """

        if not self._lock_query:
            self._lock_query = asyncio.Lock()

        ret = None
        async with self._lock_query:
            try:
                await self._async_connect()
            except Exception as err:
                await self._async_close()
                _LOGGER.error(err)
            else:
                ret = await asyncio.wait_for(
                    self._execute_query(request=request),
                    timeout=timeout or self._query_timeout
                )
                await self._async_close()

        return ret

    async def _async_close(self) -> None:
        """Close the connection to the device"""

        writer = self._writer
        self._reader = self._writer = None
        if writer:
            writer.close()
            with contextlib.suppress(Exception):
                await writer.wait_closed()

    async def _async_connect(self, timeout: Optional[int] = None) -> None:
        """Connect to the device"""

        if self._writer:  # the writer is already in use somehow
            return

        task = asyncio.open_connection(host=self._host, port=self._port)
        self._reader, self._writer = await asyncio.wait_for(task, timeout=timeout or self._connection_timeout)

    async def get_hwmodel(self, timeout: Optional[int] = None) -> Dict[str, bytes]:
        """Get the model number

        :param timeout: timeout for the query
        :return: details as parsed by the `parse_response` function
        """

        value_name = "/sys/hwmodel"
        return await self._get_set_req(value=value_name, timeout=timeout)

    async def get_model(self, timeout: Optional[int] = None) -> Dict[str, bytes]:
        """Get the firmware name

        :param timeout: timeout for the query
        :return: details as parsed by the `parse_response` function
        """

        value_name = "/sys/model"
        return await self._get_set_req(value=value_name, timeout=timeout)

    async def get_tuner_current_channel(self, tuner_idx, timeout: Optional[int] = None) -> Tuple[Dict[str, bytes], ...]:
        """Get the current channel information from the tuner

        :param tuner_idx: the index number of the tuner
        :param timeout: timeout for the query
        :return: a tuple of tuner details as parsed by the `parse_response` function
        """

        details = [
            self._get_set_req(value=f"/tuner{tuner_idx}/program", timeout=timeout),
            self._get_set_req(value=f"/tuner{tuner_idx}/streaminfo", timeout=timeout),
            self._get_set_req(value=f"/tuner{tuner_idx}/target", timeout=timeout),
        ]

        channel_details = await asyncio.gather(*details)

        return channel_details

    async def get_tuner_status(self, tuner_idx: int, timeout: Optional[int] = None) -> Dict[str, bytes]:
        """Get the current tuner status

        :param tuner_idx: index number of the tuner
        :param timeout: timeout for the query
        :return: details as parsed by the `parse_response` function
        """

        if tuner_idx < 0:
            raise ValueError

        value_name: str = f"/tuner{tuner_idx}/status"
        return await self._get_set_req(value=value_name, timeout=timeout)

    async def get_version(self, timeout: Optional[int] = None) -> Dict[str, bytes]:
        """Get the firmware version

        :param timeout: timeout for the query
        :return: details as parsed by the `parse_response` function
        """

        value_name = "/sys/version"
        return await self._get_set_req(value=value_name, timeout=timeout)

    async def get_available_options(self, timeout: Optional[int] = None) -> List[str]:
        """Get the available variables that can be set/queried on the device

        :param timeout: timeout for the query
        :return: a list of the available variables that can be set/queried on the device
        """

        ret: List[str] = []
        value_name: str = "help"

        b_help: Dict[int | str, bytes] = await self._get_set_req(value=value_name, timeout=timeout)
        key: str = b_help.get("data", {})[HDHOMERUN_TAG_GETSET_NAME].decode()
        if key.rstrip("\0") == value_name:
            available_options: List[str] = b_help.get("data", {})[HDHOMERUN_TAG_GETSET_VALUE].decode().split("\n")
            ret = [
                option
                for option in available_options if option.startswith("/")
            ]

        return ret
