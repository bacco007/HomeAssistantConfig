"""The Default Config Disabler integration."""

from __future__ import annotations

from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import DOMAIN as HA_DOMAIN, HomeAssistant
from homeassistant.helpers.event import async_track_point_in_time
import homeassistant.util.dt as dt_util

from .const import CONF_COMPONENTS_TO_DISABLE, SERVICE_HOMEASSISTANT_RESTART
from .helpers import (
    backup_original_default_config_manifest,
    load_default_config_manifest,
    load_original_default_config_manifest,
    restore_original_default_config_manifest,
    save_default_config_manifest,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Default Config Disabler from a config entry."""
    disabled_components = entry.options.get(CONF_COMPONENTS_TO_DISABLE, [])

    def _disable_components() -> bool:
        backup_original_default_config_manifest()

        new_manifest = load_original_default_config_manifest()
        for disabled_component in disabled_components:
            if disabled_component in new_manifest["dependencies"]:
                new_manifest["dependencies"].remove(disabled_component)

        current_manifest = load_default_config_manifest()

        if new_manifest == current_manifest:
            return False

        save_default_config_manifest(new_manifest)
        return True

    if not await hass.async_add_executor_job(_disable_components):
        _LOGGER.info(
            "Components: %s are already removed from default_config",
            disabled_components,
        )
    else:
        _LOGGER.warning(
            "Components: %s were removed from default_config", disabled_components
        )
        _LOGGER.warning("Restarting Home Assistant to use the updated default_config")
        await hass.services.async_call(HA_DOMAIN, SERVICE_HOMEASSISTANT_RESTART)

        async def on_started(event):
            _LOGGER.warning(
                "HA started. Restarting Home Assistant to use the updated default_config"
            )
            await hass.services.async_call(HA_DOMAIN, SERVICE_HOMEASSISTANT_RESTART)

            async def delayed_started(event):
                _LOGGER.warning(
                    "HA started a while ago. Restarting Home Assistant to use the updated default_config"
                )
                await hass.services.async_call(HA_DOMAIN, SERVICE_HOMEASSISTANT_RESTART)

            for minutes in (1, 2, 4, 8, 16):
                async_track_point_in_time(
                    hass,
                    delayed_started,
                    dt_util.now() + timedelta(minutes=minutes),
                )

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, on_started)

    entry.async_on_unload(entry.add_update_listener(update_listener))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if await hass.async_add_executor_job(restore_original_default_config_manifest):
        _LOGGER.warning("Restarting Home Assistant to use the original default_config")
        await hass.services.async_call(HA_DOMAIN, SERVICE_HOMEASSISTANT_RESTART)
    return True


async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)
