"""migration.py — one-time data migrations run at setup time.

Each function is named after the version whose data format it targets.
When a migration is retired (old installs no longer plausible), delete
the function and remove it from async_run_migrations. If there are no
active migrations, async_run_migrations returns immediately.

Active migrations:
  migrate_1_4_0_update_entity_unique_ids            — retire after ~1.10.0
  migrate_1_5_0_container_device_identifiers        — retire after ~1.10.0
  migrate_1_7_3_entry_scoped_unique_ids             — retire after ~1.11.0
  migrate_1_8_0_container_stats_option              — retire after ~1.11.0
  migrate_1_8_0_reenable_container_stats_entities   — retire after ~1.11.0
  migrate_1_8_0_remove_consolidated_disk_sensors    — retire after ~1.11.0
  migrate_1_9_0_entry_scoped_device_identifiers     — retire after ~1.12.0

Migrations are for entity/device registry changes between released
versions only (e.g. 1.7.3 -> 1.8.0) — never add one for churn within an
unreleased dev cycle (an entity added and removed before ever shipping).
Raetha's own testing doesn't rely on these at all (she reloads/re-adds
the integration during development), so a migration for interim-build-only
artifacts adds permanent maintenance cost for zero real benefit.
"""

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import CONF_ENABLE_CONTAINER_STATS, DOMAIN
from .helpers import CONTAINER_STATS_SUFFIXES

_LOGGER = logging.getLogger(__name__)


def async_run_migrations(
    hass: HomeAssistant,
    entry: ConfigEntry,
    fast_data: dict,
) -> None:
    """Run all active one-time migrations in order.

    Called once from async_setup_entry after the fast coordinator's first
    refresh, before platforms are set up — so any option this changes
    (see migrate_1_8_0_container_stats_option) is already in place by the
    time sensor.py reads it. Each migration is idempotent — it detects
    whether it has anything to do and returns immediately if not.

    To add a migration: define a new migrate_X_Y_Z_* function below and
    call it here. Only for changes between released versions — see module
    docstring.

    To retire a migration: delete the function and remove its call from
    this function. If no migrations remain, this function body should be
    just `pass` — do not delete the function itself, as __init__.py
    imports and calls it unconditionally.
    """
    migrate_1_4_0_update_entity_unique_ids(hass, entry.entry_id, fast_data)
    migrate_1_5_0_container_device_identifiers(hass, entry.entry_id, fast_data)
    migrate_1_7_3_entry_scoped_unique_ids(hass, entry.entry_id)
    migrate_1_8_0_container_stats_option(hass, entry)
    migrate_1_8_0_reenable_container_stats_entities(hass, entry)
    migrate_1_8_0_remove_consolidated_disk_sensors(hass, entry)
    migrate_1_9_0_entry_scoped_device_identifiers(hass, entry.entry_id)


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


def migrate_1_7_3_entry_scoped_unique_ids(
    hass: HomeAssistant,
    entry_id: str,
) -> None:
    """Migrate entity unique_ids to the entry-scoped, env_id-first format.

    Pre-1.7.3 format:  dockhand_{type}_{env_id}_{discriminator}
    Post-1.7.3 format: {entry_id}_{env_id}_{type}_{discriminator}

    The dockhand_ prefix is replaced with entry_id to scope unique_ids to
    their config entry, enabling multiple Dockhand instances in one HA
    installation. The env_id and type tokens are also reordered so the
    hierarchy reads instance → environment → object type → entity.

    Schedule entities have no env_id:
      dockhand_sched_{id}_{type}_{suffix} → {entry_id}_sched_{id}_{type}_{suffix}

    Is a no-op once migration is complete, since new-format IDs do not
    start with "dockhand_".
    """
    ent_registry = er.async_get(hass)
    migrated = 0

    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry_id):
        uid = entity_entry.unique_id or ""
        if not uid.startswith("dockhand_"):
            continue

        # Strip the "dockhand_" prefix to get "{type}_{rest}"
        without_prefix = uid[len("dockhand_") :]
        parts = without_prefix.split("_", 2)
        if not parts:
            continue
        type_word = parts[0]

        if type_word == "sched":
            # dockhand_sched_{id}_{type}_{rest} → {entry_id}_sched_{id}_{type}_{rest}
            # No env_id involved; token order unchanged after stripping prefix.
            new_uid = f"{entry_id}_{without_prefix}"
        elif type_word == "env":
            # dockhand_env_{env_id}_{rest} → {entry_id}_{env_id}_{rest}
            # The "env" word is dropped entirely; env-level entities are
            # distinguished by having no object-type token, not by the word "env".
            if len(parts) < 3:
                continue
            env_id_str = parts[1]
            if not env_id_str.isdigit():
                continue
            rest = parts[2]
            new_uid = f"{entry_id}_{env_id_str}_{rest}"
        else:
            # dockhand_{type}_{env_id}_{rest} → {entry_id}_{env_id}_{type}_{rest}
            # env_id moves before the type word.
            if len(parts) < 2:
                continue
            env_id_str = parts[1]
            if not env_id_str.isdigit():
                continue
            rest = parts[2] if len(parts) > 2 else ""
            new_uid = (
                f"{entry_id}_{env_id_str}_{type_word}_{rest}"
                if rest
                else f"{entry_id}_{env_id_str}_{type_word}"
            )

        ent_registry.async_update_entity(entity_entry.entity_id, new_unique_id=new_uid)
        _LOGGER.debug("Dockhand: migrated unique_id %s → %s", uid, new_uid)
        migrated += 1

    if migrated:
        _LOGGER.info(
            "Dockhand: migrated %d entity unique_id(s) to entry-scoped format",
            migrated,
        )


