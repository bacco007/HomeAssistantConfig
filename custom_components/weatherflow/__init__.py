"""WeatherFlow Platform."""
from __future__ import annotations

import logging
from datetime import timedelta

import homeassistant.helpers.device_registry as dr
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_TOKEN,
    CONF_ID,
    CONF_UNIT_SYSTEM_IMPERIAL,
    CONF_UNIT_SYSTEM_METRIC,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_create_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from pyweatherflowrest import (
    BadRequest,
    Invalid,
    NotAuthorized,
    WeatherFlowApiClient,
    WrongStationID,
)
from pyweatherflowrest.data import (
    ForecastDescription,
    ObservationDescription,
    StationDescription,
)

from .const import (
    CONF_FORECAST_HOURS,
    CONF_INTERVAL_FORECAST,
    CONF_INTERVAL_OBSERVATION,
    CONF_STATION_ID,
    CONFIG_OPTIONS,
    DEFAULT_BRAND,
    DEFAULT_FORECAST_HOURS,
    DEFAULT_FORECAST_INTERVAL,
    DEFAULT_OBSERVATION_INTERVAL,
    DOMAIN,
    WEATHERFLOW_PLATFORMS,
)
from .models import WeatherFlowEntryData

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
        if hass.config.units.is_metric
        else CONF_UNIT_SYSTEM_IMPERIAL
    )

    weatherflowapi = WeatherFlowApiClient(
        entry.data[CONF_STATION_ID],
        entry.data[CONF_API_TOKEN],
        units=unit_system,
        forecast_hours=entry.options.get(CONF_FORECAST_HOURS, DEFAULT_FORECAST_HOURS),
        homeassistant=True,
        session=session,
    )

    try:
        await weatherflowapi.initialize()
        station_data: StationDescription = weatherflowapi.station_data

    except WrongStationID:
        _LOGGER.debug("The Station Id entered is not correct")
        return False
    except Invalid as notreadyerror:
        _LOGGER.error("The data returned from WeatherFlow is invalid")
        raise ConfigEntryNotReady from notreadyerror
    except NotAuthorized:
        _LOGGER.debug("The Api Token entered is not valid for the supplied Station Id.")
        return False
    except BadRequest as notreadyerror:
        _LOGGER.error("An unknown error occurred when retreiving data")
        raise ConfigEntryNotReady from notreadyerror

    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=station_data.key)

    async def async_update_data():
        """Obtain the latest data from WeatherFlow."""
        try:
            data: ObservationDescription = await weatherflowapi.update_observations()
            return data

        except (BadRequest, Invalid) as err:
            raise UpdateFailed(f"Error while retreiving data: {err}") from err

    async def async_update_forecast():
        """Obtain the latest forecast from WeatherFlow."""
        try:
            data: ForecastDescription = await weatherflowapi.update_forecast()
            return data

        except (BadRequest, Invalid) as err:
            raise UpdateFailed(f"Error while retreiving forecast data: {err}") from err

    unit_descriptions = await weatherflowapi.load_unit_system()

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=DOMAIN,
        update_method=async_update_data,
        update_interval=timedelta(
            minutes=entry.options.get(
                CONF_INTERVAL_OBSERVATION, DEFAULT_OBSERVATION_INTERVAL
            )
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
            minutes=entry.options.get(CONF_INTERVAL_FORECAST, DEFAULT_FORECAST_INTERVAL)
        ),
    )
    await forecast_coordinator.async_config_entry_first_refresh()
    if not forecast_coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = WeatherFlowEntryData(
        coordinator=coordinator,
        forecast_coordinator=forecast_coordinator,
        weatherflowapi=weatherflowapi,
        station_data=station_data,
        unit_descriptions=unit_descriptions,
    )

    await _async_get_or_create_nvr_device_in_registry(hass, entry, station_data)

    hass.config_entries.async_setup_platforms(entry, WEATHERFLOW_PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    return True


async def _async_get_or_create_nvr_device_in_registry(
    hass: HomeAssistant, entry: ConfigEntry, station_data: StationDescription
) -> None:
    device_registry = dr.async_get(hass)
    _model = "Tempest" if station_data.is_tempest else "AIR & SKY"

    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        connections={(dr.CONNECTION_NETWORK_MAC, entry.unique_id)},
        identifiers={(DOMAIN, entry.unique_id)},
        manufacturer=DEFAULT_BRAND,
        name=entry.data[CONF_ID],
        model=_model,
        sw_version=station_data.hub_firmware_revision,
    )


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry):
    """Update options."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload WeatherFlow entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, WEATHERFLOW_PLATFORMS
    )
    return unload_ok
