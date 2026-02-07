from __future__ import annotations
import logging
from typing import List, Dict, Any
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from .const import DOMAIN, EVENT_PIP_RESULT, EVENT_MATCHES, ISSUE_DISCLAIMER_REQUIRED
from .util import point_in_polygon, centroid_and_radius, distance_km, parse_circle
from .util import async_load_acceptance, compute_disclaimer_hash, raise_issue, verify_acceptance_signature
from .util import point_in_polygon, centroid_and_radius, distance_km, parse_circle

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    # Enforce disclaimer acceptance and tamper detection
    acceptance = await async_load_acceptance(hass)
    current_hash = compute_disclaimer_hash()
    if (
        not acceptance
        or not acceptance.get('accepted')
        or (acceptance.get('disclaimer_hash') != current_hash)
        or not verify_acceptance_signature(acceptance)
    ):
        # Create Repairs issue and abort setup
        raise_issue(hass, ISSUE_DISCLAIMER_REQUIRED, translation_key="disclaimer_required", placeholders={"link": "https://github.com/twcau/CAP-au-for-home-assistant/blob/main/LEGAL-DISCLAIMER.md"}, fixable=True)
        return False
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def handle_pip(call: ServiceCall):
        polygon = call.data.get('polygon','')
        lat = float(call.data.get('lat',0.0))
        lon = float(call.data.get('lon',0.0))
        match = point_in_polygon(polygon, lat, lon)
        hass.bus.fire(EVENT_PIP_RESULT, {'match': match, 'lat': lat, 'lon': lon})

    async def handle_zone_from_polygon(call: ServiceCall):
        polygon = call.data.get('polygon','')
        name = call.data.get('name','CAP Polygon')
        icon = call.data.get('icon','mdi:alert')
        lat, lon, radius_m = centroid_and_radius(polygon)
        await hass.services.async_call('zone','create',{
            'name': name,
            'icon': icon,
            'latitude': lat,
            'longitude': lon,
            'radius': radius_m
        }, blocking=True)

    async def handle_find_matches(call: ServiceCall):
        lat = float(call.data.get('lat',0.0))
        lon = float(call.data.get('lon',0.0))
        radius_km = float(call.data.get('radius_km', 10.0))
        feed_slugs = call.data.get('feed_slugs') or []
        matches: List[Dict[str, Any]] = []
        cache = hass.data[DOMAIN].get('last_data', [])
        for r in cache:
            if feed_slugs and r.get('slug') not in feed_slugs:
                continue
            alerts = r.get('alerts') or []
            for a in alerts:
                hit = False
                poly = a.get('polygon') or ''
                circ = a.get('circle') or ''
                if poly:
                    if point_in_polygon(poly, lat, lon):
                        hit = True
                    else:
                        clat, clon, _ = centroid_and_radius(poly)
                        if distance_km(lat, lon, clat, clon) <= radius_km:
                            hit = True
                elif circ:
                    c = parse_circle(circ)
                    if c:
                        clat, clon, cr_km = c
                        if distance_km(lat, lon, clat, clon) <= (cr_km + radius_km):
                            hit = True
                if hit:
                    matches.append({'feed': r.get('feed'), 'slug': r.get('slug'), 'alert': a})
        hass.bus.fire(EVENT_MATCHES, {'lat': lat, 'lon': lon, 'radius_km': radius_km, 'count': len(matches), 'matches': matches[:50]})

    async def handle_create_zones_for_feed(call: ServiceCall):
        feed_slug = call.data.get('feed_slug')
        max_zones = int(call.data.get('max_zones', 10))
        name_template = call.data.get('name_template', 'CAP {slug} #{n}')
        icon = call.data.get('icon','mdi:alert')
        include_circles = bool(call.data.get('include_circles', True))
        created = 0
        cache = hass.data[DOMAIN].get('last_data', [])
        for r in cache:
            if r.get('slug') != feed_slug:
                continue
            alerts = r.get('alerts') or []
            for idx, a in enumerate(alerts, start=1):
                if created >= max_zones:
                    break
                poly = a.get('polygon') or ''
                circ = a.get('circle') or ''
                if poly:
                    lat, lon, radius_m = centroid_and_radius(poly)
                elif include_circles and circ and (c := parse_circle(circ)):
                    clat, clon, cr_km = c
                    lat, lon, radius_m = clat, clon, cr_km * 1000.0
                else:
                    continue
                name = name_template.format(slug=feed_slug, n=idx)
                await hass.services.async_call('zone','create',{
                    'name': name,
                    'icon': icon,
                    'latitude': lat,
                    'longitude': lon,
                    'radius': radius_m
                }, blocking=True)
                created += 1
        _LOGGER.debug("create_zones_for_feed: created %s zones for %s", created, feed_slug)

    hass.services.async_register(DOMAIN, 'point_in_polygon', handle_pip)
    hass.services.async_register(DOMAIN, 'create_zone_from_polygon', handle_zone_from_polygon)
    hass.services.async_register(DOMAIN, 'find_matches', handle_find_matches)
    hass.services.async_register(DOMAIN, 'create_zones_for_feed', handle_create_zones_for_feed)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    return unload_ok
