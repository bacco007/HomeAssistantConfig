"""Matter Binding Helper integration for Home Assistant."""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.components import frontend, panel_custom
from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.helpers.event import async_track_time_interval

from .const import (
    CONF_TELEMETRY_ENABLED,
    DEFAULT_TELEMETRY_ENABLED,
    DOMAIN,
    PANEL_ICON,
    PANEL_NAME,
    PANEL_TITLE,
    TELEMETRY_INTERVAL_HOURS,
)


_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Matter Binding Helper component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Matter Binding Helper from a config entry."""
    # Store entry data
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Check if Matter integration is available (skip in demo mode)
    from .const import CONF_DEMO_MODE, DEFAULT_DEMO_MODE

    demo_mode = entry.options.get(CONF_DEMO_MODE, DEFAULT_DEMO_MODE)
    if not demo_mode and MATTER_DOMAIN not in hass.data:
        _LOGGER.error("Matter integration is not set up")
        return False

    # Register the frontend panel
    await _async_register_panel(hass)

    # Register WebSocket API
    from . import api

    await api.async_setup(hass)

    # Set up telemetry if enabled
    if entry.options.get(CONF_TELEMETRY_ENABLED, DEFAULT_TELEMETRY_ENABLED):
        await _async_setup_telemetry(hass, entry)

    # Register services
    await _async_register_services(hass)

    # Listen for options updates
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    # Set up platforms (sensors)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    _LOGGER.debug("Options updated, reloading integration")
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        # Remove panel
        frontend.async_remove_panel(hass, PANEL_NAME)

        # Remove services
        hass.services.async_remove(DOMAIN, "submit_survey")

        # Clean up stored data
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the frontend panel."""
    # Register the panel serving the frontend
    from homeassistant.components.http import StaticPathConfig

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path="/matter_binding_helper/frontend",
                path=hass.config.path(f"custom_components/{DOMAIN}/frontend"),
                cache_headers=False,
            )
        ]
    )

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=PANEL_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url="/matter_binding_helper/frontend/matter-binding-panel.js",
        embed_iframe=False,
        require_admin=True,
    )


async def _async_register_services(hass: HomeAssistant) -> None:
    """Register integration services."""
    from . import telemetry

    async def handle_submit_survey(call: ServiceCall) -> ServiceResponse:
        """Handle the submit_survey service call."""
        _LOGGER.info("Manual survey submission requested")

        # Collect data first to report device count
        data = await telemetry.collect_survey_data(hass)
        device_count = len(data.get("devices", []))

        _LOGGER.debug(
            "Survey data collected: installation_id=%s, devices=%d",
            data.get("installation_id"),
            device_count,
        )

        success = await telemetry.send_telemetry(hass)

        return {
            "success": success,
            "device_count": device_count,
            "message": f"Survey submitted successfully ({device_count} devices)"
            if success
            else "Survey submission failed",
        }

    hass.services.async_register(
        DOMAIN,
        "submit_survey",
        handle_submit_survey,
        supports_response=SupportsResponse.OPTIONAL,
    )


async def _async_setup_telemetry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Set up periodic telemetry submission."""
    from . import telemetry

    async def _send_telemetry_callback(_now=None) -> None:
        """Callback for periodic telemetry submission."""
        if telemetry.is_telemetry_enabled(hass):
            await telemetry.send_telemetry(hass)

    # Schedule periodic telemetry (weekly)
    cancel_interval = async_track_time_interval(
        hass,
        _send_telemetry_callback,
        timedelta(hours=TELEMETRY_INTERVAL_HOURS),
    )
    entry.async_on_unload(cancel_interval)

    # Schedule initial telemetry after a delay (runs in background)
    hass.async_create_task(telemetry.schedule_initial_telemetry(hass))
