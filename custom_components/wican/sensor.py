import logging
from datetime import timedelta
import async_timeout
from homeassistant.components.number import (
    NumberEntity,
    NumberDeviceClass
)

from homeassistant.components.binary_sensor import (
    BinarySensorEntity
)

from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)
from homeassistant.core import callback
from homeassistant.const import (
    EntityCategory,
)
from homeassistant.helpers.entity import EntityCategory

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

def process_status_voltage(i):
    return float( i[:-1] )

async def async_setup_entry(hass, config_entry, async_add_entities):
    wican = hass.data[DOMAIN][config_entry.entry_id]

    coordinator = WiCanCoordinator(hass, wican)

    await coordinator.async_config_entry_first_refresh()

    entities = [];

    if(coordinator.data['status'] == False):
        return

    entities.append(WiCanNumber(coordinator, {
        "key": 'batt_voltage',
        "name": "Status Voltage",
        "class": NumberDeviceClass.VOLTAGE,
        "unit": "V"
        },
        process_status_voltage
    ))
    entities.append(WiCanText(coordinator, {
        "key": "sta_ip",
        "name": "IP Address",
        "category": EntityCategory.DIAGNOSTIC
    }))
    entities.append(WiCanText(coordinator, {
        "key": "protocol",
        "name": "Mode",
        "category": EntityCategory.DIAGNOSTIC
    }))
    entities.append(WiCanBool(coordinator, {
        "key": "ble_status",
        "name": "Bluetooth Status",
        "category": EntityCategory.DIAGNOSTIC,
        "target_state": "enable",
    }))
    entities.append(WiCanBool(coordinator, {
        "key": "sleep_status",
        "name": "Sleep Status",
        "category": EntityCategory.DIAGNOSTIC,
        "target_state": "enable",
        "attributes": {
            "voltage": "sleep_volt"
        }
    }))
    entities.append(WiCanBool(coordinator, {
        "key": "mqtt_en",
        "name": "MQTT Status",
        "category": EntityCategory.DIAGNOSTIC,
        "target_state": "enable",
        "attributes": {
            "url": "mqtt_url",
            "port": "mqtt_port",
            "user": "mqtt_user",
        }
    }))
    entities.append(WiCanBool(coordinator, {
        "key": "ecu_status",
        "name": "ECU Status",
        "category": EntityCategory.DIAGNOSTIC,
        "target_state": "online",
    }))

    if not coordinator.ecu_online:
        async_add_entities(entities)

    if coordinator.data['pid'] == False:
        return async_add_entities(entities)

    for key in coordinator.data['pid']:
        entities.append(WiCanPid(coordinator, {
            "key": key,
            "name": key,
            "class": coordinator.data['pid'][key]['class'],
            "unit": coordinator.data['pid'][key]['unit'],
        }))

    return async_add_entities(entities)

def device_info(coordinator):
    return {
        "identifiers": {(DOMAIN, coordinator.data['status']['device_id'])},
        "name": "WiCAN",
        "manufacturer": "MeatPi",
        "model": coordinator.data['status']['hw_version'],
        "configuration_url": "http://" + coordinator.data['status']['sta_ip'],
        "sw_version": coordinator.data['status']['fw_version'],
        "hw_version": coordinator.data['status']['hw_version'],
    }

