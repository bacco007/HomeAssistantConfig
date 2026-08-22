"""Button entities for CAP Alerts: on-demand refresh."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.helpers.device_registry import DeviceInfo

from .coordinator import AlertsDataUpdateCoordinator

# The press delegates to the coordinator's debouncer, which already serializes
# and rate-limits fetches, so no additional cap is needed here.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass,
    entry: ConfigEntry,
    async_add_entities,
) -> None:
    """Set up the CAP Alerts refresh button."""
    coordinator: AlertsDataUpdateCoordinator = entry.runtime_data
    async_add_entities([RefreshButton(coordinator, entry)])


class RefreshButton(ButtonEntity):
    """Button that forces an off-cycle fetch from the provider.

    Useful in both ECCC ingestion modes: while streaming it runs the GeoRSS
    backfill that otherwise only fires on the safety-resync interval; while
    polling it brings the next poll forward. Other providers get an ordinary
    fetch-now.

    Deliberately not a ``CoordinatorEntity``: it displays no coordinator data, and
    the base class ties ``available`` to ``last_update_success`` — which would
    make the button disappear exactly when a failed update makes it most useful.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "refresh"

    def __init__(
        self,
        coordinator: AlertsDataUpdateCoordinator,
        entry: ConfigEntry,
    ) -> None:
        self._coordinator = coordinator
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_refresh"

    @property
    def device_info(self) -> DeviceInfo:
        return self._coordinator.device_info

    async def async_press(self) -> None:
        """Request an off-cycle provider fetch.

        Goes through the coordinator's debouncer rather than ``async_refresh`` so
        repeated presses cannot hammer the ~7 MB GeoRSS feed.
        """
        await self._coordinator.async_request_refresh()
