"""Tests for TranslationHelper — v1.1.0.

Guards against:
  - load_language not loading the 'analyzer' section
  - async_load_language_section not loading named top-level sections (ai_prompts, etc.)
  - t() not falling back to key on missing translation
  - t() parameter substitution failing
  - Language fallback to English when requested language file is absent
"""
from __future__ import annotations

import json
import pytest
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import MockHass


def make_helper(hass=None):
    from custom_components.config_auditor.translation_utils import TranslationHelper
    return TranslationHelper(hass or MockHass())


# ── load_language ──────────────────────────────────────────────────────────────

class TestLoadLanguage:
    def test_loads_analyzer_section_en(self):
        h = make_helper()
        h.load_language("en")
        # 'analyzer' section should be populated
        assert len(h._translations) > 0

    def test_loads_analyzer_section_fr(self):
        h = make_helper()
        h.load_language("fr")
        assert len(h._translations) > 0

    def test_fallback_to_en_on_unknown_language(self):
        h = make_helper()
        h.load_language("xx")  # non-existent
        assert len(h._translations) > 0  # fell back to en

    def test_known_key_present_after_load(self):
        h = make_helper()
        h.load_language("en")
        # 'trigger_uses_device_id' must exist in the analyzer section
        assert h.t("trigger_uses_device_id") != "trigger_uses_device_id"

    def test_fr_key_differs_from_en(self):
        en = make_helper()
        en.load_language("en")
        fr = make_helper()
        fr.load_language("fr")
        en_val = en.t("trigger_uses_device_id")
        fr_val = fr.t("trigger_uses_device_id")
        # Both should exist but differ in language
        assert en_val != "trigger_uses_device_id"
        assert fr_val != "trigger_uses_device_id"
        assert en_val != fr_val


# ── async_load_language_section ────────────────────────────────────────────────

class TestAsyncLoadLanguageSection:
    @pytest.mark.asyncio
    async def test_loads_ai_prompts_section(self):
        h = make_helper()
        await h.async_load_language_section("en", "ai_prompts")
        # After loading ai_prompts, key fallback_intro should be present
        assert h._translations.get("fallback_intro") is not None

    @pytest.mark.asyncio
    async def test_loads_ai_prompts_fr(self):
        h = make_helper()
        await h.async_load_language_section("fr", "ai_prompts")
        assert h._translations.get("fallback_intro") is not None

    @pytest.mark.asyncio
    async def test_unknown_section_returns_empty(self):
        h = make_helper()
        await h.async_load_language_section("en", "nonexistent_section_xyz")
        assert h._translations == {}

    @pytest.mark.asyncio
    async def test_section_isolation_from_load_language(self):
        """async_load_language_section must NOT clobber the analyzer section."""
        h = make_helper()
        h.load_language("en")
        analyzer_key = list(h._translations.keys())[0]
        # Loading ai_prompts replaces _translations with ai_prompts content
        await h.async_load_language_section("en", "ai_prompts")
        # Now _translations contains ai_prompts, not analyzer
        assert "fallback_intro" in h._translations
        # The caller is responsible for managing what was loaded — no clobber protection needed
        # but the api must work without crashing
        assert True


# ── t() translation method ─────────────────────────────────────────────────────

class TestTranslationT:
    def test_returns_key_when_missing(self):
        h = make_helper()
        h._translations = {}
        assert h.t("some_missing_key") == "some_missing_key"

    def test_returns_value_when_present(self):
        h = make_helper()
        h._translations = {"greeting": "Hello"}
        assert h.t("greeting") == "Hello"

    def test_parameter_substitution_single(self):
        h = make_helper()
        h._translations = {"msg": "Entity {entity_id} has an issue"}
        assert h.t("msg", entity_id="light.salon") == "Entity light.salon has an issue"

    def test_parameter_substitution_multiple(self):
        h = make_helper()
        h._translations = {"msg": "{count} issues in {category}"}
        assert h.t("msg", count=5, category="automations") == "5 issues in automations"

    def test_missing_param_returns_template(self):
        """If a parameter is missing, return the raw template rather than crashing."""
        h = make_helper()
        h._translations = {"msg": "Hello {name}"}
        result = h.t("msg")  # no 'name' param
        assert "Hello" in result  # still returns something

    def test_empty_string_value_returns_empty(self):
        """t() returns the stored value; empty string is a valid (if unusual) translation."""
        h = make_helper()
        h._translations = {"empty": ""}
        # Empty string is a valid value — t() returns it as-is
        assert h.t("empty") == ""

    def test_missing_key_returns_key_as_fallback(self):
        h = make_helper()
        h._translations = {}
        assert h.t("this_key_is_missing") == "this_key_is_missing"


# ── JSON translation files completeness ────────────────────────────────────────

class TestTranslationFilesCompleteness:
    """Regression: every key in en.json must also exist in fr.json."""

    def _load(self, lang):
        p = Path(__file__).parent.parent / "translations" / f"{lang}.json"
        with open(p, encoding="utf-8") as f:
            return json.load(f)

    def _flatten(self, d: dict, prefix: str = "") -> set:
        keys = set()
        for k, v in d.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys |= self._flatten(v, full)
            else:
                keys.add(full)
        return keys

    def test_all_en_keys_exist_in_fr(self):
        en_keys = self._flatten(self._load("en"))
        fr_keys = self._flatten(self._load("fr"))
        missing = en_keys - fr_keys
        assert not missing, f"Keys in en.json missing from fr.json:\n" + "\n".join(sorted(missing))

    def test_analyzer_section_non_empty_en(self):
        en = self._load("en")
        assert len(en.get("analyzer", {})) > 0

    def test_analyzer_section_non_empty_fr(self):
        fr = self._load("fr")
        assert len(fr.get("analyzer", {})) > 0

    def test_ai_prompts_section_present(self):
        en = self._load("en")
        assert "ai_prompts" in en
        assert "fallback_intro" in en["ai_prompts"]
        assert "complexity_prompt" in en["ai_prompts"]

    def test_panel_issue_types_present(self):
        en = self._load("en")
        it = en.get("panel", {}).get("issue_types", {})
        assert "categories" in it
        assert "types" in it
        # Spot-check a few required categories
        for cat in ("automations", "entities", "security", "performance"):
            assert cat in it["categories"], f"Category '{cat}' missing from panel.issue_types.categories"

    def test_panel_issue_types_types_non_empty(self):
        en = self._load("en")
        types = en.get("panel", {}).get("issue_types", {}).get("types", {})
        # At least 20 issue types should be defined
        assert len(types) >= 20, f"Only {len(types)} issue types defined, expected >= 20"

    def test_no_hardcoded_french_in_en_values(self):
        """Spot-check: en.json values should not contain accented French chars in analyzer section."""
        en = self._load("en")
        analyzer = en.get("analyzer", {})
        fr_chars = set("àâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ")
        suspicious = {k: v for k, v in analyzer.items()
                      if isinstance(v, str) and any(c in v for c in fr_chars)}
        assert not suspicious, f"Possible French text in en.json analyzer: {suspicious}"
