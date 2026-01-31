from collections.abc import MutableMapping
import copy
import logging
from typing import cast
import yaml

from homeassistant.components.binary_sensor import PLATFORM_SCHEMA, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_FRIENDLY_NAME,
    ATTR_ICON,
    CONF_DEVICE_CLASS,
    CONF_DEVICE_ID,
    CONF_ICON,
    CONF_NAME,
    MATCH_ALL,
    STATE_OFF,
    STATE_ON,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, entity_platform, selector
from homeassistant.helpers.device import async_device_info_to_link_from_device_id
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
    DEFAULT_EXCLUDE_FROM_RECORDER,
    DEFAULT_REPLACE_ATTRIBUTES,
    DOMAIN,
)
from .helpers import merge_attribute_dict

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

    config = hass.data.get(DOMAIN, {}).get(config_entry.entry_id, {})
    unique_id = config_entry.entry_id
    # _LOGGER.debug(f"[async_setup_entry] config_entry: {config_entry.as_dict()}")
    # _LOGGER.debug(f"[async_setup_entry] config: {config}")
    # _LOGGER.debug(f"[async_setup_entry] unique_id: {unique_id}")

    if config.get(CONF_EXCLUDE_FROM_RECORDER, DEFAULT_EXCLUDE_FROM_RECORDER):
        _LOGGER.debug(
            f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID, None))}) "
            "Excluding from Recorder"
        )
        async_add_entities([VariableNoRecorder(hass, config, config_entry, unique_id)])
    else:
        async_add_entities([Variable(hass, config, config_entry, unique_id)])

    return None


