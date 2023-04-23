import logging
import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import CONF_NAME
from datetime import timedelta
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity import Entity
from .google_trends import get_top_trends
from .const import CONF_COUNTRY_CODE, CONF_UPDATE_INTERVAL, CONF_TRENDS_COUNT
from homeassistant.helpers.event import async_call_later

_LOGGER = logging.getLogger(__name__)

CONF_COUNTRY_CODE = "country_code"
CONF_UPDATE_INTERVAL = "update_interval"

DEFAULT_NAME = "Google Trends"
DEFAULT_COUNTRY_CODE = "united_kingdom"
DEFAULT_UPDATE_INTERVAL = 5


async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the Google Trends sensors."""
    country_code = config_entry.data[CONF_COUNTRY_CODE]
    trends_count = config_entry.data[CONF_TRENDS_COUNT]
    update_interval = timedelta(minutes=config_entry.data[CONF_UPDATE_INTERVAL])

    trends = await hass.async_add_executor_job(
        get_top_trends, str(country_code), trends_count
    )

    async_add_entities([
        GoogleTrendsSensor(trends, update_interval, country_code)
    ], True)


class GoogleTrendsSensor(Entity):
    def __init__(self, trends, interval, country_code):
        """Initialize the Google Trends sensor."""
        self._trends = trends
        self._interval = interval
        self._country_code = country_code
        self._index = 0

    @property
    def name(self):
        return f"Google Trend"

    @property
    def state(self):
        return self._trends[self._index]

    @property
    def icon(self):
        return "mdi:google"

    @property
    def unique_id(self):
        return f"google_trend"

    async def async_added_to_hass(self):
        async def async_update_and_schedule(next_update):
            await self.async_update()
            async_call_later(self.hass, next_update, async_update_and_schedule)

        await async_update_and_schedule(self._interval.total_seconds())

    async def async_update(self):
        self._trends = await self.hass.async_add_executor_job(
            get_top_trends, self._country_code, len(self._trends))
        self._index = (self._index + 1) % len(self._trends)