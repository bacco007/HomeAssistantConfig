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
    _LEGACY_CONF_ENABLE_UPDATES,
    _LEGACY_CONF_PASSWORD,
    _LEGACY_CONF_SESSION_COOKIE,
    _LEGACY_CONF_USERNAME,
    CONF_API_TOKEN,
    CONF_API_URL,
    CONF_ENABLE_CONTAINER_STATS,
    CONF_ENABLE_IMAGES,
    CONF_ENABLE_NETWORKS,
    CONF_ENABLE_PRECISE_UPDATES,
    CONF_ENABLE_RUNTIME_CONTROLS,
    CONF_ENABLE_SCHEDULES,
    CONF_ENABLE_UPDATE_ENTITIES,
    CONF_ENABLE_VOLUMES,
    CONF_VERIFY_SSL,
    DEFAULT_ENABLE_CONTAINER_STATS,
    DEFAULT_ENABLE_UPDATE_ENTITIES,
    DOMAIN,
    PLATFORMS,
)
from .coordinator import (
    DockhandFastCoordinator,
    DockhandSlowCoordinator,
    DockhandUpdateCoordinator,
)
from .helpers import (
    CONTAINER_STATS_SUFFIXES,
    _all_envs,
    _compose_project,
    _container_has_healthcheck,
    _container_has_pending_update,
    _coordinator_env,
    _ensure_env_devices,
    _ensure_hub_devices,
    _sched_key,
    _stack_has_system_container,
)
from .migration import async_run_migrations

_LOGGER = logging.getLogger(__name__)

# Suffixes for conditionally-present entities that live on a container's or
# stack's own device but can't rely purely on device-removal cascade for
# cleanup, since the device itself often persists after the entity should
# disappear (feature toggled off, or Dockhand reclassifying a stack).
# Shared between _build_live_sets (constructing the live set) and
# _cleanup_stale_registry (matching against it) — see both for context.
_RUNTIME_CONTROL_SUFFIXES = (
    "memory_limit",
    "cpu_limit",
    "pids_limit",
    "restart_policy",
)
_GIT_STACK_SUFFIXES = (
    "git_sync_status",
    "git_last_sync",
    "git_sync_error",
    "git_deploy",
    "git_auto_deploy",
)
# Running switch + restart button + auto-update switch — suppressed for
# system containers/stacks containing one, so unlike most container/stack
# entities these can't rely purely on device cascade either.
_CONTAINER_ACTION_SUFFIXES = ("running", "restart", "auto_update")
_STACK_ACTION_SUFFIXES = ("running", "restart")

# Exact, full unique_id suffixes for standalone env-level entities that are
# NOT conditionally-suppressed and rely purely on device-removal cascade
# (i.e. they should never reach the type-dispatch below at all), but whose
# own naming happens to start with a word that's ALSO one of the reserved
# type tokens the dispatch below matches on (position-2 after splitting on
# "_" — see the entity-registry pass). Position-2 matching alone can't tell
# these apart from an actual tracked entity of that type, since it only
# looks at the first word, not the full suffix — this is a real, shipped-
# then-caught bug: {entry_id}_{env_id}_update_check_enabled and
# {entry_id}_{env_id}_image_prune_enabled were both getting swept up by the
# "update"/"image" branches (which check uid not in update_uids/image_uids)
# and removed on every online poll, since neither ever appears in either
# live set — they're not update entities or image entities at all, just
# ordinary always-on binary sensors whose names happen to start the same
# way. Checked as an exact full-suffix match (not a prefix), immediately
# after computing uid_type, before any dispatch branch runs. If a future
# entity's name happens to collide the same way, add its exact suffix here
# rather than trying to make the position-2 dispatch itself smarter.
_TYPE_COLLISION_EXCLUDED_SUFFIXES = (
    "_update_check_enabled",
    "_image_prune_enabled",
)


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


