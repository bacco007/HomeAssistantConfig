"""Conversation integration for H.A.C.A - AI Assist."""
from __future__ import annotations
from .translation_utils import TranslationHelper

import logging
from typing import Any

from homeassistant.core import HomeAssistant, Context

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Clé pour le cache des explications IA dans hass.data[DOMAIN][entry_id]
_AI_CACHE_KEY = "ai_explanation_cache"

async def async_setup_conversation(hass: HomeAssistant, entry: Any) -> None:
    """No-op stub — HACA does not register its own conversation agent.

    HACA uses ai_task.generate_data or conversation.async_converse.
    This function is kept to avoid breaking __init__.py imports.
    """
    _LOGGER.debug("[HACA] Conversation setup skipped — using ai_task or conversation agent.")


# ─── Agent discovery ──────────────────────────────────────────────────────────

async def _async_get_preferred_agent(hass: HomeAssistant) -> str | None:
    """Return the conversation_engine of the preferred Assist pipeline.

    This is exactly the agent the user selected as favourite in
    Settings → Voice Assistants → [preferred pipeline].
    Returns None if assist_pipeline is not loaded or no pipeline exists.
    """
    try:
        from homeassistant.components.assist_pipeline import pipeline as ap
        preferred_pipeline = ap.async_get_pipeline(hass)  # None → preferred
        engine = preferred_pipeline.conversation_engine
        # Skip the built-in homeassistant agent — it's not an LLM
        from homeassistant.components.conversation import HOME_ASSISTANT_AGENT
        if engine in (HOME_ASSISTANT_AGENT, "homeassistant"):
            return None
        _LOGGER.debug("[HACA AI] Preferred Assist pipeline agent: %s", engine)
        return engine
    except Exception as exc:
        _LOGGER.debug("[HACA AI] Could not read preferred Assist pipeline: %s", exc)
        return None


async def _async_find_all_ai_task_entities(hass: HomeAssistant) -> list[str]:
    """Return ALL available ai_task entities, preferred agent first.

    The preferred Assist pipeline agent is a conversation entity_id like
    "conversation.google_generative_ai_xxx".  The matching ai_task entity
    (e.g. "ai_task.google_generative_ai_xxx") belongs to the same
    config_entry.  We use the entity registry to find that link so the
    preferred provider is always tried first.
    """
    try:
        ai_task_entities = list(hass.states.async_entity_ids("ai_task"))
        if not ai_task_entities:
            _LOGGER.debug("[HACA AI] No ai_task entity found.")
            return []

        preferred_agent = await _async_get_preferred_agent(hass)
        preferred_ai_task: str | None = None

        if preferred_agent:
            try:
                from homeassistant.helpers import entity_registry as er
                ent_reg = er.async_get(hass)

                # Find config_entry_id of the preferred conversation agent
                conv_entry = ent_reg.async_get(preferred_agent)
                preferred_entry_id = conv_entry.config_entry_id if conv_entry else None

                if preferred_entry_id:
                    # Find the ai_task entity that shares the same config_entry
                    for eid in ai_task_entities:
                        ai_entry = ent_reg.async_get(eid)
                        if ai_entry and ai_entry.config_entry_id == preferred_entry_id:
                            preferred_ai_task = eid
                            break
            except Exception as exc:
                _LOGGER.debug("[HACA AI] Could not resolve preferred ai_task entity: %s", exc)

        # Preferred first, then rest alphabetically
        ordered: list[str] = []
        if preferred_ai_task:
            ordered.append(preferred_ai_task)
        for e in sorted(ai_task_entities):
            if e not in ordered:
                ordered.append(e)

        _LOGGER.debug("[HACA AI] ai_task providers (preferred first): %s", ordered)
        return ordered

    except Exception as exc:
        _LOGGER.error("[HACA AI] ai_task discovery error: %s", exc)
        return []

