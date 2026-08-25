"""Binary sensor platform for Hass Data Points monitor devices."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval

from .const import (
    DOMAIN,
    KEY_ADD_BINARY_SENSOR_ENTITIES,
    KEY_MONITOR_BINARY_SENSORS,
    KEY_STORE,
)
from .store import DatapointsStore

_UPDATE_INTERVAL = timedelta(minutes=1)

# Minimum data points needed in the last scan to consider data sufficient.
_MIN_DATA_POINTS = 3


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hass Data Points binary sensor entities from a config entry."""
    store: DatapointsStore = hass.data[DOMAIN][KEY_STORE]

    hass.data[DOMAIN][KEY_ADD_BINARY_SENSOR_ENTITIES] = async_add_entities
    hass.data[DOMAIN][KEY_MONITOR_BINARY_SENSORS] = {}

    entities: list[BinarySensorEntity] = []
    for monitor in store.get_monitors():
        mid = monitor["id"]
        stalled = DatapointsMonitorStalledBinarySensor(entry, store, hass, mid)
        problem = DatapointsMonitorProblemBinarySensor(entry, store, hass, mid)
        hass.data[DOMAIN][KEY_MONITOR_BINARY_SENSORS][mid] = (stalled, problem)
        entities.extend([stalled, problem])

    async_add_entities(entities)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _monitor_device_info(
    entry: ConfigEntry, store: DatapointsStore, monitor_id: str
) -> DeviceInfo:
    monitor = store.get_monitor(monitor_id) or {}
    return DeviceInfo(
        identifiers={(DOMAIN, f"{entry.entry_id}_monitor_{monitor_id}")},
        name=monitor.get("name", f"Anomaly monitor {monitor_id[:8]}"),
        manufacturer="buggedcom",
        model="Anomaly Monitor",
        via_device=(DOMAIN, entry.entry_id),
    )


# ---------------------------------------------------------------------------
# Base class for time-driven monitor binary sensors
# ---------------------------------------------------------------------------


class _MonitorBinarySensorBase(BinarySensorEntity):
    """Base for monitor binary sensors that update on a time interval and store changes."""

    _attr_has_entity_name = True

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        self._entry = entry
        self._store = store
        self._hass = hass
        self._monitor_id = monitor_id
        self._unsub_timer: Any = None
        self._unsub_store: Any = None

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    @property
    def is_on(self) -> bool:
        return self._compute()

    @property
    def state(self) -> str:
        return "Yes" if self._compute() else "No"

    def _compute(self) -> bool:
        raise NotImplementedError

    async def async_added_to_hass(self) -> None:
        self._unsub_store = self._store.async_add_listener(self._on_store_update)
        self._unsub_timer = async_track_time_interval(
            self._hass, self._on_time_interval, _UPDATE_INTERVAL
        )
        self.async_on_remove(self._cleanup)

    def _cleanup(self) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        if self._unsub_store:
            self._unsub_store()
            self._unsub_store = None

    def _on_store_update(self) -> None:
        self.async_write_ha_state()

    @callback
    def _on_time_interval(self, now: datetime) -> None:
        self.async_write_ha_state()


# ---------------------------------------------------------------------------
# Stalled binary sensor
# ---------------------------------------------------------------------------


class DatapointsMonitorStalledBinarySensor(_MonitorBinarySensorBase):
    """True when an enabled monitor has not scanned within 2× its scan interval.

    A new monitor (last_scan_at is None) is never considered stalled.
    """

    _attr_icon = "mdi:clock-remove-outline"

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        super().__init__(entry, store, hass, monitor_id)
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_stalled"
        self._attr_name = "Stalled"

    def _compute(self) -> bool:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor or not monitor.get("enabled", True):
            return False
        last_scan_raw = monitor.get("last_scan_at")
        if not last_scan_raw:
            return False
        try:
            last_scan = datetime.fromisoformat(last_scan_raw)
            if last_scan.tzinfo is None:
                last_scan = last_scan.replace(tzinfo=UTC)
        except ValueError:
            return False
        interval_minutes = monitor.get("scan_interval_minutes", 30)
        threshold = timedelta(minutes=interval_minutes * 2)
        return (datetime.now(UTC) - last_scan) > threshold


# ---------------------------------------------------------------------------
# Problem binary sensor
# ---------------------------------------------------------------------------


class DatapointsMonitorProblemBinarySensor(_MonitorBinarySensorBase):
    """True when any operational issue affects the monitor.

    Covers: stalled, insufficient data in last scan, or last scan found no points.
    A disabled monitor is not considered to have a problem.
    """

    _attr_icon = "mdi:alert-circle-outline"

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        super().__init__(entry, store, hass, monitor_id)
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_problem"
        self._attr_name = "Problem"

    def _compute(self) -> bool:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor or not monitor.get("enabled", True):
            return False

        # Stalled check
        last_scan_raw = monitor.get("last_scan_at")
        if last_scan_raw:
            try:
                last_scan = datetime.fromisoformat(last_scan_raw)
                if last_scan.tzinfo is None:
                    last_scan = last_scan.replace(tzinfo=UTC)
                interval_minutes = monitor.get("scan_interval_minutes", 30)
                if (datetime.now(UTC) - last_scan) > timedelta(
                    minutes=interval_minutes * 2
                ):
                    return True
            except ValueError:
                pass

        # Insufficient data check (last scan ran but found too few points)
        data_points = monitor.get("last_scan_data_points")
        return data_points is not None and data_points < _MIN_DATA_POINTS
