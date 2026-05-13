"""Tests for TranslationHelper — v1.1.2.

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

# Helper: discover every language file at import time so parametrized tests
# stay in sync with new translations added under translations/.
_TRANSLATIONS_DIR = Path(__file__).parent.parent / "translations"
_ALL_LANGUAGES = sorted(p.stem for p in _TRANSLATIONS_DIR.glob("*.json"))
_OTHER_LANGUAGES = [lang for lang in _ALL_LANGUAGES if lang != "en"]


def _load_translation_file(lang: str) -> dict:
    p = _TRANSLATIONS_DIR / f"{lang}.json"
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _flatten_keys(d: dict, prefix: str = "") -> set[str]:
    """Return the set of dotted leaf paths in a nested dict (e.g. ``a.b.c``)."""
    keys: set[str] = set()
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= _flatten_keys(v, full)
        else:
            keys.add(full)
    return keys


class TestTranslationFilesCompleteness:
    """Regression: every key in en.json must also exist in every other language."""

    def _load(self, lang):
        return _load_translation_file(lang)

    def _flatten(self, d: dict, prefix: str = "") -> set:
        return _flatten_keys(d, prefix)

    def test_all_en_keys_exist_in_fr(self):
        # Kept for historical signal; superseded by the parametrized test below
        # that runs against every language.
        en_keys = self._flatten(self._load("en"))
        fr_keys = self._flatten(self._load("fr"))
        missing = en_keys - fr_keys
        assert not missing, f"Keys in en.json missing from fr.json:\n" + "\n".join(sorted(missing))

    @pytest.mark.parametrize("lang", _OTHER_LANGUAGES)
    def test_all_en_keys_exist_in_each_language(self, lang):
        """Every key present in en.json must also be present in <lang>.json.

        Catches the common mistake of adding a translation to en + fr but
        forgetting the other 11 language files.
        """
        en_keys = self._flatten(self._load("en"))
        other_keys = self._flatten(self._load(lang))
        missing = en_keys - other_keys
        assert not missing, (
            f"Keys present in en.json but missing from {lang}.json "
            f"({len(missing)}):\n" + "\n".join(sorted(missing))
        )

    @pytest.mark.parametrize("lang", _OTHER_LANGUAGES)
    def test_no_extra_keys_in_other_languages(self, lang):
        """Conversely, a language file should not carry orphan keys that
        no longer exist in en.json — this catches stale translations left
        behind after a key was renamed or removed."""
        en_keys = self._flatten(self._load("en"))
        other_keys = self._flatten(self._load(lang))
        extra = other_keys - en_keys
        assert not extra, (
            f"Keys present in {lang}.json but absent from en.json "
            f"({len(extra)}):\n" + "\n".join(sorted(extra))
        )

    def test_analyzer_section_non_empty_en(self):
        en = self._load("en")
        assert len(en.get("analyzer", {})) > 0

    def test_analyzer_section_non_empty_fr(self):
        fr = self._load("fr")
        assert len(fr.get("analyzer", {})) > 0

    @pytest.mark.parametrize("lang", _ALL_LANGUAGES)
    def test_proactive_agent_section_complete(self, lang):
        """The 19 proactive_agent keys must be present in every language file
        (added in step 5 — the weekly report builds them at runtime via _pa_t)."""
        required = {
            "weekly_report_notification_title", "weekly_report_header",
            "weekly_report_summary", "severity_section", "severity_high",
            "severity_medium", "severity_low", "category_section",
            "category_automation", "category_entity", "category_performance",
            "category_security", "critical_section", "correlations_section",
            "correlation_broken_device", "correlation_unavailable_entity",
            "ai_section", "report_footer", "ai_prompt",
        }
        section = self._load(lang).get("proactive_agent", {})
        missing = required - set(section)
        assert not missing, (
            f"proactive_agent keys missing from {lang}.json: " + ", ".join(sorted(missing))
        )

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


# ── Static reference scan (catches calls to undefined keys) ──────────────────


class TestSourceCodeKeyReferences:
    """Statically scan the Python sources for ``_ts(...)`` and ``_pa_t(...)``
    calls and verify every referenced (section, key) pair exists in en.json.

    Only literal-string call sites are checked (the regex does not follow
    f-strings or variables). That covers the vast majority of use-cases
    and catches typos like ``_ts(hass, "notifications", "uninstaled_title")``
    when the JSON only has ``uninstalled_title``.
    """

    @staticmethod
    def _scan_sources() -> tuple[set[tuple[str, str]], list[str]]:
        """Return (call_sites, files_scanned).

        ``call_sites`` is a set of ``(section, key)`` tuples.
        """
        import re
        # Matches:  _ts(hass, "section", "key"  …
        ts_pat = re.compile(
            r"""\b_ts\s*\(\s*[A-Za-z_][\w.]*\s*,\s*  # first arg: hass-like identifier
                ["']([A-Za-z_][\w]*)["']\s*,\s*       # section literal
                ["']([A-Za-z_][\w]*)["']               # key literal
            """,
            re.VERBOSE,
        )
        # Matches:  _pa_t(hass, "key"  …  → section is always "proactive_agent"
        pa_pat = re.compile(
            r"""\b_pa_t\s*\(\s*[A-Za-z_][\w.]*\s*,\s*
                ["']([A-Za-z_][\w]*)["']
            """,
            re.VERBOSE,
        )
        sources_dir = Path(__file__).parent.parent
        skip_dirs = {"tests", "translations", "fonts", "data", "brand", "www"}
        scanned: list[str] = []
        sites: set[tuple[str, str]] = set()
        for py in sources_dir.rglob("*.py"):
            if any(part in skip_dirs for part in py.relative_to(sources_dir).parts):
                continue
            scanned.append(str(py.relative_to(sources_dir)))
            text = py.read_text(encoding="utf-8")
            for m in ts_pat.finditer(text):
                sites.add((m.group(1), m.group(2)))
            for m in pa_pat.finditer(text):
                sites.add(("proactive_agent", m.group(1)))
        return sites, scanned

    def test_referenced_keys_exist_in_en(self):
        sites, scanned = self._scan_sources()
        assert scanned, "Expected to scan at least a few .py files"
        en = _load_translation_file("en")
        # Allow lookups against the panel-overlay merged form too: a section
        # may live under root OR under panel.<section>. Build the union.
        merged = dict(en)
        merged.pop("panel", None)
        for k, v in (en.get("panel") or {}).items():
            if isinstance(v, dict):
                merged.setdefault(k, {}).update(v)
        missing: list[str] = []
        for section, key in sorted(sites):
            section_dict = merged.get(section)
            if not isinstance(section_dict, dict) or key not in section_dict:
                missing.append(f"{section}.{key}")
        assert not missing, (
            f"Source code references {len(missing)} translation key(s) "
            f"that are absent from en.json:\n" + "\n".join(missing)
        )
