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
from .helpers import _env_device

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

    known_fast_env_ids: set[int] = set()
    known_slow_env_ids: set[int] = set()

    def _build_fast_entities() -> list[BinarySensorEntity]:
        new: list[BinarySensorEntity] = []
        for env_id in (fast.data or {}).keys():
            if env_id not in known_fast_env_ids:
                known_fast_env_ids.add(env_id)
                new += [
                    DockhandEnvOnlineSensor(fast, entry.entry_id, env_id, base_url),
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
        return new

    def _build_slow_entities() -> list[BinarySensorEntity]:
        new: list[BinarySensorEntity] = []
        for env_id in (slow.data or {}).get("environments", {}).keys():
            if env_id not in known_slow_env_ids:
                known_slow_env_ids.add(env_id)
                new.append(
                    DockhandEnvImagePruneBinarySensor(
                        slow, entry.entry_id, env_id, base_url
                    )
                )
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
        return (self.coordinator.data or {}).get(self._env_id, {}).get("stats") or {}

    @property
    def device_info(self) -> DeviceInfo:
        stats = self._stats()
        env_name = stats.get("name", f"Environment {self._env_id}")
        return _env_device(self._env_id, env_name, self._base_url, stats)


class DockhandEnvOnlineSensor(BaseEnvBinarySensor):
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_translation_key = "online"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_online"

    @property
    def is_on(self) -> bool:
        return bool(self._stats().get("online", False))


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


class BaseSlowEnvBinarySensor(
    CoordinatorEntity[DockhandSlowCoordinator], BinarySensorEntity
):
    """Base for environment binary sensors sourced from the slow coordinator."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._env_id = env_id
        self._base_url = base_url

    def _env_obj(self) -> dict:
        return (self.coordinator.data or {}).get("environments", {}).get(
            self._env_id, {}
        ).get("env") or {}

    @property
    def device_info(self) -> DeviceInfo:
        env_name = self._env_obj().get("name", f"Environment {self._env_id}")
        return _env_device(self._env_id, env_name, self._base_url)


class DockhandEnvImagePruneBinarySensor(BaseSlowEnvBinarySensor):
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_enabled_default = False
    _attr_translation_key = "image_pruning"

    def __init__(
        self,
        coordinator: DockhandSlowCoordinator,
        entry_id: str,
        env_id: int,
        base_url: str,
    ) -> None:
        super().__init__(coordinator, entry_id, env_id, base_url)
        self._attr_unique_id = f"{entry_id}_{env_id}_image_prune_enabled"

    @property
    def is_on(self) -> bool | None:
        v = self._env_obj().get("imagePruneEnabled")
        return bool(v) if v is not None else None
