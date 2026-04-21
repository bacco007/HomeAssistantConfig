"""Calendar platform for Supercars Championship."""
from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .schedule_coordinator import ScheduleCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Supercars calendar."""
    schedule_coordinator: ScheduleCoordinator = hass.data[DOMAIN][entry.entry_id]["schedule"]
    async_add_entities([SupercarsCalendar(schedule_coordinator)])


class SupercarsCalendar(CoordinatorEntity, CalendarEntity):
    """A calendar entity for Supercars sessions."""

    _attr_has_entity_name = True
    _attr_name = "Supercars Schedule"
    _attr_icon = "mdi:calendar-star"

    def __init__(self, coordinator: ScheduleCoordinator) -> None:
        """Initialize the calendar entity."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_calendar"

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming calendar event."""
        data = self.coordinator.data
        if not data or not data.get("all_sessions"):
            return None

        # all_sessions is sorted by start time.
        # Find the next session that hasn't finished yet.
        # Assuming each session is about 1 hour for display purposes if not specified.
        now = datetime.utcnow()
        
        for session in data["all_sessions"]:
            try:
                start = datetime.fromisoformat(session["start_iso"])
                # Return the first session that starts in the future, or is currently ongoing (within 1 hr)
                if start.replace(tzinfo=None) + timedelta(hours=1) > now:
                    return self._create_calendar_event(session, data.get("event", "Supercars Event"))
            except ValueError:
                continue

        return None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Return calendar events within a datetime range."""
        data = self.coordinator.data
        if not data or not data.get("all_sessions"):
            return []

        events = []
        event_name = data.get("event", "Supercars Event")

        for session in data["all_sessions"]:
            try:
                start = datetime.fromisoformat(session["start_iso"])
                # Standardize comparison by making them offset-aware or naive.
                # Since start_date and end_date from HA are typically tz-aware in UTC.
                if start_date <= start <= end_date:
                    events.append(self._create_calendar_event(session, event_name))
            except ValueError:
                continue

        return events

    def _create_calendar_event(self, session: dict, event_name: str) -> CalendarEvent:
        """Create a CalendarEvent from a session dict."""
        start = datetime.fromisoformat(session["start_iso"])
        # Give events a default duration of 1 hour
        end = start + timedelta(hours=1)
        
        return CalendarEvent(
            summary=f"Supercars: {session['label']}",
            start=start,
            end=end,
            description=f"{event_name} - {session['label']}",
            location="Supercars",
        )
