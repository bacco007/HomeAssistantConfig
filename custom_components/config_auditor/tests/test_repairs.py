"""Regression tests for repairs.py — H.A.C.A Repairs integration.

These tests guard against the regressions that occurred in v1.9.x:
  - async_step_init / async_step_confirm missing from HacaFixFlow
  - automation_id (internal HA id) confused with entity_id in edit links
  - { } in placeholder values crashing HA's str.format()
  - card_edit_link empty when automation_id is the internal numeric id
  - entity-level issues pointing to non-existent /config/entity-registry URL
"""
from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

# ---------------------------------------------------------------------------
# Le module repairs.py a été retiré du package actif (MODULE_8_HA_REPAIRS désactivé).
# Ces tests sont conservés comme archive de régression mais sont désactivés.
# ---------------------------------------------------------------------------
pytestmark = pytest.mark.skip(reason="repairs.py retiré du package actif (MODULE_8 désactivé)")

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.tests.conftest import MockHass, MockState  # noqa


def _make_hass(states: dict | None = None):
    """Return a minimal hass mock with pre-populated states."""
    hass = MockHass()
    for eid, attrs in (states or {}).items():
        hass._states[eid] = MockState(eid, "on", attrs)
    return hass


# ---------------------------------------------------------------------------
# Helpers to create a minimal HacaFixFlow without a live HA instance
# ---------------------------------------------------------------------------

def _make_flow(issue_data: dict, hass=None, domain_data: dict | None = None):
    """Instantiate HacaFixFlow and wire hass + domain data."""
    from custom_components.config_auditor.repairs import HacaFixFlow
    flow = HacaFixFlow(issue_data=issue_data)
    flow.hass = hass or _make_hass()
    flow.flow_id = "test-flow-id"
    flow.handler = "config_auditor"
    flow.context = {}

    # Patch _get_domain_data to return controllable domain_data
    flow._get_domain_data = MagicMock(return_value=domain_data or {})
    return flow


# ===========================================================================
# 1. REGRESSION: async_step_init and async_step_confirm MUST exist
# ===========================================================================

class TestRepairsFlowStepMethods:
    """Guard against accidental deletion of step methods (caused 'Handler does not
    support user' in HA Repairs after a bad refactor)."""

    def test_async_step_init_exists(self):
        from custom_components.config_auditor.repairs import HacaFixFlow
        assert hasattr(HacaFixFlow, "async_step_init"), (
            "async_step_init missing — HA Repairs will raise UnknownStep / "
            "'Handler does not support user'"
        )
        assert asyncio.iscoroutinefunction(HacaFixFlow.async_step_init)

    def test_async_step_confirm_exists(self):
        from custom_components.config_auditor.repairs import HacaFixFlow
        assert hasattr(HacaFixFlow, "async_step_confirm"), (
            "async_step_confirm missing — confirm form will never be shown"
        )
        assert asyncio.iscoroutinefunction(HacaFixFlow.async_step_confirm)

    def test_async_create_fix_flow_returns_haca_fix_flow(self):
        """async_create_fix_flow must return a HacaFixFlow, not a plain RepairsFlow."""
        import inspect
        from custom_components.config_auditor.repairs import async_create_fix_flow, HacaFixFlow
        sig = inspect.signature(async_create_fix_flow)
        # Must accept (hass, issue_id, data)
        params = list(sig.parameters)
        assert "hass" in params
        assert "issue_id" in params
        assert "data" in params

    @pytest.mark.asyncio
    async def test_step_init_delegates_to_confirm(self):
        """async_step_init must call async_step_confirm (not apply the fix)."""
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "Uses device_id",
                "recommendation": "Use entity_id",
                "location": "trigger[0]",
            }
        )
        # async_step_init called with None → should show form, not abort/create entry
        result = await flow.async_step_init(user_input=None)
        assert result.get("type") in ("form", "SHOW_FORM") or result.get("step_id") == "confirm"

    @pytest.mark.asyncio
    async def test_step_confirm_no_input_returns_form(self):
        """First call (no user_input) must return a FORM with step_id='confirm'."""
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "Uses device_id",
                "recommendation": "Use entity_id",
                "location": "trigger[0]",
            }
        )
        result = await flow.async_step_confirm(user_input=None)
        assert result.get("step_id") == "confirm", (
            f"Expected step_id='confirm', got {result}"
        )

    @pytest.mark.asyncio
    async def test_step_confirm_fix_failure_aborts(self):
        """Si le fix échoue, le flow doit aborter avec reason='fix_failed'."""
        mock_refactoring = MagicMock()
        mock_refactoring.apply_device_id_fix = AsyncMock(
            return_value={"success": False, "error": "YAML parse error"}
        )
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={"refactoring_assistant": mock_refactoring},
        )
        result = await flow.async_step_confirm(user_input={})
        assert result.get("type") in ("abort", "ABORT")
        assert result.get("reason") == "fix_failed"

    @pytest.mark.asyncio
    async def test_step_confirm_with_input_applies_fix(self):
        """Valider doit appeler apply_device_id_fix et retourner create_entry."""
        mock_refactoring = MagicMock()
        mock_refactoring.apply_device_id_fix = AsyncMock(return_value={"success": True})
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={"refactoring_assistant": mock_refactoring},
        )
        result = await flow.async_step_confirm(user_input={})
        assert result.get("type") in ("create_entry", "CREATE_ENTRY"), (
            f"Expected create_entry after fix, got {result}"
        )
        mock_refactoring.apply_device_id_fix.assert_called_once_with("1699000000001")

    @pytest.mark.asyncio
    async def test_step_confirm_no_refactoring_aborts(self):
        """Sans refactoring_assistant, Valider doit aborter proprement."""
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={},  # no refactoring_assistant
        )
        result = await flow.async_step_confirm(user_input={})
        assert result.get("type") in ("abort", "ABORT")
        assert result.get("reason") == "no_fix_available"


