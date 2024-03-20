from collections.abc import MutableMapping
import copy
import logging

from homeassistant.components.binary_sensor import PLATFORM_SCHEMA, BinarySensorEntity
from homeassistant.components.recorder import DATA_INSTANCE as RECORDER_INSTANCE
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_FRIENDLY_NAME,
    ATTR_ICON,
    CONF_DEVICE_CLASS,
    CONF_ICON,
    CONF_NAME,
    STATE_OFF,
    STATE_ON,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, entity_platform, selector
from homeassistant.helpers.entity import generate_entity_id
import homeassistant.helpers.entity_registry as er
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify
import voluptuous as vol

from .const import (
    ATTR_ATTRIBUTES,
    ATTR_REPLACE_ATTRIBUTES,
    ATTR_VALUE,
    CONF_ATTRIBUTES,
    CONF_EXCLUDE_FROM_RECORDER,
    CONF_FORCE_UPDATE,
    CONF_RESTORE,
    CONF_UPDATED,
    CONF_VALUE,
    CONF_VARIABLE_ID,
    CONF_YAML_VARIABLE,
    DEFAULT_REPLACE_ATTRIBUTES,
    DOMAIN,
)
from .recorder_history_prefilter import recorder_prefilter

_LOGGER = logging.getLogger(__name__)

PLATFORM = Platform.BINARY_SENSOR
ENTITY_ID_FORMAT = PLATFORM + ".{}"

SERVICE_UPDATE_VARIABLE = "update_" + PLATFORM
SERVICE_TOGGLE_VARIABLE = "toggle_" + PLATFORM

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({})

VARIABLE_ATTR_SETTINGS = {
    ATTR_FRIENDLY_NAME: "_attr_name",
    ATTR_ICON: "_attr_icon",
    CONF_DEVICE_CLASS: "_attr_device_class",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities,
) -> None:
    """Setup the Binary Sensor Variable entity with a config_entry (config_flow)."""

    platform = entity_platform.async_get_current_platform()

    platform.async_register_entity_service(
        SERVICE_UPDATE_VARIABLE,
        {
            vol.Optional(CONF_VALUE): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=["None", "true", "false"],
                    translation_key="boolean_options",
                    multiple=False,
                    custom_value=False,
                    mode=selector.SelectSelectorMode.LIST,
                )
            ),
            vol.Optional(ATTR_ATTRIBUTES): dict,
            vol.Optional(
                ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
            ): cv.boolean,
        },
        "async_update_variable",
    )

    platform.async_register_entity_service(
        SERVICE_TOGGLE_VARIABLE,
        {
            vol.Optional(ATTR_ATTRIBUTES): dict,
            vol.Optional(
                ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
            ): cv.boolean,
        },
        "async_toggle_variable",
    )

    config = hass.data.get(DOMAIN).get(config_entry.entry_id)
    unique_id = config_entry.entry_id
    # _LOGGER.debug(f"[async_setup_entry] config_entry: {config_entry.as_dict()}")
    # _LOGGER.debug(f"[async_setup_entry] config: {config}")
    # _LOGGER.debug(f"[async_setup_entry] unique_id: {unique_id}")

    async_add_entities([Variable(hass, config, config_entry, unique_id)])

    return True


class Variable(BinarySensorEntity, RestoreEntity):
    """Representation of a Binary Sensor Variable."""

    def __init__(
        self,
        hass,
        config,
        config_entry,
        unique_id,
    ):
        """Initialize a Binary Sensor Variable."""
        _LOGGER.debug(
            f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID))}) [init] config: {config}"
        )
        if config.get(CONF_VALUE) is None or (
            isinstance(config.get(CONF_VALUE), str)
            and config.get(CONF_VALUE).lower() in ["", "none", "unknown", "unavailable"]
        ):
            self._attr_is_on = None
        elif isinstance(config.get(CONF_VALUE), str):
            if config.get(CONF_VALUE).lower() in ["true", "1", "t", "y", "yes", "on"]:
                self._attr_is_on = True
            else:
                self._attr_is_on = False
        else:
            self._attr_is_on = config.get(CONF_VALUE)
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
        self._attr_device_class = config.get(CONF_DEVICE_CLASS)
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
                # _LOGGER.debug(f"({self._attr_name}) Restored last state: {state.as_dict()}")
                if (
                    hasattr(state, "attributes")
                    and state.attributes
                    and isinstance(state.attributes, MutableMapping)
                ):
                    self._attr_extra_state_attributes = self._update_attr_settings(
                        state.attributes.copy(),
                        just_pop=self._config.get(CONF_UPDATED, False),
                    )
                if hasattr(state, "state"):
                    if state.state is None or (
                        isinstance(state.state, str)
                        and state.state.lower()
                        in ["", "none", "unknown", "unavailable"]
                    ):
                        self._attr_is_on = None
                    elif state.state == STATE_OFF:
                        self._attr_is_on = False
                    elif state.state == STATE_ON:
                        self._attr_is_on = True
                    else:
                        self._attr_is_on = state.state
                else:
                    self._attr_is_on = None
            _LOGGER.debug(
                f"({self._attr_name}) [restored] _attr_is_on: {self._attr_is_on}"
            )
            _LOGGER.debug(
                f"({self._attr_name}) [restored] attributes: {self._attr_extra_state_attributes}"
            )
        if self._config.get(CONF_UPDATED, True):
            self._config.update({CONF_UPDATED: False})
            self._hass.config_entries.async_update_entry(
                self._config_entry,
                data=self._config,
                options={},
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
        """Update Binary Sensor Variable."""

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

        if ATTR_VALUE in kwargs:
            if kwargs.get(ATTR_VALUE) is None or (
                isinstance(kwargs.get(ATTR_VALUE), str)
                and kwargs.get(ATTR_VALUE).lower()
                in ["", "none", "unknown", "unavailable"]
            ):
                self._attr_is_on = None
            elif isinstance(kwargs.get(ATTR_VALUE), str):
                if kwargs.get(ATTR_VALUE).lower() in [
                    "true",
                    "1",
                    "t",
                    "y",
                    "yes",
                    "on",
                ]:
                    self._attr_is_on = True
                else:
                    self._attr_is_on = False
            else:
                self._attr_is_on = kwargs.get(ATTR_VALUE)
            _LOGGER.debug(
                f"({self._attr_name}) [async_update_variable] New Value: {self._attr_is_on}"
            )

        self.async_write_ha_state()

    async def async_toggle_variable(self, **kwargs) -> None:
        """Toggle Binary Sensor Variable."""

        updated_attributes = None

        replace_attributes = kwargs.get(ATTR_REPLACE_ATTRIBUTES, False)
        _LOGGER.debug(
            f"({self._attr_name}) [async_toggle_variable] Replace Attributes: {replace_attributes}"
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
                    f"({self._attr_name}) [async_toggle_variable] New Attributes: {attributes}"
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
                f"({self._attr_name}) [async_toggle_variable] Final Attributes: {updated_attributes}"
            )
        else:
            self._attr_extra_state_attributes = None

        if self._attr_is_on is not None:
            self._attr_is_on = not self._attr_is_on
        _LOGGER.debug(
            f"({self._attr_name}) [async_toggle_variable] New Value: {self._attr_is_on}"
        )

        self.async_write_ha_state()
