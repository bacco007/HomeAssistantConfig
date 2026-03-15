"""Tests for mcp_server.py — handler name consistency, tool registry, schema completeness."""
from __future__ import annotations

import re
import ast
import json
from pathlib import Path
from collections import Counter

import pytest

MCP_FILE = Path(__file__).parent.parent / "mcp_server.py"
CONTENT = MCP_FILE.read_text(encoding="utf-8")


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def defined_handlers():
    """All async def _tool_*() functions defined in mcp_server.py."""
    return set(re.findall(r"^async def (_tool_\w+)\(", CONTENT, re.MULTILINE))


@pytest.fixture(scope="module")
def registered_handlers():
    """All _tool_* values registered in TOOL_HANDLERS dicts."""
    return set(re.findall(r'"[\w]+"\s*:\s*(_tool_\w+)', CONTENT))


@pytest.fixture(scope="module")
def registered_tool_names():
    """All public tool names registered as TOOL_HANDLERS keys."""
    return set(re.findall(r'"([\w]+)"\s*:\s*_tool_\w+', CONTENT))


@pytest.fixture(scope="module")
def declared_tool_names():
    """All tool names declared in the tools list via "name": "..."."""
    return set(re.findall(r'"name":\s*"(ha_\w+|haca_\w+)"', CONTENT))


@pytest.fixture(scope="module")
def internal_await_calls():
    """All _tool_* functions called with await inside other handlers."""
    return set(re.findall(r"await (_tool_\w+)\(", CONTENT))


# ── Handler name consistency ──────────────────────────────────────────────────

class TestHandlerNameConsistency:
    """Ensure no NameError can occur at runtime due to wrong function names."""

    def test_all_registered_handlers_are_defined(self, defined_handlers, registered_handlers):
        """Every value in TOOL_HANDLERS must point to an existing function."""
        missing = registered_handlers - defined_handlers
        assert not missing, (
            f"TOOL_HANDLERS references undefined functions: {missing}\n"
            "This causes NameError at startup — like the _tool_haca_get_automation bug."
        )

    def test_all_internal_await_calls_are_defined(self, defined_handlers, internal_await_calls):
        """Every await _tool_*() call inside handlers must target an existing function."""
        missing = internal_await_calls - defined_handlers
        assert not missing, (
            f"Internal await calls reference undefined functions: {missing}\n"
            "This causes NameError at runtime when those handlers are invoked."
        )

    def test_no_duplicate_handler_definitions(self):
        """No _tool_* function should be defined more than once."""
        all_defs = re.findall(r"^async def (_tool_\w+)\(", CONTENT, re.MULTILINE)
        dupes = {k: v for k, v in Counter(all_defs).items() if v > 1}
        assert not dupes, f"Duplicate handler definitions: {dupes}"

    def test_no_orphan_handlers(self, defined_handlers, registered_handlers):
        """Every defined _tool_* should be registered (no dead code)."""
        # Some internal helpers are allowed to be unregistered (called by other tools)
        orphans = defined_handlers - registered_handlers
        # Remove known internal helpers that are called by other tools
        known_internal_callers = set(re.findall(r"await (_tool_\w+)\(", CONTENT))
        true_orphans = orphans - known_internal_callers
        assert not true_orphans, (
            f"Defined handlers not registered or called anywhere: {true_orphans}"
        )


# ── Tool registry completeness ────────────────────────────────────────────────

