from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    shared = hass.data[DOMAIN][entry.entry_id]
    meta = shared.get("dev_meta", {})
    host = shared["host"]
    site = shared["site"]
    devname = f"UniFi WAN ({host} / {site})"
    async_add_entities([UniFiAutoSpeedtestSwitch(shared, host, site, devname, meta)])


class UniFiAutoSpeedtestSwitch(SwitchEntity, RestoreEntity):
    _attr_name = "UniFi WAN Auto Speedtest"
    _attr_icon = "mdi:speedometer-slow"
    _attr_should_poll = False

    def __init__(
        self,
        shared: dict[str, Any],
        host: str,
        site: str,
        devname: str,
        meta: dict[str, Any],
    ):
        self._shared = shared
        self._host = host
        self._site = site
        self._devname = devname
        self._meta = meta

    async def async_added_to_hass(self) -> None:
        last_state = await self.async_get_last_state()
        if last_state is not None:
            is_on = last_state.state == STATE_ON
            self._shared["manage_auto"](is_on)
            self._shared["auto_enabled"] = is_on

    @property
    def unique_id(self) -> str:
        return f"{self._host}_{self._site}_auto_speedtest_enabled"

    @property
    def device_info(self) -> dict[str, Any]:
        return {
            "identifiers": {(DOMAIN, self._host, self._site)},
            "name": self._devname,
            "manufacturer": "Ubiquiti",
            "model": self._meta.get("model"),
        }

    @property
    def is_on(self) -> bool:
        return bool(self._shared.get("auto_enabled", False))

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._shared["manage_auto"](True)
        self._shared["auto_enabled"] = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._shared["manage_auto"](False)
        self._shared["auto_enabled"] = False
        self.async_write_ha_state()
