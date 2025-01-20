"""Services for the UniFi Insights integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .coordinator import UnifiInsightsDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

SERVICE_REFRESH_DATA = "refresh_data"
SERVICE_RESTART_DEVICE = "restart_device"

# Schema for refresh_data service
REFRESH_DATA_SCHEMA = vol.Schema({
    vol.Optional("site_id"): cv.string,
})

# Schema for restart_device service
RESTART_DEVICE_SCHEMA = vol.Schema({
    vol.Required("site_id"): cv.string,
    vol.Required("device_id"): cv.string,
})

async def async_setup_services(hass: HomeAssistant) -> None:
    """Set up the UniFi Insights services."""
    _LOGGER.debug("Setting up UniFi Insights services")

    async def async_handle_refresh_data(call: ServiceCall) -> None:
        """Handle the refresh data service call."""
        _LOGGER.debug("Handling refresh_data service call with data: %s", call.data)
        
        site_id = call.data.get("site_id")
        
        if not hass.data.get(DOMAIN):
            _LOGGER.error("No UniFi Insights integration configured")
            raise HomeAssistantError("No UniFi Insights integration configured")

        # Get all coordinators
        coordinators: list[UnifiInsightsDataUpdateCoordinator] = [
            coordinator for coordinator in hass.data[DOMAIN].values()
            if isinstance(coordinator, UnifiInsightsDataUpdateCoordinator)
        ]

        if not coordinators:
            _LOGGER.error("No UniFi Insights coordinators found")
            raise HomeAssistantError("No UniFi Insights coordinators found")

        _LOGGER.info(
            "Refreshing data for %s site%s",
            "specific" if site_id else "all",
            f" (ID: {site_id})" if site_id else "s"
        )

        for coordinator in coordinators:
            try:
                # If site_id is specified, only refresh that site
                if site_id and site_id not in coordinator.data["sites"]:
                    _LOGGER.debug("Skipping coordinator - site %s not found", site_id)
                    continue

                _LOGGER.debug("Requesting coordinator refresh")
                await coordinator.async_refresh()
                _LOGGER.info("Successfully refreshed coordinator data")
                
            except Exception as err:
                _LOGGER.error("Error refreshing coordinator data: %s", err)
                raise HomeAssistantError(f"Error refreshing data: {err}") from err

    async def async_handle_restart_device(call: ServiceCall) -> None:
        """Handle the restart device service call."""
        _LOGGER.debug("Handling restart_device service call with data: %s", call.data)
        
        site_id = call.data["site_id"]
        device_id = call.data["device_id"]

        if not hass.data.get(DOMAIN):
            _LOGGER.error("No UniFi Insights integration configured")
            raise HomeAssistantError("No UniFi Insights integration configured")

        # Get first coordinator (we only need one to restart a device)
        coordinator = next(iter(hass.data[DOMAIN].values()), None)
        
        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            raise HomeAssistantError("No UniFi Insights coordinator found")

        _LOGGER.info(
            "Attempting to restart device %s in site %s",
            device_id,
            site_id
        )

        try:
            success = await coordinator.api.async_restart_device(site_id, device_id)
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    device_id,
                    site_id
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s",
                    device_id,
                    site_id
                )
                raise HomeAssistantError(f"Failed to restart device {device_id}")
                
        except Exception as err:
            _LOGGER.error(
                "Error restarting device %s in site %s: %s",
                device_id,
                site_id,
                err
            )
            raise HomeAssistantError(f"Error restarting device: {err}") from err

    # Register services
    _LOGGER.debug("Registering UniFi Insights services")
    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH_DATA,
        async_handle_refresh_data,
        schema=REFRESH_DATA_SCHEMA,
    )
    
    hass.services.async_register(
        DOMAIN,
        SERVICE_RESTART_DEVICE,
        async_handle_restart_device,
        schema=RESTART_DEVICE_SCHEMA,
    )
    _LOGGER.info("UniFi Insights services registered successfully")

async def async_unload_services(hass: HomeAssistant) -> None:
    """Unload UniFi Insights services."""
    _LOGGER.debug("Unloading UniFi Insights services")
    
    if hass.services.has_service(DOMAIN, SERVICE_REFRESH_DATA):
        hass.services.async_remove(DOMAIN, SERVICE_REFRESH_DATA)
        
    if hass.services.has_service(DOMAIN, SERVICE_RESTART_DEVICE):
        hass.services.async_remove(DOMAIN, SERVICE_RESTART_DEVICE)
        
    _LOGGER.info("UniFi Insights services unloaded successfully")