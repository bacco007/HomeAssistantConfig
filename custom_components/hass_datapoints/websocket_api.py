"""WebSocket API for Hass Data Points frontend cards."""

from __future__ import annotations

import logging
import time
import uuid
from datetime import UTC, datetime

import voluptuous as vol
from homeassistant.auth.permissions.const import POLICY_READ
from homeassistant.components import websocket_api
from homeassistant.components.recorder import get_instance
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.recorder import session_scope
from sqlalchemy import inspect as sqlalchemy_inspect
from sqlalchemy import text

from .anomaly_cache import AnomalyCache, make_cache_key
from .anomaly_detection import run_anomaly_detection
from .const import DOMAIN
from .history_utils import (
    downsample_pts,
    fetch_entity_pts,
    fetch_entity_statistics_pts,
    parse_interval_seconds,
)

_LOGGER = logging.getLogger(__name__)

_LIVE_EDGE_SECONDS = 3600  # ranges ending within the last hour are not cached

_VALID_INTERVALS = [
    "raw",
    "1s",
    "5s",
    "10s",
    "15s",
    "30s",
    "1m",
    "2m",
    "5m",
    "10m",
    "15m",
    "30m",
    "1h",
    "2h",
    "3h",
    "4h",
    "6h",
    "12h",
    "24h",
]
_VALID_AGGREGATES = ["mean", "min", "max", "median", "first", "last"]
_VALID_ANOMALY_METHODS = [
    "trend_residual",
    "rate_of_change",
    "iqr",
    "rolling_zscore",
    "persistence",
    "comparison_window",
]
_VALID_ANOMALY_SENSITIVITY = ["low", "medium", "high"]
_VALID_ANOMALY_OVERLAP_MODES = ["all", "highlight", "only"]
_VALID_TREND_METHODS = [
    "rolling_average",
    "linear_trend",
    "ema",
    "polynomial_trend",
    "lowess",
]

# Field-length caps for free-text event fields stored in .storage/
_MAX_LEN_MESSAGE = 10_000
_MAX_LEN_ICON = 255
_MAX_LEN_COLOR = 20
_MAX_LEN_WINDOW = 20  # interval strings like "24h", "30m"

# Validator for MDI icon names (e.g. "mdi:bookmark", "mdi:home-outline")
_RE_MDI_ICON = r"^mdi:[a-z0-9][a-z0-9\-]*$"
# Validator for CSS hex colors (#rgb, #rrggbb, #rrggbbaa)
_RE_HEX_COLOR = r"^#[0-9a-fA-F]{3,8}$"
# Validator for duration strings accepted by parse_interval_seconds ("1h", "30m", "24h", …)
_RE_DURATION = r"^\d+[smhd]$"

# Maximum date-range span accepted by ws_get_history.  Requests beyond this
# limit return an empty pts list so the frontend gracefully falls back to the
# long-term statistics it already fetched via HA's native API.  Prevents OOM
# when a very high-frequency entity is queried over a multi-month window.
_MAX_HISTORY_RANGE_DAYS = 90

# Maximum number of data points fed into anomaly detection.  The algorithms
# are O(n) to O(n log n) but still take several seconds for very large inputs;
# capping prevents executor-thread-pool exhaustion when the user repeatedly
# changes date ranges without waiting for prior requests to complete.
_ANOMALY_MAX_PTS = 50_000


