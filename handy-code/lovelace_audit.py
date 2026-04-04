#!/usr/bin/env python3
"""
HAOS Master Lovelace Audit Script
================================

Audits Lovelace custom cards/resources across:
- UI-managed dashboards (.storage/lovelace*)
- UI-managed resources (.storage/lovelace_resources or .storage/lovelace.resources)
- YAML dashboards (your ui-config.yaml files), INCLUDING recursive !include / !include_dir_* chains
- Installed JS files under /config/www/** (including /config/www/community/**)

Outputs:
1) Unique custom card types used (custom:*) with where they are used (UI and YAML files)
2) Referenced resource URLs (UI + YAML)
3) Configured resources missing on disk
4) Installed JS files not referenced by any UI/YAML resource (cleanup candidates)
   *Folder-safe rule:* if ANY JS file in a folder is referenced, NO other JS files in that folder are listed.
5) Best-effort mapping: custom:card-type -> possible installed JS files (heuristic)

Notes:
- YAML parsing is "good enough" scanning (no PyYAML required) and follows HA-style includes.
- External resources (http/https) are listed but not checked on disk.

Run on HAOS via Terminal/SSH add-on:
  python3 lovelace_audit.py

Exit code:
  0 = no missing configured resources
  1 = missing configured resources found
  2 = script error / missing critical files
"""

from __future__ import annotations

import os
import re
import json
import glob
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

# ----------------------------
# CONFIG: Paths to scan
# ----------------------------
STORAGE_DIR = "/config/.storage"
WWW_DIR = "/config/www"
COMMUNITY_DIR = os.path.join(WWW_DIR, "community")

YAML_DASHBOARDS = [
    "/config/ui/dashboards/browser/ui-config.yaml",
    "/config/ui/dashboards/kiosk/ui-config.yaml",
    "/config/ui/dashboards/mobile/ui-config.yaml",
]

UI_RES_FILES = [
    "/config/.storage/lovelace_resources",  # your schema: data.items
    "/config/.storage/lovelace.resources",  # older schema: data.resources
]

JS_EXTENSIONS = (".js", ".mjs")


# ----------------------------
# URL helpers
# ----------------------------
def strip_query(url: str) -> str:
    return url.split("?", 1)[0].strip()


def is_external(url: str) -> bool:
    u = url.strip()
    return u.startswith("http://") or u.startswith("https://") or u.startswith("//")


def url_to_disk_path(url: str) -> Optional[str]:
    """
    Map Lovelace resource URL -> expected disk path on HAOS.
    Handles:
      /local/...      -> /config/www/...
      /hacsfiles/...  -> /config/www/community/...
      /<folder>/x.js  -> /config/www/<folder>/x.js  (manual root-served assets)
    """
    u = strip_query(url)
    if is_external(u):
        return None

    if u.startswith("/local/"):
        return os.path.normpath(os.path.join(WWW_DIR, u[len("/local/"):]))

    if u.startswith("/hacsfiles/"):
        return os.path.normpath(os.path.join(COMMUNITY_DIR, u[len("/hacsfiles/"):]))

    if u.startswith("/") and "://" not in u and not u.startswith("//"):
        return os.path.normpath(os.path.join(WWW_DIR, u.lstrip("/")))

    return None


def disk_path_to_candidate_urls(path: str) -> Set[str]:
    """
    Given a JS file on disk, generate common URL forms that might reference it.
    """
    p = os.path.normpath(path)
    urls: Set[str] = set()

    comm_prefix = os.path.normpath(COMMUNITY_DIR) + os.sep
    www_prefix = os.path.normpath(WWW_DIR) + os.sep

    if p.startswith(comm_prefix):
        rel = p[len(comm_prefix):].replace(os.sep, "/")
        urls.add(f"/hacsfiles/{rel}")
        urls.add(f"/local/community/{rel}")
        return urls

    if p.startswith(www_prefix):
        rel = p[len(www_prefix):].replace(os.sep, "/")
        urls.add(f"/local/{rel}")
        urls.add(f"/{rel}")
        return urls

    return urls


# ----------------------------
# Disk inventory
# ----------------------------
def list_installed_js_files() -> Set[str]:
    out: Set[str] = set()
    if not os.path.isdir(WWW_DIR):
        return out

    for p in glob.glob(os.path.join(WWW_DIR, "**", "*"), recursive=True):
        if not os.path.isfile(p):
            continue
        lp = p.lower()
        if lp.endswith(".js.map"):
            continue
        if not lp.endswith(JS_EXTENSIONS):
            continue
        out.add(os.path.normpath(p))
    return out


# ----------------------------
# UI dashboard JSON scanning (custom card types)
# ----------------------------
def walk_json_for_custom_types(obj: Any, found: Dict[str, Set[str]], source: str) -> None:
    if isinstance(obj, dict):
        t = obj.get("type")
        if isinstance(t, str) and t.startswith("custom:"):
            found[t].add(source)
        for v in obj.values():
            walk_json_for_custom_types(v, found, source)
    elif isinstance(obj, list):
        for v in obj:
            walk_json_for_custom_types(v, found, source)


