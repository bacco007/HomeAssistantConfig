import logging

import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify
from . import OpenNEMDataUpdateCoordinator

from .const import (
    ATTRIBUTION,
    CONF_REGION,
    COORDINATOR,
    DEFAULT_NAME,
    DEFAULT_ICON,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_REGION): cv.string,
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Get Config from yaml"""
    if DOMAIN not in hass.data.keys():
        hass.data.setdefault(DOMAIN, {})
        config.entry_id = slugify(f"{config.get(CONF_REGION)}")
        config.data = config
    else:
        config.entry_id = slugify(f"{config.get(CONF_REGION)}")
        config.data = config

    # Setup the data coordinator
    coordinator = OpenNEMDataUpdateCoordinator(hass, config)

    # Fetch initial data
    await coordinator.async_refresh()

    hass.data[DOMAIN][config.entry_id] = {
        COORDINATOR: coordinator,
    }
    async_add_entities([OpenNEMSensor(hass, config)], True)


async def async_setup_entry(hass, entry, async_add_entities):
    """Setup Sensor Platform"""
    async_add_entities([OpenNEMSensor(hass, entry)], True)


class OpenNEMSensor(CoordinatorEntity):
    """Representation of Sensor"""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Init Sensor"""
        super().__init__(hass.data[DOMAIN][entry.entry_id][COORDINATOR])
        self._config = entry
        self._name = entry.data[CONF_NAME]
        self._icon = DEFAULT_ICON
        self._state = 0

        self._generation = None
        self._renewables = None
        self._lastupdate = None
        self._region = entry.data[CONF_REGION]
        self.coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]

    @property
    def unique_id(self):
        """Return Unique Identifier"""
        return f"{slugify(self._name)}_{self._config.entry_id}"

    @property
    def name(self):
        """Return Name"""
        return self._name

    @property
    def icon(self):
        """Return Icon"""
        return self._icon

    @property
    def unit_of_measurement(self):
        """Returns Unit of Measure"""
        return "MW"

    @property
    def state(self):
        """Return State of Sensor"""
        if self.coordinator.data is None:
            return None
        elif "state" in self.coordinator.data.keys():
            return self.coordinator.data["state"]
        else:
            return None

    @property
    def extra_state_attributes(self):
        """Return State Message"""
        attrs = {}
        if self.coordinator.data is None:
            return attrs
        attrs[ATTR_ATTRIBUTION] = ATTRIBUTION
        attrs["battery_discharging"] = self.coordinator.data["battery_discharging"]
        attrs["battery_charging"] = self.coordinator.data["battery_charging"]
        attrs["bioenergy_biomass"] = self.coordinator.data["bioenergy_biomass"]
        attrs["bioenergy_biogas"] = self.coordinator.data["bioenergy_biogas"]
        attrs["coal_black"] = self.coordinator.data["coal_black"]
        attrs["coal_brown"] = self.coordinator.data["coal_brown"]
        attrs["distillate"] = self.coordinator.data["distillate"]
        attrs["gas_ccgt"] = self.coordinator.data["gas_ccgt"]
        attrs["gas_ocgt"] = self.coordinator.data["gas_ocgt"]
        attrs["gas_recip"] = self.coordinator.data["gas_recip"]
        attrs["gas_steam"] = self.coordinator.data["gas_steam"]
        attrs["gas_wcmg"] = self.coordinator.data["gas_wcmg"]
        attrs["hydro"] = self.coordinator.data["hydro"]
        attrs["pumps"] = self.coordinator.data["pumps"]
        attrs["solar_utility"] = self.coordinator.data["solar_utility"]
        attrs["solar_rooftop"] = self.coordinator.data["solar_rooftop"]
        attrs["wind"] = self.coordinator.data["wind"]
        attrs["exports"] = self.coordinator.data["exports"]
        attrs["imports"] = self.coordinator.data["imports"]
        attrs["price"] = self.coordinator.data["price"]
        attrs["temperature"] = self.coordinator.data["temperature"]
        attrs["demand"] = self.coordinator.data["demand"]
        attrs["fossilfuel"] = self.coordinator.data["fossilfuel"]
        attrs["generation"] = self.coordinator.data["generation"]
        attrs["renewables"] = self.coordinator.data["renewables"]
        attrs["region"] = self._region
        attrs["last_update"] = self.coordinator.data["last_update"]
        return attrs

    @property
    def available(self) -> bool:
        """Return Entity Availability"""
        return self.coordinator.last_update_success
