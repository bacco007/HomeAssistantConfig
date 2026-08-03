from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_API_URL
from .coordinator import DockhandFastCoordinator, DockhandSlowCoordinator
from .helpers import (
    _all_envs,
    _coordinator_env,
    _env_device,
    _find_stack,
    _stack_device,
    already_registered,
)

# Coordinator-based read-only platform.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    fast: DockhandFastCoordinator = entry.runtime_data.fast_coordinator
    slow: DockhandSlowCoordinator = entry.runtime_data.slow_coordinator
    base_url: str = entry.data.get(CONF_API_URL, "")

    known_ids = entry.runtime_data.known_entity_ids

    def _build_fast_entities() -> list[BinarySensorEntity]:
        new: list[BinarySensorEntity] = []
        for env_id, env_data in _all_envs(fast.data).items():
            stats = env_data.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")
            online_sensor = DockhandEnvOnlineSensor(
                fast, slow, entry.entry_id, env_id, base_url
            )
            if not already_registered(
                hass, known_ids, "binary_sensor", online_sensor.unique_id
            ):
                new += [
                    online_sensor,
                    DockhandEnvCollectActivitySensor(
                        fast, entry.entry_id, env_id, base_url
                    ),
                    DockhandEnvCollectMetricsSensor(
                        fast, entry.entry_id, env_id, base_url
                    ),
                    DockhandEnvScannerEnabledSensor(
                        fast, entry.entry_id, env_id, base_url
                    ),
                    DockhandEnvUpdateCheckSensor(
                        fast, entry.entry_id, env_id, base_url
                    ),
                    DockhandEnvAutoUpdateSensor(fast, entry.entry_id, env_id, base_url),
                ]
            for stack in env_data.get("stacks") or []:
                if "updatesAvailable" not in stack:
                    continue
                stack_sensor = DockhandStackUpdatesAvailableBinarySensor(
                    fast, entry.entry_id, env_id, env_name, base_url, stack
                )
                if not already_registered(
                    hass, known_ids, "binary_sensor", stack_sensor.unique_id
                ):
                    new.append(stack_sensor)
        return new

    def _build_slow_entities() -> list[BinarySensorEntity]:
        new: list[BinarySensorEntity] = []
        slow_envs = _all_envs(slow.data)
        fast_data = _all_envs(fast.data)
        for env_id, env_data in slow_envs.items():
            fast_stats = (fast_data.get(env_id) or {}).get("stats") or {}
            env_name = fast_stats.get("name", f"Environment {env_id}")

            image_prune_sensor = DockhandEnvImagePruneBinarySensor(
                slow, entry.entry_id, env_id, env_name, base_url
            )
            if not already_registered(
                hass, known_ids, "binary_sensor", image_prune_sensor.unique_id
            ):
                new.append(image_prune_sensor)

            for git_stack in env_data.get("git_stacks") or []:
                git_sensor = DockhandGitStackSyncErrorBinarySensor(
                    slow,
                    entry.entry_id,
                    env_id,
                    env_name,
                    base_url,
                    git_stack,
                )
                if not already_registered(
                    hass, known_ids, "binary_sensor", git_sensor.unique_id
                ):
                    new.append(git_sensor)
        return new

    async_add_entities(_build_fast_entities())
    async_add_entities(_build_slow_entities())
    entry.async_on_unload(
        fast.async_add_listener(lambda: async_add_entities(_build_fast_entities()))
    )
    entry.async_on_unload(
        slow.async_add_listener(lambda: async_add_entities(_build_slow_entities()))
    )


