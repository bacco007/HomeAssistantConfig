"""Sensors."""

# region #-- imports --#
from __future__ import annotations

import dataclasses
import logging
import os.path
import re
from collections.abc import Mapping
from datetime import date, datetime
from enum import StrEnum
from typing import Any, Callable

from homeassistant.components.sensor import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
    StateType,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfDataRate, UnitOfFrequency
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity, HDHomerunTunerEntity, entity_cleanup
from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    CONF_DATA_COORDINATOR_TUNER_STATUS,
    CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    CONF_TUNER_CHANNEL_FORMAT,
    CONF_TUNER_CHANNEL_NAME,
    CONF_TUNER_CHANNEL_NUMBER,
    CONF_TUNER_CHANNEL_NUMBER_NAME,
    DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    DEF_TUNER_CHANNEL_FORMAT,
    DOMAIN,
    UPDATE_DOMAIN,
)
from .pyhdhr.const import DiscoverMode
from .pyhdhr.discover import HDHomeRunDevice

# endregion

_LOGGER = logging.getLogger(__name__)


# region #-- sensor descriptions --#
@dataclasses.dataclass(frozen=True)
class AdditionalSensorDescription:
    """Represent additional options for the button entity."""

    entity_picture: Callable | None = None
    extra_attributes: Callable | None = None
    state_value: Callable[[Any], Any] | None = None


# endregion


class TunerStates(StrEnum):
    """Possible states for the tuner."""

    IDLE = "idle"
    IN_USE = "in_use"
    SCANNING = "scanning"


def _get_status_entity_esa(tuner: dict[str, Any]) -> dict[str, Any]:
    """Generate the extra attributes for the status sensor."""
    regex = re.compile(r"(?<!^)(?=[A-Z])")
    ret = {
        regex.sub("_", k).lower().replace("_i_p", "_ip"): v
        for k, v in tuner.items()
        if k.lower() != "resource"
    }

    return ret


def _get_status_entity_picture(tuner: dict[str, Any], config: dict[str, Any]) -> str:
    """Get the entity picture based on configured paths."""
    ret = None
    picture_path: str = config.options.get(
        CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
        DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    )
    if picture_path and _get_tuner_state(tuner, config) not in (
        TunerStates.IDLE,
        TunerStates.IN_USE,
        TunerStates.SCANNING,
    ):
        ret = os.path.join(picture_path, f"{tuner.get('VctName', '').lower()}.png")

    return ret


