"""Demand charge tracker — monitors power and calculates peak demand."""

import logging
from datetime import datetime, time, timedelta

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_time, async_track_time_interval
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from .const import CONF_BILLING_DAY, DEFAULT_BILLING_DAY

_LOGGER = logging.getLogger(__name__)

SAMPLE_INTERVAL = timedelta(seconds=30)

# How far ahead to search for the next demand-window transition.
_SEARCH_HORIZON_DAYS = 400


def is_in_demand_window(
    now: datetime,
    window_start: time,
    window_end: time,
    days: str,
    season_months: list[int] | None,
) -> bool:
    """Check if a given datetime falls within a demand measurement window."""
    current_time = now.time()
    weekday = now.weekday()
    month = now.month

    # Day check
    if days == "weekdays" and weekday >= 5:
        return False
    if days == "weekends" and weekday < 5:
        return False

    # Season check
    if season_months and month not in season_months:
        return False

    # Time check (handle overnight windows)
    if window_start == window_end == time(0, 0):
        return True  # 00:00 to 00:00 means "any time"
    if window_start <= window_end:
        return window_start <= current_time < window_end
    else:
        return current_time >= window_start or current_time < window_end


class DemandWindowScheduler:
    """Tracks demand-window active/inactive status.

    Computes the window locally and schedules a callback at the exact
    transition instant, rather than relying on the coordinator's poll
    cadence (which is not clock-aligned and can lag the true boundary
    by up to its full update interval).
    """

    def __init__(self, hass: HomeAssistant, on_transition) -> None:
        """Initialize."""
        self.hass = hass
        self._on_transition = on_transition
        self.window_start: time | None = None
        self.window_end: time | None = None
        self.days: str | None = None
        self.season_months: list[int] | None = None
        self.is_active: bool | None = None
        self._unsub_next_transition = None

    def _load_window_config(self, demand: dict) -> bool:
        """Parse demand window config. Returns True if present."""
        if not demand:
            return False
        parts_start = demand["window_start"].split(":")
        parts_end = demand["window_end"].split(":")
        self.window_start = time(int(parts_start[0]), int(parts_start[1]))
        self.window_end = time(int(parts_end[0]), int(parts_end[1]))
        self.days = demand["days"]
        self.season_months = demand.get("season_months")
        return True

    def status_at(self, when: datetime) -> bool:
        """Return whether `when` is inside the demand window."""
        return is_in_demand_window(when, self.window_start, self.window_end, self.days, self.season_months)

    def _find_next_transition(self, now: datetime) -> datetime | None:
        """Find the exact instant the window status next flips, searching forward."""
        current_status = self.status_at(now)
        daily_boundaries = sorted({time(0, 0), self.window_start, self.window_end})

        for day_offset in range(_SEARCH_HORIZON_DAYS):
            day = (now + timedelta(days=day_offset)).date()
            for boundary in daily_boundaries:
                candidate = datetime.combine(day, boundary, tzinfo=now.tzinfo)
                if candidate <= now:
                    continue
                if self.status_at(candidate) != current_status:
                    return candidate
        return None

    @callback
    def schedule_next_transition(self) -> None:
        """Schedule a callback at the exact next window transition instant."""
        if self._unsub_next_transition:
            self._unsub_next_transition()
            self._unsub_next_transition = None

        if self.window_start is None:
            return

        now = dt_util.now()
        next_transition = self._find_next_transition(now)
        if next_transition is None:
            return

        self._unsub_next_transition = async_track_point_in_time(
            self.hass, self._async_handle_transition, next_transition
        )

    @callback
    def _async_handle_transition(self, now: datetime) -> None:
        """Handle the exact-instant window transition."""
        self.is_active = self.status_at(now)
        self._on_transition(self.is_active)
        self.schedule_next_transition()

    def start(self, demand: dict) -> None:
        """Load window config and start scheduling transitions."""
        if self._load_window_config(demand):
            self.is_active = self.status_at(dt_util.now())
            self.schedule_next_transition()

    def stop(self) -> None:
        """Cancel any pending scheduled transition."""
        if self._unsub_next_transition:
            self._unsub_next_transition()
            self._unsub_next_transition = None


