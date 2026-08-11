"""Sensor platform for the ADS-B Station integration."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import asdict, dataclass, field
from datetime import datetime
import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import (
    PERCENTAGE,
    EntityCategory,
    UnitOfDataRate,
    UnitOfInformation,
    UnitOfLength,
    UnitOfSpeed,
    UnitOfTemperature,
    UnitOfTime,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import ExtraStoredData, RestoreEntity
from homeassistant.util import dt as dt_util

from .const import (
    CONF_RECEIVER_FEATURES,
    FEATURE_AIRCRAFT_TYPES,
    FEATURE_FREQUENCY_ERROR,
    FEATURE_GAIN,
    FEATURE_POSITIONS,
    FEEDER_FR24,
    FEEDER_PIAWARE,
    FEEDER_PLANEFINDER,
    PASSAGE_BOARD_LENGTH,
    SECTORS,
)
from .coordinator import (
    AdsbStationConfigEntry,
    AdsbStationDataUpdateCoordinator,
    AircraftStats,
    AircraftSummary,
    Passage,
    ReceiverStats,
    aircraft_attributes,
)
from .entity import (
    AdsbStationAircraftEntity,
    AdsbStationEntity,
    AdsbStationReceptionEntity,
)

_LOGGER = logging.getLogger(__name__)

# Updates are centralized through the coordinator
PARALLEL_UPDATES = 0

UNIT_MESSAGES_PER_SECOND = "msg/s"
# dump1090 measures against the full scale of the dongle, not against a
# reference power, so these are not dBm and carry no device class.
UNIT_DBFS = "dBFS"
UNIT_DECIBEL = "dB"
# Frequency offset of the dongle against its nominal clock.
UNIT_PPM = "ppm"


def _as_float(value: Any) -> float | None:
    """Parse a value that the feeder may report as a string."""
    if value is None or isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        _LOGGER.debug("Could not parse %r as a number", value)
        return None


def _as_int(value: Any) -> int | None:
    """Parse a counter, which monitor.json sometimes quotes as a string."""
    number = _as_float(value)
    return None if number is None else int(number)


def _as_timestamp(value: Any) -> datetime | None:
    """Parse a Unix timestamp; the feeder uses 0 for 'never'."""
    seconds = _as_float(value)
    if not seconds:
        return None
    return dt_util.utc_from_timestamp(seconds)


def _as_text(value: Any) -> str | None:
    """Return a non-empty string, or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _cpu_temperature(monitor: dict[str, Any]) -> float | None:
    """Return the SoC temperature that fr24feed reports for the host."""
    cpu = monitor.get("cpu")
    if not isinstance(cpu, dict):
        return None
    return _as_float(cpu.get("gpu_temp"))


def _reports_cpu_temperature(monitor: dict[str, Any]) -> bool:
    """Return True if this feeder reports on the host at all.

    Only the builds for single board computers read out a temperature. On x86
    there is no SoC to measure and monitor.json carries no cpu block, so the
    sensor would never hold a value. A block that is present but unreadable is
    a different matter: keep the sensor, and let unknown say so.
    """
    return "cpu" in monitor


@dataclass(frozen=True, kw_only=True)
class AdsbStationSensorEntityDescription(SensorEntityDescription):
    """Describes a sensor that reads monitor.json."""

    value_fn: Callable[[dict[str, Any]], Any]
    # What the status document holds differs per build. When set, this decides
    # from the first poll whether the feeder reports the field at all, so a
    # build that never sends it does not get a sensor stuck on unknown.
    supported_fn: Callable[[dict[str, Any]], bool] | None = None
    # Extra detail alongside the value, such as the sentence a status colour
    # stands for.
    attributes_fn: Callable[[dict[str, Any]], dict[str, Any] | None] | None = None


@dataclass(frozen=True, kw_only=True)
class AdsbStationAircraftSensorEntityDescription(SensorEntityDescription):
    """Describes a sensor that reads aircraft.json."""

    value_fn: Callable[[AircraftStats], Any]


@dataclass(frozen=True, kw_only=True)
class AdsbStationReceptionSensorEntityDescription(SensorEntityDescription):
    """Describes a sensor that reads stats.json."""

    value_fn: Callable[[ReceiverStats], Any]
    # Only create this sensor when the receiver was found to report the
    # optional data it needs.
    feature: str | None = None


