"""Atomic, recorder-queued history backfill for Health Bridge.

Home Assistant has no supported API for inserting back-dated state rows. This
module therefore forms a deliberately small compatibility boundary around the
recorder internals. Backfill is fail-closed: ordinary Health Bridge state syncs
never invoke recorder internals unless the request is explicitly marked as backfill.

Each request is validated before it reaches the recorder, queued behind normal
recorder events, committed in one transaction, and acknowledged only after the
commit succeeds. Retried/overlapping windows are idempotent by entity + rounded
sample second.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import logging
import math
import re
import time
from typing import Any

_LOGGER = logging.getLogger(__name__)

BACKFILL_PROTOCOL_VERSION = 1
MAX_BACKFILL_SECONDS = 14 * 24 * 60 * 60
MAX_CLOCK_SKEW_SECONDS = 5 * 60
MAX_REQUEST_AGE_GRACE_SECONDS = 15 * 60
MAX_POINTS_PER_REQUEST = 2_500
MAX_POINTS_PER_ENTITY = 721
MAX_RECORDER_BACKLOG = 1_000
RECORDER_TASK_TIMEOUT_SECONDS = 45

# Version-pinned on purpose. A recorder schema change disables only backfill;
# legacy/live sensor updates continue normally until compatibility is verified.
SUPPORTED_RECORDER_SCHEMA_VERSIONS = frozenset({53})
SUPPORTED_RECORDER_DIALECTS = frozenset({"sqlite"})

_REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


class BackfillError(Exception):
    """Base exception for committed-backfill requests."""


class BackfillValidationError(BackfillError):
    """The client payload is invalid and must not be retried unchanged."""


class BackfillUnavailableError(BackfillError):
    """Recorder is temporarily unavailable; the client should retry later."""


class BackfillCompatibilityError(BackfillError):
    """The running recorder schema/database is not approved for backfill."""


class BackfillEntityNotReadyError(BackfillError):
    """A live entity has not reached the recorder yet; retry the request."""


@dataclass(frozen=True, slots=True)
class ValidatedBackfillBatch:
    """Normalized series ready for one atomic recorder transaction."""

    request_id: str
    series_by_entity: dict[str, list[tuple[float, float]]]
    received_points: int
    duplicate_points: int


@dataclass(frozen=True, slots=True)
class BackfillCommitResult:
    """Committed recorder result returned to the client."""

    request_id: str
    schema_version: int
    database: str
    received: int
    inserted: int
    skipped: int
    entities: int

    def as_dict(self) -> dict[str, Any]:
        """Return the stable webhook acknowledgement contract."""
        return {
            "ok": True,
            "committed": True,
            "protocol_version": BACKFILL_PROTOCOL_VERSION,
            "request_id": self.request_id,
            "recorder_schema": self.schema_version,
            "database": self.database,
            "received": self.received,
            "inserted": self.inserted,
            "skipped": self.skipped,
            "entities": self.entities,
            "statistics_policy": "history_only",
        }


def validate_request_id(value: Any) -> str:
    """Validate and return a bounded, log-safe request identifier."""
    if not isinstance(value, str) or not _REQUEST_ID_RE.fullmatch(value):
        raise BackfillValidationError(
            "request_id must be 1-64 characters using letters, numbers, '.', '_' or '-'"
        )
    return value


def validate_backfill_series(
    request_id: Any,
    series_by_entity: dict[str, list[tuple[float, float]]],
    *,
    now_timestamp: float | None = None,
) -> ValidatedBackfillBatch:
    """Validate limits/timestamps and deduplicate points within the request."""
    validated_request_id = validate_request_id(request_id)
    if not isinstance(series_by_entity, dict) or not series_by_entity:
        raise BackfillValidationError("backfill data contains no eligible metrics")

    now_ts = float(now_timestamp if now_timestamp is not None else time.time())
    received = 0
    duplicates = 0
    normalized: dict[str, list[tuple[float, float]]] = {}
    earliest: float | None = None
    latest: float | None = None

    for entity_id, points in series_by_entity.items():
        if not isinstance(entity_id, str) or not entity_id.startswith("sensor."):
            raise BackfillValidationError("backfill targets must be sensor entity IDs")
        if not isinstance(points, list) or len(points) < 2:
            raise BackfillValidationError(
                f"{entity_id} must contain at least one historical point and one live point"
            )
        if len(points) > MAX_POINTS_PER_ENTITY:
            raise BackfillValidationError(
                f"{entity_id} exceeds the {MAX_POINTS_PER_ENTITY}-point limit"
            )

        received += len(points)
        if received > MAX_POINTS_PER_REQUEST:
            raise BackfillValidationError(
                f"backfill exceeds the {MAX_POINTS_PER_REQUEST}-point request limit"
            )

        by_second: dict[int, tuple[float, float]] = {}
        for raw_point in points:
            if not isinstance(raw_point, (tuple, list)) or len(raw_point) != 2:
                raise BackfillValidationError(f"{entity_id} contains a malformed point")
            try:
                timestamp = float(raw_point[0])
                value = float(raw_point[1])
            except (TypeError, ValueError) as exc:
                raise BackfillValidationError(
                    f"{entity_id} contains a non-numeric timestamp or value"
                ) from exc
            if not math.isfinite(timestamp) or not math.isfinite(value):
                raise BackfillValidationError(f"{entity_id} contains a non-finite value")

            second = round(timestamp)
            if second in by_second:
                duplicates += 1
            by_second[second] = (timestamp, value)
            earliest = timestamp if earliest is None else min(earliest, timestamp)
            latest = timestamp if latest is None else max(latest, timestamp)

        normalized[entity_id] = [by_second[key] for key in sorted(by_second)]

    if earliest is None or latest is None:
        raise BackfillValidationError("backfill contains no valid points")
    if latest > now_ts + MAX_CLOCK_SKEW_SECONDS:
        raise BackfillValidationError("backfill contains a timestamp too far in the future")
    if earliest < now_ts - MAX_BACKFILL_SECONDS - MAX_REQUEST_AGE_GRACE_SECONDS:
        raise BackfillValidationError("backfill contains data older than the 14-day limit")
    if latest - earliest > MAX_BACKFILL_SECONDS + MAX_REQUEST_AGE_GRACE_SECONDS:
        raise BackfillValidationError("backfill time span exceeds 14 days")

    return ValidatedBackfillBatch(
        request_id=validated_request_id,
        series_by_entity=normalized,
        received_points=received,
        duplicate_points=duplicates,
    )


async def async_commit_backfill(hass: Any, batch: ValidatedBackfillBatch) -> BackfillCommitResult:
    """Queue one atomic recorder task and wait for its committed result."""
    try:
        from homeassistant.components.recorder import get_instance
    except (ImportError, AttributeError) as exc:
        raise BackfillCompatibilityError("recorder API is unavailable") from exc

    try:
        instance = get_instance(hass)
    except Exception as exc:
        raise BackfillUnavailableError("recorder is not configured") from exc

    _validate_recorder_instance(instance, batch)

    loop = asyncio.get_running_loop()
    result_future: asyncio.Future[BackfillCommitResult] = loop.create_future()
    task = _make_recorder_task(batch, loop, result_future)
    instance.queue_task(task)

    try:
        return await asyncio.wait_for(
            asyncio.shield(result_future),
            timeout=RECORDER_TASK_TIMEOUT_SECONDS,
        )
    except TimeoutError as exc:
        result_future.cancel()
        raise BackfillUnavailableError("recorder commit timed out") from exc


def _validate_recorder_instance(instance: Any, batch: ValidatedBackfillBatch) -> None:
    """Fail closed before placing unsupported work on the recorder queue."""
    ready = getattr(instance, "async_recorder_ready", None)
    if ready is None or not ready.is_set():
        raise BackfillUnavailableError("recorder is still starting or migrating")
    if getattr(instance, "migration_in_progress", False):
        raise BackfillUnavailableError("recorder migration is in progress")
    if not getattr(instance, "recording", False):
        raise BackfillUnavailableError("recorder is not currently recording")
    if int(getattr(instance, "backlog", 0)) > MAX_RECORDER_BACKLOG:
        raise BackfillUnavailableError("recorder backlog is too large")

    schema_version = int(getattr(instance, "schema_version", 0))
    if schema_version not in SUPPORTED_RECORDER_SCHEMA_VERSIONS:
        raise BackfillCompatibilityError(
            f"recorder schema {schema_version} is not approved for backfill"
        )

    dialect = _dialect_name(instance)
    if dialect not in SUPPORTED_RECORDER_DIALECTS:
        raise BackfillCompatibilityError(
            f"recorder database '{dialect}' is not approved for backfill"
        )

    entity_filter = getattr(instance, "entity_filter", None)
    if entity_filter is not None:
        excluded = [
            entity_id
            for entity_id in batch.series_by_entity
            if not entity_filter(entity_id)
        ]
        if excluded:
            raise BackfillCompatibilityError(
                "one or more Health Bridge entities are excluded from recorder"
            )


def _dialect_name(instance: Any) -> str:
    dialect = getattr(instance, "dialect_name", "unknown")
    return str(getattr(dialect, "value", dialect)).lower()


def _make_recorder_task(
    batch: ValidatedBackfillBatch,
    loop: asyncio.AbstractEventLoop,
    result_future: asyncio.Future[BackfillCommitResult],
) -> Any:
    """Create a version-pinned task that runs on the recorder thread."""
    try:
        from homeassistant.components.recorder.tasks import RecorderTask
    except (ImportError, AttributeError) as exc:
        raise BackfillCompatibilityError("recorder task API is unavailable") from exc

    class HealthBridgeBackfillTask(RecorderTask):
        """Serialize Health Bridge writes with recorder events/statistics/purge."""

        __slots__ = ("_batch", "_loop", "_future")
        commit_before = True

        def __init__(self) -> None:
            self._batch = batch
            self._loop = loop
            self._future = result_future

        def run(self, instance: Any) -> None:
            try:
                result = _commit_batch_sync(instance, self._batch)
            except Exception as exc:
                self._loop.call_soon_threadsafe(
                    _set_future_exception_if_pending,
                    self._future,
                    exc,
                )
            else:
                self._loop.call_soon_threadsafe(
                    _set_future_result_if_pending,
                    self._future,
                    result,
                )

    return HealthBridgeBackfillTask()


def _commit_batch_sync(instance: Any, batch: ValidatedBackfillBatch) -> BackfillCommitResult:
    """Commit every entity in ``batch`` in one recorder-thread transaction."""
    from sqlalchemy import select
    from homeassistant.components.recorder.db_schema import (
        SCHEMA_VERSION,
        States,
        StatesMeta,
    )

    if SCHEMA_VERSION not in SUPPORTED_RECORDER_SCHEMA_VERSIONS:
        raise BackfillCompatibilityError(
            f"loaded recorder schema {SCHEMA_VERSION} is not approved for backfill"
        )
    required_columns = (
        "metadata_id",
        "state",
        "last_updated_ts",
        "last_changed_ts",
        "last_reported_ts",
        "attributes_id",
        "old_state_id",
        "origin_idx",
    )
    if any(not hasattr(States, column) for column in required_columns):
        raise BackfillCompatibilityError("recorder States model is incompatible")

    session = instance.get_session()
    inserted = 0
    existing_skipped = 0
    new_rows: list[Any] = []
    try:
        for entity_id, points in batch.series_by_entity.items():
            metadata_id = session.execute(
                select(StatesMeta.metadata_id).where(StatesMeta.entity_id == entity_id)
            ).scalar_one_or_none()
            if metadata_id is None:
                raise BackfillEntityNotReadyError(
                    f"{entity_id} has not reached recorder metadata yet"
                )

            attributes_id = session.execute(
                select(States.attributes_id)
                .where(
                    States.metadata_id == metadata_id,
                    States.attributes_id.is_not(None),
                )
                .order_by(States.last_updated_ts.desc())
                .limit(1)
            ).scalar_one_or_none()
            if attributes_id is None:
                raise BackfillEntityNotReadyError(
                    f"{entity_id} has no recorded state attributes yet"
                )

            lo = points[0][0]
            hi = points[-1][0]
            existing_seconds = {
                round(timestamp)
                for timestamp in session.execute(
                    select(States.last_updated_ts).where(
                        States.metadata_id == metadata_id,
                        # Query a full second beyond each edge because
                        # idempotency compares rounded seconds, not raw floats.
                        States.last_updated_ts >= lo - 1.0,
                        States.last_updated_ts <= hi + 1.0,
                    )
                ).scalars()
                if timestamp is not None
            }

            for timestamp, value in points:
                second = round(timestamp)
                if second in existing_seconds:
                    existing_skipped += 1
                    continue
                existing_seconds.add(second)
                new_rows.append(
                    States(
                        metadata_id=metadata_id,
                        state=_state_str(value),
                        last_updated_ts=timestamp,
                        last_changed_ts=None,
                        last_reported_ts=None,
                        attributes_id=attributes_id,
                        old_state_id=None,
                        origin_idx=0,
                    )
                )

        if new_rows:
            session.add_all(new_rows)
            session.flush()
            inserted = len(new_rows)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    result = BackfillCommitResult(
        request_id=batch.request_id,
        schema_version=int(instance.schema_version),
        database=_dialect_name(instance),
        received=batch.received_points,
        inserted=inserted,
        skipped=batch.duplicate_points + existing_skipped,
        entities=len(batch.series_by_entity),
    )
    _LOGGER.debug(
        "Health Bridge backfill committed request=%s entities=%d "
        "received=%d inserted=%d skipped=%d",
        result.request_id,
        result.entities,
        result.received,
        result.inserted,
        result.skipped,
    )
    return result


def _set_future_result_if_pending(future: asyncio.Future[Any], result: Any) -> None:
    if not future.done():
        future.set_result(result)


def _set_future_exception_if_pending(future: asyncio.Future[Any], exc: Exception) -> None:
    if not future.done():
        future.set_exception(exc)


def _state_str(value: float) -> str:
    """Render a numeric value the way HA stores sensor states."""
    number = float(value)
    if number.is_integer():
        return str(int(number))
    return repr(round(number, 6))
