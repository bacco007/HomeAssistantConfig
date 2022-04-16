"""NSW Covid 19 Data"""
from datetime import timedelta
import logging

from homeassistant.const import (
    ATTR_ATTRIBUTION,
)
from homeassistant.core import callback
from homeassistant.helpers import device_registry, entity
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import HomeAssistantType
from homeassistant.util import slugify
from homeassistant.helpers.typing import StateType
from homeassistant.components import sensor
from homeassistant.components.sensor import SensorEntity

from . import DOMAIN
from .const import (
    ATTR_PUBLISHED,
    ATTR_LOCALLY_ACTIVE,
    ATTR_INTERSTATE_ACTIVE,
    ATTR_OVERSEAS_ACTIVE,
    ATTR_TOTAL_ACTIVE,
    ATTR_LAST_24_HOURS_KNOWN,
    ATTR_LAST_24_HOURS_UNKNOWN,
    ATTR_LAST_24_HOURS_INTERSTATE,
    ATTR_LAST_24_HOURS_OVERSEAS,
    ATTR_LAST_24_HOURS_TOTAL,
    ATTR_LAST_24_HOURS_TESTS,
    ATTR_THIS_WEEK_KNOWN,
    ATTR_THIS_WEEK_UNKNOWN,
    ATTR_THIS_WEEK_INTERSTATE,
    ATTR_THIS_WEEK_OVERSEAS,
    ATTR_THIS_WEEK_TOTAL,
    ATTR_THIS_WEEK_TESTS,
    ATTR_LAST_WEEK_KNOWN,
    ATTR_LAST_WEEK_UNKNOWN,
    ATTR_LAST_WEEK_INTERSTATE,
    ATTR_LAST_WEEK_OVERSEAS,
    ATTR_LAST_WEEK_TOTAL,
    ATTR_LAST_WEEK_TESTS,
    ATTR_THIS_YEAR_KNOWN,
    ATTR_THIS_YEAR_UNKNOWN,
    ATTR_THIS_YEAR_INTERSTATE,
    ATTR_THIS_YEAR_OVERSEAS,
    ATTR_THIS_YEAR_TOTAL,
    ATTR_THIS_YEAR_TESTS,
    ATTR_LAST_24_HOURS_FIRST_DOSE,
    ATTR_LAST_24_HOURS_SECOND_DOSE,
    ATTR_LAST_24_HOURS_TOTAL_DOSE,
    ATTR_TOTAL_FIRST_DOSE,
    ATTR_TOTAL_SECOND_DOSE,
    ATTR_TOTAL_TOTAL_DOSE,
    ATTR_LIVES_LOST,
    ATTR_LIVES_LOST_FEMALE_0_9,
    ATTR_LIVES_LOST_FEMALE_10_19,
    ATTR_LIVES_LOST_FEMALE_20_29,
    ATTR_LIVES_LOST_FEMALE_30_39,
    ATTR_LIVES_LOST_FEMALE_40_49,
    ATTR_LIVES_LOST_FEMALE_50_59,
    ATTR_LIVES_LOST_FEMALE_60_69,
    ATTR_LIVES_LOST_FEMALE_70_79,
    ATTR_LIVES_LOST_FEMALE_80_89,
    ATTR_LIVES_LOST_FEMALE_90_PLUS,
    ATTR_LIVES_LOST_MALE_0_9,
    ATTR_LIVES_LOST_MALE_10_19,
    ATTR_LIVES_LOST_MALE_20_29,
    ATTR_LIVES_LOST_MALE_30_39,
    ATTR_LIVES_LOST_MALE_40_49,
    ATTR_LIVES_LOST_MALE_50_59,
    ATTR_LIVES_LOST_MALE_60_69,
    ATTR_LIVES_LOST_MALE_70_79,
    ATTR_LIVES_LOST_MALE_80_89,
    ATTR_LIVES_LOST_MALE_90_PLUS,
    ATTR_CASES,
    ATTR_CASES_FEMALE_0_9,
    ATTR_CASES_FEMALE_10_19,
    ATTR_CASES_FEMALE_20_29,
    ATTR_CASES_FEMALE_30_39,
    ATTR_CASES_FEMALE_40_49,
    ATTR_CASES_FEMALE_50_59,
    ATTR_CASES_FEMALE_60_69,
    ATTR_CASES_FEMALE_70_79,
    ATTR_CASES_FEMALE_80_89,
    ATTR_CASES_FEMALE_90_PLUS,
    ATTR_CASES_MALE_0_9,
    ATTR_CASES_MALE_10_19,
    ATTR_CASES_MALE_20_29,
    ATTR_CASES_MALE_30_39,
    ATTR_CASES_MALE_40_49,
    ATTR_CASES_MALE_50_59,
    ATTR_CASES_MALE_60_69,
    ATTR_CASES_MALE_70_79,
    ATTR_CASES_MALE_80_89,
    ATTR_CASES_MALE_90_PLUS,
    ATTR_DOSES,
    ATTR_NSW_HEALTH_DOSES_DAILY,
    ATTR_NSW_HEALTH_DOSES_CUMULATIVE,
    ATTR_GP_NETWORK_DOSES_CUMULATIVE,
    ATTR_NSW_HEALTH_DOSES_UPDATED,
    ATTR_GP_NETWORK_DOSES_UPDATED,
    ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE,
    DEVICE_CLASS_COVID_CASES,
    DEVICE_CLASS_COVID_VACCINATIONS,
    NSWHEALTH_NAME,
    MANUFACTURER,
)

