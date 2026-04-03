from datetime import datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import ATTR_ATTRIBUTION, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTRIBUTION, DOMAIN
from .coordinator import UntappdCoordinator


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = UntappdCoordinator(hass, entry.data)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    async_add_entities(
        [
            UntappdCheckinSensor(coordinator, entry),
            UntappdWishlistSensor(coordinator, entry),
            UntappdBadgeSensor(coordinator, entry),
            UntappdRateRemainingSensor(coordinator, entry),
        ]
    )


class BaseSensor(CoordinatorEntity, SensorEntity):

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
        attrs = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }
        if self.coordinator.data:
            attrs["rate_limit"] = self.coordinator.data.rate_limit
            attrs["rate_remaining"] = self.coordinator.data.rate_remaining
        return attrs


class UntappdCheckinSensor(BaseSensor):

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Check-in ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_checkin"

    @property
    def native_value(self):
        data = self.coordinator.data.checkin
        if not data:
            return None

        items = data.get("response", {}).get("checkins", {}).get("items", [])
        if not items:
            return None

        item = items[0]
        created_at = item.get("created_at")
        if not created_at:
            return None

        checkin_date = datetime.strptime(created_at, "%a, %d %b %Y %H:%M:%S %z")
        delta = datetime.now(checkin_date.tzinfo) - checkin_date
        return f"{delta.days} days ago" if delta.days else "Today"


class UntappdWishlistSensor(BaseSensor):

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Wishlist ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_wishlist"

    @property
    def native_value(self):
        data = self.coordinator.data.wishlist
        if not data:
            return None
        return data.get("response", {}).get("beers", {}).get("count")


class UntappdBadgeSensor(BaseSensor):

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd Last Badge ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_last_badge"

    @property
    def native_value(self):
        data = self.coordinator.data.badge
        if not data:
            return None

        items = data.get("response", {}).get("items", [])
        if not items:
            return None

        return items[0].get("badge_name")


class UntappdRateRemainingSensor(BaseSensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator, entry):
        super().__init__(coordinator, entry)
        self._attr_name = f"Untappd API Remaining ({coordinator.username})"
        self._attr_unique_id = f"{entry.entry_id}_rate_remaining"

    @property
    def native_value(self):
        if not self.coordinator.data:
            return None
        return self.coordinator.data.rate_remaining
