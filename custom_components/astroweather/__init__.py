"""AstroWeather Integration for Home Assistant"""
import asyncio
import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry

from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType, HomeAssistantType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from pyastroweatherio import (
    AstroWeather,
    AstroWeatherError,
    RequestError,
    ResultError,
    FORECAST_TYPE_DAILY,
    FORECAST_TYPE_HOURLY,
)

from .const import (
    ASTROWEATHER_PLATFORMS,
    DOMAIN,
    CONF_FORECAST_TYPE,
    CONF_FORECAST_INTERVAL,
    DEFAULT_FORECAST_INTERVAL,
    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
    DEFAULT_CONDITION_SEEING_WEIGHT,
    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
    FORECAST_INTERVAL_MIN,
    FORECAST_INTERVAL_MAX,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_ELEVATION,
    CONF_TIMEZONE_INFO,
    CONF_CONDITION_CLOUDCOVER_WEIGHT,
    CONF_CONDITION_SEEING_WEIGHT,
    CONF_CONDITION_TRANSPARENCY_WEIGHT,
    DEFAULT_ELEVATION,
    DEFAULT_TIMEZONE_INFO,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistantType, config: ConfigType) -> bool:
    """Set up configured AstroWeather."""

    # We allow setup only through config flow type of config
    return True