def extract_ui_custom_types(found: Dict[str, Set[str]]) -> None:
    # Scan all lovelace-related storage files
    for p in glob.glob(os.path.join(STORAGE_DIR, "lovelace*")):
        if not os.path.isfile(p):
            continue
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            walk_json_for_custom_types(data, found, f"ui:{os.path.basename(p)}")
        except Exception:
            continue


# ----------------------------
# YAML scanning with recursive includes
# ----------------------------
CUSTOM_TYPE_RE = re.compile(
    r"(?m)^\s*type\s*:\s*['\"]?(custom:[A-Za-z0-9_\-./]+)['\"]?\s*(?:#.*)?$"
)

# Matches: !include foo.yaml, !include_dir_named dir, !include_dir_merge_list dir, etc.
INCLUDE_RE = re.compile(
    r"(?m)!\s*include(?:_dir_named|_dir_merge_named|_dir_list|_dir_merge_list)?\s+([^\s#]+)"
)

# URLs ending in .js/.mjs (optionally with query); find /local, /hacsfiles, and external.
RESOURCE_URL_RE = re.compile(
    r"(/local/[A-Za-z0-9_\-./]+?\.(?:js|mjs)(?:\?[^'\"\s]+)?)|"
    r"(/hacsfiles/[A-Za-z0-9_\-./]+?\.(?:js|mjs)(?:\?[^'\"\s]+)?)|"
    r"(https?://[^\s'\"<>]+?\.(?:js|mjs)(?:\?[^'\"\s]+)?)",
    flags=re.IGNORECASE,
)


def _resolve_path(base_file: str, maybe_rel: str) -> str:
    rel = maybe_rel.strip().strip("'\"")
    if rel.startswith("/"):
        return rel
    return os.path.normpath(os.path.join(os.path.dirname(base_file), rel))


def _expand_include(base_file: str, include_target: str) -> List[str]:
    p = _resolve_path(base_file, include_target)
    out: List[str] = []
    if os.path.isfile(p):
        out.append(p)
    elif os.path.isdir(p):
        for root, _, files in os.walk(p):
            for fn in files:
                if fn.lower().endswith((".yaml", ".yml")):
                    out.append(os.path.join(root, fn))
    return out


def scan_yaml_recursive(
    path: str,
    custom_found: Dict[str, Set[str]],
    resource_urls: Set[str],
    visited: Set[str],
) -> None:
    path = os.path.normpath(path)
    if path in visited:
        return
    visited.add(path)

    if not os.path.isfile(path):
        return

    try:
        text = open(path, "r", encoding="utf-8", errors="ignore").read()
    except Exception:
        return

    # custom card types
    for m in CUSTOM_TYPE_RE.finditer(text):
        custom_found[m.group(1)].add(f"yaml:{path}")

    # resource URLs via url: lines
    for m in re.finditer(r"(?m)^\s*url\s*:\s*(['\"]?)(.+?)\1\s*$", text):
        val = m.group(2).strip()
        if val:
            resource_urls.add(val)

    # resource URLs inline
    for m in RESOURCE_URL_RE.finditer(text):
        g = next((x for x in m.groups() if x), None)
        if g:
            resource_urls.add(g)

    # follow includes
    for m in INCLUDE_RE.finditer(text):
        inc = m.group(1)
        for child in _expand_include(path, inc):
            scan_yaml_recursive(child, custom_found, resource_urls, visited)


# ----------------------------
# UI resources extraction
# ----------------------------
@dataclass(frozen=True)
class Ref:
    url: str
    source: str  # ui:<file> or yaml:<path>/<bucket>


def extract_ui_resource_refs() -> List[Ref]:
    refs: List[Ref] = []
    for fpath in UI_RES_FILES:
        if not os.path.isfile(fpath):
            continue
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            continue

        d = data.get("data", {})
        if not isinstance(d, dict):
            continue

        items = None
        if isinstance(d.get("items"), list):
            items = d["items"]           # lovelace_resources schema
        elif isinstance(d.get("resources"), list):
            items = d["resources"]       # lovelace.resources schema
        else:
            # Fallback: any list of dicts containing url
            for v in d.values():
                if isinstance(v, list) and any(isinstance(x, dict) and "url" in x for x in v):
                    items = v
                    break

        if not items:
            continue

        for it in items:
            if isinstance(it, dict):
                url = it.get("url")
                if isinstance(url, str) and url.strip():
                    refs.append(Ref(url=url.strip(), source=f"ui:{os.path.basename(fpath)}"))
    return refs


