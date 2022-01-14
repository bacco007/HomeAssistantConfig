# NSW Rural Fire Service Fire Danger.
import logging
from datetime import timedelta

import voluptuous as vol
import xmltodict
from homeassistant.components.rest.data import RestData
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL, EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from pyexpat import ExpatError

from .config_flow import configured_instances
from .const import (
    CONF_DISTRICT_NAME,
    DEFAULT_METHOD,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    PLATFORMS,
    SENSOR_ATTRIBUTES,
    URL_DATA,
    XML_DISTRICT,
    XML_FIRE_DANGER_MAP,
    XML_NAME,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_DISTRICT_NAME): cv.string,
                vol.Optional(
                    CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
                ): cv.time_period,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the NSW Rural Fire Service Fire Danger component."""
    if DOMAIN not in config:
        return True

    conf = config[DOMAIN]
    district_name = conf.get[CONF_DISTRICT_NAME]
    scan_interval = conf[CONF_SCAN_INTERVAL]
    identifier = f"{district_name}"
    if identifier in configured_instances(hass):
        return True

    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": SOURCE_IMPORT},
            data={CONF_DISTRICT_NAME: district_name, CONF_SCAN_INTERVAL: scan_interval},
        )
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the NSW Rural Fire Service Fire Danger component as config entry."""
    hass.data.setdefault(DOMAIN, {})
    # Create feed coordinator for all platforms.
    coordinator = NswRfsFireDangerFeedCoordinator(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = coordinator
    _LOGGER.debug("Feed coordinator added for %s", entry.entry_id)

    async def _enable_scheduled_updates(*_):
        """Activate the data update coordinator."""
        scan_interval = entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        if isinstance(scan_interval, int):
            coordinator.update_interval = timedelta(minutes=scan_interval)
        else:
            coordinator.update_interval = scan_interval
        await coordinator.async_refresh()

    if hass.state == CoreState.running:
        await _enable_scheduled_updates()
    else:
        # Run updates only after server is started.
        hass.bus.async_listen_once(
            EVENT_HOMEASSISTANT_STARTED, _enable_scheduled_updates
        )

    hass.config_entries.async_setup_platforms(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload an NSW Rural Fire Service Fire Danger component config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok


class NswRfsFireDangerFeedCoordinator(DataUpdateCoordinator):
    """Feed Entity Manager for NSW Rural Fire Service Fire Danger feed."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the Feed Entity Manager."""
        self.hass = hass
        self.config_entry: ConfigEntry = config_entry
        self._district_name = config_entry.data[CONF_DISTRICT_NAME]
        self._config_entry_id = config_entry.entry_id
        self._scan_interval = timedelta(seconds=config_entry.data[CONF_SCAN_INTERVAL])
        self._rest = RestData(
            hass, DEFAULT_METHOD, URL_DATA, None, None, None, None, DEFAULT_VERIFY_SSL
        )
        # self._attributes = None
        super().__init__(
            self.hass,
            _LOGGER,
            name=DOMAIN,
            update_method=self.async_update,
        )

    @property
    def district_name(self) -> str:
        """Return the district name of the coordinator."""
        return self._district_name

    @staticmethod
    def _attribute_in_structure(obj, keys):
        """Return the attribute found under the chain of keys."""
        key = keys.pop(0)
        if key in obj:
            return (
                NswRfsFireDangerFeedCoordinator._attribute_in_structure(obj[key], keys)
                if keys
                else obj[key]
            )

    async def async_update(self) -> dict[str, str]:
        """Get the latest data from REST API and update the state."""
        _LOGGER.debug("Start updating feed")
        await self._rest.async_update()
        value = self._rest.data
        attributes = {}
        if value:
            try:
                value = xmltodict.parse(value)
                districts = self._attribute_in_structure(
                    value, [XML_FIRE_DANGER_MAP, XML_DISTRICT]
                )
                if districts and isinstance(districts, list):
                    for district in districts:
                        if XML_NAME in district:
                            district_name = district.get(XML_NAME)
                            if district_name == self._district_name:
                                # Found it.
                                for key in SENSOR_ATTRIBUTES:
                                    if key in district:
                                        text_value = district.get(key)
                                        conversion = SENSOR_ATTRIBUTES[key][1]
                                        if conversion:
                                            text_value = conversion(text_value)
                                        attributes[
                                            SENSOR_ATTRIBUTES[key][0]
                                        ] = text_value
                                break
            except ExpatError as ex:
                _LOGGER.warning("Unable to parse feed data: %s", ex)
        return attributes
