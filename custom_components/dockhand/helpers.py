"""helpers.py — shared URL builders, DeviceInfo factories, and device registration.

Kept in a dedicated module so that __init__.py, sensor.py, binary_sensor.py,
switch.py, and button.py can all import from here without any circular
dependencies.  Platform modules (sensor.py etc.) are loaded lazily by HA and
must never be imported by __init__.py or by each other.
"""

from typing import Any

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN

# Unique_id suffixes for the 8 container-stat sensors (CPU/memory/network/
# block-I/O), matching how each builds self._attr_unique_id in sensor.py.
# Consolidated here from three previously-separate copies (__init__.py,
# migration.py, sensor.py) that had drifted subtly inconsistent — notably,
# sensor.py's copy lacked the leading underscore migration.py's had, and
# was passed straight to str.endswith() without adding one, which
# happened to still work (a bare substring match rather than a real
# suffix-boundary check) but wasn't doing what it looked like it was
# doing. Each string here includes its own leading underscore so every
# call site can use the plain, direct `uid.endswith(CONTAINER_STATS_SUFFIXES)`
# form — str.endswith() natively accepts a tuple of alternatives — rather
# than every caller needing to reconstruct the separator itself.
CONTAINER_STATS_SUFFIXES = (
    "_cpu_percent",
    "_memory_usage",
    "_memory_percent",
    "_memory_limit",
    "_network_rx",
    "_network_tx",
    "_block_read",
    "_block_write",
)

# "_memory_limit" here is a deliberate exact collision with a runtime
# control entity of the same name (number.py) — disambiguated by entity
# domain (number vs sensor) wherever both are in scope, not by suffix
# alone. See __init__.py's entity-registry cleanup pass for the actual
# disambiguation and ARCHITECTURE.md §2 for the full writeup.


def _all_envs(data: dict[str, Any] | None) -> dict[int, dict[str, Any]]:
    """Safely get every environment's slice of a coordinator's data, for
    iterating all of them.

    Null-safe against Dockhand sending an explicit `null` rather than
    omitting a key — `(data or {}).get("environments") or {}`, not
    `data.get("environments", {})`, so an explicit null doesn't crash the
    next `.items()`/`.keys()`/`.values()` call. Real, reported bug
    (github.com/raetha/ha-dockhand/issues/20) that turned out broader
    than the original report suspected — it hit an environment-level
    sensor too, not just per-container ones.
    """
    return (data or {}).get("environments") or {}


def _coordinator_env(data: dict[str, Any] | None, env_id: int) -> dict[str, Any]:
    """Safely get one environment's slice of a coordinator's data — the
    single-environment counterpart to _all_envs() above, built on it
    rather than duplicating its unwrap logic.

    Works identically for the fast, slow, and update coordinators — all
    three now share the same {"environments": {env_id: {...}}} top-level
    shape, so there's nothing coordinator-specific left for this function
    to need to know. (Previously two near-identical functions, _fast_env
    and _slow_env, kept separate on the reasoning that each name
    documented which coordinator a call site expected. That reasoning
    didn't hold up in practice: plenty of call sites had already stopped
    calling either function and used a locally-unwrapped variable
    instead, which undermined the "name as documentation" argument it was
    kept for, while also being outright wrong in six of those places —
    unwrapping "environments" a second time from something already
    unwrapped, silently returning empty every time. One function that
    isn't coordinator-specific removes the "which one do I call" question
    entirely rather than relying on every call site getting a naming
    convention right.)
    """
    return _all_envs(data).get(env_id) or {}


# --------------------------------------------------------------------------- #
# Section URL helpers
# --------------------------------------------------------------------------- #


def _section_url(base_url: str, section: str) -> str | None:
    """Return a Dockhand section URL, or None if base_url is not configured."""
    return f"{base_url.rstrip('/')}/{section}" if base_url else None


def _container_url(base_url: str) -> str | None:
    return _section_url(base_url, "containers")


def _stack_url(base_url: str) -> str | None:
    return _section_url(base_url, "stacks")


def _network_url(base_url: str) -> str | None:
    return _section_url(base_url, "networks")


def _volume_url(base_url: str) -> str | None:
    return _section_url(base_url, "volumes")


def _image_url(base_url: str) -> str | None:
    return _section_url(base_url, "images")


