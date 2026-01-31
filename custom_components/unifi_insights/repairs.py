"""Repairs for the UniFi Insights integration."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.components.repairs import RepairsFlow

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.data_entry_flow import FlowResult

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsRepairFlow(RepairsFlow):  # type: ignore[misc]
    """Handler for UniFi Insights repair flows."""

    def __init__(self, issue_id: str) -> None:
        """Initialize the repair flow."""
        super().__init__()
        self.issue_id = issue_id

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> FlowResult:
        """Handle the first step of the repair flow."""
        if self.issue_id == "deprecated_yaml":
            return await self.async_step_deprecated_yaml(user_input)
        if self.issue_id == "api_key_expired":
            return await self.async_step_api_key_expired(user_input)
        if self.issue_id == "device_offline":
            return await self.async_step_device_offline(user_input)
        # Unknown issue - abort
        return self.async_abort(reason="unknown_issue")

    async def async_step_deprecated_yaml(
        self, user_input: dict[str, str] | None = None
    ) -> FlowResult:
        """Handle deprecated YAML configuration repair."""
        if user_input is not None:
            # User acknowledged - remove the issue
            return self.async_create_entry(data={})

        return self.async_show_form(
            step_id="deprecated_yaml",
            description_placeholders={
                "integration": "UniFi Insights",
            },
        )

    async def async_step_api_key_expired(
        self, user_input: dict[str, str] | None = None
    ) -> FlowResult:
        """Handle expired API key repair."""
        if user_input is not None:
            # Direct user to reconfigure
            return self.async_abort(reason="reconfigure_required")

        return self.async_show_form(
            step_id="api_key_expired",
            description_placeholders={
                "integration": "UniFi Insights",
            },
        )

    async def async_step_device_offline(
        self, user_input: dict[str, str] | None = None
    ) -> FlowResult:
        """Handle device offline repair."""
        if user_input is not None:
            # User acknowledged
            return self.async_create_entry(data={})

        return self.async_show_form(
            step_id="device_offline",
            description_placeholders={
                "integration": "UniFi Insights",
            },
        )


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str] | None,
) -> RepairsFlow:
    """Create a repair flow for the given issue."""
    _ = hass  # Unused but required by HA signature
    _ = data  # Unused but required by HA signature
    return UnifiInsightsRepairFlow(issue_id)
