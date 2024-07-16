"""Sensor platform for XMLTV."""

from __future__ import annotations

import uuid

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)

from .const import DOMAIN, LOGGER
from .coordinator import XMLTVDataUpdateCoordinator
from .entity import XMLTVEntity
from .helper import normalize_for_entity_id
from .model import TVChannel, TVGuide


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the sensor platform."""
    coordinator: XMLTVDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    guide: TVGuide = coordinator.data

    LOGGER.debug(
        f"Setting up Channel Sensors for {len(guide.channels)} channels (enable_upcoming: {coordinator.enable_upcoming_sensor})."
    )

    # setup sensor for coordinator status
    sensors = [XMLTVStatusSensor(coordinator, guide)]

    # add current / upcoming program sensors for each channel
    for channel in guide.channels:
        sensors.append(XMLTVChannelSensor(coordinator, channel, False))
        if coordinator.enable_upcoming_sensor:
            sensors.append(XMLTVChannelSensor(coordinator, channel, True))

    async_add_devices(sensors)


class XMLTVChannelSensor(XMLTVEntity, SensorEntity):
    """XMLTV Channel Program Sensor class."""

    @staticmethod
    def get_normalized_identification(
        channel: TVChannel, is_next: bool
    ) -> tuple[str, str]:
        """Return normalized identification information for a sensor for the given channel and upcoming status.

        The identification information consists of the sensor entity_id and the translation_key.
        For the entity_id, the channel id is normalized and cleaned up to form a valid entity_id.

        Example:
        - channel_id = 'DE: My Channel 1'
        - is_next = True
        => ('program_upcoming', 'sensor.de_my_channel_1_program_upcoming')

        :param channel: The TV channel.
        :param is_next: The upcoming status.
        :return: (translation_key, entity_id) tuple.

        """
        translation_key = f"program_{'upcoming' if is_next else 'current'}"
        entity_id = f"sensor.{normalize_for_entity_id(channel.id)}_{translation_key}"

        return translation_key, entity_id

    def __init__(
        self,
        coordinator: XMLTVDataUpdateCoordinator,
        channel: TVChannel,
        is_next: bool,
    ) -> None:
        """Initialize the sensor class."""
        super().__init__(coordinator)

        translation_key, entity_id = self.get_normalized_identification(
            channel, is_next
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
    def translation_placeholders(self):
        """Return the translation placeholders."""
        if self._channel is None:
            return None

        return {"channel_display_name": self._channel.name}

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

        return {
            "start": program.start,
            "end": program.end,
            "duration": f"{duration_hours:02d}:{duration_minutes:02d}",
            "title": program.title,
            "description": program.description,
            "episode": program.episode,
            "subtitle": program.subtitle,
        }

    @property
    def native_value(self) -> str:
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
        translation_key = "last_update"
        entity_id = (
            f"sensor.{normalize_for_entity_id(guide.generator_name)}_{translation_key}"
        )

        return translation_key, entity_id

    def __init__(self, coordinator: XMLTVDataUpdateCoordinator, guide: TVGuide) -> None:
        """Initialize the sensor class."""
        super().__init__(coordinator)

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
    def native_value(self) -> str:
        """Return the native value of the sensor."""
        coordinator: XMLTVDataUpdateCoordinator = self.coordinator

        # refresh guide from coordinator
        guide: TVGuide = coordinator.data
        if guide is None:
            return None

        self._guide = guide

        # native value is last update time
        return coordinator.last_update_time.astimezone()
