"""Persistent storage for the Weather.com component."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DOMAIN,

    HIGH_TEMP_TODAY_STORAGE,
    HIGH_TEMP_TODAY_TIMESTAMP_STORAGE
)

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = '{domain}.{location_name}'
STORAGE_VERSION = 1


class WeatherDotComStorage:
    """Persistent storage for Weather.com data."""

    def __init__(self, hass: HomeAssistant, location_name: str) -> None:
        self._store = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY.format(domain=DOMAIN, location_name=location_name.lower()),
        )

    async def async_load(self) -> dict[str, Any] | None:
        return await self._store.async_load() or {}

    async def async_save(self, high_temp_today, high_temp_today_timestamp) -> None:
        data_to_save = {}
        data_to_save[HIGH_TEMP_TODAY_STORAGE] = high_temp_today
        data_to_save[HIGH_TEMP_TODAY_TIMESTAMP_STORAGE] = high_temp_today_timestamp
        await self._store.async_save(data_to_save)
