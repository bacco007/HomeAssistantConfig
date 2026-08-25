"""Switch platform for Synology Pro — Docker container control."""
from __future__ import annotations

import logging

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up Synology Pro switches for Docker containers."""
    coordinator = hass.data[DOMAIN].get(entry.entry_id)

    if not coordinator or not isinstance(coordinator, DataUpdateCoordinator):
        _LOGGER.warning("No coordinator found for switch platform")
        return

    # Read container list from the coordinator data (already fetched
    # during coordinator refresh) — no blocking calls here.
    containers = coordinator.data.get("containers", [])
    entities = []

    for c in containers:
        name = c.get("name", c.get("id", ""))
        container_id = c.get("id", "")
        if name and container_id:
            entities.append(
                DockerContainerSwitch(coordinator, container_id, name)
            )

    _LOGGER.info("Synology Pro: discovered %d container switches", len(entities))
    async_add_entities(entities)


def _get_docker_client(config: dict):
    """Build a synology-api Docker client (blocking, run in executor)."""
    from synology_api.docker_api import Docker

    return Docker(
        config["host"], config["port"],
        config["username"], config["password"],
        secure=config.get("use_ssl", True),
        cert_verify=config.get("verify_ssl", False),
        dsm_version=config.get("dsm_version", 7),
    )


class DockerContainerSwitch(CoordinatorEntity, SwitchEntity):
    """Switch to start/stop a Docker container."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        container_id: str,
        container_name: str,
    ):
        """Initialize."""
        super().__init__(coordinator)
        self._container_id = container_id
        self._container_name = container_name
        self._attr_name = f"Container {container_name}"
        self._attr_unique_id = f"{DOMAIN}_container_{container_id}"
        self._attr_icon = "mdi:docker"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config["host"])},
            "name": f"Synology NAS ({coordinator.config['host']})",
            "manufacturer": "Synology",
        }

    @property
    def is_on(self) -> bool:
        """Return True if container is running, from coordinator data."""
        containers = self.coordinator.data.get("containers", [])
        for c in containers:
            if c.get("id") == self._container_id:
                return c.get("running", False)
        return False

    async def async_turn_on(self, **kwargs):
        """Start the container."""
        await self.hass.async_add_executor_job(self._start_container)

    def _start_container(self):
        config = self.coordinator.config
        docker = _get_docker_client(config)
        # synology-api start_container() takes the container NAME, not id
        docker.start_container(self._container_name)

    async def async_turn_off(self, **kwargs):
        """Stop the container."""
        await self.hass.async_add_executor_job(self._stop_container)

    def _stop_container(self):
        config = self.coordinator.config
        docker = _get_docker_client(config)
        # synology-api stop_container() takes the container NAME, not id
        docker.stop_container(self._container_name)