ACTIVE_SENSORS = [
    ATTR_PUBLISHED,
    ATTR_LOCALLY_ACTIVE,
    ATTR_INTERSTATE_ACTIVE,
    ATTR_OVERSEAS_ACTIVE,
    ATTR_TOTAL_ACTIVE,
    ATTR_LAST_24_HOURS_KNOWN,
    ATTR_LAST_24_HOURS_UNKNOWN,
    ATTR_LAST_24_HOURS_INTERSTATE,
    ATTR_LAST_24_HOURS_OVERSEAS,
    ATTR_LAST_24_HOURS_TOTAL,
    ATTR_LAST_24_HOURS_TESTS,
    ATTR_THIS_WEEK_KNOWN,
    ATTR_THIS_WEEK_UNKNOWN,
    ATTR_THIS_WEEK_INTERSTATE,
    ATTR_THIS_WEEK_OVERSEAS,
    ATTR_THIS_WEEK_TOTAL,
    ATTR_THIS_WEEK_TESTS,
    ATTR_LAST_WEEK_KNOWN,
    ATTR_LAST_WEEK_UNKNOWN,
    ATTR_LAST_WEEK_INTERSTATE,
    ATTR_LAST_WEEK_OVERSEAS,
    ATTR_LAST_WEEK_TOTAL,
    ATTR_LAST_WEEK_TESTS,
    ATTR_THIS_YEAR_KNOWN,
    ATTR_THIS_YEAR_UNKNOWN,
    ATTR_THIS_YEAR_INTERSTATE,
    ATTR_THIS_YEAR_OVERSEAS,
    ATTR_THIS_YEAR_TOTAL,
    ATTR_THIS_YEAR_TESTS,
    ATTR_LAST_24_HOURS_FIRST_DOSE,
    ATTR_LAST_24_HOURS_SECOND_DOSE,
    ATTR_LAST_24_HOURS_TOTAL_DOSE,
    ATTR_TOTAL_FIRST_DOSE,
    ATTR_TOTAL_SECOND_DOSE,
    ATTR_TOTAL_TOTAL_DOSE,
]

_LOGGER = logging.getLogger(__name__)

DEFAULT_SCAN_INTERVAL = timedelta(minutes=5)
SCAN_INTERVAL = DEFAULT_SCAN_INTERVAL

TIMESTAMP_TYPES = ["nswcoviddate", "date", "time", "datetime", "dateymd"]


