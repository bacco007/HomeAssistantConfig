"""Support for HDHomeRun devices."""
import logging

from enum import IntEnum

from hdhr.adapter import HdhrUtility, HdhrDeviceQuery, OperationRejectedError

from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, CONF_HOST

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up HDHomeRun from a config entry."""
    hosts = hass.data[DOMAIN].get(SENSOR_DOMAIN)
    devices = []

    if hosts:
        # Priority 1: manual config
        for host in hosts:
            ip = host[CONF_HOST]
            _LOGGER.debug('Fetching devices for manually-configured host: ' + ip)
            devices.extend(HdhrUtility.discover_find_devices_custom(ip=ip))
    else:
        # Priority 2: scanned devices
        _LOGGER.debug('Scanning network for HDHomeRun devices')
        devices = HdhrUtility.discover_find_devices_custom()

    entities = []

    for device in devices:
        device_id = device.nice_device_id
        tuner_count = device.tuner_count
        _LOGGER.debug("Detected %d tuners for device: %s" % (tuner_count, device_id))

        adapter = HdhrDeviceQuery(HdhrUtility.device_create_from_str(device_id))

        device_info = {
            'identifiers': {
                (DOMAIN, device_id)
            },
            'name': 'HDHomeRun ' + device_id,
            'manufacturer': 'SiliconDust',
            'model': adapter.get_model_str(),
            'sw_version': adapter.get_version(),
        }

        for tuner in range(0, tuner_count):
            tuner_str = "%s-%d" % (device_id, tuner)
            entities.append(TunerSensor(device_info, tuner_str))

    async_add_entities(entities, update_before_add=True)

    return True

class StatusApi(IntEnum):
    # Note that these APIs are in fallback order
    VSTATUS = 1
    STREAMINFO = 2
    STATUS = 3

class TunerSensor(Entity):
    """Representation of a Sensor."""

    def __init__(self, parent_info, device_str):
        """Initialize the sensor."""
        self._id = device_str
        self._device_info = parent_info
        self._adapter = HdhrDeviceQuery(
            HdhrUtility.device_create_from_str(device_str))
        self._status_api = StatusApi(1)
        self._state = None

    async def async_update(self):
        self._state = self.fetch_channel()

    def fetch_channel(self):
        while True:
            try:
                return self.fetch_channel_raw()
            except OperationRejectedError:
                has_fallback = self.switch_fallback_api()

                if not has_fallback:
                    raise

    def switch_fallback_api(self):
        try:
            next_api = StatusApi(self._status_api + 1)
            _LOGGER.debug(
                'Operation %s not supported, falling back to %s for tuner: %s',
                self._status_api.name,
                next_api.name,
                self._id)
            self._status_api = next_api
            return True
        except ValueError:
            return False

    def fetch_channel_raw(self):
        _LOGGER.debug(
            'Fetching %s for tuner: %s',
            self._status_api.name,
            self._id)

        if self._status_api == StatusApi.VSTATUS:
            (vstatus, raw_data) = self._adapter.get_tuner_vstatus()
            return vstatus.nice_vchannel
        
        elif self._status_api == StatusApi.STREAMINFO:
            streaminfo = self._adapter.get_tuner_streaminfo()

            if not streaminfo:
                return None

            program = self._adapter.get_tuner_program()
            active = next(x for x in streaminfo if x.program == program)
            return active.vchannel

        elif self._status_api == StatusApi.STATUS:
            (status, raw_data) = self._adapter.get_tuner_status()
            return status.nice_channel
        
        else:
            raise 'Unknown status API: ' + self._status_api

    @property
    def name(self):
        """Return the name of the sensor."""
        return "HDHomeRun Tuner " + self._id

    @property
    def unique_id(self):
        return self._id

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def device_info(self):
        return self._device_info