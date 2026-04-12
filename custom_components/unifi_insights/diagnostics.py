"""Diagnostics support for UniFi Insights."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_API_KEY, CONF_HOST, CONF_VERIFY_SSL

from .api import __version__ as api_version
from .const import CONF_CONSOLE_ID

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from . import UnifiInsightsConfigEntry

_LOGGER = logging.getLogger(__name__)

TO_REDACT = {
    # Credentials and secrets
    CONF_API_KEY,
    "token",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "password",
    "psk",
    "passphrase",
    "secret",
    "voucher",
    "fingerprint",
    # Network identifiers
    CONF_HOST,
    "ip",
    "ipAddress",
    "ip_address",
    "host",
    "hostname",
    "wan_ip",
    "wanIp",
    "lan_ip",
    "lanIp",
    # Device identifiers
    "mac",
    "mac_address",
    "macAddress",
    "serial",
    "serialNumber",
    "hardwareId",
    "hardware_id",
    # HA config entry fields
    "unique_id",
    CONF_CONSOLE_ID,
    CONF_VERIFY_SSL,
    # Common API response id fields that may contain sensitive info
    "id",
    "deviceId",
    "siteId",
    # Location data
    "latitude",
    "longitude",
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
    library_version = api_version

    # Get sanitized connection info
    connection_info = {
        "host": "**REDACTED**",
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
