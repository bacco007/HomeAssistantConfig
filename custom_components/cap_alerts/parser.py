from __future__ import annotations
import json
import xmltodict
from typing import Any, Dict

def parse_feed(text: str, fmt: str) -> Dict[str, Any]:
    fmt = (fmt or 'cap').lower()
    if fmt == 'cap':
        return parse_cap_xml(text)
    if fmt == 'atom':
        return parse_atom_xml(text)
    if fmt == 'json':
        return parse_json(text)
    try:
        return parse_cap_xml(text)
    except Exception:
        try:
            return parse_json(text)
        except Exception:
            return { 'alerts': [], 'features': {'has_points': False, 'has_polygons': False, 'has_circles': False} }

def _norm_item(**kwargs):
    return {
        'identifier': kwargs.get('identifier',''),
        'sent': kwargs.get('sent',''),
        'headline': kwargs.get('headline',''),
        'event': kwargs.get('event',''),
        'severity': kwargs.get('severity',''),
        'urgency': kwargs.get('urgency',''),
        'areaDesc': kwargs.get('areaDesc',''),
        'polygon': kwargs.get('polygon',''),
        'circle': kwargs.get('circle',''),
        'link': kwargs.get('link','')
    }

def parse_cap_xml(text: str) -> Dict[str, Any]:
    doc = xmltodict.parse(text)
    alerts = []
    def ensure_list(x):
        if x is None:
            return []
        return x if isinstance(x, list) else [x]
    root = doc
    if 'alert' in root:
        alert_list = ensure_list(root['alert'])
    else:
        alert_list = []
        for k,v in root.items():
            if isinstance(v, dict) and 'alert' in v:
                alert_list = ensure_list(v['alert'])
                break
    for a in alert_list:
        identifier = (a.get('identifier') or '')
        sent = (a.get('sent') or '')
        info_list = ensure_list(a.get('info'))
        if not info_list:
            alerts.append(_norm_item(identifier=identifier, sent=sent))
            continue
        info = info_list[0]
        headline = info.get('headline') or ''
        event = info.get('event') or ''
        severity = info.get('severity') or ''
        urgency = info.get('urgency') or ''
        web = info.get('web') or ''
        area_list = ensure_list(info.get('area'))
        if not area_list:
            alerts.append(_norm_item(identifier=identifier, sent=sent, headline=headline, event=event, severity=severity, urgency=urgency, link=web))
            continue
        for area in area_list:
            areaDesc = area.get('areaDesc') or ''
            polygon = area.get('polygon') or ''
            circle = area.get('circle') or ''
            alerts.append(_norm_item(identifier=identifier, sent=sent, headline=headline, event=event, severity=severity, urgency=urgency, areaDesc=areaDesc, polygon=polygon, circle=circle, link=web))
    features = {
        'has_polygons': any(it.get('polygon') for it in alerts),
        'has_circles': any(it.get('circle') for it in alerts),
        'has_points': any(_has_point_like(it) for it in alerts)
    }
    return {'alerts': alerts, 'features': features}

def parse_atom_xml(text: str) -> Dict[str, Any]:
    doc = xmltodict.parse(text)
    feed = doc.get('feed') or {}
    entries = feed.get('entry') or []
    if not isinstance(entries, list):
        entries = [entries]
    alerts = []
    for e in entries:
        identifier = e.get('id') or ''
        sent = e.get('updated') or e.get('published') or ''
        headline = (e.get('title') or {}).get('#text') if isinstance(e.get('title'), dict) else (e.get('title') or '')
        link = ''
        l = e.get('link')
        if isinstance(l, list) and l:
            link = l[0].get('@href') or ''
        elif isinstance(l, dict):
            link = l.get('@href') or ''
        polygon = e.get('georss:polygon') or ''
        point = e.get('georss:point') or ''
        areaDesc = e.get('summary') or ''
        alerts.append(_norm_item(identifier=identifier, sent=sent, headline=headline, areaDesc=areaDesc, polygon=polygon, link=link))
    features = {
        'has_polygons': any(it.get('polygon') for it in alerts),
        'has_circles': any(it.get('circle') for it in alerts),
        'has_points': any(_has_point_like(it) for it in alerts)
    }
    return {'alerts': alerts, 'features': features}

def parse_json(text: str) -> Dict[str, Any]:
    data = json.loads(text)
    items = []
    if isinstance(data, dict) and 'alerts' in data:
        items = data['alerts']
    elif isinstance(data, list):
        items = data
    else:
        for k in ['events','features','items','results']:
            if k in (data if isinstance(data, dict) else {}):
                items = data[k]
                break
    alerts = []
    for obj in (items or []):
        identifier = str(obj.get('id') or obj.get('identifier') or '')
        sent = obj.get('sent') or obj.get('updated') or obj.get('published') or ''
        headline = obj.get('headline') or obj.get('title') or ''
        event = obj.get('event') or ''
        severity = obj.get('severity') or ''
        urgency = obj.get('urgency') or ''
        areaDesc = obj.get('areaDesc') or obj.get('area') or obj.get('location') or ''
        link = obj.get('link') or obj.get('url') or ''
        polygon = obj.get('polygon') or ''
        circle = obj.get('circle') or ''
        geom = obj.get('geometry') or {}
        if isinstance(geom, dict):
            if geom.get('type') == 'Polygon' and geom.get('coordinates'):
                coords = geom['coordinates'][0]
                polygon = ' '.join([f"{lat},{lon}" for lon,lat in coords])
            if geom.get('type') == 'Point' and geom.get('coordinates'):
                lat = geom['coordinates'][1]
                lon = geom['coordinates'][0]
                areaDesc = f"point {lat},{lon}"
        alerts.append(_norm_item(identifier=identifier, sent=sent, headline=headline, event=event, severity=severity, urgency=urgency, areaDesc=areaDesc, polygon=polygon, circle=circle, link=link))
    features = {
        'has_polygons': any(it.get('polygon') for it in alerts),
        'has_circles': any(it.get('circle') for it in alerts),
        'has_points': any(_has_point_like(it) for it in alerts)
    }
    return {'alerts': alerts, 'features': features}

def _has_point_like(item: dict) -> bool:
    a = (item.get('areaDesc') or '').lower()
    return 'point ' in a and ',' in a
