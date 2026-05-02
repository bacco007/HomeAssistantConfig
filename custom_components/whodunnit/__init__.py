"""
Whodunnit  -  Home Assistant Custom Integration
__init__.py: Integration setup and teardown

This file is the entry point for the Whodunnit integration. It is called by HA
when a config entry is loaded, reloaded, or deleted.

Responsibilities:
  - Register shared global event listeners (once, on first entry load) that
    populate a single context cache for all WhodunnitSensor instances
  - Resolve the target entity to its parent device (if any)
  - Keep the config entry title in sync with the target entity's friendly name
  - Build the DeviceInfo that sensor.py uses to attach its sensor to the
    correct device card in the HA UI
  - Create a virtual "Whodunnit" device for Helper entities that have no
    physical device of their own (e.g. input_boolean, input_select)
  - Forward setup to the sensor platform
  - Clean up virtual devices when an entry is permanently deleted
  - Tear down shared listeners when the last entry is unloaded
"""

import logging
import time
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_CALL_SERVICE
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.event import (
    async_track_device_registry_updated_event,
    async_track_state_change_event,
)
from .const import (
    DOMAIN,
    PLATFORMS,
    STATE_UI,
    CACHE_TTL,
    CACHE_MAX_SIZE,
    CACHE_CLEANUP_INTERVAL,
)

_LOGGER = logging.getLogger(__name__)


def _get_friendly(hass, entity_id):
    """Return the friendly name for an entity, or a title-cased slug fallback."""
    state = hass.states.get(entity_id)
    return (
        state.attributes.get(
            "friendly_name",
            entity_id.split(".")[-1].replace("_", " ").title(),
        )
        if state
        else entity_id
    )


