"""Persistent learning state for ws_core v1.2.0.

Stores long-running adaptive calibration biases, forecast skill scores,
growing degree day season totals, streak counters, and 30-day climatology.
All data is persisted to HA storage so it survives restarts.

Design principles:
  - Never auto-applies calibration corrections (user must call service).
  - Graceful degradation: missing/corrupt store → start fresh, no errors.
  - Stateless algorithms (EMA, Brier) live here; coordinator calls into them.
"""

from __future__ import annotations

import logging
import math
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any

_LOGGER = logging.getLogger(__name__)

LEARNING_SCHEMA_VERSION = 2  # v0.3.0: removed METAR bias fields, GDD season tracking
EMA_ALPHA = 0.05  # ~20 observations halflife
# v0.3.0: removed MIN_SAMPLES_MEDIUM, MIN_SAMPLES_HIGH (METAR bias confidence thresholds)


# ---------------------------------------------------------------------------
# State dataclass
# ---------------------------------------------------------------------------


@dataclass
class LearningState:
    """All persistent learned state for one ws_core entry.

    v0.3.0: removed METAR-related bias EMAs (temp_bias_*, pressure_bias_*)
    and GDD season tracking (gdd_season_*). Schema bumped to v2 — old
    state files are discarded on load.
    """

    schema_version: int = LEARNING_SCHEMA_VERSION

    # Forecast skill (Brier score per source, rolling 90 d)
    # Each entry: {ts, outcome, local_prob, openmeteo_prob}
    forecast_outcomes: list = field(default_factory=list)
    blend_local: float = 0.5
    blend_openmeteo: float = 0.5

    # Solar lux-to-irradiance factor
    solar_lux_factor: float = 126.0
    solar_factor_n: int = 0

    # Streak counters (kept; backed by RestoreEntity in v0.3.0)
    dry_streak_days: int = 0
    dry_streak_last_rain_date: str = ""
    heat_streak_days: int = 0
    heat_streak_last_hot_date: str = ""
    frost_streak_days: int = 0
    frost_streak_last_frost_date: str = ""

    # Rolling 30-day climatology buffer
    # Each entry: {date, t_high, t_low, rain_total}
    climatology_days: list = field(default_factory=list)

    # v1.3.0 — Canadian FWI moisture codes (persist across HA restarts)
    # Standard initial values per Van Wagner 1987 (start-of-season defaults)
    fwi_ffmc: float = 85.0
    fwi_dmc: float = 6.0
    fwi_dc: float = 15.0
    fwi_last_date: str = ""  # ISO date string of last FWI daily computation

    # Internal: last time we pushed a 6h forecast outcome window
    _last_outcome_window: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> LearningState:
        if not data:
            return cls()
        version = data.get("schema_version", 0)
        if version != LEARNING_SCHEMA_VERSION:
            _LOGGER.warning(
                "ws_core learning state schema v%s != current v%s — starting fresh",
                version,
                LEARNING_SCHEMA_VERSION,
            )
            return cls()
        known = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        kwargs = {k: v for k, v in data.items() if k in known}
        return cls(**kwargs)


# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------


async def async_load_learning(store) -> LearningState:
    """Load state from HA storage; return fresh state if missing/corrupt."""
    try:
        data = await store.async_load()
        return LearningState.from_dict(data or {})
    except Exception as exc:
        _LOGGER.warning("ws_core: failed to load learning state (%s) — starting fresh", exc)
        return LearningState()


async def async_save_learning(store, state: LearningState) -> None:
    """Persist state to HA storage."""
    try:
        await store.async_save(state.to_dict())
    except Exception as exc:
        _LOGGER.warning("ws_core: failed to save learning state: %s", exc)


# ---------------------------------------------------------------------------
# EMA calibration helpers
# ---------------------------------------------------------------------------


def update_ema(current: float | None, new_value: float, alpha: float = EMA_ALPHA) -> float:
    """Exponential moving average update."""
    if current is None:
        return new_value
    return alpha * new_value + (1.0 - alpha) * current


