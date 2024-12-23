"""The GTFS Realtime integration."""

# GTFS Station Stop Feed Subject serves as the data hub for the integration

from datetime import timedelta
import logging
from typing import Any

from gtfs_station_stop.feed_subject import FeedSubject
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.selector import TextSelector, TextSelectorConfig
import voluptuous as vol

from custom_components.gtfs_realtime.config_flow import DOMAIN_SCHEMA

from .const import (
    CLEAR_STATIC_FEEDS,
    CONF_API_KEY,
    CONF_GTFS_STATIC_DATA,
    CONF_ROUTE_ICONS,
    CONF_STATIC_SOURCES_UPDATE_FREQUENCY,
    CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT,
    CONF_URL_ENDPOINTS,
    DOMAIN,
    REFRESH_STATIC_FEEDS,
)
from .coordinator import GtfsRealtimeCoordinator

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: DOMAIN_SCHEMA},
    extra=vol.ALLOW_EXTRA,
)

type GtfsRealtimeConfigEntry = ConfigEntry[GtfsRealtimeCoordinator]

_LOGGER = logging.getLogger(__name__)


def create_gtfs_update_hub(
    hass: HomeAssistant, config: dict[str, Any]
) -> GtfsRealtimeCoordinator:
    """Create the Update Coordinator."""
    hub = FeedSubject(
        config[CONF_URL_ENDPOINTS], headers={"api_key": config[CONF_API_KEY]}
    )
    route_icons: str | None = config.get(CONF_ROUTE_ICONS)  # optional

    static_timedelta = {
        uri: timedelta(**timedelta_dict)
        for uri, timedelta_dict in config[CONF_STATIC_SOURCES_UPDATE_FREQUENCY].items()
    }
    # if the value is 0, it is likely user input errors due to a bug in config flow UI, so coerce it to the default
    for value in static_timedelta.values():
        if value == timedelta(seconds=0):
            value = timedelta(hours=CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT)
    return GtfsRealtimeCoordinator(
        hass,
        hub,
        config[CONF_GTFS_STATIC_DATA],
        static_timedelta=static_timedelta,
        route_icons=route_icons,
    )


async def async_setup_entry(
    hass: HomeAssistant, entry: GtfsRealtimeConfigEntry
) -> bool:
    """Set up GTFS Realtime Feed Subject for use by all sensors."""
    coordinator: GtfsRealtimeCoordinator = create_gtfs_update_hub(hass, entry.data)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    async def handle_refresh_static_feeds(call):
        """Handle service action to refresh static feeds."""
        entry.runtime_data.static_update_targets = set(call.data["gtfs_static_data"])
        await entry.runtime_data.async_update_static_data()

    async def handle_clear_static_feeds(call):
        """Handle service action to clear static feeds."""
        await entry.runtime_data.async_update_static_data(clear_old_data=True)

    hass.services.async_register(
        DOMAIN,
        REFRESH_STATIC_FEEDS,
        handle_refresh_static_feeds,
        vol.Schema(
            {
                vol.Optional(
                    CONF_GTFS_STATIC_DATA,
                    default=entry.runtime_data.gtfs_static_zip,
                    description=(
                        {"suggested_value": ["https://"]}
                        if len(entry.runtime_data.gtfs_static_zip) == 0
                        else {}
                    ),
                ): TextSelector(TextSelectorConfig(multiline=False, multiple=True)),
            }
        ),
    )

    hass.services.async_register(DOMAIN, CLEAR_STATIC_FEEDS, handle_clear_static_feeds)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload GTFS config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_migrate_entry(
    hass: HomeAssistant, entry: GtfsRealtimeConfigEntry
) -> bool:
    """Migrate old entry."""
    _LOGGER.debug(
        "Migrating configuration from version %s.%s",
        entry.version,
        entry.minor_version,
    )
    if entry.version > 1:
        return False
    if entry.version == 1:
        new_data = {**entry.data}
        new_data[CONF_STATIC_SOURCES_UPDATE_FREQUENCY] = {}
        for uri in new_data[CONF_GTFS_STATIC_DATA]:
            _LOGGER.debug(
                f"Static data source {uri} set to update on interval of {timedelta(seconds=CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT)}"
            )
            new_data[CONF_STATIC_SOURCES_UPDATE_FREQUENCY][uri] = {
                "hours": CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT
            }
        hass.config_entries.async_update_entry(
            entry, data=new_data, version=2, minor_version=0
        )
    return True
