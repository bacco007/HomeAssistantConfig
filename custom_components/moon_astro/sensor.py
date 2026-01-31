"""Sensor entities for Moon Astro.

This module defines SensorEntity instances backed by the integration coordinator.
Each sensor reads a single computed value from the coordinator data dictionary.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import logging
import math
from typing import Any

from homeassistant.components.sensor import (
    RestoreSensor,
    SensorDeviceClass,
    SensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    KEY_AZIMUTH,
    KEY_DISTANCE,
    KEY_ECLIPTIC_LATITUDE_GEOCENTRIC,
    KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON,
    KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON,
    KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON,
    KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON,
    KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC,
    KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC,
    KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON,
    KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON,
    KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON,
    KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON,
    KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC,
    KEY_ELEVATION,
    KEY_ILLUMINATION,
    KEY_NEXT_APOGEE,
    KEY_NEXT_FIRST_QUARTER,
    KEY_NEXT_FULL_MOON,
    KEY_NEXT_FULL_MOON_ALT_NAMES,
    KEY_NEXT_FULL_MOON_NAME,
    KEY_NEXT_LAST_QUARTER,
    KEY_NEXT_NEW_MOON,
    KEY_NEXT_PERIGEE,
    KEY_NEXT_RISE,
    KEY_NEXT_SET,
    KEY_PARALLAX,
    KEY_PHASE,
    KEY_PREVIOUS_APOGEE,
    KEY_PREVIOUS_FIRST_QUARTER,
    KEY_PREVIOUS_FULL_MOON,
    KEY_PREVIOUS_FULL_MOON_ALT_NAMES,
    KEY_PREVIOUS_FULL_MOON_NAME,
    KEY_PREVIOUS_LAST_QUARTER,
    KEY_PREVIOUS_NEW_MOON,
    KEY_PREVIOUS_PERIGEE,
    KEY_PREVIOUS_RISE,
    KEY_PREVIOUS_SET,
    KEY_ZODIAC_DEGREE_CURRENT_MOON,
    KEY_ZODIAC_DEGREE_NEXT_FULL_MOON,
    KEY_ZODIAC_DEGREE_NEXT_NEW_MOON,
    KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON,
    KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON,
    KEY_ZODIAC_SIGN_CURRENT_MOON,
    KEY_ZODIAC_SIGN_NEXT_FULL_MOON,
    KEY_ZODIAC_SIGN_NEXT_NEW_MOON,
    KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON,
    KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON,
    PRECISION_AZIMUTH,
    PRECISION_DISTANCE,
    PRECISION_ECL_GEO,
    PRECISION_ECL_TOPO,
    PRECISION_ELEVATION,
    PRECISION_ILLUMINATION,
    PRECISION_PARALLAX,
    PRECISION_ZODIAC_DEGREE,
)
from .coordinator import MoonAstroCoordinator, MoonAstroEventsCoordinator
from .utils import get_entry_coordinators, get_entry_device_info

_LOGGER = logging.getLogger(__name__)
_UNSET: Any = object()


def _debug_value(value: Any) -> str:
    """Return a compact debug representation for logs.

    Args:
        value: Any Python value.

    Returns:
        A compact string representation suitable for debug logs.
    """
    if value is None:
        return "None"
    if isinstance(value, datetime):
        return f"datetime({value.isoformat()})"
    if isinstance(value, float):
        if math.isnan(value):
            return "float(nan)"
        return f"float({value})"
    return f"{type(value).__name__}({value!r})"


@dataclass(frozen=True)
class SensorDescription:
    """Describe a sensor entity created by the integration.

    Args:
        key: Coordinator dictionary key.
        slug: Stable non-localized slug used for entity_id suggestion and translation.
        is_event_based: True when the value changes only on event boundaries.
        unit: Unit of measurement if applicable.
        device_class: Sensor device class if applicable.
        suggested_display_precision: Suggested display precision for UI rendering.
    """

    key: str
    slug: str
    is_event_based: bool
    unit: str | None
    device_class: SensorDeviceClass | None
    suggested_display_precision: int | None


SENSORS: list[SensorDescription] = [
    SensorDescription(
        key=KEY_PHASE,
        slug="phase",
        is_event_based=False,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_AZIMUTH,
        slug="azimuth",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_AZIMUTH,
    ),
    SensorDescription(
        key=KEY_ELEVATION,
        slug="elevation",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ELEVATION,
    ),
    SensorDescription(
        key=KEY_ILLUMINATION,
        slug="illumination",
        is_event_based=False,
        unit="%",
        device_class=None,
        suggested_display_precision=PRECISION_ILLUMINATION,
    ),
    SensorDescription(
        key=KEY_DISTANCE,
        slug="distance",
        is_event_based=False,
        unit="km",
        device_class=None,
        suggested_display_precision=PRECISION_DISTANCE,
    ),
    SensorDescription(
        key=KEY_PARALLAX,
        slug="parallax",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_PARALLAX,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC,
        slug="ecliptic_longitude_topocentric",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_TOPO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC,
        slug="ecliptic_latitude_topocentric",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_TOPO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC,
        slug="ecliptic_longitude_geocentric",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_GEOCENTRIC,
        slug="ecliptic_latitude_geocentric",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_NEXT_RISE,
        slug="next_rise",
        is_event_based=False,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_SET,
        slug="next_set",
        is_event_based=False,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_APOGEE,
        slug="next_apogee",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_PERIGEE,
        slug="next_perigee",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_FIRST_QUARTER,
        slug="next_first_quarter",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_FULL_MOON,
        slug="next_full_moon",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_LAST_QUARTER,
        slug="next_last_quarter",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_NEW_MOON,
        slug="next_new_moon",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_RISE,
        slug="previous_rise",
        is_event_based=False,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_SET,
        slug="previous_set",
        is_event_based=False,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_APOGEE,
        slug="previous_apogee",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_PERIGEE,
        slug="previous_perigee",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_FIRST_QUARTER,
        slug="previous_first_quarter",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_FULL_MOON,
        slug="previous_full_moon",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_LAST_QUARTER,
        slug="previous_last_quarter",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_NEW_MOON,
        slug="previous_new_moon",
        is_event_based=True,
        unit=None,
        device_class=SensorDeviceClass.TIMESTAMP,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_FULL_MOON_NAME,
        slug="previous_full_moon_name",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_PREVIOUS_FULL_MOON_ALT_NAMES,
        slug="previous_full_moon_alt_names",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_FULL_MOON_NAME,
        slug="next_full_moon_name",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_NEXT_FULL_MOON_ALT_NAMES,
        slug="next_full_moon_alt_names",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON,
        slug="ecliptic_longitude_next_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON,
        slug="ecliptic_latitude_next_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON,
        slug="ecliptic_longitude_next_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON,
        slug="ecliptic_latitude_next_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON,
        slug="ecliptic_longitude_previous_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON,
        slug="ecliptic_latitude_previous_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON,
        slug="ecliptic_longitude_previous_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON,
        slug="ecliptic_latitude_previous_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ECL_GEO,
    ),
    SensorDescription(
        key=KEY_ZODIAC_SIGN_CURRENT_MOON,
        slug="zodiac_sign_current_moon",
        is_event_based=False,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ZODIAC_SIGN_NEXT_FULL_MOON,
        slug="zodiac_sign_next_full_moon",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ZODIAC_SIGN_NEXT_NEW_MOON,
        slug="zodiac_sign_next_new_moon",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON,
        slug="zodiac_sign_previous_full_moon",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON,
        slug="zodiac_sign_previous_new_moon",
        is_event_based=True,
        unit=None,
        device_class=None,
        suggested_display_precision=None,
    ),
    SensorDescription(
        key=KEY_ZODIAC_DEGREE_CURRENT_MOON,
        slug="zodiac_degree_current_moon",
        is_event_based=False,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ZODIAC_DEGREE,
    ),
    SensorDescription(
        key=KEY_ZODIAC_DEGREE_NEXT_FULL_MOON,
        slug="zodiac_degree_next_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ZODIAC_DEGREE,
    ),
    SensorDescription(
        key=KEY_ZODIAC_DEGREE_NEXT_NEW_MOON,
        slug="zodiac_degree_next_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ZODIAC_DEGREE,
    ),
    SensorDescription(
        key=KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON,
        slug="zodiac_degree_previous_new_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ZODIAC_DEGREE,
    ),
    SensorDescription(
        key=KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON,
        slug="zodiac_degree_previous_full_moon",
        is_event_based=True,
        unit="°",
        device_class=None,
        suggested_display_precision=PRECISION_ZODIAC_DEGREE,
    ),
]


def _validate_sensors() -> None:
    """Validate sensor descriptions for basic consistency.

    Returns:
        None.
    """
    seen_keys: set[str] = set()
    seen_slugs: set[str] = set()

    for desc in SENSORS:
        if not desc.key or not isinstance(desc.key, str):
            _LOGGER.debug("Invalid sensor key: %r", desc.key)
            continue
        if not desc.slug or not isinstance(desc.slug, str):
            _LOGGER.debug("Invalid sensor slug for key=%s: %r", desc.key, desc.slug)
            continue

        if desc.key in seen_keys:
            _LOGGER.debug("Duplicate sensor key: %s", desc.key)
        else:
            seen_keys.add(desc.key)

        if desc.slug in seen_slugs:
            _LOGGER.debug("Duplicate sensor slug: %s", desc.slug)
        else:
            seen_slugs.add(desc.slug)


def _parse_timestamp_to_utc(value: Any) -> datetime | None:
    """Parse an ISO timestamp into a timezone-aware UTC datetime.

    Args:
        value: Raw value returned by the coordinator (expected ISO string or datetime).

    Returns:
        A timezone-aware datetime in UTC, or None if parsing fails.
    """
    if value is None:
        return None

    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value))
        except (ValueError, TypeError):
            return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def _values_equal(old: Any, new: Any, *, tol: float | None = None) -> bool:
    """Return True if old and new values should be considered equal for state writing.

    This function supports:
    - exact comparisons for non-numeric types
    - tolerant comparisons for floats when a tolerance is provided

    Args:
        old: Previous value as stored by the entity.
        new: New computed value.
        tol: Absolute tolerance used for float comparisons. If None, floats are compared
            using strict equality.

    Returns:
        True if values are equivalent, False otherwise.
    """
    if old is None and new is None:
        return True
    if old is None or new is None:
        return False

    if tol is not None and isinstance(old, float) and isinstance(new, float):
        # NaN should never be treated as equal to anything to avoid masking issues.
        if math.isnan(old) or math.isnan(new):
            return False
        return abs(old - new) <= tol

    return old == new


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up sensor entities from a config entry.

    Args:
        hass: Home Assistant instance.
        entry: Config entry for the integration.
        async_add_entities: Callback to add entities.

    Returns:
        None.
    """
    coordinator, events_coordinator = get_entry_coordinators(hass, entry)
    if coordinator is None:
        return

    device_info = get_entry_device_info(entry)

    _validate_sensors()
    entities: list[MoonAstroSensor] = []
    for desc in SENSORS:
        selected = coordinator
        if events_coordinator is not None and desc.is_event_based:
            selected = events_coordinator

        entities.append(
            MoonAstroSensor(
                coordinator=selected,
                entry_id=entry.entry_id,
                key=desc.key,
                name_key=desc.slug,
                unit=desc.unit,
                device_class=desc.device_class,
                suggested_display_precision=desc.suggested_display_precision,
                device_info=device_info,
                suggested_object_id=desc.slug,
            )
        )

    async_add_entities(entities, update_before_add=False)


