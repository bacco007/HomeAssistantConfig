"""H.A.C.A — Agent IA Proactif (Module 15) v1.6.1.

Agent en arrière-plan qui :
- Analyse les nouveaux événements HA significatifs
- Corrèle les issues entre elles (même device cassé → plusieurs automations)
- Envoie un rapport de synthèse hebdomadaire
- Apprend les préférences utilisateur (fixes acceptés/refusés)
- Suggère des optimisations basées sur l'historique des scans
"""
from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Clé dans hass.data pour stocker l'état de l'agent
_AGENT_STATE_KEY = f"{DOMAIN}_proactive_agent"
_PREFS_KEY = "user_preferences"  # sous hass.data[DOMAIN][entry_id]
_WEEKLY_REPORT_KEY = "last_weekly_report"

# Événements HA à surveiller pour l'analyse contextuelle
# NOTE: call_service was removed — it fires on every single service call
# (hundreds/minute on large setups) but the agent only counts occurrences
# without acting on them, causing unnecessary CPU/memory overhead.
# Replaced with more targeted registry events for config change detection.
MONITORED_HA_EVENTS = [
    "homeassistant_started",
    "automation_triggered",
    "script_started",
    "automation_reloaded",
    "scene_reloaded",
]

# Seuils de corrélation
CORRELATION_MIN_SHARED_ISSUES = 2  # Nb min d'issues partagées pour une corrélation
WEEKLY_REPORT_INTERVAL_HOURS = 168  # 7 jours — défaut si non configuré

# Correspondance clé option → heures
REPORT_FREQUENCY_HOURS = {
    "daily":    24,
    "weekly":   168,
    "monthly":  720,
    "never":    0,
}


# ─── Préférences utilisateur (apprentissage) ──────────────────────────────

class UserPreferences:
    """Gère l'apprentissage des préférences utilisateur."""

    def __init__(self, data: dict | None = None):
        self._data = data or {
            "accepted_fixes": {},   # issue_type → count
            "rejected_fixes": {},   # issue_type → count
            "ignored_issue_types": set(),
            "last_updated": None,
        }
        # Convertir les sets sérialisés depuis JSON
        if isinstance(self._data.get("ignored_issue_types"), list):
            self._data["ignored_issue_types"] = set(self._data["ignored_issue_types"])

    def record_fix_accepted(self, issue_type: str) -> None:
        counts = self._data.setdefault("accepted_fixes", {})
        counts[issue_type] = counts.get(issue_type, 0) + 1
        self._data["last_updated"] = datetime.now(timezone.utc).isoformat()

    def record_fix_rejected(self, issue_type: str) -> None:
        counts = self._data.setdefault("rejected_fixes", {})
        counts[issue_type] = counts.get(issue_type, 0) + 1

    def is_type_likely_ignored(self, issue_type: str) -> bool:
        """Retourne True si l'utilisateur rejette souvent ce type."""
        rejected = self._data.get("rejected_fixes", {}).get(issue_type, 0)
        accepted = self._data.get("accepted_fixes", {}).get(issue_type, 0)
        # Si >3 refus et ratio refus/(refus+acceptés) > 80% → probablement ignoré
        if rejected >= 3 and (accepted + rejected) > 0:
            return rejected / (accepted + rejected) > 0.8
        return False

    def get_preferred_fix_types(self) -> list[str]:
        """Retourne les types de fix que l'utilisateur accepte souvent."""
        accepted = self._data.get("accepted_fixes", {})
        return [k for k, v in sorted(accepted.items(), key=lambda x: -x[1]) if v >= 2]

    def to_dict(self) -> dict:
        d = dict(self._data)
        d["ignored_issue_types"] = list(d.get("ignored_issue_types", set()))
        return d


# ─── Corrélation d'issues ──────────────────────────────────────────────────

