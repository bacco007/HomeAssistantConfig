""""""

# region #-- imports --#
from __future__ import annotations

import dataclasses
from abc import ABC
from typing import (
    List,
)

from homeassistant.components.update import (
    DOMAIN as ENTITY_DOMAIN,
    UpdateEntity,
    UpdateEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import slugify

from . import HDHomerunEntity
from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    DOMAIN,
    ENTITY_SLUG,
)


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
    RequiredHDHomerunUpdateDescription
):
    """Describes update entity."""
# endregion


# region #-- update classes --#
class HDHomerunUpdate(HDHomerunEntity, UpdateEntity, ABC):
    """Representation of an HDHomeRun update entity"""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: HDHomerunUpdateEntityDescription
    ) -> None:
        """Constructor"""

        super().__init__(coordinator=coordinator, config_entry=config_entry)

        self.entity_description: HDHomerunUpdateEntityDescription = description

        self._attr_name = f"{ENTITY_SLUG} {config_entry.title.replace(ENTITY_SLUG, '')}: {self.entity_description.name}"
        self._attr_unique_id = f"{config_entry.unique_id}::" \
                               f"{ENTITY_DOMAIN.lower()}::" \
                               f"{slugify(self.entity_description.name)}"

    @property
    def installed_version(self) -> str | None:
        """"""

        return self._data.current_firmware

    @property
    def latest_version(self) -> str | None:
        """"""

        return self._data.latest_firmware or self.installed_version


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the update entity"""

    cg: DataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL]

    # region #-- add default sensors --#
    update_entities: List[HDHomerunUpdate] = [
        HDHomerunUpdate(
            config_entry=config_entry,
            coordinator=cg,
            description=HDHomerunUpdateEntityDescription(
                key="",
                name="Update",
            ),
        )
    ]
    # endregion

    async_add_entities(update_entities)