async def async_setup_entry(hass: HomeAssistantType, entry, async_add_entities):
    """Configure a dispatcher connection based on a config entry."""

    api = hass.data[DOMAIN][entry.entry_id]

    if not "entity_ref" in hass.data[DOMAIN]:
        hass.data[DOMAIN]["entity_ref"] = {}

    if not "tasks" in hass.data[DOMAIN]:
        hass.data[DOMAIN]["tasks"] = {}

    def device_event_handler(payload):
        event_type = getattr(payload, "event_type", None)
        subject = getattr(payload, "subject", None)
        if not (event_type and subject):
            _LOGGER.warning("Event received with no type or statistic")
            return None
        if not event_type == "statistic_updated":
            return None
        _LOGGER.debug("[%s] %s event received: %s", payload.ts, event_type, payload.id)
        try:
            event_entity = getattr(hass.data[DOMAIN]["entity_ref"], payload.id, None)
            if event_entity:
                event_entity.async_device_changed()
        except Exception as err:
            _LOGGER.error("Unable to send update to HA")
            _LOGGER.exception(err)
            raise err

    hass.data[DOMAIN][entry.entry_id].addListener(device_event_handler)

    entities = []
    for statistic_id in api.statistics:
        statistic = api.statistics[statistic_id]
        if statistic and statistic_id in ACTIVE_SENSORS:
            hass.data[DOMAIN]["entity_ref"][statistic.id] = NSWCovidEntry(statistic)
            entities.append(hass.data[DOMAIN]["entity_ref"][statistic.id])

    hass.data[DOMAIN]["entity_ref"][ATTR_LIVES_LOST] = NSWCovidDeaths(api.statistics)
    hass.data[DOMAIN][entry.entry_id].addListener(
        hass.data[DOMAIN]["entity_ref"][ATTR_LIVES_LOST].event_listener
    )
    entities.append(hass.data[DOMAIN]["entity_ref"][ATTR_LIVES_LOST])

    hass.data[DOMAIN]["entity_ref"][ATTR_CASES] = NSWCovidCases(api.statistics)
    hass.data[DOMAIN][entry.entry_id].addListener(
        hass.data[DOMAIN]["entity_ref"][ATTR_CASES].event_listener
    )
    entities.append(hass.data[DOMAIN]["entity_ref"][ATTR_CASES])

    hass.data[DOMAIN]["entity_ref"][ATTR_DOSES] = NSWCovidDoses(api.statistics)
    hass.data[DOMAIN][entry.entry_id].addListener(
        hass.data[DOMAIN]["entity_ref"][ATTR_DOSES].event_listener
    )
    entities.append(hass.data[DOMAIN]["entity_ref"][ATTR_DOSES])

    async_add_entities(entities)

    hass.data[DOMAIN]["tasks"]["statistic_tracker"] = api.track(interval=SCAN_INTERVAL)


