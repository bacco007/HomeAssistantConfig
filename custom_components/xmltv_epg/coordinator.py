"""DataUpdateCoordinator for xmltv_epg."""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from custom_components.xmltv_epg.model.guide import TVGuide

from .api import (
    XMLTVClient,
    XMLTVClientError,
)
from .const import DOMAIN, LOGGER, SENSOR_REFRESH_INTERVAL


# https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
class XMLTVDataUpdateCoordinator(DataUpdateCoordinator[TVGuide]):
    """Class to manage fetching data from XMLTV."""

    config_entry: ConfigEntry

    __client: XMLTVClient
    __lookahead: timedelta
    __enable_upcoming_sensor: bool
    __enable_channel_icon: bool
    __enable_program_image: bool

    __guide: TVGuide
    __last_refetch_time: datetime | None
    __refetch_interval: timedelta

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ConfigEntry,
        client: XMLTVClient,
        update_interval: int,
        lookahead: int,
        enable_upcoming_sensor: bool,
        enable_channel_icon: bool,
        enable_program_image: bool,
    ) -> None:
        """Initialize."""
        self.__client = client
        self.__lookahead = timedelta(minutes=lookahead)
        self.__enable_upcoming_sensor = enable_upcoming_sensor
        self.__enable_channel_icon = enable_channel_icon
        self.__enable_program_image = enable_program_image

        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=SENSOR_REFRESH_INTERVAL),
            config_entry=config_entry,
        )

        self.__guide = TVGuide()
        self.__last_refetch_time = None
        self.__refetch_interval = timedelta(hours=update_interval)

    async def _refetch_tv_guide(self):
        """Re-fetch TV guide data."""
        try:
            guide = await self.__client.async_get_data()
            LOGGER.debug(
                f"Updated XMLTV guide /w {len(guide.channels)} channels and {len(guide.programs)} programs."
            )

            self.__guide = guide
            self.__last_refetch_time = self.actual_now
        except XMLTVClientError as exception:
            raise UpdateFailed(exception) from exception

    def _should_refetch(self) -> bool:
        """Check if data should be refetched?."""
        # no guide data yet ?
        if not self.__guide or not self.__last_refetch_time:
            return True

        # check if refetch interval has passed
        next_refetch_time = self.__last_refetch_time + self.__refetch_interval
        return self.actual_now >= next_refetch_time

    async def _async_update_data(self):
        """Update data from cache or re-fetch if cache is expired."""
        if self._should_refetch():
            await self._refetch_tv_guide()

        return self.__guide

    @property
    def actual_now(self) -> datetime:
        """Get actual current time."""
        return datetime.now()

    @property
    def current_time(self) -> datetime:
        """Get effective current time."""
        return self.actual_now + self.__lookahead

    @property
    def last_update_time(self) -> datetime | None:
        """Get last update time."""
        return self.__last_refetch_time

    @property
    def enable_upcoming_sensor(self) -> bool:
        """Get enable upcoming sensor."""
        return self.__enable_upcoming_sensor

    @property
    def enable_channel_icon(self) -> bool:
        """Get enable channel icon entity."""
        return self.__enable_channel_icon

    @property
    def enable_program_image(self) -> bool:
        """Get enable program image entities."""
        return self.__enable_program_image

    @property
    def _last_refetch_time(self) -> datetime | None:
        """Get last refetch time."""
        return self.__last_refetch_time
