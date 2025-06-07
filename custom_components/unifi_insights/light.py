"""Support for UniFi Protect lights."""
from __future__ import annotations

import logging
from typing import Any, Final

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ColorMode,
    LightEntity,
    LightEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_LIGHT_ID,
    ATTR_LIGHT_NAME,
    ATTR_LIGHT_STATE,
    ATTR_LIGHT_MODE,
    ATTR_LIGHT_LEVEL,
    ATTR_LIGHT_MOTION,
    ATTR_LIGHT_DARK,
    DEVICE_TYPE_LIGHT,
    DOMAIN,
    LIGHT_MODE_ALWAYS,
    LIGHT_MODE_MOTION,
    LIGHT_MODE_OFF,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiProtectEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up lights for UniFi Protect integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    # Skip if Protect API is not available
    if not coordinator.protect_api:
        _LOGGER.debug("Skipping light setup - Protect API not available")
        return

    entities = []

    # Add lights
    for light_id, light_data in coordinator.data["protect"]["lights"].items():
        _LOGGER.debug("Adding light entity for %s", light_data.get("name", light_id))
        entities.append(
            UnifiProtectLight(
                coordinator=coordinator,
                light_id=light_id,
            )
        )

    _LOGGER.info("Adding %d UniFi Protect lights", len(entities))
    async_add_entities(entities)


class UnifiProtectLight(UnifiProtectEntity, LightEntity):
    """Representation of a UniFi Protect Light."""

    _attr_has_entity_name = True
    _attr_name = None

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        light_id: str,
    ) -> None:
        """Initialize the light."""
        super().__init__(coordinator, DEVICE_TYPE_LIGHT, light_id)

        # Set up light features
        self._attr_supported_features = LightEntityFeature.BRIGHTNESS
        self._attr_color_mode = ColorMode.BRIGHTNESS
        self._attr_supported_color_modes = {ColorMode.BRIGHTNESS}

        # Set entity category
        self._attr_entity_category = None

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        light_data = self.coordinator.data["protect"]["lights"].get(self._device_id, {})

        # Set availability
        self._attr_available = light_data.get("state") == "CONNECTED"

        # Set state
        light_mode = light_data.get("lightModeSettings", {}).get("mode", LIGHT_MODE_OFF)
        self._attr_is_on = light_mode != LIGHT_MODE_OFF

        # Set brightness
        led_level = light_data.get("lightDeviceSettings", {}).get("ledLevel", 100)
        self._attr_brightness = int(led_level * 255 / 100)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_LIGHT_ID: self._device_id,
            ATTR_LIGHT_NAME: light_data.get("name"),
            ATTR_LIGHT_STATE: light_data.get("state"),
            ATTR_LIGHT_MODE: light_mode,
            ATTR_LIGHT_LEVEL: led_level,
            ATTR_LIGHT_MOTION: light_data.get("lastMotion"),
            ATTR_LIGHT_DARK: light_data.get("isDark"),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the light on."""
        _LOGGER.debug("Turning on light %s", self._device_id)

        # Set brightness if provided
        if ATTR_BRIGHTNESS in kwargs:
            brightness = kwargs[ATTR_BRIGHTNESS]
            level = int(brightness * 100 / 255)
            _LOGGER.debug("Setting light %s brightness to %s", self._device_id, level)
            await self.coordinator.protect_api.async_set_light_level(
                light_id=self._device_id,
                level=level,
            )

        # Set light mode to always on
        await self.coordinator.protect_api.async_set_light_mode(
            light_id=self._device_id,
            mode=LIGHT_MODE_ALWAYS,
        )

        # Update state
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the light off."""
        _LOGGER.debug("Turning off light %s", self._device_id)

        # Set light mode to off
        await self.coordinator.protect_api.async_set_light_mode(
            light_id=self._device_id,
            mode=LIGHT_MODE_OFF,
        )

        # Update state
        self._attr_is_on = False
        self.async_write_ha_state()