def _get_tuner_state(tuner: dict[str, Any], config: dict[str, Any]) -> str:
    """Calculate the status for the tuner."""
    ret = TunerStates.IDLE
    channel_format: str = config.options.get(
        CONF_TUNER_CHANNEL_FORMAT, DEF_TUNER_CHANNEL_FORMAT
    )
    if tuner.get("VctNumber") and tuner.get("VctName"):
        if channel_format == CONF_TUNER_CHANNEL_NAME:
            ret = tuner.get("VctName")
        elif channel_format == CONF_TUNER_CHANNEL_NUMBER:
            ret = tuner.get("VctNumber")
        elif channel_format == CONF_TUNER_CHANNEL_NUMBER_NAME:
            ret = f"{tuner.get('VctNumber')}: {tuner.get('VctName')}"
        else:
            ret = None
    elif tuner.get("TargetIP"):
        ret = TunerStates.IN_USE

    return ret


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the sensor."""
    coordinator_general: DataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ][CONF_DATA_COORDINATOR_GENERAL]
    coordinator_tuner: DataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        CONF_DATA_COORDINATOR_TUNER_STATUS
    ]

    sensors: list[HDHomerunSensor] = []
    sensors_to_remove: list[HDHomerunSensor] = []

    # region #-- add version sensors if need be --#
    if UPDATE_DOMAIN is None:
        sensors.extend(
            [
                HDHomerunSensor(
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="current_firmware",
                        name="Version",
                    ),
                ),
                HDHomerunSensor(
                    additional_description=AdditionalSensorDescription(
                        state_value=lambda d: d.latest_firmware or d.current_firmware,
                    ),
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="",
                        name="Newest Version",
                    ),
                ),
            ]
        )
    else:  # remove the existing version sensors if the update entity is available
        sensors_to_remove.extend(
            [
                HDHomerunSensor(
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="current_firmware",
                        name="Version",
                    ),
                ),
                HDHomerunSensor(
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="",
                        name="Newest Version",
                    ),
                ),
            ]
        )
    # endregion

    # region #-- add tuner sensors --#
    hdhomerun_device: HDHomeRunDevice | None = coordinator_tuner.data
    if hdhomerun_device is not None:
        for tuner in hdhomerun_device.tuner_status:
            device_name: str = tuner.get("Resource").title()
            sensors.extend(
                [
                    HDHomerunTunerSensor(
                        additional_description=AdditionalSensorDescription(
                            entity_picture=_get_status_entity_picture,
                            extra_attributes=_get_status_entity_esa,
                            state_value=_get_tuner_state,
                        ),
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            key="",
                            name=device_name,
                            translation_key="tuner_status",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            device_class=SensorDeviceClass.FREQUENCY,
                            key="Frequency",
                            name=f"{device_name} Frequency",
                            native_unit_of_measurement=UnitOfFrequency.HERTZ,
                            translation_key="tuner_frequency",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            device_class=SensorDeviceClass.DATA_RATE,
                            key="NetworkRate",
                            name=f"{device_name} Network Rate",
                            native_unit_of_measurement=UnitOfDataRate.BITS_PER_SECOND,
                            translation_key="tuner_network_rate",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            key="SignalQualityPercent",
                            name=f"{device_name} Signal Quality",
                            native_unit_of_measurement=PERCENTAGE,
                            translation_key="tuner_signal_quality",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            key="SignalStrengthPercent",
                            name=f"{device_name} Signal Strength",
                            native_unit_of_measurement=PERCENTAGE,
                            translation_key="tuner_signal_strength",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            key="SymbolQualityPercent",
                            name=f"{device_name} Symbol Quality",
                            native_unit_of_measurement=PERCENTAGE,
                            translation_key="tuner_symbol_quality",
                        ),
                    ),
                    HDHomerunTunerSensor(
                        config_entry=config_entry,
                        coordinator=coordinator_tuner,
                        device_name=device_name,
                        description=SensorEntityDescription(
                            key="TargetIP",
                            name=f"{device_name} Target IP",
                            translation_key="tuner_target_ip",
                        ),
                    ),
                ]
            )
    # endregion

    # region #-- add conditional sensors --#
    if coordinator_general.data.discovery_method is DiscoverMode.HTTP:
        sensors.extend(
            [
                HDHomerunSensor(
                    additional_description=AdditionalSensorDescription(
                        extra_attributes=lambda d: (
                            {
                                "channels": [
                                    channel.get("GuideName", None)
                                    for channel in d.channels
                                    if channel.get("Enabled", None) == 0
                                ]
                            }
                        ),
                        state_value=lambda d: len(
                            [
                                channel
                                for channel in d
                                if channel.get("Enabled", None) == 0
                            ]
                        ),
                    ),
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="channels",
                        name="Disabled Channels",
                        state_class=SensorStateClass.MEASUREMENT,
                        translation_key="disabled_channels",
                    ),
                ),
                HDHomerunSensor(
                    additional_description=AdditionalSensorDescription(
                        extra_attributes=lambda d: (
                            {
                                "channels": [
                                    channel.get("GuideName", None)
                                    for channel in d.channels
                                    if channel.get("Favorite", None) == 1
                                ]
                            }
                        ),
                        state_value=lambda d: len(
                            [
                                channel
                                for channel in d
                                if channel.get("Favorite", None) == 1
                            ]
                        ),
                    ),
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="channels",
                        name="Favourite Channels",
                        state_class=SensorStateClass.MEASUREMENT,
                        translation_key="fav_channels",
                    ),
                ),
                HDHomerunSensor(
                    additional_description=AdditionalSensorDescription(
                        # pylint: disable=unnecessary-lambda
                        state_value=lambda d: len(d),
                    ),
                    config_entry=config_entry,
                    coordinator=coordinator_general,
                    description=SensorEntityDescription(
                        key="channels",
                        name="Channel Count",
                        state_class=SensorStateClass.MEASUREMENT,
                        translation_key="channel_count",
                    ),
                ),
            ]
        )
    # endregion

    # region #-- add default sensors --#
    sensors.extend(
        [
            HDHomerunSensor(
                config_entry=config_entry,
                coordinator=coordinator_general,
                description=SensorEntityDescription(
                    key="tuner_count",
                    name="Tuner Count",
                    state_class=SensorStateClass.MEASUREMENT,
                    translation_key="tuner_count",
                ),
            )
        ]
    )
    # endregion

    async_add_entities(sensors)

    if sensors_to_remove:
        entity_cleanup(config_entry=config_entry, entities=sensors_to_remove, hass=hass)


# region #-- sensor classes --#
class HDHomerunSensor(HDHomerunEntity, SensorEntity):
    """Representation of an HDHomeRun sensor."""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: SensorEntityDescription,
        additional_description: AdditionalSensorDescription | None = None,
    ) -> None:
        """Initialise."""
        self._additional_description: AdditionalSensorDescription | None = (
            additional_description
        )
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )

        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> StateType | date | datetime:
        """Get the value of the sensor."""
        if self.coordinator.data:
            if (
                self._additional_description is not None
                and self._additional_description.state_value
            ):
                if self.entity_description.key:
                    return self._additional_description.state_value(
                        getattr(
                            self.coordinator.data, self.entity_description.key, None
                        )
                    )
                return self._additional_description.state_value(self.coordinator.data)
            return getattr(self.coordinator.data, self.entity_description.key, None)

        return None


class HDHomerunTunerSensor(HDHomerunTunerEntity, SensorEntity):
    """Representation of an HDHomeRun tuner."""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: SensorEntityDescription,
        device_name: str,
        additional_description: AdditionalSensorDescription | None = None,
    ) -> None:
        """Initialise."""
        self._additional_description: AdditionalSensorDescription | None = (
            additional_description
        )
        self.entity_domain = ENTITY_DOMAIN
        self._device_name: str = device_name

        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )
        self._tuner: dict = self._get_tuner()
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    def _get_tuner(self) -> dict[str, int | str]:
        """Get the tuner information from the coordinator."""
        tuner: dict[str, int | str] = {}
        for _tuner in self.coordinator.data.tuner_status:
            if _tuner.get("Resource", "").lower() == self._device_name.lower():
                tuner = _tuner
                break

        return tuner

    def _handle_coordinator_update(self) -> None:
        """Update the device information when the coordinator updates."""
        super()._handle_coordinator_update()
        self._tuner = self._get_tuner()

    @property
    def entity_picture(self) -> str | None:
        """Define the entity picture for the sensor."""
        if (
            self._additional_description is not None
            and self._additional_description.entity_picture
        ):
            return self._additional_description.entity_picture(
                self._tuner, self._config
            )

        return None

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Define additional information for the sensor."""
        if (
            self._additional_description is not None
            and self._additional_description.extra_attributes
        ):
            return self._additional_description.extra_attributes(self._tuner)

        return None

    @property
    def native_value(self) -> StateType | date | datetime:
        """Get the value of the sensor."""
        if (
            self._additional_description is not None
            and self._additional_description.state_value
        ):
            return self._additional_description.state_value(self._tuner, self._config)

        if self.entity_description.key:
            return self._tuner.get(self.entity_description.key, None)

        return None


# endregion
