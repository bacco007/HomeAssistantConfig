"""Tests for websocket.py — handler registration, chat fallback, field fix, security."""
from __future__ import annotations

import re
from pathlib import Path

import pytest

WS_FILE   = Path(__file__).parent.parent / "websocket.py"
CONTENT   = WS_FILE.read_text(encoding="utf-8")
MCP_FILE  = Path(__file__).parent.parent / "mcp_server.py"
MCP_CONTENT = MCP_FILE.read_text(encoding="utf-8")


# ── Handler registration ──────────────────────────────────────────────────────

class TestWebsocketHandlers:
    """All websocket handlers must be registered."""

    def test_handle_chat_registered(self):
        assert "handle_chat" in CONTENT
        assert "websocket_api.async_register_command(hass, handle_chat)" in CONTENT

    def test_handle_translations_registered(self):
        assert "handle_get_translations" in CONTENT
        assert "websocket_api.async_register_command(hass, handle_get_translations)" in CONTENT

    def test_handle_explain_issue_registered(self):
        assert "handle_explain_issue" in CONTENT
        assert "websocket_api.async_register_command(hass, handle_explain_issue)" in CONTENT

    def test_handle_ai_suggest_fix_registered(self):
        assert "handle_ai_suggest_fix" in CONTENT
        assert "websocket_api.async_register_command(hass, handle_ai_suggest_fix)" in CONTENT

    def test_handle_apply_field_fix_registered(self):
        assert "handle_apply_field_fix" in CONTENT
        assert "websocket_api.async_register_command(hass, handle_apply_field_fix)" in CONTENT

    def test_valid_python_syntax(self):
        import py_compile, tempfile
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
            f.write(CONTENT.encode())
            fname = f.name
        try:
            py_compile.compile(fname, doraise=True)
        except py_compile.PyCompileError as e:
            pytest.fail(f"Syntax error in websocket.py: {e}")


# ── Security: admin protection ────────────────────────────────────────────────

class TestAdminProtection:
    """Destructive handlers must require admin."""

    DESTRUCTIVE = [
        "handle_apply_fix",
        "handle_restore_backup",
        "handle_purge_recorder_orphans",
        "handle_apply_field_fix",
        "handle_chat",
        "handle_save_options",
        "handle_delete_history",
        "handle_ai_suggest_fix",
    ]

    def test_destructive_handlers_require_admin(self):
        """Every destructive handler must have @require_admin decorator."""
        missing = []
        for handler in self.DESTRUCTIVE:
            # Find the handler definition and check the 3 lines before it
            pattern = rf"@websocket_api\.require_admin\s+@websocket_api\.async_response\s+async def {handler}\("
            if not re.search(pattern, CONTENT, re.MULTILINE):
                missing.append(handler)
        assert not missing, f"Missing @require_admin on: {missing}"

    def test_read_only_handlers_no_require_admin(self):
        """Read-only handlers must NOT require admin."""
        READ_ONLY = [
            "handle_get_data",
            "handle_get_translations",
            "handle_list_backups",
            "handle_get_options",
        ]
        for handler in READ_ONLY:
            # Ensure require_admin does NOT appear just before these handlers
            pattern = rf"@websocket_api\.require_admin\s+@websocket_api\.async_response\s+async def {handler}\("
            assert not re.search(pattern, CONTENT, re.MULTILINE), \
                f"{handler} should NOT have @require_admin (it is read-only)"


# ── Chat: async_converse fallback chain ───────────────────────────────────────

class TestChatFallback:
    """handle_chat must use async_converse with fallback across all agents."""

    def test_uses_async_converse(self):
        assert "async_converse" in CONTENT, \
            "handle_chat must use homeassistant.components.conversation.async_converse"

    def test_no_haca_action_loop(self):
        """Old [HACA_ACTION:] agentic loop must be gone — now handled natively by HA LLM API."""
        assert "[HACA_ACTION:" not in CONTENT, \
            "[HACA_ACTION:] parsing loop must not exist in websocket.py (now handled by HA LLM API)"

    def test_fallback_across_agents(self):
        """Chat must iterate over multiple agents for fallback."""
        assert "_async_find_all_conversation_agents" in CONTENT, \
            "handle_chat must call _async_find_all_conversation_agents for fallback"

    def test_is_llm_error_reply_used(self):
        """Error replies from agents must be detected and skipped."""
        assert "_is_llm_error_reply" in CONTENT, \
            "_is_llm_error_reply must be used to detect and skip error responses"


