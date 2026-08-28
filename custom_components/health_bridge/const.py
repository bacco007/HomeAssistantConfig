"""Constants for the Health Bridge integration (enum-safe, HA-compatible)."""

from __future__ import annotations

# Import only stable unit constants
from homeassistant.const import (
    UnitOfEnergy,
    UnitOfLength,
    UnitOfMass,
    UnitOfTime,
    UnitOfTemperature,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfVolume,
    PERCENTAGE,
)

DOMAIN = "health_bridge"
DEFAULT_ICON = "mdi:heart-pulse"

# device_class/state_class are strings; sensor.py coerces them to Enums safely
METRIC_ATTRIBUTES_MAP = {
    # -------- Internal / Time --------
    "last_sync_time": {
        "device_class": "timestamp",
        "native_unit_of_measurement": None,
        "state_class": None,
        "icon": "mdi:update",
    },

    # -------- Workouts --------
    # Text-state sensor: state is the workout type, details live in attributes.
    "last_apple_workout": {
        "device_class": None,
        "native_unit_of_measurement": None,
        "state_class": None,
        "icon": "mdi:run",
    },

    # -------- Activity / Movement --------
    "steps": {
        "native_unit_of_measurement": "steps",
        "state_class": "total_increasing",
        "icon": "mdi:walk",
    },
    "distance": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "total_increasing",
        "icon": "mdi:map-marker-distance",
    },
    "active_calories": {
        "device_class": "energy",
        "native_unit_of_measurement": UnitOfEnergy.KILO_CALORIE,
        "state_class": "total_increasing",
        "icon": "mdi:fire",
    },
    "flights_climbed": {
        "native_unit_of_measurement": "floors",
        "state_class": "total_increasing",
        "icon": "mdi:stairs-up",
    },
    "walking_speed": {
        "device_class": "speed",
        "native_unit_of_measurement": UnitOfSpeed.METERS_PER_SECOND,  # m/s native
        "state_class": "measurement",
        "icon": "mdi:run",
    },
    "walking_step_length": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,  # per step
        "state_class": "measurement",
        "icon": "mdi:ruler",
    },
    "walking_asymmetry_percentage": {
        "native_unit_of_measurement": PERCENTAGE,  # 0..100
        "state_class": "measurement",
        "icon": "mdi:axis-z-rotate-clockwise",
    },
    "walking_double_support_percentage": {
        "native_unit_of_measurement": PERCENTAGE,  # 0..100
        "state_class": "measurement",
        "icon": "mdi:human-handsup",
    },
    "swimming_distance": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "total_increasing",
        "icon": "mdi:swim",
    },
    "cycling_distance": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "total_increasing",
        "icon": "mdi:bike",
    },
    "wrist_temperature": {
        "device_class": "temperature",
        "native_unit_of_measurement": UnitOfTemperature.CELSIUS,
        "state_class": "measurement",
        "icon": "mdi:thermometer",
    },
    "walking_steadiness": {
        "native_unit_of_measurement": PERCENTAGE,  # 0..100
        "state_class": "measurement",
        "icon": "mdi:figure-walk",
    },
    "cardio_recovery": {
        "device_class": "heart_rate",
        "native_unit_of_measurement": "bpm",
        "state_class": "measurement",
        "icon": "mdi:heart-pulse",
    },
    "physical_effort": {
        "native_unit_of_measurement": "MET",
        "state_class": "measurement",
        "icon": "mdi:run-fast",
    },
    "insulin_delivery": {
        "native_unit_of_measurement": "IU",
        "state_class": "total_increasing",
        "icon": "mdi:needle",
    },
    "six_minute_walk_test_distance": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "measurement",
        "icon": "mdi:walk",
    },
    "stair_ascent_speed": {
        "device_class": "speed",
        "native_unit_of_measurement": UnitOfSpeed.METERS_PER_SECOND,
        "state_class": "measurement",
        "icon": "mdi:stairs-up",
    },
    "stair_descent_speed": {
        "device_class": "speed",
        "native_unit_of_measurement": UnitOfSpeed.METERS_PER_SECOND,
        "state_class": "measurement",
        "icon": "mdi:stairs-down",
    },

    # -------- Body Measures --------
    "body_mass": {
        "device_class": "weight",
        "native_unit_of_measurement": UnitOfMass.KILOGRAMS,
        "state_class": "measurement",
        "icon": "mdi:weight-kilogram",
    },
    "height": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "measurement",
        "icon": "mdi:ruler",
    },
    "body_fat_percentage": {
        "native_unit_of_measurement": PERCENTAGE,  # 0..100
        "state_class": "measurement",
        "icon": "mdi:human-handsup",
    },
    "lean_body_mass": {
        "device_class": "weight",
        "native_unit_of_measurement": UnitOfMass.KILOGRAMS,
        "state_class": "measurement",
        "icon": "mdi:dumbbell",
    },
    "waist_circumference": {
        "device_class": "distance",
        "native_unit_of_measurement": UnitOfLength.METERS,
        "state_class": "measurement",
        "icon": "mdi:tape-measure",
    },

    # -------- Vitals --------
    "body_temperature": {
        "device_class": "temperature",
        "native_unit_of_measurement": UnitOfTemperature.CELSIUS,
        "state_class": "measurement",
        "icon": "mdi:thermometer",
    },
    "heart_rate": {
        "device_class": "heart_rate",
        "native_unit_of_measurement": "bpm",
        "state_class": "measurement",
        "icon": "mdi:heart-pulse",
    },
    "resting_heart_rate": {
        "device_class": "heart_rate",
        "native_unit_of_measurement": "bpm",
        "state_class": "measurement",
        "icon": "mdi:heart",
    },
    "walking_heart_rate_average": {
        "device_class": "heart_rate",
        "native_unit_of_measurement": "bpm",
        "state_class": "measurement",
        "icon": "mdi:walk",
    },
    "heart_rate_variability": {
        "native_unit_of_measurement": "ms",
        "state_class": "measurement",
        "icon": "mdi:waves",
    },
    "vo2_max": {
        "native_unit_of_measurement": "mL/kg/min",
        "state_class": "measurement",
        "icon": "mdi:lungs",
    },
    "blood_pressure_systolic": {
        "native_unit_of_measurement": "mmHg",
        "state_class": "measurement",
        "icon": "mdi:heart-pulse",
    },
    "blood_pressure_diastolic": {
        "native_unit_of_measurement": "mmHg",
        "state_class": "measurement",
        "icon": "mdi:heart-pulse",
    },
    "oxygen_saturation": {
        "native_unit_of_measurement": PERCENTAGE,  # 0..100
        "state_class": "measurement",
        "icon": "mdi:lungs",
    },
    "uv_index": {
        "native_unit_of_measurement": None,
        "state_class": "measurement",
        "icon": "mdi:white-balance-sunny",
        "suggested_display_precision": 1,
    },
    "uv_exposure_sed": {
        "native_unit_of_measurement": "SED",
        "state_class": "total",
        "icon": "mdi:sun-wireless",
        "suggested_display_precision": 2,
    },
    "net_calories": {
        "device_class": "energy",
        "native_unit_of_measurement": UnitOfEnergy.KILO_CALORIE,
        "state_class": "measurement",
        "icon": "mdi:scale-balance",
    },

    # -------- Nutrition & Glucose --------
    "dietary_carbohydrates": {
        "device_class": "weight",
        "native_unit_of_measurement": UnitOfMass.GRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:food-apple",
    },
    "dietary_fat": {
        "device_class": "weight",
        "native_unit_of_measurement": UnitOfMass.GRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:food-drumstick",
    },
    "dietary_protein": {
        "device_class": "weight",
        "native_unit_of_measurement": UnitOfMass.GRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:food-steak",
    },
    "dietary_water": {
        "device_class": "volume",  # NEW
        "native_unit_of_measurement": UnitOfVolume.MILLILITERS,
        "state_class": "total_increasing",
        "icon": "mdi:cup-water",
    },
    "blood_glucose": {
        # Native mmol/L (we'll convert mg/dL -> mmol/L in normalizer)
        "native_unit_of_measurement": "mmol/L",
        "state_class": "measurement",
        "icon": "mdi:water-percent",
    },
    "basal_energy_burned": {
        "device_class": "energy",
        "native_unit_of_measurement": UnitOfEnergy.KILO_CALORIE,
        "state_class": "total_increasing",
        "icon": "mdi:fire-alert",
    },

    # -------- Sleep & Breathing --------
    "sleep_duration": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    "sleep_rem_hours": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    "sleep_core_hours": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    "sleep_deep_hours": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    "sleep_awake_hours": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    "sleep_unspecified_hours": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.HOURS,
        "state_class": "measurement",
        "icon": "mdi:sleep",
    },
    # Hypnogram stage code over time (Deep=0 Core=1 REM=2 Awake=3 Unspecified=-1).
    # A unit is REQUIRED: Home Assistant renders a unit-less numeric sensor as a
    # banded state-timeline, not a line graph (frontend#11723). "stage" is a
    # dimensionless label; no device_class so the raw code is stored verbatim.
    "sleep_details": {
        "native_unit_of_measurement": "stage",
        "state_class": "measurement",
        "suggested_display_precision": 0,
        "icon": "mdi:chart-timeline-variant",
    },
    "respiratory_rate": {
        "native_unit_of_measurement": "breaths/min",
        "state_class": "measurement",
        "icon": "mdi:lungs",
    },
    "mindful_minutes": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.SECONDS,
        "state_class": "total_increasing",
        "icon": "mdi:meditation",
    },
    "time_in_daylight": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.SECONDS,
        "state_class": "total_increasing",
        "icon": "mdi:weather-sunny-alert",
    },
    "asleep_time": {
        "device_class": "timestamp",
        "native_unit_of_measurement": None,
        "state_class": None,
        "icon": "mdi:sleep",
    },
    "wake_time": {
        "device_class": "timestamp",
        "native_unit_of_measurement": None,
        "state_class": None,
        "icon": "mdi:weather-sunset-up",
    },

    # -------- Audio Exposure --------
    "headphone_audio_exposure": {
        "device_class": "sound_pressure",
        "native_unit_of_measurement": "dBA",
        "state_class": "measurement",
        "icon": "mdi:headphones",
    },
    "environmental_audio_exposure": {
        "device_class": "sound_pressure",
        "native_unit_of_measurement": "dBA",
        "state_class": "measurement",
        "icon": "mdi:volume-high",
    },

    # -------- Activity (new) --------
    "stand_time": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.MINUTES,
        "state_class": "measurement",
        "icon": "mdi:human-greeting-variant",
    },
    "exercise_time": {
        "device_class": "duration",
        "native_unit_of_measurement": UnitOfTime.MINUTES,
        "state_class": "total_increasing",
        "icon": "mdi:run-fast",
    },

    # -------- Dietary macros (new) --------
    "dietary_energy_consumed": {
        "device_class": "energy",
        "native_unit_of_measurement": UnitOfEnergy.KILO_CALORIE,
        "state_class": "total_increasing",
        "icon": "mdi:food",
    },
    "dietary_fiber": {
        "native_unit_of_measurement": UnitOfMass.GRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:barley",
    },
    "dietary_sugar": {
        "native_unit_of_measurement": UnitOfMass.GRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:cube-outline",
    },
    "dietary_cholesterol": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:heart-outline",
    },

    # -------- Dietary minerals (mg) --------
    "dietary_calcium": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:bone",
    },
    "dietary_chloride": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:water-outline",
    },
    "dietary_iron": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:water",
    },
    "dietary_magnesium": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:water-check",
    },
    "dietary_manganese": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:flask-outline",
    },
    "dietary_phosphorus": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:flask",
    },
    "dietary_potassium": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:fruit-watermelon",
    },
    "dietary_sodium": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:shaker-outline",
    },
    "dietary_zinc": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:water-opacity",
    },
    "dietary_caffeine": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:coffee",
    },
    "dietary_copper": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:molecule",
    },
    "dietary_niacin": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_pantothenic_acid": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_riboflavin": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_thiamin": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_b6": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_c": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_e": {
        "native_unit_of_measurement": UnitOfMass.MILLIGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },

    # -------- Dietary vitamins (µg) --------
    "dietary_biotin": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_chromium": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_folate": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_iodine": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_molybdenum": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_selenium": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_a": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_b12": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },
    "dietary_vitamin_d": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:white-balance-sunny",
    },
    "dietary_vitamin_k": {
        "native_unit_of_measurement": UnitOfMass.MICROGRAMS,
        "state_class": "total_increasing",
        "icon": "mdi:pill",
    },

    # Connectivity / internal
    "test_connection": {
        "native_unit_of_measurement": None,
        "state_class": None,
        "icon": "mdi:check-circle",
    },
}

SUPPORTED_METRICS = tuple(METRIC_ATTRIBUTES_MAP.keys())
