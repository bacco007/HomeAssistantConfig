"""AstroWeather Integration for Home Assistant."""

import asyncio
from datetime import timedelta
import logging

from pyastroweatherio import AstroWeather

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.entity_registry import async_migrate_entries
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    ASTROWEATHER_PLATFORMS,
    CONF_CONDITION_CALM_WEIGHT,
    CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
    CONF_CONDITION_CLOUDCOVER_WEIGHT,
    CONF_CONDITION_FOG_WEIGHT,
    CONF_CONDITION_SEEING_WEIGHT,
    CONF_CONDITION_TRANSPARENCY_WEIGHT,
    CONF_ELEVATION,
    CONF_EXPERIMENTAL_FEATURES,
    CONF_FORECAST_INTERVAL,
    CONF_FORECAST_TYPE,
    CONF_LATITUDE,
    CONF_LOCATION_NAME,
    CONF_LONGITUDE,
    CONF_OPEN_METEO_SERVICE,
    CONF_TIMEZONE_INFO,
    CONF_UPTONIGHT_PATH,
    DEFAULT_CONDITION_CALM_WEIGHT,
    DEFAULT_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_LOW_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
    DEFAULT_CONDITION_FOG_WEIGHT,
    DEFAULT_CONDITION_SEEING_WEIGHT,
    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
    DEFAULT_ELEVATION,
    DEFAULT_EXPERIMENTAL_FEATURES,
    DEFAULT_FORECAST_INTERVAL,
    DEFAULT_LOCATION_NAME,
    DEFAULT_OPEN_METEO_SERVICE,
    DEFAULT_TIMEZONE_INFO,
    DEFAULT_UPTONIGHT_PATH,
    DISABLED,
    DOMAIN,
    FORECAST_TYPE_HOURLY,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up configured AstroWeather."""

    # We allow setup only through config flow type of config
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up AstroWeather platforms as config entry."""

    _LOGGER.debug("Starting up")

    if (
        not entry.options
        or not entry.options.get(CONF_LATITUDE)
        or not entry.options.get(CONF_LONGITUDE)
        or not entry.options.get(CONF_ELEVATION)
        or entry.options.get(CONF_CONDITION_CLOUDCOVER_WEIGHT, None) is None
        or entry.options.get(CONF_CONDITION_FOG_WEIGHT, None) is None
        or entry.options.get(CONF_CONDITION_SEEING_WEIGHT, None) is None
        or entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT, None) is None
        or entry.options.get(CONF_UPTONIGHT_PATH, None) is None
        or entry.options.get(CONF_EXPERIMENTAL_FEATURES, None) is None
        or entry.options.get(CONF_OPEN_METEO_SERVICE, None) is None
    ):
        hass.config_entries.async_update_entry(
            entry,
            options={
                CONF_FORECAST_INTERVAL: entry.data.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL),
                CONF_FORECAST_TYPE: entry.data.get(CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY),
                CONF_LOCATION_NAME: entry.data.get(CONF_LOCATION_NAME, DEFAULT_LOCATION_NAME),
                CONF_LATITUDE: entry.data[CONF_LATITUDE],
                CONF_LONGITUDE: entry.data[CONF_LONGITUDE],
                CONF_ELEVATION: entry.data.get(CONF_ELEVATION, DEFAULT_ELEVATION),
                CONF_TIMEZONE_INFO: entry.data.get(CONF_TIMEZONE_INFO, DEFAULT_TIMEZONE_INFO),
                CONF_CONDITION_CLOUDCOVER_WEIGHT: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_WEIGHT,
                    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
                ),
                CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
                    DEFAULT_CONDITION_CLOUDCOVER_HIGH_WEAKENING,
                ),
                CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
                    DEFAULT_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING,
                ),
                CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING,
                    DEFAULT_CONDITION_CLOUDCOVER_LOW_WEAKENING,
                ),
                CONF_CONDITION_FOG_WEIGHT: entry.data.get(
                    CONF_CONDITION_FOG_WEIGHT,
                    DEFAULT_CONDITION_FOG_WEIGHT,
                ),
                CONF_CONDITION_SEEING_WEIGHT: entry.data.get(
                    CONF_CONDITION_SEEING_WEIGHT, DEFAULT_CONDITION_SEEING_WEIGHT
                ),
                CONF_CONDITION_TRANSPARENCY_WEIGHT: entry.data.get(
                    CONF_CONDITION_TRANSPARENCY_WEIGHT,
                    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
                ),
                CONF_CONDITION_CALM_WEIGHT: entry.data.get(
                    CONF_CONDITION_CALM_WEIGHT,
                    DEFAULT_CONDITION_CALM_WEIGHT,
                ),
                CONF_UPTONIGHT_PATH: entry.data.get(
                    CONF_UPTONIGHT_PATH,
                    DEFAULT_UPTONIGHT_PATH,
                ),
                CONF_EXPERIMENTAL_FEATURES: entry.data.get(
                    CONF_EXPERIMENTAL_FEATURES,
                    DEFAULT_EXPERIMENTAL_FEATURES,
                ),
                CONF_OPEN_METEO_SERVICE: entry.data.get(
                    CONF_OPEN_METEO_SERVICE,
                    DEFAULT_OPEN_METEO_SERVICE,
                ),
            },
        )

    session = async_get_clientsession(hass)

    _LOGGER.debug("Options latitude %s", str(entry.options.get(CONF_LATITUDE)))
    _LOGGER.debug("Options longitude %s", str(entry.options.get(CONF_LONGITUDE)))
    _LOGGER.debug("Options elevation %s", str(entry.options.get(CONF_ELEVATION)))
    _LOGGER.debug("Options timezone %s", str(entry.options.get(CONF_TIMEZONE_INFO)))
    _LOGGER.debug("Update interval %s", str(entry.options.get(CONF_FORECAST_INTERVAL)))
    _LOGGER.debug(
        "Options cloudcover_weight %s",
        str(entry.options.get(CONF_CONDITION_CLOUDCOVER_WEIGHT)),
    )
    _LOGGER.debug(
        "Options cloudcover_high_weakening %s",
        str(entry.options.get(CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING)),
    )
    _LOGGER.debug(
        "Options cloudcover_medium_weakening %s",
        str(entry.options.get(CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING)),
    )
    _LOGGER.debug(
        "Options cloudcover_low_weakening %s",
        str(entry.options.get(CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING)),
    )
    _LOGGER.debug(
        "Options fog_weight %s",
        str(entry.options.get(CONF_CONDITION_FOG_WEIGHT)),
    )
    _LOGGER.debug("Options seeing_weight %s", str(entry.options.get(CONF_CONDITION_SEEING_WEIGHT)))
    _LOGGER.debug(
        "Options transparency_weight %s",
        str(entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT)),
    )
    _LOGGER.debug(
        "Options calm_weight %s",
        str(entry.options.get(CONF_CONDITION_CALM_WEIGHT)),
    )
    _LOGGER.debug("Uptonight path %s", str(entry.options.get(CONF_UPTONIGHT_PATH)))
    _LOGGER.debug("Experimental features %s", str(entry.options.get(CONF_EXPERIMENTAL_FEATURES)))
    _LOGGER.debug("Open-Meteo service %s", str(entry.options.get(CONF_OPEN_METEO_SERVICE)))

    astroweather = AstroWeather(
        session,
        latitude=entry.options.get(CONF_LATITUDE),
        longitude=entry.options.get(CONF_LONGITUDE),
        elevation=entry.options.get(CONF_ELEVATION),
        timezone_info=entry.options.get(CONF_TIMEZONE_INFO),
        cloudcover_weight=entry.options.get(CONF_CONDITION_CLOUDCOVER_WEIGHT),
        cloudcover_high_weakening=entry.options.get(CONF_CONDITION_CLOUDCOVER_HIGH_WEAKENING) / 100,
        cloudcover_medium_weakening=entry.options.get(CONF_CONDITION_CLOUDCOVER_MEDIUM_WEAKENING) / 100,
        cloudcover_low_weakening=entry.options.get(CONF_CONDITION_CLOUDCOVER_LOW_WEAKENING) / 100,
        # fog_weight=entry.options.get(CONF_CONDITION_FOG_WEIGHT),
        seeing_weight=entry.options.get(CONF_CONDITION_SEEING_WEIGHT),
        transparency_weight=entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT),
        calm_weight=entry.options.get(CONF_CONDITION_CALM_WEIGHT),
        uptonight_path=entry.options.get(CONF_UPTONIGHT_PATH),
        experimental_features=entry.options.get(CONF_EXPERIMENTAL_FEATURES),
        forecast_model=(
            entry.options.get(CONF_OPEN_METEO_SERVICE)
            if entry.options.get(CONF_OPEN_METEO_SERVICE) != DISABLED
            else None
        ),
        # forecast_model="icon_seamless",
    )
    _LOGGER.debug("Connected to AstroWeather platform")

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = astroweather

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=astroweather.get_location_data,
        update_interval=timedelta(minutes=entry.options.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL)),
        config_entry=entry,
    )
    await coordinator.async_config_entry_first_refresh()
    if not coordinator.last_update_success:
        raise ConfigEntryNotReady
    _LOGGER.debug(
        "Data update coordinator created (update interval: %d)",
        entry.options.get(CONF_FORECAST_INTERVAL),
    )

    fcst_type = entry.options.get(CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY)

    fcst_coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=astroweather.get_hourly_forecast,
        update_interval=timedelta(minutes=entry.options.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL)),
        config_entry=entry,
    )
    await fcst_coordinator.async_config_entry_first_refresh()
    if not fcst_coordinator.last_update_success:
        raise ConfigEntryNotReady
    _LOGGER.debug(
        "Forecast update coordinator created (update interval: %d)",
        entry.options.get(CONF_FORECAST_INTERVAL),
    )

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "coordinator": coordinator,
        "fcst_coordinator": fcst_coordinator,
        "aw": astroweather,
        "fcst_type": fcst_type,
    }

    _LOGGER.debug("Forecast updated")

    # Set up all platforms for this device/entry.
    await hass.config_entries.async_forward_entry_setups(entry, ASTROWEATHER_PLATFORMS)

    if not entry.update_listeners:
        entry.add_update_listener(async_update_options)

    return True


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry):
    """Update options."""

    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""

    unload_ok = all(
        await asyncio.gather(
            *[hass.config_entries.async_forward_entry_unload(entry, component) for component in ASTROWEATHER_PLATFORMS]
        )
    )

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate old entry."""
    _LOGGER.debug("Migrating from version %s", entry.version)

    if entry.version == 1:
        version = 2
        hass.config_entries.async_update_entry(entry, version=version)

        # Change unique id
        @callback
        def update_unique_id(entry):
            """Update unique ID of entity entry."""

            old_unique_id = entry.unique_id
            new_unique_id = f"{entry.config_entry_id}_{entry.entity_id.split('.')[1]}"

            if old_unique_id == new_unique_id:
                # Already correct, nothing to do
                return None
            _LOGGER.debug("Migrating entry %s to %s", old_unique_id, new_unique_id)
            return {"new_unique_id": entry.unique_id.replace(old_unique_id, new_unique_id)}

        await async_migrate_entries(hass, entry.entry_id, update_unique_id)

        hass.config_entries.async_update_entry(
            entry,
            data={**entry.data},
            version=2,
            unique_id=None,
        )

    _LOGGER.info("Migration to version %s successful", entry.version)

    return True
