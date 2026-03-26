"""H.A.C.A — Home Assistant Config Auditor v1.6.1"""
from __future__ import annotations

import asyncio

import logging
import os
import shutil
import json
from datetime import timedelta
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.helpers import device_registry as dr, config_validation as cv
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as _dt_util
from .const import (
    MODULE_9_DASHBOARD_ANALYZER,
    MODULE_10_EVENT_MONITORING,
    DEFAULT_EVENT_DEBOUNCE_SECONDS,
    MODULE_11_RECORDER_ANALYZER,
    MODULE_12_AUDIT_HISTORY,
    DOMAIN,
    NAME,
    VERSION,
    DEFAULT_SCAN_INTERVAL,
    SERVICE_SCAN_ALL,
    SERVICE_SCAN_AUTOMATIONS,
    SERVICE_SCAN_ENTITIES,
    SERVICE_GENERATE_REPORT,
    SERVICE_LIST_REPORTS,
    SERVICE_GET_REPORT_CONTENT,
    SERVICE_FIX_DEVICE_ID,
    SERVICE_PREVIEW_DEVICE_ID,
    SERVICE_FIX_MODE,
    SERVICE_PREVIEW_MODE,
    SERVICE_FIX_TEMPLATE,
    SERVICE_PREVIEW_TEMPLATE,
    SERVICE_LIST_BACKUPS,
    SERVICE_RESTORE_BACKUP,
    SERVICE_PURGE_GHOSTS,
    SERVICE_FUZZY_SUGGESTIONS,
    MODULE_4_COMPLIANCE_REPORT,
    MODULE_5_REFACTORING_ASSISTANT,
    BACKUP_DIR,
    REPORTS_DIR,
)
from .automation_analyzer import AutomationAnalyzer
from .entity_analyzer import EntityAnalyzer
from .battery_monitor import BatteryMonitor
from .dependency_mapper import DependencyMapper
from .performance_analyzer import PerformanceAnalyzer
from .security_analyzer import SecurityAnalyzer
from .dashboard_analyzer import DashboardAnalyzer
from .recorder_analyzer import RecorderAnalyzer
from .history_manager import HistoryManager
from .custom_panel import async_register_panel, async_unregister_panel, async_register_cards
from .websocket import async_register_websocket_handlers
from .conversation import async_setup_conversation, explain_issue_ai, analyze_complexity_ai
from .health_score import calculate_health_score
from .event_monitor import async_setup_event_monitor
from .repairs import async_update_repairs
from .services import async_setup_services
from .automation_optimizer import AutomationOptimizer

if MODULE_4_COMPLIANCE_REPORT:
    from .report_generator import ReportGenerator

if MODULE_5_REFACTORING_ASSISTANT:
    from .refactoring_assistant import RefactoringAssistant

# ── v1.4.0 ────────────────────────────────────────────────────────────────
from .const import (
    MODULE_15_MCP_SERVER,
    MODULE_16_PROACTIVE_AGENT,
    MODULE_17_COMPLIANCE_ANALYZER,
)

if MODULE_15_MCP_SERVER:
    from .mcp_server import async_setup_mcp_server

from .llm_api import HacaLLMAPI, HACA_LLM_API_ID

if MODULE_16_PROACTIVE_AGENT:
    from .proactive_agent import async_setup_proactive_agent

if MODULE_17_COMPLIANCE_ANALYZER:
    from .compliance_analyzer import ComplianceAnalyzer

# ── v1.5.0 ────────────────────────────────────────────────────────────────
from .const import (
    MODULE_18_BATTERY_PREDICTOR,
    MODULE_19_AREA_COMPLEXITY,
    MODULE_20_REDUNDANCY_ANALYZER,
    MODULE_21_RECORDER_IMPACT,
)

if MODULE_18_BATTERY_PREDICTOR:
    from .battery_predictor import BatteryPredictor

if MODULE_19_AREA_COMPLEXITY:
    from .area_complexity_analyzer import AreaComplexityAnalyzer

if MODULE_20_REDUNDANCY_ANALYZER:
    from .redundancy_analyzer import RedundancyAnalyzer

if MODULE_21_RECORDER_IMPACT:
    from .recorder_impact_analyzer import RecorderImpactAnalyzer


import json as _json
from pathlib import Path as _Path

