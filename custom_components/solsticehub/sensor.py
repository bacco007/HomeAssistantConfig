"""Sensor platform for SolsticeHub integration.

This module serves as the entry point for all sensor entities.
It routes sensor creation based on device type:
- Four Seasons: current_season, equinox/solstice timestamps, etc.
- Cross-Quarter: current_period, next_period_change
- Chinese Solar Terms: current_term, next_term_change

Every calendar device type additionally gets the shared base-data sensors
(solar_longitude, daylight_trend, next_daylight_trend_change).
"""

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
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .base_sensor import make_base_sensor_descriptions
from .calculations import SeasonData
from .chinese_sensor import ChineseSolarTermsSensor, get_chinese_sensor_descriptions
from .const import (
    CONF_HEMISPHERE,
    CONF_MODE,
    CONF_NAME,
    CONF_SCOPE,
    DEVICE_CHINESE,
    DEVICE_CROSS_QUARTER,
    DEVICE_FOUR_SEASONS,
    DOMAIN,
    ICON_AUTUMN,
    ICON_NEXT_SEASON_CHANGE,
    ICON_SPRING,
    ICON_SUMMER,
    ICON_WINTER,
    SEASON_ICONS,
    SENSOR_AUTUMN_EQUINOX,
    SENSOR_CURRENT_SEASON,
    SENSOR_NEXT_SEASON_CHANGE,
    SENSOR_SPRING_EQUINOX,
    SENSOR_SUMMER_SOLSTICE,
    SENSOR_WINTER_SOLSTICE,
)
from .coordinator import SolsticeHubCoordinator
from .cross_quarter_sensor import CROSS_QUARTER_SENSOR_DESCRIPTIONS, CrossQuarterSensor
from .device import device_model, english_object_id

# Load version from manifest.json
MANIFEST = json.loads((Path(__file__).parent / "manifest.json").read_text())
VERSION = MANIFEST["version"]


@dataclass(frozen=True, kw_only=True)
class SolsticeHubSensorEntityDescription(SensorEntityDescription):
    """Describes a SolsticeHub sensor entity."""

    value_fn: Callable[[SeasonData], Any]
    extra_state_attributes_fn: Callable[[SeasonData], dict[str, Any]] | None = None
    icon_fn: Callable[[SeasonData], str] | None = None


def get_current_season_icon(data: SeasonData) -> str:
    """Get icon for current season."""
    return SEASON_ICONS.get(data["current_season"], "mdi:calendar")


# Four Seasons sensor descriptions
FOUR_SEASONS_SENSOR_DESCRIPTIONS: tuple[SolsticeHubSensorEntityDescription, ...] = (
    SolsticeHubSensorEntityDescription(
        key=SENSOR_CURRENT_SEASON,
        translation_key=SENSOR_CURRENT_SEASON,
        device_class=SensorDeviceClass.ENUM,
        options=["spring", "summer", "autumn", "winter"],
        value_fn=lambda data: data["current_season"],
        extra_state_attributes_fn=lambda data: {
            "season_age": data["season_age"],
            "season_progress": data["season_progress"],
        },
        icon_fn=get_current_season_icon,
    ),
    SolsticeHubSensorEntityDescription(
        key=SENSOR_SPRING_EQUINOX,
        translation_key=SENSOR_SPRING_EQUINOX,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_SPRING,
        value_fn=lambda data: data["spring_equinox"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_spring"],
            "last_start": data["previous_spring_equinox"].date().isoformat(),
        },
    ),
    SolsticeHubSensorEntityDescription(
        key=SENSOR_SUMMER_SOLSTICE,
        translation_key=SENSOR_SUMMER_SOLSTICE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_SUMMER,
        value_fn=lambda data: data["summer_solstice"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_summer"],
            "last_start": data["previous_summer_solstice"].date().isoformat(),
        },
    ),
    SolsticeHubSensorEntityDescription(
        key=SENSOR_AUTUMN_EQUINOX,
        translation_key=SENSOR_AUTUMN_EQUINOX,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_AUTUMN,
        value_fn=lambda data: data["autumn_equinox"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_autumn"],
            "last_start": data["previous_autumn_equinox"].date().isoformat(),
        },
    ),
    SolsticeHubSensorEntityDescription(
        key=SENSOR_WINTER_SOLSTICE,
        translation_key=SENSOR_WINTER_SOLSTICE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_WINTER,
        value_fn=lambda data: data["winter_solstice"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_winter"],
            "last_start": data["previous_winter_solstice"].date().isoformat(),
        },
    ),
    SolsticeHubSensorEntityDescription(
        key=SENSOR_NEXT_SEASON_CHANGE,
        translation_key=SENSOR_NEXT_SEASON_CHANGE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_NEXT_SEASON_CHANGE,
        value_fn=lambda data: data["next_season_change"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_season_change"],
            "event_type": data["next_season_change_event_type"],
        },
    ),
) + make_base_sensor_descriptions(SolsticeHubSensorEntityDescription)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up SolsticeHub sensors from a config entry.

    This routes sensor creation based on the device type configured
    in the config entry.

    Args:
        hass: Home Assistant instance.
        config_entry: The config entry for this integration instance.
        async_add_entities: Callback to add entities.
    """
    entry_data = hass.data[DOMAIN][config_entry.entry_id]
    coordinator = entry_data["coordinator"]
    device_type = entry_data["device_type"]

    entities: list[SensorEntity] = []

    if device_type == DEVICE_CROSS_QUARTER:
        # Cross-Quarter sensors
        entities.extend(
            CrossQuarterSensor(coordinator, description, config_entry)
            for description in CROSS_QUARTER_SENSOR_DESCRIPTIONS
        )
    elif device_type == DEVICE_CHINESE:
        # Chinese Solar Terms sensors
        scope = config_entry.data.get(CONF_SCOPE, "all_24")
        descriptions = get_chinese_sensor_descriptions(scope)
        entities.extend(
            ChineseSolarTermsSensor(coordinator, description, config_entry)
            for description in descriptions
        )
    else:
        # Four Seasons sensors (default)
        entities.extend(
            FourSeasonsSensor(coordinator, description, config_entry)
            for description in FOUR_SEASONS_SENSOR_DESCRIPTIONS
        )

    async_add_entities(entities)


class FourSeasonsSensor(
    CoordinatorEntity[SolsticeHubCoordinator], SensorEntity
):
    """Representation of a Four Seasons sensor."""

    entity_description: SolsticeHubSensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: SolsticeHubCoordinator,
        description: SolsticeHubSensorEntityDescription,
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

        # Build a fully English, language-independent entity_id from the device
        # type/mode label (not the localized device name), so entity IDs never
        # change with the system language and stay predictable for automations.
        self.entity_id = ENTITY_ID_FORMAT.format(
            english_object_id(DEVICE_FOUR_SEASONS, config_entry.data, description.key)
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
            model=device_model(DEVICE_FOUR_SEASONS, self._config_entry.data),
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

        # Add mode and hemisphere to current_season sensor attributes
        if self.entity_description.key == SENSOR_CURRENT_SEASON:
            attrs["mode"] = self._config_entry.data[CONF_MODE]
            attrs["hemisphere"] = self._config_entry.data[CONF_HEMISPHERE]

        return attrs

    @property
    def icon(self) -> str | None:
        """Return the icon for the sensor."""
        if self.entity_description.icon_fn is not None and self.coordinator.data:
            return self.entity_description.icon_fn(self.coordinator.data)
        return self.entity_description.icon
