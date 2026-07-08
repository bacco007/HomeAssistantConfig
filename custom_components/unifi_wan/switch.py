from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, CONF_AUTO_SPEEDTEST


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    shared = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [UniFiAutoSpeedtestSwitch(entry, shared, entry.entry_id, shared["device_info"])]
    )


class UniFiAutoSpeedtestSwitch(SwitchEntity):
    """Enable/disable the automatic speedtest schedule.

    The config entry options are the single source of truth: toggling the
    switch persists the new state to the entry options, which reloads the
    entry and (re)schedules the timer accordingly.
    """

    _attr_name = "UniFi WAN Auto Speedtest"
    _attr_icon = "mdi:speedometer-slow"
    _attr_should_poll = False

    def __init__(
        self,
        entry: ConfigEntry,
        shared: dict[str, Any],
        entry_id: str,
        device_info: dict[str, Any],
    ):
        self._entry = entry
        self._shared = shared
        self._attr_unique_id = f"{entry_id}_auto_speedtest_enabled"
        self._attr_device_info = device_info

    @property
    def is_on(self) -> bool:
        return bool(self._shared.get("auto_enabled", False))

    def _set_enabled(self, enabled: bool) -> None:
        self._shared["manage_auto"](enabled)
        self._shared["auto_enabled"] = enabled
        self.async_write_ha_state()
        options = dict(self._entry.options)
        if options.get(CONF_AUTO_SPEEDTEST) != enabled:
            options[CONF_AUTO_SPEEDTEST] = enabled
            self.hass.config_entries.async_update_entry(self._entry, options=options)

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._set_enabled(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._set_enabled(False)
