"""Config flow for Fuel Prices."""

import logging
from typing import Any

from pyfuelprices.sources.mapping import FULL_COUNTRY_MAP, COUNTRY_MAP
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import selector, entity_registry as er
from homeassistant.helpers import config_validation as cv
from homeassistant.core import callback
from homeassistant.const import (
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_RADIUS,
    CONF_NAME,
    CONF_TIMEOUT,
    CONF_SCAN_INTERVAL,
)

from pyfuelprices import FuelPrices

from . import FuelPricesConfigEntry
from .const import (
    DOMAIN,
    NAME,
    CONF_AREAS,
    CONF_SOURCES,
    CONF_STATE_VALUE,
    CONF_CHEAPEST_SENSORS,
    CONF_CHEAPEST_SENSORS_COUNT,
    CONF_CHEAPEST_SENSORS_FUEL_TYPE
)

_LOGGER = logging.getLogger(__name__)


def build_sources_list() -> list[selector.SelectOptionDict]:
    """Build source configuration dict."""
    sources = []
    for country, srcs in FULL_COUNTRY_MAP.items():
        for src in srcs:
            label_val = src
            if src not in COUNTRY_MAP.get(country, []):
                label_val = f"{src} (beta)"
            sources.append(selector.SelectOptionDict(
                value=src, label=f"{country}: {label_val}"))
    sources.sort(key=lambda x: x['label'])
    return sources


AREA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): selector.TextSelector(),
        vol.Required(CONF_RADIUS, default=5.0): selector.NumberSelector(
            selector.NumberSelectorConfig(
                mode=selector.NumberSelectorMode.BOX,
                unit_of_measurement="miles",
                min=1,
                max=50,
                step=0.1,
            )
        ),
        vol.Inclusive(
            CONF_LATITUDE, "coordinates", "Latitude and longitude must exist together"
        ): cv.latitude,
        vol.Inclusive(
            CONF_LONGITUDE, "coordinates", "Latitude and longitude must exist together"
        ): cv.longitude
    }
)

SYSTEM_SCHEMA = vol.Schema(
    {
        vol.Optional(
            CONF_SOURCES
        ): selector.SelectSelector(
            selector.SelectSelectorConfig(
                mode=selector.SelectSelectorMode.DROPDOWN,
                options=build_sources_list(),
                multiple=True,
            )
        ),
        vol.Optional(
            CONF_TIMEOUT
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                mode=selector.NumberSelectorMode.BOX,
                min=5,
                max=60,
                unit_of_measurement="s",
            )
        ),
        vol.Optional(
            CONF_SCAN_INTERVAL
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                mode=selector.NumberSelectorMode.BOX,
                min=1,
                max=24,
                unit_of_measurement="h",
            )
        )
    }
)

