"""Sensor platform for Hass Data Points."""

from __future__ import annotations

import asyncio
import logging
import threading
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from .anomaly_detection import run_anomaly_detection
from .const import (
    DOMAIN,
    EVENT_ANOMALY_DETECTED,
    EVENT_ANOMALY_RESOLVED,
    KEY_ADD_SENSOR_ENTITIES,
    KEY_MONITOR_SENSORS,
    KEY_STORE,
    MONITOR_DEFAULT_LOOK_BACK_HOURS,
)
from .history_utils import (
    downsample_pts,
    fetch_entity_pts,
    fetch_entity_statistics_pts,
    parse_interval_seconds,
)
from .store import DatapointsStore

_LOGGER = logging.getLogger(__name__)

_UPDATE_INTERVAL = timedelta(minutes=5)
_MAX_CLUSTER_SUMMARIES = 25


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Hass Data Points sensor entities from a config entry."""
    store: DatapointsStore = hass.data[DOMAIN][KEY_STORE]

    # Store callback for dynamic sensor creation from WS handlers
    hass.data[DOMAIN][KEY_ADD_SENSOR_ENTITIES] = async_add_entities
    hass.data[DOMAIN][KEY_MONITOR_SENSORS] = {}

    async_add_entities(
        [
            DatapointsCountSensor(entry, store),
            DatapointsLastTimestampSensor(entry, store),
            DatapointsLastMessageSensor(entry, store),
            DatapointsTimeSinceLastSensor(entry, store, hass),
            DatapointsTodayCountSensor(entry, store, hass),
            DatapointsWeekCountSensor(entry, store, hass),
            DatapointsAutomationCountSensor(entry, store),
            DatapointsManualCountSensor(entry, store),
        ]
    )

    # Re-register sensors for monitors that survived a restart
    monitor_sensors: list[SensorEntity] = []
    for monitor in store.get_monitors():
        mid = monitor["id"]
        s = DatapointsMonitorSensor(entry, store, hass, mid)
        hass.data[DOMAIN][KEY_MONITOR_SENSORS][mid] = s
        monitor_sensors.extend(
            [
                s,
                DatapointsMonitorConsecutiveScansSensor(entry, store, mid),
                DatapointsMonitorLastScanSensor(entry, store, mid),
                DatapointsMonitorLastAnomalySensor(entry, store, mid),
                DatapointsMonitorAnomalyDurationSensor(entry, store, hass, mid),
                DatapointsMonitorDataPointsSensor(entry, store, mid),
            ]
        )
    monitor_sensors.append(DatapointsAggregateAnomalyMonitorsSensor(entry, store))
    async_add_entities(monitor_sensors)


# ---------------------------------------------------------------------------
# Base classes
# ---------------------------------------------------------------------------


class _DatapointsSensorBase(SensorEntity):
    """Shared base for all Hass Data Points sensor entities."""

    _attr_has_entity_name = True

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise with config entry and data store."""
        self._entry = entry
        self._store = store

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information shared across all sensors."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name="Hass Data Points",
            manufacturer="buggedcom",
            model="Data Points",
        )

    async def async_added_to_hass(self) -> None:
        """Register store listener when entity is added."""
        await super().async_added_to_hass()
        self.async_on_remove(self._store.async_add_listener(self._handle_store_update))

    def _handle_store_update(self) -> None:
        """Refresh state after any store mutation."""
        self._attr_native_value = self._compute()
        self.async_write_ha_state()

    def _compute(self) -> Any:
        """Compute the current sensor value. Override in subclasses."""
        raise NotImplementedError


class _DatapointsPeriodicSensorBase(_DatapointsSensorBase):
    """Base for sensors that need periodic time-driven refreshes as well as store updates."""

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, hass: HomeAssistant
    ) -> None:
        """Initialise with config entry, data store, and hass instance."""
        super().__init__(entry, store)
        self._hass = hass

    async def async_added_to_hass(self) -> None:
        """Register store listener and periodic refresh timer."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_track_time_interval(
                self._hass, self._handle_time_interval, _UPDATE_INTERVAL
            )
        )

    def _handle_time_interval(self, now: datetime) -> None:
        """Refresh state on every timer tick."""
        self._attr_native_value = self._compute()
        self.async_write_ha_state()


# ---------------------------------------------------------------------------
# Concrete sensors
# ---------------------------------------------------------------------------


class DatapointsCountSensor(_DatapointsSensorBase):
    """Expose the total number of recorded datapoints."""

    _attr_icon = "mdi:counter"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the datapoint count sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_datapoint_count"
        self._attr_name = "Datapoint count"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        return self._store.get_event_count()


class DatapointsLastTimestampSensor(_DatapointsSensorBase):
    """Expose the timestamp of the most recently recorded datapoint."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:clock-outline"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the last recorded timestamp sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_last_timestamp"
        self._attr_name = "Last recorded"
        self._attr_native_value = self._compute()

    def _compute(self) -> datetime | None:
        event = self._store.get_last_event()
        if event is None:
            return None
        ts = event.get("timestamp")
        if not ts:
            return None
        try:
            dt = datetime.fromisoformat(ts)
        except ValueError:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt


