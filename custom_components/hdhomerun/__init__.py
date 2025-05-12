"""The HDHomerun integration."""

# region #-- imports --#
from __future__ import annotations

import logging
from collections.abc import Mapping
from datetime import timedelta
from typing import Any, Callable

import homeassistant.helpers.device_registry as dr
import homeassistant.helpers.entity_registry as er
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util import slugify

from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    CONF_DATA_COORDINATOR_TUNER_STATUS,
    CONF_DISCOVERY_MODE,
    CONF_HOST,
    CONF_SCAN_INTERVAL_TUNER_STATUS,
    DEF_DISCOVERY_MODE,
    DEF_SCAN_INTERVAL_SECS,
    DEF_SCAN_INTERVAL_TUNER_STATUS_SECS,
    DOMAIN,
    PLATFORMS,
)
from .logger import Logger
from .pyhdhr.const import DiscoverMode
from .pyhdhr.discover import Discover, HDHomeRunDevice

# endregion

_LOGGER = logging.getLogger(__name__)


async def _async_reload(hass: HomeAssistant, config_entry: ConfigEntry) -> None:
    """Reload the config entry."""
    await hass.config_entries.async_reload(config_entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Create a config entry."""
    log_formatter = Logger(unique_id=config_entry.unique_id)
    _LOGGER.debug(log_formatter.format("entered"))

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault(config_entry.entry_id, {})

    # listen for options updates
    config_entry.async_on_unload(config_entry.add_update_listener(_async_reload))

    # region #-- set up the coordinators --#
    async def _async_data_coordinator_update() -> bool:
        """Update routine for the general details DataUpdateCoordinator."""
        device: list[HDHomeRunDevice] | HDHomeRunDevice | None = None
        try:
            if (
                device := hass.data[DOMAIN][config_entry.entry_id][
                    CONF_DATA_COORDINATOR_GENERAL
                ].data
            ) is None:
                device = await Discover(
                    broadcast_address=config_entry.data.get(CONF_HOST),
                    mode=DiscoverMode(
                        config_entry.options.get(
                            CONF_DISCOVERY_MODE, DEF_DISCOVERY_MODE.value
                        )
                    ),
                    session=async_get_clientsession(hass=hass),
                ).async_discover()
                if device:
                    device = device[0]
            await device.async_gather_details()
            device_registry: dr.DeviceRegistry = dr.async_get(hass=hass)
            device_entry: list[dr.DeviceEntry] = [
                device_details
                for _, device_details in device_registry.devices.items()
                if (DOMAIN, config_entry.unique_id) in device_details.identifiers
            ]
            if device_entry:
                if device.installed_version != device_entry[0].sw_version:
                    _LOGGER.debug(
                        log_formatter.format(
                            "Firmware version changed from %s to %s, updating device"
                        ),
                        device_entry[0].sw_version,
                        device.installed_version,
                    )

                    device_registry.async_update_device(
                        device_id=device_entry[0].id,
                        sw_version=device.installed_version,
                    )
        except Exception as exc:
            _LOGGER.warning(log_formatter.format("%s"), exc)
            raise UpdateFailed(str(exc)) from exc

        return device

    async def _async_data_coordinator_tuner_status_update() -> bool:
        """Update routine for the tuner status DataUpdateCoordinator."""
        device: list[HDHomeRunDevice] | HDHomeRunDevice | None = None
        try:
            if (
                device := hass.data[DOMAIN][config_entry.entry_id][
                    CONF_DATA_COORDINATOR_TUNER_STATUS
                ].data
            ) is None:
                device = await Discover(
                    broadcast_address=config_entry.data.get(CONF_HOST),
                    mode=DiscoverMode(
                        config_entry.options.get(
                            CONF_DISCOVERY_MODE, DEF_DISCOVERY_MODE.value
                        )
                    ),
                    session=async_get_clientsession(hass=hass),
                ).async_discover()
                if device:
                    device = device[0]
            await device.async_gather_details()
            await device.async_refresh_tuner_status()
        except Exception as exc:
            _LOGGER.warning(log_formatter.format("%s"), exc)
            raise UpdateFailed(str(exc)) from exc

        return device

    coordinator_general: DataUpdateCoordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_{config_entry.unique_id}",
        update_method=_async_data_coordinator_update,
        update_interval=timedelta(
            seconds=config_entry.options.get(CONF_SCAN_INTERVAL, DEF_SCAN_INTERVAL_SECS)
        ),
    )
    hass.data[DOMAIN][config_entry.entry_id][
        CONF_DATA_COORDINATOR_GENERAL
    ] = coordinator_general
    await coordinator_general.async_config_entry_first_refresh()

    coordinator_tuner_status: DataUpdateCoordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_tuner_status_{config_entry.unique_id}",
        update_method=_async_data_coordinator_tuner_status_update,
        update_interval=timedelta(
            seconds=config_entry.options.get(
                CONF_SCAN_INTERVAL_TUNER_STATUS, DEF_SCAN_INTERVAL_TUNER_STATUS_SECS
            )
        ),
    )
    hass.data[DOMAIN][config_entry.entry_id][
        CONF_DATA_COORDINATOR_TUNER_STATUS
    ] = coordinator_tuner_status
    await coordinator_tuner_status.async_config_entry_first_refresh()
    # endregion

    # region #-- setup the platforms --#
    setup_platforms: list[str] = list(filter(None, PLATFORMS))
    _LOGGER.debug(log_formatter.format("setting up platforms: %s"), setup_platforms)
    await hass.config_entries.async_forward_entry_setups(config_entry, setup_platforms)
    # endregion

    _LOGGER.debug(log_formatter.format("exited"))
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Cleanup when unloading a config entry."""
    # region #-- clean up the platforms --#
    setup_platforms: list[str] = list(filter(None, PLATFORMS))
    ret = await hass.config_entries.async_unload_platforms(
        config_entry, setup_platforms
    )
    if ret:
        hass.data[DOMAIN].pop(config_entry.entry_id)
        ret = True
    else:
        ret = False
    # endregion

    return ret


# region #-- base entity --#
class HDHomerunEntity(CoordinatorEntity):
    """Representation of an HDHomerun entity."""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)

        self._config: ConfigEntry = config_entry

        self.entity_description = description

        if not getattr(self, "entity_domain", None):
            self.entity_domain: str = ""

        self._attr_has_entity_name = True
        self._attr_unique_id = (
            f"{config_entry.unique_id}::"
            f"{self.entity_domain.lower()}::"
            f"{slugify(self.entity_description.name)}"
        )

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device information of the entity."""
        return DeviceInfo(
            configuration_url=self.coordinator.data.base_url,
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, self._config.unique_id)},
            manufacturer=f"SiliconDust ({self.coordinator.data.discovery_method.name})",
            model=self.coordinator.data.model if self.coordinator.data else "",
            name=self._config.title,
            sw_version=(
                self.coordinator.data.installed_version if self.coordinator.data else ""
            ),
        )

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Additional attributes for the entity."""
        if hasattr(self.entity_description, "extra_attributes") and isinstance(
            self.entity_description.extra_attributes, Callable
        ):
            return self.entity_description.extra_attributes(self.coordinator.data)

        return None


