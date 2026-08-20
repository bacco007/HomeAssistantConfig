"""Finds the custom integrations installed on this system.

Blocking I/O, so call from an executor. The domain a component declares in its
manifest is the key the scan, the index lookup and the report all join on; a
fork can have a directory name that differs from it, so it is resolved here
and nowhere else.
"""

from __future__ import annotations

import json
import os

IGNORED_DIRECTORIES = frozenset({"__pycache__", ".git", ".github"})


def discover_installed(custom_components_dir: str) -> dict[str, str]:
    """Return ``{domain: version}`` for every custom integration on disk.

    A component whose manifest is missing or malformed still counts as
    installed, with an empty version.
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


def discover_cards(community_dir: str) -> list[str]:
    """Directory names under ``www/community``, where HACS installs Lovelace
    cards and other frontend plugins. One directory per repository, named by
    the repository basename, which is what the index's plugin entries join on.
    """
    try:
        entries = sorted(os.scandir(community_dir), key=lambda e: e.name)
    except (FileNotFoundError, NotADirectoryError, PermissionError, OSError):
        return []

    cards: list[str] = []
    for entry in entries:
        try:
            if entry.is_dir() and not entry.name.startswith("."):
                cards.append(entry.name)
        except OSError:
            continue
    return cards


def _manifest_domain(directory: str, fallback: str) -> str:
    """The domain a component declares, falling back to its directory name."""
    try:
        with open(os.path.join(directory, "manifest.json"), encoding="utf-8") as handle:
            manifest = json.load(handle)
        if isinstance(manifest, dict) and manifest.get("domain"):
            return str(manifest["domain"])
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        pass
    return fallback
