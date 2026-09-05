"""Phone Assistant Link protocol and policy state for Health Bridge."""

from __future__ import annotations

import asyncio
import logging
import re
import time
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any
from urllib.parse import urlsplit, urlunsplit
from uuid import UUID

import voluptuous as vol
from aiohttp import ClientError, ClientTimeout, web
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

PAL_PROTOCOL_VERSION = 3
PAL_REQUEST_TYPE = "phone_assistant_link"
PAL_SUPPORTED_ACTIONS = {"ping", "sync", "publish", "screen_time"}
PAL_POLICY_KEY = "pal_policies"
PAL_SCREEN_TIME_KEY = "pal_screen_time"
PAL_SERVICE_ALLOW = "temporarily_allow_phone_group"
PAL_SERVICE_BLOCK = "temporarily_block_phone_group"
PAL_PUSH_RELAY_KEY = "pal_push_relay"
PAL_PUSH_STORAGE_KEY = "health_bridge.pal_push_registrations"
PAL_AGGREGATE_ACTIVITY_ID = "00000000-0000-4000-8000-000000000001"
PAL_PUSH_RELAY_HOST = "uclsyemxxhzqanihylkd.supabase.co"
PAL_PUSH_RELAY_PATH = "/functions/v1/pal-notifications"

_LOGGER = logging.getLogger(__name__)
_PAL_PUSH_SECRET_RE = re.compile(r"^pal_[A-Za-z0-9_-]{40,80}$")
_PAL_MDI_ICON_RE = re.compile(r"^mdi:[a-z0-9-]{1,64}$")


