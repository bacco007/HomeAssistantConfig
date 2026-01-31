"""Trackmania Events (COTD, Weekly Shorts, Bonk Cup)
Version 1.2 – reads options via get_plugin_options() (no get_config() calls).
"""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Dict, Any, List

try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except ImportError:
    try:
        import pytz
        ZoneInfo = None
    except ImportError:
        ZoneInfo = None
        pytz = None

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

UPDATE_INTERVAL = 60  # seconds

CALENDAR_INFO = {
    "id": "trackmania",
    "version": "1.2.0",
    "icon": "mdi:flag-checkered",
    "category": "gaming",
    "accuracy": "official/community",
    "update_interval": UPDATE_INTERVAL,

    # Multi-language names
    "name": {
        "en": "Trackmania Events",
        "de": "Trackmania Events",
        "es": "Eventos de Trackmania",
        "fr": "Événements Trackmania",
        "it": "Eventi di Trackmania",
        "nl": "Trackmania-evenementen",
        "pt": "Eventos de Trackmania",
        "ru": "События Trackmania",
        "ja": "トラックマニアのイベント",
        "zh": "Trackmania 活动",
        "ko": "트랙매니아 이벤트"
    },

    # Short descriptions for UI
    "description": {
        "en": "Shows next start times for Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (Sun 18:00), and Bonk Cup (Thu 20:00).",
        "de": "Zeigt die nächsten Startzeiten für Cup of the Day (03:00 / 11:00 / 19:00 ME(S)Z), Weekly Shorts (So 18:00) und Bonk Cup (Do 20:00).",
        "es": "Muestra los próximos inicios de Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (dom 18:00) y Bonk Cup (jue 20:00).",
        "fr": "Affiche les prochains horaires de Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (dim 18:00) et Bonk Cup (jeu 20:00).",
        "it": "Mostra i prossimi orari per Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (dom 18:00) e Bonk Cup (gio 20:00).",
        "nl": "Toont de volgende tijden voor Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (zo 18:00) en Bonk Cup (do 20:00).",
        "pt": "Mostra os próximos horários de Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (dom 18:00) e Bonk Cup (qui 20:00).",
        "ru": "Показывает ближайшие старты Cup of the Day (03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts (вс 18:00) и Bonk Cup (чт 20:00).",
        "ja": "Cup of the Day（03:00 / 11:00 / 19:00 CE(S)T）、Weekly Shorts（日曜18:00）、Bonk Cup（木曜20:00）の次回開始時刻を表示します。",
        "zh": "显示 Cup of the Day（每天 03:00 / 11:00 / 19:00 CE(S)T）、Weekly Shorts（周日 18:00）和 Bonk Cup（周四 20:00）下一次开始时间。",
        "ko": "Cup of the Day(매일 03:00 / 11:00 / 19:00 CE(S)T), Weekly Shorts(일 18:00), Bonk Cup(목 20:00)의 다음 시작 시간을 표시합니다."
    },

    # Sources (for reference only in attributes)
    "sources": {
        "cotd_doc": "https://doc.trackmania.com/play/how-to-play-cotd/",
        "weekly_shorts_guidelines": "https://doc.trackmania.com/create/map-review/weekly-shorts-guidelines/"
    },

    # Configuration options with multi-language descriptions
    "config_options": {
        "timezone": {
            "type": "text",
            "default": "Europe/Berlin",
            "description": {
                "en": "IANA timezone to compute local event times",
                "de": "IANA-Zeitzone zur Berechnung lokaler Zeiten"
            }
        },
        "enable_cotd": {
            "type": "boolean",
            "default": True,
            "description": {"en": "Enable Cup of the Day", "de": "Cup of the Day aktivieren"}
        },
        "enable_weekly_shorts": {
            "type": "boolean",
            "default": True,
            "description": {"en": "Enable Weekly Shorts (release)", "de": "Weekly Shorts (Release) aktivieren"}
        },
        "enable_bonk_cup": {
            "type": "boolean",
            "default": True,
            "description": {"en": "Enable Bonk Cup", "de": "Bonk Cup aktivieren"}
        },
        "horizon_days": {
            "type": "number",
            "default": 14,
            "description": {"en": "How many days ahead to list events", "de": "Vorschau in Tagen"}
        }
    }
}


