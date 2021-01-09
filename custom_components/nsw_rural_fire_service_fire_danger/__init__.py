# NSW Rural Fire Service Fire Danger.
import asyncio
import logging
from datetime import timedelta

import voluptuous as vol
import xmltodict
from homeassistant.components.rest.data import RestData
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import (
    CONF_SCAN_INTERVAL,
    MAJOR_VERSION,
    MINOR_VERSION,
    STATE_OK,
    STATE_UNKNOWN,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType
from pyexpat import ExpatError

from .config_flow import configured_instances
from .const import (
    COMPONENTS,
    CONF_DISTRICT_NAME,
    DEFAULT_METHOD,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    SENSOR_ATTRIBUTES,
    URL,
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


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    """Set up the NSW Rural Fire Service Fire Danger component as config entry."""
    hass.data.setdefault(DOMAIN, {})
    # Create feed entity manager for all platforms.
    manager = NswRfsFireDangerFeedEntityManager(hass, config_entry)
    hass.data[DOMAIN][config_entry.entry_id] = manager
    _LOGGER.debug("Feed entity manager added for %s", config_entry.entry_id)
    await manager.async_init()
    await manager.async_update()
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    """Unload an NSW Rural Fire Service Fire Danger component config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(config_entry, component)
                for component in COMPONENTS
            ]
        )
    )
    if unload_ok:
        manager = hass.data[DOMAIN].pop(config_entry.entry_id)
        await manager.async_stop()
    return unload_ok


class NswRfsFireDangerFeedEntityManager:
    """Feed Entity Manager for NSW Rural Fire Service Fire Danger feed."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry):
        """Initialize the Feed Entity Manager."""
        self._hass = hass
        self._config_entry = config_entry
        self._district_name = config_entry.data[CONF_DISTRICT_NAME]
        self._config_entry_id = config_entry.entry_id
        self._scan_interval = timedelta(seconds=config_entry.data[CONF_SCAN_INTERVAL])
        self._track_time_remove_callback = None
        # Distinguish multiple cases:
        # 1. If version <= 0.118: 6 arguments
        # 2. If version >= 0.119 and <= 2020.12: 7 arguments (added 'params' as 6th)
        # 3. If version >= 2021.1: 8 arguments (added 'hass' as 1st)
        if MAJOR_VERSION >= 2021:
            self._rest = RestData(
                hass, DEFAULT_METHOD, URL, None, None, None, None, DEFAULT_VERIFY_SSL
            )
        elif MAJOR_VERSION >= 1 or MINOR_VERSION >= 119:
            self._rest = RestData(
                DEFAULT_METHOD, URL, None, None, None, None, DEFAULT_VERIFY_SSL
            )
        else:
            self._rest = RestData(
                DEFAULT_METHOD, URL, None, None, None, DEFAULT_VERIFY_SSL
            )
        self._attributes = None

    @property
    def district_name(self) -> str:
        """Return the district name of the manager."""
        return self._district_name

    @property
    def attributes(self):
        """Return the district name of the manager."""
        return self._attributes

    async def async_init(self):
        """Schedule initial and regular updates based on configured time interval."""

        for component in COMPONENTS:
            self._hass.async_create_task(
                self._hass.config_entries.async_forward_entry_setup(
                    self._config_entry, component
                )
            )

        async def update(event_time):
            """Update."""
            await self.async_update()

        # Trigger updates at regular intervals.
        self._track_time_remove_callback = async_track_time_interval(
            self._hass, update, self._scan_interval
        )

        _LOGGER.debug("Feed entity manager initialized")

    @staticmethod
    def _attribute_in_structure(obj, keys):
        """Return the attribute found under the chain of keys."""
        key = keys.pop(0)
        if key in obj:
            return (
                NswRfsFireDangerFeedEntityManager._attribute_in_structure(
                    obj[key], keys
                )
                if keys
                else obj[key]
            )

    async def async_update(self):
        """Get the latest data from REST API and update the state."""
        _LOGGER.debug("Start updating feed")
        await self._rest.async_update()
        value = self._rest.data
        attributes = {}
        self._state = STATE_UNKNOWN
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
                                self._state = STATE_OK
                                self._attributes = attributes
                                # Dispatch to sensors.
                                async_dispatcher_send(
                                    self._hass,
                                    f"nsw_rfs_fire_danger_update_{self._district_name}",
                                )
                                break
            except ExpatError as ex:
                _LOGGER.warning("Unable to parse feed data: %s", ex)

    async def async_stop(self):
        """Stop this feed entity manager from refreshing."""
        if self._track_time_remove_callback:
            self._track_time_remove_callback()
        _LOGGER.debug("Feed entity manager stopped")
