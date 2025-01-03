"""Button support for GTFS Schedule Update."""

from __future__ import annotations

from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from functools import cached_property
import os

from homeassistant.components.button import (
    ButtonDeviceClass,
    ButtonEntity,
    ButtonEntityDescription,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from custom_components.gtfs_realtime import GtfsRealtimeConfigEntry
from custom_components.gtfs_realtime.const import DOMAIN

from .coordinator import GtfsRealtimeCoordinator


@dataclass(frozen=True, kw_only=True)
class GtfsRealtimeButtonDescription(ButtonEntityDescription):
    """GTFS Realtime Button description."""

    press_action: Callable[[GtfsRealtimeCoordinator, os.PathLike], Coroutine]


async def handle_refresh_button_press(
    coordinator: GtfsRealtimeCoordinator, gtfs_static_source: os.PathLike
):
    """Called on pressing refresh feed entity."""
    coordinator.static_update_targets.add(gtfs_static_source)
    await coordinator.async_update_static_data()


BUTTONS: dict[str, GtfsRealtimeButtonDescription] = {
    "refresh": GtfsRealtimeButtonDescription(
        key="refresh",
        translation_key="refresh",
        device_class=ButtonDeviceClass.UPDATE,
        entity_category=EntityCategory.CONFIG,
        press_action=handle_refresh_button_press,
    ),
    "clear": GtfsRealtimeButtonDescription(
        key="clear",
        translation_key="clear",
        device_class=ButtonDeviceClass.UPDATE,
        entity_category=EntityCategory.CONFIG,
        press_action=lambda coordinator: coordinator.async_update_static_data(
            clear_old_data=True
        ),
    ),
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: GtfsRealtimeConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator = config_entry.runtime_data
    async_add_entities(
        [
            ScheduleUpdateButton(coordinator, BUTTONS["refresh"], gtfs_static_source)
            for gtfs_static_source in coordinator.gtfs_static_zip
        ]
        + [ScheduleClearButton(coordinator, BUTTONS["clear"])]
    )


class ScheduleButtonBase(ButtonEntity, CoordinatorEntity):
    entity_description: GtfsRealtimeButtonDescription

    def __init__(
        self,
        coordinator: GtfsRealtimeCoordinator,
        description: GtfsRealtimeButtonDescription,
    ):
        super().__init__(coordinator)
        self.entity_description = description

    @cached_property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, ",".join(self.coordinator.gtfs_static_zip))},
            name="GTFS Schedule",
            manufacturer=self.coordinator.gtfs_provider,
        )


class ScheduleUpdateButton(ScheduleButtonBase):
    def __init__(
        self,
        coordinator: GtfsRealtimeCoordinator,
        description: GtfsRealtimeButtonDescription,
        gtfs_static_source: os.PathLike | None = None,
    ):
        super().__init__(coordinator, description)
        self.gtfs_static_source = gtfs_static_source
        self._attr_unique_id = f"refresh_gtfs_schedule_button-{gtfs_static_source}"
        self._attr_translation_key = description.translation_key
        # Figure out how to use translations for this
        self._attr_name = f"Refresh Schedule Feed: {self.gtfs_static_source}"

    @cached_property
    def extra_state_attributes(self) -> dict[str, str]:
        return {"target_url": str(self.gtfs_static_source)}

    async def async_press(self) -> None:
        """Trigger the button action."""
        await self.entity_description.press_action(
            self.coordinator, self.gtfs_static_source
        )


class ScheduleClearButton(ScheduleButtonBase):
    entity_description: GtfsRealtimeButtonDescription

    def __init__(
        self,
        coordinator: GtfsRealtimeCoordinator,
        description: GtfsRealtimeButtonDescription,
    ):
        super().__init__(coordinator, description)
        self._attr_unique_id = (
            f"clear_gtfs_schedule-{"-".join(coordinator.gtfs_static_zip)}"
        )
        self._attr_translation_key = description.translation_key
        self._attr_name = "Clear GTFS Schedule"

    @cached_property
    def extra_state_attributes(self) -> dict[str, str]:
        return {
            f"target_url {i+1}": url
            for i, url in enumerate(self.coordinator.gtfs_static_zip)
        }

    async def async_press(self) -> None:
        """Trigger the button action."""
        await self.entity_description.press_action(self.coordinator)
