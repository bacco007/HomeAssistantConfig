import json
import logging
from io import StringIO
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.util.yaml import parse_yaml, Secrets

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

FOUNDRY_FILE_TOP_LEVEL_KEY = "uix_foundries"

def get_version(hass: HomeAssistant):
    with open(hass.config.path(f"custom_components/{DOMAIN}/manifest.json"), "r") as fp:
        manifest = json.load(fp)
        return manifest["version"]

def resolve_foundries(hass: HomeAssistant, foundries: dict) -> dict:
    """Resolve foundry configs at serve time using annotatedyaml's ``parse_yaml``.

    Recursively walks each foundry config and, for any string value that begins
    with ``!``, re-parses it as a YAML fragment via
    :func:`homeassistant.util.yaml.parse_yaml`.  This delegates resolution to
    annotatedyaml's native constructors, giving full support for:

    - ``!include <path>`` — loads a YAML file relative to the HA config
      directory; nested ``!include`` and ``!secret`` inside that file are also
      resolved automatically.
    - ``!secret <name>`` — resolves the named secret from ``secrets.yaml``.
    - ``!include_dir_list``, ``!include_dir_named``, ``!env_var``, etc.

    String values that do not begin with ``!`` are left unchanged.

    This function performs file I/O and must be called from an executor thread
    (e.g. via :meth:`~homeassistant.core.HomeAssistant.async_add_executor_job`).
    """
    secrets = Secrets(Path(hass.config.config_dir))
    # A path inside the config dir so the annotatedyaml loader resolves
    # !include paths relative to the HA config directory.
    base_path = hass.config.path("configuration.yaml")

    def _resolve(value, foundry_name: str):
        if isinstance(value, dict):
            return {k: _resolve(v, foundry_name) for k, v in value.items()}
        if isinstance(value, list):
            return [_resolve(item, foundry_name) for item in value]
        if isinstance(value, str) and value.startswith("!"):
            # Wrap the YAML tag string in a StringIO and set its name to a
            # path inside the config dir.  annotatedyaml's loader uses
            # os.path.dirname(stream.name) as the base directory for
            # !include resolution, so this makes relative !include paths
            # resolve relative to the HA config directory.
            sio = StringIO(value)
            sio.name = base_path
            try:
                return parse_yaml(sio, secrets)
            except Exception:
                _LOGGER.error(
                    "Failed to resolve %r in foundry %r — "
                    "check that any !include paths exist and are readable, "
                    "and that any !secret names are defined in secrets.yaml",
                    value,
                    foundry_name,
                )
                return value
        return value

    return {name: _resolve(config, name) for name, config in foundries.items()}


def validate_foundry_file(hass: HomeAssistant, file_path: str) -> str | None:
    """Validate a foundry file.

    Returns an error key string if the file fails validation, or ``None`` if
    the file is valid and ready to load.

    This function performs file I/O and must be called from an executor thread
    (e.g. via :meth:`~homeassistant.core.HomeAssistant.async_add_executor_job`).
    """
    path = Path(file_path)
    if not path.is_absolute():
        path = Path(hass.config.config_dir) / path

    if not path.exists():
        return "file_not_found"

    try:
        secrets = Secrets(Path(hass.config.config_dir))
        with open(path, "r") as fp:
            content = parse_yaml(fp, secrets)
    except Exception:
        _LOGGER.exception("Failed to parse foundry file: %s", path)
        return "file_parse_error"

    if not isinstance(content, dict):
        return "file_invalid_structure"

    foundries = content.get(FOUNDRY_FILE_TOP_LEVEL_KEY)
    if foundries is None:
        return "file_missing_key"

    if not isinstance(foundries, dict):
        return "file_invalid_foundries"

    return None


def check_all_foundry_files(
    hass: HomeAssistant, file_paths: list[str]
) -> dict:
    """Validate all registered foundry files.

    Returns a dict with:
    - ``errors``: list of ``{file_path, error_key}`` dicts for files that
      failed validation.
    - ``file_count``: total number of registered files.

    This function performs file I/O and must be called from an executor thread
    (e.g. via :meth:`~homeassistant.core.HomeAssistant.async_add_executor_job`).
    """
    errors = []
    for file_path in file_paths:
        error_key = validate_foundry_file(hass, file_path)
        if error_key is not None:
            errors.append({"file_path": file_path, "error_key": error_key})
    return {"errors": errors, "file_count": len(file_paths)}


def load_foundries_from_files(hass: HomeAssistant, file_paths: list[str]) -> dict:
    """Load and merge foundries from a list of YAML files.

    Each file must have a top-level ``uix_foundries`` key that is a mapping.
    Files that cannot be found, fail to parse, or have an invalid structure are
    logged and skipped.  Later files in *file_paths* override earlier ones when
    foundry names collide.

    This function performs file I/O and must be called from an executor thread
    (e.g. via :meth:`~homeassistant.core.HomeAssistant.async_add_executor_job`).
    """
    secrets = Secrets(Path(hass.config.config_dir))
    result: dict = {}

    for file_path in file_paths:
        path = Path(file_path)
        if not path.is_absolute():
            path = Path(hass.config.config_dir) / path

        if not path.exists():
            _LOGGER.error("Foundry file not found: %s", path)
            continue

        try:
            with open(path, "r") as fp:
                content = parse_yaml(fp, secrets)
        except Exception:
            _LOGGER.error("Failed to parse foundry file: %s", path, exc_info=True)
            continue

        if not isinstance(content, dict):
            _LOGGER.error("Foundry file %s must be a YAML mapping", path)
            continue

        foundries = content.get(FOUNDRY_FILE_TOP_LEVEL_KEY)
        if not isinstance(foundries, dict):
            _LOGGER.error(
                "Foundry file %s must have a top-level '%s' mapping",
                path,
                FOUNDRY_FILE_TOP_LEVEL_KEY,
            )
            continue

        result.update(foundries)

    return result


def get_all_foundries(
    hass: HomeAssistant, foundries: dict, file_paths: list[str]
) -> dict:
    """Return all foundries merged from files and the config entry.

    File-based foundries are loaded first; config-entry foundries are applied
    on top so that UI-configured entries take precedence over file entries when
    names collide.  The merged result is then passed through
    :func:`resolve_foundries` so that ``!secret`` / ``!include`` tags are
    expanded.

    This function performs file I/O and must be called from an executor thread
    (e.g. via :meth:`~homeassistant.core.HomeAssistant.async_add_executor_job`).
    """
    file_foundries = load_foundries_from_files(hass, file_paths)
    merged = {**file_foundries, **foundries}
    return resolve_foundries(hass, merged)
