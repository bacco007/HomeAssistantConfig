#!/usr/bin/env python
import json

import requests
from requests.exceptions import HTTPError


@service
def getdata_nrldraw(
    entity_id="sensor.getdata_nrl_draw",
    unit_of_measurement=None,
    friendly_name="NRL Draw",
    icon="mdi:football",
):
    if entity_id is None:
        log.error("getdata_nrldraw: No Entity ID provided")
        return

    URL = "https://www.nrl.com/draw/data?competition=111&season=2022&team=500003"
    TEAM = "Knights"

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_nrldraw: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_nrldraw: Other Error Occured: {err}")

    data = r.json()
    ROUNDS = []
    for key in data["fixtures"]:
        if key["type"] == "Bye":
            match = "Bye"
            homescore = "N/A"
            awayscore = "N/A"
            time = ""
            result = "Bye"
        else:
            if key["homeTeam"]["nickName"] == TEAM:
                match = key["awayTeam"]["nickName"] + " (" + key["venue"] + ")"
            else:
                match = key["homeTeam"]["nickName"] + " (" + key["venue"] + ")"
            if key["matchMode"] == "Post":
                homescore = str(key["homeTeam"]["score"])
                awayscore = str(key["awayTeam"]["score"])
                if key["homeTeam"]["score"] > key["awayTeam"]["score"]:
                    result = key["homeTeam"]["nickName"] + ": " + homescore + " vs " + awayscore
                else:
                    result = key["awayTeam"]["nickName"] + ": " + awayscore + " vs " + homescore
            else:
                homescore = "N/A"
                awayscore = "N/A"
                result = "Yet to Play"
            time = key["clock"]["kickOffTimeLong"]
        ROUNDS.append(
            {
                "round": key["roundTitle"].replace("Round", "").strip(),
                "match": match,
                "time": time,
                "homescore": homescore,
                "awayscore": awayscore,
                "result": result,
            }
        )

    attributes = {}
    attributes["unit_of_measurement"] = unit_of_measurement
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["draw"] = ROUNDS
    state.set(entity_id, value="Round", new_attributes=attributes)


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
