"""Enrichment pipeline: ADSBDB, AeroDataBox, AviationStack, local JSON caches, OpenSky flights."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Any

import aiohttp

from .const import ADSBDB_API, AERODATABOX_API, AVIATIONSTACK_API, OPENSKY_API

_LOGGER = logging.getLogger(__name__)

_mem: dict[str, dict] = {}


def _get(key: str) -> Any | None:
    entry = _mem.get(key)
    if entry and time.monotonic() < entry["expires_at"]:
        return entry["value"]
    return None


def _put(key: str, value: Any, ttl: int) -> Any:
    _mem[key] = {"value": value, "expires_at": time.monotonic() + ttl}
    return value


def _load_json(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _display_airport(airport: dict | None) -> str | None:
    if not airport:
        return None
    code = airport.get("iata") or airport.get("icao")
    name = airport.get("name")
    return " - ".join(p for p in [code, name] if p) or None


def _normalize_adsbdb_airport(a: dict | None) -> dict | None:
    if not a:
        return None
    return {
        "icao": a.get("icao_code"),
        "iata": a.get("iata_code"),
        "name": a.get("name"),
        "municipality": a.get("municipality"),
        "country": a.get("country_name"),
        "latitude": a.get("latitude"),
        "longitude": a.get("longitude"),
    }


def _normalize_aerodatabox_airport(a: dict | None) -> dict | None:
    if not a:
        return None
    return {
        "icao": a.get("icao"),
        "iata": a.get("iata"),
        "name": a.get("shortName") or a.get("name"),
        "municipality": a.get("municipalityName"),
        "country": a.get("countryCode"),
        "latitude": (a.get("location") or {}).get("lat"),
        "longitude": (a.get("location") or {}).get("lon"),
    }


def _normalize_aviationstack_airport(a: dict | None) -> dict | None:
    if not a:
        return None
    return {
        "icao": a.get("icao"),
        "iata": a.get("iata"),
        "name": a.get("airport"),
    }


def _parse_time(obj: dict | None) -> str | None:
    """Parse a time dict with 'utc'/'local' keys (AeroDataBox format)."""
    if not obj:
        return None
    raw = obj.get("utc") or obj.get("local")
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).isoformat()
    except Exception:
        return raw


def _parse_iso(raw: str | None) -> str | None:
    """Parse a plain ISO 8601 string (AviationStack format)."""
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).isoformat()
    except Exception:
        return raw


def _minutes_until(iso: str | None) -> int | None:
    if not iso:
        return None
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        diff = (dt - datetime.now(timezone.utc)).total_seconds()
        return max(0, round(diff / 60))
    except Exception:
        return None


def _route_cache_keys(flight_number: str | None, callsign: str | None) -> list[str]:
    identifiers = list(dict.fromkeys(x for x in [flight_number, callsign] if x))
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    keys = []
    for ident in identifiers:
        keys.append(f"{ident}-{today}")
        keys.append(ident)
    return keys


# ---------------------------------------------------------------------------
# Apply helpers — one per data source
# ---------------------------------------------------------------------------


def _apply_adsbdb(aircraft: dict, adsbdb: dict) -> dict:
    ac = adsbdb.get("aircraft") or {}
    if ac:
        aircraft["registration"] = aircraft["registration"] or ac.get("registration")
        aircraft["aircraft_type"] = aircraft["aircraft_type"] or ac.get("icao_type")
        model = " ".join(filter(None, [ac.get("manufacturer"), ac.get("type")])) or None
        aircraft["aircraft_model"] = aircraft["aircraft_model"] or model
        aircraft["registered_owner"] = aircraft["registered_owner"] or ac.get("registered_owner")
        aircraft["confidence"]["aircraft"] = max(aircraft["confidence"].get("aircraft", 0), 0.85)
        aircraft["sources"].append("adsbdb.aircraft")

    route = adsbdb.get("flightroute") or {}
    airline = route.get("airline") or adsbdb.get("airline")
    if airline:
        aircraft["airline_icao"] = aircraft["airline_icao"] or airline.get("icao")
        aircraft["airline_iata"] = aircraft["airline_iata"] or airline.get("iata")
        aircraft["airline"] = aircraft["airline"] or airline.get("name")
        aircraft["confidence"]["identity"] = max(aircraft["confidence"].get("identity", 0), 0.82)

    origin = route.get("origin") or adsbdb.get("origin")
    destination = route.get("destination") or adsbdb.get("destination")
    if origin or destination:
        if origin and not aircraft.get("departure_airport"):
            dep = _normalize_adsbdb_airport(origin)
            aircraft["departure_airport"] = dep
            aircraft["departure"] = _display_airport(dep)
        if destination and not aircraft.get("destination_airport"):
            dst = _normalize_adsbdb_airport(destination)
            aircraft["destination_airport"] = dst
            aircraft["destination"] = _display_airport(dst)
        aircraft["confidence"]["route"] = max(aircraft["confidence"].get("route", 0), 0.72)
        aircraft["sources"].append("adsbdb.callsign")

    return aircraft


def _apply_aerodatabox(aircraft: dict, flight: dict) -> dict:
    dep_info = flight.get("departure") or {}
    arr_info = flight.get("arrival") or {}
    dep_airport = _normalize_aerodatabox_airport(dep_info.get("airport"))
    dst_airport = _normalize_aerodatabox_airport(arr_info.get("airport"))
    if dep_airport:
        aircraft["departure_airport"] = dep_airport
        aircraft["departure"] = _display_airport(dep_airport)
        aircraft["scheduled_departure"] = _parse_time(dep_info.get("scheduledTime"))
        aircraft["actual_departure"] = _parse_time(dep_info.get("actualTime"))
    if dst_airport:
        aircraft["destination_airport"] = dst_airport
        aircraft["destination"] = _display_airport(dst_airport)
        aircraft["scheduled_arrival"] = _parse_time(arr_info.get("scheduledTime"))
        aircraft["estimated_arrival"] = _parse_time(arr_info.get("estimatedTime"))
    airl = flight.get("airline") or {}
    aircraft["airline"] = airl.get("name") or aircraft.get("airline")
    aircraft["airline_icao"] = airl.get("icao") or aircraft.get("airline_icao")
    aircraft["airline_iata"] = airl.get("iata") or aircraft.get("airline_iata")
    if (flight.get("aircraft") or {}).get("reg"):
        aircraft["registration"] = aircraft["registration"] or flight["aircraft"]["reg"]
    if dep_airport or dst_airport:
        aircraft["confidence"]["route"] = max(aircraft["confidence"].get("route", 0), 0.95)
        aircraft["sources"].append("aerodatabox")
    return aircraft


def _apply_aviationstack(aircraft: dict, flight: dict) -> dict:
    dep_info = flight.get("departure") or {}
    arr_info = flight.get("arrival") or {}

    dep_airport = _normalize_aviationstack_airport(dep_info)
    arr_airport = _normalize_aviationstack_airport(arr_info)

    if dep_airport and dep_airport.get("iata"):
        aircraft["departure_airport"] = dep_airport
        aircraft["departure"] = _display_airport(dep_airport)
        aircraft["scheduled_departure"] = aircraft.get("scheduled_departure") or _parse_iso(
            dep_info.get("scheduled")
        )
        actual = _parse_iso(dep_info.get("actual") or dep_info.get("actual_runway"))
        if actual:
            aircraft["actual_departure"] = actual

    if arr_airport and arr_airport.get("iata"):
        aircraft["destination_airport"] = arr_airport
        aircraft["destination"] = _display_airport(arr_airport)
        aircraft["scheduled_arrival"] = aircraft.get("scheduled_arrival") or _parse_iso(
            arr_info.get("scheduled")
        )
        estimated = _parse_iso(arr_info.get("estimated") or arr_info.get("estimated_runway"))
        if estimated:
            aircraft["estimated_arrival"] = estimated

    airl = flight.get("airline") or {}
    aircraft["airline"] = aircraft.get("airline") or airl.get("name")
    aircraft["airline_icao"] = aircraft.get("airline_icao") or airl.get("icao")
    aircraft["airline_iata"] = aircraft.get("airline_iata") or airl.get("iata")

    aircraft["confidence"]["route"] = max(aircraft["confidence"].get("route", 0), 0.92)
    aircraft["sources"].append("aviationstack")
    return aircraft


def _apply_flight_cache(aircraft: dict, hit: dict) -> dict:
    def pick(new, old):
        return new if new else old

    aircraft["departure"] = pick(hit.get("departure"), aircraft.get("departure"))
    aircraft["destination"] = pick(hit.get("destination"), aircraft.get("destination"))

    dep = hit.get("departureAirport") or hit.get("departure_airport")
    dst = hit.get("destinationAirport") or hit.get("destination_airport")
    if dep:
        aircraft["departure_airport"] = dep
    if dst:
        aircraft["destination_airport"] = dst

    for src_key, dst_key in [
        ("scheduledDepartureIso", "scheduled_departure"),
        ("actualDepartureIso", "actual_departure"),
        ("scheduledArrivalIso", "scheduled_arrival"),
        ("estimatedArrivalIso", "estimated_arrival"),
    ]:
        aircraft[dst_key] = pick(hit.get(src_key), aircraft.get(dst_key))

    for src_key, dst_key in [
        ("elapsedFlightTimeMinutes", "elapsed_minutes"),
        ("remainingFlightTimeMinutes", "remaining_minutes"),
        ("totalFlightTimeMinutes", "total_minutes"),
    ]:
        if hit.get(src_key) is not None:
            aircraft[dst_key] = hit[src_key]

    for src_key, dst_key in [
        ("airline", "airline"),
        ("airlineIcao", "airline_icao"),
        ("airlineIata", "airline_iata"),
        ("registration", "registration"),
        ("aircraftType", "aircraft_type"),
        ("aircraftModel", "aircraft_model"),
        ("registeredOwner", "registered_owner"),
    ]:
        aircraft[dst_key] = pick(hit.get(src_key), aircraft.get(dst_key))

    conf = hit.get("confidence", 0.9)
    aircraft["confidence"]["route"] = max(
        aircraft["confidence"].get("route", 0), hit.get("routeConfidence", conf)
    )
    aircraft["confidence"]["identity"] = max(
        aircraft["confidence"].get("identity", 0), hit.get("identityConfidence", conf)
    )
    aircraft["sources"].append(f"local.flight-cache:{hit.get('source', 'manual')}")
    return aircraft


def _apply_local_cache(aircraft: dict, icao24: str, cache_dir: str) -> dict:
    ac_cache = _load_json(os.path.join(cache_dir, "aircraft-cache.json"))
    ac_hit = ac_cache.get(icao24.lower()) or ac_cache.get(icao24.upper())
    if ac_hit:
        aircraft["registration"] = ac_hit.get("registration") or aircraft.get("registration")
        aircraft["aircraft_type"] = ac_hit.get("aircraftType") or aircraft.get("aircraft_type")
        aircraft["aircraft_model"] = ac_hit.get("aircraftModel") or aircraft.get("aircraft_model")
        aircraft["registered_owner"] = ac_hit.get("registeredOwner") or aircraft.get(
            "registered_owner"
        )
        aircraft["confidence"]["aircraft"] = max(
            aircraft["confidence"].get("aircraft", 0), ac_hit.get("confidence", 0.8)
        )
        aircraft["sources"].append("local.aircraft-cache")

    fl_cache = _load_json(os.path.join(cache_dir, "flight-cache.json"))
    for ck in _route_cache_keys(aircraft.get("flight_number"), aircraft.get("callsign")):
        if ck in fl_cache:
            aircraft = _apply_flight_cache(aircraft, fl_cache[ck])
            break

    return aircraft


def _apply_opensky_flights(aircraft: dict, os_flight: dict) -> dict:
    dep_icao = os_flight.get("estDepartureAirport")
    arr_icao = os_flight.get("estArrivalAirport")
    if dep_icao:
        aircraft["departure_airport"] = {"icao": dep_icao}
        aircraft["departure"] = dep_icao
    if arr_icao:
        aircraft["destination_airport"] = {"icao": arr_icao}
        aircraft["destination"] = arr_icao
    if dep_icao or arr_icao:
        aircraft["confidence"]["route"] = max(aircraft["confidence"].get("route", 0), 0.4)
        aircraft["sources"].append("opensky.flights")
    return aircraft


def _derive_timing(aircraft: dict) -> dict:
    departed_at = aircraft.get("actual_departure") or aircraft.get("scheduled_departure")
    if departed_at and aircraft.get("elapsed_minutes") is None:
        try:
            dep_dt = datetime.fromisoformat(departed_at.replace("Z", "+00:00"))
            elapsed = round((datetime.now(timezone.utc) - dep_dt).total_seconds() / 60)
            if elapsed > 0:
                aircraft["elapsed_minutes"] = elapsed
        except Exception:
            pass

    sched_dep = aircraft.get("scheduled_departure")
    sched_arr = aircraft.get("scheduled_arrival")
    if sched_dep and sched_arr and aircraft.get("total_minutes") is None:
        try:
            dep_dt = datetime.fromisoformat(sched_dep.replace("Z", "+00:00"))
            arr_dt = datetime.fromisoformat(sched_arr.replace("Z", "+00:00"))
            total = round((arr_dt - dep_dt).total_seconds() / 60)
            if total > 0:
                aircraft["total_minutes"] = total
        except Exception:
            pass

    if aircraft.get("remaining_minutes") is None:
        aircraft["remaining_minutes"] = _minutes_until(
            aircraft.get("estimated_arrival") or aircraft.get("scheduled_arrival")
        )

    aircraft["departure_time"] = aircraft.get("actual_departure") or aircraft.get(
        "scheduled_departure"
    )
    aircraft["arrival_time"] = aircraft.get("estimated_arrival") or aircraft.get(
        "scheduled_arrival"
    )
    return aircraft


def _derive_logo(aircraft: dict) -> dict:
    if aircraft.get("airline_logo_url"):
        return aircraft
    iata = aircraft.get("airline_iata")
    icao = aircraft.get("airline_icao")
    code = iata or icao
    if code:
        aircraft["airline_logo_url"] = f"https://images.kiwi.com/airlines/64/{code}.png"
    return aircraft


# ---------------------------------------------------------------------------
# API fetch helpers
# ---------------------------------------------------------------------------


async def _adsbdb(session: aiohttp.ClientSession, icao24: str, callsign: str | None) -> dict | None:
    mode_s = icao24.upper()
    norm_cs = callsign.upper() if callsign else None

    if norm_cs:
        key = f"adsbdb:{mode_s}:{norm_cs}"
        cached = _get(key)
        if cached is not None:
            return cached
        try:
            async with asyncio.timeout(3):
                async with session.get(
                    f"{ADSBDB_API}/aircraft/{mode_s}?callsign={norm_cs}"
                ) as resp:
                    if resp.status == 404:
                        _put(key, None, 86400)
                    elif resp.status == 429:
                        _put(key, None, 900)
                        return None
                    elif resp.ok:
                        result = (await resp.json()).get("response")
                        _put(key, result, 86400)
                        if result:
                            return result
        except Exception:
            pass

    key = f"adsbdb:{mode_s}:-"
    cached = _get(key)
    if cached is not None:
        return cached
    try:
        async with asyncio.timeout(3):
            async with session.get(f"{ADSBDB_API}/aircraft/{mode_s}") as resp:
                if resp.status == 404:
                    return _put(key, None, 86400)
                if resp.status == 429:
                    return _put(key, None, 900)
                if resp.ok:
                    result = (await resp.json()).get("response")
                    return _put(key, result, 86400)
    except Exception as err:
        _LOGGER.debug("ADSBDB error: %s", err)
    return None


async def _aerodatabox(session: aiohttp.ClientSession, icao24: str, api_key: str) -> dict | None:
    key = f"aerodatabox:{icao24.lower()}"
    cached = _get(key)
    if cached is not None:
        return cached
    try:
        async with asyncio.timeout(3):
            async with session.get(
                f"{AERODATABOX_API}/flights/icao24/{icao24.lower()}",
                headers={
                    "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
                    "x-rapidapi-key": api_key,
                },
            ) as resp:
                if resp.status == 404:
                    return _put(key, None, 300)
                if resp.status == 429:
                    return _put(key, None, 900)
                if resp.ok:
                    data = await resp.json()
                    flights = data if isinstance(data, list) else data.get("flights", [])
                    active = next(
                        (
                            f
                            for f in flights
                            if f.get("status") in ("EnRoute", "En Route", "Departed")
                        ),
                        flights[0] if flights else None,
                    )
                    return _put(key, active, 300)
    except Exception as err:
        _LOGGER.debug("AeroDataBox error: %s", err)
    return None


async def _aviationstack(
    session: aiohttp.ClientSession, flight_number: str, api_key: str
) -> dict | None:
    iata_flight = flight_number.replace(" ", "")
    key = f"aviationstack:{iata_flight}"
    cached = _get(key)
    if cached is not None:
        return cached
    try:
        async with asyncio.timeout(5):
            async with session.get(
                f"{AVIATIONSTACK_API}/flights",
                params={"access_key": api_key, "flight_iata": iata_flight},
            ) as resp:
                if resp.status == 429:
                    return _put(key, None, 900)
                if not resp.ok:
                    return _put(key, None, 300)
                data = await resp.json()
                flights = (data or {}).get("data") or []
                active = next(
                    (f for f in flights if f.get("flight_status") in ("active", "landed")),
                    flights[0] if flights else None,
                )
                return _put(key, active, 10800)
    except Exception as err:
        _LOGGER.debug("AviationStack error: %s", err)
    return None


async def _opensky_flights(
    session: aiohttp.ClientSession, icao24: str, config: dict
) -> dict | None:
    """Last resort: OpenSky historical flights — airports only, no live times."""
    key = f"opensky_flights:{icao24.lower()}"
    cached = _get(key)
    if cached is not None:
        return cached

    now = int(time.time())
    params = {"icao24": icao24.lower(), "begin": now - 86400, "end": now}
    client_id = config.get("opensky_client_id", "")
    client_secret = config.get("opensky_client_secret", "")
    auth = aiohttp.BasicAuth(client_id, client_secret) if client_id and client_secret else None

    try:
        async with asyncio.timeout(5):
            async with session.get(
                f"{OPENSKY_API}/flights/aircraft",
                params=params,
                auth=auth,
            ) as resp:
                if not resp.ok:
                    return _put(key, None, 3600)
                flights = await resp.json()
                if not flights:
                    return _put(key, None, 3600)
                latest = max(flights, key=lambda f: f.get("lastSeen", 0))
                return _put(key, latest, 3600)
    except Exception as err:
        _LOGGER.debug("OpenSky flights error: %s", err)
    return None


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------


async def enrich_aircraft(
    session: aiohttp.ClientSession,
    aircraft: dict[str, Any],
    config: dict,
) -> dict[str, Any]:
    """Apply enrichment pipeline to a raw aircraft snapshot."""
    icao24 = aircraft["icao24"]
    callsign = aircraft.get("callsign")

    # 1. ADSBDB — aircraft identity + typical route
    adsbdb = await _adsbdb(session, icao24, callsign)
    if adsbdb:
        aircraft = _apply_adsbdb(aircraft, adsbdb)

    # 2. AeroDataBox — live route by ICAO24 (paid, highest quality)
    adb_key = config.get("aerodatabox_api_key", "")
    if adb_key:
        flight = await _aerodatabox(session, icao24, adb_key)
        if flight:
            aircraft = _apply_aerodatabox(aircraft, flight)

    # 3. AviationStack — live route by flight number (free, 1000/month)
    # Only called when AeroDataBox yielded no time data; cached 3h per flight number.
    avs_key = config.get("aviationstack_api_key", "")
    has_times = aircraft.get("scheduled_departure") or aircraft.get("scheduled_arrival")
    if avs_key and aircraft.get("flight_number") and not has_times:
        flight = await _aviationstack(session, aircraft["flight_number"], avs_key)
        if flight:
            aircraft = _apply_aviationstack(aircraft, flight)

    # 4. Local JSON caches
    cache_dir = config.get("cache_dir", "")
    if cache_dir and os.path.isdir(cache_dir):
        aircraft = _apply_local_cache(aircraft, icao24, cache_dir)

    # 5. OpenSky flights — last resort, historical ICAO airports only
    if not aircraft.get("departure_airport") and not aircraft.get("destination_airport"):
        os_flight = await _opensky_flights(session, icao24, config)
        if os_flight:
            aircraft = _apply_opensky_flights(aircraft, os_flight)

    aircraft = _derive_timing(aircraft)
    aircraft = _derive_logo(aircraft)

    return aircraft
