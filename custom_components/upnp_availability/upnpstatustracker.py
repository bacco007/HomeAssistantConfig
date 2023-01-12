import asyncio
import logging
from datetime import datetime, timedelta
from ipaddress import ip_address
from typing import Dict, List, Optional
from urllib.parse import urljoin
from xml.etree.ElementTree import ParseError

import attr
from async_upnp_client.advertisement import SsdpAdvertisementListener
from async_upnp_client.aiohttp import AiohttpRequester
from async_upnp_client.client_factory import UpnpFactory
from async_upnp_client.exceptions import UpnpError
from async_upnp_client.search import async_search

_LOGGER = logging.getLogger(__name__)

# from async_upnp_client
NS = {
    "soap_envelope": "http://schemas.xmlsoap.org/soap/envelope/",
    "device": "urn:schemas-upnp-org:device-1-0",
    "service": "urn:schemas-upnp-org:service-1-0",
    "event": "urn:schemas-upnp-org:event-1-0",
    "control": "urn:schemas-upnp-org:control-1-0",
}

ROOT_DEVICE = "upnp:rootdevice"


@attr.s
class Icon:
    mimetype = attr.ib()
    width = attr.ib()
    height = attr.ib()
    depth = attr.ib()
    url = attr.ib()


def parse_icons(baseurl: str, dev) -> List[Icon]:
    """Parse and return a list of icons for the given device.

    Currently unused by the homeassistant integration as I have no
    idea how to set an icon for the lovelace based on this.

    This could be upstreamed to async_upnp_client.
    """
    icons = []
    for icon in dev.device_info.xml.findall(".//device:icon", namespaces=NS):
        width = icon.findtext(".//device:width", 0, namespaces=NS)
        height = icon.findtext(".//device:height", 0, namespaces=NS)
        depth = icon.findtext(".//device:depth", 0, namespaces=NS)
        mimetype = icon.findtext(".//device:mimetype", None, namespaces=NS)
        url = icon.findtext(".//device:url", None, namespaces=NS)

        icon_url = urljoin(baseurl, url)

        icon = Icon(
            mimetype=mimetype,
            width=width,
            height=height,
            depth=depth,
            url=icon_url,
        )

        icons.append(icon)

    return icons


@attr.s
class Device:
    udn = attr.ib(type=str)
    url = attr.ib(type=str)
    last_update = attr.ib(type=datetime, default=datetime.utcnow())
    alive = attr.ib(type=bool, default=False)
    name = attr.ib(type=str, default=None)

    max_age = attr.ib(default=1800)

    info = attr.ib(factory=dict)
    icons = attr.ib(factory=list, repr=False)

    expire_timer = attr.ib(default=None, repr=False)
    expire_callback = attr.ib(default=None, repr=False)

    def reset_or_cancel_timer(self):
        if self.expire_timer is not None:
            self.expire_timer.cancel()

        # reset the timer if we are alive.
        if self.alive:
            loop = asyncio.get_event_loop()
            self.expire_timer = loop.call_later(
                self.max_age, self.expire_callback, self
            )

    @property
    def icon(self) -> Optional[str]:
        """Return the url for largest icon."""
        # mypy doesn't get the type correct (error: "_T" has no attribute "width")
        # so we ignore type checks for this and the url access below
        icons = list(reversed(sorted(self.icons, key=lambda x: x.width)))  # type: ignore  # noqa: E501
        if not icons:
            return None

        largest_icon = icons.pop()
        return largest_icon.url  # type: ignore

    def set_alive(self, alive: bool):
        self.alive = alive
        self.last_update = datetime.utcnow()
        self.reset_or_cancel_timer()

    @property
    def since_last_update(self) -> timedelta:
        """Return time timedelta since last update."""
        return datetime.utcnow() - self.last_update

    async def fetch_info(self):
        requester = AiohttpRequester()
        factory = UpnpFactory(requester)

        device = await factory.async_create_device(self.url)
        self.name = device.name
        # FIXME this depends currently on async_upnp_client internals..
        infodict = device.device_info._asdict()
        _LOGGER.debug("Got device info: %s from url %s", infodict, self.url)

        # we need to replace USN with udn from the XML.
        if self.udn != device.udn:
            _LOGGER.warning("Got different UDN, replacing..")
            self.udn = device.udn

        self.info = {k: v for k, v in infodict.items() if k != "xml"}
        self.info["icon"] = self.icon

        self.icons: List[Icon] = parse_icons(self.info["url"], device)


