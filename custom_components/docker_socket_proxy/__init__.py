"""Custom integration to integrate Docker Socket Proxy with Home Assistant.

For more details about this integration, please refer to
https://github.com/s-t-e-f-a-n/ha_docker_socket_proxy
"""

from __future__ import annotations

import logging

# The pathlib and shutil modules are essential for safe blueprint deployment
from pathlib import Path
import shutil

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

# Import constants and the coordinator class
from .const import BLUEPRINT_FILENAME, DOMAIN, PLATFORMS
from .coordinator import DockerProxyCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Docker Socket Proxy from a config entry."""

    # Deploy or update the blueprint before setting up platforms to ensure it's available
    await async_install_blueprint(hass)

    # Initialize the coordinator with the full entry object
    # This allows the coordinator to access entry.options and entry.data["url"]
    coordinator = DockerProxyCoordinator(hass, entry)

    # Trigger the first refresh to ensure we have data before creating entities
    # This will set the initial host_status and populate the container list
    await coordinator.async_config_entry_first_refresh()

    # Store the coordinator instance using the entry_id to support multiple host setups
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Forward the setup to the defined platforms (sensor.py)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register a listener to detect when options are changed in the UI
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_install_blueprint(hass: HomeAssistant) -> None:
    """Copy the blueprint from the integration folder to the HA blueprints folder."""

    # Source path within the custom_component directory
    source_file = Path(
        hass.config.path(
            "custom_components", DOMAIN, "blueprints", "automation", BLUEPRINT_FILENAME
        )
    )

    # Target path in the global Home Assistant blueprints directory
    dest_dir = Path(hass.config.path("blueprints", "automation", DOMAIN))
    dest_file = dest_dir / BLUEPRINT_FILENAME

    def sync_blueprint() -> None:
        """Perform blocking file I/O operations in a thread-safe manner."""
        try:
            if not source_file.exists():
                _LOGGER.warning("Blueprint source file not found at %s", source_file)
                return

            # Create directory tree if it does not exist
            dest_dir.mkdir(parents=True, exist_ok=True)

            # Copy the file while preserving metadata (shutil.copy2)
            shutil.copy2(source_file, dest_file)
            _LOGGER.debug("Blueprint successfully synchronized to %s", dest_file)

        # Handle specific I/O errors to provide better diagnostic info
        except (OSError, shutil.Error) as err:
            _LOGGER.error("FileSystem error while syncing blueprint: %s", err)

    # Use the executor to avoid blocking the main Home Assistant event loop during I/O
    await hass.async_add_executor_job(sync_blueprint)


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration when options (like grace period) are changed."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry and clean up data."""

    # Unload all platforms associated with this config entry
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        # Remove the coordinator instance to free up memory
        hass.data[DOMAIN].pop(entry.entry_id)
        if not hass.data[DOMAIN]:
            hass.data.pop(DOMAIN)
    return unload_ok
