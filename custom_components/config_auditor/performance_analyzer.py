"""Performance analyzer for H.A.C.A - Module 3."""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
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
        
        automation_configs = automation_configs or {}
        
        automations = self.hass.states.async_all("automation")
        
        for idx, state in enumerate(automations):
            entity_id = state.entity_id
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

        _LOGGER.info("Performance analysis complete: %d issues found, analyzed %d states", 
                     len(self.issues), len(automations))
        return self.issues

    async def _analyze_trigger_rate(self, state: Any, alias: str) -> None:
        """Analyze the trigger rate for a specific automation.
        
        Uses constants from const.py:
        - VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR: triggers/hour above which the
          automation is flagged as very high frequency (potential loop).
        - HIGH_FREQUENCY_TRIGGERS_PER_HOUR: triggers/hour for a high frequency warning.
        
        Converts to interval in seconds:
          very_high → 3600 / VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR seconds
          high      → 3600 / HIGH_FREQUENCY_TRIGGERS_PER_HOUR seconds
        """
        last_triggered = state.attributes.get("last_triggered")
        t = self._translator.t

        # Convert per-hour thresholds to minimum interval in seconds
        very_high_interval = 3600.0 / VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR  # e.g. 36s for 100/h
        high_interval = 3600.0 / HIGH_FREQUENCY_TRIGGERS_PER_HOUR             # e.g. 72s for 50/h

        if last_triggered:
            try:
                # Handle both aware and naive datetimes
                now = datetime.now(last_triggered.tzinfo)
                delta = (now - last_triggered).total_seconds()

                if delta < very_high_interval:
                    # Triggered more frequently than VERY_HIGH_FREQUENCY_TRIGGERS_PER_HOUR
                    self.issues.append({
                        "entity_id": state.entity_id,
                        "alias": alias,
                        "type": ISSUE_VERY_HIGH_FREQUENCY,
                        "severity": "high",
                        "message": t("triggered_recently_loop", delta=f"{delta:.1f}"),
                        "location": "trigger",
                        "recommendation": t("verify_triggers"),
                        "fix_available": False,
                    })
                elif delta < high_interval:
                    # Triggered more frequently than HIGH_FREQUENCY_TRIGGERS_PER_HOUR
                    self.issues.append({
                        "entity_id": state.entity_id,
                        "alias": alias,
                        "type": ISSUE_HIGH_FREQUENCY,
                        "severity": "medium",
                        "message": t("triggered_recently_loop", delta=f"{delta:.1f}"),
                        "location": "trigger",
                        "recommendation": t("verify_triggers"),
                        "fix_available": False,
                    })
            except Exception as e:
                _LOGGER.warning("Error checking trigger rate for %s: %s", alias, e)

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
        
        all_states = self.hass.states.async_all()
        for state in all_states:
            if state.domain == "automation" or state.entity_id.startswith("sensor.h_a_c_a_"):
                continue
                
            if state.domain == "sensor":
                # Missing state_class for frequent sensors
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

    def get_issue_summary(self) -> dict[str, Any]:
        """Get a summary of performance issues."""
        return {
            "total": len(self.issues),
            "loops": len([i for i in self.issues if "loop" in i.get("type", "")]),
            "database": len([i for i in self.issues if "state_class" in i.get("type", "")]),
            "complexity": len([i for i in self.issues if "complexity" in i.get("type", "")]),
            "expensive_templates": len([i for i in self.issues if "expensive_template" in i.get("type", "")]),
        }
