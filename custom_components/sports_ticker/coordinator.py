from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any
from urllib.parse import urlencode

import aiohttp
import async_timeout

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    CONF_LEAGUES,
    CONF_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL,
    DOMAIN,
    LEAGUES,
    STORAGE_KEY,
    STORAGE_VERSION,
)

from .nfl_team_leaders import (
    NFL_SUMMARY_URL,
    empty_team_leaders,
    get_event_team_leaders,
    merge_nfl_team_leaders,
    team_leaders_have_data,
)

from .nfl_game_center import (
    empty_game_center,
    game_center_have_data,
    get_event_game_center,
    merge_game_center_fallback,
    merge_nfl_game_center,
)

_LOGGER = logging.getLogger(__name__)

DEFAULT_LEAGUES = ["mlb", "nfl"]
MLB_PLAYER_LEADERS_KEY = "mlb_player_leaders"
MLB_PLAYER_LEADERS_BASE_URL = (
    "https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/statistics/byathlete"
)
MLB_PLAYER_LEADERS_LIMIT = 10

# ESPN's statistics/byathlete endpoint is undocumented and some stat sort keys
# can return HTTP 400. Keep this list limited to confirmed working categories.
MLB_PLAYER_LEADER_CATEGORIES: list[dict[str, str]] = [
    {
        "key": "home_runs",
        "label": "Home Runs",
        "abbreviation": "HR",
        "category": "batting",
        "sort": "batting.homeRuns:desc",
        "stat_keys": "HR,homeRuns,home runs",
    },
    {
        "key": "rbi",
        "label": "RBI",
        "abbreviation": "RBI",
        "category": "batting",
        "sort": "batting.RBIs:desc",
        "stat_keys": "RBI,RBIs,runsBattedIn,runs batted in",
    },
    {
        "key": "hits",
        "label": "Hits",
        "abbreviation": "H",
        "category": "batting",
        "sort": "batting.hits:desc",
        "stat_keys": "H,hits",
    },
    {
        "key": "stolen_bases",
        "label": "Stolen Bases",
        "abbreviation": "SB",
        "category": "batting",
        "sort": "batting.stolenBases:desc",
        "stat_keys": "SB,stolenBases,stolen bases",
    },
    {
        "key": "wins",
        "label": "Wins",
        "abbreviation": "W",
        "category": "pitching",
        "sort": "pitching.wins:desc",
        "stat_keys": "W,wins",
    },
    {
        "key": "strikeouts",
        "label": "Strikeouts",
        "abbreviation": "SO",
        "category": "pitching",
        "sort": "pitching.strikeouts:desc",
        "stat_keys": "SO,strikeouts",
    },
    {
        "key": "saves",
        "label": "Saves",
        "abbreviation": "SV",
        "category": "pitching",
        "sort": "pitching.saves:desc",
        "stat_keys": "SV,saves",
    },
]


class SportsTickerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator for Sports Ticker data."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
    ) -> None:
        """Initialize coordinator."""
        self.hass = hass
        self.entry = entry
        self.session = async_get_clientsession(hass)

        self.leagues = self._get_configured_leagues(entry)

        poll_interval = self._get_poll_interval(entry)

        self._store: Store = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )

        self._last_good_data: dict[str, Any] = {}

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=poll_interval),
        )

    async def async_load_cached_data(self) -> None:
        """Load cached last-good data from Home Assistant storage."""
        stored = await self._store.async_load()

        if isinstance(stored, dict):
            active_keys = self._active_cache_keys()

            self._last_good_data = {
                key: payload
                for key, payload in stored.items()
                if key in active_keys and isinstance(payload, dict)
            }

            self.data = dict(self._last_good_data)

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch ESPN scoreboard data and preserve last good data on failure."""
        results: dict[str, Any] = {}

        for league in self.leagues:
            url = LEAGUES.get(league)

            if not url:
                _LOGGER.warning("No ESPN URL configured for league: %s", league)
                continue

            previous = self._last_good_data.get(league)

            try:
                payload = await self._fetch_json(url)

                if not self._is_valid_scoreboard_payload(payload):
                    raise ValueError(f"Invalid ESPN payload for {league}")

                if league == "nfl":
                    await self._enrich_nfl_event_details(payload, previous)

                now = dt_util.utcnow().isoformat()

                payload["_sports_ticker_meta"] = {
                    "stale": False,
                    "source": "espn",
                    "league": league,
                    "data_type": "scoreboard",
                    "last_successful_update": now,
                    "last_attempted_update": now,
                    "last_error": None,
                }

                results[league] = payload
                self._last_good_data[league] = payload

            except Exception as err:
                results[league] = self._cached_or_empty_payload(
                    key=league,
                    previous=previous,
                    err=err,
                    empty_payload={"events": []},
                    data_type="scoreboard",
                )

        if "mlb" in self.leagues:
            previous = self._last_good_data.get(MLB_PLAYER_LEADERS_KEY)

            try:
                payload = await self._fetch_mlb_player_leaders(previous)
                now = dt_util.utcnow().isoformat()

                payload["_sports_ticker_meta"] = {
                    "stale": False,
                    "source": "espn",
                    "league": "mlb",
                    "data_type": "player_leaders",
                    "last_successful_update": now,
                    "last_attempted_update": now,
                    "last_error": None,
                }

                results[MLB_PLAYER_LEADERS_KEY] = payload
                self._last_good_data[MLB_PLAYER_LEADERS_KEY] = payload

            except Exception as err:
                results[MLB_PLAYER_LEADERS_KEY] = self._cached_or_empty_payload(
                    key=MLB_PLAYER_LEADERS_KEY,
                    previous=previous,
                    err=err,
                    empty_payload={"league": "mlb", "categories": {}},
                    data_type="player_leaders",
                )

        active_keys = self._active_cache_keys()
        self._last_good_data = {
            key: payload
            for key, payload in self._last_good_data.items()
            if key in active_keys
        }

        await self._store.async_save(self._last_good_data)

        return results

    async def async_shutdown(self) -> None:
        """Shutdown coordinator."""
        await self._store.async_save(self._last_good_data)

    async def _fetch_json(self, url: str) -> dict[str, Any]:
        """Fetch JSON from ESPN."""
        async with async_timeout.timeout(20):
            response = await self.session.get(url)

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
            raise ValueError("ESPN response was not a JSON object")

        return payload

    async def _enrich_nfl_event_details(
        self,
        payload: dict[str, Any],
        previous: dict[str, Any] | None = None,
    ) -> None:
        """Enrich NFL scoreboard events with leaders and live game-center data."""
        events = payload.get("events")
        if not isinstance(events, list):
            return

        previous_events: dict[str, dict[str, Any]] = {}
        if isinstance(previous, dict):
            cached_events = previous.get("events")
            if isinstance(cached_events, list):
                previous_events = {
                    str(event.get("id")): event
                    for event in cached_events
                    if isinstance(event, dict) and event.get("id") is not None
                }

        for event in events:
            if not isinstance(event, dict):
                continue

            competitions = event.get("competitions")
            if not isinstance(competitions, list) or not competitions:
                continue
            competition = competitions[0]
            if not isinstance(competition, dict):
                continue

            # Always expose predictable structures, including scheduled games.
            competition["team_leaders"] = empty_team_leaders()
            competition["game_center"] = empty_game_center()
            # Normalize any live situation already present on the scoreboard.
            # The summary response below adds win probability and drive detail.
            merge_nfl_game_center(event, {})

            event_id = str(event.get("id") or "").strip()
            if not event_id:
                continue

            status = event.get("status")
            if not isinstance(status, dict):
                status = competition.get("status")
            status_type = status.get("type") if isinstance(status, dict) else {}
            state = (
                str(status_type.get("state") or "").lower()
                if isinstance(status_type, dict)
                else ""
            )

            cached_event = previous_events.get(event_id)
            cached = get_event_team_leaders(cached_event)
            cached_game_center = get_event_game_center(cached_event)
            cached_status = (
                cached_event.get("status")
                if isinstance(cached_event, dict)
                else None
            )
            if not isinstance(cached_status, dict) and isinstance(cached_event, dict):
                cached_competitions = cached_event.get("competitions")
                if isinstance(cached_competitions, list) and cached_competitions:
                    cached_competition = cached_competitions[0]
                    if isinstance(cached_competition, dict):
                        cached_status = cached_competition.get("status")
            cached_status_type = (
                cached_status.get("type")
                if isinstance(cached_status, dict)
                else {}
            )
            cached_state = (
                str(cached_status_type.get("state") or "").lower()
                if isinstance(cached_status_type, dict)
                else ""
            )

            # Future games do not have meaningful box-score leaders yet.
            if state == "pre":
                continue

            # Only reuse a final result that was itself fetched after the game
            # was final. A cached live snapshot must get one final refresh.
            if (
                state == "post"
                and cached_state == "post"
                and team_leaders_have_data(cached)
                and game_center_have_data(cached_game_center)
            ):
                competition["team_leaders"] = cached
                competition["game_center"] = cached_game_center
                continue

            try:
                summary = await self._fetch_json(
                    NFL_SUMMARY_URL.format(event_id=event_id)
                )
                merge_nfl_team_leaders(event, summary)
                merge_nfl_game_center(event, summary)
            except Exception as err:
                # A failed summary must never blank the whole NFL scoreboard.
                if team_leaders_have_data(cached):
                    competition["team_leaders"] = cached
                current_game_center = get_event_game_center(event)
                if game_center_have_data(cached_game_center):
                    competition["game_center"] = merge_game_center_fallback(
                        current_game_center,
                        cached_game_center,
                    )
                _LOGGER.warning(
                    "Failed to update NFL team leaders for event %s. Error: %s",
                    event_id,
                    err,
                )

    async def _fetch_mlb_player_leaders(
        self,
        previous: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Fetch MLB player leader categories from ESPN."""
        previous_categories = {}
        if isinstance(previous, dict) and isinstance(previous.get("categories"), dict):
            previous_categories = previous.get("categories", {})

        categories: dict[str, Any] = {}
        errors: dict[str, str] = {}

        for category in MLB_PLAYER_LEADER_CATEGORIES:
            key = category["key"]
            url = self._build_mlb_player_leaders_url(
                category=category["category"],
                sort=category["sort"],
            )

            try:
                payload = await self._fetch_json(url)
                leaders = self._extract_player_leaders(
                    payload=payload,
                    stat_keys=category["stat_keys"].split(","),
                    limit=MLB_PLAYER_LEADERS_LIMIT,
                    sort=category["sort"],
                )

                categories[key] = {
                    "label": category["label"],
                    "abbreviation": category["abbreviation"],
                    "category": category["category"],
                    "sort": category["sort"],
                    "leaders": leaders,
                    "stale": False,
                    "error": None,
                }

            except Exception as err:
                _LOGGER.warning(
                    "Failed to update MLB player leader category %s. Error: %s",
                    key,
                    err,
                )
                errors[key] = str(err)

                if key in previous_categories:
                    cached_category = dict(previous_categories[key])
                    cached_category["stale"] = True
                    cached_category["error"] = str(err)
                    categories[key] = cached_category
                else:
                    categories[key] = {
                        "label": category["label"],
                        "abbreviation": category["abbreviation"],
                        "category": category["category"],
                        "sort": category["sort"],
                        "leaders": [],
                        "stale": True,
                        "error": str(err),
                    }

        successful_categories = [
            key
            for key, category in categories.items()
            if not category.get("stale") and category.get("leaders")
        ]

        if not successful_categories and not categories:
            raise ValueError("No MLB player leader categories were returned")

        return {
            "league": "mlb",
            "data_type": "player_leaders",
            "limit": MLB_PLAYER_LEADERS_LIMIT,
            "categories": categories,
            "successful_categories": successful_categories,
            "category_errors": errors,
        }

    @staticmethod
    def _build_mlb_player_leaders_url(category: str, sort: str) -> str:
        """Build ESPN MLB statistics/byathlete URL."""
        params = {
            "region": "us",
            "lang": "en",
            "contentorigin": "espn",
            "isqualified": "false",
            "category": category,
            "sort": sort,
            "limit": str(MLB_PLAYER_LEADERS_LIMIT),
        }

        return f"{MLB_PLAYER_LEADERS_BASE_URL}?{urlencode(params)}"

    @staticmethod
    def _extract_player_leaders(
        payload: dict[str, Any],
        stat_keys: list[str],
        limit: int,
        sort: str | None = None,
    ) -> list[dict[str, Any]]:
        """Extract compact player leaders from ESPN statistics payload."""
        athletes = payload.get("athletes") or payload.get("items") or []

        if not isinstance(athletes, list):
            return []

        stat_location = SportsTickerCoordinator._find_stat_location(payload, stat_keys, sort)
        flattened_index = SportsTickerCoordinator._find_flat_stat_index(payload, stat_keys, sort)

        leaders: list[dict[str, Any]] = []

        for index, item in enumerate(athletes[:limit], start=1):
            if not isinstance(item, dict):
                continue

            athlete = item.get("athlete") or item.get("player") or item
            if not isinstance(athlete, dict):
                athlete = {}

            team = SportsTickerCoordinator._extract_team(item, athlete)
            value = SportsTickerCoordinator._find_stat_value(
                item,
                stat_keys,
                stat_location=stat_location,
                flattened_index=flattened_index,
            )

            leaders.append(
                {
                    "rank": item.get("rank") or item.get("displayRank") or index,
                    "athlete_id": athlete.get("id"),
                    "name": athlete.get("displayName")
                    or athlete.get("fullName")
                    or athlete.get("name"),
                    "short_name": athlete.get("shortName"),
                    "team": team.get("abbreviation"),
                    "team_name": team.get("name"),
                    "team_logo": team.get("logo"),
                    "value": value,
                    "headshot": SportsTickerCoordinator._extract_headshot(athlete),
                }
            )

        return leaders

    @staticmethod
    def _target_keys(stat_keys: list[str], sort: str | None = None) -> set[str]:
        """Return normalized stat target keys."""
        targets = {
            str(key).strip().lower().replace(" ", "")
            for key in stat_keys
            if str(key).strip()
        }

        if sort and "." in sort:
            sort_key = sort.split(".", 1)[1].split(":", 1)[0]
            targets.add(sort_key.strip().lower().replace(" ", ""))

        return targets

    @staticmethod
    def _normalize(value: Any) -> str:
        """Normalize label/key for matching."""
        return str(value).strip().lower().replace(" ", "")

    @staticmethod
    def _find_stat_location(
        payload: dict[str, Any],
        stat_keys: list[str],
        sort: str | None = None,
    ) -> tuple[int, int] | None:
        """Find nested category/stat index for ESPN statistics payload."""
        targets = SportsTickerCoordinator._target_keys(stat_keys, sort)
        categories = payload.get("categories")

        if not isinstance(categories, list):
            return None

        label_fields = (
            "labels",
            "names",
            "displayNames",
            "descriptions",
            "shortDisplayNames",
        )

        for category_index, category in enumerate(categories):
            if not isinstance(category, dict):
                continue

            for field in label_fields:
                labels = category.get(field)
                if not isinstance(labels, list):
                    continue

                for stat_index, label in enumerate(labels):
                    if SportsTickerCoordinator._normalize(label) in targets:
                        return category_index, stat_index

        return None

    @staticmethod
    def _find_flat_stat_index(
        payload: dict[str, Any],
        stat_keys: list[str],
        sort: str | None = None,
    ) -> int | None:
        """Find flattened stat index for payloads with flat athlete stat arrays."""
        targets = SportsTickerCoordinator._target_keys(stat_keys, sort)
        categories = payload.get("categories")

        if not isinstance(categories, list):
            return None

        index = 0
        label_fields = (
            "labels",
            "names",
            "displayNames",
            "descriptions",
            "shortDisplayNames",
        )

        for category in categories:
            if not isinstance(category, dict):
                continue

            labels = None
            for field in label_fields:
                possible = category.get(field)
                if isinstance(possible, list):
                    labels = possible
                    break

            if not isinstance(labels, list):
                continue

            for label in labels:
                if SportsTickerCoordinator._normalize(label) in targets:
                    return index
                index += 1

        return None

    @staticmethod
    def _find_stat_value(
        data: Any,
        stat_keys: list[str],
        stat_location: tuple[int, int] | None = None,
        flattened_index: int | None = None,
    ) -> Any:
        """Find a display stat value inside an ESPN athlete stats object."""
        if isinstance(data, dict):
            if stat_location:
                category_index, stat_index = stat_location
                categories = data.get("categories")
                if isinstance(categories, list) and category_index < len(categories):
                    category = categories[category_index]
                    if isinstance(category, dict):
                        for field in ("totals", "values", "stats", "displayValues"):
                            values = category.get(field)
                            if isinstance(values, list) and stat_index < len(values):
                                return values[stat_index]

            if flattened_index is not None:
                for field in ("stats", "totals", "values", "displayValues"):
                    values = data.get(field)
                    if isinstance(values, list) and flattened_index < len(values):
                        return values[flattened_index]

        normalized_targets = {
            str(key).strip().lower().replace(" ", "")
            for key in stat_keys
            if str(key).strip()
        }

        def normalize(value: Any) -> str:
            return str(value).strip().lower().replace(" ", "")

        def walk(value: Any) -> Any:
            if isinstance(value, dict):
                name_candidates = [
                    value.get("name"),
                    value.get("abbreviation"),
                    value.get("displayName"),
                    value.get("shortDisplayName"),
                    value.get("label"),
                ]

                if any(normalize(candidate) in normalized_targets for candidate in name_candidates if candidate):
                    return (
                        value.get("displayValue")
                        or value.get("value")
                        or value.get("display")
                    )

                for key, nested in value.items():
                    if normalize(key) in normalized_targets and not isinstance(nested, (dict, list)):
                        return nested

                for nested in value.values():
                    found = walk(nested)
                    if found is not None:
                        return found

            elif isinstance(value, list):
                for nested in value:
                    found = walk(nested)
                    if found is not None:
                        return found

            return None

        return walk(data)

    @staticmethod
    def _extract_team(item: dict[str, Any], athlete: dict[str, Any]) -> dict[str, Any]:
        """Extract team details from an ESPN athlete statistics row."""
        team = item.get("team") or athlete.get("team") or athlete.get("teams")

        if isinstance(team, list) and team:
            team = team[0]

        if not isinstance(team, dict):
            team = {}

        logo = None
        logos = team.get("logos")
        if isinstance(logos, list) and logos:
            first_logo = logos[0]
            if isinstance(first_logo, dict):
                logo = first_logo.get("href") or first_logo.get("url")

        if not logo:
            logo = team.get("logo")

        return {
            "abbreviation": team.get("abbreviation")
            or team.get("shortDisplayName")
            or item.get("teamAbbreviation")
            or item.get("teamShortName"),
            "name": team.get("displayName")
            or team.get("name")
            or item.get("teamName")
            or item.get("teamDisplayName"),
            "logo": logo or item.get("teamLogo"),
        }

    @staticmethod
    def _extract_headshot(athlete: dict[str, Any]) -> str | None:
        """Extract athlete headshot URL when ESPN provides one."""
        headshot = athlete.get("headshot")

        if isinstance(headshot, str):
            return headshot

        if isinstance(headshot, dict):
            return headshot.get("href") or headshot.get("url")

        headshots = athlete.get("headshots")
        if isinstance(headshots, list) and headshots:
            first = headshots[0]
            if isinstance(first, dict):
                return first.get("href") or first.get("url")

        return None

    def _cached_or_empty_payload(
        self,
        key: str,
        previous: dict[str, Any] | None,
        err: Exception,
        empty_payload: dict[str, Any],
        data_type: str,
    ) -> dict[str, Any]:
        """Return cached payload if available, otherwise an empty stale payload."""
        _LOGGER.warning(
            "Failed to update %s. Keeping last good data if available. Error: %s",
            key,
            err,
        )

        now = dt_util.utcnow().isoformat()

        if previous:
            cached_payload = dict(previous)
            meta = dict(cached_payload.get("_sports_ticker_meta", {}))
            meta["stale"] = True
            meta["source"] = "cache"
            meta["last_attempted_update"] = now
            meta["last_error"] = str(err)
            cached_payload["_sports_ticker_meta"] = meta
            self._last_good_data[key] = cached_payload
            return cached_payload

        payload = dict(empty_payload)
        payload["_sports_ticker_meta"] = {
            "stale": True,
            "source": "cache",
            "league": "mlb" if key == MLB_PLAYER_LEADERS_KEY else key,
            "data_type": data_type,
            "last_successful_update": None,
            "last_attempted_update": now,
            "last_error": str(err),
        }
        return payload

    def _active_cache_keys(self) -> set[str]:
        """Return active cache keys for selected leagues and derived sensors."""
        keys = set(self.leagues)

        if "mlb" in self.leagues:
            keys.add(MLB_PLAYER_LEADERS_KEY)

        return keys

    @staticmethod
    def _is_valid_scoreboard_payload(payload: Any) -> bool:
        """Validate ESPN scoreboard payload."""
        if not isinstance(payload, dict):
            return False

        events = payload.get("events")

        return isinstance(events, list)

    @staticmethod
    def _get_configured_leagues(entry: ConfigEntry) -> list[str]:
        """Return configured leagues from entry data/options."""
        raw_leagues = entry.options.get(
            CONF_LEAGUES,
            entry.data.get(CONF_LEAGUES, DEFAULT_LEAGUES),
        )

        if isinstance(raw_leagues, str):
            raw_leagues = [raw_leagues]

        leagues = [
            str(league).strip().lower()
            for league in (raw_leagues or [])
            if str(league).strip().lower() in LEAGUES
        ]

        return leagues or DEFAULT_LEAGUES

    @staticmethod
    def _get_poll_interval(entry: ConfigEntry) -> int:
        """Return configured poll interval."""
        raw_interval = entry.options.get(
            CONF_POLL_INTERVAL,
            entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )

        try:
            interval = int(raw_interval)
        except (TypeError, ValueError):
            interval = DEFAULT_POLL_INTERVAL

        return max(15, min(interval, 600))
