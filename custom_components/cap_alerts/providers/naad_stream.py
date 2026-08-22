"""NAAD real-time CAP streaming client.

A standalone TLS client for the NAADS streaming feed
(``streaming.alertready.ca:8443``), the channel the NAADS 2.0 LMD User Guide
documents as correct for 24/7 automated systems (the GeoRSS feed is auxiliary).
The wire is a continuous byte stream of concatenated CAP-CP documents, each an
XML declaration followed by an ``<alert>…</alert>`` element; heartbeats are CAP
``<alert>`` documents whose ``<sender>`` starts with ``NAADS-Heartbeat`` and
whose ``<status>`` is ``System``, emitted at least every 60 s.

This module deliberately owns only the transport: reassembly of complete
``<alert>…</alert>`` frames, heartbeat classification, a silence watchdog, and
reconnect/backoff. It parses no alert semantics beyond heartbeat detection — raw
document strings are handed to the caller's ``on_alert_doc`` callback. The TLS
connection is created through an injectable ``connect`` callable so tests can
drive a scripted reader without a socket.
"""

from __future__ import annotations

import asyncio
import codecs
import logging
import random
import re
import ssl
from collections.abc import Awaitable, Callable

from ..const import (
    NAAD_STREAM_BACKOFF_MAX_S,
    NAAD_STREAM_BACKOFF_MIN_S,
    NAAD_STREAM_HEARTBEAT_SENDER_PREFIX,
    NAAD_STREAM_HEARTBEAT_TIMEOUT_S,
)

_LOGGER = logging.getLogger(__name__)

# Bound the reassembly buffer so a never-terminated ``<alert>`` (a missing close
# tag) cannot grow memory without limit. NAAD alerts are well under this; a
# buffer past it is discarded and the stream re-syncs on the next frame. Counted
# in characters, not bytes: the buffer holds decoded text, so the byte ceiling is
# this times the UTF-8 width of whatever is in it.
_MAX_BUFFER_CHARS = 8 * 1024 * 1024

# Read chunk size for the byte stream.
_READ_CHUNK = 65536

# How long to wait for the TLS shutdown handshake when dropping a connection.
_CLOSE_TIMEOUT_S = 5

_ALERT_START = "<alert"
_ALERT_END = "</alert>"

_SENDER_RE = re.compile(r"<sender>\s*([^<]+?)\s*</sender>")
_STATUS_RE = re.compile(r"<status>\s*([^<]+?)\s*</status>")

ConnectFn = Callable[[], Awaitable[tuple[asyncio.StreamReader, asyncio.StreamWriter]]]


