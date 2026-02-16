"""Support for the Open-Meteo Solar Forecast sensor service."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.sensor import (
    DOMAIN as SENSOR_DOMAIN,
)
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy, UnitOfPower
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_utc_time_change
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify

from open_meteo_solar_forecast.models import Estimate

from .const import ATTR_WATTS, ATTR_WH_PERIOD, DOMAIN
from .coordinator import OpenMeteoSolarForecastDataUpdateCoordinator


@dataclass(frozen=True)
class OpenMeteoSolarForecastSensorEntityDescription(SensorEntityDescription):
    """Describes a Solar Forecast Sensor."""

    state: Callable[[Estimate], Any] | None = None


SENSORS: tuple[OpenMeteoSolarForecastSensorEntityDescription, ...] = (
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_today",
        translation_key="energy_production_today",
        state=lambda estimate: estimate.energy_production_today,
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_today_remaining",
        translation_key="energy_production_today_remaining",
        state=lambda estimate: estimate.energy_production_today_remaining,
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_tomorrow",
        translation_key="energy_production_tomorrow",
        state=lambda estimate: estimate.energy_production_tomorrow,
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d2",
        translation_key="energy_production_d2",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=2)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d3",
        translation_key="energy_production_d3",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=3)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d4",
        translation_key="energy_production_d4",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=4)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d5",
        translation_key="energy_production_d5",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=5)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d6",
        translation_key="energy_production_d6",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=6)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_production_d7",
        translation_key="energy_production_d7",
        state=lambda estimate: estimate.day_production(
            estimate.now().date() + timedelta(days=7)
        ),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_highest_peak_time_today",
        translation_key="power_highest_peak_time_today",
        device_class=SensorDeviceClass.TIMESTAMP,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_highest_peak_time_tomorrow",
        translation_key="power_highest_peak_time_tomorrow",
        device_class=SensorDeviceClass.TIMESTAMP,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_now",
        translation_key="power_production_now",
        device_class=SensorDeviceClass.POWER,
        state=lambda estimate: estimate.power_production_now,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_next_15minutes",
        translation_key="power_production_next_15minutes",
        state=lambda estimate: estimate.power_production_at_time(
            estimate.now() + timedelta(minutes=15)
        ),
        device_class=SensorDeviceClass.POWER,
        entity_registry_enabled_default=False,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_next_30minutes",
        translation_key="power_production_next_30minutes",
        state=lambda estimate: estimate.power_production_at_time(
            estimate.now() + timedelta(minutes=30)
        ),
        device_class=SensorDeviceClass.POWER,
        entity_registry_enabled_default=False,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_next_hour",
        translation_key="power_production_next_hour",
        state=lambda estimate: estimate.power_production_at_time(
            estimate.now() + timedelta(hours=1)
        ),
        device_class=SensorDeviceClass.POWER,
        entity_registry_enabled_default=False,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_next_12hours",
        translation_key="power_production_next_12hours",
        state=lambda estimate: estimate.power_production_at_time(
            estimate.now() + timedelta(hours=12)
        ),
        device_class=SensorDeviceClass.POWER,
        entity_registry_enabled_default=False,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="power_production_next_24hours",
        translation_key="power_production_next_24hours",
        state=lambda estimate: estimate.power_production_at_time(
            estimate.now() + timedelta(hours=24)
        ),
        device_class=SensorDeviceClass.POWER,
        entity_registry_enabled_default=False,
        native_unit_of_measurement=UnitOfPower.WATT,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_current_hour",
        translation_key="energy_current_hour",
        state=lambda estimate: estimate.energy_current_hour,
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
    OpenMeteoSolarForecastSensorEntityDescription(
        key="energy_next_hour",
        translation_key="energy_next_hour",
        state=lambda estimate: estimate.sum_energy_production(1),
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.WATT_HOUR,
        suggested_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Defer sensor setup to the shared sensor module."""
    coordinator: OpenMeteoSolarForecastDataUpdateCoordinator = hass.data[DOMAIN][
        entry.entry_id
    ]

    async_add_entities(
        OpenMeteoSolarForecastSensorEntity(
            entry_id=entry.entry_id,
            coordinator=coordinator,
            entity_description=entity_description,
        )
        for entity_description in SENSORS
    )


class OpenMeteoSolarForecastSensorEntity(
    CoordinatorEntity[OpenMeteoSolarForecastDataUpdateCoordinator], SensorEntity
):
    """Defines a Open-Meteo sensor."""

    entity_description: OpenMeteoSolarForecastSensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        *,
        entry_id: str,
        coordinator: OpenMeteoSolarForecastDataUpdateCoordinator,
        entity_description: OpenMeteoSolarForecastSensorEntityDescription,
    ) -> None:
        """Initialize Open-Meteo Solar sensor."""
        super().__init__(coordinator=coordinator)
        self.entity_description = entity_description
        service_slug = slugify(coordinator.config_entry.title) or coordinator.config_entry.entry_id
        self.entity_id = f"{SENSOR_DOMAIN}.{service_slug}_{entity_description.key}"
        self._attr_unique_id = f"{entry_id}_{entity_description.key}"

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, entry_id)},
            manufacturer="Open-Meteo",
            name="Solar production forecast",
            configuration_url="https://open-meteo.com",
        )

    async def _update_callback(self, now: datetime) -> None:
        """Update the entity without fetching data from server.

        This is required for the power_production_* sensors to update
        as they take data in 15-minute intervals and the update interval
        is 30 minutes."""
        if not self.enabled:
            return

        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Register callbacks."""
        await super().async_added_to_hass()

        # Update the state of the sensor every minute without
        # fetching new data from the server.
        self.async_on_remove(
            async_track_utc_time_change(
                self.hass,
                self._update_callback,
                second=0,
            )
        )

    @property
    def native_value(self) -> datetime | StateType:
        """Return the state of the sensor."""
        if self.entity_description.state is None:
            state: StateType | datetime = getattr(
                self.coordinator.data, self.entity_description.key
            )
        else:
            state = self.entity_description.state(self.coordinator.data)

        return state

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return the state attributes."""
        if self.entity_description.key.startswith(
            "energy_production_d"
        ) or self.entity_description.key in (
            "energy_production_today",
            "energy_production_tomorrow",
        ):
            target_date = self.coordinator.data.now().date()
            if self.entity_description.key == "energy_production_tomorrow":
                target_date += timedelta(days=1)
            elif self.entity_description.key.startswith("energy_production_d"):
                target_date += timedelta(
                    days=int(self.entity_description.key[len("energy_production_d") :])
                )
            elif self.entity_description.key == "energy_production_today":
                pass  # target_date is already set to today
            else:
                raise ValueError(
                    f"Unexpected key {self.entity_description.key} for extra_state_attributes"
                )

            return {
                ATTR_WATTS: {
                    watt_datetime.isoformat(): watt_value
                    for watt_datetime, watt_value in self.coordinator.data.watts.items()
                    if watt_datetime.date() == target_date
                },
                ATTR_WH_PERIOD: {
                    wh_datetime.isoformat(): wh_value
                    for wh_datetime, wh_value in self.coordinator.data.wh_period.items()
                    if wh_datetime.date() == target_date
                },
            }

        return None
