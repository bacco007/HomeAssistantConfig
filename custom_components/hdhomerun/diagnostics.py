"""Diagnostics support."""

# region #-- imports --#
import logging
from typing import Any, Dict, List

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_DEVICE, DOMAIN
from .pyhdhr import HDHomeRunDevice

# endregion


_LOGGER = logging.getLogger(__name__)


async def async_get_config_entry_diagnostics(hass: HomeAssistant, config_entry: ConfigEntry) -> Dict[str, Any]:
    """Diagnostics for the config entry."""
    props_to_remove: List[str] = [
        "_log_formatter",
        "_session",
    ]

    hdhomerun_device: HDHomeRunDevice = hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE]
    diags = hdhomerun_device.__dict__.copy()
    for prop in props_to_remove:
        diags.pop(prop, None)

    return async_redact_data(diags, to_redact=("_device_auth_str", "_device_id"))
