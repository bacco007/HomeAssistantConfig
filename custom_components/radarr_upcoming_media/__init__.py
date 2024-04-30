from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.const import (
    Platform,
    CONF_API_KEY,
    CONF_HOST,
    CONF_PORT,
    CONF_SSL,
    )

from .const import (
    DOMAIN,
    CONF_DAYS,
    CONF_URLBASE,
    CONF_THEATERS,
    CONF_MAX,
)
from .coordinator import RadarrDataCoordinator
from .helpers import setup_client
from .radarr_api import (
    FailedToLogin,
    RadarrCannotBeReached
)
from .parsing import TMDBApiNotResponding

PLATFORMS = {
    Platform.SENSOR
}

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    try:
        client = await hass.async_add_executor_job(
            setup_client,
            hass,
            config_entry.data[CONF_API_KEY],
            config_entry.data[CONF_DAYS],
            config_entry.data[CONF_HOST],
            config_entry.data[CONF_PORT],
            config_entry.data[CONF_SSL],
            config_entry.data[CONF_URLBASE],
            config_entry.data[CONF_THEATERS],
            config_entry.data[CONF_MAX],
        )
    except FailedToLogin as err:
        raise ConfigEntryNotReady('Failed to Log-in') from err
    except RadarrCannotBeReached as err:
        raise ConfigEntryNotReady('Radarr cannot be reached') from err
    except TMDBApiNotResponding as err:
        raise ConfigEntryNotReady('TMDB API is not responding') from err
    coordinator = RadarrDataCoordinator(hass, client)

    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload Radarr config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    ):
        del hass.data[DOMAIN][config_entry.entry_id]
        if not hass.data[DOMAIN]:
            del hass.data[DOMAIN]
    return unload_ok