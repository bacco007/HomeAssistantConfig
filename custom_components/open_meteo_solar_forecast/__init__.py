"""The Open-Meteo Solar Forecast integration."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE, Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.storage import Store

from .const import (
    CONF_AZIMUTH,
    CONF_DECLINATION,
    CONF_EFFICIENCY_FACTOR,
    CONF_HORIZON_FILEPATH,
    CONF_MODULES_POWER,
    CONF_PARTIAL_SHADING,
    CONF_TRACKING,
    CONF_USE_HORIZON,
    CONF_MAX_SNOWCOVER_DEPTH_CM,
    DOMAIN,
)
from .coordinator import (
    STORAGE_VERSION,
    OpenMeteoSolarForecastDataUpdateCoordinator,
    checkHorizonFile,
    storage_key,
)

PLATFORMS = [Platform.SENSOR]


def _is_sequence(value: Any) -> bool:
    return isinstance(value, Sequence) and not isinstance(value, (str, bytes))


def _entry_value(entry: ConfigEntry, key: str) -> Any:
    """Get config value from options with fallback to entry data."""
    return entry.options.get(key, entry.data.get(key))


def _resolve_array_count(entry: ConfigEntry) -> int:
    """Determine number of arrays from all array-capable values."""
    candidates = (
        _entry_value(entry, CONF_LATITUDE),
        _entry_value(entry, CONF_LONGITUDE),
        entry.options.get(CONF_DECLINATION),
        entry.options.get(CONF_AZIMUTH),
        entry.options.get(CONF_MODULES_POWER),
        entry.options.get(CONF_EFFICIENCY_FACTOR, 1.0),
        entry.options.get(CONF_TRACKING, "none"),
        entry.options.get(CONF_USE_HORIZON, False),
        entry.options.get(CONF_PARTIAL_SHADING, False),
        entry.options.get(CONF_HORIZON_FILEPATH),
        entry.options.get(CONF_MAX_SNOWCOVER_DEPTH_CM),
    )
    lengths = [len(value) for value in candidates if _is_sequence(value)]
    if not lengths:
        return 1

    array_count = max(lengths)
    for length in lengths:
        if length not in (1, array_count):
            raise ValueError(
                "Multi-array configuration has inconsistent list lengths "
                f"({length} vs {array_count})."
            )

    return array_count


def _normalize_option(value: Any, array_count: int, default: Any) -> list[Any]:
    """Normalize scalar or sequence option to list with array_count items."""
    if value is None:
        value = default

    if _is_sequence(value):
        normalized = list(value)
        if len(normalized) == 1 and array_count > 1:
            return normalized * array_count
        if len(normalized) != array_count:
            raise ValueError(
                "Multi-array configuration has inconsistent list lengths "
                f"({len(normalized)} vs {array_count})."
            )
        return normalized

    return [value] * array_count


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Solar Forecast from a config entry."""
    default_horizon_map: tuple[tuple[float, float], ...] = ((0.0, 0.0), (360.0, 0.0))
    default_horizon_path = "/config/custom_components/open_meteo_solar_forecast/horizon.txt"

    array_count = _resolve_array_count(entry)
    use_horizon_values = _normalize_option(
        entry.options.get(CONF_USE_HORIZON, False),
        array_count,
        default=False,
    )
    horizon_paths = _normalize_option(
        entry.options.get(CONF_HORIZON_FILEPATH, default_horizon_path),
        array_count,
        default=default_horizon_path,
    )

    checked_horizon_by_path: dict[str, tuple[tuple[float, float], ...]] = {}
    horizon_maps: list[tuple[tuple[float, float], ...]] = []

    for use_horizon, horizon_path in zip(use_horizon_values, horizon_paths, strict=True):
        if not use_horizon:
            horizon_maps.append(default_horizon_map)
            continue

        if horizon_path not in checked_horizon_by_path:
            checked_map, message = await hass.async_add_executor_job(
                checkHorizonFile, horizon_path
            )
            if checked_map is None:
                raise ValueError(message)
            checked_horizon_by_path[horizon_path] = checked_map

        horizon_maps.append(checked_horizon_by_path[horizon_path])

    horizon_map: tuple[tuple[float, float], ...] | list[tuple[tuple[float, float], ...]]
    if array_count == 1:
        horizon_map = horizon_maps[0]
    else:
        horizon_map = horizon_maps

    coordinator = OpenMeteoSolarForecastDataUpdateCoordinator(
        hass, entry, horizon_map
    )
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    async def async_update_array_location(call: ServiceCall | None = None):
        new_location = call.data.get("location_override", {
                "latitude": hass.config.latitude,
                "longitude": hass.config.longitude,
        })  # Optional location override defaults to current Home Assistant location

        # Updating config entry will automatically update the coordinator
        hass.config_entries.async_update_entry(
            entry,
            data={**entry.data, CONF_LATITUDE: new_location["latitude"], CONF_LONGITUDE: new_location["longitude"]},
            options={**entry.options, CONF_LATITUDE: new_location["latitude"], CONF_LONGITUDE: new_location["longitude"]},
        )

    hass.services.async_register(DOMAIN, "update_array_location", async_update_array_location)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove the retained forecast storage for a removed config entry."""
    await Store(hass, STORAGE_VERSION, storage_key(entry.entry_id)).async_remove()


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update options."""
    await hass.config_entries.async_reload(entry.entry_id)
