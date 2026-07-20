"""Data model for Sundial.

Plain, JSON-serialisable dataclasses with **no** Home Assistant references, so
they can be created and tested without a running HA instance.

Model shape (schemas contain lights, not the other way around):

    StoreData
      settings: GlobalSettings          # instance-wide
      active_schema_id: str             # the schema currently driving the lights
      schemas: {id: Schema}
        Schema
          sun: SunConfig                # the configurable "sun" (timeline top row)
          lights: {entity_id: LightConfig}
            LightConfig
              min/max brightness + color temp (per-light scaling)
              hours: 24 cells, each None (sun-based) or {brightness, color_temp}
"""

from __future__ import annotations

from dataclasses import dataclass, field, fields
from typing import Any

from .const import (
    DEFAULT_AUTORESET_CONTROL,
    DEFAULT_INITIAL_TRANSITION,
    DEFAULT_INTERVAL,
    DEFAULT_LIMIT_MODE,
    DEFAULT_MAX_BRIGHTNESS,
    DEFAULT_MAX_COLOR_TEMP,
    DEFAULT_MIN_BRIGHTNESS,
    DEFAULT_MIN_COLOR_TEMP,
    DEFAULT_RAMP_DARK,
    DEFAULT_RAMP_LIGHT,
    DEFAULT_RENDER_MODE,
    DEFAULT_SCHEMA_ID,
    DEFAULT_SEND_SPLIT_DELAY,
    DEFAULT_SUN_MIN_BRIGHTNESS,
    DEFAULT_SUNRISE_OFFSET,
    DEFAULT_SUNSET_OFFSET,
    DEFAULT_TRANSITION,
    HOURS_PER_DAY,
    LIMIT_MODES,
    RENDER_MODES,
)

# An hour cell is either None (fall back to the sun) or a mapping with explicit
# "brightness" (percent), "color_temp" (Kelvin), and an optional "rgb_color"
# ([r, g, b]) that overrides the colour temperature for RGB-capable lights.
HourCell = dict[str, Any] | None


def _coerce(cls: type, data: dict[str, Any]) -> dict[str, Any]:
    """Keep only keys that are valid fields of ``cls``."""
    valid = {f.name for f in fields(cls)}
    return {k: v for k, v in data.items() if k in valid}


def _order_range(lo: Any, hi: Any) -> tuple[Any, Any]:
    """Return (lo, hi) sorted, so a saved min > max can't invert a clamp."""
    return (hi, lo) if lo > hi else (lo, hi)


def _normalize_rgb(value: Any) -> list[int] | None:
    """Return a clamped [r, g, b] list, or None if not a valid triple."""
    if not isinstance(value, (list, tuple)) or len(value) != 3:
        return None
    try:
        return [max(0, min(255, int(c))) for c in value]
    except (ValueError, TypeError):
        return None


def _normalize_hours(hours: list[Any] | None) -> list[HourCell]:
    """Return a list of exactly 24 hour cells."""
    result: list[HourCell] = [None] * HOURS_PER_DAY
    for i, cell in enumerate(hours or []):
        if i >= HOURS_PER_DAY:
            break
        if isinstance(cell, dict) and "brightness" in cell and "color_temp" in cell:
            try:
                normalized: dict[str, Any] = {
                    "brightness": int(cell["brightness"]),
                    "color_temp": int(cell["color_temp"]),
                }
            except (TypeError, ValueError):
                continue  # corrupt cell -> fall back to the sun for that hour
            rgb = _normalize_rgb(cell.get("rgb_color"))
            if rgb is not None:
                normalized["rgb_color"] = rgb
            result[i] = normalized
    return result


@dataclass
class SunConfig:
    """The configurable sun: drives every light's fallback (the timeline top row)."""

    min_brightness: int = DEFAULT_SUN_MIN_BRIGHTNESS
    max_brightness: int = DEFAULT_MAX_BRIGHTNESS
    min_color_temp: int = DEFAULT_MIN_COLOR_TEMP
    max_color_temp: int = DEFAULT_MAX_COLOR_TEMP
    # Width of the tanh brightness ramp around sunrise/sunset (seconds).
    ramp_dark: int = DEFAULT_RAMP_DARK
    ramp_light: int = DEFAULT_RAMP_LIGHT
    sunrise_time: str | None = None  # fixed "HH:MM:SS" overrides astral
    sunset_time: str | None = None
    sunrise_offset: int = DEFAULT_SUNRISE_OFFSET  # seconds
    sunset_offset: int = DEFAULT_SUNSET_OFFSET
    min_sunrise_time: str | None = None
    max_sunrise_time: str | None = None
    min_sunset_time: str | None = None
    max_sunset_time: str | None = None

    def __post_init__(self) -> None:
        self.min_brightness, self.max_brightness = _order_range(
            self.min_brightness, self.max_brightness
        )
        self.min_color_temp, self.max_color_temp = _order_range(
            self.min_color_temp, self.max_color_temp
        )

    def to_dict(self) -> dict[str, Any]:
        return {f.name: getattr(self, f.name) for f in fields(self)}

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> SunConfig:
        return cls(**_coerce(cls, data or {}))


