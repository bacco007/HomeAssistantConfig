"""JavaScript module registration."""

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from ..const import JSMODULES, URL_BASE, INTEGRATION_VERSION

_LOGGER = logging.getLogger(__name__)


class JSModuleRegistration:
    """Registers JavaScript modules in Home Assistant."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the registrar."""
        self.hass = hass
        self.lovelace = self.hass.data.get("lovelace")

    async def async_register(self) -> None:
        """Register frontend resources."""
        await self._async_register_path()

        # Only register modules if Lovelace is in storage mode
        if self.hass.data.get(LOVELACE_DATA).resource_mode == "storage":
            await self._async_wait_for_lovelace_resources()

    async def _async_register_path(self) -> None:
        """Register the static HTTP path."""
        try:
            await self.hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, Path(__file__).parent, False)]
            )
            _LOGGER.debug("Path registered: %s -> %s", URL_BASE, Path(__file__).parent)
        except RuntimeError:
            _LOGGER.debug("Path already registered: %s", URL_BASE)

    async def _async_wait_for_lovelace_resources(self) -> None:
        """Wait for Lovelace resources to load."""

        async def _check_loaded(_now: Any) -> None:
            if self.lovelace.resources.loaded:
                await self._async_register_modules()
            else:
                _LOGGER.debug("Lovelace resources not loaded, retrying in 5s")
                async_call_later(self.hass, 5, _check_loaded)

        await _check_loaded(0)

    async def _async_register_modules(self) -> None:
        """ Register or update JavaScript modules.
            Remove any duplicate modules while we're doing this """
            
        _LOGGER.debug("Registering JavaScript modules")

        # Get existing resources from this integration
        existing_resources = [
            r for r in self.lovelace.resources.async_items()
            if r["url"].startswith(URL_BASE)
        ]
        for module in JSMODULES:
            url = f"{URL_BASE}/{module['filename']}"
            found_module = False

            for resource in existing_resources:
                if self._get_path(resource["url"]) == url:
                    # Remove duplicates, if any
                    if found_module:
                        # Just go ahead and delete the registration
                        _LOGGER.info(
                            "Removing duplicate - %s",
                            resource["url"]
                        )
                        await self.lovelace.resources.async_delete_item(resource["id"])
                    else:
                        found_module = True
                        # Check if update needed
                        if self._get_version(resource["url"]) != module["version"]:
                            _LOGGER.info(
                                "Updating %s to version %s",
                                module["name"], module["version"]
                            )
                            await self.lovelace.resources.async_update_item(
                                resource["id"],
                                {
                                    "res_type": "module",
                                    "url": f"{url}?v={module['version']}",
                                },
                            )

            if not found_module:
                # No existing module registration found - register it
                _LOGGER.info(
                    "Registering %s version %s",
                    module["name"], module["version"]
                )
                await self.lovelace.resources.async_create_item(
                    {
                        "res_type": "module",
                        "url": f"{url}?v={module['version']}",
                    }
                )

    def _get_path(self, url: str) -> str:
        """Extract path without parameters."""
        return url.split("?")[0]

    def _get_version(self, url: str) -> str:
        """Extract version from URL."""
        parts = url.split("?")
        if len(parts) > 1 and parts[1].startswith("v="):
            return parts[1].replace("v=", "")
        return "0"

    async def async_unregister(self) -> None:
        """Remove Lovelace resources from this integration."""
        if self.hass.data.get(LOVELACE_DATA).resource_mode == "storage":
            for module in JSMODULES:
                url = f"{URL_BASE}/{module['filename']}"

                resources = [
                    r for r in self.lovelace.resources.async_items()
                    if r["url"].startswith(url)
                ]

                for resource in resources:
                    await self.lovelace.resources.async_delete_item(resource["id"])
