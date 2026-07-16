"""Results engine for Football Hub."""

from __future__ import annotations

from typing import Any

from .helpers import clean_fixture, is_finished, sort_by_time


def all_results(raw_fixtures: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return all completed fixtures as clean objects."""
    matches = [m for m in raw_fixtures or [] if is_finished(m)]
    return [clean_fixture(m) for m in sort_by_time(matches, reverse=True)]


def latest(raw_fixtures: list[dict[str, Any]], limit: int = 10) -> list[dict[str, Any]]:
    """Return latest completed fixtures."""
    return all_results(raw_fixtures)[:limit]


def last_result(raw_fixtures: list[dict[str, Any]]) -> dict[str, Any]:
    """Return most recent completed fixture."""
    results = all_results(raw_fixtures)
    return results[0] if results else {}
