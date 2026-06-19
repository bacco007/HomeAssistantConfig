"""WebSocket API for World Cup 2026."""
from __future__ import annotations

import json
from pathlib import Path

import voluptuous as vol

from homeassistant.components import websocket_api

from ..const import DOMAIN
from ..golden_boot import GoldenBootManager

LIVE_STATUSES = {"IN_PLAY", "PAUSED", "LIVE", "1H", "2H", "HT", "HALF_TIME", "ET", "BT", "P", "SUSP", "INT"}
FINISHED_STATUSES = {"FINISHED", "FT", "AET", "PEN", "AWARDED"}
SCHEDULED_STATUSES = {"SCHEDULED", "TIMED", "POSTPONED", "SUSPENDED"}


def _status_value(match):
    return str(match.get("status") or match.get("matchStatus") or "").upper().strip()


def _score_value(match, side):
    score = match.get("score") or {}
    if isinstance(score, dict):
        full_time = score.get("fullTime") or score.get("full_time") or {}
        if isinstance(full_time, dict):
            value = full_time.get(side)
            if value is not None:
                return value
        # Some local/GitHub feeds store scores directly in score.
        value = score.get(side)
        if value is not None:
            return value

    direct_keys = {
        "home": ("homeScore", "home_score", "scoreHome", "homeGoals"),
        "away": ("awayScore", "away_score", "scoreAway", "awayGoals"),
    }
    for key in direct_keys.get(side, ()): 
        value = match.get(key)
        if value is not None:
            return value

    return None


def _is_finished_match(match):
    status = _status_value(match)
    if status in FINISHED_STATUSES:
        return True
    if status in LIVE_STATUSES or status in SCHEDULED_STATUSES:
        return False

    # Fallback for GitHub/local result rows that include scores but not a final status.
    return _score_value(match, "home") is not None and _score_value(match, "away") is not None


def _is_fixture_match(match):
    return not _is_finished_match(match)


def _get_coordinator(hass):
    coordinators = hass.data.get(DOMAIN, {})
    if not coordinators:
        return None
    return next(iter(coordinators.values()))


def _match_team_name(team):
    if isinstance(team, dict):
        return team.get("name") or team.get("shortName") or team.get("tla") or "TBC"
    return team or "TBC"


