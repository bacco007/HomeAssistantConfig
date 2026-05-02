"""Custom integration to integrate Armadarr with Home Assistant."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.const import Platform
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.loader import async_get_loaded_integration
from pyarr import (
    AsyncBazarr,
    AsyncDispatcharr,
    AsyncLidarr,
    AsyncProwlarr,
    AsyncRadarr,
    AsyncReadarr,
    AsyncSonarr,
    AsyncWhisparr,
)

from .const import (
    CONF_API_KEY,
    CONF_APP_TYPE,
    CONF_URL,
    CONF_VERIFY_SSL,
    LOGGER,
)
from .coordinator import DailyCoordinator, StandardCoordinator
from .data import ArmadarrData
from .services import async_setup_services

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .data import ArmadarrConfigEntry

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.CALENDAR,
]


async def async_setup(_hass: HomeAssistant, _config: dict[str, Any]) -> bool:
    """Set up the Armadarr integration."""
    return True


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
) -> bool:
    """Set up this integration using UI."""
    app_type = entry.data[CONF_APP_TYPE]
    url = entry.data[CONF_URL]
    api_key = entry.data[CONF_API_KEY]
    verify_ssl = entry.data.get(CONF_VERIFY_SSL, True)
    session: Any = async_get_clientsession(hass)

    # Register services for this app type if not already registered
    await async_setup_services(hass, app_type)

    client: Any
    if app_type == "Sonarr":
        client = AsyncSonarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Radarr":
        client = AsyncRadarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Lidarr":
        client = AsyncLidarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Readarr":
        client = AsyncReadarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Prowlarr":
        client = AsyncProwlarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Bazarr":
        client = AsyncBazarr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Dispatcharr":
        client = AsyncDispatcharr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    elif app_type == "Whisparr":
        client = AsyncWhisparr(
            host=url, api_key=api_key, session=session, verify_ssl=verify_ssl
        )
    else:
        LOGGER.error("Unsupported app type: %s", app_type)
        return False

    standard_coordinator = StandardCoordinator(
        hass=hass,
        config_entry=entry,
    )
    daily_coordinator = DailyCoordinator(
        hass=hass,
        config_entry=entry,
    )

    entry.runtime_data = ArmadarrData(
        client=client,
        standard_coordinator=standard_coordinator,
        daily_coordinator=daily_coordinator,
        integration=async_get_loaded_integration(hass, entry.domain),
    )

    await standard_coordinator.async_config_entry_first_refresh()
    await daily_coordinator.async_config_entry_first_refresh()

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
) -> bool:
    """Handle removal of an entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(
    hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
) -> None:
    """Reload config entry."""
    await hass.config_entries.async_reload(entry.entry_id)
