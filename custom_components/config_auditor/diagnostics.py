"""Diagnostics support for H.A.C.A.

Provides a downloadable diagnostics dump via:
  Settings → Devices → H.A.C.A → Download diagnostics

Sensitive data (tokens, API keys) is automatically redacted.
"""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, VERSION

TO_REDACT = {
    "mcp_ha_token",
    "api_key",
    "password",
    "token",
    "secret",
    "access_token",
    "client_secret",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Return diagnostics for a config entry.

    Called by HA when the user clicks 'Download diagnostics' in the device page.
    All sensitive fields listed in TO_REDACT are replaced with '**REDACTED**'.
    """
    domain_data = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
    coordinator = domain_data.get("coordinator")
    cdata = coordinator.data if coordinator and coordinator.data else {}

    # Issue counts per category
    issue_counts = {}
    for key in [
        "automation_issues", "script_issues", "scene_issues",
        "blueprint_issues", "entity_issues", "helper_issues",
        "performance_issues", "security_issues", "dashboard_issues",
        "compliance_issues",
    ]:
        issue_counts[key] = cdata.get(key, 0)

    # Severity breakdown across all issue lists
    severity_counts = {"high": 0, "medium": 0, "low": 0}
    for list_key in [
        "automation_issue_list", "script_issue_list", "scene_issue_list",
        "blueprint_issue_list", "entity_issue_list", "helper_issue_list",
        "performance_issue_list", "security_issue_list", "dashboard_issue_list",
        "compliance_issue_list",
    ]:
        for issue in cdata.get(list_key, []):
            sev = issue.get("severity", "low")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

    # Module activation status
    from . import const as c
    modules = {}
    for i in range(1, 22):
        attr = f"MODULE_{i}_"
        for name in dir(c):
            if name.startswith(attr):
                modules[name] = getattr(c, name, None)

    # Recorder status
    recorder_info = {
        "db_available": cdata.get("recorder_db_available", False),
        "orphan_count": cdata.get("recorder_orphan_count", 0),
        "wasted_mb": cdata.get("recorder_wasted_mb", 0.0),
    }

    # Battery info (counts only, no entity names)
    battery_info = {
        "battery_count": cdata.get("battery_count", 0),
        "battery_alerts": cdata.get("battery_alerts", 0),
        "battery_alert_7d": cdata.get("battery_alert_7d", 0),
        "predictions_count": cdata.get("battery_predictions_count", 0),
    }

    # Build the full diagnostics payload
    diag = {
        "haca_version": VERSION,
        "ha_version": hass.config.version,
        "ha_language": hass.config.language,
        "entry_id": entry.entry_id,
        "entry_options": dict(entry.options),
        "health_score": cdata.get("health_score", 0),
        "total_issues": cdata.get("total_issues", 0),
        "issue_counts": issue_counts,
        "severity_breakdown": severity_counts,
        "modules_active": modules,
        "recorder": recorder_info,
        "battery": battery_info,
        "dependency_graph_stats": {
            "nodes": len(cdata.get("dependency_graph", {}).get("nodes", [])),
            "edges": len(cdata.get("dependency_graph", {}).get("edges", [])),
        },
        "area_complexity_zones": len(cdata.get("area_complexity", {}).get("areas", [])),
        "redundancy_groups": len(cdata.get("redundancy", {}).get("groups", [])),
        "scan_interval_minutes": entry.options.get("scan_interval", 60),
        "event_monitoring_enabled": entry.options.get("event_monitoring_enabled", True),
        "total_entities": len(hass.states.async_all()),
        "total_automations": len(hass.states.async_entity_ids("automation")),
        "total_scripts": len(hass.states.async_entity_ids("script")),
    }

    return async_redact_data(diag, TO_REDACT)