# ── Cache mémoire des fichiers de traduction ────────────────────────────────
# Préchargé au démarrage via _async_preload_ts_cache() pour éviter tout I/O
# bloquant dans l'event loop (violation asyncio détectée par HA Python 3.14).
_TS_CACHE: dict[str, dict] = {}   # {lang: {section: {key: value}}}


def _ts(hass, section: str, key: str, **kwargs) -> str:
    """Get a translation string from in-memory cache (never does file I/O)."""
    lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    data = _TS_CACHE.get(lang) or _TS_CACHE.get("en") or {}
    val = data.get(section, {}).get(key, key)
    try:
        return val.format(**kwargs) if kwargs else val
    except Exception:
        return val


async def _async_preload_ts_cache(hass: "HomeAssistant") -> None:
    """Pre-load all translation JSON files into _TS_CACHE using the thread pool."""
    trans_dir = _Path(__file__).parent / "translations"

    def _load_one(path: _Path) -> tuple[str, dict]:
        raw = _json.loads(path.read_text(encoding="utf-8"))
        # Merge strategy: start from the full root JSON, then overlay
        # the "panel" subtree on top.  This ensures both root-level
        # sections (ai_prompts, services_notif, notifications…) AND
        # panel-level sections (misc, buttons, tabs…) are accessible
        # via  cache.get(section, {}).get(key).
        # For sections that exist at BOTH levels (e.g. "notifications"),
        # keys from panel override root.
        panel = raw.get("panel", {})
        merged = {}
        for key, val in raw.items():
            if key == "panel":
                continue
            if isinstance(val, dict):
                merged[key] = dict(val)  # shallow copy
            else:
                merged[key] = val
        # Overlay panel sections on top
        for key, val in panel.items():
            if isinstance(val, dict):
                merged.setdefault(key, {}).update(val)
            else:
                merged[key] = val
        return path.stem, merged

    def _list_translations() -> list[_Path]:
        """Blocking glob — must run in executor."""
        return sorted(trans_dir.glob("*.json"))

    import asyncio
    paths = await hass.async_add_executor_job(_list_translations)
    tasks = [hass.async_add_executor_job(_load_one, p) for p in paths]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for res in results:
        if isinstance(res, tuple):
            lang_code, panel = res
            _TS_CACHE[lang_code] = panel
    _LOGGER.debug("[HACA] Translation cache loaded: %s languages", len(_TS_CACHE))


