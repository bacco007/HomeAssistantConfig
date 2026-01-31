"""Data update coordinator for the NEO Watcher integration."""

import asyncio
import logging
from datetime import date, timedelta, datetime, time
from typing import List
from urllib.parse import quote
import aiohttp
import random
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from .const import DOMAIN, CONF_API_KEY, SCAN_INTERVAL, CONF_WEEKS_AHEAD, DEFAULT_WEEKS_AHEAD, CONF_UPDATE_HOUR, DEFAULT_UPDATE_HOUR


_LOGGER = logging.getLogger(__name__)


class NeoWatcherCoordinator(DataUpdateCoordinator):
    """Data update coordinator for the NEO Watcher integration."""

    def __init__(self, hass: HomeAssistant, api_key: str, weeks_ahead: int = DEFAULT_WEEKS_AHEAD, specific_neo: str | None = None, update_hour: int = DEFAULT_UPDATE_HOUR) -> None:
        """Initialize the coordinator."""
        self.api_key = api_key
        self.weeks_ahead = weeks_ahead
        self.specific_neo = specific_neo #Added this line
        self.headers = None  # Initialize headers attribute
        self.from_date = None  # Initialize from_date
        self.to_date = None  # Initialize to_date
        self.last_update_time = None
        self.all_objects = []
        self.all_hazardous_objects = []
        self.all_non_hazardous_objects = []
        self.update_hour = update_hour
        self.update_minute = random.randint(0, 59)
        self.update_interval = self._calculate_update_interval()
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=self.update_interval,
        )

    def _calculate_update_interval(self) -> timedelta:
        """Calculate the update interval based on the selected hour and a random minute."""
        now = datetime.now()
        target_time = time(hour=self.update_hour, minute=self.update_minute)
        target_datetime = datetime.combine(now.date(), target_time)

        if target_datetime <= now:
            # If the target time is today and has already passed, schedule for tomorrow
            target_datetime += timedelta(days=1)

        interval = target_datetime - now
        _LOGGER.debug(f"Next update scheduled for: {target_datetime.strftime('%Y-%m-%d %H:%M:%S')}")
        return interval

    async def _async_update_data(self):
        """Fetch data from API endpoint and process it."""
        _LOGGER.debug("Starting data update process.")
        self.update_interval = self._calculate_update_interval()
        self.update_minute = random.randint(0, 59)
        self.update_interval = self._calculate_update_interval()
        self.async_set_updated_data(self.all_hazardous_objects)
        try:
            if self.specific_neo:
                # Fetch data for specific NEO
                url = f"http://api.nasa.gov/neo/rest/v1/neo/{quote(self.specific_neo)}?api_key={self.api_key}"
                _LOGGER.debug(f"Fetching data for specific NEO: {self.specific_neo}")
                async with aiohttp.ClientSession() as session:
                    async with session.get(url) as response:
                        self.headers = response.headers
                        response.raise_for_status()
                        data = await response.json()
                        self.all_objects = [data]
                        self.all_hazardous_objects = [data] if data["is_potentially_hazardous_asteroid"] else []
                        self.all_non_hazardous_objects = [data] if not data["is_potentially_hazardous_asteroid"] else []
                        self.from_date = datetime.strptime(data["close_approach_data"][0]["close_approach_date"], "%Y-%m-%d").date()
                        self.to_date = datetime.strptime(data["close_approach_data"][-1]["close_approach_date"], "%Y-%m-%d").date()

            else:
                # Fetch data for top NEOs (existing logic)
                today = date.today()
                self.all_objects = []
                self.all_hazardous_objects = []
                self.all_non_hazardous_objects = []
                self.from_date = today
                for i in range(self.weeks_ahead):
                    start_date = today + timedelta(days=i * 7)
                    end_date = start_date + timedelta(days=6)
                    if i == self.weeks_ahead - 1:
                        self.to_date = end_date
                    start_date_str = start_date.strftime("%Y-%m-%d")
                    end_date_str = end_date.strftime("%Y-%m-%d")
                    url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date_str}&end_date={end_date_str}&api_key={self.api_key}"
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url) as response:
                            self.headers = response.headers
                            response.raise_for_status()
                            data = await response.json()
                            objects = data.get("near_earth_objects", {})
                            for date_str, objects_list in objects.items():
                                self.all_objects.extend(objects_list)
                                hazardous_objects = [
                                    obj
                                    for obj in objects_list
                                    if obj["is_potentially_hazardous_asteroid"]
                                ]
                                self.all_hazardous_objects.extend(hazardous_objects)
                                non_hazardous_objects = [
                                    obj
                                    for obj in objects_list
                                    if not obj["is_potentially_hazardous_asteroid"]
                                ]
                                self.all_non_hazardous_objects.extend(non_hazardous_objects)

                self.all_hazardous_objects.sort(
                    key=lambda x: float(x["close_approach_data"][0]["miss_distance"]["miles"])
                )
                self.all_non_hazardous_objects.sort(
                    key=lambda x: float(x["close_approach_data"][0]["miss_distance"]["miles"])
                )

            self.last_update_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return self.all_hazardous_objects

        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error communicating with API: {err}")
            raise UpdateFailed(f"Error communicating with API: {err}") from err
        except Exception as err:
            _LOGGER.error(f"An unexpected error occurred: {err}")
            raise UpdateFailed(f"An unexpected error occurred: {err}") from err

    async def async_fetch_horizon_data_for_objects(self, hass: HomeAssistant, feed_entities: List) -> None:
        """Fetch horizon data for all objects."""
        _LOGGER.debug("Starting async_fetch_horizon_data_for_objects")
        tasks = [entity._async_fetch_and_set_extra_attributes() for entity in feed_entities]
        await asyncio.gather(*tasks)
        _LOGGER.debug("Completed async_fetch_horizon_data_for_objects")
        self.last_update_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.async_update_listeners()