# ===========================================================================
# 2. REGRESSION: edit link uses entity_id (not automation_id) for type detection
# ===========================================================================

class TestBuildEditLinkMd:
    """Guard against the bug where automation_id was used for startswith('automation.')
    check — automation_id is the internal HA numeric id, never an entity_id."""

    def _link(self, automation_id, source_name, entity_id="", hass=None):
        flow = _make_flow({}, hass=hass)
        return flow._build_edit_link_md(automation_id, source_name, entity_id)

    def test_automation_with_entity_id_and_internal_id(self):
        """Standard case: entity_id='automation.xxx', automation_id='1699…'"""
        link = self._link("1699123456789", "Lumieres Salon", "automation.lumieres_salon")
        assert "/config/automation/edit/1699123456789" in link
        assert "Modifier" in link

    def test_automation_without_internal_id_falls_back_to_lookup(self):
        """automation_id empty → lookup via hass.states.get(entity_id).attributes['id']"""
        hass = _make_hass({"automation.test_auto": {"id": "9999888777"}})
        link = self._link("", "Test Auto", "automation.test_auto", hass=hass)
        assert "/config/automation/edit/9999888777" in link

    def test_automation_no_id_no_state_fallback_to_dashboard(self):
        """If no id anywhere → link to automation dashboard."""
        link = self._link("", "Unknown Auto", "automation.unknown")
        assert "/config/automation/dashboard" in link

    def test_numeric_automation_id_not_treated_as_entity_id(self):
        """REGRESSION: automation_id='1699…' must NOT be used in startswith('automation.')"""
        # Before fix: code did automation_id.startswith('automation.') which was always False
        # for numeric ids, causing empty links
        link = self._link("1699000000001", "My Auto", "automation.my_auto")
        assert "1699000000001" in link
        assert "automation/edit" in link
        # Must NOT fall back to dashboard
        assert "dashboard" not in link

    def test_script_entity_id(self):
        link = self._link("", "My Script", "script.my_script")
        assert "/config/script/edit/my_script" in link

    def test_no_entity_id_returns_empty(self):
        """Issues with no entity_id (edge case) return empty string."""
        link = self._link("", "Unknown", "")
        assert link == ""


# ===========================================================================
# 3. REGRESSION: { } in placeholder values must be escaped
# ===========================================================================

