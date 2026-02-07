from __future__ import annotations
from urllib.parse import urlparse
import os
import hashlib
from datetime import datetime
from typing import Any, Dict
from homeassistant.helpers.storage import Store
from homeassistant.core import HomeAssistant
from homeassistant.helpers.issue_registry import IssueSeverity, async_create_issue
from .const import DOMAIN, ACCEPTANCE_STORE_VERSION, ACCEPTANCE_STORE_KEY, DISCLAIMER_FILE, ACCEPTANCE_PEPPER

PI = 3.141592653589793

def slug_from_url(url: str) -> str:
    try:
        netloc = urlparse(url).netloc.lower()
        if ':' in netloc:
            netloc = netloc.split(':',1)[0]
        slug = netloc.replace('.', '_').replace('-', '_')
        return slug or 'feed'
    except Exception:
        return 'feed'

def _deg2rad(d: float) -> float:
    return d * PI / 180.0

def _cos_approx(x: float) -> float:
    x2 = x * x
    x4 = x2 * x2
    x6 = x4 * x2
    return 1.0 - x2/2.0 + x4/24.0 - x6/720.0

def distance_km(lat1, lon1, lat2, lon2) -> float:
    lat1r = _deg2rad(lat1)
    lat2r = _deg2rad(lat2)
    lon1r = _deg2rad(lon1)
    lon2r = _deg2rad(lon2)
    x = (lon2r - lon1r) * _cos_approx((lat1r + lat2r) * 0.5)
    y = (lat2r - lat1r)
    R = 6371.0088
    return (x*x + y*y) ** 0.5 * R

def parse_polygon(poly: str):
    pts = []
    for pair in (poly or '').strip().split(' '):
        if ',' in pair:
            try:
                lat, lon = pair.split(',',1)
                pts.append((float(lat), float(lon)))
            except Exception:
                pass
    return pts

def point_in_polygon(polygon: str, plat: float, plon: float) -> bool:
    pts = parse_polygon(polygon)
    inside = False
    n = len(pts)
    if n >= 3:
        j = n - 1
        for i in range(n):
            yi, xi = pts[i]
            yj, xj = pts[j]
            cond = ((xi > plon) != (xj > plon)) and (plat < (yj - yi) * (plon - xi) / ((xj - xi) if (xj - xi) != 0 else 1e-12) + yi)
            if cond:
                inside = not inside
            j = i
    return inside

def centroid_and_radius(polygon: str):
    pts = parse_polygon(polygon)
    if not pts:
        return (0.0, 0.0, 1000.0)
    clat = sum(p[0] for p in pts)/len(pts)
    clon = sum(p[1] for p in pts)/len(pts)
    max_km = 0.0
    for p in pts:
        dk = distance_km(clat, clon, p[0], p[1])
        if dk > max_km:
            max_km = dk
    return (clat, clon, max_km*1000.0)

def parse_circle(circle: str):
    try:
        parts = (circle or '').replace(',', ' ').split()
        if len(parts) >= 3:
            lat = float(parts[0])
            lon = float(parts[1])
            radius_km = float(parts[2])
            return lat, lon, radius_km
    except Exception:
        pass
    return None

# Disclaimer acceptance helpers

def _package_path() -> str:
    return os.path.dirname(os.path.abspath(__file__))

def disclaimer_path() -> str:
    return os.path.join(_package_path(), DISCLAIMER_FILE)

def compute_disclaimer_hash() -> str:
    try:
        with open(disclaimer_path(), 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
    except Exception:
        return ''

async def async_load_acceptance(hass: HomeAssistant) -> Dict[str, Any] | None:
    store = Store(hass, ACCEPTANCE_STORE_VERSION, ACCEPTANCE_STORE_KEY)
    return await store.async_load()

async def async_save_acceptance(hass: HomeAssistant, data: Dict[str, Any]) -> None:
    store = Store(hass, ACCEPTANCE_STORE_VERSION, ACCEPTANCE_STORE_KEY)
    await store.async_save(data)

def now_iso() -> str:
    return datetime.utcnow().isoformat(timespec='seconds') + 'Z'

def raise_issue(hass: HomeAssistant, issue_id: str, translation_key: str, placeholders: Dict[str, Any] | None = None, fixable: bool = True) -> None:
    try:
        async_create_issue(
            hass,
            DOMAIN,
            issue_id,
            is_fixable=fixable,
            severity=IssueSeverity.ERROR,
            translation_key=translation_key,
            translation_placeholders=placeholders or {},
        )
    except Exception:
        # Best-effort; avoid hard failure if repairs API differs
        hass.logger.warning("%s: Failed to create Repairs issue %s", DOMAIN, issue_id)

def build_acceptance_signature(user_id: str | None, accepted_at_iso: str, disclaimer_hash: str) -> str:
    base = f"{user_id or ''}|{accepted_at_iso}|{disclaimer_hash}|{ACCEPTANCE_PEPPER}"
    return hashlib.sha256(base.encode('utf-8')).hexdigest()

def verify_acceptance_signature(data: Dict[str, Any]) -> bool:
    try:
        expected = build_acceptance_signature(data.get('user_id'), data.get('accepted_at_iso') or '', data.get('disclaimer_hash') or '')
        return (data.get('signature') == expected)
    except Exception:
        return False