FR24_SENSORS: tuple[AdsbStationSensorEntityDescription, ...] = (
    AdsbStationSensorEntityDescription(
        key="aircraft_tracked",
        translation_key="aircraft_tracked",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda monitor: _as_int(monitor.get("feed_num_ac_tracked")),
    ),
    AdsbStationSensorEntityDescription(
        key="aircraft_tracked_adsb",
        translation_key="aircraft_tracked_adsb",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda monitor: _as_int(monitor.get("feed_num_ac_adsb_tracked")),
    ),
    AdsbStationSensorEntityDescription(
        key="aircraft_uploaded",
        translation_key="aircraft_uploaded",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda monitor: _as_int(monitor.get("feed_last_ac_sent_num")),
    ),
    AdsbStationSensorEntityDescription(
        key="feed_status",
        translation_key="feed_status",
        value_fn=lambda monitor: _as_text(monitor.get("feed_status")),
    ),
    AdsbStationSensorEntityDescription(
        key="feed_mode",
        translation_key="feed_mode",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda monitor: _as_text(monitor.get("feed_current_mode")),
    ),
    AdsbStationSensorEntityDescription(
        key="feed_alias",
        translation_key="feed_alias",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda monitor: _as_text(monitor.get("feed_alias")),
    ),
    AdsbStationSensorEntityDescription(
        key="map_size",
        translation_key="map_size",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda monitor: _as_int(monitor.get("d11_map_size")),
    ),
    AdsbStationSensorEntityDescription(
        key="resets",
        translation_key="resets",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda monitor: _as_int(monitor.get("num_resets")),
    ),
    AdsbStationSensorEntityDescription(
        key="last_connected",
        translation_key="last_connected",
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda monitor: _as_timestamp(monitor.get("feed_last_connected_time")),
    ),
    AdsbStationSensorEntityDescription(
        key="cpu_temperature",
        translation_key="cpu_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=_cpu_temperature,
        supported_fn=_reports_cpu_temperature,
    ),
    AdsbStationSensorEntityDescription(
        key="clock_drift",
        translation_key="clock_drift",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=3,
        value_fn=lambda monitor: _as_float(monitor.get("timing_last_drift")),
        supported_fn=lambda monitor: "timing_last_drift" in monitor,
    ),
    AdsbStationSensorEntityDescription(
        key="timing_source",
        translation_key="timing_source",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda monitor: _as_text(monitor.get("timing_source")),
        supported_fn=lambda monitor: "timing_source" in monitor,
    ),
    AdsbStationSensorEntityDescription(
        key="feed_server",
        translation_key="feed_server",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda monitor: _as_text(monitor.get("feed_current_server")),
        supported_fn=lambda monitor: "feed_current_server" in monitor,
    ),
    AdsbStationSensorEntityDescription(
        key="resyncs",
        translation_key="resyncs",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda monitor: _as_int(monitor.get("num_resyncs")),
        supported_fn=lambda monitor: "num_resyncs" in monitor,
    ),
)


# The colours PiAware uses. An enum sensor rejects anything else outright, so
# a status we do not know has to become unknown rather than an error.
PIAWARE_STATUSES = ("green", "amber", "red")


def _section(payload: dict[str, Any], name: str, key: str) -> Any:
    """Return one field of a PiAware status section."""
    section = payload.get(name)
    return section.get(key) if isinstance(section, dict) else None


def _known_status(payload: dict[str, Any], name: str) -> str | None:
    """Return the colour of a status section, if it is one we know."""
    status = _as_text(_section(payload, name, "status"))
    if status is None:
        return None
    status = status.lower()
    return status if status in PIAWARE_STATUSES else None


def _section_message(name: str) -> Callable[[dict[str, Any]], dict[str, Any] | None]:
    """Return a reader for the sentence behind a PiAware status colour."""

    def read(payload: dict[str, Any]) -> dict[str, Any] | None:
        message = _as_text(_section(payload, name, "message"))
        return None if message is None else {"message": message}

    return read


def _piaware_status(
    key: str, name: str, *, diagnostic: bool = False
) -> AdsbStationSensorEntityDescription:
    """Describe one of PiAware's four status sections.

    They are green, amber or red rather than up or down, and amber carries
    real information: PiAware reporting an unstable clock is still running,
    but multilateration will not work. A binary sensor would throw that away,
    so these stay three-valued with the sentence as an attribute.
    """
    return AdsbStationSensorEntityDescription(
        key=key,
        translation_key=key,
        device_class=SensorDeviceClass.ENUM,
        options=list(PIAWARE_STATUSES),
        entity_category=EntityCategory.DIAGNOSTIC if diagnostic else None,
        value_fn=lambda payload: _known_status(payload, name),
        supported_fn=lambda payload: name in payload,
        attributes_fn=_section_message(name),
    )


