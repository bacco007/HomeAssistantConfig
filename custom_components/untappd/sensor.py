from datetime import datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import ATTR_ATTRIBUTION, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, DOMAIN
from .coordinator import UntappdCoordinator


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = UntappdCoordinator(hass, entry.data)
    await coordinator.async_config_entry_first_refresh()

    async_add_entities(
        [
            UntappdCheckinSensor(coordinator),
            UntappdWishlistSensor(coordinator),
            UntappdBadgeSensor(coordinator),
            UntappdRateRemainingSensor(coordinator),
        ]
    )


class BaseSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator):
        super().__init__(coordinator)

    @property
    def extra_state_attributes(self):
        return {
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }


class UntappdCheckinSensor(BaseSensor):
    _attr_name = "Untappd Last Check-in"

    @property
    def native_value(self):
        data = self.coordinator.data.checkin
        if not data:
            return None

        item = data["response"]["checkins"]["items"][0]
        checkin_date = datetime.strptime(item["created_at"], "%a, %d %b %Y %H:%M:%S %z")

        delta = datetime.now(checkin_date.tzinfo) - checkin_date
        return f"{delta.days} days ago" if delta.days else "Today"


class UntappdWishlistSensor(BaseSensor):
    _attr_name = "Untappd Wishlist"

    @property
    def native_value(self):
        data = self.coordinator.data.wishlist
        if not data:
            return None
        return data["response"]["beers"]["count"]


class UntappdBadgeSensor(BaseSensor):
    _attr_name = "Untappd Last Badge"

    @property
    def native_value(self):
        data = self.coordinator.data.badge
        if not data:
            return None
        return data["response"]["items"][0]["badge_name"]


class UntappdRateRemainingSensor(BaseSensor):
    _attr_name = "Untappd API Remaining"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self):
        return self.coordinator.data.rate_remaining
