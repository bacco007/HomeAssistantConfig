#!/usr/bin/env python
import json, requests, datetime, xmltodict
from requests.exceptions import HTTPError
from math import sin, cos, asin, sqrt, radians
from bs4 import BeautifulSoup
from xml.parsers.expat import ExpatError  # for catching XML parse errors

@service
def getdata_essentialenergyoutages(
    entity_id=None,
    dataseturl=None,
    friendly_name=None,
    icon=None,
):
    if entity_id is None:
        log.error("getdata_essentialenergyoutages: No Entity ID provided")
        return

    URL = dataseturl
    locn_lat = -31.081265
    locn_lng = 150.941741
    max_dist = 20

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

    # --- fetch ---
    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error(f"getdata_essentialenergyoutages: HTTP Error Occurred: {http_err}")
        return
    except Exception as err:
        log.error(f"getdata_essentialenergyoutages: Other Error Occurred: {err}")
        return

    if not r.content or not r.text.strip():
        log.error("getdata_essentialenergyoutages: Empty response body; aborting")
        return

    # --- parse (defensive) ---
    try:
        data = xmltodict.parse(r.content)
    except ExpatError:
        # Try stripping any junk before the first '<'
        txt = r.text
        first_lt = txt.find("<")
        if first_lt > 0:
            txt = txt[first_lt:]
        try:
            data = xmltodict.parse(txt)
        except ExpatError as e2:
            preview = r.text[:200].replace("\n", " ")
            log.error(f"getdata_essentialenergyoutages: XML parse failed: {e2}; head: {preview}")
            return

    # --- data walk & normalization ---
    doc = data.get("kml", {}).get("Document", {})
    folder = doc.get("Folder", {})
    placemarks = folder.get("Placemark")

    if placemarks is None:
        placemarks = []
    elif isinstance(placemarks, dict):
        placemarks = [placemarks]
    # if already a list, leave as-is

    OUTPUT_DATA = []
    dist_0_1 = 0
    dist_1_2 = 0
    dist_2_5 = 0
    dist_5_10 = 0
    dist_10_20 = 0

    for l in placemarks:
        # Guard against unexpected shapes without changing logic
        if not isinstance(l, dict):
            continue
        try:
            incident = l.get('@id') or l.get('id') or ""
            mg = l.get('MultiGeometry', {})
            point = mg.get('Point', {}) if isinstance(mg, dict) else {}
            coords = point.get('coordinates', "")
            if not coords:
                continue
            coord = coords.split(",")
            coord_lat = float(coord[1])
            coord_lng = float(coord[0])
            distance_to_locn = distance_between_points(locn_lat, locn_lng, coord_lat, coord_lng)

            desc_html = l.get('description', "")
            description = BeautifulSoup(desc_html or "", "html.parser")
            description.findAll()
            st = [s for s in description.strings]

            # Keep your original indexing logic
            if len(st) == 11:
                starttime = st[2]
                endtime = st[4]
                impact = st[6]
                reason = st[8]
                lastupdate = st[10]
            else:
                # fallback as per original
                if len(st) < 10:
                    # not enough fields; skip gracefully
                    continue
                starttime = st[2]
                endtime = ""
                impact = st[5]
                reason = st[7]
                lastupdate = st[9]

            if distance_to_locn <= max_dist:
                if distance_to_locn <= 1:
                    dist_0_1 += 1
                elif distance_to_locn <= 2:
                    dist_1_2 += 1
                elif distance_to_locn <= 5:
                    dist_2_5 += 1
                elif distance_to_locn <= 10:
                    dist_5_10 += 1
                elif distance_to_locn <= 20:
                    dist_10_20 += 1

                OUTPUT_DATA.append(
                    {
                        "id": incident,
                        "coord": f"{coord[1]}, {coord[0]}",
                        "dist_km": str(round(distance_to_locn, 2)),
                        "starttime": starttime,
                        "endtime": endtime,
                        "customers_impacted": impact,
                        "reason": reason,
                        "lastupdate": lastupdate
                    }
                )
        except Exception as e:
            # keep collecting others; don't change behavior for good entries
            log.warning(f"getdata_essentialenergyoutages: skipped a Placemark due to error: {e}")

    dist_detail = [{
        "Dist 0-1": dist_0_1,
        "Dist 1-2": dist_1_2,
        "Dist 2-5": dist_2_5,
        "Dist 5-10": dist_5_10,
        "Dist 10-20": dist_10_20
    }]
    countval = len(OUTPUT_DATA)

    attributes = {}
    attributes["unit_of_measurement"] = "Incidents"
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["data"] = list(OUTPUT_DATA)
    attributes["distances"] = dist_detail
    attributes["category"] = "essential_energy"
    attributes["lastcheck"] = datetime.datetime.now()
    state.set(entity_id, value=countval, new_attributes=attributes)


def get_config(name):
    value = pyscript.app_config.get(name)
    if value is None:
        log.error(
            '"' + name + '" is required parameter but not defined in Pyscript configuration for application'
        )
    return value


@time_trigger("startup")
def load():
    log.info("app has started")
