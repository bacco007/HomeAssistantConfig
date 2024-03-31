"""Support for Awtrix time."""

from __future__ import annotations

from functools import partial
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import (
    device_registry as dr,
    discovery,
    entity_registry as er,
)
from homeassistant.helpers.service import async_set_service_schema

from .awtrix import AwtrixTime
from .const import (
    CONF_DEVICE,
    DATA_CONFIG_ENTRIES,
    DOMAIN,
    SERVICE_TO_FIELDS,
    SERVICE_TO_SCHEMA,
    SERVICES,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, config: ConfigEntry) -> bool:
    """Set up from a config entry."""

    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    return True


async def async_setup(hass, config):
    """Set up the Awtrix."""

    async def service_handler(entry_data, service, call: ServiceCall) -> None:
        """Handle service call."""

        device = AwtrixTime(hass, entry_data[CONF_DEVICE])
        func = getattr(device, service)
        if func:
            await func(call.data)

    def build_service_name(entry_name, service) -> str:
        """Build a service name for a node."""
        return f"{entry_name.replace('-', '_')}_{service}"

    devices = []

    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    for device in device_registry.devices.values():
        ha_device_name = device.name_by_user or device.name
        if device.manufacturer == 'Blueforcer':

            device_entities = er.async_entries_for_device(
                entity_registry,
                device_id=device.id,
                include_disabled_entities=False,
            )

            for entry in device_entities:
                if 'device_topic' in entry.entity_id:
                    devices.append({CONF_NAME: ha_device_name,
                                   CONF_DEVICE: entry.entity_id})

    hass.data[DOMAIN] = {
        DATA_CONFIG_ENTRIES: devices
    }

    for device_conf in devices:
        hass.async_create_task(
            discovery.async_load_platform(
                hass, Platform.NOTIFY, DOMAIN, device_conf, config)
        )
        for service in SERVICES:
            service_name = build_service_name(device_conf[CONF_NAME], service)

            hass.services.async_register(
                DOMAIN,
                service_name,
                partial(service_handler, device_conf, service),
                schema=SERVICE_TO_SCHEMA[service]
            )

            # Register the service description
            async_set_service_schema(
                hass,
                DOMAIN,
                service_name,
                {
                    "description": (
                        f"Calls the service {service_name} of the node AWTRIX"
                    ),
                    "fields": SERVICE_TO_FIELDS[service],
                },
            )

    # Return boolean to indicate that initialization was successfully.
    return True
