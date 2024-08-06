"""MoonCalc instance."""

import datetime
import logging

from astral import LocationInfo
from dateutil import tz
import ephem

from homeassistant.core import HomeAssistant
import homeassistant.util.dt as dt_util

from .const import (
    EXTRA_ATTR_ALTITUDE,
    EXTRA_ATTR_AZIMUTH,
    EXTRA_ATTR_NEXT_PHASE,
    EXTRA_ATTR_PARALLACTIC_ANGLE,
    STATE_ATTR_AGE,
    STATE_ATTR_ALTITUDE,
    STATE_ATTR_AZIMUTH,
    STATE_ATTR_DISTANCE_KM,
    STATE_ATTR_ILLUMINATION_FRACTION,
    STATE_ATTR_NEXT_FIRST,
    STATE_ATTR_NEXT_FULL,
    STATE_ATTR_NEXT_HIGH,
    STATE_ATTR_NEXT_NEW,
    STATE_ATTR_NEXT_PHASE,
    STATE_ATTR_NEXT_RISE,
    STATE_ATTR_NEXT_SET,
    STATE_ATTR_NEXT_THIRD,
    STATE_ATTR_PARALLACTIC_ANGLE,
)
from .moon_script import MoonScript

_LOGGER = logging.getLogger(__name__)


class MoonCalc:
    """Class to calculate the Moon phase."""

    def __init__(
        self,
        hass: HomeAssistant,
        city: str,
        region: str,
        latitude: float,
        longitude: float,
        timezone: str,
    ) -> None:
        """Initialize the MoonCalc object."""

        _LOGGER.debug("Initializing MoonCalc object")
        self.hass = hass
        self._city = city
        self._region = region
        self._latitude = latitude
        self._longitude = longitude
        self._timezone = timezone
        self.today = dt_util.now().replace(tzinfo=tz.UTC)
        self.date = datetime.datetime.now()
        self.observer = ephem.Observer()
        self.location = None
        self._phase_name = None
        self._moon_attributes = {}
        self._moon_position = {}
        self._moon_illumination = {}
        self._moon_times = {}
        self._moon_next_phase = {}
        self._extra_attributes = {}

    def set_location(self) -> LocationInfo:
        """Set the location."""
        self.location = LocationInfo(
            self._city, self._region, self._timezone, self._latitude, self._longitude
        )
        self.observer.lat = str(self.location.latitude)
        self.observer.lon = str(self.location.longitude)
        return self.location

    def get_moon_position(self):
        """Return the moon position."""
        lat = self.location.latitude
        lon = self.location.longitude
        now = dt_util.now()
        self._moon_position = MoonScript.get_moon_position(now, lat, lon)
        _LOGGER.debug("now: %s", now)
        return self._moon_position

    def get_moon_illumination(self):
        """Return the moon illumination."""
        self._moon_illumination = MoonScript.get_moon_illumination(self.today)
        _LOGGER.debug("Moon illumination: %s", self._moon_illumination)
        return self._moon_illumination

    def get_moon_times(self):
        """Return the moon times."""
        self._moon_times = MoonScript.get_moon_times(
            self.today, self.location.latitude, self.location.longitude, False
        )
        return self._moon_times

    def get_current_position(self, position):
        """Return the moon position attribute."""

        return self._moon_position.get(position)

    def get_event_time(self, event):
        """Return the event time as a timestamp with timezone information."""
        event_time = self._moon_times.get(event)
        config_timezone = tz.gettz(self.location.timezone)
        return event_time.astimezone(config_timezone)

    def get_moon_phase_name(self):
        """Return the state of the sensor."""
        phase_name = self._moon_illumination.get("phase").get("id")
        if phase_name:
            self._phase_name = phase_name
            return self._phase_name
        return None

    def get_moon_age(self):
        """Return the current moon age."""
        synodicMonth = 29.53058868
        moon_age = self._moon_illumination.get("phaseValue") * synodicMonth
        if moon_age:
            return moon_age
        return None

    def get_next_moon_phase(self, phase):
        """Return the next moon phase date as a datetime object with timezone information."""
        next_obj = self._moon_illumination.get("next")
        phase_date_str = next_obj.get(phase).get("date")
        phase_date = datetime.datetime.strptime(phase_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        return phase_date.replace(tzinfo=datetime.UTC)

    def get_moon_illumination_fraction(self):
        """Return the fraction of the moon that is illuminated."""
        fraction = self._moon_illumination.get("fraction")
        if fraction:
            return fraction * 100
        return None

    def get_next_type_phase(self):
        """Return the next type of moon phase."""
        next_obj = self._moon_illumination.get("next")
        if not next_obj:
            return None
        next_phase = next_obj.get("type")
        next_date_str = next_obj.get("date")
        next_date = datetime.datetime.strptime(next_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        self._moon_next_phase = {"type": next_phase, "date": next_date}
        _LOGGER.debug("Next moon phase: %s", self._moon_next_phase)

    def get_moon_attributes(self):
        """Return the moon attributes."""
        self._moon_attributes = {
            STATE_ATTR_AGE: self.get_moon_age(),
            STATE_ATTR_DISTANCE_KM: self.get_current_position("distance"),
            STATE_ATTR_AZIMUTH: self.get_current_position("azimuthDegrees"),
            STATE_ATTR_ALTITUDE: self.get_current_position("altitudeDegrees"),
            STATE_ATTR_PARALLACTIC_ANGLE: self.get_current_position(
                "parallacticAngleDegrees"
            ),
            STATE_ATTR_ILLUMINATION_FRACTION: self.get_moon_illumination_fraction(),
            STATE_ATTR_NEXT_FULL: self.get_next_moon_phase("fullMoon"),
            STATE_ATTR_NEXT_NEW: self.get_next_moon_phase("newMoon"),
            STATE_ATTR_NEXT_THIRD: self.get_next_moon_phase("thirdQuarter"),
            STATE_ATTR_NEXT_FIRST: self.get_next_moon_phase("firstQuarter"),
            STATE_ATTR_NEXT_RISE: self.get_event_time("rise"),
            STATE_ATTR_NEXT_SET: self.get_event_time("set"),
            STATE_ATTR_NEXT_HIGH: self.get_event_time("highest"),
            STATE_ATTR_NEXT_PHASE: self._moon_next_phase.get("type"),
        }

        return self._moon_attributes

    def get_extra_attributes(self):
        """Return the extra attributes."""
        self._extra_attributes = {
            EXTRA_ATTR_AZIMUTH: self.get_current_position("azimuth"),
            EXTRA_ATTR_ALTITUDE: self.get_current_position("altitude"),
            EXTRA_ATTR_PARALLACTIC_ANGLE: self.get_current_position("parallacticAngle"),
            EXTRA_ATTR_NEXT_PHASE: self._moon_next_phase.get("date"),
        }

        return self._extra_attributes

    def update(self):
        """Update the MoonCalc object."""
        self.get_moon_illumination()
        self.get_moon_position()
        self.get_moon_times()
        self.get_next_type_phase()