class MoonAstroSensor(
    CoordinatorEntity[MoonAstroCoordinator | MoonAstroEventsCoordinator],
    RestoreSensor,
    SensorEntity,
):
    """Generic sensor bound to a coordinator value.

    This entity avoids unnecessary state writes by only writing when the computed value
    changes compared to the last written value.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: MoonAstroCoordinator | MoonAstroEventsCoordinator,
        entry_id: str,
        key: str,
        name_key: str,
        unit: str | None,
        device_class: SensorDeviceClass | None,
        suggested_display_precision: int | None,
        device_info: DeviceInfo,
        suggested_object_id: str,
    ) -> None:
        """Initialize the sensor.

        Args:
            coordinator: Integration data coordinator.
            entry_id: Config entry identifier.
            key: Coordinator dictionary key.
            name_key: Translation key used by the frontend.
            unit: Unit of measurement if applicable.
            device_class: Sensor device class if applicable.
            suggested_display_precision: Suggested display precision for UI rendering.
            device_info: Home Assistant device information.
            suggested_object_id: Stable suggested entity_id suffix.

        Returns:
            None.
        """
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"moon_astro_{entry_id}_{key}"
        self._attr_translation_key = name_key
        self._attr_native_unit_of_measurement = unit
        self._attr_device_class = device_class
        self._attr_device_info = device_info
        self._attr_suggested_display_precision = suggested_display_precision
        self._attr_suggested_object_id = suggested_object_id

        self._last_written_native_value: Any = _UNSET
        self._is_event_based: bool = isinstance(coordinator, MoonAstroEventsCoordinator)
        self._has_written_state: bool = False

    @property
    def translation_key(self) -> str | None:
        """Expose explicit translation_key so frontend can translate state values.

        Returns:
            The translation key for this entity, or None.
        """
        return self._attr_translation_key

    def _float_write_tolerance(self) -> float | None:
        """Return the absolute tolerance used to decide whether to write a new float state.

        The goal is to avoid recorder/history spam caused by tiny numeric jitter while
        keeping full precision in the coordinator for downstream computations.

        Strategy:
        - If a suggested display precision is known, use half of the last displayed unit.

        Example:
            - precision=2 -> tol=0.005
            - precision=0 -> tol=0.5
        - If no precision is configured, do not apply a tolerance.

        Returns:
            Absolute tolerance for float comparisons, or None when no tolerance applies.
        """
        prec = self._attr_suggested_display_precision
        if prec is None:
            return None

        try:
            p = int(prec)
        except (TypeError, ValueError):
            return None

        # half of the unit step at the displayed precision
        # p=2 => 10^-2 / 2 => 0.005
        return 0.5 * (10.0 ** (-p))

    def _compute_native_value(self) -> Any:
        """Compute the current native value without triggering a state write.

        For event-based sensors, this method preserves the last written value when the
        coordinator has no data yet (startup/reload) or when the expected key is missing.
        This prevents overwriting a valid restored state with an unknown value.

        Returns:
            The computed native value, already normalized for the entity device class.
        """
        data = self.coordinator.data
        if data is None:
            fallback = (
                None
                if not self._is_event_based
                else (
                    None
                    if self._last_written_native_value is _UNSET
                    else self._last_written_native_value
                )
            )
            _LOGGER.debug(
                "Sensor compute: key=%s event_based=%s coordinator=%s data=None fallback=%s",
                self._key,
                self._is_event_based,
                type(self.coordinator).__name__,
                _debug_value(fallback),
            )
            return fallback

        if self._key not in data and self._is_event_based:
            fallback = (
                None
                if self._last_written_native_value is _UNSET
                else self._last_written_native_value
            )
            _LOGGER.debug(
                "Sensor compute: key=%s event_based=%s coordinator=%s key_missing fallback=%s data_keys_count=%s",
                self._key,
                self._is_event_based,
                type(self.coordinator).__name__,
                _debug_value(fallback),
                len(data),
            )
            return fallback

        value = data.get(self._key)

        if value is None and self._is_event_based:
            fallback = (
                None
                if self._last_written_native_value is _UNSET
                else self._last_written_native_value
            )
            _LOGGER.debug(
                "Sensor compute: key=%s event_based=%s coordinator=%s value=None fallback=%s",
                self._key,
                self._is_event_based,
                type(self.coordinator).__name__,
                _debug_value(fallback),
            )
            return fallback

        if self.device_class == SensorDeviceClass.TIMESTAMP:
            parsed = _parse_timestamp_to_utc(value)
            if parsed is None and self._is_event_based:
                fallback = (
                    None
                    if self._last_written_native_value is _UNSET
                    else self._last_written_native_value
                )
                _LOGGER.debug(
                    "Sensor compute: key=%s event_based=%s coordinator=%s timestamp_parse_failed raw=%s fallback=%s",
                    self._key,
                    self._is_event_based,
                    type(self.coordinator).__name__,
                    _debug_value(value),
                    _debug_value(fallback),
                )
                return fallback

            _LOGGER.debug(
                "Sensor compute: key=%s event_based=%s coordinator=%s timestamp_ok raw=%s parsed=%s",
                self._key,
                self._is_event_based,
                type(self.coordinator).__name__,
                _debug_value(value),
                _debug_value(parsed),
            )
            return parsed

        _LOGGER.debug(
            "Sensor compute: key=%s event_based=%s coordinator=%s value=%s",
            self._key,
            self._is_event_based,
            type(self.coordinator).__name__,
            _debug_value(value),
        )
        return value

    @property
    def native_value(self) -> Any:
        """Return the current state of the sensor.

        Returns:
            The current sensor value in its native type.
        """
        return self._compute_native_value()

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return extra attributes for the entity.

        Returns:
            A dict of extra attributes, or None when no extra attributes are exposed.
        """
        if not self._is_event_based:
            return None

        return {"next_update": self._next_update_attr()}

    def _next_update_attr(self) -> datetime | None:
        """Return the next scheduled update time for event-based sensors.

        Returns:
            A timezone-aware UTC datetime, or None if not available or not event-based.
        """
        if not self._is_event_based:
            return None

        coordinator = self.coordinator
        if isinstance(coordinator, MoonAstroEventsCoordinator):
            return coordinator.next_refresh_utc

        return None

    def _compute_native_value_from_state(self, state: str) -> Any:
        """Convert a restored state string into the entity native type.

        Args:
            state: Stored state string from the recorder.

        Returns:
            A native value matching the entity device_class, or None if conversion fails.
        """
        if self.device_class == SensorDeviceClass.TIMESTAMP:
            return _parse_timestamp_to_utc(state)

        # Try to restore numeric values as floats when it is safe to do so.
        try:
            return float(state)
        except (TypeError, ValueError):
            return state

    async def async_added_to_hass(self) -> None:
        """Handle entity which will be added to Home Assistant.

        Event-based sensors restore their last known value on startup so they do not
        temporarily show unknown while waiting for the first coordinator refresh.

        Returns:
            None.
        """
        await super().async_added_to_hass()

        if not self._is_event_based:
            _LOGGER.debug(
                "Sensor added: key=%s event_based=%s coordinator=%s (no restore path)",
                self._key,
                self._is_event_based,
                type(self.coordinator).__name__,
            )
            return

        last_state = await self.async_get_last_state()
        if last_state is None:
            _LOGGER.debug(
                "Sensor restore: key=%s coordinator=%s last_state=None",
                self._key,
                type(self.coordinator).__name__,
            )
            return

        restored = self._compute_native_value_from_state(last_state.state)
        if restored is None:
            _LOGGER.debug(
                "Sensor restore: key=%s coordinator=%s raw_state=%r restored=None",
                self._key,
                type(self.coordinator).__name__,
                last_state.state,
            )
            return

        self._last_written_native_value = restored
        self._has_written_state = True

        _LOGGER.debug(
            "Sensor restore: key=%s coordinator=%s raw_state=%r restored=%s (writing state)",
            self._key,
            type(self.coordinator).__name__,
            last_state.state,
            _debug_value(restored),
        )

        # Ensure the restored state is published immediately to avoid a startup race
        # where Home Assistant reads native_value before restoration completes.
        self.async_write_ha_state()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator.

        This method avoids updating the entity state if the computed value is unchanged,
        using a tolerant comparison for floats based on the entity display precision.
        """
        new_value = self._compute_native_value()

        if new_value is None and self._has_written_state:
            _LOGGER.debug(
                "Sensor update: key=%s coordinator=%s new=None preserved_last=%s",
                self._key,
                type(self.coordinator).__name__,
                _debug_value(self._last_written_native_value),
            )
            return

        _LOGGER.debug(
            "Sensor update: key=%s coordinator=%s old=%s new=%s",
            self._key,
            type(self.coordinator).__name__,
            _debug_value(self._last_written_native_value)
            if self._last_written_native_value is not _UNSET
            else "sentinel",
            _debug_value(new_value),
        )

        tol: float | None = None
        if isinstance(new_value, float) and isinstance(
            self._last_written_native_value, float
        ):
            tol = self._float_write_tolerance()
            _LOGGER.debug(
                "Sensor update: key=%s float_tolerance=%s",
                self._key,
                tol,
            )

        if _values_equal(self._last_written_native_value, new_value, tol=tol):
            return

        self._last_written_native_value = new_value
        self._has_written_state = new_value is not None
        self.async_write_ha_state()

    def _icon_for_phase(self) -> str | None:
        """Return an icon for the phase sensor, based on the current phase code.

        Returns:
            An MDI icon string if the entity is the phase sensor, otherwise None.
        """
        if self._key != KEY_PHASE:
            return None

        data = self.coordinator.data or {}
        phase = (data.get(KEY_PHASE) or "unknown") or "unknown"

        return {
            "new_moon": "mdi:moon-new",
            "full_moon": "mdi:moon-full",
            "first_quarter": "mdi:moon-first-quarter",
            "last_quarter": "mdi:moon-last-quarter",
            "waning_crescent": "mdi:moon-waning-crescent",
            "waning_gibbous": "mdi:moon-waning-gibbous",
            "waxing_crescent": "mdi:moon-waxing-crescent",
            "waxing_gibbous": "mdi:moon-waxing-gibbous",
        }.get(str(phase))

    def _icon_for_specific_keys(self) -> str | None:
        """Return an icon for keys with a fixed, well-defined icon.

        Returns:
            An MDI icon string if the key matches, otherwise None.
        """
        if self._key in (KEY_NEXT_NEW_MOON, KEY_PREVIOUS_NEW_MOON):
            return "mdi:moon-new"

        if self._key in (KEY_NEXT_FULL_MOON, KEY_PREVIOUS_FULL_MOON):
            return "mdi:moon-full"

        if self._key in (
            KEY_ELEVATION,
            KEY_ZODIAC_DEGREE_CURRENT_MOON,
            KEY_ZODIAC_DEGREE_NEXT_FULL_MOON,
            KEY_ZODIAC_DEGREE_NEXT_NEW_MOON,
            KEY_ZODIAC_DEGREE_PREVIOUS_FULL_MOON,
            KEY_ZODIAC_DEGREE_PREVIOUS_NEW_MOON,
        ):
            return "mdi:angle-acute"

        if self._key == KEY_AZIMUTH:
            return "mdi:angle-obtuse"

        if self._key in (
            KEY_NEXT_FULL_MOON_NAME,
            KEY_NEXT_FULL_MOON_ALT_NAMES,
            KEY_PREVIOUS_FULL_MOON_NAME,
            KEY_PREVIOUS_FULL_MOON_ALT_NAMES,
        ):
            return "mdi:calendar-badge"

        if self._key in (KEY_NEXT_FIRST_QUARTER, KEY_PREVIOUS_FIRST_QUARTER):
            return "mdi:moon-first-quarter"

        if self._key in (KEY_NEXT_LAST_QUARTER, KEY_PREVIOUS_LAST_QUARTER):
            return "mdi:moon-last-quarter"

        if self._key == KEY_ILLUMINATION:
            return "mdi:weather-night"

        if self._key == KEY_DISTANCE:
            return "mdi:ruler"

        if self._key == KEY_PARALLAX:
            return "mdi:circle-multiple"

        if self._key in (KEY_NEXT_RISE, KEY_PREVIOUS_RISE):
            return "mdi:arrow-up-circle"

        if self._key in (KEY_NEXT_SET, KEY_PREVIOUS_SET):
            return "mdi:arrow-down-circle"

        if self._key in (
            KEY_NEXT_APOGEE,
            KEY_NEXT_PERIGEE,
            KEY_PREVIOUS_APOGEE,
            KEY_PREVIOUS_PERIGEE,
        ):
            return "mdi:orbit"

        return None

    def _icon_for_ecliptic_coords(self) -> str | None:
        """Return an icon for ecliptic longitude/latitude sensors.

        Returns:
            An MDI icon string if the key matches, otherwise None.
        """
        if self._key in (
            KEY_ECLIPTIC_LONGITUDE_TOPOCENTRIC,
            KEY_ECLIPTIC_LONGITUDE_GEOCENTRIC,
            KEY_ECLIPTIC_LONGITUDE_NEXT_FULL_MOON,
            KEY_ECLIPTIC_LONGITUDE_NEXT_NEW_MOON,
            KEY_ECLIPTIC_LONGITUDE_PREVIOUS_FULL_MOON,
            KEY_ECLIPTIC_LONGITUDE_PREVIOUS_NEW_MOON,
        ):
            return "mdi:longitude"

        if self._key in (
            KEY_ECLIPTIC_LATITUDE_TOPOCENTRIC,
            KEY_ECLIPTIC_LATITUDE_GEOCENTRIC,
            KEY_ECLIPTIC_LATITUDE_NEXT_FULL_MOON,
            KEY_ECLIPTIC_LATITUDE_NEXT_NEW_MOON,
            KEY_ECLIPTIC_LATITUDE_PREVIOUS_FULL_MOON,
            KEY_ECLIPTIC_LATITUDE_PREVIOUS_NEW_MOON,
        ):
            return "mdi:latitude"

        return None

    def _icon_for_zodiac_sign(self) -> str | None:
        """Return an icon for zodiac sign sensors, based on the current sign value.

        Returns:
            An MDI icon string if the entity is a zodiac sign sensor, otherwise None.
        """
        if self._key not in (
            KEY_ZODIAC_SIGN_CURRENT_MOON,
            KEY_ZODIAC_SIGN_NEXT_FULL_MOON,
            KEY_ZODIAC_SIGN_NEXT_NEW_MOON,
            KEY_ZODIAC_SIGN_PREVIOUS_FULL_MOON,
            KEY_ZODIAC_SIGN_PREVIOUS_NEW_MOON,
        ):
            return None

        raw = self.native_value
        sign = str(raw).strip().lower() if raw is not None else ""

        zodiac_icons: dict[str, str] = {
            "aries": "mdi:zodiac-aries",
            "taurus": "mdi:zodiac-taurus",
            "gemini": "mdi:zodiac-gemini",
            "cancer": "mdi:zodiac-cancer",
            "leo": "mdi:zodiac-leo",
            "virgo": "mdi:zodiac-virgo",
            "libra": "mdi:zodiac-libra",
            "scorpio": "mdi:zodiac-scorpio",
            "sagittarius": "mdi:zodiac-sagittarius",
            "capricorn": "mdi:zodiac-capricorn",
            "aquarius": "mdi:zodiac-aquarius",
            "pisces": "mdi:zodiac-pisces",
        }

        return zodiac_icons.get(sign)

    @property
    def icon(self) -> str | None:
        """Return an MDI icon by sensor type.

        Returns:
            An MDI icon string, or None when no icon is defined.
        """
        return (
            self._icon_for_phase()
            or self._icon_for_specific_keys()
            or self._icon_for_ecliptic_coords()
            or self._icon_for_zodiac_sign()
        )
