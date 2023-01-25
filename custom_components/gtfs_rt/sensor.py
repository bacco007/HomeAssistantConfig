from datetime import datetime, timedelta
import logging
import requests

import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (CONF_NAME, ATTR_LONGITUDE, ATTR_LATITUDE)
import homeassistant.util.dt as dt_util
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

ATTR_STOP_ID = "Stop ID"
ATTR_ROUTE = "Route"
ATTR_DIRECTION_ID = "Direction ID"
ATTR_DUE_IN = "Due in"
ATTR_DUE_AT = "Due at"
ATTR_NEXT_UP = "Next Service"
ATTR_ICON = "Icon"

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

DEFAULT_SERVICE = 'Service'
DEFAULT_ICON = 'mdi:bus'
DEFAULT_DIRECTION = '0'

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=60)
TIME_STR_FORMAT = "%H:%M"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_TRIP_UPDATE_URL): cv.string,
    vol.Optional(CONF_API_KEY): cv.string,
    vol.Optional(CONF_X_API_KEY): cv.string,
    vol.Optional(CONF_VEHICLE_POSITION_URL): cv.string,
    vol.Optional(CONF_ROUTE_DELIMITER): cv.string,
    vol.Optional(CONF_DEPARTURES): [{
        vol.Required(CONF_NAME): cv.string,
        vol.Required(CONF_STOP_ID): cv.string,
        vol.Required(CONF_ROUTE): cv.string,
        vol.Optional(CONF_DIRECTION_ID, default=DEFAULT_DIRECTION): str,
        vol.Optional(CONF_ICON, default=DEFAULT_ICON): cv.string,
        vol.Optional(CONF_SERVICE_TYPE, default=DEFAULT_SERVICE): cv.string
    }]
})


def due_in_minutes(timestamp):
    """Get the remaining minutes from now until a given datetime object."""
    diff = timestamp - dt_util.now().replace(tzinfo=None)
    return int(diff.total_seconds() / 60)


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Get the public transport sensor."""
    
    data = PublicTransportData(config.get(CONF_TRIP_UPDATE_URL), config.get(CONF_VEHICLE_POSITION_URL), config.get(CONF_ROUTE_DELIMITER), config.get(CONF_API_KEY), config.get(CONF_X_API_KEY))
    sensors = []
    for departure in config.get(CONF_DEPARTURES):
        sensors.append(PublicTransportSensor(
            data,
            departure.get(CONF_STOP_ID),
            departure.get(CONF_ROUTE),
            departure.get(CONF_DIRECTION_ID),
            departure.get(CONF_ICON),
            departure.get(CONF_SERVICE_TYPE),
            departure.get(CONF_NAME)
        ))

    add_devices(sensors)

class PublicTransportSensor(Entity):
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
        
    @Throttle(MIN_TIME_BETWEEN_UPDATES)
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
