"""Runs the rule matchers over installed integrations' own source.

Blocking I/O, so call from an executor. This is what gives forked, renamed and
non-HACS integrations a real verdict instead of "not in the index".

Problems are counted, never raised. A domain whose files cannot be parsed comes
back ``unknown`` with a reason, and a truncated scan never reads as ``clean``:
a scan that checked nothing has proven nothing.
"""

from __future__ import annotations

import hashlib
import json
import os
from collections.abc import Callable, Iterator
from typing import Any

from .discovery import IGNORED_DIRECTORIES, _manifest_domain
from .rules_engine import (
    ENGINE_VERSION,
    JS_SUFFIXES,
    ScanStats,
    dedupe_js_findings,
    load_rules,
    looks_minified_js,
    match_js_source,
    match_source,
)

#: Matches the crawler's VENDOR_MARKERS so both sides judge the same files.
UNSCANNED_DIRECTORIES = IGNORED_DIRECTORIES | frozenset(
    {"site-packages", "node_modules", "vendor"}
)


def _rules_fingerprint(rules_payload: list[dict[str, Any]], current_version: str) -> str:
    """Cache key covering everything that can change a scan's outcome.

    A rules update, an engine change or a Home Assistant upgrade all invalidate
    it, so a cached result can never outlive the rules that produced it.
    """
    digest = hashlib.sha256()
    digest.update(f"engine={ENGINE_VERSION};current={current_version};".encode())
    digest.update(json.dumps(rules_payload, sort_keys=True, default=str).encode())
    return digest.hexdigest()[:16]


def _walk(directory: str, wanted: Callable[[str], bool]) -> tuple[list[tuple[str, str]], int]:
    """Every file ``wanted`` accepts, as ``(absolute, relative)``, plus a count
    of directories the walk could not enter.

    Symlinked subdirectories are skipped so a link pointing back up the tree
    cannot loop the scan.
    """
    files: list[tuple[str, str]] = []
    unreadable_dirs = 0

    def _on_error(_err: OSError) -> None:
        nonlocal unreadable_dirs
        unreadable_dirs += 1

    for root, dirnames, filenames in os.walk(
        directory, onerror=_on_error, followlinks=False
    ):
        dirnames[:] = sorted(
            d
            for d in dirnames
            if d not in UNSCANNED_DIRECTORIES
            and not d.startswith(".")
            and not os.path.islink(os.path.join(root, d))
        )
        relative_root = os.path.relpath(root, directory)
        for name in sorted(filenames):
            if not wanted(name):
                continue
            relative = name if relative_root == "." else os.path.join(relative_root, name)
            files.append(
                (os.path.join(root, name), relative.replace(os.sep, "/"))
            )
    return files, unreadable_dirs


def _is_python(name: str) -> bool:
    return name.endswith(".py")


def _is_card_source(name: str) -> bool:
    # A .d.ts declares the API rather than calling it, so it can only produce
    # a finding nobody can act on.
    return name.endswith(JS_SUFFIXES) and not name.endswith(".d.ts")


def _signature(
    files: list[tuple[str, str]],
    unreadable_dirs: int,
    fingerprint: str,
    max_files: int,
    max_bytes: int,
) -> tuple[Any, ...]:
    """What a cached result stays valid for: the same files, rules and caps."""
    newest_mtime = 0
    total_size = 0
    for absolute, _relative in files:
        try:
            stat = os.stat(absolute)
        except OSError:
            continue
        newest_mtime = max(newest_mtime, stat.st_mtime_ns)
        total_size += stat.st_size
    return (
        len(files),
        newest_mtime,
        total_size,
        unreadable_dirs,
        fingerprint,
        max_files,
        max_bytes,
    )


def _cached(
    cache: dict[str, tuple[tuple[Any, ...], dict[str, Any]]] | None,
    key: str,
    signature: tuple[Any, ...],
    compute: Callable[[], dict[str, Any]],
) -> tuple[dict[str, Any], bool]:
    """Reuse the stored result while its signature holds, else compute one."""
    if cache is not None and key in cache and cache[key][0] == signature:
        result = dict(cache[key][1])
        result["cached"] = True
        return result, True
    result = compute()
    if cache is not None:
        cache[key] = (signature, dict(result))
    return result, False


def _read_files(
    files: list[tuple[str, str]],
    *,
    max_files: int,
    max_bytes: int,
    counts: dict[str, int],
) -> Iterator[tuple[str, bytes]]:
    """Yield ``(relative, raw bytes)`` for every file inside the caps.

    Whatever it refuses is counted in ``counts``: anything past the caps under
    ``skipped_files``, anything the OS would not hand over under ``unreadable``.
    A truncated scan is never allowed to read as a clean one, so the caller
    turns those counts into a verdict.
    """
    for position, (absolute, relative) in enumerate(files):
        if position >= max_files:
            counts["skipped_files"] += len(files) - position
            return
        try:
            if os.path.getsize(absolute) > max_bytes:
                counts["skipped_files"] += 1
                continue
            with open(absolute, "rb") as handle:
                raw = handle.read()
        except OSError:
            counts["unreadable"] += 1
            continue
        # Outside the try: an OSError raised downstream is not a read failure.
        yield relative, raw


