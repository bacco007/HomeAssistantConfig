"""Models for the Solcast Solar integration."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from homeassistant.components.sensor import SensorEntityDescription

from .estimate import Estimate


@dataclass
class SolcastSolarSensorEntityDescription(SensorEntityDescription):
    """Describes a Solcast Solar Sensor."""

    state: Callable[[Estimate], Any] | None = None
