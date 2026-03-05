"""Service handlers for H.A.C.A.

Extracted from __init__.py to keep the main setup file focused on
entry lifecycle (setup, unload, reload).

All services are registered via ``async_setup_services(hass, entry)``,
which is called once from async_setup_entry.
"""
from __future__ import annotations


from .translation_utils import TranslationHelper

import asyncio
import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.config_entries import ConfigEntry
from homeassistant import config_entries as ce
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN,
    MODULE_4_COMPLIANCE_REPORT,
    MODULE_5_REFACTORING_ASSISTANT,
    MODULE_9_DASHBOARD_ANALYZER,
    SERVICE_SCAN_ALL,
    SERVICE_SCAN_AUTOMATIONS,
    SERVICE_SCAN_ENTITIES,
    SERVICE_GENERATE_REPORT,
    SERVICE_LIST_REPORTS,
    SERVICE_GET_REPORT_CONTENT,
    SERVICE_PREVIEW_DEVICE_ID,
    SERVICE_FIX_DEVICE_ID,
    SERVICE_PREVIEW_MODE,
    SERVICE_FIX_MODE,
    SERVICE_PREVIEW_TEMPLATE,
    SERVICE_FIX_TEMPLATE,
    SERVICE_LIST_BACKUPS,
    SERVICE_RESTORE_BACKUP,
    SERVICE_PURGE_GHOSTS,
    SERVICE_FUZZY_SUGGESTIONS,
)
from .health_score import calculate_health_score
from .conversation import explain_issue_ai, analyze_complexity_ai

# ═══════════════════════════════════════════════════════════════════════
# Helper : notifications HACA uniformes, riches et signées
# ═══════════════════════════════════════════════════════════════════════

async def _haca_notify(
    hass: HomeAssistant,
    *,
    notification_id: str,
    title: str,
    summary: str,
    detail: str = "",
    status: str = "info",   # "success" | "error" | "info" | "warning"
    extra: str = "",         # lignes Markdown supplémentaires avant signature
) -> None:
    """Crée une notification persistante H.A.C.A riche et signée.

    Args:
        notification_id: Identifiant unique (remplace si existe déjà).
        title:     Titre court affiché dans la liste.
        summary:   Ligne de résumé en gras dans le corps.
        detail:    Corps détaillé (texte ou Markdown multi-lignes).
        status:    Émoji-statut : "success" ✅, "error" ❌, "info" ℹ️, "warning" ⚠️.
        extra:     Sections Markdown optionnelles avant la signature.
    """
    icons = {"success": "✅", "error": "❌", "info": "ℹ️", "warning": "⚠️"}
    icon  = icons.get(status, "ℹ️")

    body_parts = [f"## {icon} {summary}"]
    if detail:
        body_parts.append(f"\n{detail}")
    if extra:
        body_parts.append(f"\n---\n{extra}")
    body_parts.append("\n---\n*H.A.C.A — Home Assistant Config Auditor*")

    message = "\n".join(body_parts)

    await hass.services.async_call(
        "persistent_notification",
        "create",
        {
            "notification_id": notification_id,
            "title":           title,
            "message":         message,
        },
    )


_LOGGER = logging.getLogger(__name__)

import json as _json
from pathlib import Path as _Path

def _ts(hass, section: str, key: str) -> str:
    """Synchronously get a translation string from the JSON files."""
    lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    try:
        p = _Path(__file__).parent / "translations" / f"{lang}.json"
        if not p.exists():
            p = _Path(__file__).parent / "translations" / "en.json"
        data = _json.loads(p.read_text(encoding="utf-8"))
        return data.get(section, {}).get(key, key)
    except Exception:
        return key


