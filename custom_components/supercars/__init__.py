"""Supercars Championship integration for Home Assistant."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, POST_RACE_REFRESH_DELAY
from .coordinator import NatsoftCoordinator
from .news_coordinator import NewsCoordinator
from .schedule_coordinator import ScheduleCoordinator
from .standings_coordinator import StandingsCoordinator
from .results_coordinator import ResultsCoordinator
from .weather_coordinator import WeatherCoordinator

PLATFORMS = [Platform.SENSOR, Platform.CALENDAR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Supercars from a config entry."""
    timing_coordinator = NatsoftCoordinator(hass)
    news_coordinator = NewsCoordinator(hass)
    schedule_coordinator = ScheduleCoordinator(hass)
    standings_coordinator = StandingsCoordinator(hass)
    results_coordinator = ResultsCoordinator(hass, timing_coordinator)
    weather_coordinator = WeatherCoordinator(hass)

    await timing_coordinator.async_config_entry_first_refresh()
    await news_coordinator.async_config_entry_first_refresh()
    await schedule_coordinator.async_config_entry_first_refresh()
    await standings_coordinator.async_config_entry_first_refresh()
    await results_coordinator.async_config_entry_first_refresh()
    await weather_coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        "timing":   timing_coordinator,
        "news":     news_coordinator,
        "schedule": schedule_coordinator,
        "standings": standings_coordinator,
        "results":   results_coordinator,
        "weather":   weather_coordinator,
    }

    # ── Post-race refresh ─────────────────────────────────────────────────────
    # When the timing feed reports a race has finished (flag -> "Ended"),
    # schedule a one-shot standings + results re-scrape a short while later so
    # championship points/results reflect the just-completed race without
    # waiting for the next hourly poll.
    race_end_state: dict = {"last_flag": None, "cancel": None}

    @callback
    def _post_race_refresh(_now) -> None:
        race_end_state["cancel"] = None
        hass.async_create_task(standings_coordinator.async_request_refresh())
        hass.async_create_task(results_coordinator.async_request_refresh())

    @callback
    def _on_timing_update() -> None:
        flag = (timing_coordinator.data or {}).get("flag_state_raw")
        if flag == "Ended" and race_end_state["last_flag"] != "Ended":
            if race_end_state["cancel"] is not None:
                race_end_state["cancel"]()
            race_end_state["cancel"] = async_call_later(
                hass, POST_RACE_REFRESH_DELAY, _post_race_refresh
            )
        race_end_state["last_flag"] = flag

    entry.async_on_unload(timing_coordinator.async_add_listener(_on_timing_update))

    @callback
    def _cancel_pending_refresh() -> None:
        if race_end_state["cancel"] is not None:
            race_end_state["cancel"]()

    entry.async_on_unload(_cancel_pending_refresh)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinators = hass.data[DOMAIN].pop(entry.entry_id)
        for coord in coordinators.values():
            # NatsoftCoordinator overrides this to also stop its background
            # websocket listener task; other coordinators inherit a no-op.
            await coord.async_shutdown()
            if hasattr(coord, "_session") and coord._session and not coord._session.closed:
                await coord._session.close()
    return unload_ok
