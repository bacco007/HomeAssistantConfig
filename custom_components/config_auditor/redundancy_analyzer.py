"""H.A.C.A — Redundancy Analyzer (Module 20).

Detects three classes of redundancy across all automation configs:

1. BLUEPRINT_MATCH  — automation that could be replaced by an available blueprint
2. NATIVE_FEATURE   — automation recreating a native HA feature
                      (e.g. manual input_boolean toggle, entity group on/off)
3. TRIGGER_OVERLAP  — two automations with identical triggers that could conflict
"""
from __future__ import annotations

import logging
import re
from collections import defaultdict
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# ── Native HA feature patterns ────────────────────────────────────────────────
# Each entry: (pattern_id, description, detection_fn(cfg) -> bool)

_NATIVE_PATTERNS: list[tuple[str, str, Any]] = []


def _register(pid: str, desc: str):
    def deco(fn):
        _NATIVE_PATTERNS.append((pid, desc, fn))
        return fn
    return deco


@_register("manual_toggle", "input_boolean manual toggle (use helper.toggle)")
def _check_manual_toggle(cfg: dict) -> bool:
    """Automation that only toggles an input_boolean on a trigger."""
    actions = _get_list(cfg, "action", "actions")
    if not actions:
        return False
    for a in actions:
        svc = a.get("service") or a.get("action", "")
        if not isinstance(svc, str):
            continue
        if svc in ("input_boolean.toggle", "input_boolean.turn_on", "input_boolean.turn_off"):
            # If the only action is this toggle and triggers are manual, flag it
            triggers = _get_list(cfg, "trigger", "triggers")
            if len(triggers) == 1:
                t = triggers[0]
                ttype = t.get("platform") or t.get("trigger", "")
                if ttype in ("state", "event"):
                    return True
    return False


@_register("counter_increment", "counter increment (use counter.increment service directly)")
def _check_counter(cfg: dict) -> bool:
    actions = _get_list(cfg, "action", "actions")
    for a in actions:
        svc = a.get("service") or a.get("action", "")
        if isinstance(svc, str) and svc in ("counter.increment", "counter.decrement", "counter.reset"):
            # Single action automation just incrementing a counter
            if len(actions) == 1:
                return True
    return False


@_register("time_based_scene", "time-based scene activation (use Schedule helper)")
def _check_time_scene(cfg: dict) -> bool:
    triggers = _get_list(cfg, "trigger", "triggers")
    actions  = _get_list(cfg, "action", "actions")
    if not triggers or not actions:
        return False
    # All triggers are time-based
    all_time = all(
        (t.get("platform") or t.get("trigger", "")) in ("time", "time_pattern")
        for t in triggers
        if isinstance(t, dict)
    )
    # Single action calls a scene
    single_scene = (
        len(actions) == 1
        and isinstance(actions[0].get("service") or actions[0].get("action", ""), str)
        and (actions[0].get("service") or actions[0].get("action", "")).startswith("scene.")
    )
    return all_time and single_scene


@_register("notify_only_automation", "notification-only automation (use notify directly or blueprint)")
def _check_notify_only(cfg: dict) -> bool:
    actions = _get_list(cfg, "action", "actions")
    if not actions:
        return False
    # All actions are notify
    all_notify = all(
        isinstance((a.get("service") or a.get("action", "")), str)
        and (a.get("service") or a.get("action", "")).startswith("notify.")
        for a in actions
        if isinstance(a, dict)
    )
    return all_notify and len(actions) == 1


# ── Trigger signature for overlap detection ───────────────────────────────────

def _trigger_signature(trigger: dict) -> str | None:
    """Return a canonical string signature for a trigger, or None if not hashable."""
    ttype = trigger.get("platform") or trigger.get("trigger", "")
    if ttype == "state":
        eid = trigger.get("entity_id", "")
        to  = trigger.get("to", "")
        return f"state:{eid}:{to}"
    if ttype == "numeric_state":
        eid   = trigger.get("entity_id", "")
        above = trigger.get("above", "")
        below = trigger.get("below", "")
        return f"numeric_state:{eid}:{above}:{below}"
    if ttype in ("time", "time_pattern"):
        val = trigger.get("at") or trigger.get("hours", "") or trigger.get("minutes", "")
        return f"{ttype}:{val}"
    if ttype == "event":
        return f"event:{trigger.get('event_type', '')}:{trigger.get('event_data', {})}"
    return None


