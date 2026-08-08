"""Where a flight came from and where it is going.

Nothing an aircraft broadcasts says this. Mode S and ADS-B carry the callsign
and nothing else about the flight, so `KLM1234` is all that reaches the
antenna: the route behind that number lives in a database on the ground. Every
map that shows you a route, tar1090 included, asks someone else for it.

That makes this the one part of the integration that leaves your network, and
it is why it stays off until you switch it on. The source is routeset, which
is what tar1090 itself uses: it takes every callsign in one request, and
because it is given the position as well it can say whether the route it found
actually fits an aircraft seen there.

That last part is what makes it worth trusting. A modern airline callsign is
reused over the legs of a day, so a database keyed on the flight number alone
answers with whichever leg it has on file, and half the time that is the one
the aircraft has just flown. Measured against the track the aircraft is
broadcasting, routeset points the right way for 99 of every 100 answers.

The answer names the airline as well and it is not read. That name follows
from the callsign, which means a table on your own disk can give it for every
flight rather than for the ones a source happens to know.

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
    ROUTE_CACHE_MAX_ENTRIES,
    ROUTE_CACHE_TTL,
    ROUTE_MAX_LOOKUPS_PER_POLL,
    ROUTE_MISS_CACHE_TTL,
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


def _text(value: Any) -> str | None:
    """Return a non-empty string, or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


class RouteLookup:
    """Resolves callsigns to routes, remembering what it has been told."""

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
                "Asking about %d of %d new callsigns this poll; the rest wait "
                "for the next one",
                len(asking),
                len(pending),
            )

        try:
            answers = await self._async_fetch(asking)
        except (TimeoutError, aiohttp.ClientError, ValueError) as err:
            # Nothing is cached on a failure, so the next poll tries again.
            _LOGGER.debug("Could not reach routeset for a route: %s", err)
            return known

        for flight in asking:
            route = answers.get(flight.callsign)
            self._remember(flight.callsign, route, now)
            if route is not None:
                known[flight.callsign] = route
        return known

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

    async def _async_fetch(
        self, flights: Sequence[FlightPosition]
    ) -> dict[str, FlightRoute]:
        """Ask about every callsign at once, in batches the API accepts.

        A batch that fails takes the whole answer with it, which costs only a
        poll: nothing is remembered, so the next one asks again.
        """
        routes: dict[str, FlightRoute] = {}
        for start in range(0, len(flights), ROUTESET_MAX_PLANES):
            batch = flights[start : start + ROUTESET_MAX_PLANES]
            routes.update(await self._async_batch(batch))
        return routes

    async def _async_batch(
        self, flights: Sequence[FlightPosition]
    ) -> dict[str, FlightRoute]:
        """Ask about one batch of callsigns."""
        planes = [
            {
                "callsign": flight.callsign,
                # The API insists on a position and judges the route against
                # it, so an aircraft that broadcast none gets every route it
                # finds thrown out as implausible rather than merely going
                # unchecked. Only aircraft with a position are ever asked
                # about, so this stands in for nothing in practice.
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
    # No airline: routeset answers with the designator it read off the front
    # of the callsign, which is the same three letters we read there ourselves
    # and can put a name to. A code where a name belongs is worse than either.
    return FlightRoute(
        origin=airports[0],
        destination=airports[-1] if len(airports) > 1 else None,
    )


def _routeset_airport(payload: dict[str, Any]) -> Airport:
    """Read one airport of a routeset answer."""
    return Airport(
        iata=_text(payload.get("iata")),
        icao=_text(payload.get("icao")),
        name=_text(payload.get("name")),
        location=_text(payload.get("location")),
    )


def build_route_lookup(
    session: aiohttp.ClientSession, enabled: bool
) -> RouteLookup | None:
    """Return a lookup, or None when routes are switched off."""
    return RouteLookup(session) if enabled else None


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
    return attributes
