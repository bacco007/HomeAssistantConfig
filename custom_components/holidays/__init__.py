"""Component to integrate with holidays."""
from __future__ import absolute_import

import logging
from datetime import timedelta
from typing import Any, Dict

import holidays
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME

from . import const

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)

_LOGGER = logging.getLogger(__name__)

CALENDAR_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): str,
        vol.Optional(const.CONF_ICON_NORMAL): cv.icon,
        vol.Optional(const.CONF_ICON_TODAY): cv.icon,
        vol.Optional(const.CONF_ICON_TOMORROW): cv.icon,
        vol.Required(const.CONF_COUNTRY): vol.In(const.COUNTRY_CODES),
        vol.Optional(const.CONF_HOLIDAY_POP_NAMED): vol.All(cv.ensure_list, [str]),
        vol.Optional(const.CONF_PROV): str,
        vol.Optional(const.CONF_STATE): str,
        vol.Optional(const.CONF_OBSERVED): cv.boolean,
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


async def async_setup(hass, config):
    """Set up this component using YAML."""
    if config.get(const.DOMAIN) is None:
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
        hass.config_entries.async_forward_entry_setup(
            config_entry, const.CALENDAR_PLATFORM
        )
    )
    return True


async def async_remove_entry(hass, config_entry):
    """Handle removal of an entry."""
    try:
        await hass.config_entries.async_forward_entry_unload(
            config_entry, const.CALENDAR_PLATFORM
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
    await hass.config_entries.async_forward_entry_unload(entry, const.CALENDAR_PLATFORM)
    hass.async_add_job(
        hass.config_entries.async_forward_entry_setup(entry, const.CALENDAR_PLATFORM)
    )


def create_holidays(years: list, country: str, state: str, prov: str, observed: bool):
    """Create holidays from parameters."""
    kwargs: Dict[str, Any] = {"years": years}
    if state != "":
        kwargs["state"] = state
    if prov != "":
        kwargs["prov"] = prov
    kwargs["observed"] = observed
    if country == "SE":
        return holidays.Sweden(include_sundays=False, **kwargs)  # type: ignore
    return holidays.CountryHoliday(country, **kwargs)  # type: ignore
