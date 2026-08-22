"""Websocket command for externalized alert geometry (RFC §2.4)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN


def async_register(hass: HomeAssistant) -> None:
    """Register the cap_alerts/geometry WS command."""
    websocket_api.async_register_command(hass, _ws_get_geometry)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "cap_alerts/geometry",
        vol.Required("geometry_ref"): str,
    }
)
@websocket_api.async_response
async def _ws_get_geometry(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    store = hass.data[DOMAIN]["geometry_store"]
    ref = msg["geometry_ref"]
    geom = await store.get(ref)
    if geom is None:
        connection.send_error(
            msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown geometry_ref"
        )
        return
    connection.send_result(
        msg["id"],
        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": geom,
                    "properties": {"ref": ref},
                }
            ],
        },
    )
