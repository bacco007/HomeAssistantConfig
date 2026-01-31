"""Sensor platform for NSW Fire Danger Ratings."""
from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
from typing import Any

import aiohttp
import async_timeout

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

_LOGGER = logging.getLogger(__name__)

API_URL = "https://www.rfs.nsw.gov.au/_designs/xml/fire-danger-ratings/fire-danger-ratings-v2"
SCAN_INTERVAL = timedelta(minutes=30)

# Fire danger rating levels for icon selection
RATING_ICONS = {
    "MODERATE": "mdi:fire",
    "HIGH": "mdi:fire-alert",
    "EXTREME": "mdi:fire-truck",
    "CATASTROPHIC": "mdi:skull-crossbones",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up NSW Fire Danger sensors from a config entry."""
    area_id = entry.data.get("area", "4")
    area_name = entry.data.get("area_name", "Greater Sydney Region")
    
    coordinator = NSWFireDangerCoordinator(hass, area_id)
    await coordinator.async_config_entry_first_refresh()
    
    sensors = [
        NSWFireDangerSensor(coordinator, "rating_today", "Rating Today", area_name),
        NSWFireDangerSensor(coordinator, "rating_tomorrow", "Rating Tomorrow", area_name),
        NSWFireDangerSensor(coordinator, "rating_day3", "Rating Day 3", area_name),
        NSWFireDangerSensor(coordinator, "rating_day4", "Rating Day 4", area_name),
        NSWFireDangerSensor(coordinator, "toban_today", "Total Fire Ban Today", area_name),
        NSWFireDangerSensor(coordinator, "toban_tomorrow", "Total Fire Ban Tomorrow", area_name),
        NSWFireDangerSensor(coordinator, "toban_day3", "Total Fire Ban Day 3", area_name),
        NSWFireDangerSensor(coordinator, "toban_day4", "Total Fire Ban Day 4", area_name),
    ]
    
    async_add_entities(sensors, True)


class NSWFireDangerCoordinator(DataUpdateCoordinator):
    """Class to manage fetching NSW Fire Danger data."""

    def __init__(self, hass: HomeAssistant, area_id: str) -> None:
        """Initialize."""
        super().__init__(
            hass,
            _LOGGER,
            name="NSW Fire Danger",
            update_interval=SCAN_INTERVAL,
        )
        self.area_id = area_id

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from API."""
        try:
            async with async_timeout.timeout(15):
                headers = {
                    "User-Agent": "HomeAssistant/NSWFireDanger",
                    "Accept": "application/json, text/html",
                }
                async with aiohttp.ClientSession(headers=headers) as session:
                    async with session.get(API_URL) as response:
                        if response.status != 200:
                            raise UpdateFailed(f"Error fetching data: {response.status}")
                        
                        # Handle the response - API returns JSON with text/html content-type
                        try:
                            data = await response.json(content_type=None)
                        except Exception:
                            # Fallback to parsing text
                            text = await response.text()
                            import json
                            data = json.loads(text)
                        
                        # Find the data for the specified area
                        for area in data.get("fireWeatherAreaRatings", []):
                            if area.get("areaId") == self.area_id:
                                return {
                                    "area_name": area.get("areaName"),
                                    "area_councils": area.get("areaCouncils"),
                                    "rating_today": area.get("ratingToday"),
                                    "rating_tomorrow": area.get("ratingTomorrow"),
                                    "rating_day3": area.get("ratingDay3"),
                                    "rating_day4": area.get("ratingDay4"),
                                    "toban_today": area.get("tobanToday"),
                                    "toban_tomorrow": area.get("tobanTomorrow"),
                                    "toban_day3": area.get("tobanDay3"),
                                    "toban_day4": area.get("tobanDay4"),
                                    "last_updated": data.get("lastUpdatedIso"),
                                }
                        
                        raise UpdateFailed(f"Area ID {self.area_id} not found in API response")
        except asyncio.TimeoutError:
            raise UpdateFailed("Timeout fetching data from API")
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}")


class NSWFireDangerSensor(CoordinatorEntity, SensorEntity):
    """Representation of a NSW Fire Danger Sensor."""

    def __init__(
        self,
        coordinator: NSWFireDangerCoordinator,
        sensor_type: str,
        sensor_name: str,
        area_name: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._area_name = area_name
        self._attr_name = f"NSW Fire Danger {area_name} {sensor_name}"
        self._attr_unique_id = f"nsw_fire_danger_{coordinator.area_id}_{sensor_type}"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if self.coordinator.data:
            return self.coordinator.data.get(self._sensor_type)
        return None

    @property
    def icon(self) -> str:
        """Return the icon to use in the frontend."""
        if self._sensor_type.startswith("rating"):
            rating = self.state
            return RATING_ICONS.get(rating, "mdi:fire")
        elif self._sensor_type.startswith("toban"):
            return "mdi:cancel" if self.state == "Yes" else "mdi:check-circle"
        return "mdi:information"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional attributes."""
        if not self.coordinator.data:
            return {}
        
        attrs = {
            "area_id": self.coordinator.area_id,
            "area_name": self.coordinator.data.get("area_name"),
            "area_councils": self.coordinator.data.get("area_councils"),
            "last_updated": self.coordinator.data.get("last_updated"),
        }
        
        # Add all ratings and TOBAN info as attributes for context
        if self._sensor_type.startswith("rating"):
            attrs.update({
                "toban_today": self.coordinator.data.get("toban_today"),
                "toban_tomorrow": self.coordinator.data.get("toban_tomorrow"),
                "toban_day3": self.coordinator.data.get("toban_day3"),
                "toban_day4": self.coordinator.data.get("toban_day4"),
            })
        
        return attrs
