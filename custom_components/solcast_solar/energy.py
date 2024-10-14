"""Energy platform."""

# pylint: disable=C0304, E0401

from __future__ import annotations

from typing import Any

import logging

from homeassistant.core import HomeAssistant # type: ignore

from . import SolcastUpdateCoordinator
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_get_solar_forecast(hass: HomeAssistant, config_entry_id: str) -> (dict[str, Any] | None):
    """Get solar forecast for a config entry ID.

    Arguments:
        hass (HomeAssistant): The Home Assistant instance.
        config_entry_id (str): The integration entry ID.

    Returns:
        dict[str, Any] | None: The Energy Dashboard compatible forecast data
    """

    if not hass.data.get(DOMAIN):
        _LOGGER.warning("Domain %s is not yet available to provide forecast data", DOMAIN)
        return None

    coordinator: SolcastUpdateCoordinator = hass.data[DOMAIN][config_entry_id]

    if coordinator is None:
        return None

    return coordinator.get_energy_tab_data()