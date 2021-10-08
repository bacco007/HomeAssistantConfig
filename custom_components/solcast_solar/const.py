"""Constants for the Solcast Solar integration."""
from __future__ import annotations

from datetime import timedelta
from typing import Final

from homeassistant.const import DEVICE_CLASS_ENERGY, ENERGY_KILO_WATT_HOUR

from .models import SolcastSolarSensorEntityDescription

DOMAIN = "solcast_solar"

CONF_APIKEY = "apikey"
CONF_ROOFTOP = "rooftop"
CONF_POLLAPI = "pollapi"
ATTR_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_SERVICE: Final = "service"

SENSORS: tuple[SolcastSolarSensorEntityDescription, ...] = (
    SolcastSolarSensorEntityDescription(
        key="energy_production_forecast_today",
        name="Forecast - Today",
        state=lambda estimate: round(estimate.energy_production_today / 1000, 3),
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
    SolcastSolarSensorEntityDescription(
        key="energy_production_forecast_tomorrow",
        name="Forecast - Tomorrow",
        state=lambda estimate: round(estimate.energy_production_tomorrow / 1000, 3),
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
    SolcastSolarSensorEntityDescription(
        key="solcast_api_poll_counter",
        name="This Integration API Count",
        state=lambda estimate: estimate.api_hit_counter,
        device_class="api_count",
    ),
    SolcastSolarSensorEntityDescription(
        key="energy_this_hour",
        state=lambda estimate: round(estimate.sum_energy_production(0) / 1000, 3),
        name="Forecast - This Hour",
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
    SolcastSolarSensorEntityDescription(
        key="energy_next_hour",
        state=lambda estimate: round(estimate.sum_energy_production(1) / 1000, 3),
        name="Forecast - Next Hour",
        device_class=DEVICE_CLASS_ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    ),
)
