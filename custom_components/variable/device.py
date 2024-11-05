import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_CONFIGURATION_URL,
    ATTR_HW_VERSION,
    ATTR_MANUFACTURER,
    ATTR_MODEL,
    ATTR_MODEL_ID,
    ATTR_SERIAL_NUMBER,
    ATTR_SW_VERSION,
    CONF_NAME,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import CONF_YAML_VARIABLE, DOMAIN

_LOGGER = logging.getLogger(__name__)


async def create_device(hass: HomeAssistant, entry: ConfigEntry):
    # _LOGGER.debug(f"({entry.title}) [create_device] entry: {entry}")

    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    device = device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        manufacturer=entry.data.get(ATTR_MANUFACTURER),
        name=entry.data.get(CONF_NAME),
        model=entry.data.get(ATTR_MODEL),
        model_id=entry.data.get(ATTR_MODEL_ID),
        sw_version=entry.data.get(ATTR_SW_VERSION),
        hw_version=entry.data.get(ATTR_HW_VERSION),
        serial_number=entry.data.get(ATTR_SERIAL_NUMBER),
        configuration_url=entry.data.get(ATTR_CONFIGURATION_URL),
    )
    _LOGGER.debug(f"({device.name}) [create_device] device: {device}")
    device_entities = er.async_entries_for_device(
        registry=entity_registry, device_id=device.id, include_disabled_entities=True
    )
    # _LOGGER.debug(f"({device.name}) [create_device] device entities: {device_entities}")

    domain_entries = hass.config_entries.async_loaded_entries(DOMAIN)
    # _LOGGER.debug(f"({device.name}) [create_device] domain_entries: {domain_entries}")
    domain_entities = []
    for entry in domain_entries:
        # _LOGGER.debug(f"({device.name}) [create_device] domain_entry: {entry}")
        # _LOGGER.debug(f"({device.name}) [create_device] domain_entry data: {entry.data}")
        if not entry.data.get(CONF_YAML_VARIABLE, False):
            domain_entities = domain_entities + er.async_entries_for_config_entry(
                registry=entity_registry, config_entry_id=entry.entry_id
            )
    # _LOGGER.debug(f"({device.name}) [create_device] domain entities: {domain_entities}")
    domain_reload_entities = []
    for entity in domain_entities:
        if entity.device_id == device.id:
            domain_reload_entities.append(entity)
    reload_entities = device_entities + domain_reload_entities
    if len(reload_entities) > 0:
        _LOGGER.debug(
            f"({device.name}) [create_device] Reloading {len(reload_entities)} entities"
        )
    else:
        _LOGGER.debug(
            f"({device.name}) [create_device] Reloading all Variable entities"
        )
        reload_entities = domain_entities

    for entity in reload_entities:
        # May actually want to do this for all entities, will see
        if entity.platform != DOMAIN:
            continue
        _LOGGER.debug(
            f"({device.name}) [create_device] Reloading entity_id: {entity.entity_id}"
        )
        hass.config_entries.async_schedule_reload(entity.config_entry_id)


async def update_device(hass: HomeAssistant, entry: ConfigEntry, user_input) -> bool:
    # _LOGGER.debug(f"({entry.title}) [update_device] entry: {entry}")
    # _LOGGER.debug(f"({entry.title}) [update_device] user_input: {user_input}")
    device_registry = dr.async_get(hass)
    device = device_registry.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    # _LOGGER.debug(f"({device.name}) [update_device] device: {device}")

    device_registry.async_update_device(
        device_id=device.id,
        manufacturer=user_input.get(ATTR_MANUFACTURER),
        model=user_input.get(ATTR_MODEL),
        model_id=user_input.get(ATTR_MODEL_ID),
        sw_version=user_input.get(ATTR_SW_VERSION),
        hw_version=user_input.get(ATTR_HW_VERSION),
        serial_number=user_input.get(ATTR_SERIAL_NUMBER),
        configuration_url=user_input.get(ATTR_CONFIGURATION_URL),
    )
    _LOGGER.debug(f"({device.name}) [update_device] updated device: {device}")


async def remove_device(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # _LOGGER.debug(f"({entry.title}) [remove_device] entry: {entry}")

    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    device = device_registry.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    _LOGGER.debug(f"({device.name}) [remove_device] device: {device}")
    if not device:
        return True
    entities = er.async_entries_for_device(
        registry=entity_registry, device_id=device.id, include_disabled_entities=True
    )
    _LOGGER.debug(f"({device.name}) [remove_device] Reloading {len(entities)} entities")
    device_registry.async_remove_device(device.id)

    for entity in entities:
        # May actually want to do this for all entities, will see
        if entity.platform != DOMAIN:
            continue
        _LOGGER.debug(
            f"({device.name}) [remove_device] Reloading entity_id: {entity.entity_id}"
        )
        hass.config_entries.async_schedule_reload(entity.config_entry_id)

    return True
