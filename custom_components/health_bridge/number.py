"""Phone Assistant Link daily usage limit and extension allowance numbers."""

from __future__ import annotations

from collections.abc import Collection

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN
from .phone_assistant import (
    PALGroupPolicyState,
    async_request_pal_wake,
    get_or_create_policy,
    parse_pal_unique_id,
)
from .phone_assistant_entity import pal_device_info, pal_migrate_entity_name

UNIQUE_PREFIX = f"{DOMAIN}_pal_daily_limit_"
EXTENSIONS_UNIQUE_PREFIX = f"{DOMAIN}_pal_extensions_allowed_per_day_"


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    limit_entities: dict[str, PALDailyLimitNumber] = {}
    extension_entities: dict[str, PALExtensionsAllowedNumber] = {}

    @callback
    def ensure(policy: PALGroupPolicyState) -> PALDailyLimitNumber:
        limit_entity = limit_entities.get(policy.key)
        if limit_entity is None:
            limit_entity = PALDailyLimitNumber(policy)
            limit_entities[policy.key] = limit_entity
            async_add_entities([limit_entity], True)
        pal_migrate_entity_name(
            hass, policy, "number", limit_entity.unique_id, "daily_usage_limit"
        )

        extension_entity = extension_entities.get(policy.key)
        if extension_entity is None:
            extension_entity = PALExtensionsAllowedNumber(policy)
            extension_entities[policy.key] = extension_entity
            async_add_entities([extension_entity], True)
        pal_migrate_entity_name(
            hass, policy, "number", extension_entity.unique_id, "extensions_allowed_per_day"
        )
        return limit_entity

    async def remove_missing(user_id: str, active_ids: Collection[str]) -> None:
        registry = er.async_get(hass)
        for store in (limit_entities, extension_entities):
            for key, entity in list(store.items()):
                if entity.policy.user_id != user_id or entity.policy.group_id in active_ids:
                    continue
                entity_id = entity.entity_id
                await entity.async_remove()
                if entity_id and registry.async_get(entity_id):
                    registry.async_remove(entity_id)
                store.pop(key, None)

    hass.data[DOMAIN]["ensure_pal_number"] = ensure
    hass.data[DOMAIN]["remove_missing_pal_numbers"] = remove_missing

    restored: list[NumberEntity] = []
    for item in list(er.async_get(hass).entities.values()):
        if item.platform != DOMAIN or item.domain != "number" or item.disabled:
            continue
        parsed = parse_pal_unique_id(item.unique_id, UNIQUE_PREFIX)
        if parsed is not None:
            policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
            if policy.key not in limit_entities:
                entity = PALDailyLimitNumber(policy)
                limit_entities[policy.key] = entity
                restored.append(entity)
            continue
        parsed = parse_pal_unique_id(item.unique_id, EXTENSIONS_UNIQUE_PREFIX)
        if parsed is not None:
            policy = get_or_create_policy(hass, parsed[0], parsed[1], "App Group")
            if policy.key not in extension_entities:
                entity = PALExtensionsAllowedNumber(policy)
                extension_entities[policy.key] = entity
                restored.append(entity)
    if restored:
        async_add_entities(restored)


class PALDailyLimitNumber(NumberEntity, RestoreEntity):
    _attr_has_entity_name = True
    _attr_name = "Daily Usage Limit"
    _attr_icon = "mdi:timer-lock"
    _attr_native_min_value = 0
    _attr_native_max_value = 1440
    _attr_native_step = 15
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_mode = NumberMode.BOX

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_icon = policy.icon
        self._attr_unique_id = f"{UNIQUE_PREFIX}{policy.user_id}_{policy.group_id}"
        self._attr_device_info = pal_device_info(policy)

    @property
    def native_value(self) -> float:
        return float(self.policy.daily_limit_minutes or 0)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)
        last = await self.async_get_last_state()
        if last is not None:
            try:
                value = int(float(last.state))
                self.policy.daily_limit_minutes = value if value >= 15 else None
            except (TypeError, ValueError):
                pass

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    async def async_set_native_value(self, value: float) -> None:
        minutes = int(value)
        self.policy.daily_limit_minutes = minutes if minutes >= 15 else None
        self.policy.notify()
        async_request_pal_wake(self.hass, self.policy.user_id)

    @callback
    def _handle_policy_update(self) -> None:
        self._attr_icon = self.policy.icon
        self.async_write_ha_state()


class PALExtensionsAllowedNumber(NumberEntity, RestoreEntity):
    """How many 15-minute extensions a group may use per day (0 disables)."""

    _attr_has_entity_name = True
    _attr_name = "Extensions Allowed Per Day"
    _attr_icon = "mdi:timer-plus-outline"
    _attr_native_min_value = 0
    _attr_native_max_value = 20
    _attr_native_step = 1
    _attr_mode = NumberMode.BOX

    def __init__(self, policy: PALGroupPolicyState) -> None:
        self.policy = policy
        self._attr_unique_id = (
            f"{EXTENSIONS_UNIQUE_PREFIX}{policy.user_id}_{policy.group_id}"
        )
        self._attr_device_info = pal_device_info(policy)

    @property
    def native_value(self) -> float:
        return float(self.policy.extensions_allowed_per_day)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.policy.add_listener(self._handle_policy_update)
        last = await self.async_get_last_state()
        if last is not None:
            try:
                self.policy.extensions_allowed_per_day = max(0, int(float(last.state)))
            except (TypeError, ValueError):
                pass

    async def async_will_remove_from_hass(self) -> None:
        self.policy.remove_listener(self._handle_policy_update)
        await super().async_will_remove_from_hass()

    async def async_set_native_value(self, value: float) -> None:
        self.policy.extensions_allowed_per_day = max(0, int(value))
        self.policy.notify()
        # Wake the phone so it pulls the new allowance on its next sync.
        async_request_pal_wake(self.hass, self.policy.user_id)

    @callback
    def _handle_policy_update(self) -> None:
        self.async_write_ha_state()
