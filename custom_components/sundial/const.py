"""Constants for the Sundial adaptive lighting integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "sundial"
PLATFORMS: Final = ["select", "switch"]

# --- Storage -----------------------------------------------------------------
STORAGE_KEY: Final = "sundial"
STORAGE_VERSION: Final = 1

# --- Config entry ------------------------------------------------------------
# The config entry is intentionally minimal: it only holds the entity-ids of
# the lights/groups to control. Everything else lives in the web-ui panel and
# is persisted via the Store (see store.py).
CONF_LIGHTS: Final = "lights"

# --- Timeline --------------------------------------------------------------
# Each light row on a schema's 24-hour timeline has one cell per hour.
HOURS_PER_DAY: Final = 24

# --- Manual-control detection thresholds -------------------------------------
# How much an attribute must change (vs. the value we last applied) before we
# treat it as a manual override. Names and values follow Adaptive Lighting
# (see THIRD_PARTY_LICENSES at the repository root).
BRIGHTNESS_CHANGE: Final = 25  # on the 0-255 scale
COLOR_TEMP_CHANGE: Final = 100  # Kelvin
RGB_REDMEAN_CHANGE: Final = 80

# --- Defaults (global settings) ----------------------------------------------
DEFAULT_INTERVAL: Final = 90  # seconds between adaptation passes
DEFAULT_TRANSITION: Final = 45  # seconds
DEFAULT_INITIAL_TRANSITION: Final = 1  # seconds
DEFAULT_SEND_SPLIT_DELAY: Final = 350  # milliseconds between split commands
DEFAULT_AUTORESET_CONTROL: Final = 0  # seconds, 0 disables auto-reset

# --- Defaults (per schema) ---------------------------------------------------
DEFAULT_MIN_BRIGHTNESS: Final = 1  # percent
DEFAULT_MAX_BRIGHTNESS: Final = 100  # percent
DEFAULT_MIN_COLOR_TEMP: Final = 2000  # Kelvin
DEFAULT_MAX_COLOR_TEMP: Final = 5500  # Kelvin

# How a light's per-light min/max apply on sun-following hours:
#   "cap"   — clamp the sun's value into the range (default; tracks the sun)
#   "scale" — map the sun's 0..1 signal onto the range (use the full range)
LIMIT_MODES: Final = ("cap", "scale")
DEFAULT_LIMIT_MODE: Final = "cap"

# How colour is sent to lights that support both colour temperature and RGB:
#   "auto" — native colour temperature when available (default)
#   "rgb"  — always render the temperature as an RGB colour
RENDER_MODES: Final = ("auto", "rgb")
DEFAULT_RENDER_MODE: Final = "auto"
# --- Sun defaults ----------------------------------------------------------
DEFAULT_SUN_MIN_BRIGHTNESS: Final = 5  # percent
DEFAULT_SUNRISE_OFFSET: Final = 5000  # seconds
DEFAULT_SUNSET_OFFSET: Final = -5000  # seconds
# Width of the tanh brightness ramp on each side of sunrise/sunset (seconds).
DEFAULT_RAMP_DARK: Final = 5000  # night side of the ramp
DEFAULT_RAMP_LIGHT: Final = 9000  # day side of the ramp

DEFAULT_SCHEMA_ID: Final = "default"

# --- Services ----------------------------------------------------------------
SERVICE_APPLY: Final = "apply"
SERVICE_SET_MANUAL_CONTROL: Final = "set_manual_control"

ATTR_MANUAL_CONTROL: Final = "manual_control"
ATTR_TURN_ON: Final = "turn_on"

# --- Frontend ----------------------------------------------------------------
PANEL_URL_PATH: Final = "sundial"
PANEL_TITLE: Final = "Sundial"
PANEL_ICON: Final = "mdi:theme-light-dark"
PANEL_STATIC_PATH: Final = "/sundial_panel/sundial-panel.js"
PANEL_ELEMENT: Final = "sundial-panel"

# Dispatcher signal fired when stored config changes so entities can refresh.
SIGNAL_CONFIG_UPDATED: Final = f"{DOMAIN}_config_updated"
