"""WebSocket API pour H.A.C.A."""
from __future__ import annotations

import logging
import json
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.translation import async_get_translations

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register WebSocket handlers."""
    websocket_api.async_register_command(hass, handle_get_data)
    websocket_api.async_register_command(hass, handle_scan_all)
    websocket_api.async_register_command(hass, handle_preview_fix)
    websocket_api.async_register_command(hass, handle_apply_fix)
    websocket_api.async_register_command(hass, handle_list_backups)
    websocket_api.async_register_command(hass, handle_restore_backup)
    websocket_api.async_register_command(hass, handle_get_translations)
    websocket_api.async_register_command(hass, handle_purge_recorder_orphans)
    websocket_api.async_register_command(hass, handle_get_history)
    websocket_api.async_register_command(hass, handle_delete_history)
    websocket_api.async_register_command(hass, handle_chat)
    websocket_api.async_register_command(hass, handle_get_options)
    websocket_api.async_register_command(hass, handle_save_options)
    websocket_api.async_register_command(hass, handle_set_log_level)
    _LOGGER.info("✅ WebSocket handlers registered")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/get_data",
        vol.Optional("limit", default=200): int,
        vol.Optional("offset", default=0): int,
        vol.Optional("category"): vol.In([
            "automation", "script", "scene", "blueprint",
            "entity", "performance", "security", "dashboard"
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
        # Get coordinator data
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
        
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
                "total_issues":         cdata.get("total_issues", 0),
                # Paginated lists
                "automation_issue_list":    _paginate(auto_list)   if not category or category == "automation"  else auto_list,
                "script_issue_list":        _paginate(script_list) if not category or category == "script"      else script_list,
                "scene_issue_list":         _paginate(scene_list)  if not category or category == "scene"       else scene_list,
                "blueprint_issue_list":     _paginate(bp_list)     if not category or category == "blueprint"   else bp_list,
                "entity_issue_list":        _paginate(ent_list)    if not category or category == "entity"      else ent_list,
                "performance_issue_list":   _paginate(perf_list)   if not category or category == "performance" else perf_list,
                "security_issue_list":      _paginate(sec_list)    if not category or category == "security"    else sec_list,
                "dashboard_issue_list":     _paginate(dash_list)   if not category or category == "dashboard"   else dash_list,
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
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
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
@websocket_api.async_response
async def handle_preview_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle preview fix request."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
        refactoring = data.get("refactoring_assistant")
        
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
@websocket_api.async_response
async def handle_apply_fix(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle apply fix request."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
        refactoring = data.get("refactoring_assistant")
        
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
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
        refactoring = data.get("refactoring_assistant")
        
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
@websocket_api.async_response
async def handle_restore_backup(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle restore backup request."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
            return

        entry = entries[0]
        data = hass.data[DOMAIN].get(entry.entry_id)
        refactoring = data.get("refactoring_assistant")
        
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

        Transaction strategy
        --------------------
        All entities are processed inside a SINGLE session.  ``commit()`` is
        called once at the very end so that either ALL deletions succeed or NONE
        are persisted (a single ``rollback()`` in the except branch undoes
        everything).

        Note on state_attributes: rows are shared/deduped by hash across entities.
        We delete only attributes_id values that are NOT referenced by any OTHER
        states row, to avoid breaking other entities.
        """
        from sqlalchemy import text

        deleted = {}
        session = instance.get_session()
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
                    r = session.execute(
                        text("DELETE FROM states WHERE metadata_id = :mid"),
                        {"mid": metadata_id},
                    )
                    counts["states"] = r.rowcount

                    # Delete orphaned state_attributes (only after states are gone)
                    if attr_ids:
                        placeholders = ",".join(str(a) for a in attr_ids)
                        r = session.execute(
                            text(
                                f"DELETE FROM state_attributes "
                                f"WHERE attributes_id IN ({placeholders})"
                            )
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
        vol.Required("type"): "haca/chat",
        vol.Required("message"): str,
        vol.Optional("conversation_id"): str,
    }
)
@websocket_api.async_response
async def handle_chat(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Forward a message to the HA AI configured in Settings → General → AI Suggestion.

    Uses ai_task.generate_data exclusively (conversation.async_converse is deprecated).
    Injects current HACA health context (score, issue counts, top-5 issues) so the
    LLM can give relevant answers about the user's HA configuration.
    """
    from .conversation import _async_find_ai_task_entity, _async_call_ai

    user_msg = msg["message"].strip()
    conv_id  = msg.get("conversation_id")

    if not user_msg:
        connection.send_error(msg["id"], "empty_message", "Empty message")
        return

    # Check an ai_task entity is available
    entity_id = await _async_find_ai_task_entity(hass)
    if not entity_id:
        connection.send_result(
            msg["id"],
            {
                "reply": (
                    "⚠️ Aucun service IA (ai_task) n'est configuré dans Home Assistant.\n\n"
                    "Rendez-vous dans **Paramètres → Général → Suggestion de l'IA** "
                    "pour configurer OpenAI, Gemini ou Ollama."
                ),
                "conversation_id": conv_id,
                "agent_id": None,
            },
        )
        return

    # Build HACA context prefix
    try:
        entries    = hass.config_entries.async_entries(DOMAIN)
        cdata_raw  = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {}) if entries else {}
        coordinator = cdata_raw.get("coordinator")
        cdata       = coordinator.data if coordinator and coordinator.data else {}

        score        = cdata.get("health_score", "?")
        total_issues = cdata.get("total_issues", "?")
        auto_issues  = cdata.get("automation_issues", 0)
        ent_issues   = cdata.get("entity_issues", 0)
        sec_issues   = cdata.get("security_issues", 0)
        perf_issues  = cdata.get("performance_issues", 0)

        all_issues = (
            list(cdata.get("automation_issue_list", []))
            + list(cdata.get("entity_issue_list", []))
            + list(cdata.get("security_issue_list", []))
        )
        sev_order = {"high": 0, "medium": 1, "low": 2}
        top5 = sorted(all_issues, key=lambda i: sev_order.get(i.get("severity", "low"), 2))[:5]
        top5_txt = "\n".join(
            f"  - [{i.get('severity', '?').upper()}] "
            f"{i.get('alias') or i.get('entity_id', '?')}: "
            f"{(i.get('message') or '')[:120]}"
            for i in top5
        ) or "  Aucune issue détectée."

        context_prefix = (
            f"[Contexte H.A.C.A — score {score}/100 | "
            f"{total_issues} issue(s) : automations={auto_issues}, "
            f"entités={ent_issues}, sécurité={sec_issues}, perf={perf_issues}]\n"
            f"Top issues :\n{top5_txt}\n\n"
        )
        full_prompt = context_prefix + user_msg
    except Exception:
        full_prompt = user_msg

    try:
        reply = await _async_call_ai(hass, full_prompt, "HACA Chat")
        connection.send_result(
            msg["id"],
            {
                "reply":           reply or "⚠️ Tous les services IA ont échoué (quota atteint ou service indisponible). Vérifiez votre configuration IA dans HA Paramètres → Général → Suggestion de l'IA.",
                "conversation_id": conv_id,
                "agent_id":        entity_id,
            },
        )
    except Exception as exc:
        _LOGGER.error("[HACA Chat] ai_task error: %s", exc)
        connection.send_error(msg["id"], "chat_error", str(exc))


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
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
        return
    entry = entries[0]
    connection.send_result(msg["id"], {"options": dict(entry.options)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/save_options",
        vol.Required("options"): dict,
    }
)
@websocket_api.async_response
async def handle_save_options(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Sauvegarde les options HACA depuis le panel (remplace le flux options HA natif)."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        connection.send_error(msg["id"], "no_entry", "No H.A.C.A entry found")
        return
    entry = entries[0]

    new_options = dict(entry.options)
    incoming = msg.get("options", {})

    ALLOWED_KEYS = {
        "scan_interval", "startup_delay_seconds",
        "event_monitoring_enabled", "event_debounce_seconds",
        "excluded_categories", "excluded_issue_types",
        "battery_critical", "battery_low", "battery_warning",
        "history_retention_days", "backup_enabled",
        "debug_mode",
    }
    for key, value in incoming.items():
        if key in ALLOWED_KEYS:
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

        # scan_interval → mettre à jour l'intervalle du coordinator
        if "scan_interval" in incoming:
            coordinator = entry_data.get("coordinator")
            if coordinator is not None:
                from datetime import timedelta as _td
                coordinator.update_interval = _td(minutes=max(1, int(incoming["scan_interval"])))
                _LOGGER.info("[HACA] scan_interval mis à jour dynamiquement : %s min", incoming["scan_interval"])

    _LOGGER.info("[HACA] Options saved via panel: %s", list(incoming.keys()))
    connection.send_result(msg["id"], {"success": True, "options": new_options})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "haca/set_log_level",
        vol.Required("level"): vol.In(["debug", "info", "warning", "error"]),
    }
)
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

