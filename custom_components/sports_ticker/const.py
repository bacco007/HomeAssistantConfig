DOMAIN = "sports_ticker"

PLATFORMS = ["sensor"]

CONF_LEAGUES = "leagues"
CONF_FAVORITE_TEAMS = "favorite_teams"
CONF_POLL_INTERVAL = "poll_interval"

# Ticker UI helpers exposed as sensor attributes for button-card use
CONF_TICKER_SPEED = "ticker_speed"
DEFAULT_TICKER_SPEED = 12

CONF_TICKER_THEME = "ticker_theme"
TICKER_THEME_LIGHT = "light"
TICKER_THEME_DARK = "dark"
DEFAULT_TICKER_THEME = TICKER_THEME_LIGHT

# Last-good-data cache
STORAGE_VERSION = 1
STORAGE_KEY = "sports_ticker_last_good_data"

DEFAULT_POLL_INTERVAL = 60  # seconds

# Supported ESPN endpoints
LEAGUES = {
    # Baseball
    "mlb": "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",

    # Football
    "nfl": "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
    "cfb": "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",

    # Basketball
    "nba": "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
    "wnba": "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard",

    # Hockey
    "nhl": "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",

    # Golf / Racing
    "pga": "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard",
    "nascar": "https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard",

    # Soccer
    "mls": "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard",
    "epl": "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
    "laliga": "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
    "bundesliga": "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard",
    "seriea": "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard",
    "ligue1": "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard",
    "ucl": "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard",
}

LEAGUE_LABELS = {
    "mlb": "MLB",
    "nfl": "NFL",
    "cfb": "College Football",
    "nba": "NBA",
    "wnba": "WNBA",
    "nhl": "NHL",
    "pga": "PGA Tour",
    "nascar": "NASCAR",

    "mls": "MLS",
    "epl": "Premier League",
    "laliga": "LaLiga",
    "bundesliga": "Bundesliga",
    "seriea": "Serie A",
    "ligue1": "Ligue 1",
    "ucl": "Champions League",
}

