"""Switch platform for Synology Pro — Docker container control."""
from __future__ import annotations

import logging

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

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

    # Discover containers from coordinator data
    sensors = coordinator.data.get("sensors", {})
    container_count_key = "docker_api.containers"
    container_count = sensors.get(container_count_key, {}).get("value", 0)

    entities = []

    if container_count > 0:
        # Try to get detailed container list
        try:
            containers = _get_containers(coordinator.config)
            for c in containers:
                name = c.get("name", c.get("id", ""))
                container_id = c.get("id", "")
                if name and container_id:
                    entities.append(
                        DockerContainerSwitch(coordinator, container_id, name)
                    )
            _LOGGER.info("Synology Pro: discovered %d container switches", len(entities))
        except Exception as e:
            _LOGGER.debug("Cannot list containers: %s", e)

    async_add_entities(entities)


def _get_containers(config: dict) -> list:
    """Get container list from Docker API."""
    from synology_api.docker_api import Docker

    docker = Docker(
        config["host"], config["port"],
        config["username"], config["password"],
        secure=config.get("use_ssl", True),
        cert_verify=config.get("verify_ssl", False),
        dsm_version=config.get("dsm_version", 7),
    )
    return docker.containers()


class DockerContainerSwitch(SwitchEntity):
    """Switch to start/stop a Docker container."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        container_id: str,
        container_name: str,
    ):
        """Initialize."""
        self.coordinator = coordinator
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
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def is_on(self) -> bool:
        """Return True if container is running."""
        try:
            containers = _get_containers(self.coordinator.config)
            for c in containers:
                if c.get("id") == self._container_id:
                    return c.get("state") == "running"
        except Exception:
            pass
        return False

    async def async_turn_on(self, **kwargs):
        """Start the container."""
        await self.hass.async_add_executor_job(self._start_container)

    def _start_container(self):
        from synology_api.docker_api import Docker
        config = self.coordinator.config
        docker = Docker(
            config["host"], config["port"],
            config["username"], config["password"],
            secure=config.get("use_ssl", True),
            cert_verify=config.get("verify_ssl", False),
            dsm_version=config.get("dsm_version", 7),
        )
        docker.start_container(self._container_id)

    async def async_turn_off(self, **kwargs):
        """Stop the container."""
        await self.hass.async_add_executor_job(self._stop_container)

    def _stop_container(self):
        from synology_api.docker_api import Docker
        config = self.coordinator.config
        docker = Docker(
            config["host"], config["port"],
            config["username"], config["password"],
            secure=config.get("use_ssl", True),
            cert_verify=config.get("verify_ssl", False),
            dsm_version=config.get("dsm_version", 7),
        )
        docker.stop_container(self._container_id)

    async def async_update(self) -> None:
        """Update the entity."""
        await self.coordinator.async_request_refresh()
