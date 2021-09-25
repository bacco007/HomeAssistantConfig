"""Constants for the Solcast Solar integration."""
from __future__ import annotations

from typing import Final

from homeassistant.const import (
    DEVICE_CLASS_ENERGY,
    ENERGY_KILO_WATT_HOUR,
)

from .models import SolcastSolarSensorEntityDescription

DOMAIN = "solcast_rooftop_solar"

CONF_APIKEY = "apikey"
CONF_ROOFTOP = "rooftop"
ATTR_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_SERVICE: Final = "service"

SENSORS: tuple[SolcastSolarSensorEntityDescription, ...] = (
    SolcastSolarSensorEntityDescription(
        key="energy_production_forecast_today",
        name="Estimated Energy Production - Today",
        state=lambda estimate: estimate.energy_production_today / 1000,
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
    SolcastSolarSensorEntityDescription(
        key="energy_production_forecast_tomorrow",
        name="Estimated Energy Production - Tomorrow",
        state=lambda estimate: estimate.energy_production_tomorrow / 1000,
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
)
