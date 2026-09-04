"""Pure scoring functions.

This module deliberately has no Home Assistant imports: it maps plain
dataclasses to numbers so the whole of the scoring logic is unit-testable in
milliseconds without a Home Assistant fixture. Turning `hass` state into these
dataclasses is the job of `collectors.py`.
"""

import math
from collections import Counter
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from typing import Any

from .const import (
    ACTIVITY_MIN_HISTORY_DAYS,
    ADVANCED_FEATURES,
    DIVERSITY_GROUPS,
    DOMAIN_GROUPS,
    K_ACTIVE_ACCOUNTS,
    K_AUTOMATION_COUNT,
    K_HELPER_COUNT,
    K_NOTIFICATION_COUNT,
    K_SCRIPT_SCENE_COUNT,
    NEUTRAL_METRIC_SCORE,
    NOTIFY_MIN_HISTORY_DAYS,
    OTHER_GROUP,
    PILLAR_WEIGHTS,
    SCORE_MAX,
    SCORE_MIN,
    SCORE_TIERS,
    TARGET_GROUPS,
    USAGE_METRIC_WEIGHTS,
    USAGE_WINDOW_DAYS,
    USERS_METRIC_WEIGHTS,
)


def saturate(count: int, k: float) -> float:
    """Return a 0-100 score that rises steeply then flattens.

    `100 * (1 - exp(-n / k))`. A linear ratio against a target would punish a
    small home forever; a saturating curve gives early additions real weight and
    stops rewarding hoarding. `k` is the knee, and lives in `const.py` per
    metric.
    """
    return 100.0 * (1.0 - math.exp(-count / k))


@dataclass(frozen=True)
class PillarScores:
    """The four pillar scores, each on a 0-100 scale.

    `hygiene` is None when HAGHS is not installed, or is reporting unknown or
    unavailable. That is an absent pillar, not a zero one.
    """

    hygiene: float | None
    usage: float
    diversity: float
    users: float


@dataclass(frozen=True)
class UsageSignals:
    """Raw usage signals collected from the instance.

    Every field defaults, so a collector that cannot see a signal yet reports
    nothing rather than a misleading zero.
    """

    automations_defined: int = 0
    automations_fired: int = 0
    scripts_defined: int = 0
    scripts_run: int = 0
    scenes_defined: int = 0
    scenes_activated: int = 0
    helper_count: int = 0
    notification_count: int = 0
    notification_history_days: int = 0
    advanced_features: frozenset[str] = frozenset()


def _fire_rate(signals: UsageSignals) -> float:
    """Return the share of defined automations that fired in the window.

    An instance with no automations has no rate to speak of; it scores zero
    here rather than dividing by zero.
    """
    if signals.automations_defined == 0:
        return 0.0
    fired = min(signals.automations_fired, signals.automations_defined)
    return 100.0 * fired / signals.automations_defined


def _script_scene_score(signals: UsageSignals) -> float:
    """Score scripts and scenes on both presence and use.

    Half the metric is having any one-touch routines at all, half is whether
    they get run. An instance with neither scores zero rather than dividing by
    zero.
    """
    defined = signals.scripts_defined + signals.scenes_defined
    if defined == 0:
        return 0.0
    used = min(signals.scripts_run + signals.scenes_activated, defined)
    presence = saturate(defined, k=K_SCRIPT_SCENE_COUNT)
    rate = 100.0 * used / defined
    return 0.5 * presence + 0.5 * rate


def _notification_score(signals: UsageSignals) -> float:
    """Score notifications sent, or stay neutral while the tally is young."""
    if signals.notification_history_days < NOTIFY_MIN_HISTORY_DAYS:
        return NEUTRAL_METRIC_SCORE
    return saturate(signals.notification_count, k=K_NOTIFICATION_COUNT)


