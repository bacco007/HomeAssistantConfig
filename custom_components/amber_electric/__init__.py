"""The Amber Electric integration."""
import asyncio
import logging
import voluptuous as vol

from homeassistant import exceptions
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from amber_electric import AmberElectric


from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the Amber Electric component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Amber Electric from a config entry."""

    if not DOMAIN in hass.data:
        hass.data[DOMAIN] = {}

    username = entry.data["username"] if "username" in entry.data else None
    password = entry.data["password"] if "password" in entry.data else None

    hass.data[DOMAIN][entry.entry_id] = AmberElectric(
        loop=hass.loop,
        latitude=hass.config.latitude,
        longitude=hass.config.longitude,
        username=username,
        password=password,
    )

    if username and password:
        if not await hass.data[DOMAIN][entry.entry_id].auth():
            raise CannotConnect

    await hass.data[DOMAIN][entry.entry_id].market.update()

    if not hass.data[DOMAIN][entry.entry_id].postcode:
        _LOGGER.error("No postcode returned from address search")
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
