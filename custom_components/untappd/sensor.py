"""
A component which allows you to get information from Untappd.

For more details about this component, please refer to the documentation at
https://github.com/custom-components/sensor.untappd
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from dateutil import parser
from homeassistant.components.sensor import PLATFORM_SCHEMA, SensorEntity
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity  # kept for type hints/back-compat

__version__ = "0.1.6"

_LOGGER = logging.getLogger(__name__)

ATTRIBUTION = "Information provided by Untappd"

CONF_USERNAME = "username"
CONF_ID = "id"
CONF_SECRET = "secret"

COMPONENT_REPO = "https://github.com/custom-components/sensor.untappd/"

WISHLIST_DATA = "untappd_wishlist"

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

ATTR_BADGE = "badge"
ATTR_LEVEL = "level"
ATTR_DESCRIPTION = "description"

# Polling interval unchanged
SCAN_INTERVAL = timedelta(seconds=300)

# Correct icon name format
ICON = "mdi:glass-mug-variant"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_USERNAME): cv.string,
        vol.Required(CONF_ID): cv.string,
        vol.Required(CONF_SECRET): cv.string,
    }
)


def setup_platform(
    hass: HomeAssistant,
    config: dict,
    add_entities,  # kept for HA's sync legacy path
    discovery_info: dict | None = None,
) -> None:
    """Legacy sync setup (kept for backward compatibility)."""
    username = config.get(CONF_USERNAME)
    api_id = config.get(CONF_ID)
    api_secret = config.get(CONF_SECRET)

    add_entities(
        [
            UntappdCheckinSensor(username, api_id, api_secret),
            UntappdWishlistSensor(hass, username, api_id, api_secret),
            UntappdLastBadgeSensor(hass, username, api_id, api_secret),
        ],
        True,
    )


async def async_setup_platform(
    hass: HomeAssistant,
    config: dict,
    async_add_entities,  # current recommended path
    discovery_info: dict | None = None,
) -> None:
    """Async setup wrapper that mirrors the legacy sync behavior."""
    username = config.get(CONF_USERNAME)
    api_id = config.get(CONF_ID)
    api_secret = config.get(CONF_SECRET)

    async_add_entities(
        [
            UntappdCheckinSensor(username, api_id, api_secret),
            UntappdWishlistSensor(hass, username, api_id, api_secret),
            UntappdLastBadgeSensor(hass, username, api_id, api_secret),
        ],
        True,
    )


class UntappdCheckinSensor(SensorEntity):
    """Sensor for the user's last Untappd check-in."""

    _attr_icon = ICON

    def __init__(self, username: str, api_id: str, api_secret: str) -> None:
        from pyuntappd import Untappd

        self._untappd = Untappd()
        self._username = username
        self._apiid = api_id
        self._apisecret = api_secret

        # State/attrs initialized to preserve original behavior
        self._total_badges = None
        self._total_beers = None
        self._total_created_beers = None
        self._total_checkins = None
        self._total_followings = None
        self._total_friends = None
        self._total_photos = None
        self._abv = None
        self._venue = None
        self._state = None
        self._picture = None
        self._beer = None
        self._brewery = None
        self._score = None

        # Keep initial update on init to match original behavior
        self.update()

    @property
    def name(self) -> str:
        return f"Untappd Last Check-in ({self._username})"

    @property
    def entity_picture(self) -> str | None:
        return self._picture

    @property
    def state(self) -> Any:
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            ATTR_ABV: self._abv,
            ATTR_BEER: self._beer,
            ATTR_BREWERY: self._brewery,
            ATTR_SCORE: self._score,
            ATTR_VENUE: self._venue,
            ATTR_TOTAL_BADGES: self._total_badges,
            ATTR_TOTAL_BEERS: self._total_beers,
            ATTR_TOTAL_CHECKINS: self._total_checkins,
            ATTR_TOTAL_CREATED_BEERS: self._total_created_beers,
            ATTR_TOTAL_FRIENDS: self._total_friends,
            ATTR_TOTAL_FOLLOWINGS: self._total_followings,
            ATTR_TOTAL_PHOTOS: self._total_photos,
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }

    def update(self) -> None:
        current_date = parser.parse(str(datetime.now())).replace(tzinfo=None)
        result = self._untappd.get_last_activity(
            self._apiid, self._apisecret, self._username
        )
        if not result:
            return
        checkin_date = parser.parse(result["created_at"]).replace(tzinfo=None)
        if (current_date - checkin_date).days > 0:
            relative_checkin_date = (
                str((current_date - checkin_date).days + 1) + " days ago"
            )
        elif (current_date - checkin_date).days == 0:
            relative_checkin_date = "Yesterday"
        else:
            relative_checkin_date = "Today"

        self._state = relative_checkin_date
        self._beer = result["beer"]["beer_name"]
        self._brewery = result["brewery"]["brewery_name"]
        self._score = str(result["rating_score"])
        self._venue = result["venue"]["venue_name"]
        self._picture = result["beer"]["beer_label"]
        self._abv = str(result["beer"]["beer_abv"]) + "%"

        result = self._untappd.get_info(self._apiid, self._apisecret, self._username)
        if not result:
            return
        self._total_badges = result["stats"]["total_badges"]
        self._total_beers = result["stats"]["total_beers"]
        self._total_checkins = result["stats"]["total_checkins"]
        self._total_created_beers = result["stats"]["total_created_beers"]
        self._total_friends = result["stats"]["total_friends"]
        self._total_followings = result["stats"]["total_followings"]
        self._total_photos = result["stats"]["total_photos"]


