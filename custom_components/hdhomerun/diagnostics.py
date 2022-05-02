"""Diagnostics support for Linksys Velop"""

# region #-- imports --#
import logging
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_DEVICE,
    DOMAIN,
)
from .pyhdhr import HDHomeRunDevice

# endregion


_LOGGER = logging.getLogger(__name__)


async def async_get_config_entry_diagnostics(hass: HomeAssistant, config_entry: ConfigEntry) -> dict[str, Any]:
    """Diagnostics for the config entry"""

    hdhomerun_device: HDHomeRunDevice = hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE]
    diags = hdhomerun_device.__dict__
    diags.pop("_session", None)

    return async_redact_data(diags, to_redact=("_device_auth_str", "_device_id"))
