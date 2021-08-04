"""The NSWCovid integration."""
import asyncio

import voluptuous as vol
import logging

from homeassistant import exceptions
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.sensor import DOMAIN as SENSOR

from nswcovid import NSWCovid

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

PLATFORMS = [SENSOR]


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the NSWCovid component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up NSWCovid from a config entry."""

    if not DOMAIN in hass.data:
        hass.data[DOMAIN] = {}

    hass.data[DOMAIN][entry.entry_id] = NSWCovid(loop=hass.loop)

    if not await hass.data[DOMAIN][entry.entry_id].refresh():
        raise CannotConnect

    for component in PLATFORMS:
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, component)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, component)
                for component in PLATFORMS
            ]
        )
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""
