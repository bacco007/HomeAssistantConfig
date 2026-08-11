"""Finding the custom integrations installed on this system.

Free of any ``homeassistant`` import so it can be unit-tested without a Home
Assistant install. Blocking I/O -- call from an executor.

The domain a component *declares* in its ``manifest.json`` is the key
everything else joins on. A forked or renamed checkout has a directory name
that differs from its domain, so resolving it in one place is what stops a
finding being dropped between the scan and the report.
"""

from __future__ import annotations

import json
import os

#: Never treat these as installed custom integrations.
IGNORED_DIRECTORIES = frozenset({"__pycache__", ".git", ".github"})


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
            if not entry.is_dir() or entry.name in IGNORED_DIRECTORIES:
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


def _manifest_domain(directory: str, fallback: str) -> str:
    """The domain a component directory *declares*, falling back to its name.

    This is the same resolution :func:`discover_installed` uses, and it is what
    keeps a forked or renamed checkout matched up: the scan, the discovery and
    the index lookup must all speak the same key or a finding gets dropped
    between them.
    """
    try:
        with open(os.path.join(directory, "manifest.json"), encoding="utf-8") as handle:
            manifest = json.load(handle)
        if isinstance(manifest, dict) and manifest.get("domain"):
            return str(manifest["domain"])
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        pass
    return fallback
