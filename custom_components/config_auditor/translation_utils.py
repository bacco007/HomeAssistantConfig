"""Translation utilities for H.A.C.A analyzers."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

_LOGGER = logging.getLogger(__name__)


class TranslationHelper:
    """Helper class for translations in analyzers."""
    
    def __init__(self, hass) -> None:
        """Initialize translation helper."""
        self.hass = hass
        self._language = "en"
        self._translations: dict[str, str] = {}
    
    async def async_load_language(self, language: str) -> None:
        """Load translations asynchronously (runs file I/O in executor to avoid blocking)."""
        await self.hass.async_add_executor_job(self.load_language, language)

    async def async_load_language_section(self, language: str, section: str) -> None:
        """Load a specific top-level JSON section (e.g. 'ai_prompts') instead of 'analyzer'."""
        await self.hass.async_add_executor_job(self._load_section, language, section)

    def _load_section(self, language: str, section: str) -> None:
        """Synchronously load a named section from the JSON translation file."""
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
        """Load translations for the specified language from JSON files (sync, for executor use only)."""
        self._language = language
        
        # Determine the translation file path
        translations_dir = Path(__file__).parent / "translations"
        translation_file = translations_dir / f"{language}.json"
        
        # Fallback to English if the language file doesn't exist
        if not translation_file.exists():
            translation_file = translations_dir / "en.json"
            _LOGGER.debug("Translation file for '%s' not found, falling back to English", language)
        
        try:
            with open(translation_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Extract analyzer translations from the JSON structure
            self._translations = data.get("analyzer", {})
            _LOGGER.debug("Loaded %d analyzer translations for language '%s'", len(self._translations), language)
            
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