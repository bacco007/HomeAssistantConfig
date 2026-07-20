"""Switch entities for Sundial.

A single master "adaptive lighting" switch toggles adaptation for the whole
instance. Everything else is configured in the web-ui panel.
"""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, PANEL_TITLE, SIGNAL_CONFIG_UPDATED
from .coordinator import SundialCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the master switch."""
    coordinator: SundialCoordinator = hass.data[DOMAIN]
    async_add_entities([SundialMasterSwitch(coordinator, entry)])


class SundialMasterSwitch(SwitchEntity, RestoreEntity):
    """Enable/disable adaptation for the whole instance."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_name = "Adaptive lighting"
    _attr_icon = "mdi:theme-light-dark"

    def __init__(self, coordinator: SundialCoordinator, entry: ConfigEntry) -> None:
        self.coordinator = coordinator
        self._entry = entry

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name=PANEL_TITLE,
            manufacturer="Sundial",
            entry_type=None,
        )

    @property
    def unique_id(self) -> str:
        return f"{self._entry.entry_id}_master"

    @property
    def is_on(self) -> bool:
        return self.coordinator.enabled

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_CONFIG_UPDATED, self._handle_update
            )
        )
        last_state = await self.async_get_last_state()
        if last_state is not None:
            self.coordinator.set_enabled(last_state.state == "on")

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs) -> None:
        self.coordinator.set_enabled(True)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        self.coordinator.set_enabled(False)
        self.async_write_ha_state()
