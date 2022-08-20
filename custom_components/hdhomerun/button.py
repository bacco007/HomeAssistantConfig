"""Button entities."""

# region #-- imports --#
from __future__ import annotations

import dataclasses
import logging
from abc import ABC
from typing import Callable, List, Optional

from homeassistant.components.button import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.button import (ButtonDeviceClass, ButtonEntity,
                                             ButtonEntityDescription)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity, entity_cleanup
from .const import CONF_DATA_COORDINATOR_GENERAL, DOMAIN
from .pyhdhr import HDHomeRunDevice

# endregion

_LOGGER = logging.getLogger(__name__)


# region #-- button entity descriptions --#
@dataclasses.dataclass
class OptionalButtonDescription:
    """Represent the optional attributes of the button description."""

    press_action_arguments: Optional[dict] = dataclasses.field(default_factory=dict)


@dataclasses.dataclass
class RequiredButtonDescription:
    """Represent the required attributes of the button description."""

    press_action: str


@dataclasses.dataclass
class HDHomeRunButtonDescription(
    OptionalButtonDescription,
    ButtonEntityDescription,
    RequiredButtonDescription
):
    """Describes button entity."""
# endregion


BUTTON_DESCRIPTIONS: tuple[HDHomeRunButtonDescription, ...] = (
    HDHomeRunButtonDescription(
        device_class=ButtonDeviceClass.RESTART,
        key="",
        name="Restart",
        press_action="async_restart",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback
) -> None:
    """Create the button."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL]

    buttons: List[HDHomeRunButton] = [
        HDHomeRunButton(
            config_entry=config_entry,
            coordinator=coordinator,
            description=button_description,
            hass=hass,
        )
        for button_description in BUTTON_DESCRIPTIONS
    ]

    async_add_entities(buttons)

    buttons_to_remove: List = []
    if buttons_to_remove:
        entity_cleanup(config_entry=config_entry, entities=buttons_to_remove, hass=hass)


async def _async_button_pressed(
    action: str,
    device: HDHomeRunDevice,
    hass: HomeAssistant,
    action_arguments: Optional[dict] = None
) -> None:
    """Carry out the action for the button being pressed."""
    action: Optional[Callable] = getattr(device, action, None)
    signal: str = action_arguments.pop("signal", None)
    if action and isinstance(action, Callable):
        if action_arguments is None:
            action_arguments = {}
        await action(**action_arguments)
        if signal:
            async_dispatcher_send(hass, signal)


class HDHomeRunButton(HDHomerunEntity, ButtonEntity, ABC):
    """Representation for a button in the Mesh."""

    entity_description: HDHomeRunButtonDescription

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        config_entry: ConfigEntry,
        description: HDHomeRunButtonDescription,
        hass: HomeAssistant,
    ) -> None:
        """Initialise."""
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(config_entry=config_entry, coordinator=coordinator, description=description, hass=hass)

    async def async_press(self) -> None:
        """Handle the button being pressed."""
        await _async_button_pressed(
            action=self.entity_description.press_action,
            action_arguments=self.entity_description.press_action_arguments.copy(),
            device=self._device,
            hass=self.hass,
        )
