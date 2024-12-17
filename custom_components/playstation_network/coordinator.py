"""The IntelliFire integration."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from psnawp_api.core.psnawp_exceptions import PSNAWPAuthenticationError

from .const import DEVICE_SCAN_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class PsnCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Data update coordinator for PSN."""

    def __init__(self, hass: HomeAssistant, api, user, client) -> None:
        """Initialize the Coordinator."""
        super().__init__(
            hass,
            name=DOMAIN,
            logger=_LOGGER,
            update_interval=DEVICE_SCAN_INTERVAL,
        )

        self.hass = hass
        self.entities = []
        self.api = api
        self.user = user
        self.client = client
        self.data = {
            "presence": {},
            "available": False,
            "online_status": False,
            "profile": {},
            "platform": {},
            "title_metadata": {},
            "friends": [],
            "trophy_summary": [],
            "title_details": {},
            "title_trophies": {},
            "title_stats": {},
            "username": "",
            "recent_titles": [],
            "country": "",
            "language": "",
        }

    async def _async_update_data(self) -> dict[str, Any]:
        """Get the latest data from the PSN."""
        try:
            self.data["username"] = self.user.online_id
            self.data["profile"] = await self.hass.async_add_executor_job(
                lambda: self.user.profile()
            )
            self.data["presence"] = await self.hass.async_add_executor_job(
                self.user.get_presence
            )
            self.data["available"] = (
                self.data["presence"].get("basicPresence").get("availability")
                == "availableToPlay"
            )
            self.data["platform"] = (
                self.data["presence"].get("basicPresence").get("primaryPlatformInfo")
            )
            try:
                self.data["title_metadata"] = (
                    self.data["presence"]
                    .get("basicPresence")
                    .get("gameTitleInfoList")[0]
                )
            except Exception:
                self.data["title_metadata"] = {}

            # self.data["friends"] = await self.client.available_to_play()
            self.data["trophy_summary"] = await self.hass.async_add_executor_job(
                self.client.trophy_summary
            )

            self.data["country"] = self.hass.config.country
            self.data["language"] = self.hass.config.language

            if (
                self.data["available"] is True
                and self.data["title_metadata"].get("npTitleId") is not None
            ):
                title_id = self.data["title_metadata"].get("npTitleId")
                title = await self.hass.async_add_executor_job(
                    lambda: self.api.game_title(title_id, "me")
                )
                ## Attempt to pull details with user's country and language code
                self.data["title_details"] = await self.hass.async_add_executor_job(
                    lambda: title.get_details(
                        self.hass.config.country, self.hass.config.language
                    )
                )
                ## If we receive an error, fall back to english
                if self.data["title_details"][0].get("errorCode") is not None:
                    self.data["title_details"] = await self.hass.async_add_executor_job(
                        title.get_details
                    )

                trophy_titles = await self.hass.async_add_executor_job(
                    lambda: self.client.trophy_titles_for_title(
                        title_ids=[title.title_id]
                    )
                )
                await self.hass.async_add_executor_job(
                    lambda: self.get_trophies(trophy_titles)
                )

                titles_with_stats = await self.hass.async_add_executor_job(
                    lambda: self.client.title_stats(limit=3, page_size=3)
                )
                await self.hass.async_add_executor_job(
                    lambda: self.get_titles(titles_with_stats)
                )

            return self.data
        except PSNAWPAuthenticationError as error:
            raise ConfigEntryAuthFailed(error) from error
        except Exception as ex:
            raise UpdateFailed(
                f"Error communicating with the Playstation Network {ex}"
            ) from ex

    def get_titles(self, titles):
        for title in titles:
            self.data["recent_titles"].append(title)

    def get_trophies(self, trophy_titles):
        for trophy_title in trophy_titles:
            self.data["title_trophies"] = trophy_title
