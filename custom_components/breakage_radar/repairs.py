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


@callback
def async_sync_issue(hass: HomeAssistant, report: dict) -> None:
    """Create, update or clear the Breakage Radar repairs issue."""
    affected = report.get("affected_domains") or []
    if not affected:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
        return

    by_release: dict[str, list[str]] = report.get("by_release") or {}
    earliest = report.get("earliest_release") or (
        min(by_release) if by_release else "a future release"
    )
    releases = ", ".join(
        f"{release} ({len(domains)})" for release, domains in sorted(by_release.items())
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
            "count": str(len(affected)),
            "earliest": str(earliest),
            "integrations": ", ".join(sorted(affected)[:12])
            + (" and others" if len(affected) > 12 else ""),
            "releases": releases or "-",
        },
        learn_more_url=LEARN_MORE_URL,
    )
