"""Binary sensors."""

# region #-- imports --#
from __future__ import annotations

import dataclasses
import logging
from datetime import datetime, timedelta
from typing import Any, Callable, List, Mapping

from homeassistant.components.binary_sensor import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity, entity_cleanup
from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    DOMAIN,
    SIGNAL_HDHOMERUN_CHANNEL_SCANNING_STARTED,
    UPDATE_DOMAIN,
)

# endregion


_LOGGER = logging.getLogger(__name__)


# region #-- binary sensor descriptions --#
@dataclasses.dataclass
class OptionalHDHomerunBinarySensorDescription:
    """Represent the required attributes of the binary_sensor description."""

    extra_attributes: Callable | None = None
    state_value: Callable[[Any], bool] | None = None


@dataclasses.dataclass
class RequiredHDHomerunBinarySensorDescription:
    """Represent the required attributes of the sensor description."""


@dataclasses.dataclass
class HDHomerunBinarySensorEntityDescription(
    OptionalHDHomerunBinarySensorDescription,
    BinarySensorEntityDescription,
    RequiredHDHomerunBinarySensorDescription,
):
    """Describes binary_sensor entity."""


# endregion

BINARY_SENSORS: tuple[HDHomerunBinarySensorEntityDescription, ...] = ()

BINARY_SENSORS_VERSIONS: tuple[HDHomerunBinarySensorEntityDescription, ...] = (
    HDHomerunBinarySensorEntityDescription(
        key="",
        name="Update available",
        device_class=BinarySensorDeviceClass.UPDATE,
        state_value=lambda d: bool(d.latest_firmware),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the sensor."""
    sensors = [
        HDHomerunBinarySensor(
            config_entry=config_entry,
            coordinator=hass.data[DOMAIN][config_entry.entry_id][
                CONF_DATA_COORDINATOR_GENERAL
            ],
            description=description,
        )
        for description in BINARY_SENSORS
    ]

    sensors.extend(
        [
            HDHomeRunRecurringBinarySensor(
                config_entry=config_entry,
                coordinator=hass.data[DOMAIN][config_entry.entry_id][
                    CONF_DATA_COORDINATOR_GENERAL
                ],
                description=HDHomerunBinarySensorEntityDescription(
                    extra_attributes=lambda r: {
                        "progress": r,
                    },
                    key="channel_scanning",
                    name="Channel Scanning",
                ),
                recurrence_interval=5,
                recurrence_trigger=SIGNAL_HDHOMERUN_CHANNEL_SCANNING_STARTED,
                state_method="async_get_channel_scan_progress",
                state_processor=lambda s: s is not None,
            ),
        ]
    )

    # region #-- add version sensors if need be --#
    if UPDATE_DOMAIN is None:
        for description in BINARY_SENSORS_VERSIONS:
            sensors.append(
                HDHomerunBinarySensor(
                    config_entry=config_entry,
                    coordinator=hass.data[DOMAIN][config_entry.entry_id][
                        CONF_DATA_COORDINATOR_GENERAL
                    ],
                    description=description,
                )
            )
    # endregion

    async_add_entities(sensors, update_before_add=True)

    sensors_to_remove: List[HDHomerunBinarySensor] = []
    if (
        UPDATE_DOMAIN is not None
    ):  # remove the existing version sensors if the update entity is available
        for description in BINARY_SENSORS_VERSIONS:
            sensors_to_remove.append(
                HDHomerunBinarySensor(
                    config_entry=config_entry,
                    coordinator=hass.data[DOMAIN][config_entry.entry_id][
                        CONF_DATA_COORDINATOR_GENERAL
                    ],
                    description=description,
                )
            )

    if sensors_to_remove:
        entity_cleanup(config_entry=config_entry, entities=sensors_to_remove, hass=hass)


# region #-- binary sensor classes --#
class HDHomerunBinarySensor(HDHomerunEntity, BinarySensorEntity):
    """Representation of a binary sensor."""

    entity_description: HDHomerunBinarySensorEntityDescription

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: HDHomerunBinarySensorEntityDescription,
    ) -> None:
        """Initialise."""
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )

    @property
    def is_on(self) -> bool:
        """Return if the service is on."""
        if self.coordinator.data:
            if self.entity_description.state_value:
                return self.entity_description.state_value(self.coordinator.data)

            return getattr(self.coordinator.data, self.entity_description.key, None)

        return False


class HDHomeRunRecurringBinarySensor(HDHomerunEntity, BinarySensorEntity):
    """Representation of a binary sensor that may need out of band updates."""

    entity_description: HDHomerunBinarySensorEntityDescription

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        config_entry: ConfigEntry,
        description: HDHomerunBinarySensorEntityDescription,
        recurrence_interval: int,
        recurrence_trigger: str,
        state_method: str,
        state_processor: Callable[..., bool],
        recurrence_post_signal: str | None = None,
    ) -> None:
        """Initialise."""
        self.entity_domain = ENTITY_DOMAIN
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

        self._state: bool | None = None

        self._esa: Mapping[str, Any] | None = None
        self._remove_action_interval: Callable | None = None
        self._recurrence_interval: int = recurrence_interval
        self._recurrence_trigger: str = recurrence_trigger
        self._recurrence_post_signal: str | None = recurrence_post_signal
        self._state_method: str = state_method
        self._state_processor: Callable[..., bool] = state_processor

        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )

    def _handle_coordinator_update(self) -> None:
        """React to updates from the coordinator."""
        super()._handle_coordinator_update()
        if self.is_on:
            if self._remove_action_interval is None:
                async_dispatcher_send(hass=self.hass, signal=self._recurrence_trigger)
        else:
            self._stop_interval()

        self.async_write_ha_state()

    def _stop_interval(self) -> None:
        """Stop the interval from running."""
        if isinstance(self._remove_action_interval, Callable):
            self._remove_action_interval()
            self._remove_action_interval = None
            self._state = None
            if self._recurrence_post_signal is not None:
                async_dispatcher_send(self.hass, self._recurrence_post_signal)

    async def _async_action(self, _: datetime | None = None) -> None:
        """Calculate the actual state based on the current state in the Mesh.

        This is required because we don't want to query a full update of all
        entities from the Mesh.
        """
        state_method: Callable | None = getattr(
            self.coordinator.data, self._state_method, None
        )
        if not isinstance(state_method, Callable):
            raise RuntimeError("State method is not callable") from None

        if not isinstance(self._state_processor, Callable):
            raise RuntimeError("State processor is not callable") from None

        state_method_results: Any = await state_method()
        if isinstance(self.entity_description.extra_attributes, Callable):
            self._esa = self.entity_description.extra_attributes(state_method_results)
        temp_state: bool = self._state_processor(state_method_results)
        if temp_state:
            if self._remove_action_interval is None:
                self._remove_action_interval = async_track_time_interval(
                    hass=self.hass,
                    action=self._async_action,
                    interval=timedelta(seconds=self._recurrence_interval),
                )
        self._state = temp_state

        self.async_schedule_update_ha_state()

        if not temp_state:
            self._stop_interval()

    async def async_added_to_hass(self) -> None:
        """Do stuff when entity is added to registry."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                hass=self.hass,
                signal=self._recurrence_trigger,
                target=self._async_action,
            )
        )
        self._handle_coordinator_update()

    async def async_will_remove_from_hass(self) -> None:
        """Tidy up when removed."""
        self._stop_interval()

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Return extra state attributes."""
        return self._esa

    @property
    def is_on(self) -> bool | None:
        """Get the state of the binary sensor."""
        queried_state: bool
        ret: bool
        if self.entity_description.state_value:
            queried_state = self.entity_description.state_value(self.coordinator.data)
        else:
            queried_state = getattr(
                self.coordinator.data, self.entity_description.key, None
            )

        if self._state is not None:
            ret = self._state
        else:
            ret = queried_state

        return ret


# endregion