async def _async_find_all_conversation_agents(hass: HomeAssistant) -> list[str]:
    """Return all non-builtin conversation agent IDs.

    Discovery uses three independent sources so a failure in one never blocks
    the others.  The preferred Assist pipeline agent is always placed first.

    Sources:
      A) Preferred Assist pipeline agent  (from async_get_pipeline)
      B) ConversationEntity agents        (hass.data[DATA_COMPONENT].entities)
      C) Manager/AbstractConversationAgent (get_agent_manager / async_get_agent_info)
         — tries HA 2024.x and 2025.x import paths independently

    Each source import is wrapped in its own try/except so an API change in
    one HA version only silences that source, not the whole function.
    """
    # HOME_ASSISTANT_AGENT constant — try import, fall back to known value
    try:
        from homeassistant.components.conversation import HOME_ASSISTANT_AGENT
    except Exception:
        HOME_ASSISTANT_AGENT = "homeassistant"  # type: ignore[assignment]

    _HA_BUILTIN = frozenset({"homeassistant", "conversation.home_assistant"})

    def _is_builtin(aid: str) -> bool:
        return aid in _HA_BUILTIN or aid == HOME_ASSISTANT_AGENT

    # ── Source A : preferred Assist pipeline agent ────────────────────────
    # Always obtained first. Even if B and C fail completely, the preferred
    # agent is known and can be tried directly.
    preferred = await _async_get_preferred_agent(hass)
    all_agents: list[str] = []
    if preferred and not _is_builtin(preferred):
        all_agents.append(preferred)
        _LOGGER.info("[HACA AI] Preferred Assist pipeline agent: %s", preferred)

    # ── Source B : ConversationEntity scan (hass.data[DATA_COMPONENT]) ───
    try:
        from homeassistant.components.conversation.const import DATA_COMPONENT
        entity_component = hass.data.get(DATA_COMPONENT)
        if entity_component:
            for entity in entity_component.entities:
                eid = entity.entity_id
                if not _is_builtin(eid) and eid not in all_agents:
                    all_agents.append(eid)
            _LOGGER.info("[HACA AI] Source B (entity scan) added agents: %s", all_agents)
    except Exception as exc:
        _LOGGER.warning("[HACA AI] Source B (entity scan) failed: %s", exc)

    # ── Source C : AgentManager scan ─────────────────────────────────────
    # HA 2024.x path: homeassistant.components.conversation.agent_manager
    # HA 2025.x moved things around — try both paths independently.
    _manager_found = False

    # C1 — HA 2024.x / early 2025.x
    try:
        from homeassistant.components.conversation.agent_manager import get_agent_manager
        manager = get_agent_manager(hass)
        for info in manager.async_get_agent_info():
            aid = info.id
            if not _is_builtin(aid) and aid not in all_agents:
                all_agents.append(aid)
        _manager_found = True
        _LOGGER.info("[HACA AI] Source C1 (agent_manager) agents total: %s", all_agents)
    except Exception as exc:
        _LOGGER.warning("[HACA AI] Source C1 (agent_manager) failed: %s", exc)

    # C2 — HA 2025.x: async_get_agent_info moved to conversation __init__
    if not _manager_found:
        try:
            from homeassistant.components.conversation import async_get_agent_info
            for info in await async_get_agent_info(hass):
                aid = info.id
                if not _is_builtin(aid) and aid not in all_agents:
                    all_agents.append(aid)
            _LOGGER.info("[HACA AI] Source C2 (async_get_agent_info) agents total: %s", all_agents)
        except Exception as exc:
            _LOGGER.warning("[HACA AI] Source C2 (async_get_agent_info) failed: %s", exc)

    if not all_agents:
        _LOGGER.warning(
            "[HACA AI] No conversation agents found. "
            "Ensure Mistral / OpenRouter is configured in Settings → Voice Assistants."
        )
        return []

    _LOGGER.info("[HACA AI] Conversation agents (preferred first): %s", all_agents)
    return all_agents


async def _async_find_ai_task_entity(hass: HomeAssistant) -> str | None:
    """Return the best available AI provider ID, or None if nothing configured.

    Checks ai_task first, then conversation agents (e.g. Mistral via OpenRouter).
    Used by websocket.py for a quick availability check before starting chat.
    """
    entities = await _async_find_all_ai_task_entities(hass)
    if entities:
        return entities[0]
    agents = await _async_find_all_conversation_agents(hass)
    return agents[0] if agents else None


# ─── AI call with full fallback chain ─────────────────────────────────────────

