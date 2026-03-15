"""H.A.C.A — Serveur MCP (Model Context Protocol) v1.4.0.

Expose HACA comme un serveur MCP accessible depuis n'importe quel agent IA
compatible (Claude Code, Cursor, Copilot, etc.) via HTTP + JSON-RPC 2.0.

Authentification : Bearer token = Long-Lived Access Token HA.

Routes enregistrées :
  POST /api/haca_mcp          — endpoint principal JSON-RPC 2.0
  GET  /api/haca_mcp          — SSE endpoint (keepalive + server events)
  GET  /api/haca_mcp/info     — endpoint informatif (non authentifié)

Outils MCP exposés :
  haca_get_issues(severity?, type?)   → liste d'issues filtrée
  haca_get_score()                    → score de santé global
  haca_get_automation(entity_id)      → YAML d'une automation
  haca_fix_suggestion(issue_id)       → proposition de correction
  haca_apply_fix(issue_id, dry_run?)  → appliquer une correction
  haca_get_batteries()                → état des batteries
  haca_explain_issue(issue_id)        → explication IA contextuelle

MCP spec : https://modelcontextprotocol.io/specification (2024-11-05)
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from aiohttp import web
from homeassistant.core import HomeAssistant
from homeassistant.components.http import HomeAssistantView

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

MCP_PROTOCOL_VERSION = "2024-11-05"
MCP_SERVER_NAME = "haca-mcp"
MCP_SERVER_VERSION = "1.4.1"

# ─── Tool definitions (schéma JSON Schema) ────────────────────────────────

MCP_TOOLS: list[dict[str, Any]] = [
    {
        "name": "haca_get_issues",
        "description": (
            "Récupère la liste des issues détectées par HACA dans la configuration "
            "Home Assistant. Peut être filtrée par sévérité et/ou type."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "severity": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Filtrer par sévérité (optionnel)",
                },
                "type": {
                    "type": "string",
                    "description": "Filtrer par type d'issue (optionnel), ex: 'zombie_entity'",
                },
                "category": {
                    "type": "string",
                    "enum": ["automation", "script", "scene", "entity", "performance",
                             "security", "dashboard", "compliance"],
                    "description": "Filtrer par catégorie (optionnel)",
                },
                "limit": {
                    "type": "integer",
                    "default": 50,
                    "description": "Nombre maximum d'issues à retourner",
                },
            },
        },
    },
    {
        "name": "haca_get_score",
        "description": (
            "Retourne le score de santé global de la configuration HA (0–100), "
            "le nombre total d'issues, et la répartition par sévérité."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "haca_get_automation",
        "description": (
            "Retourne le YAML complet d'une automation HA par son entity_id ou alias. "
            "Utile pour analyser la logique d'une automation spécifique."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {
                    "type": "string",
                    "description": "entity_id ou alias de l'automation, ex: 'automation.lumieres_salon'",
                },
            },
        },
    },
    {
        "name": "haca_fix_suggestion",
        "description": (
            "Retourne une proposition de correction pour une issue donnée "
            "(sans l'appliquer). Inclut le diff prévisualisé."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["issue_id"],
            "properties": {
                "issue_id": {
                    "type": "string",
                    "description": "Identifiant unique de l'issue (champ 'id' dans haca_get_issues)",
                },
            },
        },
    },
    {
        "name": "haca_apply_fix",
        "description": (
            "Applique une correction à une issue. Supporte le mode dry_run "
            "pour prévisualiser sans modifier les fichiers."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["issue_id"],
            "properties": {
                "issue_id": {
                    "type": "string",
                    "description": "Identifiant unique de l'issue",
                },
                "dry_run": {
                    "type": "boolean",
                    "default": True,
                    "description": "Si true (défaut), simule sans modifier. false pour appliquer.",
                },
            },
        },
    },
    {
        "name": "haca_get_batteries",
        "description": (
            "Retourne l'état de toutes les batteries détectées dans HA : "
            "niveau, statut (critical/low/warning/ok), et dernière mise à jour."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "min_level": {
                    "type": "integer",
                    "description": "Ne retourner que les batteries en dessous de ce niveau (%)",
                },
            },
        },
    },
    {
        "name": "haca_explain_issue",
        "description": (
            "Génère une explication IA contextuelle d'une issue spécifique, "
            "avec des suggestions d'amélioration adaptées à la configuration HA."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["issue_id"],
            "properties": {
                "issue_id": {
                    "type": "string",
                    "description": "Identifiant unique de l'issue à expliquer",
                },
            },
        },
    },
]


# ─── Helper : récupérer les données du coordinator ────────────────────────

def _get_coordinator_data(hass: HomeAssistant) -> dict[str, Any]:
    """Retourne les données du coordinator ou un dict vide."""
    try:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            return {}
        data = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {})
        coordinator = data.get("coordinator")
        return coordinator.data or {} if coordinator else {}
    except Exception:
        return {}


def _find_issue_by_id(cdata: dict, issue_id: str) -> dict | None:
    """Cherche une issue par son id dans toutes les listes."""
    all_lists = [
        "automation_issue_list", "entity_issue_list", "performance_issue_list",
        "security_issue_list", "dashboard_issue_list", "compliance_issue_list",
        "script_issue_list", "scene_issue_list", "blueprint_issue_list",
    ]
    for lst_key in all_lists:
        for issue in cdata.get(lst_key, []):
            if issue.get("id") == issue_id or str(issue.get("id", "")) == issue_id:
                return issue
    return None


# ─── Authentification ──────────────────────────────────────────────────────

def _atomic_write(path, content: str, encoding: str = "utf-8") -> None:
    """Écriture atomique : write_text dans un .tmp puis os.replace().

    Garantit que le fichier cible n'est jamais dans un état corrompu
    si HA crashe pendant l'écriture. os.replace() est atomique sur
    Linux et Windows (même volume).
    """
    import os as _os
    tmp = str(path) + ".tmp"
    try:
        with open(tmp, "w", encoding=encoding) as fh:
            fh.write(content)
        _os.replace(tmp, str(path))
    except Exception:
        # Nettoyer le fichier temporaire en cas d'erreur
        try:
            _os.unlink(tmp)
        except OSError:
            pass
        raise



async def _check_auth(request: web.Request, hass: HomeAssistant) -> str | None:
    """Vérifie le Bearer token HA. Retourne l'user_id ou None si invalide.
    
    Logs détaillés pour diagnostiquer les problèmes de connexion :
    - INFO  : connexion acceptée (user_id + IP)
    - WARNING : token absent ou invalide
    """
    client_ip = request.remote or "?"
    auth_header = request.headers.get("Authorization", "")

    if not auth_header:
        _LOGGER.warning(
            "[HACA MCP] ❌ Auth refusée — header Authorization absent (IP: %s %s %s)",
            client_ip, request.method, request.path,
        )
        return None

    if not auth_header.startswith("Bearer "):
        _LOGGER.warning(
            "[HACA MCP] ❌ Auth refusée — format invalide (attendu 'Bearer <token>') "
            "(IP: %s, header: %.20s…)", client_ip, auth_header,
        )
        return None

    token = auth_header[7:]
    if len(token) < 10:
        _LOGGER.warning(
            "[HACA MCP] ❌ Auth refusée — token trop court (%d chars) (IP: %s)",
            len(token), client_ip,
        )
        return None

    try:
        user = await hass.auth.async_validate_access_token(token)
        if user:
            _LOGGER.info(
                "[HACA MCP] ✅ Auth acceptée — user=%s IP=%s %s %s",
                user.id, client_ip, request.method, request.path,
            )
            return user.id
        else:
            _LOGGER.warning(
                "[HACA MCP] ❌ Auth refusée — token valide mais user=None (expiré ?) "
                "(token: %.8s… IP: %s)", token, client_ip,
            )
            return None
    except Exception as exc:
        _LOGGER.warning(
            "[HACA MCP] ❌ Auth erreur — async_validate_access_token a levé: %s "
            "(token: %.8s… IP: %s)", exc, token, client_ip,
        )
        return None


# ─── Tool handlers ────────────────────────────────────────────────────────

async def _tool_get_issues(hass: HomeAssistant, params: dict) -> dict:
    cdata = _get_coordinator_data(hass)
    severity_filter = params.get("severity")
    type_filter = params.get("type")
    category_filter = params.get("category")
    limit = int(params.get("limit", 50))

    category_to_list = {
        "automation": "automation_issue_list",
        "script": "script_issue_list",
        "scene": "scene_issue_list",
        "entity": "entity_issue_list",
        "performance": "performance_issue_list",
        "security": "security_issue_list",
        "dashboard": "dashboard_issue_list",
        "compliance": "compliance_issue_list",
    }

    if category_filter and category_filter in category_to_list:
        all_issues = list(cdata.get(category_to_list[category_filter], []))
    else:
        all_issues = []
        for lst_key in category_to_list.values():
            all_issues.extend(cdata.get(lst_key, []))

    if severity_filter:
        all_issues = [i for i in all_issues if i.get("severity") == severity_filter]
    if type_filter:
        all_issues = [i for i in all_issues if i.get("type") == type_filter]

    # Trier par sévérité
    sev_order = {"high": 0, "medium": 1, "low": 2}
    all_issues.sort(key=lambda i: sev_order.get(i.get("severity", "low"), 2))

    issues = all_issues[:limit]
    return {
        "total": len(all_issues),
        "returned": len(issues),
        "issues": [
            {
                "id": i.get("id", ""),
                "severity": i.get("severity", "low"),
                "type": i.get("type", ""),
                "entity_id": i.get("entity_id", i.get("alias", "")),
                "message": i.get("message", ""),
                "fixable": i.get("fixable", False),
            }
            for i in issues
        ],
    }


async def _tool_get_score(hass: HomeAssistant, params: dict) -> dict:
    cdata = _get_coordinator_data(hass)
    return {
        "health_score": cdata.get("health_score", 0),
        "total_issues": cdata.get("total_issues", 0),
        "by_severity": {
            "high": sum(
                1 for lst in ["automation_issue_list", "entity_issue_list",
                              "performance_issue_list", "security_issue_list",
                              "compliance_issue_list"]
                for i in cdata.get(lst, []) if i.get("severity") == "high"
            ),
            "medium": sum(
                1 for lst in ["automation_issue_list", "entity_issue_list",
                              "performance_issue_list", "security_issue_list",
                              "compliance_issue_list"]
                for i in cdata.get(lst, []) if i.get("severity") == "medium"
            ),
            "low": sum(
                1 for lst in ["automation_issue_list", "entity_issue_list",
                              "performance_issue_list", "security_issue_list",
                              "compliance_issue_list"]
                for i in cdata.get(lst, []) if i.get("severity") == "low"
            ),
        },
        "by_category": {
            "automation": cdata.get("automation_issues", 0),
            "entity": cdata.get("entity_issues", 0),
            "performance": cdata.get("performance_issues", 0),
            "security": cdata.get("security_issues", 0),
            "compliance": len(cdata.get("compliance_issue_list", [])),
        },
        "last_scan": cdata.get("last_scan", None),
    }


async def _tool_get_automation(hass: HomeAssistant, params: dict) -> dict:
    """Retourne le YAML d'une automation depuis l'état HA."""
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id is required"}

    # Chercher dans les automations HA
    automation_ids = hass.states.async_entity_ids("automation")
    target_id = None

    if entity_id in automation_ids:
        target_id = entity_id
    else:
        # Chercher par alias
        for eid in automation_ids:
            state = hass.states.get(eid)
            if state and state.attributes.get("friendly_name", "").lower() == entity_id.lower():
                target_id = eid
                break

    if not target_id:
        return {"error": f"Automation '{entity_id}' not found"}

    state = hass.states.get(target_id)
    attrs = state.attributes if state else {}

    # Tenter de lire le YAML depuis les fichiers de config
    import yaml
    from pathlib import Path

    auto_id = attrs.get("id") or target_id.split(".")[-1]
    yaml_content = None

    try:
        auto_file = Path(hass.config.config_dir) / "automations.yaml"
        if auto_file.exists():
            raw = auto_file.read_text(encoding="utf-8")
            automations = yaml.safe_load(raw) or []
            for auto in automations:
                if str(auto.get("id", "")) == str(auto_id) or \
                   auto.get("alias", "") == attrs.get("friendly_name", ""):
                    yaml_content = yaml.dump(auto, allow_unicode=True, default_flow_style=False)
                    break
    except Exception as exc:
        _LOGGER.debug("[HACA MCP] YAML read error: %s", exc)

    return {
        "entity_id": target_id,
        "alias": attrs.get("friendly_name", target_id),
        "state": state.state if state else "unknown",
        "last_triggered": attrs.get("last_triggered"),
        "yaml": yaml_content or f"# YAML non disponible pour {target_id}\n# Vérifiez automations.yaml",
    }


async def _tool_fix_suggestion(hass: HomeAssistant, params: dict) -> dict:
    issue_id = params.get("issue_id", "")
    if not issue_id:
        return {"error": "issue_id is required"}

    cdata = _get_coordinator_data(hass)
    issue = _find_issue_by_id(cdata, issue_id)
    if not issue:
        return {"error": f"Issue '{issue_id}' not found"}

    if not issue.get("fixable", False):
        return {
            "issue_id": issue_id,
            "fixable": False,
            "message": "No automatic fix available for this issue.",
            "suggestion": issue.get("fix_description", issue.get("message", "")),
        }

    return {
        "issue_id": issue_id,
        "fixable": True,
        "type": issue.get("type", ""),
        "entity_id": issue.get("entity_id", ""),
        "suggestion": issue.get("fix_description", "Appliquer la correction automatique"),
        "preview_available": True,
        "note": "Utilisez haca_apply_fix avec dry_run=true pour voir le diff.",
    }


async def _tool_apply_fix(hass: HomeAssistant, params: dict) -> dict:
    issue_id = params.get("issue_id", "")
    dry_run = params.get("dry_run", True)
    if not issue_id:
        return {"error": "issue_id is required"}

    cdata = _get_coordinator_data(hass)
    issue = _find_issue_by_id(cdata, issue_id)
    if not issue:
        return {"error": f"Issue '{issue_id}' not found"}

    if not issue.get("fixable", False):
        return {"error": "This issue cannot be fixed automatically"}

    if dry_run:
        return {
            "dry_run": True,
            "issue_id": issue_id,
            "entity_id": issue.get("entity_id", ""),
            "fix_type": issue.get("type", ""),
            "message": "Dry run: no files modified. Set dry_run=false to apply.",
            "preview": issue.get("fix_description", ""),
        }

    # Appliquer via le service HA
    try:
        fix_type = issue.get("type", "")
        entity_id = issue.get("entity_id", "")

        if fix_type in ("device_id_in_trigger", "device_id_in_action"):
            service = "fix_device_id"
        elif fix_type == "incorrect_mode_for_pattern":
            service = "fix_mode"
        elif fix_type in ("template_simple_state", "template_numeric_comparison"):
            service = "fix_template"
        else:
            return {"error": f"No fix service for issue type '{fix_type}'"}

        await hass.services.async_call(
            DOMAIN, service, {"entity_id": entity_id}, blocking=True
        )
        return {
            "dry_run": False,
            "issue_id": issue_id,
            "entity_id": entity_id,
            "status": "applied",
            "message": f"Fix applied for {entity_id}",
        }
    except Exception as exc:
        return {"error": f"Error applying fix: {exc}"}


async def _tool_get_batteries(hass: HomeAssistant, params: dict) -> dict:
    cdata = _get_coordinator_data(hass)
    min_level = params.get("min_level")
    batteries = cdata.get("battery_list", [])

    if min_level is not None:
        batteries = [b for b in batteries if b.get("level", 100) <= int(min_level)]

    return {
        "total": len(batteries),
        "batteries": [
            {
                "entity_id": b.get("entity_id", ""),
                "friendly_name": b.get("friendly_name", ""),
                "level": b.get("level"),
                "status": b.get("status", "ok"),
                "last_updated": b.get("last_updated"),
            }
            for b in batteries
        ],
    }


async def _tool_explain_issue(hass: HomeAssistant, params: dict) -> dict:
    issue_id = params.get("issue_id", "")
    if not issue_id:
        return {"error": "issue_id is required"}

    cdata = _get_coordinator_data(hass)
    issue = _find_issue_by_id(cdata, issue_id)
    if not issue:
        return {"error": f"Issue '{issue_id}' not found"}

    # Utiliser le cache AI si disponible
    from .conversation import _async_call_ai, _AI_CACHE_KEY
    cache = hass.data.get(DOMAIN, {}).get(_AI_CACHE_KEY, {})
    cache_key = f"explain_{issue_id}"

    if cache_key in cache:
        return {"explanation": cache[cache_key], "cached": True}

    prompt = (
        f"[H.A.C.A Audit] Issue détectée dans la configuration Home Assistant.\n"
        f"Type: {issue.get('type', '')}\n"
        f"Sévérité: {issue.get('severity', '')}\n"
        f"Entité: {issue.get('entity_id', issue.get('alias', ''))}\n"
        f"Message: {issue.get('message', '')}\n\n"
        f"Explique cette issue en 2-3 phrases claires et propose une correction concrète."
    )

    explanation = await _async_call_ai(hass, prompt, "HACA MCP Explain")

    if explanation:
        # Mettre en cache
        if DOMAIN in hass.data:
            entries = hass.config_entries.async_entries(DOMAIN)
            if entries:
                entry_data = hass.data[DOMAIN].get(entries[0].entry_id, {})
                ai_cache = entry_data.get(_AI_CACHE_KEY, {})
                ai_cache[cache_key] = explanation
                entry_data[_AI_CACHE_KEY] = ai_cache

    return {
        "issue_id": issue_id,
        "entity_id": issue.get("entity_id", ""),
        "explanation": explanation or "Aucun service IA disponible.",
        "cached": False,
    }


# ─── Outils HA Control (nouveaux en v1.4.1) ───────────────────────────────

HA_CONTROL_TOOLS: list[dict[str, Any]] = [
    {
        "name": "ha_get_entities",
        "description": (
            "List Home Assistant entities with their current states and attributes. "
            "Filter by domain (light, switch, automation…), area name, or keyword search. "
            "Use this to discover what's available before creating automations or scripts."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "domain": {"type": "string",
                           "description": "Filter by domain, e.g. 'light', 'automation', 'sensor'"},
                "area": {"type": "string",
                         "description": "Filter by area name (partial match), e.g. 'salon', 'chambre'"},
                "search": {"type": "string",
                           "description": "Search in entity_id or friendly_name (partial match)"},
                "limit": {"type": "integer", "default": 50,
                          "description": "Maximum entities to return (default 50)"},
            },
        },
    },
    {
        "name": "ha_call_service",
        "description": (
            "Call any Home Assistant service. This is the universal action tool. "
            "Examples: turn on a light, trigger an automation, set a thermostat. "
            "Use ha_get_entities first to find valid entity_ids. "
            "Common services: light.turn_on, switch.toggle, automation.trigger, "
            "climate.set_temperature, media_player.play_media, script.turn_on."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["domain", "service"],
            "properties": {
                "domain": {"type": "string",
                           "description": "Service domain, e.g. 'light', 'switch', 'automation'"},
                "service": {"type": "string",
                            "description": "Service name, e.g. 'turn_on', 'turn_off', 'toggle'"},
                "data": {"type": "object",
                         "description": "Service call data, e.g. {\"entity_id\": \"light.salon\", \"brightness\": 200}"},
            },
        },
    },
    {
        "name": "ha_create_automation",
        "description": (
            "Create a new automation in Home Assistant by writing to automations.yaml. "
            "The automation is automatically reloaded after creation. "
            "Trigger types: state, numeric_state, time, sun (sunset/sunrise), event, template. "
            "Example: create an automation that turns on porch light at sunset."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["alias"],
            "properties": {
                "alias": {"type": "string",
                          "description": "Human-readable name for the automation"},
                "description": {"type": "string",
                                "description": "What the automation does (recommended)"},
                "triggers": {
                    "description": "Trigger(s) — preferred key (HA new format). Array of trigger objects or single trigger.",
                    "oneOf": [{"type": "array"}, {"type": "object"}],
                },
                "trigger": {
                    "description": "Trigger(s) — legacy key (also accepted). Use 'triggers' when possible.",
                    "oneOf": [{"type": "array"}, {"type": "object"}],
                },
                "conditions": {
                    "description": "Optional condition(s) — preferred key (HA new format). Array or single.",
                    "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}],
                },
                "condition": {
                    "description": "Optional condition(s) — legacy key (also accepted).",
                    "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}],
                },
                "actions": {
                    "description": "Action(s) to execute — preferred key (HA new format). Array or single.",
                    "oneOf": [{"type": "array"}, {"type": "object"}],
                },
                "action": {
                    "description": "Action(s) to execute — legacy key (also accepted).",
                    "oneOf": [{"type": "array"}, {"type": "object"}],
                },
                "mode": {"type": "string", "enum": ["single", "parallel", "queued", "restart"],
                         "default": "single"},
            },
        },
    },
    {
        "name": "ha_update_automation",
        "description": (
            "Read an existing automation from automations.yaml and update specific fields. "
            "Use this to add an action, change a trigger, or modify a condition. "
            "Provide entity_id or alias to identify the automation, then the fields to update."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {"type": "string",
                              "description": "entity_id or alias of the automation to update"},
                "alias": {"type": "string", "description": "New alias (optional)"},
                "description": {"type": "string", "description": "New description (optional)"},
                "triggers": {"description": "Replace triggers — preferred key (HA new format)",
                             "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "trigger": {"description": "Replace triggers — legacy key (also accepted)",
                            "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "conditions": {"description": "Replace conditions — preferred key (HA new format)",
                               "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "condition": {"description": "Replace conditions — legacy key (also accepted)",
                              "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "actions": {"description": "Replace actions — preferred key (HA new format)",
                            "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "action": {"description": "Replace actions — legacy key (also accepted)",
                           "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "append_action": {"description": "Append action(s) to existing list (optional)",
                                  "oneOf": [{"type": "array"}, {"type": "object"}, {"type": "null"}]},
                "mode": {"type": "string", "enum": ["single", "parallel", "queued", "restart"]},
            },
        },
    },
    {
        "name": "ha_get_automation_traces",
        "description": (
            "Get execution traces for an automation to debug why it's not working. "
            "Returns: last trigger timestamp, trigger type, conditions met/rejected, "
            "actions executed, errors encountered. Essential for debugging."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {"type": "string",
                              "description": "entity_id of the automation, e.g. 'automation.morning_routine'"},
                "limit": {"type": "integer", "default": 5,
                          "description": "Number of recent traces to return"},
            },
        },
    },
    {
        "name": "ha_get_lovelace",
        "description": (
            "Read the current Lovelace dashboard configuration. "
            "Returns the full config including views, cards, and entities. "
            "Use this before ha_add_lovelace_card to understand the current structure."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "dashboard_id": {"type": "string",
                                 "description": "Dashboard URL path (e.g. 'lovelace', 'cameras'). "
                                                "Omit for the default dashboard."},
            },
        },
    },
    {
        "name": "ha_add_lovelace_card",
        "description": (
            "Add a new card to a Lovelace dashboard view. "
            "Examples: entity card, weather card, light card, button card, glance card. "
            "The dashboard must be in 'storage' mode (managed via UI), not YAML mode."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["card"],
            "properties": {
                "dashboard_id": {"type": "string",
                                 "description": "Dashboard URL path (default: 'lovelace')"},
                "view_index": {"type": "integer", "default": 0,
                               "description": "View index to add the card to (0 = first view)"},
                "card": {"type": "object",
                         "description": "Card config object, e.g. {\"type\": \"weather-forecast\", \"entity\": \"weather.home\"}"},
            },
        },
    },
    {
        "name": "ha_create_script",
        "description": (
            "Create or update a reusable script in Home Assistant (scripts.yaml). "
            "Scripts are like automations but triggered manually or called by other automations. "
            "Example: 'movie mode' script that dims lights, closes blinds, turns on TV."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["script_id", "alias", "sequence"],
            "properties": {
                "script_id": {"type": "string",
                              "description": "Unique script identifier (no spaces), e.g. 'movie_mode'"},
                "alias": {"type": "string",
                          "description": "Human-readable script name"},
                "description": {"type": "string",
                                "description": "What the script does"},
                "sequence": {"type": "array",
                             "description": "List of actions to execute, same format as automation actions"},
                "mode": {"type": "string", "enum": ["single", "parallel", "queued", "restart"],
                         "default": "single"},
            },
        },
    },
]

# Ajouter les nouveaux outils à la liste MCP
MCP_TOOLS.extend(HA_CONTROL_TOOLS)


# ─── Handlers des nouveaux outils HA Control ──────────────────────────────

async def _tool_ha_get_entities(hass: HomeAssistant, params: dict) -> dict:
    """Liste les entités HA avec leurs états."""
    domain_filter = params.get("domain", "").lower().strip()
    area_filter = params.get("area", "").lower().strip()
    search = params.get("search", "").lower().strip()
    limit = int(params.get("limit", 50))

    try:
        from homeassistant.helpers import area_registry as ar, entity_registry as er, device_registry as dr

        area_reg = ar.async_get(hass)
        entity_reg = er.async_get(hass)
        device_reg = dr.async_get(hass)

        # Build area_id → area_name map
        area_map: dict[str, str] = {a.id: a.name for a in area_reg.async_list_areas()}

        results = []
        for state in hass.states.async_all():
            eid = state.entity_id
            if domain_filter and not eid.startswith(f"{domain_filter}."):
                continue

            name = state.attributes.get("friendly_name", eid)
            if search and search not in eid.lower() and search not in name.lower():
                continue

            # Find area
            entry = entity_reg.entities.get(eid)
            entity_area_id = entry.area_id if entry else None
            device_area_id = None
            if entry and entry.device_id:
                device = device_reg.async_get(entry.device_id)
                device_area_id = device.area_id if device else None
            area_id = entity_area_id or device_area_id
            area_name = area_map.get(area_id, "") if area_id else ""

            if area_filter and area_filter not in area_name.lower():
                continue

            results.append({
                "entity_id": eid,
                "friendly_name": name,
                "state": state.state,
                "area": area_name,
                "domain": eid.split(".")[0],
                "attributes": {
                    k: list(v) if isinstance(v, (set, frozenset)) else v
                    for k, v in state.attributes.items()
                    if k not in ("friendly_name", "icon", "supported_features")
                    and not isinstance(v, (dict, list))
                },
            })
            if len(results) >= limit:
                break

        return {"total": len(results), "entities": results}

    except Exception as exc:
        return {"error": f"Error listing entities: {exc}"}


async def _tool_ha_call_service(hass: HomeAssistant, params: dict) -> dict:
    """Appelle un service HA."""
    domain = params.get("domain", "").strip()
    service = params.get("service", "").strip()
    data = params.get("data") or {}

    if not domain or not service:
        return {"error": "domain and service are required"}

    try:
        await hass.services.async_call(domain, service, data, blocking=True, limit=10)
        return {
            "success": True,
            "called": f"{domain}.{service}",
            "data": data,
        }
    except Exception as exc:
        return {"error": f"Service call failed: {exc}"}


async def _tool_ha_create_automation(hass: HomeAssistant, params: dict) -> dict:
    """Crée une nouvelle automation dans automations.yaml."""
    import yaml
    from pathlib import Path
    import uuid

    alias = params.get("alias", "").strip()
    if not alias:
        return {"error": "alias is required"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_create_automation")

    # Accept both new HA format (triggers/actions/conditions) and legacy (trigger/action/condition)
    trigger = params.get("triggers") or params.get("trigger")
    action = params.get("actions") or params.get("action")
    if trigger is None or action is None:
        return {"error": "triggers (or trigger) and actions (or action) are required"}

    # Normalise to lists
    if isinstance(trigger, dict):
        trigger = [trigger]
    if isinstance(action, dict):
        action = [action]

    condition = params.get("conditions") or params.get("condition")
    if isinstance(condition, dict):
        condition = [condition]

    new_auto: dict[str, Any] = {
        "id": str(params.get("id") or uuid.uuid4())[:32],
        "alias": alias,
        "description": params.get("description", ""),
        "triggers": trigger,
        "conditions": condition or [],
        "actions": action,
        "mode": params.get("mode", "single"),
    }

    try:
        auto_file = Path(hass.config.config_dir) / "automations.yaml"

        # Lire les automations existantes
        existing: list = []
        if auto_file.exists():
            raw = await hass.async_add_executor_job(auto_file.read_text, "utf-8")
            existing = yaml.safe_load(raw) or []
            if not isinstance(existing, list):
                existing = []

        # Vérifier doublon par alias
        for a in existing:
            if isinstance(a, dict) and a.get("alias") == alias:
                return {"error": f"Automation '{alias}' already exists. Use ha_update_automation to modify it."}

        existing.append(new_auto)
        new_yaml = yaml.dump(existing, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await hass.async_add_executor_job(
            _atomic_write, auto_file, new_yaml
        )

        # Recharger les automations
        await hass.services.async_call("automation", "reload", blocking=True)

        return {
            "success": True,
            "id": new_auto["id"],
            "alias": alias,
            "entity_id": f"automation.{alias.lower().replace(' ', '_')}",
            "message": f"Automation '{alias}' created and reloaded.",
        }
    except Exception as exc:
        return {"error": f"Failed to create automation: {exc}"}


async def _tool_ha_update_automation(hass: HomeAssistant, params: dict) -> dict:
    """Met à jour une automation existante dans automations.yaml."""
    import yaml
    from pathlib import Path

    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id is required"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_update_automation")

    try:
        auto_file = Path(hass.config.config_dir) / "automations.yaml"
        if not auto_file.exists():
            return {"error": "automations.yaml not found"}

        raw = await hass.async_add_executor_job(auto_file.read_text, "utf-8")
        automations = yaml.safe_load(raw) or []
        if not isinstance(automations, list):
            return {"error": "automations.yaml has unexpected format"}

        # Find automation
        target_idx = None
        search_name = entity_id.replace("automation.", "").replace("_", " ")
        state = hass.states.get(entity_id)
        friendly = state.attributes.get("friendly_name", "") if state else ""

        for idx, auto in enumerate(automations):
            if not isinstance(auto, dict):
                continue
            if (auto.get("alias", "").lower() == friendly.lower()
                    or auto.get("alias", "").lower() == search_name.lower()
                    or str(auto.get("id", "")) in entity_id):
                target_idx = idx
                break

        if target_idx is None:
            return {"error": f"Automation '{entity_id}' not found in automations.yaml. "
                             f"Note: only YAML automations can be updated this way."}

        auto = automations[target_idx]

        # Apply updates — accept both new format (triggers/actions/conditions) and legacy
        if params.get("alias"):
            auto["alias"] = params["alias"]
        if "description" in params:
            auto["description"] = params["description"]

        # triggers / trigger
        new_triggers = params.get("triggers") if params.get("triggers") is not None else params.get("trigger")
        if new_triggers is not None:
            auto["triggers"] = [new_triggers] if isinstance(new_triggers, dict) else new_triggers
            auto.pop("trigger", None)  # remove legacy key if present

        # conditions / condition
        new_conditions = params.get("conditions") if params.get("conditions") is not None else params.get("condition")
        if new_conditions is not None:
            auto["conditions"] = [new_conditions] if isinstance(new_conditions, dict) else new_conditions
            auto.pop("condition", None)

        # actions / action
        new_actions = params.get("actions") if params.get("actions") is not None else params.get("action")
        if new_actions is not None:
            auto["actions"] = [new_actions] if isinstance(new_actions, dict) else new_actions
            auto.pop("action", None)

        # append_action (always appends to actions key, regardless of format)
        if params.get("append_action") is not None:
            ap = params["append_action"]
            new_ap = [ap] if isinstance(ap, dict) else ap
            existing = auto.get("actions") or auto.get("action", [])
            if isinstance(existing, dict):
                existing = [existing]
            auto["actions"] = existing + new_ap
            auto.pop("action", None)

        if params.get("mode"):
            auto["mode"] = params["mode"]

        automations[target_idx] = auto
        new_yaml = yaml.dump(automations, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _safe_write_and_reload(hass, auto_file, new_yaml, "automation")

        return {
            "success": True,
            "alias": auto.get("alias"),
            "message": f"Automation '{auto.get('alias')}' updated and reloaded.",
        }
    except Exception as exc:
        return {"error": f"Failed to update automation: {exc}"}


async def _tool_ha_get_automation_traces(hass: HomeAssistant, params: dict) -> dict:
    """Récupère les traces d'exécution d'une automation pour le débogage."""
    entity_id = params.get("entity_id", "").strip()
    limit = int(params.get("limit", 5))

    if not entity_id:
        return {"error": "entity_id is required"}

    state = hass.states.get(entity_id)
    if not state:
        return {"error": f"Automation '{entity_id}' not found"}

    attrs = state.attributes
    result: dict[str, Any] = {
        "entity_id": entity_id,
        "alias": attrs.get("friendly_name", entity_id),
        "current_state": state.state,
        "last_triggered": attrs.get("last_triggered"),
        "mode": attrs.get("mode", "single"),
        "current_task_count": attrs.get("current", 0),
        "max_tasks": attrs.get("max", 10),
    }

    # Tenter d'accéder aux traces depuis hass.data
    traces = []
    try:
        automation_domain_data = hass.data.get("automation", {})
        # HA stores automation entities in different ways by version
        # Try common keys
        for key in [entity_id, entity_id.replace("automation.", "")]:
            entity_obj = automation_domain_data.get(key)
            if entity_obj and hasattr(entity_obj, "traces"):
                raw_traces = entity_obj.traces
                for trace in list(raw_traces)[-limit:]:
                    trace_info: dict[str, Any] = {}
                    if hasattr(trace, "as_dict"):
                        trace_info = trace.as_dict()
                    elif hasattr(trace, "__dict__"):
                        trace_info = {
                            "run_id": getattr(trace, "run_id", "?"),
                            "timestamp": str(getattr(trace, "timestamp", "")),
                            "trigger": getattr(trace, "trigger", {}),
                            "result": getattr(trace, "result", {}),
                        }
                    traces.append(trace_info)
                break
    except Exception as exc:
        _LOGGER.debug("[HACA MCP] Trace access error: %s", exc)
        result["trace_note"] = (
            "Full traces require HA Automation Traces API. "
            "Check Developer Tools → Events → automation_triggered for debug info."
        )

    if traces:
        result["traces"] = traces[-limit:]
    else:
        # Provide actionable debug info from attributes
        result["debug_hints"] = [
            f"Last triggered: {attrs.get('last_triggered', 'never')}",
            f"Mode: {attrs.get('mode', 'single')} — {'could block if already running' if attrs.get('mode') == 'single' else 'ok'}",
            "Check Developer Tools → Automations → [select automation] → Traces for full execution log",
            "Common issues: trigger conditions not met, entity unavailable, condition blocking execution",
        ]

    return result


async def _tool_ha_get_lovelace(hass: HomeAssistant, params: dict) -> dict:
    """Lit la configuration Lovelace (dashboard)."""
    dashboard_id = params.get("dashboard_id") or "lovelace"

    try:
        # Try storage-mode Lovelace
        lovelace_data = hass.data.get("lovelace", {})

        # Try to get the dashboard config
        config = None
        dashboard = lovelace_data.get(dashboard_id) or lovelace_data.get("lovelace")

        if dashboard and hasattr(dashboard, "async_load"):
            config = await dashboard.async_load(force=False)
        elif dashboard and hasattr(dashboard, "_data"):
            config = dashboard._data

        if config:
            # Return structure summary to avoid huge payloads
            views = config.get("views", [])
            return {
                "dashboard_id": dashboard_id,
                "mode": "storage",
                "title": config.get("title", "Home"),
                "views_count": len(views),
                "views": [
                    {
                        "index": i,
                        "title": v.get("title", v.get("path", f"View {i}")),
                        "path": v.get("path", str(i)),
                        "cards_count": len(v.get("cards", [])),
                        "card_types": list({c.get("type", "unknown") for c in v.get("cards", []) if isinstance(c, dict)}),
                    }
                    for i, v in enumerate(views)
                ],
                "raw_config_available": True,
            }
        else:
            # YAML mode or not found
            return {
                "dashboard_id": dashboard_id,
                "mode": "yaml",
                "note": (
                    "Dashboard appears to be in YAML mode or not accessible. "
                    "To add cards programmatically, use the HA UI (Edit Dashboard) "
                    "or switch to storage mode in Settings → Dashboards."
                ),
            }
    except Exception as exc:
        return {"error": f"Failed to read Lovelace config: {exc}"}


async def _tool_ha_add_lovelace_card(hass: HomeAssistant, params: dict) -> dict:
    """Ajoute une carte à un dashboard Lovelace (mode storage)."""
    dashboard_id = params.get("dashboard_id") or "lovelace"
    view_index = int(params.get("view_index", 0))
    card = params.get("card")

    if not card or not isinstance(card, dict):
        return {"error": "card is required and must be an object"}
    if "type" not in card:
        return {"error": "card must have a 'type' field, e.g. 'entities', 'weather-forecast'"}

    try:
        lovelace_data = hass.data.get("lovelace", {})
        dashboard = lovelace_data.get(dashboard_id) or lovelace_data.get("lovelace")

        if not dashboard or not hasattr(dashboard, "async_save"):
            return {
                "error": "Dashboard is in YAML mode or not accessible for programmatic editing.",
                "suggestion": (
                    "Switch to storage mode: Settings → Dashboards → [your dashboard] → Edit. "
                    "Or add the card manually via the UI Add Card button."
                ),
            }

        config = await dashboard.async_load(force=True)
        views = config.get("views", [])

        if view_index >= len(views):
            return {"error": f"View index {view_index} out of range (dashboard has {len(views)} views)"}

        views[view_index].setdefault("cards", []).append(card)
        config["views"] = views

        await dashboard.async_save(config)

        return {
            "success": True,
            "dashboard_id": dashboard_id,
            "view_index": view_index,
            "view_title": views[view_index].get("title", f"View {view_index}"),
            "card_type": card.get("type"),
            "message": f"Card '{card.get('type')}' added to view '{views[view_index].get('title', view_index)}'.",
        }
    except Exception as exc:
        return {"error": f"Failed to add Lovelace card: {exc}"}


async def _tool_ha_create_script(hass: HomeAssistant, params: dict) -> dict:
    """Crée ou met à jour un script dans scripts.yaml."""
    import yaml
    from pathlib import Path

    script_id = params.get("script_id", "").strip().lower().replace(" ", "_")
    alias = params.get("alias", "").strip()
    sequence = params.get("sequence")

    if not script_id or not alias or not sequence:
        return {"error": "script_id, alias and sequence are required"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_create_script")
    if not isinstance(sequence, list):
        sequence = [sequence]

    script_def: dict[str, Any] = {
        "alias": alias,
        "description": params.get("description", ""),
        "mode": params.get("mode", "single"),
        "sequence": sequence,
    }

    try:
        scripts_file = Path(hass.config.config_dir) / "scripts.yaml"
        existing: dict = {}
        if scripts_file.exists():
            raw = await hass.async_add_executor_job(scripts_file.read_text, "utf-8")
            existing = yaml.safe_load(raw) or {}
            if not isinstance(existing, dict):
                existing = {}

        action = "updated" if script_id in existing else "created"
        existing[script_id] = script_def
        new_yaml = yaml.dump(existing, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _safe_write_and_reload(hass, scripts_file, new_yaml, "script")

        return {
            "success": True,
            "script_id": script_id,
            "entity_id": f"script.{script_id}",
            "alias": alias,
            "action": action,
            "message": f"Script '{alias}' {action} and reloaded. Call it with ha_call_service(domain='script', service='{script_id}').",
        }
    except Exception as exc:
        return {"error": f"Failed to create script: {exc}"}


# ─── Dispatcher des outils ────────────────────────────────────────────────

TOOL_HANDLERS = {
    # ── HACA audit tools ─────────────────────────────────────────────────
    "haca_get_issues":        _tool_get_issues,
    "haca_get_score":         _tool_get_score,
    "haca_get_automation":    _tool_get_automation,
    "haca_fix_suggestion":    _tool_fix_suggestion,
    "haca_apply_fix":         _tool_apply_fix,
    "haca_get_batteries":     _tool_get_batteries,
    "haca_explain_issue":     _tool_explain_issue,
    # ── HA control tools — v1.4 ──────────────────────────────────────────
    # NOTE: v1.5 tools are added via TOOL_HANDLERS.update({}) blocks placed
    # immediately after their function definitions further down in this file.
    "ha_get_entities":          _tool_ha_get_entities,
    "ha_call_service":          _tool_ha_call_service,
    "ha_create_automation":     _tool_ha_create_automation,
    "ha_update_automation":     _tool_ha_update_automation,
    "ha_get_automation_traces": _tool_ha_get_automation_traces,
    "ha_get_lovelace":          _tool_ha_get_lovelace,
    "ha_add_lovelace_card":     _tool_ha_add_lovelace_card,
    "ha_create_script":         _tool_ha_create_script,
}


# ─── JSON-RPC handler ─────────────────────────────────────────────────────

async def _handle_jsonrpc(hass: HomeAssistant, body: dict) -> dict:
    """Traite un message JSON-RPC 2.0 MCP et retourne la réponse."""
    req_id = body.get("id")
    method = body.get("method", "")
    params = body.get("params", {})

    def _ok(result: Any) -> dict:
        return {"jsonrpc": "2.0", "id": req_id, "result": result}

    def _err(code: int, message: str) -> dict:
        return {"jsonrpc": "2.0", "id": req_id,
                "error": {"code": code, "message": message}}

    try:
        if method == "initialize":
            return _ok({
                "protocolVersion": MCP_PROTOCOL_VERSION,
                "capabilities": {
                    "tools": {"listChanged": False},
                },
                "serverInfo": {
                    "name": MCP_SERVER_NAME,
                    "version": MCP_SERVER_VERSION,
                },
                "instructions": (
                    "H.A.C.A MCP Server — Full Home Assistant control + audit.\n"
                    "\n"
                    "=== CORE WORKFLOWS ===\n"
                    "START        : haca_get_score() → health overview.\n"
                    "AUDIT        : haca_get_issues() → haca_explain_issue() → haca_apply_fix()\n"
                    "CONTROL      : ha_get_entities() to discover, ha_call_service() to act.\n"
                    "AUTOMATE     : ha_create_automation() or ha_update_automation()\n"
                    "DELETE AUTO  : ha_backup_create() → ha_remove_automation()\n"
                    "DEBUG        : ha_get_automation_traces() + ha_get_logbook() to diagnose failures.\n"
                    "DASHBOARD    : ha_get_lovelace() → ha_add_lovelace_card()\n"
                    "SCRIPTS      : ha_create_script() to build reusable sequences.\n"
                    "TEMPLATE     : ha_eval_template() to test Jinja2 before writing.\n"
                    "RENAME       : ha_rename_entity() to fix names, icons, or area assignments.\n"
                    "VALIDATE     : ha_check_config() after any YAML edit, before reloading.\n"
                    "HISTORY      : ha_get_history() for state changes, ha_get_statistics() for trends.\n"
                    "SEARCH       : ha_deep_search(query) to find all automations using an entity.\n"
                    "HELPERS      : ha_config_list_helpers() → ha_config_set_helper() / ha_config_remove_helper()\n"
                    "BLUEPRINT    : ha_backup_create() → haca_get_automation() → ha_create_blueprint(automation_entity_id, name, description, inputs?)\n"
                    "BP EDIT      : ha_list_blueprints() → ha_get_blueprint(path) → ha_update_blueprint(path, ...) | ha_remove_blueprint(path)\n"
                    "BP IMPORT    : ha_import_blueprint(url) → reloaded automatically\n"
                    "SCRIPTS      : ha_get_script(entity_id) → ha_update_script() | ha_remove_script()\n"
                    "SCENES       : ha_get_scene(entity_id) → ha_update_scene() | ha_remove_scene() | ha_create_scene()\n"
                    "DASHBOARDS   : ha_list_dashboards() → ha_get_lovelace() → ha_update_lovelace_card() | ha_remove_lovelace_card()\n"
                    "HELPERS      : ha_get_helper(entity_id) → ha_update_helper() | ha_config_remove_helper()\n"
                    "ENTITIES     : ha_get_entity_detail(entity_id) → ha_enable_entity() | ha_remove_entity(force?)\n"
                    "SECURITY     : ha_get_config_file('secrets.yaml') → ha_update_config_file(patch_line) → ha_check_config()\n"
                    "LABELS       : ha_list_labels() → ha_create_label() → ha_manage_entity_labels()\n"
                    "\n"
                    "=== SAFETY RULES ===\n"
                    "1. ALWAYS call ha_backup_create() before any destructive operation "
                    "(delete automation/helper, bulk refactor, rename entity_id).\n"
                    "2. ALWAYS call ha_check_config() after writing to YAML files and before reloading.\n"
                    "3. ALWAYS call ha_eval_template() to validate Jinja2 before inserting in automations.\n"
                    "4. ALWAYS call ha_get_entities() to find the real entity_id — never guess.\n"
                    "5. ALWAYS call ha_deep_search(entity_id) before renaming/deleting an entity "
                    "to find all automations that reference it.\n"
                    "\n"
                    "=== ADDITIONAL TOOLS ===\n"
                    "SYSTEM     : ha_get_system_health() for HA version & integration errors.\n"
                    "UPDATES    : ha_get_updates() to list pending HA/add-on updates.\n"
                    "RELOAD     : ha_reload_core(domain) to reload any domain after YAML edits.\n"
                    "SERVICES   : ha_list_services(domain) to discover available services before calling them.\n"
                    "AREAS      : ha_config_set_area() to create/update rooms before assigning entities.\n"
                    "LABELS     : ha_manage_entity_labels() to tag entities from HACA audit results.\n"
                    "BLUEPRINT  : ha_create_blueprint(automation_entity_id) to convert any automation "
                    "into a reusable Blueprint file saved in /config/blueprints/automation/haca/. "
                    "ALWAYS use this tool — never just describe or suggest a blueprint in text."
                ),
            })

        elif method == "notifications/initialized":
            # Notification côté client — aucune réponse requise
            return {}

        elif method == "tools/list":
            return _ok({"tools": MCP_TOOLS})

        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})

            handler = TOOL_HANDLERS.get(tool_name)
            if not handler:
                return _err(-32601, f"Outil '{tool_name}' inconnu")

            result = await handler(hass, tool_args)
            return _ok({
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, ensure_ascii=False, indent=2),
                    }
                ],
                "isError": "error" in result,
            })

        elif method == "ping":
            return _ok({})

        else:
            return _err(-32601, f"Méthode '{method}' non supportée")

    except Exception as exc:
        _LOGGER.error("[HACA MCP] Handler error for method '%s': %s", method, exc)
        return _err(-32603, f"Erreur interne: {exc}")


# ─── aiohttp Views ────────────────────────────────────────────────────────

class HacaMcpView(HomeAssistantView):
    """Vue HTTP principale MCP — POST (JSON-RPC) + GET (SSE keepalive)."""

    url = "/api/haca_mcp"
    name = "api:haca_mcp"
    requires_auth = False  # Auth gérée manuellement (Bearer token)
    cors_allowed = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def post(self, request: web.Request) -> web.Response:
        """Reçoit et traite les messages JSON-RPC 2.0."""
        _LOGGER.debug(
            "[HACA MCP] POST reçu — IP=%s Content-Type=%s",
            request.remote, request.content_type,
        )
        user_id = await _check_auth(request, self._hass)
        if not user_id:
            return web.Response(
                status=401,
                text=json.dumps({
                    "jsonrpc": "2.0", "id": None,
                    "error": {"code": -32001, "message": "Unauthorized — Bearer token required"}
                }),
                content_type="application/json",
            )

        try:
            body = await request.json()
        except Exception as parse_exc:
            _LOGGER.warning("[HACA MCP] JSON parse error: %s", parse_exc)
            return web.Response(
                status=400,
                text=json.dumps({
                    "jsonrpc": "2.0", "id": None,
                    "error": {"code": -32700, "message": "Parse error — invalid JSON"}
                }),
                content_type="application/json",
            )

        # Batch requests (tableau de requêtes)
        if isinstance(body, list):
            _LOGGER.debug("[HACA MCP] Batch request — %d messages", len(body))
            responses = []
            for msg in body:
                resp = await _handle_jsonrpc(self._hass, msg)
                if resp:
                    responses.append(resp)
            return web.Response(
                text=json.dumps(responses, ensure_ascii=False),
                content_type="application/json",
            )

        # Single request
        method = body.get("method", "?")
        _LOGGER.debug("[HACA MCP] method=%s user=%s", method, user_id)
        result = await _handle_jsonrpc(self._hass, body)
        if not result:
            return web.Response(status=204)

        return web.Response(
            text=json.dumps(result, ensure_ascii=False),
            content_type="application/json",
        )

    async def get(self, request: web.Request) -> web.Response:
        """SSE endpoint — keepalive pour clients MCP compatibles SSE."""
        user_id = await _check_auth(request, self._hass)
        if not user_id:
            return web.Response(status=401, text="Unauthorized")

        response = web.StreamResponse(
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
        await response.prepare(request)

        # Envoyer l'événement endpoint pour les clients MCP
        endpoint_url = str(request.url).replace("/api/haca_mcp", "/api/haca_mcp")
        await response.write(
            f"event: endpoint\ndata: {json.dumps({'url': str(request.url)})}\n\n".encode()
        )

        # Keepalive toutes les 15 secondes
        try:
            while True:
                await asyncio.sleep(15)
                if request.transport and not request.transport.is_closing():
                    await response.write(b": keepalive\n\n")
                else:
                    break
        except (asyncio.CancelledError, ConnectionResetError):
            pass

        return response


class HacaMcpInfoView(HomeAssistantView):
    """Vue d'information publique — pas d'auth requise."""

    url = "/api/haca_mcp/info"
    name = "api:haca_mcp_info"
    requires_auth = False
    cors_allowed = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        cdata = _get_coordinator_data(self._hass)
        info = {
            "name": MCP_SERVER_NAME,
            "version": MCP_SERVER_VERSION,
            "protocol_version": MCP_PROTOCOL_VERSION,
            "description": "H.A.C.A — Home Assistant Config Auditor MCP Server",
            "endpoint": "/api/haca_mcp",
            "auth": "Bearer <HA Long-Lived Access Token>",
            "tools_count": len(MCP_TOOLS),
            "tools": [t["name"] for t in MCP_TOOLS],
            "health_score": cdata.get("health_score"),
            "total_issues": cdata.get("total_issues"),
            "claude_code_config": {
                "example": {
                    "mcpServers": {
                        "haca": {
                            "command": "npx",
                            "args": ["-y", "@modelcontextprotocol/server-proxy"],
                            "env": {
                                "MCP_SERVER_URL": "<HA_URL>/api/haca_mcp",
                                "MCP_AUTH_HEADER": "Authorization: Bearer <TOKEN>",
                            },
                        }
                    }
                }
            },
        }
        return web.Response(
            text=json.dumps(info, ensure_ascii=False, indent=2),
            content_type="application/json",
        )


# ─── Setup ────────────────────────────────────────────────────────────────

_MCP_VIEWS_KEY = f"{DOMAIN}_mcp_views_registered"


async def async_setup_mcp_server(hass: HomeAssistant) -> None:
    """Enregistre les vues HTTP MCP (une seule fois par process HA)."""
    if hass.data.get(_MCP_VIEWS_KEY):
        _LOGGER.debug("[HACA MCP] Views already registered — skipping")
        return

    try:
        hass.http.register_view(HacaMcpView(hass))
        hass.http.register_view(HacaMcpInfoView(hass))
        hass.data[_MCP_VIEWS_KEY] = True
        _LOGGER.info(
            "✅ [HACA MCP] Server registered at /api/haca_mcp "
            "(auth: Bearer <HA Long-Lived Access Token>)"
        )
    except Exception as exc:
        _LOGGER.error("[HACA MCP] Registration error: %s", exc)


# ═══════════════════════════════════════════════════════════════════════════════
#  v1.5.0 — 5 NEW TOOLS: backup_create · check_config · remove_automation
#                         eval_template · rename_entity
# ═══════════════════════════════════════════════════════════════════════════════

# ── Tool definitions ────────────────────────────────────────────────────────

_HA_EXTENDED_TOOLS: list[dict[str, Any]] = [
    {
        "name": "ha_backup_create",
        "description": (
            "Create a full Home Assistant backup (native HA snapshot, .tar). "
            "The backup appears in Settings → Backups and can be restored via the HA UI. "
            "ALWAYS call this before making any destructive changes (deleting automations, "
            "bulk modifications, refactoring scripts). Returns the backup ID and name."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Backup name, e.g. 'pre-haca-refactor-2025-01-15'. "
                                   "Defaults to 'HACA backup <datetime>'.",
                },
            },
        },
    },
    {
        "name": "ha_check_config",
        "description": (
            "Validate the current Home Assistant configuration without restarting. "
            "Checks automations.yaml, scripts.yaml, configuration.yaml and all included files. "
            "Returns a list of errors if the config is invalid. "
            "Call this after writing to any YAML config file to confirm it is valid "
            "before reloading. Returns {valid: true} if no errors found."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "ha_remove_automation",
        "description": (
            "Permanently delete an automation from automations.yaml. "
            "The automation is reloaded immediately after deletion. "
            "IMPORTANT: call ha_backup_create first if this is a destructive operation. "
            "Use haca_get_automation to inspect the automation before deleting."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {
                    "type": "string",
                    "description": "entity_id or alias of the automation to delete, "
                                   "e.g. 'automation.morning_routine' or 'Morning routine'.",
                },
            },
        },
    },
    {
        "name": "ha_eval_template",
        "description": (
            "Evaluate a Jinja2 template against the live Home Assistant state and return its rendered value. "
            "Use this to test templates before writing them into automations or scripts. "
            "Examples: '{{ states(\"sensor.temperature\") }}', "
            "'{{ now().hour >= 22 or now().hour < 7 }}'. "
            "Returns the rendered string and whether it raised an error."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["template"],
            "properties": {
                "template": {
                    "type": "string",
                    "description": "Jinja2 template string to evaluate, e.g. '{{ states(\"light.salon\") }}'",
                },
            },
        },
    },
    {
        "name": "ha_rename_entity",
        "description": (
            "Rename a Home Assistant entity: change its friendly_name, entity_id, icon, or area. "
            "Use this to fix HACA conformity issues: raw entity names, missing icons, missing areas. "
            "Only the fields you provide are updated — others are left unchanged. "
            "Note: changing entity_id may break existing automations that reference the old id."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {
                    "type": "string",
                    "description": "Current entity_id, e.g. 'light.salon_plafonnier'",
                },
                "new_name": {
                    "type": "string",
                    "description": "New friendly name, e.g. 'Salon — Plafonnier'",
                },
                "new_entity_id": {
                    "type": "string",
                    "description": "New entity_id slug (optional, risky — may break automations)",
                },
                "icon": {
                    "type": "string",
                    "description": "MDI icon, e.g. 'mdi:ceiling-light'",
                },
                "area_id": {
                    "type": "string",
                    "description": "Area ID to assign to this entity. "
                                   "Use ha_get_entities to find valid area_ids.",
                },
            },
        },
    },
    {
        "name": "ha_create_blueprint",
        "description": (
            "Convert an existing Home Assistant automation into a reusable Blueprint YAML file "
            "and save it to /config/blueprints/automation/haca/<slug>.yaml. "
            "Reads the actual automation YAML, extracts entity references as blueprint inputs, "
            "then writes a fully valid blueprint file and reloads blueprints. "
            "Use this when the user asks to migrate an automation to a blueprint, "
            "create a blueprint from an automation, or make an automation reusable. "
            "Returns the blueprint file path and the full YAML written."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["automation_entity_id"],
            "properties": {
                "automation_entity_id": {
                    "type": "string",
                    "description": (
                        "entity_id or alias of the automation to convert, "
                        "e.g. 'automation.entree_vide_duppliquer' or 'Entrée vide duppliquer'."
                    ),
                },
                "blueprint_name": {
                    "type": "string",
                    "description": (
                        "Display name for the blueprint. "
                        "Defaults to the automation alias."
                    ),
                },
                "blueprint_description": {
                    "type": "string",
                    "description": (
                        "Description of what this blueprint does and when to use it. "
                        "Will appear in the HA blueprint import UI."
                    ),
                },
                "inputs": {
                    "type": "object",
                    "description": (
                        "Optional: map of blueprint input variables to define. "
                        "Keys are input names (slugs), values are objects with "
                        "{name, description, selector, default?}. "
                        "Example: {\"target_light\": {\"name\": \"Light\", \"selector\": {\"entity\": {\"domain\": \"light\"}}}}. "
                        "If omitted, HACA auto-extracts entity_id inputs from the automation."
                    ),
                },
            },
        },
    },
]

MCP_TOOLS.extend(_HA_EXTENDED_TOOLS)


# ── Handlers ────────────────────────────────────────────────────────────────

async def _safe_write_and_reload(
    hass: "HomeAssistant",
    path,
    new_yaml: str,
    reload_domain: str,
) -> None:
    """Écriture atomique + reload avec rollback automatique si le reload échoue.

    1. Sauvegarde le contenu original en mémoire
    2. Écrit new_yaml de façon atomique
    3. Lance automation/script/scene reload
    4. Si le reload lève une exception → restaure l'original et relance
    """
    original_content = await hass.async_add_executor_job(
        lambda: open(str(path), encoding="utf-8").read() if __import__("os").path.exists(str(path)) else ""
    )
    await hass.async_add_executor_job(_atomic_write, path, new_yaml)
    try:
        await hass.services.async_call(reload_domain, "reload", blocking=True)
    except Exception as reload_exc:
        # Rollback
        if original_content:
            await hass.async_add_executor_job(_atomic_write, path, original_content)
            try:
                await hass.services.async_call(reload_domain, "reload", blocking=True)
            except Exception:
                pass  # Best-effort rollback reload
        raise RuntimeError(
            f"Reload failed after writing {path.name} — file restored to original. "
            f"Error: {reload_exc}"
        ) from reload_exc


async def _async_read_file(hass: "HomeAssistant", path: str, encoding: str = "utf-8") -> str:
    """Lire un fichier de façon non-bloquante via executor."""
    return await hass.async_add_executor_job(
        lambda: open(path, encoding=encoding).read()
    )


async def _async_write_file(hass: "HomeAssistant", path: str, content: str, encoding: str = "utf-8") -> None:
    """Écrire un fichier de façon non-bloquante via executor (atomique)."""
    await hass.async_add_executor_job(_atomic_write, path, content, encoding)


async def _auto_backup(hass: HomeAssistant, reason: str) -> None:
    """Déclenche un backup HA en arrière-plan avant une opération destructive.

    Délègue à _tool_ha_backup_create (source unique de la logique backup)
    et lance la tâche en arrière-plan pour ne pas bloquer l'outil.
    """
    from datetime import datetime as _dt
    name = f"HACA auto — {reason[:40]} — {_dt.now().strftime('%Y-%m-%d %H:%M')}"
    _LOGGER.warning("[HACA] Auto-backup avant opération destructive : %s", name)

    async def _run():
        try:
            result = await _tool_ha_backup_create(hass, {"name": name})
            if result.get("success"):
                _LOGGER.info("[HACA] Auto-backup lancé : %s", name)
            else:
                _LOGGER.warning("[HACA] Auto-backup résultat : %s", result)
        except Exception as exc:
            _LOGGER.warning("[HACA] Auto-backup échoué (non bloquant) : %s", exc)

    hass.async_create_task(_run())



async def _tool_ha_backup_create(hass: HomeAssistant, params: dict) -> dict:
    """Create a full HA backup. Supports HA 2024.x (service) and HA 2025.x (manager API)."""
    from datetime import datetime
    import inspect

    name = params.get("name", "").strip()
    if not name:
        name = f"HACA backup {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    errors: list[str] = []

    # ── Strategy 1: BackupManager internal API (HA 2025.1+) ──────────────
    # DATA_MANAGER key is set in hass.data by the backup component
    try:
        from homeassistant.components.backup.const import DATA_MANAGER  # type: ignore
    except ImportError:
        DATA_MANAGER = None  # type: ignore

    if DATA_MANAGER is not None:
        try:
            manager = hass.data.get(DATA_MANAGER)
            if manager is None:
                errors.append("hass.data[DATA_MANAGER] is None — backup component not loaded?")
            else:
                create_fn = getattr(manager, "async_create_backup", None)
                if create_fn is None:
                    errors.append("BackupManager has no async_create_backup method")
                else:
                    sig = inspect.signature(create_fn)
                    # HA 2025.1+ takes agent_ids + include_* kwargs
                    if "agent_ids" in sig.parameters:
                        # Collect available agent IDs from the manager
                        agents = getattr(manager, "backup_agents", {})
                        agent_ids = list(agents.keys()) if agents else []

                        kwargs: dict = {
                            "agent_ids": agent_ids,
                            "include_all_addons": True,
                            "include_database": True,
                            "include_homeassistant": True,
                            "name": name,
                            "password": None,
                        }
                        # Some HA versions require these extra params
                        if "include_addons" in sig.parameters:
                            kwargs["include_addons"] = None
                        if "include_folders" in sig.parameters:
                            # Mirror the native HA full-backup behaviour:
                            # include media, share, ssl and locally-installed addons.
                            try:
                                from homeassistant.components.backup import Folder  # type: ignore
                                kwargs["include_folders"] = list(Folder)
                            except Exception:
                                # Fallback: pass the string values directly
                                kwargs["include_folders"] = ["media", "share", "ssl", "addons/local"]
                    else:
                        # Older manager API (no agent_ids)
                        kwargs = {}
                        if "name" in sig.parameters:
                            kwargs["name"] = name

                    # Fire as background task — backups take minutes
                    hass.async_create_task(create_fn(**kwargs))
                    return {
                        "success": True,
                        "name": name,
                        "message": (
                            f"Backup '{name}' started via BackupManager. "
                            "This may take several minutes — check Settings → System → Backups."
                        ),
                    }
        except Exception as exc:
            errors.append(f"BackupManager API: {exc}")

    # ── Strategy 2: backup.create service (HA pre-2025.1, Core/Container) ──
    if hass.services.has_service("backup", "create"):
        try:
            await hass.services.async_call("backup", "create", blocking=False)
            return {
                "success": True,
                "name": name,
                "message": "Backup triggered via backup.create service. "
                           "Check Settings → System → Backups in a few minutes.",
            }
        except Exception as exc:
            errors.append(f"backup.create service: {exc}")

    # ── Strategy 3: Supervisor REST API (HAOS / Supervised) ────────────────
    try:
        import os
        import aiohttp
        supervisor_token = os.environ.get("SUPERVISOR_TOKEN") or os.environ.get("HASSIO_TOKEN")
        if supervisor_token:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://supervisor/backups/new/full",
                    json={"name": name},
                    headers={
                        "Authorization": f"Bearer {supervisor_token}",
                        "Content-Type": "application/json",
                    },
                    timeout=aiohttp.ClientTimeout(total=300),
                ) as resp:
                    if resp.status in (200, 201):
                        data = await resp.json()
                        return {
                            "success": True,
                            "backup_id": data.get("data", {}).get("slug"),
                            "name": name,
                            "message": f"Backup '{name}' created via Supervisor REST API. "
                                       "Visible in Settings → System → Backups.",
                        }
                    text = await resp.text()
                    errors.append(f"Supervisor API HTTP {resp.status}: {text[:200]}")
        else:
            errors.append("No SUPERVISOR_TOKEN env var (not HAOS/Supervised)")
    except Exception as exc:
        errors.append(f"Supervisor REST API: {exc}")

    return {
        "error": "All backup strategies failed.",
        "attempts": errors,
        "hint": (
            "Create a manual backup: Settings → System → Backups → Create backup.\n"
            "Ensure the 'Backup' integration is loaded in Home Assistant."
        ),
    }


async def _tool_ha_check_config(hass: HomeAssistant, params: dict) -> dict:
    """Validate HA config files without restarting."""
    try:
        result = await hass.services.async_call(
            "homeassistant",
            "check_config",
            blocking=True,
            return_response=True,
        )

        if isinstance(result, dict):
            errors = result.get("errors") or result.get("error")
            warnings = result.get("warnings", [])

            if not errors:
                return {
                    "valid": True,
                    "warnings": warnings if warnings else [],
                    "message": "Configuration is valid. No errors found.",
                }
            return {
                "valid": False,
                "errors": errors if isinstance(errors, list) else [str(errors)],
                "warnings": warnings if warnings else [],
                "message": "Configuration has errors — do NOT reload until fixed.",
            }

        # Fallback: use the check_config component directly
        from homeassistant.helpers.check_config import async_check_ha_config_file
        result2 = await async_check_ha_config_file(hass)
        errors2 = result2.errors if hasattr(result2, "errors") else []
        warnings2 = result2.warnings if hasattr(result2, "warnings") else []

        if not errors2:
            return {
                "valid": True,
                "warnings": [str(w) for w in warnings2],
                "message": "Configuration is valid.",
            }
        return {
            "valid": False,
            "errors": [str(e) for e in errors2],
            "warnings": [str(w) for w in warnings2],
            "message": f"{len(errors2)} error(s) found in configuration.",
        }

    except Exception as exc:
        return {"error": f"Config check failed: {exc}"}


async def _tool_ha_remove_automation(hass: HomeAssistant, params: dict) -> dict:
    """Delete an automation from automations.yaml."""
    import yaml
    from pathlib import Path

    identifier = params.get("entity_id", "").strip()
    if not identifier:
        return {"error": "entity_id (or alias) is required"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_remove_automation")

    # Normalise: "automation.morning_routine" → look by entity_id or alias
    lookup = identifier.lower()
    if lookup.startswith("automation."):
        lookup_field = "entity_id_or_alias"
    else:
        lookup_field = "alias"

    try:
        auto_file = Path(hass.config.config_dir) / "automations.yaml"
        if not auto_file.exists():
            return {"error": "automations.yaml not found"}

        raw = await hass.async_add_executor_job(auto_file.read_text, "utf-8")
        automations: list = yaml.safe_load(raw) or []
        if not isinstance(automations, list):
            return {"error": "automations.yaml is not a list"}

        # Find the automation — priority order (most precise first):
        # 1. Exact match on HA numeric id (most reliable — never ambiguous)
        # 2. Exact match on entity_id slug (automation.xxx)
        # 3. Exact case-sensitive alias match
        # 4. Case-insensitive alias match (last resort — may be ambiguous)
        #
        # The old slugify heuristic (alias.lower().replace(" ","_")) is removed
        # because "Lumière salon" and "Lumiere salon" would both match the same slug.
        slug = identifier.removeprefix("automation.") if identifier.startswith("automation.") else None

        found_idx = None
        found_alias = None

        # Pass 1 — exact id or exact entity_id slug
        for i, a in enumerate(automations):
            if not isinstance(a, dict):
                continue
            ha_id = str(a.get("id", "")).strip()
            if ha_id and ha_id == (slug or identifier):
                found_idx = i
                found_alias = str(a.get("alias", "")).strip()
                break

        # Pass 2 — exact alias (case-sensitive, then case-insensitive)
        if found_idx is None:
            for sensitive in (True, False):
                for i, a in enumerate(automations):
                    if not isinstance(a, dict):
                        continue
                    alias_val = str(a.get("alias", "")).strip()
                    cmp_id  = alias_val if sensitive else alias_val.lower()
                    cmp_ref = identifier if sensitive else identifier.lower()
                    if cmp_id == cmp_ref:
                        found_idx = i
                        found_alias = alias_val
                        break
                if found_idx is not None:
                    break

        if found_idx is None:
            return {
                "error": f"Automation '{identifier}' not found in automations.yaml. "
                         f"Use ha_get_entities(domain='automation') to list available automations.",
            }

        # Remove it
        removed = automations.pop(found_idx)
        new_yaml = yaml.dump(automations, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _safe_write_and_reload(hass, auto_file, new_yaml, "automation")

        return {
            "success": True,
            "removed_alias": found_alias,
            "removed_id": removed.get("id", ""),
            "message": f"Automation '{found_alias}' deleted from automations.yaml and reloaded.",
        }

    except Exception as exc:
        return {"error": f"Failed to remove automation: {exc}"}


async def _tool_ha_eval_template(hass: HomeAssistant, params: dict) -> dict:
    """Render a Jinja2 template against the live HA state."""
    template_str = params.get("template", "").strip()
    if not template_str:
        return {"error": "template string is required"}

    try:
        from homeassistant.helpers.template import Template

        tpl = Template(template_str, hass)
        rendered = await hass.async_add_executor_job(tpl.async_render)

        return {
            "success": True,
            "template": template_str,
            "result": str(rendered),
            "type": type(rendered).__name__,
        }

    except Exception as exc:
        return {
            "success": False,
            "template": template_str,
            "error": str(exc),
            "hint": "Template raised an error. Check entity_ids and Jinja2 syntax.",
        }


async def _tool_ha_rename_entity(hass: HomeAssistant, params: dict) -> dict:
    """Rename/update entity properties via the entity registry."""
    from homeassistant.helpers import entity_registry as er, area_registry as ar

    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id is required"}

    new_name = params.get("new_name")
    new_entity_id = params.get("new_entity_id")
    icon = params.get("icon")
    area_id = params.get("area_id")

    if not any([new_name, new_entity_id, icon, area_id]):
        return {"error": "At least one of new_name, new_entity_id, icon, area_id must be provided"}

    try:
        entity_reg = er.async_get(hass)
        entry = entity_reg.entities.get(entity_id)

        if entry is None:
            return {
                "error": f"Entity '{entity_id}' not found in entity registry. "
                         f"Use ha_get_entities to verify the entity_id.",
            }

        # Validate area_id if provided
        if area_id:
            area_reg = ar.async_get(hass)
            if not area_reg.async_get_area(area_id):
                # Try fuzzy match by name
                matches = [
                    a for a in area_reg.async_list_areas()
                    if area_id.lower() in a.name.lower() or a.id == area_id
                ]
                if matches:
                    area_id = matches[0].id
                else:
                    return {
                        "error": f"Area '{area_id}' not found. "
                                 f"Valid areas: {[a.name + ' (' + a.id + ')' for a in area_reg.async_list_areas()]}",
                    }

        # Build kwargs — only pass what's changing
        kwargs: dict[str, Any] = {}
        if new_name is not None:
            kwargs["name"] = new_name
        if icon is not None:
            kwargs["icon"] = icon
        if area_id is not None:
            kwargs["area_id"] = area_id
        if new_entity_id is not None:
            kwargs["new_entity_id"] = new_entity_id

        updated = entity_reg.async_update_entity(entity_id, **kwargs)

        changes: list[str] = []
        if new_name:
            changes.append(f"name → '{new_name}'")
        if icon:
            changes.append(f"icon → '{icon}'")
        if area_id:
            area_reg = ar.async_get(hass)
            area = area_reg.async_get_area(area_id)
            changes.append(f"area → '{area.name if area else area_id}'")
        if new_entity_id:
            changes.append(f"entity_id → '{new_entity_id}'")

        return {
            "success": True,
            "entity_id": updated.entity_id,
            "changes": changes,
            "message": f"Entity '{entity_id}' updated: {', '.join(changes)}.",
            "warning": (
                f"entity_id changed from '{entity_id}' to '{new_entity_id}'. "
                "Update any automations or scripts that reference the old entity_id."
            ) if new_entity_id else None,
        }

    except Exception as exc:
        return {"error": f"Failed to update entity: {exc}"}

# Register v1.5.0 extended tools in TOOL_HANDLERS (after function definitions)
TOOL_HANDLERS.update({
    "ha_backup_create": _tool_ha_backup_create,
    "ha_check_config": _tool_ha_check_config,
    "ha_remove_automation": _tool_ha_remove_automation,
    "ha_eval_template": _tool_ha_eval_template,
    "ha_rename_entity": _tool_ha_rename_entity,
})

# ═══════════════════════════════════════════════════════════════════════════════
#  v1.5.1 — 7 MEDIUM PRIORITY TOOLS
#  ha_get_history · ha_get_statistics · ha_deep_search · ha_get_logbook
#  ha_config_list_helpers · ha_config_set_helper · ha_config_remove_helper
# ═══════════════════════════════════════════════════════════════════════════════

_HA_MEDIUM_TOOLS: list[dict[str, Any]] = [
    {
        "name": "ha_get_history",
        "description": (
            "Retrieve the state history of one or more entities over a time period. "
            "Returns timestamped state changes. Useful for debugging automations, "
            "understanding device behavior, battery drain analysis, and recorder impact audits. "
            "Defaults to the last 24 hours if no start/end provided."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_ids"],
            "properties": {
                "entity_ids": {
                    "oneOf": [{"type": "string"}, {"type": "array", "items": {"type": "string"}}],
                    "description": "One entity_id or list of entity_ids, e.g. 'sensor.temperature' or ['light.salon', 'switch.tv']",
                },
                "start": {
                    "type": "string",
                    "description": "ISO 8601 start datetime, e.g. '2025-01-15T00:00:00'. Defaults to 24h ago.",
                },
                "end": {
                    "type": "string",
                    "description": "ISO 8601 end datetime. Defaults to now.",
                },
                "limit": {
                    "type": "integer",
                    "default": 50,
                    "description": "Max state changes to return per entity (default 50).",
                },
            },
        },
    },
    {
        "name": "ha_get_statistics",
        "description": (
            "Retrieve long-term statistics for sensor entities (min, max, mean, sum per hour/day). "
            "Works for entities with statistics enabled in the recorder. "
            "Ideal for energy consumption analysis, temperature trends, and recorder impact audits. "
            "Returns aggregated data — not raw state changes."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["statistic_ids"],
            "properties": {
                "statistic_ids": {
                    "oneOf": [{"type": "string"}, {"type": "array", "items": {"type": "string"}}],
                    "description": "One or more statistic IDs (usually same as entity_id for sensors).",
                },
                "period": {
                    "type": "string",
                    "enum": ["5minute", "hour", "day", "week", "month"],
                    "default": "hour",
                    "description": "Aggregation period.",
                },
                "start": {
                    "type": "string",
                    "description": "ISO 8601 start datetime. Defaults to 7 days ago.",
                },
                "end": {
                    "type": "string",
                    "description": "ISO 8601 end datetime. Defaults to now.",
                },
            },
        },
    },
    {
        "name": "ha_deep_search",
        "description": (
            "Search inside automation and script YAML content — not just names. "
            "Finds all automations/scripts that reference a given entity_id, service, "
            "template string, or keyword inside their triggers, conditions, or actions. "
            "Essential before renaming or deleting an entity: find all automations that use it. "
            "Also useful for finding duplicate logic patterns."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Text to search for inside YAML content, e.g. 'light.entree', 'automation.trigger', 'notify.mobile_app'",
                },
                "scope": {
                    "type": "string",
                    "enum": ["automations", "scripts", "all"],
                    "default": "all",
                    "description": "Which files to search.",
                },
            },
        },
    },
    {
        "name": "ha_get_logbook",
        "description": (
            "Retrieve the Home Assistant logbook — chronological log of state changes, "
            "service calls, and automation triggers. "
            "Complements ha_get_automation_traces: use logbook to understand the sequence of events "
            "that led to (or prevented) an automation from firing. "
            "Defaults to the last 24 hours."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "entity_id": {
                    "type": "string",
                    "description": "Filter by entity_id (optional). Omit to get all logbook entries.",
                },
                "start": {
                    "type": "string",
                    "description": "ISO 8601 start datetime. Defaults to 24h ago.",
                },
                "end": {
                    "type": "string",
                    "description": "ISO 8601 end datetime. Defaults to now.",
                },
                "limit": {
                    "type": "integer",
                    "default": 50,
                    "description": "Max entries to return (default 50).",
                },
            },
        },
    },
    {
        "name": "ha_config_list_helpers",
        "description": (
            "List all helper entities in Home Assistant: input_boolean, input_number, input_text, "
            "input_select, input_datetime, counter, timer, schedule. "
            "Returns current state, attributes, and whether each helper is referenced in any automation. "
            "Use this to find orphan helpers (helpers unused by any automation or script)."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "helper_type": {
                    "type": "string",
                    "enum": [
                        "input_boolean", "input_number", "input_text",
                        "input_select", "input_datetime", "counter", "timer", "schedule", "all"
                    ],
                    "default": "all",
                    "description": "Filter by helper type. Default: return all helper types.",
                },
                "include_orphans_check": {
                    "type": "boolean",
                    "default": True,
                    "description": "If true, check each helper against automations.yaml and scripts.yaml to flag orphans.",
                },
            },
        },
    },
    {
        "name": "ha_config_set_helper",
        "description": (
            "Create or update a helper entity (input_boolean, input_number, input_text, "
            "input_select, input_datetime, counter, timer). "
            "If the helper_id already exists, it is updated; otherwise it is created. "
            "The helper is immediately reloaded and available in HA."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["helper_type", "name"],
            "properties": {
                "helper_type": {
                    "type": "string",
                    "enum": ["input_boolean", "input_number", "input_text", "input_select", "input_datetime", "counter", "timer"],
                    "description": "Type of helper to create/update.",
                },
                "name": {
                    "type": "string",
                    "description": "Friendly name of the helper, e.g. 'Mode nuit actif'",
                },
                "helper_id": {
                    "type": "string",
                    "description": "Optional slug ID, e.g. 'mode_nuit_actif'. Auto-generated from name if omitted.",
                },
                "icon": {
                    "type": "string",
                    "description": "MDI icon, e.g. 'mdi:weather-night'",
                },
                "options": {
                    "description": "Additional type-specific options.",
                    "type": "object",
                    "properties": {
                        "min": {"type": "number", "description": "input_number: minimum value"},
                        "max": {"type": "number", "description": "input_number: maximum value"},
                        "step": {"type": "number", "description": "input_number: step"},
                        "unit_of_measurement": {"type": "string", "description": "input_number: unit"},
                        "options": {"type": "array", "items": {"type": "string"}, "description": "input_select: list of options"},
                        "initial": {"description": "input_boolean/number/text/select: initial value"},
                        "max_length": {"type": "integer", "description": "input_text: max length"},
                        "initial_value": {"type": "integer", "description": "counter: initial value"},
                        "minimum": {"type": "integer", "description": "counter: minimum"},
                        "maximum": {"type": "integer", "description": "counter: maximum"},
                        "step_counter": {"type": "integer", "description": "counter: step"},
                        "duration": {"type": "string", "description": "timer: duration as HH:MM:SS"},
                    },
                },
            },
        },
    },
    {
        "name": "ha_config_remove_helper",
        "description": (
            "Permanently delete a helper entity. "
            "IMPORTANT: call ha_backup_create first, and check ha_config_list_helpers "
            "with include_orphans_check to confirm the helper is not used before deleting. "
            "The helper is immediately removed from HA."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_id"],
            "properties": {
                "entity_id": {
                    "type": "string",
                    "description": "entity_id of the helper to delete, e.g. 'input_boolean.mode_nuit'",
                },
            },
        },
    },
]

MCP_TOOLS.extend(_HA_MEDIUM_TOOLS)


# ── Handlers — medium priority tools ────────────────────────────────────────

async def _tool_ha_get_history(hass: HomeAssistant, params: dict) -> dict:
    """Retrieve entity state history."""
    from datetime import datetime, timedelta, timezone
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.history import get_significant_states

    raw_ids = params.get("entity_ids", [])
    if isinstance(raw_ids, str):
        raw_ids = [raw_ids]

    now = datetime.now(timezone.utc)
    try:
        start_dt = datetime.fromisoformat(params["start"]).astimezone(timezone.utc) if params.get("start") else now - timedelta(hours=24)
        end_dt = datetime.fromisoformat(params["end"]).astimezone(timezone.utc) if params.get("end") else now
    except (ValueError, TypeError) as e:
        return {"error": f"Invalid datetime format: {e}. Use ISO 8601, e.g. '2025-01-15T00:00:00'"}

    limit = int(params.get("limit", 50))

    try:
        recorder = get_instance(hass)
        history = await recorder.async_add_executor_job(
            get_significant_states,
            hass, start_dt, end_dt, raw_ids, None, True, True, False
        )

        result: dict[str, list] = {}
        for eid, states in history.items():
            entries = []
            for s in states[-limit:]:
                entries.append({
                    "state": s.state,
                    "timestamp": s.last_changed.isoformat() if s.last_changed else None,
                    "attributes": {k: v for k, v in s.attributes.items() if k in ("unit_of_measurement", "friendly_name")},
                })
            result[eid] = entries

        total = sum(len(v) for v in result.values())
        return {
            "success": True,
            "entity_count": len(result),
            "total_states": total,
            "period": {"start": start_dt.isoformat(), "end": end_dt.isoformat()},
            "history": result,
        }

    except Exception as exc:
        return {"error": f"History query failed: {exc}"}


async def _tool_ha_get_statistics(hass: HomeAssistant, params: dict) -> dict:
    """Retrieve long-term statistics."""
    from datetime import datetime, timedelta, timezone

    raw_ids = params.get("statistic_ids", [])
    if isinstance(raw_ids, str):
        raw_ids = [raw_ids]

    period = params.get("period", "hour")
    now = datetime.now(timezone.utc)
    try:
        start_dt = datetime.fromisoformat(params["start"]).astimezone(timezone.utc) if params.get("start") else now - timedelta(days=7)
        end_dt = datetime.fromisoformat(params["end"]).astimezone(timezone.utc) if params.get("end") else now
    except (ValueError, TypeError) as e:
        return {"error": f"Invalid datetime format: {e}"}

    try:
        from homeassistant.components.recorder import get_instance
        from homeassistant.components.recorder.statistics import statistics_during_period

        recorder = get_instance(hass)
        stats = await recorder.async_add_executor_job(
            statistics_during_period,
            hass, start_dt, end_dt, set(raw_ids), period, None, {"mean", "min", "max", "sum", "state"}
        )

        result: dict[str, list] = {}
        for sid, rows in stats.items():
            result[sid] = [
                {
                    "start": r["start"].isoformat() if hasattr(r.get("start"), "isoformat") else str(r.get("start")),
                    "mean": r.get("mean"),
                    "min": r.get("min"),
                    "max": r.get("max"),
                    "sum": r.get("sum"),
                    "state": r.get("state"),
                }
                for r in rows
            ]

        return {
            "success": True,
            "period": period,
            "range": {"start": start_dt.isoformat(), "end": end_dt.isoformat()},
            "statistics": result,
        }

    except Exception as exc:
        return {"error": f"Statistics query failed: {exc}"}


async def _tool_ha_deep_search(hass: HomeAssistant, params: dict) -> dict:
    """Search inside automation/script YAML content."""
    import yaml
    from pathlib import Path

    query = params.get("query", "").strip()
    if not query:
        return {"error": "query is required"}

    scope = params.get("scope", "all")
    config_dir = Path(hass.config.config_dir)

    files_to_search: list[tuple[str, Path]] = []
    if scope in ("automations", "all"):
        auto_file = config_dir / "automations.yaml"
        if auto_file.exists():
            files_to_search.append(("automation", auto_file))
    if scope in ("scripts", "all"):
        script_file = config_dir / "scripts.yaml"
        if script_file.exists():
            files_to_search.append(("script", script_file))

    matches: list[dict] = []
    query_lower = query.lower()

    def _search_files() -> list[dict]:
        """Lecture + recherche dans le thread executor — avec timeout implicite."""
        results: list[dict] = []
        for kind, path in files_to_search:
            raw = path.read_text(encoding="utf-8")
            data = yaml.safe_load(raw) or {}
            items = data if isinstance(data, list) else [
                {"id": k, "alias": k, **v} for k, v in data.items()
                if isinstance(v, dict)
            ]
            for item in items:
                if not isinstance(item, dict):
                    continue
                item_str = yaml.dump(item, allow_unicode=True).lower()
                if query_lower in item_str:
                    alias = item.get("alias") or item.get("id", "?")
                    context_lines = [
                        line.strip() for line in item_str.splitlines()
                        if query_lower in line.lower()
                    ][:5]
                    results.append({
                        "type": kind,
                        "alias": alias,
                        "id": item.get("id", ""),
                        "entity_id": f"{kind}.{str(alias).lower().replace(' ', '_')}",
                        "matches_in": context_lines,
                    })
        return results

    try:
        import asyncio as _asyncio
        matches = await _asyncio.wait_for(
            hass.async_add_executor_job(_search_files),
            timeout=15.0,
        )

        return {
            "success": True,
            "query": query,
            "scope": scope,
            "total_matches": len(matches),
            "results": matches,
            "note": "Use ha_get_entities(domain='automation') to get live entity_ids for matched automations." if matches else "",
        }

    except Exception as exc:
        return {"error": f"Deep search failed: {exc}"}


async def _tool_ha_get_logbook(hass: HomeAssistant, params: dict) -> dict:
    """Retrieve logbook entries."""
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    try:
        start_dt = datetime.fromisoformat(params["start"]).astimezone(timezone.utc) if params.get("start") else now - timedelta(hours=24)
        end_dt = datetime.fromisoformat(params["end"]).astimezone(timezone.utc) if params.get("end") else now
    except (ValueError, TypeError) as e:
        return {"error": f"Invalid datetime format: {e}"}

    entity_id = params.get("entity_id")
    limit = int(params.get("limit", 50))

    try:
        from homeassistant.components.logbook.queries.common import PSEUDO_EVENT_STATE_CHANGED
        from homeassistant.components import logbook

        entity_ids = [entity_id] if entity_id else None

        entries = await logbook.async_get_logbook_entries(
            hass,
            start_time=start_dt,
            end_time=end_dt,
            entity_ids=entity_ids,
        )

        # entries is an async generator or list depending on HA version
        results: list[dict] = []
        if hasattr(entries, "__aiter__"):
            async for e in entries:
                results.append(e)
                if len(results) >= limit:
                    break
        else:
            results = list(entries)[:limit]

        return {
            "success": True,
            "period": {"start": start_dt.isoformat(), "end": end_dt.isoformat()},
            "entity_filter": entity_id,
            "total_entries": len(results),
            "entries": results,
        }

    except Exception as exc:
        # Fallback: use recorder directly
        try:
            from homeassistant.components.recorder import get_instance
            return {
                "success": False,
                "error": f"Logbook API unavailable: {exc}",
                "hint": "Ensure the logbook integration is enabled. "
                        "Use ha_get_history() as an alternative to get state changes.",
            }
        except Exception:
            return {"error": f"Logbook query failed: {exc}"}


_HELPER_DOMAINS = {
    "input_boolean", "input_number", "input_text",
    "input_select", "input_datetime", "counter", "timer", "schedule"
}


async def _tool_ha_config_list_helpers(hass: HomeAssistant, params: dict) -> dict:
    """List helper entities, optionally flagging orphans."""
    import yaml
    from pathlib import Path
    from homeassistant.helpers import entity_registry as er

    helper_type = params.get("helper_type", "all")
    include_orphans_check = params.get("include_orphans_check", True)

    domains = _HELPER_DOMAINS if helper_type == "all" else {helper_type}

    try:
        entity_reg = er.async_get(hass)

        # Build reference corpus from automations + scripts if orphan check requested
        reference_corpus = ""
        if include_orphans_check:
            config_dir = Path(hass.config.config_dir)
            for fname in ("automations.yaml", "scripts.yaml"):
                fpath = config_dir / fname
                if fpath.exists():
                    reference_corpus += await hass.async_add_executor_job(fpath.read_text, "utf-8")

        helpers: list[dict] = []
        for state in hass.states.async_all():
            domain = state.entity_id.split(".")[0]
            if domain not in domains:
                continue

            entry = entity_reg.entities.get(state.entity_id)
            used_in_config = (state.entity_id in reference_corpus) if include_orphans_check else None

            helpers.append({
                "entity_id": state.entity_id,
                "type": domain,
                "name": state.attributes.get("friendly_name", state.entity_id),
                "state": state.state,
                "icon": (entry.icon if entry else None) or state.attributes.get("icon"),
                "area_id": entry.area_id if entry else None,
                "orphan": (not used_in_config) if include_orphans_check else None,
            })

        orphan_count = sum(1 for h in helpers if h.get("orphan"))
        return {
            "success": True,
            "total": len(helpers),
            "orphan_count": orphan_count if include_orphans_check else None,
            "helpers": helpers,
            "note": f"{orphan_count} helper(s) not referenced in automations.yaml or scripts.yaml." if include_orphans_check and orphan_count else "",
        }

    except Exception as exc:
        return {"error": f"Failed to list helpers: {exc}"}


async def _tool_ha_config_set_helper(hass: HomeAssistant, params: dict) -> dict:
    """Create or update a helper entity via HA service calls."""
    helper_type = params.get("helper_type", "")
    name = params.get("name", "").strip()

    if not helper_type or not name:
        return {"error": "helper_type and name are required"}
    if helper_type not in _HELPER_DOMAINS - {"schedule"}:
        return {"error": f"Unsupported helper_type '{helper_type}'. Choose from: {sorted(_HELPER_DOMAINS - {'schedule'})}"}

    # Build helper_id from name if not provided
    helper_id = params.get("helper_id") or name.lower().replace(" ", "_").replace("-", "_").replace("'", "")
    full_entity_id = f"{helper_type}.{helper_id}"
    options = params.get("options") or {}

    # Check if already exists
    existing = hass.states.get(full_entity_id)
    action = "update" if existing else "create"

    try:
        # Use HA REST-equivalent: hass.config_entries or direct storage manipulation
        # The cleanest approach is via the built-in services
        service_data: dict[str, Any] = {"name": name}
        if params.get("icon"):
            service_data["icon"] = params["icon"]

        # Type-specific fields
        if helper_type == "input_number":
            service_data["min"] = options.get("min", 0)
            service_data["max"] = options.get("max", 100)
            service_data["step"] = options.get("step", 1)
            if options.get("unit_of_measurement"):
                service_data["unit_of_measurement"] = options["unit_of_measurement"]
        elif helper_type == "input_select":
            opts = options.get("options", [])
            if not opts:
                return {"error": "input_select requires options.options (list of strings)"}
            service_data["options"] = opts
        elif helper_type == "input_text":
            if options.get("max_length"):
                service_data["max"] = options["max_length"]
        elif helper_type == "counter":
            if options.get("initial_value") is not None:
                service_data["initial"] = options["initial_value"]
            if options.get("step_counter") is not None:
                service_data["step"] = options["step_counter"]
            if options.get("minimum") is not None:
                service_data["minimum"] = options["minimum"]
            if options.get("maximum") is not None:
                service_data["maximum"] = options["maximum"]
        elif helper_type == "timer":
            if options.get("duration"):
                service_data["duration"] = options["duration"]

        # Create via entity_component config create
        from homeassistant.helpers import entity_component
        component = hass.data.get(helper_type)

        if component and hasattr(component, "async_create_entity"):
            await component.async_create_entity(hass, service_data)
        else:
            # Fallback: use the storage-based config create service
            # Many helpers expose `<domain>.create` in HA 2024+
            await hass.services.async_call(
                helper_type,
                "create",
                service_data,
                blocking=True,
            )

        return {
            "success": True,
            "action": action,
            "entity_id": full_entity_id,
            "name": name,
            "type": helper_type,
            "message": f"Helper '{name}' ({full_entity_id}) {action}d successfully.",
        }

    except Exception as exc:
        return {
            "error": f"Failed to {action} helper '{name}': {exc}",
            "hint": "Some helper types require HA 2024.4+. "
                    "You can also create helpers manually in Settings → Helpers.",
        }


async def _tool_ha_config_remove_helper(hass: HomeAssistant, params: dict) -> dict:
    """Delete a helper entity."""
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id is required"}

    domain = entity_id.split(".")[0]
    if domain not in _HELPER_DOMAINS:
        return {"error": f"'{entity_id}' does not appear to be a helper entity. "
                          f"Helper domains: {sorted(_HELPER_DOMAINS)}"}

    # Check it exists
    if not hass.states.get(entity_id):
        return {"error": f"Entity '{entity_id}' not found. Use ha_config_list_helpers to find valid entity_ids."}

    try:
        from homeassistant.helpers import entity_registry as er
        entity_reg = er.async_get(hass)
        entry = entity_reg.entities.get(entity_id)

        if entry:
            entity_reg.async_remove(entity_id)
            return {
                "success": True,
                "entity_id": entity_id,
                "message": f"Helper '{entity_id}' deleted successfully.",
            }
        else:
            # Try via service
            await hass.services.async_call(
                domain,
                "remove",
                {"entity_id": entity_id},
                blocking=True,
            )
            return {
                "success": True,
                "entity_id": entity_id,
                "message": f"Helper '{entity_id}' deleted successfully.",
            }

    except Exception as exc:
        return {"error": f"Failed to delete helper '{entity_id}': {exc}"}


# Register medium priority tools
TOOL_HANDLERS.update({
    "ha_get_history": _tool_ha_get_history,
    "ha_get_statistics": _tool_ha_get_statistics,
    "ha_deep_search": _tool_ha_deep_search,
    "ha_get_logbook": _tool_ha_get_logbook,
    "ha_config_list_helpers": _tool_ha_config_list_helpers,
    "ha_config_set_helper": _tool_ha_config_set_helper,
    "ha_config_remove_helper": _tool_ha_config_remove_helper,
})


# ═══════════════════════════════════════════════════════════════════════════════
#  v1.5.0 — 6 LOW PRIORITY TOOLS
#  ha_get_system_health · ha_get_updates · ha_reload_core
#  ha_list_services · ha_config_set_area · ha_manage_entity_labels
# ═══════════════════════════════════════════════════════════════════════════════

_HA_LOW_TOOLS: list[dict[str, Any]] = [
    {
        "name": "ha_get_system_health",
        "description": (
            "Get the current health status of Home Assistant and its integrations. "
            "Returns: HA version, Python version, integrations in error state, "
            "database size, recorder status, and known issues. "
            "Use this to enrich the HACA health score context or diagnose system-level problems."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "ha_get_updates",
        "description": (
            "List available updates for Home Assistant core, supervisor, add-ons, HACS integrations, "
            "and custom components. Returns version info (current vs available) and release notes URL. "
            "Useful for keeping the system up-to-date and identifying outdated custom components."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "ha_reload_core",
        "description": (
            "Reload a specific Home Assistant domain without restarting HA. "
            "Supported domains: automations, scripts, scenes, groups, input_boolean, "
            "input_number, input_text, input_select, input_datetime, timer, counter, "
            "template, customize, core. "
            "Always call ha_check_config() before reloading to avoid loading broken YAML."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["domain"],
            "properties": {
                "domain": {
                    "type": "string",
                    "description": "Domain to reload, e.g. 'automation', 'script', 'scene', 'input_boolean'",
                },
            },
        },
    },
    {
        "name": "ha_list_services",
        "description": (
            "List all services available in this Home Assistant installation, optionally filtered by domain. "
            "Returns service names, descriptions, and their parameter schemas. "
            "Use this to know exactly what services exist before calling ha_call_service, "
            "avoiding guesses like 'light.toggle' vs 'homeassistant.toggle'."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "domain": {
                    "type": "string",
                    "description": "Filter by domain, e.g. 'light', 'automation'. Omit to list all.",
                },
            },
        },
    },
    {
        "name": "ha_config_set_area",
        "description": (
            "Create or update a Home Assistant area (room/zone). "
            "If the area_id already exists, its name/icon/picture are updated; otherwise it is created. "
            "Areas are used to group devices and entities — creating them here makes them immediately "
            "available for ha_rename_entity area_id assignments."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["name"],
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Area name, e.g. 'Salon', 'Chambre principale'",
                },
                "area_id": {
                    "type": "string",
                    "description": "Optional slug ID, e.g. 'salon'. Auto-generated from name if omitted.",
                },
                "icon": {
                    "type": "string",
                    "description": "MDI icon, e.g. 'mdi:sofa'",
                },
                "picture": {
                    "type": "string",
                    "description": "URL or /local/ path to an image for the area.",
                },
            },
        },
    },
    {
        "name": "ha_manage_entity_labels",
        "description": (
            "Add, remove, or replace labels on one or more entities. "
            "Labels are tags visible in the HA entity registry and can be used to filter entities "
            "in dashboards and automations. "
            "Use this to label entities identified by HACA audits "
            "(e.g. add label 'haca_reviewed' or 'needs_icon')."
        ),
        "inputSchema": {
            "type": "object",
            "required": ["entity_ids", "action"],
            "properties": {
                "entity_ids": {
                    "oneOf": [{"type": "string"}, {"type": "array", "items": {"type": "string"}}],
                    "description": "One entity_id or list of entity_ids to update.",
                },
                "action": {
                    "type": "string",
                    "enum": ["add", "remove", "replace"],
                    "description": "'add' appends labels, 'remove' removes them, 'replace' sets exactly these labels.",
                },
                "labels": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Label IDs to add/remove/replace, e.g. ['haca_reviewed', 'needs_icon']",
                },
            },
        },
    },
]

MCP_TOOLS.extend(_HA_LOW_TOOLS)


# ── Handlers — low priority tools ───────────────────────────────────────────

async def _tool_ha_get_system_health(hass: HomeAssistant, params: dict) -> dict:
    """Get HA system health."""
    try:
        from homeassistant.components import system_health as sh

        info: dict[str, Any] = {
            "ha_version": hass.config.version if hasattr(hass.config, "version") else "unknown",
            "config_dir": hass.config.config_dir,
            "timezone": str(hass.config.time_zone),
            "unit_system": hass.config.units.name if hasattr(hass.config.units, "name") else str(hass.config.units),
            "state_count": len(hass.states.async_all()),
            "component_count": len(hass.config.components),
        }

        # Integrations in error state
        try:
            errors = [
                entry.domain
                for entry in hass.config_entries.async_entries()
                if entry.state.value in ("setup_error", "setup_retry", "failed_unload", "not_loaded")
            ]
            info["integrations_with_errors"] = errors
            info["integration_error_count"] = len(errors)
        except Exception:
            pass

        # Recorder info
        try:
            from homeassistant.components.recorder import get_instance
            rec = get_instance(hass)
            info["recorder_db_path"] = str(rec.db_url) if hasattr(rec, "db_url") else "unknown"
        except Exception:
            info["recorder"] = "unavailable"

        # System health data if available
        try:
            health_data = {}
            for domain, info_coro in sh.async_get_system_health(hass):
                try:
                    health_data[domain] = await info_coro
                except Exception:
                    health_data[domain] = "error"
            info["system_health"] = health_data
        except Exception:
            pass

        return {"success": True, "system": info}

    except Exception as exc:
        # Minimal fallback
        try:
            return {
                "success": True,
                "system": {
                    "ha_version": hass.config.version if hasattr(hass.config, "version") else "unknown",
                    "state_count": len(hass.states.async_all()),
                    "note": f"Full system health unavailable: {exc}",
                },
            }
        except Exception as exc2:
            return {"error": f"System health query failed: {exc2}"}


async def _tool_ha_get_updates(hass: HomeAssistant, params: dict) -> dict:
    """List available HA updates."""
    try:
        updates: list[dict] = []

        # Check update entities (HA 2022.4+ exposes update.* entities)
        for state in hass.states.async_all():
            if not state.entity_id.startswith("update."):
                continue
            attrs = state.attributes
            if state.state == "on":  # "on" = update available
                updates.append({
                    "entity_id": state.entity_id,
                    "name": attrs.get("friendly_name", state.entity_id),
                    "installed_version": attrs.get("installed_version"),
                    "latest_version": attrs.get("latest_version"),
                    "release_url": attrs.get("release_url"),
                    "auto_update": attrs.get("auto_update", False),
                })

        return {
            "success": True,
            "updates_available": len(updates),
            "updates": updates,
            "note": "Updates shown are for entities in the 'update' domain. "
                    "Ensure the 'updates' integration is enabled for full coverage." if not updates else "",
        }

    except Exception as exc:
        return {"error": f"Failed to retrieve updates: {exc}"}


_RELOADABLE_DOMAINS = {
    "automation", "script", "scene", "group",
    "input_boolean", "input_number", "input_text", "input_select", "input_datetime",
    "timer", "counter", "template", "customize", "core",
}


async def _tool_ha_reload_core(hass: HomeAssistant, params: dict) -> dict:
    """Reload a HA domain without restarting."""
    domain = params.get("domain", "").strip().lower()
    if not domain:
        return {"error": "domain is required"}
    if domain not in _RELOADABLE_DOMAINS:
        return {
            "error": f"Domain '{domain}' is not reloadable via this tool. "
                     f"Reloadable domains: {sorted(_RELOADABLE_DOMAINS)}",
        }

    try:
        service = "reload" if domain != "core" else "reload_config_entry"
        await hass.services.async_call(domain, service, blocking=True)
        return {
            "success": True,
            "domain": domain,
            "message": f"Domain '{domain}' reloaded successfully.",
        }
    except Exception as exc:
        return {"error": f"Failed to reload '{domain}': {exc}"}


async def _tool_ha_list_services(hass: HomeAssistant, params: dict) -> dict:
    """List available HA services."""
    domain_filter = params.get("domain", "").strip().lower()

    try:
        all_services = hass.services.async_services()
        result: dict[str, dict] = {}

        for domain, services in all_services.items():
            if domain_filter and domain != domain_filter:
                continue
            domain_dict: dict[str, Any] = {}
            for svc_name, svc in services.items():
                domain_dict[svc_name] = {
                    "description": (svc.description or "") if hasattr(svc, "description") else "",
                    "fields": (
                        {k: {"description": v.get("description", "")}
                         for k, v in (svc.fields or {}).items()}
                        if hasattr(svc, "fields") else {}
                    ),
                }
            result[domain] = domain_dict

        total = sum(len(v) for v in result.values())
        return {
            "success": True,
            "domain_filter": domain_filter or None,
            "domain_count": len(result),
            "service_count": total,
            "services": result,
        }

    except Exception as exc:
        return {"error": f"Failed to list services: {exc}"}


async def _tool_ha_config_set_area(hass: HomeAssistant, params: dict) -> dict:
    """Create or update a HA area."""
    from homeassistant.helpers import area_registry as ar

    name = params.get("name", "").strip()
    if not name:
        return {"error": "name is required"}

    area_id = params.get("area_id") or name.lower().replace(" ", "_").replace("-", "_").replace("'", "").replace("é","e").replace("è","e").replace("ê","e").replace("à","a").replace("ù","u").replace("î","i").replace("ô","o").replace("ç","c")
    icon = params.get("icon")
    picture = params.get("picture")

    try:
        area_reg = ar.async_get(hass)

        # Check if exists (by id or name)
        existing = area_reg.async_get_area(area_id) or next(
            (a for a in area_reg.async_list_areas() if a.name.lower() == name.lower()), None
        )

        kwargs: dict[str, Any] = {}
        if icon is not None:
            kwargs["icon"] = icon
        if picture is not None:
            kwargs["picture"] = picture

        if existing:
            area_reg.async_update(existing.id, name=name, **kwargs)
            action = "updated"
            final_id = existing.id
        else:
            new_area = area_reg.async_create(name, **kwargs)
            action = "created"
            final_id = new_area.id

        return {
            "success": True,
            "action": action,
            "area_id": final_id,
            "name": name,
            "message": f"Area '{name}' (id: {final_id}) {action} successfully.",
        }

    except Exception as exc:
        return {"error": f"Failed to {('update' if existing else 'create')} area: {exc}"}


async def _tool_ha_manage_entity_labels(hass: HomeAssistant, params: dict) -> dict:
    """Add, remove, or replace labels on entities."""
    from homeassistant.helpers import entity_registry as er, label_registry as lr

    raw_ids = params.get("entity_ids", [])
    if isinstance(raw_ids, str):
        raw_ids = [raw_ids]

    action = params.get("action", "add")
    labels_input = params.get("labels", [])

    if not raw_ids:
        return {"error": "entity_ids is required"}
    if action not in ("add", "remove", "replace"):
        return {"error": "action must be 'add', 'remove', or 'replace'"}
    if not labels_input and action in ("add", "replace"):
        return {"error": "labels list is required for add/replace actions"}

    try:
        entity_reg = er.async_get(hass)
        label_reg = lr.async_get(hass)

        # Ensure labels exist (create if needed for add/replace)
        if action in ("add", "replace"):
            for label_id in labels_input:
                existing_label = label_reg.async_get_label(label_id)
                if not existing_label:
                    label_reg.async_create(label_id, name=label_id)

        updated: list[str] = []
        not_found: list[str] = []

        for eid in raw_ids:
            entry = entity_reg.entities.get(eid)
            if not entry:
                not_found.append(eid)
                continue

            current_labels: set[str] = set(entry.labels or [])
            input_set = set(labels_input)

            if action == "add":
                new_labels = current_labels | input_set
            elif action == "remove":
                new_labels = current_labels - input_set
            else:  # replace
                new_labels = input_set

            entity_reg.async_update_entity(eid, labels=new_labels)
            updated.append(eid)

        return {
            "success": True,
            "action": action,
            "labels": labels_input,
            "updated_count": len(updated),
            "updated": updated,
            "not_found": not_found,
            "message": f"Labels {action}d on {len(updated)} entity/entities.",
        }

    except Exception as exc:
        return {"error": f"Failed to manage labels: {exc}"}




# ── ha_create_blueprint ──────────────────────────────────────────────────────
async def _tool_ha_create_blueprint(hass: HomeAssistant, params: dict) -> dict:
    """Convert an existing automation into a reusable Blueprint YAML file."""
    import re
    import os
    import yaml as _yaml

    automation_ref = params.get("automation_entity_id", "").strip()
    blueprint_name = params.get("blueprint_name", "").strip()
    blueprint_description = params.get("blueprint_description", "").strip()
    custom_inputs: dict = params.get("inputs") or {}

    if not automation_ref:
        return {"error": "automation_entity_id is required"}

    # ── Step 1: fetch the automation YAML ────────────────────────────────────
    auto_data = await _tool_get_automation(hass, {"entity_id": automation_ref})
    if "error" in auto_data:
        return {"error": f"Could not read automation: {auto_data['error']}"}

    raw_yaml: str = auto_data.get("yaml", "")
    if not raw_yaml:
        return {"error": "Automation returned empty YAML. Cannot create blueprint."}

    try:
        auto_dict: dict = _yaml.safe_load(raw_yaml) or {}
    except Exception as exc:
        return {"error": f"Failed to parse automation YAML: {exc}"}

    alias: str = auto_dict.get("alias") or automation_ref
    if not blueprint_name:
        blueprint_name = alias
    if not blueprint_description:
        blueprint_description = (
            f"Blueprint généré automatiquement par HACA depuis l'automation \"{alias}\". "
            "Modifiez la description pour décrire le cas d'usage."
        )

    # ── Step 2: auto-detect entity_id inputs if not provided by caller ───────
    if not custom_inputs:
        # Collect all entity_id values from triggers + actions + conditions
        entity_ids_found: list[str] = []
        body_str = _yaml.dump(auto_dict, allow_unicode=True, default_flow_style=False)
        # Match entity_id patterns like light.salon, sensor.temperature, etc.
        entity_ids_found = list(dict.fromkeys(
            re.findall(r'\b([a-z_]+\.[a-z0-9_]+)\b', body_str)
        ))
        # Filter: only real HA entity-looking ones (skip common YAML keys)
        _SKIP = {"true", "false", "null", "on", "off", "single", "parallel",
                 "queued", "restart", "trigger.entity_id", "trigger.to",
                 "trigger.from", "state.entity_id"}
        entity_ids_found = [
            e for e in entity_ids_found
            if "." in e and e not in _SKIP and not e.startswith("trigger.")
            and not e.startswith("condition.") and not e.startswith("action.")
        ][:6]  # cap at 6 inputs

        for eid in entity_ids_found:
            domain = eid.split(".")[0]
            slug = eid.replace(".", "_")
            custom_inputs[slug] = {
                "name": eid,
                "description": f"Entité '{eid}' extraite de l'automation d'origine.",
                "default": eid,
                "selector": {"entity": {"domain": domain}},
            }

    # ── Step 3: build the blueprint body ─────────────────────────────────────
    # Extract automation body keys (everything except metadata)
    _META_KEYS = {"id", "alias", "description", "use_blueprint", "mode",
                  "max", "max_exceeded", "trace", "initial_state"}
    body_keys = [
        k for k in ["triggers", "trigger", "conditions", "condition",
                     "actions", "action", "mode", "variables"]
        if k in auto_dict
    ]

    bp_body: dict = {k: auto_dict[k] for k in body_keys if k in auto_dict}

    # Substitute entity_ids with !input references
    if custom_inputs:
        body_str = _yaml.dump(bp_body, allow_unicode=True, default_flow_style=False)
        for slug, inp in custom_inputs.items():
            default_val = inp.get("default", "")
            if default_val:
                body_str = body_str.replace(
                    f"'{default_val}'", f"!input {slug}"
                ).replace(
                    f'"{default_val}"', f"!input {slug}"
                ).replace(default_val, f"!input {slug}")
        try:
            bp_body = _yaml.safe_load(body_str) or bp_body
        except Exception:
            pass  # keep original bp_body if re-parse fails

    blueprint_dict: dict = {
        "blueprint": {
            "name": blueprint_name,
            "description": blueprint_description,
            "domain": "automation",
            "input": {
                slug: {k: v for k, v in inp.items() if k != "default"}
                for slug, inp in custom_inputs.items()
            },
        }
    }
    if custom_inputs:
        # Add variables block mapping inputs for use in templates
        blueprint_dict["variables"] = {
            slug: f"!input {slug}" for slug in custom_inputs
        }

    blueprint_dict.update(bp_body)

    # ── Step 4: write the file ────────────────────────────────────────────────
    slug_name = re.sub(r"[^a-z0-9_]", "_", blueprint_name.lower()).strip("_")
    slug_name = re.sub(r"_+", "_", slug_name)[:60]
    bp_dir = hass.config.path("blueprints", "automation", "haca")
    os.makedirs(bp_dir, exist_ok=True)
    bp_path = os.path.join(bp_dir, f"{slug_name}.yaml")

    bp_yaml = _yaml.dump(
        blueprint_dict,
        allow_unicode=True,
        default_flow_style=False,
        sort_keys=False,
    )

    # YAML dump doesn't support !input tags natively — post-process the string
    bp_yaml = bp_yaml.replace("'!input ", "!input ").replace(
        "\"!input ", "!input "
    )
    # Fix closing quotes left after the input name
    import re as _re
    bp_yaml = _re.sub(r"(!input [a-z0-9_]+)'", r"\1", bp_yaml)
    bp_yaml = _re.sub(r'(!input [a-z0-9_]+)"', r"\1", bp_yaml)

    try:
        _bp_header = (
            f"# Blueprint généré par HACA depuis l'automation \"{alias}\"\n"
            f"# Fichier : {bp_path}\n\n"
        )
        await _async_write_file(hass, bp_path, _bp_header + bp_yaml)
    except Exception as exc:
        return {"error": f"Failed to write blueprint file: {exc}", "path": bp_path}

    # ── Step 5: reload blueprints ─────────────────────────────────────────────
    try:
        await hass.services.async_call("blueprint", "reload", blocking=True)
    except Exception:
        pass  # non-fatal — blueprints reload on next HA restart anyway

    return {
        "success": True,
        "path": bp_path,
        "blueprint_name": blueprint_name,
        "inputs_detected": list(custom_inputs.keys()),
        "yaml": bp_yaml,
        "message": (
            f"Blueprint '{blueprint_name}' créé dans {bp_path}. "
            "Visible dans Paramètres → Blueprints → Mes blueprints. "
            "Pour l'utiliser : Paramètres → Automatisations → Créer → Depuis un blueprint."
        ),
    }


# Register low priority tools
TOOL_HANDLERS.update({
    "ha_get_system_health": _tool_ha_get_system_health,
    "ha_get_updates": _tool_ha_get_updates,
    "ha_reload_core": _tool_ha_reload_core,
    "ha_list_services": _tool_ha_list_services,
    "ha_config_set_area": _tool_ha_config_set_area,
    "ha_manage_entity_labels": _tool_ha_manage_entity_labels,
    "ha_create_blueprint": _tool_ha_create_blueprint,
})


# ═══════════════════════════════════════════════════════════════════════════════
# v1.5.1 — 24 NEW TOOLS: scripts, scenes, blueprints, dashboard, helpers,
#           entities, config files, labels/categories
# ═══════════════════════════════════════════════════════════════════════════════

# ── SCRIPTS ─────────────────────────────────────────────────────────────────

async def _tool_ha_get_script(hass: HomeAssistant, params: dict) -> dict:
    """Read a script's full YAML and metadata."""
    import yaml as _yaml
    script_ref = params.get("entity_id", "").strip()
    if not script_ref:
        return {"error": "entity_id required (e.g. 'script.morning_routine' or alias)"}

    scripts_path = hass.config.path("scripts.yaml")
    try:
        _raw = await _async_read_file(hass, scripts_path)
        all_scripts: dict = _yaml.safe_load(_raw) or {}
    except FileNotFoundError:
        return {"error": f"scripts.yaml not found at {scripts_path}"}
    except Exception as exc:
        return {"error": f"Failed to read scripts.yaml: {exc}"}

    # Normalise ref → slug
    slug = script_ref.replace("script.", "").strip()
    # Try exact match first, then alias search
    found_key = None
    found_data = None
    for key, val in all_scripts.items():
        if key == slug:
            found_key, found_data = key, val
            break
        if isinstance(val, dict):
            alias = val.get("alias", "") or val.get("sequence", [{}])[0] if val.get("sequence") else ""
            if str(alias).lower() == script_ref.lower():
                found_key, found_data = key, val
                break

    if found_key is None:
        return {
            "error": f"Script '{script_ref}' not found in scripts.yaml",
            "available_slugs": list(all_scripts.keys())[:20],
        }

    return {
        "slug": found_key,
        "entity_id": f"script.{found_key}",
        "alias": found_data.get("alias", found_key) if isinstance(found_data, dict) else found_key,
        "description": found_data.get("description", "") if isinstance(found_data, dict) else "",
        "mode": found_data.get("mode", "single") if isinstance(found_data, dict) else "single",
        "yaml": _yaml.dump({found_key: found_data}, allow_unicode=True, default_flow_style=False),
        "data": found_data,
    }


