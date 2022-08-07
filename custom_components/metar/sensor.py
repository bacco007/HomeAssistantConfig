import logging, time
import voluptuous as vol
import homeassistant.helpers.config_validation as cv
from datetime import timedelta
from homeassistant.helpers.config_validation import PLATFORM_SCHEMA
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
from homeassistant.const import ATTR_ATTRIBUTION, ATTR_TIME, CONF_MONITORED_CONDITIONS, TEMP_CELSIUS
try:
    from urllib2 import urlopen
except:
    from urllib.request import urlopen
from metar import Metar

DOMAIN = 'metar'
CONF_AIRPORT_NAME = 'airport_name'
CONF_AIRPORT_CODE = 'airport_code'
SCAN_INTERVAL = timedelta(seconds=3600)
BASE_URL = "https://tgftp.nws.noaa.gov/data/observations/metar/stations/"

_LOGGER = logging.getLogger(__name__)

SENSOR_TYPES = {
    'time': ['Updated ', None],
    'weather': ['Condition', None],
    'temperature': ['Temperature', 'C'],
    'wind': ['Wind speed', None],
    'pressure': ['Pressure', None],
    'visibility': ['Visibility', None],
    'precipitation': ['Precipitation', None],
    'sky': ['Sky', None],
}

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_AIRPORT_NAME): cv.string,
    vol.Required(CONF_AIRPORT_CODE): cv.string,
    vol.Optional(CONF_MONITORED_CONDITIONS, default=[]):
        vol.All(cv.ensure_list, [vol.In(SENSOR_TYPES)]),	
})

def setup_platform(hass, config, add_entities, discovery_info=None):
   airport = {'location': str(config.get(CONF_AIRPORT_NAME)), 'code': str(config.get(CONF_AIRPORT_CODE))}

   data = MetarData(airport)
   dev = []
   for variable in config[CONF_MONITORED_CONDITIONS]:
       dev.append(MetarSensor(airport, data, variable, SENSOR_TYPES[variable][1]))
   add_entities(dev, True)


class MetarSensor(Entity):

    def __init__(self, airport, weather_data, sensor_type, temp_unit):
       self._state = None
       self._name = SENSOR_TYPES[sensor_type][0]
       self._unit_of_measurement = SENSOR_TYPES[sensor_type][1]
       self._airport_name = airport["location"]
       self.type = sensor_type
       self.weather_data = weather_data

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name + " " + self._airport_name;

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return self._unit_of_measurement

    def update(self):
        """Get the latest data from Metar and updates the states."""

        try:
          self.weather_data.update()
        except URLCallError:
          _LOGGER.error("Error when retrieving update data")
          return

        if self.weather_data is None:
            return

        try:
            if self.type == 'time':
                 self._state = self.weather_data.sensor_data.time.ctime()
            if self.type == 'temperature':
                 degree = self.weather_data.sensor_data.temp.string().split(" ")
                 self._state = degree[0]
            elif self.type == 'weather':
                self._state = self.weather_data.sensor_data.present_weather()
            elif self.type == 'wind':
                self._state = self.weather_data.sensor_data.wind()
            elif self.type == 'pressure':
                self._state = self.weather_data.sensor_data.press.string("mb")
            elif self.type == 'visibility':
                self._state = self.weather_data.sensor_data.visibility()
                self._unit_of_measurement = 'm'
            # elif self.type == 'precipitation':
                # self._state = self.weather_data.sensor_data.precip_1hr.string("in")
                # self._unit_of_measurement = 'mm'
            elif self.type == 'sky':
               self._state = self.weather_data.sensor_data.sky_conditions("\n     ")
        except KeyError:
            self._state = None
            _LOGGER.warning(
                "Condition is currently not available: %s", self.type)

class MetarData:
    def __init__(self, airport):
       """Initialize the data object."""
       self._airport_code = airport["code"]
       self.sensor_data = None
       self.update()

    @Throttle(SCAN_INTERVAL)
    def update(self):
        url = BASE_URL + self._airport_code + ".TXT"
        try:
            urlh = urlopen(url)
            report = ''
            for line in urlh:
                if not isinstance(line, str):
                    line = line.decode() 
                if line.startswith(self._airport_code):
                    report = line.strip()
                    self.sensor_data = Metar.Metar(line)
                    _LOGGER.info("METAR ",self.sensor_data.string())
                    break
            if not report:
                _LOGGER.error("No data for ",self._airport_code,"\n\n")
        except Metar.ParserError as exc:
            _LOGGER.error("METAR code: ",line)
            _LOGGER.error(string.join(exc.args,", "),"\n")
        except:
            import traceback
            _LOGGER.error(traceback.format_exc())
            _LOGGER.error("Error retrieving",self._airport_code,"data","\n")