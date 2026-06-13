from __future__ import annotations

from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig

DOMAIN = "world_cup_2026"

PANEL_URL = "/world-cup-2026"
FRONTEND_URL = "/world_cup_2026_static"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the World Cup 2026 application panel."""

    base_path = Path(__file__).parent.parent
    frontend_path = base_path / "frontend" / "dist"

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(frontend_path),
                cache_headers=False,
            )
        ]
    )

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="World Cup 2026",
        sidebar_icon="mdi:soccer",
        frontend_url_path="world-cup-2026",
        config={
            "_panel_custom": {
                "name": "world-cup-2026-panel",
                "embed_iframe": True,
                "trust_external": False,
                "js_url": f"{FRONTEND_URL}/world-cup-2026.js",
            }
        },
        require_admin=False,
    )
