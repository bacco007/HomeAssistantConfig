from collections.abc import MutableMapping
import copy
import logging

from homeassistant.components.recorder import DATA_INSTANCE as RECORDER_INSTANCE
from homeassistant.components.sensor import (
    CONF_STATE_CLASS,
    PLATFORM_SCHEMA,
    RestoreSensor,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_FRIENDLY_NAME,
    ATTR_ICON,
    CONF_DEVICE_CLASS,
    CONF_ICON,
    CONF_NAME,
    CONF_UNIT_OF_MEASUREMENT,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, entity_platform
from homeassistant.helpers.entity import generate_entity_id
import homeassistant.helpers.entity_registry as er
from homeassistant.util import slugify
import voluptuous as vol

from .const import (
    ATTR_ATTRIBUTES,
    ATTR_NATIVE_UNIT_OF_MEASUREMENT,
    ATTR_REPLACE_ATTRIBUTES,
    ATTR_SUGGESTED_UNIT_OF_MEASUREMENT,
    ATTR_VALUE,
    CONF_ATTRIBUTES,
    CONF_EXCLUDE_FROM_RECORDER,
    CONF_FORCE_UPDATE,
    CONF_RESTORE,
    CONF_UPDATED,
    CONF_VALUE,
    CONF_VALUE_TYPE,
    CONF_VARIABLE_ID,
    CONF_YAML_VARIABLE,
    DEFAULT_EXCLUDE_FROM_RECORDER,
    DEFAULT_FORCE_UPDATE,
    DEFAULT_ICON,
    DEFAULT_REPLACE_ATTRIBUTES,
    DEFAULT_RESTORE,
    DOMAIN,
)
from .helpers import value_to_type
from .recorder_history_prefilter import recorder_prefilter

_LOGGER = logging.getLogger(__name__)

PLATFORM = Platform.SENSOR
ENTITY_ID_FORMAT = PLATFORM + ".{}"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_VARIABLE_ID): cv.string,
        vol.Optional(CONF_NAME): cv.string,
        vol.Optional(CONF_ICON, default=DEFAULT_ICON): cv.string,
        vol.Optional(CONF_VALUE): cv.match_all,
        vol.Optional(CONF_ATTRIBUTES): dict,
        vol.Optional(CONF_RESTORE, default=DEFAULT_RESTORE): cv.boolean,
        vol.Optional(CONF_FORCE_UPDATE, default=DEFAULT_FORCE_UPDATE): cv.boolean,
        vol.Optional(
            CONF_EXCLUDE_FROM_RECORDER, default=DEFAULT_EXCLUDE_FROM_RECORDER
        ): cv.boolean,
    }
)

SERVICE_UPDATE_VARIABLE = "update_" + PLATFORM

VARIABLE_ATTR_SETTINGS = {
    ATTR_FRIENDLY_NAME: "_attr_name",
    ATTR_ICON: "_attr_icon",
    CONF_DEVICE_CLASS: "_attr_device_class",
    CONF_STATE_CLASS: "_attr_state_class",
    ATTR_NATIVE_UNIT_OF_MEASUREMENT: "_attr_native_unit_of_measurement",
    ATTR_SUGGESTED_UNIT_OF_MEASUREMENT: "_attr_suggested_unit_of_measurement",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities,
) -> None:

    """Setup the Sensor Variable entity with a config_entry (config_flow)."""

    config_entry.options = {}
    platform = entity_platform.async_get_current_platform()

    platform.async_register_entity_service(
        SERVICE_UPDATE_VARIABLE,
        {
            vol.Optional(ATTR_VALUE): cv.string,
            vol.Optional(ATTR_ATTRIBUTES): dict,
            vol.Optional(
                ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
            ): cv.boolean,
        },
        "async_update_variable",
    )

    config = hass.data.get(DOMAIN).get(config_entry.entry_id)
    unique_id = config_entry.entry_id

    async_add_entities([Variable(hass, config, config_entry, unique_id)])

    return True


