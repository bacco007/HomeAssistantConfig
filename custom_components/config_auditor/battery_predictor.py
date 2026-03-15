"""H.A.C.A — Battery Failure Predictor (Module 18).

Reads per-entity battery levels stored by HistoryManager across scans,
performs a linear regression on the last 30 days and predicts:
  • slope (% per day)
  • predicted date when level hits critical threshold
  • J-7 alert flag (discharge within 7 days)
  • trend confidence (R²)

Battery snapshots are stored separately in .haca_battery_history/ as daily
JSON files (one per scan date, keyed by entity_id).
"""
from __future__ import annotations

import json
import logging
import math
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

BATTERY_HISTORY_DIR = ".haca_battery_history"
PREDICTION_WINDOW_DAYS = 30
ALERT_HORIZON_DAYS = 7
MIN_DATAPOINTS = 3          # minimum points for reliable regression
CRITICAL_THRESHOLD = 10     # % below which we consider recharge needed


class BatteryPredictor:
    """Predict battery depletion dates using linear regression on scan history."""

    def __init__(self, hass: HomeAssistant, critical_threshold: int = CRITICAL_THRESHOLD) -> None:
        self.hass = hass
        self._dir = Path(hass.config.config_dir) / BATTERY_HISTORY_DIR
        self._dir.mkdir(exist_ok=True)
        self._critical = critical_threshold
        self.predictions: list[dict[str, Any]] = []

    # ── Public API ────────────────────────────────────────────────────────

    async def async_save_battery_snapshot(self, battery_list: list[dict[str, Any]]) -> None:
        """Persist today's battery levels (called after each scan)."""
        if not battery_list:
            return
        snapshot: dict[str, float] = {
            b["entity_id"]: b["level"]
            for b in battery_list
            if b.get("level") is not None
        }
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        await self.hass.async_add_executor_job(self._write_snapshot, today, snapshot)

    async def async_compute_predictions(
        self,
        battery_list: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Run regression on stored history and return prediction list."""
        history = await self.hass.async_add_executor_job(self._load_history)
        self.predictions = []

        # Build {entity_id: [(day_offset, level), ...]} from history
        now_date = datetime.now(timezone.utc).date()
        series: dict[str, list[tuple[float, float]]] = {}

        for day_str, levels in sorted(history.items()):
            try:
                d = datetime.strptime(day_str, "%Y-%m-%d").date()
            except ValueError:
                continue
            offset = (d - now_date).days   # negative = past
            if offset < -PREDICTION_WINDOW_DAYS:
                continue
            for eid, lvl in levels.items():
                series.setdefault(eid, []).append((float(offset), float(lvl)))

        # Build friendly name map from current battery_list
        fname_map = {b["entity_id"]: b.get("friendly_name", b["entity_id"]) for b in battery_list}
        sev_map   = {b["entity_id"]: b.get("severity") for b in battery_list}

        for eid, points in series.items():
            if len(points) < MIN_DATAPOINTS:
                continue

            slope, intercept, r2 = _linear_regression(points)

            # Current estimated level (at day offset 0)
            current_level = intercept   # = value at offset 0

            # If slope >= 0, battery is not discharging — skip
            if slope >= 0:
                days_to_critical = None
                predicted_date = None
                alert_7d = False
            else:
                # days until level hits critical threshold
                if current_level <= self._critical:
                    days_to_critical = 0
                else:
                    days_to_critical = (current_level - self._critical) / abs(slope)
                predicted_date = (now_date + timedelta(days=days_to_critical)).isoformat()
                alert_7d = days_to_critical <= ALERT_HORIZON_DAYS

            self.predictions.append({
                "entity_id":      eid,
                "friendly_name":  fname_map.get(eid, eid),
                "current_level":  round(current_level, 1),
                "severity":       sev_map.get(eid),
                "slope_per_day":  round(slope, 3),   # negative = draining
                "r2":             round(r2, 3),
                "days_to_critical": round(days_to_critical, 1) if days_to_critical is not None else None,
                "predicted_date": predicted_date,
                "alert_7d":       alert_7d,
                # Sparkline data: sorted points for the graph
                "history_points": [
                    {"day": int(p[0]), "level": round(p[1], 1)}
                    for p in sorted(points, key=lambda x: x[0])
                ],
            })

        # Sort: alerts first, then by days_to_critical ascending
        self.predictions.sort(key=lambda p: (
            0 if p["alert_7d"] else 1,
            p["days_to_critical"] if p["days_to_critical"] is not None else 9999,
        ))

        _LOGGER.info(
            "Battery predictor: %d predictions computed (%d J-7 alerts)",
            len(self.predictions),
            sum(1 for p in self.predictions if p["alert_7d"]),
        )
        return self.predictions

    async def async_export_csv(self) -> str:
        """Return CSV string of full battery discharge history."""
        history = await self.hass.async_add_executor_job(self._load_history)
        if not history:
            return "date,entity_id,level\n"

        rows: list[str] = ["date,entity_id,level"]
        for day_str, levels in sorted(history.items()):
            for eid, lvl in sorted(levels.items()):
                rows.append(f"{day_str},{eid},{lvl}")
        return "\n".join(rows)

    # ── File I/O (executor) ───────────────────────────────────────────────

    def _write_snapshot(self, day: str, snapshot: dict[str, float]) -> None:
        path = self._dir / f"{day}.json"
        try:
            # Merge with any existing data for that day (multiple scans same day)
            existing: dict = {}
            if path.exists():
                existing = json.loads(path.read_text(encoding="utf-8"))
            existing.update(snapshot)
            path.write_text(json.dumps(existing, ensure_ascii=False), encoding="utf-8")
        except OSError as exc:
            _LOGGER.warning("BatteryPredictor: write failed for %s: %s", day, exc)

        # Prune files older than PREDICTION_WINDOW_DAYS + 5 buffer
        cutoff = (datetime.now(timezone.utc).date() - timedelta(days=PREDICTION_WINDOW_DAYS + 5)).strftime("%Y-%m-%d")
        for p in sorted(self._dir.glob("*.json")):
            if p.stem < cutoff:
                p.unlink(missing_ok=True)

    def _load_history(self) -> dict[str, dict[str, float]]:
        """Return {date_str: {entity_id: level}} for last PREDICTION_WINDOW_DAYS days."""
        result: dict[str, dict[str, float]] = {}
        for path in sorted(self._dir.glob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                result[path.stem] = data
            except Exception:
                pass
        return result


# ── Math helpers ──────────────────────────────────────────────────────────────

def _linear_regression(points: list[tuple[float, float]]) -> tuple[float, float, float]:
    """Return (slope, intercept, R²) for a list of (x, y) points."""
    n = len(points)
    if n < 2:
        return 0.0, points[0][1] if points else 0.0, 0.0

    xs = [p[0] for p in points]
    ys = [p[1] for p in points]

    mean_x = sum(xs) / n
    mean_y = sum(ys) / n

    ss_xy = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    ss_xx = sum((x - mean_x) ** 2 for x in xs)

    if ss_xx == 0:
        return 0.0, mean_y, 0.0

    slope     = ss_xy / ss_xx
    intercept = mean_y - slope * mean_x

    # R² (coefficient of determination)
    y_pred    = [slope * x + intercept for x in xs]
    ss_res    = sum((y - yp) ** 2 for y, yp in zip(ys, y_pred))
    ss_tot    = sum((y - mean_y) ** 2 for y in ys)
    r2        = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    return slope, intercept, max(0.0, min(1.0, r2))
