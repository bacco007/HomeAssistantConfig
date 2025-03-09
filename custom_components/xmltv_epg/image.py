"""Sensor platform for XMLTV."""

from __future__ import annotations

import uuid

from homeassistant.components.image import (
    ImageEntity,
    ImageEntityDescription,
)
from homeassistant.core import callback

from .const import DOMAIN, LOGGER
from .coordinator import XMLTVDataUpdateCoordinator
from .entity import XMLTVEntity
from .helper import program_get_normalized_identification
from .model import TVChannel, TVGuide, TVProgram


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the sensor platform."""
    coordinator: XMLTVDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    guide: TVGuide = coordinator.data

    LOGGER.debug(
        f"Setting up image entities for {len(guide.channels)} channels (enable_upcoming: {coordinator.enable_upcoming_sensor}, enable_channel_icon: {coordinator.enable_channel_icon}, enable_program_image: {coordinator.enable_program_image})."
    )

    # add current / upcoming program images for each channel
    images: list[ImageEntity] = []
    for channel in guide.channels:
        if coordinator.enable_channel_icon:
            images.append(XMLTVChannelIconImage(coordinator, channel))

        if coordinator.enable_program_image:
            images.append(XMLTVChannelProgramImage(coordinator, channel, False))
            if coordinator.enable_upcoming_sensor:
                images.append(XMLTVChannelProgramImage(coordinator, channel, True))

    async_add_devices(images)


class XMLTVChannelProgramImage(XMLTVEntity, ImageEntity):
    """XMLTV Channel Program Image class."""

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
        """Initialize the image class."""
        XMLTVEntity.__init__(self, coordinator, channel)
        ImageEntity.__init__(self, coordinator.hass)

        translation_key, entity_id = program_get_normalized_identification(
            channel, is_next, "program_image"
        )

        self.entity_id = entity_id
        self._attr_unique_id = str(uuid.uuid5(uuid.NAMESPACE_X500, self.entity_id))

        self._attr_has_entity_name = True
        self.entity_description = ImageEntityDescription(
            key=translation_key,
            translation_key=translation_key,
        )

        self.__channel = channel
        self.__program = None
        self.__is_next = is_next

        LOGGER.debug(f"Setup image '{self.entity_id}' for channel '{channel.id}'.")

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
            self.__program = None
            self._attr_state = None
            self._attr_image_url = None
            self._attr_image_last_updated = self.coordinator.current_time

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
            self._attr_state = None
            self._attr_image_url = None
            self._attr_image_last_updated = self.coordinator.current_time

            super()._handle_coordinator_update()
            return

        # update image
        image_url = self.__program.image_url
        if image_url is None:
            self._attr_image_url = None
            self._attr_image_last_updated = self.coordinator.current_time

            super()._handle_coordinator_update()
            return

        self._attr_image_url = image_url
        self._attr_image_last_updated = self.coordinator.current_time

        super()._handle_coordinator_update()


class XMLTVChannelIconImage(XMLTVEntity, ImageEntity):
    """XMLTV Channel Icon Image class."""

    coordinator: XMLTVDataUpdateCoordinator

    __channel: TVChannel

    def __init__(
        self, coordinator: XMLTVDataUpdateCoordinator, channel: TVChannel
    ) -> None:
        """Initialize the image class."""
        XMLTVEntity.__init__(self, coordinator, channel)
        ImageEntity.__init__(self, coordinator.hass)

        translation_key, entity_id = program_get_normalized_identification(
            channel, False, "channel_icon"
        )

        self.entity_id = entity_id
        self._attr_unique_id = str(uuid.uuid5(uuid.NAMESPACE_X500, self.entity_id))

        self._attr_has_entity_name = True
        self.entity_description = ImageEntityDescription(
            key=translation_key,
            translation_key=translation_key,
        )

        self.__channel = channel

        LOGGER.debug(f"Setup image '{self.entity_id}' for channel '{channel.id}'.")

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
            self._attr_state = None
            self._attr_image_url = None
            self._attr_image_last_updated = self.coordinator.current_time

            super()._handle_coordinator_update()
            return

        self.__channel = channel

        # update image
        icon_url = channel.icon_url
        if icon_url is None:
            self._attr_image_url = None
            self._attr_image_last_updated = self.coordinator.current_time

            super()._handle_coordinator_update()
            return

        self._attr_image_url = icon_url
        self._attr_image_last_updated = self.coordinator.current_time

        super()._handle_coordinator_update()