class Variable(RestoreSensor):
    """Representation of a Sensor Variable."""

    def __init__(
        self,
        hass,
        config,
        config_entry,
        unique_id,
    ):
        """Initialize a Sensor Variable."""
        # _LOGGER.debug(
        #    f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID))}) [init] config: {config}"
        # )
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

        self._attr_icon = config.get(CONF_ICON)
        self._restore = config.get(CONF_RESTORE)
        self._force_update = config.get(CONF_FORCE_UPDATE)
        self._yaml_variable = config.get(CONF_YAML_VARIABLE)
        self._exclude_from_recorder = config.get(CONF_EXCLUDE_FROM_RECORDER)
        self._value_type = config.get(CONF_VALUE_TYPE)
        self._attr_device_class = config.get(CONF_DEVICE_CLASS)
        self._attr_native_unit_of_measurement = config.get(CONF_UNIT_OF_MEASUREMENT)
        self._attr_suggested_unit_of_measurement = config.get(CONF_UNIT_OF_MEASUREMENT)
        self._attr_state_class = config.get(CONF_STATE_CLASS)
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
        if config.get(CONF_VALUE) is None or (
            isinstance(config.get(CONF_VALUE), str)
            and config.get(CONF_VALUE).lower() in ["", "none", "unknown", "unavailable"]
        ):
            self._attr_native_value = None
        else:
            try:
                self._attr_native_value = value_to_type(
                    config.get(CONF_VALUE), self._value_type
                )
            except ValueError:
                self._attr_native_value = None

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
            sensor = await self.async_get_last_sensor_data()
            if sensor and hasattr(sensor, "native_value"):
                # _LOGGER.debug(f"({self._attr_name}) Restored last sensor data: {sensor.as_dict()}")
                if sensor.native_value is None or (
                    isinstance(sensor.native_value, str)
                    and sensor.native_value.lower()
                    in [
                        "",
                        "none",
                        "unknown",
                        "unavailable",
                    ]
                ):
                    self._attr_native_value = None
                else:
                    try:
                        self._attr_native_value = value_to_type(
                            sensor.native_value, self._value_type
                        )
                    except ValueError:
                        self._attr_native_value = None

            state = await self.async_get_last_state()
            if state:
                # _LOGGER.debug(f"({self._attr_name}) Restored last state: {state.as_dict()}")
                if (
                    hasattr(state, CONF_ATTRIBUTES)
                    and state.attributes
                    and isinstance(state.attributes, MutableMapping)
                ):
                    self._attr_extra_state_attributes = self._update_attr_settings(
                        state.attributes.copy(),
                        just_pop=self._config.get(CONF_UPDATED, False),
                    )
                    if self._config.get(CONF_UPDATED, True):
                        self._attr_extra_state_attributes.pop(
                            CONF_UNIT_OF_MEASUREMENT, None
                        )

            _LOGGER.debug(
                f"({self._attr_name}) [restored] _attr_native_value: {self._attr_native_value}"
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

    @property
    def should_poll(self):
        """If entity should be polled."""
        return False

    @property
    def force_update(self) -> bool:
        """Force update status of the entity."""
        return self._force_update

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
        """Update Sensor Variable."""

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

        if ATTR_VALUE in kwargs:
            try:
                newval = value_to_type(kwargs.get(ATTR_VALUE), self._value_type)
            except ValueError:
                ERROR = f"The value entered is not compatible with the selected device_class: {self._attr_device_class}. Expected: {self._value_type}. Value: {kwargs.get(ATTR_VALUE)}"
                raise ValueError(ERROR)
                return
            else:
                _LOGGER.debug(
                    f"({self._attr_name}) [async_update_variable] New Value: {newval}"
                )
                self._attr_native_value = newval

        if updated_attributes is not None:
            self._attr_extra_state_attributes = copy.deepcopy(updated_attributes)
            _LOGGER.debug(
                f"({self._attr_name}) [async_update_variable] Final Attributes: {updated_attributes}"
            )
        else:
            self._attr_extra_state_attributes = None

        _LOGGER.debug(
            f"({self._attr_name}) [updated] _attr_native_value: {self._attr_native_value}"
        )
        _LOGGER.debug(
            f"({self._attr_name}) [updated] attributes: {self._attr_extra_state_attributes}"
        )
        self.async_write_ha_state()
