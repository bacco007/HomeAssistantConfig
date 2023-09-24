"""Portainer HA shared entity model."""
from __future__ import annotations

from collections.abc import Mapping
from logging import getLogger
from typing import Any, Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION, CONF_HOST, CONF_NAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    entity_platform as ep,
    entity_registry as er,
)
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
)
from homeassistant.helpers.entity import DeviceInfo, Entity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify

from .const import ATTRIBUTION, DOMAIN
from .coordinator import PortainerCoordinator
from .helper import format_attribute

_LOGGER = getLogger(__name__)


# ---------------------------
#   async_add_entities
# ---------------------------
async def async_add_entities(
    hass: HomeAssistant, config_entry: ConfigEntry, dispatcher: dict[str, Callable]
):
    """Add entities."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    platform = ep.async_get_current_platform()
    services = platform.platform.SENSOR_SERVICES
    descriptions = platform.platform.SENSOR_TYPES

    for service in services:
        platform.async_register_entity_service(service[0], service[1], service[2])

    @callback
    async def async_update_controller(coordinator):
        """Update the values of the controller."""

        async def async_check_exist(obj, coordinator, uid: None) -> None:
            """Check entity exists."""
            entity_registry = er.async_get(hass)
            if uid:
                unique_id = f"{obj._inst.lower()}-{obj.description.key}-{slugify(str(obj._data[obj.description.data_reference]).lower())}"
            else:
                unique_id = f"{obj._inst.lower()}-{obj.description.key}"

            entity_id = entity_registry.async_get_entity_id(
                platform.domain, DOMAIN, unique_id
            )
            entity = entity_registry.async_get(entity_id)
            if entity is None or (
                (entity_id not in platform.entities) and (entity.disabled is False)
            ):
                _LOGGER.debug("Add entity %s", entity_id)
                await platform.async_add_entities([obj])

        for description in descriptions:
            data = coordinator.data[description.data_path]
            if not description.data_reference:
                if data.get(description.data_attribute) is None:
                    continue
                obj = dispatcher[description.func](coordinator, description)
                await async_check_exist(obj, coordinator, None)
            else:
                for uid in data:
                    obj = dispatcher[description.func](coordinator, description, uid)
                    await async_check_exist(obj, coordinator, uid)

    await async_update_controller(coordinator)
    unsub = async_dispatcher_connect(hass, "update_sensors", async_update_controller)
    config_entry.async_on_unload(unsub)


# ---------------------------
#   PortainerEntity
# ---------------------------
class PortainerEntity(CoordinatorEntity[PortainerCoordinator], Entity):
    """Define entity."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: PortainerCoordinator,
        description,
        uid: str | None = None,
    ) -> None:
        """Initialize entity."""
        super().__init__(coordinator)
        self.manufacturer = "Docker"
        self.sw_version = ""
        self.coordinator = coordinator
        self.description = description
        self._inst = coordinator.config_entry.data[CONF_NAME]
        self._attr_extra_state_attributes = {ATTR_ATTRIBUTION: ATTRIBUTION}
        self._uid = uid
        self._data = coordinator.data[self.description.data_path]
        if self._uid:
            self._data = coordinator.data[self.description.data_path][self._uid]

    @callback
    def _handle_coordinator_update(self) -> None:
        self._data = self.coordinator.data[self.description.data_path]
        if self._uid:
            self._data = self.coordinator.data[self.description.data_path][self._uid]
        super()._handle_coordinator_update()

    @property
    def name(self) -> str:
        """Return the name for this entity."""
        if not self._uid:
            return f"{self.description.name}"

        if self.description.name:
            return f"{self._data[self.description.data_name]} {self.description.name}"

        return f"{self._data[self.description.data_name]}"

    @property
    def unique_id(self) -> str:
        """Return a unique id for this entity."""
        if self._uid:
            return f"{self._inst.lower()}-{self.description.key}-{slugify(str(self._data[self.description.data_reference]).lower())}"
        else:
            return f"{self._inst.lower()}-{self.description.key}"

    @property
    def available(self) -> bool:
        """Return if controller is available."""
        return self.coordinator.connected()

    @property
    def device_info(self) -> DeviceInfo:
        """Return a description for device registry."""
        dev_connection = DOMAIN
        dev_connection_value = f"{self.coordinator.name}_{self.description.ha_group}"
        dev_group = self.description.ha_group
        if self.description.ha_group.startswith("data__"):
            dev_group = self.description.ha_group[6:]
            if dev_group in self._data:
                dev_group = self._data[dev_group]
                dev_connection_value = dev_group

        if self.description.ha_connection:
            dev_connection = self.description.ha_connection

        if self.description.ha_connection_value:
            dev_connection_value = self.description.ha_connection_value
            if dev_connection_value.startswith("data__"):
                dev_connection_value = dev_connection_value[6:]
                dev_connection_value = self._data[dev_connection_value]

        if self.description.ha_group == "System":
            return DeviceInfo(
                connections={(dev_connection, f"{dev_connection_value}")},
                identifiers={(dev_connection, f"{dev_connection_value}")},
                name=f"{self._inst} {dev_group}",
                manufacturer=f"{self.manufacturer}",
                sw_version=f"{self.sw_version}",
                configuration_url=f"http://{self.coordinator.config_entry.data[CONF_HOST]}",
            )
        else:
            return DeviceInfo(
                connections={(dev_connection, f"{dev_connection_value}")},
                default_name=f"{self._inst} {dev_group}",
                default_manufacturer=f"{self.manufacturer}",
            )

    @property
    def extra_state_attributes(self) -> Mapping[str, Any]:
        """Return the state attributes."""
        attributes = super().extra_state_attributes
        for variable in self.description.data_attributes_list:
            if variable in self._data:
                attributes[format_attribute(variable)] = self._data[variable]

        return attributes

    async def start(self):
        """Run function."""
        raise NotImplementedError()

    async def stop(self):
        """Stop function."""
        raise NotImplementedError()

    async def restart(self):
        """Restart function."""
        raise NotImplementedError()

    async def reload(self):
        """Reload function."""
        raise NotImplementedError()

    async def snapshot(self):
        """Snapshot function."""
        raise NotImplementedError()
