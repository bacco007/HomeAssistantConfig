import logging
from datetime import timedelta
from typing import Any

from aiohttp import ClientResponseError
from aioqbt.client import APIClient
from aioqbt.exc import APIError, LoginError
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class QBittorrentDataCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """QBittorrent update coordinator."""

    def __init__(
        self, hass: HomeAssistant, client: APIClient, device_info: DeviceInfo
    ) -> None:
        """Initialize coordinator."""
        self.client = client
        self.device_info = device_info
        self.skiped_update = False
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=30),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            main_data = await self.client.sync.maindata()
            if self.data and (
                main_data.server_state["dl_info_data"]
                < self.data["sync"].server_state["dl_info_data"]
                or main_data.server_state["up_info_data"]
                < self.data["sync"].server_state["up_info_data"]
            ):
                # qbittorrent restarted, skipping first update
                if self.skiped_update:
                    # already skipped
                    self.skiped_update = False
                else:
                    main_data = self.data["sync"]
                    self.skiped_update = True
            downloading = 0
            seeding = 0
            paused = 0
            stalled = 0
            uploading = 0
            longest_eta = 0
            for torrent in main_data.torrents.values():
                if (
                    torrent["state"] == "downloading"
                    or torrent["state"] == "metaDL"
                    or torrent["state"] == "forcedDL"
                ):
                    downloading += 1
                if torrent["state"] == "stalledUP" or torrent["state"] == "forcedUP":
                    seeding += 1
                if torrent["state"] == "uploading":
                    uploading += 1
                if torrent["state"] == "pausedUP" or torrent["state"] == "pausedDL":
                    paused += 1
                if torrent["state"] == "stalledDL":
                    stalled += 1
                if torrent["eta"] != 8640000 and torrent["eta"] > longest_eta:
                    longest_eta = torrent["eta"]
            return {
                "sync": main_data,
                "preferences": await self.client.app.preferences(),
                "downloading": downloading,
                "seeding": seeding,
                "uploading": uploading,
                "paused": paused,
                "stalled": stalled,
                "total": len(main_data.torrents),
                "longest_eta": longest_eta,
            }
        except LoginError as exc:
            raise ConfigEntryAuthFailed("Invalid authentication") from exc
        except (APIError, ClientResponseError) as exc:
            raise UpdateFailed from exc
