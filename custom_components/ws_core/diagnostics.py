"""Diagnostics support for Weather Station Core."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_SOURCES,
    DOMAIN,
    KEY_DATA_QUALITY,
    KEY_SENSOR_QUALITY_FLAGS,
)


def _redact_coords(d: dict[str, Any]) -> dict[str, Any]:
    """Redact location data for privacy."""
    out = dict(d)
    out.pop("forecast_lat", None)
    out.pop("forecast_lon", None)
    return out


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
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
        "version": "1.10.1",
        "entry_data": _redact_coords(dict(entry.data)),
        "entry_options": _redact_coords(dict(entry.options)),
        "sources": sources,
        "sensor_stats": sensor_stats,
        "runtime": runtime_info,
        "data_quality": (data or {}).get(KEY_DATA_QUALITY),
        "quality_flags": (data or {}).get(KEY_SENSOR_QUALITY_FLAGS, []),
    }