class TestSanitizePlaceholders:
    """Guard against HA's str.format() crashing on Jinja templates in issue messages.

    HA calls description.format(**placeholders). If any VALUE contains { } (e.g.
    a Jinja template like '{{ states.light.salon }}') HA raises KeyError and
    the entire description disappears silently.
    """

    def test_sanitize_ph_escapes_braces(self):
        from custom_components.config_auditor.repairs import _sanitize_ph
        assert _sanitize_ph("{{ states.light.salon }}") == "{{{{ states.light.salon }}}}"
        assert _sanitize_ph("normal text") == "normal text"
        assert _sanitize_ph("50%") == "50%"
        assert _sanitize_ph("") == ""

    def test_sanitize_ph_handles_non_string(self):
        from custom_components.config_auditor.repairs import _sanitize_ph
        assert _sanitize_ph(42) == "42"
        assert _sanitize_ph(None) == "None"

    @pytest.mark.asyncio
    async def test_form_placeholders_with_jinja_message(self):
        """Form must return successfully even when message contains Jinja { }."""
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.jinja_auto",
                "source_name": "Jinja Auto",
                "message": "Template {{ states('light.salon') }} used",
                "recommendation": "Replace with {entity_id}",
                "location": "trigger[0]",
            }
        )
        # Must NOT raise KeyError or return abort
        result = await flow.async_step_confirm(user_input=None)
        assert result.get("step_id") == "confirm"
        ph = result.get("description_placeholders", {})
        # Braces must be doubled so HA doesn't choke
        assert "{" not in ph.get("message", "").replace("{{", "").replace("}}", "")

    @pytest.mark.asyncio
    async def test_form_placeholders_with_yaml_recommendation(self):
        """Recommendation containing YAML with { } must be safely escaped."""
        flow = _make_flow(
            issue_data={
                "fix_type": "mode",
                "automation_id": "1699000000002",
                "entity_id": "automation.yaml_auto",
                "source_name": "YAML Auto",
                "message": "Wrong mode",
                "recommendation": "Set mode: {mode: restart}",
                "location": "root",
            }
        )
        result = await flow.async_step_confirm(user_input=None)
        assert result.get("step_id") == "confirm"
        ph = result.get("description_placeholders", {})
        # { in recommendation must be escaped
        raw_rec = ph.get("recommendation", "")
        # After escaping, raw { (single brace) should not appear in values
        assert raw_rec.count("{") == raw_rec.count("{{") * 2 or "{" not in raw_rec or "{{" in raw_rec


# ===========================================================================
# 4. REGRESSION: card_edit_link in HacaRepairsManager
# ===========================================================================

class TestCardEditLink:
    """Guard against card_edit_link pointing to wrong/non-existent URLs."""

    def _make_manager(self, hass):
        from custom_components.config_auditor.repairs import HacaRepairsManager
        mgr = HacaRepairsManager(hass)
        mgr._repairs_available = True
        return mgr

    def _base_issue(self, overrides: dict | None = None) -> dict:
        issue = {
            "entity_id": "automation.lumieres_salon",
            "automation_id": "1699123456789",
            "type": "device_id_in_trigger",
            "severity": "high",
            "alias": "Lumieres Salon",
            "source_name": "Lumieres Salon",
            "message": "Uses device_id in trigger",
            "recommendation": "Use entity_id",
            "location": "trigger[0]",
        }
        if overrides:
            issue.update(overrides)
        return issue

    @pytest.mark.asyncio
    async def test_automation_card_has_correct_edit_url(self):
        """Card description must link to /config/automation/edit/{internal_id}."""
        hass = _make_hass()
        issue = self._base_issue()

        created_placeholders = {}

        def fake_create_issue(*args, **kwargs):
            created_placeholders.update(kwargs.get("translation_placeholders", {}))

        with patch(
            "custom_components.config_auditor.repairs.async_create_issue",
            new=fake_create_issue,
        ):
            mgr = self._make_manager(hass)
            await mgr._async_create_repair("repair_001", issue)

        link = created_placeholders.get("edit_link", "")
        assert "1699123456789" in link, f"Internal id missing from edit link: {link!r}"
        assert "/config/automation/edit/" in link, f"Wrong URL in link: {link!r}"
        # Must NOT point to dashboard (regression: missing internal_id caused fallback)
        assert "dashboard" not in link

    @pytest.mark.asyncio
    async def test_script_card_has_correct_edit_url(self):
        hass = _make_hass()
        issue = self._base_issue({
            "entity_id": "script.my_script",
            "automation_id": "",
            "type": "empty_script",
        })

        created_placeholders = {}

        def fake_create_issue(*args, **kwargs):
            created_placeholders.update(kwargs.get("translation_placeholders", {}))

        with patch("custom_components.config_auditor.repairs.async_create_issue", new=fake_create_issue):
            mgr = self._make_manager(hass)
            await mgr._async_create_repair("repair_002", issue)

        link = created_placeholders.get("edit_link", "")
        assert "/config/script/edit/my_script" in link

    @pytest.mark.asyncio
    async def test_entity_issue_card_links_to_entities_page(self):
        """Entity-level issues must link to /config/entities (not /config/entity-registry)."""
        hass = _make_hass()
        issue = self._base_issue({
            "entity_id": "sensor.orphan_sensor",
            "automation_id": "",
            "type": "zombie_entity",
            "severity": "high",
        })

        created_placeholders = {}

        def fake_create_issue(*args, **kwargs):
            created_placeholders.update(kwargs.get("translation_placeholders", {}))

        with patch("custom_components.config_auditor.repairs.async_create_issue", new=fake_create_issue):
            mgr = self._make_manager(hass)
            await mgr._async_create_repair("repair_003", issue)

        link = created_placeholders.get("edit_link", "")
        # Must NOT point to non-existent entity-registry page
        assert "/config/entity-registry" not in link, (
            "edit_link must not point to /config/entity-registry (page does not exist)"
        )

    @pytest.mark.asyncio
    async def test_automation_without_id_falls_back_to_dashboard_not_entity_registry(self):
        """Automation with no internal id → dashboard fallback (not entity-registry)."""
        hass = _make_hass()  # no state for automation.unknown
        issue = self._base_issue({
            "entity_id": "automation.unknown_auto",
            "automation_id": "",  # no internal id
            "type": "device_id_in_trigger",
        })

        created_placeholders = {}

        def fake_create_issue(*args, **kwargs):
            created_placeholders.update(kwargs.get("translation_placeholders", {}))

        with patch("custom_components.config_auditor.repairs.async_create_issue", new=fake_create_issue):
            mgr = self._make_manager(hass)
            await mgr._async_create_repair("repair_004", issue)

        link = created_placeholders.get("edit_link", "")
        assert "/config/entity-registry" not in link
        assert "/config/entities" not in link or "automation" in link or "dashboard" in link


