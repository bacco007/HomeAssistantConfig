"""Creating sensors for upcoming events."""


from datetime import datetime, timedelta
import logging


from homeassistant.const import CONF_NAME
from homeassistant.helpers.entity import Entity, generate_entity_id

from .const import CONF_MAX_EVENTS, DOMAIN, ICON

_LOGGER = logging.getLogger(__name__)


# async def async_setup_entry(hass, config, add_entities, discovery_info=None):
async def async_setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up this integration with config flow."""
    return True
    """Set up the iCal Sensor."""
    name = config.get(CONF_NAME)
    max_events = config.get(CONF_MAX_EVENTS)

    ical_events = hass.data[DOMAIN][name]
    _LOGGER.debug(f"Data: {ical_events}")
    await ical_events.update()

    if ical_events.calendar is None:
        _LOGGER.error("Unable to fetch iCal")
        return False

    sensors = []
    for eventnumber in range(max_events):
        sensors.append(ICalSensor(hass, ical_events, DOMAIN + " " + name, eventnumber))

    add_entities(sensors)



async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the iCal Sensor."""
    config = config_entry.data
    name = config.get(CONF_NAME)
    max_events = config.get(CONF_MAX_EVENTS)

    ical_events = hass.data[DOMAIN][name]
    await ical_events.update()
    if ical_events.calendar is None:
        _LOGGER.error("Unable to fetch iCal")
        return False

    sensors = []
    for eventnumber in range(max_events):
        sensors.append(ICalSensor(hass, ical_events, DOMAIN + " " + name, eventnumber))

    async_add_entities(sensors)


# pylint: disable=too-few-public-methods
class ICalSensor(Entity):
    """
    Implementation of a iCal sensor.

    Represents the Nth upcoming event.
    May have a name like 'sensor.mycalander_event_0' for the first
    upcoming event.
    """

    def __init__(self, hass, ical_events, sensor_name, event_number):
        """
        Initialize the sensor.

        sensor_name is typically the name of the calendar.
        eventnumber indicates which upcoming event this is, starting at zero
        """
        self._event_number = event_number
        self._hass = hass
        self.ical_events = ical_events
        self._entity_id = generate_entity_id(
            "sensor.{}",
            f"{sensor_name} event {self._event_number}",
            hass=self._hass,
        )
        # self._name = sensor_name + " event " + str(self._event_number)
        self._event_attributes = {
            "summary": None,
            "description": None,
            "location": None,
            "start": None,
            "end": None,
            "eta": None,
        }
        self._state = None
        self._is_available = None

    @property
    def entity_id(self):
        """Return the entity_id of the sensor."""
        return self._entity_id

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._event_attributes["summary"]

    @property
    def icon(self):
        """Return the icon for the frontend."""
        return ICON

    @property
    def state(self):
        """Return the date of the next event."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the attributes of the event."""
        return self._event_attributes

    @property
    def available(self):
        """Return True if ZoneMinder is available."""
        return self.extra_state_attributes["start"] is not None

    async def async_update(self):
        """Update the sensor."""
        _LOGGER.debug("Running ICalSensor async update for %s", self.name)

        await self.ical_events.update()

        event_list = self.ical_events.calendar
        # _LOGGER.debug(f"Event List: {event_list}")
        if event_list and (self._event_number < len(event_list)):
            val = event_list[self._event_number]
            name = val.get("summary", "Unknown")
            start = val.get("start")

            # _LOGGER.debug(f"Val: {val}")
            _LOGGER.debug(
                "Adding event %s - Start %s - End %s - as event %s to calendar %s",
                val.get("summary", "unknown"),
                val.get("start"),
                val.get("end"),
                str(self._event_number),
                self.name,
            )

            self._event_attributes["summary"] = val.get("summary", "unknown")
            self._event_attributes["start"] = val.get("start")
            self._event_attributes["end"] = val.get("end")
            self._event_attributes["location"] = val.get("location", "")
            self._event_attributes["description"] = val.get("description", "")
            self._event_attributes["eta"] = (
                start - datetime.now(start.tzinfo) + timedelta(days=1)
            ).days
            self._event_attributes["all_day"] = val.get("all_day")
            self._state = f"{name} - {start.strftime('%-d %B %Y')}"
            if not val.get("all_day"):
                self._state += f" {start.strftime('%H:%M')}"
            # self._is_available = True
        elif self._event_number >= len(event_list):
            # No further events are found in the calendar
            self._event_attributes = {
                "summary": None,
                "description": None,
                "location": None,
                "start": None,
                "end": None,
                "eta": None,
            }
            self._state = None
            self._is_available = None