OPTIONS_AREA_SCHEMA = AREA_SCHEMA.extend(
    {
        vol.Optional(CONF_CHEAPEST_SENSORS, default=False): selector.BooleanSelector(),
        vol.Optional(CONF_CHEAPEST_SENSORS_COUNT, default=5): selector.NumberSelector(
            selector.NumberSelectorConfig(
                mode=selector.NumberSelectorMode.SLIDER,
                min=1,
                max=10,
                step=1
            )
        )
    }
)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow."""

    VERSION = 4
    configured_areas: list[dict] = []
    source_configuration = {}
    configuring_area = {}
    configuring_index = -1
    state_value = "name"
    timeout = None
    interval = None

    @property
    def configured_area_names(self) -> list[str]:
        """Return a list of area names."""
        items = []
        for area in self.configured_areas:
            items.append(area["name"])
        return items

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the intial step."""
        # only one config entry allowed
        # users should use the options flow to adjust areas and sources.
        await self.async_set_unique_id(NAME)
        self._abort_if_unique_id_configured()
        self.configured_areas = []
        self.source_configuration = {}
        self.configuring_area = {}
        self.configuring_index = -1
        self.timeout = 10
        self.interval = 24
        # add the home location as a default (this can optionally be removed).
        self.configured_areas.append(
            {
                CONF_NAME: self.hass.config.location_name,
                CONF_LATITUDE: self.hass.config.latitude,
                CONF_LONGITUDE: self.hass.config.longitude,
                CONF_RADIUS: 10.0,
            }
        )
        return await self.async_step_main_menu()

    async def async_step_main_menu(self, _: None = None):
        """Display configuration menu."""
        return self.async_show_menu(
            step_id="main_menu",
            menu_options={
                "area_menu": "Configure areas to create devices/sensors",
                "sources": "Configure data collector sources",
                "finished": "Complete setup",
            },
        )

    async def async_step_sources(self, user_input: dict[str, Any] | None = None):
        """Set data source config."""
        if user_input is not None:
            if len(user_input.keys()) > 0:
                self.source_configuration = dict.fromkeys(
                    user_input[CONF_SOURCES], {})
                self.timeout = user_input[CONF_TIMEOUT]
                self.interval = user_input[CONF_SCAN_INTERVAL]
            for src in self.source_configuration:
                if FuelPrices.source_requires_config(src) and len(self.source_configuration[src].keys()) == 0:
                    return await self.async_step_source_config(source=src)
                else:
                    self.source_configuration.setdefault(src, {})
            return await self.async_step_main_menu(None)
        return self.async_show_form(
            step_id="sources",
            data_schema=self.add_suggested_values_to_schema(SYSTEM_SCHEMA, {
                CONF_SOURCES: list(self.source_configuration.keys()),
                CONF_TIMEOUT: self.timeout,
                CONF_SCAN_INTERVAL: self.interval
            }))

    async def async_step_source_config(
        self,
        user_input: dict[str, Any] | None = None,
        source: str | None = None
    ):
        """Show the config for a specific data source."""
        if user_input is not None:
            self.source_configuration[self.configuring_source] = user_input
            return await self.async_step_sources({})
        self.configuring_source = source
        return self.async_show_form(
            step_id="source_config",
            data_schema=FuelPrices.get_source_config_schema(source),
            description_placeholders={
                "source": source.capitalize()
            }
        )

    async def async_step_area_menu(self, _: None = None) -> FlowResult:
        """Show the area menu."""
        return self.async_show_menu(
            step_id="area_menu",
            menu_options={
                "area_create": "Define a new area",
                "area_update_select": "Update an area",
                "area_delete": "Delete an area",
                "main_menu": "Return to main menu",
            },
        )

    async def async_step_area_create(self, user_input: dict[str, Any] | None = None):
        """Handle an area configuration."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self.configured_areas.append(
                {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                    CONF_RADIUS: user_input[CONF_RADIUS]
                }
            )
            return await self.async_step_area_menu()
        return self.async_show_form(
            step_id="area_create", data_schema=AREA_SCHEMA, errors=errors
        )

    async def async_step_area_update_select(
        self, user_input: dict[str, Any] | None = None
    ):
        """Show a menu to allow the user to select what option to update."""
        if user_input is not None:
            for i, data in enumerate(self.configured_areas):
                if self.configured_areas[i]["name"] == user_input[CONF_NAME]:
                    self.configuring_area = data
                    self.configuring_index = i
                    break
            return await self.async_step_area_update()
        if len(self.configured_areas) > 0:
            return self.async_show_form(
                step_id="area_update_select",
                data_schema=vol.Schema(
                    {
                        vol.Required(CONF_NAME): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                mode=selector.SelectSelectorMode.LIST,
                                options=self.configured_area_names,
                            )
                        )
                    }
                ),
            )
        return await self.async_step_area_menu()

    async def async_step_area_update(self, user_input: dict[str, Any] | None = None):
        """Handle an area update."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self.configured_areas.pop(self.configuring_index)
            self.configured_areas.append(
                {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                    CONF_RADIUS: user_input[CONF_RADIUS]
                }
            )
            return await self.async_step_area_menu()
        return self.async_show_form(
            step_id="area_update",
            data_schema=self.add_suggested_values_to_schema(
                AREA_SCHEMA, self.configuring_area),
            errors=errors,
        )

    async def async_step_area_delete(self, user_input: dict[str, Any] | None = None):
        """Delete a configured area."""
        if user_input is not None:
            for i, data in enumerate(self.configured_areas):
                if data["name"] == user_input[CONF_NAME]:
                    self.configured_areas.pop(i)
                    break
            return await self.async_step_area_menu()
        if len(self.configured_areas) > 0:
            return self.async_show_form(
                step_id="area_delete",
                data_schema=vol.Schema(
                    {
                        vol.Required(CONF_NAME): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                mode=selector.SelectSelectorMode.LIST,
                                options=self.configured_area_names,
                            )
                        )
                    }
                ),
            )
        return await self.async_step_area_menu()

    async def async_step_finished(self, user_input: dict[str, Any] | None = None):
        """Save configuration."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if len(self.source_configuration.keys()) > 0:
                user_input[CONF_SOURCES] = self.source_configuration
            elif self.hass.config.country is not None:
                user_input[CONF_SOURCES] = dict.fromkeys(COUNTRY_MAP.get(
                    self.hass.config.country), {})
            else:
                user_input[CONF_SOURCES] = dict.fromkeys([
                    k.value for k in build_sources_list()], {})
            user_input[CONF_AREAS] = self.configured_areas
            user_input[CONF_SCAN_INTERVAL] = self.interval
            user_input[CONF_TIMEOUT] = self.timeout
            user_input[CONF_STATE_VALUE] = self.state_value
            return self.async_create_entry(title=NAME, data=user_input)
        return self.async_show_form(step_id="finished", errors=errors, last_step=True)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: FuelPricesConfigEntry) -> "FuelPricesOptionsFlow":
        """Return option flow."""
        return FuelPricesOptionsFlow(config_entry)


class FuelPricesOptionsFlow(config_entries.OptionsFlowWithConfigEntry):
    """OptionsFlow for fuel_prices module."""

    global_config = {}
    configured_areas: list[dict] = []
    source_configuration = {}
    configuring_area = {}
    configuring_index = -1
    configuring_source = ""
    timeout = 10
    interval = 24
    state_value = "name"
    config_entry: FuelPricesConfigEntry

    @property
    def configured_area_names(self) -> list[str]:
        """Return a list of area names."""
        items = []
        for area in self.configured_areas:
            items.append(area["name"])
        return items

    async def _async_create_entry(self) -> config_entries.FlowResult:
        """Create an entry."""
        return self.async_create_entry(
            title=self.config_entry.title,
            data={
                CONF_AREAS: self.configured_areas,
                CONF_SOURCES: self.source_configuration,
                CONF_SCAN_INTERVAL: self.interval,
                CONF_TIMEOUT: self.timeout,
                CONF_STATE_VALUE: self.state_value
            }
        )

    def build_available_fuels_list(self) -> list:
        """Build a list of available fuels according to data within entity registry."""
        fuel_types = []
        entities = er.async_entries_for_config_entry(
            er.async_get(self.hass), self.config_entry.entry_id)
        for entity in entities:
            state = self.hass.states.get(entity.entity_id).attributes
            for k in state.get("available_fuels", {}):
                if k not in fuel_types:
                    fuel_types.append(k)
        return fuel_types

    def build_compatible_sensor_states(self) -> list:
        """Build a list of compatible sensor states for use in select controls."""
        states = ["name"]
        states.extend(self.build_available_fuels_list())
        return states

    async def async_step_init(self, _: None = None):
        """User init option flow."""
        self.configured_areas = self.config_entry.options.get(
            CONF_AREAS, self.config_entry.data.get(CONF_AREAS, [])
        )
        self.source_configuration = self.config_entry.options.get(
            CONF_SOURCES, self.config_entry.data.get(CONF_SOURCES, {})
        )
        self.timeout = self.config_entry.options.get(
            CONF_TIMEOUT, self.config_entry.data.get(CONF_TIMEOUT, 10)
        )
        self.interval = self.config_entry.options.get(
            CONF_SCAN_INTERVAL, self.config_entry.data.get(
                CONF_SCAN_INTERVAL, 24)
        )
        self.state_value = self.config_entry.options.get(
            CONF_STATE_VALUE, self.config_entry.data.get(
                CONF_STATE_VALUE, "name")
        )
        return await self.async_step_main_menu()

    async def async_step_main_menu(self, _: None = None):
        """Display configuration menu."""
        return self.async_show_menu(
            step_id="main_menu",
            menu_options={
                "area_menu": "Configure areas to create devices/sensors",
                "sources": "Configure data collector sources",
                "finished": "Complete re-configuration",
            },
        )

    async def async_step_sources(self, user_input: dict[str, Any] | None = None):
        """Set data source config."""
        if user_input is not None:
            if len(user_input.keys()) > 0:
                self.source_configuration = dict.fromkeys(
                    user_input[CONF_SOURCES], {})
                self.timeout = user_input[CONF_TIMEOUT]
                self.interval = user_input[CONF_SCAN_INTERVAL]
                self.state_value = user_input[CONF_STATE_VALUE]
            for src in self.source_configuration:
                if FuelPrices.source_requires_config(src) and len(self.source_configuration[src].keys()) == 0:
                    return await self.async_step_source_config(source=src)
                else:
                    self.source_configuration.setdefault(src, {})
            return await self.async_step_main_menu(None)
        return self.async_show_form(
            step_id="sources",
            data_schema=self.add_suggested_values_to_schema(
                SYSTEM_SCHEMA.extend({
                    vol.Required(
                        CONF_STATE_VALUE
                    ): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=self.build_compatible_sensor_states(),
                            multiple=False,
                            custom_value=True,
                            mode=selector.SelectSelectorMode.DROPDOWN,
                            sort=True
                        )
                    )
                }), {
                    CONF_SOURCES: list(self.source_configuration.keys()),
                    CONF_TIMEOUT: self.timeout,
                    CONF_SCAN_INTERVAL: self.interval,
                    CONF_STATE_VALUE: self.state_value
                }))

    async def async_step_source_config(
        self,
        user_input: dict[str, Any] | None = None,
        source: str | None = None
    ):
        """Show the config for a specific data source."""
        if user_input is not None:
            self.source_configuration[self.configuring_source] = user_input
            return await self.async_step_sources({})
        self.configuring_source = source
        return self.async_show_form(
            step_id="source_config",
            data_schema=FuelPrices.get_source_config_schema(source),
            description_placeholders={
                "source": source.capitalize()
            }
        )

    async def async_step_area_menu(self, _: None = None) -> FlowResult:
        """Show the area menu."""
        return self.async_show_menu(
            step_id="area_menu",
            menu_options={
                "area_create": "Define a new area",
                "area_update_select": "Update an area",
                "area_delete": "Delete an area",
                "main_menu": "Return to main menu",
            },
        )

    async def async_step_area_create(self, user_input: dict[str, Any] | None = None):
        """Handle an area configuration."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self.configured_areas.append(
                {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                    CONF_RADIUS: user_input[CONF_RADIUS],
                    CONF_CHEAPEST_SENSORS: user_input.get(CONF_CHEAPEST_SENSORS, False),
                    CONF_CHEAPEST_SENSORS_COUNT: user_input.get(CONF_CHEAPEST_SENSORS_COUNT, 5),
                    CONF_CHEAPEST_SENSORS_FUEL_TYPE: user_input.get(
                        CONF_CHEAPEST_SENSORS_FUEL_TYPE, None)
                }
            )
            return await self.async_step_area_menu()
        return self.async_show_form(
            step_id="area_create", data_schema=OPTIONS_AREA_SCHEMA.extend(
                {
                    vol.Optional(
                        CONF_CHEAPEST_SENSORS_FUEL_TYPE
                    ): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=self.build_available_fuels_list(),
                            multiple=False,
                            custom_value=False,
                            mode=selector.SelectSelectorMode.DROPDOWN,
                            sort=True
                        )
                    )
                }
            ), errors=errors
        )

    async def async_step_area_update_select(
        self, user_input: dict[str, Any] | None = None
    ):
        """Show a menu to allow the user to select what option to update."""
        if user_input is not None:
            for i, data in enumerate(self.configured_areas):
                if self.configured_areas[i]["name"] == user_input[CONF_NAME]:
                    self.configuring_area = data
                    self.configuring_index = i
                    break
            return await self.async_step_area_update()
        if len(self.configured_areas) > 0:
            return self.async_show_form(
                step_id="area_update_select",
                data_schema=vol.Schema(
                    {
                        vol.Required(CONF_NAME): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                mode=selector.SelectSelectorMode.LIST,
                                options=self.configured_area_names,
                            )
                        )
                    }
                ),
            )
        return await self.async_step_area_menu()

    async def async_step_area_update(self, user_input: dict[str, Any] | None = None):
        """Handle an area update."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self.configured_areas.pop(self.configuring_index)
            self.configured_areas.append(
                {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_LATITUDE: user_input[CONF_LATITUDE],
                    CONF_LONGITUDE: user_input[CONF_LONGITUDE],
                    CONF_RADIUS: user_input[CONF_RADIUS],
                    CONF_CHEAPEST_SENSORS: user_input.get(CONF_CHEAPEST_SENSORS, False),
                    CONF_CHEAPEST_SENSORS_COUNT: user_input.get(CONF_CHEAPEST_SENSORS_COUNT, 5),
                    CONF_CHEAPEST_SENSORS_FUEL_TYPE: user_input.get(
                        CONF_CHEAPEST_SENSORS_FUEL_TYPE, None)
                }
            )
            return await self.async_step_area_menu()
        return self.async_show_form(
            step_id="area_update",
            data_schema=self.add_suggested_values_to_schema(
                OPTIONS_AREA_SCHEMA.extend(
                    {
                        vol.Optional(
                            CONF_CHEAPEST_SENSORS_FUEL_TYPE
                        ): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                options=self.build_available_fuels_list(),
                                multiple=False,
                                custom_value=False,
                                mode=selector.SelectSelectorMode.DROPDOWN,
                                sort=True
                            )
                        )
                    }
                ), self.configuring_area),
            errors=errors,
        )

    async def async_step_area_delete(self, user_input: dict[str, Any] | None = None):
        """Delete a configured area."""
        if user_input is not None:
            for i, data in enumerate(self.configured_areas):
                if data["name"] == user_input[CONF_NAME]:
                    self.configured_areas.pop(i)
                    break
            return await self.async_step_area_menu()
        if len(self.configured_areas) > 0:
            return self.async_show_form(
                step_id="area_delete",
                data_schema=vol.Schema(
                    {
                        vol.Required(CONF_NAME): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                mode=selector.SelectSelectorMode.LIST,
                                options=self.configured_area_names,
                            )
                        )
                    }
                ),
            )
        return await self.async_step_area_menu()

    async def async_step_finished(self, user_input: dict[str, Any] | None = None):
        """Save configuration."""
        errors: dict[str, str] = {}
        if user_input is not None:
            if len(self.source_configuration.keys()) > 0:
                user_input[CONF_SOURCES] = self.source_configuration
            elif self.hass.config.country is not None:
                user_input[CONF_SOURCES] = dict.fromkeys(COUNTRY_MAP.get(
                    self.hass.config.country), {})
            else:
                user_input[CONF_SOURCES] = dict.fromkeys([
                    k.value for k in build_sources_list()], {})
            user_input[CONF_AREAS] = self.configured_areas
            user_input[CONF_SCAN_INTERVAL] = self.interval
            user_input[CONF_TIMEOUT] = self.timeout
            user_input[CONF_STATE_VALUE] = self.state_value
            self.options.update(user_input)
            return self.async_create_entry(title=NAME, data=self.options)
        return self.async_show_form(step_id="finished", errors=errors, last_step=True)


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""