def _scan_domain(
    directory_name: str,
    files: list[tuple[str, str]],
    unreadable_dirs: int,
    rules: list[Any],
    *,
    max_files: int,
    max_bytes: int,
) -> dict[str, Any]:
    """Run the matchers over one component directory. Never raises.

    ``directory_name`` is the on-disk name, used in finding paths. The caller
    keys the result by the manifest domain, which can differ in a fork.
    """
    stats = ScanStats()
    findings: list[dict[str, Any]] = []
    counts = {"skipped_files": 0, "unreadable": 0}

    for relative, source in _read_files(
        files, max_files=max_files, max_bytes=max_bytes, counts=counts
    ):
        scan_path = f"custom_components/{directory_name}/{relative}"
        findings.extend(
            finding.to_dict() for finding in match_source(scan_path, source, rules, stats)
        )

    skipped_files = counts["skipped_files"]
    unparsed = len(stats.syntax_errors) + counts["unreadable"]
    reason = ""
    if findings:
        status = "affected"
    elif not rules:
        # Nothing to look for means nothing was proven, so a degraded index
        # can never launder an installation as clean.
        status = "unknown"
        reason = "the index shipped no matchable rules"
    elif unreadable_dirs:
        status = "unknown"
        reason = "directory could not be fully read"
    elif unparsed:
        status = "unknown"
        reason = (
            f"{unparsed} of {len(files)} Python file(s) could not be parsed"
        )
    elif skipped_files:
        status = "unknown"
        reason = (
            f"scan truncated: {skipped_files} of {len(files)} Python file(s) "
            "skipped by the size caps"
        )
    else:
        status = "clean"

    return {
        "status": status,
        "reason": reason,
        "findings": findings,
        "files_scanned": stats.files_scanned,
        "unparsed_files": unparsed,
        "skipped_files": skipped_files,
        "cached": False,
    }


