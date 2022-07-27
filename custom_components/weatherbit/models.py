"""The WeatherBit integration models."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from pyweatherbitdata import WeatherBitApiClient
from pyweatherbitdata.data import BaseDataDescription


@dataclass
class WeatherBitEntryData:
    """Data for the weatherbit integration."""

    weatherbitapi: WeatherBitApiClient
    coordinator: DataUpdateCoordinator
    forecast_coordinator: DataUpdateCoordinator
    station_data: BaseDataDescription
    unit_descriptions: dict[str, Any]
