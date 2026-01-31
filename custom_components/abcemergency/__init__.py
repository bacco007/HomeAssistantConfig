"""ABC Emergency integration for Home Assistant.

This integration provides real-time Australian emergency incident data
from ABC Emergency (abc.net.au/emergency), enabling location-based alerting
for bushfires, floods, storms, cyclones, and other emergencies.

The integration supports three instance types:
- State: Monitor all incidents in a selected state
- Zone: Monitor incidents near a fixed location
- Person: Monitor incidents near a person's dynamic location
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, cast

from homeassistant.const import (
    CONF_LATITUDE,
    CONF_LONGITUDE,
    Platform,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import ABCEmergencyClient
from .const import (
    CONF_INSTANCE_TYPE,
    CONF_PERSON_ENTITY_ID,
    CONF_STATE,
    DOMAIN,
    INSTANCE_TYPE_PERSON,
    INSTANCE_TYPE_STATE,
    INSTANCE_TYPE_ZONE,
)
from .coordinator import ABCEmergencyCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.GEO_LOCATION,
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ABC Emergency from a config entry.

    Args:
        hass: Home Assistant instance.
        entry: Config entry being set up.

    Returns:
        True if setup was successful.
    """
    hass.data.setdefault(DOMAIN, {})

    session = async_get_clientsession(hass)
    client = ABCEmergencyClient(session)

    # Determine instance type (default to state for v1/v2 entries)
    instance_type = entry.data.get(CONF_INSTANCE_TYPE, INSTANCE_TYPE_STATE)

    # Create coordinator based on instance type
    if instance_type == INSTANCE_TYPE_STATE:
        coordinator = ABCEmergencyCoordinator(
            hass,
            client,
            entry,
            instance_type=INSTANCE_TYPE_STATE,
            state=entry.data[CONF_STATE],
        )
    elif instance_type == INSTANCE_TYPE_ZONE:
        coordinator = ABCEmergencyCoordinator(
            hass,
            client,
            entry,
            instance_type=INSTANCE_TYPE_ZONE,
            latitude=entry.data[CONF_LATITUDE],
            longitude=entry.data[CONF_LONGITUDE],
        )
    elif instance_type == INSTANCE_TYPE_PERSON:
        coordinator = ABCEmergencyCoordinator(
            hass,
            client,
            entry,
            instance_type=INSTANCE_TYPE_PERSON,
            person_entity_id=entry.data[CONF_PERSON_ENTITY_ID],
        )
    else:
        _LOGGER.error("Unknown instance type: %s", instance_type)
        return False

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for options
    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    Args:
        hass: Home Assistant instance.
        entry: Config entry being unloaded.

    Returns:
        True if unload was successful.
    """
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update.

    Args:
        hass: Home Assistant instance.
        entry: Config entry with updated options.
    """
    await hass.config_entries.async_reload(entry.entry_id)


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate old entry.

    Args:
        hass: Home Assistant instance.
        entry: Config entry to migrate.

    Returns:
        True if migration was successful.
    """
    _LOGGER.debug("Migrating from version %s", entry.version)

    if entry.version == 1:
        # V1 had single state, needs conversion to state instance type
        new_data = dict(entry.data)
        new_data[CONF_INSTANCE_TYPE] = INSTANCE_TYPE_STATE

        # Rename 'state' field if present (CONF_STATE == "state" so this is no-op)
        if CONF_STATE not in new_data and "state" in new_data:  # pragma: no cover
            new_data[CONF_STATE] = new_data.pop("state")

        hass.config_entries.async_update_entry(entry, data=new_data, version=3)
        _LOGGER.info("Migration from v1 to v3 successful")

    if entry.version == 2:
        # V2 had multi-state support with zone, needs split into separate instances
        # For migration, we convert to a state instance for the first state
        old_data = dict(entry.data)
        v2_data: dict[str, object] = {
            CONF_INSTANCE_TYPE: INSTANCE_TYPE_STATE,
        }

        # Get the first state from the states list
        states = old_data.get("states", [])
        if states:
            v2_data[CONF_STATE] = cast(list[str], states)[0]
        else:
            # No states configured, can't migrate
            _LOGGER.error("Cannot migrate v2 entry: no states configured")
            return False

        hass.config_entries.async_update_entry(entry, data=v2_data, version=3)
        _LOGGER.info("Migration from v2 to v3 successful (first state only)")

    return True
