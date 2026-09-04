"""Turn Home Assistant state into the plain dataclasses that scoring consumes.

This is the only module that needs `hass`, and so the only one that needs the
heavier test harness. Registry and state reads only: no recorder queries, and
nothing that blocks the event loop.
"""

from datetime import datetime, timedelta

from homeassistant.config_entries import SOURCE_IGNORE
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from .const import (
    ADVANCED_FEATURES,
    ATTR_LAST_TRIGGERED,
    AUTOMATION_DOMAIN,
    DOMAIN,
    HAGHS_DOMAIN,
    HELPER_DOMAINS,
    MOBILE_APP_DOMAIN,
    SCENE_DOMAIN,
    SCORE_MAX,
    SCORE_MIN,
    SCRIPT_DOMAIN,
    STOCK_ZONE_ENTITY_IDS,
    TEMPLATE_PLATFORM,
    USAGE_WINDOW_DAYS,
    VOICE_ASSISTANT_DOMAINS,
    ZONE_DOMAIN,
)
from .scoring import DiversitySignals, UsageSignals, UsersSignals, group_counts


def _as_datetime(value: object) -> datetime | None:
    """Coerce a `last_triggered` attribute to an aware datetime, or None.

    Live states carry a datetime; states restored from the database carry an
    ISO string. Anything else - missing, null, malformed - means "never fired",
    which must not take the whole collection down.
    """
    if isinstance(value, datetime):
        return dt_util.as_utc(value)
    if isinstance(value, str):
        parsed = dt_util.parse_datetime(value)
        return dt_util.as_utc(parsed) if parsed else None
    return None


def _count_recent(
    hass: HomeAssistant,
    domain: str,
    cutoff: datetime,
    *,
    from_state: bool = False,
) -> tuple[int, int]:
    """Return (defined, used-in-window) for one entity domain.

    Automations and scripts date themselves with a `last_triggered` attribute.
    A scene has no such attribute: its state *is* the timestamp it was last
    activated, so `from_state` reads it from there instead.
    """
    entity_ids = hass.states.async_entity_ids(domain)
    used = 0
    for entity_id in entity_ids:
        state = hass.states.get(entity_id)
        if state is None:
            continue
        raw = state.state if from_state else state.attributes.get(ATTR_LAST_TRIGGERED)
        last_used = _as_datetime(raw)
        if last_used is not None and last_used >= cutoff:
            used += 1
    return len(entity_ids), used


def _count_helpers(hass: HomeAssistant) -> int:
    """Count configured helpers from the entity registry."""
    registry = er.async_get(hass)
    return sum(
        1 for entry in registry.entities.values() if entry.domain in HELPER_DOMAINS
    )


def _collect_advanced_features(hass: HomeAssistant) -> frozenset[str]:
    """Detect which advanced features this instance actually uses.

    Registry and state reads only. "Blueprints in use" is not here: it cannot
    be told from either without reading configuration off disk.
    """
    registry = er.async_get(hass)
    entries = list(registry.entities.values())
    present = set()

    if any(entry.platform == TEMPLATE_PLATFORM for entry in entries):
        present.add("template_entities")

    extra_zones = [
        entity_id
        for entity_id in hass.states.async_entity_ids(ZONE_DOMAIN)
        if entity_id not in STOCK_ZONE_ENTITY_IDS
    ]
    if extra_zones:
        present.add("zones")

    if any(entry.domain in VOICE_ASSISTANT_DOMAINS for entry in entries):
        present.add("voice_assistant")

    return frozenset(present & ADVANCED_FEATURES)


def collect_usage(hass: HomeAssistant) -> UsageSignals:
    """Collect the usage signals from the current instance state."""
    cutoff = dt_util.utcnow() - timedelta(days=USAGE_WINDOW_DAYS)
    automations_defined, automations_fired = _count_recent(
        hass, AUTOMATION_DOMAIN, cutoff
    )
    scripts_defined, scripts_run = _count_recent(hass, SCRIPT_DOMAIN, cutoff)
    scenes_defined, scenes_activated = _count_recent(
        hass, SCENE_DOMAIN, cutoff, from_state=True
    )

    return UsageSignals(
        automations_defined=automations_defined,
        automations_fired=automations_fired,
        scripts_defined=scripts_defined,
        scripts_run=scripts_run,
        scenes_defined=scenes_defined,
        scenes_activated=scenes_activated,
        helper_count=_count_helpers(hass),
        advanced_features=_collect_advanced_features(hass),
    )


def collect_diversity(hass: HomeAssistant) -> DiversitySignals:
    """Collect integration breadth from the config entries.

    Config entries rather than entities: forty Hue bulbs are one entry, which
    is exactly the distinction this pillar exists to make. HAUS does not count
    itself, and entries the user has ignored or disabled are not in use.
    """
    domains = [
        entry.domain
        for entry in hass.config_entries.async_entries()
        if entry.domain != DOMAIN
        and entry.source != SOURCE_IGNORE
        and entry.disabled_by is None
    ]
    return DiversitySignals(group_counts=group_counts(domains))


async def collect_users(hass: HomeAssistant) -> UsersSignals:
    """Collect who can operate this house.

    Aggregate counts only. The per-user activity counts live in the store and
    are merged in by the coordinator; they never pass through here as detail.
    """
    users = await hass.auth.async_get_users()
    active_accounts = sum(
        1 for user in users if user.is_active and not user.system_generated
    )
    return UsersSignals(
        active_accounts=active_accounts,
        mobile_app_devices=len(hass.config_entries.async_entries(MOBILE_APP_DOMAIN)),
    )


def collect_hygiene(hass: HomeAssistant, entity_id: str) -> float | None:
    """Read the hygiene pillar from HAGHS, or return None if it is absent.

    None means "no hygiene pillar", which the scoring renormalises around. It
    never means zero: a dependency that is restarting, has not produced a value
    yet, or has been pointed at the wrong entity must not tank the score.
    """
    if not hass.config_entries.async_loaded_entries(HAGHS_DOMAIN):
        return None

    state = hass.states.get(entity_id)
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None

    try:
        score = float(state.state)
    except ValueError:
        return None

    return max(float(SCORE_MIN), min(float(SCORE_MAX), score))
