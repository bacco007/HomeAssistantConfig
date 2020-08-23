from datetime import timedelta
import logging
from typing import Optional

from aiohttp import ClientSession
from aio_geojson_query import GeoJsonQueryFeedManager

import voluptuous as vol

from homeassistant.components.geo_location import PLATFORM_SCHEMA, GeolocationEvent
from homeassistant.const import (
    ATTR_ATTRIBUTION,
    ATTR_LOCATION,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_RADIUS,
    CONF_SCAN_INTERVAL,
    EVENT_HOMEASSISTANT_START,
    EVENT_HOMEASSISTANT_STOP,
    LENGTH_KILOMETERS,
)
from homeassistant.core import callback
from homeassistant.helpers import aiohttp_client, config_validation as cv
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType, HomeAssistantType

_LOGGER = logging.getLogger(__name__)

# Hmmm+
ATTR_CATEGORY = "category"
ATTR_AREA = "area"
ATTR_EXTERNAL_ID = "external_id"
ATTR_FIRE = "fire"
ATTR_PUBLICATION_DATE = "publication_date"
ATTR_RESPONSIBLE_AGENCY = "responsible_agency"
ATTR_SIZE = "size"
ATTR_STATUS = "status"
ATTR_TYPE = "type"
# Hmmm-

DEFAULT_RADIUS_IN_KM = 20.0
SCAN_INTERVAL = timedelta(minutes=1)

SIGNAL_DELETE_ENTITY = "aio_geo_json_service_feed_delete_{}"
SIGNAL_UPDATE_ENTITY = "aio_geo_json_service_feed_update_{}"

SOURCE_PREFIX = "aio_geo_"

CONF_SOURCE = "source"
CONF_ENDPOINT = "endpoint"
CONF_CRITERIA = "criteria"
CONF_MAPPINGS = "mappings"
CONF_XTRAFIELDS = "extra_fields"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_SOURCE, default="aio_geo_query"): cv.string,
        vol.Optional(CONF_ENDPOINT): cv.string,
        vol.Optional(CONF_LATITUDE): cv.latitude,
        vol.Optional(CONF_LONGITUDE): cv.longitude,
        vol.Optional(CONF_RADIUS, default=DEFAULT_RADIUS_IN_KM): vol.Coerce(float),
        vol.Optional(CONF_CRITERIA, default=[]): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(CONF_MAPPINGS, default={}): dict,
        vol.Optional(CONF_XTRAFIELDS, default=[]): vol.All(cv.ensure_list, [cv.string]),
    }
)


async def async_setup_platform(
    hass: HomeAssistantType, config: ConfigType, async_add_entities, discovery_info=None
):
    scan_interval = config.get(CONF_SCAN_INTERVAL, SCAN_INTERVAL)
    source_name = config.get(CONF_SOURCE)
    coordinates = (
        config.get(CONF_LATITUDE, hass.config.latitude),
        config.get(CONF_LONGITUDE, hass.config.longitude),
    )
    radius_in_km = config[CONF_RADIUS]
    endpoint = config[CONF_ENDPOINT]
    criteria = [cr.split(' ', 2) for cr in config.get(CONF_CRITERIA)]
    mappings = config.get(CONF_MAPPINGS)
    xtrafields = config.get(CONF_XTRAFIELDS)

    manager = DelegateFeedManager(
        hass,
        async_add_entities,
        scan_interval,
        coordinates,
        radius_in_km,
        source_name,
        endpoint,
        criteria,
        mappings,
        xtrafields,
    )


    async def start_feed_manager(event):
        await manager.async_init()


    async def stop_feed_manager(event):
        await manager.async_stop()


    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_START, start_feed_manager)
    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, stop_feed_manager)
    hass.async_create_task(manager.async_update())


class DelegateFeedManager:

    def __init__(
        self,
        hass,
        async_add_entities,
        scan_interval,
        coordinates,
        radius_in_km,
        source_name,
        endpoint,
        criteria,
        mappings,
        xtrafields,
    ):
        self._hass = hass
        websession = aiohttp_client.async_get_clientsession(hass)
        self._feed_manager = GeoJsonQueryFeedManager(
            websession,
            endpoint,
            self._generate_entity,
            self._update_entity,
            self._remove_entity,
            coordinates,
            filter_radius=radius_in_km,
            filter_criteria=criteria,
            mappings=mappings,
        )
        self._source_name = source_name
        self._xtrafields = xtrafields
        self._async_add_entities = async_add_entities
        self._scan_interval = scan_interval
        self._track_time_remove_callback = None


    async def async_init(self):
        """Schedule initial and regular updates based on configured time interval."""

        async def update(event_time):
            await self.async_update()

        # Trigger updates at regular intervals.
        self._track_time_remove_callback = async_track_time_interval(
            self._hass, update, self._scan_interval
        )

        _LOGGER.debug("Feed entity manager initialized")


    async def async_update(self):
        await self._feed_manager.update()
        _LOGGER.debug("Feed entity manager updated")


    async def async_stop(self):
        """Stop this feed entity manager from refreshing."""
        if self._track_time_remove_callback:
            self._track_time_remove_callback()
        _LOGGER.debug("Feed entity manager stopped")


    def get_entry(self, external_id):
        return self._feed_manager.feed_entries.get(external_id)


    async def _generate_entity(self, external_id):
        new_entity = GenericLocationEvent(self, external_id)
        self._async_add_entities([new_entity], True)


    async def _update_entity(self, external_id):
        async_dispatcher_send(self._hass, SIGNAL_UPDATE_ENTITY.format(external_id))


    async def _remove_entity(self, external_id):
        async_dispatcher_send(self._hass, SIGNAL_DELETE_ENTITY.format(external_id))


