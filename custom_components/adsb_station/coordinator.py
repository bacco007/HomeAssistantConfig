"""Data update coordinator for the ADS-B Station integration."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta
import logging
from math import atan2, cos, degrees, radians, sin
from typing import Any, Protocol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util
from homeassistant.util.location import distance

from .api import AdsbStationClient, AdsbStationError, read_gain
from .const import (
    AIRCRAFT_TYPE_GROUPS,
    CONF_PROXIMITY_RADIUS,
    CONF_ROUTE_SOURCE,
    DEFAULT_PROXIMITY_RADIUS,
    DEFAULT_ROUTE_SOURCE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    EMERGENCY_SQUAWKS,
    SECTORS,
    UNSET_RECEIVER_VERSION,
)
from .route import FlightPosition, FlightRoute, build_route_lookup

_LOGGER = logging.getLogger(__name__)


class SectorRangeRecord(Protocol):
    """A sector range sensor, as far as the reset button needs to know."""

    def reset(self) -> None:
        """Forget the record this sector holds."""


type AdsbStationConfigEntry = ConfigEntry[AdsbStationDataUpdateCoordinator]

# dump1090 keeps several windows in stats.json. The one-minute window follows
# the receiver closely; the longer ones cover the first seconds after a restart,
# when the shorter window has not measured a signal yet.
STATS_PERIODS = ("last1min", "last5min", "total")


@dataclass(frozen=True, kw_only=True)
class AircraftSummary:
    """One aircraft out of a single poll, as we expose it.

    The distance is optional: altitude and speed reach us from aircraft that
    never broadcast a position, and those still count for the highest and the
    fastest in range.
    """

    hex: str
    flight: str | None
    distance: float | None
    altitude: float | None
    speed: float | None
    track: float | None
    rssi: float | None
    seen: float | None
    registration: str | None
    aircraft_type: str | None
    description: str | None
    military: bool
    # Where it was heard, which no entity shows but a route lookup needs to
    # tell one flight number from the same one halfway around the world.
    position: tuple[float, float] | None = None
    # Filled in after the poll, and only for the aircraft near enough to
    # matter, when a route source is configured.
    route: FlightRoute | None = None


@dataclass(frozen=True, kw_only=True)
class EmergencyAircraft:
    """An aircraft squawking one of the emergency codes."""

    hex: str
    flight: str | None
    squawk: str | None
    reason: str


@dataclass(frozen=True, kw_only=True)
class AircraftStats:
    """Figures derived from a single aircraft.json poll."""

    total: int
    with_position: int
    messages: int | None
    message_rate: float | None
    max_range: float | None
    updated: datetime | None
    closest: AircraftSummary | None
    furthest: AircraftSummary | None = None
    highest: AircraftSummary | None = None
    fastest: AircraftSummary | None = None
    # Everything inside the configured radius, nearest first.
    nearby: tuple[AircraftSummary, ...] = ()
    # The furthest aircraft seen in each compass sector this poll. The
    # all-time record lives on the entities, which survive a restart.
    by_sector: dict[str, AircraftSummary] = field(default_factory=dict)
    emergencies: tuple[EmergencyAircraft, ...] = ()


@dataclass(frozen=True, kw_only=True)
class ReceiverStats:
    """Figures derived from a single stats.json poll."""

    period: str
    signal: float | None
    noise: float | None
    signal_to_noise: float | None
    peak_signal: float | None
    strong_signals: int | None
    samples_dropped: int | None
    accepted: int | None
    tracks: int | None
    single_message_tracks: int | None
    demodulator_load: float | None
    gain: float | None
    # Share of Mode S messages the decoder had to throw away, in percent.
    error_rate: float | None = None
    # How the decoder came to know about the aircraft it is tracking.
    aircraft_by_type: dict[str, int] = field(default_factory=dict)
    # Frequency offset of the dongle, in parts per million.
    frequency_error: float | None = None
    positions_decoded: int | None = None
    positions_rejected: int | None = None


@dataclass(frozen=True, kw_only=True)
class AdsbStationData:
    """The data of one poll cycle."""

    # The feeder's own status document, whichever feeder that is. None when
    # the station only runs a decoder and uploads nowhere we can read.
    feeder: dict[str, Any] | None = field(default=None)
    aircraft: AircraftStats | None
    stats: ReceiverStats | None = field(default=None)


def _as_float(value: Any) -> float | None:
    """Parse a value that should be a number."""
    if value is None or isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_int(value: Any) -> int | None:
    """Parse a value that should be a whole number."""
    number = _as_float(value)
    return None if number is None else int(number)


def _as_text(value: Any) -> str | None:
    """Return a non-empty, trimmed string, or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _position(entry: dict[str, Any]) -> tuple[float, float] | None:
    """Return the position of an aircraft, if it reported one."""
    latitude = _as_float(entry.get("lat"))
    longitude = _as_float(entry.get("lon"))
    if latitude is None or longitude is None:
        return None
    return latitude, longitude