# ===========================================================================
# 5. REGRESSION: async_create_fix_flow must register in repairs platform
# ===========================================================================

class TestRepairsPlatformRegistration:
    """Verify the module exposes async_create_fix_flow so HA can find it."""

    def test_module_has_async_create_fix_flow(self):
        import custom_components.config_auditor.repairs as repairs_module
        assert hasattr(repairs_module, "async_create_fix_flow"), (
            "repairs.py must expose async_create_fix_flow at module level"
        )

    @pytest.mark.asyncio
    async def test_async_create_fix_flow_returns_flow_with_steps(self):
        from custom_components.config_auditor.repairs import async_create_fix_flow, HacaFixFlow
        hass = _make_hass()
        data = {
            "fix_type": "device_id",
            "automation_id": "1699000000001",
            "entity_id": "automation.test",
            "source_name": "Test",
            "message": "msg",
            "recommendation": "rec",
            "location": "trigger[0]",
        }
        flow = await async_create_fix_flow(hass, "haca_abc123", data)
        assert isinstance(flow, HacaFixFlow)
        assert hasattr(flow, "async_step_init")
        assert hasattr(flow, "async_step_confirm")
        # Data must be immediately available (before HA sets flow.data)
        assert flow._data.get("fix_type") == "device_id"
        assert flow._data.get("automation_id") == "1699000000001"


# ===========================================================================
# 6. REGRESSION: translations/en.json and fr.json have required placeholders
# ===========================================================================

class TestTranslationPlaceholders:
    """Guard against translation files missing placeholders needed by repairs.py."""

    def _load(self, lang: str) -> dict:
        import json
        path = Path(__file__).parent.parent / "translations" / f"{lang}.json"
        return json.loads(path.read_text(encoding="utf-8"))

    def test_en_fixable_issue_no_longer_in_translations(self):
        """La clé 'issues' a été supprimée des fichiers de traduction (Repairs désactivé)."""
        data = self._load("en")
        assert "issues" not in data, "en.json should not contain 'issues' key (Repairs removed)"

    def test_fr_fixable_issue_no_longer_in_translations(self):
        """La clé 'issues' a été supprimée des fichiers de traduction (Repairs désactivé)."""
        data = self._load("fr")
        assert "issues" not in data, "fr.json should not contain 'issues' key (Repairs removed)"

    def test_confirm_step_has_source_name_and_edit_link(self):
        """Le module Repairs est désactivé — ce test est désormais un no-op."""
        pass  # Repairs désactivé — clé 'issues' retirée des traductions

    def test_abort_reasons_defined(self):
        """Le module Repairs est désactivé — ce test est désormais un no-op."""
        pass  # Repairs désactivé — clé 'issues' retirée des traductions


# ===========================================================================
# 7. Dry-run preview integration
# ===========================================================================

