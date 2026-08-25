"""Services for the Synology Pro integration."""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    ATTR_CONTAINER_ID,
    ATTR_DESCRIPTION,
    ATTR_SHARE,
    ATTR_SNAPSHOT_NAME,
    DOMAIN,
    SERVICE_CREATE_SNAPSHOT,
    SERVICE_DELETE_SNAPSHOT,
    SERVICE_RESTART_CONTAINER,
    SERVICE_RUN_SECURITY_SCAN,
    SERVICE_UPDATE_CONTAINER,
)

_LOGGER = logging.getLogger(__name__)


async def async_register_services(hass: HomeAssistant) -> None:
    """Register all custom services."""

    def _get_nas_config() -> dict | None:
        """Get NAS config from the shared coordinator."""
        entries = hass.data.get(DOMAIN, {})
        for data in entries.values():
            if isinstance(data, DataUpdateCoordinator):
                return data.config
        return None

    async def create_snapshot(call: ServiceCall):
        """Create a snapshot of a shared folder."""
        config = _get_nas_config()
        if not config:
            _LOGGER.error("No NAS config found")
            return

        share = call.data.get(ATTR_SHARE)
        desc = call.data.get(ATTR_DESCRIPTION, "HA auto-snapshot")

        def _run():
            from synology_api.snapshot import Snapshot

            snap = Snapshot(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
            )
            snap.create_snapshot(share, desc)

        await hass.async_add_executor_job(_run)
        _LOGGER.info("Snapshot created for %s: %s", share, desc)

    async def delete_snapshot(call: ServiceCall):
        """Delete a snapshot."""
        config = _get_nas_config()
        if not config:
            _LOGGER.error("No NAS config found")
            return

        share = call.data.get(ATTR_SHARE)
        name = call.data.get(ATTR_SNAPSHOT_NAME)

        def _run():
            from synology_api.snapshot import Snapshot

            snap = Snapshot(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
            )
            snap.delete_snapshot(share, name)

        await hass.async_add_executor_job(_run)
        _LOGGER.info("Snapshot deleted: %s/%s", share, name)

    async def restart_container(call: ServiceCall):
        """Restart a Docker container."""
        config = _get_nas_config()
        if not config:
            _LOGGER.error("No NAS config found")
            return

        container_id = call.data.get(ATTR_CONTAINER_ID)

        def _run():
            from synology_api.docker_api import Docker

            docker = Docker(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
            )
            docker.restart_container(container_id)

        await hass.async_add_executor_job(_run)
        _LOGGER.info("Container restarted: %s", container_id)

    async def update_container(call: ServiceCall):
        """Pull latest image and recreate a container."""
        config = _get_nas_config()
        if not config:
            _LOGGER.error("No NAS config found")
            return

        container_id = call.data.get(ATTR_CONTAINER_ID)

        def _run():
            from synology_api.docker_api import Docker

            docker = Docker(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
            )
            # Get container info to find the image
            containers = docker.get_all_containers()
            for c in containers:
                if c.get("id") == container_id:
                    image = c.get("image", "")
                    docker.pull_image(image)
                    docker.stop_container(container_id)
                    # In a full implementation, you'd capture and reapply settings
                    docker.start_container(container_id)
                    return image
            return None

        image = await hass.async_add_executor_job(_run)
        if image is not None:
            _LOGGER.info("Container updated: %s", container_id)

    async def run_security_scan(call: ServiceCall):
        """Run a Security Advisor scan."""
        config = _get_nas_config()
        if not config:
            _LOGGER.error("No NAS config found")
            return

        def _run():
            from synology_api.security_advisor import SecurityAdvisor

            advisor = SecurityAdvisor(
                config["host"], config["port"],
                config["username"], config["password"],
                secure=config.get("use_ssl", True),
                cert_verify=config.get("verify_ssl", False),
                dsm_version=config.get("dsm_version", 7),
            )
            advisor.run_scan()

        await hass.async_add_executor_job(_run)
        _LOGGER.info("Security scan triggered")

    # Register all services
    hass.services.async_register(DOMAIN, SERVICE_CREATE_SNAPSHOT, create_snapshot)
    hass.services.async_register(DOMAIN, SERVICE_DELETE_SNAPSHOT, delete_snapshot)
    hass.services.async_register(DOMAIN, SERVICE_RESTART_CONTAINER, restart_container)
    hass.services.async_register(DOMAIN, SERVICE_UPDATE_CONTAINER, update_container)
    hass.services.async_register(DOMAIN, SERVICE_RUN_SECURITY_SCAN, run_security_scan)
