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


# Military airframe hints: deduce specific model from generic ICAO type + USAF
# serial-number pattern. Local feeds usually only show the generic type code
# (e.g. B762 for both 767-200 and KC-46) and a military registration; combining
# them lets us name the specific airframe without an external lookup.
# Tuples: (type_code, registration_regex, enriched_description)
# Type codes are matched exactly (not by prefix), so C5 and C5M are distinct.
MIL_AIRFRAME_HINTS: list[tuple[str, str, str]] = [
    # KC-46A Pegasus — USAF FY15+ in the 46xxx serial block, airframe is 767-2C
    ("B762", r"^\d{2}-46\d{3}$", "Boeing KC-46 Pegasus"),
    # KC-135 Stratotanker — already typed K35R, but enrich for spoken name
    ("K35R", r"^\d{2}-\d{4,5}$", "Boeing KC-135 Stratotanker"),
    # C-17 Globemaster III
    ("C17",  r"^\d{2}-\d{4,5}$", "Boeing C-17 Globemaster"),
    # C-5 Galaxy/Super Galaxy
    ("C5",   r"^\d{2}-\d{4,5}$", "Lockheed C-5 Galaxy"),
    ("C5M",  r"^\d{2}-\d{4,5}$", "Lockheed C-5M Super Galaxy"),
    # C-130 Hercules family
    ("C30J", r"^\d{2}-\d{4,5}$", "Lockheed C-130J Super Hercules"),
    ("C130", r"^\d{2}-\d{4,5}$", "Lockheed C-130 Hercules"),
    # B-52 Stratofortress
    ("B52",  r"^\d{2}-\d{4,5}$", "Boeing B-52 Stratofortress"),
    # E-3 Sentry (AWACS) — 707 airframe
    ("E3TF", r"^\d{2}-\d{4,5}$", "Boeing E-3 Sentry"),
    # E-6 Mercury — 707 airframe
    ("E6",   r"^\d{2}-\d{4,5}$", "Boeing E-6 Mercury"),
    # P-8 Poseidon — 737-800 airframe
    ("P8",   r"^\d{3}\d*$",      "Boeing P-8 Poseidon"),
    # RC-135 family
    ("R135", r"^\d{2}-\d{4,5}$", "Boeing RC-135"),
]


def enrich_military_description(aircraft: dict[str, Any]) -> str | None:
    """Return a more specific airframe description for known military patterns.

    Returns the original description unchanged if no hint matches.
    """
    # Coordinator renames raw tar1090 fields, so accept both shapes.
    type_code = (aircraft.get("aircraft_type") or aircraft.get("t") or "").upper()
    reg = (aircraft.get("tail") or aircraft.get("r") or "").strip()
    original = aircraft.get("description")

    # Called for any aircraft about to be spoken (not just military) — safe
    # because civilian registrations (N123AB etc.) don't match the USAF
    # serial-number patterns below. We can't re-check dbFlags here anyway;
    # the post-processed dict drops that field.
    if not type_code or not reg or reg == "Unknown":
        return original

    for tc, reg_pattern, enriched in MIL_AIRFRAME_HINTS:
        if type_code == tc and re.match(reg_pattern, reg):
            return enriched

    return original


# Letter tokens spoken as real words — never spelled letter-by-letter
_SPOKEN_AS_WORDS = {"MAX"}

# Roman numerals in model names → spoken numbers ("Citation II" → "Citation 2";
# spelling them out would produce "I I", and TTS reads "II" as "ee")
_ROMAN_NUMERALS = {"II": "2", "III": "3", "IV": "4"}


def format_description_for_tts(description: str | None) -> str | None:
    """Convert aircraft descriptions to TTS-friendly text.

    Handles ALL CAPS → Title Case, colloquial model names, strips
    hyphens from numeric model designators so TTS doesn't say
    "minus", and spells out short letter groups so TTS doesn't
    invent words ("PA" → "P A", not "pah"; "ER" → "E R", not "err").

    Examples:
        "BOEING 737-800"          -> "Boeing 738"
        "Boeing 737-800"          -> "Boeing 738"
        "EMBRAER ERJ-190"         -> "Embraer E190"
        "CESSNA 172 SKYHAWK"      -> "Cessna 172 Skyhawk"
        "AIRBUS A320-214"         -> "Airbus A320"
        "Boeing 777-300ER"        -> "Boeing triple seven E R"
        "Piper PA-28 Cherokee"    -> "Piper P A 28 Cherokee"
        "Cessna Citation II"      -> "Cessna Citation 2"
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

    # Fourth pass: spell out short all-letter tokens so TTS says
    # "P A 28" / "triple seven E R" instead of "pah" / "err".
    # MAX stays a word; roman numerals become numbers; mixed
    # alphanumerics (A320, E190, 135R/T) are left alone.
    tokens = []
    for token in text.split():
        if token in _ROMAN_NUMERALS:
            tokens.append(_ROMAN_NUMERALS[token])
        elif (
            token.isalpha()
            and token.isupper()
            and 2 <= len(token) <= 3
            and token not in _SPOKEN_AS_WORDS
        ):
            tokens.append(" ".join(token))
        else:
            tokens.append(token)
    text = " ".join(tokens)

    return text


def format_callsign_for_tts(
    callsign: str | None, operator: str | None = None
) -> str:
    """Convert a callsign to TTS-friendly spoken form.

    Examples:
        "UAL123"  -> "United 1 2 3"
        "DAL45"   -> "Delta 4 5"
        "N172SP"  -> "N172SP"  (GA tail, leave as-is)
        "REACH99" -> "REACH99" (word callsigns pass through, operator
                     prepended if known — only 2-4 letter prefixes split)
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
