"""Variable implementation for Home Assistant."""

import contextlib
import copy
import json
import logging

import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import (
    CONF_DEVICE,
    CONF_DEVICE_ID,
    CONF_ENTITY_ID,
    CONF_FRIENDLY_NAME,
    CONF_ICON,
    CONF_NAME,
    SERVICE_RELOAD,
    Platform,
)
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.device import (
    async_remove_stale_devices_links_keep_current_device,
)
from homeassistant.helpers.reload import async_integration_yaml_config
from homeassistant.helpers.typing import ConfigType

from .const import (
    ATTR_ATTRIBUTES,
    ATTR_ENTITY,
    ATTR_REPLACE_ATTRIBUTES,
    ATTR_VALUE,
    ATTR_VARIABLE,
    CONF_ATTRIBUTES,
    CONF_ENTITY_PLATFORM,
    CONF_FORCE_UPDATE,
    CONF_RESTORE,
    CONF_VALUE,
    CONF_VARIABLE_ID,
    CONF_YAML_PRESENT,
    CONF_YAML_VARIABLE,
    DEFAULT_REPLACE_ATTRIBUTES,
    DOMAIN,
    PLATFORMS,
    SERVICE_UPDATE_SENSOR,
)
from .device import create_device, remove_device

_LOGGER = logging.getLogger(__name__)

SERVICE_SET_VARIABLE_LEGACY = "set_variable"
SERVICE_SET_ENTITY_LEGACY = "set_entity"

SERVICE_SET_VARIABLE_LEGACY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_VARIABLE): cv.string,
        vol.Optional(ATTR_VALUE): cv.match_all,
        vol.Optional(ATTR_ATTRIBUTES): dict,
        vol.Optional(
            ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
        ): cv.boolean,
    }
)

SERVICE_SET_ENTITY_LEGACY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY): cv.string,
        vol.Optional(ATTR_VALUE): cv.match_all,
        vol.Optional(ATTR_ATTRIBUTES): dict,
        vol.Optional(
            ATTR_REPLACE_ATTRIBUTES, default=DEFAULT_REPLACE_ATTRIBUTES
        ): cv.boolean,
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType):
    """Set up the Variable services."""

    async def async_set_variable_legacy_service(call: ServiceCall) -> None:
        """Handle calls to the set_variable legacy service."""

        # _LOGGER.debug(f"[async_set_variable_legacy_service] Pre call data: {call.data}")
        ENTITY_ID_FORMAT = Platform.SENSOR + ".{}"
        var_ent = ENTITY_ID_FORMAT.format(call.data.get(ATTR_VARIABLE))
        # _LOGGER.debug(f"[async_set_variable_legacy_service] Post call data: {call.data}")
        await _async_set_legacy_service(call, var_ent)

    async def async_set_entity_legacy_service(call: ServiceCall) -> None:
        """Handle calls to the set_entity legacy service."""

        # _LOGGER.debug(f"[async_set_entity_legacy_service] call data: {call.data}")
        await _async_set_legacy_service(call, call.data.get(ATTR_ENTITY))

    async def _async_set_legacy_service(call: ServiceCall, var_ent: str):
        """Shared function for both set_entity and set_variable legacy services."""

        # _LOGGER.debug(f"[async_set_legacy_service] call data: {call.data}")
        update_sensor_data = {
            CONF_ENTITY_ID: [var_ent],
            ATTR_REPLACE_ATTRIBUTES: call.data.get(ATTR_REPLACE_ATTRIBUTES, False),
        }
        if call.data.get(ATTR_VALUE):
            update_sensor_data.update({ATTR_VALUE: call.data.get(ATTR_VALUE)})
        if call.data.get(ATTR_ATTRIBUTES):
            update_sensor_data.update({ATTR_ATTRIBUTES: call.data.get(ATTR_ATTRIBUTES)})
        _LOGGER.debug(
            f"[async_set_legacy_service] update_sensor_data: {update_sensor_data}"
        )
        await hass.services.async_call(
            DOMAIN, SERVICE_UPDATE_SENSOR, service_data=update_sensor_data
        )

    async def _async_reload_service_handler(service: ServiceCall) -> None:
        """Handle reload service call."""
        _LOGGER.info("Service %s.reload called: reloading YAML integration", DOMAIN)
        reload_config = None
        with contextlib.suppress(HomeAssistantError):
            reload_config = await async_integration_yaml_config(hass, DOMAIN)
        if reload_config is None:
            return
        _LOGGER.debug(f" reload_config: {reload_config}")
        await _async_process_yaml(hass, reload_config)

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_VARIABLE_LEGACY,
        async_set_variable_legacy_service,
        schema=SERVICE_SET_VARIABLE_LEGACY_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_ENTITY_LEGACY,
        async_set_entity_legacy_service,
        schema=SERVICE_SET_ENTITY_LEGACY_SCHEMA,
    )
    hass.services.async_register(DOMAIN, SERVICE_RELOAD, _async_reload_service_handler)

    return await _async_process_yaml(hass, config)


