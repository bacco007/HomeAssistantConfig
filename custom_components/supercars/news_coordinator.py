"""Supercars news scraper coordinator."""
from __future__ import annotations

import logging
import re
from datetime import timedelta
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

NEWS_URL = "https://www.supercars.com/news"
NEWS_SCAN_INTERVAL = 300  # 5 minutes

# Article URL patterns by category
CATEGORY_PATTERNS = {
    "news": r"/news/[a-z0-9\-]+",
    "video": r"/videos/[a-z0-9\-]+",
    "podcast": r"/podcasts/[a-z0-9\-]+",
}


def _classify_url(url: str) -> str:
    if "/videos/" in url:
        return "video"
    if "/podcasts/" in url:
        return "podcast"
    return "news"


def parse_news(html: str) -> dict[str, Any]:
    """Parse articles from the supercars.com/news HTML."""
    result: dict[str, Any] = {
        "latest_headline": None,
        "latest_url": None,
        "latest_category": None,
        "articles": [],
    }

    # Extract all article links with their titles
    # Pattern matches <a href="/news/...">Title text</a> style blocks
    link_pattern = re.compile(
        r'href="((?:/news/|/videos/|/podcasts/)[^"]+)"[^>]*>\s*\n?\s*([^<]{10,200})',
        re.DOTALL,
    )

    seen_urls = set()
    articles = []

    for match in link_pattern.finditer(html):
        url_path = match.group(1).strip()
        title = re.sub(r'\s+', ' ', match.group(2)).strip()

        # Skip duplicates, empty titles, and navigation/tag links
        if not title or url_path in seen_urls:
            continue
        if len(title) < 10:
            continue
        # Skip tag pages (e.g. /news/tag/...)
        if url_path.count('/') > 3:
            pass  # deep paths are article URLs, keep them
        if re.search(r'/(tags?|category|page)/', url_path):
            continue

        seen_urls.add(url_path)
        category = _classify_url(url_path)
        articles.append({
            "title": title,
            "url": f"https://www.supercars.com{url_path}",
            "category": category,
        })

    # Deduplicate by title (same article linked multiple times on page)
    seen_titles = set()
    unique_articles = []
    for a in articles:
        key = a["title"].lower()[:60]
        if key not in seen_titles:
            seen_titles.add(key)
            unique_articles.append(a)

    # Split by category
    news_only = [a for a in unique_articles if a["category"] == "news"]
    videos_only = [a for a in unique_articles if a["category"] == "video"]
    podcasts_only = [a for a in unique_articles if a["category"] == "podcast"]

    result["articles"] = unique_articles[:10]
    result["news_articles"] = news_only[:5]
    result["video_articles"] = videos_only[:5]
    result["podcast_articles"] = podcasts_only[:5]

    if unique_articles:
        latest = unique_articles[0]
        result["latest_headline"] = latest["title"]
        result["latest_url"] = latest["url"]
        result["latest_category"] = latest["category"]

    if news_only:
        result["latest_news_headline"] = news_only[0]["title"]
        result["latest_news_url"] = news_only[0]["url"]

    return result


class NewsCoordinator(DataUpdateCoordinator):
    """Polls supercars.com/news for the latest articles."""

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_news",
            update_interval=timedelta(seconds=NEWS_SCAN_INTERVAL),
        )
        self._session: aiohttp.ClientSession | None = None

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            if self._session is None or self._session.closed:
                self._session = aiohttp.ClientSession(
                    headers={"User-Agent": "Mozilla/5.0 (HomeAssistant Supercars Integration)"}
                )

            async with self._session.get(
                NEWS_URL, timeout=aiohttp.ClientTimeout(total=15)
            ) as resp:
                resp.raise_for_status()
                html = await resp.text()

        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error fetching Supercars news: {err}") from err

        return parse_news(html)
