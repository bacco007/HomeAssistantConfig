#!/usr/bin/env python
import json

import requests
from requests.exceptions import HTTPError


@service
def getdata_nrlladder(
    entity_id="sensor.getdata_nrl_ladder",
    unit_of_measurement=None,
    friendly_name="NRL Draw",
    icon="mdi:football",
):
    if entity_id is None:
        log.error("getdata_nrlladder: No Entity ID provided")
        return

    URL = "https://www.nrl.com/ladder/data?competition=111&season=2021"

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_nrlladder: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_nrlladder: Other Error Occured: {err}")

    data = r.json()
    standingsat = "Round " + str(data["selectedRoundId"])
    LADDER = []
    c = 1
    for key in data["positions"]:
        if key["next"]["isBye"] == True:
            nextgame = "Bye"
        else:
            nextgame = key["next"]["nickname"]
        LADDER.append(
            {
                "position": c,
                "team": key["teamNickname"],
                "points": key["stats"]["points"],
                "difference": key["stats"]["points difference"],
                "form": key["stats"]["streak"],
                "nextgame": nextgame,
            }
        )
        c = c + 1

    attributes = {}
    attributes["unit_of_measurement"] = unit_of_measurement
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["currentround"] = standingsat
    attributes["ladder"] = LADDER
    state.set(entity_id, value=standingsat, new_attributes=attributes)


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
