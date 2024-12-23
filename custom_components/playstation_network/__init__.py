"""The PSN integration."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import discovery
from homeassistant.helpers import entity_registry as er
from psnawp_api.core.psnawp_exceptions import PSNAWPAuthenticationError
from psnawp_api.psnawp import PSNAWP

from .const import DOMAIN, PSN_API, PSN_COORDINATOR, CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES
from .coordinator import PsnCoordinator

PLATFORMS: list[Platform] = [
    Platform.MEDIA_PLAYER,
    Platform.SENSOR,
    # Platform.BINARY_SENSOR,
    Platform.IMAGE,
]

_LOGGER: logging.Logger = logging.getLogger(__package__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up PSN from a config entry."""

    try:
        npsso = entry.data.get("npsso")
        psn = PSNAWP(npsso)
    except PSNAWPAuthenticationError as error:
        raise ConfigEntryAuthFailed(error) from error
    except Exception as ex:
        raise ConfigEntryNotReady(ex) from ex

    try:
        user = await hass.async_add_executor_job(lambda: psn.user(online_id="me"))
        client = psn.me()
        coordinator = PsnCoordinator(hass, psn, user, client)
    except PSNAWPAuthenticationError as error:
        raise ConfigEntryAuthFailed(error) from error
    except Exception as ex:
        raise ConfigEntryNotReady(ex) from ex

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        PSN_COORDINATOR: coordinator,
        PSN_API: psn,
    }

    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=user.online_id)
    await coordinator.async_config_entry_first_refresh()

    hass.async_create_task(
        discovery.async_load_platform(
            hass,
            Platform.NOTIFY,
            DOMAIN,
            {CONF_NAME: entry.title, "entry_id": entry.entry_id},
            hass.data[DOMAIN],
        )
    )

    @callback
    def async_migrate_entity_entry(entry: er.RegistryEntry) -> dict[str, Any] | None:
        """Migrate PSN entity entries.

        - Migrates old unique ID's from old sensors and media players to the new unique ID's
        """
        if entry.domain == Platform.SENSOR and entry.unique_id == "psn_psn_status":
            new = f"{coordinator.data.get("username").lower()}_psn_status"
            return {"new_unique_id": entry.unique_id.replace("psn_psn_status", new)}

        if entry.domain == Platform.SENSOR and entry.unique_id == "psn_psn_trophies":
            new = f"{coordinator.data.get("username").lower()}_psn_trophy_level"
            return {"new_unique_id": entry.unique_id.replace("psn_psn_trophies", new)}
        if entry.domain == Platform.MEDIA_PLAYER and entry.unique_id == "PS5_console":
            new = f"{coordinator.data.get('username').lower()}_{coordinator.data.get('platform').get('platform').lower()}_console"
            return {"new_unique_id": entry.unique_id.replace("PS5_console", new)}

        # No migration needed
        return None

    # Migrate unique ID -- Make the ID actually Unique.
    # Migrate Device Name -- Make the device name match the psn username
    # We can remove this logic after a reasonable period of time has passed.
    if entry.version == 1:
        await er.async_migrate_entries(hass, entry.entry_id, async_migrate_entity_entry)
        _migrate_device_identifiers(hass, entry.entry_id, coordinator)
        hass.config_entries.async_update_entry(entry, version=2)

    if entry.version < 3:
        _remove_option_sensor(hass, entry, coordinator)
        hass.config_entries.async_update_entry(entry, version=3)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def update_listener(hass: HomeAssistant, entry: ConfigEntry):
    """Update Listener."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_migrate_entry(hass: HomeAssistant, self):
    """Migrate Entry Support"""
    return True


def _migrate_device_identifiers(
    hass: HomeAssistant, entry_id: str, coordinator
) -> None:
    """Migrate old device identifiers."""
    dev_reg = dr.async_get(hass)
    devices: list[dr.DeviceEntry] = dr.async_entries_for_config_entry(dev_reg, entry_id)
    for device in devices:
        old_identifier = list(next(iter(device.identifiers)))
        if old_identifier[1] == "PSN":
            new_identifier = {(DOMAIN, coordinator.data.get("username"))}
            _LOGGER.debug(
                "migrate identifier '%s' to '%s'", device.identifiers, new_identifier
            )
            dev_reg.async_update_device(device.id, new_identifiers=new_identifier)


def _remove_option_sensor(
    hass: HomeAssistant, entry: ConfigEntry, coordinator: PsnCoordinator
) -> None:
    if entry.options.get(CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES) is True:
        entity_registry = er.async_get(hass)
        entity_id = entity_registry.async_get_entity_id(
            "sensor",
            DOMAIN,
            f"{coordinator.data.get("username").lower()}_psn_about_me_attr",
        )
        if entity_id:
            entity_registry.async_remove(entity_id)
