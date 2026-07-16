"""Football Hub API adapter using FM as the only data provider."""
from __future__ import annotations

from .fm import FMProvider, FMProviderError


class FootballHubAPIError(FMProviderError):
    """Football Hub provider error."""


class FootballHubAPI(FMProvider):
    """Compatibility adapter used by the existing Football Hub coordinator."""

    def __init__(self, hass, api_key: str | None = None):
        # api_key is deliberately ignored in the FM-only trial.
        super().__init__(hass)
