"""migration.py — one-time data migrations run at setup time.

Each function is named after the version whose data format it targets.
When a migration is retired (old installs no longer plausible), delete
the function and remove it from async_run_migrations. If there are no
active migrations, async_run_migrations returns immediately.

Active migrations:
  migrate_1_4_0_update_entity_unique_ids       — retire after ~1.10.0
  migrate_1_5_0_container_device_identifiers   — retire after ~1.10.0
"""

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def async_run_migrations(
    hass: HomeAssistant,
    entry_id: str,
    fast_data: dict,
) -> None:
    """Run all active one-time migrations in order.

    Called once from async_setup_entry after the fast coordinator's first
    refresh. Each migration is idempotent — it detects whether it has
    anything to do and returns immediately if not.

    To add a migration: define a new migrate_X_Y_Z_* function below and
    call it here.

    To retire a migration: delete the function and remove its call from
    this function. If no migrations remain, this function body should be
    just `pass` — do not delete the function itself, as __init__.py
    imports and calls it unconditionally.
    """
    migrate_1_4_0_update_entity_unique_ids(hass, entry_id, fast_data)
    migrate_1_5_0_container_device_identifiers(hass, entry_id, fast_data)


def _is_hex64(s: str) -> bool:
    """Return True if s is a 64-character lowercase hex string (Docker container ID)."""
    return len(s) == 64 and all(c in "0123456789abcdef" for c in s)


def migrate_1_4_0_update_entity_unique_ids(
    hass: HomeAssistant,
    entry_id: str,
    fast_data: dict,
) -> None:
    """Migrate update entity unique_ids from 1.4.0 format to 1.4.1 format.

    1.4.0 used: dockhand_update_{container_id}  (64-char Docker hash — unstable)
    1.4.1 uses: dockhand_update_{env_id}_{container_name}  (stable across rebuilds)

    Builds a reverse map of container_id → (env_id, container_name) from the
    fast coordinator data, then rewrites any matching entity unique_ids in the
    entity registry. Runs once at setup time; is a no-op after the first run
    since old-format unique_ids will no longer exist.
    """
    # Build reverse map: container_id → (env_id, name)
    id_to_name: dict[str, tuple[int, str]] = {}
    for env_id, env_data in fast_data.items():
        for c in env_data.get("containers") or []:
            cid = c.get("id", "")
            name = c.get("name", "")
            if cid and name:
                id_to_name[cid] = (env_id, name)

    if not id_to_name:
        return

    ent_registry = er.async_get(hass)
    migrated = 0
    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry_id):
        uid = entity_entry.unique_id or ""
        if not uid.startswith("dockhand_update_"):
            continue
        # Old format: "dockhand_update_" + 64-char hex container ID.
        # New format: "dockhand_update_" + digits + "_" + name.
        suffix = uid[len("dockhand_update_") :]
        # If suffix contains an underscore it's already new format.
        if "_" in suffix:
            continue
        container_id = suffix
        if container_id not in id_to_name:
            # Container no longer running — will be cleaned up by stale registry pass.
            continue
        env_id, name = id_to_name[container_id]
        new_uid = f"dockhand_update_{env_id}_{name}"
        ent_registry.async_update_entity(entity_entry.entity_id, new_unique_id=new_uid)
        _LOGGER.debug(
            "Dockhand: migrated update entity unique_id %s → %s", uid, new_uid
        )
        migrated += 1

    if migrated:
        _LOGGER.info(
            "Dockhand: migrated %d update entity unique_id(s) to name-based scheme",
            migrated,
        )


