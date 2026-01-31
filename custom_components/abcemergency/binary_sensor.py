"""Binary sensor platform for ABC Emergency integration.

This module provides binary sensor entities that indicate active alert states,
ideal for automations and notifications.

Binary sensors are created for all instance types (state, zone, person).
For state instances, the sensors indicate if any alert is active in the state.
For zone/person instances, they indicate alerts within the configured radii.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from .const import DOMAIN, INSTANCE_TYPE_PERSON, INSTANCE_TYPE_STATE, INSTANCE_TYPE_ZONE, AlertLevel
from .coordinator import ABCEmergencyCoordinator
from .entity import ABCEmergencyEntity
from .models import CoordinatorData

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry


@dataclass(frozen=True, kw_only=True)
class ABCEmergencyBinarySensorEntityDescription(BinarySensorEntityDescription):
    """Entity description for ABC Emergency binary sensors."""

    is_on_fn: Callable[[CoordinatorData], bool]
    attr_fn: Callable[[CoordinatorData], dict[str, Any]] | None = None
    location_only: bool = False  # Only for zone/person instances


def _get_emergency_attrs(
    data: CoordinatorData,
    levels: str | tuple[str, ...],
) -> dict[str, Any]:
    """Get attributes for emergency level binary sensors.

    Args:
        data: Coordinator data.
        levels: Alert level(s) to filter by.

    Returns:
        Dictionary of attributes for the nearest matching incident.
    """
    if isinstance(levels, str):
        levels = (levels,)

    # For location-based instances, filter by distance
    if data.instance_type != INSTANCE_TYPE_STATE:
        matching = [
            i for i in data.incidents if i.alert_level in levels and i.distance_km is not None
        ]
    else:
        # For state instances, show all matching
        matching = [i for i in data.incidents if i.alert_level in levels]

    if not matching:
        return {}

    # For location-based, find nearest; for state, just take the first
    if data.instance_type != INSTANCE_TYPE_STATE:
        nearest = min(matching, key=lambda i: i.distance_km or float("inf"))
        return {
            "count": len(matching),
            "nearest_headline": nearest.headline,
            "nearest_distance_km": round(nearest.distance_km, 1) if nearest.distance_km else None,
            "nearest_direction": nearest.direction,
        }
    else:
        # For state instances, just return count and first incident
        first = matching[0]
        return {
            "count": len(matching),
            "headline": first.headline,
        }


def _is_active_alert(data: CoordinatorData) -> bool:
    """Check if there's an active alert."""
    if data.instance_type == INSTANCE_TYPE_STATE:
        return data.total_count > 0
    return data.nearby_count is not None and data.nearby_count > 0


# Sensors for all instance types (based on highest_alert_level which works for all)
BINARY_SENSOR_DESCRIPTIONS: tuple[ABCEmergencyBinarySensorEntityDescription, ...] = (
    ABCEmergencyBinarySensorEntityDescription(
        key="active_alert",
        translation_key="active_alert",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=_is_active_alert,
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="emergency_warning",
        translation_key="emergency_warning",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.highest_alert_level == AlertLevel.EMERGENCY,
        attr_fn=lambda data: _get_emergency_attrs(data, AlertLevel.EMERGENCY),
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="watch_and_act",
        translation_key="watch_and_act",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.highest_alert_level
        in (
            AlertLevel.EMERGENCY,
            AlertLevel.WATCH_AND_ACT,
        ),
        attr_fn=lambda data: _get_emergency_attrs(
            data, (AlertLevel.EMERGENCY, AlertLevel.WATCH_AND_ACT)
        ),
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="advice",
        translation_key="advice",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.highest_alert_level
        in (
            AlertLevel.EMERGENCY,
            AlertLevel.WATCH_AND_ACT,
            AlertLevel.ADVICE,
        ),
    ),
)


def _get_containment_attributes_for_level(
    data: CoordinatorData,
    levels: tuple[str, ...],
) -> dict[str, Any]:
    """Get containment attributes filtered by alert level(s).

    Args:
        data: Coordinator data.
        levels: Tuple of alert levels to include.

    Returns:
        Dictionary with count and filtered incidents list.
    """
    matching = [inc for inc in data.containing_incidents if inc.alert_level in levels]
    return {
        "count": len(matching),
        "incidents": [
            {
                "id": inc.id,
                "headline": inc.headline,
                "event_type": inc.event_type,
            }
            for inc in matching
        ],
    }


