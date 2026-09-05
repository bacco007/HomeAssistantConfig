"""Dynamic geolocation entities for native Home Assistant map cards."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfLength
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .coordinator import FireWatchCoordinator
from .model import Incident, incident_entity_id


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    coordinator: FireWatchCoordinator = hass.data[DOMAIN]["entries"][entry.entry_id]
    known: dict[str, FireWatchGeoLocation] = {}

    @callback
    def sync_entities() -> None:
        current = {
            incident.id: incident
            for incident in (*coordinator._incidents, *coordinator._planned)  # noqa: SLF001
            if incident.latitude is not None and incident.longitude is not None
        }
        new_entities: list[FireWatchGeoLocation] = []
        for incident_id in current.keys() - known.keys():
            entity = FireWatchGeoLocation(coordinator, incident_id)
            known[incident_id] = entity
            new_entities.append(entity)
        if new_entities:
            async_add_entities(new_entities, True)
        for incident_id in known.keys() - current.keys():
            entity = known.pop(incident_id)
            if entity.hass:
                hass.async_create_task(entity.async_remove(force_remove=True))

    sync_entities()
    entry.async_on_unload(coordinator.async_add_listener(sync_entities))


class FireWatchGeoLocation(GeolocationEvent):
    """One current official incident, removed when it leaves the snapshot."""

    _attr_should_poll = False
    _attr_source = DOMAIN
    _attr_unit_of_measurement = UnitOfLength.KILOMETERS

    def __init__(self, coordinator: FireWatchCoordinator, incident_id: str) -> None:
        self.coordinator = coordinator
        self.incident_id = incident_id
        self.entity_id = incident_entity_id(coordinator.entry.entry_id, incident_id)
        self._remove_listener: Callable[[], None] | None = None
        self._update_from_incident()

    @property
    def incident(self) -> Incident | None:
        return next(
            (
                item
                for item in (*self.coordinator._incidents, *self.coordinator._planned)  # noqa: SLF001
                if item.id == self.incident_id
            ),
            None,
        )

    def _update_from_incident(self) -> None:
        incident = self.incident
        if incident is None:
            return
        self._attr_name = incident.title
        self._attr_distance = incident.distance_km
        self._attr_latitude = incident.latitude
        self._attr_longitude = incident.longitude
        self._attr_icon = "mdi:fire" if incident.is_fire else "mdi:alert-circle"
        self._attr_attribution = self.coordinator.jurisdiction.attribution

    async def async_added_to_hass(self) -> None:
        self._remove_listener = self.coordinator.async_add_listener(self._handle_update)

    async def async_will_remove_from_hass(self) -> None:
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

    @callback
    def _handle_update(self) -> None:
        if self.incident is None:
            self.hass.async_create_task(self.async_remove(force_remove=True))
            return
        self._update_from_incident()
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        incident = self.incident
        if incident is None:
            return {}
        return {
            "external_id": incident.id,
            "category": incident.warning_level,
            "status": incident.control_status,
            "type": incident.incident_type,
            "fire": incident.is_fire,
            "planned_activity": incident.is_planned,
            "location": incident.location,
            "council_area": incident.council,
            "updated_at": incident.updated_at.isoformat()
            if incident.updated_at
            else None,
            "official_url": incident.official_url,
            "jurisdiction": self.coordinator.jurisdiction.code,
            "source_name": self.coordinator.jurisdiction.agency,
        }
