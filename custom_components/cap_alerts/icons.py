"""Event-type → Material Design Icon dispatch for alerts.

RFC §2.6: the integration populates `icon`. Taxonomy seeded from NWS
phenomena/event names and ECCC event-name strings. Unknown events fall
back to ``mdi:alert``.
"""

from __future__ import annotations

from .conventions import meteoalarm_awareness_type_code
from .model import CAPAlert

FALLBACK_ICON = "mdi:alert"

# MeteoAlarm ``awareness_type`` code → mdi (issue #97). The code is the
# EUMETNET hazard key: language-independent, REQUIRED on every MeteoAlarm
# alert, and therefore the only classifier that reaches the 30-odd non-English
# member services. Event text can't — a Finnish reader on the FMI feed gets
# ``Tuulivaroitus maa-alueille``, and the English-alternate path (#91) doesn't
# save it because FMI's alternate block is Swedish and some of its alerts carry
# no English block at all.
#
# Pinned to MeteoAlarm CAP Profile v2.0 §2.2.17 (September 2025), which is also
# where the gap at 11 comes from — the profile skips it. 14/15 arrived with the
# profile's marine and drought hazards; the rest were cross-checked against a
# live sweep of 33 member feeds.
_METEOALARM_AWARENESS_ICONS: dict[str, str] = {
    "1": "mdi:weather-windy",  # Wind
    "2": "mdi:snowflake",  # Snow or Ice
    "3": "mdi:weather-lightning",  # Thunderstorm
    "4": "mdi:weather-fog",  # Fog
    "5": "mdi:weather-sunny-alert",  # High Temperature
    "6": "mdi:snowflake-thermometer",  # Low Temperature
    "7": "mdi:waves",  # Coastal Event
    "8": "mdi:fire",  # Forest Fire
    "9": "mdi:snowflake-alert",  # Avalanche
    "10": "mdi:weather-pouring",  # Rain
    "12": "mdi:home-flood",  # Flood
    "13": "mdi:home-flood",  # Rain Flood
    "14": "mdi:waves",  # Marine Hazard
    "15": "mdi:water-off",  # Drought
}

# NWS event-name (CAP ``event``) → mdi. Keys are case-insensitive matched.
_NWS_EVENT_ICONS: dict[str, str] = {
    "tornado warning": "mdi:weather-tornado",
    "tornado watch": "mdi:weather-tornado",
    "severe thunderstorm warning": "mdi:weather-lightning",
    "severe thunderstorm watch": "mdi:weather-lightning",
    "flood warning": "mdi:home-flood",
    "flood watch": "mdi:home-flood",
    "flash flood warning": "mdi:water",
    "flash flood watch": "mdi:water",
    "coastal flood warning": "mdi:waves",
    "coastal flood watch": "mdi:waves",
    "winter storm warning": "mdi:snowflake-alert",
    "winter storm watch": "mdi:snowflake-alert",
    "winter weather advisory": "mdi:snowflake",
    "blizzard warning": "mdi:snowflake-alert",
    "ice storm warning": "mdi:snowflake-melt",
    "excessive heat warning": "mdi:weather-sunny-alert",
    "excessive heat watch": "mdi:weather-sunny-alert",
    "heat advisory": "mdi:weather-sunny-alert",
    "red flag warning": "mdi:fire",
    "fire weather watch": "mdi:fire",
    "high wind warning": "mdi:weather-windy",
    "high wind watch": "mdi:weather-windy",
    "wind advisory": "mdi:weather-windy",
    "dense fog advisory": "mdi:weather-fog",
    "air quality alert": "mdi:smog",
    "special weather statement": "mdi:alert-circle",
    "hurricane warning": "mdi:weather-hurricane",
    "hurricane watch": "mdi:weather-hurricane",
    "tropical storm warning": "mdi:weather-hurricane",
    "tropical storm watch": "mdi:weather-hurricane",
    "tsunami warning": "mdi:tsunami",
    "tsunami watch": "mdi:tsunami",
}

