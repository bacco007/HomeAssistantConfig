"""File Permissions."""
from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timedelta
import logging
from pathlib import Path
from subprocess import CalledProcessError, CompletedProcess, PIPE, run
import time
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, UnitOfTime
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.typing import ConfigType

INTERVAL = timedelta(minutes=5)
CLOCKSOURCE_PATH = Path("/sys/devices/system/clocksource")
_LOGGER = logging.getLogger(__name__)


def run_cmd(*cmd: Sequence[str]) -> CompletedProcess:
    """Run a shell command."""
    return run([*cmd], capture_output=True, text=True, check=True)


def get_clocksource(which: str) -> str:
    """Get clock source."""
    return run_cmd(
        "cat",
        list(CLOCKSOURCE_PATH.glob(f"*/{which}_clocksource"))[0],
    ).stdout.strip()


def get_clocksources() -> dict[str, Any]:
    """Get clock sources."""
    return {
        "available": get_clocksource("available").split(),
        "current": get_clocksource("current"),
    }


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up integration."""
    time_func = time.time
    loop_time_func = hass.loop.time
    start_time = 0.0
    start_loop_time = 0.0

    def get_times() -> tuple[float, float]:
        """Get time from both clocks."""
        return time_func(), loop_time_func()

    @callback
    def capture_start_times(now: datetime) -> None:
        """Capture clock values."""
        nonlocal start_time, start_loop_time

        start_time, start_loop_time = get_times()

    @callback
    def update(now: datetime) -> None:
        """Create thread to update files."""
        now_time, now_loop_time = get_times()
        time_delta = now_time - start_time
        loop_time_delta = now_loop_time - start_loop_time
        drift = loop_time_delta - time_delta
        ratio = loop_time_delta / time_delta
        hass.states.async_set(
            "sensor.clock_drift",
            f"{drift * 1e3:0.6f}",
            {"unit_of_measurement": UnitOfTime.MILLISECONDS},
            force_update=True,
        )
        hass.states.async_set(
            "sensor.clock_ratio",
            f"{ratio:0.3f}",
            {"unit_of_measurement": "s/s"},
            force_update=True,
        )
        _LOGGER.info(
            "time_delta = %0.9f, loop_time_delta = %0.9f, drift = %0.9f, ratio = %0.3f",
            time_delta,
            loop_time_delta,
            drift,
            ratio,
        )

    @callback
    def first_update(now: datetime) -> None:
        """Perform first update and schedule periodic updates."""
        update(now)
        async_track_time_interval(hass, update, INTERVAL)

    @callback
    def startup(event: Event) -> None:
        """Start up sensor."""
        async_call_later(hass, 10, capture_start_times)
        async_call_later(hass, 20, capture_start_times)
        async_call_later(hass, 30, first_update)

    def log_clocksources() -> None:
        """Log clock sources."""
        sources = get_clocksources()
        _LOGGER.info("available: %s", ", ".join(sources["available"]))
        _LOGGER.info("current: %s", sources["current"])
        hass.states.async_set(
            "sensor.clock_source",
            sources["current"],
            {"available": sources["available"]},
        )

    hass.bus.async_listen(EVENT_HOMEASSISTANT_STARTED, startup, run_immediately=True)
    hass.async_add_executor_job(log_clocksources)

    return True