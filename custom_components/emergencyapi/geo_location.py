import json
import logging

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTR_EVENT_TYPE, ATTR_SEVERITY, ATTR_SOURCE_AGENCY, ATTR_SOURCE_STATE, ATTR_STATUS, ATTR_WARNING_LEVEL, DOMAIN
from .coordinator import EmergencyAPICoordinator

_LOGGER = logging.getLogger(__name__)

SOURCE = "emergencyapi"


def _extract_centroid(geometry: dict) -> tuple[float, float] | None:
    """Extract a lat/lng centroid from any GeoJSON geometry type."""
    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates")
    if not coords:
        return None

    if geom_type == "Point":
        if len(coords) >= 2:
            return (coords[1], coords[0])

    if geom_type == "Polygon":
        ring = coords[0] if coords else []
        if ring:
            lats = [c[1] for c in ring]
            lngs = [c[0] for c in ring]
            return (sum(lats) / len(lats), sum(lngs) / len(lngs))

    if geom_type == "MultiPolygon":
        all_lats = []
        all_lngs = []
        for polygon in coords:
            ring = polygon[0] if polygon else []
            for c in ring:
                all_lats.append(c[1])
                all_lngs.append(c[0])
        if all_lats:
            return (sum(all_lats) / len(all_lats), sum(all_lngs) / len(all_lngs))

    if geom_type == "GeometryCollection":
        geometries = geometry.get("geometries", [])
        for g in geometries:
            result = _extract_centroid(g)
            if result:
                return result

    return None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: EmergencyAPICoordinator = hass.data[DOMAIN][entry.entry_id]
    known_ids: set[str] = set()

    @callback
    def _async_update() -> None:
        new_entities = []
        current_ids = set()

        for feature in coordinator.incidents:
            incident_id = feature.get("id", "")
            current_ids.add(incident_id)

            if incident_id not in known_ids:
                known_ids.add(incident_id)
                new_entities.append(
                    EmergencyAPIGeoLocation(coordinator, feature, incident_id)
                )

        if new_entities:
            async_add_entities(new_entities)

    coordinator.async_add_listener(_async_update)
    _async_update()


class EmergencyAPIGeoLocation(CoordinatorEntity, GeolocationEvent):

    _attr_source = SOURCE

    def __init__(
        self,
        coordinator: EmergencyAPICoordinator,
        feature: dict,
        incident_id: str,
    ) -> None:
        super().__init__(coordinator)
        self._incident_id = incident_id
        self._attr_unique_id = f"{DOMAIN}_{incident_id}"

    @property
    def _feature(self) -> dict | None:
        for f in self.coordinator.incidents:
            if f.get("id") == self._incident_id:
                return f
        return None

    @property
    def available(self) -> bool:
        return self._feature is not None

    @property
    def name(self) -> str:
        feature = self._feature
        if feature is None:
            return self._incident_id
        props = feature.get("properties", {})
        return props.get("title", self._incident_id)

    @property
    def latitude(self) -> float | None:
        feature = self._feature
        if feature is None:
            return None
        geom = feature.get("geometry", {})
        centroid = _extract_centroid(geom)
        return centroid[0] if centroid else None

    @property
    def longitude(self) -> float | None:
        feature = self._feature
        if feature is None:
            return None
        geom = feature.get("geometry", {})
        centroid = _extract_centroid(geom)
        return centroid[1] if centroid else None

    @property
    def state(self) -> str | None:
        feature = self._feature
        if feature is None:
            return None
        props = feature.get("properties", {})
        event_type = props.get("eventType", "")
        status = props.get("status", "")
        if event_type and status:
            return f"{event_type.replace('_', ' ').title()} ({status})"
        return event_type.replace("_", " ").title() or status or None

    @property
    def distance(self) -> float | None:
        feature = self._feature
        if feature is None:
            return None
        props = feature.get("properties", {})
        return props.get("distance")

    @property
    def extra_state_attributes(self) -> dict:
        feature = self._feature
        if feature is None:
            return {}
        props = feature.get("properties", {})
        source = props.get("source", {})
        geom = feature.get("geometry", {})
        attrs = {
            ATTR_EVENT_TYPE: props.get("eventType"),
            ATTR_SEVERITY: props.get("severity"),
            ATTR_WARNING_LEVEL: props.get("warningLevel"),
            ATTR_STATUS: props.get("status"),
            ATTR_SOURCE_STATE: source.get("state"),
            ATTR_SOURCE_AGENCY: source.get("agency"),
        }
        if geom.get("type") in ("Polygon", "MultiPolygon", "GeometryCollection"):
            attrs["geometry_type"] = geom.get("type")
            attrs["geometry_json"] = json.dumps(geom)
        return attrs
