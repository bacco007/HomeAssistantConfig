"""OpenNEM Sensor"""
import datetime
import logging

import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util
import requests
import voluptuous as vol
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    ATTR_ATTRIBUTION,
    CONF_MONITORED_CONDITIONS,
    CONF_NAME,
    TEMP_CELSIUS,
)
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__: "0.7"

_RESOURCE = "https://data.opennem.org.au/v3/stats/au/NEM/{}/power/7d.json"
_LOGGER = logging.getLogger(__name__)

ATTR_LAST_UPDATE = "last_update"
ATTR_REGION = "region"
ATTR_SENSOR_ID = "sensor_id"
ATTRIBUTION = "Data provided by OpenNEM"

CONF_REGION = "region"

DATA = {
    "biomass": ["Biomass", "", "", "", 0],
    "coal_black": ["Black Coal", "", "", "", 0],
    "coal_brown": ["Brown Coal", "", "", "", 0],
    "distillate": ["Distillate", "", "", "", 0],
    "gas_ccgt": ["Gas (CCGT)", "", "", "", 0],
    "gas_ocgt": ["Gas (OCGT)", "", "", "", 0],
    "gas_recip": ["Gas (Recip)", "", "", "", 0],
    "gas_steam": ["Gas (Steam)", "", "", "", 0],
    "hydro": ["Hydro", "", "", "", 0],
    "pumps": ["Pumps", "", "", "", 0],
    "solar_utility": ["Solar (Utility)", "", "", "", 0],
    "wind": ["Wind", "", "", "", 0],
    "battery_discharging": ["Battery (Discharging)", "", "", "", 0],
    "battery_charging": ["Battery (Charging)", "", "", "", 0],
    "exports": ["Exports", "", "", "", 0],
    "imports": ["Imports", "", "", "", 0],
    "solar_rooftop": ["Solar (Rooftop)", "", "", "", 0],
    "price": ["Price", "", "", "", 0],
    "demand": ["Demand", "", "", "", 0],
    "generation": ["Generation", "", "", "", 0],
    "temperature": ["Temperature", "", "", "", 0],
    "fossilfuel": ["Fossil Fuels", "", "", "", 0],
    "renewables": ["Renewables", "", "", "", 0],
}

MIN_TIME_BETWEEN_UPDATES = datetime.timedelta(seconds=60)

