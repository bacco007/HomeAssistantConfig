# NSW Rural Fire Service Fire Danger - Data Coordinators.
import logging
from abc import abstractmethod
from datetime import timedelta
from typing import Any

import xmltodict
from homeassistant.components.rest import RestData
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_SCAN_INTERVAL, MAJOR_VERSION, MINOR_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.json import json_loads
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from pyexpat import ExpatError

from .const import (
    CONF_CONVERT_NO_RATING,
    CONF_DISTRICT_NAME,
    DEFAULT_CONVERT_NO_RATING,
    DEFAULT_ENCODING,
    DEFAULT_METHOD,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    JSON_AREA_NAME,
    JSON_FIRE_WEATHER_AREA_RATINGS,
    JSON_SENSOR_ATTRIBUTES,
    URL_DATA,
    XML_DISTRICT,
    XML_FIRE_DANGER_MAP,
    XML_NAME,
    XML_SENSOR_ATTRIBUTES,
)

_LOGGER = logging.getLogger(__name__)


class NswRfsFireDangerFeedCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Feed Entity Manager for NSW Rural Fire Service Fire Danger feed."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the Feed Entity Manager."""
        self.hass = hass
        self._district_name = config_entry.data[CONF_DISTRICT_NAME]
        self._convert_no_rating = config_entry.data.get(
            CONF_CONVERT_NO_RATING, DEFAULT_CONVERT_NO_RATING
        )
        self._rest: RestData | None = None
        # Distinguish multiple cases:
        # 1. If version >= 2023.5: 10 arguments
        # 2. If version == 2023.4: 9 arguments
        # 3. If version <= 2023.3: 8 arguments
        if MAJOR_VERSION >= 2023 and MINOR_VERSION >= 5:
            from homeassistant.components.rest.const import DEFAULT_SSL_CIPHER_LIST

            self._rest = RestData(
                hass,
                DEFAULT_METHOD,
                URL_DATA[self._data_feed_type()],
                DEFAULT_ENCODING,
                None,
                None,
                None,
                None,
                DEFAULT_VERIFY_SSL,
                DEFAULT_SSL_CIPHER_LIST,
            )
        elif MAJOR_VERSION == 2023 and MINOR_VERSION == 4:
            self._rest = RestData(
                hass,
                DEFAULT_METHOD,
                URL_DATA[self._data_feed_type()],
                DEFAULT_ENCODING,
                None,
                None,
                None,
                None,
                DEFAULT_VERIFY_SSL,
            )
        else:
            self._rest = RestData(
                hass,
                DEFAULT_METHOD,
                URL_DATA[self._data_feed_type()],
                None,
                None,
                None,
                None,
                DEFAULT_VERIFY_SSL,
            )
        super().__init__(
            self.hass,
            _LOGGER,
            name=DOMAIN,
            update_method=self.async_update,
            update_interval=timedelta(seconds=config_entry.data[CONF_SCAN_INTERVAL]),
        )

    @abstractmethod
    def _data_feed_type(self) -> str:
        """Return the data feed type that this coordinator supports."""

    @property
    def district_name(self) -> str:
        """Return the district name of the coordinator."""
        return self._district_name

    @abstractmethod
    async def _parse_data(self, value) -> dict[str, str]:
        """Get the latest data from external feed and update the state."""

    async def async_update(self) -> dict[str, str]:
        """Get the latest data from external feed and update the state."""
        _LOGGER.debug("Start updating feed")
        await self._rest.async_update()
        value = self._rest.data
        return await self._parse_data(value)


class NswRfsFireDangerStandardFeedCoordinator(NswRfsFireDangerFeedCoordinator):
    """Feed Entity Manager for NSW Rural Fire Service Fire Danger standard feed."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the standard Feed Entity Manager."""
        super().__init__(hass, config_entry)

    def _data_feed_type(self) -> str:
        """Return the data feed type that this coordinator supports."""
        return "standard"

    @staticmethod
    def _attribute_in_structure(obj, keys):
        """Return the attribute found under the chain of keys."""
        key = keys.pop(0)
        if key in obj:
            return (
                NswRfsFireDangerStandardFeedCoordinator._attribute_in_structure(
                    obj[key], keys
                )
                if keys
                else obj[key]
            )

    async def _parse_data(self, value) -> dict[str, str]:
        """Parse data and extract relevant information."""
        attributes = {}
        if value:
            try:
                # Turn XML payload into dict.
                value = xmltodict.parse(value)
                districts = self._attribute_in_structure(
                    value, [XML_FIRE_DANGER_MAP, XML_DISTRICT]
                )
                if districts and isinstance(districts, list):
                    for district in districts:
                        if XML_NAME in district:
                            district_name = district.get(XML_NAME)
                            # Workaround for ACT to make it work with the changed based district names.
                            if district_name == "The Australian Capital Territory":
                                district_name = "ACT"
                            if district_name == self._district_name:
                                # Found it.
                                for key in XML_SENSOR_ATTRIBUTES:
                                    if key in district:
                                        text_value = district.get(key)
                                        conversion = XML_SENSOR_ATTRIBUTES[key][1]
                                        if conversion:
                                            text_value = conversion(
                                                text_value, self._convert_no_rating
                                            )
                                        attributes[
                                            XML_SENSOR_ATTRIBUTES[key][0]
                                        ] = text_value
                                break
            except ExpatError as ex:
                _LOGGER.warning("Unable to parse feed data: %s", ex)
        return attributes


class NswRfsFireDangerExtendedFeedCoordinator(NswRfsFireDangerFeedCoordinator):
    """Feed Entity Manager for NSW Rural Fire Service Fire Danger extended feed."""

    def _data_feed_type(self) -> str:
        """Return the data feed type that this coordinator supports."""
        return "extended"

    async def _parse_data(self, value) -> dict[str, str]:
        """Parse data and extract relevant information."""
        attributes = {}
        if value:
            try:
                # Turn JSON payload into dict.
                json_dict = json_loads(value)
                if JSON_FIRE_WEATHER_AREA_RATINGS in json_dict:
                    _LOGGER.debug("Parsing: %s", json_dict)
                    districts = json_dict[JSON_FIRE_WEATHER_AREA_RATINGS]
                    if districts and isinstance(districts, list):
                        for district in districts:
                            if JSON_AREA_NAME in district:
                                district_name = district.get(JSON_AREA_NAME)
                                # Workaround for ACT to make it work with the changed based district names.
                                if district_name == "The Australian Capital Territory":
                                    district_name = "ACT"
                                if district_name == self._district_name:
                                    # Found it.
                                    for key in JSON_SENSOR_ATTRIBUTES:
                                        if key in district:
                                            text_value = district.get(key)
                                            # Don't process empty strings.
                                            if text_value:
                                                conversion = JSON_SENSOR_ATTRIBUTES[
                                                    key
                                                ][1]
                                                if conversion:
                                                    text_value = conversion(
                                                        text_value,
                                                        self._convert_no_rating,
                                                    )
                                                attributes[
                                                    JSON_SENSOR_ATTRIBUTES[key][0]
                                                ] = text_value
                                    break
            except ValueError:
                _LOGGER.warning("REST result could not be parsed as JSON")
                _LOGGER.debug("Erroneous JSON: %s", value)
        return attributes
