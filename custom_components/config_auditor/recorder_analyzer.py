"""H.A.C.A — Recorder Orphan Analyzer.

Queries the HA Recorder SQLite database to find entity_ids that still have
historical data (states, statistics) but no longer exist in the entity
registry or active states.

These orphaned entities waste disk space and clutter long-term statistics.

Provides:
  • List of orphaned entity_ids with estimated row counts and size
  • Total wasted space estimate (MB)
  • One-click purge via recorder.purge_entities service
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.recorder import get_instance

_LOGGER = logging.getLogger(__name__)

# Estimated bytes per state row (state_id, entity_id ref, state value, timestamps)
_BYTES_PER_STATE_ROW = 150
# Estimated bytes per statistics row
_BYTES_PER_STAT_ROW = 80
# Minimum row count to report as an orphan (avoids noise from single-event ghosts)
_MIN_ROWS_TO_REPORT = 1


class RecorderAnalyzer:
    """Analyze Recorder DB for orphaned entity data."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.orphans: list[dict[str, Any]] = []
        self.total_wasted_mb: float = 0.0
        self.db_available: bool = False
        # entity_id → expiry timestamp (epoch seconds)
        # Entities in this dict are excluded from analysis until expiry.
        # Populated by the websocket purge handler after a successful SQL delete.
        self._purged_cache: dict[str, float] = {}

    # ── Public API ────────────────────────────────────────────────────────

    async def analyze_all(self) -> list[dict[str, Any]]:
        """Query the Recorder DB and return orphaned entity list."""
        self.orphans = []
        self.total_wasted_mb = 0.0
        self.db_available = False

        try:
            instance = get_instance(self.hass)
        except Exception as exc:
            _LOGGER.debug("Recorder not available: %s", exc)
            return []

        # Expire stale entries from the purge cache
        import time as _time
        now = _time.monotonic()
        self._purged_cache = {
            eid: exp for eid, exp in self._purged_cache.items() if exp > now
        }
        if self._purged_cache:
            _LOGGER.debug(
                "Recorder analyzer: %d entity(ies) suppressed (recently purged): %s",
                len(self._purged_cache), list(self._purged_cache.keys()),
            )

        try:
            result = await instance.async_add_executor_job(
                self._query_orphans, instance
            )
        except Exception as exc:
            _LOGGER.warning("Recorder orphan analysis failed: %s", exc)
            return []

        self.db_available = True
        # Filter out recently-purged entities (WAL checkpoint may not be done yet)
        raw_orphans = result["orphans"]
        self.orphans = [o for o in raw_orphans if o["entity_id"] not in self._purged_cache]
        suppressed = len(raw_orphans) - len(self.orphans)
        if suppressed:
            _LOGGER.debug(
                "Recorder analyzer: suppressed %d recently-purged orphan(s)", suppressed
            )
        self.total_wasted_mb = round(
            sum(o["est_mb"] for o in self.orphans), 2
        )

        _LOGGER.info(
            "Recorder orphan analysis: %d orphan(s), ~%.1f MB wasted",
            len(self.orphans), self.total_wasted_mb,
        )
        return self.orphans

    def mark_purged(self, entity_ids: list[str], ttl_seconds: int = 300) -> None:
        """Mark entity_ids as recently purged so they are excluded from next scans.

        TTL defaults to 5 minutes — enough for SQLite WAL checkpoint to propagate.
        Called by the websocket purge handler after a successful SQL delete.
        """
        import time as _time
        expiry = _time.monotonic() + ttl_seconds
        for eid in entity_ids:
            self._purged_cache[eid] = expiry
        _LOGGER.debug(
            "Recorder analyzer: marked %d entity(ies) as purged (TTL %ds): %s",
            len(entity_ids), ttl_seconds, entity_ids,
        )

    # ── DB query (runs in recorder executor thread) ───────────────────────

    def _query_orphans(self, instance) -> dict[str, Any]:
        """Run synchronous DB queries in the recorder executor thread.

        Uses a fresh engine connection with BEGIN IMMEDIATE to guarantee we
        read the latest committed data from the WAL file, not a stale pool
        snapshot that predates a recent DELETE.
        """
        from sqlalchemy import text

        # ── Fresh connection with BEGIN IMMEDIATE ─────────────────────────
        # SQLAlchemy's connection pool can return a connection that already has
        # an open (idle) read transaction snapshot taken BEFORE our last purge
        # commit.  Using engine.connect() as a context manager gives us a brand-
        # new connection; BEGIN IMMEDIATE then acquires a shared lock and reads
        # from the latest WAL state, ensuring post-purge data is visible.
        with instance.engine.connect() as conn:
            # Force SQLite to start a new read transaction from the latest
            # committed state, bypassing any stale pool snapshot.
            try:
                conn.execute(text("BEGIN IMMEDIATE"))
            except Exception:
                # Non-SQLite backends (e.g. MariaDB): BEGIN IMMEDIATE is either
                # not needed or uses different syntax.  Fall through — the engine
                # will still start a read transaction on first query.
                pass

            try:
                # ── 1. Build set of known entity_ids ─────────────────────
                # From HA's perspective: states + entity registry
                known: set[str] = {
                    s.entity_id for s in self.hass.states.async_all()
                }
                entity_reg = er.async_get(self.hass)
                known.update(e.entity_id for e in entity_reg.entities.values())

                # ── 2. Query states_meta (modern HA ≥ 2023.3) ────────────
                # states_meta stores one row per entity_id; states table
                # references it via metadata_id.
                states_by_entity: dict[str, int] = {}
                try:
                    rows = conn.execute(
                        text(
                            "SELECT sm.entity_id, COUNT(s.state_id) AS cnt "
                            "FROM states_meta sm "
                            "LEFT JOIN states s ON s.metadata_id = sm.metadata_id "
                            "GROUP BY sm.metadata_id, sm.entity_id"
                        )
                    ).fetchall()
                    for row in rows:
                        states_by_entity[row[0]] = int(row[1])
                except Exception:
                    # Fallback: legacy schema without states_meta
                    try:
                        rows = conn.execute(
                            text(
                                "SELECT entity_id, COUNT(state_id) AS cnt "
                                "FROM states "
                                "GROUP BY entity_id"
                            )
                        ).fetchall()
                        for row in rows:
                            states_by_entity[row[0]] = int(row[1])
                    except Exception as exc:
                        _LOGGER.debug("Could not query states table: %s", exc)

                # ── 3. Query statistics_meta ──────────────────────────────
                stats_by_entity: dict[str, int] = {}
                try:
                    rows = conn.execute(
                        text(
                            "SELECT sm.statistic_id, "
                            "  (SELECT COUNT(*) FROM statistics s WHERE s.metadata_id = sm.id) "
                            "  + (SELECT COUNT(*) FROM statistics_short_term ss WHERE ss.metadata_id = sm.id) "
                            "  AS cnt "
                            "FROM statistics_meta sm "
                            "WHERE sm.source = 'recorder'"
                        )
                    ).fetchall()
                    for row in rows:
                        stats_by_entity[row[0]] = int(row[1])
                except Exception as exc:
                    _LOGGER.debug("Could not query statistics_meta: %s", exc)

                # ── 4. Find orphans ───────────────────────────────────────
                all_db_entities = set(states_by_entity) | set(stats_by_entity)
                orphan_ids = all_db_entities - known

                orphans: list[dict[str, Any]] = []
                total_bytes = 0

                for entity_id in sorted(orphan_ids):
                    state_rows = states_by_entity.get(entity_id, 0)
                    stat_rows = stats_by_entity.get(entity_id, 0)
                    total_rows = state_rows + stat_rows

                    if total_rows < _MIN_ROWS_TO_REPORT:
                        continue

                    est_bytes = (
                        state_rows * _BYTES_PER_STATE_ROW
                        + stat_rows * _BYTES_PER_STAT_ROW
                    )
                    total_bytes += est_bytes

                    orphans.append({
                        "entity_id":  entity_id,
                        "state_rows": state_rows,
                        "stat_rows":  stat_rows,
                        "total_rows": total_rows,
                        "est_bytes":  est_bytes,
                        "est_mb":     round(est_bytes / 1_048_576, 3),
                        "has_stats":  stat_rows > 0,
                        "has_states": state_rows > 0,
                    })

                return {
                    "orphans":  orphans,
                    "total_mb": round(total_bytes / 1_048_576, 2),
                }

            finally:
                # Rollback the read transaction (no writes were done here)
                try:
                    conn.execute(text("ROLLBACK"))
                except Exception:
                    pass
