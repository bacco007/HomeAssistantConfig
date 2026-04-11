"""SQLite-backed anomaly cluster cache for hass_datapoints.

Anomaly detection is CPU-intensive.  For historical (closed) ranges the result
never changes, so we persist it in a SQLite DB so subsequent requests can be
served instantly.

All public methods are synchronous and must be called via
``hass.async_add_executor_job``.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import time

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS anomaly_cache (
    cache_key    TEXT PRIMARY KEY,
    entity_id    TEXT NOT NULL,
    end_time_ts  REAL NOT NULL,
    created_at   REAL NOT NULL,
    clusters_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entity  ON anomaly_cache (entity_id);
CREATE INDEX IF NOT EXISTS idx_created ON anomaly_cache (created_at);
"""

_TTL_DAYS = 30
_LIVE_EDGE_SECONDS = 3600  # ranges ending within the last hour are not cached
_MAX_CACHE_ENTRY_BYTES = 5 * 1024 * 1024  # 5 MB per entry — guards against DoS


def make_cache_key(entity_id: str, start_time: str, end_time: str, config: dict) -> str:
    """Return a stable SHA-256 hex digest for a given detection request."""
    payload = {
        "entity_id": entity_id,
        "start_time": start_time,
        "end_time": end_time,
        "anomaly_methods": sorted(config.get("anomaly_methods", [])),
        "anomaly_sensitivity": config.get("anomaly_sensitivity", "medium"),
        "anomaly_overlap_mode": config.get("anomaly_overlap_mode", "all"),
        "anomaly_rate_window": config.get("anomaly_rate_window", "1h"),
        "anomaly_zscore_window": config.get("anomaly_zscore_window", "24h"),
        "anomaly_persistence_window": config.get("anomaly_persistence_window", "1h"),
        "comparison_entity_id": config.get("comparison_entity_id"),
        "comparison_start_time": config.get("comparison_start_time"),
        "comparison_end_time": config.get("comparison_end_time"),
        "comparison_time_offset_ms": config.get("comparison_time_offset_ms", 0),
        # Include trend settings because trend_residual uses them
        "trend_method": config.get("trend_method", "rolling_average"),
        "trend_window": config.get("trend_window", "24h"),
        # Sampling params change the input pts, so they affect the result
        "sample_interval": config.get("sample_interval"),
        "sample_aggregate": config.get("sample_aggregate"),
    }
    serialised = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(serialised.encode()).hexdigest()


class AnomalyCache:
    """Thread-safe SQLite cache for anomaly clusters."""

    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._init_db()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(_SCHEMA_SQL)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get(self, cache_key: str) -> list | None:
        """Return cached clusters or None if not found / expired."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT clusters_json FROM anomaly_cache WHERE cache_key = ?",
                (cache_key,),
            ).fetchone()
        if row is None:
            return None
        try:
            return json.loads(row[0])
        except (json.JSONDecodeError, TypeError):
            return None

    def set(
        self,
        cache_key: str,
        entity_id: str,
        end_time_ts: float,
        clusters: list,
    ) -> None:
        """Store clusters for a closed range."""
        clusters_json = json.dumps(clusters)
        if len(clusters_json.encode()) > _MAX_CACHE_ENTRY_BYTES:
            return  # silently skip — result is too large to cache safely
        now = time.time()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO anomaly_cache
                    (cache_key, entity_id, end_time_ts, created_at, clusters_json)
                VALUES (?, ?, ?, ?, ?)
                """,
                (cache_key, entity_id, end_time_ts, now, clusters_json),
            )
        # Opportunistic TTL purge (cheap because indexed).
        self.purge_old(_TTL_DAYS)

    def purge_old(self, max_age_days: int = _TTL_DAYS) -> int:
        """Delete entries older than max_age_days. Returns number of rows deleted."""
        cutoff = time.time() - max_age_days * 86400
        with self._connect() as conn:
            cursor = conn.execute(
                "DELETE FROM anomaly_cache WHERE created_at < ?", (cutoff,)
            )
            return cursor.rowcount

    def clear_all(self) -> int:
        """Delete every entry. Returns number of rows deleted."""
        with self._connect() as conn:
            cursor = conn.execute("DELETE FROM anomaly_cache")
            return cursor.rowcount

    def clear_entity(self, entity_id: str) -> int:
        """Delete all entries for a specific entity. Returns number of rows deleted."""
        with self._connect() as conn:
            cursor = conn.execute(
                "DELETE FROM anomaly_cache WHERE entity_id = ?", (entity_id,)
            )
            return cursor.rowcount