class DatapointsLastMessageSensor(_DatapointsSensorBase):
    """Expose the message of the most recently recorded datapoint."""

    _attr_icon = "mdi:text"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the last recorded message sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_last_message"
        self._attr_name = "Last message"
        self._attr_native_value = self._compute()

    def _compute(self) -> str | None:
        event = self._store.get_last_event()
        if event is None:
            return None
        return event.get("message")


class DatapointsTimeSinceLastSensor(_DatapointsPeriodicSensorBase):
    """Expose the hours elapsed since the most recently recorded datapoint."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.HOURS
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:timer-outline"

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, hass: HomeAssistant
    ) -> None:
        """Initialise the time-since-last sensor."""
        super().__init__(entry, store, hass)
        self._attr_unique_id = f"{entry.entry_id}_time_since_last"
        self._attr_name = "Time since last datapoint"
        self._attr_native_value = self._compute()

    def _compute(self) -> float | None:
        event = self._store.get_last_event()
        if event is None:
            return None
        ts = event.get("timestamp")
        if not ts:
            return None
        try:
            dt = datetime.fromisoformat(ts)
        except ValueError:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        delta = dt_util.now() - dt
        return round(delta.total_seconds() / 3600, 1)


class DatapointsTodayCountSensor(_DatapointsPeriodicSensorBase):
    """Expose the count of datapoints recorded since the start of today (local time)."""

    _attr_icon = "mdi:calendar-today"

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, hass: HomeAssistant
    ) -> None:
        """Initialise the today count sensor."""
        super().__init__(entry, store, hass)
        self._attr_unique_id = f"{entry.entry_id}_today_count"
        self._attr_name = "Recorded today"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        today_start = dt_util.as_utc(dt_util.start_of_local_day())
        return self._store.get_events_count_in_range(start=today_start.isoformat())


class DatapointsWeekCountSensor(_DatapointsPeriodicSensorBase):
    """Expose the count of datapoints recorded since the start of this week (Mon, local time)."""

    _attr_icon = "mdi:calendar-week"

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, hass: HomeAssistant
    ) -> None:
        """Initialise the week count sensor."""
        super().__init__(entry, store, hass)
        self._attr_unique_id = f"{entry.entry_id}_week_count"
        self._attr_name = "Recorded this week"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        today_start = dt_util.start_of_local_day()
        week_start = dt_util.as_utc(today_start - timedelta(days=today_start.weekday()))
        return self._store.get_events_count_in_range(start=week_start.isoformat())


class DatapointsAutomationCountSensor(_DatapointsSensorBase):
    """Expose the count of automation-triggered datapoints."""

    _attr_icon = "mdi:robot"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the automation count sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_automation_count"
        self._attr_name = "Automation recorded"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        automation, _ = self._store.get_automation_manual_counts()
        return automation


class DatapointsManualCountSensor(_DatapointsSensorBase):
    """Expose the count of manually recorded datapoints."""

    _attr_icon = "mdi:hand-back-right"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the manual count sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_manual_count"
        self._attr_name = "Manually recorded"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        _, manual = self._store.get_automation_manual_counts()
        return manual


# ---------------------------------------------------------------------------
# Monitor helpers
# ---------------------------------------------------------------------------


def _build_detection_config(monitor: dict[str, Any]) -> dict[str, Any]:
    """Map monitor record → anomaly_detection config dict."""
    return {
        "anomaly_methods": monitor.get("anomaly_methods", ["trend_residual"]),
        "anomaly_sensitivity": monitor.get("anomaly_sensitivity", "medium"),
        "anomaly_overlap_mode": monitor.get("anomaly_overlap_mode", "all"),
        "anomaly_rate_window": monitor.get("anomaly_rate_window", "1h"),
        "anomaly_zscore_window": monitor.get("anomaly_zscore_window", "24h"),
        "anomaly_persistence_window": monitor.get("anomaly_persistence_window", "1h"),
        "trend_method": monitor.get("anomaly_trend_method", "rolling_average"),
        "trend_window": monitor.get("anomaly_trend_window", "24h"),
        "sample_interval": monitor.get("sample_interval"),
        "sample_aggregate": monitor.get("sample_aggregate", "mean"),
        "comparison_time_offset_ms": monitor.get("baseline_time_offset_hours", 0)
        * 3600
        * 1000,
    }


def _run_detection_sync(
    pts: list,
    config: dict[str, Any],
    comparison_pts: list | None = None,
    cancel: threading.Event | None = None,
) -> list:
    """Blocking wrapper: run anomaly detection and return clusters."""
    return run_anomaly_detection(pts, config, comparison_pts, cancel=cancel)


def _summarize_clusters(
    clusters: list[dict[str, Any]], max_entries: int = _MAX_CLUSTER_SUMMARIES
) -> list[dict[str, Any]]:
    """Return compact, bounded cluster summaries for entity attrs and events."""
    summaries: list[dict[str, Any]] = []
    for cluster in clusters:
        points = cluster.get("points", [])
        times = [
            point.get("timeMs")
            for point in points
            if isinstance(point, dict) and isinstance(point.get("timeMs"), (int, float))
        ]
        if times:
            start_ms = int(min(times))
            end_ms = int(max(times))
        else:
            start_ms = 0
            end_ms = 0

        max_deviation = cluster.get("maxDeviation", 0.0)
        if not isinstance(max_deviation, (int, float)):
            max_deviation = 0.0

        summaries.append(
            {
                "start_ms": start_ms,
                "end_ms": end_ms,
                "anomaly_method": cluster.get("anomalyMethod", "unknown"),
                "max_deviation": float(max_deviation),
                "point_count": len(points),
            }
        )

    if len(summaries) > max_entries:
        return summaries[-max_entries:]

    return summaries


def _overlap_threshold(mode: str, entity_count: int) -> int:
    """Return the minimum number of entities that must be anomalous simultaneously.

    Supports:
      "all"          → all entities (entity_count)
      "any" / "any_1"→ any single entity (1)
      "any_two_plus" → legacy alias for 2
      "any_N"        → at least N (N >= 2)
    """
    if mode == "all":
        return entity_count
    if mode in ("any", "any_1"):
        return 1
    if mode == "any_two_plus":
        return 2
    if mode.startswith("any_") and mode[4:].isdigit():
        return max(1, int(mode[4:]))
    return 1  # safe fallback


def _apply_dismissals(clusters: list, dismissed_windows: list) -> list:
    """Remove clusters whose time range overlaps any active dismissed window."""
    if not dismissed_windows:
        return clusters
    result = []
    for cluster in clusters:
        times = [p["timeMs"] for p in cluster.get("points", [])]
        if not times:
            result.append(cluster)
            continue
        cluster_start, cluster_end = min(times), max(times)
        overlaps = any(
            w["start_ms"] <= cluster_end and w["end_ms"] >= cluster_start
            for w in dismissed_windows
        )
        if not overlaps:
            result.append(cluster)
    return result


def _run_combined_detection(
    all_entity_pts: dict[str, list],
    config: dict[str, Any],
    overlap_mode: str,
    cancel: threading.Event | None = None,
) -> list[dict[str, Any]]:
    """Run detection per entity; return overlap windows as cluster-like dicts."""
    entity_ids = list(all_entity_pts.keys())
    if len(entity_ids) < 2:
        return []

    import bisect  # noqa: PLC0415

    # Build cluster time-windows per entity; pass cancel token between detections
    entity_windows: list[list[tuple[int, int]]] = []
    for eid in entity_ids:
        if cancel and cancel.is_set():
            return []
        pts = all_entity_pts[eid]
        if len(pts) < 3:
            entity_windows.append([])
            continue
        clusters = run_anomaly_detection(pts, config, cancel=cancel)
        windows: list[tuple[int, int]] = []
        for cluster in clusters:
            pts_in_cluster = cluster.get("points", [])
            if pts_in_cluster:
                times = [p["timeMs"] for p in pts_in_cluster]
                windows.append((min(times), max(times)))
        # Keep sorted by start for binary-search overlap check below
        windows.sort(key=lambda x: x[0])
        entity_windows.append(windows)

    # Pre-compute sorted start lists for O(log w) point-in-interval lookup
    sorted_starts: list[list[int]] = [[s for s, _ in ws] for ws in entity_windows]

    # Collect qualifying overlap windows as cluster-like dicts
    required = _overlap_threshold(overlap_mode, len(entity_ids))
    overlap_clusters: list[dict[str, Any]] = []
    seen: set[tuple[int, int]] = set()
    for i, windows_i in enumerate(entity_windows):
        for win_start, win_end in windows_i:
            if (win_start, win_end) in seen:
                continue
            check_time = (win_start + win_end) // 2
            hits = 0
            for j, windows_j in enumerate(entity_windows):
                if j == i or not windows_j:
                    continue
                # Binary search: find rightmost start <= check_time
                idx = bisect.bisect_right(sorted_starts[j], check_time) - 1
                if idx >= 0 and windows_j[idx][0] <= check_time <= windows_j[idx][1]:
                    hits += 1
            if hits + 1 >= required:
                seen.add((win_start, win_end))
                overlap_clusters.append(
                    {
                        "points": [
                            {"timeMs": win_start, "value": 0.0},
                            {"timeMs": win_end, "value": 0.0},
                        ],
                        "anomalyMethod": "combined_overlap",
                        "maxDeviation": 0.0,
                    }
                )
    return overlap_clusters


async def async_warm_cache(
    hass: HomeAssistant,
    store: DatapointsStore,
    pool,
    in_flight: dict,
) -> None:
    """Pre-populate anomaly cache for all enabled monitors at startup (best-effort)."""
    import uuid as _uuid  # noqa: PLC0415

    from homeassistant.components.recorder import get_instance  # noqa: PLC0415

    from .anomaly_cache import AnomalyCache, make_cache_key  # noqa: PLC0415

    cache: AnomalyCache = hass.data[DOMAIN]["anomaly_cache"]
    recorder = get_instance(hass)
    now = datetime.now(UTC)
    for monitor in store.get_monitors():
        if not monitor.get("enabled", True):
            continue
        monitor_type = monitor.get("type", "individual")
        if monitor_type == "combined":
            entity_ids = monitor.get("entity_ids", [])
        else:
            eid = monitor.get("entity_id", "")
            entity_ids = [eid] if eid else []
        if not entity_ids:
            continue

        await asyncio.sleep(0)  # yield between monitors
        look_back = monitor.get("look_back_hours", MONITOR_DEFAULT_LOOK_BACK_HOURS)
        start_t = (now - timedelta(hours=look_back)).isoformat()
        end_t = now.isoformat()
        config = _build_detection_config(monitor)
        cancel_ev = threading.Event()
        req_id = str(_uuid.uuid4())
        in_flight[req_id] = cancel_ev
        try:
            for entity_id in entity_ids:
                pts = await recorder.async_add_executor_job(
                    fetch_entity_pts, hass, entity_id, start_t, end_t
                )
                if len(pts) < 3:
                    continue
                clusters = await asyncio.wait_for(
                    hass.loop.run_in_executor(
                        pool, _run_detection_sync, pts, config, None, cancel_ev
                    ),
                    timeout=30,
                )
                try:
                    end_ts = datetime.fromisoformat(end_t).timestamp()
                except ValueError:
                    continue
                cache_key = make_cache_key(entity_id, start_t, end_t, config)
                await hass.loop.run_in_executor(
                    pool, cache.set, cache_key, entity_id, end_ts, clusters
                )
        except (TimeoutError, Exception):  # noqa: BLE001
            cancel_ev.set()
        finally:
            in_flight.pop(req_id, None)


# ---------------------------------------------------------------------------
# Monitor sensor
# ---------------------------------------------------------------------------


class DatapointsMonitorSensor(_DatapointsSensorBase):
    """A sensor that runs scheduled anomaly detection for a single monitor config."""

    _attr_icon = "mdi:bell-alert-outline"

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        """Initialise the monitor sensor."""
        super().__init__(entry, store)
        self._hass = hass
        self._monitor_id = monitor_id
        self._unsub_timer: Any = None
        self._unsub_stagger: Any = None

        monitor = store.get_monitor(monitor_id) or {}
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}"
        self._attr_name = monitor.get("name", f"Anomaly monitor {monitor_id[:8]}")
        self._attr_native_value = monitor.get("last_cluster_count", 0)

    @property
    def device_info(self) -> DeviceInfo:
        """Each monitor is its own device, nested under the main integration device."""
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    async def async_added_to_hass(self) -> None:
        """Register store listener and schedule the scan timer."""
        await super().async_added_to_hass()
        self._schedule_timer()

    def _schedule_timer(self) -> None:
        """Cancel any existing timer and create a new one if the monitor is enabled."""
        import uuid as _uuid  # noqa: PLC0415

        # Cancel any pending stagger that hasn't fired yet (guards against double-call).
        if self._unsub_stagger is not None:
            self._unsub_stagger()
            self._unsub_stagger = None

        if self._unsub_timer is not None:
            self._unsub_timer()
            self._unsub_timer = None

        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor or not monitor.get("enabled", True):
            return

        interval_minutes = monitor.get("scan_interval_minutes", 30)
        interval = timedelta(minutes=max(1, interval_minutes))

        # Deterministic 0–29 s stagger per monitor to avoid simultaneous startup bursts.
        # uuid.UUID(id).int is stable across restarts unlike hash() (PYTHONHASHSEED).
        try:
            stagger_secs = _uuid.UUID(self._monitor_id).int % 30
        except ValueError:
            stagger_secs = 0

        def _start(_now: Any = None) -> None:
            self._unsub_stagger = None  # stagger has fired; clear reference
            self._unsub_timer = async_track_time_interval(
                self._hass, self._handle_scan_tick, interval
            )
            self.async_on_remove(
                lambda: self._unsub_timer and self._unsub_timer()  # type: ignore[func-returns-value]
            )

        self._unsub_stagger = async_call_later(self._hass, stagger_secs, _start)
        self.async_on_remove(
            lambda: self._unsub_stagger and self._unsub_stagger()  # type: ignore[func-returns-value]
        )

    def _handle_scan_tick(self, now: datetime) -> None:
        """Trigger a scan on the next event loop iteration."""
        self._hass.async_create_task(self._run_scan())

    async def _run_scan(self) -> None:
        """Fetch history, run detection, update state and store."""
        from homeassistant.components.recorder import get_instance  # noqa: PLC0415

        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor or not monitor.get("enabled", True):
            return

        # Limit concurrent scans across all monitor sensors to avoid saturating
        # the dedicated executor pool during startup bursts or rapid rescans.
        semaphore = self._hass.data.get(DOMAIN, {}).get("scan_semaphore")
        pool = self._hass.data.get(DOMAIN, {}).get("executor")
        cancel_event = threading.Event()

        if semaphore:
            async with semaphore:
                await self._run_scan_inner(
                    monitor, pool, cancel_event, get_instance(self._hass)
                )
        else:
            await self._run_scan_inner(
                monitor, pool, cancel_event, get_instance(self._hass)
            )

    async def _run_scan_inner(
        self,
        monitor: dict,
        pool,
        cancel_event: threading.Event,
        recorder,
    ) -> None:
        """Inner scan body; called inside the semaphore context."""
        monitor_type = monitor.get("type", "individual")
        look_back_hours = monitor.get("look_back_hours", 24)
        config = _build_detection_config(monitor)
        now = datetime.now(UTC)
        start_time = (now - timedelta(hours=look_back_hours)).isoformat()
        end_time = now.isoformat()

        try:
            if monitor_type == "combined":
                entity_ids = monitor.get("entity_ids", [])
                all_pts: dict[str, list] = {}
                for eid in entity_ids:
                    pts = await recorder.async_add_executor_job(
                        fetch_entity_pts, self._hass, eid, start_time, end_time
                    )
                    stats = await recorder.async_add_executor_job(
                        fetch_entity_statistics_pts,
                        self._hass,
                        eid,
                        start_time,
                        end_time,
                    )
                    if stats:
                        if pts:
                            first_ms = pts[0][0]
                            stats = [p for p in stats if p[0] < first_ms]
                        if stats:
                            import operator  # noqa: PLC0415

                            pts = sorted(stats + pts, key=operator.itemgetter(0))
                    sample_interval = monitor.get("sample_interval")
                    if sample_interval and sample_interval != "raw":
                        interval_secs = parse_interval_seconds(sample_interval)
                        pts = downsample_pts(
                            pts, interval_secs, monitor.get("sample_aggregate", "mean")
                        )
                    all_pts[eid] = pts

                data_point_count = sum(len(v) for v in all_pts.values())
                overlap_mode = monitor.get("overlap_mode", "all")
                try:
                    clusters = await asyncio.wait_for(
                        self._hass.loop.run_in_executor(
                            pool,
                            _run_combined_detection,
                            all_pts,
                            config,
                            overlap_mode,
                            cancel_event,
                        ),
                        timeout=30.0,
                    )
                except TimeoutError:
                    cancel_event.set()
                    _LOGGER.warning(
                        "hass_datapoints: combined detection timed out for monitor %s",
                        self._monitor_id,
                    )
                    clusters = []
            else:
                entity_id = monitor.get("entity_id", "")
                pts = await recorder.async_add_executor_job(
                    fetch_entity_pts, self._hass, entity_id, start_time, end_time
                )
                stats = await recorder.async_add_executor_job(
                    fetch_entity_statistics_pts,
                    self._hass,
                    entity_id,
                    start_time,
                    end_time,
                )
                if stats:
                    if pts:
                        first_ms = pts[0][0]
                        stats = [p for p in stats if p[0] < first_ms]
                    if stats:
                        import operator  # noqa: PLC0415

                        pts = sorted(stats + pts, key=operator.itemgetter(0))
                sample_interval = monitor.get("sample_interval")
                if sample_interval and sample_interval != "raw":
                    interval_secs = parse_interval_seconds(sample_interval)
                    pts = downsample_pts(
                        pts, interval_secs, monitor.get("sample_aggregate", "mean")
                    )

                data_point_count = len(pts)
                clusters: list = []
                if len(pts) >= 3:
                    comparison_pts: list | None = None
                    baseline_entity_id = monitor.get("baseline_entity_id")
                    if baseline_entity_id and "comparison_window" in config.get(
                        "anomaly_methods", []
                    ):
                        comparison_pts = await recorder.async_add_executor_job(
                            fetch_entity_pts,
                            self._hass,
                            baseline_entity_id,
                            start_time,
                            end_time,
                        )
                    try:
                        clusters = await asyncio.wait_for(
                            self._hass.loop.run_in_executor(
                                pool,
                                _run_detection_sync,
                                pts,
                                config,
                                comparison_pts,
                                cancel_event,
                            ),
                            timeout=30.0,
                        )
                    except TimeoutError:
                        cancel_event.set()
                        _LOGGER.warning(
                            "hass_datapoints: detection timed out for monitor %s",
                            self._monitor_id,
                        )
                        clusters = []

            # Apply dismissals (prune expired first, then filter clusters)
            monitor_copy = self._store.get_monitor(self._monitor_id)
            if monitor_copy is None:
                return  # deleted while scan was running
            DatapointsStore.prune_dismissed_windows(monitor_copy, now)
            clusters = _apply_dismissals(
                clusters, monitor_copy.get("dismissed_windows", [])
            )

        except Exception as err:  # noqa: BLE001
            _LOGGER.error(
                "DatapointsMonitorSensor scan failed for monitor %s: %s",
                self._monitor_id,
                err,
            )
            return

        cluster_count = len(clusters)
        cluster_summaries = _summarize_clusters(clusters)
        scan_time = now.isoformat()
        prev_count: int = monitor_copy.get("last_cluster_count", 0)
        prev_cluster_summaries = monitor_copy.get("active_clusters_summary", [])

        DatapointsStore.append_scan_history(monitor_copy, scan_time, cluster_count)
        scan_updates: dict[str, Any] = {
            "last_scan_at": scan_time,
            "last_cluster_count": cluster_count,
            "active_cluster_count": cluster_count,
            "active_clusters_summary": cluster_summaries,
            "scan_history": monitor_copy["scan_history"],
            "last_scan_data_points": data_point_count,
            "dismissed_windows": monitor_copy.get("dismissed_windows", []),
        }
        if prev_count == 0 and cluster_count > 0:
            scan_updates["last_anomaly_at"] = scan_time
        if prev_count > 0 and cluster_count == 0:
            scan_updates["last_resolved_clusters_summary"] = prev_cluster_summaries
        await self._store.async_update_monitor(self._monitor_id, scan_updates)
        self._attr_native_value = cluster_count
        self.async_write_ha_state()

        # Fire transition events on the HA event bus.
        if prev_count == 0 and cluster_count > 0:
            consecutive = 0
            for entry in reversed(monitor_copy.get("scan_history", [])):
                if entry.get("count", 0) > 0:
                    consecutive += 1
                else:
                    break
            base: dict = {
                "monitor_id": self._monitor_id,
                "monitor_name": monitor.get("name", ""),
                "monitor_type": monitor_type,
                "scan_time": scan_time,
            }
            if monitor_type == "combined":
                base["entity_ids"] = monitor.get("entity_ids", [])
            else:
                base["entity_id"] = monitor.get("entity_id", "")
            self._hass.bus.async_fire(
                EVENT_ANOMALY_DETECTED,
                {
                    **base,
                    "cluster_count": cluster_count,
                    "active_cluster_count": cluster_count,
                    "active_clusters": cluster_summaries,
                    "consecutive_anomalous_scans": consecutive,
                },
            )
        elif prev_count > 0 and cluster_count == 0:
            base = {
                "monitor_id": self._monitor_id,
                "monitor_name": monitor.get("name", ""),
                "monitor_type": monitor_type,
                "scan_time": scan_time,
            }
            if monitor_type == "combined":
                base["entity_ids"] = monitor.get("entity_ids", [])
            else:
                base["entity_id"] = monitor.get("entity_id", "")
            self._hass.bus.async_fire(
                EVENT_ANOMALY_RESOLVED,
                {
                    **base,
                    "active_cluster_count": 0,
                    "active_clusters": [],
                    "resolved_clusters": prev_cluster_summaries,
                },
            )

    async def _handle_entity_unavailable(self, entity_id: str) -> None:
        """Disable the monitor and fire a persistent notification."""
        from homeassistant.components import persistent_notification  # noqa: PLC0415

        await self._store.async_update_monitor(self._monitor_id, {"enabled": False})
        persistent_notification.async_create(
            self._hass,
            f"Anomaly monitor **{self._store.get_monitor(self._monitor_id) or {}}** was disabled because entity `{entity_id}` is unavailable.",
            title="Hass Data Points — Monitor disabled",
            notification_id=f"dp_monitor_disabled_{self._monitor_id}",
        )

    def _handle_store_update(self) -> None:
        """Refresh name, value, and reschedule timer when the monitor config changes."""
        monitor = self._store.get_monitor(self._monitor_id)
        if monitor is None:
            return
        self._attr_name = monitor.get("name", self._attr_name)
        self._attr_native_value = monitor.get(
            "last_cluster_count", self._attr_native_value
        )
        self._schedule_timer()
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extended attributes for automations and dashboards."""
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor:
            return {}
        attrs: dict[str, Any] = {
            "look_back_hours": monitor.get("look_back_hours", 24),
            "scan_interval_minutes": monitor.get("scan_interval_minutes", 30),
            "anomaly_methods": monitor.get("anomaly_methods", []),
            "sensitivity": monitor.get("anomaly_sensitivity", "medium"),
            "active_cluster_count": monitor.get(
                "active_cluster_count", monitor.get("last_cluster_count", 0)
            ),
            "active_clusters": monitor.get("active_clusters_summary", []),
            "last_scan_data_points": monitor.get("last_scan_data_points"),
            "last_scan_at": monitor.get("last_scan_at"),
            "last_anomaly_at": monitor.get("last_anomaly_at"),
            "dismissed_windows": monitor.get("dismissed_windows", []),
        }
        if monitor.get("type") == "combined":
            attrs["entity_ids"] = monitor.get("entity_ids", [])
        else:
            attrs["entity_id"] = monitor.get("entity_id", "")
        return attrs


