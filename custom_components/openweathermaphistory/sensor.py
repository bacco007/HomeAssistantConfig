"""Platform for historical rain factor Sensor integration."""
from __future__ import annotations

from datetime import timedelta
import logging

import jinja2

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, CONF_RESOURCES
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_platform
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .const import (
    ATTRIBUTION,
    CONF_ATTRIBUTES,
    CONF_FORMULA,
    CONF_INTIAL_DAYS,
    CONF_MAX_DAYS,
    CONF_SENSORCLASS,
    CONF_STATECLASS,
    CONF_UID,
    DOMAIN,
)
from .weatherhistory import Weather

SCAN_INTERVAL = timedelta(minutes=10)

_LOGGER = logging.getLogger(__name__)

async def _async_create_entities(hass:HomeAssistant, config, weather):
    """Create the Template switches."""
    sensors = []
    coordinator = WeatherCoordinator(hass, weather)
    #append multiple sensors using the single weather class
    for resource in config[CONF_RESOURCES]:
        sensors.append(
            WeatherHistory(
                hass,
                config,
                resource,
                weather,
                coordinator
            )
        )
    return sensors

async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Initialize config entry. form config flow"""
    if config_entry.options != {}:
        config = config_entry.options
    else:
        config = config_entry.data
    weather = Weather(hass,config)
    #initailise the weather data
    weather.set_processing_type ('initial')
    await weather.async_update()
    async_add_entities(await _async_create_entities(hass, config, weather))

    platform = entity_platform.async_get_current_platform()
    platform.async_register_entity_service(
        "api_call",
        {

        },
        "api_call",
    )
    platform.async_register_entity_service(
        "list_vars",
        {

        },
        "list_vars",
    )

class WeatherCoordinator(DataUpdateCoordinator):
    """Weather API data coordinator
       refresh the data independantly of the sensor"""

    def __init__(self, hass: HomeAssistant, weather) -> None:
        """Initialize my coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL,
        )

        self._weather = weather

    async def _async_update_data(self):
        """Fetch data from API endpoint."""
        #process n records every cycle
        await self._weather.async_update()
        if self._weather.remaining_backlog() > 0:
            self._weather.set_processing_type ('backload')
            await self._weather.async_update()

