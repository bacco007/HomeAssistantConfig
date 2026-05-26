"""The Real Horizon integration."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import RealHorizonCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]

CARD_FILE = "real-horizon-card.js"
CARD_URL = f"/{DOMAIN}/{CARD_FILE}"

type RealHorizonConfigEntry = ConfigEntry[RealHorizonCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: RealHorizonConfigEntry) -> bool:
    """Set up Real Horizon from a config entry."""
    lat = entry.data["latitude"]
    lon = entry.data["longitude"]

    coordinator = RealHorizonCoordinator(hass, lat, lon)
    await coordinator.async_load_horizon()
    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await _async_register_card(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: RealHorizonConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok


async def _async_register_card(hass: HomeAssistant) -> None:
    """Serve the Lovelace card and auto-load it on every page."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("_card_registered"):
        return
    card_path = Path(__file__).parent / "www" / CARD_FILE
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), cache_headers=False)]
    )
    add_extra_js_url(hass, CARD_URL)
    domain_data["_card_registered"] = True
    _LOGGER.info("Registered Lovelace card at %s", CARD_URL)
