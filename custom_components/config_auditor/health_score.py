"""Health score calculation for H.A.C.A.

v3: ratio-based formula with per-category caps — all issue types included.
"""
from __future__ import annotations

from typing import Any


def calculate_health_score(
    automation_issues: list[dict[str, Any]],
    entity_issues: list[dict[str, Any]],
    performance_issues: list[dict[str, Any]] | None = None,
    security_issues: list[dict[str, Any]] | None = None,
    dashboard_issues: list[dict[str, Any]] | None = None,
    *,
    total_entities: int = 0,
    total_automations: int = 0,
    helper_issues: list[dict[str, Any]] | None = None,
    compliance_issues: list[dict[str, Any]] | None = None,
    script_issues: list[dict[str, Any]] | None = None,
    scene_issues: list[dict[str, Any]] | None = None,
    blueprint_issues: list[dict[str, Any]] | None = None,
) -> int:
    """Calculate health score v3 — ratio-aware, capped per category.

    Design goals
    ------------
    • Context-aware: 20 issues in a 2000-entity install ≠ 20 issues in a
      20-entity install.  We normalize weight by the size of the config.
    • Bounded: a single burst category (e.g. 500 dashboard warnings) cannot
      wipe the score; each category is capped.
    • Floor: score never goes below 20 even on catastrophic configs,
      so users are never demotivated by a zero.
    • Complete: all issue categories contribute to the score.

    Weights
    -------
    severity  : high=5, medium=3, low=1
    category  : automation/entity/script (full) — performance/security (½)
                — helper/scene/blueprint/compliance/dashboard (¼)

    Category caps (total max penalty = 100)
    ----------------------------------------
    automation  : 25 pts   (primary quality signal)
    entity      : 20 pts
    script      : 10 pts
    performance : 12 pts   (half weight baked in)
    security    : 15 pts   (security matters, but rarely widespread)
    helper      :  5 pts   (often cosmetic — unused helpers)
    scene       :  3 pts   (rarely critical)
    blueprint   :  3 pts   (rarely critical)
    compliance  :  4 pts   (naming/area conventions)
    dashboard   :  3 pts   (dashboard issues are often cosmetic)

    Backward compatibility
    ----------------------
    The five positional parameters are the same as v2.  All new parameters
    are keyword-only with None defaults.  Existing call-sites that pass all
    five positional args (including None) continue to work unchanged.
    """
    severity_weights: dict[str, int] = {"high": 5, "medium": 3, "low": 1}

    def _weight(issues: list[dict[str, Any]], divisor: float = 1.0) -> float:
        return sum(
            severity_weights.get(i.get("severity", "low"), 1) / divisor
            for i in issues
        )

    denominator = max(total_entities + total_automations, 10)

    def _penalty(issues: list[dict[str, Any]], divisor: float, cap: float) -> float:
        w = _weight(issues, divisor)
        return min((w / denominator) * 100, cap)

    penalty = (
        _penalty(list(automation_issues),            1.0, 25.0)   # automation  — full weight
        + _penalty(list(entity_issues),              1.0, 20.0)   # entity      — full weight
        + _penalty(list(script_issues or []),         1.0, 10.0)  # script      — full weight
        + _penalty(list(performance_issues or []),    2.0, 12.0)  # performance — half weight
        + _penalty(list(security_issues or []),       2.0, 15.0)  # security    — half weight
        + _penalty(list(helper_issues or []),          4.0,  5.0) # helper      — quarter weight
        + _penalty(list(scene_issues or []),           4.0,  3.0) # scene       — quarter weight
        + _penalty(list(blueprint_issues or []),       4.0,  3.0) # blueprint   — quarter weight
        + _penalty(list(compliance_issues or []),      4.0,  4.0) # compliance  — quarter weight
        + _penalty(list(dashboard_issues or []),       4.0,  3.0) # dashboard   — quarter weight
    )

    return max(20, round(100 - penalty))