# ---------------------------------------------------------------------------
# Brier skill scoring (A3)
# ---------------------------------------------------------------------------

BRIER_WINDOW_DAYS = 90


def _prune_old_outcomes(outcomes: list) -> list:
    cutoff = datetime.now(UTC) - timedelta(days=BRIER_WINDOW_DAYS)
    fresh = []
    for o in outcomes:
        try:
            ts = datetime.fromisoformat(o["ts"])
            if ts >= cutoff:
                fresh.append(o)
        except (KeyError, ValueError, TypeError):
            pass
    return fresh


def brier_score(outcomes: list, source_key: str) -> float | None:
    """Rolling Brier score for one probability source.  Lower = better."""
    scores = []
    for o in outcomes:
        try:
            prob = o.get(source_key)
            if prob is None:
                continue
            outcome = float(o["outcome"])
            scores.append((float(prob) / 100.0 - outcome) ** 2)
        except (KeyError, ValueError, TypeError):
            continue
    if len(scores) < 10:
        return None
    return round(sum(scores) / len(scores), 4)


def compute_blend_weights(outcomes: list) -> tuple[float, float]:
    """Softmax-derived blend weights from Brier scores; lower BS → higher weight."""
    bs_local = brier_score(outcomes, "local_prob")
    bs_api = brier_score(outcomes, "openmeteo_prob")
    if bs_local is None or bs_api is None:
        return 0.5, 0.5
    # Skill = (1 - BS); softmax normalisation
    skill_l = max(0.0, 1.0 - bs_local)
    skill_a = max(0.0, 1.0 - bs_api)
    total = skill_l + skill_a
    if total < 1e-6:
        return 0.5, 0.5
    w_l = round(skill_l / total, 3)
    w_a = round(1.0 - w_l, 3)
    return w_l, w_a


def record_forecast_outcome(
    state: LearningState, local_prob: float | None, openmeteo_prob: float | None, rained: bool
) -> None:
    """Append a verified 6h outcome window and update blend weights."""
    state.forecast_outcomes.append(
        {
            "ts": datetime.now(UTC).isoformat(),
            "outcome": 1 if rained else 0,
            "local_prob": local_prob,
            "openmeteo_prob": openmeteo_prob,
        }
    )
    state.forecast_outcomes = _prune_old_outcomes(state.forecast_outcomes)
    state.blend_local, state.blend_openmeteo = compute_blend_weights(state.forecast_outcomes)


# ---------------------------------------------------------------------------
# Solar lux factor update (A4)
# ---------------------------------------------------------------------------


def update_solar_lux_factor(
    current_factor: float,
    lux: float,
    sun_elevation_deg: float,
    beta: float = 0.02,
    factor_min: float = 80.0,
    factor_max: float = 200.0,
) -> float:
    """Update the learned lux→W/m² factor on a clear day near solar noon.

    Args:
        current_factor: current learned factor (lux per W/m²)
        lux: measured illuminance in lux
        sun_elevation_deg: current solar elevation in degrees
        beta: adaptation rate (0.02 ≈ very slow, ~50 day halflife)
    Returns:
        Updated factor, clamped to [factor_min, factor_max]
    """
    if lux <= 0 or sun_elevation_deg <= 10:
        return current_factor
    # Theoretical clear-sky irradiance (Kasten-Young simplified)
    zenith_rad = math.radians(90.0 - sun_elevation_deg)
    cos_z = math.cos(zenith_rad)
    if cos_z <= 0:
        return current_factor
    try:
        am = 1.0 / (cos_z + 0.50572 * max(0.1, (96.07995 - (90.0 - sun_elevation_deg))) ** -1.6364)
        am = min(am, 38.0)
    except (ValueError, ZeroDivisionError):
        return current_factor
    theoretical_wm2 = 1353.0 * 0.7 ** (am**0.678)
    if theoretical_wm2 < 50.0:
        return current_factor
    # Implied factor = lux / theoretical_wm2
    implied_factor = lux / theoretical_wm2
    if not (factor_min * 0.5 <= implied_factor <= factor_max * 2.0):
        return current_factor  # outlier — ignore
    new_factor = beta * implied_factor + (1.0 - beta) * current_factor
    return round(max(factor_min, min(factor_max, new_factor)), 2)


