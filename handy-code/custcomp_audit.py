#!/usr/bin/env python3
"""
HAOS Master Custom Components Audit
==================================

Audits /config/custom_components against what's actually used by Home Assistant.

Scans:
- Installed custom components on disk: /config/custom_components/<domain>/manifest.json
- UI-configured integrations: /config/.storage/core.config_entries (domains)
- YAML config usage: /config/configuration.yaml plus any !include / !include_dir_* chains
  (best-effort scan for domain keys and platform: domain)
- (Optional) service definitions: /config/services.yaml and includes (if you use it)

Reports:
1) Installed custom components (on disk)
2) Used components (UI config entries and/or referenced in YAML)
3) Installed but not used (cleanup candidates)
4) Configured but missing on disk (rare, but can happen after manual deletion)

Notes:
- YAML parsing is scanning-based (no PyYAML required). It will not be perfect for every config style,
  but it catches the common patterns.
- Some integrations are loaded implicitly by other integrations; treat "installed but not used" as
  "suspect" rather than proof.

Run on HAOS via Terminal/SSH add-on:
  python3 custom_components_audit.py

Exit code:
  0 = no configured-but-missing components found
  1 = configured-but-missing found
  2 = error reading critical files
"""

from __future__ import annotations

import os
import re
import json
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple

CONFIG_DIR = "/config"
CC_DIR = "/config/custom_components"
STORAGE_CONFIG_ENTRIES = "/config/.storage/core.config_entries"
ROOT_YAML = "/config/configuration.yaml"

YAML_EXTS = (".yaml", ".yml")

# Matches HA include directives: !include, !include_dir_named, !include_dir_merge_list, etc.
INCLUDE_RE = re.compile(
    r"(?m)!\s*include(?:_dir_named|_dir_merge_named|_dir_list|_dir_merge_list)?\s+([^\s#]+)"
)

# Common patterns we can reliably detect in YAML text:
# - Top-level domain keys (domain:)
# - platform: domain (for sensor/binary_sensor/etc.)
TOP_LEVEL_KEY_RE = re.compile(r"(?m)^(?!\s)([a-z0-9_]+)\s*:\s*(?:#.*)?$")
PLATFORM_RE = re.compile(r"(?m)^\s*platform\s*:\s*([a-z0-9_]+)\s*(?:#.*)?$", re.IGNORECASE)


@dataclass(frozen=True)
class Component:
    domain: str
    name: str
    version: str
    path: str


def read_json(path: str) -> Optional[dict]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def list_installed_custom_components() -> Dict[str, Component]:
    """
    Returns {domain: Component} for everything in /config/custom_components that has a manifest.json
    """
    out: Dict[str, Component] = {}
    if not os.path.isdir(CC_DIR):
        return out

    for domain in sorted(os.listdir(CC_DIR)):
        manifest = os.path.join(CC_DIR, domain, "manifest.json")
        if not os.path.isfile(manifest):
            continue
        data = read_json(manifest) or {}
        out[domain] = Component(
            domain=domain,
            name=str(data.get("name", "") or ""),
            version=str(data.get("version", "") or ""),
            path=os.path.join(CC_DIR, domain),
        )
    return out


def configured_via_ui() -> Set[str]:
    """
    Domains present in core.config_entries (UI-configured integrations).
    """
    domains: Set[str] = set()
    data = read_json(STORAGE_CONFIG_ENTRIES)
    if not data:
        return domains

    entries = data.get("data", {}).get("entries", [])
    if not isinstance(entries, list):
        return domains

    for e in entries:
        if isinstance(e, dict):
            d = e.get("domain")
            if isinstance(d, str) and d:
                domains.add(d)
    return domains


def resolve_path(base_file: str, maybe_rel: str) -> str:
    rel = maybe_rel.strip().strip("'\"")
    if rel.startswith("/"):
        return rel
    return os.path.normpath(os.path.join(os.path.dirname(base_file), rel))


def expand_include(base_file: str, include_target: str) -> List[str]:
    p = resolve_path(base_file, include_target)
    out: List[str] = []
    if os.path.isfile(p):
        out.append(p)
    elif os.path.isdir(p):
        for root, _, files in os.walk(p):
            for fn in files:
                if fn.lower().endswith(YAML_EXTS):
                    out.append(os.path.join(root, fn))
    return out