# GDACS event-name (CAP ``event``) → mdi. Keys are case-insensitive matched.
# GDACS emits one fixed English name per hazard type, so this is an exact
# lookup rather than a substring sweep — and the hazards themselves are why
# it can't lean on the tables below: an earthquake or a volcano is not
# weather, and no weather vocabulary carries a needle for either. Every name
# here was checked against the shipped MDI set.
_GDACS_EVENT_ICONS: dict[str, str] = {
    "earthquake": "mdi:pulse",
    "volcano": "mdi:volcano",
    "tropical cyclone": "mdi:weather-hurricane",
    "flood": "mdi:home-flood",
    "tsunami": "mdi:tsunami",
    "drought": "mdi:water-off",
    "wildfire": "mdi:fire",
}

# ECCC event-name substrings → mdi. Matched after lowercasing ``event``.
# Substring match handles ECCC's variable naming (e.g. "severe thunderstorm
# warning", "tornado warning issued").
_ECCC_EVENT_SUBSTRINGS: tuple[tuple[str, str], ...] = (
    ("tornado", "mdi:weather-tornado"),
    ("thunderstorm", "mdi:weather-lightning"),
    ("blizzard", "mdi:snowflake-alert"),
    ("snowfall", "mdi:snowflake"),
    ("snow squall", "mdi:snowflake-alert"),
    ("winter storm", "mdi:snowflake-alert"),
    ("freezing rain", "mdi:snowflake-melt"),
    ("freezing drizzle", "mdi:snowflake-melt"),
    ("rainfall", "mdi:weather-pouring"),
    ("wind", "mdi:weather-windy"),
    ("heat", "mdi:weather-sunny-alert"),
    ("extreme cold", "mdi:snowflake-thermometer"),
    ("frost", "mdi:snowflake-thermometer"),
    ("fog", "mdi:weather-fog"),
    ("smog", "mdi:smog"),
    ("air quality", "mdi:smog"),
    ("hurricane", "mdi:weather-hurricane"),
    ("tropical storm", "mdi:weather-hurricane"),
    ("tsunami", "mdi:tsunami"),
    ("flood", "mdi:home-flood"),
)

# MeteoAlarm event vocabulary is open across ~35 national services. Match on
# CAP-event substrings; the MeteoAlarm canonical set documents the keywords
# below as the EUMETNET hazard taxonomy.
_METEOALARM_EVENT_SUBSTRINGS: tuple[tuple[str, str], ...] = (
    ("avalanche", "mdi:snowflake-alert"),
    ("fire", "mdi:fire"),
    ("thunderstorm", "mdi:weather-lightning"),
    ("snow/ice", "mdi:snowflake"),
    # Must precede ``snow``: WMO consults this table before the ECCC list, so
    # the broad needle would otherwise shadow ECCC's specific "snow squall"
    # mapping below and a squall warning would draw the plain snow icon.
    ("snow squall", "mdi:snowflake-alert"),
    ("snow", "mdi:snowflake"),
    ("ice", "mdi:snowflake-melt"),
    ("frost", "mdi:snowflake-thermometer"),
    # Must precede ``rain``, for the same reason ``snow squall`` precedes
    # ``snow``: a WMO "Freezing Rain Warning" is ice, not a downpour.
    ("freezing rain", "mdi:snowflake-melt"),
    ("rain flood", "mdi:home-flood"),
    ("flood", "mdi:home-flood"),
    ("rain", "mdi:weather-pouring"),
    ("wind", "mdi:weather-windy"),
    ("gale", "mdi:weather-windy"),
    ("fog", "mdi:weather-fog"),
    ("extreme high temp", "mdi:weather-sunny-alert"),
    ("extreme low temp", "mdi:snowflake-thermometer"),
    ("high temperature", "mdi:weather-sunny-alert"),
    ("low temperature", "mdi:snowflake-thermometer"),
    # Must precede ``wave``: several services spell the hazard "Heat wave",
    # which otherwise matches the coastal needle and yields ``mdi:waves`` for
    # a temperature alert (observed live on a MeteoAlarm CH entry).
    ("heat", "mdi:weather-sunny-alert"),
    ("coastal event", "mdi:waves"),
    ("coastal", "mdi:waves"),
    ("wave", "mdi:waves"),
)


