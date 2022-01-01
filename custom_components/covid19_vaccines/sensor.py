"""COVID-19 Vaccine Sensor"""
import datetime
import json
import logging
from unicodedata import normalize

import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
import numpy as np
import pandas as pd
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_MONITORED_CONDITIONS, CONF_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__: "0.1"

_RESOURCE = "https://covidlive.com.au/report/vaccinations"
_LOGGER = logging.getLogger(__name__)

ATTR_LAST_UPDATE = "last_update"
ATTR_SENSOR_ID = "sensor_id"
ATTR_CHANGE = "change"
ATTRIBUTION = "Data provided by Covidlive"

DATA = {
    "Australia": ["Australia", 0, 0],
    "ACT": ["ACT", 0, 0],
    "NSW": ["NSW", 0, 0],
    "NT": ["NT", 0, 0],
    "Queensland": ["Queensland", 0, 0],
    "SA": ["SA", 0, 0],
    "Tasmania": ["Tasmania", 0, 0],
    "Victoria": ["Victoria", 0, 0],
    "WA": ["WA", 0, 0],
}

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=30)

SENSOR_TYPES = {
    "Australia": ["Australia", "Doses", "mdi:biohazard"],
    "ACT": ["ACT", "Doses", "mdi:biohazard"],
    "NSW": ["NSW", "Doses", "mdi:biohazard"],
    "NT": ["NT", "Doses", "mdi:biohazard"],
    "Queensland": ["QLD", "Doses", "mdi:biohazard"],
    "SA": ["SA", "Doses", "mdi:biohazard"],
    "Tasmania": ["TAS", "Doses", "mdi:biohazard"],
    "Victoria": ["VIC", "Doses", "mdi:biohazard"],
    "WA": ["WA", "Doses", "mdi:biohazard"],
}

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_NAME, default=""): cv.string,
        vol.Required(CONF_MONITORED_CONDITIONS, default=[]): vol.All(
            cv.ensure_list, [vol.In(SENSOR_TYPES)]
        ),
    }
)


def clean_normalize_whitespace(x):
    if isinstance(x, str):
        return normalize("NFKC", x).strip()
    else:
        return x


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Setup Sensor"""
    _LOGGER.debug("CovidVaccine")
    covidvaccine_data = CovidVaccineCurrentData()
    try:
        covidvaccine_data.update()
    except ValueError as err:
        _LOGGER.error("Error retrieving CovidVaccine Data: %s", err)
        return

    for var in config[CONF_MONITORED_CONDITIONS]:
        _LOGGER.debug("CovidVaccine: %s", var)

    add_entities(
        [
            CovidVaccineSensor(covidvaccine_data, variable, config.get(CONF_NAME))
            for variable in config[CONF_MONITORED_CONDITIONS]
        ]
    )


class CovidVaccineSensor(Entity):
    """Implementation of Sensor"""

    def __init__(self, covidvaccine_data, condition, regionname):
        self.covidvaccine_data = covidvaccine_data
        self._condition = condition
        self.regionname = regionname

    @property
    def name(self):
        return "COVID-19 Vaccine {}".format(SENSOR_TYPES[self._condition][0])

    @property
    def state(self):
        return self.covidvaccine_data.latest_data[self._condition][1]

    @property
    def extra_state_attributes(self):
        attr = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            ATTR_LAST_UPDATE: self.covidvaccine_data.last_updated,
            ATTR_CHANGE: self.covidvaccine_data.latest_data[self._condition][2],
            ATTR_SENSOR_ID: self._condition,
        }
        return attr

    @property
    def icon(self):
        return SENSOR_TYPES[self._condition][2]

    @property
    def unit_of_measurement(self):
        return SENSOR_TYPES[self._condition][1]

    def update(self):
        self.covidvaccine_data.update()


class CovidVaccineCurrentData:
    """Fetch CovidVaccine Data"""

    def __init__(self):
        self._data = None
        self.last_updated = None

    def _build_url(self):
        url = _RESOURCE
        _LOGGER.debug("CovidVaccine: %s", url)
        return url

    @property
    def latest_data(self):
        if self._data:
            return self._data
        return None

    def should_update(self):
        if self.last_updated is None:
            return True
        now = dt_util.utcnow()
        update_due_at = self.last_updated + datetime.timedelta(minutes=30)
        return now > update_due_at

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):

        if not self.should_update():
            _LOGGER.debug(
                "CovidVaccine was last updated %s minutes ago, skipping update",
                (dt_util.utcnow() - self.last_updated),
            )
            return

        try:
            tables = pd.read_html(_RESOURCE, attrs={"class": "VACCINATIONS"})
            print(tables[0])
            df = tables[0]
            df = df.applymap(clean_normalize_whitespace)
            df.columns = df.columns.to_series().apply(clean_normalize_whitespace)

            col_type = {"STATE": "string", "DOSES": "string", "VAR": "string", "NET": "string"}

            clean_dict = {"%": "", "−": "-", "\(est\)": "0"}

            # Replace values and convert to numeric values
            df = df.replace(clean_dict, regex=True).replace({"-": 0}).astype(col_type)
            df = df.replace("Australia *", "Australia", regex=True)
            for index, row in df.iterrows():
                DATA[row["STATE"]][1] = row["DOSES"]
                DATA[row["STATE"]][2] = row["NET"]

            self._data = DATA
            self.last_updated = dt_util.utcnow()
            _LOGGER.debug("CovidVaccine: Last Updated %s", self.last_updated)
            return
        except ValueError as err:
            _LOGGER.error("Check CovidVaccine %s", err.args)
            self._data = None
            raise
