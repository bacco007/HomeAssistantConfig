"""Coordinator for fetching and normalizing aircraft data."""

from __future__ import annotations

import asyncio
import logging
from datetime import timedelta
from typing import Any
from urllib.parse import quote

from aiohttp import ClientError
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    CONF_DATA_URL,
    CONF_HEXDB_ENABLED,
    CONF_MAX_AGE,
    CONF_UPDATE_INTERVAL,
    DEFAULT_HEXDB_ENABLED,
    DEFAULT_MAX_AGE,
    DEFAULT_UPDATE_INTERVAL,
    DOMAIN,
    HEXDB_IMAGE_THUMB_ENDPOINT,
    HEXDB_LOOKUP_ENDPOINT,
    MAX_HEXDB_LOOKUPS_PER_UPDATE,
    normalize_data_url,
)

LOGGER = logging.getLogger(__name__)


class FlightCardDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Manage polling and enrichment for ADS-B SkyVista data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.entry = entry
        self._session = async_get_clientsession(hass)
        self._hexdb_cache: dict[str, dict[str, str] | None] = {}
        self._hexdb_in_flight: set[str] = set()

        update_seconds = _clamp_int(
            self._option_value(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
            min_value=2,
            max_value=600,
            fallback=DEFAULT_UPDATE_INTERVAL,
        )

        super().__init__(
            hass,
            logger=LOGGER,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=timedelta(seconds=update_seconds),
        )

    def _option_value(self, key: str, fallback: Any) -> Any:
        if key in self.entry.options:
            return self.entry.options[key]
        return self.entry.data.get(key, fallback)

    @property
    def data_url(self) -> str:
        return normalize_data_url(self._option_value(CONF_DATA_URL, ""))

    @property
    def max_age(self) -> int:
        return _clamp_int(
            self._option_value(CONF_MAX_AGE, DEFAULT_MAX_AGE),
            min_value=1,
            max_value=3600,
            fallback=DEFAULT_MAX_AGE,
        )

    @property
    def hexdb_enabled(self) -> bool:
        return bool(self._option_value(CONF_HEXDB_ENABLED, DEFAULT_HEXDB_ENABLED))

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch and normalize aircraft data."""
        try:
            if not self.data_url:
                raise UpdateFailed("data_url is empty")

            payload = await self._fetch_json(self.data_url)
            geojson = _aircraft_to_geojson(payload, max_age_seconds=self.max_age)

            if self.hexdb_enabled:
                await self._enrich_with_hexdb(geojson)

            return {
                "geojson": geojson,
                "aircraft_count": len(geojson["features"]),
                "updated": dt_util.utcnow().isoformat(),
                "data_url": self.data_url,
                "max_age": self.max_age,
                "hexdb_enabled": self.hexdb_enabled,
            }
        except UpdateFailed:
            raise
        except (ClientError, TimeoutError, ValueError) as err:
            raise UpdateFailed(f"Failed to update flight data: {err}") from err
        except Exception as err:  # pragma: no cover - defensive safety net
            raise UpdateFailed(f"Unexpected update error: {err}") from err

    async def _fetch_json(self, url: str) -> dict[str, Any]:
        async with self._session.get(
            url,
            headers={"Accept": "application/json"},
            raise_for_status=True,
        ) as response:
            data = await response.json(content_type=None)

        if not isinstance(data, dict):
            raise ValueError("Expected JSON object payload")
        return data

    async def _enrich_with_hexdb(self, geojson: dict[str, Any]) -> None:
        features = geojson.get("features")
        if not isinstance(features, list) or not features:
            return

        self._apply_cached_hexdb(features)

        candidates: list[str] = []
        for feature in features:
            props = feature.get("properties") if isinstance(feature, dict) else None
            if not isinstance(props, dict):
                continue

            hex_value = _normalize_hex(props.get("hex"))
            if not hex_value:
                continue
            if hex_value in self._hexdb_cache or hex_value in self._hexdb_in_flight:
                continue

            candidates.append(hex_value)
            if len(candidates) >= MAX_HEXDB_LOOKUPS_PER_UPDATE:
                break

        if not candidates:
            return

        for hex_value in candidates:
            self._hexdb_in_flight.add(hex_value)

        try:
            results = await asyncio.gather(
                *(self._fetch_hexdb_aircraft(hex_value) for hex_value in candidates),
                return_exceptions=True,
            )

            for hex_value, result in zip(candidates, results, strict=False):
                if isinstance(result, Exception):
                    self._hexdb_cache[hex_value] = None
                    continue
                self._hexdb_cache[hex_value] = result
        finally:
            for hex_value in candidates:
                self._hexdb_in_flight.discard(hex_value)

        self._apply_cached_hexdb(features)

    def _apply_cached_hexdb(self, features: list[dict[str, Any]]) -> None:
        for feature in features:
            props = feature.get("properties")
            if not isinstance(props, dict):
                continue

            hex_value = _normalize_hex(props.get("hex"))
            if not hex_value:
                continue

            info = self._hexdb_cache.get(hex_value)
            if not info:
                continue

            _merge_hexdb_properties(props, info)

    async def _fetch_hexdb_aircraft(self, hex_value: str) -> dict[str, str] | None:
        lookup_url = f"{HEXDB_LOOKUP_ENDPOINT}{quote(hex_value)}"
        image_url_task = asyncio.create_task(self._fetch_hexdb_image_url(hex_value))

        try:
            async with self._session.get(
                lookup_url,
                headers={"Accept": "application/json"},
            ) as response:
                if response.status != 200:
                    await image_url_task
                    return None
                payload = await response.json(content_type=None)
        except (ClientError, TimeoutError, ValueError):
            await image_url_task
            return None

        image_url = await image_url_task

        if not isinstance(payload, dict):
            return None
        if str(payload.get("status", "")) == "404" or payload.get("error"):
            return None

        info = {
            "icaoTypeCode": _first_non_empty([payload.get("ICAOTypeCode")]),
            "manufacturer": _first_non_empty([payload.get("Manufacturer")]),
            "modeS": _first_non_empty([payload.get("ModeS")]),
            "operatorFlagCode": _first_non_empty([payload.get("OperatorFlagCode")]),
            "registeredOwners": _first_non_empty([payload.get("RegisteredOwners")]),
            "registration": _first_non_empty([payload.get("Registration")]),
            "type": _first_non_empty([payload.get("Type")]),
            "imageUrl": image_url,
        }

        if not any(info.values()):
            return None

        return info

    async def _fetch_hexdb_image_url(self, hex_value: str) -> str:
        image_lookup_url = f"{HEXDB_IMAGE_THUMB_ENDPOINT}{quote(hex_value)}"

        try:
            async with self._session.get(
                image_lookup_url,
                headers={"Accept": "text/plain"},
            ) as response:
                if response.status != 200:
                    return ""
                text = (await response.text()).strip()
        except (ClientError, TimeoutError):
            return ""

        if not text:
            return ""
        if text.startswith("http://") or text.startswith("https://"):
            return text
        if text.startswith("/"):
            return f"https://hexdb.io{text}"
        return ""


def _clamp_int(value: Any, min_value: int, max_value: int, fallback: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return fallback
    return max(min_value, min(max_value, number))


def _number_or_none(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if number == number else None


def _first_non_empty(values: list[Any]) -> str:
    for value in values:
        if not isinstance(value, str):
            continue
        cleaned = value.strip()
        if cleaned:
            return cleaned
    return ""


def _normalize_hex(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    cleaned = value.strip().upper()
    if len(cleaned) != 6:
        return ""
    return cleaned if all(ch in "0123456789ABCDEF" for ch in cleaned) else ""


def _resolve_aircraft_type(item: dict[str, Any]) -> str:
    return _first_non_empty(
        [
            item.get("t"),
            item.get("type"),
            item.get("ac_type"),
            item.get("aircraft_type"),
            item.get("desc"),
        ]
    )


def _merge_hexdb_properties(props: dict[str, Any], info: dict[str, str]) -> None:
    if not props.get("aircraft_type") and info.get("type"):
        props["aircraft_type"] = info["type"]

    if info.get("registration"):
        props["registration"] = info["registration"]
    if info.get("manufacturer"):
        props["manufacturer"] = info["manufacturer"]
    if info.get("icaoTypeCode"):
        props["icao_type_code"] = info["icaoTypeCode"]
    if info.get("operatorFlagCode"):
        props["operator_flag_code"] = info["operatorFlagCode"]
    if info.get("registeredOwners"):
        props["registered_owners"] = info["registeredOwners"]
    if info.get("imageUrl"):
        props["airframe_image_url"] = info["imageUrl"]


def _aircraft_to_geojson(payload: dict[str, Any], max_age_seconds: int) -> dict[str, Any]:
    aircraft = payload.get("aircraft")
    if not isinstance(aircraft, list):
        aircraft = []

    features: list[dict[str, Any]] = []

    for raw_item in aircraft:
        if not isinstance(raw_item, dict):
            continue

        lat = _number_or_none(raw_item.get("lat"))
        lon = _number_or_none(raw_item.get("lon"))
        if lat is None or lon is None:
            continue

        seen = _number_or_none(raw_item.get("seen", raw_item.get("seen_pos", 0)))
        if seen is not None and seen > max_age_seconds:
            continue

        hex_value = str(raw_item.get("hex") or "unknown").lower()
        flight = raw_item.get("flight")
        flight_text = flight.strip() if isinstance(flight, str) else ""

        category = raw_item.get("category")
        category_text = category.strip() if isinstance(category, str) else ""

        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat],
                },
                "properties": {
                    "hex": hex_value,
                    "flight": flight_text,
                    "category": category_text,
                    "aircraft_type": _resolve_aircraft_type(raw_item),
                    "registration": "",
                    "manufacturer": "",
                    "icao_type_code": "",
                    "operator_flag_code": "",
                    "registered_owners": "",
                    "airframe_image_url": "",
                    "altitude_ft": _number_or_none(
                        raw_item.get("alt_baro", raw_item.get("altitude", raw_item.get("alt_geom")))
                    ),
                    "speed_kt": _number_or_none(raw_item.get("gs", raw_item.get("speed"))),
                    "track_deg": _number_or_none(raw_item.get("track")),
                    "seen_s": seen,
                },
            }
        )

    return {
        "type": "FeatureCollection",
        "features": features,
    }
