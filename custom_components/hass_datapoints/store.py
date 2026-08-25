"""Persistent storage for Hass Data Points."""

from __future__ import annotations

import json
import logging
import sqlite3
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

_LOGGER = logging.getLogger(__name__)

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS events (
    id            TEXT PRIMARY KEY,
    timestamp     TEXT NOT NULL,
    message       TEXT NOT NULL,
    annotation    TEXT NOT NULL DEFAULT '',
    entity_ids    TEXT NOT NULL DEFAULT '[]',
    device_ids    TEXT NOT NULL DEFAULT '[]',
    area_ids      TEXT NOT NULL DEFAULT '[]',
    label_ids     TEXT NOT NULL DEFAULT '[]',
    icon          TEXT NOT NULL DEFAULT 'mdi:bookmark',
    color         TEXT NOT NULL DEFAULT '#03a9f4',
    dev           INTEGER NOT NULL DEFAULT 0,
    automation_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_timestamp     ON events (timestamp);
CREATE INDEX IF NOT EXISTS idx_events_dev           ON events (dev);
CREATE INDEX IF NOT EXISTS idx_events_automation_id ON events (automation_id);
"""

_LIST_FIELDS = {"entity_ids", "device_ids", "area_ids", "label_ids"}


def _migrate_event(event: dict[str, Any]) -> None:
    """Apply all field migrations to a legacy event dict (mutates in-place)."""
    if "entity_id" in event and "entity_ids" not in event:
        event["entity_ids"] = [event.pop("entity_id")]
    elif "entity_ids" not in event:
        event["entity_ids"] = []
    for field in ("device_ids", "area_ids", "label_ids"):
        if field not in event:
            event[field] = []
    if "dev" not in event:
        event["dev"] = False
    if "automation_id" not in event:
        event["automation_id"] = None


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    """Convert a sqlite3.Row to the canonical event dict shape."""
    d: dict[str, Any] = dict(row)
    for field in _LIST_FIELDS:
        d[field] = json.loads(d[field])
    d["dev"] = bool(d["dev"])
    return d


def _event_to_params(event: dict[str, Any]) -> tuple:
    """Convert an event dict to the INSERT parameter tuple."""
    message = event.get("message", "")
    return (
        event["id"],
        event["timestamp"],
        message,
        event.get("annotation", message),
        json.dumps(event.get("entity_ids") or []),
        json.dumps(event.get("device_ids") or []),
        json.dumps(event.get("area_ids") or []),
        json.dumps(event.get("label_ids") or []),
        event.get("icon") or "mdi:bookmark",
        event.get("color") or "#03a9f4",
        1 if event.get("dev") else 0,
        event.get("automation_id"),
    )


class _EventDb:
    """Synchronous SQLite backend for event storage."""

    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.executescript(_SCHEMA_SQL)

    def insert(self, event: dict[str, Any]) -> None:
        """Insert a new event row."""
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO events
                    (id, timestamp, message, annotation,
                     entity_ids, device_ids, area_ids, label_ids,
                     icon, color, dev, automation_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                _event_to_params(event),
            )

    def insert_many(self, events: list[dict[str, Any]]) -> None:
        """Bulk-insert events using INSERT OR IGNORE (idempotent for migration)."""
        params = [_event_to_params(e) for e in events]
        with self._connect() as conn:
            conn.executemany(
                """
                INSERT OR IGNORE INTO events
                    (id, timestamp, message, annotation,
                     entity_ids, device_ids, area_ids, label_ids,
                     icon, color, dev, automation_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                params,
            )

    def update(self, event_id: str, fields: dict[str, Any]) -> bool:
        """Update specific fields on an event. Returns True if the row existed."""
        encoded = {
            k: (json.dumps(v) if k in _LIST_FIELDS else v) for k, v in fields.items()
        }
        cols = ", ".join(f"{k}=?" for k in encoded)
        params = list(encoded.values()) + [event_id]
        with self._connect() as conn:
            cursor = conn.execute(f"UPDATE events SET {cols} WHERE id=?", params)
            return cursor.rowcount > 0

    def delete(self, event_id: str) -> bool:
        """Delete an event by ID. Returns True if the row existed."""
        with self._connect() as conn:
            cursor = conn.execute("DELETE FROM events WHERE id=?", (event_id,))
            return cursor.rowcount > 0

    def delete_dev(self) -> int:
        """Delete all dev-flagged events. Returns the number of rows deleted."""
        with self._connect() as conn:
            cursor = conn.execute("DELETE FROM events WHERE dev=1")
            return cursor.rowcount

    def query(
        self,
        start: str | None,
        end: str | None,
        entity_ids: list[str] | None,
        limit: int | None,
        offset: int,
    ) -> list[dict[str, Any]]:
        """Return events filtered by time range, then by entity IDs in Python."""
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM events
                WHERE (? IS NULL OR timestamp >= ?)
                AND   (? IS NULL OR timestamp <= ?)
                ORDER BY timestamp ASC
                """,
                (start, start, end, end),
            ).fetchall()

        events = [_row_to_dict(r) for r in rows]

        if entity_ids is not None:
            requested = set(entity_ids)
            seen: set[str] = set()
            filtered: list[dict[str, Any]] = []
            for ev in events:
                ev_entities = set(ev.get("entity_ids", []))
                if (not ev_entities or ev_entities & requested) and ev[
                    "id"
                ] not in seen:
                    seen.add(ev["id"])
                    filtered.append(ev)
            events = filtered

        if offset:
            events = events[offset:]
        if limit is not None:
            events = events[:limit]

        return events

    def count(self) -> int:
        """Return total event count."""
        with self._connect() as conn:
            row = conn.execute("SELECT COUNT(*) FROM events").fetchone()
            return row[0]

    def count_in_range(self, start: str, end: str | None) -> int:
        """Return event count within a time range."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) FROM events WHERE timestamp >= ? AND (? IS NULL OR timestamp <= ?)",
                (start, end, end),
            ).fetchone()
            return row[0]

    def bounds(self) -> tuple[str | None, str | None]:
        """Return (earliest_timestamp, latest_timestamp) or (None, None) if empty."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT MIN(timestamp), MAX(timestamp) FROM events"
            ).fetchone()
            return row[0], row[1]

    def last(self) -> dict[str, Any] | None:
        """Return the most recently timestamped event, or None if empty."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM events ORDER BY timestamp DESC LIMIT 1"
            ).fetchone()
            return _row_to_dict(row) if row else None

    def automation_manual_counts(self) -> tuple[int, int]:
        """Return (automation_count, manual_count)."""
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT
                    COUNT(CASE WHEN automation_id IS NOT NULL THEN 1 END),
                    COUNT(CASE WHEN automation_id IS NULL     THEN 1 END)
                FROM events
                """
            ).fetchone()
            return row[0], row[1]

    def get_by_id(self, event_id: str) -> dict[str, Any] | None:
        """Fetch a single event by ID, or None if not found."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM events WHERE id=?", (event_id,)
            ).fetchone()
            return _row_to_dict(row) if row else None


