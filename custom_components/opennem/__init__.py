""" OpenNEM """
import logging
import datetime

import voluptuous as vol

import aiohttp
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.config_entries import ConfigEntry, SOURCE_IMPORT
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
import homeassistant.util.dt as dt_util
from homeassistant.helpers import config_validation as cv

from .config_flow import configured_instances
from .const import (
    API_ENDPOINT,
    API_ENDPOINT_EM,
    API_ENDPOINT_FLOW,
    API_ENDPOINT_NEM,
    API_ENDPOINT_WA,
    API_ENDPOINT_AU,
    CONF_REGION,
    DEFAULT_NAME,
    DOMAIN,
    PLATFORMS,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: vol.Schema({vol.Required(CONF_REGION): cv.string})}, extra=vol.ALLOW_EXTRA
)

DEFAULT_SCAN_INTERVAL = datetime.timedelta(minutes=10)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Setup OpenNEM Component"""
    if DOMAIN not in config:
        return True
    conf = config[DOMAIN]
    region = conf.get[CONF_REGION].upper()
    identifier = f"{DEFAULT_NAME} {region}"
    if identifier in configured_instances(hass):
        return True

    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": SOURCE_IMPORT},
            data={CONF_REGION: region},
        )
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Setup OpenNEM Component as Config Entry"""
    _LOGGER.info("OpenNEM: Version %s is starting", VERSION)
    hass.data.setdefault(DOMAIN, {})

    coordinator = OpenNEMDataUpdateCoordinator(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = coordinator
    # _LOGGER.debug("OpenNEM: Feed Coordinator Added for %s", entry.entry_id)

    async def _enable_scheduled_updates(*_):
        """Activate Data Update Coordinator"""
        scan_interval = DEFAULT_SCAN_INTERVAL
        if isinstance(scan_interval, int):
            coordinator.update_interval = datetime.timedelta(minutes=scan_interval)
        else:
            coordinator.update_interval = scan_interval
        await coordinator.async_refresh()

    if hass.state == CoreState.running:
        await _enable_scheduled_updates()
    else:
        hass.bus.async_listen_once(
            EVENT_HOMEASSISTANT_STARTED, _enable_scheduled_updates
        )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload OpenNEM Component"""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        _LOGGER.debug("OpenNEM: Removed Config for %s", entry.entry_id)
    return unload_ok


async def update_listener(hass, entry):
    """Update Listener"""
    entry.data = entry.options
    await hass.config_entries.async_forward_entry_unload(entry, "sensor")
    hass.async_add_job(hass.config_entries.async_forward_entry_setup(entry, "sensor"))


class OpenNEMDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data"""

    def __init__(self, hass: HomeAssistant, config: ConfigEntry) -> None:
        self.config: ConfigEntry = config
        self.hass = hass
        self._region = config.data[CONF_REGION]
        self._config_entry_id = config.entry_id
        self._values = {
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
            "flow_NSW": 0,
            "flow_QLD": 0,
            "flow_SA": 0,
            "flow_TAS": 0,
            "flow_VIC": 0,
            "last_update": None,
        }
        self._interval = DEFAULT_SCAN_INTERVAL
        _LOGGER.debug(
            "OpenNEM [%s1]: Data will be updated every %s", self._region, self._interval
        )
        super().__init__(
            self.hass, _LOGGER, name=DOMAIN, update_method=self.async_update
        )

    @property
    def region_name(self) -> str:
        """Return Region Name of Coordinator"""
        return self._region

    async def async_update(self) -> dict:
        """Get Latest Date and Update State"""

        data = None
        emdata = None
        fldata = None
        self._values = {
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
            "flow_NSW": 0,
            "flow_QLD": 0,
            "flow_SA": 0,
            "flow_TAS": 0,
            "flow_VIC": 0,
            "last_update": None,
        }
        _LOGGER.debug("OpenNEM [%s]: Default Values - %s", self._region, self._values)

        region = self._region + "1"
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
                _LOGGER.debug("OpenNEM [%s]: Getting State from %s", region, url)
                if remotedata.status == 200:
                    data = await remotedata.json()
                else:
                    _LOGGER.error("OpenNEM [%s]: Issue getting data", region)

            # Emission Factor
#             async with session.get(API_ENDPOINT_EM) as emremotedata:
#                 _LOGGER.debug(
#                     "OpenNEM [%s]: Getting Emissions State from %s",
#                     region,
#                     API_ENDPOINT_EM,
#                 )
#                 if emremotedata.status == 200:
#                     edata = await emremotedata.json()
#                 else:
#                     _LOGGER.error("OpenNEM [%s]: Issue getting emissions data", region)

            # Flow from other Regions
            async with session.get(API_ENDPOINT_FLOW) as flremotedata:
                _LOGGER.debug(
                    "OpenNEM [%s]: Getting Flow State from %s",
                    region,
                    API_ENDPOINT_FLOW,
                )
                if flremotedata.status == 200:
                    fldata = await flremotedata.json()
                else:
                    _LOGGER.error("OpenNEM [%s]: Issue getting flow data", region)

        if data is not None:
            _LOGGER.debug(
                "OpenNEM [%s]: Data Downloaded, Commencing Processing", region
            )
            attrs = {}
            emdata = None
            ffvalue = None
            renvalue = None
            emvalue = None
            genvalue = None
            genvsdemand = None
            value = None
            regiondata = []

            _LOGGER.debug("OpenNEM [%s]: Values Before - %s", region, self._values)

            for row in data["data"]:
                if row["type"] == "power":
                    ftype = row["code"]
                else:
                    ftype = row["type"]

                # units = row["units"]
                # last_update = row["history"]["last"]

                if (row["history"]["data"][-1] != 0 or row["history"]["data"][-1] == None):
                    value = row["history"]["data"][-1]
                elif (row["history"]["data"][-2] != 0 or row["history"]["data"][-2] == None):
                    value = row["history"]["data"][-2]
                else:
                    value = row["history"]["data"][-3]

                if ftype == "imports":
                    value = abs(value)
                if ftype == "exports":
                    value = -abs(value)
                if ftype == "battery_charging":
                    value = -abs(value)

                if value is None:
                    self._values[ftype] = 0.0
                else:
                    self._values[ftype] = round(value, 2)

                regiondata.append(ftype)
                value = None
                ftype = None

            ffvalue = None
            ffvalue = (
                self._values["coal_black"]
                + self._values["distillate"]
                + self._values["coal_brown"]
                + self._values["gas_ccgt"]
                + self._values["gas_ocgt"]
                + self._values["gas_recip"]
                + self._values["gas_steam"]
                + self._values["gas_wcmg"]
            )
            if ffvalue:
                self._values["fossilfuel"] = round(ffvalue, 2)
            else:
                self._values["fossilfuel"] = 0
            regiondata.append("fossilfuel")
            ffvalue = None

            renvalue = None
            renvalue = (
                self._values["bioenergy_biomass"]
                + self._values["bioenergy_biogas"]
                + self._values["hydro"]
                + self._values["solar_utility"]
                + self._values["wind"]
                + self._values["solar_rooftop"]
            )
            if renvalue:
                self._values["renewables"] = round(renvalue, 2)
            else:
                self._values["renewables"] = 0
            regiondata.append("renewables")
            renvalue = None

            genvalue = None
            genvalue = self._values["fossilfuel"] + self._values["renewables"]
            if genvalue:
                self._values["generation"] = round(genvalue, 2)
                self._values["state"] = round(genvalue, 2)
            else:
                self._values["generation"] = 0
                self._values["state"] = 0
            regiondata.append("generation")
            genvalue = None

            genvsdemand = None
            if region == "wa1":
                pass
            else:
                genvsdemand = self._values["generation"] - self._values["demand"]
                if genvsdemand:
                    self._values["genvsdemand"] = round(genvsdemand, 2)
                else:
                    self._values["genvsdemand"] = 0
                regiondata.append("genvsdemand")
                genvsdemand = None

#             # Emission Factor
#             try:
#                 edata
#             except NameError:
#                 pass
#             else:
#                 if region == "wa1":
#                     pass
#                 elif region == "au":
#                     pass
#                 else:
#                     if edata is not None:
#                         if edata["response_status"] == "ERROR":
#                             self._values["emissions_factor"] = 0
#                             regiondata.append("emissions_factor")
#                             _LOGGER.debug("OpenNEM [%s]: Error reported on emissions factor data", region)
#                         else:
#                             for emrow in edata["data"]:
#                                 if region.upper() in emrow["code"]:
#                                     emvalue = emrow["history"]["data"][-1]
#                                     if emvalue == None:
#                                         emvalue = 0
#                                     self._values["emissions_factor"] = round(emvalue, 4)
#                                     regiondata.append("emissions_factor")
#                                     emvalue = None
#                     else:
#                         _LOGGER.debug("OpenNEM [%s]: No Emissions Data Found", region)

            # Flow from other region
            if fldata is not None:
                for frow in fldata["data"]:
                    fcode = frow["code"]
                    fregion = fcode.split("->")
                    if region.upper() in fregion:
                        fregion.remove(region.upper())
                        fregionto = fregion[0].replace("1", "")
                        value = frow["history"]["data"][-1]
                        if value == None:
                            value = 0
                        self._values["flow_" + fregionto] = round(value, 4)
                        regiondata.append("flow_" + fregionto)
                    fregionto = None
                    value = None
            else:
                _LOGGER.debug("OpenNEM [%s]: No Flow Data Found", region)

            if region == "wa1":
                self._values["last_update"] = dt_util.as_utc(
                    datetime.datetime.strptime(
                        str(data["created_at"]), "%Y-%m-%dT%H:%M:%S+08:00"
                    )
                )
            else:
                self._values["last_update"] = dt_util.as_utc(
                    datetime.datetime.strptime(
                        str(data["created_at"]), "%Y-%m-%dT%H:%M:%S+10:00"
                    )
                )
        else:
            _LOGGER.debug("OpenNEM [%s]: No Data Found", region)

        _LOGGER.debug("OpenNEM [%s]: Values After - %s", region, self._values)

        attrs = {}
        regiondata.append("last_update")
        _LOGGER.debug("OpenNEM [%s] Region Attrs: %s", region, regiondata)
        for val in self._values:
            if val in regiondata:
                attrs[val] = self._values[val]
            else:
                pass
        _LOGGER.debug("OpenNEM [%s]: Values to pass to Sensor: %s", region, attrs)

        regiondata = []
        self._values = {
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
            "flow_NSW": 0,
            "flow_QLD": 0,
            "flow_SA": 0,
            "flow_TAS": 0,
            "flow_VIC": 0,
            "last_update": None,
        }
        _LOGGER.debug("OpenNEM [%s]: Temp - %s", region, self._values)
        _LOGGER.debug("OpenNEM [%s]: Values After - %s", region, self._values)
        return attrs
