"""HACA LLM API — expose les 67 outils HACA à n'importe quel agent HA (Mistral, OpenAI…).

Configuration utilisateur (une seule fois) :
  HA Settings → Voice Assistants → [votre agent] → LLM API → HACA

Ensuite, chaque appel à async_converse sur cet agent injecte automatiquement
les outils HACA. L'agent fait ses tool_calls nativement, HA route vers
HacaTool.async_call → TOOL_HANDLERS → exécution réelle.
"""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import llm
from homeassistant.util.json import JsonObjectType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

HACA_LLM_API_ID   = "haca"
HACA_LLM_API_NAME = "HACA"


# ─── JSON Schema → voluptuous ──────────────────────────────────────────────────

def _json_type_to_validator(prop: dict) -> Any:
    """Convert one JSON Schema property to a voluptuous validator."""
    enum = prop.get("enum")
    if enum:
        return vol.In(enum)
    t = prop.get("type", "string")
    if t == "string":
        return str
    if t == "integer":
        return vol.Coerce(int)
    if t == "number":
        return vol.Coerce(float)
    if t == "boolean":
        return bool
    if t == "array":
        return list
    # object or unknown → passthrough
    return object


def _input_schema_to_vol(input_schema: dict) -> vol.Schema:
    """Convert a MCP inputSchema (JSON Schema object) to a voluptuous Schema."""
    if not input_schema or input_schema.get("type") != "object":
        return vol.Schema({})

    properties     = input_schema.get("properties", {})
    required_names = set(input_schema.get("required", []))
    validators: dict = {}

    for name, prop in properties.items():
        validator = _json_type_to_validator(prop)
        if name in required_names:
            validators[vol.Required(name)] = validator
        else:
            default = prop.get("default", vol.UNDEFINED)
            if default is not vol.UNDEFINED:
                validators[vol.Optional(name, default=default)] = validator
            else:
                validators[vol.Optional(name)] = validator

    return vol.Schema(validators)


# ─── HacaTool ─────────────────────────────────────────────────────────────────

class HacaTool(llm.Tool):
    """Un outil HACA exposé à l'agent IA via le LLM API de HA."""

    def __init__(self, tool_def: dict) -> None:
        self.name        = tool_def["name"]
        self.description = tool_def.get("description", "")
        self.parameters  = _input_schema_to_vol(tool_def.get("inputSchema", {}))

    async def async_call(
        self,
        hass: HomeAssistant,
        tool_input: llm.ToolInput,
        llm_context: llm.LLMContext,
    ) -> JsonObjectType:
        """Exécute l'outil HACA via TOOL_HANDLERS."""
        from .mcp_server import TOOL_HANDLERS

        handler = TOOL_HANDLERS.get(self.name)
        if not handler:
            raise HomeAssistantError(f"HACA tool '{self.name}' not found")

        try:
            result = await handler(hass, tool_input.tool_args)
            _LOGGER.debug("[HACA LLM] Tool %s → %s", self.name, str(result)[:200])
            return result  # type: ignore[return-value]
        except Exception as exc:
            _LOGGER.error("[HACA LLM] Tool %s failed: %s", self.name, exc)
            return {"error": str(exc)}


# ─── HacaLLMAPI ───────────────────────────────────────────────────────────────

class HacaLLMAPI(llm.API):
    """HACA LLM API — expose les outils d'audit et de contrôle HA à tout agent LLM."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(hass=hass, id=HACA_LLM_API_ID, name=HACA_LLM_API_NAME)

    async def async_get_api_instance(
        self, llm_context: llm.LLMContext
    ) -> llm.APIInstance:
        """Construit l'instance avec le contexte HA courant et les 67 outils."""
        from .mcp_server import MCP_TOOLS

        api_prompt = await self._build_api_prompt()
        tools      = [HacaTool(t) for t in MCP_TOOLS]

        _LOGGER.debug("[HACA LLM] API instance: %d tools", len(tools))
        return llm.APIInstance(
            api=self,
            api_prompt=api_prompt,
            llm_context=llm_context,
            tools=tools,
        )

    async def _build_api_prompt(self) -> str:
        """Contexte HACA injecté dans le system prompt de l'agent — multilingue."""
        hass = self.hass

        # ── Load prompt translations ─────────────────────────────────────
        from .translation_utils import TranslationHelper
        th = TranslationHelper(hass)
        lang = hass.data.get(DOMAIN, {}).get("user_language") or hass.config.language or "en"
        await th.async_load_language_section(lang, "llm_prompt")
        p = th.t  # shortcut

        # ── Gather HA context ────────────────────────────────────────────
        try:
            entries    = hass.config_entries.async_entries(DOMAIN)
            cdata_raw  = hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {}) if entries else {}
            coordinator = cdata_raw.get("coordinator")
            cdata       = coordinator.data if coordinator and coordinator.data else {}

            score        = cdata.get("health_score", "?")
            total_issues = cdata.get("total_issues", 0)
            all_issues   = (
                list(cdata.get("automation_issue_list", []))
                + list(cdata.get("entity_issue_list", []))
                + list(cdata.get("security_issue_list", []))
            )
            sev_order = {"high": 0, "medium": 1, "low": 2}
            top5 = sorted(
                all_issues,
                key=lambda i: sev_order.get(i.get("severity", "low"), 2)
            )[:5]
            top5_txt = "\n".join(
                f"  - [{i.get('severity','?').upper()}] "
                f"{i.get('alias') or i.get('entity_id','?')}: "
                f"{(i.get('message') or '')[:120]}"
                for i in top5
            ) or f"  {p('no_issues')}"
        except Exception:
            score        = "?"
            total_issues = 0
            top5_txt     = f"  {p('context_unavailable')}"

        auto_count   = len(hass.states.async_entity_ids("automation"))
        script_count = len(hass.states.async_entity_ids("script"))

        return (
            f"{p('system_role')}\n"
            f"{p('health_score', score=score)}\n"
            f"{p('issues_detected', total=total_issues, auto=auto_count, scripts=script_count)}\n"
            f"{p('top_issues')}\n{top5_txt}\n\n"
            f"{p('rules_title')}\n"
            f"- {p('rule_backup')}\n"
            f"- {p('rule_explain')}\n"
            f"- {p('rule_confirm')}\n"
            f"- {p('rule_use_tools')}\n"
            f"- {p('rule_use_haca_id')}\n"
            f"- {p('rule_proactive')}\n\n"
            f"{p('workflow_fix_title')}\n{p('workflow_fix')}\n\n"
            f"{p('workflow_lovelace_title')}\n{p('workflow_lovelace')}\n\n"
            f"{p('workflow_auto_title')}\n{p('workflow_auto')}\n\n"
            f"{p('workflow_scripts_title')}\n{p('workflow_scripts')}\n"
        )
