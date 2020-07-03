"""MyJDownloader sensor."""
from datetime import timedelta
import logging

import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.exceptions import PlatformNotReady
from homeassistant.const import (
    CONF_EMAIL,
    CONF_PASSWORD,
    CONF_NAME,
    STATE_UNKNOWN,
)
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity import Entity
import myjdapi

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=60)


PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_EMAIL): cv.string,
        vol.Required(CONF_PASSWORD): cv.string,
        vol.Optional(CONF_NAME): cv.string,
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the MyJDownloader Sensor."""
    email = config.get(CONF_EMAIL)
    password = config.get(CONF_PASSWORD)
    name = config.get(CONF_NAME)

    myjd = myjdapi.Myjdapi()
    try:
        myjd.connect(email, password)
    except myjdapi.myjdapi.MYJDException:
        _LOGGER.error('Failed to connect to MyJDownloader, please check email and password')
        raise PlatformNotReady

    entities = []
    if name:
        entities.append(MyJDSensor(hass, myjd, name))
    else:
        for device in myjd.list_devices():
            entities.append(MyJDSensor(hass, myjd, device['name']))
    if not entities:
        _LOGGER.warning('Failed to setup MyJDownloader sensor, no device found.')
        raise PlatformNotReady

    add_entities(
        entities, True
    )


class MyJDSensor(Entity):
    """Representation of a sensor"""

    def __init__(self, hass, myjd, name):
        """Initialize the sensor."""
        self._hass = hass
        self._myjd = myjd
        self._name = name
        self._state = STATE_UNKNOWN
        self._attributes = {}

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        return self._attributes

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return "byte"

    def update(self):
        """Get the latest data and updates the state."""
        try:
            self._myjd.reconnect()
        except myjdapi.myjdapi.MYJDException:
            _LOGGER.error('Failed to connect to MyJDownloader, please check email and password')
            self._state = STATE_UNKNOWN
            return
        try:
            # fetch device if needed
            if not self._myjd.list_devices():
                self._myjd.update_devices()
            device = self._myjd.get_device(self._name)

            # get download information
            currentDownloads = []
            downloadList = device.downloads.query_links()
            if isinstance(downloadList, list):
                currentDownloads = [x for x in downloadList if not x.get('finished', False)]

            # get current speed information
            value = device.downloadcontroller.get_speed_in_bytes()

            # set values
            self._attributes['name'] = device.name
            self._attributes['device_id'] = device.device_id
            self._attributes['device_type'] = device.device_type
            self._attributes['status'] = device.downloadcontroller.get_current_state()
            self._attributes['download_list'] = downloadList
            self._attributes['current_downloads'] = currentDownloads

        except myjdapi.myjdapi.MYJDException as e:
            e = str(e).strip()
            if e == 'Device not found':
                value = e
            else:
                _LOGGER.warning('Failed to check MyJDownloader sensor, %s', e)
                value = STATE_UNKNOWN
        if value is False:  # failed to query
            value = STATE_UNKNOWN
        self._state = value
