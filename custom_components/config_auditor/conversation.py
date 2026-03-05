"""Conversation integration for H.A.C.A - AI Assist."""
from __future__ import annotations
from .translation_utils import TranslationHelper

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_conversation(hass: HomeAssistant, entry: Any) -> None:
    """No-op stub — HACA does not register its own conversation agent.

    HACA uses the HA ai_task service (configured in Settings → General → AI Suggestion)
    via ai_task.generate_data. conversation.async_converse is deprecated.
    This function is kept to avoid breaking __init__.py imports.
    """
    _LOGGER.debug("[HACA] Conversation setup skipped — using ai_task.generate_data instead.")



async def _async_find_all_ai_task_entities(hass: HomeAssistant) -> list[str]:
    """Return ALL available ai_task entities, sorted by priority.

    Priority: Gemini/Google > OpenAI/GPT > Anthropic/Claude > Mistral > Ollama > others.
    Returns an empty list if none are configured.
    """
    try:
        priority_patterns = [
            "gemini", "google_generative_ai", "google",
            "openai", "gpt", "anthropic", "claude",
            "mistral", "ollama",
        ]
        ai_task_entities = hass.states.async_entity_ids("ai_task")
        if not ai_task_entities:
            _LOGGER.warning("[HACA AI] No ai_task entity found. Configure one in HA Settings → General → AI Suggestion.")
            return []

        candidates: list[tuple[int, str]] = []
        for entity_id in ai_task_entities:
            state = hass.states.get(entity_id)
            friendly = state.attributes.get("friendly_name", "").lower() if state else ""
            eid_lower = entity_id.lower()
            rank = len(priority_patterns)
            for i, p in enumerate(priority_patterns):
                if p in eid_lower or p in friendly:
                    rank = i
                    break
            candidates.append((rank, entity_id))

        candidates.sort(key=lambda x: x[0])
        ordered = [eid for _, eid in candidates]
        _LOGGER.debug("[HACA AI] Available ai_task providers: %s", ordered)
        return ordered

    except Exception as exc:
        _LOGGER.error("[HACA AI] Discovery error: %s", exc)
        return []


async def _async_find_ai_task_entity(hass: HomeAssistant) -> str | None:
    """Return the highest-priority ai_task entity, or None. Kept for backward compat."""
    entities = await _async_find_all_ai_task_entities(hass)
    return entities[0] if entities else None


async def _async_call_ai(hass: HomeAssistant, prompt: str, task_name: str = "HACA") -> str:
    """Call ai_task.generate_data with automatic provider fallback.

    Tries each available ai_task entity in priority order.
    If one fails (quota, timeout, error), it logs a warning and moves to the next.
    Returns empty string only if ALL providers fail or none are configured.
    """
    entities = await _async_find_all_ai_task_entities(hass)
    if not entities:
        return ""

    last_error: str = ""
    for entity_id in entities:
        try:
            _LOGGER.debug("[HACA AI] Trying provider: %s", entity_id)
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
                _LOGGER.warning("[HACA AI] %s returned empty result, trying next provider", entity_id)
                continue
            # Result can be nested under entity_id key or directly at root
            if entity_id in result and isinstance(result[entity_id], dict):
                reply = str(result[entity_id].get("data", "") or "")
            else:
                reply = str(result.get("data", "") or "")
            if reply:
                _LOGGER.info("[HACA AI] Got reply from %s", entity_id)
                return reply
            _LOGGER.warning("[HACA AI] %s returned empty data, trying next provider", entity_id)
        except Exception as exc:
            last_error = str(exc)
            _LOGGER.warning("[HACA AI] Provider %s failed (%s), trying next provider", entity_id, exc)
            continue

    _LOGGER.error("[HACA AI] All providers failed. Last error: %s", last_error)
    return ""


# Keep old name as alias for backwards compat (websocket.py imports it)
async def _async_find_llm_agent(hass: HomeAssistant) -> dict[str, str] | None:
    """Deprecated alias — use _async_find_ai_task_entity instead."""
    eid = await _async_find_ai_task_entity(hass)
    return {"type": "ai_task", "id": eid} if eid else None

