"""What the station sounds like when it answers out loud.

Spoken text is not entity text. An entity says `KLM1234` and `n` and `2000`,
which a screen reads at a glance and a speaker turns into noise: a callsign
read as a word, a compass sector read as a letter, a height read as a bare
number in a unit nobody said. So the answers live here rather than in
`strings.json`, which holds what Home Assistant shows, and rather than
scattered through the handlers, where a sentence would be assembled in three
places and translated in none.

Two languages, and English for anything else. Not because the other thirty
are unwelcome, but because a sentence that has to sound natural cannot be
machine translated and left at that; the tables are laid out so adding one is
adding a key, not restructuring anything.
"""

from __future__ import annotations

from typing import Final

from homeassistant.util.unit_system import US_CUSTOMARY_SYSTEM, UnitSystem

from .const import FEET_TO_METRES
from .coordinator import AircraftSummary
from .reference import designator_of

DEFAULT_LANGUAGE: Final = "en"

# Which way to look, in words rather than in the letters an entity uses.
SECTORS: Final[dict[str, dict[str, str]]] = {
    "en": {
        "n": "north",
        "ne": "north-east",
        "e": "east",
        "se": "south-east",
        "s": "south",
        "sw": "south-west",
        "w": "west",
        "nw": "north-west",
    },
    "nl": {
        "n": "noorden",
        "ne": "noordoosten",
        "e": "oosten",
        "se": "zuidoosten",
        "s": "zuiden",
        "sw": "zuidwesten",
        "w": "westen",
        "nw": "noordwesten",
    },
}

PHRASES: Final[dict[str, dict[str, str]]] = {
    "en": {
        "no_station": "I cannot reach your ADS-B station.",
        "nothing_overhead": "Nothing is overhead right now.",
        "overhead": "{aircraft} is overhead, {altitude}.",
        "nothing_nearby": "Nothing is nearby, and the station is hearing {heard}.",
        "count": "{nearby} nearby, and the station is hearing {heard} in all.",
        "closest": "{aircraft} is {distance} to the {sector}, {altitude}.",
        "nothing_matching": "I hear nothing like that.",
        "matching": "{aircraft}, {distance} to the {sector}.",
        "and_more": "{first} And {count} more.",
        "no_route": "I have no route for {aircraft}.",
        "route": "{aircraft} is flying from {origin} to {destination}.",
        "routes_off": (
            "Route lookups are switched off, so I only know what is up there, "
            "not where it is going."
        ),
        "one_aircraft": "one aircraft",
        "n_aircraft": "{count} aircraft",
        "no_aircraft": "no aircraft",
        "flight_of": "{airline} {number}",
        "unknown_aircraft": "an aircraft",
        "metres": "{value} metres up",
        "feet": "{value} feet up",
        "kilometres": "{value} kilometres",
        "miles": "{value} miles",
        "no_altitude": "at a height it does not report",
    },
    "nl": {
        "no_station": "Ik kan je ADS-B-station niet bereiken.",
        "nothing_overhead": "Er hangt nu niets boven je.",
        "overhead": "{aircraft} vliegt over, {altitude}.",
        "nothing_nearby": "Er is niets dichtbij, en het station hoort {heard}.",
        "count": "{nearby} dichtbij, en het station hoort er {heard} in totaal.",
        "closest": "{aircraft} zit {distance} naar het {sector}, {altitude}.",
        "nothing_matching": "Ik hoor niets van dat soort.",
        "matching": "{aircraft}, {distance} naar het {sector}.",
        "and_more": "{first} En nog {count}.",
        "no_route": "Ik heb geen route voor {aircraft}.",
        "route": "{aircraft} vliegt van {origin} naar {destination}.",
        "routes_off": (
            "Het opzoeken van routes staat uit, dus ik weet alleen wat er "
            "hangt, niet waar het heen gaat."
        ),
        "one_aircraft": "één vliegtuig",
        "n_aircraft": "{count} vliegtuigen",
        "no_aircraft": "geen vliegtuigen",
        "flight_of": "{airline} {number}",
        "unknown_aircraft": "een vliegtuig",
        "metres": "{value} meter hoog",
        "feet": "{value} voet hoog",
        "kilometres": "{value} kilometer",
        "miles": "{value} mijl",
        "no_altitude": "op een hoogte die hij niet meldt",
    },
}

