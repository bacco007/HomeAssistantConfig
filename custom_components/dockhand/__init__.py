import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import DockhandClient
from .const import (
    _LEGACY_CONF_PASSWORD,
    _LEGACY_CONF_SESSION_COOKIE,
    _LEGACY_CONF_USERNAME,
    CONF_API_TOKEN,
    CONF_API_URL,
    CONF_ENABLE_IMAGES,
    CONF_ENABLE_NETWORKS,
    CONF_ENABLE_SCHEDULES,
    CONF_ENABLE_UPDATES,
    CONF_ENABLE_VOLUMES,
    CONF_VERIFY_SSL,
    DOMAIN,
    PLATFORMS,
)
from .coordinator import (
    DockhandFastCoordinator,
    DockhandSlowCoordinator,
    DockhandUpdateCoordinator,
)
from .helpers import (
    _compose_project,
    _ensure_env_devices,
    _ensure_hub_devices,
    _sched_key,
)
from .migration import async_run_migrations

_LOGGER = logging.getLogger(__name__)


@dataclass
class DockhandData:
    """Runtime data stored on the config entry."""

    client: DockhandClient
    fast_coordinator: DockhandFastCoordinator
    slow_coordinator: DockhandSlowCoordinator
    update_coordinator: DockhandUpdateCoordinator | None


# Typed config entry alias — used throughout all platform setup functions
# so that entry.runtime_data is typed as DockhandData without casting.
type DockhandConfigEntry = ConfigEntry[DockhandData]


async def async_setup_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> bool:
    """Set up Dockhand from a config entry."""
    verify_ssl = bool(entry.data.get(CONF_VERIFY_SSL, True))
    session = async_get_clientsession(hass, verify_ssl=verify_ssl)
    client = DockhandClient(session, entry.data)

    # Detect legacy config entries (pre-1.2.0) that used session-cookie auth.
    has_legacy = entry.data.get(_LEGACY_CONF_USERNAME) or entry.data.get(
        _LEGACY_CONF_SESSION_COOKIE
    )
    if has_legacy:
        if entry.data.get(CONF_API_TOKEN):
            # Reauth flow already stored a token — strip the legacy keys so
            # this migration path is only triggered once.
            clean = {
                k: v
                for k, v in entry.data.items()
                if k
                not in (
                    _LEGACY_CONF_USERNAME,
                    _LEGACY_CONF_PASSWORD,
                    _LEGACY_CONF_SESSION_COOKIE,
                )
            }
            hass.config_entries.async_update_entry(entry, data=clean)
        else:
            # No token yet — prompt the user to provide one via reauth.
            raise ConfigEntryAuthFailed(
                "This Dockhand entry uses the old session-cookie auth, "
                "which is no longer supported. Use Reconfigure to provide "
                "an API token (Profile → API tokens in Dockhand)."
            )

    config = {**entry.data, **entry.options}

    fast_coordinator = DockhandFastCoordinator(hass, client, config, entry=entry)
    slow_coordinator = DockhandSlowCoordinator(hass, client, config, entry=entry)

    # Update coordinator is optional — only created when the feature is enabled.
    update_coordinator: DockhandUpdateCoordinator | None = None
    if config.get(CONF_ENABLE_UPDATES):
        update_coordinator = DockhandUpdateCoordinator(
            hass, client, fast_coordinator, config, entry=entry
        )

    try:
        # Fast coordinator must succeed — it provides the environment list that
        # all entity platforms depend on.
        await fast_coordinator.async_config_entry_first_refresh()
    except ConfigEntryAuthFailed:
        raise
    except Exception as err:
        raise ConfigEntryNotReady(
            f"Could not fetch initial Dockhand data: {err}"
        ) from err

    try:
        # Slow coordinator failure is non-fatal at startup — optional entities
        # will show as unavailable until the first successful poll.
        await slow_coordinator.async_config_entry_first_refresh()
    except Exception as err:
        _LOGGER.warning(
            "Dockhand: initial slow data fetch failed, will retry at next poll: %s",
            err,
        )

    if update_coordinator is not None:
        try:
            # Update coordinator failure is non-fatal — entities will show as
            # unavailable until the first successful poll (up to 24h by default).
            await update_coordinator.async_config_entry_first_refresh()
        except Exception as err:
            _LOGGER.warning(
                "Dockhand: initial update check failed, will retry at next poll: %s",
                err,
            )

    entry.runtime_data = DockhandData(
        client=client,
        fast_coordinator=fast_coordinator,
        slow_coordinator=slow_coordinator,
        update_coordinator=update_coordinator,
    )

    # Pre-register group devices so they appear with correct names before
    # entity platforms load.
    base_url = entry.data.get(CONF_API_URL, "")
    _register_devices(hass, entry, fast_coordinator, slow_coordinator, config, base_url)

    # Run any pending one-time registry migrations (idempotent — safe to call
    # on every setup). All migration logic lives in migration.py.
    async_run_migrations(hass, entry.entry_id, fast_coordinator.data or {})

    # Run cleanup immediately on setup so that stale registry entries from a
    # previous install/reload are removed before platforms add new entities.
    # Without this, entities pruned between reloads persist in the registry
    # and cause _2/_3/etc suffixes when new entities with the same name register.
    _cleanup_stale_registry(hass, entry)

    # All three coordinators share the same cleanup listener — guard logic is
    # handled inside _cleanup_stale_registry.
    entry.async_on_unload(
        fast_coordinator.async_add_listener(
            lambda: _cleanup_stale_registry(hass, entry)
        )
    )
    entry.async_on_unload(
        slow_coordinator.async_add_listener(
            lambda: _cleanup_stale_registry(hass, entry)
        )
    )
    if update_coordinator is not None:
        entry.async_on_unload(
            update_coordinator.async_add_listener(
                lambda: _cleanup_stale_registry(hass, entry)
            )
        )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


