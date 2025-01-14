"""Platform for sensor integration."""

import logging
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.typing import StateType

from .const import DOMAIN, PSN_COORDINATOR, CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES
from .entity import PSNEntity

_LOGGER = logging.getLogger(__name__)


@dataclass
class PsnSensorEntityDescription(SensorEntityDescription):
    """Class describing PSN sensor entities."""

    value_fn: Callable = None
    attributes_fn: Callable = None
    unique_id: str = ""
    description: str = ""


def get_ps_plus_status(coordinator_data: any) -> str:
    if coordinator_data.get("profile", {}).get("isPlus"):
        return "Active"
    return "Inactive"


def get_status(coordinator_data: any) -> str:
    """Returns online status"""
    match coordinator_data.get("platform").get("onlineStatus"):
        case "online":
            if (
                coordinator_data.get("available") is True
                and coordinator_data.get("title_metadata").get("npTitleId") is not None
            ):
                return "Playing"
            else:
                return "Online"
        case "offline":
            return "Offline"
        case _:
            return "Offline"


def get_status_attr(coordinator_data: any) -> dict[str, str]:
    """Parses status attributes"""
    attrs: dict[str, str] = {
        "name": None,
        "description": None,
        "platform": None,
        "content_rating": None,
        "play_count": None,
        "play_duration": None,
        "star_rating": None,
        "about_me": None,
        "trophies": {
            "platinum": None,
            "gold": None,
            "silver": None,
            "bronze": None,
        },
        "earned_trophies": {
            "platinum": None,
            "gold": None,
            "silver": None,
            "bronze": None,
        },
        "trophy_progress": None,
    }

    attrs["next_level_progress"] = coordinator_data.get("trophy_summary").progress
    attrs["about_me"] = coordinator_data.get("profile").get("aboutMe")

    if coordinator_data.get("title_metadata", {}).get("npTitleId"):
        title = coordinator_data.get("title_details", [{}])[0]
        title_trophies = coordinator_data.get("title_trophies", {})

        attrs["name"] = title.get("name", "").title()

        description = ""
        for desc in title.get("descriptions", [""]):
            if desc.get("type") == "SHORT":
                description = desc.get("desc", "").title()

        if len(description) >= 252:
            description = f"{description[0:252]}..."
        attrs["description"] = description

        attrs["platform"] = (
            coordinator_data.get("presence", {})
            .get("basicPresence", {})
            .get("gameTitleInfoList", [""])[0]
            .get("format", "")
        )
        attrs["content_rating"] = title.get("contentRating", {}).get("description", "")
        attrs["star_rating"] = title.get("starRating", {}).get("score", 0)
        attrs["trophies"] = title_trophies.defined_trophies
        attrs["earned_trophies"] = title_trophies.earned_trophies
        attrs["trophy_progress"] = title_trophies.progress

        for t in coordinator_data["recent_titles"]:
            if t.title_id == coordinator_data.get("title_metadata").get("npTitleId"):
                title_stats = t
                break

        attrs["play_count"] = title_stats.play_count

        formatted_duration, hours_duration = convert_time(
            duration=title_stats.play_duration
        )
        attrs["play_duration"] = formatted_duration
        attrs["play_duration_hours"] = hours_duration

    return attrs


def convert_time(duration: datetime) -> tuple[str, str]:
    minutes, seconds = divmod(duration.seconds, 60)
    hours, minutes = divmod(minutes, 60)

    """Calculate total hours including days"""
    total_hours = duration.days * 24 + hours
    total_minutes = minutes

    """Original formatted string"""
    if duration.days > 1:
        formatted_time = f"{duration.days} Days {hours}h"
    elif duration.days == 1:
        formatted_time = f"{duration.days} Day {hours}h"
    else:
        formatted_time = f"{hours}h {minutes}m"

    """Hours format with minutes"""
    hours_format = f"{total_hours}h {total_minutes}min"

    return formatted_time, hours_format


