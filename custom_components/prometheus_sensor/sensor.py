"""Prometheus Sensor component."""

from __future__ import annotations

from typing import TYPE_CHECKING, Final

import voluptuous as vol

from homeassistant.components.sensor import (
    CONF_STATE_CLASS,
    PLATFORM_SCHEMA as SENSOR_PLATFORM_SCHEMA,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import (
    CONF_DEVICE_CLASS,
    CONF_NAME,
    CONF_UNIQUE_ID,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_URL,
)
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv

from . import Prometheus

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback
    from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

    from . import QueryResult

from .const import CONF_EXPR, CONF_QUERIES, DEFAULT_URL, SCAN_INTERVAL as SCAN_INTERVAL

_QUERY_SCHEMA: Final = vol.Schema(
    {
        vol.Required(CONF_NAME): cv.string,
        vol.Optional(CONF_UNIQUE_ID): cv.string,
        vol.Optional(CONF_UNIT_OF_MEASUREMENT): cv.string,
        vol.Required(CONF_EXPR): cv.string,
        vol.Optional(CONF_DEVICE_CLASS): vol.Coerce(SensorDeviceClass),
        vol.Optional(CONF_STATE_CLASS): vol.Coerce(SensorStateClass),
    }
)

PLATFORM_SCHEMA: Final = SENSOR_PLATFORM_SCHEMA.extend(
    {
        vol.Optional(CONF_URL, default=DEFAULT_URL): cv.string,
        vol.Required(CONF_QUERIES): [_QUERY_SCHEMA],
    }
)


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
):
    """Set up the sensor platform."""
    session = async_get_clientsession(hass)
    url = config[CONF_URL]
    prometheus = Prometheus(url, session)

    async_add_entities(
        new_entities=[
            PrometheusSensor(
                prometheus=prometheus,
                expression=query[CONF_EXPR],
                unique_id=query.get(CONF_UNIQUE_ID),
                device_name=query[CONF_NAME],
                device_class=query.get(CONF_DEVICE_CLASS),
                state_class=query.get(CONF_STATE_CLASS),
                unit_of_measurement=query.get(CONF_UNIT_OF_MEASUREMENT),
            )
            for query in config[CONF_QUERIES]
        ],
        update_before_add=True,
    )


class PrometheusSensor(SensorEntity):
    """Sensor entity representing the result of a PromQL expression."""

    def __init__(
        self,
        *,
        prometheus: Prometheus,
        expression: str,
        unique_id: str | None,
        device_name: str,
        device_class: SensorDeviceClass | None,
        state_class: SensorStateClass | None,
        unit_of_measurement: str | None,
    ) -> None:
        """Initialize the sensor."""
        self._prometheus: Prometheus = prometheus
        self._expression = expression

        self._attr_device_class = device_class
        self._attr_name = device_name
        self._attr_native_unit_of_measurement = unit_of_measurement
        self._attr_state_class = state_class
        self._attr_unique_id = unique_id

    async def async_update(self) -> None:
        """Update state by executing query."""
        result: QueryResult = await self._prometheus.query(self._expression)
        self._attr_available = result.error is None
        self._attr_native_value = result.value
