"""The Custom Component Monitor integration."""
from __future__ import annotations

import logging
from pathlib import Path
import shutil
import time

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_JS = "custom-component-monitor-card.js"
CARD_BASE_PATH = f"/local/{DOMAIN}/{CARD_JS}"

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
    """Add/update the card JS in lovelace_resources with a cache-bust tag."""
    from homeassistant.components.lovelace import DOMAIN as LL_DOMAIN
    from homeassistant.components.lovelace.resources import (
        ResourceStorageCollection,
    )

    if LL_DOMAIN not in hass.data:
        _LOGGER.debug("Lovelace not ready yet, skipping resource registration")
        return

    ll_data = hass.data[LL_DOMAIN]
    resources: ResourceStorageCollection | None = getattr(
        ll_data, "resources", None
    )
    if resources is None:
        _LOGGER.debug("Lovelace resources collection not available")
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
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok