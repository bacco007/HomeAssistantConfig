"""Button entities."""

# region #-- imports --#
from __future__ import annotations

import dataclasses
import logging
from abc import ABC
from typing import Callable, List, Optional

from homeassistant.components.button import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.button import (
    ButtonDeviceClass,
    ButtonEntity,
    ButtonEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity, entity_cleanup
from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    DOMAIN,
    SIGNAL_HDHOMERUN_CHANNEL_SCANNING_STARTED,
    SIGNAL_HDHOMERUN_CHANNEL_SOURCE_CHANGE,
)
from .pyhdhr.discover import HDHomeRunDevice

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
    OptionalButtonDescription, ButtonEntityDescription, RequiredButtonDescription
):
    """Describes button entity."""

    listen_for_signal: str | None = None
    listen_for_signal_action: str | None = None


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
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the button."""
    coordinator: DataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][
        CONF_DATA_COORDINATOR_GENERAL
    ]

    buttons: List[HDHomeRunButton] = [
        HDHomeRunButton(
            config_entry=config_entry,
            coordinator=coordinator,
            description=button_description,
        )
        for button_description in BUTTON_DESCRIPTIONS
    ]

    if coordinator.data.channel_sources:
        buttons.append(
            HDHomeRunButton(
                config_entry=config_entry,
                coordinator=coordinator,
                description=HDHomeRunButtonDescription(
                    icon="mdi:text-search",
                    key="",
                    listen_for_signal=SIGNAL_HDHOMERUN_CHANNEL_SOURCE_CHANGE,
                    listen_for_signal_action="_set_channel_source",
                    name="Channel Scan",
                    press_action="async_channel_scan_start",
                    press_action_arguments={
                        "signal": SIGNAL_HDHOMERUN_CHANNEL_SCANNING_STARTED,
                        "channel_source": lambda s: getattr(s, "_channel_source", None),
                    },
                ),
            )
        )

    async_add_entities(buttons)

    buttons_to_remove: List = []
    if buttons_to_remove:
        entity_cleanup(config_entry=config_entry, entities=buttons_to_remove, hass=hass)


async def _async_button_pressed(
    action: str,
    device: HDHomeRunDevice,
    hass: HomeAssistant,
    self: HDHomeRunButton,
    action_arguments: dict | None = None,
) -> None:
    """Carry out the action for the button being pressed."""
    action: Callable | None = getattr(device, action, None)
    signal: str | None = action_arguments.pop("signal", None)
    if isinstance(action, Callable):
        if action_arguments is None:
            action_arguments = {}
        for arg, value in action_arguments.items():
            if isinstance(value, Callable):
                action_arguments[arg] = value(self)
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
    ) -> None:
        """Initialise."""
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )

    def _set_channel_source(self, channel_source) -> None:
        """Set the channel source."""
        setattr(self, "_channel_source", channel_source)

    async def async_added_to_hass(self) -> None:
        """Carry out tasks when added to the regstry."""
        if self.entity_description.listen_for_signal:
            self.async_on_remove(
                async_dispatcher_connect(
                    hass=self.hass,
                    signal=self.entity_description.listen_for_signal,
                    target=getattr(
                        self, self.entity_description.listen_for_signal_action, None
                    ),
                )
            )

        return await super().async_added_to_hass()

    async def async_press(self) -> None:
        """Handle the button being pressed."""
        await _async_button_pressed(
            action=self.entity_description.press_action,
            action_arguments=self.entity_description.press_action_arguments.copy(),
            device=self.coordinator.data,
            hass=self.hass,
            self=self,
        )
