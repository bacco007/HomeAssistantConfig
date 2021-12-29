"""Finds the next holiday.

May be useful for e.g. controlling programmable holiday lights or
changing music, etc."""
from __future__ import annotations

import datetime

import voluptuous as vol

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import (
    PLATFORM_SCHEMA,
)
from homeassistant.util import Throttle

import holidays


CONF_SOURCES = "sources"
CONF_COUNTRY = "country"
CONF_STATE = "state"
CONF_PROVINCE = "province"
CONF_OBSERVED = "observed"
CONF_MULTIDAY = "multiday"
CONF_FILTER = "filter"
CONF_KWARGS = "kwargs"
CONF_EXCLUDE = "exclude"
CONF_MIN_HOLIDAYS = "min_future_holidays"

ATTR_HOLIDAYS = "holidays"
ATTR_IS_HOLIDAY = "today_is_holiday"
ATTR_COUNTDOWN_TO_HOLIDAY = "days_until_next_holiday"

ICON = "mdi:balloon"

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=1)

KWARGS_SCHEMA = vol.Schema({vol.Optional(str): vol.Any(cv.boolean, float, cv.string)})

ENTRY_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_COUNTRY): cv.string,
        vol.Optional(CONF_STATE, default=None): vol.Any(None, cv.string),
        vol.Optional(CONF_PROVINCE, default=None): vol.Any(None, cv.string),
        vol.Optional(CONF_OBSERVED, default=True): cv.boolean,
        vol.Optional(CONF_MULTIDAY, default=True): cv.boolean,
        vol.Optional(CONF_FILTER, default=[""]): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(CONF_KWARGS, default=dict()): KWARGS_SCHEMA,
        vol.Optional(CONF_EXCLUDE, default=[""]): vol.All(cv.ensure_list, [cv.string]),
    }
)

# Validation of the user's configuration
PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_SOURCES): vol.All(cv.ensure_list, [ENTRY_SCHEMA]),
        vol.Optional(CONF_MIN_HOLIDAYS, default=0): vol.All(int, vol.Range(min=0)),
    }
)


def setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the sensor platform."""
    add_entities([NextHolidaySensor(config)])


class NextHolidaySensor(SensorEntity):
    """Sensor that finds the next holiday"""

    def __init__(self, config):
        """Initialize the sensor."""
        self._state = None
        self._holidays = dict()
        self._config = config
        self._attrs = {}

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Next Holiday"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self) -> None:
        """Update the next holiday based on current date."""
        today = datetime.date.today()
        holiday_data = _load_holidays(today.year, self._config)
        upcoming_holiday_dates = _find_holidays_on_or_after(today, holiday_data)
        if len(upcoming_holiday_dates) <= self._config.get(CONF_MIN_HOLIDAYS):
            # lookahead into the next year
            holiday_data.update(_load_holidays(today.year + 1, self._config))
            upcoming_holiday_dates = _find_holidays_on_or_after(today, holiday_data)

        next_holiday_date = _find_next_holiday(upcoming_holiday_dates)

        self._state = holiday_data.get(next_holiday_date)

        self._attrs[ATTR_HOLIDAYS] = {
            dt.isoformat(): val for dt, val in sorted(holiday_data.items())
        }
        self._attrs[ATTR_IS_HOLIDAY] = today in holiday_data
        if next_holiday_date:
            self._attrs[ATTR_COUNTDOWN_TO_HOLIDAY] = (next_holiday_date - today).days
        else:
            self._attrs[ATTR_COUNTDOWN_TO_HOLIDAY] = None

    @property
    def extra_state_attributes(self):
        """Add extra attrs."""
        return self._attrs

    @property
    def icon(self):
        """Set custom icon."""
        return ICON


def _find_next_holiday(holiday_dates) -> datetime.date:
    """Find the next (or current) holiday"""
    try:
        next_holiday = holiday_dates[0]
    except IndexError:
        next_holiday = None

    return next_holiday


def _find_holidays_on_or_after(date, holiday_data):
    """Find all holidays on or after date."""
    holiday_dates = []
    for holiday_date in sorted(holiday_data):
        if holiday_date >= date:
            holiday_dates.append(holiday_date)
    return holiday_dates


def _load_holidays(year: int, config: dict) -> holidays.HolidayBase:
    """Load holiday data based on config and year.

    We re-instantiate this at each update so it keeps working as
    the years change."""

    options = holidays.HolidayBase()
    for entry in config.get(CONF_SOURCES):
        CountryCls = getattr(holidays, entry.get(CONF_COUNTRY))
        candidates = CountryCls(
            state=entry.get(CONF_STATE),
            prov=entry.get(CONF_PROVINCE),
            observed=entry.get(CONF_OBSERVED),
            years=year,
            **entry.get(CONF_KWARGS)
        )
        exclude = [exclusion.lower() for exclusion in entry.get(CONF_EXCLUDE)]
        for query in entry.get(CONF_FILTER):
            # allow text filter (default to add all)
            for date in sorted(candidates.get_named(query)):
                holiday_name = candidates[date]
                if holiday_name.lower() in exclude:
                    continue
                if entry.get(CONF_MULTIDAY) or (holiday_name not in options.values()):
                    options[date] = holiday_name

    return options