_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the H.A.C.A component.

    Card registration happens here (not in async_setup_entry) because:
    - It must run exactly once per integration domain
    - manifest.json declares dependencies: ["frontend", "http"]
      so these components are guaranteed to be loaded
    """
    hass.data.setdefault(DOMAIN, {})

    # Register Lovelace card resources
    # If HA is already running, register immediately.
    # Otherwise, wait for EVENT_HOMEASSISTANT_STARTED.
    from homeassistant.core import CoreState

    async def _setup_cards(_event=None) -> None:
        try:
            await async_register_cards(hass)
        except Exception as exc:
            _LOGGER.warning("[HACA] Card registration failed: %s", exc)

    if hass.state == CoreState.running:
        await _setup_cards()
    else:
        hass.bus.async_listen_once("homeassistant_started", _setup_cards)

    return True



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up H.A.C.A from a config entry."""
    _LOGGER.info("Setting up %s v%s", NAME, VERSION)

    hass.data.setdefault(DOMAIN, {})

    # Pré-charger le cache de traductions (évite tout I/O bloquant dans l'event loop)
    await _async_preload_ts_cache(hass)
    
    if entry.entry_id in hass.data[DOMAIN]:
        _LOGGER.warning("H.A.C.A already set up for this entry")
        return True
    
    # Create analyzers
    automation_analyzer = AutomationAnalyzer(hass)
    entity_analyzer = EntityAnalyzer(hass)
    battery_monitor = BatteryMonitor(
        hass,
        critical=entry.options.get("battery_critical", 5),
        low=entry.options.get("battery_low", 15),
        warning=entry.options.get("battery_warning", 25),
    )
    dependency_mapper = DependencyMapper(hass)
    automation_optimizer = AutomationOptimizer(hass)
    performance_analyzer = PerformanceAnalyzer(hass)
    security_analyzer = SecurityAnalyzer(hass)
    dashboard_analyzer = DashboardAnalyzer(hass) if MODULE_9_DASHBOARD_ANALYZER else None
    recorder_analyzer = RecorderAnalyzer(hass) if MODULE_11_RECORDER_ANALYZER else None
    history_manager = HistoryManager(
        hass,
        retention_days=entry.options.get("history_retention_days", 365),
    ) if MODULE_12_AUDIT_HISTORY else None
    
    # Create optional modules
    report_generator = ReportGenerator(hass) if MODULE_4_COMPLIANCE_REPORT else None
    refactoring_assistant = RefactoringAssistant(hass) if MODULE_5_REFACTORING_ASSISTANT else None
    compliance_analyzer = ComplianceAnalyzer(hass) if MODULE_17_COMPLIANCE_ANALYZER else None

    # ── v1.5.0 analyzers ──────────────────────────────────────────────────
    battery_predictor = BatteryPredictor(hass) if MODULE_18_BATTERY_PREDICTOR else None
    area_complexity_analyzer = AreaComplexityAnalyzer(hass) if MODULE_19_AREA_COMPLEXITY else None
    redundancy_analyzer = RedundancyAnalyzer(hass) if MODULE_20_REDUNDANCY_ANALYZER else None
    recorder_impact_analyzer = RecorderImpactAnalyzer(hass) if MODULE_21_RECORDER_IMPACT else None
    
    scan_interval = entry.options.get("scan_interval", DEFAULT_SCAN_INTERVAL)
    
    async def async_update_data() -> dict[str, Any]:
        """Update data."""
        _LOGGER.debug("Running scheduled scan")

        # Catégories exclues configurées dans le panel HACA
        excluded: set = set(entry.options.get("excluded_categories", []))

        try:
            automation_issues = (
                await automation_analyzer.analyze_all()
                if "automations" not in excluded else []
            )
        except Exception as _auto_err:
            _LOGGER.error(
                "HACA: automation_analyzer.analyze_all() CRASHED — %s",
                _auto_err, exc_info=True,
            )
            automation_issues = []

        try:
            entity_issues = (
                await entity_analyzer.analyze_all(
                    automation_analyzer.automation_configs,
                    automation_analyzer.script_configs,
                )
                if "entities" not in excluded else []
            )
        except Exception as _ent_err:
            _LOGGER.error(
                "HACA: entity_analyzer.analyze_all() CRASHED — %s",
                _ent_err, exc_info=True,
            )
            entity_issues = []

        # ── Phase 2: parallel analysis ────────────────────────────────────
        # All analyzers below depend on automation_analyzer results (already
        # available) but are independent of each other.  Running them with
        # asyncio.gather reduces total scan time by 40-60% on large setups.

        async def _safe_perf() -> list:
            if "performance" in excluded:
                return []
            return await performance_analyzer.analyze_all(
                automation_analyzer.automation_configs
            )

        async def _safe_security() -> list:
            if "security" in excluded:
                return []
            return await security_analyzer.analyze_all(
                automation_analyzer.automation_configs
            )

        async def _safe_dashboard() -> list:
            if not dashboard_analyzer or "dashboards" in excluded:
                return []
            return await dashboard_analyzer.analyze_all()

        async def _safe_battery() -> list:
            if "batteries" in excluded:
                return []
            return await battery_monitor.analyze_all(
                critical=entry.options.get("battery_critical", 5),
                low=entry.options.get("battery_low", 15),
                warning=entry.options.get("battery_warning", 25),
            )

        async def _safe_recorder() -> tuple[list, float]:
            if not recorder_analyzer or "recorder" in excluded:
                return [], 0.0
            orphans = await recorder_analyzer.analyze_all()
            return orphans, recorder_analyzer.total_wasted_mb

        async def _safe_compliance() -> list:
            if not compliance_analyzer or "compliance" in excluded:
                return []
            return await compliance_analyzer.async_analyze()

        results = await asyncio.gather(
            _safe_perf(),
            _safe_security(),
            _safe_dashboard(),
            _safe_battery(),
            _safe_recorder(),
            _safe_compliance(),
            return_exceptions=True,
        )

        # Unpack results with safe fallbacks for exceptions
        performance_issues = results[0] if not isinstance(results[0], BaseException) else []
        security_issues    = results[1] if not isinstance(results[1], BaseException) else []
        dashboard_issues   = results[2] if not isinstance(results[2], BaseException) else []
        battery_list       = results[3] if not isinstance(results[3], BaseException) else []
        recorder_result    = results[4] if not isinstance(results[4], BaseException) else ([], 0.0)
        compliance_issues  = results[5] if not isinstance(results[5], BaseException) else []

        # Log any exceptions from parallel phase
        for idx, (label, res) in enumerate([
            ("performance", results[0]), ("security", results[1]),
            ("dashboard", results[2]), ("battery", results[3]),
            ("recorder", results[4]), ("compliance", results[5]),
        ]):
            if isinstance(res, BaseException):
                _LOGGER.error("HACA: %s analyzer CRASHED — %s", label, res, exc_info=res)

        recorder_orphans: list = recorder_result[0]
        recorder_wasted_mb: float = recorder_result[1]

        # ── Post-parallel filtering ───────────────────────────────────────
        excluded_types: set = set(entry.options.get("excluded_issue_types", []))
        if excluded_types and compliance_issues:
            compliance_issues = [i for i in compliance_issues if i.get("type", "") not in excluded_types]

        # Get separated issue lists from automation analyzer
        automation_only_issues = automation_analyzer.automation_issues
        script_issues = automation_analyzer.script_issues
        scene_issues = automation_analyzer.scene_issues
        blueprint_issues = automation_analyzer.blueprint_issues

        # Get helper issues separated by entity_analyzer
        helper_issues = getattr(entity_analyzer, "helper_issues", [])

        # Route scene.* issues from entity_analyzer into scene_issue_list
        # (entity_analyzer produces unavailable/stale/zombie issues for scene.* that
        #  belong in the Scenes tab, not the Entities tab)
        entity_scene_issues = [i for i in entity_issues if i.get("entity_id", "").startswith("scene.")]
        entity_issues       = [i for i in entity_issues if not i.get("entity_id", "").startswith("scene.")]
        scene_issues        = scene_issues + entity_scene_issues

        # Filtrage par type d'issue (configuré dans le panel HACA → onglet Configuration)
        if excluded_types:
            def _filter(lst):
                return [i for i in lst if i.get("type", "") not in excluded_types]
            automation_only_issues = _filter(automation_only_issues)
            script_issues          = _filter(script_issues)
            scene_issues           = _filter(scene_issues)
            blueprint_issues       = _filter(blueprint_issues)
            entity_issues          = _filter(entity_issues)
            helper_issues          = _filter(helper_issues)
            performance_issues     = _filter(performance_issues)
            security_issues        = _filter(security_issues)
            dashboard_issues       = _filter(dashboard_issues)
        
        total_entities     = len(hass.states.async_all())
        total_automations  = len(automation_analyzer.automation_configs) + len(automation_analyzer.script_configs)
        health_score = calculate_health_score(
            automation_only_issues, entity_issues, performance_issues, security_issues, dashboard_issues,
            total_entities=total_entities,
            total_automations=total_automations,
            helper_issues=helper_issues,
            compliance_issues=compliance_issues,
            script_issues=script_issues,
            scene_issues=scene_issues,
            blueprint_issues=blueprint_issues,
        )        
        _LOGGER.info(
            "Health Score Calculation: Automation=%d, Scripts=%d, Blueprints=%d, Entities=%d, Helpers=%d, Performance=%d, Dashboard=%d. Score=%d%%",
            len(automation_only_issues), len(script_issues), len(blueprint_issues),
            len(entity_issues), len(helper_issues), len(performance_issues), len(dashboard_issues), health_score
        )
 
        # ── Save audit snapshot to history ───────────────────────────────
        scan_result = {
            "health_score":    health_score,
            "total_issues":    len(automation_only_issues) + len(script_issues) + len(scene_issues)
                             + len(blueprint_issues) + len(entity_issues) + len(helper_issues)
                             + len(performance_issues) + len(security_issues)
                             + len(dashboard_issues),
            "automation_issues":   len(automation_only_issues),
            "script_issues":       len(script_issues),
            "scene_issues":        len(scene_issues),
            "entity_issues":       len(entity_issues),
            "helper_issues":       len(helper_issues),
            "performance_issues":  len(performance_issues),
            "security_issues":     len(security_issues),
            "blueprint_issues":    len(blueprint_issues),
            "dashboard_issues":    len(dashboard_issues),
        }
        if history_manager:
            try:
                await history_manager.async_save_scan(scan_result)
            except Exception as hist_err:
                _LOGGER.warning("HACA History save error: %s", hist_err)

        # ── v1.5.0 — Battery prediction ───────────────────────────────────
        battery_predictions: list = []
        if battery_predictor and battery_list:
            try:
                await battery_predictor.async_save_battery_snapshot(battery_list)
                battery_predictions = await battery_predictor.async_compute_predictions(battery_list)
            except Exception as bp_err:
                _LOGGER.warning("Battery predictor error: %s", bp_err)

        # ── v1.5.0 — Area complexity heatmap ──────────────────────────────
        area_complexity_data: dict = {}
        if area_complexity_analyzer:
            try:
                area_complexity_data = await area_complexity_analyzer.async_analyze(
                    automation_configs=automation_analyzer.automation_configs,
                    complexity_scores=automation_analyzer.complexity_scores,
                )
            except Exception as ac_err:
                _LOGGER.warning("Area complexity analyzer error: %s", ac_err)

        # ── v1.5.0 — Redundancy analysis ──────────────────────────────────
        redundancy_data: dict = {}
        if redundancy_analyzer:
            try:
                redundancy_data = await redundancy_analyzer.async_analyze(
                    automation_configs=automation_analyzer.automation_configs,
                    blueprint_stats=automation_analyzer.blueprint_stats,
                    complexity_scores=automation_analyzer.complexity_scores,
                )
            except Exception as red_err:
                _LOGGER.warning("Redundancy analyzer error: %s", red_err)

        # ── v1.5.0 — Recorder impact analysis ────────────────────────────
        recorder_impact_data: dict = {}
        if recorder_impact_analyzer:
            try:
                recorder_impact_data = await recorder_impact_analyzer.async_analyze(
                    automation_configs=automation_analyzer.automation_configs,
                    complexity_scores=automation_analyzer.complexity_scores,
                )
            except Exception as ri_err:
                _LOGGER.warning("Recorder impact analyzer error: %s", ri_err)

        # Build dependency graph
        dependency_graph = {"nodes": [], "edges": []}
        try:
            all_flat_issues = (
                automation_only_issues + script_issues + scene_issues +
                blueprint_issues + entity_issues + helper_issues + performance_issues +
                security_issues + dashboard_issues
            )
            dependency_graph = await dependency_mapper.build(
                automation_configs=automation_analyzer.automation_configs,
                script_configs=automation_analyzer.script_configs,
                scene_configs=automation_analyzer.scene_configs,
                entity_references=dict(entity_analyzer.entity_references),
                alias_map=entity_analyzer.automation_alias_map,
                all_issues=all_flat_issues,
            )
        except Exception as dep_err:
            _LOGGER.error("Dependency mapper error: %s", dep_err)

        return {
            "health_score": health_score,
            "automation_issues": len(automation_only_issues),
            "script_issues": len(script_issues),
            "scene_issues": len(scene_issues),
            "blueprint_issues": len(blueprint_issues),
            "entity_issues": len(entity_issues),
            "helper_issues": len(helper_issues),
            "performance_issues": len(performance_issues),
            "security_issues": len(security_issues),
            "dashboard_issues": len(dashboard_issues),
            "total_issues": len(automation_only_issues) + len(script_issues) + len(scene_issues)
                          + len(blueprint_issues) + len(entity_issues) + len(helper_issues)
                          + len(performance_issues) + len(security_issues)
                          + len(dashboard_issues) + len(compliance_issues),
            "compliance_issues": len(compliance_issues),
            "compliance_issue_list": compliance_issues,
            "automation_issue_list": automation_only_issues,
            "complexity_scores":        sorted(automation_analyzer.complexity_scores, key=lambda x: x["score"], reverse=True) if automation_analyzer else [],
            "script_complexity_scores": automation_analyzer.script_complexity_scores if automation_analyzer else [],
            "scene_stats":              automation_analyzer.scene_stats if automation_analyzer else [],
            "blueprint_stats":          automation_analyzer.blueprint_stats if automation_analyzer else [],
            "script_issue_list": script_issues,
            "scene_issue_list": scene_issues,
            "blueprint_issue_list": blueprint_issues,
            "entity_issue_list": entity_issues,
            "helper_issue_list": helper_issues,
            "performance_issue_list": performance_issues,
            "security_issue_list": security_issues,
            "dashboard_issue_list": dashboard_issues,
            "recorder_orphans": recorder_orphans,
            "recorder_orphan_count": len(recorder_orphans),
            "recorder_wasted_mb": recorder_wasted_mb,
            "recorder_db_available": getattr(recorder_analyzer, "db_available", False),
            "battery_list": battery_list,
            "battery_count": len(battery_list),
            "battery_alerts": sum(1 for b in battery_list if b["severity"] is not None),
            "battery_alert_entities": [
                {"entity_id": b["entity_id"], "level": b["level"], "unit": b.get("unit", "%"),
                 "device_class": b.get("device_class", ""), "severity": b["severity"]}
                for b in battery_list if b["severity"] is not None
            ],
            "dependency_graph": dependency_graph,
            # ── v1.5.0 ────────────────────────────────────────────────────
            "battery_predictions": battery_predictions,
            "battery_predictions_count": len(battery_predictions),
            "battery_alert_7d": sum(1 for p in battery_predictions if p.get("alert_7d")),
            "area_complexity": area_complexity_data,
            "redundancy": redundancy_data,
            "recorder_impact": recorder_impact_data,
            "last_scan": _dt_util.utcnow().isoformat(),
        }
    
    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=async_update_data,
        update_interval=timedelta(minutes=scan_interval) if scan_interval > 0 else None,
    )
    
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "entry": entry,
        "_scan_in_progress": False,
        "automation_analyzer": automation_analyzer,
        "entity_analyzer": entity_analyzer,
        "performance_analyzer": performance_analyzer,
        "report_generator": report_generator,
        "refactoring_assistant": refactoring_assistant,
        "security_analyzer": security_analyzer,
        "dashboard_analyzer": dashboard_analyzer,
        "recorder_analyzer": recorder_analyzer,
        "history_manager": history_manager,
        "automation_optimizer": automation_optimizer,
        "compliance_analyzer": compliance_analyzer,
    }
    
    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=NAME,
        manufacturer="Community",
        model="Config Auditor",
        sw_version=VERSION,
    )
    
    # ── Deferred first scan ───────────────────────────────────────────────
    # Do NOT run async_config_entry_first_refresh() immediately: HA may still
    # be loading other integrations (zigbee, zwave, mqtt…) so entities would
    # appear unavailable / missing, generating false-positive issues.
    #
    # Instead, set an empty initial coordinator state now (so sensors register
    # without blocking), then schedule the real first scan to run only after
    # EVENT_HOMEASSISTANT_STARTED — i.e. when every integration is loaded.
    coordinator.data = {
        "health_score": 0,
        "total_issues": 0,
        "automation_issues": 0,
        "script_issues": 0,
        "scene_issues": 0,
        "entity_issues": 0,
        "helper_issues": 0,
        "performance_issues": 0,
        "security_issues": 0,
        "blueprint_issues": 0,
        "automation_issue_list": [],
        "script_issue_list": [],
        "scene_issue_list": [],
        "entity_issue_list": [],
        "helper_issue_list": [],
        "performance_issue_list": [],
        "security_issue_list": [],
        "blueprint_issue_list": [],
        "dashboard_issues": 0,
        "dashboard_issue_list": [],
        "compliance_issues": 0,
        "compliance_issue_list": [],
        "recorder_orphans": [],
        "recorder_orphan_count": 0,
        "recorder_wasted_mb": 0.0,
        "recorder_db_available": False,
        "complexity_scores": [],
        "script_complexity_scores": [],
        "scene_stats": [],
        "blueprint_stats": [],
        "battery_list": [],
        "battery_count": 0,
        "battery_alerts": 0,
        "dependency_graph": {"nodes": [], "edges": []},
        "battery_predictions": [],
        "battery_predictions_count": 0,
        "battery_alert_7d": 0,
        "area_complexity": {},
        "redundancy": {},
        "recorder_impact": {},
    }

    async def _first_scan_when_ready(hass_: HomeAssistant) -> None:
        """Run the very first HACA scan after HA has fully started.

        Even after EVENT_HOMEASSISTANT_STARTED some integrations (Zigbee,
        Z-Wave, cloud platforms) continue restoring entities asynchronously.
        We wait an extra configurable delay before scanning so those entities
        are present and won't be reported as false-positive issues.
        """
        # Check if startup scan is disabled
        startup_scan = entry.options.get("startup_scan_enabled",
                       entry.data.get("startup_scan_enabled", True))
        if not startup_scan:
            _LOGGER.info("HACA startup scan disabled by configuration")
            return

        startup_delay = int(
            entry.options.get("startup_delay_seconds",
            entry.data.get("startup_delay_seconds", 60))
        )
        if startup_delay > 0:
            _LOGGER.info(
                "Home Assistant started — HACA initial scan delayed by %ds "
                "(waiting for slow integrations to finish restoring entities)",
                startup_delay,
            )
            await asyncio.sleep(startup_delay)

        _LOGGER.info("Running HACA initial scan now")
        try:
            await coordinator.async_refresh()
        except Exception as exc:
            _LOGGER.warning("HACA initial scan error: %s", exc)

    entry.async_on_unload(async_at_started(hass, _first_scan_when_ready))
    # ──────────────────────────────────────────────────────────────────────

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    # Register panel - CORRECTION: enregistrer le panneau seulement pour la première instance
    if len([e for e in hass.config_entries.async_entries(DOMAIN)]) == 1:
        await async_register_panel(hass)
        async_register_websocket_handlers(hass)
        await async_setup_conversation(hass, entry)
        _LOGGER.info("Panel, WebSocket handlers and Conversation agent registered")
    
    if len([e for e in hass.config_entries.async_entries(DOMAIN)]) == 1:
        await async_setup_services(hass, entry)
    
    # NOTE: Pas de update_listener → async_reload_entry.
    # async_update_entry (appelé dans handle_save_options) met à jour entry.options
    # sans déclencher de reload. Le coordinator relit entry.options à chaque scan.
    # Un reload complet (non déclenché automatiquement) reste possible via l'UI HA
    # pour appliquer scan_interval et event_monitoring immédiatement.
    
    # ── Event-Based Monitoring (MODULE 10) ───────────────────────────────
    if MODULE_10_EVENT_MONITORING:
        async_setup_event_monitor(hass, entry)
    # ── End Event-Based Monitoring ────────────────────────────────────────

    # ── v1.4.0 : Serveur MCP (MODULE 15) ─────────────────────────────────
    if MODULE_15_MCP_SERVER:
        await async_setup_mcp_server(hass)

    # ── v1.5.1 : LLM API — expose les outils HACA à Mistral/OpenAI/etc. ──
    # L'utilisateur configure : HA Settings → Voice Assistants → [agent] → LLM API → HACA
    try:
        from homeassistant.helpers import llm as _llm
        _llm.async_register_api(hass, HacaLLMAPI(hass))
        _LOGGER.info("[HACA] LLM API 'HACA' enregistrée — configurez-la dans Voice Assistants")
    except Exception as _llm_err:
        _LOGGER.warning("[HACA] Impossible d'enregistrer le LLM API: %s", _llm_err)

    # ── v1.4.0 : Agent IA Proactif (MODULE 16) ───────────────────────────
    if MODULE_16_PROACTIVE_AGENT:
        async_setup_proactive_agent(hass, entry)

    # ── Post-scan notification listener ──────────────────────────────────
    # Après chaque refresh du coordinator (scan périodique OU déclenché par
    # un événement de modification), compare les issues HIGH avec le scan
    # précédent et envoie une notification persistante pour les nouvelles issues.
    _prev_high_issue_keys: set[str] = set()

    @callback
    def _on_coordinator_update() -> None:
        """Détecte les nouvelles issues HIGH et envoie une notification persistante."""
        nonlocal _prev_high_issue_keys
        cdata = coordinator.data
        if not cdata:
            return

        all_lists = [
            cdata.get("automation_issue_list", []),
            cdata.get("script_issue_list", []),
            cdata.get("entity_issue_list", []),
            cdata.get("performance_issue_list", []),
            cdata.get("security_issue_list", []),
            cdata.get("dashboard_issue_list", []),
            cdata.get("blueprint_issue_list", []),
            cdata.get("scene_issue_list", []),
        ]

        # Identifiant stable pour chaque issue HIGH
        current_high: dict[str, dict] = {}
        for lst in all_lists:
            for issue in lst:
                if issue.get("severity") == "high":
                    key = "|".join([
                        str(issue.get("entity_id", "")),
                        str(issue.get("type", "")),
                        str(issue.get("location", "")),
                    ])
                    current_high[key] = issue

        new_keys = set(current_high) - _prev_high_issue_keys
        _prev_high_issue_keys = set(current_high)

        if not new_keys:
            return

        # Build consolidated notification for all new HIGH issues
        new_issues = [current_high[k] for k in new_keys]
        count = len(new_issues)
        score = cdata.get("health_score", "?")

        # Group by source name for readability
        lines: list[str] = []
        for iss in new_issues[:8]:  # cap at 8 to keep notification readable
            name = iss.get("alias") or iss.get("entity_id", "?")
            msg  = (iss.get("message") or "")[:120]
            lines.append(f"- **{name}** : {msg}")
        if count > 8:
            lines.append(_ts(hass, "notifications", "more_issues", count=count - 8))

        body = "\n".join(lines)

        # Single translation system — reads from JSON using user_language
        title   = _ts(hass, "notifications", "new_issues_title", count=count)
        header  = _ts(hass, "notifications", "new_issues_header", score=score)
        footer  = _ts(hass, "notifications", "new_issues_footer")

        message = header + body + footer

        hass.async_create_task(
            hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "notification_id": f"haca_new_issues_{entry.entry_id}",
                    "title":   title,
                    "message": message,
                },
                blocking=False,
            )
        )
        _LOGGER.info(
            "[HACA] Post-scan notification: %d new HIGH issue(s) detected", count
        )

    @callback
    def _on_coordinator_update_repairs() -> None:
        """Sync HIGH issues to HA native Repairs panel after each scan."""
        # Check option dynamically — user can toggle without restart
        if not entry.options.get("repairs_enabled", True):
            return
        cdata = coordinator.data
        if cdata:
            hass.async_create_task(async_update_repairs(hass, cdata))

    entry.async_on_unload(
        coordinator.async_add_listener(_on_coordinator_update)
    )
    entry.async_on_unload(
        coordinator.async_add_listener(_on_coordinator_update_repairs)
    )
    # ── End post-scan notification listener ───────────────────────────────

    # Appliquer debug_mode si persisté dans les options
    if entry.options.get("debug_mode", False):
        import logging as _logging
        _logging.getLogger("custom_components.config_auditor").setLevel(_logging.DEBUG)
        _LOGGER.info("[HACA] Debug mode enabled (from saved options)")

    _LOGGER.info("%s v%s setup complete - All 5 modules loaded", NAME, VERSION)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    Ne désenregistre PAS le panel ici : cette fonction est appelée à chaque
    reload (save d'options, mise à jour HACS…). Le panel reste affiché dans
    la sidebar pendant le reload et sera ré-enregistré (update=True) dans
    async_setup_entry. async_unregister_panel n'est appelé que dans
    async_remove_entry (désinstallation complète).
    """
    _LOGGER.info("Unloading %s", NAME)

    # Désenregistrer le LLM API HACA
    try:
        from homeassistant.helpers import llm as _llm
        # Prefer the public unregister method if available (HA 2025.x+)
        if hasattr(_llm, "async_unregister_api"):
            _llm.async_unregister_api(hass, HACA_LLM_API_ID)
        else:
            # Fallback for older HA versions: access the internal registry
            # This is a best-effort cleanup — not finding the API is fine.
            _apis = getattr(_llm, "_apis", None) or getattr(_llm, "apis", None)
            if isinstance(_apis, dict):
                _apis.pop(HACA_LLM_API_ID, None)
    except Exception:
        pass

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry (appelé manuellement via l'UI HA, pas automatiquement)."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle removal of an entry - Clean Uninstall."""
    _LOGGER.info("Removing %s — clean uninstall", NAME)

    # 0. Ensure panel is unregistered
    await async_unregister_panel(hass)

    # 1. Paths
    reports_path = hass.config.path(REPORTS_DIR)
    backups_path = hass.config.path(BACKUP_DIR)
    history_path = Path(hass.config.config_dir) / ".haca_history"
    battery_history_path = Path(hass.config.config_dir) / ".haca_battery_history"

    # 2. Blocking cleanup — runs in the executor to avoid blocking the event loop
    def _cleanup_files() -> None:
        """Remove all HACA data directories (blocking I/O, runs in executor)."""
        for dir_path in (reports_path, backups_path, history_path, battery_history_path):
            p = Path(dir_path)
            if p.exists() and p.is_dir():
                try:
                    shutil.rmtree(p)
                    _LOGGER.info("Removed directory: %s", p)
                except Exception as e:
                    _LOGGER.error("Failed to remove directory %s: %s", p, e)

    await hass.async_add_executor_job(_cleanup_files)

    # 3. Persistent notification
    await hass.services.async_call(
        "persistent_notification",
        "create",
        {
            "title": _ts(hass, "notifications", "uninstalled_title", name=NAME),
            "message": _ts(hass, "notifications", "uninstalled_body"),
            "notification_id": "haca_uninstall_notice"
        }
    )
