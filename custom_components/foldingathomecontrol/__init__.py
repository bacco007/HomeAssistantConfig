"""
Component to integrate with PyFoldingAtHomeControl.
"""

import asyncio
import itertools
from typing import Any, Tuple

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
    _LOGGER,
)

from .services import async_setup_services, async_unload_services

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

    await async_setup_services(hass)

    return True


async def async_unload_entry(hass, config_entry):
    """Unload a config entry."""
    await hass.config_entries.async_forward_entry_unload(config_entry, "sensor")
    await hass.data[DOMAIN][config_entry.entry_id].async_remove()
    hass.data[DOMAIN].pop(config_entry.entry_id)
    # If there is no instance of this integration registered anymore
    if not hass.data[DOMAIN]:
        await async_unload_services(hass)
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
        self._available = False

    @callback
    def data_received_callback(self, message_type: str, data: Any) -> None:
        """Called when data is received from the Folding@Home client."""
        self._available = True
        if message_type == PyOnMessageTypes.SLOTS.value:
            self.handle_slots_data_received(data)
        if message_type == PyOnMessageTypes.ERROR.value:
            self.handle_error_received(data)
        self.data[message_type] = data
        async_dispatcher_send(self.hass, self.get_data_update_identifer())

    @callback
    def on_disconnect_callback(self) -> None:
        """Called when data is received from the Folding@Home client."""
        if self._available:
            self._available = False
            _LOGGER.error(
                "Disconnected from %s:%s. Trying to reconnect.",
                self.config_entry.data[CONF_ADDRESS],
                self.config_entry.data[CONF_PORT],
            )
            async_dispatcher_send(self.hass, self.get_data_update_identifer())

    async def async_setup(self) -> bool:
        """Set up the Folding@Home client."""
        address = self.config_entry.data[CONF_ADDRESS]
        port = self.config_entry.data[CONF_PORT]
        password = self.config_entry.data.get(CONF_PASSWORD)
        self.client = FoldingAtHomeController(address, port, password, read_timeout=10)
        try:
            self._remove_callback = self.client.register_callback(
                self.data_received_callback
            )
            self.client.on_disconnect(self.on_disconnect_callback)
            await self.client.try_connect_async(timeout=5)
            await self.client.subscribe_async()
            self._available = True
        except FoldingAtHomeControlConnectionFailed:
            return False

        self.hass.async_create_task(
            self.hass.config_entries.async_forward_entry_setup(
                self.config_entry, "sensor"
            )
        )

        self._task = asyncio.ensure_future(self.client.start())

        return True

    async def async_remove(self) -> None:
        """Remove the callback and stops the client."""
        if self._remove_callback is not None:
            self._remove_callback()
        if self._task is not None:
            self._task.cancel()
            await self._task

    def get_data_update_identifer(self) -> None:
        """Returns the unique data_update itentifier for this connection."""
        return f"{DATA_UPDATED}_{self.config_entry.data[CONF_ADDRESS]}"

    def get_sensor_added_identifer(self) -> None:
        """Returns the unique sensor_added itentifier for this connection."""
        return f"{SENSOR_ADDED}_{self.config_entry.data[CONF_ADDRESS]}"

    def get_sensor_removed_identifer(self) -> None:
        """Returns the unique sensor_removed itentifier for this connection."""
        return f"{SENSOR_REMOVED}_{self.config_entry.data[CONF_ADDRESS]}"

    def handle_error_received(self, error: Any) -> None:
        """Handle received error message."""
        _LOGGER.warning(
            "%s received error: %s", self.config_entry.data[CONF_ADDRESS], error
        )

    def handle_slots_data_received(self, data: Any) -> None:
        """Handle received slots data."""
        if PyOnMessageTypes.SLOTS.value in self.data:
            added, removed = self.calculate_slot_changes(data)
            async_dispatcher_send(self.hass, self.get_sensor_added_identifer(), added)
            async_dispatcher_send(
                self.hass, self.get_sensor_removed_identifer(), removed
            )
        else:
            async_dispatcher_send(self.hass, self.get_sensor_added_identifer(), data)

    def calculate_slot_changes(self, slots: dict) -> Tuple[dict, dict]:
        """Get added and removed slots."""
        added = list(
            itertools.filterfalse(
                lambda slot: (
                    slot["id"] != entry["id"]
                    for entry in self.data[PyOnMessageTypes.SLOTS.value]
                ),
                slots,
            )
        )
        removed = list(
            itertools.filterfalse(
                lambda entry: (entry["id"] != slot["id"] for slot in slots),
                self.data[PyOnMessageTypes.SLOTS.value],
            )
        )
        return added, removed

    @property
    def available(self):
        """Is the Folding@Home client available."""
        return self._available
