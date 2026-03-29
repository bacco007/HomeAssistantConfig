"""Entity Manager Integration."""

import json
import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry  # type: ignore
from homeassistant.core import HomeAssistant  # type: ignore
from homeassistant.components import frontend  # type: ignore
from homeassistant.components.http import StaticPathConfig  # type: ignore
from homeassistant.helpers import config_validation as cv  # type: ignore

from .const import DOMAIN
from .websocket_api import async_setup_ws_api, enable_entity, disable_entity
from .voice_assistant import async_setup_intents

_LOGGER = logging.getLogger(__name__)

SERVICE_ENABLE_ENTITY = "enable_entity"
SERVICE_DISABLE_ENTITY = "disable_entity"

SERVICE_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
    }
)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Entity Manager component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Entity Manager from a config entry."""

    # Register frontend resources
    frontend_path = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(f"/api/{DOMAIN}/frontend", str(frontend_path), True)]
    )

    # Register WebSocket API
    async_setup_ws_api(hass)

    # Set up voice assistant intents
    await async_setup_intents(hass)

    # Register services (delegates to shared helpers in websocket_api)
    def _make_service_handler(action, fn):
        async def _handler(call):
            entity_id = call.data["entity_id"]
            try:
                fn(hass, entity_id)
                _LOGGER.info("%s entity: %s", action, entity_id)
            except ValueError as err:
                _LOGGER.error("Failed to %s entity %s: %s", action, entity_id, err)
            except Exception as err:
                _LOGGER.error(
                    "Unexpected error %sing entity %s: %s", action, entity_id, err
                )

        return _handler

    hass.services.async_register(
        DOMAIN,
        SERVICE_ENABLE_ENTITY,
        _make_service_handler("enable", enable_entity),
        schema=SERVICE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DISABLE_ENTITY,
        _make_service_handler("disable", disable_entity),
        schema=SERVICE_SCHEMA,
    )

    # Register the frontend panel
    manifest_text = await hass.async_add_executor_job(
        (Path(__file__).parent / "manifest.json").read_text
    )
    version = json.loads(manifest_text).get("version", "0")
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Entity Manager",
        sidebar_icon="mdi:tune",
        frontend_url_path=DOMAIN,
        config={
            "_panel_custom": {
                "name": "entity-manager-panel",
                "embed_iframe": False,
                "trust_external": False,
                "js_url": f"/api/entity_manager/frontend/entity-manager-panel.js?v={version}",
                "version": version,
            }
        },
        require_admin=True,
    )

    _LOGGER.info("Entity Manager panel registered")

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    frontend.async_remove_panel(hass, DOMAIN)
    hass.services.async_remove(DOMAIN, SERVICE_ENABLE_ENTITY)
    hass.services.async_remove(DOMAIN, SERVICE_DISABLE_ENTITY)
    return True
