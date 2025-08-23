"""Support for Cloudflare Speed Test internet speed testing sensor."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, cast

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import UnitOfDataRate, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTR_SERVER_REGION,
    ATTR_SERVER_CODE,
    ATTR_SERVER_CITY,
    ATTRIBUTION,
    DEFAULT_NAME,
    DOMAIN,
)
from .coordinator import (
    CloudflareSpeedTestConfigEntry,
    CloudflareSpeedTestDataCoordinator,
)


@dataclass(frozen=True)
class CloudflareSpeedTestSensorEntityDescription(SensorEntityDescription):
    """Class describing CloudflareSpeedTest sensor entities."""

    value: Callable = round


SENSOR_TYPES: tuple[CloudflareSpeedTestSensorEntityDescription, ...] = (
    CloudflareSpeedTestSensorEntityDescription(
        key="ip",
        translation_key="ip",
        name="IP address",
        value=lambda value: value,
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="isp",
        translation_key="isp",
        name="ISP",
        value=lambda value: value,
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="latency",
        translation_key="latency",
        name="Latency",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DURATION,
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="jitter",
        translation_key="jitter",
        name="Jitter",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DURATION,
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="100kB_down_bps",
        translation_key="100kb_down",
        name="100kB down",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="100kB_up_bps",
        translation_key="100kb_up",
        name="100kB up",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="1MB_down_bps",
        translation_key="1mb_down",
        name="1MB down",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="1MB_up_bps",
        translation_key="1mb_up",
        name="1MB up",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="10MB_down_bps",
        translation_key="10mb_down",
        name="10MB down",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="10MB_up_bps",
        translation_key="10mb_up",
        name="10MB up",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="25MB_down_bps",
        translation_key="25mb_down",
        name="25MB down",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="90th_percentile_down_bps",
        translation_key="90th_percentile_down",
        name="90th percentile down",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
    CloudflareSpeedTestSensorEntityDescription(
        key="90th_percentile_up_bps",
        translation_key="90th_percentile_up",
        name="90th percentile up",
        native_unit_of_measurement=UnitOfDataRate.MEGABITS_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DATA_RATE,
        value=lambda value: round(value / 10**6, 2),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: CloudflareSpeedTestConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the Cloudflare_speed_test sensors."""
    cloudflarespeedtest_coordinator = config_entry.runtime_data
    async_add_entities(
        CloudflareSpeedTestSensor(cloudflarespeedtest_coordinator, description)
        for description in SENSOR_TYPES
    )


class CloudflareSpeedTestSensor(
    CoordinatorEntity[CloudflareSpeedTestDataCoordinator], SensorEntity
):
    """Implementation of a Cloudflare Speed Test sensor."""

    entity_description: CloudflareSpeedTestSensorEntityDescription
    _attr_attribution = ATTRIBUTION
    _attr_has_entity_name = True
    _attr_force_update = True

    def __init__(
        self,
        coordinator: CloudflareSpeedTestDataCoordinator,
        description: CloudflareSpeedTestSensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = description.key
        self._state: StateType = None
        self._attrs: dict[str, Any] = {}
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.config_entry.entry_id)},
            name=DEFAULT_NAME,
            entry_type=DeviceEntryType.SERVICE,
        )

    @property
    def native_value(self) -> StateType:
        """Return native value for entity."""
        if self.coordinator.data:
            location = "meta" if self.entity_description.key == "ip" else "tests"
            location_dict = self.coordinator.data.get(location, {})
            value_obj = location_dict.get(self.entity_description.key, {})
            state = getattr(value_obj, "value")
            if state is not None:
                self._state = cast(StateType, self.entity_description.value(state))
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if self.coordinator.data:
            meta = self.coordinator.data.get("meta", {})
            self._attrs.update(
                {
                    ATTR_SERVER_CITY: getattr(meta.get("location_city"), "value", None),
                    ATTR_SERVER_REGION: getattr(
                        meta.get("location_region"), "value", None
                    ),
                    ATTR_SERVER_CODE: getattr(meta.get("location_code"), "value", None),
                }
            )

        return self._attrs

    @property
    def available(self) -> bool:
        """Keep entity available during coordinator refresh if we have prior data."""

        base_available = super().available
        have_prior_data = self._state is not None or bool(self.coordinator.data)

        return base_available or have_prior_data
