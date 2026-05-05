import logging

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import ATTR_INCIDENT_COUNT, ATTR_MAX_SEVERITY, ATTR_MAX_WARNING_LEVEL, ATTR_NEAREST_DISTANCE, DOMAIN, SEVERITY_ORDER
from .coordinator import EmergencyAPICoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: EmergencyAPICoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([EmergencyAPIAlertSensor(coordinator, entry)])


class EmergencyAPIAlertSensor(CoordinatorEntity, BinarySensorEntity):

    _attr_device_class = BinarySensorDeviceClass.SAFETY
    _attr_has_entity_name = True
    _attr_name = "Emergency Alert"

    def __init__(self, coordinator: EmergencyAPICoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_alert"

    @property
    def is_on(self) -> bool:
        return self.coordinator.incident_count > 0

    @property
    def extra_state_attributes(self) -> dict:
        incidents = self.coordinator.incidents
        if not incidents:
            return {
                ATTR_INCIDENT_COUNT: 0,
                ATTR_NEAREST_DISTANCE: None,
                ATTR_MAX_SEVERITY: None,
                ATTR_MAX_WARNING_LEVEL: None,
            }

        severities = [f.get("properties", {}).get("severity", "Unknown") for f in incidents]
        max_sev = max(severities, key=lambda s: SEVERITY_ORDER.get(s, 0))

        warnings = [f.get("properties", {}).get("warningLevel", "none") for f in incidents]
        warning_priority = {"emergency_warning": 3, "watch_and_act": 2, "advice": 1, "none": 0}
        max_warn = max(warnings, key=lambda w: warning_priority.get(w, 0))

        distances = [f.get("properties", {}).get("distance") for f in incidents]
        valid_distances = [d for d in distances if d is not None]
        nearest = min(valid_distances) if valid_distances else None

        return {
            ATTR_INCIDENT_COUNT: len(incidents),
            ATTR_NEAREST_DISTANCE: nearest,
            ATTR_MAX_SEVERITY: max_sev,
            ATTR_MAX_WARNING_LEVEL: max_warn,
        }
