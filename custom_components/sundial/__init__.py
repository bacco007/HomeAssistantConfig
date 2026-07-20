"""Sundial — adaptive lighting for Home Assistant.

Setup wiring: one coordinator per config entry, the web-ui panel and services
registered once, and the turn-on interceptor attached. Most logic lives in the
modules this file ties together (coordinator, engine, panel, interceptor).
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import (
    ATTR_MANUAL_CONTROL,
    ATTR_TURN_ON,
    DOMAIN,
    PLATFORMS,
    SERVICE_APPLY,
    SERVICE_SET_MANUAL_CONTROL,
)
from .coordinator import SundialCoordinator, get_coordinator
from .interceptor import async_setup_interceptor
from .panel import async_remove_panel, async_setup_panel
from .store import SundialStore


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Sundial from a config entry.

    ``single_config_entry`` is enforced in the manifest, so ``hass.data[DOMAIN]``
    holds the one coordinator directly.
    """
    store = SundialStore(hass)
    await store.async_load()
    coordinator = SundialCoordinator(hass, entry, store)
    await coordinator.async_start()
    hass.data[DOMAIN] = coordinator

    await async_setup_panel(hass, coordinator)
    coordinator.register_unsub(await async_setup_interceptor(hass, coordinator))
    _async_register_services(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """React to the controlled-lights list changing via the options flow."""
    coordinator: SundialCoordinator = hass.data[DOMAIN]
    await coordinator.async_update_lights()


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Tear down the config entry."""
    coordinator: SundialCoordinator = hass.data[DOMAIN]
    await coordinator.async_unload()

    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data.pop(DOMAIN, None)
        async_remove_panel(hass)
        for service in (SERVICE_APPLY, SERVICE_SET_MANUAL_CONTROL):
            hass.services.async_remove(DOMAIN, service)
    return unloaded


def _async_register_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, SERVICE_APPLY):
        return

    async def handle_apply(call: ServiceCall) -> None:
        entity_ids = call.data.get(ATTR_ENTITY_ID)
        turn_on = call.data.get(ATTR_TURN_ON, True)
        coordinator = get_coordinator(hass)
        if coordinator is not None:
            await coordinator.async_apply(entity_ids, turn_on=turn_on)

    async def handle_set_manual_control(call: ServiceCall) -> None:
        coordinator = get_coordinator(hass)
        if coordinator is None:
            return
        manual = call.data[ATTR_MANUAL_CONTROL]
        for entity_id in call.data[ATTR_ENTITY_ID]:
            coordinator.set_manual_control(entity_id, manual)

    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY,
        handle_apply,
        schema=vol.Schema(
            {
                vol.Optional(ATTR_ENTITY_ID): cv.entity_ids,
                vol.Optional(ATTR_TURN_ON, default=True): cv.boolean,
            }
        ),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_MANUAL_CONTROL,
        handle_set_manual_control,
        schema=vol.Schema(
            {
                vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
                vol.Required(ATTR_MANUAL_CONTROL, default=True): cv.boolean,
            }
        ),
    )
