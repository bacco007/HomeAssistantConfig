#!/usr/bin/env python
import json, requests, datetime
from requests.exceptions import HTTPError
from math import sin, cos, asin, sqrt, degrees, radians


@service
def getdata_livetrafficnsw(
    entity_id=None,
    dataseturl=None,
    friendly_name=None,
    icon=None,
):
    if entity_id is None:
        log.error("getdata_livetrafficnsw: No Entity ID provided")
        return

    URL = dataseturl
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
        log.error("getdata_livetrafficnsw: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_livetrafficnsw: Other Error Occured: {err}")

    OUTPUT_DATA = []
    basedata = r.json()
    data = basedata['features']
    for rec in data:
        coord = rec['geometry']['coordinates']
        coord_lat = coord[1]
        coord_lng = coord[0]
        distance_to_locn = distance_between_points(locn_lat, locn_lng, coord_lat, coord_lng)
        if (distance_to_locn <= max_dist):
            advice_concat = []
            if remove_html_tags(rec["properties"]["adviceA"]) != " ":
                advice_concat.append(remove_html_tags(rec["properties"]["adviceA"]))
            if remove_html_tags(rec["properties"]["adviceB"]) != " ":
                advice_concat.append(remove_html_tags(rec["properties"]["adviceB"]))
            if remove_html_tags(rec["properties"]["adviceC"]) != " ":
                advice_concat.append(remove_html_tags(rec["properties"]["adviceC"]))
            roaddet = []
            road = rec["properties"]["roads"][0]
            suburb = road["suburb"]
            roaddet.append(road["mainStreet"])
            if road["crossStreet"] != "":
                roaddet.append(road["locationQualifier"])
                roaddet.append(road["crossStreet"])
            if road["secondLocation"] != "":
                roaddet.append("and " + road["secondLocation"])

            periods = []
            if rec["properties"]["periods"] != []:
                for p in rec["properties"]["periods"]:
                    if p["startTime"] == "all day":
                        periods.append(p["roadextent"] + ": " + p["fromDay"] + ", " + p["startTime"])
                    else:
                        periods.append(p["roadextent"] + ": " + p["fromDay"] + ", " + p["startTime"] + " to " + p["finishTime"])
            else:
                periods.append("Affected: Every day, all day")

            if "start" in rec["properties"]:
                starttime = rec["properties"]["start"]/1000
            else:
                starttime = rec["properties"]["created"]/1000
            if "end" in rec:
                endtime = rec["properties"]["end"]/1000
            else:
                endtime = 0
            lastupdatetime = rec["properties"]["lastUpdated"]/1000

            if "OrgName" in rec["properties"]:
                org = rec["properties"]["OrgName"]
            else:
                org = "Transport Management Centre"

            if rec["properties"]["ended"] == True:
                pass
            else:
                OUTPUT_DATA.append(
                    {
                        "id": rec["id"],
                        "coord": str(coord[1]) + ", " + str(coord[0]),
                        "dist_km": str(round(distance_to_locn,2)),
                        "displayname": rec["properties"]["displayName"],
                        "starttime": starttime,
                        "endtime": endtime,
                        "lastupdatetime": lastupdatetime,
                        "incidenttype": rec["properties"]["incidentKind"],
                        "additionalinfo": rec["properties"]["additionalInfo"],
                        "advice": ', '.join(advice_concat),
                        "road": ' '.join(roaddet),
                        "suburb": suburb,
                        "periods": periods,
                        "otheradvice": remove_html_tags(rec["properties"]["otherAdvice"]),
                        "reportingorg": org,
                    }
                )
    countval = len(OUTPUT_DATA)

    attributes = {}
    attributes["unit_of_measurement"] = "Incidents"
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["data"] = OUTPUT_DATA
    attributes["category"] = "livetrafficnsw"
    attributes["lastcheck"] = datetime.datetime.now()
    state.set(entity_id, value=countval, new_attributes=attributes)


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
