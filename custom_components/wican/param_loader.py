"""Parameter loader for WiCAN integration.

Loads parameter definitions from the bundled params.json file, which is sourced from
the WiCAN firmware repository:
https://github.com/meatpiHQ/wican-fw/blob/main/.vehicle_profiles/params.json

The integration will attempt to fetch updates from GitHub on reload and update
the local cache if changes are detected.
"""

from __future__ import annotations

import asyncio
import hashlib
import inspect
import json
import logging
from pathlib import Path
import re
from typing import TYPE_CHECKING, TypedDict

if TYPE_CHECKING:
    from typing import Final

    from aiohttp import ClientSession

_LOGGER = logging.getLogger(__name__)

# GitHub raw URL for params.json
PARAMS_GITHUB_URL: Final[str] = (
    "https://raw.githubusercontent.com/meatpiHQ/wican-fw/main/.vehicle_profiles/params.json"
)

# Timeout for GitHub fetch (seconds)
GITHUB_FETCH_TIMEOUT: Final[int] = 10


class ParamSettings(TypedDict, total=False):
    """Type definition for parameter settings."""

    unit: str
    class_: str  # 'class' is reserved, use class_
    type: str  # e.g., "binary_sensor"
    min: str
    max: str


class ParamDefinition(TypedDict):
    """Type definition for a parameter."""

    description: str
    settings: ParamSettings


# Icon mappings for HA device classes (used when device_class provides icon)
DEVICE_CLASS_ICONS: Final[dict[str, str]] = {
    "temperature": "mdi:thermometer",
    "speed": "mdi:speedometer",
    "voltage": "mdi:flash",
    "current": "mdi:current-ac",
    "power": "mdi:flash",
    "pressure": "mdi:gauge",
    "distance": "mdi:ruler",
    "duration": "mdi:timer",
    "frequency": "mdi:sine-wave",
    "volume": "mdi:cup-water",
    "volume_flow_rate": "mdi:pipe",
    "battery": "mdi:battery",
    "humidity": "mdi:water-percent",
    "gas": "mdi:gas-cylinder",
    "percentage": "mdi:percent",
    "energy": "mdi:lightning-bolt",
}

