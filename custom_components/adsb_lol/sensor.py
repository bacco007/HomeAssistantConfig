"""Support for ADSB.lol"""
from datetime import datetime
import logging
from PIL import Image
from typing import Any

from homeassistant.helpers import entity_registry as er

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify
import homeassistant.util.dt as dt_util

from .const import (
    ATTR_LATITUDE,
    DOMAIN,
    ICONS_URL,
    CONF_ENTITY_PICTURE,
    CONF_ENTITY_PICTURE_ASC,
    CONF_ENTITY_PICTURE_DESC,
    CONF_ENTITY_PICTURE_HELI
)

from .coordinator import ADSBUpdateCoordinator, ADSBPointUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

def get_current_registrations(flights) -> set[str]:
    """Return a list of present goals."""
    result = set()
    for key, value in flights.items():
        result.add(key)
    return result

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
    ) -> None:
    """Initialize the setup."""  
    sensors = []    
    if config_entry.data.get('device_tracker_id',None):
        coordinator: ADSBPointUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][
           "coordinator"
        ]
        await coordinator.async_config_entry_first_refresh()
        for key, value in coordinator.data.items():
            sensors.append(
                    ADSBPointACSensor(value, coordinator, config_entry.data.get('device_tracker_id') )
                )
        sensors.append(
                ADSBPointSensor(coordinator, config_entry.data.get('device_tracker_id') )
            )    
            
        # setup listening for new reg
        current_registrations = get_current_registrations(coordinator.data)
        
        
        
        def _async_registrations_listener() -> None:
            """Listen for new registrations and add sensors if they did not exist."""
            received_registrations = get_current_registrations(coordinator.data)
            new_registrations = received_registrations - current_registrations
            old_registrations = current_registrations - received_registrations
            _LOGGER.debug("New registrations: %s", new_registrations)
            _LOGGER.debug("Old registrations: %s", old_registrations)
            
            if old_registrations:
                entity_registry = er.async_get(hass)
                entries = er.async_entries_for_config_entry(entity_registry, config_entry.entry_id)
                for registration in old_registrations:
                    for entry in entries:
                        if entry.entity_id.startswith("sensor.") and entry.unique_id.startswith(registration):
                            _LOGGER.debug("Removing registration: %s",registration)
                            entity_registry.async_remove(entry.entity_id)          
            
            if new_registrations:
                sensors = []
                current_registrations.update(new_registrations)
                for registration in new_registrations:
                    for key, value in coordinator.data.items():
                        if key == registration:
                            _LOGGER.debug("Listener: adding registration: %s", key)
                            sensors.append(
                                    ADSBPointACSensor(value, coordinator, config_entry.data.get('device_tracker_id'))
                                    )
                async_add_entities(sensors, False)    
                
        coordinator.async_add_listener(_async_registrations_listener)
        
    else:
        coordinator_t: ADSBUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id][
           "coordinator"
        ]
        await coordinator_t.async_config_entry_first_refresh()
        
        sensors.append(
                ADSBFlightTrackerSensor(coordinator_t)
            )
    
    async_add_entities(sensors, False)
    

class ADSBFlightTrackerSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a ADSB Flight tracker via registration departures sensor."""

    def __init__(self, coordinator) -> None:
        """Initialize the ADSB sensor."""
        super().__init__(coordinator)
        self._name = self.coordinator.data['registration']
        self._attributes: dict[str, Any] = {}

        self._attr_unique_id = f"adsb-{self._name}_{self.coordinator.data['registration']}"
        self._attr_device_info = DeviceInfo(
            name=f"ADSB - {self._name}",
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"ADSB - {self._name}")},
            manufacturer="ADSB",
            model=self._name,
        )
        self._attributes = self._update_attrs()
        self._attr_extra_state_attributes = self._attributes

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return self._name + "_flight_tracker"
        
    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_attrs()
        super()._handle_coordinator_update()

    def _update_attrs(self):  # noqa: C901 PLR0911
        _LOGGER.debug("SENSOR Tracker: %s, update with attr data: %s", self._name, self.coordinator.data)
        self._state: str | None = None
        self._state = self.coordinator.data["callsign"]
        self._attr_native_value = self._state 
        self._attr_extra_state_attributes = self.coordinator.data
        
        self._attr_entity_picture = f'{ICONS_URL}/{self.coordinator.data[CONF_ENTITY_PICTURE]}'
        
        return self._attr_extra_state_attributes
        
class ADSBPointSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a ADBS flights around poi sensor."""

    def __init__(self, coordinator, device_tracker_id) -> None:
        """Initialize the ADSB sensor."""
        super().__init__(coordinator)             
        self._name = device_tracker_id
        self._device_tracker_id = device_tracker_id
        self._attributes: dict[str, Any] = {}

        self._attr_unique_id = f"adsb-in-radius-{self._name}"
        self._attr_device_info = DeviceInfo(
            name=f"ADSB",
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, "ADSB")},
            manufacturer="ADSB",
            model="ADSB",
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attributes = self._update_attrs()
        self._attr_extra_state_attributes = self._attributes

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "flights_in_radius_" + self._name

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_attrs()
        super()._handle_coordinator_update()

    def _update_attrs(self):  # noqa: C901 PLR0911
        _LOGGER.debug("SENSOR Point: %s, update with attr data: %s", self._name, self.coordinator.data)
        self._state: str | None = None
        # if no data or extracting, aircraft
        #state
        self._attr_native_value = len(self.coordinator.data)
        
        
        self._attributes["aircraft"] = self.coordinator.data
        self._attr_extra_state_attributes = self._attributes


        return self._attr_extra_state_attributes    

class ADSBPointACSensor(CoordinatorEntity, SensorEntity):
    """Implementation of a ADBS flights around poi sensor."""

    def __init__(self, aircraft, coordinator, device_tracker_id) -> None:
        """Initialize the ADSB sensor."""
        super().__init__(coordinator)            
        self._name = aircraft["registration"] + "_in_radius_" + device_tracker_id
        self._device_tracker_id = device_tracker_id
        self._attributes: dict[str, Any] = {}

        self._attr_unique_id = f"{self._name}"
        self._attr_device_info = DeviceInfo(
            name=f"ADSB",
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, "ADSB")},
            manufacturer="ADSB",
            model="ADSB",
        )
        self._aircraft = aircraft
        self._attributes = self._update_attrs()
        self._attr_extra_state_attributes = self._attributes

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return str(self._name)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_attrs()
        super()._handle_coordinator_update()

    def _update_attrs(self):  # noqa: C901 PLR0911
        _LOGGER.debug("SENSOR Point AC: %s, update with attr data: %s", self._name, self.coordinator.data)
        self._state: str | None = None
        #dealing with updates form coordinator
        reg_found = False
        for k,v in self.coordinator.data.items():
            if self._aircraft["registration"] == k:
                self._aircraft = v
                reg_found = True
            else:
                self._aircraft = self._aircraft
            
        #state
        self._attr_native_value = self._aircraft["callsign"]
        self._attributes = self._aircraft
        self._attr_extra_state_attributes = self._attributes
        
        if self._aircraft.get("altitude_baro_rate", 0) < 0 or self._aircraft.get("altitude_geom_rate",0) < 0 :
            self._attr_entity_picture = f'{ICONS_URL}/{self._aircraft[CONF_ENTITY_PICTURE_DESC]}'
        else:
            self._attr_entity_picture = f'{ICONS_URL}/{self._aircraft[CONF_ENTITY_PICTURE_ASC]}'
        # helicopter
        if self._aircraft.get("category", None) == "A7":     
            self._attr_entity_picture = f'{ICONS_URL}/{self._aircraft[CONF_ENTITY_PICTURE_HELI]}'
        return self._attr_extra_state_attributes   

    async def remove_entity(self):
        _LOGGER.debug("Func, remove entity")
        await self.async_remove(force_remove=True)        
