"""Binary sensors"""

# region #-- imports --#
import dataclasses
from typing import (
    Any,
    Callable,
    List,
    Optional,
)

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
    DOMAIN as ENTITY_DOMAIN,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import (
    entity_cleanup,
    HDHomerunEntity,
)
from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    DOMAIN,
    UPDATE_DOMAIN,
)


# endregion


# region #-- binary sensor descriptions --#
@dataclasses.dataclass
class OptionalHDHomerunBinarySensorDescription:
    """Represent the required attributes of the binary_sensor description."""

    state_value: Optional[Callable[[Any], bool]] = None


@dataclasses.dataclass
class RequiredHDHomerunBinarySensorDescription:
    """Represent the required attributes of the sensor description."""


@dataclasses.dataclass
class HDHomerunBinarySensorEntityDescription(
    OptionalHDHomerunBinarySensorDescription,
    BinarySensorEntityDescription,
    RequiredHDHomerunBinarySensorDescription,
):
    """Describes binary_sensor entity."""
# endregion


# region #-- binary sensor classes --#
class HDHomerunBinarySensor(HDHomerunEntity, BinarySensorEntity):
    """"""

    entity_description: HDHomerunBinarySensorEntityDescription

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description: HDHomerunBinarySensorEntityDescription,
        hass: HomeAssistant,
    ) -> None:
        """Constructor"""

        self.ENTITY_DOMAIN = ENTITY_DOMAIN
        super().__init__(config_entry=config_entry, coordinator=coordinator, description=description, hass=hass)
        self._attr_entity_category = EntityCategory.DIAGNOSTIC

    # region #-- properties --#
    @property
    def is_on(self) -> bool:
        """Return if the service is on."""

        if self._device:
            if self.entity_description.key:
                return self.entity_description.state_value(getattr(self._device, self.entity_description.key, None))
            else:
                return self.entity_description.state_value(self._device)
        else:
            return False
    # endregion
# endregion


BINARY_SENSORS: tuple[HDHomerunBinarySensorEntityDescription, ...] = ()

BINARY_SENSORS_VERSIONS: tuple[HDHomerunBinarySensorEntityDescription, ...] = (
    HDHomerunBinarySensorEntityDescription(
        key="",
        name="Update available",
        device_class=BinarySensorDeviceClass.UPDATE,
        state_value=lambda d: bool(d.latest_firmware),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the sensor"""

    sensors = [
        HDHomerunBinarySensor(
            config_entry=config_entry,
            coordinator=hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL],
            description=description,
            hass=hass,
        )
        for description in BINARY_SENSORS
    ]

    # region #-- add version sensors if need be --#
    if UPDATE_DOMAIN is None:
        for description in BINARY_SENSORS_VERSIONS:
            sensors.append(
                HDHomerunBinarySensor(
                    config_entry=config_entry,
                    coordinator=hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL],
                    description=description,
                    hass=hass,
                )
            )
    # endregion

    async_add_entities(sensors, update_before_add=True)

    sensors_to_remove: List[HDHomerunBinarySensor] = []
    if UPDATE_DOMAIN is not None:  # remove the existing version sensors if the update entity is available
        for description in BINARY_SENSORS_VERSIONS:
            sensors_to_remove.append(
                HDHomerunBinarySensor(
                    config_entry=config_entry,
                    coordinator=hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL],
                    description=description,
                    hass=hass,
                )
            )

    if sensors_to_remove:
        entity_cleanup(config_entry=config_entry, entities=sensors_to_remove, hass=hass)
