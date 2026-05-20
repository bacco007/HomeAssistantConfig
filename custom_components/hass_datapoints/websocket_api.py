"""WebSocket API for Hass Data Points frontend cards."""

from __future__ import annotations

import asyncio
import logging
import threading
import time
import uuid
from datetime import UTC, datetime, timedelta

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
from .const import (
    ANOMALY_LIVE_EDGE_SECONDS,
    ANOMALY_MAX_PTS,
    DOMAIN,
    KEY_ADD_BINARY_SENSOR_ENTITIES,
    KEY_ADD_SENSOR_ENTITIES,
    KEY_ADD_SWITCH_ENTITIES,
    KEY_MONITOR_BINARY_SENSORS,
    KEY_MONITOR_SENSORS,
    KEY_MONITOR_SWITCHES,
    KEY_STORE,
    MONITOR_DEFAULT_LOOK_BACK_HOURS,
    MONITOR_DEFAULT_SCAN_INTERVAL_MINUTES,
)
from .history_utils import (
    downsample_pts,
    fetch_entity_pts,
    fetch_entity_statistics_pts,
    parse_interval_seconds,
)

_LOGGER = logging.getLogger(__name__)


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
_VALID_RATE_WINDOWS = [
    "point_to_point",
    "30m",
    "1h",
    "2h",
    "3h",
    "6h",
    "24h",
    "7d",
    "14d",
    "21d",
    "28d",
]
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
# For ranges > 7 days with hourly+ interval, switch to statistics (300× fewer rows)
_AUTO_STATS_THRESHOLD_DAYS = 7


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/cancel",
        vol.Required("request_id"): str,
    }
)
@callback
def ws_cancel_request(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Cancel an in-flight async request by request_id."""
    in_flight: dict = hass.data.get(DOMAIN, {}).get("in_flight", {})
    event: threading.Event | None = in_flight.get(msg["request_id"])
    if event:
        event.set()
    connection.send_result(msg["id"], {"cancelled": event is not None})


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
    websocket_api.async_register_command(hass, ws_cancel_request)
    websocket_api.async_register_command(hass, ws_monitors_list)
    websocket_api.async_register_command(hass, ws_monitors_create)
    websocket_api.async_register_command(hass, ws_monitors_update)
    websocket_api.async_register_command(hass, ws_monitors_delete)
    websocket_api.async_register_command(hass, ws_monitors_anomalies)
    websocket_api.async_register_command(hass, ws_monitors_dismiss)
    websocket_api.async_register_command(hass, ws_monitors_undismiss)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/events",
        vol.Optional("start_time"): str,
        vol.Optional("end_time"): str,
        # entity_ids: list of entity IDs to filter by (global events always included)
        vol.Optional("entity_ids"): [str],
        vol.Optional("limit", default=200): vol.All(int, vol.Range(min=1, max=5000)),
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
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
    limit: int = msg.get("limit", 200)
    offset: int = msg.get("offset", 0)
    events = store.get_events(
        start=msg.get("start_time"),
        end=msg.get("end_time"),
        entity_ids=entity_ids,
        limit=limit,
        offset=offset,
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
        recorder = get_instance(hass)
        start_time, end_time, source = await recorder.async_add_executor_job(
            _get_global_history_bounds, recorder
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
    recorder,
) -> tuple[str | None, str | None, str]:
    """Return earliest/latest recorder timestamps for Home Assistant globally."""
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

    def _quote(identifier: str) -> str:
        return '"' + identifier.replace('"', '""') + '"'

    def _run_bounds_query() -> tuple[str | None, str | None, str]:
        start_candidates: list[tuple[datetime, str]] = []
        end_candidates: list[tuple[datetime, str]] = []

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
                        f"MAX({_quote(end_column)})"
                        if end_column in columns
                        else "NULL"
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
                        start_candidates.append(
                            (datetime.fromisoformat(start_time), label)
                        )
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
        return (
            min_start.isoformat(),
            max_end_iso,
            f"start:{start_source};end:{end_source}",
        )

    return _run_bounds_query()


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


def _get_monitor_device(hass: HomeAssistant, monitor_id: str):
    """Return the HA device registry entry for a monitor, or None."""
    from homeassistant.helpers import device_registry as dr  # noqa: PLC0415

    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return None
    entry_id = entries[0].entry_id
    device_reg = dr.async_get(hass)
    return device_reg.async_get_device(
        identifiers={(DOMAIN, f"{entry_id}_monitor_{monitor_id}")}
    )


def _valid_overlap_mode(value: str) -> str:
    """Voluptuous validator for overlap_mode.

    Accepts "all", "any", legacy "any_two_plus", and "any_N" where N >= 2.
    """
    if value in ("all", "any", "any_two_plus"):
        return value
    if value.startswith("any_") and value[4:].isdigit() and int(value[4:]) >= 2:
        return value
    raise vol.Invalid(f"Invalid overlap_mode: {value!r}")


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
        vol.Optional("request_id"): str,
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

        interval_secs = parse_interval_seconds(interval) if interval != "raw" else 0
        use_stats_early = (
            interval != "raw"
            and interval_secs >= 3600
            and range_days > _AUTO_STATS_THRESHOLD_DAYS
        )

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
        elif use_stats_early:
            _LOGGER.info(
                "hass_datapoints/history: switching to statistics for %s — "
                "range %.1f days with %s interval",
                entity_id,
                range_days,
                interval,
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


def _run_detection(
    pts: list,
    config: dict,
    comparison_pts: list | None = None,
    cancel: threading.Event | None = None,
) -> list:
    """Blocking helper: run anomaly detection on pre-fetched pts."""
    clusters = run_anomaly_detection(pts, config, comparison_pts, cancel=cancel)
    _LOGGER.info(
        "hass_datapoints: anomaly detection → %d clusters from %d pts (methods=%s)",
        len(clusters),
        len(pts),
        config.get("anomaly_methods"),
    )
    return clusters


def _register_cancel(hass: HomeAssistant, request_id: str | None) -> threading.Event:
    """Create a cancel Event, register it under request_id if provided, and return it."""
    event = threading.Event()
    if request_id:
        hass.data[DOMAIN].setdefault("in_flight", {})[request_id] = event
    return event


def _unregister_cancel(hass: HomeAssistant, request_id: str | None) -> None:
    """Remove a cancel Event from the in-flight registry."""
    if request_id:
        hass.data[DOMAIN].get("in_flight", {}).pop(request_id, None)


async def _run_detection_with_timeout(
    hass: HomeAssistant,
    pool,
    pts: list,
    config: dict,
    comparison_pts: list | None = None,
    cancel: threading.Event | None = None,
    timeout: float = 30.0,
) -> list:
    """Run anomaly detection in the dedicated pool with a hard timeout.

    If the timeout fires the cancel event is set so the thread can exit
    cooperatively, then an empty list is returned.
    """
    cancel = cancel or threading.Event()
    try:
        return await asyncio.wait_for(
            hass.loop.run_in_executor(
                pool, _run_detection, pts, config, comparison_pts, cancel
            ),
            timeout=timeout,
        )
    except TimeoutError:
        cancel.set()
        _LOGGER.warning(
            "hass_datapoints: detection timed out after %.0fs for %d pts",
            timeout,
            len(pts),
        )
        return []


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
        vol.Optional("anomaly_rate_window", default="1h"): vol.In(_VALID_RATE_WINDOWS),
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
        vol.Optional("request_id"): str,
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
        is_live = (time.time() - end_ts) < ANOMALY_LIVE_EDGE_SECONDS

        cache: AnomalyCache | None = hass.data.get(DOMAIN, {}).get("anomaly_cache")
        cache_key = (
            make_cache_key(entity_id, start_time, end_time, config) if cache else None
        )

        pool = hass.data[DOMAIN].get("executor")
        request_id: str | None = msg.get("request_id")
        cancel_event = _register_cancel(hass, request_id)

        if cache and cache_key and not is_live:
            cached = await hass.loop.run_in_executor(pool, cache.get, cache_key)
            if cached is not None:
                _unregister_cancel(hass, request_id)
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
        if len(pts) > ANOMALY_MAX_PTS:
            _LOGGER.warning(
                "hass_datapoints: capping %d pts to %d before anomaly detection for %s "
                "— consider enabling sample_interval for large date ranges",
                len(pts),
                ANOMALY_MAX_PTS,
                entity_id,
            )
            pts = pts[-ANOMALY_MAX_PTS:]

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

        clusters: list = await _run_detection_with_timeout(
            hass, pool, pts, config, comparison_pts, cancel_event
        )

        if cache and cache_key and not is_live and clusters:
            await hass.loop.run_in_executor(
                pool, cache.set, cache_key, entity_id, end_ts, clusters
            )

        _unregister_cancel(hass, request_id)
        connection.send_result(
            msg["id"],
            {"entity_id": entity_id, "anomaly_clusters": clusters, "cached": False},
        )

    except Exception as err:  # noqa: BLE001
        _unregister_cancel(hass, request_id)
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

    pool = hass.data[DOMAIN].get("executor")
    entity_id: str | None = msg.get("entity_id")
    if entity_id:
        cleared = await hass.loop.run_in_executor(pool, cache.clear_entity, entity_id)
    else:
        cleared = await hass.loop.run_in_executor(pool, cache.clear_all)

    connection.send_result(msg["id"], {"cleared": cleared})


# ---------------------------------------------------------------------------
# Anomaly Monitors — CRUD
# ---------------------------------------------------------------------------

# Shared analysis schema fields for monitor create/update
_MONITOR_ANALYSIS_FIELDS = {
    vol.Optional("anomaly_methods"): vol.All(
        [vol.In(_VALID_ANOMALY_METHODS)], vol.Length(min=1)
    ),
    vol.Optional("anomaly_sensitivity"): vol.In(_VALID_ANOMALY_SENSITIVITY),
    vol.Optional("anomaly_overlap_mode"): vol.In(["all", "highlight", "only"]),
    vol.Optional("anomaly_rate_window"): vol.In(_VALID_RATE_WINDOWS),
    vol.Optional("anomaly_zscore_window"): vol.All(
        str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
    ),
    vol.Optional("anomaly_persistence_window"): vol.All(
        str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
    ),
    vol.Optional("anomaly_trend_method"): vol.In(_VALID_TREND_METHODS),
    vol.Optional("anomaly_trend_window"): vol.All(
        str, vol.Length(max=_MAX_LEN_WINDOW), vol.Match(_RE_DURATION)
    ),
    vol.Optional("sample_interval"): vol.In(_VALID_INTERVALS),
    vol.Optional("sample_aggregate"): vol.In(_VALID_AGGREGATES),
    vol.Optional("anomaly_use_sampled_data"): bool,
    vol.Optional("baseline_entity_id"): vol.Any(None, cv.entity_id),
    vol.Optional("baseline_time_offset_hours"): vol.All(
        int, vol.Range(min=0, max=8760)
    ),
}


def _register_monitor_entities(hass: HomeAssistant, monitor_id: str) -> bool:
    """Best-effort dynamic entity registration for a single monitor.

    Returns True when all three entity platform callbacks are available and
    monitor entities were added (or were already tracked in the in-memory
    maps). Returns False when platform callbacks are not ready yet, allowing
    the caller to keep the monitor record and rely on a later platform setup
    or reload to materialize the entities.
    """
    domain_data = hass.data.get(DOMAIN, {})
    add_sensor_entities = domain_data.get(KEY_ADD_SENSOR_ENTITIES)
    add_binary_entities = domain_data.get(KEY_ADD_BINARY_SENSOR_ENTITIES)
    add_switch_entities = domain_data.get(KEY_ADD_SWITCH_ENTITIES)
    if (
        add_sensor_entities is None
        or add_binary_entities is None
        or add_switch_entities is None
    ):
        _LOGGER.warning(
            "hass_datapoints: monitor %s was created before dynamic entity "
            "callbacks were ready; entities will appear after the next "
            "platform setup or integration reload",
            monitor_id,
        )
        return False

    entries = list(hass.config_entries.async_entries(DOMAIN))
    if not entries:
        _LOGGER.warning(
            "hass_datapoints: monitor %s was created without an active config "
            "entry; skipping dynamic entity registration",
            monitor_id,
        )
        return False

    from .binary_sensor import (  # noqa: PLC0415
        DatapointsMonitorProblemBinarySensor,
        DatapointsMonitorStalledBinarySensor,
    )
    from .sensor import (  # noqa: PLC0415
        DatapointsMonitorAnomalyDurationSensor,
        DatapointsMonitorConsecutiveScansSensor,
        DatapointsMonitorDataPointsSensor,
        DatapointsMonitorLastAnomalySensor,
        DatapointsMonitorLastScanSensor,
        DatapointsMonitorSensor,
    )
    from .switch import DatapointsMonitorEnabledSwitch  # noqa: PLC0415

    entry = entries[0]
    store = domain_data[KEY_STORE]
    monitor_sensors = domain_data.setdefault(KEY_MONITOR_SENSORS, {})
    monitor_binary_sensors = domain_data.setdefault(KEY_MONITOR_BINARY_SENSORS, {})
    monitor_switches = domain_data.setdefault(KEY_MONITOR_SWITCHES, {})

    if monitor_id not in monitor_sensors:
        sensor = DatapointsMonitorSensor(entry, store, hass, monitor_id)
        monitor_sensors[monitor_id] = sensor
        add_sensor_entities(
            [
                sensor,
                DatapointsMonitorConsecutiveScansSensor(entry, store, monitor_id),
                DatapointsMonitorLastScanSensor(entry, store, monitor_id),
                DatapointsMonitorLastAnomalySensor(entry, store, monitor_id),
                DatapointsMonitorAnomalyDurationSensor(entry, store, hass, monitor_id),
                DatapointsMonitorDataPointsSensor(entry, store, monitor_id),
            ]
        )

    if monitor_id not in monitor_binary_sensors:
        stalled = DatapointsMonitorStalledBinarySensor(entry, store, hass, monitor_id)
        problem = DatapointsMonitorProblemBinarySensor(entry, store, hass, monitor_id)
        monitor_binary_sensors[monitor_id] = (stalled, problem)
        add_binary_entities([stalled, problem])

    if monitor_id not in monitor_switches:
        switch = DatapointsMonitorEnabledSwitch(entry, store, hass, monitor_id)
        monitor_switches[monitor_id] = switch
        add_switch_entities([switch])

    return True


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/list",
    }
)
@websocket_api.async_response
async def ws_monitors_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return all anomaly monitor records, each annotated with its HA device_id."""
    from homeassistant.helpers import device_registry as dr  # noqa: PLC0415

    _require_admin(connection, msg)
    store = hass.data[DOMAIN][KEY_STORE]

    device_reg = dr.async_get(hass)
    entries = hass.config_entries.async_entries(DOMAIN)
    entry_id = entries[0].entry_id if entries else None

    monitors = []
    for monitor in store.get_monitors():
        m = dict(monitor)
        if entry_id:
            device = device_reg.async_get_device(
                identifiers={(DOMAIN, f"{entry_id}_monitor_{monitor['id']}")}
            )
            m["device_id"] = device.id if device else None
        else:
            m["device_id"] = None
        monitors.append(m)

    connection.send_result(msg["id"], {"monitors": monitors})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/create",
        vol.Required("monitor_type"): vol.In(["individual", "combined"]),
        vol.Optional("entity_id"): cv.entity_id,
        vol.Optional("entity_ids"): [cv.entity_id],
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Optional(
            "look_back_hours", default=MONITOR_DEFAULT_LOOK_BACK_HOURS
        ): vol.All(int, vol.Range(min=1, max=168)),
        vol.Optional(
            "scan_interval_minutes", default=MONITOR_DEFAULT_SCAN_INTERVAL_MINUTES
        ): vol.All(int, vol.Range(min=5, max=1440)),
        vol.Optional("overlap_mode", default="all"): _valid_overlap_mode,
        vol.Optional("enabled", default=True): bool,
        **_MONITOR_ANALYSIS_FIELDS,
    }
)
@websocket_api.async_response
async def ws_monitors_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Create a new anomaly monitor and register its sensor entity."""
    _require_admin(connection, msg)

    baseline_entity_id = msg.get("baseline_entity_id")
    if baseline_entity_id and not _can_read_entity(connection.user, baseline_entity_id):
        connection.send_error(
            msg["id"], "unauthorized", "Access to baseline entity is not permitted"
        )
        return

    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id = str(uuid.uuid4())
    monitor: dict = {
        "id": monitor_id,
        "type": msg["monitor_type"],
        "name": msg["name"],
        "enabled": msg.get("enabled", True),
        "look_back_hours": msg["look_back_hours"],
        "scan_interval_minutes": msg["scan_interval_minutes"],
        "overlap_mode": msg.get("overlap_mode", "all"),
        "created_at": datetime.now(UTC).isoformat(),
        "last_scan_at": None,
        "last_cluster_count": 0,
        "scan_history": [],
        "anomaly_methods": msg.get("anomaly_methods", ["trend_residual"]),
        "anomaly_sensitivity": msg.get("anomaly_sensitivity", "medium"),
        "anomaly_overlap_mode": msg.get("anomaly_overlap_mode", "all"),
        "anomaly_rate_window": msg.get("anomaly_rate_window", "1h"),
        "anomaly_zscore_window": msg.get("anomaly_zscore_window", "24h"),
        "anomaly_persistence_window": msg.get("anomaly_persistence_window", "1h"),
        "anomaly_trend_method": msg.get("anomaly_trend_method", "rolling_average"),
        "anomaly_trend_window": msg.get("anomaly_trend_window", "24h"),
        "sample_interval": msg.get("sample_interval"),
        "sample_aggregate": msg.get("sample_aggregate", "mean"),
        "anomaly_use_sampled_data": msg.get("anomaly_use_sampled_data", False),
        "baseline_entity_id": msg.get("baseline_entity_id"),
        "baseline_time_offset_hours": msg.get("baseline_time_offset_hours", 0),
        "dismissed_windows": [],
    }
    if msg["monitor_type"] == "individual":
        monitor["entity_id"] = msg.get("entity_id", "")
    else:
        monitor["entity_ids"] = msg.get("entity_ids", [])

    await store.async_create_monitor(monitor)

    _register_monitor_entities(hass, monitor_id)

    connection.send_result(msg["id"], {"monitor": monitor})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/update",
        vol.Required("monitor_id"): vol.All(str, _valid_uuid),
        vol.Optional("name"): vol.All(str, vol.Length(min=1, max=100)),
        vol.Optional("enabled"): bool,
        vol.Optional("look_back_hours"): vol.All(int, vol.Range(min=1, max=168)),
        vol.Optional("scan_interval_minutes"): vol.All(int, vol.Range(min=5, max=1440)),
        vol.Optional("overlap_mode"): _valid_overlap_mode,
        **_MONITOR_ANALYSIS_FIELDS,
    }
)
@websocket_api.async_response
async def ws_monitors_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Partially update an anomaly monitor."""
    _require_admin(connection, msg)

    baseline_entity_id = msg.get("baseline_entity_id")
    if baseline_entity_id and not _can_read_entity(connection.user, baseline_entity_id):
        connection.send_error(
            msg["id"], "unauthorized", "Access to baseline entity is not permitted"
        )
        return

    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id: str = msg["monitor_id"]

    _allowed_keys = {
        "name",
        "enabled",
        "look_back_hours",
        "scan_interval_minutes",
        "overlap_mode",
        "anomaly_methods",
        "anomaly_sensitivity",
        "anomaly_overlap_mode",
        "anomaly_rate_window",
        "anomaly_zscore_window",
        "anomaly_persistence_window",
        "anomaly_trend_method",
        "anomaly_trend_window",
        "sample_interval",
        "sample_aggregate",
        "anomaly_use_sampled_data",
        "baseline_entity_id",
        "baseline_time_offset_hours",
    }
    updates = {k: v for k, v in msg.items() if k in _allowed_keys}
    updated = await store.async_update_monitor(monitor_id, updates)
    if updated is None:
        connection.send_error(msg["id"], "not_found", "Monitor not found")
        return

    if "name" in updates:
        from homeassistant.helpers import device_registry as dr  # noqa: PLC0415

        device = _get_monitor_device(hass, monitor_id)
        if device is not None:
            dr.async_get(hass).async_update_device(device.id, name=updates["name"])

    connection.send_result(msg["id"], {"monitor": updated})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/delete",
        vol.Required("monitor_id"): vol.All(str, _valid_uuid),
    }
)
@websocket_api.async_response
async def ws_monitors_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Delete an anomaly monitor and remove its sensor entity."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id: str = msg["monitor_id"]

    deleted = await store.async_delete_monitor(monitor_id)
    if not deleted:
        connection.send_error(msg["id"], "not_found", "Monitor not found")
        return

    # Look up the device before removing entities (while identifiers still resolve).
    device = _get_monitor_device(hass, monitor_id)

    sensor = hass.data[DOMAIN].get(KEY_MONITOR_SENSORS, {}).pop(monitor_id, None)
    if sensor is not None:
        await sensor.async_remove()

    for binary_sensor in (
        hass.data[DOMAIN].get(KEY_MONITOR_BINARY_SENSORS, {}).pop(monitor_id, ())
    ):
        await binary_sensor.async_remove()

    switch = hass.data[DOMAIN].get(KEY_MONITOR_SWITCHES, {}).pop(monitor_id, None)
    if switch is not None:
        await switch.async_remove()

    if device is not None:
        from homeassistant.helpers import device_registry as dr  # noqa: PLC0415

        dr.async_get(hass).async_remove_device(device.id)

    connection.send_result(msg["id"], {"deleted": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/anomalies",
        vol.Required("monitor_id"): vol.All(str, _valid_uuid),
        vol.Optional("request_id"): str,
    }
)
@websocket_api.async_response
async def ws_monitors_anomalies(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Run a live anomaly scan for a monitor and return clusters + dismissed windows."""
    import operator  # noqa: PLC0415

    from .sensor import (  # noqa: PLC0415
        _apply_dismissals,
        _build_detection_config,
        _run_combined_detection,
    )

    _require_admin(connection, msg)
    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id: str = msg["monitor_id"]

    monitor = store.get_monitor(monitor_id)
    if monitor is None:
        connection.send_error(msg["id"], "not_found", "Monitor not found")
        return

    monitor_type = monitor.get("type", "individual")
    look_back_hours = monitor.get("look_back_hours", 24)
    config = _build_detection_config(monitor)
    now = datetime.now(UTC)
    start_time = (now - timedelta(hours=look_back_hours)).isoformat()
    end_time = now.isoformat()

    pool = hass.data[DOMAIN].get("executor")
    request_id: str | None = msg.get("request_id")
    cancel_event = _register_cancel(hass, request_id)

    try:
        recorder = get_instance(hass)

        if monitor_type == "combined":
            entity_ids = monitor.get("entity_ids", [])
            all_pts: dict[str, list] = {}
            for eid in entity_ids:
                pts = await recorder.async_add_executor_job(
                    fetch_entity_pts, hass, eid, start_time, end_time
                )
                stats = await recorder.async_add_executor_job(
                    fetch_entity_statistics_pts, hass, eid, start_time, end_time
                )
                if stats:
                    if pts:
                        stats = [p for p in stats if p[0] < pts[0][0]]
                    if stats:
                        pts = sorted(stats + pts, key=operator.itemgetter(0))
                sample_interval = monitor.get("sample_interval")
                if sample_interval and sample_interval != "raw":
                    pts = downsample_pts(
                        pts,
                        parse_interval_seconds(sample_interval),
                        monitor.get("sample_aggregate", "mean"),
                    )
                all_pts[eid] = pts
            clusters = await asyncio.wait_for(
                hass.loop.run_in_executor(
                    pool,
                    _run_combined_detection,
                    all_pts,
                    config,
                    monitor.get("overlap_mode", "all"),
                    cancel_event,
                ),
                timeout=30.0,
            )
        else:
            entity_id = monitor.get("entity_id", "")
            pts = await recorder.async_add_executor_job(
                fetch_entity_pts, hass, entity_id, start_time, end_time
            )
            stats = await recorder.async_add_executor_job(
                fetch_entity_statistics_pts, hass, entity_id, start_time, end_time
            )
            if stats:
                if pts:
                    stats = [p for p in stats if p[0] < pts[0][0]]
                if stats:
                    pts = sorted(stats + pts, key=operator.itemgetter(0))
            sample_interval = monitor.get("sample_interval")
            if sample_interval and sample_interval != "raw":
                pts = downsample_pts(
                    pts,
                    parse_interval_seconds(sample_interval),
                    monitor.get("sample_aggregate", "mean"),
                )
            clusters: list = []
            if len(pts) >= 3:
                comparison_pts: list | None = None
                baseline_entity_id = monitor.get("baseline_entity_id")
                if baseline_entity_id and "comparison_window" in config.get(
                    "anomaly_methods", []
                ):
                    comparison_pts = await recorder.async_add_executor_job(
                        fetch_entity_pts, hass, baseline_entity_id, start_time, end_time
                    )
                clusters = await _run_detection_with_timeout(
                    hass, pool, pts, config, comparison_pts, cancel_event
                )

    except TimeoutError:
        cancel_event.set()
        _unregister_cancel(hass, request_id)
        _LOGGER.warning("ws_monitors_anomalies timed out for %s", monitor_id)
        connection.send_error(msg["id"], "scan_failed", "Detection timed out")
        return
    except Exception as err:  # noqa: BLE001
        _unregister_cancel(hass, request_id)
        _LOGGER.error("ws_monitors_anomalies failed for %s: %s", monitor_id, err)
        connection.send_error(msg["id"], "scan_failed", str(err))
        return

    _unregister_cancel(hass, request_id)

    from .store import DatapointsStore  # noqa: PLC0415

    monitor_fresh = store.get_monitor(monitor_id) or monitor
    DatapointsStore.prune_dismissed_windows(monitor_fresh, now)
    clusters = _apply_dismissals(clusters, monitor_fresh.get("dismissed_windows", []))

    connection.send_result(
        msg["id"],
        {
            "monitor_id": monitor_id,
            "anomaly_clusters": clusters,
            "dismissed_windows": monitor_fresh.get("dismissed_windows", []),
            "cluster_count": len(clusters),
        },
    )


def _validate_iso_datetime(value: str) -> str:
    """Voluptuous validator — raises Invalid if value is not a parseable ISO datetime."""
    try:
        datetime.fromisoformat(value)
    except ValueError as err:
        raise vol.Invalid(f"Invalid ISO datetime: {value}") from err
    return value


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/dismiss",
        vol.Required("monitor_id"): vol.All(str, _valid_uuid),
        vol.Required("start_ms"): vol.All(int, vol.Range(min=0)),
        vol.Required("end_ms"): vol.All(int, vol.Range(min=0)),
        vol.Optional("expires_at"): vol.Any(None, vol.All(str, _validate_iso_datetime)),
    }
)
@websocket_api.async_response
async def ws_monitors_dismiss(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Add a dismissal window to a monitor."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id: str = msg["monitor_id"]
    start_ms: int = msg["start_ms"]
    end_ms: int = msg["end_ms"]

    if end_ms < start_ms:
        connection.send_error(msg["id"], "invalid_input", "end_ms must be >= start_ms")
        return

    monitor = store.get_monitor(monitor_id)
    if monitor is None:
        connection.send_error(msg["id"], "not_found", "Monitor not found")
        return

    # Compute default expires_at if not provided: now + look_back_hours * 2
    # "expires_at" key absent → use default; key present with None → permanent
    if "expires_at" not in msg:
        look_back_hours = monitor.get("look_back_hours", 24)
        expires_at: str | None = (
            datetime.now(UTC) + timedelta(hours=look_back_hours * 2)
        ).isoformat()
    else:
        expires_at = msg["expires_at"]

    updated = await store.async_dismiss_window(monitor_id, start_ms, end_ms, expires_at)
    connection.send_result(msg["id"], {"dismissed": True, "monitor": updated})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/monitors/undismiss",
        vol.Required("monitor_id"): vol.All(str, _valid_uuid),
        vol.Required("window_id"): vol.All(str, _valid_uuid),
    }
)
@websocket_api.async_response
async def ws_monitors_undismiss(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Remove a dismissal window from a monitor by ID."""
    _require_admin(connection, msg)
    store = hass.data[DOMAIN][KEY_STORE]
    monitor_id: str = msg["monitor_id"]
    window_id: str = msg["window_id"]

    updated = await store.async_undismiss_window(monitor_id, window_id)
    if updated is None:
        connection.send_error(msg["id"], "not_found", "Monitor not found")
        return

    connection.send_result(msg["id"], {"removed": True, "monitor": updated})