def get_trophy_attr(coordinator_data: any) -> dict[str, str]:
    """Create the attributes for earned trophies."""
    attrs: dict[str, str] = {
        "platinum": 0,
        "gold": 0,
        "silver": 0,
        "bronze": 0,
        "next_level_progress": 0,
    }
    earned_trophies = coordinator_data.get("trophy_summary").earned_trophies

    attrs["platinum"] = earned_trophies.platinum
    attrs["gold"] = earned_trophies.gold
    attrs["silver"] = earned_trophies.silver
    attrs["bronze"] = earned_trophies.bronze
    attrs["next_level_progress"] = coordinator_data.get("trophy_summary").progress
    attrs["trophy_level"] = coordinator_data.get("trophy_summary").trophy_level
    return attrs


PSN_SENSOR: tuple[PsnSensorEntityDescription, ...] = (
    PsnSensorEntityDescription(
        key="trophy_summary",
        native_unit_of_measurement=None,
        name="Trophy Level",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_level",
        value_fn=lambda data: data.get("trophy_summary").trophy_level,
        attributes_fn=get_trophy_attr,
    ),
    PsnSensorEntityDescription(
        key="status",
        device_class=SensorDeviceClass.ENUM,
        name="Status",
        icon="mdi:account-circle-outline",
        options=["Online", "Offline", "Playing"],
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_status",
        value_fn=get_status,
        attributes_fn=get_status_attr,
    ),
    PsnSensorEntityDescription(
        key="has_playstation_plus",
        device_class=SensorDeviceClass.ENUM,
        name="Playstation Plus",
        icon="mdi:gamepad-outline",
        options=["Active", "Inactive"],
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="has_playstation_plus",
        value_fn=get_ps_plus_status,
    ),
    PsnSensorEntityDescription(
        key="about_me",
        native_unit_of_measurement=None,
        name="About Me",
        icon="mdi:comment-text-outline",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="about_me",
        value_fn=lambda data: data.get("profile").get("aboutMe"),
    ),
)

