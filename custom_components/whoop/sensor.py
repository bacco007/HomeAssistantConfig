"""Sensor platform for WHOOP."""

import logging
from typing import Any, Dict, Optional, Union

from homeassistant.components.sensor import (
    SensorEntity,
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.const import (
    PERCENTAGE,
    UnitOfTime,
    UnitOfMass,
    UnitOfLength,
    UnitOfEnergy,
    UnitOfTemperature,
)

from .const import (
    DOMAIN,
    CONF_ENERGY_UNIT,
    ENERGY_KILOJOULES,
    ENERGY_KILOCALORIES,
    DEFAULT_ENERGY_UNIT,
)

_LOGGER = logging.getLogger(__name__)


def _parse_value(
    value: Any, target_type: type, precision: Optional[int] = None
) -> Optional[Union[float, int, str, bool]]:
    """Safely parse a value to the target type, with optional rounding."""
    if value is None:
        return None
    try:
        parsed_val: Any
        if target_type is float:
            parsed_val = float(value)
            return round(parsed_val, precision) if precision is not None else parsed_val
        if target_type is int:
            try:
                f_val = float(value)
                return int(f_val) if f_val == float(int(f_val)) else f_val
            except ValueError:
                return int(value)
        if target_type is bool:
            return bool(value)
        return str(value)
    except (ValueError, TypeError):
        return None


def _get_nested_value(data_dict: Optional[Dict[str, Any]], keys: str) -> Any:
    """Access a nested dictionary value using a dot-separated key string."""
    if not isinstance(data_dict, dict):
        return None
    _keys = keys.split(".")
    value = data_dict
    for key_part in _keys:
        if isinstance(value, dict):
            value = value.get(key_part)
        else:
            return None
        if value is None:
            return None
    return value


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the WHOOP sensors from a config entry."""
    coordinator_data = hass.data[DOMAIN][entry.entry_id]
    coordinator = coordinator_data["coordinator"]
    device_info = coordinator_data["device_info"]
    _LOGGER.debug("Setting up WHOOP sensors for device: %s", device_info.get("name"))

    sensors = [
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "profile",
            "user_id",
            "User ID",
            None,
            "mdi:account",
            None,
            None,
            str,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "profile",
            "email",
            "Email",
            None,
            "mdi:email",
            None,
            None,
            str,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "profile",
            "first_name",
            "First Name",
            None,
            "mdi:account-box",
            None,
            None,
            str,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "profile",
            "last_name",
            "Last Name",
            None,
            "mdi:account-box",
            None,
            None,
            str,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "body_measurement",
            "height_meter",
            "Height",
            UnitOfLength.METERS,
            "mdi:human-male-height",
            SensorDeviceClass.DISTANCE,
            SensorStateClass.MEASUREMENT,
            float,
            2,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "body_measurement",
            "weight_kilogram",
            "Weight",
            UnitOfMass.KILOGRAMS,
            "mdi:weight-kilogram",
            SensorDeviceClass.WEIGHT,
            SensorStateClass.MEASUREMENT,
            float,
            2,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "body_measurement",
            "max_heart_rate",
            "Max Heart Rate",
            "bpm",
            "mdi:heart-flash",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopCycleOverviewSensor(coordinator, entry, device_info),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_cycle.score",
            "strain",
            "Day Strain",
            None,
            "mdi:fire",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_cycle.score",
            "kilojoule",
            "Day Kilojoules",
            UnitOfEnergy.KILO_JOULE,
            "mdi:flash",
            None,
            SensorStateClass.TOTAL_INCREASING,
            float,
            1,
            enabled_by_default=False,
            is_energy_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_cycle.score",
            "average_heart_rate",
            "Day Average Heart Rate",
            "bpm",
            "mdi:heart-outline",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_cycle.score",
            "max_heart_rate",
            "Day Max Heart Rate",
            "bpm",
            "mdi:heart-flash",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopRecoveryOverviewSensor(coordinator, entry, device_info),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_recovery.score",
            "recovery_score",
            "Recovery Score",
            PERCENTAGE,
            "mdi:heart-pulse",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_recovery.score",
            "hrv_rmssd_milli",
            "HRV",
            "ms",
            "mdi:heart-pulse",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_recovery.score",
            "resting_heart_rate",
            "Resting Heart Rate",
            "bpm",
            "mdi:heart",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_recovery.score",
            "spo2_percentage",
            "SpO2",
            PERCENTAGE,
            "mdi:lungs",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_recovery.score",
            "skin_temp_celsius",
            "Skin Temperature",
            UnitOfTemperature.CELSIUS,
            "mdi:thermometer",
            SensorDeviceClass.TEMPERATURE,
            SensorStateClass.MEASUREMENT,
            float,
            1,
            enabled_by_default=False,
        ),
        WhoopSleepOverviewSensor(coordinator, entry, device_info),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score",
            "sleep_performance_percentage",
            "Sleep Performance",
            PERCENTAGE,
            "mdi:chart-line",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score",
            "respiratory_rate",
            "Sleep Respiratory Rate",
            "rpm",
            "mdi:weather-windy",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score",
            "sleep_consistency_percentage",
            "Sleep Consistency",
            PERCENTAGE,
            "mdi:sync",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score",
            "sleep_efficiency_percentage",
            "Sleep Efficiency",
            PERCENTAGE,
            "mdi:bed-clock",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_in_bed_time_milli",
            "Sleep Time in Bed",
            UnitOfTime.MILLISECONDS,
            "mdi:bed",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_awake_time_milli",
            "Sleep Time Awake",
            UnitOfTime.MILLISECONDS,
            "mdi:sleep-off",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_no_data_time_milli",
            "Sleep Time No Data",
            UnitOfTime.MILLISECONDS,
            "mdi:cloud-question",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_light_sleep_time_milli",
            "Sleep Light Sleep Time",
            UnitOfTime.MILLISECONDS,
            "mdi:power-sleep",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_slow_wave_sleep_time_milli",
            "Sleep SWS Time",
            UnitOfTime.MILLISECONDS,
            "mdi:sleep",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "total_rem_sleep_time_milli",
            "Sleep REM Sleep Time",
            UnitOfTime.MILLISECONDS,
            "mdi:brain",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "sleep_cycle_count",
            "Sleep Cycles",
            None,
            "mdi:debug-step-over",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.stage_summary",
            "disturbance_count",
            "Sleep Disturbances",
            None,
            "mdi:bell-sleep-outline",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.sleep_needed",
            "baseline_milli",
            "Sleep Baseline Need",
            UnitOfTime.MILLISECONDS,
            "mdi:clock-outline",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.sleep_needed",
            "need_from_sleep_debt_milli",
            "Sleep Debt Need",
            UnitOfTime.MILLISECONDS,
            "mdi:clock-alert-outline",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.sleep_needed",
            "need_from_recent_strain_milli",
            "Sleep Strain Need",
            UnitOfTime.MILLISECONDS,
            "mdi:fire",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_sleep.score.sleep_needed",
            "need_from_recent_nap_milli",
            "Sleep Nap Credit",
            UnitOfTime.MILLISECONDS,
            "mdi:power-nap",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopWorkoutOverviewSensor(coordinator, entry, device_info),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "strain",
            "Last Workout Strain",
            None,
            "mdi:run-fast",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            2,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "average_heart_rate",
            "Last Workout Average HR",
            "bpm",
            "mdi:heart-pulse",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "max_heart_rate",
            "Last Workout Max HR",
            "bpm",
            "mdi:heart",
            None,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "kilojoule",
            "Last Workout Kilojoules",
            UnitOfEnergy.KILO_JOULE,
            "mdi:lightning-bolt",
            None,
            SensorStateClass.TOTAL_INCREASING,
            float,
            1,
            enabled_by_default=False,
            is_energy_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "percent_recorded",
            "Last Workout Percent Recorded",
            PERCENTAGE,
            "mdi:chart-donut",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "distance_meter",
            "Last Workout Distance",
            UnitOfLength.METERS,
            "mdi:map-marker-distance",
            SensorDeviceClass.DISTANCE,
            SensorStateClass.MEASUREMENT,
            float,
            0,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "altitude_gain_meter",
            "Last Workout Altitude Gain",
            UnitOfLength.METERS,
            "mdi:image-filter-hdr",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score",
            "altitude_change_meter",
            "Last Workout Altitude Change",
            UnitOfLength.METERS,
            "mdi:delta",
            None,
            SensorStateClass.MEASUREMENT,
            float,
            1,
            enabled_by_default=False,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_zero_milli",
            "Last Workout Zone 0 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-outline",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_one_milli",
            "Last Workout Zone 1 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-outline",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_two_milli",
            "Last Workout Zone 2 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-outline",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_three_milli",
            "Last Workout Zone 3 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-pulse",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_four_milli",
            "Last Workout Zone 4 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-pulse",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
        WhoopDataSensor(
            coordinator,
            entry,
            device_info,
            "latest_workout.score.zone_durations",
            "zone_five_milli",
            "Last Workout Zone 5 Time",
            UnitOfTime.MILLISECONDS,
            "mdi:heart-pulse",
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            int,
            enabled_by_default=False,
            is_duration_sensor=True,
        ),
    ]
    async_add_entities(sensors, update_before_add=True)


class WhoopDataSensor(CoordinatorEntity, SensorEntity):
    """Generic WHOOP Sensor for individual data points that need history."""

    _attr_attribution = "Data provided by WHOOP"
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator,
        config_entry: ConfigEntry,
        device_info: DeviceInfo,
        data_path: str,
        entity_key: str,
        friendly_name: str,
        unit: Optional[str],
        icon: Optional[str],
        device_class: Optional[SensorDeviceClass],
        state_class: Optional[SensorStateClass],
        expected_type: type,
        precision: Optional[int] = None,
        enabled_by_default: bool = True,
        is_duration_sensor: bool = False,
        is_energy_sensor: bool = False,
    ):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self._data_path = data_path
        self._entity_key = entity_key
        self._expected_type = expected_type
        self._precision = precision
        self._base_friendly_name = friendly_name
        self._base_unit = unit
        self._is_duration_sensor = is_duration_sensor
        self._is_energy_sensor = is_energy_sensor

        unique_id_path = self._data_path.replace(".", "_")
        unique_id_entity = self._entity_key.replace(".", "_")
        self._attr_unique_id = (
            f"{config_entry.entry_id}_{unique_id_path}_{unique_id_entity}"
        )
        self._attr_device_info = device_info
        self._attr_entity_registry_enabled_default = enabled_by_default
        self._attr_name = friendly_name

        if icon:
            self._attr_icon = icon
        if device_class:
            self._attr_device_class = device_class
        if state_class:
            self._attr_state_class = state_class
        if unit:
            self._attr_native_unit_of_measurement = unit

        self._update_energy_unit_and_name()

    def _update_energy_unit_and_name(self) -> None:
        """Update unit and name based on config entry options (only for energy sensors)."""
        if not self._is_energy_sensor:
            return

        options = self.config_entry.options
        energy_unit = options.get(CONF_ENERGY_UNIT, DEFAULT_ENERGY_UNIT)
        if energy_unit == ENERGY_KILOCALORIES:
            self._attr_native_unit_of_measurement = "kcal"
            self._attr_name = self._base_friendly_name.replace("Kilojoules", "Calories")
        else:
            self._attr_native_unit_of_measurement = UnitOfEnergy.KILO_JOULE
            self._attr_name = self._base_friendly_name

    @property
    def native_value(self) -> Optional[Union[float, int, str, bool]]:
        """Return the state of the sensor."""
        full_path = f"{self._data_path}.{self._entity_key}"
        raw_value = _get_nested_value(self.coordinator.data, full_path)
        parsed_value = _parse_value(raw_value, self._expected_type, self._precision)

        if parsed_value is None or not isinstance(parsed_value, (int, float)):
            return parsed_value

        if self._is_energy_sensor:
            options = self.config_entry.options
            energy_unit = options.get(CONF_ENERGY_UNIT, DEFAULT_ENERGY_UNIT)
            if energy_unit == ENERGY_KILOCALORIES:
                return int(parsed_value * 0.239006)

        return parsed_value

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        if not (super().available and self.coordinator.data):
            return False
        full_path = f"{self._data_path}.{self._entity_key}"
        return _get_nested_value(self.coordinator.data, full_path) is not None


class WhoopCycleOverviewSensor(CoordinatorEntity, SensorEntity):
    """Overview sensor for the latest WHOOP Cycle."""

    _attr_attribution = "Data provided by WHOOP"
    _attr_icon = "mdi:calendar-sync"
    _attr_has_entity_name = True
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator, config_entry: ConfigEntry, device_info: DeviceInfo):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_{DOMAIN}_cycle_overview"
        self._attr_name = "Cycle Overview"
        self._attr_device_info = device_info

    @property
    def native_value(self) -> Optional[str]:
        """Return the state of the sensor (e.g., score_state)."""
        return _parse_value(
            _get_nested_value(self.coordinator.data, "latest_cycle.score_state"), str
        )

    @property
    def extra_state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return additional state attributes from the cycle."""
        attrs = {}
        cycle_data = _get_nested_value(self.coordinator.data, "latest_cycle")
        if isinstance(cycle_data, dict):
            for key in [
                "id",
                "user_id",
                "start",
                "end",
                "timezone_offset",
                "created_at",
                "updated_at",
            ]:
                attrs[key] = cycle_data.get(key)
            return {k: v for k, v in attrs.items() if v is not None}
        return None

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            super().available
            and _get_nested_value(self.coordinator.data, "latest_cycle.id") is not None
        )


