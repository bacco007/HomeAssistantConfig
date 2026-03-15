"""Tests for JS frontend integrity — translation keys, prompt patterns, bundle consistency."""
from __future__ import annotations

import re
import json
import subprocess
from pathlib import Path

import pytest

BASE = Path(__file__).parent.parent
SRC  = BASE / "www" / "src"
BUNDLE = BASE / "www" / "haca-panel.js"
FR_JSON = BASE / "translations" / "fr.json"


def get_panel_keys():
    """Flatten all keys under panel.* in fr.json."""
    data = json.loads(FR_JSON.read_text())
    panel = data.get("panel", {})
    def flatten(d, prefix=""):
        keys = set()
        for k, v in d.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys |= flatten(v, full)
            else:
                keys.add(full)
        return keys
    return flatten(panel)


# ── Bundle freshness ──────────────────────────────────────────────────────────

class TestBundleFreshness:
    """The compiled bundle must be consistent with source files."""

    def test_bundle_exists(self):
        assert BUNDLE.exists(), f"Compiled bundle not found: {BUNDLE}"

    def test_bundle_has_reasonable_size(self):
        size = BUNDLE.stat().st_size
        assert size > 200_000, f"Bundle seems too small ({size} bytes) — build may have failed"
        assert size < 5_000_000, f"Bundle seems too large ({size} bytes)"

    def test_bundle_contains_buildactionprompt(self):
        """_buildActionPrompt must be present in compiled bundle."""
        content = BUNDLE.read_text()
        assert "_buildActionPrompt" in content, (
            "_buildActionPrompt missing from compiled bundle. "
            "Run build.sh to recompile."
        )

    def test_bundle_contains_redundancy_direct_chat(self):
        """_showRedundancyAI must use _openChatWithMessage directly, not suggestion modal."""
        content = BUNDLE.read_text()
        assert "_showRedundancyAI" in content
        # Must NOT contain the old suggestion pattern
        assert "Suggestion IA" not in content, \
            "Old 'Suggestion IA' pattern found in bundle — intermediate modal not fully removed"
        assert "Applique cette modification" not in content, \
            "Old 'Applique cette modification' pattern found — intermediate modal not removed"

    def test_bundle_contains_area_direct_chat(self):
        """_showAreaSuggestionAI must go directly to chat."""
        content = BUNDLE.read_text()
        assert "_showAreaSuggestionAI" in content
        # Must NOT call haca/explain_issue
        bundle_area_idx = content.find("_showAreaSuggestionAI")
        area_fn = content[bundle_area_idx:bundle_area_idx + 1000]
        assert "haca/explain_issue" not in area_fn, \
            "_showAreaSuggestionAI still calls haca/explain_issue (suggestion modal pattern)"

    def test_no_explainwithai_called_for_blueprint(self):
        """Blueprint button must not call explainWithAI."""
        content = BUNDLE.read_text()
        # Find blueprint-ai-btn handler
        idx = content.find("blueprint-ai-btn")
        if idx >= 0:
            handler_section = content[idx:idx + 500]
            assert "explainWithAI(issue)" not in handler_section, \
                "Blueprint button still calls explainWithAI — will produce suggestion not action"


# ── No suggestion-style prompts ───────────────────────────────────────────────

class TestNoSuggestionPrompts:
    """JS must not build suggestion-style prompts that contaminate the chat."""

    BAD_PATTERNS = [
        "Suggestion IA",
        "Applique cette modification",
        "Explique comment migrer",
        "fournis un exemple YAML",
        r"propose.*YAML.*remplacement",
        "Analyse les risques.*propose",
    ]

    @pytest.mark.parametrize("filename", [
        "redundancy.js", "area_heatmap.js", "ai_explain.js",
        "issues.js", "core.js", "scan.js",
    ])
    def test_no_suggestion_pattern_in_source(self, filename):
        fpath = SRC / filename
        if not fpath.exists():
            pytest.skip(f"{filename} not found")
        content = fpath.read_text()
        for pat in self.BAD_PATTERNS:
            assert not re.search(pat, content, re.IGNORECASE), (
                f"Suggestion-style pattern '{pat}' found in {filename}. "
                "This causes the Chat AI to receive explanation prompts instead of action commands."
            )

    def test_no_suggestion_pattern_in_bundle(self):
        content = BUNDLE.read_text()
        for pat in self.BAD_PATTERNS:
            assert not re.search(pat, content, re.IGNORECASE), (
                f"Suggestion-style pattern '{pat}' found in compiled bundle."
            )


