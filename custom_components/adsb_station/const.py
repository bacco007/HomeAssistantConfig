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

# Where a flight came from and where it is going. This is the one thing that
# cannot come off your own network: no ADS-B message carries a route. An
# aircraft broadcasts its callsign and nothing more, so the only way to know
# is to ask someone who keeps a database of flight numbers. That is a request
# leaving your network, which is why it is off unless you ask for it.
CONF_ROUTE_SOURCE = "route_source"
ROUTE_SOURCE_NONE = "none"
# adsbdb.com. One request per callsign, and it names the airline as well.
ROUTE_SOURCE_ADSBDB = "adsbdb"
# The routeset API tar1090 itself uses. Asks about every callsign at once, and
# judges from the position whether the route it found fits the aircraft.
ROUTE_SOURCE_ROUTESET = "routeset"
ROUTE_SOURCES: tuple[str, ...] = (
    ROUTE_SOURCE_NONE,
    ROUTE_SOURCE_ADSBDB,
    ROUTE_SOURCE_ROUTESET,
)
DEFAULT_ROUTE_SOURCE = ROUTE_SOURCE_NONE

ADSBDB_URL = "https://api.adsbdb.com/v0/callsign/{callsign}"
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