class DatapointsStore:
    """Manages persistent storage of recorded data points."""

    def __init__(self, hass: HomeAssistant, db_path: str) -> None:
        self._hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"monitors": []}
        self._listeners: list[Callable[[], None]] = []
        self._event_db = _EventDb(db_path)

    async def async_load(self) -> None:
        """Load data from persistent storage."""
        data = await self._store.async_load()
        if data is not None:
            self._data = data

        # One-time migration: import any events still in the JSON store into SQLite.
        legacy_events: list[dict[str, Any]] = self._data.pop("events", [])
        if legacy_events:
            for event in legacy_events:
                _migrate_event(event)
            await self._hass.async_add_executor_job(
                self._event_db.insert_many, legacy_events
            )
            _LOGGER.info(
                "hass_datapoints: migrated %d events from JSON store to SQLite",
                len(legacy_events),
            )
            # Clear events from JSON store so migration never re-runs.
            # SQLite rows already exist; a crash here is safe — INSERT OR IGNORE
            # deduplicates on the next boot.
            await self._store.async_save(self._data)

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

        await self._hass.async_add_executor_job(self._event_db.insert, event)
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
        return self._event_db.query(start, end, entity_ids, limit, offset)

    def get_event_bounds(self) -> tuple[str | None, str | None]:
        """Return the earliest and latest recorded event timestamps."""
        return self._event_db.bounds()

    def get_event_count(self) -> int:
        """Return the total number of recorded events."""
        return self._event_db.count()

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
        fields: dict[str, Any] = {}
        if message is not None:
            fields["message"] = message
        if annotation is not None:
            fields["annotation"] = annotation
        if entity_ids is not None:
            fields["entity_ids"] = entity_ids
        if device_ids is not None:
            fields["device_ids"] = device_ids
        if area_ids is not None:
            fields["area_ids"] = area_ids
        if label_ids is not None:
            fields["label_ids"] = label_ids
        if icon is not None:
            fields["icon"] = icon
        if color is not None:
            fields["color"] = color

        if not fields:
            return self._event_db.get_by_id(event_id)

        found = await self._hass.async_add_executor_job(
            self._event_db.update, event_id, fields
        )
        if not found:
            return None

        self._notify_listeners()
        return self._event_db.get_by_id(event_id)

    async def async_delete_dev_events(self) -> int:
        """Delete all dev-flagged events. Returns count of deleted events."""
        deleted = await self._hass.async_add_executor_job(self._event_db.delete_dev)
        if deleted:
            self._notify_listeners()
        return deleted

    async def async_delete_event(self, event_id: str) -> bool:
        """Delete an event by ID. Returns True if found and deleted."""
        deleted = await self._hass.async_add_executor_job(
            self._event_db.delete, event_id
        )
        if deleted:
            self._notify_listeners()
        return deleted

    def get_last_event(self) -> dict[str, Any] | None:
        """Return the most recently recorded event by timestamp, or None if empty."""
        return self._event_db.last()

    def get_events_count_in_range(self, start: str, end: str | None = None) -> int:
        """Return the count of events within the given ISO timestamp range."""
        return self._event_db.count_in_range(start, end)

    def get_automation_manual_counts(self) -> tuple[int, int]:
        """Return (automation_count, manual_count) for all recorded events."""
        return self._event_db.automation_manual_counts()

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
