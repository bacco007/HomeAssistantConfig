"""Intent handlers for ADSB Aircraft Tracker voice support."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import intent

from .const import DOMAIN, AIRCRAFT_TYPE_KEYWORDS
from .coordinator import ADSBDataUpdateCoordinator
from .route_client import RouteClient, RouteInfo
from .tts_format import (
    format_altitude_with_trend,
    format_callsign_for_tts,
    format_description_for_tts,
    format_speed_for_tts,
    format_vertical_trend,
    get_identity_for_tts,
    heading_to_cardinal,
)

_LOGGER = logging.getLogger(__name__)

INTENT_WHAT_PLANE = "ADSBWhatPlane"
INTENT_NEAREST_AIRCRAFT = "ADSBNearestAircraft"
INTENT_MILITARY_STATUS = "ADSBMilitaryStatus"
INTENT_AIRCRAFT_COUNT = "ADSBAircraftCount"
INTENT_AIRCRAFT_ROUTE = "ADSBAircraftRoute"
INTENT_AIRCRAFT_BY_TYPE = "ADSBAircraftByType"


async def async_setup_intents(hass: HomeAssistant) -> None:
    """Register ADSB intent handlers with Home Assistant."""
    intent.async_register(hass, WhatPlaneIntentHandler())
    intent.async_register(hass, NearestAircraftIntentHandler())
    intent.async_register(hass, MilitaryStatusIntentHandler())
    intent.async_register(hass, AircraftCountIntentHandler())
    intent.async_register(hass, AircraftRouteIntentHandler())
    intent.async_register(hass, AircraftByTypeIntentHandler())
    _LOGGER.info("Registered ADSB voice intent handlers")


# ---------------------------------------------------------------------------
# Existing intents (enhanced with TTS formatting)
# ---------------------------------------------------------------------------


class WhatPlaneIntentHandler(intent.IntentHandler):
    """Handler for 'what plane is that' style queries."""

    intent_type = INTENT_WHAT_PLANE
    description = "Identifies the closest aircraft overhead with route information"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, route_client = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("I don't have any aircraft data right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            response.async_set_speech("No planes are nearby right now.")
            return response

        aircraft = dict(aircraft_list[0])
        route = await _fetch_route_for_aircraft(aircraft, route_client)

        speech = _format_aircraft_response(aircraft, route, coordinator)
        response.async_set_speech(speech)
        return response


class NearestAircraftIntentHandler(intent.IntentHandler):
    """Handler for 'what aircraft are nearby' style queries."""

    intent_type = INTENT_NEAREST_AIRCRAFT
    description = "Lists the nearest aircraft currently tracked"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, route_client = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("No aircraft data available right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            response.async_set_speech("No aircraft are being tracked right now.")
            return response

        nearest = [a for a in aircraft_list[:3] if a.get("distance_mi") is not None]
        if not nearest:
            count = len(aircraft_list)
            response.async_set_speech(
                f"There are {count} aircraft being tracked but none have position data."
            )
            return response

        parts = []
        for aircraft in nearest:
            parts.append(_format_brief_aircraft(aircraft, coordinator))

        count = len(aircraft_list)
        joined = _join_list_spoken(parts)
        summary = f"I'm tracking {count} aircraft. The nearest are: {joined}."
        response.async_set_speech(summary)
        return response


# ---------------------------------------------------------------------------
# New intents
# ---------------------------------------------------------------------------


class MilitaryStatusIntentHandler(intent.IntentHandler):
    """Handler for military aircraft status queries."""

    intent_type = INTENT_MILITARY_STATUS
    description = "Reports whether any military aircraft are currently tracked"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, _ = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("I don't have any aircraft data right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            response.async_set_speech("No aircraft are being tracked right now.")
            return response

        military = _detect_military(coordinator, aircraft_list)

        if not military:
            response.async_set_speech(
                f"No military aircraft detected right now. I'm tracking {len(aircraft_list)} aircraft total."
            )
            return response

        if len(military) == 1:
            ac = military[0]
            identity = get_identity_for_tts(ac)
            desc = format_description_for_tts(ac.get("description"))
            dist = coordinator.format_distance(ac.get("distance_mi"))
            alt_str = format_altitude_with_trend(
                ac.get("altitude_ft"), ac.get("vertical_rate_fpm")
            )
            parts = [f"I'm detecting 1 military aircraft. It's {identity}"]
            if desc:
                parts[0] += f", a {desc}"
            if dist and dist != "Unknown":
                parts.append(f"{dist} away")
            if alt_str:
                parts.append(alt_str)
            response.async_set_speech(", ".join(parts) + ".")
        else:
            # Multiple military aircraft — describe closest, mention count
            ac = military[0]
            identity = get_identity_for_tts(ac)
            desc = format_description_for_tts(ac.get("description"))
            dist = coordinator.format_distance(ac.get("distance_mi"))
            alt_str = format_altitude_with_trend(
                ac.get("altitude_ft"), ac.get("vertical_rate_fpm")
            )
            intro = f"I'm detecting {len(military)} military aircraft."
            detail_parts = [f"The closest is {identity}"]
            if desc:
                detail_parts[0] += f", a {desc}"
            if dist and dist != "Unknown":
                detail_parts.append(f"{dist} away")
            if alt_str:
                detail_parts.append(alt_str)
            response.async_set_speech(f"{intro} {', '.join(detail_parts)}.")

        return response


class AircraftCountIntentHandler(intent.IntentHandler):
    """Handler for aircraft count queries."""

    intent_type = INTENT_AIRCRAFT_COUNT
    description = "Reports the total number of aircraft currently being tracked"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, _ = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("I don't have any aircraft data right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        count = len(aircraft_list)

        if count == 0:
            response.async_set_speech("No aircraft are being tracked right now.")
            return response

        closest = aircraft_list[0]
        dist = coordinator.format_distance(closest.get("distance_mi"))
        if dist and dist != "Unknown":
            speech = f"I'm currently tracking {count} aircraft. The closest is {dist} away."
        else:
            speech = f"I'm currently tracking {count} aircraft."

        response.async_set_speech(speech)
        return response


class AircraftRouteIntentHandler(intent.IntentHandler):
    """Handler for aircraft route/destination queries."""

    intent_type = INTENT_AIRCRAFT_ROUTE
    description = "Reports the route of the closest aircraft"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, route_client = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("I don't have any aircraft data right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            response.async_set_speech("No planes are nearby right now.")
            return response

        aircraft = dict(aircraft_list[0])
        identity = get_identity_for_tts(aircraft)
        route = await _fetch_route_for_aircraft(aircraft, route_client)

        if route.valid and route.origin_name and route.destination_name:
            dist = coordinator.format_distance(aircraft.get("distance_mi"))
            alt_str = format_altitude_with_trend(
                aircraft.get("altitude_ft"), aircraft.get("vertical_rate_fpm")
            )
            parts = [
                f"The closest aircraft, {identity}, is flying from {route.origin_name} to {route.destination_name}"
            ]
            if dist and dist != "Unknown":
                parts.append(f"about {dist} away")
            if alt_str:
                parts.append(alt_str)
            speech = ", ".join(parts) + "."
        else:
            speech = f"The closest aircraft is {identity}, but I don't have route information for that flight."

        response.async_set_speech(speech)
        return response


class AircraftByTypeIntentHandler(intent.IntentHandler):
    """Handler for aircraft type filtering queries (helicopters, jets, etc.)."""

    intent_type = INTENT_AIRCRAFT_BY_TYPE
    description = "Filters nearby aircraft by type such as helicopter, jet, or prop"
    slot_schema = {"type": vol.Any(str)}

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        response = intent_obj.create_response()

        coordinator, _ = _get_best_coordinator(hass)
        if coordinator is None:
            response.async_set_speech("I don't have any aircraft data right now.")
            return response

        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            response.async_set_speech("No aircraft are being tracked right now.")
            return response

        # Extract and normalize the type slot
        requested_type = (
            intent_obj.slots.get("type", {}).get("value", "") or ""
        ).strip().lower()

        if not requested_type:
            response.async_set_speech(
                f"I'm tracking {len(aircraft_list)} aircraft total. Try asking about helicopters, jets, or props."
            )
            return response

        # Check if asking about military (delegate to military detection)
        if "military" in requested_type:
            military = _detect_military(coordinator, aircraft_list)
            if not military:
                response.async_set_speech(
                    f"No military aircraft detected right now. I'm tracking {len(aircraft_list)} aircraft total."
                )
            elif len(military) == 1:
                ac = military[0]
                identity = get_identity_for_tts(ac)
                dist = coordinator.format_distance(ac.get("distance_mi"))
                alt_str = format_altitude_with_trend(
                    ac.get("altitude_ft"), ac.get("vertical_rate_fpm")
                )
                parts = [f"I can see 1 military aircraft. It's {identity}"]
                if dist and dist != "Unknown":
                    parts.append(f"{dist} away")
                if alt_str:
                    parts.append(alt_str)
                response.async_set_speech(", ".join(parts) + ".")
            else:
                ac = military[0]
                dist = coordinator.format_distance(ac.get("distance_mi"))
                alt_str = format_altitude_with_trend(
                    ac.get("altitude_ft"), ac.get("vertical_rate_fpm")
                )
                parts = [f"I can see {len(military)} military aircraft nearby. The closest is"]
                if dist and dist != "Unknown":
                    parts.append(f"{dist} away")
                if alt_str:
                    parts.append(alt_str)
                response.async_set_speech(" ".join(parts) + ".")
            return response

        # Match the requested type to our known categories
        matched_category = None
        for category, config in AIRCRAFT_TYPE_KEYWORDS.items():
            if requested_type in config["terms"] or any(
                term in requested_type for term in config["terms"]
            ):
                matched_category = category
                break

        if matched_category is None:
            response.async_set_speech(
                f"I'm not sure what type you mean by '{requested_type}'. "
                f"I can look for helicopters, jets, turboprops, or military aircraft. "
                f"I'm tracking {len(aircraft_list)} aircraft total."
            )
            return response

        # Filter aircraft by the matched category
        config = AIRCRAFT_TYPE_KEYWORDS[matched_category]
        filtered = _filter_aircraft_by_type(aircraft_list, config)

        spoken_type = matched_category + "s" if not matched_category.endswith("s") else matched_category

        if not filtered:
            response.async_set_speech(
                f"I don't see any {spoken_type} right now. I'm tracking {len(aircraft_list)} aircraft total."
            )
            return response

        closest = filtered[0]
        dist = coordinator.format_distance(closest.get("distance_mi"))
        alt_str = format_altitude_with_trend(
            closest.get("altitude_ft"), closest.get("vertical_rate_fpm")
        )

        count = len(filtered)
        if count == 1:
            identity = get_identity_for_tts(closest)
            parts = [f"I can see 1 {matched_category} nearby. It's {identity}"]
        else:
            parts = [f"I can see {count} {spoken_type} nearby. The closest is"]

        if dist and dist != "Unknown":
            parts.append(f"{dist} away")
        if alt_str:
            parts.append(alt_str)

        response.async_set_speech(", ".join(parts) + ".")
        return response


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_best_coordinator(
    hass: HomeAssistant,
) -> tuple[ADSBDataUpdateCoordinator | None, RouteClient | None]:
    """Find the coordinator with the closest aircraft data."""
    if DOMAIN not in hass.data:
        return None, None

    best_coordinator = None
    best_route_client = None
    best_distance = float("inf")

    for entry_data in hass.data[DOMAIN].values():
        if not isinstance(entry_data, dict):
            continue
        coordinator = entry_data.get("coordinator")
        if not coordinator or not coordinator.data:
            continue
        aircraft_list = coordinator.data.get("aircraft", [])
        if not aircraft_list:
            continue

        distance = aircraft_list[0].get("distance_mi") or float("inf")
        if distance < best_distance:
            best_distance = distance
            best_coordinator = coordinator
            best_route_client = entry_data.get("route_client")

    return best_coordinator, best_route_client


async def _fetch_route_for_aircraft(
    aircraft: dict[str, Any],
    route_client: RouteClient | None,
) -> RouteInfo:
    """Fetch route for an aircraft's callsign."""
    callsign = aircraft.get("flight")
    if not callsign or not route_client:
        return RouteInfo(callsign=callsign or "", valid=False)
    return await route_client.async_get_route(callsign)