def _env_settings_url(base_url: str, env_id: int) -> str | None:
    """Deep link straight to this environment's edit form.

    Matches Dockhand's own dashboard settings-gear behavior exactly (traced
    from dashboard-header.svelte's openSettings(): goto(`/settings?tab=
    environments&edit=${environmentId}`)).
    """
    base = _section_url(base_url, "settings")
    return f"{base}?tab=environments&edit={env_id}" if base else None


def _schedules_url(base_url: str) -> str | None:
    return _section_url(base_url, "settings/schedules")


# --------------------------------------------------------------------------- #
# Device info helpers
# --------------------------------------------------------------------------- #


def _env_device(
    env_id: int, env_name: str, base_url: str, stats: dict | None = None
) -> DeviceInfo:
    info: dict[str, Any] = {
        "identifiers": {(DOMAIN, f"env_{env_id}")},
        "name": env_name,
        "manufacturer": "Dockhand",
        "model": "Environment",
        "configuration_url": _env_settings_url(base_url, env_id),
        "entry_type": DeviceEntryType.SERVICE,
    }
    if stats:
        conn = stats.get("connectionType")
        if conn:
            info["hw_version"] = conn
    return DeviceInfo(**info)


def _containers_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Containers")},
        name=f"{env_name} – Containers",
        manufacturer="Dockhand",
        model="Environment Group",
        configuration_url=_container_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _stacks_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Stacks")},
        name=f"{env_name} – Stacks",
        manufacturer="Dockhand",
        model="Environment Group",
        configuration_url=_stack_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _network_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Networks")},
        name=f"{env_name} – Networks",
        manufacturer="Dockhand",
        model="Environment Group",
        configuration_url=_network_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _volume_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Volumes")},
        name=f"{env_name} – Volumes",
        manufacturer="Dockhand",
        model="Environment Group",
        configuration_url=_volume_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _container_device(
    container_name: str,
    env_id: int,
    env_name: str,
    base_url: str,
    stack_name: str | None = None,
) -> DeviceInfo:
    """Device info for a container.

    Identifier format: container_{env_id}_{container_name}
    Name format: "{env_name} – Containers – {container_name}"

    HA slugifies the device name to "{env_slug}_containers_{name}", producing
    entity_ids like sensor.myenv_containers_mycontainer_state that are
    unambiguous alongside stack entity_ids like
    sensor.myenv_stacks_mystack_status.

    Name-based so devices persist across container recreation (image updates).
    Docker enforces unique container names per host, making this a safe key.
    """
    if stack_name:
        parent: tuple = (DOMAIN, f"stack_{env_id}_{stack_name}")
    else:
        parent = (DOMAIN, f"env_{env_id}_Containers")
    return DeviceInfo(
        identifiers={(DOMAIN, f"container_{env_id}_{container_name}")},
        name=f"{env_name} – Containers – {container_name}",
        manufacturer="Dockhand",
        model="Container",
        configuration_url=_container_url(base_url),
        via_device=parent,
        entry_type=DeviceEntryType.SERVICE,
    )


_STACK_MODEL_BY_SOURCE_TYPE = {
    "internal": "Internal Stack",
    "git": "Git Stack",
    "external": "Untracked Stack",
}


def _stack_device(
    stack_name: str,
    env_id: int,
    env_name: str,
    base_url: str,
    source_type: str | None = None,
) -> DeviceInfo:
    """Device info for a Compose stack.

    Name format: "{env_name} – Stacks – {stack_name}"
    HA slugifies this to "{env_slug}_stacks_{name}", producing entity_ids
    unambiguous alongside container entities.

    model reflects Dockhand's own sourceType ('internal'/'git'/'external')
    when known — this is how a user tells at a glance why one stack has
    the extra git-stack entities and another doesn't, without needing to
    dig into an attribute. Confirmed from Dockhand's own frontend source
    (routes/stacks/+page.svelte's getStackSource()) that a stack with no
    stackSources DB record at all — one Dockhand only ever discovered via
    running containers, never explicitly created/adopted/git-tracked
    through its own UI — is treated there as sourceType 'external' by
    default (not "unknown"), and displayed there as "Untracked". We match
    that exactly: source_type absent defaults to 'external', which maps
    to "Untracked Stack" here, same as an explicit sourceType='external'
    record. Likely the common case for most self-hosted setups, since
    stacks that predate installing Dockhand were never explicitly
    recorded in its database.
    """
    return DeviceInfo(
        identifiers={(DOMAIN, f"stack_{env_id}_{stack_name}")},
        name=f"{env_name} – Stacks – {stack_name}",
        manufacturer="Dockhand",
        model=_STACK_MODEL_BY_SOURCE_TYPE.get(
            source_type or "external", "Untracked Stack"
        ),
        configuration_url=_stack_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}_Stacks"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _image_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Images")},
        name=f"{env_name} – Images",
        manufacturer="Dockhand",
        model="Environment Group",
        configuration_url=_image_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _sched_key(sched: dict) -> str:
    """Return a stable composite key for a schedule: '<id>_<type>'."""
    return f"{sched['id']}_{sched['type']}"