def _correlate_issues(cdata: dict) -> list[dict[str, Any]]:
    """Identifie les groupes d'issues liées entre elles.

    Exemples de corrélations :
    - Même device_id cassé référencé dans N automations
    - Même entité unavailable utilisée dans M automations/scènes
    - Pattern de nommage similaire dans des issues distinctes
    """
    correlations: list[dict] = []

    all_issues = (
        list(cdata.get("automation_issue_list", []))
        + list(cdata.get("entity_issue_list", []))
        + list(cdata.get("performance_issue_list", []))
    )

    # Grouper par device_id cassé
    device_issues: dict[str, list] = {}
    for issue in all_issues:
        ctx = issue.get("context", {}) or {}
        device_id = ctx.get("device_id") or issue.get("device_id")
        if device_id:
            device_issues.setdefault(device_id, []).append(issue)

    for device_id, issues in device_issues.items():
        if len(issues) >= CORRELATION_MIN_SHARED_ISSUES:
            correlations.append({
                "type": "shared_broken_device",
                "device_id": device_id,
                "affected_count": len(issues),
                "affected_entities": list({i.get("entity_id", "") for i in issues})[:10],
                "severity": "high" if len(issues) >= 5 else "medium",
                "message": (
                    f"Le device '{device_id}' est référencé dans {len(issues)} automations "
                    f"mais semble cassé. Corriger ce device résoudrait toutes ces issues."
                ),
            })

    # Grouper par entité unavailable référencée dans plusieurs automations
    entity_refs: dict[str, list] = {}
    for issue in all_issues:
        if issue.get("type") in ("zombie_entity_reference", "entity_unavailable"):
            eid = issue.get("context", {}).get("ref_entity_id") or issue.get("entity_id", "")
            if eid:
                entity_refs.setdefault(eid, []).append(issue)

    for entity_id, issues in entity_refs.items():
        if len(issues) >= CORRELATION_MIN_SHARED_ISSUES:
            correlations.append({
                "type": "shared_unavailable_entity",
                "entity_id": entity_id,
                "affected_count": len(issues),
                "severity": "medium",
                "message": (
                    f"L'entité '{entity_id}' est référencée dans {len(issues)} automations "
                    f"mais n'est pas disponible. Vérifier cette entité réglerait {len(issues)} issues."
                ),
            })

    return correlations


# ─── Rapport hebdomadaire ──────────────────────────────────────────────────

async def _generate_weekly_report(
    hass: HomeAssistant,
    entry: ConfigEntry,
    cdata: dict,
    use_ai: bool = True,
) -> str:
    """Génère le contenu Markdown du rapport hebdomadaire."""
    from .conversation import _async_call_ai

    score = cdata.get("health_score", "?")
    total = cdata.get("total_issues", 0)
    auto_issues = cdata.get("automation_issues", 0)
    entity_issues = cdata.get("entity_issues", 0)
    perf_issues = cdata.get("performance_issues", 0)
    security_issues = cdata.get("security_issues", 0)

    # Compter par sévérité
    all_issues = (
        list(cdata.get("automation_issue_list", []))
        + list(cdata.get("entity_issue_list", []))
        + list(cdata.get("performance_issue_list", []))
        + list(cdata.get("security_issue_list", []))
        + list(cdata.get("compliance_issue_list", []))
    )
    high_count = sum(1 for i in all_issues if i.get("severity") == "high")
    medium_count = sum(1 for i in all_issues if i.get("severity") == "medium")
    low_count = sum(1 for i in all_issues if i.get("severity") == "low")

    # Top 3 issues critiques
    critical = sorted(
        [i for i in all_issues if i.get("severity") == "high"],
        key=lambda i: i.get("type", ""),
    )[:3]

    correlations = _correlate_issues(cdata)

    report_lines = [
        f"## 📊 Rapport H.A.C.A — {datetime.now().strftime('%d/%m/%Y')}",
        "",
        f"**Score de santé : {score}/100** | {total} issue(s) détectée(s)",
        "",
        "### Répartition par sévérité",
        f"- 🔴 Critique : {high_count}",
        f"- 🟡 Modéré : {medium_count}",
        f"- 🟢 Faible : {low_count}",
        "",
        "### Par catégorie",
        f"- Automations : {auto_issues}",
        f"- Entités : {entity_issues}",
        f"- Performance : {perf_issues}",
        f"- Sécurité : {security_issues}",
    ]

    if critical:
        report_lines += ["", "### 🔴 Issues critiques à traiter en priorité"]
        for issue in critical:
            report_lines.append(
                f"- **{issue.get('entity_id', issue.get('alias', '?'))}** "
                f"({issue.get('type', '?')}): {issue.get('message', '')[:80]}"
            )

    if correlations:
        report_lines += ["", "### 🔗 Corrélations détectées"]
        for corr in correlations[:3]:
            report_lines.append(f"- {corr['message']}")

    # Enrichissement IA si disponible
    if use_ai and total > 0 and all_issues:
        try:
            top5_txt = "\n".join(
                f"  [{i.get('severity','?').upper()}] {i.get('entity_id','?')}: {i.get('message','')[:100]}"
                for i in sorted(all_issues, key=lambda x: {"high":0,"medium":1,"low":2}.get(x.get("severity","low"),2))[:5]
            )
            ai_prompt = (
                f"[HACA Rapport Hebdomadaire]\n"
                f"Score: {score}/100 | {total} issues | "
                f"High: {high_count}, Medium: {medium_count}, Low: {low_count}\n"
                f"Top 5 issues:\n{top5_txt}\n\n"
                f"En 3-4 phrases max, donne les tendances clés et la recommandation "
                f"principale pour améliorer la santé de la config HA cette semaine."
            )
            ai_insight = await _async_call_ai(hass, ai_prompt, "HACA Weekly Report")
            if ai_insight:
                report_lines += ["", "### 🤖 Analyse IA", ai_insight]
        except Exception as exc:
            _LOGGER.debug("[HACA Agent] AI weekly insight error: %s", exc)

    report_lines += [
        "",
        "---",
        "_Rapport généré par H.A.C.A. Ouvrez le panel pour plus de détails._",
    ]

    return "\n".join(report_lines)


