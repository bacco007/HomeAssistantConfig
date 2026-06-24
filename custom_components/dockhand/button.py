from typing import Any

from homeassistant.components.button import ButtonEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_API_URL
from .coordinator import DockhandFastCoordinator, DockhandUpdateCoordinator
from .helpers import _compose_project, _container_device, _env_device, _stack_device

# Coordinator-based platform. 0 = no HA-level parallel update limit;
# the coordinator serialises data access.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    fast: DockhandFastCoordinator = entry.runtime_data.fast_coordinator
    update_coordinator: DockhandUpdateCoordinator | None = (
        entry.runtime_data.update_coordinator
    )
    client = entry.runtime_data.client
    base_url: str = entry.data.get(CONF_API_URL, "")

    known_container_keys: set[str] = set()
    known_stack_ids: set[str] = set()
    known_env_update_ids: set[int] = set()

    def _build_entities() -> list[ButtonEntity]:
        new: list[ButtonEntity] = []
        for env_id, env_data in (fast.data or {}).items():
            stats = env_data.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")

            # Per-environment "Check for image updates" button — only when
            # the update coordinator is active.
            if update_coordinator is not None and env_id not in known_env_update_ids:
                known_env_update_ids.add(env_id)
                new.append(
                    DockhandCheckUpdatesButton(
                        fast,
                        update_coordinator,
                        entry.entry_id,
                        env_id,
                        env_name,
                        base_url,
                    )
                )

            for container in env_data.get("containers") or []:
                key = f"{env_id}_{container.get('name', '')}"
                if key not in known_container_keys:
                    known_container_keys.add(key)
                    new.append(
                        DockhandContainerRestartButton(
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
                        DockhandStackRestartButton(
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


class _BaseFastContainerButton(
    CoordinatorEntity[DockhandFastCoordinator], ButtonEntity
):
    """Common base for per-container buttons."""

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


class _BaseFastStackButton(CoordinatorEntity[DockhandFastCoordinator], ButtonEntity):
    """Common base for per-stack buttons."""

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

    @property
    def device_info(self) -> DeviceInfo:
        return _stack_device(
            self._stack_name, self._env_id, self._env_name, self._base_url
        )


class DockhandContainerRestartButton(_BaseFastContainerButton):
    """Restart a running container."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "restart"

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
            f"{self._entry_id}_{self._env_id}_container_{self._container_name}_restart"
        )

    async def async_press(self) -> None:
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            await self._client.async_restart_container(self._env_id, c["id"])
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()


class DockhandStackRestartButton(_BaseFastStackButton):
    """Restart a running compose stack."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "restart"

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
            f"{self._entry_id}_{self._env_id}_stack_{self._stack_name}_restart"
        )

    async def async_press(self) -> None:
        try:
            await self._client.async_restart_stack(self._env_id, self._stack_name)
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_request_refresh()


class DockhandCheckUpdatesButton(
    CoordinatorEntity[DockhandFastCoordinator], ButtonEntity
):
    """Trigger an immediate image update check for all containers in an environment.

    Attached to the environment device. Pressing it calls
    async_request_refresh() on the DockhandUpdateCoordinator, which runs
    POST /api/containers/check-updates for all environments (the coordinator
    always fetches all envs in one gather), so pressing any environment's
    button effectively refreshes update state across all environments.

    Only created when CONF_ENABLE_UPDATES is True.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "check_updates"

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        update_coordinator: DockhandUpdateCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
    ) -> None:
        super().__init__(fast_coordinator)
        self._update_coordinator = update_coordinator
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._attr_unique_id = f"{entry_id}_{env_id}_check_updates"

    @property
    def device_info(self) -> DeviceInfo:
        return _env_device(self._env_id, self._env_name, self._base_url)

    async def async_press(self) -> None:
        try:
            await self._update_coordinator.async_request_refresh()
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