class HDHomerunTunerEntity(CoordinatorEntity):
    """Representation of an HDHomerun Tuner entity."""

    def __init__(
        self,
        config_entry: ConfigEntry,
        coordinator: DataUpdateCoordinator,
        description,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)

        self._config: ConfigEntry = config_entry

        self.entity_description = description

        if not getattr(self, "entity_domain", None):
            self.entity_domain: str = ""

        self._attr_has_entity_name = False
        self._attr_unique_id = (
            f"{config_entry.unique_id}::"
            f"{self.entity_domain.lower()}::"
            f"{slugify(self.entity_description.name)}"
        )

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device information of the entity."""
        return DeviceInfo(
            identifiers={(DOMAIN, f"{self._config.unique_id}_{self._device_name}")},
            manufacturer=f"SiliconDust ({self.coordinator.data.discovery_method.name})",
            model=self.coordinator.data.model if self.coordinator.data else "",
            name=self._device_name,
            via_device=(DOMAIN, self._config.unique_id),
        )

    @property
    def extra_state_attributes(self) -> Mapping[str, Any] | None:
        """Additional attributes for the entity."""
        if hasattr(self.entity_description, "extra_attributes") and isinstance(
            self.entity_description.extra_attributes, Callable
        ):
            return self.entity_description.extra_attributes(self.coordinator.data)

        return None


# endregion


# region #-- cleanup entities --#
def entity_cleanup(
    config_entry: ConfigEntry, entities: list[HDHomerunEntity], hass: HomeAssistant
):
    """Remove entities from the registry if they are no longer needed."""
    log_formatter = Logger(
        unique_id=config_entry.unique_id,
        prefix=f"{entities[0].__class__.__name__} --> ",
    )
    _LOGGER.debug(log_formatter.format("entered"))

    entity_registry: er.EntityRegistry = er.async_get(hass=hass)
    er_entries: list[er.RegistryEntry] = er.async_entries_for_config_entry(
        registry=entity_registry, config_entry_id=config_entry.entry_id
    )

    cleanup_unique_ids = [e.unique_id for e in entities]
    for entity in er_entries:
        if entity.unique_id not in cleanup_unique_ids:
            continue

        # remove the entity
        _LOGGER.debug(log_formatter.format("removing %s"), entity.entity_id)
        entity_registry.async_remove(entity_id=entity.entity_id)

    _LOGGER.debug(log_formatter.format("exited"))


# endregion
