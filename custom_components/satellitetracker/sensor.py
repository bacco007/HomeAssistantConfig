"""Definition and setup of the Satellite Tracker Sensors for Home Assistant."""

import logging
import time
import datetime

from homeassistant.util.dt import as_local, utc_from_timestamp
from homeassistant.components.sensor import ENTITY_ID_FORMAT
from homeassistant.const import UnitOfTime, ATTR_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from . import N2YOLocationCoordinator, N2YOSatelliteCoordinator

from .const import (
    ATTR_IDENTIFIERS, 
    ATTR_MANUFACTURER, 
    ATTR_MODEL, 
    DOMAIN, 
    COORDINATOR,
    CONF_MIN_VISIBILITY,
    DEFAULT_MIN_VISIBILITY,
)

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the sensor platforms."""

    coordinator = hass.data[DOMAIN][entry.entry_id][COORDINATOR]
    sensors = []

    if coordinator._type == "location":
        sensors.append(
            LocationSensor(
                coordinator=coordinator,
                icon="mdi:satellite-uplink",
                latitude=entry.data["latitude"],
                longitude=entry.data["longitude"],
                elevation=entry.data["elevation"],
            )
        )
    else:
        for visible_sensor in range(0,5):
            sensors.append(
                SatelliteSensor(
                    coordinator=coordinator,
                    icon="mdi:satellite-variant",
                    sat_count=visible_sensor,
                )
            )

    async_add_entities(sensors)

class SatelliteSensor(CoordinatorEntity):
    """Defines a Satellite Tracker sensor."""

    def __init__(
        self,
        coordinator: N2YOSatelliteCoordinator,
        icon: str,
        sat_count: int,
    ):
        """Initialize entities."""
        super().__init__(coordinator=coordinator)

        self._name = f"{coordinator._name} Pass {sat_count}"
        self._unique_id = f"{coordinator._satellite}_pass_{sat_count}"
        self._state = None
        self._icon = icon
        self._sat_count = sat_count
        self.attrs = {}

    @property
    def unique_id(self):
        """Return the unique ID for this entity."""
        return self._unique_id

    @property
    def name(self):
        """Return the name for this entity."""
        return self._name

    @property
    def icon(self):
        """Return the icon for this entity."""
        return self._icon

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def unit_of_measurement(self):
        """Return the UoM for this entity."""
        return UnitOfTime.SECONDS
    
    @property
    def state(self):
        """Return the state for this entity."""
        state = None

        if len(self.coordinator.data["visual_passes"]) > self._sat_count:
            pass_data = self.coordinator.data["visual_passes"][self._sat_count]
            state = pass_data["duration"]

        return state

    @property
    def extra_state_attributes(self):
        """Return the attributes for this entity."""
        self.attrs = {}
        if len(self.coordinator.data["visual_passes"]) > self._sat_count:
            pass_data = self.coordinator.data["visual_passes"][self._sat_count]
            if pass_data["maxEl"] > 65:
                self.attrs["quality"] = "High"
            elif pass_data["maxEl"] > 45:
                self.attrs["quality"] = "Moderate"
            else:
                self.attrs["quality"] = "Low"

            self.attrs["max_elevation"] = pass_data["maxEl"]
            self.attrs["pass_start"] = as_local(utc_from_timestamp(
                pass_data["startUTC"]
            )).strftime("%d-%b-%Y %I:%M %p")
            self.attrs["pass_start_unix"] = pass_data["startUTC"]
            self.attrs["pass_peak"] = as_local(utc_from_timestamp(
                pass_data["maxUTC"]
            )).strftime("%d-%b-%Y %I:%M %p")
            self.attrs["pass_peak_unix"] = pass_data["maxUTC"]
            self.attrs["pass_end"] = as_local(utc_from_timestamp(
                pass_data["endUTC"]
            )).strftime("%d-%b-%Y %I:%M %p")
            self.attrs["pass_end_unix"] = pass_data["endUTC"]
            self.attrs["start_compass"] = pass_data["startAzCompass"]
            self.attrs["end_compass"] = pass_data["endAzCompass"]

        return self.attrs

    @property
    def device_info(self):
        """Define the device based on device_identifier."""

        device_name = self.coordinator._name
        device_model = "Satellite Sensor"

        return {
            ATTR_IDENTIFIERS: {(DOMAIN, self.coordinator._satellite)},
            ATTR_NAME: device_name,
            ATTR_MANUFACTURER: "N2YO.com",
            ATTR_MODEL: device_model,
        }

       

class LocationSensor(CoordinatorEntity):
    """Defines a location tracker sensor."""
    def __init__(
        self,
        coordinator: N2YOLocationCoordinator,
        icon: str,
        latitude: float,
        longitude: float,
        elevation: float,
    ):
        """Initialize entities."""
        super().__init__(coordinator=coordinator)

        self._name = f"{coordinator._name} Overhead Satellites"
        self._unique_id = f"{coordinator._name}_{latitude}_{longitude}_{elevation}"
        self._state = None
        self._icon = icon
        self.attrs = {}

    @property
    def unique_id(self):
        """Return the unique ID for this entity."""
        return self._unique_id

    @property
    def name(self):
        """Return the name of this entity."""
        return self._name

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def icon(self):
        """Return the icon for this sensor."""
        return self._icon

    @property
    def state(self):
        """Return the state for this entity."""
        return len(self.coordinator.data)

    @property
    def extra_state_attributes(self):
        """Return the state attributes for this entity."""
        self.attrs = {}

        sat_count = 1
        for satellite in self.coordinator.data:
            self.attrs[f"sat_{sat_count}_id"] = satellite["satid"]
            self.attrs[f"sat_{sat_count}_name"] = satellite["satname"]
            self.attrs[f"sat_{sat_count}_launch_date"] = satellite["launchDate"]
            self.attrs[f"sat_{sat_count}_latitude"] = satellite["satlat"]
            self.attrs[f"sat_{sat_count}_longitude"] = satellite["satlng"]
            self.attrs[f"sat_{sat_count}_elevation"] = satellite["satalt"]
            sat_count += 1

        return self.attrs

    @property
    def unit_of_measurement(self):
        """Return the UoM for this entity."""
        return "satellites"
    
    @property
    def device_info(self):
        """Define the device based on device_identifier."""

        device_name = self.coordinator._name
        device_model = "Location Sensor"

        return {
            ATTR_IDENTIFIERS: {(DOMAIN, device_name)},
            ATTR_NAME: device_name,
            ATTR_MANUFACTURER: "N2YO.com",
            ATTR_MODEL: device_model,
        }

