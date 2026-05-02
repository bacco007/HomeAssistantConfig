"""Diagnostics support for Whodunnit."""

import time
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict:
    """Return diagnostics for a config entry."""
    domain_data = hass.data.get(DOMAIN, {})
    entry_data = domain_data.get("entries", {}).get(entry.entry_id, {})
    context_cache = domain_data.get("context_cache", {})
    user_cache = domain_data.get("user_cache", {})
    now = time.time()

    return {
        "config_entry": {
            "entry_id": entry.entry_id,
            "title": entry.title,
            "data": dict(entry.data),
            "version": entry.version,
        },
        "targets": entry_data.get("targets", []),
        "context_cache": {
            "total_entries": len(context_cache),
            "entries": {
                ctx_id: {
                    "type": v.get("type"),
                    "id": v.get("id"),
                    "name": v.get("name"),
                    "age_seconds": round(now - v.get("timestamp", 0), 1),
                    "seen": v.get("seen"),
                }
                for ctx_id, v in context_cache.items()
            },
        },
        "user_cache": {
            "total_entries": len(user_cache),
            "entries": {
                user_id: {
                    "person_id": v.get("person_id"),
                    "name": v.get("name"),
                    "is_service_account": v.get("is_service_account"),
                    "age_seconds": round(now - v.get("timestamp", 0), 1),
                }
                for user_id, v in user_cache.items()
            },
        },
        "shared_listeners_active": "listener_unsubs" in domain_data,
        "active_entry_count": domain_data.get("entry_count", 0),
    }
