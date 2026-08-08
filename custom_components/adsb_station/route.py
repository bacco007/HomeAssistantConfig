"""Where a flight came from and where it is going.

Nothing an aircraft broadcasts says this. Mode S and ADS-B carry the callsign
and nothing else about the flight, so `KLM1234` is all that reaches the
antenna: the route behind that number lives in a database on the ground. Every
map that shows you a route, tar1090 included, asks someone else for it.

That makes this the one part of the integration that leaves your network, and
it is why it stays off until you pick a source. Two are on offer, and they do
not always agree with each other, which is a fair warning about how certain
any of this is:

* adsbdb.com answers about one callsign at a time and names the airline too.
* routeset is what tar1090 uses. It takes every callsign in one request, and
  because it is given the position as well it can say whether the route it
  found actually fits an aircraft seen there.

Only the aircraft inside your radius are ever looked up, and answers are kept
for the day, so a station watching a busy sky still asks a handful of
questions an hour rather than one per aircraft per poll.
"""

from __future__ import annotations

import asyncio
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
import logging
from typing import Any

import aiohttp
from homeassistant.util import dt as dt_util

from .const import (
    ADSBDB_URL,
    ROUTE_CACHE_MAX_ENTRIES,
    ROUTE_CACHE_TTL,
    ROUTE_MAX_LOOKUPS_PER_POLL,
    ROUTE_MISS_CACHE_TTL,
    ROUTE_SOURCE_ADSBDB,
    ROUTE_SOURCE_ROUTESET,
    ROUTESET_MAX_PLANES,
    ROUTESET_URL,
)

_LOGGER = logging.getLogger(__name__)

# A route lookup is a courtesy from someone else's server and never worth
# holding up a poll for, so it gets less patience than the receiver does.
TIMEOUT = 8


@dataclass(frozen=True, kw_only=True)
class Airport:
    """One end of a route."""

    iata: str | None
    icao: str | None
    name: str | None
    # The city the airport serves, which is what a notification wants to say.
    location: str | None

    @property
    def code(self) -> str | None:
        """Return the short code to show, preferring the one people know."""
        return self.iata or self.icao


@dataclass(frozen=True, kw_only=True)
class FlightRoute:
    """Where a callsign is flying from and to."""

    origin: Airport | None
    destination: Airport | None
    airline: str | None = None

    @property
    def label(self) -> str | None:
        """Return the route as one string, or None if neither end is known."""
        first = None if self.origin is None else self.origin.code
        last = None if self.destination is None else self.destination.code
        if first is None and last is None:
            return None
        return f"{first or '?'}-{last or '?'}"


@dataclass(frozen=True, kw_only=True)
class FlightPosition:
    """A callsign, and where it was heard.

    The position is what lets routeset tell a real match from a flight number
    that is reused elsewhere in the world.
    """

    callsign: str
    latitude: float | None = None
    longitude: float | None = None


@dataclass(frozen=True, kw_only=True)
class _CachedRoute:
    """What we last learned about a callsign, and until when to believe it."""

    route: FlightRoute | None
    expires: datetime


@dataclass(frozen=True, kw_only=True)
class _Answers:
    """What a source said when asked about a handful of callsigns."""

    routes: dict[str, FlightRoute]
    # The ones it could not be asked about at all. There is a difference
    # between a database saying it has never heard of a flight and a server
    # that is down, and only the first is worth remembering: holding an
    # outage against a callsign would keep the route missing long after the
    # source came back.
    unanswered: frozenset[str] = frozenset()