def _advanced_score(signals: UsageSignals) -> float:
    """Score the share of recognised advanced features that are present.

    Intersected with the recognised set, so a collector reporting something
    unknown cannot distort the pillar.
    """
    present = signals.advanced_features & ADVANCED_FEATURES
    return 100.0 * len(present) / len(ADVANCED_FEATURES)


def usage_details(signals: UsageSignals) -> dict[str, Any]:
    """Return the raw usage counts, and the window they are judged over.

    The metrics are curves - sixty-one automations saturate to 99 - so a card
    printing "Automations 99" is lying the same way "86 accounts" was. The
    counts travel alongside, and `window_days` lets the card explain the
    calculation without hard-coding a tunable into its copy.
    """
    return {
        "automations_defined": signals.automations_defined,
        "automations_fired": signals.automations_fired,
        "scripts_and_scenes_defined": signals.scripts_defined + signals.scenes_defined,
        "scripts_and_scenes_used": signals.scripts_run + signals.scenes_activated,
        "helper_count": signals.helper_count,
        "notification_count": signals.notification_count,
        "notification_history_days": signals.notification_history_days,
        "window_days": USAGE_WINDOW_DAYS,
        # The knee of each saturating metric, so the card's "?" copy can quote
        # it rather than describe the shape in prose. Prose drifts silently
        # when a k is retuned; a published number moves with it.
        "curve_knees": {
            "automation_count": K_AUTOMATION_COUNT,
            "scripts_scenes": K_SCRIPT_SCENE_COUNT,
            "helpers": K_HELPER_COUNT,
            "notifications": K_NOTIFICATION_COUNT,
        },
    }


def usage_metrics(signals: UsageSignals) -> dict[str, float]:
    """Return each usage metric's own 0-100 score.

    Exposed so the pillar can be broken down on the card: a score that cannot
    be taken apart is the "magic number" objection waiting to happen.
    """
    return {
        "fire_rate": _fire_rate(signals),
        "automation_count": saturate(signals.automations_defined, k=K_AUTOMATION_COUNT),
        "scripts_scenes": _script_scene_score(signals),
        "helpers": saturate(signals.helper_count, k=K_HELPER_COUNT),
        "notifications": _notification_score(signals),
        "advanced": _advanced_score(signals),
    }


def score_usage(signals: UsageSignals) -> float:
    """Return the usage pillar score, 0-100.

    A weighted mean over the implemented metrics, normalised by the weights
    actually in play, so adding a metric does not require retuning the others.
    """
    metrics = usage_metrics(signals)
    weight_total = sum(USAGE_METRIC_WEIGHTS[name] for name in metrics)
    weighted = sum(
        USAGE_METRIC_WEIGHTS[name] * value for name, value in metrics.items()
    )
    return weighted / weight_total


def group_for_domain(domain: str) -> str:
    """Return the domain group a config-entry domain belongs to.

    Anything not in the curated mapping is unclassified rather than an error:
    custom integrations must never crash the pillar.
    """
    return DOMAIN_GROUPS.get(domain, OTHER_GROUP)


def group_counts(domains: Iterable[str]) -> dict[str, int]:
    """Reduce config-entry domains to a count per group."""
    return dict(Counter(group_for_domain(domain) for domain in domains))


def evenness(group_counts: Mapping[str, int]) -> float:
    """Return the normalised Shannon entropy of the group counts, 0-1.

    `H / ln(k)` over the groups actually present. Forty Hue bulbs is one
    integration, not forty, and this is the number that says so. A single group
    has nothing to spread across - `ln(1)` is zero - so evenness is zero rather
    than a division by zero.
    """
    present = [count for count in group_counts.values() if count > 0]
    groups = len(present)
    if groups <= 1:
        return 0.0
    total = sum(present)
    entropy = -sum((count / total) * math.log(count / total) for count in present)
    return entropy / math.log(groups)