def _norm_team(value):
    value = str(value or "").lower()
    replacements = {
        "&": " and ",
        "republic": "",
        "south korea": "korea",
        "korea republic": "korea",
        "usa": "united states",
        "u.s.a.": "united states",
        "turkiye": "turkey",
        "türkiye": "turkey",
        "côte d’ivoire": "ivory coast",
        "cote d ivoire": "ivory coast",
        "bosnia and herzegovina": "bosnia herzegovina",
        "bosnia & herzegovina": "bosnia herzegovina",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = "".join(ch if ch.isalnum() else " " for ch in value)
    return " ".join(value.split())


_FIXTURE_VENUES = {
    "mexico|south africa": "Mexico City Stadium",
    "korea|czechia": "Guadalajara Stadium",
    "canada|bosnia herzegovina": "Toronto Stadium",
    "united states|paraguay": "Los Angeles Stadium",
    "qatar|switzerland": "San Francisco Bay Area Stadium",
    "haiti|scotland": "Boston Stadium",
    "brazil|morocco": "New York New Jersey Stadium",
    "australia|turkey": "Vancouver Stadium",
    "germany|curacao": "Houston Stadium",
    "netherlands|japan": "Dallas Stadium",
    "tunisia|sweden": "Monterrey Stadium",
    "ivory coast|ecuador": "Philadelphia Stadium",
    "spain|cape verde": "Atlanta Stadium",
    "belgium|egypt": "Seattle Stadium",
    "iran|new zealand": "Los Angeles Stadium",
    "austria|jordan": "San Francisco Bay Area Stadium",
    "france|senegal": "New York New Jersey Stadium",
    "norway|iraq": "Boston Stadium",
    "argentina|algeria": "Kansas City Stadium",
    "portugal|congo dr": "Houston Stadium",
    "england|croatia": "Dallas Stadium",
    "ghana|panama": "Toronto Stadium",
    "uzbekistan|colombia": "Mexico City Stadium",
    "canada|qatar": "Vancouver Stadium",
    "south africa|czechia": "Atlanta Stadium",
    "switzerland|bosnia herzegovina": "Los Angeles Stadium",
    "mexico|korea": "Guadalajara Stadium",
    "scotland|morocco": "Boston Stadium",
    "brazil|haiti": "Philadelphia Stadium",
    "united states|australia": "Seattle Stadium",
    "paraguay|turkey": "San Francisco Bay Area Stadium",
    "germany|ivory coast": "Toronto Stadium",
    "tunisia|japan": "Monterrey Stadium",
    "netherlands|sweden": "Houston Stadium",
    "ecuador|curacao": "Kansas City Stadium",
    "new zealand|egypt": "Vancouver Stadium",
    "spain|saudi arabia": "Atlanta Stadium",
    "belgium|iran": "Los Angeles Stadium",
    "uruguay|cape verde": "Miami Stadium",
    "france|iraq": "Philadelphia Stadium",
    "norway|senegal": "New York New Jersey Stadium",
    "jordan|algeria": "San Francisco Bay Area Stadium",
    "argentina|austria": "Dallas Stadium",
    "portugal|uzbekistan": "Houston Stadium",
    "england|ghana": "Boston Stadium",
    "panama|croatia": "Toronto Stadium",
    "colombia|congo dr": "Guadalajara Stadium",
    "canada|switzerland": "Vancouver Stadium",
    "qatar|bosnia herzegovina": "Seattle Stadium",
    "morocco|haiti": "Atlanta Stadium",
    "scotland|brazil": "Miami Stadium",
    "mexico|czechia": "Mexico City Stadium",
    "korea|south africa": "Monterrey Stadium",
    "ecuador|germany": "New York New Jersey Stadium",
    "curacao|ivory coast": "Philadelphia Stadium",
    "tunisia|netherlands": "Kansas City Stadium",
    "japan|sweden": "Dallas Stadium",
    "united states|turkey": "Los Angeles Stadium",
    "paraguay|australia": "San Francisco Bay Area Stadium",
    "senegal|iraq": "Toronto Stadium",
    "norway|france": "Boston Stadium",
    "cape verde|saudi arabia": "Houston Stadium",
    "uruguay|spain": "Guadalajara Stadium",
    "new zealand|belgium": "Vancouver Stadium",
    "egypt|iran": "Seattle Stadium",
    "panama|england": "New York New Jersey Stadium",
    "croatia|ghana": "Philadelphia Stadium",
    "colombia|portugal": "Miami Stadium",
    "uzbekistan|congo dr": "Atlanta Stadium",
    "jordan|argentina": "Dallas Stadium",
    "algeria|austria": "Kansas City Stadium",
}


_VENUE_DETAILS = {
    "Atlanta Stadium": {"real_name": "Mercedes-Benz Stadium", "city": "Atlanta", "country": "USA", "capacity": 75000},
    "Boston Stadium": {"real_name": "Gillette Stadium", "city": "Boston", "country": "USA", "capacity": 65878},
    "Dallas Stadium": {"real_name": "AT&T Stadium", "city": "Dallas", "country": "USA", "capacity": 80000},
    "Guadalajara Stadium": {"real_name": "Estadio Akron", "city": "Guadalajara", "country": "Mexico", "capacity": 48071},
    "Houston Stadium": {"real_name": "NRG Stadium", "city": "Houston", "country": "USA", "capacity": 72220},
    "Kansas City Stadium": {"real_name": "Arrowhead Stadium", "city": "Kansas City", "country": "USA", "capacity": 76416},
    "Los Angeles Stadium": {"real_name": "SoFi Stadium", "city": "Los Angeles", "country": "USA", "capacity": 70240},
    "Mexico City Stadium": {"real_name": "Estadio Banorte", "city": "Mexico City", "country": "Mexico", "capacity": 87523},
    "Miami Stadium": {"real_name": "Hard Rock Stadium", "city": "Miami", "country": "USA", "capacity": 64767},
    "Monterrey Stadium": {"real_name": "Estadio BBVA", "city": "Monterrey", "country": "Mexico", "capacity": 53500},
    "New York New Jersey Stadium": {"real_name": "MetLife Stadium", "city": "New York/New Jersey", "country": "USA", "capacity": 82500},
    "Philadelphia Stadium": {"real_name": "Lincoln Financial Field", "city": "Philadelphia", "country": "USA", "capacity": 69596},
    "San Francisco Bay Area Stadium": {"real_name": "Levi's Stadium", "city": "San Francisco Bay Area", "country": "USA", "capacity": 68500},
    "Seattle Stadium": {"real_name": "Lumen Field", "city": "Seattle", "country": "USA", "capacity": 69000},
    "Toronto Stadium": {"real_name": "BMO Field", "city": "Toronto", "country": "Canada", "capacity": 45000},
    "Vancouver Stadium": {"real_name": "BC Place", "city": "Vancouver", "country": "Canada", "capacity": 54500},
}


def _fallback_venue_for_match(home_team, away_team):
    key = f"{_norm_team(home_team)}|{_norm_team(away_team)}"
    venue_name = _FIXTURE_VENUES.get(key)
    if not venue_name:
        return None, None, None, None, None
    details = _VENUE_DETAILS.get(venue_name, {})
    return (
        venue_name,
        details.get("real_name"),
        details.get("city"),
        details.get("country"),
        details.get("capacity"),
    )


def _venue_value(match, *keys):
    """Return the first available venue value from the match or nested venue dict."""
    venue = match.get("venue") or match.get("stadium") or match.get("location") or {}

    for key in keys:
        value = match.get(key)
        if value not in (None, "", []):
            return value

    if isinstance(venue, dict):
        for key in keys:
            value = venue.get(key)
            if value not in (None, "", []):
                return value

    return None


def _serialise_match(match):
    home_team = match.get("homeTeam", {})
    away_team = match.get("awayTeam", {})
    score = match.get("score", {})

    full_time = score.get("fullTime", {}) if isinstance(score, dict) else {}

    venue = match.get("venue") or match.get("stadium") or match.get("location")

    if isinstance(venue, dict):
        venue_name = (
            venue.get("name")
            or venue.get("stadium")
            or venue.get("venue")
            or venue.get("shortName")
        )
        venue_city = venue.get("city") or venue.get("location")
        venue_country = venue.get("country") or venue.get("countryName")
        venue_capacity = venue.get("capacity")
        venue_real_name = venue.get("real_name") or venue.get("realName")
    else:
        venue_name = venue
        venue_city = _venue_value(match, "venueCity", "city")
        venue_country = _venue_value(match, "venueCountry", "country", "countryName")
        venue_capacity = _venue_value(match, "capacity", "venueCapacity")
        venue_real_name = _venue_value(match, "venueRealName", "real_name", "realName")

    if not venue_name:
        (
            fallback_name,
            fallback_real_name,
            fallback_city,
            fallback_country,
            fallback_capacity,
        ) = _fallback_venue_for_match(_match_team_name(home_team), _match_team_name(away_team))
        venue_name = fallback_name
        venue_real_name = venue_real_name or fallback_real_name
        venue_city = venue_city or fallback_city
        venue_country = venue_country or fallback_country
        venue_capacity = venue_capacity or fallback_capacity

    return {
        "id": match.get("id"),
        "utcDate": match.get("utcDate"),
        "status": match.get("status"),
        "stage": match.get("stage"),
        "group": match.get("group"),
        "minute": match.get("minute"),
        "manualClock": match.get("manualClock"),
        "manualClockText": match.get("manualClockText"),
        "fallbackClock": match.get("fallbackClock"),
        "fallbackClockText": match.get("fallbackClockText"),
        "clockSeconds": match.get("clockSeconds"),
        "displayMinute": match.get("displayMinute"),
        "goalEvents": match.get("goalEvents") or match.get("events") or [],
        "events": match.get("events") or match.get("goalEvents") or [],
        "cardEvents": match.get("cardEvents") or [],
        "substitutionEvents": match.get("substitutionEvents") or [],
        "referees": match.get("referees") or [],
        "officials": match.get("officials") or match.get("referees") or [],
        "referee": match.get("referee"),
        "liveStatistics": match.get("liveStatistics") or {},
        "homeCorners": match.get("homeCorners"),
        "awayCorners": match.get("awayCorners"),
        "homeShotsOnGoal": match.get("homeShotsOnGoal"),
        "awayShotsOnGoal": match.get("awayShotsOnGoal"),
        "homePossession": match.get("homePossession"),
        "awayPossession": match.get("awayPossession"),
        "homeFouls": match.get("homeFouls"),
        "awayFouls": match.get("awayFouls"),
        "homeOffsides": match.get("homeOffsides"),
        "awayOffsides": match.get("awayOffsides"),
        "lineups": match.get("lineups") or match.get("lineupsData") or match.get("teamLineups") or [],
        "lineupsData": match.get("lineupsData") or match.get("lineups") or match.get("teamLineups") or [],
        "apiFootballLineups": match.get("apiFootballLineups") or match.get("lineups") or [],
        "weather": match.get("matchWeather") or match.get("weather") or {},
        "matchWeather": match.get("matchWeather") or match.get("weather") or {},
        "apiFootballFixtureId": match.get("apiFootballFixtureId"),
        "apiFootballStatus": match.get("apiFootballStatus"),
        "apiFootballStatusLong": match.get("apiFootballStatusLong"),
        "liveSource": match.get("liveSource"),
        "awaitingLiveApiData": match.get("awaitingLiveApiData"),
        "homeTeam": _match_team_name(home_team),
        "awayTeam": _match_team_name(away_team),
        "homeScore": full_time.get("home") if isinstance(full_time, dict) and full_time.get("home") is not None else _score_value(match, "home"),
        "awayScore": full_time.get("away") if isinstance(full_time, dict) and full_time.get("away") is not None else _score_value(match, "away"),

        # Venue / stadium details for frontend fixture cards.
        # These are safe fallbacks: if the API does not provide them, frontend
        # will still show the normal fixture and can keep "Not available".
        "venue": venue_name,
        "stadium": venue_name,
        "venueName": venue_name,
        "venueRealName": venue_real_name,
        "real_name": venue_real_name,
        "venueCity": venue_city,
        "venueCountry": venue_country,
        "capacity": venue_capacity,
        "venueCapacity": venue_capacity,
    }


def _normalise_scorer(scorer):
    """Convert football-data.org/local scorer data into frontend format."""
    player = scorer.get("player", {})
    team = scorer.get("team", {})

    if isinstance(player, dict):
        player_name = player.get("name") or player.get("firstName") or "Unknown"
        player_id = player.get("id")
        api_football_player_id = player.get("apiFootballPlayerId") or player.get("apiSportsPlayerId")
        player_photo = player.get("photo") or player.get("image") or player.get("picture")
    else:
        player_name = player or "Unknown"
        player_id = scorer.get("player_id") or scorer.get("playerId")
        api_football_player_id = scorer.get("apiFootballPlayerId") or scorer.get("apiSportsPlayerId")
        player_photo = scorer.get("photo") or scorer.get("image") or scorer.get("picture")

    if isinstance(team, dict):
        team_name = team.get("shortName") or team.get("name") or team.get("tla") or "TBC"
    else:
        team_name = team or "TBC"

    return {
        "player": player_name,
        "name": player_name,
        "playerId": player_id,
        "apiFootballPlayerId": api_football_player_id,
        "apiSportsPlayerId": api_football_player_id,
        "photo": player_photo,
        "image": player_photo,
        "photoLookup": scorer.get("photoLookup"),
        "photoScore": scorer.get("photoScore"),
        "photoMatchedName": scorer.get("photoMatchedName"),
        "photoMatchedId": scorer.get("photoMatchedId"),
        "team": team_name,
        "goals": scorer.get("goals", 0),
        "assists": scorer.get("assists", 0),
        "penalties": scorer.get("penalties"),
        "matches": scorer.get("matches"),
        "yellow_cards": scorer.get("yellow_cards"),
        "red_cards": scorer.get("red_cards"),
        "minutes": scorer.get("minutes"),
        "source": scorer.get("source", "football-data.org"),
    }


async def _get_normalised_scorers(hass, coordinator):
    """Use football-data.org scorers first, then local JSON fallback."""
    api_scorers = (coordinator.data or {}).get("scorers", [])

    if api_scorers:
        return [_normalise_scorer(scorer) for scorer in api_scorers]

    manager = GoldenBootManager(hass)
    fallback_scorers = await manager.async_get_scorers(limit=100)

    return [
        {
            **_normalise_scorer(scorer),
            "source": scorer.get("source", "local fallback"),
        }
        for scorer in fallback_scorers
    ]


def _load_supporters():
    """Load supporters from local JSON file."""
    supporters_file = Path(__file__).parents[1] / "data" / "supporters.json"

    try:
        with open(supporters_file, encoding="utf-8") as file:
            data = json.load(file)

        if isinstance(data, list):
            return data

        return []
    except Exception:
        return []


async def _async_load_supporters(hass):
    """Load supporters without blocking the event loop."""
    return await hass.async_add_executor_job(_load_supporters)


def _send_not_loaded(connection, msg):
    connection.send_error(msg["id"], "not_loaded", "World Cup 2026 not loaded")


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_overview"})
@websocket_api.async_response
async def websocket_get_overview(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    data = coordinator.data or {}
    matches = data.get("matches", [])
    standings = data.get("standings", [])
    scorers = await _get_normalised_scorers(hass, coordinator)
    statistics = data.get("statistics", {})

    live_matches = [m for m in matches if _status_value(m) in LIVE_STATUSES]
    finished_matches = [m for m in matches if _is_finished_match(m)]

    connection.send_result(
        msg["id"],
        {
            "title": "World Cup 2026",
            "matches_total": statistics.get("matches_total", 104),
            "matches_loaded": len(matches),
            "matches_played": statistics.get("matches_played", len(finished_matches)),
            "matches_remaining": statistics.get("matches_remaining", max(104 - len(finished_matches), 0)),
            "live_matches": len(live_matches),
            "groups": len(standings) or 12,
            "top_scorers": len(scorers),
            "total_goals": statistics.get("total_goals", 0),
            "goals_per_match": statistics.get("goals_per_match", 0),
            "progress": statistics.get("progress", 0),
            "last_update_success": coordinator.last_update_success,
            "demo_mode": getattr(coordinator.api, "demo_mode", False),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_live_matches"})
@websocket_api.async_response
async def websocket_get_live_matches(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    matches = (coordinator.data or {}).get("matches", [])
    live_matches = [m for m in matches if _status_value(m) in LIVE_STATUSES]

    connection.send_result(
        msg["id"],
        [_serialise_match(match) for match in live_matches],
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_fixtures"})
@websocket_api.async_response
async def websocket_get_fixtures(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    matches = [
        match
        for match in (coordinator.data or {}).get("matches", [])
        if _is_fixture_match(match)
    ]

    connection.send_result(
        msg["id"],
        [_serialise_match(match) for match in matches],
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_results"})
@websocket_api.async_response
async def websocket_get_results(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    matches = [
        match
        for match in (coordinator.data or {}).get("matches", [])
        if _is_finished_match(match)
    ]

    connection.send_result(
        msg["id"],
        [_serialise_match(match) for match in matches],
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_groups"})
@websocket_api.async_response
async def websocket_get_groups(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    connection.send_result(
        msg["id"],
        (coordinator.data or {}).get("standings", []),
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_scorers"})
@websocket_api.async_response
async def websocket_get_scorers(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    connection.send_result(
        msg["id"],
        await _get_normalised_scorers(hass, coordinator),
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_statistics"})
@websocket_api.async_response
async def websocket_get_statistics(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    connection.send_result(
        msg["id"],
        (coordinator.data or {}).get("statistics", {}),
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_records"})
@websocket_api.async_response
async def websocket_get_records(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    connection.send_result(
        msg["id"],
        (coordinator.data or {}).get("records", {}),
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_venues"})
@websocket_api.async_response
async def websocket_get_venues(hass, connection, msg) -> None:
    coordinator = _get_coordinator(hass)

    if coordinator is None:
        _send_not_loaded(connection, msg)
        return

    connection.send_result(
        msg["id"],
        (coordinator.data or {}).get("venues", {}),
    )


@websocket_api.websocket_command({vol.Required("type"): "world_cup_2026/get_supporters"})
@websocket_api.async_response
async def websocket_get_supporters(hass, connection, msg) -> None:
    connection.send_result(
        msg["id"],
        await _async_load_supporters(hass),
    )


async def async_register_websocket_api(hass) -> None:
    websocket_api.async_register_command(hass, websocket_get_overview)
    websocket_api.async_register_command(hass, websocket_get_live_matches)
    websocket_api.async_register_command(hass, websocket_get_fixtures)
    websocket_api.async_register_command(hass, websocket_get_results)
    websocket_api.async_register_command(hass, websocket_get_groups)
    websocket_api.async_register_command(hass, websocket_get_scorers)
    websocket_api.async_register_command(hass, websocket_get_statistics)
    websocket_api.async_register_command(hass, websocket_get_records)
    websocket_api.async_register_command(hass, websocket_get_venues)
    websocket_api.async_register_command(hass, websocket_get_supporters)