class DemandTracker:
    """Tracks peak demand based on DNSP measurement methodology."""

    def __init__(
        self,
        hass: HomeAssistant,
        power_entity_id: str,
        measurement_method: str,
        window_start: str,
        window_end: str,
        days: str,
        season_months: list[int] | None,
        billing_day: int,
    ) -> None:
        """Initialize demand tracker."""
        self.hass = hass
        self.power_entity_id = power_entity_id
        self.measurement_method = measurement_method
        self.window_start = self._parse_time(window_start)
        self.window_end = self._parse_time(window_end)
        self.days = days
        self.season_months = season_months
        self.billing_day = billing_day

        # State
        self.month_peak_kw: float = 0.0
        self.previous_month_peak_kw: float = 0.0
        self.current_block_samples: list[float] = []
        self.current_block_start: datetime | None = None
        self.last_reset: datetime | None = None
        self.monthly_peaks_12: list[float] = []  # For rolling_12month_max

        # Listener handle
        self._unsub_timer = None

    @staticmethod
    def _parse_time(time_str: str) -> time:
        """Parse HH:MM to time object."""
        parts = time_str.split(":")
        return time(int(parts[0]), int(parts[1]))

    def _is_in_demand_window(self, now: datetime) -> bool:
        """Check if current datetime is within the demand measurement window."""
        return is_in_demand_window(
            now, self.window_start, self.window_end, self.days, self.season_months
        )

    def _get_block_start(self, now: datetime) -> datetime:
        """Get the start of the current clock-aligned 30-min block."""
        minute = 0 if now.minute < 30 else 30
        return now.replace(minute=minute, second=0, microsecond=0)

    def _is_new_billing_month(self, now: datetime) -> bool:
        """Check if we've crossed a billing cycle boundary."""
        if self.last_reset is None:
            return True
        # Calculate the billing reset date for the current period
        if now.day >= self.billing_day:
            reset_date = now.replace(day=self.billing_day)
        else:
            # Previous month's billing day
            first_of_month = now.replace(day=1)
            prev_month = first_of_month - timedelta(days=1)
            reset_date = prev_month.replace(day=self.billing_day)
        return self.last_reset < reset_date.replace(
            hour=0, minute=0, second=0, microsecond=0
        ) <= now

    def _reset_billing_month(self, now: datetime) -> None:
        """Reset peak demand for new billing month."""
        self.previous_month_peak_kw = self.month_peak_kw

        # Store for rolling 12-month (Jemena)
        self.monthly_peaks_12.append(self.month_peak_kw)
        if len(self.monthly_peaks_12) > 12:
            self.monthly_peaks_12 = self.monthly_peaks_12[-12:]

        self.month_peak_kw = 0.0
        self.last_reset = now
        _LOGGER.info(
            "Demand tracker billing reset. Previous peak: %.3f kW", self.previous_month_peak_kw
        )

    def _process_block(self) -> None:
        """Process a completed 30-min block and update peak if needed."""
        if not self.current_block_samples:
            return

        if self.measurement_method == "30min_avg":
            block_value = sum(self.current_block_samples) / len(self.current_block_samples)
        elif self.measurement_method == "30min_max":
            block_value = max(self.current_block_samples)
        elif self.measurement_method == "monthly_peak":
            block_value = max(self.current_block_samples)
        elif self.measurement_method == "rolling_12month_max":
            block_value = max(self.current_block_samples)
        else:
            block_value = sum(self.current_block_samples) / len(self.current_block_samples)

        if block_value > self.month_peak_kw:
            self.month_peak_kw = round(block_value, 3)
            _LOGGER.debug("New month peak demand: %.3f kW", self.month_peak_kw)

    @callback
    def _async_sample(self, now: datetime) -> None:
        """Sample the power entity and track demand."""
        # async_track_time_interval fires with `now` in UTC; window/day/month
        # checks below assume local wall-clock time, so convert first.
        now = dt_util.as_local(now)

        # Check billing month reset
        if self._is_new_billing_month(now):
            self._reset_billing_month(now)

        # Check if in demand window
        if not self._is_in_demand_window(now):
            # If we had a block in progress, process it
            if self.current_block_samples:
                self._process_block()
                self.current_block_samples = []
                self.current_block_start = None
            return

        # Read power entity
        state = self.hass.states.get(self.power_entity_id)
        if state is None or state.state in ("unknown", "unavailable"):
            return

        try:
            power_kw = float(state.state)
        except (ValueError, TypeError):
            return

        # Convert W to kW if needed
        unit = state.attributes.get("unit_of_measurement", "")
        if unit == "W":
            power_kw = power_kw / 1000.0

        # Check if we've moved to a new 30-min block
        block_start = self._get_block_start(now)
        if self.current_block_start != block_start:
            # Process previous block
            self._process_block()
            self.current_block_samples = []
            self.current_block_start = block_start

        # For monthly_peak method, just track max directly (no blocking needed)
        if self.measurement_method == "monthly_peak":
            if power_kw > self.month_peak_kw:
                self.month_peak_kw = round(power_kw, 3)
        else:
            self.current_block_samples.append(power_kw)

    @property
    def chargeable_demand(self) -> float:
        """Return the demand value used for charging."""
        if self.measurement_method == "rolling_12month_max":
            all_peaks = self.monthly_peaks_12 + [self.month_peak_kw]
            return max(all_peaks) if all_peaks else 0.0
        return self.month_peak_kw

    def start(self) -> None:
        """Start sampling."""
        self._unsub_timer = async_track_time_interval(
            self.hass, self._async_sample, SAMPLE_INTERVAL
        )
        _LOGGER.info(
            "Demand tracker started: entity=%s method=%s window=%s-%s days=%s",
            self.power_entity_id,
            self.measurement_method,
            self.window_start,
            self.window_end,
            self.days,
        )

    def stop(self) -> None:
        """Stop sampling."""
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None

    def restore_state(self, data: dict) -> None:
        """Restore state from HA storage."""
        self.month_peak_kw = data.get("month_peak_kw", 0.0)
        self.previous_month_peak_kw = data.get("previous_month_peak_kw", 0.0)
        self.monthly_peaks_12 = data.get("monthly_peaks_12", [])
        last_reset = data.get("last_reset")
        if last_reset:
            self.last_reset = datetime.fromisoformat(last_reset)

    def save_state(self) -> dict:
        """Return state for HA storage."""
        return {
            "month_peak_kw": self.month_peak_kw,
            "previous_month_peak_kw": self.previous_month_peak_kw,
            "monthly_peaks_12": self.monthly_peaks_12,
            "last_reset": self.last_reset.isoformat() if self.last_reset else None,
        }
