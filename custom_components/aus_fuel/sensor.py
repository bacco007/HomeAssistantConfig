"""Support for Australian Fuel Price sensor."""
from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .aus_fuel_api import AusFuelPrice

from .const import DOMAIN
import pprint


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the Australian Fuel Price sensor platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]

    stations = entry.data["stations"]
    fuel_types = entry.data["fuel_types"]
    fuel_type_devices = entry.data["fuel_type_devices"]

    list = []

    for (key, fuel_entry) in coordinator.data["prices"].items():
        if fuel_entry.fuel_type in fuel_types and fuel_entry.station_id in stations:
            if fuel_type_devices:
                device = DeviceInfo(
                    entry_type=DeviceEntryType.SERVICE,
                    identifiers={(DOMAIN, fuel_entry.fuel_type)},
                    manufacturer="Fuel Type",
                    name=fuel_entry.fuel_type,
                )
                list.append(AusFuelPriceSensor(coordinator, key, fuel_entry, device))
            else:
                device = DeviceInfo(
                    entry_type=DeviceEntryType.SERVICE,
                    identifiers={(DOMAIN, fuel_entry.name)},
                    manufacturer=fuel_entry.brand,
                    model=fuel_entry.address,
                    name=fuel_entry.name,
                )
                list.append(AusFuelPriceSensor(coordinator, key, fuel_entry, device))

    pprint.pprint(list)

    async_add_entities(list)


class AusFuelPriceSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Australian Fuel Price sensor."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        key: str,
        price_entry: AusFuelPrice,
        device: DeviceInfo,
    ) -> None:
        """Initialize the Aus Fueld Price sensor."""
        super().__init__(coordinator)
        self.price_entry = price_entry
        self.price_id = key
        self._attr_name = f"{price_entry.name} {price_entry.fuel_type}"
        self._attr_unique_id = key
        self._attr_native_unit_of_measurement = "c/L"
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_device_info = device
        self._attr_extra_state_attributes = {
            "name": price_entry.name,
            "address": price_entry.address,
            "brand": price_entry.brand,
            "latitude": price_entry.latitude,
            "longitude": price_entry.longitude,
        }
        if "Diesel" in price_entry.fuel_type:
            self._attr_icon = "mdi:truck"
        elif "E10" in price_entry.fuel_type:
            self._attr_icon = "mdi:gas-station-outline"
        else:
            self._attr_icon = "mdi:gas-station"

    @property
    def native_value(self):
        """Return the state of the sensor."""
        return (
            getattr(self.coordinator.data["prices"][self.price_id], "price")
            if self.coordinator.data
            else None
        )
