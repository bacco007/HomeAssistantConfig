from collections.abc import MutableMapping
import copy
import logging
from typing import final

from homeassistant.components.device_tracker import (
    ATTR_LOCATION_NAME,
    ATTR_SOURCE_TYPE,
    PLATFORM_SCHEMA,
    SourceType,
    TrackerEntity,
)
from homeassistant.components.recorder import DATA_INSTANCE as RECORDER_INSTANCE
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_BATTERY_LEVEL,
    ATTR_FRIENDLY_NAME,
    ATTR_GPS_ACCURACY,
    ATTR_ICON,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    CONF_ICON,
    CONF_NAME,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, entity_platform
from homeassistant.helpers.entity import generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
import homeassistant.helpers.entity_registry as er
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import StateType
from homeassistant.util import slugify
import voluptuous as vol

from .const import (
    ATTR_ATTRIBUTES,
    ATTR_DELETE_LOCATION_NAME,
    ATTR_REPLACE_ATTRIBUTES,
    CONF_ATTRIBUTES,
    CONF_EXCLUDE_FROM_RECORDER,
    CONF_FORCE_UPDATE,
    CONF_RESTORE,
    CONF_UPDATED,
    CONF_VARIABLE_ID,
    CONF_YAML_VARIABLE,
    DEFAULT_REPLACE_ATTRIBUTES,
    DOMAIN,
)
from .recorder_history_prefilter import recorder_prefilter

_LOGGER = logging.getLogger(__name__)

PLATFORM = Platform.DEVICE_TRACKER
ENTITY_ID_FORMAT = PLATFORM + ".{}"
SERVICE_UPDATE_VARIABLE = "update_" + PLATFORM

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({})

