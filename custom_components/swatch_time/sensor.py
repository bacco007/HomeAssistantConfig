"""Support for tracking the Swatch Time sign."""

from __future__ import annotations

from homeassistant.components.sensor       import SensorDeviceClass, SensorEntity
from homeassistant.config_entries          import ConfigEntry
from homeassistant.const                   import EVENT_CORE_CONFIG_UPDATE
from homeassistant.core                    import HomeAssistant, callback
from datetime                              import datetime, timedelta
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event           import async_track_point_in_utc_time

from .const import DOMAIN, DEFAULT_NAME

import homeassistant.util.dt as dt_util

import logging

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Initialize the entries."""
    async_add_entities([SwatchTimeSensor(entry_id=entry.entry_id)], True)


class SwatchTimeSensor(SensorEntity):
    """Representation of a Swatch Time sensor."""

    _attr_name = None
    _attr_has_entity_name = True
    _attr_unique_id = DOMAIN

    def __init__(self, entry_id: str) -> None:
        """Initialize Swatch Time sensor."""
        self._attr_device_info = DeviceInfo(
            name         = DEFAULT_NAME,
            manufacturer = "Swatch",
            hw_version   = "1998.10.23",
            identifiers  = {(DOMAIN, entry_id)},
            entry_type   = DeviceEntryType.SERVICE,
        )

        self._update_internal_state(dt_util.utcnow())


    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        return self._state


    @property
    def icon(self) -> str:
        return "mdi:clock"


    async def async_added_to_hass(self) -> None:
        """Set up first update."""

        async def async_update_config(event: Event) -> None:
            """Handle core config update."""
            self._update_state_and_setup_listener()
            self.async_write_ha_state()

        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_CORE_CONFIG_UPDATE, async_update_config)
        )
        self._update_state_and_setup_listener()


    async def async_will_remove_from_hass(self) -> None:
        """Cancel next update."""
        if self.unsub:
            self.unsub()
            self.unsub = None


    def get_next_interval(self, time_date: datetime) -> datetime:
        """Compute next time an update should occur."""
        # Add 1 hour because @0 beats is at 23:00:00 UTC.
        timestamp = dt_util.as_timestamp(time_date + timedelta(hours = 1))
        delta = 86.4 - (timestamp % 86.4)
        next_interval = time_date + timedelta(seconds = delta)

        _LOGGER.debug("%s + %s -> %s", time_date, delta, next_interval)

        return next_interval


    def _update_internal_state(self, time_date: datetime) -> None:
        """Calculate Swatch Internet Time."""
        time_bmt = time_date + timedelta(hours = 1)
        delta = timedelta(
                          hours        = time_bmt.hour,
                          minutes      = time_bmt.minute,
                          seconds      = time_bmt.second,
                          microseconds = time_bmt.microsecond,
                         )

        # Use integers to better handle rounding. For example,
        # int(63763.2 / 86.4) = 737 but 637632 // 864 = 738.
        beat = int(delta.total_seconds() * 10) // 864

        self._state = f"@{beat:03d}"


    def _update_state_and_setup_listener(self) -> None:
        """Update state and setup listener for next interval."""
        now = dt_util.utcnow()
        self._update_internal_state(now)
        self.unsub = async_track_point_in_utc_time(
            self.hass, self.point_in_time_listener, self.get_next_interval(now)
        )


    @callback
    def point_in_time_listener(self, time_date: datetime) -> None:
        """Get the latest data and update state."""
        self._update_state_and_setup_listener()
        self.async_write_ha_state()
