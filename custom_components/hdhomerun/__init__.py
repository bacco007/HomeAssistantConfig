""""""

# region #-- imports --#
import logging
from datetime import timedelta
from typing import (
    List,
)

import homeassistant.helpers.entity_registry as er
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    CoordinatorEntity,
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
from .hdhomerun import (
    DEF_DISCOVER,
    HDHomeRunDevice,
    HDHomeRunExceptionOldFirmware,
)
from .logger import HDHomerunLogger

# endregion

_LOGGER = logging.getLogger(__name__)


async def _async_reload(hass: HomeAssistant, config_entry: ConfigEntry):
    """Reload the config entry

    :param hass:
    :param config_entry:
    :return:
    """

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

    hdhomerun_device = HDHomeRunDevice(
        host=config_entry.data.get(CONF_HOST),
        loop=hass.loop,
        session=async_get_clientsession(hass=hass),
    )
    try:
        await hdhomerun_device.get_details(
            include_discover=True,
            include_tuner_status=True,
        )
    except HDHomeRunExceptionOldFirmware as err:
        _LOGGER.warning(log_formatter.message_format("%s"), err)
        tuner_coordinator = False
    except Exception as err:
        raise ConfigEntryNotReady from err

    # region #-- set up the coordinators --#
    async def _async_data_coordinator_update() -> HDHomeRunDevice:
        """"""

        try:
            await hdhomerun_device.get_details(
                include_discover=True,
                include_lineups=True,
            )
        except HDHomeRunExceptionOldFirmware as exc:
            _LOGGER.warning(log_formatter.message_format("%s"), exc)

        return hdhomerun_device

    async def _async_data_coordinator_tuner_status_update() -> HDHomeRunDevice:
        """"""

        try:
            await hdhomerun_device.get_details(
                include_tuner_status=True,
            )
        except HDHomeRunExceptionOldFirmware as exc:
            _LOGGER.warning(log_formatter.message_format("%s"), exc)

        return hdhomerun_device

    coordinator_general: DataUpdateCoordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_general",
        update_method=_async_data_coordinator_update,
        update_interval=timedelta(seconds=config_entry.options.get(CONF_SCAN_INTERVAL, DEF_SCAN_INTERVAL_SECS)),
    )
    hass.data[DOMAIN][config_entry.entry_id][CONF_DATA_COORDINATOR_GENERAL] = coordinator_general
    await coordinator_general.async_config_entry_first_refresh()

    if tuner_coordinator:
        coordinator_tuner_status: DataUpdateCoordinator = DataUpdateCoordinator(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_tuner_status",
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
        self._data: HDHomeRunDevice = self.coordinator.data

    @property
    def device_info(self) -> DeviceInfo:
        """Return the device information of the entity."""

        # noinspection HttpUrlsUsage
        return DeviceInfo(
            configuration_url=f"http://{self._config.data.get('host')}",
            identifiers={(DOMAIN, self._config.unique_id)},
            manufacturer="SiliconDust",
            model=self._data.model if self._data else "",
            name=self._config.title,
            sw_version=self._data.current_firmware if self._data else "",
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
