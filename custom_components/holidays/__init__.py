"""Component to integrate with holidays."""
from __future__ import absolute_import

import logging
from datetime import timedelta
from typing import Any, Dict, List

import holidays  # pylint: disable=import-self
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant

from . import const

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)

_LOGGER = logging.getLogger(__name__)

CALENDAR_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): str,
        vol.Optional(const.CONF_ICON_NORMAL): cv.icon,
        vol.Optional(const.CONF_ICON_TODAY): cv.icon,
        vol.Optional(const.CONF_ICON_TOMORROW): cv.icon,
        vol.Required(const.CONF_COUNTRY): str,
        vol.Optional(const.CONF_SUBDIV): str,
        vol.Optional(const.CONF_OBSERVED): cv.boolean,
        vol.Optional(const.CONF_HOLIDAY_POP_NAMED): vol.All(cv.ensure_list, [str]),
    },
    extra=vol.ALLOW_EXTRA,
)

CONFIG_SCHEMA = vol.Schema(
    {
        const.DOMAIN: vol.Schema(
            {
                vol.Optional(const.CONF_CALENDARS): vol.All(
                    cv.ensure_list, [CALENDAR_SCHEMA]
                )
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up this integration using UI."""
    _LOGGER.debug(
        "Setting %s from ConfigFlow",
        config_entry.title,
    )
    # # Backward compatibility - clean-up (can be removed later?)
    config_entry.options = {}
    config_entry.add_update_listener(update_listener)
    # Add calendar
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(
            config_entry, const.CALENDAR_PLATFORM
        )
    )
    return True


async def async_remove_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    """Handle removal of an entry."""
    try:
        await hass.config_entries.async_forward_entry_unload(
            config_entry, const.CALENDAR_PLATFORM
        )
        _LOGGER.info("Successfully removed calendar from the holidays integration")
    except ValueError:
        pass


async def async_migrate_entry(_, config_entry: ConfigEntry) -> bool:
    """Migrate old entry."""
    _LOGGER.info(
        "Migrating %s from version %s", config_entry.title, config_entry.version
    )
    new_data = {**config_entry.data}
    new_options = {**config_entry.options}
    if config_entry.version == 1:
        if new_data.get(const.CONF_PROV, "") != "":
            new_data[const.CONF_SUBDIV] = new_data.get(const.CONF_PROV)
            del new_data[const.CONF_PROV]
        if new_data.get(const.CONF_STATE, "") != "":
            new_data[const.CONF_SUBDIV] = new_data.get(const.CONF_STATE)
            del new_data[const.CONF_STATE]
        if new_data.get(const.CONF_COUNTRY) == "England":
            new_data[const.CONF_COUNTRY] = "GB"
            new_data[const.CONF_SUBDIV] = "England"
        if new_data.get(const.CONF_COUNTRY) == "Northern Ireland":
            new_data[const.CONF_COUNTRY] = "GB"
            new_data[const.CONF_SUBDIV] = "Northern Ireland"
        if new_data.get(const.CONF_COUNTRY) == "Scotland":
            new_data[const.CONF_COUNTRY] = "GB"
            new_data[const.CONF_SUBDIV] = "Scotland"
        if new_data.get(const.CONF_COUNTRY) == "Wales":
            new_data[const.CONF_COUNTRY] = "GB"
            new_data[const.CONF_SUBDIV] = "Wales"
    config_entry.version = const.VERSION
    config_entry.data = {**new_data}
    config_entry.options = {**new_options}
    _LOGGER.info(
        "%s migration to version %s successful",
        config_entry.title,
        config_entry.version,
    )
    return True


async def update_listener(hass: HomeAssistant, entry) -> None:
    """Update listener."""
    # The OptionsFlow saves data to options.
    # Move them back to data and clean options (dirty, but not sure how else to do that)
    if len(entry.options) > 0:
        entry.data = entry.options
        entry.options = {}
    await hass.config_entries.async_forward_entry_unload(entry, const.CALENDAR_PLATFORM)
    hass.async_add_job(
        hass.config_entries.async_forward_entry_setup(entry, const.CALENDAR_PLATFORM)
    )


def create_holidays(years: List, country: str, subdiv: str, observed: bool):
    """Create holidays from parameters."""
    kwargs: Dict[str, Any] = {"years": years}
    if subdiv != "":
        kwargs["subdiv"] = subdiv
    kwargs["observed"] = observed
    # pylint: disable=maybe-no-member
    if country == "SE":
        return holidays.Sweden(include_sundays=False, **kwargs)
    return holidays.country_holidays(country, **kwargs)
