"""GitHub Releases coordinator for WiCAN firmware updates."""

from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
from typing import TYPE_CHECKING, Any

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    GITHUB_API_RELEASES_URL,
    GITHUB_API_TIMEOUT,
    GITHUB_OWNER,
    GITHUB_RELEASES_UPDATE_INTERVAL,
    GITHUB_REPO,
)

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

UPDATE_INTERVAL = timedelta(seconds=GITHUB_RELEASES_UPDATE_INTERVAL)


class GitHubReleasesCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator to fetch GitHub releases."""

    def __init__(self, hass: HomeAssistant, is_pro: bool = False) -> None:
        """Initialize the coordinator.

        Args:
            hass: Home Assistant instance.
            is_pro: Whether this is for a WiCAN-PRO device.

        """
        super().__init__(
            hass,
            _LOGGER,
            name="WiCAN GitHub Releases",
            update_interval=UPDATE_INTERVAL,
        )
        self._is_pro = is_pro

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch latest release from GitHub."""
        url = GITHUB_API_RELEASES_URL.format(
            owner=GITHUB_OWNER,
            repo=GITHUB_REPO,
        )

        session = async_get_clientsession(self.hass)

        try:
            async with asyncio.timeout(GITHUB_API_TIMEOUT):
                response = await session.get(
                    url,
                    headers={"Accept": "application/vnd.github.v3+json"},
                )
                response.raise_for_status()
                releases = await response.json()

            # Filter for latest non-prerelease
            stable_releases = [r for r in releases if not r.get("prerelease", False)]

            if not stable_releases:
                _LOGGER.warning("No stable releases found")
                return {}

            # Filter by device type (PRO vs standard)
            # PRO releases have "PRO" in name or "P" in tag_name (case-insensitive)
            def is_pro_release(release: dict[str, Any]) -> bool:
                """Check if release is for WiCAN-PRO."""
                name = str(release.get("name", "")).upper()
                tag = str(release.get("tag_name", "")).upper()
                return "PRO" in name or "P" in tag

            device_specific_releases = [
                r for r in stable_releases
                if is_pro_release(r) == self._is_pro
            ]

            if not device_specific_releases:
                device_type = "PRO" if self._is_pro else "standard"
                _LOGGER.warning(
                    "No stable %s releases found (found %d releases for other type)",
                    device_type,
                    len(stable_releases),
                )
                return {}

            latest = device_specific_releases[0]
            _LOGGER.debug(
                "Latest %s release: %s",
                "PRO" if self._is_pro else "standard",
                latest.get("tag_name"),
            )
        except TimeoutError as err:
            raise UpdateFailed("Timeout fetching GitHub releases") from err
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error fetching GitHub releases: {err}") from err
        except (ValueError, KeyError) as err:
            raise UpdateFailed(f"Invalid response from GitHub: {err}") from err
        else:
            return latest
