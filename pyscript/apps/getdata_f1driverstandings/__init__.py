#!/usr/bin/env python
import json

import requests
from requests.exceptions import HTTPError


@service
def getdata_f1driverstandings(
    entity_id="sensor.getdata_f1_driver_standings",
    unit_of_measurement=None,
    friendly_name="F1 Driver Standings",
    icon="mdi:racecar",
):
    if entity_id is None:
        log.error("getdata_f1driverstandings: No Entity ID provided")
        return

    URL = "http://ergast.com/api/f1/current/driverStandings.json"

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_f1driverstandings: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_f1driverstandings: Other Error Occured: {err}")

    data = r.json()
    data = data["MRData"]["StandingsTable"]["StandingsLists"]
    standingsat = "Round " + data[0]["round"] + ", " + data[0]["season"]
    STANDINGS = []
    for cons in data[0]["DriverStandings"]:
        STANDINGS.append(
            {
                "Position": cons["position"],
                "code": cons["Driver"]["code"],
                "number": cons["Driver"]["permanentNumber"],
                "Driver": cons["Driver"]["givenName"] + " " + cons["Driver"]["familyName"],
                "Team": cons["Constructors"][0]["name"],
                "Points": cons["points"],
                "Wins": cons["wins"],
            }
        )
    attributes = {}
    attributes["unit_of_measurement"] = unit_of_measurement
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["standingsat"] = standingsat
    attributes["standings"] = STANDINGS
    state.set(entity_id, value="1st: " + STANDINGS[0]["Driver"], new_attributes=attributes)


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
