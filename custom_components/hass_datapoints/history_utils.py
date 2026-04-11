"""History utilities for hass_datapoints: recorder access and downsampling."""

from __future__ import annotations

import inspect
import logging
import math
import statistics
from datetime import UTC, datetime

_LOGGER = logging.getLogger(__name__)

INTERVAL_SECONDS: dict[str, int] = {
    "1s": 1,
    "5s": 5,
    "10s": 10,
    "15s": 15,
    "30s": 30,
    "1m": 60,
    "2m": 120,
    "5m": 300,
    "10m": 600,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "2h": 7200,
    "3h": 10800,
    "4h": 14400,
    "6h": 21600,
    "12h": 43200,
    "24h": 86400,
}


def parse_interval_seconds(interval: str) -> int:
    """Return interval in seconds; 0 for unknown / 'raw'."""
    return INTERVAL_SECONDS.get(interval, 0)


def _parse_dt(iso: str) -> datetime:
    dt = datetime.fromisoformat(iso)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


def fetch_entity_pts(
    hass, entity_id: str, start_time_iso: str, end_time_iso: str
) -> list:
    """Fetch raw [[timeMs, value], ...] from recorder.

    Must be called via hass.async_add_executor_job — this function is blocking.
    Returns an empty list on any error.
    """
    try:
        from homeassistant.components.recorder.history import (  # noqa: PLC0415
            get_significant_states,
        )
    except ImportError:
        _LOGGER.warning("hass_datapoints: get_significant_states not available")
        return []

    try:
        start_dt = _parse_dt(start_time_iso)
        end_dt = _parse_dt(end_time_iso)
    except ValueError:
        _LOGGER.warning(
            "hass_datapoints: invalid time range %s – %s", start_time_iso, end_time_iso
        )
        return []

    try:
        signature = inspect.signature(get_significant_states)
        positional_args = []
        keyword_args = {}

        for parameter in signature.parameters.values():
            if parameter.kind in (
                inspect.Parameter.VAR_POSITIONAL,
                inspect.Parameter.VAR_KEYWORD,
            ):
                continue

            if parameter.name in ("hass", "instance", "recorder", "recorder_instance"):
                positional_args.append(hass)
                continue

            if parameter.name == "start_time":
                positional_args.append(start_dt)
                continue

            if parameter.name == "end_time":
                positional_args.append(end_dt)
                continue

            if parameter.name == "entity_ids":
                positional_args.append([entity_id])
                continue

            if parameter.name == "entity_id":
                positional_args.append(entity_id)
                continue

            if parameter.name == "include_start_time_state":
                keyword_args["include_start_time_state"] = False
                continue

            if parameter.name == "significant_changes_only":
                keyword_args["significant_changes_only"] = False
                continue

            if parameter.name == "minimal_response":
                keyword_args["minimal_response"] = False
                continue

            if parameter.name == "no_attributes":
                keyword_args["no_attributes"] = True
                continue

        states_dict = get_significant_states(*positional_args, **keyword_args)
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning(
            "hass_datapoints: get_significant_states failed for %s: %s", entity_id, err
        )
        return []

    if isinstance(states_dict, dict):
        states = states_dict.get(entity_id, [])
    elif isinstance(states_dict, list):
        states = states_dict
    else:
        states = []
    pts: list = []
    for state in states:
        try:
            value = float(state.state)
        except (ValueError, TypeError, AttributeError):
            continue
        if not math.isfinite(value):
            continue
        # last_updated_timestamp is available in HA 2023.9+; fall back to last_updated.
        try:
            ts_ms = int(state.last_updated_timestamp * 1000)
        except (AttributeError, TypeError):
            try:
                ts_ms = int(state.last_updated.timestamp() * 1000)
            except Exception:  # noqa: BLE001
                continue
        pts.append([ts_ms, value])

    _LOGGER.debug(
        "hass_datapoints: fetch_entity_pts %s → %d pts (%d states)",
        entity_id,
        len(pts),
        len(states),
    )
    return pts


def fetch_entity_statistics_pts(
    hass, entity_id: str, start_time_iso: str, end_time_iso: str
) -> list:
    """Fetch hourly long-term statistics as [[timeMs, mean], ...].

    Must be called via hass.async_add_executor_job — this function is blocking.
    Returns an empty list on any error or if no statistics exist for the entity.
    """
    try:
        from homeassistant.components.recorder.statistics import (  # noqa: PLC0415
            statistics_during_period,
        )
    except ImportError:
        _LOGGER.debug("hass_datapoints: statistics_during_period not available")
        return []

    try:
        start_dt = _parse_dt(start_time_iso)
        end_dt = _parse_dt(end_time_iso)
    except ValueError:
        return []

    try:
        stats_dict = statistics_during_period(
            hass,
            start_dt,
            end_dt,
            [entity_id],
            "hour",
            {},
            {"mean"},
        )
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug(
            "hass_datapoints: statistics_during_period failed for %s: %s",
            entity_id,
            err,
        )
        return []

    entries = stats_dict.get(entity_id, [])
    pts: list = []
    for entry in entries:
        mean = entry.get("mean")
        if mean is None:
            continue
        try:
            mean_f = float(mean)
        except (TypeError, ValueError):
            continue
        if not math.isfinite(mean_f):
            continue
        start_val = entry.get("start")
        try:
            if isinstance(start_val, (int, float)):
                # HA 2023.9+ stores start as a Unix timestamp (seconds); older
                # versions may store it as milliseconds (> 1e11 threshold).
                ts_ms = int(start_val * 1000) if start_val < 1e11 else int(start_val)
            elif isinstance(start_val, datetime):
                ts_ms = int(start_val.timestamp() * 1000)
            else:
                continue
        except Exception:  # noqa: BLE001
            continue
        pts.append([ts_ms, mean_f])

    _LOGGER.debug(
        "hass_datapoints: fetch_entity_statistics_pts %s → %d pts", entity_id, len(pts)
    )
    return pts


def downsample_pts(pts: list, interval_seconds: int, aggregate: str) -> list:
    """Bucket pts into fixed-width time buckets and reduce with aggregate function.

    Returns the input unchanged when interval_seconds <= 0.
    The representative timestamp for each bucket is the timestamp of the first
    point that falls into that bucket (same behaviour as the JS worker approach).
    """
    if not pts or interval_seconds <= 0:
        return pts

    interval_ms = interval_seconds * 1000
    buckets: dict[int, list[float]] = {}
    bucket_rep_time: dict[int, int] = {}

    for time_ms, value in pts:
        idx = time_ms // interval_ms
        if idx not in buckets:
            buckets[idx] = []
            bucket_rep_time[idx] = time_ms
        buckets[idx].append(value)

    result: list = []
    for idx in sorted(buckets):
        values = buckets[idx]
        rep_time = bucket_rep_time[idx]
        if aggregate == "min":
            agg: float = min(values)
        elif aggregate == "max":
            agg = max(values)
        elif aggregate == "median":
            agg = statistics.median(values)
        elif aggregate == "first":
            agg = values[0]
        elif aggregate == "last":
            agg = values[-1]
        else:
            agg = statistics.mean(values)
        result.append([rep_time, agg])

    return result
