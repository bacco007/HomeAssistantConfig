from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    CONF_LEAGUES,
    CONF_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL,
    LEAGUES,
)

LOGGER = logging.getLogger(__name__)


def _parse_dt(dt_str: str) -> datetime | None:
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None


def _pick_next_event(events: list[dict[str, Any]]) -> dict[str, Any] | None:
    now = datetime.now(timezone.utc)
    dated: list[tuple[datetime, dict[str, Any]]] = []

    for ev in events or []:
        dt = _parse_dt(ev.get("date", ""))
        if dt:
            dated.append((dt, ev))

    if not dated:
        return events[0] if events else None

    dated.sort(key=lambda x: x[0])

    for dt, ev in dated:
        if dt >= now:
            return ev

    return dated[0][1]


class SportsTickerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    def __init__(self, hass: HomeAssistant, entry) -> None:
        self.hass = hass
        self.entry = entry
        self.session = async_get_clientsession(hass)

        poll = int(
            entry.options.get(
                CONF_POLL_INTERVAL,
                entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
            )
        )

        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=poll),
        )

    async def _fetch(self, url: str) -> dict[str, Any]:
        try:
            async with self.session.get(url, timeout=20) as resp:
                if resp.status != 200:
                    raise UpdateFailed(f"ESPN HTTP {resp.status} for {url}")
                return await resp.json()
        except Exception as err:
            raise UpdateFailed(str(err)) from err

    async def _async_update_data(self) -> dict[str, Any]:
        leagues = self.entry.options.get(
            CONF_LEAGUES,
            self.entry.data.get(CONF_LEAGUES, ["mlb", "nfl"]),
        )

        if isinstance(leagues, str):
            leagues = [leagues]
        leagues = [str(x).strip().lower() for x in (leagues or [])]

        result: dict[str, Any] = {}
        fetched_at = datetime.now(timezone.utc).isoformat()

        for key in leagues:
            url = LEAGUES.get(key)
            if not url:
                result[key] = {"error": "unknown_league", "fetched_at": fetched_at}
                continue

            try:
                raw = await self._fetch(url)
                events = raw.get("events") or []
                nxt = _pick_next_event(events)

                result[key] = {
                    "fetched_at": fetched_at,
                    "events": events,
                    "leagues": raw.get("leagues"),
                    "day": raw.get("day"),
                    "season": raw.get("season"),
                    "next": nxt,
                }
            except Exception as e:
                result[key] = {"error": str(e), "fetched_at": fetched_at}

        return result

    async def async_shutdown(self) -> None:
        """No-op: we use HA's shared session (don't close it)."""
        return