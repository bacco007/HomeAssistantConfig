""" Init """
from __future__ import annotations
import logging
from . import utils
from pathlib import Path
from homeassistant.helpers import config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    Platform,
)
from homeassistant.core import HomeAssistant
from .const import (
    DOMAIN,
    )

CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up irrigtest from a config entry."""
    # store an object for your platforms to access
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(
            entry, Platform.SENSOR
        )
    )

    entry.async_on_unload(entry.add_update_listener(config_entry_update_listener))
    return True

async def async_setup(hass:HomeAssistant, config):
    '''setup the card'''

    # 1. Serve lovelace card
    path = Path(__file__).parent / "www"
    utils.register_static_path(hass.http.app, "/openweathermaphistory/openweathermaphistory.js", path / "openweathermaphistory.js")

    # 2. Add card to resources
    version = getattr(hass.data["integrations"][DOMAIN], "version", 0)
    await utils.init_resource(hass, "/openweathermaphistory/openweathermaphistory.js", str(version))

    return True

async def config_entry_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update listener, called when the config entry options are changed."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, (Platform.SENSOR,))
    if unload_ok:
        #remove the instance of component
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok

