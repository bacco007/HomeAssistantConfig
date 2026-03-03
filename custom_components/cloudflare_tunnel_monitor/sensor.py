from __future__ import annotations

import logging
import time
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfDataRate, UnitOfInformation, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_ACCOUNT_ID, DOMAIN

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0

PROCESS_START_TIME_KEY = "process_start_time_seconds"
PROCESS_RESIDENT_MEMORY_KEY = "process_resident_memory_bytes"
PROCESS_CPU_SECONDS_TOTAL_KEY = "process_cpu_seconds_total"
PROCESS_OPEN_FDS_KEY = "process_open_fds"
PROCESS_MAX_FDS_KEY = "process_max_fds"
PROCESS_NETWORK_RECEIVE_BYTES_TOTAL_KEY = "process_network_receive_bytes_total"
PROCESS_NETWORK_TRANSMIT_BYTES_TOTAL_KEY = "process_network_transmit_bytes_total"


def _normalize_number(value: float | int | None) -> float | int | None:
    """Normalize integral floats to int for cleaner state values."""
    if value is None:
        return None
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


class CloudflareTunnelSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Cloudflare tunnel status sensor."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["inactive", "degraded", "healthy", "down"]

    def __init__(
        self,
        coordinator: Any,
        tunnel_id: str,
        tunnel_name: str,
        entry_id: str,
        account_id: str,
    ) -> None:
        """Initialize the tunnel sensor."""
        super().__init__(coordinator)
        self._tunnel_id = tunnel_id
        self._attr_name = f"Cloudflare Tunnel {tunnel_name}"
        self._attr_unique_id = f"{DOMAIN}_{tunnel_id}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, f"{entry_id}_cloudflare_tunnels_{account_id}")},
            "name": "Cloudflare Tunnels",
            "manufacturer": "Cloudflare",
        }

    @property
    def native_value(self) -> str | None:
        """Return tunnel status from coordinator data."""
        if self.coordinator.data:
            tunnel = next(
                (t for t in self.coordinator.data if t.get("id") == self._tunnel_id),
                None,
            )
            if tunnel:
                return tunnel.get("status")
        return None

    @property
    def icon(self) -> str:
        """Return icon based on health state."""
        return (
            "mdi:cloud-check"
            if self.native_value == "healthy"
            else "mdi:cloud-off-outline"
        )


def _metrics_device_info(entry_id: str) -> dict[str, Any]:
    """Return shared device info for cloudflared metrics sensors."""
    return {
        "identifiers": {(DOMAIN, f"{entry_id}_cloudflared_metrics")},
        "name": "cloudflared Metrics",
        "manufacturer": "Cloudflare",
        "model": "cloudflared",
    }


def _percentile(sorted_values: list[float], pct: float) -> float | None:
    """Return percentile using linear interpolation (numpy-style)."""
    if not sorted_values:
        return None
    n = len(sorted_values)
    if n == 1:
        return sorted_values[0]
    k = (pct / 100.0) * (n - 1)
    f = int(k)
    c = f + 1
    if c >= n:
        return sorted_values[-1]
    d = k - f
    return sorted_values[f] + d * (sorted_values[c] - sorted_values[f])


def _labeled_values(data: dict[str, Any], metric_name: str) -> list[float]:
    """Extract values from a labeled metric family."""
    samples = data.get("labeled", {}).get(metric_name, [])
    return [sample.get("value", 0.0) for sample in samples]


def _aggregate_labeled_sum_count(
    data: dict[str, Any], sum_metric: str, count_metric: str
) -> tuple[float, float] | None:
    """Aggregate _sum and _count across labelsets (with unlabeled fallback)."""
    sum_samples = data.get("labeled", {}).get(sum_metric, [])
    count_samples = data.get("labeled", {}).get(count_metric, [])

    if not sum_samples and sum_metric not in data.get("unlabeled", {}):
        return None

    total_sum = (
        sum(sample["value"] for sample in sum_samples)
        if sum_samples
        else data.get("unlabeled", {}).get(sum_metric, 0.0)
    )
    total_count = (
        sum(sample["value"] for sample in count_samples)
        if count_samples
        else data.get("unlabeled", {}).get(count_metric, 0.0)
    )

    if total_count <= 0:
        return None

    return (total_sum, total_count)


def _avg_bps(coordinator: Any, bytes_metric: str) -> float | None:
    """Return lifetime average bytes/sec since process start."""
    if not coordinator.data:
        return None

    total = sum(_labeled_values(coordinator.data, bytes_metric))
    start = coordinator.data.get("unlabeled", {}).get(PROCESS_START_TIME_KEY)
    if start is None:
        return None

    uptime = time.time() - start
    if uptime <= 0:
        return None

    return total / uptime