class PALPushRelay:
    """Persist PAL relay credentials and coalesce APNs wake requests."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, dict[str, str]]] = Store(
            hass, 1, PAL_PUSH_STORAGE_KEY
        )
        self._registrations: dict[str, dict[str, str]] = {}
        self._loaded = False
        self._load_lock = asyncio.Lock()
        self._wake_tasks: dict[str, asyncio.Task[None]] = {}
        self._wake_dirty: set[str] = set()

    async def async_set_registration(
        self, user_id: str, registration: dict[str, str]
    ) -> None:
        await self._async_ensure_loaded()
        if self._registrations.get(user_id) == registration:
            return
        self._registrations[user_id] = registration
        await self._store.async_save(self._registrations)

    async def async_has_registration(self, user_id: str) -> bool:
        await self._async_ensure_loaded()
        return user_id in self._registrations

    @callback
    def schedule_wake(self, user_id: str) -> None:
        self._wake_dirty.add(user_id)
        existing = self._wake_tasks.get(user_id)
        if existing is not None and not existing.done():
            return
        self._wake_tasks[user_id] = self.hass.async_create_task(
            self._async_delayed_wake(user_id)
        )

    @callback
    def shutdown(self) -> None:
        for task in self._wake_tasks.values():
            task.cancel()
        self._wake_tasks.clear()
        self._wake_dirty.clear()

    async def _async_ensure_loaded(self) -> None:
        if self._loaded:
            return
        async with self._load_lock:
            if self._loaded:
                return
            stored = await self._store.async_load()
            if isinstance(stored, dict):
                self._registrations = {
                    str(user_id): registration
                    for user_id, registration in stored.items()
                    if isinstance(registration, dict)
                    and all(
                        isinstance(registration.get(key), str)
                        for key in ("installation_id", "secret", "server_url")
                    )
                }
            self._loaded = True

    async def _async_delayed_wake(self, user_id: str) -> None:
        try:
            await asyncio.sleep(0.75)
            # Everything received during the quiet period is represented by
            # the fresh state snapshot below. A later change marks the device
            # dirty again and is sent after this request finishes.
            self._wake_dirty.discard(user_id)
            await self._async_ensure_loaded()
            registration = self._registrations.get(user_id)
            if registration is None:
                return

            url = (
                f"{registration['server_url']}/v1/installations/"
                f"{registration['installation_id']}/wake"
            )
            headers = {
                "Authorization": f"Bearer {registration['secret']}",
                "Content-Type": "application/json",
            }
            session = async_get_clientsession(self.hass)
            while True:
                blocked_names = list(
                    dict.fromkeys(
                        policy.name.strip()
                        for policy in self.hass.data.get(DOMAIN, {})
                        .get(PAL_POLICY_KEY, {})
                        .values()
                        if policy.user_id == user_id
                        and policy.effective_blocked
                        and policy.name.strip()
                    )
                )
                joined_name = " | ".join(blocked_names)
                if len(joined_name) > 80:
                    joined_name = f"{joined_name[:79]}…"
                payload = {
                    "event": "restrictions_changed",
                    "revision": time.time_ns() // 1_000_000,
                    "live_activities": [
                        {
                            "group_id": PAL_AGGREGATE_ACTIVITY_ID,
                            "group_name": joined_name,
                        }
                    ] if joined_name else [],
                }
                async with session.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=ClientTimeout(total=10),
                ) as response:
                    if 200 <= response.status < 300:
                        try:
                            result = await response.json(content_type=None)
                        except (TypeError, ValueError):
                            result = {}
                        if isinstance(result, dict) and result.get("status") == "coalesced":
                            retry_after = result.get("retry_after_seconds", 20)
                            try:
                                delay = min(max(float(retry_after), 1.0), 60.0) + 0.25
                            except (TypeError, ValueError):
                                delay = 20.25
                            await asyncio.sleep(delay)
                            continue
                        return
                    if response.status in {401, 404, 410}:
                        self._registrations.pop(user_id, None)
                        await self._store.async_save(self._registrations)
                        _LOGGER.warning(
                            "Phone Assistant Link push registration is no longer valid "
                            "for device %s (HTTP %s)",
                            user_id,
                            response.status,
                        )
                        return
                    _LOGGER.warning(
                        "Phone Assistant Link notification server rejected a wake "
                        "for device %s (HTTP %s)",
                        user_id,
                        response.status,
                    )
                    return
        except asyncio.CancelledError:
            raise
        except (ClientError, TimeoutError) as exc:
            _LOGGER.warning(
                "Phone Assistant Link notification server is unavailable for "
                "device %s: %s",
                user_id,
                type(exc).__name__,
            )
        finally:
            self._wake_tasks.pop(user_id, None)
            if user_id in self._wake_dirty:
                self._wake_tasks[user_id] = self.hass.async_create_task(
                    self._async_delayed_wake(user_id)
                )


def get_push_relay(hass: HomeAssistant) -> PALPushRelay:
    domain_data = hass.data.setdefault(DOMAIN, {})
    relay = domain_data.get(PAL_PUSH_RELAY_KEY)
    if relay is None:
        relay = PALPushRelay(hass)
        domain_data[PAL_PUSH_RELAY_KEY] = relay
    return relay


@callback
def async_request_pal_wake(hass: HomeAssistant, user_id: str) -> None:
    """Queue a wake after a Home Assistant-originated policy change."""
    get_push_relay(hass).schedule_wake(user_id)


class PALGroupPolicyState:
    """Shared state observed by every PAL entity platform."""

    def __init__(
        self, hass: HomeAssistant, user_id: str, group_id: str, name: str,
        icon: str = "mdi:apps",
    ) -> None:
        self.hass = hass
        self.user_id = user_id
        self.group_id = group_id
        self.name = name
        self.icon = icon
        self.blocked = False
        self.daily_limit_minutes: int | None = None
        self.limit_reached = False
        self.usage_today_minutes = 0
        self.extensions_allowed_per_day = 0
        self.extensions_used_today = 0
        self.temporary_override: str | None = None
        self.temporary_until: datetime | None = None
        self.extension_active_until: datetime | None = None
        self._listeners: set[Callable[[], None]] = set()
        self._expiry_cancel: Callable[[], None] | None = None
        self._extension_expiry_cancel: Callable[[], None] | None = None

    @property
    def key(self) -> str:
        return f"{self.user_id}\0{self.group_id}"

    @property
    def device_identifier(self) -> str:
        return f"phone_assistant_link_{self.user_id}_{self.group_id}"

    @property
    def temporary_is_active(self) -> bool:
        return (
            self.temporary_override in {"allow", "block"}
            and self.temporary_until is not None
            and self.temporary_until > dt_util.utcnow()
        )

    @property
    def extension_is_active(self) -> bool:
        return (
            self.extension_active_until is not None
            and self.extension_active_until > dt_util.utcnow()
        )

    @property
    def effective_blocked(self) -> bool:
        # A Home Assistant temporary override is explicit and wins; otherwise an
        # active phone-granted extension unblocks the group for its window.
        if self.temporary_is_active:
            return self.temporary_override == "block"
        if self.extension_is_active:
            return False
        return self.blocked or self.limit_reached

    @property
    def restriction_status(self) -> str:
        if self.temporary_is_active:
            return (
                "Temporarily Blocked"
                if self.temporary_override == "block"
                else "Temporarily Allowed"
            )
        if self.extension_is_active and (self.blocked or self.limit_reached):
            return "Extended"
        if self.limit_reached:
            return "Daily Limit Reached"
        if self.blocked:
            return "Blocked by Home Assistant"
        return "Allowed"

    @callback
    def add_listener(self, listener: Callable[[], None]) -> None:
        self._listeners.add(listener)

    @callback
    def remove_listener(self, listener: Callable[[], None]) -> None:
        self._listeners.discard(listener)

    @callback
    def notify(self) -> None:
        for listener in tuple(self._listeners):
            listener()

    @callback
    def set_temporary(self, override: str | None, until: datetime | None) -> None:
        if self._expiry_cancel is not None:
            self._expiry_cancel()
            self._expiry_cancel = None
        self.temporary_override = override
        self.temporary_until = until
        if override is not None and until is not None and until > dt_util.utcnow():
            delay = (until - dt_util.utcnow()).total_seconds()

            @callback
            def clear_expired(_now) -> None:
                self._expiry_cancel = None
                self.temporary_override = None
                self.temporary_until = None
                self.notify()
                async_request_pal_wake(self.hass, self.user_id)

            self._expiry_cancel = async_call_later(self.hass, delay, clear_expired)
        elif until is None or until <= dt_util.utcnow():
            self.temporary_override = None
            self.temporary_until = None
        self.notify()

    @callback
    def set_extension_active_until(self, until: datetime | None) -> None:
        """Stores the phone-reported extension window and schedules a refresh at
        its end so the status flips back and Home Assistant re-evaluates the block
        exactly when the window closes."""
        if self._extension_expiry_cancel is not None:
            self._extension_expiry_cancel()
            self._extension_expiry_cancel = None
        if until is not None and until > dt_util.utcnow():
            self.extension_active_until = until
            delay = (until - dt_util.utcnow()).total_seconds()

            @callback
            def clear_expired(_now) -> None:
                self._extension_expiry_cancel = None
                self.extension_active_until = None
                self.notify()
                async_request_pal_wake(self.hass, self.user_id)

            self._extension_expiry_cancel = async_call_later(
                self.hass, delay, clear_expired
            )
        else:
            self.extension_active_until = None


class PALScreenTimeState:
    """Approximate, privacy-preserving usage exported by a PAL device."""

    def __init__(
        self, hass: HomeAssistant, user_id: str, item_id: str, name: str
    ) -> None:
        self.hass = hass
        self.user_id = user_id
        self.item_id = item_id
        self.name = name
        self.usage_today_minutes = 0
        self._listeners: set[Callable[[], None]] = set()

    @property
    def key(self) -> str:
        return f"{self.user_id}\0{self.item_id}"

    @property
    def device_identifier(self) -> str:
        return f"phone_assistant_link_screentime_{self.user_id}"

    @callback
    def add_listener(self, listener: Callable[[], None]) -> None:
        self._listeners.add(listener)

    @callback
    def remove_listener(self, listener: Callable[[], None]) -> None:
        self._listeners.discard(listener)

    @callback
    def notify(self) -> None:
        for listener in tuple(self._listeners):
            listener()


def get_or_create_screen_time(
    hass: HomeAssistant, user_id: str, item_id: str, name: str
) -> PALScreenTimeState:
    states: dict[str, PALScreenTimeState] = hass.data.setdefault(DOMAIN, {}).setdefault(
        PAL_SCREEN_TIME_KEY, {}
    )
    key = f"{user_id}\0{item_id}"
    state = states.get(key)
    if state is None:
        state = PALScreenTimeState(hass, user_id, item_id, name)
        states[key] = state
    else:
        state.name = name
    return state


def policy_key(user_id: str, group_id: str) -> str:
    return f"{user_id}\0{group_id}"


def _restored_group_name(
    hass: HomeAssistant, user_id: str, group_id: str
) -> str | None:
    """Recover PAL's last group name from its persistent device registry entry."""
    identifier = (DOMAIN, f"phone_assistant_link_{user_id}_{group_id}")
    for device in dr.async_get(hass).devices.values():
        if identifier not in device.identifiers:
            continue
        device_name = device.name or ""
        current_prefix = f"{user_id} — "
        if device_name.startswith(current_prefix):
            group_name = device_name.removeprefix(current_prefix).strip()
            return group_name or None
        legacy_prefix = "Phone Assistant Link — "
        if device_name.startswith(legacy_prefix):
            group_name = device_name.removeprefix(legacy_prefix).strip()
            return group_name or None
    return None


