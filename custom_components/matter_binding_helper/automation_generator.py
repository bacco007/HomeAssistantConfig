"""Automation generator for Matter Binding Helper.

Generates Home Assistant automation configurations based on Matter device
combinations that can't use direct bindings.
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Any

from homeassistant.core import HomeAssistant

from .matter.ha_registry import get_ha_device_info

_LOGGER = logging.getLogger(__name__)


class AutomationErrorType(str, Enum):
    """Error types for automation creation."""

    SUCCESS = "success"
    ENTITY_NOT_FOUND = "entity_not_found"
    TEMPLATE_NOT_FOUND = "template_not_found"
    CREATION_FAILED = "creation_failed"
    INVALID_CONFIG = "invalid_config"
    NODE_NOT_FOUND = "node_not_found"


@dataclass
class EntityInfo:
    """Information about a Home Assistant entity."""

    entity_id: str
    name: str
    domain: str
    disabled: bool = False


@dataclass
class AutomationResult:
    """Result of automation creation or preview."""

    success: bool
    automation_id: str | None = None
    automation_config: dict[str, Any] | None = None
    available_entities: dict[str, list[dict[str, Any]]] | None = None
    message: str = ""
    error_code: AutomationErrorType | None = None


# Device type to preferred entity domain mapping
# Key: Matter device type ID
# Value: List of preferred domains in priority order
DEVICE_TYPE_DOMAIN_MAP: dict[int, list[str]] = {
    # Lights
    256: ["light"],  # On/Off Light
    257: ["light"],  # Dimmable Light
    258: ["light"],  # Color Temperature Light
    268: ["light"],  # Color Temperature Light (extended)
    269: ["light"],  # Extended Color Light
    # Switches/Plugs
    266: ["switch", "light"],  # On/Off Plug
    267: ["switch", "light"],  # Dimmable Plug
    # Sensors
    21: ["binary_sensor"],  # Contact Sensor
    263: ["binary_sensor"],  # Occupancy Sensor
    770: ["sensor"],  # Temperature Sensor
    771: ["sensor"],  # Humidity Sensor
    # Climate
    769: ["climate"],  # Thermostat
    # Generic Switch (buttons)
    15: ["event", "sensor"],  # Generic Switch - produces events
}


# Template configurations
# Each template defines how to generate triggers and actions
TEMPLATE_CONFIGS: dict[str, dict[str, Any]] = {
    "light-occupancy": {
        "trigger_domain": "binary_sensor",
        "trigger_to": "on",
        "action_domain": "light",
        "action_service": "turn_on",
        "description": "Turn on {action_name} when motion detected on {trigger_name}",
    },
    "thermostat-contact-window": {
        "trigger_domain": "binary_sensor",
        "trigger_to": "on",
        "action_domain": "climate",
        "action_service": "set_hvac_mode",
        "action_data": {"hvac_mode": "off"},
        "description": "Turn off {action_name} when {trigger_name} opens",
    },
    "thermostat-occupancy": {
        "trigger_domain": "binary_sensor",
        "trigger_to": "off",
        "trigger_for": {"minutes": 10},
        "action_domain": "climate",
        "action_service": "set_temperature",
        "action_data_template": {
            "temperature": "{{ state_attr('{action_entity}', 'temperature') | float - 3 }}"
        },
        "description": "Lower {action_name} temperature when {trigger_name} shows no occupancy",
    },
    "light-contact-door": {
        "trigger_domain": "binary_sensor",
        "trigger_to": "on",
        "action_domain": "light",
        "action_service": "turn_on",
        "description": "Turn on {action_name} when {trigger_name} opens",
    },
    "plug-occupancy": {
        "trigger_domain": "binary_sensor",
        "trigger_to": "on",
        "action_domain": "switch",
        "action_service": "turn_on",
        "description": "Turn on {action_name} when motion detected on {trigger_name}",
    },
    "button-light-toggle": {
        "trigger_domain": "event",
        "trigger_type": "state",
        "action_domain": "light",
        "action_service": "toggle",
        "description": "Toggle {action_name} when {trigger_name} is pressed",
    },
    "button-plug-toggle": {
        "trigger_domain": "event",
        "trigger_type": "state",
        "action_domain": "switch",
        "action_service": "toggle",
        "description": "Toggle {action_name} when {trigger_name} is pressed",
    },
    "button-scene": {
        "trigger_domain": "event",
        "trigger_type": "state",
        "action_domain": "scene",
        "action_service": "turn_on",
        "description": "Activate scene when {trigger_name} is pressed",
    },
    "button-thermostat-adjust": {
        "trigger_domain": "event",
        "trigger_type": "state",
        "action_domain": "climate",
        "action_service": "set_temperature",
        "action_data_template": {
            "temperature": "{{ state_attr('{action_entity}', 'temperature') | float + 1 }}"
        },
        "description": "Adjust {action_name} temperature when {trigger_name} is pressed",
    },
}


def resolve_entities_for_device(
    hass: HomeAssistant,
    node_id: int,
    preferred_domains: list[str] | None = None,
) -> list[EntityInfo]:
    """Resolve available entities for a Matter device.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        preferred_domains: Optional list of domains to filter by

    Returns:
        List of EntityInfo objects for available entities
    """
    # Get HA device info for this node
    device_info = get_ha_device_info(hass, node_id)

    if not device_info.get("ha_device_id"):
        _LOGGER.debug("No HA device found for node %s", node_id)
        return []

    entities = device_info.get("entities", [])
    result: list[EntityInfo] = []

    for entity in entities:
        entity_domain = entity.get("domain", "")

        # Filter by preferred domains if specified
        if preferred_domains and entity_domain not in preferred_domains:
            continue

        result.append(
            EntityInfo(
                entity_id=entity.get("entity_id", ""),
                name=entity.get("name", entity.get("entity_id", "Unknown")),
                domain=entity_domain,
                disabled=entity.get("disabled", False),
            )
        )

    # Sort by: non-disabled first, then by preferred domain order
    if preferred_domains:

        def sort_key(e: EntityInfo) -> tuple[int, int, str]:
            disabled_rank = 1 if e.disabled else 0
            try:
                domain_rank = preferred_domains.index(e.domain)
            except ValueError:
                domain_rank = len(preferred_domains)
            return (disabled_rank, domain_rank, e.entity_id)

        result.sort(key=sort_key)
    else:
        # Just sort by disabled status
        result.sort(key=lambda e: (1 if e.disabled else 0, e.entity_id))

    return result


def get_preferred_domains_for_template(template_id: str, role: str) -> list[str] | None:
    """Get preferred entity domains for a template role.

    Args:
        template_id: The template ID
        role: Either "trigger" or "action"

    Returns:
        List of preferred domains or None
    """
    config = TEMPLATE_CONFIGS.get(template_id)
    if not config:
        return None

    if role == "trigger":
        return [config.get("trigger_domain", "")]
    elif role == "action":
        domain = config.get("action_domain", "")
        # For light templates, also accept switch entities
        if domain == "light":
            return ["light", "switch"]
        elif domain == "switch":
            return ["switch", "light"]
        return [domain]

    return None


def generate_automation_config(
    template_id: str,
    trigger_entity: EntityInfo,
    action_entity: EntityInfo,
    alias: str | None = None,
) -> dict[str, Any] | None:
    """Generate a Home Assistant automation configuration.

    Args:
        template_id: The template ID to use
        trigger_entity: Entity info for the trigger
        action_entity: Entity info for the action target
        alias: Optional custom name for the automation

    Returns:
        Automation configuration dict or None if template not found
    """
    config = TEMPLATE_CONFIGS.get(template_id)
    if not config:
        _LOGGER.error("Unknown template ID: %s", template_id)
        return None

    # Generate unique ID
    automation_id = f"mbh_{template_id}_{uuid.uuid4().hex[:8]}"

    # Generate alias/description
    description = config.get("description", "{trigger_name} → {action_name}")
    generated_alias = description.format(
        trigger_name=trigger_entity.name,
        action_name=action_entity.name,
        trigger_entity=trigger_entity.entity_id,
        action_entity=action_entity.entity_id,
    )

    # Build trigger
    trigger: dict[str, Any] = {}

    if config.get("trigger_domain") == "event":
        # Event entity trigger (for Generic Switch)
        trigger = {
            "trigger": "state",
            "entity_id": trigger_entity.entity_id,
        }
    else:
        # State trigger (for sensors)
        trigger = {
            "trigger": "state",
            "entity_id": trigger_entity.entity_id,
        }
        if "trigger_to" in config:
            trigger["to"] = config["trigger_to"]
        if "trigger_for" in config:
            trigger["for"] = config["trigger_for"]

    # Build action
    action_service = f"{config['action_domain']}.{config['action_service']}"

    # Adjust service if entity domain doesn't match action domain
    if action_entity.domain != config["action_domain"]:
        if action_entity.domain in ["light", "switch"]:
            action_service = f"{action_entity.domain}.{config['action_service']}"

    action: dict[str, Any] = {
        "action": action_service,
        "target": {"entity_id": action_entity.entity_id},
    }

    # Add action data if specified
    if "action_data" in config:
        action["data"] = config["action_data"]
    elif "action_data_template" in config:
        # Replace placeholders in template data
        data = {}
        for key, value in config["action_data_template"].items():
            if isinstance(value, str):
                data[key] = value.format(
                    action_entity=action_entity.entity_id,
                    trigger_entity=trigger_entity.entity_id,
                )
            else:
                data[key] = value
        action["data"] = data

    # Build full automation config
    automation_config: dict[str, Any] = {
        "id": automation_id,
        "alias": alias or generated_alias,
        "description": f"Created by Matter Binding Helper ({template_id})",
        "triggers": [trigger],
        "actions": [action],
        "mode": "single",
        "initial_state": False,  # Disabled by default per user preference
    }

    return automation_config


async def create_automation(
    hass: HomeAssistant,
    config: dict[str, Any],
) -> tuple[bool, str | None, str]:
    """Create an automation in Home Assistant.

    Uses the automation config store to create automations.

    Args:
        hass: Home Assistant instance
        config: Automation configuration dict

    Returns:
        Tuple of (success, automation_id, message)
    """
    try:
        # Use the config store to add the automation
        # This is the internal API used by HA's automation editor
        from homeassistant.components.automation.config import (
            async_get_config_store,
        )

        store = async_get_config_store(hass)

        # Get existing automations
        automations = await store.async_load() or []

        # Add new automation
        automations.append(config)

        # Save to store
        await store.async_save(automations)

        # Reload automations to pick up changes
        await hass.services.async_call("automation", "reload", blocking=True)

        automation_id = config.get("id", "")
        _LOGGER.info(
            "Created automation '%s' with ID %s",
            config.get("alias"),
            automation_id,
        )

        return True, automation_id, "Automation created successfully"

    except ImportError:
        # Fallback: Try writing to automations.yaml
        _LOGGER.warning("Could not use config store, attempting YAML fallback")
        return await _create_automation_yaml_fallback(hass, config)
    except Exception as err:
        _LOGGER.error("Failed to create automation: %s", err)
        return False, None, f"Failed to create automation: {err}"


async def _create_automation_yaml_fallback(
    hass: HomeAssistant,
    config: dict[str, Any],
) -> tuple[bool, str | None, str]:
    """Fallback method to create automation via YAML file.

    Args:
        hass: Home Assistant instance
        config: Automation configuration dict

    Returns:
        Tuple of (success, automation_id, message)
    """
    import os

    import yaml

    yaml_path = hass.config.path("automations.yaml")

    try:
        automations = []

        # Load existing automations
        if os.path.exists(yaml_path):
            with open(yaml_path, encoding="utf-8") as f:
                content = yaml.safe_load(f)
                if content:
                    automations = content if isinstance(content, list) else [content]

        # Add new automation
        automations.append(config)

        # Write back
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(automations, f, default_flow_style=False, allow_unicode=True)

        # Reload automations
        await hass.services.async_call("automation", "reload", blocking=True)

        automation_id = config.get("id", "")
        return True, automation_id, "Automation created successfully (YAML fallback)"

    except Exception as err:
        _LOGGER.error("YAML fallback failed: %s", err)
        return False, None, f"Failed to create automation: {err}"


async def preview_automation(
    hass: HomeAssistant,
    template_id: str,
    source_node_id: int,
    source_device_types: list[int],
    target_node_id: int,
    target_device_types: list[int],
    trigger_entity_id: str | None = None,
    action_entity_id: str | None = None,
    alias: str | None = None,
) -> AutomationResult:
    """Preview an automation configuration without creating it.

    Args:
        hass: Home Assistant instance
        template_id: The template ID to use
        source_node_id: Node ID of the source device (action target)
        source_device_types: Device types of the source
        target_node_id: Node ID of the target device (trigger source)
        target_device_types: Device types of the target
        trigger_entity_id: Optional specific trigger entity
        action_entity_id: Optional specific action entity
        alias: Optional custom name

    Returns:
        AutomationResult with config and available entities
    """
    # Check template exists
    if template_id not in TEMPLATE_CONFIGS:
        return AutomationResult(
            success=False,
            message=f"Unknown template: {template_id}",
            error_code=AutomationErrorType.TEMPLATE_NOT_FOUND,
        )

    # Get preferred domains for trigger and action
    trigger_domains = get_preferred_domains_for_template(template_id, "trigger")
    action_domains = get_preferred_domains_for_template(template_id, "action")

    # Resolve available entities
    # Note: For automation templates, "source" is the action target (light/plug/thermostat)
    # and "target" is the trigger source (sensor/switch)
    trigger_entities = resolve_entities_for_device(
        hass, target_node_id, trigger_domains
    )
    action_entities = resolve_entities_for_device(hass, source_node_id, action_domains)

    # Format available entities for response
    available_entities = {
        "trigger": [
            {
                "entity_id": e.entity_id,
                "name": e.name,
                "domain": e.domain,
                "disabled": e.disabled,
            }
            for e in trigger_entities
        ],
        "action": [
            {
                "entity_id": e.entity_id,
                "name": e.name,
                "domain": e.domain,
                "disabled": e.disabled,
            }
            for e in action_entities
        ],
    }

    # Select entities (use specified or first available)
    trigger_entity: EntityInfo | None = None
    action_entity: EntityInfo | None = None

    if trigger_entity_id:
        trigger_entity = next(
            (e for e in trigger_entities if e.entity_id == trigger_entity_id),
            None,
        )
    elif trigger_entities:
        # Use first non-disabled entity
        trigger_entity = next(
            (e for e in trigger_entities if not e.disabled),
            trigger_entities[0] if trigger_entities else None,
        )

    if action_entity_id:
        action_entity = next(
            (e for e in action_entities if e.entity_id == action_entity_id),
            None,
        )
    elif action_entities:
        # Use first non-disabled entity
        action_entity = next(
            (e for e in action_entities if not e.disabled),
            action_entities[0] if action_entities else None,
        )

    # Check if we have required entities
    if not trigger_entity:
        return AutomationResult(
            success=False,
            available_entities=available_entities,
            message="No suitable trigger entity found",
            error_code=AutomationErrorType.ENTITY_NOT_FOUND,
        )

    if not action_entity:
        return AutomationResult(
            success=False,
            available_entities=available_entities,
            message="No suitable action entity found",
            error_code=AutomationErrorType.ENTITY_NOT_FOUND,
        )

    # Generate automation config
    automation_config = generate_automation_config(
        template_id, trigger_entity, action_entity, alias
    )

    if not automation_config:
        return AutomationResult(
            success=False,
            available_entities=available_entities,
            message="Failed to generate automation config",
            error_code=AutomationErrorType.INVALID_CONFIG,
        )

    return AutomationResult(
        success=True,
        automation_config=automation_config,
        available_entities=available_entities,
        message="Automation config generated successfully",
    )


async def create_automation_from_template(
    hass: HomeAssistant,
    template_id: str,
    source_node_id: int,
    source_device_types: list[int],
    target_node_id: int,
    target_device_types: list[int],
    trigger_entity_id: str | None = None,
    action_entity_id: str | None = None,
    alias: str | None = None,
) -> AutomationResult:
    """Create an automation from a template.

    Args:
        hass: Home Assistant instance
        template_id: The template ID to use
        source_node_id: Node ID of the source device (action target)
        source_device_types: Device types of the source
        target_node_id: Node ID of the target device (trigger source)
        target_device_types: Device types of the target
        trigger_entity_id: Optional specific trigger entity
        action_entity_id: Optional specific action entity
        alias: Optional custom name

    Returns:
        AutomationResult with creation status
    """
    # First generate preview
    result = await preview_automation(
        hass,
        template_id,
        source_node_id,
        source_device_types,
        target_node_id,
        target_device_types,
        trigger_entity_id,
        action_entity_id,
        alias,
    )

    if not result.success or not result.automation_config:
        return result

    # Create the automation
    success, automation_id, message = await create_automation(
        hass, result.automation_config
    )

    return AutomationResult(
        success=success,
        automation_id=automation_id,
        automation_config=result.automation_config,
        available_entities=result.available_entities,
        message=message,
        error_code=None if success else AutomationErrorType.CREATION_FAILED,
    )