async def _tool_ha_update_script(hass: HomeAssistant, params: dict) -> dict:
    """Update an existing script in scripts.yaml."""
    import yaml as _yaml
    script_ref = params.get("entity_id", "").strip()
    if not script_ref:
        return {"error": "entity_id required"}

    scripts_path

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_update_script")
    scripts_path = hass.config.path("scripts.yaml")
    try:
        _raw_scripts_path = await _async_read_file(hass, scripts_path)
        all_scripts: dict = _yaml.safe_load(_raw_scripts_path) or {}
    except Exception as exc:
        return {"error": f"Failed to read scripts.yaml: {exc}"}

    slug = script_ref.replace("script.", "").strip()
    if slug not in all_scripts:
        return {"error": f"Script '{slug}' not found", "available": list(all_scripts.keys())[:20]}

    current = all_scripts[slug] if isinstance(all_scripts[slug], dict) else {}
    # Apply updates
    for field in ("alias", "description", "mode", "icon"):
        if params.get(field) is not None:
            current[field] = params[field]
    if params.get("sequence") is not None:
        current["sequence"] = params["sequence"]
    if params.get("variables") is not None:
        current["variables"] = params["variables"]

    all_scripts[slug] = current
    try:
        _scripts_content = _yaml.dump(all_scripts, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, scripts_path, _scripts_content)
    except Exception as exc:
        return {"error": f"Failed to write scripts.yaml: {exc}"}

    try:
        await hass.services.async_call("script", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "entity_id": f"script.{slug}",
        "message": f"Script '{slug}' updated and reloaded.",
    }