class BaseEnvBinarySensor(
    CoordinatorEntity[DockhandFastCoordinator], BinarySensorEntity
):
    """Base for all environment-level binary sensors."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._env_id = env_id
        self._base_url = base_url

    def _stats(self) -> dict:
        return _coordinator_env(self.coordinator.data, self._env_id).get("stats") or {}

    @property
    def device_info(self) -> DeviceInfo:
        stats = self._stats()
        env_name = stats.get("name", f"Environment {self._env_id}")
        return _env_device(self._env_id, env_name, self._base_url, stats)


class DockhandEnvOnlineSensor(BaseEnvBinarySensor):
    """Environment connectivity — also carries a few identifying
    attributes (name, Docker connection host/port, user-assigned labels)
    for dashboard cards that want them without cross-referencing the
    device registry."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_translation_key = "online"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        slow_coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._slow_coordinator = slow_coordinator
        self._attr_unique_id = f"{entry_id}_{env_id}_online"

    @property
    def is_on(self) -> bool:
        return bool(self._stats().get("online", False))

    def _env_meta(self) -> dict:
        slow_data = self._slow_coordinator.data or {}
        env = _coordinator_env(slow_data, self._env_id)
        return env.get("env_meta") or {}

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        meta = self._env_meta()
        labels = self._stats().get("labels")
        return {
            "name": self._stats().get("name"),
            "connection_host": meta.get("connectionHost"),
            "connection_port": meta.get("connectionPort"),
            "labels": labels if isinstance(labels, list) else [],
        }


