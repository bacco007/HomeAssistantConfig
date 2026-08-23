"""Release-label date arithmetic, shared by the crawler and the integration.

This file exists twice, byte for byte: ``tools/schedule.py`` and
``custom_components/breakage_radar/schedule.py``, the same arrangement as
``rules_engine.py`` and guarded by the same kind of test. The integration has
to ship self-contained (``"requirements": []``) and ``tools/`` has to run
without the integration installed, so the module is vendored rather than
imported across the boundary.
"""

from __future__ import annotations

from datetime import date, timedelta

MONTH_NAMES = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)


def release_estimated_date(release: str) -> date | None:
    """Expected date of a release label, or None if it cannot be parsed.

    Home Assistant releases on the first Wednesday of every month
    (home-assistant.io/faq/release/), which matched all eight 2026 releases
    exactly. A rescheduled release would shift this; ``broken_now`` is decided
    by version comparison instead, so it never depends on the estimate.
    """
    parts = release.split(".")
    if len(parts) < 2:
        return None
    try:
        first = date(int(parts[0]), int(parts[1]), 1)
    except ValueError:
        return None
    return first + timedelta(days=(2 - first.weekday()) % 7)


def days_until(release: str, today: date) -> int | None:
    """Days from ``today`` to the release's estimated date; negative once it
    has shipped, None when the label does not map to a date."""
    when = release_estimated_date(release)
    if when is None:
        return None
    return (when - today).days


def long_date(when: date) -> str:
    """``7 October 2026`` -- how the board and the feed write a date."""
    return f"{when.day} {MONTH_NAMES[when.month - 1]} {when.year}"


def describe_when(release: str, days: int | None) -> str:
    """Human phrasing for a deadline: 'May 2027, about 8 months away'."""
    when = release_estimated_date(release)
    month = f"{MONTH_NAMES[when.month - 1]} {when.year}" if when else release
    if days is None:
        return month
    if days < 0:
        return f"{month}, already released"
    if days == 0:
        return f"{month}, today"
    if days == 1:
        return f"{month}, tomorrow"
    if days < 45:
        return f"{month}, about {days} days away"
    months = round(days / 30.4)
    if months < 12:
        return f"{month}, about {months} months away"
    years = days / 365.25
    if years < 1.25:
        return f"{month}, about a year away"
    return f"{month}, about {years:.1f} years away".replace(".0 ", " ")