def get_or_create_policy(
    hass: HomeAssistant, user_id: str, group_id: str, group_name: str,
    icon: str = "mdi:apps",
) -> PALGroupPolicyState:
    if group_name == "App Group":
        group_name = _restored_group_name(hass, user_id, group_id) or group_name
    policies: dict[str, PALGroupPolicyState] = hass.data.setdefault(DOMAIN, {}).setdefault(
        PAL_POLICY_KEY, {}
    )
    key = policy_key(user_id, group_id)
    policy = policies.get(key)
    if policy is None:
        policy = PALGroupPolicyState(hass, user_id, group_id, group_name, icon)
        policies[key] = policy
    else:
        if group_name != "App Group" or policy.name == "App Group":
            policy.name = group_name
        policy.icon = icon
    return policy


def parse_pal_unique_id(unique_id: str, prefix: str) -> tuple[str, str] | None:
    if not unique_id.startswith(prefix):
        return None
    payload = unique_id.removeprefix(prefix)
    if len(payload) < 38 or payload[-37] != "_":
        return None
    user_id, raw_group_id = payload[:-37], payload[-36:]
    try:
        group_id = str(UUID(raw_group_id))
    except ValueError:
        return None
    return (user_id, group_id) if user_id else None


def _parse_datetime(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    parsed = dt_util.parse_datetime(value)
    if parsed is None:
        return None
    return dt_util.as_utc(parsed)


def _validated_groups(raw_groups: Any) -> list[dict[str, Any]] | None:
    if not isinstance(raw_groups, list):
        return None
    groups: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in raw_groups:
        if not isinstance(raw, dict):
            return None
        try:
            group_id = str(UUID(str(raw.get("id"))))
        except (TypeError, ValueError, AttributeError):
            return None
        name = raw.get("name")
        icon = raw.get("icon", "mdi:apps")
        blocked = raw.get("blocked")
        daily_limit = raw.get("daily_limit_minutes")
        limit_reached = raw.get("limit_reached", False)
        usage_today = raw.get("usage_today_minutes", 0)
        # Older app builds omit this; absent means "authoritative" (legacy
        # behaviour) so they keep working. New builds send False for a
        # report-only publish that must not overwrite Home Assistant's control
        # state, and True only for a genuine phone-side edit.
        control_authoritative = raw.get("control_authoritative", True)
        extensions_allowed = raw.get("extensions_allowed_per_day", 0)
        extensions_used = raw.get("extensions_used_today", 0)
        if (
            group_id in seen
            or not isinstance(name, str)
            or not name.strip()
            or len(name.strip()) > 80
            or not isinstance(icon, str)
            or _PAL_MDI_ICON_RE.fullmatch(icon) is None
            or not isinstance(blocked, bool)
            or not isinstance(limit_reached, bool)
            or not isinstance(usage_today, int)
            or isinstance(usage_today, bool)
            or not 0 <= usage_today <= 1440
            or not isinstance(control_authoritative, bool)
            or not isinstance(extensions_allowed, int)
            or isinstance(extensions_allowed, bool)
            or not 0 <= extensions_allowed <= 100
            or not isinstance(extensions_used, int)
            or isinstance(extensions_used, bool)
            or not 0 <= extensions_used <= 100000
            or (
                daily_limit is not None
                and (
                    not isinstance(daily_limit, int)
                    or isinstance(daily_limit, bool)
                    or not 15 <= daily_limit <= 1440
                )
            )
        ):
            return None
        seen.add(group_id)
        groups.append(
            {
                "id": group_id,
                "name": name.strip(),
                "icon": icon,
                "blocked": blocked,
                "daily_limit_minutes": daily_limit,
                "limit_reached": limit_reached,
                "usage_today_minutes": usage_today,
                "control_authoritative": control_authoritative,
                "extensions_allowed_per_day": extensions_allowed,
                "extensions_used_today": extensions_used,
                "extension_active_until": _parse_datetime(
                    raw.get("extension_active_until")
                ),
                "temporary_override": raw.get("temporary_override"),
                "temporary_until": _parse_datetime(raw.get("temporary_until")),
            }
        )
    return groups


def _validated_screen_time(raw_items: Any) -> list[dict[str, Any]] | None:
    if raw_items is None:
        return []
    if not isinstance(raw_items, list):
        return None
    items: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in raw_items:
        if not isinstance(raw, dict):
            return None
        try:
            item_id = str(UUID(str(raw.get("id"))))
        except (TypeError, ValueError, AttributeError):
            return None
        name = raw.get("name")
        usage_today = raw.get("usage_today_minutes", 0)
        if (
            item_id in seen
            or not isinstance(name, str)
            or not name.strip()
            or len(name.strip()) > 80
            or not isinstance(usage_today, int)
            or isinstance(usage_today, bool)
            or not 0 <= usage_today <= 1440
        ):
            return None
        seen.add(item_id)
        items.append(
            {
                "id": item_id,
                "name": name.strip(),
                "usage_today_minutes": usage_today,
            }
        )
    return items


def _validated_push_registration(raw_push: Any) -> dict[str, str] | None:
    if not isinstance(raw_push, dict):
        return None
    try:
        installation_id = str(UUID(str(raw_push.get("installation_id"))))
    except (TypeError, ValueError, AttributeError):
        return None
    secret = raw_push.get("secret")
    server_url = raw_push.get("server_url")
    if (
        not isinstance(secret, str)
        or _PAL_PUSH_SECRET_RE.fullmatch(secret) is None
        or not isinstance(server_url, str)
        or len(server_url) > 512
    ):
        return None

    parsed = urlsplit(server_url.strip())
    host = parsed.hostname
    try:
        port = parsed.port
    except ValueError:
        return None
    allowed_path = parsed.path.rstrip("/")
    if (
        parsed.scheme.lower() != "https"
        or not host
        or host.lower() != PAL_PUSH_RELAY_HOST
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
        or port not in {None, 443}
        or allowed_path != PAL_PUSH_RELAY_PATH
    ):
        return None
    normalized_url = urlunsplit(
        ("https", parsed.netloc, allowed_path, "", "")
    ).rstrip("/")
    return {
        "installation_id": installation_id,
        "secret": secret,
        "server_url": normalized_url,
    }


def _error(error: str, status: int = 422) -> web.Response:
    return web.json_response({"ok": False, "error": error}, status=status)


async def async_handle_phone_assistant_request(
    hass: HomeAssistant, data: dict[str, Any], user_id: str
) -> web.Response:
    if data.get("client") != "phone_assistant_link":
        return _error("invalid_client")
    action = data.get("action")
    if action not in PAL_SUPPORTED_ACTIONS:
        return _error("unsupported_action")
    if not isinstance(user_id, str) or not user_id.strip() or len(user_id) > 80:
        return _error("invalid_user_id")
    user_id = user_id.strip()

    push_relay = get_push_relay(hass)
    raw_push = data.get("push")
    if raw_push is not None:
        push_registration = _validated_push_registration(raw_push)
        if push_registration is None:
            return _error("invalid_push_registration")
        await push_relay.async_set_registration(user_id, push_registration)
    push_delivery = (
        "apns" if await push_relay.async_has_registration(user_id) else "manual_sync"
    )

    if action == "ping":
        return web.json_response(
            {
                "ok": True,
                "request_type": PAL_REQUEST_TYPE,
                "protocol_version": PAL_PROTOCOL_VERSION,
                "integration_version": hass.data.get(DOMAIN, {}).get("integration_version"),
                "supported_apps": ["health_assistant_link", "phone_assistant_link"],
                "delivery": push_delivery,
                "groups": [],
            }
        )

    groups = _validated_groups(data.get("groups"))
    if groups is None:
        return _error("invalid_groups")
    # Accept the canonical snake_case key and the camelCase key emitted by
    # early PAL test builds. Never silently treat a present-but-misnamed list
    # as an empty successful sync.
    if "screen_time" in data:
        raw_screen_time = data["screen_time"]
    elif "screenTime" in data:
        raw_screen_time = data["screenTime"]
    else:
        return _error("missing_screen_time")
    screen_time = _validated_screen_time(raw_screen_time)
    if screen_time is None:
        return _error("invalid_screen_time")

    domain_data = hass.data.get(DOMAIN, {})
    ensure_callbacks = [
        domain_data.get("ensure_pal_switch"),
        domain_data.get("ensure_pal_number"),
        domain_data.get("ensure_pal_binary_sensor"),
        domain_data.get("ensure_pal_status_sensor"),
        domain_data.get("ensure_pal_usage_sensor"),
        domain_data.get("ensure_pal_extensions_used_sensor"),
    ]
    if (
        any(item is None for item in ensure_callbacks)
        or domain_data.get("ensure_pal_screen_time_sensor") is None
    ):
        return _error("pal_entity_platform_not_ready", status=503)

    active_ids: set[str] = set()
    response_groups: list[dict[str, Any]] = []
    for group in groups:
        active_ids.add(group["id"])
        policy = get_or_create_policy(
            hass, user_id, group["id"], group["name"], group["icon"]
        )
        policy.limit_reached = group["limit_reached"]
        policy.usage_today_minutes = group["usage_today_minutes"]
        # Extensions consumed today, and the current extension window, are
        # phone-authoritative (the phone grants and counts them), so always take
        # the reported values.
        policy.extensions_used_today = group["extensions_used_today"]
        policy.set_extension_active_until(group["extension_active_until"])
        # Only overwrite Home Assistant's control state when the phone flags this
        # publish as a real edit. A report-only publish (background/usage sync)
        # leaves block, daily limit and the extension allowance as Home Assistant
        # last set them, so a change made from Home Assistant is never clobbered
        # by stale phone state. Temporary overrides are Home Assistant-originated
        # only and are never taken from a phone publish.
        if action == "publish" and group["control_authoritative"]:
            policy.blocked = group["blocked"]
            policy.daily_limit_minutes = group["daily_limit_minutes"]
            policy.extensions_allowed_per_day = group["extensions_allowed_per_day"]
        policy.notify()
        for ensure in ensure_callbacks:
            ensure(policy)
        response_groups.append(
            {
                "group_id": policy.group_id,
                "icon": policy.icon,
                "blocked": policy.blocked,
                "daily_limit_minutes": policy.daily_limit_minutes,
                "limit_reached": policy.limit_reached,
                "usage_today_minutes": policy.usage_today_minutes,
                "extensions_allowed_per_day": policy.extensions_allowed_per_day,
                "extensions_used_today": policy.extensions_used_today,
                "restriction_status": policy.restriction_status,
                "temporary_override": (
                    policy.temporary_override if policy.temporary_is_active else None
                ),
                "temporary_until": (
                    policy.temporary_until.replace(microsecond=0)
                    .isoformat()
                    .replace("+00:00", "Z")
                    if policy.temporary_is_active and policy.temporary_until
                    else None
                ),
            }
        )

    active_screen_time_ids: set[str] = set()
    ensure_screen_time = domain_data["ensure_pal_screen_time_sensor"]
    for item in screen_time:
        active_screen_time_ids.add(item["id"])
        state = get_or_create_screen_time(
            hass, user_id, item["id"], item["name"]
        )
        state.usage_today_minutes = item["usage_today_minutes"]
        state.notify()
        ensure_screen_time(state)

    if action in {"publish", "screen_time"}:
        remove_screen_time = domain_data.get("remove_missing_pal_screen_time_sensors")
        if remove_screen_time is not None:
            await remove_screen_time(user_id, active_screen_time_ids)
        screen_time_states = domain_data.get(PAL_SCREEN_TIME_KEY, {})
        for key, state in list(screen_time_states.items()):
            if state.user_id == user_id and state.item_id not in active_screen_time_ids:
                screen_time_states.pop(key, None)

    if action == "publish":
        for callback_name in (
            "remove_missing_pal_switches",
            "remove_missing_pal_numbers",
            "remove_missing_pal_binary_sensors",
            "remove_missing_pal_status_sensors",
            "remove_missing_pal_usage_sensors",
            "remove_missing_pal_extensions_used_sensors",
        ):
            remove = domain_data.get(callback_name)
            if remove is not None:
                await remove(user_id, active_ids)
        policies = domain_data.get(PAL_POLICY_KEY, {})
        for key, policy in list(policies.items()):
            if policy.user_id == user_id and policy.group_id not in active_ids:
                policies.pop(key, None)

    return web.json_response(
        {
            "ok": True,
            "request_type": PAL_REQUEST_TYPE,
            "protocol_version": PAL_PROTOCOL_VERSION,
            "integration_version": domain_data.get("integration_version"),
            "action": action,
            "delivery": push_delivery,
            "revision": int(time.time()),
            "screen_time_received": len(screen_time),
            "screen_time_entities": len(active_screen_time_ids),
            "groups": response_groups,
        }
    )


_TEMPORARY_SERVICE_SCHEMA = vol.Schema(
    {
        vol.Required("device_id"): cv.string,
        vol.Required("duration_minutes"): vol.All(
            vol.Coerce(int), vol.Range(min=15, max=1440)
        ),
    }
)


def async_setup_pal_services(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, PAL_SERVICE_ALLOW):
        return

    async def apply_temporary(call: ServiceCall) -> None:
        device = dr.async_get(hass).async_get(call.data["device_id"])
        identifiers = device.identifiers if device is not None else set()
        pal_identifier = next(
            (
                identifier
                for domain, identifier in identifiers
                if domain == DOMAIN and identifier.startswith("phone_assistant_link_")
            ),
            None,
        )
        policy = next(
            (
                item
                for item in hass.data.get(DOMAIN, {}).get(PAL_POLICY_KEY, {}).values()
                if item.device_identifier == pal_identifier
            ),
            None,
        )
        if policy is None:
            raise HomeAssistantError(
                "Select a Phone Assistant Link group device that has synced with the app"
            )
        override = "allow" if call.service == PAL_SERVICE_ALLOW else "block"
        until = dt_util.utcnow() + timedelta(minutes=call.data["duration_minutes"])
        policy.set_temporary(override, until)
        async_request_pal_wake(hass, policy.user_id)

    hass.services.async_register(
        DOMAIN, PAL_SERVICE_ALLOW, apply_temporary, schema=_TEMPORARY_SERVICE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, PAL_SERVICE_BLOCK, apply_temporary, schema=_TEMPORARY_SERVICE_SCHEMA
    )


def async_unload_pal_services(hass: HomeAssistant) -> None:
    for service in (PAL_SERVICE_ALLOW, PAL_SERVICE_BLOCK):
        if hass.services.has_service(DOMAIN, service):
            hass.services.async_remove(DOMAIN, service)
    relay = hass.data.get(DOMAIN, {}).pop(PAL_PUSH_RELAY_KEY, None)
    if relay is not None:
        relay.shutdown()
