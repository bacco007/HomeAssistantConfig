"""Resilient conditional HTTP client for official anonymous feeds."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import logging
from time import monotonic
from typing import Any, Final

from aiohttp import ClientError, ClientSession

from .const import (
    MAX_BACKOFF,
    MAX_RESPONSE_BYTES,
    REQUEST_TIMEOUT_SECONDS,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class FeedSnapshot:
    """A response plus cache/health metadata."""

    name: str
    url: str
    body: bytes | None
    status: str
    fetched_at: datetime | None
    changed_at: datetime | None
    last_modified: datetime | None
    etag: str | None
    error: str | None
    from_cache: bool
    response_received: bool
    not_modified: bool = False

    @property
    def available(self) -> bool:
        return self.body is not None


@dataclass(slots=True)
class _FeedState:
    body: bytes | None = None
    etag: str | None = None
    last_modified_header: str | None = None
    last_modified: datetime | None = None
    last_success: datetime | None = None
    last_change: datetime | None = None
    last_error: str | None = None
    failures: int = 0
    retry_after_monotonic: float = 0.0


class OfficialFeedClient:
    """Fetch documented official feeds with validators and last-good retention."""

    _ACCEPT: Final = "application/cap+xml, application/geo+json, application/json, application/xml, text/xml, application/rss+xml;q=0.9"

    def __init__(self, session: ClientSession) -> None:
        self._session = session
        self._states: dict[str, _FeedState] = {}

    async def async_fetch(
        self, name: str, url: str, *, validator: Callable[[bytes], Any]
    ) -> FeedSnapshot:
        """Accept content and HTTP validators only after product validation.

        A successful HTTP request is not evidence of a usable incident feed.
        Parser errors take the same retention/backoff path as transport errors.
        """
        state = self._states.setdefault(name, _FeedState())
        now = datetime.now(timezone.utc)
        if monotonic() < state.retry_after_monotonic:
            return self._snapshot(
                name,
                url,
                state,
                status="backoff" if state.body is None else "retained",
                error=state.last_error,
                from_cache=state.body is not None,
                response_received=False,
            )

        headers = {
            "Accept": self._ACCEPT,
            "User-Agent": f"Home-Assistant-Australian-Fire-Watch/{VERSION}",
        }
        if state.etag:
            headers["If-None-Match"] = state.etag
        if state.last_modified_header:
            headers["If-Modified-Since"] = state.last_modified_header

        try:
            async with asyncio.timeout(REQUEST_TIMEOUT_SECONDS):
                async with self._session.get(url, headers=headers) as response:
                    if response.status == 304 and state.body is not None:
                        state.last_success = now
                        state.last_error = None
                        state.failures = 0
                        state.retry_after_monotonic = 0.0
                        return self._snapshot(
                            name,
                            url,
                            state,
                            status="not_modified",
                            error=None,
                            from_cache=True,
                            response_received=True,
                            not_modified=True,
                        )
                    if response.status != 200:
                        raise ClientError(f"HTTP {response.status}")
                    length_header = response.headers.get("Content-Length")
                    if length_header and int(length_header) > MAX_RESPONSE_BYTES:
                        raise ClientError(
                            f"response exceeds {MAX_RESPONSE_BYTES} bytes"
                        )
                    chunks: list[bytes] = []
                    length = 0
                    async for chunk in response.content.iter_chunked(64 * 1024):
                        length += len(chunk)
                        if length > MAX_RESPONSE_BYTES:
                            raise ClientError(
                                f"response exceeds {MAX_RESPONSE_BYTES} bytes"
                            )
                        chunks.append(chunk)
                    body = b"".join(chunks)
                    if not body.strip():
                        raise ClientError("empty response")

                    # Do not poison the last-good cache (including its ETag)
                    # with a maintenance page, partial feed, or schema change.
                    parsed = validator(body)
                    if (
                        getattr(parsed, "metadata", {}).get("snapshot_complete")
                        is False
                    ):
                        raise ValueError("incomplete official feed snapshot")
                    new_etag = response.headers.get("ETag")
                    modified_header = response.headers.get("Last-Modified")
                    modified = _http_datetime(modified_header)
                    # A publisher can reissue identical relative-day values on
                    # a new date. Recognise that publication without redating
                    # unchanged responses that have no new publisher timestamp.
                    publication_changed = (
                        modified is not None and modified != state.last_modified
                    )
                    changed = body != state.body
                    state.body = body
                    state.etag = new_etag
                    state.last_modified_header = modified_header
                    state.last_modified = modified
                    state.last_success = now
                    if changed or publication_changed or state.last_change is None:
                        state.last_change = modified or now
                    state.last_error = None
                    state.failures = 0
                    state.retry_after_monotonic = 0.0
                    return self._snapshot(
                        name,
                        url,
                        state,
                        status="ok",
                        error=None,
                        from_cache=False,
                        response_received=True,
                    )
        except (
            TimeoutError,
            ClientError,
            ValueError,
            TypeError,
            KeyError,
            IndexError,
            OSError,
        ) as err:
            state.failures += 1
            backoff = min(
                30 * (2 ** min(state.failures - 1, 10)),
                int(MAX_BACKOFF.total_seconds()),
            )
            state.retry_after_monotonic = monotonic() + backoff
            state.last_error = f"{type(err).__name__}: {err}"[:300]
            _LOGGER.warning(
                "Official feed %s unavailable: %s; retry in %ss", name, err, backoff
            )
            return self._snapshot(
                name,
                url,
                state,
                status="unavailable" if state.body is None else "retained",
                error=state.last_error,
                from_cache=state.body is not None,
                response_received=False,
            )

    @staticmethod
    def _snapshot(
        name: str,
        url: str,
        state: _FeedState,
        *,
        status: str,
        error: str | None,
        from_cache: bool,
        response_received: bool,
        not_modified: bool = False,
    ) -> FeedSnapshot:
        return FeedSnapshot(
            name=name,
            url=url,
            body=state.body,
            status=status,
            fetched_at=state.last_success,
            changed_at=state.last_change,
            last_modified=state.last_modified,
            etag=state.etag,
            error=error,
            from_cache=from_cache,
            response_received=response_received,
            not_modified=not_modified,
        )


def _http_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        result = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        return None
    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result
