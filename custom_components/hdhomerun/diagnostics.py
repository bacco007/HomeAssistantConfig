"""Diagnostics support."""

# region #-- imports --#
import logging
from typing import Any, Callable, Dict

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    CONF_DATA_COORDINATOR_TUNER_STATUS,
    DOMAIN,
)
from .pyhdhr.discover import HDHomeRunDevice

# endregion


_LOGGER = logging.getLogger(__name__)


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> Dict[str, Any]:
    """Diagnostics for the config entry."""
    diags: Dict[str, Any] = {}

    device: HDHomeRunDevice | None = hass.data[DOMAIN][config_entry.entry_id][
        CONF_DATA_COORDINATOR_GENERAL
    ].data
    diags: Dict[str, Any] = {
        "device": {
            p: getattr(device, p, None)
            for p in [prop for prop in dir(HDHomeRunDevice) if not prop.startswith("_")]
            if not isinstance(getattr(device, p, None), Callable)
        }
    }

    device_tuner_status: HDHomeRunDevice | None = hass.data[DOMAIN][
        config_entry.entry_id
    ][CONF_DATA_COORDINATOR_TUNER_STATUS].data

    diags["device"]["tuner_status"] = device_tuner_status.tuner_status
    diags["device"]["raw_details"] = getattr(device, "_raw_details", None)
    diags["device"]["processed_datagram"] = getattr(device, "_processed_datagram", None)

    return async_redact_data(
        diags, to_redact=("device_id", "DeviceID", "device_auth_string", "DeviceAuth")
    )
