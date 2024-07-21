"""Coordinator for the Moon Phase integration."""

import datetime
from datetime import timedelta
import logging

import ephem

from astral import LocationInfo
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_REGION,
    CONF_TIME_ZONE,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
import homeassistant.util.dt as dt_util

from .const import (
    CONF_CITY,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    PHASE_FIRST_QUARTER,
    PHASE_FULL_MOON,
    PHASE_LAST_QUARTER,
    PHASE_NEW_MOON,
    PHASE_WANING_CRESCENT,
    PHASE_WANING_GIBBOUS,
    PHASE_WAXING_CRESCENT,
    PHASE_WAXING_GIBBOUS,
    STATE_ATTR_AGE,
    STATE_ATTR_DISTANCE_KM,
    STATE_ATTR_DISTANCE_MI,
    STATE_ATTR_ILLUMINATION_FRACTION,
    STATE_ATTR_NEXT_FULL,
    STATE_ATTR_NEXT_NEW,
    STATE_ATTR_NEXT_RISE,
    STATE_ATTR_NEXT_SET,
)
from .libs.astral import moon

_LOGGER = logging.getLogger(__name__)


def location_obj(config_entry: ConfigEntry) -> LocationInfo:
    """Return the location object."""
    city = config_entry.data.get(CONF_CITY)
    region = config_entry.data.get(CONF_REGION)
    timezone = config_entry.data.get(CONF_TIME_ZONE)
    latitude = config_entry.data.get(CONF_LATITUDE)
    longitude = config_entry.data.get(CONF_LONGITUDE)
    _LOGGER.debug("Creating location object: %s", city)
    return LocationInfo(city, region, timezone, latitude, longitude)


class MoonUpdateCoordinator(DataUpdateCoordinator):
    """Class to calculate the Moon phase."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.location = location_obj(config_entry)
        self.today = dt_util.now().date()
        self.date = datetime.datetime.now()
        self.moon_ephem = ephem.Moon()
        self.observer = ephem.Observer()
        self.observer.lat = str(self.location.latitude)
        self.observer.lon = str(self.location.longitude)
        self.observer.date = self.date

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_method=self._async_update_data,
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

    async def _async_update_data(self):
        """Fetch data from the source."""
        attributes = {}
        try:
            moon_phase = self.get_moon_phase_name()
            attributes[STATE_ATTR_AGE] = self.get_moon_age()
            attributes[STATE_ATTR_NEXT_NEW] = self.get_next_new_moon()
            attributes[STATE_ATTR_NEXT_FULL] = self.get_next_full_moon()
            attributes[STATE_ATTR_NEXT_RISE] = self.get_moon_rise()
            attributes[STATE_ATTR_NEXT_SET] = self.get_moon_set()
            attributes[STATE_ATTR_DISTANCE_KM] = self.get_moon_distance_km()
            attributes[STATE_ATTR_DISTANCE_MI] = self.get_moon_distance_mi()
            attributes[STATE_ATTR_ILLUMINATION_FRACTION] = (
                self.get_moon_illumination_fraction()
            )
        except UpdateFailed:
            _LOGGER.error("Error fetching moon phase data")
        _LOGGER.debug("attributes: %s", attributes)
        return {
            "moon_phase": moon_phase,
            "attributes": attributes,
        }

    def get_moon_phase(self):
        """Return the current moon phase."""
        return moon.phase(self.today)

    def get_moon_phase_name(self):
        """Return the name of the current moon phase."""
        state = self.get_moon_phase()
        if state < 0.5 or state > 27.5:
            moon_phase_name = PHASE_NEW_MOON
        elif state < 6.5:
            moon_phase_name = PHASE_WAXING_CRESCENT
        elif state < 7.5:
            moon_phase_name = PHASE_FIRST_QUARTER
        elif state < 13.5:
            moon_phase_name = PHASE_WAXING_GIBBOUS
        elif state < 14.5:
            moon_phase_name = PHASE_FULL_MOON
        elif state < 20.5:
            moon_phase_name = PHASE_WANING_GIBBOUS
        elif state < 21.5:
            moon_phase_name = PHASE_LAST_QUARTER
        else:
            moon_phase_name = PHASE_WANING_CRESCENT
        return moon_phase_name

    def get_moon_age(self):
        """Return the current moon age."""
        return self.get_moon_phase()

    def get_moon_rise(self):
        """Return the moon rise time."""
        try:
            rise_time = moon.moonrise(self.location, self.date)
            if rise_time is not None:
                return rise_time.isoformat()
            return None
        except ValueError as e:
            _LOGGER.warning(f"Could not calculate moon rise time: {e}")
            return None

    def get_moon_set(self):
        """Return the moon set time."""
        try:
            set_time = moon.moonset(self.location, self.date)
            if set_time is not None:
                return set_time.isoformat()
            return None
        except ValueError as e:
            _LOGGER.warning(f"Could not calculate moon set time: {e}")
            return None

    def get_next_new_moon(self):
        """Return the next new moon date."""
        return (
            ephem.next_new_moon(self.date)
            .datetime()
            .replace(tzinfo=datetime.UTC)
            .isoformat()
        )

    def get_next_full_moon(self):
        """Return the next full moon date."""
        return (
            ephem.next_full_moon(self.date)
            .datetime()
            .replace(tzinfo=datetime.UTC)
            .isoformat()
        )

    def get_moon_distance_km(self):
        """Return the distance to the moon in km."""
        self.moon_ephem.compute(self.observer)
        return self.moon_ephem.earth_distance * 149597870.7

    def get_moon_distance_mi(self):
        """Return the distance to the moon in mi."""
        return self.get_moon_distance_km() / 1.609344

    def get_moon_illumination_fraction(self):
        """Return the fraction of the moon that is illuminated."""
        return self.moon_ephem.phase
