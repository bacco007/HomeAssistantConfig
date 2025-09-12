"""The weather.com component."""
import logging
import os.path
from typing import Final
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_KEY,
    CONF_LATITUDE, CONF_LONGITUDE, CONF_NAME, Platform
)
from homeassistant.core import HomeAssistant
from homeassistant.util.unit_system import METRIC_SYSTEM
from homeassistant.util import json
from .coordinator import WeatherUpdateCoordinator, WeatherUpdateCoordinatorConfig
from .const import (
    CONF_LANG,
    DOMAIN,
    
    API_METRIC,
    API_IMPERIAL,
    API_URL_METRIC,
    API_URL_IMPERIAL
)

PLATFORMS: Final = [Platform.WEATHER, Platform.SENSOR]

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up the Weather.com component."""
    hass.data.setdefault(DOMAIN, {})

    if hass.config.units is METRIC_SYSTEM:
        unit_system_api = API_URL_METRIC
        unit_system = API_METRIC
    else:
        unit_system_api = API_URL_IMPERIAL
        unit_system = API_IMPERIAL

    config = WeatherUpdateCoordinatorConfig(
        api_key=entry.data[CONF_API_KEY],
        location_name=entry.data[CONF_NAME],
        unit_system_api=unit_system_api,
        unit_system=unit_system,
        lang=entry.data[CONF_LANG],
        latitude=entry.data[CONF_LATITUDE],
        longitude=entry.data[CONF_LONGITUDE],
        tranfile='',
    )

    tfiledir = f'{hass.config.config_dir}/custom_components/{DOMAIN}/weather_translations/'
    tfilename = config.lang.split('-', 1)[0]

    if os.path.isfile(f'{tfiledir}{tfilename}.json'):
        config.tranfile = await hass.async_add_executor_job(json.load_json, f'{tfiledir}{tfilename}.json')
    else:
        config.tranfile = await hass.async_add_executor_job(json.load_json, f'{tfiledir}en.json')
        _LOGGER.warning(f'Sensor translation file {tfilename}.json does not exist. Defaulting to en-US.')

    weathercoordinator = WeatherUpdateCoordinator(hass, config)
    await weathercoordinator.async_config_entry_first_refresh()

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    hass.data[DOMAIN][entry.entry_id] = weathercoordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Update listener."""
    await hass.config_entries.async_reload(entry.entry_id)