# Icon mappings for specific parameter names (case-insensitive)
# Used when device_class doesn't provide an icon or isn't set
PARAM_NAME_ICONS: Final[dict[str, str]] = {
    # Engine
    "engine_rpm": "mdi:engine",
    # Fuel
    "fuel": "mdi:fuel",
    "fuel_rate": "mdi:gas-station",
    "fuel_pump_duty": "mdi:fuel",
    "fuel_sys_stat": "mdi:fuel",
    "pcm_fuel_rate": "mdi:gas-station",
    # Throttle
    "throttle": "mdi:car-cruise-control",
    # Air
    "maf": "mdi:weather-windy",
    "intake_air_tmp": "mdi:thermometer",
    "intake_air_temp_2": "mdi:thermometer",
    # Fuel trim
    "stft": "mdi:tune-vertical",
    "ltft": "mdi:tune-vertical",
    # Oil
    "oil_life": "mdi:oil",
    "pcm_oil_life": "mdi:oil",
    "engine_oil_temp": "mdi:oil-temperature",
    "engine_oil_pres": "mdi:gauge",
    "oilch_dis": "mdi:oil",
    # Battery/Voltage (12V)
    "lv_v": "mdi:car-battery",
    "alt_duty": "mdi:current-ac",
    # EV Battery/SOC
    "soc": "mdi:battery",
    "soc_d": "mdi:battery",
    "soc_max": "mdi:battery-arrow-up",
    "soc_min": "mdi:battery-arrow-down",
    "soh": "mdi:battery-heart-variant",
    "batt_capacity": "mdi:battery",
    "batt_temp": "mdi:thermometer",
    # HV Battery
    "hv_v": "mdi:battery-high",
    "hv_a": "mdi:current-dc",
    "hv_w": "mdi:flash",
    "hv_av": "mdi:battery-charging",
    "hv_capacity": "mdi:battery",
    "hv_capacity_kwh": "mdi:battery",
    "hv_capacity_r": "mdi:battery",
    "hv_c_v_max": "mdi:battery-plus-variant",
    "hv_c_v_min": "mdi:battery-minus-variant",
    "hv_c_d_max": "mdi:battery-alert",
    "hv_c_d_min": "mdi:battery-check",
    # Charging
    "charging": "mdi:battery-charging",
    "charging_dc": "mdi:ev-plug-dc-combo-1",
    "charger_connected": "mdi:ev-plug-type2",
    "charger_dc_pwr": "mdi:ev-station",
    "ac_c_c": "mdi:current-ac",
    "ac_c_v": "mdi:flash",
    "ac_p": "mdi:ev-plug-type2",
    "kwh_charged": "mdi:battery-charging-100",
    # Range
    "range": "mdi:map-marker-distance",
    "dist_since_full_charge": "mdi:map-marker-distance",
    "odometer": "mdi:counter",
    # Power
    "power_max": "mdi:flash",
    "regen_max": "mdi:battery-sync",
    # Gear/Transmission
    "gear": "mdi:car-shift-pattern",
    "pcm_gear": "mdi:car-shift-pattern",
    "drive_mode": "mdi:car-shift-pattern",
    "tran_f_temp": "mdi:thermometer",
    "pcm_transmission_temp": "mdi:thermometer",
    # Turbo/Boost
    "pcm_desired_boost": "mdi:gauge",
    "wastegate": "mdi:turbine",
    "pcm_wastegate": "mdi:turbine",
    # Tyres
    "tyre_p_fl": "mdi:car-tire-alert",
    "tyre_p_fr": "mdi:car-tire-alert",
    "tyre_p_rl": "mdi:car-tire-alert",
    "tyre_p_rr": "mdi:car-tire-alert",
    # AC
    "ac_comp": "mdi:air-conditioner",
    "t_cab": "mdi:thermometer",
    # Ready/Status
    "ready": "mdi:power",
    "park_brake": "mdi:car-brake-parking",
    # Diagnostics
    "pcm_knock_count": "mdi:alert-circle",
    # Octane
    "octane_ratio_l": "mdi:fuel",
    "pcm_learned_octane_ratio": "mdi:fuel",
}

# Default icon for unknown parameters
DEFAULT_PARAM_ICON: Final[str] = "mdi:car-info"


def _get_params_file_path() -> Path:
    """Get the path to the params.json file."""
    return Path(__file__).parent / "data" / "params.json"


def _load_params() -> dict[str, ParamDefinition]:
    """Load parameters from bundled JSON file.

    Returns:
        Dictionary mapping parameter names (uppercase) to their definitions.
    """
    params_file = _get_params_file_path()

    try:
        with params_file.open(encoding="utf-8") as f:
            data = json.load(f)
            _LOGGER.debug("Loaded %d parameters from params.json", len(data))
            return data
    except FileNotFoundError:
        _LOGGER.warning("params.json not found at %s, using empty defaults", params_file)
        return {}
    except json.JSONDecodeError:
        _LOGGER.exception("Failed to parse params.json")
        return {}


def _compute_hash(data: bytes) -> str:
    """Compute SHA256 hash of data."""
    return hashlib.sha256(data).hexdigest()


async def _async_get_current_params_hash() -> str | None:
    """Get hash of current params.json file.

    This performs file IO in a background thread to avoid blocking the event loop.
    """
    params_file = _get_params_file_path()
    try:
        content = await asyncio.to_thread(params_file.read_bytes)
        return _compute_hash(content)
    except (FileNotFoundError, OSError):
        return None


