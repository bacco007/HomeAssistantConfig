"""Calendar platform for Armadarr."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from homeassistant.components.calendar import (
    CalendarEntity,
    CalendarEntityDescription,
    CalendarEvent,
)

from .entity import ArmadarrEntity

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from .coordinator import DailyCoordinator, StandardCoordinator
    from .data import ArmadarrConfigEntry


async def async_setup_entry(
    _hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the calendar platform."""
    app_type = entry.data["app_type"]

    if app_type in ["Sonarr", "Radarr", "Lidarr", "Readarr", "Whisparr"]:
        coordinator: StandardCoordinator = entry.runtime_data.standard_coordinator

        description = CalendarEntityDescription(
            key="calendar",
            name=f"{app_type} Calendar",
            icon="mdi:calendar",
        )

        async_add_entities([ArmadarrCalendar(coordinator, description)])


class ArmadarrCalendar(ArmadarrEntity, CalendarEntity):
    """Armadarr Calendar class."""

    def __init__(
        self,
        coordinator: StandardCoordinator | DailyCoordinator,
        description: CalendarEntityDescription,
    ) -> None:
        """Initialize the calendar."""
        super().__init__(coordinator, description)

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        events = self._get_events()
        return events[0] if events else None

    async def async_get_events(
        self,
        _hass: HomeAssistant,
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Return calendar events between start and end date."""
        return self._get_events(start_date, end_date)

    def _get_events(
        self,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[CalendarEvent]:
        """Get events from coordinator data."""
        raw_events = self.coordinator.data.get("calendar", [])
        events: list[CalendarEvent] = []
        app_type = self.config_entry.data["app_type"]

        for event in raw_events:
            # Handle different app event structures
            if app_type in ["Sonarr", "Whisparr"]:
                series_title = event.get("series", {}).get("title")
                episode_title = event.get("title")
                if series_title and episode_title:
                    summary = f"{series_title} - {episode_title}"
                else:
                    summary = series_title or episode_title or "Unknown"
            else:
                summary = (
                    event.get("title")
                    or event.get("series", {}).get("title")
                    or event.get("movie", {}).get("title")
                    or "Unknown"
                )
            start = (
                event.get("airDateUtc")
                or event.get("releaseDate")
                or event.get("physicalRelease")
            )

            if not start:
                continue

            try:
                start_dt = datetime.fromisoformat(start)
            except ValueError:
                continue

            if start_date and start_dt < start_date:
                continue
            if end_date and start_dt > end_date:
                continue

            events.append(
                CalendarEvent(
                    summary=summary,
                    start=start_dt,
                    end=start_dt,  # Most are just dates/times, not durations
                    description=event.get("overview") or "",
                )
            )

        return sorted(events, key=lambda x: x.start)