class TestToolRegistry:
    """Every public tool must be declared in the tools list AND have a handler."""

    def test_declared_count_matches_registered_count(
        self, declared_tool_names, registered_tool_names
    ):
        """The tools list and TOOL_HANDLERS must have the same tools."""
        in_handlers_not_declared = registered_tool_names - declared_tool_names
        in_declared_not_handlers = declared_tool_names - registered_tool_names
        # Aliases ha_* → haca_* sont légitimes (dans TOOL_HANDLERS mais pas dans MCP_TOOLS)
        KNOWN_ALIASES = {"ha_fix_suggestion","ha_explain_issue","ha_get_issues",
                         "ha_get_automation","ha_get_batteries","ha_apply_fix","ha_get_score"}
        in_handlers_not_declared -= KNOWN_ALIASES
        assert not in_handlers_not_declared, (
            f"In TOOL_HANDLERS but not in tools list: {in_handlers_not_declared}"
        )
        assert not in_declared_not_handlers, (
            f"In tools list but not in TOOL_HANDLERS: {in_declared_not_handlers}"
        )

    def test_expected_tool_count(self, registered_tool_names):
        """There should be exactly 65 registered tools (v1.5.0)."""
        count = len(registered_tool_names)
        assert count == 65, f"Expected 65 tools, got {count}. Update this test if tools were added/removed."

    def test_no_duplicate_tool_names(self):
        """No tool name should appear twice in the tools list."""
        all_names = re.findall(r'"name":\s*"(ha_\w+|haca_\w+)"', CONTENT)
        dupes = {k: v for k, v in Counter(all_names).items() if v > 1}
        assert not dupes, f"Duplicate tool name declarations: {dupes}"

    def test_all_tools_have_description(self):
        """Every tool block must have a non-empty description."""
        declared = set(re.findall(r'"name":\s*"(ha_\w+|haca_\w+)"', CONTENT))
        # Check each declared tool has a 'description' key within 800 chars of its name
        no_desc = []
        for m in re.finditer(r'"name":\s*"(ha_\w+|haca_\w+)"', CONTENT):
            name = m.group(1)
            nearby = CONTENT[m.start():m.start() + 800]
            if '"description"' not in nearby:
                no_desc.append(name)
        assert not no_desc, f"Tools missing description: {set(no_desc)}"

    def test_haca_core_tools_present(self, registered_tool_names):
        """Core HACA audit tools must always be registered."""
        required = {
            "haca_get_issues", "haca_get_score", "haca_get_automation",
            "haca_fix_suggestion", "haca_apply_fix", "haca_get_batteries",
        }
        missing = required - registered_tool_names
        assert not missing, f"Core HACA tools missing: {missing}"

    def test_ha_safety_tools_present(self, registered_tool_names):
        """Safety-critical HA tools must always be registered."""
        required = {
            "ha_backup_create", "ha_check_config", "ha_reload_core",
        }
        missing = required - registered_tool_names
        assert not missing, f"Safety tools missing: {missing}"

    def test_ha_automation_crud_present(self, registered_tool_names):
        """Full CRUD for automations must be registered."""
        required = {
            "ha_create_automation", "ha_update_automation",
            "ha_remove_automation", "haca_get_automation",
        }
        missing = required - registered_tool_names
        assert not missing, f"Automation CRUD tools missing: {missing}"

    def test_ha_blueprint_tools_present(self, registered_tool_names):
        """Blueprint tools must be registered."""
        required = {
            "ha_create_blueprint", "ha_list_blueprints",
            "ha_get_blueprint", "ha_update_blueprint",
            "ha_remove_blueprint", "ha_import_blueprint",
        }
        missing = required - registered_tool_names
        assert not missing, f"Blueprint tools missing: {missing}"


# ── No hardcoded French in handler return messages ────────────────────────────

class TestNoHardcodedLanguage:
    """Handler return messages must be in English (the lingua franca for AI tools)."""

    def test_no_french_error_messages(self):
        """Error messages returned by handlers must not be in French."""
        french_patterns = [
            r'"error":\s*"[^"]*(?:requis|non trouvé|introuvable|Aucun|Erreur)[^"]*"',
            r'"message":\s*"[^"]*(?:Correction|Sauvegarde créée|appliquée pour)[^"]*"',
        ]
        found = []
        for pat in french_patterns:
            for m in re.finditer(pat, CONTENT):
                line_no = CONTENT[:m.start()].count('\n') + 1
                found.append(f"L{line_no}: {m.group()}")
        assert not found, f"French error messages found:\n" + "\n".join(found)

    def test_no_mixed_language_messages(self):
        """Messages should not mix French and English."""
        mixed = re.findall(
            r'"message":\s*"[^"]*(?:JSON invalide|Bearer token requis)[^"]*"',
            CONTENT
        )
        assert not mixed, f"Mixed-language messages found: {mixed}"


# ── Module importability ──────────────────────────────────────────────────────

class TestMcpServerImport:
    """mcp_server.py must be syntactically valid and importable."""

    def test_valid_python_syntax(self):
        import py_compile
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
            f.write(CONTENT.encode())
            fname = f.name
        try:
            py_compile.compile(fname, doraise=True)
        except py_compile.PyCompileError as e:
            pytest.fail(f"Syntax error in mcp_server.py: {e}")

    def test_tool_handlers_dict_has_correct_structure(self):
        """TOOL_HANDLERS must be defined and not empty."""
        assert "TOOL_HANDLERS" in CONTENT
        # Should have multiple entries
        entries = re.findall(r'"(ha_\w+|haca_\w+)"\s*:\s*_tool_\w+', CONTENT)
        assert len(entries) >= 50, f"Expected ≥50 TOOL_HANDLERS entries, got {len(entries)}"
