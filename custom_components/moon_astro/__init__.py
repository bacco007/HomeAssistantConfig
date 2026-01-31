"""Moon Astro integration setup.

This module provides Home Assistant entry setup, unload, and removal handlers.
It ensures the Skyfield ephemeris is available at startup, and triggers a
download when missing or invalid. A global lock is used to avoid concurrent
downloads across flows and entry reloads.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
import logging
from pathlib import Path
import time

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.helpers.update_coordinator import UpdateFailed

from .const import (
    CACHE_DIR_NAME,
    CONF_EVENTS_REFRESH_FALLBACK,
    CONF_SCAN_INTERVAL,
    DATA_COORDINATOR,
    DATA_EVENTS_COORDINATOR,
    DE440_FILE,
    DEFAULT_EVENTS_REFRESH_FALLBACK,
    DEFAULT_EVENTS_STARTUP_DELAY,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)
from .coordinator import (
    _SHARED_EPHEMERIS_STORE_KEY,
    MoonAstroCoordinator,
    MoonAstroEventsCoordinator,
)
from .utils import (
    cleanup_cache_dir,
    ensure_valid_ephemeris,
    get_ephemeris_lock,
    get_ephemeris_path,
    validate_ephemeris_file,
)

PLATFORMS: list[str] = ["binary_sensor", "sensor"]

_DATA_REFRESH_TASKS = "refresh_tasks"
_STARTUP_EVENTS_TIMER = "startup_events_timer"

_LOGGER = logging.getLogger(__name__)


def _get_refresh_tasks(hass: HomeAssistant) -> dict[str, asyncio.Task[None]]:
    """Return the internal mapping of entry_id -> initial refresh task.

    Args:
        hass: Home Assistant instance.

    Returns:
        A dictionary mapping config entry IDs to asyncio tasks.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    tasks: dict[str, asyncio.Task[None]] = domain_data.setdefault(
        _DATA_REFRESH_TASKS, {}
    )
    return tasks


