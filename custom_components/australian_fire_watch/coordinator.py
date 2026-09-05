"""Coordinator that combines official Australian fire products safely."""

from __future__ import annotations

import asyncio
from collections.abc import Mapping
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from functools import partial
import logging
from typing import Any
from zoneinfo import ZoneInfo

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import aiohttp_client
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .api import FeedSnapshot, OfficialFeedClient
from .notifications import NotificationOutbox
from .const import (
    BOM_FIRE_DANGER_URL,
    BOM_WARNINGS_URL,
    CAP_URL,
    CONF_ADVICE_RADIUS,
    CONF_DISTRICT,
    CONF_ENABLE_BOM,
    CONF_EMERGENCY_RADIUS,
    CONF_JURISDICTION,
    CONF_MONITOR_RADIUS,
    CONF_NAME,
    CONF_NOTIFY_SERVICES,
    CONF_READINESS_ENTITIES,
    CONF_STALE_AFTER,
    CONF_UNCLASSIFIED_RADIUS,
    CONF_WATCH_RADIUS,
    CONF_WEATHER_ENTITY,
    CONF_ZONE,
    DEFAULT_ADVICE_RADIUS_KM,
    DEFAULT_DISTRICT,
    DEFAULT_ENABLE_BOM,
    DEFAULT_EMERGENCY_RADIUS_KM,
    DEFAULT_JURISDICTION,
    DEFAULT_MONITOR_RADIUS_KM,
    DEFAULT_NAME,
    DEFAULT_STALE_AFTER_MINUTES,
    DEFAULT_UNCLASSIFIED_RADIUS_KM,
    DEFAULT_WATCH_RADIUS_KM,
    DEFAULT_ZONE,
    DOMAIN,
    EVENT_ALERT,
    FDR_TOBAN_URL,
    GEOJSON_URL,
    INCIDENT_ALERTS_URL,
    MIN_UPDATE_INTERVAL,
    OFFICIAL_BOM_WARNINGS_URL,
    OFFICIAL_DANGER_URL,
    OFFICIAL_INCIDENTS_URL,
    SUMMARY_INCIDENT_LIMIT,
    SUMMARY_PLANNED_LIMIT,
)
from .model import (
    DangerLifecycleEvent,
    Incident,
    LifecycleEvent,
    WarningLevel,
    ParsedFeed,
    danger_notification_priority,
    incident_entity_id,
    incident_event_summary,
    incident_notification_priority,
    normalize_warning,
    sort_incidents,
    sort_incidents_by_distance,
    track_danger_lifecycle,
    track_incident_lifecycle,
)
from .jurisdictions import Jurisdiction, jurisdiction_for
from .parsers import (
    FeedParseError,
    merge_incidents,
    parse_bom_fire_danger,
    parse_bom_fire_weather_warnings,
    parse_cap,
    parse_geojson,
    parse_rfs_fire_danger,
)
from .regional_parsers import PARSER_NAMES, fire_incidents_only

_LOGGER = logging.getLogger(__name__)

CORE_FEEDS = {
    "rfs_cap": CAP_URL,
    "rfs_geojson": GEOJSON_URL,
    "rfs_incident_alerts": INCIDENT_ALERTS_URL,
    "rfs_fdr_toban": FDR_TOBAN_URL,
}

BOM_FEEDS = {
    "bom_idn10016": BOM_FIRE_DANGER_URL,
    "bom_nsw_warnings": BOM_WARNINGS_URL,
}


class FireWatchCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetch, normalize, rank and track one monitored zone."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN}_{entry.entry_id}",
            update_interval=MIN_UPDATE_INTERVAL,
            always_update=False,
        )
        self.entry = entry
        self.api = OfficialFeedClient(aiohttp_client.async_get_clientsession(hass))
        self._store = Store[dict[str, Any]](
            hass, 1, f"{DOMAIN}.{entry.entry_id}.lifecycle"
        )
        self._store_lock = asyncio.Lock()
        self._transaction_lock = asyncio.Lock()
        self._outbox = NotificationOutbox()
        self._lifecycle_committed = False
        self._records: dict[str, dict[str, Any]] = {}
        self._danger_records: dict[str, dict[str, Any]] = {}
        self._acknowledged: dict[str, str] = {}
        self._snoozed: dict[str, str] = {}
        self._baseline_complete = False
        self._danger_baseline_complete = False
        self._incidents: tuple[Incident, ...] = ()
        self._planned: tuple[Incident, ...] = ()
        self._danger: dict[str, Any] = _unknown_danger()
        self._warnings: list[dict[str, Any]] = []
        self._feed: dict[str, Any] = _empty_feed()
        self._parse_errors: dict[str, str] = {}
        self.last_events: tuple[LifecycleEvent, ...] = ()
        self.last_danger_events: tuple[DangerLifecycleEvent, ...] = ()

    @property
    def config(self) -> dict[str, Any]:
        """Config entry data with options taking precedence."""
        return {**dict(self.entry.data), **dict(self.entry.options)}

    @property
    def jurisdiction(self) -> Jurisdiction:
        """Selected publisher profile; legacy entries remain NSW."""
        return jurisdiction_for(
            self.config.get(CONF_JURISDICTION, DEFAULT_JURISDICTION)
        )

    async def async_initialize(self) -> None:
        """Load persistent lifecycle/acknowledgement state before first poll."""
        saved = await self._store.async_load() or {}
        self._restore_persistent_state(saved)

    def _restore_persistent_state(self, saved: dict[str, Any]) -> None:
        self._outbox = NotificationOutbox(saved.get("notification_outbox"))
        self._records = {
            str(key): dict(value)
            for key, value in (saved.get("records") or {}).items()
            if isinstance(value, Mapping)
        }
        self._danger_records = {
            str(key): dict(value)
            for key, value in (saved.get("danger_records") or {}).items()
            if isinstance(value, Mapping)
        }
        self._acknowledged = {
            str(key): str(value)
            for key, value in (saved.get("acknowledged") or {}).items()
        }
        self._snoozed = {
            str(key): str(value) for key, value in (saved.get("snoozed") or {}).items()
        }
        self._baseline_complete = bool(saved.get("baseline_complete", False))
        self._danger_baseline_complete = bool(
            saved.get("danger_baseline_complete", False)
        )

    async def _async_update_data(self) -> dict[str, Any]:
        async with self._transaction_lock:
            checkpoint = self._persistent_state()
            self._lifecycle_committed = False
            try:
                if self.jurisdiction.code != "NSW":
                    return await self._async_update_regional_data()
                return await self._async_update_nsw_data()
            except Exception:
                if not self._lifecycle_committed:
                    self._restore_persistent_state(checkpoint)
                raise

    async def _async_update_nsw_data(self) -> dict[str, Any]:
        feeds = dict(CORE_FEEDS)
        parsers = {
            "rfs_cap": parse_cap,
            "rfs_geojson": parse_geojson,
            "rfs_incident_alerts": partial(
                parse_cap, source="NSW RFS IncidentAlerts polygons"
            ),
            "rfs_fdr_toban": parse_rfs_fire_danger,
        }
        if self.config.get(CONF_ENABLE_BOM, DEFAULT_ENABLE_BOM):
            feeds.update(BOM_FEEDS)
            parsers.update(
                {
                    "bom_idn10016": parse_bom_fire_danger,
                    "bom_nsw_warnings": parse_bom_fire_weather_warnings,
                }
            )
        snapshots = {
            item.name: item
            for item in await asyncio.gather(
                *(
                    self.api.async_fetch(name, url, validator=parsers[name])
                    for name, url in feeds.items()
                )
            )
        }
        self._parse_errors = {}
        parsed = {
            name: self._parse(name, snapshots[name], parser)
            for name, parser in parsers.items()
        }
        incident_names = ("rfs_cap", "rfs_geojson", "rfs_incident_alerts")
        current = {
            name: parsed[name]
            for name in incident_names
            if self._source_current(snapshots[name], parsed[name])
        }
        self._feed = self._compose_feed(
            snapshots,
            parsed["rfs_cap"],
            parsed["rfs_geojson"],
            parsed["rfs_incident_alerts"],
        )
        all_items = merge_incidents(
            *(parsed[name].incidents if parsed[name] else () for name in incident_names)
        )
        current_items = merge_incidents(
            *(
                current[name].incidents if name in current else ()
                for name in incident_names
            )
        )
        # Validate raw products before applying the common bushfire-only policy.
        all_items = fire_incidents_only(_incident_feed(all_items)).incidents
        current_items = fire_incidents_only(_incident_feed(current_items)).incidents
        _located, monitored = self._locate_incidents(all_items)
        current_located, current_monitored = self._locate_incidents(current_items)
        self._set_display_incidents(monitored)
        self._danger = self._compose_danger(
            parsed["rfs_fdr_toban"], parsed.get("bom_idn10016"), snapshots
        )
        warnings = parsed.get("bom_nsw_warnings")
        self._warnings = list(warnings.metadata.get("warnings", [])) if warnings else []
        events = await self._async_track_lifecycle(
            current_monitored,
            current_located,
            bool(current),
            self._feed["assessment_complete"],
        )
        danger_current = bool(
            self._source_current(snapshots["rfs_fdr_toban"], parsed["rfs_fdr_toban"])
            and any(self._danger[day].get("available") for day in ("today", "tomorrow"))
        )
        danger_events = await self._async_track_danger_lifecycle(danger_current)
        self.last_events, self.last_danger_events = tuple(events), tuple(danger_events)
        await self._async_emit_events(events, danger_events)
        return self._compose_data()

    async def _async_update_regional_data(self) -> dict[str, Any]:
        profile = self.jurisdiction
        parsers = {
            feed.name: partial(
                _parse_regional_cap
                if feed.parser == "cap"
                else PARSER_NAMES[feed.parser],
                source=profile.agency,
                official_url=profile.official_url,
            )
            for feed in profile.feeds
        }
        snapshots = {
            item.name: item
            for item in await asyncio.gather(
                *(
                    self.api.async_fetch(
                        feed.name, feed.url, validator=parsers[feed.name]
                    )
                    for feed in profile.feeds
                )
            )
        }
        self._parse_errors = {}
        parsed = {}
        for name, parser in parsers.items():
            result = self._parse(name, snapshots[name], parser)
            if result is not None:
                parsed[name] = fire_incidents_only(result)
        current = {
            name: result
            for name, result in parsed.items()
            if self._source_current(snapshots[name], result)
        }
        merged, current_merged = (), ()
        for result in parsed.values():
            merged = merge_incidents(merged, result.incidents)
        for result in current.values():
            current_merged = merge_incidents(current_merged, result.incidents)
        _located, monitored = self._locate_incidents(merged)
        current_located, current_monitored = self._locate_incidents(current_merged)
        self._set_display_incidents(monitored)
        self._danger = _unknown_danger()
        self._danger["district"] = "Not available for this jurisdiction"
        self._danger["source_note"] = (
            "Use the official state or territory fire-danger source."
        )
        self._warnings = []
        self._feed = self._compose_regional_feed(snapshots, parsed)
        events = await self._async_track_lifecycle(
            current_monitored,
            current_located,
            bool(current),
            self._feed["assessment_complete"],
        )
        self.last_events, self.last_danger_events = tuple(events), ()
        await self._async_emit_events(events, [])
        return self._compose_data()

    def _source_current(self, snapshot: FeedSnapshot, parsed: Any) -> bool:
        if parsed is None or not snapshot.response_received:
            return False
        age = _age_seconds(snapshot.fetched_at, datetime.now(timezone.utc))
        return bool(
            age is not None
            and age
            <= int(self.config.get(CONF_STALE_AFTER, DEFAULT_STALE_AFTER_MINUTES)) * 60
            and getattr(parsed, "metadata", {}).get("snapshot_complete", True)
        )

    def _locate_incidents(
        self, incidents: tuple[Incident, ...]
    ) -> tuple[tuple[Incident, ...], tuple[Incident, ...]]:
        latitude, longitude = self._home_coordinates()
        located = tuple(item.with_home(latitude, longitude) for item in incidents)
        radius = float(self.config.get(CONF_MONITOR_RADIUS, DEFAULT_MONITOR_RADIUS_KM))
        return located, tuple(
            item
            for item in located
            if item.alert_distance_km is None or item.alert_distance_km <= radius
        )

    def _set_display_incidents(self, incidents: tuple[Incident, ...]) -> None:
        self._incidents = tuple(
            item for item in sort_incidents(incidents) if not item.is_planned
        )
        self._planned = tuple(
            item for item in sort_incidents(incidents) if item.is_planned
        )

    def _compose_regional_feed(
        self, snapshots: dict[str, FeedSnapshot], parsed_feeds: dict[str, Any]
    ) -> dict[str, Any]:
        profile = self.jurisdiction
        return self._feed_health(
            snapshots,
            parsed_feeds,
            tuple(feed.name for feed in profile.feeds),
            profile.agency,
        )

    def _feed_health(
        self,
        snapshots: dict[str, FeedSnapshot],
        parsed: dict[str, Any],
        required: tuple[str, ...],
        source: str,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        available = [name for name in required if parsed.get(name) is not None]
        current = [
            name
            for name in required
            if self._source_current(snapshots[name], parsed.get(name))
        ]
        fetched = max(
            (
                snapshots[name].fetched_at
                for name in available
                if snapshots[name].fetched_at
            ),
            default=None,
        )
        age = _age_seconds(fetched, now)
        threshold = (
            int(self.config.get(CONF_STALE_AFTER, DEFAULT_STALE_AFTER_MINUTES)) * 60
        )
        complete = bool(required) and len(current) == len(required)
        if not available:
            status = "unavailable"
        elif age is None or age > threshold:
            status = "stale"
        elif (
            not complete
            or self._parse_errors
            or any(not item.response_received for item in snapshots.values())
        ):
            status = "degraded"
        else:
            status = "fresh"
        generated = max(
            (
                getattr(parsed[name], "generated_at", None)
                for name in available
                if getattr(parsed[name], "generated_at", None)
            ),
            default=None,
        )
        return {
            "status": status,
            "assessment_complete": complete,
            "current_incident_feeds": current,
            "last_successful_update": _iso(fetched),
            "data_generated_at": _iso(generated),
            "age_seconds": age,
            "stale_after_seconds": threshold,
            "source_name": source,
            "official_url": self.jurisdiction.official_url,
            "attribution": self.jurisdiction.attribution,
            "cross_check": {
                "feed_count": len(required),
                "available_count": len(available),
            },
            "sources": {
                name: {
                    "status": item.status,
                    "url": item.url,
                    "last_successful_fetch": _iso(item.fetched_at),
                    "last_changed": _iso(item.changed_at),
                    "last_modified": _iso(item.last_modified),
                    "from_cache": item.from_cache,
                    "error": item.error or self._parse_errors.get(name),
                }
                for name, item in snapshots.items()
            },
        }

    def _parse(self, name: str, snapshot: FeedSnapshot, parser: Any) -> Any | None:
        if snapshot.body is None:
            return None
        try:
            return parser(snapshot.body)
        except (FeedParseError, ValueError, TypeError, KeyError) as err:
            self._parse_errors[name] = f"{type(err).__name__}: {err}"[:300]
            _LOGGER.error("Unable to parse official feed %s: %s", name, err)
            return None

    def _home_coordinates(self) -> tuple[float, float]:
        zone_entity = str(self.config.get(CONF_ZONE, DEFAULT_ZONE))
        zone = self.hass.states.get(zone_entity)
        if zone:
            try:
                return float(zone.attributes["latitude"]), float(
                    zone.attributes["longitude"]
                )
            except (KeyError, TypeError, ValueError):
                _LOGGER.warning(
                    "Zone %s has no usable coordinates; using HA home", zone_entity
                )
        return float(self.hass.config.latitude), float(self.hass.config.longitude)

    def _compose_danger(
        self,
        rfs_districts: dict[str, Any] | None,
        bom: dict[str, Any] | None,
        snapshots: dict[str, FeedSnapshot],
    ) -> dict[str, Any]:
        district = str(self.config.get(CONF_DISTRICT, DEFAULT_DISTRICT))
        rfs = (rfs_districts or {}).get(district, {})
        snapshot = snapshots["rfs_fdr_toban"]
        published = snapshot.last_modified or snapshot.changed_at
        sydney = ZoneInfo("Australia/Sydney")
        local_today = datetime.now(sydney).date()
        source_date = _as_datetime(rfs.get("source_date"))
        anchor = (
            source_date.date()
            if source_date
            else (published.astimezone(sydney).date() if published else None)
        )
        declarations = (
            {
                (anchor + timedelta(days=offset)).isoformat(): dict(
                    rfs.get(period) or {}
                )
                for offset, period in enumerate(("today", "tomorrow"))
            }
            if anchor
            else {}
        )
        bom_forecasts = list((bom or {}).get("districts", {}).get(district, []))
        by_date = {item.get("date"): item for item in bom_forecasts}
        current = self._source_current(snapshot, rfs_districts)

        def day(offset: int) -> dict[str, Any]:
            date = (local_today + timedelta(days=offset)).isoformat()
            declaration = declarations.get(date, {})
            valid = current and bool(declaration)
            bom_day = by_date.get(date, {})
            return {
                "date": date,
                "available": valid,
                "rating": declaration.get("rating", "Unknown") if valid else "Unknown",
                "total_fire_ban": declaration.get("total_fire_ban") if valid else None,
                "fbi": bom_day.get("fbi"),
                "issued_at": _iso(published),
                "rating_source": "NSW RFS fdrToban.xml" if declaration else None,
                "fbi_source": "BOM IDN10016" if bom_day else None,
                "retained": not current,
            }

        return {
            "district": district,
            "today": day(0),
            "tomorrow": day(1),
            "forecast": bom_forecasts,
            "bom_issued_at": _iso((bom or {}).get("issued_at")),
            "rfs_issued_at": _iso(published),
            "last_known_declarations": declarations,
            "source_note": "NSW RFS declarations are bound to their source dates; unavailable data is never a No Ban declaration.",
        }

    def _compose_feed(
        self,
        snapshots: dict[str, FeedSnapshot],
        cap: Any | None,
        geojson: Any | None,
        supplemental: Any | None = None,
    ) -> dict[str, Any]:
        result = self._feed_health(
            snapshots,
            {
                "rfs_cap": cap,
                "rfs_geojson": geojson,
                "rfs_incident_alerts": supplemental,
            },
            ("rfs_cap", "rfs_geojson", "rfs_incident_alerts"),
            "NSW RFS official incident feeds",
        )
        cap_ids = {item.id for item in cap.incidents} if cap else set()
        geo_ids = {item.id for item in geojson.incidents} if geojson else set()
        result["cross_check"].update(
            {
                "cap_count": len(cap_ids),
                "geojson_count": len(geo_ids),
                "cap_only_count": len(cap_ids - geo_ids),
                "geojson_only_count": len(geo_ids - cap_ids),
            }
        )
        return result

    def _compose_data(self) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        _discard_expired(self._snoozed, now)
        # `_incidents` remains priority ordered for qualification, status, hero
        # and lifecycle decisions. Only the human-facing lists are proximity
        # ordered, so a nearby low-level item cannot outrank an official warning.
        qualifying = [
            incident for incident in self._incidents if self._qualifies(incident)
        ]
        highest = (
            qualifying[0]
            if qualifying
            else (self._incidents[0] if self._incidents else None)
        )
        status = self._summary_status(qualifying)
        profile = self.jurisdiction
        recommended = _recommended_action(status)
        display_incidents = sort_incidents_by_distance(self._incidents)
        display_planned = sort_incidents_by_distance(self._planned)
        incident_dicts = [
            self._incident_dict(incident)
            for incident in display_incidents[:SUMMARY_INCIDENT_LIMIT]
        ]
        planned_dicts = [
            self._incident_dict(incident)
            for incident in display_planned[:SUMMARY_PLANNED_LIMIT]
        ]
        warning_level = (
            qualifying[0].warning_level
            if qualifying and qualifying[0].warning_rank > 0
            else None
        )
        location_name = str(self.config.get(CONF_NAME, DEFAULT_NAME))
        zone_entity_id = str(self.config.get(CONF_ZONE, DEFAULT_ZONE))
        monitored_latitude, monitored_longitude = self._home_coordinates()
        alert_targets = _notify_services(self.config.get(CONF_NOTIFY_SERVICES, []))
        return {
            "status": status,
            "entry_id": self.entry.entry_id,
            "integration": DOMAIN,
            "integration_name": "Australian Fire Watch",
            "jurisdiction": profile.code,
            "jurisdiction_name": profile.name,
            "official_source_name": profile.agency,
            "location_name": location_name,
            "zone_entity_id": zone_entity_id,
            "monitored_location": {
                "latitude": monitored_latitude,
                "longitude": monitored_longitude,
            },
            "summary": _summary_text(status, highest, self._feed),
            "recommended_action": recommended,
            "official_warning_level": warning_level,
            "danger": self._danger,
            "incidents": incident_dicts,
            "planned_burns": planned_dicts,
            "incident_count": len(self._incidents),
            "planned_burn_count": len(self._planned),
            "highest_priority_incident": self._incident_dict(highest)
            if highest
            else None,
            "fire_weather_warnings": self._warnings,
            "fire_weather_warnings_url": (
                OFFICIAL_BOM_WARNINGS_URL
                if profile.code == "NSW"
                else profile.official_url
            ),
            "feed": self._feed,
            "weather": self._weather_context(),
            "readiness_entities": list(self.config.get(CONF_READINESS_ENTITIES, [])),
            "alerts_assigned": bool(alert_targets),
            "notification_delivery": self._outbox.status(),
            "last_known_warning_records": [
                {
                    "incident_id": key,
                    "title": value.get("title"),
                    "warning_level": value.get("warning_level"),
                    "retained": True,
                }
                for key, value in self._records.items()
                if value.get("qualified")
                and key not in {item.id for item in self._incidents}
            ][:SUMMARY_INCIDENT_LIMIT],
            "alert_targets": list(alert_targets),
            "disclaimer": (
                f"Supplementary awareness only. Check {profile.agency}, your "
                "official emergency app, local radio and emergency instructions."
            ),
            "last_updated": now.isoformat(),
        }

    def _incident_dict(self, incident: Incident | None) -> dict[str, Any] | None:
        if incident is None:
            return None
        return incident.as_dict(
            entity_id=incident_entity_id(self.entry.entry_id, incident.id),
            acknowledged=incident.id in self._acknowledged,
            snoozed_until=self._snoozed.get(incident.id),
        )

    def _summary_status(self, qualifying: list[Incident]) -> str:
        if self._feed.get("status") == "unavailable":
            return "unavailable"
        if self._feed.get("status") == "stale":
            return "stale"
        if qualifying:
            warning = qualifying[0].warning_level
            if warning == WarningLevel.EMERGENCY_WARNING:
                return "emergency_warning"
            if warning == WarningLevel.WATCH_AND_ACT:
                return "watch_and_act"
            if warning == WarningLevel.ADVICE:
                return "advice"
            return "incident_nearby"
        # Do not advertise absence during a partial assessment or while a
        # previously qualifying incident awaits the second healthy snapshot.
        current_ids = {item.id for item in self._incidents}
        if (
            not self._feed.get("assessment_complete", False)
            or any(
                value.get("qualified") and key not in current_ids
                for key, value in self._records.items()
            )
            or any(
                item.warning_rank > 0 and item.alert_distance_km is None
                for item in self._incidents
            )
        ):
            return "unavailable"
        if any(
            incident.distance_km is not None
            and incident.distance_km
            <= float(self.config.get(CONF_ADVICE_RADIUS, DEFAULT_ADVICE_RADIUS_KM))
            for incident in self._planned
        ):
            return "planned_activity"
        return "no_current_warning"

    def _qualifies(self, incident: Incident) -> bool:
        if incident.is_planned or incident.alert_distance_km is None:
            return False
        radius = {
            WarningLevel.EMERGENCY_WARNING: float(
                self.config.get(CONF_EMERGENCY_RADIUS, DEFAULT_EMERGENCY_RADIUS_KM)
            ),
            WarningLevel.WATCH_AND_ACT: float(
                self.config.get(CONF_WATCH_RADIUS, DEFAULT_WATCH_RADIUS_KM)
            ),
            WarningLevel.ADVICE: float(
                self.config.get(CONF_ADVICE_RADIUS, DEFAULT_ADVICE_RADIUS_KM)
            ),
        }.get(incident.warning_level)
        if radius is not None:
            return incident.alert_distance_km <= radius
        return bool(
            incident.is_fire
            and incident.alert_distance_km
            <= float(
                self.config.get(
                    CONF_UNCLASSIFIED_RADIUS, DEFAULT_UNCLASSIFIED_RADIUS_KM
                )
            )
        )

    def _weather_context(self) -> dict[str, Any] | None:
        entity_id = str(self.config.get(CONF_WEATHER_ENTITY, "")).strip()
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None:
            return {"entity_id": entity_id, "available": False, "context_only": True}
        attrs = state.attributes
        return {
            "entity_id": entity_id,
            "available": state.state not in {"unknown", "unavailable"},
            "condition": state.state,
            "temperature": attrs.get("temperature"),
            "humidity": attrs.get("humidity"),
            "wind_speed": attrs.get("wind_speed"),
            "wind_gust_speed": attrs.get("wind_gust_speed"),
            "wind_bearing": attrs.get("wind_bearing"),
            "temperature_unit": attrs.get("temperature_unit"),
            "wind_speed_unit": attrs.get("wind_speed_unit"),
            "context_only": True,
            "note": "Weather context only; this integration does not infer fire spread.",
        }

    async def _async_track_lifecycle(
        self,
        incidents: tuple[Incident, ...],
        authoritative_incidents: tuple[Incident, ...],
        snapshot_current: bool,
        resolution_current: bool,
    ) -> list[LifecycleEvent]:
        if not snapshot_current:
            return []
        previous_records = self._records
        previous_baseline = self._baseline_complete
        qualified_ids = {
            incident.id for incident in incidents if self._qualifies(incident)
        }
        records, events, baseline_complete = track_incident_lifecycle(
            previous_records,
            incidents,
            qualified_ids,
            baseline_complete=previous_baseline,
            authoritative_incidents=authoritative_incidents,
            allow_missing_updates=resolution_current,
            allow_deescalation=resolution_current,
        )
        self._records = records
        self._baseline_complete = baseline_complete
        for event in events:
            if event.lifecycle in {"escalated", "resolved", "left_radius"}:
                self._acknowledged.pop(event.incident_id, None)
                self._snoozed.pop(event.incident_id, None)
        # Persisted atomically with staged notifications by _async_emit_events.
        if not previous_baseline and baseline_complete:
            _LOGGER.info(
                "Established incident baseline for %s; initial alerts suppressed",
                self.entry.title,
            )
        return list(events)

    async def _async_track_danger_lifecycle(
        self, snapshot_current: bool
    ) -> list[DangerLifecycleEvent]:
        """Track alert-worthy RFS ratings/bans only after a healthy response."""
        if not snapshot_current:
            return []
        previous_records = self._danger_records
        previous_baseline = self._danger_baseline_complete
        records, events, baseline_complete = track_danger_lifecycle(
            previous_records,
            self._danger,
            baseline_complete=previous_baseline,
        )
        self._danger_records = records
        self._danger_baseline_complete = baseline_complete
        # Persisted atomically with staged notifications by _async_emit_events.
        if not previous_baseline and baseline_complete:
            _LOGGER.info(
                "Established fire-danger baseline for %s; initial alerts suppressed",
                self.entry.title,
            )
        return list(events)

    def _persistent_state(self) -> dict[str, Any]:
        return deepcopy(
            {
                "baseline_complete": self._baseline_complete,
                "danger_baseline_complete": self._danger_baseline_complete,
                "records": self._records,
                "danger_records": self._danger_records,
                "acknowledged": self._acknowledged,
                "snoozed": self._snoozed,
                "notification_outbox": self._outbox.export(),
            }
        )

    async def _async_save_state(self) -> None:
        async with self._store_lock:
            await self._store.async_save(self._persistent_state())

    async def _async_flush_notifications(self) -> bool:
        async def send(full_service: str, payload: dict[str, Any]) -> None:
            _, service = full_service.split(".", 1)
            if not self.hass.services.has_service("notify", service):
                raise HomeAssistantError(
                    f"Notification service {full_service} is unavailable"
                )
            await self.hass.services.async_call(
                "notify", service, payload, blocking=True
            )

        return await self._outbox.async_flush(
            send,
            self._async_save_state,
            services=_notify_services(self.config.get(CONF_NOTIFY_SERVICES, [])),
        )

    def _publish_local_data(self) -> None:
        """Publish local changes without resetting feed polling or feed health."""
        self.data = self._compose_data()
        self.async_update_listeners()

    async def async_retry_notifications(self, _now: datetime) -> None:
        """Retry pending deliveries independently of the five-minute feed poll."""
        async with self._transaction_lock:
            if await self._async_flush_notifications():
                self._publish_local_data()

    async def _async_emit_events(
        self,
        events: list[LifecycleEvent],
        danger_events: list[DangerLifecycleEvent],
    ) -> None:
        payloads: list[dict[str, Any]] = []
        direct_delivery_configured = bool(
            _notify_services(self.config.get(CONF_NOTIFY_SERVICES, []))
        )
        for event in events:
            notification_allowed = self._notification_allowed(event)
            payload = {
                "alert_kind": "incident",
                "entry_id": self.entry.entry_id,
                "location_name": str(self.config.get(CONF_NAME, DEFAULT_NAME)),
                "lifecycle": event.lifecycle,
                "incident_id": event.incident_id,
                "incident": self._incident_dict(event.incident),
                "previous": dict(event.previous or {}),
                "qualifies_for_alert": event.qualifies_for_alert,
                "notification_allowed": notification_allowed,
                "delivery_priority": incident_notification_priority(event),
                "direct_delivery_configured": direct_delivery_configured,
                "summary": incident_event_summary(event),
                "recommended_action": (
                    _recommended_action(self._summary_status([event.incident]))
                    if event.incident and event.qualifies_for_alert
                    else "Check the official incident feed for current information."
                ),
                "notification_tag": (
                    f"australian-fire-watch-{self.entry.entry_id}-{event.incident_id}"
                ),
                "test": False,
                "official_url": self.jurisdiction.official_url,
            }
            self._outbox.discard_tag(payload["notification_tag"])
            payloads.append(payload)
            if event.qualifies_for_alert and notification_allowed:
                await self._async_notify(event, test=False)

        for event in danger_events:
            delivery_priority = danger_notification_priority(
                event.danger, event.lifecycle
            )
            payload = {
                "alert_kind": "danger",
                "entry_id": self.entry.entry_id,
                "location_name": str(self.config.get(CONF_NAME, DEFAULT_NAME)),
                "lifecycle": event.lifecycle,
                "danger_id": event.danger_id,
                "danger": dict(event.danger),
                "previous": dict(event.previous or {}),
                "qualifies_for_alert": event.qualifies_for_alert,
                "notification_allowed": True,
                "delivery_priority": delivery_priority,
                "direct_delivery_configured": direct_delivery_configured,
                "summary": _danger_summary(event),
                "recommended_action": _danger_recommended_action(event),
                "notification_tag": (
                    f"australian-fire-watch-{self.entry.entry_id}-danger-{event.danger_id}"
                ),
                "test": False,
                "official_url": OFFICIAL_DANGER_URL,
            }
            self._outbox.discard_tag(payload["notification_tag"])
            payloads.append(payload)
            if event.qualifies_for_alert:
                await self._async_notify_danger(event)

        # Lifecycle advancement and the delivery obligation are one durable
        # transaction. A failure here causes the update wrapper to roll back.
        await self._async_save_state()
        self._lifecycle_committed = True
        for payload in payloads:
            self.hass.bus.async_fire(EVENT_ALERT, payload)
        await self._async_flush_notifications()

    def _notification_allowed(self, event: LifecycleEvent) -> bool:
        if event.lifecycle in {
            "escalated",
            "deescalated",
            "resolved",
            "left_radius",
        }:
            return True
        if (
            event.incident is not None
            and event.incident.warning_level == WarningLevel.EMERGENCY_WARNING
        ):
            # Acknowledgement must never hide a material official Emergency
            # Warning update. It only quiets lower-level routine updates.
            return True
        incident_id = event.incident_id
        if incident_id in self._acknowledged:
            return False
        until = _as_datetime(self._snoozed.get(incident_id))
        return until is None or until <= datetime.now(timezone.utc)

    async def _async_notify(self, event: LifecycleEvent, *, test: bool) -> None:
        services = _notify_services(self.config.get(CONF_NOTIFY_SERVICES, []))
        if not services:
            return
        incident = event.incident
        if incident is None:
            previous_title = str(
                (event.previous or {}).get("title") or event.incident_id
            )
            title = f"Incident feed update — {previous_title}"
            message = (
                f"{previous_title} is no longer in current feed after two healthy "
                "snapshots. This does not confirm the area is safe; check the "
                "official incident feed."
            )
            actions = [
                {
                    "action": "URI",
                    "title": "Open official map",
                    "uri": self.jurisdiction.official_url,
                }
            ]
        elif event.lifecycle == "left_radius":
            title = f"Incident range update — {incident.title}"
            message = (
                f"{incident.title} moved outside the configured monitor radius. "
                "It remains in the official feed; check the official map for its "
                "current status."
            )
            actions = [
                {
                    "action": "URI",
                    "title": "Open official map",
                    "uri": self.jurisdiction.official_url,
                }
            ]
        else:
            title_prefix = {
                WarningLevel.EMERGENCY_WARNING: "Emergency Warning",
                WarningLevel.WATCH_AND_ACT: "Watch and Act",
                WarningLevel.ADVICE: "Advice",
            }.get(incident.warning_level, "Fire incident nearby")
            title = f"{'TEST — ' if test else ''}{title_prefix} — {incident.title}"
            distance = (
                f"{incident.distance_km:.1f} km {incident.direction or ''} of "
                f"{self.config.get(CONF_NAME, DEFAULT_NAME)}"
                if incident.distance_km is not None
                else "Distance unavailable"
            )
            message = (
                f"{event.lifecycle.replace('_', ' ').title()}: "
                f"{incident.warning_level}; {incident.control_status}; {distance}. "
                f"{incident.instruction or 'Check official updates now.'}"
            )
            action_base = f"{self.entry.entry_id}|{incident.id}"
            actions = [
                {
                    "action": f"AUSTRALIAN_FIRE_WATCH_ACK|{action_base}",
                    "title": "Acknowledge",
                },
                {
                    "action": "URI",
                    "title": "Open official map",
                    "uri": self.jurisdiction.official_url,
                },
            ]
            if incident.warning_level != WarningLevel.EMERGENCY_WARNING:
                minutes = (
                    30 if incident.warning_level == WarningLevel.WATCH_AND_ACT else 120
                )
                actions.insert(
                    1,
                    {
                        "action": (
                            f"AUSTRALIAN_FIRE_WATCH_SNOOZE|{action_base}|{minutes}"
                        ),
                        "title": f"Snooze {minutes} min",
                    },
                )
        data: dict[str, Any] = {
            "tag": f"australian-fire-watch-{self.entry.entry_id}-{event.incident_id}",
            "group": f"australian-fire-watch-{self.entry.entry_id}",
            "url": f"/{self.entry.entry_id and 'australian-fire-watch'}",
            "clickAction": self.jurisdiction.official_url,
            "actions": actions,
        }
        priority = incident_notification_priority(event, test=test)
        _apply_notification_priority(data, priority, "incident")
        await self._async_send_notification(
            services,
            title,
            message,
            data,
            incident_id=event.incident_id,
            expires_at=incident.expires_at if incident else None,
        )

    async def _async_notify_danger(self, event: DangerLifecycleEvent) -> None:
        services = _notify_services(self.config.get(CONF_NOTIFY_SERVICES, []))
        if not services:
            return
        detail = dict(event.danger)
        title = _danger_summary(event)
        message = _danger_notification_message(event)
        data: dict[str, Any] = {
            "tag": (
                f"australian-fire-watch-{self.entry.entry_id}-danger-{event.danger_id}"
            ),
            "group": f"australian-fire-watch-{self.entry.entry_id}",
            "url": "/australian-fire-watch",
            "clickAction": OFFICIAL_DANGER_URL,
            "actions": [
                {
                    "action": "URI",
                    "title": "Open official ratings",
                    "uri": OFFICIAL_DANGER_URL,
                }
            ],
        }
        priority = danger_notification_priority(detail, event.lifecycle)
        _apply_notification_priority(data, priority, "danger")
        await self._async_send_notification(services, title, message, data)

    async def _async_send_notification(
        self,
        services: tuple[str, ...],
        title: str,
        message: str,
        data: dict[str, Any],
        *,
        incident_id: str | None = None,
        expires_at: datetime | None = None,
    ) -> None:
        self._outbox.stage(
            services,
            title,
            message,
            data,
            now=datetime.now(timezone.utc),
            incident_id=incident_id,
            expires_at=expires_at,
        )

    async def async_acknowledge(self, incident_id: str) -> None:
        """Acknowledge current incident updates until a later escalation."""
        async with self._transaction_lock:
            if not any(
                item.id == incident_id for item in (*self._incidents, *self._planned)
            ):
                raise HomeAssistantError(f"Unknown active incident: {incident_id}")
            self._outbox.suppress(incident_id)
            self._acknowledged[incident_id] = datetime.now(timezone.utc).isoformat()
            self._snoozed.pop(incident_id, None)
            await self._async_save_state()
            self._publish_local_data()

    async def async_snooze(self, incident_id: str, duration_minutes: int) -> None:
        """Temporarily suppress non-emergency notifications."""
        async with self._transaction_lock:
            incident = next(
                (
                    item
                    for item in (*self._incidents, *self._planned)
                    if item.id == incident_id
                ),
                None,
            )
            if incident is None:
                raise HomeAssistantError(f"Unknown active incident: {incident_id}")
            if incident.warning_level == WarningLevel.EMERGENCY_WARNING:
                raise HomeAssistantError(
                    "Emergency Warnings can be acknowledged but not snoozed"
                )
            maximum = (
                30 if incident.warning_level == WarningLevel.WATCH_AND_ACT else 120
            )
            if duration_minutes < 1 or duration_minutes > maximum:
                raise HomeAssistantError(
                    f"Snooze must be between 1 and {maximum} minutes for this warning level"
                )
            self._outbox.suppress(incident_id)
            self._snoozed[incident_id] = (
                datetime.now(timezone.utc) + timedelta(minutes=duration_minutes)
            ).isoformat()
            self._acknowledged.pop(incident_id, None)
            await self._async_save_state()
            self._publish_local_data()

    async def async_test_alert(self, level: str) -> None:
        """Emit and optionally notify a clearly labelled, non-critical test."""
        async with self._transaction_lock:
            normalized = normalize_warning(level)
            if normalized not in {
                WarningLevel.ADVICE,
                WarningLevel.WATCH_AND_ACT,
                WarningLevel.EMERGENCY_WARNING,
            }:
                raise HomeAssistantError(
                    "level must be Advice, Watch and Act, or Emergency Warning"
                )
            latitude, longitude = self._home_coordinates()
            incident = Incident(
                id=f"test-{self.entry.entry_id}",
                title="Australian Fire Watch test",
                incident_type="Test",
                warning_level=normalized,
                control_status="Test only",
                is_fire=False,
                latitude=latitude,
                longitude=longitude,
                distance_km=0.0,
                official_url=self.jurisdiction.official_url,
                instruction="This is only a notification-path test. No incident exists.",
                sources=("Australian Fire Watch test",),
            )
            event = LifecycleEvent(incident.id, "test", incident, None)
            payload = {
                "alert_kind": "incident",
                "entry_id": self.entry.entry_id,
                "location_name": str(self.config.get(CONF_NAME, DEFAULT_NAME)),
                "lifecycle": "test",
                "incident_id": incident.id,
                "incident": incident.as_dict(),
                "previous": {},
                "qualifies_for_alert": False,
                "notification_allowed": True,
                "delivery_priority": "normal",
                "direct_delivery_configured": bool(
                    _notify_services(self.config.get(CONF_NOTIFY_SERVICES, []))
                ),
                "summary": f"TEST — {normalized}",
                "recommended_action": "Verify delivery only; no incident exists.",
                "notification_tag": f"australian-fire-watch-test-{self.entry.entry_id}",
                "test": True,
                "official_url": self.jurisdiction.official_url,
            }
            self.hass.bus.async_fire(EVENT_ALERT, payload)
            await self._async_notify(event, test=True)
            await self._async_save_state()
            await self._async_flush_notifications()
            self._publish_local_data()


def _incident_feed(incidents: tuple[Incident, ...]) -> ParsedFeed:
    return ParsedFeed(incidents)


def _parse_regional_cap(body: bytes | str, *, source: str, official_url: str) -> Any:
    """Parse and bushfire-filter a jurisdiction CAP product."""
    return fire_incidents_only(
        parse_cap(body, source=source, official_url=official_url)
    )


def _danger_period_label(detail: Mapping[str, Any]) -> str:
    period = str(detail.get("period") or "").casefold()
    if period == "today":
        return "Today"
    if period == "tomorrow":
        return "Tomorrow"
    return str(detail.get("date") or "Fire danger")


def _danger_summary(event: DangerLifecycleEvent) -> str:
    detail = event.danger
    period = _danger_period_label(detail)
    district = str(detail.get("district") or "configured district")
    rating = str(detail.get("rating") or "Unknown")
    if event.lifecycle == "resolved":
        return f"Fire danger declaration changed — {district}"
    if detail.get("total_fire_ban") is True:
        return f"Total Fire Ban {period.casefold()} — {district} ({rating})"
    return f"{rating} fire danger {period.casefold()} — {district}"


def _danger_recommended_action(event: DangerLifecycleEvent) -> str:
    if event.lifecycle in {"deescalated", "resolved"}:
        return (
            "The previous declaration changed. Check the current NSW RFS "
            "rating and Total Fire Ban product; do not treat this as safe."
        )
    detail = event.danger
    if detail.get("total_fire_ban") is True:
        return "A Total Fire Ban is declared. Check and follow current NSW RFS restrictions."
    return {
        "High": "Be ready to act and review your bush-fire survival plan.",
        "Extreme": "Take action now to protect life and property; check official advice.",
        "Catastrophic": "Leave bush-fire risk areas; follow current official instructions.",
    }.get(str(detail.get("rating")), "Check the current official declaration.")


def _danger_notification_message(event: DangerLifecycleEvent) -> str:
    detail = event.danger
    if event.lifecycle in {"deescalated", "resolved"}:
        previous = event.previous or {}
        return (
            f"The previously published {previous.get('rating', 'fire danger')} "
            f"rating / Total Fire Ban for {previous.get('date', event.danger_id)} "
            "has changed. Check the current NSW RFS declaration; this does not "
            "confirm conditions are safe."
        )
    ban_text = (
        " A Total Fire Ban is declared." if detail.get("total_fire_ban") is True else ""
    )
    return (
        f"{event.lifecycle.replace('_', ' ').title()}: "
        f"{detail.get('rating', 'Unknown')} fire danger for "
        f"{detail.get('district', 'the configured district')} on "
        f"{detail.get('date', event.danger_id)}.{ban_text} "
        f"{_danger_recommended_action(event)}"
    )


def _apply_notification_priority(
    data: dict[str, Any], priority: str, kind: str
) -> None:
    if priority == "critical":
        data["push"] = {
            "sound": {"name": "default", "critical": 1, "volume": 1.0},
            "interruption-level": "critical",
        }
        data["channel"] = f"australian_fire_watch_{kind}_critical"
        data["ttl"] = 0
        data["priority"] = "high"
    elif priority == "time_sensitive":
        data["push"] = {"interruption-level": "time-sensitive"}
        data["channel"] = f"australian_fire_watch_{kind}_time_sensitive"
    else:
        data["channel"] = "australian_fire_watch_information"


def _unknown_danger() -> dict[str, Any]:
    day = {
        "date": None,
        "rating": "Unknown",
        "fbi": None,
        "total_fire_ban": None,
        "issued_at": None,
        "rating_source": None,
        "fbi_source": None,
    }
    return {
        "district": None,
        "today": dict(day),
        "tomorrow": dict(day),
        "forecast": [],
        "bom_issued_at": None,
        "rfs_issued_at": None,
    }


def _empty_feed() -> dict[str, Any]:
    return {
        "status": "unavailable",
        "last_successful_update": None,
        "data_generated_at": None,
        "age_seconds": None,
        "source_name": None,
        "official_url": OFFICIAL_INCIDENTS_URL,
        "sources": {},
    }


def _iso(value: Any) -> str | None:
    return value.isoformat() if isinstance(value, datetime) else None


def _as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        result = value
    elif isinstance(value, str):
        try:
            result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    return (
        result.replace(tzinfo=timezone.utc)
        if result.tzinfo is None
        else result.astimezone(timezone.utc)
    )


def _age_seconds(value: Any, now: datetime) -> int | None:
    parsed = _as_datetime(value)
    if parsed is None:
        return None
    return max(0, int((now - parsed).total_seconds()))


def _discard_expired(values: dict[str, str], now: datetime) -> None:
    for key, value in tuple(values.items()):
        expiry = _as_datetime(value)
        if expiry is None or expiry <= now:
            values.pop(key, None)


def _notify_services(value: Any) -> tuple[str, ...]:
    if isinstance(value, str):
        raw = value.replace("\n", ",").split(",")
    elif isinstance(value, (list, tuple, set)):
        raw = value
    else:
        raw = []
    return tuple(
        dict.fromkeys(
            text
            for item in raw
            if (text := str(item).strip())
            and text.startswith("notify.")
            and "." in text
        )
    )


def _recommended_action(status: str) -> str:
    return {
        "emergency_warning": "Take action immediately. Follow the official warning and emergency instructions.",
        "watch_and_act": "Start taking action now. Check the official incident update and your bush-fire plan.",
        "advice": "Stay up to date. Monitor official sources and be ready if conditions change.",
        "incident_nearby": "Check the incident in official sources and monitor for a warning-level change.",
        "planned_activity": "Planned activity is nearby. Monitor conditions and official updates if smoke affects you.",
        "no_current_warning": "No current warning in the configured alert radii. Stay prepared and keep official alerts enabled.",
        "stale": "Live updates are stale. Check your official emergency service or local radio now.",
        "unavailable": "Live updates are unavailable. Use your official emergency app, emergency service and local radio.",
    }.get(status, "Check official sources.")


def _summary_text(status: str, highest: Incident | None, feed: dict[str, Any]) -> str:
    if status == "unavailable":
        return "Live incident updates unavailable — check official sources"
    if status == "stale":
        return "Live incident updates stale — check official sources"
    if highest and status not in {"no_current_warning", "planned_activity"}:
        distance = (
            f" ({highest.distance_km:.1f} km)"
            if highest.distance_km is not None
            else ""
        )
        warning_label = (
            "No official warning level"
            if highest.warning_level == WarningLevel.NOT_APPLICABLE
            else str(highest.warning_level)
        )
        return f"{warning_label}: {highest.title}{distance}"
    if status == "planned_activity":
        return "No current warning; planned fire activity is nearby"
    return "No current warning in the configured alert radii"