async def async_setup_services(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Setup all services."""
    
    _scan_lock = asyncio.Lock()

    async def handle_scan_all(call: ServiceCall) -> None:
        """Handle scan_all service."""
        if _scan_lock.locked():
            _LOGGER.warning("Scan already in progress — ignoring concurrent scan_all request")
            return
        _LOGGER.info("Starting full scan in background")

        data = hass.data[DOMAIN][entry.entry_id]
        coordinator = data["coordinator"]

        async def _locked_refresh():
            data["_scan_in_progress"] = True
            try:
                async with _scan_lock:
                    await coordinator.async_refresh()
            finally:
                data["_scan_in_progress"] = False
                hass.bus.async_fire("haca_scan_complete", {
                    "entry_id": entry.entry_id,
                    "success": True,
                })

        hass.async_create_task(_locked_refresh())
    
    async def handle_scan_automations(call: ServiceCall) -> None:
        """Handle scan_automations service."""
        _LOGGER.info("Scanning automations")
        
        data = hass.data[DOMAIN][entry.entry_id]
        automation_analyzer = data["automation_analyzer"]
        coordinator = data["coordinator"]
        
        async def _run_scan():
            await automation_analyzer.analyze_all()
            
            # Mettre à jour le coordinator avec les nouvelles données séparées
            current_data = coordinator.data or {}
            updated_data = {
                **current_data,
                "automation_issues": len(automation_analyzer.automation_issues),
                "automation_issue_list": automation_analyzer.automation_issues,
                "script_issues": len(automation_analyzer.script_issues),
                "script_issue_list": automation_analyzer.script_issues,
                "scene_issues": len(automation_analyzer.scene_issues),
                "scene_issue_list": automation_analyzer.scene_issues,
                "blueprint_issues": len(automation_analyzer.blueprint_issues),
                "blueprint_issue_list": automation_analyzer.blueprint_issues,
            }
            
            # Recalculer le health_score avec les 4 catégories
            auto_issues = updated_data.get("automation_issue_list", [])
            entity_issues = updated_data.get("entity_issue_list", [])
            perf_issues = updated_data.get("performance_issue_list", [])
            sec_issues = updated_data.get("security_issue_list", [])
            
            _n_ent  = len(list(hass.states.async_all()))
            _n_auto = (len(automation_analyzer.automation_configs)
                       + len(automation_analyzer.script_configs))
            updated_data["health_score"] = calculate_health_score(
                auto_issues, entity_issues, perf_issues, sec_issues,
                total_entities=_n_ent, total_automations=_n_auto,
            )
            updated_data["total_issues"] = (
                len(auto_issues)
                + len(updated_data.get("script_issue_list", []))
                + len(updated_data.get("scene_issue_list", []))
                + len(updated_data.get("blueprint_issue_list", []))
                + len(entity_issues) + len(perf_issues) + len(sec_issues)
            )

            coordinator.async_set_updated_data(updated_data)
            hass.bus.async_fire("haca_scan_complete", {
                "entry_id": entry.entry_id,
                "success": True,
            })

        if not _scan_lock.locked():
            hass.async_create_task(_run_scan())
        else:
            _LOGGER.warning("Scan in progress — ignoring concurrent scan_automations")
    
    async def handle_scan_entities(call: ServiceCall) -> None:
        """Handle scan_entities service."""
        _LOGGER.info("Scanning entities")
        
        data = hass.data[DOMAIN][entry.entry_id]
        entity_analyzer = data["entity_analyzer"]
        automation_analyzer = data["automation_analyzer"]
        coordinator = data["coordinator"]
        
        async def _run_scan():
            issues = await entity_analyzer.analyze_all(
                automation_analyzer.automation_configs,
                automation_analyzer.script_configs,
            )
            
            # Mettre à jour le coordinator avec les nouvelles données
            current_data = coordinator.data or {}
            updated_data = {
                **current_data,
                "entity_issues": len(issues),
                "entity_issue_list": issues,
            }
            
            # Recalculer le health_score
            auto_issues = updated_data.get("automation_issue_list", [])
            entity_issues = updated_data.get("entity_issue_list", [])
            perf_issues = updated_data.get("performance_issue_list", [])
            sec_issues = updated_data.get("security_issue_list", [])
            
            _n_ent  = len(list(hass.states.async_all()))
            _n_auto = (len(automation_analyzer.automation_configs)
                       + len(automation_analyzer.script_configs))
            updated_data["health_score"] = calculate_health_score(
                auto_issues, entity_issues, perf_issues, sec_issues,
                total_entities=_n_ent, total_automations=_n_auto,
            )
            updated_data["total_issues"] = (
                len(updated_data.get("automation_issue_list", []))
                + len(updated_data.get("script_issue_list", []))
                + len(updated_data.get("scene_issue_list", []))
                + len(updated_data.get("blueprint_issue_list", []))
                + len(entity_issues) + len(perf_issues) + len(sec_issues)
            )

            coordinator.async_set_updated_data(updated_data)
            hass.bus.async_fire("haca_scan_complete", {
                "entry_id": entry.entry_id,
                "success": True,
            })

        if not _scan_lock.locked():
            hass.async_create_task(_run_scan())
        else:
            _LOGGER.warning("Scan in progress — ignoring concurrent scan_entities")

    # Module 4: Report services
    if MODULE_4_COMPLIANCE_REPORT:
        async def handle_generate_report(call: ServiceCall) -> None:
            """Handle generate_report service."""
            _LOGGER.info("Generating report")
            
            data = hass.data[DOMAIN][entry.entry_id]
            coordinator = data["coordinator"]
            report_gen = data["report_generator"]
            
            # Get the current language from Home Assistant
            language = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
            
            summary = {
                "health_score": coordinator.data.get("health_score", 0),
                "automation_issues": coordinator.data.get("automation_issues", 0),
                "entity_issues": coordinator.data.get("entity_issues", 0),
                "total_issues": coordinator.data.get("total_issues", 0),
                "script_issues": coordinator.data.get("script_issues", 0),
                "scene_issues": coordinator.data.get("scene_issues", 0),
                "performance_issues": coordinator.data.get("performance_issues", 0),
                "security_issues": coordinator.data.get("security_issues", 0),
            }
            
            # Use generate_all_reports to ensure all formats have the same timestamp
            result = await report_gen.generate_all_reports(
                summary,
                coordinator.data.get("automation_issue_list", []),
                coordinator.data.get("entity_issue_list", []),
                language=language,
                script_issues=coordinator.data.get("script_issue_list", []),
                scene_issues=coordinator.data.get("scene_issue_list", []),
                blueprint_issues=coordinator.data.get("blueprint_issue_list", []),
                performance_issues=coordinator.data.get("performance_issue_list", []),
                security_issues=coordinator.data.get("security_issue_list", []),
                dashboard_issues=coordinator.data.get("dashboard_issue_list", []),
            )
            
            _LOGGER.info("Reports generated with timestamp: %s", result.get("timestamp"))
        
        async def handle_list_reports(call: ServiceCall) -> dict:
            """Handle list_reports service."""
            data = hass.data[DOMAIN][entry.entry_id]
            report_gen = data["report_generator"]
            reports = report_gen.list_reports()
            return {"reports": reports, "count": len(reports)}

        async def handle_get_report_content(call: ServiceCall) -> dict:
            """Handle get_report_content service."""
            filename = call.data.get("filename")
            data = hass.data[DOMAIN][entry.entry_id]
            report_gen = data["report_generator"]
            
            result = await report_gen.get_report_content(filename)
            if not result:
                return {"success": False, "error": f"Report '{filename}' not found"}
                
            return {"success": True, **result}
        
        async def handle_delete_report(call: ServiceCall) -> dict:
            """Handle delete_report service."""
            session_id = call.data.get("session_id")
            data = hass.data[DOMAIN][entry.entry_id]
            report_gen = data["report_generator"]
            
            result = await report_gen.delete_report_session(session_id)
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_report_deleted",
                    title=_ts(hass, "services_notif", "report_deleted_title"),
                    summary="Suppression du rapport",
                    detail=_ts(hass, "services_notif", "report_deleted_detail").format(count=result.get("deleted_count", 0)),
                    status="success",
                )
            
            return result
    
    # Module 5: Refactoring services
    if MODULE_5_REFACTORING_ASSISTANT:
        async def handle_preview_device_id(call: ServiceCall) -> dict:
            """Handle preview_device_id service."""
            automation_id = call.data.get("automation_id")
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.preview_device_id_fix(automation_id)
            
            await _haca_notify(
                hass,
                notification_id="haca_preview",
                title=_ts(hass, "services_notif", "preview_device_id_title"),
                summary=_ts(hass, "services_notif", "preview_for").format(alias=result.get("alias", automation_id)),
                detail=(
                    f"**Modifications détectées :** {result.get('changes_count', 0)}\n\n"
                    + "\n".join(f"- {c.get('description', str(c))}" for c in result.get("changes", [])[:10])
                    if result.get("changes") else f"**Modifications détectées :** {result.get('changes_count', 0)}"
                ),
                status="info",
            )
            
            return result
        
        async def handle_fix_device_id(call: ServiceCall) -> dict:
            """Handle fix_device_id service."""
            automation_id = call.data.get("automation_id")
            dry_run = call.data.get("dry_run", False)
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.apply_device_id_fix(automation_id, dry_run=dry_run)
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_fix",
                    title=_ts(hass, "services_notif", "fix_device_id_title_applied") if not dry_run else _ts(hass, "services_notif", "fix_device_id_title_dry"),
                    summary=(_ts(hass, "services_notif", "fix_applied_with_backup") if not dry_run else _ts(hass, "services_notif", "dry_run_no_changes")),
                    detail=result.get("message", ""),
                    status="success" if not dry_run else "info",
                    extra=f"**Automation :** `{automation_id}`",
                )
            
            return result
        
        async def handle_preview_mode(call: ServiceCall) -> dict:
            """Handle preview_mode service."""
            automation_id = call.data.get("automation_id")
            new_mode = call.data.get("mode")
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.preview_mode_fix(automation_id, new_mode)
            
            await _haca_notify(
                hass,
                notification_id="haca_preview",
                title=_ts(hass, "services_notif", "preview_mode_title"),
                summary=f"Aperçu pour : {result.get('alias', automation_id)}",
                detail=f"**Nouveau mode :** `{new_mode}`\n\n**Modifications :** {result.get('changes_count', 0)}",
                status="info",
            )
            
            return result
        
        async def handle_fix_mode(call: ServiceCall) -> dict:
            """Handle fix_mode service."""
            automation_id = call.data.get("automation_id")
            new_mode = call.data.get("mode")
            dry_run = call.data.get("dry_run", False)
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.apply_mode_fix(automation_id, new_mode, dry_run=dry_run)
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_fix",
                    title=_ts(hass, "services_notif", "fix_mode_title_applied") if not dry_run else _ts(hass, "services_notif", "fix_mode_title_dry"),
                    summary=(_ts(hass, "services_notif", "mode_fixed_with_backup") if not dry_run else _ts(hass, "services_notif", "dry_run_no_changes")),
                    detail=result.get("message", ""),
                    status="success" if not dry_run else "info",
                    extra=f"**Automation :** `{automation_id}` → mode `{new_mode}`",
                )
            
            return result
            
        async def handle_preview_template(call: ServiceCall) -> dict:
            """Handle preview_template service."""
            automation_id = call.data.get("automation_id")
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.preview_template_fix(automation_id)
            return result
            
        async def handle_fix_template(call: ServiceCall) -> dict:
            """Handle fix_template service."""
            automation_id = call.data.get("automation_id")
            dry_run = call.data.get("dry_run", False)
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.apply_template_fix(automation_id, dry_run=dry_run)
            return result
        
        async def handle_list_backups(call: ServiceCall) -> dict:
            """Handle list_backups service."""
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            backups = await refactoring.list_backups()
            return {"backups": backups, "count": len(backups)}
            
        async def handle_create_backup(call: ServiceCall) -> dict:
            """Handle create_backup service."""
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.create_backup()
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_backup",
                    title=_ts(hass, "services_notif", "backup_created_title"),
                    summary=_ts(hass, "services_notif", "backup_created_summary"),
                    detail=result.get("message", ""),
                    status="success",
                )
            return result
        
        async def handle_restore_backup(call: ServiceCall) -> dict:
            """Handle restore_backup service."""
            backup_path = call.data.get("backup_path")
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.restore_backup(backup_path)
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_restore",
                    title=_ts(hass, "services_notif", "backup_restored_title"),
                    summary=_ts(hass, "services_notif", "backup_restored_summary"),
                    detail=result.get("message", ""),
                    status="success",
                    extra=_ts(hass, "services_notif", "backup_restored_extra"),
                )
            
            return result
        
        async def handle_delete_backup(call: ServiceCall) -> dict:
            """Handle delete_backup service."""
            backup_path = call.data.get("backup_path")
            
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            
            result = await refactoring.delete_backup(backup_path)
            
            if result.get("success"):
                await _haca_notify(
                    hass,
                    notification_id="haca_backup_deleted",
                    title=_ts(hass, "services_notif", "backup_deleted_title"),
                    summary="Suppression de la sauvegarde",
                    detail=result.get("message", ""),
                    status="success",
                )
            
            return result
        
        async def handle_purge_ghosts(call: ServiceCall) -> dict:
            """Handle purge_ghosts service."""
            dry_run = call.data.get("dry_run", True)
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            return await refactoring.purge_orphaned_entities(dry_run=dry_run)
            
        async def handle_fuzzy_suggestions(call: ServiceCall) -> dict:
            """Handle get_fuzzy_suggestions service."""
            entity_id = call.data.get("entity_id")
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            suggestions = await refactoring.get_fuzzy_suggestions(entity_id)
            return {"suggestions": suggestions}
            
        async def handle_suggest_description_ai(call: ServiceCall) -> dict:
            """Handle suggest_description_ai service."""
            entity_id = call.data.get("entity_id")
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            return await refactoring.suggest_description_ai(entity_id)
            
        async def handle_fix_description(call: ServiceCall) -> dict:
            """Handle fix_description service."""
            entity_id = call.data.get("entity_id")
            description = call.data.get("description")
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            return await refactoring.apply_description_fix(entity_id, description)

        async def handle_apply_zombie_fix(call: ServiceCall) -> dict:
            """Handle apply_zombie_fix service - replace or remove zombie entity references."""
            automation_id = call.data.get("automation_id", "")
            old_entity_id = call.data.get("old_entity_id", "")
            new_entity_id = call.data.get("new_entity_id", "")
            data = hass.data[DOMAIN][entry.entry_id]
            refactoring = data["refactoring_assistant"]
            return await refactoring.apply_zombie_entity_fix(
                automation_id, old_entity_id, new_entity_id
            )

    # Register services
    hass.services.async_register(DOMAIN, SERVICE_SCAN_ALL, handle_scan_all, schema=vol.Schema({}))
    hass.services.async_register(DOMAIN, SERVICE_SCAN_AUTOMATIONS, handle_scan_automations, schema=vol.Schema({}))
    hass.services.async_register(DOMAIN, SERVICE_SCAN_ENTITIES, handle_scan_entities, schema=vol.Schema({}))
    
    if MODULE_4_COMPLIANCE_REPORT:
        hass.services.async_register(DOMAIN, SERVICE_GENERATE_REPORT, handle_generate_report, schema=vol.Schema({}))
        hass.services.async_register(
            DOMAIN, SERVICE_LIST_REPORTS, handle_list_reports,
            schema=vol.Schema({}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, SERVICE_GET_REPORT_CONTENT, handle_get_report_content,
            schema=vol.Schema({vol.Required("filename"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, "delete_report", handle_delete_report,
            schema=vol.Schema({vol.Required("session_id"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
    
    if MODULE_5_REFACTORING_ASSISTANT:
        hass.services.async_register(
            DOMAIN, SERVICE_PREVIEW_DEVICE_ID, handle_preview_device_id,
            schema=vol.Schema({vol.Required("automation_id"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, SERVICE_FIX_DEVICE_ID, handle_fix_device_id,
            schema=vol.Schema({
                vol.Required("automation_id"): cv.string,
                vol.Optional("dry_run", default=False): cv.boolean
            }),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, SERVICE_PREVIEW_MODE, handle_preview_mode,
            schema=vol.Schema({
                vol.Required("automation_id"): cv.string,
                vol.Required("mode"): vol.In(["single", "restart", "queued", "parallel"])
            }),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, SERVICE_FIX_MODE, handle_fix_mode,
            schema=vol.Schema({
                vol.Required("automation_id"): cv.string,
                vol.Required("mode"): vol.In(["single", "restart", "queued", "parallel"]),
                vol.Optional("dry_run", default=False): cv.boolean
            }),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, SERVICE_PREVIEW_TEMPLATE, handle_preview_template,
            schema=vol.Schema({vol.Required("automation_id"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, "suggest_description_ai", handle_suggest_description_ai,
            schema=vol.Schema({vol.Required("entity_id"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, "fix_description", handle_fix_description,
            schema=vol.Schema({
                vol.Required("entity_id"): cv.string,
                vol.Required("description"): cv.string
            }),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, SERVICE_FIX_TEMPLATE, handle_fix_template,
            schema=vol.Schema({
                vol.Required("automation_id"): cv.string,
                vol.Optional("dry_run", default=False): cv.boolean
            }),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, SERVICE_LIST_BACKUPS, handle_list_backups,
            schema=vol.Schema({}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, "create_backup", handle_create_backup,
            schema=vol.Schema({}),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, SERVICE_RESTORE_BACKUP, handle_restore_backup,
            schema=vol.Schema({vol.Required("backup_path"): cv.string}),
            supports_response=SupportsResponse.OPTIONAL
        )
        hass.services.async_register(
            DOMAIN, "delete_backup", handle_delete_backup,
            schema=vol.Schema({vol.Required("backup_path"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, SERVICE_PURGE_GHOSTS, handle_purge_ghosts,
            schema=vol.Schema({vol.Optional("dry_run", default=True): cv.boolean}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, SERVICE_FUZZY_SUGGESTIONS, handle_fuzzy_suggestions,
            schema=vol.Schema({vol.Required("entity_id"): cv.string}),
            supports_response=SupportsResponse.ONLY
        )
        hass.services.async_register(
            DOMAIN, "apply_zombie_fix", handle_apply_zombie_fix,
            schema=vol.Schema({
                vol.Required("automation_id"): cv.string,
                vol.Required("old_entity_id"): cv.string,
                vol.Optional("new_entity_id", default=""): cv.string,
            }),
            supports_response=SupportsResponse.ONLY
        )

    async def handle_explain_issue(call: ServiceCall) -> dict:
        """Handle explain_issue_ai service."""
        issue_data = call.data.get("issue")
        explanation = await explain_issue_ai(hass, issue_data)
        return {"explanation": explanation}

    hass.services.async_register(
        DOMAIN, "explain_issue_ai", handle_explain_issue,
        schema=vol.Schema({vol.Required("issue"): dict}),
        supports_response=SupportsResponse.ONLY
    )

    async def handle_analyze_complexity(call: ServiceCall) -> dict:
        """AI analysis + refactoring proposal for a complex automation/script."""
        row = call.data.get("row", {})
        result = await analyze_complexity_ai(hass, row)
        return result

    hass.services.async_register(
        DOMAIN, "analyze_complexity_ai", handle_analyze_complexity,
        schema=vol.Schema({vol.Required("row"): dict}),
        supports_response=SupportsResponse.ONLY
    )

    async def handle_optimize_automation(call: ServiceCall) -> dict:
        """AI optimisation pipeline for a single automation."""
        entity_id         = call.data.get("entity_id", "")
        issues            = call.data.get("issues", [])
        complexity_scores = call.data.get("complexity_scores", [])
        optimizer = hass.data[DOMAIN][entry.entry_id]["automation_optimizer"]
        result = await optimizer.optimize(entity_id, issues, complexity_scores)
        return result

    hass.services.async_register(
        DOMAIN, "optimize_automation", handle_optimize_automation,
        schema=vol.Schema({
            vol.Required("entity_id"):          cv.string,
            vol.Optional("issues",             default=[]): list,
            vol.Optional("complexity_scores",  default=[]): list,
        }),
        supports_response=SupportsResponse.ONLY
    )

    async def handle_apply_optimization(call: ServiceCall) -> dict:
        """Apply optimised YAML — backup + atomic write."""
        entity_id = call.data.get("entity_id", "")
        new_yaml  = call.data.get("new_yaml", "")
        optimizer = hass.data[DOMAIN][entry.entry_id]["automation_optimizer"]
        result    = await optimizer.apply(entity_id, new_yaml)
        return result

    hass.services.async_register(
        DOMAIN, "apply_optimization", handle_apply_optimization,
        schema=vol.Schema({
            vol.Required("entity_id"): cv.string,
            vol.Required("new_yaml"):  cv.string,
        }),
        supports_response=SupportsResponse.ONLY
    )

    _LOGGER.info("All services registered")
