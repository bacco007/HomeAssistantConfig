"""Helpers for extracting data from the supercars.com Next.js App Router SPA.

The site fetches championship/results data client-side, so plain HTML scraping
typically yields nothing. These helpers cover three scenarios:

  1. Server-rendered Pages Router data — `__NEXT_DATA__` JSON blob.
  2. Server-rendered App Router data — `self.__next_f.push([1, "<flight>"])`
     chunks; data may appear inside flight payloads when the page is fully
     SSR'd.
  3. Embedded `<script type="application/json">` blocks (some CMS templates).

Plus a thin wrapper for RSC (`RSC: 1`) fetches that ask Next.js for the raw
flight payload directly.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Callable, Iterable

import aiohttp

_LOGGER = logging.getLogger(__name__)


# ── Flight chunk decoding ─────────────────────────────────────────────────────

_NEXT_F_PUSH_RE = re.compile(
    r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)'
)
_CHUNK_PREFIX_RE = re.compile(r"^[0-9a-f]+:")


def iter_next_f_chunks(html: str) -> Iterable[Any]:
    """Yield JSON-decoded payloads from `self.__next_f.push([1, "..."])`.

    Each push carries a flight chunk: a leading hex index, a single-letter
    type marker (`I` for module imports, none for data), then a JSON value.
    Import chunks are skipped; data chunks are JSON-decoded and yielded.
    """
    for match in _NEXT_F_PUSH_RE.finditer(html):
        raw = match.group(1)
        # raw is the inner string of a JSON string literal — re-decode escapes
        try:
            decoded = json.loads(f'"{raw}"')
        except json.JSONDecodeError:
            continue
        body = _CHUNK_PREFIX_RE.sub("", decoded.lstrip(), count=1).strip()
        if not body or body.startswith("I["):
            continue  # module import chunk, no data
        try:
            yield json.loads(body)
        except json.JSONDecodeError:
            continue


# ── HTML extraction ───────────────────────────────────────────────────────────

_NEXT_DATA_RE = re.compile(
    r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>\s*(\{.*?\})\s*</script>',
    re.DOTALL | re.IGNORECASE,
)
_WINDOW_STATE_RES = (
    re.compile(
        r"window\.__(?:INITIAL|PRELOADED)_STATE__\s*=\s*(\{.+?\})(?:;|\s*<)",
        re.DOTALL,
    ),
    re.compile(r"window\.__STATE__\s*=\s*(\{.+?\})(?:;|\s*<)", re.DOTALL),
)
_APP_JSON_SCRIPT_RE = re.compile(
    r'<script[^>]+type=["\']application/json["\'][^>]*>\s*(\{.*?\})\s*</script>',
    re.DOTALL | re.IGNORECASE,
)


def iter_html_json_blobs(html: str) -> Iterable[Any]:
    """Yield every JSON value embedded in *html*, in priority order.

    Order: __NEXT_DATA__, window.__*STATE__, application/json scripts,
    Next.js App Router flight chunks.
    """
    if (m := _NEXT_DATA_RE.search(html)):
        try:
            yield json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    for pattern in _WINDOW_STATE_RES:
        for m in pattern.finditer(html):
            try:
                yield json.loads(m.group(1))
            except json.JSONDecodeError:
                continue

    for m in _APP_JSON_SCRIPT_RE.finditer(html):
        try:
            yield json.loads(m.group(1))
        except json.JSONDecodeError:
            continue

    yield from iter_next_f_chunks(html)


# ── Generic JSON tree search ──────────────────────────────────────────────────

def search_json(
    obj: Any,
    matcher: Callable[[Any], Any | None],
    *,
    depth: int = 0,
    max_depth: int = 14,
) -> Any | None:
    """Recursively search *obj*, returning the first non-None matcher result.

    *matcher* is called on every node (dicts, lists, scalars). Return a
    truthy value to stop the search.
    """
    if depth > max_depth:
        return None

    found = matcher(obj)
    if found is not None:
        return found

    if isinstance(obj, dict):
        for value in obj.values():
            result = search_json(value, matcher, depth=depth + 1, max_depth=max_depth)
            if result is not None:
                return result
    elif isinstance(obj, list):
        for item in obj:
            result = search_json(item, matcher, depth=depth + 1, max_depth=max_depth)
            if result is not None:
                return result

    return None


# ── RSC fetch ─────────────────────────────────────────────────────────────────

async def fetch_rsc(
    session: aiohttp.ClientSession,
    url: str,
    *,
    timeout: float = 15.0,
) -> str | None:
    """Fetch *url* with RSC headers, returning the flight payload as text.

    Next.js App Router servers reply with `text/x-component` when the
    `RSC: 1` header is present. Returns None on any failure.
    """
    try:
        async with session.get(
            url,
            headers={
                "RSC": "1",
                "Accept": "text/x-component, */*;q=0.1",
                "Next-Url": "/" + url.rsplit("/", 1)[-1],
            },
            timeout=aiohttp.ClientTimeout(total=timeout),
        ) as resp:
            if resp.status != 200:
                return None
            return await resp.text()
    except Exception as err:  # pylint: disable=broad-except
        _LOGGER.debug("RSC fetch failed for %s: %s", url, err)
        return None


def iter_rsc_chunks(payload: str) -> Iterable[Any]:
    """Decode an RSC flight stream into JSON values.

    The stream is a sequence of `<index>:<json>\\n` lines (with `I[...]`
    import markers interleaved). Yields JSON-decoded data chunks.
    """
    for line in payload.splitlines():
        line = line.strip()
        if not line:
            continue
        body = _CHUNK_PREFIX_RE.sub("", line, count=1).strip()
        if not body or body.startswith("I["):
            continue
        try:
            yield json.loads(body)
        except json.JSONDecodeError:
            continue