class RedundancyAnalyzer:
    """Detect redundant automations across all three classes."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.blueprint_matches: list[dict[str, Any]] = []
        self.native_feature_matches: list[dict[str, Any]] = []
        self.trigger_overlaps: list[dict[str, Any]] = []

    async def async_analyze(
        self,
        automation_configs: dict[str, dict],
        blueprint_stats: list[dict],
        complexity_scores: list[dict],
    ) -> dict[str, Any]:
        """Run full redundancy analysis."""
        alias_map = {s["entity_id"]: s.get("alias", s["entity_id"]) for s in complexity_scores}

        # 1 — Native feature matches
        self.native_feature_matches = []
        for eid, cfg in automation_configs.items():
            for pid, desc, check_fn in _NATIVE_PATTERNS:
                try:
                    if check_fn(cfg):
                        self.native_feature_matches.append({
                            "entity_id": eid,
                            "alias":     alias_map.get(eid, eid),
                            "pattern":   pid,
                            "description": desc,
                            "severity":  "low",
                        })
                        break   # one match per automation
                except Exception:
                    pass

        # 2 — Blueprint matches
        self.blueprint_matches = []
        available_blueprints = {b["id"] for b in blueprint_stats if b.get("id")} if blueprint_stats else set()

        for eid, cfg in automation_configs.items():
            # If this automation already uses a blueprint, skip
            if cfg.get("use_blueprint"):
                continue
            suggestions = self._suggest_blueprint(cfg, available_blueprints)
            for bp in suggestions:
                self.blueprint_matches.append({
                    "entity_id":    eid,
                    "alias":        alias_map.get(eid, eid),
                    "blueprint_id": bp,
                    "severity":     "low",
                })

        # 3 — Trigger overlaps
        self.trigger_overlaps = self._find_trigger_overlaps(automation_configs, alias_map)

        return {
            "blueprint_matches":      self.blueprint_matches,
            "native_feature_matches": self.native_feature_matches,
            "trigger_overlaps":       self.trigger_overlaps,
            "total": (
                len(self.blueprint_matches)
                + len(self.native_feature_matches)
                + len(self.trigger_overlaps)
            ),
        }

    # ── Blueprint suggestion heuristics ──────────────────────────────────

    def _suggest_blueprint(self, cfg: dict, available: set[str]) -> list[str]:
        """Return list of blueprint IDs this automation might match."""
        suggestions: list[str] = []
        triggers  = _get_list(cfg, "trigger", "triggers")
        actions   = _get_list(cfg, "action", "actions")
        conditions = _get_list(cfg, "condition", "conditions")

        ttype_set = {(t.get("platform") or t.get("trigger", "")) for t in triggers if isinstance(t, dict)}

        # Motion-activated light pattern
        if "state" in ttype_set and not conditions:
            for a in actions:
                svc = a.get("service") or a.get("action", "")
                if isinstance(svc, str) and ("light" in svc or "switch" in svc):
                    suggestions.append("homeassistant/motion_light")
                    break

        # Time-based notification
        if ("time" in ttype_set or "time_pattern" in ttype_set):
            for a in actions:
                svc = a.get("service") or a.get("action", "")
                if isinstance(svc, str) and "notify" in svc:
                    suggestions.append("homeassistant/time_notification")
                    break

        # Away / presence based
        for t in triggers:
            if isinstance(t, dict) and "person." in str(t.get("entity_id", "")):
                suggestions.append("homeassistant/presence_simulation")
                break

        return suggestions

    # ── Trigger overlap detection ─────────────────────────────────────────

    def _find_trigger_overlaps(
        self,
        automation_configs: dict[str, dict],
        alias_map: dict[str, str],
    ) -> list[dict[str, Any]]:
        """Find pairs of automations with identical trigger signatures."""
        sig_to_autos: dict[str, list[str]] = defaultdict(list)

        for eid, cfg in automation_configs.items():
            for t in _get_list(cfg, "trigger", "triggers"):
                if not isinstance(t, dict):
                    continue
                sig = _trigger_signature(t)
                if sig:
                    sig_to_autos[sig].append(eid)

        overlaps: list[dict[str, Any]] = []
        seen_pairs: set[frozenset] = set()

        for sig, eids in sig_to_autos.items():
            if len(eids) < 2:
                continue
            # Emit one overlap record per unique pair
            for i in range(len(eids)):
                for j in range(i + 1, len(eids)):
                    pair = frozenset([eids[i], eids[j]])
                    if pair in seen_pairs:
                        continue
                    seen_pairs.add(pair)
                    overlaps.append({
                        "entity_id_a": eids[i],
                        "alias_a":     alias_map.get(eids[i], eids[i]),
                        "entity_id_b": eids[j],
                        "alias_b":     alias_map.get(eids[j], eids[j]),
                        "trigger_sig": sig,
                        "severity":    "medium",
                    })

        # Sort by severity (medium only here) then sig
        return overlaps[:50]  # cap at 50 pairs


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_list(cfg: dict, key1: str, key2: str) -> list:
    val = cfg.get(key1) or cfg.get(key2) or []
    return val if isinstance(val, list) else [val]
