"""Calendar platform for holidays."""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import Any

import homeassistant.util.dt as dt_util
from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_HIDDEN, CONF_ENTITIES, CONF_NAME
from homeassistant.helpers.entity import DeviceInfo

from . import const, create_holidays

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=10)
THROTTLE_INTERVAL = timedelta(seconds=60)


async def async_setup_entry(_, config_entry: ConfigEntry, async_add_devices) -> None:
    """Create garbage collection entities defined in config_flow and add them to HA."""
    async_add_devices([Holidays(config_entry)], True)


def now() -> datetime:
    """Return current date and time. Needed for testing."""
    return dt_util.now()


class Holidays(CalendarEntity):
    """Holidays Sensor class."""

    __slots__ = (
        "config_entry",
        "_name",
        "_hidden",
        "_country",
        "_holiday_subdiv",
        "_holiday_observed",
        "_holiday_pop_named",
        "_holidays",
        "_holiday_names",
        "_event",
        "_next_date",
        "_next_holiday",
        "_last_updated",
        "_entities",
        "_date_format",
        "_icon_normal",
        "_icon_today",
        "_icon_tomorrow",
        "_icon",
    )

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Read configuration and initialise class variables."""
        config = config_entry.data
        self.config_entry = config_entry
        self._name: str = (
            config_entry.title
            if config_entry.title is not None
            else config.get(CONF_NAME)
        )
        self._hidden = config.get(ATTR_HIDDEN, False)
        self._country = config.get(const.CONF_COUNTRY, "")
        self._holiday_subdiv = config.get(const.CONF_SUBDIV, "")
        self._holiday_observed = config.get(const.CONF_OBSERVED, True)
        self._holiday_pop_named = config.get(const.CONF_HOLIDAY_POP_NAMED)
        self._holidays: list[date] = []
        self._holiday_names: dict = {}
        self._event: CalendarEvent | None = None
        self._next_date: date | None = None
        self._next_holiday: str | None = None
        self._last_updated: datetime | None = None
        self._entities = config.get(CONF_ENTITIES)
        self._date_format = "%d-%b-%Y"
        self._icon_normal = config.get(const.CONF_ICON_NORMAL)
        self._icon_today = config.get(const.CONF_ICON_TODAY)
        self._icon_tomorrow = config.get(const.CONF_ICON_TOMORROW)
        self._icon = self._icon_normal

    async def _async_load_holidays(self) -> None:
        """Load the holidays from from a date."""
        log = ""
        self._holidays.clear()
        self._holiday_names.clear()
        if self._country is not None and self._country != "":
            this_year = now().date().year
            years = [this_year - 1, this_year, this_year + 1]
            _LOGGER.debug(
                "(%s) Country Holidays with parameters: "
                "country: %s, subdivision: %s, observed: %s",
                self._name,
                self._country,
                self._holiday_subdiv,
                self._holiday_observed,
            )
            hol = create_holidays(
                years,
                self._country,
                self._holiday_subdiv,
                self._holiday_observed,
            )
            if self._holiday_pop_named is not None:
                for pop in self._holiday_pop_named:
                    try:
                        hol.pop_named(pop)
                    except KeyError as err:
                        _LOGGER.error("(%s) Holiday not removed (%s)", self._name, err)
            try:
                for holiday_date, holiday_name in sorted(hol.items()):
                    self._holidays.append(holiday_date)
                    self._holiday_names[f"{holiday_date}"] = holiday_name
                    log += f"\n  {holiday_date}: {holiday_name}"
            except KeyError:
                _LOGGER.error(
                    "(%s) Invalid country code (%s)",
                    self._name,
                    self._country,
                )
            _LOGGER.debug("(%s) Found these holidays: %s", self._name, log)

    async def async_added_to_hass(self) -> None:
        """When calendar is added to hassio, add it to calendar."""
        await super().async_added_to_hass()
        if const.DOMAIN not in self.hass.data:
            self.hass.data[const.DOMAIN] = {}
        if const.CALENDAR_PLATFORM not in self.hass.data[const.DOMAIN]:
            self.hass.data[const.DOMAIN][const.CALENDAR_PLATFORM] = {}
        self.hass.data[const.DOMAIN][const.CALENDAR_PLATFORM][self.entity_id] = self

    async def async_will_remove_from_hass(self) -> None:
        """When calendar is added to hassio, remove it."""
        await super().async_will_remove_from_hass()
        del self.hass.data[const.DOMAIN][const.CALENDAR_PLATFORM][self.entity_id]

    @property
    def unique_id(self) -> str | None:
        """Return a unique ID to use for this calendar."""
        return self.config_entry.data.get("unique_id", None)

    @property
    def device_info(self) -> DeviceInfo | None:
        """Return device info."""
        return DeviceInfo(
            identifiers={(const.DOMAIN, self.unique_id)},
            name=self.name,
            manufacturer="bruxy70",
        )

    @property
    def name(self) -> str:
        """Return the name of the calendar."""
        return self._name

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        return self._event

    @property
    def state(self) -> int | None:
        """Return the calendar state."""
        if self._next_date is None:
            return None
        today = now().date()
        return (self._next_date - today).days

    @property
    def icon(self) -> str:
        """Return the entity icon."""
        return self._icon

    @property
    def extra_state_attributes(self) -> dict:
        """Return the state attributes."""
        res: dict[str, Any] = {}
        if self._next_date is None:
            res[const.ATTR_NEXT_DATE] = None
            res[const.ATTR_NEXT_HOLIDAY] = None
        else:
            res[const.ATTR_NEXT_DATE] = datetime(
                self._next_date.year, self._next_date.month, self._next_date.day
            ).astimezone()
            res[const.ATTR_NEXT_HOLIDAY] = self._next_holiday
        res[const.ATTR_LAST_UPDATED] = self._last_updated
        res[const.ATTR_HOLIDAYS] = self._holiday_names
        return res

    @property
    def holidays(self) -> dict:
        """Return the dictionary of holidays."""
        return self._holiday_names

    @property
    def device_class(self) -> str:
        """Return the class of the calendar."""
        return const.DEVICE_CLASS

    def __repr__(self) -> str:
        """Return main calendar parameters."""
        return (
            f"Holidays(name={self.name}, "
            f"entity_id={self.entity_id}, "
            f"state={self.state}"
            f"attributes={self.extra_state_attributes})"
        )

    async def async_get_events(
        self, _, start_datetime: datetime, end_datetime: datetime
    ) -> list[CalendarEvent]:
        """Get all tasks in a specific time frame."""
        events: list[CalendarEvent] = []
        start_date = start_datetime.date()
        end_date = end_datetime.date()
        start = await self.async_next_date(start_date)
        while start is not None and start >= start_date and start <= end_date:
            try:
                end = start + timedelta(days=1)
            except TypeError:
                end = start
            event = CalendarEvent(
                summary=self.holiday_name(start),
                start=start,
                end=end,
            )
            events.append(event)
            start = await self.async_next_date(start + timedelta(days=1))
        return events

    async def _async_ready_for_update(self) -> bool:
        """Check if the entity is ready for the update.

        Skip the update if the calendar was updated today
        """
        today = now().date()
        try:
            ready_for_update = bool(self._last_updated.date() != today)  # type: ignore
        except AttributeError:
            ready_for_update = True
        return ready_for_update

    async def async_next_date(self, first_date: date) -> date | None:
        """Get next date from self._holidays."""
        for holiday in self._holidays:
            if holiday < first_date:
                continue
            return holiday
        return None

    def holiday_name(self, holiday_date: date | None) -> str | None:
        """Get holiday name for a date."""
        try:
            return self._holiday_names[f"{holiday_date}"]
        except KeyError:
            return None

    async def async_update(self) -> None:
        """Get the latest data and updates the states."""
        if not await self._async_ready_for_update() or not self.hass.is_running:
            return
        _LOGGER.debug("(%s) Calling update", self._name)
        await self._async_load_holidays()
        await self.async_update_state()

    async def async_update_state(self) -> None:
        """Pick the first event from holiday dates, update attributes."""
        _LOGGER.debug("(%s) Looking for next collection", self._name)
        today = now().date()
        self._next_date = await self.async_next_date(today)
        self._next_holiday = self.holiday_name(self._next_date)
        self._last_updated = now()
        if self._next_date is not None:
            _LOGGER.debug(
                "(%s) next_date (%s), today (%s)", self._name, self._next_date, today
            )
            start = self._next_date
            end = start + timedelta(days=1)
            self._event = CalendarEvent(summary=self._name, start=start, end=end)
        else:
            self._event = None
