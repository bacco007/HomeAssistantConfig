"""Sensor platform for Solstice Season integration."""

from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .calculations import SeasonData
from .const import (
    CONF_HEMISPHERE,
    CONF_MODE,
    CONF_NAME,
    DOMAIN,
    ICON_AUTUMN,
    ICON_NEXT_SEASON_CHANGE,
    ICON_NEXT_TREND_CHANGE,
    ICON_SPRING,
    ICON_SUMMER,
    ICON_WINTER,
    MODE_ASTRONOMICAL,
    SEASON_ICONS,
    SENSOR_AUTUMN_EQUINOX,
    SENSOR_CURRENT_SEASON,
    SENSOR_DAYLIGHT_TREND,
    SENSOR_NEXT_SEASON_CHANGE,
    SENSOR_NEXT_TREND_CHANGE,
    SENSOR_SPRING_EQUINOX,
    SENSOR_SUMMER_SOLSTICE,
    SENSOR_WINTER_SOLSTICE,
    TREND_ICONS,
)
from .coordinator import SolsticeSeasonCoordinator

# Load version from manifest.json
MANIFEST = json.loads((Path(__file__).parent / "manifest.json").read_text())
VERSION = MANIFEST["version"]


@dataclass(frozen=True, kw_only=True)
class SolsticeSeasonSensorEntityDescription(SensorEntityDescription):
    """Describes a Solstice Season sensor entity."""

    value_fn: Callable[[SeasonData], Any]
    extra_state_attributes_fn: Callable[[SeasonData], dict[str, Any]] | None = None
    icon_fn: Callable[[SeasonData], str] | None = None


def get_current_season_icon(data: SeasonData) -> str:
    """Get icon for current season."""
    return SEASON_ICONS.get(data["current_season"], "mdi:calendar")


def get_daylight_trend_icon(data: SeasonData) -> str:
    """Get icon for daylight trend."""
    return TREND_ICONS.get(data["daylight_trend"], "mdi:arrow-left-right")


SENSOR_DESCRIPTIONS: tuple[SolsticeSeasonSensorEntityDescription, ...] = (
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_CURRENT_SEASON,
        translation_key=SENSOR_CURRENT_SEASON,
        device_class=SensorDeviceClass.ENUM,
        options=["spring", "summer", "autumn", "winter"],
        value_fn=lambda data: data["current_season"],
        extra_state_attributes_fn=lambda data: {
            "mode": data.get("mode", "astronomical"),
            "hemisphere": data.get("hemisphere", "northern"),
            "season_age": data["season_age"],
            "spring_start": data["spring_start"],
            "summer_start": data["summer_start"],
            "autumn_start": data["autumn_start"],
            "winter_start": data["winter_start"],
        },
        icon_fn=get_current_season_icon,
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_SPRING_EQUINOX,
        translation_key=SENSOR_SPRING_EQUINOX,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_SPRING,
        value_fn=lambda data: data["spring_equinox"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_spring"],
        },
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_SUMMER_SOLSTICE,
        translation_key=SENSOR_SUMMER_SOLSTICE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_SUMMER,
        value_fn=lambda data: data["summer_solstice"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_summer"],
        },
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_AUTUMN_EQUINOX,
        translation_key=SENSOR_AUTUMN_EQUINOX,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_AUTUMN,
        value_fn=lambda data: data["autumn_equinox"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_autumn"],
        },
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_WINTER_SOLSTICE,
        translation_key=SENSOR_WINTER_SOLSTICE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_WINTER,
        value_fn=lambda data: data["winter_solstice"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_winter"],
        },
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_DAYLIGHT_TREND,
        translation_key=SENSOR_DAYLIGHT_TREND,
        device_class=SensorDeviceClass.ENUM,
        options=["days_getting_longer", "days_getting_shorter", "solstice_today"],
        value_fn=lambda data: data["daylight_trend"],
        icon_fn=get_daylight_trend_icon,
    ),
    SolsticeSeasonSensorEntityDescription(
        key=SENSOR_NEXT_TREND_CHANGE,
        translation_key=SENSOR_NEXT_TREND_CHANGE,
        device_class=SensorDeviceClass.TIMESTAMP,
        icon=ICON_NEXT_TREND_CHANGE,
        value_fn=lambda data: data["next_trend_change"],
        extra_state_attributes_fn=lambda data: {
            "days_until": data["days_until_trend_change"],
            "event_type": data["next_trend_event_type"],
        },
    ),
    SolsticeSeasonSensorEntityDescription(
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
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Solstice Season sensors from a config entry.

    Args:
        hass: Home Assistant instance.
        config_entry: The config entry for this integration instance.
        async_add_entities: Callback to add entities.
    """
    coordinator: SolsticeSeasonCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    async_add_entities(
        SolsticeSeasonSensor(coordinator, description, config_entry)
        for description in SENSOR_DESCRIPTIONS
    )


class SolsticeSeasonSensor(
    CoordinatorEntity[SolsticeSeasonCoordinator], SensorEntity
):
    """Representation of a Solstice Season sensor."""

    entity_description: SolsticeSeasonSensorEntityDescription
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: SolsticeSeasonCoordinator,
        description: SolsticeSeasonSensorEntityDescription,
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

    @property
    def device_info(self) -> DeviceInfo:
        """Return device information.

        All sensors are grouped under a single device with the user's chosen name.
        """
        mode = self._config_entry.data[CONF_MODE]
        model = (
            "Astronomical Calculator"
            if mode == MODE_ASTRONOMICAL
            else "Meteorological Calculator"
        )

        return DeviceInfo(
            identifiers={(DOMAIN, self._config_entry.entry_id)},
            name=self._config_entry.data[CONF_NAME],
            manufacturer="Solstice Season",
            model=model,
            sw_version=VERSION,
        )

    @property
    def native_value(self) -> str | datetime | None:
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
