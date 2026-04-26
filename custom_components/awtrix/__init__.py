"""Awtrix."""

from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING

import homeassistant.helpers.config_validation as cv
from homeassistant.components import mqtt
from homeassistant.const import Platform
from homeassistant.helpers.entity_registry import async_entries_for_device, async_get

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant, ServiceCall

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.BINARY_SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, _: dict):
    """Awtrix integration setup."""

    async def update_settings(call: ServiceCall):
        device = call.data.get("device")
        payload = _prepare_payload(call.data)
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/settings", payload)

    async def dismiss(call: ServiceCall):
        device = call.data.get("device")
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/notify/dismiss", "")

    async def notification(call: ServiceCall):
        device = call.data.get("device")
        payload = _prepare_payload(call.data)
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/notify", payload)

    async def custom_app(call: ServiceCall):
        device = call.data.get("device")
        app = call.data.get("app")
        payload = _prepare_payload(call.data)
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/custom/{app}", payload)

    async def delete_custom_app(call: ServiceCall):
        device = call.data.get("device")
        app = call.data.get("app")
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/custom/{app}", "")

    async def deep_sleep(call: ServiceCall):
        device = call.data.get("device")
        payload = _prepare_payload(call.data)
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/sleep", payload)

    async def switch_app(call: ServiceCall):
        device = call.data.get("device")
        app = call.data.get("name")
        payload = json.dumps({"name": app})
        prefix = await _get_prefix(hass, device)

        await mqtt.async_publish(hass, f"{prefix}/switch", payload)

    hass.services.async_register(DOMAIN, "settings", update_settings)
    hass.services.async_register(DOMAIN, "dismiss", dismiss)
    hass.services.async_register(DOMAIN, "notification", notification)
    hass.services.async_register(DOMAIN, "custom_app", custom_app)
    hass.services.async_register(DOMAIN, "delete_custom_app", delete_custom_app)
    hass.services.async_register(DOMAIN, "deep_sleep", deep_sleep)
    hass.services.async_register(DOMAIN, "switch_app", switch_app)

    return True


async def async_setup_entry(_: HomeAssistant, __: ConfigEntry) -> bool:
    """Initialise entry configuration."""
    return True


async def async_unload_entry(_: HomeAssistant, __: ConfigEntry) -> bool:
    """Remove entry after unload component."""
    return True


def _prepare_payload(data: dict) -> str:
    """Prepare payload for Awtrix MQTT."""
    payload = data.copy()

    # Remove internal fields
    payload.pop("device", None)
    payload.pop("app", None)

    # Fields that should be strings if they are numeric
    to_string = [
        "text",
        "icon",
        "color",
        "background",
        "progressC",
        "progressBC",
        "barBC",
        "lineC",
        "effect",
        "overlay",
        "sound",
        "rtttl",
    ]

    for key in to_string:
        if key in payload:
            if isinstance(payload[key], (int, float)):
                payload[key] = str(payload[key])

    # Handle fragments in text
    if "text" in payload and isinstance(payload["text"], list):
        for fragment in payload["text"]:
            if isinstance(fragment, dict) and "t" in fragment:
                if isinstance(fragment["t"], (int, float)):
                    fragment["t"] = str(fragment["t"])

    return json.dumps(payload)


async def _get_prefix(hass, device_id: str) -> str | None:
    entity_registry = async_get(hass)
    entities = async_entries_for_device(entity_registry, device_id, True)

    for e in entities:
        if e.original_name == "Device topic":
            return hass.states.get(e.entity_id).state

    return None


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate old config entries."""
    version = entry.version
    if version < 2:
        if entry.title == "Atriwx":
            hass.config_entries.async_update_entry(entry, title="Awtrix", version=2)

    return True
