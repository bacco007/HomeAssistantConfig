import asyncio
from collections import defaultdict
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    entity_registry as er,
    device_registry as dr,
    area_registry as ar,
)

from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)


class EntityAnalyzer:
    """Analyze entities for issues."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the analyzer."""
        self.hass = hass
        self.issues: list[dict[str, Any]] = []
        self._entity_references: dict[str, list[str]] = defaultdict(list)
        # Maps automation/script entity_id → human-readable alias
        self._automation_alias_map: dict[str, str] = {}
        self._translator = TranslationHelper(hass)

    @property
    def entity_references(self) -> dict[str, list[str]]:
        """Public view of entity → referencing automation map."""
        return dict(self._entity_references)

    @property
    def automation_alias_map(self) -> dict[str, str]:
        """Public view of automation_id → friendly alias map."""
        return dict(self._automation_alias_map)

    async def analyze_all(
        self,
        automation_configs: dict[str, dict] = None,
        script_configs: dict[str, dict] = None,
    ) -> list[dict[str, Any]]:
        """Analyze all entities."""
        self.issues = []
        
        # Load language for translations
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)
        
        # Build entity reference map (automations + scripts)
        if automation_configs or script_configs:
            await self._build_entity_references(automation_configs or {}, script_configs or {})
        
        # Analyze entity states
        await self._analyze_entity_states()
        
        # Load ignored entities (haca_ignore label)
        self._ignored_entity_ids = await self._load_ignored_entity_ids()

        # Analyze zombie entities
        await self._analyze_zombie_entities()
        
        # Analyze entity registry
        await self._analyze_entity_registry()
        
        # Analyze ghost registry entries (Spook inspired)
        await self._analyze_ghost_registry_entries()
        
        # Analyze broken device references
        await self._analyze_device_integrity(automation_configs)
        
        # Analyze unused input_booleans
        await self._analyze_unused_input_booleans()
        
        _LOGGER.info("Entity analysis complete: %d issues found", len(self.issues))
        
        return self.issues

    async def _build_entity_references(
        self,
        automation_configs: dict[str, dict],
        script_configs: dict[str, dict] = None,
    ) -> None:
        """Build a map of which automations AND scripts reference which entities.
        
        Supports both legacy (trigger/condition/action) and new HA UI format
        (triggers/conditions/actions).
        """
        self._entity_references.clear()
        self._automation_alias_map.clear()

        # Build alias map: entity_id → friendly alias for display
        for entity_id, config in automation_configs.items():
            alias = config.get("alias") or config.get("id") or entity_id
            self._automation_alias_map[entity_id] = alias
        if script_configs:
            for script_id, config in script_configs.items():
                alias = config.get("alias") or config.get("id") or script_id
                self._automation_alias_map[script_id] = alias

        for idx, (automation_id, config) in enumerate(automation_configs.items()):
            # Support both old and new HA YAML key formats
            triggers = config.get("triggers") or config.get("trigger", [])
            if not isinstance(triggers, list):
                triggers = [triggers] if triggers else []
            
            for trigger in triggers:
                if not isinstance(trigger, dict):
                    continue
                entity_id = trigger.get("entity_id")
                if entity_id:
                    if isinstance(entity_id, list):
                        for eid in entity_id:
                            self._entity_references[eid].append(automation_id)
                    else:
                        self._entity_references[entity_id].append(automation_id)
            
            # Extract from conditions (support both key formats)
            conditions = config.get("conditions") or config.get("condition", [])
            if not isinstance(conditions, list):
                conditions = [conditions] if conditions else []
            
            for condition in conditions:
                if not isinstance(condition, dict):
                    continue
                entity_id = condition.get("entity_id")
                if entity_id:
                    if isinstance(entity_id, list):
                        for eid in entity_id:
                            self._entity_references[eid].append(automation_id)
                    else:
                        self._entity_references[entity_id].append(automation_id)
            
            # Extract from actions (support both key formats)
            actions = config.get("actions") or config.get("action", [])
            if not isinstance(actions, list):
                actions = [actions] if actions else []
            
            for action in actions:
                if not isinstance(action, dict):
                    continue
                # Check entity_id at action level
                action_entity = action.get("entity_id")
                if action_entity:
                    if isinstance(action_entity, list):
                        for eid in action_entity:
                            self._entity_references[eid].append(automation_id)
                    else:
                        self._entity_references[action_entity].append(automation_id)
                # Check entity_id in target
                target = action.get("target", {})
                if isinstance(target, dict):
                    entity_id = target.get("entity_id")
                    if entity_id:
                        if isinstance(entity_id, list):
                            for eid in entity_id:
                                self._entity_references[eid].append(automation_id)
                        else:
                            self._entity_references[entity_id].append(automation_id)
            
            if idx % 10 == 0: await asyncio.sleep(0)
        
        # Also scan scripts for entity references
        if script_configs:
            for idx, (script_id, config) in enumerate(script_configs.items()):
                sequence = config.get("sequence", [])
                if not isinstance(sequence, list):
                    sequence = [sequence] if sequence else []
                for action in sequence:
                    if not isinstance(action, dict):
                        continue
                    action_entity = action.get("entity_id")
                    if action_entity:
                        if isinstance(action_entity, list):
                            for eid in action_entity:
                                self._entity_references[eid].append(script_id)
                        else:
                            self._entity_references[action_entity].append(script_id)
                    target = action.get("target", {})
                    if isinstance(target, dict):
                        entity_id = target.get("entity_id")
                        if entity_id:
                            if isinstance(entity_id, list):
                                for eid in entity_id:
                                    self._entity_references[eid].append(script_id)
                            else:
                                self._entity_references[entity_id].append(script_id)
                if idx % 10 == 0: await asyncio.sleep(0)

    async def _analyze_entity_states(self) -> None:
        """Analyze entity states."""
        all_entities = self.hass.states.async_all()
        t = self._translator.t
        
        for idx, entity in enumerate(all_entities):
            entity_id = entity.entity_id
            
            # Skip HACA's own sensors to avoid self-reporting
            if entity_id.startswith("sensor.h_a_c_a_"):
                continue
            
            # Check for unavailable entities
            if entity.state == "unavailable":
                referencing_automations = self._entity_references.get(entity_id, [])
                severity = "high" if referencing_automations else "medium"
                
                message = t("entity_unavailable_referenced", count=len(referencing_automations)) if referencing_automations else t("entity_unknown_state")
                
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "unavailable_entity",
                    "severity": severity,
                    "message": message,
                    "recommendation": t("verify_entity_updates"),
                })
            
            # Check for unknown state
            elif entity.state == "unknown":
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "unknown_state",
                    "severity": "medium",
                    "message": t("entity_unknown_state"),
                    "recommendation": t("verify_entity_updates"),
                })
            
            # Check for stale entities (>7 days without update)
            if entity.last_updated:
                time_since_update = datetime.now(entity.last_updated.tzinfo) - entity.last_updated
                
                if time_since_update > timedelta(days=7):
                    # Skip certain domains
                    skip_domains = ["sun", "zone", "person", "automation", "script"]
                    if not any(entity_id.startswith(f"{domain}.") for domain in skip_domains):
                        referencing_automations = self._entity_references.get(entity_id, [])
                        severity = "medium" if referencing_automations else "low"
                        
                        self.issues.append({
                            "entity_id": entity_id,
                            "type": "stale_entity",
                            "severity": severity,
                            "message": t("entity_not_updated", days=time_since_update.days),
                            "recommendation": t("entity_may_be_broken"),
                        })
            
            if idx % 50 == 0: await asyncio.sleep(0)

    async def _load_ignored_entity_ids(self) -> set:
        """Return entity_ids that carry the haca_ignore label."""
        ignored = set()
        try:
            for entry in er.async_get(self.hass).entities.values():
                if "haca_ignore" in entry.labels:
                    ignored.add(entry.entity_id)
        except Exception as e:
            _LOGGER.debug("haca_ignore: %s", e)
        return ignored

    async def _analyze_zombie_entities(self) -> None:
        """Detect zombie entities - referenced but don't exist."""
        all_entities = self.hass.states.async_all()
        existing_entities = {entity.entity_id for entity in all_entities}
        t = self._translator.t

        for idx, (entity_id, automations) in enumerate(self._entity_references.items()):
            if entity_id in self._ignored_entity_ids:
                continue
            if entity_id not in existing_entities:
                automation_ids = list(dict.fromkeys(automations))  # deduplicate, keep order
                # Resolve human-readable names for each referencing automation
                automation_names = [
                    self._automation_alias_map.get(aid, aid)
                    for aid in automation_ids
                ]
                source_name = automation_names[0] if automation_names else entity_id
                self.issues.append({
                    "entity_id": entity_id,
                    "alias": entity_id,
                    "type": "zombie_entity",
                    "severity": "high",
                    "message": t("entity_referenced_not_exist", count=len(automation_ids)),
                    "recommendation": t("remove_or_recreate"),
                    "fix_available": True,
                    "automation_id": automation_ids[0] if automation_ids else "",
                    "automation_ids": automation_ids,
                    "automation_names": automation_names,
                    "source_name": source_name,
                })
            if idx % 50 == 0: await asyncio.sleep(0)

    async def _analyze_entity_registry(self) -> None:
        """Analyze entity registry."""
        entity_reg = er.async_get(self.hass)
        t = self._translator.t
        
        for idx, entry in enumerate(entity_reg.entities.values()):
            entity_id = entry.entity_id
            if entity_id in self._ignored_entity_ids:
                continue
            # Check for disabled entities that are referenced
            if entry.disabled_by is not None:
                referencing_automations = self._entity_references.get(entity_id, [])
                if referencing_automations:
                    self.issues.append({
                        "entity_id": entity_id,
                        "type": "disabled_but_referenced",
                        "severity": "high",
                        "message": t("entity_disabled_referenced", count=len(referencing_automations)),
                        "recommendation": t("enable_or_remove_refs"),
                    })
            if idx % 50 == 0: await asyncio.sleep(0)

    async def _analyze_ghost_registry_entries(self) -> None:
        """Detect ghost registry entries (orphaned entities in registry)."""
        entity_reg = er.async_get(self.hass)
        t = self._translator.t
        
        for idx, entry in enumerate(entity_reg.entities.values()):
            # A ghost entry is often one where the platform is defined but doesn't exist anymore
            # or the integration that created it is no longer available.
            # HA usually marks these as orphaned but doesn't always show them to users.
            
            # Simple check: is it enabled but has no state AND no info in current platforms
            if entry.disabled_by is None:
                state = self.hass.states.get(entry.entity_id)
                if state is None:
                    # If it has no state, it might be a ghost.
                    # We check if it's a 'manual' entity or if the platform exists.
                    # Spook also checks if the config_entry is still valid.
                    if entry.config_entry_id:
                        config_entry = self.hass.config_entries.async_get_entry(entry.config_entry_id)
                        if config_entry is None or config_entry.state.recoverable is False:
                            self.issues.append({
                                "entity_id": entry.entity_id,
                                "type": "ghost_registry_entry",
                                "severity": "medium",
                                "message": t("orphaned_registry_entry", platform=entry.platform),
                                "recommendation": t("remove_orphaned"),
                                "fix_available": True,
                            })
            
            if idx % 50 == 0: await asyncio.sleep(0)

    async def _analyze_device_integrity(self, automation_configs: dict[str, dict] = None) -> None:
        """Analyze if device_ids referenced in automations actually exist."""
        if not automation_configs:
            return
            
        dev_reg = dr.async_get(self.hass)
        t = self._translator.t
        
        for idx, (automation_id, config) in enumerate(automation_configs.items()):
            # Collect all device_ids in this automation
            device_ids = self._extract_field_recursively(config, "device_id")
            
            for device_id in device_ids:
                if not dev_reg.async_get(device_id):
                    self.issues.append({
                        "entity_id": automation_id,
                        "device_id": device_id,
                        "type": "broken_device_reference",
                        "severity": "high",
                        "message": t("broken_device_reference", device_id=device_id),
                        "recommendation": t("use_entity_id_or_update"),
                        "fix_available": True,
                    })
            
            if idx % 20 == 0: await asyncio.sleep(0)

    def _extract_field_recursively(self, config: Any, field_name: str) -> set[str]:
        """Extract all occurrences of a field from a nested dict/list."""
        results = set()
        
        if isinstance(config, dict):
            for k, v in config.items():
                if k == field_name and isinstance(v, str):
                    results.add(v)
                else:
                    results.update(self._extract_field_recursively(v, field_name))
        elif isinstance(config, list):
            for item in config:
                results.update(self._extract_field_recursively(item, field_name))
                
        return results

    async def _analyze_unused_input_booleans(self) -> None:
        """Detect input_boolean entities that are not referenced in any automation or script."""
        t = self._translator.t
        
        # Get all input_boolean entities
        all_entities = self.hass.states.async_all()
        input_booleans = [e for e in all_entities if e.entity_id.startswith("input_boolean.")]
        
        for idx, entity in enumerate(input_booleans):
            entity_id = entity.entity_id
            
            # Check if this input_boolean is referenced anywhere
            if entity_id not in self._entity_references or len(self._entity_references[entity_id]) == 0:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "unused_input_boolean",
                    "severity": "low",
                    "message": t("unused_input_boolean", entity_id=entity_id),
                    "recommendation": t("remove_unused_helper"),
                    "fix_available": False,
                })
            
            if idx % 20 == 0: await asyncio.sleep(0)

    def get_issue_summary(self) -> dict[str, Any]:
        """Get a summary of entity issues."""
        summary = {
            "total": len(self.issues),
            "by_severity": {"high": 0, "medium": 0, "low": 0},
            "by_type": {},
            "zombie_entities": 0,
            "unavailable_entities": 0,
            "stale_entities": 0,
            "unused_helpers": 0
        }
        
        for issue in self.issues:
            severity = issue.get("severity", "low")
            issue_type = issue.get("type", "unknown")
            
            summary["by_severity"][severity] = summary["by_severity"].get(severity, 0) + 1
            summary["by_type"][issue_type] = summary["by_type"].get(issue_type, 0) + 1
            
            if issue_type == "zombie_entity":
                summary["zombie_entities"] += 1
            elif issue_type == "unavailable_entity":
                summary["unavailable_entities"] += 1
            elif issue_type == "stale_entity":
                summary["stale_entities"] += 1
            elif issue_type == "unused_input_boolean":
                summary["unused_helpers"] += 1
        
        return summary
