"""Calendar platform for holidays."""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import Any, Dict

import homeassistant.util.dt as dt_util
from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_HIDDEN, CONF_ENTITIES, CONF_NAME
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.restore_state import RestoreEntity

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


class Holidays(CalendarEntity, RestoreEntity):
    """Holidays Sensor class."""

    __slots__ = (
        "config_entry",
        "_attr_icon",
        "_attr_name",
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
    )

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Read configuration and initialise class variables."""
        config = config_entry.options
        self.config_entry = config_entry
        self._attr_name: str = (
            config_entry.title
            if config_entry.title is not None
            else config_entry.data.get(CONF_NAME)
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
        self._attr_icon = self._icon_normal

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
                self._attr_name,
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
                        _LOGGER.error(
                            "(%s) Holiday not removed (%s)", self._attr_name, err
                        )
            try:
                for holiday_date, holiday_name in sorted(hol.items()):
                    self._holidays.append(holiday_date)
                    self._holiday_names[f"{holiday_date}"] = holiday_name
                    log += f"\n  {holiday_date}: {holiday_name}"
            except KeyError:
                _LOGGER.error(
                    "(%s) Invalid country code (%s)",
                    self._attr_name,
                    self._country,
                )
            _LOGGER.debug("(%s) Found these holidays: %s", self._attr_name, log)

    async def async_added_to_hass(self) -> None:
        """When calendar is added to hassio, add it to calendar."""
        await super().async_added_to_hass()
        self.hass.data[const.DOMAIN][const.CALENDAR_PLATFORM][self.entity_id] = self

        if (state := await self.async_get_last_state()) is not None:
            if const.ATTR_HOLIDAYS in state.attributes:
                self._holiday_names = state.attributes[const.ATTR_HOLIDAYS].copy()

    async def async_will_remove_from_hass(self) -> None:
        """When calendar is added to hassio, remove it."""
        await super().async_will_remove_from_hass()
        del self.hass.data[const.DOMAIN][const.CALENDAR_PLATFORM][self.entity_id]

    @property
    def unique_id(self) -> str | None:
        """Return a unique ID to use for this calendar."""
        if "unique_id" in self.config_entry.data:
            # From legacy config
            return self.config_entry.data.get("unique_id")
        return self.config_entry.entry_id

    @property
    def device_info(self) -> DeviceInfo | None:
        """Return device info."""
        return DeviceInfo(
            identifiers={(const.DOMAIN, self.unique_id)},
            name=self._attr_name,
            manufacturer="bruxy70",
        )

    @property
    def name(self) -> str:
        """Return the name of the calendar."""
        return self._attr_name

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
        return self._attr_icon

    @property
    def extra_state_attributes(self) -> dict:
        """Return the state attributes."""
        res: Dict[str, Any] = {}
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
            f"Holidays(name={self._attr_name}, "
            f"entity_id={self.entity_id}, "
            f"state={self.state}"
            f"attributes={self.extra_state_attributes})"
        )

    async def async_get_events(
        self, _, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Get all tasks in a specific time frame."""
        events: list[CalendarEvent] = []
        start = await self.async_next_date(start_date.date())
        while (
            start is not None
            and start >= start_date.date()
            and start <= end_date.date()
        ):
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
        _LOGGER.debug("(%s) Calling update", self._attr_name)
        await self._async_load_holidays()
        await self.async_update_state()

    async def async_update_state(self) -> None:
        """Pick the first event from holiday dates, update attributes."""
        _LOGGER.debug("(%s) Looking for the next holiday", self._attr_name)
        today = now().date()
        self._next_date = await self.async_next_date(today)
        self._next_holiday = self.holiday_name(self._next_date)
        self._last_updated = now()
        if self._next_date is not None:
            _LOGGER.debug(
                "(%s) next_date (%s), today (%s)",
                self._attr_name,
                self._next_date,
                today,
            )
            start = self._next_date
            end = start + timedelta(days=1)
            self._event = CalendarEvent(summary=self._attr_name, start=start, end=end)
        else:
            self._event = None
