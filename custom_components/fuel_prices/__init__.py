"""Fuel Prices integration."""

import contextlib
import logging

from datetime import timedelta
from dataclasses import dataclass

from pyfuelprices import FuelPrices
from pyfuelprices.const import PROP_AREA_LAT, PROP_AREA_LONG, PROP_AREA_RADIUS

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    Platform,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_RADIUS,
    CONF_TIMEOUT,
    CONF_SCAN_INTERVAL,
    CONF_NAME
)
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, CONF_AREAS, CONF_SOURCES, CONF_CHEAPEST_SENSORS, CONF_CHEAPEST_SENSORS_COUNT, CONF_CHEAPEST_SENSORS_FUEL_TYPE
from .coordinator import FuelPricesCoordinator

type FuelPricesConfigEntry = ConfigEntry[FuelPricesConfig]

_LOGGER = logging.getLogger(__name__)
PLATFORMS = [Platform.SENSOR]


@dataclass
class FuelPricesConfig:
    """Represent a config for Anglian Water."""

    coordinator: FuelPricesCoordinator
    areas: list[dict]


def _build_configured_areas(hass_areas: dict) -> list[dict]:
    module_areas = []
    for area in hass_areas:
        module_areas.append(
            {
                PROP_AREA_RADIUS: area[CONF_RADIUS],
                PROP_AREA_LAT: area[CONF_LATITUDE],
                PROP_AREA_LONG: area[CONF_LONGITUDE],
            }
        )
    return module_areas


async def async_setup_entry(hass: HomeAssistant, entry: FuelPricesConfigEntry) -> bool:
    """Create ConfigEntry."""
    sources = entry.options.get(
        CONF_SOURCES, entry.data.get(CONF_SOURCES, None))
    areas = entry.options.get(CONF_AREAS, entry.data.get(CONF_AREAS, None))
    timeout = entry.options.get(CONF_TIMEOUT, entry.data.get(CONF_TIMEOUT, 30))
    update_interval = entry.options.get(
        CONF_SCAN_INTERVAL, entry.data.get(CONF_SCAN_INTERVAL, 1440)
    )
    default_lat = hass.config.latitude
    default_long = hass.config.longitude
    try:
        fuel_prices: FuelPrices = FuelPrices.create(
            enabled_sources=sources,
            configured_areas=_build_configured_areas(areas),
            timeout=timedelta(seconds=timeout),
            update_interval=timedelta(minutes=update_interval),
        )
    except Exception as err:
        _LOGGER.error(err)
        raise CannotConnect from err

    coordinator = FuelPricesCoordinator(
        hass=hass, api=fuel_prices, name=entry.entry_id)
    await coordinator.async_config_entry_first_refresh()

    async def handle_fuel_lookup(call: ServiceCall) -> ServiceResponse:
        """Handle a fuel lookup call."""
        radius = call.data.get("location", {}).get(
            "radius", 8046.72
        )  # this is in meters
        radius = radius / 1609
        lat = call.data.get("location", {}).get("latitude", default_lat)
        long = call.data.get("location", {}).get("longitude", default_long)
        fuel_type = call.data.get("type")
        try:
            return {
                "fuels": await fuel_prices.find_fuel_from_point(
                    (lat, long), radius, fuel_type
                )
            }
        except ValueError as err:
            raise HomeAssistantError(
                "Country not available for fuel data.") from err

    async def handle_fuel_location_lookup(call: ServiceCall) -> ServiceResponse:
        """Handle a fuel location lookup call."""
        radius = call.data.get("location", {}).get(
            "radius", 8046.72
        )  # this is in meters
        radius = radius / 1609
        lat = call.data.get("location", {}).get("latitude", default_lat)
        long = call.data.get("location", {}).get("longitude", default_long)
        try:
            locations = await fuel_prices.find_fuel_locations_from_point(
                (lat, long), radius
            )
        except ValueError as err:
            raise HomeAssistantError(
                "Country not available for fuel data.") from err

        return {"items": locations, "sources": entry.data.get("sources", [])}

    async def handle_force_update(call: ServiceCall):
        """Handle a request to force update."""
        await fuel_prices.update(force=True)

    hass.services.async_register(
        DOMAIN,
        "find_fuel_station",
        handle_fuel_location_lookup,
        supports_response=SupportsResponse.ONLY,
    )

    hass.services.async_register(
        DOMAIN,
        "find_fuels",
        handle_fuel_lookup,
        supports_response=SupportsResponse.ONLY,
    )

    hass.services.async_register(DOMAIN, "force_update", handle_force_update)

    entry.runtime_data = FuelPricesConfig(coordinator=coordinator, areas=areas)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def update_listener(hass: HomeAssistant, entry: FuelPricesConfigEntry):
        """Update listener."""
        await hass.config_entries.async_reload(entry.entry_id)

    entry.add_update_listener(update_listener)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: FuelPricesConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading config entry %s", entry.entry_id)
    await entry.runtime_data.coordinator.api.client_session.close()
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    return unload_ok

# Example migration function


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    """Migrate old entry."""
    _LOGGER.debug("Migrating configuration from version %s",
                  config_entry.version)

    if config_entry.version > 1:
        # This means the user has downgraded from a future version
        return False

    if config_entry.version == 1:

        new_data = {**config_entry.data}
        if config_entry.options:
            new_data = {**config_entry.options}
        for area in new_data[CONF_AREAS]:
            _LOGGER.debug("Upgrading area definition for %s", area[CONF_NAME])
            area[CONF_CHEAPEST_SENSORS] = False
            area[CONF_CHEAPEST_SENSORS_COUNT] = 5
            area[CONF_CHEAPEST_SENSORS_FUEL_TYPE] = ""

        hass.config_entries.async_update_entry(
            config_entry, data=new_data, version=2)

    _LOGGER.debug("Migration to configuration version %s successful",
                  config_entry.version)

    return True


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""