# ── Translation key coverage ──────────────────────────────────────────────────

class TestTranslationCoverage:
    """All this.t('x.y') calls in JS source must have corresponding keys in fr.json."""

    def test_all_used_keys_exist_in_fr_json(self):
        panel_keys = get_panel_keys()
        js_keys = set()
        for f in SRC.glob("*.js"):
            content = f.read_text()
            for m in re.finditer(r"""this\.t\(['"]([a-z_][a-z0-9_.]+)['"]\)""", content):
                k = m.group(1)
                if "." in k:
                    js_keys.add(k)

        missing = js_keys - panel_keys
        assert not missing, (
            f"{len(missing)} translation keys used in JS but missing from fr.json panel.*:\n"
            + "\n".join(f"  ❌ {k}" for k in sorted(missing)[:20])
            + ("\n  ..." if len(missing) > 20 else "")
        )

    def test_all_translation_files_have_same_panel_keys(self):
        """All language files must have the same panel.* keys as fr.json."""
        fr_keys = get_panel_keys()
        trans_dir = BASE / "translations"
        errors = []
        for f in sorted(trans_dir.glob("*.json")):
            if f.stem == "fr":
                continue
            data = json.loads(f.read_text())
            panel = data.get("panel", {})
            def flatten(d, prefix=""):
                keys = set()
                for k, v in d.items():
                    full = f"{prefix}.{k}" if prefix else k
                    if isinstance(v, dict):
                        keys |= flatten(v, full)
                    else:
                        keys.add(full)
                return keys
            lang_keys = flatten(panel)
            missing = fr_keys - lang_keys
            extra = lang_keys - fr_keys
            if missing or extra:
                errors.append(f"{f.stem}: missing={len(missing)}, extra={len(extra)}")
        assert not errors, f"Translation file key mismatches:\n" + "\n".join(errors)


# ── _buildActionPrompt coverage ──────────────────────────────────────────────

class TestBuildActionPromptCoverage:
    """_buildActionPrompt must cover all actionable issue types."""

    ACTIONABLE_TYPES = [
        # Automations
        "no_alias", "no_description", "never_triggered", "ghost_automation",
        "duplicate_automation", "probable_duplicate_automation",
        "device_id_in_trigger", "device_id_in_action", "device_id_in_condition",
        "deprecated_service", "unknown_service", "unknown_area_reference",
        "incorrect_mode_motion_single", "script_blueprint_candidate",
        "blueprint_missing_path", "blueprint_file_not_found",
        # Scripts
        "empty_script", "script_orphan", "script_cycle",
        # Scenes
        "empty_scene", "scene_duplicate", "scene_not_triggered",
        # Entities
        "zombie_entity", "ghost_registry_entry", "disabled_but_referenced",
        # Helpers
        "helper_unused", "timer_orphaned",
        # Security
        "hardcoded_secret", "sensitive_data_exposure",
        # Dashboard
        "dashboard_missing_entity",
    ]

    def test_actionable_types_handled_in_source(self):
        """Each actionable issue type must have a branch in _buildActionPrompt."""
        ai_explain = (SRC / "ai_explain.js").read_text()
        missing = []
        for issue_type in self.ACTIONABLE_TYPES:
            if f"'{issue_type}'" not in ai_explain and f'"{issue_type}"' not in ai_explain:
                missing.append(issue_type)
        assert not missing, (
            f"Issue types with no action prompt in _buildActionPrompt:\n"
            + "\n".join(f"  ❌ {t}" for t in missing)
        )

    def test_buildactionprompt_returns_null_for_informational(self):
        """Purely informational issues should return null (fall back to explainWithAI)."""
        ai_explain = (SRC / "ai_explain.js").read_text()
        assert "return null;" in ai_explain, \
            "_buildActionPrompt must return null for informational issues (fallback to explainWithAI)"
