"""Component to integrate with holidays."""
from __future__ import absolute_import, annotations

import logging
from datetime import timedelta
from typing import Any, Dict

import holidays  # pylint: disable=import-self
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from . import const

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=30)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, _: ConfigType) -> bool:
    """Set up the platform - inicialize data structure."""
    hass.data.setdefault(const.DOMAIN, {})
    hass.data[const.DOMAIN].setdefault(const.CALENDAR_PLATFORM, {})
    return True


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Set up this integration using UI."""
    _LOGGER.debug(
        "Setting %s from ConfigFlow",
        config_entry.title,
    )
    config_entry.add_update_listener(update_listener)
    # Add calendar
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(
            config_entry, const.CALENDAR_PLATFORM
        )
    )
    return True


async def async_remove_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> None:
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
    new_data: Dict[str, Any] = {**config_entry.data}
    new_options: Dict[str, Any] = {**config_entry.options}
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
    if config_entry.version <= 2:
        for conf in [
            const.CONF_ICON_NORMAL,
            const.CONF_ICON_TODAY,
            const.CONF_ICON_TOMORROW,
            const.CONF_COUNTRY,
            const.CONF_SUBDIV,
            const.CONF_HOLIDAY_POP_NAMED,
        ]:
            if conf in new_data:
                new_options[conf] = new_data.get(conf)
                del new_data[conf]
    config_entry.version = const.CONFIG_VERSION
    config_entry.data = {**new_data}
    config_entry.options = {**new_options}
    _LOGGER.info(
        "%s migration to version %s successful",
        config_entry.title,
        config_entry.version,
    )
    return True


async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update listener - to re-create device after options update."""
    await hass.config_entries.async_forward_entry_unload(entry, const.CALENDAR_PLATFORM)
    hass.async_add_job(
        hass.config_entries.async_forward_entry_setup(entry, const.CALENDAR_PLATFORM)
    )


def create_holidays(
    years: list, country: str, subdiv: str, observed: bool
) -> holidays.HolidayBase:
    """Create holidays from parameters."""
    kwargs: Dict[str, Any] = {"years": years}
    if subdiv != "":
        kwargs["subdiv"] = subdiv
    kwargs["observed"] = observed
    # pylint: disable=maybe-no-member
    if country == "SE":
        return holidays.Sweden(include_sundays=False, **kwargs)
    return holidays.country_holidays(country, **kwargs)
