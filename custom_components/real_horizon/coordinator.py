"""Data update coordinator for the Real Horizon integration."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from astral import Observer
from astral.sun import azimuth as sun_azimuth, elevation as sun_elevation
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import DOMAIN, UPDATE_INTERVAL
from .moon import moon_position
from .pvgis import HorizonProfile, cache_path, fetch_pvgis
from .sun import find_crossings, find_crossings_window, first_rise_last_set, sun_pos_fn

_LOGGER = logging.getLogger(__name__)


@dataclass
class RealHorizonData:
    """Snapshot returned from each coordinator refresh."""

    now: datetime
    sun_azimuth: float
    sun_elevation: float
    horizon_at_sun: float
    clearance: float
    above_horizon: bool
    true_sunrise: datetime | None
    true_sunset: datetime | None
    crossings: list[tuple[datetime, str]]
    sun_path_today: list[tuple[datetime, float, float]]
    """(time, azimuth, elevation) samples covering today's daylight."""
    moon_azimuth: float
    moon_elevation: float
    moon_phase: float
    """0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter."""
    moon_path_today: list[tuple[datetime, float, float]]
    """(time, azimuth, elevation) for moon while above ~-5° altitude today."""
    moon_crossings: list[tuple[datetime, str]]
    moon_rise: datetime | None
    moon_set: datetime | None


class RealHorizonCoordinator(DataUpdateCoordinator[RealHorizonData]):
    """Holds the horizon profile, recomputes sun state on every tick.

    Daily crossings are cached and only recomputed when the local date changes.
    """

    horizon: HorizonProfile
    observer: Observer
    tz: ZoneInfo

    def __init__(self, hass: HomeAssistant, lat: float, lon: float) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )
        self._lat = lat
        self._lon = lon
        self._cached_day: date | None = None
        self._cached_crossings: list[tuple[datetime, str]] = []
        self._cached_path: list[tuple[datetime, float, float]] = []
        # Moon arc spans midnight and shifts continuously; refreshed when
        # the chosen arc's set time has passed.
        self._cached_moon_arc_until: datetime | None = None
        self._cached_moon_path: list[tuple[datetime, float, float]] = []
        self._cached_moon_rise: datetime | None = None
        self._cached_moon_set: datetime | None = None

    async def async_load_horizon(self) -> None:
        """Fetch (or load cached) PVGIS horizon. Call once before first refresh."""
        session = async_get_clientsession(self.hass)
        cfg_dir = Path(self.hass.config.config_dir)
        pvgis_json = await fetch_pvgis(
            session, self._lat, self._lon, cache_path(cfg_dir, self._lat, self._lon)
        )
        self.horizon = HorizonProfile.from_pvgis_json(pvgis_json)
        self.observer = Observer(latitude=self._lat, longitude=self._lon, elevation=0.0)
        self.tz = ZoneInfo(self.hass.config.time_zone)
        _LOGGER.info(
            "Loaded horizon for %s, %s -- %d points, min=%.1f° max=%.1f°",
            self._lat,
            self._lon,
            len(self.horizon.points) - 1,
            min(p[1] for p in self.horizon.points),
            max(p[1] for p in self.horizon.points),
        )

    async def _async_update_data(self) -> RealHorizonData:
        now = dt_util.now()
        local_day = now.astimezone(self.tz).date()

        if local_day != self._cached_day:
            # Sun crossings + arc only change at midnight; offload the scan.
            self._cached_crossings, self._cached_path = (
                await self.hass.async_add_executor_job(
                    _compute_sun_day, self.observer, self.horizon, local_day, self.tz
                )
            )
            self._cached_day = local_day

        # Moon arc: refresh when the previously-chosen arc has ended (or first time).
        if self._cached_moon_arc_until is None or now > self._cached_moon_arc_until:
            (
                self._cached_moon_path,
                self._cached_moon_rise,
                self._cached_moon_set,
            ) = await self.hass.async_add_executor_job(
                _compute_moon_arc, self.horizon, self._lat, self._lon, now
            )
            # Cache until just past the chosen arc's set; if no set found, retry in 1h.
            self._cached_moon_arc_until = (
                self._cached_moon_set
                if self._cached_moon_set
                else now + timedelta(hours=1)
            )

        sunrise, sunset = first_rise_last_set(self._cached_crossings)

        az = sun_azimuth(self.observer, now)
        alt = sun_elevation(self.observer, now)
        h = self.horizon.elevation_at(az)
        clear = alt - h

        moon_az, moon_alt, moon_phase = moon_position(now, self._lat, self._lon)

        return RealHorizonData(
            now=now,
            sun_azimuth=az,
            sun_elevation=alt,
            horizon_at_sun=h,
            clearance=clear,
            above_horizon=clear > 0,
            true_sunrise=sunrise,
            true_sunset=sunset,
            crossings=self._cached_crossings,
            sun_path_today=self._cached_path,
            moon_azimuth=moon_az,
            moon_elevation=moon_alt,
            moon_phase=moon_phase,
            moon_path_today=self._cached_moon_path,
            moon_crossings=(
                [(self._cached_moon_rise, "rise")] if self._cached_moon_rise else []
            ) + (
                [(self._cached_moon_set, "set")] if self._cached_moon_set else []
            ),
            moon_rise=self._cached_moon_rise,
            moon_set=self._cached_moon_set,
        )


