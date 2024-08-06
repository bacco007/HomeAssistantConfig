"""Constants for the Moon Phase integration."""

from enum import Enum

from homeassistant.components.sensor import SensorDeviceClass, SensorStateClass
from homeassistant.const import PERCENTAGE, EntityCategory, UnitOfLength, UnitOfTime

DOMAIN = "lunar_phase"

DEFAULT_SCAN_INTERVAL = 60

CONF_CITY = "city"

# Moon phase constants
PHASE_FIRST_QUARTER = "first_quarter"
PHASE_FULL_MOON = "full_moon"
PHASE_LAST_QUARTER = "last_quarter"
PHASE_NEW_MOON = "new_moon"
PHASE_WANING_CRESCENT = "waning_crescent"
PHASE_WANING_GIBBOUS = "waning_gibbous"
PHASE_WAXING_CRESCENT = "waxing_crescent"
PHASE_WAXING_GIBBOUS = "waxing_gibbous"

# State attribute constants
STATE_ATTR_AGE = "moon_age"
STATE_ATTR_DISTANCE_KM = "moon_distance_km"
STATE_ATTR_ILLUMINATION_FRACTION = "illumination_fraction"
STATE_ATTR_NEXT_RISE = "moonrise"
STATE_ATTR_NEXT_HIGH = "moon_high"
STATE_ATTR_NEXT_SET = "moonset"
STATE_ATTR_NEXT_FULL = "next_full_moon"
STATE_ATTR_NEXT_NEW = "next_new_moon"
STATE_ATTR_NEXT_THIRD = "next_third_quarter"
STATE_ATTR_NEXT_FIRST = "next_first_quarter"
STATE_ATTR_ALTITUDE = "moon_altitude_deg"
STATE_ATTR_AZIMUTH = "moon_azimuth_deg"
STATE_ATTR_PARALLACTIC_ANGLE = "moon_parallactic_angle_deg"
STATE_ATTR_NEXT_PHASE = "next_phase"

EXTRA_ATTR_AZIMUTH = "moon_azimuth_radians"
EXTRA_ATTR_ALTITUDE = "moon_altitude_radians"
EXTRA_ATTR_PARALLACTIC_ANGLE = "moon_parallactic_angle"
EXTRA_ATTR_NEXT_PHASE = "next_phase_date"


class BaseConfigFields(Enum):
    """Base configuration fields."""

    # "internal_name": [
    #     0: Display_name,
    #     1: state_key,
    #     2: icon,
    #     3: device_class - default None,
    #     4: state_class - default None,
    #     5: unit_of_measurement - default None,
    #     6: [list of extended attributes],
    #     7: suggested_display_precision - default None, int
    #     8: entity_category - default None, str
    # ]

    DISPLAY_NAME = 0
    STATE_KEY = 1
    ICON = 2
    DEVICE_CLASS = 3
    STATE_CLASS = 4
    UNIT_OF_MEASUREMENT = 5
    EXTENDED_ATTRIBUTES = 6
    SUGGESTED_DISPLAY_PRECISION = 7
    ENTITY_CATEGORY = 8


BASE_LUNAR_SENSORS = {
    STATE_ATTR_AGE: [
        "Moon Age",
        STATE_ATTR_AGE,
        "mdi:progress-clock",
        None,
        SensorStateClass.MEASUREMENT,
        UnitOfTime.DAYS,
        [],
        2,
        None,
    ],
    STATE_ATTR_DISTANCE_KM: [
        "Moon Distance",
        STATE_ATTR_DISTANCE_KM,
        None,
        SensorDeviceClass.DISTANCE,
        SensorStateClass.MEASUREMENT,
        UnitOfLength.KILOMETERS,
        [],
        2,
        None,
    ],
    STATE_ATTR_ILLUMINATION_FRACTION: [
        "Moon Illumination Fraction",
        STATE_ATTR_ILLUMINATION_FRACTION,
        "mdi:theme-light-dark",
        None,
        SensorStateClass.MEASUREMENT,
        PERCENTAGE,
        [],
        2,
        None,
    ],
    STATE_ATTR_NEXT_FULL: [
        "Next Full Moon",
        STATE_ATTR_NEXT_FULL,
        "mdi:moon-full",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_NEW: [
        "Next New Moon",
        STATE_ATTR_NEXT_NEW,
        "mdi:moon-new",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_THIRD: [
        "Next Third Quarter",
        STATE_ATTR_NEXT_THIRD,
        "mdi:moon-last-quarter",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_FIRST: [
        "Next First Quarter",
        STATE_ATTR_NEXT_FIRST,
        "mdi:moon-first-quarter",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_RISE: [
        "Moon Rise",
        STATE_ATTR_NEXT_RISE,
        "mdi:weather-moonset-up",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_SET: [
        "Moon Set",
        STATE_ATTR_NEXT_SET,
        "mdi:weather-moonset-down",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_NEXT_HIGH: [
        "Moon High",
        STATE_ATTR_NEXT_HIGH,
        "mdi:weather-night",
        SensorDeviceClass.TIMESTAMP,
        None,
        None,
        [],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
    STATE_ATTR_ALTITUDE: [
        "Moon Altitude",
        STATE_ATTR_ALTITUDE,
        "mdi:angle-acute",
        None,
        SensorStateClass.MEASUREMENT,
        "°",
        [EXTRA_ATTR_ALTITUDE],
        2,
        None,
    ],
    STATE_ATTR_AZIMUTH: [
        "Moon Azimuth",
        STATE_ATTR_AZIMUTH,
        "mdi:compass",
        None,
        SensorStateClass.MEASUREMENT,
        "°",
        [EXTRA_ATTR_AZIMUTH],
        2,
        None,
    ],
    STATE_ATTR_PARALLACTIC_ANGLE: [
        "Moon Parallactic Angle",
        STATE_ATTR_PARALLACTIC_ANGLE,
        "mdi:angle-acute",
        None,
        SensorStateClass.MEASUREMENT,
        "°",
        [EXTRA_ATTR_PARALLACTIC_ANGLE],
        2,
        None,
    ],
    STATE_ATTR_NEXT_PHASE: [
        "Next Moon Phase",
        STATE_ATTR_NEXT_PHASE,
        "mdi:calendar-star",
        SensorDeviceClass.ENUM,
        None,
        None,
        [EXTRA_ATTR_NEXT_PHASE],
        None,
        EntityCategory.DIAGNOSTIC,
    ],
}