class WhoopRecoveryOverviewSensor(CoordinatorEntity, SensorEntity):
    """Overview sensor for the latest WHOOP Recovery."""

    _attr_attribution = "Data provided by WHOOP"
    _attr_icon = "mdi:heart-check"
    _attr_has_entity_name = True
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator, config_entry: ConfigEntry, device_info: DeviceInfo):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_{DOMAIN}_recovery_overview"
        self._attr_name = "Recovery Overview"
        self._attr_device_info = device_info

    @property
    def native_value(self) -> Optional[str]:
        """Return the state of the sensor (e.g., score_state)."""
        return _parse_value(
            _get_nested_value(self.coordinator.data, "latest_recovery.score_state"), str
        )

    @property
    def extra_state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return additional state attributes."""
        attrs = {}
        recovery_data = _get_nested_value(self.coordinator.data, "latest_recovery")
        if isinstance(recovery_data, dict):
            for key in ["cycle_id", "sleep_id", "user_id", "created_at", "updated_at"]:
                attrs[key] = recovery_data.get(key)
            if isinstance(_get_nested_value(recovery_data, "score"), dict):
                attrs["user_calibrating"] = _get_nested_value(
                    recovery_data, "score.user_calibrating"
                )
            return {k: v for k, v in attrs.items() if v is not None}
        return None

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            super().available
            and _get_nested_value(self.coordinator.data, "latest_recovery.cycle_id")
            is not None
        )


class WhoopSleepOverviewSensor(CoordinatorEntity, SensorEntity):
    """Overview sensor for the latest WHOOP Sleep."""

    _attr_attribution = "Data provided by WHOOP"
    _attr_icon = "mdi:bed-empty"
    _attr_has_entity_name = True
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator, config_entry: ConfigEntry, device_info: DeviceInfo):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_{DOMAIN}_sleep_overview"
        self._attr_name = "Sleep Overview"
        self._attr_device_info = device_info

    @property
    def native_value(self) -> Optional[str]:
        """Return the state of the sensor (e.g., score_state)."""
        return _parse_value(
            _get_nested_value(self.coordinator.data, "latest_sleep.score_state"), str
        )

    @property
    def extra_state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return additional state attributes from sleep."""
        attrs = {}
        sleep_data = _get_nested_value(self.coordinator.data, "latest_sleep")
        if isinstance(sleep_data, dict):
            for key in [
                "id",
                "user_id",
                "created_at",
                "updated_at",
                "start",
                "end",
                "timezone_offset",
                "nap",
            ]:
                attrs[key] = sleep_data.get(key)
            return {k: v for k, v in attrs.items() if v is not None}
        return None

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            super().available
            and _get_nested_value(self.coordinator.data, "latest_sleep.id") is not None
        )