# ----------------------------
# Heuristic mapping: custom:xyz -> possible JS files
# ----------------------------
def normalize_token(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def guess_js_for_custom_type(custom_type: str, installed_js: Set[str]) -> List[str]:
    name = custom_type.split("custom:", 1)[1]
    tok = normalize_token(name)
    matches: List[str] = []
    for p in installed_js:
        base = os.path.basename(p)
        folder = os.path.basename(os.path.dirname(p))
        hay = normalize_token(base + " " + folder)
        if tok and tok in hay:
            matches.append(p)
    return sorted(matches)[:10]


# ----------------------------
# Main
# ----------------------------
def main() -> int:
    installed_js = list_installed_js_files()

    # Candidate URL->path mapping for installed files
    installed_url_to_path: Dict[str, str] = {}
    for p in installed_js:
        for u in disk_path_to_candidate_urls(p):
            installed_url_to_path[strip_query(u)] = p

    # 1) Custom card types used (UI + YAML)
    custom_types: Dict[str, Set[str]] = defaultdict(set)
    extract_ui_custom_types(custom_types)

    yaml_resource_urls: Set[str] = set()
    visited: Set[str] = set()
    for y in YAML_DASHBOARDS:
        scan_yaml_recursive(y, custom_types, yaml_resource_urls, visited)

    # 2) Resource references (UI + YAML)
    refs: List[Ref] = []
    refs.extend(extract_ui_resource_refs())
    for u in sorted(yaml_resource_urls):
        refs.append(Ref(url=u, source="yaml:dashboards"))

    # De-dupe refs by (stripped_url, source)
    seen = set()
    uniq_refs: List[Ref] = []
    for r in refs:
        key = (strip_query(r.url), r.source)
        if key not in seen:
            seen.add(key)
            uniq_refs.append(r)

    # 3) Missing configured resources + referenced disk paths
    missing_configured: List[Tuple[str, str, str]] = []  # url, expected_path, source
    referenced_disk_paths: Set[str] = set()
    external_refs: List[Tuple[str, str]] = []

    for r in uniq_refs:
        u = strip_query(r.url)

        if is_external(u):
            external_refs.append((u, r.source))
            continue

        expected = url_to_disk_path(u)
        if expected:
            if os.path.isfile(expected):
                referenced_disk_paths.add(os.path.normpath(expected))
            else:
                missing_configured.append((u, expected, r.source))
                # still try candidate mapping (handles /local vs /hacsfiles mismatches)
                p2 = installed_url_to_path.get(u)
                if p2:
                    referenced_disk_paths.add(os.path.normpath(p2))
        else:
            p2 = installed_url_to_path.get(u)
            if p2:
                referenced_disk_paths.add(os.path.normpath(p2))

    missing_configured = sorted(set(missing_configured), key=lambda x: x[0])

    # 4) Installed JS not referenced anywhere (Folder-safe rule)
    referenced_dirs = {os.path.dirname(p) for p in referenced_disk_paths}
    unused_installed_raw = installed_js - referenced_disk_paths
    unused_installed = sorted(
        p for p in unused_installed_raw
        if os.path.dirname(p) not in referenced_dirs
    )

    # ----------------------------
    # Output
    # ----------------------------
    print("=== Lovelace Master Audit (UI + YAML) ===\n")
    print(f"Installed JS files under {WWW_DIR}: {len(installed_js)}")
    print(f"Custom card types used (custom:*): {len(custom_types)}")
    print(f"Resource URLs referenced (UI+YAML): {len({strip_query(r.url) for r in uniq_refs})}")
    print(f"YAML files scanned (recursive includes): {len(visited)}")
    print()

    print("== 1) Unique custom card types used ==")
    for c in sorted(custom_types.keys()):
        sources = ", ".join(sorted(custom_types[c]))
        print(f"- {c}\n    used in: {sources}")
    print()

    print("== 2) Referenced resource URLs (UI + YAML) ==")
    for u in sorted({strip_query(r.url) for r in uniq_refs}):
        print(f"- {u}")
    print()

    print("== 3) Configured resources missing on disk ==")
    if missing_configured:
        for url, path, source in missing_configured:
            print(f"- {url}\n    -> {path}\n    (from {source})")
    else:
        print("(none)")
    print()

    print("== 4) Installed JS not referenced by any UI/YAML resource (cleanup candidates) ==")
    print("(Folder-safe: if any file in a folder is used, other files in that folder are NOT listed.)")
    if unused_installed:
        for p in unused_installed[:250]:
            print(f"- {p}")
        if len(unused_installed) > 250:
            print(f"... and {len(unused_installed) - 250} more")
    else:
        print("(none)")
    print()

    print("== 5) External resource URLs (not checked) ==")
    if external_refs:
        for url, src in sorted(external_refs):
            print(f"- {url}\n    (from {src})")
    else:
        print("(none)")
    print()

    print("== 6) Best-effort mapping: custom card type -> possible installed JS files ==")
    print("(Heuristic only. Useful for hints, not proof.)")
    for c in sorted(custom_types.keys()):
        guesses = guess_js_for_custom_type(c, installed_js)
        if guesses:
            print(f"- {c}")
            for g in guesses:
                print(f"    -> {g}")
    print()

    return 1 if missing_configured else 0


if __name__ == "__main__":
    raise SystemExit(main())
