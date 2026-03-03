"""
Whodunnit  -  Home Assistant Custom Integration
__init__.py: Integration setup and teardown

This file is the entry point for the Whodunnit integration. It is called by HA
when a config entry is loaded, reloaded, or deleted.

Responsibilities:
  - Resolve the target entity to its parent device (if any)
  - Keep the config entry title in sync with the target entity's friendly name
  - Build the device_info dict that sensor.py uses to attach its sensor to the
    correct device card in the HA UI
  - Create a virtual "Whodunnit" device for Helper entities that have no
    physical device of their own (e.g. input_boolean, input_select)
  - Forward setup to the sensor platform
  - Clean up virtual devices when an entry is permanently deleted
"""

import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, device_registry as dr
from homeassistant.helpers.event import async_track_device_registry_updated_event, async_track_state_change_event
from .const import (
    DOMAIN,
    PLATFORMS,
    NAME_TRACKER_PREFIX
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load a Whodunnit config entry and set up the sensor platform.

    Called by HA whenever this entry is first created or reloaded (e.g. after
    a restart or a manual reload from the Integrations UI).

    Returns True on success, False if the entry has no valid targets (which
    prevents the entry from loading and surfaces an error in the UI).
    """
    hass.data.setdefault(DOMAIN, {})

    targets = entry.data.get("targets", [])
    if not targets:
        # This should not happen in normal use since config_flow enforces a
        # selection, but guard against corrupted config entries.
        return False

    # Whodunnit currently tracks one entity per config entry.
    target_entity = targets[0]

    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)

    # Look up the entity in the registry to find its parent device (if any).
    # Helper entities (input_boolean etc.) typically have no device, so
    # device_id will be None in those cases.
    target_entry = ent_reg.async_get(target_entity)
    device_id = target_entry.device_id if target_entry else None

    # --- Title syncing ---
    # The config entry title is displayed in the lower card of the Integrations
    # UI. We want it to show the target entity's friendly name (e.g. "Relay 1")
    # rather than the device name (e.g. "Garage Switch"), so that multiple
    # Whodunnit instances on the same device are easy to tell apart.

    def _get_entity_title() -> str:
        """Return the best available display name for the target entity.

        Prefers the entity's friendly_name attribute. Falls back to converting
        the entity_id slug to title case (e.g. "switch.relay_1" -> "Relay 1").
        """
        state = hass.states.get(target_entity)
        if state and state.attributes.get("friendly_name"):
            return state.attributes["friendly_name"]
        return target_entity.split(".")[-1].replace("_", " ").title()

    @callback
    def update_entry_title(event=None) -> None:
        """Sync the config entry title to the target entity's current friendly name.

        This is called once at setup and again any time the entity or its
        parent device is renamed, so the Integrations UI always stays current.
        The `event` parameter is accepted but ignored  -  the callback signature
        must be compatible with both direct calls and HA event listeners.
        """
        final_title = _get_entity_title()
        if entry.title != final_title:
            hass.config_entries.async_update_entry(entry, title=final_title)

    # Apply the correct title immediately when the entry loads.
    update_entry_title()

    # Re-run whenever the target entity's friendly_name attribute changes.
    # Using a filtered callback avoids calling _get_entity_title() on every
    # state change (e.g. every on/off cycle), since renames are rare.
    @callback
    def _on_state_change(event) -> None:
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")
        # Only act if the friendly_name attribute itself has changed.
        new_name = new_state.attributes.get("friendly_name") if new_state else None
        old_name = old_state.attributes.get("friendly_name") if old_state else None
        if new_name != old_name:
            update_entry_title()

    entry.async_on_unload(
        async_track_state_change_event(hass, [target_entity], _on_state_change)
    )

    # Also re-run if the parent device is updated  -  covers device renames
    # made via Settings → Devices, including the "name_by_user" override.
    if device_id:
        entry.async_on_unload(
            async_track_device_registry_updated_event(hass, device_id, update_entry_title)
        )

    # --- Device info ---
    # sensor.py needs a device_info dict to attach the Whodunnit sensor to the
    # correct device card. The strategy differs depending on whether the target
    # entity belongs to a physical device or not.

    device_info = None

    if device_id:
        device = dev_reg.async_get(device_id)
        if device:
            # Mirror the physical device's identifiers AND connections. Both are
            # needed because some integrations (notably ESPHome) register their
            # devices using connections (e.g. MAC address) rather than software
            # identifiers. Without mirroring connections, the sensor would not
            # attach to the correct device card.
            device_info = {
                "identifiers": device.identifiers,
                "connections": device.connections,
                "name": device.name_by_user or device.name,
            }

    if not device_info:
        # The target entity has no parent device (e.g. it's a Helper). Create a
        # virtual Whodunnit device to group the sensor under in the HA UI.
        # This virtual device is owned solely by this config entry and will be
        # cleaned up by async_remove_entry when the entry is deleted.
        device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": entry.title,
            "manufacturer": "Whodunnit",
            "model": "Whodunnit Virtual Device",
            "entry_type": dr.DeviceEntryType.SERVICE,
        }
        dev_reg.async_get_or_create(
            config_entry_id=entry.entry_id,
            **device_info
        )

    # Store all entry-level shared data in hass.data so sensor.py can access it.
    # context_cache and user_cache are shared across all sensors in this entry
    # (currently just one) to avoid redundant lookups.
    hass.data[DOMAIN][entry.entry_id] = {
        "targets": targets,
        "device_info": device_info,
        "context_cache": {},   # Keyed by context ID; see sensor.py for structure
        "user_cache": {}       # Keyed by HA user ID → (person_entity_id, display_name)
    }

    # Hand off to sensor.py to create the WhodunnitSensor entity.
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry (e.g. during a reload or HA shutdown).

    This is called when the entry is temporarily disabled or HA is restarting.
    It must NOT delete persistent data such as registry entries  -  those should
    only be removed in async_remove_entry when the entry is permanently deleted.
    """
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        # Remove the in-memory runtime data. The entry itself and its entities
        # remain in the registry and will be restored on next load.
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Permanently clean up resources when a config entry is deleted by the user.

    This is only called when the user explicitly removes the integration via the
    UI (the three-dot menu → Delete). It is NOT called on reload or shutdown.

    We only need to clean up the virtual device created for Helper entities.
    Physical devices (ESPHome, Zigbee etc.) are owned by their own integration
    and must never be removed here.
    """
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    # Virtual devices created by Whodunnit are identified by the tuple
    # (DOMAIN, entry.entry_id). Physical devices will never have this identifier,
    # so this lookup is safe  -  it will return None for physical device entries.
    whodunnit_identifier = (DOMAIN, entry.entry_id)
    device = dev_reg.async_get_device(identifiers={whodunnit_identifier})

    if device is None:
        # No virtual device was created for this entry  -  nothing to clean up.
        return

    # Extra safety check: only delete the device if this entry is its sole owner.
    # If another integration has somehow also claimed this device, leave it alone
    # to avoid breaking that integration.
    if device.config_entries == {entry.entry_id}:
        # HA requires entities to be removed before their parent device.
        for entity in er.async_entries_for_device(ent_reg, device.id, include_disabled_entities=True):
            ent_reg.async_remove(entity.entity_id)

        dev_reg.async_remove_device(device.id)
        _LOGGER.debug(
            "Whodunnit: removed virtual device %s for entry %s",
            device.id, entry.entry_id
        )
    else:
        _LOGGER.debug(
            "Whodunnit: skipping device %s removal  -  shared with other integrations: %s",
            device.id, device.config_entries
        )