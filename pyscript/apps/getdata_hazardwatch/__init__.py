#!/usr/bin/env python
import json, requests, datetime
from requests.exceptions import HTTPError
from collections import defaultdict
from math import sin, cos, asin, sqrt, radians

@service
def getdata_hazardwatch(
    entity_id="sensor.nswhazardwatch_current",
    friendly_name="[NSW Hazard Watch] Current",
    icon="mdi:home-flood",
):
    if not entity_id:
        log.error("getdata_hazardwatch: No Entity ID provided")
        return

    URL = "https://hazardwatch.gov.au/app-api/alerts"
    location_lat = -31.081265
    location_lng = 150.941741
    max_distance_km = 100

    EARTH_RADIUS_KM = 6371.0

    def haversine(angle_radians):
        return sin(angle_radians / 2.0) ** 2

    def inverse_haversine(h):
        return 2 * asin(sqrt(h))  # radians

    def distance_between_points(lat1, lon1, lat2, lon2):
        """Calculate the great-circle distance between two points."""
        lat1, lat2 = radians(lat1), radians(lat2)
        dlat, dlon = lat2 - lat1, radians(lon2 - lon1)
        h = haversine(dlat) + cos(lat1) * cos(lat2) * haversine(dlon)
        return EARTH_RADIUS_KM * inverse_haversine(h)

    def remove_html_tags(text):
        """Remove HTML tags from a string."""
        import re
        return re.sub(r'<.*?>', '', text)

    try:
        response = task.executor(requests.get, URL)
        response.raise_for_status()
    except HTTPError as http_err:
        log.error(f"getdata_hazardwatch: HTTP Error Occurred: {http_err}")
        return
    except Exception as err:
        log.error(f"getdata_hazardwatch: Unexpected Error: {err}")
        return

    hazard_data = response.json()
    nearby_hazards = set()  # Use a set for quick lookups
    hazard_details = []
    
    # Process geojson features for location-based filtering
    for feature in hazard_data.get('geojson', {}).get('features', []):
        hazard_id = feature["properties"].get("alertIdentifier")
        coordinates = feature["geometry"]["geometries"][1]["coordinates"]
        coord_lng, coord_lat = coordinates[0], coordinates[1]

        if hazard_id:
            distance_to_location = distance_between_points(location_lat, location_lng, coord_lat, coord_lng)
            if distance_to_location <= max_distance_km:
                nearby_hazards.add(hazard_id)  # Store valid hazard IDs
                hazard_details.append({
                    "identifier": hazard_id,
                    "coord_lng": coord_lng,
                    "coord_lat": coord_lat,
                    "distance_to_locn": round(distance_to_location, 2)
                })

    # Process alerts that match filtered hazards
    alert_info = []
    for alert in hazard_data.get('alerts', []):
        alert_id = alert.get('identifier')
        info = alert.get('info', {})
        parameters = info.get('parameter', {})

        if alert_id in nearby_hazards:  # Only process relevant hazards
            alert_info.append({
                "identifier": alert_id,
                "hazard_sent": alert.get("sent"),
                "hazard_status": alert.get("status"),
                "hazard_msgtype": alert.get("msgType"),
                "hazard_eventtype": info.get("event", "Unknown"),
                "hazard_responsetype": info.get("responseType", "Unknown"),
                "hazard_severity": info.get("severity", "Unknown"),
                "hazard_urgency": info.get("urgency", "Unknown"),
                "hazard_sender": info.get("senderName", "Unknown"),
                "hazard_warninglevel": parameters.get("AustralianWarningSystem:WarningLevel", "Unknown"),
                "hazard_warningaction": parameters.get("AustralianWarningSystem:CallToAction", "Unknown"),
                "hazard_location": parameters.get("AffectedLocation", "Unknown"),
                "hazard_nextupdate": parameters.get("NextUpdateDate", "Unknown")
            })

    # Merge hazard location and details
    merged_data = defaultdict(dict)
    for entry in (alert_info + hazard_details):
        if "identifier" in entry:  # Ensure identifier exists before merging
            merged_data[entry["identifier"]].update(entry)
    
    final_output = list(merged_data.values())

    # Set state attributes
    state.set(
        entity_id,
        value=len(final_output),
        new_attributes={
            "unit_of_measurement": "Hazards",
            "friendly_name": friendly_name,
            "icon": icon,
            "data": final_output,
            "category": "nswhazardwatch",
            "lastcheck": datetime.datetime.now(),
        },
    )

def get_config(name):
    value = pyscript.app_config.get(name)
    if value is None:
        log.error(f'"{name}" is required but not defined in Pyscript configuration.')
    return value

@time_trigger("startup")
def load():
    log.info("Hazard Watch app has started")