async def _tool_ha_remove_script(hass: HomeAssistant, params: dict) -> dict:
    """Delete a script from scripts.yaml."""
    import yaml as _yaml
    script_ref = params.get("entity_id", "").strip()
    if not script_ref:
        return {"error": "entity_id required"}

    scripts_path

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_remove_script")
    scripts_path = hass.config.path("scripts.yaml")
    try:
        _raw_scripts_path = await _async_read_file(hass, scripts_path)
        all_scripts: dict = _yaml.safe_load(_raw_scripts_path) or {}
    except Exception as exc:
        return {"error": f"Failed to read scripts.yaml: {exc}"}

    slug = script_ref.replace("script.", "").strip()
    if slug not in all_scripts:
        return {"error": f"Script '{slug}' not found", "available": list(all_scripts.keys())[:20]}

    removed = all_scripts.pop(slug)
    try:
        _scripts_content = _yaml.dump(all_scripts, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, scripts_path, _scripts_content)
    except Exception as exc:
        return {"error": f"Failed to write scripts.yaml: {exc}"}

    try:
        await hass.services.async_call("script", "reload", blocking=True)
    except Exception:
        pass

    alias = removed.get("alias", slug) if isinstance(removed, dict) else slug
    return {
        "success": True,
        "deleted": slug,
        "alias": alias,
        "message": f"Script '{alias}' deleted from scripts.yaml.",
    }


# ── SCENES ───────────────────────────────────────────────────────────────────

async def _tool_ha_get_scene(hass: HomeAssistant, params: dict) -> dict:
    """Read a scene's full YAML and entity states."""
    import yaml as _yaml
    scene_ref = params.get("entity_id", "").strip()
    if not scene_ref:
        return {"error": "entity_id required (e.g. 'scene.soiree' or alias 'Soirée')"}

    scenes_path = hass.config.path("scenes.yaml")
    try:
        _raw_scenes_path = await _async_read_file(hass, scenes_path)
        all_scenes: list = _yaml.safe_load(_raw_scenes_path) or []
    except FileNotFoundError:
        return {"error": f"scenes.yaml not found at {scenes_path}"}
    except Exception as exc:
        return {"error": f"Failed to read scenes.yaml: {exc}"}

    slug = scene_ref.replace("scene.", "").strip().lower()
    for scene in all_scenes:
        if not isinstance(scene, dict):
            continue
        sid = str(scene.get("id", "")).lower()
        sname = str(scene.get("name", "")).lower()
        if sid == slug or sname == slug or sname == scene_ref.lower():
            return {
                "id": scene.get("id"),
                "name": scene.get("name"),
                "entity_id": f"scene.{scene.get('id', slug)}",
                "entities": scene.get("entities", {}),
                "yaml": _yaml.dump(scene, allow_unicode=True, default_flow_style=False),
            }

    return {
        "error": f"Scene '{scene_ref}' not found",
        "available": [s.get("name") or s.get("id") for s in all_scenes if isinstance(s, dict)][:20],
    }


