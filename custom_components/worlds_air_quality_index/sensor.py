"""Get station's air quality informations"""
from __future__ import annotations

import logging
from this import s

from .waqi_api import WaqiDataRequester

import json

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
    CONF_METHOD,
    CONF_TEMPERATURE_UNIT,
    TEMP_FAHRENHEIT,
    TEMP_CELSIUS
)

from .const import (
    SENSORS,
    DOMAIN,
    DEFAULT_NAME,
    SW_VERSION,
    WIND_DIRECTION,
    WIND_DIRECTION_PREFIX,
    WIND_DIRECTION_SUFFIX,
    WIND_DIRECTION_FOLDER,
)

_LOGGER = logging.getLogger(__name__)

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
    tempUnit = entry.data[CONF_TEMPERATURE_UNIT]
    
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
            entities.append(WorldsAirQualityIndexSensor(res, requester, tempUnit))

    async_add_entities(entities, update_before_add=True)



class WorldsAirQualityIndexSensor(SensorEntity):
    """Representation of a Sensor."""

    def __init__(self, resType: str, requester: WaqiDataRequester, tempUnit: str) -> None:
        self._state = None
        self._resType = resType
        self._requester = requester
        self._stationName = self._requester.GetStationName()
        self._stationIdx = self._requester.GetStationIdx()
        self._updateLastTime = self._requester.GetUpdateLastTime()
        self._data = self._requester.GetData()
        self._name = SENSORS[self._resType][0]
        self._tempUnit = tempUnit

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
        if SENSORS[self._resType][1] == TEMP_CELSIUS:
            return self._tempUnit
        else:
            return SENSORS[self._resType][1]

    @property
    def device_class(self) -> SensorDeviceClass | str | None:
        return SENSORS[self._resType][3]

    @property
    def icon(self) -> str | None:
        if self._resType != 'wg':
            return SENSORS[self._resType][2]
    
    @property
    def entity_picture(self) -> str | None:
        _LOGGER.debug("Check:")
        _LOGGER.debug(self._resType)
        if SENSORS[self._resType][2] == 'custom' and self._resType == 'wg':
            val = float(self._data["data"]["iaqi"]["wg"]["v"])
            _LOGGER.debug(val)
            for res in WIND_DIRECTION:
                if val > float(res["min"]):
                    _LOGGER.debug(res["val"])
                    _LOGGER.debug("matched")
                    return WIND_DIRECTION_FOLDER + WIND_DIRECTION_PREFIX + res["val"] + WIND_DIRECTION_SUFFIX
            return WIND_DIRECTION_FOLDER + WIND_DIRECTION_PREFIX + WIND_DIRECTION[0]["val"] + WIND_DIRECTION_SUFFIX
        else:
            return None

    def update(self) -> None:
        #Fetch new state data for the sensor.
        #This is the only method that should fetch new data for Home Assistant.

        self._requester.update()

        self._data = self._requester.GetData()
        self._updateLastTime = self._requester.GetUpdateLastTime()

        if self._resType == 'aqi':
            if self._data["data"]["aqi"] == "-":
                _LOGGER.warning("aqi value from json waqi api was undefined ('-' value)")
                self._state = 0
            else:
                self._state = int(self._data["data"]["aqi"])
        elif self._resType == 't':
            if self._tempUnit == TEMP_FAHRENHEIT:
                self._state = 9.0 * float(self._data["data"]["iaqi"]['t']["v"]) / 5.0 + 32.0
            else:
                self._state = float(self._data["data"]["iaqi"]['t']["v"])
        else:
            self._state = float(self._data["data"]["iaqi"][self._resType]["v"])
        
        self._attr_extra_state_attributes = {
            "StationName": self._requester.GetStationName(),
            "LastUpdate": self._requester.GetUpdateLastTime()
        }