# Strings returned by HA LLM backends when the call fails at provider level.
# Sources: google_generative_ai_conversation, openai_conversation, anthropic,
#          ollama_conversation, mistral, openrouter, localai, etc.
# These must NOT be treated as valid AI replies — HACA should skip to the next provider.
_LLM_ERROR_REPLIES: frozenset[str] = frozenset({
    # HA core conversation error (google_generative_ai, openai, anthropic, ollama…)
    "error talking to api",
    "error talking to the api",
    # Unable to get / connect
    "unable to get response",
    "unable to get a response",
    "unable to get a response from the api",
    "unable to connect",
    "unable to connect to the server",
    # Refusal / safety
    "sorry, i'm not able to help with that",
    "i'm sorry, i can't help with that",
    "i'm sorry, but i can't help with that",
    "i cannot fulfill this request",
    "i'm unable to fulfill this request",
    # Generic HA error strings
    "error processing your request",
    "an error occurred",
    "an error occurred while processing your request",
    "service unavailable",
    "server error",
    "internal server error",
    # Quota / rate
    "quota exceeded",
    "rate limit exceeded",
    "rate limit reached",
    "too many requests",
    # Connectivity
    "i'm having trouble connecting",
    "i'm having trouble reaching the api",
    "connection error",
    "connection timeout",
    "request timed out",
    "request failed",
    # Safety filter
    "this content has been blocked",
    "content was blocked",
    # Generic apologetic catch-alls (must stay short to avoid false positives)
    "i apologize, but i'm unable",
    "i apologize, but i cannot",
    "i apologize, but i can't",
    "i apologize, but i'm not able",
})

# Prefix patterns for errors that have variable suffixes.
# Keep these precise — false positives would silently drop valid AI responses.
_LLM_ERROR_PREFIXES: tuple[str, ...] = (
    "error talking to",       # "error talking to API", "error talking to the model"
    "unable to get response",
    "unable to connect",
    "unable to reach",
    "error:",                  # "Error: 429 Too Many Requests"
    "api error",               # "API Error 500"
    "http error",              # "HTTP Error 429"
    "httperror",
    "connection error",
    "timeout error",
    "i apologize, but i cannot",   # "I apologize, but I cannot do that/help/..."
    "i apologize, but i can't",
    "i apologize, but i'm unable",
    "i apologize, but i'm not able",
)


def _is_llm_error_reply(text: str) -> bool:
    """Return True if *text* is a known LLM backend error message, not a real answer."""
    normalized = text.strip().lower()
    if normalized in _LLM_ERROR_REPLIES:
        return True
    return any(normalized.startswith(p) for p in _LLM_ERROR_PREFIXES)


