"""In-memory state-change tracker for noisy-entity detection.

Background: ``performance_analyzer._detect_noisy_entities_from_db`` queries
the recorder DB for entities with excessive state changes in the last 24h.
That works fine until the user excludes an entity via HACA's "Exclude from
Recorder" button — once HA restarts with the entity in ``recorder.exclude
.entities``, the DB stops accumulating rows for it. After roughly 24h the
SQL query returns 0 rows for that entity, so HACA can no longer "see" it.

When the user then removes the entity from ``configuration.yaml`` and asks
HACA to rescan, the SQL still has nothing for that entity — and the noisy
issue can't reappear in the panel, even though my YAML reader correctly
notices the un-exclusion. The user has to restart HA *again* for the
recorder to start recording the entity, then wait long enough for fresh
rows to accumulate.

This tracker fixes that by subscribing to ``EVENT_STATE_CHANGED`` directly,
which fires regardless of whether the recorder integration eventually
persists the change. So HACA can observe per-entity state-change rates
even for entities the recorder is filtering out, and the panel can show
the issue back as soon as the user un-excludes the entity in
``configuration.yaml``.

Design:
- One :class:`NoisyEntityTracker` per HACA integration, lives on
  ``hass.data[DOMAIN]``.
- 24 buckets of one hour each. Each bucket is a ``{entity_id: count}``
  mapping. Buckets rotate as time passes; the oldest is dropped, a fresh
  empty bucket is appended.
- ``get_noisy(threshold)`` returns ``[(entity_id, count_24h)]`` for every
  entity whose 24h total exceeds ``threshold``, capped at ``LIMIT`` to
  match the SQL behaviour.
- Cheap memory profile: very noisy entities collapse into a single int per
  bucket; quiet entities never appear.

The tracker complements (does not replace) the SQL path. The two results
are merged: SQL wins on cold-start (when HACA was just installed and the
tracker has no data yet), the in-memory tracker wins on the "user removed
the entity from configuration.yaml without restarting HA" case.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, callback

_LOGGER = logging.getLogger(__name__)

# 24 one-hour buckets give us a 24h window with low memory and rotation cost.
_NUM_BUCKETS = 24
_BUCKET_SECONDS = 3600
_RESULT_LIMIT = 50  # Matches the SQL "LIMIT 50" so the two paths stay aligned

# Same skip list as performance_analyzer — domains where high update
# frequency is expected and not actionable. Kept in sync intentionally;
# duplicating it here lets the tracker skip increments at the source and
# keeps memory pressure flat on a busy HA instance.
_NOISY_SKIP_DOMAINS = frozenset({
    "automation", "script", "scene", "zone", "person",
    "sun", "weather", "input_boolean", "input_number",
    "input_select", "input_text", "input_datetime",
    "input_button", "counter", "timer", "button", "event",
    "persistent_notification", "conversation", "tts", "stt",
    "update", "calendar", "notify",
})


class NoisyEntityTracker:
    """Sliding-24h-window state-change counter, keyed by entity_id."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        # Buckets aligned to the current hour. Index 0 = oldest, -1 = newest.
        self._buckets: list[dict[str, int]] = [{}]
        # When the most-recent bucket started, in seconds since epoch.
        self._current_bucket_start = time.time()
        self._unsub_listener = None

    def start(self) -> None:
        """Subscribe to state changes. Idempotent — a second call is a no-op.

        Also called when the user switches the noisy-entity scan back on in
        the panel, hence the window reset: ``stop()`` emptied the buckets, and
        without a fresh start time ``_rotate_buckets_if_needed`` would append
        one bucket per hour elapsed while we were off and ``has_warmed_up()``
        would claim a full 24h of data we never collected.
        """
        if self._unsub_listener is not None:
            return
        self._buckets = [{}]
        self._current_bucket_start = time.time()
        self._unsub_listener = self.hass.bus.async_listen(
            EVENT_STATE_CHANGED, self._handle_state_change
        )
        _LOGGER.debug("[HACA] noisy-entity in-memory tracker started")

    def stop(self) -> None:
        """Unsubscribe. Called on integration unload."""
        if self._unsub_listener is not None:
            self._unsub_listener()
            self._unsub_listener = None
        self._buckets = [{}]

    @callback
    def _handle_state_change(self, event: Event) -> None:
        """Bump the count for ``entity_id`` in the current bucket."""
        entity_id = event.data.get("entity_id")
        if not entity_id or not isinstance(entity_id, str):
            return
        # Cheap pre-filter: skip domains we'd never flag anyway. Keeps the
        # hot path tight on a busy HA instance.
        dot = entity_id.find(".")
        if dot <= 0:
            return
        if entity_id[:dot] in _NOISY_SKIP_DOMAINS:
            return
        if entity_id.startswith("sensor.h_a_c_a_"):
            return
        self._rotate_buckets_if_needed()
        bucket = self._buckets[-1]
        bucket[entity_id] = bucket.get(entity_id, 0) + 1

    def _rotate_buckets_if_needed(self) -> None:
        """Advance the bucket window. Drops buckets older than 24h."""
        now = time.time()
        # How many full bucket boundaries have we crossed since the last rotate?
        elapsed = now - self._current_bucket_start
        if elapsed < _BUCKET_SECONDS:
            return
        steps = int(elapsed // _BUCKET_SECONDS)
        for _ in range(steps):
            self._buckets.append({})
            if len(self._buckets) > _NUM_BUCKETS:
                # Drop the oldest bucket — it's beyond the 24h window now.
                self._buckets.pop(0)
        self._current_bucket_start += steps * _BUCKET_SECONDS

    def get_noisy(self, threshold: int) -> list[tuple[str, int]]:
        """Return ``[(entity_id, count_24h)]`` for entities above threshold.

        Sorted descending by count, capped at ``_RESULT_LIMIT`` to mirror
        the SQL query.
        """
        self._rotate_buckets_if_needed()
        totals: dict[str, int] = {}
        for bucket in self._buckets:
            for eid, cnt in bucket.items():
                totals[eid] = totals.get(eid, 0) + cnt
        flagged = [
            (eid, cnt) for eid, cnt in totals.items() if cnt > threshold
        ]
        flagged.sort(key=lambda r: r[1], reverse=True)
        return flagged[:_RESULT_LIMIT]

    def has_warmed_up(self) -> bool:
        """True once the tracker has at least one full bucket of data.

        Before warm-up we shouldn't pretend our counts represent the last
        24h — the SQL query still has the authoritative historical view.
        After warm-up we're a useful complement, especially for entities
        the recorder is filtering (so they have no rows but still fire
        state-change events).
        """
        # ``_buckets`` always has at least one element; we want at least
        # one *complete* rotation (or a long-enough warm-up window).
        if len(self._buckets) > 1:
            return True
        # If the first bucket is older than 5 min and has some data, that's
        # already useful signal even before the first hourly rotation.
        return (
            time.time() - self._current_bucket_start > 300
            and any(self._buckets[0].values())
        )

    def stats(self) -> dict[str, Any]:
        """Diagnostic snapshot — for logging / debugging."""
        return {
            "buckets": len(self._buckets),
            "tracked_entities": sum(len(b) for b in self._buckets),
            "warmed_up": self.has_warmed_up(),
            "window_seconds": _NUM_BUCKETS * _BUCKET_SECONDS,
        }
