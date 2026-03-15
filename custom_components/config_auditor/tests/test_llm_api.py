"""Tests for llm_api.py — HacaLLMAPI, HacaTool, _input_schema_to_vol.

Guards against:
  - HacaLLMAPI not registered / unregistered correctly
  - HacaTool.async_call routing to TOOL_HANDLERS
  - JSON Schema → voluptuous conversion
  - _auto_backup delegates to _tool_ha_backup_create (no duplication)
  - _safe_write_and_reload exists and rollback logic is present
"""
from __future__ import annotations

import ast
import asyncio
import pytest
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# ── Syntax guards ─────────────────────────────────────────────────────────────

class TestLLMApiSyntax:
    def test_llm_api_valid_syntax(self):
        src = (Path(__file__).parent.parent / "llm_api.py").read_text()
        ast.parse(src)

    def test_mcp_server_valid_syntax(self):
        src = (Path(__file__).parent.parent / "mcp_server.py").read_text()
        ast.parse(src)


# ── HacaLLMAPI structure ──────────────────────────────────────────────────────

class TestHacaLLMAPIStructure:
    """HacaLLMAPI must expose the required interface."""

    def test_haca_llm_api_id_constant(self):
        from custom_components.config_auditor.llm_api import HACA_LLM_API_ID
        assert HACA_LLM_API_ID == "haca"

    def test_haca_llm_api_name(self):
        from custom_components.config_auditor.llm_api import HACA_LLM_API_NAME
        assert HACA_LLM_API_NAME == "HACA"

    def test_haca_llm_api_is_coroutine(self):
        from custom_components.config_auditor.llm_api import HacaLLMAPI
        assert asyncio.iscoroutinefunction(HacaLLMAPI.async_get_api_instance)

    def test_haca_tool_is_coroutine(self):
        from custom_components.config_auditor.llm_api import HacaTool
        assert asyncio.iscoroutinefunction(HacaTool.async_call)


# ── _input_schema_to_vol ─────────────────────────────────────────────────────

class TestInputSchemaToVol:
    """JSON Schema → voluptuous conversion."""

    def _convert(self, schema):
        from custom_components.config_auditor.llm_api import _input_schema_to_vol
        return _input_schema_to_vol(schema)

    def test_empty_schema(self):
        import voluptuous as vol
        result = self._convert({})
        assert isinstance(result, vol.Schema)

    def test_required_string_field(self):
        import voluptuous as vol
        schema = self._convert({
            "type": "object",
            "required": ["name"],
            "properties": {"name": {"type": "string"}},
        })
        # Must accept valid input
        result = schema({"name": "test"})
        assert result["name"] == "test"

    def test_optional_field_with_default(self):
        import voluptuous as vol
        schema = self._convert({
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "default": 50},
            },
        })
        result = schema({})
        assert result.get("limit") == 50

    def test_enum_field(self):
        import voluptuous as vol
        schema = self._convert({
            "type": "object",
            "properties": {
                "severity": {"type": "string", "enum": ["high", "medium", "low"]},
            },
        })
        result = schema({"severity": "high"})
        assert result["severity"] == "high"

    def test_missing_required_raises(self):
        import voluptuous as vol
        schema = self._convert({
            "type": "object",
            "required": ["entity_id"],
            "properties": {"entity_id": {"type": "string"}},
        })
        with pytest.raises(vol.Invalid):
            schema({})


# ── HacaTool routing ──────────────────────────────────────────────────────────

