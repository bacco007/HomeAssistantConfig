from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, DEFAULT_ICON, DEFAULT_NAME, DEFAULT_UNIT, DOMAIN
from .coordinator import DoomsdayClockCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Doomsday Clock sensors from config entry."""
    coordinator = DoomsdayClockCoordinator(hass, entry.data)
    await coordinator.async_config_entry_first_refresh()

    async_add_entities(
        [
            DoomsdayClockMinutesSensor(coordinator, entry),
            DoomsdayClockTimeSensor(coordinator, entry),
            DoomsdayClockSentenceSensor(coordinator, entry),
        ]
    )


class DoomsdayClockBaseSensor(CoordinatorEntity[DoomsdayClockCoordinator], SensorEntity):
    """Base sensor for Doomsday Clock."""

    _attr_has_entity_name = False

    def __init__(self, coordinator: DoomsdayClockCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._entry = entry

    @property
    def device_info(self) -> dict:
        """Return device info."""
        return {
            "identifiers": {(DOMAIN, "main")},
            "name": DEFAULT_NAME,
            "manufacturer": "Bulletin of the Atomic Scientists",
            "model": "Doomsday Clock",
            "entry_type": "service",
            "configuration_url": self.coordinator.resource,
        }

    @property
    def extra_state_attributes(self) -> dict:
        """Return common attributes."""
        attrs = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }
        if self.coordinator.data:
            attrs["selector_used"] = self.coordinator.data.selector_used
        return attrs


class DoomsdayClockMinutesSensor(DoomsdayClockBaseSensor):
    """Main Doomsday Clock minutes sensor."""

    def __init__(self, coordinator: DoomsdayClockCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_name = entry.title or DEFAULT_NAME
        self._attr_unique_id = "doomsday_clock_main_minutes"
        self._attr_icon = DEFAULT_ICON
        self._attr_native_unit_of_measurement = DEFAULT_UNIT
        self._attr_native_precision = 1

    @property
    def native_value(self) -> float | None:
        """Return minutes to midnight."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.minutes_to_midnight


class DoomsdayClockTimeSensor(DoomsdayClockBaseSensor):
    """Diagnostic time sensor."""

    def __init__(self, coordinator: DoomsdayClockCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_name = "Doomsday Clock Time"
        self._attr_unique_id = "doomsday_clock_main_time"
        self._attr_icon = "mdi:clock-outline"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> str | None:
        """Return formatted time to midnight."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.midnight_time


class DoomsdayClockSentenceSensor(DoomsdayClockBaseSensor):
    """Diagnostic raw sentence sensor."""

    def __init__(self, coordinator: DoomsdayClockCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_name = "Doomsday Clock Sentence"
        self._attr_unique_id = "doomsday_clock_main_sentence"
        self._attr_icon = "mdi:text-box-outline"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> str | None:
        """Return raw parsed sentence."""
        if not self.coordinator.data:
            return None
        return self.coordinator.data.sentence