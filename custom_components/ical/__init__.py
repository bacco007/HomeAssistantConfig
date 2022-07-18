"""The ical integration."""

import asyncio
from datetime import datetime, timedelta
import logging
from urllib.parse import urlparse

from dateutil.rrule import rruleset, rrulestr
from dateutil.tz import gettz, tzutc
import icalendar
import voluptuous as vol
from homeassistant.components.calendar import CalendarEvent

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import Throttle, dt

from .const import CONF_DAYS, CONF_MAX_EVENTS, DOMAIN

_LOGGER = logging.getLogger(__name__)


CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

# TODO List the platforms that you want to support.
# For your initial PR, limit it to 1 platform.
PLATFORMS = ["sensor", "calendar"]
# PLATFORMS = ["sensor"]

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=120)


def setup(hass, config):
    """Set up this integration with config flow."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up ical from a config entry."""
    config = entry.data
    _LOGGER.debug(
        "Running init async_setup_entry for calendar %s", config.get(CONF_NAME)
    )
    # TODO Store an API object for your platforms to access
    # hass.data[DOMAIN][entry.entry_id] = MyApi(...)
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    hass.data[DOMAIN][config.get(CONF_NAME)] = ICalEvents(hass=hass, config=config)

    for component in PLATFORMS:
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, component)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    config = entry.data
    _LOGGER.debug("Running async_unload_entry for calendar %s", config.get(CONF_NAME))
    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, component)
                for component in PLATFORMS
            ]
        )
    )
    if unload_ok:
        hass.data[DOMAIN].pop(config.get(CONF_NAME))

    return unload_ok