class Variable(BinarySensorEntity, RestoreEntity):  # type: ignore[misc]
    """Representation of a Binary Sensor Variable."""

    def __init__(
        self,
        hass,
        config,
        config_entry,
        unique_id,
    ):
        """Initialize a Binary Sensor Variable."""
        # _LOGGER.debug(f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID))}) [init] config: {config}")
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
        self._attr_name = config.get(CONF_NAME, config.get(CONF_VARIABLE_ID, ""))
        self._attr_icon = config.get(CONF_ICON)
        self._attr_device_class = config.get(CONF_DEVICE_CLASS)
        self._restore = config.get(CONF_RESTORE)
        self._force_update = config.get(CONF_FORCE_UPDATE)
        self._yaml_variable = config.get(CONF_YAML_VARIABLE)
        self._exclude_from_recorder = config.get(CONF_EXCLUDE_FROM_RECORDER)
        self._attr_device_info = async_device_info_to_link_from_device_id(
            hass,
            config.get(CONF_DEVICE_ID),
        )
        if (
            config.get(CONF_ATTRIBUTES) is not None
            and config.get(CONF_ATTRIBUTES)
            and isinstance(config.get(CONF_ATTRIBUTES), MutableMapping)
        ):
            _LOGGER.debug(
                f"({config.get(CONF_NAME, config.get(CONF_VARIABLE_ID))}) [init] config attributes: {config.get(CONF_ATTRIBUTES)} (type: {type(config.get(CONF_ATTRIBUTES))})"
            )
            self._attr_extra_state_attributes = cast(
                dict, self._update_attr_settings(config.get(CONF_ATTRIBUTES))
            )
        else:
            self._attr_extra_state_attributes = {}
        registry = er.async_get(self._hass)
        current_entity_id = registry.async_get_entity_id(
            DOMAIN, PLATFORM, self._attr_unique_id
        )
        if current_entity_id is not None:
            self.entity_id = current_entity_id
        else:
            self.entity_id = generate_entity_id(
                ENTITY_ID_FORMAT, self._variable_id, hass=self._hass
            )
        _LOGGER.debug(f"({self._attr_name}) [init] entity_id: {self.entity_id}")

    async def async_added_to_hass(self):
        """Run when entity about to be added."""
        await super().async_added_to_hass()
        _LOGGER.debug(f"({self._attr_name}) [async_added_to_hass] config at add: {self._config}")
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
                    # Never restore Home Assistant's computed friendly_name back into
                    # _attr_name. When the entity is linked to a device and
                    # _attr_has_entity_name is True, Home Assistant prefixes the
                    # device name when generating friendly_name; restoring that value
                    # would cause the device name to be duplicated on every reboot.
                    restored_attributes = dict(state.attributes)
                    restored_attributes.pop(ATTR_FRIENDLY_NAME, None)
                    self._attr_extra_state_attributes = cast(
                        dict,
                        self._update_attr_settings(
                            restored_attributes,
                            just_pop=self._config.get(CONF_UPDATED, False),
                        ),
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
                    elif isinstance(state.state, bool):
                        self._attr_is_on = state.state
                    else:
                        self._attr_is_on = None
                else:
                    self._attr_is_on = None
            _LOGGER.debug(
                f"({self._attr_name}) [restored] _attr_is_on: {self._attr_is_on}"
            )
            _LOGGER.debug(
                f"({self._attr_name}) [restored] attributes: {getattr(self, '_attr_extra_state_attributes', {})}"
            )
            # If there were no attributes restored from state, apply attributes from config
            if (
                (not getattr(self, "_attr_extra_state_attributes", None)
                 or self._attr_extra_state_attributes == {})
                and self._config.get(CONF_ATTRIBUTES)
            ):
                self._attr_extra_state_attributes = cast(
                    dict, self._update_attr_settings(self._config.get(CONF_ATTRIBUTES))
                )
                _LOGGER.debug(
                    f"({self._attr_name}) [restored] applied config attributes: {getattr(self, '_attr_extra_state_attributes', {})}"
                )
            try:
                self.async_write_ha_state()
            except Exception as err:
                _LOGGER.debug(
                    "(%s) async_write_ha_state failed during restore: %s",
                    self._attr_name,
                    err,
                )
        else:
            # If not restoring from state, ensure config-provided attributes are applied
            if (
                (not getattr(self, "_attr_extra_state_attributes", None)
                 or self._attr_extra_state_attributes == {})
                and self._config.get(CONF_ATTRIBUTES)
            ):
                self._attr_extra_state_attributes = cast(
                    dict, self._update_attr_settings(self._config.get(CONF_ATTRIBUTES))
                )
                _LOGGER.debug(
                    f"({self._attr_name}) [added] applied config attributes: {getattr(self, '_attr_extra_state_attributes', {})}"
                )
            try:
                self.async_write_ha_state()
            except Exception as err:
                _LOGGER.debug(
                    "(%s) async_write_ha_state failed during add: %s",
                    self._attr_name,
                    err,
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

    @property
    def should_poll(self):  # type: ignore[override]
        """If entity should be polled."""
        return False

    @property
    def force_update(self) -> bool:  # type: ignore[override]
        """Force update status of the entity."""
        return self._force_update

    def _update_attr_settings(self, new_attributes=None, just_pop=False):
        if new_attributes is not None:
            _LOGGER.debug(
                f"({self._attr_name}) [update_attr_settings] Updating Special Attributes; incoming: {new_attributes} (type: {type(new_attributes)})"
            )
            if isinstance(new_attributes, MutableMapping):
                attributes = copy.deepcopy(new_attributes)
                _LOGGER.debug(
                    f"({self._attr_name}) [update_attr_settings] copied attributes: {attributes}"
                )
                for attrib, setting in VARIABLE_ATTR_SETTINGS.items():
                    if attrib in attributes.keys():
                        if just_pop:
                            # _LOGGER.debug(f"({self._attr_name}) [update_attr_settings] just_pop / attrib: {attrib} / value: {attributes.get(attrib)}")
                            attributes.pop(attrib, None)
                        else:
                            # _LOGGER.debug(f"({self._attr_name}) [update_attr_settings] attrib: {attrib} / setting: {setting} / value: {attributes.get(attrib)}")
                            setattr(self, setting, attributes.pop(attrib, None))
                _LOGGER.debug(
                    f"({self._attr_name}) [update_attr_settings] result attributes: {attributes}"
                )
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

        _LOGGER.debug(
            f"({self._attr_name}) [async_update_variable] kwargs: {kwargs}"
        )

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
            if isinstance(attributes, str):
                try:
                    attributes = yaml.safe_load(attributes)
                except Exception as err:
                    _LOGGER.error(
                        f"({self._attr_name}) Failed to parse attributes string: %s", err
                    )
                    attributes = None
            if isinstance(attributes, MutableMapping):
                _LOGGER.debug(
                    f"({self._attr_name}) [async_update_variable] New Attributes: {attributes}"
                )
                extra_attributes = self._update_attr_settings(attributes)
                if extra_attributes is not None:
                    try:
                        updated_attributes = merge_attribute_dict(
                            updated_attributes, extra_attributes
                        )
                    except ValueError as err:
                        _LOGGER.error(
                            "(%s) AttributeError: %s",
                            self._attr_name,
                            err,
                        )
            else:
                _LOGGER.error(
                    f"({self._attr_name}) AttributeError: Attributes must be a dictionary: {attributes}"
                )

        if updated_attributes is not None:
            self._attr_extra_state_attributes = cast(
                dict, copy.deepcopy(updated_attributes)
            )
            _LOGGER.debug(
                f"({self._attr_name}) [async_update_variable] Final Attributes: {updated_attributes}"
            )
        else:
            self._attr_extra_state_attributes = cast(dict, {})

        if ATTR_VALUE in kwargs:
            val = kwargs.get(ATTR_VALUE)
            if val is None or (
                isinstance(val, str)
                and val.lower() in ["", "none", "unknown", "unavailable"]
            ):
                self._attr_is_on = None
            elif isinstance(val, str):
                if val.lower() in ["true", "1", "t", "y", "yes", "on"]:
                    self._attr_is_on = True
                else:
                    self._attr_is_on = False
            else:
                self._attr_is_on = val
            _LOGGER.debug(
                f"({self._attr_name}) [async_update_variable] New Value: {self._attr_is_on}"
            )

        self.async_write_ha_state()

    async def async_toggle_variable(self, **kwargs) -> None:
        """Toggle Binary Sensor Variable."""

        _LOGGER.debug(
            f"({self._attr_name}) [async_toggle_variable] kwargs: {kwargs}"
        )

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
            if isinstance(attributes, str):
                try:
                    attributes = yaml.safe_load(attributes)
                except Exception as err:
                    _LOGGER.error(
                        f"({self._attr_name}) Failed to parse attributes string: %s", err
                    )
                    attributes = None
            if isinstance(attributes, MutableMapping):
                _LOGGER.debug(
                    f"({self._attr_name}) [async_toggle_variable] New Attributes: {attributes}"
                )
                extra_attributes = self._update_attr_settings(attributes)
                if extra_attributes is not None:
                    try:
                        updated_attributes = merge_attribute_dict(
                            updated_attributes, extra_attributes
                        )
                    except ValueError as err:
                        _LOGGER.error(
                            "(%s) AttributeError: %s",
                            self._attr_name,
                            err,
                        )
            else:
                _LOGGER.error(
                    f"({self._attr_name}) AttributeError: Attributes must be a dictionary: {attributes}"
                )

        if updated_attributes is not None:
            self._attr_extra_state_attributes = cast(
                dict, copy.deepcopy(updated_attributes)
            )
            _LOGGER.debug(
                f"({self._attr_name}) [async_toggle_variable] Final Attributes: {updated_attributes}"
            )
        else:
            self._attr_extra_state_attributes = cast(dict, {})

        if self._attr_is_on is not None:
            self._attr_is_on = not self._attr_is_on
        _LOGGER.debug(
            f"({self._attr_name}) [async_toggle_variable] New Value: {self._attr_is_on}"
        )

        self.async_write_ha_state()


class VariableNoRecorder(Variable):
    _unrecorded_attributes = frozenset({MATCH_ALL})
