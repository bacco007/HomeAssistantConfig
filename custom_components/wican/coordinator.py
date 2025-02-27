"""Coordinator for WiCan Integration.

Purpose: Coordinate data update for WiCAN devices.
"""

from datetime import timedelta
import logging

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import CONF_DEFAULT_SCAN_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class WiCanCoordinator(DataUpdateCoordinator):
    """WiCAN Coordinator class based on HomeAssistant DataUpdateCoordinator.

    Attributes
    ----------
    api: Any
        WiCan device api to be used.
    data: dict
        Inherited from DataUpdateCoordinator.
        dict is created and filled from WiCan API with first call of method "_async_update_data".

    """

    ecu_online = False

    def __init__(self, hass: HomeAssistant, config_entry, api) -> None:
        """Initialize a WiCanCoordinator and set the WiCan device API."""
        SCAN_INTERVAL = timedelta(
            seconds=config_entry.options.get(
                CONF_SCAN_INTERVAL,
                config_entry.data.get(CONF_SCAN_INTERVAL, CONF_DEFAULT_SCAN_INTERVAL),
            )
        )
        super().__init__(
            hass, _LOGGER, name="WiCAN Coordinator", update_interval=SCAN_INTERVAL
        )
        self.api = api

    async def _async_update_data(self):
        return await self.get_data()

    async def get_data(self):
        """Check, if WiCan API is available and return data dictionary containing car configuration and data (PIDs) using the WiCan API.

        Returns
        -------
        data: dict
            Dictionary containing WiCan device status, car configuration and data (PIDs).
            If device API is not reachable, return an empty dict.

        """
        data = {}
        data["status"] = await self.api.check_status()
        if not data["status"]:
            raise ConfigEntryNotReady(
                translation_domain=DOMAIN,
                translation_key="cannot_connect",
                translation_placeholders={"ip_address": self.api.ip},
            )

        self.ecu_online = True
        # self.ecu_online = data['status']['ecu_status'] == 'online'

        if not self.ecu_online:
            return data

        data["pid"] = await self.api.get_pid()

        _LOGGER.info(data)

        return data

    def device_info(self):
        """Return basic device information shown in HomeAssistant "Device Info" section of the WiCan device.

        Returns
        -------
        dict
            Dictionary containing details about the device (e.g. Device URL, Software Version).

        """
        return {
            "identifiers": {(DOMAIN, self.data["status"]["device_id"])},
            "name": "WiCAN",
            "manufacturer": "MeatPi",
            "model": self.data["status"]["hw_version"],
            "configuration_url": "http://" + self.data["status"]["sta_ip"],
            "sw_version": self.data["status"]["fw_version"],
            "hw_version": self.data["status"]["hw_version"],
        }

    def available(self) -> bool:
        """Check, if WiCan device is available, based on the data received from earlier API calls.

        Returns
        -------
        bool
            Device availability.

        """
        return self.data["status"] != False

    def get_status(self, key) -> str | bool:
        """Check, if device status is available from previous API call and get status-value for a given key.

        Parameters
        ----------
        key: Any
            Status key to be checked (e.g. "fw_version").

        Returns
        -------
        str | bool:
            str containing status-value, if device status is available.
            False, if no device status available.

        """
        if not self.data["status"]:
            return False

        return self.data["status"][key]

    def get_pid_value(self, key) -> str | bool:
        """Check, if device status is available from previous API call and get value for a given PID-key.

        Parameters
        ----------
        key: Any
            PID-key (e.g. "SOC_BMS") to be checked for available data.

        Returns
        -------
        str | bool
            False, if no device status available.
            str containing value of PID, if device status is available.

        """
        if not self.data["status"]:
            return False

        if self.data["pid"].get(key) is None:
            return False

        return self.data["pid"][key]["value"]
