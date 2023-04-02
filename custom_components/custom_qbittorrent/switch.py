import logging

import voluptuous as vol

from homeassistant.components.switch import PLATFORM_SCHEMA
from homeassistant.exceptions import PlatformNotReady
from homeassistant.const import (
    CONF_HOST, CONF_NAME, CONF_PASSWORD, CONF_USERNAME,CONF_PORT,STATE_OFF,
    STATE_ON)
from homeassistant.helpers.entity import ToggleEntity
import homeassistant.helpers.config_validation as cv


_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = 'Qbit'
DEFAULT_PORT = 8080

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_HOST): cv.string,
    vol.Required(CONF_PASSWORD): cv.string,
    vol.Required(CONF_USERNAME): cv.string,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
})


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the qbittorrent switch."""
    from qbittorrentapi import Client,LoginFailed

    name = config.get(CONF_NAME)
    host = config.get(CONF_HOST)
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    port = config.get(CONF_PORT)
    
    try:
        client = Client(host,port,username,password)
        client.auth_log_in()
    except LoginFailed() as e:
        _LOGGER.warning(e)

    add_devices([QbittorrentSwitch(client, name, username, password)])


class QbittorrentSwitch(ToggleEntity):
    """Representation of a qbittorrent switch."""

    def __init__(self, client, name, username, password):
        """Initialize the qbittorrent switch."""
        self._name = name
        self.client = client
        self.username = username
        self.password = password
        self._state = STATE_OFF
        self._available = False

    @property
    def name(self):
        """Return the name of the switch."""
        return self._name

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def is_on(self):
        """Return true if device is on."""
        return self._state == STATE_ON
    @property
    def is_off(self):
        """Return true if device is on."""
        return self._state == STATE_OFF

    @property
    def available(self):
        """Return true if device is available."""
        return self._available

    def turn_on(self, **kwargs):
        """Turn the device on."""
        self.client.auth_log_in()
        self.client.transfer_setSpeedLimitsMode(True)

    def turn_off(self, **kwargs):
        """Turn the device off."""
        self.client.auth_log_in()
        self.client.transfer_setSpeedLimitsMode(False)

    def update(self):
        """Get the latest data from qbittorrent and updates the state."""
        try:
            self.client.auth_log_in()
            self._available = True
        except:
            _LOGGER.error("Connection to qbittorrent Lost")
            self._available = False
            return
        if self.client.transfer_speed_limits_mode() == '0':
            self._state = STATE_OFF
        else:
            self._state = STATE_ON