def migrate_1_8_0_container_stats_option(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> None:
    """Reconcile the "Enable container stats" option with entities a user
    already had manually enabled before this option existed.

    Pre-1.8.0, the 8 per-container CPU/memory/network/block-I/O sensors
    were always created (for every container) but disabled by default —
    a user could manually enable individual ones. 1.8.0 changed these to
    only be created at all when "Enable container stats" is on, so the
    existing central cleanup system can remove them when it's off (see
    CHANGELOG's Unreleased section for why — they weren't being cleaned
    up before). Without this migration, a 1.7.x user who'd manually
    enabled even one of these sensors would silently lose it on upgrade,
    since the option defaults to off and the entity would no longer be
    produced at all.

    Only acts when the option has never been explicitly set (distinct
    from "explicitly set to False", which must be respected) — checked by
    the key being entirely absent from entry.options. Idempotent: once
    the option is set (by this migration or by the user), it's always
    present in options going forward, so this becomes a no-op.
    """
    if CONF_ENABLE_CONTAINER_STATS in entry.options:
        return  # Already decided, either by the user or a prior run of this.

    ent_registry = er.async_get(hass)
    any_enabled = any(
        not entity_entry.disabled
        and "_container_" in (entity_entry.unique_id or "")
        and (entity_entry.unique_id or "").endswith(CONTAINER_STATS_SUFFIXES)
        for entity_entry in er.async_entries_for_config_entry(
            ent_registry, entry.entry_id
        )
    )
    if not any_enabled:
        return

    hass.config_entries.async_update_entry(
        entry, options={**entry.options, CONF_ENABLE_CONTAINER_STATS: True}
    )
    _LOGGER.info(
        "Dockhand: found manually-enabled container stats sensor(s) from before "
        "the 'Enable container stats' option existed — turned it on automatically "
        "so they aren't removed"
    )


def migrate_1_8_0_reenable_container_stats_entities(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> None:
    """Fix a real, reported issue: container-stats entities from before
    1.8.0 can come back still disabled once a user turns "Enable
    container stats" on, even though these sensors are meant to default
    to enabled now. Not a bug in this integration's own entity setup —
    it's Home Assistant's own DeletedRegistryEntry mechanism, which
    intentionally restores an entity's prior disabled_by when a matching
    unique_id is re-registered, to preserve deliberate user
    customizations across integration reloads/removals. The problem is
    it can't distinguish "the user chose to disable this" from "this was
    only ever disabled because of the pre-1.8.0 default."

    A genuine one-time migration, not a per-load reconciliation (an
    earlier version of this fix ran on every setup instead) — within
    1.8.0's own architecture, these entities are only ever created with
    enabled_default=True (gated entirely on the option itself; see
    sensor.py's creation loop), so there is no code path going forward
    that produces a fresh RegistryEntryDisabler.INTEGRATION entry for
    one of them. The only entities that can ever carry that specific
    disabled_by are pre-1.8.0 leftovers — a fixed population fully
    addressed once, not ongoing drift needing to be checked on every
    load. (Toggling the option off and back on within 1.8.0+ itself
    doesn't hit this at all: cleanup removes entities via
    async_remove(), which records whatever disabled_by they actually had
    at that moment — None, for anything the user hadn't touched — so
    DeletedRegistryEntry correctly restores None on recreation, not
    INTEGRATION.)

    The distinguishing signal that lets us safely fix only the stale
    cases: RegistryEntryDisabler.INTEGRATION specifically means "disabled
    because the entity's own enabled-by-default flag said so" — never a
    user's deliberate choice (that's RegistryEntryDisabler.USER). Only
    entities still carrying that specific reason get re-enabled; a
    genuine user disable is left untouched.
    """
    ent_registry = er.async_get(hass)
    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry.entry_id):
        uid = entity_entry.unique_id or ""
        if (
            entity_entry.disabled_by == er.RegistryEntryDisabler.INTEGRATION
            and "_container_" in uid
            and uid.endswith(CONTAINER_STATS_SUFFIXES)
        ):
            ent_registry.async_update_entity(entity_entry.entity_id, disabled_by=None)
            _LOGGER.info(
                "Dockhand: re-enabled container stats entity %s — was disabled "
                "only due to the pre-1.8.0 default, not a user choice",
                entity_entry.entity_id,
            )


# unique_id suffixes for the two pre-1.8.0 sensors that got consolidated
# into the single "disk_usage" sensor's attributes (images/volumes/
# containers/build-cache sizes all on one entity now, instead of two
# separate ones). Their entity classes were removed from sensor.py
# entirely, but nothing ever removed their registry entries — orphaned
# entities that HA would eventually flag on a future restart, forcing
# manual cleanup, rather than being cleanly gone the moment a user
# upgrades.
#
# Verified directly against the actual released v1.7.4 source
# (github.com/raetha/ha-dockhand, tag v1.7.4) rather than assumed from
# the translation_key naming — those two aren't the same thing, and
# guessing wrong here was a real, reported bug: the disk sensor's
# unique_id used "_containers_size", not "_containers_disk_usage" (its
# translation_key, used only for the UI label). build_cache_size's
# unique_id suffix happened to match its own translation_key exactly,
# which is the only reason that one worked while this one didn't.
_RETIRED_DISK_SENSOR_SUFFIXES = ("_containers_size", "_build_cache_size")


def migrate_1_8_0_remove_consolidated_disk_sensors(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> None:
    """Remove the pre-1.8.0 "Containers disk usage" and "Build cache
    size" sensors, now that both are attributes on the single "Disk
    usage" sensor instead of separate entities. A genuine one-time
    migration — this is a fixed, one-time population from before the
    consolidation, not something that can recur, the same reasoning as
    migrate_1_8_0_reenable_container_stats_entities above.
    """
    ent_registry = er.async_get(hass)
    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry.entry_id):
        uid = entity_entry.unique_id or ""
        if uid.endswith(_RETIRED_DISK_SENSOR_SUFFIXES):
            ent_registry.async_remove(entity_entry.entity_id)
            _LOGGER.info(
                "Dockhand: removed retired entity %s — consolidated into "
                "the single disk_usage sensor's attributes in 1.8.0",
                entity_entry.entity_id,
            )


def migrate_1_9_0_entry_scoped_device_identifiers(
    hass: HomeAssistant,
    entry_id: str,
) -> None:
    """Migrate device identifiers to the entry-scoped format.

    Pre-1.9.0 identifiers used bare names that collided across config entries:
      env_{env_id}, env_{env_id}_Containers, env_{env_id}_Stacks, etc.
      container_{env_id}_{name}, stack_{env_id}_{name}
      schedule_{id}_{type}, schedules_hub

    Post-1.9.0 all identifiers are prefixed with the config entry's own UUID:
      {entry_id}_env_{env_id}, {entry_id}_env_{env_id}_Containers, etc.
      {entry_id}_container_{env_id}_{name}, {entry_id}_stack_{env_id}_{name}
      {entry_id}_schedule_{id}_{type}, {entry_id}_schedules_hub

    Without this, two Dockhand config entries (two separate Dockhand instances
    registered in the same HA installation) that happen to manage an environment
    with the same numeric ID (e.g. both have an env_id=1) would register the
    same device identifiers. HA's device registry merges devices that share an
    identifier, causing devices from both instances to appear merged in the UI —
    reported as issue #28 (ha-dockhand) and the root cause of issue #1
    (ha-dockhand-cards, container duplication across Overview cards).

    Entity unique_ids were already scoped to entry_id by
    migrate_1_7_3_entry_scoped_unique_ids (fixing a similar collision at the
    entity level). This migration completes the fix at the device level.

    HA 2026.8 silently worked around the collision by changing device
    deduplication to use a composite (config_entry_id, identifiers) key rather
    than identifiers alone — which is why upgrading HA "fixed" issue #28 without
    a real integration fix. This migration removes the dependency on that HA
    version-specific behavior.

    Is idempotent: identifiers that already start with entry_id are skipped.
    Since entry_id is a UUID (hex + hyphens) and all old identifiers start with
    a plain word (env_, container_, stack_, schedule_, schedules_hub), there is
    no ambiguity between old and new formats.
    """
    dev_registry = dr.async_get(hass)
    prefix = f"{entry_id}_"
    migrated = 0

    for device in dr.async_entries_for_config_entry(dev_registry, entry_id):
        old_identifiers = device.identifiers
        new_identifiers: set[tuple[str, str]] = set()
        changed = False

        for domain, identifier in old_identifiers:
            if domain == DOMAIN and not identifier.startswith(prefix):
                new_identifiers.add((domain, f"{prefix}{identifier}"))
                changed = True
            else:
                new_identifiers.add((domain, identifier))

        if changed:
            dev_registry.async_update_device(device.id, new_identifiers=new_identifiers)
            _LOGGER.debug(
                "Dockhand: scoped device %s identifiers to entry %s",
                device.id,
                entry_id[:8],
            )
            migrated += 1

    if migrated:
        _LOGGER.info(
            "Dockhand: scoped %d device identifier(s) to config entry %s "
            "(fixes multi-instance identifier collisions; see issue #28)",
            migrated,
            entry_id[:8],
        )
