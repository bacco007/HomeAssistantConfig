"""Select platform for Dockhand's in-place restart-policy control.

Same scope and rationale as number.py (see docs/UPDATE_RUNTIME_DESIGN.md and
number.py's module docstring): stack-less containers only, gated behind
CONF_ENABLE_RUNTIME_CONTROLS, optimistic state update. Restart policy has no
OOM-kill-style failure mode the way lowering Memory does, so there's no
auto-revert safety check here — only the shared warnings-to-repair-issue
handling.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.select import SelectEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_ENABLE_RUNTIME_CONTROLS, DOMAIN
from .coordinator import DockhandFastCoordinator, DockhandSlowCoordinator
from .helpers import _all_envs, _compose_project, _coordinator_env

PARALLEL_UPDATES = 0

_RESTART_POLICY_OPTIONS = ["no", "always", "unless-stopped", "on-failure"]


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

    known: set[str] = set()

    def _build_entities() -> list[SelectEntity]:
        new: list[SelectEntity] = []
        for env_id, env_data in _all_envs(fast.data).items():
            for container in env_data.get("containers") or []:
                if _compose_project(container):
                    continue
                if container.get("systemContainer"):
                    continue  # Dockhand itself, or a Hawser agent — same
                    # protection as switch.py/button.py/number.py;
                    # changing restart policy on Dockhand's own
                    # infrastructure could prevent it recovering from a
                    # crash.
                name = container.get("name", "")
                key = f"{env_id}_{name}"
                if not name or key in known:
                    continue
                known.add(key)
                new.append(
                    DockhandContainerRestartPolicySelect(
                        fast, slow, entry.entry_id, env_id, name
                    )
                )
        return new

    async_add_entities(_build_entities())
    entry.async_on_unload(
        fast.async_add_listener(lambda: async_add_entities(_build_entities()))
    )


class DockhandContainerRestartPolicySelect(
    CoordinatorEntity[DockhandSlowCoordinator], SelectEntity
):
    """Restart policy for a stack-less container. Primary coordinator is the
    slow one (carries runtime_config); the fast coordinator is consulted
    directly for container existence/id — same dual-coordinator pattern as
    number.py and ContainerUpdateEntity (update.py)."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "container_restart_policy"
    _attr_options = _RESTART_POLICY_OPTIONS

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        slow_coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        container_name: str,
    ) -> None:
        super().__init__(slow_coordinator)
        self._fast_coordinator = fast_coordinator
        self._entry_id = entry_id
        self._env_id = env_id
        self._container_name = container_name
        self._optimistic_value: str | None = None
        self._attr_unique_id = (
            f"{entry_id}_{env_id}_container_{container_name}_restart_policy"
        )
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
        self._optimistic_value = None
        super()._handle_coordinator_update()

    @property
    def current_option(self) -> str | None:
        if self._optimistic_value is not None:
            return self._optimistic_value
        value = self._runtime_config().get("restart_policy")
        return value if value in _RESTART_POLICY_OPTIONS else None

    async def async_select_option(self, option: str) -> None:
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            response = (
                await self._fast_coordinator.client.async_update_container_runtime(
                    self._env_id, c["id"], {"RestartPolicy": {"Name": option}}
                )
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
                f"runtime_update_warning_{self._env_id}_{self._container_name}"
                "_RestartPolicy",
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="runtime_update_warning",
                translation_placeholders={
                    "container": self._container_name,
                    "field": "RestartPolicy",
                    "warnings": "; ".join(str(w) for w in warnings),
                },
            )

        self._optimistic_value = option
        self.async_write_ha_state()
