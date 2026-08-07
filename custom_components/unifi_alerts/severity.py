"""Severity normalisation and minimum-severity gating for the integration.

Maps the raw, ingestion-path-specific severity string (webhook payload, legacy
`/list/alarm` record, or v2 `system-log` event) onto one of exactly four
ordered Severity_Level values, and provides the comparison/lookup helpers used
by the per-category Minimum_Severity_Setting gate on both the webhook push
path and the polling path. See docs/UNIFI.md for the documented severity
ordering and synonym table.
"""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Final

from .const import CONF_MIN_SEVERITY

if TYPE_CHECKING:
    # Deferred import: models.py imports normalize_severity from this module,
    # so importing UniFiAlert here at module scope would be circular.
    # TYPE_CHECKING keeps this import evaluated only by type checkers, never
    # at runtime.
    from .models import UniFiAlert

_LOGGER = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Severity_Level (an alert's own normalised severity)
# ──────────────────────────────────────────────
SEVERITY_LOW: Final = "LOW"
SEVERITY_MEDIUM: Final = "MEDIUM"
SEVERITY_HIGH: Final = "HIGH"
SEVERITY_VERY_HIGH: Final = "VERY_HIGH"

SEVERITY_ORDER: Final[list[str]] = [
    SEVERITY_LOW,
    SEVERITY_MEDIUM,
    SEVERITY_HIGH,
    SEVERITY_VERY_HIGH,
]

# Sentinel for "no recognised severity could be determined for this alert"
# (e.g. the webhook/legacy payload has no severity field and falls back to a
# subsystem name like "wlan"). Deliberately NOT one of the four SEVERITY_*
# values above and NOT in SEVERITY_ORDER, so it can never be compared against
# a Minimum_Severity_Setting by index. meets_minimum() treats it as always
# passing the gate (fail open) — conflating "unknown" with LOW would silently
# mute every alert on the webhook/legacy paths for any category gated above
# LOW, which is the opposite of what a severity filter should do.
SEVERITY_UNKNOWN: Final = "UNKNOWN"

# ──────────────────────────────────────────────
# Minimum_Severity_Setting (a category's configured gate threshold)
# ──────────────────────────────────────────────
# Sentinel for "gate disabled for this category". Deliberately NOT one of the
# four SEVERITY_* values above (and lowercase, unlike them) so it can never be
# confused with an alert's own normalised severity. No_Filter, not LOW, is the
# backward-compatible default because it carries no assumption about how an
# alert's severity was normalised — a stored LOW default would silently start
# gating alerts for every existing installation the moment this feature
# shipped, whereas No_Filter preserves prior behaviour until a user opts in.
MIN_SEVERITY_NO_FILTER: Final = "no_filter"

# Selector ordering only: No_Filter sits below LOW for UI purposes but is not
# itself a Severity_Level and is never returned by normalize_severity().
MIN_SEVERITY_ORDER: Final[list[str]] = [MIN_SEVERITY_NO_FILTER, *SEVERITY_ORDER]

# ──────────────────────────────────────────────
# Legacy severity synonym table
# ──────────────────────────────────────────────
# Documented legacy-severity synonym table (case-insensitive, whitespace-trimmed
# at lookup time — see normalize_severity()). Expand this the same way
# UNIFI_KEY_TO_CATEGORY is expanded: when a user reports an unmapped legacy
# severity string, add a synonym entry and a doc/UNIFI.md update.
_SEVERITY_SYNONYMS: Final[dict[str, str]] = {
    "critical": SEVERITY_VERY_HIGH,
    "urgent": SEVERITY_VERY_HIGH,
    "error": SEVERITY_HIGH,
    "warning": SEVERITY_MEDIUM,
    "info": SEVERITY_LOW,
    "notice": SEVERITY_LOW,
}

# ──────────────────────────────────────────────
# Normalisation
# ──────────────────────────────────────────────
_CANONICAL_LOOKUP: Final[dict[str, str]] = {level.lower(): level for level in SEVERITY_ORDER}


def normalize_severity(raw: str) -> str:
    """Map a raw severity string to one of SEVERITY_ORDER, or SEVERITY_UNKNOWN.

    Matches case-insensitively and ignores leading/trailing whitespace against
    both the canonical Severity_Level names and _SEVERITY_SYNONYMS. Falls back
    to SEVERITY_UNKNOWN for an empty string or any unmatched value — this
    includes the webhook/legacy `subsystem` fallback (e.g. "wlan"), which is
    not a severity at all. SEVERITY_UNKNOWN is never gated out by
    meets_minimum(); it is deliberately not conflated with SEVERITY_LOW.
    """
    key = raw.strip().lower()
    if key in _CANONICAL_LOOKUP:
        return _CANONICAL_LOOKUP[key]
    if key in _SEVERITY_SYNONYMS:
        return _SEVERITY_SYNONYMS[key]
    return SEVERITY_UNKNOWN


def meets_minimum(severity_level: str, minimum: str) -> bool:
    """Return True if severity_level satisfies minimum.

    Always True when minimum == MIN_SEVERITY_NO_FILTER (no comparison
    performed) or when severity_level == SEVERITY_UNKNOWN (fail open — an
    alert whose severity could not be determined is never silently dropped).
    Otherwise True iff severity_level's SEVERITY_ORDER index is >= minimum's
    index.
    """
    if minimum == MIN_SEVERITY_NO_FILTER or severity_level == SEVERITY_UNKNOWN:
        return True
    return SEVERITY_ORDER.index(severity_level) >= SEVERITY_ORDER.index(minimum)


def get_effective_min_severity(config: Mapping[str, Any], category: str) -> str:
    """Resolve the effective Minimum_Severity_Setting for a category.

    Reads config[CONF_MIN_SEVERITY] (a dict[category, setting]); returns
    MIN_SEVERITY_NO_FILTER when the map itself is absent (legacy entry) or the
    category key is absent from it (new category added after the entry was
    last saved). Centralised here — rather than inlined at each of the two
    call sites (push path, poll path) — so the "missing means No_Filter"
    default can never drift between them.

    A stored value that is not one of MIN_SEVERITY_ORDER (e.g. from a
    hand-edited or future-downgraded config entry) is coerced back to
    MIN_SEVERITY_NO_FILTER and logged at WARNING (on every call reaching this
    branch — there is no dedup), rather than being returned as-is and later
    raising ValueError in meets_minimum's SEVERITY_ORDER.index() lookup. Only
    reachable via a hand-edited or corrupted config entry: the SelectSelector
    validates in-band submissions.
    """
    raw: Any = config.get(CONF_MIN_SEVERITY, {})
    min_severity_map: Mapping[str, str] = raw if isinstance(raw, Mapping) else {}
    resolved: str = min_severity_map.get(category, MIN_SEVERITY_NO_FILTER)
    if resolved not in MIN_SEVERITY_ORDER:
        _LOGGER.warning(
            "Ignoring unrecognised min_severity %r for category %r; treating as %s",
            resolved,
            category,
            MIN_SEVERITY_NO_FILTER,
        )
        return MIN_SEVERITY_NO_FILTER
    return resolved


def filter_by_min_severity(alerts: list[UniFiAlert], minimum: str) -> list[UniFiAlert]:
    """Return the subset of alerts whose normalised severity meets minimum.

    Pure function with no dependency on CategoryState.enabled — the poll path
    calls this only for categories it has already decided to process; the
    helper itself has no opinion on enabled/disabled and returns `alerts`
    unchanged whenever minimum == MIN_SEVERITY_NO_FILTER.
    """
    if minimum == MIN_SEVERITY_NO_FILTER:
        return alerts
    return [alert for alert in alerts if meets_minimum(alert.severity_level, minimum)]
