"""Schedule and time range logic."""
from __future__ import annotations

import datetime

from .const import CONF_DISABLED, CONF_FROM, CONF_TO


class TimeRange:
    """Time range with start and end (since "from" is a reserved word)."""

    def __init__(self, start: str, end: str, disabled: bool) -> None:
        """Initialize the object."""
        self.start: datetime.time = datetime.time.fromisoformat(start)
        self.end: datetime.time = datetime.time.fromisoformat(end)
        self.disabled = disabled

    @property
    def enabled(self) -> bool:
        """Return if time range is enabled."""
        return not self.disabled

    def containing(self, time: datetime.time) -> bool:
        """Check if the time is inside the range."""
        if self.disabled:
            return False

        # If the range crosses the day boundary.
        if self.end <= self.start:
            return self.start <= time or time < self.end

        return self.start <= time < self.end

    def to_dict(self) -> dict[str, str]:
        """Serialize the object as a dict."""
        return {
            **{
                CONF_FROM: self.start.isoformat(),
                CONF_TO: self.end.isoformat(),
            },
            **({CONF_DISABLED: True} if self.disabled else {}),
        }

    def to_str(self) -> str:
        """Serialize the object as a string."""
        return f"{self.start.isoformat()} - {self.end.isoformat()}"


class Schedule:
    """List of TimeRange."""

    def __init__(self, schedule: list[dict[str, str]]) -> None:
        """Create a list of TimeRanges representing the schedule."""
        self._schedule = [
            TimeRange(
                time_range[CONF_FROM],
                time_range[CONF_TO],
                time_range.get(CONF_DISABLED, False),
            )
            for time_range in schedule
        ]
        if not self._schedule:
            return
        self._schedule.sort(key=lambda time_range: time_range.start)
        self._validate()
        self._to_on = [
            time_range.start for time_range in self._schedule if time_range.enabled
        ]
        # Remove "on to on" transitions of adjusted time ranges (as state doesn't cahnge to off).
        self._to_off = sorted(
            {time_range.end for time_range in self._schedule if time_range.enabled}
            - set(self._to_on)
        )

    def _validate(self) -> None:
        """Validate the schedule."""
        # An empty schedule or a schedule with a single entry is always valid.
        if len(self._schedule) <= 1:
            return

        # Check all except the last time range of the schedule.
        for i in range(len(self._schedule) - 1):
            # The end time should be greater than the start time.
            if not self._schedule[i].end > self._schedule[i].start:
                raise ValueError(
                    f"'{self._schedule[i].to_str()}' length is "
                    + (
                        "zero."
                        if self._schedule[i].end == self._schedule[i].start
                        else "negative."
                    )
                )

            # Check that the time range doesn't overlap with the next one.
            # Note that adjusted time ranges are allowed.
            if self._schedule[i].end > self._schedule[i + 1].start:
                raise ValueError(
                    f"'{self._schedule[i].to_str()}' overlaps "
                    f"'{self._schedule[i + 1].to_str()}'."
                )

        # Check the last time range.
        if self._schedule[-1].end <= self._schedule[-1].start:
            # If it crosses the day boundary, check overlap with 1st range.
            if self._schedule[-1].end > self._schedule[0].start:
                raise ValueError(
                    f"'{self._schedule[-1].to_str()}' overlaps "
                    f"'{self._schedule[0].to_str()}'."
                )

    def containing(self, time: datetime.time) -> bool:
        """Check if the time is inside the range."""
        for time_range in self._schedule:
            if time_range.containing(time):
                return True
        return False

    def to_list(self) -> list[dict[str, str]]:
        """Serialize the object as a list."""
        return [time_range.to_dict() for time_range in self._schedule]

    def next_update(self, date: datetime.datetime) -> datetime.datetime | None:
        """Schedule a timer for the point when the state should be changed."""
        if not self._schedule:
            return None

        timestamps = self._to_off if self.containing(date.time()) else self._to_on
        if not timestamps:
            # If time ranges cover the entire day (the subtraction result is empty).
            return None

        time = date.time()
        prev = datetime.time()  # Midnight.
        today = date.date()

        # Find the smallest timestamp which is bigger than time.
        for current in timestamps:
            if prev <= time < current:
                return datetime.datetime.combine(today, current, tzinfo=date.tzinfo)
            prev = current

        # Time is bigger than all timestamps. Use tomorrow's 1st timestamp.
        return datetime.datetime.combine(
            today + datetime.timedelta(days=1), timestamps[0], tzinfo=date.tzinfo
        )
