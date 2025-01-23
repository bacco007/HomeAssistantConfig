"""Diagnostics support for UniFi Site Manager."""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant

from .const import DOMAIN

TO_REDACT = {
    # Config entry fields
    CONF_API_KEY,
    # API response fields
    "anonid",
    "mac",
    "serialno",
    "qrid",
    "cpu.id",
    "hardwareId",
    "id",
    "ipAddress",
    "ipAddrs",
    "localId",
    "email",
    "fullName",
    "roleId",
    "directConnectDomain",
    # Location data
    "lat",
    "long",
    "text",
    # Gateway MAC and network identifiers
    "gatewayMac",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]

    # Get basic diagnostic data
    diagnostics_data = {
        "entry": async_redact_data(entry.as_dict(), TO_REDACT),
        "coordinator_data": {
            "sites": len(coordinator.data.get("sites", {})),
            "hosts": len(coordinator.data.get("hosts", {})),
            "metrics": len(coordinator.data.get("metrics", {})),
            "last_update": coordinator.data.get("last_update"),
            "last_update_success": coordinator.last_update_success,
            "available": coordinator.available,
        },
        # Include redacted version of actual data for debugging
        "data": async_redact_data(coordinator.data, TO_REDACT),
    }

    # Add site-specific metrics overview
    site_metrics = {}
    for site_id, site_data in coordinator.data.get("sites", {}).items():
        metrics = coordinator.get_site_metrics(site_id)
        if metrics and metrics[0].get("data"):
            wan_data = metrics[0]["data"].get("wan", {})
            site_metrics[site_id] = {
                "has_metrics": True,
                "metrics_overview": {
                    "download_speed_mbps": wan_data.get("download_kbps", 0) / 1000,
                    "upload_speed_mbps": wan_data.get("upload_kbps", 0) / 1000,
                    "latency_avg_ms": wan_data.get("avgLatency"),
                    "packet_loss_percent": wan_data.get("packetLoss"),
                    "uptime_percent": wan_data.get("uptime"),
                },
            }
        else:
            site_metrics[site_id] = {
                "has_metrics": False,
                "metrics_overview": None,
            }
    
    diagnostics_data["site_metrics"] = site_metrics

    # Add host status overview
    host_overview = {}
    for host_id, host_data in coordinator.data.get("hosts", {}).items():
        reported_state = host_data.get("reportedState", {})
        host_overview[host_id] = {
            "type": host_data.get("type"),
            "status": reported_state.get("state"),
            "version": reported_state.get("version"),
            "controllers": [
                {
                    "name": controller.get("name"),
                    "state": controller.get("state"),
                    "status": controller.get("status"),
                }
                for controller in reported_state.get("controllers", [])
            ],
        }
    
    diagnostics_data["host_overview"] = host_overview

    return diagnostics_data