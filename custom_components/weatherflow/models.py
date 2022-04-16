"""The weatherflow integration models."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from pyweatherflowrest import WeatherFlowApiClient
from pyweatherflowrest.data import StationDescription


@dataclass
class WeatherFlowEntryData:
    """Data for the weatherflow integration."""

    weatherflowapi: WeatherFlowApiClient
    coordinator: DataUpdateCoordinator
    forecast_coordinator: DataUpdateCoordinator
    station_data: StationDescription
    unit_descriptions: dict[str, Any]