# ---------------------------------------------------------------------------
# Per-monitor device helper
# ---------------------------------------------------------------------------


def _monitor_device_info(
    entry: ConfigEntry, store: DatapointsStore, monitor_id: str
) -> DeviceInfo:
    """Return DeviceInfo pointing to the per-monitor device."""
    monitor = store.get_monitor(monitor_id) or {}
    return DeviceInfo(
        identifiers={(DOMAIN, f"{entry.entry_id}_monitor_{monitor_id}")},
        name=monitor.get("name", f"Anomaly monitor {monitor_id[:8]}"),
        manufacturer="buggedcom",
        model="Anomaly Monitor",
        via_device=(DOMAIN, entry.entry_id),
    )


def _consecutive_anomalous_scans(scan_history: list[dict[str, Any]]) -> int:
    """Return the trailing streak of scans with cluster_count > 0."""
    consecutive = 0
    for entry in reversed(scan_history):
        if entry.get("count", 0) > 0:
            consecutive += 1
        else:
            break
    return consecutive


# ---------------------------------------------------------------------------
# Per-monitor device sensors
# ---------------------------------------------------------------------------


class DatapointsMonitorConsecutiveScansSensor(_DatapointsSensorBase):
    """Reports the number of consecutive anomalous scans for a monitor."""

    _attr_icon = "mdi:repeat-variant"
    _attr_native_unit_of_measurement = "scans"

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, monitor_id: str
    ) -> None:
        super().__init__(entry, store)
        self._monitor_id = monitor_id
        self._attr_unique_id = (
            f"{entry.entry_id}_monitor_{monitor_id}_consecutive_scans"
        )
        self._attr_name = "Consecutive anomalous scans"
        self._attr_native_value = self._compute()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    def _compute(self) -> int:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor:
            return 0
        return _consecutive_anomalous_scans(monitor.get("scan_history", []))


