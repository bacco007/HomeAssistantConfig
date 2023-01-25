"""
Script for quicker and easier testing of GTFS-RT-V2 outside of Home Assistant.
Usage: test.py -f <yaml file> -d INFO|DEBUG { -l <outfile log file> }

<yaml file> contains the sensor configuration from HA.  See test_translink.yaml for example
<output file> is a text file for output
"""
from urllib.request import urlopen, Request
from datetime import datetime, timedelta
from schema import Schema, SchemaError, Optional
import sys
import logging
import yaml
import requests
import argparse

sys.path.append("lib")
_LOGGER = logging.getLogger(__name__)

ATTR_STOP_ID = "Stop ID"
ATTR_ROUTE = "Route"
ATTR_DIRECTION_ID = "Direction ID"
ATTR_DUE_IN = "Due in"
ATTR_DUE_AT = "Due at"
ATTR_NEXT_UP = "Next Service"
ATTR_ICON = "Icon"
ATTR_LATITUDE = "Latitude"
ATTR_LONGITUDE = "Longitude"

CONF_API_KEY = 'api_key'
CONF_X_API_KEY = 'x_api_key'
CONF_STOP_ID = 'stopid'
CONF_ROUTE = 'route'
CONF_DIRECTION_ID = 'directionid'
CONF_DEPARTURES = 'departures'
CONF_TRIP_UPDATE_URL = 'trip_update_url'
CONF_VEHICLE_POSITION_URL = 'vehicle_position_url'
CONF_ROUTE_DELIMITER = 'route_delimiter'
CONF_ICON = 'icon'
CONF_SERVICE_TYPE = 'service_type'
CONF_NAME = 'name'

DEFAULT_SERVICE = 'Service'
DEFAULT_ICON = 'mdi:bus'
DEFAULT_DIRECTION = '0'

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=60)
TIME_STR_FORMAT = "%H:%M"

PLATFORM_SCHEMA = Schema({
    CONF_TRIP_UPDATE_URL: str,
    Optional(CONF_API_KEY): str,
    Optional(CONF_X_API_KEY): str,
    Optional(CONF_VEHICLE_POSITION_URL): str,
    Optional(CONF_ROUTE_DELIMITER): str,
    CONF_DEPARTURES: [{
        CONF_NAME: str,
        CONF_STOP_ID: str,
        CONF_ROUTE: str,
        Optional(CONF_DIRECTION_ID): str,
        Optional(CONF_SERVICE_TYPE): str,
        Optional(CONF_ICON): str
    }]
})

def due_in_minutes(timestamp):
    """Get the remaining minutes from now until a given datetime object."""
    diff = timestamp - datetime.now().replace(tzinfo=None)
    return int(diff.total_seconds() / 60)

#class PublicTransportSensor(Entity):
class PublicTransportSensor(object):
    """Implementation of a public transport sensor."""

    def __init__(self, data, stop, route, direction, icon, service_type, name):
        """Initialize the sensor."""
        self.data = data
        self._name = name
        self._stop = stop
        self._route = route
        self._direction = direction
        self._icon = icon
        self._service_type = service_type
        self.update()

    @property
    def name(self):
        return self._name

    def _get_next_services(self):
        return self.data.info.get(self._route, {}).get(self._direction, {}).get(self._stop, [])

    @property
    def state(self):
        """Return the state of the sensor."""
        next_services = self._get_next_services()
        return due_in_minutes(next_services[0].arrival_time) if len(next_services) > 0 else '-'

    @property
    def extra_state_attributes(self):
        """Return the state attributes."""
        next_services = self._get_next_services()
        ATTR_NEXT_UP = "Next " + self._service_type
        attrs = {
            ATTR_DUE_IN: self.state,
            ATTR_STOP_ID: self._stop,
            ATTR_ROUTE: self._route,
            ATTR_DIRECTION_ID: self._direction
        }
        if len(next_services) > 0:
            attrs[ATTR_DUE_AT] = next_services[0].arrival_time.strftime(TIME_STR_FORMAT) if len(next_services) > 0 else '-'
            if next_services[0].position:
                attrs[ATTR_LATITUDE] = next_services[0].position.latitude
                attrs[ATTR_LONGITUDE] = next_services[0].position.longitude
        if len(next_services) > 1:
            attrs[ATTR_NEXT_UP] = next_services[1].arrival_time.strftime(TIME_STR_FORMAT) if len(next_services) > 1 else '-'
        return attrs

    @property
    def unit_of_measurement(self):
        """Return the unit this state is expressed in."""
        return "min"

    @property
    def icon(self):
        return self._icon

    @property
    def service_type(self):
        return self._service_type

    def update(self):
        """Get the latest data from opendata.ch and update the states."""
        self.data.update()
        _LOGGER.info("Sensor Update:")
        _LOGGER.info("...Name: {0}".format(self._name))
        _LOGGER.info("...{0}: {1}".format(ATTR_ROUTE,self._route))
        _LOGGER.info("...{0}: {1}".format(ATTR_STOP_ID,self._stop))
        _LOGGER.info("...{0}: {1}".format(ATTR_DIRECTION_ID,self._direction))
        _LOGGER.info("...{0}: {1}".format(ATTR_ICON,self._icon))
        _LOGGER.info("...Service Type: {0}".format(self._service_type))
        _LOGGER.info("...{0}: {1}".format("unit_of_measurement",self.unit_of_measurement))
        _LOGGER.info("...{0}: {1}".format(ATTR_DUE_IN,self.state))
        try:
            _LOGGER.info("...{0}: {1}".format(ATTR_DUE_AT,self.extra_state_attributes[ATTR_DUE_AT]))
        except:
            _LOGGER.info("...{0} not defined".format(ATTR_DUE_AT))
        try:
            _LOGGER.info("...{0}: {1}".format(ATTR_LATITUDE,self.extra_state_attributes[ATTR_LATITUDE]))
        except:
            _LOGGER.info("...{0} not defined".format(ATTR_LATITUDE))
        try:
            _LOGGER.info("...{0}: {1}".format(ATTR_LONGITUDE,self.extra_state_attributes[ATTR_LONGITUDE]))
        except:
            _LOGGER.info("...{0} not defined".format(ATTR_LONGITUDE))
        try:
            _LOGGER.info("...Next {0}: {1}".format(self._service_type,self.extra_state_attributes["Next " + self._service_type]))
        except:
            _LOGGER.info("...{0} not defined".format("Next " + self._service_type))


