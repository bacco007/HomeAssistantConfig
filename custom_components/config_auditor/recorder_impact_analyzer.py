"""H.A.C.A — Recorder Impact Analyzer (Module 21).

Estimates how many state-change events each automation generates per day
in the Recorder DB, based on:
  - trigger frequency (time-based, state-based, event-based)
  - number of entities written by actions
  - HA recorder configuration (include/exclude)

Provides:
  • Top 10 automations by estimated daily DB writes
  • Suggested recorder.exclude entries for intermediate entities
  • Estimated DB size reduction if suggestions applied
"""
from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# ── Trigger frequency estimates (writes/day) ──────────────────────────────────
_TRIGGER_FREQ: dict[str, float] = {
    "time":           2.0,   # fixed time triggers — typically once or twice/day
    "time_pattern":   48.0,  # every 30min default
    "sun":            2.0,   # sunrise + sunset
    "state":          10.0,  # average state change frequency
    "numeric_state":  8.0,
    "event":          5.0,
    "homeassistant":  1.0,
    "mqtt":           20.0,
    "webhook":        3.0,
    "tag":            1.0,
    "calendar":       2.0,
    "template":       15.0,
    "persistent_notification": 1.0,
    "zone":           4.0,
    "device":         8.0,
    "conversation":   1.0,
}

# Estimated bytes per state row stored in Recorder
_BYTES_PER_ROW = 180

# Seconds per day
_DAY = 86400.0


def _estimate_time_pattern_freq(trigger: dict) -> float:
    """Estimate daily writes for a time_pattern trigger."""
    hours   = str(trigger.get("hours",   "") or "")
    minutes = str(trigger.get("minutes", "") or "")
    # "/N" means every N units
    if minutes.startswith("/"):
        interval = int(minutes[1:]) if minutes[1:].isdigit() else 30
        return 60 / interval * 24
    if hours.startswith("/"):
        interval = int(hours[1:]) if hours[1:].isdigit() else 1
        return 24 / interval
    return 2.0  # specific time pattern → ~2/day


class RecorderImpactAnalyzer:
    """Estimate Recorder DB write impact per automation."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.automation_impacts: list[dict[str, Any]] = []
        self.exclude_suggestions: list[dict[str, Any]] = []
        self.total_writes_per_day: float = 0.0
        self.estimated_mb_per_year: float = 0.0

    async def async_analyze(
        self,
        automation_configs: dict[str, dict],
        complexity_scores: list[dict],
    ) -> dict[str, Any]:
        """Compute impact for all automations."""
        alias_map = {s["entity_id"]: s.get("alias", s["entity_id"]) for s in complexity_scores}

        self.automation_impacts = []
        intermediate_entities: dict[str, int] = {}  # entity_id → total writes/day

        for eid, cfg in automation_configs.items():
            freq = self._estimate_trigger_frequency(cfg)
            entities_written = self._collect_written_entities(cfg)
            writes_per_day = freq * max(1, len(entities_written))

            # Track intermediate entities (helpers written by automations)
            for e in entities_written:
                if _is_intermediate(e):
                    intermediate_entities[e] = intermediate_entities.get(e, 0) + int(writes_per_day)

            self.automation_impacts.append({
                "entity_id":       eid,
                "alias":           alias_map.get(eid, eid),
                "trigger_freq":    round(freq, 1),
                "entities_written": list(entities_written),
                "writes_per_day":  round(writes_per_day, 1),
                "bytes_per_day":   round(writes_per_day * _BYTES_PER_ROW),
                "mb_per_year":     round(writes_per_day * _BYTES_PER_ROW * 365 / 1_048_576, 3),
            })

        # Sort descending by writes_per_day, keep top 20 for full list, top 10 highlighted
        self.automation_impacts.sort(key=lambda x: x["writes_per_day"], reverse=True)

        self.total_writes_per_day = sum(a["writes_per_day"] for a in self.automation_impacts)
        self.estimated_mb_per_year = round(
            self.total_writes_per_day * _BYTES_PER_ROW * 365 / 1_048_576, 1
        )

        # Build recorder.exclude suggestions
        self.exclude_suggestions = []
        for eid, wcount in sorted(intermediate_entities.items(), key=lambda x: -x[1]):
            if wcount >= 5:
                self.exclude_suggestions.append({
                    "entity_id": eid,
                    "writes_per_day": wcount,
                    "mb_saved_per_year": round(wcount * _BYTES_PER_ROW * 365 / 1_048_576, 3),
                    "yaml_snippet": f"recorder:\n  exclude:\n    entities:\n      - {eid}",
                })

        total_saved = sum(s["mb_saved_per_year"] for s in self.exclude_suggestions)

        return {
            "automation_impacts":    self.automation_impacts[:20],
            "top10":                 self.automation_impacts[:10],
            "exclude_suggestions":   self.exclude_suggestions[:15],
            "total_writes_per_day":  round(self.total_writes_per_day, 1),
            "estimated_mb_per_year": self.estimated_mb_per_year,
            "total_mb_saved":        round(total_saved, 2),
        }

    # ── Internal ──────────────────────────────────────────────────────────

    def _estimate_trigger_frequency(self, cfg: dict) -> float:
        """Estimate how many times/day this automation fires."""
        triggers = cfg.get("trigger", cfg.get("triggers", [])) or []
        if not isinstance(triggers, list):
            triggers = [triggers]

        total_freq = 0.0
        for t in triggers:
            if not isinstance(t, dict):
                continue
            ttype = t.get("platform") or t.get("trigger", "state")

            if ttype == "time_pattern":
                freq = _estimate_time_pattern_freq(t)
            elif ttype == "time":
                # Count number of explicit time values
                at = t.get("at", [])
                freq = len(at) if isinstance(at, list) else 1.0
            else:
                freq = _TRIGGER_FREQ.get(ttype, 5.0)

            total_freq += freq

        return max(1.0, total_freq)

    def _collect_written_entities(self, cfg: dict) -> set[str]:
        """Return set of entity_ids that this automation writes to."""
        written: set[str] = set()
        actions = cfg.get("action", cfg.get("actions", [])) or []
        if not isinstance(actions, list):
            actions = [actions]

        for a in actions:
            if not isinstance(a, dict):
                continue
            target = a.get("target", {}) or {}
            for eid in _flatten(target.get("entity_id", [])):
                if isinstance(eid, str) and "{{" not in eid:
                    written.add(eid)
            # service data entity_id
            data = a.get("data", {}) or {}
            for eid in _flatten(data.get("entity_id", [])):
                if isinstance(eid, str) and "{{" not in eid:
                    written.add(eid)

        return written


# ── Helpers ───────────────────────────────────────────────────────────────────

_INTERMEDIATE_PREFIXES = (
    "input_boolean.", "input_number.", "input_text.", "input_select.",
    "input_datetime.", "input_button.", "counter.", "timer.",
    "var.",  # custom var integration
)


def _is_intermediate(entity_id: str) -> bool:
    return any(entity_id.startswith(p) for p in _INTERMEDIATE_PREFIXES)


def _flatten(val: Any) -> list:
    if isinstance(val, list):
        return val
    if val is None:
        return []
    return [val]
