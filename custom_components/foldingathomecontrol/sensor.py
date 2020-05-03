"""Sensor platform for PyFoldingAtHomeControl."""
from typing import List, Optional

from FoldingAtHomeControl import PyOnMessageTypes
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import CONF_ADDRESS, DOMAIN, ICON


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the PyFoldingAtHomeControl sensors."""

    @callback
    def async_add_sensors(new_sensors: List[dict]) -> None:
        """add sensors callback."""

        data = hass.data[DOMAIN][config_entry.entry_id]
        name_prefix: str = config_entry.data[CONF_ADDRESS]
        dev: list = []
        for sensor in new_sensors:
            description = sensor["description"]
            identifier = sensor["id"]
            dev.append(
                FoldingAtHomeControlSensor(data, name_prefix, description, identifier)
            )

        async_add_entities(dev, True)

    async_dispatcher_connect(
        hass,
        hass.data[DOMAIN][config_entry.entry_id].get_sensor_added_identifer(),
        async_add_sensors,
    )
    if PyOnMessageTypes.SLOTS.value in hass.data[DOMAIN][config_entry.entry_id].data:
        async_add_sensors(
            hass.data[DOMAIN][config_entry.entry_id].data[PyOnMessageTypes.SLOTS.value]
        )


class FoldingAtHomeControlSensor(Entity):
    """Implementation of a FoldingAtHomeControl sensor."""

    def __init__(
        self, data, name_prefix: str, description: str, identifier: str
    ) -> None:
        """Initialize the sensor."""
        self.data = data
        self._sensor_name: str = description
        self._name_prefix: str = name_prefix
        self._identifier: str = identifier
        self._state: Optional[str] = None
        self._attributes: dict = {}

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self._name_prefix} {self._sensor_name}"

    @property
    def unique_id(self):
        """Set unique_id for sensor."""
        return self.name

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return ICON

    @property
    def unit_of_measurement(self):
        """Return the unit the value is expressed in."""
        return None

    @property
    def available(self):
        """Could the device be accessed during the last update call."""
        return self.data.available

    @property
    def state(self):
        """Return the state of the resources."""
        return self._state

    @property
    def should_poll(self):
        """Return the polling requirement for this sensor."""
        return False

    @property
    def device_state_attributes(self):
        """Return the state attributes of the sensor."""
        return self._attributes

    async def async_added_to_hass(self) -> None:
        """Handle entity which will be added."""
        async_dispatcher_connect(
            self.hass,
            self.data.get_data_update_identifer(),
            self._schedule_immediate_update,
        )

    @callback
    def _schedule_immediate_update(self):
        self.async_schedule_update_ha_state(True)

    async def async_update(self) -> None:
        """Update the sensor."""
        for slot in self.data.data[PyOnMessageTypes.SLOTS.value]:
            if slot["id"] == self._identifier:
                self._state = slot["status"]
                break

        for unit in self.data.data[PyOnMessageTypes.UNITS.value]:
            if unit["slot"] == self._identifier:
                self._attributes["error"] = unit.get("error")
                self._attributes["project"] = unit.get("project")
                self._attributes["percentdone"] = unit.get("percentdone")
                self._attributes["eta"] = unit.get("eta")
                self._attributes["ppd"] = unit.get("ppd")
                self._attributes["creditestimate"] = unit.get("creditestimate")
                self._attributes["waitingon"] = unit.get("waitingon")
                self._attributes["nextattempt"] = unit.get("nextattempt")
                self._attributes["timeremaining"] = unit.get("timeremaining")
                self._attributes["totalframes"] = unit.get("totalframes")
                self._attributes["framesdone"] = unit.get("framesdone")
                self._attributes["assigned"] = unit.get("assigned")
                self._attributes["timeout"] = unit.get("timeout")
                self._attributes["deadline"] = unit.get("deadline")
                self._attributes["work_server"] = unit.get("ws")
                self._attributes["collection_server"] = unit.get("cs")
                self._attributes["attempts"] = unit.get("attempts")
                self._attributes["tpf"] = unit.get("tpf")
                self._attributes["basecredit"] = unit.get("basecredit")

            options = self.data.data[PyOnMessageTypes.OPTIONS.value]
            self._attributes["power"] = options.get("power")
            self._attributes["team"] = options.get("team")
            self._attributes["user"] = options.get("user")
