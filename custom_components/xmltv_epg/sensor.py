"""Sensor platform for XMLTV."""

from __future__ import annotations

import uuid

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.const import EntityCategory
from homeassistant.core import callback

from custom_components.xmltv_epg.model.program import TVProgram

from .const import DOMAIN, LOGGER
from .coordinator import XMLTVDataUpdateCoordinator
from .entity import XMLTVEntity
from .helper import normalize_for_entity_id, program_get_normalized_identification
from .model import TVChannel, TVGuide


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the sensor platform."""
    coordinator: XMLTVDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    guide: TVGuide = coordinator.data

    LOGGER.debug(
        f"Setting up Channel Sensors for {len(guide.channels)} channels (enable_upcoming: {coordinator.enable_upcoming_sensor})."
    )

    # setup sensor for coordinator status
    sensors: list[SensorEntity] = [XMLTVStatusSensor(coordinator, guide)]

    # add current / upcoming program sensors for each channel
    for channel in guide.channels:
        sensors.append(XMLTVChannelSensor(coordinator, channel, False))
        if coordinator.enable_upcoming_sensor:
            sensors.append(XMLTVChannelSensor(coordinator, channel, True))

    async_add_devices(sensors)


class XMLTVChannelSensor(XMLTVEntity, SensorEntity):
    """XMLTV Channel Program Sensor class."""

    coordinator: XMLTVDataUpdateCoordinator

    __channel: TVChannel
    __program: TVProgram | None
    __is_next: bool

    def __init__(
        self,
        coordinator: XMLTVDataUpdateCoordinator,
        channel: TVChannel,
        is_next: bool,
    ) -> None:
        """Initialize the sensor class."""
        super().__init__(coordinator, channel)

        translation_key, entity_id = program_get_normalized_identification(
            channel, is_next, "program_sensor"
        )

        self.entity_id = entity_id
        self._attr_unique_id = str(uuid.uuid5(uuid.NAMESPACE_X500, self.entity_id))

        self._attr_has_entity_name = True
        self.entity_description = SensorEntityDescription(
            key=translation_key,
            translation_key=translation_key,
            icon="mdi:format-quote-close",
        )

        self.__channel = channel
        self.__program = None
        self.__is_next = is_next

        LOGGER.debug(f"Setup sensor '{self.entity_id}' for channel '{channel.id}'.")

    @property
    def available(self) -> bool:  # pyright: ignore[reportIncompatibleVariableOverride] -- Entity.available and CoordinatorEntity.available are defined incompatible
        """Return if entity is available."""
        return XMLTVEntity.available.__get__(self)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        guide: TVGuide = self.coordinator.data

        # refresh channel from guide
        channel = guide.get_channel(self.__channel.id)
        if channel is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}

            super()._handle_coordinator_update()
            return

        self.__channel = channel

        now = self.coordinator.current_time

        # get current or next program
        self.__program = (
            self.__channel.get_next_program(now)
            if self.__is_next
            else channel.get_current_program(now)
        )
        if self.__program is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}

            super()._handle_coordinator_update()
            return

        # native value is full program title
        self._attr_native_value = self.__program.full_title

        # update state attributes
        # format duration to HH:MM
        duration_seconds = self.__program.duration.total_seconds()
        duration_hours = int(duration_seconds // 3600)
        duration_minutes = int((duration_seconds % 3600) // 60)

        # get last program end time
        last_program = self.__channel.get_last_program()
        if last_program is not None:
            channel_program_known_until = last_program.end
        else:
            channel_program_known_until = None

        self._attr_extra_state_attributes = {
            "start": self.__program.start,
            "end": self.__program.end,
            "duration": f"{duration_hours:02d}:{duration_minutes:02d}",
            "title": self.__program.title,
            "description": self.__program.description,
            "episode": self.__program.episode,
            "subtitle": self.__program.subtitle,
            "channel_program_known_until": channel_program_known_until,
        }

        super()._handle_coordinator_update()


class XMLTVStatusSensor(XMLTVEntity, SensorEntity):
    """XMLTV Coordinator Status Sensor class."""

    @staticmethod
    def get_normalized_identification(guide: TVGuide) -> tuple[str, str]:
        """Return normalized identification information for a sensor for the given guide.

        The identification information consists of the sensor entity_id and the translation_key.
        For the entity_id, the guide's generator_name is normalized and cleaned up to form a valid entity_id.

        Example:
        - generator_name = 'TVXML.ORG'
        => ('last_update', 'sensor.tvxml_org_last_update')

        :param guide: The TV guide.
        :return: (translation_key, entity_id) tuple.

        """
        assert guide.generator_name is not None, (
            "XMLTVStatusSensor failed to create id, generator_name was None!"
        )

        translation_key = "last_update"
        entity_id = (
            f"sensor.{normalize_for_entity_id(guide.generator_name)}_{translation_key}"
        )

        return translation_key, entity_id

    coordinator: XMLTVDataUpdateCoordinator

    __guide: TVGuide

    def __init__(self, coordinator: XMLTVDataUpdateCoordinator, guide: TVGuide) -> None:
        """Initialize the sensor class."""
        super().__init__(coordinator, None)

        translation_key, entity_id = self.get_normalized_identification(guide)
        self.entity_id = entity_id
        self._attr_unique_id = str(uuid.uuid5(uuid.NAMESPACE_X500, self.entity_id))

        self._attr_has_entity_name = True
        self.entity_description = SensorEntityDescription(
            key=translation_key,
            translation_key=translation_key,
            device_class=SensorDeviceClass.TIMESTAMP,
            entity_category=EntityCategory.DIAGNOSTIC,
        )

        self.__guide = guide

        LOGGER.debug(
            f"Setup sensor '{self.entity_id}' for coordinator '{guide.generator_name}' status."
        )

    @property
    def available(self) -> bool:  # pyright: ignore[reportIncompatibleVariableOverride] -- Entity.available and CoordinatorEntity.available are defined incompatible
        """Return if entity is available."""
        return XMLTVEntity.available.__get__(self)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        coordinator: XMLTVDataUpdateCoordinator = self.coordinator

        # refresh guide from coordinator
        guide: TVGuide = coordinator.data
        if guide is None:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}
            self._attr_translation_placeholders = {}
            super()._handle_coordinator_update()
            return

        self.__guide = guide

        # native value is last update time
        value = coordinator.last_update_time
        self._attr_native_value = value.astimezone() if value is not None else None

        # set extra state attributes
        self._attr_extra_state_attributes = {
            "last_update": value,
            "generator_name": self.__guide.generator_name,
            "generator_url": self.__guide.generator_url,
        }

        # set translation placeholders
        self._attr_translation_placeholders = (
            {"generator_name": self.__guide.generator_name}
            if self.__guide.generator_name is not None
            else {}
        )

        super()._handle_coordinator_update()
