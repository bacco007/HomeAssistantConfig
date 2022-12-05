"""Config flow for UPnP Availability."""
import logging

from homeassistant.helpers import config_entry_flow

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def _async_has_devices(hass) -> bool:
    """There are always devices to be discovered."""
    return True


config_entry_flow.register_discovery_flow(
    DOMAIN, "UPnP Availability", _async_has_devices
)
