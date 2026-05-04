from homeassistant.core import HomeAssistant, valid_entity_id
from homeassistant.exceptions import TemplateError
from homeassistant.helpers import entity_registry

from .utils import PATCHED_RESERVED_NAMES


def get_entity_registry_entry(hass: HomeAssistant, entity_id: str) -> entity_registry.RegistryEntry | None:
    if "." in entity_id:
        er = entity_registry.async_get(hass)
        return er.async_get(entity_id)
    else:
        if entity_id in PATCHED_RESERVED_NAMES:
            return None
        if not valid_entity_id(f"{entity_id}.entity"):
            raise TemplateError(f"Invalid domain name '{entity_id}'")
        return None

class EntityAttr:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(self, entity_id: str, attribute: str) -> str | None:
        entity_registry_entry = get_entity_registry_entry(self._hass, entity_id)

        if entity_registry_entry is not None:
            return entity_registry_entry.extended_dict.get(attribute, None)
        return None

    def __repr__(self) -> str:
        return f"<template CT_EntityAttr>"


class EntityAttrs:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(self, entity_id: str) -> list[str] | None:
        entity_registry_entry = get_entity_registry_entry(self._hass, entity_id)
        if entity_registry_entry is not None:
            return list(entity_registry_entry.extended_dict.keys())
        return []

    def __repr__(self) -> str:
        return f"<template CT_EntityAttrs>"
