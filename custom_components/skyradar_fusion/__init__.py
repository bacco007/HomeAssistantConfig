"""The SkyRadar Fusion integration."""

import importlib
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig
from .const import DOMAIN, PLATFORMS
from .coordinator import SkyRadarFusionCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up SkyRadar Fusion from a config entry."""

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path="/skyradar_fusion_assets",
                path=hass.config.path("custom_components/skyradar_fusion/www"),
                cache_headers=False,
            )
        ]
    )
    # ------------------------------------------------

    coordinator = SkyRadarFusionCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    async def handle_refresh(call):
        """Service to force refresh data."""
        await coordinator.async_request_refresh()

    hass.services.async_register(DOMAIN, "refresh", handle_refresh)

    def pre_load_platforms():
        for platform in PLATFORMS:
            importlib.import_module(f".{platform}", __package__)

    await hass.async_add_executor_job(pre_load_platforms)

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)
