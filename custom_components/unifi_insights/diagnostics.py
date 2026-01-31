"""Diagnostics support for UniFi Insights."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

import unifi_official_api
from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_API_KEY, CONF_HOST

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from . import UnifiInsightsConfigEntry

_LOGGER = logging.getLogger(__name__)

TO_REDACT = {
    CONF_API_KEY,
    "unique_id",  # Also redact unique_id as it may contain the API key
    "macAddress",
    "id",
    "deviceId",
    "siteId",
    "ipAddress",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: UnifiInsightsConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    _ = hass
    _LOGGER.debug("Gathering diagnostics data for UniFi Insights")

    data = entry.runtime_data
    coordinator = data.coordinator

    # Get library version
    library_version = getattr(unifi_official_api, "__version__", "unknown")

    # Get sanitized connection info
    connection_info = {
        "host": entry.data.get(CONF_HOST, "unknown"),
        "network_client_connected": coordinator.network_client is not None,
        "protect_client_connected": coordinator.protect_client is not None,
    }

    # Get the raw data but remove sensitive information
    diagnostics_data = {
        "library_version": library_version,
        "connection": connection_info,
        "entry": async_redact_data(entry.as_dict(), TO_REDACT),
        "data": async_redact_data(coordinator.data, TO_REDACT),
    }

    _LOGGER.debug("Diagnostics data collected successfully")
    return diagnostics_data
