from homeassistant.core import HomeAssistant, valid_entity_id
from homeassistant.exceptions import TemplateError
from homeassistant.helpers.template import _get_state_if_valid, _RESERVED_NAMES

from ..const import DEFAULT_UNAVAILABLE_STATES


class IsAvailable:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(self, entity_id: str, unavailable_states=DEFAULT_UNAVAILABLE_STATES) -> bool:
        unavailable_states = [s.lower() if type(s) is str else s for s in unavailable_states]
        state = None
        if "." in entity_id:
            state = _get_state_if_valid(self._hass, entity_id)
        else:
            if entity_id in _RESERVED_NAMES:
                return None
            if not valid_entity_id(f"{entity_id}.entity"):
                raise TemplateError(f"Invalid domain name '{entity_id}'")

        if state is not None:
            state = state.state
        if state is str:
            state = state.lower()
        result = state not in unavailable_states
        return result

    def __repr__(self) -> str:
        return f"<template CT_IsAvailable>"