def _get_startup_events_timers(hass: HomeAssistant) -> dict[str, Callable[[], None]]:
    """Return the internal mapping of entry_id -> scheduled startup events refresh cancel callback.

    Args:
        hass: Home Assistant instance.

    Returns:
        A dictionary mapping config entry IDs to cancellation callables.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    timers: dict[str, Callable[[], None]] = domain_data.setdefault(
        _STARTUP_EVENTS_TIMER, {}
    )
    return timers


def _ephemeris_path(hass: HomeAssistant) -> Path:
    """Return the full ephemeris file path.

    Args:
        hass: Home Assistant instance.

    Returns:
        The Path to the ephemeris file.
    """
    return Path(hass.config.path(CACHE_DIR_NAME)) / DE440_FILE


def _safe_stat_size(path: Path) -> int | None:
    """Return file size in bytes if available.

    Args:
        path: File path.

    Returns:
        File size in bytes, or None if stat fails.
    """
    try:
        return path.stat().st_size
    except OSError:
        return None


async def _async_prepare_ephemeris(hass: HomeAssistant, *, reason: str) -> None:
    """Ensure the ephemeris file is present and valid.

    A global lock is used to avoid concurrent downloads. This function emits
    explicit INFO logs describing the detected state and the performed action.

    Args:
        hass: Home Assistant instance.
        reason: A short string describing why the preparation is called.

    Returns:
        None.

    Raises:
        ConfigEntryNotReady: When the ephemeris could not be prepared.
    """
    lock = get_ephemeris_lock(hass)
    eph_path = get_ephemeris_path(hass)
    cache_dir = eph_path.parent

    started = time.monotonic()
    async with lock:
        _LOGGER.info(
            "Ephemeris check started (%s): cache_dir=%s file=%s",
            reason,
            str(cache_dir),
            str(eph_path),
        )

        await cleanup_cache_dir(hass)

        exists = eph_path.exists()
        size = _safe_stat_size(eph_path) if exists else None

        if exists:
            _LOGGER.info(
                "Ephemeris state (%s): present size=%s bytes",
                reason,
                str(size) if size is not None else "unknown",
            )
        else:
            _LOGGER.info("Ephemeris state (%s): missing", reason)

        valid_before = await validate_ephemeris_file(hass, remove_on_invalid=False)
        _LOGGER.info(
            "Ephemeris validation (%s): %s", reason, "ok" if valid_before else "failed"
        )

        if valid_before:
            _LOGGER.info(
                "Ephemeris check completed (%s): no download needed (elapsed=%.3fs)",
                reason,
                time.monotonic() - started,
            )
            return

        _LOGGER.info(
            "Ephemeris download triggered (%s): file was missing or invalid", reason
        )

        dl_started = time.monotonic()
        download_ok = await ensure_valid_ephemeris(hass)
        _LOGGER.info(
            "Ephemeris download completed (%s): %s (elapsed=%.3fs)",
            reason,
            "success" if download_ok else "failed",
            time.monotonic() - dl_started,
        )

        if not download_ok:
            _LOGGER.info(
                "Ephemeris check completed (%s): download failed (elapsed=%.3fs)",
                reason,
                time.monotonic() - started,
            )
            raise ConfigEntryNotReady("Ephemeris file is missing or invalid")

        valid_after = await validate_ephemeris_file(hass, remove_on_invalid=False)
        _LOGGER.info(
            "Ephemeris validation after download (%s): %s",
            reason,
            "ok" if valid_after else "failed",
        )

        if not valid_after:
            _LOGGER.info(
                "Ephemeris check completed (%s): validation failed after download (elapsed=%.3fs)",
                reason,
                time.monotonic() - started,
            )
            raise ConfigEntryNotReady("Ephemeris file is missing or invalid")

        final_size = _safe_stat_size(eph_path)
        _LOGGER.info(
            "Ephemeris check completed (%s): ready size=%s bytes (elapsed=%.3fs)",
            reason,
            str(final_size) if final_size is not None else "unknown",
            time.monotonic() - started,
        )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Moon Astro from a config entry.

    Args:
        hass: Home Assistant instance.
        entry: Configuration entry.

    Returns:
        True if setup succeeded.

    Raises:
        ConfigEntryNotReady: If required resources cannot be prepared yet.
    """
    await _async_prepare_ephemeris(hass, reason="startup_or_reload")

    scan_seconds = entry.options.get(
        CONF_SCAN_INTERVAL,
        DEFAULT_SCAN_INTERVAL,
    )
    coordinator = MoonAstroCoordinator.from_config_entry(
        hass,
        entry,
        timedelta(seconds=int(scan_seconds)),
    )

    events_fallback_seconds = entry.options.get(
        CONF_EVENTS_REFRESH_FALLBACK,
        DEFAULT_EVENTS_REFRESH_FALLBACK,
    )
    events_coordinator = MoonAstroEventsCoordinator.from_config_entry(
        hass,
        entry,
        timedelta(seconds=int(events_fallback_seconds)),
    )

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        DATA_COORDINATOR: coordinator,
        DATA_EVENTS_COORDINATOR: events_coordinator,
    }

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def _async_deferred_initial_refresh() -> None:
        """Run the initial refresh sequence without blocking the setup path.

        The main coordinator is refreshed first to populate frequently changing sensors.
        The events coordinator refresh is scheduled using the Home Assistant scheduler
        to avoid long sleeps inside a task.
        """
        await asyncio.sleep(0)

        try:
            _LOGGER.debug(
                "Initial refresh: starting main coordinator refresh (entry_id=%s)",
                entry.entry_id,
            )
            await coordinator.async_refresh()
        except asyncio.CancelledError:
            raise
        except UpdateFailed:
            _LOGGER.debug(
                "Initial refresh: main coordinator refresh failed (entry_id=%s)",
                entry.entry_id,
            )
            return

        @callback
        def _events_cb(_: datetime) -> None:
            """Refresh event-based data after the startup delay.

            Args:
                _: The trigger time provided by the scheduler.

            Returns:
                None.
            """
            _LOGGER.debug(
                "Initial refresh: running scheduled events refresh (entry_id=%s)",
                entry.entry_id,
            )
            timers = _get_startup_events_timers(hass)
            timers.pop(entry.entry_id, None)

            # Schedule the coroutine in a thread-safe way.
            hass.create_task(events_coordinator.async_refresh())

        # Cancel any previously scheduled timer for this entry_id.
        timers = _get_startup_events_timers(hass)
        cancel_prev = timers.pop(entry.entry_id, None)
        if cancel_prev is not None:
            cancel_prev()

        # Schedule the events refresh after a startup delay.
        _LOGGER.info(
            "Deferring event-based sensors initial refresh by %s seconds; a periodic fallback refresh is also enabled via options",
            DEFAULT_EVENTS_STARTUP_DELAY,
        )
        delay_seconds = DEFAULT_EVENTS_STARTUP_DELAY
        when = datetime.now(UTC) + timedelta(seconds=delay_seconds)
        _LOGGER.debug(
            "Initial refresh: scheduling events refresh (entry_id=%s delay_seconds=%s when_utc=%s)",
            entry.entry_id,
            delay_seconds,
            when.isoformat(),
        )
        timers[entry.entry_id] = async_track_point_in_time(hass, _events_cb, when)

    refresh_task = hass.async_create_task(
        _async_deferred_initial_refresh(),
        name=f"{DOMAIN}-{entry.entry_id}-initial_refresh",
    )

    tasks = _get_refresh_tasks(hass)
    tasks[entry.entry_id] = refresh_task

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    This function is used for entry unload/reload operations and must keep the
    ephemeris cache to avoid triggering a new download after reload.

    Args:
        hass: Home Assistant instance.
        entry: Configuration entry.

    Returns:
        True if unload succeeded.
    """
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False

    tasks = _get_refresh_tasks(hass)
    task = tasks.pop(entry.entry_id, None)
    if task is not None:
        task.cancel()

    timers = _get_startup_events_timers(hass)
    cancel = timers.pop(entry.entry_id, None)
    if cancel is not None:
        cancel()
        _LOGGER.debug(
            "Unload: cancelled startup events refresh timer (entry_id=%s)",
            entry.entry_id,
        )

    entry_data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if isinstance(entry_data, dict):
        events_coordinator = entry_data.get(DATA_EVENTS_COORDINATOR)
        if isinstance(events_coordinator, MoonAstroEventsCoordinator):
            await events_coordinator.async_shutdown()

    domain_data = hass.data.get(DOMAIN, {})
    domain_data.pop(entry.entry_id, None)

    if not tasks:
        domain_data.pop(_DATA_REFRESH_TASKS, None)
    if not timers:
        domain_data.pop(_STARTUP_EVENTS_TIMER, None)
    if not domain_data:
        hass.data.pop(DOMAIN, None)

    await cleanup_cache_dir(
        hass,
        remove_ephemeris=False,
        remove_empty_dir=True,
    )

    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle config entry removal.

    This function is called when the config entry is removed from Home Assistant.
    It performs definitive cleanup of cached resources, including the ephemeris file.

    Args:
        hass: Home Assistant instance.
        entry: Configuration entry being removed.

    Returns:
        None.
    """
    eph_path = _ephemeris_path(hass)
    _LOGGER.info("Entry removed: deleting ephemeris cache (file=%s)", str(eph_path))

    await cleanup_cache_dir(
        hass,
        remove_ephemeris=True,
        remove_empty_dir=True,
    )

    domain_data = hass.data.get(DOMAIN)
    if isinstance(domain_data, dict):
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            domain_data.pop(_SHARED_EPHEMERIS_STORE_KEY, None)
            if not domain_data:
                hass.data.pop(DOMAIN, None)


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update by reloading the entry.

    Args:
        hass: Home Assistant instance.
        entry: Configuration entry.

    Returns:
        None.
    """
    await hass.config_entries.async_reload(entry.entry_id)
