"""API Client for SkyRadar Fusion."""

import logging
import aiohttp
import asyncio
import datetime
from typing import Optional

# from FlightRadar24 import FlightRadar24API
from FlightRadarAPI import FlightRadar24API

from .const import API_BASE_URL

_LOGGER = logging.getLogger(__name__)
logging.getLogger("FlightRadarAPI").setLevel(logging.ERROR)


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
        # Planespotters.net needs an 'User-Agent' header,
        # 403 Forbidden (anti-bot).
        headers = {
            "User-Agent": "SkyRadarFusion/2.0 (Home Assistant; +https://github.com/DonTranQuiL/ADSB-For-Home-assistant)"
        }
        try:
            async with self._session.get(url, headers=headers, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
                return None
        except Exception as err:
            _LOGGER.debug("Fout bij aanroep %s: %s", url, err)
            return None

    def _get_fr24_data_sync(self, identifier: str) -> dict | None:
        try:
            flights = self.fr24.search(identifier)
            live = flights.get("live", [])
            if not live:
                return None

            found = live[0]
            flight_id = found.get("id")
            if not flight_id:
                return None

            from FlightRadarAPI import Flight

            dummy_flight = Flight(flight_id, [None] * 20)

            details = self.fr24.get_flight_details(dummy_flight)
            if not details:
                return None

            airport = details.get("airport", {}) or {}
            origin = airport.get("origin", {}) or {}
            destination = airport.get("destination", {}) or {}

            time_info = details.get("time", {}) or {}
            scheduled = time_info.get("scheduled", {}) or {}
            real = time_info.get("real", {}) or {}
            estimated = time_info.get("estimated", {}) or {}

            airline = details.get("airline", {}) or {}
            aircraft = details.get("aircraft", {}) or {}
            images = aircraft.get("images", {}) or {}

            # --- NIEUW: Extract the flightnumber ---
            identification = details.get("identification", {}) or {}
            number_info = identification.get("number", {}) or {}
            fr24_flight_number = (
                number_info.get("default", "Unknown")
                if isinstance(number_info, dict)
                else "Unknown"
            )

            # --- NEW: Extract aircraft code (example. B738) ---
            aircraft_model = aircraft.get("model", {}) or {}
            fr24_aircraft_code = (
                aircraft_model.get("code", "Unknown")
                if isinstance(aircraft_model, dict)
                else "Unknown"
            )

            photo_large = None
            if images and isinstance(images, dict):
                large_imgs = images.get("large", [])
                if large_imgs and len(large_imgs) > 0:
                    photo_large = large_imgs[0].get("src")

            return {
                "fr24_route": f"{origin.get('code', {}).get('iata', 'N/A')} - {destination.get('code', {}).get('iata', 'N/A')}",
                "airline": airline.get("name", "Unknown"),
                "airline_icao": airline.get("code", {}).get("icao", "N/A"),
                "airport_origin_name": origin.get("name", "Unknown"),
                "airport_origin_city": origin.get("position", {})
                .get("region", {})
                .get("city", "Unknown"),
                "airport_origin_country_code": origin.get("position", {})
                .get("country", {})
                .get("code", "Unknown"),
                # --- NIEUW: IATA en ICAO codes filters ---
                "airport_origin_code_iata": origin.get("code", {}).get("iata", "N/A"),
                "airport_origin_code_icao": origin.get("code", {}).get("icao", "N/A"),
                "airport_destination_code_iata": destination.get("code", {}).get(
                    "iata", "N/A"
                ),
                "airport_destination_code_icao": destination.get("code", {}).get(
                    "icao", "N/A"
                ),
                # ---------------------------------------------------------------
                "airport_destination_name": destination.get("name", "Unknown"),
                "airport_destination_country_name": destination.get("position", {})
                .get("country", {})
                .get("name", "Unknown"),
                "fr24_photo": photo_large,
                "fr24_scheduled_departure": format_unix_time(
                    scheduled.get("departure")
                ),
                "fr24_scheduled_departure_epoch": scheduled.get("departure"),
                "fr24_real_departure_epoch": real.get("departure"),
                "fr24_real_departure": format_unix_time(real.get("departure")),
                "fr24_scheduled_arrival_epoch": scheduled.get("arrival"),
                "fr24_scheduled_arrival": format_unix_time(scheduled.get("arrival")),
                "fr24_estimated_arrival_epoch": estimated.get("arrival"),
                "fr24_estimated_arrival": format_unix_time(estimated.get("arrival")),
                "fr24_flight_number": fr24_flight_number,
                "fr24_aircraft_code": fr24_aircraft_code,
            }

        except Exception as err:
            _LOGGER.debug("FR24 Lookup failed for %s: %s", identifier, err)
            return None

    async def get_fr24_enrichment(self, identifier: str):
        if not self.hass:
            return None
        return await self.hass.async_add_executor_job(
            self._get_fr24_data_sync, identifier
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
            data = await self._request(url)
            if data and "photos" in data and len(data["photos"]) > 0:
                photo = data["photos"][0]
                return photo.get("thumbnail_large", {}).get("src") or photo.get(
                    "thumbnail", {}
                ).get("src")
            return None

        if registration and registration != "Unknown":
            url = f"https://api.planespotters.net/pub/photos/reg/{registration.strip()}"
            photo_url = await fetch_photo_from_url(url)
            if photo_url:
                return photo_url

        if hex_code and hex_code != "Unknown":
            url = f"https://api.planespotters.net/pub/photos/hex/{hex_code.strip()}"
            photo_url = await fetch_photo_from_url(url)
            if photo_url:
                return photo_url

        return None
