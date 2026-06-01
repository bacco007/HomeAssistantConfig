"""OpenSky Network API client."""

from __future__ import annotations

import asyncio
import logging
import math
import re
import time
from typing import Any

import aiohttp

from .const import (
    AIRCRAFT_CATEGORY,
    AIRLINES,
    IATA_TO_ICAO,
    OPENSKY_API,
    OPENSKY_TOKEN_URL,
    POSITION_SOURCE,
)

_LOGGER = logging.getLogger(__name__)

_token_cache: dict[str, Any] = {"token": None, "expires_at": 0.0}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def _bbox(lat: float, lon: float, radius_km: float) -> dict[str, Any]:
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / max(1.0, 111.0 * math.cos(math.radians(lat)))
    return {
        "lamin": max(-90.0, lat - lat_delta),
        "lamax": min(90.0, lat + lat_delta),
        "lomin": max(-180.0, lon - lon_delta),
        "lomax": min(180.0, lon + lon_delta),
        "extended": 1,
    }


async def _get_token(
    session: aiohttp.ClientSession, client_id: str, client_secret: str
) -> str | None:
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 30:
        return _token_cache["token"]
    try:
        async with session.post(
            OPENSKY_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
        ) as resp:
            if not resp.ok:
                return None
            data = await resp.json()
            _token_cache["token"] = data["access_token"]
            _token_cache["expires_at"] = time.time() + data.get("expires_in", 1800)
            return _token_cache["token"]
    except Exception as err:
        _LOGGER.debug("OpenSky token fetch failed: %s", err)
        return None


def normalize_callsign(raw: str | None) -> dict[str, Any]:
    """Parse a transponder callsign into airline and flight number components."""
    if not raw:
        return {"callsign": None, "airline_icao": None, "flight_number": None, "airline": None}
    cs = raw.strip().replace(" ", "").upper()
    if not cs:
        return {"callsign": None, "airline_icao": None, "flight_number": None, "airline": None}

    m = re.match(r"^([A-Z]{2,3})([0-9A-Z]+)$", cs)
    if not m:
        return {"callsign": cs, "airline_icao": None, "flight_number": cs, "airline": None}

    prefix, suffix = m.group(1), m.group(2)

    # All-letter suffix = registration being broadcast as callsign (e.g. VTASR = VT-ASR)
    if re.match(r"^[A-Z]+$", suffix):
        return {"callsign": cs, "airline_icao": None, "flight_number": None, "airline": None}

    # ICAO lookup, then reverse IATA lookup
    airline_icao = prefix
    airline = AIRLINES.get(prefix)
    if not airline and prefix in IATA_TO_ICAO:
        airline_icao = IATA_TO_ICAO[prefix]
        airline = AIRLINES.get(airline_icao)

    flight_number = f"{airline['iata']} {suffix}" if airline and airline.get("iata") else cs
    return {
        "callsign": cs,
        "airline_icao": airline_icao,
        "flight_number": flight_number,
        "airline": airline,
    }


def _parse_state(row: list, user_lat: float, user_lon: float) -> dict[str, Any] | None:
    if len(row) < 17:
        return None
    (
        icao24,
        callsign,
        origin_country,
        _time_position,
        last_contact,
        longitude,
        latitude,
        baro_alt,
        on_ground,
        velocity,
        true_track,
        vertical_rate,
        _sensors,
        geo_alt,
        squawk,
        _spi,
        position_source_id,
    ) = row[:17]
    category_id = row[17] if len(row) > 17 else None

    if latitude is None or longitude is None or on_ground:
        return None

    dist = haversine_km(user_lat, user_lon, latitude, longitude)
    alt_m = geo_alt if geo_alt is not None else baro_alt
    identity = normalize_callsign(callsign)

    return {
        "icao24": icao24,
        "callsign": identity["callsign"],
        "flight_number": identity["flight_number"],
        "airline_icao": identity["airline_icao"],
        "airline_iata": identity["airline"]["iata"] if identity["airline"] else None,
        "airline": identity["airline"]["name"] if identity["airline"] else None,
        "latitude": latitude,
        "longitude": longitude,
        "distance_km": round(dist, 2),
        "altitude_m": alt_m,
        "altitude_ft": round(alt_m * 3.28084) if alt_m is not None else None,
        "speed_knots": round(velocity * 1.94384) if velocity is not None else None,
        "speed_kmh": round(velocity * 3.6) if velocity is not None else None,
        "heading": round(true_track) if true_track is not None else None,
        "vertical_rate_fpm": round(vertical_rate * 196.85) if vertical_rate is not None else None,
        "squawk": squawk,
        "origin_country": origin_country,
        "position_source": POSITION_SOURCE.get(position_source_id, "Unknown"),
        "category": AIRCRAFT_CATEGORY.get(category_id, "Unknown"),
        "last_contact_unix": last_contact,
        # enrichment placeholders
        "registration": None,
        "aircraft_type": None,
        "aircraft_model": None,
        "registered_owner": None,
        "departure": None,
        "destination": None,
        "departure_airport": None,
        "destination_airport": None,
        "scheduled_departure": None,
        "actual_departure": None,
        "scheduled_arrival": None,
        "estimated_arrival": None,
        "elapsed_minutes": None,
        "remaining_minutes": None,
        "total_minutes": None,
        "departure_time": None,
        "arrival_time": None,
        "airline_logo_url": None,
        "confidence": {
            "identity": 0.88 if identity["airline"] else (0.55 if identity["callsign"] else 0),
            "aircraft": 0,
            "route": 0,
            "position": 0.95,
        },
        "sources": ["opensky.states"],
    }


async def fetch_closest_raw(
    session: aiohttp.ClientSession,
    lat: float,
    lon: float,
    radius_km: float,
    config: dict,
) -> dict[str, Any] | None:
    """Fetch OpenSky state vectors and return the closest airborne aircraft."""
    client_id = config.get("opensky_client_id", "")
    client_secret = config.get("opensky_client_secret", "")
    headers: dict[str, str] = {}
    if client_id and client_secret:
        token = await _get_token(session, client_id, client_secret)
        if token:
            headers["Authorization"] = f"Bearer {token}"

    try:
        async with asyncio.timeout(15):
            async with session.get(
                f"{OPENSKY_API}/states/all",
                params=_bbox(lat, lon, radius_km),
                headers=headers,
            ) as resp:
                if resp.status == 429:
                    _LOGGER.warning("OpenSky rate limited (429)")
                    return None
                if not resp.ok:
                    _LOGGER.warning("OpenSky states failed: %s", resp.status)
                    return None
                data = await resp.json()
    except TimeoutError:
        _LOGGER.warning("OpenSky states timed out")
        return None
    except Exception as err:
        _LOGGER.warning("OpenSky states error: %s", err)
        return None

    states = data.get("states") or []
    parsed = [_parse_state(row, lat, lon) for row in states]
    parsed = [p for p in parsed if p is not None]
    if not parsed:
        return None
    parsed.sort(key=lambda p: p["distance_km"])
    return parsed[0]