async def async_fetch_params_from_github(
    session: ClientSession,
) -> tuple[dict[str, ParamDefinition] | None, str | None]:
    """Fetch params.json from GitHub.

    Args:
        session: aiohttp ClientSession to use for the request.

    Returns:
        Tuple of (parsed params dict, content hash) or (None, None) on failure.
    """
    try:
        async with asyncio.timeout(GITHUB_FETCH_TIMEOUT):
            response = await session.get(PARAMS_GITHUB_URL)
            try:
                if response.status != 200:
                    _LOGGER.debug(
                        "Failed to fetch params.json from GitHub: HTTP %s",
                        response.status,
                    )
                    return None, None

                content = await response.read()
                content_hash = _compute_hash(content)

                try:
                    data = json.loads(content.decode("utf-8"))
                except json.JSONDecodeError as err:
                    _LOGGER.warning("Failed to parse GitHub params.json: %s", err)
                    return None, None
                else:
                    _LOGGER.debug(
                        "Fetched %d parameters from GitHub (hash: %s...)",
                        len(data),
                        content_hash[:8],
                    )
                    return data, content_hash
            finally:
                release_result = response.release()
                if inspect.isawaitable(release_result):
                    await release_result

    except TimeoutError:
        _LOGGER.debug("Timeout fetching params.json from GitHub")
        return None, None
    except Exception as err:
        _LOGGER.debug("Error fetching params.json from GitHub: %s", err)
        return None, None


async def async_update_params_from_github(session: ClientSession) -> bool:
    """Fetch params.json from GitHub and update local file if changed.

    Args:
        session: aiohttp ClientSession to use for the request.

    Returns:
        True if params were updated, False otherwise.
    """
    # Get current hash
    current_hash = await _async_get_current_params_hash()

    # Fetch from GitHub
    new_params, new_hash = await async_fetch_params_from_github(session)

    if new_params is None:
        _LOGGER.debug("Could not fetch params from GitHub, keeping current version")
        return False

    # Check if hash changed
    if current_hash and current_hash == new_hash:
        _LOGGER.debug("params.json is up to date (hash: %s...)", current_hash[:8])
        return False

    # Write updated params to file
    params_file = _get_params_file_path()
    try:
        def _write_params() -> None:
            params_file.parent.mkdir(parents=True, exist_ok=True)
            with params_file.open("w", encoding="utf-8") as f:
                json.dump(new_params, f, indent=2, ensure_ascii=False)

        await asyncio.to_thread(_write_params)

        _LOGGER.info(
            "Updated params.json from GitHub: %d parameters (hash: %s...)",
            len(new_params),
            new_hash[:8] if new_hash else "unknown",
        )

        # Update in-memory params
        _PARAMS.clear()
        _PARAMS.update(new_params)
    except OSError as err:
        _LOGGER.warning("Failed to write updated params.json: %s", err)
        return False
    else:
        return True


def reload_params() -> None:
    """Reload params from disk (useful after update)."""
    new_params = _load_params()
    _PARAMS.clear()
    _PARAMS.update(new_params)


# Mutable params dict (can be updated at runtime)
_PARAMS: dict[str, ParamDefinition] = _load_params()