def _altitude(entry: dict[str, Any]) -> float | None:
    """Return the barometric altitude in feet.

    The fr24feed fork of dump1090 calls this field 'altitude' and reports the
    string 'ground' for aircraft on the ground; dump1090-fa and readsb call it
    'alt_baro'.
    """
    for key in ("alt_baro", "altitude"):
        if key in entry:
            return _as_float(entry[key])
    return None


def _ground_speed(entry: dict[str, Any]) -> float | None:
    """Return the ground speed in knots, under either of its two names."""
    for key in ("gs", "speed"):
        if key in entry:
            return _as_float(entry[key])
    return None


def _is_military(entry: dict[str, Any]) -> bool:
    """Return True if readsb flags this aircraft as military.

    dbFlags is a bitfield; bit 0 is the military flag. Decoders without an
    aircraft database omit the field entirely.
    """
    flags = _as_int(entry.get("dbFlags"))
    return flags is not None and bool(flags & 1)


def _bearing(
    latitude: float, longitude: float, other_latitude: float, other_longitude: float
) -> float:
    """Return the initial great circle bearing between two points, in degrees."""
    phi1, phi2 = radians(latitude), radians(other_latitude)
    delta = radians(other_longitude - longitude)
    y = sin(delta) * cos(phi2)
    x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(delta)
    return (degrees(atan2(y, x)) + 360) % 360