class ICalEvents:
    """Get a list of events."""

    def __init__(self, hass, config):
        """Set up a calendar object."""
        self.hass = hass
        self.name = config.get(CONF_NAME)
        self.url = config.get(CONF_URL)
        self.max_events = config.get(CONF_MAX_EVENTS)
        self.days = config.get(CONF_DAYS)
        self.verify_ssl = config.get(CONF_VERIFY_SSL)
        self.calendar = []
        self.event = None
        self.all_day = False

    async def async_get_events(self, hass, start_date, end_date):
        """Get list of upcoming events."""
        _LOGGER.debug("Running ICalEvents async_get_events")
        events = []
        if len(self.calendar) > 0:
            for event in self.calendar:
                _LOGGER.debug(
                    "Checking if event %s has start %s and end %s within in the limit: %s and %s",
                    event["summary"],
                    event["start"],
                    event["end"],
                    start_date,
                    end_date,
                )

                if event["start"] < end_date and event["end"] > start_date:
                    _LOGGER.debug("... and it has")
                    # strongly type class fix
                    events.append(
                        CalendarEvent(event["start"], event["end"], event["summary"])
                    )
                    # events.append(event)
        return events

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    async def update(self):
        """Update list of upcoming events."""
        _LOGGER.debug("Running ICalEvents update for calendar %s", self.name)
        parts = urlparse(self.url)
        if parts.scheme == "file":
            with open(parts.path) as f:
                text = f.read()
        else:
            if parts.scheme == "webcal":
                # There is a potential issue here if the real URL is http, not https
                self.url = parts.geturl().replace("webcal", "https", 1)
            session = async_get_clientsession(self.hass, verify_ssl=self.verify_ssl)
            async with session.get(self.url) as response:
                text = await response.text()
        if text is not None:
            # Some calendars are for some reason filled with NULL-bytes.
            # They break the parsing, so we get rid of them
            event_list = icalendar.Calendar.from_ical(text.replace("\x00", ""))
            start_of_events = dt.start_of_local_day()
            end_of_events = dt.start_of_local_day() + timedelta(days=self.days)

            self.calendar = self._ical_parser(
                event_list, start_of_events, end_of_events
            )

        if len(self.calendar) > 0:
            found_next_event = False
            for event in self.calendar:
                if event["end"] > dt.now() and not found_next_event:
                    _LOGGER.debug(
                        "Event %s it the first event with end in the future: %s",
                        event["summary"],
                        event["end"],
                    )
                    self.event = event
                    found_next_event = True

    def _ical_parser(self, calendar, from_date, to_date):
        """Return a sorted list of events from a icalendar object."""

        events = []

        for event in calendar.walk("VEVENT"):
            # RRULEs turns out to be harder than initially thought.
            # This is mainly due to pythons handling of TZ-naive and TZ-aware timestamps, and the inconsistensies
            # in the way RRULEs are implemented in the icalendar library.
            if "RRULE" in event:
                # _LOGGER.debug("RRULE in event: %s", str(event["SUMMARY"]))
                rrule = event["RRULE"]
                # Since we dont get both the start and the end in a single object, we need to generate two lists,
                # One of all the DTSTARTs and another list of all the DTENDs
                start_rules = rruleset()
                end_rules = rruleset()

                if "UNTIL" in rrule:
                    try:
                        # Just ignore events that ended a long time ago
                        if rrule["UNTIL"][0] < from_date - timedelta(days=30):
                            # _LOGGER.debug("Old event 1 %s - ended %s", event["SUMMARY"], str(rrule["UNTIL"][0]))
                            continue
                    except Exception:
                        pass

                    _LOGGER.debug("UNTIL in rrule: %s", str(rrule["UNTIL"]))
                    # Ensure that UNTIL is tz-aware and in UTC
                    # (Not all icalendar implements this correctly)
                    until = self._ical_date_fixer(rrule["UNTIL"], "UTC")
                    rrule["UNTIL"] = [until]
                else:
                    _LOGGER.debug("No UNTIL in rrule")

                _LOGGER.debug("DTSTART in rrule: %s", str(event["DTSTART"].dt))
                dtstart = self._ical_date_fixer(
                    event["DTSTART"].dt, dt.DEFAULT_TIME_ZONE
                )

                # If we don't have a DTEND, just use DTSTART
                if "DTEND" not in event:
                    dtend = dtstart
                else:
                    _LOGGER.debug("DTEND in rrule: %s", str(event["DTEND"].dt))
                    dtend = self._ical_date_fixer(
                        event["DTEND"].dt, dt.DEFAULT_TIME_ZONE
                    )

                # So hopefully we now have a proper dtstart we can use to create the start-times according to the rrule
                # _LOGGER.debug("RRulestr %s", rrule.to_ical().decode("utf-8"))
                try:
                    start_rules.rrule(
                        rrulestr(rrule.to_ical().decode("utf-8"), dtstart=dtstart)
                    )
                except Exception as e:
                    # If this fails, move on to the next event
                    _LOGGER.error(
                        "Exception %s in start_rules.rrule: %s - Start: %s - RRule: %s",
                        str(e),
                        str(event["SUMMARY"]),
                        str(dtstart),
                        str(event["RRULE"]),
                    )
                    continue
                # _LOGGER.debug("Start rules %s", str(list(start_rules)))

                # ... And the same for end_rules
                try:
                    end_rules.rrule(
                        rrulestr(rrule.to_ical().decode("utf-8"), dtstart=dtend)
                    )
                except Exception as e:
                    # If this fails, just use the start-rules
                    _LOGGER.error(
                        "Exception %s in end_rules.rrule: %s - End: %s - RRule: %s",
                        str(e),
                        str(event["SUMMARY"]),
                        str(dtend),
                        str(event["RRULE"]),
                    )
                    end_rules = start_rules

                # EXDATEs are hard to parse.  They might be a list, or just a single object.
                # They might contain TZ-data, they might not...
                # We just do our best, and will catch the exception when it fails and move on the the next event.
                try:
                    if "EXDATE" in event:
                        if isinstance(event["EXDATE"], list):
                            for exdate in event["EXDATE"]:
                                for edate in exdate.dts:
                                    start_rules.exdate(edate.dt)
                                    end_rules.exdate(edate.dt)
                        else:
                            for edate in event["EXDATE"].dts:
                                start_rules.exdate(edate.dt)
                                end_rules.exdate(edate.dt)
                except Exception as e:
                    _LOGGER.error(
                        "Exception %s in EXDATE: %s - Start: %s - RRule: %s - EXDate: %s",
                        str(e),
                        str(event["SUMMARY"]),
                        str(dtstart),
                        str(event["RRULE"]),
                        str(event["EXDATE"]),
                    )
                    continue

                # Lets get all RRULE-generated events which will start 7 days before today and end before to_date
                # to ensure we are catching (most) recurring events that might already have started.
                try:
                    starts = start_rules.between(
                        after=(from_date - timedelta(days=7)), before=to_date
                    )
                    ends = end_rules.between(
                        after=(from_date - timedelta(days=7)), before=to_date
                    )
                except Exception as e:
                    _LOGGER.error(
                        "Exception %s in starts/ends: %s - Start: %s - End: %s, RRule: %s",
                        str(e),
                        str(event["SUMMARY"]),
                        str(dtstart),
                        str(dtend),
                        str(event["RRULE"]),
                    )
                    continue

                # _LOGGER.debug("Starts: %s", str(starts))
                # We might get RRULEs that does not fall within the limits above, lets just skip them
                if len(starts) < 1:
                    _LOGGER.debug("Event does not happen within our limits")
                    continue

                # It has to be a better way to do this...But at least it seems to work for now.
                ends.reverse()
                for start in starts:
                    # Sometimes we dont get the same number of starts and ends...
                    if len(ends) == 0:
                        continue
                    end = ends.pop()
                    event_dict = self._ical_event_dict(start, end, from_date, event)

                    if event_dict:
                        events.append(event_dict)

                _LOGGER.debug("Done parsing RRULE")

            else:
                # Let's use the same magic as for rrules to get this (as) right (as possible)
                try:
                    # Just ignore events that ended a long time ago
                    if "DTEND" in event and event[
                        "DTEND"
                    ].dt.date() < from_date.date() - timedelta(days=30):
                        # _LOGGER.debug("Old event 1 %s - ended %s", event["SUMMARY"], str(event["DTEND"].dt))
                        continue
                except Exception:
                    # _LOGGER.debug("1: %s", str(e))
                    pass
                try:
                    if "DTEND" in event and event[
                        "DTEND"
                    ].dt < from_date.date() - timedelta(days=30):
                        # _LOGGER.debug("Old event 2 %s - ended %s", event["SUMMARY"], str(event["DTEND"].dt))
                        continue
                except Exception:
                    # _LOGGER.debug("2: %s", str(e))
                    pass

                _LOGGER.debug("DTSTART in event: {}".format(event["DTSTART"].dt))
                dtstart = self._ical_date_fixer(
                    event["DTSTART"].dt, dt.DEFAULT_TIME_ZONE
                )

                start = dtstart

                if "DTEND" not in event:
                    dtend = dtstart
                else:
                    _LOGGER.debug("DTEND in event")
                    dtend = self._ical_date_fixer(
                        event["DTEND"].dt, dt.DEFAULT_TIME_ZONE
                    )
                end = dtend

                event_dict = self._ical_event_dict(start, end, from_date, event)
                if event_dict:
                    events.append(event_dict)

        sorted_events = sorted(events, key=lambda k: k["start"])
        return sorted_events

    def _ical_event_dict(self, start, end, from_date, event):
        """Ensure that events are within the start and end."""

        # Skip this event if it's in the past
        if end.date() < from_date.date():
            _LOGGER.debug("This event has already ended")
            return None
        # Ignore events that ended this midnight.
        if (
            end.date() == from_date.date()
            and end.hour == 0
            and end.minute == 0
            and end.second == 0
        ):
            _LOGGER.debug("This event has already ended")
            return None
        _LOGGER.debug(
            "Start: %s Tzinfo: %s Default: %s StartAs %s",
            str(start),
            str(start.tzinfo),
            dt.DEFAULT_TIME_ZONE,
            start.astimezone(dt.DEFAULT_TIME_ZONE),
        )
        event_dict = {
            "summary": event.get("SUMMARY", "Unknown"),
            "start": start.astimezone(dt.DEFAULT_TIME_ZONE),
            "end": end.astimezone(dt.DEFAULT_TIME_ZONE),
            "location": event.get("LOCATION"),
            "description": event.get("DESCRIPTION"),
            "all_day": self.all_day,
        }
        _LOGGER.debug("Event to add: %s", str(event_dict))
        return event_dict

    def _ical_date_fixer(self, indate, timezone="UTC"):
        """Convert something that looks kind of like a date or datetime to a timezone-aware datetime-object."""
        self.all_day = False

        _LOGGER.debug("Fixing date: %s in TZ %s", str(indate), str(timezone))

        # Indate can be a single entry or a list with one item...
        if isinstance(indate, list):
            indate = indate[0]

        # Indate can be a date without time...
        if not isinstance(indate, datetime):
            try:
                self.all_day = True
                indate = datetime(indate.year, indate.month, indate.day, 0, 0, 0)
            except Exception as e:
                _LOGGER.error("Unable to parse indate: %s", str(e))

        # Indate can be TZ naive
        if indate.tzinfo is None or indate.tzinfo.utcoffset(indate) is None:
            # _LOGGER.debug("TZ-Naive indate: %s Adding TZ %s", str(indate), str(gettz(str(timezone))))
            # tz = pytz.timezone(str(timezone))
            # indate = tz.localize(indate)
            indate = indate.replace(tzinfo=gettz(str(timezone)))
        # Rrules dont play well with pytz
        # _LOGGER.debug("Tzinfo 1: %s", str(indate.tzinfo))
        if not str(indate.tzinfo).startswith("tzfile"):
            # _LOGGER.debug("Pytz indate: %s. replacing with tz %s", str(indate), str(gettz(str(indate.tzinfo))))
            indate = indate.replace(tzinfo=gettz(str(indate.tzinfo)))
        if str(indate.tzinfo).endswith("/UTC"):
            indate = indate.replace(tzinfo=tzutc)
        # _LOGGER.debug("Tzinfo 2: %s", str(indate.tzinfo))

        _LOGGER.debug("Out date: %s", str(indate))
        return indate