class UntappdWishlistSensor(SensorEntity):
    """Sensor that exposes the user's Untappd wishlist as attributes."""

    _attr_icon = ICON

    def __init__(self, hass: HomeAssistant, username: str, api_id: str, api_secret: str) -> None:
        from pyuntappd import Untappd

        self.hass = hass
        self._untappd = Untappd()
        self._username = username
        self._apiid = api_id
        self._apisecret = api_secret
        self._state = None
        # ensure data bucket exists (unchanged behavior)
        self.hass.data[WISHLIST_DATA] = {}
        self.update()

    @property
    def name(self) -> str:
        return f"Untappd Wishlist ({self._username})"

    @property
    def state(self) -> Any:
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self.hass.data[WISHLIST_DATA]

    def update(self) -> None:
        result = self._untappd.get_wishlist(
            self._apiid, self._apisecret, self._username
        )
        if not result:
            return
        self._state = result["count"]
        for beer in result["items"]:
            name = beer["beer"]["beer_name"]
            self.hass.data[WISHLIST_DATA][name] = {
                "beer_name": name,
                "beer_label": beer["beer"]["beer_label"],
                "beer_description": beer["beer"]["beer_description"],
                "beer_abv": beer["beer"]["beer_abv"],
                "beer_style": beer["beer"]["beer_style"],
                "beer_ibu": beer["beer"]["beer_ibu"],
                "beer_link": "https://untappd.com/b/"
                + beer["beer"]["beer_slug"]
                + "/"
                + str(beer["beer"]["bid"]),
                "rating_score": beer["beer"]["rating_score"],
                "rating_count": beer["beer"]["rating_count"],
                "brewery_label": beer["brewery"]["brewery_label"],
                "brewery_name": beer["brewery"]["brewery_name"],
                "country_name": beer["brewery"]["country_name"],
            }


class UntappdLastBadgeSensor(SensorEntity):
    """Sensor for the user's most recent Untappd badge."""

    _attr_icon = ICON

    def __init__(self, hass: HomeAssistant, username: str, api_id: str, api_secret: str) -> None:
        from pyuntappd import Untappd

        self.hass = hass
        self._untappd = Untappd()
        self._username = username
        self._apiid = api_id
        self._apisecret = api_secret
        self._state = None
        self._badge = None
        self._level = None
        self._description = None
        self._picture = None
        self.update()

    @property
    def name(self) -> str:
        return f"Untappd Last Badge ({self._username})"

    @property
    def entity_picture(self) -> str | None:
        return self._picture

    @property
    def state(self) -> Any:
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            ATTR_BADGE: self._badge,
            ATTR_LEVEL: self._level,
            ATTR_DESCRIPTION: self._description,
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }

    def update(self) -> None:
        result = self._untappd.get_badges(self._apiid, self._apisecret, self._username)
        if not result or len(result) < 1:
            return
        current_date = parser.parse(str(datetime.now())).replace(tzinfo=None)
        checkin_date = parser.parse(result[0]["created_at"]).replace(tzinfo=None)
        if (current_date - checkin_date).days > 0:
            relative_checkin_date = (
                str((current_date - checkin_date).days + 1) + " days ago"
            )
        elif (current_date - checkin_date).days == 0:
            relative_checkin_date = "Yesterday"
        else:
            relative_checkin_date = "Today"

        self._state = relative_checkin_date
        self._badge = result[0]["badge_name"]
        self._level = result[0]["levels"]["count"] if result[0]["is_level"] else 1
        self._description = result[0]["badge_description"]
        self._picture = result[0]["media"]["badge_image_sm"]
