"""Number platform for Dockhand in-place container runtime controls.

Applies changes live via POST /api/containers/{id}/update-runtime, without
recreating the container — see docs/UPDATE_RUNTIME_DESIGN.md. Entities are
only created for stack-less (freestanding) containers: a Compose or git-stack
redeploy would silently discard any in-place change made here, which would be
a worse experience than not offering the control. This also applies to our
own image-update flow (update.py) — recreating a container for an image
update discards these live cgroup tweaks the same way a stack redeploy
would, since both replace the container. That's expected and matches how
Docker itself behaves for any recreate, not something we can prevent.

Gated entirely behind CONF_ENABLE_RUNTIME_CONTROLS: populating "current value"
requires a GET .../inspect call per stack-less container per slow-poll cycle,
a real per-container API cost that other DIAGNOSTIC entities don't have.

State update strategy: optimistic. A successful set_native_value updates the
entity's displayed value immediately (avoiding the impression that nothing
happened, which invites repeated clicks and unnecessary API churn) and is
superseded by the next slow-coordinator poll regardless of outcome.

Docker's own "unlimited" sentinel is used for each field so the value we
show and send matches what `docker inspect` would show:
  Memory:     0 means no limit
  NanoCpus:   0 means no limit (displayed here as CPUs, converted at the
              API boundary: nano_cpus = cpus * 1_000_000_000)
  PidsLimit: -1 means unlimited

Safety: lowering Memory below a container's current usage is not validated
or rejected by Docker — the new cgroup limit is enforced by the kernel
immediately, which can OOM-kill the container's processes. Docker itself
gives no warning for this, so neither can we; instead, after a Memory
change we schedule a one-time delayed check, and if the container has
stopped running shortly after, we revert to the previous value and raise a
repair issue explaining what happened. This is a single bounded attempt,
not a general watchdog — it only fires once per set_native_value call.

Any "warnings" Docker returns on a successful update-runtime call (distinct
from a container failing afterward) surface as a repair issue too, since a
warning means part of the request may not have been applied as asked.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import EntityCategory, UnitOfInformation
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_API_URL, CONF_ENABLE_RUNTIME_CONTROLS, DOMAIN
from .coordinator import DockhandFastCoordinator, DockhandSlowCoordinator
from .helpers import _all_envs, _compose_project, _coordinator_env

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0

# How long after a Memory decrease to check whether the container is still
# running, before deciding whether to auto-revert. Long enough for a kernel
# OOM-kill to have already happened if it was going to.
_MEMORY_SAFETY_CHECK_DELAY_SECONDS = 15


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data = entry.runtime_data

    def _opt(key: str, default: Any) -> Any:
        return entry.options.get(key, entry.data.get(key, default))

    if not _opt(CONF_ENABLE_RUNTIME_CONTROLS, False):
        return

    fast = data.fast_coordinator
    slow = data.slow_coordinator
    base_url: str = entry.data.get(CONF_API_URL, "")

    known: set[str] = set()

    def _build_entities() -> list[NumberEntity]:
        new: list[NumberEntity] = []
        for env_id, env_data in _all_envs(fast.data).items():
            stats = env_data.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")
            slow_env = _coordinator_env(slow.data, env_id)
            host_cpus = (slow_env.get("host") or {}).get("cpus")

            for container in env_data.get("containers") or []:
                if _compose_project(container):
                    continue  # Compose-managed — see module docstring.
                if container.get("systemContainer"):
                    continue  # Dockhand itself, or a Hawser agent — see
                    # switch.py/button.py for the same protection on
                    # start/stop/restart; changing memory/CPU/PID limits
                    # or restart policy on Dockhand's own infrastructure
                    # carries the identical risk (e.g. an over-tight
                    # memory limit OOM-killing Dockhand itself).
                name = container.get("name", "")
                key = f"{env_id}_{name}"
                if not name or key in known:
                    continue
                known.add(key)
                new.append(
                    DockhandContainerMemoryLimitNumber(
                        fast, slow, entry.entry_id, env_id, env_name, base_url, name
                    )
                )
                new.append(
                    DockhandContainerCpuLimitNumber(
                        fast,
                        slow,
                        entry.entry_id,
                        env_id,
                        env_name,
                        base_url,
                        name,
                        host_cpus=host_cpus,
                    )
                )
                new.append(
                    DockhandContainerPidsLimitNumber(
                        fast, slow, entry.entry_id, env_id, env_name, base_url, name
                    )
                )
        return new

    async_add_entities(_build_entities())
    entry.async_on_unload(
        fast.async_add_listener(lambda: async_add_entities(_build_entities()))
    )


class _BaseRuntimeControlNumber(
    CoordinatorEntity[DockhandSlowCoordinator], NumberEntity
):
    """Common base for per-container runtime-control number entities.

    Primary coordinator is the slow one (it carries runtime_config, the
    current values) — the fast coordinator is consulted directly for
    container existence/id/state, matching the dual-coordinator pattern
    ContainerUpdateEntity (update.py) already uses.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = False
    _attr_mode = NumberMode.BOX

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        slow_coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        container_name: str,
    ) -> None:
        super().__init__(slow_coordinator)
        self._fast_coordinator = fast_coordinator
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._container_name = container_name
        self._optimistic_value: float | None = None
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"container_{env_id}_{container_name}")},
        )

    def _container(self) -> dict | None:
        for c in (
            _coordinator_env(self._fast_coordinator.data, self._env_id).get(
                "containers"
            )
            or []
        ):
            if c.get("name") == self._container_name:
                return c
        return None

    def _runtime_config(self) -> dict:
        slow_data = self.coordinator.data or {}
        env = _coordinator_env(slow_data, self._env_id)
        return (env.get("runtime_config") or {}).get(self._container_name) or {}

    @property
    def available(self) -> bool:
        return self._container() is not None and super().available

    def _handle_coordinator_update(self) -> None:
        # A real poll result supersedes any optimistic value we set locally.
        self._optimistic_value = None
        super()._handle_coordinator_update()

    async def _async_apply(self, field: str, api_value: Any) -> dict:
        """POST the change, raising HomeAssistantError on failure.

        Returns Dockhand's raw response dict ({"success", "warnings"}) so
        callers can act on warnings.
        """
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            client = self._fast_coordinator.client
            response = await client.async_update_container_runtime(
                self._env_id, c["id"], {field: api_value}
            )
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err

        warnings = response.get("warnings") or []
        if warnings:
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                f"runtime_update_warning_{self._env_id}_{self._container_name}_{field}",
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="runtime_update_warning",
                translation_placeholders={
                    "container": self._container_name,
                    "field": field,
                    "warnings": "; ".join(str(w) for w in warnings),
                },
            )
        return response


