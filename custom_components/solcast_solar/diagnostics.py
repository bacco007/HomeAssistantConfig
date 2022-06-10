"""Support for the Solcast diagnostics."""
from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics.util import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN #, CONF_RESOURCE_ID
from homeassistant.const import CONF_NAME, CONF_API_KEY
from .coordinator import SolcastUpdateCoordinator

TO_REDACT = [
    CONF_API_KEY,
]


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: SolcastUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    return {
        "info": async_redact_data(config_entry.options, TO_REDACT),
        "data": async_redact_data(coordinator.data, TO_REDACT),
    }