"""Get station's air quality informations"""
from __future__ import annotations

import logging

from .waqi_api import WaqiDataRequester

import voluptuous as vol

from homeassistant.components.sensor import (
    SensorDeviceClass,
    PLATFORM_SCHEMA as PARENT_PLATFORM_SCHEMA,
    SensorEntity,
)
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.core import HomeAssistant
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

from homeassistant.const import (
    CONF_NAME,
    CONF_LATITUDE, 
    CONF_LONGITUDE, 
    CONF_TOKEN,
    CONF_ID,
    CONF_METHOD
)

from .const import (
    SENSORS,
    DOMAIN,
    DEFAULT_NAME,
    SW_VERSION
)

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PARENT_PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_TOKEN): cv.string,
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
        vol.Optional(CONF_LATITUDE): cv.string,
        vol.Optional(CONF_LONGITUDE): cv.string,
    }
)


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_devices: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the World's Air Quality Index sensors."""
    _LOGGER.warning(
        "Configuration of the World's Air Quality Inde platform in YAML is deprecated and will be "
        "removed in Home Assistant 2022.4; Your existing configuration "
        "has been imported into the UI automatically and can be safely removed "
        "from your configuration.yaml file"
    )
    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": SOURCE_IMPORT},
            data=config,
        )
    )

async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the world_air_quality_index sensor entry."""

    _LOGGER.debug("config token:")
    _LOGGER.debug(entry.data[CONF_TOKEN])
    _LOGGER.debug("config method:")
    _LOGGER.debug(entry.data[CONF_METHOD])
    _LOGGER.debug("config name:")
    _LOGGER.debug(entry.data[CONF_NAME])

    name = entry.data[CONF_NAME]
    token = entry.data[CONF_TOKEN]
    method = entry.data[CONF_METHOD]
    
    if method == CONF_ID:
        _LOGGER.debug("config ID:")
        _LOGGER.debug(entry.data[CONF_ID])
        id = entry.data[CONF_ID]
        requester = WaqiDataRequester(None, None, token, id, method)
    else:
        _LOGGER.debug("config latitude:")
        _LOGGER.debug(entry.data[CONF_LATITUDE])
        _LOGGER.debug("config longitude:")
        _LOGGER.debug(entry.data[CONF_LONGITUDE])
        latitude = entry.data[CONF_LATITUDE]
        longitude  = entry.data[CONF_LONGITUDE]
        requester = WaqiDataRequester(latitude, longitude, token, None, method)
    
    await hass.async_add_executor_job(requester.update)

    scannedData = requester.GetData()
    scannedData = scannedData["data"]["iaqi"]

    entities = []
    
    for res in SENSORS:
        if res == "aqi" or res in scannedData:
            entities.append(WorldsAirQualityIndexSensor(res, requester))

    async_add_entities(entities, update_before_add=True)



class WorldsAirQualityIndexSensor(SensorEntity):
    """Representation of a Sensor."""

    def __init__(self, resType: str, requester: WaqiDataRequester) -> None:
        self._state = None
        self._resType = resType
        self._requester = requester
        self._stationName = self._requester.GetStationName()
        self._stationIdx = self._requester.GetStationIdx()
        self._updateLastTime = self._requester.GetUpdateLastTime()
        self._name = SENSORS[self._resType][0]

        self._attr_name = self._name
        self._attr_unique_id = f"{self._stationName}_{self._stationIdx}_{self._name}"
        self._attr_extra_state_attributes = {
            "StationName": self._stationName
        }
        self._attr_device_info = DeviceInfo(
            entry_type = DeviceEntryType.SERVICE,
            identifiers = {(DOMAIN, f"{self._stationName}_{self._stationIdx}")},
            manufacturer = "@pawkakol1",
            model = f"Idx:{self._stationIdx}",
            sw_version = SW_VERSION,
            name = self._stationName
        )

    @property
    def state(self):
        #Return the state of the sensor.
        return self._state

    @property
    def unit_of_measurement(self) -> str:
        #Return the unit of measurement.
        return SENSORS[self._resType][1]

    @property
    def device_class(self) -> SensorDeviceClass | str | None:
        return SENSORS[self._resType][3]

    @property
    def icon(self) -> str | None:
        return SENSORS[self._resType][2]

    def update(self) -> None:
        #Fetch new state data for the sensor.
        #This is the only method that should fetch new data for Home Assistant.

        self._requester.update()

        _data = self._requester.GetData()
        self._updateLastTime = self._requester.GetUpdateLastTime()

        if self._resType == 'aqi':
            self._state = float(_data["data"]["aqi"])
        else:
            self._state = float(_data["data"]["iaqi"][self._resType]["v"])
        
        self._attr_extra_state_attributes = {
            "StationName": self._requester.GetStationName(),
            "LastUpdate": self._requester.GetUpdateLastTime()
        }

