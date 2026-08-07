"""Webhook registration and dispatch for UniFi Alerts."""

from __future__ import annotations

import contextlib
import hmac
import json
import logging
from collections.abc import Awaitable, Callable

from aiohttp.web import Request, Response
from homeassistant.components.webhook import (
    async_generate_url,
    async_register,
    async_unregister,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from .const import (
    ALL_CATEGORIES,
    CONF_ENABLED_CATEGORIES,
    CONF_WEBHOOK_ID_SUFFIX,
    CONF_WEBHOOK_SECRET,
    DOMAIN,
    ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH,
    ISSUE_ID_WEBHOOK_SECRET_ROTATED,
    WEBHOOK_MAX_BODY_BYTES,
    webhook_id_for_category,
)
from .models import UniFiAlert, UniFiClientConfig

_LOGGER = logging.getLogger(__name__)

# Fields safe to log at DEBUG. Avoids leaking arbitrary controller payload
# fields (which may include client MACs, IPs, or future firmware additions).
_SAFE_DEBUG_FIELDS: tuple[str, ...] = (
    "category",
    "alert_key",
    "key",
    "severity",
    "device_name",
)


def _extract_bearer_token(authorization_header: str) -> str:
    """Return the token from an ``Authorization: Bearer <token>`` header.

    Returns "" if the header is absent or does not use the Bearer scheme
    (RFC 6750), so callers can feed the result straight into
    ``hmac.compare_digest`` alongside the legacy query-param token.
    """
    scheme, _, token = authorization_header.partition(" ")
    if scheme.lower() != "bearer":
        return ""
    return token.strip()


def _raise_legacy_query_auth_issue(hass: HomeAssistant, entry_id: str) -> None:
    """Nudge the user to migrate off the legacy ``?token=`` query param.

    Fires the first time a webhook authenticates via the query param rather
    than the Authorization header (#176). Not fixable via a repair flow —
    migrating means re-pasting the URL and adding a header in UniFi Alarm
    Manager, which cannot be automated from Home Assistant's side.
    """
    entry = hass.config_entries.async_get_entry(entry_id)
    name = entry.title if entry is not None else entry_id
    ir.async_create_issue(
        hass,
        DOMAIN,
        f"{ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH}_{entry_id}",
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH,
        translation_placeholders={"name": name},
    )


class WebhookManager:
    """Registers one HA webhook per alert category and routes inbound payloads."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry_id: str,
        config: UniFiClientConfig,
        push_callback: Callable[[str, UniFiAlert], None],
    ) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._config: UniFiClientConfig = config
        self._push_callback = push_callback
        self._registered: list[str] = []

    def register_all(self) -> dict[str, str]:
        """Register webhooks for all enabled categories. Returns {category: url}.

        Each registration is wrapped in its own try/except so a single failure
        does not abort the rest of the loop, and ``self._registered`` is only
        appended to after a successful ``async_register`` call so
        ``unregister_all()`` never tries to unregister something that never
        registered.
        """
        enabled = self._config.get(CONF_ENABLED_CATEGORIES, ALL_CATEGORIES)
        secret: str = self._config.get(CONF_WEBHOOK_SECRET, "")
        suffix: str = self._config.get(CONF_WEBHOOK_ID_SUFFIX, "")
        urls: dict[str, str] = {}

        for category in ALL_CATEGORIES:
            if category not in enabled:
                continue
            webhook_id = webhook_id_for_category(category, suffix)
            handler = self._make_handler(category, secret)
            try:
                async_register(
                    self._hass,
                    DOMAIN,
                    f"UniFi Alerts — {category}",
                    webhook_id,
                    handler,
                    allowed_methods=["POST"],
                    local_only=True,
                )
            except ValueError as err:
                # HA's async_register raises ValueError for a duplicate webhook_id
                # or an unsupported HTTP method — the only failure modes it has.
                _LOGGER.warning(
                    "Failed to register webhook for category %s (%s): %s",
                    category,
                    type(err).__name__,
                    err,
                )
                continue
            self._registered.append(webhook_id)
            # No secret embedded here (#176) — auth travels via the
            # Authorization header (or the legacy ?token= query param, which
            # is added by the caller/documentation, not generated here).
            urls[category] = async_generate_url(self._hass, webhook_id)
            _LOGGER.debug("Registered webhook for %s", category)

        return urls

    def unregister_all(self) -> None:
        for webhook_id in self._registered:
            with contextlib.suppress(Exception):
                async_unregister(self._hass, webhook_id)
        self._registered.clear()

    def _make_handler(
        self, category: str, secret: str
    ) -> Callable[[HomeAssistant, str, Request], Awaitable[Response | None]]:
        """Return an async webhook handler bound to a specific category."""

        async def handle_webhook(
            hass: HomeAssistant,
            webhook_id: str,
            request: Request,
        ) -> Response | None:
            if not secret:
                _LOGGER.error(
                    "Webhook for category %s has no bearer secret configured; rejecting request. "
                    "Re-save the integration via Settings > Devices & Services > UniFi Alerts > Configure.",
                    category,
                )
                return Response(status=500)
            # Authorization: Bearer header is the preferred form (#176); the
            # legacy ?token= query param remains accepted during the
            # deprecation window so existing UniFi Alarm Manager
            # configurations are not broken by this migration. Both checks
            # run unconditionally (not short-circuited) and use
            # hmac.compare_digest to avoid leaking the secret via a timing
            # side-channel — `==` / `!=` exit early on the first mismatching
            # byte, which lets a remote attacker recover the secret
            # byte-by-byte.
            header_token = _extract_bearer_token(request.headers.get("Authorization", ""))
            query_token = request.query.get("token", "")
            header_authorized = hmac.compare_digest(header_token, secret)
            query_authorized = hmac.compare_digest(query_token, secret)
            if not header_authorized and not query_authorized:
                _LOGGER.warning(
                    "Webhook request for category %s rejected: missing or invalid token",
                    category,
                )
                return Response(status=401)

            raw = b""
            try:
                raw = await request.content.read(WEBHOOK_MAX_BODY_BYTES + 1)
                if len(raw) > WEBHOOK_MAX_BODY_BYTES:
                    _LOGGER.warning(
                        "Webhook body for category %s exceeds %d bytes, rejecting",
                        category,
                        WEBHOOK_MAX_BODY_BYTES,
                    )
                    return Response(status=413)
                payload = json.loads(raw.decode()) if raw else {}
            except (json.JSONDecodeError, UnicodeDecodeError, TypeError) as err:
                # Contract: bodies that fail JSON or UTF-8 decoding are rejected
                # with HTTP 400 rather than falling through to an empty payload.
                # Empty-but-valid bodies ({}) and bodies with no recognisable
                # fields are accepted (400 is reserved for parse failures only).
                # This prevents a token-bearing sender from spamming "Unknown
                # alert" state via malformed bodies.
                preview = raw[:80].decode("utf-8", errors="replace") if raw else ""
                _LOGGER.warning(
                    "Malformed webhook body from controller for category %s (%s): %r",
                    category,
                    type(err).__name__,
                    preview,
                )
                return Response(status=400)

            # Body contract (decided in #124, companion to #173):
            #   - Unparseable (invalid JSON / invalid UTF-8): HTTP 400, no callback.
            #   - Empty body ({}): accepted; from_webhook_payload yields "Unknown alert".
            #   - Body with no recognised fields: accepted; same fallback.
            # An authenticated empty-body ping is a valid webhook event. Rejecting it
            # would surface as a false-alarm 400 in the UniFi Alarm Manager logs.
            if _LOGGER.isEnabledFor(logging.DEBUG):
                # Narrow the payload to known-safe fields before logging so
                # arbitrary controller fields (client MACs, IPs, future
                # firmware additions) never end up in user-shared logs.
                safe = {k: payload.get(k) for k in _SAFE_DEBUG_FIELDS if k in payload}
                _LOGGER.debug("Webhook received for category %s: %s", category, safe)
            alert = UniFiAlert.from_webhook_payload(category, payload)
            self._push_callback(category, alert)
            # First valid webhook after a secret rotation proves Alarm Manager
            # was updated with the new URLs. Clear the rotation repair issue.
            ir.async_delete_issue(
                hass, DOMAIN, f"{ISSUE_ID_WEBHOOK_SECRET_ROTATED}_{self._entry_id}"
            )
            if header_authorized:
                # Migration to header auth confirmed for this entry — clear
                # any outstanding legacy-auth nudge.
                ir.async_delete_issue(
                    hass, DOMAIN, f"{ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH}_{self._entry_id}"
                )
            else:
                _raise_legacy_query_auth_issue(hass, self._entry_id)
            return None

        return handle_webhook
