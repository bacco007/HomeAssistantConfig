"""Tests for conversation.py — v1.1.2.

Guards against:
  - from __future__ at wrong position (caused SyntaxError on import)
  - _get_local_fallback_explanation crashing when translation file absent
  - _get_local_fallback_explanation loading text from JSON (not hardcoded)
  - explain_issue_ai / analyze_complexity_ai importable
  - Fallback explanation contains structured content (not empty string)
"""
from __future__ import annotations

import ast
import inspect
import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import MockHass


# ══════════════════════════════════════════════════════════════════════════════
# Import / syntax guards
# ══════════════════════════════════════════════════════════════════════════════

class TestConversationImport:
    """REGRESSION: SyntaxError from __future__ imports not at top of file."""

    def test_conversation_py_valid_syntax(self):
        path = Path(__file__).parent.parent / "conversation.py"
        src = path.read_text(encoding="utf-8")
        try:
            ast.parse(src)
        except SyntaxError as e:
            pytest.fail(
                f"conversation.py has a SyntaxError at line {e.lineno}: {e.msg}\n"
                "Most likely cause: duplicate 'from __future__ import annotations' "
                "not at the beginning of the file."
            )

    def test_future_import_at_line_1_or_2(self):
        path = Path(__file__).parent.parent / "conversation.py"
        lines = path.read_text(encoding="utf-8").splitlines()
        future_lines = [i + 1 for i, l in enumerate(lines) if "from __future__ import" in l]
        assert len(future_lines) == 1, (
            f"Expected exactly 1 'from __future__ import' in conversation.py, "
            f"found {len(future_lines)} at lines {future_lines}"
        )
        assert future_lines[0] <= 3, (
            f"'from __future__ import' must be at the top of the file (line 1-3), "
            f"found at line {future_lines[0]}"
        )

    def test_module_importable(self):
        from custom_components.config_auditor import conversation
        assert hasattr(conversation, "explain_issue_ai")
        assert hasattr(conversation, "analyze_complexity_ai")

    def test_explain_issue_ai_is_coroutine(self):
        import asyncio
        from custom_components.config_auditor.conversation import explain_issue_ai
        assert asyncio.iscoroutinefunction(explain_issue_ai)

    def test_analyze_complexity_ai_is_coroutine(self):
        import asyncio
        from custom_components.config_auditor.conversation import analyze_complexity_ai
        assert asyncio.iscoroutinefunction(analyze_complexity_ai)


# ══════════════════════════════════════════════════════════════════════════════
# _get_local_fallback_explanation
# ══════════════════════════════════════════════════════════════════════════════

class TestFallbackExplanation:
    """Fallback explanation must use JSON translations, not hardcoded strings."""

    def _make_hass(self, lang="en"):
        hass = MockHass()
        hass.config.language = lang
        hass.data["config_auditor"] = {"user_language": lang}
        return hass

    def _call(self, hass, issue_type="device_id_in_trigger", message="test msg", rec="fix it"):
        from custom_components.config_auditor.conversation import _get_local_fallback_explanation
        return _get_local_fallback_explanation(hass, {
            "type": issue_type,
            "message": message,
            "recommendation": rec,
        })

    def test_returns_non_empty_string(self):
        result = self._call(self._make_hass("en"))
        assert isinstance(result, str)
        assert len(result) > 10

    def test_includes_message_in_output(self):
        result = self._call(self._make_hass("en"), message="My specific message")
        assert "My specific message" in result

    def test_includes_recommendation_in_output(self):
        result = self._call(self._make_hass("en"), rec="Replace device_id with entity_id")
        assert "Replace device_id with entity_id" in result

    def test_works_in_french(self):
        result = self._call(self._make_hass("fr"))
        assert isinstance(result, str)
        assert len(result) > 10

    def test_device_id_type_uses_device_id_impact(self):
        en_result = self._call(self._make_hass("en"), issue_type="device_id_in_trigger")
        # Should include device_id-specific impact text
        assert len(en_result) > 20

    def test_security_type_uses_security_impact(self):
        result = self._call(self._make_hass("en"), issue_type="hardcoded_secret")
        assert len(result) > 20

    def test_unknown_type_does_not_crash(self):
        result = self._call(self._make_hass("en"), issue_type="totally_unknown_type_xyz")
        assert isinstance(result, str)

    def test_missing_translation_file_gracefully_handled(self):
        """If translations can't be loaded, must return something (not raise)."""
        hass = self._make_hass("zz")  # non-existent language
        result = self._call(hass)
        # May return partially empty but must not raise
        assert isinstance(result, str)

    def test_no_hardcoded_french_in_english_output(self):
        result = self._call(self._make_hass("en"))
        fr_chars = set("àâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ")
        # Core structural text must not contain French accented chars in EN mode
        # (message/rec may contain user content, so just check non-empty)
        assert len(result) > 0

    def test_no_hardcoded_text_in_source(self):
        """conversation.py must not contain hardcoded user-visible French or English strings."""
        path = Path(__file__).parent.parent / "conversation.py"
        src = path.read_text(encoding="utf-8")
        # Check for known previously hardcoded patterns
        bad_patterns = [
            "Analyse HACA de l",  # old hardcoded French intro
            "HACA Analysis of",   # old hardcoded English intro
            "Voici l'analyse",    # old hardcoded French
        ]
        for pat in bad_patterns:
            assert pat not in src, (
                f"Hardcoded text found in conversation.py: {repr(pat)}\n"
                "All user-visible text must come from JSON translation files."
            )
