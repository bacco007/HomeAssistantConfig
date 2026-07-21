from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, CONF_AUTO_SPEEDTEST
from . import UniFiWanRuntimeData


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    runtime: UniFiWanRuntimeData = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [UniFiAutoSpeedtestSwitch(entry, runtime, entry.entry_id, runtime.device_info)]
    )


class UniFiAutoSpeedtestSwitch(SwitchEntity):
    """Enable/disable the automatic speedtest schedule.

    Toggling applies the new state live via ``manage_auto`` and persists it to
    the config entry options for restart survival. The update listener skips the
    otherwise-automatic reload for this option, so toggling does not briefly
    mark every entity unavailable.
    """

    _attr_name = "UniFi WAN Auto Speedtest"
    _attr_icon = "mdi:speedometer-slow"
    _attr_should_poll = False

    def __init__(
        self,
        entry: ConfigEntry,
        runtime: UniFiWanRuntimeData,
        entry_id: str,
        device_info: dict[str, Any],
    ):
        self._entry = entry
        self._runtime = runtime
        self._attr_unique_id = f"{entry_id}_auto_speedtest_enabled"
        self._attr_device_info = device_info

    async def async_added_to_hass(self) -> None:
        # Reflect changes made through the options dialog (which are applied
        # live rather than via a reload).
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, self._runtime.auto_changed_signal, self._signal_update
            )
        )

    @callback
    def _signal_update(self) -> None:
        self.async_write_ha_state()

    @property
    def is_on(self) -> bool:
        return bool(self._runtime.auto_enabled)

    def _set_enabled(self, enabled: bool) -> None:
        self._runtime.manage_auto(enabled)
        self._runtime.auto_enabled = enabled
        self.async_write_ha_state()
        options = dict(self._entry.options)
        if options.get(CONF_AUTO_SPEEDTEST) != enabled:
            options[CONF_AUTO_SPEEDTEST] = enabled
            self.hass.config_entries.async_update_entry(self._entry, options=options)

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._set_enabled(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._set_enabled(False)