def _text(value: Any) -> str | None:
    """Return a non-empty string, or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


class RouteLookup:
    """Resolves callsigns to routes, remembering what it has been told."""

    source: str

    def __init__(self, session: aiohttp.ClientSession) -> None:
        """Initialize the lookup."""
        self._session = session
        self._cache: dict[str, _CachedRoute] = {}

    async def async_resolve(
        self, flights: Sequence[FlightPosition]
    ) -> dict[str, FlightRoute]:
        """Return the route of every callsign we know, asking about the rest.

        Never raises: a route is a nicety, and losing it must not cost you the
        aircraft entities that do come off your own receiver.
        """
        now = dt_util.utcnow()
        self._drop_expired(now)

        known: dict[str, FlightRoute] = {}
        pending: dict[str, FlightPosition] = {}
        for flight in flights:
            if (cached := self._cache.get(flight.callsign)) is not None:
                if cached.route is not None:
                    known[flight.callsign] = cached.route
            else:
                pending.setdefault(flight.callsign, flight)

        if not pending:
            return known

        asking = list(pending.values())[:ROUTE_MAX_LOOKUPS_PER_POLL]
        if len(asking) < len(pending):
            _LOGGER.debug(
                "Asking %s about %d of %d new callsigns this poll; the rest "
                "wait for the next one",
                self.source,
                len(asking),
                len(pending),
            )

        try:
            answers = await self._async_fetch(asking)
        except (TimeoutError, aiohttp.ClientError, ValueError) as err:
            # Nothing is cached on a failure, so the next poll tries again.
            _LOGGER.debug("Could not reach %s for a route: %s", self.source, err)
            return known

        for flight in asking:
            if flight.callsign in answers.unanswered:
                continue
            route = answers.routes.get(flight.callsign)
            self._remember(flight.callsign, route, now)
            if route is not None:
                known[flight.callsign] = route
        return known

    async def _async_fetch(self, flights: Sequence[FlightPosition]) -> _Answers:
        """Ask the source about callsigns we have not resolved before."""
        raise NotImplementedError

    def _drop_expired(self, now: datetime) -> None:
        """Forget what we are no longer entitled to believe."""
        for callsign in [
            callsign
            for callsign, cached in self._cache.items()
            if cached.expires <= now
        ]:
            del self._cache[callsign]

    def _remember(
        self, callsign: str, route: FlightRoute | None, now: datetime
    ) -> None:
        """Hold on to an answer, including the answer that there is none."""
        while len(self._cache) >= ROUTE_CACHE_MAX_ENTRIES:
            # Insertion order, so this is the answer we have held longest.
            del self._cache[next(iter(self._cache))]
        ttl = ROUTE_CACHE_TTL if route is not None else ROUTE_MISS_CACHE_TTL
        self._cache[callsign] = _CachedRoute(route=route, expires=now + ttl)

    async def _async_get_json(self, url: str) -> Any:
        """GET a document, or None if the source will not say."""
        async with asyncio.timeout(TIMEOUT):
            response = await self._session.get(url)
            if response.status == 404:
                # A callsign the database has never seen, which is an answer.
                return None
            response.raise_for_status()
            return await response.json(content_type=None)


class AdsbdbLookup(RouteLookup):
    """Resolves routes through adsbdb.com, one callsign per request."""

    source = ROUTE_SOURCE_ADSBDB

    async def _async_fetch(self, flights: Sequence[FlightPosition]) -> _Answers:
        """Ask about each callsign, letting the ones that fail fall away."""
        answers = await asyncio.gather(
            *(self._async_one(flight.callsign) for flight in flights),
            return_exceptions=True,
        )
        routes: dict[str, FlightRoute] = {}
        unanswered: set[str] = set()
        for flight, answer in zip(flights, answers, strict=True):
            if isinstance(answer, BaseException):
                _LOGGER.debug(
                    "adsbdb could not be asked about %s: %s", flight.callsign, answer
                )
                unanswered.add(flight.callsign)
            elif answer is not None:
                routes[flight.callsign] = answer
        return _Answers(routes=routes, unanswered=frozenset(unanswered))

    async def _async_one(self, callsign: str) -> FlightRoute | None:
        """Return what adsbdb knows about one callsign."""
        payload = await self._async_get_json(ADSBDB_URL.format(callsign=callsign))
        if not isinstance(payload, dict):
            return None
        response = payload.get("response")
        # An unknown callsign comes back as the string "unknown callsign".
        if not isinstance(response, dict):
            return None
        flightroute = response.get("flightroute")
        if not isinstance(flightroute, dict):
            return None

        airline = flightroute.get("airline")
        return FlightRoute(
            origin=_adsbdb_airport(flightroute.get("origin")),
            destination=_adsbdb_airport(flightroute.get("destination")),
            airline=_text(airline.get("name")) if isinstance(airline, dict) else None,
        )


class RoutesetLookup(RouteLookup):
    """Resolves routes through the routeset API that tar1090 uses."""

    source = ROUTE_SOURCE_ROUTESET

    async def _async_fetch(self, flights: Sequence[FlightPosition]) -> _Answers:
        """Ask about every callsign at once, in batches the API accepts.

        A batch that fails takes the whole answer with it, which costs only a
        poll: nothing is remembered, so the next one asks again.
        """
        routes: dict[str, FlightRoute] = {}
        for start in range(0, len(flights), ROUTESET_MAX_PLANES):
            batch = flights[start : start + ROUTESET_MAX_PLANES]
            routes.update(await self._async_batch(batch))
        return _Answers(routes=routes)

    async def _async_batch(
        self, flights: Sequence[FlightPosition]
    ) -> dict[str, FlightRoute]:
        """Ask about one batch of callsigns."""
        planes = [
            {
                "callsign": flight.callsign,
                # The API insists on a position; the middle of nowhere is a
                # fair stand-in for an aircraft that broadcast none, and only
                # costs us the plausibility check.
                "lat": flight.latitude or 0.0,
                "lng": flight.longitude or 0.0,
            }
            for flight in flights
        ]
        async with asyncio.timeout(TIMEOUT):
            response = await self._session.post(ROUTESET_URL, json={"planes": planes})
            response.raise_for_status()
            payload = await response.json(content_type=None)

        if not isinstance(payload, list):
            _LOGGER.debug("routeset answered with %s rather than a list", type(payload))
            return {}

        routes: dict[str, FlightRoute] = {}
        for item in payload:
            if not isinstance(item, dict):
                continue
            callsign = _text(item.get("callsign"))
            if callsign is None:
                continue
            if (route := _routeset_route(item)) is not None:
                routes[callsign] = route
        return routes


def _adsbdb_airport(payload: Any) -> Airport | None:
    """Read one end of an adsbdb route."""
    if not isinstance(payload, dict):
        return None
    return Airport(
        iata=_text(payload.get("iata_code")),
        icao=_text(payload.get("icao_code")),
        name=_text(payload.get("name")),
        location=_text(payload.get("municipality")),
    )


def _routeset_route(item: dict[str, Any]) -> FlightRoute | None:
    """Read one entry of a routeset answer."""
    # The API says so itself when it has nothing, and says so again by judging
    # the route it found too far from where the aircraft actually is. A wrong
    # route on a notification is worse than no route at all.
    if _text(item.get("airport_codes")) in (None, "unknown"):
        return None
    if item.get("plausible") is False:
        _LOGGER.debug(
            "routeset does not believe %s is on %s from where it was heard",
            item.get("callsign"),
            item.get("airport_codes"),
        )
        return None

    airports = [
        _routeset_airport(airport)
        for airport in item.get("_airports", [])
        if isinstance(airport, dict)
    ]
    if not airports:
        return None
    # A flight with a stop on the way lists every leg. The two ends are what
    # a route means to someone watching one of the legs go over.
    return FlightRoute(
        origin=airports[0],
        destination=airports[-1] if len(airports) > 1 else None,
        airline=_text(item.get("airline_code")),
    )


def _routeset_airport(payload: dict[str, Any]) -> Airport:
    """Read one airport of a routeset answer."""
    return Airport(
        iata=_text(payload.get("iata")),
        icao=_text(payload.get("icao")),
        name=_text(payload.get("name")),
        location=_text(payload.get("location")),
    )


LOOKUPS: dict[str, type[RouteLookup]] = {
    ROUTE_SOURCE_ADSBDB: AdsbdbLookup,
    ROUTE_SOURCE_ROUTESET: RoutesetLookup,
}


def build_route_lookup(
    session: aiohttp.ClientSession, source: str
) -> RouteLookup | None:
    """Return the lookup for a source, or None when routes are switched off."""
    if (lookup := LOOKUPS.get(source)) is None:
        return None
    return lookup(session)


def route_attributes(route: FlightRoute | None) -> dict[str, Any]:
    """Describe a route for the attributes of an aircraft.

    Absent where unknown: an empty attribute reads as though the aircraft is
    going nowhere, and a template can ask whether the key is there at all.
    """
    if route is None:
        return {}
    attributes: dict[str, Any] = {}
    if (label := route.label) is not None:
        attributes["route"] = label
    for key, airport in (("origin", route.origin), ("destination", route.destination)):
        if airport is None:
            continue
        if (code := airport.code) is not None:
            attributes[key] = code
        if airport.location is not None:
            attributes[f"{key}_location"] = airport.location
        if airport.name is not None:
            attributes[f"{key}_name"] = airport.name
    if route.airline is not None:
        attributes["airline"] = route.airline
    return attributes
