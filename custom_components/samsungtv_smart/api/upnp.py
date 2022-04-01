# Smartthings TV integration#
from aiohttp import ClientSession
import async_timeout
import logging
from typing import Optional
import xml.etree.ElementTree as ET

DEFAULT_TIMEOUT = 0.2

_LOGGER = logging.getLogger(__name__)


class upnp:
    def __init__(self, host, session: Optional[ClientSession] = None):
        self._host = host
        self._connected = False
        if session:
            self._session = session
            self._managed_session = False
        else:
            self._session = ClientSession()
            self._managed_session = True

    def __enter__(self):
        return self

    async def _SOAPrequest(self, action, arguments, protocole):
        headers = {
            "SOAPAction": f'"urn:schemas-upnp-org:service:{protocole}:1#{action}"',
            "content-type": "text/xml",
        }
        body = f"""<?xml version="1.0" encoding="utf-8"?>
                <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                    <s:Body>
                    <u:{action} xmlns:u="urn:schemas-upnp-org:service:{protocole}:1">
                        <InstanceID>0</InstanceID>
                        {arguments}
                    </u:{action}>
                    </s:Body>
                </s:Envelope>"""
        response = None
        try:
            async with async_timeout.timeout(DEFAULT_TIMEOUT):
                async with self._session.post(
                    f"http://{self._host}:9197/upnp/control/{protocole}1",
                    headers=headers,
                    data=body,
                    raise_for_status=True,
                ) as resp:
                    response = await resp.content.read()
                    self._connected = True
        except:
            self._connected = False

        return response

    @property
    def connected(self):
        return self._connected

    async def async_get_volume(self):
        response = await self._SOAPrequest(
            "GetVolume", "<Channel>Master</Channel>", "RenderingControl"
        )
        if response is None:
            return None

        tree = ET.fromstring(response.decode("utf8"))
        volume = None
        for elem in tree.iter(tag="CurrentVolume"):
            volume = elem.text
        return volume

    async def async_set_volume(self, volume):
        await self._SOAPrequest(
            "SetVolume",
            f"<Channel>Master</Channel><DesiredVolume>{volume}</DesiredVolume>",
            "RenderingControl",
        )

    async def async_get_mute(self):
        response = await self._SOAPrequest(
            "GetMute", "<Channel>Master</Channel>", "RenderingControl"
        )
        if response is None:
            return None

        tree = ET.fromstring(response.decode("utf8"))
        mute = None
        for elem in tree.iter(tag="CurrentMute"):
            mute = elem.text
        if mute is None:
            return None
        return int(mute) != 0

    async def async_set_current_media(self, url):
        """ Set media to playback and play it."""
        try:
            await self._SOAPrequest(
                "SetAVTransportURI",
                f"<CurrentURI>{url}</CurrentURI><CurrentURIMetaData></CurrentURIMetaData>",
                "AVTransport",
            )
            await self._SOAPrequest("Play", "<Speed>1</Speed>", "AVTransport")
        except Exception:
            pass

    async def async_play(self):
        """ Play media that was already set as current."""
        try:
            await self._SOAPrequest("Play", "<Speed>1</Speed>", "AVTransport")
        except Exception:
            pass
