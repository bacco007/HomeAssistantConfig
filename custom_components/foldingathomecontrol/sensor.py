"""Sensor platform for PyFoldingAtHomeControl."""
from typing import List, Optional

from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import CLIENT, DOMAIN, SENSOR_TYPES, UNSUB_DISPATCHERS
from .foldingathomecontrol_client import FoldingAtHomeControlClient
from .foldingathomecontrol_device import FoldingAtHomeControlDevice


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the PyFoldingAtHomeControl sensors."""

    @callback
    def async_add_sensors(new_slots: List[dict]) -> None:
        """add sensors callback."""

        client = hass.data[DOMAIN][config_entry.entry_id][CLIENT]
        dev: list = []
        for slot in new_slots:
            for sensor_type in SENSOR_TYPES:
                dev.append(
                    FoldingAtHomeControlSensor(
                        client,
                        slot,
                        sensor_type["name"],
                        sensor_type["unit_of_measurement"],
                        sensor_type["icon"],
                    )
                )

        async_add_entities(dev, True)

    unsub_dispatcher = async_dispatcher_connect(
        hass,
        hass.data[DOMAIN][config_entry.entry_id][CLIENT].sensor_added_identifer,
        async_add_sensors,
    )
    hass.data[DOMAIN][config_entry.entry_id][UNSUB_DISPATCHERS].append(unsub_dispatcher)
    if len(hass.data[DOMAIN][config_entry.entry_id][CLIENT].slot_data) > 0:
        async_add_sensors(
            hass.data[DOMAIN][config_entry.entry_id][CLIENT].slot_data.keys()
        )


class FoldingAtHomeControlSensor(FoldingAtHomeControlDevice):
    """Implementation of a FoldingAtHomeControl sensor."""

    def __init__(
        self,
        client: FoldingAtHomeControlClient,
        slot_id: str,
        sensor_type: str,
        unit_of_measurement: str,
        icon: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(client, slot_id)
        self._sensor_type = sensor_type
        self._unit_of_measurement = unit_of_measurement
        self._icon = icon
        self._state: Optional[str] = None
        self._attributes: dict = {}

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self._device_identifier} {self._sensor_type}"

    @property
    def unique_id(self):
        """Set unique_id for sensor."""
        return self.name

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return self._icon

    @property
    def unit_of_measurement(self):
        """Return the unit the value is expressed in."""
        return self._unit_of_measurement

    @property
    def state(self):
        """Return the state of the resources if it has been received yet."""
        if self._sensor_type in self._client.slot_data[self._slot_id]:
            return self._client.slot_data[self._slot_id][self._sensor_type]

    @property
    def device_state_attributes(self):
        """Return the state attributes of the sensor."""
        attr = self._client.options_data.copy()
        attr["description"] = self._client.slot_data[self._slot_id]["Description"]
        return attr