class PublicTransportData(object):
    """The Class for handling the data retrieval."""

    def __init__(self, trip_update_url, vehicle_position_url=None, route_delimiter=None, api_key=None, x_api_key=None):
        """Initialize the info object."""
        self._trip_update_url = trip_update_url
        self._vehicle_position_url = vehicle_position_url
        self._route_delimiter = route_delimiter
        if api_key is not None:
            self._headers = {'Authorization': api_key}
        elif x_api_key is not None:
            self._headers = {'x-api-key': x_api_key}
        else:
            self._headers = None
        self.info = {}
        
    #@Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):
        _LOGGER.info("trip_update_url: {}".format(self._trip_update_url))
        _LOGGER.info("vehicle_position_url: {}".format(self._vehicle_position_url))
        _LOGGER.info("route_delimiter: {0}".format(self._route_delimiter))
        _LOGGER.info("header: {0}".format(self._headers))

        positions = self._get_vehicle_positions() if self._vehicle_position_url else {}
        self._update_route_statuses(positions)

    def _update_route_statuses(self, vehicle_positions):
        """Get the latest data."""
        from google.transit import gtfs_realtime_pb2

        class StopDetails:
            def __init__(self, arrival_time, position):
                self.arrival_time = arrival_time
                self.position = position

        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(self._trip_update_url, headers=self._headers)
        if response.status_code == 200:
            _LOGGER.info("Successfully updated trip data - {}".format(response.status_code))
        else:
            _LOGGER.error("updating trip data got {}:{}".format(response.status_code,response.content))
        feed.ParseFromString(response.content)
        departure_times = {}

        for entity in feed.entity:
            if entity.HasField('trip_update'):
                # If delimiter specified split the route id in the gtfs rt feed
                _LOGGER.debug("...Received Trip Id {} Route Id: {} direction id {} Start Time: {} Start Date: {}".format(entity.trip_update.trip.trip_id,entity.trip_update.trip.route_id,entity.trip_update.trip.direction_id,entity.trip_update.trip.start_time,entity.trip_update.trip.start_date))
                if self._route_delimiter is not None:
                    route_id_split = entity.trip_update.trip.route_id.split(self._route_delimiter)
                    if route_id_split[0] == self._route_delimiter:
                          route_id = entity.trip_update.trip.route_id
                    else:
                          route_id = route_id_split[0]

                    _LOGGER.debug("...Feed Route Id {} changed to {}".format(entity.trip_update.trip.route_id,route_id))
                else:
                    route_id = entity.trip_update.trip.route_id
                
                if route_id not in departure_times:
                    departure_times[route_id] = {}

                if entity.trip_update.trip.direction_id is not None:
                    direction_id = str(entity.trip_update.trip.direction_id)
                else:
                    direction_id = DEFAULT_DIRECTION
                if direction_id not in departure_times[route_id]:
                    departure_times[route_id][direction_id] = {}

                for stop in entity.trip_update.stop_time_update:
                    stop_id = stop.stop_id
                    if not departure_times[route_id][direction_id].get(stop_id):
                        departure_times[route_id][direction_id][stop_id] = []
                    # Use stop arrival time; fall back on stop departure time if not available
                    if stop.arrival.time == 0:
                        stop_time = stop.departure.time
                    else:
                        stop_time = stop.arrival.time
                    _LOGGER.debug("......Stop: {} Stop Sequence: {} Stop Time: {}".format(stop_id,stop.stop_sequence,stop_time))
                    # Ignore arrival times in the past
                    if due_in_minutes(datetime.fromtimestamp(stop_time)) >= 0:
                        _LOGGER.debug(".........Adding route id {}, trip id {}, direction id {}, stop id {}, stop time {}".format(route_id,entity.trip_update.trip.trip_id,entity.trip_update.trip.direction_id,stop_id,stop_time))
                        details = StopDetails(
                            datetime.fromtimestamp(stop_time),
                            vehicle_positions.get(entity.trip_update.trip.trip_id)
                        )
                        departure_times[route_id][direction_id][stop_id].append(details)

        # Sort by arrival time
        for route in departure_times:
            for direction in departure_times[route]:
                for stop in departure_times[route][direction]:
                    departure_times[route][direction][stop].sort(key=lambda t: t.arrival_time)

        self.info = departure_times

    def _get_vehicle_positions(self):
        from google.transit import gtfs_realtime_pb2
        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(self._vehicle_position_url, headers=self._headers)
        if response.status_code == 200:
            _LOGGER.info("Successfully updated vehicle positions - {}".format(response.status_code))
        else:            
            _LOGGER.error("updating vehicle positions got {}:{}.".format(response.status_code, response.content))
        feed.ParseFromString(response.content)
        positions = {}

        for entity in feed.entity:
            vehicle = entity.vehicle

            if not vehicle.trip.trip_id:
                # Vehicle is not in service
                continue

            _LOGGER.debug("......Adding position for trip id {} position latitude {} longitude {} ".format(vehicle.trip.trip_id,vehicle.position.latitude,vehicle.position.longitude))
            positions[vehicle.trip.trip_id] = vehicle.position
            
        return positions