class WeatherHistory(CoordinatorEntity,SensorEntity):
    '''Rain factor class defn.'''

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_attribution = ATTRIBUTION

    def __init__(
        self,
        hass: HomeAssistant,
        config,
        resource,
        weather: Weather,
        coordinator: CoordinatorEntity
    ) -> None:
        #subscribe to the API data coordinator
        super().__init__(coordinator)

        self._hass               = hass
        self._state              = 1
        self._weather            = weather
        self._extra_attributes   = None
        self._name               = resource[CONF_NAME]
        self._formula            = resource[CONF_FORMULA]
        self._attributes         = resource.get(CONF_ATTRIBUTES)
        self._initdays           = config.get(CONF_INTIAL_DAYS)
        self._maxdays           = config.get(CONF_MAX_DAYS)
        self._sensor_class       = resource.get(CONF_SENSORCLASS,None)
        self._state_class        = resource.get(CONF_STATECLASS,None)
        self._uuid               = resource.get(CONF_UID)

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._weather.set_processing_type ('general')
        self.determine_state()
        self.async_write_ha_state()

    async def async_added_to_hass(self):
        self._hass.async_create_task(self.async_update())
        await super().async_added_to_hass()

    async def api_call(self):
        await self._weather.show_call_data()

    async def async_update(self):
        ''' update the sensor'''
        self.determine_state()
        self.async_write_ha_state()

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self):
        """Return a unique_id for this entity."""
        return self._uuid

    @property
    def state_class(self) -> SensorStateClass:
        """handle string instances"""
        match self._state_class:
            case 'measurement':
                return SensorStateClass.MEASUREMENT

    @property
    def native_unit_of_measurement(self):
        match self._sensor_class:
            case 'humidity':
                return '%'
            case 'precipitation':
                return 'mm'
            case 'precipitation_intensity':
                return 'mm/h'
            case 'temperature':
                return  '°C'
            case 'pressure':
                return  'hPa'

    @property
    def device_class(self) -> SensorDeviceClass:
        """handle string instances"""
        match self._sensor_class:
            case 'humidity':
                return SensorDeviceClass.HUMIDITY
            case 'precipitation':
                return SensorDeviceClass.PRECIPITATION
            case 'precipitation_intensity':
                return SensorDeviceClass.PRECIPITATION_INTENSITY
            case 'temperature':
                return SensorDeviceClass.TEMPERATURE
            case 'pressure':
                return SensorDeviceClass.PRESSURE

    @property
    def native_value(self):
        """Return the state."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        return self._extra_attributes

    def determine_state(self):
        """Determine the sensor state"""
        try:
            self._state = float(self._evaluate_custom_formula(self._formula ,  self._update_vars(self._weather)))
        except ValueError:
            self._state = self._evaluate_custom_formula(self._formula ,  self._update_vars(self._weather))
        #return the attributes if requested
        if self._attributes is not None:
            self._extra_attributes = self._evaluate_custom_attr(self._attributes, self._update_vars(self._weather))

    def _evaluate_custom_formula(self, formula: str, wvars: dict):
        """evaluate the formula/template"""
        environment = jinja2.Environment()
        template = environment.from_string(formula)
        #process the template and handle errors
        try:
            return template.render(wvars)
        except jinja2.UndefinedError as err:
            _LOGGER.warning("Variable not defined in custom formula: %s \n %s", formula, err)
            return 0
        except jinja2.TemplateSyntaxError as err:
            _LOGGER.warning("Syntax error could not evaluate custom formula: %s \n %s", formula, err)
            return 0

    def _evaluate_custom_attr(self, attributes: list, wvars: dict):
        """take the list of vars and build the attrs dictionaty"""
        attrs = {}
        attrs_list = attributes.replace(" ","").replace("'","").strip("[]'").split(",")
        for item in attrs_list:
            if item in wvars:
                attrs.update({item:wvars[item]})
        return attrs

    def _update_vars(self, weather:Weather):
        wvars = {}
        #default to initial days variable
        #need to define 'dummy' versions in the config flow as well
        wvars["cumulative_rain"]    = round(weather.cumulative_rain(),2)
        wvars["cumulative_snow"]    = round(weather.cumulative_snow(),2)
        for i in range(int(max(weather.num_days(),self._initdays))):
            wvars[f"day{i}rain"]        = round(weather.processed_value(i,'rain'),2)
            wvars[f"day{i}snow"]        = round(weather.processed_value(i,'snow'),2)
            wvars[f"day{i}max"]         = round(weather.processed_value(i,'max_temp'),2)
            wvars[f"day{i}min"]         = round(weather.processed_value(i,'min_temp'),2)
        #forecast provides 7 days of data
        for i in range(0,6):
            wvars[f"forecast{i}pop"]      = round(weather.processed_value(f'f{i}','pop'),2)
            wvars[f"forecast{i}rain"]     = round(weather.processed_value(f'f{i}','rain'),2)
            wvars[f"forecast{i}snow"]     = round(weather.processed_value(f'f{i}','snow'),2)
            wvars[f"forecast{i}humidity"] = round(weather.processed_value(f'f{i}','humidity'),2)
            wvars[f"forecast{i}max"]      = round(weather.processed_value(f'f{i}','max_temp'),2)
            wvars[f"forecast{i}min"]      = round(weather.processed_value(f'f{i}','min_temp'),2)
        #current observations
        wvars["current_rain"]        = round(weather.processed_value('current', 'rain'),2)
        wvars["current_snow"]        = round(weather.processed_value('current', 'snow'),2)
        wvars["current_humidity"]    = round(weather.processed_value('current', 'humidity'),2)
        wvars["current_temp"]        = round(weather.processed_value('current', 'temp'),2)
        wvars["current_pressure"]    = round(weather.processed_value('current', 'pressure'),2)
        #special values
        wvars["remaining_backlog"]   = weather.remaining_backlog()
        wvars["daily_count"]         = weather.daily_count()

        return wvars

    def list_vars(self):
        """list all available variables"""
        wvars = self._update_vars(self._weather)
        _LOGGER.warning('Configured max days : %s',self._maxdays)
        _LOGGER.warning('Configured initial days: %s', self._initdays)

        for name, value in wvars.items():
            _LOGGER.warning('%s : %s',name, value)