class DatapointsMonitorLastScanSensor(_DatapointsSensorBase):
    """Reports the timestamp of the last scan for a monitor."""

    _attr_icon = "mdi:clock-check-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_registry_enabled_default = False  # diagnostic — hidden by default

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, monitor_id: str
    ) -> None:
        super().__init__(entry, store)
        self._monitor_id = monitor_id
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_last_scan_at"
        self._attr_name = "Last scan"
        self._attr_native_value = self._compute()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    def _compute(self) -> datetime | None:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor:
            return None
        raw = monitor.get("last_scan_at")
        if not raw:
            return None
        try:
            dt = datetime.fromisoformat(raw)
            return dt if dt.tzinfo else dt.replace(tzinfo=UTC)
        except ValueError:
            return None


class DatapointsMonitorLastAnomalySensor(_DatapointsSensorBase):
    """Reports the timestamp when an anomaly was last detected for a monitor."""

    _attr_icon = "mdi:clock-alert-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, monitor_id: str
    ) -> None:
        super().__init__(entry, store)
        self._monitor_id = monitor_id
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_last_anomaly_at"
        self._attr_name = "Last anomaly detected"
        self._attr_native_value = self._compute()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    def _compute(self) -> datetime | None:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor:
            return None
        raw = monitor.get("last_anomaly_at")
        if not raw:
            return None
        try:
            dt = datetime.fromisoformat(raw)
            return dt if dt.tzinfo else dt.replace(tzinfo=UTC)
        except ValueError:
            return None