def _metric_min(coordinator: Any, metric_name: str) -> float | None:
    values = _labeled_values(coordinator.data, metric_name)
    return min(values) if values else None


def _metric_avg(coordinator: Any, metric_name: str) -> float | None:
    values = _labeled_values(coordinator.data, metric_name)
    return (sum(values) / len(values)) if values else None


def _metric_max(coordinator: Any, metric_name: str) -> float | None:
    values = _labeled_values(coordinator.data, metric_name)
    return max(values) if values else None


def _metric_pct(coordinator: Any, metric_name: str, pct: float) -> float | None:
    values = sorted(_labeled_values(coordinator.data, metric_name))
    return _percentile(values, pct)


def _proxy_connect_avg(coordinator: Any) -> float | None:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_proxy_connect_latency_sum",
        "cloudflared_proxy_connect_latency_count",
    )
    return (result[0] / result[1]) if result else None


def _proxy_connect_attrs(coordinator: Any) -> dict[str, Any]:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_proxy_connect_latency_sum",
        "cloudflared_proxy_connect_latency_count",
    )
    return {"count_since_start": _normalize_number(result[1])} if result else {}


def _rpc_client_avg(coordinator: Any) -> float | None:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_rpc_client_latency_secs_sum",
        "cloudflared_rpc_client_latency_secs_count",
    )
    return (1000.0 * result[0] / result[1]) if result else None


def _rpc_client_attrs(coordinator: Any) -> dict[str, Any]:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_rpc_client_latency_secs_sum",
        "cloudflared_rpc_client_latency_secs_count",
    )
    return {"calls_since_start": _normalize_number(result[1])} if result else {}


def _rpc_server_avg(coordinator: Any) -> float | None:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_rpc_server_latency_secs_sum",
        "cloudflared_rpc_server_latency_secs_count",
    )
    return (1000.0 * result[0] / result[1]) if result else None


def _rpc_server_attrs(coordinator: Any) -> dict[str, Any]:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "cloudflared_rpc_server_latency_secs_sum",
        "cloudflared_rpc_server_latency_secs_count",
    )
    return {"calls_since_start": _normalize_number(result[1])} if result else {}


def _gc_pause_avg(coordinator: Any) -> float | None:
    result = _aggregate_labeled_sum_count(
        coordinator.data,
        "go_gc_duration_seconds_sum",
        "go_gc_duration_seconds_count",
    )
    return (1000.0 * result[0] / result[1]) if result else None


def _gc_pause_max(coordinator: Any) -> float | None:
    samples = coordinator.data.get("labeled", {}).get("go_gc_duration_seconds", [])
    for sample in samples:
        quantile = sample.get("labels", {}).get("quantile", "")
        if quantile in ("1", "1.0"):
            return 1000.0 * sample.get("value", 0.0)
    return None


def _gc_pause_attrs(coordinator: Any) -> dict[str, Any]:
    count = coordinator.data.get("unlabeled", {}).get("go_gc_duration_seconds_count")
    return {"cycles_since_start": _normalize_number(count)} if count is not None else {}


class CloudflaredBuildVersionSensor(CoordinatorEntity, SensorEntity):
    """Expose build_info version as a string sensor with label attributes."""

    def __init__(self, coordinator: Any, entry_id: str) -> None:
        """Initialize the build version sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_cloudflared_build_version"
        self._attr_name = "Cloudflared Build Version"
        self._attr_device_info = _metrics_device_info(entry_id)

    @property
    def native_value(self) -> str | None:
        """Return build version label from build_info."""
        if not self.coordinator.data:
            return None
        samples = self.coordinator.data.get("labeled", {}).get("build_info", [])
        if samples:
            return samples[0].get("labels", {}).get("version")
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return non-version build labels as attributes."""
        if not self.coordinator.data:
            return {}
        samples = self.coordinator.data.get("labeled", {}).get("build_info", [])
        if not samples:
            return {}
        labels = samples[0].get("labels", {})
        return {key: val for key, val in labels.items() if key != "version"}