async def _tool_ha_create_scene(hass: HomeAssistant, params: dict) -> dict:
    """Create a new scene in scenes.yaml."""
    import yaml as _yaml, re
    name = params.get("name", "").strip()
    entities = params.get("entities")
    if not name:
        return {"error": "name required"}
    if not entities or not isinstance(entities, dict):
        return {"error": "entities dict required, e.g. {'light.salon': {'state': 'on', 'brightness': 200}}"}

    slug = re.sub(r"[^a-z0-9_]", "_", name.lower()).strip("_")
    slug = re.sub(r"_+", "_", slug)
    scenes_path = hass.config.path("scenes.yaml")
    try:
        _raw_scenes_path = await _async_read_file(hass, scenes_path)
        all_scenes: list = _yaml.safe_load(_raw_scenes_path) or []
    except FileNotFoundError:
        all_scenes = []
    except Exception as exc:
        return {"error": f"Failed to read scenes.yaml: {exc}"}

    # Check duplicate
    for s in all_scenes:
        if isinstance(s, dict) and s.get("id") == slug:
            return {"error": f"Scene with id '{slug}' already exists. Use ha_update_scene to modify."}

    new_scene: dict = {"id": slug, "name": name, "entities": entities}
    if params.get("icon"):
        new_scene["icon"] = params["icon"]
    all_scenes.append(new_scene)

    try:
        _sc = _yaml.dump(all_scenes, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, scenes_path, _sc)
    except Exception as exc:
        return {"error": f"Failed to write scenes.yaml: {exc}"}

    try:
        await hass.services.async_call("scene", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "id": slug,
        "entity_id": f"scene.{slug}",
        "message": f"Scene '{name}' created (scene.{slug}).",
    }