async def async_migrate_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> bool:
    """Migrate a config entry to the current version.

    Version 1 -> 2 (1.8.0): CONF_ENABLE_UPDATES ("enable_updates") was
    renamed to CONF_ENABLE_PRECISE_UPDATES ("enable_precise_updates") —
    the old name was misleading once update entities became always-on
    (Tier 1): this option only ever controlled Tier 2 (precise digest
    versions via real registry queries), even before the rename. Carries
    over an existing user's stored value under the old key, if present,
    rather than silently reverting them to the default.

    (A 2 -> 3 step briefly existed in an unreleased 1.8.1 dev cycle,
    grouping enable_precise_updates/poll_interval_updates into a
    section() alongside the new enable_update_entities — reverted before
    release after the section's field labels wouldn't render correctly
    in a live instance and the exact cause couldn't be pinned down. See
    docs/BACKLOG.md. Nothing ever shipped at version 3, so there's
    nothing to migrate away from; VERSION is back to 2.)
    """
    if entry.version == 1:
        new_options = dict(entry.options)
        if _LEGACY_CONF_ENABLE_UPDATES in new_options:
            new_options[CONF_ENABLE_PRECISE_UPDATES] = new_options.pop(
                _LEGACY_CONF_ENABLE_UPDATES
            )
        # Belt-and-suspenders: this option has only ever been set via the
        # options flow (entry.options) in every released version, never
        # entry.data — but check data too in case that ever changes.
        new_data = dict(entry.data)
        if _LEGACY_CONF_ENABLE_UPDATES in new_data:
            new_data[CONF_ENABLE_PRECISE_UPDATES] = new_data.pop(
                _LEGACY_CONF_ENABLE_UPDATES
            )
        hass.config_entries.async_update_entry(
            entry, data=new_data, options=new_options, version=2
        )
        _LOGGER.info(
            "Dockhand: migrated config entry %s from version 1 to 2 "
            "(enable_updates -> enable_precise_updates)",
            entry.entry_id,
        )
    return True


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
    slow_coordinator = DockhandSlowCoordinator(
        hass, client, config, fast_coordinator, entry=entry
    )

    # Update coordinator (Tier 2) is optional — created whenever
    # CONF_ENABLE_PRECISE_UPDATES is on, regardless of
    # CONF_ENABLE_UPDATE_ENTITIES. Deliberately NOT AND'd with the
    # update-entities toggle: the env-level "Check for updates" button
    # (button.py's DockhandCheckUpdatesButton) forces a real registry
    # check that also refreshes Dockhand's own cached values — which
    # other things (e.g. the stack binary sensor's pending-updates
    # attributes) still consume even with update entities turned off, so
    # that button and this coordinator should keep working either way.
    # It's specifically the *bulk "Update all" button* that must not
    # exist without update entities (see button.py/__init__.py's
    # _build_live_sets) — that's the actual "backdoor to performing
    # updates from HA" concern from github.com/raetha/ha-dockhand/issues/23,
    # not this read-only check.
    update_coordinator: DockhandUpdateCoordinator | None = None
    if config.get(CONF_ENABLE_PRECISE_UPDATES):
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
    # on every setup). All migration logic lives in migration.py. Unwrapped
    # here (fast_coordinator.data is now {"environments": {...}}) so
    # migration.py's own functions keep receiving the same flat per-env
    # dict shape they always have — they don't need to know about the
    # wrapper at all.
    async_run_migrations(hass, entry, _all_envs(fast_coordinator.data))

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

    # Reload the whole entry whenever options change (the Configure flow,
    # config_flow.py's async_step_init), so a changed option takes effect
    # right away instead of only on the next poll or a manual reload —
    # standard HA pattern for this. A full reload re-runs async_setup_entry
    # from scratch, so this also naturally re-evaluates every conditional
    # entity-creation branch (container stats, precise updates, etc.)
    # against the new option values immediately.
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_reload_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


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

    for env_id, env_data in _all_envs(fast_coordinator.data).items():
        stats = env_data.get("stats") or {}
        env_name = stats.get("name", f"Environment {env_id}")
        slow_env = _coordinator_env(slow_coordinator.data, env_id)
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
        update_uids              set[str]   — live entity unique_ids (Tier 1 — from
                                              fast data's updateCheckEnabled, not the
                                              optional Tier 2 update_coordinator)
        bulk_update_uids         set[str]   — live entity unique_ids (env-level
                                              "Update all" button, only while at
                                              least one non-system-container
                                              pending update exists)
        runtime_control_uids     set[str]   — live entity unique_ids (memory/cpu/
                                              pids/restart-policy number/select)
        container_stats_uids     set[str]   — live entity unique_ids (the 8
                                              container CPU/memory/network/
                                              block-I/O sensors, only while
                                              "Enable container stats" is on)
        git_stack_uids           set[str]   — live entity unique_ids (git stack
                                              sensors/binary_sensor/buttons/switch)
        container_action_uids    set[str]   — live entity unique_ids (running
                                              switch + restart button +
                                              auto-update switch, suppressed
                                              for system containers)
        stack_action_uids        set[str]   — live entity unique_ids (running
                                              switch + restart button, suppressed
                                              for stacks with a system container)
        stack_deploy_uids        set[str]   — live entity unique_ids (Deploy
                                              button, internal stacks with
                                              no system container only)
        stack_updates_available_uids set[str] — live entity unique_ids
                                              (updates-available sensor,
                                              feature-detected on Dockhand
                                              1.0.37+)
        health_uids               set[str]  — live entity unique_ids (Health
                                              sensor, only for containers with
                                              a healthcheck configured)
        slow_valid               bool       — slow coordinator last poll succeeded
        slow_env_ids             set[int]   — envs present in slow data (for Guard 3)
    """
    fast_data = _all_envs(entry.runtime_data.fast_coordinator.data)
    slow = entry.runtime_data.slow_coordinator
    slow_data = slow.data or {}

    entry_config = {**entry.data, **entry.options}
    runtime_controls_enabled = bool(
        entry_config.get(CONF_ENABLE_RUNTIME_CONTROLS, False)
    )
    container_stats_enabled = bool(
        entry_config.get(CONF_ENABLE_CONTAINER_STATS, DEFAULT_ENABLE_CONTAINER_STATS)
    )

    env_ids: set[int] = set(fast_data.keys())
    containers: set[str] = set()
    stacks: set[str] = set()
    # Env IDs that have at least one freestanding (non-Compose) container.
    # The Containers group device is only valid when this set includes the env_id.
    containers_group_env_ids: set[int] = set()
    # Runtime control number/select entities (memory/cpu/pids/restart-policy) —
    # live on the container's own device, but only exist for stack-less,
    # non-system containers when the feature is enabled, so (unlike other
    # container-scoped entities) they need explicit tracking rather than
    # relying purely on device-removal cascade.
    runtime_control_uids: set[str] = set()
    container_stats_uids: set[str] = set()
    # Tier 1 update entities — live whenever CONF_ENABLE_UPDATE_ENTITIES is
    # on (default True) and the environment has updateCheckEnabled=True.
    # Entirely fast-data-derived; Tier 2/update coordinator is purely
    # additive and has no bearing on which update entities should exist —
    # see update.py's module docstring.
    update_uids: set[str] = set()
    # Running switch + restart button + auto-update switch — live on the
    # container's/stack's own device, but suppressed for system containers
    # (Dockhand itself, or a Hawser agent) and for any stack containing
    # one, since those are required for Dockhand to keep managing the
    # host at all.
    container_action_uids: set[str] = set()
    stack_action_uids: set[str] = set()
    # Stack updates-available binary sensor — feature-detected (Dockhand
    # 1.0.37+): live whenever "updatesAvailable" is present as a key on
    # the stack at all, regardless of its value.
    stack_updates_available_uids: set[str] = set()
    # Deploy button — live only for internal (non-git, non-untracked)
    # stacks with no system container, confirmed from Dockhand's own
    # frontend source that its equivalent Redeploy control is hidden for
    # any other sourceType.
    stack_deploy_uids: set[str] = set()
    # Health sensor — live only for containers with a Docker healthcheck
    # configured. Like the runtime controls above, this can change while
    # the container device persists (an image update can add or remove
    # a HEALTHCHECK instruction), so it needs the same explicit tracking.
    health_uids: set[str] = set()
    # Bulk "Update all" button — env-level, conditionally present (not
    # just conditionally enabled) matching Dockhand's own {#if
    # updatableContainersCount > 0} gating: live only while
    # CONF_ENABLE_UPDATE_ENTITIES is on AND at least one non-system-
    # container pending update exists in the environment.
    #
    # Considers both Tier 1 (pending_updates) and Tier 2 (update_coordinator,
    # when configured) via the shared _container_has_pending_update()
    # helper, matching button.py's creation gate exactly — this MUST stay
    # in sync with that gate, since a mismatch here means the button
    # either never gets removed once created (this set too permissive) or
    # gets removed the instant it's created (this set too strict). Safe to
    # include Tier 2 because that helper looks it up by each container's
    # current id — a stale entry from a since-recreated container is
    # keyed under an id nothing currently has, so it can't keep this uid
    # alive past the point the update actually resolved.
    bulk_update_uids: set[str] = set()
    update_coordinator = entry.runtime_data.update_coordinator
    update_data = _all_envs(update_coordinator.data if update_coordinator else None)
    # Tier 1's own pending-updates fetch is intentionally NOT gated on this
    # option (it's cheap, and other consumers — e.g. the stack
    # updates-available binary sensor's pending_container_names attribute
    # — legitimately want it regardless of whether update ENTITIES are
    # shown) — so pending_update_container_ids can still be non-empty here
    # even with the platform off. Both update_uids and bulk_update_uids
    # below must check this explicitly rather than relying on Tier 1/Tier 2
    # data being absent, or a user who disabled update entities entirely
    # (github.com/raetha/ha-dockhand/issues/23) would still see the
    # env-level "Update all" button reappear from Tier 1 data alone.
    update_entities_enabled = entry.options.get(
        CONF_ENABLE_UPDATE_ENTITIES, DEFAULT_ENABLE_UPDATE_ENTITIES
    )

    for env_id, env_data in fast_data.items():
        has_freestanding = False
        stats = env_data.get("stats") or {}
        update_check_enabled = bool(stats.get("updateCheckEnabled"))
        env_containers = env_data.get("containers") or []
        pending_updates = env_data.get("pending_update_container_ids") or set()
        system_ids = {
            c.get("id")
            for c in env_containers
            if c.get("systemContainer") and c.get("id")
        }
        update_env_data = update_data.get(env_id)
        if update_entities_enabled and any(
            _container_has_pending_update(c, pending_updates, update_env_data)
            for c in env_containers
            if c.get("id") not in system_ids
        ):
            bulk_update_uids.add(f"{entry.entry_id}_{env_id}_bulk_update")
        for c in env_containers:
            name = c.get("name", "")
            if name:
                containers.add(f"container_{env_id}_{name}")
                if update_entities_enabled and update_check_enabled:
                    update_uids.add(f"{entry.entry_id}_{env_id}_update_{name}")
                if not c.get("systemContainer"):
                    for suffix in _CONTAINER_ACTION_SUFFIXES:
                        container_action_uids.add(
                            f"{entry.entry_id}_{env_id}_container_{name}_{suffix}"
                        )
                if _container_has_healthcheck(c):
                    health_uids.add(
                        f"{entry.entry_id}_{env_id}_container_{name}_health"
                    )
                if container_stats_enabled:
                    for suffix in CONTAINER_STATS_SUFFIXES:
                        container_stats_uids.add(
                            f"{entry.entry_id}_{env_id}_container_{name}{suffix}"
                        )
            is_stackless = not _compose_project(c)
            if is_stackless:
                has_freestanding = True
                if runtime_controls_enabled and name and not c.get("systemContainer"):
                    for suffix in _RUNTIME_CONTROL_SUFFIXES:
                        runtime_control_uids.add(
                            f"{entry.entry_id}_{env_id}_container_{name}_{suffix}"
                        )
        if has_freestanding:
            containers_group_env_ids.add(env_id)
        for s in env_data.get("stacks") or []:
            stack_name = s["name"]
            stacks.add(f"stack_{env_id}_{stack_name}")
            has_system = _stack_has_system_container(s, env_containers)
            if not has_system:
                for suffix in _STACK_ACTION_SUFFIXES:
                    stack_action_uids.add(
                        f"{entry.entry_id}_{env_id}_stack_{stack_name}_{suffix}"
                    )
            if not has_system and s.get("sourceType") == "internal":
                stack_deploy_uids.add(
                    f"{entry.entry_id}_{env_id}_stack_{stack_name}_deploy"
                )
            if "updatesAvailable" in s:
                stack_updates_available_uids.add(
                    f"{entry.entry_id}_{env_id}_stack_{stack_name}_updates_available"
                )

    # Environments that are offline have unreachable Docker daemons — their
    # container and stack lists will be empty but that is not ground truth.
    # Track which envs are confirmed online so cleanup skips offline ones.
    online_env_ids: set[int] = {
        env_id
        for env_id, env_data in fast_data.items()
        if (env_data.get("stats") or {}).get("online", True)
    }

    # Slow-coordinator-derived sets — only meaningful when slow data is valid.
    # slow_valid: slow coordinator has run successfully and returned data.
    slow_valid = slow.last_update_success and bool(slow_data)
    slow_env_map = _all_envs(slow_data)
    slow_env_ids: set[int] = set(slow_env_map.keys())

    # Only populate schedule live set when schedules are enabled.
    # When disabled, slow_data has schedules=[] — treat as "not loaded", not "deleted".
    schedules_enabled = slow.last_update_success and bool(
        entry_config.get(CONF_ENABLE_SCHEDULES, False)
    )

    schedules: set[str] = set()
    image_uids: set[str] = set()
    network_uids: set[str] = set()
    volume_uids: set[str] = set()
    git_stack_uids: set[str] = set()

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
            # Git stack entities — always fetched (not config-gated), live
            # on the stack's own device, but only exist while Dockhand
            # still classifies that stack as git-tracked, so (like runtime
            # controls) they need explicit tracking rather than relying
            # purely on device-removal cascade.
            for gs in env_data.get("git_stacks") or []:
                gs_name = gs.get("stackName", "")
                if not gs_name:
                    continue
                for suffix in _GIT_STACK_SUFFIXES:
                    git_stack_uids.add(
                        f"{entry.entry_id}_{env_id}_stack_{gs_name}_{suffix}"
                    )

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
        "bulk_update_uids": bulk_update_uids,
        "runtime_control_uids": runtime_control_uids,
        "container_stats_uids": container_stats_uids,
        "container_action_uids": container_action_uids,
        "health_uids": health_uids,
        "stack_action_uids": stack_action_uids,
        "stack_deploy_uids": stack_deploy_uids,
        "stack_updates_available_uids": stack_updates_available_uids,
        "git_stack_uids": git_stack_uids,
        "slow_valid": slow_valid,
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
    - Image, network, volume, and git stack entity cleanup uses the same
      two-case logic, guarded by slow coordinator validity so a failed poll
      doesn't trigger false cleanup.
    - Update (Tier 1) entity cleanup and runtime control entity cleanup use
      the same two-case logic and are fast-data-derived (same reliability
      as containers/stacks) — no separate coordinator-validity guard
      needed beyond the top-level fast_data check. Tier 2 (the optional
      update_coordinator, real registry queries) never creates or removes
      the per-container update entities themselves — it only enriches
      already-existing Tier 1 ones. It DOES factor into the env-level
      bulk "Update all" button specifically (via the shared
      _container_has_pending_update() helper, looked up by each
      container's current id so a stale Tier 2 entry from a since-
      recreated container can't keep the button alive past when its
      update actually resolved) — see bulk_update_uids below.
    - Container stats entity cleanup (the 8 CPU/memory/network/block-I/O
      sensors) uses the same two-case logic, same fast-data reliability —
      turning "Enable container stats" off removes any already created
      while it was on, the same way enable_images/enable_volumes/
      enable_networks toggles already worked. The "memory_limit" suffix
      is an intentional exact collision with a runtime control entity of
      the same name — disambiguated by entity domain (number, not
      sensor), not by suffix alone; see the comment at that branch.
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
    fast_data = _all_envs(entry.runtime_data.fast_coordinator.data)
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
    # Most device-attached entities (switches, sensors, buttons) are handled
    # by the device removal cascade above and need nothing here. This pass is
    # for entities that need explicit tracking anyway: either standalone
    # (images/networks/volumes, no device of their own), or ones whose
    # existence is conditional even though their device persists — update
    # (Tier 1 depends on updateCheckEnabled), runtime controls (depends on
    # the feature being enabled), and git stack entities (depends on
    # Dockhand still classifying the stack as git-tracked).
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

        if any(uid.endswith(sfx) for sfx in _TYPE_COLLISION_EXCLUDED_SUFFIXES):
            continue

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
            env_id = uid_env_id
            # Tier 1 is entirely fast-data-derived (same reliability as
            # containers/stacks — no separate validity flag needed beyond
            # the top-level "if not fast_data: return" guard).
            # Remove if env deleted, or if env is online and update entity is gone.
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"] and uid not in live["update_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale update entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "bulk" and uid.endswith("_bulk_update"):
            # Env-level "Update all" button. Conditionally present, not
            # just conditionally enabled — mirrors Dockhand's own button
            # disappearing entirely once there's nothing left to update,
            # rather than going idle/disabled. Same fast-data reliability
            # as the Tier 1 update entities above.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"] and uid not in live["bulk_update_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale bulk update entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif (
            uid_type == "container"
            and entity_entry.domain in ("number", "select")
            and any(uid.endswith(f"_{suffix}") for suffix in _RUNTIME_CONTROL_SUFFIXES)
        ):
            # Runtime control number/select entities. Live on the
            # container's own device, but conditionally present (feature
            # enabled + stack-less), so — like the running switch/restart
            # button below — these need explicit tracking rather than
            # relying purely on device-removal cascade. Turning the
            # feature off, or a container becoming Compose-managed,
            # cleans them up even though the container device itself
            # stays. Same fast-data reliability as containers/update.
            #
            # Domain check added deliberately: "memory_limit" collides
            # exactly with the container-stats sensor of the same name
            # (sensor.py's DockhandContainerMemoryLimitSensor) — same
            # class of bug as the update_check_enabled/image_prune_enabled
            # collision noted in _TYPE_COLLISION_EXCLUDED_SUFFIXES above,
            # caught the same way (a real, shipped entity disappearing
            # right after creation). A domain check disambiguates these
            # two suffix-identical but functionally distinct entities more
            # precisely than adding to that exclusion list would, since
            # this one does need its own (different) conditional removal —
            # see the container_stats_uids branch below — not blanket
            # exemption from cleanup altogether.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["runtime_control_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale runtime control entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "container" and uid.endswith(CONTAINER_STATS_SUFFIXES):
            # Container CPU/memory/network/block-I/O sensors — only
            # created at all when "Enable container stats" is on (see
            # sensor.py's async_setup_entry), so — like runtime controls
            # above — need explicit tracking: turning the option off must
            # clean these up even though the container device itself
            # stays. Without this branch, toggling the option off did
            # nothing to entities already created while it was on (a
            # real, shipped gap — the option only ever controlled future
            # creation, cleanup had no way to know these were now
            # supposed to be gone).
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["container_stats_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale container stats entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "container" and any(
            uid.endswith(f"_{suffix}") for suffix in _CONTAINER_ACTION_SUFFIXES
        ):
            # Running switch + restart button + auto-update switch.
            # Suppressed for system containers (Dockhand itself, or a
            # Hawser agent) — the container device persists (it's still a
            # real container with health/resource sensors), but these
            # three action entities are conditionally absent, so they need
            # the same explicit tracking as runtime controls above.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["container_action_uids"]
            ):
                _LOGGER.debug(
                    "Dockhand: removing stale container action entity %s", uid
                )
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "container" and uid.endswith("_health"):
            # Health sensor. Live only for containers with a Docker
            # healthcheck configured — an image update can add or remove
            # a HEALTHCHECK instruction, changing this while the
            # container device itself persists, so (like runtime
            # controls and the action entities above) this needs
            # explicit tracking rather than relying purely on
            # device-removal cascade.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"] and uid not in live["health_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale health entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "stack" and any(
            uid.endswith(f"_{suffix}") for suffix in _GIT_STACK_SUFFIXES
        ):
            # Git stack entities. Live on the stack's own device (uid_type
            # "stack", same as the stack's other entities — status and
            # container_count, which rely purely on device cascade and
            # never reach this branch, since neither discriminator
            # matches a _GIT_STACK_SUFFIXES suffix), but only while
            # Dockhand still classifies it as git-tracked — the stack
            # device itself isn't removed just because a stack stops
            # being git-tracked, so (like runtime controls) these need
            # explicit tracking rather than relying on device cascade.
            # Guarded by slow_valid like images/networks/volumes, since
            # git_stacks is slow-coordinator data.
            env_id = uid_env_id
            if env_id not in live["env_ids"]:
                _LOGGER.debug("Dockhand: removing stale git stack entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)
            elif live["slow_valid"] and (
                env_id in live["slow_env_ids"]
                and env_id in live["online_env_ids"]
                and uid not in live["git_stack_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale git stack entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "stack" and any(
            uid.endswith(f"_{suffix}") for suffix in _STACK_ACTION_SUFFIXES
        ):
            # Running switch + restart button. Suppressed for any stack
            # containing a system container — same fast-data reliability
            # as the container-level equivalent above.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["stack_action_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale stack action entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "stack" and uid.endswith("_updates_available"):
            # Stack updates-available binary sensor. Feature-detected
            # (Dockhand 1.0.37+) — same fast-data reliability as the
            # other stack-scoped entities above; no slow_valid guard
            # needed since this comes from /api/stacks, not a
            # slow-coordinator call.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["stack_updates_available_uids"]
            ):
                _LOGGER.debug(
                    "Dockhand: removing stale stack updates-available entity %s", uid
                )
                ent_registry.async_remove(entity_entry.entity_id)

        elif (
            uid_type == "stack"
            and uid.endswith("_deploy")
            and not uid.endswith("_git_deploy")
        ):
            # Deploy button for internal (non-git) stacks. Checked as an
            # exact "_deploy" suffix explicitly excluding "_git_deploy"
            # rather than relying on this branch's position after the
            # _GIT_STACK_SUFFIXES branch above (which would otherwise
            # already have claimed a git stack's "..._git_deploy" uid,
            # since it also ends with "_deploy" as a substring) — same
            # lesson as _TYPE_COLLISION_EXCLUDED_SUFFIXES: an exact,
            # order-independent match beats a fragile ordering
            # dependency between elif branches.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and uid not in live["stack_deploy_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale stack deploy entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)


async def async_unload_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> bool:
    """Unload Dockhand config entry."""
    # runtime_data is cleaned up automatically by HA.
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