class DatapointsMonitorAnomalyDurationSensor(_DatapointsPeriodicSensorBase):
    """Reports how many minutes the current anomaly has been active.

    Returns 0 when there is no active anomaly. Time-driven so the value
    increases with wall clock time without needing a store update.
    """

    _attr_icon = "mdi:timer-alert-outline"
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES

    def __init__(
        self,
        entry: ConfigEntry,
        store: DatapointsStore,
        hass: HomeAssistant,
        monitor_id: str,
    ) -> None:
        super().__init__(entry, store, hass)
        self._monitor_id = monitor_id
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_anomaly_duration"
        self._attr_name = "Anomaly duration"
        self._attr_native_value = self._compute()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    def _compute(self) -> int:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor or (monitor.get("last_cluster_count") or 0) == 0:
            return 0
        consecutive = _consecutive_anomalous_scans(monitor.get("scan_history", []))
        interval = monitor.get("scan_interval_minutes", 30)
        return consecutive * interval


class DatapointsMonitorDataPointsSensor(_DatapointsSensorBase):
    """Reports the number of data points found in the last scan."""

    _attr_icon = "mdi:chart-scatter-plot"
    _attr_native_unit_of_measurement = "points"

    def __init__(
        self, entry: ConfigEntry, store: DatapointsStore, monitor_id: str
    ) -> None:
        super().__init__(entry, store)
        self._monitor_id = monitor_id
        self._attr_unique_id = f"{entry.entry_id}_monitor_{monitor_id}_data_points"
        self._attr_name = "Data points in last scan"
        self._attr_native_value = self._compute()

    @property
    def device_info(self) -> DeviceInfo:
        return _monitor_device_info(self._entry, self._store, self._monitor_id)

    def _compute(self) -> int:
        monitor = self._store.get_monitor(self._monitor_id)
        if not monitor:
            return 0
        return monitor.get("last_scan_data_points") or 0


# ---------------------------------------------------------------------------
# Aggregate monitor sensor
# ---------------------------------------------------------------------------


class DatapointsAggregateAnomalyMonitorsSensor(_DatapointsSensorBase):
    """Reports the count of enabled monitors that currently have anomalies detected."""

    _attr_icon = "mdi:bell-alert"

    def __init__(self, entry: ConfigEntry, store: DatapointsStore) -> None:
        """Initialise the aggregate anomaly monitors sensor."""
        super().__init__(entry, store)
        self._attr_unique_id = f"{entry.entry_id}_anomaly_monitors_active"
        self._attr_name = "Anomaly monitors active"
        self._attr_native_value = self._compute()

    def _compute(self) -> int:
        return sum(
            1
            for m in self._store.get_monitors()
            if m.get("enabled", True) and (m.get("last_cluster_count") or 0) > 0
        )
