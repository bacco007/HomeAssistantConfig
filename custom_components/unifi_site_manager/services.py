"""Services for the UniFi Site Manager integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv, entity_registry as er

from .const import DOMAIN
from .coordinator import UnifiSiteManagerDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

# Validation schemas
REFRESH_TYPE_SCHEMA = vol.Schema(
    {
        vol.Optional("refresh_type", default="all"): vol.In(
            ["all", "sites", "hosts", "metrics"]
        ),
    }
)


async def async_setup_services(hass: HomeAssistant) -> None:
    """Set up the UniFi Site Manager services."""
    if hass.services.has_service(DOMAIN, "refresh"):
        return

    async def async_handle_refresh_service(service_call: ServiceCall) -> None:
        """Handle the refresh service call."""
        refresh_type = service_call.data.get("refresh_type", "all")

        # Get list of affected entities from service call
        entity_registry = er.async_get(hass)
        target_entities = []
        if service_call.data.get("entity_id"):
            target_entities = [
                entity_registry.async_get(entity_id)
                for entity_id in service_call.data["entity_id"]
            ]
            # Filter out any entities that don't exist
            target_entities = [e for e in target_entities if e is not None]

        # Get unique list of coordinators that need refreshing
        coordinators = set()
        for entry_id, coordinator in hass.data[DOMAIN].items():
            if not target_entities:
                # No specific entities targeted, refresh all coordinators
                coordinators.add(coordinator)
            else:
                # Check if any target entities belong to this coordinator
                for entity in target_entities:
                    if entity.config_entry_id == entry_id:
                        coordinators.add(coordinator)
                        break

        if not coordinators:
            raise HomeAssistantError("No valid entities found to refresh")

        # Refresh the specified data type for each coordinator
        for coordinator in coordinators:
            try:
                if refresh_type == "all":
                    await coordinator.async_refresh()
                elif refresh_type == "metrics":
                    await coordinator.async_refresh_metrics()
                elif refresh_type == "sites":
                    await coordinator._async_update_sites()
                    coordinator.async_update_listeners()
                elif refresh_type == "hosts":
                    await coordinator._async_update_hosts()
                    coordinator.async_update_listeners()
            except Exception as err:
                _LOGGER.error("Error refreshing data: %s", err)
                raise HomeAssistantError(f"Error refreshing data: {err}") from err

    hass.services.async_register(
        DOMAIN,
        "refresh",
        async_handle_refresh_service,
        schema=REFRESH_TYPE_SCHEMA,
    )


async def async_unload_services(hass: HomeAssistant) -> None:
    """Unload UniFi Site Manager services."""
    if hass.services.has_service(DOMAIN, "refresh"):
        hass.services.async_remove(DOMAIN, "refresh")