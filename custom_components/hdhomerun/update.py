"""Update entities."""

# region #-- imports --#
from __future__ import annotations

import dataclasses
from abc import ABC
from typing import List

from homeassistant.components.update import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.update import UpdateEntity, UpdateEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity
from .const import CONF_DATA_COORDINATOR_GENERAL, DOMAIN

# endregion


# region #-- update entity descriptions --#
@dataclasses.dataclass
class RequiredHDHomerunUpdateDescription:
    """Represent the required attributes of the update description."""


@dataclasses.dataclass
class OptionalHDHomerunUpdateDescription:
    """Represent the optional attributes of the Update description."""


@dataclasses.dataclass
class HDHomerunUpdateEntityDescription(
    OptionalHDHomerunUpdateDescription,
    UpdateEntityDescription,
    RequiredHDHomerunUpdateDescription,
):
    """Describes update entity."""


# endregion


# region #-- update classes --#
class HDHomerunUpdate(HDHomerunEntity, UpdateEntity, ABC):
    """Representation of an HDHomeRun update entity."""

    entity_description: HDHomerunUpdateEntityDescription

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: HDHomerunUpdateEntityDescription,
        hass: HomeAssistant,
    ) -> None:
        """Initialise."""
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
            hass=hass,
        )

    @property
    def installed_version(self) -> str | None:
        """Get the currently installed firmware version."""
        return self._device.installed_version

    @property
    def latest_version(self) -> str | None:
        """Get the latest available version of the firmware.

        N.B. this is set to the currently installed version if not found
        """
        return self._device.latest_version or self.installed_version


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the update entity."""
    coordinator_general: DataUpdateCoordinator = hass.data[DOMAIN][
        config_entry.entry_id
    ][CONF_DATA_COORDINATOR_GENERAL]

    # region #-- add default sensors --#
    update_entities: List[HDHomerunUpdate] = [
        HDHomerunUpdate(
            config_entry=config_entry,
            coordinator=coordinator_general,
            description=HDHomerunUpdateEntityDescription(
                key="",
                name="Update",
            ),
            hass=hass,
        )
    ]
    # endregion

    async_add_entities(update_entities)