class GenericLocationEvent(GeolocationEvent):
    """This represents an external event."""


    def __init__(self, feed_manager, external_id):
        """Initialize entity with data from feed entry."""
        self._feed_manager = feed_manager
        self._external_id = external_id
        self._name = None
        self._description = None
        self._distance = None
        self._publication_date = None
        self._location = None
        self._area = None
        self._latitude = None
        self._longitude = None
        self._attribution = None
        self._status = None
        self._type = None
        self._size = None
        self._agency = None
        self._unit_of_measurement = LENGTH_KILOMETERS
        self._remove_signal_delete = None
        self._remove_signal_update = None

    async def async_added_to_hass(self):
        """Call when entity is added to hass."""
        self._remove_signal_delete = async_dispatcher_connect(
            self.hass,
            SIGNAL_DELETE_ENTITY.format(self._external_id),
            self._delete_callback,
        )
        self._remove_signal_update = async_dispatcher_connect(
            self.hass,
            SIGNAL_UPDATE_ENTITY.format(self._external_id),
            self._update_callback,
        )


    async def async_will_remove_from_hass(self) -> None:
        self._remove_signal_delete()
        self._remove_signal_update()

    @callback
    def _delete_callback(self):
        self.hass.async_create_task(self.async_remove())


    @callback
    def _update_callback(self):
        self.async_schedule_update_ha_state(True)

    @property
    def should_poll(self):
        """No polling needed."""
        return False


    async def async_update(self):
        """Update this entity from the data held in the feed manager."""
        _LOGGER.debug("Updating %s", self._external_id)
        feed_entry = self._feed_manager.get_entry(self._external_id)
        if feed_entry:
            self._update_from_feed(feed_entry)


    def _update_from_feed(self, feed_entry):
        """Update the internal state from the provided feed entry."""
        # Copy requested extra fields
        for field_name in self._feed_manager._xtrafields:
          self.__dict__[field_name] = feed_entry._search_in_properties(field_name)

        self._name = feed_entry.title
        self._description = feed_entry.description
        self._distance = feed_entry.distance_to_home
        self._publication_date = feed_entry.publication_date
        self._location = feed_entry.location
        self._area = feed_entry.area
        self._latitude  = feed_entry.coordinates[0]
        self._longitude = feed_entry.coordinates[1]
        self._status = feed_entry.status
        self._attribution = feed_entry.attribution
        self._type = feed_entry.type
        self._size = feed_entry.size
        self._agency = feed_entry.agency


    @property
    def icon(self):
        return "mdi:alarm-light"


    @property
    def source(self) -> str:
        return SOURCE_PREFIX + self._feed_manager._source_name


    @property
    def name(self) -> Optional[str]:
        return self._name


    @property
    def distance(self) -> Optional[float]:
        return self._distance


    @property
    def latitude(self) -> Optional[float]:
        return self._latitude


    @property
    def longitude(self) -> Optional[float]:
        return self._longitude


    @property
    def unit_of_measurement(self):
        return LENGTH_KILOMETERS


    @property
    def device_state_attributes(self):
        attributes = {}
        for key, value in (
            (ATTR_EXTERNAL_ID, self._external_id),
            (ATTR_LOCATION, self._location),
            (ATTR_AREA, self._area),
            (ATTR_ATTRIBUTION, self._attribution),
            (ATTR_PUBLICATION_DATE, self._publication_date),
            (ATTR_STATUS, self._status),
            (ATTR_TYPE, self._type),
            (ATTR_SIZE, self._size),
            (ATTR_RESPONSIBLE_AGENCY, self._agency),
        ):
            if value or isinstance(value, bool):
                attributes[key] = value
        for field_name in self._feed_manager._xtrafields:
            attributes[field_name] = self.__dict__[field_name]
        return attributes
