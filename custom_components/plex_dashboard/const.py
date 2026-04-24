"""Constants for the Plex Dashboard integration."""
from __future__ import annotations

DOMAIN = "plex_dashboard"

# Config entry data keys
CONF_PLEX_SLUG = "plex_slug"
CONF_DASHBOARD_URL_PATH = "dashboard_url_path"
CONF_INSTALL_THEME = "install_theme"
CONF_INSTALL_PACKAGE = "install_package"
CONF_REGISTER_DASHBOARD = "register_dashboard"
CONF_CREATE_HELPERS = "create_helpers"
# Legacy keys -- retained for backward compatibility with existing
# config entries from v2.2.x / v2.3.0-v2.3.2. As of v2.3.3 the dashboard
# discovers `plex_recently_added` typed sensors via auto-entities regex
# at render time, so none of these keys are read or written by the
# integration anymore. They are silently tolerated if present in
# entry.data so existing installs don't error on upgrade.
CONF_RECENTLY_ADDED_SENSOR = "recently_added_sensor"
CONF_RECENTLY_ADDED_MOVIES_SENSOR = "recently_added_movies_sensor"
CONF_RECENTLY_ADDED_TV_SENSOR = "recently_added_tv_sensor"
CONF_RECENTLY_ADDED_MUSIC_SENSOR = "recently_added_music_sensor"
# Options-flow toggle: when True on next reload, force-overwrite the
# Lovelace storage payload with the bundled YAML, ignoring the
# "user may have edited it" safety check. Auto-clears after one run.
CONF_RESET_DASHBOARD = "reset_dashboard"

# Internal entry.data key: sha256 of the dashboard dict we last wrote into
# Lovelace storage. Used to detect whether the user has edited the dashboard
# since our last install; if not, we may safely overwrite it on upgrade.
DATA_INSTALLED_DASHBOARD_HASH = "installed_dashboard_hash"

DEFAULT_DASHBOARD_URL_PATH = "plex-dashboard"
DEFAULT_DASHBOARD_TITLE = "Plex"
DEFAULT_DASHBOARD_ICON = "mdi:plex"

# File names bundled in /data
DATA_DIR = "data"
THEME_FILENAME = "plex-dashboard.yaml"
DASHBOARD_FILENAME = "plex_dashboard_dashboard.yaml"
PACKAGE_FILENAME = "plex_dashboard_package.yaml"

# Output paths (relative to /config)
THEMES_OUTPUT_DIR = "themes"
DASHBOARDS_OUTPUT_DIR = "dashboards"
PACKAGES_OUTPUT_DIR = "packages"

THEME_OUTPUT_NAME = "plex-dashboard.yaml"
DASHBOARD_OUTPUT_NAME = "plex_dashboard.yaml"
PACKAGE_OUTPUT_NAME = "plex_dashboard.yaml"

PLACEHOLDER_SLUG = "PLEX_SERVER_NAME"

# Required HACS frontend cards (custom: element name -> friendly name + repo).
# Kept intentionally small: anything that has a built-in equivalent (mushroom,
# bar-card, button-card) has been replaced in the bundled dashboard YAML.
# These three have no built-in alternative.
REQUIRED_FRONTEND_CARDS: dict[str, dict[str, str]] = {
    "auto-entities": {
        "name": "Auto-entities",
        "repo": "thomasloven/lovelace-auto-entities",
    },
    "mini-media-player": {
        "name": "Mini media player",
        "repo": "kalkih/mini-media-player",
    },
    "upcoming-media-card": {
        "name": "Upcoming media card",
        "repo": "custom-cards/upcoming-media-card",
    },
}

# My Home Assistant deep-link template for one-click HACS install.
HACS_DEEP_LINK = (
    "https://my.home-assistant.io/redirect/hacs_repository/"
    "?owner={owner}&repository={repo}&category=plugin"
)

# Helpers (defined as YAML in plex_dashboard_package.yaml since 2.1.5).
# These dicts are kept for reference / Repairs diagnostics only -- the
# integration no longer creates helpers programmatically (HA core does not
# expose input_boolean / input_select storage collections via hass.data).
HELPERS_INPUT_BOOLEAN: dict[str, dict[str, str]] = {
    "plex_dashboard_show_paused": {
        "name": "Show paused streams",
        "icon": "mdi:pause-circle-outline",
    },
    "plex_dashboard_show_offline_clients": {
        "name": "Show idle clients",
        "icon": "mdi:monitor-off",
    },
}

HELPERS_INPUT_SELECT: dict[str, dict] = {
    "plex_dashboard_recently_added_filter": {
        "name": "Recently added filter",
        "icon": "mdi:filter-variant",
        "options": ["All", "Movies", "TV", "Music"],
        "initial": "All",
    },
}
