"""Shared data models for H.A.C.A.

Centralises all TypedDict and dataclass definitions so that every module
uses the same structural contracts instead of bare ``dict``.

These are *structural types* used for documentation, IDE support, and
runtime-optional validation. The existing dict-based code continues to work
unchanged — these classes add a layer of explicitness on top.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal, Optional, TypedDict


# ── Severity type alias ────────────────────────────────────────────────────────

Severity = Literal["high", "medium", "low"]


# ── Issue — the core unit returned by every analyser ──────────────────────────

class IssueDict(TypedDict, total=False):
    """Typed dict representing a single audit issue.

    ``total=False`` means all keys are optional so that partial dicts (which
    is what the existing code produces) are still type-compatible.
    """
    entity_id:        str
    alias:            str
    type:             str
    severity:         Severity
    message:          str
    recommendation:   str
    fix_available:    bool
    location:         str
    # Extra fields used by specific issue types
    automation_id:    str
    source_name:      str
    device_id:        str
    dashboard:        str
    dashboard_url:    str
    locations:        list[str]
    automation_names: list[str]
    duplicate_ids:    list[str]
    similar_to:       str
    similarity_pct:   int
    last_triggered_days_ago: int
    unavailable_triggers: list[str]
    complexity_detail: "ComplexityDetailDict"


class ComplexityDetailDict(TypedDict, total=False):
    """Score breakdown pills shown in the complexity card."""
    score:      int
    triggers:   int
    conditions: int
    actions:    int
    templates:  int


# ── Dataclass (recommended for new code) ──────────────────────────────────────

@dataclass
class AuditIssue:
    """Strongly-typed audit issue.

    Use this in new analyser code. Existing code can keep using plain dicts;
    ``to_dict()`` converts for backwards compatibility.
    """
    entity_id:      str
    type:           str
    severity:       Severity
    message:        str
    recommendation: str
    fix_available:  bool           = False
    location:       str            = ""
    alias:          str            = ""
    # Optional metadata
    source_name:    str            = ""
    device_id:      str            = ""
    extra:          dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> IssueDict:
        """Convert to plain dict for backwards compatibility with existing code."""
        d: IssueDict = {
            "entity_id":      self.entity_id,
            "type":           self.type,
            "severity":       self.severity,
            "message":        self.message,
            "recommendation": self.recommendation,
            "fix_available":  self.fix_available,
        }
        if self.location:
            d["location"] = self.location
        if self.alias:
            d["alias"] = self.alias
        if self.source_name:
            d["source_name"] = self.source_name
        if self.device_id:
            d["device_id"] = self.device_id
        d.update(self.extra)
        return d

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "AuditIssue":
        """Build from a plain dict (for migration)."""
        known = {"entity_id", "type", "severity", "message", "recommendation",
                 "fix_available", "location", "alias", "source_name", "device_id"}
        extra = {k: v for k, v in d.items() if k not in known}
        return cls(
            entity_id      = d.get("entity_id", ""),
            type           = d.get("type", "unknown"),
            severity       = d.get("severity", "low"),
            message        = d.get("message", ""),
            recommendation = d.get("recommendation", ""),
            fix_available  = d.get("fix_available", False),
            location       = d.get("location", ""),
            alias          = d.get("alias", ""),
            source_name    = d.get("source_name", ""),
            device_id      = d.get("device_id", ""),
            extra          = extra,
        )


# ── Complexity score row ───────────────────────────────────────────────────────

@dataclass
class ComplexityScore:
    entity_id:  str
    alias:      str
    score:      int
    triggers:   int = 0
    conditions: int = 0
    actions:    int = 0
    templates:  int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_id":  self.entity_id,
            "alias":      self.alias,
            "score":      self.score,
            "triggers":   self.triggers,
            "conditions": self.conditions,
            "actions":    self.actions,
            "templates":  self.templates,
        }


# ── Battery entry ─────────────────────────────────────────────────────────────

BatterySeverity = Optional[Literal["high", "medium", "low"]]

@dataclass
class BatteryEntry:
    entity_id:    str
    friendly_name: str
    level:        float
    unit:         str          = "%"
    severity:     BatterySeverity = None
    state_class:  str          = ""
    device_class: str          = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_id":    self.entity_id,
            "friendly_name": self.friendly_name,
            "level":        self.level,
            "unit":         self.unit,
            "severity":     self.severity,
            "state_class":  self.state_class,
            "device_class": self.device_class,
        }


# ── Dependency graph node / edge ───────────────────────────────────────────────

NodeType = Literal["automation", "script", "scene", "entity", "blueprint", "device"]

class GraphNodeDict(TypedDict, total=False):
    id:           str
    type:         NodeType
    label:        str
    degree:       int
    has_issues:   bool
    issue_count:  int
    max_severity: Optional[Severity]
    issue_summary: list[dict[str, str]]
    domain:       str   # for entity nodes
    path:         str   # for blueprint nodes

class GraphEdgeDict(TypedDict):
    source: str
    target: str
    rel:    str   # "uses", "controls", "calls_script", "uses_blueprint", …


# ── Coordinator data snapshot ─────────────────────────────────────────────────

class CoordinatorData(TypedDict, total=False):
    """Full typed structure of coordinator.data returned by async_update_data."""
    health_score:          int
    total_issues:          int
    automation_issues:     int
    script_issues:         int
    scene_issues:          int
    entity_issues:         int
    performance_issues:    int
    security_issues:       int
    blueprint_issues:      int
    dashboard_issues:      int
    automation_issue_list: list[IssueDict]
    script_issue_list:     list[IssueDict]
    scene_issue_list:      list[IssueDict]
    entity_issue_list:     list[IssueDict]
    performance_issue_list: list[IssueDict]
    security_issue_list:   list[IssueDict]
    blueprint_issue_list:  list[IssueDict]
    dashboard_issue_list:  list[IssueDict]
    complexity_scores:     list[dict[str, Any]]
    script_complexity_scores: list[dict[str, Any]]
    scene_stats:           list[dict[str, Any]]
    blueprint_stats:       list[dict[str, Any]]
    battery_list:          list[dict[str, Any]]
    battery_count:         int
    battery_alerts:        int
    dependency_graph:      dict[str, Any]
    recorder_orphans:      list[dict[str, Any]]
    recorder_orphan_count: int
    recorder_wasted_mb:    float
    recorder_db_available: bool
