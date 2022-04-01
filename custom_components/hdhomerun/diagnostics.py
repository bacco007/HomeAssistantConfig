"""Diagnostics support for Linksys Velop"""

# region #-- imports --#
import logging
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    DOMAIN,
)
from .hdhomerun import HDHomeRunDevice

# endregion


_LOGGER = logging.getLogger(__name__)


async def async_get_config_entry_diagnostics(hass: HomeAssistant, config_entry: ConfigEntry) -> dict[str, Any]:
    """Diagnostics for the config entry"""

    cg: DataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL]
    hdhomerun_device: HDHomeRunDevice = cg.data

    ret = getattr(hdhomerun_device, "_results")

    return async_redact_data(ret, ["DeviceAuth"])
