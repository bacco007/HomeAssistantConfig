"""All Wales Sport fallback for the two Welsh second-tier leagues."""
from __future__ import annotations

from datetime import datetime, timezone
from html.parser import HTMLParser
import re
from typing import Any
import zlib

import aiohttp


ALL_WALES_COMPETITIONS = {
    111: {
        "cid": 20145,
        "name": "Cymru North",
        "teams": (
            "Airbus UK Broughton", "Brickfield Rangers", "Buckley Town",
            "Caersws", "Denbigh Town", "Flint Mountain", "Gresford Athletic",
            "Guilsfield", "Holyhead Hotspur", "Holywell Town", "Llandudno",
            "Mold Alexandra", "Newtown", "Penrhyncoch", "Rhyl 1879",
            "Ruthin Town",
        ),
    },
    112: {
        "cid": 20146,
        "name": "Cymru South",
        "teams": (
            "Afan Lido", "Aberystwyth Town", "Baglan Dragons", "Caerau Ely",
            "Caerphilly Athletic", "Cardiff Draconians", "Carmarthen Town",
            "Llanelli Town", "Llantwit Major", "Newport City",
            "Pontardawe Town", "Pontypridd United", "Pure Swansea",
            "Treowen Stars", "Trethomas Bluebirds", "Ynyshir Albions",
        ),
    },
}


