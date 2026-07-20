"""Pure lighting math for Sundial.

No Home Assistant imports, so everything here is unit-testable on its own.

The model: a schema has one configurable **sun** plus a per-light **24-hour
timeline**. For each light we build 24 hourly "anchors" — an anchor is either
the light's explicit cell for that hour, or (if the cell is empty) the sun's
value scaled into the light's own min/max range. The live value at any moment
is a cyclic interpolation across those anchors. The same machinery produces the
sun's own row for the UI.

    input source  ->  DriveSignal (normalized 0..1)  ->  values (bri, temp)
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import math

from .const import (
    BRIGHTNESS_CHANGE,
    COLOR_TEMP_CHANGE,
    HOURS_PER_DAY,
    RGB_REDMEAN_CHANGE,
)
from .models import LightConfig, SunConfig

# --- small numeric helpers ---------------------------------------------------


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _round5(value: float) -> int:
    """Round Kelvin to the nearest 5 for stable, comparable values."""
    return int(round(value / 5.0) * 5)


# The tanh curve-fitting helpers below (find_a_b, scaled_tanh) and
# color_difference_redmean further down are derived from Adaptive Lighting
# (https://github.com/basnijholt/adaptive-lighting), copyright Bas Nijholt and
# contributors, licensed under the Apache License 2.0 — see
# THIRD_PARTY_LICENSES at the repository root. Both have been modified.
def find_a_b(x1: float, x2: float, y1: float, y2: float) -> tuple[float, float]:
    """Solve a/b so ``0.5*(1+tanh(a*x+b))`` passes through the two points."""
    ya = math.atanh(2.0 * y1 - 1.0)
    yb = math.atanh(2.0 * y2 - 1.0)
    a = (yb - ya) / (x2 - x1)
    b = ya - a * x1
    return a, b


def scaled_tanh(
    x: float, x1: float, x2: float, y1: float = 0.05, y2: float = 0.95
) -> float:
    """A smooth S-curve mapping ``x`` to ``0..1``."""
    a, b = find_a_b(x1, x2, y1, y2)
    return 0.5 * (1.0 + math.tanh(a * x + b))


def color_difference_redmean(
    rgb1: tuple[int, int, int], rgb2: tuple[int, int, int]
) -> float:
    """Perceptual ("redmean") distance between two RGB colors."""
    r_hat = (rgb1[0] + rgb2[0]) / 2.0
    delta_r, delta_g, delta_b = (
        rgb1[0] - rgb2[0],
        rgb1[1] - rgb2[1],
        rgb1[2] - rgb2[2],
    )
    red = (2.0 + r_hat / 256.0) * delta_r**2
    green = 4.0 * delta_g**2
    blue = (2.0 + (255.0 - r_hat) / 256.0) * delta_b**2
    return math.sqrt(red + green + blue)


def kelvin_to_rgb(kelvin: float) -> tuple[int, int, int]:
    """Approximate a colour temperature as RGB (Tanner Helland's algorithm).

    Used so RGB-only lights (no colour-temp channel) can still follow the sun's
    warm/cool curve; matches the panel's swatch colours.
    """
    temp = clamp(kelvin, 1000, 12000) / 100.0
    if temp <= 66:
        red = 255.0
        green = 99.4708025861 * math.log(temp) - 161.1195681661
    else:
        red = 329.698727446 * (temp - 60) ** -0.1332047592
        green = 288.1221695283 * (temp - 60) ** -0.0755148492
    if temp >= 66:
        blue = 255.0
    elif temp <= 19:
        blue = 0.0
    else:
        blue = 138.5177312231 * math.log(temp - 10) - 305.0447927307

    def _byte(value: float) -> int:
        return int(max(0, min(255, round(value))))

    return _byte(red), _byte(green), _byte(blue)


# --- the sun -----------------------------------------------------------------


@dataclass
class SunSnapshot:
    """A point-in-time view of the sun, computed by the coordinator."""

    position: float  # -1 (solar midnight) .. 1 (solar noon)
    is_day: bool
    nearest_sunrise: datetime
    nearest_sunset: datetime


@dataclass
class DriveSignal:
    """Normalized signal: brightness demand and warmth, each 0..1."""

    brightness: float
    warmth: float  # 0 = warmest (min temp), 1 = coolest (max temp)


@dataclass
class Target:
    """Concrete values to send to a light. ``None`` means "don't set".

    ``color_temp_kelvin`` is always the baseline; ``rgb_color`` (when set)
    overrides it for RGB-capable lights.
    """

    brightness_pct: int | None
    color_temp_kelvin: int | None
    rgb_color: tuple[int, int, int] | None = None


def sun_snapshot(now: datetime, events: list[tuple[datetime, str]]) -> SunSnapshot:
    """Build a :class:`SunSnapshot` from sorted sun events bracketing ``now``."""
    prev = None
    nxt = None
    for event in events:
        if event[0] <= now:
            prev = event
        elif nxt is None:
            nxt = event
            break

    sunrises = [t for t, kind in events if kind == "sunrise"]
    sunsets = [t for t, kind in events if kind == "sunset"]
    nearest_sunrise = min(
        sunrises, key=lambda t: abs((t - now).total_seconds()), default=now
    )
    nearest_sunset = min(
        sunsets, key=lambda t: abs((t - now).total_seconds()), default=now
    )

    if prev is None or nxt is None:
        return SunSnapshot(0.0, True, nearest_sunrise, nearest_sunset)

    span = (nxt[0] - prev[0]).total_seconds() or 1.0
    frac = clamp((now - prev[0]).total_seconds() / span, 0.0, 1.0)
    is_day = prev[1] == "sunrise"
    position = math.sin(math.pi * frac)
    if not is_day:
        position = -position
    return SunSnapshot(position, is_day, nearest_sunrise, nearest_sunset)


def _ramp(now: datetime, start: datetime, end: datetime, rising: bool) -> float:
    """A smooth tanh 0..1 transition across the ``[start, end]`` window."""
    total = (end - start).total_seconds() or 1.0
    frac = clamp((now - start).total_seconds() / total, 0.0, 1.0)
    value = scaled_tanh(frac, 0.0, 1.0)
    return value if rising else (1.0 - value)


def _day_factor(now: datetime, snap: SunSnapshot, sun: SunConfig) -> float:
    """Brightness demand (0..1): a tanh ramp around sunrise/sunset."""
    from datetime import timedelta

    dark = timedelta(seconds=sun.ramp_dark)
    light = timedelta(seconds=sun.ramp_light)
    sr_start, sr_end = snap.nearest_sunrise - dark, snap.nearest_sunrise + light
    ss_start, ss_end = snap.nearest_sunset - light, snap.nearest_sunset + dark

    if sr_start <= now <= sr_end:
        return _ramp(now, sr_start, sr_end, rising=True)
    if ss_start <= now <= ss_end:
        return _ramp(now, ss_start, ss_end, rising=False)
    return 1.0 if snap.is_day else 0.0


def sun_drive(now: datetime, snap: SunSnapshot, sun: SunConfig) -> DriveSignal:
    """Convert the sun snapshot into a normalized :class:`DriveSignal`."""
    brightness = _day_factor(now, snap, sun)
    warmth = clamp(snap.position, 0.0, 1.0)
    return DriveSignal(brightness=brightness, warmth=warmth)


# --- mapping drive -> concrete values ----------------------------------------


def drive_to_values(
    drive: DriveSignal,
    min_b: float,
    max_b: float,
    min_ct: float,
    max_ct: float,
) -> tuple[float, float]:
    """Scale a normalized drive signal into (brightness%, colorTempK) floats."""
    brightness = lerp(min_b, max_b, clamp(drive.brightness, 0.0, 1.0))
    color_temp = lerp(min_ct, max_ct, clamp(drive.warmth, 0.0, 1.0))
    return brightness, color_temp


# --- the 24-hour timeline ----------------------------------------------------


def sun_values(
    sun: SunConfig, drives: list[DriveSignal]
) -> list[tuple[float, float]]:
    """The sun's (brightness, colorTemp) for each hour, as floats."""
    return [
        drive_to_values(
            drive,
            sun.min_brightness,
            sun.max_brightness,
            sun.min_color_temp,
            sun.max_color_temp,
        )
        for drive in drives
    ]


def sun_row(sun_vals: list[tuple[float, float]]) -> list[tuple[int, int]]:
    """The sun's own (brightness, colorTemp) for each of the 24 hours."""
    return [(int(round(bri)), _round5(temp)) for bri, temp in sun_vals]


RgbColor = tuple[int, int, int]
# (brightness, colorTemp, rgb|None) for one hour.
Anchor = tuple[float, float, RgbColor | None]


def light_anchors(
    light: LightConfig,
    sun_vals: list[tuple[float, float]],
    drives: list[DriveSignal],
) -> list[Anchor]:
    """Build 24 effective (brightness, colorTemp, rgb) anchors for a light.

    Explicit hour cells win (and may carry an ``rgb_color`` override). Empty
    cells *follow the sun*; how the light's own min/max apply depends on
    ``light.limit_mode``:

    - ``"cap"`` (default): clamp the sun's value (in the sun's range) into the
      light's range, so the light tracks the sun but can't run past its limits.
    - ``"scale"``: map the sun's normalized 0..1 signal onto the light's range,
      so the light sweeps its whole range across the day regardless of the sun's
      own min/max.
    """
    anchors: list[Anchor] = []
    for hour in range(HOURS_PER_DAY):
        cell = light.hours[hour] if hour < len(light.hours) else None
        if cell:
            # An explicit 0 means "off" for that hour; keep it rather than
            # clamping up to the light's minimum.
            raw_bri = cell["brightness"]
            bri = (
                0.0
                if raw_bri <= 0
                else clamp(raw_bri, light.min_brightness, light.max_brightness)
            )
            temp = clamp(cell["color_temp"], light.min_color_temp, light.max_color_temp)
            raw = cell.get("rgb_color")
            rgb: RgbColor | None = (
                (int(raw[0]), int(raw[1]), int(raw[2])) if raw else None
            )
        elif light.limit_mode == "scale":
            bri, temp = drive_to_values(
                drives[hour],
                light.min_brightness,
                light.max_brightness,
                light.min_color_temp,
                light.max_color_temp,
            )
            rgb = None
        else:  # "cap"
            bri = clamp(
                sun_vals[hour][0], light.min_brightness, light.max_brightness
            )
            temp = clamp(
                sun_vals[hour][1], light.min_color_temp, light.max_color_temp
            )
            rgb = None
        anchors.append((bri, temp, rgb))
    return anchors


def _interp_rgb(
    rgb0: RgbColor | None, rgb1: RgbColor | None, frac: float
) -> RgbColor | None:
    """Lerp two RGB anchors; for a mixed pair snap to the nearer anchor."""
    if rgb0 is not None and rgb1 is not None:
        return (
            int(round(lerp(rgb0[0], rgb1[0], frac))),
            int(round(lerp(rgb0[1], rgb1[1], frac))),
            int(round(lerp(rgb0[2], rgb1[2], frac))),
        )
    if rgb0 is None and rgb1 is None:
        return None
    return rgb0 if frac < 0.5 else rgb1


def interpolate_cyclic(
    anchors: list[Anchor], hour: float
) -> tuple[float, float, RgbColor | None]:
    """Interpolate (brightness, colorTemp, rgb) at fractional ``hour`` over 24h."""
    hour = hour % HOURS_PER_DAY
    h0 = int(math.floor(hour)) % HOURS_PER_DAY
    h1 = (h0 + 1) % HOURS_PER_DAY
    frac = hour - math.floor(hour)
    bri = lerp(anchors[h0][0], anchors[h1][0], frac)
    temp = lerp(anchors[h0][1], anchors[h1][1], frac)
    rgb = _interp_rgb(anchors[h0][2], anchors[h1][2], frac)
    return bri, temp, rgb


def light_target(
    light: LightConfig, sun: SunConfig, drives: list[DriveSignal], hour: float
) -> Target:
    """The concrete :class:`Target` for a light at fractional ``hour``."""
    anchors = light_anchors(light, sun_values(sun, drives), drives)
    bri, temp, rgb = interpolate_cyclic(anchors, hour)
    return Target(
        brightness_pct=int(round(bri)),
        color_temp_kelvin=_round5(temp),
        rgb_color=rgb,
    )


def target_changed(
    target: Target | None,
    brightness_255: int | None,
    color_temp_kelvin: int | None,
) -> bool:
    """Whether a *present* actual value diverges from ``target`` beyond the
    manual-control thresholds.

    Returns ``False`` when there is no baseline target or the actual value is
    absent, so settled/transition state updates aren't misread as manual
    control.
    """
    if target is None:
        return False
    if (
        target.brightness_pct is not None
        and brightness_255 is not None
        and abs(brightness_255 - round(target.brightness_pct / 100 * 255))
        > BRIGHTNESS_CHANGE
    ):
        return True
    return bool(
        target.color_temp_kelvin is not None
        and color_temp_kelvin is not None
        and abs(color_temp_kelvin - target.color_temp_kelvin) > COLOR_TEMP_CHANGE
    )


def color_is_manual(
    target: Target | None, rgb_color: tuple[int, int, int]
) -> bool:
    """Whether a light reporting ``rgb_color`` (in a colour mode, no colour temp)
    has a colour that meaningfully differs from the one we last applied.

    Many RGB-capable lights express a colour *temperature* internally as an RGB
    or hs colour, so a bare "reports rgb" is not by itself a manual change. We
    compare the reported colour against what we applied — the explicit rgb we
    set, or the rgb equivalent of the colour temperature — and only call it
    manual when it diverges beyond the perceptual threshold.
    """
    if target is None:
        return False
    if target.rgb_color is not None:
        expected = target.rgb_color
    elif target.color_temp_kelvin is not None:
        expected = kelvin_to_rgb(target.color_temp_kelvin)
    else:
        return False
    reported = (int(rgb_color[0]), int(rgb_color[1]), int(rgb_color[2]))
    return color_difference_redmean(reported, expected) > RGB_REDMEAN_CHANGE
