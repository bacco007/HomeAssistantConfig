"""The Docker status integration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .component_api import ComponentApi
from .const import DOMAIN, LOGGER

PLATFORMS: list[Platform] = [Platform.SENSOR]


# ------------------------------------------------------------------
# ------------------------------------------------------------------
@dataclass
class CommonData:
    """Common data."""

    component_api: ComponentApi
    coordinator: DataUpdateCoordinator


# The type alias needs to be suffixed with 'ConfigEntry'
type CommonConfigEntry = ConfigEntry[CommonData]


# ------------------------------------------------------------------
async def async_setup_entry(hass: HomeAssistant, entry: CommonConfigEntry) -> bool:
    """Set up Docker status from a config entry."""

    # hass.data.setdefault(DOMAIN, {})

    component_api: ComponentApi = ComponentApi(
        hass,
        entry,
    )

    coordinator: DataUpdateCoordinator = DataUpdateCoordinator(
        hass,
        LOGGER,
        name=DOMAIN,
        update_interval=timedelta(minutes=1),
        update_method=component_api.async_update,
    )

    component_api.coordinator = coordinator

    await coordinator.async_config_entry_first_refresh()
    entry.async_on_unload(entry.add_update_listener(config_update_listener))

    entry.runtime_data = CommonData(
        component_api=component_api,
        coordinator=coordinator,
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


# ------------------------------------------------------------------
async def async_unload_entry(hass: HomeAssistant, entry: CommonConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


# ------------------------------------------------------------------
async def async_reload_entry(hass: HomeAssistant, entry: CommonConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


# ------------------------------------------------------------------
async def config_update_listener(
    hass: HomeAssistant,
    config_entry: CommonConfigEntry,
) -> None:
    """Reload on config entry update."""

    await hass.config_entries.async_reload(config_entry.entry_id)
    await config_entry.runtime_data.component_api.async_update()
