from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN

type WaterNSWConfigEntry = ConfigEntry

PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the WaterNSW integration."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault("yaml_entities", [])
    hass.data[DOMAIN].setdefault("site_coordinators", {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: WaterNSWConfigEntry) -> bool:
    """Set up WaterNSW from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault("yaml_entities", [])
    hass.data[DOMAIN].setdefault("site_coordinators", {})
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: WaterNSWConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
