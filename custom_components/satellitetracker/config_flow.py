"""Config flow for Satellite Tracker integration."""
from n2yoasync import N2YO, N2YOSatelliteCategory, AuthenticationError
import voluptuous as vol
import aiohttp
import logging

from homeassistant import config_entries
from homeassistant.helpers import config_entry_flow
from homeassistant.helpers import aiohttp_client
from homeassistant.core import callback
from homeassistant.const import (
    CONF_API_KEY, 
    CONF_LATITUDE, 
    CONF_LONGITUDE,
    CONF_SCAN_INTERVAL,
    CONF_ELEVATION,
    CONF_TYPE,
    CONF_RADIUS,
    CONF_NAME,
)

from .const import (
    DOMAIN, 
    CONF_MIN_VISIBILITY, 
    DEFAULT_MIN_VISIBILITY, 
    DEFAULT_POLLING_INTERVAL,
    CONF_SATELLITE,
    CONF_MIN_ALERT,
    DEFAULT_MIN_ALERT,
)

_LOGGER = logging.getLogger(__name__)

class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for N2YO Satellite Tracker."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return OptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        
        if user_input is not None:
            session = aiohttp_client.async_get_clientsession(self.hass)
            key = user_input[CONF_API_KEY]
            api_client = N2YO(apikey=key,session=session)

            try:
                await api_client.get_TLE(id=25544)
            except AuthenticationError:
                errors["base"] = "invalid_auth"
            except aiohttp.ClientError:
                errors["base"] = "cannot_connect"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                self.apikey = key
                self.session = session
                self.sensortype = None
                self.longitude = None
                self.latitude = None
                self.elevation = None
                self.name = None

                return await self.async_step_type()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_API_KEY): str,
                }
            ),
            errors=errors,
        )

    async def async_step_type(self, user_input=None):
        """Select the type of sensor to create."""
        if user_input is not None:
            if user_input[CONF_TYPE] == "location":
                self.sensortype = "location"
                return await self.async_step_location()
            else:
                self.sensortype = "satellite"
                return await self.async_step_satellite()

        return self.async_show_form(
            step_id="type",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_TYPE):vol.In({
                        "location":"Location",
                        "satellite":"Satellite",
                    })
                }
            )
        )
    
    async def async_step_location(self, user_input=None):
        """Enter the appropriate location data."""
        categories = {}

        for name, member in N2YOSatelliteCategory.__members__.items():
            categories[member.value] = name

        if user_input is not None:
            self.name = user_input[CONF_NAME]
            self.latitude = user_input[CONF_LATITUDE]
            self.longitude = user_input[CONF_LONGITUDE]
            self.elevation = user_input[CONF_ELEVATION]
            self.category = user_input["category"]

            user_data = {
                CONF_NAME:self.name,
                CONF_LATITUDE:self.latitude,
                CONF_LONGITUDE:self.longitude,
                CONF_ELEVATION:self.elevation,
                "category":self.category,
                CONF_API_KEY:self.apikey,
                CONF_TYPE:self.sensortype,
            }

            unique_id = f"{self.latitude}_{self.longitude}_{self.elevation}_{self.category}"
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=self.name, data=user_data)


        return self.async_show_form(
            step_id="location",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=self.hass.config.location_name):str,
                    vol.Required("category", default=0):vol.In(categories),
                    vol.Required(
                        CONF_LATITUDE,
                        default=self.hass.config.latitude,
                    ):vol.All(
                        vol.Coerce(float),
                        vol.Range(min=-90,max=90),
                    ),
                    vol.Required(
                        CONF_LONGITUDE,
                        default=self.hass.config.longitude,
                    ):vol.All(
                        vol.Coerce(float),
                        vol.Range(min=-180,max=180),
                    ),
                    vol.Required(
                        CONF_ELEVATION,
                        default=self.hass.config.elevation,
                    ):vol.Coerce(float),
                }
            )
        )

    async def async_step_satellite(self, user_input=None):
        """Enter the appropriate location data."""
        if user_input is not None:
            self.name = user_input[CONF_NAME]
            self.latitude = user_input[CONF_LATITUDE]
            self.longitude = user_input[CONF_LONGITUDE]
            self.elevation = user_input[CONF_ELEVATION]
            self.satellite = user_input[CONF_SATELLITE]

            user_data = {
                CONF_NAME:self.name,
                CONF_LATITUDE:self.latitude,
                CONF_LONGITUDE:self.longitude,
                CONF_ELEVATION:self.elevation,
                CONF_SATELLITE:self.satellite,
                CONF_API_KEY:self.apikey,
                CONF_TYPE:self.sensortype,
            }

            unique_id = f"{self.satellite}_{self.latitude}_{self.longitude}_{self.elevation}"
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title=self.name, data=user_data)

        return self.async_show_form(
            step_id="satellite",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default="International Space Station (ISS)"):str,
                    vol.Required(CONF_SATELLITE, default=25544):int,
                    vol.Required(
                        CONF_LATITUDE,
                        default=self.hass.config.latitude,
                    ):vol.All(
                        vol.Coerce(float),
                        vol.Range(min=-90,max=90),
                    ),
                    vol.Required(
                        CONF_LONGITUDE,
                        default=self.hass.config.longitude,
                    ):vol.All(
                        vol.Coerce(float),
                        vol.Range(min=-180,max=180),
                    ),
                    vol.Required(
                        CONF_ELEVATION,
                        default=self.hass.config.elevation,
                    ):vol.Coerce(float),
                }
            )
        )

class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle satellite tracker client options."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage options."""

        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        if self.config_entry.data[CONF_TYPE] == "location":
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(
                    {
                        vol.Optional(
                            CONF_SCAN_INTERVAL,
                            default=self.config_entry.options.get(
                                CONF_SCAN_INTERVAL, DEFAULT_POLLING_INTERVAL
                            )
                        ):int,
                        vol.Optional(
                            CONF_RADIUS,
                            default=self.config_entry.options.get(
                                CONF_RADIUS, 90
                            )
                        ):int,
                    }
                ),
            )
        else:
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(
                    {
                        vol.Optional(
                            CONF_SCAN_INTERVAL,
                            default=self.config_entry.options.get(
                                CONF_SCAN_INTERVAL, DEFAULT_POLLING_INTERVAL
                            ),
                        ):int,
                        vol.Optional(
                            CONF_MIN_VISIBILITY,
                            default=self.config_entry.options.get(
                                CONF_MIN_VISIBILITY, DEFAULT_MIN_VISIBILITY
                            ),
                        ):int,
                        vol.Optional(
                            CONF_MIN_ALERT,
                            default=self.config_entry.options.get(
                                CONF_MIN_ALERT, DEFAULT_MIN_ALERT
                            ),
                        ):int,
                    }
                ),
            )

