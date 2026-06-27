"""Sensor platform for Custom Component Monitor."""
from __future__ import annotations

import asyncio
import json
import logging
import re
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.util import dt as dt_util

from .const import (
    AI_CACHE_STORAGE_KEY,
    AI_CALL_TIMEOUT,
    AI_CATEGORY_ALIASES,
    AI_CATEGORY_OPTIONS,
    ATTR_CATEGORIES,
    ATTR_COMPONENTS,
    ATTR_EXCLUDED_COMPONENTS,
    ATTR_SUMMARY,
    ATTR_TOTAL_COMPONENTS,
    ATTR_UNUSED_COMPONENTS,
    ATTR_UPDATES,
    ATTR_USED_COMPONENTS,
    CATEGORY_MAP,
    CONF_AI_CATEGORIZATION_ENABLED,
    CONF_AI_TASK_ENTITY,
    CONF_EXCLUDE,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    SENSOR_ALL_COMPONENTS,
    SENSOR_HACS_UPDATES,
    SENSOR_UNUSED_FRONTEND,
    SENSOR_UNUSED_INTEGRATIONS,
    SENSOR_UNUSED_THEMES,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=DEFAULT_SCAN_INTERVAL)


# ---------------------------------------------------------------------------
# ComponentScanner — reads HACS data and enriches it
# ---------------------------------------------------------------------------


