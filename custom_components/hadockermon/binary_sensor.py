"""
A custom binary_sensor platform which allows you get sensor data from ha-dockermon.
https://github.com/philhawthorne/ha-dockermon

For more details about this component, please refer to the documentation at
https://github.com/custom-components/binary_sensor.hadockermon
"""
import logging
from datetime import timedelta

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.binary_sensor import PLATFORM_SCHEMA, BinarySensorEntity
from homeassistant.const import (
    CONF_HOST,
    CONF_NAME,
    CONF_PASSWORD,
    CONF_PORT,
    CONF_SSL,
    CONF_USERNAME,
    CONF_VERIFY_SSL,
)
from homeassistant.helpers.aiohttp_client import async_get_clientsession

__version__ = "0.0.3"

_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = ["pydockermon==1.0.0"]
DEFAULT_NAME = "HA Dockermon"
CONTAINER_NAME = "{} {}"

CONF_CONTAINERS = "containers"
CONF_STATS = "stats"

ATTR_STATUS = "status"
ATTR_IMAGE = "image"
ATTR_MEMORY = "memory"
ATTR_RX_TOTAL = "network_rx_total"
ATTR_TX_TOTAL = "network_tx_total"

ATTR_FRIENDLY_NAME = "friendly_name"

SCAN_INTERVAL = timedelta(seconds=60)

ICON = "mdi:docker"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_HOST): cv.string,
        vol.Required(CONF_PORT, default=8126): cv.port,
        vol.Optional(CONF_NAME): cv.string,
        vol.Optional(CONF_STATS, default="False"): cv.string,
        vol.Optional(CONF_USERNAME): cv.string,
        vol.Optional(CONF_PASSWORD): cv.string,
        vol.Optional(CONF_SSL, default=False): cv.boolean,
        vol.Optional(CONF_VERIFY_SSL, default=False): cv.boolean,
        vol.Optional(CONF_CONTAINERS, default=None): vol.All(cv.ensure_list, [cv.string]),
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Set up the device."""
    from pydockermon.api import API

    host = config[CONF_HOST]
    port = config[CONF_PORT]
    username = config.get(CONF_USERNAME)
    password = config.get(CONF_PASSWORD)
    ssl = config[CONF_SSL]
    verify_ssl = config[CONF_VERIFY_SSL]
    device_name = config.get(CONF_NAME)
    stats = config.get(CONF_STATS)
    containers = config[CONF_CONTAINERS]
    session = async_get_clientsession(hass, verify_ssl)
    api = API(hass.loop, session, host, port, username, password, ssl)
    devices = []
    await api.list_containers()
    for container in api.all_containers["data"]:
        if not containers or container in containers:
            # if not container.startswith("addon_"):
            devices.append(HADockermonSwitch(api, device_name, stats, container, host))

    async_add_entities(devices, True)


class HADockermonSwitch(BinarySensorEntity):
    def __init__(self, api, device_name, stats, container, host):
        self.api = api
        self.container = container

        if not device_name:
            device_name = DEFAULT_NAME
        self.device_name = CONTAINER_NAME.format(device_name, container)

        self._stats = stats
        self._network_stats = None
        self._status = None
        self._image = None
        self._memory_usage = None
        self._network_rx_total = None
        self._network_tx_total = None
        self._host = host

    async def async_update(self):
        state = await self.api.container_state(self.container)
        try:
            self._state = state["data"]["state"]
        except (TypeError, KeyError):
            _LOGGER.debug("Could not fetch state for %s", self.container)
        try:
            self._status = state["data"]["status"]
        except (TypeError, KeyError):
            _LOGGER.debug("Could not fetch status for %s", self.container)
        try:
            self._image = state["data"]["image"]
        except (TypeError, KeyError):
            _LOGGER.debug("Could not fetch image for %s", self.container)

        if self._state == "running" and self._stats:
            metrics = await self.api.container_metrics(self.container)
            try:
                data = metrics["data"]
            except (TypeError, KeyError):
                _LOGGER.debug("Could not fetch metrics for %s", self.container)

            if data:
                memory_usage = data["memory_stats"]["usage"] / 1024 / 1024
                if memory_usage:
                    self._memory_usage = str(round(memory_usage, 2)) + "MB"
                else:
                    self._memory_usage = str(0) + "MB"

                if "networks" in data:
                    self._network_stats = "available"
                    stats_eth0 = data["networks"]["eth0"]
                    net_rx_total = stats_eth0["rx_bytes"] / 1024 / 1024
                    net_tx_total = stats_eth0["tx_bytes"] / 1024 / 1024
                    self._network_rx_total = str(round(net_rx_total, 2)) + "MB"
                    self._network_tx_total = str(round(net_tx_total, 2)) + "MB"
                else:
                    self._network_stats = "available"
                    self._network_rx_total = str(0) + "MB"
                    self._network_tx_total = str(0) + "MB"
            else:
                self._memory_usage = str(0) + "MB"
                self._network_stats = "available"
                self._network_rx_total = str(0) + "MB"
                self._network_tx_total = str(0) + "MB"

    @property
    def name(self):
        """Return the name of the binary_sensor."""
        return self.device_name

    @property
    def is_on(self):
        """Return the state of the binary sensor."""
        if self._state == "running":
            return True
        return False

    @property
    def device_class(self):
        """Return the class of this device, from component DEVICE_CLASSES."""
        return "power"

    @property
    def icon(self):
        """Return a icon for the binary sensor."""
        return ICON

    @property
    def device_state_attributes(self):
        ret = {
            ATTR_STATUS: self._status,
            ATTR_IMAGE: self._image,
        }
        if self._stats:
            ret.update({ATTR_MEMORY: self._memory_usage})

        if self._network_stats:
            ret.update(
                {ATTR_RX_TOTAL: self._network_rx_total, ATTR_TX_TOTAL: self._network_tx_total,}
            )

        return ret
