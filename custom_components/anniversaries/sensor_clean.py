"""Sensor platform for Anniversaries."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers import entity_registry as er
from homeassistant.util import slugify

from .const import (
    ATTRIBUTION,
    ATTR_YEARS_NEXT,
    ATTR_YEARS_CURRENT,
    ATTR_DATE,
    ATTR_NEXT_DATE,
    ATTR_WEEKS,
    ATTR_HALF_DATE,
    ATTR_HALF_DAYS,
    ATTR_ZODIAC_SIGN,
    ATTR_NAMED_ANNIVERSARY,
    ATTR_IS_MILESTONE,
    ATTR_GENERATION,
    ATTR_BIRTHSTONE,
    ATTR_BIRTH_FLOWER,
    DOMAIN,
    DEFAULT_ICON_NORMAL,
    DEFAULT_ICON_TODAY,
    DEFAULT_ICON_SOON,
    DEFAULT_SOON,
    DEFAULT_UNIT_OF_MEASUREMENT,
    CONF_ICON_NORMAL,
    CONF_ICON_TODAY,
    CONF_ICON_SOON,
    CONF_SOON,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_UPCOMING_ANNIVERSARIES_SENSOR,
)
from .coordinator import AnniversaryDataUpdateCoordinator
from .data import AnniversaryData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor entities for a config entry."""
    coordinator: AnniversaryDataUpdateCoordinator = hass.data[DOMAIN]["coordinator"]

    async_add_entities([AnniversarySensor(coordinator, entry.entry_id, entry)])

    if entry.options.get(CONF_UPCOMING_ANNIVERSARIES_SENSOR, False):
        lock = hass.data[DOMAIN]["coordinator_lock"]
        async with lock:
            if "summary_sensor_added" not in hass.data[DOMAIN]:
                async_add_entities([UpcomingAnniversariesSensor(coordinator)])
                hass.data[DOMAIN]["summary_sensor_added"] = True


class AnniversarySensor(CoordinatorEntity[AnniversaryDataUpdateCoordinator], SensorEntity):
    """Sensor for a single anniversary."""

    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        coordinator: AnniversaryDataUpdateCoordinator,
        entry_id: str,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._entry = entry
        self.config = entry.options or entry.data
        name = self.config.get("name", "anniversary")
        slug = slugify(name)
        short_id = entry.entry_id.split("-")[0]
        self._internal_key = entry_id
        self._suggested_object_id = f"anniversary_{slug}_{short_id}"
        self._attr_unique_id = f"{entry.entry_id}_sensor"
        self._icon_normal = self.config.get(CONF_ICON_NORMAL, DEFAULT_ICON_NORMAL)
        self._icon_today = self.config.get(CONF_ICON_TODAY, DEFAULT_ICON_TODAY)
        self._icon_soon = self.config.get(CONF_ICON_SOON, DEFAULT_ICON_SOON)
        self._soon_days = self.config.get(CONF_SOON, DEFAULT_SOON)
        self._attr_native_unit_of_measurement = self.config.get(
            CONF_UNIT_OF_MEASUREMENT, DEFAULT_UNIT_OF_MEASUREMENT
        )

    async def async_added_to_hass(self) -> None:
        """Handle entity being added to hass."""
        await super().async_added_to_hass()
        current_eid = self.entity_id
        try:
            domain, object_id = current_eid.split(".")
        except ValueError:
            return
        if not object_id.startswith("anniversary_"):
            clean_object = object_id
            if clean_object.startswith("anniversary") and not clean_object.startswith("anniversary_"):
                clean_object = clean_object[len("anniversary"):].lstrip("_")
            new_object_id = f"anniversary_{clean_object}" if clean_object else "anniversary"
            registry = er.async_get(self.hass)
            registry.async_update_entity(current_eid, new_entity_id=f"{domain}.{new_object_id}")

    @property
    def anniversary(self) -> AnniversaryData | None:
        """Get anniversary data."""
        if not hasattr(self.coordinator, "anniversaries") or self.coordinator.anniversaries is None:
            return None
        return self.coordinator.anniversaries.get(self._internal_key)

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.anniversary is not None

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        ann = self.anniversary
        return ann.name if ann else "Unknown Anniversary"

    @property
    def native_value(self) -> int | None:
        """Return the state of the sensor."""
        ann = self.anniversary
        return ann.days_remaining if ann else None

    @property
    def icon(self) -> str:
        """Return the icon to use in the frontend."""
        ann = self.anniversary
        if not ann:
            return self._icon_normal
        days = ann.days_remaining
        if days == 0:
            return self._icon_today
        if days <= self._soon_days:
            return self._icon_soon
        return self._icon_normal

    @property
    def extra_state_attributes(self) -> dict[str, any]:
        """Return entity specific state attributes."""
        ann = self.anniversary
        if not ann:
            return {}
        attrs: dict[str, any] = {
            ATTR_NEXT_DATE: ann.next_anniversary_date,
            ATTR_WEEKS: ann.weeks_remaining,
            ATTR_ZODIAC_SIGN: ann.zodiac_sign,
            ATTR_IS_MILESTONE: ann.is_milestone,
            ATTR_GENERATION: ann.generation,
            ATTR_BIRTHSTONE: ann.birthstone,
            ATTR_BIRTH_FLOWER: ann.birth_flower,
        }
        if ann.named_anniversary:
            attrs[ATTR_NAMED_ANNIVERSARY] = ann.named_anniversary
        if ann.current_years is not None:
            attrs[ATTR_YEARS_CURRENT] = ann.current_years
        if ann.next_years is not None:
            attrs[ATTR_YEARS_NEXT] = ann.next_years
        if ann.half_anniversary_date is not None:
            attrs[ATTR_HALF_DATE] = ann.half_anniversary_date
            attrs[ATTR_HALF_DAYS] = ann.days_until_half_anniversary
        if not ann.unknown_year:
            attrs[ATTR_DATE] = ann.date
        return attrs


class UpcomingAnniversariesSensor(CoordinatorEntity[AnniversaryDataUpdateCoordinator], SensorEntity):
    """Aggregated sensor listing next anniversaries."""

    _attr_attribution = ATTRIBUTION
    _attr_name = "Upcoming Anniversaries"
    _attr_icon = "mdi:calendar-multiple"

    def __init__(self, coordinator: AnniversaryDataUpdateCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_summary_sensor"

    async def async_added_to_hass(self) -> None:
        """Handle entity being added to hass."""
        await super().async_added_to_hass()
        current_eid = self.entity_id
        try:
            domain, object_id = current_eid.split(".")
        except ValueError:
            return
        if not object_id.startswith("anniversary_"):
            registry = er.async_get(self.hass)
            new_object_id = f"anniversary_{object_id}"
            registry.async_update_entity(current_eid, new_entity_id=f"{domain}.{new_object_id}")

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        upcoming = self.coordinator.upcoming_anniversaries
        if not upcoming:
            return None
        return upcoming[0].name

    @property
    def extra_state_attributes(self) -> dict[str, any] | None:
        """Return entity specific state attributes."""
        upcoming = self.coordinator.upcoming_anniversaries
        if not upcoming:
            return None
        return {
            "upcoming": [
                {
                    "name": a.name,
                    "date": a.next_anniversary_date.isoformat(),
                    "days_remaining": a.days_remaining,
                }
                for a in upcoming
            ]
        }