#
#
#
parser = argparse.ArgumentParser(description='Test script for ha-gtfs-rt-v2')
parser.add_argument("-f", "--file", dest="file",
                  help="Config file to use", metavar="FILE")
parser.add_argument("-l", "--log", dest="log",
                  help="Output file for log", metavar="FILE")
parser.add_argument("-d", "--debug", dest="debug",
                  help="Debug level: INFO (default) or DEBUG")
args = vars(parser.parse_args())

if args['file'] is None:
    raise ValueError('Config file spec required.')
if args['debug'] is None:
    DEBUG_LEVEL = 'INFO'
elif args['debug'].upper() == "INFO" or args['debug'].upper() == "DEBUG":
    DEBUG_LEVEL = args['debug'].upper()
else:
    raise ValueError("Debug level must be INFO or DEBUG")
if args['log'] is None:
    logging.basicConfig(level=DEBUG_LEVEL)
else:
    logging.basicConfig(filename=args['log'],filemode='w',level=DEBUG_LEVEL)


with open(args['file'], 'r') as test_yaml:
    configuration = yaml.safe_load(test_yaml)
try:
    PLATFORM_SCHEMA.validate(configuration)
    logging.info("Input file configuration is valid.")

    data = PublicTransportData(configuration.get(CONF_TRIP_UPDATE_URL),configuration.get(CONF_VEHICLE_POSITION_URL),configuration.get(CONF_ROUTE_DELIMITER), 
        configuration.get(CONF_API_KEY,None),configuration.get(CONF_X_API_KEY,None))

    sensors = []
    for departure in configuration[CONF_DEPARTURES]:
        _LOGGER.info("Adding Sensor: Name: {}, route id: {}, direction id: {}".format(departure[CONF_NAME],departure[CONF_ROUTE],departure[CONF_STOP_ID]))
        sensors.append(PublicTransportSensor(
            data,
            departure.get(CONF_STOP_ID),
            departure.get(CONF_ROUTE),
            departure.get(CONF_DIRECTION_ID, DEFAULT_DIRECTION),
            departure.get(CONF_ICON, DEFAULT_ICON),
            departure.get(CONF_SERVICE_TYPE, DEFAULT_SERVICE),
            departure.get(CONF_NAME)
       ))
    test_yaml.close

except SchemaError as se:
    logging.info("Input file configuration invalid: {}".format(se))