class WhoopWorkoutOverviewSensor(CoordinatorEntity, SensorEntity):
    """Overview sensor for the latest WHOOP Workout."""

    _attr_attribution = "Data provided by WHOOP"
    _attr_icon = "mdi:weight-lifter"
    _attr_has_entity_name = True
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator, config_entry: ConfigEntry, device_info: DeviceInfo):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_{DOMAIN}_workout_overview"
        self._attr_name = "Last Workout Overview"
        self._attr_device_info = device_info

    @property
    def native_value(self) -> Optional[str]:
        """Return the state of the sensor (e.g., score_state)."""
        return _parse_value(
            _get_nested_value(self.coordinator.data, "latest_workout.score_state"), str
        )

    @property
    def extra_state_attributes(self) -> Optional[Dict[str, Any]]:
        """Return additional state attributes from workout."""
        attrs = {}
        workout_data = _get_nested_value(self.coordinator.data, "latest_workout")
        if isinstance(workout_data, dict):
            for key in [
                "id",
                "user_id",
                "created_at",
                "updated_at",
                "start",
                "end",
                "timezone_offset",
                "sport_name",
            ]:
                attrs[key] = workout_data.get(key)
            if isinstance(_get_nested_value(workout_data, "score"), dict):
                attrs["percent_recorded"] = _get_nested_value(
                    workout_data, "score.percent_recorded"
                )
            return {k: v for k, v in attrs.items() if v is not None}
        return None

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            super().available
            and _get_nested_value(self.coordinator.data, "latest_workout.id")
            is not None
        )
