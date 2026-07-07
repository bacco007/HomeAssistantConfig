"""Platform for binary sensor integration (warnings)."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import BomDataUpdateCoordinator
from .const import (
    ATTRIBUTION,
    COLLECTOR,
    CONF_ENTITY_PREFIX,
    CONF_WARNINGS_CREATE,
    CONF_WARNINGS_MONITORED,
    CONF_WEATHER_NAME,
    COORDINATOR,
    DOMAIN,
    SHORT_ATTRIBUTION,
    MODEL_NAME,
    WARNING_TYPES,
)
from .PyBoM.collector import Collector

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Add binary sensors for warnings if enabled."""
    # Check if warnings are enabled
    if not config_entry.options.get(CONF_WARNINGS_CREATE, config_entry.data.get(CONF_WARNINGS_CREATE, False)):
        _LOGGER.debug("Warning binary sensors not enabled in config")
        return

    hass_data = hass.data[DOMAIN][config_entry.entry_id]

    # Get location name and entity prefix (shared across all sensors)
    location_name = config_entry.options.get(
        CONF_WEATHER_NAME, config_entry.data.get(CONF_WEATHER_NAME, "Home")
    )
    entity_prefix = config_entry.options.get(
        CONF_ENTITY_PREFIX,
        config_entry.data.get(
            CONF_ENTITY_PREFIX,
            f"bom_{location_name.lower().replace(' ', '_').replace('-', '_')}"
        )
    )

    # Get which warning types to create
    warnings_monitored = config_entry.options.get(
        CONF_WARNINGS_MONITORED,
        config_entry.data.get(CONF_WARNINGS_MONITORED, list(WARNING_TYPES.keys()))
    )

    # Create binary sensors for each enabled warning type
    new_entities = []
    for warning_type in warnings_monitored:
        if warning_type in WARNING_TYPES:
            warning_info = WARNING_TYPES[warning_type]
            new_entities.append(
                BomWarningSensor(hass_data, location_name, entity_prefix, warning_type, warning_info)
            )

    if new_entities:
        async_add_entities(new_entities, update_before_add=False)


class BomWarningSensor(BinarySensorEntity):
    """Representation of a BOM Warning Binary Sensor."""

    def __init__(
        self, hass_data, location_name: str, entity_prefix: str, warning_type: str, warning_info: dict
    ) -> None:
        """Initialize the binary sensor."""
        self.collector: Collector = hass_data[COLLECTOR]
        self.coordinator: BomDataUpdateCoordinator = hass_data[COORDINATOR]
        self.location_name = location_name
        self.entity_prefix = entity_prefix
        self.warning_type = warning_type
        self.warning_info = warning_info
        self._attr_device_class = BinarySensorDeviceClass.SAFETY
        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{self.entity_prefix}_warnings")},
            manufacturer=SHORT_ATTRIBUTION,
            model=MODEL_NAME,
            name=f"BOM {self.location_name} Warnings",
        )

    async def async_added_to_hass(self) -> None:
        """Set up a listener and load data."""
        self.async_on_remove(self.coordinator.async_add_listener(self._update_callback))
        self._update_callback()

    @callback
    def _update_callback(self) -> None:
        """Load data from integration."""
        self.async_write_ha_state()

    @property
    def should_poll(self) -> bool:
        """Entities do not individually poll."""
        return False

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} {self.warning_info['name']}"

    @property
    def unique_id(self) -> str:
        """Return unique ID string."""
        return f"{self.entity_prefix}_warning_{self.warning_type}"

    @property
    def icon(self) -> str:
        """Return the icon for the sensor."""
        return self.warning_info.get("icon", "mdi:alert")

    @property
    def is_on(self) -> bool:
        """Return true if there is an active warning of this type."""
        try:
            if (
                self.collector.warnings_data
                and "data" in self.collector.warnings_data
            ):
                warnings = self.collector.warnings_data["data"]
                # Check if any warning matches this type and is active
                for warning in warnings:
                    warning_id = warning.get("id", "")
                    warning_title = warning.get("title", "").lower()
                    warning_type_api = warning.get("type", "").lower()
                    phase = warning.get("phase", "").lower()

                    # Skip warnings with inactive phases
                    if self._is_inactive_phase(phase):
                        continue

                    # Match based on type or title containing keywords
                    if self._matches_warning_type(warning_id, warning_title, warning_type_api):
                        return True
            return False
        except (KeyError, TypeError) as err:
            _LOGGER.debug(f"Error checking warning state for {self.warning_type}: {err}")
            return False

    def _is_inactive_phase(self, phase: str) -> bool:
        """Check if a warning phase is inactive.

        Only warnings with phase='cancelled' should be ignored.
        BOM API phases: new, update, renewal, downgrade, upgrade, final, cancelled
        """
        return phase == "cancelled"

    def _matches_warning_type(self, warning_id: str, warning_title: str, warning_type_api: str) -> bool:
        """Check if a warning matches this sensor's type.

        BOM API warning types match our sensor types directly:
        - flood_watch, flood_warning, sheep_graziers_warning, severe_thunderstorm_warning,
          severe_weather_warning, marine_wind_warning, hazardous_surf_warning, heatwave_warning
        """
        # Convert everything to lowercase for comparison
        warning_type_api = warning_type_api.lower()
        sensor_type = self.warning_type.lower()

        # Direct type match (primary method)
        if warning_type_api == sensor_type:
            return True

        # Fallback: check if sensor type is in warning type
        if sensor_type in warning_type_api:
            return True

        return False

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        try:
            attrs = {"attribution": ATTRIBUTION}

            if (
                self.collector.warnings_data
                and "data" in self.collector.warnings_data
            ):
                warnings = self.collector.warnings_data["data"]
                # Find the first active warning of this type
                for warning in warnings:
                    warning_id = warning.get("id", "")
                    warning_title = warning.get("title", "").lower()
                    warning_type_api = warning.get("type", "").lower()
                    phase = warning.get("phase", "")

                    # Skip warnings with inactive phases
                    if self._is_inactive_phase(phase.lower()):
                        continue

                    if self._matches_warning_type(warning_id, warning_title, warning_type_api):
                        # Add attributes for this active warning
                        attrs["ID"] = warning.get("id")
                        attrs["title"] = warning.get("title")
                        attrs["warning_group_type"] = warning.get("warning_group_type")
                        attrs["phase"] = phase
                        attrs["issue_time"] = warning.get("issue_time")
                        attrs["expiry_time"] = warning.get("expiry_time")
                        # Stop after finding the first active warning
                        break

            return attrs
        except (KeyError, TypeError) as err:
            _LOGGER.debug(f"Error building warning attributes for {self.warning_type}: {err}")
            return {"attribution": ATTRIBUTION}
