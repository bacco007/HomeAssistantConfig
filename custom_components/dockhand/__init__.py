import logging
from dataclasses import dataclass, field
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
    _device_id_container,
    _device_id_schedule,
    _device_id_stack,
    _ensure_env_devices,
    _ensure_hub_devices,
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
    # Which entities (domain-prefixed unique_ids) have been added to HA
    # during *this* setup's lifetime — reset fresh every time
    # async_setup_entry runs (fresh instance created below), which is
    # exactly the point: this must NOT survive a reload or restart, unlike
    # the entity registry, which does. See helpers.py's already_registered()
    # for why checking the registry itself was wrong — it answers "did
    # this unique_id ever exist," not "is a live object backing it right
    # now," and after any reload the answer to the second question is
    # "no" for everything, regardless of what the registry remembers.
    known_entity_ids: set[str] = field(default_factory=set)


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

    # Run any pending one-time registry migrations BEFORE pre-registering
    # devices.  Migration must see the old registry state; _register_devices
    # calls async_get_or_create with the new entry-scoped identifiers, so if
    # it ran first the new-format devices would already exist and migration
    # would collide trying to rename the old bare-identifier devices to the
    # same names.  Migrations are idempotent — safe to call on every setup.
    # All migration logic lives in migration.py.  Unwrapped here
    # (fast_coordinator.data is now {"environments": {...}}) so migration.py's
    # own functions keep receiving the same flat per-env dict shape they always
    # have — they don't need to know about the wrapper at all.
    async_run_migrations(hass, entry, _all_envs(fast_coordinator.data))

    # Pre-register group devices so they appear with correct names before
    # entity platforms load.  Must run AFTER async_run_migrations (above) so
    # that async_get_or_create finds already-renamed identifiers in the
    # registry rather than creating duplicate new-format devices alongside
    # surviving old-format ones.
    base_url = entry.data.get(CONF_API_URL, "")
    _register_devices(hass, entry, fast_coordinator, slow_coordinator, config, base_url)

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

    all_schedules = (slow_coordinator.data or {}).get("schedules") or []

    for env_id, env_data in _all_envs(fast_coordinator.data).items():
        stats = env_data.get("stats") or {}
        env_name = stats.get("name", f"Environment {env_id}")
        slow_env = _coordinator_env(slow_coordinator.data, env_id)
        env_schedules = [s for s in all_schedules if s.get("environmentId") == env_id]
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
            schedules=env_schedules,
            enable_networks=enable_networks,
            enable_images=enable_images,
            enable_volumes=enable_volumes,
            enable_schedules=enable_schedules,
        )

    if enable_schedules:
        _ensure_hub_devices(
            hass,
            entry.entry_id,
            base_url,
            all_schedules,
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
        stacks_group_env_ids     set[int]   — env_ids with ≥1 stack; the
                                              Stacks group device is only
                                              valid for these
        containers_fetch_ok_env_ids set[int] — env_ids whose containers fetch
                                              specifically succeeded this
                                              cycle (regardless of result).
                                              Gates every container-derived
                                              set above (containers, update_uids,
                                              bulk_update_uids, runtime_control_uids,
                                              container_stats_uids,
                                              container_action_uids, health_uids)
                                              — see images_fetch_ok_env_ids below
                                              for the general pattern this follows.
        stacks_fetch_ok_env_ids set[int]    — same as containers_fetch_ok_env_ids,
                                              for stacks (stacks, stack_action_uids,
                                              stack_deploy_uids,
                                              stack_updates_available_uids).
        schedules                set[str]   — live device identifiers (schedule_<id>)
        schedule_env_group_ids   set[int]   — env_ids with ≥1 live env-scoped
                                              schedule (environmentId == env_id);
                                              that env's Schedules group device
                                              is only valid for these
        images_group_env_ids     set[int]   — env_ids with ≥1 live image;
                                              that env's Images group device
                                              is only valid for these
        networks_group_env_ids   set[int]   — env_ids with ≥1 live network;
                                              that env's Networks group device
                                              is only valid for these
        volumes_group_env_ids    set[int]   — env_ids with ≥1 live volume;
                                              that env's Volumes group device
                                              is only valid for these
        images_fetch_ok_env_ids  set[int]   — env_ids whose images fetch
                                              specifically succeeded this
                                              cycle (regardless of result).
                                              An env's absence from
                                              images_group_env_ids only means
                                              "confirmed empty" if it's ALSO
                                              present here — otherwise the
                                              fetch itself failed and got
                                              silently defaulted to empty
                                              (see coordinator.py's _unwrap),
                                              which must not be mistaken for
                                              "genuinely has none."
        networks_fetch_ok_env_ids set[int]  — see images_fetch_ok_env_ids.
        volumes_fetch_ok_env_ids  set[int]  — see images_fetch_ok_env_ids.
        git_stacks_fetch_ok_env_ids set[int] — see images_fetch_ok_env_ids.
        enable_images            bool       — raw config flag, poll-independent.
                                              Used only to decide "feature is
                                              off entirely, remove the group
                                              device unconditionally" — NOT
                                              for the "confirmed empty" case,
                                              which needs slow_valid/online
                                              gating instead (see enable_networks/
                                              enable_volumes/schedules_feature_enabled).
        enable_networks           bool      — see enable_images.
        enable_volumes            bool      — see enable_images.
        schedules_feature_enabled bool      — raw CONF_ENABLE_SCHEDULES flag,
                                              poll-independent (unlike
                                              schedules_enabled below, which is
                                              also gated on a successful slow
                                              poll and therefore unsafe to use
                                              for "feature is off, remove
                                              unconditionally" — that would
                                              wrongly fire during a transient
                                              slow-coordinator failure too).
        image_uids               set[str]   — live entity unique_ids
        network_uids             set[str]   — live entity unique_ids
        volume_uids               set[str]  — live entity unique_ids
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
    # Raw config flags, poll-independent — used only for the "feature is off
    # entirely, remove the group device unconditionally" cleanup case. Do not
    # use these for detecting "confirmed empty while enabled" — that needs
    # slow_valid/online gating (see images_group_env_ids etc. below).
    enable_images = bool(entry_config.get(CONF_ENABLE_IMAGES, False))
    enable_networks = bool(entry_config.get(CONF_ENABLE_NETWORKS, False))
    enable_volumes = bool(entry_config.get(CONF_ENABLE_VOLUMES, False))
    schedules_feature_enabled = bool(entry_config.get(CONF_ENABLE_SCHEDULES, False))

    env_ids: set[int] = set(fast_data.keys())
    containers: set[str] = set()
    stacks: set[str] = set()
    # Env IDs that have at least one freestanding (non-Compose) container.
    # The Containers group device is only valid when this set includes the env_id.
    containers_group_env_ids: set[int] = set()
    # Env IDs that have at least one stack, period — no freestanding-only
    # distinction the way containers has, since every stack counts. The
    # Stacks group device is only valid when this set includes the env_id.
    stacks_group_env_ids: set[int] = set()
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

    # Which envs' containers/stacks fetch specifically succeeded this cycle
    # (see coordinator.py's DockhandFastCoordinator._fetch and _unwrap's own
    # doc comment) — the highest-stakes version of the fetch_failures
    # pattern in this whole file, since containers/stacks are what
    # determines the single most commonly-used entities this integration
    # creates. An env absent from containers_fetch_ok_env_ids means don't
    # trust this env's absence from `containers`/`containers_group_env_ids`/
    # every container-derived uid set below as confirmed-empty — same for
    # stacks_fetch_ok_env_ids and `stacks`/every stack-derived uid set.
    containers_fetch_ok_env_ids: set[int] = set()
    stacks_fetch_ok_env_ids: set[int] = set()

    for env_id, env_data in fast_data.items():
        has_freestanding = False
        stats = env_data.get("stats") or {}
        update_check_enabled = bool(stats.get("updateCheckEnabled"))
        env_failures: set[str] = env_data.get("fetch_failures") or set()
        env_containers = env_data.get("containers") or []
        pending_updates = env_data.get("pending_update_container_ids") or set()
        system_ids = {
            c.get("id")
            for c in env_containers
            if c.get("systemContainer") and c.get("id")
        }
        update_env_data = update_data.get(env_id)
        if "containers" not in env_failures:
            containers_fetch_ok_env_ids.add(env_id)
            if update_entities_enabled and any(
                _container_has_pending_update(c, pending_updates, update_env_data)
                for c in env_containers
                if c.get("id") not in system_ids
            ):
                bulk_update_uids.add(f"{entry.entry_id}_{env_id}_bulk_update")
            for c in env_containers:
                name = c.get("name", "")
                if name:
                    containers.add(_device_id_container(entry.entry_id, env_id, name))
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
                    if (
                        runtime_controls_enabled
                        and name
                        and not c.get("systemContainer")
                    ):
                        for suffix in _RUNTIME_CONTROL_SUFFIXES:
                            runtime_control_uids.add(
                                f"{entry.entry_id}_{env_id}_container_{name}_{suffix}"
                            )
            if has_freestanding:
                containers_group_env_ids.add(env_id)
        if "stacks" not in env_failures:
            stacks_fetch_ok_env_ids.add(env_id)
            for s in env_data.get("stacks") or []:
                stack_name = s["name"]
                stacks.add(_device_id_stack(entry.entry_id, env_id, stack_name))
                stacks_group_env_ids.add(env_id)
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
    # Top-level fetch failures (environments/schedules — see coordinator.py's
    # DockhandSlowCoordinator._fetch and _unwrap's own doc comment for why
    # this exists): a poll can report last_update_success=True while one of
    # its own sub-fetches actually failed and got silently defaulted to
    # empty. Without checking this too, "schedules" ending up empty because
    # its own fetch failed looks identical to "genuinely zero schedules,"
    # and downstream cleanup would wrongly treat every existing schedule as
    # confirmed-deleted — a real, reported incident this closes.
    top_failures: set[str] = slow_data.get("fetch_failures") or set()

    # Only populate schedule live set when schedules are enabled AND their
    # own fetch actually succeeded this cycle — not just when the overall
    # slow poll did. When disabled, slow_data has schedules=[] — treat as
    # "not loaded", not "deleted"; same treatment now applies when enabled
    # but the schedules fetch itself specifically failed.
    schedules_enabled = (
        slow.last_update_success
        and "schedules" not in top_failures
        and bool(entry_config.get(CONF_ENABLE_SCHEDULES, False))
    )

    schedules: set[str] = set()
    schedule_env_group_ids: set[int] = set()
    image_uids: set[str] = set()
    network_uids: set[str] = set()
    volume_uids: set[str] = set()
    images_group_env_ids: set[int] = set()
    networks_group_env_ids: set[int] = set()
    volumes_group_env_ids: set[int] = set()
    git_stack_uids: set[str] = set()
    # Which envs' fetch for each of these four resources specifically
    # succeeded this cycle, regardless of whether the result was empty or
    # not — the same "did this genuinely happen, not just look empty"
    # distinction schedules_enabled now makes above, but per-environment
    # and per-resource, since images/networks/volumes/git_stacks are
    # fetched independently for each environment and any one of them can
    # fail while the others succeed. An env absent from one of these sets
    # means "don't trust this resource's absence from the corresponding
    # *_group_env_ids/uids set below as confirmed-empty" — same as if the
    # whole env fetch had failed, just scoped to the one resource that
    # actually did.
    images_fetch_ok_env_ids: set[int] = set()
    networks_fetch_ok_env_ids: set[int] = set()
    volumes_fetch_ok_env_ids: set[int] = set()
    git_stacks_fetch_ok_env_ids: set[int] = set()

    if slow_valid:
        # Only populate when enabled — empty list when disabled is not "deleted".
        if schedules_enabled:
            for sched in slow_data.get("schedules") or []:
                if sched.get("id") is not None:
                    schedules.add(
                        _device_id_schedule(entry.entry_id, sched["id"], sched["type"])
                    )
                    sched_env_id = sched.get("environmentId")
                    if sched_env_id is not None:
                        schedule_env_group_ids.add(sched_env_id)

        for env_id, env_data in slow_env_map.items():
            env_failures: set[str] = env_data.get("fetch_failures") or set()

            if "images" not in env_failures:
                images_fetch_ok_env_ids.add(env_id)
                for img in env_data.get("images") or []:
                    raw_id = img.get("id") or ""
                    short_id = raw_id.split(":")[-1] if ":" in raw_id else raw_id
                    image_uids.add(f"{entry.entry_id}_{env_id}_image_{short_id}")
                    images_group_env_ids.add(env_id)
            if "networks" not in env_failures:
                networks_fetch_ok_env_ids.add(env_id)
                for net in env_data.get("networks") or []:
                    net_id = net.get("id", "")
                    network_uids.add(f"{entry.entry_id}_{env_id}_network_{net_id}")
                    networks_group_env_ids.add(env_id)
            if "volumes" not in env_failures:
                volumes_fetch_ok_env_ids.add(env_id)
                for vol in env_data.get("volumes") or []:
                    vname = vol.get("name") or vol.get("Name", "")
                    volume_uids.add(f"{entry.entry_id}_{env_id}_volume_{vname}")
                    volumes_group_env_ids.add(env_id)
            # Git stack entities — always fetched (not config-gated), live
            # on the stack's own device, but only exist while Dockhand
            # still classifies that stack as git-tracked, so (like runtime
            # controls) they need explicit tracking rather than relying
            # purely on device-removal cascade.
            if "git_stacks" not in env_failures:
                git_stacks_fetch_ok_env_ids.add(env_id)
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
        "stacks_group_env_ids": stacks_group_env_ids,
        "containers_fetch_ok_env_ids": containers_fetch_ok_env_ids,
        "stacks_fetch_ok_env_ids": stacks_fetch_ok_env_ids,
        "schedules": schedules,
        "schedules_enabled": schedules_enabled,
        "schedules_feature_enabled": schedules_feature_enabled,
        "schedule_env_group_ids": schedule_env_group_ids,
        "enable_images": enable_images,
        "enable_networks": enable_networks,
        "enable_volumes": enable_volumes,
        "images_group_env_ids": images_group_env_ids,
        "networks_group_env_ids": networks_group_env_ids,
        "volumes_group_env_ids": volumes_group_env_ids,
        "images_fetch_ok_env_ids": images_fetch_ok_env_ids,
        "networks_fetch_ok_env_ids": networks_fetch_ok_env_ids,
        "volumes_fetch_ok_env_ids": volumes_fetch_ok_env_ids,
        "git_stacks_fetch_ok_env_ids": git_stacks_fetch_ok_env_ids,
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
    - Images/Networks/Volumes/Schedules group devices are each removed either
      when their feature toggle is off entirely (checked via the raw config
      flag, poll-independent) or when the feature is on but confirmed empty
      (checked via slow_valid + online_env_ids, same two-case safety rule as
      everything else in this function). The Containers group has no toggle
      of its own, so only the "confirmed empty" case applies to it.
    - Schedule device cleanup (schedules_hub, each env's Schedules group, and
      every individual schedule device) uses the same feature-toggle-off vs.
      confirmed-gone split. Toggling "Enable schedules" off removes all three
      layers unconditionally — via_device parenting does not cascade removal
      in HA's device registry, so each layer needs its own explicit check.
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

            # All Dockhand device identifiers are scoped to the config entry:
            # "{entry_id}_{bare_identifier}".  Skip devices that belong to a
            # different entry (shouldn't happen, but be defensive) and strip
            # the prefix so the bare-identifier checks below stay readable.
            entry_prefix = f"{entry.entry_id}_"
            if not identifier.startswith(entry_prefix):
                continue
            bare = identifier[len(entry_prefix) :]

            if bare.startswith("container_"):
                # Container identifiers: container_{env_id}_{name}
                # Name-based so devices survive container recreation.
                # Extract env_id from position [1] for the per-env offline guard.
                try:
                    env_id = int(bare.split("_")[1])
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
                    elif (
                        env_id in live["online_env_ids"]
                        and env_id in live["containers_fetch_ok_env_ids"]
                    ):
                        # Env exists, is online, and its containers fetch
                        # actually succeeded this cycle — container was
                        # removed.
                        _LOGGER.debug(
                            "Dockhand: removing stale container device %s", identifier
                        )
                        dev_registry.async_remove_device(device.id)
                    else:
                        _LOGGER.debug(
                            "Dockhand: env offline or containers fetch failed, "
                            "skipping container cleanup: %s",
                            identifier,
                        )

            elif bare.startswith("stack_"):
                # Stack identifiers are "stack_{env_id}_{name}" — extract env_id
                # for the same precise per-env offline guard.
                try:
                    env_id = int(bare.split("_")[1])
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
                    elif (
                        env_id in live["online_env_ids"]
                        and env_id in live["stacks_fetch_ok_env_ids"]
                    ):
                        # Env exists, is online, and its stacks fetch
                        # actually succeeded this cycle — stack was removed.
                        _LOGGER.debug(
                            "Dockhand: removing stale stack device %s", identifier
                        )
                        dev_registry.async_remove_device(device.id)
                    else:
                        _LOGGER.debug(
                            "Dockhand: env offline or stacks fetch failed, "
                            "skipping stack cleanup: %s",
                            identifier,
                        )

            elif bare.startswith("env_"):
                # Covers both env hub devices ("env_5") and group devices
                # ("env_5_Containers", "env_5_Stacks", "env_5_Schedules",
                # etc.) — all keyed to the same env_id in position [1] after
                # splitting on "_".
                try:
                    env_id = int(bare.split("_")[1])
                except ValueError:
                    continue
                if env_id not in live["env_ids"]:
                    # Environment deleted from Dockhand — remove unconditionally.
                    # This also covers every group device parented to it
                    # (Containers/Images/Networks/Volumes/Schedules), since
                    # they all share this same "env_{env_id}_*" identifier
                    # prefix and this branch doesn't distinguish further once
                    # the environment itself is gone.
                    _LOGGER.debug(
                        "Dockhand: removing stale env/group device %s", identifier
                    )
                    dev_registry.async_remove_device(device.id)
                    continue

                # Environment still exists — check each group device for
                # either "feature toggled off entirely" (poll-independent,
                # safe to check unconditionally) or "feature on but confirmed
                # empty" (needs the online/slow_valid two-case safety rule,
                # since a temporarily unreachable host or a failed slow poll
                # must not be mistaken for "actually empty now").
                if bare == f"env_{env_id}_Containers":
                    if (
                        env_id in live["online_env_ids"]
                        and env_id in live["containers_fetch_ok_env_ids"]
                        and env_id not in live["containers_group_env_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing empty Containers group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)
                elif bare == f"env_{env_id}_Stacks":
                    if (
                        env_id in live["online_env_ids"]
                        and env_id in live["stacks_fetch_ok_env_ids"]
                        and env_id not in live["stacks_group_env_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing empty Stacks group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)
                elif bare == f"env_{env_id}_Images":
                    if not live["enable_images"] or (
                        live["slow_valid"]
                        and env_id in live["online_env_ids"]
                        and env_id in live["images_fetch_ok_env_ids"]
                        and env_id not in live["images_group_env_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing stale/empty Images group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)
                elif bare == f"env_{env_id}_Networks":
                    if not live["enable_networks"] or (
                        live["slow_valid"]
                        and env_id in live["online_env_ids"]
                        and env_id in live["networks_fetch_ok_env_ids"]
                        and env_id not in live["networks_group_env_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing stale/empty Networks group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)
                elif bare == f"env_{env_id}_Volumes":
                    if not live["enable_volumes"] or (
                        live["slow_valid"]
                        and env_id in live["online_env_ids"]
                        and env_id in live["volumes_fetch_ok_env_ids"]
                        and env_id not in live["volumes_group_env_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing stale/empty Volumes group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)
                elif bare == f"env_{env_id}_Schedules":
                    if not live["schedules_feature_enabled"] or (
                        live["schedules_enabled"]
                        and env_id in live["online_env_ids"]
                        and env_id not in live["schedule_env_group_ids"]
                    ):
                        _LOGGER.debug(
                            "Dockhand: removing stale/empty Schedules group for env %s",
                            env_id,
                        )
                        dev_registry.async_remove_device(device.id)

            elif bare == "schedules_hub":
                # Remove the schedules hub device when schedules are disabled
                # in the config. It has no cleanup path otherwise since it has
                # no env_id and is not in any live set. Uses the raw config
                # flag (poll-independent), not schedules_enabled, since the
                # latter is also gated on a successful slow poll and would
                # wrongly fire during a transient slow-coordinator failure.
                if not live["schedules_feature_enabled"]:
                    _LOGGER.debug("Dockhand: removing stale schedules_hub device")
                    dev_registry.async_remove_device(device.id)

            elif bare.startswith("schedule_"):
                # Two removal cases: the feature is off entirely (poll-
                # independent — remove unconditionally, same as schedules_hub
                # above), or the feature is on, the slow coordinator has valid
                # data, and this specific schedule is confirmed gone. Fixes a
                # real gap: previously this branch only checked the second
                # case, so disabling "Enable schedules" removed schedules_hub
                # but left every individual schedule device un-parented (HA's
                # device registry clears via_device_id on removal, it does
                # not cascade-remove — confirmed against HA core's
                # device_registry.py) and never actually removed.
                if not live["schedules_feature_enabled"] or (
                    live["schedules_enabled"] and identifier not in live["schedules"]
                ):
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
                and env_id in live["images_fetch_ok_env_ids"]
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
                and env_id in live["networks_fetch_ok_env_ids"]
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
                and env_id in live["volumes_fetch_ok_env_ids"]
                and uid not in live["volume_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale volume entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "update":
            env_id = uid_env_id
            # Tier 1 is entirely fast-data-derived, specifically from the
            # same containers fetch as `containers` itself — needs the
            # same containers_fetch_ok_env_ids gating as everything else
            # derived from that fetch (see docs/ARCHITECTURE.md §9).
            # Remove if env deleted, or if env is online, its containers
            # fetch actually succeeded, and the update entity is gone.
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and env_id in live["containers_fetch_ok_env_ids"]
                and uid not in live["update_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale update entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)

        elif uid_type == "bulk" and uid.endswith("_bulk_update"):
            # Env-level "Update all" button. Conditionally present, not
            # just conditionally enabled — mirrors Dockhand's own button
            # disappearing entirely once there's nothing left to update,
            # rather than going idle/disabled. Same containers-fetch
            # reliability as the Tier 1 update entities above.
            env_id = uid_env_id
            if env_id not in live["env_ids"] or (
                env_id in live["online_env_ids"]
                and env_id in live["containers_fetch_ok_env_ids"]
                and uid not in live["bulk_update_uids"]
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
                and env_id in live["containers_fetch_ok_env_ids"]
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
                and env_id in live["containers_fetch_ok_env_ids"]
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
                and env_id in live["containers_fetch_ok_env_ids"]
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
                env_id in live["online_env_ids"]
                and env_id in live["containers_fetch_ok_env_ids"]
                and uid not in live["health_uids"]
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
                and env_id in live["git_stacks_fetch_ok_env_ids"]
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
                and env_id in live["stacks_fetch_ok_env_ids"]
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
                and env_id in live["stacks_fetch_ok_env_ids"]
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
                and env_id in live["stacks_fetch_ok_env_ids"]
                and uid not in live["stack_deploy_uids"]
            ):
                _LOGGER.debug("Dockhand: removing stale stack deploy entity %s", uid)
                ent_registry.async_remove(entity_entry.entity_id)


async def async_unload_entry(hass: HomeAssistant, entry: DockhandConfigEntry) -> bool:
    """Unload Dockhand config entry."""
    # runtime_data is cleaned up automatically by HA.
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
