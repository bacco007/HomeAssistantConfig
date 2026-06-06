"""API Client for SkyRadar Fusion."""

import logging
import aiohttp
import asyncio
import datetime
from typing import Optional
from FlightRadar24 import FlightRadar24API

from .const import API_BASE_URL

_LOGGER = logging.getLogger(__name__)
logging.getLogger("FlightRadarAPI").setLevel(logging.ERROR)

# --- TRAFFIC CONTROLLERS (ANTI-RATE LIMIT) ---
# Enforces a strict 1-by-1 queue for Airplanes.live to prevent IP bans
_airplanes_semaphore = asyncio.Semaphore(1)


def format_unix_time(unix_ts):
    if not unix_ts:
        return None
    try:
        return datetime.datetime.fromtimestamp(unix_ts).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return str(unix_ts)


class SkyRadarFusionAPI:
    def __init__(self, session: aiohttp.ClientSession, hass=None):
        self._session = session
        self._lock = asyncio.Lock()
        self.hass = hass
        self.fr24 = FlightRadar24API()

    async def _request(self, url: str) -> Optional[dict]:
        # --- THE AIRPLANES.LIVE RATE LIMITER ---
        # This queue ensures we NEVER hit airplanes.live faster than 1 request per 1.2 seconds.
        async with _airplanes_semaphore:
            headers = {
                "User-Agent": "SkyRadarFusion/2.0 (Home Assistant; +https://github.com/DonTranQuiL/ADSB-For-Home-assistant)"
            }
            try:
                async with self._session.get(
                    url, headers=headers, timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Strictly wait 1.2 seconds before the next call is allowed to fire
                        await asyncio.sleep(1.2)
                        return data
                    elif response.status == 429:
                        _LOGGER.warning(
                            "Rate limited by Airplanes.live! Slowing down..."
                        )
                        await asyncio.sleep(5.0)
                        return None
                    else:
                        await asyncio.sleep(1.2)
                        return None
            except Exception as err:
                _LOGGER.debug("Error during Airplanes.live request %s: %s", url, err)
                await asyncio.sleep(1.2)
                return None

    def _get_fr24_data_sync(
        self,
        identifier: str,
        lat: float = None,
        lon: float = None,
        hex_code: str = None,
    ) -> dict | None:
        try:
            flight_id = None
            dummy_flight = None
            clean_id = identifier.strip().upper()
            clean_hex = (
                hex_code.strip().upper() if hex_code and hex_code != "Unknown" else None
            )

            try:
                flights = self.fr24.get_flights(registration=clean_id)
                if flights:
                    dummy_flight = flights[0]
                    flight_id = dummy_flight.id
            except Exception:
                pass

            if not flight_id:
                try:
                    flights = self.fr24.get_flights(flight=clean_id)
                    if flights:
                        dummy_flight = flights[0]
                        flight_id = dummy_flight.id
                except Exception:
                    pass

            if not flight_id and lat is not None and lon is not None:
                try:
                    bounds = f"{lat + 0.5:.2f},{lat - 0.5:.2f},{lon - 0.5:.2f},{lon + 0.5:.2f}"
                    regional = self.fr24.get_flights(bounds=bounds)
                    for f in regional:
                        f_hex = f.icao_24bit.strip().upper() if f.icao_24bit else ""
                        f_reg = f.registration.strip().upper() if f.registration else ""
                        f_call = f.callsign.strip().upper() if f.callsign else ""

                        if (clean_hex and clean_hex == f_hex) or clean_id in (
                            f_reg,
                            f_call,
                        ):
                            dummy_flight = f
                            flight_id = f.id
                            break
                except Exception:
                    pass

            if not flight_id or not dummy_flight:
                return None

            details = self.fr24.get_flight_details(dummy_flight)
            if not details:
                return None

            def safe_dict(val):
                return val if isinstance(val, dict) else {}

            airport = safe_dict(details.get("airport"))
            origin = safe_dict(airport.get("origin"))
            destination = safe_dict(airport.get("destination"))

            origin_code = safe_dict(origin.get("code"))
            dest_code = safe_dict(destination.get("code"))
            origin_pos = safe_dict(origin.get("position"))
            origin_reg = safe_dict(origin_pos.get("region"))
            origin_country = safe_dict(origin_pos.get("country"))

            dest_pos = safe_dict(destination.get("position"))
            dest_country = safe_dict(dest_pos.get("country"))

            time_info = safe_dict(details.get("time"))
            scheduled = safe_dict(time_info.get("scheduled"))
            real = safe_dict(time_info.get("real"))
            estimated = safe_dict(time_info.get("estimated"))

            airline = safe_dict(details.get("airline"))
            airline_code = safe_dict(airline.get("code"))

            aircraft = safe_dict(details.get("aircraft"))
            aircraft_model = safe_dict(aircraft.get("model"))
            images = safe_dict(aircraft.get("images"))

            identification = safe_dict(details.get("identification"))
            number_info = safe_dict(identification.get("number"))

            photo_large = None
            large_imgs = images.get("large", [])
            if isinstance(large_imgs, list) and len(large_imgs) > 0:
                photo_large = safe_dict(large_imgs[0]).get("src")

            return {
                "fr24_route": f"{origin_code.get('iata') or 'N/A'} - {dest_code.get('iata') or 'N/A'}",
                "airline": airline.get("name") or "Unknown",
                "airline_icao": airline_code.get("icao") or "N/A",
                "airport_origin_name": origin.get("name") or "Unknown",
                "airport_origin_city": origin_reg.get("city") or "Unknown",
                "airport_origin_country_code": origin_country.get("code") or "Unknown",
                "airport_origin_code_iata": origin_code.get("iata") or "N/A",
                "airport_origin_code_icao": origin_code.get("icao") or "N/A",
                "airport_destination_code_iata": dest_code.get("iata") or "N/A",
                "airport_destination_code_icao": dest_code.get("icao") or "N/A",
                "airport_destination_name": destination.get("name") or "Unknown",
                "airport_destination_country_name": dest_country.get("name")
                or "Unknown",
                "fr24_photo": photo_large,
                "fr24_scheduled_departure": format_unix_time(
                    scheduled.get("departure")
                ),
                "fr24_scheduled_departure_epoch": scheduled.get("departure"),
                "fr24_real_departure": format_unix_time(real.get("departure")),
                "fr24_real_departure_epoch": real.get("departure"),
                "fr24_scheduled_arrival": format_unix_time(scheduled.get("arrival")),
                "fr24_scheduled_arrival_epoch": scheduled.get("arrival"),
                "fr24_estimated_arrival": format_unix_time(estimated.get("arrival")),
                "fr24_estimated_arrival_epoch": estimated.get("arrival"),
                "fr24_flight_number": number_info.get("default") or "Unknown",
                "fr24_aircraft_code": aircraft_model.get("code") or "Unknown",
                # --- Dynamic Telemetry & ON GROUND FLAG ---
                "fr24_lat": getattr(dummy_flight, "latitude", None),
                "fr24_lon": getattr(dummy_flight, "longitude", None),
                "fr24_track": getattr(dummy_flight, "heading", None),
                "fr24_alt": getattr(dummy_flight, "altitude", None),
                "fr24_gs": getattr(dummy_flight, "ground_speed", None),
                "fr24_squawk": getattr(dummy_flight, "squawk", None),
                "fr24_hex": getattr(dummy_flight, "icao_24bit", None),
                "fr24_on_ground": getattr(dummy_flight, "on_ground", 0),
            }

        except Exception as err:
            _LOGGER.debug("FR24 Full Sync Lookup failed: %s", err)
            return None

    async def get_fr24_enrichment(
        self,
        identifier: str,
        lat: float = None,
        lon: float = None,
        hex_code: str = None,
    ):
        if not self.hass:
            return None
        return await self.hass.async_add_executor_job(
            self._get_fr24_data_sync, identifier, lat, lon, hex_code
        )

    async def get_aircraft_by_hex(self, hex_code: str):
        res = await self._request(f"{API_BASE_URL}/hex/{hex_code.strip().lower()}")
        return res.get("ac", []) if res else []

    async def get_aircraft_by_callsign(self, callsign: str):
        res = await self._request(f"{API_BASE_URL}/callsign/{callsign.strip().upper()}")
        return res.get("ac", []) if res else []

    async def get_aircraft_by_reg(self, registration: str):
        res = await self._request(f"{API_BASE_URL}/reg/{registration.strip().upper()}")
        return res.get("ac", []) if res else []

    async def get_aircraft_in_zone(self, lat: float, lon: float, radius: int):
        res = await self._request(f"{API_BASE_URL}/point/{lat}/{lon}/{radius}")
        return res.get("ac", []) if res else []

    async def get_global_emergencies(self):
        res = await self._request(f"{API_BASE_URL}/squawk/7700")
        return res.get("ac", []) if res else []

    async def get_global_military(self):
        res = await self._request(f"{API_BASE_URL}/mil")
        return res.get("ac", []) if res else []

    async def get_planespotters_photo(
        self, registration: str, hex_code: str = None
    ) -> Optional[str]:

        async def fetch_photo_from_url(url: str):
            headers = {
                "User-Agent": "SkyRadarFusion/2.0 (Home Assistant; +https://github.com/DonTranQuiL/ADSB-For-Home-assistant)"
            }
            try:
                async with self._session.get(
                    url, headers=headers, timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data and "photos" in data and len(data["photos"]) > 0:
                            photo = data["photos"][0]
                            return photo.get("thumbnail_large", {}).get(
                                "src"
                            ) or photo.get("thumbnail", {}).get("src")
                    return None
            except Exception:
                return None

        photo_url = None
        if registration and registration != "Unknown":
            url = f"https://api.planespotters.net/pub/photos/reg/{registration.strip()}"
            photo_url = await fetch_photo_from_url(url)

        if not photo_url and hex_code and hex_code != "Unknown":
            url = f"https://api.planespotters.net/pub/photos/hex/{hex_code.strip()}"
            photo_url = await fetch_photo_from_url(url)

        return photo_url
