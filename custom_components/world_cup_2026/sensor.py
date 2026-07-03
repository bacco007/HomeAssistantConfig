from datetime import date, datetime, timezone, timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import WorldCupCoordinator


TOTAL_WORLD_CUP_MATCHES = 104
TOTAL_WORLD_CUP_TEAMS = 48


WORLD_CUP_STADIUMS = [
    {
        "stadium": "MetLife Stadium",
        "city": "New York/New Jersey",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 82500,
        "note": "Final venue",
    },
    {
        "stadium": "AT&T Stadium",
        "city": "Dallas",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 80000,
        "note": "Host venue",
    },
    {
        "stadium": "SoFi Stadium",
        "city": "Los Angeles",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 70000,
        "note": "Host venue",
    },
    {
        "stadium": "Mercedes-Benz Stadium",
        "city": "Atlanta",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 71000,
        "note": "Host venue",
    },
    {
        "stadium": "Lincoln Financial Field",
        "city": "Philadelphia",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 69000,
        "note": "Host venue",
    },
    {
        "stadium": "NRG Stadium",
        "city": "Houston",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 72000,
        "note": "Host venue",
    },
    {
        "stadium": "Hard Rock Stadium",
        "city": "Miami",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 65000,
        "note": "Host venue",
    },
    {
        "stadium": "Lumen Field",
        "city": "Seattle",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 69000,
        "note": "Host venue",
    },
    {
        "stadium": "Levi's Stadium",
        "city": "San Francisco Bay Area",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 68000,
        "note": "Host venue",
    },
    {
        "stadium": "GEHA Field at Arrowhead Stadium",
        "city": "Kansas City",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 76000,
        "note": "Host venue",
    },
    {
        "stadium": "Gillette Stadium",
        "city": "Boston",
        "country": "USA",
        "flag": "🇺🇸",
        "capacity": 65000,
        "note": "Host venue",
    },
    {
        "stadium": "BC Place",
        "city": "Vancouver",
        "country": "Canada",
        "flag": "🇨🇦",
        "capacity": 54500,
        "note": "Host venue",
    },
    {
        "stadium": "BMO Field",
        "city": "Toronto",
        "country": "Canada",
        "flag": "🇨🇦",
        "capacity": 45000,
        "note": "Host venue",
    },
    {
        "stadium": "Estadio Azteca",
        "city": "Mexico City",
        "country": "Mexico",
        "flag": "🇲🇽",
        "capacity": 87000,
        "note": "Opening match venue",
    },
    {
        "stadium": "Estadio BBVA",
        "city": "Monterrey",
        "country": "Mexico",
        "flag": "🇲🇽",
        "capacity": 53500,
        "note": "Host venue",
    },
    {
        "stadium": "Estadio Akron",
        "city": "Guadalajara",
        "country": "Mexico",
        "flag": "🇲🇽",
        "capacity": 48000,
        "note": "Host venue",
    },
]


def get_stadiums():
    return WORLD_CUP_STADIUMS


def get_host_cities():
    return [
        {
            "city": venue["city"],
            "country": venue["country"],
            "flag": venue["flag"],
            "stadium": venue["stadium"],
        }
        for venue in WORLD_CUP_STADIUMS
    ]


def normalize_team_name(name):
    if not name:
        return ""

    replacements = {
        "Korea Republic": "South Korea",
        "Bosnia-H.": "Bosnia and Herzegovina",
        "Bosnia & Herz": "Bosnia and Herzegovina",
        "Bosnia Herzegovina": "Bosnia and Herzegovina",
        "Turkey": "Türkiye",
        "Turkiye": "Türkiye",
        "Curacao": "Curaçao",
        "Curaçao": "Curaçao",
    }

    clean = str(name).strip()
    clean = replacements.get(clean, clean)
    return clean.lower().replace("ç", "c").replace("ü", "u").replace("í", "i").replace("é", "e")


def match_key(home, away):
    return f"{normalize_team_name(home)} v {normalize_team_name(away)}"


KNOCKOUT_MATCH_NUMBER_BY_TEAMS = {
    frozenset((normalize_team_name("South Africa"), normalize_team_name("Canada"))): 73,
    frozenset((normalize_team_name("Germany"), normalize_team_name("Paraguay"))): 74,
    frozenset((normalize_team_name("Netherlands"), normalize_team_name("Morocco"))): 75,
    frozenset((normalize_team_name("Brazil"), normalize_team_name("Japan"))): 76,
    frozenset((normalize_team_name("France"), normalize_team_name("Sweden"))): 77,
    frozenset((normalize_team_name("Cote d'Ivoire"), normalize_team_name("Norway"))): 78,
    frozenset((normalize_team_name("Mexico"), normalize_team_name("Ecuador"))): 79,
    frozenset((normalize_team_name("England"), normalize_team_name("Congo - Kinshasa"))): 80,
    frozenset((normalize_team_name("United States"), normalize_team_name("Bosnia and Herzegovina"))): 81,
    frozenset((normalize_team_name("Belgium"), normalize_team_name("Senegal"))): 82,
    frozenset((normalize_team_name("Portugal"), normalize_team_name("Croatia"))): 83,
    frozenset((normalize_team_name("Spain"), normalize_team_name("Austria"))): 84,
    frozenset((normalize_team_name("Switzerland"), normalize_team_name("Algeria"))): 85,
    frozenset((normalize_team_name("Argentina"), normalize_team_name("Cape Verde"))): 86,
    frozenset((normalize_team_name("Colombia"), normalize_team_name("Ghana"))): 87,
    frozenset((normalize_team_name("Australia"), normalize_team_name("Egypt"))): 88,
}


def resolve_match_number(match, home_name=None, away_name=None, fallback=None):
    for key in ("matchNumber", "fifaMatchNumber", "number"):
        value = match.get(key)
        if value not in (None, ""):
            try:
                return int(value)
            except (TypeError, ValueError):
                return value

    if fallback not in (None, ""):
        return fallback

    if match.get("stage") == "LAST_32" and home_name and away_name:
        teams = frozenset((normalize_team_name(home_name), normalize_team_name(away_name)))
        return KNOCKOUT_MATCH_NUMBER_BY_TEAMS.get(teams)

    return None