async def async_setup_entry(hass: HomeAssistantType, entry: ConfigEntry) -> bool:
    """Set up AstroWeather platforms as config entry."""

    _LOGGER.debug("Starting up")

    if (
        not entry.options
        or not entry.options.get(CONF_LATITUDE)
        or not entry.options.get(CONF_LONGITUDE)
        or not entry.options.get(CONF_ELEVATION)
        or entry.options.get(CONF_CONDITION_CLOUDCOVER_WEIGHT, None) is None
        or entry.options.get(CONF_CONDITION_SEEING_WEIGHT, None) is None
        or entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT, None) is None
    ):
        hass.config_entries.async_update_entry(
            entry,
            options={
                CONF_FORECAST_INTERVAL: entry.data.get(
                    CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL
                ),
                CONF_FORECAST_TYPE: entry.data.get(
                    CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY
                ),
                CONF_LATITUDE: entry.data[CONF_LATITUDE],
                CONF_LONGITUDE: entry.data[CONF_LONGITUDE],
                CONF_ELEVATION: entry.data.get(CONF_ELEVATION, DEFAULT_ELEVATION),
                CONF_TIMEZONE_INFO: entry.data.get(
                    CONF_TIMEZONE_INFO, DEFAULT_TIMEZONE_INFO
                ),
                CONF_CONDITION_CLOUDCOVER_WEIGHT: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_WEIGHT,
                    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
                ),
                CONF_CONDITION_SEEING_WEIGHT: entry.data.get(
                    CONF_CONDITION_SEEING_WEIGHT, DEFAULT_CONDITION_SEEING_WEIGHT
                ),
                CONF_CONDITION_TRANSPARENCY_WEIGHT: entry.data.get(
                    CONF_CONDITION_TRANSPARENCY_WEIGHT,
                    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
                ),
            },
        )

    session = async_get_clientsession(hass)

    # Apparently 7Timer has problems with a longitude of 0 degrees
    if entry.options.get(CONF_LONGITUDE) == 0:
        hass.config_entries.async_update_entry(
            entry,
            options={
                CONF_FORECAST_INTERVAL: entry.data.get(
                    CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL
                ),
                CONF_FORECAST_TYPE: entry.data.get(
                    CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY
                ),
                CONF_LATITUDE: entry.data[CONF_LATITUDE],
                CONF_LONGITUDE: 0.000001,
                CONF_ELEVATION: entry.data.get(CONF_ELEVATION, DEFAULT_ELEVATION),
                CONF_TIMEZONE_INFO: entry.data.get(
                    CONF_TIMEZONE_INFO, DEFAULT_TIMEZONE_INFO
                ),
                CONF_CONDITION_CLOUDCOVER_WEIGHT: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_WEIGHT,
                    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
                ),
                CONF_CONDITION_SEEING_WEIGHT: entry.data.get(
                    CONF_CONDITION_SEEING_WEIGHT, DEFAULT_CONDITION_SEEING_WEIGHT
                ),
                CONF_CONDITION_TRANSPARENCY_WEIGHT: entry.data.get(
                    CONF_CONDITION_TRANSPARENCY_WEIGHT,
                    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
                ),
            },
        )

    # Check the update interval
    if (
        entry.options.get(CONF_FORECAST_INTERVAL) > FORECAST_INTERVAL_MAX
        or entry.options.get(CONF_FORECAST_INTERVAL) < FORECAST_INTERVAL_MIN
    ):
        _LOGGER.debug(
            "Overwriting update interval to %s minutes", str(DEFAULT_FORECAST_INTERVAL)
        )
        hass.config_entries.async_update_entry(
            entry,
            options={
                CONF_FORECAST_INTERVAL: DEFAULT_FORECAST_INTERVAL,
                CONF_FORECAST_TYPE: entry.data.get(
                    CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY
                ),
                CONF_LATITUDE: entry.data[CONF_LATITUDE],
                CONF_LONGITUDE: entry.data[CONF_LONGITUDE],
                CONF_ELEVATION: entry.data.get(CONF_ELEVATION, DEFAULT_ELEVATION),
                CONF_TIMEZONE_INFO: entry.data.get(
                    CONF_TIMEZONE_INFO, DEFAULT_TIMEZONE_INFO
                ),
                CONF_CONDITION_CLOUDCOVER_WEIGHT: entry.data.get(
                    CONF_CONDITION_CLOUDCOVER_WEIGHT,
                    DEFAULT_CONDITION_CLOUDCOVER_WEIGHT,
                ),
                CONF_CONDITION_SEEING_WEIGHT: entry.data.get(
                    CONF_CONDITION_SEEING_WEIGHT, DEFAULT_CONDITION_SEEING_WEIGHT
                ),
                CONF_CONDITION_TRANSPARENCY_WEIGHT: entry.data.get(
                    CONF_CONDITION_TRANSPARENCY_WEIGHT,
                    DEFAULT_CONDITION_TRANSPARENCY_WEIGHT,
                ),
            },
        )

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
        "Options seeing_weight %s", str(entry.options.get(CONF_CONDITION_SEEING_WEIGHT))
    )
    _LOGGER.debug(
        "Options transparency_weight %s",
        str(entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT)),
    )

    astroweather = AstroWeather(
        session,
        latitude=entry.options.get(CONF_LATITUDE),
        longitude=entry.options.get(CONF_LONGITUDE),
        elevation=entry.options.get(CONF_ELEVATION),
        timezone_info=entry.options.get(CONF_TIMEZONE_INFO),
        cloudcover_weight=entry.options.get(CONF_CONDITION_CLOUDCOVER_WEIGHT),
        seeing_weight=entry.options.get(CONF_CONDITION_SEEING_WEIGHT),
        transparency_weight=entry.options.get(CONF_CONDITION_TRANSPARENCY_WEIGHT),
    )
    _LOGGER.debug("Connected to AstroWeather platform")

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = astroweather

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=astroweather.get_location_data,
        update_interval=timedelta(
            minutes=entry.options.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL)
        ),
    )
    await coordinator.async_config_entry_first_refresh()
    if not coordinator.last_update_success:
        raise ConfigEntryNotReady
    _LOGGER.debug(
        "Data update coordinator created (update interval: %d)",
        entry.options.get(CONF_FORECAST_INTERVAL),
    )
    # # Currently, the only supported forecast type is 3-hourly since 7Timer
    # # does only deliver data for more than 3 days
    fcst_type = entry.options.get(CONF_FORECAST_TYPE, FORECAST_TYPE_HOURLY)
    # if fcst_type == FORECAST_TYPE_DAILY:
    #     # Update Forecast with Daily data
    #     fcst_coordinator = DataUpdateCoordinator(
    #         hass,
    #         _LOGGER,
    #         name=DOMAIN,
    #         update_method=astroweather.get_daily_forecast,
    #         update_interval=timedelta(
    #             minutes=entry.options.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL)
    #         ),
    #     )
    # else:
    # Update Forecast with Hourly data
    fcst_coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=astroweather.get_hourly_forecast,
        update_interval=timedelta(
            minutes=entry.options.get(CONF_FORECAST_INTERVAL, DEFAULT_FORECAST_INTERVAL)
        ),
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

    for platform in ASTROWEATHER_PLATFORMS:
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, platform)
        )

    if not entry.update_listeners:
        entry.add_update_listener(async_update_options)

    return True


async def async_update_options(hass: HomeAssistantType, entry: ConfigEntry):
    """Update options."""

    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistantType, entry: ConfigEntry) -> bool:
    """Unload config entry."""

    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, component)
                for component in ASTROWEATHER_PLATFORMS
            ]
        )
    )

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
