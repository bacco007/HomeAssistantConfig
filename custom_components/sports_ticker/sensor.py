from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    CONF_LEAGUES,
    LEAGUES,
    CONF_TICKER_SPEED,
    DEFAULT_TICKER_SPEED,
    CONF_TICKER_THEME,
    DEFAULT_TICKER_THEME,
)
from .coordinator import SportsTickerCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SportsTickerCoordinator = hass.data[DOMAIN][entry.entry_id]

    leagues = entry.options.get(CONF_LEAGUES, entry.data.get(CONF_LEAGUES, ["mlb", "nfl"]))
    if isinstance(leagues, str):
        leagues = [leagues]
    leagues = [str(x).strip().lower() for x in (leagues or [])]

    entities = [ESPNRawScoreboard(coordinator, lg) for lg in leagues if lg in LEAGUES]
    async_add_entities(entities, update_before_add=True)


class ESPNRawScoreboard(CoordinatorEntity[SportsTickerCoordinator], SensorEntity):
    _attr_icon = "mdi:scoreboard-outline"

    def __init__(self, coordinator: SportsTickerCoordinator, league: str) -> None:
        super().__init__(coordinator)
        self.league = league

        # entity_id becomes sensor.espn_<league>_scoreboard_raw via unique_id
        self._attr_unique_id = f"espn_{league}_scoreboard_raw"
        self._attr_name = f"ESPN {league.upper()} Scoreboard Raw"

    @property
    def available(self) -> bool:
        d = self.coordinator.data.get(self.league, {})
        return bool(d) and "error" not in d

    @property
    def native_value(self) -> str:
        return self.coordinator.data.get(self.league, {}).get("fetched_at", "")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        d = self.coordinator.data.get(self.league, {})
        entry = self.coordinator.entry
        opts = {**entry.data, **entry.options}

        return {
            # ESPN payload bits
            "events": d.get("events", []),
            "leagues": d.get("leagues"),
            "day": d.get("day"),
            "season": d.get("season"),
            "next": d.get("next"),

            # Card helpers (button-card can read these)
            "ticker_speed": int(opts.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED)),
            "ticker_theme": str(opts.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME)),
        }