# Mapping from common PID variants to canonical params.json names
# Handles formats like "0C-EngineRPM", "0c_enginerpm", "EngineRPM" → "ENGINE_RPM"
_PID_ALIASES: Final[dict[str, str]] = {
    # Engine RPM (PID 0x0C)
    "enginerpm": "ENGINE_RPM",
    "engine_rpm": "ENGINE_RPM",
    "0c-enginerpm": "ENGINE_RPM",
    "0c_enginerpm": "ENGINE_RPM",
    "rpm": "ENGINE_RPM",
    # Vehicle Speed (PID 0x0D)
    "vehiclespeed": "SPEED",
    "vehicle_speed": "SPEED",
    "0d-vehiclespeed": "SPEED",
    "0d_vehiclespeed": "SPEED",
    "speed": "SPEED",
    # Coolant Temp (PID 0x05)
    "coolanttemp": "COOLANT_TMP",
    "coolant_temp": "COOLANT_TMP",
    "enginecoolanttemp": "COOLANT_TMP",
    "engine_coolant_temp": "COOLANT_TMP",
    "05-enginecoolanttemp": "COOLANT_TMP",
    "05_enginecoolanttemp": "COOLANT_TMP",
    # Throttle Position (PID 0x11)
    "throttlepos": "THROTTLE",
    "throttle_pos": "THROTTLE",
    "throttleposition": "THROTTLE",
    "throttle_position": "THROTTLE",
    "11-throttlepos": "THROTTLE",
    "11_throttlepos": "THROTTLE",
    "11-throttleposition": "THROTTLE",
    "11_throttleposition": "THROTTLE",
    # Fuel Level (PID 0x2F)
    "fuellevel": "FUEL",
    "fuel_level": "FUEL",
    "fueltanklevel": "FUEL",
    "fuel_tank_level": "FUEL",
    "2f-fuellevel": "FUEL",
    "2f_fuellevel": "FUEL",
    "2f-fueltanklevel": "FUEL",
    "2f_fueltanklevel": "FUEL",
    # MAF (PID 0x10)
    "mafrate": "MAF",
    "maf_rate": "MAF",
    "mafairflowrate": "MAF",
    "maf_air_flow_rate": "MAF",
    "10-mafrate": "MAF",
    "10_mafrate": "MAF",
    "10-mafairflowrate": "MAF",
    "10_mafairflowrate": "MAF",
    # Intake Air Temp (PID 0x0F)
    "intakeairtemp": "INTAKE_AIR_TMP",
    "intake_air_temp": "INTAKE_AIR_TMP",
    "intakeairtemperature": "INTAKE_AIR_TMP",
    "intake_air_temperature": "INTAKE_AIR_TMP",
    "0f-intakeairtemp": "INTAKE_AIR_TMP",
    "0f_intakeairtemp": "INTAKE_AIR_TMP",
    "0f-intakeairtemperature": "INTAKE_AIR_TMP",
    "0f_intakeairtemperature": "INTAKE_AIR_TMP",
    # Fuel Pressure (PID 0x0A)
    "fuelpressure": "FUEL_PRESSURE",
    "fuel_pressure": "FUEL_PRESSURE",
    "0a-fuelpressure": "FUEL_PRESSURE",
    "0a_fuelpressure": "FUEL_PRESSURE",
    # Timing Advance (PID 0x0E)
    "timingadvance": "TIMING_ADV",
    "timing_advance": "TIMING_ADV",
    "0e-timingadvance": "TIMING_ADV",
    "0e_timingadvance": "TIMING_ADV",
    # Engine Load (PID 0x04)
    "calcengineload": "ENGINE_LOAD",
    "calc_engine_load": "ENGINE_LOAD",
    "engineload": "ENGINE_LOAD",
    "engine_load": "ENGINE_LOAD",
    "04-calcengineload": "ENGINE_LOAD",
    "04_calcengineload": "ENGINE_LOAD",
    # Barometric Pressure (PID 0x33)
    "absbaropres": "BARO_PRES",
    "abs_baro_pres": "BARO_PRES",
    "barometricpressure": "BARO_PRES",
    "barometric_pressure": "BARO_PRES",
    "33-absbaropres": "BARO_PRES",
    "33_absbaropres": "BARO_PRES",
    # Ambient Air Temp (PID 0x46)
    "ambientairtemp": "AMBIENT_TMP",
    "ambient_air_temp": "AMBIENT_TMP",
    "46-ambientairtemp": "AMBIENT_TMP",
    "46_ambientairtemp": "AMBIENT_TMP",
    # Engine Oil Temp (PID 0x5C)
    "engineoiltemp": "ENGINE_OIL_TEMP",
    "engine_oil_temp": "ENGINE_OIL_TEMP",
    "5c-engineoiltemp": "ENGINE_OIL_TEMP",
    "5c_engineoiltemp": "ENGINE_OIL_TEMP",
    # Control Module Voltage (PID 0x42)
    "controlmodulevolt": "CTRL_MOD_V",
    "control_module_volt": "CTRL_MOD_V",
    "42-controlmodulevolt": "CTRL_MOD_V",
    "42_controlmodulevolt": "CTRL_MOD_V",
    # Distance with MIL on (PID 0x21)
    "distancemilon": "DIST_MIL",
    "distance_mil_on": "DIST_MIL",
    "21-distancemilon": "DIST_MIL",
    "21_distancemilon": "DIST_MIL",
    # Odometer (PID 0xA6)
    "odometer": "ODOMETER",
    "a6-odometer": "ODOMETER",
    "a6_odometer": "ODOMETER",
}