async def _tool_ha_update_scene(hass: HomeAssistant, params: dict) -> dict:
    """Update an existing scene in scenes.yaml."""
    import yaml as _yaml
    scene_ref = params.get("entity_id", "").strip()
    if not scene_ref:
        return {"error": "entity_id required"}

    scenes_path

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_update_scene")
    scenes_path = hass.config.path("scenes.yaml")
    try:
        _raw_scenes_path = await _async_read_file(hass, scenes_path)
        all_scenes: list = _yaml.safe_load(_raw_scenes_path) or []
    except Exception as exc:
        return {"error": f"Failed to read scenes.yaml: {exc}"}

    slug = scene_ref.replace("scene.", "").strip().lower()
    found_idx = None
    for i, s in enumerate(all_scenes):
        if isinstance(s, dict) and (
            str(s.get("id", "")).lower() == slug
            or str(s.get("name", "")).lower() == scene_ref.lower()
        ):
            found_idx = i
            break

    if found_idx is None:
        return {"error": f"Scene '{scene_ref}' not found"}

    scene = all_scenes[found_idx]
    for field in ("name", "icon"):
        if params.get(field) is not None:
            scene[field] = params[field]
    if params.get("entities") is not None:
        scene["entities"] = params["entities"]
    all_scenes[found_idx] = scene

    try:
        _sc = _yaml.dump(all_scenes, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, scenes_path, _sc)
    except Exception as exc:
        return {"error": f"Failed to write scenes.yaml: {exc}"}

    try:
        await hass.services.async_call("scene", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "entity_id": f"scene.{scene.get('id', slug)}",
        "message": f"Scene '{scene.get('name', slug)}' updated and reloaded.",
    }