def migrate_1_5_0_container_device_identifiers(
    hass: HomeAssistant,
    entry_id: str,
    fast_data: dict,
) -> None:
    """Migrate container device identifiers and entity unique_ids to name-based format.

    Handles all historical formats:
      Devices:  container_{hash}  /  container_{env_id}_{hash}
      Entities: dockhand_container_{hash}_{suffix}
                dockhand_container_{env_id}_{hash}_{suffix}
    Target:
      Devices:  container_{env_id}_{name}
      Entities: dockhand_container_{env_id}_{name}_{suffix}

    Builds a reverse map of docker_hash → (env_id, name) from coordinator data.
    Is a no-op once all entries are in the new format.
    """
    # Build reverse map: docker_hash → (env_id, container_name)
    id_to_env_name: dict[str, tuple[int, str]] = {}
    for env_id, env_data in fast_data.items():
        for c in env_data.get("containers") or []:
            cid = c.get("id", "")
            name = c.get("name", "")
            if cid and name:
                id_to_env_name[cid] = (env_id, name)

    if not id_to_env_name:
        return

    dev_registry = dr.async_get(hass)
    ent_registry = er.async_get(hass)
    migrated_devices = 0
    migrated_entities = 0

    # ── Device registry ───────────────────────────────────────────────────
    for device in dr.async_entries_for_config_entry(dev_registry, entry_id):
        for domain, identifier in device.identifiers:
            if domain != DOMAIN or not identifier.startswith("container_"):
                continue
            suffix = identifier[len("container_") :]
            parts = suffix.split("_", 1)
            if len(parts) == 1 and _is_hex64(parts[0]):
                # pre-1.5.0: container_{hash}
                container_hash = parts[0]
                if container_hash not in id_to_env_name:
                    continue
                env_id, name = id_to_env_name[container_hash]
            elif len(parts) == 2 and parts[0].isdigit() and _is_hex64(parts[1]):
                # 1.5.0: container_{env_id}_{hash}
                env_id, container_hash = int(parts[0]), parts[1]
                if container_hash not in id_to_env_name:
                    continue
                _, name = id_to_env_name[container_hash]
            else:
                continue  # Already name-based or unknown — skip.
            new_id = f"container_{env_id}_{name}"
            new_identifiers = {
                (d, new_id if d == DOMAIN and i == identifier else i)
                for d, i in device.identifiers
            }
            dev_registry.async_update_device(device.id, new_identifiers=new_identifiers)
            _LOGGER.debug("Dockhand: migrated device %s → %s", identifier, new_id)
            migrated_devices += 1
            break

    # ── Entity registry ───────────────────────────────────────────────────
    _suffixes = ("_state", "_health", "_running", "_restart")
    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry_id):
        uid = entity_entry.unique_id or ""
        if not uid.startswith("dockhand_container_"):
            continue
        rest = uid[len("dockhand_container_") :]
        for sfx in _suffixes:
            if not rest.endswith(sfx):
                continue
            middle = rest[: -len(sfx)]
            parts = middle.split("_", 1)
            if len(parts) == 2 and parts[0].isdigit() and _is_hex64(parts[1]):
                # 1.5.0 entity: dockhand_container_{env_id}_{hash}_{suffix}
                env_id, container_hash = int(parts[0]), parts[1]
                if container_hash not in id_to_env_name:
                    continue
                _, name = id_to_env_name[container_hash]
            elif _is_hex64(middle):
                # pre-1.5.0: dockhand_container_{hash}_{suffix}
                container_hash = middle
                if container_hash not in id_to_env_name:
                    continue
                env_id, name = id_to_env_name[container_hash]
            else:
                continue  # Already name-based — skip.
            new_uid = f"dockhand_container_{env_id}_{name}{sfx}"
            ent_registry.async_update_entity(
                entity_entry.entity_id, new_unique_id=new_uid
            )
            _LOGGER.debug("Dockhand: migrated entity %s → %s", uid, new_uid)
            migrated_entities += 1
            break

    if migrated_devices or migrated_entities:
        _LOGGER.info(
            "Dockhand: migrated %d container device(s) and %d entity unique_id(s)"
            " to name-based scheme",
            migrated_devices,
            migrated_entities,
        )
