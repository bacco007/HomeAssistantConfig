"""Weather Station Core integration."""

from __future__ import annotations

import json
import logging
import pathlib
from typing import TYPE_CHECKING

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import (
    CONF_CAL_HUMIDITY,
    CONF_CAL_PRESSURE_HPA,
    CONF_CAL_TEMP_C,
    CONF_CAL_WIND_MS,
    CONF_CLIMATE_REGION,
    CONF_HEMISPHERE,
    CONFIG_VERSION,
    DEFAULT_CLIMATE_REGION,
    DEFAULT_HEMISPHERE,
    DEPRECATED_CONF_KEYS_V030,
    DEPRECATED_KEYS_V030,
    DOMAIN,
    PLATFORMS,
)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
_LOGGER = logging.getLogger(__name__)

if TYPE_CHECKING:
    from .coordinator import WSStationCoordinator

SERVICE_RESET_RAIN = "reset_rain_baseline"
SERVICE_RESET_LEARNING = "reset_learning_state"
SERVICE_EXPORT_LEARNING = "export_learning_state"
SERVICE_APPLY_CALIBRATION = "apply_calibration"
ATTR_ENTRY_ID = "entry_id"

SERVICE_RESET_RAIN_SCHEMA = vol.Schema({vol.Optional(ATTR_ENTRY_ID): cv.string})


