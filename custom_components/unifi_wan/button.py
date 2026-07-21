from __future__ import annotations

from typing import Any

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory

from .const import DOMAIN
from . import UniFiWanRuntimeData

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    runtime: UniFiWanRuntimeData = hass.data[DOMAIN][entry.entry_id]

    entry_id = entry.entry_id
    device_info = runtime.device_info
    wan_numbers = runtime.wan_numbers

    entities = [RunSpeedtestButton(runtime, entry_id, device_info)]

    for wan_number in wan_numbers:
        entities.append(
            RunSpeedtestWanButton(runtime, entry_id, device_info, wan_number)
        )

    async_add_entities(entities)


class UniFiSpeedtestButtonBase(ButtonEntity):
    _attr_icon = "mdi:speedometer"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False

    def __init__(self, runtime: UniFiWanRuntimeData, entry_id: str, device_info: dict[str, Any]):
        self._runtime = runtime
        self._attr_device_info = device_info

    def _trigger(self, wan_number: int | None = None) -> None:
        # Fire and forget: the speedtest runner waits for the result (up to
        # several minutes), so run it in the background instead of blocking
        # the button press. Progress is exposed via the In Progress sensor.
        self.hass.async_create_task(self._runtime.run_speedtest_now(wan_number))


class RunSpeedtestButton(UniFiSpeedtestButtonBase):
    _attr_name = "UniFi Run Speedtest"

    def __init__(self, runtime, entry_id, device_info):
        super().__init__(runtime, entry_id, device_info)
        self._attr_unique_id = f"{entry_id}_run_speedtest"

    async def async_press(self) -> None:
        self._trigger()


class RunSpeedtestWanButton(UniFiSpeedtestButtonBase):
    def __init__(self, runtime, entry_id, device_info, wan_number: int):
        super().__init__(runtime, entry_id, device_info)
        self._wan_number = wan_number
        self._attr_name = f"UniFi Run Speedtest WAN{wan_number}"
        self._attr_unique_id = f"{entry_id}_run_speedtest_wan{wan_number}"

    async def async_press(self) -> None:
        self._trigger(self._wan_number)
