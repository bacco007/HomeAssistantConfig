from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_API_KEY

from . import TransportNSWConfigEntry
from .const import (
    CONF_DESTINATION_ID,
    CONF_DESTINATION_NAME,
    CONF_ORIGIN_ID,
    CONF_ORIGIN_NAME
)

TO_REDACT = [
    CONF_API_KEY,
    CONF_ORIGIN_ID,
    CONF_ORIGIN_NAME,
    CONF_DESTINATION_ID,
    CONF_DESTINATION_NAME,
    "user_title",
]


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    config_entry: TransportNSWConfigEntry,
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""

    subentry_data = {}
    for subentry in config_entry.subentries.values():
        subentry_data[subentry.subentry_id] = async_redact_data(subentry.data, TO_REDACT)

    return {
        "entry_data": async_redact_data(
            config_entry.data,
            TO_REDACT,
        ),
        "subentry_data": subentry_data,
    }