async def explain_issue_ai(hass: HomeAssistant, issue_data: dict[str, Any]) -> str:
    """Explain a HACA issue using ai_task.generate_data (HA official AI service).

    Falls back to a local rule-based explanation if no ai_task entity is configured.
    """
    import json as _json
    # Load AI prompt from JSON (fully i18n — no hardcoded text)
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
def _get_local_fallback_explanation(hass, issue_data: dict) -> str:
    """Provide a rule-based explanation when AI is not available — text from JSON."""
    import asyncio, json as _json
    from pathlib import Path as _Path
    _lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    try:
        p = _Path(__file__).parent / "translations" / f"{_lang}.json"
        if not p.exists(): p = _Path(__file__).parent / "translations" / "en.json"
        _t = _json.loads(p.read_text(encoding="utf-8")).get("ai_prompts", {})
    except Exception:
        _t = {}
    issue_type = issue_data.get("type", "")
    message = issue_data.get("message", "")
    impact_map = [
        ("device_id",  _t.get("fallback_impact_device_id", "")),
        ("unavailable",_t.get("fallback_impact_unavailable", "")),
        ("zombie",     _t.get("fallback_impact_unavailable", "")),
        ("mode",       _t.get("fallback_impact_mode", "")),
        ("secret",     _t.get("fallback_impact_security", "")),
        ("security",   _t.get("fallback_impact_security", "")),
    ]
    impact = next((v for k, v in impact_map if k in issue_type and v), _t.get("fallback_impact_default", ""))
    intro   = _t.get("fallback_intro", "")
    l_issue = _t.get("fallback_issue_label", "")
    l_imp   = _t.get("fallback_impact_label", "")
    l_rec   = _t.get("fallback_rec_label", "")
    rec     = issue_data.get("recommendation", _t.get("fallback_default_rec", ""))
    return f"{intro}{l_issue} {message}\n{l_imp} {impact}\n\n{l_rec} {rec}"


async def analyze_complexity_ai(hass, row):
    """AI analysis for a complex automation/script: explain + propose a refactored split."""
    import re as _re
    from pathlib import Path as _Path

    entity_id  = row.get("entity_id", "")
    alias      = row.get("alias", entity_id)
    score      = row.get("score", 0)
    n_triggers = row.get("triggers", 0)
    n_conds    = row.get("conditions", 0)
    n_actions  = row.get("actions", 0)
    n_tpl      = row.get("templates", 0)

    # Load YAML config from disk
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
        "Declencheurs: " + str(n_triggers) + " x1=" + str(n_triggers)
        + " | Conditions: " + str(n_conds) + " x2=" + str(n_conds * 2)
        + " | Actions(recursif): " + str(n_actions) + " x1.5=" + str(round(n_actions * 1.5))
        + " | Templates: " + str(n_tpl) + " x3=" + str(n_tpl * 3)
        + " | TOTAL=" + str(score)
    )

    # Load prompts from JSON
    _cplx_lang = hass.data.get("config_auditor", {}).get("user_language") or hass.config.language or "en"
    import json as _cjson
    from pathlib import Path as _cpath
    try:
        _cp = _cpath(__file__).parent / "translations" / f"{_cplx_lang}.json"
        if not _cp.exists(): _cp = _cpath(__file__).parent / "translations" / "en.json"
        _at = _cjson.loads(_cp.read_text(encoding="utf-8")).get("ai_prompts", {})
    except Exception:
        _at = {}
    yaml_key = "complexity_yaml_section" if yaml_config else "complexity_yaml_unavailable"
    yaml_section = _at.get(yaml_key, "").format(yaml=yaml_config[:3000]) if yaml_config else _at.get(yaml_key, "")
    prompt = _at.get("complexity_prompt", "").format(
        kind=kind, kind_upper=kind.upper(), alias=alias, entity_id=entity_id,
        score=score, score_line=score_line, yaml_section=yaml_section
    )

    explanation = ""
    split_proposal = ""
    try:
        # Use ai_task.generate_data — the official HA AI service (conversation.async_converse deprecated)
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
            actions=n_actions, templates=n_tpl
        )

    return {
        "explanation":    explanation,
        "split_proposal": split_proposal,
        "has_proposal":   bool(split_proposal),
        "score":          score,
        "alias":          alias,
        "entity_id":      entity_id,
    }