# A callsign is read out as characters, so the letters have to be separated or
# a speaker says "klum". The digits are left as they are: "one two three" is
# what a reader does to a flight number nobody calls that.
_SPELL: Final = " "

# How each language groups the thousands. It matters more than it looks: a
# Dutch reader takes "3,700" for three point seven, which is a different
# height by three orders of magnitude.
_THOUSANDS: Final[dict[str, str]] = {"en": ",", "nl": "."}
# Both languages write a decimal point the other way round as well.
_DECIMAL: Final[dict[str, str]] = {"en": ".", "nl": ","}


def language_of(language: str | None) -> str:
    """Return which of our languages to answer in.

    Home Assistant hands over anything from `nl` to `en-GB`, and the part
    before the dash is the language. Anything we have no table for is
    answered in English, which is worse than silence in no case.
    """
    if language is None:
        return DEFAULT_LANGUAGE
    code = language.replace("_", "-").split("-", 1)[0].lower()
    return code if code in PHRASES else DEFAULT_LANGUAGE


def say(language: str, key: str, **values: object) -> str:
    """Return one phrase, filled in."""
    return PHRASES[language][key].format(**values)


def whole(value: float, language: str) -> str:
    """Return a whole number written the way the language writes it."""
    return f"{round(value):,}".replace(",", _THOUSANDS[language])


def rounded(value: float, language: str) -> str:
    """Return a number with one decimal, without a trailing nought."""
    text = f"{value:.1f}".rstrip("0").rstrip(".")
    return text.replace(".", _DECIMAL[language])


def name_of(summary: AircraftSummary, language: str) -> str:
    """Return what to call this aircraft out loud.

    An airliner is its airline and its flight number, which is how it is
    announced everywhere else. Anything else is read out character by
    character, because a registration is not a word and a hex code is even
    less of one.
    """
    flight = None if summary.flight is None else summary.flight.strip().upper()
    if flight:
        designator = designator_of(flight)
        if designator is not None and summary.airline is not None:
            return say(
                language,
                "flight_of",
                airline=summary.airline,
                number=flight[len(designator) :].lstrip("0") or flight,
            )
        return _SPELL.join(flight)
    if summary.registration is not None:
        return _SPELL.join(summary.registration.upper().replace("-", ""))
    if summary.hex:
        return _SPELL.join(summary.hex.upper())
    return say(language, "unknown_aircraft")


def altitude_of(
    summary: AircraftSummary, language: str, units: UnitSystem
) -> str:
    """Return how high an aircraft is, in whole units of the right kind."""
    if summary.altitude is None:
        return say(language, "no_altitude")
    if units is US_CUSTOMARY_SYSTEM:
        # To the nearest five hundred feet and hundred metres. Nobody asking
        # out loud wants to hear that something is at 30,175 feet.
        return say(
            language, "feet", value=whole(round(summary.altitude / 500) * 500, language)
        )
    metres = summary.altitude * FEET_TO_METRES
    return say(language, "metres", value=whole(round(metres / 100) * 100, language))


def distance_of(metres: float, language: str, units: UnitSystem) -> str:
    """Return how far away something is, rounded to something sayable."""
    if units is US_CUSTOMARY_SYSTEM:
        return say(language, "miles", value=rounded(metres / 1609.344, language))
    return say(language, "kilometres", value=rounded(metres / 1000, language))


def sector_word(sector: str | None, language: str) -> str | None:
    """Return a compass sector as the word for it."""
    return None if sector is None else SECTORS[language].get(sector)


def counted(count: int, language: str) -> str:
    """Return an aircraft count, with the words a count needs around it."""
    if count == 0:
        return say(language, "no_aircraft")
    if count == 1:
        return say(language, "one_aircraft")
    return say(language, "n_aircraft", count=count)
