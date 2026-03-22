"""H.A.C.A — Analyseur de conformité aux bonnes pratiques HA (Module 17) v1.6.1.

Vérifie les conventions de nommage, les métadonnées manquantes et l'organisation
de la configuration Home Assistant.

Checks implémentés :
  e1) Helpers sans friendly_name structuré
  e2) Areas sans icône HA configurée
  e3) Labels HA créés mais non utilisés dans des entités/automations
  e4) Automations sans description
  e5) Automations YAML sans unique_id (requis pour édition UI)
  e6) Scripts sans alias ou description
  e7) Entités sans area assignée (pour les appareils physiques)

NOTE: Les messages sont en anglais (le frontend JS gère la traduction via type).
"""
from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, label_registry as lr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Pattern pour friendly_name structuré : "Salon - Lampe principale" ou "salon.lampe.principale"
_STRUCTURED_NAME_PATTERNS = [
    re.compile(r"^[A-ZÀ-Ÿa-zà-ÿ0-9]+ [-–] .+$"),      # "Salon - Lampe"
    re.compile(r"^[a-z][a-z0-9_]+\.[a-z][a-z0-9_]+$"), # "salon.lampe"
    re.compile(r"^\w+ \w+ \w+"),                          # "Salon Lampe Principale"
]

# Domaines physiques attendus à avoir une area assignée
_PHYSICAL_DOMAINS = {
    "light", "switch", "cover", "climate", "fan", "lock",
    "media_player", "vacuum", "camera", "binary_sensor", "sensor",
}

# Domaines à exclure des checks de nommage (gérés par intégrations tierces)
_EXCLUDED_PLATFORMS_NAMING = {
    "hacs", "met", "sun", "moon", "systemmonitor", "version",
    "config_auditor", "workday", "holidays",
}


