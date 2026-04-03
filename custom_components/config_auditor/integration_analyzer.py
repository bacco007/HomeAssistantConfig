"""H.A.C.A — Integration Analyzer (Module 22).

On-demand analysis of all installed integrations:
- Core HA integrations (in use via config entries)
- HACS integrations, themes, cards (from hass.data["hacs"])
- Custom integrations not managed by HACS
- Supervisor add-ons / apps (if available)

For each integration, reports: name, domain, type, version,
in-use status, entity count, install date, documentation URL,
and update availability.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.loader import async_get_integrations, Integration

_LOGGER = logging.getLogger(__name__)

# Integration types
TYPE_CORE = "core"
TYPE_HACS = "hacs"
TYPE_CUSTOM = "custom"
TYPE_HACS_CARD = "hacs_card"
TYPE_HACS_THEME = "hacs_theme"
TYPE_APP = "app"

# HACS internal category mapping
_HACS_CATEGORY_TO_TYPE = {
    "integration": TYPE_HACS,
    "plugin": TYPE_HACS_CARD,
    "theme": TYPE_HACS_THEME,
    "dashboard": TYPE_HACS_CARD,
    "python_script": TYPE_HACS,
    "appdaemon": TYPE_HACS,
    "netdaemon": TYPE_HACS,
}


class IntegrationAnalyzer:
    """Analyze installed integrations."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def async_analyze(self) -> dict[str, Any]:
        """Run the full integration analysis."""
        hass = self.hass
        results: list[dict[str, Any]] = []

        # ── 1. Gather entity counts per config_entry ──────────────────────
        entity_reg = er.async_get(hass)
        entities_by_domain: dict[str, int] = {}
        entities_by_entry: dict[str, int] = {}
        for entry in entity_reg.entities.values():
            domain = entry.platform or ""
            entities_by_domain[domain] = entities_by_domain.get(domain, 0) + 1
            if entry.config_entry_id:
                entities_by_entry[entry.config_entry_id] = (
                    entities_by_entry.get(entry.config_entry_id, 0) + 1
                )

        # ── 2. Config entries — track active and disabled separately ─────
        config_entries = hass.config_entries.async_entries()
        entries_by_domain: dict[str, list] = {}
        disabled_by_domain: dict[str, list] = {}
        for ce in config_entries:
            if hasattr(ce, "disabled_by") and ce.disabled_by:
                disabled_by_domain.setdefault(ce.domain, []).append(ce)
            else:
                entries_by_domain.setdefault(ce.domain, []).append(ce)

        # ── 3. Scan custom_components directory ───────────────────────────
        custom_domains: dict[str, dict] = {}  # domain → manifest data
        config_dir = Path(hass.config.config_dir)
        custom_dir = config_dir / "custom_components"

        def _scan_custom_components():
            found = {}
            if not custom_dir.is_dir():
                return found
            for entry_path in sorted(custom_dir.iterdir()):
                if not entry_path.is_dir():
                    continue
                manifest_path = entry_path / "manifest.json"
                if not manifest_path.exists():
                    continue
                try:
                    import json
                    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                    domain = manifest.get("domain", entry_path.name)
                    manifest["_dir_name"] = entry_path.name
                    manifest["_dir_mtime"] = os.path.getmtime(str(entry_path))
                    found[domain] = manifest
                except Exception as exc:
                    _LOGGER.debug("Error reading manifest %s: %s", manifest_path, exc)
            return found

        try:
            custom_domains = await hass.async_add_executor_job(_scan_custom_components)
        except Exception as exc:
            _LOGGER.warning("Failed to scan custom_components: %s", exc)

        # ── 3b. Fallback: also detect custom via HA loader ────────────────
        # If custom_components scan returned results, verify. If empty,
        # use the loader to detect custom integrations as fallback.
        custom_domains_from_loader: set[str] = set()
        try:
            # All domains with active config entries
            all_domains = set(entries_by_domain.keys())
            if all_domains:
                integrations = await async_get_integrations(hass, list(all_domains))
                for domain, integ in integrations.items():
                    if isinstance(integ, Integration) and not integ.is_built_in:
                        custom_domains_from_loader.add(domain)
        except Exception as exc:
            _LOGGER.debug("Loader fallback error: %s", exc)

        # Merge: if a domain is detected as custom by the loader but missed
        # by the directory scan, add it
        for domain in custom_domains_from_loader:
            if domain not in custom_domains:
                custom_domains[domain] = {"domain": domain, "name": domain}

        _LOGGER.debug(
            "IntegrationAnalyzer: %d custom_components found (%d from dir, %d from loader)",
            len(custom_domains), len(custom_domains) - len(custom_domains_from_loader),
            len(custom_domains_from_loader),
        )

        # ── 4. HACS data (if available) ───────────────────────────────────
        hacs_repos: dict[str, dict] = {}  # domain or repo_name → repo data
        hacs_available = False
        try:
            hacs_obj = hass.data.get("hacs")
            if hacs_obj:
                hacs_available = True
                # HACS 2.x: hacs_obj.repositories.list_all or similar
                repos_list = None
                if hasattr(hacs_obj, "repositories"):
                    repo_mgr = hacs_obj.repositories
                    if hasattr(repo_mgr, "list_all"):
                        repos_list = repo_mgr.list_all
                    elif hasattr(repo_mgr, "list_downloaded"):
                        repos_list = repo_mgr.list_downloaded
                    elif isinstance(repo_mgr, dict):
                        repos_list = list(repo_mgr.values())
                    elif hasattr(repo_mgr, "__iter__"):
                        repos_list = list(repo_mgr)

                if repos_list:
                    for repo in repos_list:
                        try:
                            data = repo.data if hasattr(repo, "data") else repo
                            domain = ""
                            if hasattr(data, "domain"):
                                domain = data.domain
                            elif isinstance(data, dict):
                                domain = data.get("domain", "")

                            name = ""
                            if hasattr(data, "full_name"):
                                name = data.full_name
                            elif isinstance(data, dict):
                                name = data.get("full_name", data.get("name", ""))

                            category = ""
                            if hasattr(data, "category"):
                                category = data.category
                            elif isinstance(data, dict):
                                category = data.get("category", "")

                            installed = False
                            if hasattr(data, "installed"):
                                installed = bool(data.installed)
                            elif isinstance(data, dict):
                                installed = bool(data.get("installed", False))

                            installed_version = ""
                            if hasattr(data, "installed_version"):
                                installed_version = str(data.installed_version or "")
                            elif isinstance(data, dict):
                                installed_version = str(data.get("installed_version", ""))

                            available_version = ""
                            if hasattr(data, "available_version"):
                                available_version = str(data.available_version or "")
                            elif isinstance(data, dict):
                                available_version = str(
                                    data.get("available_version",
                                             data.get("last_version", ""))
                                )

                            repo_url = ""
                            if name and "/" in name:
                                repo_url = f"https://github.com/{name}"

                            if not installed:
                                continue

                            key = domain or name
                            hacs_repos[key] = {
                                "name": name,
                                "domain": domain,
                                "category": str(category),
                                "installed_version": installed_version,
                                "available_version": available_version,
                                "repo_url": repo_url,
                                "update_available": bool(
                                    available_version
                                    and installed_version
                                    and available_version != installed_version
                                ),
                            }
                        except Exception:
                            continue
                    _LOGGER.debug(
                        "IntegrationAnalyzer: %d HACS repos found (keys: %s)",
                        len(hacs_repos), list(hacs_repos.keys()),
                    )
                else:
                    _LOGGER.debug("IntegrationAnalyzer: HACS detected but no repos_list found")
        except Exception as exc:
            _LOGGER.debug("HACS data read error: %s", exc)

        # Build comprehensive HACS lookup: index by domain, key, and repo slug
        _hacs_lookup: dict[str, dict] = {}
        for key, info in hacs_repos.items():
            _hacs_lookup[key] = info
            d = info.get("domain", "")
            if d:
                _hacs_lookup[d] = info
            # Also index by repo slug (last part of full_name)
            # e.g. "JeanMarc-Labs/haca" → index by "haca"
            full = info.get("name", "")
            if "/" in full:
                slug = full.rsplit("/", 1)[1].lower()
                _hacs_lookup[slug] = info

        # ── 5. Build CUSTOM + HACS integration list ───────────────────────
        seen_domains: set[str] = set()

        for domain, manifest in custom_domains.items():
            seen_domains.add(domain)
            name = manifest.get("name", domain)
            version = manifest.get("version", "")
            doc_url = manifest.get("documentation", "")

            # Check if HACS knows about this
            # Try: domain, manifest dir name, manifest name
            hacs_info = (
                _hacs_lookup.get(domain)
                or _hacs_lookup.get(manifest.get("_dir_name", "").lower())
                or {}
            )
            category = hacs_info.get("category", "")
            itype = _HACS_CATEGORY_TO_TYPE.get(category, TYPE_CUSTOM)
            if hacs_info:
                itype = _HACS_CATEGORY_TO_TYPE.get(category, TYPE_HACS)

            # In-use / disabled / unused
            domain_entries = entries_by_domain.get(domain, [])
            domain_disabled = disabled_by_domain.get(domain, [])
            in_use = len(domain_entries) > 0
            disabled = not in_use and len(domain_disabled) > 0
            disabled_by = ""
            if disabled and hasattr(domain_disabled[0], "disabled_by"):
                disabled_by = str(domain_disabled[0].disabled_by or "")
            entity_count = entities_by_domain.get(domain, 0)

            # Install date from config entry (active or disabled) or directory mtime
            installed_date = None
            for ce in (domain_entries or domain_disabled):
                if hasattr(ce, "created_at") and ce.created_at:
                    installed_date = ce.created_at.isoformat()
                    break
            if not installed_date:
                mtime = manifest.get("_dir_mtime")
                # Ignore epoch artifacts (mtime < 2020-01-01)
                if mtime and mtime > 1577836800:
                    installed_date = datetime.fromtimestamp(
                        mtime, tz=timezone.utc
                    ).isoformat()

            # Age in days
            age_days = None
            if installed_date:
                try:
                    dt = datetime.fromisoformat(installed_date)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    age_days = (datetime.now(timezone.utc) - dt).days
                    if age_days > 10000: age_days = None  # epoch artifact
                except Exception:
                    pass

            results.append({
                "domain": domain,
                "name": name,
                "type": itype,
                "version": hacs_info.get("installed_version") or version,
                "available_version": hacs_info.get("available_version", ""),
                "update_available": hacs_info.get("update_available", False),
                "in_use": in_use,
                "disabled": disabled,
                "disabled_by": disabled_by,
                "entity_count": entity_count,
                "config_entries": len(domain_entries) + len(domain_disabled),
                "installed_date": installed_date,
                "age_days": age_days,
                "documentation": hacs_info.get("repo_url") or doc_url,
            })

        # ── 6. HACS themes/cards not in custom_components ─────────────────
        for key, hacs_info in hacs_repos.items():
            domain = hacs_info.get("domain", "")
            if domain and domain in seen_domains:
                continue
            name = hacs_info.get("name", key)
            if name in seen_domains:
                continue
            seen_domains.add(name)

            category = hacs_info.get("category", "")
            itype = _HACS_CATEGORY_TO_TYPE.get(category, TYPE_HACS)

            results.append({
                "domain": domain or name,
                "name": name,
                "type": itype,
                "version": hacs_info.get("installed_version", ""),
                "available_version": hacs_info.get("available_version", ""),
                "update_available": hacs_info.get("update_available", False),
                "in_use": True,  # HACS themes/cards are used if installed
                "entity_count": 0,
                "config_entries": 0,
                "installed_date": None,
                "age_days": None,
                "documentation": hacs_info.get("repo_url", ""),
            })

        # ── 7. Core HA integrations (with active config entries) ──────────
        core_domains = set(entries_by_domain.keys()) - seen_domains
        for domain in sorted(core_domains):
            domain_entries = entries_by_domain[domain]
            entity_count = entities_by_domain.get(domain, 0)

            # Get integration name from HA loader
            name = domain
            doc_url = f"https://www.home-assistant.io/integrations/{domain}/"
            try:
                integrations = await async_get_integrations(hass, [domain])
                integ = integrations.get(domain)
                if integ and isinstance(integ, Integration):
                    name = integ.name or domain
                    doc_url = integ.documentation or doc_url
            except Exception:
                pass

            # Install date
            installed_date = None
            for ce in domain_entries:
                if hasattr(ce, "created_at") and ce.created_at:
                    installed_date = ce.created_at.isoformat()
                    break

            age_days = None
            if installed_date:
                try:
                    dt = datetime.fromisoformat(installed_date)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    age_days = (datetime.now(timezone.utc) - dt).days
                    if age_days > 10000: age_days = None  # epoch artifact
                except Exception:
                    pass

            results.append({
                "domain": domain,
                "name": name,
                "type": TYPE_CORE,
                "version": hass.config.version if hasattr(hass.config, "version") else "",
                "available_version": "",
                "update_available": False,
                "in_use": True,
                "entity_count": entity_count,
                "config_entries": len(domain_entries),
                "installed_date": installed_date,
                "age_days": age_days,
                "documentation": doc_url,
            })

        # ── 7b. Supervisor add-ons (apps) ─────────────────────────────────
        supervisor_available = False
        try:
            # Primary method: hass.data["hassio_supervisor_info"]["addons"]
            # This is populated by the hassio component at startup
            sup_info = hass.data.get("hassio_supervisor_info")
            if sup_info and isinstance(sup_info, dict):
                addon_list = sup_info.get("addons", [])
                if addon_list:
                    supervisor_available = True
                    _LOGGER.debug(
                        "IntegrationAnalyzer: found %d supervisor addons via hassio_supervisor_info",
                        len(addon_list),
                    )
                    # Detailed info per addon (version_latest, auto_update, etc.)
                    addons_detail = hass.data.get("hassio_addons_info") or {}

                    for addon in addon_list:
                        if not isinstance(addon, dict):
                            continue
                        slug = addon.get("slug", "")
                        if not slug:
                            continue
                        name = addon.get("name", slug)
                        state = addon.get("state", "unknown")
                        installed_ver = addon.get("version", "")
                        # version_latest from detail or from supervisor info
                        detail = addons_detail.get(slug) or {}
                        available_ver = (
                            detail.get("version_latest")
                            or addon.get("version_latest", "")
                        )
                        update_avail = addon.get("update_available", False)
                        if not update_avail and available_ver and installed_ver:
                            update_avail = (available_ver != installed_ver)
                        url = addon.get("url") or detail.get("url", "")

                        results.append({
                            "domain": f"addon_{slug}",
                            "name": name,
                            "type": TYPE_APP,
                            "version": installed_ver,
                            "available_version": str(available_ver) if available_ver else "",
                            "update_available": bool(update_avail),
                            "in_use": state == "started",
                            "entity_count": 0,
                            "config_entries": 1 if state == "started" else 0,
                            "installed_date": None,
                            "age_days": None,
                            "documentation": url,
                            "addon_state": state,
                        })

            # Fallback: check if hassio_info exists (Supervisor is present but addons not loaded yet)
            if not supervisor_available:
                hassio_info = hass.data.get("hassio_info")
                if hassio_info:
                    supervisor_available = True  # Supervisor exists, just no addons yet
                    _LOGGER.debug("IntegrationAnalyzer: Supervisor detected via hassio_info but no addons data")

        except Exception as exc:
            _LOGGER.debug("Supervisor add-on scan error: %s", exc)

        # ── 8. Summary stats ──────────────────────────────────────────────
        total = len(results)
        hacs_count = sum(1 for r in results if r["type"] == TYPE_HACS)
        core_count = sum(1 for r in results if r["type"] == TYPE_CORE)
        custom_count = sum(1 for r in results if r["type"] == TYPE_CUSTOM)
        card_count = sum(1 for r in results if r["type"] == TYPE_HACS_CARD)
        theme_count = sum(1 for r in results if r["type"] == TYPE_HACS_THEME)
        app_count = sum(1 for r in results if r["type"] == TYPE_APP)
        unused_count = sum(1 for r in results if not r["in_use"] and not r.get("disabled"))
        disabled_count = sum(1 for r in results if r.get("disabled"))
        update_count = sum(1 for r in results if r.get("update_available"))

        # Sort: unused first, then by type, then by name
        type_order = {TYPE_HACS: 0, TYPE_CUSTOM: 1, TYPE_HACS_CARD: 2,
                      TYPE_HACS_THEME: 3, TYPE_APP: 4, TYPE_CORE: 5}
        results.sort(key=lambda r: (
            0 if not r["in_use"] else 1,
            type_order.get(r["type"], 9),
            r["name"].lower(),
        ))

        return {
            "integrations": results,
            "total": total,
            "hacs_count": hacs_count,
            "core_count": core_count,
            "custom_count": custom_count,
            "card_count": card_count,
            "theme_count": theme_count,
            "app_count": app_count,
            "unused_count": unused_count,
            "disabled_count": disabled_count,
            "update_count": update_count,
            "hacs_available": hacs_available,
            "supervisor_available": supervisor_available,
        }
