"""Client for handling the conncection to a FoldingAtHomeControl instance."""

import asyncio
import datetime
from typing import Any, Optional, Tuple

from FoldingAtHomeControl import FoldingAtHomeController, PyOnMessageTypes
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util.dt import as_utc

from .const import (
    _LOGGER,
    CONF_ADDRESS,
    CONF_PASSWORD,
    CONF_PORT,
    CONF_READ_TIMEOUT,
    CONF_UPDATE_RATE,
    DATA_UPDATED,
    DEFAULT_READ_TIMEOUT,
    DEFAULT_UPDATE_RATE,
    SENSOR_ADDED,
    SENSOR_REMOVED,
)
from .timeparse import timeparse


class FoldingAtHomeControlClient:
    """This class handles communication and stores the data."""

    def __init__(self, hass: HomeAssistant, config_entry) -> None:
        """Initialize the class."""
        self.hass = hass
        self.config_entry = config_entry
        self._address = self.config_entry.data[CONF_ADDRESS]
        self._port = self.config_entry.data[CONF_PORT]
        self.slot_data = {}
        self.slots = []
        self.options_data = {}
        self.client = None
        self._remove_callback = None
        self._task = None
        self._available = False
        self.add_options()

    def add_options(self) -> None:
        """Add options for FoldingAtHomeControl integration."""
        if not self.config_entry.options:
            options = {
                CONF_UPDATE_RATE: DEFAULT_UPDATE_RATE,
                CONF_READ_TIMEOUT: DEFAULT_READ_TIMEOUT,
            }
            self.hass.config_entries.async_update_entry(
                self.config_entry, options=options
            )
        else:
            options = dict(self.config_entry.options)
            if CONF_UPDATE_RATE not in self.config_entry.options:
                options[CONF_UPDATE_RATE] = DEFAULT_UPDATE_RATE
            if CONF_READ_TIMEOUT not in self.config_entry.options:
                options[CONF_READ_TIMEOUT] = DEFAULT_READ_TIMEOUT
            self.hass.config_entries.async_update_entry(
                self.config_entry, options=options
            )


    async def async_set_update_rate(self, update_rate: int) -> None:
        """Set update_rate."""
        if self.client is not None:
            await self.client.set_subscription_update_rate_async(update_rate)

    def set_read_timeout(self, read_timeout: int) -> None:
        """Set the Read Timeout."""
        if self.client is not None:
            self.client.set_read_timeout(read_timeout)

    @callback
    def data_received_callback(self, message_type: str, data: Any) -> None:
        """Called when data is received from the Folding@Home client."""
        self._available = True
        if message_type == PyOnMessageTypes.SLOTS.value:
            self.handle_slots_data_received(data)
        if message_type == PyOnMessageTypes.UNITS.value:
            self.handle_unit_data_received(data)
        if message_type == PyOnMessageTypes.OPTIONS.value:
            self.handle_options_data_received(data)
        if message_type == PyOnMessageTypes.ERROR.value:
            self.handle_error_received(data)
        async_dispatcher_send(self.hass, self.data_update_identifer)

    @callback
    def on_disconnect_callback(self) -> None:
        """Called when data is received from the Folding@Home client."""
        if self._available:
            self._available = False
            _LOGGER.error(
                "Got disconnected from %s:%s. Trying to reconnect.",
                self.config_entry.data[CONF_ADDRESS],
                self.config_entry.data[CONF_PORT],
            )
            async_dispatcher_send(self.hass, self.data_update_identifer)

    async def async_setup(self) -> bool:
        """Set up the Folding@Home client."""
        address = self.config_entry.data[CONF_ADDRESS]
        port = self.config_entry.data[CONF_PORT]
        password = self.config_entry.data.get(CONF_PASSWORD)
        update_rate = self.config_entry.options[CONF_UPDATE_RATE]
        read_timeout = self.config_entry.options[CONF_READ_TIMEOUT]
        self.client = FoldingAtHomeController(
            address, port, password, update_rate=update_rate, read_timeout=read_timeout
        )
        self._remove_callback = self.client.register_callback(
            self.data_received_callback
        )

        self.hass.async_create_task(
            self.hass.config_entries.async_forward_entry_setup(
                self.config_entry, "sensor"
            )
        )

        self.client.on_disconnect(self.on_disconnect_callback)
        self._task = asyncio.ensure_future(self.client.start())

        return True

    async def async_remove(self) -> None:
        """Remove the callback and stops the client."""
        if self._remove_callback is not None:
            self._remove_callback()
        if self._task is not None:
            try:
                self._task.cancel()
                await self._task
            except asyncio.CancelledError:
                pass

    def handle_error_received(self, error: Any) -> None:
        """Handle received error message."""
        _LOGGER.warning("%s received error: %s", self.address, error)

    def handle_unit_data_received(self, data: Any) -> None:
        """Handle unit data received."""
        slots_in_data_handled = []
        for unit in data:
            if unit["slot"] not in slots_in_data_handled or unit["state"] == "Running":
                #  For more than one unit for a slot take the one which is running
                slots_in_data_handled.append(unit["slot"])
                if self.slot_data.get(unit["slot"]) is None:
                    self.slot_data[unit["slot"]] = {}
                self.slot_data[unit["slot"]]["Error"] = unit.get("error")
                self.slot_data[unit["slot"]]["Project"] = unit.get("project")
                percent_done = unit.get("percentdone")
                if percent_done is not None:
                    percent_done = percent_done.split("%")[0]
                self.slot_data[unit["slot"]]["Percentdone"] = percent_done
                self.slot_data[unit["slot"]][
                    "Estimated Time Finished"
                ] = convert_eta_to_timestamp(unit.get("eta"))
                self.slot_data[unit["slot"]]["Points Per Day"] = unit.get("ppd")
                self.slot_data[unit["slot"]]["Creditestimate"] = unit.get(
                    "creditestimate"
                )
                self.slot_data[unit["slot"]]["Waiting On"] = unit.get("waitingon")
                self.slot_data[unit["slot"]]["Next Attempt"] = unit.get("nextattempt")
                self.slot_data[unit["slot"]]["Total Frames"] = unit.get("totalframes")
                self.slot_data[unit["slot"]]["Frames Done"] = unit.get("framesdone")
                self.slot_data[unit["slot"]]["Assigned"] = unit.get("assigned")
                self.slot_data[unit["slot"]]["Timeout"] = unit.get("timeout")
                self.slot_data[unit["slot"]]["Deadline"] = unit.get("deadline")
                self.slot_data[unit["slot"]]["Work Server"] = unit.get("ws")
                self.slot_data[unit["slot"]]["Collection Server"] = unit.get("cs")
                self.slot_data[unit["slot"]]["Attempts"] = unit.get("attempts")
                tpf = unit.get("tpf")
                if tpf is not None:
                    tpf = timeparse(tpf)  # Convert to seconds e.g. "22 mins 47 secs" to 1367
                self.slot_data[unit["slot"]]["Time per Frame"] = tpf
                self.slot_data[unit["slot"]]["Basecredit"] = unit.get("basecredit")

    def handle_options_data_received(self, data: Any) -> None:
        """Handle options data received."""
        self.options_data["power"] = data.get("power")
        self.options_data["team"] = data.get("team")
        self.options_data["user"] = data.get("user")

    def handle_slots_data_received(self, slots_data: Any) -> None:
        """Handle received slots data."""
        added, removed = self.calculate_slot_changes(slots_data)
        if len(added) > 0:
            async_dispatcher_send(self.hass, self.sensor_added_identifer, added)
            self.slots.extend(added)
        if len(removed) > 0:
            async_dispatcher_send(self.hass, self.sensor_removed_identifer, removed)
            for slot in removed:
                # Remove old data
                del self.slot_data[slot]
                self.slots.remove(slot)
        self.update_slots_data(slots_data)

    def calculate_slot_changes(self, slots: dict) -> Tuple[dict, dict]:
        """Get added and removed slots."""
        added = [slot["id"] for slot in slots if slot["id"] not in self.slots]
        removed = [
            slot
            for slot in self.slots
            if slot not in list(map(lambda x: x["id"], slots))
        ]
        return added, removed

    def update_slots_data(self, data: Any) -> None:
        """Store received slots data."""
        for slot in data:
            self.slot_data[slot["id"]]["Status"] = slot.get("status")
            self.slot_data[slot["id"]]["Description"] = slot.get("description")
            self.slot_data[slot["id"]]["Reason"] = slot.get("reason")
            self.slot_data[slot["id"]]["Idle"] = slot.get("idle")

    @property
    def available(self):
        """Is the Folding@Home client available."""
        return self._available

    @property
    def address(self):
        """The address the Folding@Home client is connected to."""
        return self._address

    @property
    def port(self):
        """The port the Folding@Home client is connected to."""
        return self._port

    @property
    def data_update_identifer(self) -> None:
        """The unique data_update itentifier for this connection."""
        return f"{DATA_UPDATED}_{self.address}"

    @property
    def sensor_added_identifer(self) -> None:
        """The unique sensor_added itentifier for this connection."""
        return f"{SENSOR_ADDED}_{self.address}"

    @property
    def sensor_removed_identifer(self) -> None:
        """The unique sensor_removed itentifier for this connection."""
        return f"{SENSOR_REMOVED}_{self.address}"


def convert_eta_to_timestamp(eta: Optional[str]) -> Optional[str]:
    """Convert relative eta to a timestamp."""
    if eta is None:
        return
    seconds_from_now = timeparse(eta)
    return as_utc(
        datetime.datetime.now() + datetime.timedelta(seconds=seconds_from_now)
    )
