from __future__ import annotations

from typing import Any

# Shared ESPN metadata for team-based leagues already supported by Sports Ticker.
# PGA and NASCAR intentionally stay out of this table because the schedule,
# standings and postseason entities below are team-oriented.
TEAM_LEAGUES: dict[str, dict[str, Any]] = {
    "mlb": {
        "sport": "baseball",
        "espn_slug": "mlb",
        "label": "MLB",
        "standings": False,  # MLB keeps its richer existing standings parser/entity.
        "postseason": True,
        "standings_profile": "mlb",
    },
    "nfl": {
        "sport": "football",
        "espn_slug": "nfl",
        "label": "NFL",
        "standings": False,  # NFL has a richer dedicated parser/coordinator.
        "postseason": True,
        "standings_profile": "nfl",
    },
    "cfb": {
        "sport": "football",
        "espn_slug": "college-football",
        "label": "College Football",
        "standings": False,
        "postseason": False,
        "standings_profile": None,
    },
    "nba": {
        "sport": "basketball",
        "espn_slug": "nba",
        "label": "NBA",
        "standings": True,
        "postseason": True,
        "standings_profile": "nba",
    },
    "wnba": {
        "sport": "basketball",
        "espn_slug": "wnba",
        "label": "WNBA",
        "standings": True,
        "postseason": True,
        "standings_profile": "wnba",
    },
    "nhl": {
        "sport": "hockey",
        "espn_slug": "nhl",
        "label": "NHL",
        "standings": True,
        "postseason": True,
        "standings_profile": "nhl",
    },
    "mls": {
        "sport": "soccer",
        "espn_slug": "usa.1",
        "label": "MLS",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "epl": {
        "sport": "soccer",
        "espn_slug": "eng.1",
        "label": "Premier League",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "laliga": {
        "sport": "soccer",
        "espn_slug": "esp.1",
        "label": "LaLiga",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "bundesliga": {
        "sport": "soccer",
        "espn_slug": "ger.1",
        "label": "Bundesliga",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "seriea": {
        "sport": "soccer",
        "espn_slug": "ita.1",
        "label": "Serie A",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "ligue1": {
        "sport": "soccer",
        "espn_slug": "fra.1",
        "label": "Ligue 1",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
    "ucl": {
        "sport": "soccer",
        "espn_slug": "uefa.champions",
        "label": "Champions League",
        "standings": True,
        "postseason": False,
        "standings_profile": "soccer",
    },
}

GENERIC_STANDINGS_LEAGUES = tuple(
    league for league, profile in TEAM_LEAGUES.items() if profile.get("standings")
)
POSTSEASON_LEAGUES = tuple(
    league for league, profile in TEAM_LEAGUES.items() if profile.get("postseason")
)


def league_profile(league: str) -> dict[str, Any]:
    """Return metadata for a supported team league."""
    profile = TEAM_LEAGUES.get(str(league).strip().lower())
    if not isinstance(profile, dict):
        raise ValueError(f"Unsupported team league: {league}")
    return profile


def site_resource_url(league: str, resource: str) -> str:
    """Return a Site API v2 URL for a league resource."""
    profile = league_profile(league)
    return (
        "https://site.api.espn.com/apis/site/v2/sports/"
        f"{profile['sport']}/{profile['espn_slug']}/{resource.lstrip('/')}"
    )


def standings_url(league: str) -> str:
    """Return ESPN's full standings endpoint (not the site/v2 stub)."""
    profile = league_profile(league)
    return (
        "https://site.web.api.espn.com/apis/v2/sports/"
        f"{profile['sport']}/{profile['espn_slug']}/standings"
        "?region=us&lang=en&contentorigin=espn&type=0&level=3"
    )
