from typing import Any, Dict

from homeassistant.helpers import config_validation as cv
from voluptuous import ALLOW_EXTRA, PREVENT_EXTRA, In, Required, Schema

from .const import DOMAIN, LANGUAGE_CODES
from .models.kind import BASIC_KINDS, TraktKind


def dictionary_to_schema(
    dictionary: Dict[str, Any],
    extra: str = PREVENT_EXTRA,
) -> Schema:
    return Schema(
        {
            key: dictionary_to_schema(value) if isinstance(value, dict) else value
            for key, value in dictionary.items()
        },
        extra=extra,
    )


def domain_schema() -> Schema:
    return {
        DOMAIN: {
            "sensors": sensors_schema(),
            Required("language", default="en"): In(LANGUAGE_CODES),
        }
    }


def sensors_schema() -> Dict[str, Any]:
    return {
        "upcoming": upcoming_schema(),
        "all_upcoming": upcoming_schema(),
        "recommendation": recommendation_schema(),
    }


def upcoming_schema() -> Dict[str, Any]:
    subschemas = {}
    for trakt_kind in TraktKind:
        subschemas[trakt_kind.value.identifier] = {
            Required("days_to_fetch", default=30): cv.positive_int,
            Required("max_medias", default=3): cv.positive_int,
        }

    return subschemas


def recommendation_schema() -> Dict[str, Any]:
    subschemas = {}
    for trakt_kind in BASIC_KINDS:
        subschemas[trakt_kind.value.identifier] = {
            Required("max_medias", default=3): cv.positive_int,
        }

    return subschemas


configuration_schema = dictionary_to_schema(domain_schema(), extra=ALLOW_EXTRA)