class ComplianceAnalyzer:
    """Analyseur de conformité aux bonnes pratiques HA."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._issues: list[dict[str, Any]] = []
        self._ignored_entity_ids: set[str] = set()

    # ── Interface publique ──────────────────────────────────────────────────

    async def async_analyze(self) -> list[dict[str, Any]]:
        """Lance tous les checks de conformité et retourne les issues."""
        self._issues.clear()

        # Charger les entités ignorées via le label haca_ignore (entity + device level)
        try:
            from .translation_utils import async_get_haca_ignored_entity_ids
            self._ignored_entity_ids = await async_get_haca_ignored_entity_ids(self._hass)
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Could not load ignored entities: %s", exc)
            self._ignored_entity_ids = set()

        # Index unique_ids des automations ignorées (pour matcher avec le champ YAML 'id')
        try:
            entity_reg = er.async_get(self._hass)
            self._ignored_auto_unique_ids: set[str] = {
                entry.unique_id
                for entry in entity_reg.entities.values()
                if entry.domain == "automation"
                and entry.entity_id in self._ignored_entity_ids
                and entry.unique_id
            }
        except Exception:
            self._ignored_auto_unique_ids = set()

        await self._check_entity_names()
        await self._check_areas_icons()
        await self._check_unused_labels()
        await self._check_automations_description()
        await self._check_automations_unique_id()
        await self._check_scripts_metadata()
        await self._check_entities_without_area()
        await self._check_helpers_metadata()

        _LOGGER.debug(
            "[HACA Compliance] Analysis done — %d issues found", len(self._issues)
        )
        return self._issues

    # ── Helpers internes ───────────────────────────────────────────────────

    def _add_issue(
        self,
        issue_id: str,
        issue_type: str,
        severity: str,
        entity_id: str,
        message: str,
        alias: str | None = None,
        message_key: str | None = None,
        message_params: dict | None = None,
    ) -> None:
        """Ajoute une issue à la liste.
        
        message       : texte anglais (fallback si JS ne trouve pas la clé)
        message_key   : clé dans compliance_messages.* pour traduction JS
        message_params: paramètres d'interpolation {name:..., alias:...}
        """
        issue: dict[str, Any] = {
            "id": issue_id,
            "type": issue_type,
            "category": "compliance",
            "severity": severity,
            "entity_id": entity_id,
            "message": message,
            "fixable": False,
        }
        if alias:
            issue["alias"] = alias
        if message_key:
            issue["message_key"] = message_key
        if message_params:
            issue["message_params"] = message_params
        self._issues.append(issue)

    # ── Check e1 : Nommage des entités ────────────────────────────────────

    async def _check_entity_names(self) -> None:
        """Détecte les helpers avec un friendly_name absent ou brut."""
        try:
            entity_reg = er.async_get(self._hass)
        except Exception:
            return

        # Seulement les helpers utilisateur (pas les entités d'intégrations)
        helper_domains = {
            "input_boolean", "input_text", "input_number",
            "input_select", "input_datetime", "timer",
            "counter", "schedule",
        }

        for entry in entity_reg.entities.values():
            if entry.entity_id in self._ignored_entity_ids:
                continue
            if entry.platform in _EXCLUDED_PLATFORMS_NAMING:
                continue
            if entry.domain not in helper_domains:
                continue
            if entry.disabled_by:
                continue

            state = self._hass.states.get(entry.entity_id)
            if not state:
                continue

            friendly_name = state.attributes.get("friendly_name", "")

            # 1a: pas de friendly_name
            if not friendly_name or friendly_name == entry.entity_id:
                self._add_issue(
                    issue_id=f"compliance_no_name_{entry.entity_id}",
                    issue_type="compliance_no_friendly_name",
                    severity="low",
                    entity_id=entry.entity_id,
                    message=(
                        f"Helper '{entry.entity_id}' has no friendly_name. "
                        f"Add a descriptive name in Settings → Helpers."
                    ),
                    message_key="no_friendly_name",
                    message_params={"entity_id": entry.entity_id},
                )
            # 1b: friendly_name = entité brute (ex: "input_boolean.my_boolean")
            elif "." in friendly_name and "_" in friendly_name.split(".")[-1]:
                self._add_issue(
                    issue_id=f"compliance_raw_name_{entry.entity_id}",
                    issue_type="compliance_raw_entity_name",
                    severity="low",
                    entity_id=entry.entity_id,
                    message=(
                        f"Entity '{entry.entity_id}' has a raw entity name as "
                        f"friendly_name: '{friendly_name}'. Replace with a readable name."
                    ),
                    message_key="raw_entity_name",
                    message_params={"entity_id": entry.entity_id, "friendly_name": friendly_name},
                )

    # ── Check e2 : Areas sans icône ───────────────────────────────────────

    async def _check_areas_icons(self) -> None:
        """Détecte les areas HA sans icône configurée.
        
        haca_ignore sur une area : si TOUTES les entités physiques de l'area
        ont le label haca_ignore, l'area est ignorée.
        """
        try:
            area_reg    = ar.async_get(self._hass)
            entity_reg  = er.async_get(self._hass)

            # Construire un mapping area_id → entity_ids
            area_entities: dict[str, set[str]] = {}
            for entry in entity_reg.entities.values():
                if entry.area_id:
                    area_entities.setdefault(entry.area_id, set()).add(entry.entity_id)

            for area in area_reg.async_list_areas():
                icon = getattr(area, "icon", None)
                if icon:
                    continue

                # Si TOUTES les entités de l'area ont haca_ignore → skip
                entities_in_area = area_entities.get(area.id, set())
                if entities_in_area and entities_in_area.issubset(self._ignored_entity_ids):
                    _LOGGER.debug(
                        "[HACA Compliance] Area '%s' ignorée (toutes les entités ont haca_ignore)",
                        area.name,
                    )
                    continue

                self._add_issue(
                    issue_id=f"compliance_area_no_icon_{area.id}",
                    issue_type="compliance_area_no_icon",
                    severity="low",
                    entity_id=f"area.{area.id}",
                    alias=area.name,
                    message=(
                        f"Area '{area.name}' has no icon. "
                        f"Add an icon in Settings → Areas."
                    ),
                    message_key="area_no_icon",
                    message_params={"name": area.name},
                )
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Area check error: %s", exc)

    # ── Check e3 : Labels non utilisés ────────────────────────────────────

    async def _check_unused_labels(self) -> None:
        """Détecte les labels HA créés mais non assignés à des entités, devices ou automations."""
        try:
            label_reg = lr.async_get(self._hass)
            entity_reg = er.async_get(self._hass)
            device_reg = dr.async_get(self._hass)

            # Collecter tous les labels utilisés across ALL registries
            used_label_ids: set[str] = set()

            # 1. Entity labels
            for entry in entity_reg.entities.values():
                for label_id in (entry.labels or set()):
                    used_label_ids.add(label_id)

            # 2. Device labels
            for device in device_reg.devices.values():
                for label_id in (getattr(device, "labels", None) or set()):
                    used_label_ids.add(label_id)

            # 3. Area labels
            try:
                area_reg = ar.async_get(self._hass)
                for area in area_reg.async_list_areas():
                    for label_id in (getattr(area, "labels", None) or set()):
                        used_label_ids.add(label_id)
            except Exception:
                pass

            # 4. Automation / script labels (stored in HA state attributes)
            for state in self._hass.states.async_all():
                if state.entity_id.startswith(("automation.", "script.")):
                    entry = entity_reg.async_get(state.entity_id)
                    if entry:
                        for label_id in (entry.labels or set()):
                            used_label_ids.add(label_id)

            for label in label_reg.async_list_labels():
                # Ne pas flaguer haca_ignore lui-même
                if label.label_id == "haca_ignore":
                    continue
                if label.label_id not in used_label_ids:
                    label_name = getattr(label, "name", label.label_id)
                    self._add_issue(
                        issue_id=f"compliance_unused_label_{label.label_id}",
                        issue_type="compliance_unused_label",
                        severity="low",
                        entity_id=f"label.{label.label_id}",
                        alias=label_name,
                        message=(
                            f"Label '{label_name}' is defined "
                            f"but not assigned to any entity, device, or automation. Assign it or delete it."
                        ),
                        message_key="unused_label",
                        message_params={"name": label_name},
                    )
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Label check error: %s", exc)

    # ── Check e4 : Automations sans description ───────────────────────────

    async def _check_automations_description(self) -> None:
        """Détecte les automations YAML sans champ description."""
        try:
            import yaml
            from pathlib import Path

            auto_file = Path(self._hass.config.config_dir) / "automations.yaml"
            if not auto_file.exists():
                return

            raw = await self._hass.async_add_executor_job(
                auto_file.read_text, "utf-8"
            )
            automations = yaml.safe_load(raw) or []
            if not isinstance(automations, list):
                return

            for auto in automations:
                if not isinstance(auto, dict):
                    continue
                alias = auto.get("alias", auto.get("id", "?"))
                # Ignorer si l'automation a le label haca_ignore (via son unique_id YAML)
                yaml_id = str(auto.get("id", ""))
                if yaml_id and yaml_id in self._ignored_auto_unique_ids:
                    continue
                if not auto.get("description", "").strip():
                    self._add_issue(
                        issue_id=f"compliance_auto_no_desc_{auto.get('id', alias)}",
                        issue_type="compliance_automation_no_description",
                        severity="low",
                        entity_id=f"automation.{alias}",
                        alias=alias,
                        message=(
                            f"Automation '{alias}' has no description. "
                            f"Add a 'description:' field to document its purpose."
                        ),
                        message_key="automation_no_description",
                        message_params={"alias": alias},
                    )
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Automation description check error: %s", exc)

    # ── Check e5 : Automations sans unique_id ─────────────────────────────

    async def _check_automations_unique_id(self) -> None:
        """Détecte les automations YAML sans 'id' (bloque l'édition dans l'UI HA)."""
        try:
            import yaml
            from pathlib import Path

            auto_file = Path(self._hass.config.config_dir) / "automations.yaml"
            if not auto_file.exists():
                return

            raw = await self._hass.async_add_executor_job(
                auto_file.read_text, "utf-8"
            )
            automations = yaml.safe_load(raw) or []
            if not isinstance(automations, list):
                return

            for auto in automations:
                if not isinstance(auto, dict):
                    continue
                if not auto.get("id"):
                    alias = auto.get("alias", "unnamed")
                    self._add_issue(
                        issue_id=f"compliance_auto_no_uid_{alias}",
                        issue_type="compliance_automation_no_unique_id",
                        severity="medium",
                        entity_id=f"automation.{alias}",
                        alias=alias,
                        message=(
                            f"Automation '{alias}' has no 'id:' field. "
                            f"Without a unique id, this automation cannot be edited in the HA UI."
                        ),
                        message_key="automation_no_unique_id",
                        message_params={"alias": alias},
                    )
                else:
                    # A un id : vérifier si ignorée
                    yaml_id = str(auto.get("id", ""))
                    if yaml_id in self._ignored_auto_unique_ids:
                        continue
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Automation unique_id check error: %s", exc)

    # ── Check e6 : Scripts sans métadonnées ───────────────────────────────

    async def _check_scripts_metadata(self) -> None:
        """Détecte les scripts sans description."""
        try:
            import yaml
            from pathlib import Path

            scripts_file = Path(self._hass.config.config_dir) / "scripts.yaml"
            if not scripts_file.exists():
                return

            raw = await self._hass.async_add_executor_job(
                scripts_file.read_text, "utf-8"
            )
            scripts = yaml.safe_load(raw) or {}
            if not isinstance(scripts, dict):
                return

            for script_id, script_def in scripts.items():
                if not isinstance(script_def, dict):
                    continue
                entity_id = f"script.{script_id}"
                if entity_id in self._ignored_entity_ids:
                    continue
                alias = script_def.get("alias", script_id)
                if not script_def.get("description", "").strip():
                    self._add_issue(
                        issue_id=f"compliance_script_no_desc_{script_id}",
                        issue_type="compliance_script_no_description",
                        severity="low",
                        entity_id=entity_id,
                        alias=alias,
                        message=(
                            f"Script '{alias}' has no description. "
                            f"Add a 'description:' field to document what it does."
                        ),
                        message_key="script_no_description",
                        message_params={"alias": alias},
                    )
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Script check error: %s", exc)

    # ── Check e7 : Entités sans area ──────────────────────────────────────

    async def _check_entities_without_area(self) -> None:
        """Détecte les entités physiques sans area assignée."""
        try:
            entity_reg = er.async_get(self._hass)
            no_area: list[tuple[str, str]] = []

            for entry in entity_reg.entities.values():
                if entry.entity_id in self._ignored_entity_ids:
                    continue
                if entry.domain not in _PHYSICAL_DOMAINS:
                    continue
                if entry.disabled_by:
                    continue
                if not entry.device_id:
                    # Pas un appareil physique réel
                    continue
                if entry.area_id:
                    # Area assignée directement à l'entité
                    continue

                # Vérifier si le device parent a une area
                # (HA hérite l'area du device si non assignée à l'entité)
                no_area.append((entry.entity_id, entry.device_id or ""))

            # Toujours signaler individuellement (max 150 pour limiter la charge)
            # La pagination du frontend Conformité gère les grandes listes
            MAX_INDIVIDUAL = 150
            reported = no_area[:MAX_INDIVIDUAL]
            for entity_id, _ in reported:
                state = self._hass.states.get(entity_id)
                name = (state.attributes.get("friendly_name") if state else None) or entity_id
                self._add_issue(
                    issue_id=f"compliance_no_area_{entity_id}",
                    issue_type="compliance_entity_no_area",
                    severity="low",
                    entity_id=entity_id,
                    alias=name,
                    message=(
                        f"Entity '{name}' ({entity_id}) has no area assigned. "
                        f"Assign it via Settings → Devices."
                    ),
                    message_key="entity_no_area",
                    message_params={"name": name, "entity_id": entity_id},
                )
            # Si tronqué, ajouter une note informative
            if len(no_area) > MAX_INDIVIDUAL:
                self._add_issue(
                    issue_id="compliance_entities_no_area_truncated",
                    issue_type="compliance_entity_no_area_bulk",
                    severity="low",
                    entity_id="entity.*",
                    alias=f"… +{len(no_area) - MAX_INDIVIDUAL} more",
                    message=(
                        f"{len(no_area) - MAX_INDIVIDUAL} additional entities without area (not shown). "
                        f"Assign areas via Settings → Devices & Services → Devices."
                    ),
                    message_key="entities_no_area_bulk",
                    message_params={"count": len(no_area) - MAX_INDIVIDUAL},
                )
        except Exception as exc:
            _LOGGER.debug("[HACA Compliance] Entity area check error: %s", exc)

    # ── Check e8 : Helpers sans icône ou area ──────────────────────────────

    async def _check_helpers_metadata(self) -> None:
        """Détecte les helpers utilisateur sans icône ou sans area."""
        try:
            entity_reg = er.async_get(self._hass)
            area_reg   = ar.async_get(self._hass)
        except Exception:
            return

        HELPER_DOMAINS = {
            "input_boolean", "input_text", "input_number",
            "input_select", "input_datetime", "input_button",
            "timer", "counter", "schedule",
        }

        for entry in entity_reg.entities.values():
            if entry.entity_id in self._ignored_entity_ids:
                continue
            if entry.domain not in HELPER_DOMAINS:
                continue
            if entry.disabled_by:
                continue
            # Only flag helpers that have a friendly name (managed by the user)
            state = self._hass.states.get(entry.entity_id)
            if not state:
                continue
            friendly_name = state.attributes.get("friendly_name", "")
            if not friendly_name or friendly_name == entry.entity_id:
                # Missing name already reported by _check_entity_names
                continue

            # Check icon
            icon = entry.icon or state.attributes.get("icon")
            if not icon:
                self._add_issue(
                    issue_id=f"compliance_helper_no_icon_{entry.entity_id}",
                    issue_type="compliance_helper_no_icon",
                    severity="low",
                    entity_id=entry.entity_id,
                    alias=friendly_name,
                    message=(
                        f"Helper '{friendly_name}' has no icon. "
                        f"Add an icon in Settings → Helpers."
                    ),
                    message_key="helper_no_icon",
                    message_params={"name": friendly_name, "entity_id": entry.entity_id},
                )

            # Check area (directly on entry, or inherited from device)
            has_area = bool(entry.area_id)
            if not has_area and entry.device_id:
                dev_reg = dr.async_get(self._hass)
                device  = dev_reg.async_get(entry.device_id)
                has_area = bool(device and device.area_id)
            if not has_area:
                self._add_issue(
                    issue_id=f"compliance_helper_no_area_{entry.entity_id}",
                    issue_type="compliance_helper_no_area",
                    severity="low",
                    entity_id=entry.entity_id,
                    alias=friendly_name,
                    message=(
                        f"Helper '{friendly_name}' has no area assigned. "
                        f"Assign it in Settings → Helpers."
                    ),
                    message_key="helper_no_area",
                    message_params={"name": friendly_name, "entity_id": entry.entity_id},
                )
