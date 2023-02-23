#!/usr/bin/env python
import json

import requests
from requests.exceptions import HTTPError


@service
def getdata_aflladder(
    entity_id="sensor.getdata_afl_ladder",
    unit_of_measurement=None,
    friendly_name="AFL Draw",
    icon="mdi:football-australian",
):
    if entity_id is None:
        log.error("getdata_aflladder: No Entity ID provided")
        return

    URL = "https://aflapi.afl.com.au/afl/v2/compseasons/52/ladders"
    TEAM = "Sydney Swans"

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_aflladder: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_aflladder: Other Error Occured: {err}")

    data = r.json()
    standingsat = "Round " + str(data["round"]["roundNumber"])
    LADDER = []
    data = data["ladders"]
    for key in data[0]["entries"]:
        team = key["team"]["name"]
        logo_club = key["team"]["abbreviation"].lower()
        position = key["position"]
        played = key["played"]
        wins = key["thisSeasonRecord"]["winLossRecord"]["wins"]
        drawn = key["thisSeasonRecord"]["winLossRecord"]["draws"]
        lost = key["thisSeasonRecord"]["winLossRecord"]["losses"]
        pointsfor = key["pointsFor"]
        pointsagainst = key["pointsAgainst"]
        points = key["thisSeasonRecord"]["aggregatePoints"]
        percent = key["thisSeasonRecord"]["percentage"]
        #form = key["form"]
        form = ""
        if "nextOpponent" in key:
            nextop = key["nextOpponent"]["nickname"]
        else:
            nextop = "None Noted"
        LADDER.append(
            {
                "position": position,
                "logo": "https://www.afl.com.au/resources/v4.4.17/i/svg-output/icons.svg#icn-aflc-" + logo_club,
                "team": team,
                "played": played,
                "wins": wins,
                "drawn": drawn,
                "lost": lost,
                "points": points,
                "for": pointsfor,
                "against": pointsagainst,
                "percent": percent,
                "form": form,
                "nextgame": nextop,
            }
        )

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
