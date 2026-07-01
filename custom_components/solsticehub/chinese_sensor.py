"""Sensor platform for Chinese Solar Terms calendar."""

from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .base_sensor import make_base_sensor_descriptions
from .calculations import ChineseSolarTermsData
from .chinese_coordinator import ChineseSolarTermsCoordinator
from .const import (
    CHINESE_MAJOR_TERMS,
    CHINESE_TERM_NAMES,
    CONF_NAME,
    CONF_SCOPE,
    DEVICE_CHINESE,
    DOMAIN,
    ICON_CHINESE_TERM,
    ICON_NEXT_TERM_CHANGE,
    SCOPE_8_MAJOR,
    SENSOR_CURRENT_TERM,
    SENSOR_NEXT_TERM_CHANGE,
)
from .device import device_model, english_object_id

# Load version from manifest.json
MANIFEST = json.loads((Path(__file__).parent / "manifest.json").read_text())
VERSION = MANIFEST["version"]


@dataclass(frozen=True, kw_only=True)
class ChineseSolarTermsSensorEntityDescription(SensorEntityDescription):
    """Describes a Chinese Solar Terms sensor entity."""

    value_fn: Callable[[ChineseSolarTermsData], Any]
    extra_state_attributes_fn: Callable[[ChineseSolarTermsData], dict[str, Any]] | None = (
        None
    )
    icon_fn: Callable[[ChineseSolarTermsData], str] | None = None


def get_chinese_sensor_descriptions(
    scope: str,
) -> tuple[ChineseSolarTermsSensorEntityDescription, ...]:
    """Get sensor descriptions for Chinese Solar Terms based on scope.

    Args:
        scope: Either 'all_24' or '8_major'.

    Returns:
        Tuple of sensor descriptions.
    """
    # Determine which terms to use for enum options
    term_list = CHINESE_MAJOR_TERMS if scope == SCOPE_8_MAJOR else CHINESE_TERM_NAMES

    return (
        ChineseSolarTermsSensorEntityDescription(
            key=SENSOR_CURRENT_TERM,
            translation_key=SENSOR_CURRENT_TERM,
            device_class=SensorDeviceClass.ENUM,
            options=list(term_list),
            icon=ICON_CHINESE_TERM,
            value_fn=lambda data: data["current_term"],
            extra_state_attributes_fn=lambda data: {
                "term_age": data["term_age"],
                "events": {
                    name: dt.isoformat() for name, dt in data["events"].items()
                },
            },
        ),
        ChineseSolarTermsSensorEntityDescription(
            key=SENSOR_NEXT_TERM_CHANGE,
            translation_key=SENSOR_NEXT_TERM_CHANGE,
            device_class=SensorDeviceClass.TIMESTAMP,
            icon=ICON_NEXT_TERM_CHANGE,
            value_fn=lambda data: data["next_term_change"],
            extra_state_attributes_fn=lambda data: {
                "days_until": data["days_until_next_change"],
                "event_type": data["next_term_event_type"],
            },
        ),
    ) + make_base_sensor_descriptions(ChineseSolarTermsSensorEntityDescription)


class ChineseSolarTermsSensor(
    CoordinatorEntity[ChineseSolarTermsCoordinator], SensorEntity
):
    """Representation of a Chinese Solar Terms sensor."""

    entity_description: ChineseSolarTermsSensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: ChineseSolarTermsCoordinator,
        description: ChineseSolarTermsSensorEntityDescription,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor.

        Args:
            coordinator: The data update coordinator.
            description: Entity description for this sensor.
            config_entry: The config entry for this integration instance.
        """
        super().__init__(coordinator)
        self.entity_description = description
        self._config_entry = config_entry

        # Set unique_id based on entry_id and sensor key
        self._attr_unique_id = f"{config_entry.entry_id}_{description.key}"

        # Fully English, language-independent entity_id (see FourSeasonsSensor).
        self.entity_id = ENTITY_ID_FORMAT.format(
            english_object_id(DEVICE_CHINESE, config_entry.data, description.key)
        )

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information.

        All sensors are grouped under a single device with the user's chosen name.
        """
        return DeviceInfo(
            identifiers={(DOMAIN, self._config_entry.entry_id)},
            name=self._config_entry.data[CONF_NAME],
            manufacturer="SolsticeHub",
            model=device_model(DEVICE_CHINESE, self._config_entry.data),
            sw_version=VERSION,
        )

    @property
    def native_value(self) -> str | float | datetime | None:
        """Return the state of the sensor."""
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return additional state attributes."""
        if self.coordinator.data is None:
            return None
        if self.entity_description.extra_state_attributes_fn is None:
            return None

        attrs = self.entity_description.extra_state_attributes_fn(self.coordinator.data)

        # Add scope to current_term sensor attributes
        if self.entity_description.key == SENSOR_CURRENT_TERM:
            attrs["scope"] = self._config_entry.data.get(CONF_SCOPE, "all_24")

        return attrs

    @property
    def icon(self) -> str | None:
        """Return the icon for the sensor."""
        if self.entity_description.icon_fn is not None and self.coordinator.data:
            return self.entity_description.icon_fn(self.coordinator.data)
        return self.entity_description.icon
