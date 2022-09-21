# NSW Rural Fire Service Fire Danger.
import logging

import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .config_flow import configured_instances
from .const import (
    CONF_DATA_FEED,
    CONF_DISTRICT_NAME,
    DEFAULT_DATA_FEED,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    PLATFORMS,
    VALID_DATA_FEEDS,
)
from .coordinator import (
    NswRfsFireDangerExtendedFeedCoordinator,
    NswRfsFireDangerFeedCoordinator,
    NswRfsFireDangerStandardFeedCoordinator,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_DISTRICT_NAME): cv.string,
                vol.Optional(CONF_DATA_FEED, default=DEFAULT_DATA_FEED): vol.In(
                    VALID_DATA_FEEDS
                ),
                vol.Optional(
                    CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
                ): cv.time_period,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the NSW Rural Fire Service Fire Danger component."""
    if DOMAIN not in config:
        return True

    conf = config[DOMAIN]
    district_name = conf.get[CONF_DISTRICT_NAME]
    data_feed = conf[CONF_DATA_FEED]
    scan_interval = conf[CONF_SCAN_INTERVAL]
    identifier = f"{district_name}"
    if identifier in configured_instances(hass):
        return True

    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": SOURCE_IMPORT},
            data={
                CONF_DISTRICT_NAME: district_name,
                CONF_DATA_FEED: data_feed,
                CONF_SCAN_INTERVAL: scan_interval,
            },
        )
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the NSW Rural Fire Service Fire Danger component as config entry."""
    hass.data.setdefault(DOMAIN, {})
    # Create feed coordinator for all platforms.
    data_feed_coordinator: NswRfsFireDangerFeedCoordinator
    data_feed = entry.data.get(CONF_DATA_FEED, DEFAULT_DATA_FEED)
    if data_feed == "standard":
        data_feed_coordinator = NswRfsFireDangerStandardFeedCoordinator(hass, entry)
    elif data_feed == "extended":
        data_feed_coordinator = NswRfsFireDangerExtendedFeedCoordinator(hass, entry)
    else:
        raise NotImplementedError(f"Unsupported data feed type {data_feed} selected.")
    hass.data[DOMAIN][entry.entry_id] = data_feed_coordinator
    _LOGGER.debug("Feed coordinator added for %s", entry.entry_id)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload an NSW Rural Fire Service Fire Danger component config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
