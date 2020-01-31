"""The Apple TV integration."""
import asyncio
import logging
from random import randrange
from functools import partial
from typing import Sequence, TypeVar, Union

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import discovery
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv
from homeassistant.const import (
    CONF_NAME,
    CONF_HOST,
    EVENT_HOMEASSISTANT_STOP,
)

from .const import (
    DOMAIN, CONF_ADDRESS, CONF_IDENTIFIER, CONF_PROTOCOL,
    CONF_CREDENTIALS, CONF_CREDENTIALS_MRP, CONF_CREDENTIALS_DMAP,
    CONF_CREDENTIALS_AIRPLAY, CONF_START_OFF, SOURCE_INVALID_CREDENTIALS
)

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = "Apple TV"

BACKOFF_TIME_UPPER_LIMIT = 600  # Ten minutes

NOTIFICATION_TITLE = "Apple TV Notification"
NOTIFICATION_ID = "apple_tv_notification"

T = TypeVar("T")  # pylint: disable=invalid-name


# This version of ensure_list interprets an empty dict as no value
def ensure_list(value: Union[T, Sequence[T]]) -> Sequence[T]:
    """Wrap value in list if it is not one."""
    if value is None or (isinstance(value, dict) and not value):
        return []
    return value if isinstance(value, list) else [value]


CREDENTIALS_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_CREDENTIALS_MRP): cv.string,
        vol.Optional(CONF_CREDENTIALS_DMAP): cv.string,
        vol.Optional(CONF_CREDENTIALS_AIRPLAY): cv.string,
    }
)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.All(
            ensure_list,
            [
                vol.Schema(
                    {
                        vol.Required(CONF_HOST): cv.string,
                        vol.Required(CONF_IDENTIFIER): cv.string,
                        vol.Required(CONF_PROTOCOL): vol.In(['DMAP', 'MRP']),
                        vol.Required(CONF_CREDENTIALS): CREDENTIALS_SCHEMA,
                        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
                        vol.Optional(CONF_START_OFF, default=False): cv.boolean,
                    }
                )
            ],
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass, config):
    """Set up the Apple TV integration."""
    if DOMAIN not in config:
        return True

    for conf in config[DOMAIN]:
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": config_entries.SOURCE_IMPORT},
                data=conf,
            )
        )

    return True


async def async_setup_entry(hass, entry):
    """Set up a config entry for Apple TV."""
    identifier = entry.data[CONF_IDENTIFIER]
    manager = AppleTVManager(hass, entry)
    hass.data.setdefault(DOMAIN, {})[identifier] = manager

    @callback
    def on_hass_stop(event):
        """Stop push updates when hass stops."""
        asyncio.ensure_future(manager.disconnect(), loop=hass.loop)

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, on_hass_stop)

    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(entry, "media_player")
    )

    hass.async_create_task(
        discovery.async_load_platform(hass, "remote", DOMAIN, entry.data, entry.data)
    )

    return True


async def async_unload_entry(hass, entry):
    """Unload Twente Milieu config entry."""
    # TODO: This is not finished yet
    identifier = entry.data[CONF_IDENTIFIER]
    manager = hass.data[DOMAIN].pop(identifier)
    await manager.disconnect()

    await hass.config_entries.async_forward_entry_unload(entry, "media_player")

    # TODO: unload remote?

    return True


class AppleTVManager:
    """Connection and power manager for an Apple TV.

    An instance is used per device to share the same power state between
    several platforms. It also manages scanning and connection establishment
    in case of problems.
    """

    def __init__(self, hass, config_entry):
        """Initialize power manager."""
        self.config_entry = config_entry
        self.hass = hass
        self.listeners = []
        self.message = None
        self.atv = None
        self._is_on = config_entry.options.get(CONF_START_OFF, True)
        self._connection_attempts = 0
        self._connection_was_lost = False
        self._task = None

    async def init(self):
        """Initialize power management."""
        if self._is_on:
            await self.connect()

    def connection_lost(self, exception):
        """Device was unexpectedly disconnected."""
        _LOGGER.warning('Connection lost to Apple TV "%s"',
                        self.atv.service.name)

        self.atv = None
        self._connection_was_lost = True
        self._start_connect_loop()
        self._update_state(disconnected=True)

    def connection_closed(self):
        """Device connection was (intentionally) closed."""
        self.atv = None
        self._start_connect_loop()
        self._update_state(disconnected=True)

    async def connect(self):
        self._is_on = True
        self._start_connect_loop()

    async def disconnect(self):
        _LOGGER.debug("Disconnecting from device")
        self._is_on = False
        try:
            if self.atv:
                await self.atv.close()
                self.atv = None
            if self._task:
                self._task.cancel()
                self._task = None
        finally:
            self._update_state(disconnected=False)

    def _start_connect_loop(self):
        if not self._task and self.atv is None and self._is_on:
            self._task = asyncio.ensure_future(
                self._connect_loop(), loop=self.hass.loop)

    async def _connect_loop(self):
        from pyatv import exceptions

        _LOGGER.debug("Starting connect loop")

        # Try to find device and connect as long as the user has said that
        # we are allowed to connect and we are not already connected.
        while self._is_on and self.atv is None:
            try:
                conf = await self._scan()
                if conf:
                    await self._connect(conf)
            except exceptions.AuthenticationError:
                self._auth_problem()
                break
            except asyncio.CancelledError:
                pass
            except Exception:
                _LOGGER.exception("Failed to connect")
                self.atv = None

            if self.atv is None:
                self._connection_attempts += 1
                backoff = min(randrange(2**self._connection_attempts),
                              BACKOFF_TIME_UPPER_LIMIT)

                _LOGGER.debug("Reconnecting in %d seconds", backoff)
                await asyncio.sleep(backoff)

        _LOGGER.debug("Connect loop ended")
        self._task = None

    def _auth_problem(self):
        _LOGGER.debug("Authentication error, reconfigure integration")

        name = self.config_entry.data.get(CONF_NAME)
        identifier = self.config_entry.data.get(CONF_IDENTIFIER)

        self.hass.components.persistent_notification.create(
            "An irrecoverable connection occurred when connecting to "
            "`{0}`. Please go to the Integrations page and reconfigure it".format(
                name),
            title=NOTIFICATION_TITLE,
            notification_id=NOTIFICATION_ID,
        )

        # Add to event queue as this function is called from a task being
        # cancelled from disconnect
        asyncio.ensure_future(self.disconnect())

        self.hass.async_create_task(
            self.hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": SOURCE_INVALID_CREDENTIALS},
                data={CONF_NAME: name, CONF_IDENTIFIER: identifier},
            ))

    async def _scan(self):
        from pyatv import const, scan

        identifier = self.config_entry.data[CONF_IDENTIFIER]
        address = self.config_entry.data[CONF_ADDRESS]
        protocol = const.Protocol(self.config_entry.data[CONF_PROTOCOL])

        self._update_state(message="Discovering device...")
        atvs = await scan(self.hass.loop,
                          identifier=identifier,
                          protocol=protocol,
                          hosts=[address])
        if atvs:
            return atvs[0]

        _LOGGER.debug("Failed to find device %s with address %s, trying to scan",
                      identifier, address)

        atvs = await scan(self.hass.loop,
                          identifier=identifier,
                          protocol=protocol)
        if atvs:
            return atvs[0]

        self._update_state("Device not found, trying again later...")
        _LOGGER.debug("Failed to find device %s, trying later", identifier)

        return None

    async def _connect(self, conf):
        from pyatv import const, connect

        credentials = self.config_entry.data[CONF_CREDENTIALS]
        session = async_get_clientsession(self.hass)

        for protocol, creds in credentials.items():
            conf.set_credentials(const.Protocol(int(protocol)), creds)

        self._update_state("Connecting to device...")
        self.atv = await connect(conf, self.hass.loop, session=session)
        self.atv.listener = self

        self._update_state("Connected, waiting for update...", connected=True)
        self.atv.push_updater.start()

        self.address_updated(str(conf.address))

        self._connection_attempts = 0
        if self._connection_was_lost:
            _LOGGER.info('Connection was re-established to Apple TV "%s"',
                         self.atv.service.name)
            self._connection_was_lost = False

    @property
    def is_connecting(self):
        """Return true if connection is in progress."""
        return self._task is not None

    def _update_state(self, message="", connected=False, disconnected=False):
        for listener in self.listeners:
            if connected:
                listener.device_connected()
            if disconnected:
                listener.device_disconnected()
            self.message = message
            self.hass.async_create_task(listener.async_update_ha_state())

    def address_updated(self, address):
        """Update cached address in config entry."""
        _LOGGER.debug("Changing address to %s", address)
        self.config_entry.data[CONF_ADDRESS] = address
        update_entry = partial(
            self.hass.config_entries.async_update_entry, data={**self.config_entry.data}
        )
        self.hass.add_job(update_entry, self.config_entry)
