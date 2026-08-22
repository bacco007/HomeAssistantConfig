"""Shared LRU cache for immutable CAP XML document bodies."""

from __future__ import annotations

import asyncio
import logging
import sys
from collections import OrderedDict

import aiohttp

_LOGGER = logging.getLogger(__name__)

# Memory budget for the process-wide body cache, not an entry count.
#
# An entry count cannot bound memory here, because CAP body size varies by two
# orders of magnitude across sources: sampled 2026-08-04, cn-cma-xx bodies
# average 88.9 KiB and peak at 520 KiB, while a typical NWS or MeteoAlarm body
# is a few KiB. The previous ``max_entries=256`` was therefore simultaneously
# too large (≈22 MiB of CMA XML) and far too small to be useful: cn-cma-xx
# needs 501 distinct URLs per poll, so a single poll evicted its own earliest
# entries before finishing and every subsequent poll re-fetched all 501 from
# cold — ~32 s, past the 30 s default timeout, so the entry never completed an
# update. Being shared domain-wide, it also evicted every other entry's bodies.
#
# 64 MiB holds cn-cma-xx's full working set (~44 MiB) with room for the other
# entries, and bounds worst-case growth regardless of how large a body gets.
DEFAULT_MAX_BYTES = 64 * 1024 * 1024


class CAPContentCache:
    """LRU cache for CAP XML bodies with Future-based in-flight coalescing.

    CAP files are immutable per URL (each revision gets a new URL), so a
    successful fetch is cached indefinitely until evicted under memory
    pressure. Two concurrent callers for the same URL share one HTTP GET via
    the ``_inflight`` dict.

    Eviction is LRU against a **byte budget** (``max_bytes``), measured with
    ``sys.getsizeof`` so the bound tracks real memory rather than a character
    count — CAP bodies are largely non-ASCII for several sources, where a
    Python ``str`` costs well over one byte per character.
    """

    def __init__(self, max_bytes: int = DEFAULT_MAX_BYTES) -> None:
        self._max_bytes = max_bytes
        self._cache: OrderedDict[str, str] = OrderedDict()
        self._sizes: dict[str, int] = {}
        self._total_bytes = 0
        self._inflight: dict[str, asyncio.Future[str | None]] = {}

    @property
    def total_bytes(self) -> int:
        """Current cached payload size, for diagnostics and tests."""
        return self._total_bytes

    def __len__(self) -> int:
        return len(self._cache)

    def _store(self, url: str, body: str) -> None:
        """Insert ``body`` and evict least-recently-used entries over budget.

        A body larger than the whole budget is not cached at all — storing it
        would evict everything else and then be evicted itself on the next
        insert, which is strictly worse than a miss.
        """
        size = sys.getsizeof(body)
        if size > self._max_bytes:
            _LOGGER.debug(
                "CAP body for %s is %d bytes, over the %d byte cache budget; not caching",
                url,
                size,
                self._max_bytes,
            )
            return
        if url in self._cache:
            self._total_bytes -= self._sizes.pop(url, 0)
        self._cache[url] = body
        self._sizes[url] = size
        self._total_bytes += size
        self._cache.move_to_end(url)
        while self._total_bytes > self._max_bytes and self._cache:
            oldest, _ = self._cache.popitem(last=False)
            self._total_bytes -= self._sizes.pop(oldest, 0)

    async def get_or_fetch(
        self,
        session: aiohttp.ClientSession,
        url: str,
        *,
        user_agent: str | None = None,
    ) -> str | None:
        """Return cached body for URL, fetching on miss.

        Returns None on HTTP error, network error, or timeout.  Logs a
        warning at most once per URL per cache instance.
        """
        if url in self._cache:
            self._cache.move_to_end(url)
            return self._cache[url]

        if url in self._inflight:
            return await self._inflight[url]

        loop = asyncio.get_running_loop()
        fut: asyncio.Future[str | None] = loop.create_future()
        self._inflight[url] = fut

        result: str | None = None
        try:
            headers: dict[str, str] = {}
            if user_agent:
                headers["User-Agent"] = user_agent
            timeout = aiohttp.ClientTimeout(total=10)
            async with session.get(url, headers=headers, timeout=timeout) as resp:
                if resp.status != 200:
                    _LOGGER.warning("CAP fetch HTTP %s for %s", resp.status, url)
                else:
                    result = await resp.text()
            if result is not None:
                self._store(url, result)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            _LOGGER.warning("CAP fetch failed for %s: %s", url, exc)
        finally:
            if not fut.done():
                fut.set_result(result)
            self._inflight.pop(url, None)

        return result
