"""H.A.C.A — Refactoring Assistant — Module 5."""
from __future__ import annotations

from datetime import datetime
import difflib
import logging
import re
from pathlib import Path
from typing import Any
import yaml

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import BACKUP_DIR

_LOGGER = logging.getLogger(__name__)


def _build_description_fallback(alias: str, config: dict, is_script: bool) -> str:
    """Generate a rule-based description when AI is unavailable.

    Uses the alias, triggers and actions to produce a meaningful single sentence.
    """
    import re as _re

    # Clean alias → readable name
    name = alias or ""
    # Remove leading emoji/icon
    name = _re.sub(r'^[𐀀-􏿿☀-⛿✀-➿\s]+', '', name).strip()
    # Replace underscores/hyphens with spaces
    name = name.replace("_", " ").replace("-", " ").strip()

    if is_script:
        actions = config.get("sequence", [])
        if not isinstance(actions, list):
            actions = []
        n_actions = len(actions)
        if n_actions == 0:
            return f"Script : {name}." if name else "Script sans actions configurées."
        # Describe first action type
        first = actions[0] if actions else {}
        service = first.get("service") or first.get("action", "")
        if service:
            domain = service.split(".")[0] if "." in service else service
            return f"Script exécutant {n_actions} action(s) sur {domain} — {name}." if name else f"Script exécutant {n_actions} action(s) sur {domain}."
        return f"Script avec {n_actions} action(s) : {name}." if name else f"Script avec {n_actions} action(s)."

    # Automation
    triggers = config.get("trigger", []) or config.get("triggers", [])
    if not isinstance(triggers, list):
        triggers = [triggers] if triggers else []
    actions = config.get("action", []) or config.get("actions", [])
    if not isinstance(actions, list):
        actions = [actions] if actions else []

    n_triggers = len(triggers)
    n_actions = len(actions)

    # Describe trigger type
    trigger_desc = ""
    if triggers:
        first_t = triggers[0] if isinstance(triggers[0], dict) else {}
        platform = first_t.get("platform") or first_t.get("trigger", "")
        if platform == "state":
            entity = first_t.get("entity_id", "")
            if isinstance(entity, list):
                entity = entity[0] if entity else ""
            trigger_desc = f"quand l'état de {entity} change" if entity else "sur changement d'état"
        elif platform == "time":
            at = first_t.get("at", "")
            trigger_desc = f"à {at}" if at else "à heure fixe"
        elif platform == "time_pattern":
            trigger_desc = "selon un motif horaire"
        elif platform == "sun":
            event = first_t.get("event", "sunrise")
            trigger_desc = "au lever du soleil" if event == "sunrise" else "au coucher du soleil"
        elif platform in ("mqtt", "event"):
            trigger_desc = f"sur événement {platform}"
        elif platform == "numeric_state":
            entity = first_t.get("entity_id", "")
            trigger_desc = f"quand la valeur de {entity} change" if entity else "sur changement numérique"
        elif platform == "template":
            trigger_desc = "sur condition de template"
        else:
            trigger_desc = f"sur déclencheur {platform}" if platform else "sur déclenchement"

    # Describe action
    action_desc = ""
    if actions:
        first_a = actions[0] if isinstance(actions[0], dict) else {}
        service = first_a.get("service") or first_a.get("action", "")
        if service:
            domain = service.split(".")[0] if "." in service else service
            action_desc = f"exécute {service}" if n_actions == 1 else f"exécute {n_actions} actions dont {service}"
        elif "delay" in first_a:
            action_desc = "attend puis exécute des actions"
        elif "choose" in first_a:
            action_desc = "exécute des actions conditionnelles"

    if name and trigger_desc and action_desc:
        return f"Automation «{name}» : {trigger_desc}, {action_desc}."
    elif name and trigger_desc:
        return f"Automation «{name}» déclenchée {trigger_desc}."
    elif name and action_desc:
        return f"Automation «{name}» qui {action_desc}."
    elif name:
        return f"Automation : {name}."
    elif trigger_desc and action_desc:
        return f"Se déclenche {trigger_desc} et {action_desc}."
    else:
        return f"Automation avec {n_triggers} déclencheur(s) et {n_actions} action(s)."


