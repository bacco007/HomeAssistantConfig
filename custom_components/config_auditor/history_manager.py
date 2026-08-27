"""H.A.C.A — Audit History Manager.

Stocke chaque résultat de scan dans `.storage/config_auditor.history` via le
helper `Store` de Home Assistant (une écriture atomique coalescée au lieu d'un
fichier JSON par scan dans /config).
Fournit :
  • save_scan()       — persiste un snapshot après chaque audit
  • get_history()     — retourne les N derniers snapshots
  • check_regression()— détecte une baisse > THRESHOLD pts sur WINDOW jours
                        et déclenche une notification HA + persistent_notification

Migration : au premier chargement, l'ancien dossier `.haca_history/` (< 1.7.6)
est importé puis supprimé.
"""
from __future__ import annotations

import asyncio
import json
import logging
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import LEGACY_HISTORY_DIR, STORAGE_KEY_HISTORY, STORAGE_VERSION
from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)

# Regression alert config
REGRESSION_THRESHOLD = 10      # points
REGRESSION_WINDOW_DAYS = 7     # jours
MAX_HISTORY_ENTRIES = 365      # default; overridden by entry options
SAVE_DELAY = 10                # secondes — Store flush aussi à l'arrêt de HA


class HistoryManager:
    """Gère l'historique des audits HACA."""

    def __init__(self, hass: HomeAssistant, retention_days: int = MAX_HISTORY_ENTRIES) -> None:
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY_HISTORY)
        self._history: list[dict[str, Any]] = []
        self._loaded = False
        self._load_lock = asyncio.Lock()
        # Guard against a bogus option value (the panel enforces 30..730, the
        # websocket handler does not) — 0 would otherwise wipe the history.
        self._retention_days = max(1, int(retention_days or MAX_HISTORY_ENTRIES))
        self._translator = TranslationHelper(hass)

    # ── Public API ────────────────────────────────────────────────────────

    async def async_save_scan(self, scan_data: dict[str, Any]) -> None:
        """Persiste le snapshot du scan courant et vérifie les régressions."""
        await self._async_ensure_loaded()

        snapshot = self._build_snapshot(scan_data)
        self._history.append(snapshot)
        if len(self._history) > self._retention_days:
            del self._history[: len(self._history) - self._retention_days]
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

        # Check for regression after update
        # Load translations so regression notifications use the HA system language
        language = self.hass.config.language or "en"
        await self._translator.async_load_language(language)
        await self._check_regression(snapshot)

    async def async_get_history(self, limit: int = 90) -> list[dict[str, Any]]:
        """Retourne les `limit` derniers snapshots (du plus ancien au plus récent)."""
        await self._async_ensure_loaded()
        return self._history[-limit:]

    async def async_delete_entries(self, timestamps: list[str]) -> int:
        """Supprime les entrées d'historique correspondant aux timestamps fournis.

        Args:
            timestamps: liste de valeurs `ts` (ISO 8601) des entrées à supprimer.

        Returns:
            Nombre d'entrées effectivement supprimées.
        """
        if not timestamps:
            return 0
        await self._async_ensure_loaded()

        ts_set = set(timestamps)
        before = len(self._history)
        self._history = [e for e in self._history if e.get("ts") not in ts_set]
        count = before - len(self._history)

        if count:
            await self._store.async_save(self._data_to_save())
        _LOGGER.info("HACA History: %d entrée(s) supprimée(s)", count)
        return count

    async def async_flush(self) -> None:
        """Écrit immédiatement une sauvegarde différée en attente (unload/reload)."""
        if self._loaded:
            await self._store.async_save(self._data_to_save())

    # ── Storage (.storage via Store helper) ───────────────────────────────

    def _data_to_save(self) -> dict[str, Any]:
        """Payload écrit dans .storage (appelé par Store, y compris en différé)."""
        return {"snapshots": self._history}

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
                _LOGGER.warning("HACA History: could not read store: %s", exc)
                data = None

            if data is None:
                self._history = await self._async_migrate_legacy()
            else:
                self._history = list(data.get("snapshots") or [])
            self._loaded = True

    async def _async_migrate_legacy(self) -> list[dict[str, Any]]:
        """Import one-shot de `<config>/.haca_history/` (< 1.7.6), puis suppression."""
        legacy_dir = Path(self.hass.config.config_dir) / LEGACY_HISTORY_DIR
        entries = await self.hass.async_add_executor_job(_read_legacy_snapshots, legacy_dir)
        if entries is None:
            return []       # pas d'ancien dossier — rien à migrer

        entries = entries[-self._retention_days:]
        try:
            await self._store.async_save({"snapshots": entries})
        except Exception as exc:
            # L'ancien dossier reste en place : on retentera au prochain démarrage
            _LOGGER.error("HACA History: migration to .storage failed: %s", exc)
            return entries

        await self.hass.async_add_executor_job(_remove_legacy_dir, legacy_dir)
        _LOGGER.info(
            "HACA History: %d snapshot(s) migrated from %s to .storage/%s",
            len(entries), LEGACY_HISTORY_DIR, STORAGE_KEY_HISTORY,
        )
        return entries

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


# ── Legacy directory I/O (executor thread) ────────────────────────────────────

def _read_legacy_snapshots(legacy_dir: Path) -> list[dict[str, Any]] | None:
    """Lit tous les snapshots du dossier < 1.7.6. None si le dossier n'existe pas."""
    if not legacy_dir.is_dir():
        return None
    entries: list[dict[str, Any]] = []
    for path in sorted(legacy_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, dict) and data.get("ts"):
                entries.append(data)
        except Exception as exc:
            _LOGGER.debug("HACA History: skip %s during migration — %s", path.name, exc)
    entries.sort(key=lambda e: e["ts"])
    return entries


def _remove_legacy_dir(legacy_dir: Path) -> None:
    """Supprime le dossier migré (best effort)."""
    try:
        shutil.rmtree(legacy_dir)
    except OSError as exc:
        _LOGGER.warning("HACA History: could not remove %s: %s", legacy_dir, exc)