async def _tool_ha_remove_scene(hass: HomeAssistant, params: dict) -> dict:
    """Delete a scene from scenes.yaml."""
    import yaml as _yaml
    scene_ref = params.get("entity_id", "").strip()
    if not scene_ref:
        return {"error": "entity_id required"}

    scenes_path

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_remove_scene")
    scenes_path = hass.config.path("scenes.yaml")
    try:
        _raw_scenes_path = await _async_read_file(hass, scenes_path)
        all_scenes: list = _yaml.safe_load(_raw_scenes_path) or []
    except Exception as exc:
        return {"error": f"Failed to read scenes.yaml: {exc}"}

    slug = scene_ref.replace("scene.", "").strip().lower()
    original_len = len(all_scenes)
    removed_name = None
    new_scenes = []
    for s in all_scenes:
        if isinstance(s, dict) and (
            str(s.get("id", "")).lower() == slug
            or str(s.get("name", "")).lower() == scene_ref.lower()
        ):
            removed_name = s.get("name") or s.get("id")
            continue
        new_scenes.append(s)

    if len(new_scenes) == original_len:
        return {"error": f"Scene '{scene_ref}' not found"}

    try:
        _sc = _yaml.dump(new_scenes, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, scenes_path, _sc)
    except Exception as exc:
        return {"error": f"Failed to write scenes.yaml: {exc}"}

    try:
        await hass.services.async_call("scene", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "deleted": removed_name or scene_ref,
        "message": f"Scene '{removed_name or scene_ref}' deleted from scenes.yaml.",
    }


# ── BLUEPRINTS ────────────────────────────────────────────────────────────────

async def _tool_ha_list_blueprints(hass: HomeAssistant, params: dict) -> dict:
    """List all installed blueprints (automation + script domains)."""
    import os, yaml as _yaml
    domain_filter = params.get("domain", "").strip().lower() or None
    bp_base = hass.config.path("blueprints")
    results: list[dict] = []

    if not os.path.isdir(bp_base):
        return {"blueprints": [], "message": "No blueprints directory found."}

    for domain in ("automation", "script"):
        if domain_filter and domain_filter != domain:
            continue
        domain_dir = os.path.join(bp_base, domain)
        if not os.path.isdir(domain_dir):
            continue
        for root, _dirs, files in os.walk(domain_dir):
            for fname in sorted(files):
                if not fname.endswith(".yaml"):
                    continue
                fpath = os.path.join(root, fname)
                rel_path = os.path.relpath(fpath, bp_base)
                try:
                    _raw_bp = await _async_read_file(hass, str(fpath))
                    data = _yaml.safe_load(_raw_bp) or {}
                    bp_meta = data.get("blueprint", {})
                    results.append({
                        "domain": domain,
                        "path": rel_path,
                        "name": bp_meta.get("name", fname),
                        "description": bp_meta.get("description", ""),
                        "source_url": bp_meta.get("source_url", ""),
                        "inputs": list(bp_meta.get("input", {}).keys()),
                    })
                except Exception as exc:
                    results.append({"domain": domain, "path": rel_path, "error": str(exc)})

    return {
        "blueprints": results,
        "total": len(results),
    }


async def _tool_ha_get_blueprint(hass: HomeAssistant, params: dict) -> dict:
    """Read the full YAML of an installed blueprint."""
    import os, yaml as _yaml
    path_ref = params.get("path", "").strip()
    if not path_ref:
        return {"error": "path required (relative to /config/blueprints/, e.g. 'automation/haca/my_bp.yaml')"}

    # Accept both absolute and relative paths
    if os.path.isabs(path_ref):
        fpath = path_ref
    else:
        fpath = hass.config.path("blueprints", path_ref)

    if not os.path.isfile(fpath):
        return {"error": f"Blueprint file not found: {fpath}"}

    try:
        content = await _async_read_file(hass, fpath)
        data = _yaml.safe_load(content) or {}
    except Exception as exc:
        return {"error": f"Failed to read blueprint: {exc}"}

    bp_meta = data.get("blueprint", {})
    return {
        "path": fpath,
        "name": bp_meta.get("name", ""),
        "description": bp_meta.get("description", ""),
        "domain": bp_meta.get("domain", "automation"),
        "inputs": bp_meta.get("input", {}),
        "yaml": content,
        "parsed": data,
    }


async def _tool_ha_update_blueprint(hass: HomeAssistant, params: dict) -> dict:
    """Update an existing blueprint file (overwrite YAML content or patch metadata)."""
    import os, yaml as _yaml
    path_ref = params.get("path", "").strip()
    if not path_ref:
        return {"error": "path required (relative to /config/blueprints/)"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_update_blueprint")

    if os.path.isabs(path_ref):
        fpath = path_ref
    else:
        fpath = hass.config.path("blueprints", path_ref)

    if not os.path.isfile(fpath):
        return {"error": f"Blueprint file not found: {fpath}. Use ha_create_blueprint to create it."}

    try:
        _raw_fpath = await _async_read_file(hass, fpath)
        data: dict = _yaml.safe_load(_raw_fpath) or {}
    except Exception as exc:
        return {"error": f"Failed to read blueprint: {exc}"}

    # If full yaml provided, replace entirely
    if params.get("yaml"):
        try:
            data = _yaml.safe_load(params["yaml"]) or {}
        except Exception as exc:
            return {"error": f"Provided YAML is invalid: {exc}"}
    else:
        # Patch individual fields
        bp = data.setdefault("blueprint", {})
        for field in ("name", "description", "source_url"):
            if params.get(field) is not None:
                bp[field] = params[field]
        if params.get("inputs") is not None:
            bp["input"] = params["inputs"]
        # Patch automation body
        for key in ("triggers", "trigger", "conditions", "condition",
                     "actions", "action", "mode", "variables"):
            if params.get(key) is not None:
                data[key] = params[key]

    try:
        _bp_out = _yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, str(fpath), _bp_out)
    except Exception as exc:
        return {"error": f"Failed to write blueprint: {exc}"}

    try:
        await hass.services.async_call("blueprint", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "path": fpath,
        "name": data.get("blueprint", {}).get("name", ""),
        "message": f"Blueprint updated at {fpath}. Reloaded.",
    }


async def _tool_ha_remove_blueprint(hass: HomeAssistant, params: dict) -> dict:
    """Delete a blueprint file from /config/blueprints/."""
    import os
    path_ref = params.get("path", "").strip()
    if not path_ref:
        return {"error": "path required"}

    # Backup automatique avant opération destructive
    await _auto_backup(hass, "_tool_ha_remove_blueprint")

    if os.path.isabs(path_ref):
        fpath = path_ref
    else:
        fpath = hass.config.path("blueprints", path_ref)

    if not os.path.isfile(fpath):
        return {"error": f"Blueprint file not found: {fpath}"}

    # Safety: must be inside /config/blueprints/
    bp_base = hass.config.path("blueprints")
    if not fpath.startswith(bp_base):
        return {"error": "Cannot delete files outside /config/blueprints/"}

    try:
        os.remove(fpath)
    except Exception as exc:
        return {"error": f"Failed to delete blueprint: {exc}"}

    try:
        await hass.services.async_call("blueprint", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "deleted": fpath,
        "message": f"Blueprint deleted: {fpath}",
    }


async def _tool_ha_import_blueprint(hass: HomeAssistant, params: dict) -> dict:
    """Import a community blueprint from a URL (raw YAML) into /config/blueprints/automation/imported/."""
    import os, re, yaml as _yaml
    import aiohttp
    url = params.get("url", "").strip()
    if not url:
        return {"error": "url required (raw YAML URL, e.g. raw.githubusercontent.com/...)"}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status != 200:
                    return {"error": f"HTTP {resp.status} fetching blueprint URL"}
                content = await resp.text()
    except Exception as exc:
        return {"error": f"Failed to fetch URL: {exc}"}

    try:
        data = _yaml.safe_load(content) or {}
    except Exception as exc:
        return {"error": f"Downloaded content is not valid YAML: {exc}"}

    if "blueprint" not in data:
        return {"error": "Downloaded YAML has no 'blueprint:' key — not a valid HA blueprint"}

    # Build filename from blueprint name
    bp_name = data["blueprint"].get("name", "imported_blueprint")
    slug = re.sub(r"[^a-z0-9_]", "_", bp_name.lower()).strip("_")
    slug = re.sub(r"_+", "_", slug)[:60]
    domain = data["blueprint"].get("domain", "automation")

    out_dir = hass.config.path("blueprints", domain, "imported")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{slug}.yaml")

    # Store source_url in blueprint metadata
    data["blueprint"]["source_url"] = url

    try:
        _import_content = f"# Imported by HACA from: {url}\n\n" + _yaml.dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False)
        await _async_write_file(hass, out_path, _import_content)
    except Exception as exc:
        return {"error": f"Failed to write blueprint: {exc}"}

    try:
        await hass.services.async_call("blueprint", "reload", blocking=True)
    except Exception:
        pass

    return {
        "success": True,
        "path": out_path,
        "name": bp_name,
        "domain": domain,
        "inputs": list(data["blueprint"].get("input", {}).keys()),
        "message": (
            f"Blueprint '{bp_name}' imported to {out_path}. "
            "Visible dans Paramètres → Blueprints."
        ),
    }


# ── DASHBOARDS EDIT ───────────────────────────────────────────────────────────

async def _tool_ha_list_dashboards(hass: HomeAssistant, params: dict) -> dict:
    """List all Lovelace dashboards (default + custom)."""
    results: list[dict] = []
    # Default dashboard
    results.append({
        "url_path": None,
        "title": "Default",
        "mode": "auto/yaml",
        "icon": "mdi:home",
        "is_default": True,
    })
    # Custom dashboards from registry
    try:
        from homeassistant.components.lovelace import dashboard as _lv_dash  # type: ignore
        from homeassistant.components.lovelace.const import DOMAIN as _LV_DOMAIN  # type: ignore
        lv_data = hass.data.get(_LV_DOMAIN, {})
        dashboards = lv_data.get("dashboards", {}) if isinstance(lv_data, dict) else {}
        for url_path, dash in dashboards.items():
            info: dict = {"url_path": url_path}
            if hasattr(dash, "config"):
                cfg = dash.config or {}
                info["title"] = cfg.get("title", url_path)
                info["icon"] = cfg.get("icon", "")
                info["show_in_sidebar"] = cfg.get("show_in_sidebar", True)
                info["mode"] = cfg.get("mode", "storage")
            results.append(info)
    except Exception as exc:
        results.append({"note": f"Could not enumerate dashboards: {exc}"})

    return {"dashboards": results, "total": len(results)}


async def _tool_ha_update_lovelace_card(hass: HomeAssistant, params: dict) -> dict:
    """Update an existing Lovelace card by view index + card index."""
    import json as _json
    view_index = params.get("view_index", 0)
    card_index = params.get("card_index")
    card_id    = params.get("card_id", "")
    new_config = params.get("card_config")
    dashboard_url = params.get("dashboard_url", None)  # None = default

    if new_config is None:
        return {"error": "card_config required (dict with the full new card definition)"}
    if card_index is None and not card_id:
        return {"error": "Either card_index (int) or card_id (string) required"}

    try:
        from homeassistant.components.lovelace.const import DOMAIN as _LV_DOMAIN  # type: ignore
        lv_data = hass.data.get(_LV_DOMAIN, {})
        if dashboard_url is None:
            lo_config = lv_data.get("config") or list(lv_data.values())[0]
        else:
            lo_config = lv_data.get("dashboards", {}).get(dashboard_url)
        if lo_config is None:
            return {"error": "Lovelace config not found. Ensure dashboard mode is 'storage'."}

        ll = await lo_config.async_load(False)
        views = ll.get("views", [])
        if view_index >= len(views):
            return {"error": f"view_index {view_index} out of range (dashboard has {len(views)} views)"}

        cards = views[view_index].get("cards", [])
        # Find by card_id if provided
        if card_id:
            target_idx = next(
                (i for i, c in enumerate(cards)
                 if isinstance(c, dict) and c.get("id") == card_id),
                None
            )
            if target_idx is None:
                return {"error": f"Card with id '{card_id}' not found in view {view_index}"}
            card_index = target_idx

        if card_index >= len(cards):
            return {"error": f"card_index {card_index} out of range (view has {len(cards)} cards)"}

        old_card = cards[card_index]
        cards[card_index] = new_config
        views[view_index]["cards"] = cards
        ll["views"] = views

        await lo_config.async_save(ll)
        return {
            "success": True,
            "view_index": view_index,
            "card_index": card_index,
            "old_type": old_card.get("type", "unknown"),
            "new_type": new_config.get("type", "unknown"),
            "message": "Card updated successfully.",
        }
    except Exception as exc:
        return {"error": f"Failed to update Lovelace card: {exc}"}


async def _tool_ha_remove_lovelace_card(hass: HomeAssistant, params: dict) -> dict:
    """Remove a card from a Lovelace view."""
    view_index = params.get("view_index", 0)
    card_index = params.get("card_index")
    card_id    = params.get("card_id", "")
    dashboard_url = params.get("dashboard_url", None)

    if card_index is None and not card_id:
        return {"error": "Either card_index (int) or card_id (string) required"}

    try:
        from homeassistant.components.lovelace.const import DOMAIN as _LV_DOMAIN  # type: ignore
        lv_data = hass.data.get(_LV_DOMAIN, {})
        if dashboard_url is None:
            lo_config = lv_data.get("config") or list(lv_data.values())[0]
        else:
            lo_config = lv_data.get("dashboards", {}).get(dashboard_url)
        if lo_config is None:
            return {"error": "Lovelace config not found."}

        ll = await lo_config.async_load(False)
        views = ll.get("views", [])
        if view_index >= len(views):
            return {"error": f"view_index {view_index} out of range"}

        cards = views[view_index].get("cards", [])
        if card_id:
            target_idx = next(
                (i for i, c in enumerate(cards) if isinstance(c, dict) and c.get("id") == card_id),
                None
            )
            if target_idx is None:
                return {"error": f"Card with id '{card_id}' not found"}
            card_index = target_idx

        if card_index >= len(cards):
            return {"error": f"card_index {card_index} out of range"}

        removed = cards.pop(card_index)
        views[view_index]["cards"] = cards
        ll["views"] = views
        await lo_config.async_save(ll)

        return {
            "success": True,
            "removed_card_type": removed.get("type", "unknown"),
            "remaining_cards": len(cards),
            "message": f"Card (type={removed.get('type')}) removed from view {view_index}.",
        }
    except Exception as exc:
        return {"error": f"Failed to remove Lovelace card: {exc}"}


# ── HELPERS EDIT ──────────────────────────────────────────────────────────────

async def _tool_ha_get_helper(hass: HomeAssistant, params: dict) -> dict:
    """Read a helper's current state, friendly name, and configuration."""
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id required (e.g. 'input_boolean.mode_nuit')"}

    state = hass.states.get(entity_id)
    if state is None:
        # Try by friendly name
        for s in hass.states.async_all():
            if s.attributes.get("friendly_name", "").lower() == entity_id.lower():
                state = s
                entity_id = s.entity_id
                break

    if state is None:
        return {"error": f"Helper '{entity_id}' not found in HA state machine"}

    er = hass.data.get("entity_registry") or hass.data.get(
        "homeassistant.components.entity_registry.ent_reg", {}
    )
    try:
        from homeassistant.helpers import entity_registry as er_mod
        registry = er_mod.async_get(hass)
        entry = registry.async_get(entity_id)
        entry_dict = {
            "unique_id": entry.unique_id if entry else None,
            "platform": entry.platform if entry else None,
            "area_id": entry.area_id if entry else None,
            "icon": entry.icon if entry else None,
            "disabled_by": str(entry.disabled_by) if entry and entry.disabled_by else None,
        }
    except Exception:
        entry_dict = {}

    return {
        "entity_id": entity_id,
        "state": state.state,
        "friendly_name": state.attributes.get("friendly_name"),
        "icon": state.attributes.get("icon"),
        "domain": entity_id.split(".")[0],
        "attributes": dict(state.attributes),
        "registry": entry_dict,
    }


async def _tool_ha_update_helper(hass: HomeAssistant, params: dict) -> dict:
    """Update a helper's configuration (name, icon, min/max/step, options, etc.)."""
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id required"}

    domain = entity_id.split(".")[0]
    _HELPER_DOMAINS = {
        "input_boolean", "input_number", "input_text",
        "input_select", "input_datetime", "input_button",
        "timer", "counter",
    }
    if domain not in _HELPER_DOMAINS:
        return {"error": f"'{entity_id}' is not a recognised helper domain. Supported: {sorted(_HELPER_DOMAINS)}"}

    try:
        from homeassistant.helpers import entity_registry as er_mod
        registry = er_mod.async_get(hass)
        entry = registry.async_get(entity_id)
    except Exception as exc:
        return {"error": f"Could not access entity registry: {exc}"}

    if entry is None:
        return {"error": f"'{entity_id}' not found in entity registry"}

    # Rename friendly name via registry
    updated_fields: list[str] = []
    try:
        if params.get("name") is not None:
            registry.async_update_entity(entity_id, name=params["name"])
            updated_fields.append("name")
        if params.get("icon") is not None:
            registry.async_update_entity(entity_id, icon=params["icon"])
            updated_fields.append("icon")
        if params.get("area_id") is not None:
            registry.async_update_entity(entity_id, area_id=params["area_id"])
            updated_fields.append("area_id")
    except Exception as exc:
        return {"error": f"Registry update failed: {exc}"}

    # Domain-specific config update via service
    svc_data: dict = {}
    if domain == "input_number":
        for f in ("min", "max", "step", "mode"):
            if params.get(f) is not None:
                svc_data[f] = params[f]
    elif domain == "input_select":
        if params.get("options") is not None:
            svc_data["options"] = params["options"]
    elif domain == "input_text":
        for f in ("min", "max", "pattern", "mode"):
            if params.get(f) is not None:
                svc_data[f] = params[f]
    elif domain == "timer":
        if params.get("duration") is not None:
            svc_data["duration"] = params["duration"]

    if svc_data:
        svc_data["entity_id"] = entity_id
        try:
            await hass.services.async_call(domain, "reload", blocking=True)
            updated_fields.extend(list(svc_data.keys()) - {"entity_id"})
        except Exception:
            pass

    return {
        "success": True,
        "entity_id": entity_id,
        "updated_fields": updated_fields,
        "message": f"Helper '{entity_id}' updated ({', '.join(updated_fields) or 'no changes'}).",
    }


# ── ENTITIES ──────────────────────────────────────────────────────────────────

async def _tool_ha_get_entity_detail(hass: HomeAssistant, params: dict) -> dict:
    """Read all metadata (state, attributes, registry, device info) for an entity."""
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id required"}

    state = hass.states.get(entity_id)
    state_dict: dict = {}
    if state:
        state_dict = {
            "state": state.state,
            "attributes": dict(state.attributes),
            "last_changed": state.last_changed.isoformat() if state.last_changed else None,
            "last_updated": state.last_updated.isoformat() if state.last_updated else None,
            "context": {"id": state.context.id} if state.context else {},
        }

    registry_dict: dict = {}
    device_dict: dict = {}
    try:
        from homeassistant.helpers import entity_registry as er_mod, device_registry as dr_mod
        er = er_mod.async_get(hass)
        entry = er.async_get(entity_id)
        if entry:
            registry_dict = {
                "unique_id": entry.unique_id,
                "platform": entry.platform,
                "area_id": entry.area_id,
                "icon": entry.icon,
                "disabled_by": str(entry.disabled_by) if entry.disabled_by else None,
                "hidden_by": str(entry.hidden_by) if entry.hidden_by else None,
                "device_id": entry.device_id,
                "config_entry_id": entry.config_entry_id,
                "labels": list(entry.labels) if entry.labels else [],
                "categories": dict(entry.categories) if entry.categories else {},
            }
            if entry.device_id:
                dr = dr_mod.async_get(hass)
                device = dr.async_get(entry.device_id)
                if device:
                    device_dict = {
                        "name": device.name_by_user or device.name,
                        "manufacturer": device.manufacturer,
                        "model": device.model,
                        "sw_version": device.sw_version,
                        "area_id": device.area_id,
                    }
    except Exception as exc:
        registry_dict["error"] = str(exc)

    return {
        "entity_id": entity_id,
        "found": state is not None or bool(registry_dict),
        "state": state_dict,
        "registry": registry_dict,
        "device": device_dict,
    }