class TrackmaniaEventsSensor(AlternativeTimeSensorBase):
    """Sensor that lists upcoming Trackmania event times."""

    UPDATE_INTERVAL = UPDATE_INTERVAL  # class-level for HA throttling

    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        super().__init__(base_name, hass)

        calendar_name = self._translate('name', 'Trackmania Events')

        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_trackmania_events"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:flag-checkered")

        # Defaults; will be overridden from plugin options in update()
        self._tz_name = "Europe/Berlin"
        self._enable_cotd = True
        self._enable_weekly_shorts = True
        self._enable_bonk = True
        self._horizon_days = 14

        # Cached attributes
        self._tm_events: Dict[str, Any] = {}
        self._state = "Initializing..."

    # -------------------- HA properties --------------------
    @property
    def state(self):
        return self._state

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        attrs = super().extra_state_attributes
        if self._tm_events:
            attrs.update(self._tm_events)
            attrs["description"] = self._translate('description')
            attrs["reference"] = CALENDAR_INFO.get("sources", {})
        return attrs

    # -------------------- Helpers --------------------
    def _tz(self):
        """Get timezone object with fallback handling."""
        if ZoneInfo is not None:
            try:
                return ZoneInfo(self._tz_name)
            except Exception:
                _LOGGER.warning("Invalid tz %s, falling back to Europe/Berlin", self._tz_name)
                try:
                    return ZoneInfo("Europe/Berlin")
                except Exception:
                    return None
        
        # Fallback to pytz if available
        if 'pytz' in globals() and pytz is not None:
            try:
                return pytz.timezone(self._tz_name)
            except Exception:
                try:
                    return pytz.timezone("Europe/Berlin")
                except Exception:
                    pass
        
        return None

    def _make_event(self, when: datetime, title: str, tag: str) -> Dict[str, Any]:
        """Create an event dictionary with timing information."""
        now = datetime.now(when.tzinfo)
        delta = when - now
        seconds = int(delta.total_seconds())
        sign = "" if seconds >= 0 else "-"
        seconds = abs(seconds)
        dh, rem = divmod(seconds, 3600)
        dm, ds = divmod(rem, 60)
        in_h = f"{sign}{dh:02d}:{dm:02d}:{ds:02d}"
        return {
            "title": title,
            "tag": tag,
            "when_local": when.strftime("%Y-%m-%d %H:%M:%S %Z"),
            "when_iso": when.isoformat(),
            "in": in_h
        }

    def _iter_days(self, start: datetime, days: int):
        """Iterate over days from start date."""
        for i in range(days + 1):
            yield (start + timedelta(days=i)).date()

    def _generate_upcoming(self, now: datetime) -> List[Dict[str, Any]]:
        """Generate list of upcoming events."""
        tz = now.tzinfo
        events: List[Dict[str, Any]] = []

        for d in self._iter_days(now, self._horizon_days):
            # Daily COTD times (03:00, 11:00, 19:00 local)
            if self._enable_cotd:
                for hh in (3, 11, 19):
                    when = datetime(d.year, d.month, d.day, hh, 0, 0, tzinfo=tz)
                    if when >= now - timedelta(hours=1):  # include last hour for context
                        events.append(self._make_event(when, "Cup of the Day", "cotd"))

            # Weekly Shorts: Sundays 18:00 local
            if self._enable_weekly_shorts:
                if d.weekday() == 6:  # Sunday
                    when = datetime(d.year, d.month, d.day, 18, 0, 0, tzinfo=tz)
                    if when >= now - timedelta(hours=1):
                        events.append(self._make_event(when, "Weekly Shorts (release)", "weekly_shorts"))

            # Bonk Cup: Thursdays 20:00 local
            if self._enable_bonk:
                if d.weekday() == 3:  # Thursday
                    when = datetime(d.year, d.month, d.day, 20, 0, 0, tzinfo=tz)
                    if when >= now - timedelta(hours=1):
                        events.append(self._make_event(when, "Bonk Cup", "bonk_cup"))

        events.sort(key=lambda e: e["when_iso"])
        return events

    # -------------------- Calculation & update --------------------
    def update(self) -> None:
        """Synchronous update for Home Assistant."""
        try:
            # Pull options from config_entry via AlternativeTimeSensorBase helper
            opts = self.get_plugin_options()

            self._tz_name = opts.get("timezone", "Europe/Berlin")
            self._enable_cotd = bool(opts.get("enable_cotd", True))
            self._enable_weekly_shorts = bool(opts.get("enable_weekly_shorts", True))
            self._enable_bonk = bool(opts.get("enable_bonk_cup", True))
            
            try:
                self._horizon_days = int(opts.get("horizon_days", 14))
                self._horizon_days = max(1, min(365, self._horizon_days))  # Clamp between 1-365
            except (ValueError, TypeError):
                self._horizon_days = 14

            tz = self._tz()
            if tz is None:
                self._state = "Timezone error"
                self._tm_events = {"error": "Could not initialize timezone"}
                return
                
            now = datetime.now(tz)
            upcoming = self._generate_upcoming(now)

            if upcoming:
                # Find next future event
                next_ev = None
                for e in upcoming:
                    if e["when_iso"] >= now.isoformat():
                        next_ev = e
                        break
                
                if next_ev is None and upcoming:
                    next_ev = upcoming[0]  # Fallback to first event
                
                self._tm_events = {
                    "timezone": self._tz_name,
                    "now_local": now.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    "next_event": next_ev,
                    "upcoming_events": upcoming[:20]  # Limit to 20 events
                }
                # Shorter state for better dashboard view
                self._state = f"{next_ev['title']} in {next_ev['in']}"
            else:
                self._tm_events = {
                    "timezone": self._tz_name,
                    "now_local": now.strftime("%Y-%m-%d %H:%M:%S %Z"),
                    "message": "No events scheduled"
                }
                self._state = "No events"
                
        except Exception as exc:
            _LOGGER.exception("Failed to update Trackmania events: %s", exc)
            self._state = "Error"
            self._tm_events = {"error": str(exc)}