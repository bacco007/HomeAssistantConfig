"""The HDHomerun integration."""

# region #-- imports --#
import logging
from datetime import timedelta
from typing import List

import homeassistant.helpers.entity_registry as er
from homeassistant.config_entries import ConfigEntry, ConfigEntryNotReady
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util import slugify

from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    CONF_DATA_COORDINATOR_TUNER_STATUS,
    CONF_DEVICE,
    CONF_HOST,
    CONF_SCAN_INTERVAL_TUNER_STATUS,
    DEF_SCAN_INTERVAL_SECS,
    DEF_SCAN_INTERVAL_TUNER_STATUS_SECS,
    DOMAIN,
    ENTITY_SLUG,
    PLATFORMS,
    SIGNAL_HDHOMERUN_DEVICE_AVAILABILITY,
)
from .logger import Logger
from .pyhdhr import HDHomeRunDevice

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

    hass.data[DOMAIN][config_entry.entry_id][
        CONF_DEVICE
    ]: HDHomeRunDevice = HDHomeRunDevice(host=config_entry.data.get(CONF_HOST))
    if (
        config_entry.source == "ssdp"
    ):  # force the discovery url because this should be available
        setattr(
            hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE],
            "_discover_url",
            f"http://{hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE].ip}/discover.json",
        )

    # region #-- set up the coordinators --#
    async def _async_data_coordinator_update() -> bool:
        """Update routine for the general details DataUpdateCoordinator."""
        try:
            hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE] = await hass.data[
                DOMAIN
            ][config_entry.entry_id][CONF_DEVICE].async_rediscover()
        except Exception as exc:
            _LOGGER.warning(log_formatter.format("%s"), exc)
            raise UpdateFailed(str(exc)) from exc

        return True

    async def _async_data_coordinator_tuner_status_update() -> bool:
        """Update routine for the tuner status DataUpdateCoordinator."""
        previous_availability: bool = hass.data[DOMAIN][config_entry.entry_id][
            CONF_DEVICE
        ].online
        try:
            await hass.data[DOMAIN][config_entry.entry_id][
                CONF_DEVICE
            ].async_tuner_refresh()
        except Exception as exc:
            _LOGGER.warning(log_formatter.format("%s"), exc)
            raise UpdateFailed(str(exc)) from exc

        if (
            previous_availability
            != hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE].online
        ):
            _LOGGER.debug(log_formatter.format("sending availability signal"))
            async_dispatcher_send(hass, SIGNAL_HDHOMERUN_DEVICE_AVAILABILITY)

        return True

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

    if not hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE].online:
        raise ConfigEntryNotReady("Not currently online.")

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

    if not hass.data[DOMAIN][config_entry.entry_id][CONF_DEVICE].online:
        raise ConfigEntryNotReady("Not currently online.")
    # endregion

    # region #-- setup the platforms --#
    setup_platforms: List[str] = list(filter(None, PLATFORMS))
    _LOGGER.debug(log_formatter.format("setting up platforms: %s"), setup_platforms)
    # TODO: remove try/except when minimum version is 2022.8.0
    try:
        await hass.config_entries.async_forward_entry_setups(
            config_entry, setup_platforms
        )
    except AttributeError:
        hass.config_entries.async_setup_platforms(config_entry, setup_platforms)
    # endregion

    _LOGGER.debug(log_formatter.format("exited"))
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Cleanup when unloading a config entry."""
    # region #-- clean up the platforms --#
    setup_platforms: List[str] = list(filter(None, PLATFORMS))
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
        hass: HomeAssistant,
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self._config: ConfigEntry = config_entry
        self._hass: HomeAssistant = hass
        self._device: HDHomeRunDevice = self._hass.data[DOMAIN][self._config.entry_id][
            CONF_DEVICE
        ]

        self.entity_description = description

        if not getattr(self, "entity_domain", None):
            self.entity_domain: str = ""

        try:
            _ = self.has_entity_name
            self._attr_has_entity_name = True
            self._attr_name = self.entity_description.name
        except AttributeError:
            self._attr_name = (
                f"{ENTITY_SLUG} "
                f"{config_entry.title.replace(ENTITY_SLUG, '').strip()}: "
                f"{self.entity_description.name}"
            )

        self._attr_unique_id = (
            f"{config_entry.unique_id}::"
            f"{self.entity_domain.lower()}::"
            f"{slugify(self.entity_description.name)}"
        )

    def _handle_coordinator_update(self) -> None:
        """Update the information when the coordinator updates."""
        self._device = self._hass.data[DOMAIN][self._config.entry_id][CONF_DEVICE]
        super()._handle_coordinator_update()

    async def async_added_to_hass(self) -> None:
        """Do stuff when entity is added to registry."""
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                hass=self._hass,
                signal=SIGNAL_HDHOMERUN_DEVICE_AVAILABILITY,
                target=self.async_update_ha_state,
            )
        )

    @property
    def available(self) -> bool:
        """Get with the device is available to read state info."""
        return self._device.online

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device information of the entity."""
        # noinspection HttpUrlsUsage
        return DeviceInfo(
            configuration_url=self._device.base_url,
            identifiers={(DOMAIN, self._config.unique_id)},
            manufacturer="SiliconDust",
            model=self._device.model if self._device else "",
            name=self._config.title,
            sw_version=self._device.installed_version if self._device else "",
        )


# endregion


# region #-- cleanup entities --#
def entity_cleanup(
    config_entry: ConfigEntry, entities: List[HDHomerunEntity], hass: HomeAssistant
):
    """Remove entities from the registry if they are no longer needed."""
    log_formatter = Logger(
        unique_id=config_entry.unique_id,
        prefix=f"{entities[0].__class__.__name__} --> ",
    )
    _LOGGER.debug(log_formatter.format("entered"))

    entity_registry: er.EntityRegistry = er.async_get(hass=hass)
    er_entries: List[er.RegistryEntry] = er.async_entries_for_config_entry(
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
