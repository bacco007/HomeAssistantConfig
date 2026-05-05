import logging

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTR_EVENT_TYPE, ATTR_MAX_SEVERITY, ATTR_SEVERITY, ATTR_WARNING_LEVEL, DOMAIN, SEVERITY_ORDER
from .coordinator import EmergencyAPICoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: EmergencyAPICoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        EmergencyAPIIncidentCountSensor(coordinator, entry),
        EmergencyAPINearestSensor(coordinator, entry),
    ])


class EmergencyAPIIncidentCountSensor(CoordinatorEntity, SensorEntity):

    _attr_has_entity_name = True
    _attr_name = "Nearby Incidents"
    _attr_icon = "mdi:alert-circle"
    _attr_native_unit_of_measurement = "incidents"

    def __init__(self, coordinator: EmergencyAPICoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_count"

    @property
    def native_value(self) -> int:
        return self.coordinator.incident_count

    @property
    def extra_state_attributes(self) -> dict:
        incidents = self.coordinator.incidents
        if not incidents:
            return {ATTR_MAX_SEVERITY: None}

        severities = [f.get("properties", {}).get("severity", "Unknown") for f in incidents]
        max_sev = max(severities, key=lambda s: SEVERITY_ORDER.get(s, 0))
        return {ATTR_MAX_SEVERITY: max_sev}


class EmergencyAPINearestSensor(CoordinatorEntity, SensorEntity):

    _attr_has_entity_name = True
    _attr_name = "Nearest Emergency"
    _attr_icon = "mdi:map-marker-alert"
    _attr_native_unit_of_measurement = "km"

    def __init__(self, coordinator: EmergencyAPICoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_nearest"

    @property
    def native_value(self) -> float | None:
        incidents = self.coordinator.incidents
        if not incidents:
            return None
        distances = [f.get("properties", {}).get("distance") for f in incidents]
        valid = [d for d in distances if d is not None]
        return round(min(valid), 1) if valid else None

    @property
    def extra_state_attributes(self) -> dict:
        incidents = self.coordinator.incidents
        if not incidents:
            return {}

        distances = [
            (f.get("properties", {}).get("distance"), f)
            for f in incidents
            if f.get("properties", {}).get("distance") is not None
        ]
        if not distances:
            return {}

        nearest = min(distances, key=lambda x: x[0])
        props = nearest[1].get("properties", {})
        return {
            "title": props.get("title"),
            ATTR_EVENT_TYPE: props.get("eventType"),
            ATTR_SEVERITY: props.get("severity"),
            ATTR_WARNING_LEVEL: props.get("warningLevel"),
        }