PSN_ADDITIONAL_SENSOR: tuple[PsnSensorEntityDescription, ...] = (
    PsnSensorEntityDescription(
        key="name",
        native_unit_of_measurement=None,
        name="Title",
        icon="mdi:gamepad-outline",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_title_name_attr",
        value_fn=lambda data: data.get("name"),
    ),
    PsnSensorEntityDescription(
        key="platform",
        native_unit_of_measurement=None,
        name="Platform",
        icon="mdi:sony-playstation",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_platform_attr",
        value_fn=lambda data: data.get("platform"),
    ),
    PsnSensorEntityDescription(
        key="description",
        native_unit_of_measurement=None,
        name="Description",
        icon="mdi:card-text-outline",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_title_description_attr",
        value_fn=lambda data: data.get("description"),
    ),
    PsnSensorEntityDescription(
        key="content_rating",
        native_unit_of_measurement=None,
        name="Content Rating",
        icon="mdi:check-decagram",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_content_rating_attr",
        value_fn=lambda data: data.get("content_rating"),
    ),
    PsnSensorEntityDescription(
        key="star_rating",
        native_unit_of_measurement=None,
        name="Star Rating",
        icon="mdi:star",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_star_rating_attr",
        value_fn=lambda data: data.get("star_rating"),
    ),
    PsnSensorEntityDescription(
        key="play_count",
        native_unit_of_measurement=None,
        name="Play Count",
        icon="mdi:counter",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_play_count_attr",
        value_fn=lambda data: data.get("play_count"),
    ),
    PsnSensorEntityDescription(
        key="play_duration",
        native_unit_of_measurement=None,
        name="Play Duration",
        icon="mdi:clock-time-four-outline",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_play_duration_attr",
        value_fn=lambda data: data.get("play_duration"),
    ),
    PsnSensorEntityDescription(
        key="trophy_title_progress",
        native_unit_of_measurement="%",
        name="Trophy Title Progress",
        icon="mdi:trophy-outline",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_title_progress_attr",
        value_fn=lambda data: data.get("trophy_progress"),
    ),
    PsnSensorEntityDescription(
        key="trophy_next_level_progress",
        native_unit_of_measurement="%",
        name="Trophy Level Progress",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_next_level_progress_attr",
        value_fn=lambda data: data.get("next_level_progress"),
    ),
    PsnSensorEntityDescription(
        key="trophy_platinum_total",
        native_unit_of_measurement=None,
        name="Total Platinum Trophies",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_platinum_total_attr",
        value_fn=lambda data: data.get("trophies").get("platinum"),
    ),
    PsnSensorEntityDescription(
        key="trophy_gold_total",
        native_unit_of_measurement=None,
        name="Total Gold Trophies",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_gold_total_attr",
        value_fn=lambda data: data.get("trophies").get("gold"),
    ),
    PsnSensorEntityDescription(
        key="trophy_silver_total",
        native_unit_of_measurement=None,
        name="Total Silver Trophies",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_silver_total_attr",
        value_fn=lambda data: data.get("trophies").get("silver"),
    ),
    PsnSensorEntityDescription(
        key="trophy_bronze_total",
        native_unit_of_measurement=None,
        name="Total Bronze Trophies",
        icon="mdi:trophy",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_bronze_total_attr",
        value_fn=lambda data: data.get("trophies").get("bronze"),
    ),
    PsnSensorEntityDescription(
        key="trophy_platinum_earned",
        native_unit_of_measurement=None,
        name="Earned Platinum Trophies",
        icon="mdi:trophy-variant",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_platinum_earned_attr",
        value_fn=lambda data: data.get("earned_trophies").get("platinum"),
    ),
    PsnSensorEntityDescription(
        key="trophy_gold_earned",
        native_unit_of_measurement=None,
        name="Earned Gold Trophies",
        icon="mdi:trophy-variant",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_gold_earned_attr",
        value_fn=lambda data: data.get("earned_trophies").get("gold"),
    ),
    PsnSensorEntityDescription(
        key="trophy_silver_earned",
        native_unit_of_measurement=None,
        name="Earned Silver Trophies",
        icon="mdi:trophy-variant",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_silver_earned_attr",
        value_fn=lambda data: data.get("earned_trophies").get("silver"),
    ),
    PsnSensorEntityDescription(
        key="trophy_bronze_earned",
        native_unit_of_measurement=None,
        name="Earned Bronze Trophies",
        icon="mdi:trophy-variant",
        entity_registry_enabled_default=True,
        has_entity_name=True,
        unique_id="psn_trophy_bronze_earned_attr",
        value_fn=lambda data: data.get("earned_trophies").get("bronze"),
    ),
)


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Add sensors for passed config_entry in HA."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][PSN_COORDINATOR]

    async_add_entities(
        PsnSensor(coordinator, description) for description in PSN_SENSOR
    )

    if config_entry.options.get(CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES) is True:
        async_add_entities(
            PsnAttributeSensor(coordinator, description)
            for description in PSN_ADDITIONAL_SENSOR
        )


class PsnSensor(PSNEntity, SensorEntity):
    """PSN Sensor Class."""

    entity_description = PSN_SENSOR

    def __init__(self, coordinator, description: PsnSensorEntityDescription) -> None:
        """Initialize PSN Sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = (
            f"{coordinator.data.get("username").lower()}_{description.unique_id}"
        )
        self._attr_name = description.name
        self.entity_description = description

    @property
    def available(self) -> bool:
        """Return if available."""
        return True

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self) -> StateType:
        """Return native value for entity."""
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        """Return the state attributes of the entity."""
        if self.coordinator.data.get("title_metadata").get("npTitleId") is not None:
            return self.entity_description.attributes_fn(self.coordinator.data)
        if self.entity_description.key == "trophy_summary":
            return self.entity_description.attributes_fn(self.coordinator.data)


class PsnAttributeSensor(PSNEntity, SensorEntity):
    """PSN Sensor Class."""

    entity_description = PSN_SENSOR

    def __init__(self, coordinator, description: PsnSensorEntityDescription) -> None:
        """Initialize PSN Sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = (
            f"{coordinator.data.get("username").lower()}_{description.unique_id}"
        )
        self._attr_name = description.name
        self.entity_description = description

    @property
    def available(self) -> bool:
        """Return if available."""
        return True

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self.async_write_ha_state()

    @property
    def native_value(self) -> StateType:
        """Return native value for entity."""
        attributes = get_status_attr(self.coordinator.data)
        return self.entity_description.value_fn(attributes)