class DockhandContainerMemoryLimitNumber(_BaseRuntimeControlNumber):
    """Live memory limit for a stack-less container. 0 = unlimited."""

    _attr_translation_key = "container_memory_limit"
    _attr_native_unit_of_measurement = UnitOfInformation.BYTES
    _attr_suggested_unit_of_measurement = UnitOfInformation.MEBIBYTES
    _attr_native_min_value = 0
    _attr_native_max_value = 1_099_511_627_776  # 1 TiB — a practical ceiling
    _attr_native_step = 1_048_576  # 1 MiB

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_container_"
            f"{self._container_name}_memory_limit"
        )
        self._cancel_safety_check = None

    async def async_will_remove_from_hass(self) -> None:
        if self._cancel_safety_check is not None:
            self._cancel_safety_check()
            self._cancel_safety_check = None

    @property
    def native_value(self) -> float | None:
        if self._optimistic_value is not None:
            return self._optimistic_value
        return self._runtime_config().get("memory")

    async def async_set_native_value(self, value: float) -> None:
        new_memory = int(value)
        previous = self._runtime_config().get("memory") or 0
        await self._async_apply("Memory", new_memory)
        self._optimistic_value = value
        self.async_write_ha_state()

        # Only schedule the safety check on a decrease — raising the limit,
        # or setting it to 0 (unlimited), can't trigger an OOM-kill.
        if new_memory and (previous == 0 or new_memory < previous):
            if self._cancel_safety_check is not None:
                self._cancel_safety_check()
            self._cancel_safety_check = async_call_later(
                self.hass,
                _MEMORY_SAFETY_CHECK_DELAY_SECONDS,
                self._async_check_and_revert(previous),
            )

    def _async_check_and_revert(self, previous_memory: int):
        async def _check(_now) -> None:
            self._cancel_safety_check = None
            c = self._container()
            if c is None or c.get("state") == "running":
                return  # Still running (or gone) — nothing to revert.
            _LOGGER.warning(
                "Dockhand: container '%s' (env %s) is no longer running"
                " shortly after its memory limit was lowered — reverting"
                " to the previous value (%s bytes)",
                self._container_name,
                self._env_id,
                previous_memory,
            )
            try:
                await self._async_apply("Memory", previous_memory)
            except HomeAssistantError as err:
                _LOGGER.error(
                    "Dockhand: failed to auto-revert memory limit for"
                    " container '%s' (env %s): %s",
                    self._container_name,
                    self._env_id,
                    err,
                )
            self._optimistic_value = previous_memory
            self.async_write_ha_state()
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                f"runtime_memory_reverted_{self._env_id}_{self._container_name}",
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="runtime_memory_reverted",
                translation_placeholders={
                    "container": self._container_name,
                    "memory_bytes": str(previous_memory),
                },
            )

        return _check


