"""PVGIS horizon fetch + horizon-profile interpolation."""

from __future__ import annotations

import json
import logging
from bisect import bisect_left
from dataclasses import dataclass
from pathlib import Path

from aiohttp import ClientSession, ClientTimeout

from .const import COORD_PRECISION, PVGIS_TIMEOUT, PVGIS_URL

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class HorizonProfile:
    """Local horizon as (compass_azimuth_deg, elevation_deg) pairs, sorted by az.

    The list is appended with a wrap-around sentinel at +360° so that linear
    interpolation across the 360→0 seam is a non-special-case.
    """

    points: tuple[tuple[float, float], ...]

    @classmethod
    def from_pvgis_json(cls, pvgis: dict) -> "HorizonProfile":
        # PVGIS azimuth: S=0, E=-90, W=+90, N=±180. Compass = (A + 180) mod 360.
        raw = pvgis["outputs"]["horizon_profile"]
        pts: dict[float, float] = {}
        for entry in raw:
            compass = (entry["A"] + 180.0) % 360.0
            if compass in pts:
                pts[compass] = (pts[compass] + entry["H_hor"]) / 2.0
            else:
                pts[compass] = entry["H_hor"]
        ordered = sorted(pts.items())
        ordered.append((ordered[0][0] + 360.0, ordered[0][1]))
        return cls(points=tuple(ordered))

    def elevation_at(self, compass_az_deg: float) -> float:
        """Linear interpolation of horizon elevation at the given azimuth."""
        az = compass_az_deg % 360.0
        xs = [p[0] for p in self.points]
        i = bisect_left(xs, az)
        if i == 0:
            return self.points[0][1]
        if i >= len(self.points):
            return self.points[-1][1]
        x0, y0 = self.points[i - 1]
        x1, y1 = self.points[i]
        t = (az - x0) / (x1 - x0)
        return y0 + t * (y1 - y0)

    def to_list(self) -> list[dict[str, float]]:
        """Serialise as `[{az, elev}, ...]` without the wrap sentinel — for entity attributes."""
        return [{"az": a, "elev": h} for a, h in self.points[:-1]]


def cache_path(config_dir: Path, lat: float, lon: float) -> Path:
    """Per-location cache file."""
    return (
        config_dir
        / "real_horizon"
        / f"pvgis_{lat:.{COORD_PRECISION}f}_{lon:.{COORD_PRECISION}f}.json"
    )


async def fetch_pvgis(
    session: ClientSession,
    lat: float,
    lon: float,
    cache_file: Path,
    force: bool = False,
) -> dict:
    """Return PVGIS horizon JSON, from disk cache if present unless `force`."""
    if cache_file.exists() and not force:
        try:
            return json.loads(cache_file.read_text())
        except (OSError, ValueError) as err:
            _LOGGER.warning("Bad PVGIS cache %s (%s); refetching", cache_file, err)

    _LOGGER.info("Fetching PVGIS horizon for %s, %s", lat, lon)
    async with session.get(
        PVGIS_URL,
        params={"lat": lat, "lon": lon, "outputformat": "json"},
        timeout=ClientTimeout(total=PVGIS_TIMEOUT),
    ) as resp:
        resp.raise_for_status()
        payload = await resp.json()

    cache_file.parent.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(payload))
    return payload
