""" OpenNEM """
import logging
import datetime
from typing import ValuesView

import aiohttp
from async_timeout import timeout
from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_registry import (
    async_entries_for_config_entry,
    async_get,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
import homeassistant.util.dt as dt_util

from .const import (
    API_ENDPOINT,
    API_ENDPOINT_NEM,
    API_ENDPOINT_WA,
    API_ENDPOINT_AU,
    CONF_REGION,
    COORDINATOR,
    DOMAIN,
    PLATFORMS,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)

DEFAULT_SCAN_INTERVAL = datetime.timedelta(minutes=10)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load Saved Entities"""
    _LOGGER.info("OpenNEM: Version %s is starting", VERSION)
    hass.data.setdefault(DOMAIN, {})

    if entry.unique_id is not None:
        hass.config_entries.async_update_entry(entry, unique_id=None)
        ent_reg = async_get(hass)
        for entity in async_entries_for_config_entry(ent_reg, entry.entry_id):
            ent_reg.async_update_entity(entity.entity_id, new_unique_id=entry.entry_id)

    # Setup Coordinator
    coordinator = OpenNEMDataUpdateCoordinator(hass, entry.data)

    await coordinator.async_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        COORDINATOR: coordinator,
    }

    hass.config_entries.async_setup_platforms(entry, PLATFORMS)
    return True


async def async_unload_entry(hass, config_entry):
    """Handle Entry Removal"""
    try:
        await hass.config_entries.async_forward_entry_unload(config_entry, "sensor")
        _LOGGER.info(
            "OpenNEM: Successfully removed sensor from " + DOMAIN + " integration"
        )
    except ValueError:
        pass
    return True


async def update_listener(hass, entry):
    """Update Listener"""
    entry.data = entry.options
    await hass.config_entries.async_forward_entry_unload(entry, "sensor")
    hass.async_add_job(hass.config_entries.async_forward_entry_setup(entry, "sensor"))


class OpenNEMDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data"""

    def __init__(self, hass, config):
        self.interval = DEFAULT_SCAN_INTERVAL
        self.name = config[CONF_NAME]
        self.config = config
        self.hass = hass
        _LOGGER.debug("OpenNEM: Data will be updated every %s", self.interval)
        super().__init__(hass, _LOGGER, name=self.name, update_interval=self.interval)

    async def _async_update_data(self):
        async with timeout(30):
            try:
                data = await update_opennem(self.config)
            except Exception as error:
                raise UpdateFailed(error) from error
            return data

async def update_opennem(config) -> dict:
    """Fetch new state data"""
    data = await async_get_state(config)
    return data


async def async_get_state(config) -> dict:
    """Query API"""
    values = {
        "bioenergy_biomass": 0,
        "bioenergy_biogas": 0,
        "coal_black": 0,
        "coal_brown": 0,
        "distillate": 0,
        "gas_ccgt": 0,
        "gas_ocgt": 0,
        "gas_recip": 0,
        "gas_steam": 0,
        "gas_wcmg": 0,
        "hydro": 0,
        "pumps": 0,
        "solar_utility": 0,
        "solar_rooftop": 0,
        "wind": 0,
        "battery_discharging": 0,
        "battery_charging": 0,
        "exports": 0,
        "imports": 0,
        "price": 0,
        "demand": 0,
        "generation": 0,
        "temperature": 0,
        "fossilfuel": 0,
        "renewables": 0,
        "last_update": None,
    }
    data = None
    regiondata = []

    region = config[CONF_REGION] + "1"
    if region == "nem1":
        url = API_ENDPOINT_NEM
    elif region == "au1":
        url = API_ENDPOINT_AU
    elif region == "wa1":
        url = API_ENDPOINT_WA
    else:
        url = API_ENDPOINT.format(region.upper())
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as remotedata:
            _LOGGER.debug("OpenNEM: Getting State for %s from %s" % (region, url))
            if remotedata.status == 200:
                data = await remotedata.json()

    if data is not None:
        _LOGGER.debug("OpenNEM: Data Downloaded, Commencing Processing")

        for row in data["data"]:
            if row["type"] == "power":
                ftype = row["fuel_tech"]
            else:
                ftype = row["type"]

            #units = row["units"]
            #last_update = row["history"]["last"]

            if row["type"] == "temperature":
                value = row["history"]["data"][-2]
            elif row["type"] == "price":
                value = row["history"]["data"][-2]
            elif ftype == "imports":
                value = abs(row["history"]["data"][-1])
            elif ftype == "exports":
                value = -abs(row["history"]["data"][-1])
            elif ftype == "battery_charging":
                value = -abs(row["history"]["data"][-1])
            else:
                value = row["history"]["data"][-1]

            if value is None:
                values[ftype] = 0.0
            else:
                values[ftype] = round(value, 2)

            regiondata.append(ftype)

        ffvalue = (
            values["coal_black"]
            + values["distillate"]
            + values["coal_brown"]
            + values["gas_ccgt"]
            + values["gas_ocgt"]
            + values["gas_recip"]
            + values["gas_steam"]
            + values["gas_wcmg"]
        )
        if ffvalue:
            values["fossilfuel"] = round(ffvalue, 2)
        else:
            values["fossilfuel"] = 0
        regiondata.append("fossilfuel")

        renvalue = (
            values["bioenergy_biomass"]
            + values["bioenergy_biogas"]
            + values["hydro"]
            + values["solar_utility"]
            + values["wind"]
            + values["solar_rooftop"]
        )
        if renvalue:
            values["renewables"] = round(renvalue, 2)
        else:
            values["renewables"] = 0
        regiondata.append("renewables")

        genvalue = values["fossilfuel"] + values["renewables"]
        if genvalue:
            values["generation"] = round(genvalue, 2)
            values["state"] = round(genvalue, 2)
        else:
            values["generation"] = 0
            values["state"] = 0
        regiondata.append("generation")

        if region == "wa1":
            pass
        else:
            genvsdemand = values["generation"] - values["demand"]
            if genvsdemand:
                values["genvsdemand"] = round(genvsdemand,2)
            else:
                values["genvsdemand"] = 0
            regiondata.append("genvsdemand")

        if region == "wa1":
            values["last_update"] = dt_util.as_utc(
                datetime.datetime.strptime(
                    str(data["created_at"]), "%Y-%m-%dT%H:%M:%S+08:00"
                )
            )
        else:
            values["last_update"] = dt_util.as_utc(
                datetime.datetime.strptime(
                    str(data["created_at"]), "%Y-%m-%dT%H:%M:%S+10:00"
                )
            )
    else:
        _LOGGER.debug("OpenNEM: No Data Found")

    _LOGGER.debug("OpenNEM: %s", values)

    attrs = {}
    regiondata.append("last_update")
    for a in values:
        if a in regiondata:
            attrs[a] = values[a]
        else:
            pass
    _LOGGER.debug("OpenNEM: Values to pass to Sensor: %s", attrs)

    return attrs


async def async_clear_states(config) -> dict:
    # Clear values
    values = {}
    values = {
        "bioenergy_biomass": 0,
        "bioenergy_biogas": 0,
        "coal_black": 0,
        "coal_brown": 0,
        "distillate": 0,
        "gas_ccgt": 0,
        "gas_ocgt": 0,
        "gas_recip": 0,
        "gas_steam": 0,
        "gas_wcmg": 0,
        "hydro": 0,
        "pumps": 0,
        "solar_utility": 0,
        "solar_rooftop": 0,
        "wind": 0,
        "battery_discharging": 0,
        "battery_charging": 0,
        "exports": 0,
        "imports": 0,
        "price": 0,
        "demand": 0,
        "generation": 0,
        "temperature": 0,
        "fossilfuel": 0,
        "renewables": 0,
        "last_update": None,
    }
    return values