class ComponentScanner:
    """Scanner for HACS-installed custom components."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the scanner."""
        self.hass = hass
        self.config_dir = Path(hass.config.config_dir)
        self._hacs_repositories: dict[str, Any] | None = None

    # -- storage helpers -----------------------------------------------------

    async def _load_storage_file(self, filename: str) -> dict[str, Any]:
        """Load a .storage/<filename> JSON file and return its ``data`` key."""
        storage_path = self.config_dir / ".storage" / filename

        def _read() -> dict[str, Any]:
            if not storage_path.exists():
                return {}
            with open(storage_path, encoding="utf-8") as fh:
                return json.load(fh)

        try:
            raw = await self.hass.async_add_executor_job(_read)
            return raw.get("data", {})
        except (json.JSONDecodeError, OSError) as exc:
            _LOGGER.debug("Could not load storage file %s: %s", filename, exc)
            return {}

    @staticmethod
    def _make_ha_yaml_loader() -> type:
        """Return a YAML SafeLoader subclass that handles HA custom tags."""
        loader = type("HALoader", (yaml.SafeLoader,), {})
        # Handle !include, !include_dir_merge_named, !secret, etc.
        for tag in ("!include", "!include_dir_merge_named",
                    "!include_dir_list", "!include_dir_named",
                    "!secret", "!env_var"):
            loader.add_constructor(
                tag, lambda l, n: l.construct_scalar(n)
            )
        return loader

    def _list_yaml_dashboard_files(self) -> list[Path]:
        """Return file paths for YAML-mode Lovelace dashboards.

        Reads ``configuration.yaml`` to find dashboards registered with
        ``mode: yaml`` and returns their resolved file paths.
        """
        config_yaml = self.config_dir / "configuration.yaml"
        if not config_yaml.exists():
            return []
        try:
            loader = self._make_ha_yaml_loader()
            with open(config_yaml, encoding="utf-8") as fh:
                raw = yaml.load(fh, Loader=loader) or {}
        except (yaml.YAMLError, OSError):
            return []
        lovelace = raw.get("lovelace", {}) or {}
        # `lovelace:` / `dashboards:` may be a string (e.g. `dashboards: !include
        # dashboards.yaml`, which our loader represents as a scalar) rather than a
        # mapping. Guard so the whole scan doesn't abort (#54).
        if not isinstance(lovelace, dict):
            return []
        dashboards = lovelace.get("dashboards", {}) or {}
        if not isinstance(dashboards, dict):
            dashboards = {}
        paths: list[Path] = []
        for dash_cfg in dashboards.values():
            if not isinstance(dash_cfg, dict):
                continue
            if dash_cfg.get("mode") != "yaml":
                continue
            filename = dash_cfg.get("filename")
            if not filename:
                continue
            resolved = self.config_dir / filename
            if resolved.exists():
                paths.append(resolved)
        # Also check if the default dashboard is YAML mode
        if lovelace.get("mode") == "yaml":
            default = self.config_dir / lovelace.get("filename", "ui-lovelace.yaml")
            if default.exists():
                paths.append(default)
        return paths

    async def _load_hacs_repositories(self) -> dict[str, Any]:
        """Return HACS repository dict (cached for the scan cycle)."""
        if self._hacs_repositories is None:
            self._hacs_repositories = await self._load_storage_file(
                "hacs.repositories"
            )
        return self._hacs_repositories

    def _invalidate_cache(self) -> None:
        """Clear cached data so the next scan re-reads from disk."""
        self._hacs_repositories = None

    # -- date helpers --------------------------------------------------------

    def _get_install_timestamp(self, path: Path) -> float | None:
        """Return the best-effort install timestamp for *path*.

        On Linux ``st_birthtime`` is unavailable, so we use
        ``min(st_ctime, st_mtime)`` as an approximation.
        """
        try:
            if not path.exists():
                return None
            stat = path.stat()
            if hasattr(stat, "st_birthtime"):
                return stat.st_birthtime
            return min(stat.st_ctime, stat.st_mtime)
        except OSError:
            return None

    def _resolve_install_path(self, repo: dict[str, Any]) -> Path | None:
        """Determine the local filesystem path for an installed HACS repo."""
        category = repo.get("category", "")
        full_name = repo.get("full_name", "")
        repo_short = full_name.split("/")[-1] if "/" in full_name else full_name
        domain = repo.get("domain", "")

        if category == "integration":
            if domain:
                candidate = self.config_dir / "custom_components" / domain
                if candidate.exists():
                    return candidate
            # fallback: try repo manifest domain
            rm = repo.get("repository_manifest", {})
            if isinstance(rm, dict) and rm.get("domain"):
                candidate = self.config_dir / "custom_components" / rm["domain"]
                if candidate.exists():
                    return candidate
        elif category == "theme":
            rm = repo.get("repository_manifest", {}) or {}
            # Build candidate names from various sources
            candidates = [repo_short]
            if repo.get("name"):
                candidates.append(repo["name"])
            rm_name = rm.get("name", "")
            if rm_name:
                candidates.append(rm_name)
            # Strip common repo name prefixes
            for prefix in ("ha-", "homeassistant-", "home-assistant-", "lovelace-"):
                if repo_short.lower().startswith(prefix):
                    candidates.append(repo_short[len(prefix):])
            # Also strip trailing "-theme" / "-themes" suffix
            for cand in list(candidates):
                low = cand.lower()
                for suffix in ("-theme", "-themes"):
                    if low.endswith(suffix):
                        candidates.append(cand[:len(cand) - len(suffix)])
            # Try the YAML filename (without extension) from manifest
            rm_filename = rm.get("filename", "")
            if rm_filename:
                stem = rm_filename.rsplit(".", 1)[0]
                candidates.append(stem)
            themes_dir = self.config_dir / "themes"
            for name in candidates:
                if not name:
                    continue
                candidate = themes_dir / name
                if candidate.exists():
                    return candidate
            # Broader match: check if dir name appears in a candidate or vice versa
            if themes_dir.exists():
                for child in themes_dir.iterdir():
                    if child.is_dir():
                        dir_low = child.name.lower()
                        for name in candidates:
                            if not name:
                                continue
                            name_low = name.lower()
                            if name_low in dir_low or dir_low in name_low:
                                return child
        elif category == "plugin":
            candidates = [repo_short]
            if repo.get("name"):
                candidates.append(repo["name"])
            if repo_short.startswith("ha-"):
                candidates.append(repo_short[3:])
            community_dir = self.config_dir / "www" / "community"
            for name in candidates:
                if not name:
                    continue
                candidate = community_dir / name
                if candidate.exists():
                    return candidate

        return None

    # -- theme helpers -------------------------------------------------------

    @staticmethod
    def _normalise_theme_name(name: str) -> str:
        """Normalise a theme name for comparison.

        Converts to lowercase and replaces spaces/underscores with dashes so
        that ``Transformers Dirty Metal`` matches ``transformers-dirty-metal``.
        """
        return re.sub(r"[\s_]+", "-", name.strip()).lower()

    async def _get_theme_variants(self, theme_path: Path) -> list[str]:
        """Extract theme variant names from a theme YAML directory or file.

        Theme YAML files use top-level keys as variant names, e.g.::

            weylandyutani:
              primary-color: "#00ff00"
            Transformers Dark:
              primary-color: "#111"
        """

        def _read_variants() -> list[str]:
            files: list[Path] = []
            if theme_path.is_file():
                files = [theme_path]
            elif theme_path.is_dir():
                files = list(theme_path.glob("*.yaml")) + list(
                    theme_path.glob("*.yml")
                )
            variants: list[str] = []
            for fp in files:
                try:
                    for line in fp.read_text(encoding="utf-8").splitlines():
                        # Top-level key: no leading whitespace, has a colon
                        if (
                            line
                            and not line[0].isspace()
                            and ":" in line
                            and not line.startswith("#")
                            and not line.startswith("---")
                        ):
                            key = line.split(":", 1)[0].strip().strip("\"'")
                            if key and len(key) < 80:
                                variants.append(key)
                except OSError:
                    continue
            return variants

        return await self.hass.async_add_executor_job(_read_variants)

    async def _collect_used_theme_names(self) -> set[str]:
        """Return the normalised set of theme names actively in use.

        Checks:
        * system-wide default theme (core.config → frontend)
        * per-user theme (auth → users, frontend.user_data_*)
        * all lovelace dashboards (view-level and card-level ``theme`` keys)
        """
        used: set[str] = set()

        # 1) System default theme in core.config
        core_cfg = await self._load_storage_file("core.config")
        frontend = core_cfg.get("frontend", {})
        if isinstance(frontend, dict):
            default_theme = frontend.get("selected_theme") or frontend.get("theme")
            if default_theme and isinstance(default_theme, str):
                used.add(self._normalise_theme_name(default_theme))

        # 2) Per-user theme preferences
        auth_data = await self._load_storage_file("auth")
        for user in auth_data.get("users", []):
            for key in ("user_data", "local_data", "data"):
                ud = user.get(key, {})
                if isinstance(ud, dict):
                    t = ud.get("theme")
                    if t and isinstance(t, str):
                        used.add(self._normalise_theme_name(t))

        # Also check frontend.user_data_* files
        def _list_frontend_files() -> list[str]:
            storage = self.config_dir / ".storage"
            if not storage.exists():
                return []
            return [
                f.name
                for f in storage.iterdir()
                if f.is_file() and f.name.startswith("frontend")
            ]

        frontend_files = await self.hass.async_add_executor_job(
            _list_frontend_files
        )
        for fname in frontend_files:
            fdata = await self._load_storage_file(fname)
            if isinstance(fdata, dict):
                t = fdata.get("selectedTheme") or fdata.get("selected_theme")
                if t and isinstance(t, str):
                    used.add(self._normalise_theme_name(t))

        # 3) All lovelace dashboard files — recursive search for "theme" keys
        def _list_lovelace_files() -> list[str]:
            storage = self.config_dir / ".storage"
            if not storage.exists():
                return []
            skip = {"lovelace_resources", "lovelace_dashboards"}
            return [
                f.name
                for f in storage.iterdir()
                if f.is_file()
                and f.name.startswith("lovelace")
                and f.name not in skip
            ]

        lovelace_files = await self.hass.async_add_executor_job(
            _list_lovelace_files
        )

        def _read_json(path: Path) -> dict:
            with open(path, encoding="utf-8") as fh:
                return json.load(fh)

        for lf in lovelace_files:
            lf_path = self.config_dir / ".storage" / lf
            try:
                raw = await self.hass.async_add_executor_job(_read_json, lf_path)
            except (json.JSONDecodeError, OSError):
                continue
            self._extract_theme_refs(raw, used)

        # Also scan YAML-mode dashboards for theme references
        def _read_yaml(path: Path) -> Any:
            loader = self._make_ha_yaml_loader()
            with open(path, encoding="utf-8") as fh:
                return yaml.load(fh, Loader=loader)

        yaml_dashboards = await self.hass.async_add_executor_job(
            self._list_yaml_dashboard_files
        )
        for yf in yaml_dashboards:
            try:
                raw = await self.hass.async_add_executor_job(_read_yaml, yf)
            except (yaml.YAMLError, OSError):
                continue
            if raw:
                self._extract_theme_refs(raw, used)

        _LOGGER.debug("Used theme names (normalised): %s", used)
        return used

    def _extract_theme_refs(self, obj: Any, out: set[str]) -> None:
        """Recursively collect all ``theme`` string values from *obj*."""
        if isinstance(obj, dict):
            t = obj.get("theme")
            if isinstance(t, str) and t:
                out.add(self._normalise_theme_name(t))
            for v in obj.values():
                self._extract_theme_refs(v, out)
        elif isinstance(obj, list):
            for item in obj:
                self._extract_theme_refs(item, out)

    async def scan_themes(self) -> dict[str, Any]:
        """Scan HACS-installed themes and determine usage.

        Returns ``{"total": int, "used": [...], "unused": [...]}``.
        """
        hacs_repos = await self._load_hacs_repositories()
        used_names = await self._collect_used_theme_names()
        now = dt_util.now()

        used_list: list[dict[str, Any]] = []
        unused_list: list[dict[str, Any]] = []

        for _repo_id, repo in hacs_repos.items():
            if not isinstance(repo, dict):
                continue
            if repo.get("category") != "theme" or not repo.get("installed", False):
                continue

            full_name = repo.get("full_name", "")
            repo_manifest = repo.get("repository_manifest", {}) or {}
            name = (
                repo.get("manifest_name")
                or repo.get("name")
                or repo_manifest.get("name")
                or (full_name.split("/")[-1] if "/" in full_name else full_name)
            )

            install_path = await self.hass.async_add_executor_job(
                self._resolve_install_path, repo
            )
            days_installed: int | None = None
            if install_path is not None:
                ts = await self.hass.async_add_executor_job(
                    self._get_install_timestamp, install_path
                )
                if ts is not None:
                    installed_dt = datetime.fromtimestamp(ts, tz=now.tzinfo)
                    days_installed = (now - installed_dt).days

            # Get variant names from the actual YAML file(s)
            variants: list[str] = []
            if install_path is not None:
                variants = await self._get_theme_variants(install_path)

            # The repo is "used" if ANY of its variants appear in used_names
            is_used = False
            if variants:
                for v in variants:
                    if self._normalise_theme_name(v) in used_names:
                        is_used = True
                        break
            else:
                # No variants extracted — fall back to repo name matching
                if self._normalise_theme_name(name) in used_names:
                    is_used = True

            entry = {
                "name": name,
                "repository": (
                    f"https://github.com/{full_name}" if full_name else ""
                ),
                "version": repo.get("version_installed", "unknown"),
                "days_installed": days_installed,
                "variants": len(variants),
            }

            if is_used:
                used_list.append(entry)
            else:
                unused_list.append(entry)

        return {
            "total": len(used_list) + len(unused_list),
            "used": used_list,
            "unused": unused_list,
        }

    # -- frontend / card helpers ---------------------------------------------

    def _derive_card_types(self, repo: dict[str, Any]) -> list[str]:
        """Derive the custom card type name(s) a HACS plugin provides.

        Returns lowercased card type names (without the ``custom:`` prefix).
        E.g. ``["weather-forecast-card"]``.

        Uses multiple strategies to handle cases where the JS filename
        doesn't match the registered custom element name (e.g. Firemote,
        Mushroom).
        """
        rm = repo.get("repository_manifest", {}) or {}
        full_name = repo.get("full_name", "")
        repo_short = full_name.split("/")[-1] if "/" in full_name else full_name

        names: list[str] = []

        # 1) From manifest filename
        manifest_fn = rm.get("filename", "")
        if manifest_fn and manifest_fn.endswith(".js"):
            names.append(manifest_fn[:-3].lower())

        # 2) Scan the community directory for .js files and extract
        #    customElements.define calls from them
        candidates = [repo_short]
        if repo_short.startswith("ha-"):
            candidates.append(repo_short[3:])
        if repo_short.startswith("HA-"):
            candidates.append(repo_short[3:])
        community_dir = self.config_dir / "www" / "community"
        for cname in candidates:
            d = community_dir / cname
            if d.is_dir():
                for js_file in d.glob("*.js"):
                    stem = js_file.stem.lower()
                    if stem not in names and not stem.endswith(".gz"):
                        names.append(stem)
                    # Strip common packaging suffixes so e.g.
                    # "mini-media-player-bundle" → "mini-media-player" (#60).
                    for suf in ("-bundle", "-min", ".min", "-umd", "-esm"):
                        if stem.endswith(suf):
                            base = stem[: -len(suf)]
                            if base and base not in names:
                                names.append(base)
                    # Extract actual registered custom element names from JS
                    ce_names = self._extract_custom_elements(js_file)
                    for ce in ce_names:
                        if ce not in names:
                            names.append(ce)

        # 2b) The repo name itself is very commonly the card type, even when the
        #     main element is registered via a non-literal the JS scan can't see
        #     (e.g. mini-media-player). Add it (and prefix-stripped form) (#60).
        repo_name = repo_short.lower()
        for cand in (repo_name, repo_name[3:] if repo_name.startswith("ha-") else ""):
            if cand and cand not in names:
                names.append(cand)

        # 3) Add prefix-stripped variants for every name collected so far
        #    (e.g. "lovelace-horizon-card" → "horizon-card")
        stripped_extras: list[str] = []
        for n in names:
            for prefix in ("ll-strategy-", "lovelace-", "ha-"):
                if n.startswith(prefix):
                    stripped = n[len(prefix):]
                    if stripped and stripped not in names and stripped not in stripped_extras:
                        stripped_extras.append(stripped)
        names.extend(stripped_extras)

        # 4) Fall back to repo short name if nothing found
        if not names:
            stripped = repo_short.lower()
            for prefix in ("ll-strategy-", "lovelace-", "ha-"):
                if stripped.startswith(prefix):
                    stripped = stripped[len(prefix):]
            names.append(stripped)

        return names

    _CE_DEFINE_RE = re.compile(
        r'customElements\.define\(\s*["\']([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)["\']',
        re.IGNORECASE,
    )

    def _extract_custom_elements(self, js_path: Path) -> list[str]:
        """Extract custom element names from customElements.define() calls.

        Reads up to 1MB of the JS file and returns all unique element names
        that look like card types (contain a hyphen, as required by the
        custom elements spec). Filters out editor elements.
        """
        try:
            # Read a bounded amount to avoid huge memory use on large bundles
            raw = js_path.read_bytes()[:1_048_576].decode("utf-8", errors="ignore")
        except OSError:
            return []

        found: list[str] = []
        for match in self._CE_DEFINE_RE.finditer(raw):
            name = match.group(1).lower()
            # Must contain a hyphen (custom elements spec requirement)
            if "-" not in name:
                continue
            # Skip editor elements — they aren't card types
            if name.endswith("-editor"):
                continue
            if name not in found:
                found.append(name)
        return found

    # -- icon library helpers ------------------------------------------------

    _ICON_PREFIX_RE = re.compile(
        r'window\.custom(?:Iconsets|Icons)\s*\[\s*["\']([a-zA-Z][a-zA-Z0-9_-]*)["\']\s*\]',
    )

    def _extract_icon_prefixes(self, js_path: Path) -> list[str]:
        """Extract icon set prefixes registered by a JS file.

        Looks for patterns like ``window.customIconsets["phu"]`` and
        ``window.customIcons["cil"]``.
        """
        try:
            raw = js_path.read_bytes()[:2_097_152].decode("utf-8", errors="ignore")
        except OSError:
            return []
        found: list[str] = []
        for match in self._ICON_PREFIX_RE.finditer(raw):
            prefix = match.group(1).lower()
            if prefix not in found:
                found.append(prefix)
        return found

    def _has_custom_element_calls(self, js_path: Path) -> bool:
        """Return True if the JS file contains any customElements.define() call.

        Unlike ``_extract_custom_elements`` which only matches string-literal
        element names, this catches minified forms like
        ``customElements.define(e,n)`` as well.
        """
        try:
            raw = js_path.read_bytes()[:2_097_152].decode("utf-8", errors="ignore")
        except OSError:
            return False
        return "customElements.define(" in raw

    def _scan_dir_for_icon_prefixes(
        self, community_dir: Path, cnames: list[str]
    ) -> list[str]:
        """Return icon-set prefixes from .js files in community subdirectories.

        Consolidates the directory scan and file reads into a single executor
        call so no blocking I/O runs on the async event loop.
        """
        prefixes: list[str] = []
        seen: set[str] = set()
        for cname in cnames:
            if not cname:
                continue
            d = community_dir / cname
            if not d.is_dir():
                continue
            for js_file in d.glob("*.js"):
                for p in self._extract_icon_prefixes(js_file):
                    if p not in seen:
                        seen.add(p)
                        prefixes.append(p)
        return prefixes

    def _scan_dir_has_custom_elements(
        self, community_dir: Path, cnames: list[str]
    ) -> bool:
        """Return True if any .js file in community subdirs defines custom elements.

        Consolidates the directory scan and file reads into a single executor
        call so no blocking I/O runs on the async event loop.
        """
        for cname in cnames:
            if not cname:
                continue
            d = community_dir / cname
            if not d.is_dir():
                continue
            for js_file in d.glob("*.js"):
                if self._has_custom_element_calls(js_file):
                    return True
        return False

    async def _collect_used_icon_prefixes(self) -> set[str]:
        """Return the set of non-standard icon prefixes used in dashboards and entity registry."""
        used: set[str] = set()
        icon_re = re.compile(r'"icon"\s*:\s*"([a-zA-Z][a-zA-Z0-9_-]*):')
        builtin = {"mdi", "hass", "homeassistant"}

        def _scan_storage() -> set[str]:
            prefixes: set[str] = set()
            storage = self.config_dir / ".storage"
            if not storage.exists():
                return prefixes
            # Scan lovelace dashboards and entity registry
            for fp in storage.iterdir():
                if not fp.is_file():
                    continue
                if not (fp.name.startswith("lovelace") or fp.name == "core.entity_registry"):
                    continue
                try:
                    text = fp.read_text(encoding="utf-8", errors="ignore")
                    for m in icon_re.finditer(text):
                        p = m.group(1).lower()
                        if p not in builtin:
                            prefixes.add(p)
                except OSError:
                    continue
            return prefixes

        used = await self.hass.async_add_executor_job(_scan_storage)

        # Also scan YAML-mode dashboards for icon prefixes
        yaml_icon_re = re.compile(r'icon:\s*["\']?([a-zA-Z][a-zA-Z0-9_-]*):')
        def _scan_yaml_dashboards() -> set[str]:
            prefixes: set[str] = set()
            for yf in self._list_yaml_dashboard_files():
                try:
                    text = yf.read_text(encoding="utf-8", errors="ignore")
                    for m in yaml_icon_re.finditer(text):
                        p = m.group(1).lower()
                        if p not in builtin:
                            prefixes.add(p)
                except OSError:
                    continue
            return prefixes

        yaml_prefixes = await self.hass.async_add_executor_job(
            _scan_yaml_dashboards
        )
        used |= yaml_prefixes

        # Also scan live entity states: integrations can set a custom icon at
        # runtime (e.g. thermal_comfort applies `icon: tc:…`), which never lands
        # in the entity registry on disk but is visible on the entity state (#56).
        prefix_re = re.compile(r"[a-z][a-z0-9_-]*$")
        for state in self.hass.states.async_all():
            icon = state.attributes.get("icon")
            if isinstance(icon, str) and ":" in icon:
                prefix = icon.split(":", 1)[0].strip().lower()
                if prefix and prefix not in builtin and prefix_re.match(prefix):
                    used.add(prefix)

        _LOGGER.debug("Used icon prefixes: %s", used)
        return used

    async def _collect_used_card_types(self) -> set[str]:
        """Return the set of custom card type names found in lovelace dashboards.

        Extracts all ``"type": "custom:xxx"`` values (returning ``xxx`` lowercased)
        and also notes whether ``card_mod`` styling is used anywhere.
        """
        used: set[str] = set()

        def _list_lovelace_files() -> list[str]:
            storage = self.config_dir / ".storage"
            if not storage.exists():
                return []
            skip = {"lovelace_resources", "lovelace_dashboards",
                    "lovelace_resources.backup"}
            return [
                f.name
                for f in storage.iterdir()
                if f.is_file()
                and f.name.startswith("lovelace")
                and f.name not in skip
            ]

        lovelace_files = await self.hass.async_add_executor_job(
            _list_lovelace_files
        )

        def _read_json(path: Path) -> dict:
            with open(path, encoding="utf-8") as fh:
                return json.load(fh)

        for lf in lovelace_files:
            lf_path = self.config_dir / ".storage" / lf
            try:
                raw = await self.hass.async_add_executor_job(_read_json, lf_path)
            except (json.JSONDecodeError, OSError):
                continue
            self._extract_card_types(raw, used)

        # Scan YAML-mode dashboards using Home Assistant's native modular loader
        def _read_yaml(path: Path) -> Any:
            from homeassistant.util.yaml import load_yaml
            from homeassistant.exceptions import HomeAssistantError
            try:
                # load_yaml resuelve automáticamente los !include y !secret de forma recursiva
                return load_yaml(str(path))
            except (HomeAssistantError, OSError) as err:
                _LOGGER.error("Error processing YAML file %s: %s", path, err)
                return {}

        yaml_dashboards = await self.hass.async_add_executor_job(
            self._list_yaml_dashboard_files
        )
        
        for yf in yaml_dashboards:
            raw = await self.hass.async_add_executor_job(_read_yaml, yf)
            if raw:
                self._extract_card_types(raw, used)

        _LOGGER.debug("Used card types (custom): %s", used)
        return used
        
    def _extract_card_types(self, obj: Any, out: set[str]) -> None:
        """Recursively collect custom card types and card_mod usage."""
        if isinstance(obj, dict):
            t = obj.get("type")
            if isinstance(t, str) and t.startswith("custom:"):
                out.add(t[7:].lower())  # strip "custom:" prefix
            # card-mod utility detection
            if "card_mod" in obj:
                out.add("__card_mod__")
            for v in obj.values():
                self._extract_card_types(v, out)
        elif isinstance(obj, list):
            for item in obj:
                self._extract_card_types(item, out)

    async def scan_frontend(self) -> dict[str, Any]:
        """Scan HACS-installed frontend cards and determine usage.

        Returns ``{"total": int, "used": [...], "unused": [...]}``.
        """
        hacs_repos = await self._load_hacs_repositories()
        used_types = await self._collect_used_card_types()
        used_icon_prefixes = await self._collect_used_icon_prefixes()
        now = dt_util.now()

        used_list: list[dict[str, Any]] = []
        unused_list: list[dict[str, Any]] = []

        for _repo_id, repo in hacs_repos.items():
            if not isinstance(repo, dict):
                continue
            if repo.get("category") != "plugin" or not repo.get("installed", False):
                continue

            full_name = repo.get("full_name", "")
            repo_manifest = repo.get("repository_manifest", {}) or {}
            name = (
                repo.get("manifest_name")
                or repo.get("name")
                or repo_manifest.get("name")
                or (full_name.split("/")[-1] if "/" in full_name else full_name)
            )

            install_path = await self.hass.async_add_executor_job(
                self._resolve_install_path, repo
            )
            days_installed: int | None = None
            if install_path is not None:
                ts = await self.hass.async_add_executor_job(
                    self._get_install_timestamp, install_path
                )
                if ts is not None:
                    installed_dt = datetime.fromtimestamp(ts, tz=now.tzinfo)
                    days_installed = (now - installed_dt).days

            card_types = await self.hass.async_add_executor_job(
                self._derive_card_types, repo
            )

            # card-mod is a utility — it's used if any card has card_mod styling
            repo_short = (
                full_name.split("/")[-1].lower() if "/" in full_name else ""
            )
            is_card_mod = "card-mod" in repo_short

            # Check if this plugin is an icon library.
            # cnames is also reused below for the custom-element check.
            community_dir = self.config_dir / "www" / "community"
            cnames = list(
                dict.fromkeys(
                    c
                    for c in [
                        repo_short,
                        full_name.split("/")[-1] if "/" in full_name else "",
                    ]
                    if c
                )
            )
            icon_prefixes: list[str] = await self.hass.async_add_executor_job(
                self._scan_dir_for_icon_prefixes, community_dir, cnames
            )

            is_used = False
            if is_card_mod:
                is_used = "__card_mod__" in used_types
            elif icon_prefixes:
                # Icon library — used if any of its prefixes appear in dashboards
                for pfx in icon_prefixes:
                    if pfx in used_icon_prefixes:
                        is_used = True
                        break
            else:
                for ct in card_types:
                    if ct in used_types:
                        is_used = True
                        break
                # Prefix-based matching for multi-card libraries (e.g. Mushroom)
                # If a derived name like "mushroom" matches any used card type
                # starting with "mushroom-", count it as used.
                if not is_used:
                    for ct in card_types:
                        for ut in used_types:
                            if ut.startswith(ct + "-"):
                                is_used = True
                                break
                        if is_used:
                            break
                # Utility plugins (like kiosk-mode) that don't register
                # custom elements or icon sets are "used" if they are
                # registered as a lovelace resource.
                if not is_used and not card_types:
                    is_used = False  # no card types derived at all
                elif not is_used:
                    # Check if this is a utility (no custom element
                    # definitions found in JS — only derived from filename)
                    has_ce = await self.hass.async_add_executor_job(
                        self._scan_dir_has_custom_elements, community_dir, cnames
                    )
                    if not has_ce:
                        # No custom elements found — it's a utility plugin.
                        # Mark as used (it's loaded as a resource for a reason).
                        is_used = True

            entry = {
                "name": name,
                "repository": (
                    f"https://github.com/{full_name}" if full_name else ""
                ),
                "version": repo.get("version_installed", "unknown"),
                "days_installed": days_installed,
                "card_type": (
                    f"custom:{card_types[0]}" if card_types else "unknown"
                ),
            }

            if is_used:
                used_list.append(entry)
            else:
                unused_list.append(entry)

        return {
            "total": len(used_list) + len(unused_list),
            "used": used_list,
            "unused": unused_list,
        }

    # -- integration helpers --------------------------------------------------

    async def _get_configured_domains(self) -> set[str]:
        """Return the set of integration domains that are in use.

        Combines:
        * ``core.config_entries`` — UI-configured integrations.
        * ``hass.config.components`` — all loaded components at runtime,
          which includes YAML-configured integrations.
        """
        data = await self._load_storage_file("core.config_entries")
        domains: set[str] = set()
        for entry in data.get("entries", []):
            if isinstance(entry, dict):
                d = entry.get("domain")
                if d:
                    domains.add(d)
        # Also include runtime-loaded components (covers YAML-configured
        # integrations that don't use config entries).
        for component in self.hass.config.components:
            # Strip sub-platforms like "bureau_of_meteorology.sensor"
            domain = component.split(".", 1)[0]
            domains.add(domain)
        return domains

    async def scan_integrations(self) -> dict[str, Any]:
        """Scan HACS-installed integrations and determine usage.

        An integration is considered *used* if its domain appears in
        ``core.config_entries`` or ``hass.config.components``.

        Returns ``{"total": int, "used": [...], "unused": [...]}``.
        """
        hacs_repos = await self._load_hacs_repositories()
        configured = await self._get_configured_domains()
        now = dt_util.now()

        used_list: list[dict[str, Any]] = []
        unused_list: list[dict[str, Any]] = []

        for _repo_id, repo in hacs_repos.items():
            if not isinstance(repo, dict):
                continue
            if (
                repo.get("category") != "integration"
                or not repo.get("installed", False)
            ):
                continue

            full_name = repo.get("full_name", "")
            repo_manifest = repo.get("repository_manifest", {}) or {}
            domain = (
                repo.get("domain")
                or repo_manifest.get("domain")
                or ""
            )
            name = (
                repo.get("manifest_name")
                or repo.get("name")
                or repo_manifest.get("name")
                or (full_name.split("/")[-1] if "/" in full_name else full_name)
            )

            install_path = await self.hass.async_add_executor_job(
                self._resolve_install_path, repo
            )
            days_installed: int | None = None
            if install_path is not None:
                ts = await self.hass.async_add_executor_job(
                    self._get_install_timestamp, install_path
                )
                if ts is not None:
                    installed_dt = datetime.fromtimestamp(ts, tz=now.tzinfo)
                    days_installed = (now - installed_dt).days

            is_used = domain in configured

            entry = {
                "name": name,
                "repository": (
                    f"https://github.com/{full_name}" if full_name else ""
                ),
                "version": repo.get("version_installed", "unknown"),
                "days_installed": days_installed,
                "domain": domain,
            }

            if is_used:
                used_list.append(entry)
            else:
                unused_list.append(entry)

        return {
            "total": len(used_list) + len(unused_list),
            "used": used_list,
            "unused": unused_list,
        }

    # -- main scan -----------------------------------------------------------

    async def scan_all_hacs_components(self) -> list[dict[str, Any]]:
        """Return a list of all HACS-installed components with metadata."""
        hacs_repos = await self._load_hacs_repositories()
        now = dt_util.now()
        components: list[dict[str, Any]] = []

        for _repo_id, repo in hacs_repos.items():
            if not isinstance(repo, dict):
                continue
            if not repo.get("installed", False):
                continue

            category = repo.get("category", "")
            if category not in CATEGORY_MAP:
                continue

            full_name = repo.get("full_name", "")
            repo_manifest = repo.get("repository_manifest", {}) or {}
            name = (
                repo.get("manifest_name")
                or repo.get("name")
                or repo_manifest.get("name")
                or (full_name.split("/")[-1] if "/" in full_name else full_name)
            )

            # Resolve install path and compute days since install
            install_path = await self.hass.async_add_executor_job(
                self._resolve_install_path, repo
            )
            days_installed: int | None = None
            if install_path is not None:
                ts = await self.hass.async_add_executor_job(
                    self._get_install_timestamp, install_path
                )
                if ts is not None:
                    installed_dt = datetime.fromtimestamp(ts, tz=now.tzinfo)
                    days_installed = (now - installed_dt).days

            components.append(
                {
                    "name": name,
                    "type": CATEGORY_MAP[category],
                    "repository": (
                        f"https://github.com/{full_name}" if full_name else ""
                    ),
                    "version": repo.get("version_installed", "unknown"),
                    "days_installed": days_installed,
                }
            )

        # Sort alphabetically by type then name
        components.sort(key=lambda c: (c["type"], c["name"].lower()))
        return components

    # -- updates -------------------------------------------------------------

    @staticmethod
    def _pending_update_versions(
        repo: dict[str, Any]
    ) -> tuple[str, str] | None:
        """Return ``(current, available)`` if *repo* has a pending update.

        Mirrors HACS's own logic: repositories tracking releases compare the
        installed version against the latest available version, while
        repositories tracking the default branch compare commit hashes. The
        returned versions always come from the same pair that detected the
        update, so a branch-tracked repo reports its commits (not a stale
        ``version_installed`` string) and vice versa.
        """
        version_installed = repo.get("version_installed")
        last_version = repo.get("last_version")
        if repo.get("releases") and version_installed and last_version:
            if version_installed != last_version:
                return version_installed, last_version
            return None

        installed_commit = repo.get("installed_commit")
        last_commit = repo.get("last_commit")
        if installed_commit and last_commit:
            if installed_commit != last_commit:
                return installed_commit, last_commit
            return None

        return None

    async def scan_updates(self) -> dict[str, Any]:
        """Scan HACS-installed components for pending updates.

        Returns ``{"count": int, "updates": [...]}`` where each update entry
        lists the component name, type, repository and current/available
        versions.
        """
        hacs_repos = await self._load_hacs_repositories()
        updates: list[dict[str, Any]] = []

        for _repo_id, repo in hacs_repos.items():
            if not isinstance(repo, dict):
                continue
            if not repo.get("installed", False):
                continue
            versions = self._pending_update_versions(repo)
            if versions is None:
                continue
            current_version, available_version = versions

            full_name = repo.get("full_name", "")
            repo_manifest = repo.get("repository_manifest", {}) or {}
            name = (
                repo.get("manifest_name")
                or repo.get("name")
                or repo_manifest.get("name")
                or (full_name.split("/")[-1] if "/" in full_name else full_name)
            )
            category = repo.get("category", "")

            updates.append(
                {
                    "name": name,
                    "type": CATEGORY_MAP.get(
                        category, category.replace("_", " ").title()
                    ),
                    "repository": (
                        f"https://github.com/{full_name}" if full_name else ""
                    ),
                    "current_version": current_version,
                    "available_version": available_version,
                }
            )

        # Sort alphabetically by type then name
        updates.sort(key=lambda c: (c["type"], c["name"].lower()))
        return {"count": len(updates), "updates": updates}


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------


class CustomComponentMonitorCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator that drives periodic scans."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry | None = None) -> None:
        """Initialize."""
        self.scanner = ComponentScanner(hass)
        self.entry = entry
        self._ai_store: Store | None = None
        self._ai_last_error: str | None = None
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL,
        )

    def _excluded_keys(self) -> set[str]:
        """Lower-cased set of user-excluded component identifiers (#70)."""
        raw = (self.entry.options.get(CONF_EXCLUDE, []) if self.entry else []) or []
        if isinstance(raw, str):
            raw = [raw]
        return {str(x).strip().lower() for x in raw if str(x).strip()}

    def _apply_exclusions(self, result: dict[str, Any]) -> dict[str, Any]:
        """Move user-excluded components out of ``unused`` into ``used`` and
        record them under ``excluded`` (#70)."""
        excl = self._excluded_keys()
        moved: list[dict[str, Any]] = []
        if excl:
            kept: list[dict[str, Any]] = []
            for item in result.get("unused", []):
                keys = {
                    str(item.get(k, "")).strip().lower()
                    for k in ("name", "domain", "card_type")
                    if item.get(k)
                }
                if keys & excl:
                    moved.append(item)
                else:
                    kept.append(item)
            result["unused"] = kept
            result["used"] = result.get("used", []) + moved
        result["excluded"] = moved
        return result

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from HACS storage."""
        try:
            self.scanner._invalidate_cache()

            all_components = await self.scanner.scan_all_hacs_components()
            _LOGGER.debug(
                "Scanned %d HACS-installed components", len(all_components)
            )

            themes = self._apply_exclusions(await self.scanner.scan_themes())
            _LOGGER.debug(
                "Theme scan: %d total, %d used, %d unused",
                themes["total"],
                len(themes["used"]),
                len(themes["unused"]),
            )

            frontend = self._apply_exclusions(await self.scanner.scan_frontend())
            _LOGGER.debug(
                "Frontend scan: %d total, %d used, %d unused",
                frontend["total"],
                len(frontend["used"]),
                len(frontend["unused"]),
            )

            integrations = self._apply_exclusions(await self.scanner.scan_integrations())
            _LOGGER.debug(
                "Integration scan: %d total, %d used, %d unused",
                integrations["total"],
                len(integrations["used"]),
                len(integrations["unused"]),
            )

            updates = await self.scanner.scan_updates()
            _LOGGER.debug("Update scan: %d pending updates", updates["count"])

            # Optionally enrich each update with AI summary + categories (#67).
            updates = await self._async_categorise_updates(updates)

            return {
                "all_components": all_components,
                "themes": themes,
                "frontend": frontend,
                "integrations": integrations,
                "updates": updates,
                "last_scan": dt_util.now().isoformat(),
            }
        except Exception as exc:
            _LOGGER.error("Error scanning custom components: %s", exc)
            raise UpdateFailed(exc) from exc

    # -- AI summarise & categorise updates (#67) ----------------------------

    async def _async_categorise_updates(
        self, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Enrich each pending update with AI categories + summary (#67).

        Opt-in: only runs when enabled in options and an AI Task entity is
        configured. Results are cached per ``name|available_version`` so an
        unchanged update never triggers a fresh AI call. Failures degrade
        gracefully — the update is simply left without categories and retried
        on the next scan; nothing here is allowed to raise.
        """
        items: list[dict[str, Any]] = updates.get("updates", [])
        if not items or self.entry is None:
            return updates

        enabled = self.entry.options.get(CONF_AI_CATEGORIZATION_ENABLED, False)
        ai_entity = self.entry.options.get(CONF_AI_TASK_ENTITY) or ""
        if not enabled or not ai_entity:
            return updates

        if self._ai_store is None:
            self._ai_store = Store(self.hass, STORAGE_VERSION, AI_CACHE_STORAGE_KEY)
        try:
            cache: dict[str, Any] = (await self._ai_store.async_load()) or {}
        except Exception:  # pragma: no cover - storage read should not break scan
            cache = {}

        entity_by_key = self._build_update_entity_map()

        new_calls = 0
        current_keys: set[str] = set()
        for item in items:
            key = f"{item.get('name', '')}|{item.get('available_version', '')}"
            current_keys.add(key)
            cached = cache.get(key)
            if cached:
                item[ATTR_CATEGORIES] = cached.get("categories", [])
                item[ATTR_SUMMARY] = cached.get("summary", "")
                continue
            result = await self._async_categorise_one(item, ai_entity, entity_by_key)
            if result is not None:
                item[ATTR_CATEGORIES] = result.get("categories", [])
                item[ATTR_SUMMARY] = result.get("summary", "")
                cache[key] = result
                new_calls += 1

        # Keep the cache bounded: drop entries for updates no longer pending.
        cache = {k: v for k, v in cache.items() if k in current_keys}
        try:
            await self._ai_store.async_save(cache)
        except Exception:  # pragma: no cover
            _LOGGER.debug("Failed to persist AI category cache", exc_info=True)
        if new_calls:
            _LOGGER.debug("AI categorised %d new update(s)", new_calls)
        return updates

    def _build_update_entity_map(self) -> dict[str, dict[str, str]]:
        """Map HACS ``update.*`` entities by normalised name and by version (#67).

        Uses the same ``platform == "hacs"`` filter as ``update_all``. Entity
        titles are unreliable (often ``None``) and ``friendly_name`` carries an
        " Update" suffix the scanned name lacks, so names are normalised (suffix
        stripped, lower-cased, punctuation removed) — mirroring the card. A
        version map is kept as a fallback when names don't line up.
        """
        registry = er.async_get(self.hass)
        by_name: dict[str, str] = {}
        by_version: dict[str, str] = {}
        for state in self.hass.states.async_all("update"):
            entry = registry.async_get(state.entity_id)
            if entry is None or entry.platform != "hacs":
                continue
            title = (
                state.attributes.get("title")
                or state.attributes.get("friendly_name")
                or ""
            )
            norm = self._norm_name(title)
            if norm:
                by_name.setdefault(norm, state.entity_id)
            latest = self._norm_version(state.attributes.get("latest_version"))
            if latest:
                by_version.setdefault(latest, state.entity_id)
        return {"by_name": by_name, "by_version": by_version}

    @staticmethod
    def _norm_name(value: Any) -> str:
        """Normalise an update name for matching (drop ' update', punctuation)."""
        text = re.sub(r"\s+update$", "", str(value or ""), flags=re.IGNORECASE)
        return re.sub(r"[^a-z0-9]+", "", text.lower())

    @staticmethod
    def _norm_version(value: Any) -> str:
        """Normalise a version string (strip a leading 'v', lower-case)."""
        return re.sub(r"^v", "", str(value or "").strip().lower())

    @staticmethod
    def _finalise(parsed: dict[str, Any], note_cats: list[str]) -> dict[str, Any]:
        """Union the AI's categories with those detected from the notes (#67)."""
        cats = list(parsed.get("categories") or [])
        for cat in note_cats:
            if cat not in cats:
                cats.append(cat)
        # "Other" is a catch-all — drop it when a specific category applies.
        if len(cats) > 1 and "Other" in cats:
            cats = [c for c in cats if c != "Other"]
        return {"categories": cats, "summary": parsed.get("summary", "")}

    @staticmethod
    def _categories_from_notes(notes: str) -> list[str]:
        """Derive categories from changelog section headers / commit prefixes (#67).

        Conventional-commit / release-please changelogs use stable section
        headers, so categories can be detected deterministically rather than
        relying on the model alone (which may miss a section). These are unioned
        with the model's categories.
        """
        if not notes:
            return []
        text = notes.lower()
        checks = [
            ("Bug fixes", r"#{1,6}\s*bug\s*fixes|(^|\n)\s*[*-]?\s*fix(\(|:)|\bbug ?fix(es)?\b"),
            ("New features", r"#{1,6}\s*features?|(^|\n)\s*[*-]?\s*feat(\(|:)"),
            ("Documentation", r"#{1,6}\s*(documentation|docs)\b|(^|\n)\s*[*-]?\s*docs(\(|:)"),
            ("Breaking changes", r"breaking[\s_-]?change|#{1,6}\s*breaking"),
            ("Dependencies", r"#{1,6}\s*dependenc|build\(deps|chore\(deps|(^|\n)\s*[*-]?\s*deps(\(|:)|\bbump\b.*\bfrom\b"),
            ("Translations", r"#{1,6}\s*(translation|i18n)|\bi18n\b|locali[sz]ation|\btranslations?\b"),
        ]
        found: list[str] = []
        for cat, pattern in checks:
            if cat not in found and re.search(pattern, text, re.MULTILINE):
                found.append(cat)
        return found

    async def _async_categorise_one(
        self,
        item: dict[str, Any],
        ai_entity: str,
        entity_by_key: dict[str, dict[str, str]],
    ) -> dict[str, Any] | None:
        """Run a single update through the AI Task; return categories+summary."""
        name = item.get("name", "")
        version = item.get("available_version", "")
        current = item.get("current_version", "")
        utype = item.get("type", "")

        # Best-effort release notes from the matching update entity: by
        # normalised name, falling back to the available version.
        notes = ""
        entity_id = entity_by_key["by_name"].get(
            self._norm_name(name)
        ) or entity_by_key["by_version"].get(self._norm_version(version))
        if entity_id:
            notes = await self._async_release_notes(entity_id) or ""
        note_cats = self._categories_from_notes(notes)

        base = (
            "A Home Assistant custom component has a pending update.\n"
            f"Name: {name}\n"
            f"Type: {utype}\n"
            f"Current version: {current}\n"
            f"New version: {version}\n\n"
            "Release notes / changelog (may be empty):\n"
            f"{notes or '(none provided)'}\n\n"
            "The notes may cover several releases and contain sections such as "
            "Features, Bug Fixes, Documentation, Dependencies or Breaking Changes.\n"
            "Choose the categories clearly supported by the notes, using these "
            "labels exactly (do not invent new ones): "
            f"{', '.join(AI_CATEGORY_OPTIONS)}. "
            "Use 'Other' only when no specific category fits.\n"
            "Then write one short, plain-language sentence summarising the headline "
            "changes. If the notes are sparse, infer conservatively from the version "
            "change and component name."
        )
        json_suffix = (
            "\n\nRespond with ONLY a JSON object, no prose, exactly:\n"
            '{"categories": ["..."], "summary": "..."}'
        )
        last_err: Exception | None = None

        # Conversation-agent source (#67): a single text call, then parse JSON
        # from the reply. This avoids the ai_task structured/streaming path,
        # which some provider bridges mishandle for certain models.
        if ai_entity.startswith("conversation."):
            try:
                parsed = self._parse_ai_text(
                    await self._async_conversation_call(ai_entity, base + json_suffix)
                )
                if parsed is not None:
                    self._ai_last_error = None
                    return self._finalise(parsed, note_cats)
            except Exception as err:
                last_err = err
            self._note_ai_error(name, last_err)
            return None

        # AI Task source. 1) Preferred: structured output (works where the
        # provider supports strict JSON schema, e.g. official OpenAI/Ollama).
        structure = {
            "categories": {
                "description": "All change categories that apply to this update",
                "required": True,
                "selector": {
                    "select": {"multiple": True, "options": AI_CATEGORY_OPTIONS}
                },
            },
            "summary": {
                "description": "One short, plain-language sentence on what changed",
                "required": True,
                "selector": {"text": {"multiline": True}},
            },
        }
        try:
            parsed = self._parse_ai_data(
                await self._async_ai_call(ai_entity, base, structure)
            )
            if parsed is not None:
                self._ai_last_error = None
                return self._finalise(parsed, note_cats)
        except Exception as err:  # provider/model/transport failure
            last_err = err

        # 2) Fallback: plain text + an explicit JSON request, then parse it.
        #    Rescues backends that can't do strict structured output but can
        #    still generate text (a large class of self-hosted setups).
        try:
            parsed = self._parse_ai_text(
                await self._async_ai_call(ai_entity, base + json_suffix, None)
            )
            if parsed is not None:
                self._ai_last_error = None
                return self._finalise(parsed, note_cats)
        except Exception as err:
            last_err = err

        self._note_ai_error(name, last_err)
        return None

    async def _async_conversation_call(self, agent_id: str, text: str) -> str | None:
        """Call conversation.process and return the agent's reply text (#67)."""
        async with asyncio.timeout(AI_CALL_TIMEOUT):
            resp = await self.hass.services.async_call(
                "conversation",
                "process",
                {"agent_id": agent_id, "text": text},
                blocking=True,
                return_response=True,
            )
        response = (resp or {}).get("response") or {}
        speech = (
            (response.get("speech") or {}).get("plain") or {}
        ).get("speech")
        # conversation.process returns HTTP 200 even on failure, with the error
        # in the reply — surface it so categorisation degrades + warns cleanly.
        if response.get("response_type") == "error":
            raise RuntimeError(speech or "conversation agent error")
        return speech

    async def _async_ai_call(
        self, ai_entity: str, instructions: str, structure: dict | None
    ) -> Any:
        """Call ai_task.generate_data and return its response 'data' (#67)."""
        service_data: dict[str, Any] = {
            "entity_id": ai_entity,
            "task_name": "Categorise HACS update",
            "instructions": instructions,
        }
        if structure is not None:
            service_data["structure"] = structure
        async with asyncio.timeout(AI_CALL_TIMEOUT):
            resp = await self.hass.services.async_call(
                "ai_task",
                "generate_data",
                service_data,
                blocking=True,
                return_response=True,
            )
        return (resp or {}).get("data")

    def _parse_ai_data(self, data: Any) -> dict[str, Any] | None:
        """Parse a structured ai_task result (dict, or a JSON string)."""
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except (ValueError, TypeError):
                return None
        if not isinstance(data, dict):
            return None
        cats = self._normalise_categories(data.get("categories"))
        summary = str(data.get("summary") or "").strip()
        if not cats and not summary:
            return None
        return {"categories": cats, "summary": summary}

    def _parse_ai_text(self, text: Any) -> dict[str, Any] | None:
        """Parse a plain-text ai_task result, extracting an embedded JSON object."""
        if not isinstance(text, str) or not text.strip():
            return None
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            try:
                obj = json.loads(match.group(0))
                if isinstance(obj, dict):
                    cats = self._normalise_categories(obj.get("categories"))
                    summary = str(obj.get("summary") or "").strip()
                    if cats or summary:
                        return {"categories": cats, "summary": summary}
            except (ValueError, TypeError):
                pass
        # No usable JSON — keep the first line as a summary, no categories.
        summary = text.strip().splitlines()[0][:300]
        return {"categories": [], "summary": summary} if summary else None

    def _note_ai_error(self, name: str, err: Exception | None) -> None:
        """Log a deduped, actionable warning when categorisation fails (#67)."""
        msg = str(err) if err else "no usable response"
        _LOGGER.debug("AI categorisation failed for %s: %s", name, msg)
        if msg != self._ai_last_error:
            self._ai_last_error = msg
            ent = self.entry.options.get(CONF_AI_TASK_ENTITY) if self.entry else "?"
            _LOGGER.warning(
                "AI categorisation via '%s' failed (%s). Pending updates will show "
                "no categories. If this persists, your AI Task provider/model may "
                "not support structured or JSON generation — the official OpenAI, "
                "Ollama, Anthropic or Google Generative AI integrations are "
                "recommended as the AI Task backend.",
                ent,
                msg,
            )

    @staticmethod
    def _normalise_categories(raw: Any) -> list[str]:
        """Map a model's free-form category output onto the canonical set (#67).

        Models don't reliably honour the select-selector options — they return a
        list, a single string, or a comma/semicolon/slash-joined string with
        loose wording. Split it, lower-case it, and map via aliases.
        """
        if isinstance(raw, str):
            parts = re.split(r"[,;/]", raw)
        elif isinstance(raw, (list, tuple)):
            parts = []
            for x in raw:
                parts.extend(re.split(r"[,;/]", str(x)))
        else:
            parts = []
        canon_by_lower = {c.lower(): c for c in AI_CATEGORY_OPTIONS}
        out: list[str] = []
        for part in parts:
            key = part.strip().lower()
            if not key:
                continue
            canon = canon_by_lower.get(key) or AI_CATEGORY_ALIASES.get(key)
            if canon and canon not in out:
                out.append(canon)
        return out

    async def _async_release_notes(self, entity_id: str) -> str | None:
        """Fetch release notes from a Home Assistant update entity (#67)."""
        entity_comp = self.hass.data.get("entity_components", {}).get("update")
        if entity_comp is None:
            return None
        entity = entity_comp.get_entity(entity_id)
        if entity is None or not hasattr(entity, "async_release_notes"):
            return None
        try:
            return await entity.async_release_notes()
        except Exception:
            _LOGGER.debug(
                "Failed to fetch release notes for %s", entity_id, exc_info=True
            )
            return None


