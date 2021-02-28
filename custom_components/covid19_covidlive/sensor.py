"""Sensor platform for Covid Live """
import datetime
import logging
from datetime import timedelta
from unicodedata import normalize

import homeassistant.helpers.config_validation as cv
import numpy as np
import pandas as pd
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__ = "0.1"
_LOGGER = logging.getLogger(__name__)

CONF_DEFAULT_LOCN = "aus"
CONF_REGION = "region"

REQUIREMENTS = []

DEFAULT_UOM = "Cases"

ICON = "mdi:biohazard"
ATTRIBUTION = "Data provided by Covid Live"

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=60)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_NAME): cv.string,
        vol.Required(CONF_REGION, default=CONF_DEFAULT_LOCN): cv.string,
    }
)


def clean_normalize_whitespace(x):
    if isinstance(x, str):
        return normalize("NFKC", x).strip()
    else:
        return x


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    region = config.get(CONF_REGION)
    name = config.get(CONF_NAME)
    _LOGGER.debug("CovidLive: Region - %s", region)
    _LOGGER.debug("CovidLive: Name - %s", name)
    add_entities([CovidLiveSensor(name, region)])


class CovidLiveSensor(Entity):
    def __init__(self, name: str, region: str):
        self._state = None
        self._name = name
        self._region = region
        self._attributes = {}

    @property
    def name(self):
        return "covid_19_covidlive_{}".format(self._region)

    @property
    def state(self):
        return self._state

    @property
    def icon(self):
        return ICON

    @property
    def state_attributes(self):
        return self._attributes

    @property
    def unit_of_measurement(self):
        return DEFAULT_UOM

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):

        url = "https://covidlive.com.au/report/daily-summary/{}".format(self._region)
        _LOGGER.debug("CovidLive: URL - %s", url)

        tables = pd.read_html(url, attrs={"class": "DAILY-SUMMARY"})
        df = tables[0]
        indexNames = df[df["CATEGORY"] == "Last Updated"].index
        df.drop(indexNames, inplace=True)
        df = df.applymap(clean_normalize_whitespace)
        df.columns = df.columns.to_series().apply(clean_normalize_whitespace)

        col_type = {"CATEGORY": "string", "TOTAL": "int", "VAR": "string", "NET": "string"}

        clean_dict = {"%": "", "−": "NaN", "\(est\)": "0"}
        df = df.replace(clean_dict, regex=True).replace({"-": 0}).astype(col_type)

        self._attributes = {
            "New Cases": 0,
            "Cases": 0,
            "Overseas": 0,
            "Doses": 0,
            "Tests": 0,
            "Active": 0,
            "Recoveries": 0,
            "Deaths": 0,
            "Hospitalised": 0,
            "Name": "Default",
            "Region": self._region,
        }
        self._state = 0

        for index, row in df.iterrows():
            _LOGGER.debug("CovidLive: Category - %s", row["CATEGORY"])
            _LOGGER.debug("CovidLive: Value - %s", row["TOTAL"])
            self._attributes[row["CATEGORY"]] = row["TOTAL"]

        self._attributes[ATTR_ATTRIBUTION] = ATTRIBUTION
        self._state = self._attributes["Cases"]
        self._attributes["Name"] = self._name
