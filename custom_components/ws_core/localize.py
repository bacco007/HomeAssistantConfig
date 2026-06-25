"""Localized free-text strings for sensor states HA cannot translate.

A few sensors expose a *generated free-text string* as their state - the
current-conditions summary and the alert message. Home Assistant's translation
system only localizes fixed state keys, not dynamic text, so these are
localized here in Python using the HA-configured language, falling back to
English for any unsupported language (issue #104).

Add a new language by adding its two-letter code to both tables below.
"""

from __future__ import annotations

# Conditions-summary fragments. ``{v}`` is a pre-formatted value.
_SUMMARY: dict[str, dict[str, str]] = {
    "en": {
        "feels_like": "feels like {v}°C",
        "rain": "{v} mm/h rain",
        "gusting": "gusting {v}",
        "humidity": "RH {v}%",
        "no_data": "No data",
    },
    "fr": {
        "feels_like": "ressenti {v}°C",
        "rain": "{v} mm/h de pluie",
        "gusting": "rafales {v}",
        "humidity": "HR {v}%",
        "no_data": "Aucune donnée",
    },
}

# Alert-message fragments. ``{v}`` is a pre-formatted value.
_ALERT: dict[str, dict[str, str]] = {
    "en": {
        "wind": "Extreme wind: {v} m/s",
        "rain": "Heavy rain: {v} mm/h",
        "freeze": "Freeze risk: {v}°C",
        "clear": "All clear",
    },
    "fr": {
        "wind": "Vent extrême : {v} m/s",
        "rain": "Pluie forte : {v} mm/h",
        "freeze": "Risque de gel : {v}°C",
        "clear": "Tout est normal",
    },
}


def _lang(language: str | None) -> str:
    """Normalise an HA language code to a supported key, defaulting to English."""
    if not language:
        return "en"
    code = language.split("-")[0].lower()
    return code if code in _SUMMARY else "en"


def summary(language: str | None, key: str, **fmt: str) -> str:
    """Return a localized conditions-summary fragment."""
    return _SUMMARY[_lang(language)][key].format(**fmt)


def alert(language: str | None, key: str, **fmt: str) -> str:
    """Return a localized alert-message fragment."""
    return _ALERT[_lang(language)][key].format(**fmt)
