#!/usr/bin/env python
import json, requests, datetime
from requests.exceptions import HTTPError
from collections import defaultdict
from math import sin, cos, asin, sqrt, degrees, radians


@service
def getdata_hazardwatch(
    entity_id="sensor.hazardwatch_current",
    friendly_name="[Hazard Watch] Current",
    icon="mdi:home-flood",
):
    if entity_id is None:
        log.error("getdata_hazardwatch: No Entity ID provided")
        return

    URL = "https://hazardwatch.gov.au/app-api/alerts"
    locn_lat = -31.081265
    locn_lng = 150.941741
    max_dist = 100

    Earth_radius_km = 6371.0
    RADIUS = Earth_radius_km

    def haversine(angle_radians):
        return sin(angle_radians / 2.0) ** 2

    def inverse_haversine(h):
        return 2 * asin(sqrt(h)) # radians

    def distance_between_points(lat1, lon1, lat2, lon2):
        # all args are in degrees
        # WARNING: loss of absolute precision when points are near-antipodal
        lat1 = radians(lat1)
        lat2 = radians(lat2)
        dlat = lat2 - lat1
        dlon = radians(lon2 - lon1)
        h = haversine(dlat) + cos(lat1) * cos(lat2) * haversine(dlon)
        return RADIUS * inverse_haversine(h)

    def remove_html_tags(text):
        """Remove html tags from a string"""
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_hazardwatch: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_hazardwatch: Other Error Occured: {err}")

    tmpdata = []
    tmpdata2 = []
    tmpdata3 = []
    OUTPUT_DATA = []
    basedata = r.json()
    for a in basedata['geojson']['features']:
        tmpid = a['properties']['alertIdentifier']
        point = a['geometry']['geometries'][1]
        coord_lng= point['coordinates'][0]
        coord_lat = point['coordinates'][1]
        distance_to_locn = distance_between_points(locn_lat, locn_lng, coord_lat, coord_lng)
        if (distance_to_locn <= max_dist):
            tmpdata.append(tmpid)
            tmpdata2.append({
                "identifier": tmpid,
                "coord_lng": coord_lng,
                "coord_lat": coord_lat,
                "distance_to_locn": round(distance_to_locn,2)})

    for b in basedata['alerts']:
        if b['identifier'] in tmpdata:
            #print(b)
            tmpdata3.append(
                {
                    "identifier": b['identifier'],
                    "sent": b['sent'],
                    "status": b['status'],
                    "msgtype": b['msgType'],
                    "eventtype": b['info']['event'],
                    "responsetype": b['info']['responseType'],
                    "severity": b['info']['severity'],
                    "urgency": b['info']['urgency'],
                    "sender": b['info']['senderName'],
                    "warninglevel": b['info']['parameter']['AustralianWarningSystem:WarningLevel'],
                    "warningaction": b['info']['parameter']['AustralianWarningSystem:CallToAction'],
                    "location": b['info']['parameter']['AffectedLocation'],
                    "nextupdate": b['info']['parameter']['NextUpdateDate']
                })

    d = defaultdict(dict)
    for l in (tmpdata3, tmpdata2):
        for elem in l:
            d[elem['identifier']].update(elem)
    OUTPUT_DATA = d.values()

    countval = len(OUTPUT_DATA)

    attributes = {}
    attributes["unit_of_measurement"] = "Incidents"
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["data"] = OUTPUT_DATA
    attributes["category"] = "hazardwatch"
    attributes["lastcheck"] = datetime.datetime.now()
    state.set(entity_id, value=countval, new_attributes=attributes)
    # , new_attributes=attributes

def get_config(name):
    value = pyscript.app_config.get(name)

    if value is None:
        log.error(
            '"'
            + name
            + '" is required parameter but not defined in Pyscript configuration for application'
        )
    return value


@time_trigger("startup")
def load():
    log.info(f"app has started")