def scan_installed(
    custom_components_dir: str,
    rules_payload: list[dict[str, Any]],
    *,
    current_version: str,
    max_files: int = 400,
    max_bytes: int = 1_000_000,
    cache: dict[str, tuple[tuple[Any, ...], dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    """Scan every installed integration's source against the index rules.

    Results are keyed by manifest domain, so a fork with a renamed directory
    still lines up with discovery and the index. Rules are applied regardless
    of tense; build_report levels them against the running version, since a
    deadline that has already passed is the most urgent thing to report.

    A symlinked component directory is followed (the dev-checkout pattern),
    its symlinked subdirectories are not. ``cache`` maps domain to
    (signature, result), keyed on file count, newest mtime, size and the rules
    fingerprint, so a refresh re-parses only what changed.
    """
    fingerprint = _rules_fingerprint(rules_payload, current_version)
    rules = [rule for rule in load_rules(rules_payload) if rule.matchable]

    domains: dict[str, dict[str, Any]] = {}
    totals = {"files_scanned": 0, "unparsed_files": 0, "skipped_files": 0}
    cached_domains = 0

    try:
        entries = sorted(os.scandir(custom_components_dir), key=lambda e: e.name)
    except OSError:
        entries = []

    for entry in entries:
        try:
            if (
                not entry.is_dir()
                or entry.name in IGNORED_DIRECTORIES
                or entry.name.startswith(".")
            ):
                continue
        except OSError:
            continue

        domain = _manifest_domain(entry.path, entry.name)
        files, unreadable_dirs = _walk(entry.path, _is_python)
        result, was_cached = _cached(
            cache,
            domain,
            _signature(files, unreadable_dirs, fingerprint, max_files, max_bytes),
            lambda: _scan_domain(
                entry.name,
                files,
                unreadable_dirs,
                rules,
                max_files=max_files,
                max_bytes=max_bytes,
            ),
        )
        cached_domains += was_cached

        domains[domain] = result
        totals["files_scanned"] += result["files_scanned"]
        totals["unparsed_files"] += result["unparsed_files"]
        totals["skipped_files"] += result["skipped_files"]

    return {
        "domains": domains,
        "files_scanned": totals["files_scanned"],
        "unparsed_files": totals["unparsed_files"],
        "skipped_files": totals["skipped_files"],
        "cached_domains": cached_domains,
        "rules_matchable": len(rules),
        # Which rules this engine could actually run. A "clean" verdict only
        # speaks for these; report.py keeps an index finding whose rule is not
        # in here, which is what happens when the index ships a matcher type
        # this vendored engine predates.
        "rule_ids": sorted(rule.id for rule in rules),
        "rules_fingerprint": fingerprint,
        "engine_version": ENGINE_VERSION,
    }


def _scan_card(
    card_name: str,
    files: list[tuple[str, str]],
    unreadable_dirs: int,
    rules: list[Any],
    *,
    max_files: int,
    max_bytes: int,
) -> dict[str, Any]:
    """Run the js matchers over one installed card. Never raises.

    HACS usually installs a card as its released, minified bundle, which the
    matchers refuse to guess at. Such a card comes back ``unknown`` with the
    skip counted, and the report falls back to the index's verdict on the
    card's source repository.
    """
    stats = ScanStats()
    findings: list[Any] = []
    counts = {"skipped_files": 0, "unreadable": 0}
    skipped_minified = 0

    for relative, raw in _read_files(
        files, max_files=max_files, max_bytes=max_bytes, counts=counts
    ):
        scan_path = f"www/community/{card_name}/{relative}"
        text = raw.decode("utf-8", "replace")
        if looks_minified_js(scan_path, text):
            skipped_minified += 1
            continue
        findings.extend(match_js_source(scan_path, text, rules, stats))

    findings = [finding.to_dict() for finding in dedupe_js_findings(findings)]
    skipped_files = counts["skipped_files"]
    unparsed = len(stats.syntax_errors) + counts["unreadable"]
    reason = ""
    if findings:
        status = "affected"
    elif not rules:
        status = "unknown"
        reason = "the index shipped no card rules"
    elif skipped_minified and stats.files_scanned == 0:
        status = "unknown"
        reason = (
            f"only minified bundles installed ({skipped_minified} skipped); "
            "the source repository's verdict applies"
        )
    elif unreadable_dirs:
        status = "unknown"
        reason = "directory could not be fully read"
    elif unparsed:
        status = "unknown"
        reason = f"{unparsed} of {len(files)} card file(s) could not be read"
    elif skipped_minified or skipped_files:
        status = "unknown"
        skipped = []
        if skipped_minified:
            skipped.append(f"{skipped_minified} minified")
        if skipped_files:
            skipped.append(f"{skipped_files} over the size caps")
        reason = (
            f"scan truncated: {' and '.join(skipped)} of {len(files)} "
            "card file(s) skipped"
        )
    else:
        status = "clean"

    return {
        "status": status,
        "reason": reason,
        "findings": findings,
        "files_scanned": stats.files_scanned,
        "unparsed_files": unparsed,
        "skipped_files": skipped_files,
        "skipped_minified": skipped_minified,
        "cached": False,
    }


def scan_cards(
    community_dir: str,
    rules_payload: list[dict[str, Any]],
    *,
    current_version: str,
    max_files: int = 100,
    max_bytes: int = 2_000_000,
    cache: dict[str, tuple[tuple[Any, ...], dict[str, Any]]] | None = None,
) -> dict[str, Any]:
    """Scan every card HACS installed under ``www/community``.

    The same shape as :func:`scan_installed`, keyed by the card's directory
    name, which is also the repository basename the index's plugin entries
    are joined on.
    """
    fingerprint = _rules_fingerprint(rules_payload, current_version)
    rules = [
        rule
        for rule in load_rules(rules_payload)
        if rule.matchable and rule.match.get("type") == "js"
    ]

    cards: dict[str, dict[str, Any]] = {}
    totals = {
        "files_scanned": 0,
        "unparsed_files": 0,
        "skipped_files": 0,
        "skipped_minified": 0,
    }
    cached_cards = 0

    try:
        entries = sorted(os.scandir(community_dir), key=lambda e: e.name)
    except OSError:
        entries = []

    for entry in entries:
        try:
            if not entry.is_dir() or entry.name.startswith("."):
                continue
        except OSError:
            continue

        files, unreadable_dirs = _walk(entry.path, _is_card_source)
        result, was_cached = _cached(
            cache,
            # Namespaced: the integration scan shares this cache, and a card
            # can be named after a domain.
            f"card:{entry.name}",
            _signature(files, unreadable_dirs, fingerprint, max_files, max_bytes),
            lambda: _scan_card(
                entry.name,
                files,
                unreadable_dirs,
                rules,
                max_files=max_files,
                max_bytes=max_bytes,
            ),
        )
        cached_cards += was_cached

        cards[entry.name] = result
        for key in totals:
            totals[key] += result.get(key, 0)

    return {
        "cards": cards,
        **totals,
        "cached_cards": cached_cards,
        "rules_matchable": len(rules),
        "rule_ids": sorted(rule.id for rule in rules),
        "rules_fingerprint": fingerprint,
        "engine_version": ENGINE_VERSION,
    }
