"""What you can ask out loud, for the ADS-B Station integration.

"What is flying over?" is the question the whole receiver was put on the roof
for, and it is a better question to ask a room than to look up on a dashboard:
you ask it while looking out of the window.

Five of them, answered out of the last poll. The names come from the tables
this integration already ships, so the answer is "KLM flight 1234" rather than
"kilo lima mike one two three four", and it is spoken without a single request
leaving your network — which is the difference between this and asking a
speaker in the corner what is overhead.

The sentences that reach these handlers are not here. Home Assistant reads
those out of your configuration directory alone, so they ship as files and are
put there by you or by `adsb_station.install_sentences`.
"""

from __future__ import annotations

from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv, intent
from homeassistant.util.unit_system import UnitSystem

from .coordinator import (
    AdsbStationDataUpdateCoordinator,
    AircraftStats,
    AircraftSummary,
    receivers,
    sector_from,
)
from .speech import (
    altitude_of,
    counted,
    distance_of,
    language_of,
    name_of,
    say,
    sector_word,
)

INTENT_OVERHEAD: Final = "AdsbStationOverhead"
INTENT_COUNT: Final = "AdsbStationCount"
INTENT_CLOSEST: Final = "AdsbStationClosest"
INTENT_TRAFFIC: Final = "AdsbStationTraffic"
INTENT_ROUTE: Final = "AdsbStationRoute"

# What the traffic question can ask for, and how each is recognised. Military
# is a marker on the aircraft; the other two are emitter categories it
# broadcasts, which is the only thing that tells them apart at all.
TRAFFIC_KINDS: Final[dict[str, str | None]] = {
    "military": None,
    "helicopter": "A7",
    "drone": "B6",
}

# How many matching aircraft to name before counting the rest. One sentence
# is an answer; five is a list nobody can follow by ear.
_SPOKEN_MATCHES: Final = 1


class _AdsbStationIntent(intent.IntentHandler):
    """Shared ground: find the station, pick the language, say one thing.

    Every one of these answers out of a single station. Two receivers is rare
    enough that asking which one out loud would cost every other setup a
    question, so the first by name answers and the services are there for
    anyone who needs to be exact about it.
    """

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        """Answer, in the language the question was asked in."""
        language = language_of(intent_obj.language)
        response = intent_obj.create_response()

        stations = receivers(intent_obj.hass)
        if not stations:
            response.async_set_speech(say(language, "no_station"))
            return response

        coordinator, aircraft = stations[0]
        response.async_set_speech(
            self.answer(
                coordinator,
                aircraft,
                language,
                intent_obj.hass.config.units,
                intent_obj.slots,
            )
        )
        return response

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Return the sentence to speak."""
        raise NotImplementedError

    def placed(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        summary: AircraftSummary,
        language: str,
        units: UnitSystem,
    ) -> dict[str, str]:
        """Return how far away and which way an aircraft is, in words."""
        sector = sector_word(
            sector_from(coordinator.origin, summary.position), language
        )
        return {
            "aircraft": name_of(summary, language),
            "distance": (
                "" if summary.distance is None
                else distance_of(summary.distance, language, units)
            ),
            "sector": sector or "",
            "altitude": altitude_of(summary, language, units),
        }


class OverheadIntent(_AdsbStationIntent):
    """What is over the house right now."""

    intent_type = INTENT_OVERHEAD
    description = "Says which aircraft is overhead right now, if any"

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Answer with the aircraft that is overhead, or with silence."""
        if (passage := coordinator.overhead) is None:
            return say(language, "nothing_overhead")
        spoken = self.placed(coordinator, passage.current, language, units)
        return say(
            language,
            "overhead",
            aircraft=spoken["aircraft"],
            altitude=spoken["altitude"],
        )


class CountIntent(_AdsbStationIntent):
    """How much is up there."""

    intent_type = INTENT_COUNT
    description = "Says how many aircraft are nearby and how many the station hears"

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Answer with both figures, because either alone reads as the whole sky."""
        heard = counted(aircraft.total, language)
        if not aircraft.nearby:
            return say(language, "nothing_nearby", heard=heard)
        return say(
            language,
            "count",
            nearby=counted(len(aircraft.nearby), language),
            heard=aircraft.total,
        )


class ClosestIntent(_AdsbStationIntent):
    """What is nearest, whether or not it is overhead."""

    intent_type = INTENT_CLOSEST
    description = "Says which aircraft is closest, how far away and in which direction"

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Answer with the nearest aircraft that has a position."""
        if (closest := aircraft.closest) is None:
            return say(language, "nothing_overhead")
        spoken = self.placed(coordinator, closest, language, units)
        return say(language, "closest", **spoken)


