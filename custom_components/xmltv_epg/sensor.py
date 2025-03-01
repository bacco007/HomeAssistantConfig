"""Sensor platform for XMLTV."""

from __future__ import annotations

import uuid
from datetime import datetime

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)

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

        self._channel = channel
        self._program = None
        self._is_next = is_next

        LOGGER.debug(f"Setup sensor '{self.entity_id}' for channel '{channel.id}'.")

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        program = self._program
        if program is None:
            return None

        # format duration to HH:MM
        duration_seconds = program.duration.total_seconds()
        duration_hours = int(duration_seconds // 3600)
        duration_minutes = int((duration_seconds % 3600) // 60)

        # get last program end time
        last_program = self._channel.get_last_program()
        if last_program is not None:
            channel_program_known_until = last_program.end
        else:
            channel_program_known_until = None

        return {
            "start": program.start,
            "end": program.end,
            "duration": f"{duration_hours:02d}:{duration_minutes:02d}",
            "title": program.title,
            "description": program.description,
            "episode": program.episode,
            "subtitle": program.subtitle,
            "channel_program_known_until": channel_program_known_until,
        }

    @property
    def native_value(self) -> str | None:
        """Return the native value of the sensor."""
        guide: TVGuide = self.coordinator.data

        # refresh channel from guide
        channel = guide.get_channel(self._channel.id)
        if channel is None:
            return None

        self._channel = channel

        now = self.coordinator.current_time

        # get current or next program
        self._program = (
            self._channel.get_next_program(now)
            if self._is_next
            else channel.get_current_program(now)
        )
        if self._program is None:
            return None

        # native value is full program title
        return self._program.full_title


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
        )

        self._guide = guide

        LOGGER.debug(
            f"Setup sensor '{self.entity_id}' for coordinator '{guide.generator_name}' status."
        )

    @property
    def translation_placeholders(self):
        """Return the translation placeholders."""
        if self._guide is None:
            return None

        return {"generator_name": self._guide.generator_name}

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        if self._guide is None:
            return None

        return {
            "generator_name": self._guide.generator_name,
            "generator_url": self._guide.generator_url,
        }

    @property
    def native_value(self) -> datetime | None:
        """Return the native value of the sensor."""
        coordinator: XMLTVDataUpdateCoordinator = self.coordinator

        # refresh guide from coordinator
        guide: TVGuide = coordinator.data
        if guide is None:
            return None

        self._guide = guide

        # native value is last update time
        value = coordinator.last_update_time
        if value is not None:
            return value.astimezone()
        return None