def _register_devices(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    fast_coordinator: DockhandFastCoordinator,
    slow_coordinator: DockhandSlowCoordinator,
    config: dict,
    base_url: str = "",
) -> None:
    """Pre-register environment hub devices and type-group child devices.

    Runs after both coordinators have completed their first refresh so that
    Networks/Images/Volumes group devices are only created when that feature is
    enabled AND the slow coordinator has confirmed the resources actually exist.
    The Containers group is still governed by fast data (compose vs freestanding).

    Delegates all per-env device creation to _ensure_env_devices (helpers.py),
    which is the single source of truth for device names, models, entry_type,
    and via_device relationships.
    """
    enable_schedules = bool(config.get(CONF_ENABLE_SCHEDULES, False))
    enable_images = bool(config.get(CONF_ENABLE_IMAGES, False))
    enable_volumes = bool(config.get(CONF_ENABLE_VOLUMES, False))
    enable_networks = bool(config.get(CONF_ENABLE_NETWORKS, False))

    for env_id, env_data in (fast_coordinator.data or {}).items():
        stats = env_data.get("stats") or {}
        env_name = stats.get("name", f"Environment {env_id}")
        slow_env = (slow_coordinator.data or {}).get("environments", {}).get(
            env_id
        ) or {}
        _ensure_env_devices(
            hass,
            entry.entry_id,
            base_url,
            env_id,
            env_name,
            containers=env_data.get("containers") or [],
            stacks=env_data.get("stacks") or [],
            networks=slow_env.get("networks"),
            images=slow_env.get("images"),
            volumes=slow_env.get("volumes"),
            enable_networks=enable_networks,
            enable_images=enable_images,
            enable_volumes=enable_volumes,
        )

    if enable_schedules:
        _ensure_hub_devices(
            hass,
            entry.entry_id,
            base_url,
            (slow_coordinator.data or {}).get("schedules") or [],
        )