def sector_of(bearing: float) -> str:
    """Return which compass sector a bearing falls in.

    Each sector is centred on its direction rather than starting at it, so
    north covers the 45 degrees around 0 and not the 45 degrees after it.
    """
    return SECTORS[int(((bearing + 22.5) % 360) // 45)]


def _summarise(
    entry: dict[str, Any],
    metres: float | None,
    position: tuple[float, float] | None = None,
) -> AircraftSummary:
    """Turn one aircraft.json entry into the shape we expose."""
    return AircraftSummary(
        hex=str(entry.get("hex", "")),
        flight=_as_text(entry.get("flight")),
        distance=metres,
        position=position,
        altitude=_altitude(entry),
        speed=_ground_speed(entry),
        track=_as_float(entry.get("track")),
        rssi=_as_float(entry.get("rssi")),
        seen=_as_float(entry.get("seen")),
        # Only a decoder with an aircraft database fills these in.
        registration=_as_text(entry.get("r")),
        aircraft_type=_as_text(entry.get("t")),
        description=_as_text(entry.get("desc")),
        military=_is_military(entry),
    )


def _emergency_reason(entry: dict[str, Any]) -> str | None:
    """Return why an aircraft counts as an emergency, or None."""
    # dump1090-fa states it outright; every decoder gives us the squawk.
    reported = _as_text(entry.get("emergency"))
    if reported is not None and reported.lower() not in ("none", "no"):
        return reported.lower()
    return EMERGENCY_SQUAWKS.get(str(entry.get("squawk", "")).strip())


class AdsbStationDataUpdateCoordinator(DataUpdateCoordinator[AdsbStationData]):
    """Polls monitor.json and, when configured, aircraft.json and stats.json."""

    config_entry: AdsbStationConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: AdsbStationConfigEntry,
        client: AdsbStationClient,
    ) -> None:
        """Initialize the coordinator."""
        scan_interval = config_entry.options.get(
            CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
        )
        super().__init__(
            hass,
            _LOGGER,
            config_entry=config_entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan_interval),
        )
        self.client = client
        self.receiver_version: str | None = None
        # None unless the user picked a source to look routes up with, which
        # is the only thing here that talks to anything off your own network.
        self.route_lookup = build_route_lookup(
            async_get_clientsession(hass),
            config_entry.options.get(CONF_ROUTE_SOURCE, DEFAULT_ROUTE_SOURCE),
        )
        # Filled in by the sector sensors as they are added, so the reset
        # button can reach them without going through the entity platform.
        self.sector_sensors: list[SectorRangeRecord] = []
        self._previous_messages: tuple[int, float] | None = None
        self._aircraft_failed = False
        self._stats_failed = False
        self._antenna: tuple[float, float] | None = None
        self._antenna_checked = False

    @property
    def feeder_type(self) -> str | None:
        """Return which feeder this entry reads, if any."""
        return self.client.feeder_type

    @property
    def origin(self) -> tuple[float, float]:
        """Return the point that ranges are measured from."""
        if self._antenna is not None:
            return self._antenna
        return self.hass.config.latitude, self.hass.config.longitude

    @property
    def proximity_radius(self) -> float:
        """Return how close an aircraft counts as nearby, in metres."""
        kilometres = self.config_entry.options.get(
            CONF_PROXIMITY_RADIUS, DEFAULT_PROXIMITY_RADIUS
        )
        return float(kilometres) * 1000

    @property
    def origin_source(self) -> str:
        """Return where the point ranges are measured from came from.

        The two are indistinguishable from the coordinates alone, and which one
        is in use decides whether the range figures mean anything.
        """
        return "receiver" if self._antenna is not None else "home_location"

    async def _async_update_data(self) -> AdsbStationData:
        """Fetch every endpoint; only the primary source is fatal.

        The feeder is the primary source when there is one, so a receiver that
        stops answering does not take the feed entities with it. Without a
        feeder the receiver is all there is, and failing to read it is fatal.
        """
        feeder: dict[str, Any] | None = None
        if self.client.has_feeder:
            try:
                feeder = await self.client.async_get_feeder()
            except AdsbStationError as err:
                raise UpdateFailed(err) from err

        return AdsbStationData(
            feeder=feeder,
            aircraft=await self._async_get_aircraft(
                required=not self.client.has_feeder
            ),
            stats=await self._async_get_stats(),
        )

    async def _async_get_aircraft(self, *, required: bool) -> AircraftStats | None:
        """Fetch aircraft.json.

        A receiver that is not reachable is tolerated unless it is the only
        source this station has.
        """
        if not self.client.aircraft_url:
            return None
        try:
            data = await self.client.async_get_aircraft()
        except AdsbStationError as err:
            if required:
                raise UpdateFailed(err) from err
            # The feeder keeps working without the decoder, so degrade instead
            # of taking every entity down. Report the outage only once.
            if not self._aircraft_failed:
                self._aircraft_failed = True
                _LOGGER.warning(
                    "Could not read %s: %s. The aircraft entities become "
                    "unavailable until the receiver answers again",
                    self.client.aircraft_url,
                    err,
                )
            return None

        if self._aircraft_failed:
            self._aircraft_failed = False
            _LOGGER.info("%s can be read again", self.client.aircraft_url)

        await self._async_read_receiver()
        return await self._async_add_routes(self._build_aircraft_stats(data))

    async def _async_add_routes(self, stats: AircraftStats) -> AircraftStats:
        """Look up where the aircraft near you are flying from and to.

        Only the nearby ones: they are the handful an automation acts on, and
        every other aircraft in range would be a question asked of someone
        else's server for a figure nothing displays.
        """
        if self.route_lookup is None or not stats.nearby:
            return stats

        flights = [
            FlightPosition(
                callsign=summary.flight,
                latitude=None if summary.position is None else summary.position[0],
                longitude=None if summary.position is None else summary.position[1],
            )
            for summary in stats.nearby
            if summary.flight is not None
        ]
        if not flights:
            return stats

        routes = await self.route_lookup.async_resolve(flights)
        if not routes:
            return stats

        return replace(
            stats,
            nearby=tuple(
                summary
                if (route := routes.get(summary.flight or "")) is None
                else replace(summary, route=route)
                for summary in stats.nearby
            ),
        )

    async def _async_get_stats(self) -> ReceiverStats | None:
        """Fetch stats.json, tolerating a receiver that is not reachable."""
        if not self.client.stats_url:
            return None
        try:
            data = await self.client.async_get_stats()
        except AdsbStationError as err:
            if not self._stats_failed:
                self._stats_failed = True
                _LOGGER.warning(
                    "Could not read %s: %s. The reception statistics become "
                    "unavailable until the receiver answers again",
                    self.client.stats_url,
                    err,
                )
            return None

        if self._stats_failed:
            self._stats_failed = False
            _LOGGER.info("%s can be read again", self.client.stats_url)

        return self._build_receiver_stats(data)

    async def _async_read_receiver(self) -> None:
        """Read receiver.json, once: the antenna position and the decoder."""
        if self._antenna_checked:
            return
        self._antenna_checked = True
        try:
            data = await self.client.async_get_receiver()
        except AdsbStationError as err:
            _LOGGER.debug("No receiver position available: %s", err)
            return

        # Without a feeder this is the only thing that identifies the decoder
        # on the device page. The fr24feed fork never expands its placeholder.
        version = _as_text(data.get("version"))
        if version is not None and version != UNSET_RECEIVER_VERSION:
            self.receiver_version = version

        position = _position({"lat": data.get("lat"), "lon": data.get("lon")})
        # The fr24feed fork serves a receiver.json without coordinates, and an
        # unconfigured receiver reports the null island. Both mean "no answer",
        # so fall back to the location of Home Assistant itself.
        if position is None or position == (0.0, 0.0):
            _LOGGER.debug(
                "receiver.json has no usable position; measuring range from the "
                "Home Assistant home location instead"
            )
            return

        self._antenna = position
        _LOGGER.debug("Measuring range from the receiver position in receiver.json")

    def _build_aircraft_stats(self, data: dict[str, Any]) -> AircraftStats:
        """Turn a raw aircraft.json document into the figures we expose."""
        aircraft: list[dict[str, Any]] = [
            entry for entry in data["aircraft"] if isinstance(entry, dict)
        ]
        origin_latitude, origin_longitude = self.origin
        radius = self.proximity_radius

        with_position = 0
        max_range: float | None = None
        closest: AircraftSummary | None = None
        furthest: AircraftSummary | None = None
        highest: AircraftSummary | None = None
        fastest: AircraftSummary | None = None
        nearby: list[AircraftSummary] = []
        by_sector: dict[str, AircraftSummary] = {}
        emergencies: list[EmergencyAircraft] = []

        for entry in aircraft:
            if (reason := _emergency_reason(entry)) is not None:
                emergencies.append(
                    EmergencyAircraft(
                        hex=str(entry.get("hex", "")),
                        flight=_as_text(entry.get("flight")),
                        squawk=_as_text(entry.get("squawk")),
                        reason=reason,
                    )
                )

            metres: float | None = None
            if (position := _position(entry)) is not None:
                with_position += 1
                metres = distance(origin_latitude, origin_longitude, *position)

            summary = _summarise(entry, metres, position)

            # Altitude and speed reach us from aircraft without a position too,
            # so these two are not restricted to the ones we can locate.
            if summary.altitude is not None and (
                highest is None
                or highest.altitude is None
                or summary.altitude > highest.altitude
            ):
                highest = summary
            if summary.speed is not None and (
                fastest is None
                or fastest.speed is None
                or summary.speed > fastest.speed
            ):
                fastest = summary

            if metres is None or position is None:
                continue
            if max_range is None or metres > max_range:
                max_range = metres
                furthest = summary
            if closest is None or closest.distance is None or metres < closest.distance:
                closest = summary
            if metres <= radius:
                nearby.append(summary)

            sector = sector_of(_bearing(origin_latitude, origin_longitude, *position))
            best = by_sector.get(sector)
            if best is None or best.distance is None or metres > best.distance:
                by_sector[sector] = summary

        nearby.sort(key=lambda item: item.distance or 0.0)
        now = _as_float(data.get("now"))
        messages = _as_int(data.get("messages"))

        return AircraftStats(
            total=len(aircraft),
            with_position=with_position,
            messages=messages,
            message_rate=self._message_rate(messages, now),
            max_range=max_range,
            updated=None if now is None else dt_util.utc_from_timestamp(now),
            closest=closest,
            furthest=furthest,
            highest=highest,
            fastest=fastest,
            nearby=tuple(nearby),
            by_sector=by_sector,
            emergencies=tuple(emergencies),
        )

    def _message_rate(self, messages: int | None, now: float | None) -> float | None:
        """Return the messages per second since the previous poll."""
        if messages is None or now is None:
            return None

        previous = self._previous_messages
        self._previous_messages = (messages, now)
        if previous is None:
            return None

        previous_messages, previous_now = previous
        elapsed = now - previous_now
        # A restarted receiver resets its counter and its clock, so a negative
        # delta means the previous sample is worthless rather than a real rate.
        if elapsed <= 0 or messages < previous_messages:
            return None
        return (messages - previous_messages) / elapsed

    def _build_receiver_stats(self, data: dict[str, Any]) -> ReceiverStats:
        """Turn a raw stats.json document into the figures we expose."""
        period, window = self._pick_period(data)
        local = window.get("local")
        local = local if isinstance(local, dict) else {}

        signal = _as_float(local.get("signal"))
        noise = _as_float(local.get("noise"))
        tracks = window.get("tracks")
        tracks = tracks if isinstance(tracks, dict) else {}

        return ReceiverStats(
            period=period,
            signal=signal,
            noise=noise,
            signal_to_noise=None if signal is None or noise is None else signal - noise,
            peak_signal=_as_float(local.get("peak_signal")),
            strong_signals=_as_int(local.get("strong_signals")),
            samples_dropped=_as_int(local.get("samples_dropped")),
            accepted=_accepted(local.get("accepted")),
            tracks=_as_int(tracks.get("all")),
            single_message_tracks=_as_int(tracks.get("single_message")),
            demodulator_load=_demodulator_load(window),
            # readsb reports the gain once for the document, not per window.
            gain=read_gain(window, data),
            error_rate=_error_rate(local),
            aircraft_by_type=_aircraft_by_type(data),
            frequency_error=_as_float(data.get("estimated_ppm")),
            positions_decoded=_positions(window, ("global_ok", "local_ok")),
            positions_rejected=_positions(
                window, ("global_bad", "global_range", "global_speed")
            ),
        )

    @staticmethod
    def _pick_period(data: dict[str, Any]) -> tuple[str, dict[str, Any]]:
        """Return the shortest window that actually measured a signal."""
        fallback: tuple[str, dict[str, Any]] = ("last1min", {})
        for name in STATS_PERIODS:
            window = data.get(name)
            if not isinstance(window, dict):
                continue
            if not fallback[1]:
                fallback = (name, window)
            local = window.get("local")
            if isinstance(local, dict) and local.get("signal") is not None:
                return name, window
        return fallback


