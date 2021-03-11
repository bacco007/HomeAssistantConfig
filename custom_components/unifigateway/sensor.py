"""
Support for Unifi Security Gateway Units.
For more details about this platform, please refer to the documentation at
https://github.com/custom-components/sensor.unifigateway
"""

import logging
from datetime import timedelta

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    CONF_HOST,
    CONF_MONITORED_CONDITIONS,
    CONF_NAME,
    CONF_PASSWORD,
    CONF_USERNAME,
    CONF_VERIFY_SSL,
)
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

# __version__ = '0.2.3'

_LOGGER = logging.getLogger(__name__)

CONF_PORT = "port"
CONF_SITE_ID = "site_id"

DEFAULT_NAME = "UniFi Gateway"
DEFAULT_HOST = "localhost"
DEFAULT_PORT = 443
DEFAULT_SITE = "default"
DEFAULT_VERIFY_SSL = False

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)

SENSOR_VPN = "vpn"
SENSOR_WWW = "www"
SENSOR_WAN = "wan"
SENSOR_LAN = "lan"
SENSOR_WLAN = "wlan"
SENSOR_ALERTS = "alerts"
SENSOR_FIRMWARE = "firmware"

USG_SENSORS = {
    SENSOR_VPN: ["VPN", "", "mdi:folder-key-network"],
    SENSOR_WWW: ["WWW", "", "mdi:web"],
    SENSOR_WAN: ["WAN", "", "mdi:shield-outline"],
    SENSOR_LAN: ["LAN", "", "mdi:lan"],
    SENSOR_WLAN: ["WLAN", "", "mdi:wifi"],
    SENSOR_ALERTS: ["Alerts", "", "mdi:information-outline"],
    SENSOR_FIRMWARE: ["Firmware Upgradable", "", "mdi:database-plus"],
}

POSSIBLE_MONITORED = [
    SENSOR_VPN,
    SENSOR_WWW,
    SENSOR_WAN,
    SENSOR_LAN,
    SENSOR_WLAN,
    SENSOR_ALERTS,
    SENSOR_FIRMWARE,
]
DEFAULT_MONITORED = POSSIBLE_MONITORED

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_HOST, default=DEFAULT_HOST): cv.string,
        vol.Optional(CONF_SITE_ID, default=DEFAULT_SITE): cv.string,
        vol.Required(CONF_PASSWORD): cv.string,
        vol.Required(CONF_USERNAME): cv.string,
        vol.Required(CONF_PORT, default=DEFAULT_PORT): cv.port,
        vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): vol.Any(cv.boolean, cv.isfile),
        vol.Optional(CONF_MONITORED_CONDITIONS, default=DEFAULT_MONITORED): vol.All(
            cv.ensure_list, [vol.In(POSSIBLE_MONITORED)]
        ),
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Unifi sensor."""
    from .controller import Controller, APIError

    name = config.get(CONF_NAME)
    host = config.get(CONF_HOST)
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    site_id = config.get(CONF_SITE_ID)
    port = config.get(CONF_PORT)
    verify_ssl = config.get(CONF_VERIFY_SSL)

    try:
        ctrl = Controller(
            host,
            username,
            password,
            port,
            version="unifiOS",
            site_id=site_id,
            ssl_verify=verify_ssl,
        )
    except APIError as ex:
        _LOGGER.error("Failed to connect to Unifi Security Gateway: %s", ex)
        return False

    for sensor in config.get(CONF_MONITORED_CONDITIONS):
        add_entities([UnifiGatewaySensor(hass, ctrl, name, sensor)], True)


class UnifiGatewaySensor(Entity):
    """Implementation of a UniFi Gateway sensor."""

    def __init__(self, hass, ctrl, name, sensor):
        """Initialize the sensor."""
        self._hass = hass
        self._ctrl = ctrl
        self._name = name + " " + USG_SENSORS[sensor][0]
        self._sensor = sensor
        self._state = None
        self._alldata = None
        self._data = None
        self._attributes = {}

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return USG_SENSORS[self._sensor][2]

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def state_attributes(self):
        """Return the device state attributes."""
        return self._attributes

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):
        """Set up the sensor."""
        from .controller import APIError

        # get_healthinfo() call made for each of 4 sensors - should only be for 1
        try:
            # Check that function exists...potential errors on startup otherwise
            if hasattr(self._ctrl, "get_healthinfo"):
                self._alldata = self._ctrl.get_healthinfo()

                for sub in self._alldata:
                    if sub["subsystem"] == self._sensor:
                        self._data = sub
                        self._state = sub["status"].upper()
                        for attr in sub:
                            self._attributes[attr] = sub[attr]

            else:
                _LOGGER.error("no healthinfo attribute for controller")
        except APIError as ex:
            _LOGGER.error("Failed to access health info: %s", ex)
