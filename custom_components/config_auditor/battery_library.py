"""HACA Battery Library — autonomous battery-type lookup.

Provides battery_type and battery_quantity for a device given its
manufacturer/model from the HA device registry.

The seed library is bundled with the integration. Users can extend it
by editing the seed JSON file directly (path is shown in the panel).
For the most complete and up-to-date device coverage, users can install
the Battery Notes integration — HACA will automatically use its data
when present.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

_LOGGER = logging.getLogger(__name__)

_SEED_FILE_NAME = "battery_library_seed.json"


class BatteryLibrary:
    """Lookup of battery type/quantity by manufacturer + model.

    Reads from the bundled seed JSON. Users can override or extend the
    seed by placing their own ``battery_library_user.json`` next to it.
    """

    def __init__(self, hass) -> None:
        self.hass = hass
        self._entries: list[dict] = []
        self._loaded = False

    @property
    def _data_dir(self) -> str:
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

    @property
    def _seed_path(self) -> str:
        return os.path.join(self._data_dir, _SEED_FILE_NAME)

    async def async_load(self) -> None:
        """Load the seed file only — users add devices directly to it."""
        seed = await self.hass.async_add_executor_job(self._load_from_disk, self._seed_path)
        self._entries = seed or []
        self._loaded = bool(self._entries)
        _LOGGER.info("[HACA BatteryLib] Loaded %d entries", len(self._entries))

    def _load_from_disk(self, path: str) -> list[dict] | None:
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            entries = data.get("devices") or []
            return entries if isinstance(entries, list) else []
        except FileNotFoundError:
            return []
        except Exception as exc:
            _LOGGER.warning("[HACA BatteryLib] Failed to load %s: %s", path, exc)
            return []

    def lookup(self, manufacturer: str, model: str, hw_version: str = "") -> dict | None:
        """Return {'battery_type', 'battery_quantity'} or None if unknown."""
        if not manufacturer or not model:
            return None
        mfr = manufacturer.strip().lower()
        mdl = model.strip().lower()
        hw  = (hw_version or "").strip().lower()

        for entry in self._entries:
            e_mfr = str(entry.get("manufacturer", "")).strip().lower()
            e_mdl = str(entry.get("model", "")).strip().lower()
            if e_mfr != mfr:
                continue
            method = entry.get("model_match_method", "exact")
            if method == "exact" and e_mdl != mdl:
                continue
            if method == "startswith" and not mdl.startswith(e_mdl):
                continue
            if method == "endswith" and not mdl.endswith(e_mdl):
                continue
            if method == "contains" and e_mdl not in mdl:
                continue
            e_hw = str(entry.get("hw_version", "")).strip().lower()
            if e_hw and e_hw != hw:
                continue
            btype = entry.get("battery_type", "")
            if btype in ("MANUAL", ""):
                continue
            return {
                "battery_type": btype,
                "battery_quantity": int(entry.get("battery_quantity", 1) or 1),
            }
        return None

    @property
    def size(self) -> int:
        return len(self._entries)

    @property
    def seed_path(self) -> str:
        """Public path of the seed file (for the panel to display)."""
        return self._seed_path