@callback
def async_register_commands(hass: HomeAssistant) -> None:
    """Register websocket commands."""
    websocket_api.async_register_command(hass, ws_get_events)
    websocket_api.async_register_command(hass, ws_get_event_bounds)
    websocket_api.async_register_command(hass, ws_update_event)
    websocket_api.async_register_command(hass, ws_delete_event)
    websocket_api.async_register_command(hass, ws_delete_dev_events)
    websocket_api.async_register_command(hass, ws_get_history)
    websocket_api.async_register_command(hass, ws_get_anomalies)
    websocket_api.async_register_command(hass, ws_clear_cache)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events",
        vol.Optional("start_time"): str,
        vol.Optional("end_time"): str,
        # entity_ids: list of entity IDs to filter by (global events always included)
        vol.Optional("entity_ids"): [str],
    }
)
@websocket_api.async_response
async def ws_get_events(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return recorded events, with optional time/entity filters."""
    store = hass.data[DOMAIN]["store"]
    entity_ids = msg.get("entity_ids")
    # For non-admin users, remove any entity IDs they are not permitted to read
    # so the store never returns events tagged with inaccessible entities.
    if entity_ids is not None and not connection.user.is_admin:
        entity_ids = [
            eid for eid in entity_ids if _can_read_entity(connection.user, eid)
        ]
    events = store.get_events(
        start=msg.get("start_time"),
        end=msg.get("end_time"),
        entity_ids=entity_ids,
    )
    connection.send_result(msg["id"], {"events": events})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events_bounds",
    }
)
@websocket_api.async_response
async def ws_get_event_bounds(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return the earliest and latest recorded event timestamps."""
    try:
        store = hass.data[DOMAIN]["store"]
        start_time, end_time, source = await hass.async_add_executor_job(
            _get_global_history_bounds, hass
        )
        if start_time is None and end_time is None:
            start_time, end_time = store.get_event_bounds()
            source = "datapoints_store_fallback"
        connection.send_result(
            msg["id"],
            {"start_time": start_time, "end_time": end_time, "source": source},
        )
    except Exception as err:  # noqa: BLE001
        _LOGGER.error("hass_datapoints/events_bounds failed: %s", err)
        connection.send_error(msg["id"], "bounds_error", "Failed to fetch event bounds")


def _get_global_history_bounds(
    hass: HomeAssistant,
) -> tuple[str | None, str | None, str]:
    """Return earliest/latest recorder timestamps for Home Assistant globally."""
    recorder = get_instance(hass)
    get_session = getattr(recorder, "get_session", None)
    if get_session is None:
        return None, None, "recorder_session_unavailable"

    query_variants = [
        # HA recorder has long exposed recorder_runs as the broadest source of
        # database coverage. Newer schemas use explicit start/end columns.
        ("recorder_runs:start_end", "recorder_runs", "start", "end"),
        # Older recorder schemas used created/closed style columns instead of
        # start/end, so keep this fallback for older Core installs and upgrades.
        (
            "recorder_runs:created_closed",
            "recorder_runs",
            "created",
            "closed_incorrect",
        ),
        # Modern recorder tables expose UNIX-second timestamp mirrors for fast
        # numeric filtering; these appeared after the older datetime columns.
        ("states:last_updated_ts", "states", "last_updated_ts", "last_updated_ts"),
        # Older and mid-era HA recorder schemas only had datetime columns on
        # states, so we still probe them for long-lived upgraded databases.
        ("states:last_updated", "states", "last_updated", "last_updated"),
        # Events gained *_ts numeric mirrors in newer HA recorder versions, so
        # prefer them when available for consistent timestamp normalization.
        ("events:time_fired_ts", "events", "time_fired_ts", "time_fired_ts"),
        # Older event tables only expose datetime values, especially on
        # databases that have been upgraded across many HA releases.
        ("events:time_fired", "events", "time_fired", "time_fired"),
        # Long-term statistics in newer HA versions expose start_ts as a numeric
        # mirror of start, which is the most robust source when present.
        ("statistics:start_ts", "statistics", "start_ts", "start_ts"),
        # Older statistics schemas only expose the datetime start column.
        ("statistics:start", "statistics", "start", "start"),
        # statistics_short_term followed the same migration path as statistics:
        # newer HA builds provide numeric *_ts columns for recorder access.
        (
            "statistics_short_term:start_ts",
            "statistics_short_term",
            "start_ts",
            "start_ts",
        ),
        # Older short-term statistics tables only expose datetime start.
        ("statistics_short_term:start", "statistics_short_term", "start", "start"),
    ]

    start_candidates: list[tuple[datetime, str]] = []
    end_candidates: list[tuple[datetime, str]] = []

    def _quote(identifier: str) -> str:
        return '"' + identifier.replace('"', '""') + '"'

    try:
        with session_scope(session=get_session()) as session:
            bind = session.get_bind()
            if bind is None:
                return None, None, "recorder_bind_unavailable"

            inspector = sqlalchemy_inspect(bind)
            available_tables = set(inspector.get_table_names())
            column_cache: dict[str, set[str]] = {}

            def _get_columns(table_name: str) -> set[str]:
                if table_name not in column_cache:
                    try:
                        column_cache[table_name] = {
                            column["name"]
                            for column in inspector.get_columns(table_name)
                        }
                    except Exception:
                        column_cache[table_name] = set()
                return column_cache[table_name]

            for label, table_name, start_column, end_column in query_variants:
                if table_name not in available_tables:
                    continue
                columns = _get_columns(table_name)
                if start_column not in columns:
                    continue
                end_expr = (
                    f"MAX({_quote(end_column)})" if end_column in columns else "NULL"
                )
                query = text(
                    f"SELECT MIN({_quote(start_column)}) AS start_ts, "
                    f"{end_expr} AS end_ts FROM {_quote(table_name)}"
                )
                try:
                    row = session.execute(query).one_or_none()
                except Exception:
                    continue
                if not row:
                    continue
                start_time = _normalize_recorder_timestamp(row[0])
                end_time = _normalize_recorder_timestamp(row[1])
                if start_time:
                    start_candidates.append((datetime.fromisoformat(start_time), label))
                if end_time:
                    end_candidates.append((datetime.fromisoformat(end_time), label))
    except Exception as err:
        return None, None, f"recorder_query_error:{type(err).__name__}"

    if not start_candidates:
        return None, None, "no_recorder_start_found"

    min_start, start_source = min(start_candidates, key=lambda item: item[0])
    if end_candidates:
        max_end, end_source = max(end_candidates, key=lambda item: item[0])
        max_end_iso = max_end.isoformat()
    else:
        max_end_iso = None
        end_source = "missing"
    return min_start.isoformat(), max_end_iso, f"start:{start_source};end:{end_source}"


def _normalize_recorder_timestamp(value: object) -> str | None:
    """Normalize recorder query results to ISO timestamps."""
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value), tz=UTC).isoformat()

    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.isoformat()

    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.isoformat()

    return None


def _require_admin(connection: websocket_api.ActiveConnection, msg: dict) -> bool:
    """Return True if the connection user is an admin, else send error and return False."""
    if not connection.user.is_admin:
        raise Unauthorized
    return True


def _can_read_entity(user, entity_id: str) -> bool:
    """Return True if *user* has read permission for *entity_id*.

    Admin users always pass.  Non-admin users are checked against the HA
    permission policy attached to their account.  Any unexpected error
    (e.g. missing permissions object on a system user) is treated as
    permissive so we don't accidentally block valid callers.
    """
    if user.is_admin:
        return True
    try:
        return bool(user.permissions.check_entity(entity_id, POLICY_READ))
    except Exception:  # noqa: BLE001
        return True


def _valid_uuid(value: str) -> str:
    """Voluptuous validator — raises Invalid if value is not a well-formed UUID."""
    try:
        uuid.UUID(value)
    except ValueError as exc:
        raise vol.Invalid("Must be a valid UUID") from exc
    return value


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events/update",
        vol.Required("event_id"): vol.All(str, _valid_uuid),
        vol.Optional("message"): vol.All(str, vol.Length(max=_MAX_LEN_MESSAGE)),
        vol.Optional("annotation"): vol.All(str, vol.Length(max=_MAX_LEN_MESSAGE)),
        vol.Optional("entity_ids"): [str],
        vol.Optional("device_ids"): [str],
        vol.Optional("area_ids"): [str],
        vol.Optional("label_ids"): [str],
        vol.Optional("icon"): vol.All(
            str, vol.Length(max=_MAX_LEN_ICON), vol.Match(_RE_MDI_ICON)
        ),
        vol.Optional("color"): vol.All(
            str, vol.Length(max=_MAX_LEN_COLOR), vol.Match(_RE_HEX_COLOR)
        ),
    }
)
@websocket_api.async_response
async def ws_update_event(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Update a recorded event by ID."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN]["store"]
    updated = await store.async_update_event(
        event_id=msg["event_id"],
        message=msg.get("message"),
        annotation=msg.get("annotation"),
        entity_ids=msg.get("entity_ids"),
        device_ids=msg.get("device_ids"),
        area_ids=msg.get("area_ids"),
        label_ids=msg.get("label_ids"),
        icon=msg.get("icon"),
        color=msg.get("color"),
    )
    if updated is not None:
        connection.send_result(msg["id"], {"updated": True, "event": updated})
    else:
        connection.send_error(msg["id"], "not_found", "Event not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events/delete",
        vol.Required("event_id"): vol.All(str, _valid_uuid),
    }
)
@websocket_api.async_response
async def ws_delete_event(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Delete a recorded event by ID."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN]["store"]
    deleted = await store.async_delete_event(msg["event_id"])
    connection.send_result(msg["id"], {"deleted": deleted})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events/delete_dev",
    }
)
@websocket_api.async_response
async def ws_delete_dev_events(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Delete all dev-flagged events."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN]["store"]
    deleted = await store.async_delete_dev_events()
    connection.send_result(msg["id"], {"deleted": deleted})


# ---------------------------------------------------------------------------
# New: hass_datapoints/history — downsampled history
# ---------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/history",
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("start_time"): str,
        vol.Required("end_time"): str,
        vol.Required("interval"): vol.In(_VALID_INTERVALS),
        vol.Required("aggregate"): vol.In(_VALID_AGGREGATES),
    }
)
@websocket_api.async_response
async def ws_get_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return (optionally downsampled) entity history as [[timeMs, value], ...]."""
    entity_id: str = msg["entity_id"]
    if not _can_read_entity(connection.user, entity_id):
        connection.send_error(
            msg["id"], "unauthorized", "Access to this entity is not permitted"
        )
        return
    start_time: str = msg["start_time"]
    end_time: str = msg["end_time"]
    interval: str = msg["interval"]
    aggregate: str = msg["aggregate"]

    try:
        # Guard against excessively large date ranges that would load millions of
        # raw recorder states and exhaust available memory.  For spans beyond the
        # limit we return an empty list; the frontend already has HA's long-term
        # statistics for the older portion of the range and will display those.
        try:
            start_dt = datetime.fromisoformat(start_time)
            end_dt = datetime.fromisoformat(end_time)
            range_days = (end_dt - start_dt).total_seconds() / 86400
        except ValueError:
            range_days = 0

        raw_pts: list = []
        used_statistics_fallback = False

        if range_days > _MAX_HISTORY_RANGE_DAYS:
            _LOGGER.info(
                "hass_datapoints/history: using statistics fallback for %s — "
                "range %.1f days exceeds %d-day raw-history limit",
                entity_id,
                range_days,
                _MAX_HISTORY_RANGE_DAYS,
            )
            used_statistics_fallback = True
            raw_pts = await get_instance(hass).async_add_executor_job(
                fetch_entity_statistics_pts, hass, entity_id, start_time, end_time
            )
        else:
            raw_pts = await get_instance(hass).async_add_executor_job(
                fetch_entity_pts, hass, entity_id, start_time, end_time
            )
            if not raw_pts and interval != "raw":
                _LOGGER.info(
                    "hass_datapoints/history: using statistics fallback for %s — "
                    "no raw recorder states were available",
                    entity_id,
                )
                used_statistics_fallback = True
                raw_pts = await get_instance(hass).async_add_executor_job(
                    fetch_entity_statistics_pts, hass, entity_id, start_time, end_time
                )

        if interval == "raw":
            pts = raw_pts
        else:
            interval_secs = parse_interval_seconds(interval)
            pts = downsample_pts(raw_pts, interval_secs, aggregate)

        if used_statistics_fallback:
            _LOGGER.debug(
                "hass_datapoints/history: statistics fallback produced %d sampled pts for %s",
                len(pts),
                entity_id,
            )

        connection.send_result(msg["id"], {"entity_id": entity_id, "pts": pts})

    except Exception as err:  # noqa: BLE001
        _LOGGER.error("hass_datapoints/history failed for %s: %s", entity_id, err)
        connection.send_error(msg["id"], "fetch_error", "Failed to fetch history data")


# ---------------------------------------------------------------------------
# New: hass_datapoints/anomalies — backend anomaly detection
# ---------------------------------------------------------------------------


def _run_detection(pts: list, config: dict, comparison_pts: list | None = None) -> list:
    """Blocking helper: run anomaly detection on pre-fetched pts."""
    clusters = run_anomaly_detection(pts, config, comparison_pts)
    _LOGGER.info(
        "hass_datapoints: anomaly detection → %d clusters from %d pts (methods=%s)",
        len(clusters),
        len(pts),
        config.get("anomaly_methods"),
    )
    return clusters


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/anomalies",
        vol.Required("entity_id"): cv.entity_id,
        vol.Required("start_time"): str,
        vol.Required("end_time"): str,
        vol.Required("anomaly_methods"): vol.All(
            [vol.In(_VALID_ANOMALY_METHODS)], vol.Length(min=1)
        ),
        vol.Optional("anomaly_sensitivity", default="medium"): vol.In(
            _VALID_ANOMALY_SENSITIVITY
        ),
        vol.Optional("anomaly_overlap_mode", default="all"): vol.In(
            _VALID_ANOMALY_OVERLAP_MODES
        ),
        vol.Optional("anomaly_rate_window", default="1h"): vol.All(
            str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
        ),
        vol.Optional("anomaly_zscore_window", default="24h"): vol.All(
            str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
        ),
        vol.Optional("anomaly_persistence_window", default="1h"): vol.All(
            str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
        ),
        vol.Optional("trend_method", default="rolling_average"): vol.In(
            _VALID_TREND_METHODS
        ),
        vol.Optional("trend_window", default="24h"): vol.All(
            str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
        ),
        vol.Optional("sample_interval"): vol.In(_VALID_INTERVALS),
        vol.Optional("sample_aggregate", default="mean"): vol.In(_VALID_AGGREGATES),
        vol.Optional("comparison_entity_id"): cv.entity_id,
        vol.Optional("comparison_start_time"): str,
        vol.Optional("comparison_end_time"): str,
        vol.Optional("comparison_time_offset_ms", default=0): vol.All(
            int, vol.Range(min=-315_576_000_000, max=315_576_000_000)
        ),
    }
)
@websocket_api.async_response
async def ws_get_anomalies(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Run backend anomaly detection for a single entity and return clusters."""
    entity_id: str = msg["entity_id"]
    if not _can_read_entity(connection.user, entity_id):
        connection.send_error(
            msg["id"], "unauthorized", "Access to this entity is not permitted"
        )
        return
    comparison_entity_id: str | None = msg.get("comparison_entity_id")
    if comparison_entity_id and not _can_read_entity(
        connection.user, comparison_entity_id
    ):
        connection.send_error(
            msg["id"],
            "unauthorized",
            "Access to the comparison entity is not permitted",
        )
        return
    start_time: str = msg["start_time"]
    end_time: str = msg["end_time"]

    try:
        config = {
            "anomaly_methods": msg["anomaly_methods"],
            "anomaly_sensitivity": msg["anomaly_sensitivity"],
            "anomaly_overlap_mode": msg["anomaly_overlap_mode"],
            "anomaly_rate_window": msg["anomaly_rate_window"],
            "anomaly_zscore_window": msg["anomaly_zscore_window"],
            "anomaly_persistence_window": msg["anomaly_persistence_window"],
            "trend_method": msg["trend_method"],
            "trend_window": msg["trend_window"],
            "sample_interval": msg.get("sample_interval"),
            "sample_aggregate": msg.get("sample_aggregate", "mean"),
            "comparison_entity_id": msg.get("comparison_entity_id"),
            "comparison_start_time": msg.get("comparison_start_time"),
            "comparison_end_time": msg.get("comparison_end_time"),
            "comparison_time_offset_ms": msg.get("comparison_time_offset_ms", 0),
        }

        # Determine if this is a live (open) range — skip cache for live data.
        try:
            end_ts = datetime.fromisoformat(end_time).timestamp()
        except ValueError:
            end_ts = 0.0
        is_live = (time.time() - end_ts) < _LIVE_EDGE_SECONDS

        cache: AnomalyCache | None = hass.data.get(DOMAIN, {}).get("anomaly_cache")
        cache_key = (
            make_cache_key(entity_id, start_time, end_time, config) if cache else None
        )

        if cache and cache_key and not is_live:
            cached = await hass.async_add_executor_job(cache.get, cache_key)
            if cached is not None:
                connection.send_result(
                    msg["id"],
                    {
                        "entity_id": entity_id,
                        "anomaly_clusters": cached,
                        "cached": True,
                    },
                )
                return

        recorder = get_instance(hass)
        pts: list = await recorder.async_add_executor_job(
            fetch_entity_pts, hass, entity_id, start_time, end_time
        )

        # Merge long-term statistics for the portion of the range that predates
        # the recorder window (HA default: ~10 days).  This mirrors the frontend
        # merge in card-history.js so anomaly detection sees the full date range,
        # not just the recent recorder data.
        stats_pts: list = await recorder.async_add_executor_job(
            fetch_entity_statistics_pts, hass, entity_id, start_time, end_time
        )
        if stats_pts:
            if pts:
                first_recorder_ms = pts[0][0]
                stats_pts = [p for p in stats_pts if p[0] < first_recorder_ms]
            if stats_pts:
                pts = sorted(stats_pts + pts, key=lambda p: p[0])

        sample_interval: str | None = msg.get("sample_interval")
        if sample_interval and sample_interval != "raw":
            sample_aggregate: str = msg.get("sample_aggregate", "mean")
            interval_secs = parse_interval_seconds(sample_interval)
            pts = downsample_pts(pts, interval_secs, sample_aggregate)

        if len(pts) < 3:
            _LOGGER.info(
                "hass_datapoints: anomaly detection skipped for %s — only %d pts",
                entity_id,
                len(pts),
            )
            connection.send_result(
                msg["id"],
                {"entity_id": entity_id, "anomaly_clusters": [], "cached": False},
            )
            return

        # Guard against very large point counts that would cause the detection
        # worker to occupy an executor thread for an excessive amount of time,
        # potentially exhausting the thread pool and making HA unresponsive.
        # We keep the most-recent points because they are most relevant to
        # anomaly detection; users with long ranges should enable sample_interval.
        if len(pts) > _ANOMALY_MAX_PTS:
            _LOGGER.warning(
                "hass_datapoints: capping %d pts to %d before anomaly detection for %s "
                "— consider enabling sample_interval for large date ranges",
                len(pts),
                _ANOMALY_MAX_PTS,
                entity_id,
            )
            pts = pts[-_ANOMALY_MAX_PTS:]

        comparison_pts: list | None = None
        comparison_entity_id = config.get("comparison_entity_id")
        comparison_start_time = config.get("comparison_start_time")
        comparison_end_time = config.get("comparison_end_time")
        if comparison_entity_id and comparison_start_time and comparison_end_time:
            comparison_pts = await recorder.async_add_executor_job(
                fetch_entity_pts,
                hass,
                comparison_entity_id,
                comparison_start_time,
                comparison_end_time,
            )

        clusters: list = await hass.async_add_executor_job(
            _run_detection, pts, config, comparison_pts
        )

        if cache and cache_key and not is_live and clusters:
            await hass.async_add_executor_job(
                cache.set, cache_key, entity_id, end_ts, clusters
            )

        connection.send_result(
            msg["id"],
            {"entity_id": entity_id, "anomaly_clusters": clusters, "cached": False},
        )

    except Exception as err:  # noqa: BLE001
        _LOGGER.error("hass_datapoints/anomalies failed for %s: %s", entity_id, err)
        connection.send_error(
            msg["id"], "detection_error", "Failed to run anomaly detection"
        )


# ---------------------------------------------------------------------------
# New: hass_datapoints/cache/clear — cache management
# ---------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/cache/clear",
        vol.Optional("entity_id"): cv.entity_id,
    }
)
@websocket_api.async_response
async def ws_clear_cache(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Clear anomaly cache entries (all, or for a specific entity)."""
    _require_admin(connection, msg)
    cache: AnomalyCache | None = hass.data.get(DOMAIN, {}).get("anomaly_cache")
    if cache is None:
        connection.send_result(msg["id"], {"cleared": 0})
        return

    entity_id: str | None = msg.get("entity_id")
    if entity_id:
        cleared = await hass.async_add_executor_job(cache.clear_entity, entity_id)
    else:
        cleared = await hass.async_add_executor_job(cache.clear_all)

    connection.send_result(msg["id"], {"cleared": cleared})
