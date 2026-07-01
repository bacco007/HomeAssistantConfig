"""Device naming helpers.

The device "model" string (e.g. "Four Seasons (Astronomical)") doubles as the
default instance name in the config flow, so both are derived from this single
place to keep them in sync. The label is localized to the Home Assistant
language; config entry titles and device names are stored strings that HA does
not translate on its own, so the localization happens when the label is built.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from homeassistant.util import slugify

from .const import (
    CONF_MODE,
    CONF_SCOPE,
    DEVICE_CHINESE,
    DEVICE_CROSS_QUARTER,
    DEVICE_FOUR_SEASONS,
    MODE_ASTRONOMICAL,
    MODE_METEOROLOGICAL,
    MODE_TRADITIONAL,
    SCOPE_8_MAJOR,
    SCOPE_ALL_24,
)

DEFAULT_LANGUAGE = "en"

# Short labels for composing "Type (Option)". Deliberately shorter than the
# selector option labels (those are too verbose to nest in parentheses).
# English is the fallback for any unsupported language.
_TYPE_LABELS: dict[str, dict[str, str]] = {
    DEVICE_FOUR_SEASONS: {
        "en": "Four Seasons",
        "de": "Vier Jahreszeiten",
        "nl": "Vier Seizoenen",
    },
    DEVICE_CROSS_QUARTER: {
        "en": "Cross-Quarter",
        "de": "Cross-Quarter",
        "nl": "Cross-Quarter",
    },
    DEVICE_CHINESE: {
        "en": "Chinese Solar Terms",
        "de": "Chinesische Sonnenterme",
        "nl": "Chinese Zonnetermijnen",
    },
}
_OPTION_LABELS: dict[str, dict[str, str]] = {
    MODE_ASTRONOMICAL: {"en": "Astronomical", "de": "Astronomisch", "nl": "Astronomisch"},
    MODE_METEOROLOGICAL: {
        "en": "Meteorological",
        "de": "Meteorologisch",
        "nl": "Meteorologisch",
    },
    MODE_TRADITIONAL: {"en": "Traditional", "de": "Traditionell", "nl": "Traditioneel"},
    SCOPE_ALL_24: {"en": "All 24", "de": "Alle 24", "nl": "Alle 24"},
    SCOPE_8_MAJOR: {"en": "8 Major", "de": "8 Hauptterme", "nl": "8 Hoofdtermen"},
}


def _localize(labels: dict[str, str], language: str) -> str:
    """Pick a label for the language, falling back via base code then English."""
    if language in labels:
        return labels[language]
    return labels.get(language.split("-")[0], labels[DEFAULT_LANGUAGE])


def device_model(
    device_type: str, data: Mapping[str, Any], language: str = DEFAULT_LANGUAGE
) -> str:
    """Return the localized "Type (Option)" label for a device.

    The option is the calculation mode for Four Seasons and Cross-Quarter, the
    scope for Chinese. Used both as the default instance name (config flow) and
    the device model shown on each device.
    """
    if device_type == DEVICE_CHINESE:
        option = data.get(CONF_SCOPE, SCOPE_ALL_24)
    else:
        option = data.get(CONF_MODE, MODE_ASTRONOMICAL)

    type_labels = _TYPE_LABELS.get(device_type)
    option_labels = _OPTION_LABELS.get(option)
    if type_labels is None or option_labels is None:  # pragma: no cover - defensive
        return device_type
    return f"{_localize(type_labels, language)} ({_localize(option_labels, language)})"


def english_object_id(device_type: str, data: Mapping[str, Any], key: str) -> str:
    """Return a fully English, language-independent entity object_id.

    Combines the English device label with the sensor key, e.g.
    ``four_seasons_astronomical_current_season``. It is derived from the device
    type/mode (always English), not from the localized device name, so entity
    IDs never change with the system language and stay predictable.
    """
    return slugify(f"{device_model(device_type, data)} {key}")
