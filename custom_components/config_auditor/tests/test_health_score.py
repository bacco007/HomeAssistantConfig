"""Tests for health_score.calculate_health_score() — v1.1.0.

Formula: ratio-based with per-category caps and a floor of 20.
denominator = max(total_entities + total_automations, 10)
penalty_c = min((weighted_sum_c / denominator) × 100, cap_c)
score = max(20, round(100 - Σ penalty_c))
"""
from __future__ import annotations

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from custom_components.config_auditor.health_score import calculate_health_score


def make_issues(counts: dict) -> list[dict]:
    issues = []
    for severity, count in counts.items():
        for _ in range(count):
            issues.append({"severity": severity, "type": "test", "message": "test"})
    return issues


class TestHealthScorePerfect:
    def test_no_issues_returns_100(self):
        assert calculate_health_score([], []) == 100

    def test_all_args_empty_lists(self):
        assert calculate_health_score([], [], [], [], []) == 100

    def test_none_optional_args(self):
        assert calculate_health_score([], [], None, None, None) == 100

    def test_no_issues_with_context(self):
        assert calculate_health_score([], [], total_entities=500, total_automations=100) == 100


class TestHealthScoreWeights:
    def test_high_worse_than_medium(self):
        s_h = calculate_health_score(make_issues({"high": 1}), [], total_entities=100)
        s_m = calculate_health_score(make_issues({"medium": 1}), [], total_entities=100)
        assert s_h < s_m

    def test_medium_worse_than_low(self):
        s_m = calculate_health_score(make_issues({"medium": 1}), [], total_entities=100)
        s_l = calculate_health_score(make_issues({"low": 1}), [], total_entities=100)
        assert s_m < s_l

    def test_more_issues_always_worse(self):
        scores = [calculate_health_score(make_issues({"high": n}), [], total_entities=100)
                  for n in range(0, 8)]
        assert scores == sorted(scores, reverse=True)


class TestHealthScoreHalfWeight:
    def test_perf_costs_less_than_automation(self):
        s_a = calculate_health_score(make_issues({"high": 3}), [], total_entities=100)
        s_p = calculate_health_score([], [], make_issues({"high": 3}), total_entities=100)
        assert s_p > s_a

    def test_security_costs_less_than_automation(self):
        s_a = calculate_health_score(make_issues({"high": 3}), [], total_entities=100)
        s_s = calculate_health_score([], [], None, make_issues({"high": 3}), total_entities=100)
        assert s_s > s_a

    def test_dashboard_costs_less_than_automation(self):
        s_a = calculate_health_score(make_issues({"high": 3}), [], total_entities=100)
        s_d = calculate_health_score([], [], None, None, make_issues({"high": 3}), total_entities=100)
        assert s_d > s_a


class TestHealthScoreBoundaries:
    def test_floor_is_20(self):
        massive = make_issues({"high": 200})
        assert calculate_health_score(massive, massive, massive, massive, massive) >= 20

    def test_score_never_above_100(self):
        assert calculate_health_score([], []) <= 100

    def test_unknown_severity_defaults_to_low(self):
        issues = [{"severity": "typo_severity", "type": "t"}]
        score = calculate_health_score(issues, [], total_entities=100)
        assert 20 <= score <= 100

    def test_missing_severity_key(self):
        issues = [{"type": "t", "message": "m"}]
        score = calculate_health_score(issues, [], total_entities=100)
        assert 20 <= score <= 100


class TestHealthScoreRatioAwareness:
    def test_large_install_scores_higher_than_small(self):
        issues = make_issues({"high": 5})
        s_small = calculate_health_score(issues, [], total_entities=10, total_automations=5)
        s_large = calculate_health_score(issues, [], total_entities=1000, total_automations=500)
        assert s_large > s_small

    def test_ratio_denominator_floor(self):
        issues = make_issues({"high": 1})
        score = calculate_health_score(issues, [], total_entities=0, total_automations=0)
        assert 20 <= score <= 100


class TestHealthScoreCaps:
    def test_automation_cap_at_30(self):
        huge = make_issues({"high": 1000})
        score = calculate_health_score(huge, [], total_entities=10, total_automations=5)
        assert score >= 100 - 30

    def test_dashboard_cap_at_10(self):
        huge = make_issues({"high": 1000})
        score = calculate_health_score([], [], None, None, huge, total_entities=10)
        assert score >= 100 - 10


class TestHealthScoreMonotonicity:
    def test_more_issues_lower_score(self):
        scores = [calculate_health_score(make_issues({"high": n}), [], total_entities=100)
                  for n in range(0, 20, 3)]
        assert scores == sorted(scores, reverse=True)
