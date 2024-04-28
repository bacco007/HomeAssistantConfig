"""Helper functions for the Default Config Disabler integration."""

from __future__ import annotations

import json
import os
import shutil

import homeassistant.components as ha_components

DEFAULT_CONFIG_DIR = os.path.join(
    os.path.dirname(os.path.realpath(ha_components.__file__)), "default_config"
)
DEFAULT_CONFIG_MANIFEST = os.path.join(DEFAULT_CONFIG_DIR, "manifest.json")
DEFAULT_CONFIG_MANIFEST_ORIGINAL = os.path.join(
    DEFAULT_CONFIG_DIR, "manifest.original.json"
)


def backup_original_default_config_manifest() -> bool:
    """Backup default_config/manifest.json to manifest.original.json."""
    if not os.path.exists(DEFAULT_CONFIG_MANIFEST_ORIGINAL):
        shutil.copyfile(DEFAULT_CONFIG_MANIFEST, DEFAULT_CONFIG_MANIFEST_ORIGINAL)
        return True
    return False


def restore_original_default_config_manifest() -> bool:
    """Restore default_config/manifest.json from manifest.original.json."""
    if os.path.exists(DEFAULT_CONFIG_MANIFEST_ORIGINAL):
        shutil.copyfile(DEFAULT_CONFIG_MANIFEST_ORIGINAL, DEFAULT_CONFIG_MANIFEST)
        os.remove(DEFAULT_CONFIG_MANIFEST_ORIGINAL)
        return True
    return False


def load_original_default_config_manifest() -> dict:
    """Load default_config/manifest.original.json."""
    with open(DEFAULT_CONFIG_MANIFEST_ORIGINAL, encoding="utf-8") as f:
        return json.load(f)


def load_default_config_manifest() -> dict:
    """Load default_config/manifest.json."""
    with open(DEFAULT_CONFIG_MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def save_default_config_manifest(manifest: dict) -> None:
    """Save manifest to default_config/manifest.json."""
    with open(DEFAULT_CONFIG_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)


def get_default_config_components() -> list[str]:
    """Return a list of components in the default_config."""
    backup_original_default_config_manifest()
    return load_original_default_config_manifest()["dependencies"]
