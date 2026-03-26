"""Automation analyzer for H.A.C.A - Comprehensive best practices checker."""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import yaml

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import area_registry as ar
from homeassistant.util import slugify as ha_slugify

from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)


class AutomationAnalyzer:
    """Analyze automations for best practice violations."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the analyzer."""
        self.hass = hass
        self.issues: list[dict[str, Any]] = []
        self.automation_issues: list[dict[str, Any]] = []
        self.script_issues: list[dict[str, Any]] = []
        self.scene_issues: list[dict[str, Any]] = []
        self.blueprint_issues: list[dict[str, Any]] = []
        self._automation_configs: dict[str, dict[str, Any]] = {}
        self._script_configs: dict[str, dict[str, Any]] = {}
        self._scene_configs: dict[str, dict[str, Any]] = {}
        self._translator = TranslationHelper(hass)
        # P0: caches for registered services, areas, floors, labels
        self._registered_services: set[str] = set()   # "domain.service_name"
        self._registered_area_ids: set[str] = set()
        self._registered_floor_ids: set[str] = set()
        self._registered_label_ids: set[str] = set()
        self._ignored_entity_ids: set[str] = set()
        # complexity_scores: one entry per automation, all of them (score 0 included)
        self.complexity_scores: list[dict] = []
        # script_complexity_scores: one entry per script
        self.script_complexity_scores: list[dict] = []
        # scene_stats: entity count per scene
        self.scene_stats: list[dict] = []

        # blueprint_stats: usage count per blueprint
        self.blueprint_stats: list[dict] = []

    # ── Public read-only properties (don't access private _ attrs externally) ─

    @property
    def automation_configs(self) -> dict[str, dict]:
        """Public view of loaded automation configurations."""
        return self._automation_configs

    @property
    def script_configs(self) -> dict[str, dict]:
        """Public view of loaded script configurations."""
        return self._script_configs

    @property
    def scene_configs(self) -> dict[str, dict]:
        """Public view of loaded scene configurations."""
        return self._scene_configs

    async def analyze_all(self) -> list[dict[str, Any]]:
        """Analyze all automations."""
        self.issues = []
        self.complexity_scores = []
        self.script_complexity_scores = []
        self.scene_stats = []
        self.blueprint_stats = []
        
        # Load language for translations
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)
        
        # P0: pre-load registries for service / area / floor / label checks
        await self._load_registered_services()
        await self._load_registered_areas_floors_labels()
        await self._load_ignored_entities()
        
        # Load configurations
        await self._load_automation_configs()
        await self._load_script_configs()
        await self._load_scene_configs()
        
        _LOGGER.debug("Analyzing %d automations, %d scripts, %d scenes", 
                     len(self._automation_configs), len(self._script_configs), len(self._scene_configs))
        
        # Analyze each automation
        for idx, (entity_id, config) in enumerate(self._automation_configs.items()):
            if self._is_ignored(entity_id): continue
            self._analyze_automation(entity_id, config)
            if idx % 10 == 0: await asyncio.sleep(0)
            
        # Analyze each script
        for idx, (entity_id, config) in enumerate(self._script_configs.items()):
            if self._is_ignored(entity_id): continue
            self._analyze_script(entity_id, config)
            if idx % 10 == 0: await asyncio.sleep(0)
            
        # Analyze each scene
        for idx, (entity_id, config) in enumerate(self._scene_configs.items()):
            if self._is_ignored(entity_id): continue
            self._analyze_scene(entity_id, config)
            if idx % 10 == 0: await asyncio.sleep(0)
        
        # Collect scene stats (entity count per scene)
        for entity_id, config in self._scene_configs.items():
            entities = config.get("entities", {})
            n = len(entities) if isinstance(entities, dict) else 0
            self.scene_stats.append({
                "entity_id": entity_id,
                "alias":     config.get("name", entity_id),
                "entities":  n,
            })
        self.scene_stats.sort(key=lambda x: x["entities"], reverse=True)

        # Collect blueprint stats (usage count)
        bp_usage: dict[str, dict] = {}
        for entity_id, config in self._automation_configs.items():
            bp = config.get("use_blueprint", {})
            if isinstance(bp, dict) and bp.get("path"):
                path = bp["path"]
                if path not in bp_usage:
                    bp_usage[path] = {"path": path, "count": 0, "automations": []}
                bp_usage[path]["count"] += 1
                bp_usage[path]["automations"].append(config.get("alias") or entity_id)
        self.blueprint_stats = sorted(bp_usage.values(), key=lambda x: x["count"], reverse=True)

        # Collect script complexity scores
        for entity_id, config in self._script_configs.items():
            alias = config.get("alias", entity_id)
            sequence = config.get("sequence", [])
            if not isinstance(sequence, list):
                sequence = [sequence] if sequence else []
            n_actions = self._count_actions_recursive(sequence)
            template_score = self._count_templates(config)
            score = round(n_actions * 1.5 + template_score * 3.0)
            self.script_complexity_scores.append({
                "entity_id": entity_id,
                "alias":     alias or entity_id,
                "score":     score,
                "actions":   n_actions,
                "templates": template_score,
            })
        self.script_complexity_scores.sort(key=lambda x: x["score"], reverse=True)

        # Check for never-triggered automations
        await self._check_never_triggered()
        
        # Check for duplicate automations
        self._check_duplicate_automations()
        
        # Check for excessive delays
        self._check_excessive_delays()
        
        # Check for malformed blueprints
        await self._check_blueprint_issues()

        # v1.3.0 — Script graph analysis (cycles, depth, single-mode-loop, orphans)
        await self._analyze_script_graph()

        # v1.3.0 — Blueprint refactoring candidates
        self._detect_blueprint_candidates()

        # v1.3.0 — Advanced scene analysis (unavailable refs, 90-day ghost, duplicates)
        await self._analyze_advanced_scenes()
        
        # Separate issues by entity_id prefix and issue type
        self.automation_issues = []
        self.script_issues = []
        self.scene_issues = []
        self.blueprint_issues = []

        BLUEPRINT_ISSUE_TYPES = {
            "blueprint_missing_path",
            "blueprint_file_not_found",
            "blueprint_no_inputs",
            "blueprint_empty_input",
            "blueprint_input_entity_unknown",
            "blueprint_input_entity_unavailable",
        }

        for issue in self.issues:
            entity_id = issue.get("entity_id", "")
            issue_type = issue.get("type", "")
            # Propagate source_file from automation config to issue (v1.2.0)
            if "source_file" not in issue:
                cfg = self._automation_configs.get(entity_id) or self._script_configs.get(entity_id)
                if cfg:
                    sf = cfg.get("_source_file", "")
                    if sf:
                        issue["source_file"] = sf
            if issue_type in BLUEPRINT_ISSUE_TYPES:
                # Blueprint issues go to their own list regardless of entity_id
                self.blueprint_issues.append(issue)
            elif entity_id.startswith("script."):
                self.script_issues.append(issue)
            elif entity_id.startswith("scene."):
                self.scene_issues.append(issue)
            else:
                self.automation_issues.append(issue)
        
        _LOGGER.info(
            "Automation analysis complete: %d automations, %d automation issues, %d script issues, %d scene issues",
            len(self._automation_configs),
            len(self.automation_issues),
            len(self.script_issues),
            len(self.scene_issues)
        )
        
        return self.issues

    async def _load_registered_services(self) -> None:
        """Cache the set of currently registered HA services/actions (P0)."""
        self._registered_services = set()
        try:
            all_services = self.hass.services.async_services()
            for domain, services in all_services.items():
                for service_name in services:
                    self._registered_services.add(f"{domain}.{service_name}")
            _LOGGER.debug("P0: loaded %d registered services", len(self._registered_services))
        except Exception as e:
            _LOGGER.error("P0: error loading registered services: %s", e)

    async def _load_registered_areas_floors_labels(self) -> None:
        """Cache registered area/floor/label IDs from HA registries (P0)."""
        self._registered_area_ids = set()
        self._registered_floor_ids = set()
        self._registered_label_ids = set()
        try:
            area_reg = ar.async_get(self.hass)
            for area in area_reg.async_list_areas():
                self._registered_area_ids.add(area.id)
        except Exception as e:
            _LOGGER.error("P0: error loading area registry: %s", e)

        try:
            # Floor registry (available since HA 2024.2)
            from homeassistant.helpers import floor_registry as fr
            floor_reg = fr.async_get(self.hass)
            for floor in floor_reg.async_list_floors():
                self._registered_floor_ids.add(floor.floor_id)
        except (ImportError, AttributeError, Exception) as e:
            _LOGGER.debug("P0: floor registry not available or empty: %s", e)

        try:
            # Label registry (available since HA 2024.4)
            from homeassistant.helpers import label_registry as lr
            label_reg = lr.async_get(self.hass)
            for label in label_reg.async_list_labels():
                self._registered_label_ids.add(label.label_id)
        except (ImportError, AttributeError, Exception) as e:
            _LOGGER.debug("P0: label registry not available or empty: %s", e)

        _LOGGER.debug(
            "P0: loaded %d areas, %d floors, %d labels",
            len(self._registered_area_ids),
            len(self._registered_floor_ids),
            len(self._registered_label_ids),
        )

    async def _load_ignored_entities(self) -> None:
        """Cache entity_ids that have the haca_ignore label (entity or device level)."""
        from .translation_utils import async_get_haca_ignored_entity_ids
        self._ignored_entity_ids = await async_get_haca_ignored_entity_ids(self.hass)

    def _is_ignored(self, entity_id: str) -> bool:
        """Return True if this entity should be skipped (has haca_ignore label)."""
        return entity_id in self._ignored_entity_ids

    async def _load_automation_configs(self) -> None:
        """Load automation configurations from all sources:
        - automations.yaml (standard UI file)
        - .storage/core.automation (UI automations in HA storage)
        - packages/*.yaml (homeassistant.packages)
        - Files referenced via !include_dir_merge_list in configuration.yaml
        Deduplicates by unique_id.
        """
        self._automation_configs = {}
        seen_unique_ids: set[str] = set()
        config_dir = Path(self.hass.config.config_dir)
        entity_reg = er.async_get(self.hass)

        def _map_config_to_entity(config: dict, source_file: str) -> tuple[str | None, dict]:
            """Resolve the HA entity_id for a raw automation config dict."""
            config = dict(config)
            config["_source_file"] = source_file
            automation_id = config.get("id")
            alias = config.get("alias", "")
            entity_id = None

            # 1. Primary: look up the entity_registry by unique_id (most reliable)
            if automation_id:
                for entity in entity_reg.entities.values():
                    if entity.platform == "automation" and entity.unique_id == str(automation_id):
                        entity_id = entity.entity_id
                        break

            # 2. Fallback: derive from alias using the SAME slugify HA uses
            #    (must match HA's entity_id so that haca_ignore labels are found correctly)
            if not entity_id and alias:
                candidate = f"automation.{ha_slugify(alias)}"
                if any(e.entity_id == candidate for e in entity_reg.entities.values()):
                    entity_id = candidate

            # 3. Last resort: synthetic key — will never match the entity_registry
            if not entity_id:
                entity_id = f"automation.unknown_{automation_id or len(self._automation_configs)}"

            return entity_id, config

        def _register(config: dict, source: str) -> None:
            """Register one automation config, deduplicating by unique_id."""
            unique_id = config.get("id")
            if unique_id and str(unique_id) in seen_unique_ids:
                return
            if unique_id:
                seen_unique_ids.add(str(unique_id))
            entity_id, enriched = _map_config_to_entity(config, source)
            self._automation_configs[entity_id] = enriched

        # ── 1. automations.yaml ───────────────────────────────────────────
        automations_file = config_dir / "automations.yaml"
        if automations_file.exists():
            try:
                def _read_yaml_list(path):
                    with open(path, "r", encoding="utf-8") as f:
                        content = yaml.safe_load(f)
                    return content if isinstance(content, list) else []

                automations = await self.hass.async_add_executor_job(
                    _read_yaml_list, automations_file
                )
                for cfg in automations:
                    if isinstance(cfg, dict):
                        _register(cfg, "automations.yaml")
                _LOGGER.debug("automations.yaml: loaded %d entries", len(automations))
            except Exception as e:
                _LOGGER.error("Error loading automations.yaml: %s", e, exc_info=True)

        # ── 2. .storage/core.automation (UI automations) ──────────────────
        storage_file = config_dir / ".storage" / "core.automation"
        if storage_file.exists():
            try:
                def _read_storage():
                    with open(storage_file, "r", encoding="utf-8") as f:
                        return json.load(f)

                storage_data = await self.hass.async_add_executor_job(_read_storage)
                items = storage_data.get("data", {}).get("items", [])
                for cfg in items:
                    if isinstance(cfg, dict):
                        _register(cfg, ".storage/core.automation")
                _LOGGER.debug(".storage/core.automation: loaded %d entries", len(items))
            except Exception as e:
                _LOGGER.error("Error loading .storage/core.automation: %s", e, exc_info=True)

        # ── 3. packages/*.yaml (homeassistant.packages) ───────────────────
        packages_dir = config_dir / "packages"
        if packages_dir.is_dir():
            try:
                def _read_packages(pkg_dir: Path) -> list[tuple[str, list]]:
                    results = []
                    for yaml_file in sorted(pkg_dir.rglob("*.yaml")):
                        try:
                            with open(yaml_file, "r", encoding="utf-8") as f:
                                content = yaml.safe_load(f)
                            if not isinstance(content, dict):
                                continue
                            # Support top-level 'automation:' or nested under 'homeassistant:'
                            automations_raw = content.get("automation", [])
                            if not automations_raw:
                                automations_raw = content.get("homeassistant", {}).get("automation", [])
                            if isinstance(automations_raw, dict):
                                automations_raw = [automations_raw]
                            if automations_raw:
                                results.append((str(yaml_file.relative_to(pkg_dir.parent)), automations_raw))
                        except Exception:
                            pass
                    return results

                pkg_results = await self.hass.async_add_executor_job(_read_packages, packages_dir)
                for source_rel, pkg_automations in pkg_results:
                    for cfg in pkg_automations:
                        if isinstance(cfg, dict):
                            _register(cfg, f"packages/{source_rel}")
                _LOGGER.debug("packages/: loaded automations from %d files", len(pkg_results))
            except Exception as e:
                _LOGGER.error("Error loading packages/*.yaml: %s", e, exc_info=True)

        # ── 4. configuration.yaml — !include_dir_merge_list ───────────────
        config_yaml_path = config_dir / "configuration.yaml"
        if config_yaml_path.exists():
            try:
                def _scan_config_includes(cfg_path: Path, cfg_dir: Path) -> list[tuple[str, list]]:
                    """Detect and resolve !include_dir_merge_list automation directories."""
                    results = []
                    try:
                        with open(cfg_path, "r", encoding="utf-8") as f:
                            raw = f.read()
                        # Detect: automation: !include_dir_merge_list <dir>
                        import re as _re
                        matches = _re.findall(
                            r"^automation\s*:\s*!include_dir_merge_list\s+(\S+)",
                            raw, _re.MULTILINE
                        )
                        for rel_dir in matches:
                            target = cfg_dir / rel_dir
                            if target.is_dir():
                                for yaml_file in sorted(target.rglob("*.yaml")):
                                    try:
                                        with open(yaml_file, "r", encoding="utf-8") as f:
                                            content = yaml.safe_load(f)
                                        if isinstance(content, list):
                                            rel = str(yaml_file.relative_to(cfg_dir))
                                            results.append((rel, content))
                                        elif isinstance(content, dict):
                                            rel = str(yaml_file.relative_to(cfg_dir))
                                            results.append((rel, [content]))
                                    except Exception:
                                        pass
                    except Exception:
                        pass
                    return results

                include_results = await self.hass.async_add_executor_job(
                    _scan_config_includes, config_yaml_path, config_dir
                )
                for source_rel, inc_automations in include_results:
                    for cfg in inc_automations:
                        if isinstance(cfg, dict):
                            _register(cfg, source_rel)
                _LOGGER.debug("configuration.yaml includes: loaded automations from %d files", len(include_results))
            except Exception as e:
                _LOGGER.error("Error scanning configuration.yaml includes: %s", e, exc_info=True)

        _LOGGER.info(
            "Total automation configs loaded: %d (from %d unique sources)",
            len(self._automation_configs),
            len({c.get("_source_file", "?") for c in self._automation_configs.values()}),
        )

    async def _load_script_configs(self) -> None:
        """Load script configurations from scripts.yaml."""
        self._script_configs.clear()  # Clear stale data from previous scans
        config_dir = Path(self.hass.config.config_dir)
        scripts_file = config_dir / "scripts.yaml"
        if not scripts_file.exists(): return
        
        try:
            def read_scripts():
                with open(scripts_file, "r", encoding="utf-8") as f:
                    content = yaml.safe_load(f)
                    return content if content is not None else {}
            
            scripts = await self.hass.async_add_executor_job(read_scripts)
            for slug, config in scripts.items():
                self._script_configs[f"script.{slug}"] = config
        except Exception as e:
            _LOGGER.error("Error loading scripts.yaml: %s", e)

    async def _load_scene_configs(self) -> None:
        """Load scene configurations from scenes.yaml.

        HA derives the entity_id from the scene *name* using slugify():
            scene.{slugify(name)}
        We must use the same function to match what hass.states contains.
        """
        self._scene_configs.clear()  # Clear stale data from previous scans
        config_dir = Path(self.hass.config.config_dir)
        scenes_file = config_dir / "scenes.yaml"
        if not scenes_file.exists():
            return

        try:
            def read_scenes():
                with open(scenes_file, "r", encoding="utf-8") as f:
                    content = yaml.safe_load(f)
                    return content if content is not None else []

            scenes = await self.hass.async_add_executor_job(read_scenes)
            for config in scenes:
                if not isinstance(config, dict):
                    continue
                if "id" not in config and "name" not in config:
                    continue
                # HA builds the entity_id via slugify(name), same as any other entity.
                # Fall back to slugify(id) if name is absent (rare but valid).
                name_or_id = config.get("name") or config.get("id", "")
                entity_id = f"scene.{ha_slugify(str(name_or_id))}"
                self._scene_configs[entity_id] = config
        except Exception as e:
            _LOGGER.error("Error loading scenes.yaml: %s", e)

    # ═══════════════════════════════════════════════════════════════════════
    # v1.3.0 — Script graph analysis (a/)
    # ═══════════════════════════════════════════════════════════════════════

    def _collect_script_calls_recursive(self, actions: Any) -> set[str]:
        """Return all script.* entity_ids called in an action tree (recursively)."""
        called: set[str] = set()
        if isinstance(actions, dict):
            actions = [actions]
        if not isinstance(actions, list):
            return called
        for action in actions:
            if not isinstance(action, dict):
                continue
            service = action.get("service") or action.get("action", "")
            if isinstance(service, str):
                # Direct call: service: script.my_script
                if service.startswith("script.") and service != "script.turn_on":
                    called.add(service)
                # script.turn_on with target entity_id
                elif service == "script.turn_on":
                    target = action.get("target", {})
                    if isinstance(target, dict):
                        eid = target.get("entity_id")
                        for e in ([eid] if isinstance(eid, str) else (eid or [])):
                            if isinstance(e, str) and e.startswith("script."):
                                called.add(e)
            # Recurse into all branch types
            for key in ("sequence", "then", "else", "default"):
                called.update(self._collect_script_calls_recursive(action.get(key, [])))
            for branch in action.get("choose", []):
                if isinstance(branch, dict):
                    called.update(self._collect_script_calls_recursive(branch.get("sequence", [])))
            called.update(self._collect_script_calls_recursive(action.get("parallel", [])))
            repeat = action.get("repeat")
            if isinstance(repeat, dict):
                called.update(self._collect_script_calls_recursive(repeat.get("sequence", [])))
        return called

    async def _analyze_script_graph(self) -> None:
        """v1.3.0 — Build script call graph and detect:
        - Cycles (high)
        - Call depth > SCRIPT_CALL_DEPTH_THRESHOLD (medium)
        - mode:single scripts called in rapid-trigger automations (medium)
        - Orphan scripts never called by anything (low)
        """
        from .const import SCRIPT_CALL_DEPTH_THRESHOLD, SCRIPT_BLUEPRINT_MIN_AUTOMATIONS
        t = self._translator.t

        # ── Build call graph ─────────────────────────────────────────────
        # graph[script_id] = set of script_ids it calls
        graph: dict[str, set[str]] = {eid: set() for eid in self._script_configs}
        called_by_anyone: set[str] = set()

        for caller_id, config in {**self._automation_configs, **self._script_configs}.items():
            actions = config.get("actions") or config.get("action") or config.get("sequence", [])
            if not isinstance(actions, list):
                actions = [actions] if actions else []
            called = self._collect_script_calls_recursive(actions)
            called_by_anyone.update(called)
            if caller_id in self._script_configs:
                graph[caller_id].update(called & set(self._script_configs))

        await asyncio.sleep(0)

        # ── 1. Cycle detection (DFS with path stack) ──────────────────────
        visited: set[str] = set()
        reported_cycles: set[frozenset] = set()

        def _dfs(node: str, path: list, path_set: set) -> None:
            if node in path_set:
                cycle_start = path.index(node)
                cycle = path[cycle_start:]
                key = frozenset(cycle)
                if key not in reported_cycles:
                    reported_cycles.add(key)
                    cycle_str = " → ".join([*cycle, node])
                    self.issues.append({
                        "entity_id": cycle[0],
                        "type": "script_cycle",
                        "severity": "high",
                        "message": t("script_cycle", cycle=cycle_str),
                        "recommendation": t("script_break_cycle"),
                    })
                return
            if node in visited:
                return
            path.append(node)
            path_set.add(node)
            for neighbor in sorted(graph.get(node, set())):
                _dfs(neighbor, path, path_set)
            path.pop()
            path_set.discard(node)
            visited.add(node)

        for node in sorted(graph.keys()):
            if node not in visited and not self._is_ignored(node):
                _dfs(node, [], set())

        cycle_members = {eid for key in reported_cycles for eid in key}
        await asyncio.sleep(0)

        # ── 2. Call depth > threshold ────────────────────────────────────
        def _max_depth(node: str, seen: frozenset) -> int:
            """Max call depth from node, with cycle guard."""
            if node in seen:
                return 0
            children = graph.get(node, set())
            if not children:
                return 0
            new_seen = seen | {node}
            return 1 + max((_max_depth(c, new_seen) for c in children), default=0)

        for script_id in self._script_configs:
            if self._is_ignored(script_id) or script_id in cycle_members:
                continue
            depth = _max_depth(script_id, frozenset())
            if depth > SCRIPT_CALL_DEPTH_THRESHOLD:
                alias = self._script_configs[script_id].get("alias", script_id)
                self.issues.append({
                    "entity_id": script_id,
                    "type": "script_call_depth",
                    "severity": "medium",
                    "message": t("script_call_depth", alias=alias, depth=depth),
                    "recommendation": t("script_reduce_depth"),
                })

        await asyncio.sleep(0)

        # ── 3. mode:single called from rapid-trigger automations ──────────
        RAPID_TRIGGER_PLATFORMS = {"time_pattern", "time", "interval", "mqtt"}
        single_mode_scripts = {
            eid for eid, cfg in self._script_configs.items()
            if cfg.get("mode") == "single"
        }
        already_reported_single: set[str] = set()

        for auto_id, config in self._automation_configs.items():
            if self._is_ignored(auto_id):
                continue
            triggers = config.get("triggers") or config.get("trigger", [])
            if isinstance(triggers, dict):
                triggers = [triggers]
            if not isinstance(triggers, list):
                continue
            is_rapid = any(
                isinstance(tr, dict) and tr.get("platform") in RAPID_TRIGGER_PLATFORMS
                for tr in triggers
            )
            if not is_rapid:
                continue
            actions = config.get("actions") or config.get("action", [])
            if not isinstance(actions, list):
                actions = [actions] if actions else []
            called = self._collect_script_calls_recursive(actions)
            for script_id in (called & single_mode_scripts) - already_reported_single:
                already_reported_single.add(script_id)
                alias = self._script_configs[script_id].get("alias", script_id)
                auto_alias = config.get("alias", auto_id)
                self.issues.append({
                    "entity_id": script_id,
                    "type": "script_single_mode_loop",
                    "severity": "medium",
                    "message": t("script_single_mode_loop", alias=alias, automation=auto_alias),
                    "recommendation": t("script_single_mode_fix"),
                })

        await asyncio.sleep(0)

        # ── 4. Orphan scripts (never called) ─────────────────────────────
        for script_id in self._script_configs:
            if self._is_ignored(script_id) or script_id in called_by_anyone:
                continue
            alias = self._script_configs[script_id].get("alias", script_id)
            self.issues.append({
                "entity_id": script_id,
                "type": "script_orphan",
                "severity": "low",
                "message": t("script_orphan", alias=alias),
                "recommendation": t("script_remove_or_integrate"),
            })

    # ═══════════════════════════════════════════════════════════════════════
    # v1.3.0 — Blueprint refactoring suggestion (c/)
    # ═══════════════════════════════════════════════════════════════════════

    def _detect_blueprint_candidates(self) -> None:
        """v1.3.0 — Flag scripts called by > SCRIPT_BLUEPRINT_MIN_AUTOMATIONS
        distinct automations as blueprint refactoring candidates."""
        from .const import SCRIPT_BLUEPRINT_MIN_AUTOMATIONS
        t = self._translator.t
        script_callers: dict[str, set[str]] = {}  # script_id → set of automation_ids

        for auto_id, config in self._automation_configs.items():
            actions = config.get("actions") or config.get("action", [])
            if not isinstance(actions, list):
                actions = [actions] if actions else []
            for script_id in self._collect_script_calls_recursive(actions):
                if script_id in self._script_configs:
                    script_callers.setdefault(script_id, set()).add(auto_id)

        for script_id, auto_ids in script_callers.items():
            if len(auto_ids) > SCRIPT_BLUEPRINT_MIN_AUTOMATIONS:
                alias = self._script_configs[script_id].get("alias", script_id)
                self.issues.append({
                    "entity_id": script_id,
                    "type": "script_blueprint_candidate",
                    "severity": "low",
                    "message": t("script_blueprint_candidate",
                                 alias=alias, count=len(auto_ids)),
                    "recommendation": t("script_create_blueprint"),
                    "automation_ids": sorted(auto_ids)[:10],
                })

    # ═══════════════════════════════════════════════════════════════════════
    # v1.3.0 — Advanced scene analysis (b/)
    # ═══════════════════════════════════════════════════════════════════════

    async def _analyze_advanced_scenes(self) -> None:
        """v1.3.0 — Advanced scene checks:
        - Entity in scene is currently unavailable (medium)
        - Scene not activated in 90 days (low)
        - Duplicate scenes with identical entity/state set (medium)
        """
        from .const import SCENE_GHOST_DAYS
        t = self._translator.t
        cutoff = datetime.now(timezone.utc) - timedelta(days=SCENE_GHOST_DAYS)

        fingerprints: dict[str, str] = {}  # scene_entity_id → fingerprint

        for entity_id, config in self._scene_configs.items():
            if self._is_ignored(entity_id):
                continue
            entities = config.get("entities", {})
            if not isinstance(entities, dict):
                entities = {}

            # 1. Unavailable entity references
            for ent_id in entities:
                state = self.hass.states.get(ent_id)
                if state and state.state in ("unavailable", "unknown"):
                    self.issues.append({
                        "entity_id": entity_id,
                        "type": "scene_entity_unavailable",
                        "severity": "medium",
                        "message": t("scene_entity_unavailable", entity_id=ent_id),
                        "recommendation": t("scene_fix_unavailable_entity"),
                    })

            # 2. Last triggered > SCENE_GHOST_DAYS days ago
            scene_state = self.hass.states.get(entity_id)
            if scene_state:
                raw_ts = (scene_state.attributes.get("last_triggered")
                          or scene_state.attributes.get("last_activated"))
                if raw_ts:
                    try:
                        if isinstance(raw_ts, datetime):
                            last_dt = raw_ts if raw_ts.tzinfo else raw_ts.replace(tzinfo=timezone.utc)
                        else:
                            ts = str(raw_ts).rstrip("Z")
                            if "+" not in ts and ts.count("-") < 3:
                                ts += "+00:00"
                            last_dt = datetime.fromisoformat(ts)
                        if last_dt < cutoff:
                            days_ago = (datetime.now(timezone.utc) - last_dt).days
                            self.issues.append({
                                "entity_id": entity_id,
                                "type": "scene_not_triggered",
                                "severity": "low",
                                "message": t("scene_not_triggered", days=days_ago),
                                "recommendation": t("scene_check_if_used"),
                            })
                    except Exception:
                        pass

            # 3. Build dedup fingerprint
            try:
                fp_parts = [
                    f"{eid}:{json.dumps(sv, sort_keys=True) if isinstance(sv, dict) else str(sv)}"
                    for eid, sv in sorted(entities.items())
                ]
                fingerprints[entity_id] = "|".join(fp_parts)
            except Exception:
                pass

            await asyncio.sleep(0)

        # Duplicate detection
        seen: dict[str, str] = {}  # fingerprint → first scene_entity_id
        for scene_id, fp in fingerprints.items():
            if not fp:
                continue
            if fp in seen:
                other = seen[fp]
                self.issues.append({
                    "entity_id": scene_id,
                    "type": "scene_duplicate",
                    "severity": "medium",
                    "message": t("scene_duplicate", other_scene=other),
                    "recommendation": t("scene_merge_duplicates"),
                })
            else:
                seen[fp] = scene_id

    def _analyze_script(self, entity_id: str, config: dict[str, Any]) -> None:
        """Analyze a single script."""
        alias = config.get("alias", entity_id)
        t = self._translator.t
        
        # Check for missing description
        if not config.get("description"):
            self.issues.append({
                "entity_id": entity_id,
                "type": "no_description",
                "severity": "low",
                "message": t("script_no_description", alias=alias),
                "recommendation": t("add_description"),
            })
            
        # Check for missing sequence
        if not config.get("sequence"):
             self.issues.append({
                "entity_id": entity_id,
                "type": "empty_script",
                "severity": "high",
                "message": t("script_no_sequence", alias=alias),
                "recommendation": t("add_description"),
            })

    def _analyze_scene(self, entity_id: str, config: dict[str, Any]) -> None:
        """Analyze a single scene."""
        t = self._translator.t
        
        if not config.get("entities"):
             self.issues.append({
                "entity_id": entity_id,
                "type": "empty_scene",
                "severity": "medium",
                "message": t("scene_no_entities"),
                "recommendation": t("add_description"),
            })

    def _analyze_automation(self, entity_id: str, config: dict[str, Any]) -> None:
        """Analyze a single automation."""
        alias = config.get("alias", "")
        automation_id = str(config.get("id") or "")   # ID interne HA (clé dans automations.yaml)
        t = self._translator.t
        
        # Check for missing alias
        if not alias:
            self.issues.append({
                "entity_id": entity_id,
                "alias": entity_id,
                "automation_id": automation_id,
                "type": "no_alias",
                "severity": "medium",
                "message": t("no_alias"),
                "location": "root",
                "recommendation": t("add_alias"),
                "fix_available": False,
            })
        
        # Check for missing description
        if not config.get("description"):
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias or entity_id,
                "automation_id": automation_id,
                "type": "no_description",
                "severity": "low",
                "message": t("no_description"),
                "location": "root",
                "recommendation": t("add_description"),
                "fix_available": False,
            })
        
        # Analyze triggers - support both 'trigger' (old) and 'triggers' (new UI format)
        triggers = config.get("triggers") or config.get("trigger", [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
        
        _LOGGER.debug("Analyzing %d triggers for %s", len(triggers), entity_id)
        
        for idx, trigger in enumerate(triggers):
            if isinstance(trigger, dict):
                self._analyze_trigger(entity_id, alias or entity_id, automation_id, trigger, idx)
        
        # Analyze conditions - support both 'condition' and 'conditions'
        conditions = config.get("conditions") or config.get("condition", [])
        if not isinstance(conditions, list):
            conditions = [conditions] if conditions else []
        
        for idx, condition in enumerate(conditions):
            if isinstance(condition, dict):
                self._analyze_condition(entity_id, alias or entity_id, automation_id, condition, idx)
        
        # Analyze actions - support both 'action' (old) and 'actions' (new UI format)
        actions = config.get("actions") or config.get("action", [])
        if not isinstance(actions, list):
            actions = [actions] if actions else []
        
        for idx, action in enumerate(actions):
            if isinstance(action, dict):
                self._analyze_action(entity_id, alias or entity_id, automation_id, action, idx)
        
        # Analyze mode
        self._analyze_mode(entity_id, alias or entity_id, automation_id, config)

        # ── Complexity Score ─────────────────────────────────────────────────
        self._analyze_complexity(entity_id, alias or entity_id, automation_id, config)

    def _count_templates(self, obj: Any, depth: int = 0) -> int:
        """Recursively count template expressions and return weighted depth score."""
        if isinstance(obj, str):
            # Jinja2 template markers
            has_template = "{{" in obj or "{%" in obj
            return (depth + 1) if has_template else 0
        if isinstance(obj, dict):
            return sum(self._count_templates(v, depth + 1) for v in obj.values())
        if isinstance(obj, list):
            return sum(self._count_templates(item, depth) for item in obj)
        return 0

    def _count_actions_recursive(self, actions: list) -> int:
        """Count all actions including nested (choose/if/repeat/parallel branches)."""
        total = 0
        for action in actions:
            if not isinstance(action, dict):
                continue
            total += 1
            # choose: each option's sequence
            for option in action.get("choose", []):
                total += self._count_actions_recursive(option.get("sequence", []))
            # else branch of choose / if/else
            total += self._count_actions_recursive(action.get("default", []))
            # if/then/else
            total += self._count_actions_recursive(action.get("then", []))
            total += self._count_actions_recursive(action.get("else", []))
            # repeat
            repeat = action.get("repeat", {})
            total += self._count_actions_recursive(repeat.get("sequence", []))
            # parallel
            total += self._count_actions_recursive(action.get("parallel", []))
        return total

    def _analyze_complexity(
        self, entity_id: str, alias: str, automation_id: str, config: dict[str, Any]
    ) -> None:
        """Compute a complexity score for every automation.

        Formula: (triggers×1) + (conditions×2) + (actions×1.5) + (template_depth×3)
        Thresholds for issues:
          ≥ 50  →  MEDIUM  "God automation" — must be split
          ≥ 30  →  LOW     "Complex automation" — consider refactoring
        All automations are recorded in self.complexity_scores regardless of threshold.
        """
        t = self._translator.t

        triggers = config.get("triggers") or config.get("trigger", [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []

        conditions = config.get("conditions") or config.get("condition", [])
        if not isinstance(conditions, list):
            conditions = [conditions] if conditions else []

        actions = config.get("actions") or config.get("action", [])
        if not isinstance(actions, list):
            actions = [actions] if actions else []

        n_triggers     = len(triggers)
        n_conditions   = len(conditions)
        n_actions      = self._count_actions_recursive(actions)
        template_score = self._count_templates(config)

        score = round(
            n_triggers * 1.0
            + n_conditions * 2.0
            + n_actions * 1.5
            + template_score * 3.0
        )

        # Always record — used by the complexity ranking table
        self.complexity_scores.append({
            "entity_id":  entity_id,
            "alias":      alias or entity_id,
            "score":      score,
            "triggers":   n_triggers,
            "conditions": n_conditions,
            "actions":    n_actions,
            "templates":  template_score,
        })

        if score < 30:
            return  # No issue — recorded above, but no alert needed

        severity = "medium" if score >= 50 else "low"
        label    = "god_automation" if score >= 50 else "complex_automation"

        self.issues.append({
            "entity_id":     entity_id,
            "alias":         alias,
            "automation_id": automation_id,
            "type":          label,
            "severity":      severity,
            "message":       t(label,
                               score=score,
                               triggers=n_triggers,
                               conditions=n_conditions,
                               actions=n_actions,
                               templates=template_score),
            "location":      "root",
            "recommendation": t(f"{label}_recommendation"),
            "fix_available": False,
            "complexity_detail": {
                "score":      score,
                "triggers":   n_triggers,
                "conditions": n_conditions,
                "actions":    n_actions,
                "templates":  template_score,
            },
        })

    def _analyze_trigger(
        self, entity_id: str, alias: str, automation_id: str, trigger: dict[str, Any], idx: int
    ) -> None:
        """Analyze a trigger."""
        platform = trigger.get("platform") or trigger.get("trigger", "")
        t = self._translator.t
        
        # Check for device_id in triggers (HIGH severity)
        if "device_id" in trigger:
            _LOGGER.debug("Found device_id in trigger %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_id_in_trigger",
                "severity": "high",
                "message": t("trigger_uses_device_id", idx=idx),
                "location": f"trigger[{idx}]",
                "recommendation": t("use_entity_id_instead_device"),
                "fix_available": True,
            })
        
        # Check aussi dans platform: device
        if platform == "device":
            _LOGGER.debug("Found device platform in trigger %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_trigger_platform",
                "severity": "high",
                "message": t("trigger_uses_device_platform", idx=idx),
                "location": f"trigger[{idx}]",
                "recommendation": t("use_state_platform"),
                "fix_available": True,
            })
        
        # Check for zone trigger without entity
        if platform == "zone" and not trigger.get("entity_id"):
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "zone_no_entity",
                "severity": "medium",
                "message": t("zone_trigger_missing_entity", idx=idx),
                "location": f"trigger[{idx}]",
                "recommendation": t("specify_zone_entity"),
                "fix_available": False,
            })

    def _analyze_condition(
        self, entity_id: str, alias: str, automation_id: str, condition: dict[str, Any], idx: int
    ) -> None:
        """Analyze a condition."""
        condition_type = condition.get("condition", "")
        t = self._translator.t
        
        # Check for device_id in conditions
        if "device_id" in condition:
            _LOGGER.debug("Found device_id in condition %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_id_in_condition",
                "severity": "high",
                "message": t("condition_uses_device_id", idx=idx),
                "location": f"condition[{idx}]",
                "recommendation": t("use_entity_id_instead_device"),
                "fix_available": True,
            })
        
        # Check for device condition platform
        if condition_type == "device":
            _LOGGER.debug("Found device condition in condition %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_condition_platform",
                "severity": "high",
                "message": t("condition_uses_device_platform", idx=idx),
                "location": f"condition[{idx}]",
                "recommendation": t("use_state_platform"),
                "fix_available": True,
            })
        
        # Check for template conditions that could be native
        if condition_type == "template":
            template = condition.get("value_template", "")
            
            if "is_state(" in template:
                has_complex_logic = any(op in template.lower() for op in [" and ", " or ", " not "])
                has_other_functions = any(f in template for f in [
                    "is_state_attr(", "states(", "state_attr(", "expand(",
                    "namespace(", "trigger.", "this."
                ])
                has_jinja_filter = " | " in template
                if not has_complex_logic and not has_other_functions and not has_jinja_filter:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "automation_id": automation_id,
                        "type": "template_simple_state",
                        "severity": "high",
                        "message": t("template_simple_state", idx=idx),
                        "location": f"condition[{idx}]",
                        "recommendation": t("use_state_condition"),
                        "fix_available": True,
                    })
            
            if re.search(r"(float|int)\s*[><]=?", template):
                self.issues.append({
                    "entity_id": entity_id,
                    "alias": alias,
                    "automation_id": automation_id,
                    "type": "template_numeric_comparison",
                    "severity": "high",
                    "message": t("template_numeric_comparison", idx=idx),
                    "location": f"condition[{idx}]",
                    "recommendation": t("use_numeric_state_condition"),
                    "fix_available": False,
                })
            
            if "now().hour" in template or "now().minute" in template:
                self.issues.append({
                    "entity_id": entity_id,
                    "alias": alias,
                    "automation_id": automation_id,
                    "type": "template_time_check",
                    "severity": "medium",
                    "message": t("template_time_check", idx=idx),
                    "location": f"condition[{idx}]",
                    "recommendation": t("use_time_condition"),
                    "fix_available": False,
                })

    def _analyze_action(
        self, entity_id: str, alias: str, automation_id: str, action: dict[str, Any], idx: int
    ) -> None:
        """Analyze an action."""
        t = self._translator.t
        
        # Check for device_id in actions
        if "device_id" in action:
            _LOGGER.debug("Found device_id in action %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_id_in_action",
                "severity": "high",
                "message": t("action_uses_device_id", idx=idx),
                "location": f"action[{idx}]",
                "recommendation": t("use_entity_id_in_target"),
                "fix_available": True,
            })
        
        # Check aussi dans target.device_id
        target = action.get("target", {})
        if isinstance(target, dict) and "device_id" in target:
            _LOGGER.debug("Found device_id in target of action %d of %s", idx, entity_id)
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "device_id_in_target",
                "severity": "high",
                "message": t("action_target_uses_device_id", idx=idx),
                "location": f"action[{idx}].target",
                "recommendation": t("use_entity_id_in_target"),
                "fix_available": True,
            })
        
        # Check for wait_template instead of wait_for_trigger
        if "wait_template" in action:
            template = action.get("wait_template", "")
            if "is_state(" in template:
                self.issues.append({
                    "entity_id": entity_id,
                    "alias": alias,
                    "automation_id": automation_id,
                    "type": "wait_template_vs_wait_for_trigger",
                    "severity": "medium",
                    "message": t("wait_template_state_check", idx=idx),
                    "location": f"action[{idx}]",
                    "recommendation": t("use_wait_for_trigger"),
                    "fix_available": False,
                })
        
        # Check for deprecated services
        service = action.get("service", action.get("action", ""))
        
        if service in ["homeassistant.turn_on", "homeassistant.turn_off", "homeassistant.toggle"]:
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "deprecated_service",
                "severity": "low",
                "message": t("generic_service", idx=idx, service=service),
                "location": f"action[{idx}]",
                "recommendation": t("use_domain_service", domain="light"),
                "fix_available": False,
            })

        # ── P0: Détection services/actions inexistants ──────────────────────
        if service and self._registered_services:
            self._check_unknown_service(entity_id, alias, automation_id, service, idx)

        # ── P0: Détection areas / floors / labels inexistants dans target ───
        target = action.get("target", {})
        if isinstance(target, dict):
            self._check_unknown_targets(entity_id, alias, automation_id, target, idx)

    # ── P0 helpers ────────────────────────────────────────────────────────────

    def _check_unknown_service(
        self, entity_id: str, alias: str, automation_id: str, service: str, idx: int
    ) -> None:
        """Detect calls to non-existent services/actions (P0)."""
        t = self._translator.t

        if "{{" in service or "{%" in service:
            return

        service = service.strip()
        if "." not in service:
            return

        if service in self._registered_services:
            return

        ALWAYS_VALID_PREFIXES = (
            "notify.",
            "tts.",
            "media_player.play_media",
        )
        if any(service.startswith(p) for p in ALWAYS_VALID_PREFIXES):
            return

        self.issues.append({
            "entity_id": entity_id,
            "alias": alias,
            "automation_id": automation_id,
            "type": "unknown_service",
            "severity": "high",
            "message": t("unknown_service", idx=idx, service=service),
            "location": f"action[{idx}]",
            "recommendation": t("use_existing_service", service=service),
            "fix_available": False,
            "service": service,
        })

    def _check_unknown_targets(
        self, entity_id: str, alias: str, automation_id: str, target: dict, idx: int
    ) -> None:
        """Detect target references to deleted areas / floors / labels (P0)."""
        t = self._translator.t

        area_refs = target.get("area_id", [])
        if isinstance(area_refs, str):
            area_refs = [area_refs]
        if isinstance(area_refs, list):
            for area_id in area_refs:
                if not area_id or "{{" in str(area_id):
                    continue
                if self._registered_area_ids and area_id not in self._registered_area_ids:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "automation_id": automation_id,
                        "type": "unknown_area_reference",
                        "severity": "high",
                        "message": t("unknown_area_reference", idx=idx, area_id=area_id),
                        "location": f"action[{idx}].target",
                        "recommendation": t("check_area_name", area_id=area_id),
                        "fix_available": False,
                        "area_id": area_id,
                    })

        floor_refs = target.get("floor_id", [])
        if isinstance(floor_refs, str):
            floor_refs = [floor_refs]
        if isinstance(floor_refs, list) and self._registered_floor_ids:
            for floor_id in floor_refs:
                if not floor_id or "{{" in str(floor_id):
                    continue
                if floor_id not in self._registered_floor_ids:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "automation_id": automation_id,
                        "type": "unknown_floor_reference",
                        "severity": "high",
                        "message": t("unknown_floor_reference", idx=idx, floor_id=floor_id),
                        "location": f"action[{idx}].target",
                        "recommendation": t("check_floor_name", floor_id=floor_id),
                        "fix_available": False,
                        "floor_id": floor_id,
                    })

        label_refs = target.get("label_id", [])
        if isinstance(label_refs, str):
            label_refs = [label_refs]
        if isinstance(label_refs, list) and self._registered_label_ids:
            for label_id in label_refs:
                if not label_id or "{{" in str(label_id):
                    continue
                if label_id not in self._registered_label_ids:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "automation_id": automation_id,
                        "type": "unknown_label_reference",
                        "severity": "high",
                        "message": t("unknown_label_reference", idx=idx, label_id=label_id),
                        "location": f"action[{idx}].target",
                        "recommendation": t("check_label_name", label_id=label_id),
                        "fix_available": False,
                        "label_id": label_id,
                    })

    # ── end P0 helpers ─────────────────────────────────────────────────────────

    def _analyze_mode(self, entity_id: str, alias: str, automation_id: str, config: dict[str, Any]) -> None:
        """Analyze automation mode."""
        t = self._translator.t
        
        mode = config.get("mode", "single")
        
        triggers = config.get("triggers") or config.get("trigger", [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
        
        actions = config.get("actions") or config.get("action", [])
        if not isinstance(actions, list):
            actions = [actions] if actions else []
        
        # Check for motion/occupancy triggers with delays in single mode
        has_motion_trigger = False
        for tr in triggers:
            if isinstance(tr, dict):
                entity_id_in_trigger = tr.get("entity_id", "")
                if isinstance(entity_id_in_trigger, str):
                    entity_lower = entity_id_in_trigger.lower()
                    if "motion" in entity_lower or "occupancy" in entity_lower:
                        has_motion_trigger = True
                        break
        
        # Check for delays or waits in actions
        has_delay_or_wait = False
        for a in actions:
            if isinstance(a, dict):
                if "delay" in a or "wait_template" in a or "wait_for_trigger" in a:
                    has_delay_or_wait = True
                    break
        
        if has_motion_trigger and has_delay_or_wait and mode == "single":
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "automation_id": automation_id,
                "type": "incorrect_mode_motion_single",
                "severity": "high",
                "message": t("motion_single_mode"),
                "location": "mode",
                "recommendation": t("use_restart_mode"),
                "fix_available": True,
            })

    async def _check_never_triggered(self) -> None:
        """Detect ghost automations: active but never/not triggered in GHOST_DAYS days.

        Three tiers
        -----------
        1. Active & never triggered at all          → never_triggered (LOW)
        2. Active & triggered but not in 90 days    → ghost_automation  (MEDIUM)
        3. Ghost + all trigger entities unavailable → ghost_automation  (HIGH — likely cause identified)
        """
        t = self._translator.t
        GHOST_DAYS = 90
        cutoff = datetime.now(timezone.utc) - timedelta(days=GHOST_DAYS)

        for entity_id in list(self.hass.states.async_entity_ids("automation")):
            state = self.hass.states.get(entity_id)
            if not state:
                continue

            # Skip ignored automations
            if self._is_ignored(entity_id):
                continue

            # Skip disabled automations
            if state.state == "off":
                continue

            alias         = state.attributes.get("friendly_name", entity_id)
            last_triggered = state.attributes.get("last_triggered")  # ISO str or None

            # ── Parse last_triggered timestamp ───────────────────────────────
            last_dt: datetime | None = None
            if last_triggered:
                try:
                    if isinstance(last_triggered, datetime):
                        last_dt = last_triggered
                        if last_dt.tzinfo is None:
                            last_dt = last_dt.replace(tzinfo=timezone.utc)
                    else:
                        # Accepts both "2024-01-15T12:00:00+00:00" and "2024-01-15T12:00:00"
                        ts = str(last_triggered).rstrip("Z")
                        if "+" not in ts and ts.count("-") < 3:
                            ts += "+00:00"
                        last_dt = datetime.fromisoformat(ts)
                except Exception:
                    last_dt = None

            # ── Tier 1: never triggered ───────────────────────────────────────
            if last_dt is None:
                self.issues.append({
                    "entity_id": entity_id,
                    "alias":     alias,
                    "type":      "never_triggered",
                    "severity":  "low",
                    "message":   t("never_triggered"),
                    "location":  "trigger",
                    "recommendation": t("verify_triggers"),
                    "fix_available": False,
                })
                continue

            # ── Tier 2 & 3: triggered, but not recently ───────────────────────
            if last_dt < cutoff:
                days_ago = (datetime.now(timezone.utc) - last_dt).days

                # Check if trigger entities are available
                unavail_triggers = self._get_unavailable_trigger_entities(
                    self._automation_configs.get(entity_id, {})
                )

                if unavail_triggers:
                    severity = "high"
                    cause    = t("ghost_unavailable_triggers",
                                 entities=", ".join(sorted(unavail_triggers)[:3]))
                    rec      = t("fix_unavailable_triggers")
                else:
                    severity = "medium"
                    cause    = t("ghost_automation", days=days_ago)
                    rec      = t("verify_triggers_restrictive")

                self.issues.append({
                    "entity_id":        entity_id,
                    "alias":            alias,
                    "type":             "ghost_automation",
                    "severity":         severity,
                    "message":          cause,
                    "location":         "trigger",
                    "recommendation":   rec,
                    "fix_available":    False,
                    "last_triggered_days_ago": days_ago,
                    "unavailable_triggers":    sorted(unavail_triggers),
                })

    def _get_unavailable_trigger_entities(self, config: dict) -> set[str]:
        """Return entity_ids referenced in triggers that are currently unavailable."""
        unavailable: set[str] = set()
        triggers = config.get("triggers") or config.get("trigger", [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
        for trigger in triggers:
            if not isinstance(trigger, dict):
                continue
            eid = trigger.get("entity_id")
            if isinstance(eid, str):
                eids = [eid]
            elif isinstance(eid, list):
                eids = eid
            else:
                continue
            for e in eids:
                s = self.hass.states.get(e)
                if s and s.state in ("unavailable", "unknown"):
                    unavailable.add(e)
        return unavailable

    def _check_duplicate_automations(self) -> None:
        """Detect duplicate and near-duplicate automations using two strategies.

        Strategy A — Exact fingerprint match (same triggers + same actions after
        stripping IDs/timestamps/aliases).  Severity: HIGH.

        Strategy B — Jaccard similarity ≥ 0.80 on token sets extracted from
        triggers + actions.  Severity: MEDIUM.  Only pairs not already flagged
        by Strategy A are considered.
        """
        t = self._translator.t

        # ── Build fingerprints and token-sets ────────────────────────────────
        exact_sig:    dict[str, list[str]] = {}  # sha1 → [entity_ids]
        token_sets:   dict[str, frozenset] = {}  # entity_id → frozenset of tokens
        entity_ids_list = list(self._automation_configs.keys())

        for entity_id, config in self._automation_configs.items():
            # Exact signature (normalised JSON hash)
            if self._is_ignored(entity_id):
                continue
            # Skip blueprint-based automations — they share the same structure
            # by design but serve different purposes (different inputs/cameras/devices)
            if config.get("use_blueprint"):
                continue
            triggers = config.get("triggers") or config.get("trigger", [])
            actions  = config.get("actions")  or config.get("action",  [])
            sig = self._exact_fingerprint(triggers, actions)
            exact_sig.setdefault(sig, []).append(entity_id)

            # Jaccard token set
            token_sets[entity_id] = self._jaccard_tokens(config)

        # ── Strategy A: exact duplicates ─────────────────────────────────────
        exact_flagged: set[str] = set()
        for sig, ids in exact_sig.items():
            if len(ids) < 2:
                continue
            for entity_id in ids:
                alias      = self._automation_configs[entity_id].get("alias", entity_id)
                other_ids  = [e for e in ids if e != entity_id]
                other_aliases = [
                    self._automation_configs[o].get("alias", o) for o in other_ids[:3]
                ]
                self.issues.append({
                    "entity_id":      entity_id,
                    "alias":          alias,
                    "type":           "duplicate_automation",
                    "severity":       "high",
                    "message":        t("duplicate_automation", count=len(ids) - 1),
                    "location":       "root",
                    "recommendation": t("remove_duplicate",
                                        others=", ".join(other_aliases)),
                    "fix_available":  False,
                    "duplicate_ids":  other_ids,
                })
                exact_flagged.add(entity_id)

        # ── Strategy B: probable duplicates via Jaccard ──────────────────────
        # Only compare pairs where neither is already an exact duplicate
        candidates = [e for e in entity_ids_list if e not in exact_flagged]
        probable_flagged: set[frozenset] = set()

        for i in range(len(candidates)):
            for j in range(i + 1, len(candidates)):
                a, b = candidates[i], candidates[j]
                pair = frozenset({a, b})
                if pair in probable_flagged:
                    continue

                set_a = token_sets.get(a, frozenset())
                set_b = token_sets.get(b, frozenset())
                if not set_a or not set_b:
                    continue

                # Jaccard = |A ∩ B| / |A ∪ B|
                intersection = len(set_a & set_b)
                union        = len(set_a | set_b)
                if union == 0:
                    continue
                similarity = intersection / union

                if similarity >= 0.80:
                    probable_flagged.add(pair)
                    pct = round(similarity * 100)
                    for entity_id, other_id in ((a, b), (b, a)):
                        alias       = self._automation_configs[entity_id].get("alias", entity_id)
                        other_alias = self._automation_configs[other_id].get("alias", other_id)
                        self.issues.append({
                            "entity_id":        entity_id,
                            "alias":            alias,
                            "type":             "probable_duplicate_automation",
                            "severity":         "medium",
                            "message":          t("probable_duplicate_automation",
                                                  pct=pct, other=other_alias),
                            "location":         "root",
                            "recommendation":   t("review_probable_duplicate",
                                                  other=other_alias),
                            "fix_available":    False,
                            "similarity_pct":   pct,
                            "similar_to":       other_id,
                        })

    # ── Fingerprint helpers ──────────────────────────────────────────────────

    def _exact_fingerprint(self, triggers: Any, actions: Any) -> str:
        """SHA-1 of normalized triggers+actions JSON (strips IDs, aliases, metadata)."""
        combined = {
            "triggers": self._strip_meta(triggers),
            "actions":  self._strip_meta(actions),
        }
        raw = json.dumps(combined, sort_keys=True, default=str, ensure_ascii=False)
        return hashlib.sha1(raw.encode()).hexdigest()

    def _strip_meta(self, obj: Any) -> Any:
        """Recursively remove keys that are instance-specific (IDs, aliases, descriptions)."""
        SKIP_KEYS = {"id", "alias", "description", "last_triggered", "mode",
                     "max", "max_exceeded", "variables", "trace_config"}
        if isinstance(obj, dict):
            return {k: self._strip_meta(v) for k, v in sorted(obj.items())
                    if k not in SKIP_KEYS}
        if isinstance(obj, list):
            return [self._strip_meta(i) for i in obj]
        return obj

    def _jaccard_tokens(self, config: dict) -> frozenset:
        """Extract a normalised token set from triggers + conditions + actions.

        Tokens are structural keywords (platforms, services, entity domains,
        action types) — NOT entity IDs or values, to allow cross-instance matching.
        """
        tokens: set[str] = set()

        def _walk(obj: Any, depth: int = 0) -> None:
            if depth > 8:
                return
            if isinstance(obj, dict):
                for key, val in obj.items():
                    if key in ("id", "alias", "description", "entity_id",
                               "device_id", "value_template", "message",
                               "data", "variables"):
                        continue
                    # Keep structural keys as tokens
                    tokens.add(f"k:{key}")
                    # Keep enum-style string values
                    if isinstance(val, str) and len(val) < 64:
                        if key in ("platform", "service", "action", "condition",
                                   "type", "domain", "state", "above", "below",
                                   "mode", "event_type"):
                            tokens.add(f"{key}:{val.lower()}")
                        # Keep entity domain (not the full ID)
                        if key == "entity_id" and isinstance(val, str) and "." in val:
                            tokens.add(f"domain:{val.split('.')[0]}")
                    elif isinstance(val, list) and key == "entity_id":
                        for e in val:
                            if isinstance(e, str) and "." in e:
                                tokens.add(f"domain:{e.split('.')[0]}")
                    _walk(val, depth + 1)
            elif isinstance(obj, list):
                for item in obj:
                    _walk(item, depth + 1)

        for section in ("triggers", "trigger", "conditions", "condition",
                        "actions", "action"):
            _walk(config.get(section, []))

        return frozenset(tokens)

    def _normalize_config(self, config: Any) -> str:
        """Normalize a config section for comparison (kept for compatibility)."""
        if not config:
            return ""
        if not isinstance(config, list):
            config = [config]

        def sort_keys(obj: Any) -> Any:
            if isinstance(obj, dict):
                return {k: sort_keys(v) for k, v in sorted(obj.items())}
            if isinstance(obj, list):
                return [sort_keys(item) for item in obj]
            return obj

        return json.dumps(sort_keys(config), sort_keys=True, default=str)

    def _check_excessive_delays(self) -> None:
        """Check for excessive delays in automations (more than 30 minutes)."""
        t = self._translator.t
        MAX_DELAY_MINUTES = 30
        
        for entity_id, config in self._automation_configs.items():
            if self._is_ignored(entity_id):
                continue
            alias = config.get("alias", entity_id)
            actions = config.get("actions") or config.get("action", [])

            if not isinstance(actions, list):
                actions = [actions] if actions else []

            for idx, action in enumerate(actions):
                if isinstance(action, dict) and "delay" in action:
                    delay = action["delay"]
                    delay_minutes = self._parse_delay_to_minutes(delay)
                    
                    if delay_minutes and delay_minutes > MAX_DELAY_MINUTES:
                        self.issues.append({
                            "entity_id": entity_id,
                            "alias": alias,
                            "type": "excessive_delay",
                            "severity": "medium",
                            "message": t("excessive_delay", minutes=int(delay_minutes), idx=idx),
                            "location": f"action[{idx}]",
                            "recommendation": t("use_input_number_delay"),
                            "fix_available": False,
                        })

    def _parse_delay_to_minutes(self, delay: Any) -> float | None:
        """Parse a delay value to minutes."""
        if delay is None:
            return None
        
        # If it's a number, assume seconds
        if isinstance(delay, (int, float)):
            return delay / 60
        
        # If it's a string like "00:30:00" (HH:MM:SS)
        if isinstance(delay, str):
            parts = delay.split(":")
            if len(parts) == 3:
                try:
                    hours, minutes, seconds = int(parts[0]), int(parts[1]), int(parts[2])
                    return hours * 60 + minutes + seconds / 60
                except ValueError:
                    pass
            elif len(parts) == 2:
                try:
                    minutes, seconds = int(parts[0]), int(parts[1])
                    return minutes + seconds / 60
                except ValueError:
                    pass
        
        # If it's a dict with hours/minutes/seconds
        if isinstance(delay, dict):
            hours = delay.get("hours", 0) or 0
            minutes = delay.get("minutes", 0) or 0
            seconds = delay.get("seconds", 0) or 0
            try:
                return float(hours) * 60 + float(minutes) + float(seconds) / 60
            except (ValueError, TypeError):
                pass
        
        return None

    async def _check_blueprint_issues(self) -> None:
        """Check for malformed or incomplete blueprint configurations."""
        t = self._translator.t
        config_dir = Path(self.hass.config.config_dir)

        for entity_id, config in self._automation_configs.items():
            # Respect haca_ignore label
            if self._is_ignored(entity_id):
                continue

            alias = config.get("alias", entity_id)

            # Check if automation uses a blueprint
            if "use_blueprint" in config:
                blueprint = config["use_blueprint"]
                blueprint_path = blueprint.get("path", "") if isinstance(blueprint, dict) else ""

                # Check for missing blueprint path
                if not blueprint_path:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "type": "blueprint_missing_path",
                        "severity": "high",
                        "message": t("blueprint_missing_path"),
                        "location": "use_blueprint",
                        "recommendation": t("specify_blueprint_path"),
                        "fix_available": False,
                    })
                    continue

                # Verify blueprint file exists on disk (via executor — non-blocking)
                blueprint_file = config_dir / "blueprints" / "automation" / blueprint_path
                _file_exists = await self.hass.async_add_executor_job(blueprint_file.exists)
                if not _file_exists:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "type": "blueprint_file_not_found",
                        "severity": "high",
                        "message": t("blueprint_file_not_found", path=blueprint_path),
                        "location": "use_blueprint",
                        "recommendation": t("reinstall_blueprint", path=blueprint_path),
                        "fix_available": False,
                    })
                    continue

                # ── Blueprint input validation ────────────────────────────────────────
                # Original strict logic: flag any null/"" input (medium).
                # Added: detect unknown entity_id in entity selectors (high),
                #        flag falsy values [] / False / 0 as low severity.
                # Blueprint YAML is read via executor to avoid blocking the event loop.

                inputs = blueprint.get("input", {}) if isinstance(blueprint, dict) else {}

                # Load blueprint definition: resolve nested input groups + detect selectors.
                # Blueprints use nested groups: blueprint.input.<group>.input.<leaf>
                # use_blueprint.input is always flat (just leaf key names).
                # We use a permissive loader that ignores !input tags.
                _required_inputs: set = set()   # leaf inputs with NO default declared
                _entity_inputs: set = set()     # leaf inputs with entity/target selector

                def _collect_bp_inputs(d, out_required, out_entity):
                    for k, v in (d or {}).items():
                        if not isinstance(v, dict):
                            continue
                        if "input" in v:
                            # input group — recurse into sub-inputs
                            _collect_bp_inputs(v["input"], out_required, out_entity)
                        else:
                            # leaf input
                            if "default" not in v:
                                out_required.add(k)
                            sel = v.get("selector") or {}
                            if isinstance(sel, dict) and ("entity" in sel or "target" in sel):
                                out_entity.add(k)

                try:
                    import yaml as _yaml

                    class _AnyTagLoader(_yaml.SafeLoader):
                        pass
                    _AnyTagLoader.add_multi_constructor(
                        "!", lambda ldr, tag, node: ldr.construct_scalar(node)
                    )

                    _raw = await self.hass.async_add_executor_job(
                        lambda: blueprint_file.read_text(encoding="utf-8")
                    )
                    _bp_def = _yaml.load(_raw, Loader=_AnyTagLoader) or {}
                    _bp_inputs_def = _bp_def.get("blueprint", {}).get("input", {})
                    if isinstance(_bp_inputs_def, dict):
                        _collect_bp_inputs(_bp_inputs_def, _required_inputs, _entity_inputs)
                except Exception:
                    pass  # unreadable — entity/required checks skipped

                if not inputs:
                    self.issues.append({
                        "entity_id": entity_id,
                        "alias": alias,
                        "type": "blueprint_no_inputs",
                        "severity": "medium",
                        "message": t("blueprint_no_inputs", path=blueprint_path),
                        "location": "use_blueprint",
                        "recommendation": t("configure_blueprint_inputs"),
                        "fix_available": False,
                    })
                else:
                    for input_key, input_value in inputs.items():
                        is_required = input_key in _required_inputs
                        is_entity   = input_key in _entity_inputs

                        # HIGH — required input is null / empty string
                        if is_required and (input_value is None or input_value == ""):
                            self.issues.append({
                                "entity_id": entity_id,
                                "alias": alias,
                                "type": "blueprint_empty_input",
                                "severity": "high",
                                "message": t("blueprint_empty_input", key=input_key),
                                "location": f"use_blueprint.input.{input_key}",
                                "recommendation": t("set_blueprint_input", key=input_key),
                                "fix_available": False,
                            })

                        # MEDIUM — optional entity/target input references an unknown entity
                        elif is_entity and not is_required:
                            _to_check = input_value if isinstance(input_value, list) else [input_value]
                            for _eid in _to_check:
                                if isinstance(_eid, str) and _eid and self.hass.states.get(_eid) is None:
                                    self.issues.append({
                                        "entity_id": entity_id,
                                        "alias": alias,
                                        "type": "blueprint_empty_input",
                                        "severity": "medium",
                                        "message": f"Blueprint input '{input_key}' references unknown entity: {_eid}",
                                        "location": f"use_blueprint.input.{input_key}",
                                        "recommendation": f"Update blueprint input '{input_key}' with a valid entity",
                                        "fix_available": False,
                                    })
                            # Also flag if the entity input itself is empty (no entity configured)
                            if not _to_check or all(not isinstance(e, str) or not e for e in _to_check):
                                self.issues.append({
                                    "entity_id": entity_id,
                                    "alias": alias,
                                    "type": "blueprint_empty_input",
                                    "severity": "low",
                                    "message": f"Blueprint input '{input_key}' has no entity configured",
                                    "location": f"use_blueprint.input.{input_key}",
                                    "recommendation": f"Verify that leaving '{input_key}' empty is intentional",
                                    "fix_available": False,
                                })

                        # LOW — falsy value ([], False, 0, "") on a non-required, non-entity input
                        elif not is_required and (
                            input_value == [] or input_value is False
                            or input_value == 0 or input_value == ""
                        ):
                            self.issues.append({
                                "entity_id": entity_id,
                                "alias": alias,
                                "type": "blueprint_empty_input",
                                "severity": "low",
                                "message": f"Blueprint input '{input_key}' has an empty or disabled value",
                                "location": f"use_blueprint.input.{input_key}",
                                "recommendation": f"Verify that leaving '{input_key}' empty/disabled is intentional",
                                "fix_available": False,
                            })

    def get_issue_summary(self) -> dict[str, Any]:
        """Get a summary of issues."""
        summary = {
            "total": len(self.issues),
            "by_severity": {"high": 0, "medium": 0, "low": 0},
            "by_type": {},
            "automations_analyzed": len(self._automation_configs),
            "blueprint_issues": len(self.blueprint_issues),
        }
        
        for issue in self.issues:
            severity = issue.get("severity", "low")
            issue_type = issue.get("type", "unknown")
            
            summary["by_severity"][severity] = summary["by_severity"].get(severity, 0) + 1
            summary["by_type"][issue_type] = summary["by_type"].get(issue_type, 0) + 1
        
        return summary