@dataclass(frozen=True)
class UsersSignals:
    """Who can operate this house, and whether they do.

    Aggregate counts only. Per-user detail never reaches this module, and never
    reaches a state attribute.
    """

    active_accounts: int = 0
    mobile_app_devices: int = 0
    users_active_7d: int = 0
    users_active_30d: int = 0
    activity_history_days: int = 0


def _share_of_accounts(count: int, active_accounts: int) -> float:
    """Return a count as a share of the usable accounts, 0-100.

    Capped at 100: someone with three phones is not three people.
    """
    if active_accounts == 0:
        return 0.0
    return 100.0 * min(count, active_accounts) / active_accounts


def users_details(signals: UsersSignals) -> dict[str, Any]:
    """Return the raw household counts behind the users pillar.

    The metric scores are curves: four accounts saturate to 86. A card that
    prints "86 accounts" is lying, so the counts travel alongside and the
    scores are left to drive the bars. Aggregates only - identities stay behind
    the admin-checked websocket command.
    """
    return {
        "active_accounts": signals.active_accounts,
        "mobile_app_devices": signals.mobile_app_devices,
        "users_active_7d": signals.users_active_7d,
        "users_active_30d": signals.users_active_30d,
        "activity_history_days": signals.activity_history_days,
        # Only the accounts metric is a curve here; the other three are shares.
        "curve_knees": {"accounts": K_ACTIVE_ACCOUNTS},
    }


def _activity_score(signals: UsersSignals, metric: str, active_users: int) -> float:
    """Score one activity window, or stay neutral while its tally is young."""
    if signals.activity_history_days < ACTIVITY_MIN_HISTORY_DAYS[metric]:
        return NEUTRAL_METRIC_SCORE
    return _share_of_accounts(active_users, signals.active_accounts)


def users_metrics(signals: UsersSignals) -> dict[str, float]:
    """Return each users metric's own 0-100 score."""
    return {
        "accounts": saturate(signals.active_accounts, k=K_ACTIVE_ACCOUNTS),
        "mobile_apps": _share_of_accounts(
            signals.mobile_app_devices, signals.active_accounts
        ),
        "activity_7d": _activity_score(signals, "activity_7d", signals.users_active_7d),
        "activity_30d": _activity_score(
            signals, "activity_30d", signals.users_active_30d
        ),
    }


def score_users(signals: UsersSignals) -> float:
    """Return the users pillar score, 0-100."""
    metrics = users_metrics(signals)
    weight_total = sum(USERS_METRIC_WEIGHTS[name] for name in metrics)
    weighted = sum(
        USERS_METRIC_WEIGHTS[name] * value for name, value in metrics.items()
    )
    return weighted / weight_total


@dataclass(frozen=True)
class DiversitySignals:
    """Integration breadth, as a count of config entries per domain group."""

    group_counts: Mapping[str, int] = field(default_factory=dict)


def covered_groups(signals: DiversitySignals) -> frozenset[str]:
    """Return the recognised groups this instance has something in.

    `other` is excluded deliberately: a pile of integrations nobody can
    classify is not evidence of breadth across kinds of thing.
    """
    return frozenset(
        group
        for group, count in signals.group_counts.items()
        if count > 0 and group in DIVERSITY_GROUPS
    )


def missing_groups(signals: DiversitySignals) -> frozenset[str]:
    """Return the recognised groups with nothing in them."""
    return DIVERSITY_GROUPS - covered_groups(signals)


def score_diversity(signals: DiversitySignals) -> float:
    """Return the diversity pillar score, 0-100.

    Half is how evenly the estate is spread over the groups it covers, half is
    how many of the target groups it covers at all.
    """
    covered = covered_groups(signals)
    counted = {group: signals.group_counts[group] for group in covered}
    coverage = min(1.0, len(covered) / TARGET_GROUPS)
    return min(100.0, 50.0 * evenness(counted) + 50.0 * coverage)