def _get_inside_polygon_attributes(data: CoordinatorData) -> dict[str, Any]:
    """Get attributes for the inside_polygon sensor.

    Args:
        data: Coordinator data.

    Returns:
        Dictionary with containing_count, highest_alert_level, and incidents.
    """
    return {
        "containing_count": len(data.containing_incidents),
        "highest_alert_level": data.highest_containing_alert_level,
        "incidents": [
            {
                "id": inc.id,
                "headline": inc.headline,
                "alert_level": inc.alert_level,
                "alert_text": inc.alert_text,
                "event_type": inc.event_type,
            }
            for inc in data.containing_incidents
        ],
    }


# Containment binary sensors - only for zone/person instances
CONTAINMENT_BINARY_SENSOR_DESCRIPTIONS: tuple[ABCEmergencyBinarySensorEntityDescription, ...] = (
    ABCEmergencyBinarySensorEntityDescription(
        key="inside_polygon",
        translation_key="inside_polygon",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.inside_polygon,
        attr_fn=_get_inside_polygon_attributes,
        location_only=True,
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="inside_emergency_warning",
        translation_key="inside_emergency_warning",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.inside_emergency_warning,
        attr_fn=lambda data: _get_containment_attributes_for_level(data, (AlertLevel.EMERGENCY,)),
        location_only=True,
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="inside_watch_and_act",
        translation_key="inside_watch_and_act",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.inside_watch_and_act,
        attr_fn=lambda data: _get_containment_attributes_for_level(
            data, (AlertLevel.EMERGENCY, AlertLevel.WATCH_AND_ACT)
        ),
        location_only=True,
    ),
    ABCEmergencyBinarySensorEntityDescription(
        key="inside_advice",
        translation_key="inside_advice",
        device_class=BinarySensorDeviceClass.SAFETY,
        is_on_fn=lambda data: data.inside_advice,
        attr_fn=lambda data: _get_containment_attributes_for_level(
            data, (AlertLevel.EMERGENCY, AlertLevel.WATCH_AND_ACT, AlertLevel.ADVICE)
        ),
        location_only=True,
    ),
)


class ABCEmergencyBinarySensor(ABCEmergencyEntity, BinarySensorEntity):
    """Binary sensor entity for ABC Emergency."""

    entity_description: ABCEmergencyBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: ABCEmergencyCoordinator,
        config_entry: ConfigEntry,
        description: ABCEmergencyBinarySensorEntityDescription,
    ) -> None:
        """Initialize the binary sensor.

        Args:
            coordinator: The data update coordinator.
            config_entry: The config entry for this integration.
            description: The entity description.
        """
        super().__init__(coordinator, config_entry)
        self.entity_description = description
        self._attr_unique_id = f"{config_entry.entry_id}_{description.key}"
        self._instance_source = config_entry.title or "ABC Emergency"

    def _get_geo_location_entity_id(self, incident_id: str) -> str:
        """Generate geo_location entity ID for a given incident.

        This must match the unique_id format used in geo_location.py to ensure
        map cards can correctly reference geo_location entities.

        Args:
            incident_id: The incident ID (e.g., "AUREMER-12345").

        Returns:
            The full entity ID (e.g., "geo_location.abc_emergency_home_auremer_12345").
        """
        unique_id = f"{self._instance_source}_{incident_id}"
        return f"geo_location.{slugify(unique_id)}"

    @property
    def is_on(self) -> bool:
        """Return true if there is an active alert."""
        return self.entity_description.is_on_fn(self.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return extra state attributes.

        Includes containing_entity_ids for containment sensors when available,
        enabling map cards to dynamically discover geo_location entities.
        """
        if self.entity_description.attr_fn:
            attrs = self.entity_description.attr_fn(self.data)
            # Add containing_entity_ids for any sensor with an incidents list
            if "incidents" in attrs:
                attrs["containing_entity_ids"] = [
                    self._get_geo_location_entity_id(inc["id"]) for inc in attrs["incidents"]
                ]
            return attrs
        return None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up ABC Emergency binary sensors.

    Args:
        hass: Home Assistant instance.
        entry: Config entry being set up.
        async_add_entities: Callback to add entities.
    """
    coordinator: ABCEmergencyCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities: list[ABCEmergencyBinarySensor] = [
        ABCEmergencyBinarySensor(coordinator, entry, description)
        for description in BINARY_SENSOR_DESCRIPTIONS
    ]

    # Add containment sensors only for zone/person instances
    # State mode doesn't have a monitored point for containment detection
    if coordinator.instance_type in (INSTANCE_TYPE_ZONE, INSTANCE_TYPE_PERSON):
        entities.extend(
            ABCEmergencyBinarySensor(coordinator, entry, description)
            for description in CONTAINMENT_BINARY_SENSOR_DESCRIPTIONS
        )

    async_add_entities(entities)
