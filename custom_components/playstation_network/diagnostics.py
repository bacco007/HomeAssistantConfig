"""Diagnostics support for Playstation Network."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics.util import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import PsnCoordinator
from .const import DOMAIN, PSN_COORDINATOR

TO_REDACT = {}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator: PsnCoordinator = hass.data[DOMAIN][entry.entry_id][PSN_COORDINATOR]
    return async_redact_data(coordinator.data, TO_REDACT)
