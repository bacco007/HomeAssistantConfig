import json, requests
from requests.exceptions import HTTPError
from datetime import datetime
from pytz import timezone


@service
def getdata_bomforecast(
    entity_id="sensor.bomforecast_tamworth_3hr",
    unit_of_measurement=None,
    friendly_name="BOM Forecast - Tamworth 3hrly",
    icon="mdi:weather",
):
    if entity_id is None:
        log.error("getdata_bomforecast: No Entity ID provided")
        return

    URL = "https://api.weather.bom.gov.au/v1/locations/r67r4k/forecasts/3-hourly"
    CONDITION_MAP = {
        'clear': 'clear-night',
        'cloudy': 'cloudy',
        'cyclone': 'exceptional',
        'dust': 'fog',
        'dusty': 'fog',
        'fog': 'fog',
        'frost': 'snowy',
        'haze': 'fog',
        'hazy': 'fog',
        'heavy_shower': 'rainy',
        'heavy_showers': 'rainy',
        'light_rain': 'rainy',
        'light_shower': 'rainy',
        'light_showers': 'rainy',
        "mostly_sunny": "sunny",
        'partly_cloudy': 'partlycloudy',
        'rain': 'rainy',
        'shower': 'rainy',
        'showers': 'rainy',
        'snow': 'snowy',
        'storm': 'lightning-rainy',
        'storms': 'lightning-rainy',
        'sunny': 'sunny',
        'tropical_cyclone': 'exceptional',
        'wind': 'windy',
        'windy': 'windy',
        None: None,
    }

    try:
        r = task.executor(requests.get, URL)
        r.raise_for_status()
    except HTTPError as http_err:
        log.error("getdata_bomforecast: HTTP Error Occured: {http_err}")
    except Exception as err:
        log.error("getdata_bomforecast: Other Error Occured: {err}")

    data = r.json()
    FORECAST = []
    issuetime = str(data["metadata"]["issue_time"])
    for d in data["data"]:
        if d["rain"]["amount"]["max"] is None:
            rain = 0
        else:
            rain = d["rain"]["amount"]["max"]
        FORECAST.append({
            "datetime": str(d["time"]),
            "temperature": d["temp"],
            "condition": CONDITION_MAP[d["icon_descriptor"]],
            "precipitation": rain,
            "precipitation_probability": d["rain"]["chance"],
            "wind_bearing": d["wind"]["direction"],
            "wind_speed": d["wind"]["speed_kilometre"]
        })

    attributes = {}
    attributes["unit_of_measurement"] = unit_of_measurement
    attributes["friendly_name"] = friendly_name
    attributes["icon"] = icon
    attributes["issuetime"] = issuetime
    attributes["forecast"] = FORECAST
    state.set(entity_id, value=issuetime, new_attributes=attributes)


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
