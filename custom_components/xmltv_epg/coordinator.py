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
class XMLTVDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from XMLTV."""

    config_entry: ConfigEntry
    data: TVGuide

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
        self.client = client
        self._lookahead = timedelta(minutes=lookahead)
        self._enable_upcoming_sensor = enable_upcoming_sensor
        self._enable_channel_icon = enable_channel_icon
        self._enable_program_image = enable_program_image

        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=SENSOR_REFRESH_INTERVAL),
            config_entry=config_entry,
        )

        self._guide = None
        self._last_refetch_time = None
        self._refetch_interval = timedelta(hours=update_interval)

    async def _refetch_tv_guide(self):
        """Re-fetch TV guide data."""
        try:
            guide = await self.client.async_get_data()
            LOGGER.debug(
                f"Updated XMLTV guide /w {len(guide.channels)} channels and {len(guide.programs)} programs."
            )

            self._guide = guide
            self._last_refetch_time = self.actual_now
        except XMLTVClientError as exception:
            raise UpdateFailed(exception) from exception

    def _should_refetch(self) -> bool:
        """Check if data should be refetched?."""
        # no guide data yet ?
        if not self._guide or not self._last_refetch_time:
            return True

        # check if refetch interval has passed
        next_refetch_time = self._last_refetch_time + self._refetch_interval
        return self.actual_now >= next_refetch_time

    async def _async_update_data(self):
        """Update data from cache or re-fetch if cache is expired."""
        if self._should_refetch():
            await self._refetch_tv_guide()

        return self._guide

    @property
    def actual_now(self) -> datetime:
        """Get actual current time."""
        return datetime.now()

    @property
    def current_time(self) -> datetime:
        """Get effective current time."""
        return self.actual_now + self._lookahead

    @property
    def last_update_time(self) -> datetime | None:
        """Get last update time."""
        return self._last_refetch_time

    @property
    def enable_upcoming_sensor(self) -> bool:
        """Get enable upcoming sensor."""
        return self._enable_upcoming_sensor

    @property
    def enable_channel_icon(self) -> bool:
        """Get enable channel icon entity."""
        return self._enable_channel_icon

    @property
    def enable_program_image(self) -> bool:
        """Get enable program image entities."""
        return self._enable_program_image