# ---------------------------------------------------------------------------
# GDD accumulation helper (B4)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Streak & GDD daily update (B4/B5)  — called once per day at midnight
# ---------------------------------------------------------------------------


def update_daily_streaks(
    state: LearningState,
    date_str: str,
    t_high: float | None,
    t_low: float | None,
    rain_today_mm: float,
    thresh_heat_c: float,
    thresh_freeze_c: float,
) -> None:
    """Update streak counters for the given calendar date.

    v0.3.0: GDD season accumulation removed (degree-days were cut entirely).
    Only streak counters (dry/heat/frost) are updated here.
    """

    # ── Dry streak ──────────────────────────────────────────────────────────
    if rain_today_mm < 1.0:
        if state.dry_streak_last_rain_date != date_str:
            state.dry_streak_days += 1
    else:
        state.dry_streak_days = 0
        state.dry_streak_last_rain_date = date_str

    # ── Heat streak ──────────────────────────────────────────────────────────
    if t_high is not None and t_high > thresh_heat_c:
        if state.heat_streak_last_hot_date != date_str:
            state.heat_streak_days += 1
            state.heat_streak_last_hot_date = date_str
    else:
        state.heat_streak_days = 0

    # ── Frost streak ─────────────────────────────────────────────────────────
    if t_low is not None and t_low <= thresh_freeze_c:
        if state.frost_streak_last_frost_date != date_str:
            state.frost_streak_days += 1
            state.frost_streak_last_frost_date = date_str
    else:
        state.frost_streak_days = 0


# ---------------------------------------------------------------------------
# Climatology (D1)
# ---------------------------------------------------------------------------

CLIMATOLOGY_WINDOW = 30


def update_climatology(
    state: LearningState,
    date_str: str,
    t_high: float | None,
    t_low: float | None,
    rain_today_mm: float,
) -> None:
    """Add or update today's climatology record; prune to 30 days."""
    if t_high is None or t_low is None:
        return
    # Replace today's entry if already present; otherwise append
    existing = next((i for i, d in enumerate(state.climatology_days) if d.get("date") == date_str), None)
    record = {"date": date_str, "t_high": t_high, "t_low": t_low, "rain_total": rain_today_mm}
    if existing is not None:
        state.climatology_days[existing] = record
    else:
        state.climatology_days.append(record)
    # Keep sorted, prune to window
    state.climatology_days.sort(key=lambda x: x.get("date", ""))
    state.climatology_days = state.climatology_days[-CLIMATOLOGY_WINDOW:]


def climatology_stats(state: LearningState) -> dict[str, Any] | None:
    """Compute rolling 30-day statistics from stored climatology records."""
    days = state.climatology_days
    if len(days) < 2:
        return None
    highs = [d["t_high"] for d in days if d.get("t_high") is not None]
    lows = [d["t_low"] for d in days if d.get("t_low") is not None]
    rains = [d["rain_total"] for d in days if d.get("rain_total") is not None]
    if not highs:
        return None
    return {
        "n_days": len(days),
        "temp_high_avg": round(sum(highs) / len(highs), 1),
        "temp_low_avg": round(sum(lows) / len(lows), 1) if lows else None,
        "temp_high_record": round(max(highs), 1),
        "temp_low_record": round(min(lows), 1) if lows else None,
        "rain_total_avg_day": round(sum(rains) / len(rains), 1) if rains else None,
        "rain_total_30d": round(sum(rains), 1) if rains else None,
        "days_with_rain": sum(1 for r in rains if r >= 1.0),
        "first_date": days[0].get("date"),
        "last_date": days[-1].get("date"),
    }
