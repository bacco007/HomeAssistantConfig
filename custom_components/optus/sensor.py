import logging
from datetime import timedelta

from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

from . import OptusEntity
from .const import DOMAIN, SENSORS

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Add the Entities from the config."""
    entry = hass.data[DOMAIN][config_entry.entry_id]
    sensors = []
    for key, value in SENSORS.items():
        async_add_entities([AccountSensor(entry, key, config_entry.options)], True)


class AccountSensor(
    OptusEntity,
    Entity,
):
    def __init__(self, coordinator, sensor, options):

        self.sensor = sensor
        self.options = options
        self._attr = {}
        self.coordinator = coordinator
        self._device_id = "optus_" + sensor

    def get_value(self, ftype):
        if ftype == "state":
            if self.sensor == "daysRemaining":
                return self.coordinator.data[self.sensor]
            elif self.sensor == "smsUsage":
                return self.coordinator.data[self.sensor]["amount"]
            elif self.sensor == "mmsUsage":
                return self.coordinator.data[self.sensor]["amount"]
            elif self.sensor == "tierVoiceUsage":
                return self.coordinator.data[self.sensor]["totalCharge"]
            elif self.sensor == "tierDataUsage":
                return self.coordinator.data[self.sensor]["totalDataUsed"]
            elif self.sensor == "sharedTierDataUsage":
                return self.coordinator.data[self.sensor]["totalDataUsed"]
            elif self.sensor == "planName":
                return self.coordinator.data[self.sensor]
            elif self.sensor == "billEndDate":
                return self.coordinator.data[self.sensor]
        elif ftype == "measurement":
            if self.sensor == "daysRemaining":
                return None
            elif self.sensor == "tierDataUsage":
                return "kbs"
            elif self.sensor == "sharedTierDataUsage":
                return "kbs"
        elif ftype == "attribute":
            if self.sensor in [
                "sharedTierDataUsage",
                "tierVoiceUsage",
                "tierDataUsage",
            ]:
                data = dict()
                for key, value in self.coordinator.data[self.sensor].items():
                    if key != "tiers":
                        data[key] = value
                return data

    @property
    def name(self):
        return "optus_" + self.sensor

    @property
    def state(self):
        return self.get_value("state")

    @property
    def device_id(self):
        return self.device_id

    @property
    def device_state_attributes(self):
        return self.get_value("attribute")

    @property
    def unit_of_measurement(self):
        return self.get_value("measurement")

    @property
    def icon(self):
        return SENSORS[self.sensor]["icon"]
