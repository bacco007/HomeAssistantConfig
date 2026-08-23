from __future__ import annotations

import logging
import re
from datetime import timedelta
from typing import Any

import aiohttp
import async_timeout

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import CoordinatorEntity, DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)

CFB_RANKINGS_URL = (
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings"
)
CFB_RANKINGS_STORAGE_VERSION = 1


class CFBRankingsCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator for ESPN College Football rankings."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the rankings coordinator."""
        self.hass = hass
        self.entry = entry
        self.session = async_get_clientsession(hass)
        self._last_good_data: dict[str, Any] | None = None
        self._store: Store = Store(
            hass,
            CFB_RANKINGS_STORAGE_VERSION,
            f"{DOMAIN}.cfb_rankings.{entry.entry_id}",
        )

        raw_interval = entry.options.get(
            CONF_POLL_INTERVAL,
            entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )
        try:
            poll_interval = int(raw_interval)
        except (TypeError, ValueError):
            poll_interval = DEFAULT_POLL_INTERVAL
        poll_interval = max(15, min(poll_interval, 600))

        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_cfb_rankings",
            update_interval=timedelta(seconds=poll_interval),
        )

    async def async_load_cached_data(self) -> None:
        """Load the last successful rankings payload from storage."""
        stored = await self._store.async_load()
        if isinstance(stored, dict):
            self._last_good_data = stored
            self.data = stored

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch and normalize ESPN College Football rankings."""
        now = dt_util.utcnow().isoformat()

        try:
            payload = await self._fetch_json()
            normalized = self._normalize_rankings(payload)
            normalized["_sports_ticker_meta"] = {
                "stale": False,
                "source": "espn",
                "league": "cfb",
                "data_type": "rankings",
                "last_successful_update": now,
                "last_attempted_update": now,
                "last_error": None,
            }
            self._last_good_data = normalized
            await self._store.async_save(normalized)
            return normalized
        except Exception as err:
            _LOGGER.warning(
                "Failed to update College Football rankings. Keeping last good data if available. Error: %s",
                err,
            )

            if self._last_good_data:
                cached = dict(self._last_good_data)
                meta = dict(cached.get("_sports_ticker_meta", {}))
                meta.update(
                    {
                        "stale": True,
                        "source": "cache",
                        "last_attempted_update": now,
                        "last_error": str(err),
                    }
                )
                cached["_sports_ticker_meta"] = meta
                return cached

            return {
                "league": "cfb",
                "data_type": "rankings",
                "season": None,
                "week": None,
                "primary_poll": None,
                "polls": {},
                "available_rankings": [],
                "_sports_ticker_meta": {
                    "stale": True,
                    "source": "cache",
                    "league": "cfb",
                    "data_type": "rankings",
                    "last_successful_update": None,
                    "last_attempted_update": now,
                    "last_error": str(err),
                },
            }

    async def _fetch_json(self) -> dict[str, Any]:
        """Fetch rankings JSON from ESPN."""
        async with async_timeout.timeout(20):
            response = await self.session.get(CFB_RANKINGS_URL)
            if response.status != 200:
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info,
                    history=response.history,
                    status=response.status,
                    message=f"Unexpected status {response.status}",
                    headers=response.headers,
                )
            payload = await response.json()

        if not isinstance(payload, dict):
            raise ValueError("ESPN rankings response was not a JSON object")
        if not isinstance(payload.get("rankings"), list):
            raise ValueError("ESPN rankings response did not contain rankings")
        return payload

    @classmethod
    def _normalize_rankings(cls, payload: dict[str, Any]) -> dict[str, Any]:
        """Normalize ESPN polls into card-friendly attributes."""
        polls: dict[str, Any] = {}

        for poll in payload.get("rankings", []):
            if not isinstance(poll, dict):
                continue

            poll_name = str(poll.get("name") or poll.get("shortName") or "Rankings")
            poll_key = cls._poll_key(poll_name)

            ranks = [
                cls._normalize_rank_row(row)
                for row in poll.get("ranks", [])
                if isinstance(row, dict)
            ]
            dropped_out = [
                cls._normalize_rank_row(row, dropped_out=True)
                for row in poll.get("droppedOut", [])
                if isinstance(row, dict)
            ]

            polls[poll_key] = {
                "name": poll_name,
                "short_name": poll.get("shortName"),
                "headline": poll.get("headline"),
                "ranks": ranks,
                "dropped_out": dropped_out,
            }

        preferred = next(
            (key for key in ("cfp", "ap_top_25", "coaches_poll") if key in polls),
            next(iter(polls), None),
        )

        latest_season = payload.get("latestSeason")
        if not isinstance(latest_season, dict):
            latest_season = {}

        latest_week = payload.get("latestWeek")
        if not isinstance(latest_week, dict):
            latest_week = {}

        available = []
        for item in payload.get("availableRankings", []):
            if isinstance(item, dict):
                available.append(
                    {
                        "name": item.get("name"),
                        "short_name": item.get("shortName"),
                        "id": item.get("id"),
                    }
                )

        if not polls:
            raise ValueError("ESPN returned no College Football polls")

        return {
            "league": "cfb",
            "data_type": "rankings",
            "season": latest_season.get("year"),
            "season_start": latest_season.get("startDate"),
            "season_end": latest_season.get("endDate"),
            "week": latest_week.get("number"),
            "primary_poll": preferred,
            "polls": polls,
            "available_rankings": available,
        }

    @staticmethod
    def _poll_key(name: str) -> str:
        """Return a stable short key for a poll name."""
        normalized = name.strip().lower()
        if "playoff" in normalized:
            return "cfp"
        if normalized.startswith("ap") or "associated press" in normalized:
            return "ap_top_25"
        if "coach" in normalized:
            return "coaches_poll"

        slug = re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")
        return slug or "rankings"

    @staticmethod
    def _normalize_rank_row(
        row: dict[str, Any],
        dropped_out: bool = False,
    ) -> dict[str, Any]:
        """Normalize one ranked team row."""
        team = row.get("team")
        if not isinstance(team, dict):
            team = {}

        logo = team.get("logo")
        logos = team.get("logos")
        if not logo and isinstance(logos, list) and logos:
            first_logo = logos[0]
            if isinstance(first_logo, dict):
                logo = first_logo.get("href") or first_logo.get("url")

        display_name = team.get("displayName")
        if not display_name:
            parts = [team.get("location"), team.get("name")]
            display_name = " ".join(str(part) for part in parts if part)

        return {
            "rank": None if dropped_out else row.get("current"),
            "previous_rank": row.get("previous"),
            "trend": row.get("trend"),
            "first_place_votes": row.get("firstPlaceVotes"),
            "points": row.get("points"),
            "record": row.get("recordSummary"),
            "team_id": team.get("id"),
            "abbreviation": team.get("abbreviation"),
            "location": team.get("location"),
            "name": team.get("name"),
            "nickname": team.get("nickname"),
            "display_name": display_name or None,
            "short_display_name": team.get("shortDisplayName"),
            "color": team.get("color"),
            "alternate_color": team.get("alternateColor"),
            "logo": logo,
        }


class ESPNCFBRankings(CoordinatorEntity[CFBRankingsCoordinator], SensorEntity):
    """College Football rankings sensor."""

    _attr_icon = "mdi:podium-gold"
    _attr_unique_id = "espn_cfb_rankings"
    _attr_name = "ESPN College Football Rankings"

    def __init__(self, coordinator: CFBRankingsCoordinator) -> None:
        """Initialize the rankings sensor."""
        super().__init__(coordinator)

    @property
    def available(self) -> bool:
        """Remain available when rankings or cached rankings exist."""
        return isinstance(self.coordinator.data, dict)

    @property
    def native_value(self) -> str:
        """Return the primary poll and number of ranked teams."""
        data = self.coordinator.data or {}
        polls = data.get("polls", {})
        if not isinstance(polls, dict) or not polls:
            return "No rankings"

        primary_key = data.get("primary_poll")
        primary = polls.get(primary_key, {}) if primary_key else {}
        if not isinstance(primary, dict):
            primary = {}

        name = primary.get("name") or "Rankings"
        ranks = primary.get("ranks", [])
        count = len(ranks) if isinstance(ranks, list) else 0

        meta = data.get("_sports_ticker_meta", {})
        if isinstance(meta, dict) and meta.get("stale"):
            return f"Cached - {name} - {count} teams"
        return f"{name} - {count} teams"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose normalized CFB rankings and convenient poll aliases."""
        data = self.coordinator.data or {}
        polls = data.get("polls", {})
        if not isinstance(polls, dict):
            polls = {}

        meta = data.get("_sports_ticker_meta", {})
        if not isinstance(meta, dict):
            meta = {}

        return {
            "league": "cfb",
            "league_name": "College Football",
            "data_type": "rankings",
            "season": data.get("season"),
            "season_start": data.get("season_start"),
            "season_end": data.get("season_end"),
            "week": data.get("week"),
            "primary_poll": data.get("primary_poll"),
            "available_rankings": data.get("available_rankings", []),
            "polls": polls,
            "ap_top_25": polls.get("ap_top_25", {}).get("ranks", []),
            "coaches_poll": polls.get("coaches_poll", {}).get("ranks", []),
            "cfp": polls.get("cfp", {}).get("ranks", []),
            "ap_dropped_out": polls.get("ap_top_25", {}).get("dropped_out", []),
            "coaches_dropped_out": polls.get("coaches_poll", {}).get("dropped_out", []),
            "cfp_dropped_out": polls.get("cfp", {}).get("dropped_out", []),
            "stale": bool(meta.get("stale", False)),
            "source": meta.get("source"),
            "last_successful_update": meta.get("last_successful_update"),
            "last_attempted_update": meta.get("last_attempted_update"),
            "last_error": meta.get("last_error"),
        }