PIAWARE_SENSORS: tuple[AdsbStationSensorEntityDescription, ...] = (
    _piaware_status("piaware_radio", "radio"),
    _piaware_status("piaware_feed", "adept"),
    _piaware_status("piaware_mlat", "mlat"),
    _piaware_status("piaware_service", "piaware", diagnostic=True),
    AdsbStationSensorEntityDescription(
        key="piaware_cpu_load",
        translation_key="piaware_cpu_load",
        native_unit_of_measurement=PERCENTAGE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda payload: _as_int(payload.get("cpu_load_percent")),
        supported_fn=lambda payload: "cpu_load_percent" in payload,
    ),
    AdsbStationSensorEntityDescription(
        key="piaware_uptime",
        translation_key="piaware_uptime",
        native_unit_of_measurement=UnitOfTime.SECONDS,
        suggested_unit_of_measurement=UnitOfTime.HOURS,
        device_class=SensorDeviceClass.DURATION,
        entity_category=EntityCategory.DIAGNOSTIC,
        suggested_display_precision=1,
        value_fn=lambda payload: _as_float(payload.get("system_uptime")),
        supported_fn=lambda payload: "system_uptime" in payload,
    ),
    AdsbStationSensorEntityDescription(
        key="piaware_cpu_temperature",
        translation_key="piaware_cpu_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda payload: _as_float(payload.get("cpu_temp_celcius")),
        # A host with nothing to read reports a flat 0.0 rather than leaving
        # the field out, which would otherwise be a sensor stuck at freezing.
        supported_fn=lambda payload: bool(_as_float(payload.get("cpu_temp_celcius"))),
    ),
)


