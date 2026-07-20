"""Football Hub integration setup."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall

from .api.coordinator import FootballHubCoordinator
from .const import DOMAIN

PLATFORMS = ["sensor"]
PANEL_URL = "football-hub"
PANEL_NAME = "football-hub-panel"
PANEL_VERSION = "0.4.3-country-tv-guide"
PANEL_STATIC_URL = "/football_hub/football-hub-panel.js"
PANEL_MODULE_URL = f"{PANEL_STATIC_URL}?v={PANEL_VERSION}"
PANEL_SCRIPT_PATH = Path(__file__).parent / "frontend" / "football-hub-panel.js"
PANEL_BACKGROUND_URL = "/football_hub/football-hub-background.png"
PANEL_BACKGROUND_PATH = Path(__file__).parent / "frontend" / "football-hub-background.png"
PANEL_LOGO_URL = "/football_hub/football-hub-logo.png"
PANEL_LOGO_PATH = Path(__file__).parent / "frontend" / "football-hub-logo.png"


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    data = dict(entry.data)
    data.setdefault("country", "England")
    data.setdefault("competition", "premier_league")
    data.setdefault("season", 2026)
    data["provider_mode"] = "fm"
    hass.config_entries.async_update_entry(entry, data=data, version=3)
    return True


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    await hass.http.async_register_static_paths([
        StaticPathConfig(PANEL_STATIC_URL, str(PANEL_SCRIPT_PATH), False),
        StaticPathConfig(PANEL_BACKGROUND_URL, str(PANEL_BACKGROUND_PATH), False),
        StaticPathConfig(PANEL_LOGO_URL, str(PANEL_LOGO_PATH), False),
    ])
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Football Hub",
        sidebar_icon="mdi:soccer",
        frontend_url_path=PANEL_URL,
        config={"_panel_custom": {"name": PANEL_NAME, "module_url": PANEL_MODULE_URL, "embed_iframe": False, "trust_external": False}},
        require_admin=False,
        update=PANEL_URL in hass.data.get("frontend_panels", {}),
    )

    async def _coordinators(call: ServiceCall):
        entry_id = str(call.data.get("entry_id") or "").strip()
        for runtime_entry_id, runtime in hass.data.get(DOMAIN, {}).items():
            if entry_id and runtime_entry_id != entry_id:
                continue
            if isinstance(runtime, dict) and runtime.get("coordinator") is not None:
                yield runtime["coordinator"]

    async def async_select_live_team(call: ServiceCall) -> None:
        team = str(call.data.get("team") or "").strip()
        async for coordinator in _coordinators(call):
            await coordinator.async_set_supported_team(team)

    async def async_select_live_match(call: ServiceCall) -> None:
        fixture_id = str(call.data.get("fixture_id") or "").strip()
        async for coordinator in _coordinators(call):
            await coordinator.async_set_selected_live_match(fixture_id)

    async def async_select_competition(call: ServiceCall) -> None:
        competition = str(call.data.get("competition") or "").strip()
        async for coordinator in _coordinators(call):
            await coordinator.async_set_competition(competition)

    async def async_select_cup(call: ServiceCall) -> None:
        competition = str(call.data.get("competition") or "").strip()
        async for coordinator in _coordinators(call):
            await coordinator.async_set_cup(competition)

    async def async_select_my_club(call: ServiceCall) -> None:
        team = str(call.data.get("team") or "").strip()
        async for coordinator in _coordinators(call):
            await coordinator.async_set_my_club(team)

    services = {
        "select_live_team": async_select_live_team,
        "select_live_match": async_select_live_match,
        "select_competition": async_select_competition,
        "select_cup": async_select_cup,
        "select_my_club": async_select_my_club,
    }
    for name, handler in services.items():
        if not hass.services.has_service(DOMAIN, name):
            hass.services.async_register(DOMAIN, name, handler)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    coordinator = FootballHubCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    hass.data[DOMAIN][entry.entry_id] = {"coordinator": coordinator}
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