def _compute_sun_day(
    observer: Observer,
    horizon: HorizonProfile,
    day: date,
    tz: ZoneInfo,
) -> tuple[list[tuple[datetime, str]], list[tuple[datetime, float, float]]]:
    """Sun crossings + 10-minute above-horizon arc for the local day."""
    sun_pos = sun_pos_fn(observer)
    sun_crossings = find_crossings(sun_pos, horizon, day, tz)

    start = datetime.combine(day, datetime.min.time(), tzinfo=tz)
    step = timedelta(minutes=10)
    sun_path: list[tuple[datetime, float, float]] = []
    for i in range(144 + 1):
        t = start + step * i
        sun_alt = sun_elevation(observer, t)
        if sun_alt > -5:
            sun_path.append((t, sun_azimuth(observer, t), sun_alt))
    return sun_crossings, sun_path


def _compute_moon_arc(
    horizon: HorizonProfile,
    lat: float,
    lon: float,
    now: datetime,
) -> tuple[
    list[tuple[datetime, float, float]],
    datetime | None,
    datetime | None,
]:
    """Find a single continuous moon arc.

    If the moon is currently above the local horizon, return the arc bounded by
    its most-recent rise and next set. Otherwise return the next upcoming arc
    (next rise to the set after it). Returns ([], None, None) if no arc found
    in the +/-30h search window.
    """
    moon_pos = lambda t: moon_position(t, lat, lon)[:2]  # noqa: E731

    win_start = now - timedelta(hours=18)
    win_end = now + timedelta(hours=30)
    crossings = find_crossings_window(moon_pos, horizon, win_start, win_end)

    # Determine current moon visibility.
    az_now, alt_now = moon_pos(now)
    moon_up = alt_now > horizon.elevation_at(az_now)

    rise: datetime | None = None
    set_: datetime | None = None
    if moon_up:
        # Most recent rise before now, next set after now.
        for t, k in crossings:
            if k == "rise" and t <= now:
                rise = t
            if k == "set" and t >= now and set_ is None:
                set_ = t
    else:
        # Next rise after now, set after that rise.
        for t, k in crossings:
            if k == "rise" and t >= now and rise is None:
                rise = t
            elif k == "set" and rise is not None and t >= rise and set_ is None:
                set_ = t

    if rise is None or set_ is None:
        return [], rise, set_

    # Sample the arc at 10-min steps from rise to set.
    path: list[tuple[datetime, float, float]] = []
    step = timedelta(minutes=10)
    t = rise
    while t <= set_:
        az, alt = moon_pos(t)
        path.append((t, az, alt))
        t += step
    # Ensure the very last point lands exactly on the set time.
    if path and path[-1][0] < set_:
        az, alt = moon_pos(set_)
        path.append((set_, az, alt))
    return path, rise, set_
