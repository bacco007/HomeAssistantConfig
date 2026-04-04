"""The Custom Component Monitor integration."""
from __future__ import annotations

import logging
from pathlib import Path
import shutil
import time

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.typing import ConfigType
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_JS = "custom-component-monitor-card.js"
CARD_BASE_PATH = f"/local/{DOMAIN}/{CARD_JS}"

SERVICE_SCAN_NOW = "scan_now"

CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Custom Component Monitor integration (platform-level).

    Copies the card JS to www/ so it is served via /local/ and registers
    it as a Lovelace module resource with a cache-busting tag.
    """
    hass.data.setdefault(DOMAIN, {})

    # Copy JS to www/ so HA serves it at /local/
    src = Path(__file__).parent / "www" / CARD_JS
    www_dir = Path(hass.config.path()) / "www" / DOMAIN
    dest = www_dir / CARD_JS

    def _copy_card():
        www_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(src), str(dest))

    await hass.async_add_executor_job(_copy_card)

    # Register as a lovelace resource once HA is fully started
    async def _deferred_register(_event):
        await _register_lovelace_resource(hass)

    hass.bus.async_listen_once("homeassistant_started", _deferred_register)

    _LOGGER.debug("Registered card JS at %s", CARD_BASE_PATH)
    return True


async def _register_lovelace_resource(hass: HomeAssistant) -> None:
    """Add/update the card JS in lovelace_resources with a cache-bust tag.

    Handles both storage-mode and YAML-mode lovelace gracefully.
    Users with YAML-mode resources must add the card manually.
    """
    from homeassistant.components.lovelace import DOMAIN as LL_DOMAIN
    from homeassistant.components.lovelace.resources import (
        ResourceStorageCollection,
    )

    if LL_DOMAIN not in hass.data:
        _LOGGER.debug("Lovelace not ready yet, skipping resource registration")
        return

    ll_data = hass.data[LL_DOMAIN]
    resources = getattr(ll_data, "resources", None)
    if resources is None:
        _LOGGER.debug("Lovelace resources collection not available")
        return

    # Only storage-mode collections support async_create_item / async_update_item.
    # YAML-mode uses ResourceYAMLCollection which is read-only.
    if not isinstance(resources, ResourceStorageCollection):
        _LOGGER.info(
            "Lovelace resources are configured in YAML mode. "
            "Please add the card resource manually: "
            "url: %s, type: module",
            CARD_BASE_PATH,
        )
        return

    if not resources.loaded:
        await resources.async_load()

    # Build URL with cache-busting tag based on file mtime
    www_path = Path(hass.config.path()) / "www" / DOMAIN / CARD_JS
    try:
        mtime = int(www_path.stat().st_mtime * 10)
    except OSError:
        mtime = int(time.time() * 10)
    card_url = f"{CARD_BASE_PATH}?v={mtime}"

    # Check for existing entry (match on base path, ignoring query string)
    for item in resources.async_items():
        url = item.get("url", "")
        if CARD_BASE_PATH in url:
            if url != card_url:
                # Update with new cache-bust tag
                await resources.async_update_item(
                    item["id"], {"res_type": "module", "url": card_url}
                )
                _LOGGER.info("Updated lovelace resource to: %s", card_url)
            else:
                _LOGGER.debug("Card resource already up to date")
            return

    # Not found — create new
    await resources.async_create_item(
        {"res_type": "module", "url": card_url}
    )
    _LOGGER.info("Registered lovelace resource: %s", card_url)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Custom Component Monitor from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register the scan_now service (once)
    if not hass.services.has_service(DOMAIN, SERVICE_SCAN_NOW):

        async def handle_scan_now(call: ServiceCall) -> None:
            """Handle the scan_now service call."""
            coordinator = hass.data[DOMAIN].get("coordinator")
            if coordinator is not None:
                _LOGGER.info("Manual scan triggered via service call")
                await coordinator.async_request_refresh()
            else:
                _LOGGER.warning("No coordinator available for manual scan")

        hass.services.async_register(
            DOMAIN,
            SERVICE_SCAN_NOW,
            handle_scan_now,
            schema=vol.Schema({}),
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        # Remove service if no more entries
        if hass.services.has_service(DOMAIN, SERVICE_SCAN_NOW):
            hass.services.async_remove(DOMAIN, SERVICE_SCAN_NOW)
        hass.data[DOMAIN].pop("coordinator", None)

    return unload_ok