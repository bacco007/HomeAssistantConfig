"""Persistent storage for Hass Data Points."""

from __future__ import annotations

import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    EVENT_MONITORS_UPDATED,
    MONITOR_SCAN_HISTORY_MAX,
    STORAGE_KEY,
    STORAGE_VERSION,
)


class DatapointsStore:
    """Manages persistent storage of recorded data points."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"events": [], "monitors": []}
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
            # Migrate: add monitors key if absent (v1 → v2)
            if "monitors" not in self._data:
                self._data["monitors"] = []
            # Migrate: add baseline and dismissal fields to existing monitors
            for m in self._data.get("monitors", []):
                if "baseline_entity_id" not in m:
                    m["baseline_entity_id"] = None
                if "dismissed_windows" not in m:
                    m["dismissed_windows"] = []
                if "active_clusters_summary" not in m:
                    m["active_clusters_summary"] = []
                if "active_cluster_count" not in m:
                    m["active_cluster_count"] = m.get("last_cluster_count", 0)
                if "last_resolved_clusters_summary" not in m:
                    m["last_resolved_clusters_summary"] = []

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
        limit: int | None = None,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Return events, optionally filtered by time range and entity list.

        Filter logic:
        - Events with no entity_ids are global and always included.
        - Events with entity_ids are included only if they intersect with the
          requested entity_ids list.
        - Results are deduplicated by event id (relevant when multiple entity
          filters would match the same event).
        - limit/offset provide pagination; limit=None returns all matches.
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

        if offset:
            events = events[offset:]
        if limit is not None:
            events = events[:limit]

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

    def _fire_monitors_updated(self, action: str, monitor_id: str | None) -> None:
        """Notify HA clients that monitor records changed."""
        self._hass.bus.async_fire(
            EVENT_MONITORS_UPDATED,
            {
                "action": action,
                "monitor_id": monitor_id,
            },
        )

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

    def get_last_event(self) -> dict[str, Any] | None:
        """Return the most recently recorded event by timestamp, or None if empty."""
        events = self._data.get("events", [])
        if not events:
            return None
        return max(events, key=lambda e: e.get("timestamp", ""))

    def get_events_count_in_range(self, start: str, end: str | None = None) -> int:
        """Return the count of events within the given ISO timestamp range."""
        return len(self.get_events(start=start, end=end))

    def get_automation_manual_counts(self) -> tuple[int, int]:
        """Return (automation_count, manual_count) for all recorded events."""
        events = self._data.get("events", [])
        automation = sum(1 for e in events if e.get("automation_id"))
        manual = sum(1 for e in events if not e.get("automation_id"))
        return automation, manual

    # ---------------------------------------------------------------------------
    # Monitor CRUD
    # ---------------------------------------------------------------------------

    def get_monitors(self) -> list[dict[str, Any]]:
        """Return the full list of anomaly monitor records."""
        return list(self._data.get("monitors", []))

    def get_monitor(self, monitor_id: str) -> dict[str, Any] | None:
        """Return a single monitor record by ID, or None if not found."""
        for m in self._data.get("monitors", []):
            if m.get("id") == monitor_id:
                return m
        return None

    async def async_create_monitor(self, monitor: dict[str, Any]) -> dict[str, Any]:
        """Persist a new monitor record and notify listeners."""
        if "monitors" not in self._data:
            self._data["monitors"] = []
        self._data["monitors"].append(monitor)
        await self._store.async_save(self._data)
        self._notify_listeners()
        self._fire_monitors_updated("created", monitor.get("id"))
        return monitor

    async def async_update_monitor(
        self, monitor_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Apply *updates* to the monitor identified by *monitor_id*.

        Returns the updated record, or None if the monitor was not found.
        """
        for m in self._data.get("monitors", []):
            if m.get("id") == monitor_id:
                m.update(updates)
                await self._store.async_save(self._data)
                self._notify_listeners()
                self._fire_monitors_updated("updated", monitor_id)
                return m
        return None

    async def async_delete_monitor(self, monitor_id: str) -> bool:
        """Delete the monitor identified by *monitor_id*.

        Returns True if the monitor was found and deleted.
        """
        original_len = len(self._data.get("monitors", []))
        self._data["monitors"] = [
            m for m in self._data.get("monitors", []) if m.get("id") != monitor_id
        ]
        if len(self._data["monitors"]) < original_len:
            await self._store.async_save(self._data)
            self._notify_listeners()
            self._fire_monitors_updated("deleted", monitor_id)
            return True
        return False

    @staticmethod
    def prune_dismissed_windows(monitor: dict[str, Any], now: datetime) -> None:
        """Remove expired dismissed windows from *monitor* (mutates in-place)."""
        kept = []
        for w in monitor.get("dismissed_windows", []):
            expires_at = w.get("expires_at")
            if expires_at is None:
                kept.append(w)  # permanent — never expires
                continue
            try:
                exp_dt = datetime.fromisoformat(expires_at)
            except ValueError:
                continue  # malformed — drop it
            if exp_dt.tzinfo is None:
                exp_dt = exp_dt.replace(tzinfo=UTC)
            if now < exp_dt:
                kept.append(w)
        monitor["dismissed_windows"] = kept

    async def async_dismiss_window(
        self,
        monitor_id: str,
        start_ms: int,
        end_ms: int,
        expires_at: str | None,
    ) -> dict[str, Any] | None:
        """Add a dismissal window to a monitor.

        *expires_at* is an ISO datetime string, or None for a permanent dismissal.
        Returns the updated monitor record, or None if the monitor was not found.
        """
        for m in self._data.get("monitors", []):
            if m.get("id") == monitor_id:
                window: dict[str, Any] = {
                    "id": str(uuid.uuid4()),
                    "start_ms": start_ms,
                    "end_ms": end_ms,
                    "dismissed_at": datetime.now(UTC).isoformat(),
                    "expires_at": expires_at,
                }
                m.setdefault("dismissed_windows", []).append(window)
                await self._store.async_save(self._data)
                self._notify_listeners()
                self._fire_monitors_updated("dismissed", monitor_id)
                return m
        return None

    async def async_undismiss_window(
        self, monitor_id: str, window_id: str
    ) -> dict[str, Any] | None:
        """Remove a dismissal window by ID from a monitor.

        Returns the updated monitor record, or None if the monitor was not found.
        """
        for m in self._data.get("monitors", []):
            if m.get("id") == monitor_id:
                original_len = len(m.get("dismissed_windows", []))
                m["dismissed_windows"] = [
                    w
                    for w in m.get("dismissed_windows", [])
                    if w.get("id") != window_id
                ]
                if len(m["dismissed_windows"]) < original_len:
                    await self._store.async_save(self._data)
                    self._notify_listeners()
                    self._fire_monitors_updated("undismissed", monitor_id)
                return m
        return None

    @staticmethod
    def append_scan_history(
        monitor: dict[str, Any],
        scan_time_iso: str,
        count: int,
        max_entries: int = MONITOR_SCAN_HISTORY_MAX,
    ) -> None:
        """Append a scan result to the monitor's ring buffer (mutates in-place)."""
        history: list[dict[str, Any]] = monitor.setdefault("scan_history", [])
        history.append({"t": scan_time_iso, "count": count})
        if len(history) > max_entries:
            monitor["scan_history"] = history[-max_entries:]