class DockhandContainerCpuLimitNumber(_BaseRuntimeControlNumber):
    """Live CPU limit (in CPUs, e.g. 1.5) for a stack-less container.

    0 = unlimited. Converted to/from Docker's NanoCpus at the API boundary
    (1 CPU = 1_000_000_000 NanoCpus).
    """

    _attr_translation_key = "container_cpu_limit"
    _attr_native_min_value = 0
    _attr_native_step = 0.1

    def __init__(self, *args, host_cpus: int | None = None, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_container_"
            f"{self._container_name}_cpu_limit"
        )
        # Fall back to a generous ceiling if /api/host didn't report a CPU
        # count for this environment (e.g. runtime controls just enabled,
        # first slow poll hasn't landed yet).
        self._attr_native_max_value = float(host_cpus) if host_cpus else 64.0

    @property
    def native_value(self) -> float | None:
        if self._optimistic_value is not None:
            return self._optimistic_value
        nano_cpus = self._runtime_config().get("nano_cpus")
        if nano_cpus is None:
            return None
        return round(nano_cpus / 1_000_000_000, 2)

    async def async_set_native_value(self, value: float) -> None:
        nano_cpus = int(value * 1_000_000_000)
        await self._async_apply("NanoCpus", nano_cpus)
        self._optimistic_value = value
        self.async_write_ha_state()


class DockhandContainerPidsLimitNumber(_BaseRuntimeControlNumber):
    """Live process (PID) limit for a stack-less container.

    -1 = unlimited — Docker's own sentinel for this field (matches what
    `docker run --pids-limit -1` and `docker inspect` both show).
    """

    _attr_translation_key = "container_pids_limit"
    _attr_native_min_value = -1
    _attr_native_max_value = 100_000
    _attr_native_step = 1

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_container_"
            f"{self._container_name}_pids_limit"
        )

    @property
    def native_value(self) -> float | None:
        if self._optimistic_value is not None:
            return self._optimistic_value
        pids_limit = self._runtime_config().get("pids_limit")
        return float(pids_limit) if pids_limit is not None else None

    async def async_set_native_value(self, value: float) -> None:
        pids_limit = int(value)
        await self._async_apply("PidsLimit", pids_limit)
        self._optimistic_value = value
        self.async_write_ha_state()
