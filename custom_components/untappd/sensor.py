from __future__ import annotations

from datetime import datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import ATTR_ATTRIBUTION, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, DOMAIN
from .coordinator import UntappdCoordinator


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = UntappdCoordinator(hass, entry.data)
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await coordinator.async_config_entry_first_refresh()

    async_add_entities(
        [
            UntappdLastCheckinSensor(coordinator, entry),
            UntappdWishlistCountSensor(coordinator, entry),
            UntappdLastBadgeSensor(coordinator, entry),
            UntappdLastBadgeLevelSensor(coordinator, entry),
            UntappdLastBadgeEarnedSensor(coordinator, entry),
            UntappdLastBadgeDescriptionSensor(coordinator, entry),
            UntappdApiRemainingSensor(coordinator, entry),
            UntappdApiLimitSensor(coordinator, entry),
            UntappdLastBeerSensor(coordinator, entry),
            UntappdLastBrewerySensor(coordinator, entry),
            UntappdLastRatingSensor(coordinator, entry),
            UntappdLastVenueSensor(coordinator, entry),
            UntappdLastAbvSensor(coordinator, entry),
            UntappdTotalBadgesSensor(coordinator, entry),
            UntappdTotalBeersSensor(coordinator, entry),
            UntappdTotalCreatedBeersSensor(coordinator, entry),
            UntappdTotalCheckinsSensor(coordinator, entry),
            UntappdTotalFollowingsSensor(coordinator, entry),
            UntappdTotalFriendsSensor(coordinator, entry),
            UntappdTotalPhotosSensor(coordinator, entry),
        ]
    )


class UntappdBaseSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator)
        self._entry = entry

    @property
    def device_info(self):
        return {
            "identifiers": {(DOMAIN, self._entry.entry_id)},
            "name": f"Untappd ({self.coordinator.username})",
            "manufacturer": "Untappd",
            "model": "User API",
            "entry_type": "service",
            "configuration_url": "https://untappd.com/",
        }

    @property
    def extra_state_attributes(self):
        return {
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }

    def _checkin_item(self):
        data = self.coordinator.data.checkin if self.coordinator.data else None
        if not data:
            return None
        items = data.get("response", {}).get("checkins", {}).get("items", [])
        return items[0] if items else None

    def _userinfo(self):
        data = self.coordinator.data.userinfo if self.coordinator.data else None
        if not data:
            return None
        return data.get("response", {}).get("user")

    def _badge_item(self):
        data = self.coordinator.data.badge if self.coordinator.data else None
        if not data:
            return None
        items = data.get("response", {}).get("items", [])
        return items[0] if items else None

    def _wishlist_items(self):
        data = self.coordinator.data.wishlist if self.coordinator.data else None
        if not data:
            return []
        return data.get("response", {}).get("beers", {}).get("items", [])

    @staticmethod
    def _relative_time(created_at: str | None) -> str | None:
        if not created_at:
            return None

        try:
            event_dt = datetime.strptime(created_at, "%a, %d %b %Y %H:%M:%S %z")
        except (TypeError, ValueError):
            return None

        delta = datetime.now(event_dt.tzinfo) - event_dt

        if delta.days <= 0:
            return "Today"
        if delta.days == 1:
            return "Yesterday"
        return f"{delta.days} days ago"


class UntappdLastCheckinSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Check-in ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_checkin"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return self._relative_time(item.get("created_at"))

    @property
    def entity_picture(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("beer", {}).get("beer_label")


class UntappdWishlistCountSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Wishlist ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_wishlist"

    @property
    def native_value(self):
        data = self.coordinator.data.wishlist if self.coordinator.data else None
        if not data:
            return None
        return data.get("response", {}).get("beers", {}).get("count")

    @property
    def extra_state_attributes(self):
        attrs = dict(super().extra_state_attributes)

        items = []
        for beer in self._wishlist_items():
            beer_data = beer.get("beer", {})
            brewery_data = beer.get("brewery", {})

            items.append(
                {
                    "beer_name": beer_data.get("beer_name"),
                    "beer_label": beer_data.get("beer_label"),
                    "beer_description": beer_data.get("beer_description"),
                    "beer_abv": beer_data.get("beer_abv"),
                    "beer_style": beer_data.get("beer_style"),
                    "beer_ibu": beer_data.get("beer_ibu"),
                    "beer_link": (
                        f"https://untappd.com/b/{beer_data.get('beer_slug')}/{beer_data.get('bid')}"
                        if beer_data.get("beer_slug")
                        and beer_data.get("bid") is not None
                        else None
                    ),
                    "rating_score": beer_data.get("rating_score"),
                    "rating_count": beer_data.get("rating_count"),
                    "brewery_label": brewery_data.get("brewery_label"),
                    "brewery_name": brewery_data.get("brewery_name"),
                    "country_name": brewery_data.get("country_name"),
                }
            )

        attrs["items"] = items
        return attrs


class UntappdLastBadgeSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Badge ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_badge"

    @property
    def native_value(self):
        item = self._badge_item()
        if not item:
            return None
        return item.get("badge_name")

    @property
    def entity_picture(self):
        item = self._badge_item()
        if not item:
            return None
        return item.get("media", {}).get("badge_image_sm")


class UntappdLastBadgeLevelSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Badge Level ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_badge_level"

    @property
    def native_value(self):
        item = self._badge_item()
        if not item:
            return None

        if item.get("is_level"):
            return item.get("levels", {}).get("count")
        return 1


class UntappdLastBadgeEarnedSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Badge Earned ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_badge_earned"

    @property
    def native_value(self):
        item = self._badge_item()
        if not item:
            return None
        return self._relative_time(item.get("created_at"))


class UntappdLastBadgeDescriptionSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Badge Description ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_badge_description"

    @property
    def native_value(self):
        item = self._badge_item()
        if not item:
            return None
        return item.get("badge_description")


class UntappdApiRemainingSensor(UntappdBaseSensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_native_unit_of_measurement = "requests"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd API Remaining ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_rate_remaining"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return self.coordinator.data.rate_remaining


class UntappdApiLimitSensor(UntappdBaseSensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_native_unit_of_measurement = "requests"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd API Limit ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_rate_limit"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return self.coordinator.data.rate_limit


class UntappdLastBeerSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Beer ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_beer"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("beer", {}).get("beer_name")


class UntappdLastBrewerySensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Brewery ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_brewery"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("brewery", {}).get("brewery_name")


class UntappdLastRatingSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "★"
    _attr_state_class = "measurement"
    _attr_suggested_display_precision = 2

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Rating ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_rating"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("rating_score")


class UntappdLastVenueSensor(UntappdBaseSensor):
    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Venue ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_venue"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("venue", {}).get("venue_name")


class UntappdLastAbvSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "%"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last ABV ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_abv"

    @property
    def native_value(self):
        item = self._checkin_item()
        if not item:
            return None
        return item.get("beer", {}).get("beer_abv")


class UntappdTotalBadgesSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Badges ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_badges"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_badges")


class UntappdTotalBeersSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Beers ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_beers"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_beers")


class UntappdTotalCreatedBeersSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Created Beers ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_created_beers"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_created_beers")


class UntappdTotalCheckinsSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Checkins ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_checkins"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_checkins")


class UntappdTotalFollowingsSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Followings ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_followings"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_followings")


class UntappdTotalFriendsSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Friends ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_friends"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_friends")


class UntappdTotalPhotosSensor(UntappdBaseSensor):
    _attr_native_unit_of_measurement = "count"
    _attr_state_class = "measurement"

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Total Photos ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_total_photos"

    @property
    def native_value(self):
        user = self._userinfo()
        if not user:
            return None
        return user.get("stats", {}).get("total_photos")
