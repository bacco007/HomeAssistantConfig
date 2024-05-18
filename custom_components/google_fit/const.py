"""Constants for Google Fit."""

from __future__ import annotations
from typing import Final
from logging import Logger, getLogger
from homeassistant.components.sensor import (
    SensorStateClass,
    SensorDeviceClass,
)
from homeassistant.const import (
    UnitOfTime,
    UnitOfLength,
    UnitOfMass,
    UnitOfPressure,
    UnitOfVolume,
    UnitOfTemperature,
    PERCENTAGE,
)

from .api_types import (
    SumPointsSensorDescription,
    LastPointSensorDescription,
    SumSessionSensorDescription,
)

LOGGER: Logger = getLogger(__package__)

# Base Component Values
NAME: Final = "Google Fit"
DOMAIN: Final = "google_fit"
MANUFACTURER: Final = "Google, Inc."

# Configuration schema
CONF_INFREQUENT_INTERVAL_MULTIPLIER: Final = "infrequent_interval"

# Default Configuration Values
DEFAULT_SCAN_INTERVAL: Final = 5
DEFAULT_INFREQUENT_INTERVAL: Final = 12

# Useful constants
NANOSECONDS_SECONDS_CONVERSION: Final = 1000000000

# Required Scopes
DEFAULT_ACCESS = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.body_temperature.read",
    "https://www.googleapis.com/auth/fitness.nutrition.read",
    "https://www.googleapis.com/auth/fitness.location.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.blood_pressure.read",
    "https://www.googleapis.com/auth/fitness.blood_glucose.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
]

# Sleep Data Enum. Taken from:
# https://developers.google.com/fit/scenarios/read-sleep-data
SLEEP_STAGE: Final = {
    0: "unspecified",
    1: "awakeSeconds",
    2: "sleepSeconds",
    3: "Out-of-bed",  # Not supported
    4: "lightSleepSeconds",
    5: "deepSleepSeconds",
    6: "remSleepSeconds",
}


ENTITY_DESCRIPTIONS = (
    SumPointsSensorDescription(
        key="google_fit",
        name="Active Minutes Daily",
        icon="mdi:timer",
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes",
        data_key="activeMinutes",
        is_int=True,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Calories Burnt Daily",
        icon="mdi:fire",
        native_unit_of_measurement="kcal",
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=None,
        source="derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",  # pylint: disable=line-too-long
        data_key="calories",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Basal Metabolic Rate",
        icon="mdi:target",
        native_unit_of_measurement="kcal",
        state_class=SensorStateClass.MEASUREMENT,
        device_class=None,
        source="derived:com.google.calories.bmr:com.google.android.gms:merged",
        data_key="basalMetabolicRate",
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Distance Travelled Daily",
        icon="mdi:run",
        native_unit_of_measurement=UnitOfLength.METERS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DISTANCE,
        source="derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
        data_key="distance",
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Heart Points Daily",
        icon="mdi:heart",
        native_unit_of_measurement=None,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=None,
        source="derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes",
        data_key="heartMinutes",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Height",
        icon="mdi:ruler",
        native_unit_of_measurement=UnitOfLength.METERS,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.DISTANCE,
        source="derived:com.google.height:com.google.android.gms:merge_height",
        data_key="height",
        infrequent_update=True,
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Weight",
        icon="mdi:scale-bathroom",
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.WEIGHT,
        source="derived:com.google.weight:com.google.android.gms:merge_weight",
        data_key="weight",
        infrequent_update=True,
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Body Fat",
        icon="mdi:scale-balance",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=None,
        source="derived:com.google.body.fat.percentage:com.google.android.gms:merged",
        data_key="bodyFat",
        infrequent_update=True,
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Body Temperature",
        icon="mdi:thermometer",
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.TEMPERATURE,
        source="derived:com.google.body.temperature:com.google.android.gms:merged",
        data_key="bodyTemperature",
        infrequent_update=True,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Steps Daily",
        icon="mdi:walk",
        native_unit_of_measurement=None,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=None,
        source="derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
        data_key="steps",
        is_int=True,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Awake Time",
        icon="mdi:sun-clock",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.sleep.segment:com.google.android.gms:merged",
        data_key="awakeSeconds",
        is_int=True,
        is_sleep=True,
        period_seconds=60 * 60 * 24,
    ),
    SumSessionSensorDescription(
        key="google_fit",
        name="Sleep",
        icon="mdi:bed-clock",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.sleep.segment:com.google.android.gms:merged",
        data_key="sleepSeconds",
        activity_id=72,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Light Sleep",
        icon="mdi:power-sleep",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.sleep.segment:com.google.android.gms:merged",
        data_key="lightSleepSeconds",
        is_int=True,
        is_sleep=True,
        period_seconds=60 * 60 * 24,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Deep Sleep",
        icon="mdi:sleep",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.sleep.segment:com.google.android.gms:merged",
        data_key="deepSleepSeconds",
        is_int=True,
        is_sleep=True,
        period_seconds=60 * 60 * 24,
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="REM Sleep",
        icon="mdi:chat-sleep",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.DURATION,
        source="derived:com.google.sleep.segment:com.google.android.gms:merged",
        data_key="remSleepSeconds",
        is_int=True,
        is_sleep=True,
        period_seconds=60 * 60 * 24,
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Heart Rate",
        icon="mdi:heart-pulse",
        native_unit_of_measurement="bpm",
        state_class=SensorStateClass.MEASUREMENT,
        source="derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
        data_key="heartRate",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Resting Heart Rate",
        icon="mdi:heart",
        native_unit_of_measurement="bpm",
        state_class=SensorStateClass.MEASUREMENT,
        source="derived:com.google.heart_rate.bpm:com.google.android.gms:"
        + "resting_heart_rate<-merge_heart_rate_bpm",
        data_key="heartRateResting",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Blood Pressure Systolic",
        icon="mdi:heart-box",
        native_unit_of_measurement=UnitOfPressure.MMHG,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.PRESSURE,
        source="derived:com.google.blood_pressure:com.google.android.gms:merged",
        data_key="bloodPressureSystolic",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Blood Pressure Diastolic",
        icon="mdi:heart-box-outline",
        native_unit_of_measurement=UnitOfPressure.MMHG,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=SensorDeviceClass.PRESSURE,
        source="derived:com.google.blood_pressure:com.google.android.gms:merged",
        data_key="bloodPressureDiastolic",
        index=1,
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Blood Glucose",
        icon="mdi:water",
        native_unit_of_measurement="mmol/L",
        state_class=SensorStateClass.MEASUREMENT,
        device_class=None,
        source="derived:com.google.blood_glucose:com.google.android.gms:merged",
        data_key="bloodGlucose",
    ),
    SumPointsSensorDescription(
        key="google_fit",
        name="Hydration",
        icon="mdi:cup-water",
        native_unit_of_measurement=UnitOfVolume.LITERS,
        state_class=SensorStateClass.TOTAL_INCREASING,
        device_class=SensorDeviceClass.VOLUME,
        source="derived:com.google.hydration:com.google.android.gms:merged",
        data_key="hydration",
    ),
    LastPointSensorDescription(
        key="google_fit",
        name="Oxygen Saturation",
        icon="mdi:water-percent",
        native_unit_of_measurement=PERCENTAGE,
        state_class=SensorStateClass.MEASUREMENT,
        device_class=None,
        source="derived:com.google.oxygen_saturation:com.google.android.gms:merged",
        data_key="oxygenSaturation",
    ),
)
