"""ics Calendar for Home Assistant."""

import logging

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import (
    CONF_EXCLUDE,
    CONF_INCLUDE,
    CONF_NAME,
    CONF_PASSWORD,
    CONF_PREFIX,
    CONF_URL,
    CONF_USERNAME,
    Platform,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import discovery
from homeassistant.helpers.issue_registry import (
    IssueSeverity,
    async_create_issue,
)
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_ACCEPT_HEADER,
    CONF_ADV_CONNECT_OPTS,
    CONF_CALENDARS,
    CONF_CONNECTION_TIMEOUT,
    CONF_DAYS,
    CONF_DOWNLOAD_INTERVAL,
    CONF_INCLUDE_ALL_DAY,
    CONF_OFFSET_HOURS,
    CONF_PARSER,
    CONF_REQUIRES_AUTH,
    CONF_SET_TIMEOUT,
    CONF_SUMMARY_DEFAULT,
    CONF_SUMMARY_DEFAULT_DEFAULT,
    CONF_USER_AGENT,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.CALENDAR]

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                # pylint: disable=no-value-for-parameter
                vol.Optional(CONF_CALENDARS, default=[]): vol.All(
                    cv.ensure_list,
                    vol.Schema(
                        [
                            vol.Schema(
                                {
                                    vol.Required(CONF_URL): vol.Url(),
                                    vol.Required(CONF_NAME): cv.string,
                                    vol.Optional(
                                        CONF_INCLUDE_ALL_DAY, default=False
                                    ): cv.boolean,
                                    vol.Optional(
                                        CONF_USERNAME, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_PASSWORD, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_PARSER, default="rie"
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_PREFIX, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_DAYS, default=1
                                    ): cv.positive_int,
                                    vol.Optional(
                                        CONF_DOWNLOAD_INTERVAL, default=15
                                    ): cv.positive_int,
                                    vol.Optional(
                                        CONF_USER_AGENT, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_EXCLUDE, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_INCLUDE, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_OFFSET_HOURS, default=0
                                    ): int,
                                    vol.Optional(
                                        CONF_ACCEPT_HEADER, default=""
                                    ): cv.string,
                                    vol.Optional(
                                        CONF_CONNECTION_TIMEOUT, default=300
                                    ): cv.positive_float,
                                    vol.Optional(
                                        CONF_SUMMARY_DEFAULT,
                                        default=CONF_SUMMARY_DEFAULT_DEFAULT,
                                    ): cv.string,
                                }
                            )
                        ]
                    ),
                )
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)

STORAGE_KEY = DOMAIN
STORAGE_VERSION_MAJOR = 1
STORAGE_VERSION_MINOR = 0


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up calendars."""
    _LOGGER.debug("Setting up ics_calendar component")
    hass.data.setdefault(DOMAIN, {})

    if DOMAIN in config and config[DOMAIN]:
        _LOGGER.debug("discovery.load_platform called")
        discovery.load_platform(
            hass=hass,
            component=PLATFORMS[0],
            platform=DOMAIN,
            discovered=config[DOMAIN],
            hass_config=config,
        )
        async_create_issue(
            hass,
            DOMAIN,
            "deprecated_yaml_configuration",
            is_fixable=False,
            issue_domain=DOMAIN,
            severity=IssueSeverity.WARNING,
            translation_key="YAML_Warning",
        )
        _LOGGER.warning(
            "YAML configuration of ics_calendar is deprecated and will be "
            "removed in ics_calendar v5.0.0. Your configuration items have "
            "been imported. Please remove them from your configuration.yaml "
            "file."
        )

        config_entry = _async_find_matching_config_entry(hass)
        if not config_entry:
            if config[DOMAIN].get("calendars"):
                for calendar in config[DOMAIN].get("calendars"):
                    hass.async_create_task(
                        hass.config_entries.flow.async_init(
                            DOMAIN,
                            context={"source": SOURCE_IMPORT},
                            data=dict(calendar),
                        )
                    )
            return True

        # update entry with any changes
        if config[DOMAIN].get("calendars"):
            for calendar in config[DOMAIN].get("calendars"):
                hass.config_entries.async_update_entry(
                    config_entry, data=dict(calendar)
                )

    return True


@callback
def _async_find_matching_config_entry(hass):
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.source == SOURCE_IMPORT:
            return entry
    return None


async def async_migrate_entry(hass, entry: ConfigEntry):
    """Migrate old config entry."""
    # Don't downgrade entries
    if entry.version > STORAGE_VERSION_MAJOR:
        return False

    if entry.version == STORAGE_VERSION_MAJOR:
        new_data = {**entry.data}

        hass.config_entries.async_update_entry(
            entry,
            data=new_data,
            minor_version=STORAGE_VERSION_MINOR,
            version=STORAGE_VERSION_MAJOR,
        )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Implement async_setup_entry."""
    full_data: dict = add_missing_defaults(entry)
    hass.config_entries.async_update_entry(entry=entry, data=full_data)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = full_data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


def add_missing_defaults(
    entry: ConfigEntry,
) -> dict:
    """Initialize missing data."""
    data = {
        CONF_NAME: "",
        CONF_URL: "",
        CONF_ADV_CONNECT_OPTS: False,
        CONF_SET_TIMEOUT: False,
        CONF_REQUIRES_AUTH: False,
        CONF_INCLUDE_ALL_DAY: False,
        CONF_REQUIRES_AUTH: False,
        CONF_USERNAME: "",
        CONF_PASSWORD: "",
        CONF_PARSER: "rie",
        CONF_PREFIX: "",
        CONF_DAYS: 1,
        CONF_DOWNLOAD_INTERVAL: 15,
        CONF_USER_AGENT: "",
        CONF_EXCLUDE: "",
        CONF_INCLUDE: "",
        CONF_OFFSET_HOURS: 0,
        CONF_ACCEPT_HEADER: "",
        CONF_CONNECTION_TIMEOUT: 300.0,
        CONF_SUMMARY_DEFAULT: CONF_SUMMARY_DEFAULT_DEFAULT,
    }
    data.update(entry.data)

    if CONF_USERNAME in entry.data or CONF_PASSWORD in entry.data:
        data[CONF_REQUIRES_AUTH] = True
    if (
        CONF_USER_AGENT in entry.data
        or CONF_ACCEPT_HEADER in entry.data
        or CONF_CONNECTION_TIMEOUT in entry.data
    ):
        data[CONF_ADV_CONNECT_OPTS] = True
    if CONF_CONNECTION_TIMEOUT in entry.data:
        data[CONF_SET_TIMEOUT] = True

    return data


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, PLATFORMS
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
