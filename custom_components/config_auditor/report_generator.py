"""H.A.C.A — Report Generator — Module 4."""
from __future__ import annotations

from datetime import datetime
import json
import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import REPORTS_DIR

_LOGGER = logging.getLogger(__name__)

import json as _json
from pathlib import Path as _Path

def _load_translations_from_json(language: str) -> dict:
    """Load report translations from JSON files. Falls back to English."""
    base = _Path(__file__).parent / "translations"
    path = base / f"{language}.json"
    if not path.exists():
        _LOGGER.warning("HACA translations: %s not found, falling back to en.json", path)
        path = base / "en.json"
    try:
        data = _json.loads(path.read_text(encoding="utf-8")).get("report", {})
        _LOGGER.info(
            "HACA v1.1.2 translations: path=%s keys=%d script_section=%s",
            path, len(data), data.get("script_issues_section", "MISSING"),
        )
        return data
    except Exception as exc:
        _LOGGER.error("HACA translations load error: %s", exc)
        return {}


class ReportGenerator:
    """Generate comprehensive reports from audit data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize report generator."""
        self.hass = hass
        self._reports_dir = Path(hass.config.config_dir) / REPORTS_DIR
        self._reports_dir.mkdir(exist_ok=True)
        self._translations: dict = {}

    def _load_translations(self, language: str) -> dict:
        """Load translations from JSON for the specified language."""
        return _load_translations_from_json(language)

    def _t(self, key: str) -> str:
        """Get translation for key."""
        return self._translations.get(key, key)

    async def generate_all_reports(
        self,
        summary: dict[str, Any],
        automation_issues: list[dict],
        entity_issues: list[dict],
        language: str = "en",
        *,
        script_issues: list[dict] | None = None,
        scene_issues: list[dict] | None = None,
        blueprint_issues: list[dict] | None = None,
        performance_issues: list[dict] | None = None,
        security_issues: list[dict] | None = None,
        dashboard_issues: list[dict] | None = None,
    ) -> dict[str, str]:
        """Generate all report formats with the same timestamp."""
        # Load translations
        self._translations = self._load_translations(language)

        # Normalize optional lists once
        _extra = dict(
            script_issues=list(script_issues or []),
            scene_issues=list(scene_issues or []),
            blueprint_issues=list(blueprint_issues or []),
            performance_issues=list(performance_issues or []),
            security_issues=list(security_issues or []),
            dashboard_issues=list(dashboard_issues or []),
        )

        # Generate a single timestamp for all reports
        timestamp = datetime.now()
        timestamp_str = timestamp.strftime("%Y%m%d_%H%M%S")

        # Generate all reports with the same timestamp
        md_path = await self._generate_markdown_with_timestamp(
            summary, automation_issues, entity_issues, timestamp, timestamp_str, **_extra
        )
        json_path = await self._generate_json_with_timestamp(
            summary, automation_issues, entity_issues, timestamp, timestamp_str, **_extra
        )
        pdf_path = await self._generate_pdf_with_timestamp(
            summary, automation_issues, entity_issues, timestamp, timestamp_str, **_extra
        )

        return {
            "markdown": md_path,
            "json": json_path,
            "pdf": pdf_path,
            "timestamp": timestamp_str
        }

    async def _generate_markdown_with_timestamp(
        self,
        summary: dict[str, Any],
        automation_issues: list[dict],
        entity_issues: list[dict],
        timestamp: datetime,
        timestamp_str: str,
        *,
        script_issues: list[dict] | None = None,
        scene_issues: list[dict] | None = None,
        blueprint_issues: list[dict] | None = None,
        performance_issues: list[dict] | None = None,
        security_issues: list[dict] | None = None,
        dashboard_issues: list[dict] | None = None,
    ) -> str:
        """Generate Markdown report with provided timestamp."""
        
        health_score = summary.get("health_score", 0)
        timestamp_display = timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
        report = f"""# 📊 {self._t("title")}

**{self._t("generated")}:** {timestamp_display}  
**{self._t("health_score")}:** {health_score}% {self._get_status_emoji(health_score)}

---

## 📈 {self._t("executive_summary")}

| {self._t("metric")} | {self._t("value")} |
|--------|-------|
| {self._t("health_score")} | {health_score}% |
| {self._t("automation_issues")} | {summary.get('automation_issues', 0)} |
| {self._t("entity_issues")} | {summary.get('entity_issues', 0)} |
| {self._t("total_issues")} | {summary.get('total_issues', 0)} |
| {self._t("script_issues")} | {summary.get('script_issues', 0)} |
| {self._t("scene_issues")} | {summary.get('scene_issues', 0)} |
| {self._t("performance_issues")} | {summary.get('performance_issues', 0)} |
| {self._t("security_issues")} | {summary.get('security_issues', 0)} |

### {self._t("overall_status")}
{self._get_status_text(health_score)}

---

## 🤖 {self._t("automation_issues")} ({len(automation_issues)})

"""
        
        if automation_issues:
            # Group by severity
            high = [i for i in automation_issues if i.get('severity') == 'high']
            medium = [i for i in automation_issues if i.get('severity') == 'medium']
            low = [i for i in automation_issues if i.get('severity') == 'low']
            
            if high:
                report += f"### 🔴 {self._t('high_severity')} ({len(high)})\n\n"
                for issue in high[:10]:
                    report += self._format_issue(issue)
            
            if medium:
                report += f"\n### 🟠 {self._t('medium_severity')} ({len(medium)})\n\n"
                for issue in medium[:10]:
                    report += self._format_issue(issue)
            
            if low:
                report += f"\n### 🟡 {self._t('low_severity')} ({len(low)})\n\n"
                report += f"*{len(low)} {self._t('low_severity_issues_found')}*\n\n"
        else:
            report += f"✅ **{self._t('no_automation_issues')}**\n\n"
        
        report += "---\n\n"
        
        # Entity issues
        report += f"## 📍 {self._t('entity_issues')} ({len(entity_issues)})\n\n"
        
        if entity_issues:
            zombies = [i for i in entity_issues if i.get('type') == 'zombie_entity']
            unavailable = [i for i in entity_issues if i.get('type') == 'unavailable']
            
            if zombies:
                report += f"### 👻 {self._t('zombie_entities')} ({len(zombies)})\n\n"
                for issue in zombies[:5]:
                    report += f"- **{issue.get('entity_id')}**: {issue.get('message')}\n"
                report += "\n"
            
            if unavailable:
                report += f"### ❌ {self._t('unavailable')} ({len(unavailable)})\n\n"
                for issue in unavailable[:5]:
                    report += f"- {issue.get('entity_id')}\n"
                report += "\n"
                
            ghosts = [i for i in entity_issues if i.get('type') == 'ghost_registry_entry']
            if ghosts:
                report += f"### 👻 {self._t('ghost_entities')} ({len(ghosts)})\n\n"
                for issue in ghosts[:5]:
                    report += f"- **{issue.get('entity_id')}**: {issue.get('message')}\n"
                report += "\n"
                
            broken_devices = [i for i in entity_issues if i.get('type') == 'broken_device_reference']
            if broken_devices:
                report += f"### 📱 {self._t('broken_device_references')} ({len(broken_devices)})\n\n"
                for issue in broken_devices[:5]:
                    report += f"- **{issue.get('entity_id')}**: {self._t('references_nonexistent_device')} {issue.get('device_id')}\n"
                report += "\n"
        else:
            report += f"✅ **{self._t('no_entity_issues')}**\n\n"
        
        report += "---\n\n"
        
        # Recommendations
        report += f"## 💡 {self._t('recommendations')}\n\n"
        report += self._generate_recommendations(health_score, automation_issues, entity_issues)
        
        report += f"\n\n---\n\n*{self._t('report_generated_by')} v1.1.2 - {timestamp_display}*\n"
        
        # Save report with provided timestamp
        filename = f"report_{timestamp_str}.md"
        filepath = self._reports_dir / filename
        
        def write_report():
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(report)
        
        await self.hass.async_add_executor_job(write_report)
        
        _LOGGER.info("Generated Markdown report: %s", filepath)
        return str(filepath)

    async def _generate_json_with_timestamp(
        self,
        summary: dict[str, Any],
        automation_issues: list[dict],
        entity_issues: list[dict],
        timestamp: datetime,
        timestamp_str: str,
        *,
        script_issues: list[dict] | None = None,
        scene_issues: list[dict] | None = None,
        blueprint_issues: list[dict] | None = None,
        performance_issues: list[dict] | None = None,
        security_issues: list[dict] | None = None,
        dashboard_issues: list[dict] | None = None,
    ) -> str:
        """Generate JSON report with provided timestamp."""
        script_issues      = list(script_issues or [])
        scene_issues       = list(scene_issues or [])
        blueprint_issues   = list(blueprint_issues or [])
        performance_issues = list(performance_issues or [])
        security_issues    = list(security_issues or [])
        dashboard_issues   = list(dashboard_issues or [])

        all_issues = (
            automation_issues + entity_issues + script_issues + scene_issues
            + blueprint_issues + performance_issues + security_issues + dashboard_issues
        )

        report_data = {
            "timestamp": timestamp.isoformat(),
            "version": "1.1.2",
            "language": self._translations.get("title", "H.A.C.A Configuration Report"),
            "summary": summary,
            "issues": {
                "automation":  automation_issues,
                "entity":      entity_issues,
                "script":      script_issues,
                "scene":       scene_issues,
                "blueprint":   blueprint_issues,
                "performance": performance_issues,
                "security":    security_issues,
                "dashboard":   dashboard_issues,
            },
            "statistics": {
                "by_severity": self._count_by_severity(all_issues),
                "by_type":     self._count_by_type(all_issues),
            }
        }
        
        filename = f"report_{timestamp_str}.json"
        filepath = self._reports_dir / filename
        
        def write_json():
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2, default=str)
        
        await self.hass.async_add_executor_job(write_json)
        
        _LOGGER.info("Generated JSON report: %s", filepath)
        return str(filepath)

    async def _generate_pdf_with_timestamp(
        self,
        summary: dict[str, Any],
        automation_issues: list[dict],
        entity_issues: list[dict],
        timestamp: datetime,
        timestamp_str: str,
        *,
        script_issues: list[dict] | None = None,
        scene_issues: list[dict] | None = None,
        blueprint_issues: list[dict] | None = None,
        performance_issues: list[dict] | None = None,
        security_issues: list[dict] | None = None,
        dashboard_issues: list[dict] | None = None,
    ) -> str:
        """Generate PDF report with provided timestamp."""
        script_issues      = list(script_issues or [])
        scene_issues       = list(scene_issues or [])
        blueprint_issues   = list(blueprint_issues or [])
        performance_issues = list(performance_issues or [])
        security_issues    = list(security_issues or [])
        dashboard_issues   = list(dashboard_issues or [])

        try:
            from fpdf import FPDF
        except ImportError:
            _LOGGER.error("fpdf2 not installed. Cannot generate PDF report.")
            return ""

        t = self._t  # Shortcut
        timestamp_display = timestamp.strftime("%Y-%m-%d %H:%M:%S")
        health_score = summary.get("health_score", 0)

        # ── Font strategy ────────────────────────────────────────────────────────
        # Priority order for each font family:
        #
        # DejaVuSans (Latin + Latin-Extended + Cyrillic):
        #   1. matplotlib bundled fonts  → always present in HA
        #   2. Integration bundled fonts → fonts/ subdirectory
        #   3. System fonts              → /usr/share/fonts/truetype/dejavu/
        #
        # NotoSansCJK (CJK Unified + Hiragana + Katakana):
        #   1. System TTC                → /usr/share/fonts/opentype/noto/ (Debian HA)
        #   2. Integration bundled TTF   → fonts/ (subsetted, TTF/glyf format)
        #
        # For CJK languages (zh-Hans, ja) NotoSansCJK is used as the PRIMARY font
        # because fpdf2 computes line-break widths from the primary font metrics.
        # Using a Latin font as primary for CJK text produces blank/invisible output.
        # ─────────────────────────────────────────────────────────────────────────
        _integration_fonts = Path(__file__).parent / "fonts"

        def _find_dejavu() -> tuple[Path, Path, Path] | None:
            """Return (regular, bold, italic) DejaVu TTF paths, or None."""
            candidates = []
            # 1. matplotlib (always in HA)
            try:
                import matplotlib as _mpl
                _mpl_fonts = Path(_mpl.__file__).parent / "mpl-data" / "fonts" / "ttf"
                candidates.append(_mpl_fonts)
            except ImportError:
                pass
            # 2. Integration bundled
            candidates.append(_integration_fonts)
            # 3. System
            candidates += [
                Path("/usr/share/fonts/truetype/dejavu"),
                Path("/usr/share/fonts/dejavu"),
            ]
            for d in candidates:
                r = d / "DejaVuSans.ttf"
                b = d / "DejaVuSans-Bold.ttf"
                i = d / ("DejaVuSans-Oblique.ttf" if (d / "DejaVuSans-Oblique.ttf").exists()
                         else "DejaVuSans-BoldOblique.ttf")
                if r.exists() and b.exists():
                    return r, b, (i if i.exists() else r)
            return None

        def _find_noto_cjk() -> tuple[Path, Path] | None:
            """Return (regular, bold) NotoSansCJK font paths (TTF), or None."""
            # 1. Integration bundled TTF (proper glyf outlines, browser-compatible)
            r = _integration_fonts / "NotoSansCJK-SC-Regular.ttf"
            b = _integration_fonts / "NotoSansCJK-SC-Bold.ttf"
            if r.exists():
                return r, (b if b.exists() else r)
            # 2. System TTC (Debian / HA Docker) – fallback if bundled OTF is absent
            system_ttc = [
                Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"),
                Path("/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc"),
                Path("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"),
            ]
            for r in system_ttc:
                b = r.parent / r.name.replace("Regular", "Bold")
                if r.exists():
                    return r, (b if b.exists() else r)
            return None

        _dejavu_paths = _find_dejavu()
        _noto_paths   = _find_noto_cjk()

        # Detect CJK language from the "title" translation key
        _lang_title = self._translations.get("title", "")
        _is_cjk = any(0x2E80 <= ord(c) <= 0x9FFF or 0x3040 <= ord(c) <= 0x30FF
                      for c in _lang_title)

        # Choose primary / fallback based on script
        if _is_cjk and _noto_paths:
            _primary_font, _fallback_font = "NotoSC", ("DejaVu" if _dejavu_paths else None)
        elif _dejavu_paths:
            _primary_font, _fallback_font = "DejaVu", ("NotoSC" if _noto_paths else None)
        else:
            _primary_font, _fallback_font = "helvetica", None  # last-resort

        class HACA_PDF(FPDF):
            def __init__(self, translations, primary, fallback,
                         dejavu_paths, noto_paths):
                super().__init__()
                self._translations = translations
                self._font = primary
                if dejavu_paths:
                    self.add_font("DejaVu", "",  str(dejavu_paths[0]))
                    self.add_font("DejaVu", "B", str(dejavu_paths[1]))
                    self.add_font("DejaVu", "I", str(dejavu_paths[2]))
                if noto_paths:
                    self.add_font("NotoSC", "",  str(noto_paths[0]))
                    self.add_font("NotoSC", "B", str(noto_paths[1]))
                    self.add_font("NotoSC", "I", str(noto_paths[0]))  # no italic variant
                if fallback:
                    self.set_fallback_fonts([fallback])

            def _t(self, key):
                return self._translations.get(key, key)

            def header(self):
                self.set_font(self._font, "B", 15)
                self.cell(0, 10, self._t("title"), border=True,
                          new_x="LMARGIN", new_y="NEXT", align="C")
                self.ln(5)

            def footer(self):
                self.set_y(-15)
                self.set_font(self._font, "I", 8)
                self.cell(0, 10, f"{self._t('page')} {self.page_no()}/{{nb}}", align="C")

        pdf = HACA_PDF(self._translations, _primary_font, _fallback_font,
                       _dejavu_paths, _noto_paths)
        _pdf_font = pdf._font
        pdf.add_page()
        pdf.set_font(_pdf_font, "", 12)

        # Executive Summary
        pdf.set_font(_pdf_font, "B", 14)
        pdf.cell(0, 10, t("executive_summary"), ln=1)
        pdf.set_font(_pdf_font, "", 12)
        pdf.cell(0, 8, f"{t('generated')}: {timestamp_display}", ln=1)
        pdf.cell(0, 8, f"{t('health_score')}: {health_score}%", ln=1)
        pdf.ln(5)

        # Issues counts
        pdf.cell(0, 8, f"{t('automation_issues')}: {summary.get('automation_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('entity_issues')}: {summary.get('entity_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('script_issues')}: {summary.get('script_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('scene_issues')}: {summary.get('scene_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('blueprint_issues')}: {summary.get('blueprint_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('performance_issues')}: {summary.get('performance_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('security_issues')}: {summary.get('security_issues', 0)}", ln=1)
        pdf.cell(0, 8, f"{t('dashboard_issues')}: {summary.get('dashboard_issues', 0)}", ln=1)
        pdf.ln(5)
        
        # Status
        pdf.set_font(_pdf_font, "B", 12)
        pdf.cell(0, 8, t("overall_status"), ln=1)
        pdf.set_font(_pdf_font, "", 10)
        pdf.multi_cell(0, 6, self._get_status_text_pdf(health_score))
        pdf.ln(10)

        # Automations
        pdf.set_font(_pdf_font, "B", 14)
        pdf.cell(0, 10, f"{t('automation_issues')} ({len(automation_issues)})", ln=1)
        pdf.set_font(_pdf_font, "", 10)
        
        if automation_issues:
            for issue in automation_issues[:20]:  # Limit to 20 for PDF
                severity = issue.get('severity', 'low').upper()
                entity = issue.get('entity_id', issue.get('alias', 'N/A'))
                msg = issue.get('message', '')
                pdf.set_font(_pdf_font, "B", 10)
                pdf.cell(0, 6, f"[{severity}] {entity}", ln=1)
                pdf.set_font(_pdf_font, "", 10)
                pdf.multi_cell(0, 5, msg)
                pdf.ln(2)
        else:
            pdf.cell(0, 8, f"[OK] {t('no_automation_issues')}", ln=1)

        # Entities
        pdf.add_page()
        pdf.set_font(_pdf_font, "B", 14)
        pdf.cell(0, 10, f"{t('entity_issues')} ({len(entity_issues)})", ln=1)
        pdf.set_font(_pdf_font, "", 10)
        
        if entity_issues:
            for issue in entity_issues[:30]:
                pdf.cell(0, 7, f"- {issue.get('entity_id')}: {issue.get('message')}", ln=1)
                pdf.ln(1)
        else:
            pdf.cell(0, 8, f"[OK] {t('no_entity_issues')}", ln=1)
        
        # ── Extra issue sections (6.2) ─────────────────────────────────
        def _pdf_section(issues, section_key, no_issues_key, max_items=20):
            if not issues:
                return
            pdf.add_page()
            pdf.set_font(_pdf_font, "B", 14)
            pdf.cell(0, 10, f"{t(section_key)} ({len(issues)})", ln=1)
            pdf.set_font(_pdf_font, "", 10)
            for iss in issues[:max_items]:
                sev = iss.get("severity", "low").upper()
                ent = iss.get("entity_id", iss.get("alias", "N/A"))
                msg = iss.get("message", "")
                pdf.set_font(_pdf_font, "B", 10)
                pdf.cell(0, 6, f"[{sev}] {ent}", ln=1)
                pdf.set_font(_pdf_font, "", 10)
                pdf.multi_cell(0, 5, msg)
                pdf.ln(2)

        _pdf_section(script_issues,      "script_issues_section",      "no_script_issues")
        _pdf_section(scene_issues,       "scene_issues_section",       "no_scene_issues")
        _pdf_section(blueprint_issues,   "blueprint_issues_section",   "no_blueprint_issues")
        _pdf_section(performance_issues, "performance_issues_section", "no_performance_issues")
        _pdf_section(security_issues,    "security_issues_section",    "no_security_issues")
        _pdf_section(dashboard_issues,   "dashboard_issues_section",   "no_dashboard_issues")

        # Recommendations
        pdf.ln(10)
        pdf.set_font(_pdf_font, "B", 14)
        pdf.cell(0, 10, f">> {t('recommendations')}", ln=1)
        pdf.set_font(_pdf_font, "", 10)
        pdf.multi_cell(0, 6, self._generate_recommendations_pdf(health_score, automation_issues, entity_issues))
        
        # Footer
        pdf.ln(10)
        pdf.set_font(_pdf_font, "I", 9)
        pdf.cell(0, 8, f"{t('report_generated_by')} v1.1.2 - {timestamp_display}", ln=1)

        filename = f"report_{timestamp_str}.pdf"
        filepath = self._reports_dir / filename
        
        def save_pdf():
            pdf.output(str(filepath))
            
        await self.hass.async_add_executor_job(save_pdf)
        _LOGGER.info("Generated PDF report: %s", filepath)
        return str(filepath)

    async def get_report_content(self, filename: str) -> dict[str, Any] | None:
        """Get the content of a report file."""
        filepath = self._reports_dir / filename
        if not filepath.exists() or not filepath.is_file():
            return None
            
        def read_file():
            if filepath.suffix == '.json':
                with open(filepath, "r", encoding="utf-8") as f:
                    return {"content": json.load(f), "type": "json"}
            elif filepath.suffix == '.md':
                with open(filepath, "r", encoding="utf-8") as f:
                    return {"content": f.read(), "type": "markdown"}
            elif filepath.suffix == '.pdf':
                return {"content": "PDF content is binary", "type": "pdf"}
            return None

        return await self.hass.async_add_executor_job(read_file)

    def _format_issue(self, issue: dict) -> str:
        """Format issue for markdown."""
        entity_id = issue.get('entity_id', issue.get('alias', 'N/A'))
        message = issue.get('message', '')
        recommendation = issue.get('recommendation', '')
        
        output = f"#### {entity_id}\n\n"
        output += f"**{self._t('issue')}:** {message}\n\n"
        if recommendation:
            output += f"**{self._t('fix')}:** {recommendation}\n\n"
        return output

    def _get_status_emoji(self, score: int) -> str:
        """Get status emoji."""
        if score >= 90:
            return "✅"
        elif score >= 75:
            return "👍"
        elif score >= 60:
            return "⚠️"
        else:
            return "❌"

    def _get_status_text(self, score: int) -> str:
        """Get status explanation."""
        if score >= 90:
            return f"✅ **{self._t('status_excellent')}**"
        elif score >= 75:
            return f"👍 **{self._t('status_good')}**"
        elif score >= 60:
            return f"⚠️ **{self._t('status_fair')}**"
        else:
            return f"❌ **{self._t('status_poor')}**"

    def _get_status_text_pdf(self, score: int) -> str:
        """Get status explanation for PDF (no emojis)."""
        if score >= 90:
            return f"[EXCELLENT] {self._t('status_excellent')}"
        elif score >= 75:
            return f"[GOOD] {self._t('status_good')}"
        elif score >= 60:
            return f"[FAIR] {self._t('status_fair')}"
        else:
            return f"[POOR] {self._t('status_poor')}"

    def _generate_recommendations(
        self,
        score: int,
        auto_issues: list,
        entity_issues: list
    ) -> str:
        """Generate recommendations."""
        recs = []
        
        if any(i.get('type') == 'zombie_entity' for i in entity_issues):
            recs.append(f"1. [CRITICAL] **{self._t('critical_remove_zombie')}**")
        
        if any(i.get('type') == 'device_id_in_trigger' for i in auto_issues) or \
           any(i.get('type') == 'broken_device_reference' for i in entity_issues):
            recs.append(f"2. [HIGH] **{self._t('high_priority_device')}**")
            
        if any(i.get('type') == 'ghost_registry_entry' for i in entity_issues):
            recs.append(f"3. [GHOST] **{self._t('ghost_cleanup')}**")
        
        if score < 75:
            recs.append(f"4. [GENERAL] **{self._t('general_weekly_scan')}**")
        
        if not recs:
            recs.append(f"[OK] **{self._t('great_job')}**")
        
        return "\n".join(recs)

    def _generate_recommendations_pdf(
        self,
        score: int,
        auto_issues: list,
        entity_issues: list
    ) -> str:
        """Generate recommendations for PDF (no emojis)."""
        recs = []
        
        if any(i.get('type') == 'zombie_entity' for i in entity_issues):
            recs.append(f"1. [CRITICAL] {self._t('critical_remove_zombie')}")
        
        if any(i.get('type') == 'device_id_in_trigger' for i in auto_issues) or \
           any(i.get('type') == 'broken_device_reference' for i in entity_issues):
            recs.append(f"2. [HIGH] {self._t('high_priority_device')}")
            
        if any(i.get('type') == 'ghost_registry_entry' for i in entity_issues):
            recs.append(f"3. [GHOST] {self._t('ghost_cleanup')}")
        
        if score < 75:
            recs.append(f"4. [GENERAL] {self._t('general_weekly_scan')}")
        
        if not recs:
            recs.append(f"[OK] {self._t('great_job')}")
        
        return "\n".join(recs)

    def _count_by_severity(self, issues: list) -> dict:
        """Count by severity."""
        counts = {"high": 0, "medium": 0, "low": 0}
        for issue in issues:
            severity = issue.get('severity', 'low')
            counts[severity] = counts.get(severity, 0) + 1
        return counts

    def _count_by_type(self, issues: list) -> dict:
        """Count by type."""
        counts = {}
        for issue in issues:
            issue_type = issue.get('type', 'unknown')
            counts[issue_type] = counts.get(issue_type, 0) + 1
        return counts

    def list_reports(self) -> list[dict]:
        """List all generated reports grouped by session."""
        sessions = {}
        
        # Regex to extract timestamp: report_20231027_123456.md -> 20231027_123456
        import re
        pattern = re.compile(r"report_(\d{8}_\d{6})")
        
        for report_file in self._reports_dir.glob("report_*"):
            match = pattern.match(report_file.stem)
            if not match:
                continue
                
            session_id = match.group(1)
            stat = report_file.stat()
            fmt = report_file.suffix[1:]
            
            if session_id not in sessions:
                sessions[session_id] = {
                    "session_id": session_id,
                    "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "formats": {}
                }
            
            sessions[session_id]["formats"][fmt] = {
                "name": report_file.name,
                "size": stat.st_size
            }
        
        # Sort by session ID (timestamp) descending
        sorted_sessions = sorted(sessions.values(), key=lambda x: x["session_id"], reverse=True)
        return sorted_sessions[:20]  # Last 20 sessions

    async def delete_report_session(self, session_id: str) -> dict:
        """Delete all report files for a given session ID."""
        import re
        
        deleted_files = []
        errors = []
        
        # Find all files matching this session
        pattern = re.compile(f"report_{re.escape(session_id)}")
        
        for report_file in self._reports_dir.glob("report_*"):
            if pattern.match(report_file.name):
                try:
                    def delete_file():
                        report_file.unlink()
                    
                    await self.hass.async_add_executor_job(delete_file)
                    deleted_files.append(report_file.name)
                    _LOGGER.info("Deleted report file: %s", report_file.name)
                except Exception as e:
                    errors.append(f"{report_file.name}: {str(e)}")
                    _LOGGER.error("Failed to delete report file %s: %s", report_file.name, e)
        
        if not deleted_files and not errors:
            return {
                "success": False,
                "error": f"No reports found for session {session_id}"
            }
        
        return {
            "success": len(deleted_files) > 0,
            "deleted_count": len(deleted_files),
            "deleted_files": deleted_files,
            "errors": errors
        }
