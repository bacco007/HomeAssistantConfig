"""The UniFi Insights integration."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, TypeAlias

import homeassistant.helpers.config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_HOST, CONF_VERIFY_SSL, Platform
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from unifi_official_api import (
    ApiKeyAuth,
    ConnectionType,
    LocalAuth,
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiTimeoutError,
)
from unifi_official_api.network import UniFiNetworkClient
from unifi_official_api.protect import UniFiProtectClient

from .const import (
    CONF_CONNECTION_TYPE,
    CONF_CONSOLE_ID,
    CONNECTION_TYPE_LOCAL,
    DEFAULT_API_HOST,
    DOMAIN,
)
from .const import (
    CONNECTION_TYPE_REMOTE as CONNECTION_TYPE_REMOTE,
)
from .coordinators import (
    UnifiConfigCoordinator,
    UnifiDeviceCoordinator,
    UnifiFacadeCoordinator,
    UnifiProtectCoordinator,
)
from .services import async_setup_services, async_unload_services

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant


@dataclass
class UnifiInsightsData:
    """Runtime data for UniFi Insights integration (Platinum multi-coordinator)."""

    config_coordinator: UnifiConfigCoordinator
    device_coordinator: UnifiDeviceCoordinator
    protect_coordinator: UnifiProtectCoordinator | None
    network_client: UniFiNetworkClient
    protect_client: UniFiProtectClient | None
    # Facade coordinator for backward compatibility with entity classes
    _facade_coordinator: UnifiFacadeCoordinator | None = None

    @property
    def coordinator(self) -> UnifiFacadeCoordinator:
        """
        Return facade coordinator for backward compatibility.

        This property provides a unified view combining data from all
        specialized coordinators, ensuring existing entity classes
        continue to work without modifications.
        """
        if self._facade_coordinator is None:
            msg = "Facade coordinator not initialized"
            raise RuntimeError(msg)
        return self._facade_coordinator


# Use TypeAlias for proper mypy validation (Python 3.10+ style)
UnifiInsightsConfigEntry: TypeAlias = ConfigEntry[UnifiInsightsData]  # noqa: UP040

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.CAMERA,
    Platform.DEVICE_TRACKER,
    Platform.EVENT,
    Platform.LIGHT,
    Platform.SWITCH,
    Platform.SELECT,
    Platform.NUMBER,
    Platform.UPDATE,
]

# Add CONFIG_SCHEMA definition
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:  # noqa: ARG001
    """Set up the UniFi Insights component."""
    _LOGGER.debug("Setting up UniFi Insights component")

    hass.data.setdefault(DOMAIN, {})

    # Set up services
    await async_setup_services(hass)

    _LOGGER.info("UniFi Insights component setup completed")
    return True


async def async_setup_entry(  # noqa: PLR0915
    hass: HomeAssistant, entry: UnifiInsightsConfigEntry
) -> bool:
    """Set up UniFi Insights from a config entry."""
    _LOGGER.info("Setting up UniFi Insights integration")

    # Determine connection type (default to local for backward compatibility)
    connection_type = entry.data.get(CONF_CONNECTION_TYPE, CONNECTION_TYPE_LOCAL)
    is_local = connection_type == CONNECTION_TYPE_LOCAL

    # Get Home Assistant's aiohttp session for efficient connection pooling
    # (Platinum requirement)
    verify_ssl = entry.data.get(CONF_VERIFY_SSL, False) if is_local else True
    websession = async_get_clientsession(hass, verify_ssl=verify_ssl)

    try:
        if is_local:
            _LOGGER.debug(
                "Initializing UniFi API clients (LOCAL) with host: %s",
                entry.data.get(CONF_HOST, DEFAULT_API_HOST),
            )

            # Create authentication object for local connection
            auth = LocalAuth(
                api_key=entry.data[CONF_API_KEY],
                verify_ssl=verify_ssl,
            )

            # Initialize UniFi Network API client with injected websession
            network_client = UniFiNetworkClient(
                auth=auth,
                base_url=entry.data.get(CONF_HOST, DEFAULT_API_HOST),
                connection_type=ConnectionType.LOCAL,
                timeout=30,
                session=websession,
            )
        else:
            _LOGGER.debug(
                "Initializing UniFi API clients (REMOTE) with console_id: %s",
                entry.data.get(CONF_CONSOLE_ID),
            )

            # Create authentication object for remote connection
            auth = ApiKeyAuth(api_key=entry.data[CONF_API_KEY])

            # Initialize UniFi Network API client for remote connection
            network_client = UniFiNetworkClient(
                auth=auth,
                connection_type=ConnectionType.REMOTE,
                console_id=entry.data.get(CONF_CONSOLE_ID),
                timeout=30,
                session=websession,
            )

        # Verify we can authenticate with Network API by fetching sites
        _LOGGER.debug("Validating Network API connection")
        try:
            sites = await network_client.sites.get_all()
            if not sites:
                msg = "No sites found - API key may be invalid"
                _LOGGER.error(msg)
                raise ConfigEntryAuthFailed(msg)
            _LOGGER.info(
                "Network API validated successfully, found %d sites", len(sites)
            )
        except UniFiAuthenticationError as err:
            msg = "Invalid API key or unable to connect to Network API"
            _LOGGER.exception(msg)
            raise ConfigEntryAuthFailed(msg) from err

        # Initialize UniFi Protect API client (only for local connections currently)
        protect_client: UniFiProtectClient | None = None
        if is_local:
            _LOGGER.debug("Initializing UniFi Protect API client")
            protect_client = UniFiProtectClient(
                auth=auth,
                base_url=entry.data.get(CONF_HOST, DEFAULT_API_HOST),
                connection_type=ConnectionType.LOCAL,
                timeout=30,
                session=websession,
            )

            # Verify UniFi Protect API connection by fetching cameras
            _LOGGER.debug("Validating Protect API connection")
            try:
                cameras = await protect_client.cameras.get_all()
                _LOGGER.info(
                    "UniFi Protect API validated successfully, found %d cameras",
                    len(cameras),
                )
            except Exception as err:  # noqa: BLE001
                _LOGGER.warning(
                    "Error validating UniFi Protect API connection, "
                    "continuing without Protect support: %s",
                    err,
                )
                protect_client = None
        else:
            _LOGGER.info("Protect API not available for remote connections")

    # Note: UniFiAuthenticationError is already handled in the inner try block
    # at lines 176-179, which converts it to ConfigEntryAuthFailed
    except UniFiConnectionError as err:
        _LOGGER.exception("Connection error")
        msg = f"Error communicating with UniFi API: {err}"
        raise ConfigEntryNotReady(msg) from err
    except UniFiTimeoutError as err:
        _LOGGER.exception("Timeout error")
        msg = f"Timeout connecting to UniFi API: {err}"
        raise ConfigEntryNotReady(msg) from err

    # Create multi-coordinator architecture (Platinum compliance)
    _LOGGER.debug("Creating multi-coordinator architecture")

    # 1. Config coordinator - slow updates (5 minutes) for sites, WiFi
    config_coordinator = UnifiConfigCoordinator(
        hass=hass,
        network_client=network_client,
        protect_client=protect_client,
        entry=entry,
    )

    # 2. Device coordinator - fast updates (30 seconds) for devices, stats
    device_coordinator = UnifiDeviceCoordinator(
        hass=hass,
        network_client=network_client,
        protect_client=protect_client,
        entry=entry,
        config_coordinator=config_coordinator,
    )

    # 3. Protect coordinator - fast updates (30 seconds) + WebSocket for events
    protect_coordinator: UnifiProtectCoordinator | None = None
    if protect_client:
        protect_coordinator = UnifiProtectCoordinator(
            hass=hass,
            network_client=network_client,
            protect_client=protect_client,
            entry=entry,
        )

    # Fetch initial data - config first, then device/protect in parallel
    _LOGGER.debug("Fetching initial data from coordinators")
    await config_coordinator.async_config_entry_first_refresh()

    # Device coordinator needs sites from config coordinator
    refresh_tasks = [device_coordinator.async_config_entry_first_refresh()]
    if protect_coordinator:
        refresh_tasks.append(protect_coordinator.async_config_entry_first_refresh())
    await asyncio.gather(*refresh_tasks)

    # Create facade coordinator for backward compatibility with entity classes
    _LOGGER.debug("Creating facade coordinator for backward compatibility")
    facade_coordinator = UnifiFacadeCoordinator(
        hass=hass,
        network_client=network_client,
        protect_client=protect_client,
        entry=entry,
        config_coordinator=config_coordinator,
        device_coordinator=device_coordinator,
        protect_coordinator=protect_coordinator,
    )
    # Initial aggregation of data
    facade_coordinator._aggregate_data()  # noqa: SLF001

    # Store runtime data in config entry (Gold requirement)
    entry.runtime_data = UnifiInsightsData(
        config_coordinator=config_coordinator,
        device_coordinator=device_coordinator,
        protect_coordinator=protect_coordinator,
        network_client=network_client,
        protect_client=protect_client,
        _facade_coordinator=facade_coordinator,
    )

    # Set up platforms
    _LOGGER.debug("Setting up platforms: %s", PLATFORMS)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Reload entry when its updated
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    _LOGGER.info("UniFi Insights integration setup completed successfully")
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: UnifiInsightsConfigEntry
) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading UniFi Insights config entry")

    # Close API clients if available
    if hasattr(entry, "runtime_data") and entry.runtime_data:
        data = entry.runtime_data
        _LOGGER.debug("Closing API clients")
        if data.protect_client:
            # Stop WebSocket if active (on protect coordinator)
            if data.protect_coordinator:
                websocket_task = getattr(
                    data.protect_coordinator, "websocket_task", None
                )
                if websocket_task:
                    websocket_task.cancel()
            # Close Protect client (await the async close)
            try:
                await data.protect_client.close()
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Error closing Protect client: %s", err)

        # Close Network client (await the async close)
        if data.network_client:
            try:
                await data.network_client.close()
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Error closing Network client: %s", err)

    unload_ok: bool = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        # Check if this is the last config entry, unload services
        remaining_entries = [
            e
            for e in hass.config_entries.async_entries(DOMAIN)
            if e.entry_id != entry.entry_id
        ]
        if not remaining_entries:
            _LOGGER.debug("No more config entries, unloading services")
            await async_unload_services(hass)
            if DOMAIN in hass.data:
                hass.data.pop(DOMAIN)
            _LOGGER.info("UniFi Insights services unloaded")

    return unload_ok


async def async_reload_entry(
    hass: HomeAssistant, entry: UnifiInsightsConfigEntry
) -> None:
    """Reload config entry."""
    await hass.config_entries.async_reload(entry.entry_id)
