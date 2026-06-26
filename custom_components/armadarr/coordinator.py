"""DataUpdateCoordinator for Armadarr."""

from __future__ import annotations

import contextlib
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    CONF_UPCOMING_DAYS,
    CONF_WANTED_COUNT,
    DEFAULT_UPCOMING_DAYS,
    DEFAULT_WANTED_COUNT,
    DOMAIN,
    LOGGER,
)

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .data import ArmadarrConfigEntry


class StandardCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching standard data from the API (5 min)."""

    config_entry: ArmadarrConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ArmadarrConfigEntry,
    ) -> None:
        """Initialize."""
        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=f"{DOMAIN}_{config_entry.data['app_type']}_standard",
            update_interval=timedelta(minutes=5),
        )
        self.config_entry = config_entry
        self.last_history_id: int | None = None

    async def _async_update_data(self) -> dict[str, Any]:
        """Update data via library."""
        client = self.config_entry.runtime_data.client
        app_type = self.config_entry.data["app_type"]
        upcoming_days = int(
            self.config_entry.options.get(
                CONF_UPCOMING_DAYS,
                self.config_entry.data.get(CONF_UPCOMING_DAYS, DEFAULT_UPCOMING_DAYS),
            )
        )

        data: dict[str, Any] = {}

        try:
            # Common data for most apps
            if app_type != "Bazarr":
                data["system_status"] = await client.system.get_status()

            if app_type not in ["Bazarr", "Prowlarr", "Dispatcharr"]:
                data["queue"] = await client.queue.get()
                data["health"] = await client.system.get_health()
                data["root_folder"] = await client.root_folder.get()
                data["quality_profile"] = await client.quality_profile.get()
                await self._process_history(client, app_type)

            # Calendar data
            if app_type in ["Sonarr", "Radarr", "Lidarr", "Readarr", "Whisparr"]:
                data["calendar"] = await self._fetch_calendar(
                    client, app_type, upcoming_days
                )

            if app_type == "Bazarr":
                with contextlib.suppress(Exception):
                    data["system_status"] = await client.system.get_status()

            if app_type == "Prowlarr":
                data["indexer_status"] = await client.indexer.get()
                data["indexer_stats"] = await client.indexer.get_stats()

            if app_type == "Dispatcharr":
                data.update(await self._fetch_dispatcharr(client))

        except Exception as exception:
            msg = f"Error communicating with API: {exception}"
            raise UpdateFailed(msg) from exception
        else:
            return data

    async def _process_history(self, client: Any, app_type: str) -> None:
        """Fetch recent history and fire events for any new records."""
        history = await client.history.get(page=1, page_size=10)
        if not history or "records" not in history:
            return

        records = history["records"]
        if self.last_history_id is not None:
            for record in reversed(records):  # Process oldest to newest
                if record.get("id", 0) > self.last_history_id:
                    self.hass.bus.async_fire(
                        "armadarr_history_event",
                        {
                            "app_type": app_type,
                            "entry_id": self.config_entry.entry_id,
                            "event_type": record.get("eventType"),
                            "source_title": record.get("sourceTitle"),
                            "date": record.get("date"),
                        },
                    )

        if records:
            self.last_history_id = max(r.get("id", 0) for r in records)

    @staticmethod
    async def _fetch_calendar(client: Any, app_type: str, upcoming_days: int) -> Any:
        """Fetch calendar entries for the next ``upcoming_days`` days."""
        start = datetime.now(tz=UTC)
        end = start + timedelta(days=upcoming_days)
        kwargs = {}
        if app_type in ["Sonarr", "Whisparr"]:
            kwargs["includeSeries"] = True
        elif app_type == "Radarr":
            kwargs["includeMovie"] = True
        elif app_type == "Lidarr":
            kwargs["includeArtist"] = True
        elif app_type == "Readarr":
            kwargs["includeAuthor"] = True

        return await client.calendar.get(
            start_date=start,
            end_date=end,
            unmonitored=True,
            **kwargs,
        )

    @staticmethod
    async def _fetch_dispatcharr(client: Any) -> dict[str, Any]:
        """Fetch all Dispatcharr-specific data."""
        return {
            "indexer_status": await client.indexer.get(),
            "channels": await client.channels.get(),
            "streams": await client.streams.get(),
            "vod": await client.vod.get_all(),
            "plugins": await client.plugins.get(),
            "backups": await client.backups.get(),
            "m3u_accounts": await client.m3u.get_accounts(),
            "epg_sources": await client.epg.get_sources(),
            "proxy_status": await client.proxy.get_ts_status(),
            "channel_groups": await client.channel_groups.get(),
            "channel_profiles": await client.channel_profiles.get(),
            "connect_integrations": await client.connect.get_integrations(),
            "hdhr_devices": await client.hdhr.get_devices(),
        }


class DailyCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching daily data from the API (12 hours)."""

    config_entry: ArmadarrConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        config_entry: ArmadarrConfigEntry,
    ) -> None:
        """Initialize."""
        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=f"{DOMAIN}_{config_entry.data['app_type']}_daily",
            update_interval=timedelta(hours=12),
        )
        self.config_entry = config_entry

    async def _async_update_data(self) -> dict[str, Any]:
        """Update data via library."""
        client = self.config_entry.runtime_data.client
        app_type = self.config_entry.data["app_type"]
        wanted_count = int(
            self.config_entry.options.get(
                CONF_WANTED_COUNT,
                self.config_entry.data.get(CONF_WANTED_COUNT, DEFAULT_WANTED_COUNT),
            )
        )

        data: dict[str, Any] = {}

        try:
            if app_type in ["Sonarr", "Whisparr"]:
                data["series"] = await client.series.get()
                data["unmonitored_count"] = sum(
                    1 for s in data["series"] if not s.get("monitored")
                )
            elif app_type == "Radarr":
                data["movies"] = await client.movie.get()
                data["unmonitored_count"] = sum(
                    1 for m in data["movies"] if not m.get("monitored")
                )
            elif app_type == "Lidarr":
                data["artists"] = await client.artist.get()
                data["unmonitored_count"] = sum(
                    1 for a in data["artists"] if not a.get("monitored")
                )
            elif app_type == "Readarr":
                data["authors"] = await client.author.get()
                data["unmonitored_count"] = sum(
                    1 for a in data["authors"] if not a.get("monitored")
                )

            if app_type in ["Sonarr", "Whisparr", "Radarr", "Lidarr", "Readarr"]:
                # Fetch missing count
                missing_data = await client.wanted.get(page=1, page_size=1)
                data["missing_count"] = int(missing_data.get("totalRecords", 0))

                # Fetch wanted data
                kwargs = {}
                if app_type in ["Sonarr", "Whisparr"]:
                    kwargs["includeSeries"] = True
                elif app_type == "Radarr":
                    kwargs["includeMovie"] = True
                elif app_type == "Lidarr":
                    kwargs["includeArtist"] = True
                elif app_type == "Readarr":
                    kwargs["includeAuthor"] = True

                wanted_data = await client.wanted.get(
                    page=1,
                    page_size=wanted_count,
                    sort_key="airDateUtc"
                    if app_type in ["Sonarr", "Whisparr"]
                    else "releaseDate",
                    sort_dir="descending",
                    **kwargs,
                )
                data["wanted"] = wanted_data.get("records", [])

        except Exception as exception:
            msg = f"Error communicating with API: {exception}"
            raise UpdateFailed(msg) from exception
        else:
            return data
