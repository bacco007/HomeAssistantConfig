#!/usr/bin/env python
import json

import requests
from requests.exceptions import HTTPError


@service
def getdata_afldraw(
    entity_id="sensor.getdata_afl_draw",
    unit_of_measurement=None,
    friendly_name="AFL Draw",
    icon="mdi:football-australian",
):
    if entity_id is None:
        log.error("getdata_afldraw: No Entity ID provided")
        return

    URL = "https://aflapi.afl.com.au/afl/v2/matches?competitionId=1&compSeasonId=34&pageSize=50&teamId=13"
    TEAM = "Sydney Swans"

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_afldraw: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_afldraw: Other Error Occured: {err}")

    data = r.json()
    currentround = data["matches"][0]["compSeason"]["currentRoundNumber"]
    ROUNDS = []
    for key in data["matches"]:
        # print(json.dumps(key, indent=2))
        if key["home"]["team"]["name"] == TEAM:
            match = key["away"]["team"]["name"] + " (" + key["venue"]["name"] + ")"
        else:
            match = key["home"]["team"]["name"] + " (" + key["venue"]["name"] + ")"
        if key["status"] == "CONCLUDED":
            homescore = (
                str(key["home"]["score"]["goals"])
                + "."
                + str(key["home"]["score"]["behinds"])
                + " ("
                + str(key["home"]["score"]["totalScore"])
                + ")"
            )
            awayscore = (
                str(key["away"]["score"]["goals"])
                + "."
                + str(key["away"]["score"]["behinds"])
                + " ("
                + str(key["away"]["score"]["totalScore"])
                + ")"
            )
            if key["home"]["score"]["totalScore"] > key["away"]["score"]["totalScore"]:
                result = key["home"]["team"]["nickname"] + ": " + homescore + " vs " + awayscore
            else:
                result = key["away"]["team"]["nickname"] + ": " + awayscore + " vs " + homescore
        else:
            homescore = "N/A"
            awayscore = "N/A"
            result = "Yet to Play"
        ROUNDS.append(
            {
                "round": key["round"]["roundNumber"],
                "match": match,
                "time": key["utcStartTime"],
                "homescore": homescore,
                "awayscore": awayscore,
                "result": result,
            }
        )

    attributes = {}
    attributes["unit_of_measurement"] = unit_of_measurement
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["currentround"] = currentround
    attributes["draw"] = ROUNDS
    state.set(entity_id, value="Round " + str(currentround), new_attributes=attributes)


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
