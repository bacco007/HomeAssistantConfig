"""OpenNEM Sensor"""
import logging

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo

from . import OpenNEMDataUpdateCoordinator

from .const import (
    ATTRIBUTION,
    DEFAULT_NAME,
    DEFAULT_FORCE_UPDATE,
    DEFAULT_ICON,
    DEVICE_CLASS,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Setup Sensor Platform"""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    config_entry_unique_id = config_entry.unique_id
    async_add_entities([OpenNEMSensor(coordinator, config_entry_unique_id)], True)
    _LOGGER.debug("OpenNEM: Sensor Setup Complete")


class OpenNEMSensor(CoordinatorEntity):
    """Representation of Sensor"""

    coordinator: OpenNEMDataUpdateCoordinator
    _attr_force_update = DEFAULT_FORCE_UPDATE

    def __init__(
        self, coordinator: OpenNEMDataUpdateCoordinator, config_entry_unique_id: str
    ) -> None:
        """Init Sensor"""
        super().__init__(coordinator)
        self._config_entry_unique_id = config_entry_unique_id
        self._name = f"{DEFAULT_NAME} {coordinator.region_name.upper()}"
        self._attr_unique_id = f"{self._config_entry_unique_id}_sensor"
        self._icon = DEFAULT_ICON
        self._state = None

        self._generation = None
        self._renewables = None
        self._lastupdate = None
        self._region = coordinator._region

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.config.entry_id)},
            default_name=f"{DEFAULT_NAME} {self._region.upper()}",
            default_mode=f"{self._region.upper()}",
            name=self._name,
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://opennem.org.au/",
            manufacturer="OpenNEM",
            model=f"{self._region.upper()}",
        )

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
    def device_class(self):
        """Returns Device Class"""
        return DEVICE_CLASS

    @property
    def state(self):
        """Return State of Sensor"""
        if self.coordinator.data:
            _LOGGER.debug(
                "OpenNEM [%s1]: Updating state from %s",
                self._region,
                self.coordinator.data,
            )
            if "generation" in self.coordinator.data.keys():
                self._state = self.coordinator.data["generation"]
            else:
                self._state = None
        return self._state

    @property
    def extra_state_attributes(self):
        """Return Entity specific State Attributes"""
        _LOGGER.debug(
            "OpenNEM [%s1]: Updating attributes from %s",
            self._region,
            self.coordinator.data,
        )
        attrs = {}
        if self.coordinator.data is None:
            return attrs
        attrs[ATTR_ATTRIBUTION] = ATTRIBUTION
        attrs["region"] = self._region
        for val in self.coordinator.data:
            attrs[val] = self.coordinator.data[val]
        return attrs

    @property
    def available(self) -> bool:
        """Return Entity Availability"""
        return self.coordinator.last_update_success