async def _tool_ha_remove_entity(hass: HomeAssistant, params: dict) -> dict:
    """Remove a ghost/zombie/orphaned entity from the entity registry.

    WARNING: This only removes the registry entry — the entity may reappear
    if the underlying integration re-creates it.
    """
    entity_id = params.get("entity_id", "").strip()
    if not entity_id:
        return {"error": "entity_id required"}

    try:
        from homeassistant.helpers import entity_registry as er_mod
        er = er_mod.async_get(hass)
        entry = er.async_get(entity_id)
        if entry is None:
            return {"error": f"'{entity_id}' not found in entity registry"}

        # Safety check: entity should be unavailable/unknown/disabled or explicitly forced
        force = params.get("force", False)
        state = hass.states.get(entity_id)
        if state and state.state not in ("unavailable", "unknown") and not force:
            return {
                "error": (
                    f"Entity '{entity_id}' is currently in state '{state.state}' — "
                    "it appears active. Set force=true to remove anyway, or use ha_enable_entity "
                    "to disable it first."
                ),
                "current_state": state.state,
            }

        er.async_remove(entity_id)
        return {
            "success": True,
            "removed": entity_id,
            "platform": entry.platform,
            "message": (
                f"Entity '{entity_id}' removed from registry. "
                "Note: it may reappear if the integration re-discovers it."
            ),
        }
    except Exception as exc:
        return {"error": f"Failed to remove entity: {exc}"}


async def _tool_ha_enable_entity(hass: HomeAssistant, params: dict) -> dict:
    """Enable or disable an entity in the registry."""
    entity_id = params.get("entity_id", "").strip()
    enable = params.get("enable", True)
    if not entity_id:
        return {"error": "entity_id required"}

    try:
        from homeassistant.helpers import entity_registry as er_mod
        from homeassistant.helpers.entity_registry import RegistryEntryDisabler
        er = er_mod.async_get(hass)
        entry = er.async_get(entity_id)
        if entry is None:
            return {"error": f"'{entity_id}' not found in entity registry"}

        if enable:
            er.async_update_entity(entity_id, disabled_by=None)
            msg = f"Entity '{entity_id}' enabled."
        else:
            er.async_update_entity(entity_id, disabled_by=RegistryEntryDisabler.USER)
            msg = f"Entity '{entity_id}' disabled."

        return {"success": True, "entity_id": entity_id, "enabled": enable, "message": msg}
    except Exception as exc:
        return {"error": f"Failed to update entity: {exc}"}


# ── CONFIG FILES (SECURITY FIXES) ────────────────────────────────────────────

async def _tool_ha_get_config_file(hass: HomeAssistant, params: dict) -> dict:
    """Read any HA config file (configuration.yaml, secrets.yaml, automations.yaml, etc.).

    Returns the raw content. Useful to inspect hardcoded secrets or misconfigured entries.
    Files outside /config are blocked for safety.
    """
    import os
    filename = params.get("filename", "").strip()
    if not filename:
        return {"error": "filename required (e.g. 'configuration.yaml', 'secrets.yaml', 'automations.yaml')"}

    # Resolve path — only allow files inside /config
    if os.path.isabs(filename):
        fpath = filename
    else:
        fpath = hass.config.path(filename)

    config_root = os.path.realpath(hass.config.config_dir)
    fpath_real  = os.path.realpath(fpath)
    if not fpath_real.startswith(config_root + os.sep) and fpath_real != config_root:
        return {"error": f"Cannot read files outside {config_root}"}

    if not os.path.isfile(fpath_real):
        return {"error": f"File not found: {fpath_real}"}

    try:
        content = await _async_read_file(hass, fpath_real)
    except Exception as exc:
        return {"error": f"Failed to read {fpath_real}: {exc}"}

    # Warn if file contains potential secrets in plaintext
    import re
    sensitive_patterns = [
        r"(?i)(password|token|secret|api_key|access_token|bearer)\s*[=:]\s*\S+",
        r"(?i)(password|token|secret)\s*:\s*['\"]?[^'\"\n]{8,}['\"]?",
    ]
    warnings: list[str] = []
    for pat in sensitive_patterns:
        matches = re.findall(pat, content)
        if matches:
            warnings.append(f"Potential hardcoded sensitive value detected ({len(matches)} match(es))")
            break

    return {
        "filename": fpath,
        "content": content,
        "lines": content.count("\n") + 1,
        "size_bytes": len(content.encode()),
        "warnings": warnings,
    }


async def _tool_ha_update_config_file(hass: HomeAssistant, params: dict) -> dict:
    """Write to a HA config file (safe subset: automations, scripts, scenes, secrets, groups).

    Can do: full replace, line replace, or append.
    ALWAYS validate with ha_check_config after editing configuration.yaml.
    """
    import os, re as _re
    filename = params.get("filename", "").strip()
    content  = params.get("content")
    mode     = params.get("mode", "replace").lower()  # replace | append | patch_line

    if not filename:
        return {"error": "filename required"}
    if content is None:
        return {"error": "content required"}

    # Safety: only allowed filenames/patterns
    _ALLOWED = {
        "automations.yaml", "scripts.yaml", "scenes.yaml",
        "secrets.yaml", "groups.yaml", "customize.yaml",
        "configuration.yaml", "ui-lovelace.yaml",
    }
    basename = os.path.basename(filename)
    if basename not in _ALLOWED and not basename.startswith("packages/"):
        return {
            "error": (
                f"'{basename}' is not in the allowed write list: {sorted(_ALLOWED)}. "
                "Use ha_create_automation/ha_create_script for automation changes."
            )
        }

    if os.path.isabs(filename):
        fpath = filename
    else:
        fpath = hass.config.path(filename)

    # Path traversal protection — os.path.realpath résout les symlinks et les ../
    config_root = os.path.realpath(hass.config.config_dir)
    fpath_real  = os.path.realpath(fpath)
    if not fpath_real.startswith(config_root + os.sep) and fpath_real != config_root:
        return {"error": f"Cannot write files outside {config_root} (resolved: {fpath_real})"}

    # Backup automatique avant toute écriture
    await _auto_backup(hass, f"update_config_file:{basename}")

    try:
        if mode == "append":
            # Atomic append: lire + réécrire
            try:
                existing = open(fpath_real, encoding="utf-8").read()
            except FileNotFoundError:
                existing = ""
            _atomic_write(fpath_real, existing + "\n" + content)
        elif mode == "patch_line":
            old_text = params.get("old_text", "")
            if not old_text:
                return {"error": "patch_line mode requires old_text"}
            try:
                existing = open(fpath_real, encoding="utf-8").read()
            except FileNotFoundError:
                return {"error": f"File not found: {fpath_real}"}
            if old_text not in existing:
                return {"error": f"old_text not found in {filename}"}
            _atomic_write(fpath_real, existing.replace(old_text, content, 1))
        else:  # replace
            _atomic_write(fpath_real, content)
    except Exception as exc:
        return {"error": f"Failed to write {fpath_real}: {exc}"}

    return {
        "success": True,
        "filename": fpath,
        "mode": mode,
        "message": (
            f"File '{filename}' updated (mode={mode}). "
            "Run ha_check_config() to validate before reloading."
        ),
    }


# ── LABELS & CATEGORIES ───────────────────────────────────────────────────────

async def _tool_ha_list_labels(hass: HomeAssistant, params: dict) -> dict:
    """List all labels defined in Home Assistant."""
    try:
        from homeassistant.helpers import label_registry as lr_mod
        lr = lr_mod.async_get(hass)
        labels = [
            {
                "label_id": lbl.label_id,
                "name": lbl.name,
                "icon": lbl.icon,
                "color": lbl.color,
            }
            for lbl in lr.async_list_labels()
        ]
        return {"labels": labels, "total": len(labels)}
    except Exception as exc:
        return {"error": f"Failed to list labels: {exc}"}


async def _tool_ha_create_label(hass: HomeAssistant, params: dict) -> dict:
    """Create a new label in Home Assistant."""
    name = params.get("name", "").strip()
    if not name:
        return {"error": "name required"}
    icon  = params.get("icon", "")
    color = params.get("color", "")

    try:
        from homeassistant.helpers import label_registry as lr_mod
        lr = lr_mod.async_get(hass)
        existing = [l for l in lr.async_list_labels() if l.name.lower() == name.lower()]
        if existing:
            return {
                "success": False,
                "label_id": existing[0].label_id,
                "message": f"Label '{name}' already exists (id: {existing[0].label_id})",
            }
        kwargs: dict = {"name": name}
        if icon:
            kwargs["icon"] = icon
        if color:
            kwargs["color"] = color
        entry = lr.async_create(**kwargs)
        return {
            "success": True,
            "label_id": entry.label_id,
            "name": entry.name,
            "message": f"Label '{name}' created (id: {entry.label_id}).",
        }
    except Exception as exc:
        return {"error": f"Failed to create label: {exc}"}


# ── Register all new tools ─────────────────────────────────────────────────────
TOOL_HANDLERS.update({
    # Scripts
    "ha_get_script":             _tool_ha_get_script,
    "ha_update_script":          _tool_ha_update_script,
    "ha_remove_script":          _tool_ha_remove_script,
    # Scenes
    "ha_get_scene":              _tool_ha_get_scene,
    "ha_create_scene":           _tool_ha_create_scene,
    "ha_update_scene":           _tool_ha_update_scene,
    "ha_remove_scene":           _tool_ha_remove_scene,
    # Blueprints
    "ha_list_blueprints":        _tool_ha_list_blueprints,
    "ha_get_blueprint":          _tool_ha_get_blueprint,
    "ha_update_blueprint":       _tool_ha_update_blueprint,
    "ha_remove_blueprint":       _tool_ha_remove_blueprint,
    "ha_import_blueprint":       _tool_ha_import_blueprint,
    # Dashboards
    "ha_list_dashboards":        _tool_ha_list_dashboards,
    "ha_update_lovelace_card":   _tool_ha_update_lovelace_card,
    "ha_remove_lovelace_card":   _tool_ha_remove_lovelace_card,
    # Helpers
    "ha_get_helper":             _tool_ha_get_helper,
    "ha_update_helper":          _tool_ha_update_helper,
    # Entities
    "ha_get_entity_detail":      _tool_ha_get_entity_detail,
    "ha_remove_entity":          _tool_ha_remove_entity,
    "ha_enable_entity":          _tool_ha_enable_entity,
    # Config files
    "ha_get_config_file":        _tool_ha_get_config_file,
    "ha_update_config_file":     _tool_ha_update_config_file,
    # Labels
    "ha_list_labels":            _tool_ha_list_labels,
    "ha_create_label":           _tool_ha_create_label,
})


# ── Tool definitions for MCP handshake (all 24 new tools) ─────────────────────
_NEW_TOOLS_V151: list[dict[str, Any]] = [
    # ── Scripts ────────────────────────────────────────────────────────────
    {"name": "ha_get_script", "description": "Read a script's full YAML and metadata from scripts.yaml.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string", "description": "script entity_id or alias"}}}},
    {"name": "ha_update_script", "description": "Update an existing script in scripts.yaml (alias, description, mode, sequence, variables).",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string"}, "alias": {"type": "string"},
                     "description": {"type": "string"}, "mode": {"type": "string"},
                     "sequence": {"type": "array"}, "variables": {"type": "object"},
                     "icon": {"type": "string"}}}},
    {"name": "ha_remove_script", "description": "Permanently delete a script from scripts.yaml. Call ha_backup_create first.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string"}}}},
    # ── Scenes ─────────────────────────────────────────────────────────────
    {"name": "ha_get_scene", "description": "Read a scene's YAML and entity states from scenes.yaml.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string", "description": "scene entity_id or name, e.g. 'scene.soiree'"}}}},
    {"name": "ha_create_scene", "description": "Create a new scene in scenes.yaml.",
     "inputSchema": {"type": "object", "required": ["name", "entities"],
      "properties": {"name": {"type": "string"}, "icon": {"type": "string"},
                     "entities": {"type": "object",
                       "description": "e.g. {'light.salon': {'state': 'on', 'brightness': 200}}"}}}},
    {"name": "ha_update_scene", "description": "Update an existing scene in scenes.yaml (name, icon, entities).",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string"}, "name": {"type": "string"},
                     "icon": {"type": "string"}, "entities": {"type": "object"}}}},
    {"name": "ha_remove_scene", "description": "Delete a scene from scenes.yaml. Call ha_backup_create first.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string"}}}},
    # ── Blueprints ─────────────────────────────────────────────────────────
    {"name": "ha_list_blueprints",
     "description": "List all installed blueprints in /config/blueprints/ (automation + script domains).",
     "inputSchema": {"type": "object", "properties": {
       "domain": {"type": "string", "description": "Filter by domain: 'automation' or 'script'. Default: both."}}}},
    {"name": "ha_get_blueprint",
     "description": "Read the full YAML of an installed blueprint.",
     "inputSchema": {"type": "object", "required": ["path"],
      "properties": {"path": {"type": "string",
        "description": "Relative path from /config/blueprints/, e.g. 'automation/haca/my_bp.yaml'"}}}},
    {"name": "ha_update_blueprint",
     "description": (
         "Update an existing blueprint file. Provide 'yaml' for full replacement, "
         "or individual fields (name, description, inputs, triggers, actions) for partial update."
     ),
     "inputSchema": {"type": "object", "required": ["path"],
      "properties": {"path": {"type": "string"}, "yaml": {"type": "string"},
                     "name": {"type": "string"}, "description": {"type": "string"},
                     "inputs": {"type": "object"}, "triggers": {"type": "array"},
                     "actions": {"type": "array"}, "mode": {"type": "string"}}}},
    {"name": "ha_remove_blueprint",
     "description": "Delete a blueprint YAML file from /config/blueprints/. Irreversible — call ha_backup_create first.",
     "inputSchema": {"type": "object", "required": ["path"],
      "properties": {"path": {"type": "string"}}}},
    {"name": "ha_import_blueprint",
     "description": (
         "Import a community blueprint from a raw YAML URL (GitHub raw, community.home-assistant.io export, etc.). "
         "Saves to /config/blueprints/<domain>/imported/<name>.yaml."
     ),
     "inputSchema": {"type": "object", "required": ["url"],
      "properties": {"url": {"type": "string",
        "description": "Direct raw YAML URL, e.g. 'https://raw.githubusercontent.com/.../blueprint.yaml'"}}}},
    # ── Dashboards ─────────────────────────────────────────────────────────
    {"name": "ha_list_dashboards",
     "description": "List all Lovelace dashboards (default dashboard + all custom dashboards).",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "ha_update_lovelace_card",
     "description": (
         "Replace an existing Lovelace card config. Identify the card by view_index + card_index, "
         "or by card_id if the card has an 'id' field."
     ),
     "inputSchema": {"type": "object", "required": ["card_config"],
      "properties": {
        "view_index":   {"type": "integer", "description": "0-based view index (default 0)"},
        "card_index":   {"type": "integer", "description": "0-based card index in the view"},
        "card_id":      {"type": "string",  "description": "Card 'id' field value (alternative to card_index)"},
        "card_config":  {"type": "object",  "description": "Full new card configuration dict"},
        "dashboard_url":{"type": "string",  "description": "Dashboard url_path for non-default dashboards"},
      }}},
    {"name": "ha_remove_lovelace_card",
     "description": "Remove a card from a Lovelace view by index or card id.",
     "inputSchema": {"type": "object", "properties": {
        "view_index":    {"type": "integer"},
        "card_index":    {"type": "integer"},
        "card_id":       {"type": "string"},
        "dashboard_url": {"type": "string"},
      }}},
    # ── Helpers ────────────────────────────────────────────────────────────
    {"name": "ha_get_helper",
     "description": "Read a helper's current state, friendly name, icon, and registry metadata.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string",
        "description": "e.g. 'input_boolean.mode_nuit', 'timer.cuisine'"}}}},
    {"name": "ha_update_helper",
     "description": (
         "Update a helper's configuration: rename, change icon, area, "
         "or domain-specific settings (min/max/step for input_number, "
         "options for input_select, duration for timer)."
     ),
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {
        "entity_id":  {"type": "string"},
        "name":       {"type": "string",  "description": "New friendly name"},
        "icon":       {"type": "string",  "description": "MDI icon, e.g. 'mdi:lightbulb'"},
        "area_id":    {"type": "string"},
        "min":        {"type": "number",  "description": "input_number min"},
        "max":        {"type": "number",  "description": "input_number max"},
        "step":       {"type": "number",  "description": "input_number step"},
        "options":    {"type": "array",   "description": "input_select options list"},
        "duration":   {"type": "string",  "description": "timer duration, e.g. '00:05:00'"},
        "pattern":    {"type": "string",  "description": "input_text regex pattern"},
      }}},
    # ── Entities ───────────────────────────────────────────────────────────
    {"name": "ha_get_entity_detail",
     "description": (
         "Read all metadata for an entity: state, all attributes, registry entry "
         "(unique_id, platform, area, labels, disabled_by), and device info."
     ),
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {"entity_id": {"type": "string"}}}},
    {"name": "ha_remove_entity",
     "description": (
         "Remove a ghost/zombie/orphaned entity from the registry. "
         "Only safe for unavailable or unknown-state entities. "
         "Set force=true to override the safety check."
     ),
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {
        "entity_id": {"type": "string"},
        "force":     {"type": "boolean", "description": "Set true to remove even if entity state is not unavailable/unknown"},
      }}},
    {"name": "ha_enable_entity",
     "description": "Enable or disable an entity in the entity registry.",
     "inputSchema": {"type": "object", "required": ["entity_id"],
      "properties": {
        "entity_id": {"type": "string"},
        "enable":    {"type": "boolean", "description": "true to enable, false to disable (default: true)"},
      }}},
    # ── Config files ────────────────────────────────────────────────────────
    {"name": "ha_get_config_file",
     "description": (
         "Read any HA config file inside /config/ (configuration.yaml, secrets.yaml, "
         "automations.yaml, scripts.yaml, etc.). Use to inspect hardcoded secrets or misconfigured entries."
     ),
     "inputSchema": {"type": "object", "required": ["filename"],
      "properties": {"filename": {"type": "string",
        "description": "Filename relative to /config/, e.g. 'secrets.yaml', 'configuration.yaml'"}}}},
    {"name": "ha_update_config_file",
     "description": (
         "Write to a HA config file. mode='replace' (full overwrite), "
         "'append' (add to end), or 'patch_line' (replace first occurrence of old_text). "
         "Allowed files: automations.yaml, scripts.yaml, scenes.yaml, secrets.yaml, "
         "groups.yaml, customize.yaml, configuration.yaml, ui-lovelace.yaml."
     ),
     "inputSchema": {"type": "object", "required": ["filename", "content"],
      "properties": {
        "filename": {"type": "string"},
        "content":  {"type": "string", "description": "New content or replacement text"},
        "mode":     {"type": "string", "enum": ["replace", "append", "patch_line"], "default": "replace"},
        "old_text": {"type": "string", "description": "Required for patch_line mode: text to find and replace"},
      }}},
    # ── Labels ─────────────────────────────────────────────────────────────
    {"name": "ha_list_labels",
     "description": "List all labels defined in Home Assistant (id, name, icon, color).",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "ha_create_label",
     "description": "Create a new label in Home Assistant.",
     "inputSchema": {"type": "object", "required": ["name"],
      "properties": {
        "name":  {"type": "string"},
        "icon":  {"type": "string", "description": "MDI icon, e.g. 'mdi:tag'"},
        "color": {"type": "string", "description": "CSS color, e.g. '#ff5733'"},
      }}},
]

MCP_TOOLS.extend(_NEW_TOOLS_V151)

# ── Aliases for LLM prefix confusion (ha_* ↔ haca_*) ─────────────────────────
# LLMs sometimes emit "ha_get_automation" instead of "haca_get_automation".
# These aliases are added last so all target functions are already defined.
TOOL_HANDLERS.update({
    "ha_get_automation":  _tool_get_automation,
    "ha_get_issues":      _tool_get_issues,
    "ha_get_score":       _tool_get_score,
    "ha_fix_suggestion":  _tool_fix_suggestion,
    "ha_apply_fix":       _tool_apply_fix,
    "ha_get_batteries":   _tool_get_batteries,
    "ha_explain_issue":   _tool_explain_issue,
})
