"""Add entities to ``recorder.exclude.entities`` in configuration.yaml.

Round-trips through ``ruamel.yaml`` so user comments and formatting are
preserved. A timestamped backup is written to ``<config>/.haca_backups/``
before any edit, ``homeassistant.check_config`` validates the result, and
the backup is restored automatically when validation fails.
"""
from __future__ import annotations

import logging
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import BACKUP_DIR

_LOGGER = logging.getLogger(__name__)


# ── Read helpers ────────────────────────────────────────────────────────────


def _config_yaml_path(hass: HomeAssistant) -> Path:
    return Path(hass.config.config_dir) / "configuration.yaml"


def _read_recorder_excluded_entities_sync(
    config_file: Path,
) -> tuple[set[str], bool]:
    """Read ``recorder.exclude.entities`` from configuration.yaml. I/O.

    Returns ``(entities, authoritative)``:

    - ``entities`` — set of entity ids in ``recorder.exclude.entities``
      (always a set, possibly empty).
    - ``authoritative`` — ``True`` iff configuration.yaml was parsed
      successfully AND the recorder section is a plain in-line mapping
      that we can read end-to-end. ``False`` if the file is missing,
      unparseable, or the recorder section is loaded via ``!include``
      (and is therefore opaque from this file).

    The ``authoritative`` flag matters for the noisy-entity filter:
    when ``True``, the caller should trust this set as the *single*
    source of truth (so removing an entity from configuration.yaml
    immediately makes the issue reappear at the next scan, without
    needing an HA restart). When ``False``, the caller should fall
    back to the runtime ``recorder.is_entity_recorded`` check, which
    reflects whatever the recorder loaded at startup.

    Uses PyYAML (always present in HA) with a SafeLoader subclass that
    short-circuits HA's custom tags (``!include``, ``!secret``,
    ``!env_var``, ``!include_dir_*``) to ``None`` so they don't make the
    whole file unparseable.
    """
    if not config_file.exists():
        return set(), False
    try:
        import yaml as _pyyaml  # noqa: PLC0415

        class _IgnoreUnknownTags(_pyyaml.SafeLoader):
            pass

        def _ignore_unknown(loader, _node):  # noqa: ANN001
            return None

        _IgnoreUnknownTags.add_constructor(None, _ignore_unknown)

        with open(config_file, encoding="utf-8") as f:
            data = _pyyaml.load(f, Loader=_IgnoreUnknownTags) or {}
    except Exception as exc:
        _LOGGER.debug(
            "[HACA] Could not parse configuration.yaml for recorder excludes: %s",
            exc,
        )
        return set(), False

    if not isinstance(data, dict):
        return set(), False

    if "recorder" not in data:
        # No recorder section at all → user is using HA defaults (all
        # entities recorded). Authoritative: there is nothing excluded.
        return set(), True

    rec = data["recorder"]
    if rec is None:
        # ``recorder: !include …`` (we mapped the !include tag to None)
        # or ``recorder:`` with no body. Not authoritative — defer to the
        # runtime filter.
        return set(), False
    if not isinstance(rec, dict):
        return set(), False

    exc_section = rec.get("exclude")
    if exc_section is None:
        # ``recorder:`` exists but has no exclude section → authoritative
        # "nothing is excluded".
        return set(), True
    if not isinstance(exc_section, dict):
        return set(), False

    entities = exc_section.get("entities")
    if entities is None:
        return set(), True
    if not isinstance(entities, list):
        return set(), False
    return {e for e in entities if isinstance(e, str)}, True


async def async_get_recorder_excluded_entities(
    hass: HomeAssistant,
) -> tuple[set[str], bool]:
    """Return ``(excluded_entities, authoritative)`` for the live YAML.

    See ``_read_recorder_excluded_entities_sync`` for the meaning of
    ``authoritative``. Callers should prefer this YAML view as the
    source of truth when ``authoritative`` is True; otherwise they may
    fall back to ``recorder.is_entity_recorded``.
    """
    return await hass.async_add_executor_job(
        _read_recorder_excluded_entities_sync, _config_yaml_path(hass)
    )


# ── Write path ──────────────────────────────────────────────────────────────


def _has_yaml_include_tag(node: Any) -> bool:
    """Detect ``!include`` / ``!include_dir_*`` tagged constructs.

    ruamel.yaml round-trip mode keeps unknown YAML tags as
    ``CommentedMap``/``CommentedSeq`` instances with a ``tag`` attribute.
    We refuse to touch a recorder section loaded from an included file so
    we never silently corrupt the user's split layout.
    """
    if node is None:
        return False
    tag = getattr(node, "tag", None)
    if tag is None:
        return False
    value = getattr(tag, "value", str(tag))
    return isinstance(value, str) and value.startswith("!include")


def _backup_and_modify_sync(
    config_file: Path, backup_path: Path, entity_id: str,
) -> tuple[bool, bool, str]:
    """Synchronous worker. Runs in an executor.

    Returns a tuple ``(modified, already_excluded, error)``. When ``error``
    is non-empty, the caller must NOT proceed with config validation.
    """
    # Snapshot the file first — copy2 preserves mtime/perms.
    backup_path.parent.mkdir(exist_ok=True)
    shutil.copy2(config_file, backup_path)

    try:
        from ruamel.yaml import YAML
    except ImportError:
        return False, False, "ruamel.yaml is not available"

    yaml = YAML()  # default = round-trip preserves comments/order
    yaml.preserve_quotes = True
    # Match HA's default 2-space indent so the diff stays minimal
    yaml.indent(mapping=2, sequence=4, offset=2)

    with open(config_file, encoding="utf-8") as f:
        data = yaml.load(f)
    if data is None:
        # Empty file: start a fresh mapping
        from ruamel.yaml.comments import CommentedMap
        data = CommentedMap()

    if not isinstance(data, dict):
        return False, False, "configuration.yaml root is not a YAML mapping"

    # ── recorder ────────────────────────────────────────────────────────
    if "recorder" not in data:
        from ruamel.yaml.comments import CommentedMap
        data["recorder"] = CommentedMap()
    recorder = data["recorder"]
    if recorder is None:
        from ruamel.yaml.comments import CommentedMap
        recorder = CommentedMap()
        data["recorder"] = recorder

    if _has_yaml_include_tag(recorder):
        return False, False, (
            "recorder is loaded from an included file (!include). "
            "Add the entity manually to that file."
        )
    if not isinstance(recorder, dict):
        return False, False, "recorder must be a YAML mapping"

    # ── recorder.exclude ────────────────────────────────────────────────
    if "exclude" not in recorder or recorder["exclude"] is None:
        from ruamel.yaml.comments import CommentedMap
        recorder["exclude"] = CommentedMap()
    exclude = recorder["exclude"]
    if _has_yaml_include_tag(exclude):
        return False, False, (
            "recorder.exclude is loaded from an included file. "
            "Add the entity manually to that file."
        )
    if not isinstance(exclude, dict):
        return False, False, "recorder.exclude must be a YAML mapping"

    # ── recorder.exclude.entities ───────────────────────────────────────
    if "entities" not in exclude or exclude["entities"] is None:
        from ruamel.yaml.comments import CommentedSeq
        exclude["entities"] = CommentedSeq()
    entities = exclude["entities"]
    if _has_yaml_include_tag(entities):
        return False, False, (
            "recorder.exclude.entities is loaded from an included file."
        )
    if not isinstance(entities, list):
        return False, False, "recorder.exclude.entities must be a YAML list"

    if entity_id in entities:
        return False, True, ""  # already excluded — no write needed

    entities.append(entity_id)

    # Write back
    with open(config_file, "w", encoding="utf-8") as f:
        yaml.dump(data, f)

    return True, False, ""


def _restore_sync(backup_path: Path, config_file: Path) -> None:
    shutil.copy2(backup_path, config_file)


async def _async_check_config(hass: HomeAssistant) -> tuple[bool, list[str]]:
    """Run HA config validation. Returns (is_valid, errors)."""
    # Preferred path: HA service with response (HA 2024.4+).
    try:
        result = await hass.services.async_call(
            "homeassistant", "check_config",
            blocking=True, return_response=True,
        )
        if isinstance(result, dict):
            errors_raw = result.get("errors") or result.get("error")
            if not errors_raw:
                return True, []
            errors = errors_raw if isinstance(errors_raw, list) else [str(errors_raw)]
            return False, [str(e) for e in errors]
    except Exception as exc:
        _LOGGER.debug("[HACA] homeassistant.check_config service unavailable: %s", exc)

    # Fallback: helper. Available in every HA version we care about.
    try:
        from homeassistant.helpers.check_config import async_check_ha_config_file
        check = await async_check_ha_config_file(hass)
        errors = list(getattr(check, "errors", []) or [])
        if errors:
            return False, [str(e) for e in errors]
        return True, []
    except Exception as exc:
        return False, [f"check_config failed: {exc}"]


async def async_add_entity_to_recorder_exclude(
    hass: HomeAssistant, entity_id: str,
) -> dict[str, Any]:
    """Add ``entity_id`` to ``recorder.exclude.entities`` in configuration.yaml.

    Returns a dict::

        {
          "success": bool,
          "already_excluded": bool,    # entity was already in the list
          "backup_path": str | None,   # absolute path of the backup we wrote
          "message": str,              # human-readable summary (i18n at the caller)
          "errors": list[str],         # validation errors, if any
          "code": str,                 # short stable code: "ok" | "already" |
                                       #   "no_config_file" | "include_used" |
                                       #   "validation_failed" | "io_error"
        }
    """
    if not entity_id or "." not in entity_id:
        return {
            "success": False, "already_excluded": False,
            "backup_path": None, "message": "Invalid entity_id",
            "errors": [], "code": "io_error",
        }

    config_file = _config_yaml_path(hass)
    if not config_file.exists():
        return {
            "success": False, "already_excluded": False,
            "backup_path": None,
            "message": f"configuration.yaml not found at {config_file}",
            "errors": [], "code": "no_config_file",
        }

    backups_dir = config_file.parent / BACKUP_DIR
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backups_dir / f"configuration.yaml.{ts}.bak"

    try:
        modified, already, error = await hass.async_add_executor_job(
            _backup_and_modify_sync, config_file, backup_path, entity_id,
        )
    except Exception as exc:
        _LOGGER.error("[HACA] configuration.yaml edit failed: %s", exc, exc_info=True)
        return {
            "success": False, "already_excluded": False,
            "backup_path": str(backup_path) if backup_path.exists() else None,
            "message": str(exc), "errors": [str(exc)], "code": "io_error",
        }

    if error:
        # Edit aborted before writing; backup was still taken — that's fine,
        # users can use it to compare or roll back manually if they want.
        code = "include_used" if "!include" in error or "included file" in error else "io_error"
        return {
            "success": False, "already_excluded": False,
            "backup_path": str(backup_path) if backup_path.exists() else None,
            "message": error, "errors": [error], "code": code,
        }

    if already:
        return {
            "success": True, "already_excluded": True,
            "backup_path": str(backup_path) if backup_path.exists() else None,
            "message": f"{entity_id} is already in recorder.exclude.entities",
            "errors": [], "code": "already",
        }

    # Validate the new file before declaring success
    valid, errors = await _async_check_config(hass)
    if not valid:
        try:
            await hass.async_add_executor_job(_restore_sync, backup_path, config_file)
        except Exception as exc:
            _LOGGER.error("[HACA] Could not restore backup: %s", exc, exc_info=True)
            errors = errors + [f"Backup restore failed: {exc}"]
        _LOGGER.warning(
            "[HACA] check_config rejected the recorder edit; restored from %s. Errors: %s",
            backup_path, "; ".join(errors),
        )
        return {
            "success": False, "already_excluded": False,
            "backup_path": str(backup_path),
            "message": "Configuration validation failed — file restored from backup.",
            "errors": errors, "code": "validation_failed",
        }

    _LOGGER.info(
        "[HACA] %s added to recorder.exclude.entities (backup: %s)",
        entity_id, backup_path,
    )
    return {
        "success": True, "already_excluded": False,
        "backup_path": str(backup_path),
        "message": f"{entity_id} added to recorder.exclude.entities",
        "errors": [], "code": "ok",
    }
