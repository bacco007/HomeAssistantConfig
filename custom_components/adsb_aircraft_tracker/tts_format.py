"""TTS-friendly text formatting for ADSB Aircraft Tracker."""
from __future__ import annotations

import re
from typing import Any

from .const import AIRLINE_CODE_MAP, AVIATION_ABBREVIATIONS

# Colloquial model names that sound natural when spoken by TTS.
# Maps "full model" fragments to spoken-friendly replacements.
# Applied after title-casing, before hyphen cleanup.
_MODEL_COLLOQUIAL = {
    "737-100": "737",
    "737-200": "737",
    "737-300": "733",
    "737-400": "734",
    "737-500": "735",
    "737-600": "736",
    "737-700": "737",
    "737-800": "738",
    "737-900": "739",
    "737 MAX 7": "737 MAX 7",
    "737 MAX 8": "737 MAX 8",
    "737 MAX 9": "737 MAX 9",
    "747-100": "747",
    "747-200": "747",
    "747-300": "747",
    "747-400": "744",
    "747-8": "748",
    "757-200": "757",
    "757-300": "753",
    "767-200": "767",
    "767-300": "763",
    "767-400": "764",
    "777-200": "777",
    "777-300": "773",
    "777-300ER": "triple seven ER",
    "787-8": "787",
    "787-9": "789",
    "787-10": "787 10",
    "A220-100": "A220",
    "A220-300": "A223",
    "A300-600": "A300",
    "A310-300": "A310",
    "A319-100": "A319",
    "A320-200": "A320",
    "A320-214": "A320",
    "A321-200": "A321",
    "A330-200": "A332",
    "A330-300": "A333",
    "A330-900": "A339",
    "A340-300": "A343",
    "A340-600": "A346",
    "A350-900": "A350",
    "A350-1000": "A350 1000",
    "A380-800": "A380",
    "ERJ-170": "E170",
    "ERJ-175": "E175",
    "ERJ-190": "E190",
    "ERJ-145": "ERJ 145",
    "CRJ-200": "CRJ 200",
    "CRJ-700": "CRJ 700",
    "CRJ-900": "CRJ 900",
    "CRJ-1000": "CRJ 1000",
}


def format_description_for_tts(description: str | None) -> str | None:
    """Convert aircraft descriptions to TTS-friendly text.

    Handles ALL CAPS → Title Case, colloquial model names, and
    strips hyphens from numeric model designators so TTS doesn't
    say "minus".

    Examples:
        "BOEING 737-800"          -> "Boeing 738"
        "Boeing 737-800"          -> "Boeing 738"
        "EMBRAER ERJ-190"         -> "Embraer E190"
        "CESSNA 172 SKYHAWK"      -> "Cessna 172 Skyhawk"
        "AIRBUS A320-214"         -> "Airbus A320"
        "Boeing 777-300ER"        -> "Boeing triple seven ER"
        "Piper PA-28 Cherokee"    -> "Piper PA 28 Cherokee"
    """
    if not description:
        return description

    # First pass: title-case individual words
    words = description.split()
    result = []
    for word in words:
        upper = word.upper()
        # Keep known aviation abbreviations uppercase
        if upper in AVIATION_ABBREVIATIONS:
            result.append(upper)
        # Keep tokens that start with a digit (model numbers like 737-800, A320)
        elif word[0].isdigit():
            result.append(word)
        # Keep tokens that are all digits
        elif word.isdigit():
            result.append(word)
        # Keep alphanumeric model codes like A320, B737, E175
        elif len(word) >= 2 and word[0].isalpha() and any(c.isdigit() for c in word):
            result.append(word.upper())
        else:
            result.append(word.capitalize())

    text = " ".join(result)

    # Second pass: replace known model designators with colloquial names
    # Check case-insensitively; try longest keys first so "777-300ER"
    # matches before "777-300"
    text_upper = text.upper()
    for full_model in sorted(_MODEL_COLLOQUIAL, key=len, reverse=True):
        if full_model.upper() in text_upper:
            colloquial = _MODEL_COLLOQUIAL[full_model]
            idx = text_upper.find(full_model.upper())
            text = text[:idx] + colloquial + text[idx + len(full_model):]
            break  # Only one model per description

    # Third pass: replace ALL remaining hyphens with spaces so TTS never
    # says "minus". Covers "PA-28", "C-130", "F-16", "2-engine", etc.
    text = text.replace("-", " ")

    return text


