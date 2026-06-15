"""Diagnostics support for Whodunnit.

Privacy note: diagnostics dumps are designed to be attached to public issue
reports, so personally identifying data is redacted before output. HA user
UUIDs are replaced with stable per-dump placeholders ("user_1", "user_2", ...)
- the same real ID always maps to the same placeholder within one dump, so
entries in the context cache can still be correlated with the user cache.
Person names and person entity IDs are omitted entirely; the boolean facts
derived from them (has_person_entity, is_service_account) are what matter
for diagnosing classification issues.
"""

import time
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from .const import DOMAIN, STATE_UI


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict:
    """Return diagnostics for a config entry."""
    domain_data = hass.data.get(DOMAIN, {})
    entry_data = domain_data.get("entries", {}).get(entry.entry_id, {})
    context_cache = domain_data.get("context_cache", {})
    user_cache = domain_data.get("user_cache", {})
    now = time.time()

    user_aliases: dict = {}

    def _alias(user_id) -> str:
        """Map a real user ID to a stable anonymous placeholder."""
        if user_id not in user_aliases:
            user_aliases[user_id] = f"user_{len(user_aliases) + 1}"
        return user_aliases[user_id]

    def _context_entry(v: dict) -> dict:
        out = {
            "type": v.get("type"),
            "age_seconds": round(now - v.get("timestamp", 0), 1),
            "seen": v.get("seen"),
        }
        if v.get("type") == STATE_UI:
            # UI entries store a user UUID in "id" and resolve the name
            # lazily, so both are identity data - alias / drop them.
            out["id"] = _alias(v.get("id"))
            out["name"] = None
        else:
            out["id"] = v.get("id")
            out["name"] = v.get("name")
        return out

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
                ctx_id: _context_entry(v)
                for ctx_id, v in context_cache.items()
            },
        },
        "user_cache": {
            "total_entries": len(user_cache),
            "entries": {
                _alias(user_id): {
                    "has_person_entity": v.get("person_id") is not None,
                    "is_service_account": v.get("is_service_account"),
                    "age_seconds": round(now - v.get("timestamp", 0), 1),
                }
                for user_id, v in user_cache.items()
            },
        },
        "shared_listeners_active": "listener_unsubs" in domain_data,
        "active_entry_count": domain_data.get("entry_count", 0),
    }
