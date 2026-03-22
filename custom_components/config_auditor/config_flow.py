"""Config flow for H.A.C.A.
Les options sont gérées via l'onglet Configuration du panel HACA,
pas via le flux options HA natif.
"""
from __future__ import annotations

import voluptuous as vol
from typing import Any

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, DEFAULT_SCAN_INTERVAL


class ConfigAuditorConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for H.A.C.A."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()

            scan_interval = user_input.get("scan_interval", DEFAULT_SCAN_INTERVAL)
            if not (5 <= scan_interval <= 1440):
                errors["scan_interval"] = "invalid_interval"
            else:
                return self.async_create_entry(
                    title="H.A.C.A",
                    data={},
                    options={
                        "scan_interval": scan_interval,
                        "startup_delay_seconds": 60,
                        "event_monitoring_enabled": True,
                        "event_debounce_seconds": 30,
                        "excluded_categories": [],
                        "excluded_issue_types": [
                            "no_description", "no_alias",
                            "helper_no_friendly_name", "helper_orphaned_disabled_only",
                            "helper_unused", "unused_input_boolean",
                            "script_orphan", "script_blueprint_candidate",
                            "scene_not_triggered", "timer_orphaned",
                            "template_sensor_no_metadata", "template_missing_availability",
                            "missing_state_class", "group_nested_deep",
                        ],
                        "auto_fix_enabled": False,
                        "backup_enabled": True,
                        "repairs_enabled": True,
                        "battery_notifications_enabled": True,
                        "battery_critical": 5,
                        "battery_low": 15,
                        "battery_warning": 25,
                        "history_retention_days": 365,
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "scan_interval", default=DEFAULT_SCAN_INTERVAL
                    ): vol.All(vol.Coerce(int), vol.Range(min=5, max=1440)),
                }
            ),
            errors=errors,
        )
    # Note: pas de async_get_options_flow — les options sont dans le panel HACA
    # (onglet Configuration → haca/save_options WebSocket)