async def _async_call_ai(hass: HomeAssistant, prompt: str, task_name: str = "HACA") -> str:
    """Send a prompt to the best available AI provider, with automatic fallback.

    Phase 1 — ai_task.generate_data : preferred ai_task entity first, then others.
               Full prompt sent as LLM instructions. Best path for the agentic loop.
    Phase 2 — conversation.async_converse : tous les agents disponibles.
               Les outils HACA sont injectés nativement via le LLM API HACA.
               Mistral/OpenRouter utilisent ce chemin quand pas d'ai_task entity.

    Returns empty string when every provider has failed.
    """
    last_error: str = ""

    # ── Phase 1 : ai_task.generate_data ───────────────────────────────────
    for entity_id in await _async_find_all_ai_task_entities(hass):
        try:
            _LOGGER.debug("[HACA AI] ai_task → %s", entity_id)
            result = await hass.services.async_call(
                "ai_task",
                "generate_data",
                {
                    "entity_id":    entity_id,
                    "task_name":    task_name,
                    "instructions": prompt,
                },
                blocking=True,
                return_response=True,
            )
            if not result:
                _LOGGER.warning("[HACA AI] ai_task %s: empty result", entity_id)
                continue
            if entity_id in result and isinstance(result[entity_id], dict):
                reply = str(result[entity_id].get("data", "") or "")
            else:
                reply = str(result.get("data", "") or "")
            if reply:
                if _is_llm_error_reply(reply):
                    _LOGGER.warning(
                        "[HACA AI] ai_task %s error: %.120s → trying next",
                        entity_id, reply,
                    )
                    last_error = reply
                    continue
                _LOGGER.info("[HACA AI] ✓ ai_task %s", entity_id)
                return reply
            _LOGGER.warning("[HACA AI] ai_task %s: empty data", entity_id)
        except Exception as exc:
            last_error = str(exc)
            _LOGGER.warning("[HACA AI] ai_task %s failed: %s → trying next", entity_id, exc)

    # ── Phase 2 : conversation.async_converse ─────────────────────────────
    # Les outils HACA sont désormais injectés nativement via le LLM API HACA
    # (Settings → Voice Assistants → [agent] → LLM API → HACA).
    # Plus besoin de tronquer/sanitiser le prompt.
    for agent_id in await _async_find_all_conversation_agents(hass):
        try:
            _LOGGER.debug("[HACA AI] conversation → %s", agent_id)
            from homeassistant.components.conversation import async_converse
            import inspect as _inspect
            _kwargs: dict = {
                "hass": hass,
                "text": prompt,
                "conversation_id": None,
                "context": Context(),
                "agent_id": agent_id,
            }
            _params = set(_inspect.signature(async_converse).parameters)
            if "language" in _params:
                _kwargs["language"] = hass.config.language or "en"
            if "device_id" in _params:
                _kwargs["device_id"] = None
            result = await async_converse(**_kwargs)
            reply = ""
            if result and result.response:
                speech = result.response.speech
                if isinstance(speech, dict):
                    reply = (
                        speech.get("plain", {}).get("speech", "")
                        or next(
                            (v.get("speech", "") for v in speech.values()
                             if isinstance(v, dict)),
                            ""
                        )
                    )
            if reply:
                if _is_llm_error_reply(reply):
                    _LOGGER.warning(
                        "[HACA AI] conversation %s error: %.120s → trying next",
                        agent_id, reply,
                    )
                    last_error = reply
                    continue
                _LOGGER.info("[HACA AI] ✓ conversation %s", agent_id)
                return reply
            _LOGGER.warning("[HACA AI] conversation %s: empty speech", agent_id)
        except Exception as exc:
            last_error = str(exc)
            _LOGGER.warning("[HACA AI] conversation %s failed: %s → trying next", agent_id, exc)

    _LOGGER.warning("[HACA AI] All providers failed. Last error: %s", last_error or "none")
    return ""


# ─── Issue explanation ────────────────────────────────────────────────────────

async def explain_issue_ai(hass: HomeAssistant, issue_data: dict[str, Any]) -> str:
    """Explain a HACA issue using the best available AI provider."""
    import json as _json
    _lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    _th = TranslationHelper(hass)
    await _th.async_load_language_section(_lang, "ai_prompts")
    prompt = _th.t("explain_issue_system").format(
        message=issue_data.get("message", ""),
        type=issue_data.get("type", ""),
        severity=issue_data.get("severity", ""),
        entity=issue_data.get("entity_id") or issue_data.get("alias", ""),
        recommendation=issue_data.get("recommendation", ""),
    )

    reply = await _async_call_ai(hass, prompt, "HACA Issue Explanation")
    if reply:
        return reply
    return _get_local_fallback_explanation(hass, issue_data)


def _get_local_fallback_explanation(hass: HomeAssistant, issue_data: dict) -> str:
    """Rule-based explanation when AI is unavailable — text from JSON.

    Reads from the in-memory _TS_CACHE (pre-loaded at setup) instead of
    hitting the filesystem, to avoid blocking I/O in the event loop.
    """
    _lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    try:
        from . import _TS_CACHE  # noqa: PLC0415
        _all = _TS_CACHE.get(_lang) or _TS_CACHE.get("en") or {}
        # _TS_CACHE stores the "panel" subtree; ai_prompts lives at top level
        # in the raw JSON, so try both locations.
        _t = _all.get("ai_prompts", {})
        if not _t:
            # Fallback: the cache may store the full JSON; reach into it.
            _t = {}
    except Exception:
        _t = {}
    issue_type = issue_data.get("type", "")
    message    = issue_data.get("message", "")
    impact_map = [
        ("device_id",  _t.get("fallback_impact_device_id", "")),
        ("unavailable", _t.get("fallback_impact_unavailable", "")),
        ("zombie",      _t.get("fallback_impact_unavailable", "")),
        ("mode",        _t.get("fallback_impact_mode", "")),
        ("secret",      _t.get("fallback_impact_security", "")),
        ("security",    _t.get("fallback_impact_security", "")),
    ]
    impact  = next((v for k, v in impact_map if k in issue_type and v), _t.get("fallback_impact_default", ""))
    intro   = _t.get("fallback_intro", "")
    l_issue = _t.get("fallback_issue_label", "")
    l_imp   = _t.get("fallback_impact_label", "")
    l_rec   = _t.get("fallback_rec_label", "")
    rec     = issue_data.get("recommendation", _t.get("fallback_default_rec", ""))
    return f"{intro}{l_issue} {message}\n{l_imp} {impact}\n\n{l_rec} {rec}"


