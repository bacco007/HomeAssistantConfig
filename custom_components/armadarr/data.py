"""Custom types for Armadarr."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.loader import Integration

    from .coordinator import DailyCoordinator, StandardCoordinator


@dataclass
class ArmadarrData:
    """Data for the Armadarr integration."""

    client: Any
    standard_coordinator: StandardCoordinator
    daily_coordinator: DailyCoordinator
    integration: Integration


type ArmadarrConfigEntry = "ConfigEntry[ArmadarrData]"
