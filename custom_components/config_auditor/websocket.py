"""WebSocket API pour H.A.C.A."""
from __future__ import annotations

import asyncio
import logging
import json
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.translation import async_get_translations

from .const import DOMAIN

def _ts(hass, section: str, key: str, **kwargs) -> str:
    """Get a translation string from the in-memory cache (websocket-local copy)."""
    lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    # Import cache lazily to avoid circular import at module load time
    try:
        from . import _TS_CACHE  # noqa: PLC0415
        data = _TS_CACHE.get(lang) or _TS_CACHE.get("en") or {}
    except Exception:
        data = {}
    val = data.get(section, {}).get(key, key)
    try:
        return val.format(**kwargs) if kwargs else val
    except Exception:
        return val

_LOGGER = logging.getLogger(__name__)

# ── Simple per-command rate limiter for write-sensitive handlers ────────────
# Prevents spam on save_options and apply_field_fix (YAML writes).
# Dict of { "command_key" : last_call_monotonic_time }
_WS_RATE_LIMITS: dict[str, float] = {}
_WS_RATE_LIMIT_SECONDS = 2.0  # minimum seconds between calls per command+user


def _rate_limited(key: str, seconds: float = _WS_RATE_LIMIT_SECONDS) -> bool:
    """Return True if the call should be rejected (too soon since last call)."""
    import time
    now = time.monotonic()
    last = _WS_RATE_LIMITS.get(key, 0.0)
    if now - last < seconds:
        return True
    _WS_RATE_LIMITS[key] = now
    return False