# ── Field fix: apply_field_fix correctness ───────────────────────────────────

class TestApplyFieldFix:
    """handle_apply_field_fix must write atomically and match by entity_id."""

    def test_atomic_write(self):
        """YAML must be written atomically (tmp file + os.replace)."""
        assert "_os.replace(" in CONTENT or "os.replace(" in CONTENT, \
            "apply_field_fix must use atomic write (os.replace)"

    def test_supported_fields_only(self):
        """Only description and alias are supported fields."""
        assert '"description", "alias"' in CONTENT or \
               '("description", "alias")' in CONTENT, \
            "apply_field_fix must validate field is in (description, alias)"

    def test_entity_id_primary_match(self):
        """Match must use entity_id / id as primary key, not alias fallback."""
        # The function must match by item_id == slug (HA numeric id)
        assert 'item_id == slug' in CONTENT or 'item.get("id"' in CONTENT, \
            "apply_field_fix must match automation by its numeric id"


# ── MCP tools: backup before destructive ops ─────────────────────────────────

class TestAutoBackup:
    """Destructive MCP tools must trigger automatic backup."""

    DESTRUCTIVE_TOOLS = [
        "_tool_ha_remove_automation",
        "_tool_ha_update_automation",
        "_tool_ha_create_automation",
        "_tool_ha_remove_script",
        "_tool_ha_update_script",
        "_tool_ha_remove_scene",
        "_tool_ha_update_scene",
    ]

    def test_auto_backup_helper_exists(self):
        assert "async def _auto_backup(" in MCP_CONTENT, \
            "_auto_backup helper function missing from mcp_server.py"

    def test_atomic_write_helper_exists(self):
        assert "def _atomic_write(" in MCP_CONTENT, \
            "_atomic_write helper function missing from mcp_server.py"

    def test_destructive_tools_call_auto_backup(self):
        missing = []
        for tool in self.DESTRUCTIVE_TOOLS:
            fn_start = MCP_CONTENT.find(f"async def {tool}(")
            if fn_start == -1:
                missing.append(f"{tool} (not found)")
                continue
            # Check within next 3000 chars
            fn_body = MCP_CONTENT[fn_start:fn_start + 3000]
            if "_auto_backup" not in fn_body:
                missing.append(tool)
        assert not missing, f"Missing _auto_backup call in: {missing}"

    def test_no_unsafe_write_text(self):
        """No direct write_text() on YAML files — must use _atomic_write."""
        # write_text() for non-YAML things (blueprints with open()) is OK
        # but auto_file.write_text and scripts_file.write_text must be gone
        assert "auto_file.write_text" not in MCP_CONTENT, \
            "auto_file.write_text found — must use _atomic_write"
        assert "scripts_file.write_text" not in MCP_CONTENT, \
            "scripts_file.write_text found — must use _atomic_write"


# ── Path traversal protection ─────────────────────────────────────────────────

class TestPathTraversal:
    """Config file tools must use realpath() to prevent traversal."""

    def test_realpath_used_in_get_config(self):
        assert "os.path.realpath" in MCP_CONTENT, \
            "os.path.realpath must be used to prevent path traversal"

    def test_no_startswith_only_check(self):
        """Raw startswith(config_root) without realpath is insufficient."""
        # Should not have the vulnerable pattern (without realpath)
        vulnerable = re.findall(
            r'fpath\.startswith\(config_root\)',
            MCP_CONTENT
        )
        assert not vulnerable, \
            "Vulnerable fpath.startswith(config_root) without realpath() found"
