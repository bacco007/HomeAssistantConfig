from __future__ import annotations

from copy import deepcopy

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import WaterNSWCoordinator


def _redact_payload(data: dict) -> dict:
    """Redact payload values for diagnostics."""
    redacted = deepcopy(data)

    try:
        returned = redacted.get("return", {})
        for _, site_items in returned.items():
            if isinstance(site_items, list):
                for site_item in site_items:
                    values = site_item.get("values", [])
                    for value in values:
                        if "v" in value:
                            value["v"] = "<redacted>"
    except Exception:
        pass

    return redacted


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict:
    """Return diagnostics for a config entry."""
    coordinator = WaterNSWCoordinator(hass, entry.data)

    diagnostics = {
        "entry_data": dict(entry.data),
        "site_id": str(entry.data["site_id"]),
        "varfrom": str(entry.data["from_variable"]),
        "varto": str(entry.data["to_variable"]),
        "url": coordinator.url,
    }

    try:
        data = await coordinator._async_update_data()
        diagnostics["last_fetch_success"] = True
        diagnostics["data"] = {
            "timestamp": data.timestamp.isoformat() if data.timestamp else None,
            "raw": _redact_payload(data.raw),
        }
    except Exception as err:
        diagnostics["last_fetch_success"] = False
        diagnostics["error"] = str(err)

    return diagnostics