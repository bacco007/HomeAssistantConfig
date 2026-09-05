"""Phone Assistant Link limit-reached binary sensors."""

from __future__ import annotations

from collections.abc import Collection

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .phone_assistant import PALGroupPolicyState, get_or_create_policy, parse_pal_unique_id
from .phone_assistant_entity import pal_device_info, pal_migrate_entity_name

UNIQUE_PREFIX = f"{DOMAIN}_pal_limit_reached_"


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    entities: dict[str, PALLimitReachedBinarySensor] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALLimitReachedBinarySensor:
        entity = entities.get(policy.key)
        if entity is None:
            entity = PALLimitReachedBinarySensor(policy)
            entities[policy.key] = entity
            async_add_entities([entity], True)
        pal_migrate_entity_name(
            hass, policy, "binary_sensor", entity.unique_id, "limit_reached"
        )
        return entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for key, entity in list(entities.items()):
            if entity.policy.user_id != user_id or entity.policy.group_id in active_ids:
                continue
            entity_id = entity.entity_id
            await entity.async_remove()
            if entity_id and registry.async_get(entity_id):
                registry.async_remove(entity_id)
            entities.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_binary_sensor"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_binary_sensors"] = remove_missing

    restored: list[PALLimitReachedBinarySensor] = []
    for item in list(er.async_get(hass).entities.values()):
        if item.platform != DOMAIN or item.domain != "binary_sensor" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, UNIQUE_PREFIX)
        if parsed is None:
            continue
        policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
        if policy.key not in entities:
            entity = PALLimitReachedBinarySensor(policy)
            entities[policy.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALLimitReachedBinarySensor(BinarySensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Limit Reached"
    _attr_icon = "mdi:timer-alert"

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_icon = policy.icon
        self._attr_unique_id = f"{UNIQUE_PREFIX}{policy.user_id}_{policy.group_id}"
        self._attr_device_info = pal_device_info(policy)

    @property
    def is_on(self) -> bool:
        return self.policy.limit_reached

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    @callback
    def _handle_policy_update(self) -> None:
        self._attr_icon = self.policy.icon
        self.async_write_ha_state()