def _detect_military(
    coordinator: ADSBDataUpdateCoordinator,
    aircraft_list: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Detect military aircraft using the binary sensor's logic."""
    from .binary_sensor import ADSBMilitaryAircraftSensor

    temp_sensor = ADSBMilitaryAircraftSensor(coordinator, coordinator.config_entry)
    return temp_sensor._detect_military_aircraft(aircraft_list)


def _filter_aircraft_by_type(
    aircraft_list: list[dict[str, Any]],
    type_config: dict[str, Any],
) -> list[dict[str, Any]]:
    """Filter aircraft list by type category configuration."""
    results = []
    for ac in aircraft_list:
        # Check category prefix (e.g., "H" for helicopters)
        cat_prefix = type_config.get("category_prefix")
        if cat_prefix:
            ac_type = ac.get("aircraft_type") or ""
            # ICAO type designators for rotorcraft typically have category info
            # Also check the category field from type_info
            category = ac.get("category", "")
            if category == "Helicopter" or (ac_type and ac_type[0:1] == cat_prefix):
                results.append(ac)
                continue

        # Check engine_type match
        engine_match = type_config.get("engine_type")
        if engine_match and ac.get("engine_type") == engine_match:
            results.append(ac)
            continue

        # Check description keywords
        desc_keywords = type_config.get("description_keywords", [])
        description = (ac.get("description") or "").upper()
        if desc_keywords and any(kw in description for kw in desc_keywords):
            results.append(ac)
            continue

    return results


def _format_brief_aircraft(
    aircraft: dict[str, Any],
    coordinator: ADSBDataUpdateCoordinator,
) -> str:
    """Format a single aircraft as a brief TTS-friendly phrase for lists."""
    identity = get_identity_for_tts(aircraft)
    dist = coordinator.format_distance(aircraft.get("distance_mi"))
    alt_str = format_altitude_with_trend(
        aircraft.get("altitude_ft"), aircraft.get("vertical_rate_fpm")
    )
    heading = heading_to_cardinal(aircraft.get("heading"))

    parts = [identity]
    if dist and dist != "Unknown":
        parts.append(f"{dist} away")
    if alt_str:
        parts.append(alt_str)
    if heading:
        parts.append(f"heading {heading}")

    return ", ".join(parts)


def _format_aircraft_response(
    aircraft: dict[str, Any],
    route: RouteInfo,
    coordinator: ADSBDataUpdateCoordinator,
) -> str:
    """Build a natural language TTS-friendly description of an aircraft."""
    identity = get_identity_for_tts(aircraft)
    description = format_description_for_tts(aircraft.get("description"))
    distance_mi = aircraft.get("distance_mi")
    altitude_ft = aircraft.get("altitude_ft")
    vertical_rate = aircraft.get("vertical_rate_fpm")
    heading = heading_to_cardinal(aircraft.get("heading"))
    speed = format_speed_for_tts(aircraft.get("speed_kts"))

    parts = [f"That's {identity}"]

    if description and description != "Unknown aircraft":
        parts[0] += f", a {description}"

    if route.valid and route.origin_name and route.destination_name:
        parts.append(f"flying from {route.origin_name} to {route.destination_name}")

    if distance_mi is not None:
        dist_str = coordinator.format_distance(distance_mi)
        if dist_str and dist_str != "Unknown":
            parts.append(f"about {dist_str} away")

    alt_str = format_altitude_with_trend(altitude_ft, vertical_rate)
    if alt_str:
        parts.append(alt_str)

    if heading:
        parts.append(f"heading {heading}")

    if speed:
        parts.append(speed)

    return ", ".join(parts) + "."


def _join_list_spoken(items: list[str]) -> str:
    """Join a list with commas and 'and' before the last item for natural speech."""
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]}; and {items[1]}"
    return "; ".join(items[:-1]) + "; and " + items[-1]
