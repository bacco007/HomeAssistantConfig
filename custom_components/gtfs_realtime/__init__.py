"""The GTFS Realtime integration."""
# GTFS Station Stop Feed Subject serves as the data hub for the integration

from datetime import timedelta
from typing import Any

from gtfs_station_stop.feed_subject import FeedSubject
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
import voluptuous as vol

from custom_components.gtfs_realtime.config_flow import DOMAIN_SCHEMA

from .const import (
    CAL_DB,
    CONF_API_KEY,
    CONF_GTFS_STATIC_DATA,
    CONF_ROUTE_ICONS,
    CONF_URL_ENDPOINTS,
    COORDINATOR_REALTIME,
    DOMAIN,
    RTI_DB,
    SSI_DB,
    TI_DB,
)
from .coordinator import GtfsRealtimeCoordinator

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: DOMAIN_SCHEMA},
    extra=vol.ALLOW_EXTRA,
)


async def _async_create_gtfs_update_hub(hass: HomeAssistant, config: dict[str, Any]):
    hub = FeedSubject(
        config[CONF_URL_ENDPOINTS], headers={"api_key": config[CONF_API_KEY]}
    )
    route_icons = config.get(CONF_ROUTE_ICONS)  # optional
    # Attempt to perform an update to verify configuration
    await hub.async_update()
    coordinator_realtime = GtfsRealtimeCoordinator(
        hass, hub, config[CONF_GTFS_STATIC_DATA], static_timedelta=timedelta(hours=24)
    )
    # Update the static data for the coordinator before the first update
    await coordinator_realtime.async_update_static_data()
    hass.data[DOMAIN] = {
        COORDINATOR_REALTIME: coordinator_realtime,
        CAL_DB: coordinator_realtime.calendar,
        SSI_DB: coordinator_realtime.station_stop_info_db,
        TI_DB: coordinator_realtime.trip_info_db,
        RTI_DB: coordinator_realtime.route_info_db,
        CONF_ROUTE_ICONS: route_icons,
    }
    if CONF_ROUTE_ICONS in config:
        hass.data[DOMAIN][CONF_ROUTE_ICONS] = config[CONF_ROUTE_ICONS]
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up GTFS Realtime Feed Subject for use by all sensors."""
    await _async_create_gtfs_update_hub(hass, entry.data)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True
