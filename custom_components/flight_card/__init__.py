"""ADS-B SkyVista integration."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, PLATFORMS
from .coordinator import FlightCardDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

CARD_JS_FILE = Path(__file__).with_name("flight-card.js")
CARD_JS_URL = "/flight_card/flight-card.js"
DATA_FRONTEND_REGISTERED = "_frontend_registered"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up ADS-B SkyVista integration."""
    await _async_setup_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ADS-B SkyVista from a config entry."""
    await _async_setup_frontend(hass)

    coordinator = FlightCardDataUpdateCoordinator(hass=hass, entry=entry)
    await coordinator.async_config_entry_first_refresh()

    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        domain_data = hass.data[DOMAIN]
        domain_data.pop(entry.entry_id, None)
    return unload_ok


async def _async_setup_frontend(hass: HomeAssistant) -> None:
    """Register and auto-load the ADS-B SkyVista frontend module."""
    domain_data = hass.data.setdefault(DOMAIN, {})

    if domain_data.get(DATA_FRONTEND_REGISTERED):
        return

    if not CARD_JS_FILE.is_file():
        _LOGGER.warning(
            "ADS-B SkyVista card module missing at %s; custom:flight-card will be unavailable",
            CARD_JS_FILE,
        )
        return

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=CARD_JS_URL,
                path=CARD_JS_FILE.as_posix(),
                cache_headers=False,
            )
        ]
    )

    add_extra_js_url(hass, CARD_JS_URL)
    domain_data[DATA_FRONTEND_REGISTERED] = True
