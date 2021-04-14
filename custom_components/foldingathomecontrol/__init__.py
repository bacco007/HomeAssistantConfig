"""
Component to integrate with PyFoldingAtHomeControl.
"""

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT
from homeassistant.core import Config, HomeAssistant

from .const import (
    CLIENT,
    CONF_ADDRESS,
    CONF_PASSWORD,
    CONF_PORT,
    CONF_READ_TIMEOUT,
    CONF_UPDATE_RATE,
    DOMAIN,
    UNSUB_DISPATCHERS,
)
from .foldingathomecontrol_client import FoldingAtHomeControlClient
from .services import async_setup_services, async_unload_services

FOLDINGATHOMECONTROL_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_ADDRESS, default="localhost"): cv.string,
        vol.Optional(CONF_PORT, default=36330): cv.port,
        vol.Optional(CONF_PASSWORD): cv.string,
    }
)

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: vol.All(cv.ensure_list, [FOLDINGATHOMECONTROL_SCHEMA])},
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: Config) -> bool:
    """Configure PyFoldingAtHomeControl using config flow only."""
    if DOMAIN in config:
        for entry in config[DOMAIN]:
            hass.async_create_task(
                hass.config_entries.flow.async_init(
                    DOMAIN, context={"source": SOURCE_IMPORT}, data=entry
                )
            )

    return True


async def async_setup_entry(hass, config_entry):
    """Set up PyFoldingAtHomeControl from config entry."""
    client = FoldingAtHomeControlClient(hass, config_entry)
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = {}
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id][CLIENT] = client
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id][UNSUB_DISPATCHERS] = []
    if not await client.async_setup():
        return False

    await async_setup_services(hass)
    config_entry.add_update_listener(async_options_updated)

    return True


async def async_unload_entry(hass, config_entry):
    """Unload a config entry."""
    await hass.config_entries.async_forward_entry_unload(config_entry, "sensor")
    await hass.data[DOMAIN][config_entry.entry_id][CLIENT].async_remove()
    for unsub_dispatcher in hass.data[DOMAIN][config_entry.entry_id][CLIENT]:
        unsub_dispatcher()
    hass.data[DOMAIN].pop(config_entry.entry_id)
    # If there is no instance of this integration registered anymore
    if not hass.data[DOMAIN]:
        await async_unload_services(hass)
    return True


async def async_options_updated(hass, config_entry):
    """Triggered by config entry options updates."""
    await hass.data[DOMAIN][config_entry.entry_id][CLIENT].async_set_update_rate(
        config_entry.options[CONF_UPDATE_RATE]
    )
    hass.data[DOMAIN][config_entry.entry_id][CLIENT].set_read_timeout(
        config_entry.options[CONF_READ_TIMEOUT]
    )
