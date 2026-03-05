"""Dependency Mapper for H.A.C.A — Module 14.

Builds a graph of nodes and edges representing relationships between:
  automations, scripts, scenes, entities, blueprints, devices.
"""
from __future__ import annotations

import asyncio
import logging
from collections import defaultdict
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

_LOGGER = logging.getLogger(__name__)

# Node type identifiers
NT_AUTOMATION = "automation"
NT_SCRIPT     = "script"
NT_SCENE      = "scene"
NT_ENTITY     = "entity"
NT_BLUEPRINT  = "blueprint"
NT_DEVICE     = "device"


def _domain(entity_id: str) -> str:
    return entity_id.split(".")[0] if "." in entity_id else "unknown"


class DependencyMapper:
    """Build an interactive dependency graph."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.graph: dict[str, Any] = {"nodes": [], "edges": []}

    async def build(
        self,
        automation_configs: dict[str, dict],
        script_configs: dict[str, dict],
        scene_configs: dict[str, dict],
        entity_references: dict[str, list[str]],   # entity_id → [automation_ids]
        alias_map: dict[str, str],                  # entity_id → friendly alias
        all_issues: list[dict],                     # flat list of all issues
    ) -> dict[str, Any]:
        """Build nodes and edges. Returns {nodes, edges}."""

        nodes: dict[str, dict] = {}   # id → node dict
        edges: list[dict] = []

        # ── Build issue index: entity_id → list of issues ─────────────────
        issue_index: dict[str, list[dict]] = defaultdict(list)
        for issue in all_issues:
            eid = issue.get("entity_id", "")
            if eid:
                issue_index[eid].append(issue)

        # ── Helpers ──────────────────────────────────────────────────────
        def add_node(nid: str, ntype: str, label: str, extra: dict | None = None) -> None:
            if nid in nodes:
                return
            node = {
                "id":    nid,
                "type":  ntype,
                "label": label,
                "issues": issue_index.get(nid, []),
            }
            if extra:
                node.update(extra)
            nodes[nid] = node

        def add_edge(source: str, target: str, rel: str) -> None:
            # Avoid duplicates
            for e in edges:
                if e["source"] == source and e["target"] == target and e["rel"] == rel:
                    return
            edges.append({"source": source, "target": target, "rel": rel})

        # ── 1. Automation nodes ───────────────────────────────────────────
        for entity_id, config in automation_configs.items():
            alias = config.get("alias") or alias_map.get(entity_id, entity_id)
            add_node(entity_id, NT_AUTOMATION, alias or entity_id)

        # ── 2. Script nodes ───────────────────────────────────────────────
        for entity_id, config in script_configs.items():
            alias = config.get("alias") or alias_map.get(entity_id, entity_id)
            add_node(entity_id, NT_SCRIPT, alias or entity_id)

        # ── 3. Scene nodes + their entity links ───────────────────────────
        for entity_id, config in scene_configs.items():
            name = config.get("name") or config.get("alias") or entity_id
            add_node(entity_id, NT_SCENE, name)
            entities_in_scene = config.get("entities", {})
            if isinstance(entities_in_scene, dict):
                for ent_id in entities_in_scene:
                    add_node(ent_id, NT_ENTITY, ent_id, {"domain": _domain(ent_id)})
                    add_edge(entity_id, ent_id, "controls")

        # ── 4. Entity → Automation / Script edges ─────────────────────────
        for ent_id, referencing_ids in entity_references.items():
            domain = _domain(ent_id)
            friendly = ent_id
            state = self.hass.states.get(ent_id)
            if state:
                friendly = state.attributes.get("friendly_name", ent_id)
            add_node(ent_id, NT_ENTITY, friendly, {"domain": domain})
            for ref_id in referencing_ids:
                if ref_id in automation_configs or ref_id in script_configs:
                    add_edge(ref_id, ent_id, "uses")

        # ── 5. Blueprint nodes + automation links ─────────────────────────
        for entity_id, config in automation_configs.items():
            bp = config.get("use_blueprint", {})
            if isinstance(bp, dict) and bp.get("path"):
                path = bp["path"]
                bp_id = "blueprint:" + path
                short = path.split("/")[-1]
                add_node(bp_id, NT_BLUEPRINT, short, {"path": path})
                add_edge(entity_id, bp_id, "uses_blueprint")

        # ── 6. Script-calls-script edges ──────────────────────────────────
        def _find_script_calls(actions: list, source_id: str) -> None:
            for action in actions:
                if not isinstance(action, dict):
                    continue
                svc = action.get("service") or action.get("action", "")
                if svc.startswith("script."):
                    target = svc  # e.g. script.my_script
                    if target in script_configs:
                        add_edge(source_id, target, "calls_script")
                # Recurse into branches
                for branch_key in ("sequence", "then", "else", "default", "parallel"):
                    branch = action.get(branch_key, [])
                    if isinstance(branch, list):
                        _find_script_calls(branch, source_id)
                for option in action.get("choose", []):
                    _find_script_calls(option.get("sequence", []), source_id)
                repeat = action.get("repeat", {})
                if isinstance(repeat, dict):
                    _find_script_calls(repeat.get("sequence", []), source_id)

        for entity_id, config in automation_configs.items():
            actions = config.get("actions") or config.get("action", [])
            if isinstance(actions, list):
                _find_script_calls(actions, entity_id)

        for entity_id, config in script_configs.items():
            sequence = config.get("sequence", [])
            if isinstance(sequence, list):
                _find_script_calls(sequence, entity_id)

        # ── 7. Device nodes ───────────────────────────────────────────────
        try:
            dev_reg = dr.async_get(self.hass)
            ent_reg = er.async_get(self.hass)
            # Map entity → device
            for entry in ent_reg.entities.values():
                if entry.device_id and entry.entity_id in nodes:
                    device = dev_reg.async_get(entry.device_id)
                    if device:
                        dev_node_id = "device:" + entry.device_id
                        dev_label = device.name_by_user or device.name or entry.device_id
                        add_node(dev_node_id, NT_DEVICE, dev_label)
                        add_edge(entry.entity_id, dev_node_id, "belongs_to_device")
        except Exception as e:
            _LOGGER.debug("DependencyMapper: device registry error: %s", e)

        # ── 8. Compute node weights (degree) for sizing ───────────────────
        degree: dict[str, int] = defaultdict(int)
        for edge in edges:
            degree[edge["source"]] += 1
            degree[edge["target"]] += 1

        node_list = []
        for nid, node in nodes.items():
            n = dict(node)
            n["degree"]     = degree[nid]
            n["has_issues"] = len(n["issues"]) > 0
            n["max_severity"] = (
                "high"   if any(i.get("severity") == "high"   for i in n["issues"]) else
                "medium" if any(i.get("severity") == "medium" for i in n["issues"]) else
                "low"    if any(i.get("severity") == "low"    for i in n["issues"]) else
                None
            )
            # Keep only summary for issues (avoid huge payload)
            n["issue_count"] = len(n["issues"])
            n["issue_summary"] = [
                {"type": i.get("type"), "severity": i.get("severity"), "message": i.get("message", "")[:120]}
                for i in n["issues"][:5]
            ]
            del n["issues"]
            node_list.append(n)

        self.graph = {"nodes": node_list, "edges": edges}
        _LOGGER.info(
            "DependencyMapper: %d nodes, %d edges built",
            len(node_list), len(edges)
        )
        return self.graph
