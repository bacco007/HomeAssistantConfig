"""Sensor platform for Custom Component Monitor."""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_COMPONENTS,
    ATTR_TOTAL_COMPONENTS,
    ATTR_UNUSED_COMPONENTS,
    ATTR_USED_COMPONENTS,
    CATEGORY_MAP,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    SENSOR_ALL_COMPONENTS,
    SENSOR_UNUSED_FRONTEND,
    SENSOR_UNUSED_INTEGRATIONS,
    SENSOR_UNUSED_THEMES,
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
            # Strip common prefixes like "ha-"
            if repo_short.startswith("ha-"):
                candidates.append(repo_short[3:])
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
            # Last resort: scan themes dir for dirs containing repo_short
            if themes_dir.exists():
                for child in themes_dir.iterdir():
                    if child.is_dir():
                        low = child.name.lower()
                        for name in candidates:
                            if name and name.lower() in low:
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
        """
        rm = repo.get("repository_manifest", {}) or {}
        full_name = repo.get("full_name", "")
        repo_short = full_name.split("/")[-1] if "/" in full_name else full_name

        names: list[str] = []

        # 1) From manifest filename
        manifest_fn = rm.get("filename", "")
        if manifest_fn and manifest_fn.endswith(".js"):
            names.append(manifest_fn[:-3].lower())

        # 2) Scan the community directory for .js files
        candidates = [repo_short]
        if repo_short.startswith("ha-"):
            candidates.append(repo_short[3:])
        community_dir = self.config_dir / "www" / "community"
        for cname in candidates:
            d = community_dir / cname
            if d.is_dir():
                for js_file in d.glob("*.js"):
                    stem = js_file.stem.lower()
                    if stem not in names and not stem.endswith(".gz"):
                        names.append(stem)

        # 3) Fall back to repo short name if nothing found
        if not names:
            stripped = repo_short.lower()
            for prefix in ("lovelace-", "ha-"):
                if stripped.startswith(prefix):
                    stripped = stripped[len(prefix):]
            names.append(stripped)

        return names

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

            is_used = False
            if is_card_mod:
                is_used = "__card_mod__" in used_types
            else:
                for ct in card_types:
                    if ct in used_types:
                        is_used = True
                        break

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
        """Return the set of integration domains that have config entries."""
        data = await self._load_storage_file("core.config_entries")
        domains: set[str] = set()
        for entry in data.get("entries", []):
            if isinstance(entry, dict):
                d = entry.get("domain")
                if d:
                    domains.add(d)
        return domains

    async def scan_integrations(self) -> dict[str, Any]:
        """Scan HACS-installed integrations and determine usage.

        An integration is considered *used* if its domain appears in
        ``core.config_entries``.

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


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------


class CustomComponentMonitorCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator that drives periodic scans."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize."""
        self.scanner = ComponentScanner(hass)
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from HACS storage."""
        try:
            self.scanner._invalidate_cache()

            all_components = await self.scanner.scan_all_hacs_components()
            _LOGGER.debug(
                "Scanned %d HACS-installed components", len(all_components)
            )

            themes = await self.scanner.scan_themes()
            _LOGGER.debug(
                "Theme scan: %d total, %d used, %d unused",
                themes["total"],
                len(themes["used"]),
                len(themes["unused"]),
            )

            frontend = await self.scanner.scan_frontend()
            _LOGGER.debug(
                "Frontend scan: %d total, %d used, %d unused",
                frontend["total"],
                len(frontend["used"]),
                len(frontend["unused"]),
            )

            integrations = await self.scanner.scan_integrations()
            _LOGGER.debug(
                "Integration scan: %d total, %d used, %d unused",
                integrations["total"],
                len(integrations["used"]),
                len(integrations["unused"]),
            )

            return {
                "all_components": all_components,
                "themes": themes,
                "frontend": frontend,
                "integrations": integrations,
                "last_scan": dt_util.now().isoformat(),
            }
        except Exception as exc:
            _LOGGER.error("Error scanning custom components: %s", exc)
            raise UpdateFailed(exc) from exc


# ---------------------------------------------------------------------------
# Sensor descriptions
# ---------------------------------------------------------------------------

SENSOR_DESCRIPTIONS: list[SensorEntityDescription] = [
    SensorEntityDescription(
        key=SENSOR_ALL_COMPONENTS,
        name="HACS Installed Components",
        icon="mdi:package-variant",
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_INTEGRATIONS,
        name="Unused Custom Integrations",
        icon="mdi:puzzle-outline",
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_THEMES,
        name="Unused Custom Themes",
        icon="mdi:palette-outline",
    ),
    SensorEntityDescription(
        key=SENSOR_UNUSED_FRONTEND,
        name="Unused Frontend Resources",
        icon="mdi:web",
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
    coordinator = CustomComponentMonitorCoordinator(hass)
    try:
        await coordinator.async_config_entry_first_refresh()
    except Exception as exc:
        raise ConfigEntryNotReady(
            f"Failed to initialize coordinator: {exc}"
        ) from exc

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

        return 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return state attributes."""
        key = self.entity_description.key
        attrs: dict[str, Any] = {}

        if key == SENSOR_ALL_COMPONENTS:
            components = self.coordinator.data.get("all_components", [])
            attrs[ATTR_COMPONENTS] = components
            attrs[ATTR_TOTAL_COMPONENTS] = len(components)

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

        if "last_scan" in self.coordinator.data:
            attrs["last_scan"] = self.coordinator.data["last_scan"]

        return attrs