def _build_live_sets(entry: DockhandConfigEntry) -> dict[str, Any]:
    """Derive the complete set of live identifiers from all coordinator data.

    Returns a dict with keys:
        env_ids                  set[int]   — environments currently in fast data
        online_env_ids           set[int]   — environments with online=True (or unknown)
        containers               set[str]   — live device identifiers
                                              (container_<env_id>_<name>)
        stacks                   set[str]   — live device identifiers
                                              (stack_<env_id>_<name>)
        containers_group_env_ids set[int]   — env_ids with ≥1 freestanding
                                              container; the Containers group
                                              device is only valid for these
        schedules                set[str]   — live device identifiers (schedule_<id>)
        image_uids               set[str]   — live entity unique_ids
        network_uids             set[str]   — live entity unique_ids
        volume_uids              set[str]   — live entity unique_ids
        update_uids              set[str]   — live entity unique_ids
        slow_valid               bool       — slow coordinator last poll succeeded
        update_valid             bool       — update coordinator last poll succeeded
        slow_env_ids             set[int]   — envs present in slow data (for Guard 3)
    """
    fast_data = entry.runtime_data.fast_coordinator.data or {}
    slow = entry.runtime_data.slow_coordinator
    slow_data = slow.data or {}
    update = entry.runtime_data.update_coordinator

    env_ids: set[int] = set(fast_data.keys())
    containers: set[str] = set()
    stacks: set[str] = set()
    # Env IDs that have at least one freestanding (non-Compose) container.
    # The Containers group device is only valid when this set includes the env_id.
    containers_group_env_ids: set[int] = set()

    for env_id, env_data in fast_data.items():
        has_freestanding = False
        for c in env_data.get("containers") or []:
            name = c.get("name", "")
            if name:
                containers.add(f"container_{env_id}_{name}")
            if not _compose_project(c):
                has_freestanding = True
        if has_freestanding:
            containers_group_env_ids.add(env_id)
        for s in env_data.get("stacks") or []:
            stacks.add(f"stack_{env_id}_{s['name']}")

    # Environments that are offline have unreachable Docker daemons — their
    # container and stack lists will be empty but that is not ground truth.
    # Track which envs are confirmed online so cleanup skips offline ones.
    online_env_ids: set[int] = {
        env_id
        for env_id, env_data in fast_data.items()
        if env_data.get("stats", {}).get("online", True)
    }

    # Slow-coordinator-derived sets — only meaningful when slow data is valid.
    # slow_valid: slow coordinator has run successfully and returned data.
    slow_valid = slow.last_update_success and bool(slow_data)
    slow_env_map = slow_data.get("environments", {})
    slow_env_ids: set[int] = set(slow_env_map.keys())

    # Only populate schedule live set when schedules are enabled.
    # When disabled, slow_data has schedules=[] — treat as "not loaded", not "deleted".
    entry_config = {**entry.data, **entry.options}
    schedules_enabled = slow.last_update_success and bool(
        entry_config.get(CONF_ENABLE_SCHEDULES, False)
    )

    schedules: set[str] = set()
    image_uids: set[str] = set()
    network_uids: set[str] = set()
    volume_uids: set[str] = set()

    if slow_valid:
        # Only populate when enabled — empty list when disabled is not "deleted".
        if schedules_enabled:
            for sched in slow_data.get("schedules") or []:
                if sched.get("id") is not None:
                    schedules.add(f"schedule_{_sched_key(sched)}")

        for env_id, env_data in slow_env_map.items():
            for img in env_data.get("images") or []:
                raw_id = img.get("id") or ""
                short_id = raw_id.split(":")[-1] if ":" in raw_id else raw_id
                image_uids.add(f"{entry.entry_id}_{env_id}_image_{short_id}")
            for net in env_data.get("networks") or []:
                net_id = net.get("id", "")
                network_uids.add(f"{entry.entry_id}_{env_id}_network_{net_id}")
            for vol in env_data.get("volumes") or []:
                vname = vol.get("name") or vol.get("Name", "")
                volume_uids.add(f"{entry.entry_id}_{env_id}_volume_{vname}")

    # Update-coordinator-derived set.
    update_valid = (
        update is not None and update.last_update_success and bool(update.data)
    )
    update_uids: set[str] = set()
    if update_valid and update is not None:
        for env_id, by_container in (update.data or {}).items():
            for item in by_container.values():
                name = item.get("containerName", "")
                if name:
                    update_uids.add(f"{entry.entry_id}_{env_id}_update_{name}")

    return {
        "env_ids": env_ids,
        "online_env_ids": online_env_ids,
        "containers": containers,
        "stacks": stacks,
        "containers_group_env_ids": containers_group_env_ids,
        "schedules": schedules,
        "schedules_enabled": schedules_enabled,
        "image_uids": image_uids,
        "network_uids": network_uids,
        "volume_uids": volume_uids,
        "update_uids": update_uids,
        "slow_valid": slow_valid,
        "update_valid": update_valid,
        "slow_env_ids": slow_env_ids,
    }