# Favorite team options used by the config flow.
# Values should match ESPN team abbreviations where possible.
TEAM_OPTIONS = {
    "mlb": [
        {"value": "ATL", "label": "Atlanta Braves"},
        {"value": "NYM", "label": "New York Mets"},
        {"value": "NYY", "label": "New York Yankees"},
        {"value": "LAD", "label": "Los Angeles Dodgers"},
        {"value": "CHC", "label": "Chicago Cubs"},
        {"value": "BOS", "label": "Boston Red Sox"},
        {"value": "PHI", "label": "Philadelphia Phillies"},
        {"value": "HOU", "label": "Houston Astros"},
        {"value": "TEX", "label": "Texas Rangers"},
        {"value": "BAL", "label": "Baltimore Orioles"},
        {"value": "TOR", "label": "Toronto Blue Jays"},
        {"value": "TB", "label": "Tampa Bay Rays"},
        {"value": "MIA", "label": "Miami Marlins"},
        {"value": "WSH", "label": "Washington Nationals"},
        {"value": "STL", "label": "St. Louis Cardinals"},
        {"value": "MIL", "label": "Milwaukee Brewers"},
        {"value": "CIN", "label": "Cincinnati Reds"},
        {"value": "PIT", "label": "Pittsburgh Pirates"},
        {"value": "ARI", "label": "Arizona Diamondbacks"},
        {"value": "SD", "label": "San Diego Padres"},
        {"value": "SF", "label": "San Francisco Giants"},
        {"value": "COL", "label": "Colorado Rockies"},
        {"value": "CLE", "label": "Cleveland Guardians"},
        {"value": "DET", "label": "Detroit Tigers"},
        {"value": "KC", "label": "Kansas City Royals"},
        {"value": "MIN", "label": "Minnesota Twins"},
        {"value": "CWS", "label": "Chicago White Sox"},
        {"value": "LAA", "label": "Los Angeles Angels"},
        {"value": "SEA", "label": "Seattle Mariners"},
        {"value": "OAK", "label": "Athletics"},
    ],

    "nfl": [
        {"value": "ATL", "label": "Atlanta Falcons"},
        {"value": "CAR", "label": "Carolina Panthers"},
        {"value": "NO", "label": "New Orleans Saints"},
        {"value": "TB", "label": "Tampa Bay Buccaneers"},
        {"value": "KC", "label": "Kansas City Chiefs"},
        {"value": "BUF", "label": "Buffalo Bills"},
        {"value": "DAL", "label": "Dallas Cowboys"},
        {"value": "PHI", "label": "Philadelphia Eagles"},
        {"value": "MIA", "label": "Miami Dolphins"},
        {"value": "NE", "label": "New England Patriots"},
        {"value": "NYJ", "label": "New York Jets"},
        {"value": "BAL", "label": "Baltimore Ravens"},
        {"value": "CIN", "label": "Cincinnati Bengals"},
        {"value": "CLE", "label": "Cleveland Browns"},
        {"value": "PIT", "label": "Pittsburgh Steelers"},
        {"value": "HOU", "label": "Houston Texans"},
        {"value": "IND", "label": "Indianapolis Colts"},
        {"value": "JAX", "label": "Jacksonville Jaguars"},
        {"value": "TEN", "label": "Tennessee Titans"},
        {"value": "DEN", "label": "Denver Broncos"},
        {"value": "LV", "label": "Las Vegas Raiders"},
        {"value": "LAC", "label": "Los Angeles Chargers"},
        {"value": "NYG", "label": "New York Giants"},
        {"value": "WSH", "label": "Washington Commanders"},
        {"value": "CHI", "label": "Chicago Bears"},
        {"value": "DET", "label": "Detroit Lions"},
        {"value": "GB", "label": "Green Bay Packers"},
        {"value": "MIN", "label": "Minnesota Vikings"},
        {"value": "ARI", "label": "Arizona Cardinals"},
        {"value": "LAR", "label": "Los Angeles Rams"},
        {"value": "SF", "label": "San Francisco 49ers"},
        {"value": "SEA", "label": "Seattle Seahawks"},
    ],

    "nba": [
        {"value": "ATL", "label": "Atlanta Hawks"},
        {"value": "BOS", "label": "Boston Celtics"},
        {"value": "BKN", "label": "Brooklyn Nets"},
        {"value": "CHA", "label": "Charlotte Hornets"},
        {"value": "CHI", "label": "Chicago Bulls"},
        {"value": "CLE", "label": "Cleveland Cavaliers"},
        {"value": "DAL", "label": "Dallas Mavericks"},
        {"value": "DEN", "label": "Denver Nuggets"},
        {"value": "DET", "label": "Detroit Pistons"},
        {"value": "GS", "label": "Golden State Warriors"},
        {"value": "HOU", "label": "Houston Rockets"},
        {"value": "IND", "label": "Indiana Pacers"},
        {"value": "LAC", "label": "LA Clippers"},
        {"value": "LAL", "label": "Los Angeles Lakers"},
        {"value": "MEM", "label": "Memphis Grizzlies"},
        {"value": "MIA", "label": "Miami Heat"},
        {"value": "MIL", "label": "Milwaukee Bucks"},
        {"value": "MIN", "label": "Minnesota Timberwolves"},
        {"value": "NO", "label": "New Orleans Pelicans"},
        {"value": "NY", "label": "New York Knicks"},
        {"value": "OKC", "label": "Oklahoma City Thunder"},
        {"value": "ORL", "label": "Orlando Magic"},
        {"value": "PHI", "label": "Philadelphia 76ers"},
        {"value": "PHX", "label": "Phoenix Suns"},
        {"value": "POR", "label": "Portland Trail Blazers"},
        {"value": "SAC", "label": "Sacramento Kings"},
        {"value": "SA", "label": "San Antonio Spurs"},
        {"value": "TOR", "label": "Toronto Raptors"},
        {"value": "UTAH", "label": "Utah Jazz"},
        {"value": "WSH", "label": "Washington Wizards"},
    ],

    "nhl": [
        {"value": "CAR", "label": "Carolina Hurricanes"},
        {"value": "TB", "label": "Tampa Bay Lightning"},
        {"value": "FLA", "label": "Florida Panthers"},
        {"value": "NYR", "label": "New York Rangers"},
        {"value": "NYI", "label": "New York Islanders"},
        {"value": "BOS", "label": "Boston Bruins"},
        {"value": "TOR", "label": "Toronto Maple Leafs"},
        {"value": "MTL", "label": "Montreal Canadiens"},
        {"value": "DET", "label": "Detroit Red Wings"},
        {"value": "CHI", "label": "Chicago Blackhawks"},
        {"value": "COL", "label": "Colorado Avalanche"},
        {"value": "DAL", "label": "Dallas Stars"},
        {"value": "EDM", "label": "Edmonton Oilers"},
        {"value": "LA", "label": "Los Angeles Kings"},
        {"value": "NJ", "label": "New Jersey Devils"},
        {"value": "PHI", "label": "Philadelphia Flyers"},
        {"value": "PIT", "label": "Pittsburgh Penguins"},
        {"value": "SEA", "label": "Seattle Kraken"},
        {"value": "STL", "label": "St. Louis Blues"},
        {"value": "VGK", "label": "Vegas Golden Knights"},
        {"value": "WSH", "label": "Washington Capitals"},
    ],

    "cfb": [
        {"value": "SC", "label": "South Carolina Gamecocks"},
        {"value": "CLEM", "label": "Clemson Tigers"},
        {"value": "UGA", "label": "Georgia Bulldogs"},
        {"value": "ALA", "label": "Alabama Crimson Tide"},
        {"value": "AUB", "label": "Auburn Tigers"},
        {"value": "FLA", "label": "Florida Gators"},
        {"value": "FSU", "label": "Florida State Seminoles"},
        {"value": "MIA", "label": "Miami Hurricanes"},
        {"value": "TENN", "label": "Tennessee Volunteers"},
        {"value": "LSU", "label": "LSU Tigers"},
        {"value": "TEX", "label": "Texas Longhorns"},
        {"value": "OU", "label": "Oklahoma Sooners"},
        {"value": "OSU", "label": "Ohio State Buckeyes"},
        {"value": "MICH", "label": "Michigan Wolverines"},
        {"value": "ND", "label": "Notre Dame Fighting Irish"},
        {"value": "ORE", "label": "Oregon Ducks"},
        {"value": "USC", "label": "USC Trojans"},
    ],

    "wnba": [
        {"value": "ATL", "label": "Atlanta Dream"},
        {"value": "CHI", "label": "Chicago Sky"},
        {"value": "CONN", "label": "Connecticut Sun"},
        {"value": "DAL", "label": "Dallas Wings"},
        {"value": "GS", "label": "Golden State Valkyries"},
        {"value": "IND", "label": "Indiana Fever"},
        {"value": "LA", "label": "Los Angeles Sparks"},
        {"value": "LV", "label": "Las Vegas Aces"},
        {"value": "MIN", "label": "Minnesota Lynx"},
        {"value": "NY", "label": "New York Liberty"},
        {"value": "PHX", "label": "Phoenix Mercury"},
        {"value": "SEA", "label": "Seattle Storm"},
        {"value": "WSH", "label": "Washington Mystics"},
    ],

    "mls": [
        {"value": "ATL", "label": "Atlanta United FC"},
        {"value": "CLT", "label": "Charlotte FC"},
        {"value": "MIA", "label": "Inter Miami CF"},
        {"value": "ORL", "label": "Orlando City SC"},
        {"value": "LA", "label": "LA Galaxy"},
        {"value": "LAFC", "label": "Los Angeles FC"},
        {"value": "NYC", "label": "New York City FC"},
        {"value": "NY", "label": "New York Red Bulls"},
        {"value": "SEA", "label": "Seattle Sounders FC"},
        {"value": "POR", "label": "Portland Timbers"},
        {"value": "NSH", "label": "Nashville SC"},
        {"value": "CIN", "label": "FC Cincinnati"},
        {"value": "CLB", "label": "Columbus Crew"},
        {"value": "PHI", "label": "Philadelphia Union"},
    ],

    "epl": [
        {"value": "MUN", "label": "Manchester United"},
        {"value": "MCI", "label": "Manchester City"},
        {"value": "LIV", "label": "Liverpool"},
        {"value": "ARS", "label": "Arsenal"},
        {"value": "CHE", "label": "Chelsea"},
        {"value": "TOT", "label": "Tottenham Hotspur"},
        {"value": "NEW", "label": "Newcastle United"},
        {"value": "AVL", "label": "Aston Villa"},
        {"value": "EVE", "label": "Everton"},
        {"value": "WHU", "label": "West Ham United"},
    ],

    "laliga": [
        {"value": "MAD", "label": "Real Madrid"},
        {"value": "BAR", "label": "Barcelona"},
        {"value": "ATM", "label": "Atlético Madrid"},
        {"value": "SEV", "label": "Sevilla"},
        {"value": "VAL", "label": "Valencia"},
        {"value": "VIL", "label": "Villarreal"},
        {"value": "BET", "label": "Real Betis"},
    ],

    "bundesliga": [
        {"value": "BAY", "label": "Bayern Munich"},
        {"value": "DOR", "label": "Borussia Dortmund"},
        {"value": "LEV", "label": "Bayer Leverkusen"},
        {"value": "RBL", "label": "RB Leipzig"},
        {"value": "WOB", "label": "VfL Wolfsburg"},
        {"value": "BMG", "label": "Borussia Mönchengladbach"},
    ],

    "seriea": [
        {"value": "INT", "label": "Inter Milan"},
        {"value": "MIL", "label": "AC Milan"},
        {"value": "JUV", "label": "Juventus"},
        {"value": "ROM", "label": "Roma"},
        {"value": "LAZ", "label": "Lazio"},
        {"value": "NAP", "label": "Napoli"},
    ],

    "ligue1": [
        {"value": "PSG", "label": "Paris Saint-Germain"},
        {"value": "MAR", "label": "Marseille"},
        {"value": "LYON", "label": "Lyon"},
        {"value": "MON", "label": "Monaco"},
        {"value": "LIL", "label": "Lille"},
        {"value": "REN", "label": "Rennes"},
    ],

    "ucl": [
        {"value": "MUN", "label": "Manchester United"},
        {"value": "MCI", "label": "Manchester City"},
        {"value": "LIV", "label": "Liverpool"},
        {"value": "ARS", "label": "Arsenal"},
        {"value": "CHE", "label": "Chelsea"},
        {"value": "MAD", "label": "Real Madrid"},
        {"value": "BAR", "label": "Barcelona"},
        {"value": "ATM", "label": "Atlético Madrid"},
        {"value": "BAY", "label": "Bayern Munich"},
        {"value": "DOR", "label": "Borussia Dortmund"},
        {"value": "PSG", "label": "Paris Saint-Germain"},
        {"value": "INT", "label": "Inter Milan"},
        {"value": "MIL", "label": "AC Milan"},
        {"value": "JUV", "label": "Juventus"},
    ],

    # Favorite teams are not really useful for PGA/NASCAR yet,
    # but these empty lists prevent config-flow errors.
    "pga": [],
    "nascar": [],
}