# ─── Agent principal ───────────────────────────────────────────────────────

class ProactiveAgent:
    """Agent IA proactif HACA."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self._hass = hass
        self._entry = entry
        self._unsubscribers: list = []
        self._event_counts: dict[str, int] = {}
        self._last_issues_snapshot: dict[str, int] = {}

    # ── Démarrage ──────────────────────────────────────────────────────────

    def start(self) -> None:
        """Démarre l'agent (enregistre les listeners et le scheduler hebdo)."""
        options = self._entry.options

        # Monitoring des événements HA
        # NOTE: on n'appelle PAS entry.async_on_unload(unsub) ici car stop()
        # est déjà enregistré via _cleanup_agent dans async_setup_proactive_agent.
        # Double-enregistrement provoque un double appel -> ValueError dans HA core.
        if options.get("proactive_agent_events", True):
            for event_name in MONITORED_HA_EVENTS:
                unsub = self._hass.bus.async_listen(event_name, self._on_ha_event)
                self._unsubscribers.append(unsub)

        # Rapport hebdomadaire
        if options.get("proactive_agent_weekly_report", True):
            unsub = async_track_time_interval(
                self._hass,
                self._check_weekly_report,
                timedelta(hours=24),  # Vérifie une fois par jour
            )
            self._unsubscribers.append(unsub)

        # Vérification initiale du rapport hebdomadaire (après démarrage)
        self._hass.async_create_task(self._check_weekly_report_async())

        _LOGGER.info(
            "[HACA ProactiveAgent] Started (events=%s, weekly=%s)",
            options.get("proactive_agent_events", True),
            options.get("proactive_agent_weekly_report", True),
        )

    def stop(self) -> None:
        """Arrête l'agent."""
        for unsub in self._unsubscribers:
            try:
                unsub()
            except Exception:
                pass
        self._unsubscribers.clear()
        _LOGGER.debug("[HACA ProactiveAgent] Stopped")

    # ── Event listener ──────────────────────────────────────────────────────

    @callback
    def _on_ha_event(self, event) -> None:
        """Reçoit un événement HA et l'enregistre pour analyse."""
        event_type = event.event_type
        self._event_counts[event_type] = self._event_counts.get(event_type, 0) + 1

        # Détecter des patterns anormaux (ex: automation_triggered > 100x/heure)
        if event_type == "automation_triggered" and self._event_counts.get("automation_triggered", 0) > 100:
            _LOGGER.warning(
                "[HACA ProactiveAgent] Unusual automation activity: %d triggers recorded",
                self._event_counts["automation_triggered"]
            )
            self._event_counts["automation_triggered"] = 0  # reset

    # ── Rapport hebdomadaire ────────────────────────────────────────────────

    @callback
    def _check_weekly_report(self, now=None) -> None:
        """Callback appelé toutes les heures pour vérifier si le rapport est dû."""
        self._hass.async_create_task(self._check_weekly_report_async())

    async def _check_weekly_report_async(self) -> None:
        """Vérifie et envoie le rapport automatique si nécessaire."""
        try:
            # Lire la fréquence configurée par l'utilisateur
            freq_key = self._entry.options.get("report_frequency", "weekly")
            interval_hours = REPORT_FREQUENCY_HOURS.get(freq_key, WEEKLY_REPORT_INTERVAL_HOURS)

            # "never" → rapport automatique désactivé
            if interval_hours == 0:
                return

            entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry.entry_id, {})
            last_report_str = entry_data.get(_WEEKLY_REPORT_KEY)

            if last_report_str:
                last_report = datetime.fromisoformat(last_report_str)
                if (datetime.now(timezone.utc) - last_report).total_seconds() < interval_hours * 3600:
                    return  # Pas encore l'heure

            # Vérifier qu'on a des données
            coordinator = entry_data.get("coordinator")
            if not coordinator or not coordinator.data:
                return

            cdata = coordinator.data
            if cdata.get("total_issues", 0) == 0 and not cdata.get("health_score"):
                return  # Pas de données pertinentes

            _LOGGER.info("[HACA ProactiveAgent] Generating weekly report...")
            report_body = await _generate_weekly_report(
                self._hass,
                self._entry,
                cdata,
                use_ai=self._entry.options.get("proactive_agent_ai", True),
            )

            # Envoyer notification HA
            await self._hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "notification_id": f"{DOMAIN}_weekly_report",
                    "title": f"H.A.C.A — Rapport hebdomadaire (score: {cdata.get('health_score', '?')}/100)",
                    "message": report_body,
                },
                blocking=False,
            )

            # Sauvegarder le fichier MD
            report_file = await self._save_report_file(report_body, cdata)

            # Enregistrer la date du rapport + chemin
            entry_data[_WEEKLY_REPORT_KEY] = datetime.now(timezone.utc).isoformat()
            entry_data["last_report_file"] = str(report_file) if report_file else None
            entry_data["last_report_markdown"] = report_body
            _LOGGER.info("[HACA ProactiveAgent] Weekly report sent, file: %s", report_file)

        except Exception as exc:
            _LOGGER.error("[HACA ProactiveAgent] Weekly report error: %s", exc)

    # ── Sauvegarde du rapport en fichier ───────────────────────────────────

    async def _save_report_file(self, report_body: str, cdata: dict) -> Path | None:
        """Sauvegarde le rapport hebdomadaire en fichier .md dans haca_reports/."""
        try:
            from .const import REPORTS_DIR
            reports_dir = Path(self._hass.config.config_dir) / REPORTS_DIR
            reports_dir.mkdir(exist_ok=True)

            ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            score = cdata.get("health_score", "?")
            filename = f"agent_report_{ts}_score{score}.md"
            report_path = reports_dir / filename

            await self._hass.async_add_executor_job(
                report_path.write_text, report_body, "utf-8"
            )
            _LOGGER.debug("[HACA ProactiveAgent] Report saved to %s", report_path)
            return report_path
        except Exception as exc:
            _LOGGER.warning("[HACA ProactiveAgent] Could not save report file: %s", exc)
            return None

    # ── Corrélation et analyse ──────────────────────────────────────────────

    async def analyze_correlations(self) -> list[dict]:
        """Analyse les corrélations entre issues et notifie si nouvelles."""
        entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry.entry_id, {})
        coordinator = entry_data.get("coordinator")
        if not coordinator or not coordinator.data:
            return []

        return _correlate_issues(coordinator.data)

    # ── Préférences utilisateur ─────────────────────────────────────────────

    def get_preferences(self) -> UserPreferences:
        """Retourne les préférences utilisateur."""
        entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry.entry_id, {})
        prefs_data = entry_data.get(_PREFS_KEY, {})
        return UserPreferences(prefs_data)

    def save_preferences(self, prefs: UserPreferences) -> None:
        """Sauvegarde les préférences en mémoire (hass.data)."""
        entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry.entry_id, {})
        entry_data[_PREFS_KEY] = prefs.to_dict()

    def record_fix_outcome(self, issue_type: str, accepted: bool) -> None:
        """Enregistre si un fix a été accepté ou refusé par l'utilisateur."""
        prefs = self.get_preferences()
        if accepted:
            prefs.record_fix_accepted(issue_type)
        else:
            prefs.record_fix_rejected(issue_type)
        self.save_preferences(prefs)
        _LOGGER.debug(
            "[HACA ProactiveAgent] Fix %s recorded for type '%s'",
            "accepted" if accepted else "rejected", issue_type
        )


# ─── Setup ────────────────────────────────────────────────────────────────

_AGENT_INSTANCES: dict[str, ProactiveAgent] = {}


def async_setup_proactive_agent(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> ProactiveAgent:
    """Crée et démarre l'agent proactif pour cette entrée config."""
    agent = ProactiveAgent(hass, entry)

    # Stocker dans hass.data pour accès depuis websocket/services
    hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {})
    hass.data[DOMAIN][entry.entry_id][_AGENT_STATE_KEY] = agent
    _AGENT_INSTANCES[entry.entry_id] = agent

    agent.start()

    # Cleanup à l'unload
    entry.async_on_unload(lambda: _cleanup_agent(entry.entry_id))

    return agent


def _cleanup_agent(entry_id: str) -> None:
    """Arrête et supprime l'agent."""
    agent = _AGENT_INSTANCES.pop(entry_id, None)
    if agent:
        agent.stop()


def get_agent(hass: HomeAssistant) -> ProactiveAgent | None:
    """Retourne l'agent actif ou None."""
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return None
    return hass.data.get(DOMAIN, {}).get(entries[0].entry_id, {}).get(_AGENT_STATE_KEY)