# ---------------------------------------------------------------------------
# Sensor descriptions
# ---------------------------------------------------------------------------


SENSOR_DESCRIPTIONS: list[SensorEntityDescription] = [
    SensorEntityDescription(
        key=SENSOR_ALL_COMPONENTS,
        name="HACS Installed Components",
        icon="mdi:package-variant",
        native_unit_of_measurement="components",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_INTEGRATIONS,
        name="Unused Custom Integrations",
        icon="mdi:puzzle-outline",
        native_unit_of_measurement="integrations",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_THEMES,
        name="Unused Custom Themes",
        icon="mdi:palette-outline",
        native_unit_of_measurement="themes",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_FRONTEND,
        name="Unused Frontend Resources",
        icon="mdi:web",
        native_unit_of_measurement="resources",
        state_class=SensorStateClass.MEASUREMENT,
    ),
    SensorEntityDescription(
        key=SENSOR_HACS_UPDATES,
        name="HACS Updates",
        icon="mdi:package-up",
        native_unit_of_measurement="updates",
        state_class=SensorStateClass.MEASUREMENT,
    ),
]


# ---------------------------------------------------------------------------
# Platform setup
# ---------------------------------------------------------------------------


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator = CustomComponentMonitorCoordinator(hass, config_entry)
    try:
        await coordinator.async_config_entry_first_refresh()
    except Exception as exc:
        raise ConfigEntryNotReady(
            f"Failed to initialize coordinator: {exc}"
        ) from exc

    # Store coordinator reference so the scan_now service can access it
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["coordinator"] = coordinator

    entities = [
        CustomComponentMonitorSensor(coordinator, desc)
        for desc in SENSOR_DESCRIPTIONS
    ]
    async_add_entities(entities)


