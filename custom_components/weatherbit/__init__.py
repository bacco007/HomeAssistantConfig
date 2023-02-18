"""Support for the Weatherbit weather service."""
from __future__ import annotations

import logging
from datetime import timedelta

import homeassistant.helpers.device_registry as dr
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_ID,
    CONF_API_KEY,
    CONF_LATITUDE,
    CONF_LONGITUDE,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_create_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util.unit_system import (
    METRIC_SYSTEM,
)
from pyweatherbitdata import (
    RequestError,
    InvalidApiKey,
    ResultError,
    WeatherBitApiClient,
)
from pyweatherbitdata.data import (
    BaseDataDescription,
    ForecastDescription,
    ObservationDescription,
)

from .const import (
    DEFAULT_INTERVAL_FORECAST,
    DEFAULT_INTERVAL_SENSORS,
    DOMAIN,
    CONF_FORECAST_LANGUAGE,
    CONF_INTERVAL_FORECAST,
    CONF_INTERVAL_SENSORS,
    CONF_UNIT_SYSTEM_IMPERIAL,
    CONF_UNIT_SYSTEM_METRIC,
    CONFIG_OPTIONS,
    DEFAULT_BRAND,
    WEATHERBIT_API_VERSION,
    WEATHERBIT_PLATFORMS,
)
from .models import WeatherBitEntryData

_LOGGER = logging.getLogger(__name__)


@callback
def _async_import_options_from_data_if_missing(hass: HomeAssistant, entry: ConfigEntry):
    options = dict(entry.options)
    data = dict(entry.data)
    modified = False
    for importable_option in CONFIG_OPTIONS:
        if importable_option not in entry.options and importable_option in entry.data:
            options[importable_option] = entry.data[importable_option]
            del data[importable_option]
            modified = True

    if modified:
        hass.config_entries.async_update_entry(entry, data=data, options=options)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the WeatherFlow config entries."""
    _async_import_options_from_data_if_missing(hass, entry)

    session = async_create_clientsession(hass)
    unit_system = (
        CONF_UNIT_SYSTEM_METRIC
        # if hass.config.units.is_metric
        if hass.config.units is METRIC_SYSTEM
        else CONF_UNIT_SYSTEM_IMPERIAL
    )

    weatherbitapi = WeatherBitApiClient(
        entry.data[CONF_API_KEY],
        entry.data[CONF_LATITUDE],
        entry.data[CONF_LONGITUDE],
        units=unit_system,
        language=entry.options[CONF_FORECAST_LANGUAGE],
        homeassistant=True,
        session=session,
    )

    try:
        await weatherbitapi.initialize()
        station_data: BaseDataDescription = weatherbitapi.station_data

    except InvalidApiKey:
        _LOGGER.debug("The API Key is not valid. Please re-install the integration.")
        return False
    except ResultError as notreadyerror:
        _LOGGER.error(
            "Data returned from WeatherBit. But empty or in unexpected format."
        )
        raise ConfigEntryNotReady from notreadyerror
    except RequestError as notreadyerror:
        _LOGGER.error("An unexpected error occurred when retreiving data")
        raise ConfigEntryNotReady from notreadyerror

    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=station_data.key)

    async def async_update_data():
        """Obtain the latest data from WeatherFlow."""
        try:
            data: ObservationDescription = await weatherbitapi.update_sensors()
            return data

        except (ResultError, RequestError) as err:
            raise UpdateFailed(f"Error while retreiving data: {err}") from err

    async def async_update_forecast():
        """Obtain the latest forecast from WeatherFlow."""
        try:
            data: ForecastDescription = await weatherbitapi.update_forecast()
            return data

        except (ResultError, RequestError) as err:
            raise UpdateFailed(f"Error while retreiving data: {err}") from err

    unit_descriptions = await weatherbitapi.load_unit_system()

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=async_update_data,
        update_interval=timedelta(
            minutes=entry.options.get(CONF_INTERVAL_SENSORS, DEFAULT_INTERVAL_SENSORS)
        ),
    )
    await coordinator.async_config_entry_first_refresh()
    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    forecast_coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=async_update_forecast,
        update_interval=timedelta(
            minutes=entry.options.get(CONF_INTERVAL_FORECAST, DEFAULT_INTERVAL_FORECAST)
        ),
    )
    await forecast_coordinator.async_config_entry_first_refresh()
    if not forecast_coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = WeatherBitEntryData(
        coordinator=coordinator,
        forecast_coordinator=forecast_coordinator,
        weatherbitapi=weatherbitapi,
        station_data=station_data,
        unit_descriptions=unit_descriptions,
    )

    await _async_get_or_create_nvr_device_in_registry(hass, entry, station_data)
    await hass.config_entries.async_forward_entry_setups(entry, WEATHERBIT_PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    return True


async def _async_get_or_create_nvr_device_in_registry(
    hass: HomeAssistant, entry: ConfigEntry, station_data: BaseDataDescription
) -> None:
    device_registry = dr.async_get(hass)

    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        connections={(dr.CONNECTION_NETWORK_MAC, entry.unique_id)},
        identifiers={(DOMAIN, station_data.key)},
        manufacturer=DEFAULT_BRAND,
        name=entry.data[CONF_ID],
        model=f"Location ID: {station_data.key}",
        sw_version=f"API V{WEATHERBIT_API_VERSION}",
    )


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry):
    """Update options."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload WeatherFlow entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, WEATHERBIT_PLATFORMS
    )
    return unload_ok
