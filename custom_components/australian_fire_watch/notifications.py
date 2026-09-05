"""Persistent, bounded, per-recipient notification outbox.

Delivery means the Home Assistant notify action accepted the call, not that a
phone displayed it. At-least-once delivery can duplicate a notification after a
crash; stable mobile tags replace the previous notification in that case.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Mapping
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
import logging
from time import monotonic
from typing import Any

_LOGGER = logging.getLogger(__name__)
MAX_AGE = timedelta(minutes=15)
SEND_TIMEOUT_SECONDS = 10
MAX_SENDS_PER_FLUSH = 20


def _datetime(value: Any) -> datetime | None:
    try:
        result = datetime.fromisoformat(str(value))
    except (TypeError, ValueError):
        return None
    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result


class NotificationOutbox:
    """Keep the newest pending notification for each recipient and mobile tag."""

    def __init__(self, saved: Mapping[str, Any] | None = None) -> None:
        saved = saved or {}
        self.pending = {
            str(key): deepcopy(dict(value))
            for key, value in (saved.get("pending") or {}).items()
            if isinstance(value, Mapping)
            and isinstance(value.get("payload"), Mapping)
            and str(value.get("service", "")).startswith("notify.")
        }
        self.last_error: str | None = saved.get("last_error")
        self.last_success: str | None = saved.get("last_success")
        self.expired_count = int(saved.get("expired_count", 0))
        self._lock = asyncio.Lock()

    def export(self) -> dict[str, Any]:
        return deepcopy(
            {
                "pending": self.pending,
                "last_error": self.last_error,
                "last_success": self.last_success,
                "expired_count": self.expired_count,
            }
        )

    def status(self) -> dict[str, Any]:
        return {
            "pending_count": len(self.pending),
            "last_error": self.last_error,
            "last_successful_delivery": self.last_success,
            "expired_count": self.expired_count,
            "delivery_semantics": "notify service acceptance; at least once",
        }

    def discard_tag(self, tag: str) -> None:
        """A new lifecycle event supersedes queued messages for that incident."""
        for key, item in tuple(self.pending.items()):
            if item.get("tag") == tag:
                self.pending.pop(key, None)

    def suppress(self, incident_id: str) -> None:
        """Acknowledgement/snooze cannot suppress queued Emergency Warnings."""
        for key, item in tuple(self.pending.items()):
            if item.get("incident_id") == incident_id and not item.get("critical"):
                self.pending.pop(key, None)

    def stage(
        self,
        services: tuple[str, ...],
        title: str,
        message: str,
        data: dict[str, Any],
        *,
        now: datetime,
        incident_id: str | None = None,
        expires_at: datetime | None = None,
    ) -> None:
        """Stage synchronously; the owner must save before calling flush."""
        tag = str(data["tag"])
        deadline = min(now + MAX_AGE, expires_at) if expires_at else now + MAX_AGE
        payload = {"title": title, "message": message, "data": deepcopy(data)}
        fingerprint = sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        for service in services:
            self.pending[f"{service}|{tag}"] = {
                "service": service,
                "tag": tag,
                "event_id": fingerprint,
                "incident_id": incident_id,
                "critical": data.get("push", {}).get("interruption-level")
                == "critical",
                "payload": deepcopy(payload),
                "created_at": now.isoformat(),
                "expires_at": deadline.isoformat(),
                "next_attempt": now.isoformat(),
                "attempts": 0,
            }

    async def async_flush(
        self,
        send: Callable[[str, dict[str, Any]], Awaitable[None]],
        save: Callable[[], Awaitable[None]],
        *,
        services: tuple[str, ...],
        now: datetime | None = None,
    ) -> bool:
        """Retry independently of feed updates, persisting each outcome."""
        async with self._lock:
            now = now or datetime.now(timezone.utc)
            changed = False
            attempted = 0
            started = monotonic()
            # Emergency messages take precedence over routine queued updates.
            queued = sorted(
                self.pending.items(),
                key=lambda pair: (
                    not pair[1].get("critical"),
                    pair[1].get("created_at", ""),
                ),
            )
            for key, item in queued:
                deadline = _datetime(item.get("expires_at"))
                next_attempt = _datetime(item.get("next_attempt"))
                if item["service"] not in services:
                    self.pending.pop(key, None)
                    changed = True
                    continue
                if deadline is None or now >= deadline:
                    self.pending.pop(key, None)
                    self.expired_count += 1
                    self.last_error = (
                        "An undelivered notification expired; consult official alerts"
                    )
                    changed = True
                    continue
                if next_attempt and next_attempt > now:
                    continue
                if (
                    attempted >= MAX_SENDS_PER_FLUSH
                    or monotonic() - started >= 2 * SEND_TIMEOUT_SECONDS
                ):
                    break
                attempted += 1
                try:
                    async with asyncio.timeout(SEND_TIMEOUT_SECONDS):
                        await send(item["service"], deepcopy(item["payload"]))
                except (
                    Exception
                ) as err:  # Notify implementations can raise non-HA errors.
                    # Cancellation is deliberately not caught (BaseException).
                    if self.pending.get(key) is not item:
                        continue
                    item["attempts"] = int(item.get("attempts", 0)) + 1
                    delay = min(30 * 2 ** min(item["attempts"] - 1, 4), 300)
                    item["next_attempt"] = (now + timedelta(seconds=delay)).isoformat()
                    self.last_error = f"{item['service']}: {type(err).__name__}: {err}"[
                        :300
                    ]
                    _LOGGER.warning(
                        "Notification retained for retry: %s", self.last_error
                    )
                else:
                    if self.pending.get(key) is item:
                        self.pending.pop(key, None)
                    self.last_success = now.isoformat()
                    if not self.pending:
                        self.last_error = None
                changed = True
                try:
                    await save()
                except Exception:
                    # A failed acknowledgement write must not lose a delivery.
                    # A replay can duplicate it, but the stable tag is reused.
                    self.pending.setdefault(key, item)
                    self.last_error = "Unable to persist notification delivery state"
                    _LOGGER.exception(self.last_error)
                    break
            if changed:
                try:
                    await save()
                except Exception:
                    self.last_error = "Unable to persist notification delivery state"
                    _LOGGER.exception(self.last_error)
            return changed