MATCH_VENUES = {
    # Group stage - Matchday 1
    match_key("Mexico", "South Africa"): "Estadio Azteca",
    match_key("South Korea", "Czechia"): "Estadio Akron",
    match_key("Canada", "Bosnia and Herzegovina"): "BMO Field",
    match_key("USA", "Paraguay"): "SoFi Stadium",
    match_key("Haiti", "Scotland"): "Gillette Stadium",
    match_key("Australia", "Türkiye"): "BC Place",
    match_key("Brazil", "Morocco"): "MetLife Stadium",
    match_key("Qatar", "Switzerland"): "Levi's Stadium",
    match_key("Ivory Coast", "Ecuador"): "Lincoln Financial Field",
    match_key("Germany", "Curaçao"): "NRG Stadium",
    match_key("Netherlands", "Japan"): "AT&T Stadium",
    match_key("Sweden", "Tunisia"): "Estadio BBVA",
    match_key("Spain", "Cape Verde"): "Mercedes-Benz Stadium",
    match_key("Saudi Arabia", "Uruguay"): "Hard Rock Stadium",
    match_key("Belgium", "Egypt"): "Lumen Field",
    match_key("Iran", "New Zealand"): "SoFi Stadium",
    match_key("France", "Senegal"): "MetLife Stadium",
    match_key("Iraq", "Norway"): "Gillette Stadium",
    match_key("Argentina", "Algeria"): "GEHA Field at Arrowhead Stadium",
    match_key("Austria", "Jordan"): "Levi's Stadium",
    match_key("England", "Croatia"): "AT&T Stadium",
    match_key("Ghana", "Panama"): "BMO Field",
    match_key("Portugal", "Congo DR"): "NRG Stadium",
    match_key("Uzbekistan", "Colombia"): "Estadio Azteca",

    # Group stage - Matchday 2
    match_key("Czechia", "South Africa"): "Mercedes-Benz Stadium",
    match_key("Switzerland", "Bosnia and Herzegovina"): "SoFi Stadium",
    match_key("Canada", "Qatar"): "BC Place",
    match_key("Mexico", "South Korea"): "Estadio Akron",
    match_key("Brazil", "Haiti"): "Lincoln Financial Field",
    match_key("Scotland", "Morocco"): "Gillette Stadium",
    match_key("Türkiye", "Paraguay"): "Levi's Stadium",
    match_key("USA", "Australia"): "Lumen Field",
    match_key("Germany", "Ivory Coast"): "BMO Field",
    match_key("Ecuador", "Curaçao"): "GEHA Field at Arrowhead Stadium",
    match_key("Netherlands", "Sweden"): "NRG Stadium",
    match_key("Tunisia", "Japan"): "Estadio BBVA",
    match_key("Spain", "Saudi Arabia"): "Mercedes-Benz Stadium",
    match_key("Uruguay", "Cape Verde"): "Hard Rock Stadium",
    match_key("Belgium", "Iran"): "SoFi Stadium",
    match_key("New Zealand", "Egypt"): "BC Place",
    match_key("France", "Iraq"): "Lincoln Financial Field",
    match_key("Norway", "Senegal"): "MetLife Stadium",
    match_key("Argentina", "Austria"): "AT&T Stadium",
    match_key("Jordan", "Algeria"): "Levi's Stadium",
    match_key("England", "Ghana"): "Gillette Stadium",
    match_key("Panama", "Croatia"): "BMO Field",
    match_key("Portugal", "Uzbekistan"): "NRG Stadium",
    match_key("Colombia", "Congo DR"): "Estadio Akron",

    # Group stage - Matchday 3
    match_key("Scotland", "Brazil"): "Hard Rock Stadium",
    match_key("Morocco", "Haiti"): "Mercedes-Benz Stadium",
    match_key("Canada", "Switzerland"): "BC Place",
    match_key("Bosnia and Herzegovina", "Qatar"): "Lumen Field",
    match_key("Mexico", "Czechia"): "Estadio Azteca",
    match_key("South Korea", "South Africa"): "Estadio BBVA",
    match_key("Ecuador", "Germany"): "MetLife Stadium",
    match_key("Curaçao", "Ivory Coast"): "Lincoln Financial Field",
    match_key("Tunisia", "Netherlands"): "GEHA Field at Arrowhead Stadium",
    match_key("Japan", "Sweden"): "AT&T Stadium",
    match_key("USA", "Türkiye"): "SoFi Stadium",
    match_key("Paraguay", "Australia"): "Levi's Stadium",
    match_key("Norway", "France"): "Gillette Stadium",
    match_key("Senegal", "Iraq"): "BMO Field",
    match_key("New Zealand", "Belgium"): "BC Place",
    match_key("Egypt", "Iran"): "Lumen Field",
    match_key("Uruguay", "Spain"): "Estadio Akron",
    match_key("Cape Verde", "Saudi Arabia"): "NRG Stadium",
    match_key("Panama", "England"): "MetLife Stadium",
    match_key("Croatia", "Ghana"): "Lincoln Financial Field",
    match_key("Jordan", "Argentina"): "AT&T Stadium",
    match_key("Algeria", "Austria"): "GEHA Field at Arrowhead Stadium",
    match_key("Colombia", "Portugal"): "Hard Rock Stadium",
    match_key("Congo DR", "Uzbekistan"): "Mercedes-Benz Stadium",
}


MATCH_NUMBER_VENUES = {
    73: "SoFi Stadium",
    74: "Gillette Stadium",
    75: "Estadio BBVA",
    76: "NRG Stadium",
    77: "MetLife Stadium",
    78: "AT&T Stadium",
    79: "Estadio Azteca",
    80: "Mercedes-Benz Stadium",
    81: "Levi's Stadium",
    82: "Lumen Field",
    83: "BMO Field",
    84: "SoFi Stadium",
    85: "BC Place",
    86: "Hard Rock Stadium",
    87: "GEHA Field at Arrowhead Stadium",
    88: "AT&T Stadium",
    89: "Lincoln Financial Field",
    90: "NRG Stadium",
    91: "MetLife Stadium",
    92: "Estadio Azteca",
    93: "AT&T Stadium",
    94: "Lumen Field",
    95: "Mercedes-Benz Stadium",
    96: "BC Place",
    97: "Gillette Stadium",
    98: "SoFi Stadium",
    99: "Hard Rock Stadium",
    100: "GEHA Field at Arrowhead Stadium",
    101: "AT&T Stadium",
    102: "Mercedes-Benz Stadium",
    103: "Hard Rock Stadium",
    104: "MetLife Stadium",
}


def get_stadium_details(stadium_name):
    if not stadium_name:
        return None

    return next(
        (venue for venue in WORLD_CUP_STADIUMS if venue.get("stadium") == stadium_name),
        None,
    )


def get_match_venue(home, away, match_number=None):
    stadium_name = MATCH_VENUES.get(match_key(home, away))

    if stadium_name is None:
        stadium_name = MATCH_VENUES.get(match_key(away, home))

    if stadium_name is None and match_number:
        stadium_name = MATCH_NUMBER_VENUES.get(match_number)

    details = get_stadium_details(stadium_name)

    if details:
        return details

    return {
        "stadium": stadium_name or "TBC",
        "city": "TBC",
        "country": "TBC",
        "flag": "",
    }


