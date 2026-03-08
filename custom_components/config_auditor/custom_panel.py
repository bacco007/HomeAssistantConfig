"""H.A.C.A Custom Panel."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.components import frontend
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


# Clé hass.data pour savoir si les paths statiques ont déjà été enregistrés
# dans ce process HA. Les routes aiohttp sont permanentes (durée de vie du process) :
# les ré-enregistrer lève RuntimeError → 403. On ne les enregistre donc qu'une seule fois.
_STATIC_PATHS_KEY = f"{DOMAIN}_static_paths_registered"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register H.A.C.A custom panel.

    Les paths statiques aiohttp ne peuvent pas être désenregistrés ni
    ré-enregistrés au sein d'un même process HA. On les enregistre une
    seule fois (flag _STATIC_PATHS_KEY dans hass.data) et on met à jour
    le panel frontend à chaque setup via update=True.
    """
    from .const import VERSION as _VERSION
    # Use build hash as cache buster — changes with every JS rebuild.
    # Must use executor to avoid blocking the event loop (HA asyncio requirement).
    try:
        _hash_path = Path(__file__).parent / "www" / "haca-panel.hash"
        cache_bust = await hass.async_add_executor_job(
            lambda: _hash_path.read_text(encoding="utf-8").strip()
        ) or _VERSION.replace(".", "_")
    except Exception:
        cache_bust = _VERSION.replace(".", "_")

    try:
        integration_dir = Path(__file__).parent
        www_dir = integration_dir / "www"

        if not www_dir.exists():
            _LOGGER.error("❌ WWW directory not found: %s", www_dir)
            return

        js_file = www_dir / "haca-panel.js"
        if not js_file.exists():
            _LOGGER.error("❌ JS file not found: %s", js_file)
            return

        # ── Static paths : une seule fois par process ──────────────────────
        # aiohttp lève RuntimeError si on tente d'enregistrer deux fois le même
        # chemin GET. Ce flag survit aux reload/unload mais pas au redémarrage HA.
        if not hass.data.get(_STATIC_PATHS_KEY):
            reports_dir = Path(hass.config.path("haca_reports"))
            reports_dir.mkdir(exist_ok=True)

            static_paths = [
                StaticPathConfig(f"/{DOMAIN}_static", str(www_dir), cache_headers=True),
                StaticPathConfig("/haca_reports", str(reports_dir), cache_headers=True),
            ]
            try:
                await hass.http.async_register_static_paths(static_paths)
                hass.data[_STATIC_PATHS_KEY] = True
            except Exception as static_err:
                # Route already registered in this aiohttp process — safe to ignore
                _LOGGER.debug("Static path already registered (safe): %s", static_err)
                hass.data[_STATIC_PATHS_KEY] = True
            _LOGGER.info(
                "✅ Static paths registered: /%s, /haca_reports (js?v=%s)",
                DOMAIN, cache_bust,
            )
        else:
            _LOGGER.info(
                "ℹ️ Static paths already registered for this process — skipping"
            )

        # ── Panel frontend : enregistrer ou mettre à jour ──────────────────
        # async_register_built_in_panel accepte update=True pour écraser
        # un panel existant sans lever ValueError. On passe toujours update=True
        # pour garantir que le panel est présent après un reload.
        frontend.async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="H.A.C.A",
            sidebar_icon="mdi:shield-check",
            frontend_url_path=DOMAIN,
            config={
                "_panel_custom": {
                    "name": "haca-panel",
                    "js_url": f"/{DOMAIN}_static/haca-panel.js?v={cache_bust}",
                    "embed_iframe": True,
                    "trust_external": False,
                }
            },
            require_admin=False,
            update=True,
        )
        _LOGGER.info(
            "✅ Panel registered/updated: /%s/haca-panel.js?v=%s",
            DOMAIN, cache_bust,
        )

    except Exception as e:
        _LOGGER.error("❌ Panel registration error: %s", e, exc_info=True)


async def async_unregister_panel(hass: HomeAssistant) -> None:
    """Unregister panel."""
    try:
        frontend.async_remove_panel(hass, DOMAIN)
        _LOGGER.info("✅ Panel unregistered")
    except Exception as e:
        _LOGGER.warning("⚠️ Unregister failed: %s", e)
