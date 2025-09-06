"""Sensor platform for Untappd."""
import logging
from datetime import timedelta
from typing import Any, Dict

from pyuntappd import Untappd
import voluptuous as vol

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION, CONF_CLIENT_ID, CONF_CLIENT_SECRET, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, CoordinatorEntity, UpdateFailed
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

ATTRIBUTION = "Information provided by Untappd"
SCAN_INTERVAL = timedelta(minutes=5)
ICON = "mdi:glass-mug-variant"

# Sensor attribute keys
ATTR_ABV = "abv"
ATTR_BEER = "beer"
ATTR_BREWERY = "brewery"
ATTR_SCORE = "score"
ATTR_VENUE = "venue"
ATTR_TOTAL_BADGES = "total_badges"
ATTR_TOTAL_BEERS = "total_beers"
ATTR_TOTAL_CREATED_BEERS = "total_created_beers"
ATTR_TOTAL_CHECKINS = "checkins"
ATTR_TOTAL_FOLLOWINGS = "followings"
ATTR_TOTAL_FRIENDS = "friends"
ATTR_TOTAL_PHOTOS = "photos"
ATTR_BADGE_NAME = "badge_name"
ATTR_BADGE_LEVEL = "level"
ATTR_BADGE_DESCRIPTION = "description"

WISHLIST_DATA_KEY = "wishlist_beers"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Untappd sensor platform."""
    username = entry.data[CONF_USERNAME]
    api_id = entry.data[CONF_CLIENT_ID]
    api_secret = entry.data[CONF_CLIENT_SECRET]

    coordinator = UntappdDataUpdateCoordinator(hass, username, api_id, api_secret)

    await coordinator.async_config_entry_first_refresh()

    sensors = [
        UntappdCheckinSensor(coordinator),
        UntappdWishlistSensor(coordinator),
        UntappdLastBadgeSensor(coordinator),
    ]
    async_add_entities(sensors)


class UntappdDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching Untappd data."""

    def __init__(self, hass, username, api_id, api_secret):
        """Initialize the data update coordinator."""
        self.username = username
        self.api_id = api_id
        self.api_secret = api_secret
        self._untappd = Untappd()

        super().__init__(
            hass,
            _LOGGER,
            name="Untappd",
            update_interval=SCAN_INTERVAL,
        )

    async def _async_update_data(self) -> Dict[str, Any]:
        """Fetch data from API."""
        try:
            # We run the synchronous pyuntappd library calls in an executor
            # to avoid blocking the Home Assistant event loop.
            checkin_data = await self.hass.async_add_executor_job(
                self._untappd.get_last_activity, self.api_id, self.api_secret, self.username
            )
            user_info = await self.hass.async_add_executor_job(
                self._untappd.get_info, self.api_id, self.api_secret, self.username
            )
            wishlist = await self.hass.async_add_executor_job(
                self._untappd.get_wishlist, self.api_id, self.api_secret, self.username
            )
            badges = await self.hass.async_add_executor_job(
                self._untappd.get_badges, self.api_id, self.api_secret, self.username
            )

            # Process wishlist data
            wishlist_beers = {}
            if wishlist and wishlist.get("items"):
                for beer in wishlist["items"]:
                    name = beer["beer"]["beer_name"]
                    wishlist_beers[name] = {
                        "beer_name": name,
                        "beer_label": beer["beer"]["beer_label"],
                        "beer_description": beer["beer"]["beer_description"],
                        "beer_abv": beer["beer"]["beer_abv"],
                        "beer_style": beer["beer"]["beer_style"],
                        "beer_ibu": beer["beer"]["beer_ibu"],
                        "beer_link": f"https://untappd.com/b/{beer['beer']['beer_slug']}/{beer['beer']['bid']}",
                        "rating_score": beer["beer"]["rating_score"],
                        "rating_count": beer["beer"]["rating_count"],
                        "brewery_label": beer["brewery"]["brewery_label"],
                        "brewery_name": beer["brewery"]["brewery_name"],
                        "country_name": beer["brewery"]["country_name"],
                    }

            return {
                "checkin": checkin_data,
                "user_info": user_info,
                "wishlist_count": wishlist.get("count", 0) if wishlist else 0,
                WISHLIST_DATA_KEY: wishlist_beers,
                "last_badge": badges[0] if badges else None,
            }

        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err


class UntappdCheckinSensor(CoordinatorEntity, SensorEntity):
    """Representation of an Untappd check-in sensor."""

    def __init__(self, coordinator: UntappdDataUpdateCoordinator):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._username = coordinator.username
        self._attr_name = f"Untappd Last Check-in ({self._username})"
        self._attr_unique_id = f"untappd_{self._username}_last_checkin"
        self._attr_icon = ICON
        self._attr_device_class = "timestamp"  # This lets HA display "x hours ago"

    @property
    def native_value(self):
        """Return the state of the sensor."""
        if self.coordinator.data and self.coordinator.data.get("checkin"):
            created_at = self.coordinator.data["checkin"]["created_at"]
            # Convert the string timestamp to a timezone-aware datetime object
            return dt_util.parse_datetime(created_at)
        return None

    @property
    def entity_picture(self):
        """Return the entity picture."""
        if self.coordinator.data and self.coordinator.data.get("checkin"):
            return self.coordinator.data["checkin"]["beer"]["beer_label"]
        return None

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("checkin") or not self.coordinator.data.get("user_info"):
            return {}

        checkin = self.coordinator.data["checkin"]
        user_info = self.coordinator.data["user_info"]

        return {
            ATTR_BEER: checkin["beer"]["beer_name"],
            ATTR_BREWERY: checkin["brewery"]["brewery_name"],
            ATTR_SCORE: checkin["rating_score"],
            ATTR_VENUE: checkin["venue"]["venue_name"] if checkin.get("venue") else "N/A",
            ATTR_ABV: f'{checkin["beer"]["beer_abv"]}%',
            ATTR_TOTAL_BADGES: user_info["stats"]["total_badges"],
            ATTR_TOTAL_BEERS: user_info["stats"]["total_beers"],
            ATTR_TOTAL_CHECKINS: user_info["stats"]["total_checkins"],
            ATTR_TOTAL_CREATED_BEERS: user_info["stats"]["total_created_beers"],
            ATTR_TOTAL_FRIENDS: user_info["stats"]["total_friends"],
            ATTR_TOTAL_FOLLOWINGS: user_info["stats"]["total_followings"],
            ATTR_TOTAL_PHOTOS: user_info["stats"]["total_photos"],
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }


class UntappdWishlistSensor(CoordinatorEntity, SensorEntity):
    """Representation of an Untappd wishlist sensor."""

    def __init__(self, coordinator: UntappdDataUpdateCoordinator):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._username = coordinator.username
        self._attr_name = f"Untappd Wishlist ({self._username})"
        self._attr_unique_id = f"untappd_{self._username}_wishlist"
        self._attr_icon = ICON
        self._attr_native_unit_of_measurement = "beers"

    @property
    def native_value(self):
        """Return the state of the sensor."""
        return self.coordinator.data.get("wishlist_count") if self.coordinator.data else 0

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        if self.coordinator.data:
            return self.coordinator.data.get(WISHLIST_DATA_KEY, {})
        return {}


class UntappdLastBadgeSensor(CoordinatorEntity, SensorEntity):
    """Representation of an Untappd last badge sensor."""

    def __init__(self, coordinator: UntappdDataUpdateCoordinator):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._username = coordinator.username
        self._attr_name = f"Untappd Last Badge ({self._username})"
        self._attr_unique_id = f"untappd_{self._username}_last_badge"
        self._attr_icon = ICON
        self._attr_device_class = "timestamp"

    @property
    def native_value(self):
        """Return the state of the sensor."""
        if self.coordinator.data and self.coordinator.data.get("last_badge"):
            created_at = self.coordinator.data["last_badge"]["created_at"]
            return dt_util.parse_datetime(created_at)
        return None

    @property
    def entity_picture(self):
        """Return the entity picture."""
        if self.coordinator.data and self.coordinator.data.get("last_badge"):
            return self.coordinator.data["last_badge"]["media"]["badge_image_sm"]
        return None

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data or not self.coordinator.data.get("last_badge"):
            return {}

        badge = self.coordinator.data["last_badge"]
        return {
            ATTR_BADGE_NAME: badge["badge_name"],
            ATTR_BADGE_LEVEL: badge["levels"]["count"] if badge["is_level"] else 1,
            ATTR_BADGE_DESCRIPTION: badge["badge_description"],
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }