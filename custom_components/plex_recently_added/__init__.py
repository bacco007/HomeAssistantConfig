from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.const import (
    CONF_NAME,
    CONF_API_KEY, 
    CONF_HOST, 
    CONF_PORT,
    CONF_SSL
)

from .const import (
    DOMAIN, 
    CONF_TOKEN,
    CONF_MAX,
    CONF_SECTION_TYPES,
    CONF_SECTION_LIBRARIES,
    CONF_EXCLUDE_KEYWORDS,
    CONF_ON_DECK
)

from .coordinator import PlexDataCoordinator
from .helpers import setup_client
from .plex_api import (
    FailedToLogin,
)
from .redirect import ImagesRedirect

PLATFORMS = [
    Platform.SENSOR
]

async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    try:
        client = await setup_client(
            hass,
            config_entry.data[CONF_NAME],
            config_entry.data[CONF_SSL],
            config_entry.data[CONF_API_KEY],
            config_entry.data[CONF_MAX],
            config_entry.data[CONF_ON_DECK],
            config_entry.data[CONF_HOST],
            config_entry.data[CONF_PORT],
            config_entry.data.get(CONF_SECTION_TYPES, []),
            config_entry.data.get(CONF_SECTION_LIBRARIES, []),
            config_entry.data.get(CONF_EXCLUDE_KEYWORDS, []),
        )
    except FailedToLogin as err:
        raise ConfigEntryNotReady("Failed to Log-in") from err
    coordinator = PlexDataCoordinator(hass, client)

    hass.http.register_view(ImagesRedirect(config_entry))
    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(config_entry, PLATFORMS)
    config_entry.async_on_unload(config_entry.add_update_listener(update_listener))

    return True

async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload Plex config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    ):
        del hass.data[DOMAIN][config_entry.entry_id]
        if not hass.data[DOMAIN]:
            del hass.data[DOMAIN]
    return unload_ok

async def update_listener(hass: HomeAssistant, config_entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(config_entry.entry_id)