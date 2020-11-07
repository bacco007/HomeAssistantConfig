"""Amber Electric Sensor"""
from datetime import datetime, timedelta
import logging

import voluptuous as vol

from homeassistant.const import (
    ATTR_ATTRIBUTION,
    ATTR_UNIT_OF_MEASUREMENT,
    DEVICE_CLASS_ENERGY,
    ENERGY_KILO_WATT_HOUR,
    CONF_NAME,
    EVENT_HOMEASSISTANT_START,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import callback
from homeassistant.helpers import entity_platform
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import HomeAssistantType


from .const import (
    DOMAIN,
    ATTR_NEM_TIME,
    ATTR_PERCENTILE_RANK,
    ATTR_PERIOD_DELTA,
    ATTR_PERIOD_TYPE,
    ATTR_PERIOD_START,
    ATTR_PERIOD_END,
    ATTR_WHOLESALE_KWH_PRICE,
    ATTR_RENEWABLES_PERCENTAGE,
    CURRENCY_AUD,
    LOSS_FACTOR,
    AMBER_DAILY_PRICE,
    GREEN_KWH_PRICE,
    LOSS_FACTOR,
    MARKET_KWH_PRICE,
    NETWORK_DAILY_PRICE,
    NETWORK_KWH_PRICE,
    NETWORK_PROVIDER,
    OFFSET_KWH_PRICE,
    TOTAL_DAILY_PRICE,
    TOTAL_FIXED_KWH_PRICE,
    MANUFACTURER,
)


_LOGGER = logging.getLogger(__name__)

DEFAULT_SCAN_INTERVAL = timedelta(seconds=30)
SCAN_INTERVAL = DEFAULT_SCAN_INTERVAL


async def async_setup_entry(hass: HomeAssistantType, entry, async_add_entities):
    """Configure a dispatcher connection based on a config entry."""

    api = hass.data[DOMAIN][entry.entry_id]

    if not "entity_ref" in hass.data[DOMAIN]:
        hass.data[DOMAIN]["entity_ref"] = {}

    if not "tasks" in hass.data[DOMAIN]:
        hass.data[DOMAIN]["tasks"] = {}

    hass.data[DOMAIN]["entity_ref"][
        f"{api.postcode}_usage"
    ] = AmberElectricUsagePriceSensor(price_type="USAGE", api=api)
    hass.data[DOMAIN]["entity_ref"][
        f"{api.postcode}_export"
    ] = AmberElectricUsagePriceSensor(price_type="EXPORT", api=api)
    hass.data[DOMAIN]["entity_ref"][
        f"{api.postcode}_market_consumption"
    ] = AmberElectricMarketConsumption(api=api)
    hass.data[DOMAIN]["entity_ref"][
        f"{api.postcode}_market_solar"
    ] = AmberElectricMarketSolar(api=api)

    def device_event_handler(event_data):
        if not (event_data):
            _LOGGER.warning("Event received with no event data")
            return None
        _LOGGER.debug(
            "%s Usage price: %s",
            event_data["market"].postcode,
            event_data["market"].usage_price,
        )
        _LOGGER.debug(
            "%s Export price: %s",
            event_data["market"].postcode,
            event_data["market"].export_price,
        )
        _LOGGER.debug(
            "%s Current demand: %s",
            event_data["market"].postcode,
            event_data["market"].latest.operational_demand,
        )
        _LOGGER.debug(
            "%s Solar generation: %s",
            event_data["market"].postcode,
            event_data["market"].latest.rooftop_solar,
        )

        for entity_id in hass.data[DOMAIN]["entity_ref"]:
            try:
                hass.data[DOMAIN]["entity_ref"][entity_id].async_device_changed()
            except Exception as err:
                _LOGGER.error("Unable to send update to HA")
                _LOGGER.exception(err)
                raise err

    entities = list()
    for entity_id in hass.data[DOMAIN]["entity_ref"]:
        _LOGGER.debug(
            "Adding entity %s (%s) to list with state: %s",
            hass.data[DOMAIN]["entity_ref"][entity_id].name,
            hass.data[DOMAIN]["entity_ref"][entity_id].unique_id,
            hass.data[DOMAIN]["entity_ref"][entity_id].state,
        )
        entities.append(hass.data[DOMAIN]["entity_ref"][entity_id])

    async_add_entities(entities)

    hass.data[DOMAIN]["tasks"]["update_tracker"] = api.poll_for_updates(
        interval=SCAN_INTERVAL, event_receiver=device_event_handler
    )


class AmberElectricMarketConsumption(RestoreEntity):
    """Represent Amber Electric Market Consumption Data."""

    def __init__(self, api=None):
        """Set up Amber Electric Market Consumption Entity."""
        super().__init__()
        self.__api = api
        self.__name = f"{self.__api.postcode} Market Consumption"
        self.__id = f"{self.__api.postcode}_market_consumption"

    def async_device_changed(self):
        """Send changed data to HA"""
        delta = getattr(self.__api.market.latest, ATTR_PERIOD_DELTA, None)
        if delta:
            delta = delta.total_seconds()
        _LOGGER.debug(
            "%s (%s) advising HA of update: %s/%d",
            self.name,
            self.unique_id,
            self.state,
            delta,
        )
        self.async_schedule_update_ha_state()

    @property
    def state(self):
        return self.__api.market.latest.operational_demand

    @property
    def unit_of_measurement(self):
        """Return the unit the value is expressed in."""
        return ENERGY_KILO_WATT_HOUR

    @property
    def device_class(self):
        """Return the device class of the sensor."""
        return DEVICE_CLASS_ENERGY

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "model": "Market Consumption",
            "sw_version": None,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        return False

    @property
    def icon(self):
        return "mdi:flash"

    @property
    def device_state_attributes(self):
        """Return device specific attributes."""
        data = dict()
        data[ATTR_ATTRIBUTION] = "© Amber Electric Pty Ltd ABN 98 623 603 805"
        if self.__api.market.nem_time:
            data[ATTR_NEM_TIME] = self.__api.market.nem_time.isoformat()
        data[NETWORK_PROVIDER] = self.__api.market.network_provider
        data[ATTR_PERCENTILE_RANK] = getattr(
            self.__api.market.latest, ATTR_PERCENTILE_RANK, None
        )
        data[ATTR_PERIOD_DELTA] = getattr(
            self.__api.market.latest, ATTR_PERIOD_DELTA, None
        )
        if data[ATTR_PERIOD_DELTA]:
            data[ATTR_PERIOD_DELTA] = data[ATTR_PERIOD_DELTA].total_seconds()
        data[ATTR_PERIOD_START] = getattr(
            self.__api.market.latest, ATTR_PERIOD_START, None
        )
        if data[ATTR_PERIOD_START]:
            data[ATTR_PERIOD_START] = data[ATTR_PERIOD_START].isoformat()
        data[ATTR_PERIOD_END] = getattr(
            self.__api.market.latest, ATTR_PERIOD_END, None
        )
        if data[ATTR_PERIOD_END]:
            data[ATTR_PERIOD_END] = data[ATTR_PERIOD_END].isoformat()
        data[ATTR_PERIOD_TYPE] = getattr(
            self.__api.market.latest, ATTR_PERIOD_TYPE, None
        )
        data[ATTR_WHOLESALE_KWH_PRICE] = getattr(
            self.__api.market.latest, ATTR_WHOLESALE_KWH_PRICE, None
        )
        return data

    @property
    def name(self):
        """Return the name of the device."""
        return self.__name

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    async def async_update(self):
        """Update Amber Electric Data"""
        await self.__api.market.update()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class AmberElectricMarketSolar(RestoreEntity):
    """Represent Amber Electric Market Solar Data."""

    def __init__(self, api=None):
        """Set up Amber Electric Market Solar Entity."""
        super().__init__()
        self.__api = api
        self.__name = f"{self.__api.postcode} Market Solar"
        self.__id = f"{self.__api.postcode}_market_solar"

    def async_device_changed(self):
        """Send changed data to HA"""
        delta = getattr(self.__api.market.latest, ATTR_PERIOD_DELTA, None)
        if delta:
            delta = delta.total_seconds()
        _LOGGER.debug(
            "%s (%s) advising HA of update: %s/%d",
            self.name,
            self.unique_id,
            self.state,
            delta,
        )
        self.async_schedule_update_ha_state()

    @property
    def state(self):
        return self.__api.market.latest.rooftop_solar

    @property
    def unit_of_measurement(self):
        """Return the unit the value is expressed in."""
        return ENERGY_KILO_WATT_HOUR

    @property
    def device_class(self):
        """Return the device class of the sensor."""
        return DEVICE_CLASS_ENERGY

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "model": "Market Rooftop Solar",
            "sw_version": None,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        return False

    @property
    def icon(self):
        return "mdi:solar-power"

    @property
    def device_state_attributes(self):
        """Return device specific attributes."""
        data = dict()
        data[ATTR_ATTRIBUTION] = "© Amber Electric Pty Ltd ABN 98 623 603 805"
        if self.__api.market.nem_time:
            data[ATTR_NEM_TIME] = self.__api.market.nem_time.isoformat()
        data[NETWORK_PROVIDER] = self.__api.market.network_provider
        data[ATTR_RENEWABLES_PERCENTAGE] = getattr(
            self.__api.market.latest, ATTR_RENEWABLES_PERCENTAGE, None
        )
        data[ATTR_PERIOD_DELTA] = getattr(
            self.__api.market.latest, ATTR_PERIOD_DELTA, None
        )
        if data[ATTR_PERIOD_DELTA]:
            data[ATTR_PERIOD_DELTA] = data[ATTR_PERIOD_DELTA].total_seconds()
        data[ATTR_PERIOD_START] = getattr(
            self.__api.market.latest, ATTR_PERIOD_START, None
        )
        if data[ATTR_PERIOD_START]:
            data[ATTR_PERIOD_START] = data[ATTR_PERIOD_START].isoformat()
        data[ATTR_PERIOD_END] = getattr(
            self.__api.market.latest, ATTR_PERIOD_END, None
        )
        if data[ATTR_PERIOD_END]:
            data[ATTR_PERIOD_END] = data[ATTR_PERIOD_END].isoformat()
        data[ATTR_PERIOD_TYPE] = getattr(
            self.__api.market.latest, ATTR_PERIOD_TYPE, None
        )
        return data

    @property
    def name(self):
        """Return the name of the device."""
        return self.__name

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    async def async_update(self):
        """Update Amber Electric Data"""
        await self.__api.market.update()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class AmberElectricPriceSensor(RestoreEntity):
    """Represent a Amber Electric pricing."""

    def __init__(self, price_type="USAGE", api=None):
        """Set up Amber Electric pricing."""
        super().__init__()
        self.__api = api
        self.__price_type = price_type
        if self.__price_type == "USAGE":
            self.__price = "usage_price"
            self.__ancillary_data = "e1"
            self.__name = f"{self.__api.postcode} usage market rate"
            self.__id = f"{self.__api.postcode}_usage_market"
            self.__price_modifier = 1
        elif self.__price_type == "EXPORT":
            self.__price = "export_price"
            self.__ancillary_data = "b1"
            self.__name = f"{self.__api.postcode} export market rate"
            self.__id = f"{self.__api.postcode}_export_market"
            self.__price_modifier = -1
        else:
            _LOGGER.error("Unknown price type: %s", price_type)

    def async_device_changed(self):
        """Send changed data to HA"""
        _LOGGER.debug(
            "%s (%s) advising HA of update: %s", self.name, self.unique_id, self.state
        )
        self.async_schedule_update_ha_state()

    @property
    def state(self):
        if not self.__price:
            return None
        price = getattr(self.__api.market, self.__price, None)
        if price is not None and price != 0:
            return round(price * self.__price_modifier, 4)
        return 0

    @property
    def unit_of_measurement(self):
        """Return the unit the value is expressed in."""
        return CURRENCY_AUD

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "model": f"Market {self.__price_type}",
            "sw_version": None,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        return False

    @property
    def icon(self):
        return "mdi:currency-usd"

    @property
    def device_state_attributes(self):
        """Return device specific attributes."""
        ancillary_data = getattr(self.__api.market, self.__ancillary_data, None)
        data = dict()
        data[ATTR_ATTRIBUTION] = "© Amber Electric Pty Ltd ABN 98 623 603 805"
        if self.__api.market.nem_time:
            data[ATTR_NEM_TIME] = self.__api.market.nem_time.isoformat()
        data[NETWORK_PROVIDER] = self.__api.market.network_provider

        if not ancillary_data:
            return data

        data[LOSS_FACTOR] = ancillary_data.loss_factor
        data[AMBER_DAILY_PRICE] = ancillary_data.amber_daily_price
        data[GREEN_KWH_PRICE] = ancillary_data.green_kwh_price
        data[LOSS_FACTOR] = ancillary_data.loss_factor
        data[MARKET_KWH_PRICE] = ancillary_data.market_kwh_price
        data[NETWORK_DAILY_PRICE] = ancillary_data.network_daily_price
        data[NETWORK_KWH_PRICE] = ancillary_data.network_kwh_price
        data[OFFSET_KWH_PRICE] = ancillary_data.offset_kwh_price
        data[TOTAL_DAILY_PRICE] = ancillary_data.total_daily_price
        data[TOTAL_FIXED_KWH_PRICE] = ancillary_data.total_fixed_kwh_price
        return data

    @property
    def name(self):
        """Return the name of the device."""
        return self.__name

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    async def async_update(self):
        """Update Amber Electric Data"""
        await self.__api.market.update()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class AmberElectricUsagePriceSensor(AmberElectricPriceSensor):
    pass


class AmberElectricExportPriceSensor(AmberElectricPriceSensor):
    pass