PLANEFINDER_SENSORS: tuple[AdsbStationSensorEntityDescription, ...] = (
    AdsbStationSensorEntityDescription(
        key="pf_message_rate",
        translation_key="pf_message_rate",
        native_unit_of_measurement=UNIT_MESSAGES_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda payload: _as_int(payload.get("total_modes_packets_ps")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_messages",
        translation_key="pf_messages",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda payload: _as_int(payload.get("total_modes_packets")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_modeac_messages",
        translation_key="pf_modeac_messages",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda payload: _as_int(payload.get("total_modeac_packets")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_crc_errors",
        translation_key="pf_crc_errors",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        value_fn=lambda payload: _as_int(payload.get("total_modes_crc_bad")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_uploaded",
        translation_key="pf_uploaded",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.MEGABYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=1,
        value_fn=lambda payload: _as_int(payload.get("master_server_bytes_out")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_mlat_uploaded",
        translation_key="pf_mlat_uploaded",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        suggested_unit_of_measurement=UnitOfInformation.KILOBYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=1,
        value_fn=lambda payload: _as_int(payload.get("mlat_bytes_out")),
    ),
    AdsbStationSensorEntityDescription(
        key="pf_receiver_rate",
        translation_key="pf_receiver_rate",
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda payload: _as_int(payload.get("receiver_bytes_in_ps")),
    ),
)


FEEDER_SENSORS: dict[str, tuple[AdsbStationSensorEntityDescription, ...]] = {
    FEEDER_FR24: FR24_SENSORS,
    FEEDER_PIAWARE: PIAWARE_SENSORS,
    FEEDER_PLANEFINDER: PLANEFINDER_SENSORS,
}


AIRCRAFT_SENSORS: tuple[AdsbStationAircraftSensorEntityDescription, ...] = (
    AdsbStationAircraftSensorEntityDescription(
        key="aircraft_received",
        translation_key="aircraft_received",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.total,
    ),
    AdsbStationAircraftSensorEntityDescription(
        key="aircraft_with_position",
        translation_key="aircraft_with_position",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.with_position,
    ),
    AdsbStationAircraftSensorEntityDescription(
        key="messages",
        translation_key="messages",
        state_class=SensorStateClass.TOTAL_INCREASING,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda stats: stats.messages,
    ),
    AdsbStationAircraftSensorEntityDescription(
        key="message_rate",
        translation_key="message_rate",
        native_unit_of_measurement=UNIT_MESSAGES_PER_SECOND,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.message_rate,
    ),
    AdsbStationAircraftSensorEntityDescription(
        key="receiver_updated",
        translation_key="receiver_updated",
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda stats: stats.updated,
    ),
)

RECEPTION_SENSORS: tuple[AdsbStationReceptionSensorEntityDescription, ...] = (
    AdsbStationReceptionSensorEntityDescription(
        key="signal",
        translation_key="signal",
        native_unit_of_measurement=UNIT_DBFS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.signal,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="noise",
        translation_key="noise",
        native_unit_of_measurement=UNIT_DBFS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.noise,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="signal_to_noise",
        translation_key="signal_to_noise",
        native_unit_of_measurement=UNIT_DECIBEL,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.signal_to_noise,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="peak_signal",
        translation_key="peak_signal",
        native_unit_of_measurement=UNIT_DBFS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.peak_signal,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="strong_signals",
        translation_key="strong_signals",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.strong_signals,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="samples_dropped",
        translation_key="samples_dropped",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.samples_dropped,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="messages_accepted",
        translation_key="messages_accepted",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.accepted,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="tracks",
        translation_key="tracks",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.tracks,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="single_message_tracks",
        translation_key="single_message_tracks",
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.single_message_tracks,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="gain",
        translation_key="gain",
        feature=FEATURE_GAIN,
        native_unit_of_measurement=UNIT_DECIBEL,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.gain,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="error_rate",
        translation_key="error_rate",
        native_unit_of_measurement=PERCENTAGE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.error_rate,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="aircraft_adsb",
        translation_key="aircraft_adsb",
        feature=FEATURE_AIRCRAFT_TYPES,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.aircraft_by_type.get("adsb"),
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="aircraft_mlat",
        translation_key="aircraft_mlat",
        feature=FEATURE_AIRCRAFT_TYPES,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.aircraft_by_type.get("mlat"),
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="aircraft_mode_s",
        translation_key="aircraft_mode_s",
        feature=FEATURE_AIRCRAFT_TYPES,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.aircraft_by_type.get("mode_s"),
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="frequency_error",
        translation_key="frequency_error",
        feature=FEATURE_FREQUENCY_ERROR,
        native_unit_of_measurement=UNIT_PPM,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.frequency_error,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="positions_decoded",
        translation_key="positions_decoded",
        feature=FEATURE_POSITIONS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.positions_decoded,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="positions_rejected",
        translation_key="positions_rejected",
        feature=FEATURE_POSITIONS,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda stats: stats.positions_rejected,
    ),
    AdsbStationReceptionSensorEntityDescription(
        key="demodulator_load",
        translation_key="demodulator_load",
        native_unit_of_measurement=PERCENTAGE,
        entity_category=EntityCategory.DIAGNOSTIC,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda stats: stats.demodulator_load,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AdsbStationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator = entry.runtime_data

    entities: list[SensorEntity] = []
    if coordinator.client.has_feeder:
        payload = coordinator.data.feeder or {}
        entities.extend(
            AdsbStationSensor(coordinator, description)
            for description in FEEDER_SENSORS.get(coordinator.feeder_type or "", ())
            if description.supported_fn is None or description.supported_fn(payload)
        )
    if coordinator.client.aircraft_url:
        entities.extend(
            AdsbStationAircraftSensor(coordinator, description)
            for description in AIRCRAFT_SENSORS
        )
        entities.append(AdsbStationClosestAircraftSensor(coordinator))
        entities.append(AdsbStationMaxRangeSensor(coordinator))
        entities.append(AdsbStationHighestAircraftSensor(coordinator))
        entities.append(AdsbStationFastestAircraftSensor(coordinator))
        entities.append(AdsbStationNearbySensor(coordinator))
        entities.append(AdsbStationOverheadSensor(coordinator))
        entities.append(AdsbStationPassagesSensor(coordinator))
        entities.extend(
            AdsbStationSectorRangeSensor(coordinator, sector) for sector in SECTORS
        )
    if coordinator.client.stats_url:
        features = set(entry.data.get(CONF_RECEIVER_FEATURES) or ())
        entities.extend(
            AdsbStationReceptionSensor(coordinator, description)
            for description in RECEPTION_SENSORS
            if description.feature is None or description.feature in features
        )

    async_add_entities(entities)


class AdsbStationSensor(AdsbStationEntity, SensorEntity):
    """Sensor backed by monitor.json."""

    entity_description: AdsbStationSensorEntityDescription

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        description: AdsbStationSensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        """Return the sensor value."""
        return self.entity_description.value_fn(self.feeder)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return whatever detail this sensor carries alongside its value."""
        if (read := self.entity_description.attributes_fn) is None:
            return None
        return read(self.feeder)


class AdsbStationAircraftSensor(AdsbStationAircraftEntity, SensorEntity):
    """Sensor backed by aircraft.json."""

    entity_description: AdsbStationAircraftSensorEntityDescription

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        description: AdsbStationAircraftSensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        """Return the sensor value."""
        if (aircraft := self.aircraft) is None:
            return None
        return self.entity_description.value_fn(aircraft)


class AdsbStationReceptionSensor(AdsbStationReceptionEntity, SensorEntity):
    """Sensor backed by stats.json."""

    entity_description: AdsbStationReceptionSensorEntityDescription

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        description: AdsbStationReceptionSensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        """Return the sensor value."""
        if (reception := self.reception) is None:
            return None
        return self.entity_description.value_fn(reception)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return which measurement window the value came from."""
        if (reception := self.reception) is None:
            return None
        return {"period": reception.period}


class AdsbStationClosestAircraftSensor(AdsbStationAircraftEntity, SensorEntity):
    """Distance to the nearest aircraft, with its details as attributes."""

    _attr_translation_key = "closest_aircraft"
    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.METERS
    _attr_suggested_unit_of_measurement = UnitOfLength.KILOMETERS
    _attr_suggested_display_precision = 1
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "closest_aircraft")

    @property
    def native_value(self) -> float | None:
        """Return the distance to the nearest aircraft."""
        if (aircraft := self.aircraft) is None or aircraft.closest is None:
            return None
        return aircraft.closest.distance

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return who is flying there."""
        if (aircraft := self.aircraft) is None or (closest := aircraft.closest) is None:
            return None
        return aircraft_attributes(closest)


@dataclass
class RememberedAircraft(ExtraStoredData):
    """The last aircraft one of these sensors had something to say about."""

    value: float | None = None
    seen_at: str | None = None
    details: dict[str, Any] | None = None

    def as_dict(self) -> dict[str, Any]:
        """Return the reading as the registry stores it."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RememberedAircraft:
        """Rebuild a reading that was restored from the registry."""
        details = data.get("details")
        return cls(
            value=_as_float(data.get("value")),
            seen_at=_as_text(data.get("seen_at")),
            details=details if isinstance(details, dict) else None,
        )


class AdsbStationRememberedAircraftSensor(
    AdsbStationAircraftEntity, RestoreEntity, SensorEntity
):
    """A superlative that keeps standing once the aircraft has gone.

    A station that hears two aircraft an hour would otherwise spend most of
    its time reporting nothing, and the reading would vanish over a restart
    as well. What it last saw is more use than a blank, as long as you can
    tell how long ago that was, which the seen_at attribute says.
    """

    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        key: str,
        select: Callable[[AircraftStats], AircraftSummary | None],
        read: Callable[[AircraftSummary], float | None],
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, key)
        self._attr_translation_key = key
        self._select = select
        self._read = read
        self._remembered = RememberedAircraft()

    async def async_added_to_hass(self) -> None:
        """Restore what this sensor last saw."""
        await super().async_added_to_hass()
        if (stored := await self.async_get_last_extra_data()) is not None:
            self._remembered = RememberedAircraft.from_dict(stored.as_dict())
        self._absorb()

    @property
    def extra_restore_state_data(self) -> RememberedAircraft:
        """Return the reading for Home Assistant to store."""
        return self._remembered

    @property
    def available(self) -> bool:
        """Return True even with an empty sky, so the reading stays readable."""
        return self.coordinator.last_update_success

    def _handle_coordinator_update(self) -> None:
        """Take over this poll's aircraft, if there was one."""
        self._absorb()
        super()._handle_coordinator_update()

    def _absorb(self) -> None:
        """Remember the current pick, leaving the old one if there is none."""
        aircraft = self.aircraft
        if aircraft is None:
            return
        summary = self._select(aircraft)
        if summary is None or (value := self._read(summary)) is None:
            return
        self._remembered = RememberedAircraft(
            value=value,
            seen_at=dt_util.utcnow().isoformat(),
            details=aircraft_attributes(summary, include_distance=True),
        )

    @property
    def native_value(self) -> float | None:
        """Return the reading, which outlives the aircraft that set it."""
        return self._remembered.value

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return who set it and when."""
        return {"seen_at": self._remembered.seen_at, **(self._remembered.details or {})}


class AdsbStationHighestAircraftSensor(AdsbStationRememberedAircraftSensor):
    """Altitude of the highest aircraft heard."""

    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.FEET
    # Suggesting feet explicitly keeps aviation altitudes in feet on a metric
    # system, where the device class would otherwise convert them to metres.
    # The device class is what lets anyone who does want metres pick them per
    # entity, so this sets the default without taking the choice away.
    _attr_suggested_unit_of_measurement = UnitOfLength.FEET
    _attr_suggested_display_precision = 0

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(
            coordinator,
            "highest_aircraft",
            lambda aircraft: aircraft.highest,
            lambda summary: summary.altitude,
        )


class AdsbStationMaxRangeSensor(AdsbStationRememberedAircraftSensor):
    """Distance to the furthest aircraft heard."""

    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.METERS
    _attr_suggested_unit_of_measurement = UnitOfLength.KILOMETERS
    _attr_suggested_display_precision = 1

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(
            coordinator,
            "max_range",
            lambda aircraft: aircraft.furthest,
            lambda summary: summary.distance,
        )


class AdsbStationFastestAircraftSensor(AdsbStationRememberedAircraftSensor):
    """Ground speed of the fastest aircraft heard."""

    _attr_device_class = SensorDeviceClass.SPEED
    _attr_native_unit_of_measurement = UnitOfSpeed.KNOTS
    # Knots by default, for the same reason as the altitude above.
    _attr_suggested_unit_of_measurement = UnitOfSpeed.KNOTS
    _attr_suggested_display_precision = 0

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(
            coordinator,
            "fastest_aircraft",
            lambda aircraft: aircraft.fastest,
            lambda summary: summary.speed,
        )


class AdsbStationNearbySensor(AdsbStationAircraftEntity, SensorEntity):
    """How many aircraft are inside the configured radius."""

    _attr_translation_key = "aircraft_nearby"
    _attr_state_class = SensorStateClass.MEASUREMENT
    # The list of aircraft is rewritten on every poll, so recording it would
    # write the whole sky to the database every few seconds for a figure the
    # state already carries. The count keeps its history; the list does not.
    _unrecorded_attributes = frozenset({"aircraft"})


    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "aircraft_nearby")

    @property
    def native_value(self) -> int | None:
        """Return the number of aircraft nearby."""
        if (aircraft := self.aircraft) is None:
            return None
        return len(aircraft.nearby)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return which aircraft those are, nearest first."""
        if (aircraft := self.aircraft) is None:
            return None
        return {
            "radius": self.coordinator.proximity_radius / 1000,
            "aircraft": [
                aircraft_attributes(summary, include_distance=True)
                for summary in aircraft.nearby
            ],
        }


def _passage_entry(passage: Passage) -> dict[str, Any]:
    """Describe one passage for a board of what has come over.

    The closest approach rather than the arrival, and lean rather than
    complete: twenty of these are written to the database every time an
    aircraft comes past, and a board is read at a glance.
    """
    entry: dict[str, Any] = {
        "at": passage.started_at.isoformat(),
        "hex": passage.hex,
        "flight": passage.closest.flight,
        "altitude": passage.closest.altitude,
        "distance": round(passage.closest_distance / 1000, 1),
    }
    for key, value in (
        ("airline", passage.closest.airline),
        ("registration", passage.closest.registration),
        ("aircraft_type", passage.closest.aircraft_type),
        ("description", passage.closest.description),
        (
            "route",
            None if passage.closest.route is None else passage.closest.route.label,
        ),
    ):
        if value is not None:
            entry[key] = value
    return entry


@dataclass
class RememberedPassage(ExtraStoredData):
    """The aircraft a panel is showing, so a restart does not blank it."""

    flight: str | None = None
    seen_at: str | None = None
    details: dict[str, Any] | None = None

    def as_dict(self) -> dict[str, Any]:
        """Return the reading as the registry stores it."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RememberedPassage:
        """Rebuild a reading that was restored from the registry."""
        details = data.get("details")
        return cls(
            flight=_as_text(data.get("flight")),
            seen_at=_as_text(data.get("seen_at")),
            details=details if isinstance(details, dict) else None,
        )


class AdsbStationOverheadSensor(
    AdsbStationAircraftEntity, RestoreEntity, SensorEntity
):
    """The one aircraft above you, which is what a panel shows.

    Nearest first, measured through the air rather than across the ground, and
    it keeps the last one rather than blanking the moment the sky empties. A
    panel that goes empty between aircraft is a panel nobody hangs on a wall,
    and the seen_at attribute says how long ago it was.
    """

    _attr_translation_key = "overhead_flight"

    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "overhead_flight")
        self._remembered = RememberedPassage()

    async def async_added_to_hass(self) -> None:
        """Restore the aircraft this was showing."""
        await super().async_added_to_hass()
        if (stored := await self.async_get_last_extra_data()) is not None:
            self._remembered = RememberedPassage.from_dict(stored.as_dict())
        self._absorb()

    @property
    def extra_restore_state_data(self) -> RememberedPassage:
        """Return the reading for Home Assistant to store."""
        return self._remembered

    @property
    def available(self) -> bool:
        """Return True with an empty sky, so the panel stays readable."""
        return self.coordinator.last_update_success

    def _handle_coordinator_update(self) -> None:
        """Take over whatever is overhead now, if anything is."""
        self._absorb()
        super()._handle_coordinator_update()

    def _absorb(self) -> None:
        """Show what is up there, leaving the last one if nothing is."""
        if (passage := self.coordinator.overhead) is None:
            return
        self._remembered = RememberedPassage(
            # An aircraft that broadcasts no callsign is still something
            # overhead, and its hex code is the only name it has.
            flight=passage.current.flight or passage.hex,
            seen_at=dt_util.utcnow().isoformat(),
            details={
                **aircraft_attributes(passage.current, include_distance=True),
                "slant_distance": round(passage.current_distance / 1000, 1),
                "since": passage.started_at.isoformat(),
            },
        )

    @property
    def native_value(self) -> str | None:
        """Return the callsign of the aircraft the panel is showing."""
        return self._remembered.flight

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return everything a panel puts under the callsign."""
        details = self._remembered.details
        if details is None:
            return None
        return {
            **details,
            "seen_at": self._remembered.seen_at,
            # Whether it is up there now or is the one that last was.
            "overhead": self.coordinator.overhead is not None,
        }


@dataclass
class PassageBoard(ExtraStoredData):
    """What has come over, and how many did today."""

    count: int = 0
    day: str | None = None
    passages: list[dict[str, Any]] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        """Return the board as the registry stores it."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> PassageBoard:
        """Rebuild a board that was restored from the registry."""
        passages = data.get("passages")
        return cls(
            count=_as_int(data.get("count")) or 0,
            day=_as_text(data.get("day")),
            passages=[entry for entry in passages if isinstance(entry, dict)]
            if isinstance(passages, list)
            else [],
        )


class AdsbStationPassagesSensor(
    AdsbStationAircraftEntity, RestoreEntity, SensorEntity
):
    """How many aircraft came over today, and which ones.

    A departure board rather than a counter: the state is the tally, and the
    attributes are the aircraft themselves, most recent first. Both survive a
    restart, because a board that empties every time Home Assistant is updated
    is not a record of anything.
    """

    _attr_translation_key = "passages_today"
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    # The board is rewritten on every arrival and while an aircraft is still in
    # view, so recording it would store twenty aircraft again for every change
    # to the tally. Excluding the whole entity from the recorder instead costs
    # the history and the statistics of the tally itself, which is the part
    # worth keeping. The board survives a restart through the restore state,
    # which is not the recorder.
    _unrecorded_attributes = frozenset({"passages"})


    def __init__(self, coordinator: AdsbStationDataUpdateCoordinator) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, "passages_today")
        self._board = PassageBoard()

    async def async_added_to_hass(self) -> None:
        """Restore the board."""
        await super().async_added_to_hass()
        if (stored := await self.async_get_last_extra_data()) is not None:
            self._board = PassageBoard.from_dict(stored.as_dict())
        self._absorb()

    @property
    def extra_restore_state_data(self) -> PassageBoard:
        """Return the board for Home Assistant to store."""
        return self._board

    @property
    def available(self) -> bool:
        """Return True on a quiet day, when the tally is a real zero."""
        return self.coordinator.last_update_success

    def _handle_coordinator_update(self) -> None:
        """Take in whatever came over since the last poll."""
        self._absorb()
        super()._handle_coordinator_update()

    def _absorb(self) -> None:
        """Add what is passing, and refresh what is still passing.

        An entry is written as soon as the aircraft arrives, so the board is
        current, and rewritten while it is still in view, because the closest
        approach is not known until it has been made.
        """
        today = dt_util.now().date().isoformat()
        if self._board.day != today:
            self._board = PassageBoard(day=today)

        for passage in self.coordinator.passages.values():
            entry = _passage_entry(passage)
            for index, existing in enumerate(self._board.passages):
                if existing["hex"] == entry["hex"] and existing["at"] == entry["at"]:
                    self._board.passages[index] = entry
                    break
            else:
                self._board.count += 1
                self._board.passages.insert(0, entry)
        del self._board.passages[PASSAGE_BOARD_LENGTH:]

    @property
    def native_value(self) -> int:
        """Return how many aircraft have come over today."""
        return self._board.count

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the board itself, most recent first."""
        return {"passages": self._board.passages}


@dataclass
class SectorRecord(ExtraStoredData):
    """The furthest aircraft ever seen in one sector.

    Kept on the entity rather than in the coordinator, because it has to
    outlive a restart and the entity is what Home Assistant restores.
    """

    distance: float | None = None
    recorded_at: str | None = None
    flight: str | None = None
    hex: str | None = None

    def as_dict(self) -> dict[str, Any]:
        """Return the record as the registry stores it."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SectorRecord:
        """Rebuild a record that was restored from the registry."""
        return cls(
            distance=_as_float(data.get("distance")),
            recorded_at=_as_text(data.get("recorded_at")),
            flight=_as_text(data.get("flight")),
            hex=_as_text(data.get("hex")),
        )


class AdsbStationSectorRangeSensor(
    AdsbStationAircraftEntity, RestoreEntity, SensorEntity
):
    """The furthest an aircraft has ever been heard in one compass sector.

    Eight of these together are the polar plot that tells you where your
    antenna is blocked. The record only ever grows, so it survives a restart
    and is cleared by the reset button.
    """

    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.METERS
    _attr_suggested_unit_of_measurement = UnitOfLength.KILOMETERS
    _attr_suggested_display_precision = 1

    def __init__(
        self, coordinator: AdsbStationDataUpdateCoordinator, sector: str
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, f"max_range_{sector}")
        self._sector = sector
        self._attr_translation_key = f"max_range_{sector}"
        self._record = SectorRecord()

    async def async_added_to_hass(self) -> None:
        """Restore the record this sector already held."""
        await super().async_added_to_hass()
        if (stored := await self.async_get_last_extra_data()) is not None:
            self._record = SectorRecord.from_dict(stored.as_dict())
        self.coordinator.sector_sensors.append(self)
        # The first poll already happened before this entity existed.
        self._absorb()

    async def async_will_remove_from_hass(self) -> None:
        """Stop the reset button from reaching a sensor that is going away."""
        self.coordinator.sector_sensors.remove(self)
        await super().async_will_remove_from_hass()

    @property
    def extra_restore_state_data(self) -> SectorRecord:
        """Return the record for Home Assistant to store."""
        return self._record

    @property
    def available(self) -> bool:
        """Return True even with no aircraft, so a record stays readable.

        A sector that has held a record for months should not go unavailable
        just because nothing is flying there right now.
        """
        return self.coordinator.last_update_success

    def _handle_coordinator_update(self) -> None:
        """Take over a new record before the state and attributes are read.

        Doing this from native_value would make a property that changes what
        it reports, and would leave the attributes describing the record the
        state had a moment ago.
        """
        self._absorb()
        super()._handle_coordinator_update()

    @property
    def native_value(self) -> float | None:
        """Return the furthest distance recorded in this sector."""
        return self._record.distance

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return when the record was set and who set it."""
        return {
            "recorded_at": self._record.recorded_at,
            "flight": self._record.flight,
            "hex": self._record.hex,
        }

    def _absorb(self) -> None:
        """Take over this poll's furthest aircraft if it beats the record."""
        aircraft = self.aircraft
        if aircraft is None:
            return
        seen = aircraft.by_sector.get(self._sector)
        if seen is None or seen.distance is None:
            return
        if self._record.distance is not None and seen.distance <= self._record.distance:
            return
        self._record = SectorRecord(
            distance=seen.distance,
            recorded_at=dt_util.utcnow().isoformat(),
            flight=seen.flight,
            hex=seen.hex,
        )

    def reset(self) -> None:
        """Forget the record, for when the antenna moved."""
        self._record = SectorRecord()
        self.async_write_ha_state()
