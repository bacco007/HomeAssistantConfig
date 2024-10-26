"""Config flow for Response as Sensor integration."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast

import voluptuous as vol

from homeassistant.components.sensor import (
    CONF_STATE_CLASS,
    CONF_UNIT_OF_MEASUREMENT,
    DEVICE_CLASSES,
    STATE_CLASSES,
)
from homeassistant.const import (
    CONF_ACTION,
    CONF_DEVICE_CLASS,
    CONF_ICON,
    CONF_NAME,
    CONF_VALUE_TEMPLATE,
    UnitOfTemperature,
)
from homeassistant.helpers import selector
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaConfigFlowHandler,
    SchemaFlowFormStep,
    SchemaFlowMenuStep,
)

from .const import CONF_FREQUENCY, DOMAIN

CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): selector.TextSelector(),
        vol.Required(CONF_ACTION): selector.ActionSelector(),
    }
)

OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_VALUE_TEMPLATE): selector.TemplateSelector(),
        vol.Optional(CONF_ICON): selector.IconSelector(),
        vol.Optional(CONF_DEVICE_CLASS): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=DEVICE_CLASSES,
                mode=selector.SelectSelectorMode.DROPDOWN,
                translation_key="sensor_device_class",
            )
        ),
        vol.Optional(CONF_STATE_CLASS): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=STATE_CLASSES,
                mode=selector.SelectSelectorMode.DROPDOWN,
                translation_key="sensor_state_class",
            )
        ),
        vol.Optional(CONF_UNIT_OF_MEASUREMENT): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=[UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT],
                custom_value=True,
            )
        ),
        vol.Optional(CONF_FREQUENCY): selector.DurationSelector(
            selector.DurationSelectorConfig(
                enable_day=False, enable_millisecond=False, allow_negative=False
            )
        ),
    }
)


CONFIG_FLOW: dict[str, SchemaFlowFormStep | SchemaFlowMenuStep] = {
    "user": SchemaFlowFormStep(CONFIG_SCHEMA.extend(OPTIONS_SCHEMA.schema)),
}
OPTIONS_FLOW: dict[str, SchemaFlowFormStep | SchemaFlowMenuStep] = {
    "init": SchemaFlowFormStep(OPTIONS_SCHEMA)
}


class ConfigFlowHandler(SchemaConfigFlowHandler, domain=DOMAIN):
    """Handle a config or options flow for Response as sensor."""

    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW

    def async_config_entry_title(self, options: Mapping[str, Any]) -> str:
        """Return config entry title."""
        return cast(str, options["name"]) if "name" in options else ""
