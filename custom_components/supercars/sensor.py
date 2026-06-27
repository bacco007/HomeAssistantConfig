"""Sensor platform for Supercars Championship integration."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NatsoftCoordinator
from .news_coordinator import NewsCoordinator
from .schedule_coordinator import ScheduleCoordinator
from .standings_coordinator import StandingsCoordinator
from .results_coordinator import ResultsCoordinator

def _driver_picture(name: str) -> str:
    return f"https://www.supercars.com/images/drivers/{name.lower().replace(' ', '-')}.jpg"


# ── Timing sensors ────────────────────────────────────────────────────────────

TIMING_SENSOR_DESCRIPTIONS: list[SensorEntityDescription] = [
    SensorEntityDescription(key="flag_state",             name="Flag State",        icon="mdi:flag-checkered"),
    SensorEntityDescription(key="leader",                 name="Race Leader",       icon="mdi:trophy"),
    SensorEntityDescription(key="current_lap",            name="Current Lap",       icon="mdi:counter",          native_unit_of_measurement="lap"),
    SensorEntityDescription(key="session_name",           name="Session",           icon="mdi:racing-helmet"),
    SensorEntityDescription(key="round_name",             name="Round",             icon="mdi:map-marker"),
    SensorEntityDescription(key="session_time_remaining", name="Time Remaining",    icon="mdi:timer-outline"),
    SensorEntityDescription(key="weather_temp",           name="Air Temperature",   icon="mdi:thermometer",      native_unit_of_measurement="°C"),
    SensorEntityDescription(key="weather_track",          name="Track Temperature", icon="mdi:road",             native_unit_of_measurement="°C"),
]

# ── Schedule countdown sensors ────────────────────────────────────────────────

SCHEDULE_SENSOR_DESCRIPTIONS = [
    # (unique_key, name, icon, data_key_label, data_key_countdown, data_key_start)
    ("next_session",    "Next Session",       "mdi:clock-start",       "next_session",    "next_session_countdown_seconds",    "next_session_start"),
    ("next_practice",   "Next Practice",      "mdi:car-wrench",        "next_practice",   "next_practice_countdown_seconds",   "next_practice_start"),
    ("next_qualifying", "Next Qualifying",    "mdi:timer-sand",        "next_qualifying", "next_qualifying_countdown_seconds", "next_qualifying_start"),
    ("next_race",       "Next Race",          "mdi:flag-checkered",    "next_race",       "next_race_countdown_seconds",       "next_race_start"),
]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up all Supercars sensors."""
    timing_coord: NatsoftCoordinator    = hass.data[DOMAIN][entry.entry_id]["timing"]
    news_coord: NewsCoordinator         = hass.data[DOMAIN][entry.entry_id]["news"]
    schedule_coord: ScheduleCoordinator = hass.data[DOMAIN][entry.entry_id]["schedule"]
    standings_coord: StandingsCoordinator = hass.data[DOMAIN][entry.entry_id]["standings"]
    results_coord: ResultsCoordinator   = hass.data[DOMAIN][entry.entry_id]["results"]

    entities: list[SensorEntity] = []
    entities.extend(SupercarsSensor(timing_coord, d) for d in TIMING_SENSOR_DESCRIPTIONS)
    entities.append(SupercarsNewsSensor(news_coord))
    entities.append(SupercarsStandingsSensor(standings_coord, "driver", "Driver Standings", "mdi:account-group"))
    entities.append(SupercarsStandingsSensor(standings_coord, "team", "Team Standings", "mdi:account-group"))
    entities.append(SupercarsResultsSensor(results_coord))
    entities.extend(
        SupercarsCountdownSensor(schedule_coord, *args)
        for args in SCHEDULE_SENSOR_DESCRIPTIONS
    )
    async_add_entities(entities)


# ── Timing sensor ─────────────────────────────────────────────────────────────

class SupercarsSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator: NatsoftCoordinator, description: SensorEntityDescription) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{DOMAIN}_{description.key}"
        self._attr_name = f"Supercars {description.name}"

    @property
    def native_value(self):
        return self.coordinator.data.get(self.entity_description.key)

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        attrs: dict = {}
        if self.entity_description.key == "flag_state":
            attrs["session_active"] = data.get("session_active", False)
            attrs["flag_state_raw"] = data.get("flag_state_raw")
            attrs["stream_url"] = data.get("stream_url")
            attrs["stream_note"] = data.get("stream_note")
            for i, comp in enumerate(data.get("top_10", []), 1):
                attrs[f"p{i}_driver"] = comp.get("driver")
                attrs[f"p{i}_car"]    = comp.get("car_number")
                attrs[f"p{i}_gap"]    = comp.get("gap")
        elif self.entity_description.key == "leader":
            attrs["car_number"] = data.get("leader_car")
            attrs["team"]       = data.get("leader_team")
            driver = self.native_value
            if driver:
                attrs["entity_picture"] = _driver_picture(driver)
        elif self.entity_description.key == "current_lap":
            attrs["total_laps"] = data.get("total_laps")
        return attrs

    @property
    def available(self) -> bool:
        return self.coordinator.last_update_success and self.coordinator.data is not None


# ── Standings sensors ─────────────────────────────────────────────────────────

class SupercarsStandingsSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator: StandingsCoordinator, standings_type: str, name: str, icon: str) -> None:
        super().__init__(coordinator)
        self._type = standings_type
        self._attr_unique_id = f"{DOMAIN}_{self._type}_standings"
        self._attr_name = f"Supercars {name}"
        self._attr_icon = icon

    @property
    def native_value(self) -> str | None:
        key = "drivers" if self._type == "driver" else "teams"
        standings = self.coordinator.data.get(key, [])
        if standings:
            item = standings[0]
            return item.get("driver") or item.get("team")
        return "Unknown"

    @property
    def extra_state_attributes(self) -> dict:
        key = "drivers" if self._type == "driver" else "teams"
        rows = self.coordinator.data.get(key, [])
        if self._type == "driver":
            rows = [
                {**row, "entity_picture": _driver_picture(row["driver"])}
                if "driver" in row else dict(row)
                for row in rows
            ]
        else:
            rows = [dict(row) for row in rows]
        return {key: rows, "source": self.coordinator.data.get("source")}

    @property
    def available(self) -> bool:
        return self.coordinator.last_update_success and self.coordinator.data is not None


# ── Results sensor ────────────────────────────────────────────────────────────

class SupercarsResultsSensor(CoordinatorEntity, SensorEntity):
    _attr_unique_id = f"{DOMAIN}_latest_results"
    _attr_name = "Supercars Latest Results"
    _attr_icon = "mdi:podium"

    def __init__(self, coordinator: ResultsCoordinator) -> None:
        super().__init__(coordinator)

    @property
    def native_value(self) -> str | None:
        finishers = self.coordinator.data.get("finishers", [])
        if finishers:
            return finishers[0].get("driver")
        return "Unknown"

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        finishers = [
            {**f, "entity_picture": _driver_picture(f["driver"])}
            if "driver" in f else dict(f)
            for f in data.get("finishers", [])
        ]
        return {
            "finishers": finishers,
            "source":  data.get("source"),
            "session": data.get("session"),
            "round":   data.get("round"),
            "live":    data.get("live", False),
        }

    @property
    def available(self) -> bool:
        return self.coordinator.last_update_success and self.coordinator.data is not None


# ── News sensor ───────────────────────────────────────────────────────────────

class SupercarsNewsSensor(CoordinatorEntity, SensorEntity):
    _attr_unique_id = f"{DOMAIN}_latest_news"
    _attr_name      = "Supercars Latest News"
    _attr_icon      = "mdi:newspaper-variant-outline"

    def __init__(self, coordinator: NewsCoordinator) -> None:
        super().__init__(coordinator)

    @property
    def native_value(self) -> str | None:
        h = self.coordinator.data.get("latest_news_headline")
        return h[:252] + "..." if h and len(h) > 255 else h

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        attrs: dict = {"latest_url": data.get("latest_news_url")}
        for i, a in enumerate(data.get("news_articles",    []),    1): attrs[f"news_{i}_title"]    = a["title"]; attrs[f"news_{i}_url"]    = a["url"]  # noqa: E702
        for i, a in enumerate(data.get("video_articles",   [])[:3], 1): attrs[f"video_{i}_title"]   = a["title"]; attrs[f"video_{i}_url"]   = a["url"]  # noqa: E702
        for i, a in enumerate(data.get("podcast_articles", [])[:3], 1): attrs[f"podcast_{i}_title"] = a["title"]; attrs[f"podcast_{i}_url"] = a["url"]  # noqa: E702
        return attrs

    @property
    def available(self) -> bool:
        return self.coordinator.last_update_success and self.coordinator.data is not None


# ── Schedule countdown sensor ─────────────────────────────────────────────────

def _fmt_countdown(seconds: int | None) -> str | None:
    """Convert seconds to human-readable H:MM:SS or D days H:MM."""
    if seconds is None:
        return None
    if seconds <= 0:
        return "Now"
    days, rem = divmod(seconds, 86400)
    hours, rem = divmod(rem, 3600)
    mins, secs = divmod(rem, 60)
    if days > 0:
        return f"{days}d {hours}h {mins:02d}m"
    return f"{hours}:{mins:02d}:{secs:02d}"


class SupercarsCountdownSensor(CoordinatorEntity, SensorEntity):
    """Countdown sensor for a specific session type."""

    def __init__(
        self,
        coordinator: ScheduleCoordinator,
        unique_suffix: str,
        display_name: str,
        icon: str,
        label_key: str,
        countdown_key: str,
        start_key: str,
    ) -> None:
        super().__init__(coordinator)
        self._label_key     = label_key
        self._countdown_key = countdown_key
        self._start_key     = start_key
        self._attr_unique_id = f"{DOMAIN}_{unique_suffix}"
        self._attr_name      = f"Supercars {display_name}"
        self._attr_icon      = icon

    @property
    def native_value(self) -> str | None:
        """Human-readable countdown as sensor state."""
        secs = self.coordinator.data.get(self._countdown_key)
        return _fmt_countdown(secs)

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        attrs: dict = {
            "session":             data.get(self._label_key),
            "start_time":          data.get(self._start_key),
            "countdown_seconds":   data.get(self._countdown_key),
            "event":               data.get("event"),
            "round":               data.get("round"),
            "venue":               data.get("venue"),
            "sessions_remaining":  data.get("sessions_remaining"),
            "schedule_source":     data.get("schedule_source"),
        }
        # On the "next session" sensor also expose full schedule
        if self._label_key == "next_session":
            attrs["all_sessions"] = data.get("all_sessions", [])
        return attrs

    @property
    def available(self) -> bool:
        return (
            self.coordinator.last_update_success
            and self.coordinator.data is not None
            and self.coordinator.data.get(self._countdown_key) is not None
        )