def _cleanup_stale_registry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
) -> None:
    """Remove stale device and entity registry entries after any coordinator update.

    Called from all three coordinator listeners and once at startup. Uses a
    single pass over the device registry and a single pass over the entity
    registry, both driven by live sets built from the current coordinator data.

    Safety guards:
    - Fast coordinator data must be non-empty before any removal is attempted.
    - Container and stack devices are removed when (a) the environment no longer
      exists in Dockhand (deleted — env_id absent from env_ids), or (b) the
      environment exists and is confirmed online but the specific item is gone.
      Offline environments (host rebooting, Hawser temporarily unreachable) are
      preserved until confirmed online, to avoid false-positive cleanup.
    - Image, network, volume, and update entity cleanup uses the same two-case
      logic. Guarded additionally by slow/update coordinator validity so a failed
      poll doesn't trigger false cleanup.
    - Env hub and group device removal is driven by env_ids — a deleted
      environment disappears from env_ids and all its devices cascade away.
    - Schedule cleanup is gated on schedules being enabled and slow coordinator
      validity.
    - Entities with config_entry_id=None (orphaned by HA when their device was
      removed) are outside the scope of async_entries_for_config_entry and are
      left to HA's periodic 30-day purge cycle. Our primary cleanup prevents
      orphaning in the first place by removing devices cleanly via the device
      registry, which cascades entity removal automatically.
    """
    fast_data = entry.runtime_data.fast_coordinator.data or {}
    if not fast_data:
        # No confirmed environment data — do not remove anything.
        return

    live = _build_live_sets(entry)
    dev_registry = dr.async_get(hass)
    ent_registry = er.async_get(hass)

    # ── Device registry pass ─────────────────────────────────────────────────
    for device in dr.async_entries_for_config_entry(dev_registry, entry.entry_id):
        for domain, identifier in device.identifiers:
            if domain != DOMAIN:
                continue

            if identifier.startswith("container_"):
                # Container identifiers: container_{env_id}_{name}
                # Name-based so devices survive container recreation.
                # Extract env_id from position [1] for the per-env offline guard.
                try:
                    env_id = int(identifier.split("_")[1])
                except ValueError:
                    continue
                if identifier not in live["containers"]:
                    if env_id not in live["env_ids"]:
                        # Environment deleted from Dockhand — remove unconditionally.
                        _LOGGER.debug(
                            "Dockhand: env deleted, removing container device %s",
                            identifier,
                        )
                        dev_registry.async_remove_device(device.id)
                    elif env_id in live["online_env_ids"]:
                        # Env exists and is online — container was removed.
                        _LOGGER.debug(
                            "Dockhand: removing stale container device %s", identifier
                        )
                        dev_registry.async_remove_device(device.id)
                    else:
                        _LOGGER.debug(
                            "Dockhand: env offline, skipping container cleanup: %s",
                            identifier,
                        )

            elif identifier.startswith("stack_"):
                # Stack identifiers are "stack_{env_id}_{name}" — extract env_id
                # for the same precise per-env offline guard.
                try:
                    env_id = int(identifier.split("_")[1])
                except ValueError:
                    continue
                if identifier not in live["stacks"]:
                    if env_id not in live["env_ids"]:
                        # Environment deleted from Dockhand — remove unconditionally.
                        _LOGGER.debug(
                            "Dockhand: env deleted, removing stack device %s",
                            identifier,
                        )
                        dev_registry.async_remove_device(device.id)
                    elif env_id in live["online_env_ids"]:
                        # Env exists and is online — stack was removed.
                        _LOGGER.debug(
                            "Dockhand: removing stale stack device %s", identifier
                        )
                        dev_registry.async_remove_device(device.id)
                    else:
                        _LOGGER.debug(
                            "Dockhand: env offline, skipping stack cleanup: %s",
                            identifier,
                        )

            elif identifier.startswith("env_"):
                # Covers both env hub devices ("env_5") and group devices
                # ("env_5_Containers", "env_5_Stacks", etc.) — all keyed to
                # the same env_id in position [1] after splitting on "_".
                try:
                    env_id = int(identifier.split("_")[1])
                except ValueError:
                    continue
                if env_id not in live["env_ids"]:
                    _LOGGER.debug(
                        "Dockhand: removing stale env/group device %s", identifier
                    )
                    dev_registry.async_remove_device(device.id)
                elif (
                    identifier == f"env_{env_id}_Containers"
                    and env_id in live["online_env_ids"]
                    and env_id not in live["containers_group_env_ids"]
                ):
                    # The environment exists and is online but has no freestanding
                    # containers — the Containers group device is now empty and
                    # should be removed. Guarded by online_env_ids to avoid
                    # removing the device when the host is temporarily unreachable
                    # and the container list came back empty.
                    _LOGGER.debug(
                        "Dockhand: removing empty Containers group device for env %s",
                        env_id,
                    )
                    dev_registry.async_remove_device(device.id)

            elif identifier == "schedules_hub":
                # Remove the schedules hub device when schedules are disabled
                # in the config. It has no cleanup path otherwise since it has
                # no env_id and is not in any live set.
                if not live["schedules_enabled"]:
                    _LOGGER.debug("Dockhand: removing stale schedules_hub device")
                    dev_registry.async_remove_device(device.id)

            elif identifier.startswith("schedule_"):
                # Only clean up schedule devices when schedules are enabled and
                # the slow coordinator has valid data. When disabled, the live
                # set is empty but that means "not loaded", not "deleted".
                if live["schedules_enabled"] and identifier not in live["schedules"]:
                    _LOGGER.debug(
                        "Dockhand: removing stale schedule device %s", identifier
                    )
                    dev_registry.async_remove_device(device.id)

    # ── Entity registry pass ─────────────────────────────────────────────────
    # Only standalone entities (no device) need explicit cleanup here;
    # device-attached entities are handled by the device removal cascade above.
    for entity_entry in er.async_entries_for_config_entry(ent_registry, entry.entry_id):
        uid = entity_entry.unique_id or ""

        # uid format after 1.7.3: {entry_id}_{env_id}_{type}_{discriminator}
        # entry_id is a UUID containing only hyphens (no underscores), so
        # splitting on "_" gives: [entry_id, env_id_int, type_word, ...]
        uid_parts = uid.split("_")
        if len(uid_parts) < 3:
            continue
        try:
            uid_env_id = int(uid_parts[1])
        except ValueError:
            continue
        uid_type = uid_parts[2]

        if uid_type == "image":
            env_id = uid_env_id
            if env_id not in live["env_ids"]:
                # Env deleted — remove regardless of slow coordinator state.
                _LOGGER.debug("Dockhand: removing stale image entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)
            elif live["slow_valid"] and (
                env_id in live["slow_env_ids"]
                and env_id in live["online_env_ids"]
                and uid not in live["image_uids"]
            ):
                # Env exists, is online, slow data is fresh — entity is gone.
                _LOGGER.debug("Dockhand: removing stale image entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "network":
            env_id = uid_env_id
            if env_id not in live["env_ids"]:
                _LOGGER.debug("Dockhand: removing stale network entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)
            elif live["slow_valid"] and (
                env_id in live["slow_env_ids"]
                and env_id in live["online_env_ids"]
                and uid not in live["network_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale network entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "volume":
            env_id = uid_env_id
            if env_id not in live["env_ids"]:
                _LOGGER.debug("Dockhand: removing stale volume entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)
            elif live["slow_valid"] and (
                env_id in live["slow_env_ids"]
                and env_id in live["online_env_ids"]
                and uid not in live["volume_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale volume entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "update":
            if not live["update_valid"]:
                continue
            env_id = uid_env_id
            # Remove if env deleted, or if env is online and update entity is gone.
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"] and uid not in live["update_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale update entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)


async def async_unload_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> bool:
    """Unload Dockhand config entry."""
    # runtime_data is cleaned up automatically by HA.
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
