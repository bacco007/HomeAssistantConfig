"""Sensor platform for NSW Air Quality"""
import datetime
import logging
from datetime import timedelta

import pandas as pd

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__ = "0.0.1"
_LOGGER = logging.getLogger(__name__)

REQUIREMENTS = []

DEFAULT_UOM = "People"

# DEFAULT_SCAN_INTERVAL = timedelta(hours=1)
# SCAN_INTERVAL = timedelta(hours=1)

ICON = "mdi:biohazard"

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(minutes=30)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({vol.Required(CONF_NAME): cv.string})


def setup_platform(hass, config, add_entities, discovery_info=None):
    "Setup Platform"
    add_entities([NSWHSensor(name=config[CONF_NAME])])


class NSWHSensor(Entity):
    def __init__(self, name: str):
        self._state = None
        self._name = name
        self._attributes = {}

    @property
    def name(self):
        return "covid_19_nswh_local"

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

        url = "https://data.nsw.gov.au/data/dataset/aefcde60-3b0c-4bc0-9af1-6fe652944ec2/resource/21304414-1ff1-4243-a5d2-f52778048b29/download/covid-19-cases-by-notification-date-and-postcode-local-health-district-and-local-government-area.csv"

        df = pd.read_csv(url, parse_dates=[0])

        df_hneh = df[df.lhd_2010_code == "X800"]
        df_hneh_count = len(df_hneh)
        df_hneh_earliest = df_hneh["notification_date"].min().strftime("%a %d %b")
        df_hneh_latest = df_hneh["notification_date"].max().strftime("%a %d %b")

        df_trc = df[df.lga_code19 == 17310.0]
        df_trc_count = len(df_trc)
        df_trc_earliest = df_trc["notification_date"].min().strftime("%a %d %b")
        df_trc_latest = df_trc["notification_date"].max().strftime("%a %d %b")

        df_tamw = df[df.postcode == 2340.0]
        df_tamw_count = len(df_tamw)
        df_tamw_earliest = df_tamw["notification_date"].min().strftime("%a %d %b")
        df_tamw_latest = df_tamw["notification_date"].max().strftime("%a %d %b")

        self._attributes = {}
        self._state = 0

        self._attributes["hneh"] = df_hneh_count
        self._attributes["hneh_dates"] = (
            "1st: " + str(df_hneh_earliest) + " - Last: " + str(df_hneh_latest)
        )
        self._attributes["trc"] = df_trc_count
        self._attributes["trc_dates"] = (
            "1st: " + str(df_trc_earliest) + " - Last: " + str(df_trc_latest)
        )
        self._attributes["tamw"] = df_tamw_count
        self._attributes["tamw_dates"] = (
            "1st: " + str(df_tamw_earliest) + " - Last: " + str(df_tamw_latest)
        )
        self._attributes[ATTR_ATTRIBUTION] = "Data provided by NSW Health"
        self._state = df_tamw_count