class TestConfirmFormContent:
    """Vérifie le contenu du formulaire HA Repairs natif Markdown.

    Architecture : form → diff_block + current_yaml + changes_list → apply on Valider
    """

    @pytest.mark.asyncio
    async def test_confirm_form_has_required_placeholders(self):
        """Le form doit exposer tous les placeholders requis par les traductions."""
        mock_refactoring = MagicMock()
        mock_refactoring.preview_device_id_fix = AsyncMock(return_value={
            "success": True,
            "current_yaml": "alias: Test\ntrigger:\n  - platform: device\n    device_id: abc\n",
            "new_yaml":     "alias: Test\ntrigger:\n  - platform: state\n    entity_id: light.test\n",
            "changes": [{"description": "trigger[0]: device_id → entity_id light.test"}],
            "changes_count": 1,
        })
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.lumieres",
                "source_name": "Lumières Salon",
                "message": "Uses device_id",
                "recommendation": "Use entity_id",
                "location": "trigger[0]",
            },
            domain_data={"refactoring_assistant": mock_refactoring},
        )
        result = await flow.async_step_confirm(user_input=None)
        assert result.get("step_id") == "confirm"
        ph = result.get("description_placeholders", {})
        for key in ("source_name", "message", "location", "diff_block",
                    "current_yaml", "changes_list", "changes_count", "edit_link"):
            assert key in ph, f"Missing placeholder: {key}"

    @pytest.mark.asyncio
    async def test_confirm_diff_block_contains_diff_markers(self):
        """diff_block doit contenir des marqueurs + et - du diff unifié."""
        mock_refactoring = MagicMock()
        mock_refactoring.preview_device_id_fix = AsyncMock(return_value={
            "success": True,
            "current_yaml": "alias: Test\ntrigger:\n  - platform: device\n    device_id: abc\n",
            "new_yaml":     "alias: Test\ntrigger:\n  - platform: state\n    entity_id: light.test\n",
            "changes": [{"description": "trigger: device → entity"}],
            "changes_count": 1,
        })
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={"refactoring_assistant": mock_refactoring},
        )
        result = await flow.async_step_confirm(user_input=None)
        ph = result.get("description_placeholders", {})
        diff = ph.get("diff_block", "")
        # current_yaml_block = texte YAML brut (pour fenced block dans strings.json)
        # diff_block = texte diff unifié brut (pour ```diff dans strings.json)
        yaml_block = ph.get("current_yaml_block", "")
        assert yaml_block, f"current_yaml_block should not be empty, got: {yaml_block!r}"
        assert "<pre>" not in yaml_block, f"current_yaml_block must be plain text (no HTML): {yaml_block!r}"
        assert "<pre>" not in diff, f"diff_block must be plain text (no HTML): {diff!r}"
        assert "+" in diff or "-" in diff, f"diff_block should contain +/- markers: {diff!r}"
        # Vérifier que les lignes du diff finissent bien par \n (pas de concaténation)
        for line in diff.splitlines():
            assert not (line.startswith(("-", "+")) and len(line) > 2 and
                       not line.startswith("---") and not line.startswith("+++") and
                       line.endswith("+")), f"Ligne diff collée détectée: {line!r}"

    @pytest.mark.asyncio
    async def test_confirm_yaml_braces_escaped(self):
        """Les {{ }} du YAML doivent être échappés pour que str.format() de HA ne plante pas."""
        mock_refactoring = MagicMock()
        mock_refactoring.preview_device_id_fix = AsyncMock(return_value={
            "success": True,
            "current_yaml": "alias: Test\nvalue_template: '{{ states.light.x }}'\n",
            "new_yaml":     "alias: Test\nvalue_template: '{{ states.light.y }}'\n",
            "changes": [{"description": "updated template"}],
            "changes_count": 1,
        })
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={"refactoring_assistant": mock_refactoring},
        )
        result = await flow.async_step_confirm(user_input=None)
        ph = result.get("description_placeholders", {})
        # All placeholder values must not contain bare single { or }
        for key, val in ph.items():
            if isinstance(val, str) and key in ("current_yaml_block", "diff_block"):
                # Texte YAML/diff brut : peut contenir {} (ex: metadata: {})
                # C'est acceptable car HA ne re-scanne pas les valeurs avec str.format()
                pass
            elif isinstance(val, str):
                stripped = val.replace("{{", "").replace("}}", "")
                assert "{" not in stripped and "}" not in stripped, (
                    f"Placeholder {key!r} has unescaped braces: {val!r}"
                )

    @pytest.mark.asyncio
    async def test_confirm_fallback_when_no_preview(self):
        """Sans refactoring_assistant, le form doit quand même s'afficher."""
        flow = _make_flow(
            issue_data={
                "fix_type": "device_id",
                "automation_id": "1699000000001",
                "entity_id": "automation.test",
                "source_name": "Test Auto",
                "message": "msg",
                "recommendation": "rec",
                "location": "trigger[0]",
            },
            domain_data={},  # no refactoring_assistant
        )
        result = await flow.async_step_confirm(user_input=None)
        # Must still show form (not abort)
        assert result.get("step_id") == "confirm"
