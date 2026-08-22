"""Geometry store — in-memory, LRU-bounded cache keyed by ``geometry_ref``.

Backs RFC §2.4 (revised). Full polygons are cached in process memory rather
than persisted to ``.storage``: geometry is ephemeral, and sustained disk
writes on SD-card deployments during severe-weather outbreaks are the wrong
tradeoff. Entries do not survive restart — the next coordinator poll
re-populates the cache from upstream.
"""

from __future__ import annotations

import json
import logging
from collections import OrderedDict

_LOGGER = logging.getLogger(__name__)

# Soft cap on total serialized polygon bytes. 5 MB ≈ 500 alerts × 10 KB.
MAX_BYTES = 5_000_000


class GeometryStore:
    """In-memory, LRU-bounded keyed geometry store."""

    def __init__(self) -> None:
        self._entries: OrderedDict[str, dict] = OrderedDict()
        self._sizes: dict[str, int] = {}
        self._total_bytes = 0

    async def put(self, ref: str, geometry: dict) -> None:
        """Insert or update a geometry, enforcing the LRU byte cap."""
        if ref in self._entries:
            self._drop(ref)
        self._insert(ref, geometry)
        self._evict_to_cap()

    async def get(self, ref: str) -> dict | None:
        """Return the geometry for ``ref`` or None. Promotes on read."""
        geom = self._entries.get(ref)
        if geom is None:
            return None
        self._entries.move_to_end(ref)
        return geom

    async def delete(self, ref: str) -> None:
        """Drop a single ref. No-op if absent."""
        if ref in self._entries:
            self._drop(ref)

    async def purge_missing(self, refs: set[str], prefix: str | None = None) -> None:
        """Drop stored refs not in ``refs``.

        If ``prefix`` is given, only refs starting with it are considered —
        used so one entry's purge doesn't nuke a sibling entry's geometry.
        """
        for ref in list(self._entries):
            if prefix is not None and not ref.startswith(prefix):
                continue
            if ref in refs:
                continue
            self._drop(ref)

    # -- internals --

    def _insert(self, ref: str, geometry: dict) -> None:
        self._entries[ref] = geometry
        size = len(json.dumps(geometry, separators=(",", ":")))
        self._sizes[ref] = size
        self._total_bytes += size

    def _drop(self, ref: str) -> None:
        self._entries.pop(ref, None)
        size = self._sizes.pop(ref, 0)
        self._total_bytes -= size

    def _evict_to_cap(self) -> None:
        while self._total_bytes > MAX_BYTES and self._entries:
            oldest = next(iter(self._entries))
            self._drop(oldest)