class DockhandEnvCollectActivitySensor(BaseEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "activity_logging"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_collect_activity"

    @property
    def is_on(self) -> bool | None:
        v = self._stats().get("collectActivity")
        return bool(v) if v is not None else None


class DockhandEnvCollectMetricsSensor(BaseEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "metrics_collection"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_collect_metrics"

    @property
    def is_on(self) -> bool | None:
        v = self._stats().get("collectMetrics")
        return bool(v) if v is not None else None


class DockhandEnvScannerEnabledSensor(BaseEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "vulnerability_scanning"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_scanner_enabled"

    @property
    def is_on(self) -> bool | None:
        v = self._stats().get("scannerEnabled")
        return bool(v) if v is not None else None


class DockhandEnvUpdateCheckSensor(BaseEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "update_checks"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_update_check_enabled"

    @property
    def is_on(self) -> bool | None:
        v = self._stats().get("updateCheckEnabled")
        return bool(v) if v is not None else None


class DockhandEnvAutoUpdateSensor(BaseEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "auto_update"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_auto_update"

    @property
    def is_on(self) -> bool | None:
        v = self._stats().get("updateCheckAutoUpdate")
        return bool(v) if v is not None else None


class DockhandEnvImagePruneBinarySensor(
    CoordinatorEntity[DockhandSlowCoordinator], BinarySensorEntity
):
    """Whether automatic image pruning is enabled for this environment.

    Sourced from env_meta (imagePruneEnabled), one of the four fields
    extracted from /api/environments — see coordinator.py's
    DockhandSlowCoordinator docstring for why that endpoint is used only
    for this narrow purpose (the raw response, which includes
    tlsKey/hawserToken fully decrypted with no redaction on Dockhand's
    side, is never stored).
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "image_pruning"

    def __init__(
        self,
        coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
    ) -> None:
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._attr_unique_id = f"{entry_id}_{env_id}_image_prune_enabled"

    def _env_meta(self) -> dict:
        slow_data = self.coordinator.data or {}
        env = _coordinator_env(slow_data, self._env_id)
        return env.get("env_meta") or {}

    @property
    def is_on(self) -> bool | None:
        return bool(self._env_meta().get("imagePruneEnabled"))

    @property
    def device_info(self) -> DeviceInfo:
        return _env_device(self._env_id, self._env_name, self._base_url)


class DockhandStackUpdatesAvailableBinarySensor(
    CoordinatorEntity[DockhandFastCoordinator], BinarySensorEntity
):
    """Whether any container in this stack has a pending image update.

    Sourced from /api/stacks' updatesAvailable/updateCount fields — added
    in Dockhand 1.0.37, computed server-side from the same pending-update
    data our own Tier 1 update entities already use, just pre-aggregated
    per stack so we don't have to cross-reference containers ourselves
    for the count itself. Dockhand's own stack object doesn't expose
    *which* containers specifically (see pending_container_names below),
    only the count and the boolean.

    Feature-detected rather than version-gated: created only when
    "updatesAvailable" is actually present as a key in the stack's data
    (checked with "in", since False is a real, meaningful value distinct
    from "field doesn't exist on this Dockhand version") — works
    correctly against older Dockhand installs without needing to know
    or compare any specific version number, and adapts automatically if
    Dockhand changes this again later.

    Deliberately no device_class. BinarySensorDeviceClass.PROBLEM was
    tried first and made this look like something was wrong even when a
    routine update is simply available — a real, reported issue, not a
    style preference. BinarySensorDeviceClass.UPDATE was considered as
    the semantically obvious alternative (it exists specifically for
    this: "on means update available, off means up-to-date"), but HA's
    own developer docs explicitly discourage it: "The use of this device
    class should be avoided, please consider using the update entity
    instead." A full update-domain entity at the stack level (matching
    ha-dockhand's own per-container update.py entities) would be the
    idiomatic fix HA's docs point toward, but is a materially bigger
    change than this — a real install-action-capable entity, not a
    read-only summary — so left as a plain, device-class-less binary
    sensor for now (renders as generic On/Off), which at least stops
    misrepresenting a routine update as a problem.
    """

    _attr_has_entity_name = True
    _attr_translation_key = "stack_updates_available"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        stack: dict,
    ) -> None:
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._stack_name = stack.get("name", "")
        self._attr_unique_id = (
            f"{entry_id}_{env_id}_stack_{self._stack_name}_updates_available"
        )

    def _stack(self) -> dict | None:
        return _find_stack(self.coordinator.data, self._env_id, self._stack_name)

    @property
    def is_on(self) -> bool | None:
        s = self._stack()
        if s is None or "updatesAvailable" not in s:
            return None
        return bool(s["updatesAvailable"])

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        s = self._stack()
        if s is None or "updateCount" not in s:
            return None
        env = _coordinator_env(self.coordinator.data, self._env_id)
        # Dockhand's stack object gives us the container ID list and the
        # aggregate update count, but not which of those containers
        # specifically have a pending update — cross-referenced here
        # against the environment's own pending_update_container_ids
        # (the same set DockhandEnvBulkUpdateButton uses), then resolved
        # to names against the environment's full container list, same
        # pattern as DockhandStackStatusSensor's container_names.
        pending_ids = env.get("pending_update_container_ids") or set()
        stack_container_ids = s.get("containers") or []
        env_containers = env.get("containers") or []
        id_to_name = {c.get("id"): c.get("name") for c in env_containers if c.get("id")}
        pending_container_names = sorted(
            (
                id_to_name.get(cid, cid)
                for cid in stack_container_ids
                if cid in pending_ids
            ),
            key=str.lower,
        )
        return {
            "update_count": s["updateCount"],
            "pending_container_names": pending_container_names,
        }

    @property
    def device_info(self) -> DeviceInfo:
        s = self._stack()
        return _stack_device(
            self._stack_name,
            self._env_id,
            self._env_name,
            self._base_url,
            source_type=(s or {}).get("sourceType"),
        )


class DockhandGitStackSyncErrorBinarySensor(
    CoordinatorEntity[DockhandSlowCoordinator], BinarySensorEntity
):
    """On when a git stack's last sync/deploy attempt failed.

    Lives on the same device as the regular Stack — see
    sensor.BaseSlowGitStackSensor for why there's no separate device type.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_translation_key = "git_stack_sync_error"

    def __init__(
        self,
        coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        git_stack: dict,
    ) -> None:
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._stack_name = git_stack.get("stackName", "")
        self._attr_unique_id = (
            f"{entry_id}_{env_id}_stack_{self._stack_name}_git_sync_error"
        )

    def _git_stack(self) -> dict | None:
        slow_data = self.coordinator.data or {}
        env = _coordinator_env(slow_data, self._env_id)
        for gs in env.get("git_stacks") or []:
            if gs.get("stackName") == self._stack_name:
                return gs
        return None

    @property
    def is_on(self) -> bool | None:
        gs = self._git_stack()
        return gs.get("syncStatus") == "error" if gs else None

    @property
    def extra_state_attributes(self) -> dict:
        gs = self._git_stack()
        return {"sync_error": gs.get("syncError")} if gs else {}

    @property
    def device_info(self) -> DeviceInfo:
        return _stack_device(
            self._stack_name,
            self._env_id,
            self._env_name,
            self._base_url,
            source_type="git",
        )
