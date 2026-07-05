"""Diagnostics support for Weather Station Core."""

from __future__ import annotations

import json
import pathlib
import re
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_SOURCES,
    DOMAIN,
    KEY_DATA_QUALITY,
    KEY_SENSOR_QUALITY_FLAGS,
)

REDACTED = "**REDACTED**"


def _integration_version() -> str:
    """Read the integration version from the sibling manifest.json.

    Resolved once at import time (the diagnostics platform module is imported in
    the executor), so it never reads a file inside the event loop at request
    time and stays in sync with manifest.json without a hardcoded literal.
    """
    try:
        manifest = pathlib.Path(__file__).parent / "manifest.json"
        return str(json.loads(manifest.read_text(encoding="utf-8")).get("version", "unknown"))
    except Exception:  # pragma: no cover - manifest is always present in practice
        return "unknown"


_VERSION = _integration_version()

# Location keys are redacted for privacy; anything whose key name matches this
# pattern is a credential (API key, password, passcode, auth/secret/token) and
# must never appear in a diagnostics export that users routinely attach to
# public bug reports.
_LOCATION_KEYS = frozenset({"forecast_lat", "forecast_lon", "sea_temp_lat", "sea_temp_lon"})
_SECRET_KEY_RE = re.compile(r"(key|password|passcode|secret|token|auth)", re.IGNORECASE)


def _redact(value: Any, key: str | None = None) -> Any:
    """Recursively redact secrets and location data.

    A value is redacted when its own key name matches a secret pattern or is a
    known location field.  Redaction recurses into nested dicts and lists so
    per-network credential blocks are covered too.
    """
    if key is not None and (key in _LOCATION_KEYS or _SECRET_KEY_RE.search(key)):
        return REDACTED if value not in (None, "") else value
    if isinstance(value, dict):
        return {k: _redact(v, k) for k, v in value.items()}
    if isinstance(value, list):
        return [_redact(v) for v in value]
    return value


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Return diagnostics for a config entry (secrets and coordinates redacted)."""
    coord = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    data = coord.data if coord else None

    # Count sensor availability
    sources = dict(entry.data.get(CONF_SOURCES, {}))
    sensor_stats = {"total": len(sources), "available": 0, "stale": 0, "missing": 0}
    for _key, eid in sources.items():
        if not eid:
            sensor_stats["missing"] += 1
            continue
        st = hass.states.get(eid)
        if st is None:
            sensor_stats["missing"] += 1
        elif st.state in ("unknown", "unavailable"):
            sensor_stats["stale"] += 1
        else:
            sensor_stats["available"] += 1

    runtime_info = {}
    if coord:
        rt = coord.runtime
        runtime_info = {
            "last_compute_ms": rt.last_compute_ms,
            "pressure_history_samples": len(rt.pressure_history),
            "temp_history_24h_samples": len(rt.temp_history_24h),
            "forecast_consecutive_failures": rt.forecast_consecutive_failures,
            "forecast_inflight": rt.forecast_inflight,
        }

    return {
        "title": entry.title,
        "version": _VERSION,
        "entry_data": _redact(dict(entry.data)),
        "entry_options": _redact(dict(entry.options)),
        "sources": sources,
        "sensor_stats": sensor_stats,
        "runtime": runtime_info,
        "data_quality": (data or {}).get(KEY_DATA_QUALITY),
        "quality_flags": (data or {}).get(KEY_SENSOR_QUALITY_FLAGS, []),
    }