class WiCanSensorBase(CoordinatorEntity):
    data = {}
    coordinator = None
    process_state = None
    _attr_has_entity_name = True
    _attr_name = None
    def __init__(self, coordinator, data, process_state = None):
        super().__init__(coordinator)
        self.data = data
        self.coordinator = coordinator
        self.process_state = process_state

        device_id = self.coordinator.data['status']['device_id']

        key = self.get_data('key')
        self._attr_unique_id = "wican_" + device_id + "_" + key
        self.id = 'wican_' + device_id[-3:] + "_" + key
        self._attr_name = self.get_data('name')
        self.set_state()

    def get_data(self, key):
        if key in self.data:
            return self.data[key]
        return None

    @callback
    def _handle_coordinator_update(self) -> None:
        self.set_state()
        self.async_write_ha_state()
    
    def set_state(self):
        
        if self.process_state is not None:
            state = self.process_state(self.coordinator.data['status'][self.get_data('key')])
        else:
            state = self.coordinator.data['status'][self.get_data('key')]

        if not state == False:
            self._state = state

    @property
    def extra_state_attributes(self):
        attributes = self.get_data('attributes')
        if attributes is None:
            return None
        
        return_attrs = {}
        for key in attributes:
            return_attrs[key] = self.coordinator.data['status'][attributes[key]]
        
        return return_attrs

    @property
    def device_class(self):
        return self.get_data("device_class")

    @property
    def device_info(self):
        return device_info(self.coordinator)

    # TODO
    @property
    def available(self) -> bool:
        return self.coordinator.data['status'] != False

    @property
    def entity_category(self):
        return self.get_data("category")

    @property
    def state(self):
        return self._state

class WiCanText(WiCanSensorBase):
    def __init(self, coordinator, data):
        super().__init__(coordinator, data)

class WiCanCoordinator(DataUpdateCoordinator):
    ecu_online = False
    def __init__(self, hass, api):
        super().__init__(
            hass,
            _LOGGER,
            name="WiCAN Coordinator",
            update_interval = timedelta(seconds=30)
        )

        self.api = api

    async def _async_update_data(self):
        return await self.get_data()
        
    async def get_data(self):
        data = {};
        data['status'] = await self.api.check_status()
        if data['status'] == False :
            return data
        
        self.ecu_online = True
        # self.ecu_online = data['status']['ecu_status'] == 'online'

        if not self.ecu_online:
            return data

        data['pid'] = await self.api.get_pid()

        _LOGGER.info(data)

        return data;

class WiCanNumber(WiCanSensorBase):
    def __init(self, coordinator, data):
        super().__init__(coordinator, data)

    @property
    def native_unit_of_measurement(self):
        return self.get_data('unit')
    
    @property
    def device_class(self):
        return self.get_data('class')

class WiCanBool(WiCanSensorBase, BinarySensorEntity):
    def __init(self, coordinator, data):
        super().__init__(coordinator, data)

    def set_state(self):
        self._attr_is_on = self.coordinator.data['status'][self.get_data('key')] == self.get_data('target_state')

    @property
    def state(self):
        return "on" if self._attr_is_on else "off"
    
class WiCanPid(CoordinatorEntity):
    data = {}
    coordinator = None
    _attr_has_entity_name = True
    _attr_name = None
    def __init__(self, coordinator, data):
        super().__init__(coordinator)
        self.data = data
        self.coordinator = coordinator

        key = self.get_data('key')
        device_id = self.coordinator.data['status']['device_id']
        self._attr_unique_id = "wican_" + device_id + "_" + key
        self.id = 'wican_' + device_id[-3:] + "_" + key
        self._attr_name = self.get_data('name')
        self.set_state()

    def get_data(self, key):
        if key in self.data:
            return self.data[key]
        return None

    @callback
    def _handle_coordinator_update(self) -> None:
        self.set_state()
        self.async_write_ha_state()
    
    def set_state(self):
        state = self.coordinator.data['pid'][self.get_data('key')]['value']
        if state is False:
            if not hasattr(self, '_state'):
                # Setting it to False initially if it hasn't been initialized yet
                self._state = False
            return
        
        self._state = state

    @property
    def extra_state_attributes(self):
        attributes = self.get_data('attributes')
        if attributes is None:
            return None
        
        return_attrs = {}
        for key in attributes:
            return_attrs[key] = self.coordinator.data['pid'][attributes[key]]
        
        return return_attrs

    @property
    def native_unit_of_measurement(self):
        return self.get_data('unit')

    @property
    def device_class(self):
        return self.get_data("class")

    @property
    def device_info(self):
        return device_info(self.coordinator)

    # TODO
    @property
    def available(self) -> bool:
        if self._state is False:
            return False
        
        return True

    @property
    def entity_category(self):
        return self.get_data("category")

    @property
    def state(self):
        return self._state
