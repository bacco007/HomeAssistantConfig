"""Binary sensors for Moon Astro."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import KEY_ABOVE_HORIZON
from .coordinator import MoonAstroCoordinator
from .utils import get_entry_coordinators, get_entry_device_info


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up binary sensor entities.

    Args:
        hass: Home Assistant instance.
        entry: The config entry being set up.
        async_add_entities: Callback used to register entities.

    Returns:
        None.
    """
    coordinator, _events_coordinator = get_entry_coordinators(hass, entry)
    if coordinator is None:
        return

    device_info = get_entry_device_info(entry)

    async_add_entities(
        [MoonAboveHorizonBinary(coordinator, entry.entry_id, device_info)],
        update_before_add=False,
    )


class MoonAboveHorizonBinary(
    CoordinatorEntity[MoonAstroCoordinator], BinarySensorEntity
):
    """Binary sensor indicating whether the Moon is above the horizon.

    This entity avoids unnecessary state writes by only writing when the computed value
    changes compared to the last written value.
    """

    def __init__(
        self, coordinator: MoonAstroCoordinator, entry_id: str, device_info: DeviceInfo
    ) -> None:
        """Initialize the Moon above horizon binary sensor.

        Args:
            coordinator: Data coordinator instance.
            entry_id: Config entry identifier.
            device_info: Device metadata shared by all entities of the entry.

        Returns:
            None.
        """
        super().__init__(coordinator)
        self._attr_unique_id = f"moon_astro_{entry_id}_above_horizon"
        self._attr_has_entity_name = True
        self._attr_translation_key = "above_horizon"
        self._attr_device_info = device_info
        # Stable slug for entity_id creation
        self._attr_suggested_object_id = "above_horizon"

        self._last_written_is_on: bool | None = None

    def _compute_is_on(self) -> bool | None:
        """Compute the current binary value without triggering a state write.

        Returns:
            True if above the horizon, False if below, or None if unknown.
        """
        data = self.coordinator.data
        if data is None:
            return None
        return bool(data.get(KEY_ABOVE_HORIZON, False))

    @property
    def is_on(self) -> bool | None:
        """Return the current binary state.

        Returns:
            True if the Moon is above the horizon, False if below, or None if no
            data is available yet.
        """
        return self._compute_is_on()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator.

        This method avoids updating the entity state if the computed value is unchanged.
        """
        new_state = self._compute_is_on()
        if new_state is None and self._last_written_is_on is None:
            return
        if self._last_written_is_on == new_state:
            return

        self._last_written_is_on = new_state
        self.async_write_ha_state()

    @property
    def icon(self) -> str:
        """Return an icon for the current state.

        Returns:
            An MDI icon name.
        """
        state = self.is_on
        if state is None:
            return "mdi:help-circle-outline"
        return "mdi:chevron-up-circle" if state else "mdi:chevron-down-circle-outline"