async def _async_process_yaml(hass: HomeAssistant, config: ConfigType) -> bool:
    variables = json.loads(json.dumps(config.get(DOMAIN, {})))

    for var, var_fields in variables.items():
        if var is not None:
            _LOGGER.debug(f"[YAML] variable_id: {var}")
            _LOGGER.debug(f"[YAML] var_fields: {var_fields}")

            for key_empty, var_empty in var_fields.copy().items():
                if var_empty is None:
                    var_fields.pop(key_empty)

            attr = var_fields.get(CONF_ATTRIBUTES, {})
            icon = attr.pop(CONF_ICON, None)
            name = var_fields.get(CONF_NAME, attr.pop(CONF_FRIENDLY_NAME, None))
            attr.pop(CONF_FRIENDLY_NAME, None)

            if var not in {
                entry.data.get(CONF_VARIABLE_ID)
                for entry in hass.config_entries.async_entries(DOMAIN)
            }:
                _LOGGER.warning(f"[YAML] Creating New Sensor Variable: {var}")
                hass.async_create_task(
                    hass.config_entries.flow.async_init(
                        DOMAIN,
                        context={"source": SOURCE_IMPORT},
                        data={
                            CONF_ENTITY_PLATFORM: Platform.SENSOR,
                            CONF_VARIABLE_ID: var,
                            CONF_NAME: name,
                            CONF_VALUE: var_fields.get(CONF_VALUE),
                            CONF_RESTORE: var_fields.get(CONF_RESTORE),
                            CONF_FORCE_UPDATE: var_fields.get(CONF_FORCE_UPDATE),
                            CONF_ATTRIBUTES: attr,
                            CONF_ICON: icon,
                        },
                    )
                )
            else:
                _LOGGER.info(f"[YAML] Updating Existing Sensor Variable: {var}")

                entry_id = None
                for ent in hass.config_entries.async_entries(DOMAIN):
                    if var == ent.data.get(CONF_VARIABLE_ID):
                        entry_id = ent.entry_id
                        break
                # _LOGGER.debug(f"[YAML] entry_id: {entry_id}")
                if entry_id:
                    entry = ent
                    # _LOGGER.debug(f"[YAML] entry before: {entry.as_dict()}")

                    for m in dict(entry.data).keys():
                        var_fields.setdefault(m, entry.data[m])
                    var_fields.update({CONF_YAML_PRESENT: True})
                    # _LOGGER.debug(f"[YAML] Updated var_fields: {var_fields}")
                    hass.config_entries.async_update_entry(
                        entry, data=var_fields, options={}
                    )

                    hass.async_create_task(hass.config_entries.async_reload(entry_id))

                else:
                    _LOGGER.error(
                        f"[YAML] Update Error. Could not find entry_id for: {var}"
                    )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry."""

    # _LOGGER.debug(f"[init async_setup_entry] entry: {entry.data}")
    if entry.data.get(CONF_YAML_VARIABLE, False) is True:
        if entry.data.get(CONF_YAML_PRESENT, False) is False:
            _LOGGER.warning(
                f"[YAML] YAML Entry no longer exists, deleting entry in HA: {entry.data.get(CONF_VARIABLE_ID)}"
            )
            # _LOGGER.debug(f"[YAML] entry_id: {entry.entry_id}")
            hass.async_create_task(hass.config_entries.async_remove(entry.entry_id))
            return False
        else:
            yaml_data = copy.deepcopy(dict(entry.data))
            yaml_data.pop(CONF_YAML_PRESENT, None)
            hass.config_entries.async_update_entry(entry, data=yaml_data, options={})
    async_remove_stale_devices_links_keep_current_device(
        hass,
        entry.entry_id,
        entry.data.get(CONF_DEVICE_ID),
    )
    hass.data.setdefault(DOMAIN, {})
    hass_data = dict(entry.data)
    hass.data[DOMAIN][entry.entry_id] = hass_data
    if hass_data.get(CONF_ENTITY_PLATFORM) in PLATFORMS:
        await hass.config_entries.async_forward_entry_setups(
            entry, [hass_data.get(CONF_ENTITY_PLATFORM)]
        )
    elif hass_data.get(CONF_ENTITY_PLATFORM) == CONF_DEVICE:
        await create_device(hass, entry)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    _LOGGER.info(f"Unloading: {entry.data}")
    # _LOGGER.debug(f"[init async_unload_entry] entry: {entry}")
    hass_data = dict(entry.data)
    unload_ok = False
    if hass_data.get(CONF_ENTITY_PLATFORM) in PLATFORMS:
        unload_ok = await hass.config_entries.async_unload_platforms(
            entry, [hass_data.get(CONF_ENTITY_PLATFORM)]
        )
    elif hass_data.get(CONF_ENTITY_PLATFORM) == CONF_DEVICE:
        unload_ok = await remove_device(hass, entry)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