# Valid Home Assistant sensor device classes
# Invalid classes from firmware will be filtered out
_VALID_HA_DEVICE_CLASSES: Final[set[str]] = {
    "apparent_power",
    "aqi",
    "atmospheric_pressure",
    "battery",
    "carbon_dioxide",
    "carbon_monoxide",
    "current",
    "data_rate",
    "data_size",
    "date",
    "distance",
    "duration",
    "energy",
    "energy_storage",
    "enum",
    "frequency",
    "gas",
    "humidity",
    "illuminance",
    "irradiance",
    "moisture",
    "monetary",
    "nitrogen_dioxide",
    "nitrogen_monoxide",
    "nitrous_oxide",
    "ozone",
    "ph",
    "pm1",
    "pm10",
    "pm25",
    "power",
    "power_factor",
    "precipitation",
    "precipitation_intensity",
    "pressure",
    "reactive_power",
    "signal_strength",
    "sound_pressure",
    "speed",
    "sulphur_dioxide",
    "temperature",
    "timestamp",
    "volatile_organic_compounds",
    "volatile_organic_compounds_parts",
    "voltage",
    "volume",
    "volume_flow_rate",
    "volume_storage",
    "water",
    "weight",
    "wind_speed",
}


# Device class to valid unit mappings
# Used to detect and filter mismatched class+unit combinations (like speed+rpm)
_DEVICE_CLASS_VALID_UNITS: Final[dict[str, set[str]]] = {
    "speed": {"km/h", "m/s", "mph", "kn", "ft/s"},
    "temperature": {"°c", "°f", "k", "degc", "degf"},
    "pressure": {"pa", "hpa", "kpa", "bar", "mbar", "psi", "inhg", "mmhg"},
    "voltage": {"v", "mv", "volts"},
    "current": {"a", "ma", "amps"},
    "power": {"w", "kw", "mw", "watts"},
    "energy": {"wh", "kwh", "mwh", "j", "kj", "mj", "gj"},
    "distance": {"km", "m", "cm", "mm", "mi", "yd", "in", "ft"},
    "volume": {"l", "ml", "gal", "fl. oz.", "m³", "ft³", "ccm"},
    "battery": {"%"},
    "frequency": {"hz", "khz", "mhz", "ghz"},
    "duration": {"s", "ms", "min", "h", "d", "seconds", "minutes", "hours"},
}


def is_valid_device_class(device_class: str | None) -> bool:
    """Check if a device class is valid for Home Assistant.

    Args:
        device_class: Device class string to validate.

    Returns:
        True if valid HA device class, False otherwise.
    """
    if not device_class:
        return False
    return device_class.lower() in _VALID_HA_DEVICE_CLASSES


def is_valid_class_unit_combo(device_class: str | None, unit: str | None) -> bool:
    """Check if device_class and unit combination is valid.

    Some combinations are invalid (e.g., speed + rpm) and will cause
    Home Assistant statistics issues.

    Args:
        device_class: Device class string.
        unit: Unit of measurement string.

    Returns:
        True if combination is valid or no validation rules exist.
    """
    if not device_class or not unit:
        return True

    dc_lower = device_class.lower()
    unit_lower = unit.lower()

    # If we have validation rules for this class, check the unit
    if dc_lower in _DEVICE_CLASS_VALID_UNITS:
        valid_units = _DEVICE_CLASS_VALID_UNITS[dc_lower]
        return unit_lower in valid_units

    # No rules = assume valid
    return True