class TrafficIntent(_AdsbStationIntent):
    """Military traffic, helicopters or drones."""

    intent_type = INTENT_TRAFFIC
    description = "Says whether military traffic, helicopters or drones are in range"

    @property
    def slot_schema(self) -> dict[Any, Any]:
        """Return what the sentence has to name."""
        return {"kind": cv.string}

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Answer with the nearest one of its kind, and how many others."""
        kind = str(slots.get("kind", {}).get("value", "")).strip().lower()
        if kind not in TRAFFIC_KINDS:
            # The sentence file only ever sends the three, but a spoken slot
            # is text from outside and "military" is what a missing one would
            # otherwise fall through to.
            return say(language, "nothing_matching")
        category = TRAFFIC_KINDS[kind]

        matching = [
            summary
            for summary in aircraft.heard
            if (summary.military if category is None else summary.category == category)
        ]
        if not matching:
            return say(language, "nothing_matching")

        # Nearest first, and the ones we cannot place last: an aircraft with
        # no position can be named but not pointed at.
        matching.sort(key=lambda item: (item.distance is None, item.distance or 0))
        spoken = self.placed(coordinator, matching[0], language, units)
        first = say(language, "matching", **spoken)
        if len(matching) <= _SPOKEN_MATCHES:
            return first
        return say(
            language, "and_more", first=first, count=len(matching) - _SPOKEN_MATCHES
        )


class RouteIntent(_AdsbStationIntent):
    """Where the aircraft overhead came from and is going."""

    intent_type = INTENT_ROUTE
    description = "Says where the aircraft overhead is flying from and to"

    def answer(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        aircraft: AircraftStats,
        language: str,
        units: UnitSystem,
        slots: dict[str, Any],
    ) -> str:
        """Answer with the route, or with why there is not one."""
        if (passage := coordinator.overhead) is None:
            return say(language, "nothing_overhead")

        summary = passage.current
        spoken = name_of(summary, language)
        if coordinator.route_lookup is None:
            # Worth saying out loud rather than answering "I don't know": the
            # setting is off by default, and nothing on the dashboard says so.
            return say(language, "routes_off")
        if (route := summary.route) is None:
            return say(language, "no_route", aircraft=spoken)

        origin = _place(route.origin)
        destination = _place(route.destination)
        if origin is None or destination is None:
            return say(language, "no_route", aircraft=spoken)
        return say(
            language, "route", aircraft=spoken, origin=origin, destination=destination
        )


def _place(airport: Any) -> str | None:
    """Return what to call one end of a route out loud.

    The city, because that is what somebody asking means. An airport code
    read aloud is three letters and no answer at all.
    """
    if airport is None:
        return None
    return airport.location or airport.name or airport.code


# The five questions, under the short names a service takes. Home Assistant
# reads sentences out of the configuration directory alone, so the intents
# above are only reachable once two files have been copied there. These same
# answers are reachable without copying anything, through a sentence trigger
# in an automation, and that is what the names are for.
QUESTIONS: Final[dict[str, _AdsbStationIntent]] = {
    "overhead": OverheadIntent(),
    "count": CountIntent(),
    "closest": ClosestIntent(),
    "traffic": TrafficIntent(),
    "route": RouteIntent(),
}


def answer_question(
    question: str,
    coordinator: AdsbStationDataUpdateCoordinator,
    aircraft: AircraftStats,
    language: str,
    units: UnitSystem,
    kind: str | None = None,
) -> str:
    """Return the spoken answer to one question, without an intent around it."""
    slots = {} if kind is None else {"kind": {"value": kind}}
    return QUESTIONS[question].answer(coordinator, aircraft, language, units, slots)


@callback
def async_setup_intents(hass: HomeAssistant) -> None:
    """Register what can be asked out loud, once for the integration."""
    for handler in QUESTIONS.values():
        intent.async_register(hass, handler)
