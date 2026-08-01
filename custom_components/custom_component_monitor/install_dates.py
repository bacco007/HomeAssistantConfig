"""First-seen install dates for HACS components (#93).

HACS records no install date. ``.storage/hacs.repositories`` carries
``last_updated`` (the *upstream* GitHub repo timestamp) and ``last_fetched``
(HACS's own poll time), neither of which says when the user installed anything.
Home Assistant's ``core.config_entries`` has ``created_at``, but an integration
with a config entry is by definition *used*, so it never covers the components
this integration is asked about.

So the integration records it itself: the first time a component is seen
installed, that moment is written down and never moved forward again. A HACS
update rewrites the component's directory and resets its filesystem
timestamps — that is the bug this module exists to fix — but it cannot move a
recorded first-seen date.

Components that were already installed when this version first ran can only be
*estimated* from the filesystem. Those records carry ``estimated: True`` and the
card marks them with a ``~``. Everything installed from then on is exact.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    INSTALL_DATES_GRACE_DAYS,
    INSTALL_DATES_MAX_ENTRIES,
    INSTALL_DATES_NEW_WINDOW_DAYS,
    INSTALL_DATES_STORAGE_KEY,
    INSTALL_DATES_STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)


def install_key(repo: dict[str, Any]) -> str:
    """Return ``owner/repo`` lower-cased for a HACS repository dict.

    This is the same identity ``repo_key()`` in ``sensor.py`` derives from a
    GitHub URL, taken straight from the HACS ``full_name`` — so a record here
    and an update there key the same repository the same way.

    Returns ``""`` when there is no usable ``full_name``. Callers must fall back
    to the filesystem estimate rather than invent a synthetic key: a collision
    would hand one component another's install date.
    """
    full_name = str(repo.get("full_name") or "").strip()
    if "/" not in full_name:
        return ""
    return re.sub(r"\.git$", "", full_name.lower())


class InstallDateStore(Store):
    """The install-date store.

    v1 is the first version, so the migration hook cannot fire yet; it exists
    so a future shape change has a home, and returns an empty registry (which
    re-seeds from the filesystem) rather than guessing at an older shape.
    Anything else unreadable is handled by :meth:`InstallDateRegistry.async_load`.
    """

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict[str, Any]
    ) -> dict[str, Any]:
        return {"seeded_at": None, "components": {}}


class InstallDateRegistry:
    """Records when each HACS component was first seen installed.

    One registry per coordinator, and the integration is effectively
    single-instance (``hass.data[DOMAIN]["coordinator"]`` is a single slot), so
    there is only ever one writer for the store.

    Usage per scan cycle::

        await registry.async_load()   # idempotent
        registry.begin_scan()
        ... registry.observe(repo, fs_timestamp, now) for each installed repo
        registry.end_scan()
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise an empty, unloaded registry."""
        self.hass = hass
        self._store: Store | None = InstallDateStore(
            hass, INSTALL_DATES_STORAGE_VERSION, INSTALL_DATES_STORAGE_KEY
        )
        self._loaded = False
        self._seeded_at: datetime | None = None
        self._components: dict[str, dict[str, Any]] = {}
        # Per-cycle state, latched by begin_scan() so all four scan methods in
        # one refresh agree on whether this is the seeding cycle.
        self._seeding = True
        self._observed = 0
        self._touched: set[str] = set()

    # -- loading -------------------------------------------------------------

    async def async_load(self) -> None:
        """Load the registry once. Safe to call on every refresh.

        A corrupt or unreadable store must never block setup, so it degrades to
        an empty registry — the next scan re-seeds from the filesystem, which is
        what the integration did before this module existed.
        """
        if self._loaded:
            return
        raw: dict[str, Any] = {}
        if self._store is not None:
            try:
                raw = await self._store.async_load() or {}
            except Exception:  # pragma: no cover - a bad store must not break setup
                _LOGGER.warning(
                    "Could not read the install-date registry; install dates "
                    "will be re-estimated from the files on disk",
                    exc_info=True,
                )
                raw = {}
        self._seeded_at = _parse(raw.get("seeded_at"))
        self._components = _clean_components(raw.get("components"))
        self._loaded = True

    @property
    def seeded_at(self) -> str | None:
        """ISO timestamp of when exact tracking began, or ``None`` before it."""
        return self._seeded_at.isoformat() if self._seeded_at else None

    # -- per-scan ------------------------------------------------------------

    def begin_scan(self) -> None:
        """Start a scan cycle, latching whether it is the seeding cycle."""
        self._seeding = self._seeded_at is None
        self._observed = 0
        self._touched = set()

    def observe(
        self,
        repo: dict[str, Any],
        fs_timestamp: float | None,
        now: datetime,
    ) -> tuple[int | None, bool]:
        """Record that *repo* is installed and return ``(days, estimated)``.

        *fs_timestamp* is the best-effort filesystem timestamp of the install
        directory (an estimate — a HACS update resets it) and may be ``None``.
        """
        now_utc = dt_util.as_utc(now)
        fs_dt = _from_timestamp(fs_timestamp)
        key = install_key(repo)

        if not key:
            # Nothing stable to key on. Fall back to the old behaviour rather
            # than risk handing this component someone else's date.
            return _days(fs_dt, now_utc), True

        self._observed += 1
        self._touched.add(key)

        record = self._components.get(key)
        if record is None:
            if self._seeding and fs_dt is None:
                # Nothing installed it in front of us and nothing on disk to
                # date it by. "Unknown" is the honest answer — claiming today
                # would permanently pin an old component to the seeding date,
                # which is the false positive this module exists to remove.
                return None, True
            record = self._new_record(fs_dt, now_utc)
            self._components[key] = record
        elif record["estimated"] and fs_dt is not None:
            # Only ever refine backwards: an update that rewrote the directory
            # can't move the date forward, but a directory older than our
            # estimate is genuine evidence the component predates it.
            first_seen = _parse(record["first_seen"])
            if first_seen is not None and fs_dt < first_seen:
                record["first_seen"] = fs_dt.isoformat()

        record["last_seen"] = now_utc.isoformat()
        # Kept purely so the .storage file is readable when debugging; never
        # keyed on, and refreshed in case the component was renamed upstream.
        record["name"] = _repo_name(repo)
        record["category"] = str(repo.get("category") or "")

        return _days(_parse(record["first_seen"]), now_utc), bool(record["estimated"])

    def _new_record(
        self, fs_dt: datetime | None, now_utc: datetime
    ) -> dict[str, Any]:
        """Build the record for a component seen here for the first time."""
        if self._seeding:
            # Everything installed before tracking began: estimated.
            first_seen = fs_dt or now_utc
            estimated = True
        elif self._is_new_install(fs_dt, now_utc):
            # A genuine install, watched as it happened. This is the exact case
            # the whole registry exists to produce.
            first_seen = now_utc
            estimated = False
        else:
            # A key we've never seen, but files that predate it: missed at
            # seeding (a partial HACS snapshot), or the repository was renamed
            # upstream so its key changed under us. Either way it is not new,
            # and must not be announced as installed today.
            first_seen = fs_dt or now_utc
            estimated = True
        return {
            "first_seen": min(first_seen, now_utc).isoformat(),
            "last_seen": now_utc.isoformat(),
            "estimated": estimated,
        }

    def _is_new_install(self, fs_dt: datetime | None, now_utc: datetime) -> bool:
        """Is a key we've never seen before a genuinely new install?

        Appearing in the snapshot for the first time after tracking began is
        strong evidence on its own — so a component we can't find on disk is
        taken at its word. When we *can* date the files they have to agree:
        they must be newer than the moment tracking started (else it was simply
        missed at seeding) and recent in absolute terms. Without that second
        test, a repository renamed upstream months after its last update would
        get a brand-new key, an old set of files, and be reported as installed
        today — the very bug this module fixes, restated with more confidence.
        """
        if fs_dt is None:
            return True
        if self._seeded_at is not None and fs_dt < self._seeded_at:
            return False
        return now_utc - fs_dt <= timedelta(days=INSTALL_DATES_NEW_WINDOW_DAYS)

    def end_scan(self) -> None:
        """Finish a scan cycle: stamp, evict, and schedule one save."""
        if self._observed == 0:
            # This cycle is not evidence of anything. `_load_storage_file()`
            # swallows a missing or half-written hacs.repositories and returns
            # {}, so seeding here would stamp `seeded_at` on an empty view and
            # make the user's entire library look installed *today* on the next
            # cycle — strictly worse than the bug this module fixes. For the
            # same reason nothing is evicted: a component absent because HACS
            # was unreadable has not really gone away.
            return

        if self._seeded_at is None:
            self._seeded_at = dt_util.utcnow()

        self._evict()

        if self._store is not None:
            self._store.async_delay_save(
                lambda: {
                    "seeded_at": self.seeded_at,
                    "components": self._components,
                },
                5,
            )

    def _evict(self) -> None:
        """Age- and size-bound the registry.

        Records are only dropped after a long absence. The HACS snapshot lags
        and flaps (see ``_live_hacs_updates``), and pruning to the currently
        installed set on every scan is exactly the mistake that lost AI
        summaries in v1.11.0 — here it would silently reset install dates.
        """
        cutoff = dt_util.utcnow() - timedelta(days=INSTALL_DATES_GRACE_DAYS)
        for key in list(self._components):
            if key in self._touched:
                continue
            last_seen = _parse(self._components[key].get("last_seen"))
            if last_seen is None or last_seen < cutoff:
                del self._components[key]

        if len(self._components) > INSTALL_DATES_MAX_ENTRIES:
            ordered = sorted(
                self._components.items(),
                key=lambda kv: str(kv[1].get("last_seen") or ""),
            )
            excess = len(self._components) - INSTALL_DATES_MAX_ENTRIES
            for key, _record in ordered:
                if excess <= 0:
                    break
                if key in self._touched:
                    continue
                del self._components[key]
                excess -= 1


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse(value: Any) -> datetime | None:
    """Parse a stored ISO timestamp into an aware UTC datetime."""
    parsed = dt_util.parse_datetime(str(value)) if value else None
    return dt_util.as_utc(parsed) if parsed else None


def _from_timestamp(value: float | None) -> datetime | None:
    """Convert an epoch timestamp into an aware UTC datetime."""
    if value is None:
        return None
    try:
        return datetime.fromtimestamp(value, tz=timezone.utc)
    except (OverflowError, OSError, ValueError):
        return None


def _days(first_seen: datetime | None, now_utc: datetime) -> int | None:
    """Whole days between *first_seen* and now, never negative.

    A clock change or a file dated in the future must not produce a negative
    age: the card treats a negative as "unknown" and hides the row.
    """
    if first_seen is None:
        return None
    return max(0, (now_utc - first_seen).days)


def _repo_name(repo: dict[str, Any]) -> str:
    """Best available display name for a HACS repository dict."""
    manifest = repo.get("repository_manifest") or {}
    full_name = str(repo.get("full_name") or "")
    return str(
        repo.get("manifest_name")
        or repo.get("name")
        or (manifest.get("name") if isinstance(manifest, dict) else "")
        or (full_name.split("/")[-1] if "/" in full_name else full_name)
    )


def _clean_components(raw: Any) -> dict[str, dict[str, Any]]:
    """Coerce the stored component map, dropping anything unusable."""
    if not isinstance(raw, dict):
        return {}
    cleaned: dict[str, dict[str, Any]] = {}
    for key, record in raw.items():
        if not isinstance(record, dict):
            continue
        first_seen = _parse(record.get("first_seen"))
        if first_seen is None:
            continue
        last_seen = _parse(record.get("last_seen")) or first_seen
        cleaned[str(key)] = {
            **record,
            "first_seen": first_seen.isoformat(),
            "last_seen": last_seen.isoformat(),
            "estimated": bool(record.get("estimated", True)),
        }
    return cleaned