async def async_migrate_entry(hass: HomeAssistant, entry) -> bool:
    """Handle config entry schema version migrations.

    v1 -> v2: Added hemisphere and climate_region fields.
    v2 -> v3 (v0.3.0): Entity registry cleanup + scrub cut config keys.
    """
    _LOGGER.info("Migrating ws_core config entry from version %s to %s", entry.version, CONFIG_VERSION)

    new_data = dict(entry.data)
    new_options = dict(entry.options)

    # ---- v1 -> v2 ----
    if entry.version < 2:
        if CONF_HEMISPHERE not in new_data:
            try:
                lat = float(hass.config.latitude)
                new_data[CONF_HEMISPHERE] = "Southern" if lat < 0 else "Northern"
            except (TypeError, ValueError):
                new_data[CONF_HEMISPHERE] = DEFAULT_HEMISPHERE
        if CONF_CLIMATE_REGION not in new_data:
            new_data[CONF_CLIMATE_REGION] = DEFAULT_CLIMATE_REGION
        _LOGGER.info(
            "Migrated to v2: hemisphere=%s, climate_region=%s", new_data[CONF_HEMISPHERE], new_data[CONF_CLIMATE_REGION]
        )

    # ---- v2 -> v3 (v0.3.0 cleanup) ----
    if entry.version < 3:
        # Remove deprecated entities from the registry so HA doesn't show
        # "stale" entities or rename surviving sensors with _2 suffixes.
        registry = er.async_get(hass)
        prefix = new_data.get("prefix", "ws")
        deprecated_uids = {f"{entry.entry_id}_{key}" for key in DEPRECATED_KEYS_V030}
        # Also accept the older unique_id format that some versions used
        # (just the bare key, no entry_id prefix)
        deprecated_uids |= set(DEPRECATED_KEYS_V030)

        removed_count = 0
        for ent in list(registry.entities.values()):
            if ent.config_entry_id != entry.entry_id:
                continue
            # Match by unique_id
            if ent.unique_id in deprecated_uids:
                _LOGGER.info(
                    "v0.3.0 migration: removing deprecated entity %s (unique_id=%s)", ent.entity_id, ent.unique_id
                )
                registry.async_remove(ent.entity_id)
                removed_count += 1
                continue
            # Belt-and-braces: also match by entity_id slug suffix
            # (handles users who renamed the prefix between installs)
            for dep_key in DEPRECATED_KEYS_V030:
                if ent.entity_id.endswith(f"_{dep_key}") or ent.entity_id.endswith(f".{prefix}_{dep_key}"):
                    _LOGGER.info("v0.3.0 migration: removing deprecated entity %s (slug match)", ent.entity_id)
                    registry.async_remove(ent.entity_id)
                    removed_count += 1
                    break

        # Scrub cut config keys from data and options
        cut_data_count = 0
        for k in DEPRECATED_CONF_KEYS_V030:
            if k in new_data:
                del new_data[k]
                cut_data_count += 1
            if k in new_options:
                del new_options[k]
                cut_data_count += 1

        _LOGGER.info(
            "v0.3.0 migration: removed %d deprecated entities, scrubbed %d config keys", removed_count, cut_data_count
        )

    hass.config_entries.async_update_entry(
        entry,
        data=new_data,
        options=new_options,
        version=CONFIG_VERSION,
    )
    return True


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    from .coordinator import WSStationCoordinator

    coordinator = WSStationCoordinator(hass, {**entry.data, "entry_id": entry.entry_id}, entry.options)
    coordinator._entry = entry
    hass.data[DOMAIN][entry.entry_id] = coordinator

    try:
        await coordinator.async_start()
    except Exception as err:
        _LOGGER.warning(
            "ws_core: async_start raised %s - entry will still be created, sensors populate on first tick", err
        )
        # Do NOT re-raise - a failed initial fetch must not block entry creation.
        # The 60s tick scheduler will retry all fetches automatically.

    # Create a device for the station.
    # Use executor_job so that the manifest.json read does not block the HA
    # event loop (HA logs "Detected blocking call to read_text" otherwise).
    dev_reg = dr.async_get(hass)
    _manifest_path = pathlib.Path(__file__).parent / "manifest.json"
    _manifest_text = await hass.async_add_executor_job(_manifest_path.read_text, "utf-8")
    _manifest = json.loads(_manifest_text)
    dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="Weather Station Core",
        model="Derived Weather Package",
        sw_version=_manifest.get("version", "unknown"),
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    # ── Service: reset_rain_baseline ──────────────────────────────────────
    async def _reset_rain(call: ServiceCall) -> None:
        entry_id = call.data.get(ATTR_ENTRY_ID)
        targets = []
        if entry_id:
            coord = hass.data[DOMAIN].get(entry_id)
            if coord:
                targets = [coord]
        else:
            targets = list(hass.data[DOMAIN].values())

        for coord in targets:
            coord.runtime.last_rain_total_mm = None
            coord.runtime.last_rain_ts = None
            coord.runtime.last_rain_rate_filt = 0.0
            coord.runtime.kalman = type(coord.runtime.kalman)(measurement_noise=coord.runtime.kalman.measurement_noise)
            await coord.async_refresh()

    if not hass.services.has_service(DOMAIN, SERVICE_RESET_RAIN):
        hass.services.async_register(DOMAIN, SERVICE_RESET_RAIN, _reset_rain, schema=SERVICE_RESET_RAIN_SCHEMA)

    # ── Learning state services ──────────────────────────────────────────
    # v0.3.0: removed apply_learned_calibration (was tied to cut METAR family)
    SERVICE_RESET_LEARNING_SCHEMA = vol.Schema(
        {
            vol.Optional(ATTR_ENTRY_ID): cv.string,
            vol.Optional("target", default="all"): vol.In(["all", "solar", "forecast", "streaks"]),
        }
    )
    SERVICE_EXPORT_LEARNING_SCHEMA = vol.Schema({vol.Optional(ATTR_ENTRY_ID): cv.string})

    def _get_targets(call: ServiceCall) -> list:
        entry_id = call.data.get(ATTR_ENTRY_ID)
        if entry_id:
            coord = hass.data[DOMAIN].get(entry_id)
            return [coord] if coord else []
        return list(hass.data[DOMAIN].values())

    async def _reset_learning(call: ServiceCall) -> None:
        from .learning_state import async_save_learning

        target = call.data.get("target", "all")
        for coord in _get_targets(call):
            ls = coord._learning_state
            # v0.3.0: removed temp_bias / pressure_bias / gdd_season targets
            if target in ("all", "solar"):
                ls.solar_lux_factor = 126.0
                ls.solar_factor_n = 0
            if target in ("all", "forecast"):
                ls.forecast_outcomes = []
                ls.blend_local = 0.5
                ls.blend_openmeteo = 0.5
            if target in ("all", "streaks"):
                ls.dry_streak_days = 0
                ls.dry_streak_last_rain_date = ""
                ls.heat_streak_days = 0
                ls.heat_streak_last_hot_date = ""
                ls.frost_streak_days = 0
                ls.frost_streak_last_frost_date = ""
            if coord._learning_store is not None:
                await async_save_learning(coord._learning_store, ls)
            _LOGGER.info("ws_core: learning state reset (target=%s)", target)

    async def _export_learning(call: ServiceCall) -> None:
        for coord in _get_targets(call):
            payload = coord._learning_state.to_dict()
            _LOGGER.info("ws_core learning state export: %s", payload)

    if not hass.services.has_service(DOMAIN, SERVICE_RESET_LEARNING):
        hass.services.async_register(
            DOMAIN, SERVICE_RESET_LEARNING, _reset_learning, schema=SERVICE_RESET_LEARNING_SCHEMA
        )
    if not hass.services.has_service(DOMAIN, SERVICE_EXPORT_LEARNING):
        hass.services.async_register(
            DOMAIN, SERVICE_EXPORT_LEARNING, _export_learning, schema=SERVICE_EXPORT_LEARNING_SCHEMA
        )

    # ── Apply calibration service ────────────────────────────────────────
    SERVICE_APPLY_CALIBRATION_SCHEMA = vol.Schema(
        {
            vol.Optional(ATTR_ENTRY_ID): cv.string,
            vol.Optional(CONF_CAL_TEMP_C): vol.Coerce(float),
            vol.Optional(CONF_CAL_HUMIDITY): vol.Coerce(float),
            vol.Optional(CONF_CAL_PRESSURE_HPA): vol.Coerce(float),
            vol.Optional(CONF_CAL_WIND_MS): vol.Coerce(float),
        }
    )

    async def _apply_calibration(call: ServiceCall) -> None:
        """Write calibration offsets into config entry options and reload."""
        entry_id = call.data.get(ATTR_ENTRY_ID)
        targets: list[ConfigEntry] = []

        if entry_id:
            entry = hass.config_entries.async_get_entry(entry_id)
            if entry and entry.domain == DOMAIN:
                targets = [entry]
        else:
            targets = [e for e in hass.config_entries.async_entries(DOMAIN)]

        offsets = {
            k: call.data[k]
            for k in (CONF_CAL_TEMP_C, CONF_CAL_HUMIDITY, CONF_CAL_PRESSURE_HPA, CONF_CAL_WIND_MS)
            if k in call.data
        }
        if not offsets:
            _LOGGER.warning("ws_core apply_calibration: no offsets provided, nothing to do")
            return

        for entry in targets:
            new_options = dict(entry.options)
            for key, val in offsets.items():
                new_options[key] = val
            # Updating the options fires the registered update listener
            # (async_update_options), which reloads the entry. Do NOT also call
            # async_reload here — that would reload twice and risk a race
            # (the anti-pattern HA flagged in the 2026.6 config-entry-listener
            # deprecation). The listener handles the single reload.
            hass.config_entries.async_update_entry(entry, options=new_options)
            _LOGGER.info(
                "ws_core: calibration applied to %s: %s",
                entry.entry_id,
                {k: v for k, v in offsets.items()},
            )

    if not hass.services.has_service(DOMAIN, SERVICE_APPLY_CALIBRATION):
        hass.services.async_register(
            DOMAIN, SERVICE_APPLY_CALIBRATION, _apply_calibration, schema=SERVICE_APPLY_CALIBRATION_SCHEMA
        )

    return True


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    coordinator: WSStationCoordinator | None = hass.data[DOMAIN].pop(entry.entry_id, None)
    if coordinator is not None:
        await coordinator.async_stop()
    return unload_ok
