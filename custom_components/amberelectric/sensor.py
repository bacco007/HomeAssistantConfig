from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import ATTR_ATTRIBUTION, CONF_NAME
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle
import homeassistant.util.dt as dt_util
import voluptuous as vol
import datetime
from .ambermodel import AmberData, PeriodType, PeriodSource
import requests
import json
from datetime import timedelta
import base64
import logging


SCAN_INTERVAL = timedelta(minutes=5)
URL = "https://api.amberelectric.com.au/prices/listprices"
UNIT_NAME = "c/kWh"
CONF_POSTCODE = "postcode"
CONF_NETWORK_NAME = "network_name"

ATTRIBUTION = "Data provided by the Amber Electric pricing API"
ATTR_LAST_UPDATE = "last_update"
ATTR_SENSOR_ID = "sensor_id"
ATTR_POSTCODE = "postcode"
ATTR_GRID_NAME = "grid_name"
ATTR_PRICE_FORCECAST = "price_forcecast"
CONST_SOLARFIT = "amberSolarFIT"
CONST_GENRALUSE = "amberGeneralUsage"
CONST_CONTROLLOAD = "amberControlLoad"

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_NAME): cv.string,
        vol.Required(CONF_POSTCODE): cv.string,
        vol.Optional(CONF_NETWORK_NAME): cv.string
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):

    postcode = config.get(CONF_POSTCODE)
    network_name = config.get(CONF_NETWORK_NAME)
    amber_data = None
    if(postcode):
        add_entities(
            [
                AmberPricingSensor(amber_data, postcode, network_name, CONST_SOLARFIT,
                                   "Amber solar feed in tariff", "mdi:solar-power"),
                AmberPricingSensor(amber_data, postcode, network_name, CONST_GENRALUSE,
                                   "Amber general usage price", "mdi:transmission-tower"),
                AmberPricingSensor(amber_data, postcode, network_name, CONST_CONTROLLOAD,
                                   "Amber controlled load price", "mdi:water-boiler")
            ]
        )


class AmberPricingSensor(Entity):
    """ Entity object for Amber Electric sensor."""

    def __init__(self, amber_data, postcode, network_name, sensor_type, friendly_name, icon):
        self.postcode = postcode
        self.network_name = network_name
        self.amber_data = amber_data
        self.price_updated_datetime = None
        self.network_provider = None
        self.sensor_type = sensor_type
        self.friendly_name = friendly_name
        self.icon_uri = icon
        self.update()

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return self.icon_uri

    @property
    def name(self):
        """Return the name of the sensor."""
        return self.friendly_name

    @property
    def state(self):
        """Return the state of the sensor."""
        if self.amber_data is None:
            return 0

        current_price = list(filter(lambda price: price.period_type == PeriodType.ACTUAL, self.amber_data.data.variable_prices_and_renewables))
        current_price.sort(key=lambda p: p.period)

        if(self.sensor_type == CONST_GENRALUSE):
            return self.calc_amber_price(self.amber_data.data.static_prices.e1.totalfixed_kwh_price, self.amber_data.data.static_prices.e1.loss_factor, current_price[len(current_price)-1].wholesale_kwh_price)
        if(self.sensor_type == CONST_SOLARFIT):      
            return self.calc_amber_price(self.amber_data.data.static_prices.b1.totalfixed_kwh_price, self.amber_data.data.static_prices.b1.loss_factor, current_price[len(current_price)-1].wholesale_kwh_price)
        if(self.sensor_type == CONST_CONTROLLOAD):
            if(self.amber_data.data.static_prices.e2.totalfixed_kwh_price is not None):
                return round(float(self.amber_data.data.static_prices.e2.totalfixed_kwh_price),2)
           
        return 0

    @ property
    def device_state_attributes(self):

        data = {}

        data[ATTR_ATTRIBUTION] = ATTRIBUTION
        now = datetime.datetime.now()
        data[ATTR_SENSOR_ID] = self.sensor_type
        data[ATTR_LAST_UPDATE] = now.strftime("%Y-%m-%d %H:%M:%S")
        data[ATTR_GRID_NAME] = self.network_provider
        data[ATTR_POSTCODE] = self.postcode

        if (self.amber_data is not None):
            future_pricing = []
            data[ATTR_PRICE_FORCECAST] = future_pricing
            for price_entry in list(filter(lambda price: price.period_type == PeriodType.FORECAST, self.amber_data.data.variable_prices_and_renewables)):
                entry = {}
                entry["pricing_period_type"] = str(
                    price_entry.period_type.value)
                entry["pricing_period"] = price_entry.period.strftime(
                    "%Y-%m-%d %H:%M:%S")
                entry["renewable_percentage"] = round(
                    float(price_entry.renewables_percentage), 2)
                if(self.sensor_type == CONST_GENRALUSE):
                    entry["price"] = self.calc_amber_price(self.amber_data.data.static_prices.e1.totalfixed_kwh_price,
                                                           self.amber_data.data.static_prices.e1.loss_factor, price_entry.wholesale_kwh_price)
                if(self.sensor_type == CONST_SOLARFIT):
                    entry["price"] = self.calc_amber_price(self.amber_data.data.static_prices.b1.totalfixed_kwh_price,
                                                               self.amber_data.data.static_prices.b1.loss_factor, price_entry.wholesale_kwh_price)
                future_pricing.append(entry)

        return data

    def calc_amber_price(self, fixed_price, loss_factor, variable_price):
        return round(
            float(fixed_price)
            + float(loss_factor)
            * float(variable_price),
            2,
        )

    @ property
    def unit_of_measurement(self):
        """Return the unit of measurement of this entity, if any."""
        return UNIT_NAME

    @ Throttle(SCAN_INTERVAL)
    def update(self):
        """Get the Amber Electric data from the REST API"""
        params = {"postcode": self.postcode}
        if self.network_name != None:
            params["networkName"] = self.network_name

        response = requests.post(URL, json.dumps(params))
        _LOGGER.debug(response.text)
        response_json = json.loads(response.text)
        # When searching by network name, the postcode will come back empty, so fill it in from the config.
        # This is easier than making it optional in the model
        if response_json["data"]["postcode"] == "":
            response_json["data"]["postcode"] = self.postcode

        self.amber_data = AmberData.from_dict(response_json)

        if self.amber_data is not None:
            self.price_updated_datetime = self.amber_data.data.variable_prices_and_renewables[
                0
            ].created_at
            self.network_provider = self.amber_data.data.network_provider
