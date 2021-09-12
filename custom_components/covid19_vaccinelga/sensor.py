"""Sensor platform for Covid Live """
import datetime
import logging
from unicodedata import normalize

import homeassistant.helpers.config_validation as cv
import numpy as np
import pandas as pd
import requests
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
from lxml import html

__version__ = "0.1"
_LOGGER = logging.getLogger(__name__)

CONF_DEFAULT_LOCN = "aus"
CONF_REGION = "region"

REQUIREMENTS = []

DEFAULT_UOM = "%"

ICON = "mdi:biohazard"
ATTRIBUTION = "Data provided by Covid Live"

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=10)

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
    # _LOGGER.debug("CovidLive: Region - %s", region)
    # _LOGGER.debug("CovidLive: Name - %s", name)
    add_entities([CovidLiveSensor(name, region)])


class CovidLiveSensor(Entity):
    def __init__(self, name: str, region: str):
        self._state = None
        self._name = name
        self._region = region
        self._attributes = {}

    @property
    def name(self):
        return "covid_19_covidlive_vaccinelga"

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

        self._attributes = {}

        url = "https://covidlive.com.au/report/vaccinations-by-lga/nsw"
        _LOGGER.debug("CovidLive: URL - %s", url)

        tables = pd.read_html(url, attrs={"class": "VACCINATIONS-BY-LGA"})
        df = tables[0]
        df = df.applymap(clean_normalize_whitespace)
        df.columns = df.columns.to_series().apply(clean_normalize_whitespace)

        # col_type = {"LGA": "string", "ACTIVE": "int", "1st": "int", "2nd": "int"}

        # clean_dict = {"%": "", "−": "0", "\(est\)": "0", "NaN": 0, "": 0, "N/A": 0}
        # df = df.replace(clean_dict, regex=True).replace({"-": 0}).replace({"NaN": 0}).astype(col_type)

        vaxdata = []
        for index, row in df.iterrows():
            if row["LGA"] in ["Tamworth Regional"]:
                self._state = float(row[2].strip("%"))

            if row["LGA"] in [
                "Tamworth Regional",
                "Dubbo Regional",
                "Kiama",
                "Liverpool Plains",
                "Armidale Regional",
                "Gunnedah",
                "Uralla",
                "Upper Hunter Shire",
                "Gwydir",
                "Narrabri",
                "Walcha",
            ]:
                vaxdata.append(
                    {
                        "lga": row[0],
                        "dose1st": float(row[2].strip("%")),
                        "dose2nd": float(row[3].strip("%")),
                    }
                )
        self._attributes["vax_data"] = vaxdata
        self._attributes[ATTR_ATTRIBUTION] = ATTRIBUTION
        self._attributes["Name"] = "COVID LGA Vax Nos"