def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register WebSocket handlers."""
    websocket_api.async_register_command(hass, handle_get_data)
    websocket_api.async_register_command(hass, handle_scan_all)
    websocket_api.async_register_command(hass, handle_preview_fix)
    websocket_api.async_register_command(hass, handle_apply_fix)
    websocket_api.async_register_command(hass, handle_list_backups)
    websocket_api.async_register_command(hass, handle_restore_backup)
    websocket_api.async_register_command(hass, handle_get_translations)
    websocket_api.async_register_command(hass, handle_explain_issue)
    websocket_api.async_register_command(hass, handle_ai_suggest_fix)
    websocket_api.async_register_command(hass, handle_apply_field_fix)
    websocket_api.async_register_command(hass, handle_purge_recorder_orphans)
    websocket_api.async_register_command(hass, handle_get_history)
    websocket_api.async_register_command(hass, handle_delete_history)
    websocket_api.async_register_command(hass, handle_chat)
    websocket_api.async_register_command(hass, handle_get_options)
    websocket_api.async_register_command(hass, handle_save_options)
    websocket_api.async_register_command(hass, handle_set_log_level)
    # ── v1.4.0 ─────────────────────────────────────────────────────────────
    websocket_api.async_register_command(hass, handle_mcp_status)
    websocket_api.async_register_command(hass, handle_agent_status)
    websocket_api.async_register_command(hass, handle_agent_force_report)
    websocket_api.async_register_command(hass, handle_record_fix_outcome)
    # ── v1.5.0 ─────────────────────────────────────────────────────────────
    websocket_api.async_register_command(hass, handle_get_battery_predictions)
    websocket_api.async_register_command(hass, handle_export_battery_csv)
    websocket_api.async_register_command(hass, handle_get_area_complexity)
    websocket_api.async_register_command(hass, handle_get_redundancy)
    websocket_api.async_register_command(hass, handle_get_recorder_impact)
    websocket_api.async_register_command(hass, handle_get_history_diff)
    _LOGGER.info("[HACA] WebSocket handlers registered")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/get_data",
        vol.Optional("limit", default=200): int,
        vol.Optional("offset", default=0): int,
        vol.Optional("category"): vol.In([
            "automation", "script", "scene", "blueprint",
            "entity", "performance", "security", "dashboard", "compliance"
        ]),
    }
)
@websocket_api.async_response
async def handle_get_data(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle get data request with optional pagination."""
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        if not data:
            connection.send_error(msg["id"], "no_data", "No data available")
            return

        coordinator = data["coordinator"]
        cdata = coordinator.data or {}

        limit  = msg.get("limit", 200)
        offset = msg.get("offset", 0)
        category = msg.get("category")

        def _paginate(lst: list) -> list:
            return lst[offset: offset + limit]

        # If a category filter is requested, only return that list
        category_map = {
            "automation":  "automation_issue_list",
            "script":      "script_issue_list",
            "scene":       "scene_issue_list",
            "blueprint":   "blueprint_issue_list",
            "entity":      "entity_issue_list",
            "performance": "performance_issue_list",
            "security":    "security_issue_list",
            "dashboard":   "dashboard_issue_list",
            "compliance":  "compliance_issue_list",
        }

        def _get_list(key: str) -> list:
            lst = cdata.get(key, [])
            if category and category_map.get(category) == key:
                return _paginate(lst)
            if not category:
                return _paginate(lst)
            return lst if category_map.get(category) != key else []

        auto_list  = cdata.get("automation_issue_list", [])
        script_list = cdata.get("script_issue_list", [])
        scene_list  = cdata.get("scene_issue_list", [])
        bp_list     = cdata.get("blueprint_issue_list", [])
        ent_list    = cdata.get("entity_issue_list", [])
        perf_list   = cdata.get("performance_issue_list", [])
        sec_list    = cdata.get("security_issue_list", [])
        dash_list   = cdata.get("dashboard_issue_list", [])
        comp_list   = cdata.get("compliance_issue_list", [])

        connection.send_result(
            msg["id"],
            {
                "health_score":         cdata.get("health_score", 0),
                "automation_issues":    cdata.get("automation_issues", 0),
                "script_issues":        cdata.get("script_issues", 0),
                "scene_issues":         cdata.get("scene_issues", 0),
                "blueprint_issues":     cdata.get("blueprint_issues", 0),
                "entity_issues":        cdata.get("entity_issues", 0),
                "performance_issues":   cdata.get("performance_issues", 0),
                "security_issues":      cdata.get("security_issues", 0),
                "dashboard_issues":     cdata.get("dashboard_issues", 0),
                "compliance_issues":    cdata.get("compliance_issues", 0),
                "total_issues":         cdata.get("total_issues", 0),
                "last_scan":            cdata.get("last_scan"),
                # Paginated lists
                "automation_issue_list":    _paginate(auto_list)   if not category or category == "automation"  else auto_list,
                "script_issue_list":        _paginate(script_list) if not category or category == "script"      else script_list,
                "scene_issue_list":         _paginate(scene_list)  if not category or category == "scene"       else scene_list,
                "blueprint_issue_list":     _paginate(bp_list)     if not category or category == "blueprint"   else bp_list,
                "entity_issue_list":        _paginate(ent_list)    if not category or category == "entity"      else ent_list,
                "performance_issue_list":   _paginate(perf_list)   if not category or category == "performance" else perf_list,
                "security_issue_list":      _paginate(sec_list)    if not category or category == "security"    else sec_list,
                "dashboard_issue_list":     _paginate(dash_list)   if not category or category == "dashboard"   else dash_list,
                "compliance_issue_list":   _paginate(comp_list)   if not category or category == "compliance"   else comp_list,
                # Dependency graph
                "dependency_graph": cdata.get("dependency_graph", {"nodes": [], "edges": []}),
                # Battery monitor
                "battery_list":   cdata.get("battery_list", []),
                "battery_count":  cdata.get("battery_count", 0),
                "battery_alerts": cdata.get("battery_alerts", 0),
                # Complexity / stats tables
                "complexity_scores":         cdata.get("complexity_scores", []),
                "script_complexity_scores":  cdata.get("script_complexity_scores", []),
                "scene_stats":               cdata.get("scene_stats", []),
                "blueprint_stats":           cdata.get("blueprint_stats", []),
                # Recorder orphan data (not paginated, usually small)
                "recorder_orphans":          cdata.get("recorder_orphans", []),
                "recorder_orphan_count":      cdata.get("recorder_orphan_count", 0),
                "recorder_wasted_mb":         cdata.get("recorder_wasted_mb", 0.0),
                "recorder_db_available":      cdata.get("recorder_db_available", False),
                # Pagination metadata
                "pagination": {
                    "limit":  limit,
                    "offset": offset,
                    "category": category,
                    "total_automation":  len(auto_list),
                    "total_script":      len(script_list),
                    "total_scene":       len(scene_list),
                    "total_blueprint":   len(bp_list),
                    "total_entity":      len(ent_list),
                    "total_performance": len(perf_list),
                    "total_security":    len(sec_list),
                    "total_dashboard":   len(dash_list),
                    "total_compliance":  len(comp_list),
                },
            },
        )
    except Exception as e:
        _LOGGER.error("Error getting data: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/scan_all",
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_scan_all(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle scan all request — fire-and-forget.

    Ne bloque PAS la connexion WebSocket pendant le scan (qui peut durer
    10-30s sur une grande installation). Répond immédiatement avec
    {"accepted": true}, puis fire l'event HA "haca_scan_complete" quand
    le coordinator a fini, ce que le frontend écoute via subscribeEvents.
    """
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        if not data:
            connection.send_error(msg["id"], "no_data", "No H.A.C.A data found")
            return

        # Guard anti-spam : si un scan est déjà en cours, on rejette sans bloquer
        if data.get("_scan_in_progress"):
            connection.send_result(msg["id"], {"accepted": False, "reason": "scan_in_progress"})
            _LOGGER.warning("[HACA WS] Scan already in progress — request ignored")
            return

        coordinator = data["coordinator"]
        data["_scan_in_progress"] = True

        # Répondre IMMÉDIATEMENT — le scan tourne en tâche de fond
        connection.send_result(msg["id"], {"accepted": True})

        async def _run_scan() -> None:
            try:
                await coordinator.async_refresh()
                _LOGGER.info("[HACA WS] Background scan complete — firing haca_scan_complete")
            except Exception as scan_err:
                _LOGGER.error("[HACA WS] Background scan error: %s", scan_err, exc_info=True)
            finally:
                data["_scan_in_progress"] = False
                # Notifier le frontend via l'event bus HA
                hass.bus.async_fire("haca_scan_complete", {
                    "entry_id": entry.entry_id,
                    "success": True,
                })

        hass.async_create_task(_run_scan())

    except Exception as e:
        _LOGGER.error("Error starting scan: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/preview_fix",
        vol.Required("automation_id"): str,
        vol.Required("fix_type"): str,
        vol.Optional("mode"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_preview_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle preview fix request."""
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        refactoring = data.get("refactoring_assistant") if data else None
        
        if not refactoring:
            connection.send_error(msg["id"], "no_refactoring", "Refactoring module not available")
            return

        automation_id = msg["automation_id"]
        fix_type = msg["fix_type"]
        
        if fix_type == "device_id":
            result = await refactoring.preview_device_id_fix(automation_id)
        elif fix_type == "mode":
            mode = msg.get("mode", "restart")
            result = await refactoring.preview_mode_fix(automation_id, mode)
        else:
            connection.send_error(msg["id"], "invalid_type", f"Unknown fix type: {fix_type}")
            return
        
        connection.send_result(msg["id"], result)
        
    except Exception as e:
        _LOGGER.error("Error previewing fix: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/apply_fix",
        vol.Required("automation_id"): str,
        vol.Required("fix_type"): str,
        vol.Optional("mode"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_apply_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle apply fix request."""
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        refactoring = data.get("refactoring_assistant") if data else None
        
        if not refactoring:
            connection.send_error(msg["id"], "no_refactoring", "Refactoring module not available")
            return

        automation_id = msg["automation_id"]
        fix_type = msg["fix_type"]
        
        if fix_type == "device_id":
            result = await refactoring.apply_device_id_fix(automation_id)
        elif fix_type == "mode":
            mode = msg.get("mode", "restart")
            result = await refactoring.apply_mode_fix(automation_id, mode)
        else:
            connection.send_error(msg["id"], "invalid_type", f"Unknown fix type: {fix_type}")
            return
        
        connection.send_result(msg["id"], result)
        
    except Exception as e:
        _LOGGER.error("Error applying fix: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/list_backups",
    }
)
@websocket_api.async_response
async def handle_list_backups(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle list backups request."""
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        refactoring = data.get("refactoring_assistant") if data else None
        
        if not refactoring:
            connection.send_error(msg["id"], "no_refactoring", "Refactoring module not available")
            return

        backups = await refactoring.list_backups()
        
        connection.send_result(
            msg["id"],
            {
                "backups": backups,
                "count": len(backups),
            },
        )
        
    except Exception as e:
        _LOGGER.error("Error listing backups: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/restore_backup",
        vol.Required("backup_path"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_restore_backup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle restore backup request."""
    try:
        entry, data = _get_entry_data(hass)
        if not entry:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        refactoring = data.get("refactoring_assistant") if data else None
        
        if not refactoring:
            connection.send_error(msg["id"], "no_refactoring", "Refactoring module not available")
            return

        backup_path = msg["backup_path"]
        result = await refactoring.restore_backup(backup_path)
        
        connection.send_result(msg["id"], result)
        
    except Exception as e:
        _LOGGER.error("Error restoring backup: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))



@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/purge_recorder_orphans",
        vol.Required("entity_ids"): [str],
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_purge_recorder_orphans(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Purge orphaned entity data directly via SQL in the recorder DB thread.

    ⚠️  DIRECT SQL ACCESS — WHY AND RISKS
    ──────────────────────────────────────
    We use direct SQL because ``recorder.purge_entities`` only touches the
    ``states`` / ``states_meta`` tables and cannot remove entries that exist
    *only* in ``statistics_meta`` (long-term statistics without a matching
    state history).  Direct SQL is the only reliable approach for full orphan
    removal.

    Known risks (user is warned in the UI before confirming):
    - Internal Recorder DB schema may change between HA versions.
    - On schema mismatch the whole transaction is rolled back, leaving the
      DB in a clean state.  No partial deletions are committed.
    - WAL checkpoint after commit ensures subsequent readers see our changes.
    """
    entity_ids: list[str] = msg.get("entity_ids", [])
    _LOGGER.warning("[HACA Purge] request for %d entity(ies): %s", len(entity_ids), entity_ids)

    if not entity_ids:
        connection.send_error(msg["id"], "no_entities", "No entity_ids provided")
        return

    try:
        from homeassistant.helpers.recorder import get_instance
        instance = get_instance(hass)
    except Exception as exc:
        _LOGGER.warning("[HACA Purge] Recorder unavailable: %s", exc)
        connection.send_error(msg["id"], "recorder_unavailable", str(exc))
        return

    def _do_purge(instance) -> dict:
        """Execute DELETE statements in the recorder DB thread + WAL checkpoint.

        Runs inside instance.async_add_executor_job so we are on the recorder's
        own DB thread.

        Supports both old API (get_session) and new API (session_scope).
        """
        from sqlalchemy import text

        deleted = {}
        
        # Get a session — try modern API first, fallback to legacy
        session = None
        session_ctx = None
        try:
            if hasattr(instance, "get_session"):
                session = instance.get_session()
            else:
                # HA 2024+: use session_scope or create from engine
                from sqlalchemy.orm import Session as _Session
                session = _Session(bind=instance.engine)
                _LOGGER.debug("[HACA Purge] Using direct SQLAlchemy Session (modern HA)")
        except Exception as sess_exc:
            _LOGGER.warning("[HACA Purge] Cannot create DB session: %s", sess_exc)
            raise

        try:
            for eid in entity_ids:
                counts = {}

                # ── 1. states / states_meta ───────────────────────────────
                row = session.execute(
                    text("SELECT metadata_id FROM states_meta WHERE entity_id = :eid"),
                    {"eid": eid},
                ).fetchone()

                if row:
                    metadata_id = row[0]

                    # Find attributes_id values used ONLY by this entity
                    # (safe to delete — not shared with other entities)
                    orphan_attrs = session.execute(
                        text(
                            "SELECT DISTINCT s.attributes_id FROM states s "
                            "WHERE s.metadata_id = :mid "
                            "  AND s.attributes_id IS NOT NULL "
                            "  AND NOT EXISTS ("
                            "    SELECT 1 FROM states s2 "
                            "    WHERE s2.attributes_id = s.attributes_id "
                            "      AND s2.metadata_id != :mid"
                            "  )"
                        ),
                        {"mid": metadata_id},
                    ).fetchall()
                    attr_ids = [r[0] for r in orphan_attrs]

                    # Delete states rows
                    # MySQL/MariaDB: old_state_id FK constraint requires nullifying
                    # references before deletion. SQLite doesn't enforce FKs by default
                    # so this is a no-op there but essential for MySQL.
                    session.execute(
                        text(
                            "UPDATE states SET old_state_id = NULL "
                            "WHERE old_state_id IN ("
                            "  SELECT state_id FROM (SELECT state_id FROM states WHERE metadata_id = :mid) AS t"
                            ")"
                        ),
                        {"mid": metadata_id},
                    )
                    r = session.execute(
                        text("DELETE FROM states WHERE metadata_id = :mid"),
                        {"mid": metadata_id},
                    )
                    counts["states"] = r.rowcount

                    # Delete orphaned state_attributes (only after states are gone)
                    if attr_ids:
                        # Use bound parameters to prevent SQL injection.
                        # Build named placeholders :a0, :a1, … for each id.
                        ph = ", ".join(f":a{i}" for i in range(len(attr_ids)))
                        params = {f"a{i}": aid for i, aid in enumerate(attr_ids)}
                        r = session.execute(
                            text(
                                f"DELETE FROM state_attributes "
                                f"WHERE attributes_id IN ({ph})"
                            ),
                            params,
                        )
                        counts["state_attributes"] = r.rowcount

                    # Delete states_meta row
                    r = session.execute(
                        text("DELETE FROM states_meta WHERE metadata_id = :mid"),
                        {"mid": metadata_id},
                    )
                    counts["states_meta"] = r.rowcount

                # ── 2. statistics / statistics_short_term / statistics_meta ─
                stat_row = session.execute(
                    text(
                        "SELECT id FROM statistics_meta "
                        "WHERE statistic_id = :eid AND source = 'recorder'"
                    ),
                    {"eid": eid},
                ).fetchone()

                if stat_row:
                    stat_meta_id = stat_row[0]
                    r = session.execute(
                        text("DELETE FROM statistics WHERE metadata_id = :mid"),
                        {"mid": stat_meta_id},
                    )
                    counts["statistics"] = r.rowcount
                    r = session.execute(
                        text("DELETE FROM statistics_short_term WHERE metadata_id = :mid"),
                        {"mid": stat_meta_id},
                    )
                    counts["statistics_short_term"] = r.rowcount
                    r = session.execute(
                        text("DELETE FROM statistics_meta WHERE id = :mid"),
                        {"mid": stat_meta_id},
                    )
                    counts["statistics_meta"] = r.rowcount

                _LOGGER.warning("[HACA Purge] Staged '%s': %s", eid, counts)
                deleted[eid] = counts

            # ── Single atomic commit for ALL entities ────────────────────
            # Committing here (not inside the loop) means either ALL deletions
            # land together or none do if an exception occurs above.
            session.commit()
            _LOGGER.warning("[HACA Purge] Committed %d entities: %s", len(deleted), list(deleted.keys()))

            # ── Force WAL checkpoint so next DB readers see our deletes ──
            # Without this, SQLite WAL mode means our committed deletes stay in
            # the WAL file and other sessions may still read old data until the
            # automatic checkpoint threshold (1000 pages) is reached.
            try:
                with instance.engine.connect() as conn:
                    result = conn.execute(text("PRAGMA wal_checkpoint(TRUNCATE)"))
                    row = result.fetchone()
                    _LOGGER.warning(
                        "[HACA Purge] WAL checkpoint: busy=%s, log=%s, checkpointed=%s",
                        row[0] if row else "?",
                        row[1] if row else "?",
                        row[2] if row else "?",
                    )
            except Exception as wal_exc:
                # Non-fatal: checkpoint failure doesn't undo our already-committed deletes
                _LOGGER.warning("[HACA Purge] WAL checkpoint failed (non-fatal): %s", wal_exc)

        except Exception as exc:
            session.rollback()
            _LOGGER.warning("[HACA Purge] SQL error — rolled back ALL %d entities: %s", len(entity_ids), exc, exc_info=True)
            raise
        finally:
            session.close()

        return deleted

    try:
        result = await instance.async_add_executor_job(_do_purge, instance)
        _LOGGER.warning("[HACA Purge] Complete. Summary: %s", result)

        purged_set = set(entity_ids)

        try:
            entries = hass.config_entries.async_entries(DOMAIN)
            if entries:
                domain_data = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {})

                # ── 1. Mark purged in RecorderAnalyzer cache ──────────────
                # Protects against stale WAL reads on the next scheduled scan
                # (belt-and-suspenders alongside the BEGIN IMMEDIATE fix).
                rec_analyzer = domain_data.get("recorder_analyzer")
                if rec_analyzer:
                    rec_analyzer.mark_purged(entity_ids)

                # ── 2. Patch coordinator.data immediately ─────────────────
                # Any haca/get_data call between now and the next full scan
                # would otherwise return stale orphan data from coordinator.data.
                # We remove the purged entities from the cached list right now
                # so the frontend sees clean data without waiting for a rescan.
                coordinator = domain_data.get("coordinator")
                if coordinator and coordinator.data:
                    cached = coordinator.data
                    old_orphans = cached.get("recorder_orphans", [])
                    new_orphans = [o for o in old_orphans if o["entity_id"] not in purged_set]
                    new_mb = round(sum(o["est_mb"] for o in new_orphans), 2)
                    coordinator.data = {
                        **cached,
                        "recorder_orphans":      new_orphans,
                        "recorder_orphan_count": len(new_orphans),
                        "recorder_wasted_mb":    new_mb,
                    }
                    _LOGGER.debug(
                        "[HACA Purge] coordinator.data patched: %d → %d orphan(s)",
                        len(old_orphans), len(new_orphans),
                    )

        except Exception as cache_exc:
            _LOGGER.debug("[HACA Purge] Could not patch coordinator cache: %s", cache_exc)

        connection.send_result(
            msg["id"],
            {"purged": len(entity_ids), "entity_ids": entity_ids, "detail": result},
        )
    except Exception as exc:
        _LOGGER.warning("[HACA Purge] Executor error: %s", exc)
        connection.send_error(msg["id"], "purge_failed", str(exc))



@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/get_history",
        vol.Optional("limit", default=90): int,
    }
)
@websocket_api.async_response
async def handle_get_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return audit history snapshots for the history tab / sparkline."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_result(msg["id"], {"history": []})
            return

        domain_data = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {})
        history_manager = domain_data.get("history_manager")

        if not history_manager:
            connection.send_result(msg["id"], {"history": []})
            return

        limit = min(msg.get("limit", 90), 365)
        history = await history_manager.async_get_history(limit)
        connection.send_result(msg["id"], {"history": history})
    except Exception as exc:
        _LOGGER.error("HACA get_history error: %s", exc)
        connection.send_error(msg["id"], "history_error", str(exc))


@websocket_api.websocket_command({
    vol.Required("type"): "haca/delete_history",
    vol.Required("timestamps"): [str],
})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_delete_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Supprime des entrées de l'historique par timestamp."""
    domain_data = hass.data.get(DOMAIN, {})
    if not domain_data:
        connection.send_error(msg["id"], "not_ready", "HACA not initialized")
        return
    entry_id = next(iter(domain_data), None)
    data = domain_data.get(entry_id, {}) if entry_id else {}
    history_manager = data.get("history_manager")
    if not history_manager:
        connection.send_error(msg["id"], "no_history", "History manager unavailable")
        return
    try:
        timestamps = msg["timestamps"]
        deleted = await history_manager.async_delete_entries(timestamps)
        connection.send_result(msg["id"], {"deleted": deleted})
    except Exception as exc:
        _LOGGER.error("HACA delete_history error: %s", exc)
        connection.send_error(msg["id"], "delete_error", str(exc))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/get_translations",
        vol.Optional("language"): str,
    }
)
@websocket_api.async_response
async def handle_get_translations(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle get translations request for the panel."""
    try:
        # Language comes from the frontend (= user profile language, not system language)
        language = msg.get("language") or hass.config.language or "en"
        # Store so all backend components use the same language
        hass.data.setdefault(DOMAIN, {})["user_language"] = language
        _LOGGER.debug("HACA: user language = %s", language)
        
        # Build path to translations file
        integration_path = Path(__file__).parent
        translations_file = integration_path / "translations" / f"{language}.json"
        
        # Fallback to English if the language file doesn't exist
        if not translations_file.exists():
            translations_file = integration_path / "translations" / "en.json"
            _LOGGER.debug("Translation file for %s not found, falling back to English", language)
        
        # Load translations (in executor to avoid blocking the event loop)
        translations = {}
        if translations_file.exists():
            try:
                def _read_translations():
                    with open(translations_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
                translations = await hass.async_add_executor_job(_read_translations)
            except Exception as e:
                _LOGGER.error("Error loading translations: %s", e)
        
        # Extract panel translations
        panel_translations = translations.get("panel", {})
        
        connection.send_result(
            msg["id"],
            {
                "language": language,
                "translations": panel_translations,
            },
        )
        
    except Exception as e:
        _LOGGER.error("Error getting translations: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/explain_issue",
        vol.Required("issue"): dict,
    }
)
@websocket_api.async_response
async def handle_explain_issue(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Explain a HACA issue using AI (IA locale ou fallback textuel)."""
    try:
        from .conversation import explain_issue_ai
        issue_data = msg.get("issue", {})
        explanation = await explain_issue_ai(hass, issue_data)
        connection.send_result(msg["id"], {"explanation": explanation})
    except Exception as e:
        _LOGGER.error("Error in haca/explain_issue: %s", e, exc_info=True)
        connection.send_error(msg["id"], "error", str(e))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/ai_suggest_fix",
        vol.Required("issue"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_ai_suggest_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Génère par IA la valeur manquante pour une issue simple (description, alias…).

    Retourne {field, suggestion, entity_id} — pas de modification effectuée.
    L'utilisateur peut éditer la suggestion dans la modale avant d'appliquer.
    """
    from pathlib import Path as _Path
    import yaml as _yaml
    from .conversation import _async_call_ai

    issue      = msg.get("issue", {})
    issue_type = issue.get("type", "")
    entity_id  = issue.get("entity_id", "")
    alias      = issue.get("alias") or entity_id

    # ── Déterminer le champ cible ────────────────────────────────────────
    FIELD_MAP = {
        "no_description": "description",
        "no_alias":       "alias",
    }
    field = FIELD_MAP.get(issue_type)
    if not field:
        connection.send_error(msg["id"], "unsupported_type",
                              f"Issue type '{issue_type}' n'est pas une correction simple")
        return

    # ── Lire le YAML de l'automation/script ─────────────────────────────
    yaml_snippet = ""
    try:
        is_script = entity_id.startswith("script.")
        target = _Path(hass.config.config_dir) / ("scripts.yaml" if is_script else "automations.yaml")
        slug   = entity_id.split(".", 1)[-1]

        def _read_yaml():
            data = _yaml.safe_load(target.read_text(encoding="utf-8")) or []
            if not isinstance(data, list):
                data = [data]
            for item in data:
                if not isinstance(item, dict):
                    continue
                if (item.get("alias") == alias
                        or str(item.get("id", "")) == slug
                        or item.get("alias", "").lower().replace(" ", "_") == slug):
                    return _yaml.dump(item, allow_unicode=True, default_flow_style=False)
            return ""

        yaml_snippet = await hass.async_add_executor_job(_read_yaml)
    except Exception as exc:
        _LOGGER.debug("[HACA suggest] Could not read YAML for %s: %s", entity_id, exc)

    # ── Construire le prompt ─────────────────────────────────────────────
    lang = hass.config.language or "fr"

    if field == "description":
        prompt = (
            f"You are a Home Assistant expert. Generate a concise, helpful description "
            f"(1–2 sentences, max 120 characters) for this {'script' if entity_id.startswith('script.') else 'automation'}.\n"
            f"Name: {alias}\n"
        )
        if yaml_snippet:
            prompt += f"YAML:\n```yaml\n{yaml_snippet[:2000]}\n```\n"
        prompt += (
            f"Respond in {lang}. "
            f"Return ONLY the description text — no quotes, no explanation, no prefix."
        )
    elif field == "alias":
        prompt = (
            f"You are a Home Assistant expert. Generate a short, clear alias (name) "
            f"for this {'script' if entity_id.startswith('script.') else 'automation'}.\n"
            f"Entity ID: {entity_id}\n"
        )
        if yaml_snippet:
            prompt += f"YAML:\n```yaml\n{yaml_snippet[:2000]}\n```\n"
        prompt += (
            f"Respond in {lang}. "
            f"Return ONLY the alias text — no quotes, no explanation."
        )

    # ── Appeler l'IA ─────────────────────────────────────────────────────
    try:
        suggestion = await _async_call_ai(hass, prompt, "HACA Simple Fix")
        suggestion = suggestion.strip().strip('"').strip("'")
        if not suggestion:
            connection.send_error(msg["id"], "no_suggestion", "L'IA n'a pas retourné de suggestion")
            return
        connection.send_result(msg["id"], {
            "field":     field,
            "suggestion": suggestion,
            "entity_id": entity_id,
        })
    except Exception as exc:
        _LOGGER.error("[HACA suggest] AI error: %s", exc)
        connection.send_error(msg["id"], "ai_error", str(exc))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/apply_field_fix",
        vol.Required("entity_id"): str,
        vol.Required("field"): str,
        vol.Required("value"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_apply_field_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Applique une correction simple (description, alias) directement dans le YAML.

    Pas de sauvegarde — l'opération est non-destructive (on ajoute/modifie un champ texte).
    Recharge les automations/scripts après modification.
    """
    # Rate-limit: prevent spamming YAML writes
    user_id = connection.user.id if connection.user else "anon"
    if _rate_limited(f"apply_field_fix:{user_id}"):
        connection.send_error(msg["id"], "rate_limited", "Too many requests — please wait a moment")
        return

    from pathlib import Path as _Path
    import yaml as _yaml

    entity_id = msg["entity_id"]
    field     = msg["field"]
    value     = msg["value"].strip()

    if field not in ("description", "alias"):
        connection.send_error(msg["id"], "unsupported_field", f"Champ '{field}' non supporté")
        return

    is_script  = entity_id.startswith("script.")
    target     = _Path(hass.config.config_dir) / ("scripts.yaml" if is_script else "automations.yaml")
    slug       = entity_id.split(".", 1)[-1]
    domain     = "script" if is_script else "automation"

    def _apply():
        raw  = target.read_text(encoding="utf-8")
        data = _yaml.safe_load(raw) or []
        if not isinstance(data, list):
            data = [data]

        # Matching par priorité décroissante (même logique que les outils MCP) :
        # 1. id HA numérique exact
        # 2. entity_id slug exact  (ex: "automation.lumiere_salon" → slug "lumiere_salon")
        # 3. alias exact (case-sensitive, puis case-insensitive)
        #
        # Le fallback msg.get("alias", item_alias) était supprimé car il matchait
        # systématiquement le premier élément quand l'alias n'était pas fourni.
        alias_provided = msg.get("alias", "").strip()

        found_item = None
        # Pass 1 — id numérique exact
        for item in data:
            if not isinstance(item, dict):
                continue
            if str(item.get("id", "")).strip() == slug:
                found_item = item
                break

        # Pass 2 — alias exact (case-sensitive puis insensitive)
        if found_item is None and alias_provided:
            for sensitive in (True, False):
                for item in data:
                    if not isinstance(item, dict):
                        continue
                    a = item.get("alias", "")
                    if (a if sensitive else a.lower()) == \
                       (alias_provided if sensitive else alias_provided.lower()):
                        found_item = item
                        break
                if found_item is not None:
                    break

        if found_item is None:
            raise ValueError(
                f"Automation/script '{entity_id}' (alias={alias_provided!r}) "
                f"introuvable dans {target.name}. "
                f"Check that entity_id and alias are correct."
            )

        found_item[field] = value
        matched = True  # noqa: F841 — kept for clarity

        # Écriture atomique — évite la corruption si HA crashe pendant l'écriture
        import os as _os
        _tmp = str(target) + ".tmp"
        try:
            with open(_tmp, "w", encoding="utf-8") as _fh:
                _fh.write(_yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False))
            _os.replace(_tmp, str(target))
        except Exception:
            try: _os.unlink(_tmp)
            except OSError: pass
            raise

    try:
        await hass.async_add_executor_job(_apply)
        # Recharger pour que HA prenne en compte
        await hass.services.async_call(domain, "reload", {}, blocking=True)
        connection.send_result(msg["id"], {"success": True, "field": field, "value": value})
    except Exception as exc:
        _LOGGER.error("[HACA apply_field_fix] %s: %s", entity_id, exc)
        connection.send_error(msg["id"], "apply_error", str(exc))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/chat",
        vol.Required("message"): str,
        vol.Optional("conversation_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_chat(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Chat IA avec fallback automatique entre tous les agents configurés dans HA.

    L'agent préféré (pipeline Assist) est essayé en premier.
    Si il échoue (quota épuisé, timeout, erreur), HACA tente les autres agents
    disponibles dans l'ordre : Gemini, Llama, etc.

    Chaque agent doit avoir le LLM API HACA activé pour utiliser les 58 outils :
      HA Settings → Voice Assistants → [agent] → LLM API → HACA
    """
    from homeassistant.core import Context
    from homeassistant.components.conversation import async_converse
    from .conversation import _async_find_all_conversation_agents, _is_llm_error_reply
    import inspect as _inspect

    user_msg = msg["message"].strip()
    conv_id  = msg.get("conversation_id")

    if not user_msg:
        connection.send_error(msg["id"], "empty_message", "Empty message")
        return

    # Tous les agents disponibles — préféré en premier
    agents = await _async_find_all_conversation_agents(hass)
    if not agents:
        connection.send_result(
            msg["id"],
            {"reply": _ts(hass, "misc", "no_ai_model"), "conversation_id": conv_id, "agent_id": None},
        )
        return

    # Préparer les kwargs async_converse une seule fois
    params = set(_inspect.signature(async_converse).parameters)

    def _make_kwargs(agent_id: str) -> dict:
        kw: dict = {
            "hass": hass,
            "text": user_msg,
            "conversation_id": conv_id,
            "context": Context(),
            "agent_id": agent_id,
        }
        if "language" in params:
            kw["language"] = hass.config.language or "en"
        if "device_id" in params:
            kw["device_id"] = None
        return kw

    def _extract_reply(result) -> str:
        if not result or not result.response:
            return ""
        speech = result.response.speech
        if not isinstance(speech, dict):
            return ""
        return (
            speech.get("plain", {}).get("speech", "")
            or next((v.get("speech", "") for v in speech.values() if isinstance(v, dict)), "")
        )

    last_error = ""
    for agent_id in agents:
        try:
            _LOGGER.info("[HACA Chat] Trying agent=%s msg=%.80s", agent_id, user_msg)
            result = await async_converse(**_make_kwargs(agent_id))
            reply  = _extract_reply(result)

            if not reply:
                _LOGGER.warning("[HACA Chat] %s: empty reply → trying next", agent_id)
                continue

            if _is_llm_error_reply(reply):
                _LOGGER.warning("[HACA Chat] %s: error reply (%.80s) → trying next", agent_id, reply)
                last_error = reply
                continue

            # Succès
            returned_conv_id = conv_id
            try:
                returned_conv_id = result.conversation_id or conv_id
            except Exception:
                pass

            _LOGGER.info("[HACA Chat] OK %s", agent_id)
            connection.send_result(
                msg["id"],
                {"reply": reply, "conversation_id": returned_conv_id, "agent_id": agent_id},
            )
            return

        except Exception as exc:
            last_error = str(exc)
            _LOGGER.warning("[HACA Chat] %s failed: %s → trying next", agent_id, exc)

    # Tous les agents ont échoué
    _LOGGER.error("[HACA Chat] All agents failed. Last error: %s", last_error)
    connection.send_result(
        msg["id"],
        {"reply": last_error or _ts(hass, "misc", "ai_error"), "conversation_id": conv_id, "agent_id": None},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/get_options",
    }
)
@websocket_api.async_response
async def handle_get_options(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Retourne les options courantes de l'intégration HACA."""
    entry, _ = _get_entry_data(hass)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
        return
    opts = dict(entry.options)
    connection.send_result(msg["id"], {"options": opts})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/save_options",
        vol.Required("options"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_save_options(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Sauvegarde les options HACA depuis le panel (remplace le flux options HA natif)."""
    # Rate-limit: prevent spamming config writes
    user_id = connection.user.id if connection.user else "anon"
    if _rate_limited(f"save_options:{user_id}"):
        connection.send_error(msg["id"], "rate_limited", "Too many requests — please wait a moment")
        return

    entry, _ = _get_entry_data(hass)
    if not entry:
        connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
        return

    new_options = dict(entry.options)
    incoming = msg.get("options", {})

    ALLOWED_KEYS = {
        "scan_interval", "startup_delay_seconds", "startup_scan_enabled",
        "event_monitoring_enabled", "event_debounce_seconds",
        "excluded_categories", "excluded_issue_types",
        "battery_critical", "battery_low", "battery_warning",
        "history_retention_days", "backup_enabled",
        "debug_mode",
        "excluded_compliance_types",
        "report_frequency",   # daily | weekly | monthly | never
        "repairs_enabled",    # true (default) | false — push HIGH issues to HA Repairs
        "battery_notifications_enabled",  # true (default) | false — battery persistent notifications
        "notify_high_severity",    # true (default) — persistent notification for HIGH issues
        "notify_medium_severity",  # false (default) — persistent notification for MEDIUM issues
        "notify_low_severity",     # false (default) — persistent notification for LOW issues
    }
    for key, value in incoming.items():
        if key in ALLOWED_KEYS and value is not None:  # ignorer les None (token non modifié)
            new_options[key] = value

    hass.config_entries.async_update_entry(entry, options=new_options)

    # Si debug_mode a changé, appliquer le niveau de log immédiatement
    if "debug_mode" in incoming:
        import logging as _logging
        _level = _logging.DEBUG if incoming["debug_mode"] else _logging.INFO
        _logging.getLogger("custom_components.config_auditor").setLevel(_level)
        try:
            await hass.services.async_call(
                "logger", "set_level",
                {"custom_components.config_auditor": "debug" if incoming["debug_mode"] else "info"},
                blocking=False,
            )
        except Exception:
            pass

    # Appliquer dynamiquement les options qui le permettent sans redémarrer HA
    domain_data = hass.data.get(DOMAIN, {})
    for entry_data in domain_data.values():
        if not isinstance(entry_data, dict):
            continue

        # scan_interval → mettre à jour l'intervalle du coordinator (0 = manual only)
        if "scan_interval" in incoming:
            coordinator = entry_data.get("coordinator")
            if coordinator is not None:
                from datetime import timedelta as _td
                val = int(incoming["scan_interval"])
                coordinator.update_interval = _td(minutes=max(1, val)) if val > 0 else None
                _LOGGER.info("[HACA] scan_interval updated: %s", "manual" if val == 0 else f"{val} min")

    _LOGGER.info("[HACA] Options saved via panel: %s", list(incoming.keys()))
    connection.send_result(msg["id"], {"success": True, "options": new_options})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/set_log_level",
        vol.Required("level"): vol.In(["debug", "info", "warning", "error"]),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def handle_set_log_level(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Change dynamiquement le niveau de log de tous les loggers HACA.

    Équivalent à ajouter dans configuration.yaml :
      logger:
        logs:
          custom_components.config_auditor: debug

    Mais appliqué immédiatement sans redémarrage, via le service logger de HA.
    """
    import logging
    level_str = msg["level"].upper()
    level = getattr(logging, level_str, logging.INFO)

    # Appliquer au logger parent — tous les sous-loggers héritent
    parent_logger = logging.getLogger("custom_components.config_auditor")
    parent_logger.setLevel(level)

    # Propager aussi via le service logger de HA si disponible (persiste dans les logs UI)
    try:
        await hass.services.async_call(
            "logger",
            "set_level",
            {"custom_components.config_auditor": level_str.lower()},
            blocking=False,
        )
    except Exception:
        pass  # Le service logger peut ne pas être chargé

    _LOGGER.info("[HACA] Log level set to %s for custom_components.config_auditor", level_str)
    connection.send_result(msg["id"], {"success": True, "level": level_str})


# ─── v1.4.0 WebSocket Handlers ────────────────────────────────────────────

@websocket_api.websocket_command({"type": "haca/mcp_status"})
@websocket_api.async_response
async def handle_mcp_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Retourne le statut et l'URL du serveur MCP HACA."""
    try:
        import json as _json
        base_url = hass.config.external_url or hass.config.internal_url or "http://homeassistant.local:8123"
        mcp_url = f"{base_url.rstrip('/')}/api/haca_mcp"

        claude_code_config = {
            "mcpServers": {
                "haca": {
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-proxy"],
                    "env": {
                        "MCP_SERVER_URL": mcp_url,
                        "MCP_AUTH_HEADER": "Authorization: Bearer <YOUR_HA_LONG_LIVED_TOKEN>",
                    },
                }
            }
        }
        connection.send_result(msg["id"], {
            "active": True,
            "url": "/api/haca_mcp",
            "full_url": mcp_url,
            "info_url": f"{mcp_url}/info",
            "auth": "Bearer <HA Long-Lived Access Token>",
            "tools": [
                "haca_get_score", "haca_get_issues", "haca_get_automation",
                "haca_fix_suggestion", "haca_apply_fix",
                "haca_get_batteries", "haca_explain_issue",
            ],
            "claude_code_snippet": _json.dumps(claude_code_config, indent=2, ensure_ascii=False),
        })
    except Exception as exc:
        connection.send_error(msg["id"], "mcp_error", str(exc))


@websocket_api.websocket_command({"type": "haca/agent_status"})
@websocket_api.async_response
async def handle_agent_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Retourne le statut de l'agent IA proactif."""
    try:
        from .proactive_agent import get_agent
        agent = get_agent(hass)

        if not agent:
            connection.send_result(msg["id"], {"active": False, "correlations": []})
            return

        correlations = await agent.analyze_correlations()
        prefs = agent.get_preferences()

        entries = hass.config_entries.async_entries(DOMAIN)
        entry_data = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {}) if entries else {}
        last_report = entry_data.get("last_weekly_report")
        entry = entries[0] if entries else None
        report_frequency = entry.options.get("report_frequency", "weekly") if entry else "weekly"

        connection.send_result(msg["id"], {
            "active": True,
            "correlations": correlations[:10],
            "last_weekly_report": last_report,
            "preferred_fix_types": prefs.get_preferred_fix_types(),
            "report_frequency": report_frequency,
        })
    except Exception as exc:
        connection.send_error(msg["id"], "agent_error", str(exc))


@websocket_api.websocket_command({"type": "haca/agent_force_report"})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_agent_force_report(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Force l'envoi immédiat du rapport hebdomadaire et retourne le contenu MD."""
    try:
        from .proactive_agent import get_agent
        agent = get_agent(hass)
        if not agent:
            connection.send_error(msg["id"], "no_agent", "Agent not running")
            return
        # Reset last report date pour forcer l'envoi
        entries = hass.config_entries.async_entries(DOMAIN)
        entry_data: dict = {}
        if entries:
            entry_data = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {})
            entry_data.pop("last_weekly_report", None)
            entry_data.pop("last_report_markdown", None)

        await agent._check_weekly_report_async()

        # Récupérer le markdown généré
        markdown = entry_data.get("last_report_markdown", "")
        report_file = entry_data.get("last_report_file", "")
        filename = ""
        if report_file:
            from pathlib import Path
            filename = Path(report_file).name

        connection.send_result(msg["id"], {
            "success": True,
            "markdown": markdown,
            "filename": filename,
            "report_file": report_file,
        })
    except Exception as exc:
        connection.send_error(msg["id"], "force_report_error", str(exc))


@websocket_api.websocket_command({
    vol.Required("type"): "haca/record_fix_outcome",
    vol.Required("issue_type"): str,
    vol.Required("accepted"): bool,
})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_record_fix_outcome(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Enregistre si un fix a été accepté ou refusé (apprentissage agent)."""
    try:
        from .proactive_agent import get_agent
        agent = get_agent(hass)
        if agent:
            agent.record_fix_outcome(msg["issue_type"], msg["accepted"])
        connection.send_result(msg["id"], {"success": True})
    except Exception as exc:
        connection.send_error(msg["id"], "outcome_error", str(exc))


# ═══════════════════════════════════════════════════════════════════════════════
#  v1.5.0 — WebSocket handlers
# ═══════════════════════════════════════════════════════════════════════════════

def _get_entry_data(hass) -> tuple:
    """Return (entry, entry_data_dict) or (None, None).

    Centralises the repeated entries[0] + hass.data[DOMAIN][entry_id] lookup
    that appears in almost every WebSocket handler.
    """
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return None, None
    entry = entries[0]
    data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    return entry, data


def _get_coordinator(hass):
    """Helper: return (entry, coordinator) or (None, None)."""
    entry, data = _get_entry_data(hass)
    if not data:
        return None, None
    return entry, data.get("coordinator")


# ── Battery predictions ────────────────────────────────────────────────────────

@websocket_api.websocket_command({vol.Required("type"): "haca/get_battery_predictions"})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_get_battery_predictions(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return battery discharge predictions."""
    try:
        entry, coord = _get_coordinator(hass)
        if not coord:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        data = coord.data or {}
        connection.send_result(msg["id"], {
            "predictions": data.get("battery_predictions", []),
            "alert_7d":    data.get("battery_alert_7d", 0),
        })
    except Exception as exc:
        connection.send_error(msg["id"], "prediction_error", str(exc))


@websocket_api.websocket_command({vol.Required("type"): "haca/export_battery_csv"})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_export_battery_csv(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return full battery history as CSV string."""
    try:
        from .const import MODULE_18_BATTERY_PREDICTOR
        if not MODULE_18_BATTERY_PREDICTOR:
            connection.send_result(msg["id"], {"csv": "date,entity_id,level\n"})
            return
        from .battery_predictor import BatteryPredictor
        predictor = BatteryPredictor(hass)
        csv_data = await predictor.async_export_csv()
        connection.send_result(msg["id"], {"csv": csv_data})
    except Exception as exc:
        connection.send_error(msg["id"], "csv_error", str(exc))


# ── Area complexity ────────────────────────────────────────────────────────────

@websocket_api.websocket_command({vol.Required("type"): "haca/get_area_complexity"})
@websocket_api.async_response
async def handle_get_area_complexity(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return area complexity heatmap data."""
    try:
        entry, coord = _get_coordinator(hass)
        if not coord:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        data = coord.data or {}
        connection.send_result(msg["id"], data.get("area_complexity", {}))
    except Exception as exc:
        connection.send_error(msg["id"], "area_error", str(exc))


# ── Redundancy ─────────────────────────────────────────────────────────────────

@websocket_api.websocket_command({vol.Required("type"): "haca/get_redundancy"})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_get_redundancy(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return redundancy analysis results."""
    try:
        entry, coord = _get_coordinator(hass)
        if not coord:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        data = coord.data or {}
        connection.send_result(msg["id"], data.get("redundancy", {}))
    except Exception as exc:
        connection.send_error(msg["id"], "redundancy_error", str(exc))


# ── Recorder impact ────────────────────────────────────────────────────────────

@websocket_api.websocket_command({vol.Required("type"): "haca/get_recorder_impact"})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_get_recorder_impact(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return recorder DB impact analysis."""
    try:
        entry, coord = _get_coordinator(hass)
        if not coord:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        data = coord.data or {}
        connection.send_result(msg["id"], data.get("recorder_impact", {}))
    except Exception as exc:
        connection.send_error(msg["id"], "recorder_impact_error", str(exc))


# ── History diff ───────────────────────────────────────────────────────────────

@websocket_api.websocket_command({
    vol.Required("type"): "haca/get_history_diff",
    vol.Required("ts"): str,      # timestamp of the scan to diff
})
@websocket_api.require_admin
@websocket_api.async_response
async def handle_get_history_diff(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return diff between a scan and its predecessor (new/resolved issues)."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return
        entry = entries[0]
        coord_data = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
        history_manager = coord_data.get("history_manager")
        if not history_manager:
            connection.send_result(msg["id"], {"diff": None, "error": "history_not_available"})
            return

        history = await history_manager.async_get_history(limit=365)
        target_ts = msg["ts"]

        # Find target and predecessor
        target = next((h for h in history if h.get("ts") == target_ts), None)
        if not target:
            connection.send_error(msg["id"], "not_found", f"Scan {target_ts} not found")
            return

        target_idx = history.index(target)
        predecessor = history[target_idx - 1] if target_idx > 0 else None

        if not predecessor:
            connection.send_result(msg["id"], {
                "target": target,
                "predecessor": None,
                "diff": None,
            })
            return

        # Compute diff on issue counts per category
        categories = ["automation", "script", "scene", "entity", "performance",
                      "security", "blueprint", "dashboard"]
        diff = {}
        for cat in categories:
            old_val = predecessor.get(cat, 0)
            new_val = target.get(cat, 0)
            diff[cat] = {
                "old": old_val,
                "new": new_val,
                "delta": new_val - old_val,
            }

        # Top issues diff (new issues vs resolved)
        prev_top_ids = {i.get("entity_id") + i.get("type", "") for i in (predecessor.get("top_issues") or [])}
        curr_top     = target.get("top_issues") or []

        new_issues      = [i for i in curr_top if (i.get("entity_id", "") + i.get("type", "")) not in prev_top_ids]
        prev_top        = predecessor.get("top_issues") or []
        curr_top_ids    = {i.get("entity_id") + i.get("type", "") for i in curr_top}
        resolved_issues = [i for i in prev_top if (i.get("entity_id", "") + i.get("type", "")) not in curr_top_ids]

        connection.send_result(msg["id"], {
            "target":      target,
            "predecessor": predecessor,
            "diff":        diff,
            "new_issues":      new_issues,
            "resolved_issues": resolved_issues,
            "score_delta": target.get("score", 0) - predecessor.get("score", 0),
        })
    except Exception as exc:
        _LOGGER.warning("History diff error: %s", exc)
        connection.send_error(msg["id"], "diff_error", str(exc))



