from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_API_URL
from .coordinator import DockhandFastCoordinator
from .helpers import _compose_project, _container_device, _stack_device

# Coordinator-based platform. 0 = no HA-level parallel update limit;
# the coordinator serialises data access.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    fast: DockhandFastCoordinator = entry.runtime_data.fast_coordinator
    client = entry.runtime_data.client
    base_url: str = entry.data.get(CONF_API_URL, "")

    known_container_keys: set[str] = set()
    known_stack_ids: set[str] = set()

    def _build_entities() -> list[SwitchEntity]:
        new: list[SwitchEntity] = []
        for env_id, env_data in (fast.data or {}).items():
            stats = env_data.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")

            for container in env_data.get("containers") or []:
                key = f"{env_id}_{container.get('name', '')}"
                if key not in known_container_keys:
                    known_container_keys.add(key)
                    new.append(
                        DockhandContainerRunningSwitch(
                            fast,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            container,
                        )
                    )

            for stack in env_data.get("stacks") or []:
                sid = f"{env_id}_{stack['name']}"
                if sid not in known_stack_ids:
                    known_stack_ids.add(sid)
                    new.append(
                        DockhandStackRunningSwitch(
                            fast,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            stack,
                        )
                    )

        return new

    async_add_entities(_build_entities())
    entry.async_on_unload(
        fast.async_add_listener(lambda: async_add_entities(_build_entities()))
    )


class _BaseFastContainerSwitch(
    CoordinatorEntity[DockhandFastCoordinator], SwitchEntity
):
    """Common base for per-container switches."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        container: dict,
    ) -> None:
        super().__init__(coordinator)
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._container_name = container.get("name", "")

    def _container(self) -> dict | None:
        for c in (self.coordinator.data or {}).get(self._env_id, {}).get(
            "containers"
        ) or []:
            if c.get("name") == self._container_name:
                return c
        return None

    @property
    def device_info(self) -> DeviceInfo:
        c = self._container()
        return _container_device(
            self._container_name,
            self._env_id,
            self._env_name,
            self._base_url,
            _compose_project(c),
        )


class _BaseFastStackSwitch(CoordinatorEntity[DockhandFastCoordinator], SwitchEntity):
    """Common base for per-stack switches."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        stack: dict,
    ) -> None:
        super().__init__(coordinator)
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._stack_name = stack.get("name", "")

    def _stack(self) -> dict | None:
        for s in (self.coordinator.data or {}).get(self._env_id, {}).get(
            "stacks"
        ) or []:
            if s.get("name") == self._stack_name:
                return s
        return None

    @property
    def device_info(self) -> DeviceInfo:
        return _stack_device(
            self._stack_name, self._env_id, self._env_name, self._base_url
        )


class DockhandContainerRunningSwitch(_BaseFastContainerSwitch):
    """Start/stop switch for a container — the primary entity for a Container device.

    No translation_key: with _attr_has_entity_name=True and no translation_key,
    the entity name equals the device name, making this the canonical on/off
    control. Entity_id becomes switch.{env}_containers_{name} with no suffix.
    on=running, off=stopped.
    """

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        container: dict,
    ) -> None:
        super().__init__(
            coordinator, client, entry_id, env_id, env_name, base_url, container
        )
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_container_{self._container_name}_running"
        )

    @property
    def is_on(self) -> bool:
        c = self._container()
        return c.get("state") == "running" if c else False

    async def async_turn_on(self, **kwargs: Any) -> None:
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            await self._client.async_start_container(self._env_id, c["id"])
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            await self._client.async_stop_container(self._env_id, c["id"])
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()


class DockhandStackRunningSwitch(_BaseFastStackSwitch):
    """Start/stop switch for a compose stack — the primary entity for a Stack device.

    No translation_key: with _attr_has_entity_name=True and no translation_key,
    the entity name equals the device name, making this the canonical on/off
    control. Entity_id becomes switch.{env}_stacks_{name} with no suffix.
    """

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        stack: dict,
    ) -> None:
        super().__init__(
            coordinator, client, entry_id, env_id, env_name, base_url, stack
        )
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_stack_{self._stack_name}_running"
        )

    @property
    def is_on(self) -> bool:
        s = self._stack()
        return s.get("status") in ("running", "partial") if s else False

    async def async_turn_on(self, **kwargs: Any) -> None:
        try:
            await self._client.async_start_stack(self._env_id, self._stack_name)
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        try:
            await self._client.async_stop_stack(self._env_id, self._stack_name)
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()
