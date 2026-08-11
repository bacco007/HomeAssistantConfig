"""Running the rule matchers over installed integrations' own source.

Free of any ``homeassistant`` import; blocking I/O, so call from an executor.
This is what gives forked, renamed and non-HACS integrations a real verdict
instead of "not in the index" -- the matchers run over the exact installed
bytes, which also removes any scanned-version/installed-version skew.

Problems are counted, never raised. A domain whose files cannot be parsed comes
back ``unknown`` with a reason, and a truncated scan never reads as ``clean``:
a scan that checked nothing has proven nothing.
"""

from __future__ import annotations

import hashlib
import json
import os
from typing import Any

from .discovery import IGNORED_DIRECTORIES, _manifest_domain
from .rules_engine import ENGINE_VERSION, ScanStats, load_rules, match_source

#: Directories the local scan never descends into -- the same vendored code the
#: crawler's ``VENDOR_MARKERS`` excludes, so both sides judge the same files.
UNSCANNED_DIRECTORIES = IGNORED_DIRECTORIES | frozenset(
    {"site-packages", "node_modules", "vendor"}
)


def _rules_fingerprint(rules_payload: list[dict[str, Any]], current_version: str) -> str:
    """A stable hash of everything that can change a scan's outcome.

    Folding in :data:`ENGINE_VERSION` and ``current_version`` means a rules
    update, an engine semantics change *or* a Home Assistant upgrade (which can
    move rules in or out of the future) all invalidate the cache, never leaving
    stale findings behind.
    """
    digest = hashlib.sha256()
    digest.update(f"engine={ENGINE_VERSION};current={current_version};".encode())
    digest.update(json.dumps(rules_payload, sort_keys=True, default=str).encode())
    return digest.hexdigest()[:16]


def _domain_python_files(domain_dir: str) -> tuple[list[tuple[str, str]], int]:
    """``[(absolute_path, relative_posix_path)]`` for every ``*.py``, plus a
    count of directories the walk could not enter.

    ``__pycache__`` and symlinked directories are never descended into, so a
    link pointing back up the tree cannot loop the scan or double-count files.
    """
    files: list[tuple[str, str]] = []
    unreadable_dirs = 0

    def _on_error(_err: OSError) -> None:
        nonlocal unreadable_dirs
        unreadable_dirs += 1

    for root, dirnames, filenames in os.walk(
        domain_dir, onerror=_on_error, followlinks=False
    ):
        dirnames[:] = sorted(
            d
            for d in dirnames
            if d not in UNSCANNED_DIRECTORIES
            and not d.startswith(".")
            and not os.path.islink(os.path.join(root, d))
        )
        relative_root = os.path.relpath(root, domain_dir)
        for name in sorted(filenames):
            if not name.endswith(".py"):
                continue
            relative = name if relative_root == "." else os.path.join(relative_root, name)
            files.append(
                (os.path.join(root, name), relative.replace(os.sep, "/"))
            )
    return files, unreadable_dirs


def _scan_domain(
    directory_name: str,
    files: list[tuple[str, str]],
    unreadable_dirs: int,
    rules: list[Any],
    *,
    max_files: int,
    max_bytes: int,
) -> dict[str, Any]:
    """Run the matchers over one installed component directory. Never raises.

    ``directory_name`` is the on-disk name, which is what finding paths show;
    the caller keys the result by the manifest-declared domain, which can
    differ in a forked checkout.
    """
    stats = ScanStats()
    findings: list[dict[str, Any]] = []
    unreadable_files = 0
    skipped_files = 0

    for position, (absolute, relative) in enumerate(files):
        if position >= max_files:
            skipped_files += len(files) - position
            break
        scan_path = f"custom_components/{directory_name}/{relative}"
        try:
            if os.path.getsize(absolute) > max_bytes:
                skipped_files += 1
                continue
            with open(absolute, "rb") as handle:
                source = handle.read()
        except OSError:
            unreadable_files += 1
            continue
        findings.extend(
            finding.to_dict() for finding in match_source(scan_path, source, rules, stats)
        )

    unparsed = len(stats.syntax_errors) + unreadable_files
    reason = ""
    if findings:
        status = "affected"
    elif not rules:
        # A scan with nothing to look for has proven nothing. Never let a
        # degraded index launder every installation as clean.
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
        # Zero findings with every file parsed -- including the trivial case of
        # a component that ships no Python at all.
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
    """Scan every installed custom integration's own source with the index rules.

    Blocking I/O -- call from an executor. This is what gives forked, renamed
    and non-HACS integrations a real verdict instead of ``not_in_index``: the
    matchers run over the exact installed bytes, so there is no
    scanned-version/installed-version skew either.

    Every matchable rule is applied regardless of tense: a rule whose deadline
    has already passed is the *most* urgent thing to report, so it is never
    filtered out here -- :func:`build_report` classifies each finding as
    ``upcoming`` or ``broken_now`` against the running version instead.
    Results are keyed by the domain each component's manifest declares (the
    same key :func:`discover_installed` uses), so a forked or renamed checkout
    still matches up. A symlinked component directory is followed at the top
    level -- the dev-checkout pattern -- while symlinked *subdirectories* are
    still never descended into.

    ``cache`` maps ``domain -> (signature, result)`` where the signature covers
    the domain's file count, newest mtime, total size and the rules fingerprint;
    a 12-hourly refresh therefore re-parses nothing that has not changed.
    Problems are counted, never raised: a domain whose files cannot be parsed
    comes back ``unknown`` with a reason, and a truncated scan never reads as
    ``clean``.
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
        files, unreadable_dirs = _domain_python_files(entry.path)

        newest_mtime = 0
        total_size = 0
        for absolute, _relative in files:
            try:
                stat = os.stat(absolute)
            except OSError:
                continue
            newest_mtime = max(newest_mtime, stat.st_mtime_ns)
            total_size += stat.st_size
        signature = (
            len(files),
            newest_mtime,
            total_size,
            unreadable_dirs,
            fingerprint,
            max_files,
            max_bytes,
        )

        if cache is not None and domain in cache and cache[domain][0] == signature:
            result = dict(cache[domain][1])
            result["cached"] = True
            cached_domains += 1
        else:
            result = _scan_domain(
                entry.name,
                files,
                unreadable_dirs,
                rules,
                max_files=max_files,
                max_bytes=max_bytes,
            )
            if cache is not None:
                cache[domain] = (signature, dict(result))

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
        "rules_fingerprint": fingerprint,
        "engine_version": ENGINE_VERSION,
    }