class RefactoringAssistant:
    """Assistant for automated refactoring with preview and backup."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize refactoring assistant."""
        self.hass = hass
        self._backup_dir = Path(hass.config.config_dir) / BACKUP_DIR
        self._backup_dir.mkdir(exist_ok=True)
        self._automations_file = Path(hass.config.config_dir) / "automations.yaml"
        self._scripts_file = Path(hass.config.config_dir) / "scripts.yaml"

    async def preview_device_id_fix(self, automation_id: str) -> dict[str, Any]:
        """Preview device_id to entity_id conversion without applying."""
        
        # Load automation config
        automation_config = await self._load_automation_by_id(automation_id)
        
        if not automation_config:
            return {
                "success": False,
                "error": f"Automation {automation_id} not found"
            }
        
        changes = []
        
        # --- TRIGGERS ---
        trigger_key = "triggers" if "triggers" in automation_config else "trigger"
        triggers = automation_config.get(trigger_key, [])
        if not isinstance(triggers, list):
            triggers = [triggers] if triggers else []
        
        for idx, trigger in enumerate(triggers):
            if not isinstance(trigger, dict):
                continue
            if "device_id" not in trigger:
                continue
                
            device_id = trigger["device_id"]
            domain = trigger.get("domain", "")
            trigger_type = trigger.get("type", "")
            _LOGGER.info("Trigger %d: device_id=%s, domain=%s, type=%s", idx, device_id, domain, trigger_type)
            
            # Resolve entity_id (HA stores UUID registry IDs, not actual entity_id strings)
            resolved_entity = await self._resolve_entity_id(
                device_id, trigger.get("entity_id"), domain
            )
            
            if resolved_entity:
                # Build native state trigger
                new_trigger = {
                    "platform": "state",
                    "entity_id": resolved_entity,
                }
                
                # Map device trigger types to state values
                type_to_state = {
                    "turned_on": "on", "turned on": "on",
                    "turned_off": "off", "turned off": "off",
                    "motion": "on", "occupied": "on", "not_occupied": "off",
                    "opened": "on", "closed": "off",
                    "detected": "on", "not_detected": "off",
                    "connected": "on", "disconnected": "off",
                }
                if trigger_type in type_to_state:
                    new_trigger["to"] = type_to_state[trigger_type]
                
                changes.append({
                    "section": "trigger",
                    "index": idx,
                    "to": new_trigger,
                    "description": f"Trigger {idx}: {domain}.{trigger_type} → platform: state, entity_id: {resolved_entity}"
                })
            else:
                _LOGGER.warning("Cannot resolve entity for trigger %d (device_id=%s)", idx, device_id)
        
        # --- CONDITIONS ---
        condition_key = "conditions" if "conditions" in automation_config else "condition"
        conditions = automation_config.get(condition_key, [])
        if not isinstance(conditions, list):
            conditions = [conditions] if conditions else []
        
        for idx, condition in enumerate(conditions):
            if not isinstance(condition, dict):
                continue
            if "device_id" not in condition:
                continue
                
            device_id = condition["device_id"]
            domain = condition.get("domain", "")
            cond_type = condition.get("type", "")
            _LOGGER.info("Condition %d: device_id=%s, domain=%s, type=%s", idx, device_id, domain, cond_type)
            
            resolved_entity = await self._resolve_entity_id(
                device_id, condition.get("entity_id"), domain
            )
            
            if resolved_entity:
                # Map device condition types to native conditions
                if cond_type.startswith("is_") and domain == "sensor":
                    # is_illuminance, is_temperature, is_humidity → numeric_state
                    new_condition = {
                        "condition": "numeric_state",
                        "entity_id": resolved_entity,
                    }
                    # Preserve threshold values
                    if "below" in condition:
                        new_condition["below"] = condition["below"]
                    if "above" in condition:
                        new_condition["above"] = condition["above"]
                else:
                    # Generic device condition → state condition
                    new_condition = {
                        "condition": "state",
                        "entity_id": resolved_entity,
                    }
                    # Map type to expected state
                    if cond_type in ("is_on",):
                        new_condition["state"] = "on"
                    elif cond_type in ("is_off",):
                        new_condition["state"] = "off"
                
                changes.append({
                    "section": "condition",
                    "index": idx,
                    "to": new_condition,
                    "description": f"Condition {idx}: {domain}.{cond_type} → {new_condition['condition']}, entity_id: {resolved_entity}"
                })
            else:
                _LOGGER.warning("Cannot resolve entity for condition %d (device_id=%s)", idx, device_id)
        
        # --- ACTIONS ---
        action_key = "actions" if "actions" in automation_config else "action"
        actions = automation_config.get(action_key, [])
        if not isinstance(actions, list):
            actions = [actions] if actions else []
        
        for idx, action in enumerate(actions):
            if not isinstance(action, dict):
                continue

            # Case 1 : device_id directly on the action (device_action platform)
            if "device_id" in action:
                device_id = action["device_id"]
                domain = action.get("domain", "homeassistant")
                action_type = action.get("type", "toggle")
                _LOGGER.info("Action %d: device_id=%s, domain=%s, type=%s", idx, device_id, domain, action_type)
                
                resolved_entity = await self._resolve_entity_id(
                    device_id, action.get("entity_id"), domain
                )
                
                if resolved_entity:
                    service = f"{domain}.{action_type}"
                    new_action = {
                        "action": service,
                        "target": {"entity_id": resolved_entity}
                    }
                    if "data" in action:
                        new_action["data"] = action["data"]
                    
                    changes.append({
                        "section": "action",
                        "index": idx,
                        "to": new_action,
                        "description": f"Action {idx}: {service} → entity_id: {resolved_entity}"
                    })
                else:
                    _LOGGER.warning("Cannot resolve entity for action %d (device_id=%s)", idx, device_id)

            # Case 2 : device_id inside action["target"]["device_id"]  (device_id_in_target)
            elif isinstance(action.get("target"), dict) and "device_id" in action["target"]:
                device_id = action["target"]["device_id"]
                # Infer domain from the service/action field if available
                svc = action.get("service") or action.get("action", "")
                domain = svc.split(".")[0] if "." in svc else ""
                _LOGGER.info("Action %d target: device_id=%s, service=%s", idx, device_id, svc)
                
                resolved_entity = await self._resolve_entity_id(
                    device_id, action["target"].get("entity_id"), domain
                )
                
                if resolved_entity:
                    # Replace target.device_id with target.entity_id, keep everything else
                    import copy as _copy
                    new_action = _copy.deepcopy(action)
                    new_target = dict(new_action["target"])
                    del new_target["device_id"]
                    # Merge with existing entity_id if any (can be list or str)
                    existing = new_target.get("entity_id")
                    if existing:
                        if isinstance(existing, list):
                            new_target["entity_id"] = existing + [resolved_entity]
                        else:
                            new_target["entity_id"] = [existing, resolved_entity]
                    else:
                        new_target["entity_id"] = resolved_entity
                    new_action["target"] = new_target
                    
                    changes.append({
                        "section": "action",
                        "index": idx,
                        "to": new_action,
                        "description": f"Action {idx}: target.device_id → target.entity_id: {resolved_entity}"
                    })
                else:
                    _LOGGER.warning("Cannot resolve entity for action %d target (device_id=%s)", idx, device_id)
        
        # --- Generate YAML previews ---
        import copy
        current_yaml = yaml.dump(automation_config, default_flow_style=False, allow_unicode=True)
        
        new_config = copy.deepcopy(automation_config)
        
        # Apply all changes to the deep copy
        for change in changes:
            section = change["section"]
            idx = change["index"]
            
            if section == "trigger":
                key = trigger_key
            elif section == "condition":
                key = condition_key
            elif section == "action":
                key = action_key
            else:
                continue
            
            items = new_config.get(key, [])
            if not isinstance(items, list):
                items = [items] if items else []
            if idx < len(items):
                items[idx] = change["to"]
            new_config[key] = items
        
        new_yaml = yaml.dump(new_config, default_flow_style=False, allow_unicode=True)
        
        return {
            "success": True,
            "automation_id": automation_id,
            "alias": automation_config.get("alias", ""),
            "changes": changes,
            "changes_count": len(changes),
            "current_yaml": current_yaml,
            "new_yaml": new_yaml
        }

    async def apply_device_id_fix(self, automation_id: str, preview: dict = None, dry_run: bool = False) -> dict[str, Any]:
        """Apply device_id to entity_id conversion with backup."""
        
        # Get preview if not provided
        if not preview:
            preview = await self.preview_device_id_fix(automation_id)
        
        if not preview.get("success"):
            return preview
        
        if not preview.get("changes"):
            return {
                "success": False,
                "error": "No changes to apply"
            }
            
        if dry_run:
            return {
                "success": True,
                "automation_id": automation_id,
                "changes_applied": 0,
                "dry_run": True,
                "preview": preview,
                "message": "Dry run complete. No changes applied."
            }
        
        # Create backup
        backup_path = await self._create_backup()
        
        try:
            # Load all automations
            def read_automations():
                with open(self._automations_file, "r", encoding="utf-8") as f:
                    return yaml.safe_load(f) or []
            
            automations = await self.hass.async_add_executor_job(read_automations)
            
            # Find and modify the automation
            for automation in automations:
                if automation.get("id") == automation_id:
                    
                    # Apply changes per section
                    for change in preview["changes"]:
                        section = change["section"]
                        idx = change["index"]
                        
                        # Detect correct key for each section
                        if section == "trigger":
                            key = "triggers" if "triggers" in automation else "trigger"
                        elif section == "condition":
                            key = "conditions" if "conditions" in automation else "condition"
                        elif section == "action":
                            key = "actions" if "actions" in automation else "action"
                        else:
                            continue
                        
                        items = automation.get(key, [])
                        if not isinstance(items, list):
                            items = [items] if items else []
                        if idx < len(items):
                            items[idx] = change["to"]
                        automation[key] = items
                    
                    break
            
            # Save modified automations
            def write_automations():
                with open(self._automations_file, "w", encoding="utf-8") as f:
                    yaml.dump(automations, f, default_flow_style=False, allow_unicode=True)
            
            await self.hass.async_add_executor_job(write_automations)
            
            return {
                "success": True,
                "automation_id": automation_id,
                "changes_applied": len(preview["changes"]),
                "backup_path": str(backup_path),
                "message": "Changes applied successfully. Restart Home Assistant to apply."
            }
            
        except Exception as e:
            _LOGGER.error("Error applying fixes: %s", e)
            return {
                "success": False,
                "error": str(e),
                "backup_path": str(backup_path)
            }

    async def preview_mode_fix(self, automation_id: str, new_mode: str) -> dict[str, Any]:
        """Preview automation mode change."""
        
        valid_modes = ["single", "restart", "queued", "parallel"]
        if new_mode not in valid_modes:
            return {
                "success": False,
                "error": f"Invalid mode. Must be one of: {valid_modes}"
            }
        
        automation_config = await self._load_automation_by_id(automation_id)
        
        if not automation_config:
            return {
                "success": False,
                "error": f"Automation {automation_id} not found"
            }
        
        current_mode = automation_config.get("mode", "single")
        
        changes = [{
            "field": "mode",
            "from": current_mode,
            "to": new_mode,
            "description": f"Change mode from '{current_mode}' to '{new_mode}'"
        }]
        
        # Add max parameter for queued/parallel
        if new_mode in ["queued", "parallel"]:
            if "max" not in automation_config:
                changes.append({
                    "field": "max",
                    "from": None,
                    "to": 10,
                    "description": "Add max parameter (default: 10)"
                })
        
        # Generate YAML previews
        import copy
        current_yaml = yaml.dump(automation_config, default_flow_style=False, allow_unicode=True)
        
        # Create a deep copy to apply changes for preview
        new_config = copy.deepcopy(automation_config)
        new_config["mode"] = new_mode
        
        if new_mode in ["queued", "parallel"]:
            if "max" not in new_config:
                new_config["max"] = 10
                
        new_yaml = yaml.dump(new_config, default_flow_style=False, allow_unicode=True)
        
        return {
            "success": True,
            "automation_id": automation_id,
            "alias": automation_config.get("alias", ""),
            "changes": changes,
            "changes_count": len(changes),
            "current_yaml": current_yaml,
            "new_yaml": new_yaml
        }

    async def apply_mode_fix(self, automation_id: str, new_mode: str, dry_run: bool = False) -> dict[str, Any]:
        """Apply automation mode change with backup."""
        
        preview = await self.preview_mode_fix(automation_id, new_mode)
        
        if not preview.get("success"):
            return preview

        if dry_run:
            return {
                "success": True,
                "automation_id": automation_id,
                "new_mode": new_mode,
                "dry_run": True,
                "preview": preview,
                "message": "Dry run complete. No changes applied."
            }
        
        backup_path = await self._create_backup()
        
        try:
            def read_automations():
                with open(self._automations_file, "r", encoding="utf-8") as f:
                    return yaml.safe_load(f) or []
            
            automations = await self.hass.async_add_executor_job(read_automations)
            
            for automation in automations:
                if automation.get("id") == automation_id:
                    automation["mode"] = new_mode
                    
                    if new_mode in ["queued", "parallel"]:
                        if "max" not in automation:
                            automation["max"] = 10
                    
                    break
            
            def write_automations():
                with open(self._automations_file, "w", encoding="utf-8") as f:
                    yaml.dump(automations, f, default_flow_style=False, allow_unicode=True)
            
            await self.hass.async_add_executor_job(write_automations)
            
            return {
                "success": True,
                "automation_id": automation_id,
                "new_mode": new_mode,
                "backup_path": str(backup_path),
                "message": "Mode changed successfully. Restart Home Assistant to apply."
            }
            
        except Exception as e:
            _LOGGER.error("Error changing mode: %s", e)
            return {
                "success": False,
                "error": str(e),
                "backup_path": str(backup_path)
            }

    async def preview_template_fix(self, automation_id: str) -> dict[str, Any]:
        """Preview template to native condition conversion."""
        automation_config = await self._load_automation_by_id(automation_id)
        
        if not automation_config:
            return {"success": False, "error": f"Automation {automation_id} not found"}
            
        changes = []
        
        # Check conditions
        condition_key = "conditions" if "conditions" in automation_config else "condition"
        conditions = automation_config.get(condition_key, [])
        if not isinstance(conditions, list):
            conditions = [conditions] if conditions else []
            
        for idx, condition in enumerate(conditions):
            if not isinstance(condition, dict) or condition.get("condition") != "template":
                continue
                
            template = condition.get("value_template", "")
            parsed = self._parse_is_state_template(template)
            
            if parsed:
                new_condition = {
                    "condition": "state",
                    "entity_id": parsed["entity_id"],
                    "state": parsed["state"]
                }
                
                changes.append({
                    "section": "condition",
                    "index": idx,
                    "to": new_condition,
                    "description": f"Condition {idx}: Template → state condition ({parsed['entity_id']} is {parsed['state']})"
                })

        if not changes:
            return {"success": False, "error": "No simple template conditions found to fix"}

        # Generate YAML previews
        import copy
        current_yaml = yaml.dump(automation_config, default_flow_style=False, allow_unicode=True)
        new_config = copy.deepcopy(automation_config)
        
        for change in changes:
            idx = change["index"]
            items = new_config.get(condition_key, [])
            if idx < len(items):
                items[idx] = change["to"]
                
        new_yaml = yaml.dump(new_config, default_flow_style=False, allow_unicode=True)
        
        return {
            "success": True,
            "automation_id": automation_id,
            "alias": automation_config.get("alias", ""),
            "changes": changes,
            "changes_count": len(changes),
            "current_yaml": current_yaml,
            "new_yaml": new_yaml
        }

    async def apply_template_fix(self, automation_id: str, dry_run: bool = False) -> dict[str, Any]:
        """Apply template fix with backup."""
        preview = await self.preview_template_fix(automation_id)
        if not preview.get("success"):
            return preview

        if dry_run:
            return {
                "success": True,
                "automation_id": automation_id,
                "dry_run": True,
                "preview": preview,
                "message": "Dry run complete."
            }
            
        backup_path = await self._create_backup()
        
        try:
            def read_automations():
                with open(self._automations_file, "r", encoding="utf-8") as f:
                    return yaml.safe_load(f) or []
            
            automations = await self.hass.async_add_executor_job(read_automations)
            
            for automation in automations:
                if automation.get("id") == automation_id:
                    cond_key = "conditions" if "conditions" in automation else "condition"
                    items = automation.get(cond_key, [])
                    if not isinstance(items, list):
                        items = [items] if items else []
                        
                    for change in preview["changes"]:
                        idx = change["index"]
                        if idx < len(items):
                            items[idx] = change["to"]
                    automation[cond_key] = items
                    break
            
            def write_automations():
                with open(self._automations_file, "w", encoding="utf-8") as f:
                    yaml.dump(automations, f, default_flow_style=False, allow_unicode=True)
            
            await self.hass.async_add_executor_job(write_automations)
            
            return {
                "success": True,
                "automation_id": automation_id,
                "changes_applied": len(preview["changes"]),
                "backup_path": str(backup_path),
                "message": "Template fix applied successfully."
            }
        except Exception as e:
            _LOGGER.error("Error applying template fix: %s", e)
            return {"success": False, "error": str(e), "backup_path": str(backup_path)}

    def _parse_is_state_template(self, template: str) -> dict[str, str] | None:
        """Parse is_state('entity', 'state') from template string."""
        # Regex to match is_state('...', '...') or is_state("...", "...")
        # Supports optional spaces and different quote types
        pattern = r"is_state\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)"
        match = re.search(pattern, template)
        
        if match:
            return {
                "entity_id": match.group(1),
                "state": match.group(2)
            }
        return None

    async def list_backups(self) -> list[dict]:
        """List available backups."""
        
        if not self._backup_dir.exists():
            _LOGGER.debug("Backup directory does not exist: %s", self._backup_dir)
            return []
            
        def _scan_backups():
            results = []
            try:
                _LOGGER.debug("Scanning backups in: %s", self._backup_dir)
                for entry in self._backup_dir.iterdir():
                    if entry.is_file() and entry.name.startswith("automations_") and entry.name.endswith(".yaml"):
                        try:
                            stat = entry.stat()
                            # Parser la date depuis le nom de fichier (automations_YYYYMMDD_HHMMSS.yaml)
                            # Plus fiable que st_mtime qui reflète l'heure de copie/restauration
                            created_iso = datetime.fromtimestamp(stat.st_mtime).isoformat()
                            try:
                                stem = entry.stem  # ex: automations_20260224_182358
                                parts = stem.split("_", 1)
                                if len(parts) == 2:
                                    ts_str = parts[1].replace("_", "")  # 20260224182358
                                    if len(ts_str) == 14:
                                        parsed = datetime.strptime(ts_str, "%Y%m%d%H%M%S")
                                        created_iso = parsed.isoformat()
                            except Exception:
                                pass  # garder st_mtime si parsing impossible
                            results.append({
                                "path": str(entry.absolute()),
                                "name": entry.name,
                                "size": stat.st_size,
                                "created": created_iso,
                            })
                        except Exception as err:
                            _LOGGER.warning("Error reading backup file %s: %s", entry.name, err)
                            
                # Sort by reverse chronological order (newest first) based on created timestamp
                results.sort(key=lambda x: x["created"], reverse=True)
                return results[:10]
                
            except Exception as err:
                _LOGGER.error("Error scanning backup directory: %s", err)
                return []

        try:
            return await self.hass.async_add_executor_job(_scan_backups)
        except Exception as e:
            _LOGGER.error("Error listing backups: %s", e)
            return []

    async def restore_backup(self, backup_path: str) -> dict[str, Any]:
        """Restore automations from backup.

        Security: backup_path is validated to be inside the designated backup
        directory before any file operation, preventing path-traversal attacks.
        """
        backup_file = Path(backup_path)

        # ── Path-traversal guard ──────────────────────────────────────────────
        # Resolve both paths to their canonical (symlink-free) absolute forms,
        # then assert the backup file is inside _backup_dir.
        try:
            backup_file.resolve().relative_to(self._backup_dir.resolve())
        except ValueError:
            _LOGGER.warning(
                "restore_backup: rejected path outside backup dir: %s", backup_path
            )
            return {
                "success": False,
                "error": "Invalid backup path — file must be inside the HACA backup directory.",
            }

        if not backup_file.exists():
            return {
                "success": False,
                "error": "Backup file not found"
            }
        
        try:
            # Create backup of current state before restore
            pre_restore_backup = await self._create_backup()
            
            # Copy backup to automations.yaml
            def restore():
                import shutil
                shutil.copy2(backup_file, self._automations_file)
            
            await self.hass.async_add_executor_job(restore)
            
            return {
                "success": True,
                "restored_from": str(backup_file),
                "backup_before_restore": str(pre_restore_backup),
                "message": "Backup restored. Restart Home Assistant to apply."
            }
            
        except Exception as e:
            _LOGGER.error("Error restoring backup: %s", e)
            return {
                "success": False,
                "error": str(e)
            }

    async def create_backup(self) -> dict[str, Any]:
        """Create a manual backup."""
        try:
            backup_path = await self._create_backup()
            return {
                "success": True,
                "backup_path": str(backup_path),
                "message": f"Backup created: {backup_path.name}"
            }
        except Exception as e:
            _LOGGER.error("Error creating backup: %s", e)
            return {
                "success": False,
                "error": str(e)
            }

    async def delete_backup(self, backup_path: str) -> dict[str, Any]:
        """Delete a specific backup file."""
        backup_file = Path(backup_path)
        
        # Security check: ensure file is in backup directory
        try:
            backup_file.resolve().relative_to(self._backup_dir.resolve())
        except ValueError:
            return {
                "success": False,
                "error": "Invalid backup path - file must be in backup directory"
            }
        
        if not backup_file.exists():
            return {
                "success": False,
                "error": "Backup file not found"
            }
        
        try:
            def delete_file():
                backup_file.unlink()
            
            await self.hass.async_add_executor_job(delete_file)
            
            _LOGGER.info("Deleted backup: %s", backup_file)
            return {
                "success": True,
                "deleted_file": backup_file.name,
                "message": f"Backup deleted: {backup_file.name}"
            }
        except Exception as e:
            _LOGGER.error("Error deleting backup: %s", e)
            return {
                "success": False,
                "error": str(e)
            }

    async def _create_backup(self) -> Path:
        """Create backup of automations.yaml."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self._backup_dir / f"automations_{timestamp}.yaml"
        
        def create_backup():
            import shutil
            shutil.copy2(self._automations_file, backup_file)
        
        await self.hass.async_add_executor_job(create_backup)
        
        # Cleanup old backups (keep last 10)
        await self._cleanup_old_backups()
        
        _LOGGER.info("Created backup: %s", backup_file)
        return backup_file

    async def _cleanup_old_backups(self):
        """Keep only the last 10 backups (runs in executor to avoid blocking)."""
        def _do_cleanup():
            backups = sorted(self._backup_dir.glob("automations_*.yaml"), reverse=True)
            for old_backup in backups[10:]:
                try:
                    old_backup.unlink()
                    _LOGGER.debug("Deleted old backup: %s", old_backup)
                except Exception as e:
                    _LOGGER.warning("Failed to delete old backup %s: %s", old_backup, e)

        await self.hass.async_add_executor_job(_do_cleanup)

    async def _load_automation_by_id(self, automation_id: str) -> dict | None:
        """Load a specific automation configuration by ID, alias, or entity_id."""
        
        def read_automations():
            with open(self._automations_file, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or []
        
        try:
            automations = await self.hass.async_add_executor_job(read_automations)
            
            # 1. Search by precise 'id'
            for automation in automations:
                if automation.get("id") == automation_id:
                    return automation
            
            # 2. Search by 'alias' (common if 'id' is missing)
            for automation in automations:
                alias = automation.get("alias")
                if alias and (alias == automation_id or alias.lower().replace(" ", "_").replace(".", "_") == automation_id):
                    return automation
            
            # 3. Handle entity_id format (e.g., "automation.presence_entree_2")
            # Extract the automation name from entity_id and search by alias
            if automation_id.startswith("automation."):
                automation_name = automation_id.replace("automation.", "")
                
                # Try to find by alias that matches the entity name
                for automation in automations:
                    alias = automation.get("alias")
                    if alias:
                        generated_alias = alias.lower().replace(' ', '_').replace('-', '_')
                        if generated_alias == automation_name:
                            return automation
                
                # Try to find by exact alias match
                for automation in automations:
                    alias = automation.get("alias")
                    if alias and alias.lower() == automation_name.lower():
                        return automation
            
            # 4. Handle "unknown" entity_id fallback (fix for the reported issue)
            # If automation_id looks like "automation.unknown_123456", try to find by the original ID
            if automation_id.startswith("automation.unknown_"):
                # Extract the original ID or index from the unknown string
                original_part = automation_id.replace("automation.unknown_", "")
                
                # Try to find automation by original ID
                for automation in automations:
                    if automation.get("id") == original_part:
                        return automation
                
                # Try to find automation by alias that matches the original part
                for automation in automations:
                    alias = automation.get("alias")
                    if alias:
                        generated_alias = alias.lower().replace(' ', '_').replace('-', '_')
                        if generated_alias == original_part:
                            return automation
                
                # Try to parse as index (if it's a number)
                try:
                    index = int(original_part)
                    if 0 <= index < len(automations):
                        return automations[index]
                except ValueError:
                    pass
            
            # 5. Try to resolve via entity registry (if automation_id is an entity_id)
            if automation_id.startswith("automation."):
                entity_reg = er.async_get(self.hass)
                entity_entry = entity_reg.async_get(automation_id)
                if entity_entry and entity_entry.unique_id:
                    # Search by unique_id (which should match the automation's id in YAML)
                    for automation in automations:
                        if automation.get("id") == entity_entry.unique_id:
                            return automation
            
            return None
            
        except Exception as e:
            _LOGGER.error("Error loading automation: %s", e)
            return None

    async def _get_entities_for_device(self, device_id: str) -> list[str]:
        """Get entity IDs for a device."""
        entity_reg = er.async_get(self.hass)
        
        entities = []
        for entity in entity_reg.entities.values():
            if entity.device_id == device_id:
                entities.append(entity.entity_id)
        
        return entities

    async def _resolve_entity_id(self, device_id: str, registry_uuid: str | None, domain: str = "") -> str | None:
        """Resolve an entity from device_id + registry UUID + domain.
        
        HA device automations store entity references as UUID registry entry IDs,
        not as human-readable entity_id strings. This method resolves to the actual
        entity_id string using a 3-step approach:
        1. Try to find the entity by its UUID in the entity registry
        2. Filter device entities by domain to pick the correct one
        3. Fallback to any entity for the device
        """
        entity_reg = er.async_get(self.hass)
        
        # Step 1: Try to resolve UUID → entity_id
        if registry_uuid:
            # Check if it's already a real entity_id (contains a dot like "binary_sensor.xxx")
            if "." in registry_uuid:
                return registry_uuid
            
            # It's a UUID — look it up in the registry
            for entity in entity_reg.entities.values():
                if entity.id == registry_uuid:
                    _LOGGER.info("Resolved UUID %s → %s", registry_uuid, entity.entity_id)
                    return entity.entity_id
            
            _LOGGER.warning("UUID %s not found in entity registry", registry_uuid)
        
        # Step 2: Get all entities for this device, filter by domain
        all_entities = await self._get_entities_for_device(device_id)
        
        if not all_entities:
            _LOGGER.warning("No entities found for device_id %s", device_id)
            return None
        
        if domain:
            # Filter by domain (e.g., "binary_sensor", "sensor", "light")
            domain_entities = [e for e in all_entities if e.startswith(f"{domain}.")]
            if domain_entities:
                _LOGGER.info("Resolved device %s + domain %s → %s", device_id, domain, domain_entities[0])
                return domain_entities[0]
        
        # Step 3: Fallback to first entity
        _LOGGER.info("Fallback: using first entity for device %s → %s", device_id, all_entities[0])
        return all_entities[0]

    async def get_fuzzy_suggestions(self, broken_entity_id: str) -> list[str]:
        """Get similar entity IDs for a broken reference."""
        all_entities = [e.entity_id for e in self.hass.states.async_all()]
        
        # Also check registry for potentially disabled ones
        entity_reg = er.async_get(self.hass)
        all_entities.extend([e.entity_id for e in entity_reg.entities.values() if e.entity_id not in all_entities])
        
        return difflib.get_close_matches(broken_entity_id, all_entities, n=3, cutoff=0.6)

    async def apply_zombie_entity_fix(
        self,
        automation_id: str,
        old_entity_id: str,
        new_entity_id: str = "",
    ) -> dict[str, Any]:
        """Replace or remove a zombie entity reference inside an automation.

        Parameters
        ----------
        automation_id:
            The automation 'id' field or entity_id (e.g. "automation.my_auto").
        old_entity_id:
            The non-existent entity to remove/replace (e.g. "light.evier").
        new_entity_id:
            Replacement entity. Empty string = remove the reference.
        """
        try:
            config = await self._load_automation_by_id(automation_id)
            if not config:
                return {"success": False, "error": f"Automation not found: {automation_id}"}

            backup_path = await self._create_backup()
            _LOGGER.info("Backup created before zombie fix: %s", backup_path)

            changed = self._replace_entity_in_config(config, old_entity_id, new_entity_id)
            if not changed:
                return {"success": False, "error": f"{old_entity_id} not found in automation config"}

            # Save back to automations.yaml
            def read_and_write():
                with open(self._automations_file, "r", encoding="utf-8") as f:
                    automations = yaml.safe_load(f) or []
                # Replace the matching automation in the list
                auto_id = config.get("id")
                alias   = config.get("alias")
                for i, auto in enumerate(automations):
                    if (auto_id and auto.get("id") == auto_id) or                        (alias and auto.get("alias") == alias):
                        automations[i] = config
                        break
                with open(self._automations_file, "w", encoding="utf-8") as f:
                    yaml.dump(automations, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

            await self.hass.async_add_executor_job(read_and_write)

            # Reload automations so the change takes effect in HA
            await self.hass.services.async_call(
                "automation", "reload", blocking=True
            )

            action = f"replaced with {new_entity_id}" if new_entity_id else "removed"
            return {
                "success": True,
                "message": f"Reference to {old_entity_id} {action} in {config.get('alias') or automation_id}",
                "backup_path": str(backup_path),
            }

        except Exception as exc:
            _LOGGER.error("apply_zombie_entity_fix error: %s", exc)
            return {"success": False, "error": str(exc)}

    def _replace_entity_in_config(
        self, config: dict, old_entity_id: str, new_entity_id: str
    ) -> bool:
        """Walk the automation config dict/list tree and replace entity references.

        Returns True if at least one substitution was made.
        """
        changed = False

        def walk(obj):
            nonlocal changed
            if isinstance(obj, dict):
                for key in list(obj.keys()):
                    if key in ("entity_id",):
                        val = obj[key]
                        if isinstance(val, list):
                            if old_entity_id in val:
                                changed = True
                                if new_entity_id:
                                    obj[key] = [new_entity_id if e == old_entity_id else e for e in val]
                                else:
                                    obj[key] = [e for e in val if e != old_entity_id]
                                    if not obj[key]:
                                        del obj[key]
                        elif val == old_entity_id:
                            changed = True
                            if new_entity_id:
                                obj[key] = new_entity_id
                            else:
                                del obj[key]
                    else:
                        walk(obj[key])
            elif isinstance(obj, list):
                for item in obj:
                    walk(item)

        walk(config)
        return changed

    async def purge_orphaned_entities(self, dry_run: bool = True) -> dict[str, Any]:
        """Purge entities from registry that have no backing integration."""
        entity_reg = er.async_get(self.hass)
        orphaned = []
        
        for entry in list(entity_reg.entities.values()):
            if entry.config_entry_id:
                config_entry = self.hass.config_entries.async_get_entry(entry.config_entry_id)
                if config_entry is None or config_entry.state.recoverable is False:
                    orphaned.append(entry.entity_id)
                    if not dry_run:
                        entity_reg.async_remove(entry.entity_id)
                        _LOGGER.info("Removed orphaned entity: %s", entry.entity_id)
                        
        return {
            "success": True,
            "purged_count": len(orphaned),
            "entities": orphaned,
            "dry_run": dry_run
        }

    async def suggest_description_ai(self, entity_id: str) -> dict[str, Any]:
        """Get an AI-suggested description for an automation or script."""
        is_script = entity_id.startswith("script.")
        
        if is_script:
            config = await self._load_script_by_entity_id(entity_id)
        else:
            # For automations, we need to resolve the entity_id to the YAML 'id'
            registry = er.async_get(self.hass)
            entry = registry.async_get(entity_id)
            automation_id = None
            
            if entry and entry.unique_id:
                automation_id = entry.unique_id
            else:
                automation_id = entity_id.replace("automation.", "")

            config = await self._load_automation_by_id(automation_id)
            
            # Second attempt: if not found, try by alias mapping (as slug)
            if not config:
                config = await self._load_automation_by_id(entity_id.replace("automation.", ""))
            
        if not config:
            return {"success": False, "error": f"Configuration not found for {entity_id}"}
            
        alias = config.get("alias", entity_id)
        
        # Prepare content for prompt
        if is_script:
            triggers_part = "Actions (Script) :"
            triggers_yaml = yaml.dump(config.get("sequence", []), default_flow_style=False, allow_unicode=True)
            actions_part = ""
            actions_yaml = ""
        else:
            triggers_part = "Déclencheurs (YAML) :"
            triggers_yaml = yaml.dump(config.get("trigger", []) or config.get("triggers", []), default_flow_style=False, allow_unicode=True)
            actions_part = "Actions (YAML) :"
            actions_yaml = yaml.dump(config.get("action", []) or config.get("actions", []), default_flow_style=False, allow_unicode=True)

        # Build the full YAML block from triggers + actions parts
        yaml_block = (triggers_yaml + "\n" + actions_yaml).strip()[:4000] or "(YAML non disponible)"

        _lang = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        import json as _j; from pathlib import Path as _pp
        try:
            _ap = _j.loads((_pp(__file__).parent / "translations" / f"{_lang}.json").read_text(encoding="utf-8")).get("ai_prompts", {})
        except Exception:
            _ap = {}
        prompt = _ap.get("description_suggest_system", "Suggest a short description for: {yaml}").format(yaml=yaml_block)

        # ── Call AI ────────────────────────────────────────────────────────────
        suggestion = ""
        try:
            from .conversation import _async_call_ai
            raw = await _async_call_ai(self.hass, prompt, "HACA Description Suggest")
            if raw:
                # Extract content from ```suggestion ... ``` block if present, else use raw
                import re as _re
                m = _re.search(r"```suggestion\s*(.*?)\s*```", raw, _re.DOTALL)
                suggestion = m.group(1).strip() if m else raw.strip()
        except Exception as ai_err:
            _LOGGER.warning("suggest_description_ai AI call failed: %s", ai_err)

        if not suggestion:
            # Fallback: use alias as base suggestion
            suggestion = alias

        return {
            "success": True,
            "entity_id": entity_id,
            "alias": alias,
            "suggestion": suggestion,
        }
