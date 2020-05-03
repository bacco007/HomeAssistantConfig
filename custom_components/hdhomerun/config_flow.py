"""Config flow for HDHomeRun."""
from homeassistant.helpers import config_entry_flow
from homeassistant import config_entries

from hdhr.adapter import HdhrUtility

from .const import DOMAIN

async def _async_has_devices(hass):
    """Return if there are devices that can be discovered."""
    hdhr_devices = HdhrUtility.discover_find_devices_custom()
    return len(hdhr_devices) > 0

config_entry_flow.register_discovery_flow(
    DOMAIN,
    'HDHomeRun',
    _async_has_devices,
    config_entries.CONN_CLASS_LOCAL_POLL
)
