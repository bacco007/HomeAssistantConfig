"""REST view for externalized alert geometry (RFC §2.4)."""

from __future__ import annotations

from aiohttp import web

from homeassistant.components.http import HomeAssistantView

from .geometry_store import GeometryStore


def _feature_collection(ref: str, geometry: dict) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": geometry,
                "properties": {"ref": ref},
            }
        ],
    }


class CapAlertsGeometryView(HomeAssistantView):
    """Serve geometry by ref as a GeoJSON FeatureCollection."""

    url = "/api/cap_alerts/geometry/{geometry_ref}"
    name = "api:cap_alerts:geometry"

    def __init__(self, store: GeometryStore) -> None:
        self._store = store

    async def get(self, request: web.Request, geometry_ref: str) -> web.Response:
        geom = await self._store.get(geometry_ref)
        if geom is None:
            return self.json_message("Not found", status_code=404)
        return self.json(_feature_collection(geometry_ref, geom))
