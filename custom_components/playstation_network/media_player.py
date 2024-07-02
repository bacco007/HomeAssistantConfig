"""Media player entity for PSN."""

import logging
from dataclasses import dataclass

from homeassistant.components.media_player import (
    MediaPlayerDeviceClass,
    MediaPlayerEntity,
    MediaPlayerState,
    MediaType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, PSN_COORDINATOR
from .entity import PSNEntity

_LOGGER = logging.getLogger(__name__)


@dataclass
class PSNdata:
    """PSN dataclass"""

    account = {"id": "", "handle": ""}
    presence = {"availability": "", "lastAvailableDate": ""}
    platform = {"status": "", "platform": ""}
    title = {"name": "", "format": "", "imageURL": None, "playing": False}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Entity Setup"""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][PSN_COORDINATOR]

    if coordinator.data.get("platform").get("platform") is None:
        username = coordinator.data.get("username")
        _LOGGER.warning(
            "No console found associated with account: %s. -- Skipping creation of media player",
            username,
        )
        return

    async_add_entities([MediaPlayer(coordinator)])


class MediaPlayer(PSNEntity, MediaPlayerEntity):
    """Media player entity representing currently playing game"""

    device_class = MediaPlayerDeviceClass.TV

    def __init__(self, coordinator) -> None:
        """Initialize PSN MediaPlayer."""
        super().__init__(coordinator)
        self.data = self.coordinator.data
        self._attr_has_entity_name = True

    @property
    def icon(self):
        return "mdi:sony-playstation"

    @property
    def media_image_remotely_accessible(self):
        return True

    @property
    def state(self):
        match self.data.get("platform").get("onlineStatus"):
            case "online":
                if (
                    self.data.get("available") is True
                    and self.data.get("title_metadata").get("npTitleId") is not None
                ):
                    return MediaPlayerState.PLAYING
                else:
                    return MediaPlayerState.ON
            case "offline":
                return MediaPlayerState.OFF
            case _:
                return MediaPlayerState.OFF

    @property
    def unique_id(self):
        return f"{self.data.get('username').lower()}_{self.data.get('platform').get('platform').lower()}_console"

    @property
    def name(self):
        return f"{self.data.get('platform').get('platform')} Console"

    @property
    def media_content_type(self):
        """Content type of current playing media."""
        return MediaType.GAME

    @property
    def media_title(self):
        if self.data.get("title_metadata").get("npTitleId"):
            return self.data.get("title_metadata").get("titleName")
        if self.data.get("platform").get("onlineStatus") == "online":
            return "Browsing the menu"
        else:
            return None

    @property
    def app_name(self):
        return ""

    @property
    def media_image_url(self):
        if self.data.get("title_metadata").get("npTitleId"):
            title = self.data.get("title_metadata")
            if title.get("format").casefold() == "ps5":
                return title.get("conceptIconUrl")

            if title.get("format").casefold() == "ps4":
                return title.get("npTitleIconUrl")
        return None

    @property
    def is_on(self):
        """Is user available on PSN"""
        return self.data.get("available") is True

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""

        self.async_write_ha_state()
