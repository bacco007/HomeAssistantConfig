"""Data models for UniFi Alerts."""

from __future__ import annotations

import logging
import re
from collections.abc import Callable
from contextlib import suppress
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any, TypedDict

from .severity import normalize_severity

_LOGGER = logging.getLogger(__name__)

if TYPE_CHECKING:
    from .coordinator import UniFiAlertsCoordinator
    from .unifi_client import UniFiClient


class UniFiClientConfig(TypedDict, total=False):
    """Shape of the dict passed to UniFiClient, UniFiAlertsCoordinator, and WebhookManager.

    total=False because legacy entries and credential subsets may omit fields;
    call sites use .get(key, default) for optional fields.
    """

    controller_url: str
    api_key: str
    verify_ssl: bool
    webhook_secret: str
    webhook_id_suffix: str
    enabled_categories: list[str]
    min_severity: dict[str, str]
    poll_interval: int
    clear_timeout: int
    site: str


def ensure_aware(dt: datetime) -> datetime:
    """Treat a naive datetime as UTC.

    Real alarms are always tz-aware (`from_api_alarm`, `from_system_log_event`,
    and `from_webhook_payload` all stamp UTC-aware timestamps); this only
    guards the `last_alarm_received_at` comparisons against a naive value
    slipping in (e.g. from a test fixture) and raising on `>` comparison.
    """
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=UTC)


def _render_message_raw(message_raw: str, parameters: dict[str, Any]) -> str:
    """Substitute {KEY} placeholders in message_raw with values from parameters.

    The v2 system-log schema uses a template string (message_raw) with
    {PARAM_NAME} placeholders and a parameters object whose values are dicts
    with at least a 'name' field (and sometimes an 'id' and other metadata).

    Uses a single-pass re.sub so parameter values that contain {TOKEN} strings
    are never re-substituted, and overlapping key names (e.g. {IP} vs {IP_DST})
    are resolved correctly regardless of iteration order.
    """
    # Build the display-value map once before the regex pass.
    display: dict[str, str] = {}
    for key, value in parameters.items():
        if isinstance(value, dict):
            display[key] = str(value.get("name") or value.get("id") or key)
        else:
            display[key] = str(value)

    def _replace(match: re.Match[str]) -> str:
        token = match.group(1)
        return display.get(token, match.group(0))

    return re.sub(r"\{([^{}]+)\}", _replace, message_raw)


