"""Constants for the ADS-B Station integration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

DOMAIN = "adsb_station"

CONF_FEEDER_TYPE = "feeder_type"

# The feeders we can read. Each uploads to its own network and serves its own
# local status document; a station commonly runs several of them side by side
# off one decoder, so each becomes its own entry and its own device.
FEEDER_FR24 = "fr24feed"
FEEDER_PIAWARE = "piaware"
FEEDER_PLANEFINDER = "planefinder"


@dataclass(frozen=True, kw_only=True)
class FeederKind:
    """Everything that differs between one feeder and the next."""

    key: str
    # Where its status document lives, and the port it is normally on.
    port: int
    path: str
    # Keys that only that document has, so we can tell we reached the right one.
    markers: frozenset[str]
    manufacturer: str
    model: str
    # Used as the device name until the feeder tells us something better.
    default_name: str


FEEDERS: dict[str, FeederKind] = {
    FEEDER_FR24: FeederKind(
        key=FEEDER_FR24,
        port=8754,
        path="/monitor.json",
        markers=frozenset({"feed_status", "rx_connected", "feed_alias"}),
        manufacturer="Flightradar24",
        model="fr24feed",
        default_name="FR24 feeder",
    ),
    FEEDER_PIAWARE: FeederKind(
        key=FEEDER_PIAWARE,
        # FlightAware's own tooling defaults to 8080, though a station whose
        # web server was taken over by something else may serve it elsewhere.
        port=8080,
        path="/status.json",
        markers=frozenset({"piaware", "adept", "radio"}),
        manufacturer="FlightAware",
        model="PiAware",
        default_name="PiAware feeder",
    ),
    FEEDER_PLANEFINDER: FeederKind(
        key=FEEDER_PLANEFINDER,
        port=30053,
        path="/ajax/stats",
        markers=frozenset(
            {"client_version", "total_modes_packets", "master_server_bytes_out"}
        ),
        manufacturer="Plane Finder",
        model="pfclient",
        default_name="Plane Finder feeder",
    ),
}

MODEL_RECEIVER = "ADS-B receiver"
DEFAULT_STATION_NAME = "ADS-B station"

# What receiver.json holds when nothing expanded the placeholder. The dump1090
# fork that fr24feed ships serves it verbatim.
UNSET_RECEIVER_VERSION = "EB_VERSION"

CONF_AIRCRAFT_URL = "aircraft_url"
CONF_STATS_URL = "stats_url"
CONF_RECEIVER_FEATURES = "receiver_features"

# The eight compass sectors the range records are kept in. Each spans 45
# degrees centred on its own direction, so north runs from 337.5 to 22.5.
SECTORS: tuple[str, ...] = ("n", "ne", "e", "se", "s", "sw", "w", "nw")

# Optional things a receiver may report. Detected once during the config flow,
# so entities for data a decoder never sends are not created at all. Run
# Reconfigure after upgrading the decoder to pick them up.
FEATURE_GAIN = "gain"
# readsb puts these at the root of stats.json; the other decoders send neither.
FEATURE_AIRCRAFT_TYPES = "aircraft_types"
FEATURE_FREQUENCY_ERROR = "frequency_error"
# Position bookkeeping inside a window. The dump1090 fork of fr24feed has none.
FEATURE_POSITIONS = "positions"

# How readsb labels the way it came to know about an aircraft. Reporting all
# fourteen would be noise, so they are summed into the three that say something
# about your reception: heard directly, computed from timing, or bare Mode S.
AIRCRAFT_TYPE_GROUPS: dict[str, tuple[str, ...]] = {
    "adsb": ("adsb_icao", "adsb_icao_nt", "adsb_other"),
    "mlat": ("mlat",),
    "mode_s": ("mode_s",),
}

# The bits of readsb's dbFlags, which an aircraft database fills in and a
# decoder without one leaves out altogether. Military is the one that has an
# entity of its own; the other three say something about the aircraft that
# only a dashboard can decide what to do with.
DB_FLAG_MILITARY = 1
DB_FLAG_INTERESTING = 2
DB_FLAG_PIA = 4
DB_FLAG_LADD = 8

# Files that sit next to aircraft.json in the same data directory.
STATS_FILENAME = "stats.json"
RECEIVER_FILENAME = "receiver.json"

# Squawk codes that mean the crew is in trouble. dump1090-fa also reports an
# "emergency" field, but the fr24feed fork only gives us the raw squawk.
EMERGENCY_SQUAWKS: dict[str, str] = {
    "7500": "hijack",
    "7600": "radio_failure",
    "7700": "emergency",
}

DEFAULT_AIRCRAFT_PORT = 8080
DEFAULT_HTTP_PORT = 80

DEFAULT_SCAN_INTERVAL = 15
MIN_SCAN_INTERVAL = 5
MAX_SCAN_INTERVAL = 600

# How close an aircraft has to be to count as nearby, in kilometres. Ten is
# roughly the circle you can see and hear from, which is what makes it useful
# for automations; the range of a good receiver is many times that.
CONF_PROXIMITY_RADIUS = "proximity_radius"
DEFAULT_PROXIMITY_RADIUS = 10
MIN_PROXIMITY_RADIUS = 1
MAX_PROXIMITY_RADIUS = 500

# A ceiling on what counts as overhead, in feet. Empty by default, which is
# what every station had before there was one: the radius alone decides.
#
# It exists because a radius is a circle drawn on the ground, and an airliner
# at eleven kilometres is inside it while being nothing anyone would look up
# at. Where it applies is the whole of the point: what is nearby, what is
# overhead and what counts as a passage, and nothing else. The station's own
# figures are about reception rather than about your sky.
CONF_PROXIMITY_MAX_ALTITUDE = "proximity_max_altitude"
MAX_PROXIMITY_ALTITUDE = 60000

# Every aircraft inside that radius as its own entity on the map, for as long
# as it is there. Off unless it is asked for: it is another way of looking at
# data the sensors already carry rather than data of its own, and a map layer
# nobody opened is entities nobody reads.
CONF_MAP_AIRCRAFT = "map_aircraft"
DEFAULT_MAP_AIRCRAFT = False

# One aircraft crossing the sky above you, from the moment it comes inside the
# radius to the moment it leaves. An automation wants to hear about that once,
# so a passage fires an event of its own rather than leaving a template to work
# out what changed in a list of attributes.
EVENT_AIRCRAFT_PASSAGE = f"{DOMAIN}_aircraft_passage"

# How long an aircraft has to stay away before coming back counts as a second
# passage. Reception drops out, aircraft circle, and an aircraft flickering on
# the edge of the radius would otherwise ring the doorbell every poll.
PASSAGE_GAP = timedelta(minutes=10)

# A standing list of aircraft worth knowing about, one to a line. Unlike a
# passage this has no radius: the question is whether the aircraft is up
# there at all, however far away, so it is matched against everything the
# decoder is holding.
CONF_WATCHLIST = "watchlist"
EVENT_WATCHLIST_MATCH = f"{DOMAIN}_watchlist_match"

# What a line on that list can be, and how each is recognised. A hex code is
# six hexadecimal characters, a squawk is four digits, a type code is one the
# shipped table knows, and anything else carrying a letter is a name the
# aircraft flies under — a registration or a callsign, compared against both
# because PH-BXA is one, KLM123 the other, and N123AB could be either.
# Nothing is guessed from a line that fits none of them: the option refuses
# it and says which forms it knows.
WATCHLIST_HEX = "hex"
WATCHLIST_SQUAWK = "squawk"
WATCHLIST_TYPE = "aircraft_type"
WATCHLIST_NAME = "name"

# How many passages the board keeps. Long enough to be a record of the
# afternoon, short enough that writing the whole list to the database on every
# arrival stays cheap.
PASSAGE_BOARD_LENGTH = 20

# What an altitude in feet is in metres, for measuring the real distance to an
# aircraft rather than the distance to the ground beneath it.
FEET_TO_METRES = 0.3048
# And what an aircraft's ground speed is in metres per second, since every
# decoder reports it in knots.
KNOTS_TO_METRES_PER_SECOND = 0.514444
# How long a degree of latitude is. Good to a fraction of a percent, which is
# far better than a prediction built on a straight line deserves.
DEGREE_METRES = 111_320.0

# Everything about seeing an aircraft coming rather than reporting that it is
# here. All of it rests on one assumption — that the aircraft carries on in a
# straight line at the same speed — so the limits below are not tuning, they
# are what keeps a guess from being announced as a fact.
EVENT_AIRCRAFT_APPROACHING = f"{DOMAIN}_aircraft_approaching"
# How far ahead a prediction is worth making. Beyond a few minutes an
# aircraft has had time to turn, descend or be told to hold, and a straight
# line says nothing about any of that.
APPROACH_HORIZON = timedelta(minutes=5)
# How many polls in a row have to agree before anything is announced. One
# mis-decoded heading is enough to point an aircraft at your house for a
# single poll; two in a row is not.
APPROACH_POLLS = 2

# How far an aircraft at a given height can possibly be heard from, and the
# room left over for the antenna being up a hill.
#
# ADS-B is line of sight, so the horizon is the limit: about 1.23 nautical
# miles times the square root of the height in feet, which is this many metres
# times that square root. An aircraft at 37,000 feet reaches roughly 438 km,
# and one at 2,000 feet roughly 102 km. The allowance is what a receiver adds
# by standing high, and 80 km of it covers a site 350 metres above everything
# around it, which is more than any rooftop.
#
# This is not a limit on what the integration reports. It is a limit on what a
# position has to satisfy to be believed at all: a mis-decoded position lands
# somewhere impossible, and a sector record only ever grows, so one of those
# would stand for good.
RADIO_HORIZON_METRES_PER_ROOT_FOOT = 2278.0
RADIO_HORIZON_ALLOWANCE = 80_000
# And a ceiling for aircraft that report no height at all. Nothing on earth
# has heard an aircraft from this far, so a position beyond it is not one.
MAX_PLAUSIBLE_RANGE = 700_000

# What every decoder puts in the altitude field of an aircraft that is on the
# ground. It is a string where a number belongs, which is the only way an
# aircraft says it is not flying.
GROUND_ALTITUDE = "ground"

# How often to ask for receiver.json before accepting that it will not answer.
# What it holds cannot change while the decoder runs, so one answer settles it
# for good; a request that fails is not an answer, and letting a single timeout
# decide that every range is measured from the wrong place would be both silent
# and permanent.
RECEIVER_READ_ATTEMPTS = 5

# Where a flight came from and where it is going. This is the one thing that
# cannot come off your own network: no ADS-B message carries a route. An
# aircraft broadcasts its callsign and nothing more, so the only way to know
# is to ask someone who keeps a database of flight numbers. That is a request
# leaving your network, which is why it is off unless you ask for it.
CONF_LOOK_UP_ROUTES = "look_up_routes"
DEFAULT_LOOK_UP_ROUTES = False

# adsb.lol serves the same API but currently answers empty, so the default
# points at the host tar1090 itself defaults to.
ROUTESET_URL = "https://adsb.im/api/0/routeset"
# What that endpoint accepts in one request.
ROUTESET_MAX_PLANES = 100

# A flight number keeps its route for the day, so an answer is worth holding
# on to; over a whole day the same few airliners pass overhead again and
# again. A callsign that resolves to nothing is remembered for less time,
# because that is as likely to be a database that has not caught up yet.
ROUTE_CACHE_TTL = timedelta(hours=12)
ROUTE_MISS_CACHE_TTL = timedelta(hours=1)
# Enough for every airliner a station sees in a day, and small enough that a
# stream of unknown callsigns cannot grow it without bound.
ROUTE_CACHE_MAX_ENTRIES = 512
# A ceiling on what one poll may ask, so a wide radius over a busy airport
# cannot turn into a burst of requests at somebody else's expense.
ROUTE_MAX_LOOKUPS_PER_POLL = 25

# Where aircraft.json lives on the common receiver images, in the order we
# prefer them. fr24feed ships its own dump1090 on port 8080 under /dump1090;
# readsb with tar1090 puts it behind the normal web server on port 80, which is
# where you end up after upgrading the decoder.
AIRCRAFT_URL_CANDIDATES: tuple[tuple[int, str], ...] = (
    (DEFAULT_AIRCRAFT_PORT, "/dump1090/data/aircraft.json"),
    (DEFAULT_AIRCRAFT_PORT, "/data/aircraft.json"),
    (DEFAULT_AIRCRAFT_PORT, "/tar1090/data/aircraft.json"),
    (DEFAULT_HTTP_PORT, "/tar1090/data/aircraft.json"),
    (DEFAULT_HTTP_PORT, "/data/aircraft.json"),
    (DEFAULT_AIRCRAFT_PORT, "/skyaware/data/aircraft.json"),
    (DEFAULT_AIRCRAFT_PORT, "/dump1090-fa/data/aircraft.json"),
    (DEFAULT_HTTP_PORT, "/skyaware/data/aircraft.json"),
    (DEFAULT_HTTP_PORT, "/dump1090-fa/data/aircraft.json"),
)
