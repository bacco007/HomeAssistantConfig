"""Custom integration to integrate Docker Socket Proxy with Home Assistant.

For more details about this integration, please refer to
https://github.com/s-t-e-f-a-n/ha_docker_socket_proxy

Sensor platform for Docker Socket Proxy.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util, slugify

from .const import (
    ATTR_CONTAINERS,
    ATTR_DEFAULT_NA,
    ATTR_VERSION,
    CONF_GRACE_PERIOD_ENABLED,
    DEFAULT_GRACE_PERIOD_ENABLED,
    DOMAIN,
)
from .coordinator import DockerProxyCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Docker sensors from a config entry."""
    coordinator: DockerProxyCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Initialize with the Host Status sensor
    entities: list[SensorEntity] = [DockerHostSensor(coordinator, entry)]

    # Track created container IDs to avoid duplicate entity creation
    current_container_ids: set[str] = set()

    @callback
    def async_manage_entities() -> None:
        """Add new container sensors and cleanup orphaned entities from registry."""
        new_entities: list[SensorEntity] = []
        container_data = coordinator.data.get(ATTR_CONTAINERS, {})

        # 1. Discovery: Add new sensors for containers found in coordinator data
        for cid, data in container_data.items():
            if cid not in current_container_ids:
                _LOGGER.debug(
                    "Discovering new Docker container sensor: %s", data.get("Names")
                )
                new_entities.append(DockerContainerSensor(coordinator, cid, entry))
                current_container_ids.add(cid)

        if new_entities:
            async_add_entities(new_entities)

        # 2. Cleanup: Remove orphaned entities from the HA Entity Registry
        cleanup_enabled = entry.options.get(
            CONF_GRACE_PERIOD_ENABLED, DEFAULT_GRACE_PERIOD_ENABLED
        )
        if not cleanup_enabled:
            return

        entity_reg = er.async_get(hass)
        registered_entities = er.async_entries_for_config_entry(
            entity_reg, entry.entry_id
        )

        # Define valid unique IDs (Host sensor + currently tracked containers)
        valid_unique_ids = {f"{entry.entry_id}_host_status"}
        for cid in container_data:
            valid_unique_ids.add(f"{entry.entry_id}_{cid}")

        # Remove entities that are no longer in the valid set (expired grace period)
        for entity_entry in registered_entities:
            if entity_entry.unique_id not in valid_unique_ids:
                _LOGGER.info(
                    "Grace period expired or container purged: %s, removing from registry",
                    entity_entry.entity_id,
                )
                entity_reg.async_remove(entity_entry.entity_id)

                # Cleanup internal tracking set
                cid_from_id = entity_entry.unique_id.replace(f"{entry.entry_id}_", "")
                current_container_ids.discard(cid_from_id)

    # Initial discovery run
    async_manage_entities()

    # Link entity management to coordinator data updates
    entry.async_on_unload(coordinator.async_add_listener(async_manage_entities))

    # Register initial batch of entities
    async_add_entities(entities)


class DockerHostSensor(CoordinatorEntity[DockerProxyCoordinator], SensorEntity):
    """Sensor representing the overall status of a Docker Host."""

    _attr_icon = "mdi:server-network"
    _attr_has_entity_name = True

    def __init__(self, coordinator: DockerProxyCoordinator, entry: ConfigEntry) -> None:
        """Initialize the host sensor."""
        super().__init__(coordinator)
        self._attr_name = "Host Status"
        self._attr_unique_id = f"{entry.entry_id}_host_status"
        self._host_name = entry.title
        self._last_successful_update: str | None = None
        instance_slug = slugify(entry.title)
        self.entity_id = f"sensor.dockersocketproxy_{instance_slug}_host_status"

    @property
    def native_value(self) -> str:
        """Return the formatted host status (e.g., '12/15 running')."""
        return self.coordinator.host_status

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return detailed host metadata from the coordinator's version check."""
        v_info = self.coordinator.data.get(ATTR_VERSION, {})
        host_status = self.coordinator.host_status

        # Update timestamp only if host is available
        # Check for keywords "Unavailable" or "unavailable" in host_status
        if not any(word in host_status for word in ["Unavailable", "unavailable"]):
            self._last_successful_update = dt_util.now().isoformat()

        return {
            "DockerHostname": self.coordinator.docker_hostname,
            "Os": v_info.get("Os", ATTR_DEFAULT_NA),
            "Arch": v_info.get("Arch", ATTR_DEFAULT_NA),
            "Kernel": v_info.get("KernelVersion", ATTR_DEFAULT_NA),
            "InstanceName": self._host_name,
            "PlatformName": v_info.get("Platform", ATTR_DEFAULT_NA),
            "Version": v_info.get("Version", ATTR_DEFAULT_NA),
            "ApiVersion": v_info.get("ApiVersion", ATTR_DEFAULT_NA),
            "last_update": self._last_successful_update,
        }


class DockerContainerSensor(CoordinatorEntity[DockerProxyCoordinator], SensorEntity):
    """Sensor representing an individual Docker container with flattened attributes."""

    def __init__(
        self,
        coordinator: DockerProxyCoordinator,
        container_id: str,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the container sensor."""
        super().__init__(coordinator)
        self._cid = container_id
        self._host_name = entry.title
        self._last_successful_update: str | None = None

        # Initial name fetch for entity identification
        data = self.coordinator.data[ATTR_CONTAINERS].get(self._cid, {})
        clean_name = data.get("Names", "unknown")

        self._attr_name = f"{self._host_name} {clean_name}"
        self._attr_unique_id = f"{entry.entry_id}_{self._cid}"
        self.entity_id = (
            f"sensor.dockersocketproxy_{slugify(self._host_name)}_{slugify(clean_name)}"
        )

    @property
    def native_value(self) -> str:
        """Return the current State of the container (running, exited, removed)."""
        data = self.coordinator.data[ATTR_CONTAINERS].get(self._cid)
        if data:
            return data.get("State", ATTR_DEFAULT_NA)
        return "removed"

    @property
    def icon(self) -> str:
        """Return different icons based on whether the container is running."""
        data = self.coordinator.data[ATTR_CONTAINERS].get(self._cid)
        if data and data.get("State") == "running":
            return "mdi:docker"
        return "mdi:package-variant-closed"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return enriched attributes pre-formatted as strings by the coordinator."""
        data = self.coordinator.data[ATTR_CONTAINERS].get(self._cid)

        if not data:
            return {}

        # Fetch current host status for update timestamp logic
        host_status = self.coordinator.host_status

        # Update timestamp ONLY if host is available
        if not any(word in host_status for word in ["Unavailable", "unavailable"]):
            self._last_successful_update = dt_util.now().isoformat()

        # Directly passing pre-formatted UI strings for flex-table-card compatibility
        return {
            "Names": data.get("Names"),
            "DisplayName": data.get("DisplayName"),
            "Image": data.get("Image"),
            "State": data.get("State"),
            "Uptime": data.get("Uptime"),
            "Health": data.get("Health"),
            "UpdateAvailable": data.get("UpdateAvailable"),
            "Project": data.get("Project"),
            "ServiceUrls": data.get("ServiceUrls"),
            "Created": data.get("Created"),
            "Ports": data.get("Ports"),
            "NetworkSettings": data.get("NetworkSettings"),
            "MacAddress": data.get("MacAddress"),
            "last_update": self._last_successful_update,
        }
