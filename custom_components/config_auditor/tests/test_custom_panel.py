"""Tests for custom_panel.py — v1.1.2.

Guards against:
  - Static path served from /{DOMAIN} conflicting with panel URL → 403 on refresh
  - cache_bust reading from haca-panel.hash (not hardcoded VERSION)
  - js_url using /{DOMAIN}_static/ not /{DOMAIN}/
  - Static path registration exception being swallowed safely
"""
from __future__ import annotations

import inspect
import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch, call

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# ══════════════════════════════════════════════════════════════════════════════
# Static path conflict regression
# ══════════════════════════════════════════════════════════════════════════════

class TestStaticPathNotConflictingWithPanelURL:
    """REGRESSION: Static files must NOT be served from /{DOMAIN}.

    If StaticPathConfig uses /{DOMAIN} as url_path AND the panel is registered
    at frontend_url_path=DOMAIN, aiohttp's static handler intercepts browser
    refresh of /config_auditor → 403 Forbidden.
    """

    def _read_source(self):
        import custom_components.config_auditor.custom_panel as cp
        return inspect.getsource(cp)

    def test_static_path_uses_domain_static_suffix(self):
        src = self._read_source()
        assert '/{DOMAIN}_static"' in src or "/{DOMAIN}_static'" in src, (
            "StaticPathConfig must use /{DOMAIN}_static, not /{DOMAIN} — "
            "otherwise browser refresh of /config_auditor returns 403 Forbidden"
        )

    def test_static_path_does_not_use_bare_domain(self):
        src = self._read_source()
        # The www_dir StaticPathConfig must NOT be /{DOMAIN}" (bare)
        # It should only appear in the _static variant
        import re
        # Find StaticPathConfig lines
        static_lines = [l for l in src.split("\n") if "StaticPathConfig" in l and "www_dir" in l]
        for line in static_lines:
            assert "_static" in line, (
                f"StaticPathConfig for www_dir must use _static suffix:\n  {line}"
            )

    def test_js_url_uses_domain_static(self):
        src = self._read_source()
        assert "_static/haca-panel.js" in src, (
            "js_url must reference /{DOMAIN}_static/haca-panel.js, not /{DOMAIN}/haca-panel.js"
        )

    def test_js_url_does_not_reference_bare_domain_path(self):
        src = self._read_source()
        import re
        # No js_url should be /{DOMAIN}/haca-panel.js (without _static)
        bad_pattern = re.search(r'js_url.*/{DOMAIN}/haca-panel\.js', src)
        assert bad_pattern is None, "js_url must use /{DOMAIN}_static/, not /{DOMAIN}/"


# ══════════════════════════════════════════════════════════════════════════════
# Cache-busting from hash file
# ══════════════════════════════════════════════════════════════════════════════

class TestCacheBustFromHashFile:
    """cache_bust must read from haca-panel.hash, not the static VERSION string."""

    def _read_source(self):
        import custom_components.config_auditor.custom_panel as cp
        return inspect.getsource(cp)

    def test_reads_haca_panel_hash_file(self):
        src = self._read_source()
        assert "haca-panel.hash" in src, (
            "custom_panel.py must read haca-panel.hash to generate cache_bust — "
            "otherwise VERSION stays static and browsers never reload updated JS"
        )

    def test_has_fallback_to_version(self):
        src = self._read_source()
        # Must have except/fallback in case hash file is missing
        assert "except" in src and "VERSION" in src, (
            "cache_bust must fall back to VERSION if haca-panel.hash is missing"
        )

    def test_hash_file_exists_in_www(self):
        hash_file = Path(__file__).parent.parent / "www" / "haca-panel.hash"
        assert hash_file.exists(), (
            "www/haca-panel.hash must exist — it's the cache-buster source for the panel JS URL"
        )

    def test_hash_file_contains_hex_string(self):
        hash_file = Path(__file__).parent.parent / "www" / "haca-panel.hash"
        content = hash_file.read_text(encoding="utf-8").strip()
        assert len(content) == 8 and all(c in "0123456789abcdef" for c in content), (
            f"haca-panel.hash should contain an 8-char hex string, got: {repr(content)}"
        )


# ══════════════════════════════════════════════════════════════════════════════
# Static path registration safety
# ══════════════════════════════════════════════════════════════════════════════

class TestStaticPathRegistrationSafety:
    """Duplicate route registration must not crash the integration."""

    def _read_source(self):
        import custom_components.config_auditor.custom_panel as cp
        return inspect.getsource(cp)

    def test_registration_wrapped_in_try_except(self):
        src = self._read_source()
        # The static path registration must be inside a try/except block
        lines = src.split("\n")
        reg_line = next(
            (i for i, l in enumerate(lines) if "async_register_static_paths" in l), None
        )
        assert reg_line is not None, "async_register_static_paths must be called"
        # There must be a try block before it and except after it
        context = "\n".join(lines[max(0, reg_line - 5): reg_line + 10])
        assert "try:" in context or "except" in context, (
            "async_register_static_paths must be wrapped in try/except to survive "
            "duplicate registration on HA reload"
        )

    def test_cache_headers_true(self):
        src = self._read_source()
        # www_dir StaticPathConfig must use cache_headers=True (not False)
        import re
        static_with_www = [l for l in src.split("\n") if "StaticPathConfig" in l and "www_dir" in l]
        for line in static_with_www:
            assert "cache_headers=False" not in line, (
                "www_dir StaticPathConfig must use cache_headers=True for correct HA serving"
            )

    def test_static_paths_key_used(self):
        src = self._read_source()
        assert "_STATIC_PATHS_KEY" in src, (
            "_STATIC_PATHS_KEY must be used to prevent duplicate aiohttp route registration"
        )


# ══════════════════════════════════════════════════════════════════════════════
# async_register_panel integration (mocked HA)
# ══════════════════════════════════════════════════════════════════════════════

class TestRegisterPanelIntegration:

    @pytest.mark.asyncio
    async def test_register_panel_does_not_raise(self, tmp_path):
        """async_register_panel must complete without raising even with mocked HA."""
        # Create minimal www structure
        www = tmp_path / "www"
        www.mkdir()
        (www / "haca-panel.js").write_text("// test")
        (www / "haca-panel.hash").write_text("abcd1234")

        hass = MagicMock()
        hass.data = {}
        hass.http = MagicMock()
        hass.http.async_register_static_paths = AsyncMock()

        with patch("custom_components.config_auditor.custom_panel.Path") as MockPath, \
             patch("custom_components.config_auditor.custom_panel.frontend") as mock_fe:
            # Make Path(__file__).parent resolve to tmp_path
            MockPath.return_value.parent = tmp_path
            MockPath.side_effect = lambda *args: Path(*args)

            # Should not raise
            from custom_components.config_auditor.custom_panel import async_register_panel
            try:
                await async_register_panel(hass)
            except Exception as e:
                # Only fail if it's an unexpected error (not mock-related)
                if "MagicMock" not in str(type(e).__name__):
                    raise
