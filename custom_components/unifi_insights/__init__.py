"""The UniFi Insights integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_HOST, Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
import homeassistant.helpers.config_validation as cv

from .unifi_network_api import (
    UnifiInsightsClient,
    UnifiInsightsAuthError,
    UnifiInsightsConnectionError,
)
from .const import (
    DOMAIN,
    DEFAULT_API_HOST,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .services import async_setup_services, async_unload_services
from .unifi_protect_api import (
    UnifiProtectClient,
)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.CAMERA,
    Platform.LIGHT,
    Platform.SWITCH,
    Platform.SELECT,
    Platform.NUMBER,
]

# Add CONFIG_SCHEMA definition
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the UniFi Insights component."""
    _LOGGER.debug("Setting up UniFi Insights component")

    hass.data.setdefault(DOMAIN, {})

    # Set up services
    await async_setup_services(hass)

    _LOGGER.info("UniFi Insights component setup completed")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up UniFi Insights from a config entry."""
    _LOGGER.info("Setting up UniFi Insights integration")

    hass.data.setdefault(DOMAIN, {})

    try:
        _LOGGER.debug(
            "Initializing UniFi Insights API client with host: %s",
            entry.data.get(CONF_HOST, DEFAULT_API_HOST)
        )

        api = UnifiInsightsClient(
            hass=hass,
            api_key=entry.data[CONF_API_KEY],
            host=entry.data.get(CONF_HOST, DEFAULT_API_HOST),
            verify_ssl=False,
        )

        # Verify we can authenticate
        _LOGGER.debug("Validating API key")
        if not await api.async_validate_api_key():
            _LOGGER.error("Invalid API key")
            raise ConfigEntryAuthFailed("Invalid API key")

        # Initialize Unifi Protect API client
        _LOGGER.debug("Initializing Unifi Protect API client")
        protect_api = UnifiProtectClient(
            hass=hass,
            api_key=entry.data[CONF_API_KEY],
            host=entry.data.get(CONF_HOST, DEFAULT_API_HOST),
            verify_ssl=False,
        )

        # Verify Unifi Protect API key
        _LOGGER.debug("Validating Unifi Protect API key")
        try:
            if await protect_api.async_validate_api_key():
                _LOGGER.info("Unifi Protect API key validation successful")
            else:
                _LOGGER.warning("Unifi Protect API key validation failed, continuing without Protect support")
                protect_api = None
        except Exception as err:
            _LOGGER.warning(
                "Error validating Unifi Protect API key, continuing without Protect support: %s",
                err
            )
            protect_api = None

    except UnifiInsightsAuthError as err:
        _LOGGER.error("Authentication error: %s", err)
        raise ConfigEntryAuthFailed from err
    except UnifiInsightsConnectionError as err:
        _LOGGER.error("Connection error: %s", err)
        raise ConfigEntryNotReady(
            f"Error communicating with UniFi Insights API: {err}"
        ) from err

    _LOGGER.debug("Creating data update coordinator")
    coordinator = UnifiInsightsDataUpdateCoordinator(
        hass=hass,
        api=api,
        protect_api=protect_api,
        entry=entry,
    )

    # Fetch initial data
    _LOGGER.debug("Fetching initial data")
    await coordinator.async_config_entry_first_refresh()

    # Store coordinator
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Set up platforms
    _LOGGER.debug("Setting up platforms: %s", PLATFORMS)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Reload entry when its updated
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    _LOGGER.info("UniFi Insights integration setup completed successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading UniFi Insights config entry")

    # Stop WebSocket connections if Protect API is available
    coordinator = hass.data[DOMAIN].get(entry.entry_id)
    if coordinator and coordinator.protect_api:
        _LOGGER.debug("Stopping Unifi Protect WebSocket connections")
        await coordinator.protect_api.async_stop_websocket()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

        # If this is the last config entry, unload services
        if not hass.data[DOMAIN]:
            _LOGGER.debug("No more config entries, unloading services")
            await async_unload_services(hass)
            hass.data.pop(DOMAIN)
            _LOGGER.info("UniFi Insights services unloaded")

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await hass.config_entries.async_reload(entry.entry_id)