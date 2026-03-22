"""H.A.C.A — HA Repairs Framework integration.

Pushes HIGH severity issues from HACA into the native HA Repairs panel
(Settings → System → Repairs) so users see critical problems without
needing to open the HACA custom panel.

Called after each coordinator refresh. Issues that are resolved on the
next scan are automatically removed from the Repairs panel.

Requires HA 2023.1+ (homeassistant.helpers.issue_registry).
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Maximum number of issues pushed to Repairs (avoid flooding)
MAX_REPAIR_ISSUES = 15

# Issue types that map to fixable repairs (the user can click "Fix" in Repairs)
# Only simple, safe fixes — NEVER complex automations
FIXABLE_ISSUE_TYPES = {
    "compliance_automation_no_description",
    "compliance_script_no_description",
    "no_description",
    "no_alias",
}


def _issue_key(issue: dict[str, Any]) -> str:
    """Generate a stable unique key for a HACA issue."""
    entity_id = issue.get("entity_id", "unknown")
    issue_type = issue.get("type", "unknown")
    return f"{entity_id}_{issue_type}"


def _readable_type(issue_type: str) -> str:
    """Convert a snake_case issue type to a human-readable string.

    e.g. 'device_id_in_trigger' → 'Device ID in trigger'
    """
    return issue_type.replace("_", " ").capitalize()


async def async_update_repairs(
    hass: HomeAssistant,
    coordinator_data: dict[str, Any],
) -> None:
    """Sync HACA HIGH issues with HA Repairs panel.

    - Creates repair entries for new HIGH issues.
    - Deletes ALL previous HACA repair entries first (clean slate each scan).
    """
    try:
        from homeassistant.helpers import issue_registry as ir
    except ImportError:
        # HA version too old — silently skip
        _LOGGER.debug("[HACA Repairs] issue_registry not available — skipping")
        return

    if not coordinator_data:
        return

    # ── Step 1: Remove ALL existing HACA repairs (clean slate) ────────────
    # This ensures resolved issues are always removed, even after HA restart.
    try:
        registry = ir.async_get(hass)
        haca_issues = [
            (domain, issue_id)
            for (domain, issue_id) in list(registry.issues)
            if domain == DOMAIN
        ]
        for domain, issue_id in haca_issues:
            ir.async_delete_issue(hass, domain, issue_id)
        if haca_issues:
            _LOGGER.debug("[HACA Repairs] Cleared %d previous repair entries", len(haca_issues))
    except Exception as exc:
        _LOGGER.debug("[HACA Repairs] Could not clear old issues: %s", exc)

    # ── Step 2: Collect all HIGH severity issues across all categories ────
    all_high_issues: dict[str, dict[str, Any]] = {}
    for list_key in [
        "automation_issue_list", "script_issue_list", "scene_issue_list",
        "blueprint_issue_list", "entity_issue_list", "helper_issue_list",
        "performance_issue_list", "security_issue_list", "dashboard_issue_list",
    ]:
        for issue in coordinator_data.get(list_key, []):
            if issue.get("severity") == "high":
                key = _issue_key(issue)
                all_high_issues[key] = issue

    # Limit to avoid flooding the Repairs panel
    selected = dict(list(all_high_issues.items())[:MAX_REPAIR_ISSUES])

    # ── Step 3: Create new repair entries ─────────────────────────────────
    for key, issue in selected.items():
        issue_id = f"haca_{key}"

        entity_name = issue.get("alias") or issue.get("entity_id", "?")
        issue_type = issue.get("type", "unknown")
        message_text = (issue.get("message") or "")[:200]
        recommendation = (issue.get("recommendation") or "")[:200]

        try:
            is_fixable = issue_type in FIXABLE_ISSUE_TYPES and issue.get("fix_available", False)

            # Build descriptive message with type explanation + recommendation
            description_parts = []
            if message_text:
                description_parts.append(message_text)
            if recommendation:
                description_parts.append(f"Recommendation: {recommendation}")
            description_parts.append("Open the HACA panel for details and available fixes.")

            ir.async_create_issue(
                hass,
                domain=DOMAIN,
                issue_id=issue_id,
                is_fixable=is_fixable,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="generic_high_issue",
                translation_placeholders={
                    "entity": entity_name,
                    "type": _readable_type(issue_type),
                    "message": "\n\n".join(description_parts),
                },
            )
        except Exception as exc:
            _LOGGER.debug("[HACA Repairs] Could not create issue %s: %s", issue_id, exc)

    if selected:
        _LOGGER.debug(
            "[HACA Repairs] Synced %d HIGH issue(s) to HA Repairs panel",
            len(selected),
        )
