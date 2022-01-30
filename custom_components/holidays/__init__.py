"""Component to integrate with holidays."""

import logging
from datetime import timedelta

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant import config_entries

from .const import CALENDAR_PLATFORM, CONF_CALENDARS, DOMAIN, configuration

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)

_LOGGER = logging.getLogger(__name__)

config_definition = configuration()

CALENDAR_SCHEMA = vol.Schema(config_definition.compile_schema())

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {vol.Optional(CONF_CALENDARS): vol.All(cv.ensure_list, [CALENDAR_SCHEMA])}
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass, config):
    """Set up this component using YAML."""
    if config.get(DOMAIN) is None:
        # We get here if the integration is set up using config flow
        return True

    return False


async def async_setup_entry(hass, config_entry):
    """Set up this integration using UI."""
    if config_entry.source == config_entries.SOURCE_IMPORT:
        # We get here if the integration is set up using YAML
        return False
    _LOGGER.debug(
        "Setting %s from ConfigFlow",
        config_entry.title,
    )
    # # Backward compatibility - clean-up (can be removed later?)
    config_entry.options = {}
    config_entry.add_update_listener(update_listener)
    # Add calendar
    hass.async_add_job(
        hass.config_entries.async_forward_entry_setup(config_entry, CALENDAR_PLATFORM)
    )
    return True


async def async_remove_entry(hass, config_entry):
    """Handle removal of an entry."""
    try:
        await hass.config_entries.async_forward_entry_unload(
            config_entry, CALENDAR_PLATFORM
        )
        _LOGGER.info("Successfully removed calendar from the holidays integration")
    except ValueError:
        pass


async def update_listener(hass, entry):
    """Update listener."""
    # The OptionsFlow saves data to options.
    # Move them back to data and clean options (dirty, but not sure how else to do that)
    if len(entry.options) > 0:
        entry.data = entry.options
        entry.options = {}
    await hass.config_entries.async_forward_entry_unload(entry, CALENDAR_PLATFORM)
    hass.async_add_job(
        hass.config_entries.async_forward_entry_setup(entry, CALENDAR_PLATFORM)
    )
