"""Support for displaying Response as Sensor."""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.sensor import (
    CONF_STATE_CLASS,
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_ACTION,
    CONF_DEVICE_CLASS,
    CONF_ICON,
    CONF_NAME,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_VALUE_TEMPLATE,
)
from homeassistant.core import CALLBACK_TYPE, Context, HomeAssistant, callback
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.script import Script
from homeassistant.helpers.template import Template, TemplateError
from homeassistant.util import dt as dt_util

from .const import CONF_FREQUENCY, DOMAIN

_LOGGER = logging.getLogger(__name__)

RESPONSE_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): cv.string,
        vol.Required(CONF_ACTION): cv.SCRIPT_SCHEMA,
        vol.Required(CONF_VALUE_TEMPLATE): cv.template,
        vol.Optional(CONF_ICON): cv.icon,
        vol.Optional(CONF_DEVICE_CLASS): cv.string,
        vol.Optional(CONF_STATE_CLASS): cv.string,
        vol.Optional(CONF_UNIT_OF_MEASUREMENT): cv.string,
        vol.Optional(
            CONF_FREQUENCY, default={"minutes": 5}
        ): cv.positive_time_period_dict,
    }
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Initialize config entry."""
    _LOGGER.debug("options: %s", config_entry.options)
    for key, value in config_entry.options.items():
        _LOGGER.debug("key: %s, value: %s, type: %s", key, value, type(value))
    validated_config: dict[str, Any] = RESPONSE_CONFIG_SCHEMA(
        dict(config_entry.options)
    )

    action = validated_config[CONF_ACTION]
    icon = validated_config.get(CONF_ICON)
    device_class = validated_config.get(CONF_DEVICE_CLASS)
    state_class = validated_config.get(CONF_STATE_CLASS)
    uom = validated_config.get(CONF_UNIT_OF_MEASUREMENT)
    value_template = validated_config.get(CONF_VALUE_TEMPLATE)
    frequency = validated_config.get(CONF_FREQUENCY)

    async_add_entities(
        [
            ResponseSensor(
                hass,
                action,
                icon,
                device_class,
                state_class,
                uom,
                config_entry.title,
                config_entry.entry_id,
                value_template,
                frequency,
            )
        ]
    )


class ResponseSensor(SensorEntity):  # pylint: disable=too-many-instance-attributes
    """Representation of an Attribute as Sensor sensor."""

    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(  # pylint: disable=too-many-arguments
        self,
        hass: HomeAssistant,
        action: str,
        icon: str | None,
        device_class: SensorDeviceClass | None,
        state_class: SensorStateClass | None,
        uom: str | None,
        name: str,
        unique_id: str | None,
        value_template: Template,
        frequency: timedelta,
    ) -> None:
        """Initialize the sensor."""
        self._attr_unique_id = unique_id
        self._command_action = Script(hass, action, name, DOMAIN)
        self._attr_name = name

        self._attr_device_class = device_class
        self._attr_icon = icon
        self._attr_native_unit_of_measurement = uom
        self._attr_state_class = state_class

        self._value_template = value_template
        self._frequency = frequency
        self.unsub: CALLBACK_TYPE | None = None

    def get_next_interval(self, now: datetime) -> datetime:
        """Compute next time an update should occur."""
        return now + self._frequency

    @callback
    async def point_in_time_listener(self, time_date: datetime) -> None:  # pylint: disable=unused-argument
        """Get the latest data and update state."""
        await self._update_state_and_setup_listener()

    async def update_data(self, now: datetime) -> None:  # pylint: disable=unused-argument
        """Get data and render the result."""
        try:
            response = await self._command_action.async_run(context=Context())
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Service error: %s, %s", exc, self._command_action)
            self._attr_available = False
            self.async_write_ha_state()
            return

        if response is None:
            _LOGGER.debug("Response or service response is empty: %s", response)
            self._attr_available = False
            self.async_write_ha_state()
            return

        run_variables = response.variables
        _LOGGER.debug("Response: %s", run_variables)

        try:
            value = self._value_template.async_render(run_variables)
        except TemplateError as exc:
            _LOGGER.error("Error rendering template: %s", exc)
            self._attr_available = False
            self.async_write_ha_state()
            return

        if value in [None, ""] or not isinstance(
            value, (str | int | float | bool | None, datetime)
        ):
            _LOGGER.debug("Not correct value or not a valid type: %s", type(value))
            self._attr_native_value = None
            return

        self._attr_available = True
        self._attr_native_value = value
        self.async_write_ha_state()

    async def _update_state_and_setup_listener(self) -> None:
        """Update state and setup listener for next interval."""
        now = dt_util.now()
        await self.update_data(now)
        self.unsub = async_track_point_in_utc_time(
            self.hass, self.point_in_time_listener, self.get_next_interval(now)
        )

    async def async_added_to_hass(self) -> None:
        """Handle added to Hass."""
        await super().async_added_to_hass()
        await self._update_state_and_setup_listener()

    async def async_will_remove_from_hass(self) -> None:
        """Handle removal from Hass."""
        await super().async_will_remove_from_hass()
        if self.unsub:
            self.unsub()
            self.unsub = None
