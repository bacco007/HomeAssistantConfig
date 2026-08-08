"""Pure logic shared by the coordinator and the sensor.

Deliberately free of any ``homeassistant`` import so the exact code that runs on
a real box can be unit-tested without a Home Assistant install. Nothing here
touches the network; ``build_report`` is a pure function of (index, installed).
"""

from __future__ import annotations

import json
import os
from typing import Any

from .const import MAX_DETAILS, SUPPORTED_SCHEMA

#: Never treat these as installed custom integrations.
_IGNORED_DIRECTORIES = frozenset({"__pycache__", ".git", ".github"})


def discover_installed(custom_components_dir: str) -> dict[str, str]:
    """Return ``{domain: version}`` for every custom integration on disk.

    Blocking I/O -- call from an executor. A directory without a readable
    ``manifest.json`` still counts as installed (version ``""``), because HACS
    repositories occasionally ship a malformed manifest and the user still wants
    to know the component is there.
    """
    installed: dict[str, str] = {}
    try:
        entries = sorted(os.scandir(custom_components_dir), key=lambda e: e.name)
    except (FileNotFoundError, NotADirectoryError, PermissionError, OSError):
        return installed

    for entry in entries:
        try:
            if not entry.is_dir() or entry.name in _IGNORED_DIRECTORIES:
                continue
            if entry.name.startswith("."):
                continue
        except OSError:
            continue

        domain = entry.name
        version = ""
        manifest_path = os.path.join(entry.path, "manifest.json")
        try:
            with open(manifest_path, encoding="utf-8") as handle:
                manifest = json.load(handle)
            if isinstance(manifest, dict):
                domain = manifest.get("domain") or entry.name
                version = str(manifest.get("version") or "")
        except (OSError, json.JSONDecodeError, UnicodeDecodeError):
            pass
        installed[domain] = version
    return installed


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
    index: dict[str, Any], installed: dict[str, str]
) -> dict[str, Any]:
    """Match installed custom integrations against the published index.

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
    unreachable = set(index.get("unreachable_domains") or [])

    by_release: dict[str, list[str]] = {}
    details: list[dict[str, Any]] = []
    affected: list[str] = []
    clean: list[str] = []
    unknown: list[str] = []
    self_domain = "breakage_radar"

    for domain in sorted(installed):
        if domain == self_domain:
            continue
        entry = affected_by_domain.get(domain)
        if entry is None:
            if domain in clean_domains:
                clean.append(domain)
            elif domain in unreachable:
                unknown.append(domain)
            else:
                unknown.append(domain)
            continue

        findings = [f for f in entry.get("findings", []) if isinstance(f, dict)]
        if not findings:
            clean.append(domain)
            continue

        affected.append(domain)
        for finding in findings:
            release = str(finding.get("breaks_in", ""))
            bucket = by_release.setdefault(release, [])
            if domain not in bucket:
                bucket.append(domain)
            rule = rules.get(finding.get("rule_id"), {})
            details.append(
                {
                    "domain": domain,
                    "rule_id": finding.get("rule_id", ""),
                    "breaks_in": release,
                    "file": finding.get("file", ""),
                    "line": finding.get("line", 0),
                    "confidence": finding.get("confidence", ""),
                    "repository": entry.get("full_name", ""),
                    "scanned_version": entry.get("version", ""),
                    "installed_version": installed.get(domain, ""),
                    "message": (rule.get("message") or "")[:300],
                    "learn_more": rule.get("source", ""),
                }
            )

    details.sort(key=lambda d: (d["breaks_in"], d["domain"], d["file"], d["line"]))
    truncated = len(details) > MAX_DETAILS

    return {
        "affected_count": len(affected),
        "affected_domains": affected,
        "by_release": {
            release: sorted(domains)
            for release, domains in sorted(by_release.items())
        },
        "details": details[:MAX_DETAILS],
        "details_truncated": truncated,
        "total_findings": len(details),
        "installed_count": len([d for d in installed if d != self_domain]),
        "clean_domains": clean,
        "not_in_index": unknown,
        "index_generated_utc": index.get("generated_utc", ""),
        "index_core_version": index.get("core_version", ""),
        "index_schema": index.get("schema"),
        "earliest_release": min(by_release) if by_release else None,
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