class UPnPStatusTracker:
    def __init__(
        self,
        *,
        new_device_cb=None,
        state_changed_cb=None,
        max_age_override=None,
        source_addresses=None
    ):
        """Creates a status tracker.

        :param new_device_cb: coroutine to be awaited when new device is discovered.
        :param state_changed_cb: coroutine to be awaited when the device state changes.
        :param max_age_override: if set, overrides the device's max-age for expiration.
        :param source_addresses: IPv4 addresses to use as source addresses.
        """
        self.listeners: Dict[Optional[str], SsdpAdvertisementListener] = {}
        self.source_addresses = source_addresses
        self.devices = {}  # type: Dict[str, Device]
        self.state_changed_cb = state_changed_cb
        self.new_device_cb = new_device_cb
        self.max_age_override = max_age_override
        _LOGGER.debug("Initializing with source addresses: %s", source_addresses)

    @staticmethod
    def _get_max_age(headers):
        """Reads the max-age from cache-control header."""
        max_age = 1800
        if "CACHE-CONTROL" in headers:
            cc = headers["CACHE-CONTROL"]
            if "=" not in cc:
                return max_age
            else:
                k, v = cc.split("=", maxsplit=1)
                k = k.strip().lower()
                v = v.strip().lower()

                if k != "max-age":
                    _LOGGER.error(
                        "Expected max-age in cache control, got %s - %s", k, cc
                    )
                    return max_age

                return int(v)

        return max_age

    async def find_devices(self, async_callback=None):
        """Search for devices in the local network.

        This can be used to initialize the list of currently available devices
        without waiting for them to send an alive message.
        """
        _LOGGER.debug("Going to request upnp:rootdevices in the network..")
        if async_callback is None:
            async_callback = self.handle_alive

        for source_address in self.source_addresses:
            _LOGGER.debug("Starting device search using addr %s", source_address)
            try:
                addr = ip_address(source_address)
            except ValueError:
                _LOGGER.warning("Source address is not a valid IP address")
                continue

            if addr.version == 6:
                split_addr = source_address.split("%")
                source_address = (split_addr[0], 0, 0, int(split_addr[1]))
            else:
                source_address = (addr, 0)

            await self._search(source_address, async_callback)

    async def _search(self, addr, async_callback):
        try:
            await async_search(
                search_target=ROOT_DEVICE,
                source=addr,
                async_callback=async_callback,
            )
        except (OSError, UpnpError) as ex:
            _LOGGER.warning("Unable to search using addr %s: %s", addr, ex)

    async def handle_alive(self, headers):
        """Handle alive messages from async_upnp_client.

        This will add a device to `self.devices` if one with the same UDN
        does not yet exist. The expiration is scheduled based on the device-informed
        cache-control directive (defaulting to 1800 seconds, if missing).

        Each consecutive alive message will reset the expiration timer.
        """
        if "NT" in headers and headers["NT"] != ROOT_DEVICE:
            return

        if self.max_age_override is not None:
            max_age = self.max_age_override
        else:
            max_age = self._get_max_age(headers)

        udn = headers["_udn"]
        if udn not in self.devices:
            _LOGGER.debug("Got alive for %s, trying to fetch info", udn)
            dev = Device(
                url=headers["Location"],
                udn=headers["_udn"],
                max_age=max_age,
                expire_callback=self.handle_expired,
            )
            self.devices[udn] = dev
            try:
                await dev.fetch_info()
                if self.new_device_cb:
                    await self.new_device_cb(dev)
            # TODO: should fetching be re-tried?
            except (UpnpError, TimeoutError, ParseError) as ex:
                _LOGGER.error("Unable to fetch device info for %s: %s", dev, ex)
                return

        dev = self.devices[udn]
        dev.set_alive(True)

        _LOGGER.debug("[ALIVE] %s", dev)
        if self.state_changed_cb:
            await self.state_changed_cb(dev)

    async def handle_update(self, headers):
        if headers["NT"] != ROOT_DEVICE:
            return

        udn = headers["_udn"]
        if udn not in self.devices:
            _LOGGER.debug("Got update from unknown device: %s", headers)
            return

        dev = self.devices[udn]

        _LOGGER.debug("[UPDATE] %s" % dev)

    def handle_expired(self, dev):
        """Callback to handle expiration."""
        _LOGGER.debug("[EXPIRE] %s", dev)
        dev.set_alive(False)
        if self.state_changed_cb:
            asyncio.ensure_future(self.state_changed_cb(dev))

    async def handle_bye(self, headers):
        if headers["NT"] != ROOT_DEVICE:
            return

        udn = headers["_udn"]
        if udn not in self.devices:
            _LOGGER.error("Got bye from unknown device: %s", udn)
            return

        dev = self.devices[udn]
        dev.set_alive(False)

        _LOGGER.debug("[BYEBYE] %s", dev)
        if self.state_changed_cb:
            await self.state_changed_cb(dev)

    async def listen(self):
        if self.listeners:
            _LOGGER.error("Listen has already been called, ignoring.")
            return

        for srcip in self.source_addresses:
            self.listeners[srcip] = listener = SsdpAdvertisementListener(
                async_on_alive=self.handle_alive,
                async_on_byebye=self.handle_bye,
                async_on_update=self.handle_update,
            )
            await listener.async_start()

    async def stop(self):
        for listener in self.listeners.values():
            await listener.async_stop()

    async def print_devices(self):
        print("== Currently active devices ==")
        for dev in self.devices.values():
            print(
                "%s - alive? %s - last updated in %s"
                % (dev.name, dev.alive, dev.since_last_update)
            )
