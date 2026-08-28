"""
Health Bridge Diagnostics

This script helps diagnose issues with the Health Bridge integration.
Run it in the Home Assistant Python environment.

Usage:
- Copy this script to your Home Assistant config directory
- Run it using the Home Assistant Console: python3 health_bridge_diagnostics.py
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime

# Setup path for Home Assistant
config_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(f"{config_dir}/deps")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
_LOGGER = logging.getLogger(__name__)

DOMAIN = "health_bridge"

async def async_check_config_entries(hass):
    """Check if the integration is configured."""
    from homeassistant.loader import async_get_integration
    from homeassistant.helpers import config_entry_flow

    try:
        integration = await async_get_integration(hass, DOMAIN)
        if not integration:
            _LOGGER.error("Health Bridge integration is not installed")
            return False

        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("Health Bridge integration is not configured")
            return False

        _LOGGER.info(f"Found {len(entries)} Health Bridge configuration entries")
        for entry in entries:
            _LOGGER.info(f"Entry ID: {entry.entry_id}, Title: {entry.title}, State: {entry.state}")
            _LOGGER.info(f"Data: {entry.data}")

        return True
    except Exception as e:
        _LOGGER.error(f"Error checking config entries: {e}")
        return False

async def async_check_entities(hass):
    """Check for Health Bridge entities."""
    try:
        states = hass.states.async_all()
        health_bridge_entities = [state for state in states if state.entity_id.startswith("sensor.") and 
                                 DOMAIN in (state.attributes.get("integration") or "")]

        if not health_bridge_entities:
            _LOGGER.warning("No Health Bridge entities found in state machine")
            
            # Check entity registry for any registered but not active entities
            from homeassistant.helpers import entity_registry as er
            registry = er.async_get(hass)
            registered_entities = [entry for entry in registry.entities.values() 
                                 if entry.platform == DOMAIN]
            
            if registered_entities:
                _LOGGER.info(f"Found {len(registered_entities)} entities in registry but not active:")
                for entry in registered_entities:
                    _LOGGER.info(f"Entity ID: {entry.entity_id}, Unique ID: {entry.unique_id}")
            else:
                _LOGGER.error("No Health Bridge entities found in registry either")
            
            return False
        
        _LOGGER.info(f"Found {len(health_bridge_entities)} Health Bridge entities")
        for state in health_bridge_entities:
            _LOGGER.info(f"Entity: {state.entity_id}, State: {state.state}")
            _LOGGER.info(f"Attributes: {state.attributes}")
        
        return True
    except Exception as e:
        _LOGGER.error(f"Error checking entities: {e}")
        return False

async def async_check_webhooks(hass):
    """Check configured webhooks."""
    try:
        from homeassistant.components import webhook
        
        hooks = webhook.async_get_webhooks(hass)
        health_bridge_hooks = [hook for hook in hooks if hook["domain"] == DOMAIN]
        
        if not health_bridge_hooks:
            _LOGGER.error("No Health Bridge webhooks found")
            return False
        
        _LOGGER.info(f"Found {len(health_bridge_hooks)} Health Bridge webhooks")
        for hook in health_bridge_hooks:
            _LOGGER.info(f"Webhook ID: {hook['webhook_id']}, Name: {hook['name']}")
            
            # Generate URL for this webhook
            url = webhook.async_generate_url(hass, hook["webhook_id"])
            _LOGGER.info(f"Webhook URL: {url}")
        
        return True
    except Exception as e:
        _LOGGER.error(f"Error checking webhooks: {e}")
        return False

async def async_check_component_setup(hass):
    """Check if component is properly set up in hass.data."""
    try:
        if DOMAIN not in hass.data:
            _LOGGER.error(f"{DOMAIN} not found in hass.data")
            return False
        
        _LOGGER.info(f"{DOMAIN} found in hass.data")
        for entry_id, data in hass.data[DOMAIN].items():
            _LOGGER.info(f"Entry ID: {entry_id}")
            
            # Check for token
            if "token" in data:
                _LOGGER.info("Token is configured")
            
            # Check for entities
            if "entities" in data:
                _LOGGER.info(f"Entities dictionary contains {len(data['entities'])} entries")
                for entity_id, entity in data["entities"].items():
                    _LOGGER.info(f"Entity: {entity_id}")
            else:
                _LOGGER.warning("No entities dictionary found")
            
            # Check for pending updates
            if "pending_updates" in data:
                pending = data["pending_updates"]
                if pending:
                    _LOGGER.info(f"Pending updates for users: {list(pending.keys())}")
                    for user_id, metrics in pending.items():
                        _LOGGER.info(f"User {user_id} has pending metrics: {list(metrics.keys())}")
                else:
                    _LOGGER.info("No pending updates")
            else:
                _LOGGER.warning("No pending_updates dictionary found")
            
            # Check for async_add_entities
            if "async_add_entities" in data:
                _LOGGER.info("async_add_entities function is available")
            else:
                _LOGGER.warning("async_add_entities function is NOT available, entity creation may fail")
        
        return True
    except Exception as e:
        _LOGGER.error(f"Error checking component setup: {e}")
        return False

async def async_create_test_entity(hass):
    """Create a test entity to verify entity creation works."""
    try:
        from homeassistant.helpers import entity_registry as er
        
        # Get the entity registry
        registry = er.async_get(hass)
        
        # Create a test entity
        unique_id = f"{DOMAIN}_test_entity_{int(datetime.now().timestamp())}"
        entity_id = f"sensor.health_bridge_test_{int(datetime.now().timestamp())}"
        
        # First try to register the entity
        entry = registry.async_get_or_create(
            domain="sensor",
            platform=DOMAIN,
            unique_id=unique_id,
            suggested_object_id=entity_id.split(".", 1)[1],
        )
        
        _LOGGER.info(f"Test entity registered: {entry.entity_id}")
        
        # Now set its state
        hass.states.async_set(
            entry.entity_id,
            "Test Value",
            {
                "friendly_name": "Health Bridge Test Entity",
                "unit_of_measurement": "units",
                "icon": "mdi:test-tube",
            },
        )
        
        _LOGGER.info(f"Test entity state set for {entry.entity_id}")
        return True
    except Exception as e:
        _LOGGER.error(f"Error creating test entity: {e}")
        return False

async def async_fix_common_issues(hass):
    """Try to fix common issues with the integration."""
    try:
        # Check if there are pending updates that haven't been processed
        fixed = False
        
        if DOMAIN not in hass.data:
            _LOGGER.error(f"{DOMAIN} not found in hass.data, cannot fix issues")
            return False
        
        for entry_id, data in hass.data[DOMAIN].items():
            # Check for pending updates that need processing
            if "pending_updates" in data and data["pending_updates"]:
                _LOGGER.info(f"Found pending updates for entry {entry_id}, attempting to process them")
                
                if "async_add_entities" in data and data["async_add_entities"]:
                    # We can process these updates now
                    from .sensor import process_user_metrics
                    
                    for user_id, metrics in data["pending_updates"].items():
                        await process_user_metrics(
                            hass, 
                            entry_id, 
                            user_id, 
                            metrics, 
                            data["async_add_entities"]
                        )
                    
                    # Clear pending updates
                    data["pending_updates"] = {}
                    _LOGGER.info("Processed pending updates")
                    fixed = True
                else:
                    _LOGGER.warning("Cannot process pending updates without async_add_entities")
            
            # Make sure the entities dictionary exists
            if "entities" not in data:
                data["entities"] = {}
                _LOGGER.info("Created missing entities dictionary")
                fixed = True
        
        return fixed
    except Exception as e:
        _LOGGER.error(f"Error fixing issues: {e}")
        return False

async def async_run_diagnostics(hass):
    """Run all diagnostic checks."""
    _LOGGER.info("Starting Health Bridge diagnostics")
    
    checks = [
        ("Config Entries", async_check_config_entries(hass)),
        ("Component Setup", async_check_component_setup(hass)),
        ("Webhooks", async_check_webhooks(hass)),
        ("Entities", async_check_entities(hass)),
    ]
    
    results = {}
    for name, coro in checks:
        _LOGGER.info(f"Running check: {name}")
        result = await coro
        results[name] = "PASS" if result else "FAIL"
        _LOGGER.info(f"Check {name}: {'PASSED' if result else 'FAILED'}")
    
    _LOGGER.info("Diagnostics summary:")
    for name, result in results.items():
        _LOGGER.info(f"  {name}: {result}")
    
    # Try to fix issues if any checks failed
    if "FAIL" in results.values():
        _LOGGER.info("Attempting to fix issues...")
        fixed = await async_fix_common_issues(hass)
        if fixed:
            _LOGGER.info("Fixed some issues. Please restart Home Assistant and run diagnostics again.")
        else:
            _LOGGER.info("Could not automatically fix issues.")
        
        # Create a test entity to verify entity creation
        _LOGGER.info("Creating a test entity to verify entity creation...")
        test_entity_created = await async_create_test_entity(hass)
        if test_entity_created:
            _LOGGER.info("Test entity created successfully. Entity creation appears to work.")
        else:
            _LOGGER.error("Failed to create test entity. Entity creation system may be broken.")
    
    return results

def run_diagnostics_command():
    """Run diagnostics as a command."""
    import homeassistant.core as ha
    import homeassistant.config as conf
    
    hass = ha.HomeAssistant()
    hass.config.config_dir = config_dir
    
    async def async_run():
        await hass.async_start()
        try:
            # First check if config is valid
            config_path = os.path.join(config_dir, "configuration.yaml")
            if not os.path.isfile(config_path):
                _LOGGER.error(f"Configuration file not found at {config_path}")
                return False
            
            config = await conf.async_hass_config_yaml(hass)
            hass.config.components.add("default_config")
            
            # Load the health_bridge integration
            _LOGGER.info("Loading Health Bridge integration...")
            try:
                if not hass.config.components.add("health_bridge"):
                    integration = await async_get_integration(hass, DOMAIN)
                    await hass.async_add_executor_job(
                        conf.integration.load_integration_config,
                        integration,
                        hass.config,
                        {}
                    )
                
                # Initialize the health_bridge component
                result = await async_setup(hass, config)
                if not result:
                    _LOGGER.error("Failed to set up Health Bridge integration")
            except Exception as e:
                _LOGGER.error(f"Error loading Health Bridge integration: {e}")
            
            # Run diagnostics
            await async_run_diagnostics(hass)
        except Exception as e:
            _LOGGER.error(f"Error running diagnostics: {e}")
        finally:
            await hass.async_stop()

    # Run the async function
    asyncio.run(async_run())

if __name__ == "__main__":
    run_diagnostics_command()