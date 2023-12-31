"""ConfigFlow for GTFS integration."""
from __future__ import annotations

import logging

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .const import (
    DEFAULT_PATH, 
    DOMAIN, 
    DEFAULT_REFRESH_INTERVAL, 
    DEFAULT_LOCAL_STOP_REFRESH_INTERVAL,
    DEFAULT_LOCAL_STOP_TIMERANGE,
    DEFAULT_LOCAL_STOP_RADIUS,
    DEFAULT_OFFSET,
    CONF_API_KEY, 
    CONF_X_API_KEY, 
    CONF_VEHICLE_POSITION_URL, 
    CONF_TRIP_UPDATE_URL,
    CONF_ALERTS_URL
)    

from .gtfs_helper import (
    get_gtfs,
    get_next_departure,
    get_route_list,
    get_stop_list,
    get_datasources,
    remove_datasource,
    check_datasource_index,
    get_agency_list,
)

_LOGGER = logging.getLogger(__name__)
STEP_SOURCE = vol.Schema(
    {
        vol.Required("file"): str,
        vol.Required("url", default="na"): str,
    }
)


@config_entries.HANDLERS.register(DOMAIN)
class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for GTFS."""

    VERSION = 7

    def __init__(self) -> None:
        """Init ConfigFlow."""
        self._pygtfs = ""
        self._data: dict[str, str] = {}
        self._user_inputs: dict = {}

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        """Handle the source."""
        errors: dict[str, str] = {}
        
        return self.async_show_menu(
            step_id="user",
            menu_options=["start_end", "local_stops", "source","remove"],
            description_placeholders={
                "model": "Example model",
            }
        )
                   
    async def async_step_start_end(self, user_input: dict | None = None) -> FlowResult:
        """Handle the source."""
        errors: dict[str, str] = {}      
        if user_input is None:
            datasources = get_datasources(self.hass, DEFAULT_PATH)
            return self.async_show_form(
                step_id="start_end",
                data_schema=vol.Schema(
                    {
                        vol.Required("file", default=""): vol.In(datasources),
                    },
                ),
            )

        user_input["url"] = "na"
        user_input["extract_from"] = "zip"
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Start End: {self._user_inputs}")
        return await self.async_step_agency()            
            
    async def async_step_local_stops(self, user_input: dict | None = None) -> FlowResult:
        """Handle the source."""
        errors: dict[str, str] = {}       
        if user_input is None:
            datasources = get_datasources(self.hass, DEFAULT_PATH)
            return self.async_show_form(
                step_id="local_stops",
                data_schema=vol.Schema(
                    {
                        vol.Required("file", default=""): vol.In(datasources),
                        vol.Required("device_tracker_id"): selector.EntitySelector(
                            selector.EntitySelectorConfig(domain=["person","zone"]),                          
                        ),
                        vol.Required("name"): str, 
                    },
                ),
            ) 
        user_input["url"] = "na"
        user_input["extract_from"] = "zip"            
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Local Stops: {self._user_inputs}")
        return self.async_create_entry(
            title=user_input["name"], data=self._user_inputs
            )                
                   
    async def async_step_source(self, user_input: dict | None = None) -> FlowResult:
        """Handle a flow initialized by the user."""
        errors: dict[str, str] = {}
        if user_input is None:
            return self.async_show_form(
                step_id="source",
                data_schema=vol.Schema(
                    {
                        vol.Required("extract_from"): selector.SelectSelector(selector.SelectSelectorConfig(options=["url", "zip"], translation_key="extract_from")),
                        vol.Required("file"): str,
                        vol.Required("url", default="na"): str,
                    },
                ),
                errors=errors,
            )    
        check_data = await self._check_data(user_input)
        _LOGGER.debug("Source check data: %s", check_data)
        if check_data :
            errors["base"] = check_data
            return self.async_abort(reason=check_data)
        else:
            self._user_inputs.update(user_input)
            _LOGGER.debug(f"UserInputs Source: {self._user_inputs}")
            return await self.async_step_agency()            

    async def async_step_remove(self, user_input: dict | None = None) -> FlowResult:
        """Handle a flow initialized by the user."""
        errors: dict[str, str] = {}
        if user_input is None:
            datasources = get_datasources(self.hass, DEFAULT_PATH)
            return self.async_show_form(
                step_id="remove",
                data_schema=vol.Schema(
                    {
                        vol.Required("file", default=""): vol.In(datasources),
                    },
                ),
                errors=errors,
            )
        try:
            removed = remove_datasource(self.hass, DEFAULT_PATH, user_input["file"])
            _LOGGER.debug(f"Removed gtfs data source: {removed}")
        except Exception as ex:
            _LOGGER.error("Error while deleting : %s", {ex})
            return "generic_failure"
        return self.async_abort(reason="files_deleted")
        
    async def async_step_agency(self, user_input: dict | None = None) -> FlowResult:
        """Handle the agency."""
        errors: dict[str, str] = {}
        self._pygtfs = get_gtfs(
            self.hass,
            DEFAULT_PATH,
            self._user_inputs,
            False,
        )
        check_data = await self._check_data(self._user_inputs)
        _LOGGER.debug("Agency check data: %s", check_data)
        if check_data :
            errors["base"] = check_data
            return self.async_abort(reason=check_data)
        agencies = get_agency_list(self._pygtfs, self._user_inputs)
        if len(agencies) > 1:
            agencies[:0] = ["0: ALL"]
            errors: dict[str, str] = {}
            if user_input is None:
                return self.async_show_form(
                    step_id="agency",
                    data_schema=vol.Schema(
                        {
                            vol.Required("agency"): vol.In(agencies),
                        },
                    ),
                    errors=errors,
                ) 
        else:
            user_input = {}
            user_input["agency"] = "0: ALL"
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Agency: {self._user_inputs}")
        return await self.async_step_route_type()          
        
    async def async_step_route_type(self, user_input: dict | None = None) -> FlowResult:
        """Handle the route_type."""
        errors: dict[str, str] = {}
        if user_input is None:
            return self.async_show_form(
                step_id="route_type",
                data_schema=vol.Schema(
                    {
                        vol.Required("route_type"): selector.SelectSelector(selector.SelectSelectorConfig(options=["99", "2"], translation_key="route_type")),
                    },
                ),
                errors=errors,
            )                
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Route Type: {self._user_inputs}")
        if user_input["route_type"] == "2":
            return await self.async_step_stops_train()
        else:
            return await self.async_step_route()          

    async def async_step_route(self, user_input: dict | None = None) -> FlowResult:
        """Handle the route."""
        errors: dict[str, str] = {}
        check_data = await self._check_data(self._user_inputs)
        _LOGGER.debug("Source check data: %s", check_data)
        if check_data :
            errors["base"] = check_data
            return self.async_abort(reason=check_data)
        self._pygtfs = get_gtfs(
            self.hass,
            DEFAULT_PATH,
            self._user_inputs,
            False,
        )

        if user_input is None:
            return self.async_show_form(
                step_id="route",
                data_schema=vol.Schema(
                    {
                        vol.Required("route"): vol.In(get_route_list(self._pygtfs, self._user_inputs)),
                        vol.Required("direction"): selector.SelectSelector(selector.SelectSelectorConfig(options=["0", "1"], translation_key="direction")),
                    },
                ),
                errors=errors,
            )
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Route: {self._user_inputs}")
        return await self.async_step_stops()

    async def async_step_stops(self, user_input: dict | None = None) -> FlowResult:
        """Handle the route step."""
        errors: dict[str, str] = {}
        _LOGGER.debug(
            f"UserInputs RouteID: {self._user_inputs['route'].split(': ')[0]}"
        )
        if user_input is None:
            stops = get_stop_list(
                self._pygtfs,
                self._user_inputs["route"].split(": ")[0],
                self._user_inputs["direction"],
            )
            last_stop = stops[-1:][0]
            return self.async_show_form(
                step_id="stops",
                data_schema=vol.Schema(
                    {
                        vol.Required("origin"): vol.In(stops),
                        vol.Required("destination", default=last_stop): vol.In(stops),
                        vol.Required("name"): str,
                        vol.Optional("include_tomorrow", default = False): selector.BooleanSelector(),
                    },
                ),
                errors=errors,
            )
        self._user_inputs.update(user_input)
        _LOGGER.debug(f"UserInputs Stops: {self._user_inputs}")
        check_config = await self._check_config(self._user_inputs)
        if check_config:
            _LOGGER.debug(f"CheckConfig: {check_config}")
            errors["base"] = check_config
            return self.async_abort(reason=check_config)
        else:
            return self.async_create_entry(
                title=user_input["name"], data=self._user_inputs
            )
            
    async def async_step_stops_train(self, user_input: dict | None = None) -> FlowResult:
        """Handle the stops when train, as often impossible to select ID"""
        errors: dict[str, str] = {}
        _LOGGER.debug(
            f"UserInputs Route Type: {self._user_inputs['route_type']}"
        )
        if user_input is None:
            return self.async_show_form(
                step_id="stops_train",
                data_schema=vol.Schema(
                    {
                        vol.Required("origin"): str,
                        vol.Required("destination"): str,
                        vol.Required("name"): str,
                        vol.Optional("include_tomorrow", default = False): selector.BooleanSelector(),
                    },
                ),
                errors=errors,
            )
        self._user_inputs.update(user_input)
        self._user_inputs["direction"] = 0
        self._user_inputs["route"] = "train"
        _LOGGER.debug(f"UserInputs Stops Train: {self._user_inputs}")
        check_config = await self._check_config(self._user_inputs)
        if check_config:
            _LOGGER.debug(f"CheckConfig: {check_config}")
            errors["base"] = check_config
            return self.async_abort(reason=check_config)
        else:
            return self.async_create_entry(
                title=user_input["name"], data=self._user_inputs
            )            

    async def _check_data(self, data):
        self._pygtfs = await self.hass.async_add_executor_job(
            get_gtfs, self.hass, DEFAULT_PATH, data, False
        )
        _LOGGER.debug("Checkdata pygtfs: %s with data: %s", self._pygtfs, data)
        if self._pygtfs in ['no_data_file', 'no_zip_file', 'extracting'] :
            return self._pygtfs
        check_index = await self.hass.async_add_executor_job(
                    check_datasource_index, self.hass, self._pygtfs, DEFAULT_PATH, data["file"]
                )            
        return None

    async def _check_config(self, data):
        self._pygtfs = await self.hass.async_add_executor_job(
            get_gtfs, self.hass, DEFAULT_PATH, data, False
        )
        if self._pygtfs == "no_data_file":
            return "no_data_file"
        self._data = {
            "schedule": self._pygtfs,
            "origin": data["origin"],
            "destination": data["destination"],
            "offset": 0,
            "include_tomorrow": True,
            "gtfs_dir": DEFAULT_PATH,
            "name": data["name"],
            "next_departure": None,
            "file": data["file"],
            "route_type": data["route_type"]
        }
        # check and/or add indexes
        check_index = await self.hass.async_add_executor_job(
                    check_datasource_index, self.hass, self._pygtfs, DEFAULT_PATH, data["file"]
                )
        try:
            self._data["next_departure"] = await self.hass.async_add_executor_job(
                get_next_departure, self
            )
        except Exception as ex:  # pylint: disable=broad-except
            _LOGGER.error(
                "Config: error getting gtfs data from generic helper: %s",
                {ex},
                exc_info=1,
            )
            return "generic_failure"
        if self._data["next_departure"]:
            return None
        return "stop_incorrect"

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""
        return GTFSOptionsFlowHandler(config_entry)


class GTFSOptionsFlowHandler(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry
        self._data: dict[str, str] = {}
        self._user_inputs: dict = {}

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            if user_input.get('real_time',None):
                self._user_inputs.update(user_input)
                return await self.async_step_real_time()    
            else: 
                self._user_inputs.update(user_input)
                _LOGGER.debug(f"GTFS Options without realtime: {self._user_inputs}")
                return self.async_create_entry(title="", data=self._user_inputs)
        
        if self.config_entry.data.get("device_tracker_id", None):
            opt1_schema = {
                    vol.Optional("local_stop_refresh_interval", default=self.config_entry.options.get("refresh_interval", DEFAULT_LOCAL_STOP_REFRESH_INTERVAL)): int,
                    vol.Optional("radius", default=self.config_entry.options.get("radius", DEFAULT_LOCAL_STOP_RADIUS)): vol.All(vol.Coerce(int), vol.Range(min=50, max=500)),
                    vol.Optional("timerange", default=self.config_entry.options.get("timerange", DEFAULT_LOCAL_STOP_TIMERANGE)): vol.All(vol.Coerce(int), vol.Range(min=15, max=60)),
                }
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(opt1_schema)
            )                
        
        else:
            opt1_schema = {
                        vol.Optional("refresh_interval", default=self.config_entry.options.get("refresh_interval", DEFAULT_REFRESH_INTERVAL)): int,
                        vol.Optional("offset", default=self.config_entry.options.get("offset", DEFAULT_OFFSET)): int,
                        vol.Optional("real_time", default=self.config_entry.options.get("real_time")): selector.BooleanSelector()
                    }
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(opt1_schema)
            )
        
    async def async_step_real_time(
           self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle a realtime initialized by the user."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._user_inputs.update(user_input)
            _LOGGER.debug(f"GTFS Options with realtime: {self._user_inputs}")
            return self.async_create_entry(title="", data=self._user_inputs)

        return self.async_show_form(
            step_id="real_time",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_TRIP_UPDATE_URL, default=self.config_entry.options.get(CONF_TRIP_UPDATE_URL)): str,
                    vol.Optional(CONF_VEHICLE_POSITION_URL, default=self.config_entry.options.get(CONF_VEHICLE_POSITION_URL,"")): str,
                    vol.Optional(CONF_ALERTS_URL, default=self.config_entry.options.get(CONF_ALERTS_URL,"")): str,
                    vol.Optional(CONF_API_KEY, default=self.config_entry.options.get(CONF_API_KEY, "na")): str,
                    vol.Optional(CONF_X_API_KEY,default=self.config_entry.options.get(CONF_X_API_KEY, "na")): str
                },
            ),
            errors=errors,
        )  