class TestHacaToolRouting:
    """HacaTool must route to TOOL_HANDLERS."""

    @pytest.mark.asyncio
    async def test_tool_routes_to_handler(self):
        from custom_components.config_auditor.llm_api import HacaTool
        from custom_components.config_auditor.mcp_server import TOOL_HANDLERS

        # Pick any real tool
        tool_name = "haca_get_issues"
        assert tool_name in TOOL_HANDLERS, f"{tool_name} not in TOOL_HANDLERS"

        tool = HacaTool({"name": tool_name, "description": "test", "inputSchema": {}})
        assert tool.name == tool_name

        mock_hass = MagicMock()
        mock_context = MagicMock()

        # Patch the handler to avoid real HA calls
        fake_result = {"success": True, "issues": []}
        with patch.dict(TOOL_HANDLERS, {tool_name: AsyncMock(return_value=fake_result)}):
            from custom_components.config_auditor.llm_api import HacaTool as HT
            from homeassistant.helpers.llm import ToolInput
            tool_input = ToolInput(tool_name=tool_name, tool_args={})
            result = await tool.async_call(mock_hass, tool_input, mock_context)

        assert result == fake_result

    @pytest.mark.asyncio
    async def test_unknown_tool_raises(self):
        from custom_components.config_auditor.llm_api import HacaTool
        from homeassistant.exceptions import HomeAssistantError
        from homeassistant.helpers.llm import ToolInput

        tool = HacaTool({"name": "nonexistent_tool_xyz", "description": "", "inputSchema": {}})
        with pytest.raises(HomeAssistantError, match="not found"):
            await tool.async_call(
                MagicMock(),
                ToolInput(tool_name="nonexistent_tool_xyz", tool_args={}),
                MagicMock(),
            )


# ── _auto_backup delegates to _tool_ha_backup_create ─────────────────────────

class TestAutoBackupDelegation:
    """_auto_backup must delegate to _tool_ha_backup_create (no duplication)."""

    def test_auto_backup_calls_tool(self):
        mcp_src = (Path(__file__).parent.parent / "mcp_server.py").read_text()
        # Find _auto_backup function body
        start = mcp_src.find("async def _auto_backup(")
        end   = mcp_src.find("\nasync def ", start + 1)
        fn_body = mcp_src[start:end]
        assert "_tool_ha_backup_create" in fn_body, \
            "_auto_backup must delegate to _tool_ha_backup_create"
        # Must NOT contain DATA_MANAGER (that would be duplication)
        assert "DATA_MANAGER" not in fn_body, \
            "_auto_backup must not duplicate BackupManager logic"

    def test_safe_write_and_reload_exists(self):
        mcp_src = (Path(__file__).parent.parent / "mcp_server.py").read_text()
        assert "async def _safe_write_and_reload(" in mcp_src, \
            "_safe_write_and_reload helper not found in mcp_server.py"

    def test_safe_write_and_reload_has_rollback(self):
        mcp_src = (Path(__file__).parent.parent / "mcp_server.py").read_text()
        start = mcp_src.find("async def _safe_write_and_reload(")
        end   = mcp_src.find("\nasync def ", start + 1)
        fn_body = mcp_src[start:end]
        assert "original_content" in fn_body, \
            "_safe_write_and_reload must save original content for rollback"
        assert "RuntimeError" in fn_body, \
            "_safe_write_and_reload must raise on reload failure after rollback"


# ── _tool_ha_deep_search timeout ─────────────────────────────────────────────

class TestDeepSearchTimeout:
    """deep_search must have a timeout to protect the event loop."""

    def test_wait_for_timeout_present(self):
        mcp_src = (Path(__file__).parent.parent / "mcp_server.py").read_text()
        start = mcp_src.find("async def _tool_ha_deep_search(")
        end   = mcp_src.find("\nasync def ", start + 1)
        fn_body = mcp_src[start:end]
        assert "wait_for" in fn_body, \
            "_tool_ha_deep_search must use asyncio.wait_for for timeout protection"
        assert "timeout=15" in fn_body or "timeout = 15" in fn_body, \
            "_tool_ha_deep_search timeout must be 15 seconds"


# ── Rate limiting in chat ─────────────────────────────────────────────────────

class TestChatRateLimit:
    """_sendChatMessage must enforce rate limiting."""

    def test_rate_limit_in_js(self):
        js_src = (Path(__file__).parent.parent / "www" / "src" / "core.js").read_text()
        assert "_lastChatTime" in js_src, \
            "_lastChatTime rate limit variable not found in haca-panel.js"
        assert "3000" in js_src, \
            "3000ms rate limit not found in haca-panel.js"
