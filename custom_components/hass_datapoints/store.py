"""Persistent storage for Hass Data Points."""

from __future__ import annotations

import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


class DatapointsStore:
    """Manages persistent storage of recorded data points."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"events": []}
        self._listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Load data from persistent storage."""
        data = await self._store.async_load()
        if data is not None:
            self._data = data
            for event in self._data.get("events", []):
                # Migrate legacy single entity_id → entity_ids list
                if "entity_id" in event and "entity_ids" not in event:
                    event["entity_ids"] = [event.pop("entity_id")]
                elif "entity_ids" not in event:
                    event["entity_ids"] = []
                # Migrate: add missing target id fields
                for field in ("device_ids", "area_ids", "label_ids"):
                    if field not in event:
                        event[field] = []
                # Migrate: add dev flag
                if "dev" not in event:
                    event["dev"] = False
                # Migrate: add automation_id (None for events recorded before this field existed)
                if "automation_id" not in event:
                    event["automation_id"] = None

    async def async_record(
        self,
        message: str,
        annotation: str | None = None,
        entity_ids: list[str] | None = None,
        device_ids: list[str] | None = None,
        area_ids: list[str] | None = None,
        label_ids: list[str] | None = None,
        icon: str | None = None,
        color: str | None = None,
        date: str | None = None,
        dev: bool = False,
        automation_id: str | None = None,
    ) -> dict[str, Any]:
        """Record a new event and persist it."""
        if date:
            try:
                dt = datetime.fromisoformat(date)
            except ValueError:
                dt = datetime.now(UTC)
            else:
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=UTC)
                # Reject implausible years — avoids out-of-range storage / display bugs
                if not (1970 <= dt.year <= 2100):
                    dt = datetime.now(UTC)
            ts = dt.isoformat()
        else:
            ts = datetime.now(UTC).isoformat()
        event: dict[str, Any] = {
            "id": str(uuid.uuid4()),
            "timestamp": ts,
            "message": message,
            "annotation": annotation if annotation is not None else message,
            "entity_ids": entity_ids or [],
            "device_ids": device_ids or [],
            "area_ids": area_ids or [],
            "label_ids": label_ids or [],
            "icon": icon or "mdi:bookmark",
            "color": color or "#03a9f4",
            "dev": dev,
            "automation_id": automation_id,
        }

        self._data["events"].append(event)
        await self._store.async_save(self._data)
        self._notify_listeners()
        return event

    def get_events(
        self,
        start: str | None = None,
        end: str | None = None,
        entity_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Return events, optionally filtered by time range and entity list.

        Filter logic:
        - Events with no entity_ids are global and always included.
        - Events with entity_ids are included only if they intersect with the
          requested entity_ids list.
        - Results are deduplicated by event id (relevant when multiple entity
          filters would match the same event).
        """
        events: list[dict[str, Any]] = self._data.get("events", [])

        if start is not None:
            events = [e for e in events if e["timestamp"] >= start]
        if end is not None:
            events = [e for e in events if e["timestamp"] <= end]

        if entity_ids is not None:
            requested = set(entity_ids)
            filtered: list[dict[str, Any]] = []
            seen_ids: set[str] = set()
            for event in events:
                ev_entities = set(event.get("entity_ids", []))
                if (not ev_entities or ev_entities & requested) and event[
                    "id"
                ] not in seen_ids:
                    seen_ids.add(event["id"])
                    filtered.append(event)
            events = filtered

        return events

    def get_event_bounds(self) -> tuple[str | None, str | None]:
        """Return the earliest and latest recorded event timestamps."""
        timestamps: list[datetime] = []
        for event in self._data.get("events", []):
            ts = event.get("timestamp")
            if not ts:
                continue
            try:
                timestamps.append(datetime.fromisoformat(ts))
            except ValueError:
                continue

        if not timestamps:
            return None, None

        return min(timestamps).isoformat(), max(timestamps).isoformat()

    def get_event_count(self) -> int:
        """Return the total number of recorded events."""
        return len(self._data.get("events", []))

    def async_add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Register a callback for store mutations and return an unsubscribe function."""
        self._listeners.append(listener)

        def unsubscribe() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return unsubscribe

    def _notify_listeners(self) -> None:
        """Notify registered listeners that the store contents changed."""
        for listener in list(self._listeners):
            listener()

    async def async_update_event(
        self,
        event_id: str,
        message: str | None = None,
        annotation: str | None = None,
        entity_ids: list[str] | None = None,
        device_ids: list[str] | None = None,
        area_ids: list[str] | None = None,
        label_ids: list[str] | None = None,
        icon: str | None = None,
        color: str | None = None,
    ) -> dict[str, Any] | None:
        """Update an existing event. Returns the updated event or None if not found."""
        for event in self._data["events"]:
            if event["id"] == event_id:
                if message is not None:
                    event["message"] = message
                if annotation is not None:
                    event["annotation"] = annotation
                if entity_ids is not None:
                    event["entity_ids"] = entity_ids
                if device_ids is not None:
                    event["device_ids"] = device_ids
                if area_ids is not None:
                    event["area_ids"] = area_ids
                if label_ids is not None:
                    event["label_ids"] = label_ids
                if icon is not None:
                    event["icon"] = icon
                if color is not None:
                    event["color"] = color
                await self._store.async_save(self._data)
                self._notify_listeners()
                return event
        return None

    async def async_delete_dev_events(self) -> int:
        """Delete all dev-flagged events. Returns count of deleted events."""
        original = self._data["events"]
        kept = [e for e in original if not e.get("dev")]
        deleted = len(original) - len(kept)
        if deleted:
            self._data["events"] = kept
            await self._store.async_save(self._data)
            self._notify_listeners()
        return deleted

    async def async_delete_event(self, event_id: str) -> bool:
        """Delete an event by ID. Returns True if found and deleted."""
        original_len = len(self._data["events"])
        self._data["events"] = [e for e in self._data["events"] if e["id"] != event_id]
        if len(self._data["events"]) < original_len:
            await self._store.async_save(self._data)
            self._notify_listeners()
            return True
        return False