async def async_setup_entry(hass, entry, async_add_entities):
    """Set up sensors from the coordinator stored by __init__.py."""
    coordinator: WorldCupCoordinator = hass.data[DOMAIN][entry.entry_id]

    sensors = [
        WorldCupFixturesSensor(coordinator),
        WorldCupStandingsSensor(coordinator),
        WorldCupNextMatchSensor(coordinator),
        WorldCupLiveMatchesSensor(coordinator),
        WorldCupTodayMatchesSensor(coordinator),
        WorldCupTomorrowMatchesSensor(coordinator),
        WorldCupCompletedMatchesSensor(coordinator),

        WorldCupTotalMatchesPlayedSensor(coordinator),
        WorldCupMatchesRemainingSensor(coordinator),
        WorldCupProgressSensor(coordinator),
        WorldCupTotalGoalsSensor(coordinator),
        WorldCupGoalsPerMatchSensor(coordinator),
        WorldCupTeamsRemainingSensor(coordinator),
        WorldCupCurrentStageSensor(coordinator),

        WorldCupTopScorersSensor(coordinator),
        WorldCupTopScorerSensor(coordinator),
        WorldCupTopAssistsSensor(coordinator),
        WorldCupTopAssistSensor(coordinator),

        WorldCupBiggestWinSensor(coordinator),
        WorldCupHighestScoringMatchSensor(coordinator),
        WorldCupLatestResultSensor(coordinator),
        WorldCupTopScoringTeamSensor(coordinator),
        WorldCupBestDefenceSensor(coordinator),
        WorldCupEliminatedTeamsSensor(coordinator),
        WorldCupLiveGoalsSensor(coordinator),

        WorldCupCountdownSensor(coordinator),
        WorldCupDaysUntilFinalSensor(coordinator),

        WorldCupStadiumsSensor(coordinator),
        WorldCupHostCitiesSensor(coordinator),
        WorldCupFinalVenueSensor(coordinator),

        # Phase 2 additions
        WorldCupGroupLeadersSensor(coordinator),
        WorldCupExtraTimeSensor(coordinator),
        WorldCupPenaltyShootoutSensor(coordinator),

        # Phase 4 additions
        WorldCupTopScorerNoPenSensor(coordinator),
        WorldCupGoalContributionsSensor(coordinator),
        WorldCupPenaltyGoalsSensor(coordinator),

        # Phase 3 additions
        WorldCupBttsRateSensor(coordinator),
        WorldCupOver25Sensor(coordinator),
        WorldCupDrawRateSensor(coordinator),
        WorldCupCleanSheetsSensor(coordinator),
        WorldCupUnbeatenTeamsSensor(coordinator),
        WorldCupComebacksSensor(coordinator),
        WorldCupFirstHalfGoalsSensor(coordinator),
        WorldCupSecondHalfGoalsSensor(coordinator),
    ]

    for group in [
        "GROUP_A", "GROUP_B", "GROUP_C", "GROUP_D",
        "GROUP_E", "GROUP_F", "GROUP_G", "GROUP_H",
        "GROUP_I", "GROUP_J", "GROUP_K", "GROUP_L",
    ]:
        sensors.append(WorldCupGroupFixturesSensor(coordinator, group))

    for stage in [
        "LAST_32",
        "LAST_16",
        "QUARTER_FINALS",
        "SEMI_FINALS",
        "THIRD_PLACE",
        "FINAL",
    ]:
        sensors.append(WorldCupStageFixturesSensor(coordinator, stage))

    async_add_entities(sensors)


def get_matches(coordinator):
    return coordinator.data.get("matches", []) if coordinator.data else []


def get_standings(coordinator):
    return coordinator.data.get("standings", []) if coordinator.data else []


def get_scorers(coordinator):
    return coordinator.data.get("scorers", []) if coordinator.data else []


def format_match(m, match_number=None):
    home = m.get("homeTeam", {})
    away = m.get("awayTeam", {})
    score_meta = m.get("score", {}) or {}
    score = score_meta.get("fullTime", {}) or {}
    half_time = score_meta.get("halfTime", {}) or {}

    home_name = home.get("shortName") or home.get("name") or "TBD"
    away_name = away.get("shortName") or away.get("name") or "TBD"
    match_number = resolve_match_number(m, home_name, away_name, match_number)
    venue = get_match_venue(home_name, away_name, match_number)

    return {
        "matchNumber": match_number,
        "utcDate": m.get("utcDate"),
        "status": m.get("status"),
        "stage": m.get("stage"),
        "group": m.get("group"),
        "venue": venue.get("stadium"),
        "venueCity": venue.get("city"),
        "venueCountry": venue.get("country"),
        "venueFlag": venue.get("flag"),
        "home": home_name,
        "away": away_name,
        "homeScore": score.get("home"),
        "awayScore": score.get("away"),
        # Phase 2 additions
        "halfTimeHome": half_time.get("home"),
        "halfTimeAway": half_time.get("away"),
        "duration": score_meta.get("duration"),   # REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT | None
        "winner": score_meta.get("winner"),        # HOME_TEAM | AWAY_TEAM | DRAW | None
        "minute": m.get("minute"),                 # int when IN_PLAY/PAUSED, else None
    }


def format_live_match_summary(m, match_number=None):
    """Small live-match payload for sensor attributes.

    Rich live data is still available through the integration data/websocket.
    Sensor attributes must stay below Home Assistant recorder limits.
    """
    home = m.get("homeTeam", {}) or {}
    away = m.get("awayTeam", {}) or {}
    score = (m.get("score") or {}).get("fullTime") or {}
    home_name = home.get("shortName") or home.get("name") or "TBD"
    away_name = away.get("shortName") or away.get("name") or "TBD"
    venue = get_match_venue(home_name, away_name, match_number)

    return {
        "matchNumber": match_number or m.get("matchNumber") or m.get("fifaMatchNumber"),
        "utcDate": m.get("utcDate"),
        "status": m.get("status"),
        "minute": m.get("minute"),
        "stage": m.get("stage"),
        "home": home_name,
        "away": away_name,
        "homeScore": score.get("home"),
        "awayScore": score.get("away"),
        "venue": venue.get("stadium"),
    }


def format_scorer(s: dict) -> dict:
    player = s.get("player") or {}
    team = s.get("team") or {}

    goals = s.get("goals") or 0
    assists = s.get("assists") or 0
    penalties = s.get("penalties") or 0
    non_pen_goals = max(goals - penalties, 0)

    dob = player.get("dateOfBirth")
    age = None
    if dob:
        try:
            born = date.fromisoformat(dob)
            today = date.today()
            age = today.year - born.year - (
                (today.month, today.day) < (born.month, born.day)
            )
        except (ValueError, TypeError):
            age = None

    return {
        "name": player.get("name") or "Unknown",
        "firstName": player.get("firstName"),
        "lastName": player.get("lastName"),
        "dateOfBirth": dob,
        "age": age,                          # computed from dateOfBirth; None if unavailable
        "nationality": player.get("nationality"),
        "position": player.get("position"),  # e.g. "Attacker", "Midfielder"
        "team": team.get("shortName") or team.get("name") or "Unknown",
        "goals": goals,
        "assists": assists,
        "penalties": penalties,
        "nonPenaltyGoals": non_pen_goals,    # goals - penalties (never negative)
        "goalContributions": goals + assists, # G+A combined
    }


def parse_date(match):
    utc_date = match.get("utcDate")
    if not utc_date:
        return None
    try:
        return datetime.fromisoformat(utc_date.replace("Z", "+00:00"))
    except ValueError:
        return None


def clean_stage_name(stage):
    return stage.lower().replace("_", " ")


def pretty_stage(stage):
    if not stage:
        return "Not started"

    names = {
        "GROUP_STAGE": "Group Stage",
        "LAST_32": "Last 32",
        "LAST_16": "Last 16",
        "QUARTER_FINALS": "Quarter Finals",
        "SEMI_FINALS": "Semi Finals",
        "THIRD_PLACE": "Third Place",
        "FINAL": "Final",
    }
    return names.get(stage, clean_stage_name(stage).title())


def finished_matches(coordinator):
    return [
        m for m in get_matches(coordinator)
        if m.get("status") == "FINISHED"
    ]


def live_matches(coordinator):
    return [
        m for m in get_matches(coordinator)
        if m.get("status") in ["IN_PLAY", "PAUSED"]
    ]


def knockout_finished_matches(coordinator):
    """Finished matches that are not group stage."""
    return [
        m for m in finished_matches(coordinator)
        if m.get("stage") != "GROUP_STAGE"
    ]


# ---------------------------------------------------------------------------
# Phase 3 helper functions — computed stats
# ---------------------------------------------------------------------------