def _setup_shared_listeners(hass):
    """Register global event listeners that populate the shared context cache.

    Called once when the first Whodunnit config entry is loaded. A single set
    of listeners serves all WhodunnitSensor instances, avoiding O(N) duplicate
    listeners that would each process every HA event independently.
    """
    cache = hass.data[DOMAIN]["context_cache"]
    cleanup_state = {"last_time": 0}

    def _cleanup_cache():
        now = time.time()
        if now - cleanup_state["last_time"] < CACHE_CLEANUP_INTERVAL:
            return
        cleanup_state["last_time"] = now
        expired = [
            k for k, v in cache.items()
            if now - v.get("timestamp", 0) > CACHE_TTL
        ]
        for k in expired:
            cache.pop(k, None)
        if len(cache) > CACHE_MAX_SIZE:
            sorted_keys = sorted(
                cache, key=lambda k: cache[k].get("timestamp", 0)
            )
            for k in sorted_keys[: len(cache) - CACHE_MAX_SIZE]:
                del cache[k]

    @callback
    def _record_logic_trigger(event):
        """Cache an automation_triggered or script_started event."""
        if not event.context:
            return
        _cleanup_cache()
        ctx_id = event.context.id
        entity_id = event.data.get("entity_id")
        name = event.data.get("name")
        domain = entity_id.split(".")[0] if entity_id else "automation"
        if entity_id:
            cache[ctx_id] = {
                "id": entity_id,
                "name": name or _get_friendly(hass, entity_id),
                "type": domain,
                "timestamp": time.time(),
            }

    @callback
    def _record_service_context(event):
        """Cache a service call event for later lookup by sensors."""
        _cleanup_cache()
        domain = event.data.get("domain")
        service = event.data.get("service")
        ctx = event.context
        if not ctx:
            return

        if domain in ("automation", "script", "scene"):
            service_data = event.data.get("service_data", {})
            target_ids = []
            if domain == "scene":
                target_dict = event.data.get("target", {})
                raw = target_dict.get("entity_id", [])
                if isinstance(raw, str):
                    target_ids = [raw]
                elif isinstance(raw, list):
                    target_ids = raw
            if not target_ids:
                raw = service_data.get("entity_id", [])
                if isinstance(raw, str):
                    target_ids = [raw]
                elif isinstance(raw, list):
                    target_ids = raw
            logic_id = target_ids[0] if target_ids else f"{domain}.{service}"
            if ctx.id not in cache:
                cache[ctx.id] = {
                    "id": logic_id,
                    "name": _get_friendly(hass, logic_id),
                    "type": domain,
                    "timestamp": time.time(),
                }

        elif ctx.user_id and ctx.id not in cache:
            cache[ctx.id] = {
                "id": ctx.user_id,
                "name": "",
                "type": STATE_UI,
                "timestamp": time.time(),
            }

    hass.data[DOMAIN]["listener_unsubs"] = [
        hass.bus.async_listen("automation_triggered", _record_logic_trigger),
        hass.bus.async_listen("script_started", _record_logic_trigger),
        hass.bus.async_listen(EVENT_CALL_SERVICE, _record_service_context),
    ]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load a Whodunnit config entry and set up the sensor platform."""
    hass.data.setdefault(DOMAIN, {})

    targets = entry.data.get("targets", [])
    if not targets:
        return False

    target_entity = targets[0]

    # Set up shared listeners and caches on first entry load.
    if "context_cache" not in hass.data[DOMAIN]:
        hass.data[DOMAIN]["context_cache"] = {}
        hass.data[DOMAIN]["user_cache"] = {}
        hass.data[DOMAIN]["entry_count"] = 0
        hass.data[DOMAIN]["entries"] = {}
        _setup_shared_listeners(hass)

    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)

    target_entry = ent_reg.async_get(target_entity)
    device_id = target_entry.device_id if target_entry else None

    # --- Title syncing ---

    def _get_entity_title() -> str:
        state = hass.states.get(target_entity)
        if state and state.attributes.get("friendly_name"):
            return state.attributes["friendly_name"]
        return target_entity.split(".")[-1].replace("_", " ").title()

    @callback
    def update_entry_title(event=None) -> None:
        final_title = _get_entity_title()
        if entry.title != final_title:
            hass.config_entries.async_update_entry(entry, title=final_title)

    update_entry_title()

    @callback
    def _on_state_change(event) -> None:
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")
        new_name = new_state.attributes.get("friendly_name") if new_state else None
        old_name = old_state.attributes.get("friendly_name") if old_state else None
        if new_name != old_name:
            update_entry_title()

    entry.async_on_unload(
        async_track_state_change_event(hass, [target_entity], _on_state_change)
    )

    if device_id:
        entry.async_on_unload(
            async_track_device_registry_updated_event(
                hass, device_id, update_entry_title
            )
        )

    # --- Device info ---

    device_info = None

    if device_id:
        device = dev_reg.async_get(device_id)
        if device:
            device_info = DeviceInfo(
                identifiers=device.identifiers,
                connections=device.connections,
                name=device.name_by_user or device.name,
            )

    if not device_info:
        device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Whodunnit",
            model="Whodunnit Virtual Device",
            entry_type=dr.DeviceEntryType.SERVICE,
        )
        dev_reg.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers=device_info.get("identifiers"),
            name=device_info.get("name"),
            manufacturer=device_info.get("manufacturer"),
            model=device_info.get("model"),
            entry_type=device_info.get("entry_type"),
        )

    hass.data[DOMAIN]["entries"][entry.entry_id] = {
        "targets": targets,
        "device_info": device_info,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    hass.data[DOMAIN]["entry_count"] += 1
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry (e.g. during a reload or HA shutdown)."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN]["entries"].pop(entry.entry_id, None)
        hass.data[DOMAIN]["entry_count"] -= 1
        if hass.data[DOMAIN]["entry_count"] <= 0:
            for unsub in hass.data[DOMAIN].get("listener_unsubs", []):
                unsub()
            hass.data[DOMAIN].pop("listener_unsubs", None)
            hass.data[DOMAIN].pop("context_cache", None)
            hass.data[DOMAIN].pop("user_cache", None)
            hass.data[DOMAIN].pop("entries", None)
            hass.data[DOMAIN]["entry_count"] = 0
    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Permanently clean up resources when a config entry is deleted by the user.

    Only called when the user explicitly removes the integration via the UI.
    We only clean up the virtual device created for Helper entities. Physical
    devices are owned by their own integration and must never be removed here.
    """
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    whodunnit_identifier = (DOMAIN, entry.entry_id)
    device = dev_reg.async_get_device(identifiers={whodunnit_identifier})

    if device is None:
        return

    if device.config_entries == {entry.entry_id}:
        for entity in er.async_entries_for_device(
            ent_reg, device.id, include_disabled_entities=True
        ):
            ent_reg.async_remove(entity.entity_id)
        dev_reg.async_remove_device(device.id)
        _LOGGER.debug(
            "Whodunnit: removed virtual device %s for entry %s",
            device.id,
            entry.entry_id,
        )
    else:
        _LOGGER.debug(
            "Whodunnit: skipping device %s removal  -  shared with other integrations: %s",
            device.id,
            device.config_entries,
        )
