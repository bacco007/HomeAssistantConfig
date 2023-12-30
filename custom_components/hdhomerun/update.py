"""Update entities."""

# region #-- imports --#
from __future__ import annotations

from abc import ABC
from typing import List

from homeassistant.components.update import DOMAIN as ENTITY_DOMAIN
from homeassistant.components.update import (
    UpdateDeviceClass,
    UpdateEntity,
    UpdateEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import HDHomerunEntity
from .const import CONF_DATA_COORDINATOR_GENERAL, DOMAIN
from .pyhdhr.const import DiscoverMode

# endregion


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
    update_entities: List[HDHomerunUpdate] = []

    if coordinator_general.data.discovery_method is DiscoverMode.HTTP:
        update_entities.append(
            HDHomerunUpdate(
                config_entry=config_entry,
                coordinator=coordinator_general,
                description=UpdateEntityDescription(
                    device_class=UpdateDeviceClass.FIRMWARE,
                    key="",
                    name="Update",
                    translation_key="update",
                ),
            )
        )
    # endregion

    async_add_entities(update_entities)


# region #-- update classes --#
class HDHomerunUpdate(HDHomerunEntity, UpdateEntity, ABC):
    """Representation of an HDHomeRun update entity."""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: UpdateEntityDescription,
    ) -> None:
        """Initialise."""
        self.entity_domain = ENTITY_DOMAIN
        super().__init__(
            config_entry=config_entry,
            coordinator=coordinator,
            description=description,
        )

    @property
    def installed_version(self) -> str | None:
        """Get the currently installed firmware version."""
        return self.coordinator.data.installed_version

    @property
    def latest_version(self) -> str | None:
        """Get the latest available version of the firmware.

        N.B. this is set to the currently installed version if not found
        """
        return self.coordinator.data.latest_version or self.installed_version

    @property
    def release_url(self) -> str | None:
        """Get the URL to release notes."""
        return "https://www.silicondust.com/support/downloads/firmware-changelog/"


# endregion