class CloudflaredProcessStartTimeSensor(CoordinatorEntity, SensorEntity):
    """Expose process_start_time_seconds as a timezone-aware datetime sensor."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, coordinator: Any, entry_id: str) -> None:
        """Initialize the process start time sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_{PROCESS_START_TIME_KEY}"
        self._attr_name = "Process Start Time"
        self._attr_device_info = _metrics_device_info(entry_id)

    @property
    def native_value(self) -> datetime | None:
        """Return process start time as a timezone-aware datetime."""
        if not self.coordinator.data:
            return None
        epoch = self.coordinator.data.get("unlabeled", {}).get(PROCESS_START_TIME_KEY)
        if epoch is None:
            return None
        return datetime.fromtimestamp(epoch, tz=timezone.utc)


@dataclass(frozen=True, kw_only=True)
class CloudflaredDirectSensorDescription(SensorEntityDescription):
    """Description for direct unlabeled cloudflared metrics."""

    prometheus_key: str


@dataclass(frozen=True, kw_only=True)
class CloudflaredDerivedSensorDescription(SensorEntityDescription):
    """Description for derived cloudflared metrics."""

    value_fn: Callable[[Any], float | int | str | None]
    attrs_fn: Callable[[Any], dict[str, Any] | None] | None = None


class CloudflaredDirectMetricSensor(CoordinatorEntity, SensorEntity):
    """Sensor exposing an unlabeled metric directly from parsed Prometheus data."""

    entity_description: CloudflaredDirectSensorDescription

    def __init__(
        self,
        coordinator: Any,
        entry_id: str,
        description: CloudflaredDirectSensorDescription,
    ) -> None:
        """Initialize a direct metric sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = _metrics_device_info(entry_id)

    @property
    def native_value(self) -> float | int | None:
        """Return current metric value."""
        if not self.coordinator.data:
            return None
        value = self.coordinator.data.get("unlabeled", {}).get(
            self.entity_description.prometheus_key
        )
        return _normalize_number(value)


class CloudflaredDerivedMetricSensor(CoordinatorEntity, SensorEntity):
    """Sensor with value derived from one or more metrics."""

    entity_description: CloudflaredDerivedSensorDescription

    def __init__(
        self,
        coordinator: Any,
        entry_id: str,
        description: CloudflaredDerivedSensorDescription,
    ) -> None:
        """Initialize a derived metric sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry_id}_{description.key}"
        self._attr_device_info = _metrics_device_info(entry_id)

    @property
    def native_value(self) -> float | int | str | None:
        """Return calculated metric value."""
        if not self.coordinator.data:
            return None
        try:
            value = self.entity_description.value_fn(self.coordinator)
            if isinstance(value, (float, int)):
                return _normalize_number(value)
            return value
        except Exception as err:  # pragma: no cover - defensive for metric parsing edge cases
            _LOGGER.debug(
                "Derived metric calculation failed for %s: %s",
                self.entity_description.key,
                err,
            )
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return derived metric attributes when configured."""
        if not self.coordinator.data or not self.entity_description.attrs_fn:
            return {}
        try:
            return self.entity_description.attrs_fn(self.coordinator) or {}
        except Exception as err:  # pragma: no cover - defensive for metric parsing edge cases
            _LOGGER.debug(
                "Derived metric attributes failed for %s: %s",
                self.entity_description.key,
                err,
            )
            return {}


DIRECT_SENSORS: tuple[CloudflaredDirectSensorDescription, ...] = (
    CloudflaredDirectSensorDescription(
        key="cloudflared_tunnel_ha_connections",
        name="Cloudflared Tunnel HA Connections",
        prometheus_key="cloudflared_tunnel_ha_connections",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_tunnel_concurrent_requests_per_tunnel",
        name="Cloudflared Tunnel Concurrent Requests Per Tunnel",
        prometheus_key="cloudflared_tunnel_concurrent_requests_per_tunnel",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_tunnel_total_requests",
        name="Cloudflared Tunnel Total Requests",
        prometheus_key="cloudflared_tunnel_total_requests",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_tunnel_request_errors",
        name="Cloudflared Tunnel Request Errors",
        prometheus_key="cloudflared_tunnel_request_errors",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_proxy_connect_streams_errors",
        name="Cloudflared Proxy Connect Streams Errors",
        prometheus_key="cloudflared_proxy_connect_streams_errors",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_tcp_active_sessions",
        name="Cloudflared TCP Active Sessions",
        prometheus_key="cloudflared_tcp_active_sessions",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_tcp_total_sessions",
        name="Cloudflared TCP Total Sessions",
        prometheus_key="cloudflared_tcp_total_sessions",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_udp_active_sessions",
        name="Cloudflared UDP Active Sessions",
        prometheus_key="cloudflared_udp_active_sessions",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key="cloudflared_udp_total_sessions",
        name="Cloudflared UDP Total Sessions",
        prometheus_key="cloudflared_udp_total_sessions",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="quic_client_total_connections",
        name="QUIC Client Total Connections",
        prometheus_key="quic_client_total_connections",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="quic_client_closed_connections",
        name="QUIC Client Closed Connections",
        prometheus_key="quic_client_closed_connections",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key="quic_client_packet_too_big_dropped",
        name="QUIC Client Packet Too Big Dropped",
        prometheus_key="quic_client_packet_too_big_dropped",
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_RESIDENT_MEMORY_KEY,
        name="Process Resident Memory",
        prometheus_key=PROCESS_RESIDENT_MEMORY_KEY,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_CPU_SECONDS_TOTAL_KEY,
        name="Process CPU Seconds Total",
        prometheus_key=PROCESS_CPU_SECONDS_TOTAL_KEY,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=2,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_OPEN_FDS_KEY,
        name="Process Open FDs",
        prometheus_key=PROCESS_OPEN_FDS_KEY,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_MAX_FDS_KEY,
        name="Process Max FDs",
        prometheus_key=PROCESS_MAX_FDS_KEY,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_NETWORK_RECEIVE_BYTES_TOTAL_KEY,
        name="Process Network Receive Bytes Total",
        prometheus_key=PROCESS_NETWORK_RECEIVE_BYTES_TOTAL_KEY,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=2,
    ),
    CloudflaredDirectSensorDescription(
        key=PROCESS_NETWORK_TRANSMIT_BYTES_TOTAL_KEY,
        name="Process Network Transmit Bytes Total",
        prometheus_key=PROCESS_NETWORK_TRANSMIT_BYTES_TOTAL_KEY,
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=2,
    ),
)


DERIVED_SENSORS: tuple[CloudflaredDerivedSensorDescription, ...] = (
    CloudflaredDerivedSensorDescription(
        key="quic_active_connections",
        name="QUIC Active Connections",
        native_unit_of_measurement="connections",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda c: len(_labeled_values(c.data, "quic_client_latest_rtt")) or None,
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_min_ms",
        name="QUIC Latest RTT Min",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_min(c, "quic_client_latest_rtt"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_p50_ms",
        name="QUIC Latest RTT P50",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_pct(c, "quic_client_latest_rtt", 50),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_p75_ms",
        name="QUIC Latest RTT P75",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_pct(c, "quic_client_latest_rtt", 75),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_p95_ms",
        name="QUIC Latest RTT P95",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_pct(c, "quic_client_latest_rtt", 95),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_avg_ms",
        name="QUIC Latest RTT Avg",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_avg(c, "quic_client_latest_rtt"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_latest_rtt_max_ms",
        name="QUIC Latest RTT Max",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_max(c, "quic_client_latest_rtt"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_sent_bytes_total",
        name="QUIC Sent Bytes Total",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=2,
        value_fn=lambda c: (
            sum(values)
            if (values := _labeled_values(c.data, "quic_client_sent_bytes"))
            else None
        ),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_received_bytes_total",
        name="QUIC Received Bytes Total",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=2,
        value_fn=lambda c: (
            sum(values)
            if (values := _labeled_values(c.data, "quic_client_receive_bytes"))
            else None
        ),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_sent_bytes_per_second",
        name="QUIC Sent Bytes Per Second",
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: c.sent_rate,
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_received_bytes_per_second",
        name="QUIC Received Bytes Per Second",
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: c.recv_rate,
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_sent_avg_bps_since_start",
        name="QUIC Sent Avg Bps Since Start",
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _avg_bps(c, "quic_client_sent_bytes"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_recv_avg_bps_since_start",
        name="QUIC Received Avg Bps Since Start",
        native_unit_of_measurement=UnitOfDataRate.BYTES_PER_SECOND,
        device_class=SensorDeviceClass.DATA_RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _avg_bps(c, "quic_client_receive_bytes"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_congestion_window_min_bytes",
        name="QUIC Congestion Window Min",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_min(c, "quic_client_congestion_window"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_congestion_window_avg_bytes",
        name="QUIC Congestion Window Avg",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_avg(c, "quic_client_congestion_window"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_congestion_window_max_bytes",
        name="QUIC Congestion Window Max",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_max(c, "quic_client_congestion_window"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_mtu_min_bytes",
        name="QUIC MTU Min",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_min(c, "quic_client_mtu"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_mtu_avg_bytes",
        name="QUIC MTU Avg",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_avg(c, "quic_client_mtu"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_mtu_max_bytes",
        name="QUIC MTU Max",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_max(c, "quic_client_mtu"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_max_udp_payload_min_bytes",
        name="QUIC Max UDP Payload Min",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_min(c, "quic_client_max_udp_payload"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_max_udp_payload_avg_bytes",
        name="QUIC Max UDP Payload Avg",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_avg(c, "quic_client_max_udp_payload"),
    ),
    CloudflaredDerivedSensorDescription(
        key="quic_max_udp_payload_max_bytes",
        name="QUIC Max UDP Payload Max",
        native_unit_of_measurement=UnitOfInformation.BYTES,
        device_class=SensorDeviceClass.DATA_SIZE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda c: _metric_max(c, "quic_client_max_udp_payload"),
    ),
    CloudflaredDerivedSensorDescription(
        key="proxy_connect_latency_avg_since_start_ms",
        name="Proxy Connect Latency Avg Since Start",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=_proxy_connect_avg,
        attrs_fn=_proxy_connect_attrs,
    ),
    CloudflaredDerivedSensorDescription(
        key="rpc_client_latency_avg_since_start_ms",
        name="RPC Client Latency Avg Since Start",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=_rpc_client_avg,
        attrs_fn=_rpc_client_attrs,
    ),
    CloudflaredDerivedSensorDescription(
        key="rpc_server_latency_avg_since_start_ms",
        name="RPC Server Latency Avg Since Start",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=_rpc_server_avg,
        attrs_fn=_rpc_server_attrs,
    ),
    CloudflaredDerivedSensorDescription(
        key="go_gc_pause_avg_since_start_ms",
        name="Go GC Pause Avg Since Start",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=_gc_pause_avg,
        attrs_fn=_gc_pause_attrs,
    ),
    CloudflaredDerivedSensorDescription(
        key="go_gc_pause_max_ms",
        name="Go GC Pause Max",
        native_unit_of_measurement=UnitOfTime.MILLISECONDS,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=_gc_pause_max,
        attrs_fn=_gc_pause_attrs,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Cloudflare tunnel + cloudflared metrics sensors from a config entry."""
    data = hass.data[DOMAIN][entry.entry_id]
    api_coordinator = data["api_coordinator"]
    metrics_coordinator = data.get("metrics_coordinator")

    entities: list[SensorEntity] = []

    account_id = entry.data[CONF_ACCOUNT_ID]
    known_tunnel_ids: set[str] = set()
    for tunnel in api_coordinator.data or []:
        tunnel_id = tunnel.get("id")
        tunnel_name = tunnel.get("name")
        if not tunnel_id or not tunnel_name:
            continue
        known_tunnel_ids.add(tunnel_id)
        entities.append(
            CloudflareTunnelSensor(
                api_coordinator,
                tunnel_id,
                tunnel_name,
                entry.entry_id,
                account_id,
            )
        )

    if metrics_coordinator is not None:
        entities.append(CloudflaredBuildVersionSensor(metrics_coordinator, entry.entry_id))
        entities.append(CloudflaredProcessStartTimeSensor(metrics_coordinator, entry.entry_id))

        for description in DIRECT_SENSORS:
            entities.append(
                CloudflaredDirectMetricSensor(
                    metrics_coordinator,
                    entry.entry_id,
                    description,
                )
            )

        for description in DERIVED_SENSORS:
            entities.append(
                CloudflaredDerivedMetricSensor(
                    metrics_coordinator,
                    entry.entry_id,
                    description,
                )
            )

    if entities:
        async_add_entities(entities, True)

    @callback
    def _check_tunnels() -> None:
        """Add sensors for newly discovered tunnels."""
        current_tunnels = api_coordinator.data or []
        current_ids = {
            tunnel.get("id")
            for tunnel in current_tunnels
            if tunnel.get("id") and tunnel.get("name")
        }
        new_ids = current_ids - known_tunnel_ids
        if not new_ids:
            return

        known_tunnel_ids.update(new_ids)
        new_entities: list[SensorEntity] = []
        for tunnel in current_tunnels:
            tunnel_id = tunnel.get("id")
            tunnel_name = tunnel.get("name")
            if tunnel_id not in new_ids or not tunnel_name:
                continue
            new_entities.append(
                CloudflareTunnelSensor(
                    api_coordinator,
                    tunnel_id,
                    tunnel_name,
                    entry.entry_id,
                    account_id,
                )
            )

        if new_entities:
            async_add_entities(new_entities, True)

    entry.async_on_unload(api_coordinator.async_add_listener(_check_tunnels))