# ---------------------------------------------------------------------------
# Sensor entity
# ---------------------------------------------------------------------------


class CustomComponentMonitorSensor(CoordinatorEntity, SensorEntity):
    """A Custom Component Monitor sensor."""

    # Exclude large lists from the Recorder (they can exceed the 16 384-byte
    # attribute limit) while keeping them available on the live entity state so
    # cards and templates can still access them. ATTR_UPDATES is unrecorded too
    # because AI summaries (#67) can push the updates list past the limit.
    _unrecorded_attributes = frozenset({ATTR_COMPONENTS, ATTR_UPDATES})

    def __init__(
        self,
        coordinator: CustomComponentMonitorCoordinator,
        description: SensorEntityDescription,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{DOMAIN}_{description.key}"

    # -- state ---------------------------------------------------------------

    @property
    def native_value(self) -> int:
        """Return the sensor value (count)."""
        key = self.entity_description.key

        if key == SENSOR_ALL_COMPONENTS:
            return len(self.coordinator.data.get("all_components", []))

        # Phases 2-4 will populate these; for now return 0
        if key == SENSOR_UNUSED_INTEGRATIONS:
            data = self.coordinator.data.get("integrations", {})
            return len(data.get("unused", []))
        if key == SENSOR_UNUSED_THEMES:
            data = self.coordinator.data.get("themes", {})
            return len(data.get("unused", []))
        if key == SENSOR_UNUSED_FRONTEND:
            data = self.coordinator.data.get("frontend", {})
            return len(data.get("unused", []))
        if key == SENSOR_HACS_UPDATES:
            data = self.coordinator.data.get("updates", {})
            return data.get("count", 0)

        return 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return state attributes."""
        key = self.entity_description.key
        attrs: dict[str, Any] = {}

        if key == SENSOR_ALL_COMPONENTS:
            components = self.coordinator.data.get("all_components", [])
            attrs[ATTR_TOTAL_COMPONENTS] = len(components)
            attrs[ATTR_COMPONENTS] = components

        elif key in (
            SENSOR_UNUSED_INTEGRATIONS,
            SENSOR_UNUSED_THEMES,
            SENSOR_UNUSED_FRONTEND,
        ):
            # Phases 2-4 will add real data here
            bucket = {
                SENSOR_UNUSED_INTEGRATIONS: "integrations",
                SENSOR_UNUSED_THEMES: "themes",
                SENSOR_UNUSED_FRONTEND: "frontend",
            }[key]
            data = self.coordinator.data.get(bucket, {})
            attrs[ATTR_TOTAL_COMPONENTS] = data.get("total", 0)
            attrs[ATTR_USED_COMPONENTS] = len(data.get("used", []))
            attrs[ATTR_UNUSED_COMPONENTS] = data.get("unused", [])
            attrs[ATTR_EXCLUDED_COMPONENTS] = data.get("excluded", [])

        elif key == SENSOR_HACS_UPDATES:
            data = self.coordinator.data.get("updates", {})
            attrs[ATTR_UPDATES] = data.get("updates", [])

        if "last_scan" in self.coordinator.data:
            attrs["last_scan"] = self.coordinator.data["last_scan"]

        return attrs
