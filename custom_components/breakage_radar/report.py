"""Turning the index and the local scan into the sensor's state.

Deliberately free of any ``homeassistant`` import so the exact code that runs
on a real box can be unit-tested without a Home Assistant install, and free of
I/O: :func:`build_report` is a pure function of (index, local scan, clock).

Discovery lives in :mod:`.discovery` and scanning in :mod:`.scanner`; this
module only decides what the two of them add up to.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from .const import ALERT_WINDOW_DAYS, MAX_DETAILS, SUPPORTED_SCHEMA
from .rules_engine import is_future, parse_version


def release_estimated_date(release: str) -> date | None:
    """Expected calendar date of a Home Assistant release label.

    Home Assistant's published schedule: "A new stable version of Home
    Assistant is released on the first Wednesday of every month"
    (home-assistant.io/faq/release/). Measured against the eight 2026.x
    releases, that rule was exact every time. It is computed here rather than
    fetched, so a one-off rescheduled release would shift the estimate; the
    ``broken_now`` level never depends on it. Returns ``None`` for anything
    unparseable, and callers treat that as "no date opinion" rather than
    guessing.
    """
    parts = release.split(".")
    if len(parts) < 2:
        return None
    try:
        first = date(int(parts[0]), int(parts[1]), 1)
    except ValueError:
        return None
    return first + timedelta(days=(2 - first.weekday()) % 7)


def _index_by_domain(index: dict[str, Any]) -> dict[str, dict[str, Any]]:
    mapping: dict[str, dict[str, Any]] = {}
    for integration in index.get("integrations", []):
        if not isinstance(integration, dict):
            continue
        domains = integration.get("domains") or []
        if integration.get("domain"):
            domains = [integration["domain"], *domains]
        for domain in domains:
            if domain and domain not in mapping:
                mapping[domain] = integration
    return mapping


def build_report(
    index: dict[str, Any],
    installed: dict[str, str],
    local_scan: dict[str, Any] | None = None,
    *,
    current_version: str = "",
    today: date | None = None,
    alert_window_days: int = ALERT_WINDOW_DAYS,
) -> dict[str, Any]:
    """Match installed custom integrations against the published index.

    ``local_scan`` is the result of :func:`scan_installed`. Local findings
    describe the exact installed bytes, so wherever the local scan reached a
    verdict it **replaces** the index's: a domain the index never heard of that
    parses clean becomes ``clean``, and an index finding disappears when the
    installed copy no longer contains it. Only a domain the local scan could
    not read falls back to the index, and if neither side knows it, it stays in
    ``not_in_index`` with the local reason. A local ``clean`` reached with zero
    matchable rules in play proves nothing and never overrides the index.

    ``current_version`` is the Home Assistant release this system runs, and
    ``today`` the current date. Together they sort every finding into three
    levels:

    ``broken_now``  the running version has already reached the deadline. This
                    is decided by version comparison alone -- never by a date
                    estimate -- so it is exact.
    ``imminent``    still ahead, but the release is estimated to land within
                    ``alert_window_days``. Worth an alert of its own.
    ``upcoming``    further out. Summarised in one group rather than alerted
                    on individually, because a year-ahead deadline that cannot
                    be dismissed just teaches people to ignore the panel.

    Without a version or a date, findings degrade conservatively to
    ``upcoming`` rather than guessing.

    Returns a plain dict ready to become the sensor's state and attributes.
    Unknown or malformed index payloads degrade to an empty report rather than
    raising -- the caller decides whether that is an error.
    """
    rules = {
        rule["id"]: rule
        for rule in index.get("rules", [])
        if isinstance(rule, dict) and "id" in rule
    }
    affected_by_domain = _index_by_domain(index)
    clean_domains = set(index.get("clean_domains") or [])
    scanned_locally = (local_scan or {}).get("domains", {})
    rules_in_play = (local_scan or {}).get("rules_matchable", 0)

    by_release: dict[str, list[str]] = {}
    details: list[dict[str, Any]] = []
    affected: list[str] = []
    clean: list[str] = []
    unknown: list[str] = []
    unknown_reasons: dict[str, str] = {}
    broken_now: dict[str, str] = {}
    imminent: dict[str, dict[str, Any]] = {}

    def _days_until(release: str) -> int | None:
        """Estimated days until ``release`` ships, or ``None`` if unknowable."""
        if today is None:
            return None
        when = release_estimated_date(release)
        if when is None:
            return None
        return (when - today).days

    def _when(release: str) -> str:
        if not release:
            return "upcoming"
        if current_version and not is_future(release, current_version):
            # Exact: this system is already running the release that removed it.
            return "broken_now"
        days = _days_until(release)
        if days is not None and days <= alert_window_days:
            return "imminent"
        return "upcoming"

    def _add_details(
        domain: str,
        findings: list[dict[str, Any]],
        source: str,
        entry: dict[str, Any] | None,
    ) -> None:
        affected.append(domain)
        for finding in findings:
            release = str(finding.get("breaks_in", ""))
            bucket = by_release.setdefault(release, [])
            if domain not in bucket:
                bucket.append(domain)
            when = _when(release)
            days = _days_until(release)
            if when == "broken_now":
                previous = broken_now.get(domain)
                if previous is None or parse_version(release) < parse_version(previous):
                    broken_now[domain] = release
            elif when == "imminent":
                previous_entry = imminent.get(domain)
                if previous_entry is None or parse_version(release) < parse_version(
                    previous_entry["release"]
                ):
                    imminent[domain] = {
                        "release": release,
                        "days": days if days is not None else 0,
                    }
            rule = rules.get(finding.get("rule_id"), {})
            details.append(
                {
                    "domain": domain,
                    "rule_id": finding.get("rule_id", ""),
                    "breaks_in": release,
                    "file": finding.get("file", ""),
                    "line": finding.get("line", 0),
                    "confidence": finding.get("confidence", ""),
                    "source": source,
                    "when": when,
                    "days_until": days,
                    "repository": (entry or {}).get("full_name", ""),
                    # A local finding was matched against the installed bytes
                    # themselves, so the scanned version *is* the installed one.
                    "scanned_version": (
                        installed.get(domain, "")
                        if source == "local"
                        else (entry or {}).get("version", "")
                    ),
                    "installed_version": installed.get(domain, ""),
                    "message": (rule.get("message") or "")[:300],
                    "learn_more": rule.get("source", ""),
                }
            )

    for domain in sorted(installed):
        # Breakage Radar is reported on like anything else. Exempting the tool
        # from its own check is how a check quietly stops being tested.
        entry = affected_by_domain.get(domain)
        index_findings = [
            f for f in (entry or {}).get("findings", []) if isinstance(f, dict)
        ]
        local = scanned_locally.get(domain)

        if local and local.get("status") == "affected":
            _add_details(domain, local.get("findings", []), "local", entry)
        elif local and local.get("status") == "clean" and rules_in_play > 0:
            clean.append(domain)
        elif index_findings:
            _add_details(domain, index_findings, "index", entry)
        elif entry is not None or domain in clean_domains:
            clean.append(domain)
        else:
            unknown.append(domain)
            if local and local.get("reason"):
                unknown_reasons[domain] = local["reason"]

    details.sort(key=lambda d: (d["breaks_in"], d["domain"], d["file"], d["line"]))
    truncated = len(details) > MAX_DETAILS

    return {
        "affected_count": len(affected),
        "affected_domains": affected,
        "by_release": {
            release: sorted(domains)
            for release, domains in sorted(
                by_release.items(), key=lambda item: parse_version(item[0])
            )
        },
        "details": details[:MAX_DETAILS],
        "details_truncated": truncated,
        "total_findings": len(details),
        "installed_count": len(installed),
        "clean_domains": clean,
        "not_in_index": unknown,
        "not_in_index_reasons": unknown_reasons,
        "broken_now": broken_now,
        "broken_now_count": len(broken_now),
        "imminent": imminent,
        "imminent_count": len(imminent),
        # Affected domains with nothing urgent -- the ones the aggregate issue
        # summarises rather than alerting on individually.
        "summarised_domains": sorted(
            set(affected) - set(broken_now) - set(imminent)
        ),
        "alert_window_days": alert_window_days,
        "files_scanned": (local_scan or {}).get("files_scanned", 0),
        "unparsed_files": (local_scan or {}).get("unparsed_files", 0),
        "skipped_files": (local_scan or {}).get("skipped_files", 0),
        "local_scan_enabled": local_scan is not None,
        "index_generated_utc": index.get("generated_utc", ""),
        "index_core_version": index.get("core_version", ""),
        "index_schema": index.get("schema"),
        "earliest_release": (
            min(by_release, key=parse_version) if by_release else None
        ),
    }


def validate_index(payload: Any) -> str | None:
    """Return an error string if ``payload`` is not a usable schema-1 index."""
    if not isinstance(payload, dict):
        return f"index is {type(payload).__name__}, expected an object"
    schema = payload.get("schema")
    if schema != SUPPORTED_SCHEMA:
        return f"index schema {schema!r} is not supported (need {SUPPORTED_SCHEMA})"
    if not isinstance(payload.get("integrations"), list):
        return "index has no 'integrations' list"
    if not isinstance(payload.get("rules"), list):
        return "index has no 'rules' list"
    return None
