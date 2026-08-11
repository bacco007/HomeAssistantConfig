"""Repairs issue raised when installed custom integrations are going to break.

The issue is deliberately *not* fixable in place. Frenck, reviewing the legacy
device tracker deprecation (architecture discussion 1375):

    "Repairs must be user actionable, and in this case, they can't solve it."

The action a user *can* take is real though: open the upstream repository's
issue tracker, or replace the integration before the deadline. So the issue is
informational, links straight to the board, and clears itself the moment the
count returns to zero.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN, ISSUE_ID

LEARN_MORE_URL = "https://booyaka101.github.io/hass-breakage-radar/"


#: Prefix for the per-integration issues raised once a deadline has passed.
BROKEN_ISSUE_PREFIX = "broken_now_"

#: Prefix for the per-integration issues raised while a deadline is close.
IMMINENT_ISSUE_PREFIX = "imminent_"

ALERT_PREFIXES = (BROKEN_ISSUE_PREFIX, IMMINENT_ISSUE_PREFIX)


@callback
def _async_sync_alert_issues(hass: HomeAssistant, report: dict) -> None:
    """One issue per integration that needs attention *soon*, or already.

    Two levels get their own card, because both are things a person can act on
    this week:

    * ``broken_now`` -- the deadline has passed on this system, ERROR.
    * ``imminent``   -- the deadline is inside the alert window, WARNING.

    Everything further out stays in the single summary issue. A year-ahead
    deadline that cannot be dismissed only teaches people to ignore Repairs,
    which is the mechanism every *other* integration relies on.
    """
    broken: dict[str, str] = report.get("broken_now") or {}
    imminent: dict[str, dict] = report.get("imminent") or {}

    for domain, release in broken.items():
        ir.async_create_issue(
            hass,
            DOMAIN,
            f"{BROKEN_ISSUE_PREFIX}{domain}",
            is_fixable=False,
            is_persistent=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key="integration_broken",
            translation_placeholders={"domain": domain, "release": str(release)},
            learn_more_url=LEARN_MORE_URL,
        )

    for domain, entry in imminent.items():
        days = int(entry.get("days", 0))
        ir.async_create_issue(
            hass,
            DOMAIN,
            f"{IMMINENT_ISSUE_PREFIX}{domain}",
            is_fixable=False,
            is_persistent=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="integration_imminent",
            translation_placeholders={
                "domain": domain,
                "release": str(entry.get("release", "")),
                "days": str(max(days, 0)),
            },
            learn_more_url=LEARN_MORE_URL,
        )

    # Anything that has dropped out of a level -- recovered, moved back to the
    # summary, or been uninstalled -- must lose its card. The registry is the
    # only place an uninstalled component's stale issue can still be found.
    async_get = getattr(ir, "async_get", None)
    if async_get is None:
        return
    registry = async_get(hass)
    for issue_domain, issue_id in list(getattr(registry, "issues", {})):
        if issue_domain != DOMAIN:
            continue
        if issue_id.startswith(BROKEN_ISSUE_PREFIX):
            if issue_id[len(BROKEN_ISSUE_PREFIX):] not in broken:
                ir.async_delete_issue(hass, DOMAIN, issue_id)
        elif issue_id.startswith(IMMINENT_ISSUE_PREFIX):
            if issue_id[len(IMMINENT_ISSUE_PREFIX):] not in imminent:
                ir.async_delete_issue(hass, DOMAIN, issue_id)


@callback
def async_sync_issue(hass: HomeAssistant, report: dict) -> None:
    """Create, update or clear the Breakage Radar repairs issues."""
    _async_sync_alert_issues(hass, report)

    # Only the non-urgent remainder is summarised; anything with its own alert
    # would otherwise be reported twice.
    summarised = report.get("summarised_domains") or []
    if not summarised:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
        return

    by_release: dict[str, list[str]] = report.get("by_release") or {}
    remaining = {
        release: [d for d in domains if d in set(summarised)]
        for release, domains in by_release.items()
    }
    remaining = {r: d for r, d in remaining.items() if d}
    earliest = next(iter(remaining), report.get("earliest_release") or "a future release")
    releases = ", ".join(
        f"{release} ({len(domains)})" for release, domains in remaining.items()
    )

    ir.async_create_issue(
        hass,
        DOMAIN,
        ISSUE_ID,
        is_fixable=False,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key="integrations_affected",
        translation_placeholders={
            "count": str(len(summarised)),
            "earliest": str(earliest),
            "integrations": ", ".join(sorted(summarised)[:12])
            + (" and others" if len(summarised) > 12 else ""),
            "releases": releases or "-",
        },
        learn_more_url=LEARN_MORE_URL,
    )
