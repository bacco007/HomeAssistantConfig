import logging

import voluptuous as vol
from homeassistant.core import callback
from homeassistant.components.switch import PLATFORM_SCHEMA
from homeassistant.exceptions import PlatformNotReady
from homeassistant.const import (
    CONF_HOST, CONF_NAME, CONF_PASSWORD, CONF_USERNAME,CONF_PORT)
from typing import Final
from homeassistant.components.number import NumberDeviceClass, NumberEntity
from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv

CONF_STEP: Final = "step"
CONF_MAX: Final = "max"
CONF_MIN: Final = "min"

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = 'qBit'
DEFAULT_PORT = 8080
DEFAULT_MIN = 0
DEFAULT_MAX = 500
DEFAULT_STEP = 0.1


PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_HOST): cv.string,
    vol.Required(CONF_PASSWORD): cv.string,
    vol.Required(CONF_USERNAME): cv.string,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.string,
    vol.Optional(CONF_MIN, default=DEFAULT_MIN): vol.Any(None, vol.Coerce(int)),
    vol.Optional(CONF_MAX, default=DEFAULT_MAX): vol.Any(None, vol.Coerce(int)),
    vol.Optional(CONF_STEP, default=DEFAULT_STEP): cv.positive_float,
})

def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the qbittorrent switch."""
    from qbittorrentapi import Client,LoginFailed

    name = config.get(CONF_NAME)
    host = config.get(CONF_HOST)
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    port = config.get(CONF_PORT)
    min_value = config.get(CONF_MIN)
    max_value = config.get(CONF_MAX)
    step_value = config.get(CONF_STEP)

    try:
        client = Client(host,port,username,password)
        client.auth_log_in()
    except LoginFailed() as e:
        _LOGGER.warning(e)

    add_devices([MyNumber(name,min_value,max_value,step_value,client)])


class MyNumber(NumberEntity):
    # Implement one of these methods.
    def __init__(
        self,
        name: str ,
        min_value: float,
        max_value: float,
        step_value: float,
        client,
        ) -> None:
        
        self._attr_unit_of_measurement = 'MB/s'
        self._attr_name = name
        self.client = client
        self._attr_native_min_value = min_value
        self._attr_native_max_value = max_value
        self._attr_step = step_value
        self._attr_device_class = NumberDeviceClass.DATA_RATE
        self._attr_state = True
        #self._attr_native_value = "0"   
        self._attr_icon = "mdi:speedometer"

    
    def set_native_value(self, value: float) -> None:
        self._attr_value = value                                         
        """Update the current value."""
    
    def update(self):
        """Get the latest data from qbittorrent and updates the state."""
        try:
            self.client.auth_log_in()
            self._available = True
        except:
            _LOGGER.error("Connection to qbittorrent Lost")
            self._available = False
            return
        
        self._attr_native_value = self.client.transfer.info['dl_rate_limit']/102400
        upload_limit = self.value
        if self._attr_native_value != int(upload_limit)*1024000 :        
             self.client.transfer_set_download_limit(limit=int(upload_limit)*1024000)