def diversity_details(signals: DiversitySignals) -> dict[str, Any]:
    """Return the diversity facts worth putting on a card.

    The set difference is the useful half: knowing which groups have nothing in
    them is actionable in a way the score alone is not.
    """
    covered = covered_groups(signals)
    counted = {group: signals.group_counts[group] for group in covered}
    return {
        "groups_covered": sorted(covered),
        "groups_missing": sorted(missing_groups(signals)),
        "evenness": round(evenness(counted), 3),
        # Sizes as well as names: the spread card draws these as a stacked bar,
        # and unclassified integrations are not a kind of thing to draw.
        "group_counts": dict(sorted(counted.items())),
        # The score divides coverage by this, not by the number of groups
        # that exist, so a card showing "17 of 27" needs it to explain 90.
        "target_groups": TARGET_GROUPS,
    }


def effective_weights(*, hygiene_available: bool) -> dict[str, float]:
    """Return the pillar weights actually in force.

    With HAGHS absent the hygiene pillar is dropped and the remaining three are
    renormalised over their own weight sum, so the score stays on a 0-100 scale
    and stays comparable to itself over time.
    """
    if hygiene_available:
        return dict(PILLAR_WEIGHTS)
    owned = {name: w for name, w in PILLAR_WEIGHTS.items() if name != "hygiene"}
    owned_total = sum(owned.values())
    return {name: w / owned_total for name, w in owned.items()}


def pillar_values(pillars: PillarScores) -> dict[str, float]:
    """Return the pillar scores, in canonical order, omitting absent ones."""
    values: dict[str, float] = {
        "usage": pillars.usage,
        "diversity": pillars.diversity,
        "users": pillars.users,
    }
    if pillars.hygiene is not None:
        values["hygiene"] = pillars.hygiene
    return {name: values[name] for name in PILLAR_WEIGHTS if name in values}


def pillar_contributions(pillars: PillarScores) -> dict[str, float]:
    """Return the points each pillar actually contributed to the score.

    These are what the card draws its ring arcs from: the gap to a full circle
    is the unearned points, colour-coded by which pillar to go and fix. Keyed in
    canonical pillar order; an absent hygiene pillar is simply not present.
    """
    weights = effective_weights(hygiene_available=pillars.hygiene is not None)
    return {
        name: weights[name] * value for name, value in pillar_values(pillars).items()
    }


def compute_score(pillars: PillarScores) -> int:
    """Return the weighted overall score for the given pillar scores."""
    total = sum(pillar_contributions(pillars).values())
    return max(SCORE_MIN, min(SCORE_MAX, math.floor(total)))


def tier_for_score(score: int) -> str:
    """Return the tier label for a score."""
    label = SCORE_TIERS[0][1]
    for threshold, tier in SCORE_TIERS:
        if score >= threshold:
            label = tier
    return label


@dataclass(frozen=True)
class ScoreResult:
    """Everything the score sensor publishes, assembled in one pure call."""

    score: int
    tier: str
    pillars: PillarScores
    contributions: dict[str, float]
    effective_weights: dict[str, float]
    haghs_available: bool
    metrics: dict[str, dict[str, float]]
    details: dict[str, dict[str, Any]]


def build_result(
    pillars: PillarScores,
    metrics: dict[str, dict[str, float]] | None = None,
    details: dict[str, dict[str, Any]] | None = None,
) -> ScoreResult:
    """Assemble the full published result for a set of pillar scores.

    `metrics` carries each pillar's own breakdown, so the card can open the
    score up rather than asserting it.
    """
    score = compute_score(pillars)
    hygiene_available = pillars.hygiene is not None
    return ScoreResult(
        score=score,
        tier=tier_for_score(score),
        pillars=pillars,
        contributions=pillar_contributions(pillars),
        effective_weights=effective_weights(hygiene_available=hygiene_available),
        haghs_available=hygiene_available,
        metrics=metrics or {},
        details=details or {},
    )
