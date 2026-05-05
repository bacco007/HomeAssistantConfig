DOMAIN = "sports_ticker"

PLATFORMS = ["sensor"]

CONF_LEAGUES = "leagues"
CONF_POLL_INTERVAL = "poll_interval"

# Ticker UI helpers (exposed as sensor attributes for your button-card)
CONF_TICKER_SPEED = "ticker_speed"          # divisor used in duration calc (length / speed)
DEFAULT_TICKER_SPEED = 12

CONF_TICKER_THEME = "ticker_theme"
TICKER_THEME_LIGHT = "light"
TICKER_THEME_DARK = "dark"
DEFAULT_TICKER_THEME = TICKER_THEME_LIGHT

DEFAULT_POLL_INTERVAL = 60  # seconds

# Supported ESPN endpoints
LEAGUES = {
    "mlb": "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    "nfl": "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
    "nba": "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
    "nhl": "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
    "wnba": "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard",
    "cfb": "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",

    # ✅ NEW
    "pga": "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard",
    "nascar": "https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard",
}