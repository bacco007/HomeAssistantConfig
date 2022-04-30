""""""

# region #-- imports --#
import logging
from datetime import timedelta
from typing import (
    List,
)

import homeassistant.helpers.entity_registry as er
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigEntryNotReady,
)
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    CoordinatorEntity,
    UpdateFailed,
)

from .const import (
    CONF_DATA_COORDINATOR_GENERAL,
    CONF_DATA_COORDINATOR_TUNER_STATUS,
    CONF_SCAN_INTERVAL_TUNER_STATUS,
    CONF_HOST,
    DEF_SCAN_INTERVAL_SECS,
    DEF_SCAN_INTERVAL_TUNER_STATUS_SECS,
    DOMAIN,
    PLATFORMS,
)
from .logger import HDHomerunLogger
from .pyhdhr import HDHomeRunDevice

# endregion

_LOGGER = logging.getLogger(__name__)


async def _async_reload(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Reload the config entry"""

    return await hass.config_entries.async_reload(config_entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Setup a config entry"""

    tuner_coordinator: bool = True
    log_formatter = HDHomerunLogger(unique_id=config_entry.unique_id)
    _LOGGER.debug(log_formatter.message_format("entered"))

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault(config_entry.entry_id, {})

    # listen for options updates
    config_entry.async_on_unload(
        config_entry.add_update_listener(_async_reload)
    )

    hdhomerun_device: HDHomeRunDevice = HDHomeRunDevice(host=config_entry.data.get(CONF_HOST))
    if config_entry.source == "ssdp":  # force the discovery url because this should be available
        # noinspection HttpUrlsUsage
        setattr(hdhomerun_device, "_discover_url", f"http://{hdhomerun_device.ip}/discover.json")

    try:
        await hdhomerun_device.async_rediscover()
    except Exception as err:
        raise ConfigEntryNotReady(str(err))

    if not hdhomerun_device.online:
        raise ConfigEntryNotReady("Not currently online.")

    # region #-- set up the coordinators --#
    async def _async_data_coordinator_update() -> HDHomeRunDevice:
        """"""

        try:
            await hdhomerun_device.async_rediscover()
        except Exception as exc:
            _LOGGER.warning(log_formatter.message_format("%s"), exc)
            raise UpdateFailed(str(exc))

        return hdhomerun_device

    async def _async_data_coordinator_tuner_status_update() -> HDHomeRunDevice:
        """"""

        try:
            await hdhomerun_device.async_tuner_refresh()
        except Exception as exc:
            _LOGGER.warning(log_formatter.message_format("%s"), exc)
            raise UpdateFailed(str(exc))

        return hdhomerun_device

    coordinator_general: DataUpdateCoordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_{config_entry.unique_id}",
        update_method=_async_data_coordinator_update,
        update_interval=timedelta(seconds=config_entry.options.get(CONF_SCAN_INTERVAL, DEF_SCAN_INTERVAL_SECS)),
    )
    hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL] = coordinator_general
    await coordinator_general.async_config_entry_first_refresh()

    if tuner_coordinator:
        coordinator_tuner_status: DataUpdateCoordinator = DataUpdateCoordinator(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_tuner_status_{config_entry.unique_id}",
            update_method=_async_data_coordinator_tuner_status_update,
            update_interval=timedelta(
                seconds=config_entry.options.get(CONF_SCAN_INTERVAL_TUNER_STATUS, DEF_SCAN_INTERVAL_TUNER_STATUS_SECS)
            ),
        )
        hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_TUNER_STATUS] = coordinator_tuner_status
        await coordinator_tuner_status.async_config_entry_first_refresh()
    # endregion

    # region #-- setup the platforms --#
    setup_platforms: List[str] = list(filter(None, PLATFORMS))
    _LOGGER.debug(log_formatter.message_format("setting up platforms: %s"), setup_platforms)
    hass.config_entries.async_setup_platforms(config_entry, setup_platforms)
    # endregion

    _LOGGER.debug(log_formatter.message_format("exited"))
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Cleanup when unloading a config entry"""

    # region #-- clean up the platforms --#
    setup_platforms: List[str] = list(filter(None, PLATFORMS))
    ret = await hass.config_entries.async_unload_platforms(config_entry, setup_platforms)
    if ret:
        hass.data[DOMAIN].pop(config_entry.entry_id)
        ret = True
    else:
        ret = False
    # endregion

    return ret


# region #-- base entity --#
class HDHomerunEntity(CoordinatorEntity):
    """"""

    def __init__(self, coordinator: DataUpdateCoordinator, config_entry: ConfigEntry) -> None:
        """Initialize the entity"""

        super().__init__(coordinator)
        self._config: ConfigEntry = config_entry
        self._device: HDHomeRunDevice = self.coordinator.data

    def _handle_coordinator_update(self) -> None:
        """Update the device information when the coordinator updates"""

        self._device: HDHomeRunDevice = self.coordinator.data
        super()._handle_coordinator_update()

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
    config_entry: ConfigEntry,
    entities: List[HDHomerunEntity],
    hass: HomeAssistant
):
    """"""

    log_formatter = HDHomerunLogger(unique_id=config_entry.unique_id, prefix=f"{entities[0].__class__.__name__} --> ")
    _LOGGER.debug(log_formatter.message_format("entered"))

    entity_registry: er.EntityRegistry = er.async_get(hass=hass)
    er_entries: List[er.RegistryEntry] = er.async_entries_for_config_entry(
        registry=entity_registry,
        config_entry_id=config_entry.entry_id
    )

    cleanup_unique_ids = [e.unique_id for e in entities]
    for entity in er_entries:
        if entity.unique_id not in cleanup_unique_ids:
            continue

        # remove the entity
        _LOGGER.debug(log_formatter.message_format("removing %s"), entity.entity_id)
        entity_registry.async_remove(entity_id=entity.entity_id)

    _LOGGER.debug(log_formatter.message_format("exited"))
# endregion
