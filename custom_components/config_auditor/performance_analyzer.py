"""Performance analyzer for H.A.C.A - Module 3."""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from .const import (
    ISSUE_HIGH_FREQUENCY,
    ISSUE_VERY_HIGH_FREQUENCY,
    ISSUE_BURST_PATTERN,
    HIGH_FREQUENCY_TRIGGERS_PER_HOUR,
    VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR,
    BURST_TRIGGERS_IN_MINUTES,
    BURST_WINDOW_MINUTES,
)
from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)

class PerformanceAnalyzer:
    """Analyze automation performance and trigger patterns."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the performance analyzer."""
        self.hass = hass
        self.issues: list[dict[str, Any]] = []
        self._translator = TranslationHelper(hass)
        _LOGGER.debug("PerformanceAnalyzer initialized")

    async def analyze_all(self, automation_configs: dict[str, dict[str, Any]] = None) -> list[dict[str, Any]]:
        """Analyze performance of all automations."""
        self.issues = []
        
        # Load language for translations
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)

        # Load haca_ignore label (entity + device level)
        from .translation_utils import async_get_haca_ignored_entity_ids
        _ignored = await async_get_haca_ignored_entity_ids(self.hass)
        
        automation_configs = automation_configs or {}
        
        automations = self.hass.states.async_all("automation")
        
        for idx, state in enumerate(automations):
            entity_id = state.entity_id
            if entity_id in _ignored:
                continue
            alias = state.attributes.get("friendly_name", entity_id)
            
            # Check for high frequency based on last_triggered
            await self._analyze_trigger_rate(state, alias)
            
            # Check complexity if config is available
            config = automation_configs.get(entity_id)
            
            # Fallback: try to match by friendly_name/alias if entity_id mismatch
            if not config:
                for cfg_id, cfg in automation_configs.items():
                    if cfg.get("alias") == alias:
                        config = cfg
                        break
            
            if config:
                self._analyze_complexity(entity_id, alias, config)
                self._detect_potential_loops(entity_id, alias, config)
            else:
                _LOGGER.debug("No config found for %s, skipping complexity check", entity_id)

        # 2. Analyze Noisy Entities (Database Impact)
        await self._detect_noisy_entities()

        # 3. Detect expensive template patterns in automation configs
        if automation_configs:
            await self._detect_expensive_templates(automation_configs)

        # 4. v1.2.0 — Analyze template sensor/binary_sensor entities
        await self._analyze_template_entities()

        _LOGGER.info("Performance analysis complete: %d issues found, analyzed %d states", 
                     len(self.issues), len(automations))
        return self.issues

    async def _analyze_trigger_rate(self, state: Any, alias: str) -> None:
        """Trigger rate analysis placeholder.
        
        Previously checked if last_triggered was recent and flagged it as
        "high frequency / possible loop". This was flawed: a single timestamp
        snapshot doesn't measure frequency. An automation triggered 16 seconds
        ago simply means it ran recently — that's normal.
        
        Real frequency detection would require counting triggers over a period
        via the recorder history, which is expensive. The structural loop
        detection in _detect_potential_loops is the correct approach for
        identifying automations that risk looping.
        
        This method is kept as a no-op for forward compatibility.
        """
        pass

    def _analyze_complexity(self, entity_id: str, alias: str, config: dict[str, Any]) -> None:
        """Analyze automation complexity."""
        t = self._translator.t
        
        triggers = config.get("trigger", [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
            
        actions = config.get("action", [])
        if not isinstance(actions, list):
            actions = [actions] if actions else []
            
        # Complexity check: Too many actions (lowered threshold)
        if len(actions) > 10:
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "type": "high_complexity_actions",
                "severity": "medium",
                "message": t("complex_automation", count=len(actions)),
                "location": "root",
                "recommendation": t("verify_triggers"),
                "fix_available": False,
            })
            
        # Parallel mode with high max (lowered threshold)
        mode = config.get("mode", "single")
        if mode == "parallel":
            max_runs = config.get("max", 10)
            if max_runs > 5:
                 self.issues.append({
                    "entity_id": entity_id,
                    "alias": alias,
                    "type": "high_parallel_max",
                    "severity": "medium",
                    "message": t("parallel_mode_resources", max_runs=max_runs),
                    "location": "mode",
                    "recommendation": t("verify_triggers"),
                    "fix_available": False,
                })

    def _detect_potential_loops(self, entity_id: str, alias: str, config: dict[str, Any]) -> None:
        """Detect if an automation might trigger itself in a loop."""
        # Blueprint automations have their own loop-prevention logic
        # (cooldowns, state checks, mutex) that static analysis cannot
        # introspect — flagging them produces systematic false positives.
        if config.get("use_blueprint"):
            return

        t = self._translator.t
        
        triggers = config.get("trigger", [])
        if not isinstance(triggers, list): triggers = [triggers]
        
        actions = config.get("action", [])
        if not isinstance(actions, list): actions = [actions]

        # Entities in triggers
        trigger_entities = set()
        for tr in triggers:
            if isinstance(tr, dict):
                ent = tr.get("entity_id")
                if isinstance(ent, list): trigger_entities.update(ent)
                elif isinstance(ent, str): trigger_entities.add(ent)

        # Entities in actions
        action_entities = set()
        for a in actions:
            if isinstance(a, dict):
                data = a.get("data", {})
                ent = a.get("entity_id") or data.get("entity_id")
                if isinstance(ent, list): action_entities.update(ent)
                elif isinstance(ent, str): action_entities.add(ent)

        # Potential self-loop
        intersection = trigger_entities.intersection(action_entities)
        if intersection:
            self.issues.append({
                "entity_id": entity_id,
                "alias": alias,
                "type": "potential_self_loop",
                "severity": "medium",
                "message": t("triggers_modifies_same", entities=', '.join(intersection)),
                "location": "logic",
                "recommendation": t("verify_triggers"),
                "fix_available": False,
            })

    async def _detect_noisy_entities(self) -> None:
        """Detect entities with high update frequency or missing optimizations."""
        t = self._translator.t

        # Only flag template-platform sensors (user-fixable).
        # Integration-created sensors are not under user control.
        try:
            entity_reg = er.async_get(self.hass)
        except Exception:
            entity_reg = None

        template_sensor_ids: set[str] = set()
        if entity_reg:
            for entry in entity_reg.entities.values():
                if entry.platform == "template" and entry.domain == "sensor":
                    template_sensor_ids.add(entry.entity_id)

        all_states = self.hass.states.async_all()
        for state in all_states:
            if state.domain == "automation" or state.entity_id.startswith("sensor.h_a_c_a_"):
                continue
                
            if state.domain == "sensor":
                # Missing state_class for power/energy template sensors only
                if state.entity_id in template_sensor_ids:
                    if any(k in state.entity_id for k in ["power", "energy", "voltage", "current"]):
                        if "state_class" not in state.attributes:
                            self.issues.append({
                                "entity_id": state.entity_id,
                                "type": "missing_state_class",
                                "severity": "low",
                                "message": t("missing_state_class"),
                                "recommendation": t("verify_triggers"),
                                "fix_available": False,
                            })

        # ── Noisy entity detection via Recorder DB ────────────────────────
        await self._detect_noisy_entities_from_db()

    async def _detect_noisy_entities_from_db(self) -> None:
        """Query the recorder DB to find entities with excessive state changes."""
        t = self._translator.t

        try:
            from homeassistant.helpers.recorder import get_instance
        except ImportError:
            _LOGGER.debug("Recorder helper not available, skipping noisy detection")
            return

        try:
            instance = get_instance(self.hass)
            if not instance or not hasattr(instance, "engine") or not instance.engine:
                return
        except Exception:
            return

        # Domains where high update frequency is expected and not actionable
        _NOISY_SKIP_DOMAINS = frozenset({
            "automation", "script", "scene", "zone", "person",
            "sun", "weather", "input_boolean", "input_number",
            "input_select", "input_text", "input_datetime",
            "input_button", "counter", "timer", "button", "event",
            "persistent_notification", "conversation", "tts", "stt",
            "update", "calendar", "notify",
        })

        THRESHOLD_HIGH = 500      # >500 changes/day = high severity
        THRESHOLD_MEDIUM = 200    # >200 changes/day = medium severity

        def _query_noisy(inst):
            """Synchronous DB query for state change frequency (last 24h)."""
            from sqlalchemy import text
            import time

            cutoff_ts = time.time() - 86400  # 24h ago
            noisy: list[tuple[str, int]] = []

            try:
                with inst.engine.connect() as conn:
                    try:
                        conn.execute(text("BEGIN IMMEDIATE"))
                    except Exception:
                        pass

                    try:
                        # Modern schema (HA >= 2023.3): states_meta
                        rows = conn.execute(text(
                            "SELECT sm.entity_id, COUNT(*) AS cnt "
                            "FROM states s "
                            "JOIN states_meta sm ON s.metadata_id = sm.metadata_id "
                            "WHERE s.last_updated_ts > :cutoff "
                            "GROUP BY sm.entity_id "
                            "HAVING cnt > :threshold "
                            "ORDER BY cnt DESC "
                            "LIMIT 50"
                        ), {"cutoff": cutoff_ts, "threshold": THRESHOLD_MEDIUM}).fetchall()
                        noisy = [(row[0], int(row[1])) for row in rows]
                    except Exception:
                        try:
                            # Legacy schema: entity_id directly in states
                            rows = conn.execute(text(
                                "SELECT entity_id, COUNT(*) AS cnt "
                                "FROM states "
                                "WHERE last_updated_ts > :cutoff "
                                "GROUP BY entity_id "
                                "HAVING cnt > :threshold "
                                "ORDER BY cnt DESC "
                                "LIMIT 50"
                            ), {"cutoff": cutoff_ts, "threshold": THRESHOLD_MEDIUM}).fetchall()
                            noisy = [(row[0], int(row[1])) for row in rows]
                        except Exception as exc2:
                            _LOGGER.debug("Noisy entity query failed (legacy): %s", exc2)

                    try:
                        conn.execute(text("ROLLBACK"))
                    except Exception:
                        pass

            except Exception as exc:
                _LOGGER.debug("Noisy entity DB connection error: %s", exc)

            return noisy

        try:
            noisy_results = await self.hass.async_add_executor_job(_query_noisy, instance)
        except Exception as exc:
            _LOGGER.debug("Noisy entity detection error: %s", exc)
            return

        for entity_id, count in noisy_results:
            domain = entity_id.split(".")[0]
            if domain in _NOISY_SKIP_DOMAINS:
                continue
            if entity_id.startswith("sensor.h_a_c_a_"):
                continue

            if count >= THRESHOLD_HIGH:
                severity = "medium"
            else:
                severity = "low"

            self.issues.append({
                "entity_id": entity_id,
                "type": "noisy_entity",
                "severity": severity,
                "message": t("noisy_entity", count=count),
                "recommendation": t("noisy_entity_recommendation"),
                "fix_available": False,
            })

    async def _detect_expensive_templates(self, automation_configs: dict[str, dict[str, Any]]) -> None:
        """Detect automation templates that re-evaluate on every single state change.
        
        Patterns flagged:
        - ``states | selectattr(...)`` without a domain filter → iterates ALL entities
        - ``states | list`` or ``states('all')`` → enumerates every entity state
        """
        t = self._translator.t
        
        for idx, (entity_id, config) in enumerate(automation_configs.items()):
            alias = config.get("alias", entity_id)
            templates = self._extract_templates_recursively(config)
            flagged: set[str] = set()  # Avoid duplicate issues per automation
            
            for template in templates:
                # Pattern 1: states | selectattr without domain filter
                if re.search(r"\bstates\s*\|\s*selectattr", template):
                    if not re.search(r"domain\s*[=!]=\s*['\"]", template):
                        if "expensive_selectattr" not in flagged:
                            flagged.add("expensive_selectattr")
                            self.issues.append({
                                "entity_id": entity_id,
                                "alias": alias,
                                "type": "expensive_template_selectattr",
                                "severity": "high",
                                "message": t("expensive_template_no_domain"),
                                "location": "template",
                                "recommendation": t("add_domain_filter"),
                                "fix_available": False,
                            })
                
                # Pattern 2: states | list  or  states('all')  or  states("all")
                if (
                    re.search(r"\bstates\s*\|\s*list\b", template)
                    or "states('all')" in template
                    or 'states("all")' in template
                ):
                    if "expensive_states_all" not in flagged:
                        flagged.add("expensive_states_all")
                        self.issues.append({
                            "entity_id": entity_id,
                            "alias": alias,
                            "type": "expensive_template_states_all",
                            "severity": "high",
                            "message": t("expensive_template_states_all"),
                            "location": "template",
                            "recommendation": t("filter_by_domain"),
                            "fix_available": False,
                        })
            
            if idx % 10 == 0:
                await asyncio.sleep(0)

    def _extract_templates_recursively(self, config: Any) -> list[str]:
        """Recursively extract all Jinja2 template strings from a config dict/list."""
        templates: list[str] = []
        if isinstance(config, str):
            if "{{" in config or "{%" in config:
                templates.append(config)
        elif isinstance(config, dict):
            for v in config.values():
                templates.extend(self._extract_templates_recursively(v))
        elif isinstance(config, list):
            for item in config:
                templates.extend(self._extract_templates_recursively(item))
        return templates

    async def _analyze_template_entities(self) -> None:
        """v1.2.0 — Detect issues in template sensor and binary_sensor entities.
        
        Detections:
        - states('x') without is_state() — no unavailable handling
        - now() without a time_pattern trigger — constant recomputation
        - Template sensor without device_class or unit_of_measurement
        - Templates that reference each other (cycle detection)
        - availability: missing when template references potentially unavailable entities
        """
        import re as _re
        t = self._translator.t

        # Load template platform configs from .storage/core.config_entries is fragile.
        # Instead we inspect the HA state machine for entities created by the template platform.
        all_states = self.hass.states.async_all()

        # We detect template entities by platform via entity registry
        try:
            entity_reg = er.async_get(self.hass)
        except Exception:
            return

        template_entity_ids: set[str] = set()
        for entry in entity_reg.entities.values():
            if entry.platform == "template" and entry.domain in ("sensor", "binary_sensor"):
                template_entity_ids.add(entry.entity_id)

        if not template_entity_ids:
            return

        # Also try to read template config from configuration.yaml / packages
        # For now we rely on state attributes which expose the template string sometimes
        # The key info we can get from states:
        # - state_class, device_class, unit_of_measurement  → attributes
        # - The template string itself is NOT in state attrs for security reasons
        # We can still do meaningful checks on the attribute metadata.

        # For template string analysis, we try to load template platform YAML if available
        config_dir_path = None
        try:
            from pathlib import Path as _Path
            import yaml as _yaml
            config_dir_path = _Path(self.hass.config.config_dir)
        except Exception:
            pass

        # Build a map of template configs from YAML sources
        template_configs: dict[str, dict] = {}
        if config_dir_path:
            def _load_template_yaml(cfg_dir):
                """Load template: platform entries from configuration.yaml and packages."""
                results = {}
                # configuration.yaml
                cfg_yaml = cfg_dir / "configuration.yaml"
                if cfg_yaml.exists():
                    try:
                        with open(cfg_yaml, "r", encoding="utf-8") as f:
                            content = _yaml.safe_load(f)
                        if isinstance(content, dict):
                            for section in ("sensor", "binary_sensor"):
                                items = content.get(section, [])
                                if isinstance(items, dict):
                                    items = [items]
                                for item in (items if isinstance(items, list) else []):
                                    if isinstance(item, dict) and item.get("platform") == "template":
                                        for tpl in item.get("sensors", {}).values():
                                            if isinstance(tpl, dict):
                                                uid = tpl.get("unique_id", tpl.get("friendly_name", ""))
                                                results[f"template_cfg_{uid}"] = tpl
                    except Exception:
                        pass
                # packages/
                pkgs = cfg_dir / "packages"
                if pkgs.is_dir():
                    for yf in sorted(pkgs.rglob("*.yaml")):
                        try:
                            with open(yf, "r", encoding="utf-8") as f:
                                content = _yaml.safe_load(f)
                            if not isinstance(content, dict):
                                continue
                            for section in ("sensor", "binary_sensor"):
                                items = content.get(section, [])
                                if isinstance(items, dict):
                                    items = [items]
                                for item in (items if isinstance(items, list) else []):
                                    if isinstance(item, dict) and item.get("platform") == "template":
                                        for tpl in item.get("sensors", {}).values():
                                            if isinstance(tpl, dict):
                                                uid = tpl.get("unique_id", tpl.get("friendly_name", ""))
                                                results[f"template_cfg_{uid}"] = tpl
                        except Exception:
                            pass
                return results

            try:
                template_configs = await self.hass.async_add_executor_job(
                    _load_template_yaml, config_dir_path
                )
            except Exception as e:
                _LOGGER.debug("Template YAML load error: %s", e)

        # ── Collect all template strings we can analyse ────────────────────
        # For each template entity, gather template strings from YAML configs
        template_strings: dict[str, list[str]] = {}  # entity_id -> [template strings]
        for eid, cfg in template_configs.items():
            strings = []
            for k in ("value_template", "availability_template", "attribute_templates"):
                val = cfg.get(k)
                if isinstance(val, str):
                    strings.append(val)
                elif isinstance(val, dict):
                    strings.extend(v for v in val.values() if isinstance(v, str))
            template_strings[eid] = strings

        # ── Per-entity checks ──────────────────────────────────────────────
        checked = 0
        for state in all_states:
            entity_id = state.entity_id
            if entity_id not in template_entity_ids:
                continue

            attrs = state.attributes or {}
            domain = entity_id.split(".")[0]

            # 1. Missing metadata (device_class / unit_of_measurement for sensors)
            if domain == "sensor":
                device_class = attrs.get("device_class")
                unit = attrs.get("unit_of_measurement")
                if not device_class and not unit:
                    # Skip pure counters/integers — they don't need device_class or unit
                    state_val = state.state
                    name_lower = entity_id.lower()
                    _counter_patterns = (
                        "count", "total", "number", "nb_", "num_",
                        "active_", "pending_", "failed_", "running_",
                    )
                    is_counter = any(p in name_lower for p in _counter_patterns)
                    is_integer = False
                    try:
                        is_integer = state_val not in ("unknown", "unavailable") and float(state_val) == int(float(state_val))
                    except (ValueError, TypeError, OverflowError):
                        pass
                    if is_counter and is_integer:
                        pass  # legitimate counter, no metadata needed
                    else:
                        self.issues.append({
                            "entity_id": entity_id,
                            "type": "template_sensor_no_metadata",
                            "severity": "low",
                            "message": t("template_sensor_no_metadata", entity_id=entity_id),
                            "recommendation": t("template_sensor_add_metadata"),
                        })

            checked += 1
            if checked % 20 == 0:
                await asyncio.sleep(0)

        # ── Template-string-level checks (only if we got YAML configs) ────
        all_value_templates: dict[str, str] = {}  # entity_id/cfg_key -> value_template
        for cfg_key, cfg in template_configs.items():
            vt = cfg.get("value_template", "")
            if vt:
                all_value_templates[cfg_key] = vt

        for cfg_key, cfg in template_configs.items():
            value_template = cfg.get("value_template", "")
            availability = cfg.get("availability_template") or cfg.get("availability")
            triggers_raw = cfg.get("triggers") or cfg.get("trigger", [])
            if isinstance(triggers_raw, dict):
                triggers_raw = [triggers_raw]

            trigger_platforms = {
                tr.get("platform", "") for tr in (triggers_raw if isinstance(triggers_raw, list) else [])
                if isinstance(tr, dict)
            }

            if not value_template:
                continue

            # 2. states() without is_state() → no unavailable guard
            states_calls = _re.findall(r"states\(['\"]([^'\"]+)['\"]\)", value_template)
            is_state_calls = _re.findall(r"is_state\(['\"]([^'\"]+)['\"]\)", value_template)
            unguarded = [e for e in states_calls if e not in is_state_calls]
            if unguarded and not availability:
                self.issues.append({
                    "entity_id": cfg_key,
                    "type": "template_no_unavailable_check",
                    "severity": "medium",
                    "message": t("template_no_unavailable_check", entities=", ".join(unguarded[:3])),
                    "recommendation": t("template_add_unavailable_check"),
                })

            # 3. now() without time_pattern trigger
            if "now()" in value_template and "time_pattern" not in trigger_platforms:
                self.issues.append({
                    "entity_id": cfg_key,
                    "type": "template_now_without_trigger",
                    "severity": "medium",
                    "message": t("template_now_without_trigger"),
                    "recommendation": t("template_add_time_pattern_trigger"),
                })

            # 4. Missing availability when entities may be unavailable
            all_referenced = set(states_calls)
            if all_referenced and not availability:
                self.issues.append({
                    "entity_id": cfg_key,
                    "type": "template_missing_availability",
                    "severity": "low",
                    "message": t("template_missing_availability", count=len(all_referenced)),
                    "recommendation": t("template_add_availability"),
                })

        # 5. Cycle detection — template A references B which references A
        # Build reference graph from value_template strings
        ref_graph: dict[str, set[str]] = {}
        for cfg_key, vt in all_value_templates.items():
            refs = set(_re.findall(r"states\(['\"]([^'\"]+)['\"]\)", vt))
            refs |= set(_re.findall(r"is_state\(['\"]([^'\"]+)['\"]\)", vt))
            ref_graph[cfg_key] = refs

        # Simple cycle detection using DFS
        def _has_cycle(node: str, visited: set, rec_stack: set) -> bool:
            visited.add(node)
            rec_stack.add(node)
            for neighbor in ref_graph.get(node, set()):
                if neighbor not in visited:
                    if _has_cycle(neighbor, visited, rec_stack):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.discard(node)
            return False

        visited_global: set[str] = set()
        for node in list(ref_graph.keys()):
            if node not in visited_global:
                if _has_cycle(node, visited_global, set()):
                    self.issues.append({
                        "entity_id": node,
                        "type": "template_sensor_cycle",
                        "severity": "high",
                        "message": t("template_sensor_cycle", entity_id=node),
                        "recommendation": t("template_break_cycle"),
                    })

    def get_issue_summary(self) -> dict[str, Any]:
        """Get a summary of performance issues."""
        return {
            "total": len(self.issues),
            "loops": len([i for i in self.issues if "loop" in i.get("type", "")]),
            "database": len([i for i in self.issues if "state_class" in i.get("type", "")]),
            "complexity": len([i for i in self.issues if "complexity" in i.get("type", "")]),
            "expensive_templates": len([i for i in self.issues if "expensive_template" in i.get("type", "")]),
        }