def _normalize_param_name(param_name: str) -> str:
    """Normalize a PID key to match params.json naming convention.

    Handles various naming formats:
    - "ENGINE_RPM" → "ENGINE_RPM" (already canonical)
    - "0C-EngineRPM" → "ENGINE_RPM" (hex prefix with CamelCase)
    - "0c_enginerpm" → "ENGINE_RPM" (lowercase with underscores)
    - "EngineRPM" → "ENGINE_RPM" (CamelCase)

    Args:
        param_name: Raw parameter name from device.

    Returns:
        Normalized uppercase parameter name.
    """
    # First check direct uppercase match
    upper = param_name.upper()
    if upper in _PARAMS:
        return upper

    # Check alias mapping (case-insensitive)
    lower = param_name.lower()
    if lower in _PID_ALIASES:
        return _PID_ALIASES[lower]

    # Try removing hex prefix (e.g., "0C-" or "0C_")
    # Pattern: 2 hex chars followed by - or _
    if len(lower) > 3 and lower[2] in "-_":
        prefix = lower[:2]
        if all(c in "0123456789abcdef" for c in prefix):
            suffix = lower[3:]
            if suffix in _PID_ALIASES:
                return _PID_ALIASES[suffix]
            # Try without the suffix alias (convert to uppercase with underscores)
            # e.g., "enginerpm" → "ENGINE_RPM"
            # Insert underscore before uppercase letters in original (for CamelCase)
            original_suffix = param_name[3:]
            converted = re.sub(r"([a-z])([A-Z])", r"\1_\2", original_suffix).upper()
            if converted in _PARAMS:
                return converted

    # Last resort: convert CamelCase to UPPER_SNAKE_CASE
    converted = re.sub(r"([a-z])([A-Z])", r"\1_\2", param_name).upper()
    if converted in _PARAMS:
        return converted

    # Return uppercase version (may not match, but allows fallback)
    return upper


def get_param_unit(param_name: str) -> str | None:
    """Get the unit for a parameter name.

    Args:
        param_name: Parameter name (case-insensitive, supports various formats).

    Returns:
        Unit string or None if not found/empty.
    """
    # Normalize to canonical params.json name
    key = _normalize_param_name(param_name)

    if key in _PARAMS:
        unit = _PARAMS[key].get("settings", {}).get("unit", "")
        # Return None for empty/none units
        if unit and unit.lower() not in ("", "none"):
            return unit

    return None


def get_param_device_class(param_name: str) -> str | None:
    """Get the device class for a parameter name.

    Args:
        param_name: Parameter name (case-insensitive, supports various formats).

    Returns:
        Device class string or None if not found/invalid.
    """
    key = _normalize_param_name(param_name)

    if key in _PARAMS:
        device_class = _PARAMS[key].get("settings", {}).get("class", "")
        # Return None for empty/none classes
        if device_class and device_class.lower() not in ("", "none"):
            return device_class

    return None


def get_param_icon(param_name: str, device_class: str | None = None) -> str:
    """Get the icon for a parameter.

    Resolution order:
    1. Device class icon (if device_class provided and has mapping)
    2. Parameter name icon (from PARAM_NAME_ICONS, checking normalized name)
    3. Default icon

    Args:
        param_name: Parameter name (case-insensitive, supports various formats).
        device_class: Optional device class for icon lookup.

    Returns:
        MDI icon string.
    """
    # 1. Try device class icon
    if device_class:
        dc_lower = device_class.lower()
        if dc_lower in DEVICE_CLASS_ICONS:
            return DEVICE_CLASS_ICONS[dc_lower]

    # 2. Try parameter name icon (check both raw and normalized)
    name_lower = param_name.lower()
    if name_lower in PARAM_NAME_ICONS:
        return PARAM_NAME_ICONS[name_lower]

    # Also check normalized name for icon lookup
    normalized = _normalize_param_name(param_name).lower()
    if normalized in PARAM_NAME_ICONS:
        return PARAM_NAME_ICONS[normalized]

    # 3. Default icon
    return DEFAULT_PARAM_ICON


def get_param_description(param_name: str) -> str | None:
    """Get the description for a parameter name.

    Args:
        param_name: Parameter name (case-insensitive, supports various formats).

    Returns:
        Description string or None if not found.
    """
    key = _normalize_param_name(param_name)

    if key in _PARAMS:
        return _PARAMS[key].get("description")

    return None


def is_binary_sensor(param_name: str) -> bool:
    """Check if a parameter should be a binary sensor.

    Args:
        param_name: Parameter name (case-insensitive, supports various formats).

    Returns:
        True if parameter is defined as binary_sensor type.
    """
    key = _normalize_param_name(param_name)

    if key in _PARAMS:
        return _PARAMS[key].get("settings", {}).get("type") == "binary_sensor"

    return False


def get_all_params() -> dict[str, ParamDefinition]:
    """Get all loaded parameters.

    Returns:
        Dictionary of all parameter definitions.
    """
    return _PARAMS.copy()
