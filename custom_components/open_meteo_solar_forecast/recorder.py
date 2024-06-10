"""Integration platform for recorder."""

from __future__ import annotations

from homeassistant.core import HomeAssistant, callback

from .const import ATTR_WATTS, ATTR_WH_PERIOD


@callback
def exclude_attributes(hass: HomeAssistant) -> set[str]:
    """Exclude potentially large attributes from being recorded in the database."""
    return {ATTR_WATTS, ATTR_WH_PERIOD}