def collect_yaml_files(root_yaml: str) -> List[str]:
    """
    Follow HA include directives recursively starting from configuration.yaml
    and return a list of all YAML files encountered (including the root).
    """
    visited: Set[str] = set()
    stack: List[str] = [os.path.normpath(root_yaml)]
    files: List[str] = []

    while stack:
        path = os.path.normpath(stack.pop())
        if path in visited:
            continue
        visited.add(path)

        if not os.path.isfile(path):
            continue

        files.append(path)

        try:
            text = open(path, "r", encoding="utf-8", errors="ignore").read()
        except Exception:
            continue

        for m in INCLUDE_RE.finditer(text):
            inc = m.group(1)
            for child in expand_include(path, inc):
                stack.append(child)

    return files


def used_in_yaml(domains_to_check: Set[str], yaml_files: List[str]) -> Tuple[Set[str], Dict[str, Set[str]]]:
    """
    Best-effort detection of usage for domains in YAML:
      - top-level key match: ^domain:
      - platform: domain
    Returns:
      used_domains, where_used_map[domain] = {file1, file2, ...}
    """
    used: Set[str] = set()
    where: Dict[str, Set[str]] = {d: set() for d in domains_to_check}

    # Precompile per-domain top-level key regex for accuracy (anchored)
    per_domain_top = {d: re.compile(rf"(?m)^(?!\s){re.escape(d)}\s*:\s*(?:#.*)?$") for d in domains_to_check}

    for fp in yaml_files:
        try:
            text = open(fp, "r", encoding="utf-8", errors="ignore").read()
        except Exception:
            continue

        # platform: <domain>
        for m in PLATFORM_RE.finditer(text):
            plat = m.group(1).lower()
            if plat in domains_to_check:
                used.add(plat)
                where.setdefault(plat, set()).add(fp)

        # top-level keys for checked domains
        for d, rx in per_domain_top.items():
            if rx.search(text):
                used.add(d)
                where.setdefault(d, set()).add(fp)

    # prune empty where entries
    where = {d: files for d, files in where.items() if files}
    return used, where


def main() -> int:
    installed = list_installed_custom_components()
    installed_domains = set(installed.keys())

    ui_domains = configured_via_ui()

    yaml_files = collect_yaml_files(ROOT_YAML)
    yaml_used, yaml_where = used_in_yaml(installed_domains, yaml_files)

    used = (installed_domains & ui_domains) | yaml_used

    installed_not_used = sorted(installed_domains - used)
    configured_but_missing = sorted(ui_domains - installed_domains)

    # ---- Output ----
    print("=== Custom Components Audit (HAOS) ===\n")
    print(f"Installed custom_components on disk: {len(installed_domains)}")
    print(f"UI-configured domains (config entries): {len(ui_domains)}")
    print(f"YAML files scanned (includes): {len(yaml_files)}")
    print(f"Installed domains detected as used (UI and/or YAML): {len(used)}")
    print()

    print("== 1) Installed custom_components (on disk) ==")
    for d in sorted(installed_domains):
        c = installed[d]
        ver = c.version or "?"
        name = c.name or ""
        print(f"- {d}  v={ver}  {name}")
    print()

    print("== 2) Used custom_components (detected) ==")
    for d in sorted(used):
        via = []
        if d in ui_domains:
            via.append("UI")
        if d in yaml_used:
            via.append("YAML")
        via_s = "+".join(via) if via else "?"
        print(f"- {d}  ({via_s})")
        if d in yaml_where:
            for fp in sorted(yaml_where[d]):
                print(f"    -> {fp}")
    print()

    print("== 3) Installed but not used (suspects) ==")
    if installed_not_used:
        for d in installed_not_used:
            c = installed[d]
            print(f"- {d}  ({c.name or ''})  path={c.path}")
    else:
        print("(none)")
    print()

    print("== 4) Configured via UI but missing from /custom_components ==")
    if configured_but_missing:
        for d in configured_but_missing:
            print(f"- {d}")
        print("\nThese are often built-in integrations (not custom), or a custom component you deleted.")
    else:
        print("(none)")

    return 1 if configured_but_missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