VARIABLE_ATTR_SETTINGS = {
    ATTR_FRIENDLY_NAME: "_attr_name",
    ATTR_ICON: "_attr_icon",
    ATTR_SOURCE_TYPE: "_attr_source_type",
    ATTR_LATITUDE: "_attr_latitude",
    ATTR_LONGITUDE: "_attr_longitude",
    ATTR_BATTERY_LEVEL: "_attr_battery_level",
    ATTR_LOCATION_NAME: "_attr_location_name",
    ATTR_GPS_ACCURACY: "_attr_gps_accuracy",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Setup the Device Tracker Variable entity with a config_entry (config_flow)."""

    config_entry.options = {}
    platform = entity_platform.async_get_current_platform()

    platform.async_register_entity_service(
        SERVICE_UPDATE_VARIABLE,
        {
            vol.Optional(ATTR_LATITUDE): cv.latitude,
            vol.Optional(ATTR_LONGITUDE): cv.longitude,
            vol.Optional(ATTR_LOCATION_NAME): cv.string,
            vol.Optional(ATTR_DELETE_LOCATION_NAME): cv.boolean,
            vol.Optional(ATTR_GPS_ACCURACY): cv.positive_int,
            vol.Optional(ATTR_BATTERY_LEVEL): vol.All(
                vol.Coerce(int), vol.Range(min=0, max=100)
            ),
            vol.Optional(ATTR_ATTRIBUTES): dict,
            vol.Optional(
                ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
            ): cv.boolean,
        },
        "async_update_variable",
    )

    config = hass.data.get(DOMAIN).get(config_entry.entry_id)
    unique_id = config_entry.entry_id
    # _LOGGER.debug(f"[async_setup_entry] config_entry: {config_entry.as_dict()}")
    # _LOGGER.debug(f"[async_setup_entry] config: {config}")
    # _LOGGER.debug(f"[async_setup_entry] unique_id: {unique_id}")

    async_add_entities([Variable(hass, config, config_entry, unique_id)])

    return True


class Variable(RestoreEntity, TrackerEntity):
    """Class for the device tracker."""

    def __init__(
        self,
        hass,
        config,
        config_entry,
        unique_id,
    ):
        """Initialize a Device Tracker Variable."""
        _LOGGER.debug(
            f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID))}) [init] config: {config}"
        )

        self._hass = hass
        self._config = config
        self._config_entry = config_entry
        self._attr_has_entity_name = True
        self._variable_id = slugify(config.get(CONF_VARIABLE_ID).lower())
        self._attr_unique_id = unique_id
        if config.get(CONF_NAME) is not None:
            self._attr_name = config.get(CONF_NAME)
        else:
            self._attr_name = config.get(CONF_VARIABLE_ID)
        self._attr_icon = config.get(CONF_ICON)
        self._restore = config.get(CONF_RESTORE)
        self._force_update = config.get(CONF_FORCE_UPDATE)
        self._yaml_variable = config.get(CONF_YAML_VARIABLE)
        self._exclude_from_recorder = config.get(CONF_EXCLUDE_FROM_RECORDER)
        if (
            config.get(CONF_ATTRIBUTES) is not None
            and config.get(CONF_ATTRIBUTES)
            and isinstance(config.get(CONF_ATTRIBUTES), MutableMapping)
        ):
            self._attr_extra_state_attributes = self._update_attr_settings(
                config.get(CONF_ATTRIBUTES)
            )
        else:
            self._attr_extra_state_attributes = None
        registry = er.async_get(self._hass)
        current_entity_id = registry.async_get_entity_id(
            PLATFORM, DOMAIN, self._attr_unique_id
        )
        if current_entity_id is not None:
            self.entity_id = current_entity_id
        else:
            self.entity_id = generate_entity_id(
                ENTITY_ID_FORMAT, self._variable_id, hass=self._hass
            )
        _LOGGER.debug(f"({self._attr_name}) [init] entity_id: {self.entity_id}")
        self._attr_source_type = config.get(ATTR_SOURCE_TYPE, SourceType.GPS)
        self._attr_latitude = config.get(ATTR_LATITUDE)
        self._attr_longitude = config.get(ATTR_LONGITUDE)
        self._attr_battery_level = config.get(ATTR_BATTERY_LEVEL)
        self._attr_location_name = config.get(ATTR_LOCATION_NAME)
        self._attr_gps_accuracy = config.get(ATTR_GPS_ACCURACY)
        if self._exclude_from_recorder:
            self.disable_recorder()

    def disable_recorder(self):
        if RECORDER_INSTANCE in self._hass.data:
            _LOGGER.info(f"({self._attr_name}) [disable_recorder] Disabling Recorder")
            recorder_prefilter.add_filter(self._hass, self.entity_id)

    async def async_added_to_hass(self):
        """Run when entity about to be added."""
        await super().async_added_to_hass()
        if self._restore is True:
            _LOGGER.info(f"({self._attr_name}) Restoring after Reboot")
            state = await self.async_get_last_state()
            if state:
                _LOGGER.debug(
                    f"({self._attr_name}) Restored last state: {state.as_dict()}"
                )
                if (
                    hasattr(state, "attributes")
                    and state.attributes
                    and isinstance(state.attributes, MutableMapping)
                ):
                    self._attr_extra_state_attributes = self._update_attr_settings(
                        state.attributes.copy(),
                        just_pop=self._config.get(CONF_UPDATED, False),
                    )
                _LOGGER.debug(
                    f"({self._attr_name}) [restored] attributes: {self._attr_extra_state_attributes}"
                )
        if self._config.get(CONF_UPDATED, True):
            self._config.update({CONF_UPDATED: False})
            self._hass.config_entries.async_update_entry(
                self._config_entry,
                data=self._config,
                options=self._config_entry.options,
            )
            _LOGGER.debug(
                f"({self._attr_name}) Updated config_updated: "
                + f"{self._config_entry.data.get(CONF_UPDATED)}"
            )

    async def async_will_remove_from_hass(self) -> None:
        """Run when entity will be removed from hass."""
        if RECORDER_INSTANCE in self._hass.data and self._exclude_from_recorder:
            _LOGGER.debug(
                f"({self._attr_name}) Removing entity exclusion from recorder: {self.entity_id}"
            )
            recorder_prefilter.remove_filter(self._hass, self.entity_id)

    def _update_attr_settings(self, new_attributes=None, just_pop=False):
        if new_attributes is not None:
            _LOGGER.debug(
                f"({self._attr_name}) [update_attr_settings] Updating Special Attributes"
            )
            if isinstance(new_attributes, MutableMapping):
                attributes = copy.deepcopy(new_attributes)
                for attrib, setting in VARIABLE_ATTR_SETTINGS.items():
                    if attrib in attributes.keys():
                        if just_pop:
                            # _LOGGER.debug(f"({self._attr_name}) [update_attr_settings] just_pop / attrib: {attrib} / value: {attributes.get(attrib)}")
                            attributes.pop(attrib, None)
                        else:
                            # _LOGGER.debug(f"({self._attr_name}) [update_attr_settings] attrib: {attrib} / setting: {setting} / value: {attributes.get(attrib)}")
                            setattr(self, setting, attributes.pop(attrib, None))
                return copy.deepcopy(attributes)
            else:
                _LOGGER.error(
                    f"({self._attr_name}) AttributeError: Attributes must be a dictionary: {new_attributes}"
                )
                return new_attributes
        else:
            return None

    async def async_update_variable(self, **kwargs) -> None:
        """Update Device Tracker Variable."""

        updated_attributes = None

        replace_attributes = kwargs.get(ATTR_REPLACE_ATTRIBUTES, False)
        _LOGGER.debug(
            f"({self._attr_name}) [async_update_variable] Replace Attributes: {replace_attributes}"
        )

        if (
            not replace_attributes
            and hasattr(self, "_attr_extra_state_attributes")
            and self._attr_extra_state_attributes is not None
        ):
            updated_attributes = copy.deepcopy(self._attr_extra_state_attributes)

        attributes = kwargs.get(ATTR_ATTRIBUTES)
        if attributes is not None:
            if isinstance(attributes, MutableMapping):
                _LOGGER.debug(
                    f"({self._attr_name}) [async_update_variable] New Attributes: {attributes}"
                )
                extra_attributes = self._update_attr_settings(attributes)
                if updated_attributes is not None:
                    updated_attributes.update(extra_attributes)
                else:
                    updated_attributes = extra_attributes
            else:
                _LOGGER.error(
                    f"({self._attr_name}) AttributeError: Attributes must be a dictionary: {attributes}"
                )

        if updated_attributes is not None:
            self._attr_extra_state_attributes = copy.deepcopy(updated_attributes)
            _LOGGER.debug(
                f"({self._attr_name}) [async_update_variable] Final Attributes: {updated_attributes}"
            )
        else:
            self._attr_extra_state_attributes = None

        if ATTR_LATITUDE in kwargs:
            self._attr_latitude = kwargs.get(ATTR_LATITUDE)
        if ATTR_LONGITUDE in kwargs:
            self._attr_longitude = kwargs.get(ATTR_LONGITUDE)
        if ATTR_LOCATION_NAME in kwargs:
            self._attr_location_name = kwargs.get(ATTR_LOCATION_NAME)
        if ATTR_BATTERY_LEVEL in kwargs:
            self._attr_battery_level = kwargs.get(ATTR_BATTERY_LEVEL)
        if ATTR_GPS_ACCURACY in kwargs:
            self._attr_gps_accuracy = kwargs.get(ATTR_GPS_ACCURACY)
        if (
            ATTR_DELETE_LOCATION_NAME in kwargs
            and kwargs.get(ATTR_DELETE_LOCATION_NAME) is True
        ):
            self._attr_location_name = None
        self.async_write_ha_state()

    @property
    def should_poll(self):
        """If entity should be polled."""
        return False

    @property
    def force_update(self) -> bool:
        """Force update status of the entity."""
        return self._force_update

    @property
    def source_type(self) -> SourceType:
        """Return the source type, e.g. gps or router, of the device."""
        return self._attr_source_type

    @property
    def latitude(self):
        """Return latitude value of the device."""
        return self._attr_latitude

    @property
    def longitude(self):
        """Return longitude value of the device."""
        return self._attr_longitude

    @property
    def location_accuracy(self) -> int:
        """Return the location accuracy of the device.

        Value in meters.
        """
        return self._attr_gps_accuracy if self._attr_gps_accuracy is not None else 0

    @property
    def location_name(self) -> str | None:
        """Return a location name for the current location of the device."""
        return self._attr_location_name

    @final
    @property
    def state_attributes(self) -> dict[str, StateType]:
        """Return the device state attributes."""
        attr: dict[str, StateType] = {}
        attr.update(super().state_attributes)
        if self._attr_extra_state_attributes is not None:
            attr.update(self._attr_extra_state_attributes)
        if self._attr_source_type is not None:
            attr[ATTR_SOURCE_TYPE] = self._attr_source_type
        if self._attr_latitude is not None and self._attr_longitude is not None:
            attr[ATTR_LATITUDE] = self._attr_latitude
            attr[ATTR_LONGITUDE] = self._attr_longitude
        if self._attr_gps_accuracy is not None:
            attr[ATTR_GPS_ACCURACY] = self._attr_gps_accuracy
        if self._attr_battery_level is not None:
            attr[ATTR_BATTERY_LEVEL] = self._attr_battery_level
        if self._attr_location_name is not None:
            attr[ATTR_LOCATION_NAME] = self._attr_location_name
        return attr
