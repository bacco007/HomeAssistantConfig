"""Turn-on interception for Sundial.

This is deliberately the *only* place that reaches into service-call plumbing,
and it does so with a robust, public API: it listens for ``light.turn_on``
calls on the event bus rather than monkeypatching the core service handler.

Responsibilities:
- When a user/automation turns a controlled light on with explicit brightness
  or color, flag it as manually controlled (so adaptation backs off).
- Bare ``turn_on`` calls and physical-switch turn-ons are adapted by the
  coordinator's state listener (see :meth:`SundialCoordinator._handle_state_event`).

A pre-emptive wrapper that rewrites the call *before* it executes (to avoid a
brief flash of the previous value) could be added later behind a flag; keeping
to the event bus trades that polish for stability across HA versions.
"""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.const import (
    ATTR_ENTITY_ID,
    EVENT_CALL_SERVICE,
    SERVICE_TURN_ON,
)
from homeassistant.core import Event, HomeAssistant, callback

from .coordinator import SundialCoordinator

# Service-data keys that mean "the caller wants a specific look" -> manual.
EXPLICIT_KEYS: frozenset[str] = frozenset(
    {
        "brightness",
        "brightness_pct",
        "brightness_step",
        "brightness_step_pct",
        "color_temp",
        "color_temp_kelvin",
        "kelvin",
        "color_name",
        "rgb_color",
        "rgbw_color",
        "rgbww_color",
        "xy_color",
        "hs_color",
        "white",
        "effect",
    }
)


def _resolve_entities(service_data: dict) -> set[str]:
    """Best-effort extraction of entity_ids from a light.turn_on call.

    Handles the common ``entity_id`` form and the ``target`` form. Area/device
    targets are left to the coordinator's state listener to catch.
    """
    entities: set[str] = set()

    def _add(value) -> None:
        if isinstance(value, str):
            entities.add(value)
        elif isinstance(value, (list, tuple, set)):
            entities.update(v for v in value if isinstance(v, str))

    _add(service_data.get(ATTR_ENTITY_ID))
    target = service_data.get("target")
    if isinstance(target, dict):
        _add(target.get(ATTR_ENTITY_ID))
    return entities


async def async_setup_interceptor(
    hass: HomeAssistant, coordinator: SundialCoordinator
) -> Callable[[], None]:
    """Register the turn-on listener; returns an unsubscribe callback."""

    @callback
    def _handle_call(event: Event) -> None:
        if event.data.get("domain") != LIGHT_DOMAIN:
            return
        if event.data.get("service") != SERVICE_TURN_ON:
            return
        # Never treat our own adaptation writes as a manual override.
        if coordinator.is_our_context(event.context.id):
            return

        service_data = event.data.get("service_data") or {}
        if not any(key in service_data for key in EXPLICIT_KEYS):
            return  # bare turn_on -> let the state listener adapt it

        controlled = _resolve_entities(service_data) & set(
            coordinator.controlled_lights
        )
        for entity_id in controlled:
            coordinator.note_manual_turn_on(entity_id)

    return hass.bus.async_listen(EVENT_CALL_SERVICE, _handle_call)