def _is_english(tag: str) -> bool:
    """Whether a BCP 47 tag's primary subtag is English."""
    return tag.strip().lower().split("-", 1)[0] == "en"


def classification_event(alert: CAPAlert) -> str:
    """Return the event text to classify on, which may not be the displayed one.

    CAP 1.2 §3.2.1 makes ``<event>`` human-readable free text, so a feed
    presenting a localized block carries an event no keyword table can match —
    ``高温`` and ``Hitzewelle`` are the same hazard as ``high temperature`` and
    match nothing. Multilingual sources publish a second ``<info>`` block, and
    when it is English its event is classifiable while the user goes on reading
    their own language (issue #91).

    Guarded on the alternate *being* English rather than merely existing:
    ``*_alt`` holds the first non-selected block, which on a document ordered
    ``zh``/``pt``/``en`` is Portuguese — no more matchable than the Chinese it
    would replace.

    This is deliberately provider-neutral. WMO surfaced it, but MeteoAlarm
    relays 38 mostly non-English services and publishes the same alternate
    block, so a German user hits the identical defect.
    """
    if (
        alert.event_alt
        and not _is_english(alert.language)
        and _is_english(alert.language_alt)
    ):
        return alert.event_alt
    return alert.event


def icon_for(alert: CAPAlert) -> str:
    """Return an ``mdi:*`` icon for ``alert`` based on provider + event."""
    # MeteoAlarm carries a coded hazard, so classify on that before touching
    # free text — it beats the event tables in every language, including
    # English. Deliberately not applied to the other providers: WMO and ECCC
    # publish no ``awareness_type``, so they keep the English-alternate path.
    # Codes outside the table (a profile revision we haven't seen) fall
    # through to the event tables rather than to the fallback icon.
    if alert.provider == "meteoalarm":
        code = meteoalarm_awareness_type_code(alert.parameters)
        if (icon := _METEOALARM_AWARENESS_ICONS.get(code)) is not None:
            return icon

    event = (classification_event(alert) or "").strip().lower()
    if not event:
        return FALLBACK_ICON

    if alert.provider == "nws":
        if (icon := _NWS_EVENT_ICONS.get(event)) is not None:
            return icon

    if alert.provider == "gdacs":
        if (icon := _GDACS_EVENT_ICONS.get(event)) is not None:
            return icon

    # MeteoAlarm services emit hyphenated/underscored compound terms (e.g.
    # ``high-temperature``, ``snow_ice``); fold separators to spaces so
    # substring needles match across naming styles. Harmless for the other
    # providers, whose vocabularies carry no separators.
    normalized = event.replace("-", " ").replace("_", " ")

    # WMO relays ~140 national services, so its vocabulary is international
    # rather than Canadian — "high temperature", "heavy rain" and "gale" are
    # in the EUMETNET taxonomy and absent from ECCC's. Both consult it first,
    # then fall through rather than stopping: the early return here used to
    # hide ``tsunami``, ``tornado`` and ``smog`` from MeteoAlarm even though
    # ECCC's list below carries all three.
    if alert.provider in ("meteoalarm", "wmo"):
        for needle, icon in _METEOALARM_EVENT_SUBSTRINGS:
            if needle in normalized:
                return icon

    for needle, icon in _ECCC_EVENT_SUBSTRINGS:
        if needle in normalized:
            return icon

    return FALLBACK_ICON