# ─── Complexity analysis ──────────────────────────────────────────────────────

async def analyze_complexity_ai(hass: HomeAssistant, row: dict) -> dict:
    """AI analysis for a complex automation/script: explain + propose a split."""
    import re as _re
    from pathlib import Path as _Path

    entity_id  = row.get("entity_id", "")
    alias      = row.get("alias", entity_id)
    score      = row.get("score", 0)
    n_triggers = row.get("triggers", 0)
    n_conds    = row.get("conditions", 0)
    n_actions  = row.get("actions", 0)
    n_tpl      = row.get("templates", 0)

    yaml_config = ""
    try:
        automations_file = _Path(hass.config.config_dir) / "automations.yaml"
        scripts_file     = _Path(hass.config.config_dir) / "scripts.yaml"
        target_file = scripts_file if entity_id.startswith("script.") else automations_file
        slug = entity_id.split(".", 1)[-1]

        def _read():
            import yaml as _yaml
            data = _yaml.safe_load(target_file.read_text(encoding="utf-8")) or []
            if not isinstance(data, list):
                data = [data]
            for item in data:
                if isinstance(item, dict):
                    if item.get("alias") == alias or str(item.get("id", "")) == slug:
                        return _yaml.dump(item, allow_unicode=True, default_flow_style=False)
            return ""

        yaml_config = await hass.async_add_executor_job(_read)
    except Exception as e:
        _LOGGER.debug("analyze_complexity_ai: could not load YAML: %s", e)

    kind = "script" if entity_id.startswith("script.") else "automation"
    score_line = (
        f"Triggers: {n_triggers}x1={n_triggers}"
        f" | Conditions: {n_conds}x2={n_conds * 2}"
        f" | Actions: {n_actions}x1.5={round(n_actions * 1.5)}"
        f" | Templates: {n_tpl}x3={n_tpl * 3}"
        f" | TOTAL={score}"
    )

    _cplx_lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    try:
        from . import _TS_CACHE  # noqa: PLC0415
        _cache_data = _TS_CACHE.get(_cplx_lang) or _TS_CACHE.get("en") or {}
        _at = _cache_data.get("ai_prompts", {})
    except Exception:
        _at = {}

    yaml_key = "complexity_yaml_section" if yaml_config else "complexity_yaml_unavailable"
    yaml_section = _at.get(yaml_key, "").format(yaml=yaml_config[:3000]) if yaml_config else _at.get(yaml_key, "")
    prompt = _at.get("complexity_prompt", "").format(
        kind=kind, kind_upper=kind.upper(), alias=alias, entity_id=entity_id,
        score=score, score_line=score_line, yaml_section=yaml_section,
    )

    explanation  = ""
    split_proposal = ""
    try:
        reply = await _async_call_ai(hass, prompt, "HACA Complexity Analysis")
        if reply:
            exp_m = _re.search(r"```explanation\s*(.*?)\s*```", reply, _re.DOTALL)
            yml_m = _re.search(r"```yaml_proposal\s*(.*?)\s*```", reply, _re.DOTALL)
            explanation    = exp_m.group(1).strip() if exp_m else reply.strip()
            split_proposal = yml_m.group(1).strip() if yml_m else ""
    except Exception as exc:
        _LOGGER.error("analyze_complexity_ai failed: %s", exc)

    if not explanation:
        explanation = _at.get("complexity_fallback", "").format(
            score=score, kind=kind,
            triggers=n_triggers, conditions=n_conds,
            actions=n_actions, templates=n_tpl,
        )

    return {
        "explanation":    explanation,
        "split_proposal": split_proposal,
        "has_proposal":   bool(split_proposal),
        "score":          score,
        "alias":          alias,
        "entity_id":      entity_id,
    }
