"""Helper functions for the Default Config Disabler integration."""

from __future__ import annotations

import json
import os

import homeassistant.components as ha_components


def get_default_config_components() -> list[str]:
    """Return a list of components in the default_config."""
    default_config_manifest_path = os.path.join(
        os.path.dirname(os.path.realpath(ha_components.__file__)),
        "default_config",
        "manifest.json",
    )
    with open(default_config_manifest_path, encoding="utf-8") as f:
        return json.load(f).get("dependencies", [])