SENSOR_TYPES = {
    "battery_charging": ["Battery (Charging)", "MW", "mdi:battery-positive"],
    "battery_discharging": ["Battery (Discharging)", "MW", "mdi:battery-negative"],
    "biomass": ["Biomass", "MW", "mdi:transmission-tower"],
    "coal_black": ["Black Coal", "MW", "mdi:transmission-tower"],
    "coal_brown": ["Brown Coal", "MW", "mdi:transmission-tower"],
    "exports": ["Exported Power", "MW", "mdi:swap-vertical"],
    "demand": ["Electricity Demand", "MW", "mdi:power-socket-au"],
    "distillate": ["Distillate", "MW", "mdi:transmission-tower"],
    "fossilfuel": ["Gen from Fossil Fuels", "MW", "mdi:transmission-tower"],
    "renewables": ["Gen from Renewables", "MW", "mdi:transmission-tower"],
    "gas_ccgt": ["Gas (CCGT)", "MW", "mdi:transmission-tower"],
    "gas_ocgt": ["Gas (OCGT)", "MW", "mdi:transmission-tower"],
    "gas_recip": ["Gas (Recip)", "MW", "mdi:transmission-tower"],
    "gas_steam": ["Gas (Steam)", "MW", "mdi:transmission-tower"],
    "generation": ["Electricity Generation", "MW", "mdi:power-plug"],
    "hydro": ["Hydro", "MW", "mdi:transmission-tower"],
    "imports": ["Imported Power", "MW", "mdi:swap-vertical"],
    "price": ["Current Price", "$/MWh", "mdi:currency-usd"],
    "pumps": ["Pumps", "MW", "mdi:transmission-tower"],
    "solar_rooftop": ["Solar (Rooftop)", "MW", "mdi:solar-power"],
    "solar_utility": ["Solar (Utility)", "MW", "mdi:solar-power"],
    "temperature": ["Temperature", TEMP_CELSIUS, "mdi:home-thermometer"],
    "wind": ["Wind", "MW", "mdi:wind-turbine"],
}

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        # vol.Optional(CONF_NAME): cv.string,
        vol.Required(CONF_REGION): cv.string,
        vol.Optional(CONF_NAME, default=""): cv.string,
        vol.Required(CONF_MONITORED_CONDITIONS, default=[]): vol.All(
            cv.ensure_list, [vol.In(SENSOR_TYPES)]
        ),
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Setup Sensor"""
    region = config.get(CONF_REGION).upper()
    # name = config.get(CONF_NAME)
    _LOGGER.debug("OpenNEM: Region %s", region)
    opennem_data = OpenNEMCurrentData(region)
    try:
        opennem_data.update()
    except ValueError as err:
        _LOGGER.error("Error retrieving OpenNEM Data: %s", err)
        return

    for var in config[CONF_MONITORED_CONDITIONS]:
        _LOGGER.debug("OpenNEM: %s", var)

    add_entities(
        [
            OpenNEMSensor(opennem_data, variable, config.get(CONF_NAME), config.get(CONF_REGION))
            for variable in config[CONF_MONITORED_CONDITIONS]
        ]
    )


class OpenNEMSensor(Entity):
    """Implementation of Sensor"""

    def __init__(self, opennem_data, condition, regionname, regname):
        self.opennem_data = opennem_data
        self._condition = condition
        self.regionname = regionname
        self.regname = regname

    @property
    def name(self):
        if not self.regionname:
            return "OpenNEM {}: {}".format(self.regname, SENSOR_TYPES[self._condition][0])
        return "{} {}".format(self.regionname, SENSOR_TYPES[self._condition][0])

    @property
    def state(self):
        return self.opennem_data.latest_data[self._condition][4]

    @property
    def device_state_attributes(self):
        attr = {
            ATTR_ATTRIBUTION: ATTRIBUTION,
            ATTR_LAST_UPDATE: self.opennem_data.last_updated,
            ATTR_SENSOR_ID: self._condition,
            ATTR_REGION: self.regname,
        }
        return attr

    @property
    def icon(self):
        return SENSOR_TYPES[self._condition][2]

    @property
    def unit_of_measurement(self):
        return SENSOR_TYPES[self._condition][1]

    def update(self):
        self.opennem_data.update()


class OpenNEMCurrentData:
    """Fetch OpenNEM Data"""

    def __init__(self, region):
        self._region = region
        self._data = None
        self.last_updated = None

    def _build_url(self):
        url = _RESOURCE.format(self._region)
        _LOGGER.debug("OpenNEM: %s", url)
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
        update_due_at = self.last_updated + datetime.timedelta(minutes=10)
        return now > update_due_at

    @Throttle(MIN_TIME_BETWEEN_UPDATES)
    def update(self):
        ftype = None
        units = None
        last_update = None
        value = None
        ffvalue = None
        renvalue = None
        genvalue = None

        if not self.should_update():
            _LOGGER.debug(
                "OpenNEM was last updated %s minutes ago, skipping update",
                (dt_util.utcnow() - self.last_updated),
            )
            return

        try:
            result = requests.get(self._build_url(), timeout=10).json()
            ###OpenNEM Data
            for row in result["data"]:
                if row["type"] == "power":
                    ftype = row["fuel_tech"]
                else:
                    ftype = row["type"]
                units = row["units"]
                last_update = row["history"]["last"]
                if row["type"] == "temperature":
                    value = row["history"]["data"][-2]
                else:
                    value = row["history"]["data"][-1]
                DATA[ftype][2] = units
                DATA[ftype][3] = last_update
                if value:
                    DATA[ftype][4] = round(value, 2)
                else:
                    DATA[ftype][4] = 0

            ffvalue = (
                DATA["coal_black"][4]
                + DATA["distillate"][4]
                + DATA["coal_brown"][4]
                + DATA["gas_ccgt"][4]
                + DATA["gas_ocgt"][4]
                + DATA["gas_recip"][4]
                + DATA["gas_steam"][4]
            )
            if ffvalue:
                DATA["fossilfuel"][4] = round(ffvalue, 2)
            else:
                DATA["fossilfuel"][4] = 0

            renvalue = (
                DATA["biomass"][4]
                + DATA["hydro"][4]
                + DATA["solar_utility"][4]
                + DATA["wind"][4]
                + DATA["solar_rooftop"][4]
            )
            if renvalue:
                DATA["renewables"][4] = round(renvalue, 2)
            else:
                DATA["renewables"][4] = 0

            genvalue = DATA["fossilfuel"][4] + DATA["renewables"][4]
            if genvalue:
                DATA["generation"][4] = round(genvalue, 2)
            else:
                DATA["generation"][4] = 0

            self._data = DATA
            self.last_updated = dt_util.as_utc(
                datetime.datetime.strptime(str(self._data["demand"][3]), "%Y-%m-%dT%H:%M:%S+10:00")
            )
            _LOGGER.debug("OpenNEM: Last Updated %s", self.last_updated)
            return
        except ValueError as err:
            _LOGGER.error("Check OpenNEM %s", err.args)
            self._data = None
            raise
