"""Shared base-data sensors for the SolsticeHub integration.

These three sensors describe the underlying astronomical reality that is
common to every calendar system, so they are added to all calendar device
types (Four Seasons, Cross-Quarter, Chinese Solar Terms):

- solar_longitude: Ecliptic longitude of the Sun (diagnostic, disabled by default)
- daylight_trend: Whether days are getting longer or shorter
- next_daylight_trend_change: Timestamp of the next solstice

The descriptions are built via a factory so each calendar module can attach
them using its own entity-description dataclass.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import DEGREE, EntityCategory

from .const import (
    ICON_NEXT_TREND_CHANGE,
    ICON_SOLAR_LONGITUDE,
    SENSOR_DAYLIGHT_TREND,
    SENSOR_NEXT_TREND_CHANGE,
    SENSOR_SOLAR_LONGITUDE,
    TREND_ICONS,
)


def get_daylight_trend_icon(data: Any) -> str:
    """Get the icon for the daylight trend based on the current state."""
    return TREND_ICONS.get(data["daylight_trend"], "mdi:arrow-left-right")


def make_base_sensor_descriptions(
    description_cls: type[SensorEntityDescription],
) -> tuple[SensorEntityDescription, ...]:
    """Build the shared base-data sensor descriptions.

    Args:
        description_cls: The calendar's entity-description dataclass. It must
            accept ``value_fn``, ``extra_state_attributes_fn`` and ``icon_fn``
            keyword arguments (all calendar device types share this shape).

    Returns:
        Tuple of the three base-data sensor descriptions.
    """
    return (
        description_cls(
            key=SENSOR_SOLAR_LONGITUDE,
            translation_key=SENSOR_SOLAR_LONGITUDE,
            native_unit_of_measurement=DEGREE,
            state_class=SensorStateClass.MEASUREMENT,
            entity_category=EntityCategory.DIAGNOSTIC,
            entity_registry_enabled_default=False,
            icon=ICON_SOLAR_LONGITUDE,
            value_fn=lambda data: data["solar_longitude"],
        ),
        description_cls(
            key=SENSOR_DAYLIGHT_TREND,
            translation_key=SENSOR_DAYLIGHT_TREND,
            device_class=SensorDeviceClass.ENUM,
            options=["days_getting_longer", "days_getting_shorter", "solstice_today"],
            value_fn=lambda data: data["daylight_trend"],
            icon_fn=get_daylight_trend_icon,
        ),
        description_cls(
            key=SENSOR_NEXT_TREND_CHANGE,
            translation_key=SENSOR_NEXT_TREND_CHANGE,
            device_class=SensorDeviceClass.TIMESTAMP,
            icon=ICON_NEXT_TREND_CHANGE,
            value_fn=lambda data: data["next_trend_change"],
            extra_state_attributes_fn=lambda data: {
                "days_until": data["days_until_trend_change"],
                "event_type": data["next_trend_event_type"],
            },
        ),
    )