def both_scored(match: dict) -> bool:
    """True if both teams scored at least one goal in a finished match."""
    home, away = full_time_score(match)
    return home is not None and away is not None and home > 0 and away > 0


def total_goals(match: dict) -> int:
    """Total goals in a finished match. Returns 0 if scores are unavailable."""
    home, away = full_time_score(match)
    return (home or 0) + (away or 0)


def was_draw(match: dict) -> bool:
    """True if match ended level at full time (includes 0-0)."""
    home, away = full_time_score(match)
    return home is not None and away is not None and home == away


def half_time_score(match: dict) -> tuple:
    """Return (home_ht, away_ht) from the halfTime score node."""
    ht = (match.get("score") or {}).get("halfTime") or {}
    return ht.get("home"), ht.get("away")


def is_comeback(match: dict) -> bool:
    """
    True if the team that was LOSING at half-time ended up drawing or winning.
    A 0-0 half-time is NOT a comeback — nobody was losing.
    Requires both halfTime and fullTime scores to be available.
    """
    ht_home, ht_away = half_time_score(match)
    ft_home, ft_away = full_time_score(match)

    if any(v is None for v in [ht_home, ht_away, ft_home, ft_away]):
        return False

    if ht_home > ht_away:
        # Away was losing at HT — check if they drew or won at FT
        return ft_away >= ft_home
    if ht_away > ht_home:
        # Home was losing at HT — check if they drew or won at FT
        return ft_home >= ft_away

    return False  # level at HT — not a comeback scenario


def full_time_score(match):
    score = (match.get("score") or {}).get("fullTime") or {}
    home = score.get("home")
    away = score.get("away")
    return home, away


def team_name(team):
    return team.get("shortName") or team.get("name") or "Unknown"


def get_home_away_names(match):
    return team_name(match.get("homeTeam", {})), team_name(match.get("awayTeam", {}))


def get_team_goal_stats(coordinator):
    stats = {}

    for match in finished_matches(coordinator):
        home, away = get_home_away_names(match)
        home_score, away_score = full_time_score(match)

        if home_score is None or away_score is None:
            continue

        for name in [home, away]:
            if name not in stats:
                stats[name] = {
                    "team": name,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "goalDifference": 0,
                    "played": 0,
                }

        stats[home]["goalsFor"] += home_score
        stats[home]["goalsAgainst"] += away_score
        stats[home]["played"] += 1

        stats[away]["goalsFor"] += away_score
        stats[away]["goalsAgainst"] += home_score
        stats[away]["played"] += 1

    for item in stats.values():
        item["goalDifference"] = item["goalsFor"] - item["goalsAgainst"]

    return list(stats.values())


class WorldCupFixturesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "fixtures"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_fixtures"

    @property
    def native_value(self):
        return len(get_matches(self.coordinator))

    @property
    def extra_state_attributes(self):
        # Keep attributes limited so Home Assistant does not overload the state machine.
        matches = sorted(
            get_matches(self.coordinator),
            key=lambda m: parse_date(m) or datetime.max.replace(tzinfo=timezone.utc),
        )
        return {
            "matches": [
                format_match(m, index + 1)
                for index, m in enumerate(matches[:40])
            ]
        }


class WorldCupStandingsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "standings"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_standings"

    @property
    def native_value(self):
        return len(get_standings(self.coordinator))

    @property
    def extra_state_attributes(self):
        clean = []

        for group in get_standings(self.coordinator):
            table = []
            for team in group.get("table", []):
                team_data = team.get("team", {})
                table.append({
                    "position": team.get("position"),
                    "team": team_data.get("shortName") or team_data.get("name"),
                    "playedGames": team.get("playedGames"),
                    "won": team.get("won"),
                    "draw": team.get("draw"),
                    "lost": team.get("lost"),
                    "goalsFor": team.get("goalsFor"),
                    "goalsAgainst": team.get("goalsAgainst"),
                    "goalDifference": team.get("goalDifference"),
                    "points": team.get("points"),
                    "form": team.get("form") or "",  # e.g. "W,W,D" — Phase 2
                })

            clean.append({
                "group": group.get("group"),
                "stage": group.get("stage"),
                "table": table,
            })

        return {"standings": clean}


class WorldCupNextMatchSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "next_match"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_next_match"

    @property
    def native_value(self):
        upcoming = [
            m for m in get_matches(self.coordinator)
            if m.get("status") in ["TIMED", "SCHEDULED"]
        ]
        if not upcoming:
            return "No upcoming matches"
        m = format_match(upcoming[0])
        return f"{m['home']} v {m['away']}"

    @property
    def extra_state_attributes(self):
        upcoming = [
            m for m in get_matches(self.coordinator)
            if m.get("status") in ["TIMED", "SCHEDULED"]
        ]
        return format_match(upcoming[0]) if upcoming else {}


class WorldCupLiveMatchesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "live_matches"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_live_matches"

    @property
    def native_value(self):
        return len(live_matches(self.coordinator))

    @property
    def extra_state_attributes(self):
        matches = live_matches(self.coordinator)
        return {
            "live_count": len(matches),
            "matches": [
                format_live_match_summary(m)
                for m in matches[:4]
            ],
            "attributes_compacted": True,
        }


class WorldCupTodayMatchesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "today_matches"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_today_matches"

    @property
    def native_value(self):
        return len(self.extra_state_attributes["matches"])

    @property
    def extra_state_attributes(self):
        today = datetime.now(timezone.utc).date()
        return {
            "matches": [
                format_match(m)
                for m in get_matches(self.coordinator)
                if parse_date(m) and parse_date(m).date() == today
            ]
        }


class WorldCupTomorrowMatchesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "tomorrow_matches"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_tomorrow_matches"

    @property
    def native_value(self):
        return len(self.extra_state_attributes["matches"])

    @property
    def extra_state_attributes(self):
        tomorrow = datetime.now(timezone.utc).date() + timedelta(days=1)
        return {
            "matches": [
                format_match(m)
                for m in get_matches(self.coordinator)
                if parse_date(m) and parse_date(m).date() == tomorrow
            ]
        }


class WorldCupCompletedMatchesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "completed_matches"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_completed_matches"

    @property
    def native_value(self):
        return len(finished_matches(self.coordinator))

    @property
    def extra_state_attributes(self):
        completed = [
            format_match(m)
            for m in finished_matches(self.coordinator)
        ]
        return {"matches": completed[-20:]}


class WorldCupGroupFixturesSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator, group):
        super().__init__(coordinator)
        self._wc_group = group
        group_name = group.replace("GROUP_", "Group ")
        self._attr_translation_key = "group_fixtures"
        self._attr_translation_placeholders = {"group": group_name}
        self._attr_has_entity_name = True
        self._attr_unique_id = f"world_cup_{group.lower()}"

    @property
    def native_value(self):
        return len(self.extra_state_attributes["matches"])

    @property
    def extra_state_attributes(self):
        return {
            "matches": [
                format_match(m)
                for m in get_matches(self.coordinator)
                if m.get("group") == self._wc_group
            ]
        }


class WorldCupStageFixturesSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator, stage):
        super().__init__(coordinator)
        self.stage = stage
        self._attr_translation_key = "stage_fixtures"
        self._attr_translation_placeholders = {"stage": clean_stage_name(stage).title()}
        self._attr_has_entity_name = True
        self._attr_unique_id = f"world_cup_{stage.lower()}"

    @property
    def native_value(self):
        return len(self.extra_state_attributes["matches"])

    @property
    def extra_state_attributes(self):
        return {
            "matches": [
                format_match(m)
                for m in get_matches(self.coordinator)
                if m.get("stage") == self.stage
            ]
        }


class WorldCupTotalMatchesPlayedSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "total_matches_played"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_total_matches_played"

    @property
    def native_value(self):
        return len(finished_matches(self.coordinator))


class WorldCupMatchesRemainingSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "matches_remaining"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_matches_remaining"

    @property
    def native_value(self):
        played = len(finished_matches(self.coordinator))
        return max(TOTAL_WORLD_CUP_MATCHES - played, 0)


class WorldCupProgressSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "progress"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_progress"
    _attr_native_unit_of_measurement = "%"

    @property
    def native_value(self):
        played = len(finished_matches(self.coordinator))
        return round((played / TOTAL_WORLD_CUP_MATCHES) * 100, 1)


class WorldCupTotalGoalsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "total_goals"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_total_goals"

    @property
    def native_value(self):
        goals = 0
        for m in finished_matches(self.coordinator):
            home, away = full_time_score(m)
            goals += home or 0
            goals += away or 0
        return goals


class WorldCupGoalsPerMatchSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "goals_per_match"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_goals_per_match"

    @property
    def native_value(self):
        played = len(finished_matches(self.coordinator))
        if played == 0:
            return 0

        goals = 0
        for m in finished_matches(self.coordinator):
            home, away = full_time_score(m)
            goals += home or 0
            goals += away or 0

        return round(goals / played, 2)


class WorldCupTeamsRemainingSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "teams_remaining"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_teams_remaining"

    def _all_teams(self):
        teams = set()

        # Best source once the API has group tables.
        for group in get_standings(self.coordinator):
            for row in group.get("table", []):
                name = team_name(row.get("team", {}))
                if name and name != "Unknown":
                    teams.add(name)

        # Fallback/source before standings are populated.
        for match in get_matches(self.coordinator):
            home, away = get_home_away_names(match)
            if home and home not in ["Unknown", "TBD"]:
                teams.add(home)
            if away and away not in ["Unknown", "TBD"]:
                teams.add(away)

        return teams

    def _team_from_match(self, match, side):
        team = match.get(f"{side}Team", {})
        name = team_name(team)
        return name if name and name not in ["Unknown", "TBD"] else None

    def _winner_loser_from_knockout(self, match):
        if match.get("status") != "FINISHED":
            return None, None

        if match.get("stage") == "GROUP_STAGE":
            return None, None

        home = self._team_from_match(match, "home")
        away = self._team_from_match(match, "away")
        if not home or not away:
            return None, None

        score = match.get("score", {}) or {}
        winner = score.get("winner")

        if winner == "HOME_TEAM":
            return home, away
        if winner == "AWAY_TEAM":
            return away, home

        # Fallback if the API has no winner field.
        for key in ["fullTime", "extraTime", "penalties", "regularTime"]:
            score_block = score.get(key, {}) or {}
            home_score = score_block.get("home")
            away_score = score_block.get("away")
            if home_score is None or away_score is None:
                continue
            if home_score > away_score:
                return home, away
            if away_score > home_score:
                return away, home

        return None, None

    def _group_stage_qualified_teams(self):
        groups = get_standings(self.coordinator)
        if not groups:
            return set()

        qualified = set()
        third_place = []

        for group in groups:
            table = group.get("table", []) or []
            if not table:
                continue

            # Only use group elimination logic once the group looks complete.
            if not all((row.get("playedGames") or 0) >= 3 for row in table):
                return set()

            sorted_table = sorted(
                table,
                key=lambda row: (
                    row.get("points") or 0,
                    row.get("goalDifference") or 0,
                    row.get("goalsFor") or 0,
                    -(row.get("goalsAgainst") or 0),
                ),
                reverse=True,
            )

            for row in sorted_table[:2]:
                name = team_name(row.get("team", {}))
                if name and name != "Unknown":
                    qualified.add(name)

            if len(sorted_table) >= 3:
                third_place.append(sorted_table[2])

        third_place.sort(
            key=lambda row: (
                row.get("points") or 0,
                row.get("goalDifference") or 0,
                row.get("goalsFor") or 0,
                -(row.get("goalsAgainst") or 0),
            ),
            reverse=True,
        )

        for row in third_place[:8]:
            name = team_name(row.get("team", {}))
            if name and name != "Unknown":
                qualified.add(name)

        return qualified

    def _remaining_teams(self):
        all_teams = self._all_teams()

        if not all_teams:
            return []

        knockout_matches = [
            match for match in get_matches(self.coordinator)
            if match.get("stage") and match.get("stage") != "GROUP_STAGE"
        ]

        eliminated = set()
        for match in knockout_matches:
            winner, loser = self._winner_loser_from_knockout(match)
            if loser:
                eliminated.add(loser)

        qualified_after_groups = self._group_stage_qualified_teams()

        # Once the group stage has completed but before knockout eliminations,
        # use the proper 32 qualified teams instead of leaving all 48 active.
        if qualified_after_groups:
            remaining = qualified_after_groups - eliminated
        else:
            remaining = all_teams - eliminated

        return sorted(remaining)

    @property
    def native_value(self):
        return len(self._remaining_teams())

    @property
    def extra_state_attributes(self):
        teams = self._remaining_teams()
        return {
            "count": len(teams),
            "teams": teams,
        }


class WorldCupCurrentStageSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "current_stage"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_current_stage"

    @property
    def native_value(self):
        live = live_matches(self.coordinator)
        if live:
            stages = [m.get("stage") for m in live if m.get("stage")]
            if stages:
                return pretty_stage(stages[0])

        unfinished = [
            m for m in get_matches(self.coordinator)
            if m.get("status") in ["TIMED", "SCHEDULED", "IN_PLAY", "PAUSED"]
        ]
        if unfinished:
            stage = unfinished[0].get("stage")
            return pretty_stage(stage)

        finished = finished_matches(self.coordinator)
        if finished:
            stage = finished[-1].get("stage")
            return pretty_stage(stage)

        return "Not started"


class WorldCupTopScorersSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "top_scorers"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_top_scorers"

    @property
    def native_value(self):
        return len(get_scorers(self.coordinator))

    @property
    def extra_state_attributes(self):
        scorers = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
        ]
        scorers.sort(key=lambda x: x.get("goals", 0), reverse=True)
        return {"scorers": scorers[:20]}


class WorldCupTopScorerSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "top_scorer"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_top_scorer"

    @property
    def native_value(self):
        scorers = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
        ]
        scorers.sort(key=lambda x: x.get("goals", 0), reverse=True)

        if not scorers:
            return "No scorers yet"

        top = scorers[0]
        return f"{top['name']} - {top['goals']} goals"

    @property
    def extra_state_attributes(self):
        scorers = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
        ]
        scorers.sort(key=lambda x: x.get("goals", 0), reverse=True)
        return scorers[0] if scorers else {}


class WorldCupTopAssistsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "top_assists"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_top_assists"

    @property
    def native_value(self):
        assists = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
            if (s.get("assists") or 0) > 0
        ]
        return len(assists)

    @property
    def extra_state_attributes(self):
        assists = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
            if (s.get("assists") or 0) > 0
        ]
        assists.sort(key=lambda x: x.get("assists", 0), reverse=True)
        return {"assists": assists[:20]}


class WorldCupTopAssistSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "top_assist"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_top_assist"

    @property
    def native_value(self):
        assists = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
            if (s.get("assists") or 0) > 0
        ]
        assists.sort(key=lambda x: x.get("assists", 0), reverse=True)

        if not assists:
            return "No assists yet"

        top = assists[0]
        return f"{top['name']} - {top['assists']} assists"

    @property
    def extra_state_attributes(self):
        assists = [
            format_scorer(s)
            for s in get_scorers(self.coordinator)
            if (s.get("assists") or 0) > 0
        ]
        assists.sort(key=lambda x: x.get("assists", 0), reverse=True)
        return assists[0] if assists else {}


class WorldCupBiggestWinSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "biggest_win"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_biggest_win"

    def __init__(self, coordinator):
        super().__init__(coordinator)

    @property
    def native_value(self):
        biggest = None

        for m in finished_matches(self.coordinator):
            home_score, away_score = full_time_score(m)
            if home_score is None or away_score is None:
                continue

            margin = abs(home_score - away_score)
            if margin == 0:
                continue

            if biggest is None or margin > biggest["margin"]:
                home, away = get_home_away_names(m)
                biggest = {
                    "home": home,
                    "away": away,
                    "homeScore": home_score,
                    "awayScore": away_score,
                    "margin": margin,
                }

        if not biggest:
            return "No result yet"

        return f"{biggest['home']} {biggest['homeScore']}-{biggest['awayScore']} {biggest['away']}"

    @property
    def extra_state_attributes(self):
        biggest = None

        for m in finished_matches(self.coordinator):
            home_score, away_score = full_time_score(m)
            if home_score is None or away_score is None:
                continue

            margin = abs(home_score - away_score)
            if margin == 0:
                continue

            if biggest is None or margin > biggest["margin"]:
                home, away = get_home_away_names(m)
                biggest = {
                    "home": home,
                    "away": away,
                    "homeScore": home_score,
                    "awayScore": away_score,
                    "margin": margin,
                    "utcDate": m.get("utcDate"),
                    "stage": m.get("stage"),
                    "group": m.get("group"),
                }

        return biggest or {}


class WorldCupHighestScoringMatchSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "highest_scoring_match"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_highest_scoring_match"

    @property
    def native_value(self):
        highest = None

        for m in finished_matches(self.coordinator):
            home_score, away_score = full_time_score(m)
            if home_score is None or away_score is None:
                continue

            total_goals = home_score + away_score

            if highest is None or total_goals > highest["totalGoals"]:
                home, away = get_home_away_names(m)
                highest = {
                    "home": home,
                    "away": away,
                    "homeScore": home_score,
                    "awayScore": away_score,
                    "totalGoals": total_goals,
                }

        if not highest:
            return "No result yet"

        return f"{highest['home']} {highest['homeScore']}-{highest['awayScore']} {highest['away']}"

    @property
    def extra_state_attributes(self):
        highest = None

        for m in finished_matches(self.coordinator):
            home_score, away_score = full_time_score(m)
            if home_score is None or away_score is None:
                continue

            total_goals = home_score + away_score

            if highest is None or total_goals > highest["totalGoals"]:
                home, away = get_home_away_names(m)
                highest = {
                    "home": home,
                    "away": away,
                    "homeScore": home_score,
                    "awayScore": away_score,
                    "totalGoals": total_goals,
                    "utcDate": m.get("utcDate"),
                    "stage": m.get("stage"),
                    "group": m.get("group"),
                }

        return highest or {}


class WorldCupLatestResultSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "latest_result"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_latest_result"

    @property
    def native_value(self):
        matches = finished_matches(self.coordinator)
        if not matches:
            return "No result yet"

        latest = sorted(
            matches,
            key=lambda m: parse_date(m) or datetime.min.replace(tzinfo=timezone.utc),
        )[-1]

        home, away = get_home_away_names(latest)
        home_score, away_score = full_time_score(latest)
        return f"{home} {home_score}-{away_score} {away}"

    @property
    def extra_state_attributes(self):
        matches = finished_matches(self.coordinator)
        if not matches:
            return {}

        latest = sorted(
            matches,
            key=lambda m: parse_date(m) or datetime.min.replace(tzinfo=timezone.utc),
        )[-1]

        return format_match(latest)


class WorldCupTopScoringTeamSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "top_scoring_team"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_top_scoring_team"

    @property
    def native_value(self):
        stats = get_team_goal_stats(self.coordinator)
        if not stats:
            return "No goals yet"

        stats.sort(key=lambda x: x["goalsFor"], reverse=True)
        top = stats[0]
        return f"{top['team']} - {top['goalsFor']} goals"

    @property
    def extra_state_attributes(self):
        stats = get_team_goal_stats(self.coordinator)
        stats.sort(key=lambda x: x["goalsFor"], reverse=True)
        return {"teams": stats[:20]}


class WorldCupBestDefenceSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "best_defence"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_best_defence"

    def __init__(self, coordinator):
        super().__init__(coordinator)

    @property
    def native_value(self):
        stats = [s for s in get_team_goal_stats(self.coordinator) if s["played"] > 0]
        if not stats:
            return "No data yet"

        stats.sort(key=lambda x: (x["goalsAgainst"], -x["played"]))
        top = stats[0]
        return f"{top['team']} - {top['goalsAgainst']} conceded"

    @property
    def extra_state_attributes(self):
        stats = [s for s in get_team_goal_stats(self.coordinator) if s["played"] > 0]
        stats.sort(key=lambda x: (x["goalsAgainst"], -x["played"]))
        return {"teams": stats[:20]}


class WorldCupEliminatedTeamsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "eliminated_teams"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_eliminated_teams"

    @property
    def native_value(self):
        remaining = WorldCupTeamsRemainingSensor(self.coordinator).native_value
        if isinstance(remaining, int):
            return max(TOTAL_WORLD_CUP_TEAMS - remaining, 0)
        return 0


class WorldCupLiveGoalsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "live_goals"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_live_goals"

    @property
    def native_value(self):
        goals = 0

        for m in live_matches(self.coordinator):
            home_score, away_score = full_time_score(m)
            goals += home_score or 0
            goals += away_score or 0

        return goals

    @property
    def extra_state_attributes(self):
        matches = live_matches(self.coordinator)
        return {
            "live_count": len(matches),
            "matches": [
                format_live_match_summary(m)
                for m in matches[:4]
            ],
            "attributes_compacted": True,
        }


class WorldCupCountdownSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "countdown"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_countdown"
    _attr_native_unit_of_measurement = "days"

    @property
    def native_value(self):
        kickoff = datetime(2026, 6, 11, 20, 0, 0, tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        days = (kickoff - now).days
        return max(days, 0)


class WorldCupDaysUntilFinalSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "days_until_final"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_days_until_final"
    _attr_native_unit_of_measurement = "days"

    @property
    def native_value(self):
        final_date = datetime(2026, 7, 19, 20, 0, 0, tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        days = (final_date - now).days
        return max(days, 0)

class WorldCupStadiumsSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "stadiums"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_stadiums"

    @property
    def native_value(self):
        return len(get_stadiums())

    @property
    def extra_state_attributes(self):
        return {
            "stadiums": get_stadiums(),
            "usa_stadiums": [
                venue for venue in get_stadiums()
                if venue.get("country") == "USA"
            ],
            "canada_stadiums": [
                venue for venue in get_stadiums()
                if venue.get("country") == "Canada"
            ],
            "mexico_stadiums": [
                venue for venue in get_stadiums()
                if venue.get("country") == "Mexico"
            ],
        }


class WorldCupHostCitiesSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "host_cities"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_host_cities"

    @property
    def native_value(self):
        return len(get_host_cities())

    @property
    def extra_state_attributes(self):
        return {"cities": get_host_cities()}


class WorldCupTopScorerNoPenSensor(CoordinatorEntity, SensorEntity):
    """
    Top scorer by non-penalty goals (total goals minus penalty goals).
    Players with 0 non-penalty goals are excluded — this ranks pure goalscorers,
    not penalty specialists.
    """

    _attr_unique_id = "world_cup_top_scorer_no_pen"
    _attr_translation_key = "top_scorer_no_penalties"
    _attr_has_entity_name = True

    def _ranked(self) -> list:
        scorers = [format_scorer(s) for s in get_scorers(self.coordinator)]
        scorers = [s for s in scorers if s["nonPenaltyGoals"] > 0]
        scorers.sort(
            key=lambda x: (x["nonPenaltyGoals"], x["goals"]),
            reverse=True,
        )
        return scorers

    @property
    def native_value(self) -> str:
        ranked = self._ranked()
        if not ranked:
            return "No scorers yet"
        top = ranked[0]
        return f"{top['name']} - {top['nonPenaltyGoals']} goals (excl. pens)"

    @property
    def extra_state_attributes(self) -> dict:
        return {"scorers": self._ranked()[:20]}


class WorldCupGoalContributionsSensor(CoordinatorEntity, SensorEntity):
    """
    Goal contributions (Goals + Assists) leaderboard.
    Tiebreak: goals first, then assists.
    Only players with at least 1 goal or 1 assist are included.
    """

    _attr_unique_id = "world_cup_goal_contributions"
    _attr_translation_key = "goal_contributions"
    _attr_has_entity_name = True

    def _ranked(self) -> list:
        scorers = [format_scorer(s) for s in get_scorers(self.coordinator)]
        scorers = [s for s in scorers if s["goalContributions"] > 0]
        scorers.sort(
            key=lambda x: (x["goalContributions"], x["goals"], x["assists"]),
            reverse=True,
        )
        return scorers

    @property
    def native_value(self) -> str:
        ranked = self._ranked()
        if not ranked:
            return "No data yet"
        top = ranked[0]
        return f"{top['name']} - {top['goalContributions']} (G+A)"

    @property
    def extra_state_attributes(self) -> dict:
        return {"players": self._ranked()[:20]}


class WorldCupPenaltyGoalsSensor(CoordinatorEntity, SensorEntity):
    """
    Total penalty goals scored in the tournament.
    Attributes include per-player breakdown and penalty % of all goals.
    """

    _attr_unique_id = "world_cup_penalty_goals"
    _attr_translation_key = "penalty_goals"
    _attr_has_entity_name = True

    @property
    def native_value(self) -> int:
        return sum((s.get("penalties") or 0) for s in get_scorers(self.coordinator))

    @property
    def extra_state_attributes(self) -> dict:
        scorers = [format_scorer(s) for s in get_scorers(self.coordinator)]
        pen_scorers = sorted(
            [s for s in scorers if s["penalties"] > 0],
            key=lambda x: x["penalties"],
            reverse=True,
        )
        total_goals_all = sum(s["goals"] for s in scorers)
        total_pens = self.native_value
        return {
            "total_penalty_goals": total_pens,
            "total_goals": total_goals_all,
            "penalty_percentage": round(total_pens / total_goals_all * 100, 1)
            if total_goals_all else 0,
            "players": pen_scorers[:20],
        }


class WorldCupBttsRateSensor(CoordinatorEntity, SensorEntity):
    """Both Teams to Score (BTTS) rate — % of finished matches where both teams scored."""

    _attr_unique_id = "world_cup_btts_rate"
    _attr_translation_key = "btts_rate"
    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "%"

    def __init__(self, coordinator):
        super().__init__(coordinator)

    @property
    def native_value(self) -> float:
        played = finished_matches(self.coordinator)
        if not played:
            return 0.0
        count = sum(1 for m in played if both_scored(m))
        return round(count / len(played) * 100, 1)

    @property
    def extra_state_attributes(self) -> dict:
        played = finished_matches(self.coordinator)
        btts = [m for m in played if both_scored(m)]
        return {
            "btts_count": len(btts),
            "matches_played": len(played),
            "btts_matches": [format_match(m) for m in btts[-10:]],
        }


class WorldCupOver25Sensor(CoordinatorEntity, SensorEntity):
    """% of finished matches with 3 or more total goals (over 2.5 line)."""

    _attr_unique_id = "world_cup_over_2_5_rate"
    _attr_translation_key = "over_2_5_goals_rate"
    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "%"

    @property
    def native_value(self) -> float:
        played = finished_matches(self.coordinator)
        if not played:
            return 0.0
        count = sum(1 for m in played if total_goals(m) >= 3)
        return round(count / len(played) * 100, 1)

    @property
    def extra_state_attributes(self) -> dict:
        played = finished_matches(self.coordinator)
        over = [m for m in played if total_goals(m) >= 3]
        return {
            "over_count": len(over),
            "under_count": len(played) - len(over),
            "matches_played": len(played),
            "average_goals": round(
                sum(total_goals(m) for m in played) / len(played), 2
            ) if played else 0,
        }


class WorldCupDrawRateSensor(CoordinatorEntity, SensorEntity):
    """
    % of finished matches ending level at full time.
    Knockout matches that went to ET/pens at 1-1 still count as a draw here
    (correct for this stat — it measures 90-minute outcomes).
    """

    _attr_unique_id = "world_cup_draw_rate"
    _attr_translation_key = "draw_rate"
    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = "%"

    @property
    def native_value(self) -> float:
        played = finished_matches(self.coordinator)
        if not played:
            return 0.0
        count = sum(1 for m in played if was_draw(m))
        return round(count / len(played) * 100, 1)

    @property
    def extra_state_attributes(self) -> dict:
        played = finished_matches(self.coordinator)
        draws = [m for m in played if was_draw(m)]
        return {
            "draw_count": len(draws),
            "matches_played": len(played),
        }


class WorldCupCleanSheetsSensor(CoordinatorEntity, SensorEntity):
    """
    Clean sheets across the tournament.
    native_value: total clean sheet instances (both teams in a 0-0 each get one).
    Attributes: teams ranked by clean sheet count.
    """

    _attr_unique_id = "world_cup_clean_sheets"
    _attr_translation_key = "clean_sheets"
    _attr_has_entity_name = True

    def _team_clean_sheets(self) -> dict:
        cs: dict = {}
        for match in finished_matches(self.coordinator):
            home, away = get_home_away_names(match)
            home_score, away_score = full_time_score(match)
            if home_score is None or away_score is None:
                continue
            if home_score == 0:
                cs[away] = cs.get(away, 0) + 1
            if away_score == 0:
                cs[home] = cs.get(home, 0) + 1
        return cs

    @property
    def native_value(self) -> int:
        return sum(self._team_clean_sheets().values())

    @property
    def extra_state_attributes(self) -> dict:
        cs = self._team_clean_sheets()
        ranked = sorted(
            [{"team": t, "cleanSheets": n} for t, n in cs.items()],
            key=lambda x: x["cleanSheets"],
            reverse=True,
        )
        return {
            "total_clean_sheets": self.native_value,
            "teams": ranked[:20],
        }


class WorldCupUnbeatenTeamsSensor(CoordinatorEntity, SensorEntity):
    """Teams that have played at least one match and not yet lost."""

    _attr_unique_id = "world_cup_unbeaten_teams"
    _attr_translation_key = "unbeaten_teams"
    _attr_has_entity_name = True

    def _unbeaten(self) -> list:
        played: dict = {}
        lost: set = set()

        for match in finished_matches(self.coordinator):
            home, away = get_home_away_names(match)
            home_score, away_score = full_time_score(match)
            if home_score is None or away_score is None:
                continue
            played[home] = played.get(home, 0) + 1
            played[away] = played.get(away, 0) + 1
            if home_score < away_score:
                lost.add(home)
            elif away_score < home_score:
                lost.add(away)

        return sorted(t for t, n in played.items() if n > 0 and t not in lost)

    @property
    def native_value(self) -> int:
        return len(self._unbeaten())

    @property
    def extra_state_attributes(self) -> dict:
        teams = self._unbeaten()
        return {"count": len(teams), "teams": teams}


class WorldCupComebacksSensor(CoordinatorEntity, SensorEntity):
    """Matches where the HT-losing team came back to draw or win at FT."""

    _attr_unique_id = "world_cup_comebacks"
    _attr_translation_key = "comebacks"
    _attr_has_entity_name = True

    def _comeback_matches(self) -> list:
        return [m for m in finished_matches(self.coordinator) if is_comeback(m)]

    def _format_comeback(self, m: dict) -> dict:
        base = format_match(m)
        ht_home, ht_away = half_time_score(m)
        base["halfTimeHome"] = ht_home
        base["halfTimeAway"] = ht_away
        return base

    @property
    def native_value(self) -> int:
        return len(self._comeback_matches())

    @property
    def extra_state_attributes(self) -> dict:
        matches = self._comeback_matches()
        return {
            "count": len(matches),
            "matches": [self._format_comeback(m) for m in matches],
        }


class WorldCupFirstHalfGoalsSensor(CoordinatorEntity, SensorEntity):
    """Total goals scored in the first half across all finished matches."""

    _attr_unique_id = "world_cup_first_half_goals"
    _attr_translation_key = "first_half_goals"
    _attr_has_entity_name = True

    @property
    def native_value(self) -> int:
        total = 0
        for match in finished_matches(self.coordinator):
            ht_home, ht_away = half_time_score(match)
            total += (ht_home or 0) + (ht_away or 0)
        return total

    @property
    def extra_state_attributes(self) -> dict:
        played = finished_matches(self.coordinator)
        first_half = self.native_value
        all_goals = sum(total_goals(m) for m in played)
        return {
            "first_half_goals": first_half,
            "total_goals": all_goals,
            "first_half_percentage": round(first_half / all_goals * 100, 1) if all_goals else 0,
        }


class WorldCupSecondHalfGoalsSensor(CoordinatorEntity, SensorEntity):
    """Goals scored after half-time (fullTime minus halfTime) across all finished matches."""

    _attr_unique_id = "world_cup_second_half_goals"
    _attr_translation_key = "second_half_goals"
    _attr_has_entity_name = True

    @property
    def native_value(self) -> int:
        total = 0
        for match in finished_matches(self.coordinator):
            ft_home, ft_away = full_time_score(match)
            ht_home, ht_away = half_time_score(match)
            if any(v is None for v in [ft_home, ft_away, ht_home, ht_away]):
                continue
            total += max((ft_home - ht_home) + (ft_away - ht_away), 0)
        return total

    @property
    def extra_state_attributes(self) -> dict:
        played = finished_matches(self.coordinator)
        second_half = self.native_value
        all_goals = sum(total_goals(m) for m in played)
        return {
            "second_half_goals": second_half,
            "total_goals": all_goals,
            "second_half_percentage": round(second_half / all_goals * 100, 1) if all_goals else 0,
        }


class WorldCupGroupLeadersSensor(CoordinatorEntity, SensorEntity):
    """Current leader (1st place) of each World Cup group."""

    _attr_unique_id = "world_cup_group_leaders"
    _attr_translation_key = "group_leaders"
    _attr_has_entity_name = True

    def _compute_leaders(self) -> list:
        """
        Returns one entry per group that has at least 1 game played.
        Each entry: { group, team, points, played, won, draw, lost, goalDifference, form }
        Groups with no games played yet are omitted.
        The API returns the table pre-sorted (points desc, GD desc) — no re-sort needed.
        """
        leaders = []
        for group in get_standings(self.coordinator):
            table = group.get("table") or []
            active = [row for row in table if (row.get("playedGames") or 0) > 0]
            if not active:
                continue
            top = active[0]
            team_data = top.get("team", {}) or {}
            leaders.append({
                "group": group.get("group"),
                "team": team_data.get("shortName") or team_data.get("name") or "Unknown",
                "points": top.get("points") or 0,
                "played": top.get("playedGames") or 0,
                "won": top.get("won") or 0,
                "draw": top.get("draw") or 0,
                "lost": top.get("lost") or 0,
                "goalDifference": top.get("goalDifference") or 0,
                "form": top.get("form") or "",
            })
        return leaders

    @property
    def native_value(self) -> int:
        """Number of groups with at least one game played."""
        return len(self._compute_leaders())

    @property
    def extra_state_attributes(self) -> dict:
        return {"leaders": self._compute_leaders()}


class WorldCupExtraTimeSensor(CoordinatorEntity, SensorEntity):
    """Knockout matches decided in extra time (excludes penalty shootouts)."""

    _attr_unique_id = "world_cup_extra_time_matches"
    _attr_translation_key = "extra_time_matches"
    _attr_has_entity_name = True

    def _et_matches(self) -> list:
        return [
            m for m in knockout_finished_matches(self.coordinator)
            if (m.get("score") or {}).get("duration") == "EXTRA_TIME"
        ]

    @property
    def native_value(self) -> int:
        return len(self._et_matches())

    @property
    def extra_state_attributes(self) -> dict:
        return {"matches": [format_match(m) for m in self._et_matches()]}


class WorldCupPenaltyShootoutSensor(CoordinatorEntity, SensorEntity):
    """Knockout matches decided by penalty shootout."""

    _attr_unique_id = "world_cup_penalty_shootouts"
    _attr_translation_key = "penalty_shootouts"
    _attr_has_entity_name = True

    def _pen_matches(self) -> list:
        return [
            m for m in knockout_finished_matches(self.coordinator)
            if (m.get("score") or {}).get("duration") == "PENALTY_SHOOTOUT"
        ]

    @property
    def native_value(self) -> int:
        return len(self._pen_matches())

    @property
    def extra_state_attributes(self) -> dict:
        return {"matches": [format_match(m) for m in self._pen_matches()]}


class WorldCupFinalVenueSensor(CoordinatorEntity, SensorEntity):
    _attr_translation_key = "final_venue"
    _attr_has_entity_name = True
    _attr_unique_id = "world_cup_final_venue"

    @property
    def native_value(self):
        final_venue = next(
            (venue for venue in get_stadiums() if venue.get("stadium") == "MetLife Stadium"),
            None,
        )

        if not final_venue:
            return "Unknown"

        return f"{final_venue['stadium']} - {final_venue['city']}"

    @property
    def extra_state_attributes(self):
        final_venue = next(
            (venue for venue in get_stadiums() if venue.get("stadium") == "MetLife Stadium"),
            None,
        )

        return final_venue or {}
