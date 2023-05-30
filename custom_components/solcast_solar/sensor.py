"""Support for Solcast PV forecast sensors."""

from __future__ import annotations

import logging
from typing import Final

from datetime import datetime as dt
from datetime import timedelta, timezone

from homeassistant.components.sensor import (SensorDeviceClass, SensorEntity,
                                             SensorEntityDescription)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (ATTR_IDENTIFIERS, ATTR_MANUFACTURER,
                                 ATTR_MODEL, ATTR_NAME, ENERGY_KILO_WATT_HOUR,
                                 ENERGY_WATT_HOUR)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, ATTR_ENTRY_TYPE
from .coordinator import SolcastUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


SENSORS: dict[str, SensorEntityDescription] = {
    "total_kwh_forecast_today": SensorEntityDescription(
        key="total_kwh_forecast_today",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast Today",
        icon="mdi:solar-power",
    ),
    "peak_w_today": SensorEntityDescription(
        key="peak_w_today",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_WATT_HOUR,
        name="Peak Forecast Today",
        icon="mdi:solar-power",
    ),
    "peak_w_time_today": SensorEntityDescription(
        key="peak_w_time_today",
        name="Peak Time Today",
        icon="mdi:clock",
    ),
    "forecast_this_hour": SensorEntityDescription(
        key="forecast_this_hour",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_WATT_HOUR,
        name="Forecast This Hour",
        icon="mdi:solar-power",
    ),
    "forecast_remaining_today": SensorEntityDescription(
        key="get_remaining_today",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast Remaining Today",
        icon="mdi:solar-power",
    ),
    "forecast_next_hour": SensorEntityDescription(
        key="forecast_next_hour",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_WATT_HOUR,
        name="Forecast Next Hour",
        icon="mdi:solar-power",
    ),
    "total_kwh_forecast_tomorrow": SensorEntityDescription(
        key="total_kwh_forecast_tomorrow",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast Tomorrow",
        icon="mdi:solar-power",
    ),
    "peak_w_tomorrow": SensorEntityDescription(
        key="peak_w_tomorrow",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_WATT_HOUR,
        name="Peak Forecast Tomorrow",
        icon="mdi:solar-power",
    ),
    "peak_w_time_tomorrow": SensorEntityDescription(
        key="peak_w_time_tomorrow",
        name="Peak Time Tomorrow",
        icon="mdi:clock",
    ),
    "api_counter": SensorEntityDescription(
        key="api_counter",
        name="API Used",
        icon="mdi:web-check",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    "lastupdated": SensorEntityDescription(
        key="lastupdated",
        device_class=SensorDeviceClass.TIMESTAMP,
        name="API Last Polled",
        icon="mdi:clock",
        entity_category=EntityCategory.DIAGNOSTIC,
    ),
    "total_kwh_forecast_d3": SensorEntityDescription(
        key="total_kwh_forecast_d3",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast D3",
        icon="mdi:solar-power",
    ),
    "total_kwh_forecast_d4": SensorEntityDescription(
        key="total_kwh_forecast_d4",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast D4",
        icon="mdi:solar-power",
    ),
    "total_kwh_forecast_d5": SensorEntityDescription(
        key="total_kwh_forecast_d5",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast D5",
        icon="mdi:solar-power",
    ),
    "total_kwh_forecast_d6": SensorEntityDescription(
        key="total_kwh_forecast_d6",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast D6",
        icon="mdi:solar-power",
    ),
    "total_kwh_forecast_d7": SensorEntityDescription(
        key="total_kwh_forecast_d7",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
        name="Forecast D7",
        icon="mdi:solar-power",
    ),
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Solcast sensor."""

    coordinator: SolcastUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities = []

    for sensor_types in SENSORS:
        sen = SolcastSensor(coordinator, SENSORS[sensor_types],entry, coordinator._version)
        entities.append(sen)

    for site in coordinator.solcast._sites:
        k = SensorEntityDescription(
                key=site["resource_id"],
                name=site["name"],
                icon="mdi:home",
                device_class=SensorDeviceClass.ENERGY,
                native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
                entity_category=EntityCategory.CONFIG,
            )
        sen = RooftopSensor(coordinator, k,entry, coordinator._version)
        entities.append(sen)

    # k = SensorEntityDescription(
    #         key="solcast_has_update",
    #         name="Integration Update",
    #         icon="mdi:update",
    #         #device_class=SensorDeviceClass.ENERGY,
    #         #native_unit_of_measurement=ENERGY_KILO_WATT_HOUR,
    #         entity_category=EntityCategory.CONFIG,
    #     )
    # sen = SolcastUpdate(coordinator, k,entry, coordinator._version)
    # entities.append(sen)
    
    async_add_entities(entities)

class SolcastSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Seplos Sensor device."""


    def __init__(
        self,
        coordinator: SolcastUpdateCoordinator,
        entity_description: SensorEntityDescription,
        entry: ConfigEntry,
        version: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)

        self.entity_description = entity_description
        #self._id = f"solcast_{entity_description.key}"
        self.coordinator = coordinator

        ATTRIBUTION: Final = "Data provided by Solcast Solar"
        _attr_attribution = ATTRIBUTION

        self._attributes = {}
        self._attr_extra_state_attributes = {}

        self._sensor_data = coordinator.get_sensor_value(entity_description.key)
        
        self._attr_device_info = {
            ATTR_IDENTIFIERS: {(DOMAIN, entry.entry_id)},
            ATTR_NAME: "Solcast PV Forecast", #entry.title,
            ATTR_MANUFACTURER: "Oziee",
            ATTR_MODEL: "Solcast PV Forecast",
            ATTR_ENTRY_TYPE: DeviceEntryType.SERVICE,
            "sw_version": version,
            "configuration_url": "https://toolkit.solcast.com.au/live-forecast",
            #"configuration_url": f"https://toolkit.solcast.com.au/rooftop-sites/{entry.options[CONF_RESOURCE_ID]}/detail",
            #"hw_version": entry.options[CONF_RESOURCE_ID],
        }

        self._unique_id = f"solcast_api_{entity_description.name}"

    @property
    def name(self):
        """Return the name of the device."""
        # if self.entity_description.key == "total_kwh_forecast_d5":
        #     s = dt.now().replace(minute=0, second=0, microsecond=0).date() + timedelta(days=5)
        #     return s.strftime("%A")
        return f"{self.entity_description.name}"

    @property
    def friendly_name(self):
        """Return the name of the device."""
        return self.entity_description.name


    @property
    def unique_id(self):
        """Return the unique ID of the binary sensor."""
        return f"solcast_{self._unique_id}"

    @property
    def extra_state_attributes(self):
        """Return the state extra attributes of the binary sensor."""
        return self.coordinator.get_sensor_extra_attributes(self.entity_description.key)

    @property
    def native_value(self):
        """Return the value reported by the sensor."""
        return self._sensor_data

    @property
    def should_poll(self) -> bool:
        """Return if the sensor should poll."""
        return False

    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self.coordinator.async_add_listener(self._handle_coordinator_update)
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._sensor_data = self.coordinator.get_sensor_value(self.entity_description.key)
        self.async_write_ha_state()
class RooftopSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Seplos Sensor device."""


    def __init__(
        self,
        coordinator: SolcastUpdateCoordinator,
        entity_description: SensorEntityDescription,
        entry: ConfigEntry,
        version: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)

        self.entity_description = entity_description
        #self._id = f"solcast_{entity_description.key}"
        self.coordinator = coordinator

        ATTRIBUTION: Final = "Data provided by Solcast Solar"
        _attr_attribution = ATTRIBUTION

        self._attributes = {}
        self._attr_extra_state_attributes = {}
        
        self._sensor_data = coordinator.get_site_value(entity_description.key)
        
        self._attr_device_info = {
            ATTR_IDENTIFIERS: {(DOMAIN, entry.entry_id)},
            ATTR_NAME: "Solcast PV Forecast", #entry.title,
            ATTR_MANUFACTURER: "Oziee",
            ATTR_MODEL: "Solcast PV Forecast",
            ATTR_ENTRY_TYPE: DeviceEntryType.SERVICE,
            "sw_version": version,
            "configuration_url": "https://toolkit.solcast.com.au/live-forecast",
            #"configuration_url": f"https://toolkit.solcast.com.au/rooftop-sites/{entry.options[CONF_RESOURCE_ID]}/detail",
            #"hw_version": entry.options[CONF_RESOURCE_ID],
        }

        self._unique_id = f"solcast_api_{entity_description.name}"

    @property
    def name(self):
        """Return the name of the device."""
        return f"{self.entity_description.name}"

    @property
    def friendly_name(self):
        """Return the name of the device."""
        return self.entity_description.name

    @property
    def unique_id(self):
        """Return the unique ID of the binary sensor."""
        return f"solcast_{self._unique_id}"

    @property
    def extra_state_attributes(self):
        """Return the state extra attributes of the binary sensor."""
        return self.coordinator.get_site_extra_attributes(self.entity_description.key)

    @property
    def native_value(self):
        """Return the value reported by the sensor."""
        return self._sensor_data

    @property
    def should_poll(self) -> bool:
        """Return if the sensor should poll."""
        return False

    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self.coordinator.async_add_listener(self._handle_coordinator_update)
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._sensor_data = self.coordinator.get_site_value(self.entity_description.key)
        self.async_write_ha_state()
