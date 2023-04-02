from datetime import timedelta
import logging

import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    CONF_HOST, CONF_MONITORED_VARIABLES, CONF_NAME, CONF_PASSWORD, CONF_PORT,
    CONF_USERNAME, STATE_IDLE)
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
from homeassistant.exceptions import PlatformNotReady


_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = 'QBittorrent'
DEFAULT_PORT = 8080
TRIM_SIZE = 35

SENSOR_TYPES = {
    'current_status': ['Status', None],
    'total_torrents': ['Total Torrents', None],
    'active_torrents': ['Active Torrents', None],
    'inactive_torrents' : ['Inactive Torrents', None],
    'downloading_torrents': ['Downloading', None],
    'seeding_torrents': ['Seeding', None],
    'resumed_torrents' : ['Resumed Torrents', None],
    'paused_torrents' : ['Paused Torrents', None],
    'completed_torrents' : ['Completed Torrents', None],
    'download_speed': ['Down Speed', 'KiB/s'],
    'upload_speed': ['Up Speed', 'KiB/s'],
}

SCAN_INTERVAL = timedelta(minutes=1)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_HOST): cv.string,
    vol.Optional(CONF_MONITORED_VARIABLES, default=['torrents']):
        vol.All(cv.ensure_list, [vol.In(SENSOR_TYPES)]),
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(CONF_PASSWORD): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_USERNAME): cv.string,
})


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the Qbittorrent sensors."""
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

    dev = []
    for variable in config[CONF_MONITORED_VARIABLES]:
        dev.append(QbittorrentSensor(variable, client, name, username, password))

    add_devices(dev, True)


class QbittorrentSensor(Entity):
    """Representation of a Qbittorrent sensor."""

    def __init__(self, sensor_type, client, client_name, username, password):
        """Initialize the sensor."""
        self._name = SENSOR_TYPES[sensor_type][0]
        self._state = None
        self._available = False
        self.client = client
        self._attribute = {}
        self._unit_of_measurement = SENSOR_TYPES[sensor_type][1]
        self.client_name = client_name
        self.type = sensor_type
        self.username = username
        self.password = password

    @property
    def name(self):
        """Return the name of the sensor."""
        return '{} {}'.format(self.client_name, self._name)

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement of this entity, if any."""
        return self._unit_of_measurement


    @property
    def extra_state_attributes(self):
        """Return the state attributes of the sensor."""
        return self._attribute


    @property
    def available(self):
        """Could the device be accessed during the last update call."""
        return self._available


    def update(self):
        """Get the latest data from Qbittorrent and updates the state."""
        try:
            self.client.auth_log_in()

            self._available = True
        except:
            self._available = False
            _LOGGER.error("Unable to connect to Qbittorrent client")
            return

        attributes = {}

        if self.type == 'current_status':
            upload = float(self.client.transfer.info['up_info_speed'])
            download = float(self.client.transfer.info['dl_info_speed'])
            
            if upload > 0 and download > 0:
                self._state = 'Up/Down'
            elif upload > 0 and download == 0:
                self._state = 'Seeding'
            elif upload == 0 and download > 0:
                self._state = 'Downloading'
            else:
                self._state = STATE_IDLE
        elif self.type == 'total_torrents':
            data = self.client.torrents_info()

            for torrent in data:
                attributes[trim_name(torrent, TRIM_SIZE-5)] = torrent.state

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'active_torrents':
            data = self.client.torrents_info(filter='active')

            for torrent in data:
                attributes[trim_name(torrent, TRIM_SIZE-5)] = torrent.state

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'inactive_torrents':
            data = self.client.torrents_info(filter='inactive')

            for torrent in data:
                attributes[trim_name(torrent, TRIM_SIZE-5)] = torrent.state

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'downloading_torrents':
            data = self.client.torrents_info(filter='downloading')
            self._attr_icon = "mdi:download"
            for torrent in data:
                attributes[trim_name(torrent)] = format_progress(torrent)

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'seeding_torrents':
            data = self.client.torrents_info(filter='seeding')
            self._attr_icon = "mdi:upload"
            for torrent in data:
                ratio = torrent['ratio']
                ratio = float(ratio)
                ratio = '{:.2f}'.format(ratio)

                attributes[trim_name(torrent)] = ratio

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'resumed_torrents':
            data = self.client.torrents_info(filter='resumed')

            for torrent in data:
                attributes[trim_name(torrent)] = format_progress(torrent)

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'paused_torrents':
            data = self.client.torrents_info(filter='paused')
            self._attr_icon = "mdi:pause"
            for torrent in data:
                attributes[trim_name(torrent)] = format_progress(torrent)

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'completed_torrents':
            data = self.client.torrents_info(filter='completed')
            self._attr_icon = "mdi:check"
            for torrent in data:
                attributes[trim_name(torrent)] = '100.0%'

            self._state = len(data)
            self._attribute = attributes
        elif self.type == 'download_speed':
            dlspeed = self.client.transfer.info['dl_info_speed']
            mb_spd = float(dlspeed)
            mb_spd = mb_spd / 1024
            self._state = round(mb_spd, 2 if mb_spd < 0.1 else 1)
        elif self.type == 'upload_speed':
            upspeed = self.client.transfer.info['up_info_speed']
            mb_spd = float(upspeed)
            mb_spd = mb_spd / 1024
            self._state = round(mb_spd, 2 if mb_spd < 0.1 else 1)



def trim_name(torrent, trim_size=TRIM_SIZE):
    name = torrent.name

    if len(name) > trim_size:
        name = name[0:trim_size] + '...'

    return name


def format_progress(torrent):
    progress = torrent.progress
    progress = float(progress) * 100
    progress = '{:.1f}%'.format(progress)

    return progress
