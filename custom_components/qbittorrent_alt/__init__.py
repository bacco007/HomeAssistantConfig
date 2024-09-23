from __future__ import annotations

from os import path
from typing import TYPE_CHECKING

from aiohttp.client_exceptions import ClientConnectorError
from aioqbt.exc import APIError, LoginError
from homeassistant.const import (
    CONF_NAME,
    CONF_PASSWORD,
    CONF_URL,
    CONF_USERNAME,
    CONF_VERIFY_SSL,
)
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN, PLATFORMS
from .coordinator import QBittorrentDataCoordinator
from .helpers import get_torrent_info, setup_client

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

type QBittorrentConfigEntry = ConfigEntry[QBittorrentDataCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: QBittorrentConfigEntry) -> bool:
    """Set up qBittorrent from a config entry."""

    async def service_torrent_info(call: ServiceCall) -> ServiceResponse:
        torrent_hash = call.data.get("hash", "all")
        if torrent_hash not in ("", "all"):
            torrent = await coordinator.client.torrents.info(hashes=[torrent_hash])
            return get_torrent_info(torrent[0])
        torrents = await coordinator.client.torrents.info(
            filter=call.data.get("filter", None)
        )
        return {"torrents": [get_torrent_info(torrent) for torrent in torrents]}

    async def service_pause_torrents(call: ServiceCall) -> None:
        await coordinator.client.torrents.pause(hashes=call.data.get("hash", "all"))

    async def service_resume_torrents(call: ServiceCall) -> None:
        await coordinator.client.torrents.resume(hashes=call.data.get("hash", "all"))

    try:
        client = await setup_client(
            path.join(entry.data[CONF_URL], "api/v2"),  # noqa: PTH118
            entry.data.get(CONF_USERNAME),
            entry.data.get(CONF_PASSWORD),
            entry.data[CONF_VERIFY_SSL],
        )
    except LoginError as err:
        raise ConfigEntryAuthFailed("Invalid credentials") from err
    except (ClientConnectorError, APIError) as err:
        raise ConfigEntryNotReady("Failed to connect") from err

    coordinator = QBittorrentDataCoordinator(
        hass,
        client,
        DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            sw_version=str(client.client_version),
            name=entry.data[CONF_NAME],
        ),
    )
    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator
    hass.services.async_register(
        DOMAIN,
        "torrent_info",
        service_torrent_info,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(DOMAIN, "pause_torrents", service_pause_torrents)
    hass.services.async_register(DOMAIN, "resume_torrents", service_resume_torrents)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: QBittorrentConfigEntry
) -> bool:
    """Unload qBittorrent config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        del entry.runtime_data
    return unload_ok
