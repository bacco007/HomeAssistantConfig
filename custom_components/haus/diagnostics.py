"""The diagnostics dump.

A dump is a file people paste into GitHub issues, so what it may contain is
decided by the same rule the entities follow: per-user activity never leaves
the instance. Only counts of it appear here, taken through the store's public
methods so no future field can reach into the per-user tallies by accident.
"""

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import (
    ACTIVITY_SUSTAINED_DAYS,
    COMMUNITY_AS_OF,
    COMMUNITY_AVG_AUTOMATIONS,
    COMMUNITY_AVG_USERS,
    COMMUNITY_REPORTING_INSTALLS,
    COMMUNITY_SOURCE_URL,
    SCORE_HISTORY_WEEKS,
)
from .coordinator import HausConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: HausConfigEntry
) -> dict[str, Any]:
    """Return everything useful for triaging a score, and nothing more."""
    coordinator = entry.runtime_data
    result = coordinator.data
    store = coordinator.store
    now = dt_util.utcnow()

    # What HAUS looked for, and whether it found it. A wrong entity id is
    # indistinguishable from an absent HAGHS on the card - that is
    # absent-is-never-zero working as designed - so the dump says both.
    haghs_entity_id = coordinator.haghs_entity_id
    haghs_state = hass.states.get(haghs_entity_id)

    return {
        "score": {
            "score": result.score,
            "tier": result.tier,
            "pillars": {
                "hygiene": result.pillars.hygiene,
                "usage": result.pillars.usage,
                "diversity": result.pillars.diversity,
                "users": result.pillars.users,
            },
            "effective_weights": result.effective_weights,
            "contributions": result.contributions,
            "metrics": result.metrics,
            "details": result.details,
        },
        "haghs": {
            "entity_id": haghs_entity_id,
            "available": result.haghs_available,
            "state": haghs_state.state if haghs_state else None,
        },
        "community": {
            "automations": COMMUNITY_AVG_AUTOMATIONS,
            "users": COMMUNITY_AVG_USERS,
            "as_of": COMMUNITY_AS_OF,
            "reporting_installs": COMMUNITY_REPORTING_INSTALLS,
            "source": COMMUNITY_SOURCE_URL,
        },
        # Depth only. `user_action_counts` is keyed by user id, so it is
        # measured and discarded - never carried.
        "store": {
            "history_days": store.history_days(now),
            "score_snapshots": len(store.score_history(SCORE_HISTORY_WEEKS)),
            "notifications_in_window": store.notifications_in_window(now),
            "users_tallied": len(
                store.user_action_counts(ACTIVITY_SUSTAINED_DAYS, now)
            ),
        },
        "options": dict(entry.options),
    }