@dataclass
class LightConfig:
    """Per-light settings within a schema."""

    min_brightness: int = DEFAULT_MIN_BRIGHTNESS
    max_brightness: int = DEFAULT_MAX_BRIGHTNESS
    min_color_temp: int = DEFAULT_MIN_COLOR_TEMP
    max_color_temp: int = DEFAULT_MAX_COLOR_TEMP
    # Send brightness and color as separate light.turn_on calls (e.g. IKEA).
    separate_turn_on_commands: bool = False
    # How the per-light min/max apply on sun-following hours: "cap" (clamp the
    # sun's value into the range) or "scale" (map the sun's 0..1 onto the range).
    limit_mode: str = DEFAULT_LIMIT_MODE
    # How colour is sent when the light supports both temperature and RGB:
    # "auto" (native colour temperature) or "rgb" (render as RGB).
    render_mode: str = DEFAULT_RENDER_MODE
    # 24 cells; None = follow the sun for that hour.
    hours: list[HourCell] = field(
        default_factory=lambda: [None] * HOURS_PER_DAY
    )

    def __post_init__(self) -> None:
        self.hours = _normalize_hours(self.hours)
        if self.limit_mode not in LIMIT_MODES:
            self.limit_mode = DEFAULT_LIMIT_MODE
        if self.render_mode not in RENDER_MODES:
            self.render_mode = DEFAULT_RENDER_MODE
        self.min_brightness, self.max_brightness = _order_range(
            self.min_brightness, self.max_brightness
        )
        self.min_color_temp, self.max_color_temp = _order_range(
            self.min_color_temp, self.max_color_temp
        )

    def to_dict(self) -> dict[str, Any]:
        return {f.name: getattr(self, f.name) for f in fields(self)}

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> LightConfig:
        return cls(**_coerce(cls, data or {}))


@dataclass
class Schema:
    """A complete, named configuration covering all controlled lights."""

    id: str
    name: str
    sun: SunConfig = field(default_factory=SunConfig)
    lights: dict[str, LightConfig] = field(default_factory=dict)

    def light_config(self, entity_id: str) -> LightConfig:
        """Return the config for ``entity_id`` (a default if not customised)."""
        return self.lights.get(entity_id) or LightConfig()

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "sun": self.sun.to_dict(),
            "lights": {eid: cfg.to_dict() for eid, cfg in self.lights.items()},
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Schema:
        return cls(
            id=data["id"],
            name=data.get("name", data["id"]),
            sun=SunConfig.from_dict(data.get("sun")),
            lights={
                eid: LightConfig.from_dict(cfg)
                for eid, cfg in (data.get("lights") or {}).items()
            },
        )


@dataclass
class GlobalSettings:
    """Instance-wide settings (apply to every controlled light)."""

    interval: int = DEFAULT_INTERVAL
    transition: int = DEFAULT_TRANSITION
    initial_transition: int = DEFAULT_INITIAL_TRANSITION
    send_split_delay: int = DEFAULT_SEND_SPLIT_DELAY
    autoreset_control: int = DEFAULT_AUTORESET_CONTROL
    take_over_control: bool = True
    # Optional override for sun calculation; both None = use Home Assistant's
    # configured location.
    sun_latitude: float | None = None
    sun_longitude: float | None = None

    def to_dict(self) -> dict[str, Any]:
        return {f.name: getattr(self, f.name) for f in fields(self)}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> GlobalSettings:
        merged = _coerce(cls, data)
        for key in ("sun_latitude", "sun_longitude"):
            if key in merged and merged[key] is not None:
                try:
                    merged[key] = float(merged[key])
                except (TypeError, ValueError):
                    merged[key] = None
        return cls(**merged)


@dataclass
class StoreData:
    """The full persisted document (one per integration instance)."""

    settings: GlobalSettings = field(default_factory=GlobalSettings)
    schemas: dict[str, Schema] = field(default_factory=dict)
    active_schema_id: str = DEFAULT_SCHEMA_ID

    def __post_init__(self) -> None:
        # Guarantee a default schema always exists and is a valid active target.
        if DEFAULT_SCHEMA_ID not in self.schemas:
            self.schemas[DEFAULT_SCHEMA_ID] = Schema(
                id=DEFAULT_SCHEMA_ID, name="Default"
            )
        if self.active_schema_id not in self.schemas:
            self.active_schema_id = DEFAULT_SCHEMA_ID

    @property
    def active_schema(self) -> Schema:
        return self.schemas.get(self.active_schema_id) or self.schemas[
            DEFAULT_SCHEMA_ID
        ]

    def to_dict(self) -> dict[str, Any]:
        return {
            "settings": self.settings.to_dict(),
            "schemas": {sid: s.to_dict() for sid, s in self.schemas.items()},
            "active_schema_id": self.active_schema_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> StoreData:
        data = data or {}
        return cls(
            settings=GlobalSettings.from_dict(data.get("settings", {})),
            schemas={
                sid: Schema.from_dict(sd)
                for sid, sd in (data.get("schemas") or {}).items()
            },
            active_schema_id=data.get("active_schema_id", DEFAULT_SCHEMA_ID),
        )
