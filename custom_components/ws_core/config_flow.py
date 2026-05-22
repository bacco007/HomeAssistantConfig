"""Config flow for Weather Station Core.

Setup wizard walks the user through:
  Step 1 (user)            – Station name & entity prefix
  Step 2 (required_sources)– Map the 7 required sensors
  Step 3 (optional_sources)– Map optional sensors (lux, UV, dew point, battery)
  Step 4 (location)        – Hemisphere, climate region, elevation (auto-detected)
  Step 5 (display)         – Units / temperature display preference
  Step 6 (forecast)        – Open-Meteo forecast options
  Step 7 (alerts)          – Alert thresholds & advanced options

The Options flow (Configure button) exposes all settings for post-install changes.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.helpers import selector

from .const import (
    CLIMATE_REGION_OPTIONS,
    CONF_AQI_INTERVAL_MIN,
    CONF_CAL_HUMIDITY,
    CONF_CAL_PRESSURE_HPA,
    CONF_CAL_TEMP_C,
    CONF_CAL_WIND_MS,
    CONF_CLIMATE_REGION,
    CONF_ELEVATION_M,
    CONF_ENABLE_ADVANCED_SENSORS,
    # v0.7.0
    CONF_ENABLE_AIR_QUALITY,
    CONF_ENABLE_COMFORT_INDICES,
    CONF_ENABLE_DIAGNOSTICS,
    CONF_ENABLE_DISPLAY_SENSORS,
    CONF_ENABLE_FIRE_RISK,
    CONF_ENABLE_FOG,
    CONF_ENABLE_FWI_COMPONENTS,
    CONF_ENABLE_MOON,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_SEA_TEMP,
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_ENABLE_WUNDERGROUND,
    CONF_ENABLE_ZAMBRETTI,
    CONF_FORECAST_API_KEY,
    CONF_FORECAST_ENABLED,
    CONF_FORECAST_INTERVAL_MIN,
    CONF_FORECAST_LAT,
    CONF_FORECAST_LON,
    CONF_FORECAST_PROVIDER,
    CONF_HEMISPHERE,
    CONF_NAME,
    CONF_PREFIX,
    CONF_PRESSURE_TREND_WINDOW_H,
    CONF_RAIN_FILTER_ALPHA,
    CONF_RAIN_PENALTY_HEAVY_MMPH,
    CONF_RAIN_PENALTY_LIGHT_MMPH,
    CONF_SEA_TEMP_LAT,
    CONF_SEA_TEMP_LON,
    CONF_SOLAR_INTERVAL_MIN,
    CONF_SOLAR_PANEL_AZIMUTH,
    CONF_SOLAR_PANEL_TILT,
    CONF_SOLAR_PEAK_KW,
    CONF_SOURCES,
    CONF_STALENESS_S,
    CONF_TEMP_UNIT,
    CONF_THRESH_FREEZE_C,
    CONF_THRESH_RAIN_RATE_MMPH,
    CONF_THRESH_WIND_GUST_MS,
    CONF_UNITS_MODE,
    CONF_WU_API_KEY,
    CONF_WU_INTERVAL_MIN,
    CONF_WU_STATION_ID,
    CONFIG_VERSION,
    DEFAULT_AQI_INTERVAL_MIN,
    DEFAULT_CAL_HUMIDITY,
    DEFAULT_CAL_PRESSURE_HPA,
    DEFAULT_CAL_TEMP_C,
    DEFAULT_CAL_WIND_MS,
    DEFAULT_CLIMATE_REGION,
    DEFAULT_ELEVATION_M,
    DEFAULT_ENABLE_ADVANCED_SENSORS,
    DEFAULT_ENABLE_AIR_QUALITY,
    DEFAULT_ENABLE_COMFORT_INDICES,
    DEFAULT_ENABLE_DIAGNOSTICS,
    DEFAULT_ENABLE_DISPLAY_SENSORS,
    DEFAULT_ENABLE_FIRE_RISK,
    DEFAULT_ENABLE_FOG,
    DEFAULT_ENABLE_FWI_COMPONENTS,
    DEFAULT_ENABLE_MOON,
    DEFAULT_ENABLE_POLLEN,
    DEFAULT_ENABLE_SEA_TEMP,
    DEFAULT_ENABLE_SOLAR_FORECAST,
    DEFAULT_ENABLE_THUNDERSTORM,
    DEFAULT_ENABLE_VIGICRUES,
    DEFAULT_ENABLE_VIGILANCE_METEO,
    DEFAULT_ENABLE_WUNDERGROUND,
    DEFAULT_FORECAST_ENABLED,
    DEFAULT_FORECAST_INTERVAL_MIN,
    DEFAULT_FORECAST_PROVIDER,
    DEFAULT_HEMISPHERE,
    DEFAULT_NAME,
    DEFAULT_PREFIX,
    DEFAULT_PRESSURE_TREND_WINDOW_H,
    DEFAULT_RAIN_FILTER_ALPHA,
    DEFAULT_RAIN_PENALTY_HEAVY_MMPH,
    DEFAULT_RAIN_PENALTY_LIGHT_MMPH,
    DEFAULT_SOLAR_INTERVAL_MIN,
    DEFAULT_SOLAR_PANEL_AZIMUTH,
    DEFAULT_SOLAR_PANEL_TILT,
    DEFAULT_SOLAR_PEAK_KW,
    DEFAULT_STALENESS_S,
    DEFAULT_TEMP_UNIT,
    DEFAULT_THRESH_FREEZE_C,
    DEFAULT_THRESH_RAIN_RATE_MMPH,
    DEFAULT_THRESH_WIND_GUST_MS,
    DEFAULT_UNITS_MODE,
    DEFAULT_WU_INTERVAL_MIN,
    DOMAIN,
    FORECAST_PROVIDER_MET_NO,
    FORECAST_PROVIDER_METEO_FRANCE,
    FORECAST_PROVIDER_NWS,
    FORECAST_PROVIDER_OPEN_METEO,
    FORECAST_PROVIDER_OWM,
    FORECAST_PROVIDER_PIRATE,
    HEMISPHERE_OPTIONS,
    OPTIONAL_SOURCES,
    PROVIDERS_REQUIRING_API_KEY,
    REQUIRED_SOURCES,
    SRC_BATTERY,
    SRC_DEW_POINT,
    SRC_GUST,
    SRC_HUM,
    SRC_LUX,
    SRC_PRESS,
    SRC_RAIN_TOTAL,
    SRC_TEMP,
    SRC_UV,
    SRC_WIND,
    SRC_WIND_DIR,
    TEMP_UNIT_OPTIONS,
    UNITS_MODE_OPTIONS,
    VALID_ELEVATION_MAX_M,
    VALID_ELEVATION_MIN_M,
    VALID_TEMP_MAX_C,
    VALID_TEMP_MIN_C,
    VALID_WIND_GUST_MAX_MS,
)

_LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _validate_wu_credentials(station_id: str, api_key: str) -> tuple[bool, str]:
    """Validate Weather Underground station ID + API key. Returns (valid, error_key)."""
    try:
        import aiohttp

        url = (
            f"https://api.weather.com/v2/pws/observations/current"
            f"?stationId={station_id}&format=json&units=m&apiKey={api_key}&numericPrecision=decimal"
        )
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    return True, ""
                if resp.status == 401 or resp.status == 403:
                    return False, "invalid_api_key"
                if resp.status == 404:
                    return False, "station_not_found"
                return False, "cannot_connect"
    except Exception:
        return False, "cannot_connect"


def _sanitize_prefix(prefix: str) -> str:
    p = (prefix or "").strip().lower()
    p = "".join(ch if (ch.isalnum() or ch == "_") else "_" for ch in p)
    p = p.strip("_")
    return p or DEFAULT_PREFIX


def _guess_defaults(hass: HomeAssistant) -> dict[str, str]:
    """Best-effort auto-detection of sensor entity IDs by name pattern."""
    guess: dict[str, str] = {}
    candidates = [s.entity_id for s in hass.states.async_all()]

    def pick(subs: list[str]) -> str | None:
        for sub in subs:
            for eid in candidates:
                if eid.endswith(sub):
                    return eid
        for sub in subs:
            for eid in candidates:
                if sub in eid:
                    return eid
        return None

    mapping = {
        SRC_TEMP: ["ws_01_temperature", "ws90_temperature", "temperature"],
        SRC_HUM: ["ws_01_humidity", "ws90_humidity", "humidity"],
        SRC_PRESS: ["ws_01_pressure", "ws90_pressure", "pressure"],
        SRC_WIND: ["ws_01_speed_1", "wind_speed", "speed_1"],
        SRC_GUST: ["ws_01_speed_2", "wind_gust", "speed_2", "gust"],
        SRC_WIND_DIR: ["ws_01_direction", "wind_direction", "direction"],
        SRC_RAIN_TOTAL: ["ws_01_precipitation", "rain_total", "precipitation", "rainfall"],
        SRC_LUX: ["ws_01_illuminance", "illuminance", "lux"],
        SRC_UV: ["ws_01_uv_index", "uv_index", "uv"],
        SRC_DEW_POINT: ["ws_01_dew_point", "dew_point"],
        SRC_BATTERY: ["ws_01_battery", "battery"],
    }

    for k, subs in mapping.items():
        eid = pick(subs)
        if eid:
            guess[k] = eid
    return guess


def _auto_detect_elevation(hass: HomeAssistant) -> float:
    """Try to read elevation from multiple sources in priority order.

    Priority:
      1. HA system configuration (hass.config.elevation)
      2. Weather station entity attribute 'elevation' or 'altitude'
      3. Fall back to 0.0
    """
    # 1. HA system config
    try:
        elev = float(hass.config.elevation)
        if VALID_ELEVATION_MIN_M <= elev <= VALID_ELEVATION_MAX_M:
            _LOGGER.debug("Elevation auto-detected from HA config: %.1f m", elev)
            return round(elev, 1)
    except (TypeError, ValueError):
        pass

    # 2. Scan entity states for elevation/altitude attributes
    for state in hass.states.async_all():
        attrs = state.attributes
        for attr_key in ("elevation", "altitude", "elevation_m", "alt_m"):
            raw = attrs.get(attr_key)
            if raw is not None:
                try:
                    elev = float(raw)
                    if VALID_ELEVATION_MIN_M <= elev <= VALID_ELEVATION_MAX_M:
                        _LOGGER.debug(
                            "Elevation auto-detected from entity %s attr '%s': %.1f m",
                            state.entity_id,
                            attr_key,
                            elev,
                        )
                        return round(elev, 1)
                except (TypeError, ValueError):
                    continue

    return DEFAULT_ELEVATION_M


def _guess_hemisphere(hass: HomeAssistant) -> str:
    """Infer hemisphere from HA system latitude."""
    try:
        lat = float(hass.config.latitude)
        return "Southern" if lat < 0 else "Northern"
    except (TypeError, ValueError):
        return DEFAULT_HEMISPHERE


def _guess_climate_region(hass: HomeAssistant) -> str:
    """Best-effort climate region guess from HA lat/lon."""
    try:
        lat = float(hass.config.latitude)
        lon = float(hass.config.longitude)
    except (TypeError, ValueError):
        return DEFAULT_CLIMATE_REGION

    # Southern hemisphere → Australia (only option currently)
    if lat < 0:
        return "Australia"
    # Scandinavia
    if lat > 55 and 5 <= lon <= 32:
        return "Scandinavia"
    # Mediterranean
    if 30 <= lat <= 47 and -5 <= lon <= 40:
        return "Mediterranean"
    # North America
    if -170 <= lon <= -50:
        return "North America East" if lon > -100 else "North America West"
    # Continental Europe (east of 15°E)
    if lon > 15:
        return "Continental Europe"
    # Default Atlantic Europe
    return "Atlantic Europe"


def _is_imperial(units_mode: str, hass: HomeAssistant) -> bool:
    m = (units_mode or "auto").lower()
    if m == "imperial":
        return True
    if m == "metric":
        return False
    try:
        return hass.config.units.temperature_unit != "°C"
    except Exception:
        return False


def _convert_gust_to_display(ms: float, imperial: bool) -> float:
    return ms / 0.44704 if imperial else ms


def _convert_gust_to_ms(val: float, imperial: bool) -> float:
    return val * 0.44704 if imperial else val


def _convert_rain_to_display(mmph: float, imperial: bool) -> float:
    return mmph / 25.4 if imperial else mmph


def _convert_rain_to_mmph(val: float, imperial: bool) -> float:
    return val * 25.4 if imperial else val


def _convert_temp_to_display(c: float, imperial: bool) -> float:
    return (c * 9.0 / 5.0) + 32.0 if imperial else c


def _convert_temp_to_c(val: float, imperial: bool) -> float:
    return (val - 32.0) * 5.0 / 9.0 if imperial else val


# ---------------------------------------------------------------------------
# Config Flow
# ---------------------------------------------------------------------------


class WSStationConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = CONFIG_VERSION

    @classmethod
    def async_get_options_flow(cls, config_entry: config_entries.ConfigEntry):
        return WSStationOptionsFlowHandler()

    def __init__(self):
        self._data: dict[str, Any] = {}
        self._step_history: list[str] = []

    def _show_step(
        self,
        step_id: str,
        data_schema: vol.Schema,
        errors: dict | None = None,
        last_step: bool = False,
        description_placeholders: dict | None = None,
    ):
        """Wrapper around async_show_form that adds back-button and tracks history."""
        # Avoid duplicating the same step when re-rendering due to validation errors
        if not self._step_history or self._step_history[-1] != step_id:
            self._step_history.append(step_id)
        # Add go-back toggle to every step except the first one
        if step_id != "user" and len(self._step_history) > 1:
            try:
                extended = {**data_schema.schema, vol.Optional("_go_back", default=False): bool}
                data_schema = vol.Schema(extended)
            except Exception:  # noqa: BLE001
                pass
        return self.async_show_form(
            step_id=step_id,
            data_schema=data_schema,
            errors=errors or {},
            last_step=last_step,
            description_placeholders=description_placeholders,
        )

    async def _handle_back(self, user_input: dict[str, Any]) -> dict | None:
        """If user toggled _go_back, navigate to previous step. Returns None if not going back."""
        if not user_input.pop("_go_back", False):
            return None
        if len(self._step_history) >= 2:
            self._step_history.pop()  # remove current step
            prev = self._step_history.pop()  # pop previous (it will re-push itself via _show_step)
            handler = getattr(self, f"async_step_{prev}", None)
            if handler:
                return await handler()
        return None

    def _validate_numeric_sensor(self, eid: str) -> bool:
        st = self.hass.states.get(eid)
        if st is None or st.state in ("unknown", "unavailable"):
            return False
        try:
            float(st.state)
            return True
        except (ValueError, TypeError):
            return False

    # ------------------------------------------------------------------
    # Step 1: Name & prefix
    # ------------------------------------------------------------------
    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            self._data[CONF_NAME] = str(user_input.get(CONF_NAME) or DEFAULT_NAME)
            self._data[CONF_PREFIX] = _sanitize_prefix(str(user_input.get(CONF_PREFIX) or DEFAULT_PREFIX))
            return await self.async_step_required_sources()

        return self._show_step(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
                    vol.Required(CONF_PREFIX, default=DEFAULT_PREFIX): str,
                }
            ),
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 2: Required sensor mapping
    # ------------------------------------------------------------------
    async def async_step_required_sources(self, user_input: dict[str, Any] | None = None):
        defaults = _guess_defaults(self.hass)
        errors: dict[str, str] = {}

        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            for k in REQUIRED_SOURCES:
                eid = user_input.get(k)
                if not eid:
                    errors[k] = "required"
                elif self.hass.states.get(eid) is None:
                    errors[k] = "entity_not_found"
                elif not self._validate_numeric_sensor(eid):
                    errors[k] = "not_numeric"
            if not errors:
                sources = {k: user_input[k] for k in REQUIRED_SOURCES}
                self._data[CONF_SOURCES] = sources
                return await self.async_step_optional_sources()

        fields = {
            vol.Required(k, default=defaults.get(k)): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            )
            for k in REQUIRED_SOURCES
        }
        return self._show_step(
            step_id="required_sources",
            data_schema=vol.Schema(fields),
            errors=errors,
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 3: Optional sensor mapping
    # ------------------------------------------------------------------
    async def async_step_optional_sources(self, user_input: dict[str, Any] | None = None):
        defaults = _guess_defaults(self.hass)
        errors: dict[str, str] = {}

        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            sources = dict(self._data.get(CONF_SOURCES, {}))
            for k in OPTIONAL_SOURCES:
                eid = user_input.get(k)
                if not eid:
                    continue
                if self.hass.states.get(eid) is None:
                    errors[k] = "entity_not_found"
                elif not self._validate_numeric_sensor(eid):
                    errors[k] = "not_numeric"
                else:
                    sources[k] = eid
            if not errors:
                self._data[CONF_SOURCES] = sources
                return await self.async_step_location()

        entity_sel = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))
        # fmt: off
        fields = {
            (vol.Optional(k, default=defaults[k]) if k in defaults else vol.Optional(k)): entity_sel
            for k in OPTIONAL_SOURCES
        }
        # fmt: on
        return self._show_step(
            step_id="optional_sources",
            data_schema=vol.Schema(fields),
            errors=errors,
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 4: Location — hemisphere, climate region, elevation
    # ------------------------------------------------------------------
    async def async_step_location(self, user_input: dict[str, Any] | None = None):
        errors: dict[str, str] = {}

        auto_elev = _auto_detect_elevation(self.hass)
        auto_hemi = _guess_hemisphere(self.hass)
        auto_region = _guess_climate_region(self.hass)

        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            elev = float(user_input.get(CONF_ELEVATION_M, auto_elev))
            if not (VALID_ELEVATION_MIN_M <= elev <= VALID_ELEVATION_MAX_M):
                errors[CONF_ELEVATION_M] = "elevation_out_of_range"

            if not errors:
                self._data[CONF_HEMISPHERE] = user_input[CONF_HEMISPHERE]
                self._data[CONF_CLIMATE_REGION] = user_input[CONF_CLIMATE_REGION]
                self._data[CONF_ELEVATION_M] = elev
                return await self.async_step_display()

        return self._show_step(
            step_id="location",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HEMISPHERE, default=auto_hemi): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=HEMISPHERE_OPTIONS,
                            mode="list",
                            translation_key="hemisphere",
                        )
                    ),
                    vol.Required(CONF_CLIMATE_REGION, default=auto_region): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=CLIMATE_REGION_OPTIONS,
                            mode="dropdown",
                            translation_key="climate_region",
                        )
                    ),
                    vol.Optional(CONF_ELEVATION_M, default=auto_elev): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=VALID_ELEVATION_MIN_M,
                            max=VALID_ELEVATION_MAX_M,
                            step=1,
                            mode="box",
                            unit_of_measurement="m",
                        )
                    ),
                }
            ),
            errors=errors,
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 5: Display units
    # ------------------------------------------------------------------
    async def async_step_display(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data[CONF_UNITS_MODE] = user_input[CONF_UNITS_MODE]
            self._data[CONF_TEMP_UNIT] = user_input[CONF_TEMP_UNIT]
            return await self.async_step_forecast()

        # Guess sensible defaults from HA unit system
        try:
            is_metric = self.hass.config.units.temperature_unit == "°C"
            default_units = "metric" if is_metric else "imperial"
            default_temp = "C" if is_metric else "F"
        except Exception:
            default_units = DEFAULT_UNITS_MODE
            default_temp = DEFAULT_TEMP_UNIT

        return self._show_step(
            step_id="display",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_UNITS_MODE, default=default_units): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                {"value": "auto", "label": "Auto (follow Home Assistant)"},
                                {"value": "metric", "label": "Metric (km/h, mm, hPa)"},
                                {"value": "imperial", "label": "Imperial (mph, in, inHg)"},
                            ],
                            mode="list",
                        )
                    ),
                    vol.Required(CONF_TEMP_UNIT, default=default_temp): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                {"value": "auto", "label": "Auto (follow Home Assistant)"},
                                {"value": "C", "label": "Celsius (°C)"},
                                {"value": "F", "label": "Fahrenheit (°F)"},
                            ],
                            mode="list",
                        )
                    ),
                }
            ),
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 6: Forecast
    # ------------------------------------------------------------------
    async def async_step_forecast(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data.update(user_input)
            if user_input.get(CONF_FORECAST_PROVIDER) in PROVIDERS_REQUIRING_API_KEY:
                return await self.async_step_forecast_api_key()
            return await self.async_step_features()

        default_lat = getattr(self.hass.config, "latitude", 0.0) or 0.0
        default_lon = getattr(self.hass.config, "longitude", 0.0) or 0.0

        return self._show_step(
            step_id="forecast",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_FORECAST_ENABLED, default=DEFAULT_FORECAST_ENABLED): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_FORECAST_INTERVAL_MIN, default=DEFAULT_FORECAST_INTERVAL_MIN
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=10, max=180, step=5, mode="box", unit_of_measurement="min")
                    ),
                    vol.Optional(CONF_FORECAST_LAT, default=round(default_lat, 4)): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-90, max=90, step=0.001, mode="box")
                    ),
                    vol.Optional(CONF_FORECAST_LON, default=round(default_lon, 4)): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-180, max=180, step=0.001, mode="box")
                    ),
                    vol.Optional(CONF_FORECAST_PROVIDER, default=DEFAULT_FORECAST_PROVIDER): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=[
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_OPEN_METEO, label="Open-Meteo (free, no key)"
                                ),
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_MET_NO, label="Met.no (free, no key)"
                                ),
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_NWS, label="NWS/NOAA (free, no key, US only)"
                                ),
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_OWM, label="OpenWeatherMap (free tier, API key)"
                                ),
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_PIRATE, label="Pirate Weather (free tier, API key)"
                                ),
                                selector.SelectOptionDict(
                                    value=FORECAST_PROVIDER_METEO_FRANCE, label="Météo France (free tier, API key)"
                                ),
                            ],
                            mode=selector.SelectSelectorMode.LIST,
                        )
                    ),
                }
            ),
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 6b: API key for providers that require one
    # ------------------------------------------------------------------
    async def async_step_forecast_api_key(self, user_input: dict[str, Any] | None = None):
        """Step: API key for forecast providers that require one."""
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data.update(user_input)
            return await self.async_step_features()

        provider = self._data.get(CONF_FORECAST_PROVIDER, "")
        provider_labels = {
            FORECAST_PROVIDER_OWM: "OpenWeatherMap",
            FORECAST_PROVIDER_PIRATE: "Pirate Weather",
            FORECAST_PROVIDER_METEO_FRANCE: "Météo France",
        }
        provider_name = provider_labels.get(provider, provider)

        return self._show_step(
            step_id="forecast_api_key",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_FORECAST_API_KEY,
                        default=self._data.get(CONF_FORECAST_API_KEY, ""),
                    ): selector.TextSelector(selector.TextSelectorConfig(type=selector.TextSelectorType.PASSWORD)),
                    vol.Optional("_go_back", default=False): selector.BooleanSelector(),
                }
            ),
            description_placeholders={"provider_name": provider_name},
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 7: Features (toggle advanced sensor groups)
    # ------------------------------------------------------------------
    async def async_step_features(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data[CONF_ENABLE_ZAMBRETTI] = True  # always enabled (non-disableable)
            self._data[CONF_ENABLE_DISPLAY_SENSORS] = bool(user_input.get(CONF_ENABLE_DISPLAY_SENSORS, True))
            # v0.3.0: removed laundry/stargazing/running/degree_days/metar/cwop/export toggles
            self._data[CONF_ENABLE_FIRE_RISK] = bool(user_input.get(CONF_ENABLE_FIRE_RISK, False))
            self._data[CONF_ENABLE_FOG] = bool(user_input.get(CONF_ENABLE_FOG, False))
            self._data[CONF_ENABLE_THUNDERSTORM] = bool(user_input.get(CONF_ENABLE_THUNDERSTORM, False))
            self._data[CONF_ENABLE_SEA_TEMP] = bool(user_input.get(CONF_ENABLE_SEA_TEMP, False))
            self._data[CONF_ENABLE_WUNDERGROUND] = bool(user_input.get(CONF_ENABLE_WUNDERGROUND, False))
            self._data[CONF_ENABLE_AIR_QUALITY] = bool(user_input.get(CONF_ENABLE_AIR_QUALITY, False))
            self._data[CONF_ENABLE_POLLEN] = bool(user_input.get(CONF_ENABLE_POLLEN, False))
            self._data[CONF_ENABLE_MOON] = bool(user_input.get(CONF_ENABLE_MOON, False))
            self._data[CONF_ENABLE_SOLAR_FORECAST] = bool(user_input.get(CONF_ENABLE_SOLAR_FORECAST, False))
            self._data[CONF_ENABLE_COMFORT_INDICES] = bool(
                user_input.get(CONF_ENABLE_COMFORT_INDICES, DEFAULT_ENABLE_COMFORT_INDICES)
            )
            self._data[CONF_ENABLE_VIGILANCE_METEO] = bool(user_input.get(CONF_ENABLE_VIGILANCE_METEO, False))
            self._data[CONF_ENABLE_VIGICRUES] = bool(user_input.get(CONF_ENABLE_VIGICRUES, False))
            self._data[CONF_ENABLE_DIAGNOSTICS] = bool(user_input.get(CONF_ENABLE_DIAGNOSTICS, False))
            self._data[CONF_ENABLE_FWI_COMPONENTS] = bool(user_input.get(CONF_ENABLE_FWI_COMPONENTS, False))
            self._data[CONF_ENABLE_ADVANCED_SENSORS] = bool(user_input.get(CONF_ENABLE_ADVANCED_SENSORS, False))
            if self._data[CONF_ENABLE_SEA_TEMP]:
                return await self.async_step_sea_temp()
            if self._data[CONF_ENABLE_WUNDERGROUND]:
                return await self.async_step_wunderground()
            if self._data[CONF_ENABLE_AIR_QUALITY]:
                return await self.async_step_air_quality()
            if self._data[CONF_ENABLE_POLLEN]:
                return await self.async_step_pollen()
            if self._data[CONF_ENABLE_SOLAR_FORECAST]:
                return await self.async_step_solar_forecast()
            return await self.async_step_alerts()

        return self._show_step(
            step_id="features",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_ENABLE_DISPLAY_SENSORS, default=DEFAULT_ENABLE_DISPLAY_SENSORS
                    ): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_FIRE_RISK, default=DEFAULT_ENABLE_FIRE_RISK): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_FOG, default=DEFAULT_ENABLE_FOG): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_THUNDERSTORM, default=DEFAULT_ENABLE_THUNDERSTORM
                    ): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_SEA_TEMP, default=DEFAULT_ENABLE_SEA_TEMP): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_WUNDERGROUND, default=DEFAULT_ENABLE_WUNDERGROUND
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_AIR_QUALITY, default=DEFAULT_ENABLE_AIR_QUALITY
                    ): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_POLLEN, default=DEFAULT_ENABLE_POLLEN): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_MOON, default=DEFAULT_ENABLE_MOON): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_SOLAR_FORECAST, default=DEFAULT_ENABLE_SOLAR_FORECAST
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_COMFORT_INDICES, default=DEFAULT_ENABLE_COMFORT_INDICES
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_VIGILANCE_METEO, default=DEFAULT_ENABLE_VIGILANCE_METEO
                    ): selector.BooleanSelector(),
                    vol.Optional(CONF_ENABLE_VIGICRUES, default=DEFAULT_ENABLE_VIGICRUES): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_DIAGNOSTICS, default=DEFAULT_ENABLE_DIAGNOSTICS
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_FWI_COMPONENTS, default=DEFAULT_ENABLE_FWI_COMPONENTS
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_ADVANCED_SENSORS, default=DEFAULT_ENABLE_ADVANCED_SENSORS
                    ): selector.BooleanSelector(),
                }
            ),
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 7b: Sea temperature location (only shown if sea temp enabled)
    # ------------------------------------------------------------------
    async def async_step_sea_temp(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data[CONF_SEA_TEMP_LAT] = user_input.get(CONF_SEA_TEMP_LAT)
            self._data[CONF_SEA_TEMP_LON] = user_input.get(CONF_SEA_TEMP_LON)
            if self._data.get(CONF_ENABLE_WUNDERGROUND):
                return await self.async_step_wunderground()
            if self._data.get(CONF_ENABLE_AIR_QUALITY):
                return await self.async_step_air_quality()
            if self._data.get(CONF_ENABLE_POLLEN):
                return await self.async_step_pollen()
            if self._data.get(CONF_ENABLE_SOLAR_FORECAST):
                return await self.async_step_solar_forecast()
            return await self.async_step_alerts()

        default_lat = getattr(self.hass.config, "latitude", 0.0) or 0.0
        default_lon = getattr(self.hass.config, "longitude", 0.0) or 0.0

        return self._show_step(
            step_id="sea_temp",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_SEA_TEMP_LAT, default=round(default_lat, 4)): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-90, max=90, step=0.001, mode="box")
                    ),
                    vol.Optional(CONF_SEA_TEMP_LON, default=round(default_lon, 4)): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-180, max=180, step=0.001, mode="box")
                    ),
                }
            ),
            last_step=False,
        )

    # ------------------------------------------------------------------
    # Step 7c: Degree days configuration  (v0.5.0)
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Step 7d: METAR station configuration  (v0.5.0)
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Step 7e: CWOP upload configuration  (v0.6.0)
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Step 7f: Weather Underground configuration  (v0.6.0)
    # ------------------------------------------------------------------
    async def async_step_wunderground(self, user_input: dict[str, Any] | None = None):
        errors: dict[str, str] = {}
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            station_id = str(user_input.get(CONF_WU_STATION_ID, "")).strip()
            api_key = str(user_input.get(CONF_WU_API_KEY, "")).strip()
            if not station_id or not api_key:
                # Missing credentials — silently disable WU and skip
                self._data[CONF_ENABLE_WUNDERGROUND] = False
                self._data[CONF_WU_STATION_ID] = ""
                self._data[CONF_WU_API_KEY] = ""
            else:
                # Validate credentials
                valid, err = await _validate_wu_credentials(station_id, api_key)
                if not valid:
                    errors[CONF_WU_API_KEY] = err or "invalid_api_key"
                else:
                    self._data[CONF_WU_STATION_ID] = station_id
                    self._data[CONF_WU_API_KEY] = api_key
                    self._data[CONF_WU_INTERVAL_MIN] = int(
                        user_input.get(CONF_WU_INTERVAL_MIN, DEFAULT_WU_INTERVAL_MIN)
                    )
            if not errors:
                if self._data.get(CONF_ENABLE_AIR_QUALITY):
                    return await self.async_step_air_quality()
                if self._data.get(CONF_ENABLE_POLLEN):
                    return await self.async_step_pollen()
                if self._data.get(CONF_ENABLE_SOLAR_FORECAST):
                    return await self.async_step_solar_forecast()
                return await self.async_step_alerts()

        existing_station = self._data.get(CONF_WU_STATION_ID, "")
        return self._show_step(
            step_id="wunderground",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_WU_STATION_ID, default=existing_station): selector.TextSelector(
                        selector.TextSelectorConfig(type="text")
                    ),
                    vol.Optional(CONF_WU_API_KEY, default=""): selector.TextSelector(
                        selector.TextSelectorConfig(type="password")
                    ),
                    vol.Optional(CONF_WU_INTERVAL_MIN, default=DEFAULT_WU_INTERVAL_MIN): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=1, max=30, step=1, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            errors=errors,
            description_placeholders={
                "info": "Weather Underground PWS. Leave blank to skip. Credentials will be validated."
            },
            last_step=False,
        )

    # ------------------------------------------------------------------
    # v0.7.0 — Air Quality (Open-Meteo, free, no API key)
    # ------------------------------------------------------------------
    async def async_step_air_quality(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data[CONF_AQI_INTERVAL_MIN] = int(user_input.get(CONF_AQI_INTERVAL_MIN, DEFAULT_AQI_INTERVAL_MIN))
            if self._data.get(CONF_ENABLE_POLLEN):
                return await self.async_step_pollen()
            if self._data.get(CONF_ENABLE_SOLAR_FORECAST):
                return await self.async_step_solar_forecast()
            return await self.async_step_alerts()

        return self._show_step(
            step_id="air_quality",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_AQI_INTERVAL_MIN, default=DEFAULT_AQI_INTERVAL_MIN): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=15, max=360, step=15, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            description_placeholders={
                "info": "Air quality data (PM2.5, PM10, NO₂, ozone) from Open-Meteo. Free, no API key required. Uses forecast lat/lon."
            },
            last_step=False,
        )

    # ------------------------------------------------------------------
    # v0.7.0 — Pollen (Open-Meteo, free, no API key)
    # ------------------------------------------------------------------
    async def async_step_pollen(self, user_input: dict[str, Any] | None = None):
        """Pollen confirmation step.

        v0.3.0: pollen now comes from Open-Meteo Air Quality API (free, no key).
        It piggybacks on the AQI fetch — no separate API call needed.
        """
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            if self._data.get(CONF_ENABLE_SOLAR_FORECAST):
                return await self.async_step_solar_forecast()
            return await self.async_step_alerts()

        return self._show_step(
            step_id="pollen",
            data_schema=vol.Schema({}),
            description_placeholders={
                "info": (
                    "Pollen data is fetched from Open-Meteo Air Quality API "
                    "(free, no key). Includes alder, birch, grass, mugwort, "
                    "olive, and ragweed. Updates piggyback on the AQI fetch."
                )
            },
            last_step=False,
        )

    # ------------------------------------------------------------------
    # v0.9.0 — Solar forecast (forecast.solar, free, no key)
    # ------------------------------------------------------------------
    async def async_step_solar_forecast(self, user_input: dict[str, Any] | None = None):
        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            self._data[CONF_SOLAR_PEAK_KW] = float(user_input.get(CONF_SOLAR_PEAK_KW, DEFAULT_SOLAR_PEAK_KW))
            self._data[CONF_SOLAR_PANEL_AZIMUTH] = int(
                user_input.get(CONF_SOLAR_PANEL_AZIMUTH, DEFAULT_SOLAR_PANEL_AZIMUTH)
            )
            self._data[CONF_SOLAR_PANEL_TILT] = int(user_input.get(CONF_SOLAR_PANEL_TILT, DEFAULT_SOLAR_PANEL_TILT))
            self._data[CONF_SOLAR_INTERVAL_MIN] = int(
                user_input.get(CONF_SOLAR_INTERVAL_MIN, DEFAULT_SOLAR_INTERVAL_MIN)
            )
            return await self.async_step_alerts()

        return self._show_step(
            step_id="solar_forecast",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_SOLAR_PEAK_KW, default=DEFAULT_SOLAR_PEAK_KW): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=0.1,
                            max=100.0,
                            step=0.1,
                            mode="box",
                            unit_of_measurement="kWp",
                        )
                    ),
                    vol.Optional(
                        CONF_SOLAR_PANEL_AZIMUTH, default=DEFAULT_SOLAR_PANEL_AZIMUTH
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=359, step=1, mode="box", unit_of_measurement="°")
                    ),
                    vol.Optional(CONF_SOLAR_PANEL_TILT, default=DEFAULT_SOLAR_PANEL_TILT): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=90, step=1, mode="box", unit_of_measurement="°")
                    ),
                    vol.Optional(CONF_SOLAR_INTERVAL_MIN, default=DEFAULT_SOLAR_INTERVAL_MIN): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=30, max=360, step=30, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            description_placeholders={
                "info": "Free solar PV generation forecast from forecast.solar. Uses forecast lat/lon. Azimuth: 0=N, 90=E, 180=S, 270=W."
            },
            last_step=False,
        )

    # ------------------------------------------------------------------
    async def async_step_alerts(self, user_input: dict[str, Any] | None = None):
        units_mode = str(self._data.get(CONF_UNITS_MODE, DEFAULT_UNITS_MODE))
        imperial = _is_imperial(units_mode, self.hass)
        gust_u = "mph" if imperial else "m/s"
        rain_u = "in/h" if imperial else "mm/h"
        temp_u = "°F" if imperial else "°C"

        if user_input is not None:
            back = await self._handle_back(user_input)
            if back:
                return back
            errors = self._validate_alert_inputs(user_input, imperial)
            if not errors:
                self._data[CONF_THRESH_WIND_GUST_MS] = _convert_gust_to_ms(
                    float(user_input[CONF_THRESH_WIND_GUST_MS]), imperial
                )
                self._data[CONF_THRESH_RAIN_RATE_MMPH] = _convert_rain_to_mmph(
                    float(user_input[CONF_THRESH_RAIN_RATE_MMPH]), imperial
                )
                self._data[CONF_THRESH_FREEZE_C] = _convert_temp_to_c(float(user_input[CONF_THRESH_FREEZE_C]), imperial)
                self._data[CONF_RAIN_FILTER_ALPHA] = float(user_input[CONF_RAIN_FILTER_ALPHA])
                self._data[CONF_PRESSURE_TREND_WINDOW_H] = int(user_input[CONF_PRESSURE_TREND_WINDOW_H])
                self._data[CONF_STALENESS_S] = int(user_input[CONF_STALENESS_S])

                title = self._data.get(CONF_NAME, DEFAULT_NAME)
                return self.async_create_entry(title=title, data=self._data)

        gust_max = round(_convert_gust_to_display(VALID_WIND_GUST_MAX_MS, imperial), 1)

        return self._show_step(
            step_id="alerts",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_THRESH_WIND_GUST_MS,
                        default=round(_convert_gust_to_display(DEFAULT_THRESH_WIND_GUST_MS, imperial), 1),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=0,
                            max=gust_max,
                            step=0.1,
                            mode="box",
                            unit_of_measurement=gust_u,
                        )
                    ),
                    vol.Optional(
                        CONF_THRESH_RAIN_RATE_MMPH,
                        default=round(_convert_rain_to_display(DEFAULT_THRESH_RAIN_RATE_MMPH, imperial), 2),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=200, step=0.5, mode="box", unit_of_measurement=rain_u)
                    ),
                    vol.Optional(
                        CONF_THRESH_FREEZE_C,
                        default=round(_convert_temp_to_display(DEFAULT_THRESH_FREEZE_C, imperial), 1),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-30, max=10, step=0.5, mode="box", unit_of_measurement=temp_u)
                    ),
                    vol.Optional(CONF_STALENESS_S, default=DEFAULT_STALENESS_S): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=60, max=86400, step=60, mode="box", unit_of_measurement="s")
                    ),
                    vol.Optional(CONF_RAIN_FILTER_ALPHA, default=DEFAULT_RAIN_FILTER_ALPHA): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0.05, max=1.0, step=0.05, mode="slider")
                    ),
                    vol.Optional(
                        CONF_PRESSURE_TREND_WINDOW_H, default=DEFAULT_PRESSURE_TREND_WINDOW_H
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=1, max=12, step=1, mode="box", unit_of_measurement="h")
                    ),
                }
            ),
            last_step=True,
        )

    @staticmethod
    def _validate_alert_inputs(user_input: dict, imperial: bool) -> dict[str, str]:
        errors: dict[str, str] = {}
        gust_ms = _convert_gust_to_ms(float(user_input.get(CONF_THRESH_WIND_GUST_MS, 0)), imperial)
        if gust_ms > VALID_WIND_GUST_MAX_MS:
            errors[CONF_THRESH_WIND_GUST_MS] = "wind_gust_too_high"
        freeze_c = _convert_temp_to_c(float(user_input.get(CONF_THRESH_FREEZE_C, 0)), imperial)
        if not (VALID_TEMP_MIN_C <= freeze_c <= VALID_TEMP_MAX_C):
            errors[CONF_THRESH_FREEZE_C] = "temp_out_of_range"
        return errors


# ---------------------------------------------------------------------------
# Options Flow (Configure button post-install)
# ---------------------------------------------------------------------------


class WSStationOptionsFlowHandler(config_entries.OptionsFlow):
    """Multi-step options flow — mirrors the config flow so every setting is accessible post-install."""

    def _get(self, key: str, default: Any) -> Any:
        return self.config_entry.options.get(key, self.config_entry.data.get(key, default))

    # ------------------------------------------------------------------
    # Step 1: Core — identity, location, units, forecast, calibration, alerts
    # ------------------------------------------------------------------
    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        units_mode = str(self._get(CONF_UNITS_MODE, DEFAULT_UNITS_MODE))
        imperial = _is_imperial(units_mode, self.hass)
        gust_u = "mph" if imperial else "m/s"
        rain_u = "in/h" if imperial else "mm/h"
        temp_u = "°F" if imperial else "°C"

        if user_input is not None:
            out = dict(user_input)
            if CONF_PREFIX in out:
                out[CONF_PREFIX] = _sanitize_prefix(str(out[CONF_PREFIX]))
            try:
                elev = float(out.get(CONF_ELEVATION_M, 0))
                if not (VALID_ELEVATION_MIN_M <= elev <= VALID_ELEVATION_MAX_M):
                    return self.async_show_form(
                        step_id="init",
                        data_schema=self._build_core_schema(imperial, gust_u, rain_u, temp_u),
                        errors={CONF_ELEVATION_M: "elevation_out_of_range"},
                        last_step=False,
                    )
            except (TypeError, ValueError):
                pass
            # Convert thresholds to canonical metric
            out[CONF_THRESH_WIND_GUST_MS] = _convert_gust_to_ms(
                float(out.get(CONF_THRESH_WIND_GUST_MS, DEFAULT_THRESH_WIND_GUST_MS)), imperial
            )
            out[CONF_THRESH_RAIN_RATE_MMPH] = _convert_rain_to_mmph(
                float(out.get(CONF_THRESH_RAIN_RATE_MMPH, DEFAULT_THRESH_RAIN_RATE_MMPH)), imperial
            )
            out[CONF_THRESH_FREEZE_C] = _convert_temp_to_c(
                float(out.get(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C)), imperial
            )
            out[CONF_RAIN_PENALTY_LIGHT_MMPH] = _convert_rain_to_mmph(
                float(out.get(CONF_RAIN_PENALTY_LIGHT_MMPH, DEFAULT_RAIN_PENALTY_LIGHT_MMPH)), imperial
            )
            out[CONF_RAIN_PENALTY_HEAVY_MMPH] = _convert_rain_to_mmph(
                float(out.get(CONF_RAIN_PENALTY_HEAVY_MMPH, DEFAULT_RAIN_PENALTY_HEAVY_MMPH)), imperial
            )
            # Merge into options — features step comes next (API key step if needed)
            self._opt: dict[str, Any] = out
            if out.get(CONF_FORECAST_PROVIDER) in PROVIDERS_REQUIRING_API_KEY:
                return await self.async_step_forecast_api_key_opt()
            return await self.async_step_features_opt()

        return self.async_show_form(
            step_id="init",
            data_schema=self._build_core_schema(imperial, gust_u, rain_u, temp_u),
            last_step=False,
        )

    def _build_core_schema(self, imperial: bool, gust_u: str, rain_u: str, temp_u: str) -> vol.Schema:
        g = self._get
        default_lat = getattr(self.hass.config, "latitude", 0.0) or 0.0
        default_lon = getattr(self.hass.config, "longitude", 0.0) or 0.0
        cur_gust_ms = float(g(CONF_THRESH_WIND_GUST_MS, DEFAULT_THRESH_WIND_GUST_MS))
        cur_rain_mmph = float(g(CONF_THRESH_RAIN_RATE_MMPH, DEFAULT_THRESH_RAIN_RATE_MMPH))
        cur_freeze_c = float(g(CONF_THRESH_FREEZE_C, DEFAULT_THRESH_FREEZE_C))
        return vol.Schema(
            {
                vol.Optional(CONF_PREFIX, default=g(CONF_PREFIX, DEFAULT_PREFIX)): str,
                vol.Optional(CONF_HEMISPHERE, default=g(CONF_HEMISPHERE, DEFAULT_HEMISPHERE)): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=HEMISPHERE_OPTIONS, mode="list")
                ),
                vol.Optional(
                    CONF_CLIMATE_REGION, default=g(CONF_CLIMATE_REGION, DEFAULT_CLIMATE_REGION)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=CLIMATE_REGION_OPTIONS, mode="dropdown")
                ),
                vol.Optional(
                    CONF_ELEVATION_M, default=g(CONF_ELEVATION_M, DEFAULT_ELEVATION_M)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=VALID_ELEVATION_MIN_M,
                        max=VALID_ELEVATION_MAX_M,
                        step=1,
                        mode="box",
                        unit_of_measurement="m",
                    )
                ),
                vol.Optional(CONF_UNITS_MODE, default=g(CONF_UNITS_MODE, DEFAULT_UNITS_MODE)): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=UNITS_MODE_OPTIONS, mode="dropdown")
                ),
                vol.Optional(CONF_TEMP_UNIT, default=g(CONF_TEMP_UNIT, DEFAULT_TEMP_UNIT)): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=TEMP_UNIT_OPTIONS, mode="list")
                ),
                vol.Optional(
                    CONF_FORECAST_ENABLED, default=g(CONF_FORECAST_ENABLED, DEFAULT_FORECAST_ENABLED)
                ): selector.BooleanSelector(),
                vol.Optional(
                    CONF_FORECAST_INTERVAL_MIN, default=g(CONF_FORECAST_INTERVAL_MIN, DEFAULT_FORECAST_INTERVAL_MIN)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=10, max=180, step=5, mode="box", unit_of_measurement="min")
                ),
                vol.Optional(
                    CONF_FORECAST_LAT, default=g(CONF_FORECAST_LAT, round(default_lat, 4))
                ): selector.NumberSelector(selector.NumberSelectorConfig(min=-90, max=90, step=0.001, mode="box")),
                vol.Optional(
                    CONF_FORECAST_LON, default=g(CONF_FORECAST_LON, round(default_lon, 4))
                ): selector.NumberSelector(selector.NumberSelectorConfig(min=-180, max=180, step=0.001, mode="box")),
                vol.Optional(
                    CONF_FORECAST_PROVIDER, default=g(CONF_FORECAST_PROVIDER, DEFAULT_FORECAST_PROVIDER)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=FORECAST_PROVIDER_OPEN_METEO, label="Open-Meteo (free, no key)"
                            ),
                            selector.SelectOptionDict(value=FORECAST_PROVIDER_MET_NO, label="Met.no (free, no key)"),
                            selector.SelectOptionDict(
                                value=FORECAST_PROVIDER_NWS, label="NWS/NOAA (free, no key, US only)"
                            ),
                            selector.SelectOptionDict(
                                value=FORECAST_PROVIDER_OWM, label="OpenWeatherMap (free tier, API key)"
                            ),
                            selector.SelectOptionDict(
                                value=FORECAST_PROVIDER_PIRATE, label="Pirate Weather (free tier, API key)"
                            ),
                            selector.SelectOptionDict(
                                value=FORECAST_PROVIDER_METEO_FRANCE, label="Météo France (free tier, API key)"
                            ),
                        ],
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
                vol.Optional(
                    CONF_THRESH_WIND_GUST_MS, default=round(_convert_gust_to_display(cur_gust_ms, imperial), 1)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=0, max=120, step=0.1, mode="box", unit_of_measurement=gust_u)
                ),
                vol.Optional(
                    CONF_THRESH_RAIN_RATE_MMPH, default=round(_convert_rain_to_display(cur_rain_mmph, imperial), 2)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=0, max=200, step=0.5, mode="box", unit_of_measurement=rain_u)
                ),
                vol.Optional(
                    CONF_THRESH_FREEZE_C, default=round(_convert_temp_to_display(cur_freeze_c, imperial), 1)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=-30, max=10, step=0.5, mode="box", unit_of_measurement=temp_u)
                ),
                vol.Optional(
                    CONF_STALENESS_S, default=g(CONF_STALENESS_S, DEFAULT_STALENESS_S)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=60, max=86400, step=60, mode="box", unit_of_measurement="s")
                ),
                vol.Optional(
                    CONF_RAIN_FILTER_ALPHA, default=g(CONF_RAIN_FILTER_ALPHA, DEFAULT_RAIN_FILTER_ALPHA)
                ): selector.NumberSelector(selector.NumberSelectorConfig(min=0.05, max=1.0, step=0.05, mode="slider")),
                vol.Optional(
                    CONF_PRESSURE_TREND_WINDOW_H,
                    default=g(CONF_PRESSURE_TREND_WINDOW_H, DEFAULT_PRESSURE_TREND_WINDOW_H),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=1, max=12, step=1, mode="box", unit_of_measurement="h")
                ),
                vol.Optional(CONF_CAL_TEMP_C, default=g(CONF_CAL_TEMP_C, DEFAULT_CAL_TEMP_C)): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=-10, max=10, step=0.1, mode="box", unit_of_measurement="°C")
                ),
                vol.Optional(
                    CONF_CAL_HUMIDITY, default=g(CONF_CAL_HUMIDITY, DEFAULT_CAL_HUMIDITY)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=-20, max=20, step=0.5, mode="box", unit_of_measurement="%")
                ),
                vol.Optional(
                    CONF_CAL_PRESSURE_HPA, default=g(CONF_CAL_PRESSURE_HPA, DEFAULT_CAL_PRESSURE_HPA)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=-10, max=10, step=0.1, mode="box", unit_of_measurement="hPa")
                ),
                vol.Optional(
                    CONF_CAL_WIND_MS, default=g(CONF_CAL_WIND_MS, DEFAULT_CAL_WIND_MS)
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(min=-5, max=5, step=0.1, mode="box", unit_of_measurement="m/s")
                ),
            }
        )

    # ------------------------------------------------------------------
    # Step 2: Features — all feature toggles
    # ------------------------------------------------------------------
    async def async_step_features_opt(self, user_input: dict[str, Any] | None = None):
        g = self._get
        if user_input is not None:
            self._opt.update(user_input)
            # Route through sub-steps for enabled features (v0.3.0: METAR/CWOP/Export/DegreeDays removed)
            if user_input.get(CONF_ENABLE_SEA_TEMP):
                return await self.async_step_sea_temp_opt()
            if user_input.get(CONF_ENABLE_WUNDERGROUND):
                return await self.async_step_wunderground_opt()
            if user_input.get(CONF_ENABLE_AIR_QUALITY):
                return await self.async_step_air_quality_opt()
            if user_input.get(CONF_ENABLE_POLLEN):
                return await self.async_step_pollen_opt()
            if user_input.get(CONF_ENABLE_SOLAR_FORECAST):
                return await self.async_step_solar_forecast_opt()
            return self.async_create_entry(title="", data=self._opt)

        return self.async_show_form(
            step_id="features_opt",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_ENABLE_DISPLAY_SENSORS,
                        default=g(CONF_ENABLE_DISPLAY_SENSORS, DEFAULT_ENABLE_DISPLAY_SENSORS),
                    ): selector.BooleanSelector(),
                    # v0.3.0: removed laundry/stargazing/running/degree_days/metar/cwop/export
                    vol.Optional(
                        CONF_ENABLE_FIRE_RISK,
                        default=g(CONF_ENABLE_FIRE_RISK, DEFAULT_ENABLE_FIRE_RISK),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_FOG, default=g(CONF_ENABLE_FOG, DEFAULT_ENABLE_FOG)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_THUNDERSTORM,
                        default=g(CONF_ENABLE_THUNDERSTORM, DEFAULT_ENABLE_THUNDERSTORM),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_SEA_TEMP, default=g(CONF_ENABLE_SEA_TEMP, DEFAULT_ENABLE_SEA_TEMP)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_WUNDERGROUND, default=g(CONF_ENABLE_WUNDERGROUND, DEFAULT_ENABLE_WUNDERGROUND)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_AIR_QUALITY, default=g(CONF_ENABLE_AIR_QUALITY, DEFAULT_ENABLE_AIR_QUALITY)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_POLLEN, default=g(CONF_ENABLE_POLLEN, DEFAULT_ENABLE_POLLEN)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_MOON, default=g(CONF_ENABLE_MOON, DEFAULT_ENABLE_MOON)
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_SOLAR_FORECAST,
                        default=g(CONF_ENABLE_SOLAR_FORECAST, DEFAULT_ENABLE_SOLAR_FORECAST),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_COMFORT_INDICES,
                        default=g(CONF_ENABLE_COMFORT_INDICES, DEFAULT_ENABLE_COMFORT_INDICES),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_VIGILANCE_METEO,
                        default=g(CONF_ENABLE_VIGILANCE_METEO, DEFAULT_ENABLE_VIGILANCE_METEO),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_VIGICRUES,
                        default=g(CONF_ENABLE_VIGICRUES, DEFAULT_ENABLE_VIGICRUES),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_DIAGNOSTICS,
                        default=g(CONF_ENABLE_DIAGNOSTICS, DEFAULT_ENABLE_DIAGNOSTICS),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_FWI_COMPONENTS,
                        default=g(CONF_ENABLE_FWI_COMPONENTS, DEFAULT_ENABLE_FWI_COMPONENTS),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_ENABLE_ADVANCED_SENSORS,
                        default=g(CONF_ENABLE_ADVANCED_SENSORS, DEFAULT_ENABLE_ADVANCED_SENSORS),
                    ): selector.BooleanSelector(),
                }
            ),
            last_step=False,
        )

    async def async_step_forecast_api_key_opt(self, user_input: dict[str, Any] | None = None):
        """Options step: API key for providers that require one."""
        if user_input is not None:
            self._opt.update(user_input)
            return await self.async_step_features_opt()

        provider = self._opt.get(CONF_FORECAST_PROVIDER, "")
        provider_labels = {
            FORECAST_PROVIDER_OWM: "OpenWeatherMap",
            FORECAST_PROVIDER_PIRATE: "Pirate Weather",
            FORECAST_PROVIDER_METEO_FRANCE: "Météo France",
        }
        provider_name = provider_labels.get(provider, provider)
        current_key = self._opt.get(CONF_FORECAST_API_KEY, self._get(CONF_FORECAST_API_KEY, ""))

        return self.async_show_form(
            step_id="forecast_api_key_opt",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_FORECAST_API_KEY, default=current_key): selector.TextSelector(
                        selector.TextSelectorConfig(type=selector.TextSelectorType.PASSWORD)
                    ),
                }
            ),
            description_placeholders={"provider_name": provider_name},
        )

    # ------------------------------------------------------------------
    # Sub-steps for each configurable feature
    # ------------------------------------------------------------------
    def _opt_next_after(self, after: str):
        """Route to the next enabled feature sub-step or finish."""
        order = [
            (CONF_ENABLE_SEA_TEMP, "sea_temp_opt"),
            (CONF_ENABLE_WUNDERGROUND, "wunderground_opt"),
            (CONF_ENABLE_AIR_QUALITY, "air_quality_opt"),
            (CONF_ENABLE_POLLEN, "pollen_opt"),
            (CONF_ENABLE_SOLAR_FORECAST, "solar_forecast_opt"),
        ]
        past = False
        for conf_key, step_name in order:
            if step_name == after:
                past = True
                continue
            if past and self._opt.get(conf_key):
                return getattr(self, f"async_step_{step_name}")()
        return None  # signals: go to finish

    async def _finish_or_next(self, after: str):
        nxt = self._opt_next_after(after)
        if nxt is not None:
            return await nxt
        return self.async_create_entry(title="", data=self._opt)

    async def async_step_sea_temp_opt(self, user_input: dict[str, Any] | None = None):
        g = self._get
        default_lat = getattr(self.hass.config, "latitude", 0.0) or 0.0
        default_lon = getattr(self.hass.config, "longitude", 0.0) or 0.0
        if user_input is not None:
            self._opt.update(user_input)
            return await self._finish_or_next("sea_temp_opt")
        return self.async_show_form(
            step_id="sea_temp_opt",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_SEA_TEMP_LAT, default=g(CONF_SEA_TEMP_LAT, round(default_lat, 4))
                    ): selector.NumberSelector(selector.NumberSelectorConfig(min=-90, max=90, step=0.001, mode="box")),
                    vol.Optional(
                        CONF_SEA_TEMP_LON, default=g(CONF_SEA_TEMP_LON, round(default_lon, 4))
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=-180, max=180, step=0.001, mode="box")
                    ),
                }
            ),
            last_step=False,
        )

    async def async_step_wunderground_opt(self, user_input: dict[str, Any] | None = None):
        g = self._get
        errors: dict[str, str] = {}
        if user_input is not None:
            station_id = str(user_input.get(CONF_WU_STATION_ID, "")).strip()
            api_key = str(user_input.get(CONF_WU_API_KEY, "")).strip()
            if not api_key:
                api_key = g(CONF_WU_API_KEY, "")  # keep existing key if not re-entered
            if station_id and api_key:
                valid, err = await _validate_wu_credentials(station_id, api_key)
                if not valid:
                    errors[CONF_WU_API_KEY] = err or "invalid_api_key"
                else:
                    self._opt[CONF_WU_STATION_ID] = station_id
                    self._opt[CONF_WU_API_KEY] = api_key
                    self._opt[CONF_WU_INTERVAL_MIN] = int(user_input.get(CONF_WU_INTERVAL_MIN, DEFAULT_WU_INTERVAL_MIN))
            else:
                self._opt[CONF_WU_STATION_ID] = station_id
                self._opt[CONF_WU_API_KEY] = api_key
                self._opt[CONF_WU_INTERVAL_MIN] = int(user_input.get(CONF_WU_INTERVAL_MIN, DEFAULT_WU_INTERVAL_MIN))
            if not errors:
                return await self._finish_or_next("wunderground_opt")
        return self.async_show_form(
            step_id="wunderground_opt",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_WU_STATION_ID, default=g(CONF_WU_STATION_ID, "")): selector.TextSelector(
                        selector.TextSelectorConfig(type="text")
                    ),
                    vol.Optional(CONF_WU_API_KEY, default=""): selector.TextSelector(
                        selector.TextSelectorConfig(type="password")
                    ),
                    vol.Optional(
                        CONF_WU_INTERVAL_MIN, default=g(CONF_WU_INTERVAL_MIN, DEFAULT_WU_INTERVAL_MIN)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=1, max=30, step=1, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            errors=errors,
            description_placeholders={"info": "Leave API key blank to keep existing key. Will validate."},
            last_step=False,
        )

    async def async_step_air_quality_opt(self, user_input: dict[str, Any] | None = None):
        g = self._get
        if user_input is not None:
            self._opt[CONF_AQI_INTERVAL_MIN] = int(user_input.get(CONF_AQI_INTERVAL_MIN, DEFAULT_AQI_INTERVAL_MIN))
            return await self._finish_or_next("air_quality_opt")
        return self.async_show_form(
            step_id="air_quality_opt",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_AQI_INTERVAL_MIN, default=g(CONF_AQI_INTERVAL_MIN, DEFAULT_AQI_INTERVAL_MIN)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=15, max=360, step=15, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            description_placeholders={"info": "Open-Meteo Air Quality API. Free, no key required."},
            last_step=False,
        )

    async def async_step_pollen_opt(self, user_input: dict[str, Any] | None = None):
        """Pollen options confirmation. v0.3.0: data via Open-Meteo, no API key needed."""
        if user_input is not None:
            return await self._finish_or_next("pollen_opt")
        return self.async_show_form(
            step_id="pollen_opt",
            data_schema=vol.Schema({}),
            description_placeholders={
                "info": ("Pollen data via Open-Meteo Air Quality API (free, no key). Piggybacks on AQI fetch.")
            },
            last_step=False,
        )

    async def async_step_solar_forecast_opt(self, user_input: dict[str, Any] | None = None):
        g = self._get
        if user_input is not None:
            self._opt[CONF_SOLAR_PEAK_KW] = float(user_input.get(CONF_SOLAR_PEAK_KW, DEFAULT_SOLAR_PEAK_KW))
            self._opt[CONF_SOLAR_PANEL_AZIMUTH] = int(
                user_input.get(CONF_SOLAR_PANEL_AZIMUTH, DEFAULT_SOLAR_PANEL_AZIMUTH)
            )
            self._opt[CONF_SOLAR_PANEL_TILT] = int(user_input.get(CONF_SOLAR_PANEL_TILT, DEFAULT_SOLAR_PANEL_TILT))
            self._opt[CONF_SOLAR_INTERVAL_MIN] = int(
                user_input.get(CONF_SOLAR_INTERVAL_MIN, DEFAULT_SOLAR_INTERVAL_MIN)
            )
            return await self._finish_or_next("solar_forecast_opt")
        return self.async_show_form(
            step_id="solar_forecast_opt",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_SOLAR_PEAK_KW, default=g(CONF_SOLAR_PEAK_KW, DEFAULT_SOLAR_PEAK_KW)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=0.1,
                            max=100.0,
                            step=0.1,
                            mode="box",
                            unit_of_measurement="kWp",
                        )
                    ),
                    vol.Optional(
                        CONF_SOLAR_PANEL_AZIMUTH, default=g(CONF_SOLAR_PANEL_AZIMUTH, DEFAULT_SOLAR_PANEL_AZIMUTH)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=359, step=1, mode="box", unit_of_measurement="°")
                    ),
                    vol.Optional(
                        CONF_SOLAR_PANEL_TILT, default=g(CONF_SOLAR_PANEL_TILT, DEFAULT_SOLAR_PANEL_TILT)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=0, max=90, step=1, mode="box", unit_of_measurement="°")
                    ),
                    vol.Optional(
                        CONF_SOLAR_INTERVAL_MIN, default=g(CONF_SOLAR_INTERVAL_MIN, DEFAULT_SOLAR_INTERVAL_MIN)
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(min=30, max=360, step=30, mode="box", unit_of_measurement="min")
                    ),
                }
            ),
            description_placeholders={"info": "Azimuth: 0=N, 90=E, 180=S, 270=W. Tilt: degrees from horizontal."},
            last_step=False,
        )
