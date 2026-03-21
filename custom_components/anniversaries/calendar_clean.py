"""Calendar platform for Anniversaries."""
from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers import entity_registry as er
from homeassistant.util import slugify

from .const import DOMAIN
from .coordinator import AnniversaryDataUpdateCoordinator
from .data import AnniversaryData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the calendar platform."""
    coordinator: AnniversaryDataUpdateCoordinator = hass.data[DOMAIN]["coordinator"]
    async_add_entities([AnniversaryCalendar(coordinator, entry.entry_id, entry)])


class AnniversaryCalendar(CoordinatorEntity[AnniversaryDataUpdateCoordinator], CalendarEntity):
    """Anniversary Calendar class."""

    def __init__(
        self,
        coordinator: AnniversaryDataUpdateCoordinator,
        entry_id: str,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the calendar with a stable prefixed entity id."""
        super().__init__(coordinator)
        self._entry = entry
        self._internal_key = entry_id
        self._attr_unique_id = f"{entry.entry_id}_calendar"
        name = (entry.options or entry.data).get("name", "anniversary")
        slug = slugify(name)
        short_id = entry.entry_id.split("-")[0]
        self._suggested_object_id = f"anniversary_{slug}_{short_id}"

    async def async_added_to_hass(self) -> None:
        """Handle entity being added to hass."""
        await super().async_added_to_hass()
        current_eid = self.entity_id
        try:
            domain, object_id = current_eid.split(".")
        except ValueError:
            return
        if not object_id.startswith("anniversary_"):
            clean_object = object_id
            if clean_object.startswith("anniversary") and not clean_object.startswith("anniversary_"):
                clean_object = clean_object[len("anniversary"):].lstrip("_")
            new_object_id = f"anniversary_{clean_object}" if clean_object else "anniversary"
            registry = er.async_get(self.hass)
            registry.async_update_entity(current_eid, new_entity_id=f"{domain}.{new_object_id}")

    @property
    def anniversary(self) -> AnniversaryData | None:
        """Return the anniversary data."""
        if not hasattr(self.coordinator, "anniversaries") or self.coordinator.anniversaries is None:
            return None
        return self.coordinator.anniversaries.get(self._internal_key)

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return self.anniversary is not None

    @property
    def name(self) -> str:
        """Return the name of the calendar."""
        anniversary = self.anniversary
        if anniversary is None:
            return "Unknown Anniversary"
        return anniversary.name

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        anniversary = self.anniversary
        if anniversary is None:
            return None
        
        next_date = anniversary.next_anniversary_date
        description = (
            f"Happy {anniversary.next_years}th anniversary!"
            if anniversary.next_years is not None
            else anniversary.name
        )
        return CalendarEvent(
            summary=anniversary.name,
            start=next_date,
            end=next_date + timedelta(days=1),
            description=description,
        )

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Get all events in a specific time frame."""
        anniversary = self.anniversary
        if anniversary is None:
            return []
        
        events = []
        next_date = anniversary.next_anniversary_date
        if start_date.date() <= next_date <= end_date.date():
            description = (
                f"Happy {anniversary.next_years}th anniversary!"
                if anniversary.next_years is not None
                else anniversary.name
            )
            events.append(
                CalendarEvent(
                    summary=anniversary.name,
                    start=next_date,
                    end=next_date + timedelta(days=1),
                    description=description,
                )
            )
        return events