def _sched_device(
    sched_id: Any,
    sched_type: str,
    sched_name: str,
    base_url: str,
) -> DeviceInfo:
    """DeviceInfo for an individual schedule device.

    Named "Dockhand – Schedules – {name}" so all schedule devices group
    together visually in the HA device list and entity_ids are prefixed
    with dockhand_schedules_{name}.
    """
    key = _sched_key({"id": sched_id, "type": sched_type})
    return DeviceInfo(
        identifiers={(DOMAIN, f"schedule_{key}")},
        name=f"Dockhand – Schedules – {sched_name}",
        manufacturer="Dockhand",
        model="Schedule",
        configuration_url=_schedules_url(base_url),
        via_device=(DOMAIN, "schedules_hub"),
        entry_type=DeviceEntryType.SERVICE,
    )


# --------------------------------------------------------------------------- #
# Container and resource helpers
# --------------------------------------------------------------------------- #


def _image_display_name(image: dict) -> str:
    """Return a human-readable name for an image.

    Prefer the first repoTag (e.g. 'traefik:latest'). Fall back to the
    short 12-char hex ID for untagged/intermediate images.
    API field confirmed camelCase: repoTags, id (with sha256: prefix).
    """
    tags = [t for t in (image.get("repoTags") or []) if t and t != "<none>:<none>"]
    if tags:
        return tags[0]
    raw_id = image.get("id") or ""
    return raw_id.split(":")[-1][:12] if raw_id else "unknown"


def _container_has_healthcheck(container: dict) -> bool:
    """Return True only when the container has a configured health check.

    Docker sets health to 'none' for containers without a HEALTHCHECK
    instruction. We skip entity creation in that case so the HA device
    doesn't show a permanently-unknown Health sensor.
    """
    h = container.get("health")
    return bool(h) and h not in ("none", "unknown")


_TRUTHY_LABEL_VALUES = {"true", "yes", "1"}
_FALSY_LABEL_VALUES = {"false", "no", "0"}


def _stack_has_system_container(stack: dict | None, all_containers: list) -> bool:
    """True if any container belonging to this stack is a Dockhand
    system container (dockhand itself, or a Hawser agent).

    Cross-references the stack's container list against the
    environment's full container list, which already has Dockhand's own
    precomputed systemContainer field (GET /api/containers) — same
    preference for authoritative API data over re-deriving it (there's no
    equivalent field on the stack's own containerDetails, only on the
    plain containers list).

    IMPORTANT: despite the field's plural-noun name, ComposeStackInfo's
    "containers" field is a list of Docker container IDs, not names —
    confirmed from Dockhand's own source (stacks.ts populates it via
    `Array.from(containerIds)`, where containerIds is a Set matched
    against `c.id`, not `c.name`). Matching against container_id here,
    not container_name — this exact mismatch (comparing this list
    against container names) was a real bug that shipped: stack-level
    system-container detection silently never matched anything, for any
    stack, ever.

    Used to suppress destructive actions (restart, running switch) at the
    stack level for any stack that includes Dockhand's own infrastructure
    — restarting or stopping the whole stack would take those containers
    down too. Dockhand's own UI doesn't apply this restriction at the
    stack level (only at the individual-container level, where the
    equivalent client-side check already exists) — we're intentionally
    more conservative here, since a stack action affects every container
    in it, including ones the user may not realize are Dockhand
    infrastructure.
    """
    if not stack:
        return False
    stack_container_ids = set(stack.get("containers") or [])
    if not stack_container_ids:
        return False
    for c in all_containers or []:
        if c.get("id") in stack_container_ids and c.get("systemContainer"):
            return True
    return False


