"""H.A.C.A — Area Complexity Analyzer (Module 19).

Aggregates automation complexity scores by Home Assistant area and provides:
  • Per-area complexity score (sum + average)
  • Automations that span multiple areas (cross-area risk)
  • Consolidation suggestions for areas with many similar automations
"""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    entity_registry as er,
    device_registry as dr,
)

_LOGGER = logging.getLogger(__name__)


class AreaComplexityAnalyzer:
    """Build area → complexity heatmap from automation configs + entity registry."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.area_stats: list[dict[str, Any]] = []
        self.cross_area_automations: list[dict[str, Any]] = []
        self.consolidation_suggestions: list[dict[str, Any]] = []

    async def async_analyze(
        self,
        automation_configs: dict[str, dict],
        complexity_scores: list[dict],
        entity_area_map: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Run full area complexity analysis."""
        await self.hass.async_add_executor_job(self._build_registries)

        score_map = {s["entity_id"]: s for s in complexity_scores}

        # For each automation, determine which areas it touches
        auto_areas: dict[str, set[str]] = {}  # entity_id → {area_ids}

        for entity_id, cfg in automation_configs.items():
            areas = await self.hass.async_add_executor_job(
                self._extract_automation_areas, entity_id, cfg
            )
            auto_areas[entity_id] = areas

        # Build area → automation list
        area_autos: dict[str, list[str]] = defaultdict(list)
        for eid, areas in auto_areas.items():
            for area_id in areas:
                area_autos[area_id].append(eid)
        # Also add automations with no area under "no_area"
        for eid in automation_configs:
            if not auto_areas.get(eid):
                area_autos["__no_area__"].append(eid)

        # Build area stats
        area_reg = ar.async_get(self.hass)
        self.area_stats = []
        for area_id, auto_ids in area_autos.items():
            area_name = "__no_area__"
            if area_id != "__no_area__":
                area = area_reg.async_get_area(area_id)
                area_name = area.name if area else area_id

            scores_for_area = [score_map[eid]["score"] for eid in auto_ids if eid in score_map]
            total_score = sum(scores_for_area)
            avg_score   = total_score / len(scores_for_area) if scores_for_area else 0
            high_count  = sum(1 for s in scores_for_area if s >= 50)
            med_count   = sum(1 for s in scores_for_area if 30 <= s < 50)

            self.area_stats.append({
                "area_id":    area_id,
                "area_name":  area_name,
                "auto_count": len(auto_ids),
                "total_score": round(total_score, 1),
                "avg_score":   round(avg_score, 1),
                "high_complexity": high_count,
                "med_complexity":  med_count,
                # For heatmap: normalize 0–100
                "heat_value": 0,  # filled below
                "automations": auto_ids[:20],  # sample, not all
            })

        # Normalize heat_value
        if self.area_stats:
            max_total = max(s["total_score"] for s in self.area_stats) or 1
            for s in self.area_stats:
                s["heat_value"] = round(min(100, s["total_score"] / max_total * 100))

        self.area_stats.sort(key=lambda s: s["total_score"], reverse=True)

        # Cross-area automations (automation touching 2+ areas)
        self.cross_area_automations = []
        for eid, areas in auto_areas.items():
            if len(areas) >= 2:
                area_names = []
                for aid in areas:
                    a = area_reg.async_get_area(aid)
                    area_names.append(a.name if a else aid)
                cscore = score_map.get(eid, {})
                self.cross_area_automations.append({
                    "entity_id":  eid,
                    "alias":      cscore.get("alias", eid),
                    "areas":      list(areas),
                    "area_names": area_names,
                    "score":      cscore.get("score", 0),
                })
        self.cross_area_automations.sort(key=lambda x: x["score"], reverse=True)

        # Consolidation suggestions: areas with many similar-complexity automations
        self.consolidation_suggestions = self._build_consolidation_suggestions()

        return {
            "area_stats": self.area_stats,
            "cross_area_automations": self.cross_area_automations,
            "consolidation_suggestions": self.consolidation_suggestions,
        }

    # ── Internal ──────────────────────────────────────────────────────────

    def _build_registries(self) -> None:
        """Pre-warm registry caches (called in executor)."""
        # Nothing to cache — we call async_get inline

    def _extract_automation_areas(self, entity_id: str, cfg: dict) -> set[str]:
        """Extract all area_ids referenced in an automation config."""
        areas: set[str] = set()
        ent_reg = er.async_get(self.hass)
        dev_reg = dr.async_get(self.hass)
        area_reg = ar.async_get(self.hass)

        # 1. Check if the automation entity itself has an area
        entry = ent_reg.async_get(entity_id)
        if entry and entry.area_id:
            areas.add(entry.area_id)

        # 2. Walk triggers + actions for entity_ids and area_ids
        all_targets: list[dict] = []
        for trigger in cfg.get("trigger", cfg.get("triggers", [])) or []:
            if isinstance(trigger, dict):
                all_targets.append(trigger)
        for action in cfg.get("action", cfg.get("actions", [])) or []:
            if isinstance(action, dict):
                all_targets.append(action)
                all_targets.extend(action.get("target", {}) and [action.get("target", {})] or [])

        for obj in all_targets:
            # Explicit area_id in target
            for area_ref in _flatten(obj.get("area_id", [])):
                if isinstance(area_ref, str) and "{{" not in area_ref:
                    # Resolve by name or id
                    a = area_reg.async_get_area(area_ref) or area_reg.async_get_area_by_name(area_ref)
                    if a:
                        areas.add(a.id)

            # entity_id in trigger / action → lookup entity area
            for eid_ref in _flatten(obj.get("entity_id", [])):
                if isinstance(eid_ref, str) and "{{" not in eid_ref:
                    ent = ent_reg.async_get(eid_ref)
                    if ent:
                        a_id = ent.area_id
                        if not a_id and ent.device_id:
                            dev = dev_reg.async_get(ent.device_id)
                            if dev:
                                a_id = dev.area_id
                        if a_id:
                            areas.add(a_id)

        return areas

    def _build_consolidation_suggestions(self) -> list[dict[str, Any]]:
        """Suggest consolidation for areas with ≥3 low/medium complexity automations."""
        suggestions = []
        for stats in self.area_stats:
            if stats["area_id"] == "__no_area__":
                continue
            n = stats["auto_count"]
            avg = stats["avg_score"]
            if n >= 3 and avg < 30 and n >= 4:
                suggestions.append({
                    "area_id":   stats["area_id"],
                    "area_name": stats["area_name"],
                    "auto_count": n,
                    "avg_score":  avg,
                    "suggestion": "merge_simple_automations",
                })
            elif stats["high_complexity"] >= 2:
                suggestions.append({
                    "area_id":   stats["area_id"],
                    "area_name": stats["area_name"],
                    "auto_count": n,
                    "avg_score":  avg,
                    "suggestion": "split_complex_automations",
                })
        return suggestions[:10]


def _flatten(val: Any) -> list:
    if isinstance(val, list):
        return val
    if val is None:
        return []
    return [val]
