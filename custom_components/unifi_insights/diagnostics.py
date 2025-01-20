"""Diagnostics support for UniFi Insights."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

TO_REDACT = {
    CONF_API_KEY,
    "macAddress",
    "id",
    "deviceId",
    "siteId",
    "ipAddress",
}

async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    _LOGGER.debug("Gathering diagnostics data for UniFi Insights")
    
    coordinator = hass.data[DOMAIN][entry.entry_id]

    # Get the raw data but remove sensitive information
    diagnostics_data = {
        "entry": async_redact_data(entry.as_dict(), TO_REDACT),
        "data": async_redact_data(coordinator.data, TO_REDACT),
    }

    _LOGGER.debug("Diagnostics data collected successfully")
    return diagnostics_data