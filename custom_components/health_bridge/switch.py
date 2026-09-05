"""Phone Assistant Link blocked switches."""

from __future__ import annotations

from collections.abc import Collection
from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_ON
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .phone_assistant import (
    PALGroupPolicyState,
    async_request_pal_wake,
    get_or_create_policy,
    parse_pal_unique_id,
)
from .phone_assistant_entity import pal_device_info, pal_migrate_entity_name

UNIQUE_PREFIX = f"{DOMAIN}_pal_blocked_"


def _group_name(hass: HomeAssistant, device_id: str | None) -> str:
    device = dr.async_get(hass).async_get(device_id) if device_id else None
    name = (device.name_by_user or device.name) if device else None
    prefix = "Phone Assistant Link — "
    return name.removeprefix(prefix) if name and name.startswith(prefix) else "App Group"


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    entities: dict[str, PALBlockedSwitch] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALBlockedSwitch:
        entity = entities.get(policy.key)
        if entity is None:
            entity = PALBlockedSwitch(policy)
            entities[policy.key] = entity
            async_add_entities([entity], True)
        pal_migrate_entity_name(hass, policy, "switch", entity.unique_id, "blocked")
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

    hass.data[DOMAIN]["ensure_pal_switch"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_switches"] = remove_missing

    registry = er.async_get(hass)
    restored: list[PALBlockedSwitch] = []
    for item in list(registry.entities.values()):
        if item.platform != DOMAIN or item.domain != "switch" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, UNIQUE_PREFIX)
        if parsed is None:
            continue
        user_id, group_id = parsed
        policy = get_or_create_policy(hass, user_id, group_id, _group_name(hass, item.device_id))
        if policy.key not in entities:
            entity = PALBlockedSwitch(policy)
            entities[policy.key] = entity
            restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALBlockedSwitch(SwitchEntity, RestoreEntity):
    _attr_has_entity_name = True
    _attr_name = "Blocked"
    _attr_icon = "mdi:cellphone-lock"

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_icon = policy.icon
        self._attr_unique_id = f"{UNIQUE_PREFIX}{policy.user_id}_{policy.group_id}"
        self._attr_device_info = pal_device_info(policy)

    @property
    def is_on(self) -> bool:
        return self.policy.blocked

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "phone_device_id": self.policy.user_id,
            "group_id": self.policy.group_id,
            "daily_limit_minutes": self.policy.daily_limit_minutes,
            "limit_reached": self.policy.limit_reached,
            "restriction_status": self.policy.restriction_status,
            "temporary_override": (
                self.policy.temporary_override if self.policy.temporary_is_active else None
            ),
            "temporary_until": (
                self.policy.temporary_until.isoformat()
                if self.policy.temporary_is_active and self.policy.temporary_until
                else None
            ),
            "delivery": "manual_sync_required",
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)
        last = await self.async_get_last_state()
        if last is not None:
            self.policy.blocked = last.state == STATE_ON
            attrs = last.attributes
            limit = attrs.get("daily_limit_minutes")
            self.policy.daily_limit_minutes = int(limit) if limit is not None else None
            self.policy.limit_reached = bool(attrs.get("limit_reached", False))
            override = attrs.get("temporary_override")
            raw_until = attrs.get("temporary_until")
            until = dt_util.parse_datetime(raw_until) if isinstance(raw_until, str) else None
            if override in {"allow", "block"} and until is not None:
                self.policy.set_temporary(override, dt_util.as_utc(until))

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    async def async_turn_on(self, **kwargs: Any) -> None:
        self.policy.blocked = True
        self.policy.notify()
        async_request_pal_wake(self.hass, self.policy.user_id)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self.policy.blocked = False
        self.policy.notify()
        async_request_pal_wake(self.hass, self.policy.user_id)

    @callback
    def _handle_policy_update(self) -> None:
        self._attr_device_info = pal_device_info(self.policy)
        self._attr_icon = self.policy.icon
        self.async_write_ha_state()
