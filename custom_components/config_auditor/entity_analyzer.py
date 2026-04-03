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

# Domains that are analysed by other HACA analyzers (automation_analyzer, etc.)
# and must NOT appear in the "Entities" issues tab.
# NOTE: "scene" is intentionally NOT in this set — scene.* issues from entity_analyzer
# are routed to scene_issue_list in async_update_data (see __init__.py).
_ENTITY_SKIP_DOMAINS: frozenset[str] = frozenset({
    "automation",
    "script",
    "sun",
    "zone",
    "person",
})

# Domains where state "unknown" is structurally normal and should not be flagged.
# button/input_button: no persistent state by design, "unknown" between presses
# event: "unknown" until first event fires
# tts/stt/conversation: service entities, not stateful sensors
# update: "unknown" until first update check completes
# calendar: "unknown" when no active event
# device_tracker: "unknown" if device hasn't been seen yet (reboot, out of range)
# notify: service entity, no meaningful state
# scene: transient activation, no persistent state
# number/select: some integrations initialize as unknown before first value
_UNKNOWN_NORMAL_DOMAINS: frozenset[str] = frozenset({
    "button", "input_button", "event",
    "tts", "stt", "conversation",
    "update", "calendar",
    "device_tracker", "notify", "scene",
})


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
        
        # Load ignored entities (haca_ignore label) — MUST be first, before any analysis
        self._ignored_entity_ids = await self._load_ignored_entity_ids()

        # Build entity reference map (automations + scripts)
        if automation_configs or script_configs:
            await self._build_entity_references(automation_configs or {}, script_configs or {})
        
        # Analyze entity states
        await self._analyze_entity_states()

        # Analyze zombie entities
        await self._analyze_zombie_entities()
        
        # Analyze entity registry
        await self._analyze_entity_registry()
        
        # Analyze ghost registry entries (Spook inspired)
        await self._analyze_ghost_registry_entries()
        
        # Analyze broken device references
        await self._analyze_device_integrity(automation_configs)
        
        # v1.2.0 — Extended input_* helper analysis (covers input_boolean too)
        await self._analyze_input_helpers(automation_configs or {}, script_configs or {})

        # v1.2.0 — Timer helper analysis
        await self._analyze_timer_helpers(automation_configs or {}, script_configs or {})

        # v1.3.0 — Group analysis
        await self._analyze_groups()
        
        _LOGGER.info("Entity analysis complete: %d issues found", len(self.issues))

        # Separate helper issues (input_*, timer, counter) from pure entity issues
        _HELPER_DOMAINS = {
            "input_boolean", "input_number", "input_text",
            "input_select", "input_datetime", "input_button",
            "timer", "counter",
        }
        self.helper_issues: list[dict] = []
        pure_entity_issues: list[dict] = []
        for issue in self.issues:
            domain = issue.get("entity_id", "").split(".")[0]
            if domain in _HELPER_DOMAINS or issue.get("type", "").startswith("helper_") or issue.get("type", "") in ("unused_input_boolean",):
                self.helper_issues.append(issue)
            else:
                pure_entity_issues.append(issue)

        return pure_entity_issues

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

        def _is_valid_entity_id(eid: str) -> bool:
            """Check if a string looks like a valid HA entity_id (domain.object_id)."""
            if not isinstance(eid, str) or "." not in eid:
                return False
            parts = eid.split(".", 1)
            # domain must be alpha/underscore, object_id must not be empty
            return len(parts) == 2 and len(parts[0]) > 0 and len(parts[1]) > 0 and parts[0].replace("_", "").isalpha()

        def _add_ref(entity_id, automation_id):
            """Add entity reference only if entity_id is valid."""
            if isinstance(entity_id, list):
                for eid in entity_id:
                    if _is_valid_entity_id(eid):
                        self._entity_references[eid].append(automation_id)
            elif _is_valid_entity_id(entity_id):
                self._entity_references[entity_id].append(automation_id)

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
                    _add_ref(entity_id, automation_id)
            
            # Extract from conditions (support both key formats)
            conditions = config.get("conditions") or config.get("condition", [])
            if not isinstance(conditions, list):
                conditions = [conditions] if conditions else []
            
            for condition in conditions:
                if not isinstance(condition, dict):
                    continue
                entity_id = condition.get("entity_id")
                if entity_id:
                    _add_ref(entity_id, automation_id)
            
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
                    _add_ref(action_entity, automation_id)
                # Check entity_id in target
                target = action.get("target", {})
                if isinstance(target, dict):
                    entity_id = target.get("entity_id")
                    if entity_id:
                        _add_ref(entity_id, automation_id)
            
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
                        _add_ref(action_entity, script_id)
                    target = action.get("target", {})
                    if isinstance(target, dict):
                        entity_id = target.get("entity_id")
                        if entity_id:
                            _add_ref(entity_id, script_id)
                if idx % 10 == 0: await asyncio.sleep(0)

    async def _analyze_entity_states(self) -> None:
        """Analyze entity states."""
        all_entities = self.hass.states.async_all()
        t = self._translator.t
        
        for idx, entity in enumerate(all_entities):
            entity_id = entity.entity_id
            
            # Skip ignored entities
            if entity_id in self._ignored_entity_ids:
                continue

            # Skip HACA's own sensors to avoid self-reporting
            if entity_id.startswith("sensor.h_a_c_a_"):
                continue

            # Skip domains managed by other HACA analyzers (scenes, automations, scripts…)
            if entity_id.split(".")[0] in _ENTITY_SKIP_DOMAINS:
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
            
            # Check for unknown state — context-aware
            # Skip domains where "unknown" is structurally normal (buttons, events, etc.)
            # For other domains, only flag if the entity is referenced by automations/scripts
            elif entity.state == "unknown":
                domain = entity_id.split(".")[0]
                if domain not in _UNKNOWN_NORMAL_DOMAINS:
                    referencing_automations = self._entity_references.get(entity_id, [])
                    if referencing_automations:
                        self.issues.append({
                            "entity_id": entity_id,
                            "type": "unknown_state",
                            "severity": "medium",
                            "message": t("entity_unknown_state_referenced", count=len(referencing_automations)),
                            "recommendation": t("verify_entity_updates"),
                        })
            
            # Check for stale entities (>7 days without update)
            if entity.last_updated:
                time_since_update = datetime.now(entity.last_updated.tzinfo) - entity.last_updated
                
                if time_since_update > timedelta(days=7):
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
        """Return entity_ids that carry the haca_ignore label (entity or device level)."""
        from .translation_utils import async_get_haca_ignored_entity_ids
        return await async_get_haca_ignored_entity_ids(self.hass)

    async def _analyze_zombie_entities(self) -> None:
        """Detect zombie entities - referenced but don't exist."""
        all_entities = self.hass.states.async_all()
        existing_entities = {entity.entity_id for entity in all_entities}
        t = self._translator.t

        for idx, (entity_id, automations) in enumerate(self._entity_references.items()):
            if entity_id in self._ignored_entity_ids:
                continue
            # Scenes, automations, scripts etc. are managed by their own analyzers
            if entity_id.split(".")[0] in _ENTITY_SKIP_DOMAINS:
                if idx % 50 == 0: await asyncio.sleep(0)
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
            # Scenes, automations, scripts etc. are managed by their own analyzers
            if entity_id.split(".")[0] in _ENTITY_SKIP_DOMAINS:
                if idx % 50 == 0: await asyncio.sleep(0)
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
            if entry.entity_id in self._ignored_entity_ids:
                if idx % 50 == 0: await asyncio.sleep(0)
                continue
            # Scenes, automations, scripts etc. are managed by their own analyzers
            if entry.entity_id.split(".")[0] in _ENTITY_SKIP_DOMAINS:
                if idx % 50 == 0: await asyncio.sleep(0)
                continue
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
            # Skip ignored automations
            if automation_id in self._ignored_entity_ids:
                if idx % 20 == 0: await asyncio.sleep(0)
                continue

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

            # Skip ignored entities
            if entity_id in self._ignored_entity_ids:
                if idx % 20 == 0: await asyncio.sleep(0)
                continue

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

    async def _analyze_input_helpers(
        self,
        automation_configs: dict[str, dict],
        script_configs: dict[str, dict],
    ) -> None:
        """v1.2.0 — Analyse des input_* helpers (toutes catégories)."""
        import re as _re
        t = self._translator.t

        INPUT_DOMAINS = (
            "input_boolean", "input_number", "input_text",
            "input_select", "input_datetime",
        )

        # Build a flat text dump of all configs for fast template scanning
        all_config_text = ""
        for cfg in list(automation_configs.values()) + list(script_configs.values()):
            try:
                import json as _json
                all_config_text += _json.dumps(cfg) + " "
            except Exception:
                pass

        all_states = self.hass.states.async_all()
        helpers = [s for s in all_states if s.entity_id.split(".")[0] in INPUT_DOMAINS]

        for idx, entity in enumerate(helpers):
            entity_id = entity.entity_id
            if entity_id in self._ignored_entity_ids:
                continue

            domain = entity_id.split(".")[0]
            attrs = entity.attributes or {}
            friendly_name = attrs.get("friendly_name", "")

            # ── Check if referenced in any automation/script ──────────────
            refs = self._entity_references.get(entity_id, [])
            if not refs and entity_id not in all_config_text:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "helper_unused",
                    "severity": "low",
                    "message": t("helper_unused", entity_id=entity_id),
                    "recommendation": t("remove_unused_helper"),
                })
                if idx % 20 == 0:
                    await asyncio.sleep(0)
                continue

            # ── Check if referenced ONLY in disabled automations ──────────
            if refs:
                all_disabled = all(
                    self.hass.states.get(aid) is not None
                    and self.hass.states.get(aid).state == "off"
                    for aid in refs
                    if aid.startswith("automation.")
                )
                if all_disabled and all(aid.startswith("automation.") for aid in refs):
                    self.issues.append({
                        "entity_id": entity_id,
                        "type": "helper_orphaned_disabled_only",
                        "severity": "low",
                        "message": t("helper_orphaned_disabled_only", entity_id=entity_id, count=len(refs)),
                        "recommendation": t("helper_orphaned_recommendation"),
                    })

            # ── No friendly_name ──────────────────────────────────────────
            if not friendly_name or friendly_name == entity_id:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "helper_no_friendly_name",
                    "severity": "low",
                    "message": t("helper_no_friendly_name", entity_id=entity_id),
                    "recommendation": t("helper_add_friendly_name"),
                })

            # ── Domain-specific checks ────────────────────────────────────
            if domain == "input_select":
                options = attrs.get("options", [])
                # Duplicate options
                if len(options) != len(set(options)):
                    dupes = [o for o in options if options.count(o) > 1]
                    self.issues.append({
                        "entity_id": entity_id,
                        "type": "input_select_duplicate_options",
                        "severity": "medium",
                        "message": t("input_select_duplicate_options", entity_id=entity_id, dupes=", ".join(set(dupes))),
                        "recommendation": t("input_select_remove_duplicates"),
                    })
                # Empty options
                if any(str(o).strip() == "" for o in options):
                    self.issues.append({
                        "entity_id": entity_id,
                        "type": "input_select_empty_option",
                        "severity": "medium",
                        "message": t("input_select_empty_option", entity_id=entity_id),
                        "recommendation": t("input_select_remove_empty"),
                    })

            elif domain == "input_number":
                min_val = attrs.get("min")
                max_val = attrs.get("max")
                step_val = attrs.get("step")
                if min_val is not None and max_val is not None:
                    try:
                        mn, mx = float(min_val), float(max_val)
                        if mn >= mx:
                            self.issues.append({
                                "entity_id": entity_id,
                                "type": "input_number_invalid_range",
                                "severity": "high",
                                "message": t("input_number_invalid_range", entity_id=entity_id, min=mn, max=mx),
                                "recommendation": t("input_number_fix_range"),
                            })
                        elif step_val is not None:
                            st = float(step_val)
                            rng = mx - mn
                            if st > rng:
                                self.issues.append({
                                    "entity_id": entity_id,
                                    "type": "input_number_invalid_range",
                                    "severity": "medium",
                                    "message": t("input_number_step_exceeds_range", entity_id=entity_id, step=st, range=round(rng, 4)),
                                    "recommendation": t("input_number_fix_range"),
                                })
                    except (ValueError, TypeError):
                        pass

            elif domain == "input_text":
                pattern = attrs.get("pattern")
                if pattern:
                    try:
                        _re.compile(pattern)
                    except _re.error as rex:
                        self.issues.append({
                            "entity_id": entity_id,
                            "type": "input_text_invalid_pattern",
                            "severity": "high",
                            "message": t("input_text_invalid_pattern", entity_id=entity_id, error=str(rex)),
                            "recommendation": t("input_text_fix_pattern"),
                        })

            if idx % 20 == 0:
                await asyncio.sleep(0)

    async def _analyze_timer_helpers(
        self,
        automation_configs: dict[str, dict],
        script_configs: dict[str, dict],
    ) -> None:
        """v1.2.0 — Analyse des timer helpers."""
        t = self._translator.t

        all_states = self.hass.states.async_all()
        timers = [s for s in all_states if s.entity_id.startswith("timer.")]

        if not timers:
            return

        # Build sets of timer_ids that appear in trigger events, actions, etc.
        timers_in_event_trigger: dict[str, list[str]] = {}   # timer_id -> [automation_ids]
        timers_in_start_action: set[str] = set()
        timers_in_cancel_action: set[str] = set()

        def _collect_timer_refs(configs: dict[str, dict]) -> None:
            def _scan_actions_recursive(actions_raw, automation_id: str) -> None:
                """Recursively scan actions including choose/parallel/repeat."""
                if isinstance(actions_raw, dict):
                    actions_raw = [actions_raw]
                if not isinstance(actions_raw, list):
                    return
                for action in actions_raw:
                    if not isinstance(action, dict):
                        continue
                    service = action.get("service") or action.get("action", "")
                    target = action.get("target", {})
                    target_eid = target.get("entity_id", "") if isinstance(target, dict) else ""
                    if service == "timer.start" and target_eid:
                        for eid in ([target_eid] if isinstance(target_eid, str) else target_eid):
                            timers_in_start_action.add(eid)
                    if service in ("timer.cancel", "timer.pause") and target_eid:
                        for eid in ([target_eid] if isinstance(target_eid, str) else target_eid):
                            timers_in_cancel_action.add(eid)
                    # Recurse into nested structures
                    for nested_key in ("sequence", "then", "else"):
                        if nested_key in action:
                            _scan_actions_recursive(action[nested_key], automation_id)
                    # choose: list of {conditions, sequence}
                    for choose_branch in action.get("choose", []):
                        if isinstance(choose_branch, dict):
                            _scan_actions_recursive(choose_branch.get("sequence", []), automation_id)
                    # parallel: list of action groups
                    _scan_actions_recursive(action.get("parallel", []), automation_id)
                    # repeat: {sequence}
                    if "repeat" in action and isinstance(action["repeat"], dict):
                        _scan_actions_recursive(action["repeat"].get("sequence", []), automation_id)

            for automation_id, config in configs.items():
                # Check triggers for timer.* events
                for key in ("triggers", "trigger"):
                    triggers = config.get(key, [])
                    if isinstance(triggers, dict):
                        triggers = [triggers]
                    for tr in (triggers if isinstance(triggers, list) else []):
                        if not isinstance(tr, dict):
                            continue
                        if tr.get("platform") == "event" and tr.get("event_type", "").startswith("timer."):
                            eid = tr.get("event_data", {}).get("entity_id", "")
                            if eid:
                                timers_in_event_trigger.setdefault(eid, []).append(automation_id)

                # Scan actions recursively
                for key in ("actions", "action", "sequence"):
                    _scan_actions_recursive(config.get(key, []), automation_id)

        _collect_timer_refs(automation_configs)
        _collect_timer_refs(script_configs)

        for idx, entity in enumerate(timers):
            entity_id = entity.entity_id
            if entity_id in self._ignored_entity_ids:
                continue

            attrs = entity.attributes or {}
            duration = attrs.get("duration", "")

            # ── Timer with duration 0 ─────────────────────────────────────
            if duration in ("0:00:00", "00:00:00", "0"):
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "timer_zero_duration",
                    "severity": "medium",
                    "message": t("timer_zero_duration", entity_id=entity_id),
                    "recommendation": t("timer_set_duration"),
                })

            # ── Timer in event trigger but never started ───────────────────
            in_trigger = entity_id in timers_in_event_trigger
            in_start = entity_id in timers_in_start_action

            if in_trigger and not in_start:
                automation_names = [
                    self._automation_alias_map.get(aid, aid)
                    for aid in timers_in_event_trigger.get(entity_id, [])
                ]
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "timer_never_started",
                    "severity": "high",
                    "message": t("timer_never_started", entity_id=entity_id),
                    "recommendation": t("timer_add_start_action"),
                    "automation_names": automation_names[:3],
                })

            # ── Timer never used at all ────────────────────────────────────
            refs = self._entity_references.get(entity_id, [])
            if not refs and not in_trigger and not in_start and not in_trigger:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "timer_orphaned",
                    "severity": "low",
                    "message": t("timer_orphaned", entity_id=entity_id),
                    "recommendation": t("remove_unused_helper"),
                })

            if idx % 20 == 0:
                await asyncio.sleep(0)

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

    # ═══════════════════════════════════════════════════════════════════════
    # v1.3.0 — Group analysis (d/)
    # ═══════════════════════════════════════════════════════════════════════

    async def _analyze_groups(self) -> None:
        """v1.3.0 — Analyse des group.* entities:
        - Groupe vide (medium)
        - Entités manquantes dans le groupe (medium)
        - Toutes les entités unavailable (medium)
        - Imbrication > 2 niveaux (low)
        """
        t = self._translator.t
        all_states = self.hass.states.async_all()
        groups = [s for s in all_states if s.entity_id.startswith("group.")]

        if not groups:
            return

        all_entity_ids = {s.entity_id for s in all_states}

        for idx, group_state in enumerate(groups):
            entity_id = group_state.entity_id
            if entity_id in self._ignored_entity_ids:
                continue

            members = group_state.attributes.get("entity_id", [])
            if isinstance(members, str):
                members = [members] if members else []
            if not isinstance(members, (list, tuple)):
                members = []
            else:
                members = list(members)  # normalize tuple → list
            # Filter out empty strings (malformed state attribute)
            members = [m for m in members if isinstance(m, str) and m.strip()]

            # 1. Groupe vide
            if not members:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "group_empty",
                    "severity": "medium",
                    "message": t("group_empty", entity_id=entity_id),
                    "recommendation": t("group_add_members"),
                })
                continue  # no members → other checks irrelevant

            # 2. Entités manquantes
            missing = [m for m in members if m not in all_entity_ids]
            if missing:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "group_missing_entities",
                    "severity": "medium",
                    "message": t("group_missing_entities",
                                 count=len(missing), entity_id=entity_id),
                    "recommendation": t("group_fix_references"),
                    "missing_entities": missing[:10],
                })

            # 3. Toutes les entités unavailable
            present_states = [
                self.hass.states.get(m) for m in members if m in all_entity_ids
            ]
            if present_states and all(
                s is not None and s.state in ("unavailable", "unknown")
                for s in present_states
            ):
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "group_all_unavailable",
                    "severity": "medium",
                    "message": t("group_all_unavailable", entity_id=entity_id),
                    "recommendation": t("group_check_availability"),
                })

            # 4. Imbrication > 2 niveaux
            depth = self._calc_group_nesting_depth(entity_id, frozenset())
            if depth > 2:
                self.issues.append({
                    "entity_id": entity_id,
                    "type": "group_nested_deep",
                    "severity": "low",
                    "message": t("group_nested_deep",
                                 entity_id=entity_id, depth=depth),
                    "recommendation": t("group_flatten"),
                })

            if idx % 20 == 0:
                await asyncio.sleep(0)

    def _calc_group_nesting_depth(self, group_id: str, visited: frozenset) -> int:
        """Recursively compute group nesting depth. Returns 1 for leaf groups."""
        if group_id in visited:
            return 0  # cycle guard
        state = self.hass.states.get(group_id)
        if not state:
            return 1
        members = state.attributes.get("entity_id", [])
        if isinstance(members, str):
            members = [members]
        sub_groups = [m for m in (members or []) if isinstance(m, str)
                      and m.startswith("group.")]
        if not sub_groups:
            return 1
        new_visited = visited | {group_id}
        return 1 + max(
            self._calc_group_nesting_depth(sg, new_visited)
            for sg in sub_groups
        )
