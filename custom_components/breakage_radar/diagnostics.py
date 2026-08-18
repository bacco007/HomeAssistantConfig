"""Downloadable diagnostics: the full report, including every finding.

The sensor carries a compact summary, because Home Assistant's recorder
refuses to store state attributes over 16 KB and a system with many findings
went well past that. Everything is here instead, one click from the
integration page.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import BreakageRadarCoordinator


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return the full breakage report for this system."""
    coordinator: BreakageRadarCoordinator = hass.data[DOMAIN][entry.entry_id]
    report = coordinator.data or {}

    return {
        "index": {
            "url": coordinator.index_url,
            "generated_utc": report.get("index_generated_utc"),
            "core_version": report.get("index_core_version"),
            "schema": report.get("index_schema"),
        },
        "settings": {
            "alert_window_days": coordinator.alert_window_days,
            "ignored_domains": report.get("ignored_domains"),
        },
        "scan": {
            "enabled": report.get("local_scan_enabled"),
            "files_scanned": report.get("files_scanned"),
            "unparsed_files": report.get("unparsed_files"),
            "skipped_files": report.get("skipped_files"),
        },
        "summary": {
            "installed": report.get("installed_count"),
            "affected": report.get("affected_count"),
            "broken_now": report.get("broken_now"),
            "imminent": report.get("imminent"),
            "clean": report.get("clean_domains"),
            "not_analysed": report.get("not_in_index"),
            "not_analysed_reasons": report.get("not_in_index_reasons"),
        },
        "schedule": report.get("schedule"),
        # Every finding, with the message and links the sensor has to leave out.
        "findings": report.get("details"),
        "findings_truncated": report.get("details_truncated"),
        "total_findings": report.get("total_findings"),
    }
