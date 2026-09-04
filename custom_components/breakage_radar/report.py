"""Turns the index and the local scan into the sensor's state.

Free of any ``homeassistant`` import and of I/O, so the code that runs on a
real system can be tested without one. Discovery lives in :mod:`.discovery`,
scanning in :mod:`.scanner`.
"""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date
from typing import Any

from .const import (
    ALERT_WINDOW_DAYS,
    MAX_ALERT_CARDS,
    MAX_DETAILS,
    SUPPORTED_SCHEMA,
)
from .rules_engine import is_future, parse_version, search_term

# describe_when and release_estimated_date are re-exported: the repairs card
# and the tests reach them through this module.
from .schedule import days_until as _schedule_days_until
from .schedule import describe_when, release_estimated_date  # noqa: F401


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


def _index_by_card(index: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Plugin entries keyed by repository basename, lower-cased.

    HACS installs a card to ``www/community/<repository basename>``, so that
    directory name is the join key an installed card has in common with the
    index's plugin entry.
    """
    mapping: dict[str, dict[str, Any]] = {}
    for entry in index.get("integrations", []):
        if not isinstance(entry, dict):
            continue
        if (entry.get("category") or "integration") != "plugin":
            continue
        name = str(entry.get("full_name") or "").rsplit("/", 1)[-1].lower()
        if name and name not in mapping:
            mapping[name] = entry
    return mapping


def build_report(
    index: dict[str, Any],
    installed: dict[str, str],
    local_scan: dict[str, Any] | None = None,
    *,
    current_version: str = "",
    today: date | None = None,
    alert_window_days: int = ALERT_WINDOW_DAYS,
    ignored_domains: Iterable[str] = (),
    cards: Iterable[str] = (),
    local_card_scan: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Match installed custom integrations against the published index.

    Local scan results replace the index's for the same domain, since they
    describe the bytes actually installed. A domain the scan could not read
    falls back to the index, and a local "clean" reached with no rules in play
    never overrides an index finding.

    Findings are levelled as ``broken_now`` (running version has reached the
    deadline, decided by version comparison so it is exact), ``imminent``
    (release estimated within ``alert_window_days``) or ``upcoming``. Without
    a version or a date everything degrades to ``upcoming``.

    Domains in ``ignored_domains`` are dropped before anything is levelled, so
    the user's own choice never shows up as a finding, a notification or a count.

    A malformed index gives an empty report rather than raising.
    """
    # Before any other work, so every count downstream agrees on what is in play.
    installed_cards = sorted(set(cards))
    ignored = set(ignored_domains) & (installed.keys() | set(installed_cards))
    installed = {
        domain: version
        for domain, version in installed.items()
        if domain not in ignored
    }
    installed_cards = [name for name in installed_cards if name not in ignored]

    rules = {
        rule["id"]: rule
        for rule in index.get("rules", [])
        if isinstance(rule, dict) and "id" in rule
    }
    affected_by_domain = _index_by_domain(index)
    affected_by_card = _index_by_card(index)
    clean_domains = set(index.get("clean_domains") or [])
    index_clean_cards = set(index.get("clean_cards") or [])
    scanned_locally = (local_scan or {}).get("domains", {})
    rules_in_play = (local_scan or {}).get("rules_matchable", 0)
    cards_scanned_locally = (local_card_scan or {}).get("cards", {})
    card_rules_in_play = (local_card_scan or {}).get("rules_matchable", 0)

    def _unchecked(
        index_findings: list[dict[str, Any]], scan: dict[str, Any] | None
    ) -> list[dict[str, Any]]:
        """Index findings the local scan was never able to look for.

        A local "clean" only speaks for the rules the local engine could run.
        When the index ships a rule whose matcher type this vendored engine
        predates, the engine silently drops it and reports clean anyway --
        and without this the index's finding would be discarded, telling the
        user an integration is fine while the index says it breaks.

        A scan that does not report ``rule_ids`` is from an engine that
        predates the field; there is nothing to compare against, so it keeps
        the old behaviour rather than resurrecting every index finding.
        """
        ran = (scan or {}).get("rule_ids")
        if not ran:
            return []
        known = set(ran)
        return [f for f in index_findings if f.get("rule_id") not in known]

    by_release: dict[str, list[str]] = {}
    details: list[dict[str, Any]] = []
    affected: list[str] = []
    clean: list[str] = []
    unknown: list[str] = []
    unknown_reasons: dict[str, str] = {}
    broken_now: dict[str, str] = {}
    imminent: dict[str, dict[str, Any]] = {}
    affected_cards: list[str] = []
    clean_cards: list[str] = []
    unknown_cards: list[str] = []
    broken_now_cards: dict[str, str] = {}
    imminent_cards: dict[str, dict[str, Any]] = {}
    card_reasons: dict[str, str] = {}
    links: dict[str, dict[str, str]] = {}

    def _days_until(release: str) -> int | None:
        if today is None:
            return None
        return _schedule_days_until(release, today)

    def _when(release: str) -> str:
        if not release:
            return "upcoming"
        if current_version and not is_future(release, current_version):
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
        kind: str = "integration",
    ) -> None:
        if kind == "card":
            if domain not in affected_cards:
                affected_cards.append(domain)
            broken_bucket, imminent_bucket = broken_now_cards, imminent_cards
        else:
            if domain not in affected:
                affected.append(domain)
            broken_bucket, imminent_bucket = broken_now, imminent
        for finding in findings:
            release = str(finding.get("breaks_in", ""))
            bucket = by_release.setdefault(release, [])
            if domain not in bucket:
                bucket.append(domain)
            when = _when(release)
            days = _days_until(release)
            if when == "broken_now":
                previous = broken_bucket.get(domain)
                if previous is None or parse_version(release) < parse_version(previous):
                    broken_bucket[domain] = release
            elif when == "imminent":
                previous_entry = imminent_bucket.get(domain)
                if previous_entry is None or parse_version(release) < parse_version(
                    previous_entry["release"]
                ):
                    imminent_bucket[domain] = {
                        "release": release,
                        "days": days if days is not None else 0,
                    }
            if when in ("broken_now", "imminent"):
                # What the notification needs to point somewhere useful.
                rule = rules.get(finding.get("rule_id"), {})
                upstream = (entry or {}).get("upstream") or {}
                links.setdefault(
                    domain,
                    {
                        "repository": (entry or {}).get("full_name", ""),
                        "repo_url": (entry or {}).get("repo_url", ""),
                        # The deprecated symbol is the search term that finds an
                        # existing report; a vague word like "deprecated" does not,
                        # and neither does `StateVacuumEntity.battery_level` whole.
                        "symbol": search_term(rule.get("symbol", "")),
                        # source_url is a real link; source can be a bare
                        # "file.py:418" reference for core-derived rules.
                        "learn_more": (
                            rule.get("source_url") or rule.get("source") or ""
                        ),
                        # What the crawler already found upstream, so nobody
                        # files a report that exists.
                        "archived": bool(upstream.get("archived")),
                        "issues_enabled": upstream.get("issues_enabled"),
                        "report": upstream.get("report") or {},
                    },
                )
            rule = rules.get(finding.get("rule_id"), {})
            details.append(
                {
                    "domain": domain,
                    "kind": kind,
                    "rule_id": finding.get("rule_id", ""),
                    "breaks_in": release,
                    "file": finding.get("file", ""),
                    "line": finding.get("line", 0),
                    "confidence": finding.get("confidence", ""),
                    "source": source,
                    "when": when,
                    "days_until": days,
                    "due": describe_when(release, days),
                    "repository": (entry or {}).get("full_name", ""),
                    # A local finding matched the installed bytes, so the
                    # scanned version is the installed one.
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
        # Breakage Radar is reported on like anything else.
        entry = affected_by_domain.get(domain)
        index_findings = [
            f for f in (entry or {}).get("findings", []) if isinstance(f, dict)
        ]
        local = scanned_locally.get(domain)

        unchecked = _unchecked(index_findings, local_scan) if local else []

        if local and local.get("status") == "affected":
            _add_details(domain, local.get("findings", []), "local", entry)
            if unchecked:
                _add_details(domain, unchecked, "index", entry)
        elif local and local.get("status") == "clean" and rules_in_play > 0:
            if unchecked:
                _add_details(domain, unchecked, "index", entry)
            else:
                clean.append(domain)
        elif index_findings:
            _add_details(domain, index_findings, "index", entry)
        elif entry is not None or domain in clean_domains:
            clean.append(domain)
        else:
            unknown.append(domain)
            if local and local.get("reason"):
                unknown_reasons[domain] = local["reason"]

    for card in installed_cards:
        entry = affected_by_card.get(card.lower())
        index_findings = [
            f for f in (entry or {}).get("findings", []) if isinstance(f, dict)
        ]
        local = cards_scanned_locally.get(card)

        unchecked = _unchecked(index_findings, local_card_scan) if local else []

        if local and local.get("status") == "affected":
            _add_details(card, local.get("findings", []), "local", entry, kind="card")
            if unchecked:
                _add_details(card, unchecked, "index", entry, kind="card")
        elif local and local.get("status") == "clean" and card_rules_in_play > 0:
            if unchecked:
                _add_details(card, unchecked, "index", entry, kind="card")
            else:
                clean_cards.append(card)
        elif index_findings:
            _add_details(card, index_findings, "index", entry, kind="card")
        elif entry is not None or card.lower() in index_clean_cards:
            clean_cards.append(card)
        else:
            unknown_cards.append(card)
            if local and local.get("reason"):
                card_reasons[card] = local["reason"]

    details.sort(
        key=lambda d: (parse_version(d["breaks_in"]), d["domain"], d["file"], d["line"])
    )
    truncated = len(details) > MAX_DETAILS

    # A wide window on a system with many affected integrations would other-
    # wise raise a notification for each one. Keep the nearest few; the rest
    # are in the summary, which carries every date anyway. Cards share the
    # same budget: the cap exists for the Repairs panel, which shows both.
    if len(imminent) + len(imminent_cards) > MAX_ALERT_CARDS:
        nearest = sorted(
            [("integration", k, v) for k, v in imminent.items()]
            + [("card", k, v) for k, v in imminent_cards.items()],
            key=lambda item: item[2]["days"],
        )[:MAX_ALERT_CARDS]
        imminent = {k: v for kind, k, v in nearest if kind == "integration"}
        imminent_cards = {k: v for kind, k, v in nearest if kind == "card"}

    schedule = []
    for release, domains in sorted(
        by_release.items(), key=lambda item: parse_version(item[0])
    ):
        days = _days_until(release)
        schedule.append(
            {
                "release": release,
                "due": describe_when(release, days),
                "days_until": days,
                "when": _when(release),
                "domains": sorted(domains),
                "count": len(domains),
            }
        )

    return {
        "affected_count": len(affected),
        "affected_domains": affected,
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
        "cards_installed_count": len(installed_cards),
        "affected_cards": affected_cards,
        "clean_cards": clean_cards,
        "cards_not_analysed": unknown_cards,
        "cards_not_analysed_reasons": card_reasons,
        "broken_now_cards": broken_now_cards,
        "imminent_cards": imminent_cards,
        "summarised_cards": sorted(
            set(affected_cards) - set(broken_now_cards) - set(imminent_cards)
        ),
        "links": links,
        "schedule": schedule,
        "summarised_domains": sorted(
            set(affected) - set(broken_now) - set(imminent)
        ),
        "alert_window_days": alert_window_days,
        "ignored_domains": sorted(ignored),
        "files_scanned": (local_scan or {}).get("files_scanned", 0),
        "unparsed_files": (local_scan or {}).get("unparsed_files", 0),
        "skipped_files": (local_scan or {}).get("skipped_files", 0),
        "card_files_scanned": (local_card_scan or {}).get("files_scanned", 0),
        "skipped_minified_files": (local_card_scan or {}).get("skipped_minified", 0),
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