@dataclass
class UniFiAlert:
    """Represents a single alert received from UniFi (via webhook or poll)."""

    category: str
    message: str
    received_at: datetime
    raw: dict[str, Any] = field(default_factory=dict)

    # Optional enrichment fields parsed from the UniFi payload
    key: str = ""
    device_name: str = ""
    site: str = ""
    severity: str = ""

    @property
    def severity_level(self) -> str:
        """Normalised severity, derived from self.severity on every access.

        Computed on demand rather than stored so it can never drift from
        `self.severity`, and is intentionally not a dataclass field: it is
        not serialised by `to_dict`/`from_dict`, and is recomputed from the
        persisted raw `severity` string on restore.
        """
        return normalize_severity(self.severity)

    @classmethod
    def from_webhook_payload(cls, category: str, payload: dict[str, Any]) -> UniFiAlert:
        """Build an alert from a raw UniFi Alarm Manager webhook POST body."""
        message = (
            payload.get("message")
            or payload.get("msg")
            or payload.get("text")
            or payload.get("description")
            or "Unknown alert"
        )
        return cls(
            category=category,
            message=str(message)[:255],
            received_at=datetime.now(UTC),
            key=str(payload.get("key", ""))[:64],
            device_name=str(
                payload.get("device_name") or payload.get("ap_name") or payload.get("sw_name") or ""
            )[:255],
            site=str(payload.get("site_name") or payload.get("site") or ""),
            severity=str(payload.get("severity") or payload.get("subsystem") or "")[:32],
        )

    @classmethod
    def from_api_alarm(cls, category: str, alarm: dict[str, Any]) -> UniFiAlert:
        """Build an alert from a polled UniFi controller alarm record."""
        message = alarm.get("msg") or alarm.get("message") or alarm.get("key") or "Unknown alert"
        # UniFi returns timestamps as epoch milliseconds (v2 system-log always; legacy
        # /list/alarm sometimes) or ISO strings. fromisoformat rejects numeric strings,
        # so try the numeric branch first.
        ts = alarm.get("datetime") or alarm.get("timestamp")
        received_at = datetime.now(UTC)
        if ts is not None:
            try:
                epoch_ms = int(ts)
            except ValueError, TypeError:
                epoch_ms = None
            if epoch_ms is not None:
                with suppress(OverflowError, OSError, ValueError):
                    received_at = datetime.fromtimestamp(epoch_ms / 1000, tz=UTC)
            else:
                with suppress(ValueError, TypeError):
                    received_at = datetime.fromisoformat(str(ts))

        return cls(
            category=category,
            message=str(message)[:255],
            received_at=received_at,
            key=str(alarm.get("key", ""))[:64],
            device_name=str(alarm.get("device_name") or alarm.get("ap_name") or "")[:255],
            site=str(alarm.get("site_name") or ""),
            severity=str(alarm.get("severity") or alarm.get("subsystem") or "")[:32],
        )

    @classmethod
    def from_system_log_event(
        cls,
        payload: dict[str, Any],
        seen_keys: set[str] | None = None,
    ) -> UniFiAlert:
        """Build an alert from a v2 system-log/all event record.

        The v2 schema differs substantially from the legacy /list/alarm format:
          - timestamp: epoch milliseconds integer (not an ISO string)
          - message_raw + parameters: template + substitution values (not a pre-rendered msg)
          - status: "NEW" means open/unacknowledged (equivalent to archived: false)
          - key: flat descriptive string with no EVT_ prefix
          - category: explicit enum value (SECURITY, INTERNET_AND_WAN, etc.)

        Category resolution delegates to classify_event_key() (the single entry
        point for all key->category mapping). If neither key nor enum matches,
        category is set to "" to match the fall-through behaviour in from_dict /
        the legacy path.

        seen_keys: caller-owned set used to deduplicate "unrecognised key"
        warnings. Pass the coordinator's instance set for production use; pass
        None to warn on every call (suitable for tests of individual events).
        """
        from .const import classify_event_key

        # Timestamp: always epoch milliseconds in the v2 schema
        ts = payload.get("timestamp")
        received_at = datetime.now(UTC)
        if ts is not None:
            with suppress(OverflowError, OSError, ValueError, TypeError):
                received_at = datetime.fromtimestamp(int(ts) / 1000, tz=UTC)

        # Message: render template or fall back to title_raw / key / sentinel
        message_raw = payload.get("message_raw", "")
        parameters = payload.get("parameters") or {}
        if message_raw:
            message = _render_message_raw(message_raw, parameters)
        else:
            message = payload.get("title_raw") or payload.get("key") or "Unknown alert"

        # Category: single entry point handles all lookup strategies.
        # Two-stage resolution so we can emit the correct warning when only
        # the broad enum fallback is used (meaning the key is undocumented).
        key = payload.get("key", "")
        v2_category_enum = payload.get("category", "")
        key_category = classify_event_key(key)  # exact + legacy prefix only
        enum_category = classify_event_key("", v2_category_enum)  # enum fallback only

        if key_category:
            category = key_category
        elif enum_category:
            category = enum_category
            # Key was not in the map; warn once per key so gaps are discoverable.
            if key and (seen_keys is None or key not in seen_keys):
                if seen_keys is not None:
                    seen_keys.add(key)
                _LOGGER.warning(
                    "Unrecognised v2 system-log key %r (enum=%s); using coarse fallback category %s. "
                    "Add this key to SYSTEM_LOG_KEY_TO_CATEGORY in const.py.",
                    key,
                    v2_category_enum,
                    enum_category,
                )
        else:
            category = ""
            if key and (seen_keys is None or key not in seen_keys):
                if seen_keys is not None:
                    seen_keys.add(key)
                _LOGGER.warning(
                    "Unrecognised v2 system-log key %r (enum=%s); no category fallback, event skipped. "
                    "Add this key to SYSTEM_LOG_KEY_TO_CATEGORY in const.py.",
                    key,
                    v2_category_enum,
                )

        return cls(
            category=category,
            message=str(message)[:255],
            received_at=received_at,
            key=key[:64],
            device_name=str(payload.get("device_name") or "")[:255],
            site=str(payload.get("site_name") or payload.get("site") or ""),
            severity=str(payload.get("severity") or "")[:32],
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise this alert to a JSON-safe dict for Store persistence.

        `raw` is intentionally excluded: it carries unredacted UniFi payload
        fields (client MACs, IPs, hostnames) and arbitrary values that can
        defeat Store.async_save's JSON encoder. The restore path only consumes
        the scalar fields below; from_dict() defaults raw to {} on read.
        """
        return {
            "category": self.category,
            "message": self.message,
            "received_at": self.received_at.isoformat(),
            "key": self.key,
            "device_name": self.device_name,
            "site": self.site,
            "severity": self.severity,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> UniFiAlert:
        """Deserialise an alert previously written by ``to_dict``."""
        received_at_raw = data.get("received_at", "")
        try:
            received_at = datetime.fromisoformat(received_at_raw)
        except ValueError, TypeError:
            received_at = datetime.now(UTC)
        return cls(
            category=data.get("category", ""),
            message=data.get("message", ""),
            received_at=received_at,
            raw=data.get("raw", {}),
            key=data.get("key", ""),
            device_name=data.get("device_name", ""),
            site=data.get("site", ""),
            severity=data.get("severity", ""),
        )


@dataclass
class CategoryState:
    """Runtime state for a single alert category."""

    category: str
    enabled: bool = True
    is_alerting: bool = False
    last_alert: UniFiAlert | None = None
    alert_count: int = 0  # incremented by webhooks
    open_count: int = 0  # set by polling (unarchived alarms)
    last_cleared_at: datetime | None = None
    # Timestamp of the last webhook actually received for this category. Set
    # only on the push path (never by polling) so it reflects webhook
    # connectivity specifically, which powers the onboarding/health signal.
    last_webhook_at: datetime | None = None
    # Newest `received_at` seen for this category, from either the push or
    # polling path. Tracked so Clear can anchor `last_cleared_at` to the
    # controller's own timeline instead of the HA host clock (#268): using
    # this as the watermark keeps the open_count comparison
    # controller-clock vs controller-clock, immune to HA/controller skew.
    last_alarm_received_at: datetime | None = None

    def apply_alert(self, alert: UniFiAlert) -> None:
        self.is_alerting = True
        self.last_alert = alert
        self.alert_count += 1
        received_at = ensure_aware(alert.received_at)
        if self.last_alarm_received_at is None or received_at > self.last_alarm_received_at:
            self.last_alarm_received_at = received_at

    def clear(self) -> None:
        """Acknowledge everything seen so far for this category.

        The watermark is anchored to the controller's own timeline: it is set
        to the newest `received_at` already observed for this category (via
        push or poll), falling back to the HA host clock only when no alarm
        has ever been seen. See docs/UNIFI.md "Clock assumption".
        """
        self.is_alerting = False
        self.last_cleared_at = (
            self.last_alarm_received_at
            if self.last_alarm_received_at is not None
            else datetime.now(UTC)
        )

    def webhook_health(self, now: datetime | None = None) -> str:
        """Classify webhook delivery health for this category.

        Returns ``WEBHOOK_HEALTH_NEVER`` when no webhook has ever been
        received, ``WEBHOOK_HEALTH_HEALTHY`` when the most recent webhook is
        within ``WEBHOOK_STALE_AFTER_SECONDS``, and ``WEBHOOK_HEALTH_STALE``
        otherwise. ``now`` is injectable for deterministic tests.
        """
        from .const import (
            WEBHOOK_HEALTH_HEALTHY,
            WEBHOOK_HEALTH_NEVER,
            WEBHOOK_HEALTH_STALE,
            WEBHOOK_STALE_AFTER_SECONDS,
        )

        if self.last_webhook_at is None:
            return WEBHOOK_HEALTH_NEVER
        now = now or datetime.now(UTC)
        if (now - self.last_webhook_at).total_seconds() <= WEBHOOK_STALE_AFTER_SECONDS:
            return WEBHOOK_HEALTH_HEALTHY
        return WEBHOOK_HEALTH_STALE


@dataclass
class RuntimeData:
    """Data stored on the config entry as ``entry.runtime_data``."""

    coordinator: UniFiAlertsCoordinator
    webhook_urls: dict[str, str]
    unregister_webhooks: Callable[[], None]
    client: UniFiClient
