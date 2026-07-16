"""Fixtures engine for Football Hub."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from .helpers import clean_fixture, fixture_timestamp, is_not_started, now_timestamp, sort_by_time


def upcoming(raw_fixtures: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return all upcoming fixtures as clean objects."""
    current = now_timestamp()
    matches = [m for m in raw_fixtures or [] if is_not_started(m) and fixture_timestamp(m) >= current]
    return [clean_fixture(m) for m in sort_by_time(matches)]


def next_fixture(raw_fixtures: list[dict[str, Any]]) -> dict[str, Any]:
    """Return next upcoming fixture."""
    items = upcoming(raw_fixtures)
    return items[0] if items else {}


def today(raw_fixtures: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return today's upcoming fixtures."""
    now = datetime.now(timezone.utc)
    start = int(datetime(now.year, now.month, now.day, tzinfo=timezone.utc).timestamp())
    end = int((datetime(now.year, now.month, now.day, tzinfo=timezone.utc) + timedelta(days=1)).timestamp())
    matches = [m for m in raw_fixtures or [] if start <= fixture_timestamp(m) < end and is_not_started(m)]
    return [clean_fixture(m) for m in sort_by_time(matches)]


def this_week(raw_fixtures: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return upcoming fixtures in the next 7 days."""
    start = now_timestamp()
    end = start + 7 * 24 * 60 * 60
    matches = [m for m in raw_fixtures or [] if start <= fixture_timestamp(m) <= end and is_not_started(m)]
    return [clean_fixture(m) for m in sort_by_time(matches)]