class _CompetitionParser(HTMLParser):
    """Read the three ASP.NET tab panels without executing page scripts."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.panel: int | None = None
        self.panel_depth = 0
        self.rows: dict[int, list[list[str]]] = {1: [], 2: [], 3: []}
        self._row: list[str] | None = None
        self._cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "div":
            identity = attributes.get("id", "") or ""
            match = re.search(r"TabPanel([123])$", identity)
            if match:
                self.panel = int(match.group(1))
                self.panel_depth = 1
            elif self.panel is not None:
                self.panel_depth += 1
        if self.panel is not None and tag == "tr":
            self._row = []
        elif self._row is not None and tag in {"td", "th"}:
            self._cell = []

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._cell is not None:
            value = re.sub(r"\s+", " ", "".join(self._cell)).strip()
            if self._row is not None:
                self._row.append(value)
            self._cell = None
        elif tag == "tr" and self._row is not None:
            if self.panel is not None and any(self._row):
                self.rows[self.panel].append(self._row)
            self._row = None
        if tag == "div" and self.panel is not None:
            self.panel_depth -= 1
            if self.panel_depth <= 0:
                self.panel = None


def _team_id(competition_id: int, name: str) -> int:
    """Return a stable positive local ID for a Welsh club."""
    token = f"{competition_id}:{name.casefold()}".encode()
    return 2_000_000_000 + (zlib.crc32(token) & 0x0FFFFFFF)


def _date(value: str) -> datetime | None:
    try:
        return datetime.strptime(value, "%d %B %Y").replace(
            hour=15, tzinfo=timezone.utc
        )
    except (TypeError, ValueError):
        return None


def _fixture(competition_id: int, league_name: str, date: datetime,
             home: str, away: str, home_score: int | None = None,
             away_score: int | None = None) -> dict[str, Any]:
    finished = home_score is not None and away_score is not None
    fixture_id = _team_id(
        competition_id,
        f"{date.date().isoformat()}:{home}:{away}",
    )
    return {
        "fixture": {
            "id": fixture_id,
            "date": date.isoformat(),
            "timestamp": int(date.timestamp()),
            "timezone": "Europe/London",
            "venue": {"name": None, "city": None},
            "status": {
                "long": "Match Finished" if finished else "Not Started",
                "short": "FT" if finished else "NS",
                "elapsed": None,
            },
        },
        "league": {
            "id": competition_id,
            "name": league_name,
            "country": "Wales",
            "country_code": "WAL",
            "round": None,
        },
        "teams": {
            "home": {"id": _team_id(competition_id, home), "name": home, "logo": None},
            "away": {"id": _team_id(competition_id, away), "name": away, "logo": None},
        },
        "goals": {"home": home_score, "away": away_score},
        "score": {
            "halftime": {"home": None, "away": None},
            "fulltime": {"home": home_score, "away": away_score},
        },
    }


def parse_competition(html: str, competition_id: int) -> dict[str, Any]:
    """Convert an All Wales Sport competition page to Football Hub data."""
    details = ALL_WALES_COMPETITIONS[competition_id]
    parser = _CompetitionParser()
    parser.feed(html)
    fixtures: dict[int, dict[str, Any]] = {}
    # Keep a complete fallback list. The source occasionally serves an empty
    # ASP.NET shell to automated clients; that must not empty HA dropdowns.
    names: set[str] = set(details["teams"])

    for panel, finished in ((1, False), (2, True)):
        match_date: datetime | None = None
        for row in parser.rows[panel]:
            if len(row) == 1:
                match_date = _date(row[0]) or match_date
                continue
            if match_date is None:
                continue
            if finished and len(row) >= 4 and row[1].isdigit() and row[2].isdigit():
                home, away = row[0], row[3]
                item = _fixture(
                    competition_id, details["name"], match_date, home, away,
                    int(row[1]), int(row[2]),
                )
            elif not finished and len(row) >= 3:
                # Current pages use either four cells (home, v, blank, away)
                # or three cells (home, v, away).
                home, away = row[0], row[-1]
                if not home or not away or home.casefold() == "teams":
                    continue
                item = _fixture(
                    competition_id, details["name"], match_date, home, away
                )
            else:
                continue
            names.update((home, away))
            fixtures[item["fixture"]["id"]] = item

    standings = []
    for row in parser.rows[3]:
        if len(row) < 8 or not row[2].isdigit():
            continue
        name = row[1]
        names.add(name)
        standings.append({
            "rank": len(standings) + 1,
            "team": {"id": _team_id(competition_id, name), "name": name, "logo": None},
            "points": int(row[7]) if row[7].lstrip("-").isdigit() else 0,
            "goalsDiff": int(row[6]) if row[6].lstrip("+-").isdigit() else 0,
            "all": {
                "played": int(row[2]),
                "win": int(row[3]),
                "draw": int(row[4]),
                "lose": int(row[5]),
                "goals": {"for": 0, "against": 0},
            },
        })

    # A zeroed table still gives the frontend a complete, useful club list
    # before the source publishes (or while it temporarily withholds) a table.
    if not standings:
        standings = [{
            "rank": position,
            "team": {
                "id": _team_id(competition_id, name),
                "name": name,
                "logo": None,
            },
            "points": 0,
            "goalsDiff": 0,
            "all": {
                "played": 0, "win": 0, "draw": 0, "lose": 0,
                "goals": {"for": 0, "against": 0},
            },
        } for position, name in enumerate(sorted(names, key=str.casefold), 1)]

    teams = [{
        "team": {
            "id": _team_id(competition_id, name),
            "name": name,
            "code": None,
            "country": "Wales",
            "founded": None,
            "logo": None,
        },
        "venue": {},
    } for name in sorted(names, key=str.casefold)]

    return {
        "fixtures": sorted(
            fixtures.values(), key=lambda item: item["fixture"]["timestamp"]
        ),
        "standings": [{"league": {"standings": [standings]}}],
        "teams": teams,
    }


async def fetch_competition(
    session: aiohttp.ClientSession, competition_id: int
) -> dict[str, Any]:
    """Download and parse one permitted All Wales Sport competition page."""
    cid = ALL_WALES_COMPETITIONS[competition_id]["cid"]
    url = f"https://www.allwalessport.co.uk/football.aspx?cid={cid}"
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": "https://www.allwalessport.co.uk/",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
        ),
    }
    async with session.get(
        url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)
    ) as response:
        response.raise_for_status()
        html = await response.text()
        return parse_competition(html, competition_id)
