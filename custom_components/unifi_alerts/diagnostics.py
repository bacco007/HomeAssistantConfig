"""Diagnostics support for UniFi Alerts."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_API_KEY,
    CONF_WEBHOOK_SECRET,
)

_TO_REDACT: set[str] = {CONF_API_KEY, CONF_WEBHOOK_SECRET}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Return diagnostics for a UniFi Alerts config entry.

    Exposes webhook URLs (needed for UniFi Alarm Manager configuration)
    alongside redacted config and live coordinator state.
    """
    runtime_data = getattr(entry, "runtime_data", None)
    coordinator = runtime_data.coordinator if runtime_data is not None else None
    # register_all() no longer embeds the bearer secret in these URLs (#176),
    # so no redaction is needed before including them in shared diagnostics.
    webhook_urls: dict[str, str] = (
        dict(runtime_data.webhook_urls) if runtime_data is not None else {}
    )

    coordinator_info: dict[str, Any]
    if coordinator is not None:
        categories: dict[str, dict[str, Any]] = {}
        for cat, state in coordinator.category_states.items():
            categories[cat] = {
                "enabled": state.enabled,
                "is_alerting": state.is_alerting,
                "open_count": state.open_count,
                "alert_count": state.alert_count,
                "last_cleared_at": (
                    state.last_cleared_at.isoformat() if state.last_cleared_at is not None else None
                ),
                "last_webhook_at": (
                    state.last_webhook_at.isoformat() if state.last_webhook_at is not None else None
                ),
                "webhook_health": state.webhook_health(),
            }
        coordinator_info = {
            "any_alerting": coordinator.any_alerting,
            "rollup_alert_count": coordinator.rollup_alert_count,
            "rollup_open_count": coordinator.rollup_open_count,
            "categories": categories,
            "unrecognised_keys": dict(
                sorted(coordinator.unrecognised_keys.items(), key=lambda kv: kv[1], reverse=True)
            ),
            # Per-category alert content (message, device_name, last_alert.raw) is
            # intentionally excluded. Those fields carry controller-supplied strings
            # that may contain client hostnames, MAC addresses, or IP addresses and
            # would be shared verbatim in support reports. If alert detail is ever
            # added here, route it through async_redact_data with an appropriate
            # field list rather than including it directly.
        }
    else:
        coordinator_info = {}

    return {
        "config_entry": async_redact_data(dict(entry.data), _TO_REDACT),
        "options": async_redact_data(dict(entry.options), _TO_REDACT),
        "webhook_urls": webhook_urls,
        "coordinator": coordinator_info,
    }
