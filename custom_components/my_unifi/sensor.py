"""
Unifi sensor. Shows the total number os devices connected. Also shows the number of devices per
AP and per essid as attributes.
with code from https://github.com/frehov/Unifi-Python-API
Version 0.2
"""

import json
import logging
import re
from datetime import timedelta
from typing import Dict, Pattern, Union

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    CONF_NAME,
    CONF_PASSWORD,
    CONF_REGION,
    CONF_URL,
    CONF_USERNAME,
    CONF_VERIFY_SSL,
    PRECISION_WHOLE,
    STATE_UNKNOWN,
)
from homeassistant.exceptions import TemplateError
from homeassistant.helpers import template
from homeassistant.helpers.entity import Entity
from requests import Session

REQUIREMENTS = []

_LOGGER = logging.getLogger(__name__)


DOMAIN = "sensor"
ENTITY_ID_FORMAT = DOMAIN + ".{}"

DEFAULT_NAME = "Unifi"
DEFAULT_SITE = "default"
DEFAULT_VERIFYSSL = False

SCAN_INTERVAL = timedelta(seconds=60)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_USERNAME): cv.string,
        vol.Required(CONF_PASSWORD): cv.string,
        vol.Required(CONF_URL): cv.url,
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_REGION, default=DEFAULT_SITE): cv.string,
        vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFYSSL): cv.boolean,
    }
)


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the Unifi Sensor."""
    name = config.get(CONF_NAME)
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    baseurl = config.get(CONF_URL)
    site = config.get(CONF_REGION)
    verify_ssl = config.get(CONF_VERIFY_SSL)

    data = UnifiSensorData(hass, username, password, site, baseurl, verify_ssl)

    add_devices([UnifiSensor(hass, data, name)], True)


class UnifiSensor(Entity):
    """Representation of a Unifi Sensor."""

    def __init__(self, hass, data, name):
        """Initialize the sensor."""
        self._hass = hass
        self._data = data
        self._name = name
        self._state = None
        self._attributes = None
        self._unit_of_measurement = "devices"

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return self._unit_of_measurement

    @property
    def precision(self):
        """Return the precision of the system."""
        return PRECISION_WHOLE

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        return self._attributes

    def update(self):
        """Fetch new state data for the sensor."""
        self._data.update()
        value = self._data.total
        if value is None:
            value = STATE_UNKNOWN
            self._attributes = {}
        else:
            self._state = value
            self._attributes = self._data.attrs


class UnifiSensorData(object):
    """
    Unifi API for the Unifi Controller.
    """

    _login_data = {}
    _current_status_code = None

    def __init__(self, hass, username, password, site, baseurl, verify_ssl):
        """
        Initiates tha api with default settings if none other are set.
        :param username: username for the controller user
        :param password: password for the controller user
        :param site: which site to connect to (Not the name you've given the site, but the url-defined name)
        :param baseurl: where the controller is located
        :param verify_ssl: Check if certificate is valid or not, throws warning if set to False
        """
        self._hass = hass
        self._login_data["username"] = username
        self._login_data["password"] = password
        self._site = site
        self._verify_ssl = verify_ssl
        self._baseurl = baseurl
        self._session = Session()
        self._ap_list = {}
        self.total = 0
        self.attrs = {}

    def __enter__(self):
        """
        Contextmanager entry handle
        :return: isntance object of class
        """
        self.login()
        return self

    def __exit__(self, *args):
        """
        Contextmanager exit handle
        :return: None
        """
        self.logout()

    def login(self):
        """
        Log the user in
        :return: None
        """
        self._current_status_code = self._session.post(
            "{}/api/login".format(self._baseurl),
            data=json.dumps(self._login_data),
            verify=self._verify_ssl,
        ).status_code

        if self._current_status_code == 400:
            _LOGGER.error("Failed to log in to api with provided credentials")

    def logout(self):
        """
        Log the user out
        :return: None
        """
        self._session.get("{}/logout".format(self._baseurl))
        self._session.close()

    def list_clients(self) -> list:
        """
        List all available clients from the api
        :return: A list of clients on the format of a dict
        """

        r = self._session.get(
            "{}/api/s/{}/stat/sta".format(self._baseurl, self._site, verify=self._verify_ssl),
            data="json={}",
        )
        self._current_status_code = r.status_code

        if self._current_status_code == 401:
            _LOGGER.error("Unifi: Invalid login, or login has expired")
            return None

        data = r.json()["data"]

        return data

    def list_devices(self, mac=None) -> list:
        """
        List all available devices from the api
        :param mac: if defined, return information for this device only
        :return: A list of devices on the format of a dict
        """

        r = self._session.get(
            "{}/api/s/{}/stat/device/{}".format(
                self._baseurl, self._site, mac, selfverify=self._verify_ssl
            ),
            data="json={}",
        )
        self._current_status_code = r.status_code

        if self._current_status_code == 401:
            _LOGGER.error("Unifi: Invalid login, or login has expired")
            return None

        data = r.json()["data"]

        return data

    def update_ap_list(self, newmac):

        device_info = self.list_devices(mac=newmac)
        try:
            self._ap_list[newmac] = "AP_" + device_info[0]["name"]
        except:
            self._ap_list[newmac] = newmac

    def update(self):
        self.login()
        self.total = 0
        self.attrs = {}
        devices_per_essid = {}
        devices_per_ap = {}
        devices_per_ap_name = {}
        devices_wired = 0

        device_list = self.list_clients()
        for device in device_list:
            self.total += 1
            try:
                if device["is_wired"]:
                    devices_wired += 1
                else:
                    if device["essid"] in devices_per_essid.keys():
                        devices_per_essid[device["essid"]] += 1
                    else:
                        devices_per_essid[device["essid"]] = 1
                    if device["ap_mac"] in devices_per_ap.keys():
                        devices_per_ap[device["ap_mac"]] += 1
                    else:
                        devices_per_ap[device["ap_mac"]] = 1
            except:
                _LOGGER.error("error processing device %s", device["mac"])

        for ap in devices_per_ap.keys():
            if ap in self._ap_list.keys():
                devices_per_ap_name[self._ap_list[ap]] = devices_per_ap[ap]
            else:
                self.update_ap_list(ap)
                devices_per_ap_name[self._ap_list[ap]] = devices_per_ap[ap]

        # update attrs
        for key in devices_per_essid.keys():
            self.attrs[key] = devices_per_essid[key]
        for key in devices_per_ap_name.keys():
            self.attrs[key] = devices_per_ap_name[key]
        if devices_wired > 0:
            self.attrs["wired"] = devices_wired

        self.logout()