class NSWCovidEntry(RestoreEntity, SensorEntity):
    """Represent a NSW Covid Statistic."""

    def __init__(
        self,
        statistic,
    ):
        """Set up NSW Covid entity."""
        self.__statistic = statistic

    def async_device_changed(self):
        """Send changed data to HA"""
        _LOGGER.debug("%s (%s) advising HA of update", self.name, self.unique_id)
        self.async_schedule_update_ha_state()

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        return False

    @property
    def icon(self):
        try:
            return self.__statistic.iconId
        except AttributeError:
            return "mdi:virus-outline"

    @property
    def name(self):
        """Return the name of the device."""
        if not self.__statistic.name:
            return None
        return f"{NSWHEALTH_NAME} {self.__statistic.name}"

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__statistic.id

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement"""
        if (
            self.__statistic.typeName
            and self.__statistic.typeName is not None
            and self.__statistic.typeName in TIMESTAMP_TYPES
        ):
            return "ISO8601"

        if self.__statistic.unit and self.__statistic.unit == "case":
            return "cases"

        if self.__statistic.unit and self.__statistic.unit == "death":
            return "deaths"

        if self.__statistic.unit and self.__statistic.unit == "dose":
            return "doses"

        if self.__statistic.unit and self.__statistic.unit == "test":
            return "tests"

        return self.__statistic.unit

    @property
    def state(self):
        """Return the sensor native value"""
        _LOGGER.debug(
            "%s returning state: %s", self.__statistic.id, self.__statistic.status
        )
        if not self.__statistic.status:
            return None
        if self.__statistic.typeName in TIMESTAMP_TYPES:
            return self.__statistic.status.isoformat()
        if self.__statistic.typeName == "integer":
            return int(self.__statistic.status)
        if self.__statistic.typeName == "float":
            return float(self.__statistic.status)
        return self.__statistic.status

    @property
    def device_class(self):
        """Return the device class if relevent"""
        if (
            self.__statistic.typeName
            and self.__statistic.typeName is not None
            and self.__statistic.typeName in TIMESTAMP_TYPES
        ):
            return "timestamp"
        return None

    @property
    def state_class(self) -> str:
        """Return the state class if relevent"""
        measurement = getattr(self.__statistic, "measurement", False)
        resetting = getattr(self.__statistic, "resetting", False)
        if measurement and resetting:
            if hasattr(sensor, "STATE_CLASS_TOTAL_INCREASING"):
                return sensor.STATE_CLASS_TOTAL_INCREASING
            return sensor.STATE_CLASS_MEASUREMENT
        elif measurement:
            return sensor.STATE_CLASS_MEASUREMENT
        else:
            return None

    # @property
    # def last_reset(self):
    #     # Per https://developers.home-assistant.io/docs/core/entity/sensor/#long-term-statistics
    #     # Do not send last reset
    #     """Return the state class if relevent"""
    #     resetting = getattr(self.__statistic, "resetting", False)
    #     if not resetting:
    #         return None
    #     return self.__statistic.published

    @property
    def device_state_attributes(self):
        """Return the state attributes of the device."""
        attr = {}
        attr[ATTR_ATTRIBUTION] = self.__statistic.attribution
        attr[ATTR_PUBLISHED] = self.__statistic.published
        return attr

    async def async_update(self):
        """Update NSW Covid Data"""
        await self.__statistic.refresh()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class NSWCovidDeaths(RestoreEntity):
    """Represent a NSW Covid Deaths Sensor."""

    def __init__(
        self,
        statistics,
    ):
        """Set up NSW Covid entity."""
        self.__statistics = statistics
        self.__id = ATTR_LIVES_LOST
        self.__tracked = [
            ATTR_LIVES_LOST_FEMALE_0_9,
            ATTR_LIVES_LOST_FEMALE_10_19,
            ATTR_LIVES_LOST_FEMALE_20_29,
            ATTR_LIVES_LOST_FEMALE_30_39,
            ATTR_LIVES_LOST_FEMALE_40_49,
            ATTR_LIVES_LOST_FEMALE_50_59,
            ATTR_LIVES_LOST_FEMALE_60_69,
            ATTR_LIVES_LOST_FEMALE_70_79,
            ATTR_LIVES_LOST_FEMALE_80_89,
            ATTR_LIVES_LOST_FEMALE_90_PLUS,
            ATTR_LIVES_LOST_MALE_0_9,
            ATTR_LIVES_LOST_MALE_10_19,
            ATTR_LIVES_LOST_MALE_20_29,
            ATTR_LIVES_LOST_MALE_30_39,
            ATTR_LIVES_LOST_MALE_40_49,
            ATTR_LIVES_LOST_MALE_50_59,
            ATTR_LIVES_LOST_MALE_60_69,
            ATTR_LIVES_LOST_MALE_70_79,
            ATTR_LIVES_LOST_MALE_80_89,
            ATTR_LIVES_LOST_MALE_90_PLUS,
        ]

    def async_device_changed(self):
        """Send changed data to HA"""
        _LOGGER.debug("%s (%s) advising HA of update", self.name, self.unique_id)
        self.async_schedule_update_ha_state()

    def event_listener(self, payload):
        """Checks for updates to child stats"""
        if not (
            payload.event_type
            and payload.id
            and payload.event_type == "statistic_updated"
        ):
            return None
        if not payload.id in self.__tracked:
            return None
        self.async_device_changed()
        return True

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        """The device should not poll"""
        return False

    @property
    def icon(self):
        """Return the device icon"""
        return "mdi:grave-stone"

    @property
    def name(self):
        """Return the name of the device."""
        return f"{NSWHEALTH_NAME} Lives Lost"

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement"""
        return "deaths"

    @property
    def state(self):
        """Return the sensor state"""
        deaths = 0
        for statistic_id in self.__tracked:
            _LOGGER.debug("Counting deaths %s", statistic_id)
            if statistic_id in self.__statistics:
                statistic = self.__statistics[statistic_id]
                status = getattr(statistic, "status", 0)
                deaths += status
        _LOGGER.debug("%s returning state: %s", self.__id, deaths)
        return deaths

    @property
    def device_class(self):
        """Return the device class if relevent"""
        return None

    @property
    def state_class(self):
        """Return the state class if relevent"""
        return sensor.STATE_CLASS_MEASUREMENT

    @property
    def device_state_attributes(self):
        """Return the state attributes of the device."""
        attr = {}
        attr[ATTR_ATTRIBUTION] = None
        for statistic_id in self.__tracked:
            _LOGGER.debug("Attributes checking %s", statistic_id)
            if statistic_id in self.__statistics:
                statistic = self.__statistics[statistic_id]
                status = getattr(statistic, "status", 0)
                if not attr[ATTR_ATTRIBUTION]:
                    attribution = getattr(statistic, "attribution", None)
                    if attribution:
                        attr[ATTR_ATTRIBUTION] = attribution
                _LOGGER.debug("Attributes status %s: %s", statistic_id, status)
                attr[statistic_id] = status
        return attr

    async def async_update(self):
        """Update NSW Covid Data"""
        for statistic_id in self.__tracked:
            statistic = getattr(self.__statistics, statistic_id, None)
            if statistic:
                await statistic.refresh()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class NSWCovidCases(RestoreEntity):
    """Represent a NSW Covid Cases Sensor."""

    def __init__(
        self,
        statistics,
    ):
        """Set up NSW Covid Cases entity."""
        self.__statistics = statistics
        self.__id = ATTR_CASES
        self.__tracked = [
            ATTR_CASES_FEMALE_0_9,
            ATTR_CASES_FEMALE_10_19,
            ATTR_CASES_FEMALE_20_29,
            ATTR_CASES_FEMALE_30_39,
            ATTR_CASES_FEMALE_40_49,
            ATTR_CASES_FEMALE_50_59,
            ATTR_CASES_FEMALE_60_69,
            ATTR_CASES_FEMALE_70_79,
            ATTR_CASES_FEMALE_80_89,
            ATTR_CASES_FEMALE_90_PLUS,
            ATTR_CASES_MALE_0_9,
            ATTR_CASES_MALE_10_19,
            ATTR_CASES_MALE_20_29,
            ATTR_CASES_MALE_30_39,
            ATTR_CASES_MALE_40_49,
            ATTR_CASES_MALE_50_59,
            ATTR_CASES_MALE_60_69,
            ATTR_CASES_MALE_70_79,
            ATTR_CASES_MALE_80_89,
            ATTR_CASES_MALE_90_PLUS,
        ]

    def async_device_changed(self):
        """Send changed data to HA"""
        _LOGGER.debug("%s (%s) advising HA of update", self.name, self.unique_id)
        self.async_schedule_update_ha_state()

    def event_listener(self, payload):
        """Checks for updates to child stats"""
        if not (
            payload.event_type
            and payload.id
            and payload.event_type == "statistic_updated"
        ):
            return None
        if not payload.id in self.__tracked:
            return None
        self.async_device_changed()
        return True

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        """The device should not poll"""
        return False

    @property
    def icon(self):
        """Return the device icon"""
        return "mdi:emoticon-sick"

    @property
    def name(self):
        """Return the name of the device."""
        return f"{NSWHEALTH_NAME} Cases"

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement"""
        return "cases"

    @property
    def state(self):
        """Return the sensor state"""
        cases = 0
        for statistic_id in self.__tracked:
            _LOGGER.debug("Counting cases %s", statistic_id)
            if statistic_id in self.__statistics:
                statistic = self.__statistics[statistic_id]
                status = getattr(statistic, "status", 0)
                cases += status
        _LOGGER.debug("%s returning state: %s", self.__id, cases)
        return cases

    @property
    def device_class(self):
        """Return the device class if relevent"""
        return None

    @property
    def state_class(self):
        """Return the state class if relevent"""
        return sensor.STATE_CLASS_MEASUREMENT

    @property
    def device_state_attributes(self):
        """Return the state attributes of the device."""
        attr = {}
        attr[ATTR_ATTRIBUTION] = None
        for statistic_id in self.__tracked:
            _LOGGER.debug("Attributes checking %s", statistic_id)
            if statistic_id in self.__statistics:
                statistic = self.__statistics[statistic_id]
                status = getattr(statistic, "status", 0)
                if not attr[ATTR_ATTRIBUTION]:
                    attribution = getattr(statistic, "attribution", None)
                    if attribution:
                        attr[ATTR_ATTRIBUTION] = attribution
                _LOGGER.debug("Attributes status %s: %s", statistic_id, status)
                attr[statistic_id] = status
        return attr

    async def async_update(self):
        """Update NSW Covid Data"""
        for statistic_id in self.__tracked:
            statistic = getattr(self.__statistics, statistic_id, None)
            if statistic:
                await statistic.refresh()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()


class NSWCovidDoses(RestoreEntity):
    """Represent a NSW Covid Dose Sensor."""

    def __init__(
        self,
        statistics,
    ):
        """Set up NSW Covid Cases entity."""
        self.__statistics = statistics
        self.__id = ATTR_DOSES
        self.__tracked = [
            ATTR_NSW_HEALTH_DOSES_DAILY,
            ATTR_NSW_HEALTH_DOSES_CUMULATIVE,
            ATTR_GP_NETWORK_DOSES_CUMULATIVE,
            ATTR_NSW_HEALTH_DOSES_UPDATED,
            ATTR_GP_NETWORK_DOSES_UPDATED,
            ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE,
        ]

    def async_device_changed(self):
        """Send changed data to HA"""
        _LOGGER.debug("%s (%s) advising HA of update", self.name, self.unique_id)
        self.async_schedule_update_ha_state()

    def event_listener(self, payload):
        """Checks for updates to child stats"""
        if not (
            payload.event_type
            and payload.id
            and payload.event_type == "statistic_updated"
        ):
            return None
        if not payload.id in self.__tracked:
            return None
        self.async_device_changed()
        return True

    @property
    def device_info(self):
        """Return the device_info of the device."""
        return {
            "identifiers": {(DOMAIN, self.unique_id)},
            "name": self.name,
            "manufacturer": MANUFACTURER,
        }

    @property
    def should_poll(self):
        """The device should not poll"""
        return False

    @property
    def icon(self):
        """Return the device icon"""
        return "mdi:needle"

    @property
    def name(self):
        """Return the name of the device."""
        return f"{NSWHEALTH_NAME} Doses"

    @property
    def unique_id(self):
        """Return the unique ID."""
        return self.__id

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement"""
        return "doses"

    @property
    def available(self):
        """Return the sensor available flag"""
        if not ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE in self.__statistics:
            return False
        return True

    @property
    def state(self):
        """Return the sensor state"""
        if not ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE in self.__statistics:
            return None
        return self.__statistics[ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE].status

    @property
    def device_class(self):
        """Return the device class if relevent"""
        return None

    @property
    def device_state_attributes(self):
        """Return the state attributes of the device."""
        attr = {}
        attr[ATTR_ATTRIBUTION] = None
        for statistic_id in self.__tracked:
            _LOGGER.debug("Attributes checking %s", statistic_id)
            if (
                statistic_id in self.__statistics
                and statistic_id != ATTR_ALL_PROVIDERS_DOSES_CUMULATIVE
            ):
                statistic = self.__statistics[statistic_id]
                status = getattr(statistic, "status", 0)
                if not attr[ATTR_ATTRIBUTION]:
                    attribution = getattr(statistic, "attribution", None)
                    if attribution:
                        attr[ATTR_ATTRIBUTION] = attribution
                _LOGGER.debug("Attributes status %s: %s", statistic_id, status)
                attr[statistic_id] = status
        return attr

    async def async_update(self):
        """Update NSW Covid Dose Data"""
        for statistic_id in self.__tracked:
            statistic = getattr(self.__statistics, statistic_id, None)
            if statistic:
                await statistic.refresh()

    async def async_added_to_hass(self):
        """Register state update callback."""
        await super().async_added_to_hass()

    async def async_will_remove_from_hass(self):
        """Clean up after entity before removal."""
        await super().async_will_remove_from_hass()
