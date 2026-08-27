"""H.A.C.A — Battery Failure Predictor (Module 18).

Reads per-entity battery levels stored across scans, performs a linear
regression on the last 30 days and predicts:
  • slope (% per day)
  • predicted date when level hits critical threshold
  • J-7 alert flag (discharge within 7 days)
  • trend confidence (R²)

Battery snapshots live in `.storage/config_auditor.battery_history` (helper
`Store` de HA), sous la forme {date: {entity_id: level}}.

Migration : au premier chargement, l'ancien dossier `.haca_battery_history/`
(< 1.7.6) est importé puis supprimé.
"""
from __future__ import annotations

import asyncio
import json
import logging
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    LEGACY_BATTERY_HISTORY_DIR,
    STORAGE_KEY_BATTERY_HISTORY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

PREDICTION_WINDOW_DAYS = 30
ALERT_HORIZON_DAYS = 7
MIN_DATAPOINTS = 3          # minimum points for reliable regression
CRITICAL_THRESHOLD = 10     # % below which we consider recharge needed
RETENTION_DAYS = PREDICTION_WINDOW_DAYS + 5   # petit tampon au-delà de la fenêtre
SAVE_DELAY = 10             # secondes — Store flush aussi à l'arrêt de HA


class BatteryPredictor:
    """Predict battery depletion dates using linear regression on scan history."""

    def __init__(self, hass: HomeAssistant, critical_threshold: int = CRITICAL_THRESHOLD) -> None:
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY_BATTERY_HISTORY)
        self._days: dict[str, dict[str, float]] = {}
        self._loaded = False
        self._load_lock = asyncio.Lock()
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
        if not snapshot:
            return

        await self._async_ensure_loaded()

        # Merge with any existing data for that day (multiple scans same day)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._days.setdefault(today, {}).update(snapshot)
        self._prune()
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    async def async_compute_predictions(
        self,
        battery_list: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Run regression on stored history and return prediction list."""
        await self._async_ensure_loaded()
        history = self._days
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
        await self._async_ensure_loaded()
        if not self._days:
            return "date,entity_id,level\n"

        rows: list[str] = ["date,entity_id,level"]
        for day_str, levels in sorted(self._days.items()):
            for eid, lvl in sorted(levels.items()):
                rows.append(f"{day_str},{eid},{lvl}")
        return "\n".join(rows)

    async def async_flush(self) -> None:
        """Écrit immédiatement une sauvegarde différée en attente (unload/reload)."""
        if self._loaded:
            await self._store.async_save(self._data_to_save())

    # ── Storage (.storage via Store helper) ───────────────────────────────

    def _data_to_save(self) -> dict[str, Any]:
        """Payload écrit dans .storage (appelé par Store, y compris en différé)."""
        return {"days": self._days}

    def _prune(self) -> None:
        """Drop days older than the prediction window (+ buffer)."""
        cutoff = (
            datetime.now(timezone.utc).date() - timedelta(days=RETENTION_DAYS)
        ).strftime("%Y-%m-%d")
        for day in [d for d in self._days if d < cutoff]:
            del self._days[day]

    async def _async_ensure_loaded(self) -> None:
        """Charge l'historique depuis .storage (migre l'ancien dossier si besoin)."""
        if self._loaded:
            return
        async with self._load_lock:
            if self._loaded:
                return
            try:
                data = await self._store.async_load()
            except Exception as exc:      # store illisible → on repart à vide
                _LOGGER.warning("BatteryPredictor: could not read store: %s", exc)
                data = None

            if data is None:
                self._days = await self._async_migrate_legacy()
            else:
                self._days = dict(data.get("days") or {})
            self._loaded = True

    async def _async_migrate_legacy(self) -> dict[str, dict[str, float]]:
        """Import one-shot de `<config>/.haca_battery_history/` (< 1.7.6)."""
        legacy_dir = Path(self.hass.config.config_dir) / LEGACY_BATTERY_HISTORY_DIR
        days = await self.hass.async_add_executor_job(_read_legacy_days, legacy_dir)
        if days is None:
            return {}       # pas d'ancien dossier — rien à migrer

        try:
            await self._store.async_save({"days": days})
        except Exception as exc:
            # L'ancien dossier reste en place : on retentera au prochain démarrage
            _LOGGER.error("BatteryPredictor: migration to .storage failed: %s", exc)
            return days

        await self.hass.async_add_executor_job(_remove_legacy_dir, legacy_dir)
        _LOGGER.info(
            "BatteryPredictor: %d day(s) migrated from %s to .storage/%s",
            len(days), LEGACY_BATTERY_HISTORY_DIR, STORAGE_KEY_BATTERY_HISTORY,
        )
        return days


# ── Legacy directory I/O (executor thread) ────────────────────────────────────

def _read_legacy_days(legacy_dir: Path) -> dict[str, dict[str, float]] | None:
    """Lit les fichiers jour du dossier < 1.7.6. None si le dossier n'existe pas."""
    if not legacy_dir.is_dir():
        return None
    result: dict[str, dict[str, float]] = {}
    cutoff = (
        datetime.now(timezone.utc).date() - timedelta(days=RETENTION_DAYS)
    ).strftime("%Y-%m-%d")
    for path in sorted(legacy_dir.glob("*.json")):
        if path.stem < cutoff:
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, dict) and data:
                result[path.stem] = data
        except Exception as exc:
            _LOGGER.debug("BatteryPredictor: skip %s during migration — %s", path.name, exc)
    return result


def _remove_legacy_dir(legacy_dir: Path) -> None:
    """Supprime le dossier migré (best effort)."""
    try:
        shutil.rmtree(legacy_dir)
    except OSError as exc:
        _LOGGER.warning("BatteryPredictor: could not remove %s: %s", legacy_dir, exc)


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