def format_callsign_for_tts(
    callsign: str | None, operator: str | None = None
) -> str:
    """Convert a callsign to TTS-friendly spoken form.

    Examples:
        "UAL123"  -> "United 1 2 3"
        "DAL45"   -> "Delta 4 5"
        "N172SP"  -> "N172SP"  (GA tail, leave as-is)
        "REACH99" -> "REACH 9 9" (military, no airline match)
    """
    if not callsign:
        return "an unidentified aircraft"

    callsign = callsign.strip()
    if not callsign:
        return "an unidentified aircraft"

    # Try to split into airline prefix + numeric suffix
    match = re.match(r"^([A-Z]{2,4})(\d+)$", callsign.upper())
    if match:
        prefix = match.group(1)
        digits = match.group(2)
        spoken_digits = " ".join(digits)

        # Look up airline name
        airline_name = AIRLINE_CODE_MAP.get(prefix)
        if airline_name:
            return f"{airline_name} {spoken_digits}"

        # If operator is provided and we don't have a code mapping, use operator
        if operator and operator != "Unknown":
            return f"{operator} {spoken_digits}"

        # Unknown prefix — just space out the digits
        return f"{prefix} {spoken_digits}"

    # Not a standard airline callsign (GA tail number, military word callsign)
    # If we have an operator, prepend it
    if operator and operator != "Unknown":
        return f"{operator} {callsign}"

    return callsign


def get_identity_for_tts(aircraft: dict[str, Any]) -> str:
    """Return the best TTS-friendly identity for an aircraft."""
    flight = aircraft.get("flight")
    operator = aircraft.get("operator")

    if flight:
        return format_callsign_for_tts(flight.strip(), operator)

    tail = aircraft.get("tail")
    if tail:
        if operator and operator != "Unknown":
            return f"{operator} {tail}"
        return tail

    return "an unidentified aircraft"


def heading_to_cardinal(heading: float | None) -> str | None:
    """Convert a heading in degrees to an 8-point cardinal direction.

    Examples:
        0   -> "north"
        45  -> "northeast"
        180 -> "south"
        270 -> "west"
    """
    if heading is None:
        return None

    directions = [
        "north", "northeast", "east", "southeast",
        "south", "southwest", "west", "northwest",
    ]
    # Each sector is 45 degrees; offset by 22.5 so 0 maps to "north"
    index = int((heading + 22.5) % 360 / 45)
    return directions[index]


def format_vertical_trend(vertical_rate_fpm: int | float | None) -> str | None:
    """Describe vertical movement in natural language.

    Returns None if data is unavailable.
    """
    if vertical_rate_fpm is None:
        return None

    if vertical_rate_fpm > 300:
        return "climbing"
    elif vertical_rate_fpm < -300:
        return "descending"
    else:
        return "in level flight"


def format_speed_for_tts(speed_kts: float | None) -> str | None:
    """Format speed as a TTS-friendly phrase.

    Returns None if speed is unavailable or zero.
    """
    if not speed_kts:
        return None

    speed = int(speed_kts)
    if speed >= 250:
        return f"cruising at {speed} knots"
    else:
        return f"at {speed} knots"


def format_altitude_with_trend(
    altitude_ft: int | float | None,
    vertical_rate_fpm: int | float | None,
) -> str | None:
    """Format altitude with context-aware verb based on vertical trend.

    Examples:
        (32000, 0)    -> "at 32,000 feet"
        (12000, 1500) -> "climbing through 12,000 feet"
        (8000, -1200) -> "descending through 8,000 feet"
    """
    if not altitude_ft or not isinstance(altitude_ft, (int, float)) or altitude_ft <= 0:
        return None

    alt_str = f"{int(altitude_ft):,} feet"

    if vertical_rate_fpm is not None:
        if vertical_rate_fpm > 300:
            return f"climbing through {alt_str}"
        elif vertical_rate_fpm < -300:
            return f"descending through {alt_str}"

    return f"at {alt_str}"