def _container_has_pending_update(
    container: dict,
    pending_ids: set[str],
    update_env_data: dict[str, dict] | None,
) -> bool:
    """True if this specific container currently needs an update, per
    either Tier 1 (Dockhand's own cached pending-updates check) or Tier 2
    (the optional precise digest-based check-updates coordinator).

    Shared by the update entity (update.py) and the env-level bulk
    "Update all" button (button.py, __init__.py's cleanup) so both agree
    on the exact same definition of "needs an update" — previously each
    re-derived this independently and drifted (the button was Tier-1-only
    while the entity preferred Tier 2, and Tier 2's own name-based lookup
    could resurrect a since-recreated container's stale data).

    update_env_data must already be keyed by container_id (the shape
    DockhandUpdateCoordinator's data is fetched in) and, critically, this
    looks it up by the container's *current* id, not by name. A container
    recreated since Tier 2 last ran (the normal effect of an image
    update) gets a new id — its old Tier 2 entry, still sitting under the
    old id, simply won't be found by this lookup, so a resolved update
    can never resurface as "still pending" here just because Tier 2
    hasn't re-polled yet. This self-invalidation is what makes it safe
    to fold Tier 2 into the bulk button's gating at all: a stale entry
    can never contribute a false "yes".
    """
    container_id = container.get("id")
    if not container_id:
        return False
    if container_id in pending_ids:
        return True
    if update_env_data:
        item = update_env_data.get(container_id)
        if item and item.get("hasUpdate"):
            return True
    return False


def _is_update_disabled_by_label(labels: dict | None) -> bool:
    """True only if dockhand.update is explicitly false/no/0 (opt-out model —
    replicates Dockhand's own isUpdateDisabledByLabel() exactly, including
    case-insensitivity and the same truthy/falsy value sets)."""
    if not labels:
        return False
    value = labels.get("dockhand.update")
    if value is None:
        return False
    return value.strip().lower() in _FALSY_LABEL_VALUES


def _compose_project(container: dict | None) -> str | None:
    """Return the Compose project name for a container, or None if freestanding.

    Used wherever code needs to distinguish Compose-managed containers from
    freestanding ones, or to determine which stack device to use as via_device.
    Centralises the label key string so it only appears in one place.
    """
    if not container:
        return None
    return (container.get("labels") or {}).get("com.docker.compose.project")


def _extract_runtime_config(inspect_data: dict) -> dict[str, Any]:
    """Pull the small HostConfig subset runtime-control entities need out of
    a full Docker inspect response (GET /api/containers/{id}/inspect).

    Returns {"memory": int, "nano_cpus": int, "pids_limit": int,
    "restart_policy": str}. Missing/falsy values become the Docker-native
    "unlimited"/"unset" sentinel for that field (0 for memory and CPU, -1
    for pids_limit is preserved as-is since Docker already uses -1 there,
    "" for restart policy) rather than None, so entities have a real
    starting value to display instead of unknown.
    """
    host_config = inspect_data.get("HostConfig") or {}
    restart_policy = host_config.get("RestartPolicy") or {}
    return {
        "memory": host_config.get("Memory") or 0,
        "nano_cpus": host_config.get("NanoCpus") or 0,
        "pids_limit": host_config.get("PidsLimit")
        if host_config.get("PidsLimit") is not None
        else -1,
        "restart_policy": restart_policy.get("Name") or "no",
    }


# --------------------------------------------------------------------------- #
# Device registration — single source of truth
# --------------------------------------------------------------------------- #


def _ensure_hub_devices(
    hass: Any,
    entry_id: str,
    base_url: str,
    schedules: list[dict],
) -> None:
    """Create or update hub-level devices — those that exist once per Dockhand
    instance rather than once per environment.

    Currently manages the Schedules hub and individual schedule devices.
    As Dockhand adds other instance-level features (global settings, system
    health, multi-host config, etc.) their device registration belongs here
    alongside schedules, not in _ensure_env_devices.

    Called from _register_devices (initial setup) and _build_slow_entities
    (live updates). async_get_or_create is idempotent — safe to call on every
    coordinator update.
    """
    registry = dr.async_get(hass)
    registry.async_get_or_create(
        config_entry_id=entry_id,
        identifiers={(DOMAIN, "schedules_hub")},
        name="Dockhand – Schedules",
        manufacturer="Dockhand",
        model="Service",
        configuration_url=_schedules_url(base_url),
        entry_type=DeviceEntryType.SERVICE,
    )
    for sched in schedules:
        if sched.get("id") is None:
            continue
        key = _sched_key(sched)
        sched_name = sched.get("name", f"Schedule {key}")
        registry.async_get_or_create(
            config_entry_id=entry_id,
            identifiers={(DOMAIN, f"schedule_{key}")},
            name=f"Dockhand – Schedules – {sched_name}",
            manufacturer="Dockhand",
            model="Schedule",
            configuration_url=_schedules_url(base_url),
            via_device=(DOMAIN, "schedules_hub"),
            entry_type=DeviceEntryType.SERVICE,
        )