class NAADStreamClient:
    """TLS client for the NAADS CAP streaming feed with reconnect/backoff."""

    def __init__(
        self,
        host: str,
        port: int,
        *,
        on_alert_doc: Callable[[str], Awaitable[None]],
        on_heartbeat: Callable[[], Awaitable[None]],
        on_backfill_needed: Callable[[], Awaitable[None]],
        on_connection_change: Callable[[bool], None] | None = None,
        connect: ConnectFn | None = None,
        ssl_context: ssl.SSLContext | None = None,
        heartbeat_timeout_s: float = NAAD_STREAM_HEARTBEAT_TIMEOUT_S,
        backoff_min_s: float = NAAD_STREAM_BACKOFF_MIN_S,
        backoff_max_s: float = NAAD_STREAM_BACKOFF_MAX_S,
        heartbeat_sender_prefix: str = NAAD_STREAM_HEARTBEAT_SENDER_PREFIX,
        logger: logging.Logger | None = None,
    ) -> None:
        self._host = host
        self._port = port
        self._on_alert_doc = on_alert_doc
        self._on_heartbeat = on_heartbeat
        self._on_backfill_needed = on_backfill_needed
        # Synchronous, unlike the other callbacks: a connection-state change only
        # flips a flag and notifies entity listeners, so making it awaitable would
        # add a suspension point to the reconnect path for no benefit.
        self._on_connection_change = on_connection_change
        self._connected = False
        self._connect = connect or self._default_connect
        self._ssl_context = ssl_context
        self._heartbeat_timeout_s = heartbeat_timeout_s
        self._backoff_min_s = backoff_min_s
        self._backoff_max_s = backoff_max_s
        self._heartbeat_sender_prefix = heartbeat_sender_prefix
        self._logger = logger or _LOGGER
        self._stopped = False
        self._writer: asyncio.StreamWriter | None = None

    async def _default_connect(
        self,
    ) -> tuple[asyncio.StreamReader, asyncio.StreamWriter]:
        ctx = self._ssl_context
        if ctx is None:
            # Building a context loads the CA bundle from disk, which must not
            # happen on the event loop. Callers embedded in an event-loop host
            # (the coordinator) inject a context built off-loop; this fallback
            # keeps the module correct standalone, and caches the result so
            # reconnects don't repeat the work.
            ctx = await asyncio.get_running_loop().run_in_executor(
                None, ssl.create_default_context
            )
            self._ssl_context = ctx
        return await asyncio.open_connection(self._host, self._port, ssl=ctx)

    @property
    def connected(self) -> bool:
        """Whether a connection is currently established and being read."""
        return self._connected

    def _set_connected(self, connected: bool) -> None:
        """Record connection state, notifying only on an actual transition.

        Edge-triggered so a reconnect storm doesn't rewrite entity state on every
        attempt — the callback lands on a diagnostic entity whose ``last_changed``
        is the point of it, and a redundant write would reset that.
        """
        if connected == self._connected:
            return
        self._connected = connected
        if self._on_connection_change is None:
            return
        try:
            self._on_connection_change(connected)
        except Exception as err:  # noqa: BLE001 — a listener must not kill the loop
            self._logger.debug("NAAD stream connection-state callback failed: %s", err)

    def stop(self) -> None:
        """Signal the run loop to stop and drop the current connection.

        Idempotent. The owning task is normally cancelled as well; this hastens
        teardown and marks the loop so it does not reconnect.
        """
        self._stopped = True
        self._close_writer()

    def _close_writer(self) -> None:
        writer = self._writer
        self._writer = None
        if writer is not None:
            try:
                writer.close()
            except Exception:  # noqa: BLE001 — best-effort teardown
                pass

    async def _aclose_writer(self, writer: asyncio.StreamWriter) -> None:
        """Close a connection and wait for the TLS shutdown to complete.

        ``close()`` alone leaves the SSL shutdown pending, which surfaces as a
        lingering-transport warning at unload; the wait is bounded so a server
        that never completes the handshake cannot stall the run loop.
        """
        self._writer = None
        try:
            writer.close()
            await asyncio.wait_for(writer.wait_closed(), timeout=_CLOSE_TIMEOUT_S)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001 — best-effort teardown
            pass

    async def run(self) -> None:
        """Connect, read, and reconnect until stopped.

        On every reconnect (i.e. any connect after the first) a GeoRSS backfill is
        requested before resuming the read loop, so alerts issued while
        disconnected are recovered. Connection and read errors are retried with
        bounded exponential backoff; cancellation propagates.

        Logging is transition-based rather than per-attempt: the first failure of
        a streak warns, recovery logs at ``info``, and everything in between stays
        at ``debug``. A silently dead socket degrades this integration to the
        30-minute resync — slow, not broken — which is exactly the failure a user
        needs to see in the log without having to enable debug first, and exactly
        the one a per-attempt logger would bury.

        Connection state is reported through ``on_connection_change`` on every
        transition, including the final one: the ``finally`` guarantees a
        disconnect is published even when the owning task is cancelled, so a
        connectivity entity cannot be left reading "connected" after teardown.
        """
        try:
            await self._run()
        finally:
            self._set_connected(False)

    async def _run(self) -> None:
        backoff = self._backoff_min_s
        first = True
        failures = 0
        while not self._stopped:
            try:
                reader, writer = await self._connect()
            except asyncio.CancelledError:
                raise
            except Exception as err:  # noqa: BLE001 — transient connect failure
                failures += 1
                if failures == 1:
                    self._logger.warning(
                        "NAAD stream: cannot connect to %s:%s (%s); retrying with "
                        "backoff. Alerts still arrive via the periodic GeoRSS "
                        "resync, but not in real time",
                        self._host,
                        self._port,
                        err,
                    )
                else:
                    self._logger.debug("NAAD stream connect failed: %s", err)
                await self._sleep_backoff(backoff)
                backoff = min(backoff * 2, self._backoff_max_s)
                continue

            if failures:
                self._logger.info(
                    "NAAD stream: connected to %s:%s after %d failed attempt(s)",
                    self._host,
                    self._port,
                    failures,
                )
                failures = 0
            else:
                self._logger.debug(
                    "NAAD stream: connected to %s:%s", self._host, self._port
                )

            self._writer = writer
            self._set_connected(True)
            if not first:
                await self._safe_backfill()
            first = False

            saw_data = False
            try:
                saw_data = await self._read_loop(reader)
            except asyncio.CancelledError:
                raise
            except Exception as err:  # noqa: BLE001 — transient read failure
                self._logger.debug("NAAD stream read error: %s", err)
            finally:
                self._set_connected(False)
                await self._aclose_writer(writer)

            if self._stopped:
                break
            # Reset the backoff only for a connection that actually delivered
            # something. A server that accepts and immediately closes never does,
            # so its delay keeps growing instead of hot-looping — and every
            # reconnect costs a full GeoRSS backfill, so the loop must not spin.
            if saw_data:
                backoff = self._backoff_min_s
            await self._sleep_backoff(backoff)
            backoff = min(backoff * 2, self._backoff_max_s)

    async def _read_loop(self, reader: asyncio.StreamReader) -> bool:
        """Read the byte stream, reassemble frames, dispatch docs.

        Returns (to trigger a reconnect) on EOF or when no bytes arrive within the
        heartbeat timeout — since heartbeats are emitted at least every 60 s, a
        read timeout doubles as the heartbeat/liveness watchdog. The return value
        reports whether this connection delivered any bytes at all, which is what
        the caller's backoff policy keys off.

        Decoding runs through an incremental decoder held for the life of the
        connection, so a multi-byte character straddling two reads survives
        intact — ECCC bodies are bilingual, so accented text is a given.
        """
        decoder = codecs.getincrementaldecoder("utf-8")("replace")
        buffer = ""
        saw_data = False
        while not self._stopped:
            try:
                chunk = await asyncio.wait_for(
                    reader.read(_READ_CHUNK), timeout=self._heartbeat_timeout_s
                )
            except asyncio.TimeoutError:
                self._logger.debug(
                    "NAAD stream: no data within %ss; reconnecting",
                    self._heartbeat_timeout_s,
                )
                return saw_data
            if not chunk:
                return saw_data  # EOF — server closed the connection
            saw_data = True
            buffer += decoder.decode(chunk)
            buffer, docs = self._extract_docs(buffer)
            for doc_str in docs:
                await self._dispatch(doc_str)
        return saw_data

    def _extract_docs(self, buffer: str) -> tuple[str, list[str]]:
        """Split complete ``<alert>…</alert>`` frames out of the buffer.

        Returns the unconsumed tail and the list of complete document strings.
        Bytes before the first ``<alert`` are discarded (framing noise / XML
        declarations); an over-long tail with no close tag is dropped to bound
        memory, and the stream re-syncs on the next frame.
        """
        docs: list[str] = []
        while True:
            start = buffer.find(_ALERT_START)
            if start == -1:
                # No frame start in view: keep only a short tail (a split
                # ``<alert`` token may straddle the next read).
                if len(buffer) > len(_ALERT_START):
                    buffer = buffer[-len(_ALERT_START) :]
                break
            end = buffer.find(_ALERT_END, start)
            if end == -1:
                buffer = buffer[start:]  # incomplete frame; wait for more
                break
            end += len(_ALERT_END)
            docs.append(buffer[start:end])
            buffer = buffer[end:]

        if len(buffer) > _MAX_BUFFER_CHARS:
            self._logger.warning(
                "NAAD stream: reassembly buffer exceeded %d characters without a "
                "complete frame; discarding and re-syncing",
                _MAX_BUFFER_CHARS,
            )
            buffer = ""
        return buffer, docs

    async def _dispatch(self, doc_str: str) -> None:
        if self._is_heartbeat(doc_str):
            await self._on_heartbeat()
        else:
            await self._on_alert_doc(doc_str)

    def _is_heartbeat(self, doc_str: str) -> bool:
        sender_m = _SENDER_RE.search(doc_str)
        if sender_m and sender_m.group(1).startswith(self._heartbeat_sender_prefix):
            return True
        status_m = _STATUS_RE.search(doc_str)
        return status_m is not None and status_m.group(1) == "System"

    async def _safe_backfill(self) -> None:
        try:
            await self._on_backfill_needed()
        except asyncio.CancelledError:
            raise
        except Exception as err:  # noqa: BLE001 — backfill must not kill the loop
            self._logger.debug("NAAD stream backfill failed: %s", err)

    async def _sleep_backoff(self, backoff: float) -> None:
        # Full jitter: sleep a random fraction of the current backoff ceiling.
        await asyncio.sleep(random.uniform(0, backoff))
