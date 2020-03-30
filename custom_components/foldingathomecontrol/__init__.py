"""
Component to integrate with PyFoldingAtHomeControl.
"""

import asyncio
import itertools
import logging
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from FoldingAtHomeControl import (
    FoldingAtHomeControlConnectionFailed,
    FoldingAtHomeController,
    PyOnMessageTypes,
)
from homeassistant.config_entries import SOURCE_IMPORT
from homeassistant.core import Config, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import (
    CONF_ADDRESS,
    CONF_PASSWORD,
    CONF_PORT,
    DATA_UPDATED,
    DOMAIN,
    SENSOR_ADDED,
    SENSOR_REMOVED,
)

_LOGGER = logging.getLogger(__name__)

FOLDINGATHOMECONTROL_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_ADDRESS, default="localhost"): cv.string,
        vol.Optional(CONF_PORT, default=36330): cv.port,
        vol.Optional(CONF_PASSWORD): cv.string,
    }
)

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: vol.All(cv.ensure_list, [FOLDINGATHOMECONTROL_SCHEMA])},
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: Config) -> bool:
    """Configure PyFoldingAtHomeControl using config flow only."""
    if DOMAIN in config:
        for entry in config[DOMAIN]:
            hass.async_create_task(
                hass.config_entries.flow.async_init(
                    DOMAIN, context={"source": SOURCE_IMPORT}, data=entry
                )
            )

    return True


async def async_setup_entry(hass, config_entry):
    """Set up PyFoldingAtHomeControl from config entry."""
    data = FoldingAtHomeControlData(hass, config_entry)
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = data
    if not await data.async_setup():
        return False

    return True


async def async_unload_entry(hass, config_entry):
    """Unload a config entry."""
    await hass.config_entries.async_forward_entry_unload(config_entry, "sensor")
    hass.data[DOMAIN].pop(config_entry.entry_id)
    return True


class FoldingAtHomeControlData:
    """This class handles communication and stores the data."""

    def __init__(self, hass: HomeAssistant, config_entry) -> None:
        """Initialize the class."""
        self.hass = hass
        self.config_entry = config_entry
        self.data = {}
        self.client = None
        self._remove_callback = None
        self._task = None

    @callback
    def callback(self, message_type: str, data: Any) -> None:
        """Called when data is received from the Folding@Home client."""
        if message_type == PyOnMessageTypes.SLOTS.value:
            if PyOnMessageTypes.SLOTS.value in self.data:
                added = list(
                    itertools.filterfalse(
                        lambda x: x in self.data[PyOnMessageTypes.SLOTS.value], data
                    )
                )
                removed = list(
                    itertools.filterfalse(
                        lambda x: x in data, self.data[PyOnMessageTypes.SLOTS.value]
                    )
                )
                async_dispatcher_send(
                    self.hass, self.get_sensor_added_identifer(), added
                )
                async_dispatcher_send(
                    self.hass, self.get_sensor_removed_identifer(), removed
                )
            else:
                async_dispatcher_send(
                    self.hass, self.get_sensor_added_identifer(), data
                )
        self.data[message_type] = data
        async_dispatcher_send(self.hass, self.get_data_update_identifer())

    async def async_setup(self) -> bool:
        """Set up the Folding@Home client."""
        address = self.config_entry.data[CONF_ADDRESS]
        port = self.config_entry.data[CONF_PORT]
        password = self.config_entry.data.get(CONF_PASSWORD)
        self.client = FoldingAtHomeController(address, port, password)
        try:
            await self.client.try_connect_async(timeout=5)
        except FoldingAtHomeControlConnectionFailed:
            return False

        self.hass.async_create_task(
            self.hass.config_entries.async_forward_entry_setup(
                self.config_entry, "sensor"
            )
        )

        self._remove_callback = self.client.register_callback(self.callback)
        self._task = asyncio.ensure_future(self.client.run())

        return True

    async def async_remove(self) -> None:
        """Remove the callback and stops the client."""
        if self._remove_callback is not None:
            self._remove_callback()
        if self._task is not None:
            self._task.cancel()

    def get_data_update_identifer(self) -> None:
        """Returns the unique data_update itentifier for this connection."""
        return f"{DATA_UPDATED}_{self.config_entry.data[CONF_ADDRESS]}"

    def get_sensor_added_identifer(self) -> None:
        """Returns the unique sensor_added itentifier for this connection."""
        return f"{SENSOR_ADDED}_{self.config_entry.data[CONF_ADDRESS]}"

    def get_sensor_removed_identifer(self) -> None:
        """Returns the unique sensor_removed itentifier for this connection."""
        return f"{SENSOR_REMOVED}_{self.config_entry.data[CONF_ADDRESS]}"

    @property
    def available(self):
        """Is the Folding@Home client available."""
        if self.client:
            return self.client.is_connected
        return False
