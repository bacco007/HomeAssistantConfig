"""H.A.C.A Custom Panel and Lovelace Card Registration.

Panel: sidebar entry "H.A.C.A" → loads haca-panel.js
Cards: auto-registered as Lovelace resources so they appear in the card picker

Card registration follows the official HA pattern:
  - manifest.json declares dependencies: ["frontend", "http"]
  - Static path registered for /haca-cards/ serving JS files
  - Lovelace resources created via lovelace.resources.async_create_item
  - Registration happens via async_register_cards() called from async_setup
  - Retry mechanism waits for lovelace.resources.loaded before registering

Reference: https://community.home-assistant.io/t/974909
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components.http import StaticPathConfig
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

# ── Keys in hass.data to track registration state ──────────────────────────
_STATIC_PATHS_KEY = f"{DOMAIN}_static_paths_registered"
_CARDS_REGISTERED_KEY = f"{DOMAIN}_cards_registered"

# ── Base URL for card JS files ─────────────────────────────────────────────
CARDS_URL_BASE = "/haca-cards"

# ── Card modules to register ──────────────────────────────────────────────
HACA_CARDS = [
    {"name": "HACA Dashboard", "filename": "haca-dashboard-card.js"},
    {"name": "HACA Score",     "filename": "haca-score-card.js"},
]


# ═══════════════════════════════════════════════════════════════════════════
#  LOVELACE CARD REGISTRATION (called from async_setup — once per domain)
# ═══════════════════════════════════════════════════════════════════════════

async def async_register_cards(hass: HomeAssistant) -> None:
    """Register HACA card JS files as Lovelace resources.

    MUST be called from async_setup (not async_setup_entry) so it runs
    exactly once per integration domain, not per config entry.
    """
    if hass.data.get(_CARDS_REGISTERED_KEY):
        return

    # Read build hash for cache-busting (changes with every JS rebuild)
    try:
        _hash_path = Path(__file__).parent / "www" / "haca-panel.hash"
        card_version = await hass.async_add_executor_job(
            lambda: _hash_path.read_text(encoding="utf-8").strip()
        )
    except Exception:
        card_version = VERSION.replace(".", "_")

    # 1. Register static HTTP path for the card JS files
    www_dir = Path(__file__).parent / "www"
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARDS_URL_BASE, str(www_dir), True)]
        )
        _LOGGER.debug("[HACA] Card static path registered: %s -> %s", CARDS_URL_BASE, www_dir)
    except RuntimeError:
        _LOGGER.debug("[HACA] Card static path already registered: %s", CARDS_URL_BASE)

    # 2. Register Lovelace resources (only works in storage mode)
    lovelace = hass.data.get("lovelace")
    if not lovelace:
        _LOGGER.warning(
            "[HACA] Lovelace component not available — cards cannot be auto-registered"
        )
        return

    # HA 2026.x uses resource_mode; older versions used mode
    resource_mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", "storage")

    if resource_mode == "yaml":
        _LOGGER.info(
            "[HACA] Lovelace resources in YAML mode — add card resources manually:\n%s",
            "\n".join(
                f"  - url: {CARDS_URL_BASE}/{c['filename']}?v={card_version}\n    type: module"
                for c in HACA_CARDS
            ),
        )
        return

    # 3. Wait for resources to be loaded, then register
    await _async_wait_for_lovelace_resources(hass, lovelace, card_version)


async def _async_wait_for_lovelace_resources(
    hass: HomeAssistant, lovelace: Any, card_version: str
) -> None:
    """Wait for Lovelace resources to load, then register card modules."""

    async def _check_loaded(_now: Any) -> None:
        if lovelace.resources.loaded:
            await _async_register_card_modules(hass, lovelace, card_version)
        else:
            _LOGGER.debug("[HACA] Lovelace resources not loaded yet, retrying in 5s")
            async_call_later(hass, 5, _check_loaded)

    await _check_loaded(0)


async def _async_register_card_modules(
    hass: HomeAssistant, lovelace: Any, card_version: str
) -> None:
    """Register or update HACA card JS modules in Lovelace resources."""
    if hass.data.get(_CARDS_REGISTERED_KEY):
        return

    # ── Cleanup: remove stale resources from old paths ─────────────────────
    # Previous versions registered cards at /config_auditor_static/ which
    # causes double-loading. Remove any old entries before registering new ones.
    _OLD_PREFIXES = [f"/{DOMAIN}_static/haca-", "/config_auditor_static/haca-"]
    for resource in lovelace.resources.async_items():
        res_url = resource.get("url", "")
        for old_prefix in _OLD_PREFIXES:
            if res_url.startswith(old_prefix) and ("card" in res_url):
                try:
                    await lovelace.resources.async_delete_item(resource["id"])
                    _LOGGER.info("[HACA] Removed stale resource: %s", res_url)
                except Exception:
                    pass

    existing_resources = [
        r for r in lovelace.resources.async_items()
        if r["url"].startswith(CARDS_URL_BASE)
    ]

    registered = 0

    for card in HACA_CARDS:
        url = f"{CARDS_URL_BASE}/{card['filename']}"
        versioned_url = f"{url}?v={card_version}"
        found = False

        for resource in existing_resources:
            if _url_path(resource["url"]) == url:
                found = True
                if _url_version(resource["url"]) != card_version:
                    _LOGGER.info(
                        "[HACA] Updating card '%s' to v%s", card["name"], card_version
                    )
                    await lovelace.resources.async_update_item(
                        resource["id"],
                        {"res_type": "module", "url": versioned_url},
                    )
                registered += 1
                break

        if not found:
            _LOGGER.info("[HACA] Registering card '%s' v%s", card["name"], card_version)
            await lovelace.resources.async_create_item(
                {"res_type": "module", "url": versioned_url}
            )
            registered += 1

    hass.data[_CARDS_REGISTERED_KEY] = True
    _LOGGER.info("[HACA] %d Lovelace card(s) registered", registered)


async def async_unregister_cards(hass: HomeAssistant) -> None:
    """Remove HACA card Lovelace resources (called on integration removal)."""
    lovelace = hass.data.get("lovelace")
    if not lovelace:
        return
    resource_mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", "storage")
    if resource_mode == "yaml":
        return
    try:
        for card in HACA_CARDS:
            url = f"{CARDS_URL_BASE}/{card['filename']}"
            resources = [
                r for r in lovelace.resources.async_items()
                if r["url"].startswith(url)
            ]
            for resource in resources:
                await lovelace.resources.async_delete_item(resource["id"])
                _LOGGER.info("[HACA] Lovelace resource removed: %s", resource["url"])
    except Exception as exc:
        _LOGGER.debug("[HACA] Could not remove Lovelace resources: %s", exc)


def _url_path(url: str) -> str:
    """Extract path without query parameters."""
    return url.split("?")[0]


def _url_version(url: str) -> str:
    """Extract version from ?v=X.X.X URL parameter."""
    parts = url.split("?")
    if len(parts) > 1 and parts[1].startswith("v="):
        return parts[1][2:]
    return "0"


# ═══════════════════════════════════════════════════════════════════════════
#  SIDEBAR PANEL (called from async_setup_entry — once per config entry)
# ═══════════════════════════════════════════════════════════════════════════

async def async_register_panel(hass: HomeAssistant) -> None:
    """Register H.A.C.A custom panel in the sidebar."""
    try:
        _hash_path = Path(__file__).parent / "www" / "haca-panel.hash"
        cache_bust = await hass.async_add_executor_job(
            lambda: _hash_path.read_text(encoding="utf-8").strip()
        ) or VERSION.replace(".", "_")
    except Exception:
        cache_bust = VERSION.replace(".", "_")

    try:
        integration_dir = Path(__file__).parent
        www_dir = integration_dir / "www"

        if not www_dir.exists():
            _LOGGER.error("WWW directory not found: %s", www_dir)
            return

        # ── Static paths : once per HA process ────────────────────────────
        if not hass.data.get(_STATIC_PATHS_KEY):
            reports_dir = Path(hass.config.path("haca_reports"))
            await hass.async_add_executor_job(
                lambda: reports_dir.mkdir(parents=True, exist_ok=True)
            )

            brand_dir = integration_dir / "brand"
            static_paths = [
                StaticPathConfig(f"/{DOMAIN}_static", str(www_dir), cache_headers=True),
                StaticPathConfig(f"/{DOMAIN}_brand", str(brand_dir), cache_headers=True),
                StaticPathConfig("/haca_reports", str(reports_dir), cache_headers=True),
            ]
            try:
                await hass.http.async_register_static_paths(static_paths)
                hass.data[_STATIC_PATHS_KEY] = True
            except Exception as static_err:
                _LOGGER.debug("Static path already registered (safe): %s", static_err)
                hass.data[_STATIC_PATHS_KEY] = True
            _LOGGER.info("Static paths registered: /%s, /haca_reports", DOMAIN)

        # ── Panel : register or update ────────────────────────────────────
        frontend.async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="H.A.C.A",
            sidebar_icon="mdi:shield-check",
            frontend_url_path=DOMAIN,
            require_admin=True,
            config={
                "_panel_custom": {
                    "name": "haca-panel",
                    "js_url": f"/{DOMAIN}_static/haca-panel.js?v={cache_bust}",
                    "embed_iframe": True,
                    "trust_external": False,
                }
            },
            update=True,
        )
        _LOGGER.info("Panel registered: /%s (js?v=%s)", DOMAIN, cache_bust)

    except Exception as e:
        _LOGGER.error("Panel registration error: %s", e, exc_info=True)


async def async_unregister_panel(hass: HomeAssistant) -> None:
    """Unregister sidebar panel and Lovelace card resources."""
    try:
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("Panel unregistered")
    except Exception as e:
        _LOGGER.warning("Unregister failed: %s", e)

    await async_unregister_cards(hass)
