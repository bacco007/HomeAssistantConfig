"""Data update coordinator for the ADS-B Station integration."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timedelta
import logging
from math import atan2, cos, degrees, hypot, radians, sin, sqrt
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
    APPROACH_HORIZON,
    APPROACH_POLLS,
    CONF_LOOK_UP_ROUTES,
    CONF_PROXIMITY_MAX_ALTITUDE,
    CONF_PROXIMITY_RADIUS,
    CONF_WATCHLIST,
    DB_FLAG_INTERESTING,
    DB_FLAG_LADD,
    DB_FLAG_MILITARY,
    DB_FLAG_PIA,
    DEFAULT_LOOK_UP_ROUTES,
    DEFAULT_PROXIMITY_RADIUS,
    DEFAULT_SCAN_INTERVAL,
    DEGREE_METRES,
    DOMAIN,
    EMERGENCY_SQUAWKS,
    EVENT_AIRCRAFT_APPROACHING,
    EVENT_AIRCRAFT_PASSAGE,
    EVENT_WATCHLIST_MATCH,
    FEET_TO_METRES,
    GROUND_ALTITUDE,
    KNOTS_TO_METRES_PER_SECOND,
    MAX_PLAUSIBLE_RANGE,
    PASSAGE_GAP,
    RADIO_HORIZON_ALLOWANCE,
    RADIO_HORIZON_METRES_PER_ROOT_FOOT,
    RECEIVER_READ_ATTEMPTS,
    SECTORS,
    UNSET_RECEIVER_VERSION,
    WATCHLIST_HEX,
    WATCHLIST_SQUAWK,
    WATCHLIST_TYPE,
)
from .reference import (
    EMPTY as EMPTY_REFERENCE,
    ReferenceTables,
    designator_of,
    kind_of,
    normalise,
)
from .route import FlightPosition, FlightRoute, build_route_lookup, route_attributes

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
    vertical_rate: float | None
    rssi: float | None
    seen: float | None
    # True for an aircraft that says it is on the ground. Its altitude is None
    # like that of an aircraft that reports none at all, so without this the
    # two cannot be told apart.
    on_ground: bool = False
    registration: str | None
    aircraft_type: str | None
    description: str | None
    military: bool
    # The rest of what dbFlags says, out of the same aircraft database.
    # Interesting is whatever the keeper of that database thought worth
    # marking, a PIA address is a temporary hex code an operator flies under
    # to stay off the lists, and LADD is an American request not to be shown
    # at all. All three are passed on rather than acted on: an aircraft this
    # receiver heard is one it heard, and what to show is the dashboard's to
    # decide.
    interesting: bool = False
    pia: bool = False
    ladd: bool = False
    # The country that was handed the range this aircraft's address falls in,
    # as an ISO two-letter code. Where it is registered, not where it is: a
    # KLM aircraft over Spain is still NL.
    country: str | None = None
    # The emitter category the aircraft broadcasts, A0 through D7. It is the
    # only thing that tells a helicopter from an airliner without a database,
    # and it arrives over the air rather than out of a file.
    category: str | None = None
    # Which kind of message this aircraft is known through: heard directly
    # over ADS-B, computed from timing by mlat, or bare Mode S. The station
    # counts these already; per aircraft it is what explains why one of them
    # has no position while the rest do.
    heard_as: str | None = None
    # Read off the callsign against a table we ship, so this is filled in
    # whether or not a route source is configured.
    airline: str | None = None
    # The designator the callsign opens with, whether or not the table has a
    # name for it. It is what a dashboard looks an airline logo up by.
    airline_code: str | None = None
    # Where it was heard, which no entity shows but a route lookup needs to
    # tell one flight number from the same one halfway around the world.
    position: tuple[float, float] | None = None
    # Filled in after the poll, and only for the aircraft near enough to
    # matter, when a route source is configured.
    route: FlightRoute | None = None
    # Where this aircraft is heading, if it holds its heading and its speed.
    # False for anything already going away, anything that reports too little
    # to say, and anything further ahead than a straight line is worth
    # believing. The distance is across the ground, in metres.
    approaching: bool = False
    closest_passing_distance: float | None = None
    seconds_to_closest: float | None = None


@dataclass(kw_only=True)
class Passage:
    """One aircraft crossing the sky above you, start to finish.

    An aircraft is not a state that changes, it is a thing that comes past.
    Something overhead that stays overhead is one passage however many polls
    it spans, and the same aircraft an hour later is a second one.

    What it holds is the closest it ever came, not what it looked like when it
    arrived, because that is the moment worth reporting: an aircraft is first
    seen at the edge of the radius and is most worth looking up at directly
    overhead.
    """

    hex: str
    started_at: datetime
    last_seen: datetime
    # The aircraft at its closest approach, and how close that was in metres.
    closest: AircraftSummary
    closest_distance: float
    # And as it was on the last poll that saw it, which is what a panel
    # showing what is above you right now wants to read.
    current: AircraftSummary
    current_distance: float
    # The strongest signal heard from it over the whole passage. Not the same
    # as the signal at the closest approach: an aircraft banking away can put
    # its antenna in a better place than one directly overhead.
    peak_rssi: float | None = None


@dataclass(frozen=True, kw_only=True)
class WatchlistEntry:
    """One line of the watchlist, and what it turned out to be."""

    # As it was written down, which is what an automation reads back.
    line: str
    kind: str
    # And as it is compared: capitals, no dashes.
    value: str


@dataclass(frozen=True, kw_only=True)
class WatchlistMatch:
    """One aircraft on the watchlist, in range of the antenna."""

    entry: WatchlistEntry
    # Which field of the aircraft it matched on, since a name is compared
    # against the registration and the callsign both.
    matched_on: str
    summary: AircraftSummary
    squawk: str | None


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
    updated: datetime | None
    closest: AircraftSummary | None
    # The furthest aircraft this poll heard, which is the range figure as well:
    # the distance is on the summary, and keeping it twice would be two things
    # to hold in step.
    furthest: AircraftSummary | None = None
    highest: AircraftSummary | None = None
    fastest: AircraftSummary | None = None
    # Everything inside the configured radius, nearest first.
    nearby: tuple[AircraftSummary, ...] = ()
    # And everything the decoder was holding, near or not, in the order it
    # served them. No entity shows this: it is what a question about one
    # particular aircraft has to be answered out of, because an aircraft
    # forty kilometres out is in none of the lists above.
    heard: tuple[AircraftSummary, ...] = ()
    # The furthest aircraft seen in each compass sector this poll. The
    # all-time record lives on the entities, which survive a restart.
    by_sector: dict[str, AircraftSummary] = field(default_factory=dict)
    emergencies: tuple[EmergencyAircraft, ...] = ()
    # Whatever the watchlist recognised this poll, in the order the list was
    # written. Empty when nothing is being watched for.
    watched: tuple[WatchlistMatch, ...] = ()


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


def _as_code(value: Any) -> str | None:
    """Return a code as it is written down, which is in capitals.

    Nothing else compares a broadcast code against a written one, so the
    aircraft is taken at its word everywhere else. A category is compared, by
    an automation looking for helicopters, and a decoder that sent `a7` would
    otherwise never match.
    """
    text = _as_text(value)
    return None if text is None else text.upper()


def _position(entry: dict[str, Any]) -> tuple[float, float] | None:
    """Return the position of an aircraft, if it reported one."""
    latitude = _as_float(entry.get("lat"))
    longitude = _as_float(entry.get("lon"))
    if latitude is None or longitude is None:
        return None
    return latitude, longitude


ALTITUDE_KEYS = ("alt_baro", "altitude")


def _altitude(entry: dict[str, Any]) -> float | None:
    """Return the barometric altitude in feet.

    The fr24feed fork of dump1090 calls this field 'altitude' and reports the
    string 'ground' for aircraft on the ground; dump1090-fa and readsb call it
    'alt_baro'.
    """
    for key in ALTITUDE_KEYS:
        if key in entry:
            return _as_float(entry[key])
    return None


def _on_ground(entry: dict[str, Any]) -> bool:
    """Return True if this aircraft says it is on the ground.

    It says so by putting a word where the altitude belongs, which parses as
    no altitude at all. That is the same thing an aircraft heard only over
    Mode S reports, and the two are worth telling apart: one is a height we do
    not know, the other is a height of zero.
    """
    for key in ALTITUDE_KEYS:
        if key in entry:
            return str(entry[key]).strip().lower() == GROUND_ALTITUDE
    return False


def _ground_speed(entry: dict[str, Any]) -> float | None:
    """Return the ground speed in knots, under either of its two names."""
    for key in ("gs", "speed"):
        if key in entry:
            return _as_float(entry[key])
    return None


def _vertical_rate(entry: dict[str, Any]) -> float | None:
    """Return the rate of climb or descent in feet per minute.

    readsb and dump1090-fa report the barometric rate and, on aircraft that
    send one, a geometric rate measured against GNSS. The barometric one is
    what every map shows, so it comes first; the dump1090 fork that fr24feed
    ships has neither and calls its own field 'vert_rate'.
    """
    for key in ("baro_rate", "geom_rate", "vert_rate"):
        if (rate := _as_float(entry.get(key))) is not None:
            return rate
    return None


def slant_distance(summary: AircraftSummary) -> float | None:
    """Return how far away an aircraft really is, in metres.

    Every other distance here is measured across the ground, which is the
    right answer for how far your antenna reaches. It is the wrong answer for
    what is above you: an airliner at 37,000 feet passing nine kilometres to
    the north is eleven kilometres up and fourteen away, and calling that
    overhead would fill a passage list with traffic nobody can see.

    An aircraft that never reported an altitude keeps its ground distance,
    which is the best that can be said about it.
    """
    if summary.distance is None:
        return None
    if summary.altitude is None:
        return summary.distance
    return hypot(summary.distance, summary.altitude * FEET_TO_METRES)


def approach_of(
    origin: tuple[float, float], summary: AircraftSummary
) -> tuple[float, float] | None:
    """Return how close an aircraft will pass, and how long until it does.

    Everything else this integration reports is in the past tense: the
    aircraft is already here. Position, track and speed are all in the poll,
    and between them they say where an aircraft will be, which is what makes
    an announcement useful rather than late.

    **It is a straight line at a constant speed, and nothing more.** An
    aircraft that turns, descends into an approach or is told to hold makes
    this wrong, and the answer is worth exactly as much as that assumption is.
    So it is only worked out for an aircraft that reports all three, is not
    on the ground, and is actually closing: the moment the distance stops
    shrinking there is no approach left to predict.

    The distance is across the ground. Height is deliberately left out of it,
    because an aircraft at eleven kilometres passing straight overhead has a
    closest approach of nothing at all across the ground and that is the
    honest answer to "will it come over my house"; whether it is worth
    looking up at is what the [overhead ceiling](const.py) decides.
    """
    if summary.position is None or summary.track is None or summary.speed is None:
        return None
    if summary.on_ground or summary.speed <= 0:
        return None

    origin_latitude, origin_longitude = origin
    latitude, longitude = summary.position
    # Flat enough over the tens of kilometres a receiver reaches, and a
    # rounder earth would not rescue a straight-line guess.
    north = (latitude - origin_latitude) * DEGREE_METRES
    east = (
        (longitude - origin_longitude) * DEGREE_METRES * cos(radians(origin_latitude))
    )

    speed = summary.speed * KNOTS_TO_METRES_PER_SECOND
    east_per_second = speed * sin(radians(summary.track))
    north_per_second = speed * cos(radians(summary.track))

    # Where the distance stops shrinking: the point on the aircraft's line
    # nearest the antenna. A positive figure here means it is already past it.
    closing = east * east_per_second + north * north_per_second
    if closing >= 0:
        return None
    seconds = -closing / (speed * speed)
    metres = hypot(east + east_per_second * seconds, north + north_per_second * seconds)
    return metres, seconds


def _is_believable(metres: float, altitude: float | None) -> bool:
    """Return whether an aircraft can really be that far away.

    Positions are decoded from a pair of messages, and a pair that does not
    belong together decodes to somewhere else entirely. Decoders reject most
    of those themselves, which is what the rejected positions figure counts,
    but the ones that survive land far outside what line of sight allows.

    That matters more here than it looks: the sector records only ever grow,
    so a single bad position becomes a record that stands until someone
    presses the button, and one close enough to be overhead would ring the
    doorbell for an aircraft that was never there.
    """
    if metres > MAX_PLAUSIBLE_RANGE:
        return False
    if altitude is None:
        return True
    # Below sea level is a real altitude and a shorter horizon, not a reason
    # to take the square root of a negative number.
    horizon = RADIO_HORIZON_METRES_PER_ROOT_FOOT * sqrt(max(altitude, 0.0))
    return metres <= horizon + RADIO_HORIZON_ALLOWANCE


def _under(summary: AircraftSummary, ceiling: float | None) -> bool:
    """Return whether an aircraft is low enough to count as nearby.

    An aircraft on the ground is under every ceiling there is. It reports no
    altitude, precisely because it is on the ground, so comparing the figure
    would throw out the taxiing traffic that a ceiling was never aimed at.

    Anything else without an altitude cannot be judged and does not count,
    the same way a height filter on the services leaves out what it cannot
    measure.
    """
    if ceiling is None:
        return True
    if summary.on_ground:
        return True
    return summary.altitude is not None and summary.altitude <= ceiling


def _db_flag(entry: dict[str, Any], flag: int) -> bool:
    """Return whether one of readsb's dbFlags bits is set.

    dbFlags is a bitfield an aircraft database fills in. Decoders without one
    omit the field entirely, which is why an unset bit and an unknown one look
    the same here: both are False, and neither is worth an attribute.
    """
    flags = _as_int(entry.get("dbFlags"))
    return flags is not None and bool(flags & flag)


def _military_flag(entry: dict[str, Any]) -> bool | None:
    """Return what dbFlags says about this aircraft, or None if it says nothing.

    Three answers rather than two, because "the database says this is not
    military" and "there is no database" are different things and only one of
    them can be corrected. dbFlags knows the individual tail and is believed
    either way it points; the address block behind it knows only what range a
    country set aside, and gets its say when nobody else has one.
    """
    flags = _as_int(entry.get("dbFlags"))
    return None if flags is None else bool(flags & DB_FLAG_MILITARY)


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


def sector_from(
    origin: tuple[float, float], position: tuple[float, float] | None
) -> str | None:
    """Return which way an aircraft lies, seen from the antenna."""
    return None if position is None else sector_of(_bearing(*origin, *position))


def _summarise(
    entry: dict[str, Any],
    metres: float | None,
    position: tuple[float, float] | None = None,
    reference: ReferenceTables = EMPTY_REFERENCE,
) -> AircraftSummary:
    """Turn one aircraft.json entry into the shape we expose."""
    flight = _as_text(entry.get("flight"))
    aircraft_type = _as_text(entry.get("t"))
    hex_code = str(entry.get("hex", ""))
    military = _military_flag(entry)
    return AircraftSummary(
        hex=hex_code,
        flight=flight,
        distance=metres,
        position=position,
        altitude=_altitude(entry),
        speed=_ground_speed(entry),
        track=_as_float(entry.get("track")),
        vertical_rate=_vertical_rate(entry),
        rssi=_as_float(entry.get("rssi")),
        seen=_as_float(entry.get("seen")),
        on_ground=_on_ground(entry),
        # Only a decoder with an aircraft database fills these in.
        registration=_as_text(entry.get("r")),
        aircraft_type=aircraft_type,
        # A database that fills in the type code without describing it is the
        # common case, so the table stands in where the decoder says nothing.
        description=_as_text(entry.get("desc")) or reference.model_of(aircraft_type),
        # The decoder's own answer where there is one, and the address block
        # only where there is not.
        military=reference.is_military(hex_code) if military is None else military,
        interesting=_db_flag(entry, DB_FLAG_INTERESTING),
        pia=_db_flag(entry, DB_FLAG_PIA),
        ladd=_db_flag(entry, DB_FLAG_LADD),
        # Out of the address itself, so this is there whatever the decoder is.
        country=reference.country_of(hex_code),
        category=_as_code(entry.get("category")),
        heard_as=_as_text(entry.get("type")),
        airline=reference.airline_of(flight),
        airline_code=designator_of(flight),
    )


def aircraft_attributes(
    summary: AircraftSummary, *, include_distance: bool = False
) -> dict[str, Any]:
    """Describe one aircraft for the attributes of an entity.

    The distance is left out where the entity state already is the distance.
    """
    attributes: dict[str, Any] = {
        "hex": summary.hex,
        "flight": summary.flight,
        "altitude": summary.altitude,
        "speed": summary.speed,
        "track": summary.track,
        # Feet per minute, positive climbing. Absent from aircraft on the
        # ground and from the ones we only ever hear over Mode S.
        "vertical_rate": summary.vertical_rate,
        "rssi": summary.rssi,
        "seen": summary.seen,
    }
    if include_distance:
        attributes["distance"] = (
            None if summary.distance is None else round(summary.distance / 1000, 1)
        )
    # Decoders without an aircraft database send none of this, and empty
    # attributes are worse than absent ones on a dashboard.
    if summary.registration is not None:
        attributes["registration"] = summary.registration
    if summary.aircraft_type is not None:
        attributes["aircraft_type"] = summary.aircraft_type
    if summary.description is not None:
        attributes["description"] = summary.description
    if summary.country is not None:
        attributes["country"] = summary.country
    if summary.category is not None:
        attributes["category"] = summary.category
    if summary.heard_as is not None:
        attributes["heard_as"] = summary.heard_as
    if summary.military:
        attributes["military"] = True
    if summary.interesting:
        attributes["interesting"] = True
    if summary.pia:
        attributes["pia"] = True
    if summary.ladd:
        attributes["ladd"] = True
    if summary.on_ground:
        attributes["on_ground"] = True
    if summary.approaching:
        attributes["approaching"] = True
        attributes["closest_passing_distance"] = (
            None
            if summary.closest_passing_distance is None
            else round(summary.closest_passing_distance / 1000, 1)
        )
        attributes["seconds_to_closest"] = (
            None
            if summary.seconds_to_closest is None
            else round(summary.seconds_to_closest)
        )
    if summary.airline_code is not None:
        attributes["airline_code"] = summary.airline_code
    if summary.airline is not None:
        attributes["airline"] = summary.airline
    # Empty unless a route source is configured and it recognised the flight.
    attributes.update(route_attributes(summary.route))
    return attributes


def watchlist_of(entry: ConfigEntry, models: dict[str, str]) -> list[WatchlistEntry]:
    """Read the watchlist off an entry, dropping what it cannot read.

    The option flow refuses a line it does not recognise, so a bad line here
    is one that was saved before the shipped type table knew a code, or one
    that arrived in a restored backup. Skipping it quietly is right: it costs
    that line and not the rest of the list.
    """
    text = entry.options.get(CONF_WATCHLIST) or ""
    watched = []
    for line in str(text).splitlines():
        if (kind := kind_of(line, models)) is not None:
            watched.append(
                WatchlistEntry(line=line.strip(), kind=kind, value=normalise(line))
            )
    return watched


def _matches(
    watched: WatchlistEntry, summary: AircraftSummary, squawk: str
) -> str | None:
    """Return which field of an aircraft a watchlist line matched on."""
    if watched.kind == WATCHLIST_HEX:
        return "hex" if normalise(summary.hex) == watched.value else None
    if watched.kind == WATCHLIST_SQUAWK:
        return "squawk" if normalise(squawk) == watched.value else None
    if watched.kind == WATCHLIST_TYPE:
        return (
            "aircraft_type"
            if normalise(summary.aircraft_type) == watched.value
            else None
        )
    # A name is compared against both, because which of the two it is cannot
    # be told from the line and does not have to be.
    if normalise(summary.registration) == watched.value:
        return "registration"
    return "flight" if normalise(summary.flight) == watched.value else None


def receivers(
    hass: HomeAssistant,
) -> list[tuple[AdsbStationDataUpdateCoordinator, AircraftStats]]:
    """Return every station that is reading a receiver, by title.

    A station commonly runs several feeders in front of one decoder, and each
    of those is an entry of its own with no aircraft to its name: the receiver
    belongs to one of them, or the count would be the same aircraft over
    again. So anything asked about aircraft asks these and not every entry.

    Sorted by title, so two antennas answer in an order that does not depend
    on which entry happened to load first.
    """
    found = []
    for entry in hass.config_entries.async_loaded_entries(DOMAIN):
        coordinator: AdsbStationDataUpdateCoordinator = entry.runtime_data
        if (aircraft := coordinator.data.aircraft) is not None:
            found.append((entry.title, coordinator, aircraft))
    found.sort(key=lambda station: station[0])
    return [(coordinator, aircraft) for _, coordinator, aircraft in found]


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
        reference: ReferenceTables = EMPTY_REFERENCE,
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
        # The names for the codes an aircraft broadcasts. Empty when the tables
        # could not be read, which costs a name and nothing else.
        self.reference = reference
        self.receiver_version: str | None = None
        # None unless the user picked a source to look routes up with, which
        # is the only thing here that talks to anything off your own network.
        self.route_lookup = build_route_lookup(
            async_get_clientsession(hass),
            config_entry.options.get(CONF_LOOK_UP_ROUTES, DEFAULT_LOOK_UP_ROUTES),
        )
        # Filled in by the sector sensors as they are added, so the reset
        # button can reach them without going through the entity platform.
        self.sector_sensors: list[SectorRangeRecord] = []
        # The aircraft currently crossing the sky above you, by hex. Kept
        # across polls, because a passage is a thing that lasts and a poll is
        # only a look at it.
        self.passages: dict[str, Passage] = {}
        # The nearest of those on the last poll, which is what a panel showing
        # one aircraft shows. None the moment the sky above you is empty.
        self.overhead: Passage | None = None
        self._previous_messages: tuple[int, float] | None = None
        self._aircraft_failed = False
        self._stats_failed = False
        self._antenna: tuple[float, float] | None = None
        self._receiver_reads_left = RECEIVER_READ_ATTEMPTS
        self.watchlist = watchlist_of(config_entry, reference.models)
        # When each watched aircraft was last announced, so that one aircraft
        # crossing the sky is one message rather than one every fifteen
        # seconds. The same gap a passage uses, for the same reason.
        self._announced: dict[str, datetime] = {}
        # How many polls in a row each aircraft has been coming this way, and
        # when it was last warned about.
        self._approaching: dict[str, int] = {}
        self._warned: dict[str, datetime] = {}

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
    def proximity_ceiling(self) -> float | None:
        """Return how high an aircraft may be and still count as nearby.

        None where nothing was set, which is what every station did before
        this existed and what it keeps doing: the radius alone decides.
        """
        feet = self.config_entry.options.get(CONF_PROXIMITY_MAX_ALTITUDE)
        return None if feet in (None, "") else float(feet)

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
        stats = await self._async_add_routes(self._build_aircraft_stats(data))
        # After the routes, so an automation is told where the aircraft it is
        # being woken for is going.
        self._track_passages(stats)
        self._announce_watched(stats)
        self._announce_approaching(stats)
        return stats

    def _track_passages(self, stats: AircraftStats) -> None:
        """Follow the aircraft crossing the sky above you, and announce them.

        The nearby list is already everything within the radius across the
        ground, and an aircraft can only be within the real distance if it is
        within that, so this is a matter of dropping the ones that are high
        rather than close, and the ones that are not flying at all.

        Aircraft on the ground report no altitude, so the real distance to one
        falls back to the distance across the ground and every airliner taxiing
        at a field down the road would come past as a passage. Nobody looks up
        at those, and near a field there are a great many of them.
        """
        now = dt_util.utcnow()
        radius = self.proximity_radius
        in_view: list[Passage] = []

        for summary in stats.nearby:
            if summary.on_ground:
                continue
            metres = slant_distance(summary)
            if metres is None or metres > radius:
                continue

            passage = self.passages.get(summary.hex)
            if passage is None or now - passage.last_seen > PASSAGE_GAP:
                passage = Passage(
                    hex=summary.hex,
                    started_at=now,
                    last_seen=now,
                    closest=summary,
                    closest_distance=metres,
                    current=summary,
                    current_distance=metres,
                    peak_rssi=summary.rssi,
                )
                self.passages[summary.hex] = passage
                in_view.append(passage)
                self._announce(passage, metres)
                continue

            in_view.append(passage)
            passage.last_seen = now
            passage.current = summary
            passage.current_distance = metres
            if metres < passage.closest_distance:
                passage.closest = summary
                passage.closest_distance = metres
            if summary.rssi is not None and (
                passage.peak_rssi is None or summary.rssi > passage.peak_rssi
            ):
                passage.peak_rssi = summary.rssi

        # Of the aircraft this poll actually saw, the nearest is the one to
        # look up at. A passage that was not seen is not overhead, however
        # recently it was there.
        self.overhead = (
            min(in_view, key=lambda passage: passage.current_distance)
            if in_view
            else None
        )

        # An aircraft that has been gone longer than a passage can be paused
        # for is gone, and holding on to it would grow this without bound.
        for hex_code in [
            hex_code
            for hex_code, passage in self.passages.items()
            if now - passage.last_seen > PASSAGE_GAP
        ]:
            del self.passages[hex_code]

    def _announce_approaching(self, stats: AircraftStats) -> None:
        """Fire an event for an aircraft that is about to come over.

        Everything else here reports the present tense. This is the one thing
        that says something before it happens, and it is built out of an
        assumption rather than a measurement, so it is held to three rules:

        It has to be coming somewhere worth mentioning, which is inside the
        same radius and under the same ceiling a passage uses; there is no
        point announcing an aircraft that will pass forty kilometres away.

        It has to say so twice. A single mis-decoded heading points an
        aircraft straight at your house for one poll, and by the next it is
        pointing where it was really going.

        And it is said once. Repeating it every fifteen seconds for the four
        minutes it takes to arrive would be worse than not saying it at all,
        so the same gap that separates two passages separates two warnings.
        """
        now = dt_util.utcnow()
        radius = self.proximity_radius
        ceiling = self.proximity_ceiling
        coming: set[str] = set()

        for summary in stats.heard:
            if not summary.approaching or summary.closest_passing_distance is None:
                continue
            if summary.closest_passing_distance > radius or not _under(
                summary, ceiling
            ):
                continue

            coming.add(summary.hex)
            if self._approaching.get(summary.hex, 0) + 1 < APPROACH_POLLS:
                self._approaching[summary.hex] = (
                    self._approaching.get(summary.hex, 0) + 1
                )
                continue
            self._approaching[summary.hex] = APPROACH_POLLS

            warned = self._warned.get(summary.hex)
            if warned is not None and now - warned <= PASSAGE_GAP:
                continue
            self._warned[summary.hex] = now
            self.hass.bus.async_fire(
                EVENT_AIRCRAFT_APPROACHING,
                {
                    "entry_id": self.config_entry.entry_id,
                    "station": self.config_entry.title,
                    **aircraft_attributes(summary, include_distance=True),
                },
            )

        # An aircraft that has stopped coming this way starts over, so that
        # turning back towards you counts as two polls again.
        for hex_code in set(self._approaching) - coming:
            del self._approaching[hex_code]
        for hex_code in [
            hex_code
            for hex_code, warned in self._warned.items()
            if now - warned > PASSAGE_GAP
        ]:
            del self._warned[hex_code]

    def _announce_watched(self, stats: AircraftStats) -> None:
        """Fire an event for each watched aircraft that has turned up.

        Unlike a passage this has no radius. The question a watchlist asks is
        whether the aircraft is up there at all, so an answer forty kilometres
        away is the answer; where a passage says something came over your
        house, this says something you were waiting for is in the air.
        """
        now = dt_util.utcnow()
        for match in stats.watched:
            announced = self._announced.get(match.summary.hex)
            if announced is not None and now - announced <= PASSAGE_GAP:
                continue
            self._announced[match.summary.hex] = now
            self.hass.bus.async_fire(
                EVENT_WATCHLIST_MATCH,
                {
                    "entry_id": self.config_entry.entry_id,
                    "station": self.config_entry.title,
                    # The line as it was written down, and what about the
                    # aircraft it turned out to name.
                    "watching": match.entry.line,
                    "matched_on": match.matched_on,
                    "squawk": match.squawk,
                    **aircraft_attributes(match.summary, include_distance=True),
                },
            )

        # An aircraft that has been gone longer than the gap is gone, and
        # coming back is worth being told about again.
        for hex_code in [
            hex_code
            for hex_code, announced in self._announced.items()
            if now - announced > PASSAGE_GAP
        ]:
            del self._announced[hex_code]

    def _announce(self, passage: Passage, metres: float) -> None:
        """Fire the event for a passage that has just begun.

        Once per aircraft, where the binary sensor can only say whether there
        is anything at all overhead: a second aircraft arriving while the
        first is still in view changes no state and would otherwise pass
        unnoticed.
        """
        self.hass.bus.async_fire(
            EVENT_AIRCRAFT_PASSAGE,
            {
                "entry_id": self.config_entry.entry_id,
                "station": self.config_entry.title,
                **aircraft_attributes(passage.closest, include_distance=True),
                # How far away it really is, where the distance above is the
                # one measured across the ground.
                "slant_distance": round(metres / 1000, 1),
            },
        )

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
        """Read receiver.json: the antenna position and the decoder version.

        Once, as long as it answers. Neither of those can change while the
        decoder runs, so a document that carries no position is a final answer
        and not worth asking after again.

        A request that fails is not an answer, though, and this one only runs
        after aircraft.json has just been read, so a receiver that answers on
        one URL and not on the other is having a moment rather than telling us
        anything. Give it a few polls before settling for the home location,
        because settling for it is silent and lasts until the entry is
        reloaded.
        """
        if self._receiver_reads_left <= 0:
            return
        self._receiver_reads_left -= 1
        try:
            data = await self.client.async_get_receiver()
        except AdsbStationError as err:
            if self._receiver_reads_left > 0:
                _LOGGER.debug("Could not read receiver.json: %s. Trying again", err)
            else:
                _LOGGER.warning(
                    "Could not read receiver.json in %s attempts: %s. Range is "
                    "measured from the Home Assistant home location instead of "
                    "from the antenna, and will be until this entry is reloaded",
                    RECEIVER_READ_ATTEMPTS,
                    err,
                )
            return

        # It answered, so stop asking whatever it had to say.
        self._receiver_reads_left = 0

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
        """Turn a raw aircraft.json document into the figures we expose.

        Every aircraft the decoder is holding counts, including the ones it
        has not heard from for a moment: it keeps an aircraft in the document
        for about a minute after its last message, and the seen field on each
        one says how long that is.

        Dropping those was tempting and would have been wrong. It is the same
        aircraft in the same place it was heard, so the range it set is a range
        this station really reached; the count would stop agreeing with the map
        the decoder serves; and a gap in reception is exactly what a passage is
        built to ride out, so cutting one short here would undo that.
        """
        aircraft: list[dict[str, Any]] = [
            entry for entry in data["aircraft"] if isinstance(entry, dict)
        ]
        origin_latitude, origin_longitude = self.origin
        radius = self.proximity_radius
        ceiling = self.proximity_ceiling

        with_position = 0
        # Each superlative is kept next to the figure that won it. A summary
        # carries an optional distance, altitude and speed, because plenty of
        # aircraft report none of them, but the one holding a superlative
        # always has the figure it won on, and comparing plain numbers says so.
        closest: AircraftSummary | None = None
        closest_metres: float | None = None
        furthest: AircraftSummary | None = None
        furthest_metres: float | None = None
        highest: AircraftSummary | None = None
        highest_feet: float | None = None
        fastest: AircraftSummary | None = None
        fastest_knots: float | None = None
        nearby: list[AircraftSummary] = []
        heard: list[AircraftSummary] = []
        watched: list[WatchlistMatch] = []
        by_sector: dict[str, AircraftSummary] = {}
        sector_metres: dict[str, float] = {}
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
                metres = distance(origin_latitude, origin_longitude, *position)
                # A position we do not believe is worse than none: it would set
                # a record that stands for good, or put an aircraft overhead
                # that was never there. The aircraft itself is real and still
                # counts; we simply do not know where it is.
                if metres is not None and not _is_believable(
                    metres, altitude := _altitude(entry)
                ):
                    _LOGGER.debug(
                        "Ignoring the position of %s: %.0f km is further than "
                        "line of sight allows at %s feet",
                        entry.get("hex"),
                        metres / 1000,
                        altitude,
                    )
                    metres = None
                if metres is None:
                    position = None
                else:
                    with_position += 1

            summary = _summarise(entry, metres, position, self.reference)
            if (approach := approach_of(self.origin, summary)) is not None:
                passing, seconds = approach
                if seconds <= APPROACH_HORIZON.total_seconds():
                    summary = replace(
                        summary,
                        approaching=True,
                        closest_passing_distance=passing,
                        seconds_to_closest=seconds,
                    )
            heard.append(summary)

            # The first line that matches wins and the rest are not tried: a
            # hex code and a type code can both name the same aircraft, and
            # one aircraft is one thing to be told about.
            squawk = _as_text(entry.get("squawk")) or ""
            for line in self.watchlist:
                if (field := _matches(line, summary, squawk)) is not None:
                    watched.append(
                        WatchlistMatch(
                            entry=line,
                            matched_on=field,
                            summary=summary,
                            squawk=squawk or None,
                        )
                    )
                    break

            # Altitude and speed reach us from aircraft without a position too,
            # so these two are not restricted to the ones we can locate.
            if summary.altitude is not None and (
                highest_feet is None or summary.altitude > highest_feet
            ):
                highest, highest_feet = summary, summary.altitude
            if summary.speed is not None and (
                fastest_knots is None or summary.speed > fastest_knots
            ):
                fastest, fastest_knots = summary, summary.speed

            if metres is None or position is None:
                continue
            if furthest_metres is None or metres > furthest_metres:
                furthest, furthest_metres = summary, metres
            if closest_metres is None or metres < closest_metres:
                closest, closest_metres = summary, metres
            # The ceiling belongs to the nearby family and to nothing else.
            # Everything above this line is about what the station received,
            # which an aircraft at cruising height counted towards whether or
            # not you would ever look up at it: the count, the range records,
            # the furthest and the highest, and an emergency squawk, which is
            # worth hearing about at any altitude at all. Somebody tidying up
            # later will be tempted to hoist this; that is what it would cost.
            if metres <= radius and _under(summary, ceiling):
                nearby.append(summary)

            sector = sector_of(_bearing(origin_latitude, origin_longitude, *position))
            if sector not in sector_metres or metres > sector_metres[sector]:
                by_sector[sector], sector_metres[sector] = summary, metres

        nearby.sort(key=lambda item: item.distance or 0.0)
        now = _as_float(data.get("now"))
        messages = _as_int(data.get("messages"))
        # On its own line because it is the one thing here that does not only
        # read: it hands over the sample this poll leaves for the next one.
        message_rate = self._take_message_rate(messages, now)

        return AircraftStats(
            total=len(aircraft),
            with_position=with_position,
            messages=messages,
            message_rate=message_rate,
            updated=None if now is None else dt_util.utc_from_timestamp(now),
            closest=closest,
            furthest=furthest,
            highest=highest,
            fastest=fastest,
            nearby=tuple(nearby),
            heard=tuple(heard),
            by_sector=by_sector,
            emergencies=tuple(emergencies),
            watched=tuple(watched),
        )

    def _take_message_rate(
        self, messages: int | None, now: float | None
    ) -> float | None:
        """Return the messages per second since the previous poll.

        Named for the fact that it consumes something: a rate needs two
        samples, so this replaces the one it was holding with the one it was
        given. Asking twice for the same poll answers the first time only.
        """
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
