"""Rolling counters that HAUS maintains for itself.

There is no history for "notifications sent" without the recorder, and querying
the recorder on the event loop is not an option. So HAUS tallies the events as
they happen and keeps a rolling window on disk.
"""

from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    SCORE_HISTORY_WEEKS,
    STORAGE_KEY,
    STORAGE_VERSION,
    STORE_SAVE_DELAY_SECONDS,
    USAGE_WINDOW_DAYS,
)


class HausStore:
    """Persisted counters behind the usage and users pillars."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise the store without touching disk."""
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._notify_by_day: dict[str, int] = {}
        self._actions_by_day: dict[str, dict[str, int]] = {}
        self._score_by_week: dict[str, int] = {}
        self._started: date | None = None

    async def async_load(self) -> None:
        """Load the counters, starting the history clock on first use.

        History is measured from when HAUS started watching rather than from the
        first notification, so a quiet house still accrues history and leaves
        the neutral start behind.
        """
        data = await self._store.async_load()
        if data:
            self._notify_by_day = {
                day: int(count)
                for day, count in dict(data.get("notify_by_day", {})).items()
            }
            self._actions_by_day = {
                day: {user: int(count) for user, count in dict(users).items()}
                for day, users in dict(data.get("actions_by_day", {})).items()
            }
            self._score_by_week = {
                week: int(score)
                for week, score in dict(data.get("score_by_week", {})).items()
            }
            started = data.get("started")
            self._started = date.fromisoformat(started) if started else None
        if self._started is None:
            self._started = dt_util.utcnow().date()

    def _as_dict(self) -> dict[str, Any]:
        """Return the JSON-serialisable form of the counters."""
        return {
            "started": self._started.isoformat() if self._started else None,
            "notify_by_day": self._notify_by_day,
            "actions_by_day": self._actions_by_day,
            "score_by_week": self._score_by_week,
        }

    async def async_remove(self) -> None:
        """Delete the stored counters.

        Called when the config entry is removed. Remove should mean removed,
        including the per-user tallies - nothing of HAUS's should outlive it on
        disk. The cost is that reinstalling starts the rolling windows over,
        which the README says out loud.
        """
        await self._store.async_remove()

    async def async_save(self) -> None:
        """Write the counters out now."""
        await self._store.async_save(self._as_dict())

    def record_notification(self, when: datetime) -> None:
        """Tally one notification service call."""
        day = when.date().isoformat()
        self._notify_by_day[day] = self._notify_by_day.get(day, 0) + 1
        self._prune(when)
        self._store.async_delay_save(self._as_dict, STORE_SAVE_DELAY_SECONDS)

    def record_action(self, user_id: str, when: datetime) -> None:
        """Tally one action attributed to a user.

        Per-user counts are kept so the household detail card can ask for them
        over an admin-checked websocket command. They never reach a state
        attribute, and only the aggregate drives the score.
        """
        day = when.date().isoformat()
        by_user = self._actions_by_day.setdefault(day, {})
        by_user[user_id] = by_user.get(user_id, 0) + 1
        self._prune(when)
        self._store.async_delay_save(self._as_dict, STORE_SAVE_DELAY_SECONDS)

    def users_active_within(self, days: int, now: datetime) -> int:
        """Return how many distinct users acted inside the last `days`."""
        cutoff = (now - timedelta(days=days)).date()
        active: set[str] = set()
        for day, by_user in self._actions_by_day.items():
            if date.fromisoformat(day) > cutoff:
                active.update(by_user)
        return len(active)

    def user_action_counts(self, days: int, now: datetime) -> dict[str, int]:
        """Return per-user action totals inside the last `days`.

        Only the household detail card uses this, over an admin-checked
        websocket command and only when the user has opted in. It never reaches
        a state attribute.
        """
        cutoff = (now - timedelta(days=days)).date()
        totals: dict[str, int] = {}
        for day, by_user in self._actions_by_day.items():
            if date.fromisoformat(day) <= cutoff:
                continue
            for user_id, count in by_user.items():
                totals[user_id] = totals.get(user_id, 0) + count
        return totals

    def user_last_active(self) -> dict[str, str]:
        """Return the most recent day each user acted, as an ISO date."""
        latest: dict[str, str] = {}
        for day, by_user in self._actions_by_day.items():
            for user_id in by_user:
                if user_id not in latest or day > latest[user_id]:
                    latest[user_id] = day
        return latest

    @staticmethod
    def week_key(when: datetime) -> str:
        """Return the ISO year-and-week key a moment belongs to."""
        year, week, _ = when.isocalendar()
        return f"{year}-W{week:02d}"

    def record_score(self, score: int, when: datetime) -> None:
        """Snapshot the score for the week it falls in.

        The coordinator runs every five minutes; one point per week is all the
        sparkline needs, so the latest score in a week is the one kept.
        """
        self._score_by_week[self.week_key(when)] = score
        self._score_by_week = dict(
            sorted(self._score_by_week.items())[-SCORE_HISTORY_WEEKS:]
        )
        self._store.async_delay_save(self._as_dict, STORE_SAVE_DELAY_SECONDS)

    def score_history(self, weeks: int) -> list[dict[str, Any]]:
        """Return up to `weeks` weekly snapshots, oldest first."""
        return [
            {"week": week, "score": score}
            for week, score in sorted(self._score_by_week.items())[-weeks:]
        ]

    def _prune(self, now: datetime) -> None:
        """Drop days that have fallen out of the rolling window."""
        cutoff = (now - timedelta(days=USAGE_WINDOW_DAYS)).date()
        self._notify_by_day = {
            day: count
            for day, count in self._notify_by_day.items()
            if date.fromisoformat(day) > cutoff
        }
        self._actions_by_day = {
            day: by_user
            for day, by_user in self._actions_by_day.items()
            if date.fromisoformat(day) > cutoff
        }

    def notifications_in_window(self, now: datetime) -> int:
        """Return notifications sent inside the rolling window."""
        cutoff = (now - timedelta(days=USAGE_WINDOW_DAYS)).date()
        return sum(
            count
            for day, count in self._notify_by_day.items()
            if date.fromisoformat(day) > cutoff
        )

    def history_days(self, now: datetime) -> int:
        """Return how many days of tally history exist."""
        if self._started is None:
            return 0
        return max(0, (now.date() - self._started).days)
