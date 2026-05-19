"""Forecast provider registry.

To register a new provider:
  1. Create a new file in this directory subclassing ForecastProvider
  2. Import it here and add to PROVIDERS dict
"""

from __future__ import annotations

from .base import ForecastProvider
from .met_no import MetNoProvider
from .meteo_france import MeteoFranceProvider
from .nws_noaa import NwsNoaaProvider
from .open_meteo import OpenMeteoProvider
from .open_weather_map import OpenWeatherMapProvider
from .pirate_weather import PirateWeatherProvider

__all__ = [
    "ForecastProvider",
    "OpenMeteoProvider",
    "MetNoProvider",
    "NwsNoaaProvider",
    "OpenWeatherMapProvider",
    "PirateWeatherProvider",
    "MeteoFranceProvider",
    "PROVIDERS",
    "get_provider",
]

PROVIDERS: dict[str, type[ForecastProvider]] = {
    OpenMeteoProvider.PROVIDER_ID: OpenMeteoProvider,
    MetNoProvider.PROVIDER_ID: MetNoProvider,
    NwsNoaaProvider.PROVIDER_ID: NwsNoaaProvider,
    OpenWeatherMapProvider.PROVIDER_ID: OpenWeatherMapProvider,
    PirateWeatherProvider.PROVIDER_ID: PirateWeatherProvider,
    MeteoFranceProvider.PROVIDER_ID: MeteoFranceProvider,
}


def get_provider(provider_id: str) -> ForecastProvider:
    """Return an instantiated ForecastProvider for the given ID.

    Falls back to Open-Meteo if the ID is unknown (e.g. after a downgrade).
    """
    cls = PROVIDERS.get(provider_id, OpenMeteoProvider)
    return cls()