def _ensure_env_devices(
    hass: Any,
    entry_id: str,
    base_url: str,
    env_id: int,
    env_name: str,
    *,
    containers: list[dict] | None = None,
    stacks: list[dict] | None = None,
    networks: list[dict] | None = None,
    images: list[dict] | None = None,
    volumes: list[dict] | None = None,
    enable_networks: bool = False,
    enable_images: bool = False,
    enable_volumes: bool = False,
) -> None:
    """Create or update all device registry entries for a single environment.

    Handles per-environment devices only — the env hub and all its children
    (Containers group, Stacks group, individual stack devices, optional
    Networks/Images/Volumes groups). Called once per environment on every
    coordinator update. For hub-level (instance-wide) devices such as Schedules,
    see _ensure_hub_devices.

    This is the single source of truth for per-environment device registration.
    Both the initial setup path (_register_devices in __init__.py) and the
    live-update path (_ensure_fast_group_devices / _ensure_slow_group_devices
    in sensor.py) call this function, ensuring device names, models, entry_type,
    and via_device relationships are always consistent.

    async_get_or_create is idempotent — calling it when the device already
    exists is a no-op, so it is safe to call on every coordinator update.

    Args:
        containers: Fast coordinator container list for this env. When provided,
            the Containers group device is only created if at least one container
            is freestanding (not Compose-managed). Individual stack devices are
            created for each entry in `stacks`.
        stacks: Fast coordinator stack list. Required to register the Stacks group
            and individual stack devices (needed before Compose container entities
            reference them as via_device). Builds each device via the same
            _stack_device()/_stacks_group_device() factories entity device_info
            properties use — this function still runs on every coordinator
            update while entities' device_info only runs once at entity-add
            time (see module docstring), but there is now only one place that
            actually constructs the DeviceInfo fields, so the two call sites
            can no longer drift out of sync the way they once did (a stack's
            model briefly showing correctly after a reload, then reverting to
            a stale hardcoded value on the next coordinator update).
        networks / images / volumes: Slow coordinator resource lists. Each group
            device is only created when the corresponding enable_* flag is True
            AND the list is non-empty.
    """
    registry = dr.async_get(hass)

    # ── Environment hub — always present ────────────────────────────────────
    # Device names use " – " (U+2013 en-dash) as separator throughout.
    # Both en-dash and hyphen (-) slugify identically, so entity_ids are
    # unaffected by the choice. En-dash is preferred because Docker forbids
    # it in resource names (containers, stacks, etc.) making it unambiguous
    # as a separator — a hyphen could appear in the resource name itself.
    registry.async_get_or_create(
        config_entry_id=entry_id,
        **_env_device(env_id, env_name, base_url),
    )

    # ── Containers group — only when freestanding containers exist ───────────
    if containers is not None:
        has_freestanding = any(not _compose_project(c) for c in containers)
        if has_freestanding:
            registry.async_get_or_create(
                config_entry_id=entry_id,
                **_containers_group_device(env_id, env_name, base_url),
            )

    # ── Stacks group + individual stack devices ──────────────────────────────
    # Individual stack devices must exist before compose-managed container
    # entities reference them as via_device, or HA logs a warning.
    if stacks:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            **_stacks_group_device(env_id, env_name, base_url),
        )
        for stack in stacks:
            stack_name = stack.get("name", "")
            if stack_name:
                registry.async_get_or_create(
                    config_entry_id=entry_id,
                    **_stack_device(
                        stack_name,
                        env_id,
                        env_name,
                        base_url,
                        source_type=stack.get("sourceType"),
                    ),
                )

    # ── Optional slow-coordinator group devices ──────────────────────────────
    if enable_networks and networks:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            **_network_group_device(env_id, env_name, base_url),
        )
    if enable_images and images:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            **_image_group_device(env_id, env_name, base_url),
        )
    if enable_volumes and volumes:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            **_volume_group_device(env_id, env_name, base_url),
        )
