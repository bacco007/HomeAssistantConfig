"""H.A.C.A — Audit History Manager.

Stocke chaque résultat de scan dans .haca_history/ en JSON chronologique.
Fournit :
  • save_scan()       — persiste un snapshot après chaque audit
  • get_history()     — retourne les N derniers snapshots
  • check_regression()— détecte une baisse > THRESHOLD pts sur WINDOW jours
                        et déclenche une notification HA + persistent_notification
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)

# Regression alert config
REGRESSION_THRESHOLD = 10      # points
REGRESSION_WINDOW_DAYS = 7     # jours
MAX_HISTORY_ENTRIES = 365      # default; overridden by entry options
HISTORY_DIR_NAME = ".haca_history"


class HistoryManager:
    """Gère l'historique des audits HACA."""

    def __init__(self, hass: HomeAssistant, retention_days: int = MAX_HISTORY_ENTRIES) -> None:
        self.hass = hass
        self._dir = Path(hass.config.config_dir) / HISTORY_DIR_NAME
        self._dir.mkdir(exist_ok=True)
        self._history: list[dict[str, Any]] = []
        self._loaded = False
        self._retention_days = retention_days
        self._translator = TranslationHelper(hass)

    # ── Public API ────────────────────────────────────────────────────────

    async def async_save_scan(self, scan_data: dict[str, Any]) -> None:
        """Persiste le snapshot du scan courant et vérifie les régressions."""
        snapshot = self._build_snapshot(scan_data)
        await self.hass.async_add_executor_job(self._write_snapshot, snapshot)

        # Reload full history cache
        self._history = await self.hass.async_add_executor_job(self._load_all)
        self._loaded = True

        # Check for regression after update
        # Load translations so regression notifications use the HA language
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)
        await self._check_regression(snapshot)

    async def async_get_history(self, limit: int = 90) -> list[dict[str, Any]]:
        """Retourne les `limit` derniers snapshots (du plus ancien au plus récent)."""
        if not self._loaded:
            self._history = await self.hass.async_add_executor_job(self._load_all)
            self._loaded = True
        return self._history[-limit:]


    async def async_delete_entries(self, timestamps: list[str]) -> int:
        """Supprime les entrées d'historique correspondant aux timestamps fournis.

        Args:
            timestamps: liste de valeurs `ts` (ISO 8601) des entrées à supprimer.

        Returns:
            Nombre de fichiers effectivement supprimés.
        """
        if not timestamps:
            return 0
        ts_set = set(timestamps)

        def _delete_files() -> int:
            deleted = 0
            for path in sorted(self._dir.glob("*.json")):
                try:
                    data = json.loads(path.read_text(encoding="utf-8"))
                    if data.get("ts") in ts_set:
                        path.unlink(missing_ok=True)
                        deleted += 1
                except Exception as exc:
                    _LOGGER.debug("HACA History: skip %s during delete — %s", path.name, exc)
            return deleted

        count = await self.hass.async_add_executor_job(_delete_files)

        # Invalider le cache
        self._history = await self.hass.async_add_executor_job(self._load_all)
        self._loaded = True
        _LOGGER.info("HACA History: %d entrée(s) supprimée(s)", count)
        return count

    # ── Snapshot build ────────────────────────────────────────────────────

    def _build_snapshot(self, data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        score = int(data.get("health_score", 0))
        total = int(data.get("total_issues", 0))

        # Delta vs previous snapshot
        delta_score  = 0
        delta_issues = 0
        if self._history:
            prev = self._history[-1]
            delta_score  = score - prev.get("score", score)
            delta_issues = total - prev.get("total", total)

        # Top 5 issues across all categories (highest severity first)
        severity_order = {"high": 0, "medium": 1, "low": 2}
        all_issues: list[dict] = (
            list(data.get("automation_issue_list", []))
            + list(data.get("entity_issue_list", []))
            + list(data.get("performance_issue_list", []))
            + list(data.get("security_issue_list", []))
            + list(data.get("script_issue_list", []))
            + list(data.get("scene_issue_list", []))
            + list(data.get("dashboard_issue_list", []))
        )
        top5 = sorted(
            all_issues,
            key=lambda i: severity_order.get(i.get("severity", "low"), 2),
        )[:5]
        top5_serialisable = [
            {
                "entity_id": i.get("entity_id") or i.get("alias", "?"),
                "severity": i.get("severity", "low"),
                "type": i.get("type", ""),
                "message": (i.get("message") or "")[:120],
            }
            for i in top5
        ]

        return {
            "ts":          now.isoformat(),
            "date":        now.strftime("%Y-%m-%d"),
            "time":        now.strftime("%H:%M"),
            "score":       score,
            "total":       total,
            "automation":  int(data.get("automation_issues", 0)),
            "script":      int(data.get("script_issues", 0)),
            "scene":       int(data.get("scene_issues", 0)),
            "entity":      int(data.get("entity_issues", 0)),
            "performance": int(data.get("performance_issues", 0)),
            "security":    int(data.get("security_issues", 0)),
            "blueprint":   int(data.get("blueprint_issues", 0)),
            "dashboard":   int(data.get("dashboard_issues", 0)),
            # New fields (6.7)
            "delta_score":  delta_score,
            "delta_issues": delta_issues,
            "top_issues":   top5_serialisable,
        }

    # ── File I/O (executor thread) ────────────────────────────────────────

    def _write_snapshot(self, snapshot: dict[str, Any]) -> None:
        """Write one JSON file per scan, named by timestamp."""
        ts_safe = snapshot["ts"].replace(":", "-").replace("+", "Z")
        path = self._dir / f"{ts_safe}.json"
        try:
            path.write_text(json.dumps(snapshot, ensure_ascii=False), encoding="utf-8")
        except OSError as exc:
            _LOGGER.warning("HACA History: could not write snapshot: %s", exc)
            return

        # Prune oldest files to stay within configured retention limit
        files = sorted(self._dir.glob("*.json"))
        while len(files) > self._retention_days:
            files.pop(0).unlink(missing_ok=True)

    def _load_all(self) -> list[dict[str, Any]]:
        """Load all snapshot files, sorted chronologically (oldest first)."""
        entries: list[dict[str, Any]] = []
        for path in sorted(self._dir.glob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                entries.append(data)
            except Exception as exc:
                _LOGGER.debug("HACA History: skip %s — %s", path.name, exc)
        return entries

    # ── Regression detection ──────────────────────────────────────────────

    async def _check_regression(self, latest: dict[str, Any]) -> None:
        """Fire a persistent HA notification if score dropped > threshold in window."""
        history = self._history
        if len(history) < 2:
            return

        current_score = latest["score"]

        # Find the oldest snapshot within the regression window
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=REGRESSION_WINDOW_DAYS)
        window_entries = [
            e for e in history[:-1]   # exclude latest itself
            if datetime.fromisoformat(e["ts"]) >= cutoff
        ]
        if not window_entries:
            return

        oldest_in_window = window_entries[0]
        reference_score = oldest_in_window["score"]
        drop = reference_score - current_score

        if drop >= REGRESSION_THRESHOLD:
            _LOGGER.warning(
                "HACA Regression: health score dropped %d pts in %d days (%d → %d)",
                drop, REGRESSION_WINDOW_DAYS, reference_score, current_score,
            )
            await self._notify_regression(drop, reference_score, current_score, oldest_in_window)

    async def _notify_regression(
        self,
        drop: int,
        ref_score: int,
        cur_score: int,
        ref_entry: dict[str, Any],
    ) -> None:
        """Send a persistent HA notification for score regression."""
        try:
            title   = self._translator.t("regression_title", drop=drop)
            message = self._translator.t(
                "regression_message",
                drop=drop,
                window_days=REGRESSION_WINDOW_DAYS,
                ref_date=ref_entry["date"],
                ref_score=ref_score,
                cur_score=cur_score,
            )
            await self.hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "title":           title,
                    "message":         message,
                    "notification_id": "haca_regression_alert",
                },
                blocking=False,
            )
        except Exception as exc:
            _LOGGER.debug("HACA History: regression notification failed: %s", exc)
