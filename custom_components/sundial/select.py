"""Select entity for Sundial.

Exposes the active schema as an editable dropdown so it can be read and switched
from Home Assistant (dashboards, automations, scripts) — not only the web-ui
panel. The options are the schema names; picking one activates that schema.
"""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, PANEL_TITLE, SIGNAL_CONFIG_UPDATED
from .coordinator import SundialCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the active-schema select."""
    coordinator: SundialCoordinator = hass.data[DOMAIN]
    async_add_entities([SundialSchemaSelect(coordinator, entry)])


class SundialSchemaSelect(SelectEntity):
    """Read/choose which schema currently drives the lights."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_name = "Active schema"
    _attr_icon = "mdi:palette"

    def __init__(self, coordinator: SundialCoordinator, entry: ConfigEntry) -> None:
        self.coordinator = coordinator
        self._entry = entry

    @property
    def unique_id(self) -> str:
        return f"{self._entry.entry_id}_active_schema"

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name=PANEL_TITLE,
            manufacturer="Sundial",
            entry_type=None,
        )

    @property
    def options(self) -> list[str]:
        return [schema.name for schema in self.coordinator.data.schemas.values()]

    @property
    def current_option(self) -> str | None:
        return self.coordinator.data.active_schema.name

    async def async_select_option(self, option: str) -> None:
        schema_id = self._id_for_name(option)
        if schema_id is None:
            return
        self.coordinator.set_active_schema(schema_id)
        await self.coordinator.async_apply_config_change()
        self.async_write_ha_state()

    def _id_for_name(self, name: str) -> str | None:
        """The id of the first schema with ``name`` (names are what we expose)."""
        for schema_id, schema in self.coordinator.data.schemas.items():
            if schema.name == name:
                return schema_id
        return None

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_CONFIG_UPDATED, self._handle_update
            )
        )

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()
