"""FM-only trial provider for Football Hub v0.3.0.

This provider keeps the coordinator-facing method names unchanged, allowing the
existing sensors and frontend to run without ESPN. Data is persisted in Home
Assistant storage to minimise requests and survive restarts.
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta, timezone
from time import monotonic, time
from typing import Any

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store

_LOGGER = logging.getLogger(__name__)

FM_BASE = "https://www.fotmob.com"
STORE_VERSION = 1
STORE_KEY = "football_hub_fm_v3"

# Existing Football Hub competition IDs -> FM league IDs.
FM_LEAGUES = {
    39: 47,    # Premier League
    40: 48,    # Championship
    41: 108,   # League One
    42: 109,   # League Two
    43: 117,   # National League
    179: 64,   # Scottish Premiership
    110: 116,  # Cymru Premier
    3010: 130,   # MLS
    3011: 8972,  # USL Championship
    3012: 9296,  # USL League One
    3013: 10282, # MLS Next Pro
    3014: 10084, # NISA
    3015: 9134,  # NWSL
    408: 9084, # Northern Ireland Premiership
    357: 126,  # Republic of Ireland Premier Division
    140: 87,   # LaLiga
    78: 54,    # Bundesliga
    135: 55,   # Serie A
    61: 53,    # Ligue 1
    88: 57,    # Eredivisie
    94: 61,    # Primeira Liga
    144: 40,   # Belgian Pro League
    203: 71,   # Turkish Super Lig
    1001: 42,    # UEFA Champions League
    1002: 73,    # UEFA Europa League
    1003: 10216, # UEFA Conference League
    1101: 132,   # FA Cup
    1102: 133,   # EFL Cup
    1103: 247,   # Community Shield
    1201: 65,    # Scottish Cup
    1202: 66,    # Scottish League Cup
    1301: 9166,  # Welsh Cup
    3101: 9441,  # US Open Cup
    3102: 10654, # USL Cup
    3103: 10167, # NWSL Challenge Cup
    1401: 113,   # Irish Cup
    1501: 128,   # FAI Cup
    1601: 138,   # Copa del Rey
    1602: 139,   # Spanish Super Cup
    1701: 209,   # DFB-Pokal
    1702: 210,   # German Super Cup
    1801: 141,   # Coppa Italia
    1802: 222,   # Supercoppa Italiana
    1901: 134,   # Coupe de France
    1902: 219,   # Trophée des Champions
    2001: 58,    # KNVB Cup
    2002: 189,   # Johan Cruyff Shield
    2101: 96,    # Taça de Portugal
    2102: 228,   # Portuguese League Cup
    2103: 129,   # Portuguese Super Cup
    2201: 112,   # Belgian Cup
    2202: 174,   # Belgian Super Cup
    2301: 193,   # Turkish Cup
    2302: 194,   # Turkish Super Cup
}

FM_COUNTRY_CODES = {
    39: "ENG", 40: "ENG", 41: "ENG", 42: "ENG", 43: "ENG",
    179: "SCO", 110: "WAL", 408: "NIR", 357: "IRL",
    3010: "USA", 3011: "USA", 3012: "USA", 3013: "USA",
    3014: "USA", 3015: "USA",
    140: "ESP", 78: "GER", 135: "ITA", 61: "FRA", 88: "NED",
    94: "POR", 144: "BEL", 203: "TUR",
}

LEAGUE_TTL = 6 * 60 * 60
TODAY_TTL = 60
MATCH_TTL_LIVE = 60
MATCH_TTL_FINISHED = 24 * 60 * 60
TEAM_PROFILE_TTL = 30 * 24 * 60 * 60
TEAM_SQUAD_TTL = 7 * 24 * 60 * 60
TEAM_TRANSFERS_TTL = 24 * 60 * 60
NEWS_TTL = 60 * 60
TV_GUIDE_TTL = 6 * 60 * 60
TRANSFER_MARKET_TTL = 60 * 60
COMPETITION_CATALOGUE_TTL = 7 * 24 * 60 * 60


class FMProviderError(Exception):
    """FM provider error."""


class FMProvider:
    """Use FM for every Football Hub dataset."""

    def __init__(self, hass):
        self.hass = hass
        self.session = async_get_clientsession(hass)
        self._store = Store(hass, STORE_VERSION, STORE_KEY)
        self._persistent: dict[str, Any] = {
            "league_ids": {},
            "team_ids": {},
            "match_ids": {},
            "teams": {},
            "league_data": {},
            "global_data": {},
        }
        self._loaded = False
        self._load_lock = asyncio.Lock()
        self._save_lock = asyncio.Lock()
        self._memory: dict[str, tuple[float, Any]] = {}
        self._match_locks: dict[str, asyncio.Lock] = {}
        self._team_names: dict[str, str] = {}
        self._fixture_context: dict[str, dict] = {}

    async def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        async with self._load_lock:
            if self._loaded:
                return
            stored = await self._store.async_load()
            if isinstance(stored, dict):
                self._persistent.update(stored)
            for key in ("league_ids", "team_ids", "match_ids", "teams", "league_data", "global_data"):
                self._persistent.setdefault(key, {})
            self._loaded = True

    async def _save(self) -> None:
        async with self._save_lock:
            await self._store.async_save(self._persistent)

    @staticmethod
    def _norm(value: Any) -> str:
        text = str(value or "").casefold()
        text = re.sub(r"[^a-z0-9]+", " ", text)
        return re.sub(r"\s+", " ", text).strip()

    @classmethod
    def _score_name(cls, wanted: str, candidate: str) -> int:
        a, b = cls._norm(wanted), cls._norm(candidate)
        if not a or not b:
            return 0
        if a == b:
            return 100
        if a in b or b in a:
            return 85
        aw, bw = set(a.split()), set(b.split())
        return int(70 * len(aw & bw) / len(aw)) if aw else 0

    @staticmethod
    def _logo(team_id: Any) -> str | None:
        if team_id in (None, ""):
            return None
        return f"https://images.fotmob.com/image_resources/logo/teamlogo/{team_id}.png"

    @staticmethod
    def _player_photo(player_id: Any) -> str | None:
        if player_id in (None, ""):
            return None
        return f"https://images.fotmob.com/image_resources/playerimages/{player_id}.png"

    def _cache_get(self, key: str, ttl: int) -> Any | None:
        cached = self._memory.get(key)
        if cached and monotonic() - cached[0] < ttl:
            return cached[1]
        return None

    def _cache_put(self, key: str, value: Any) -> Any:
        self._memory[key] = (monotonic(), value)
        return value

    async def _persistent_get(self, section: str, key: str, ttl: int) -> Any | None:
        """Return restart-safe cached data while it remains within its TTL."""
        await self._ensure_loaded()
        record = (self._persistent.get(section) or {}).get(key)
        if not isinstance(record, dict):
            return None
        updated = record.get("updated")
        if not isinstance(updated, (int, float)) or time() - updated >= ttl:
            return None
        return record.get("data")

    async def _persistent_put(self, section: str, key: str, value: Any) -> Any:
        """Store expensive FM responses in Home Assistant storage."""
        await self._ensure_loaded()
        self._persistent.setdefault(section, {})[key] = {
            "updated": time(),
            "data": value,
        }
        await self._save()
        return value

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        url = f"{FM_BASE}/{path.lstrip('/')}"
        try:
            async with self.session.get(
                url,
                params=params or {},
                headers={
                    "Accept": "application/json",
                    "Accept-Language": "en-GB,en;q=0.9",
                    "Referer": "https://www.fotmob.com/",
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                },
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 429:
                    raise FMProviderError("FM request limit reached")
                if response.status >= 400:
                    raise FMProviderError(f"FM returned HTTP {response.status}")
                data = await response.json(content_type=None)
                if not isinstance(data, (dict, list)):
                    raise FMProviderError("Invalid FM response")
                return data
        except asyncio.TimeoutError as err:
            raise FMProviderError("FM request timed out") from err
        except aiohttp.ClientError as err:
            raise FMProviderError(f"FM connection failed: {err}") from err

    async def _get_first(
        self,
        paths: tuple[str, ...],
        params: dict[str, Any] | None = None,
    ) -> Any:
        """Try current and legacy FM endpoint paths without failing on 404."""
        last_error: Exception | None = None
        for path in paths:
            try:
                return await self._get(path, params)
            except FMProviderError as err:
                last_error = err
                if "HTTP 404" not in str(err):
                    raise
                _LOGGER.debug("FM endpoint not found, trying fallback: %s", path)
        if last_error:
            raise last_error
        return {}

    async def _global_fetch(
        self,
        key: str,
        paths: tuple[str, ...],
        params: dict[str, Any],
        ttl: int,
    ) -> Any:
        """Fetch a slow-changing global dataset with restart-safe caching."""
        memory_key = f"global:{key}"
        cached = self._cache_get(memory_key, ttl)
        if cached is not None:
            return cached
        persisted = await self._persistent_get("global_data", key, ttl)
        if persisted is not None:
            return self._cache_put(memory_key, persisted)
        data = await self._get_first(paths, params)
        await self._persistent_put("global_data", key, data)
        return self._cache_put(memory_key, data)

    @staticmethod
    def _name(value: Any) -> str:
        if isinstance(value, dict):
            return str(value.get("name") or value.get("shortName") or value.get("title") or "")
        return str(value or "")

    def _normalise_market_transfers(self, data: Any) -> list[dict]:
        """Normalise both latest and top-transfer response shapes."""
        output: list[dict] = []
        seen: set[str] = set()
        for node in self._walk(data):
            raw_player = node.get("player")
            player = raw_player if isinstance(raw_player, dict) else {}
            player_id = player.get("id") or node.get("playerId") or node.get("idPlayer")
            player_name = (
                self._name(player)
                or (str(raw_player) if isinstance(raw_player, str) else "")
                or str(node.get("playerName") or node.get("name") or "")
            )
            from_team = (
                node.get("fromClub") or node.get("fromTeam") or node.get("from")
                or node.get("fromClubName") or {}
            )
            to_team = (
                node.get("toClub") or node.get("toTeam") or node.get("to")
                or node.get("toClubName") or {}
            )
            from_name, to_name = self._name(from_team), self._name(to_team)
            if not player_name or not (from_name or to_name):
                continue
            transfer_id = str(node.get("id") or f"{player_id}:{from_name}:{to_name}:{node.get('date') or node.get('transferDate')}")
            if transfer_id in seen:
                continue
            seen.add(transfer_id)
            fee = node.get("fee") or node.get("feeText") or node.get("transferFee") or node.get("amount")
            fee_text = ""
            fee_value = None
            if isinstance(fee, dict):
                fee_value = fee.get("value") or fee.get("amount")
                fee_text = str(fee.get("valueString") or fee.get("formatted") or fee.get("text") or "")
            elif fee not in (None, ""):
                fee_text = str(fee)
                fee_value = fee if isinstance(fee, (int, float)) else None
            raw_type = node.get("transferType") or node.get("type") or ""
            if isinstance(raw_type, dict):
                transfer_type = str(raw_type.get("text") or raw_type.get("name") or "")
            elif isinstance(raw_type, list):
                transfer_type = " ".join(str(item) for item in raw_type if item)
            else:
                transfer_type = str(raw_type)
            if not fee_text:
                fee_text = transfer_type or "Undisclosed"
            output.append({
                "id": transfer_id,
                "player": {"id": player_id, "name": player_name, "photo": self._player_photo(player_id)},
                "from": {"id": (from_team.get("id") if isinstance(from_team, dict) else None) or node.get("fromClubId"), "name": from_name},
                "to": {"id": (to_team.get("id") if isinstance(to_team, dict) else None) or node.get("toClubId"), "name": to_name},
                "date": node.get("date") or node.get("transferDate") or node.get("fromDate") or node.get("lastUpdated"),
                "fee_value": fee_value,
                "fee_display": fee_text,
                "type": transfer_type,
            })
        return output

    async def get_trending_news(self) -> list[dict]:
        data = await self._global_fetch(
            "news", ("api/trendingnews",), {"lang": "en-GB", "ccode3": "GBR"}, NEWS_TTL
        )
        records = data if isinstance(data, list) else data.get("news") or data.get("items") or []
        output = []
        for item in records:
            if not isinstance(item, dict) or not item.get("title"):
                continue
            page = item.get("page") or {}
            url = page.get("url") if isinstance(page, dict) else page
            if url and str(url).startswith("/"):
                url = f"{FM_BASE}{url}"
            output.append({
                "id": item.get("id"), "title": item.get("title"),
                "image": item.get("imageUrl"), "published": item.get("gmtTime"),
                "source": item.get("sourceStr"), "source_icon": item.get("sourceIconUrl"),
                "url": url,
            })
        return output[:30]

    async def get_tv_guide(self) -> list[dict]:
        data = await self._global_fetch(
            "tv_guide", ("api/data/tvguide", "api/tvguide"),
            {"country": "gb", "timezone": "Europe/London"}, TV_GUIDE_TTL,
        )
        output: list[dict] = []
        seen: set[str] = set()
        for node in self._walk(data):
            home = node.get("home") or node.get("homeTeam") or {}
            away = node.get("away") or node.get("awayTeam") or {}
            home_name, away_name = self._name(home), self._name(away)
            if not home_name or not away_name:
                continue
            match_id = str(node.get("id") or node.get("matchId") or f"{home_name}:{away_name}")
            if match_id in seen:
                continue
            seen.add(match_id)
            channels = node.get("channels") or node.get("channel") or node.get("tv") or []
            if isinstance(channels, str):
                channels = [channels]
            elif isinstance(channels, dict):
                channels = [self._name(value) for value in channels.values()]
            elif isinstance(channels, list):
                channels = [self._name(value) for value in channels]
            output.append({
                "id": match_id, "home": home_name, "away": away_name,
                "kickoff": node.get("utcTime") or node.get("date") or node.get("time"),
                "competition": node.get("leagueName") or self._name(node.get("league")),
                "channels": [item for item in channels if item],
            })
        return output[:60]

    async def get_latest_transfers(self) -> list[dict]:
        data = await self._global_fetch(
            "latest_transfers", ("api/data/transfers", "api/transfers"),
            {"orderBy": "lastModified", "page": 1, "minFeeCurrency": "GBP", "popular": "true"},
            TRANSFER_MARKET_TTL,
        )
        return self._normalise_market_transfers(data)[:40]

    async def get_top_transfers(self) -> list[dict]:
        data = await self._global_fetch(
            "top_transfers", ("api/data/top-transfers", "api/top-transfers"),
            {"minFeeCurrency": "GBP", "page": 1}, TRANSFER_MARKET_TTL,
        )
        return self._normalise_market_transfers(data)[:40]

    async def get_competition_catalogue(self) -> Any:
        return await self._global_fetch(
            "competition_catalogue", ("api/data/allLeagues", "api/allLeagues"),
            {"locale": "en-GB", "country": "GBR"}, COMPETITION_CATALOGUE_TTL,
        )

    @staticmethod
    def _walk(value: Any):
        if isinstance(value, dict):
            yield value
            for child in value.values():
                yield from FMProvider._walk(child)
        elif isinstance(value, list):
            for child in value:
                yield from FMProvider._walk(child)

    @staticmethod
    def _status(match: dict) -> dict:
        status = match.get("status") or {}
        if status.get("cancelled"):
            short = "CANC"
        elif status.get("finished"):
            short = "FT"
        elif status.get("started"):
            short = "LIVE"
        else:
            short = "NS"

        elapsed = None
        live_time = status.get("liveTime") or status.get("reason")
        if isinstance(live_time, dict):
            elapsed = live_time.get("short")
        if isinstance(elapsed, str):
            found = re.search(r"\d+", elapsed)
            elapsed = int(found.group(0)) if found else None

        return {
            "short": short,
            "long": status.get("reason") or status.get("scoreStr") or short,
            "elapsed": elapsed,
        }

    def _fixture(
        self,
        match: dict,
        league_name: str | None = None,
        country_code: str | None = None,
    ) -> dict | None:
        match_id = match.get("id") or match.get("matchId")
        home = match.get("home") or match.get("homeTeam") or {}
        away = match.get("away") or match.get("awayTeam") or {}
        if match_id in (None, "") or not home or not away:
            return None

        status = match.get("status") or {}
        date = status.get("utcTime") or match.get("utcTime") or match.get("date")
        timestamp = None
        try:
            timestamp = int(datetime.fromisoformat(str(date).replace("Z", "+00:00")).timestamp())
        except (TypeError, ValueError):
            pass

        home_score = home.get("score")
        away_score = away.get("score")
        try:
            home_score = int(home_score) if home_score not in (None, "") else None
        except (TypeError, ValueError):
            home_score = None
        try:
            away_score = int(away_score) if away_score not in (None, "") else None
        except (TypeError, ValueError):
            away_score = None

        item = {
            "fixture": {
                "id": int(match_id) if str(match_id).isdigit() else match_id,
                "date": date,
                "timestamp": timestamp,
                "status": self._status(match),
                "venue": {
                    "name": match.get("stadium") or match.get("venue"),
                    "city": None,
                },
            },
            "league": {
                "id": match.get("leagueId"),
                "name": league_name or match.get("leagueName"),
                "country_code": country_code or match.get("ccode"),
                "round": match.get("roundName") or match.get("round"),
            },
            "teams": {
                "home": {
                    "id": home.get("id"),
                    "name": home.get("name"),
                    "logo": self._logo(home.get("id")),
                },
                "away": {
                    "id": away.get("id"),
                    "name": away.get("name"),
                    "logo": self._logo(away.get("id")),
                },
            },
            "goals": {"home": home_score, "away": away_score},
            "score": {
                "halftime": {"home": None, "away": None},
                "fulltime": {"home": home_score, "away": away_score},
            },
        }

        self._fixture_context[str(match_id)] = {
            "home": home.get("name"),
            "away": away.get("name"),
            "date": date,
        }
        for team in (home, away):
            if team.get("id") is not None and team.get("name"):
                self._team_names[str(team["id"])] = team["name"]
        return item

    @staticmethod
    def _league_id(league_id: Any) -> int:
        try:
            return FM_LEAGUES[int(league_id)]
        except (KeyError, TypeError, ValueError) as err:
            raise FMProviderError(f"FM league mapping is unavailable for {league_id}") from err

    async def _league_data(self, league_id: Any) -> dict:
        fm_id = self._league_id(league_id)
        key = f"league:{fm_id}"
        cached = self._cache_get(key, LEAGUE_TTL)
        if cached is not None:
            return cached
        persisted = await self._persistent_get("league_data", str(fm_id), LEAGUE_TTL)
        if isinstance(persisted, dict):
            return self._cache_put(key, persisted)
        data = await self._get_first(("api/data/leagues", "api/leagues"), {"id": fm_id, "ccode3": "GBR"})
        await self._persistent_put("league_data", str(fm_id), data)
        return self._cache_put(key, data)

    async def _matches_for_date(self, date: datetime) -> list[dict]:
        day = date.strftime("%Y%m%d")
        key = f"matches:{day}"
        cached = self._cache_get(key, TODAY_TTL)
        if cached is not None:
            return cached

        data = await self._get_first(("api/data/matches", "api/matches"), {"date": day, "ccode3": "GBR"})
        output = []
        for league in data.get("leagues") or []:
            league_name = league.get("name")
            country_code = league.get("ccode") or league.get("countryCode")
            for match in league.get("matches") or []:
                item = self._fixture(match, league_name, country_code)
                if item:
                    output.append(item)
        return self._cache_put(key, output)

    @staticmethod
    def _live_scope_match(item: dict, selected_country: str | None) -> bool:
        league = item.get("league") or {}
        competition_key = str(league.get("name") or "").casefold()
        country_code = str(league.get("country_code") or "").upper()
        is_selected_country = bool(selected_country and country_code == selected_country)
        is_uefa_club_competition = any(
            label in competition_key
            for label in ("champions league", "europa league", "conference league")
        )
        is_international = country_code in {"INT", "FIFA", "UEFA"} or any(
            label in competition_key
            for label in (
                "world cup", "nations league", "international friendly",
                "friendlies", "european championship", "euro qualification",
                "copa america", "africa cup of nations", "asian cup",
            )
        )
        return is_selected_country or is_uefa_club_competition or is_international

    async def get_live_feed(self, league_id, season):
        """Return today's worldwide schedule so every live match is available."""
        return await self._matches_for_date(datetime.now(timezone.utc))

    async def get_live(self, league_id, season):
        feed = await self.get_live_feed(league_id, season)
        return [
            item for item in feed
            if ((item.get("fixture") or {}).get("status") or {}).get("short") == "LIVE"
        ]

    async def get_fixtures(self, league_id, season):
        fm_id = self._league_id(league_id)
        data = await self._league_data(league_id)
        output: dict[str, dict] = {}

        # FM league responses have changed shape over time; detect match objects
        # recursively and keep only matches belonging to the selected league.
        for node in self._walk(data):
            if not isinstance(node, dict):
                continue
            match_id = node.get("id") or node.get("matchId")
            home = node.get("home") or node.get("homeTeam")
            away = node.get("away") or node.get("awayTeam")
            if match_id in (None, "") or not isinstance(home, dict) or not isinstance(away, dict):
                continue
            node_league = node.get("leagueId")
            if node_league not in (None, fm_id, str(fm_id)):
                continue
            item = self._fixture(node, data.get("details", {}).get("name"))
            if item:
                output[str(match_id)] = item

        # Include today's matches so live/new fixtures are not missed.
        for item in await self._matches_for_date(datetime.now(timezone.utc)):
            if (item.get("league") or {}).get("id") in (fm_id, str(fm_id), None):
                output[str((item.get("fixture") or {}).get("id"))] = item

        return sorted(
            output.values(),
            key=lambda item: (item.get("fixture") or {}).get("timestamp") or 0,
        )

    async def get_standings(self, league_id, season):
        """Return the current FM league table."""
        data = await self._league_data(league_id)
        rows = []

        table_rows = []
        table = data.get("table") or {}
        if isinstance(table, list):
            # Team responses wrap the league table as
            # table[].data.table.all, while league responses may return rows
            # directly. Support both without mistaking the wrapper for a team.
            for section in table:
                section_data = section.get("data") if isinstance(section, dict) else None
                section_table = section_data.get("table") if isinstance(section_data, dict) else None
                if isinstance(section_table, dict) and isinstance(section_table.get("all"), list):
                    table_rows = section_table["all"]
                    break
            if not table_rows and table and all(
                isinstance(item, dict) and (item.get("teamId") or item.get("id"))
                for item in table
            ):
                table_rows = table
        elif isinstance(table, dict):
            table_rows = (
                table.get("all")
                or table.get("table")
                or table.get("rows")
                or []
            )

        if not table_rows:
            for node in self._walk(data):
                if not isinstance(node, dict):
                    continue
                candidate = (
                    node.get("all")
                    or node.get("table")
                    or node.get("rows")
                )
                if (
                    isinstance(candidate, list)
                    and candidate
                    and isinstance(candidate[0], dict)
                    and (
                        candidate[0].get("teamId")
                        or candidate[0].get("id")
                    )
                ):
                    table_rows = candidate
                    break

        for index, item in enumerate(table_rows or [], 1):
            team = item.get("team") if isinstance(item.get("team"), dict) else item
            team_id = (
                team.get("id")
                or item.get("teamId")
                or item.get("id")
            )
            team_name = (
                team.get("name")
                or item.get("teamName")
                or item.get("name")
            )
            if not team_id or not team_name:
                continue

            scores = str(
                item.get("scoresStr")
                or item.get("goals")
                or "0-0"
            ).split("-", 1)

            self._team_names[str(team_id)] = team_name
            rows.append({
                "rank": (
                    item.get("idx")
                    or item.get("position")
                    or item.get("rank")
                    or index
                ),
                "team": {
                    "id": team_id,
                    "name": team_name,
                    "logo": self._logo(team_id),
                },
                "points": item.get("pts") or item.get("points") or 0,
                "goalsDiff": (
                    item.get("goalConDiff")
                    or item.get("goalDifference")
                    or item.get("goalDiff")
                    or 0
                ),
                "all": {
                    "played": (
                        item.get("played")
                        or item.get("matchesPlayed")
                        or 0
                    ),
                    "win": item.get("wins") or item.get("win") or 0,
                    "draw": item.get("draws") or item.get("draw") or 0,
                    "lose": item.get("losses") or item.get("loss") or 0,
                    "goals": {
                        "for": (
                            item.get("scoresFor")
                            or item.get("goalsFor")
                            or (
                                int(scores[0])
                                if scores and scores[0].strip().isdigit()
                                else 0
                            )
                        ),
                        "against": (
                            item.get("scoresAgainst")
                            or item.get("goalsAgainst")
                            or (
                                int(scores[1])
                                if len(scores) > 1
                                and scores[1].strip().isdigit()
                                else 0
                            )
                        ),
                    },
                },
            })

        return [{"league": {"standings": [rows]}}] if rows else []

    async def get_teams(self, league_id, season):
        """Return teams for the selected league and populate dropdowns."""
        data = await self._league_data(league_id)
        found: dict[str, dict] = {}

        for node in self._walk(data):
            if not isinstance(node, dict):
                continue

            team = node.get("team") if isinstance(node.get("team"), dict) else node
            team_id = team.get("id") or node.get("teamId")
            team_name = (
                team.get("name")
                or team.get("longName")
                or node.get("teamName")
            )

            if team_id in (None, "") or not team_name:
                continue

            # Avoid treating players, matches and unrelated objects as teams.
            if any(
                key in node
                for key in (
                    "playerId",
                    "matchId",
                    "utcTime",
                    "scoreStr",
                )
            ):
                continue

            found[str(team_id)] = {
                "team": {
                    "id": team_id,
                    "name": team_name,
                    "code": team.get("shortName") or team.get("code"),
                    "country": team.get("country"),
                    "founded": None,
                    "logo": self._logo(team_id),
                },
                "venue": {},
            }
            self._team_names[str(team_id)] = team_name

        if not found:
            standings = await self.get_standings(league_id, season)
            rows = (
                (((standings[0] or {}).get("league") or {})
                 .get("standings") or [[]])[0]
                if standings
                else []
            )
            for row in rows:
                team = row.get("team") or {}
                if team.get("id") and team.get("name"):
                    found[str(team["id"])] = {
                        "team": team,
                        "venue": {},
                    }

        return sorted(
            found.values(),
            key=lambda item: str(
                (item.get("team") or {}).get("name") or ""
            ).casefold(),
        )

    async def _team_name(self, team_id: Any) -> str | None:
        key = str(team_id)
        if key in self._team_names:
            return self._team_names[key]
        await self._ensure_loaded()
        mapped = self._persistent["team_ids"].get(key)
        if isinstance(mapped, dict):
            return mapped.get("name")
        return None

    async def _team_data(self, team_id: Any, tab: str | None = None) -> dict:
        params = {"id": team_id, "ccode3": "GBR"}
        if tab:
            params["tab"] = tab
        ttl = TEAM_PROFILE_TTL if not tab else (
            TEAM_TRANSFERS_TTL if tab == "transfers" else TEAM_SQUAD_TTL
        )
        key = f"team:{team_id}:{tab or 'overview'}"
        cached = self._cache_get(key, ttl)
        if cached is not None:
            return cached
        cache_variant = "squad-v3" if tab == "squad" else (tab or "overview")
        persistent_key = f"{team_id}:{cache_variant}"
        persisted = await self._persistent_get("teams", persistent_key, ttl)
        if isinstance(persisted, dict):
            return self._cache_put(key, persisted)
        data = await self._get("api/data/teams", params)
        await self._persistent_put("teams", persistent_key, data)
        return self._cache_put(key, data)

    async def get_team(self, team_id, league_id):
        data = await self._team_data(team_id)
        details = data.get("details") or {}
        sports = details.get("sportsTeamJSONLD") or {}
        location = sports.get("location") or {}
        address = location.get("address") or {}
        geo = location.get("geo") or {}

        capacity = None
        opened = None
        for qa in data.get("QAData") or []:
            q = str(qa.get("question") or "").casefold()
            a = str(qa.get("answer") or "")
            if "capacity" in q:
                found = re.search(r"(\d[\d,]*)", a)
                capacity = int(found.group(1).replace(",", "")) if found else None
            if "opened" in q:
                found = re.search(r"\b(?:18|19|20)\d{2}\b", a)
                opened = int(found.group(0)) if found else None

        name = details.get("name")
        if name:
            self._team_names[str(team_id)] = name
        return [{
            "team": {
                "id": team_id,
                "name": name,
                "code": details.get("shortName"),
                "country": address.get("addressCountry") or details.get("country"),
                "founded": details.get("founded") or details.get("foundedYear"),
                "logo": sports.get("logo") or self._logo(team_id),
                "primary_league": details.get("primaryLeagueName"),
                "latest_season": details.get("latestSeason"),
            },
            "venue": {
                "name": location.get("name"),
                "city": address.get("addressLocality"),
                "country": address.get("addressCountry"),
                "capacity": capacity,
                "opened": opened,
                "latitude": geo.get("latitude"),
                "longitude": geo.get("longitude"),
                "image": None,
            },
        }]

    async def _match_details(self, fixture_id: Any) -> dict:
        key = f"match:{fixture_id}"
        cached = self._cache_get(key, MATCH_TTL_LIVE)
        if cached is not None:
            return cached
        lock = self._match_locks.setdefault(str(fixture_id), asyncio.Lock())
        async with lock:
            # Events, statistics and line-ups are requested concurrently by
            # the coordinator. Recheck after acquiring the shared lock so all
            # three consumers reuse one FM match-details response.
            cached = self._cache_get(key, MATCH_TTL_LIVE)
            if cached is not None:
                return cached
            data = await self._get_first(("api/data/matchDetails", "api/matchDetails"), {"matchId": fixture_id, "ccode3": "GBR"})
            finished = bool(((data.get("header") or {}).get("status") or {}).get("finished"))
            self._memory[key] = (monotonic(), data)
            if finished:
                self._memory[f"{key}:finished"] = (monotonic(), data)
            return data

    async def get_fixture_events(self, fixture_id):
        data = await self._match_details(fixture_id)
        output = []
        content = data.get("content") or {}
        match_facts = content.get("matchFacts") or {}
        facts_events = match_facts.get("events") or {}
        events = facts_events.get("events") if isinstance(facts_events, dict) else facts_events
        if not isinstance(events, list):
            events = []
        general = data.get("general") or {}
        home_team = general.get("homeTeam") or {}
        away_team = general.get("awayTeam") or {}
        for event in events:
            player = event.get("player") or {}
            assist = event.get("assist") or event.get("assistedBy") or {}
            if isinstance(assist, str):
                assist = {"name": assist}
            team = event.get("team") or (
                home_team if event.get("isHome") is True else
                away_team if event.get("isHome") is False else {}
            )
            output.append({
                "time": {
                    "elapsed": event.get("time") or event.get("timeStr"),
                    "extra": None,
                },
                "team": {
                    "id": team.get("id"),
                    "name": team.get("name"),
                },
                "player": {
                    "id": player.get("id"),
                    "name": player.get("name"),
                },
                "assist": {
                    "id": assist.get("id"),
                    "name": assist.get("name") or event.get("assistStr"),
                },
                "type": event.get("type") or "Event",
                "detail": event.get("eventType") or event.get("description") or event.get("halfStrShort"),
            })
        return output

    async def get_fixture_details(self, fixture_id):
        """Return venue, referee and live-clock data for a selected match."""
        data = await self._match_details(fixture_id)
        header = data.get("header") or {}
        general = data.get("general") or {}
        status = header.get("status") or {}
        facts = ((data.get("content") or {}).get("matchFacts") or {})
        info_box = facts.get("infoBox") or {}
        referee = general.get("referee") or facts.get("referee") or info_box.get("Referee") or {}
        venue = general.get("matchVenue") or general.get("venue") or facts.get("venue") or info_box.get("Stadium") or {}
        weather = ((data.get("content") or {}).get("weather") or {})
        if isinstance(referee, str):
            referee = {"name": referee}
        if isinstance(venue, str):
            venue = {"name": venue}
        live_time = status.get("liveTime") or {}
        elapsed = live_time.get("short") if isinstance(live_time, dict) else live_time
        if elapsed in (None, ""):
            elapsed = status.get("elapsed") or status.get("minutes")
        return {
            "elapsed": elapsed,
            "status_short": status.get("short") or status.get("status") or "LIVE",
            "status": status.get("reason") or status.get("scoreStr") or "Live",
            "referee": referee.get("name") or referee.get("text") or "Referee TBC",
            "stadium": venue.get("name") or venue.get("stadium") or "Venue TBC",
            "city": venue.get("city") or venue.get("location") or "",
            "capacity": venue.get("capacity"),
            "surface": venue.get("surface"),
            "weather": weather.get("description") or weather.get("defaultTitle"),
            "temperature": weather.get("temperature"),
            "humidity": weather.get("relativeHumidity"),
            "wind_speed": weather.get("windSpeed"),
        }

    async def get_fixture_statistics(self, fixture_id):
        data = await self._match_details(fixture_id)
        general = data.get("general") or {}
        home = general.get("homeTeam") or {}
        away = general.get("awayTeam") or {}
        content = data.get("content") or {}
        stats_root = content.get("stats") or {}
        periods = stats_root.get("Periods") or stats_root.get("periods") or {}
        all_period = periods.get("All") or periods.get("all") or {}
        rows = all_period.get("stats") or []

        home_stats, away_stats = [], []

        def stat_value(value):
            """Extract the visible value from FM's nested statistic objects."""
            if not isinstance(value, dict):
                return value
            for key in ("value", "displayValue", "text", "label", "statValue", "formatted"):
                if value.get(key) is not None:
                    return stat_value(value[key])
            return None

        def add_stat(title, values, group=None):
            if not title or not isinstance(values, list) or len(values) < 2:
                return
            home_value = stat_value(values[0])
            away_value = stat_value(values[1])
            if home_value is None and away_value is None:
                return
            home_stats.append({"type": title, "value": home_value, "group": group})
            away_stats.append({"type": title, "value": away_value, "group": group})

        for row in rows:
            title = row.get("title") or row.get("name")
            values = row.get("stats") or row.get("values") or []
            nested_rows = [
                item for item in values
                if isinstance(item, dict)
                and isinstance(item.get("stats") or item.get("values"), list)
            ] if isinstance(values, list) else []
            if nested_rows:
                for item in nested_rows:
                    add_stat(
                        item.get("title") or item.get("name") or title,
                        item.get("stats") or item.get("values") or [],
                        title,
                    )
            else:
                add_stat(title, values)

        return [
            {
                "team": {"id": home.get("id"), "name": home.get("name"), "logo": self._logo(home.get("id"))},
                "statistics": home_stats,
            },
            {
                "team": {"id": away.get("id"), "name": away.get("name"), "logo": self._logo(away.get("id"))},
                "statistics": away_stats,
            },
        ] if home_stats or away_stats else []

    async def get_fixture_lineups(self, fixture_id):
        data = await self._match_details(fixture_id)
        lineup = ((data.get("content") or {}).get("lineup") or {})
        output = []
        raw_lineups = lineup.get("lineups") or []
        if not raw_lineups:
            raw_lineups = [
                team for team in (lineup.get("homeTeam"), lineup.get("awayTeam"))
                if isinstance(team, dict)
            ]
        for raw in raw_lineups:
            team_id = raw.get("teamId") or raw.get("id")
            starters, subs = [], []
            raw_players = raw.get("players") or []
            if not raw_players:
                raw_players = [
                    *[dict(item, isSubstitute=False) for item in (raw.get("starters") or [])],
                    *[dict(item, isSubstitute=True) for item in (raw.get("substitutes") or [])],
                ]
            for item in raw_players:
                player = item.get("player") if isinstance(item.get("player"), dict) else item
                player_id = player.get("id") or item.get("playerId")
                position = item.get("position") or player.get("position")
                if isinstance(position, dict):
                    position = position.get("label") or position.get("name")
                entry = {
                    "player": {
                        "id": player_id,
                        "name": player.get("name") or item.get("name"),
                        "number": item.get("shirtNumber") or item.get("number"),
                        "pos": position,
                        "photo": self._player_photo(player_id),
                        "rating": item.get("rating") or player.get("rating"),
                    }
                }
                if item.get("isSubstitute") or item.get("starter") is False:
                    subs.append(entry)
                else:
                    starters.append(entry)
            output.append({
                "team": {
                    "id": team_id,
                    "name": raw.get("teamName") or raw.get("name"),
                    "logo": self._logo(team_id),
                },
                "formation": raw.get("formation"),
                "startXI": starters,
                "substitutes": subs,
            })
        return output

    async def get_top_scorers(self, league_id, season):
        return await self._league_players(league_id, "goals")

    async def get_top_assists(self, league_id, season):
        return await self._league_players(league_id, "assists")

    async def _league_players(self, league_id, wanted: str):
        data = await self._league_data(league_id)
        return self._league_players_from_data(data, wanted)

    def _league_players_from_data(self, data: dict, wanted: str):
        """Extract one leaderboard from an already cached league response."""
        output = []
        seen = set()
        title_aliases = {
            "yellow": ("yellow",),
            "red": ("red",),
            "rating": ("rating",),
            "appearances": ("appearance", "matches played", "games played"),
            "minutes": ("minutes",),
        }
        for node in self._walk(data):
            if not isinstance(node, dict):
                continue
            title = self._norm(node.get("title") or node.get("name") or "")
            aliases = title_aliases.get(wanted, (wanted,))
            if not any(alias in title for alias in aliases):
                continue
            players = node.get("players") or node.get("items") or []
            if not isinstance(players, list):
                continue
            for row in players:
                player = row.get("player") if isinstance(row.get("player"), dict) else row
                player_id = player.get("id") or row.get("playerId")
                name = player.get("name") or row.get("name")
                player_key = str(player_id or name).casefold()
                if not name or player_key in seen:
                    continue
                seen.add(player_key)
                value = (
                    row.get("value")
                    if row.get("value") is not None
                    else row.get("statValue")
                    if row.get("statValue") is not None
                    else row.get(wanted, 0)
                )
                team = row.get("team") or {}
                output.append({
                    "player": {
                        "id": player_id,
                        "name": name,
                        "photo": self._player_photo(player_id),
                    },
                    "statistics": [{
                        "team": {
                            "id": team.get("id"),
                            "name": team.get("name"),
                            "logo": self._logo(team.get("id")),
                        },
                        "goals": {
                            "total": value if wanted == "goals" else 0,
                            "assists": value if wanted == "assists" else 0,
                        },
                        "cards": {
                            "yellow": value if wanted == "yellow" else 0,
                            "red": value if wanted == "red" else 0,
                        },
                        "games": {
                            "appearences": value if wanted == "appearances" else 0,
                        },
                        "minutes": value if wanted == "minutes" else 0,
                        "rating": value if wanted == "rating" else 0,
                    }],
                })
        return output[:25]

    async def get_player_leaderboards(self, league_id, season):
        """Return every supported leaderboard from one league-data request."""
        data = await self._league_data(league_id)
        return {
            "top_scorers": self._league_players_from_data(data, "goals"),
            "top_assists": self._league_players_from_data(data, "assists"),
            "top_yellow_cards": self._league_players_from_data(data, "yellow"),
            "top_red_cards": self._league_players_from_data(data, "red"),
            "top_ratings": self._league_players_from_data(data, "rating"),
            "top_appearances": self._league_players_from_data(data, "appearances"),
            "top_minutes": self._league_players_from_data(data, "minutes"),
        }

    async def get_team_statistics(self, team_id, league_id, season):
        fixtures = await self.get_fixtures(league_id, season)
        played = wins = draws = losses = gf = ga = clean = 0
        for item in fixtures:
            fixture = item.get("fixture") or {}
            if (fixture.get("status") or {}).get("short") != "FT":
                continue
            home = ((item.get("teams") or {}).get("home") or {})
            away = ((item.get("teams") or {}).get("away") or {})
            is_home = str(home.get("id")) == str(team_id)
            is_away = str(away.get("id")) == str(team_id)
            if not (is_home or is_away):
                continue
            goals = item.get("goals") or {}
            scored = int(goals.get("home") or 0) if is_home else int(goals.get("away") or 0)
            conceded = int(goals.get("away") or 0) if is_home else int(goals.get("home") or 0)
            played += 1
            gf += scored
            ga += conceded
            clean += int(conceded == 0)
            wins += int(scored > conceded)
            draws += int(scored == conceded)
            losses += int(scored < conceded)
        return {
            "fixtures": {
                "played": {"total": played},
                "wins": {"total": wins},
                "draws": {"total": draws},
                "loses": {"total": losses},
            },
            "goals": {
                "for": {"total": {"total": gf}},
                "against": {"total": {"total": ga}},
            },
            "clean_sheet": {"total": clean},
        }

    async def get_team_seasons(self, team_id):
        data = await self._team_data(team_id)
        return data.get("allAvailableSeasons") or []

    async def get_squad(self, team_id):
        data = await self._team_data(team_id, "squad")
        raw = data.get("squad") or {}
        groups = raw.get("squad") if isinstance(raw, dict) else raw
        players = []
        if isinstance(groups, list):
            for group in groups:
                if not isinstance(group, dict):
                    continue
                members = group.get("members") or group.get("players") or []
                if not members and (group.get("id") or group.get("playerId")):
                    members = [group]
                for player in members:
                    if not isinstance(player, dict):
                        continue
                    role = player.get("role") or {}
                    player_id = player.get("id") or player.get("playerId")
                    position = player.get("position") or role
                    if isinstance(position, dict):
                        position = position.get("label") or position.get("name") or position.get("fallback")
                    role_value = (
                        role.get("fallback") or role.get("label") or role.get("name") or role.get("key")
                        if isinstance(role, dict)
                        else role
                    )
                    staff_text = self._norm(f"{role_value or ''} {position or ''}")
                    if any(label in staff_text for label in ("coach", "manager", "staff")):
                        continue
                    injury = player.get("injury") if isinstance(player.get("injury"), dict) else {}
                    players.append({
                        "id": player_id,
                        "name": player.get("name") or player.get("playerName"),
                        "age": player.get("age"),
                        "number": player.get("shirtNumber") or player.get("number"),
                        "position": position,
                        "photo": self._player_photo(player_id),
                        "nationality": player.get("cname") or player.get("ccode"),
                        "height": player.get("height"),
                        "date_of_birth": player.get("dateOfBirth"),
                        "transfer_value": player.get("transferValue"),
                        "goals": player.get("goals") or 0,
                        "assists": player.get("assists") or 0,
                        "yellow_cards": player.get("ycards") or 0,
                        "red_cards": player.get("rcards") or 0,
                        "injured": bool(player.get("injured") or injury),
                        "expected_return": injury.get("expectedReturn"),
                    })
        return [{
            "team": {
                "id": team_id,
                "name": await self._team_name(team_id),
                "logo": self._logo(team_id),
            },
            "players": [p for p in players if p.get("name")],
        }] if players else []

    async def get_coach(self, team_id):
        """Return the latest manager from FM coach history."""
        data = await self._team_data(team_id)
        overview = data.get("overview") or {}
        history_root = data.get("history") or {}
        history = (
            history_root.get("coachHistory")
            or data.get("coachHistory")
            or overview.get("coachHistory")
            or []
        )

        if isinstance(history, dict):
            history = (
                history.get("coaches")
                or history.get("coachHistory")
                or history.get("data")
                or []
            )

        if not isinstance(history, list) or not history:
            return []

        valid = [
            item
            for item in history
            if isinstance(item, dict)
            and (item.get("name") or item.get("coachName"))
        ]
        if not valid:
            return []

        # FM orders coachHistory from oldest to newest.
        coach = valid[-1]
        coach_id = coach.get("id") or coach.get("coachId")

        same_coach = [item for item in valid if str(item.get("id") or item.get("coachId")) == str(coach_id)]
        career = [{
            "team": {
                "id": team_id,
                "name": await self._team_name(team_id),
            },
            "start": item.get("startDate") or item.get("seasonStart") or item.get("season"),
            "end": item.get("endDate") or item.get("seasonEnd"),
            "league": item.get("leagueName"),
            "wins": item.get("win"),
            "draws": item.get("draw"),
            "losses": item.get("loss"),
            "points_per_game": item.get("pointsPerGame"),
            "win_percentage": item.get("winPercentage"),
        } for item in same_coach]

        return [{
            "id": coach_id,
            "name": coach.get("name") or coach.get("coachName"),
            "age": coach.get("age"),
            "nationality": (
                coach.get("country")
                or coach.get("nationality")
                or coach.get("countryName")
            ),
            "photo": self._player_photo(coach_id),
            "career": career,
            "current_season": coach.get("season"),
            "wins": coach.get("win"),
            "draws": coach.get("draw"),
            "losses": coach.get("loss"),
            "points_per_game": coach.get("pointsPerGame"),
            "win_percentage": coach.get("winPercentage"),
        }]

    async def get_injuries(self, team_id, season):
        data = await self._team_data(team_id, "squad")
        output = []
        for node in self._walk(data):
            if not isinstance(node, dict):
                continue
            injury = node.get("injury") if isinstance(node.get("injury"), dict) else {}
            text = " ".join(str(node.get(k) or "") for k in ("injury", "status", "reason", "availability")).casefold()
            if not node.get("injured") and not injury and not any(word in text for word in ("injur", "suspend", "doubt", "illness", "unavailable")):
                continue
            player_id = node.get("id") or node.get("playerId")
            name = node.get("name") or node.get("playerName")
            if name:
                output.append({
                    "player": {"id": player_id, "name": name, "photo": self._player_photo(player_id)},
                    "team": {"id": team_id},
                    "type": node.get("status") or node.get("availability") or "Injured",
                    "reason": injury.get("type") or injury.get("description") or node.get("reason") or "Injured",
                    "date": injury.get("expectedReturn") or node.get("expectedReturn") or node.get("returnDate"),
                    "fixture": {"date": injury.get("expectedReturn") or node.get("expectedReturn") or node.get("returnDate")},
                })
        return output

    async def get_transfers(self, team_id):
        """Return FM transfers in the API-Football shape used by the frontend."""
        data = await self._team_data(team_id)
        transfers_root = data.get("transfers") or {}
        transfers_data = (
            transfers_root.get("data")
            if isinstance(transfers_root, dict)
            and isinstance(transfers_root.get("data"), (dict, list))
            else transfers_root
        )

        rows = (
            transfers_data.get("allTransfers")
            if isinstance(transfers_data, dict)
            else transfers_data if isinstance(transfers_data, list) else []
        ) or []

        if not rows and isinstance(transfers_data, dict):
            for group_name in (
                "Players in",
                "Players out",
                "Contract extension",
            ):
                group = transfers_data.get(group_name) or []
                if isinstance(group, list):
                    rows.extend(group)

        if not rows:
            tab_data = await self._team_data(team_id, "transfers")
            tab_root = tab_data.get("transfers") or tab_data
            tab_data_root = (
                tab_root.get("data")
                if isinstance(tab_root, dict)
                and isinstance(tab_root.get("data"), (dict, list))
                else tab_root
            )
            rows = (
                tab_data_root.get("allTransfers")
                if isinstance(tab_data_root, dict)
                else tab_data_root if isinstance(tab_data_root, list) else []
            ) or []

        # The Football Hub frontend was built around API-Football's transfer
        # response: one player object containing a nested transfers list.
        grouped: dict[str, dict] = {}
        seen = set()

        def transfer_text(value: Any) -> str | None:
            """Extract the human fee label used by FM's team transfer tab."""
            strings: list[str] = []

            def collect(part: Any) -> None:
                if isinstance(part, str) and part.strip():
                    strings.append(part.strip())
                elif isinstance(part, dict):
                    for key in ("text", "value", "label", "fallback", "feeText"):
                        if key in part:
                            collect(part.get(key))
                elif isinstance(part, list):
                    for child in part:
                        collect(child)

            collect(value)
            preferred = [
                text for text in strings
                if re.search(r"[£€$]|\b(?:free|loan|undisclosed|contract)\b|\d+[.,]?\d*\s*[mk]\b", text, re.I)
            ]
            return " ".join(preferred or strings) or None

        for item in rows[:100]:
            if not isinstance(item, dict):
                continue

            player_id = item.get("playerId") or item.get("id")
            player_name = item.get("name") or item.get("playerName")
            if not player_name:
                continue

            from_name = item.get("fromClubFullName") or item.get("fromClub")
            to_name = item.get("toClubFullName") or item.get("toClub")
            transfer_date = item.get("transferDate") or item.get("fromDate")

            transfer_type = item.get("transferType")
            if isinstance(transfer_type, dict):
                transfer_type = (
                    transfer_type.get("text")
                    or transfer_type.get("localizationKey")
                )

            fee_data = (
                item.get("fee")
                or item.get("transferFee")
                or item.get("transfer_fee")
                or item.get("feeData")
            )
            fee_text = None
            fee_value = item.get("feeValue") or item.get("fee_value") or item.get("amount")
            fee_currency = item.get("currency") or item.get("feeCurrency")
            if isinstance(fee_data, dict):
                fee_text = (
                    fee_data.get("feeText")
                    or fee_data.get("localizedFeeText")
                    or fee_data.get("text")
                    or fee_data.get("label")
                    or fee_data.get("formatted")
                )
                fee_value = fee_value or fee_data.get("value") or fee_data.get("amount") or fee_data.get("rawValue")
                fee_currency = fee_currency or fee_data.get("currency") or fee_data.get("currencyCode")
            elif fee_data not in (None, ""):
                if isinstance(fee_data, (int, float)):
                    fee_value = fee_value or fee_data
                else:
                    fee_text = str(fee_data)

            if not fee_text:
                fee_text = (
                    item.get("feeText")
                    or item.get("localizedFeeText")
                    or item.get("transferFeeText")
                    or transfer_text(item.get("transferText"))
                )

            fee_display = fee_text
            try:
                numeric_fee = float(fee_value) if fee_value not in (None, "") else 0
            except (TypeError, ValueError):
                numeric_fee = 0
            if numeric_fee > 0:
                symbol = {"GBP": "£", "EUR": "€", "USD": "$"}.get(
                    str(fee_currency or "EUR").upper(), "€"
                )
                if numeric_fee >= 1_000_000:
                    fee_display = f"{symbol}{numeric_fee / 1_000_000:.1f}m".replace(".0m", "m")
                elif numeric_fee >= 1_000:
                    fee_display = f"{symbol}{numeric_fee / 1_000:.1f}k".replace(".0k", "k")
                else:
                    fee_display = f"{symbol}{numeric_fee:,.0f}"
            elif fee_display:
                fee_display = str(fee_display).replace("_", " ").strip().title()

            if item.get("contractExtension"):
                transfer_type = "Contract extension"
            elif item.get("onLoan"):
                transfer_type = "Loan"
            elif not transfer_type:
                transfer_type = fee_text or "Transfer"

            dedupe = (
                str(player_id or player_name),
                str(from_name or ""),
                str(to_name or ""),
                str(transfer_date or ""),
            )
            if dedupe in seen:
                continue
            seen.add(dedupe)

            key = str(player_id or player_name)
            record = grouped.setdefault(
                key,
                {
                    "player": {
                        "id": player_id,
                        "name": player_name,
                        "photo": self._player_photo(player_id),
                    },
                    "update": item.get("transferDate"),
                    "transfers": [],
                },
            )

            record["transfers"].append({
                "date": transfer_date,
                "type": transfer_type,
                "fee": fee_text,
                "fee_value": fee_value,
                "fee_currency": fee_currency,
                "fee_display": fee_display,
                "on_loan": bool(item.get("onLoan")),
                "contract_extension": bool(item.get("contractExtension")),
                "teams": {
                    "in": {
                        "id": item.get("toClubId"),
                        "name": to_name,
                        "logo": self._logo(item.get("toClubId")),
                    },
                    "out": {
                        "id": item.get("fromClubId"),
                        "name": from_name,
                        "logo": self._logo(item.get("fromClubId")),
                    },
                },
            })

        output = list(grouped.values())
        _LOGGER.warning(
            "FM transfers parsed for team %s: %s players / %s transfers",
            team_id,
            len(output),
            sum(len(item.get("transfers") or []) for item in output),
        )
        return output

    async def get_team_players(self, team_id, league_id, season, page=1):
        squad = await self.get_squad(team_id)
        if not squad:
            return []
        team = squad[0].get("team") or {}
        return [{
            "player": {
                "id": player.get("id"),
                "name": player.get("name"),
                "age": player.get("age"),
                "photo": player.get("photo"),
            },
            "statistics": [{
                "team": team,
                "games": {
                    "position": player.get("position"),
                    "number": player.get("number"),
                },
                "goals": {"total": player.get("goals") or 0, "assists": player.get("assists") or 0},
                "cards": {"yellow": player.get("yellow_cards") or 0, "red": player.get("red_cards") or 0},
            }],
        } for player in squad[0].get("players", [])]

    async def get_team_history(self, team_id):
        """Return club trophies, historical league finishes and colours."""
        data = await self._team_data(team_id)
        history = data.get("history") or {}
        historical = history.get("historicalTableData") or {}
        return {
            "trophies": history.get("trophyList") or [],
            "league_history": historical.get("ranks") or [],
            "team_colours": history.get("teamColors") or history.get("teamColorMap") or {},
            "coach_history": history.get("coachHistory") or [],
        }

    async def get_top_yellow_cards(self, league_id, season):
        return await self._league_players(league_id, "yellow")

    async def get_top_red_cards(self, league_id, season):
        return await self._league_players(league_id, "red")

    async def get_top_ratings(self, league_id, season):
        return await self._league_players(league_id, "rating")

    async def get_top_appearances(self, league_id, season):
        return await self._league_players(league_id, "appearances")

    async def get_top_minutes(self, league_id, season):
        return await self._league_players(league_id, "minutes")

    async def get_head_to_head(self, team_id, opponent_id):
        matches = []
        for _, value in self._memory.values():
            if not isinstance(value, list):
                continue
            for item in value:
                if not isinstance(item, dict):
                    continue
                teams = item.get("teams") or {}
                ids = {
                    str((teams.get("home") or {}).get("id")),
                    str((teams.get("away") or {}).get("id")),
                }
                if ids == {str(team_id), str(opponent_id)}:
                    matches.append(item)
        return matches[-10:]

    async def get_prediction(self, fixture_id):
        data = await self._match_details(fixture_id)
        content = data.get("content") or {}
        prediction = content.get("prediction") or content.get("betting") or {}
        return [prediction] if prediction else []

    async def get_trophies_for_players(self, player_ids):
        return []

    async def get_trophies_for_coach(self, coach_id):
        return []

    async def get_sidelined_players(self, player_ids):
        return []
