"""Shared helpers for Phone Assistant Link entities."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.util import slugify

from .const import DOMAIN
from .phone_assistant import PALGroupPolicyState


def pal_device_info(policy: PALGroupPolicyState) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, policy.device_identifier)},
        name=f"{policy.user_id} — {policy.name}",
        manufacturer="Health Bridge",
        model="Phone Assistant Link App Group",
        sw_version="1.0",
    )


def pal_migrate_entity_name(
    hass: HomeAssistant,
    policy: PALGroupPolicyState,
    domain: str,
    unique_id: str,
    suffix: str,
) -> None:
    """Apply the configured phone name to PAL devices and entity IDs only."""
    desired_device_name = f"{policy.user_id} — {policy.name}"
    device_registry = dr.async_get(hass)
    device = next(
        (
            item
            for item in device_registry.devices.values()
            if (DOMAIN, policy.device_identifier) in item.identifiers
        ),
        None,
    )
    if device is not None and device.name != desired_device_name:
        device_registry.async_update_device(device.id, name=desired_device_name)

    registry = er.async_get(hass)
    current_entity_id = registry.async_get_entity_id(domain, DOMAIN, unique_id)
    desired_entity_id = f"{domain}.{slugify(f'{policy.user_id}_{policy.name}_{suffix}')}"
    if (
        current_entity_id is not None
        and current_entity_id != desired_entity_id
        and registry.async_get(desired_entity_id) is None
    ):
        registry.async_update_entity(current_entity_id, new_entity_id=desired_entity_id)
