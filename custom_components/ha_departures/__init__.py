"""Custom integration to integrate Public Transport Departures with Home Assistant.

For more details about this integration, please refer to
https://github.com/alex-jung/ha-departures
"""

import logging
from dataclasses import dataclass

import homeassistant.helpers.config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.core_config import Config
from homeassistant.exceptions import ConfigEntryNotReady

from .const import DOMAIN, STARTUP_MESSAGE
from .coordinator import DeparturesDataUpdateCoordinator

_LOGGER: logging.Logger = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


@dataclass
class RuntimeData:
    """Data class for runtime data."""

    coordinator: DeparturesDataUpdateCoordinator


async def async_setup(hass: HomeAssistant, config: Config):
    """Set up this integration using YAML is not supported."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up this integration using UI."""

    _LOGGER.info(STARTUP_MESSAGE)

    coordinator = DeparturesDataUpdateCoordinator(hass, entry)

    await coordinator.async_config_entry_first_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady("Failed to get data from server")

    entry.runtime_data = RuntimeData(coordinator)

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def _async_update_listener(hass: HomeAssistant, entry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload ha-departures config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
