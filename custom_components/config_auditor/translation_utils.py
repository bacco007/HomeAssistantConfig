"""Translation utilities for H.A.C.A analyzers."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

_LOGGER = logging.getLogger(__name__)


async def async_detect_frontend_user_language(hass) -> str | None:
    """Best-effort: read the owner user's profile language from HA storage.

    The HA frontend persists each user's locale under
    ``.storage/frontend.user_data_<user_id>`` (key ``language.language``).
    This helper opens that store via ``homeassistant.helpers.storage.Store``
    so the path stays in sync with however HA layers wrap it.

    Returns the language string (``"fr"``, ``"da"`` …) or ``None`` if no
    owner exists, no language is recorded, or any I/O error occurs. The
    function is async because the storage helper performs disk I/O.
    """
    try:
        users = await hass.auth.async_get_users()
    except Exception:
        return None
    owner = next((u for u in users if getattr(u, "is_owner", False)), None)
    # Some installs have no explicit owner; pick the first admin user instead.
    if owner is None:
        owner = next(
            (u for u in users
             if getattr(u, "is_active", True)
             and not getattr(u, "system_generated", False)),
            None,
        )
    if owner is None:
        return None
    try:
        from homeassistant.helpers.storage import Store
        store = Store(hass, 1, f"frontend.user_data_{owner.id}")
        data = await store.async_load()
    except Exception:
        return None
    if not isinstance(data, dict):
        return None
    # Across HA versions the language is stored as either
    # ``{"language": "fr"}`` (string) or ``{"language": {"language": "fr"}}``
    # (nested object alongside other locale prefs).  Cover both shapes.
    raw = data.get("language")
    if isinstance(raw, str) and raw:
        return raw
    if isinstance(raw, dict):
        nested = raw.get("language") or raw.get("value")
        if isinstance(nested, str) and nested:
            return nested
    return None


def resolve_notification_language(hass) -> str:
    """Resolve the language for server-emitted text.

    Server-emitted = persistent notifications, HA Repairs descriptions,
    background scans (battery alerts, weekly reports, regression warnings,
    issue messages stored in coordinator.data).

    Resolution order:
        1. Per-entry option ``notification_language`` (explicit override
           saved by the user from the Configuration tab).
        2. Per-entry option ``notification_language_auto`` (last panel
           profile language seen by ``handle_get_translations``).
        3. Home Assistant system language (``hass.config.language``).
        4. ``"en"`` fallback.

    The volatile ``hass.data[DOMAIN]["user_language"]`` slot is *intentionally*
    ignored here — it is set by the last user who opened the HACA panel and
    must only influence WebSocket responses targeted at that user. Using it
    for server-emitted text causes notifications to flip language whenever
    a different user opens the panel.

    The auto-tracked value persists across HA restarts, so a user who switches
    their profile language only needs to open the panel once for subsequent
    server-side notifications to follow the new language.
    """
    # Local import to avoid a hard dependency cycle (const → translation_utils
    # is fine, but we keep this lazy in case const is restructured).
    try:
        from .const import DOMAIN
        for entry in hass.config_entries.async_entries(DOMAIN):
            opts = entry.options or {}
            explicit = opts.get("notification_language")
            if explicit:
                return explicit
            auto = opts.get("notification_language_auto")
            if auto:
                return auto
    except Exception:
        pass
    return hass.config.language or "en"


class TranslationHelper:
    """Translation helper for HACA analyzers.

    Reads translations from ``custom_components.config_auditor._TS_CACHE``
    (pre-loaded once at integration setup by ``_async_preload_ts_cache``).
    Disk I/O is used only as a fallback when the cache is empty — typically
    during unit tests or before integration setup completes.

    The cache stores each language as a flat dict where every root-level
    section of the JSON file (``analyzer``, ``ai_prompts``, ``llm_prompt``,
    ``proactive_agent``, ``notifications``, …) is preserved, and ``panel.*``
    sub-sections are overlaid on top. So ``cache[lang][section]`` returns
    the same content as ``raw_json[section]`` would.
    """

    def __init__(self, hass) -> None:
        """Initialize translation helper."""
        self.hass = hass
        self._language = "en"
        self._translations: dict[str, str] = {}

    # ── Cache-first loaders (no I/O) ──────────────────────────────────────

    def _try_load_from_cache(self, language: str, section: str) -> bool:
        """Populate ``self._translations`` from ``_TS_CACHE`` if possible.

        Returns True on a successful cache hit. Falls back to English when
        the requested language is missing but ``en`` is cached. Returns
        False only when the cache is empty for every language (cold path
        before integration setup or under unit-test isolation).
        """
        try:
            from . import _TS_CACHE  # noqa: PLC0415  (local import: avoid cycle on module load)
        except Exception:
            return False
        cache = _TS_CACHE.get(language) or _TS_CACHE.get("en")
        if not cache:
            return False
        self._language = language
        self._translations = cache.get(section, {})
        return True

    # ── Public API (unchanged signatures) ─────────────────────────────────

    async def async_load_language(self, language: str) -> None:
        """Load the analyzer section for *language* into the helper."""
        if self._try_load_from_cache(language, "analyzer"):
            return
        # Cold path: read from disk in the executor so we never block the loop.
        await self.hass.async_add_executor_job(self.load_language, language)

    async def async_load_language_section(self, language: str, section: str) -> None:
        """Load any top-level JSON section (``ai_prompts``, ``llm_prompt``…)."""
        if self._try_load_from_cache(language, section):
            return
        await self.hass.async_add_executor_job(self._load_section, language, section)

    def _load_section(self, language: str, section: str) -> None:
        """Disk fallback for ``async_load_language_section``."""
        if self._try_load_from_cache(language, section):
            return
        import json as _json
        from pathlib import Path as _Path
        base = _Path(__file__).parent / "translations"
        path = base / f"{language}.json"
        if not path.exists():
            path = base / "en.json"
        try:
            self._translations = _json.loads(path.read_text(encoding="utf-8")).get(section, {})
        except Exception:
            self._translations = {}

    def load_language(self, language: str) -> None:
        """Disk fallback for ``async_load_language``.

        Synchronous; safe to call from a thread (executor) or from tests.
        """
        if self._try_load_from_cache(language, "analyzer"):
            return

        self._language = language
        translations_dir = Path(__file__).parent / "translations"
        translation_file = translations_dir / f"{language}.json"
        if not translation_file.exists():
            translation_file = translations_dir / "en.json"
            _LOGGER.debug("Translation file for '%s' not found, falling back to English", language)

        try:
            with open(translation_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._translations = data.get("analyzer", {})
            _LOGGER.debug(
                "Loaded %d analyzer translations for language '%s' (disk fallback)",
                len(self._translations), language,
            )
        except (FileNotFoundError, json.JSONDecodeError) as e:
            _LOGGER.warning("Error loading translations from %s: %s", translation_file, e)
            self._translations = {}

    def t(self, key: str, **kwargs) -> str:
        """Get translation with parameter substitution."""
        template = self._translations.get(key, key)
        if kwargs:
            try:
                return template.format(**kwargs)
            except (KeyError, ValueError) as e:
                _LOGGER.debug("Error formatting translation key '%s': %s", key, e)
                return template
        return template


async def async_get_haca_ignored_entity_ids(hass) -> set[str]:
    """Return the full set of entity_ids that should be ignored by HACA.

    Checks both entity_registry (label on the entity itself) and
    device_registry (label on the device — all its entities are then ignored).
    """
    from homeassistant.helpers import entity_registry as er, device_registry as dr

    ignored: set[str] = set()
    try:
        ent_reg = er.async_get(hass)
        dev_reg = dr.async_get(hass)

        # 1. Entities labeled directly
        for entry in ent_reg.entities.values():
            if "haca_ignore" in (entry.labels or set()):
                ignored.add(entry.entity_id)

        # 2. Devices labeled → all their entities are ignored
        for device in dev_reg.devices.values():
            if "haca_ignore" in (getattr(device, "labels", None) or set()):
                for entry in ent_reg.entities.get_entries_for_device_id(device.id):
                    ignored.add(entry.entity_id)

    except Exception as exc:
        _LOGGER.warning("[HACA] Error building haca_ignore set: %s", exc)

    _LOGGER.debug("[HACA] haca_ignore: %d entity_ids will be skipped", len(ignored))
    return ignored