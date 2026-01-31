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
from homeassistant.util import Throttle, dt as dt_util

from .const import CONF_DAYS, CONF_MAX_EVENTS, DOMAIN

_LOGGER = logging.getLogger(__name__)


CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

PLATFORMS = ["sensor", "calendar"]

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=120)


def setup(hass: HomeAssistant, config):
    """Set up this integration with config flow."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up ical from a config entry."""
    config = entry.data
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {}
    hass.data[DOMAIN][config.get(CONF_NAME)] = ICalEvents(hass=hass, config=config)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    config = entry.data
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

    def __init__(self, hass: HomeAssistant, config):
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

    async def async_get_events(self, hass: HomeAssistant, start_date, end_date):
        """Get list of upcoming events."""
        events = []
        if len(self.calendar) > 0:
            for event in self.calendar:

                if event["start"] < end_date and event["end"] > start_date:
                    events.append(
                        CalendarEvent(
                            event["start"],
                            event["end"],
                            event["summary"],
                            event["description"],
                            event["location"],
                        )
                    )
                    # events.append(event)
        return events

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    async def update(self):
        """Update list of upcoming events."""
        parts = urlparse(self.url)
        if parts.scheme == "file":
            with open(parts.path) as f:
                text = f.read()
        else:
            if parts.scheme == "webcal":
                self.url = parts.geturl().replace("webcal", "https", 1)
            session = async_get_clientsession(self.hass, verify_ssl=self.verify_ssl)
            async with session.get(self.url) as response:
                text = await response.text()
        if text is not None:
            loop = asyncio.get_running_loop()
            event_list = await loop.run_in_executor(
                None, icalendar.Calendar.from_ical, text.replace("\x00", "")
            )
            start_of_events = dt_util.start_of_local_day()
            end_of_events = dt_util.start_of_local_day() + timedelta(days=self.days)

            self.calendar = await self._ical_parser(
                event_list, start_of_events, end_of_events
            )

        if len(self.calendar) > 0:
            found_next_event = False
            for event in self.calendar:
                if event["end"] > dt_util.now() and not found_next_event:
                    self.event = event
                    found_next_event = True

    async def _ical_parser(self, calendar, from_date, to_date):
        """Return a sorted list of events from a icalendar object."""

        events = []

        for event in calendar.walk("VEVENT"):
            # RRULEs turns out to be harder than initially thought.
            # This is mainly due to pythons handling of TZ-naive and TZ-aware timestamps, and the inconsistensies
            # in the way RRULEs are implemented in the icalendar library.
            if "RRULE" in event:
                if "SUMMARY" not in event:
                    _LOGGER.debug("Event without SUMMARY key: %s", str(event))
                _LOGGER.debug("RRULE in event: %s", str(event.get("SUMMARY", "Unknown")))
                rrule = event["RRULE"]
                start_rules = rruleset()
                end_rules = rruleset()

                if "UNTIL" in rrule:
                    try:
                        # Just ignore events that ended a long time ago
                        if rrule["UNTIL"][0] < from_date - timedelta(days=30):
                            _LOGGER.debug(
                                "Old event 1 %s - ended %s",
                                event.get("SUMMARY", "Unknown"),
                                str(rrule["UNTIL"][0]),
                            )
                            continue
                    except Exception:
                        pass

                    _LOGGER.debug("UNTIL in rrule: %s", str(rrule["UNTIL"]))
                    # Ensure that UNTIL is tz-aware and in UTC
                    # (Not all icalendar implements this correctly)
                    until = await self._ical_date_fixer(rrule["UNTIL"], "UTC")
                    rrule["UNTIL"] = [until]
                else:
                    _LOGGER.debug("No UNTIL in rrule")

                _LOGGER.debug("DTSTART in rrule: %s", str(event["DTSTART"].dt))
                dtstart = await self._ical_date_fixer(
                    event["DTSTART"].dt, dt_util.DEFAULT_TIME_ZONE
                )

                if "DTEND" not in event:
                    _LOGGER.debug("Event found without end datetime")
                    if self.all_day:
                        # if it's an all day event with no endtime listed, we'll assume it ends at 23:59:59
                        _LOGGER.debug(
                            f"Event {event['SUMMARY']} is flagged as all day, with a start time of {dtstart}."
                        )
                        dtend = dtstart + timedelta(days=1, seconds=-1)
                        _LOGGER.debug(f"Setting the end time to {dtend}")
                    else:
                        _LOGGER.debug(
                            f"Event {event['SUMMARY']} doesn't have an end but isn't flagged as all day."
                        )
                        dtend = dtstart
                else:
                    _LOGGER.debug("DTEND in event")
                    dtend = await self._ical_date_fixer(
                        event["DTEND"].dt, dt_util.DEFAULT_TIME_ZONE
                    )

                try:
                    rrule_obj = rrulestr(
                        rrule.to_ical().decode("utf-8"), dtstart=dtstart
                    )
                    start_rules.rrule(rrule_obj)
                except ValueError as e:
                    # Handle specific ValueError like "year 10000 is out of range"
                    if "year" in str(e) and "out of range" in str(e):
                        _LOGGER.warning(
                            "RRule for event '%s' contains dates out of range. Skipping. Error: %s",
                            str(event.get("SUMMARY", "Unknown")),
                            str(e),
                        )
                        continue
                    else:
                        # If this fails, move on to the next event
                        _LOGGER.error(
                            "ValueError in start_rules.rrule: %s - Start: %s - RRule: %s",
                            str(e),
                            str(event.get("SUMMARY", "Unknown")),
                            str(dtstart),
                            str(event["RRULE"]),
                        )
                        continue
                except Exception as e:
                    # If this fails, move on to the next event
                    _LOGGER.error(
                        "Exception %s in start_rules.rrule: %s - Start: %s - RRule: %s",
                        str(e),
                        str(event.get("SUMMARY", "Unknown")),
                        str(dtstart),
                        str(event["RRULE"]),
                    )
                    continue

                try:
                    rrule_obj = rrulestr(rrule.to_ical().decode("utf-8"), dtstart=dtend)
                    end_rules.rrule(rrule_obj)
                except ValueError as e:
                    # Handle specific ValueError like "year 10000 is out of range"
                    if "year" in str(e) and "out of range" in str(e):
                        _LOGGER.warning(
                            "RRule for event '%s' contains end dates out of range. Using start rules. Error: %s",
                            str(event.get("SUMMARY", "Unknown")),
                            str(e),
                        )
                        end_rules = start_rules
                    else:
                        # If this fails, just use the start-rules
                        _LOGGER.error(
                            "ValueError in end_rules.rrule: %s - End: %s - RRule: %s",
                            str(e),
                            str(event.get("SUMMARY", "Unknown")),
                            str(dtend),
                            str(event["RRULE"]),
                        )
                        end_rules = start_rules
                except Exception as e:
                    # If this fails, just use the start-rules
                    _LOGGER.error(
                        "Exception %s in end_rules.rrule: %s - End: %s - RRule: %s",
                        str(e),
                        str(event.get("SUMMARY", "Unknown")),
                        str(dtend),
                        str(event["RRULE"]),
                    )
                    end_rules = start_rules
                
                # Only process EXDATEs if we have any
                if "EXDATE" in event:
                    try:
                        if isinstance(event["EXDATE"], list):
                            for exdate in event["EXDATE"]:
                                for edate in exdate.dts:
                                    exdate_dt = edate.dt
                                    if not isinstance(exdate_dt, datetime):
                                        exdate_dt = await self._ical_date_fixer(
                                            exdate_dt, "UTC"
                                        )
                                    start_rules.exdate(exdate_dt)
                                    end_rules.exdate(exdate_dt)
                        else:
                            for edate in event["EXDATE"].dts:
                                exdate_dt = edate.dt
                                if not isinstance(exdate_dt, datetime):
                                    exdate_dt = await self._ical_date_fixer(
                                        exdate_dt, "UTC"
                                    )
                                start_rules.exdate(exdate_dt)
                                end_rules.exdate(exdate_dt)
                    except Exception as e:
                        _LOGGER.error(
                            "Exception %s in EXDATE: %s - Start: %s - RRule: %s - EXDate: %s",
                            str(e),
                            str(event.get("SUMMARY", "Unknown")),
                            str(dtstart),
                            str(event["RRULE"]),
                            str(event["EXDATE"]),
                        )
                        continue

                try:
                    # Convert dates to datetime if needed and ensure timezone awareness
                    after_date = from_date - timedelta(days=7)
                    
                    if not isinstance(after_date, datetime):
                        after_date = datetime.combine(after_date, datetime.min.time())
                    if not isinstance(to_date, datetime):
                        to_date = datetime.combine(to_date, datetime.max.time())

                    # Ensure both dates are timezone-aware
                    if after_date.tzinfo is None:
                        after_date = after_date.replace(
                            tzinfo=dt_util.DEFAULT_TIME_ZONE
                        )
                    if to_date.tzinfo is None:
                        to_date = to_date.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)

                    # Additional check to ensure consistent datetime types
                    # This is to prevent comparison errors between date and datetime objects
                    if hasattr(after_date, "date") and not isinstance(
                        after_date, datetime
                    ):
                        after_date = datetime.combine(after_date, datetime.min.time())
                    if hasattr(to_date, "date") and not isinstance(to_date, datetime):
                        to_date = datetime.combine(to_date, datetime.max.time())

                    # Ensure timezone awareness for both dates
                    if hasattr(after_date, "tzinfo") and after_date.tzinfo is None:
                        after_date = after_date.replace(
                            tzinfo=dt_util.DEFAULT_TIME_ZONE
                        )
                    if hasattr(to_date, "tzinfo") and to_date.tzinfo is None:
                        to_date = to_date.replace(tzinfo=dt_util.DEFAULT_TIME_ZONE)



                    # Ensure consistent datetime types for comparison
                    # The issue is that rruleset.between can return date objects even when we're working with datetime objects
                    starts = start_rules.between(after=after_date, before=to_date)
                    ends = end_rules.between(after=after_date, before=to_date)
                except ValueError as e:
                    # Handle specific ValueError like "year 10000 is out of range"
                    if "year" in str(e) and "out of range" in str(e):
                        _LOGGER.warning(
                            "RRule date range for event '%s' is out of range. Skipping. Error: %s",
                            str(event.get("SUMMARY", "Unknown")),
                            str(e),
                        )
                        continue
                    else:
                        # Add more detailed logging to troubleshoot the datetime comparison error
                        _LOGGER.error(
                            "ValueError in starts/ends: %s - Start: %s - End: %s, RRule: %s",
                            str(e),
                            str(event.get("SUMMARY", "Unknown")),
                            str(dtstart),
                            str(dtend),
                            str(event["RRULE"]),
                        )
                        continue
                except Exception as e:
                    # Add more detailed logging to troubleshoot the datetime comparison error
                    _LOGGER.error(
                        "Exception %s in starts/ends: %s - Start: %s - End: %s, RRule: %s",
                        str(e),
                        str(event.get("SUMMARY", "Unknown")),
                        str(dtstart),
                        str(dtend),
                        str(event["RRULE"]),
                    )
                    continue

                if len(starts) < 1:
                    continue

                ends.reverse()
                for start in starts:
                    if len(ends) == 0:
                        continue
                    end = ends.pop()
                    event_dict = self._ical_event_dict(start, end, from_date, event)

                    if event_dict:
                        events.append(event_dict)


            else:
                try:
                    # Just ignore events that ended a long time ago
                    if "DTEND" in event and event[
                        "DTEND"
                    ].dt.date() < from_date.date() - timedelta(days=30):
                        # Only log if we're at debug level to avoid performance impact
                        if _LOGGER.isEnabledFor(logging.DEBUG):
                            _LOGGER.debug(
                                "Old event 1 %s - ended %s",
                                event.get("SUMMARY", "Unknown"),
                                str(event["DTEND"].dt),
                            )
                        continue
                except Exception as e:
                    if _LOGGER.isEnabledFor(logging.DEBUG):
                        _LOGGER.debug("1: %s", str(e))
                    pass
                try:
                    if "DTEND" in event and event[
                        "DTEND"
                    ].dt < from_date.date() - timedelta(days=30):
                        # Only log if we're at debug level to avoid performance impact
                        if _LOGGER.isEnabledFor(logging.DEBUG):
                            _LOGGER.debug(
                                "Old event 2 %s - ended %s",
                                event.get("SUMMARY", "Unknown"),
                                str(event["DTEND"].dt),
                            )
                        continue
                except Exception as e:
                    if _LOGGER.isEnabledFor(logging.DEBUG):
                        _LOGGER.debug("2: %s", str(e))
                    pass

                # Only log if we're at debug level to avoid performance impact
                if _LOGGER.isEnabledFor(logging.DEBUG):
                    _LOGGER.debug("DTSTART in event: {}".format(event["DTSTART"].dt))
                dtstart = await self._ical_date_fixer(
                    event["DTSTART"].dt, dt_util.DEFAULT_TIME_ZONE
                )

                start = dtstart

                if "DTEND" not in event:
                    _LOGGER.debug("Event found without end datetime")
                    if self.all_day:
                        # if it's an all day event with no endtime listed, we'll assume it ends at 23:59:59
                        _LOGGER.debug(
                            f"Event {event['SUMMARY']} is flagged as all day, with a start time of {start}."
                        )
                        dtend = dtstart + timedelta(days=1, seconds=-1)
                        _LOGGER.debug(f"Setting the end time to {dtend}")
                    else:
                        _LOGGER.debug(
                            f"Event {event['SUMMARY']} doesn't have an end but isn't flagged as all day."
                        )
                        dtend = dtstart
                else:
                    _LOGGER.debug("DTEND in event")
                    dtend = await self._ical_date_fixer(
                        event["DTEND"].dt, dt_util.DEFAULT_TIME_ZONE
                    )
                end = dtend

                event_dict = self._ical_event_dict(start, end, from_date, event)
                if event_dict:
                    events.append(event_dict)

        return sorted(events, key=lambda k: k["start"])

    def _ical_event_dict(self, start, end, from_date, event):
        """Ensure that events are within the start and end."""

        # Skip this event if it's in the past
        if end.date() < from_date.date():
            # Only log if we're at debug level to avoid performance impact
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug("This event has already ended")
            return None
        # Ignore events that ended this midnight.
        if (
            end.date() == from_date.date()
            and end.hour == 0
            and end.minute == 0
            and end.second == 0
        ):
            # Only log if we're at debug level to avoid performance impact
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug("This event has already ended")
            return None
        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug(
                "Start: %s Tzinfo: %s Default: %s StartAs %s",
                str(start),
                str(start.tzinfo),
                dt_util.DEFAULT_TIME_ZONE,
                start.astimezone(dt_util.DEFAULT_TIME_ZONE),
            )
        event_dict = {
            "summary": event.get("SUMMARY", "Unknown"),
            "start": start.astimezone(dt_util.DEFAULT_TIME_ZONE),
            "end": end.astimezone(dt_util.DEFAULT_TIME_ZONE),
            "location": event.get("LOCATION"),
            "description": event.get("DESCRIPTION"),
            "all_day": self.all_day,
        }
        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug("Event to add: %s", str(event_dict))
        return event_dict

    async def _ical_date_fixer(self, indate, timezone="UTC"):
        """Convert something that looks kind of like a date or datetime to a timezone-aware datetime-object."""
        self.all_day = False

        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug("Fixing date: %s in TZ %s", str(indate), str(timezone))

        # Indate can be a single entry or a list with one item...
        if isinstance(indate, list):
            indate = indate[0]

        # Indate can be a date without time...
        if not isinstance(indate, datetime):
            try:
                self.all_day = True
                indate = await self.hass.async_add_executor_job(
                    datetime, indate.year, indate.month, indate.day, 0, 0, 0
                )
            except Exception as e:
                _LOGGER.error("Unable to parse indate: %s", str(e))

        indate_replaced = await self.hass.async_add_executor_job(
            self._date_replace, indate, timezone
        )

        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug("Out date: %s", str(indate_replaced))
        return indate_replaced

    def _date_replace(self, indate: datetime, timezone):
        """Replace tzinfo in a datetime object."""

        # Indate can be TZ naive
        if indate.tzinfo is None or indate.tzinfo.utcoffset(indate) is None:
            # Only log if we're at debug level to avoid performance impact
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug(
                    "TZ-Naive indate: %s Adding TZ %s",
                    str(indate),
                    str(gettz(str(timezone))),
                )
            # tz = pytz.timezone(str(timezone))
            # indate = tz.localize(indate)
            return indate.replace(tzinfo=gettz(str(timezone)))
        # Rules dont play well with pytz
        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug("Tzinfo 1: %s", str(indate.tzinfo))
        if not str(indate.tzinfo).startswith("tzfile"):
            # Only log if we're at debug level to avoid performance impact
            if _LOGGER.isEnabledFor(logging.DEBUG):
                _LOGGER.debug(
                    "Pytz indate: %s. replacing with tz %s",
                    str(indate),
                    str(gettz(str(indate.tzinfo))),
                )
            return indate.replace(tzinfo=gettz(str(indate.tzinfo)))
        if str(indate.tzinfo).endswith("/UTC"):
            return indate.replace(tzinfo=tzutc)
        # Only log if we're at debug level to avoid performance impact
        if _LOGGER.isEnabledFor(logging.DEBUG):
            _LOGGER.debug("Tzinfo 2: %s", str(indate.tzinfo))
        return None
