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


def _env_url(base_url: str) -> str | None:
    return _section_url(base_url, "environments")


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
        "configuration_url": _env_url(base_url),
        "entry_type": DeviceEntryType.SERVICE,
    }
    if stats:
        conn = stats.get("connectionType")
        if conn:
            info["hw_version"] = conn
    return DeviceInfo(**info)


def _network_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Networks")},
        name=f"{env_name} – Networks",
        manufacturer="Dockhand",
        model="Environment",
        configuration_url=_network_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _volume_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Volumes")},
        name=f"{env_name} – Volumes",
        manufacturer="Dockhand",
        model="Environment",
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


def _stack_device(
    stack_name: str, env_id: int, env_name: str, base_url: str
) -> DeviceInfo:
    """Device info for a Compose stack.

    Name format: "{env_name} – Stacks – {stack_name}"
    HA slugifies this to "{env_slug}_stacks_{name}", producing entity_ids
    unambiguous alongside container entities.
    """
    return DeviceInfo(
        identifiers={(DOMAIN, f"stack_{env_id}_{stack_name}")},
        name=f"{env_name} – Stacks – {stack_name}",
        manufacturer="Dockhand",
        model="Stack",
        configuration_url=_stack_url(base_url),
        via_device=(DOMAIN, f"env_{env_id}_Stacks"),
        entry_type=DeviceEntryType.SERVICE,
    )


def _image_group_device(env_id: int, env_name: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"env_{env_id}_Images")},
        name=f"{env_name} – Images",
        manufacturer="Dockhand",
        model="Environment",
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


def _compose_project(container: dict | None) -> str | None:
    """Return the Compose project name for a container, or None if freestanding.

    Used wherever code needs to distinguish Compose-managed containers from
    freestanding ones, or to determine which stack device to use as via_device.
    Centralises the label key string so it only appears in one place.
    """
    if not container:
        return None
    return (container.get("labels") or {}).get("com.docker.compose.project")


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
            reference them as via_device).
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
        identifiers={(DOMAIN, f"env_{env_id}")},
        name=env_name,
        manufacturer="Dockhand",
        model="Environment",
        configuration_url=_env_url(base_url),
        entry_type=DeviceEntryType.SERVICE,
    )

    # ── Containers group — only when freestanding containers exist ───────────
    if containers is not None:
        has_freestanding = any(not _compose_project(c) for c in containers)
        if has_freestanding:
            registry.async_get_or_create(
                config_entry_id=entry_id,
                identifiers={(DOMAIN, f"env_{env_id}_Containers")},
                name=f"{env_name} – Containers",
                manufacturer="Dockhand",
                model="Environment",
                configuration_url=_container_url(base_url),
                via_device=(DOMAIN, f"env_{env_id}"),
                entry_type=DeviceEntryType.SERVICE,
            )

    # ── Stacks group + individual stack devices ──────────────────────────────
    # Individual stack devices must exist before compose-managed container
    # entities reference them as via_device, or HA logs a warning.
    if stacks:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            identifiers={(DOMAIN, f"env_{env_id}_Stacks")},
            name=f"{env_name} – Stacks",
            manufacturer="Dockhand",
            model="Environment",
            configuration_url=_stack_url(base_url),
            via_device=(DOMAIN, f"env_{env_id}"),
            entry_type=DeviceEntryType.SERVICE,
        )
        for stack in stacks:
            stack_name = stack.get("name", "")
            if stack_name:
                registry.async_get_or_create(
                    config_entry_id=entry_id,
                    identifiers={(DOMAIN, f"stack_{env_id}_{stack_name}")},
                    name=f"{env_name} – Stacks – {stack_name}",
                    manufacturer="Dockhand",
                    model="Stack",
                    configuration_url=_stack_url(base_url),
                    via_device=(DOMAIN, f"env_{env_id}_Stacks"),
                    entry_type=DeviceEntryType.SERVICE,
                )

    # ── Optional slow-coordinator group devices ──────────────────────────────
    if enable_networks and networks:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            identifiers={(DOMAIN, f"env_{env_id}_Networks")},
            name=f"{env_name} – Networks",
            manufacturer="Dockhand",
            model="Environment",
            configuration_url=_network_url(base_url),
            via_device=(DOMAIN, f"env_{env_id}"),
            entry_type=DeviceEntryType.SERVICE,
        )
    if enable_images and images:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            identifiers={(DOMAIN, f"env_{env_id}_Images")},
            name=f"{env_name} – Images",
            manufacturer="Dockhand",
            model="Environment",
            configuration_url=_image_url(base_url),
            via_device=(DOMAIN, f"env_{env_id}"),
            entry_type=DeviceEntryType.SERVICE,
        )
    if enable_volumes and volumes:
        registry.async_get_or_create(
            config_entry_id=entry_id,
            identifiers={(DOMAIN, f"env_{env_id}_Volumes")},
            name=f"{env_name} – Volumes",
            manufacturer="Dockhand",
            model="Environment",
            configuration_url=_volume_url(base_url),
            via_device=(DOMAIN, f"env_{env_id}"),
            entry_type=DeviceEntryType.SERVICE,
        )
