"""Unifi sensors."""
from __future__ import annotations

import logging
from pprint import pformat
import voluptuous as vol

from homeassistant.helpers.entity import Entity
import homeassistant.helpers.config_validation as cv
from homeassistant.util import Throttle
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    CONF_NAME,
    CONF_HOST,
    CONF_USERNAME,
    CONF_PORT,
    CONF_PASSWORD,
    CONF_MONITORED_CONDITIONS,
    CONF_VERIFY_SSL,
)

from .const import (
    CONF_SITE_ID,
    CONF_UNIFI_VERSION,
    DEFAULT_NAME,
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_UNIFI_VERSION,
    DEFAULT_SITE,
    DEFAULT_VERIFY_SSL,
    MIN_TIME_BETWEEN_UPDATES,
)

_LOGGER = logging.getLogger(__name__)

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



    for sensor in config.get(CONF_MONITORED_CONDITIONS):
        add_entities([UnifiStatusSensor(hass, ctrl, name, sensor)], True)


class UnifiStatusSensor(Entity):
    """Implementation of a UniFi Status sensor."""

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
        from .pyunifi.controller import APIError

        if self._sensor == SENSOR_ALERTS:
            self._attributes = {}

            try:
                unarchived_alerts = self._ctrl.get_alerts()
            except APIError as ex:
                _LOGGER.error(f"Failed to access alerts info: {ex}")
            else:
                for index, alert in enumerate(unarchived_alerts, start=1):
                    if not alert["archived"]:
                        self._attributes[str(index)] = alert

                self._state = len(self._attributes)

        elif self._sensor == SENSOR_FIRMWARE:
            self._attributes = {}
            self._state = 0

            try:
                aps = self._ctrl.get_aps()
            except APIError as ex:
                _LOGGER.error(f"Failed to scan aps: {ex}")
            else:
                _LOGGER.debug(f"get_aps:\n{pformat(aps)}")
                # Set the attributes based on device name - this may not be unique
                # but is user-readability preferred
                for devices in aps:
                    if devices.get("upgradable"):
                        if devices.get("name"):
                            self._attributes[devices["name"]] = devices["upgradable"]
                        else:
                            self._attributes[devices["ip"]] = devices["upgradable"]
                        self._state += 1

        else:
            # get_healthinfo() call made for each of 4 sensors - should only be for 1
            try:
                # Check that function exists...potential errors on startup otherwise
                if hasattr(self._ctrl, "get_healthinfo"):
                    self._alldata = self._ctrl.get_healthinfo()
                    _LOGGER.debug(f"get_healthinfo:\n{pformat(self._alldata)}")

                    for sub in self._alldata:
                        if sub["subsystem"] == self._sensor:
                            self._data = sub
                            self._state = sub["status"].upper()
                            for attr in sub:
                                self._attributes[attr] = sub[attr]

                else:
                    _LOGGER.error("no healthinfo attribute for controller")
            except APIError as ex:
                _LOGGER.error(f"Failed to access health info: {ex}")
