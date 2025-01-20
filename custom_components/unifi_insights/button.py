"""Support for UniFi Insights buttons."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.button import (
    ButtonEntity,
    ButtonEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import UnifiInsightsDataUpdateCoordinator
from .entity import UnifiInsightsEntity

_LOGGER = logging.getLogger(__name__)


@dataclass
class UnifiInsightsButtonEntityDescription(ButtonEntityDescription):
    """Class describing UniFi Insights button entities."""


BUTTON_TYPES: tuple[UnifiInsightsButtonEntityDescription, ...] = (
    UnifiInsightsButtonEntityDescription(
        key="device_restart",
        translation_key="device_restart",
        name="Device Restart",
        icon="mdi:restart",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up buttons for UniFi Insights integration."""
    coordinator: UnifiInsightsDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    entities = []

    _LOGGER.debug("Setting up buttons for UniFi Insights")

    # Add buttons for each device in each site
    for site_id, devices in coordinator.data["devices"].items():
        site_data = coordinator.get_site(site_id)
        site_name = site_data.get("meta", {}).get("name", site_id) if site_data else site_id
        
        _LOGGER.debug(
            "Processing site %s (%s) with %d devices",
            site_id,
            site_name,
            len(devices)
        )
        
        for device_id in devices:
            device_data = coordinator.data.get("devices", {}).get(site_id, {}).get(device_id, {})
            device_name = device_data.get("name", device_id)
            
            _LOGGER.debug(
                "Creating buttons for device %s (%s) in site %s (%s)",
                device_id,
                device_name,
                site_id,
                site_name
            )
            
            for description in BUTTON_TYPES:
                entities.append(
                    UnifiInsightsButton(
                        coordinator=coordinator,
                        description=description,
                        site_id=site_id,
                        device_id=device_id,
                    )
                )

    _LOGGER.info("Adding %d UniFi Insights buttons", len(entities))
    async_add_entities(entities)


class UnifiInsightsButton(UnifiInsightsEntity, ButtonEntity):
    """Representation of a UniFi Insights Button."""

    entity_description: UnifiInsightsButtonEntityDescription

    def __init__(
        self,
        coordinator: UnifiInsightsDataUpdateCoordinator,
        description: UnifiInsightsButtonEntityDescription,
        site_id: str,
        device_id: str,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator, description, site_id, device_id)
        
        _LOGGER.debug(
            "Initializing button %s for device %s in site %s",
            description.key,
            device_id,
            site_id
        )

    async def async_press(self) -> None:
        """Handle the button press."""
        _LOGGER.debug(
            "Restarting device %s (%s) in site %s",
            self._device_id,
            self.device_data.get("name", self._device_id) if self.device_data else self._device_id,
            self._site_id
        )
        
        try:
            success = await self.coordinator.api.async_restart_device(
                self._site_id, self._device_id
            )
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    self._device_id,
                    self._site_id
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s",
                    self._device_id,
                    self._site_id
                )
        except Exception as err:
            _LOGGER.error(
                "Error restarting device %s in site %s: %s",
                self._device_id,
                self._site_id,
                err
            )

    @property
    def available(self) -> bool:
        """Return if the device is available."""
        device_data = self.coordinator.data["devices"].get(self._site_id, {}).get(self._device_id)
        if not device_data:
            return False
        return device_data.get("state") == "ONLINE"