def _accepted(value: Any) -> int | None:
    """Return the accepted message count.

    dump1090 reports one entry per bit-error correction level, so the total is
    the sum of the list.
    """
    if isinstance(value, list):
        counts = [_as_int(item) for item in value]
        return sum(count for count in counts if count is not None)
    return _as_int(value)


def _error_rate(local: dict[str, Any]) -> float | None:
    """Return the share of Mode S messages that failed to decode, in percent.

    A quiet minute has no messages and therefore no rate, which is honestly
    unknown rather than a perfect zero.
    """
    total = _as_int(local.get("modes"))
    bad = _as_int(local.get("bad"))
    if total is None or bad is None or total <= 0:
        return None
    return bad / total * 100


def _aircraft_by_type(data: dict[str, Any]) -> dict[str, int]:
    """Return how the decoder came to know about the aircraft it tracks."""
    counts = data.get("aircraft_count_by_type")
    if not isinstance(counts, dict):
        return {}
    grouped: dict[str, int] = {}
    for group, keys in AIRCRAFT_TYPE_GROUPS.items():
        values = [_as_int(counts.get(key)) for key in keys]
        grouped[group] = sum(value for value in values if value is not None)
    return grouped


def _positions(window: dict[str, Any], keys: tuple[str, ...]) -> int | None:
    """Return a sum of position counters out of a window's cpr block."""
    cpr = window.get("cpr")
    if not isinstance(cpr, dict):
        return None
    values = [_as_int(cpr.get(key)) for key in keys]
    present = [value for value in values if value is not None]
    return sum(present) if present else None


def _demodulator_load(window: dict[str, Any]) -> float | None:
    """Return how much of the window dump1090 spent on the CPU, in percent."""
    cpu = window.get("cpu")
    if not isinstance(cpu, dict):
        return None
    start = _as_float(window.get("start"))
    end = _as_float(window.get("end"))
    if start is None or end is None or end <= start:
        return None

    # The counters are milliseconds of CPU time inside a window of seconds.
    spent = [_as_float(cpu.get(key)) for key in ("demod", "reader", "background")]
    used = sum(value for value in spent if value is not None)
    return used / ((end - start) * 1000) * 100
