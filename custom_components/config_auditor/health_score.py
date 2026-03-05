"""Health score calculation for H.A.C.A.

v2: ratio-based formula with per-category caps.
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
) -> int:
    """Calculate health score v2 — ratio-aware, capped per category.

    Design goals vs v1
    ------------------
    • Context-aware: 20 issues in a 2000-entity install ≠ 20 issues in a
      20-entity install.  We normalize weight by the size of the config.
    • Bounded: a single burst category (e.g. 500 dashboard warnings) cannot
      wipe the score; each category is capped at 25 penalty points.
    • Floor: score never goes below 20 even on catastrophic configs,
      so users are never demotivated by a zero.

    Weights
    -------
    severity  : high=5, medium=3, low=1
    category  : automation/entity (full) — performance/security (½) — dashboard (¼)

    Formula
    -------
    For each category c:
        raw_weight_c  = Σ severity_weight(issue)   for issue in c
        ratio_c       = raw_weight_c / max(denominator, 1)
        penalty_c     = min(ratio_c × 100, CAP_c)

    total_penalty = Σ penalty_c
    score         = max(20, round(100 - total_penalty))

    denominator   = max(total_entities + total_automations, 10)
                    (floor of 10 prevents division-by-zero on empty installs)

    Category caps
    -------------
    automation : 30 pts   (primary quality signal)
    entity     : 25 pts
    performance: 15 pts   (half weight already baked in)
    security   : 20 pts   (security matters, but rarely widespread)
    dashboard  : 10 pts   (dashboard issues are often cosmetic)

    Backward compatibility
    ----------------------
    The two positional parameters are the same as v1.  All new parameters
    are keyword-only with safe defaults.  Call-sites that pass all five
    positional args (including None) continue to work unchanged.
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

    auto_list  = list(automation_issues)
    ent_list   = list(entity_issues)
    perf_list  = list(performance_issues or [])
    sec_list   = list(security_issues or [])
    dash_list  = list(dashboard_issues or [])

    penalty = (
        _penalty(auto_list,  1.0, 30.0)   # automation  — full weight, cap 30
        + _penalty(ent_list,  1.0, 25.0)  # entity      — full weight, cap 25
        + _penalty(perf_list, 2.0, 15.0)  # performance — half weight, cap 15
        + _penalty(sec_list,  2.0, 20.0)  # security    — half weight, cap 20
        + _penalty(dash_list, 4.0, 10.0)  # dashboard   — quarter weight, cap 10
    )

    return max(20, round(100 - penalty))
